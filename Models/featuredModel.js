//models/featuredModel.js
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

  // Create new featured item - UPDATED FOR IMAGES ARRAY
  static async createFeatured(featuredData) {
    try {
      const { category, images, show = true } = featuredData; // ← UPDATED: Now expects array of images

      // Validate that images is an array
      if (!Array.isArray(images) || images.length === 0) {
        throw new Error("Images must be a non-empty array");
      }

      const query = `
        INSERT INTO featured (category, images, show)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const result = await pool.query(query, [category, images, show]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update featured item - UPDATED FOR IMAGES ARRAY
  static async updateFeatured(id, featuredData) {
    try {
      const { category, images, show } = featuredData; // ← UPDATED: Now expects array of images

      // Validate that images is an array if provided
      if (images && (!Array.isArray(images) || images.length === 0)) {
        throw new Error("Images must be a non-empty array");
      }

      const query = `
        UPDATE featured
        SET category = $1, images = $2, show = $3, updated = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `;

      const result = await pool.query(query, [category, images, show, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Add image to existing featured item
  static async addImageToFeatured(id, newImageUrl) {
    try {
      const query = `
        UPDATE featured
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

  // Remove image from featured item
  static async removeImageFromFeatured(id, imageUrlToRemove) {
    try {
      const query = `
        UPDATE featured
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

  // Replace all images for a featured item
  static async replaceFeaturedImages(id, newImages) {
    try {
      // Validate that images is an array
      if (!Array.isArray(newImages) || newImages.length === 0) {
        throw new Error("Images must be a non-empty array");
      }

      const query = `
        UPDATE featured
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
        FROM featured
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0]?.primary_image;
    } catch (error) {
      throw error;
    }
  }

  // Get featured items by image count
  static async getFeaturedByImageCount(minImages = 1) {
    try {
      const query = `
        SELECT *, array_length(images, 1) as image_count
        FROM featured
        WHERE array_length(images, 1) >= $1
        ORDER BY image_count DESC
      `;
      const result = await pool.query(query, [minImages]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get featured items with specific image in their array
  static async getFeaturedWithImage(imageUrl) {
    try {
      const query = `
        SELECT * FROM featured
        WHERE $1 = ANY(images)
        ORDER BY created DESC
      `;
      const result = await pool.query(query, [imageUrl]);
      return result.rows;
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

  // Bulk update featured images
  static async bulkUpdateFeaturedImages(updates) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const results = [];
      for (const update of updates) {
        const { id, images } = update;
        const query = `
          UPDATE featured
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

  // Get featured items with pagination
  static async getFeaturedWithPagination(page = 1, limit = 10, filters = {}) {
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
      if (filters.show !== undefined) {
        paramCount++;
        whereConditions.push(`show = $${paramCount}`);
        params.push(filters.show);
      }
      if (filters.minImages) {
        paramCount++;
        whereConditions.push(`array_length(images, 1) >= $${paramCount}`);
        params.push(filters.minImages);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Count total records
      const countQuery = `SELECT COUNT(*) as total FROM featured ${whereClause}`;
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated results
      paramCount++;
      params.push(limit);
      paramCount++;
      params.push(offset);

      const dataQuery = `
        SELECT * FROM featured
        ${whereClause}
        ORDER BY created DESC
        LIMIT $${paramCount - 1} OFFSET $${paramCount}
      `;
      const dataResult = await pool.query(dataQuery, params);

      return {
        featured: dataResult.rows,
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

  // Get statistics about featured images
  static async getImageStatistics() {
    try {
      const query = `
        SELECT
          COUNT(*) as total_featured,
          AVG(array_length(images, 1)) as avg_images_per_featured,
          MIN(array_length(images, 1)) as min_images,
          MAX(array_length(images, 1)) as max_images,
          COUNT(*) FILTER (WHERE array_length(images, 1) = 1) as single_image_featured,
          COUNT(*) FILTER (WHERE array_length(images, 1) > 1) as multiple_image_featured,
          COUNT(*) FILTER (WHERE show = true) as active_featured,
          COUNT(*) FILTER (WHERE show = false) as inactive_featured
        FROM featured
        WHERE images IS NOT NULL
      `;
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get featured items by category with active status
  static async getActiveFeaturedByCategory(category) {
    try {
      const query = `
        SELECT * FROM featured
        WHERE category = $1 AND show = true
        ORDER BY created DESC
      `;
      const result = await pool.query(query, [category]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get random featured items
  static async getRandomFeatured(limit = 5) {
    try {
      const query = `
        SELECT * FROM featured
        WHERE show = true
        ORDER BY RANDOM()
        LIMIT $1
      `;
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Update only the show status for multiple items
  static async bulkUpdateShowStatus(ids, showStatus) {
    try {
      const query = `
        UPDATE featured
        SET show = $1, updated = CURRENT_TIMESTAMP
        WHERE id = ANY($2::int[])
        RETURNING *
      `;
      const result = await pool.query(query, [showStatus, ids]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get featured items grouped by category
  static async getFeaturedGroupedByCategory() {
    try {
      const query = `
        SELECT
          category,
          COUNT(*) as total_items,
          COUNT(*) FILTER (WHERE show = true) as active_items,
          array_agg(
            json_build_object(
              'id', id,
              'images', images,
              'show', show,
              'created', created,
              'updated', updated
            ) ORDER BY created DESC
          ) as items
        FROM featured
        GROUP BY category
        ORDER BY category
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = FeaturedModel;
