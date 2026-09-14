// controllers/employee.controller.js
const { validationResult } = require('express-validator');
const EmployeeService = require('../services/employee.service');
const EmployeeDTO = require('../dto/employee.dto');

// GET /api/employees
exports.getAllEmployees = async (req, res) => {
    try {
        const { city, title } = req.query;
        const employees = await EmployeeService.getAllEmployees({ city, title });
        const employeeDTOs = employees.map(employee => new EmployeeDTO(employee));
        res.json(employeeDTOs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/employees/:id
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await EmployeeService.getEmployeeById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        const employeeDTO = new EmployeeDTO(employee);
        res.json(employeeDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/employees
exports.createEmployee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const employee = await EmployeeService.createEmployee(req.body);
        const employeeDTO = new EmployeeDTO(employee);
        res.status(201).json(employeeDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/employees/:id
exports.updateEmployee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
        if (!employee) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        const employeeDTO = new EmployeeDTO(employee);
        res.json(employeeDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/employees/:id
exports.deleteEmployee = async (req, res) => {
    try {
        const deleted = await EmployeeService.deleteEmployee(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};