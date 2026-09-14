const express = require('express');
const orderController = require('../controllers/order.controller');

const router = express.Router();

router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);

module.exports = router;