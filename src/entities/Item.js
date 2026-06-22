import Phaser from 'phaser';

// powerup / bomb 픽업. 좌측으로 서서히 흘러가며 상하로 둠벙거린다(오실레이션).
export default class Item extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture ?? '__DEFAULT');
    this.itemType = 'POWERUP';
    this._baseY = y;
    this._oscTime = 0;
    this._age = 0;
    this._ttlMs = 9000;
  }

  spawn({ x, y, itemType, texture, driftSpeed = -110, ttlMs = 9000 }) {
    this.setPosition(x, y);
    if (texture) this.setTexture(texture);
    this.setActive(true).setVisible(true);
    if (this.body) {
      this.body.enable = true;
      this.body.reset(x, y);
    }
    this.itemType = itemType;
    this._baseY = y;
    this._oscTime = Math.random() * 1000;
    this._age = 0;
    this._ttlMs = ttlMs;
    this.setVelocity(driftSpeed, 0);
    return this;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    this._oscTime += delta;
    this._age += delta;
    this.y = this._baseY + Math.sin(this._oscTime / 240) * 44;
    if (this._age >= this._ttlMs || this.x < -120) {
      this.deactivate();
    }
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) this.body.enable = false;
  }
}
