// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const customerRoutes = require('./routes/customer');
const employeeRoutes = require('./routes/employee');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const swaggerDocs = require('./config/swagger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/customers', customerRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Swagger se registra ANTES del catch-all
const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV !== 'production') {
    swaggerDocs(app);
}

// 404 - ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ error: 'Recurso no encontrado' });
});

// Middleware centralizado de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: 'Error interno del servidor' });
});

module.exports = app;