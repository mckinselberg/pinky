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
  if (cursors.left.isDown && cursors.right.isUp && cursors.down.isUp) {
    // left
    player.flipX = true;
    player.setVelocityX(-velocity);
    if (cursors.up.isUp) {
      player.body && player.setVelocityY(player.body.velocity.y + 50);
    }
    if (playerIsJumping) {
      if (!player.body) return;
      if (player.body.velocity.x < 0) player.setVelocityX(player.body.velocity.x + 30);
      return;
    }
    player.anims.play('left', true);
  } else if (cursors.left.isUp && player.body && player.body.velocity.x < 0) {
    // Only slow down if the player is moving left
    player.setVelocityX(player.body.velocity.x + 10);

  } else if (cursors.right.isDown && cursors.left.isUp && cursors.down.isUp) {
    // right
    player.flipX = false;
    player.setVelocityX(velocity);
    if (cursors.up.isUp) {
      if (!player.body) return;
      player.setVelocityY(player.body.velocity.y + 50);
    }
    if (playerIsJumping) {
      if (!player.body) return;
      if (player.body.velocity.x > 0) player.setVelocityX(player.body.velocity.x - 30);
      return;
    }
    player.anims.play('right', true);
  } else if (cursors.right.isUp && player.body && player.body.velocity.x > 0) {
    // Only slow down if the player is moving right
    player.setVelocityX(player.body.velocity.x - 10);
  
  } else if (player.body && player.body.velocity.x === 0 && playerIsBlockedDown) {
    player.anims.play('stand');
  }

  function jump() {
    player.setVelocityY(-500);
    player.anims.play('jump', true);
    _this.sound.play('jump');
  }

  // jump
  if (cursors.up.isDown && !playerIsJumping) {
    jump();
  } else if (cursors.up.isUp) {
    if (!player.body) return;
    player.setVelocityY(player.body.velocity.y + 10);
  } else if (playerIsJumping) {
    player.anims.play('jump', true);
  }

  if(playerIsFalling) {
    player.anims.play('falling', true);
  }

  // duck
  if (cursors.down.isDown && !playerIsJumping && playerHasInvincibility.powerUpActive) {
    player.anims.play('hide', true);
    playerHasInvincibility.value = true;
    player.setVelocityX(0);
  } else if (cursors.down.isUp) {
    playerHasInvincibility.value = false;
  }
}

export default handlePlayer;