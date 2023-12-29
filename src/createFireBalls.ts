const fireAction = (
  _this: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  fireballs: Phaser.Physics.Arcade.Group,
  playerHasFireballs: {
    value: boolean,
    powerUpActive: boolean
  }
) => {
  if (!playerHasFireballs.powerUpActive) return;
  player.anims.play('shoot', true);
  const fireballSpeedX = 500;
  const fireballSpeedY = 100;
  const fireball = fireballs.get(player.x, player.y);
  // TODO: make this a spritesheet

  if (fireball) {
    fireball.setVisible(true).setTexture('fireball');
    fireball.setVelocity(player.flipX ? -fireballSpeedX : fireballSpeedX, fireballSpeedY);
    fireball.setBounce(1, .7);
    fireball.body.onWorldBounds = true; // Enable world bounds event
    fireball.body.world.on('worldbounds', (body: any) => { // Listen for world bounds event
      if (body.gameObject === fireball) {
        fireball.destroy();
        console.log(fireballs.getLength());
      }
    }, this);
  }
}

function createFireBalls({
  _this,
  player,
  platforms,
  enemies,
  enemySprite,
  playerHasFireballs = {
    value: false, powerUpActive: false
  }
}: {
  _this: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  platforms: Phaser.Physics.Arcade.StaticGroup | Phaser.Physics.Arcade.Group | any,
  enemies: any,
  enemySprite: string,
  playerHasFireballs?: {
    value: boolean,
    powerUpActive: boolean
  }
}) {
  const key = _this.input.keyboard ? _this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F) : null;
  const fireballs = _this.physics.add.group({
    defaultKey: 'fireball',
    maxSize: 5,
    allowGravity: true,
    collideWorldBounds: true,
  });
  _this.physics.add.collider(fireballs, platforms); // Add collision with platforms
  _this.physics.add.overlap(fireballs, enemies, function(fireball, enemy: any) { // Add overlap with enemies
    fireball.destroy();
    enemy.anims.play(`${enemySprite}Die`, false); // Play the 'enemyHit' animation
    setTimeout(() => {
      enemy.destroy();
    }, 250);

  }, undefined, _this);

  key !== null && key.on('down', () => fireAction(_this, player, fireballs, playerHasFireballs));
  return fireballs;
}

export default createFireBalls;