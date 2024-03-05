import createGameOverText from './createGameOverText';
import createPlayer from './createPlayer';
import createResetButton from './createResetButton';
import { createSingleCoin } from './createCoins';
import createSuccessText from './createSuccessText';
import constants from './constants';
import enemy from './assets/sprites/enemy.png';
import enemy2 from './assets/sprites/enemy2.png';
import FontFaceObserver from 'fontfaceobserver';
import handlePlayer from './handlePlayer';
import handleplayerIsHiding from './handleplayerIsHiding';
import setupCursors from './setupCursors';
import setupWASD from './setupWASD.js';
import background from './assets/bg1.png';
import bonusCoinImg from './assets/sprites/bonus-coin.png';
import fireballImg from './assets/fireball.png';
import createScoreText from './createScoreText';
import createLevelText from './createLevelText';
import createMovingPlatform from './createMovingPlatform';
import { GameObjects } from 'phaser';

const { canvasWidth, canvasHeight, playerVelocity, enemyPositions } = constants;

let 
  cursors: Phaser.Types.Input.Keyboard.CursorKeys,
  wasd: any,
  gameOver = { value: false },
  gameOverText: Phaser.GameObjects.Text,
  coinsToWin: number = 2,
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
  level = 8,
  levelText: Phaser.GameObjects.Text,
  movingPlatforms: Phaser.Physics.Arcade.Sprite[] = [],
  singleCoin: Phaser.Physics.Arcade.Sprite,
  timeout: number,
  finalCoinDropped = { value: false },
  stationaryPlatform: Phaser.Physics.Arcade.Sprite;

function preload (this: Phaser.Scene) {
  this.cameras.main.setBackgroundColor('#6bb6ff');
  this.load.image('background', background);
  this.load.spritesheet('enemy',  enemy,  { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('enemy2', enemy2, { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('bonusCoin', bonusCoinImg, { frameWidth: 20, frameHeight: 23 });
  this.load.image('fireball', fireballImg);
  movingPlatforms = [];
};


function handleMovingPlatforms({ yVelocity = 300 }: {yVelocity: number}) {
  movingPlatforms.forEach((platform: Phaser.Physics.Arcade.Sprite) => {
    if (platform.body instanceof Phaser.Physics.Arcade.Body && platform.body.blocked.down) {
      platform.setVelocityY(-yVelocity)
    }
    if (platform.body instanceof Phaser.Physics.Arcade.Body && platform.body.blocked.up) {
      platform.setVelocityY(yVelocity);
    }
  });
}

function create(this: Phaser.Scene) {
  this.cameras.main.fadeIn(1000);
  this.add.image(400, 400, 'background').setScale(.55, .75);
  gameOver.value = false;
  winner = false;
  
  let font = new FontFaceObserver('Planes_ValMore');
  scoreText = createScoreText({ _this: this, coinsToWin });
  levelText = createLevelText({ _this: this, level });
  gameOverText = createGameOverText(this);

  // set up the cursors
  cursors = setupCursors(this) as Phaser.Types.Input.Keyboard.CursorKeys;
  wasd = setupWASD(this);

  // player
  player = createPlayer(this, 'pinky', 10, canvasHeight/2);

  // moving platforms
  // movingPlatforms.push(createMovingPlatform({_this: this, player, xPosition: 400, yPosition: 500, scaleX: .25, scaleY: 1}));
  // movingPlatforms.push(createMovingPlatform({_this: this, player, xPosition: 300, yPosition: 400, scaleX: .10, scaleY: 1}));
  movingPlatforms.push(createMovingPlatform({
    _this: this, 
    player,
    xPosition: canvasWidth / 2,
    yPosition: canvasHeight - 30,
    direction: 'both',
    scaleX: .075,
    xSpeed: -50,
    ySpeed: 100,
  }));
  movingPlatforms.push(createMovingPlatform({
    _this: this,
    player,
    xPosition: canvasWidth - 50,
    yPosition: 50,
    scaleX: .075,
    direction: 'vertical',
    xSpeed: 375,
  }));

  stationaryPlatform = createMovingPlatform({
    _this: this,
    player,
    xPosition: 0,
    yPosition: canvasHeight,
    scaleX: .1,
    scaleY: 1,
    // because speed is 0, this is not moving
    xSpeed: 0,
    ySpeed: 0,
  });

  singleCoin = createSingleCoin({
    _this: this,
    coinsToWin: coinsToWin,
    platforms: platforms,
    player: player,
    score: score,
    scoreText: scoreText,
    xPosition: canvasWidth - 50,
    yPosition: 0,
    coinGravity: 1000,
  });

  this.physics.add.collider(singleCoin, movingPlatforms[1]);
    
  // reset button
  createResetButton({ _this: this, score, playerHasInvincibility, playerHasFireballs, finalCoinDropped });
  
  // success text
  successText = createSuccessText(this);
};

const update = function update(this: Phaser.Scene) {
  if (player.y + player.height > canvasHeight) {
    gameOver.value = true;
    player.destroy();
    gameOver.value = true;
  }
  if (gameOver.value) {
    gameOverText.setVisible(true);
    successText.setVisible(false);
    clearTimeout(timeout);
    // return;
  }
  if (score.value === coinsToWin) {
    winner = true;
  }
  if (winner) {
    successText.setVisible(true);
    gameOverText.setVisible(false);
    winner = false;
    score.value = 0;
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
  handleMovingPlatforms({ yVelocity: 200 });
  if (score.value === 1 && !finalCoinDropped.value) {
    const singleCoin = createSingleCoin({
      _this: this,
      coinsToWin: coinsToWin,
      platforms: platforms,
      player: player,
      score: score,
      scoreText: scoreText,
      xPosition: 10,
      yPosition: 0,
    });
    this.physics.add.collider(stationaryPlatform, singleCoin);
    finalCoinDropped.value = true;
  }
};

export default {
  key: `level${level}`,
  preload,
  create,
  update,
};