import Phaser from "phaser";
import constants from "./constants";
import welcome from "./welcome";
import level1 from "./level1";
import level2 from "./level2";

const { canvasWidth, canvasHeight, gravity } = constants;

const config = {
  type: Phaser.AUTO,
  width: canvasWidth,
  height: canvasHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: gravity + 200 }
    },
  },
  scene: [welcome, level1, level2],
};

const game = new Phaser.Game(config);
