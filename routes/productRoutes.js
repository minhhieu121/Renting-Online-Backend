const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsBySeller,
  updateProduct,
  deleteProduct,
  getCategories
} = require('../controllers/productController');

const router = express.Router();

// Category routes
router.get('/categories/list', getCategories);

// Product CRUD routes
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/seller/:sellerId', getProductsBySeller);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;

