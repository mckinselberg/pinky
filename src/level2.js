import constants from './constants.js';
import ground from './assets/platform.png';
import tree from './assets/tree.png';
import pinky from './assets/sprites/pinky-sm.png';
import enemy from './assets/sprites/goomba.png';
import coin from './assets/coin.png';
import FontFaceObserver from 'fontfaceobserver';
import setupCursors from './setupCursors.js';
import createPlayer from './createPlayer.js';
import handlePlayer from './handlePlayer.js';
import createCoins from './createCoins.js';
import createResetButton from './createResetButton.js';
import background2 from './assets/bg1.png';

const { canvasWidth, canvasHeight, gravity, playerVelocity } = constants;

let player,
    playerIsHiding,
    trees,
    colliderPlayerPlatform,
    createOverlapPlayerEnemies,
    enemies,
    platforms,
    platformEnds,
    cursors,
    coins,
    score = { value: 0 },
    initialNumberOfCoins = 24,
    coinsToWin = initialNumberOfCoins + 3,
    winner = false,
    scoreText,
    gameOver = false,
    gameOverText,
    successText;

const random = (min, max) => Phaser.Math.RND.integerInRange(min, max)

function preload () {
  this.load.image('background2', background2);
  this.cameras.main.setBackgroundColor('#6bb6ff'); 
  this.load.image('ground', ground);
  this.load.image('tree', tree);
  this.load.spritesheet(
    'pinky',
    pinky,
    { frameWidth: 32, frameHeight: 32 }
  );
  this.load.spritesheet(
    'enemy',
    enemy,
    { frameWidth: 32, frameHeight: 32 }
  );
  this.load.image('coin', coin);
};

function createPlatforms() {
  // platforms
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  platforms.create(300, 400, 'ground');
  platforms.create(350, 250, 'ground');
  platforms.create(600, 175, 'ground');
  // platforms.create(500, 200, 'ground');
  // platforms.create(300, 100, 'ground');
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
      'enemy'
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

function createGameOverText() {
  gameOverText = this.add.text(400, 300, 'Game Over', { fontSize: '50px', fill: '#ff0000', fontFamily: 'Planes_ValMore' });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);
}

function createSuccessText() {
  successText = this.add.text(400, 300, 'You Win!', { fontSize: '50px', fill: '#000', fontFamily: 'Planes_ValMore' });
  successText.setOrigin(0.5);
  successText.setVisible(false);
}

function create() {
  this.add.image(400, 400, 'background2');
  gameOver = false;
  winner = false;
  
  
  let font = new FontFaceObserver('Planes_ValMore');
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });

  font.load().then(() => {
    // game over text
    createGameOverText.bind(this)();
    scoreText.setFont({ fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
    // score
  }).catch((error) => {
    console.error(error);
  });

  // reset button
  createResetButton(this, score);

  // success text
  createSuccessText.bind(this)();

  // set up the cursors
  cursors = setupCursors(this);

  // place the platforms
  createPlatforms.bind(this)();

  // player
  player = createPlayer(this, 'pinky');
  // place the trees
  trees = this.physics.add.staticGroup();
  createCoins(this, platforms, player, canvasWidth, initialNumberOfCoins, score, scoreText);
  createCoins(this, platforms, player, canvasWidth, 3, score, scoreText, canvasWidth / 2, canvasHeight - 100);
  trees.create(200, 360, 'tree')
  trees.create(canvasWidth - 150, canvasHeight - 90, 'tree');
  trees.create(canvasWidth - 20, canvasHeight - 90, 'tree');
  trees.children.iterate(function(tree, idx) {
    tree.body.setSize(50, 40);
    if (idx === 0) tree.setFlipX(true);
  })
  this.physics.add.collider(trees, platforms);

  // create enemies
  createEnemies.bind(this)();
  colliderPlayerPlatform = this.physics.add.collider(player, platforms);

  // enemies
  enemies.children.iterate(function (enemy) {
    enemy.setBounce(0.1);
    enemy.setCollideWorldBounds(true);
    enemy.body.setGravityY(gravity);
    this.physics.add.collider(enemy, platforms);
  }, this);
  // enemy animations
  this.anims.create({
    key: 'enemyMove',
    frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 1 }),
    frameRate: 10,
    repeat: -1,
  });
  
  // player overlap with enemy
  createOverlapPlayerEnemies.bind(this)();
  
  
  
};

function handleEnemies() {
  enemies.children.iterate(function (enemy) {
    enemy.anims.play('enemyMove', true);
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
  if (score.value === coinsToWin) {
    winner = true;
  }
  if (winner) {
    successText.setVisible(true);
    gameOverText.setVisible(false);
    winner = false;
    score.value = 0;
    setTimeout(() => {
      this.scene.stop('level2');
    }, 2000);
    return;
  }

  handlePlayer(cursors, player, playerVelocity);
  handleEnemies();
  handleplayerIsHiding.bind(this)();
};

export default {
  key: 'level2',
  preload,
  create,
  update,
};