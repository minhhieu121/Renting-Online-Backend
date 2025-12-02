const orderModel = require('../models/Order');
const emailService = require('../services/EmailService');

const buildSuccessResponse = (data, extra = {}) => ({
  success: true,
  data,
  ...extra,
});

const buildErrorResponse = (message, extra = {}) => ({
  success: false,
  message,
  ...extra,
});

const getOrders = async (req, res) => {
  try {
    const orders = await orderModel.listOrdersForUser(req.user);
    return res.status(200).json(
      buildSuccessResponse(orders, {
        count: orders.length,
      })
    );
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json(
      buildErrorResponse('Unable to load orders right now.', {
        error: error.message,
      })
    );
  }
};

const getOrderByNumber = async (req, res) => {
  const { orderNumber } = req.params;

  if (!orderNumber) {
    return res.status(400).json(
      buildErrorResponse('orderNumber is required.')
    );
  }

  try {
    const order = await orderModel.getOrderByNumber(orderNumber, req.user);

    if (!order) {
      return res.status(404).json(
        buildErrorResponse(`Order ${orderNumber} not found or inaccessible.`)
      );
    }

    return res.status(200).json(buildSuccessResponse(order));
  } catch (error) {
    console.error('Get order detail error:', error);
    return res.status(500).json(
      buildErrorResponse('Unable to load order details right now.', {
        error: error.message,
      })
    );
  }
};

const createOrder = async (req, res) => {
  try {
    const order = await orderModel.createOrder(req.user, req.body || {});

    // Fire-and-forget: try sending order email (do not block response)
    try {
      const userEmail = req.user?.email;
      if (userEmail) {
        emailService
          .sendOrderEmail(userEmail, order)
          .catch((err) => console.error('Order email send failure:', err));
      } else {
        console.warn('Order email skipped: user email not available');
      }
    } catch (mailErr) {
      console.error('Order email unexpected error:', mailErr);
    }

    return res.status(201).json(buildSuccessResponse(order));
  } catch (error) {
    console.error('Create order error:', error);
    const status = error.status && Number.isInteger(error.status) ? error.status : 500;
    const message =
      status === 400 || status === 401
        ? error.message
        : 'Unable to create order right now.';
    return res.status(status).json(
      buildErrorResponse(message, {
        error: error.message,
      })
    );
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const orders = await orderModel.listOrdersForSeller(req.user);
    return res.status(200).json(
      buildSuccessResponse(orders, {
        count: orders.length,
      })
    );
  } catch (error) {
    console.error('Get seller orders error:', error);
    return res.status(500).json(
      buildErrorResponse('Unable to load seller orders right now.', {
        error: error.message,
      })
    );
  }
};

const getSellerOrderByNumber = async (req, res) => {
  const { orderNumber } = req.params;

  if (!orderNumber) {
    return res.status(400).json(
      buildErrorResponse('orderNumber is required.')
    );
  }

  try {
    const order = await orderModel.getOrderByNumber(orderNumber, req.user);

    if (!order || Number(order.sellerId) !== Number(req.user.user_id)) {
      return res.status(404).json(
        buildErrorResponse(`Order ${orderNumber} not found or inaccessible.`)
      );
    }

    return res.status(200).json(buildSuccessResponse(order));
  } catch (error) {
    console.error('Get seller order detail error:', error);
    return res.status(500).json(
      buildErrorResponse('Unable to load seller order details right now.', {
        error: error.message,
      })
    );
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderNumber } = req.params;

  if (!orderNumber) {
    return res.status(400).json(buildErrorResponse('orderNumber is required.'));
  }

  try {
    const order = await orderModel.updateOrderStatus(req.user, orderNumber, req.body || {});

    if (!order) {
      return res.status(404).json(
        buildErrorResponse('Order not found or you do not have permission to update it.')
      );
    }

    return res.status(200).json(buildSuccessResponse(order));
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json(
      buildErrorResponse('Unable to update order status right now.', {
        error: error.message,
      })
    );
  }
};

module.exports = {
  getOrders,
  getOrderByNumber,
  createOrder,
  getSellerOrders,
  getSellerOrderByNumber,
  updateOrderStatus,
};
