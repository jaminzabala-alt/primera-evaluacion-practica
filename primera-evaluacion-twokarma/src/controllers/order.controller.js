// controllers/order.controller.js
const { validationResult } = require('express-validator');
const OrderService = require('../services/order.service');
const OrderDTO = require('../dto/order.dto');

// GET /api/orders
exports.getAllOrders = async (req, res) => {
    try {
        const { customer_id, employee_id } = req.query;
        const orders = await OrderService.getAllOrders({ customer_id, employee_id });
        const orderDTOs = orders.map(order => new OrderDTO(order));
        res.json(orderDTOs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const order = await OrderService.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        const orderDTO = new OrderDTO(order);
        res.json(orderDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/orders/:id/details
exports.getOrderDetails = async (req, res) => {
    try {
        const order = await OrderService.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        const details = await OrderService.getOrderDetails(req.params.id);
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const order = await OrderService.createOrder(req.body);
        const orderDTO = new OrderDTO(order);
        res.status(201).json(orderDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/orders/:id
exports.updateOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const order = await OrderService.updateOrder(req.params.id, req.body);
        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        const orderDTO = new OrderDTO(order);
        res.json(orderDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
    try {
        const deleted = await OrderService.deleteOrder(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};