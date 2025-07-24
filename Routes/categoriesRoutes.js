// routes/categoriesRoutes.js
const express = require("express");
const CategoriesController = require("../Controllers/categoriesController");

const router = express.Router();

// GET Routes - Order matters! More specific routes should come first
router.get("/available", CategoriesController.getAvailableCategories); // Get available categories only
router.get("/search/:searchTerm", CategoriesController.searchCategories); // Search categories
router.get("/name/:categoryName", CategoriesController.getCategoryByName); // Get category by name
router.get("/:id/stats", CategoriesController.getCategoryStats); // Get category with statistics
router.get("/:id", CategoriesController.getCategoryById); // Get category by ID
router.get("/", CategoriesController.getAllCategories); // Get all categories

// POST Routes
router.post("/", CategoriesController.createCategory); // Create new category

// PUT Routes
router.put("/:id", CategoriesController.updateCategory); // Update category

// PATCH Routes
router.patch("/:id/toggle", CategoriesController.toggleAvailability); // Toggle availability status

// DELETE Routes
router.delete("/:id", CategoriesController.deleteCategory); // Delete category

module.exports = router;
