
require('dotenv').config();

const sql = require('mssql');


const config = {

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    server: process.env.DB_SERVER,

    database: process.env.DB_DATABASE,

    port: 1433,

    options: {

        trustServerCertificate: true
    }
};


let pool;


async function connectDB() {

    try {

        pool = await sql.connect(config);

        console.log('Conectado a SQL Server');

    } catch (error) {

        console.log(error);
    }
}


function getPool() {

    return pool;
}


module.exports = {

    connectDB,

    getPool
};