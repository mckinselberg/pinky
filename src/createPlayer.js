import constants from './constants';

const { gravity, canvasWidth } = constants;

function createPlayer(_this, playerName, positionX, positionY) {
  const player = _this.physics.add.sprite(positionX, positionY, playerName);
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(gravity);
  player.body.setSize(10, 28, true);

  _this.anims.create({
    key: 'left',
    frames: _this.anims.generateFrameNumbers(playerName, { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  _this.anims.create({
    key: 'stand',
    frames: [ { key: playerName, frame: 0 } ],
    frameRate: 20
  });
  _this.anims.create({
    key: 'right',
    frames: _this.anims.generateFrameNumbers(playerName, { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  _this.anims.create({
    key: 'jump',
    frames: _this.anims.generateFrameNumbers(playerName, { start: 4, end: 5 }),
    frameRate: 2,
    repeat: -1
  });
  _this.anims.create({
    key: 'falling',
    frames: [ { key: playerName, frame: 5 } ],
    frameRate: 10,
    repeat: -1
  });
  _this.anims.create({
    key: 'hide',
    frames: [ { key: playerName, frame: 6 } ],
    frameRate: 10,
    repeat: -1
  });

  return player;
}

export default createPlayer;