const customerService = require('../services/customer.service');

async function getCustomers(req, res, next) {
  try {
    const { search } = req.query;

    const customers = await customerService.getCustomers(search);

    return res.status(200).json({
      success: true,
      message: 'Clientes obtenidos correctamente',
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCustomers,
};