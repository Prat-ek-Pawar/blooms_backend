// models/categoriesModel.js
const pool = require("../Config/DBConfig");

class CategoriesModel {
  // Get all categories
  static async getAllCategories() {
    try {
      const query = "SELECT * FROM categories ORDER BY created DESC";
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get available categories only (available = true)
  static async getAvailableCategories() {
    try {
      const query =
        "SELECT * FROM categories WHERE available = true ORDER BY created DESC";
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get category by ID
  static async getCategoryById(id) {
    try {
      const query = "SELECT * FROM categories WHERE id = $1";
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get category by name
  static async getCategoryByName(categoryName) {
    try {
      const query = "SELECT * FROM categories WHERE category_name = $1";
      const result = await pool.query(query, [categoryName]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new category
  static async createCategory(categoryData) {
    try {
      const { category_name, available = true } = categoryData;
      const query = `
                INSERT INTO categories (category_name, available)
                VALUES ($1, $2)
                RETURNING *
            `;
      const result = await pool.query(query, [category_name, available]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update category
  static async updateCategory(id, categoryData) {
    try {
      const { category_name, available } = categoryData;
      const query = `
                UPDATE categories
                SET category_name = $1, available = $2, updated = CURRENT_TIMESTAMP
                WHERE id = $3
                RETURNING *
            `;
      const result = await pool.query(query, [category_name, available, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Toggle availability status
  static async toggleAvailability(id) {
    try {
      const query = `
                UPDATE categories
                SET available = NOT available, updated = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete category (with dependency check)
  static async deleteCategory(id) {
    try {
      // First check if category is being used in featured or products table
      const checkQuery = `
                SELECT
                    (SELECT COUNT(*) FROM featured WHERE category = (SELECT category_name FROM categories WHERE id = $1)) as featured_count,
                    (SELECT COUNT(*) FROM products WHERE category = (SELECT category_name FROM categories WHERE id = $1)) as products_count
            `;
      const checkResult = await pool.query(checkQuery, [id]);
      const { featured_count, products_count } = checkResult.rows[0];

      if (featured_count > 0 || products_count > 0) {
        throw new Error(
          `Cannot delete category. It is being used in ${featured_count} featured items and ${products_count} products.`
        );
      }

      // If no dependencies, delete the category
      const query = "DELETE FROM categories WHERE id = $1 RETURNING *";
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Check if category name already exists (for validation)
  static async checkCategoryExists(categoryName, excludeId = null) {
    try {
      let query = "SELECT id FROM categories WHERE category_name = $1";
      let params = [categoryName];

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

  // Get category usage statistics
  static async getCategoryStats(id) {
    try {
      const query = `
                SELECT
                    c.*,
                    (SELECT COUNT(*) FROM featured WHERE category = c.category_name) as featured_count,
                    (SELECT COUNT(*) FROM products WHERE category = c.category_name) as products_count
                FROM categories c
                WHERE c.id = $1
            `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Search categories by name
  static async searchCategories(searchTerm) {
    try {
      const query = `
                SELECT * FROM categories
                WHERE category_name ILIKE $1
                ORDER BY category_name
            `;
      const result = await pool.query(query, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CategoriesModel;
