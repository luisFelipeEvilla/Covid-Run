export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "gameOver" });
  }

  init(data) {
    this.score = data.score;
    this.socket = data.socket;

    this.socket.emit("gameOver", this.score);
    this.txtGanador = null;
  }

  preload() {
    this.background = this.cameras.add(0, 0, 850, 450);
    this.background.setBackgroundColor("#FFF");

    this.load.image("playAgain", "./assets/botones/PlayAgain.png");
  }

  create() {
    var centroX = this.game.config.width / 2;
    var centroY = this.game.config.height / 2;

    //añadiendo puntuacion
    this.txtGanador = this.add.text(centroX, centroY - 20, this.ganador, {
      font: "bold 24px sans-serif",
      fill: "balck",
      align: "center",
    });
    this.txtGanador.setOrigin(0.5, 0.5);

    this.socket.on("listaPuntajes", (data) => {
      var jugadores = data;

      if (jugadores.length < 2) {
        console.log("solo");
        this.ganador = `Felicidades alcanzaste: ${this.score} puntos`;
        this.txtGanador.setText(this.ganador);
      } else {
        var mayor = jugadores[1];

        jugadores.forEach((jugador) => {
          if (jugador.score > mayor.score) {
            mayor = jugador;
          }
        });

        if (mayor.id == this.socket.id) {
          this.ganador = `Felicidades eres el ganador con: ${mayor.score} puntos \n
          El segundo lugar alcanzo: ${jugadores[1].score} puntos`;
        } else {
          this.ganador = `Lo siento, has perdido :( con: ${this.score} puntos\n
           El ganador alcanzo: ${mayor.score} puntos`;
        }

        this.txtGanador.setText(this.ganador);
      }
    });

    // añadiendo boton de inicio
    this.boton = this.add.image(centroX, centroY + 90, "playAgain");

    this.boton.setInteractive().on("pointerdown", () => {
      this.scene.stop();
      this.game.scene.start("menu");
    });

    this.boton.on("pointerover", () => {
      this.boton.setScale(1.1, 1.1);
      this.game.canvas.style.cursor = "pointer";
    });

    this.boton.on("pointerout", () => {
      this.boton.setScale(1, 1);
      this.game.canvas.style.cursor = "initial";
    });

    //añadiendo titulo
    this.txtTitulo = this.add.text(centroX, centroY - 125, "COVID RUN", {
      font: "bold 30px sans-serif",
      fill: "balck",
      align: "center",
    });
    this.txtTitulo.setOrigin(0.5, 0.5);

    //añadiendo call action
    this.txtIniciar = this.add.text(centroX, centroY - 85, "Juego Terminado", {
      font: "bold 24px sans-serif",
      fill: "balck",
      align: "center",
    });
    this.txtIniciar.setOrigin(0.5, 0.5);
  }

  update() {}
}
