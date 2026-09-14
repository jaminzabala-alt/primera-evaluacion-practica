const express = require('express');
const router = express.Router();
const controller = require('../controllers/order.controller');

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Obtener lista de clientes
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida con éxito
 */
router.get('/customers', (req, res, next) => controller.getCustomers(req, res, next));

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener lista de productos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos obtenida con éxito
 */
router.get('/products', (req, res, next) => controller.getProducts(req, res, next));

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener detalle de una orden por ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Orden encontrada
 *       404:
 *         description: Orden no encontrada
 */
router.get('/orders/:id', (req, res, next) => controller.getOrderById(req, res, next));

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear una nueva orden con transacción SQL
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - employee_id
 *               - details
 *             properties:
 *               customer_id:
 *                 type: string
 *                 example: "ALFKI"
 *               employee_id:
 *                 type: integer
 *                 example: 1
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     discount:
 *                       type: number
 *                       example: 0
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *       400:
 *         description: Datos de la orden incompletos
 *       404:
 *         description: Cliente, empleado o producto no encontrado
 */
router.post('/orders', (req, res, next) => controller.createOrder(req, res, next));

module.exports = router;