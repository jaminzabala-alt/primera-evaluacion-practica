// controllers/product.controller.js
const { validationResult } = require('express-validator');
const ProductService = require('../services/product.service');
const ProductDTO = require('../dto/product.dto');

// GET /api/products
exports.getAllProducts = async (req, res) => {
    try {
        const { category_id, supplier_id, discontinued } = req.query;
        const products = await ProductService.getAllProducts({ category_id, supplier_id, discontinued });
        const productDTOs = products.map(product => new ProductDTO(product));
        res.json(productDTOs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
    try {
        const product = await ProductService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        const productDTO = new ProductDTO(product);
        res.json(productDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/products
exports.createProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const product = await ProductService.createProduct(req.body);
        const productDTO = new ProductDTO(product);
        res.status(201).json(productDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const product = await ProductService.updateProduct(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        const productDTO = new ProductDTO(product);
        res.json(productDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const deleted = await ProductService.deleteProduct(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};