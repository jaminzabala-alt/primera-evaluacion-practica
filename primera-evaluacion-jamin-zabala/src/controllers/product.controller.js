const pool = require('../config/database');

async function getProducts(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT product_id, product_name, unit_price, units_in_stock, discontinued
       FROM products
       ORDER BY product_name`
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts
};
