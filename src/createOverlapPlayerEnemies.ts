function createOverlapPlayerEnemies(
  _this: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  enemies: Phaser.GameObjects.Group,
  colliderPlayerPlatform: Phaser.Physics.Arcade.Collider,
  playerIsHiding: { value: boolean },
  gameOver: { value: boolean },
  winner: boolean = false,
  playerIsInvincible = { value: false }
) {
  _this.physics.add.overlap(player, enemies, function () {
    if (playerIsHiding.value || playerIsInvincible.value) {
      return;
    } else {
      player.setTint(0xff0000);
      player.anims.play('hide');
      player.setVelocityY(-300);
      _this.physics.world.removeCollider(colliderPlayerPlatform);
      player.setCollideWorldBounds(false);
      gameOver.value = true;
      _this.sound.play('death');
    }
  }, function() {
    return winner ? false : true;
  }, _this);
}

export default createOverlapPlayerEnemies