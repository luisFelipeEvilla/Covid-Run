// carga los elementos iniciales del juego
export default class Boot extends Phaser.Scene {

    // key, es el nombre mediante el cual se hara referencia a la escena
    constructor() {
        super({ key: 'boot' });
        this.platforms = null;
        this.player = null;
        this.cursors = null;
        this.score = 0;
        this.scoreText = "";
        this.bombs = null;
        this.stars = null;
        this.gameOver = false;
    }

    preload() {
        this.load.image('fondo', 'assets/fondos/fondo1.png');
        this.load.image('suelo', 'assets/fondos/Borde.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('personaje',
            'assets/personajes/principal/principal.png',
            { frameWidth: 64, frameHeight: 64 }
        );
    }

    // crear los elementos del juego
    create() {
        // añadir suelo
        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(300, 423, 'suelo').setScale(1.3,1).refreshBody();

        // añadir el fondo
        this.add.image(300, 197, 'fondo').setScale(1.3, 1);

        //añadir personaje
        this.player = this.physics.add.sprite(100, 270, 'personaje').setScale(1.5, 1.5);
        this.player.setBounce('0.2');
        this.player.setCollideWorldBounds(true);

        // contador de score
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });

        //colisiones entre suelo y personaje
        this.physics.add.collider(this.player, this.platforms);
       
        // animaciones de movimiento del personaje
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

        // observando cuando las teclas son presionadas
        this.cursors = this.input.keyboard.createCursorKeys();

        // añadiendo las estrellas
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate(function (child) {

            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        // atrapar estrellas
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        // añadir bombas
        this.bombs = this.physics.add.group();

        // colisiones bombas y jugador
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
    }

    collectStar(player, star) {
        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate(function (child) {

                child.enableBody(true, child.x, 0, true, true);

            });

            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            var bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

        }
    }

    hitBomb(player, bomb) {
        this.physics.pause();

        player.setTint(0xff0000);

        player.anims.play('turn');

        this.gameOver = true;
    }

    update() {
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
