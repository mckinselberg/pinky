function createPlayerAnimations({_this, playerName}) {
  _this.anims.create({
    key: 'left',
    frames: _this.anims.generateFrameNumbers(playerName, { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  _this.anims.create({
    key: 'stand',
    frames: [ { key: playerName, frame: 0 } ],
    frameRate: 0,
  });
  _this.anims.create({
    key: 'right',
    frames: _this.anims.generateFrameNumbers(playerName, { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  _this.anims.create({
    key: 'jump',
    frames: _this.anims.generateFrameNumbers(playerName, { start: 4, end: 5 }),
    frameRate: 2,
    repeat: -1,
  });
  _this.anims.create({
    key: 'falling',
    frames: [ { key: playerName, frame: 5 } ],
    frameRate: 2,
    repeat: -1,
  });
  _this.anims.create({
    key: 'hide',
    frames: [ { key: playerName, frame: 6 } ],
    frameRate: 2,
    repeat: -1,
  });
  _this.anims.create({
    key: 'shoot',
    frames: [ { key: playerName, frame: 7 } ],
    frameRate: 2,
    repeat: -1,
  });
}

export default createPlayerAnimations;