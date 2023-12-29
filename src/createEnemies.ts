import random from "./random";
import constants from "./constants";

const { enemyPositions } = constants;

function createEnemies(this: any, {
  _this,
  enemySprite = 'enemy',
  enemyVelocity = 300,
  gravity,
  platforms,
  position = enemyPositions.RANDOM,
  removeNthEnemies = [],
}: {
  _this: Phaser.Scene,
  enemySprite?: string,
  enemyVelocity?: number,
  gravity: number,
  platforms: any,
  position?: string,
  removeNthEnemies?: number[]
  }) {
  const enemies = _this.physics.add.group();
  const platformEnds = _this.physics.add.group();
  platforms.children.iterate(function (platform: any, i: any): boolean | null {
    if (removeNthEnemies.includes(i)) return null;
    let enemyPosition; 
    switch (position) {
      case 'left':
        enemyPosition = platform.x - platform.displayWidth / 2 + 50;
        break;
      case 'right':
        enemyPosition = platform.x + platform.displayWidth / 2 - 50;
        break;
        case 'random':
        default:
          enemyPosition = random(platform.x - platform.displayWidth / 2 + 50, platform.x + platform.displayWidth / 2 - 50);
          break;
    }
    const enemy = _this.physics.add.sprite(
      enemyPosition,
      platform.y - 30,
      enemySprite
    );
    enemy.body.setSize(20, 28, true);
    enemy.setVelocityX(random(-enemyVelocity, enemyVelocity));
    enemy.body.setGravityY(gravity);
    enemy.setBounce(0.1);
    _this.physics.add.collider(enemy, platforms);

    // platform ends
    let end1 = _this.physics.add.sprite(platform.x - platform.displayWidth / 2, platform.y-32, '');
    let end2 = _this.physics.add.sprite(platform.x + platform.displayWidth / 2, platform.y-32, ''); 
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
    return true;
  }, _this);

  _this.physics.add.overlap(enemies, platformEnds, function (enemy: any) {
    enemy.setVelocityX(-enemy.body.velocity.x);
  }, undefined, _this);


  // enemies
  enemies.children.iterate(function (enemy: any) {
    enemy.setBounce(0.1);
    enemy.setCollideWorldBounds(true);
    enemy.body.setGravityY(gravity);
    _this.physics.add.collider(enemy, platforms);
    return true;
  }, _this);
  
  // enemy animations
  !_this.anims.exists( `${enemySprite}Move`) && _this.anims.create({
    key: `${enemySprite}Move`,
    frames: _this.anims.generateFrameNumbers(enemySprite, { start: 0, end: 1 }),
    frameRate: 10,
    repeat: -1,
  });
  !_this.anims.exists(`${enemySprite}Die`) && _this.anims.create({
    key: `${enemySprite}Die`,
    frames: _this.anims.generateFrameNumbers(enemySprite, { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  enemies.children.iterate(function (enemy: any) {
    enemy.anims.play(`${enemySprite}Move`, true);
    return true;
  }, _this);

  return enemies;
}



export default createEnemies;