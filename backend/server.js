const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/redis.config");
const logger = require("./config/logger.config");

const cookieParser = require("cookie-parser");

const { sequelize } = require("./models");
const groupRoutes = require("./routes/groupRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the SplitKaro application!" });
});

app.use((req, res) => {
  res.status(404).json({ message: "404 - Page not found" });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info("Database connected successfully!");

    app.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}`);
      logger.info("Logger initialized successfully.");
    });
  } catch (err) {
    logger.error("Connection Failed:", err);
  }
}

startServer();
