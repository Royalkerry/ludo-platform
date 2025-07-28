// models/GameUser.js
module.exports = (sequelize, DataTypes) => {
    const GameUser = sequelize.define("GameUser", {
      roomId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      isAI: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    });
  
    GameUser.associate = (models) => {
      GameUser.belongsTo(models.GameRoom, { foreignKey: "roomId" });
      GameUser.belongsTo(models.User, { foreignKey: "userId" });
    };
  
    return GameUser;
  };
  