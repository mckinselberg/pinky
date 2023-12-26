import constants from "./constants";

const { canvasWidth, canvasHeight } = constants;

function collectCoin(coin, score, scoreText, _this) {
  coin.disableBody(true, true);
  coin.destroy();
  const updatedScore = score.value += 1;
  scoreText.setText('Score: ' + updatedScore);
  _this.sound.play('coin-collect');
  return updatedScore;
}

function collectBonusCoin(_this,coin, score, scoreText, powerUp) {
  powerUp.powerUpActive = true;
  coin.disableBody(true, true);
  coin.destroy();
  _this.sound.play('coin-collect');
  const updatedScore = score.value += 1;
  scoreText.setText('Score: ' + updatedScore);
  const powerUpActiveText = _this.add.text(300, 20, powerUp.powerUpMessage, { fontSize: '20px', fill: '#000000', fontFamily: 'Planes_ValMore' });
  setTimeout(() => {
    powerUpActiveText.setVisible(false);
    // powerUpActiveText.destroy();
  }, 3000);
}

function createSingleCoin({
  _this,
  platforms,
  player,
  score,
  scoreText,
  xPosition,
  yPosition,
}) {
  const coin = _this.physics.add.sprite(xPosition, yPosition, 'coin');

  coin.setCollideWorldBounds(true);
  coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

  _this.physics.add.collider(coin, platforms);
  _this.physics.add.overlap(player, coin, (player, coin) => {
    // even though we aren't explicitly using player, it is required as the first argument
    collectCoin(coin, score, scoreText, _this);
  }, null, _this);
  return coin;
}

function createBonusCoin(_this, platforms, player, canvasWidth, initialNumberOfCoins = 12, score, scoreText, initialCoinXPosition = 12,initialCoinYPosition = 0, powerUp) {
  _this.anims.create({
    key: 'bonusCoinBlink',
    frames: _this.anims.generateFrameNumbers('bonusCoin', { start: 0, end: 1 }),
    frameRate: 5,
    repeat: -1
  });
  const bonusCoin = _this.physics.add.sprite(initialCoinXPosition, initialCoinYPosition, 'bonusCoin');
  
  bonusCoin.setCollideWorldBounds(true);
  bonusCoin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

  _this.physics.add.collider(bonusCoin, platforms);
  _this.physics.add.overlap(player, bonusCoin, (player, bonusCoin) => {
    // even though we aren't explicitly using player, it is required as the first argument
    collectBonusCoin(_this, bonusCoin, score, scoreText, powerUp);
  }, null, _this);
  bonusCoin.anims.play('bonusCoinBlink', true);
  return bonusCoin;
}

function createCoins(
  _this,
  platforms,
  player,
  canvasWidth,
  numberOfCoins,
  score,
  scoreText,
  initialCoinXPosition = 12,
  initialCoinYPosition = 0
) {
  const coins = _this.physics.add.group({
    key: 'coin',
    repeat: numberOfCoins - 1,
    setXY: { x: initialCoinXPosition, y: initialCoinYPosition, stepX: canvasWidth / numberOfCoins },
  });
  coins.children.iterate(function (coin) {
    coin.setCollideWorldBounds(true);
    coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });
  _this.physics.add.collider(coins, platforms);
  _this.physics.add.overlap(player, coins, (player, coin) => {
    // even though we aren't explicitly using player, it is required as the first argument
    collectCoin(coin, score, scoreText, _this);
  }, null, _this);
  return coins;
}

export { createCoins, createSingleCoin, collectCoin, createBonusCoin };
export default createCoins;