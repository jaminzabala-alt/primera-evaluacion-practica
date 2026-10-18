// services/customer.service.js
const db = require('../config/db');
const Customer = require('../models/customer.entity');

class CustomerService {
    // Obtener todos los clientes (con filtros opcionales)
    static async getAllCustomers({ city, country } = {}) {
        try {
            const conditions = [];
            const values = [];

            if (city) {
                values.push(city);
                conditions.push(`city = $${values.length}`);
            }
            if (country) {
                values.push(country);
                conditions.push(`country = $${values.length}`);
            }

            const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
            const { rows } = await db.query(
                `SELECT * FROM customers ${where} ORDER BY customer_id`,
                values
            );
            return rows.map(row => new Customer(row));
        } catch (error) {
            throw new Error('Error al obtener los clientes');
        }
    }

    // Obtener un cliente por ID
    static async getCustomerById(id) {
        try {
            const { rows } = await db.query('SELECT * FROM customers WHERE customer_id = $1', [id]);
            if (rows.length === 0) return null;
            return new Customer(rows[0]);
        } catch (error) {
            throw new Error('Error al obtener el cliente');
        }
    }

    // Verificar si un cliente existe (util para validar al crear ordenes)
    static async customerExists(id) {
        try {
            const { rows } = await db.query('SELECT 1 FROM customers WHERE customer_id = $1', [id]);
            return rows.length > 0;
        } catch (error) {
            throw new Error('Error al verificar el cliente');
        }
    }

    // Crear un cliente
    static async createCustomer(data) {
        try {
            const {
                customer_id, company_name, contact_name, contact_title,
                address, city, region, postal_code, country, phone, fax
            } = data;

            const { rows } = await db.query(
                `INSERT INTO customers
                    (customer_id, company_name, contact_name, contact_title,
                     address, city, region, postal_code, country, phone, fax)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                 RETURNING *`,
                [customer_id, company_name, contact_name, contact_title,
                 address, city, region, postal_code, country, phone, fax]
            );
            return new Customer(rows[0]);
        } catch (error) {
            throw new Error('Error al crear el cliente');
        }
    }

    // Actualizar un cliente
    static async updateCustomer(id, data) {
        try {
            const existing = await CustomerService.getCustomerById(id);
            if (!existing) return null;

            const merged = { ...existing, ...data };
            const { rows } = await db.query(
                `UPDATE customers SET
                    company_name = $1, contact_name = $2, contact_title = $3,
                    address = $4, city = $5, region = $6, postal_code = $7,
                    country = $8, phone = $9, fax = $10
                 WHERE customer_id = $11
                 RETURNING *`,
                [merged.company_name, merged.contact_name, merged.contact_title,
                 merged.address, merged.city, merged.region, merged.postal_code,
                 merged.country, merged.phone, merged.fax, id]
            );
            return new Customer(rows[0]);
        } catch (error) {
            throw new Error('Error al actualizar el cliente');
        }
    }

    // Eliminar un cliente
    static async deleteCustomer(id) {
        try {
            const { rowCount } = await db.query('DELETE FROM customers WHERE customer_id = $1', [id]);
            return rowCount > 0;
        } catch (error) {
            throw new Error('Error al eliminar el cliente');
        }
    }
}

module.exports = CustomerService;