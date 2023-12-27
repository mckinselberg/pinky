import constants from "./constants";
import createBonusCoinBlinkAnimation from "./createBonusCoinBlinkAnimation";

const { canvasWidth, canvasHeight } = constants;

function collectCoin({
  _this,
  coin,
  score,
  scoreText,
  coinsToWin,
}) {
  coin.disableBody(true, true);
  coin.destroy();
  const updatedScore = score.value += 1;
  scoreText.setText(`Score: ${updatedScore} / ${coinsToWin}`);
  _this.sound.play('coin-collect');
  return updatedScore;
}

function createSingleCoin({
  _this,
  platforms,
  player,
  score,
  scoreText,
  xPosition,
  yPosition,
  coinsToWin,
}) {
  const coin = _this.physics.add.sprite(xPosition, yPosition, 'coin');

  coin.setCollideWorldBounds(true);
  coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

  _this.physics.add.collider(coin, platforms);
  _this.physics.add.overlap(
    player,
    coin,
    (player, coin) => {
    // even though we aren't explicitly using player, it is required as the first argument
      collectCoin({ _this, coin, score, scoreText, coinsToWin });
    },
    null,
    _this);
  return coin;
}

function createCoins({
  _this,
  platforms,
  player,
  numberOfCoins,
  score,
  scoreText,
  xPosition = 12,
  yPosition = 0,
  coinsToWin,
}) {
  const coins = _this.physics.add.group({
    key: 'coin',
    repeat: numberOfCoins - 1,
    setXY: { x: xPosition, y: yPosition, stepX: canvasWidth / numberOfCoins },
  });
  coins.children.iterate(function (coin) {
    coin.setCollideWorldBounds(true);
    coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });
  platforms && _this.physics.add.collider(coins, platforms);
  _this.physics.add.overlap(
    player,
    coins,
    (player, coin) => {
      // even though we aren't explicitly using player, it is required as the first argument
      collectCoin({ _this, coin, score, scoreText, coinsToWin });
    },
    null,
    _this);
  return coins;
}

// bonus coins
function collectBonusCoin({
  _this,
  coin,
  score,
  scoreText,
  powerUp,
  coinsToWin,
}) {
  powerUp.powerUpActive = true;
  coin.disableBody(true, true);
  coin.destroy();
  _this.sound.play('coin-collect');
  const updatedScore = score.value += 1;
  scoreText.setText(`Score: ${updatedScore} / ${coinsToWin}`);
  const powerUpActiveText = _this.add.text(300, 20, powerUp.powerUpMessage, { fontSize: '20px', fill: '#000000', fontFamily: 'Planes_ValMore' });
  setTimeout(() => {
    powerUpActiveText.setVisible(false);
    // powerUpActiveText.destroy();
  }, 3000);
}

function createBonusCoin({
  _this,
  platforms,
  player,
  score,
  scoreText,
  xPosition,
  yPosition,
  powerUp,
  coinsToWin,
}) {
  const bonusCoin = _this.physics.add.sprite(xPosition, yPosition, 'bonusCoin');
  
  bonusCoin.setCollideWorldBounds(true);
  bonusCoin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

  _this.physics.add.collider(bonusCoin, platforms);
  _this.physics.add.overlap(
    player,
    bonusCoin,
    (player, bonusCoin) => {
      // even though we aren't explicitly using player, it is required as the first argument
      collectBonusCoin({ _this, coin: bonusCoin, score, scoreText, powerUp, coinsToWin });
    },
    null,
    _this
  );
  createBonusCoinBlinkAnimation(_this);
  bonusCoin.anims.play('bonusCoinBlink', true);
  return bonusCoin;
}

export { createCoins, createSingleCoin, collectCoin, createBonusCoin };
export default createCoins;