// carga los elementos iniciales del juego
export default class Boot extends Phaser.Scene {

    // key, es el nombre mediante el cual se hara referencia a la escena
    constructor() {
        super({ key: 'game' });
        this.platforms = null;
        this.player = null;
        this.cursors = null;
        this.score = 0;
        this.scoreText = "";
        this.bombs = null;
        this.obstaculos = null;
        this.gameOver = false;

        // acumulador de tiempo entre cada actualización
        this.fps = 0;
        this.acumulador = 0;
    }

    preload() {
        this.load.image('fondo', 'assets/fondos/fondo1.png');
        this.load.image('suelo', 'assets/fondos/Borde.png');
        this.load.image('obstaculo', 'assets/star.png');
        this.load.spritesheet('personaje',
            'assets/personajes/principal/principal.png',
            { frameWidth: 64, frameHeight: 64 }
        );
    }

    // crear los elementos del juego
    create() {
        // añadir el fondo
        this.fondo = this.add.tileSprite(0, 0, 850, 400, 'fondo');
        this.fondo.setOrigin(0, 0);

        // añadir suelo
        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(300, 423, 'suelo').setScale(1.3, 1).refreshBody();
        //añadir personaje
        this.player = this.physics.add.sprite(100, 270, 'personaje').setScale(1.5, 1.5).refreshBody();
        this.player.setBounce('0.2');
        this.player.setCollideWorldBounds(true);
        this.animarPersonaje();

        // contador de score
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });
        this.fpsText = this.add.text(16, 48, 'fps: 0', { fontSize: '32px', fill: '#fff' });

        //colisiones entre suelo y personaje
        this.physics.add.collider(this.player, this.platforms);

        // observando cuando las teclas son presionadas
        this.cursors = this.input.keyboard.createCursorKeys();

        // añadiendo el grupo de obstaculos
        this.obstaculos = this.physics.add.group();

        // pool
        this.obstaculosPool = this.add.group({

            // Cuando la plataforma es removida del pool, se añade a las plataformas activas
            removeCallback: function (obstaculo) {
                obstaculo.scene.obstaculos.add(obstaculo)
            }
        })

        this.obstaculos.createMultiple({
            key: 'obstaculo',
            repeat: 3,
            setXY: {
                x: 400,
                y: 370,
                stepX: 300
            },
        })

        this.obstaculos.setVelocityX(-180);

        this.physics.add.overlap(this.obstaculos, this.player, this.contagio, null, this);
        this.physics.add.collider(this.platforms, this.obstaculos);
        // atrapar estrellas
        // this.physics.add.overlap(this.player, this.obstaculos, this.collectStar, null, this);
    }

    contagio(player, obstaculo) {
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
        this.player.setVelocityY(-300);
        this.player.body.enable = false;
    }

    crearObstaculo(posicionX) {
        var obstaculo;

        obstaculo = this.physics.add.image(posicionX, 370, "obstaculo");

        this.obstaculos.add(obstaculo);
        this.obstaculos.setVelocityX(-180);
    }

    //animacines de movimiento del personaje
    animarPersonaje() {
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('personaje', { start: 117, end: 125 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'personaje', frame: 26 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('personaje', { start: 143, end: 151 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update(time, dt) {
        this.fondo.tilePositionX += 3;
        this.acumulador += dt;
        this.fps++;

        if (this.acumulador > 1000) {
            this.score += 1;
            this.scoreText.setText('Score: ' + this.score);
            this.fpsText.setText('fps: ' + this.fps);
            this.fps = 0;
            this.acumulador -= 1000;

        }

        // reciclar obstaculos
        var distanciaMinima = this.game.config.width;

        this.obstaculos.children.iterate((obstaculo) => {
            if (obstaculo.body.x < 0 - obstaculo.body.width) {
                obstaculo.destroy();
                console.log("creando obstaculo");
                this.crearObstaculo(850);
            }
        })

        // crear obstaculos

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-250);
        }
    }
}
