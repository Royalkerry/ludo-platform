// models/GameRoom.js
module.exports = (sequelize, DataTypes) => {
    const GameRoom = sequelize.define("GameRoom", {
      roomCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("waiting", "started", "finished"),
        defaultValue: "waiting",
      },
      gameType: {
        type: DataTypes.STRING,
        defaultValue: "standard", // future-proofing
      },
      playerCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
    });
  
    GameRoom.associate = (models) => {
      GameRoom.hasMany(models.GamePlayer, { foreignKey: "roomId" });
    };
  
    return GameRoom;
  };
  