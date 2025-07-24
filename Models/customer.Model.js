const pool = require("../Config/DBConfig");

// CREATE
const createCustomer = async (data) => {
  const { name, email, mobile, product_name, quantity, delivery_address } =
    data;

  const result = await pool.query(
    `INSERT INTO customers
     (name, email, mobile, product_name, quantity, delivery_address)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, email, mobile, product_name, quantity, delivery_address]
  );

  return result.rows[0];
};

// GET ALL
const getAllCustomers = async () => {
  const res = await pool.query(`SELECT * FROM customers ORDER BY created DESC`);
  return res.rows;
};

// UPDATE
const updateCustomer = async (id, data) => {
  const { name, email, mobile, product_name, quantity, delivery_address } =
    data;

  const res = await pool.query(
    `UPDATE customers
     SET name = $1, email = $2, mobile = $3,
         product_name = $4, quantity = $5,
         delivery_address = $6, updated = CURRENT_TIMESTAMP
     WHERE id = $7 RETURNING *`,
    [name, email, mobile, product_name, quantity, delivery_address, id]
  );

  return res.rows[0];
};

// DELETE
const deleteCustomer = async (id) => {
  const res = await pool.query(`DELETE FROM customers WHERE id = $1`, [id]);
  return res.rowCount;
};

module.exports = {
  createCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
};
