module.exports = (sequelize, DataTypes) => {
  return sequelize.define("User", {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    uplinkId: DataTypes.INTEGER,
    points: { type: DataTypes.INTEGER, defaultValue: 0 },
    isp: DataTypes.STRING,
    deviceId: DataTypes.STRING,
    ip: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM("active", "blocked", "suspended"),
      defaultValue: "active"
    },
    creditLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  });
  
};
