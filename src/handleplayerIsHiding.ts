function handleplayerIsHiding(
  _this: Phaser.Scene,
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
  trees: Phaser.Physics.Arcade.StaticGroup,
  playerIsHiding: {value: boolean}
): void {
  const overlap = _this.physics.overlap(player, trees);
  playerIsHiding.value = overlap;
}

export default handleplayerIsHiding;