// models/LoginLog.js
module.exports = (sequelize, DataTypes) => {
    const LoginLog = sequelize.define("LoginLog", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      loginTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    }, {
      timestamps: false,
      tableName: "login_logs",
    });
  
    LoginLog.associate = (models) => {
      LoginLog.belongsTo(models.User, { foreignKey: "userId" });
    };
  
    return LoginLog;
  };
  