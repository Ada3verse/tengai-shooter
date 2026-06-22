import Phaser from 'phaser';
import GameState from '../core/GameState.js';
import { CHARACTER_LIST } from '../data/characterConfig.js';
import { GAME_MODES } from '../core/constants.js';
import { getCharacterIdleFrame } from '../systems/SpriteAnimations.js';
import { addMenuBackground } from '../ui/MenuBackground.js';

export default class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelect');
  }

  create() {
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    addMenuBackground(this);
    this.requiredPicks = GameState.mode === GAME_MODES.TWO_PLAYER ? 2 : 1;
    this.picked = [];

    this.title = this.add
      .text(cx, 88, this.requiredPicks === 2 ? '1P 캐릭터를 선택하세요' : '캐릭터를 선택하세요', {
        fontSize: '48px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const cardW = 380;
    const cardH = 480;
    const gap = 48;
    const totalW = cardW * 4 + gap * 3;
    const startX = cx - totalW / 2 + cardW / 2;
    const y = cam.height / 2 + 40;

    this.cards = CHARACTER_LIST.map((cfg, i) => this._buildCard(cfg, startX + i * (cardW + gap), y, cardW, cardH));
  }

  _buildCard(cfg, x, y, w, h) {
    const bg = this.add.rectangle(x, y, w, h, 0x20202c, 1).setStrokeStyle(4, cfg.color, 0.9);
    const sprite = this.add.sprite(x, y - 100, `char_${cfg.id}_idle`, getCharacterIdleFrame()).setScale(10);
    this.anims.exists(`char_${cfg.id}_walk_right`) && sprite.play(`char_${cfg.id}_walk_right`);
    const title = this.add.text(x, y + 80, cfg.title, { fontSize: '26px', fontFamily: 'sans-serif', color: '#9aa0a6' }).setOrigin(0.5);
    const name = this.add
      .text(x, y + 124, cfg.name, { fontSize: '32px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5);
    const desc = this.add
      .text(x, y + 192, this._weaponDesc(cfg), { fontSize: '24px', fontFamily: 'sans-serif', color: '#ffe14b', align: 'center', wordWrap: { width: w - 32 } })
      .setOrigin(0.5, 0);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setFillStyle(0x2c2c3c));
    bg.on('pointerout', () => bg.setFillStyle(0x20202c));
    bg.on('pointerdown', () => bg.setScale(0.96));
    bg.on('pointerup', () => {
      bg.setScale(1);
      this._selectCharacter(cfg.id);
    });

    return { bg, sprite, title, name, desc };
  }

  _weaponDesc(cfg) {
    const map = {
      ARCHER: '화살 / 화면 전체 화살비',
      GUNNER: '총알 / 중앙 폭탄탄',
      HUNTER: '부메랑 / 전체 관통 대형 부메랑',
      NINJA: '단검 / 일정시간 은신',
    };
    return map[cfg.id] ?? '';
  }

  _selectCharacter(characterId) {
    this.picked.push(characterId);

    if (this.picked.length < this.requiredPicks) {
      this.title.setText('2P 캐릭터를 선택하세요');
      return;
    }

    GameState.initPlayers(this.picked);
    this.scene.start('Game');
  }
}
