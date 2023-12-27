import constants from './constants';

const { gravity, canvasWidth } = constants;

function createPlayer(_this, playerName, positionX, positionY) {
  const player = _this.physics.add.sprite(positionX, positionY, playerName);
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(gravity);
  player.body.setSize(10, 28, true);
  return player;
}

export default createPlayer;