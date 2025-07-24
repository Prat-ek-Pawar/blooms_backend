// routes/adminRoutes.js
const express = require("express");
const AdminController = require("../Controllers/adminController");
const { verifyAdminAuth } = require("../Middlewares/authMiddleware");

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", AdminController.login); // Admin login
router.post("/verify-token", AdminController.verifyToken); // Verify token validity

// Protected routes (require authentication)
router.get("/profile", verifyAdminAuth, AdminController.getProfile); // Get admin profile
router.put("/change-password", verifyAdminAuth, AdminController.changePassword); // Change password
router.post("/logout", verifyAdminAuth, AdminController.logout); // Logout
router.get(
  "/dashboard-stats",
  verifyAdminAuth,
  AdminController.getDashboardStats
); // Dashboard statistics

module.exports = router;
