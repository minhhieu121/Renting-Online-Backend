const reviewModel = require("../models/Review");
const productModel = require("../models/Product");

const EXPERIENCE_FIELDS = [
  "fit",
  "quality",
  "easeOfUse",
  "style",
  "worthThePrice",
];

const allowedSatisfactionValues = new Set([
  "loved-it",
  "liked-it",
  "it-was-okay",
  "not-great",
  "terrible",
]);

const buildExperiencePayload = (experience, { fallbackToDefaults = false } = {}) => {
  if (!experience && !fallbackToDefaults) {
    return undefined;
  }

  const source = experience || {};
  return EXPERIENCE_FIELDS.reduce((acc, field) => {
    acc[field] = Boolean(source[field]);
    return acc;
  }, {});
};

const ensurePhotosPayload = (photos, { fallbackToEmpty = false } = {}) => {
  if (!photos && !fallbackToEmpty) return undefined;
  if (!Array.isArray(photos)) return fallbackToEmpty ? [] : undefined;

  return photos
    .map((photo) => {
      if (typeof photo === "string") return photo.trim();
      if (photo && typeof photo.url === "string") return photo.url.trim();
      return null;
    })
    .filter(Boolean);
};

const validateCreatePayload = (payload = {}) => {
  const errors = [];

  if (!payload.productId) {
    errors.push("productId is required.");
  }

  if (!payload.satisfaction) {
    errors.push("satisfaction is required.");
  } else if (!allowedSatisfactionValues.has(payload.satisfaction)) {
    errors.push("satisfaction contains an unsupported value.");
  }

  if (payload.highlights && payload.highlights.length > 2000) {
    errors.push("highlights must be 2000 characters or fewer.");
  }

  if (payload.improvements && payload.improvements.length > 2000) {
    errors.push("improvements must be 2000 characters or fewer.");
  }

  return errors;
};

const createReview = async (req, res) => {
  try {
    const reviewerId = req.user?.user_id;
    const payload = req.body || {};
    const validationErrors = validateCreatePayload(payload);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid review payload",
        errors: validationErrors,
      });
    }

    const product = await productModel.getProductById(payload.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (payload.orderNumber) {
      const existing = await reviewModel.getReviewByOrderNumber(
        payload.orderNumber,
        reviewerId
      );
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Review already exists for this order",
          data: existing,
        });
      }
    }

    const review = await reviewModel.createReview({
      reviewerId,
      productId: payload.productId,
      orderNumber: payload.orderNumber,
      satisfaction: payload.satisfaction,
      experience: buildExperiencePayload(payload.experience, {
        fallbackToDefaults: true,
      }),
      highlights: payload.highlights,
      improvements: payload.improvements,
      photos: ensurePhotosPayload(payload.photos, {
        fallbackToEmpty: true,
      }),
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating review",
      error: error.message,
    });
  }
};

const getReviewSummaryByOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const reviewerId = req.user?.user_id;

    const review = await reviewModel.getReviewByOrderNumber(
      orderNumber,
      reviewerId
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found for order",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Get review by order error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching review",
      error: error.message,
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = "latest",
    } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 50);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (numericPage - 1) * numericLimit;

    const product = await productModel.getProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const [reviews, total, stats] = await Promise.all([
      reviewModel.getReviewsByProduct(productId, {
        limit: numericLimit,
        offset,
        sort,
      }),
      reviewModel.countReviewsByProduct(productId),
      reviewModel.getReviewStatsForProduct(productId),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: numericPage,
        limit: numericLimit,
        totalPages: Math.ceil(total / numericLimit),
      },
      stats,
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviewerId = req.user?.user_id;
    const { page = 1, limit = 10 } = req.query;

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 50);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (numericPage - 1) * numericLimit;

    const reviews = await reviewModel.getReviewsByUser(reviewerId, {
      limit: numericLimit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: numericPage,
        limit: numericLimit,
      },
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const reviewerId = req.user?.user_id;

    const review = await reviewModel.updateReview(
      reviewId,
      reviewerId,
      {
        experience: buildExperiencePayload(req.body.experience),
        highlights: req.body.highlights,
        improvements: req.body.improvements,
        photos: ensurePhotosPayload(req.body.photos),
      }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you do not have permission to edit it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating review",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const deleted = await reviewModel.deleteReview(reviewId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting review",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getReviewSummaryByOrder,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
