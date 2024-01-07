// import debounce from "./debounce";
import { Physics } from 'phaser';
import constants from './constants';

const { canvasWidth } = constants;

function isJumping(player: Physics.Arcade.Sprite) {
  return player.body && !player.body.touching.down && !player.body.blocked.down;
}
function isFalling(player: Physics.Arcade.Sprite) {
  return player.body && player.body.velocity.y > 0;
}

function isTouchingWorldBounds(player: Physics.Arcade.Sprite) {
  return player.body && (player.body.position.x === 0 || player.body.position.x + player.body.width === canvasWidth);
}

function isBlockedDown(player: Physics.Arcade.Sprite) {
  return player.body && player.body.blocked.down;
}

function handlePlayer({
  _this,
  cursors,
  wasd,
  player,
  velocity,
  playerIsHiding = { 
    value: false
  },
  playerHasFireballs = { value: false, powerUpActive: false },
  playerHasInvincibility = { value: false, powerUpActive: false },
}: {
  _this: Phaser.Scene,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys,
  wasd: any,
  player: Phaser.Physics.Arcade.Sprite,
  velocity: number,
  playerIsHiding?: { value: boolean },
  playerHasFireballs?: {
    value: boolean,
    powerUpActive: boolean
  },
  playerHasInvincibility?: {
    value: boolean,
    powerUpActive: boolean
  },

}) {
  const playerIsJumping = isJumping(player);
  const playerIsFalling = isFalling(player);
  const playerIsTouchingWorldBounds = isTouchingWorldBounds(player);
  const playerIsBlockedDown = isBlockedDown(player);
  // Check if player is touching world bounds
  if (playerIsTouchingWorldBounds) {
    player.setVelocityX(0);
    player.anims.play('stand', true);
    player.anims.stop();
  }
  // cursors = wasd;
  if (
    (cursors.left.isDown && cursors.right.isUp && cursors.down.isUp) ||
    (wasd.left.isDown && wasd.right.isUp && wasd.down.isUp)
  ) {
    // left
    player.flipX = true;
    player.setVelocityX(-velocity);
    if ((cursors.up.isUp && cursors.left.isDown) || (wasd.up.isUp && wasd.left.isDown)) {
      player.body && player.setVelocityY(player.body.velocity.y + 50);
    }
    if (playerIsJumping) {
      if (!player.body) return;
      if (player.body.velocity.x < 0) player.setVelocityX(player.body.velocity.x + 30);
      return;
    }
    player.anims.play('left', true);
  } else if (
    (cursors.left.isUp && player.body && player.body.velocity.x < 0) ||
    (wasd.left.isUp && player.body && player.body.velocity.x < 0)
  ) {
    // Only slow down if the player is moving left
    player.setVelocityX(player.body.velocity.x + 10);

  } else if (
    (cursors.right.isDown && cursors.left.isUp && cursors.down.isUp) ||
    (wasd.right.isDown && wasd.left.isUp && wasd.down.isUp)
  ) {
    // right
    player.flipX = false;
    player.setVelocityX(velocity);
    if ((cursors.up.isUp && cursors.down.isDown) || (wasd.up.isUp && wasd.down.isdown)) {
      if (!player.body) return;
      player.setVelocityY(player.body.velocity.y + 50);
    }
    if (playerIsJumping) {
      if (!player.body) return;
      if (player.body.velocity.x > 0) player.setVelocityX(player.body.velocity.x - 30);
      return;
    }
    player.anims.play('right', true);
  } else if (
    (cursors.right.isUp && player.body && player.body.velocity.x > 0) ||
    (wasd.right.isUp && player.body && player.body.velocity.x > 0)
  ) {
    // Only slow down if the player is moving right
    player.setVelocityX(player.body.velocity.x - 10);
  
  } else if ((player.body && player.body.velocity.x === 0 && playerIsBlockedDown)) {
    player.anims.play('stand');
  }

  function jump() {
    player.setVelocityY(-500);
    player.anims.play('jump', true);
    _this.sound.play('jump');
  }

  // jump
  if (
      (cursors.up.isDown && !playerIsJumping) ||
      (wasd.up.isDown && !playerIsJumping)
  ) {
    jump();
  } else if (
    (cursors.up.isUp) || 
    (wasd.up.isUp)
  ) {
    if (!player.body) return;
    player.setVelocityY(player.body.velocity.y + 10);
  } else if (playerIsJumping) {
    player.anims.play('jump', true);
  }

  if(playerIsFalling) {
    player.anims.play('falling', true);
  }

  // duck
  if (
    (cursors.down.isDown && !playerIsJumping && playerHasInvincibility.powerUpActive) ||
    (wasd.down.isDown && !playerIsJumping && playerHasInvincibility.powerUpActive)
  ) {
    player.anims.play('hide', true);
    playerHasInvincibility.value = true;
    player.setVelocityX(0);
  } else if (cursors.down.isUp || wasd.down.isUp) {
    playerHasInvincibility.value = false;
  }
}

export default handlePlayer;