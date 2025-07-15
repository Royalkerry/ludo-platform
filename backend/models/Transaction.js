module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define("Transaction", {
    userId: DataTypes.INTEGER,
    uplinkId: DataTypes.INTEGER,
    type: DataTypes.ENUM("refill", "withdraw"),
    amount: DataTypes.INTEGER,
    status: DataTypes.ENUM("pending", "approved", "rejected"),
    requestedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    resolvedAt: DataTypes.DATE,

    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Transaction;
};
