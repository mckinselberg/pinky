import Phaser from "phaser";
import sky from './assets/sky.png';
import ground from './assets/platform.png';
import marioSm from './assets/sprites/mario-sm.png';


let player, platforms, cursors, gameOver = false, score = 0, scoreText;

const preload = function preload () {
  // this.load.image('sky', sky);
  this.cameras.main.setBackgroundColor('#ccccff'); 
  this.load.image('ground', ground);
  this.load.spritesheet(
    'marioSm',
    marioSm,
    { frameWidth: 32, frameHeight: 32 }
  );
};

function create() {
  this.add.image(400, 300, 'sky');
  platforms = this.physics.add.staticGroup();
  platforms.add(this.add.image(400, 568, 'ground'));
  player = this.physics.add.sprite(100, 450, 'marioSm');
  cursors = this.input.keyboard.createCursorKeys();

  // platforms
  platforms.create(500, 568, 'ground').setScale(2).refreshBody();
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');
  // player
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(300);
  // stars
  // const howManyStars = 11;
  // stars = this.physics.add.group({
  //   key: 'star',
  //   repeat: howManyStars,
  //   setXY: { x: 12, y: 0, stepX: 70 }
  // });
  // stars.children.iterate(function (child) {
  //   child.setBounceY(1);
  // });

  // colliders
  this.physics.add.collider(player, platforms);
  // this.physics.add.collider(stars, platforms);
  // this.physics.add.collider(bombs, platforms);
  // this.physics.add.collider(player, bombs, hitBomb, null, this);
  // this.physics.add.collider(bombs, platforms);
  // this.physics.add.collider(player, bombs, hitBomb, null, this);

  // overlaps
  // this.physics.add.overlap(player, stars, collectStar, null, this);

  // sprite animation
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('marioSm', { start: 1, end: 2 }),
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
    frames: this.anims.generateFrameNumbers('marioSm', { start: 1, end: 2 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'jump',
    frames: this.anims.generateFrameNumbers('marioSm', { start: 3, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  // function collectStar (player, star) {
  //   star.disableBody(true, true);
  //   score += 10;
  //   scoreText.setText('Score: ' + score);

  //   if (stars.countActive(true) === 0) {
  //     stars.children.iterate(function (child) {
  //       child.enableBody(true, child.x, 0, true, true);
  //     });

  //     let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
  //     let bomb = bombs.create(x, 16, 'bomb');
  //     bomb.setBounce(1);
  //     bomb.setCollideWorldBounds(true);
  //     bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

  //   }
  // }

  // function hitBomb (player, bomb) {
  //   this.physics.pause();
  //   player.setTint(0xff0000);
  //   player.anims.play('turn');
    // gameOver = true;
  // }
};

function isJumping(player) {
  return !player.body.touching.down && !player.body.blocked.down;
}

const jumpVelocity = 160;

const update = function update() {
  if (gameOver) {
    return;
  }
  const playerIsJumping = isJumping.bind(null, player);

  // left
  if (cursors.left.isDown) {
    player.flipX = true;
    player.setVelocityX(-jumpVelocity);
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
  } else if (cursors.right.isDown) {
    player.flipX = false;
    player.setVelocityX(jumpVelocity);
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

  if (cursors.up.isDown && !playerIsJumping()) {
    player.setVelocityY(-500);
    player.anims.play('jump', true);
  } else if (cursors.up.isUp) {
    player.setVelocityY(player.body.velocity.y + 15);
  }

  
  // console.log(`x: ${player.body.velocity.x}`);
  // console.log(`y: ${player.body.velocity.y}`);
};

const canvasWidth = 800, canvasHeight = 600;
const config = {
  type: Phaser.AUTO,
  width: canvasWidth,
  height: canvasHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 }
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};
const game = new Phaser.Game(config);
