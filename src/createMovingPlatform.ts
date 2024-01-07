
function createMovingPlatform({
  _this,
  player,
  xPosition,
  yPosition,
  scaleX = 1,
  scaleY = 1,
  direction = 'horizontal',
  speed = 100,
}: {
  _this: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  xPosition: number,
  yPosition: number,
  scaleX?: number,
  scaleY?: number,
  direction?: 'horizontal' | 'vertical' | 'both',
  speed?: number,
}): Phaser.Physics.Arcade.Sprite {
  const platform = _this.physics.add.sprite(xPosition, yPosition, 'ground').setScale(scaleX, scaleY);
  platform.setImmovable(true);
  if (direction === 'both') {
    platform.setVelocityX(speed);
    platform.setVelocityY(speed)
  } else if (direction === 'vertical') {
    platform.setVelocityY(speed);
  } else if (direction === 'horizontal') {
    platform.setVelocityX(speed);
  }
  platform.body.allowGravity = false;
  platform.setCollideWorldBounds(true);
  platform.setBounce(1,0);
  platform.setCollideWorldBounds(true);
  _this.physics.add.collider(player, platform);
  return platform;
}

export default createMovingPlatform;