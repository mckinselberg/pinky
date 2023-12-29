function createGameOverText(_this: Phaser.Scene) {
  const gameOverText = _this.add.text(400, 300, 'Game Over', { fontSize: '50px', fontFamily: 'Planes_ValMore' });
  gameOverText.setColor('#000');
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);
  return gameOverText;
}

export default createGameOverText;