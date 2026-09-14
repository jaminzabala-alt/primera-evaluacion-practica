const pool = require('../config/database');

function createServiceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getOrderById(orderId) {
  const orderQuery = `
    SELECT
      o.order_id,
      o.customer_id,
      c.company_name AS customer_name,
      o.employee_id,
      e.first_name,
      e.last_name,
      o.order_date,
      o.required_date,
      o.shipped_date,
      o.ship_via,
      o.freight,
      o.ship_name,
      o.ship_address,
      o.ship_city,
      o.ship_region,
      o.ship_postal_code,
      o.ship_country
    FROM orders o
    JOIN customers c
      ON c.customer_id = o.customer_id
    JOIN employees e
      ON e.employee_id = o.employee_id
    WHERE o.order_id = $1
  `;

  const orderResult = await pool.query(orderQuery, [orderId]);

  if (orderResult.rows.length === 0) {
    return null;
  }

  const detailsQuery = `
    SELECT
      od.product_id,
      p.product_name,
      od.unit_price,
      od.quantity,
      od.discount,
      ROUND(
        (
          od.unit_price::numeric *
          od.quantity::numeric *
          (1 - od.discount::numeric)
        ),
        2
      ) AS line_total
    FROM order_details od
    JOIN products p
      ON p.product_id = od.product_id
    WHERE od.order_id = $1
    ORDER BY od.product_id
  `;

  const detailsResult = await pool.query(detailsQuery, [orderId]);

  return {
    ...orderResult.rows[0],
    details: detailsResult.rows,
  };
}

async function createOrder(orderData) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const customerResult = await client.query(
      `
        SELECT customer_id
        FROM customers
        WHERE customer_id = $1
      `,
      [orderData.customer_id]
    );

    if (customerResult.rows.length === 0) {
      throw createServiceError('Cliente no encontrado', 404);
    }

    const employeeResult = await client.query(
      `
        SELECT employee_id
        FROM employees
        WHERE employee_id = $1
      `,
      [orderData.employee_id]
    );

    if (employeeResult.rows.length === 0) {
      throw createServiceError('Empleado no encontrado', 404);
    }

    const productIds = orderData.products.map(
      (item) => item.product_id
    );

    const productsResult = await client.query(
      `
        SELECT
          product_id,
          product_name,
          unit_price,
          units_in_stock,
          discontinued
        FROM products
        WHERE product_id = ANY($1::smallint[])
        ORDER BY product_id
        FOR UPDATE
      `,
      [productIds]
    );

    if (productsResult.rows.length !== productIds.length) {
      const foundIds = productsResult.rows.map(
        (product) => Number(product.product_id)
      );

      const missingIds = productIds.filter(
        (id) => !foundIds.includes(id)
      );

      throw createServiceError(
        `Producto(s) no encontrado(s): ${missingIds.join(', ')}`,
        404
      );
    }

    const productMap = new Map(
      productsResult.rows.map((product) => [
        Number(product.product_id),
        product,
      ])
    );

    for (const item of orderData.products) {
      const product = productMap.get(item.product_id);

      if (Number(product.discontinued) !== 0) {
        throw createServiceError(
          `El producto ${product.product_id} está descontinuado`,
          400
        );
      }

      if (Number(product.units_in_stock) < item.quantity) {
        throw createServiceError(
          `Stock insuficiente para el producto ${product.product_id}`,
          400
        );
      }
    }

    // order_id no tiene SERIAL ni IDENTITY en esta base.
    // Bloqueamos escrituras concurrentes mientras calculamos el siguiente ID.
    await client.query(
      'LOCK TABLE orders IN SHARE ROW EXCLUSIVE MODE'
    );

    const nextIdResult = await client.query(`
      SELECT COALESCE(MAX(order_id), 0)::integer + 1 AS next_order_id
      FROM orders
    `);

    const orderId = Number(
      nextIdResult.rows[0].next_order_id
    );

    if (orderId > 32767) {
      throw createServiceError(
        'No es posible generar un nuevo order_id',
        500
      );
    }

    await client.query(
      `
        INSERT INTO orders (
          order_id,
          customer_id,
          employee_id,
          order_date,
          required_date
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        orderId,
        orderData.customer_id,
        orderData.employee_id,
        orderData.order_date,
        orderData.required_date,
      ]
    );

    for (const item of orderData.products) {
      const product = productMap.get(item.product_id);

      await client.query(
        `
          INSERT INTO order_details (
            order_id,
            product_id,
            unit_price,
            quantity,
            discount
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          orderId,
          item.product_id,
          product.unit_price,
          item.quantity,
          item.discount,
        ]
      );

      await client.query(
        `
          UPDATE products
          SET units_in_stock =
            units_in_stock - $1::smallint
          WHERE product_id = $2
        `,
        [
          item.quantity,
          item.product_id,
        ]
      );
    }

    await client.query('COMMIT');

    return orderId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getOrderById,
  createOrder,
};