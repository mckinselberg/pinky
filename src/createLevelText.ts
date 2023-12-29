type LevelTextArgs = { 
  _this: Phaser.Scene;
  level: number;
};

function createLevelText({_this, level}: LevelTextArgs) {
  return _this.add.text(16, 40, `Level: ${level}`, { fontSize: '25px', fontFamily: 'Planes_ValMore', color: '#000' });
}

export default createLevelText;