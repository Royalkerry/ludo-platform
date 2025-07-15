const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { User, PointRequest } = require("../models");

// GET /api/user/me
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "role", "points"]
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});
// 🔁 POST /user/request-refill
router.post("/request-refill", verifyToken, async (req, res) => {
  try {
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const request = await PointRequest.create({
      userId: req.user.id,
      type: "refill",
      amount,
      note,
    });

    res.json({ success: true, request });
  } catch (err) {
    console.error("Refill request error:", err);
    res.status(500).json({ error: "Failed to submit refill request" });
  }
});

// 🔁 POST /user/request-withdraw
router.post("/request-withdraw", verifyToken, async (req, res) => {
  try {
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const request = await PointRequest.create({
      userId: req.user.id,
      type: "withdraw",
      amount,
      note,
    });

    res.json({ success: true, request });
  } catch (err) {
    console.error("Withdraw request error:", err);
    res.status(500).json({ error: "Failed to submit withdraw request" });
  }
});
// GET /user/my-requests
router.get("/my-requests", verifyToken, async (req, res) => {
  try {
    const requests = await PointRequest.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json(requests);
  } catch (err) {
    console.error("Error fetching user requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// 🧩 You can add more user-only routes here later
// router.get("/games")
// router.get("/match-history")
// router.post("/update-password")

module.exports = router;
