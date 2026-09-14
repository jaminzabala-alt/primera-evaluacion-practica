// routes/product.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtiene la lista de productos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: supplier_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: discontinued
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente
 */
router.get('/', productController.getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtiene un producto por su id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', productController.getProductById);

router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;