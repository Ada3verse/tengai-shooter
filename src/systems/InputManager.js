import EventBus from '../core/EventBus.js';

export const INPUT_EVENTS = {
  TOUCH_MOVE: 'input:touch-move',
  TOUCH_ULTIMATE: 'input:touch-ultimate',
  TOUCH_CHARGE: 'input:touch-charge',
};

// 키보드와 화면 터치 입력을 하나의 행동 상태로 합친다. Player는 매 프레임 이 클래스만 polling하므로
// 두 입력 방식이 서로 충돌하지 않고(둘 다 단순 OR), 동시에 같이 써도 문제 없다.
// playerIndex 0(1P)은 항상 방향키를 사용해야 한다는 요구사항 때문에 scheme이 'arrows'로 고정된다.
export default class InputManager {
  constructor(scene, playerIndex, scheme) {
    this.scene = scene;
    this.playerIndex = playerIndex;
    this.touchMove = { x: 0, y: 0 };
    this.touchUltimateDown = false;
    this.touchChargeDown = false;
    this._ultimateKeyWasDown = false;
    this._ultimateTouchWasDown = false;

    const kb = scene.input.keyboard;
    if (scheme === 'wasd') {
      this.keys = {
        up: kb.addKey('W'),
        down: kb.addKey('S'),
        left: kb.addKey('A'),
        right: kb.addKey('D'),
      };
      this.ultimateKey = kb.addKey('SPACE');
      this.chargeKey = kb.addKey('Q');
    } else {
      this.keys = kb.createCursorKeys();
      this.ultimateKey = kb.addKey('SHIFT');
      this.chargeKey = kb.addKey('FORWARD_SLASH');
    }

    this._onTouchMove = (payload) => {
      if (payload.playerIndex !== this.playerIndex) return;
      this.touchMove.x = payload.x;
      this.touchMove.y = payload.y;
    };
    this._onTouchUltimate = (payload) => {
      if (payload.playerIndex !== this.playerIndex) return;
      this.touchUltimateDown = payload.down;
    };
    this._onTouchCharge = (payload) => {
      if (payload.playerIndex !== this.playerIndex) return;
      this.touchChargeDown = payload.down;
    };
    EventBus.on(INPUT_EVENTS.TOUCH_MOVE, this._onTouchMove);
    EventBus.on(INPUT_EVENTS.TOUCH_ULTIMATE, this._onTouchUltimate);
    EventBus.on(INPUT_EVENTS.TOUCH_CHARGE, this._onTouchCharge);
  }

  getMoveVector() {
    let x = 0;
    let y = 0;
    if (this.keys.left?.isDown) x -= 1;
    if (this.keys.right?.isDown) x += 1;
    if (this.keys.up?.isDown) y -= 1;
    if (this.keys.down?.isDown) y += 1;
    if (x === 0 && this.touchMove.x !== 0) x = this.touchMove.x;
    if (y === 0 && this.touchMove.y !== 0) y = this.touchMove.y;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  // edge-triggered: 누른 "순간"에만 true (꾹 누르고 있어도 한 번만 소비됨)
  consumeUltimatePressed() {
    const keyDown = this.ultimateKey?.isDown ?? false;
    const keyEdge = keyDown && !this._ultimateKeyWasDown;
    this._ultimateKeyWasDown = keyDown;

    const touchDown = this.touchUltimateDown;
    const touchEdge = touchDown && !this._ultimateTouchWasDown;
    this._ultimateTouchWasDown = touchDown;

    return keyEdge || touchEdge;
  }

  // 차지 무기는 누르고 있는 동안 계속 true여야 하므로 edge-trigger가 아니라 그냥 현재 상태를 반환한다.
  isChargeHeld() {
    return (this.chargeKey?.isDown ?? false) || this.touchChargeDown;
  }

  destroy() {
    EventBus.off(INPUT_EVENTS.TOUCH_MOVE, this._onTouchMove);
    EventBus.off(INPUT_EVENTS.TOUCH_ULTIMATE, this._onTouchUltimate);
    EventBus.off(INPUT_EVENTS.TOUCH_CHARGE, this._onTouchCharge);
  }
}
