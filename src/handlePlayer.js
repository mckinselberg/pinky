function isJumping(player) {
  return !player.body.touching.down && !player.body.blocked.down;
}

function handlePlayer(cursors, player, velocity) {
  const playerIsJumping = isJumping(player);
  // left
  if (cursors.left.isDown && cursors.right.isUp && cursors.down.isUp) {
    player.flipX = true;
    player.setVelocityX(-velocity);
    if (cursors.up.isUp) {
      player.setVelocityY(player.body.velocity.y + 50);
    }
    if (playerIsJumping) {
      if (player.body.velocity.x < 0) player.setVelocityX(player.body.velocity.x + 30);
      return;
    }
    player.anims.play('left', true);
  } else if (cursors.left.isUp && player.body.velocity.x < 0) {

    // Only slow down if the player is moving left
    player.setVelocityX(player.body.velocity.x + 10);

  // right
  } else if (cursors.right.isDown && cursors.left.isUp && cursors.down.isUp) {
    player.flipX = false;
    player.setVelocityX(velocity);
    if (cursors.up.isUp) {
      player.setVelocityY(player.body.velocity.y + 50);
    }
    if (playerIsJumping) {
      if (player.body.velocity.x > 0) player.setVelocityX(player.body.velocity.x - 30);
      return;
    }
    player.anims.play('right', true);
  } else if (cursors.right.isUp && player.body.velocity.x > 0) {
    // Only slow down if the player is moving right
    player.setVelocityX(player.body.velocity.x - 10);
  
  } else if (player.body.velocity.x === 0) {
    player.anims.play('turn');
  }

  // jump
  if (cursors.up.isDown && !playerIsJumping) {
    player.setVelocityY(-500);
    player.anims.play('jump', true);
  } else if (cursors.up.isUp) {
    player.setVelocityY(player.body.velocity.y + 10);
  } else if (playerIsJumping) {
    player.anims.play('jump', true);
  }

  // duck
  if (cursors.down.isDown && !playerIsJumping && cursors.left.isUp && cursors.right.isUp) {
    player.anims.play('duck', true);
    // playerIsHiding = true;
  }
}

export default handlePlayer;