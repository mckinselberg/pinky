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
import handleEnemies from './handleEnemies';
import setupCursors from './setupCursors';
import setupWASD from './setupWASD.js';
import background from './assets/bg1.png';
import bonusCoinImg from './assets/sprites/bonus-coin.png';
import fireballImg from './assets/fireball.png';
import createScoreText from './createScoreText';
import createLevelText from './createLevelText';
import tilemapImage from './assets/tilemaps/tilemap_packed.png';
import tilemapJson from './assets/tilemaps/tilemap1.json';
import createEnemies from './createEnemies';

const { canvasWidth, canvasHeight, playerVelocity, enemyPositions } = constants;

let 
  level = 10,
  winner = false,
  gameOver = { value: false },
  coinsToWin: number = 2,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys,
  wasd: any,
  gameOverText: Phaser.GameObjects.Text,
  // platforms: Phaser.Physics.Arcade.StaticGroup,
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
  levelText: Phaser.GameObjects.Text,
  movingPlatforms: Phaser.Physics.Arcade.Sprite[] = [],
  singleCoin: Phaser.Physics.Arcade.Sprite,
  timeout: number,
  finalCoinDropped = false,
  // stationaryPlatform: Phaser.Physics.Arcade.Sprite,
  ground: Phaser.Tilemaps.TilemapLayer | null,
  enemies: Phaser.GameObjects.Group,
  enemyCollisions:  Phaser.Tilemaps.TilemapLayer | null;

function preload (this: Phaser.Scene) {
  this.cameras.main.setBackgroundColor('#6bb6ff');
  this.load.image('background', background);
  this.load.spritesheet('enemy',  enemy,  { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('enemy2', enemy2, { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('bonusCoin', bonusCoinImg, { frameWidth: 20, frameHeight: 23 });
  this.load.image('fireball', fireballImg);

  // tilemap
  this.load.image('tiles', tilemapImage);
  this.load.tilemapTiledJSON('tilemap', tilemapJson);
  
};

function create(this: Phaser.Scene) {
  this.cameras.main.fadeIn(1000);
  console.log(this.cameras.systems)

  this.add.image(400, 400, 'background').setScale(.55, .75);
  
  const map = this.make.tilemap({key: 'tilemap'});
  const tileset = map.addTilesetImage('tilemap_packed', 'tiles');
  if (tileset) {
    ground = map.createLayer('ground', tileset, 0, 0);
    enemyCollisions = map.createLayer('enemyCollisions', tileset, 0, 0);
  } 
  if (ground) {
    ground.setCollisionBetween(18, 20);
    ground.setCollisionBetween(12, 16);
    ground.setCollisionBetween(153, 156);
  }
  if (enemyCollisions) enemyCollisions.setCollisionBetween(157, 158);


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
  player = createPlayer(this, 'pinky', 10, canvasHeight/4);
  ground && this.physics.add.collider(player, ground);

  singleCoin = createSingleCoin({
    _this: this,
    coinsToWin: coinsToWin,
    player: player,
    score: score,
    scoreText: scoreText,
    xPosition: canvasWidth - 100,
    yPosition: 0,
  });
  ground && this.physics.add.collider(singleCoin, ground);

  enemies = createEnemies({
    _this: this,
    enemySprite: 'enemy2',
    enemyVelocity: 200,
  })
  ground && this.physics.add.collider(enemies, ground);
  enemyCollisions && this.physics.add.collider(enemies, enemyCollisions);

    
  // reset button
  createResetButton({ _this: this, score, playerHasInvincibility, playerHasFireballs });
  
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
    score.value = 0;
    finalCoinDropped = false;
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
  handleMovingPlatforms({ yVelocity: 100, xVelocity: 100 });
  handleEnemies(this, enemies, 'enemy', 200);

  if (score.value === 1 && !finalCoinDropped) {
    const singleCoin2 = createSingleCoin({
      _this: this,
      coinsToWin: coinsToWin,
      player: player,
      score: score,
      scoreText: scoreText,
      xPosition: 10,
      yPosition: 0,
    });
    finalCoinDropped = true;
    ground && this.physics.add.collider(singleCoin2, ground);
  }
};

export default {
  key: `level${level}`,
  preload,
  create,
  update,
};