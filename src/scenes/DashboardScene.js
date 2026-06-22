import Phaser from 'phaser';
import GameState from '../core/GameState.js';
import { GAME_MODES } from '../core/constants.js';
import { getDifficulty } from '../data/difficultyConfig.js';
import { getTopScores } from '../systems/LeaderboardManager.js';
import { createButton } from '../ui/Button.js';
import { addMenuBackground } from '../ui/MenuBackground.js';

export default class DashboardScene extends Phaser.Scene {
  constructor() {
    super('Dashboard');
  }

  create() {
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    addMenuBackground(this);

    this.add
      .text(cx, 112, '화염관 (火焰關)', { fontSize: '80px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#ff5b3b' })
      .setOrigin(0.5);
    this.add
      .text(cx, 184, '외세의 침공 - 불타는 관문을 지켜라', { fontSize: '28px', fontFamily: 'sans-serif', color: '#9aa0a6' })
      .setOrigin(0.5);

    const diff = getDifficulty(GameState.difficulty);
    this.diffText = this.add
      .text(cx, 248, `난이도: ${diff.label}  (설정에서 변경 가능)`, { fontSize: '28px', fontFamily: 'sans-serif', color: '#ffe14b' })
      .setOrigin(0.5);

    this.modeButton = createButton(
      this,
      cx,
      360,
      520,
      96,
      this._modeLabel(),
      () => this._toggleMode(),
      { bg: 0x223344, border: 0x4dd0e1, fontSize: '32px' }
    );

    createButton(this, cx, 492, 520, 112, '게임 시작', () => this._startGame(), {
      bg: 0x2b5a3a,
      border: 0x3ddc84,
      fontSize: '44px',
      fontStyle: 'bold',
    });
    createButton(this, cx, 624, 520, 96, '설정', () => this._openSettings(), { bg: 0x2a2a35, border: 0xffe14b, fontSize: '32px' });

    this._renderLeaderboard(cx, 744);

    this.events.on('resume', () => {
      this.diffText.setText(`난이도: ${getDifficulty(GameState.difficulty).label}  (설정에서 변경 가능)`);
      this._renderLeaderboard(cx, 744);
    });
  }

  _modeLabel() {
    return GameState.mode === GAME_MODES.ONE_PLAYER ? '모드: 1인 플레이' : '모드: 2인 플레이 (협동)';
  }

  _toggleMode() {
    GameState.mode = GameState.mode === GAME_MODES.ONE_PLAYER ? GAME_MODES.TWO_PLAYER : GAME_MODES.ONE_PLAYER;
    this.modeButton.setLabel(this._modeLabel());
  }

  _startGame() {
    this.scene.start('CharacterSelect');
  }

  _openSettings() {
    this.scene.launch('Settings');
    this.scene.pause();
  }

  _renderLeaderboard(cx, startY) {
    if (this.leaderboardContainer) this.leaderboardContainer.destroy();
    const top = getTopScores(5);
    const container = this.add.container(cx, startY);
    container.add(
      this.add.text(0, 0, '명예의 전당 (TOP 5)', { fontSize: '32px', fontFamily: 'sans-serif', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5)
    );
    if (top.length === 0) {
      container.add(this.add.text(0, 52, '아직 등록된 기록이 없습니다', { fontSize: '26px', fontFamily: 'sans-serif', color: '#999' }).setOrigin(0.5));
    } else {
      top.forEach((entry, i) => {
        const line = `${i + 1}. ${entry.name}  ${entry.score}점  (${entry.difficulty ?? '-'})`;
        container.add(
          this.add.text(0, 52 + i * 40, line, { fontSize: '26px', fontFamily: 'sans-serif', color: '#cfd8dc' }).setOrigin(0.5)
        );
      });
    }
    this.leaderboardContainer = container;
  }
}
