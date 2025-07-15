// routes/logindetail.js
const express = require("express");
const router = express.Router();
const { LoginLog } = require("../models");

// GET /api/users/:userId/login-details
router.get("/:userId/login-details", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const recentLog = await LoginLog.findOne({
      where: { userId },
      order: [["loginTime", "DESC"]],
    });

    if (!recentLog) {
      return res.status(404).json({ error: "No login details found" });
    }

    res.json({
      ip: recentLog.ipAddress,
      browser: recentLog.userAgent,
      location: recentLog.location,
      loginTime: recentLog.loginTime,
    });
  } catch (error) {
    console.error("Error in /login-details route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
