import Phaser from "phaser";
import ground from './assets/platform.png';
import pinky from './assets/sprites/pinky-sm.png';
import tree from './assets/tree.png';
import goomba from './assets/sprites/goomba.png';
import coin from './assets/coin.png';

let player,
    playerIsHiding,
    trees,
    colliderPlayerPlatform,
    createOverlapPlayerEnemies,
    enemies,
    platforms,
    platformEnds,
    cursors,
    gravity = 300,
    coins,
    initialNumberOfCoins = 24,
    score = 0,
    scoreText,
    gameOver = false,
    gameOverText,
    successText,
    winner = false,
    velocity = 160;

const random = (min, max) => Phaser.Math.RND.integerInRange(min, max)

function preload () {
  this.cameras.main.setBackgroundColor('#6bb6ff'); 
  this.load.image('ground', ground);
  this.load.image('tree', tree);
  this.load.spritesheet(
    'pinky',
    pinky,
    { frameWidth: 32, frameHeight: 32 }
  );
  this.load.spritesheet(
    'goomba',
    goomba,
    { frameWidth: 32, frameHeight: 32 }
  );
  this.load.image('coin', coin);
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
  platforms.children.iterate(function (platform, i) {
    if (i === 0) return;
    let enemy = this.physics.add.sprite(
      random(platform.x - platform.displayWidth / 2 + 50, platform.x + platform.displayWidth / 2 - 50),
      // platform.y - 100,
      platform.y - 30,
      'goomba'
    );
    enemy.body.setSize(20, 28, true);

    enemy.setVelocityX(random(-300, 300));
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

createOverlapPlayerEnemies = function createOverlapPlayerEnemies() {
  this.physics.add.overlap(player, enemies, function () {
    if (playerIsHiding) {
      return;
    } else {
      player.setTint(0xff0000);
      player.anims.play('turn');
      player.setVelocityY(-300);
      this.physics.world.removeCollider(colliderPlayerPlatform);
      player.setCollideWorldBounds(false);
      gameOver = true;
    }
  }, function() {
    return winner ? false : true;
  }, this);
}

function createCoins() {
  coins = this.physics.add.group({
    key: 'coin',
    repeat: initialNumberOfCoins -1,
    setXY: { x: 12, y: 0, stepX: canvasWidth / initialNumberOfCoins },
  });
  coins.children.iterate(function (coin) {
    coin.setCollideWorldBounds(true);
    coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });
  this.physics.add.collider(coins, platforms);
  this.physics.add.overlap(player, coins, collectCoin, null, this);
}

function createGameOverText() {
  gameOverText = this.add.text(400, 300, 'Game Over', { fontSize: '50px', fill: '#ff0000', fontFamily: 'Planes_ValMore' });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);
}

function createResetButton() {
  const resetButton = this.add.text(700, 16, 'Reset', { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  resetButton.setInteractive();
  resetButton.on('pointerdown', () => { this.scene.restart(); });
};

function createSuccessText() {
  successText = this.add.text(400, 300, 'You Win!', { fontSize: '50px', fill: '#000', fontFamily: 'Planes_ValMore' });
  successText.setOrigin(0.5);
  successText.setVisible(false);
}

function create() {
  score = 0,
  gameOver = false;
  winner = false;

  // reset button
  createResetButton.bind(this)();

  // success text
  createSuccessText.bind(this)();

  // set up the cursors
  cursors = this.input.keyboard.createCursorKeys(); 

  // place the platforms
  createPlatforms.bind(this)();

  // place the player
  player = this.physics.add.sprite(100, 450, 'pinky');

  // place the trees
  trees = this.physics.add.staticGroup();
  trees.create(200, 60, 'tree')
  trees.create(600, 435, 'tree');
  trees.create(400, 160, 'tree');
  trees.children.iterate(function(tree, idx) {
    tree.body.setSize(50, 40);
    if (idx === 0) tree.setFlipX(true);
  })
  this.physics.add.collider(trees, platforms);

  // create enemies
  createEnemies.bind(this)();
  
  // player
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(gravity);
  colliderPlayerPlatform = this.physics.add.collider(player, platforms);
  // player animations
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('pinky', { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: 'turn',
    frames: [ { key: 'pinky', frame: 0 } ],
    frameRate: 20
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('pinky', { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'jump',
    frames: this.anims.generateFrameNumbers('pinky', { start: 4, end: 4 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'duck',
    frames: [ { key: 'pinky', frame: 5 } ],
    frameRate: 10,
    repeat: -1
  });

  // enemies
  enemies.children.iterate(function (enemy) {
    enemy.setBounce(0.1);
    enemy.setCollideWorldBounds(true);
    enemy.body.setGravityY(gravity);
    this.physics.add.collider(enemy, platforms);
  }, this);
  // enemy animations
  this.anims.create({
    key: 'goombaMove',
    frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
    frameRate: 10,
    repeat: -1,
  });
  // this.anims.create({
  //   key: 'goombaTurn',
  //   frames: [ { key: 'goomba', frame: 0 } ],
  //   frameRate: 20,
  //   repeat: -1,
  // });
  
  // player overlap with enemy
  createOverlapPlayerEnemies.bind(this)();
  
  // coins
  createCoins.bind(this)();
  
  // game over text
  createGameOverText.bind(this)();
  

  // this.physics.add.collider(enemies, coins, function (enemy, coin) {
  //   enemy.setVelocityX(enemy.body.velocity.x * 1.0002);
  //   coin.setVelocityX(coin.body.velocity.x + 10);
  //   coin.setVelocityY(coin.body.velocity.y - 10);
  // }, null, this);

  // score
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
};

function collectCoin(player, coin) {
  coin.disableBody(true, true);
  coin.destroy();
  score += 1;
  scoreText.setText('Score: ' + score);
}

function isJumping(player) {
  return !player.body.touching.down && !player.body.blocked.down;
}

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
  } else if (playerIsJumping()) {
    player.anims.play('jump', true);
  }

  // duck
  if (cursors.down.isDown && !playerIsJumping() && cursors.left.isUp && cursors.right.isUp) {
    player.anims.play('duck', true);
    playerIsHiding = true;
  }
}

function handleEnemies() {
  enemies.children.iterate(function (enemy) {
    enemy.anims.play('goombaMove', true);
    if (enemy.body.velocity.x > 0) {
      enemy.flipX = false;
    } else if (enemy.body.velocity.x < 0) {
      enemy.flipX = true;
    }
    if (enemy.body.blocked.left) {
      enemy.setVelocityX(100);
    } else if (enemy.body.blocked.right) {
      enemy.setVelocityX(-100);
    } else if (enemy.body.velocity.x === 0) {
      enemy.setVelocityX(100);
    }
  }, this);
}

function handleplayerIsHiding() {
  const overlap = this.physics.overlap(player, trees);
  playerIsHiding = overlap ? true : false;
}

const update = function update() {
  if (gameOver) {
    gameOverText.setVisible(true);
    return;
  }
  if (score === initialNumberOfCoins) {
    successText.setVisible(true);
    gameOverText.setVisible(false);
    winner = true;
    return;
  }

  handlePlayer();
  handleEnemies();
  handleplayerIsHiding.bind(this)();
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
