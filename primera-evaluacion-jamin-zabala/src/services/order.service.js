const pool = require('../config/database');
const { createHttpError } = require('../middleware/error.middleware');

function isDiscontinued(value) {
  return value === true || value === 'true' || Number(value) === 1;
}

function validateOrderPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw createHttpError(400, 'El cuerpo de la solicitud es obligatorio');
  }

  const { customer_id, employee_id, products } = payload;

  if (customer_id === undefined || customer_id === null || String(customer_id).trim() === '') {
    throw createHttpError(400, 'customer_id es obligatorio');
  }

  if (employee_id === undefined || employee_id === null || String(employee_id).trim() === '') {
    throw createHttpError(400, 'employee_id es obligatorio');
  }

  if (Number.isNaN(Number(employee_id))) {
    throw createHttpError(400, 'employee_id debe ser un número válido');
  }

  if (products === undefined || products === null) {
    throw createHttpError(400, 'products es obligatorio');
  }

  if (!Array.isArray(products)) {
    throw createHttpError(400, 'products debe ser un arreglo');
  }

  if (products.length === 0) {
    throw createHttpError(400, 'Debe contener por lo menos un producto');
  }

  products.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      throw createHttpError(400, `El producto en la posición ${index} es inválido`);
    }

    if (item.product_id === undefined || item.product_id === null) {
      throw createHttpError(400, `product_id es obligatorio en la posición ${index}`);
    }

    const productId = Number(item.product_id);
    if (!Number.isInteger(productId) || productId <= 0 || productId > 32767) {
      throw createHttpError(400, `product_id inválido en la posición ${index}`);
    }

    const quantity = Number(item.quantity);
    if (Number.isNaN(quantity) || quantity <= 0) {
      throw createHttpError(400, `quantity debe ser mayor a 0 en la posición ${index}`);
    }

    const discount = item.discount === undefined || item.discount === null ? 0 : Number(item.discount);
    if (Number.isNaN(discount) || discount < 0) {
      throw createHttpError(400, `discount no puede ser negativo en la posición ${index}`);
    }
  });
}

async function getOrderById(orderId) {
  const orderResult = await pool.query(
    `SELECT order_id, customer_id, employee_id, order_date
     FROM orders
     WHERE order_id = $1`,
    [orderId]
  );

  if (orderResult.rowCount === 0) {
    return null;
  }

  const detailsResult = await pool.query(
    `SELECT
       od.product_id,
       p.product_name,
       od.unit_price,
       od.quantity,
       od.discount
     FROM order_details od
     INNER JOIN products p ON p.product_id = od.product_id
     WHERE od.order_id = $1
     ORDER BY od.product_id`,
    [orderId]
  );

  return {
    ...orderResult.rows[0],
    details: detailsResult.rows
  };
}

async function createOrder(payload) {
  validateOrderPayload(payload);

  const customerId = String(payload.customer_id).trim();
  const employeeId = Number(payload.employee_id);
  const orderDate = payload.order_date || new Date();
  const products = payload.products;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const customerResult = await client.query(
      'SELECT customer_id FROM customers WHERE customer_id = $1',
      [customerId]
    );

    if (customerResult.rowCount === 0) {
      throw createHttpError(404, 'El cliente no existe');
    }

    const employeeResult = await client.query(
      'SELECT employee_id FROM employees WHERE employee_id = $1',
      [employeeId]
    );

    if (employeeResult.rowCount === 0) {
      throw createHttpError(404, 'El empleado no existe');
    }

    // Northwind importa order_id como smallint NOT NULL, sin DEFAULT ni secuencia.
    // El siguiente identificador se calcula dentro de la transacción para no chocar con MAX(order_id).
    await client.query('LOCK TABLE orders IN SHARE ROW EXCLUSIVE MODE');

    const orderResult = await client.query(
      `INSERT INTO orders (order_id, customer_id, employee_id, order_date)
       SELECT COALESCE(MAX(order_id), 0) + 1, $1, $2, $3
       FROM orders
       RETURNING order_id, customer_id, employee_id, order_date`,
      [customerId, employeeId, orderDate]
    );

    const order = orderResult.rows[0];
    const details = [];

    for (const item of products) {
      const quantity = Number(item.quantity);
      const discount =
        item.discount === undefined || item.discount === null ? 0 : Number(item.discount);
      const productId = Number(item.product_id);

      const productResult = await client.query(
        `SELECT product_id, product_name, unit_price, units_in_stock, discontinued
         FROM products
         WHERE product_id = $1
         FOR UPDATE`,
        [productId]
      );

      if (productResult.rowCount === 0) {
        throw createHttpError(404, 'Producto no encontrado');
      }

      const product = productResult.rows[0];

      if (isDiscontinued(product.discontinued)) {
        throw createHttpError(400, `El producto ${product.product_id} está descontinuado`);
      }

      if (
        product.units_in_stock !== undefined &&
        product.units_in_stock !== null &&
        Number(product.units_in_stock) < quantity
      ) {
        throw createHttpError(
          400,
          `Stock insuficiente para el producto ${product.product_id}`
        );
      }

      await client.query(
        `INSERT INTO order_details (order_id, product_id, unit_price, quantity, discount)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.order_id, product.product_id, product.unit_price, quantity, discount]
      );

      if (product.units_in_stock !== undefined && product.units_in_stock !== null) {
        const stockUpdate = await client.query(
          `UPDATE products
           SET units_in_stock = units_in_stock - $1
           WHERE product_id = $2
             AND units_in_stock >= $1`,
          [quantity, product.product_id]
        );

        if (stockUpdate.rowCount === 0) {
          throw createHttpError(
            400,
            `Stock insuficiente para el producto ${product.product_id}`
          );
        }
      }

      details.push({
        product_id: product.product_id,
        product_name: product.product_name,
        unit_price: product.unit_price,
        quantity,
        discount
      });
    }

    await client.query('COMMIT');

    return {
      ...order,
      details
    };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error(rollbackError);
    }

    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getOrderById,
  createOrder
};
