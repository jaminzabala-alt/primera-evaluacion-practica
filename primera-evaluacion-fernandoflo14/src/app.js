const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const customerRoutes = require('./routes/customer.routes');
const employeeRoutes = require('./routes/employee.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();
const {
  notFoundHandler,
  errorHandler,
} = require('./middlewares/error.middleware');
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Northwind API funcionando correctamente',
  });
});

app.use('/customers', customerRoutes);
app.use('/employees', employeeRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;