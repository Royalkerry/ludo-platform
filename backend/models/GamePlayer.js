// models/GamePlayer.js
module.exports = (sequelize, DataTypes) => {
    const GamePlayer = sequelize.define("GamePlayer", {
      roomId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      isAI: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    });
  
    GamePlayer.associate = (models) => {
      GamePlayer.belongsTo(models.GameRoom, { foreignKey: "roomId" });
      GamePlayer.belongsTo(models.User, { foreignKey: "userId" });
    };
  
    return GamePlayer;
  };
  