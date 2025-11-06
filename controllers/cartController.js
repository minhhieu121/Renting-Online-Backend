const cartModel = require('../models/Cart');
// const userModel = require('../models/User');
const productModel = require('../models/Product');

// @desc   Get cart for user
// @route  GET /api/cart/my-cart
// @access Private/User
const getCart = async (req, res, next) => {
    try {
        // 1. Get the ID from the logged-in user, NOT the body
        const userId = req.user.user_id;

        // 2. Check if the user already has an "open" cart
        let cart = await cartModel.getOpenCartByUserId(userId);

        // 3. If they do, just return that cart
        if (cart) {
            return res.status(200).json({
                success: true,
                message: 'Cart retrieved successfully',
                data: cart
            });
        }

        // 4. If they don't, create a new one
        cart = await cartModel.createCart(userId);
        
        res.status(201).json({
            success: true,
            message: 'New cart created successfully',
            data: cart
        });

    } catch (error) {
        console.error('Get/Create cart error:', error);
        // 5. Pass to your main error handler
        next(error); 
    }
}

// @desc   Add item to cart
// @route  POST /api/cart/
// @access Private/User
const addItemToCart = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const cart = await cartModel.getOpenCartByUserId(userId);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        const { productId, quantity, rentTime } = req.body;
        const product = await productModel.getProductById(productId);
        const productData = {
            productId: product.product_id,
            name: product.name,
            unit_price: product.price_per_day,
            sale_percent: product.sale_percentage
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        const newItem = await cartModel.addItemToCart(cart.id, productData, quantity, rentTime);
        res.status(201).json({
            success: true,
            message: 'Item added to cart successfully',
            data: newItem
        });

    } catch (error) {
        console.error('Add item to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding item to cart',
            error: error.message
        });
    }
};

// @desc Delete cart item
// @route DELETE /api/cart/items/:cartItemId
// @access Private/User
const deleteCartItem = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const cart = await cartModel.getOpenCartByUserId(userId);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        const { cartItemId } = req.params;
        const cartItem = await cartModel.getCartItemById(cartItemId, cart.id);
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }
        //What if the delete twice?

        await cartModel.deleteCartItem(cartItemId, cart.id, cartItem);
        res.status(200).json({
            success: true,
            message: 'Cart item deleted successfully'
        });
    } catch (error) {
        console.error('Delete cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting cart item',
            error: error.message
        });
    }
}

//@desc Get cart items
//@route GET /api/cart/items
//@Access Private/User

const getCartItems = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const cart = await cartModel.getOpenCartByUserId(userId);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        const items = await cartModel.getCartItems(cart.id);
        if (!items) {
            return res.status(404).json({
                success: false,
                message: 'No items found in cart'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Cart items retrieved successfully',
            data: items
        });
    } catch (error) {
        console.error('Get cart items error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving cart items',
            error: error.message
        });
    }
}

//@desc Get cart items
//@route GET /api/cart/items/:cartItemId
//@Access Private/User

const getCartItemById = async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const userId = req.user.user_id;
        const cart = await cartModel.getOpenCartByUserId(userId);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        const item = await cartModel.getCartItemById(cartItemId, cart.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Cart item retrieved successfully',
            data: item
        });
    } catch (error) {
        console.error('Get cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving cart item',
            error: error.message
        });
    }
}


module.exports = {
    getCart,
    addItemToCart,
    deleteCartItem,
    getCartItems,
    getCartItemById
};