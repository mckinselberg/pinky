function handleEnemies(_this, enemies, enemySprite = 'enemy', enemyVelocity = 100) {
  enemies.children.iterate(function (enemy) {
    enemy.anims.play(`${enemySprite}Move`, true);
    if (enemy.body.velocity.x > 0) {
      enemy.flipX = false;
    } else if (enemy.body.velocity.x < 0) {
      enemy.flipX = true;
    }
    if (enemy.body.blocked.left) {
      enemy.setVelocityX(enemyVelocity);
    } else if (enemy.body.blocked.right) {
      enemy.setVelocityX(-enemyVelocity);
    } else if (enemy.body.velocity.x === 0) {
      enemy.setVelocityX(enemyVelocity);
    }
  }, _this);
}

export default handleEnemies;