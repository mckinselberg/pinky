import constants from './constants';
import enemy from './assets/sprites/enemy.png';
import enemy2 from './assets/sprites/enemy2.png';
import background2 from './assets/bg1.png';
import FontFaceObserver from 'fontfaceobserver';
import setupCursors from './setupCursors';
import createPlayer from './createPlayer';
import handlePlayer from './handlePlayer';
import createEnemies from './createEnemies';
import { createCoins, createSingleCoin } from './createCoins';
import createResetButton from './createResetButton';
import createOverlapPlayerEnemies from './createOverlapPlayerEnemies';
import handleplayerIsHiding from './handleplayerIsHiding';
import createGameOverText from './createGameOverText';
import createSuccessText from './createSuccessText';
import createScoreText from './createScoreText';
import createLevelText from './createLevelText';
import handleEnemies from './handleEnemies';

const { canvasWidth, canvasHeight, gravity, playerVelocity, enemyPositions } = constants;

let player: Phaser.Physics.Arcade.Sprite,
    playerIsHiding = { value: false, cursorIsDown: false },
    trees: Phaser.Physics.Arcade.StaticGroup,
    colliderPlayerPlatform,
    enemies: Phaser.Physics.Arcade.Group,
    platforms: Phaser.Physics.Arcade.StaticGroup,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    initialNumberOfCoins = 6,
    coinsToWin =  initialNumberOfCoins + 2,
    score = { value: 0 },
    scoreText: Phaser.GameObjects.Text,
    gameOver = { value: false },
    gameOverText: Phaser.GameObjects.Text,
    successText: Phaser.GameObjects.Text,
    winner = false,
    levelText: Phaser.GameObjects.Text,
    level = 1;

function preload (this: Phaser.Scene) {
  this.load.image('background2', background2);
  this.cameras.main.setBackgroundColor('#6bb6ff');
  this.load.spritesheet('enemy', enemy, { frameWidth: 32, frameHeight: 32 });
};

// platforms
function createPlatforms(_this: Phaser.Scene) {
  platforms = _this.physics.add.staticGroup();
  platforms.create(400, 600, 'ground').setScale(2).refreshBody();
  platforms.create(100, 400, 'ground');
  platforms.create( 50, 250, 'ground');
  platforms.create(600, 475, 'ground');
  platforms.create(500, 200, 'ground');
  platforms.create(300, 100, 'ground');
  return platforms;
}

function create(this: Phaser.Scene) {
  gameOver.value = false;
  winner = false;
  
  this.add.image(400, 400, 'background2').setScale(.55, .75);

  gameOverText = createGameOverText(this);
  scoreText = createScoreText({ _this: this, coinsToWin });
  levelText = createLevelText({ _this: this, level });

  // reset button
  createResetButton({ _this: this, score });

  // success text
  successText = createSuccessText(this);

  // set up the cursors
  cursors = setupCursors(this) as Phaser.Types.Input.Keyboard.CursorKeys;

  // place the platforms
  platforms = createPlatforms(this);

  // player
  player = createPlayer(this, 'pinky', canvasWidth/2, 450);

  // coins
  createCoins({
    _this: this,
    platforms,
    player,
    numberOfCoins: initialNumberOfCoins,
    score,
    scoreText,
    yPosition: 0,
    coinsToWin,
  });
  createCoins({
    _this: this,
    platforms: platforms,
    player: player,
    numberOfCoins: 1,
    score,
    scoreText,
    xPosition: 600,
    yPosition: 260,
    coinsToWin,
  })
  createSingleCoin({
    _this: this,
    platforms: platforms,
    player: player,
    score,
    scoreText,
    xPosition: canvasWidth - 10,
    yPosition: canvasHeight - 40,
    coinsToWin,
  });

  // place the trees
  trees = this.physics.add.staticGroup();
  trees.create(200, 60, 'tree')
  trees.create(600, 435, 'tree');
  trees.create(400, 160, 'tree');

  this.physics.add.collider(trees, platforms);

  // create enemies
  enemies = createEnemies({
    _this: this,
    platforms: platforms,
    gravity: gravity,
    removeNthEnemies: [0],
    enemyVelocity: 100,
    enemySprite: 'enemy',
    position: enemyPositions.RANDOM,
  });
  colliderPlayerPlatform = this.physics.add.collider(player, platforms);

  // player overlap with enemy
  createOverlapPlayerEnemies(this, player, enemies, colliderPlayerPlatform, playerIsHiding, gameOver, winner);

};

function update(this: Phaser.Scene) {
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
      this.scene.stop(`level${level}`);
      this.scene.start(`level${level + 1}`);
    }, 2000);
    enemies.clear(true, true);
    return;
  }

  handlePlayer({_this: this, cursors, player, velocity: playerVelocity});
  handleplayerIsHiding(this, player, trees, playerIsHiding);
  handleEnemies(this, enemies, undefined, playerVelocity - 30);
};

export default {
  key: `level${level}`,
  preload,
  create,
  update,
};