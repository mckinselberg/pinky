import pinky from './assets/sprites/pinky-sm.png';
import FontFaceObserver from 'fontfaceobserver';
import constants from './constants';
import ground from './assets/platform.png';
import tree from './assets/tree.png';
import coin from './assets/coin.png';
import createPlayer from './createPlayer.js';
import handlePlayer from './handlePlayer.js';
import setupCursors from './setupCursors.js';
import createCoins from './createCoins.js';
import createResetButton from './createResetButton.js';
import background from './assets/bg2.png';

const { canvasWidth, canvasHeight, playerVelocity } = constants;

let welcomeText,
    platforms,
    player,
    initialNumberOfCoins = 1,
    coinsToWin = initialNumberOfCoins,
    cursors,
    score = { value: 0 },
    scoreText,
    winner = false;

function preload() {
  this.cameras.main.setBackgroundColor('#6bb6ff'); 
  this.load.image('background', background);
  this.load.image('ground', ground);
  this.load.image('tree', tree);
  this.load.spritesheet('pinky', pinky, { frameWidth: 32, frameHeight: 32 });
  this.load.image('coin', coin);
}

function createWelcomeText() {
  welcomeText = this.add.text(400, 300, 'Pinky', { fontSize: '50px', fill: '#000000', fontFamily: 'Planes_ValMore' });
  welcomeText.setOrigin(0.5);
  welcomeText.setVisible(true);
}

function create() {
  this.add.image(400, 400, 'background');
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  let font = new FontFaceObserver('Planes_ValMore');
  font.load().then(() => {
    createWelcomeText.call(this);
    createResetButton(this, score);
    scoreText.setFont({ fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  }).catch(() => {
    welcomeText.setVisible(false);
  });
  this.physics.world.setBounds(0, 0, canvasWidth, canvasHeight);
  this.add.image(200, canvasHeight - 15, 'ground');
  this.add.image(600, canvasHeight - 15, 'ground');
  cursors = setupCursors(this);
  // player
  player = createPlayer(this, 'pinky');
  // colliderPlayerPlatform = this.physics.add.collider(player, platforms);
  // createCoins(this, platforms, player, canvasWidth, 3, score, scoreText, canvasWidth / 6);
  createCoins(this, platforms, player, canvasWidth, initialNumberOfCoins, score, scoreText, canvasWidth / 2, 600);
  

  
  this.add.image(400, canvasHeight, 'tree');
}

function update() {
  handlePlayer(cursors, player, playerVelocity);
  if (score.value === coinsToWin) {
    winner = true;
  }
  if (winner) {
    winner = false;
    score.value = 0;
    this.scene.stop('welcome');
    this.scene.start('level1');
  }
  // this.scene.start('level2');
}

export default {
  key: 'welcome',
  preload,
  create,
  update,
};