// backend/temp-check.js
require("dotenv").config();
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  },
);

(async () => {
  const [rows] = await sequelize.query("SHOW CREATE TABLE members");
  console.log(rows[0]["Create Table"]);
  process.exit(0);
})();
