import Phaser from 'phaser';
import { createEnemyProjectileTexture } from '../utils/graphicsFactory.js';
import { spawnFromPool } from '../systems/ObjectPoolFactory.js';
import { play } from '../core/SoundRegistry.js';
import { maybeDropFromEnemy } from '../systems/ItemDropSystem.js';
import { getEnemyIdleFrame } from '../systems/SpriteAnimations.js';
import { flashHit, spawnDeathBurst } from '../systems/EffectsSystem.js';

const ENEMY_SCALE = 4.6;

// 스테이지 데이터(stageConfig의 enemyWaves 항목) 기반으로 외형/체력/속도/공격 sfx가 전부 달라지는
// 일반 적 (보스 아님). 풀링되어 재사용된다.
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture ?? '__DEFAULT');
    this.typeKey = '';
    this.label = '';
    this.color = 0xffffff;
    this.hp = 1;
    this.maxHp = 1;
    this.scoreValue = 100;
    this.dropsItem = false;
    this.dropChance = 0;
    this.attackSfx = null;
    this._attackTimer = 0;
    this._fireRateMult = 1;
    this._stageSpeedTier = 1;
  }

  spawn({ x, y, waveData, speedMult = 1, hpMult = 1, fireRateMult = 1, stageSpeedTier = 1 }) {
    this.setPosition(x, y);
    this.setTexture(`enemy_${waveData.type}_idle`, getEnemyIdleFrame());
    this.setScale(ENEMY_SCALE);
    this.play(`enemy_${waveData.type}_walk_left`);
    this.setActive(true).setVisible(true);
    this.clearTint();
    if (this.body) {
      this.body.enable = true;
      this.body.reset(x, y);
    }
    this.typeKey = waveData.type;
    this.label = waveData.label;
    this.color = waveData.color;
    this.maxHp = Math.ceil(waveData.hp * hpMult);
    this.hp = this.maxHp;
    this.scoreValue = waveData.hp * 50;
    this.dropsItem = !!waveData.dropsItem;
    this.dropChance = waveData.dropChance ?? 0;
    this.attackSfx = waveData.attack?.sfx ?? null;
    this._fireRateMult = fireRateMult;
    this._stageSpeedTier = stageSpeedTier;
    this._attackTimer = (800 + Math.random() * 900) * fireRateMult;
    this.setVelocity(-waveData.speed * speedMult, 0);
    this.setSize(10, 13).setOffset(3, 2);
    return this;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    this._attackTimer -= delta;
    if (this._attackTimer <= 0) {
      this._fireAtPlayer();
      this._attackTimer = (1500 + Math.random() * 800) * this._fireRateMult;
    }
    if (this.x < -120) this.deactivateOffscreen();
  }

  _fireAtPlayer() {
    const scene = this.scene;
    const target = scene.getNearestAlivePlayer ? scene.getNearestAlivePlayer(this.x, this.y) : null;
    const tex = createEnemyProjectileTexture(scene, this.typeKey, this.color, false);
    const proj = spawnFromPool(scene.enemyProjectiles, this.x - 36, this.y, tex);
    if (!proj) return;

    const projSpeed = 600 * this._stageSpeedTier;
    let vx = -projSpeed;
    let vy = 0;
    if (target) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const len = Math.hypot(dx, dy) || 1;
      vx = (dx / len) * projSpeed;
      vy = (dy / len) * projSpeed;
    }
    proj.fire({ x: this.x - 36, y: this.y, vx, vy, damage: 1, pierce: 0, owner: 'enemy', texture: tex, ttlMs: 3500 });
    if (this.attackSfx) play(scene, this.attackSfx, { volume: 0.45 });
  }

  // 피격(생존): 흰색 플래시. 사망은 die()에서 별도로 폭발 이펙트+사운드 처리.
  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp > 0) flashHit(this);
    return this.hp <= 0;
  }

  die() {
    spawnDeathBurst(this.scene, this.x, this.y, this.color);
    play(this.scene, 'sfx_enemy_die', { volume: 0.5 });
    maybeDropFromEnemy(this.scene, this);
    this.deactivateOffscreen();
  }

  deactivateOffscreen() {
    this.setActive(false).setVisible(false);
    if (this.body) this.body.enable = false;
  }
}
