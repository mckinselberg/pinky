import * as Phaser from 'phaser';
import constants from './constants';
import welcome from './welcome';
import level1 from './level1';
import level2 from './level2';
import level3 from './level3';
import level4 from './level4';
import level5 from './level5';
import level6 from './level6';
import level7 from './level7';
import level8 from './level8';

const { canvasWidth, canvasHeight, gravity, debug } = constants;

const config = {
  type: Phaser.AUTO,
  width: canvasWidth,
  height: canvasHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: gravity + 200 },
      debug: debug,
    },
  },
  scene: [
    welcome,
    level1,
    level2,
    level3,
    level4,
    level5,
    level6,
    level7,
    level8,
  ],
};

const game = new Phaser.Game(config);

