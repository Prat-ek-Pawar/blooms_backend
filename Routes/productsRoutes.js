// routes/productsRoutes.js
const express = require("express");
const ProductsController = require("../Controllers/productsController");

const router = express.Router();

// GET Routes - Order matters! More specific routes should come first
router.get("/available", ProductsController.getAvailableProducts); // Get available products only
router.get("/in-stock", ProductsController.getInStockProducts); // Get products with stock > 0
router.get("/out-of-stock", ProductsController.getOutOfStockProducts); // Get products with stock = 0
router.get("/featured", ProductsController.getFeaturedProducts); // Get featured products (high rating)
router.get("/low-stock", ProductsController.getLowStockProducts); // Get low stock products
router.get("/search/:searchTerm", ProductsController.searchProducts); // Search products by name
router.get("/category/:category", ProductsController.getProductsByCategory); // Get products by category
router.get(
  "/price/:minPrice/:maxPrice",
  ProductsController.getProductsByPriceRange
); // Get products by price range
router.get("/rating/:minRating", ProductsController.getProductsByRating); // Get products by minimum rating
router.get("/:id", ProductsController.getProductById); // Get product by ID
router.get("/", ProductsController.getAllProducts); // Get all products (with optional pagination & filters)

// POST Routes
router.post("/", ProductsController.createProduct); // Create new product

// PUT Routes
router.put("/:id", ProductsController.updateProduct); // Update product

// PATCH Routes
router.patch("/:id/stock", ProductsController.updateStock); // Update product stock
router.patch("/:id/price", ProductsController.updatePrice); // Update product price
router.patch("/:id/rating", ProductsController.updateRating); // Update product rating & reviews
router.patch("/:id/toggle", ProductsController.toggleAvailability); // Toggle availability status

// DELETE Routes
router.delete("/:id", ProductsController.deleteProduct); // Delete product

module.exports = router;
