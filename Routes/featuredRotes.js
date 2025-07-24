// routes/featuredRoutes.js
const express = require("express");
const FeaturedController = require("../Controllers/featuredController");

const router = express.Router();

// GET Routes - Order matters! More specific routes should come first
router.get("/active", FeaturedController.getActiveFeatured); // Get active featured items only
router.get("/category/:category", FeaturedController.getFeaturedByCategory); // Get featured items by category
router.get("/:id", FeaturedController.getFeaturedById); // Get featured item by ID
router.get("/", FeaturedController.getAllFeatured); // Get all featured items

// POST Routes
router.post("/", FeaturedController.createFeatured); // Create new featured item

// PUT Routes
router.put("/:id", FeaturedController.updateFeatured); // Update featured item

// PATCH Routes
router.patch("/:id/toggle", FeaturedController.toggleShowStatus); // Toggle show status

// DELETE Routes
router.delete("/:id", FeaturedController.deleteFeatured); // Delete featured item

module.exports = router;
