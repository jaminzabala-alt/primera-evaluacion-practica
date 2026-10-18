const pool = require('../config/database');

async function getCustomers(search) {
  let query = `
    SELECT
      customer_id,
      company_name,
      contact_name,
      contact_title,
      city,
      country,
      phone
    FROM customers
  `;

  const values = [];

  if (search) {
    query += `
      WHERE company_name ILIKE $1
         OR contact_name ILIKE $1
         OR customer_id ILIKE $1
    `;

    values.push(`%${search}%`);
  }

  query += ' ORDER BY company_name';

  const result = await pool.query(query, values);

  return result.rows;
}

module.exports = {
  getCustomers,
};