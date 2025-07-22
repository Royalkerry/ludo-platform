const jwt = require("jsonwebtoken");
const { User } = require("../models");

// ✅ Basic token check (used for /me and general user auth)
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.status === "blocked") {
      return res.status(403).json({ error: "🚫 Your account is blocked." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "⏸️ Your account is suspended." });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ✅ Role-specific middleware
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
        return res.status(403).json({ error: "🚫 Your account is blocked." });
      }

      if (user.status === "suspended") {
        if (req.method === "GET" && req.path.includes("/downline-users")) {
          req.user = user;
          return next();
        }
        return res.status(403).json({ error: "⏸️ Your account is suspended." });
      }

      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };
};
// ✅ Dedicated user-role middleware
const verifyTokenUser = verifyTokenAndRole(["user"]);

// ✅ Dedicated admin-role middleware
const authAdmin = verifyTokenAndRole(["creator", "superadmin", "admin", "master"]);


const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = {
  authenticateUser,
  verifyToken,
  verifyTokenUser,
  verifyTokenAndRole,
  authAdmin,
};
