const pool = require('../config/database');

async function getProducts(search, available) {
  let query = `
    SELECT
      product_id,
      product_name,
      quantity_per_unit,
      unit_price,
      units_in_stock,
      units_on_order,
      reorder_level,
      discontinued
    FROM products
    WHERE discontinued = 0
  `;

  const values = [];

  if (search) {
    values.push(`%${search}%`);

    query += `
      AND product_name ILIKE $${values.length}
    `;
  }

  if (available === 'true') {
    query += `
      AND units_in_stock > 0
    `;
  }

  query += ' ORDER BY product_name';

  const result = await pool.query(query, values);

  return result.rows;
}

module.exports = {
  getProducts,
};