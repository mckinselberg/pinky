import background3 from './assets/bg3.png';
import constants from './constants.js';
import createPlayer from './createPlayer.js';
import enemy from './assets/sprites/enemy.png';
import FontFaceObserver from 'fontfaceobserver';
import handlePlayer from './handlePlayer.js';
import createEnemies from './createEnemies.js';
import { createCoins, createSingleCoin } from './createCoins.js';
import createGameOverText from './createGameOverText.js';
import createResetButton from './createResetButton.js';
import createOverlapPlayerEnemies from './createOverlapPlayerEnemies.js';
import createSuccessText from './createSuccessText.js';
import handleEnemies from './handleEnemies.js';
import handleplayerIsHiding from './handleplayerIsHiding.js';
import setupCursors from './setupCursors.js';

const { canvasWidth, canvasHeight, gravity, playerVelocity, enemyPositions } = constants;

let 
colliderPlayerPlatform,
cursors,
enemies,
initialNumberOfCoins = 24,
coinsToWin = initialNumberOfCoins + 3,
gameOver = { value: false },
gameOverText,
player,
platforms,
playerIsHiding = { value: false },
score = { value: 0 },
scoreText,
successText,
trees,
winner = false,
levelText,
level = 2;

function preload () {
  this.load.image('background3', background3)
  this.cameras.main.setBackgroundColor('#6bb6ff');
  this.load.spritesheet(
    'enemy',
    enemy,
    { frameWidth: 32, frameHeight: 32 }
  );
};

function createPlatforms(_this) {
  // platforms
  platforms = _this.physics.add.staticGroup();
  platforms.create(250, canvasHeight-20, 'ground');
  platforms.create(canvasWidth-10, 548, 'ground');
  platforms.create(260, canvasHeight-150, 'ground');
  platforms.create(20, canvasHeight/2, 'ground');
  platforms.create(canvasWidth/2 + 100, 200, 'ground');
  // platforms.create( 50, 250, 'ground');
  // platforms.create(600, 475, 'ground');
  // platforms.create(500, 200, 'ground');
  // platforms.create(300, 100, 'ground');
  return platforms
}

function createTrees(_this, platforms) {
  const trees = _this.physics.add.staticGroup();
  trees.create(canvasWidth - 150, canvasHeight - 90, 'tree');
  trees.create(canvasWidth - 20, canvasHeight - 90, 'tree');
  trees.create(200, canvasHeight/2 - 40, 'tree')
  trees.children.iterate(function(tree, idx) {
    tree.body.setSize(50, 40);
    if (idx === 0) tree.setFlipX(true);
  })
  _this.physics.add.collider(trees, platforms);
  return trees;
}

function create() {
  this.add.image(400, 400, 'background3').setScale(.75);;
  gameOver.value = false;
  winner = false;
  
  
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


const update = function update() {
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
    setTimeout(() => {
      this.scene.stop(`level${level}`);
      this.scene.start(`level${level + 1}`);
    }, 2000);
    enemies.clear(true, true);
    return;
    
  }

  handlePlayer({_this: this, cursors, player, velocity: playerVelocity});
  handleplayerIsHiding(this, player, trees, playerIsHiding);
  handleEnemies(this, enemies, undefined, playerVelocity - 50);
};

export default {
  key: `level${level}`,
  preload,
  create,
  update,
};