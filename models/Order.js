const sql = require('../db');
const sampleOrders = require('../data/ordersData');

const deepClone = (value) => JSON.parse(JSON.stringify(value ?? null));

const normalizeOrderNumber = (orderNumber) =>
  typeof orderNumber === 'string' ? orderNumber.trim().toUpperCase() : '';

const toOrderIdentifier = (value) => {
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  return null;
};

const resolveOrderIdentifier = (source) => {
  if (!source) return null;
  return (
    toOrderIdentifier(source.orderId) ??
    toOrderIdentifier(source.order_id) ??
    toOrderIdentifier(source.orderNumber) ??
    toOrderIdentifier(source.order_number) ??
    toOrderIdentifier(source.id) ??
    null
  );
};

const enhanceOrder = (order, user) => {
  if (!order) {
    return null;
  }

  const cloned = deepClone(order);
  cloned.customerId = cloned.customerId || user?.user_id || null;
  const resolvedId = resolveOrderIdentifier(cloned);
  if (resolvedId) {
    cloned.orderId = resolvedId;
    if (!cloned.orderNumber) {
      cloned.orderNumber = resolvedId;
    }
  }
  return cloned;
};

const safeNumber = (value, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const generateOrderNumber = () => {
  const random = Math.floor(100000 + Math.random() * 900000); // 6‑digit
  return `ORD-${random}`;
};

const normalizeOrderItem = (item = {}) => ({
  productId: item.productId ?? item.product_id ?? item.id ?? null,
  name: item.productName ?? item.name ?? 'Item',
  size: item.size ?? null,
  color: item.color ?? null,
  rentalPeriod: item.rentalPeriod ?? item.rentTime ?? null,
  quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
  price: safeNumber(item.price ?? item.unitPrice ?? item.unit_price ?? item.total ?? 0),
  imageUrl: item.imageUrl ?? item.image_url ?? item.image ?? null,
});

const normalizeOrderItems = (payload = {}) => {
  if (Array.isArray(payload.items) && payload.items.length > 0) {
    return payload.items.map(normalizeOrderItem);
  }
  return [normalizeOrderItem(payload)];
};

const listOrdersFromSample = (user) => {
  const cloned = deepClone(sampleOrders) || [];
  return cloned.map((order) => enhanceOrder(order, user)).filter(Boolean);
};

const getOrderFromSample = (orderId, user) => {
  const normalizedTarget = normalizeOrderNumber(orderId);
  const target = sampleOrders.find((order) => {
    const current = resolveOrderIdentifier(order);
    return normalizeOrderNumber(current) === normalizedTarget;
  });
  return enhanceOrder(target, user);
};

const mapOrderRow = (row) => {
  if (!row) {
    return null;
  }

  const dbOrderNumber = toOrderIdentifier(row.order_number);
  const resolvedOrderId = dbOrderNumber || toOrderIdentifier(row.order_id) || null;
  const displayOrderNumber = dbOrderNumber || resolvedOrderId;

  return {
    id: row.order_id,
    orderId: resolvedOrderId,
    orderNumber: displayOrderNumber,
    customerId: row.customer_id,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    status: row.status,
    placedDate: row.placed_at ? row.placed_at.toISOString() : null,
    subtotal: Number(row.subtotal ?? 0),
    tax: Number(row.tax ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    items: Array.isArray(row.items) ? row.items : [],
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    receivingInfo: row.receiving_info || null,
    returnInfo: row.return_info || null,
    notes: row.notes || null,
    createdAt: row.created_at ? row.created_at.toISOString() : null,
    updatedAt: row.updated_at ? row.updated_at.toISOString() : null,
  };
};

async function listOrdersForUser(user) {
  if (!user) {
    return [];
  }

  try {
    const rows = await sql`
      SELECT *
      FROM "Order"
      WHERE customer_id = ${user.user_id}
      ORDER BY placed_at DESC NULLS LAST, created_at DESC
    `;

    if (rows.length === 0) {
      return listOrdersFromSample(user);
    }

    const orders = rows.map(mapOrderRow).filter(Boolean);
    return orders;
  } catch (error) {
    console.warn('listOrdersForUser fallback to sample data:', error.message);
    return listOrdersFromSample(user);
  }
}

async function getOrderByNumber(orderNumber, user) {
  if (!user || !orderNumber) {
    return null;
  }

  try {
    const [row] = await sql`
      SELECT *
      FROM "Order"
      WHERE customer_id = ${user.user_id}
        AND order_number = ${orderNumber}
      LIMIT 1
    `;

    if (!row) {
      return getOrderFromSample(orderNumber, user);
    }

    return mapOrderRow(row);
  } catch (error) {
    console.warn('getOrderByNumber fallback to sample data:', error.message);
    return getOrderFromSample(orderNumber, user);
  }
}

const buildDefaultTimeline = (placedAt) => {
  const placedAtIso = placedAt.toISOString();
  return [
    {
      title: 'Order Placed',
      date: placedAtIso,
      completed: true,
      description: 'Order created.',
    },
    {
      title: 'Shipping',
      date: 'Pending',
      completed: false,
      description: 'Awaiting shipment.',
    },
  ];
};

async function createOrder(user, payload = {}) {
  if (!user?.user_id) {
    const error = new Error('Authenticated user is required to create an order.');
    error.status = 401;
    throw error;
  }

  const items = normalizeOrderItems(payload).filter((item) => item.productId);

  if (items.length === 0) {
    const error = new Error('productId is required to create an order.');
    error.status = 400;
    throw error;
  }

  const placedAt = payload.placedAt ? new Date(payload.placedAt) : new Date();
  const orderNumber = payload.orderNumber || payload.orderId || generateOrderNumber();
  const subtotal =
    payload.subtotal !== undefined
      ? safeNumber(payload.subtotal)
      : items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const tax = safeNumber(payload.tax);
  const totalAmount =
    payload.totalAmount !== undefined
      ? safeNumber(payload.totalAmount)
      : subtotal + tax;
  const shippingAddress = payload.shippingAddress || null;
  const timeline =
    Array.isArray(payload.timeline) && payload.timeline.length > 0
      ? payload.timeline
      : buildDefaultTimeline(placedAt);
  const receivingInfo = payload.receivingInfo || null;
  const returnInfo = payload.returnInfo || null;
  const status = payload.status || 'ordered';

  const rows = await sql`
    INSERT INTO "Order" (
      order_number,
      customer_id,
      seller_id,
      seller_name,
      status,
      placed_at,
      subtotal,
      tax,
      total_amount,
      shipping_address,
      items,
      timeline,
      receiving_info,
      return_info,
      notes
    ) VALUES (
      ${orderNumber},
      ${user.user_id},
      ${payload.sellerId || null},
      ${payload.sellerName || null},
      ${status},
      ${placedAt},
      ${subtotal},
      ${tax},
      ${totalAmount},
      ${shippingAddress ? sql.json(shippingAddress) : null},
      ${sql.json(items)},
      ${sql.json(timeline)},
      ${receivingInfo ? sql.json(receivingInfo) : null},
      ${returnInfo ? sql.json(returnInfo) : null},
      ${payload.notes || null}
    )
    RETURNING *
  `;

  return mapOrderRow(rows[0]);
}

module.exports = {
  listOrdersForUser,
  getOrderByNumber,
  createOrder,
};
