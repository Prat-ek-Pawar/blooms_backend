// require("dotenv").config();
// const { Pool } = require("pg");

// const pool = new Pool({
//   host:'localhost'|| process.env.DB_HOST,
//   port: 5432,
//   user:'postgres'|| process.env.DB_USER,
//   password:'4912'|| process.env.DB_PASSWORD,
//   database:'bloomsbackend'|| process.env.DB_NAME,
//   ssl: {
//     rejectUnauthorized: false, // required for Render
//   },
// });

// module.exports = pool;

require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost" || process.env.DB_HOST,
  port: 5432,
  user: "postgres" || process.env.DB_USER,
  password: "4912" || process.env.DB_PASSWORD,
  database: "bloomsbackend" || process.env.DB_NAME,
  ssl: false
});

module.exports = pool;

