const express = require('express');
const { verifySession } = require('../middleware/auth.js')

const {
    getCart,
    addItemToCart,
    deleteCartItem,
    getCartItems,
    getCartItemById
} = require('../controllers/cartController');

const router = express.Router();

// Cart routes
router.get('/my-cart', verifySession, getCart);
router.get('/items', verifySession, getCartItems);
router.get('/items/:cartItemId', verifySession, getCartItemById);
router.delete('/items/:cartItemId', verifySession, deleteCartItem);
router.post('/', verifySession, addItemToCart);

module.exports = router;