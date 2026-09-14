const productService = require('../services/product.service');

async function getProducts(req, res, next){
  try {
    const { search, available } = req.query;

    const products = await productService.getProducts(
      search,
      available
    );

    return res.status(200).json({
      success: true,
      message: 'Productos obtenidos correctamente',
      count: products.length,
      data: products,
    });
  } catch (error) {
  next(error);
}
}

module.exports = {
  getProducts,
};