
const path = require('path');
const fs = require('fs');

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const routePath = path.join(__dirname, '..', 'routes');

const routeFiles = fs
    .readdirSync(routePath)
    .filter((file) => file.endsWith('.js'))
    .map((file) => path.join(routePath, file));

const options = {
    definition: {
        openapi: '3.0.0',

        info: {
            title: 'API de Ordenes de Venta - NorthWind (PostgreSQL)',
            version: '1.0.0',
            description:
                'Documentacion de la API para la generacion de ordenes de venta usando NorthWind',
        },

        servers: [
    {
        url: 'http://localhost:3000/api',
        description: 'Servidor local',
    },
],
    },

    apis: routeFiles,
};

const swaggerSpec = swaggerJSDoc(options);

console.log('Archivos Swagger buscando:', options.apis);
console.log('Endpoints encontrados:', swaggerSpec.paths);

const swaggerDocs = (app) => {
    app.use(
        '/api-docs',
        swaggerUI.serve,
        swaggerUI.setup(swaggerSpec)
    );
};

module.exports = swaggerDocs;

