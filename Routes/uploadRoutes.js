// routes/uploadRoutes.js
const express = require("express");
const UploadController = require("../Controllers/uploadController");
const router = express.Router();

// POST /api/upload/image - Upload single image
// Usage: POST http://localhost:3000/api/upload/image
// Body: form-data with key "image" and file value
// Optional: ?folder=products (to organize in specific folder)
router.post("/image", UploadController.uploadImage);

// POST /api/upload/images - Upload multiple images (max 5)
// Usage: POST http://localhost:3000/api/upload/images
// Body: form-data with key "images" and multiple file values
// Optional: ?folder=gallery (to organize in specific folder)
router.post("/images", UploadController.uploadMultipleImages);

// DELETE /api/upload/image - Delete image from Cloudinary
// Usage: DELETE http://localhost:3000/api/upload/image
// Body: JSON with { "publicId": "folder/filename" }
router.delete("/image", UploadController.deleteImage);

module.exports = router;
