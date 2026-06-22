import './style.css';
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './core/constants.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import DashboardScene from './scenes/DashboardScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import { setupOrientationGuard } from './core/OrientationGuard.js';
import { setupAudioUnlock } from './core/AudioUnlock.js';

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0a0a0e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
  },
  input: {
    activePointers: 4, // 2인 동시 터치(이동+필살기) 지원
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [BootScene, PreloadScene, DashboardScene, SettingsScene, CharacterSelectScene, GameScene, UIScene, GameOverScene],
};

const game = new Phaser.Game(config);
setupOrientationGuard(game);
setupAudioUnlock(game);
