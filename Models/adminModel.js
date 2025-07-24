// models/adminModel.js
const pool = require("../Config/DBConfig");
const bcrypt = require("bcrypt");

class AdminModel {
  // Get admin by username
  static async getAdminByUsername(username) {
    try {
      const query =
        "SELECT * FROM admin WHERE username = $1 AND is_active = true";
      const result = await pool.query(query, [username]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get admin by ID
  static async getAdminById(id) {
    try {
      const query =
        "SELECT id, username, role, is_active, created, updated, last_login FROM admin WHERE id = $1 AND is_active = true";
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Verify admin credentials
  static async verifyAdmin(username, password) {
    try {
      const admin = await this.getAdminByUsername(username);
      if (!admin) {
        return null;
      }

      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) {
        return null;
      }

      // Update last login
      await this.updateLastLogin(admin.id);

      // Return admin without password
      const { password: _, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Update last login timestamp
  static async updateLastLogin(adminId) {
    try {
      const query =
        "UPDATE admin SET last_login = CURRENT_TIMESTAMP WHERE id = $1";
      await pool.query(query, [adminId]);
    } catch (error) {
      throw error;
    }
  }

  // Create new admin (for future use)
  static async createAdmin(adminData) {
    try {
      const { username, password, role = "admin" } = adminData;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
                INSERT INTO admin (username, password, role)
                VALUES ($1, $2, $3)
                RETURNING id, username, role, is_active, created
            `;
      const result = await pool.query(query, [username, hashedPassword, role]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Change admin password
  static async changePassword(adminId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const query = `
                UPDATE admin
                SET password = $1, updated = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, username, role
            `;
      const result = await pool.query(query, [hashedPassword, adminId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Deactivate admin
  static async deactivateAdmin(adminId) {
    try {
      const query = `
                UPDATE admin
                SET is_active = false, updated = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, username, is_active
            `;
      const result = await pool.query(query, [adminId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get all admins (without passwords)
  static async getAllAdmins() {
    try {
      const query =
        "SELECT id, username, role, is_active, created, updated, last_login FROM admin ORDER BY created DESC";
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Check if admin exists by username (for validation)
  static async checkAdminExists(username, excludeId = null) {
    try {
      let query = "SELECT id FROM admin WHERE username = $1";
      let params = [username];

      if (excludeId) {
        query += " AND id != $2";
        params.push(excludeId);
      }

      const result = await pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AdminModel;
