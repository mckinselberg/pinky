import createEnemies from './createEnemies';
import createFireBalls from './createFireBalls';
import createGameOverText from './createGameOverText';
import createOverlapPlayerEnemies from './createOverlapPlayerEnemies';
import createPlayer from './createPlayer';
import createResetButton from './createResetButton';
import { createBonusCoin, createSingleCoin } from './createCoins';
import createSuccessText from './createSuccessText';
import constants from './constants';
import enemy from './assets/sprites/enemy.png';
import enemy2 from './assets/sprites/enemy2.png';
import FontFaceObserver from 'fontfaceobserver';
import handleEnemies from './handleEnemies';
import handlePlayer from './handlePlayer';
import handleplayerIsHiding from './handleplayerIsHiding';
import setupCursors from './setupCursors';
import setupWASD from './setupWASD.js';
import background4 from './assets/bg4.png';
import bonusCoinImg from './assets/sprites/bonus-coin.png';
import fireballImg from './assets/fireball.png';
import createScoreText from './createScoreText';
import createLevelText from './createLevelText';

const { canvasWidth, canvasHeight, gravity, playerVelocity, enemyPositions } = constants;

let 
  colliderPlayerPlatform: Phaser.Physics.Arcade.Collider,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys,
  wasd: any,
  enemies: Phaser.GameObjects.Group,
  enemies2: Phaser.GameObjects.Group,
  enemyVelocity = 200,
  fireBalls: Phaser.GameObjects.Group,
  gameOver = { value: false },
  gameOverText: Phaser.GameObjects.Text,
  coinsToWin = 3,
  platforms: Phaser.Physics.Arcade.StaticGroup,
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
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
  scoreText: Phaser.GameObjects.Text,
  successText: Phaser.GameObjects.Text,
  trees: Phaser.Physics.Arcade.StaticGroup,
  winner = false,
  level = 6,
  levelText: Phaser.GameObjects.Text,
  activeEnemies = 0,
  finalCoinDropped = { value: false },
  timeout: number;
    
function preload (this: Phaser.Scene) {
  this.cameras.main.setBackgroundColor('#6bb6ff');
  this.load.image('background4', background4);
  this.load.spritesheet('enemy',  enemy,  { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('enemy2', enemy2, { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('bonusCoin', bonusCoinImg, { frameWidth: 20, frameHeight: 23 });
  this.load.image('fireball', fireballImg);
};

function createPlatforms(_this: Phaser.Scene) {
  // platforms
  platforms = _this.physics.add.staticGroup();
  platforms.create(canvasWidth/2, canvasHeight - 10, 'ground').setScale(1.8,1).refreshBody();
  platforms.create(canvasWidth/2 - 10, canvasHeight - 100, 'ground').setScale(1.8,1).refreshBody();
  platforms.create(canvasWidth/2, canvasHeight - 200, 'ground').setScale(.5,1).refreshBody();
  return platforms;
}

function createTrees(_this: Phaser.Scene, platforms = null) {
  const trees = _this.physics.add.staticGroup();

  for (let i = 0; i < canvasWidth; i+=canvasWidth/10) {
    trees.create(canvasWidth - i - 40, canvasHeight - 20, 'tree');
  }
  // trees.children.iterate(function(tree, idx) {
  //   tree.body.setSize(50, 40);
  //   if (idx === 0) tree.setFlipX(true);
  // });
  platforms && _this.physics.add.collider(trees, platforms);
  return trees;
}

function create(this: Phaser.Scene) {
  this.cameras.main.fadeIn(1000);
  this.add.image(400, 400, 'background4').setScale(.55, .75);
  gameOver.value = false;
  winner = false;
  
  let font = new FontFaceObserver('Planes_ValMore');
  scoreText = createScoreText({ _this: this, coinsToWin });
  levelText = createLevelText({ _this: this, level });
  gameOverText = createGameOverText(this);

  // set up the cursors
  cursors = setupCursors(this) as Phaser.Types.Input.Keyboard.CursorKeys;
  wasd = setupWASD(this);
  
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
    enemyVelocity,
  });
  enemies2 = createEnemies({
    _this: this,
    enemySprite: 'enemy2',
    gravity: gravity,
    removeNthEnemies: [2],
    platforms: platforms,
    position: enemyPositions.RIGHT,
    enemyVelocity: 100,
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
  createResetButton({ _this: this, score, playerHasInvincibility, playerHasFireballs, finalCoinDropped });
  
  // success text
  successText = createSuccessText(this, level);
};


const update = function update(this: Phaser.Scene) {
  if (player.y + player.height > canvasHeight) {
    gameOver.value = true;
    player.destroy();
    gameOver.value = true;
    clearTimeout(timeout);
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
    this.cameras.main.fadeOut(1000);
    // @ts-ignore
    timeout = setTimeout(() => {
      this.scene.stop(`level${level}`);
      this.scene.start(`level${level + 1}`);
    }, 2000);
    return;
  }

  handleplayerIsHiding(this, player, trees, playerIsHiding);
  handlePlayer({_this: this, cursors, wasd, player,velocity: playerVelocity, playerIsHiding, playerHasInvincibility});
  handleEnemies(this, enemies, 'enemy',  enemyVelocity);
  handleEnemies(this, enemies2, 'enemy2', 100);

  if (enemies2.countActive() === 0 && !finalCoinDropped.value) {
    createSingleCoin({
      _this: this,
      coinsToWin: coinsToWin,
      platforms: platforms,
      player: player,
      score: score,
      scoreText: scoreText,
      xPosition: canvasWidth/2,
      yPosition: 0,
    });
    finalCoinDropped.value = true;
  }
};

export default {
  key: `level${level}`,
  preload,
  create,
  update,
};