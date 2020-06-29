const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bluebird = require('bluebird');
const next = require('next');
const { Env } = require('./config');
const { connect: connectBridge } = require('./bridge');
const middleware = require('./config/middleware');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();
server.use(cors())

const sqlPool = mysql.createPool({
    connectionLimit: Env.DB_MAX_CONNECTIONS,
    host: Env.DB_HOST,
    user: Env.DB_USER,
    password: Env.DB_PASS,
    database: Env.DB_SCHEMA,
    Promise: bluebird
});

const setupRoutes = () => {
    server.get('*', middleware, (req, res) => {
        req.sqlPool = sqlPool.promise();
        handle(req, res);
    });
    server.post('/api/account/login', (req, res) => {
        req.sqlPool = sqlPool.promise();
        handle(req, res);
    });
    server.post('/api/account/create', (req, res) => {
        req.sqlPool = sqlPool.promise();
        handle(req, res);
    });
}

server.listen(process.env.PORT || 3000, () => {
    app.prepare().then(() => {
        setupRoutes();
        connectBridge();
    }).catch((ex) => {
        console.error(ex.stack);
        process.exit(1);
    })
    console.log(`Started on port ${process.env.PORT || 3000}`)
});
