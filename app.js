// app.js - Express server setup with basic middleware
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
// CORS - Allow all origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser middleware
app.use(express.json({ limit: "10mb" })); // JSON parser
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // URL-encoded parser

// Import middleware
const {
  protectWriteOperations,
  logAuthAttempts,
} = require("./Middlewares/authMiddleware");

// Import routes
const customerRoutes = require("./Routes/customerRoutes");
const featuredRoutes = require("./Routes/featuredRotes");
const categoriesRoutes = require("./Routes/categoriesRoutes");
const productsRoutes = require("./Routes/productsRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const exportRoutes = require("./Routes/exportRoutes");

// Apply global middleware
app.use(logAuthAttempts); // Log authentication attempts

// Use routes
app.use("/api/admin", adminRoutes);
app.use("/api/featured", protectWriteOperations, featuredRoutes);
app.use("/api/categories", protectWriteOperations, categoriesRoutes);
app.use("/api/products", protectWriteOperations, productsRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/customers", customerRoutes);
// Basic route for testing
app.get("/", (req, res) => {
  res.json({
    message: "Blooms Nursery Backend API",
    status: "Server is running",
    timestamp: new Date(),
    endpoints: {
      admin: "/api/admin",
      featured: "/api/featured",
      categories: "/api/categories",
      products: "/api/products",
      health: "/health",
    },
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 CORS enabled for all origins`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
});
