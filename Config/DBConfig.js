require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host:process.env.DB_HOST,
  port: 5432,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // required for Render
  },
});

module.exports = pool;

