// controllers/customer.controller.js
const { validationResult } = require('express-validator');
const CustomerService = require('../services/customer.service');
const CustomerDTO = require('../dto/customer.dto');

// GET /api/customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await CustomerService.getAllCustomers();
        const customerDTOs = customers.map(customer => new CustomerDTO(customer));
        res.json(customerDTOs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/customers/:id
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await CustomerService.getCustomerById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        const customerDTO = new CustomerDTO(customer);
        res.json(customerDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/customers
exports.createCustomer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const customer = await CustomerService.createCustomer(req.body);
        const customerDTO = new CustomerDTO(customer);
        res.status(201).json(customerDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const customer = await CustomerService.updateCustomer(req.params.id, req.body);
        if (!customer) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        const customerDTO = new CustomerDTO(customer);
        res.json(customerDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/customers/:id
exports.deleteCustomer = async (req, res) => {
    try {
        const deleted = await CustomerService.deleteCustomer(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};