import Phaser from 'phaser';
import GameState from '../core/GameState.js';
import { DIFFICULTY } from '../data/difficultyConfig.js';
import { DIFFICULTY_IDS } from '../core/constants.js';
import { createButton } from '../ui/Button.js';

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super('Settings');
  }

  create() {
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.add.rectangle(cx, cy, 840, 640, 0x14141c, 0.97).setStrokeStyle(4, 0x4dd0e1, 0.8);
    this.add.text(cx, cy - 260, '설정', { fontSize: '52px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    this.add
      .text(cx, cy - 192, '난이도를 선택하세요', { fontSize: '28px', fontFamily: 'sans-serif', color: '#9aa0a6' })
      .setOrigin(0.5);

    this.diffButtons = {};
    const ids = [DIFFICULTY_IDS.HIGH, DIFFICULTY_IDS.MEDIUM, DIFFICULTY_IDS.LOW];
    ids.forEach((id, i) => {
      const d = DIFFICULTY[id];
      const y = cy - 100 + i * 120;
      const btn = createButton(
        this,
        cx,
        y,
        640,
        100,
        this._labelFor(d),
        () => this._selectDifficulty(id),
        { bg: id === GameState.difficulty ? 0x2b5a3a : 0x2a2a35, border: id === GameState.difficulty ? 0x3ddc84 : 0x555555, fontSize: '28px' }
      );
      this.diffButtons[id] = btn;
    });

    createButton(this, cx, cy + 280, 360, 88, '닫기', () => this._close(), { bg: 0x2a2a35, border: 0xffe14b, fontSize: '28px' });
  }

  _labelFor(d) {
    return `${d.label}  (목숨 ${d.baseLives}, 이어하기 ${d.continues}회)`;
  }

  _selectDifficulty(id) {
    GameState.difficulty = id;
    for (const [key, btn] of Object.entries(this.diffButtons)) {
      btn.bg.setFillStyle(key === id ? 0x2b5a3a : 0x2a2a35);
      btn.bg.setStrokeStyle(4, key === id ? 0x3ddc84 : 0x555555, 0.85);
    }
  }

  _close() {
    this.scene.stop();
    this.scene.resume('Dashboard');
  }
}
