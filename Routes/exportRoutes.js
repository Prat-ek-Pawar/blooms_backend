const express = require("express");
const router = express.Router();
const { exportProductsToCSV } = require("../Controllers/exportController");

router.get("", exportProductsToCSV);

module.exports = router;
