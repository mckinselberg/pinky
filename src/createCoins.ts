import constants from "./constants";
import createBonusCoinBlinkAnimation from "./createBonusCoinBlinkAnimation";

const { canvasWidth } = constants;

function collectCoin({
  _this,
  coin,
  score,
  scoreText,
  coinsToWin,
}: {
  _this: Phaser.Scene,
  coin: Phaser.Physics.Arcade.Sprite,
  score: { value: number },
  scoreText: Phaser.GameObjects.Text,
  coinsToWin: number,
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
}: {
  _this: Phaser.Scene,
  platforms: Phaser.GameObjects.Group,
  player: Phaser.Physics.Arcade.Sprite,
  score: { value: number },
  scoreText: Phaser.GameObjects.Text,
  xPosition: number,
  yPosition: number,
  coinsToWin: number,
}) {
  const coin = _this.physics.add.sprite(xPosition, yPosition, 'coin');

  coin.setCollideWorldBounds(true);
  coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

  _this.physics.add.collider(coin, platforms);
  _this.physics.add.overlap(
    player,
    coin,
    (player, coin: any) => {
    // even though we aren't explicitly using player, it is required as the first argument
      collectCoin({ _this, coin, score, scoreText, coinsToWin });
    },
    undefined,
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
}: {
  _this: Phaser.Scene,
  platforms: Phaser.GameObjects.Group,
  player: Phaser.Physics.Arcade.Sprite,
  numberOfCoins: number,
  score: { value: number },
  scoreText: Phaser.GameObjects.Text,
  xPosition?: number,
  yPosition?: number,
  coinsToWin: number,
}) {
  const coins = _this.physics.add.group({
    key: 'coin',
    repeat: numberOfCoins - 1,
    setXY: { x: xPosition, y: yPosition, stepX: canvasWidth / numberOfCoins },
  });
  coins.children.iterate(function (coin: any) {
    coin.setCollideWorldBounds(true);
    coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    return true;
  });
  platforms && _this.physics.add.collider(coins, platforms);
  _this.physics.add.overlap(
    player,
    coins,
    (player, coin: any) => {
      // even though we aren't explicitly using player, it is required as the first argument
      collectCoin({ _this, coin, score, scoreText, coinsToWin });
    },
    undefined,
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
}: {
  _this: Phaser.Scene,
  coin: Phaser.Physics.Arcade.Sprite,
  score: { value: number },
  scoreText: Phaser.GameObjects.Text,
  powerUp: { powerUpActive: boolean, powerUpMessage: string },
  coinsToWin: number,
}) {
  powerUp.powerUpActive = true;
  coin.disableBody(true, true);
  coin.destroy();
  _this.sound.play('coin-collect');
  const updatedScore = score.value += 1;
  scoreText.setText(`Score: ${updatedScore} / ${coinsToWin}`);
  const powerUpActiveText = _this.add.text(300, 20, powerUp.powerUpMessage, { fontSize: '20px', fontFamily: 'Planes_ValMore' });
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
}: {
  _this: Phaser.Scene,
  platforms: Phaser.GameObjects.Group,
  player: Phaser.Physics.Arcade.Sprite,
  score: { value: number },
  scoreText: Phaser.GameObjects.Text,
  xPosition: number,
  yPosition: number,
  powerUp: { powerUpActive: boolean, powerUpMessage: string },
  coinsToWin: number,
}) {
  const bonusCoin = _this.physics.add.sprite(xPosition, yPosition, 'bonusCoin');
  
  bonusCoin.setCollideWorldBounds(true);
  bonusCoin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

  _this.physics.add.collider(bonusCoin, platforms);
  _this.physics.add.overlap(
    player,
    bonusCoin,
    (player, bonusCoin: any) => {
      // even though we aren't explicitly using player, it is required as the first argument
      collectBonusCoin({ _this, coin: bonusCoin, score, scoreText, powerUp, coinsToWin });
    },
    undefined,
    _this
  );
  createBonusCoinBlinkAnimation(_this);
  bonusCoin.anims.play('bonusCoinBlink', true);
  return bonusCoin;
}

export { createCoins, createSingleCoin, collectCoin, createBonusCoin };
export default createCoins;