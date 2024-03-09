import background3 from './assets/bg3.png';
import constants from './constants';
import createPlayer from './createPlayer';
import enemy from './assets/sprites/enemy.png';
import FontFaceObserver from 'fontfaceobserver';
import handlePlayer from './handlePlayer';
import createEnemies from './createEnemies';
import { createCoins, createSingleCoin } from './createCoins';
import createGameOverText from './createGameOverText';
import createResetButton from './createResetButton';
import createOverlapPlayerEnemies from './createOverlapPlayerEnemies';
import createSuccessText from './createSuccessText';
import handleEnemies from './handleEnemies';
import handleplayerIsHiding from './handleplayerIsHiding';
import setupCursors from './setupCursors';
import setupWASD from './setupWASD.js';
import createScoreText from './createScoreText';
import createLevelText from './createLevelText';

const { canvasWidth, canvasHeight, gravity, playerVelocity, enemyPositions } = constants;

let 
colliderPlayerPlatform: Phaser.Physics.Arcade.Collider,
cursors: Phaser.Types.Input.Keyboard.CursorKeys,
wasd: any,
enemies: Phaser.GameObjects.Group,
initialNumberOfCoins: number = 24,
coinsToWin: number = initialNumberOfCoins + 3,
gameOver = { value: false },
gameOverText: Phaser.GameObjects.Text,
player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
platforms: Phaser.Physics.Arcade.StaticGroup,
playerIsHiding = { value: false },
score = { value: 0 },
scoreText: Phaser.GameObjects.Text,
successText: Phaser.GameObjects.Text,
trees: Phaser.Physics.Arcade.StaticGroup,
winner: boolean = false,
levelText: Phaser.GameObjects.Text,
level = 2;

function preload (this: Phaser.Scene) {
  this.cameras.main.setBackgroundColor('#000');
  this.load.image('background3', background3);
  this.cameras.main.setBackgroundColor('#6bb6ff');
};

function createPlatforms(_this: Phaser.Scene) {
  // platforms
  platforms = _this.physics.add.staticGroup();
  platforms.create(250, canvasHeight-20, 'ground');
  platforms.create(canvasWidth-10, 548, 'ground');
  platforms.create(260, canvasHeight-150, 'ground');
  platforms.create(20, canvasHeight/2, 'ground');
  platforms.create(canvasWidth/2 + 100, 200, 'ground');
  return platforms
}

function createTrees(_this: Phaser.Scene, platforms: Phaser.GameObjects.Group) {
  const trees = _this.physics.add.staticGroup();
  trees.create(canvasWidth - 150, canvasHeight - 90, 'tree');
  trees.create(canvasWidth - 20, canvasHeight - 90, 'tree');
  trees.create(200, canvasHeight/2 - 40, 'tree');
  _this.physics.add.collider(trees, platforms);
  return trees;
}

function create(this: Phaser.Scene) {
  this.cameras.main.fadeIn(1000);
  this.add.image(400, 400, 'background3').setScale(.75);;
  gameOver.value = false;
  winner = false;
  
  let font = new FontFaceObserver('Planes_ValMore');

  scoreText = createScoreText({ _this: this, coinsToWin });
  levelText = createLevelText({ _this: this, level });
  successText = createSuccessText(this, level);
  gameOverText = createGameOverText(this);

  // reset button
  createResetButton({ _this: this, score });

  // set up the cursors
  cursors = setupCursors(this) as Phaser.Types.Input.Keyboard.CursorKeys;
  wasd = setupWASD(this);

  // place the platforms
  platforms = createPlatforms(this);

  // player
  player = createPlayer(this, 'pinky', canvasWidth/2 - 200, 450);
  createCoins({
    _this: this,
    platforms: platforms,
    player: player,
    numberOfCoins: initialNumberOfCoins,
    score: score,
    scoreText: scoreText,
    yPosition: 0,
    coinsToWin: coinsToWin,
  });
  createCoins({
    _this: this,
    platforms: platforms,
    player: player,
    numberOfCoins: 3,
    score: score,
    scoreText: scoreText,
    xPosition: canvasWidth / 2,
    yPosition: canvasHeight - 100,
    coinsToWin: coinsToWin,
  });
  
  // place the trees
  trees = createTrees(this, platforms);

  // player collides with platforms
  colliderPlayerPlatform = this.physics.add.collider(player, platforms);
  
  // create enemies
  enemies = createEnemies({
    _this: this,
    enemySprite: 'enemy',
    enemyVelocity: 100,
    gravity: gravity,
    platforms: platforms,
    position: enemyPositions.RANDOM,
    removeNthEnemies: [0],
  })
  
  // player overlap with enemy
  createOverlapPlayerEnemies(this, player, enemies, colliderPlayerPlatform, playerIsHiding, gameOver, winner);  
};

const update = function update(this: Phaser.Scene) {
  if (player.y + player.height > canvasHeight) {
    gameOver.value = true;
    // player.body && this.sound.play('wilhelm', { volume: 0.5 });
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
    this.cameras.main.fadeOut(1000);
    setTimeout(() => {
      this.scene.stop(`level${level}`);
      this.scene.start(`level${level + 1}`);
    }, 2000);
    enemies.clear(true, true);
    return;
  }

  handlePlayer({_this: this, cursors, wasd, player, velocity: playerVelocity});
  handleplayerIsHiding(this, player, trees, playerIsHiding);
  handleEnemies(this, enemies, undefined, playerVelocity - 50);
};

export default {
  key: `level${level}`,
  preload,
  create,
  update,
};
