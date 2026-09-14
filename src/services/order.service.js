// services/order.service.js
const db = require('../config/db');
const Order = require('../models/order.entity');

class OrderService {
    // Obtener todas las ordenes (con filtros opcionales)
    static async getAllOrders({ customer_id, employee_id } = {}) {
        try {
            const conditions = [];
            const values = [];

            if (customer_id) {
                values.push(customer_id);
                conditions.push(`customer_id = $${values.length}`);
            }
            if (employee_id) {
                values.push(employee_id);
                conditions.push(`employee_id = $${values.length}`);
            }

            const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
            const { rows } = await db.query(
                `SELECT * FROM orders ${where} ORDER BY order_id`,
                values
            );
            return rows.map(row => new Order(row));
        } catch (error) {
            throw new Error('Error al obtener las ordenes');
        }
    }

    // Obtener una orden por ID
    static async getOrderById(id) {
        try {
            const { rows } = await db.query('SELECT * FROM orders WHERE order_id = $1', [id]);
            if (rows.length === 0) return null;
            return new Order(rows[0]);
        } catch (error) {
            throw new Error('Error al obtener la orden');
        }
    }

    // Obtener el detalle de una orden (order_details)
    static async getOrderDetails(id) {
        try {
            const { rows } = await db.query(
                `SELECT od.*, p.product_name
                 FROM order_details od
                 JOIN products p ON p.product_id = od.product_id
                 WHERE od.order_id = $1`,
                [id]
            );
            return rows;
        } catch (error) {
            throw new Error('Error al obtener el detalle de la orden');
        }
    }

    // Crear una orden
    static async createOrder(data) {
        try {
            const {
                customer_id, employee_id, order_date, required_date, shipped_date,
                ship_via, freight, ship_name, ship_address, ship_city,
                ship_region, ship_postal_code, ship_country
            } = data;

            const { rows } = await db.query(
                `INSERT INTO orders
                    (customer_id, employee_id, order_date, required_date, shipped_date,
                     ship_via, freight, ship_name, ship_address, ship_city,
                     ship_region, ship_postal_code, ship_country)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
                 RETURNING *`,
                [customer_id, employee_id, order_date, required_date, shipped_date,
                 ship_via, freight, ship_name, ship_address, ship_city,
                 ship_region, ship_postal_code, ship_country]
            );
            return new Order(rows[0]);
        } catch (error) {
            throw new Error('Error al crear la orden');
        }
    }

    // Actualizar una orden
    static async updateOrder(id, data) {
        try {
            const existing = await OrderService.getOrderById(id);
            if (!existing) return null;

            const merged = { ...existing, ...data };
            const { rows } = await db.query(
                `UPDATE orders SET
                    customer_id = $1, employee_id = $2, order_date = $3, required_date = $4,
                    shipped_date = $5, ship_via = $6, freight = $7, ship_name = $8,
                    ship_address = $9, ship_city = $10, ship_region = $11,
                    ship_postal_code = $12, ship_country = $13
                 WHERE order_id = $14
                 RETURNING *`,
                [merged.customer_id, merged.employee_id, merged.order_date, merged.required_date,
                 merged.shipped_date, merged.ship_via, merged.freight, merged.ship_name,
                 merged.ship_address, merged.ship_city, merged.ship_region,
                 merged.ship_postal_code, merged.ship_country, id]
            );
            return new Order(rows[0]);
        } catch (error) {
            throw new Error('Error al actualizar la orden');
        }
    }

    // Eliminar una orden
    static async deleteOrder(id) {
        try {
            const { rowCount } = await db.query('DELETE FROM orders WHERE order_id = $1', [id]);
            return rowCount > 0;
        } catch (error) {
            throw new Error('Error al eliminar la orden');
        }
    }
}

module.exports = OrderService;