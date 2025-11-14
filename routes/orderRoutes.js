const express = require('express');
const { verifySession, verifyRole } = require('../middleware/auth');
const {
  getOrders,
  getOrderByNumber,
  createOrder,
  getSellerOrders,
  getSellerOrderByNumber,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

router.use(verifySession);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/seller', verifyRole(['seller']), getSellerOrders);
router.get('/seller/:orderNumber', verifyRole(['seller']), getSellerOrderByNumber);
router.patch('/:orderNumber/status', verifyRole(['seller']), updateOrderStatus);
router.get('/:orderNumber', getOrderByNumber);

module.exports = router;
