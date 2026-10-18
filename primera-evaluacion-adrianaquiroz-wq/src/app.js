const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const routes = require('./routes/index'); // Especificamos /index explícitamente

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Configuración de Swagger UI
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Northwind API Examen',
      version: '1.0.0',
      description: 'Documentación interactiva de endpoints Northwind',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Redireccionar la raíz '/' hacia Swagger
app.get('/', (req, res) => res.redirect('/api-docs'));

// Rutas de la API
app.use('/api', routes);

// Middleware centralizado de errores
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ status: 'error', message: err.message || 'Error interno' });
});

module.exports = app;