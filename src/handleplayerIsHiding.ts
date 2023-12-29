function handleplayerIsHiding(
  _this: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  trees: Phaser.GameObjects.Group,
  playerIsHiding: {value: boolean}
): void {
  const overlap = _this.physics.overlap(player, trees);
  playerIsHiding.value = overlap;
}

export default handleplayerIsHiding;