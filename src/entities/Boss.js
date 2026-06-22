import Phaser from 'phaser';
import { createEnemyProjectileTexture } from '../utils/graphicsFactory.js';
import { spawnFromPool } from '../systems/ObjectPoolFactory.js';
import { play } from '../core/SoundRegistry.js';
import EventBus from '../core/EventBus.js';
import { GAME_EVENTS } from '../core/constants.js';
import { BOSS_SPRITES } from '../data/spriteConfig.js';
import { flashHit, spawnDeathBurst } from '../systems/EffectsSystem.js';

const TARGET_DISPLAY_HEIGHT = 300;

const HOLD_X_RATIO = 0.78;

// 보스 패턴 이름 -> 실제 발사 메커닉. 보스마다 이름/외형/HP/sfx는 전부 고유하지만,
// 발사 메커닉 자체는 4가지(조준/부채꼴/원형탄막/포물선)를 재사용해 콘텐츠 매트릭스를 관리 가능한 크기로 유지한다.
const PATTERN_MECHANIC = {
  spread_axe_throw: 'spread_fan',
  shockwave_slam: 'radial_burst',
  whip_crack_line: 'aimed_single',
  dynamite_barrage: 'arc_lob',
  poison_cloud_orbs: 'radial_burst',
  curse_spiral: 'spread_fan',
  laser_sweep: 'aimed_single',
  missile_barrage: 'arc_lob',
  feather_blade_rain: 'radial_burst',
  void_pillar_barrage: 'spread_fan',
  sky_collapse: 'arc_lob',
};

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture ?? '__DEFAULT');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.bossData = null;
    this.hp = 1;
    this.maxHp = 1;
    this.phaseIndex = 0;
    this._attackTimer = 0;
    this._bobTime = 0;
    this._holdX = 0;
    this._entering = false;
    this._fireRateMult = 1;
    this._stageSpeedTier = 1;
    this.setActive(false).setVisible(false);
    if (this.body) this.body.enable = false;
  }

  init(bossData, hpMult = 1, fireRateMult = 1, stageSpeedTier = 1) {
    const spriteCfg = BOSS_SPRITES[bossData.id];
    this.setTexture(`boss_${bossData.id}_idle`, 0);
    this.setScale(TARGET_DISPLAY_HEIGHT / spriteCfg.frameHeight);
    this.play(`boss_${bossData.id}_idle_loop`);
    this.bossData = bossData;
    this.maxHp = Math.ceil(bossData.hp * hpMult);
    this.hp = this.maxHp;
    this._fireRateMult = fireRateMult;
    this._stageSpeedTier = stageSpeedTier;
    this.phaseIndex = 0;
    this._bobTime = 0;
    const cam = this.scene.cameras.main;
    this._holdX = cam.width * HOLD_X_RATIO;
    this.setPosition(cam.width + 90, cam.height / 2);
    this.setActive(true).setVisible(true);
    if (this.body) {
      this.body.enable = true;
      this.body.reset(this.x, this.y);
    }
    this.setSize(this.width * 0.7, this.height * 0.7);
    this._entering = true;
    this._attackTimer = 1300;
    return this;
  }

  get currentPhase() {
    return this.bossData.phases[this.phaseIndex];
  }

  update(time, delta) {
    if (!this.active || !this.bossData) return;

    if (this._entering) {
      // 등장 속도는 스테이지 배율과 무관하게 항상 느리고 묵직하게 - 너무 빨리 튀어나오는 느낌을 없앤다.
      this.x -= 1.4 * (delta / 16.7);
      if (this.x <= this._holdX) {
        this._entering = false;
        this.x = this._holdX;
      }
      return;
    }

    this._bobTime += delta;
    this.y = this.scene.cameras.main.height / 2 + Math.sin(this._bobTime / 700) * 140;

    const hpFrac = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
    let newIndex = 0;
    for (let i = 0; i < this.bossData.phases.length; i++) {
      if (hpFrac <= this.bossData.phases[i].hpThreshold) newIndex = i;
    }
    this.phaseIndex = newIndex;

    this._attackTimer -= delta;
    if (this._attackTimer <= 0) {
      this._runAttackPattern();
      this._attackTimer = (950 / (this.currentPhase.speedMult || 1) + Math.random() * 400) * this._fireRateMult;
    }
  }

  _runAttackPattern() {
    const scene = this.scene;
    const phase = this.currentPhase;
    const tex = createEnemyProjectileTexture(scene, this.bossData.id, this.bossData.color, true);
    const mechanic = PATTERN_MECHANIC[phase.pattern] ?? 'aimed_single';
    const target = scene.getNearestAlivePlayer ? scene.getNearestAlivePlayer(this.x, this.y) : null;
    const baseAngle = target ? Math.atan2(target.y - this.y, target.x - this.x) : Math.PI;

    const fireOne = (angle, speed = 600) => {
      const proj = spawnFromPool(scene.enemyProjectiles, this.x - 80, this.y, tex);
      if (!proj) return;
      proj.fire({
        x: this.x - 80,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: 1,
        pierce: 0,
        owner: 'enemy',
        texture: tex,
        scale: 1.3,
        ttlMs: 4500,
      });
    };

    const t = this._stageSpeedTier;
    if (mechanic === 'aimed_single') {
      fireOne(baseAngle, 760 * t);
    } else if (mechanic === 'spread_fan') {
      for (let i = -2; i <= 2; i++) fireOne(baseAngle + i * 0.18, 640 * t);
    } else if (mechanic === 'radial_burst') {
      for (let i = 0; i < 10; i++) fireOne((i / 10) * Math.PI * 2, 480 * t);
    } else if (mechanic === 'arc_lob') {
      for (let i = -1; i <= 1; i++) fireOne(Math.PI - 0.3 + i * 0.25, 520 * t);
    }

    if (phase.sfx) play(scene, phase.sfx, { volume: 0.6 });
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp > 0) {
      flashHit(this);
      play(this.scene, 'sfx_boss_hit', { volume: 0.35 });
    }
    return this.hp <= 0;
  }

  die() {
    spawnDeathBurst(this.scene, this.x, this.y, this.bossData.color);
    play(this.scene, 'sfx_boss_die', { volume: 0.8 });
    this.setActive(false).setVisible(false);
    if (this.body) this.body.enable = false;
    EventBus.emit(GAME_EVENTS.BOSS_DEFEATED, { bossId: this.bossData.id });
  }
}
