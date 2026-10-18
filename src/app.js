const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const customerRoutes = require('./routes/customer.routes');
const employeeRoutes = require('./routes/employee.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const { errorMiddleware } = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API REST Northwind funcionando correctamente'
  });
});

app.use('/customers', customerRoutes);
app.use('/employees', employeeRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

app.use(errorMiddleware);

module.exports = app;
