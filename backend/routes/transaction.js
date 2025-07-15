const express = require("express");
const router = express.Router();
const { Transaction, User, PointRequest } = require("../models");
const { verifyTokenAndRole } = require("../middleware/auth");
const { Op } = require("sequelize");

// ✅ GET /api/transactions
router.get(
  "/",
  verifyTokenAndRole(["creator", "superadmin", "admin", "master", "user"]),
  async (req, res) => {
    try {
      const { userId, startDate, endDate } = req.query;
      const currentUserId = req.user.id;

      const where = {};

      if (userId) {
        const targetUser = await User.findByPk(userId);
        if (!targetUser || targetUser.uplinkId !== currentUserId) {
          return res.status(403).json({ error: "Access denied to this user's transactions" });
        }
        where.userId = userId;
      } else {
        where[Op.or] = [
          { userId: currentUserId },
          { uplinkId: currentUserId },
        ];
      }

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // ✅ Include whole day
      
        where.requestedAt = {
          [Op.between]: [start, end],
        };
      }

      const transactions = await Transaction.findAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["username", "role"],
          },
        ],
        order: [["requestedAt", "DESC"]],
      });

      return res.json(transactions);
    } catch (err) {
      console.error("❌ Error fetching transactions:", err);
      return res.status(500).json({ error: "Failed to fetch transactions" });
    }
  }
);

// ✅ Get pending point refill/withdraw requests from downline users
router.get(
  "/point-requests/pending",
  verifyTokenAndRole(["master", "admin", "superadmin", "creator"]),
  async (req, res) => {
    try {
      const downlineUsers = await User.findAll({
        where: { uplinkId: req.user.id },
        attributes: ["id", "username"],
      });

      const downlineUserIds = downlineUsers.map((u) => u.id);

      const requests = await PointRequest.findAll({
        where: {
          userId: downlineUserIds,
          status: "pending",
        },
        include: [{ model: User, attributes: ["username"] }],
        order: [["createdAt", "DESC"]],
      });

      res.json(requests);
    } catch (err) {
      console.error("❌ Error fetching pending point requests:", err);
      res.status(500).json({ error: "Failed to fetch pending point requests" });
    }
  }
);

// ✅ Approve point request
router.post("/point-requests/:id/approve", verifyTokenAndRole(["master"]), async (req, res) => {
  try {
    const request = await PointRequest.findByPk(req.params.id);
    if (!request || request.status !== "pending") {
      return res.status(400).json({ error: "Invalid request" });
    }

    const user = await User.findByPk(request.userId);
    const master = await User.findByPk(req.user.id);

    if (!user || user.uplinkId !== master.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const amount = request.amount;
    const note = request.note;
    const type = request.type;

    if (type === "refill") {
      if (master.points < amount) {
        return res.status(400).json({ error: "Master has insufficient balance" });
      }

      user.points += amount;
      master.points -= amount;
    } else if (type === "withdraw") {
      if (user.points < amount) {
        return res.status(400).json({ error: "User has insufficient balance" });
      }

      user.points -= amount;
      master.points += amount;
    }

    await user.save();
    await master.save();

    await Transaction.create({
      userId: user.id,
      uplinkId: master.id,
      type,
      amount,
      status: "approved",
      note,
      requestedAt: request.createdAt,
      resolvedAt: new Date(),
    });

    request.status = "approved";
    await request.save();

    res.json({ message: `✅ ${type} request approved` });
  } catch (err) {
    console.error("❌ Approve request error:", err);
    res.status(500).json({ error: "Failed to approve request" });
  }
});

// ✅ Reject point request
router.post("/point-requests/:id/reject", verifyTokenAndRole(["master", "admin", "superadmin", "creator"]), async (req, res) => {
  try {
    const request = await PointRequest.findByPk(req.params.id);
    if (!request || request.status !== "pending") {
      return res.status(400).json({ error: "Invalid request" });
    }

    const user = await User.findByPk(request.userId);
    if (!user || user.uplinkId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const note = request.note;
    const amount = request.amount;
    const type = request.type;

    await Transaction.create({
      userId: user.id,
      uplinkId: req.user.id,
      type,
      amount,
      status: "rejected",
      note,
      requestedAt: request.createdAt,
      resolvedAt: new Date(),
    });

    request.status = "rejected";
    await request.save();

    res.json({ message: "Request rejected" });
  } catch (err) {
    console.error("❌ Reject error:", err);
    res.status(500).json({ error: "Failed to reject request" });
  }
});

module.exports = router;
