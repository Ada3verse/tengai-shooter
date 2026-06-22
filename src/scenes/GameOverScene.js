import Phaser from 'phaser';
import GameState from '../core/GameState.js';
import { createButton } from '../ui/Button.js';
import { submitScore, getTopScores } from '../systems/LeaderboardManager.js';
import { getDifficulty } from '../data/difficultyConfig.js';
import { addMenuBackground } from '../ui/MenuBackground.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.win = !!data?.win;
  }

  create() {
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;
    this.finalScore = GameState.totalScore();
    this.nameInput = null;

    addMenuBackground(this);

    // 명확한 팝업처럼 보이도록 테두리 있는 모달 패널을 그린다 (설정 창과 동일한 톤).
    const panelW = 920;
    const panelH = 960;
    this.add.rectangle(cx, cy, panelW, panelH, 0x14141c, 0.97).setStrokeStyle(4, this.win ? 0x3ddc84 : 0xff5b3b, 0.85);

    const top = cy - panelH / 2;
    this.add
      .text(cx, top + 80, this.win ? '승리!' : 'GAME OVER', {
        fontSize: '64px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: this.win ? '#3ddc84' : '#ff5b3b',
      })
      .setOrigin(0.5);
    this.add.text(cx, top + 150, `최종 점수: ${this.finalScore}`, { fontSize: '32px', fontFamily: 'sans-serif', color: '#ffffff' }).setOrigin(0.5);

    let nextY = top + 230;
    if (!this.win && GameState.canContinue()) {
      const diff = getDifficulty(GameState.difficulty);
      const remaining = diff.continues - GameState.continuesUsed;
      createButton(this, cx, nextY, 640, 88, `이어하기 (잔여 ${remaining}회, 점수 초기화)`, () => this._continue(), {
        bg: 0x2b5a3a,
        border: 0x3ddc84,
        fontSize: '28px',
      });
      nextY += 104;
    }
    createButton(this, cx, nextY, 640, 88, '처음부터 (점수 초기화)', () => this._restart(), { bg: 0x2a2a35, border: 0xffe14b, fontSize: '28px' });
    nextY += 120;

    this.add.text(cx, nextY, '이름을 입력하고 기록을 저장하세요', { fontSize: '26px', fontFamily: 'sans-serif', color: '#9aa0a6' }).setOrigin(0.5);
    nextY += 56;
    this._createNameInput(cx, nextY);
    createButton(this, cx + 180, nextY, 180, 64, '저장', () => this._submitScore(), { bg: 0x2a2a35, border: 0x3ddc84, fontSize: '26px' });
    nextY += 84;

    this.scoresContainer = this.add.container(cx, nextY);
    this._renderTopScores();
    nextY += 220;

    createButton(this, cx, Math.min(nextY, top + panelH - 56), 440, 76, '대시보드로', () => this._toDashboard(), {
      bg: 0x2a2a35,
      border: 0x4dd0e1,
      fontSize: '28px',
    });

    this.events.on('shutdown', () => this._removeNameInput());
  }

  _createNameInput(x, y) {
    const canvas = this.sys.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / this.sys.game.config.width;
    const scaleY = rect.height / this.sys.game.config.height;

    const input = document.createElement('input');
    input.maxLength = 8;
    input.placeholder = 'NAME';
    input.className = 'name-entry-input';
    input.style.position = 'absolute';
    input.style.left = `${rect.left + (x - 180) * scaleX}px`;
    input.style.top = `${rect.top + (y - 28) * scaleY}px`;
    input.style.width = `${240 * scaleX}px`;
    input.style.fontSize = `${20 * scaleY}px`;
    document.body.appendChild(input);
    input.focus();
    this.nameInput = input;
  }

  _removeNameInput() {
    if (this.nameInput) {
      this.nameInput.remove();
      this.nameInput = null;
    }
  }

  _submitScore() {
    if (!this.nameInput) return;
    const name = this.nameInput.value.trim() || 'PLAYER';
    submitScore({
      name,
      score: this.finalScore,
      characterId: GameState.players[0]?.characterId,
      difficulty: GameState.difficulty,
      stageReached: GameState.currentStageIndex + 1,
    });
    this._removeNameInput();
    this._renderTopScores();
  }

  _renderTopScores() {
    this.scoresContainer.removeAll(true);
    const top = getTopScores(5);
    this.scoresContainer.add(
      this.add.text(0, 0, '명예의 전당 (TOP 5)', { fontSize: '28px', fontFamily: 'sans-serif', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5)
    );
    top.forEach((entry, i) => {
      const line = `${i + 1}. ${entry.name}  ${entry.score}점`;
      this.scoresContainer.add(
        this.add.text(0, 40 + i * 36, line, { fontSize: '24px', fontFamily: 'sans-serif', color: '#cfd8dc' }).setOrigin(0.5)
      );
    });
  }

  _continue() {
    GameState.applyContinue();
    this.scene.start('Game');
  }

  _restart() {
    GameState.resetForRestart();
    this.scene.start('CharacterSelect');
  }

  _toDashboard() {
    GameState.fullReset();
    this.scene.start('Dashboard');
  }
}
