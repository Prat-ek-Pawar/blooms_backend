// models/featuredModel.js
const pool = require("../Config/DBConfig");

class FeaturedModel {
  // Get all featured items
  static async getAllFeatured() {
    try {
      const query = "SELECT * FROM featured ORDER BY created DESC";
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get featured items that are shown (show = true)
  static async getActiveFeatured() {
    try {
      const query =
        "SELECT * FROM featured WHERE show = true ORDER BY created DESC";
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get featured item by ID
  static async getFeaturedById(id) {
    try {
      const query = "SELECT * FROM featured WHERE id = $1";
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get featured items by category
  static async getFeaturedByCategory(category) {
    try {
      const query =
        "SELECT * FROM featured WHERE category = $1 ORDER BY created DESC";
      const result = await pool.query(query, [category]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Create new featured item
  static async createFeatured(featuredData) {
    try {
      const { category, image, show = true } = featuredData;
      const query = `
                INSERT INTO featured (category, image, show)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
      const result = await pool.query(query, [category, image, show]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update featured item
  static async updateFeatured(id, featuredData) {
    try {
      const { category, image, show } = featuredData;
      const query = `
                UPDATE featured
                SET category = $1, image = $2, show = $3, updated = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING *
            `;
      const result = await pool.query(query, [category, image, show, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Toggle show status
  static async toggleShowStatus(id) {
    try {
      const query = `
                UPDATE featured
                SET show = NOT show, updated = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete featured item
  static async deleteFeatured(id) {
    try {
      const query = "DELETE FROM featured WHERE id = $1 RETURNING *";
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Check if category exists in categories table
  static async validateCategory(category) {
    try {
      const query =
        "SELECT category_name FROM categories WHERE category_name = $1 AND available = true";
      const result = await pool.query(query, [category]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = FeaturedModel;
