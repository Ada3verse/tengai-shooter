import Phaser from 'phaser';
import GameState from '../core/GameState.js';
import EventBus from '../core/EventBus.js';
import { GAME_EVENTS } from '../core/constants.js';
import { getCharacter } from '../data/characterConfig.js';
import { getCharacterIdleFrame } from '../systems/SpriteAnimations.js';
import { fireWeapon } from '../systems/WeaponSystem.js';
import { tryUseUltimate } from '../systems/UltimateSystem.js';
import { fireChargedShot, getChargeTier } from '../systems/ChargeWeaponSystem.js';
import { dropDeathPowerup } from '../systems/ItemDropSystem.js';
import { play } from '../core/SoundRegistry.js';

const RESPAWN_INVULN_MS = 1500;

// 캐릭터별 서브클래스 없이 characterConfig 데이터만으로 4개 캐릭터 전부를 표현한다
// (무기 패턴/필살기 동작은 WeaponSystem/UltimateSystem이 데이터를 읽어 처리).
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, characterId, playerIndex, inputManager) {
    const characterConfig = getCharacter(characterId);
    super(scene, x, y, `char_${characterId}_idle`, getCharacterIdleFrame());
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.characterId = characterId;
    this.characterConfig = characterConfig;
    this.playerIndex = playerIndex;
    this.inputManager = inputManager;
    this.spawnX = x;
    this.spawnY = y;
    this.invulnerableUntil = 0;
    this.stealthUntil = 0;
    this.fireTimer = 0;
    this._isWalking = false;
    this.chargeHoldMs = 0;
    this._chargeStartSfxPlayed = false;

    this.setCollideWorldBounds(true);
    this.setScale(5);
    this.setSize(10, 13).setOffset(3, 2);

    // 차지 무기 게이지 - 충전 중에만 보이는 원형 글로우. 차오를수록 커지고 밝아진다.
    this.chargeGlow = scene.add.circle(x, y, 55, characterConfig.color, 0.35).setVisible(false).setDepth(-1);
  }

  get powerLevel() {
    return GameState.players[this.playerIndex]?.powerLevel ?? 1;
  }

  get isStealthed() {
    return this.scene.time.now < this.stealthUntil;
  }

  get isInvulnerable() {
    return this.scene.time.now < this.invulnerableUntil || this.isStealthed;
  }

  activateStealth(durationMs) {
    this.stealthUntil = this.scene.time.now + durationMs;
  }

  // 우측 보행 애니메이션만 있으므로, 왼쪽으로 이동할 때는 좌우 반전(flipX)으로 처리한다.
  _updateAnimation(move) {
    if (move.x < 0) this.setFlipX(true);
    else if (move.x > 0) this.setFlipX(false);

    const moving = move.x !== 0 || move.y !== 0;
    if (moving && !this._isWalking) {
      this.play(`char_${this.characterId}_walk_right`);
      this._isWalking = true;
    } else if (!moving && this._isWalking) {
      this.stop();
      this.setFrame(getCharacterIdleFrame());
      this._isWalking = false;
    }
  }

  // 필살기와는 별개로, 차지 키를 누르고 있는 시간만큼 게이지가 차오르고, 손을 떼는 순간 그 시점까지
  // 도달한 단계(1~4)로 발사된다 - 오래 누르고 있을수록 더 강하고 화려한 한 발이 나간다.
  _updateChargeWeapon(delta) {
    const chargeCfg = this.characterConfig.chargeWeapon;
    if (!chargeCfg) return;

    const held = this.inputManager.isChargeHeld();
    this.chargeGlow.setPosition(this.x, this.y);

    if (!held) {
      if (this.chargeHoldMs > 0) {
        const tier = getChargeTier(this.chargeHoldMs, chargeCfg);
        if (tier >= 1) fireChargedShot(this.scene, this, tier);
        this.chargeGlow.setVisible(false);
      }
      this.chargeHoldMs = 0;
      this._chargeStartSfxPlayed = false;
      return;
    }

    if (!this._chargeStartSfxPlayed) {
      play(this.scene, 'sfx_charge_start', { volume: 0.5 });
      this._chargeStartSfxPlayed = true;
    }

    this.chargeHoldMs = Math.min(this.chargeHoldMs + delta, chargeCfg.maxHoldMs);
    const ratio = this.chargeHoldMs / chargeCfg.maxHoldMs;
    this.chargeGlow.setVisible(true);
    // 캐릭터 스프라이트(80px 폭)보다 커야 뒤에 깔려도 가장자리가 보인다.
    this.chargeGlow.setRadius(55 + ratio * 45);
    if (ratio >= 1) {
      // 풀차지 도달 시 살짝 깜빡여서 "놓으면 최대 위력" 신호를 준다.
      this.chargeGlow.setAlpha(0.7 + Math.sin(this.scene.time.now / 90) * 0.15);
    } else {
      this.chargeGlow.setAlpha(0.3 + ratio * 0.5);
    }
  }

  update(time, delta) {
    if (!this.active) return;

    const move = this.inputManager.getMoveVector();
    this.setVelocity(move.x * this.characterConfig.moveSpeed, move.y * this.characterConfig.moveSpeed);
    this._updateAnimation(move);

    this.fireTimer -= delta;
    if (this.fireTimer <= 0) {
      fireWeapon(this.scene, this);
      const levelCfg = this.characterConfig.weapon.levels[this.powerLevel - 1];
      this.fireTimer = levelCfg.fireRateMs;
    }

    if (this.inputManager.consumeUltimatePressed()) {
      tryUseUltimate(this.scene, this);
    }

    this._updateChargeWeapon(delta);

    if (this.isStealthed) {
      this.setAlpha(0.35);
    } else if (time < this.invulnerableUntil) {
      this.setAlpha(Math.floor(time / 100) % 2 === 0 ? 1 : 0.3);
    } else {
      this.setAlpha(1);
    }
  }

  // 적/적 투사체와 충돌 시 호출됨. 무적/은신 중이면 무시.
  handleHit() {
    if (this.isInvulnerable) return;

    const pState = GameState.players[this.playerIndex];
    if (!pState) return;

    pState.lives -= 1;
    play(this.scene, 'sfx_player_hurt', { volume: 0.7 });
    dropDeathPowerup(this.scene, this.x, this.y);
    GameState.resetPlayerOnDeath(this.playerIndex);

    EventBus.emit(GAME_EVENTS.PLAYER_DIED, { playerIndex: this.playerIndex, livesLeft: pState.lives });
    EventBus.emit(GAME_EVENTS.LIVES_CHANGED, { playerIndex: this.playerIndex, lives: pState.lives });
    EventBus.emit(GAME_EVENTS.POWER_LEVEL_CHANGED, { playerIndex: this.playerIndex, powerLevel: pState.powerLevel });
    EventBus.emit(GAME_EVENTS.ULTIMATE_CHARGES_CHANGED, { playerIndex: this.playerIndex, charges: pState.ultimateCharges });

    this.chargeHoldMs = 0;
    this._chargeStartSfxPlayed = false;
    this.chargeGlow.setVisible(false);

    if (pState.lives <= 0) {
      this.setActive(false).setVisible(false);
      if (this.body) this.body.enable = false;
    } else {
      this.setPosition(this.spawnX, this.spawnY);
      this.invulnerableUntil = this.scene.time.now + RESPAWN_INVULN_MS;
    }
  }

  destroy(fromScene) {
    this.inputManager?.destroy();
    this.chargeGlow?.destroy();
    super.destroy(fromScene);
  }
}
