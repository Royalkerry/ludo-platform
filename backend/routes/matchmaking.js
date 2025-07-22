// routes/matchmaking.js
const express = require("express");
const router = express.Router();
const { autoMatchPlayer } = require("../controllers/matchmakingController");
const { authenticateUser } = require("../middleware/auth");

router.post("/start", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { playerCount } = req.body; // 👈 get from frontend
    const room = await autoMatchPlayer(userId, playerCount || 2);
    res.json({ success: true, roomId: room.id });
  } catch (err) {
    console.error("Matchmaking error:", err);
    res.status(500).json({ success: false, message: "Matchmaking failed" });
  }
});

module.exports = router;
