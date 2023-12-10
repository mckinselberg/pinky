function collectCoin(coin, score, scoreText) {
  coin.disableBody(true, true);
  coin.destroy();
  const updatedScore = score.value += 1;
  scoreText.setText('Score: ' + updatedScore);
  return updatedScore;
}

function createCoins(_this, platforms, player, canvasWidth, initialNumberOfCoins = 12, score, scoreText, initialCoinXPosition = 12, initialCoinYPosition = 0) {
  const coins = _this.physics.add.group({
    key: 'coin',
    repeat: initialNumberOfCoins - 1,
    setXY: { x: initialCoinXPosition, y: initialCoinYPosition, stepX: canvasWidth / initialNumberOfCoins },
  });
  coins.children.iterate(function (coin) {
    coin.setCollideWorldBounds(true);
    coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });
  _this.physics.add.collider(coins, platforms);
  _this.physics.add.overlap(player, coins, (player, coin) => {
    // even though we aren't explicitly using player, it is required as the first argument
    collectCoin(coin, score, scoreText);
  }, null, _this);
  return coins;
}

export { createCoins, collectCoin };
export default createCoins;