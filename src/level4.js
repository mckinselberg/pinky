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

const { canvasWidth, canvasHeight, gravity, playerVelocity } = constants;

let player,
    playerIsHiding = { value: false },
    playerIsInvincible = { 
      value: false,
      powerUpActive: false,
      powerUpMessage: '🔽 hide from blue guys.'
    },
    trees,
    colliderPlayerPlatform,
    enemies,
    enemies2,
    platforms,
    cursors,
    score = { value: 0 },
    initialNumberOfCoins = 3,
    coinsToWin = initialNumberOfCoins + 1,
    winner = false,
    scoreText,
    gameOver = { value: false },
    gameOverText,
    successText,
    levelText,
    enemyVelocity = 200,
    bonusCoin,
    level = 4;

function preload () {
  this.cameras.main.setBackgroundColor('#6bb6ff');
  this.load.image('background3', background3);
  this.load.spritesheet('enemy', enemy, { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('enemy2', enemy2, { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('bonusCoin', bonusCoinImg, { frameWidth: 20, frameHeight: 23 });
};

// platforms
function createPlatforms(_this) {
  platforms = _this.physics.add.staticGroup();
  for (let i = 2; i < 6; i++) {
    platforms.create(canvasWidth + (i * 15), 60 * i + 20, 'ground').setScale(.5*i,1).refreshBody();
  }
  return platforms;
}

// trees
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
  this.add.image(400, 400, 'background3').setScale(.75);;
  gameOver.value = false;
  winner = false;

  let font = new FontFaceObserver('Planes_ValMore');
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
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

  // set up the cursors
  cursors = setupCursors(this);
  
  // place the platforms
  platforms = createPlatforms(this);
  
  // create enemies
  enemies  = createEnemies(this, platforms, gravity, [3], enemyVelocity, 'enemy',  'left');
  enemies2 = createEnemies(this, platforms, gravity, [3], 100,           'enemy2', 'right');
  
  // trees
  trees = createTrees(this);
  
  // player
  player = createPlayer(this, 'pinky', canvasWidth/2, 10);
  colliderPlayerPlatform = this.physics.add.collider(player, platforms);

  for (let i = 0; i < initialNumberOfCoins; i++) {
    i !== 3 && createSingleCoin({_this: this, platforms: platforms, player: player, score: score, scoreText: scoreText, xPosition: (canvasWidth - i * 12) - 60, yPosition: 60 * i + 65});
  }
  bonusCoin = createBonusCoin(this, platforms, player, canvasWidth, 1, score, scoreText, canvasWidth - 100, 60 * 3 + 65, playerIsInvincible);
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
      this.scene.stop(`level${level}`);
      this.scene.start(`level${level + 1}`);
    }, 2000);
    enemies.clear(true, true);
    enemies2.clear(true, true);
    return;
  }



  handlePlayer(this, cursors, player, playerVelocity, { value: false }, playerIsInvincible);
  handleEnemies(this, enemies, 'enemy', enemyVelocity);
  handleEnemies(this, enemies2, 'enemy2', enemyVelocity);
};

export default {
  key: `level${level}`,
  preload,
  create,
  update,
};