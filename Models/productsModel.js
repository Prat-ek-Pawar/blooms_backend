// models/productsModel.js
const pool = require("../Config/DBConfig");

class ProductsModel {
  // Get all products
  static async getAllProducts() {
    try {
      const query = "SELECT * FROM products ORDER BY created DESC";
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get available products only (available = true)
  static async getAvailableProducts() {
    try {
      const query =
        "SELECT * FROM products WHERE available = true ORDER BY created DESC";
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get products with stock > 0
  static async getInStockProducts() {
    try {
      const query =
        "SELECT * FROM products WHERE stock > 0 AND available = true ORDER BY created DESC";
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const query = "SELECT * FROM products WHERE id = $1";
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get products by category
  static async getProductsByCategory(category) {
    try {
      const query =
        "SELECT * FROM products WHERE category = $1 ORDER BY created DESC";
      const result = await pool.query(query, [category]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get products by price range
  static async getProductsByPriceRange(minPrice, maxPrice) {
    try {
      const query = `
                SELECT * FROM products
                WHERE price BETWEEN $1 AND $2 AND available = true
                ORDER BY price ASC
            `;
      const result = await pool.query(query, [minPrice, maxPrice]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get products by rating range
  static async getProductsByRating(minRating) {
    try {
      const query = `
                SELECT * FROM products
                WHERE rating >= $1 AND available = true
                ORDER BY rating DESC
            `;
      const result = await pool.query(query, [minRating]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Search products by name
  static async searchProducts(searchTerm) {
    try {
      const query = `
                SELECT * FROM products
                WHERE product_name ILIKE $1
                ORDER BY product_name
            `;
      const result = await pool.query(query, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get featured products (high rating + good reviews)
  static async getFeaturedProducts(limit = 10) {
    try {
      const query = `
                SELECT * FROM products
                WHERE available = true AND stock > 0 AND rating >= 4.0 AND reviews >= 10
                ORDER BY rating DESC, reviews DESC
                LIMIT $1
            `;
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Create new product
  static async createProduct(productData) {
    try {
      const {
        category,
        product_name,
        stock = 0,
        price,
        available = true,
        image,
        rating = 0.0,
        reviews = 0,
      } = productData;

      const query = `
                INSERT INTO products (category, product_name, stock, price, available, image, rating, reviews)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;
      const result = await pool.query(query, [
        category,
        product_name,
        stock,
        price,
        available,
        image,
        rating,
        reviews,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update product
  static async updateProduct(id, productData) {
    try {
      const {
        category,
        product_name,
        stock,
        price,
        available,
        image,
        rating,
        reviews,
      } = productData;
      const query = `
                UPDATE products
                SET category = $1, product_name = $2, stock = $3, price = $4,
                    available = $5, image = $6, rating = $7, reviews = $8,
                    updated = CURRENT_TIMESTAMP
                WHERE id = $9
                RETURNING *
            `;
      const result = await pool.query(query, [
        category,
        product_name,
        stock,
        price,
        available,
        image,
        rating,
        reviews,
        id,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update stock only
  static async updateStock(id, newStock) {
    try {
      const query = `
                UPDATE products
                SET stock = $1, updated = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `;
      const result = await pool.query(query, [newStock, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update price only
  static async updatePrice(id, newPrice) {
    try {
      const query = `
                UPDATE products
                SET price = $1, updated = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `;
      const result = await pool.query(query, [newPrice, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update rating and reviews
  static async updateRating(id, rating, reviews) {
    try {
      const query = `
                UPDATE products
                SET rating = $1, reviews = $2, updated = CURRENT_TIMESTAMP
                WHERE id = $3
                RETURNING *
            `;
      const result = await pool.query(query, [rating, reviews, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Toggle availability status
  static async toggleAvailability(id) {
    try {
      const query = `
                UPDATE products
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

  // Delete product
  static async deleteProduct(id) {
    try {
      const query = "DELETE FROM products WHERE id = $1 RETURNING *";
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

  // Get low stock products
  static async getLowStockProducts(threshold = 5) {
    try {
      const query = `
                SELECT * FROM products
                WHERE stock <= $1 AND available = true
                ORDER BY stock ASC
            `;
      const result = await pool.query(query, [threshold]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get products with pagination
  static async getProductsWithPagination(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereConditions = [];
      let params = [];
      let paramCount = 0;

      // Build dynamic WHERE clause based on filters
      if (filters.category) {
        paramCount++;
        whereConditions.push(`category = $${paramCount}`);
        params.push(filters.category);
      }
      if (filters.available !== undefined) {
        paramCount++;
        whereConditions.push(`available = $${paramCount}`);
        params.push(filters.available);
      }
      if (filters.minPrice) {
        paramCount++;
        whereConditions.push(`price >= $${paramCount}`);
        params.push(filters.minPrice);
      }
      if (filters.maxPrice) {
        paramCount++;
        whereConditions.push(`price <= $${paramCount}`);
        params.push(filters.maxPrice);
      }
      if (filters.minRating) {
        paramCount++;
        whereConditions.push(`rating >= $${paramCount}`);
        params.push(filters.minRating);
      }
      if (filters.inStock) {
        whereConditions.push("stock > 0");
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Count total records
      const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated results
      paramCount++;
      params.push(limit);
      paramCount++;
      params.push(offset);

      const dataQuery = `
                SELECT * FROM products
                ${whereClause}
                ORDER BY created DESC
                LIMIT $${paramCount - 1} OFFSET $${paramCount}
            `;
      const dataResult = await pool.query(dataQuery, params);

      return {
        products: dataResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductsModel;
