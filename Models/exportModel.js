const pool = require("../Config/DBConfig");

const exportAllProducts = async () => {
  const res = await pool.query("SELECT * FROM products");
  return res.rows;
};

module.exports = { exportAllProducts };
