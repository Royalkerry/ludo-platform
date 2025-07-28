const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  }
);

sequelize.authenticate()
  .then(() => console.log("✅ Connected to MySQL"))
  .catch(err => console.error("❌ DB Connection Failed:", err));

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./User")(sequelize, DataTypes);
db.Game = require("./Game")(sequelize, DataTypes);
db.Transaction = require("./Transaction")(sequelize, DataTypes);
db.LoginLog = require("./LoginLog")(sequelize, DataTypes); // ✅ Add this
db.PointRequest = require("./pointrequest")(sequelize, Sequelize.DataTypes);
db.GameRoom = require("./GameRoom")(sequelize, DataTypes);
db.GameUser = require("./GameUser")(sequelize, DataTypes);


Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;