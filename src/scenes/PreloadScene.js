import Phaser from 'phaser';
import { preloadAllAudio } from '../core/SoundRegistry.js';
import { preloadCharacterSprites, preloadEnemySprites, preloadBossSprites, createAllAnimations } from '../systems/SpriteAnimations.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const cam = this.cameras.main;
    this.add.rectangle(cam.width / 2, cam.height / 2, 300, 18, 0x333333);
    const bar = this.add.rectangle(cam.width / 2 - 148, cam.height / 2, 4, 14, 0x3ddc84).setOrigin(0, 0.5);
    this.add.text(cam.width / 2, cam.height / 2 - 30, 'Loading...', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
    this.load.on('progress', (v) => {
      bar.width = 296 * v;
    });
    preloadAllAudio(this);
    preloadCharacterSprites(this);
    preloadEnemySprites(this);
    preloadBossSprites(this);
  }

  create() {
    createAllAnimations(this);
    this.scene.start('Dashboard');
  }
}
