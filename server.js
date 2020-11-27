const express = require("express");
const http = require("http");
const socket = require("socket.io");
const chalk = require("chalk");
//const logger = require("morgan");
const path = require("path");

// establece las variables de entorno, a partir del archivo .env
require("dotenv").config();

const PORT = process.env.PORT || 3000;

// setup del express
const app = express();
// app.use(logger('tiny'));
app.use(express.static("public"));

// servidor http
const servidor = http.createServer(app);

//socket.io
const io = socket(servidor);

const jugadores = [];

// conexion de un cliente
io.on("connection", (socket) => {
  socket.on("nuevoJugador", id => {
    let found = false;

    jugadores.forEach(jugador => {
      if (jugador.id == socket.id) {
        found = true;
      }
    });

    if (!found) {
      jugadores.push({id: socket.id, listo: false});
      console.log(
        `Se ha conectado un nuevo usuario con ID: ${chalk.green(socket.id)}`
      );
      console.log(`número de jugadores actual: ${jugadores.length}`);
     
    }
    io.emit("actualizarJugadores", {jugadores, id: socket.id});
  });

  socket.on('start', () => {
    
    jugadores.forEach(jugador => {
      if (jugador.id == socket.id) {
        console.log(socket.id);
        jugador.listo = true;
      }
    })

    io.emit('preparados', jugadores)
  })

  socket.on("crearJugadores", () => {
      io.emit("actualizarJugadores", {jugadores, id: socket.id});
  })
  
  socket.on("contagio", () => {
    io.emit("contagio", socket.id);
  });

  socket.on("gameOver", (score) => {
    jugadores.forEach(jugador=> {
      if (jugador.id == socket.id) {
        jugador.score = score;
      }
    });

    io.emit("listaPuntajes", jugadores );
  })

  socket.on("izquierda", () => {
    io.emit("izquierda", socket.id);
  });

  socket.on("derecha", () => {
    io.emit("derecha", socket.id);
  });

  socket.on("arriba", () => {
    io.emit("arriba", socket.id);
  });

  socket.on("quieto", () => {
    io.emit("quieto", socket.id);
  });

  socket.on("disconnect", () => {
    jugadores.pop(socket.id);
    console.log(
      `Se ha desconectado un usuario con ID: ${chalk.red(socket.id)}`
    );
    io.emit("actualizarJugadores", {jugadores, id: socket.id})
  });
});

app.get("/", (req, res) => {
  res.send("hello world");
});

servidor.listen(PORT, (req, res) => {
  console.log(`Server listenning on port ${chalk.green(PORT)}`);
});
