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
import createPlatform from './createPlatform';
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
  level = 9,
  levelText: Phaser.GameObjects.Text,
  movingPlatforms: Phaser.Physics.Arcade.Sprite[] = [],
  singleCoin: Phaser.Physics.Arcade.Sprite,
  timeout: number,
  finalCoinDropped = { value: false },
  stationaryPlatform1: Phaser.Physics.Arcade.Sprite,
  stationaryPlatform2: Phaser.Physics.Arcade.Sprite;

function preload (this: Phaser.Scene) {
  this.cameras.main.setBackgroundColor('#6bb6ff');
  this.load.image('background', background);
  this.load.spritesheet('enemy',  enemy,  { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('enemy2', enemy2, { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('bonusCoin', bonusCoinImg, { frameWidth: 20, frameHeight: 23 });
  this.load.image('fireball', fireballImg);
  movingPlatforms = [];
};

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
  player = createPlayer(this, 'pinky', canvasWidth - 100, canvasHeight/4);
  
  stationaryPlatform1 = createPlatform({
    _this: this,
    player,
    xPosition: 20,
    yPosition: canvasHeight - 140,
    scaleX: 0.1,
    scaleY: 1,
    moving: false,
  });

  stationaryPlatform2 = createPlatform({
    _this: this,
    player,
    xPosition: canvasWidth - 100,
    yPosition: canvasHeight - 100,
    scaleX: 0.1,
    scaleY: 1,
    moving: false,
  });

  movingPlatforms.push(createPlatform({
    _this: this, 
    player,
    xPosition: canvasWidth / 4,
    yPosition: 20,
    direction: 'vertical',
    scaleX: 0.5,
    xSpeed: 0,
    ySpeed: 100,
    moving: true,
  }));

  movingPlatforms.push(createPlatform({
    _this: this,
    player,
    xPosition: canvasWidth / 2,
    yPosition: canvasHeight - 30,
    direction: 'horizontal',
    scaleX: .25,
    xSpeed: 100,
    ySpeed: 0,
    moving: true,
  }));

  movingPlatforms.push(createPlatform({
    _this: this,
    player,
    xPosition: canvasWidth / 3 - 100,
    yPosition: canvasHeight - 30,
    direction: 'horizontal',
    scaleX: .25,
    xSpeed: 100,
    ySpeed: 0,
    moving: true,
  }));

  singleCoin = createSingleCoin({
    _this: this,
    coinsToWin: coinsToWin,
    platforms: platforms,
    player: player,
    score: score,
    scoreText: scoreText,
    xPosition: canvasWidth - 100,
    yPosition: 0,
    coinGravity: 1000,
  });

  this.physics.add.collider(singleCoin, stationaryPlatform2);
    
  // reset button
  createResetButton({ _this: this, score, playerHasInvincibility, playerHasFireballs, finalCoinDropped });
  
  // success text
  successText = createSuccessText(this);
};

function handleMovingPlatforms({ yVelocity = 0, xVelocity = 0 }: {yVelocity: number, xVelocity?: number}) {
  movingPlatforms.forEach((platform: Phaser.Physics.Arcade.Sprite, i) => {
    if ( ! (platform.body instanceof Phaser.Physics.Arcade.Body) )  return;
    if (i === 0 && platform.body.y > canvasHeight / 2)              platform.setVelocityY(-yVelocity);
    if (i === 0 && platform.body.y < 30)                            platform.setVelocityY(yVelocity);

    if (i === 1 && platform.body.x < canvasWidth / 2)               platform.setVelocityX(xVelocity);
    if (i === 1 && platform.body.x > canvasWidth - 300)             platform.setVelocityX(-xVelocity);

    if (i === 2 && platform.body.x < canvasWidth / 3 - 200)         platform.setVelocityX(xVelocity);
    if (i === 2 && platform.body.x > canvasWidth / 3 + 10)          platform.setVelocityX(-xVelocity);

    if (platform.body.blocked.down)                                 platform.setVelocityY(-yVelocity);
    if (platform.body.blocked.up)                                   platform.setVelocityY(yVelocity);
  });
}

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
    finalCoinDropped.value = false;
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
  handleMovingPlatforms({ yVelocity: 100, xVelocity: 100 });

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
    this.physics.add.collider(stationaryPlatform1, singleCoin);
    finalCoinDropped.value = true;
  }
};

export default {
  key: `level${level}`,
  preload,
  create,
  update,
};