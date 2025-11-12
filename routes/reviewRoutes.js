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
  '/order/:orderId',
  verifySession,
  // logReviewOrderRequest,
  getReviewSummaryByOrder
);

router.get(
  '/product/:productId',
  getProductReviews
);

// Temporarily disabled until frontend consumes this endpoint
// router.get(
//   '/me',
//   verifySession,
//   getMyReviews
// );

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
