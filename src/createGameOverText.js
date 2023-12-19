function createGameOverText(_this) {
  const gameOverText = _this.add.text(400, 300, 'Game Over', { fontSize: '50px', fill: '#ff0000', fontFamily: 'Planes_ValMore' });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);
  return gameOverText;
}

export default createGameOverText;