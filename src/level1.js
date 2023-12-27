import constants from './constants.js';
import enemy from './assets/sprites/enemy.png';
import enemy2 from './assets/sprites/enemy2.png';
import background2 from './assets/bg1.png';
import FontFaceObserver from 'fontfaceobserver';
import setupCursors from './setupCursors.js';
import createPlayer from './createPlayer.js';
import handlePlayer from './handlePlayer.js';
import createEnemies from './createEnemies.js';
import { createCoins, createSingleCoin } from './createCoins.js';
import createResetButton from './createResetButton.js';
import createOverlapPlayerEnemies from './createOverlapPlayerEnemies.js';
import handleplayerIsHiding from './handleplayerIsHiding.js';
import createGameOverText from './createGameOverText.js';
import createSuccessText from './createSuccessText.js';
import handleEnemies from './handleEnemies.js';

const { canvasWidth, canvasHeight, gravity, playerVelocity, enemyPositions } = constants;

let player,
    playerIsHiding = { value: false, cursorIsDown: false },
    trees,
    colliderPlayerPlatform,
    enemies,
    platforms,
    cursors,
    initialNumberOfCoins = 6,
    coinsToWin =  initialNumberOfCoins + 2,
    score = { value: 0 },
    scoreText,
    gameOver = { value: false },
    gameOverText,
    successText,
    winner = false,
    levelText,
    level = 1;

function preload () {
  this.load.image('background2', background2);
  this.cameras.main.setBackgroundColor('#6bb6ff');
  this.load.spritesheet('enemy', enemy, { frameWidth: 32, frameHeight: 32 });
};

// platforms
function createPlatforms(_this) {
  platforms = _this.physics.add.staticGroup();
  platforms.create(400, 600, 'ground').setScale(2).refreshBody();
  platforms.create(100, 400, 'ground');
  platforms.create( 50, 250, 'ground');
  platforms.create(600, 475, 'ground');
  platforms.create(500, 200, 'ground');
  platforms.create(300, 100, 'ground');
  return platforms;
}

function create() {
  gameOver.value = false;
  winner = false;
  
  this.add.image(400, 400, 'background2').setScale(.55, .75);
    
  let font = new FontFaceObserver('Planes_ValMore');
  scoreText = this.add.text(16, 16, `Score: 0 / ${coinsToWin}`, { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  levelText = this.add.text(16, 40, `Level: ${level}`, { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });

  font.load().then(() => {
    // game over text
    gameOverText = createGameOverText(this);
    scoreText.setFont({ fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
    levelText.setFont({ fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
    // score
  }).catch((error) => {
    console.error(error);
  });

  // reset button
  createResetButton({ _this: this, score });

  // success text
  successText = createSuccessText(this);

  // set up the cursors
  cursors = setupCursors(this);

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
    xposition: canvasWidth - 10,
    yPosition: canvasHeight - 40,
    coinsToWin,
  });

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

function update() {
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