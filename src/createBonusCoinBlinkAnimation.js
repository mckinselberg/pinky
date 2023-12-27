function createBonusCoinBlinkAnimation(_this) {
  !_this.anims.exists('bonusCoinBlink') && _this.anims.create({
    key: 'bonusCoinBlink',
    frames: _this.anims.generateFrameNumbers('bonusCoin', { start: 0, end: 1 }),
    frameRate: 5,
    repeat: -1
  });
}

export default createBonusCoinBlinkAnimation;