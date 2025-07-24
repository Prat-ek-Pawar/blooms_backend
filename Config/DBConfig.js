// dbConfig.js - Simple PostgreSQL connection pool
const { Pool } = require("pg");

// Create PostgreSQL connection pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "bloomsbackend",
  password: "4912",
  port: 5432,
});

// Export the pool
module.exports = pool;
