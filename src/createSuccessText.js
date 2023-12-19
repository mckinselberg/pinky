function createSuccessText(_this) {
  const successText = _this.add.text(400, 300, 'You Win!', { fontSize: '50px', fill: '#000', fontFamily: 'Planes_ValMore' });
  successText.setOrigin(0.5);
  successText.setVisible(false);
  return successText;
}

export default createSuccessText;
