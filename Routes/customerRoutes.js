const express = require("express");
const router = express.Router();
const customerController = require("../Controllers/customerController");

// Base: /api/customers

router.post("/", customerController.createCustomer);
router.get("/", customerController.getCustomers);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);
router.get("/export/csv", customerController.exportCustomers);

module.exports = router;
