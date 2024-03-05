function createResetButton({
  _this,
  score,
  playerHasInvincibility = {
    value: false,
    powerUpActive: false
  }, 
  playerHasFireballs = {
    value: false,
    powerUpActive: false
  },
  finalCoinDropped = {
    value: false
  }
}: {
  _this: Phaser.Scene,
  score: {
    value: number
  },
  playerHasInvincibility?: {
    value: boolean,
    powerUpActive: boolean
  },
  playerHasFireballs?: {
    value: boolean,
    powerUpActive: boolean
  }
  finalCoinDropped?: {
    value: boolean
  }
}) {
  const resetActions =  () => {
    playerHasFireballs.value = false;
    playerHasFireballs.powerUpActive = false;
    playerHasInvincibility.value = false;
    playerHasInvincibility.powerUpActive = false;
    score.value = 0;
    _this.scene.restart();
    finalCoinDropped.value = false;
  }
  const resetButton = _this.add.text(700, 16, 'Reset', { fontSize: '25px', fontFamily: 'Planes_ValMore' });
  resetButton.setColor('black');
  resetButton.setInteractive();
  resetButton.on('pointerdown', resetActions);
  const key = _this.input.keyboard !== null ? _this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R) : null;
  key !== null && key.on('down', resetActions);
};


export default createResetButton;