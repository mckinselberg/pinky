import createEnemies from './createEnemies.js';
import createGameOverText from './createGameOverText.js';
import createOverlapPlayerEnemies from './createOverlapPlayerEnemies.js';
import createPlayer from './createPlayer.js';
import createResetButton from './createResetButton.js';
import { createSingleCoin } from './createCoins.js';
import createSuccessText from './createSuccessText.js';
import constants from './constants.js';
import enemy from './assets/sprites/enemy.png';
import FontFaceObserver from 'fontfaceobserver';
import handleEnemies from './handleEnemies.js';
import handlePlayer from './handlePlayer.js';
import handleplayerIsHiding from './handleplayerIsHiding.js';
import setupCursors from './setupCursors.js';
import background4 from './assets/bg4.png';

const { canvasWidth, canvasHeight, gravity, playerVelocity } = constants;

let 
coinsToWin = initialNumberOfCoins,
colliderPlayerPlatform,
cursors,
enemies,
gameOver = { value: false },
gameOverText,
initialNumberOfCoins = 8,
platforms,
player,
playerIsHiding = { value: false },
playerIsInvincible = { value: false },
score = { value: 0 },
scoreText,
successText,
trees,
winner = false;
    
function preload () {
  this.cameras.main.setBackgroundColor('#6bb6ff');
  this.load.image('background4', background4);
  this.load.spritesheet(
    'enemy',
    enemy,
    { frameWidth: 32, frameHeight: 32 }
  );
};

function createPlatforms(_this) {
  // platforms
  platforms = _this.physics.add.staticGroup();
  // for (let i = 0; i < 10; i++) {
  //   platforms.create(canvasWidth + (i * 15), 60 * i + 20, 'ground').setScale(.5*i,1).refreshBody();
  // }
  platforms.create(canvasWidth/2, canvasHeight - 10, 'ground').setScale(1.8,1).refreshBody();
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
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  
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
  enemies = createEnemies(this, platforms, gravity);
  
  // for (let i = 0; i < initialNumberOfCoins; i++) {
  //   createSingleCoin(this, platforms, player, canvasWidth, 1, score, scoreText, (canvasWidth - i * 12) - 60, 60 * i + 65);
  // }

  // player
  player = createPlayer(this, 'pinky', canvasWidth/2, 10);
  colliderPlayerPlatform = this.physics.add.collider(player, platforms);

  // trees
  // trees = createTrees(this);
  

  
  // player overlap with enemy
  createOverlapPlayerEnemies(this, player, enemies, colliderPlayerPlatform, playerIsHiding, gameOver, winner);

  // reset button
  createResetButton(this, score);
  
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
      this.scene.stop('level4');
    }, 2000);
    // enemies.clear(true, true);
    return;
  }

  handleplayerIsHiding(this, player, trees, playerIsHiding);
  handlePlayer(this, cursors, player, playerVelocity, playerIsHiding, playerIsInvincible);
  handleEnemies(this, enemies);
};

export default {
  key: 'level4',
  preload,
  create,
  update,
};