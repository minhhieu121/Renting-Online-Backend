const productModel = require('../models/Product');
const userModel = require('../models/User');

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = async (req, res) => {
  try {
    const {
      sellerId,
      name,
      description,
      category,
      pricePerDay,
      salePercentage,
      images,
      location,
      condition,
    } = req.body;

    // Verify seller exists
    const seller = await userModel.getUserById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Create product
    const product = await productModel.createProduct({
      sellerId,
      name,
      description,
      category,
      pricePerDay,
      salePercentage,
      images,
      location,
      condition,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      minPrice,
      maxPrice,
      location,
      search,
      condition,
      rating,
      sortBy = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    const filters = {
      category,
      status,
      minPrice,
      maxPrice,
      location,
      search,
      condition,
      rating,
      sortBy,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const products = await productModel.searchProducts(filters);
    const total = await productModel.countProducts(filters);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// @desc    Get products by seller
// @route   GET /api/products/seller/:sellerId
// @access  Public
const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const products = await productModel.getProductsBySeller(
      sellerId,
      parseInt(limit),
      parseInt(offset)
    );

    // Count total for pagination
    const filters = { sellerId };
    const total = await productModel.countProducts(filters);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller products',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Seller
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates.product_id;
    delete updates.seller_id;
    delete updates.total_rentals;
    delete updates.total_reviews;
    delete updates.created_at;
    delete updates.updated_at;

    const product = await productModel.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = await productModel.updateProduct(id, updates);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await productModel.deleteProduct(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = ['Electronics', 'Clothes', 'Furniture', 'Sports', 'Books', 'Tools', 'Vehicles', 'Other'];
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsBySeller,
  updateProduct,
  deleteProduct,
  getCategories,
};

