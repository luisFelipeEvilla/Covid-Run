
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'menu' });
    }

    init(socket) {
        this.socket = socket;
    }

    preload() {
        this.background = this.cameras.add(0, 0, 850, 450);
        this.background.setBackgroundColor('#FFF');

        this.load.image('iniciar', './assets/botones/iniciar.png');
        //this.load.audio('musica', './assets/sonidos/sonidoMenu.mp3');
    }

    create() {
        var centroX = this.game.config.width / 2;
        var centroY = this.game.config.height / 2;

        //añadiendo musica de fondo
        //this.musica = this.sound.add('musica', {loop: true});
        //this.musica.play();

        // añadiendo boton de inicio
        this.boton = this.add.image(centroX,
            centroY + 40, 'iniciar');

        this.boton.setInteractive().on('pointerdown', () => {
            this.boton.setTint(0xff0000);
            this.socket.emit('start');
        });

        this.socket.on('preparados', (data) => {
            var listos = true;
            var jugadores = data;
            var cont = 0;
            jugadores.forEach(jugador => {
                if (jugador.listo == false && cont < 2) {
                    listos = false;
                }
                cont++;
            });

            if (listos) {
                this.scene.stop();
                this.game.scene.start('game', this.socket);
            }
        })

        this.boton.on('pointerover', () => {
            this.boton.setScale(1.1, 1.1);
            this.game.canvas.style.cursor = "pointer";
        })

        this.boton.on('pointerout', () => {
            this.boton.setScale(1, 1);
            this.game.canvas.style.cursor = "initial";
        })

        //añadiendo titulo
        this.txtTitulo = this.add.text(centroX,
            centroY - 125, "COVID RUN",
            { font: "bold 30px sans-serif", fill: "balck", align: "center" });
        this.txtTitulo.setOrigin(0.5, 0.5);

        // numero de jugadores en espera
        this.numJugadores = 0;
        //añadiendo call action
        this.txtNumJugadores = this.add.text(centroX,
            centroY - 85, `Jugadores conectados: ${this.numJugadores}`,
            { font: "bold 24px sans-serif", fill: "balck", align: "center"});
        this.txtNumJugadores.setOrigin(0.5, 0.5);
        
        this.socket.emit("nuevoJugador", this.socket.id);
        this.socket.on('actualizarJugadores', (data) => {
            this.numJugadores = data.jugadores.length;
            this.txtNumJugadores.setText(`Jugadores conectados: ${this.numJugadores}`);
        })

        //añadiendo call action
        this.txtIniciar = this.add.text(centroX,
            centroY - 45, "Iniciar Juego",
            { font: "bold 24px sans-serif", fill: "balck", align: "center"});
        this.txtIniciar.setOrigin(0.5, 0.5);
    }

    update() {
        
    }
}