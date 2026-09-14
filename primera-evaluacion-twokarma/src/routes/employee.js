// routes/employee.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Obtiene la lista de empleados
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtra empleados por ciudad
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filtra empleados por puesto
 *     responses:
 *       200:
 *         description: Lista de empleados obtenida correctamente
 */
router.get('/', employeeController.getAllEmployees);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Obtiene un empleado por su id
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empleado encontrado
 *       404:
 *         description: Empleado no encontrado
 */
router.get('/:id', employeeController.getEmployeeById);

router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;