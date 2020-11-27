import gameScene from './escenas/GameScene.js';
import menuScene from './escenas/MenuScene.js';
import gameOverScene from './escenas/GameOverScene.js';

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: false
        }
    },
    scene: [menuScene, gameScene, gameOverScene],
    debug: true
};

var game = new Phaser.Game(config);
var socket = io();
game.scene.start('menu', socket);

