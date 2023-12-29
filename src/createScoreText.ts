type ScoreTextArgs = { 
  _this: Phaser.Scene;
  coinsToWin: number;
};

function createScoreText({ _this, coinsToWin}: ScoreTextArgs) {
  return _this.add.text(16, 16, `Score: 0 / ${coinsToWin}`, { fontSize: '25px', fontFamily: 'Planes_ValMore', color: '#000' });
}

export default createScoreText;