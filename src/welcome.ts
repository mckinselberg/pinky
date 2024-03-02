import pinky from './assets/sprites/pinky-sm.png';
import ground from './assets/platform.png';
import tree from './assets/tree.png';
import coin from './assets/coin.png';
import background from './assets/bg2.png';
import jumpMp3 from './assets/sounds/jump.mp3';
import coinCollectMp3 from './assets/sounds/coin-collect.mp3';
import deathMp3 from './assets/sounds/glitch-bass-101008.mp3';
import * as FontFaceObserver from 'fontfaceobserver';
import constants from './constants';
import createPlayer from './createPlayer';
import handlePlayer from './handlePlayer';
import setupCursors from './setupCursors';
import setupWASD from './setupWASD.js';
import createCoins from './createCoins';
import createPlayerAnimations from './createPlayerAnimations';
import createScoreText from './createScoreText';

const { canvasWidth, canvasHeight, playerVelocity, colors } = constants;

let welcomeText,
    platforms: Phaser.GameObjects.Group,
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    initialNumberOfCoins = 1,
    coinsToWin = initialNumberOfCoins,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null,
    wasd: any,
    score = { value: 0 },
    scoreText: Phaser.GameObjects.Text,
    winner = false;

function preload(this: Phaser.Scene) {
  this.cameras.main.setBackgroundColor('#000'); 
  this.load.image('background', background);
  this.load.image('ground', ground);
  this.load.image('tree', tree);
  this.load.spritesheet('pinky', pinky, { frameWidth: 32, frameHeight: 32 });
  this.load.image('coin', coin);
  this.load.audio('jump', [jumpMp3]);
  this.load.audio('coin-collect', [coinCollectMp3]);
  this.load.audio('death', [deathMp3]);
}

function createWelcomeText(_this: Phaser.Scene) {
  welcomeText = _this.add.text(400, 100, 'Pinky', { fontSize: '50px', fontFamily: 'Planes_ValMore' });
  welcomeText.setColor(colors.PINK);
  welcomeText.setOrigin(0.5);
  welcomeText.setVisible(true);
}

function create(this: Phaser.Scene) {
  this.cameras.main.fadeIn(500);
  this.add.image(400, 400, 'background').setScale(.75);

  // welcomeText = createWelcomeText(this);
  
  let font = new FontFaceObserver('Planes_ValMore');
  scoreText = createScoreText({ _this: this, coinsToWin });
  font.load().then(() => {
    welcomeText = createWelcomeText(this);
    scoreText.setFontFamily('Planes_Valmore');
  }).catch((e) => {
    // console.error(e);
  });
  
  this.physics.world.setBounds(0, 0, canvasWidth, canvasHeight);
  this.add.image(200, canvasHeight - 15, 'ground');
  this.add.image(600, canvasHeight - 15, 'ground');

  
  // cursors
  cursors = setupCursors(this);
  wasd = setupWASD(this);
  
  // player
  player = createPlayer(this, 'pinky', 100, 450);
  createPlayerAnimations({_this: this, playerName: 'pinky'});

  // coins
  createCoins({
    _this: this,
    platforms: platforms as Phaser.Physics.Arcade.StaticGroup,
    player: player as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, 
    numberOfCoins: initialNumberOfCoins,
    score,
    scoreText,
    xPosition: canvasWidth / 2,
    yPosition: 0,
    coinsToWin,
  });
  
  this.add.image(400, canvasHeight, 'tree');
}

function update(this: Phaser.Scene) {
  handlePlayer({
    _this: this,
    cursors: cursors!,
    wasd: wasd,
    player,
    velocity: playerVelocity,
  });
  if (score.value === coinsToWin) {
    winner = true;
  }
  if (winner) {
    winner = false;
    score.value = 0;
    this.cameras.main.fadeOut(1000);
    setTimeout(() => {
      this.scene.stop('welcome');
      this.scene.start('level1');
    }, 2000);
  }
  // this.scene.start('level10');
}


export default {
  key: 'welcome',
  preload,
  create,
  update,
};