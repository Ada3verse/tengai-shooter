import EventBus from '../core/EventBus.js';
import { GAME_EVENTS } from '../core/constants.js';
import GameState from '../core/GameState.js';
import { getCharacter } from '../data/characterConfig.js';

// 플레이어별 목숨/점수/파워레벨/필살기 충전 HUD. 1P는 좌상단, 2P는 우상단에 배치.
export default class HUD {
  constructor(scene, playerIndex, x, y, align = 'left') {
    this.scene = scene;
    this.playerIndex = playerIndex;
    const origin = align === 'right' ? 1 : 0;
    const cfg = getCharacter(GameState.players[playerIndex].characterId);

    this.container = scene.add.container(x, y).setDepth(1000).setScrollFactor(0);
    this.nameText = scene.add
      .text(0, 0, `${cfg.name}`, { fontSize: '30px', fontFamily: 'sans-serif', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(origin, 0);
    this.statsText = scene.add
      .text(0, 40, '', { fontSize: '28px', fontFamily: 'sans-serif', color: '#ffe14b' })
      .setOrigin(origin, 0);
    this.container.add([this.nameText, this.statsText]);

    this._refresh();

    this._onLives = (p) => this._maybeRefresh(p);
    this._onScore = (p) => this._maybeRefresh(p);
    this._onPower = (p) => this._maybeRefresh(p);
    this._onCharges = (p) => this._maybeRefresh(p);
    EventBus.on(GAME_EVENTS.LIVES_CHANGED, this._onLives);
    EventBus.on(GAME_EVENTS.SCORE_CHANGED, this._onScore);
    EventBus.on(GAME_EVENTS.POWER_LEVEL_CHANGED, this._onPower);
    EventBus.on(GAME_EVENTS.ULTIMATE_CHARGES_CHANGED, this._onCharges);
  }

  _maybeRefresh(payload) {
    if (payload.playerIndex !== this.playerIndex) return;
    this._refresh();
  }

  _refresh() {
    const p = GameState.players[this.playerIndex];
    if (!p) return;
    const hearts = '♥'.repeat(Math.max(0, p.lives));
    this.statsText.setText(`${hearts}  점수 ${p.score}  파워Lv.${p.powerLevel}  필살${p.ultimateCharges}`);
  }

  destroy() {
    EventBus.off(GAME_EVENTS.LIVES_CHANGED, this._onLives);
    EventBus.off(GAME_EVENTS.SCORE_CHANGED, this._onScore);
    EventBus.off(GAME_EVENTS.POWER_LEVEL_CHANGED, this._onPower);
    EventBus.off(GAME_EVENTS.ULTIMATE_CHARGES_CHANGED, this._onCharges);
    this.container.destroy();
  }
}
