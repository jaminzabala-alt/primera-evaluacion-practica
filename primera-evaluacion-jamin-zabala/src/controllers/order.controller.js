const orderService = require('../services/order.service');
const { createHttpError } = require('../middleware/error.middleware');

async function getOrderById(req, res, next) {
  try {
    const orderId = Number(req.params.id);

    if (Number.isNaN(orderId)) {
      throw createHttpError(400, 'El identificador de la orden debe ser un número válido');
    }

    const order = await orderService.getOrderById(orderId);

    if (!order) {
      throw createHttpError(404, 'Orden no encontrada');
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    return next(error);
  }
}

async function createOrder(req, res, next) {
  try {
    const order = await orderService.createOrder(req.body);

    return res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getOrderById,
  createOrder
};
