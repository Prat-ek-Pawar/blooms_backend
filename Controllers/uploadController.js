// controllers/uploadController.js
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const cloudinary = require("../Config/cloudinaryConfig");

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/temp");
    try {
      // Ensure temp directory exists
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `upload-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed!"),
      false
    );
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Single file upload
  },
});

class UploadController {
  // Upload single image and return URLs
  static async uploadImage(req, res) {
    try {
      console.log("🚀 Starting image upload process...");

      // Handle file upload with multer
      upload.single("image")(req, res, async (err) => {
        if (err) {
          console.error("❌ Multer error:", err.message);

          if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
              return res.status(400).json({
                success: false,
                message: "File too large. Maximum size is 5MB.",
              });
            }
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
              return res.status(400).json({
                success: false,
                message: "No file uploaded. Please select an image file.",
              });
            }
          }

          return res.status(400).json({
            success: false,
            message: err.message || "File upload failed",
          });
        }

        // Check if file was uploaded
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "No file uploaded. Please select an image file.",
          });
        }

        console.log("📁 File received:", {
          originalname: req.file.originalname,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: req.file.path,
        });

        try {
          // Get folder from query parameter or use default
          const folder = req.query.folder || "uploads";

          console.log(`🔄 Uploading to Cloudinary folder: ${folder}`);

          // Upload to Cloudinary
          const cloudinaryResult = await cloudinary.uploader.upload(
            req.file.path,
            {
              folder: folder,
              use_filename: true,
              unique_filename: true,
              overwrite: false,
              resource_type: "image",
              quality: "auto",
              fetch_format: "auto",
            }
          );

          console.log(
            "✅ Cloudinary upload successful:",
            cloudinaryResult.public_id
          );

          // Generate different image sizes
          const publicId = cloudinaryResult.public_id;
          const imageUrls = {
            original: cloudinaryResult.secure_url,
            large: cloudinary.url(publicId, {
              width: 800,
              height: 600,
              crop: "fill",
              quality: "auto",
              fetch_format: "auto",
            }),
            medium: cloudinary.url(publicId, {
              width: 400,
              height: 300,
              crop: "fill",
              quality: "auto",
              fetch_format: "auto",
            }),
            small: cloudinary.url(publicId, {
              width: 200,
              height: 150,
              crop: "fill",
              quality: "auto",
              fetch_format: "auto",
            }),
            thumbnail: cloudinary.url(publicId, {
              width: 100,
              height: 100,
              crop: "fill",
              quality: "auto",
              fetch_format: "auto",
            }),
          };

          // Clean up temporary file
          try {
            await fs.unlink(req.file.path);
            console.log("🗑️ Temporary file cleaned up");
          } catch (cleanupError) {
            console.error(
              "⚠️ Failed to cleanup temp file:",
              cleanupError.message
            );
          }

          console.log("🎉 Image upload completed successfully");

          // Return success response with all image data
          res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: {
              imageUrls: imageUrls,
              publicId: cloudinaryResult.public_id,
              originalFilename: req.file.originalname,
              fileSize: req.file.size,
              uploadedAt: new Date().toISOString(),
              folder: folder,
            },
          });
        } catch (cloudinaryError) {
          console.error("❌ Cloudinary error:", cloudinaryError);

          // Clean up temp file on error
          try {
            if (req.file && req.file.path) {
              await fs.unlink(req.file.path);
            }
          } catch (cleanupError) {
            console.error("Failed to cleanup temp file:", cleanupError);
          }

          return res.status(500).json({
            success: false,
            message: "Failed to upload image to cloud storage",
            error: cloudinaryError.message,
          });
        }
      });
    } catch (error) {
      console.error("❌ Upload controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during image upload",
        error: error.message,
      });
    }
  }

  // Upload multiple images (optional)
  static async uploadMultipleImages(req, res) {
    try {
      console.log("🚀 Starting multiple image upload process...");

      // Handle multiple file upload
      upload.array("images", 5)(req, res, async (err) => {
        if (err) {
          console.error("❌ Multer error:", err.message);
          return res.status(400).json({
            success: false,
            message: err.message || "File upload failed",
          });
        }

        if (!req.files || req.files.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No files uploaded. Please select image files.",
          });
        }

        console.log(`📁 ${req.files.length} files received`);

        try {
          const folder = req.query.folder || "uploads";
          const uploadPromises = req.files.map(async (file) => {
            try {
              console.log(`🔄 Uploading ${file.originalname}...`);

              const cloudinaryResult = await cloudinary.uploader.upload(
                file.path,
                {
                  folder: folder,
                  use_filename: true,
                  unique_filename: true,
                  overwrite: false,
                  resource_type: "image",
                  quality: "auto",
                  fetch_format: "auto",
                }
              );

              const publicId = cloudinaryResult.public_id;
              const imageUrls = {
                original: cloudinaryResult.secure_url,
                medium: cloudinary.url(publicId, {
                  width: 400,
                  height: 300,
                  crop: "fill",
                  quality: "auto",
                  fetch_format: "auto",
                }),
                small: cloudinary.url(publicId, {
                  width: 200,
                  height: 150,
                  crop: "fill",
                  quality: "auto",
                  fetch_format: "auto",
                }),

              };

              // Clean up temp file
              try {
                await fs.unlink(file.path);
              } catch (cleanupError) {
                console.error(
                  "⚠️ Failed to cleanup temp file:",
                  cleanupError.message
                );
              }

              return {
                success: true,
                imageUrls: imageUrls,
                publicId: cloudinaryResult.public_id,
                originalFilename: file.originalname,
                fileSize: file.size,
              };
            } catch (error) {
              console.error(`❌ Failed to upload ${file.originalname}:`, error);

              // Clean up temp file on error
              try {
                await fs.unlink(file.path);
              } catch (cleanupError) {
                console.error("Failed to cleanup temp file:", cleanupError);
              }

              return {
                success: false,
                originalFilename: file.originalname,
                error: error.message,
              };
            }
          });

          const results = await Promise.all(uploadPromises);
          const successful = results.filter((r) => r.success);
          const failed = results.filter((r) => !r.success);

          console.log(
            `✅ Upload completed: ${successful.length} successful, ${failed.length} failed`
          );

          res.status(200).json({
            success: true,
            message: `Uploaded ${successful.length} of ${results.length} images successfully`,
            data: {
              successful: successful,
              failed: failed,
              summary: {
                total: results.length,
                successful: successful.length,
                failed: failed.length,
              },
            },
          });
        } catch (error) {
          console.error("❌ Multiple upload error:", error);

          // Clean up all temp files on error
          if (req.files) {
            req.files.forEach(async (file) => {
              try {
                await fs.unlink(file.path);
              } catch (cleanupError) {
                console.error("Failed to cleanup temp file:", cleanupError);
              }
            });
          }

          res.status(500).json({
            success: false,
            message: "Failed to upload images",
            error: error.message,
          });
        }
      });
    } catch (error) {
      console.error("❌ Multiple upload controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during image upload",
        error: error.message,
      });
    }
  }

  // Delete image from Cloudinary
  static async deleteImage(req, res) {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: "Public ID is required to delete image",
        });
      }

      console.log("🗑️ Deleting image from Cloudinary:", publicId);

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === "ok") {
        console.log("✅ Image deleted successfully");
        res.status(200).json({
          success: true,
          message: "Image deleted successfully",
          data: {
            publicId: publicId,
            result: result.result,
          },
        });
      } else {
        console.log("⚠️ Image not found or already deleted");
        res.status(404).json({
          success: false,
          message: "Image not found or already deleted",
          data: {
            publicId: publicId,
            result: result.result,
          },
        });
      }
    } catch (error) {
      console.error("❌ Delete image error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete image",
        error: error.message,
      });
    }
  }
}

module.exports = UploadController;
