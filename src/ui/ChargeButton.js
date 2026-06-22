import EventBus from '../core/EventBus.js';
import { INPUT_EVENTS } from '../systems/InputManager.js';

// 화면 위 차지 무기 버튼. 누르고 있는 동안 차지되고(플레이어 캐릭터 주변 글로우로 진행도 표시),
// 손을 떼지 않아도 다 차면 자동으로 발사된다. 누르면 색이 바뀌어 눌림 피드백을 준다.
export default class ChargeButton {
  constructor(scene, playerIndex, x, y, keyLabel = '') {
    this.scene = scene;
    this.playerIndex = playerIndex;
    this.container = scene.add.container(x, y).setDepth(1000).setScrollFactor(0);

    this.circle = scene.add.circle(0, 0, 36, 0x3ddcff, 0.3);
    this.circle.setStrokeStyle(3, 0x3ddcff, 0.9);
    this.label = scene.add.text(0, -2, '차지', { fontSize: '13px', fontFamily: 'sans-serif', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.keyHint = scene.add
      .text(0, 50, keyLabel ? `[${keyLabel}]` : '', { fontSize: '12px', fontFamily: 'sans-serif', color: '#ffe14b', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.zone = scene.add.zone(0, 0, 84, 84).setInteractive();

    this.zone.on('pointerdown', () => this._setPressed(true));
    this.zone.on('pointerup', () => this._setPressed(false));
    this.zone.on('pointerout', () => this._setPressed(false));
    this.zone.on('pointerupoutside', () => this._setPressed(false));

    this.container.add([this.circle, this.label, this.keyHint, this.zone]);
  }

  _setPressed(isDown) {
    this.circle.setFillStyle(0x3ddcff, isDown ? 0.6 : 0.3);
    this.container.setScale(isDown ? 1.12 : 1);
    EventBus.emit(INPUT_EVENTS.TOUCH_CHARGE, { playerIndex: this.playerIndex, down: isDown });
  }

  destroy() {
    this.container.destroy();
  }
}
