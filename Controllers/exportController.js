const { Parser } = require("json2csv");
const { getAllProducts } = require("../models/exportModel");

const exportProductsToCSV = async (req, res) => {
  try {
    const products = await getAllProducts();

    console.log("✅ Products fetched:", products.length);

    const parser = new Parser();
    const csv = parser.parse(products);

    res.header("Content-Type", "text/csv");
    res.attachment("products.csv");
    res.send(csv);
  } catch (err) {
    console.error("❌ CSV Export Error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to export products", message: err.message });
  }
};

module.exports = { exportProductsToCSV };
