
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
    }

    create() {
        var centroX = this.game.config.width / 2;
        var centroY = this.game.config.height / 2;

        // añadiendo boton de inicio
        this.boton = this.add.image(centroX,
            centroY, 'iniciar');

        this.boton.setInteractive().on('pointerdown', () => {
            this.game.scene.start('game', this.socket);
            this.game.scene.pause('menu')
        });

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

        //añadiendo call action
        this.txtIniciar = this.add.text(centroX,
            centroY - 85, "Iniciar Juego",
            { font: "bold 24px sans-serif", fill: "balck", align: "center"});
        this.txtIniciar.setOrigin(0.5, 0.5);
    }

    update() {

    }
}