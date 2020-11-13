const express = require('express');
const chalk = require('chalk');
const morgan = require('morgan');

// establece las variables de entorno, a partir del archivo .env
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// setup del servidor
const app = express();
app.use(morgan('tiny'));

app.get('/', (req, res) => {
    res.send("hello world")
})

app.listen(PORT, (req, res) => {
    console.log(`Server listenning on port ${chalk.green(PORT)}`);
})