const createPlayerPlatformCollider = (_this: Phaser.Scene, player: Phaser.GameObjects.Sprite, platforms: Phaser.GameObjects.Group) => {
  _this.physics.add.collider(player, platforms);
}

export default createPlayerPlatformCollider;