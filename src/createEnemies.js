import random from "./random";

function createEnemies(
  _this,
  platforms,
  gravity,
  removeNthEnemies = [],
  enemyVelocity = 300,
  enemySprite = 'enemy',
  position = 'random'
) {
  const enemies = _this.physics.add.group();
  const platformEnds = _this.physics.add.group();
  platforms.children.iterate(function (platform, i) {
    if (removeNthEnemies.includes(i)) return;
    let enemyPosition; 
    switch (position) {
      case 'random':
        enemyPosition = random(platform.x - platform.displayWidth / 2 + 50, platform.x + platform.displayWidth / 2 - 50);
        break;
      case 'left':
        enemyPosition = platform.x - platform.displayWidth / 2 + 50;
        break;
      case 'right':
        enemyPosition = platform.x + platform.displayWidth / 2 - 50;
        break;
    }
    const enemy = _this.physics.add.sprite(
      enemyPosition,
      platform.y - 30,
      enemySprite
    );
    enemy.body.setSize(20, 28, true);

    enemy.setVelocityX(random(-enemyVelocity, enemyVelocity));
    enemy.setBounce(0.1);
    enemy.setCollideWorldBounds(true);
    enemy.body.setGravityY(gravity);
    _this.physics.add.collider(enemy, platforms);

    // platform ends
    let end1 = _this.physics.add.sprite(platform.x - platform.displayWidth / 2, platform.y-32, null);
    let end2 = _this.physics.add.sprite(platform.x + platform.displayWidth / 2, platform.y-32, null); 
    end1.setVisible(false);
    end2.setVisible(false);
    end1.body.setSize(1, 1);
    end2.body.setSize(1, 1);
    end1.body.setAllowGravity(false);
    end2.body.setAllowGravity(false);
    _this.physics.add.collider(end1, platform);
    _this.physics.add.collider(end2, platform);
    platformEnds.add(end1);
    platformEnds.add(end2);
    enemies.add(enemy);
  }, this);

  _this.physics.add.overlap(enemies, platformEnds, function (enemy, end) {
    enemy.setVelocityX(-enemy.body.velocity.x);
  }, null, this);  

  // enemies
  enemies.children.iterate(function (enemy) {
    enemy.setBounce(0.1);
    enemy.setCollideWorldBounds(true);
    enemy.body.setGravityY(gravity);
    _this.physics.add.collider(enemy, platforms);
  }, this);
  // enemy animations
  _this.anims.create({
    key: `${enemySprite}Move`,
    frames: _this.anims.generateFrameNumbers(enemySprite, { start: 0, end: 1 }),
    frameRate: 10,
    repeat: -1,
  });

  return enemies;
}



export default createEnemies;