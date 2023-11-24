import Phaser from "phaser";
import sky from './assets/sky.png';
// import ground2 from './assets/platform2.png';
import ground from './assets/platform.png';
import marioSm from './assets/sprites/mario-sm.png';
import tree from './assets/tree.png';

let player, platforms, cursors, gameOver = false, score = 0, scoreText, gravity = 300;

const preload = function preload () {
  // this.load.image('sky', sky);
  this.cameras.main.setBackgroundColor('#ccccff'); 
  this.load.image('ground', ground);
  this.load.image('tree', tree);
  // this.load.image('ground2', ground2);
  this.load.spritesheet(
    'marioSm',
    marioSm,
    { frameWidth: 32, frameHeight: 32 }
  );
};

function create() {
  platforms = this.physics.add.staticGroup();
  this.add.image(600, 435, 'tree');
  player = this.physics.add.sprite(100, 450, 'marioSm');
  cursors = this.input.keyboard.createCursorKeys();

  // platforms
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  platforms.create(100, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(600, 475, 'ground');
  platforms.create(500, 200, 'ground');
  platforms.create(300, 100, 'ground');
  
  // player
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(gravity);

  // colliders
  this.physics.add.collider(player, platforms);
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('marioSm', { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: 'turn',
    frames: [ { key: 'marioSm', frame: 0 } ],
    frameRate: 20
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('marioSm', { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'jump',
    frames: this.anims.generateFrameNumbers('marioSm', { start: 3, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'duck',
    frames: [ { key: 'marioSm', frame: 5 } ],
    frameRate: 10,
    repeat: -1
  });
};

function isJumping(player) {
  return !player.body.touching.down && !player.body.blocked.down;
}


const update = function update() {
  if (gameOver) {
    return;
  }
  
  const velocity = 160;
  const playerIsJumping = isJumping.bind(null, player);

  // left
  if (cursors.left.isDown && cursors.right.isUp && cursors.down.isUp) {
    player.flipX = true;
    player.setVelocityX(-velocity);
    if (cursors.up.isUp) {
      player.setVelocityY(player.body.velocity.y + 50);
    }
    if (playerIsJumping()) {
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
    if (playerIsJumping()) {
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
  if (cursors.up.isDown && !playerIsJumping()) {
    player.setVelocityY(-500);
    player.anims.play('jump', true);
  } else if (cursors.up.isUp) {
    player.setVelocityY(player.body.velocity.y + 15);
  }

  // duck
  if (cursors.down.isDown && !playerIsJumping() && cursors.left.isUp && cursors.right.isUp) {
    player.anims.play('duck', true);
  }
};

const canvasWidth = 800, canvasHeight = 600;
const config = {
  type: Phaser.AUTO,
  width: canvasWidth,
  height: canvasHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: gravity + 200 }
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};
const game = new Phaser.Game(config);
