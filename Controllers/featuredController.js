// controllers/featuredController.js
const FeaturedModel = require("../Models/featuredModel");

class FeaturedController {
  // GET /api/featured - Get all featured items
  static async getAllFeatured(req, res) {
    try {
      const featured = await FeaturedModel.getAllFeatured();
      res.status(200).json({
        success: true,
        message: "Featured items retrieved successfully",
        data: featured,
        count: featured.length,
      });
    } catch (error) {
      console.error("Error in getAllFeatured:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve featured items",
        error: error.message,
      });
    }
  }

  // GET /api/featured/active - Get only active featured items (show = true)
  static async getActiveFeatured(req, res) {
    try {
      const featured = await FeaturedModel.getActiveFeatured();
      res.status(200).json({
        success: true,
        message: "Active featured items retrieved successfully",
        data: featured,
        count: featured.length,
      });
    } catch (error) {
      console.error("Error in getActiveFeatured:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve active featured items",
        error: error.message,
      });
    }
  }

  // GET /api/featured/:id - Get featured item by ID
  static async getFeaturedById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid featured ID is required",
        });
      }

      const featured = await FeaturedModel.getFeaturedById(id);

      if (!featured) {
        return res.status(404).json({
          success: false,
          message: "Featured item not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Featured item retrieved successfully",
        data: featured,
      });
    } catch (error) {
      console.error("Error in getFeaturedById:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve featured item",
        error: error.message,
      });
    }
  }

  // GET /api/featured/category/:category - Get featured items by category
  static async getFeaturedByCategory(req, res) {
    try {
      const { category } = req.params;

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      const featured = await FeaturedModel.getFeaturedByCategory(category);

      res.status(200).json({
        success: true,
        message: `Featured items for category '${category}' retrieved successfully`,
        data: featured,
        count: featured.length,
      });
    } catch (error) {
      console.error("Error in getFeaturedByCategory:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve featured items by category",
        error: error.message,
      });
    }
  }

  // POST /api/featured - Create new featured item
  static async createFeatured(req, res) {
    try {
      const { category, image, show } = req.body;

      // Validation
      if (!category || !image) {
        return res.status(400).json({
          success: false,
          message: "Category and image are required fields",
        });
      }

      // Validate if category exists
      const categoryExists = await FeaturedModel.validateCategory(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category. Category does not exist or is not available.",
        });
      }

      const featuredData = { category, image, show };
      const newFeatured = await FeaturedModel.createFeatured(featuredData);

      res.status(201).json({
        success: true,
        message: "Featured item created successfully",
        data: newFeatured,
      });
    } catch (error) {
      console.error("Error in createFeatured:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create featured item",
        error: error.message,
      });
    }
  }

  // PUT /api/featured/:id - Update featured item
  static async updateFeatured(req, res) {
    try {
      const { id } = req.params;
      const { category, image, show } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid featured ID is required",
        });
      }

      // Check if featured item exists
      const existingFeatured = await FeaturedModel.getFeaturedById(id);
      if (!existingFeatured) {
        return res.status(404).json({
          success: false,
          message: "Featured item not found",
        });
      }

      // Validate category if provided
      if (category) {
        const categoryExists = await FeaturedModel.validateCategory(category);
        if (!categoryExists) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid category. Category does not exist or is not available.",
          });
        }
      }

      const featuredData = {
        category: category || existingFeatured.category,
        image: image || existingFeatured.image,
        show: show !== undefined ? show : existingFeatured.show,
      };

      const updatedFeatured = await FeaturedModel.updateFeatured(
        id,
        featuredData
      );

      res.status(200).json({
        success: true,
        message: "Featured item updated successfully",
        data: updatedFeatured,
      });
    } catch (error) {
      console.error("Error in updateFeatured:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update featured item",
        error: error.message,
      });
    }
  }

  // PATCH /api/featured/:id/toggle - Toggle show status
  static async toggleShowStatus(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid featured ID is required",
        });
      }

      const updatedFeatured = await FeaturedModel.toggleShowStatus(id);

      if (!updatedFeatured) {
        return res.status(404).json({
          success: false,
          message: "Featured item not found",
        });
      }

      res.status(200).json({
        success: true,
        message: `Featured item ${
          updatedFeatured.show ? "shown" : "hidden"
        } successfully`,
        data: updatedFeatured,
      });
    } catch (error) {
      console.error("Error in toggleShowStatus:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle show status",
        error: error.message,
      });
    }
  }

  // DELETE /api/featured/:id - Delete featured item
  static async deleteFeatured(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid featured ID is required",
        });
      }

      const deletedFeatured = await FeaturedModel.deleteFeatured(id);

      if (!deletedFeatured) {
        return res.status(404).json({
          success: false,
          message: "Featured item not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Featured item deleted successfully",
        data: deletedFeatured,
      });
    } catch (error) {
      console.error("Error in deleteFeatured:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete featured item",
        error: error.message,
      });
    }
  }
}

module.exports = FeaturedController;
