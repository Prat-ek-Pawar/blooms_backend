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

  static async getFilteredProducts(searchQuery, categories) {
    let baseQuery = `SELECT * FROM products WHERE 1=1`;
    const values = [];

    // 🔍 Search by product_name
    if (searchQuery) {
      values.push(`%${searchQuery}%`);
      baseQuery += ` AND product_name ILIKE $${values.length}`;
    }

    // 🧃 Filter by categories
    if (categories && categories.length > 0) {
      const placeholders = categories.map(
        (_, i) => `$${values.length + i + 1}`
      );
      baseQuery += ` AND category IN (${placeholders.join(",")})`;
      values.push(...categories);
    }

    baseQuery += ` ORDER BY created DESC`;

    const result = await pool.query(baseQuery, values);
    return result.rows;
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

  // Create new product - UPDATED FOR IMAGES ARRAY
  static async createProduct(productData) {
    try {
      const {
        category,
        product_name,
        stock = 0,
        price,
        available = true,
        images, // ← UPDATED: Now expects array of images
        rating = 0.0,
        reviews = 0,
      } = productData;

      // Validate that images is an array
      if (!Array.isArray(images) || images.length === 0) {
        throw new Error("Images must be a non-empty array");
      }

      const query = `
        INSERT INTO products (category, product_name, stock, price, available, images, rating, reviews)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const result = await pool.query(query, [
        category,
        product_name,
        stock,
        price,
        available,
        images, // PostgreSQL will handle the array
        rating,
        reviews,
      ]);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update product - UPDATED FOR IMAGES ARRAY
  static async updateProduct(id, productData) {
    try {
      const {
        category,
        product_name,
        stock,
        price,
        available,
        images, // ← UPDATED: Now expects array of images
        rating,
        reviews,
      } = productData;

      // Validate that images is an array if provided
      if (images && (!Array.isArray(images) || images.length === 0)) {
        throw new Error("Images must be a non-empty array");
      }

      const query = `
        UPDATE products
        SET category = $1, product_name = $2, stock = $3, price = $4,
            available = $5, images = $6, rating = $7, reviews = $8,
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
        images, // PostgreSQL will handle the array
        rating,
        reviews,
        id,
      ]);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Add image to existing product
  static async addImageToProduct(id, newImageUrl) {
    try {
      const query = `
        UPDATE products
        SET images = array_append(images, $1), updated = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [newImageUrl, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Remove image from product
  static async removeImageFromProduct(id, imageUrlToRemove) {
    try {
      const query = `
        UPDATE products
        SET images = array_remove(images, $1), updated = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [imageUrlToRemove, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Replace all images for a product
  static async replaceProductImages(id, newImages) {
    try {
      // Validate that images is an array
      if (!Array.isArray(newImages) || newImages.length === 0) {
        throw new Error("Images must be a non-empty array");
      }

      const query = `
        UPDATE products
        SET images = $1, updated = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [newImages, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get primary image (first image in array)
  static async getPrimaryImage(id) {
    try {
      const query = `
        SELECT images[1] as primary_image
        FROM products
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0]?.primary_image;
    } catch (error) {
      throw error;
    }
  }

  // Search products by image count
  static async getProductsByImageCount(minImages = 1) {
    try {
      const query = `
        SELECT *, array_length(images, 1) as image_count
        FROM products
        WHERE array_length(images, 1) >= $1
        ORDER BY image_count DESC
      `;
      const result = await pool.query(query, [minImages]);
      return result.rows;
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

  // Bulk update product images
  static async bulkUpdateProductImages(updates) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const results = [];
      for (const update of updates) {
        const { id, images } = update;
        const query = `
          UPDATE products
          SET images = $1, updated = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `;
        const result = await client.query(query, [images, id]);
        results.push(result.rows[0]);
      }

      await client.query("COMMIT");
      return results;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Get products with specific image in their array
  static async getProductsWithImage(imageUrl) {
    try {
      const query = `
        SELECT * FROM products
        WHERE $1 = ANY(images)
        ORDER BY created DESC
      `;
      const result = await pool.query(query, [imageUrl]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get statistics about images
  static async getImageStatistics() {
    try {
      const query = `
        SELECT
          COUNT(*) as total_products,
          AVG(array_length(images, 1)) as avg_images_per_product,
          MIN(array_length(images, 1)) as min_images,
          MAX(array_length(images, 1)) as max_images,
          COUNT(*) FILTER (WHERE array_length(images, 1) = 1) as single_image_products,
          COUNT(*) FILTER (WHERE array_length(images, 1) > 1) as multiple_image_products
        FROM products
        WHERE images IS NOT NULL
      `;
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductsModel;
