import Phaser from "phaser";
import ground from './assets/platform.png';
import marioSm from './assets/sprites/mario-sm.png';
import tree from './assets/tree.png';
import goomba from './assets/sprites/goomba.png';

let player,
    playerStartX = 100,
    playerStartY = 450,
    colliderPlayerPlatform,
    enemies,
    platforms,
    platformEnds,
    cursors,
    gameOver = false,
    score = 0,
    scoreText,
    gravity = 300;

const preload = function preload () {
  this.cameras.main.setBackgroundColor('#ccccff'); 
  this.load.image('ground', ground);
  this.load.image('tree', tree);
  this.load.spritesheet(
    'marioSm',
    marioSm,
    { frameWidth: 32, frameHeight: 32 }
  );
  this.load.spritesheet(
    'goomba',
    goomba,
    { frameWidth: 32, frameHeight: 32 }
  );
};

function createPlatforms() {
  // platforms
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  platforms.create(100, 400, 'ground');
  platforms.create( 50, 250, 'ground');
  platforms.create(600, 475, 'ground');
  platforms.create(500, 200, 'ground');
  platforms.create(300, 100, 'ground');
}

function createEnemies() {
  enemies = this.physics.add.group();
  platformEnds = this.physics.add.group();
  platforms.children.iterate(function (platform) {
    let enemy = this.physics.add.sprite(platform.x, platform.y - 100, 'goomba');
    enemy.setBounce(0.1);
    enemy.setCollideWorldBounds(true);
    enemy.body.setGravityY(gravity);
    this.physics.add.collider(enemy, platforms);

    // platform ends
    let end1 = this.physics.add.sprite(platform.x - platform.displayWidth / 2, platform.y-32, null);
    let end2 = this.physics.add.sprite(platform.x + platform.displayWidth / 2, platform.y-32, null); 
    end1.setVisible(false);
    end2.setVisible(false);
    end1.body.setSize(1, 1);
    end2.body.setSize(1, 1);
    end1.body.setAllowGravity(false);
    end2.body.setAllowGravity(false);
    this.physics.add.collider(end1, platform);
    this.physics.add.collider(end2, platform);
    platformEnds.add(end1);
    platformEnds.add(end2);
    enemies.add(enemy);
  }, this);

  this.physics.add.overlap(enemies, platformEnds, function (enemy, end) {
    enemy.setVelocityX(-enemy.body.velocity.x);
  }, null, this);
}

function create() {
  this.add.image(600, 435, 'tree');
  cursors = this.input.keyboard.createCursorKeys(); 
  
  createPlatforms.bind(this)();
  createEnemies.bind(this)();
  player = this.physics.add.sprite(100, 450, 'marioSm');
  
  // player
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(gravity);
  colliderPlayerPlatform = this.physics.add.collider(player, platforms);

  // enemy
  enemies.children.iterate(function (enemy) {
    enemy.setBounce(0.1);
    enemy.setCollideWorldBounds(true);
    enemy.body.setGravityY(gravity);
    this.physics.add.collider(enemy, platforms);

    // player overlap with enemy
    const colliderPlayerEnemy = this.physics.add.collider(player, enemies, (data) => {
      player.setTint(0xff0000);
      player.anims.play('turn');
      player.setVelocityX(0);
      player.setVelocityY(-300);
      this.physics.world.removeCollider(colliderPlayerPlatform);
      this.physics.world.removeCollider(colliderPlayerEnemy);
      player.setCollideWorldBounds(false);
      gameOver = true;
    });
  }, this);
  

  // player animations
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

  // enemy animations
  this.anims.create({
    key: 'gombaMove',
    frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: 'gombaTurn',
    frames: [ { key: 'goomba', frame: 0 } ],
    frameRate: 20,
    repeat: -1,
  });
};

function isJumping(player) {
  return !player.body.touching.down && !player.body.blocked.down;
}

const velocity = 160;
function handlePlayer() {
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
    player.setVelocityY(player.body.velocity.y + 10);
  }

  // duck
  if (cursors.down.isDown && !playerIsJumping() && cursors.left.isUp && cursors.right.isUp) {
    player.anims.play('duck', true);
  }
}

function handleEnemies() {
  enemies.children.iterate(function (enemy) {
    enemy.anims.play('gombaMove', true);
    if (enemy.body.blocked.left) {
      enemy.setVelocityX(100);
    } else if (enemy.body.blocked.right) {
      enemy.setVelocityX(-100);
    } else if (enemy.body.velocity.x === 0) {
      enemy.setVelocityX(100);
    }
  }, this);
}

const update = function update() {
  if (gameOver) {
    return;
  }
  handlePlayer();
  handleEnemies();
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
