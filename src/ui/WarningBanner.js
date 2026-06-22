import EventBus from '../core/EventBus.js';
import { GAME_EVENTS } from '../core/constants.js';
import { play } from '../core/SoundRegistry.js';

// 보스전 진입 시 빨간 "WARNING" 점멸 배너 (요구사항 #24). 순수 시각효과라 충돌판정에 영향 없음.
export default class WarningBanner {
  constructor(scene) {
    this.scene = scene;
    const cam = scene.cameras.main;
    this.flashRect = scene.add
      .rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, 0xff0000, 0.22)
      .setDepth(1500)
      .setScrollFactor(0)
      .setAlpha(0);
    this.text = scene.add
      .text(cam.width / 2, cam.height / 2, 'WARNING', {
        fontSize: '128px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#ff2b2b',
      })
      .setOrigin(0.5)
      .setDepth(1501)
      .setScrollFactor(0)
      .setAlpha(0);
    this.tween = null;

    this._onWarning = (payload) => this.trigger(payload.durationMs ?? 3000);
    EventBus.on(GAME_EVENTS.BOSS_WARNING_START, this._onWarning);
  }

  trigger(durationMs) {
    play(this.scene, 'sfx_warning_siren', { volume: 0.6 });
    this.text.setAlpha(1);
    this.flashRect.setAlpha(1);
    this.tween = this.scene.tweens.add({
      targets: [this.text, this.flashRect],
      alpha: { from: 1, to: 0.12 },
      duration: 260,
      yoyo: true,
      repeat: Math.ceil(durationMs / 520),
    });
    this.scene.time.delayedCall(durationMs, () => {
      if (this.tween) this.tween.stop();
      this.text.setAlpha(0);
      this.flashRect.setAlpha(0);
    });
  }

  destroy() {
    EventBus.off(GAME_EVENTS.BOSS_WARNING_START, this._onWarning);
    this.text.destroy();
    this.flashRect.destroy();
  }
}
