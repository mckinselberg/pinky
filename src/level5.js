import createEnemies from './createEnemies.js';
import createFireBalls from './createFireBalls.js';
import createGameOverText from './createGameOverText.js';
import createOverlapPlayerEnemies from './createOverlapPlayerEnemies.js';
import createPlayer from './createPlayer.js';
import createResetButton from './createResetButton.js';
import { createBonusCoin, createSingleCoin } from './createCoins.js';
import createSuccessText from './createSuccessText.js';
import constants from './constants.js';
import enemy from './assets/sprites/enemy.png';
import enemy2 from './assets/sprites/enemy2.png';
import FontFaceObserver from 'fontfaceobserver';
import handleEnemies from './handleEnemies.js';
import handlePlayer from './handlePlayer.js';
import handleplayerIsHiding from './handleplayerIsHiding.js';
import setupCursors from './setupCursors.js';
import background4 from './assets/bg4.png';
import bonusCoinImg from './assets/sprites/bonus-coin.png';
import fireballImg from './assets/fireball.png';

const { canvasWidth, canvasHeight, gravity, playerVelocity, enemyPositions } = constants;

let 
colliderPlayerPlatform,
cursors,
enemies,
enemies2,
enemyVelocity = 200,
fireBalls,
gameOver = { value: false },
gameOverText,
coinsToWin = 3,
platforms,
player,
playerIsHiding = { value: false },
playerHasInvincibility = { 
  value: false,
  powerUpActive: false,
  powerUpMessage: '🔽 hide from aliens'
},
playerHasFireballs = { 
  value: false,
  powerUpActive: false,
  powerUpMessage: 'F to shoot to shoot owls'
},
score = { value: 0 },
scoreText,
successText,
trees,
winner = false,
level = 5,
levelText,
activeEnemies = 0,
finalCoinDropped = false;
    
function preload () {
  this.cameras.main.setBackgroundColor('#6bb6ff');
  this.load.image('background4', background4);
  this.load.spritesheet('enemy',  enemy,  { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('enemy2', enemy2, { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('bonusCoin', bonusCoinImg, { frameWidth: 20, frameHeight: 23 });
  this.load.image('fireball', fireballImg);
};

function createPlatforms(_this) {
  // platforms
  platforms = _this.physics.add.staticGroup();
  platforms.create(canvasWidth/2, canvasHeight - 10, 'ground').setScale(1.8,1).refreshBody();
  platforms.create(canvasWidth/2 - 10, canvasHeight - 100, 'ground').setScale(1.8,1).refreshBody();
  platforms.create(canvasWidth/2, canvasHeight - 200, 'ground').setScale(.5,1).refreshBody();
  return platforms;
}

function createTrees(_this, platforms = null) {
  const trees = _this.physics.add.staticGroup();

  for (let i = 0; i < canvasWidth; i+=canvasWidth/10) {
    trees.create(canvasWidth - i - 40, canvasHeight - 20, 'tree');
  }
  trees.children.iterate(function(tree, idx) {
    tree.body.setSize(50, 40);
    if (idx === 0) tree.setFlipX(true);
  });
  platforms && _this.physics.add.collider(trees, platforms);
  return trees;
}

function create() {
  this.add.image(400, 400, 'background4').setScale(.55, .75);
  gameOver.value = false;
  winner = false;
  
  let font = new FontFaceObserver('Planes_ValMore');
  scoreText = this.add.text(16, 16, `Score: 0 / ${coinsToWin}`, { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  levelText = this.add.text(16, 40, `Level: ${level}`, { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  
  font.load().then(() => {
    // game over text
    gameOverText = createGameOverText(this);
    scoreText.setFont({ fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
    // score
  }).catch((error) => {
    console.error(error);
  });

  // set up the cursors
  cursors = setupCursors(this);
  
  // place the platforms
  platforms = createPlatforms(this);
  
  // create enemies
  enemies = createEnemies({
    _this: this,
    enemySprite: 'enemy',
    gravity: gravity,
    platforms: platforms,
    position: enemyPositions.RANDOM,
    removeNthEnemies: [2],
    velocity: enemyVelocity,
  });
  enemies2 = createEnemies({
    _this: this,
    enemySprite: 'enemy2',
    gravity: gravity,
    removeNthEnemies: [2],
    platforms: platforms,
    position: enemyPositions.RIGHT,
    velocity: 100,
  });

  // player
  player = createPlayer(this, 'pinky', canvasWidth/2, 10);
  colliderPlayerPlatform = this.physics.add.collider(player, platforms);

  // invincibility
  createBonusCoin({
    _this: this,
    coinsToWin: coinsToWin,
    platforms: platforms,
    player: player,
    powerUp: playerHasInvincibility,
    score: score,
    scoreText: scoreText,
    xPosition: canvasWidth - 160,
    yPosition: 60 * 5 + 65,
  })

  // fireballs
  createBonusCoin({
    _this: this,
    coinsToWin: coinsToWin,
    platforms: platforms,
    player: player,
    powerUp: playerHasFireballs,
    score: score,
    scoreText: scoreText,
    xPosition: 160,
    yPosition: 60 * 7 + 65,
  });

  // player overlap with enemy
  createOverlapPlayerEnemies(this, player, enemies,  colliderPlayerPlatform, playerIsHiding, gameOver, winner, playerHasInvincibility);
  createOverlapPlayerEnemies(this, player, enemies2, colliderPlayerPlatform, playerIsHiding, gameOver, winner);

  // fireballs
  fireBalls = createFireBalls({
    _this: this,
    player: player,
    platforms: platforms,
    enemies: enemies2,
    enemySprite: 'enemy2',
    playerHasFireballs: playerHasFireballs,
  });
  
  // reset button
  createResetButton({ _this: this, score, playerHasInvincibility, playerHasFireballs });
  
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
    enemies.clear(true, true);
    enemies2.clear(true, true);
    setTimeout(() => {
      // this.scene.stop(`level${level}`);
      // this.scene.start(`level${level + 1}`);
    }, 2000);
    return;
  }

  handleplayerIsHiding(this, player, trees, playerIsHiding);
  handlePlayer({_this: this, cursors, player,velocity: playerVelocity, playerIsHiding, playerHasInvincibility});
  handleEnemies(this, enemies, 'enemy',  enemyVelocity);
  handleEnemies(this, enemies2, 'enemy2', 100);

  if (enemies2.countActive() === 0 && !finalCoinDropped) {
    createSingleCoin({
      _this: this,
      platforms: platforms,
      player: player,
      score: score,
      scoreText: scoreText,
      xPosition: canvasWidth/2,
      yPosition: 0,
    });
    finalCoinDropped = true;
  }
};

export default {
  key: `level${level}`,
  preload,
  create,
  update,
};