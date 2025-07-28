module.exports = (sequelize, DataTypes) => {
    const Game = sequelize.define("Game", {
      roomId: DataTypes.STRING,
      users: DataTypes.JSON,
      winnerId: DataTypes.INTEGER,
      pointsWon: DataTypes.INTEGER,
      gameType: DataTypes.STRING,
      endedAt: DataTypes.DATE
    });
  
    return Game;
  };
  