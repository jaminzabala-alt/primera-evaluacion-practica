// controllers/order.controller.js
const { validationResult } = require('express-validator');
const OrderService = require('../services/order.service');
const OrderDetailDTO = require('../dto/order_detail.dto');
const OrderDTO = require('../dto/order.dto');


//GET all order
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

//GET order_by_id
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
        const detailDTOs = details.map(d => new OrderDetailDTO(d));
        res.json(detailDTOs);
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
        const orderDTO = new OrderDTO(order); // ya incluye details con OrderDetailDTO
        res.status(201).json(orderDTO);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ error: error.message || 'Error interno del servidor' });
    }
};

//Update order/controller
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

//Delete order/controller
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