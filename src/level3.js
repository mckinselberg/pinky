import constants from './constants.js';
import enemy from './assets/sprites/enemy.png';
import enemy2 from './assets/sprites/enemy2.png';
import FontFaceObserver from 'fontfaceobserver';
import setupCursors from './setupCursors.js';
import createPlayer from './createPlayer.js';
import handlePlayer from './handlePlayer.js';
import createEnemies from './createEnemies.js';
import { createSingleCoin, createBonusCoin } from './createCoins.js';
import createResetButton from './createResetButton.js';
import createOverlapPlayerEnemies from './createOverlapPlayerEnemies.js';
import createGameOverText from './createGameOverText.js';
import createSuccessText from './createSuccessText.js';
import handleEnemies from './handleEnemies.js';
import background3 from './assets/bg3.png';
import bonusCoinImg from './assets/sprites/bonus-coin.png';
// import random from './random.js';

const { canvasWidth, canvasHeight, gravity, playerVelocity } = constants;

let player,
    playerIsHiding = { value: false },
    playerIsInvincible = { value: false, powerUpActive: false },
    trees,
    colliderPlayerPlatform,
    enemies,
    enemies2,
    platforms,
    cursors,
    score = { value: 0 },
    initialNumberOfCoins = 8,
    coinsToWin = initialNumberOfCoins,
    winner = false,
    scoreText,
    gameOver = { value: false },
    gameOverText,
    successText,
    levelText,
    enemyVelocity,
    bonusCoin;

function preload () {
  this.cameras.main.setBackgroundColor('#6bb6ff');
  this.load.image('background3', background3);
  this.load.spritesheet(
    'enemy',
    enemy,
    { frameWidth: 32, frameHeight: 32 }
  );
  this.load.spritesheet(
    'enemy2',
    enemy2,
    { frameWidth: 32, frameHeight: 32 }
  );
  
  this.load.spritesheet(
    'bonusCoin',
    bonusCoinImg,
    { frameWidth: 20, frameHeight: 23 }
  );
};

function createPlatforms(_this) {
  // platforms
  platforms = _this.physics.add.staticGroup();
  for (let i = 2; i < 10; i++) {
    platforms.create(canvasWidth + (i * 15), 60 * i + 20, 'ground').setScale(.5*i,1).refreshBody();
  }
  return platforms;
}

function createTrees(_this, platforms = null) {
  const trees = _this.physics.add.staticGroup();

  for (let i = 2; i < 10; i++) {
    trees.create((canvasWidth - i * 10) - 50, 60 * i - 20, 'tree');
  }
  trees.children.iterate(function(tree, idx) {
    // tree.setScale(1.5, .85).refreshBody();
    tree.body.setSize(50, 40);
    if (idx === 0) tree.setFlipX(true);
  });
  platforms && _this.physics.add.collider(trees, platforms);
  return trees;
}

function create() {
  this.add.image(400, 400, 'background3').setScale(.75);;
  gameOver.value = false;
  winner = false;
  
  enemyVelocity = 200;

  let font = new FontFaceObserver('Planes_ValMore');
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  levelText = this.add.text(16, 40, 'Level: 3', { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  
  font.load().then(() => {
    // game over text
    gameOverText = createGameOverText(this);
    scoreText.setFont({ fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
    levelText.setFont({ fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
    // score
  }).catch((error) => {
    console.error(error);
  });

  // set up the cursors
  cursors = setupCursors(this);
  
  // place the platforms
  platforms = createPlatforms(this);
  
  // create enemies
  enemies  = createEnemies(this, platforms, gravity, [3], enemyVelocity, 'enemy', 'left');
  enemies2 = createEnemies(this, platforms, gravity, [3], 100, 'enemy2', 'right');
  
  // trees
  // trees = createTrees(this);
  
  // player
  player = createPlayer(this, 'pinky', canvasWidth/2, 10);
  colliderPlayerPlatform = this.physics.add.collider(player, platforms);

  for (let i = 0; i < initialNumberOfCoins; i++) {
    i !== 3 && createSingleCoin(this, platforms, player, canvasWidth, 1, score, scoreText, (canvasWidth - i * 12) - 60, 60 * i + 65);
  }
  
  this.anims.create({
    key: 'bonusCoinBlink',
    frames: this.anims.generateFrameNumbers('bonusCoin', { start: 0, end: 1 }),
    frameRate: 5,
    repeat: -1
  });
  bonusCoin = createBonusCoin(this, platforms, player, canvasWidth, 1, score, scoreText, canvasWidth - 60, 60 * 3 + 65, playerIsInvincible);
  // player overlap with enemy
  createOverlapPlayerEnemies(this, player, enemies,  colliderPlayerPlatform, playerIsHiding, gameOver, winner, playerIsInvincible);
  createOverlapPlayerEnemies(this, player, enemies2, colliderPlayerPlatform, playerIsHiding, gameOver, winner, { value: false });

  // reset button
  createResetButton(this, score, playerIsInvincible);
  
  // success text
  successText = createSuccessText(this);
};

const update = function update() {
  if (player.y + player.height > canvasHeight) {
    gameOver.value = true;
    player.destroy();
    gameOver.value = true;
  }
  if (gameOver.value) {
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
      this.scene.stop('level3');
      this.scene.start('level4');
    }, 2000);
    enemies.clear(true, true);
    enemies2.clear(true, true);
    return;
  }



  handlePlayer(this, cursors, player, playerVelocity, { value: false }, playerIsInvincible);
  handleEnemies(this, enemies, 'enemy', enemyVelocity);
  handleEnemies(this, enemies2, 'enemy2');
};

export default {
  key: 'level3',
  preload,
  create,
  update,
};