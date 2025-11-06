const sql = require("../db");

const SATISFACTION_SCORES = {
  "loved-it": 5,
  "liked-it": 4,
  "it-was-okay": 3,
  "not-great": 2,
  "terrible": 1,
};

const EXPERIENCE_FIELDS = [
  "fit",
  "quality",
  "easeOfUse",
  "style",
  "worthThePrice",
];

const normalizeExperience = (experience, { fallbackToDefaults = false } = {}) => {
  if (!experience && !fallbackToDefaults) {
    return undefined;
  }

  const source = experience || {};
  return EXPERIENCE_FIELDS.reduce(
    (acc, field) => ({
      ...acc,
      [field]: Boolean(source[field]),
    }),
    {}
  );
};

const sanitizePhotos = (photos, { fallbackToEmpty = false } = {}) => {
  if (!Array.isArray(photos)) {
    return fallbackToEmpty ? [] : undefined;
  }

  return photos
    .map((photo) => {
      if (typeof photo === "string") {
        return photo.trim();
      }
      if (photo && typeof photo.url === "string") {
        return photo.url.trim();
      }
      return null;
    })
    .filter(Boolean);
};

const resolveScore = (satisfaction) =>
  SATISFACTION_SCORES[satisfaction] || 3;

async function createReview(reviewData) {
  const {
    reviewerId,
    productId,
    orderNumber,
    satisfaction,
    experience,
    highlights,
    improvements,
    photos,
  } = reviewData;

  const normalizedExperience = normalizeExperience(experience, {
    fallbackToDefaults: true,
  });
  const normalizedPhotos = sanitizePhotos(photos, { fallbackToEmpty: true });
  const photosCount = normalizedPhotos.length;
  const satisfactionScore = resolveScore(satisfaction);

  const insertedReview = await sql.begin(async (tx) => {
    const reviewRows = await tx`
      INSERT INTO "Review" (
        reviewer_id,
        product_id,
        order_number,
        satisfaction,
        satisfaction_score,
        experience,
        highlights,
        improvements,
        photos,
        photos_count
      )
      VALUES (
        ${reviewerId},
        ${productId},
        ${orderNumber || null},
        ${satisfaction},
        ${satisfactionScore},
        ${tx.json(normalizedExperience)},
        ${highlights || null},
        ${improvements || null},
        ${tx.json(normalizedPhotos)},
        ${photosCount}
      )
      RETURNING *
    `;

    await tx`
      UPDATE "Product"
      SET
        total_reviews = COALESCE(total_reviews, 0) + 1,
        rating = ROUND(
          ((COALESCE(rating, 0) * COALESCE(total_reviews, 0)) + ${satisfactionScore}) /
          (COALESCE(total_reviews, 0) + 1),
          2
        )
      WHERE product_id = ${productId}
    `;

    return reviewRows[0];
  });

  return insertedReview;
}

async function updateReview(reviewId, reviewerId, updates) {
  const normalizedExperience = normalizeExperience(updates.experience);
  const normalizedPhotos = sanitizePhotos(updates.photos);
  const photosCount =
    typeof updates.photos === "undefined"
      ? undefined
      : normalizedPhotos?.length || 0;
  const satisfactionValue =
    typeof updates.satisfaction === "string" && updates.satisfaction.length > 0
      ? updates.satisfaction
      : null;
  const satisfactionScore = satisfactionValue
    ? resolveScore(satisfactionValue)
    : null;

  const reviewRows = await sql`
    UPDATE "Review"
    SET
      satisfaction = COALESCE(${satisfactionValue}, satisfaction),
      satisfaction_score = COALESCE(${satisfactionValue ? satisfactionScore : null}, satisfaction_score),
      experience = COALESCE(${normalizedExperience ? sql.json(normalizedExperience) : null}, experience),
      highlights = COALESCE(${updates.highlights}, highlights),
      improvements = COALESCE(${updates.improvements}, improvements),
      photos = COALESCE(${normalizedPhotos ? sql.json(normalizedPhotos) : null}, photos),
      photos_count = COALESCE(${photosCount}, photos_count),
      updated_at = NOW()
    WHERE review_id = ${reviewId} AND reviewer_id = ${reviewerId}
    RETURNING *
  `;

  const updatedReview = reviewRows[0];

  if (updatedReview && satisfactionValue) {
    await recomputeProductReviewStats(updatedReview.product_id);
  }

  return updatedReview;
}

async function getReviewById(reviewId) {
  const reviews = await sql`
    SELECT r.*, u.username, u.full_name, p.name AS product_name
    FROM "Review" r
    LEFT JOIN "User" u ON r.reviewer_id = u.user_id
    LEFT JOIN "Product" p ON r.product_id = p.product_id
    WHERE r.review_id = ${reviewId}
  `;
  return reviews[0];
}

async function getReviewByOrderNumber(orderNumber, reviewerId) {
  if (!orderNumber) return null;

  const reviews = await sql`
    SELECT
      r.*,
      p.name AS product_name
    FROM "Review" r
    LEFT JOIN "Product" p ON r.product_id = p.product_id
    WHERE r.order_number = ${orderNumber}
      ${reviewerId ? sql`AND r.reviewer_id = ${reviewerId}` : sql``}
    LIMIT 1
  `;

  return reviews[0];
}

async function getReviewsByProduct(productId, options = {}) {
  const {
    limit = 10,
    offset = 0,
    sort = "latest",
  } = options;

  const orderClause =
    sort === "helpful"
      ? sql`ORDER BY photos_count DESC, submitted_at DESC`
      : sql`ORDER BY submitted_at DESC`;

  const reviews = await sql`
    SELECT
      r.*,
      u.username,
      u.full_name,
      u.avatar_url
    FROM "Review" r
    LEFT JOIN "User" u ON r.reviewer_id = u.user_id
    WHERE r.product_id = ${productId}
    ${orderClause}
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return reviews;
}

async function countReviewsByProduct(productId) {
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM "Review"
    WHERE product_id = ${productId}
  `;
  return rows[0]?.count || 0;
}

async function getReviewStatsForProduct(productId) {
  const summaryRows = await sql`
    SELECT
      COUNT(*)::int AS total_reviews,
      COALESCE(AVG(satisfaction_score), 0)::numeric(10,2) AS average_score
    FROM "Review"
    WHERE product_id = ${productId}
  `;

  const distributionRows = await sql`
    SELECT
      satisfaction,
      COUNT(*)::int AS total
    FROM "Review"
    WHERE product_id = ${productId}
    GROUP BY satisfaction
  `;

  return {
    totalReviews: summaryRows[0]?.total_reviews || 0,
    averageScore: Number(summaryRows[0]?.average_score || 0),
    distribution: distributionRows.reduce((acc, row) => {
      acc[row.satisfaction] = row.total;
      return acc;
    }, {}),
  };
}

async function getReviewsByUser(userId, options = {}) {
  const { limit = 10, offset = 0 } = options;

  const reviews = await sql`
    SELECT
      r.*,
      p.name AS product_name,
      p.images ->> 0 AS primary_image
    FROM "Review" r
    LEFT JOIN "Product" p ON r.product_id = p.product_id
    WHERE r.reviewer_id = ${userId}
    ORDER BY r.submitted_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return reviews;
}

async function deleteReview(reviewId) {
  const deleted = await sql`
    DELETE FROM "Review"
    WHERE review_id = ${reviewId}
    RETURNING *
  `;
  const review = deleted[0];

  if (review) {
    await recomputeProductReviewStats(review.product_id);
  }

  return review;
}

async function recomputeProductReviewStats(productId) {
  const stats = await sql`
    SELECT
      COUNT(*)::int AS total_reviews,
      COALESCE(AVG(satisfaction_score), 0)::numeric(10,2) AS average_score
    FROM "Review"
    WHERE product_id = ${productId}
  `;

  const totalReviews = stats[0]?.total_reviews || 0;
  const averageScore = Number(stats[0]?.average_score || 0);

  await sql`
    UPDATE "Product"
    SET
      total_reviews = ${totalReviews},
      rating = ${averageScore}
    WHERE product_id = ${productId}
  `;

  return {
    totalReviews,
    averageScore,
  };
}

module.exports = {
  createReview,
  updateReview,
  getReviewById,
  getReviewByOrderNumber,
  getReviewsByProduct,
  getReviewStatsForProduct,
  getReviewsByUser,
  countReviewsByProduct,
  deleteReview,
  normalizeExperience,
  sanitizePhotos,
  resolveScore,
  recomputeProductReviewStats,
};
