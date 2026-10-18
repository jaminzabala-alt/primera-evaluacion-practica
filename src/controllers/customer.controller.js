const pool = require('../config/database');

async function getCustomers(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT customer_id, company_name, contact_name, city, country
       FROM customers
       ORDER BY company_name`
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
  getCustomers
};
