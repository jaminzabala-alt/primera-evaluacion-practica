// services/employee.service.js
const db = require('../config/db');
const Employee = require('../models/employee.entity');

class EmployeeService {
    // Obtener todos los empleados (con filtros opcionales)
    static async getAllEmployees({ city, title } = {}) {
        try {
            const conditions = [];
            const values = [];

            if (city) {
                values.push(city);
                conditions.push(`city = $${values.length}`);
            }
            if (title) {
                values.push(title);
                conditions.push(`title = $${values.length}`);
            }

            const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
            const { rows } = await db.query(
                `SELECT * FROM employees ${where} ORDER BY employee_id`,
                values
            );
            return rows.map(row => new Employee(row));
        } catch (error) {
            throw new Error('Error al obtener los empleados');
        }
    }

    // Obtener un empleado por ID
    static async getEmployeeById(id) {
        try {
            const { rows } = await db.query('SELECT * FROM employees WHERE employee_id = $1', [id]);
            if (rows.length === 0) return null;
            return new Employee(rows[0]);
        } catch (error) {
            throw new Error('Error al obtener el empleado');
        }
    }

    // Verificar si un empleado existe (util para validar en orders)
    static async employeeExists(id) {
        try {
            const { rows } = await db.query('SELECT 1 FROM employees WHERE employee_id = $1', [id]);
            return rows.length > 0;
        } catch (error) {
            throw new Error('Error al verificar el empleado');
        }
    }

    // Crear un empleado
    static async createEmployee(data) {
        try {
            const {
                last_name, first_name, title, title_of_courtesy, birth_date,
                hire_date, address, city, region, postal_code, country,
                home_phone, extension, notes, reports_to, photo_path
            } = data;

            const { rows } = await db.query(
                `INSERT INTO employees
                    (last_name, first_name, title, title_of_courtesy, birth_date,
                     hire_date, address, city, region, postal_code, country,
                     home_phone, extension, notes, reports_to, photo_path)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
                 RETURNING *`,
                [last_name, first_name, title, title_of_courtesy, birth_date,
                 hire_date, address, city, region, postal_code, country,
                 home_phone, extension, notes, reports_to, photo_path]
            );
            return new Employee(rows[0]);
        } catch (error) {
            throw new Error('Error al crear el empleado');
        }
    }

    // Actualizar un empleado
    static async updateEmployee(id, data) {
        try {
            const existing = await EmployeeService.getEmployeeById(id);
            if (!existing) return null;

            const merged = { ...existing, ...data };
            const { rows } = await db.query(
                `UPDATE employees SET
                    last_name = $1, first_name = $2, title = $3, title_of_courtesy = $4,
                    birth_date = $5, hire_date = $6, address = $7, city = $8,
                    region = $9, postal_code = $10, country = $11, home_phone = $12,
                    extension = $13, notes = $14, reports_to = $15, photo_path = $16
                 WHERE employee_id = $17
                 RETURNING *`,
                [merged.last_name, merged.first_name, merged.title, merged.title_of_courtesy,
                 merged.birth_date, merged.hire_date, merged.address, merged.city,
                 merged.region, merged.postal_code, merged.country, merged.home_phone,
                 merged.extension, merged.notes, merged.reports_to, merged.photo_path, id]
            );
            return new Employee(rows[0]);
        } catch (error) {
            throw new Error('Error al actualizar el empleado');
        }
    }

    // Eliminar un empleado
    static async deleteEmployee(id) {
        try {
            const { rowCount } = await db.query('DELETE FROM employees WHERE employee_id = $1', [id]);
            return rowCount > 0;
        } catch (error) {
            throw new Error('Error al eliminar el empleado');
        }
    }
}

module.exports = EmployeeService;