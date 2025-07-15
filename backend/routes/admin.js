const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { User, Transaction } = require("../models");
const { verifyTokenAndRole } = require("../middleware/auth");

// ✅ Get current admin user info
router.get(
  "/me",
  verifyTokenAndRole(["creator", "superadmin", "admin", "master"]),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ["id", "username", "role", "points"]
      });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch current user info" });
    }
  }
);

// ✅ Get all downline users
router.get(
  "/downline-users",
  verifyTokenAndRole(["creator", "superadmin", "admin", "master"]),
  async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const downlineUsers = await User.findAll({
        where: { uplinkId: currentUserId },
        attributes: ["id", "username", "role", "points", "creditLimit", "isp", "deviceId", "ip", "status", "createdAt"]
      });// Step 2: For each user, fetch their own downline
      const usersWithChildren = await Promise.all(
        downlineUsers.map(async (user) => {
          const subUsers = await User.findAll({
            where: { uplinkId: user.id },
            attributes: ["id", "username", "role", "points", "creditLimit", "isp", "deviceId", "ip", "status", "createdAt"]
          });
          return {
            ...user.toJSON(),
            children: subUsers
          };
        })
      );

      res.json(usersWithChildren);

      // res.json(downlineUsers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch downline users" });
    }
  }
);

// ✅ Create new user (downlink)
router.post(
  "/create",
  verifyTokenAndRole(["creator", "superadmin", "admin", "master"]),
  async (req, res) => {
    const { username, password, role } = req.body;
    const uplinkId = req.user.id;
    const currentRole = req.user.role;

    

    const allowedRoles = {
      creator: ["superadmin", "admin", "master", "user"],
      superadmin: ["admin"],
      admin: ["master"],
      master: ["user"]
    };

    if (!allowedRoles[currentRole]?.includes(role)) {
      return res.status(403).json({ error: `❌ ${currentRole} cannot create a ${role}` });
    }

    try {
      const existing = await User.findOne({ where: { username } });
      if (existing) return res.status(400).json({ error: "Username taken" });

      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        password: hashed,
        role,
        uplinkId
      });

      res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        uplinkId: user.uplinkId
      });
    } catch (err) {
      console.error("❌ Registration failed:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

// 🔒 Reset Password
router.post("/reset-password", verifyTokenAndRole(["creator", "superadmin", "admin", "master"]), async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user || user.uplinkId !== req.user.id) return res.status(403).json({ error: "Access denied" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Password reset failed" });
  }
});
//active user 
router.post("/activate-user", verifyTokenAndRole(["creator", "superadmin", "admin", "master"]), async (req, res) => {
  const { userId } = req.body;
  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  await user.update({ status: "active" });
  res.json({ message: "✅ User reactivated" });
});

// 🚫 Block User
router.post("/block-user", verifyTokenAndRole(["creator", "superadmin", "admin", "master"]), async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user || user.uplinkId !== req.user.id) return res.status(403).json({ error: "Access denied" });

    user.status = "blocked";
    await user.save();

    res.json({ message: "User blocked" });
  } catch (err) {
    console.error("Block user error:", err);
    res.status(500).json({ error: "Block failed" });
  }
});

// ⏸ Suspend User
router.post("/suspend-user", verifyTokenAndRole(["creator", "superadmin", "admin", "master"]), async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user || user.uplinkId !== req.user.id) return res.status(403).json({ error: "Access denied" });

    user.status = "suspended";
    await user.save();

    res.json({ message: "User suspended" });
  } catch (err) {
    console.error("Suspend user error:", err);
    res.status(500).json({ error: "Suspend failed" });
  }
});

// ➕ Refill Points (to downline)
router.post("/refill-points", verifyTokenAndRole(["creator", "superadmin", "admin", "master"]), async (req, res) => {
  const { userId, amount, note } = req.body;
  try {
    const sender = await User.findByPk(req.user.id);
    const target = await User.findByPk(userId);
    if (!target || target.uplinkId !== sender.id) return res.status(403).json({ error: "Not your downline user" });

    if (sender.points < amount) return res.status(400).json({ error: "Insufficient balance" });

    sender.points -= amount;
    target.points += amount;

    await sender.save();
    await target.save();

    // ✅ Log transaction
    await require("../models").Transaction.create({
      userId: target.id,
      uplinkId: sender.id,
      type: "refill",
      amount,
      status: "approved",
      note,
      requestedAt: new Date(),
      resolvedAt: new Date(),
    });

    res.json({ message: `✅ Refilled ${amount} points to ${target.username}` });
  } catch (err) {
    console.error("Refill error:", err);
    res.status(500).json({ error: "Refill failed" });
  }
});

// ➖ Withdraw Points (from downline)
router.post("/withdraw-points", verifyTokenAndRole(["creator", "superadmin", "admin", "master"]), async (req, res) => {
  const { userId, amount, note } = req.body;
  try {
    const sender = await User.findByPk(req.user.id);
    const target = await User.findByPk(userId);
    if (!target || target.uplinkId !== sender.id) return res.status(403).json({ error: "Not your downline user" });

    if (target.points < amount) return res.status(400).json({ error: "User has insufficient points" });

    target.points -= amount;
    sender.points += amount;

    await sender.save();
    await target.save();

    // ✅ Log transaction
    await require("../models").Transaction.create({
      userId: target.id,
      uplinkId: sender.id,
      type: "withdraw",
      amount,
      status: "approved",
      note,
      requestedAt: new Date(),
      resolvedAt: new Date(),
    });

    res.json({ message: `✅ Withdrew ${amount} points from ${target.username}` });
  } catch (err) {
    console.error("Withdraw error:", err);
    res.status(500).json({ error: "Withdraw failed" });
  }
});

// 🎯 Creator can generate points
router.post("/generate-points", verifyTokenAndRole(["creator"]), async (req, res) => {
  const { amount } = req.body;
  try {
    const creator = await User.findByPk(req.user.id);
    creator.points += amount;
    await creator.save();
    res.json({ message: `✅ Generated ${amount} points`, balance: creator.points });
  } catch (err) {
    console.error("Point generation error:", err);
    res.status(500).json({ error: "Point generation failed" });
  }
});

//bulk transaction endpoint
router.post("/bulk-transact", verifyTokenAndRole(["creator", "superadmin", "admin", "master"]), async (req, res) => {
  const { transactions, password } = req.body;
  const sender = await User.findByPk(req.user.id);

  // ✅ Password check
  const isMatch = await bcrypt.compare(password, sender.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid password" });

  let successCount = 0;

  try {
    for (const tx of transactions) {
      const { userId, amount, type, note } = tx;
      const amt = parseInt(amount);

      if (!userId || !amt || amt <= 0 || !["refill", "withdraw"].includes(type)) continue;

      const target = await User.findByPk(userId);
      if (!target || target.uplinkId !== sender.id) continue;

      if (type === "refill") {
        if (sender.points < amt) continue;

        sender.points -= amt;
        target.points += amt;
      } else if (type === "withdraw") {
        if (target.points < amt) continue;

        target.points -= amt;
        sender.points += amt;
      }

      await target.save();

      await Transaction.create({
        userId: target.id,
        uplinkId: sender.id,
        type,
        amount: amt,
        status: "approved",
        requestedAt: new Date(),
        resolvedAt: new Date(),
        note,
      });

      successCount++;
    }

    await sender.save();

    if (successCount === 0) {
      return res.status(400).json({ error: "No transactions were valid or processed." });
    }

    res.json({ message: `✅ ${successCount} transactions processed` });
  } catch (err) {
    console.error("❌ Bulk transaction error:", err);
    res.status(500).json({ error: "Bulk transaction failed" });
  }
});

router.post("/set-credit-limit", verifyTokenAndRole(["creator", "superadmin", "admin", "master"]), async (req, res) => {
  const { userId, creditLimit } = req.body;

  try {
    const target = await User.findByPk(userId);
    if (!target || target.uplinkId !== req.user.id) {
      return res.status(403).json({ error: "Not your downline user" });
    }

    target.creditLimit = creditLimit;
    await target.save();

    res.json({ message: `✅ Credit limit set to ${creditLimit} for ${target.username}` });
  } catch (err) {
    console.error("Set credit limit error:", err);
    res.status(500).json({ error: "Failed to set credit limit" });
  }
});



module.exports = router;
