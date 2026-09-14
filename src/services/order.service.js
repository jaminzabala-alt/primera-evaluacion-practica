// services/order.service.js
const db = require('../config/db');
const Order = require('../models/order.entity');

class OrderService {
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

    static async getOrderById(id) {
        try {
            const { rows } = await db.query('SELECT * FROM orders WHERE order_id = $1', [id]);
            if (rows.length === 0) return null;
            return new Order(rows[0]);
        } catch (error) {
            throw new Error('Error al obtener la orden');
        }
    }

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

    // ---------- VALIDACIONES DE EXISTENCIA ----------

    static async _customerExists(client, customer_id) {
        const { rows } = await client.query(
            'SELECT customer_id FROM customers WHERE customer_id = $1',
            [customer_id]
        );
        return rows.length > 0;
    }

    static async _employeeExists(client, employee_id) {
        const { rows } = await client.query(
            'SELECT employee_id FROM employees WHERE employee_id = $1',
            [employee_id]
        );
        return rows.length > 0;
    }

    static async _getProduct(client, product_id) {
        const { rows } = await client.query(
            'SELECT product_id, product_name, unit_price, discontinued FROM products WHERE product_id = $1',
            [product_id]
        );
        return rows[0] || null;
    }

    // ---------- CREAR ORDEN (CABECERA + DETALLE, CON TRANSACCIÓN) ----------

    static async createOrder(data) {
        const {
            customer_id, employee_id, order_date, required_date, shipped_date,
            ship_via, freight, ship_name, ship_address, ship_city,
            ship_region, ship_postal_code, ship_country,
            details // [{ product_id, quantity, unit_price?, discount? }, ...]
        } = data;

        // Validación de estructura básica
        if (!customer_id || !employee_id) {
            throw { status: 400, message: 'customer_id y employee_id son obligatorios' };
        }
        if (!Array.isArray(details) || details.length === 0) {
            throw { status: 400, message: 'La orden debe incluir al menos un producto en "details"' };
        }
        for (const item of details) {
            if (!item.product_id || !item.quantity || item.quantity <= 0) {
                throw { status: 400, message: 'Cada producto debe tener product_id y quantity > 0' };
            }
        }

        const client = await db.connect(); // cliente dedicado del pool
        try {
            await client.query('BEGIN');

            // Validar existencia de cliente y empleado
            const customerOk = await OrderService._customerExists(client, customer_id);
            if (!customerOk) {
                throw { status: 400, message: `El cliente ${customer_id} no existe` };
            }
            const employeeOk = await OrderService._employeeExists(client, employee_id);
            if (!employeeOk) {
                throw { status: 400, message: `El empleado ${employee_id} no existe` };
            }

            // Validar existencia de cada producto y resolver precio/nombre
            const resolvedDetails = [];
            for (const item of details) {
                const product = await OrderService._getProduct(client, item.product_id);
                if (!product) {
                    throw { status: 400, message: `El producto ${item.product_id} no existe` };
                }
                resolvedDetails.push({
                    order_id: null, // se completa después de insertar la cabecera
                    product_id: product.product_id,
                    product_name: product.product_name,
                    unit_price: item.unit_price ?? product.unit_price,
                    quantity: item.quantity,
                    discount: item.discount ?? 0
                });
            }

            // Insertar cabecera en 'orders'
            const { rows: orderRows } = await client.query(
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
            const newOrder = orderRows[0];

            // Insertar cada línea en 'order_details' y completar order_id en memoria
            for (const d of resolvedDetails) {
                d.order_id = newOrder.order_id;
                await client.query(
                    `INSERT INTO order_details
                        (order_id, product_id, unit_price, quantity, discount)
                     VALUES ($1,$2,$3,$4,$5)`,
                    [d.order_id, d.product_id, d.unit_price, d.quantity, d.discount]
                );
            }

            await client.query('COMMIT');

            const fullOrder = new Order(newOrder);
            fullOrder.details = resolvedDetails;
            return fullOrder;

        } catch (error) {
            await client.query('ROLLBACK');
            if (error.status) throw error;
            throw new Error('Error al crear la orden: ' + error.message);
        } finally {
            client.release();
        }
    }

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