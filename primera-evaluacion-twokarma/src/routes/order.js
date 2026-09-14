// routes/order.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Obtiene la lista de ordenes
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de ordenes obtenida correctamente
 */
router.get('/', orderController.getAllOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Obtiene una orden por su id
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orden encontrada
 *       404:
 *         description: Orden no encontrada
 */
router.get('/:id', orderController.getOrderById);

/**
 * @swagger
 * /orders/{id}/details:
 *   get:
 *     summary: Obtiene el detalle de productos de una orden
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de la orden obtenido correctamente
 *       404:
 *         description: Orden no encontrada
 */
router.get('/:id/details', orderController.getOrderDetails);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crea una nueva orden
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
 *               - order_date
 *             properties:
 *               customer_id:
 *                 type: string
 *                 example: ALFKI
 *               employee_id:
 *                 type: integer
 *                 example: 5
 *               order_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-09-14"
 *               required_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-09-21"
 *               shipped_date:
 *                 type: string
 *                 format: date
 *                 example: null
 *               ship_via:
 *                 type: integer
 *                 example: 1
 *               freight:
 *                 type: number
 *                 example: 32.5
 *               ship_name:
 *                 type: string
 *                 example: Alfreds Futterkiste
 *               ship_address:
 *                 type: string
 *                 example: Obere Str. 57
 *               ship_city:
 *                 type: string
 *                 example: Berlin
 *               ship_region:
 *                 type: string
 *                 example: null
 *               ship_postal_code:
 *                 type: string
 *                 example: "12209"
 *               ship_country:
 *                 type: string
 *                 example: Germany
 *     responses:
 *       201:
 *         description: Orden creada correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', orderController.createOrder);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Actualiza una orden existente
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: string
 *                 example: ALFKI
 *               employee_id:
 *                 type: integer
 *                 example: 5
 *               order_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-09-14"
 *               required_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-09-21"
 *               shipped_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-09-16"
 *               ship_via:
 *                 type: integer
 *                 example: 1
 *               freight:
 *                 type: number
 *                 example: 32.5
 *               ship_name:
 *                 type: string
 *                 example: Alfreds Futterkiste
 *               ship_address:
 *                 type: string
 *                 example: Obere Str. 57
 *               ship_city:
 *                 type: string
 *                 example: Berlin
 *               ship_region:
 *                 type: string
 *                 example: null
 *               ship_postal_code:
 *                 type: string
 *                 example: "12209"
 *               ship_country:
 *                 type: string
 *                 example: Germany
 *     responses:
 *       200:
 *         description: Orden actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Orden no encontrada
 */
router.put('/:id', orderController.updateOrder);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Elimina una orden
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Orden eliminada correctamente
 *       404:
 *         description: Orden no encontrada
 */
router.delete('/:id', orderController.deleteOrder);

module.exports = router;