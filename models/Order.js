const sql = require('../db');

const ORDER_STATUS_VALUES = [
  'ordered',
  'shipping',
  'using',
  'return',
  'checking',
  'completed',
];
const ORDER_STATUS_SET = new Set(ORDER_STATUS_VALUES);
const DEFAULT_ORDER_STATUS = 'ordered';

const parseStatusValue = (value) => {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return ORDER_STATUS_SET.has(normalized) ? normalized : null;
};

const ORDER_BASE_SELECT = sql`
  SELECT
    o.order_id,
    o.order_number,
    o.customer_id,
    o.seller_id,
    o.product_id,
    o.product_size,
    o.product_color,
    o.rental_period,
    o.quantity,
    o.unit_price,
    o.status,
    o.placed_at,
    o.subtotal,
    o.tax,
    o.total_amount,
    o.shipping_address,
    o.timeline,
    o.receiving_info,
    o.return_info,
    o.notes,
    o.created_at,
    o.updated_at,
    customer.full_name AS customer_full_name,
    customer.username AS customer_username,
    seller.full_name AS seller_full_name,
    seller.username AS seller_username,
    seller.avatar_url AS seller_avatar,
    seller.phone AS seller_phone,
    seller.address AS seller_address,
    seller.email AS seller_email,
    p.name AS product_name,
    p.images AS product_images,
    p.images[1] AS product_primary_image,
    p.category AS product_category,
    p.price_per_day AS product_price_per_day,
    p.sale_percentage AS product_sale_percentage,
    p.location AS product_location
  FROM "Order" o
  JOIN "Product" p ON o.product_id = p.product_id
  LEFT JOIN "User" customer ON o.customer_id = customer.user_id
  LEFT JOIN "User" seller ON o.seller_id = seller.user_id
`;

const toOrderIdentifier = (value) => {
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  return null;
};

const safeNumber = (value, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toIsoString = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const parseJsonValue = (value) => {
  if (!value) return null;
  if (typeof value === 'object') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const normalizeProductPayload = (payload = {}) => ({
  productId: payload.productId ?? payload.product_id ?? null,
  size: payload.productSize ?? payload.size ?? null,
  color: payload.productColor ?? payload.color ?? null,
  rentalPeriod: payload.rentalPeriod ?? payload.rentTime ?? null,
  quantity: payload.quantity && payload.quantity > 0 ? payload.quantity : 1,
  unitPrice: safeNumber(
    payload.unitPrice ?? payload.unit_price ?? payload.price ?? payload.pricePerDay ?? 0
  ),
});

const normalizeTimelineEvent = (event = {}, index = 0) => ({
  title: event.title ?? event.status ?? `Step ${index + 1}`,
  date: event.date ?? event.timestamp ?? null,
  completed: Boolean(event.completed ?? event.is_completed ?? false),
  description: event.description ?? event.details ?? '',
});

const normalizeTimeline = (timeline) => {
  if (!Array.isArray(timeline)) {
    return undefined;
  }
  return timeline.map((event, index) => normalizeTimelineEvent(event, index));
};

const generateOrderNumber = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${random}`;
};

const buildDefaultTimeline = (placedAt) => {
  const placedAtIso = placedAt.toISOString();
  const pendingStep = (title, description) => ({
    title,
    date: 'Pending',
    completed: false,
    description,
  });
  return [
    {
      title: 'Order Placed',
      date: placedAtIso,
      completed: true,
      description: 'Order created.',
    },
    pendingStep('Shipping', 'Awaiting shipment.'),
    pendingStep('Received', 'Customer to confirm delivery.'),
    pendingStep('Using', 'Rental is currently in progress.'),
    pendingStep('Return', 'Preparing for return.'),
    pendingStep('Checking', 'Seller inspecting the returned item.'),
    pendingStep('Completed', 'Order ready to be closed.'),
  ];
};

const STATUS_TO_TIMELINE_STEPS = {
  ordered: ['order placed'],
  shipping: ['order placed', 'shipping'],
  using: ['order placed', 'shipping', 'received', 'using'],
  return: ['order placed', 'shipping', 'received', 'using', 'return'],
  checking: ['order placed', 'shipping', 'received', 'using', 'return', 'checking'],
  completed: ['order placed', 'shipping', 'received', 'using', 'return', 'checking', 'completed'],
};

const syncTimelineWithStatus = (timeline = [], statusValue, placedAt) => {
  const baseTimeline =
    Array.isArray(timeline) && timeline.length > 0
      ? timeline
      : buildDefaultTimeline(
          placedAt instanceof Date ? placedAt : new Date(placedAt || Date.now())
        );
  const normalizedStatus =
    typeof statusValue === 'string'
      ? statusValue.toLowerCase()
      : DEFAULT_ORDER_STATUS;
  const completedSteps =
    STATUS_TO_TIMELINE_STEPS[normalizedStatus] ||
    STATUS_TO_TIMELINE_STEPS[DEFAULT_ORDER_STATUS];
  const nowIso = new Date().toISOString();

  return baseTimeline.map((event) => {
    if (!event || !event.title) {
      return event;
    }
    const titleKey = event.title.toLowerCase();
    if (completedSteps.includes(titleKey)) {
      return {
        ...event,
        completed: true,
        date:
          event.date && event.date !== 'Pending'
            ? event.date
            : nowIso,
      };
    }
    return {
      ...event,
      completed: false,
      date: event.date ?? 'Pending',
    };
  });
};

const mapOrderRow = (row) => {
  if (!row) {
    return null;
  }

  const dbOrderNumber = toOrderIdentifier(row.order_number);
  const resolvedOrderId = dbOrderNumber || toOrderIdentifier(row.order_id) || null;
  const displayOrderNumber = dbOrderNumber || resolvedOrderId;
  const unitPrice = safeNumber(row.unit_price ?? row.subtotal ?? 0);
  const productImages = Array.isArray(row.product_images)
    ? row.product_images
    : typeof row.product_images === 'string'
      ? row.product_images.replace(/[{}]/g, '').split(',').filter(Boolean)
      : [];
  const productImage = row.product_primary_image || productImages[0] || null;
  const sellerName = row.seller_full_name || null;
  const productName = row.product_name || null;
  const shippingAddress = parseJsonValue(row.shipping_address);
  const receivingInfo = parseJsonValue(row.receiving_info);
  const returnInfo = parseJsonValue(row.return_info);
  const rawTimeline = Array.isArray(row.timeline)
    ? row.timeline
    : parseJsonValue(row.timeline) || [];
  const placedAtDate =
    row.placed_at instanceof Date ? row.placed_at : new Date(row.placed_at || Date.now());
  const timeline = syncTimelineWithStatus(rawTimeline, row.status, placedAtDate);

  const seller = {
    id: row.seller_id || null,
    name: sellerName,
    username: row.seller_username || null,
    avatar: row.seller_avatar || null,
    phone: row.seller_phone || null,
    email: row.seller_email || null,
    address: row.seller_address || null,
  };

  const product = {
    id: row.product_id,
    name: productName,
    image: productImage,
    images: productImages,
    category: row.product_category || null,
    location: row.product_location || null,
    pricePerDay: safeNumber(row.product_price_per_day, 0),
    salePercentage: row.product_sale_percentage ?? null,
    size: row.product_size || null,
    color: row.product_color || null,
    rentalPeriod: row.rental_period || null,
  };

  const statusValue = row.status || 'ordered';
  const canReview = typeof statusValue === 'string' && statusValue.toLowerCase() === 'completed';

  return {
    id: row.order_id,
    orderId: resolvedOrderId,
    orderNumber: displayOrderNumber,
    customerId: row.customer_id,
    buyerName: row.customer_full_name || row.customer_username || null,
    sellerId: row.seller_id,
    sellerName: seller.name,
    sellerUsername: seller.username,
    sellerAvatar: seller.avatar,
    sellerPhone: seller.phone,
    sellerAddress: seller.address,
    sellerEmail: seller.email,
    productId: row.product_id,
    productName,
    productImage,
    productImages,
    productCategory: product.category,
    productSize: product.size,
    productColor: product.color,
    rentalPeriod: product.rentalPeriod,
    quantity: row.quantity,
    unitPrice,
    status: statusValue,
    placedDate: toIsoString(row.placed_at),
    subtotal: Number(row.subtotal ?? 0),
    tax: Number(row.tax ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    shippingAddress,
    timeline,
    receivingInfo,
    returnInfo,
    notes: row.notes || null,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    canReview,
    seller,
    product,
  };
};

const fetchOrders = async (whereAndExtrasSql = sql``) => {
  const rows = await sql`
    ${ORDER_BASE_SELECT}
    ${whereAndExtrasSql}
  `;
  return rows.map(mapOrderRow).filter(Boolean);
};

async function listOrdersForUser(user) {
  if (!user?.user_id) {
    return [];
  }

  return fetchOrders(sql`
    WHERE o.customer_id = ${user.user_id}
    ORDER BY o.placed_at DESC NULLS LAST, o.created_at DESC
  `);
}

async function listOrdersForSeller(user) {
  if (!user?.user_id) {
    return [];
  }

  return fetchOrders(sql`
    WHERE o.seller_id = ${user.user_id}
    ORDER BY o.placed_at DESC NULLS LAST, o.created_at DESC
  `);
}

async function getOrderByNumber(orderNumber, user) {
  if (!user?.user_id || !orderNumber) {
    return null;
  }

  const [order] = await fetchOrders(sql`
    WHERE o.order_number = ${orderNumber}
      AND (o.customer_id = ${user.user_id} OR o.seller_id = ${user.user_id})
    LIMIT 1
  `);

  return order || null;
}

const loadProductSnapshot = async (productId) => {
  if (!productId) {
    return null;
  }

  const [product] = await sql`
    SELECT
      product_id,
      seller_id,
      price_per_day,
      name,
      images,
      sale_percentage
    FROM "Product"
    WHERE product_id = ${productId}
    LIMIT 1
  `;
  return product || null;
};

async function createOrder(user, payload = {}) {
  if (!user?.user_id) {
    const error = new Error('Authenticated user is required to create an order.');
    error.status = 401;
    throw error;
  }

  const productPayload = normalizeProductPayload(payload);

  if (!productPayload.productId) {
    const error = new Error('productId is required to create an order.');
    error.status = 400;
    throw error;
  }

  const product = await loadProductSnapshot(productPayload.productId);
  if (!product) {
    const error = new Error('Product not found.');
    error.status = 404;
    throw error;
  }

  const placedAt = payload.placedAt ? new Date(payload.placedAt) : new Date();
  const orderNumber = payload.orderNumber || payload.orderId || generateOrderNumber();
  const quantity = productPayload.quantity;
  const unitPrice = productPayload.unitPrice > 0
    ? productPayload.unitPrice
    : safeNumber(product.price_per_day, 0);
  const subtotal = payload.subtotal !== undefined
    ? safeNumber(payload.subtotal)
    : unitPrice * quantity;
  const tax = safeNumber(payload.tax);
  const totalAmount = payload.totalAmount !== undefined
    ? safeNumber(payload.totalAmount)
    : subtotal + tax;
  const shippingAddress = payload.shippingAddress || null;
  const timeline = normalizeTimeline(payload.timeline) || buildDefaultTimeline(placedAt);
  const receivingInfo = payload.receivingInfo || null;
  const returnInfo = payload.returnInfo || null;
  const status = parseStatusValue(payload.status) ?? DEFAULT_ORDER_STATUS;
  const syncedTimeline = syncTimelineWithStatus(timeline, status, placedAt);

  await sql`
    INSERT INTO "Order" (
      order_number,
      customer_id,
      seller_id,
      product_id,
      product_size,
      product_color,
      rental_period,
      quantity,
      unit_price,
      status,
      placed_at,
      subtotal,
      tax,
      total_amount,
      shipping_address,
      timeline,
      receiving_info,
      return_info,
      notes
    ) VALUES (
      ${orderNumber},
      ${user.user_id},
      ${product.seller_id},
      ${product.product_id},
      ${productPayload.size},
      ${productPayload.color},
      ${productPayload.rentalPeriod},
      ${quantity},
      ${unitPrice},
      ${status},
      ${placedAt},
      ${subtotal},
      ${tax},
      ${totalAmount},
      ${shippingAddress ? sql.json(shippingAddress) : null},
      ${sql.json(syncedTimeline)},
      ${receivingInfo ? sql.json(receivingInfo) : null},
      ${returnInfo ? sql.json(returnInfo) : null},
      ${payload.notes || null}
    )
  `;

  return getOrderByNumber(orderNumber, user);
}

async function updateOrderStatus(seller, orderNumber, updates = {}) {
  if (!seller?.user_id) {
    const error = new Error('Seller authentication required.');
    error.status = 401;
    throw error;
  }

  if (!orderNumber) {
    const error = new Error('orderNumber is required.');
    error.status = 400;
    throw error;
  }

  const setFragments = [];
  let statusValue = null;
  if (typeof updates.status !== 'undefined') {
    if (updates.status === null || updates.status === '') {
      const error = new Error('status cannot be empty.');
      error.status = 400;
      throw error;
    }
    const parsedStatus = parseStatusValue(updates.status);
    if (!parsedStatus) {
      const error = new Error('Invalid status value.');
      error.status = 400;
      throw error;
    }
    statusValue = parsedStatus;
    setFragments.push(sql`status = ${statusValue}`);
  }

  const providedTimeline = normalizeTimeline(updates.timeline);
  if (providedTimeline) {
    setFragments.push(sql`timeline = ${sql.json(providedTimeline)}`);
  } else if (statusValue) {
    const [current] = await sql`
      SELECT timeline, placed_at
      FROM "Order"
      WHERE order_number = ${orderNumber}
        AND seller_id = ${seller.user_id}
      LIMIT 1
    `;

    if (!current) {
      return null;
    }

    const timelineFromDb = Array.isArray(current.timeline)
      ? current.timeline
      : parseJsonValue(current.timeline) || [];
    const syncedTimeline = syncTimelineWithStatus(
      timelineFromDb,
      statusValue,
      current.placed_at
    );

    setFragments.push(sql`timeline = ${sql.json(syncedTimeline)}`);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'receivingInfo')) {
    setFragments.push(
      sql`receiving_info = ${updates.receivingInfo ? sql.json(updates.receivingInfo) : null}`
    );
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'returnInfo')) {
    setFragments.push(
      sql`return_info = ${updates.returnInfo ? sql.json(updates.returnInfo) : null}`
    );
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'notes')) {
    setFragments.push(sql`notes = ${updates.notes || null}`);
  }

  if (!setFragments.length) {
    return getOrderByNumber(orderNumber, seller);
  }

  setFragments.push(sql`updated_at = NOW()`);

  const buildSetClause = (fragments) =>
    fragments.slice(1).reduce((acc, fragment) => sql`${acc}, ${fragment}`, fragments[0]);

  const result = await sql`
    UPDATE "Order"
    SET ${buildSetClause(setFragments)}
    WHERE order_number = ${orderNumber}
      AND seller_id = ${seller.user_id}
    RETURNING order_number
  `;

  if (!result[0]) {
    return null;
  }

  return getOrderByNumber(orderNumber, seller);
}

async function isOrderReviewable({ orderId, orderNumber, customerId }) {
  if (!customerId || (!orderId && !orderNumber)) {
    return false;
  }

  const conditions = [sql`customer_id = ${customerId}`];
  if (orderId) {
    conditions.push(sql`order_id = ${orderId}`);
  }
  if (orderNumber) {
    conditions.push(sql`order_number = ${orderNumber}`);
  }

  const [row] = await sql`
    SELECT status
    FROM "Order"
    WHERE ${sql.join(conditions, sql` AND `)}
    LIMIT 1
  `;

  if (!row || !row.status) {
    return false;
  }

  return row.status.toLowerCase() === 'completed';
}

module.exports = {
  listOrdersForUser,
  listOrdersForSeller,
  getOrderByNumber,
  createOrder,
  updateOrderStatus,
  isOrderReviewable,
};
