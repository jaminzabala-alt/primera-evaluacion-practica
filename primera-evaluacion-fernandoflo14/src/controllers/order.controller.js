const orderService = require('../services/order.service');
const orderValidationService = require(
  '../services/order-validation.service'
);

async function getOrderById(req, res) {
  try {
    const { id } = req.params;

   const orderId = Number(id);

if (
  !/^\d+$/.test(id) ||
  !Number.isInteger(orderId) ||
  orderId <= 0 ||
  orderId > 32767
) {
  return res.status(400).json({
    success: false,
    message: 'El ID de la orden debe ser un número válido',
  });
}

    const order = await orderService.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Orden obtenida correctamente',
      data: order,
    });
    } catch (error) {
    next(error);
  }
}

async function createOrder(req, res, next) {
  const errors = orderValidationService.validateOrderBody(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Datos de la orden inválidos',
      errors,
    });
  }

  try {
    const orderData = {
      customer_id: req.body.customer_id.trim(),
      employee_id: Number(req.body.employee_id),
      order_date: req.body.order_date,
      required_date: req.body.required_date || null,
      products: req.body.products.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        discount:
          item.discount === undefined
            ? 0
            : Number(item.discount),
      })),
    };

    const orderId = await orderService.createOrder(orderData);

    const createdOrder =
      await orderService.getOrderById(orderId);

    return res.status(201).json({
      success: true,
      message: 'Orden creada correctamente',
      data: createdOrder,
    });
    } catch (error) {
    next(error);
  }
}

module.exports = {
  getOrderById,
  createOrder,
};