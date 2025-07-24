// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const AdminModel = require("../Models/adminModel");

// JWT Secret (should match the one in AdminController)
const JWT_SECRET = "blooms_nursery_admin_secret_key_2024";

// Middleware to verify admin authentication
const verifyAdminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message:
          "Access denied. No token provided or invalid format. Use: Bearer <token>",
      });
    }

    // Extract token
    const token = authHeader.replace("Bearer ", "");

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check if admin still exists and is active
      const admin = await AdminModel.getAdminById(decoded.adminId);

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Access denied. Admin not found or inactive.",
        });
      }

      // Attach admin info to request object
      req.admin = {
        adminId: admin.id,
        username: admin.username,
        role: admin.role,
      };

      next();
    } catch (jwtError) {
      console.error("JWT Error:", jwtError);

      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Access denied. Invalid token.",
        });
      }

      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access denied. Token expired. Please login again.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Access denied. Token verification failed.",
      });
    }
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
      error: error.message,
    });
  }
};

// Middleware specifically for write operations (POST, PUT, PATCH, DELETE)
const protectWriteOperations = (req, res, next) => {
  const writeOperations = ["POST", "PUT", "PATCH", "DELETE"];

  if (writeOperations.includes(req.method)) {
    return verifyAdminAuth(req, res, next);
  }

  // If it's a GET request, allow it to pass through
  next();
};

// Optional: Role-based middleware (if you want to add more roles later)
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.admin && req.admin.role === role) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `Access denied. ${role} role required.`,
      });
    }
  };
};

// Log authentication attempts (optional)
const logAuthAttempts = (req, res, next) => {
  if (req.headers.authorization) {
    console.log(
      `🔐 Auth attempt - Method: ${req.method}, URL: ${req.originalUrl}, IP: ${
        req.ip
      }, Time: ${new Date().toISOString()}`
    );
  }
  next();
};

module.exports = {
  verifyAdminAuth,
  protectWriteOperations,
  requireRole,
  logAuthAttempts,
};
