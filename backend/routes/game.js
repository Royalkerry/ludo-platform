const express = require("express");
const router = express.Router();
const db = require("../models");
const { Op } = require("sequelize");

// Save game result (already used in socket)
router.get("/history", async (req, res) => {
  const { userId, from, to } = req.query;

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const toDate = to ? new Date(to) : new Date();

  const games = await db.Game.findAll({
    where: {
      endedAt: { [Op.between]: [fromDate, toDate] },
      players: {
        [Op.like]: `%${userId}%` // crude match
      }
    },
    order: [["endedAt", "DESC"]],
    limit: 50
  });

  res.json(games);
});

module.exports = router;
