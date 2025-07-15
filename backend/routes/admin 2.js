// const express = require("express");
// const router = express.Router();
// const { User } = require("../models");
// const { verifyTokenAndRole } = require("../middleware/auth"); // auth middleware

// // Get all downline users for current admin/superuser/master
// router.get("/downline-users", verifyTokenAndRole(["creator", "superadmin","admin", "master"]), async (req, res) => {
//   try {
//     const currentUserId = req.user.id;
//     const downlineUsers = await User.findAll({
//       where: { uplinkId: currentUserId },
//       attributes: ["id", "username", "role", "status", "createdAt"]
//     });

//     res.json(downlineUsers);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch downline users" });
//   }
// });

// module.exports = router;
