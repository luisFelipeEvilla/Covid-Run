// carga los elementos iniciales del juego
export default class GameScene extends Phaser.Scene {
  // key, es el nombre mediante el cual se hara referencia a la escena
  constructor() {
    super({ key: "game" });
  }

  init(socket) {
    this.score = 0;
    this.platforms = null;
    this.player = null;
    this.cursors = null;
    this.score = 0;
    this.scoreText = "";
    this.obstaculos = null;
    this.gameOver = false;
    this.personajeCreado = false;

    // acumulador de tiempo entre cada actualización
    this.fps = 0;
    this.acumulador = 0;
    this.socket = socket;
    this.velocidadObstaculos = -100;
  }

  preload() {
    this.load.image("fondo", "assets/fondos/Fondo1.png");
    this.load.image("suelo", "assets/fondos/Borde.png");
    this.load.spritesheet("obstaculo", "assets/virus.png", {
      frameWidth: 44,
      frameHeight: 30,
    });
    this.load.spritesheet(
      "personaje1",
      "assets/personajes/principal/principal.png",
      { frameWidth: 64, frameHeight: 64 }
    );
    this.load.spritesheet(
      "personaje2",
      "assets/personajes/principal/Principal2.png",
      { frameWidth: 64, frameHeight: 64 }
    );
  }

  // crear los elementos del juego
  create() {
    // añadir musica

    // añadir suelo
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(300, 425.5, "suelo").setScale(1.3, 1).refreshBody();

    // añadir el fondo
    this.fondo = this.add.tileSprite(0, 0, 850, 423, "fondo");
    this.fondo.setOrigin(0, 0);

    //añadir personaje
    this.players = this.physics.add.group();
    this.animarPersonaje();
    this.moverPersonaje();
    this.socket.emit("crearJugadores");

    this.socket.on("actualizarJugadores", (data) => {
      this.crearPersonaje(data);
    });

    this.socket.on("contagio", (id) => {
      this.players.children.iterate((jugador) => {
        if (jugador.id == id) {
          this.contagio(jugador);
        }
      });
    });

    // contador de score
    this.scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
      fill: "#fff",
    });
    this.fpsText = this.add.text(16, 48, "fps: 0", {
      fontSize: "32px",
      fill: "#fff",
    });

    //colisiones entre suelo y personaje
    this.physics.add.collider(this.players, this.platforms);

    // observando cuando las teclas son presionadas
    this.cursors = this.input.keyboard.createCursorKeys();

    // añadiendo el grupo de obstaculos
    this.obstaculos = this.physics.add.group();

    this.obstaculos.createMultiple({
      key: "obstaculo",
      repeat: 3,
      setXY: {
        x: 400,
        y: 370,
        stepX: 300,
      },
    });

    this.obstaculos.children.iterate(obstaculo => {
      obstaculo.anims.play('covid');
    })

    this.obstaculos.setVelocityX(this.velocidadObstaculos);

    this.physics.add.overlap(
      this.players,
      this.obstaculos,
      (jugador, obstaculo) => {
        if (jugador.id == this.socket.id && jugador.vivo) {
          this.socket.emit("contagio");
        }
      },
      null,
      this
    );

    this.physics.add.collider(this.platforms, this.obstaculos);
  }

  // crear los personajes a medida que se van conectando
  crearPersonaje(data) {
    var jugadores = data.jugadores;

    jugadores.forEach((jugador) => {
      var found = false;

      this.players.children.iterate((j) => {
        if (j.id == jugador.id) {
          found = true;
        }
      });

      if (!found) {
        var nuevoJugador = this.physics.add
          .sprite(100, 270, `personaje${cont}`)
          .setScale(1.5, 1.5);
        nuevoJugador.setBounce("0.2");

        this.players.add(nuevoJugador);
        nuevoJugador.id = jugador.id;
        nuevoJugador.setCollideWorldBounds(true);
        nuevoJugador.vivo = true;
        nuevoJugador.setSize(30, 60);

        if (nuevoJugador.id == this.socket.id) {
          this.player = nuevoJugador;
          this.player.personaje = cont;
        }

        cont++;
      }
    });
  }

  // se ejecuta cuando un jugador choca contra algun elemento infectado
  contagio(player) {
    if (player.id == this.socket.id) {
      this.gameOver = true;
    }
    player.setTint(0xff0000);
    //player.anims.play("turn");
    //player.setVelocityY(-300);
    player.setVelocityX(0);
    player.vivo = false;

    this.time.addEvent({
      delay: 1500,
      callback: () => {
        player.setActive(false);
        player.setVisible(false);
      },
      loop: false,
    });

    var aux = true;

    this.players.children.iterate((jugador) => {
      if (jugador.vivo == true) {
        aux = false;
      }
    });

    if (aux) {
      this.time.addEvent({
        delay: 1500,
        callback: () => {
          this.scene.stop();

          this.scene.start("gameOver", {
            score: this.score,
            socket: this.socket,
          });
        },
        loop: false,
      });
    }
  }

  // crea los obstaculos infectados
  crearObstaculo(posicionX) {
    var obstaculo;

    obstaculo = this.physics.add.sprite(posicionX, 370, "obstaculo");
    this.obstaculos.add(obstaculo);
    if (obstaculo != null) {
      obstaculo.anims.play('covid');
    }
    this.obstaculos.setVelocityX(this.velocidadObstaculos);
  }

  //animacines de movimiento del personaje
  animarPersonaje() {
    this.anims.create({
      key: "left1",
      frames: this.anims.generateFrameNumbers("personaje1", {
        start: 117,
        end: 125,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn1",
      frames: [{ key: "personaje1", frame: 26 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right1",
      frames: this.anims.generateFrameNumbers("personaje1", {
        start: 143,
        end: 151,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "left2",
      frames: this.anims.generateFrameNumbers("personaje2", {
        start: 117,
        end: 125,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn2",
      frames: [{ key: "personaje2", frame: 26 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right2",
      frames: this.anims.generateFrameNumbers("personaje2", {
        start: 143,
        end: 151,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "covid",
      frames: this.anims.generateFrameNumbers("obstaculo", {
        start: 0,
        end: 9
      }),
      frameRate: 15,
      repeat: -1
    })
  }

  // recibe los eventos de movimiento de los personajes
  moverPersonaje() {
    this.socket.on("izquierda", (id) => {
      if (id != this.socket.id) {
        var cont = 1;

        this.players.children.iterate((jugador) => {
          if (jugador.id === id) {
            jugador.setVelocityX(-160);
            jugador.anims.play(`left${cont}`);
          }
          cont++;
        });
      }
    });

    this.socket.on("derecha", (id) => {
      if (id != this.socket.id) {
        var cont = 1;

        this.players.children.iterate((j) => {
          if (j.id === id) {
            j.setVelocityX(160);
            j.anims.play(`right${cont}`);
          } else {
            cont++;
          }
        });
      }
    });

    this.socket.on("quieto", (id) => {
      if (id != this.socket.id) {
        var cont = 1;

        this.players.children.iterate((j) => {
          if (j.id === id) {
            j.setVelocityX(0);
            j.anims.play(`turn${cont}`);
          } else {
            cont++;
          }
        });
      }
    });

    this.socket.on("arriba", (id) => {
      if (id != this.socket.id) {
        this.players.children.iterate((j) => {
          if (j.id === id && j.body.touching.down) {
            j.setVelocityY(-250);
          }
        });
      }
    });
  }

  update(time, dt) {
    this.fondo.tilePositionX += 3;
    this.acumulador += dt;
    this.contadorDelay += dt;
    this.fps++;

    // cada vez que pase 1 segundo
    if (this.acumulador > 1000) {
      if (!this.gameOver) {
        this.score += 1;
        this.scoreText.setText("Score: " + this.score);
        this.fpsText.setText("fps: " + this.fps);
        this.fps = 0;
        this.velocidadObstaculos -= 3;
      }
      this.acumulador -= 1000;
    }

    if (this.acumulador > 150) {
      if (!this.gameOver) {
        if (this.cursors.left.isDown) {
          this.socket.emit("izquierda", this.socket.id);
  
          this.player.setVelocityX(-160);
          this.player.anims.play(`left${this.player.personaje}`);
        } else {
          if (this.cursors.right.isDown) {
            this.socket.emit("derecha", this.socket.id);
  
            this.player.setVelocityX(160);
            this.player.anims.play(`right${this.player.personaje}`);
          } else {
            if (this.player != null) {
              this.socket.emit("quieto", this.socket.id);
              this.player.setVelocityX(0);
              this.player.anims.play(`right${this.player.personaje}`);
            }
          }
        }
        if (this.cursors.up.isDown && this.player.body.touching.down) {
          this.socket.emit("arriba", this.socket.id);
  
          this.player.setVelocityY(-250);
          this.player.anims.play(`turn${this.player.personaje}`);
        }
      }
    }

    // crear obstaculos
    this.obstaculos.children.iterate((obstaculo) => {
      if (obstaculo.body.x < 0 - obstaculo.body.width) {
        obstaculo.anims.remove('covid');
        obstaculo.destroy();
        this.crearObstaculo(850);
      }
    });

    
  }
}
