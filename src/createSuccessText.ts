function createSuccessText(_this: Phaser.Scene) {
  const successText = _this.add.text(400, 300, 'You Win!', { fontSize: '50px', fontFamily: 'Planes_ValMore' });
  successText.setColor('black');
  successText.setOrigin(0.5);
  successText.setVisible(false);
  return successText;
}

export default createSuccessText;
