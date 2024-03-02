
function createMovingPlatform({
  _this,
  player,
  xPosition,
  yPosition,
  scaleX = 1,
  scaleY = 1,
  direction = 'horizontal',
  xSpeed = 0,
  ySpeed = 0,
  moving = false,
}: {
  _this: Phaser.Scene,
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
  xPosition: number,
  yPosition: number,
  scaleX?: number,
  scaleY?: number,
  direction?: 'horizontal' | 'vertical' | 'both',
  xSpeed?: number,
  ySpeed?: number,
  moving?: boolean,
}): Phaser.Physics.Arcade.Sprite {
  const platform = _this.physics.add.sprite(xPosition, yPosition, 'ground').setScale(scaleX, scaleY);
  platform.setImmovable(true);
  platform.setCollideWorldBounds(true);
  platform.body.allowGravity = false;
  platform.setBounce(1,0);
  _this.physics.add.collider(player, platform);
  if (!moving) return platform;
  if (direction === 'both') {
    platform.setVelocityX(xSpeed);
    platform.setVelocityY(ySpeed);
  } else if (direction === 'vertical') {
    platform.setVelocityY(ySpeed);
    platform.setVelocityX(0);
  } else if (direction === 'horizontal') {
    platform.setVelocityX(xSpeed);
    platform.setVelocityY(0);
  }
  return platform;
}

export default createMovingPlatform;