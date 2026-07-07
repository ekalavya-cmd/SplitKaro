const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./models");
const groupRoutes = require("./routes/groupRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

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
    console.log("Database connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Connection Failed:", err);
  }
}

startServer();
