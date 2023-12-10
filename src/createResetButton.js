function createResetButton(_this, score) {
  const resetButton = _this.add.text(700, 16, 'Reset', { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  resetButton.setInteractive();
  resetButton.on('pointerdown', () => { _this.scene.restart(); });
  score.value = 0;
};


export default createResetButton;