import constants from './constants';

const { gravity } = constants;

function createPlayer(_this: Phaser.Scene, playerName: string, positionX: number, positionY: number) {
  const player = _this.physics.add.sprite(positionX, positionY, playerName);
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(gravity);
  player.body.setSize(10, 28, true);
  return player;
}

export default createPlayer;