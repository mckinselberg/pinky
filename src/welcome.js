import pinky from './assets/sprites/pinky-sm.png';
import FontFaceObserver from 'fontfaceobserver';
import constants from './constants';
import ground from './assets/platform.png';
import tree from './assets/tree.png';
import coin from './assets/coin.png';
import createPlayer from './createPlayer.js';
import handlePlayer from './handlePlayer.js';
import setupCursors from './setupCursors.js';
import setupWASD from './setupWASD.js';
import createCoins from './createCoins.js';
// import createResetButton from './createResetButton.js';
import background from './assets/bg2.png';
import jumpMp3 from './assets/sounds/jump.mp3';
import coinCollectMp3 from './assets/sounds/coin-collect.mp3';
import deathMp3 from './assets/sounds/glitch-bass-101008.mp3';
import createPlayerAnimations from './createPlayerAnimations.js';
import createBonusCoinBlinkAnimation from './createBonusCoinBlinkAnimation.js';

const { canvasWidth, canvasHeight, playerVelocity } = constants;

let welcomeText,
    platforms,
    player,
    initialNumberOfCoins = 1,
    coinsToWin = initialNumberOfCoins,
    cursors,
    wasd,
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
  this.load.audio('jump', [jumpMp3]);
  this.load.audio('coin-collect', [coinCollectMp3]);
  this.load.audio('death', [deathMp3]);
}

function createWelcomeText() {
  welcomeText = this.add.text(400, 100, 'Pinky', { fontSize: '50px', fill: '#ff859a', fontFamily: 'Planes_ValMore' });
  welcomeText.setOrigin(0.5);
  welcomeText.setVisible(true);
}

function create() {
  this.add.image(400, 400, 'background').setScale(.75);

  let font = new FontFaceObserver('Planes_ValMore');
  font.load().then(() => {
    createWelcomeText.call(this);
    // createResetButton(this, score);
    scoreText.setFont({ fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
    scoreText.setVisible(false);
  }).catch(() => {
    welcomeText.setVisible(false);
  });
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '25px', fill: '#000', fontFamily: 'Planes_ValMore' });
  
  this.physics.world.setBounds(0, 0, canvasWidth, canvasHeight);
  this.add.image(200, canvasHeight - 15, 'ground');
  this.add.image(600, canvasHeight - 15, 'ground');

  
  // cursors
  cursors = setupCursors(this);
  // wasd = setupWASD(this);
  
  // player
  player = createPlayer(this, 'pinky');
  createPlayerAnimations({_this: this, playerName: 'pinky'});

  // coins
  createCoins({
    _this: this,
    platforms,
    player,
    numberOfCoins: initialNumberOfCoins,
    score,
    scoreText,
    xPosition: canvasWidth / 2,
    yPosition: 0,
  });
  
  this.add.image(400, canvasHeight, 'tree');
}

function update() {
  handlePlayer({
    _this: this,
    cursors,
    player,
    velocity: playerVelocity,
  });
  if (score.value === coinsToWin) {
    winner = true;
  }
  if (winner) {
    winner = false;
    score.value = 0;
    setTimeout(() => {
      this.scene.stop('welcome');
      this.scene.start('level1');
    }, 2000);
  }
  this.scene.start('level5');
}


export default {
  key: 'welcome',
  preload,
  create,
  update,
};