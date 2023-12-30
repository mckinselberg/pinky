import constants from './constants';
import enemy from './assets/sprites/enemy.png';
import enemy2 from './assets/sprites/enemy2.png';
// import FontFaceObserver from 'fontfaceobserver';
import setupCursors from './setupCursors';
import createPlayer from './createPlayer';
import handlePlayer from './handlePlayer';
import createEnemies from './createEnemies';
import { createSingleCoin, createBonusCoin } from './createCoins';
import createResetButton from './createResetButton';
import createOverlapPlayerEnemies from './createOverlapPlayerEnemies';
import createGameOverText from './createGameOverText';
import createSuccessText from './createSuccessText';
import handleEnemies from './handleEnemies';
import background3 from './assets/bg3.png';
import bonusCoinImg from './assets/sprites/bonus-coin.png';
import createScoreText from './createScoreText';
import createLevelText from './createLevelText';

const { canvasWidth, canvasHeight, gravity, playerVelocity, enemyPositions } = constants;

let player: Phaser.Physics.Arcade.Sprite,
    playerIsHiding = { value: false },
    playerHasInvincibility = { 
      value: false,
      powerUpActive: false,
      powerUpMessage: '🔽 hide from blue guys.'
    },
    trees: Phaser.GameObjects.Group,
    colliderPlayerPlatform: Phaser.Physics.Arcade.Collider,
    enemies: Phaser.GameObjects.Group,
    enemies2: Phaser.GameObjects.Group,
    platforms: Phaser.GameObjects.Group,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    score = { value: 0 },
    initialNumberOfCoins = 3,
    coinsToWin = initialNumberOfCoins + 1,
    winner: boolean = false,
    scoreText: Phaser.GameObjects.Text,
    gameOver = { value: false },
    gameOverText: Phaser.GameObjects.Text,
    successText: Phaser.GameObjects.Text,
    levelText: Phaser.GameObjects.Text,
    enemyVelocity = 200,
    bonusCoin: Phaser.GameObjects.Sprite,
    level = 4;

function preload (this: Phaser.Scene) {
  this.cameras.main.setBackgroundColor('#6bb6ff');
  this.load.image('background3', background3);
  this.load.spritesheet('enemy', enemy, { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('enemy2', enemy2, { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet('bonusCoin', bonusCoinImg, { frameWidth: 20, frameHeight: 23 });
};

// platforms
function createPlatforms(_this: Phaser.Scene) {
  platforms = _this.physics.add.staticGroup();
  for (let i = 2; i < 6; i++) {
    platforms.create(canvasWidth + (i * 15), 60 * i + 20, 'ground').setScale(.5*i,1).refreshBody();
  }
  return platforms;
}

// trees
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
  this.add.image(400, 400, 'background3').setScale(.75);;
  gameOver.value = false;
  winner = false;

  // set up the cursors
  cursors = setupCursors(this) as Phaser.Types.Input.Keyboard.CursorKeys;
  
  // place the platforms
  platforms = createPlatforms(this);

  // scoreText = this.add.text(16, 16, `Score: 0 / ${coinsToWin}`, { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  // levelText = this.add.text(16, 40, `Level: ${level}`, { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  scoreText = createScoreText({ _this: this, coinsToWin });
  levelText = createLevelText({ _this: this, level });
  gameOverText = createGameOverText(this);
  
  // let font = new FontFaceObserver('Planes_ValMore');
  // font.load().then(() => {
    // game over text
    // scoreText.setFont({ fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
    // levelText.setFont({ fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
    // score
  // }).catch((error) => {
  //   console.error(error);
  // });
  
  // create enemies
  enemies = createEnemies({
    _this: this,
    enemySprite: 'enemy',
    gravity: gravity,
    platforms: platforms,
    position: enemyPositions.LEFT,
    removeNthEnemies: [3],
    enemyVelocity,
  });
  enemies2 = createEnemies({
    _this: this,
    enemySprite: 'enemy2',
    gravity: gravity,
    platforms: platforms,
    position: enemyPositions.RIGHT,
    removeNthEnemies: [3],
    enemyVelocity,
  });
  
  // trees
  trees = createTrees(this);
  
  // player
  player = createPlayer(this, 'pinky', canvasWidth/2, 10);
  colliderPlayerPlatform = this.physics.add.collider(player, platforms);

  for (let i = 0; i < initialNumberOfCoins; i++) {
    i !== 3 && createSingleCoin({
      _this: this,
      platforms: platforms,
      player: player,
      score: score,
      scoreText: scoreText,
      xPosition: (canvasWidth - i * 12) - 60,
      yPosition: 60 * i + 65,
      coinsToWin: coinsToWin,
    });
  }
  bonusCoin = createBonusCoin({
    _this: this,
    coinsToWin: coinsToWin,
    platforms: platforms,
    powerUp: playerHasInvincibility,
    player: player,
    score: score,
    scoreText: scoreText,
    xPosition: canvasWidth - 100,
    yPosition: 60 * 3 + 65,
  });

  // player overlap with enemy
  createOverlapPlayerEnemies(this, player, enemies,  colliderPlayerPlatform, playerIsHiding, gameOver, winner, playerHasInvincibility);
  createOverlapPlayerEnemies(this, player, enemies2, colliderPlayerPlatform, playerIsHiding, gameOver, winner, { value: false });

  // reset button
  createResetButton({ _this: this, score, playerHasInvincibility });
  
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

  handlePlayer({_this: this, cursors, player, velocity: playerVelocity, playerHasInvincibility});
  handleEnemies(this, enemies, 'enemy', enemyVelocity);
  handleEnemies(this, enemies2, 'enemy2', enemyVelocity);
};

export default {
  key: `level${level}`,
  preload,
  create,
  update,
};