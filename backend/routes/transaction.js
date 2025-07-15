const express = require("express");
const router = express.Router();
const { Transaction, User } = require("../models");
const { verifyTokenAndRole } = require("../middleware/auth");
const { Op } = require("sequelize");

// ✅ GET /api/transactions
// ✅ GET /api/transactions
router.get(
  "/",
  verifyTokenAndRole(["creator", "superadmin", "admin", "master", "user"]),
  async (req, res) => {
    try {
      const { userId, startDate, endDate } = req.query;
      const currentUserId = req.user.id;

      const where = {};

      // 🔍 Show either selected downline user's transactions OR
      // Show all transactions where current user is either sender or receiver
      if (userId) {
        // ✅ Downline check
        const targetUser = await User.findByPk(userId);
        if (!targetUser || targetUser.uplinkId !== currentUserId) {
          return res.status(403).json({ error: "Access denied to this user's transactions" });
        }
        where.userId = userId;
      } else {
        // ✅ Show ALL transactions where current user is either sender or receiver
        where[Op.or] = [
          { userId: currentUserId },      // user initiated transaction
          { uplinkId: currentUserId },    // someone transacted with this user
        ];
      }

      if (startDate && endDate) {
        where.requestedAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
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


module.exports = router;