const express = require('express');
const cors = require('cors');

const routes = require('./Routes');
const database = require('./app/database/Connector');

const PORT = 3333;
const server = express();

database();

const serverConfig = () => {
    server.use(cors());
    server.use(express.json());
    server.use(routes);
};

serverConfig();

server.listen(PORT);