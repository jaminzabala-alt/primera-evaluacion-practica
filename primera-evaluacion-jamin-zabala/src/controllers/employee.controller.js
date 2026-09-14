const pool = require('../config/database');

async function getEmployees(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT employee_id, first_name, last_name, title
       FROM employees
       ORDER BY last_name, first_name`
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
  getEmployees
};
