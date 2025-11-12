const express = require('express');
const { verifySession } = require('../middleware/auth');
const { getOrders, getOrderByNumber, createOrder } = require('../controllers/orderController');

const router = express.Router();

router.use(verifySession);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:orderNumber', getOrderByNumber);

module.exports = router;
