const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const db = require("./models");
const setupSocket = require("./socket");

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const transactionRoutes = require("./routes/transaction");
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
const loginDetailRoutes = require("./routes/logindetail");
const matchmakingRoutes = require("./routes/matchmaking");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ Setup Socket
setupSocket(io);

// ✅ Use CORS with proper options
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Middleware
app.use(express.json());

//matchmaking 
app.use("/api/matchmaking", matchmakingRoutes);

// ✅ API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);    // Regular users only
app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/users", loginDetailRoutes);

// ✅ DB & Server Start
db.sequelize.sync({ alter: false }) // Or use { force: true } if starting clean
  .then(() => {
    // db.seedInitialCreator(); // Seed creator admin if not exists
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  });
