const express = require('express');
const { verifySession, verifyRole } = require('../middleware/auth');
const {
  createReview,
  getReviewSummaryByOrder,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();

router.post(
  '/',
  verifySession,
  verifyRole(['customer', 'seller']),
  createReview
);

router.get(
  '/order/:orderNumber',
  verifySession,
  getReviewSummaryByOrder
);

router.get(
  '/product/:productId',
  getProductReviews
);

router.get(
  '/me',
  verifySession,
  getMyReviews
);

router.put(
  '/:reviewId',
  verifySession,
  updateReview
);

router.delete(
  '/:reviewId',
  verifySession,
  verifyRole(['admin']),
  deleteReview
);

module.exports = router;
