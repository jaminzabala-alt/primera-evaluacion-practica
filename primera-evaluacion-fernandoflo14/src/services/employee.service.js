const pool = require('../config/database');

async function getEmployees(search) {
  let query = `
    SELECT
      employee_id,
      first_name,
      last_name,
      title,
      city,
      country
    FROM employees
  `;

  const values = [];

  if (search) {
    query += `
      WHERE first_name ILIKE $1
         OR last_name ILIKE $1
         OR title ILIKE $1
    `;

    values.push(`%${search}%`);
  }

  query += ' ORDER BY employee_id';

  const result = await pool.query(query, values);

  return result.rows;
}

module.exports = {
  getEmployees,
};