const pool = require("../Config/DBConfig");

const getAllProducts = async () => {
  const res = await pool.query("SELECT * FROM products");
  return res.rows;
};

module.exports = { getAllProducts };
