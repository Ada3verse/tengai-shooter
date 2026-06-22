import EventBus from '../core/EventBus.js';
import { INPUT_EVENTS } from '../systems/InputManager.js';

const DIRS = [
  { key: 'up', ox: 0, oy: -104 },
  { key: 'down', ox: 0, oy: 104 },
  { key: 'left', ox: -104, oy: 0 },
  { key: 'right', ox: 104, oy: 0 },
];

// 화면 위 이동 D-Pad. 터치(또는 마우스)로 누르면 즉시 색/크기가 바뀌어 "눌림" 피드백을 준다 (요구사항 #14/#15).
export default class OnScreenDPad {
  constructor(scene, playerIndex, anchorX, anchorY) {
    this.scene = scene;
    this.playerIndex = playerIndex;
    this.pressed = { up: false, down: false, left: false, right: false };
    this.container = scene.add.container(anchorX, anchorY).setDepth(1000).setScrollFactor(0);
    this.buttons = {};

    for (const d of DIRS) {
      const circle = scene.add.circle(d.ox, d.oy, 54, 0xffffff, 0.18);
      circle.setStrokeStyle(4, 0xffffff, 0.55);
      const arrow = scene.add.triangle(d.ox, d.oy, ...this._arrowPoints(d.key), 0xffffff, 0.9);
      const zone = scene.add.zone(d.ox, d.oy, 116, 116).setInteractive();
      zone.on('pointerdown', () => this._setPressed(d.key, true, circle));
      zone.on('pointerup', () => this._setPressed(d.key, false, circle));
      zone.on('pointerout', () => this._setPressed(d.key, false, circle));
      zone.on('pointerupoutside', () => this._setPressed(d.key, false, circle));
      this.container.add([circle, arrow, zone]);
      this.buttons[d.key] = { circle, arrow, zone };
    }
  }

  _arrowPoints(key) {
    const s = 18;
    if (key === 'up') return [0, -s, -s, s, s, s];
    if (key === 'down') return [0, s, -s, -s, s, -s];
    if (key === 'left') return [-s, 0, s, -s, s, s];
    return [s, 0, -s, -s, -s, s];
  }

  _setPressed(key, isDown, circle) {
    this.pressed[key] = isDown;
    circle.setFillStyle(0xffffff, isDown ? 0.5 : 0.18);
    circle.setScale(isDown ? 1.15 : 1);
    this._emitMove();
  }

  _emitMove() {
    let x = 0;
    let y = 0;
    if (this.pressed.left) x -= 1;
    if (this.pressed.right) x += 1;
    if (this.pressed.up) y -= 1;
    if (this.pressed.down) y += 1;
    EventBus.emit(INPUT_EVENTS.TOUCH_MOVE, { playerIndex: this.playerIndex, x, y });
  }

  destroy() {
    this.container.destroy();
  }
}
