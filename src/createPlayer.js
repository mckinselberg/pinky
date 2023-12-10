import constants from './constants';

const { gravity } = constants;

function createPlayer(_this, playerName) {
  const player = _this.physics.add.sprite(100, 450, playerName);
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(gravity);

  _this.anims.create({
    key: 'left',
    frames: _this.anims.generateFrameNumbers(playerName, { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  _this.anims.create({
    key: 'turn',
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
    frames: _this.anims.generateFrameNumbers(playerName, { start: 4, end: 4 }),
    frameRate: 10,
    repeat: -1
  });
  _this.anims.create({
    key: 'duck',
    frames: [ { key: playerName, frame: 5 } ],
    frameRate: 10,
    repeat: -1
  });

  return player;
}

export default createPlayer;