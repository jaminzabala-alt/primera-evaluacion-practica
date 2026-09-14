const pool = require('../config/db');

class OrderService {
  async getAllCustomers() {
    const res = await pool.query('SELECT customer_id, company_name, contact_name, country FROM customers ORDER BY company_name');
    return res.rows;
  }

  async getAllProducts() {
    const res = await pool.query('SELECT product_id, product_name, unit_price, units_in_stock FROM products ORDER BY product_id');
    return res.rows;
  }

  async getOrderById(id) {
    const orderRes = await pool.query(
      `SELECT o.order_id, o.customer_id, o.employee_id, o.order_date, c.company_name
       FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id
       WHERE o.order_id = $1`, [id]
    );
    if (orderRes.rows.length === 0) return null;

    const detailsRes = await pool.query(
      `SELECT d.product_id, p.product_name, d.unit_price, d.quantity, d.discount,
              (d.unit_price * d.quantity * (1 - d.discount)) AS subtotal
       FROM order_details d JOIN products p ON d.product_id = p.product_id
       WHERE d.order_id = $1`, [id]
    );

    const order = orderRes.rows[0];
    order.details = detailsRes.rows;
    return order;
  }

  async createOrder({ customer_id, employee_id, details }) {
    if (!details || !Array.isArray(details) || details.length === 0) {
      throw { statusCode: 400, message: 'La orden debe contener al menos un producto en el detalle' };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const cust = await client.query('SELECT customer_id FROM customers WHERE customer_id = $1', [customer_id]);
      if (cust.rows.length === 0) throw { statusCode: 404, message: `El cliente '${customer_id}' no existe` };

      const emp = await client.query('SELECT employee_id FROM employees WHERE employee_id = $1', [employee_id]);
      if (emp.rows.length === 0) throw { statusCode: 404, message: `El empleado '${employee_id}' no existe` };

      const maxIdRes = await client.query('SELECT COALESCE(MAX(order_id), 0) + 1 AS next_id FROM orders');
      const newOrderId = maxIdRes.rows[0].next_id;

      await client.query(
        `INSERT INTO orders (order_id, customer_id, employee_id, order_date) VALUES ($1, $2, $3, CURRENT_DATE)`,
        [newOrderId, customer_id, employee_id]
      );

      for (const item of details) {
        if (!item.quantity || item.quantity <= 0) {
          throw { statusCode: 400, message: `La cantidad para el producto ID ${item.product_id} debe ser mayor a 0` };
        }

        const prod = await client.query('SELECT product_id, unit_price FROM products WHERE product_id = $1', [item.product_id]);
        if (prod.rows.length === 0) throw { statusCode: 404, message: `El producto ID '${item.product_id}' no existe` };

        await client.query(
          `INSERT INTO order_details (order_id, product_id, unit_price, quantity, discount) VALUES ($1, $2, $3, $4, $5)`,
          [newOrderId, item.product_id, prod.rows[0].unit_price, item.quantity, item.discount || 0]
        );
      }

      await client.query('COMMIT');
      return { order_id: newOrderId, customer_id, employee_id, items_count: details.length };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new OrderService();