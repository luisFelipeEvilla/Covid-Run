const express = require('express');
const http = require('http');
const socket = require('socket.io');
const chalk = require('chalk');
const logger = require('morgan');
const path = require('path');

// establece las variables de entorno, a partir del archivo .env
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// setup del express
const app = express();
// app.use(logger('tiny'));
app.use(express.static('public'));

// servidor http
const servidor = http.createServer(app);

//socket.io
const io = socket(servidor);

const jugadores = [];

io.on('connection', socket => {
    jugadores.push(socket);
    console.log(`Se ha conectado un nuevo usuario con ID: ${chalk.green(socket.id)}`);
    
    socket.on('contagio', () => {
        socket.emit('contagio', socket.id);
    })

    socket.on('izquierda', () => {
        socket.emit('izquierda', socket.id);
    })

    socket.on('derecha', () => {
        socket.emit('derecha', socket.id);
    })

    socket.on('arriba', () => {
        socket.emit('arriba', socket.id);
    })

    socket.on('quieto', () => {
        socket.emit('quieto', socket.id);
    })

    socket.on('disconnect', () => {
        jugadores.pop(socket);
        console.log(`Se ha desconectado un usuario con ID: ${chalk.red(socket.id)}`);
    })
})

app.get('/', (req, res) => {
    res.send("hello world")
})

servidor.listen(PORT, (req, res) => {
    console.log(`Server listenning on port ${chalk.green(PORT)}`);
})