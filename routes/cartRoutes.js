const express = require('express');

const {
    getCart,
    addItemToCart,
    deleteCartItem,
    getCartItems,
    getCartItemById
} = require('../controllers/cartController');

const router = express.Router();

// Cart routes
router.get('/my-cart', getCart);
router.get('/:cartId/items', getCartItems);
router.get('/:cartId/items/:cartItemId', getCartItemById);
router.post('/:cartId', addItemToCart);
router.delete('/:cartId', deleteCartItem);

module.exports = router;