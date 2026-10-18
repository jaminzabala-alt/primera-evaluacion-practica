require('dotenv').config();

const app = require('./app');

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT} (${NODE_ENV})`);
        if (NODE_ENV !== 'production') {
            console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
        }
    });
}