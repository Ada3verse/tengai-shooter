import Phaser from 'phaser';

// 화살/총알/부메랑/표창 + 적/보스 투사체 공용 풀링 스프라이트.
// group.get()으로 재사용되므로 destroy() 대신 deactivate()만 호출한다.
export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture ?? '__DEFAULT');
    this.damage = 1;
    this.pierce = 0;
    this.owner = 'player';
    this.ownerPlayerIndex = 0;
    this.ttlMs = 4000;
    this.hitSfx = null;
    this.hitsLeft = 1;
    this._age = 0;
    this.isBoomerang = false;
    this._boomerangState = 'out';
    this._boomerangOriginX = 0;
    this._boomerangOriginY = 0;
    this._boomerangTargetDist = 0;
  }

  fire({
    x,
    y,
    vx,
    vy,
    damage = 1,
    pierce = 0,
    owner = 'player',
    ownerPlayerIndex = 0,
    ttlMs = 4000,
    texture,
    tint = null,
    scale = 1,
    isBoomerang = false,
    boomerangRange = 520,
    hitSfx = null,
  }) {
    this.setPosition(x, y);
    if (texture) this.setTexture(texture);
    this.setActive(true).setVisible(true);
    if (this.body) {
      this.body.enable = true;
      this.body.reset(x, y);
    }
    this.setVelocity(vx, vy);
    this.damage = damage;
    this.pierce = pierce;
    this.hitsLeft = pierce + 1;
    this.owner = owner;
    this.ownerPlayerIndex = ownerPlayerIndex;
    this.ttlMs = ttlMs;
    this.hitSfx = hitSfx;
    this._age = 0;
    this.isBoomerang = isBoomerang;
    this._boomerangState = 'out';
    this._boomerangOriginX = x;
    this._boomerangOriginY = y;
    this._boomerangTargetDist = boomerangRange;
    if (tint != null) this.setTint(tint);
    else this.clearTint();
    this.setScale(scale);
    this.setRotation(Math.atan2(vy, vx));
    return this;
  }

  registerHit() {
    this.hitsLeft -= 1;
    if (this.hitsLeft <= 0) this.deactivate();
    return this.hitsLeft <= 0;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    this._age += delta;

    if (this.isBoomerang && this._boomerangState === 'out') {
      const dist = Phaser.Math.Distance.Between(this._boomerangOriginX, this._boomerangOriginY, this.x, this.y);
      if (dist >= this._boomerangTargetDist) {
        this._boomerangState = 'back';
        this.setVelocity(-this.body.velocity.x, -this.body.velocity.y);
      }
    }

    if (this._age >= this.ttlMs || this._isFarOffScreen()) {
      this.deactivate();
    }
  }

  _isFarOffScreen() {
    const cam = this.scene.cameras.main;
    const margin = 280;
    return this.x < -margin || this.x > cam.width + margin || this.y < -margin || this.y > cam.height + margin;
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) this.body.enable = false;
    this.setVelocity(0, 0);
  }
}
