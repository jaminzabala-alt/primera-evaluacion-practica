const orderService = require('../services/order.service');

class OrderController {
  async getCustomers(req, res, next) {
    try {
      const data = await orderService.getAllCustomers();
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  }

  async getProducts(req, res, next) {
    try {
      const data = await orderService.getAllProducts();
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  }

  async getOrderById(req, res, next) {
    try {
      const data = await orderService.getOrderById(req.params.id);
      if (!data) return res.status(404).json({ status: 'fail', message: 'Orden no encontrada' });
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  }

  async createOrder(req, res, next) {
    try {
      const { customer_id, employee_id, details } = req.body;
      if (!customer_id || !employee_id || !Array.isArray(details) || details.length === 0) {
        return res.status(400).json({ status: 'fail', message: 'Datos de la orden incompletos' });
      }
      const data = await orderService.createOrder({ customer_id, employee_id, details });
      res.status(201).json({ status: 'success', message: 'Orden creada exitosamente', data });
    } catch (err) { next(err); }
  }
}

module.exports = new OrderController();