const db = require("../models");
const { Op } = require("sequelize");

const Transaction = db.Transaction;

// Create request (by user)
exports.createRequest = async (req, res) => {
  try {
    const { userId, uplinkId, type, amount } = req.body;

    const tx = await Transaction.create({
      userId,
      uplinkId,
      type,
      amount,
      status: "pending",
      requestedAt: new Date()
    });

    res.json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};

// Approve or reject (by uplink)
exports.handleRequest = async (req, res) => {
  try {
    const { transactionId, status } = req.body;
    const tx = await Transaction.findByPk(transactionId);

    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    tx.status = status;
    tx.resolvedAt = new Date();
    await tx.save();

    // Update user balance if approved
    if (status === "approved") {
      const user = await db.User.findByPk(tx.userId);
      if (tx.type === "refill") {
        user.points += tx.amount;
      } else if (tx.type === "withdraw" && user.points >= tx.amount) {
        user.points -= tx.amount;
      }
      await user.save();
    }

    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: "Failed to update transaction" });
  }
};

// Uplink: get pending
exports.getPendingByUplink = async (req, res) => {
  const { uplinkId } = req.params;
  const txs = await Transaction.findAll({
    where: { uplinkId, status: "pending" }
  });
  res.json(txs);
};

// History with optional date range (max 30 days)
exports.getHistory = async (req, res) => {
  try {
    const { userId, from, to } = req.query;

    const maxDays = 30;
    const fromDate = from ? new Date(from) : new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    const txs = await Transaction.findAll({
      where: {
        userId,
        requestedAt: {
          [Op.between]: [fromDate, toDate]
        }
      },
      order: [["requestedAt", "DESC"]],
      limit: 50
    });

    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: "History fetch failed" });
  }
};
