import Phaser from 'phaser';
import GameState from '../core/GameState.js';
import HUD from '../ui/HUD.js';
import OnScreenDPad from '../ui/OnScreenDPad.js';
import UltimateButton from '../ui/UltimateButton.js';
import ChargeButton from '../ui/ChargeButton.js';
import WarningBanner from '../ui/WarningBanner.js';

// GameScene과 병렬로 실행되는 화면-고정 UI 레이어: HUD, 조작버튼(D-Pad+차지+필살기), WARNING 배너.
// GameScene의 스크롤 카메라 변환에 영향받지 않도록 별도 씬으로 분리.
export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UI');
  }

  create() {
    const cam = this.cameras.main;
    const playerCount = GameState.players.length;
    this.huds = [];
    this.dpads = [];
    this.ultButtons = [];
    this.chargeButtons = [];

    GameState.players.forEach((pState, idx) => {
      const align = idx === 0 ? 'left' : 'right';
      const hudX = idx === 0 ? 32 : cam.width - 32;
      this.huds.push(new HUD(this, idx, hudX, 32, align));

      let dpadX;
      let chargeX;
      let ultX;
      if (playerCount === 1) {
        dpadX = 180;
        chargeX = cam.width - 320;
        ultX = cam.width - 140;
      } else if (idx === 0) {
        dpadX = 180;
        chargeX = 400;
        ultX = 620;
      } else {
        dpadX = cam.width - 180;
        chargeX = cam.width - 400;
        ultX = cam.width - 620;
      }
      const controlY = cam.height - 180;
      const ultimateKeyLabel = idx === 0 ? 'Shift' : 'Space';
      const chargeKeyLabel = idx === 0 ? '/' : 'Q';
      this.dpads.push(new OnScreenDPad(this, idx, dpadX, controlY));
      this.chargeButtons.push(new ChargeButton(this, idx, chargeX, controlY, chargeKeyLabel));
      this.ultButtons.push(new UltimateButton(this, idx, ultX, controlY, pState.ultimateCharges, ultimateKeyLabel));
    });

    this.warningBanner = new WarningBanner(this);

    this.events.on('shutdown', () => {
      this.huds.forEach((h) => h.destroy());
      this.dpads.forEach((d) => d.destroy());
      this.chargeButtons.forEach((c) => c.destroy());
      this.ultButtons.forEach((u) => u.destroy());
      this.warningBanner.destroy();
    });
  }
}
