const sql = require("../db");

/**
 * Get all products with seller info
 */
async function getAllProducts() {
  const products = await sql`
    SELECT 
      p.*,
      (SELECT get_product_avg_rating(p.product_id)) as product_average_rating,
      u.user_id as seller_id,
      u.username as seller_username,
      u.full_name as seller_name,
      u.avatar_url as seller_avatar,
      u.rating as seller_rating,
      u.total_orders as seller_total_orders
    FROM "Product" p
    LEFT JOIN "User" u ON p.seller_id = u.user_id
    ORDER BY p.created_at DESC
  `;
  return products;
}

/**
 * Create a new product
 */
async function createProduct(productData) {
  const {
    sellerId,
    name,
    description,
    category,
    pricePerDay,
    salePercentage,
    images,
    location,
    condition,
    minRentalDays,
    maxRentalDays,
    deposit,
  } = productData;

  const newProduct = await sql`
    INSERT INTO "Product" (
      seller_id,
      name,
      description,
      category,
      price_per_day,
      sale_percentage,
      images,
      location,
      condition,
      min_rental_days,
      max_rental_days,
      deposit
    ) 
    VALUES (
      ${sellerId},
      ${name},
      ${description || null},
      ${category},
      ${pricePerDay},
      ${salePercentage || 0},
      ${images || []},
      ${location},
      ${condition || 'good'},
      ${minRentalDays || 1},
      ${maxRentalDays || 30},
      ${deposit || 0}
    ) 
    RETURNING *
  `;
  return newProduct[0];
}

/**
 * Get product by ID with seller info
 */
async function getProductById(productId) {
  const products = await sql`
    SELECT 
      p.*,
      (SELECT get_product_avg_rating(p.product_id)) as product_average_rating,
      u.user_id as seller_id,
      u.username as seller_username,
      u.full_name as seller_name,
      u.avatar_url as seller_avatar,
      u.rating as seller_rating,
      u.total_orders as seller_total_orders
    FROM "Product" p
    LEFT JOIN "User" u ON p.seller_id = u.user_id
    WHERE p.product_id = ${productId}
  `;
  return products[0];
}

/**
 * Update product information
 */
async function updateProduct(productId, productData) {
  const {
    name = null,
    description = null,
    category = null,
    pricePerDay = null,
    salePercentage = null,
    images = null,
    location = null,
    status = null,
    condition = null,
    minRentalDays = null,
    maxRentalDays = null,
    deposit = null,
  } = productData;

  const updatedProduct = await sql`
    UPDATE "Product"
    SET
      name = COALESCE(${name}, name),
      description = COALESCE(${description}, description),
      category = COALESCE(${category}, category),
      price_per_day = COALESCE(${pricePerDay}, price_per_day),
      sale_percentage = COALESCE(${salePercentage}, sale_percentage),
      images = COALESCE(${images}, images),
      location = COALESCE(${location}, location),
      status = COALESCE(${status}, status),
      condition = COALESCE(${condition}, condition),
      min_rental_days = COALESCE(${minRentalDays}, min_rental_days),
      max_rental_days = COALESCE(${maxRentalDays}, max_rental_days),
      deposit = COALESCE(${deposit}, deposit)
    WHERE product_id = ${productId}
    RETURNING *
  `;
  return updatedProduct[0];
}

/**
 * Delete a product
 */
async function deleteProduct(productId) {
  const result = await sql`
    DELETE FROM "Product" 
    WHERE product_id = ${productId} 
    RETURNING *
  `;
  return result[0];
}

/**
 * Search products with filters
 */
async function searchProducts(filters) {
  const {
    category,
    status,
    minPrice,
    maxPrice,
    location,
    search,
    sortBy = 'created_at',
    order = 'DESC',
    limit = 10,
    offset = 0,
  } = filters;

  let conditions = [];
  let params = [];

  if (category) {
    conditions.push(`p.category = '${category}'`);
  }

  if (status) {
    conditions.push(`p.status = '${status}'`);
  }

  if (minPrice) {
    conditions.push(`p.price_per_day >= ${parseFloat(minPrice)}`);
  }

  if (maxPrice) {
    conditions.push(`p.price_per_day <= ${parseFloat(maxPrice)}`);
  }

  if (location) {
    conditions.push(`p.location ILIKE '%${location}%'`);
  }

  if (search) {
    conditions.push(`(p.name ILIKE '%${search}%' OR p.description ILIKE '%${search}%')`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = `ORDER BY p.${sortBy} ${order}`;
  const limitClause = `LIMIT ${limit} OFFSET ${offset}`;

  const query = `
    SELECT 
      p.*,
      (SELECT get_product_avg_rating(p.product_id)) as product_average_rating,
      u.user_id as seller_id,
      u.username as seller_username,
      u.full_name as seller_name,
      u.avatar_url as seller_avatar,
      u.rating as seller_rating,
      u.total_orders as seller_total_orders
    FROM "Product" p
    LEFT JOIN "User" u ON p.seller_id = u.user_id
    ${whereClause}
    ${orderClause}
    ${limitClause}
  `;

  return await sql.unsafe(query);
}

/**
 * Count products with filters
 */
async function countProducts(filters) {
  const {
    category,
    status,
    minPrice,
    maxPrice,
    location,
    search,
  } = filters;

  let conditions = [];

  if (category) {
    conditions.push(`category = '${category}'`);
  }

  if (status) {
    conditions.push(`status = '${status}'`);
  }

  if (minPrice) {
    conditions.push(`price_per_day >= ${parseFloat(minPrice)}`);
  }

  if (maxPrice) {
    conditions.push(`price_per_day <= ${parseFloat(maxPrice)}`);
  }

  if (location) {
    conditions.push(`location ILIKE '%${location}%'`);
  }

  if (search) {
    conditions.push(`(name ILIKE '%${search}%' OR description ILIKE '%${search}%')`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT COUNT(*) as count 
    FROM "Product"
    ${whereClause}
  `;

  const result = await sql.unsafe(query);
  return parseInt(result[0].count);
}

/**
 * Get products by seller ID
 */
async function getProductsBySeller(sellerId, limit = 10, offset = 0) {
  const products = await sql`
    SELECT 
      p.*,
      (SELECT get_product_avg_rating(p.product_id)) as product_average_rating
    FROM "Product" p
    WHERE p.seller_id = ${sellerId}
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return products;
}

/**
 * Update product status
 */
async function updateProductStatus(productId, status) {
  const updatedProduct = await sql`
    UPDATE "Product"
    SET status = ${status}
    WHERE product_id = ${productId}
    RETURNING *
  `;
  return updatedProduct[0];
}

/**
 * Increment total rentals
 */
async function incrementTotalRentals(productId) {
  const updatedProduct = await sql`
    UPDATE "Product"
    SET total_rentals = total_rentals + 1
    WHERE product_id = ${productId}
    RETURNING *
  `;
  return updatedProduct[0];
}

/**
 * Get product average rating
 */
async function getProductAvgRating(productId) {
  try {
    const result = await sql`
      SELECT get_product_avg_rating(${productId}) AS average_rating
    `;
    return result[0].average_rating;
  } catch (error) {
    console.error("Error in getProductAvgRating:", error);
    throw error;
  }
}

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  countProducts,
  getProductsBySeller,
  updateProductStatus,
  incrementTotalRentals,
  getProductAvgRating,
};

