// controllers/adminController.js
const AdminModel = require("../Models/adminModel");
const jwt = require("jsonwebtoken");
const pool = require("../Config/DBConfig"); // Add this import

// JWT Secret (in production, use environment variable)
const JWT_SECRET = "blooms_nursery_admin_secret_key_2024";
const JWT_EXPIRES_IN = "24h";

class AdminController {
  // POST /api/admin/login - Admin login
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validation
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      // Verify admin credentials
      const admin = await AdminModel.verifyAdmin(username.trim(), password);

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          adminId: admin.id,
          username: admin.username,
          role: admin.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          admin: {
            id: admin.id,
            username: admin.username,
            role: admin.role,
            last_login: admin.last_login,
          },
          token,
          expiresIn: JWT_EXPIRES_IN,
        },
      });
    } catch (error) {
      console.error("Error in admin login:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  }

  // POST /api/admin/verify-token - Verify if token is valid
  static async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token provided",
        });
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check if admin still exists and is active
      const admin = await AdminModel.getAdminById(decoded.adminId);

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin not found or inactive ",
        });
      }

      res.status(200).json({
        success: true,
        message: "Authenticated Successfully :)",
        data: {
          admin: {
            id: admin.id,
            username: admin.username,
            role: admin.role,
          },
          tokenValid: true,
        },
      });
    } catch (error) {
      console.error("Error in token verification:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Authentication Failed Relogin⁐",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session Ended Please Relogin🤗It's for your security only",
        });
      }

      res.status(500).json({
        success: false,
        message: "Verification Failed Please Try Again🔄️",
        error: error.message,
      });
    }
  }

  // GET /api/admin/profile - Get admin profile
  static async getProfile(req, res) {
    try {
      const adminId = req.admin.adminId;

      const admin = await AdminModel.getAdminById(adminId);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: admin,
      });
    } catch (error) {
      console.error("Error in getProfile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve profile",
        error: error.message,
      });
    }
  }

  // PUT /api/admin/change-password - Change admin password
  static async changePassword(req, res) {
    try {
      const adminId = req.admin.adminId;
      const { currentPassword, newPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
      }

      // Get admin and verify current password
      const admin = await AdminModel.getAdminByUsername(req.admin.username);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      // Verify current password
      const bcrypt = require("bcrypt");
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        admin.password
      );

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Change password
      const updatedAdmin = await AdminModel.changePassword(
        adminId,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
        data: updatedAdmin,
      });
    } catch (error) {
      console.error("Error in changePassword:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
        error: error.message,
      });
    }
  }

  // POST /api/admin/logout - Admin logout (client-side token removal)
  static async logout(req, res) {
    try {
      // In a stateless JWT system, logout is handled on the client side
      // by removing the token from storage
      res.status(200).json({
        success: true,
        message:
          "Logout successful. Please remove the token from client storage.",
      });
    } catch (error) {
      console.error("Error in logout:", error);
      res.status(500).json({
        success: false,
        message: "Logout failed",
        error: error.message,
      });
    }
  }

  // GET /api/admin/dashboard-stats - Get dashboard statistics (protected route example)
  static async getDashboardStats(req, res) {
    try {
      // Example dashboard stats - you can customize this
      const stats = await pool.query(`
                SELECT
                    (SELECT COUNT(*) FROM products) as total_products,
                    (SELECT COUNT(*) FROM products WHERE available = true) as available_products,
                    (SELECT COUNT(*) FROM products WHERE stock = 0) as out_of_stock_products,
                    (SELECT COUNT(*) FROM categories) as total_categories,
                    (SELECT COUNT(*) FROM categories WHERE available = true) as active_categories,
                    (SELECT COUNT(*) FROM featured) as featured_items,
                    (SELECT COUNT(*) FROM customers) as total_customers
            `);

      res.status(200).json({
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: stats.rows[0],
      });
    } catch (error) {
      console.error("Error in getDashboardStats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve dashboard statistics",
        error: error.message,
      });
    }
  }
}

// Export JWT_SECRET for use in middleware
AdminController.JWT_SECRET = JWT_SECRET;

module.exports = AdminController;
