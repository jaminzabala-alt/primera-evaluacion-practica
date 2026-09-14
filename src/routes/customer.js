
const express = require('express');

const router = express.Router();

const customerController = require('../controllers/customer.controller');

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Obtiene la lista de clientes
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtra clientes por ciudad
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filtra clientes por país
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida correctamente
 */
router.get('/', customerController.getAllCustomers);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Obtiene un cliente por su id
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id del cliente (ej. ALFKI)
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/:id', customerController.getCustomerById);

module.exports = router;
