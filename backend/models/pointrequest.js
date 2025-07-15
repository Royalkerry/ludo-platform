module.exports = (sequelize, DataTypes) => {
  const PointRequest = sequelize.define("PointRequest", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("refill", "withdraw"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    note: {
      type: DataTypes.STRING,
    },
  });

  PointRequest.associate = (models) => {
    PointRequest.belongsTo(models.User, { foreignKey: "userId" });
  };

  return PointRequest;
};
