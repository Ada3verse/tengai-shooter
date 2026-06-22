import EventBus from '../core/EventBus.js';
import { INPUT_EVENTS } from '../systems/InputManager.js';
import { GAME_EVENTS } from '../core/constants.js';

// 화면 위 필살기 버튼 + 충전 개수 배지 + 키보드 단축키 표시. 누르면 색/크기가 바뀌어 눌림 피드백을 준다.
export default class UltimateButton {
  constructor(scene, playerIndex, x, y, initialCharges, keyLabel = '') {
    this.scene = scene;
    this.playerIndex = playerIndex;
    this.container = scene.add.container(x, y).setDepth(1000).setScrollFactor(0);

    this.circle = scene.add.circle(0, 0, 72, 0xff5b3b, 0.32);
    this.circle.setStrokeStyle(6, 0xff5b3b, 0.9);
    this.label = scene.add.text(0, -16, '필살', { fontSize: '26px', fontFamily: 'sans-serif', color: '#ffffff' }).setOrigin(0.5);
    this.badge = scene.add
      .text(0, 24, String(initialCharges), { fontSize: '40px', fontFamily: 'sans-serif', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.keyHint = scene.add
      .text(0, 100, keyLabel ? `[${keyLabel}]` : '', { fontSize: '24px', fontFamily: 'sans-serif', color: '#ffe14b', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.zone = scene.add.zone(0, 0, 168, 168).setInteractive();

    this.zone.on('pointerdown', () => this._setPressed(true));
    this.zone.on('pointerup', () => this._setPressed(false));
    this.zone.on('pointerout', () => this._setPressed(false));
    this.zone.on('pointerupoutside', () => this._setPressed(false));

    this.container.add([this.circle, this.label, this.badge, this.keyHint, this.zone]);

    this._onCharge = (payload) => {
      if (payload.playerIndex !== this.playerIndex) return;
      this.badge.setText(String(payload.charges));
    };
    EventBus.on(GAME_EVENTS.ULTIMATE_CHARGES_CHANGED, this._onCharge);
  }

  _setPressed(isDown) {
    this.circle.setFillStyle(0xff5b3b, isDown ? 0.65 : 0.32);
    this.container.setScale(isDown ? 1.12 : 1);
    EventBus.emit(INPUT_EVENTS.TOUCH_ULTIMATE, { playerIndex: this.playerIndex, down: isDown });
  }

  destroy() {
    EventBus.off(GAME_EVENTS.ULTIMATE_CHARGES_CHANGED, this._onCharge);
    this.container.destroy();
  }
}
