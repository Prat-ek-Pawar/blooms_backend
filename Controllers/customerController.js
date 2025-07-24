const customerModel = require("../Models/customer.Model");

const { Parser } = require("json2csv");

// CREATE
exports.createCustomer = async (req, res) => {
  try {
    const result = await customerModel.createCustomer(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("❌ CREATE ERROR:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
};

// GET ALL
exports.getCustomers = async (req, res) => {
  try {
    const data = await customerModel.getAllCustomers();
    res.json(data);
  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

// UPDATE
exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await customerModel.updateCustomer(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error("❌ UPDATE ERROR:", err);
    res.status(500).json({ error: "Failed to update customer" });
  }
};

// DELETE
exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await customerModel.deleteCustomer(id);
    if (deleted) {
      res.json({ message: "Customer deleted successfully" });
    } else {
      res.status(404).json({ error: "Customer not found" });
    }
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
};

// EXPORT
exports.exportCustomers = async (req, res) => {
  try {
    const data = await customerModel.getAllCustomers();
    const parser = new Parser();
    const csv = parser.parse(data);

    // Set headers for download
    res.header('Content-Type', 'text/csv');
    res.attachment('customers_export.csv'); // This will trigger download
    return res.send(csv);
  } catch (err) {
    console.error('❌ EXPORT ERROR:', err);
    res.status(500).json({ error: 'Failed to export customers' });
  }
};

