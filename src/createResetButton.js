function createResetButton({ _this, score, playerHasInvincibility = {}, playerHasFireballs = {} }) {
  const resetActions =  () => {
    playerHasFireballs.value = false;
    playerHasFireballs.powerUpActive = false;
    playerHasInvincibility.value = false;
    playerHasInvincibility.powerUpActive = false;
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