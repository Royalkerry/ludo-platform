const express = require("express");
const router = express.Router();
const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, LoginLog } = require("../models");
const axios = require("axios");

// ✅ Login (public)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    
    if (user.status === "blocked") {
      return res.status(403).json({ error: "🚫 Your account has been blocked. Please contact support." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    
    // login history 
    // Get IP (handle proxies)
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || "";

    // Get user-agent header
    const userAgent = req.headers["user-agent"] || "Unknown";

    // Get location from IP (using ip-api.com)
    let location = "Unknown";
    try {
      const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
      if (geoRes.data.status === "success") {
        location = `${geoRes.data.city}, ${geoRes.data.regionName}, ${geoRes.data.country}`;
      }
    } catch (error) {
      console.error("Geo-IP lookup failed:", error.message);
    }

    // Save login log
    await LoginLog.create({
      userId: user.id,
      ipAddress: ip,
      userAgent: userAgent,
      location: location,
      loginTime: new Date(),
    });



    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      uplinkId: user.uplinkId
    };

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
