// controllers/categoriesController.js
const CategoriesModel = require("../Models/categoriesModel");

class CategoriesController {
  // GET /api/categories - Get all categories
  static async getAllCategories(req, res) {
    try {
      const categories = await CategoriesModel.getAllCategories();
      res.status(200).json({
        success: true,
        message: "Categories retrieved successfully",
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      console.error("Error in getAllCategories:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve categories",
        error: error.message,
      });
    }
  }

  // GET /api/categories/available - Get only available categories
  static async getAvailableCategories(req, res) {
    try {
      const categories = await CategoriesModel.getAvailableCategories();
      res.status(200).json({
        success: true,
        message: "Available categories retrieved successfully",
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      console.error("Error in getAvailableCategories:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve available categories",
        error: error.message,
      });
    }
  }

  // GET /api/categories/:id - Get category by ID
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid category ID is required",
        });
      }

      const category = await CategoriesModel.getCategoryById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Category retrieved successfully",
        data: category,
      });
    } catch (error) {
      console.error("Error in getCategoryById:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve category",
        error: error.message,
      });
    }
  }

  // GET /api/categories/name/:categoryName - Get category by name
  static async getCategoryByName(req, res) {
    try {
      const { categoryName } = req.params;

      if (!categoryName) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      const category = await CategoriesModel.getCategoryByName(categoryName);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Category retrieved successfully",
        data: category,
      });
    } catch (error) {
      console.error("Error in getCategoryByName:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve category",
        error: error.message,
      });
    }
  }

  // GET /api/categories/:id/stats - Get category with usage statistics
  static async getCategoryStats(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid category ID is required",
        });
      }

      const categoryStats = await CategoriesModel.getCategoryStats(id);

      if (!categoryStats) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Category statistics retrieved successfully",
        data: categoryStats,
      });
    } catch (error) {
      console.error("Error in getCategoryStats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve category statistics",
        error: error.message,
      });
    }
  }

  // GET /api/categories/search/:searchTerm - Search categories
  static async searchCategories(req, res) {
    try {
      const { searchTerm } = req.params;

      if (!searchTerm || searchTerm.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        });
      }

      const categories = await CategoriesModel.searchCategories(
        searchTerm.trim()
      );

      res.status(200).json({
        success: true,
        message: `Categories matching '${searchTerm}' retrieved successfully`,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      console.error("Error in searchCategories:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search categories",
        error: error.message,
      });
    }
  }

  // POST /api/categories - Create new category
  static async createCategory(req, res) {
    try {
      const { category_name, available } = req.body;

      // Validation
      if (!category_name || category_name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      // Check if category already exists
      const exists = await CategoriesModel.checkCategoryExists(
        category_name.trim()
      );
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Category with this name already exists",
        });
      }

      const categoryData = {
        category_name: category_name.trim(),
        available: available !== undefined ? available : true,
      };
      const newCategory = await CategoriesModel.createCategory(categoryData);

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: newCategory,
      });
    } catch (error) {
      console.error("Error in createCategory:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create category",
        error: error.message,
      });
    }
  }

  // PUT /api/categories/:id - Update category
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { category_name, available } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid category ID is required",
        });
      }

      // Check if category exists
      const existingCategory = await CategoriesModel.getCategoryById(id);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Validate category name if provided
      if (category_name) {
        const trimmedName = category_name.trim();
        if (trimmedName.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Category name cannot be empty",
          });
        }

        // Check if new name already exists (excluding current category)
        const nameExists = await CategoriesModel.checkCategoryExists(
          trimmedName,
          id
        );
        if (nameExists) {
          return res.status(409).json({
            success: false,
            message: "Category with this name already exists",
          });
        }
      }

      const categoryData = {
        category_name: category_name
          ? category_name.trim()
          : existingCategory.category_name,
        available:
          available !== undefined ? available : existingCategory.available,
      };

      const updatedCategory = await CategoriesModel.updateCategory(
        id,
        categoryData
      );

      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: updatedCategory,
      });
    } catch (error) {
      console.error("Error in updateCategory:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update category",
        error: error.message,
      });
    }
  }

  // PATCH /api/categories/:id/toggle - Toggle availability status
  static async toggleAvailability(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid category ID is required",
        });
      }

      const updatedCategory = await CategoriesModel.toggleAvailability(id);

      if (!updatedCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        success: true,
        message: `Category ${
          updatedCategory.available ? "enabled" : "disabled"
        } successfully`,
        data: updatedCategory,
      });
    } catch (error) {
      console.error("Error in toggleAvailability:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle category availability",
        error: error.message,
      });
    }
  }

  // DELETE /api/categories/:id - Delete category
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid category ID is required",
        });
      }

      const deletedCategory = await CategoriesModel.deleteCategory(id);

      if (!deletedCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        data: deletedCategory,
      });
    } catch (error) {
      console.error("Error in deleteCategory:", error);

      // Handle dependency error specifically
      if (error.message.includes("Cannot delete category")) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to delete category",
        error: error.message,
      });
    }
  }
}

module.exports = CategoriesController;
