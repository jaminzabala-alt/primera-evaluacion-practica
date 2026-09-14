const {Pool} = require('pg');// variable de posgres
require('dotenv').config();  //invocando a .env


const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,

    max: 12,
});

module.exports = pool;