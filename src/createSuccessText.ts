function createSuccessText(_this: Phaser.Scene, message = 0) {
  const successMessages = ["You Win!", "You Win!", "Good Job!", "You Did It!", "Nice Work!", "Keep Going!", "You Win!", "Good Job!", "You Did It!", "Nice Work!", "Keep Going!"];
  console.log(successMessages.length); 
  const successText = _this.add.text(400, 300, successMessages[message], { fontSize: '50px', fontFamily: 'Planes_ValMore' });
  successText.setColor('black');
  successText.setOrigin(0.5);
  successText.setVisible(false);
  return successText;
}

export default createSuccessText;
