const sql = require('../db');

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

const generateOrderNumber = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${random}`;
};

const normalizeProductPayload = (payload = {}) => ({
  productId: payload.productId ?? payload.product_id ?? null,
  productName: payload.productName ?? payload.name ?? 'Item',
  productImage: payload.productImage ?? payload.imageUrl ?? payload.image ?? null,
  productSize: payload.productSize ?? payload.size ?? null,
  productColor: payload.productColor ?? payload.color ?? null,
  rentalPeriod: payload.rentalPeriod ?? payload.rentTime ?? null,
  quantity: payload.quantity && payload.quantity > 0 ? payload.quantity : 1,
  unitPrice: safeNumber(payload.unitPrice ?? payload.price ?? payload.total ?? 0),
});

const mapOrderRow = (row) => {
  if (!row) {
    return null;
  }

  const dbOrderNumber = toOrderIdentifier(row.order_number);
  const resolvedOrderId = dbOrderNumber || toOrderIdentifier(row.order_id) || null;
  const displayOrderNumber = dbOrderNumber || resolvedOrderId;
  const unitPrice = safeNumber(row.unit_price ?? row.subtotal ?? 0);
  const productItem = {
    productId: row.product_id,
    name: row.product_name,
    size: row.product_size,
    color: row.product_color,
    rentalPeriod: row.rental_period,
    quantity: row.quantity,
    price: unitPrice,
    imageUrl: row.product_image,
  };

  return {
    id: row.order_id,
    orderId: resolvedOrderId,
    orderNumber: displayOrderNumber,
    customerId: row.customer_id,
    buyerName: row.buyer_name,
    productId: row.product_id,
    productName: row.product_name,
    productImage: row.product_image,
    productSize: row.product_size,
    productColor: row.product_color,
    rentalPeriod: row.rental_period,
    quantity: row.quantity,
    unitPrice,
    status: row.status,
    placedDate: row.placed_at ? row.placed_at.toISOString() : null,
    subtotal: Number(row.subtotal ?? 0),
    tax: Number(row.tax ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
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

    return rows.map(mapOrderRow).filter(Boolean);
  } catch (error) {
    console.error('listOrdersForUser error:', error);
    throw error;
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

    return row ? mapOrderRow(row) : null;
  } catch (error) {
    console.error('getOrderByNumber error:', error);
    throw error;
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

  const product = normalizeProductPayload(payload);

  if (!product.productId) {
    const error = new Error('productId is required to create an order.');
    error.status = 400;
    throw error;
  }

  const placedAt = payload.placedAt ? new Date(payload.placedAt) : new Date();
  const orderNumber = payload.orderNumber || payload.orderId || generateOrderNumber();
  const subtotal =
    payload.subtotal !== undefined
      ? safeNumber(payload.subtotal)
      : product.unitPrice * (product.quantity || 1);
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
      buyer_name,
      product_id,
      product_name,
      product_image,
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
      ${payload.buyerName || user.full_name || user.username || null},
      ${product.productId},
      ${product.productName},
      ${product.productImage},
      ${product.productSize},
      ${product.productColor},
      ${product.rentalPeriod},
      ${product.quantity},
      ${product.unitPrice},
      ${status},
      ${placedAt},
      ${subtotal},
      ${tax},
      ${totalAmount},
      ${shippingAddress ? sql.json(shippingAddress) : null},
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
