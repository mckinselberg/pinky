function createResetButton(_this, score, playerIsInvincible = {}, playerHasFireballs = {}) {
  const resetActions =  () => {
    playerIsInvincible.value = false;
    playerIsInvincible.powerUpActive = false;
    playerHasFireballs.value = false;
    _this.scene.restart();
  }
  const resetButton = _this.add.text(700, 16, 'Reset', { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  resetButton.setInteractive();
  resetButton.on('pointerdown', resetActions)
  score.value = 0;
  const key = _this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  key.on('down', resetActions);
};


export default createResetButton;