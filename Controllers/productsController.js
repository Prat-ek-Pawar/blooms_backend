// controllers/productsController.js
const ProductsModel = require("../Models/productsModel");

class ProductsController {
  // GET /api/products - Get all products with optional pagination and filters
  static async getAllProducts(req, res) {
    try {
      const {
        page,
        limit,
        category,
        available,
        minPrice,
        maxPrice,
        minRating,
        inStock,
      } = req.query;

      // If pagination parameters are provided, use pagination
      if (page || limit) {
        const filters = {
          category,
          available: available !== undefined ? available === "true" : undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          minRating: minRating ? parseFloat(minRating) : undefined,
          inStock: inStock === "true",
        };

        const result = await ProductsModel.getProductsWithPagination(
          parseInt(page) || 1,
          parseInt(limit) || 10,
          filters
        );

        return res.status(200).json({
          success: true,
          message: "Products retrieved successfully",
          data: result.products,
          pagination: result.pagination,
        });
      }

      // Otherwise, get all products
      const products = await ProductsModel.getAllProducts();
      res.status(200).json({
        success: true,
        message: "Products retrieved successfully",
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products",
        error: error.message,
      });
    }
  }

  // GET /api/products/available - Get only available products (includes products with 0 stock but marked as available)
  static async getAvailableProducts(req, res) {
    try {
      const products = await ProductsModel.getAvailableProducts();
      res.status(200).json({
        success: true,
        message: "Available products retrieved successfully",
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error("Error in getAvailableProducts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve available products",
        error: error.message,
      });
    }
  }

  // GET /api/products/in-stock - Get products with stock > 0
  static async getInStockProducts(req, res) {
    try {
      const products = await ProductsModel.getInStockProducts();
      res.status(200).json({
        success: true,
        message: "In-stock products retrieved successfully",
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error("Error in getInStockProducts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve in-stock products",
        error: error.message,
      });
    }
  }

  // GET /api/products/out-of-stock - Get products with stock = 0
  static async getOutOfStockProducts(req, res) {
    try {
      const products = await ProductsModel.getOutOfStockProducts();
      res.status(200).json({
        success: true,
        message: "Out-of-stock products retrieved successfully",
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error("Error in getOutOfStockProducts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve out-of-stock products",
        error: error.message,
      });
    }
  }

  // GET /api/products/featured - Get featured products
  static async getFeaturedProducts(req, res) {
    try {
      const { limit } = req.query;
      const products = await ProductsModel.getFeaturedProducts(
        parseInt(limit) || 10
      );
      res.status(200).json({
        success: true,
        message: "Featured products retrieved successfully",
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error("Error in getFeaturedProducts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve featured products",
        error: error.message,
      });
    }
  }

  // GET /api/products/low-stock - Get low stock products
  static async getLowStockProducts(req, res) {
    try {
      const { threshold } = req.query;
      const products = await ProductsModel.getLowStockProducts(
        parseInt(threshold) || 5
      );
      res.status(200).json({
        success: true,
        message: "Low stock products retrieved successfully",
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error("Error in getLowStockProducts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve low stock products",
        error: error.message,
      });
    }
  }

  // GET /api/products/:id - Get product by ID
  static async getProductById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
      }

      const product = await ProductsModel.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Product retrieved successfully",
        data: product,
      });
    } catch (error) {
      console.error("Error in getProductById:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve product",
        error: error.message,
      });
    }
  }

  // GET /api/products/category/:category - Get products by category
  static async getProductsByCategory(req, res) {
    try {
      const { category } = req.params;

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      const products = await ProductsModel.getProductsByCategory(category);

      res.status(200).json({
        success: true,
        message: `Products for category '${category}' retrieved successfully`,
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error("Error in getProductsByCategory:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products by category",
        error: error.message,
      });
    }
  }

  // GET /api/products/price/:minPrice/:maxPrice - Get products by price range
  static async getProductsByPriceRange(req, res) {
    try {
      const { minPrice, maxPrice } = req.params;

      if (!minPrice || !maxPrice || isNaN(minPrice) || isNaN(maxPrice)) {
        return res.status(400).json({
          success: false,
          message: "Valid minimum and maximum prices are required",
        });
      }

      if (parseFloat(minPrice) > parseFloat(maxPrice)) {
        return res.status(400).json({
          success: false,
          message: "Minimum price cannot be greater than maximum price",
        });
      }

      const products = await ProductsModel.getProductsByPriceRange(
        parseFloat(minPrice),
        parseFloat(maxPrice)
      );

      res.status(200).json({
        success: true,
        message: `Products in price range ₹${minPrice} - ₹${maxPrice} retrieved successfully`,
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error("Error in getProductsByPriceRange:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products by price range",
        error: error.message,
      });
    }
  }

  // GET /api/products/rating/:minRating - Get products by minimum rating
  static async getProductsByRating(req, res) {
    try {
      const { minRating } = req.params;

      if (!minRating || isNaN(minRating)) {
        return res.status(400).json({
          success: false,
          message: "Valid minimum rating is required",
        });
      }

      if (parseFloat(minRating) < 0 || parseFloat(minRating) > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 0 and 5",
        });
      }

      const products = await ProductsModel.getProductsByRating(
        parseFloat(minRating)
      );

      res.status(200).json({
        success: true,
        message: `Products with rating ≥ ${minRating} retrieved successfully`,
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error("Error in getProductsByRating:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products by rating",
        error: error.message,
      });
    }
  }

  // GET /api/products/search/:searchTerm - Search products
  static async searchProducts(req, res) {
    try {
      const { searchTerm } = req.params;

      if (!searchTerm || searchTerm.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        });
      }

      const products = await ProductsModel.searchProducts(searchTerm.trim());

      res.status(200).json({
        success: true,
        message: `Products matching '${searchTerm}' retrieved successfully`,
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error("Error in searchProducts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search products",
        error: error.message,
      });
    }
  }

  // POST /api/products - Create new product
  static async createProduct(req, res) {
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
      } = req.body;

      // Validation
      if (!category || !product_name || !price || !image) {
        return res.status(400).json({
          success: false,
          message:
            "Category, product name, price, and image are required fields",
        });
      }

      if (parseFloat(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative",
        });
      }

      if (stock && parseInt(stock) < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock cannot be negative",
        });
      }

      if (rating && (parseFloat(rating) < 0 || parseFloat(rating) > 5)) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 0 and 5",
        });
      }

      // Validate if category exists
      const categoryExists = await ProductsModel.validateCategory(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category. Category does not exist or is not available.",
        });
      }

      const productData = {
        category,
        product_name: product_name.trim(),
        stock: parseInt(stock) || 0,
        price: parseFloat(price),
        available: available !== undefined ? available : true,
        image,
        rating: parseFloat(rating) || 0.0,
        reviews: parseInt(reviews) || 0,
      };

      const newProduct = await ProductsModel.createProduct(productData);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: newProduct,
      });
    } catch (error) {
      console.error("Error in createProduct:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create product",
        error: error.message,
      });
    }
  }

  // PUT /api/products/:id - Update product
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const {
        category,
        product_name,
        stock,
        price,
        available,
        image,
        rating,
        reviews,
      } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
      }

      // Check if product exists
      const existingProduct = await ProductsModel.getProductById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Validate category if provided
      if (category) {
        const categoryExists = await ProductsModel.validateCategory(category);
        if (!categoryExists) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid category. Category does not exist or is not available.",
          });
        }
      }

      // Validate price if provided
      if (price && parseFloat(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative",
        });
      }

      // Validate stock if provided
      if (stock && parseInt(stock) < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock cannot be negative",
        });
      }

      // Validate rating if provided
      if (rating && (parseFloat(rating) < 0 || parseFloat(rating) > 5)) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 0 and 5",
        });
      }

      const productData = {
        category: category || existingProduct.category,
        product_name: product_name
          ? product_name.trim()
          : existingProduct.product_name,
        stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        available:
          available !== undefined ? available : existingProduct.available,
        image: image || existingProduct.image,
        rating:
          rating !== undefined ? parseFloat(rating) : existingProduct.rating,
        reviews:
          reviews !== undefined ? parseInt(reviews) : existingProduct.reviews,
      };

      const updatedProduct = await ProductsModel.updateProduct(id, productData);

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Error in updateProduct:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product",
        error: error.message,
      });
    }
  }

  // PATCH /api/products/:id/stock - Update product stock
  static async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
      }

      if (stock === undefined || isNaN(stock) || parseInt(stock) < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid stock quantity is required and cannot be negative",
        });
      }

      const updatedProduct = await ProductsModel.updateStock(
        id,
        parseInt(stock)
      );

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Product stock updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Error in updateStock:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product stock",
        error: error.message,
      });
    }
  }

  // PATCH /api/products/:id/price - Update product price
  static async updatePrice(req, res) {
    try {
      const { id } = req.params;
      const { price } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
      }

      if (price === undefined || isNaN(price) || parseFloat(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid price is required and cannot be negative",
        });
      }

      const updatedProduct = await ProductsModel.updatePrice(
        id,
        parseFloat(price)
      );

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Product price updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Error in updatePrice:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product price",
        error: error.message,
      });
    }
  }

  // PATCH /api/products/:id/rating - Update product rating and reviews
  static async updateRating(req, res) {
    try {
      const { id } = req.params;
      const { rating, reviews } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
      }

      if (
        rating === undefined ||
        isNaN(rating) ||
        parseFloat(rating) < 0 ||
        parseFloat(rating) > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid rating between 0 and 5 is required",
        });
      }

      if (reviews === undefined || isNaN(reviews) || parseInt(reviews) < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid reviews count is required and cannot be negative",
        });
      }

      const updatedProduct = await ProductsModel.updateRating(
        id,
        parseFloat(rating),
        parseInt(reviews)
      );

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Product rating updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Error in updateRating:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product rating",
        error: error.message,
      });
    }
  }

  // PATCH /api/products/:id/toggle - Toggle availability status
  static async toggleAvailability(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
      }

      const updatedProduct = await ProductsModel.toggleAvailability(id);

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message: `Product ${
          updatedProduct.available ? "enabled" : "disabled"
        } successfully`,
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Error in toggleAvailability:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle product availability",
        error: error.message,
      });
    }
  }

  // DELETE /api/products/:id - Delete product
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
      }

      const deletedProduct = await ProductsModel.deleteProduct(id);

      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        data: deletedProduct,
      });
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete product",
        error: error.message,
      });
    }
  }
}

module.exports = ProductsController;
