// middleware/auth.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Middleware to verify JWT and check for allowed roles
const verifyTokenAndRole = (roles = []) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Missing token" });
  

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user || (roles.length && !roles.includes(user.role))) {
        return res.status(403).json({ error: "Not authorized" });
      }
      if (user.status === "blocked") {
        return res.status(403).json({ error: "🚫 Your account has been blocked. Please contact support." });
      }
      if (user.status === "suspended") {
        // Allow only the /admin/downline-users GET request
        if (req.method === "GET" && req.path.includes("/downline-users")) {
          // allow only user viewing
          req.user = user;
          return next();
        }
      
        return res.status(403).json({ error: "⏸️ Your account is suspended. Contact your uplink." });
      }

      req.user = user; // attach full user to request
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };
};


// Optional middleware for admin-only access
const authAdmin = verifyTokenAndRole(["creator", "superadmin","admin", "master"]);

module.exports = {
  verifyTokenAndRole,
  authAdmin,
};
