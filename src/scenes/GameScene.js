import Phaser from 'phaser';
import GameState from '../core/GameState.js';
import EventBus from '../core/EventBus.js';
import { GAME_EVENTS, ITEM_TYPES } from '../core/constants.js';
import { getStage, STAGE_COUNT } from '../data/stageConfig.js';
import { POWER_LEVEL_MAX } from '../data/characterConfig.js';
import { createPool } from '../systems/ObjectPoolFactory.js';
import { play, playLoopingBgm } from '../core/SoundRegistry.js';
import SpawnDirector from '../systems/SpawnDirector.js';
import InputManager from '../systems/InputManager.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Boss from '../entities/Boss.js';
import Projectile from '../entities/Projectile.js';
import Item from '../entities/Item.js';
import { createScrollingBackgroundTexture } from '../utils/graphicsFactory.js';

const BOMB_EXPLOSION_RADIUS = 300;
const BOMB_DAMAGE_ENEMY = 8;
const BOMB_DAMAGE_BOSS = 15;
const BASE_SCROLL_SPEED = 60; // px/sec, speedTier로 스테이지마다 배율 적용

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this._transitioning = false;
    const cam = this.cameras.main;
    const stage = getStage(GameState.currentStageIndex);

    this.physics.world.setBounds(0, 0, cam.width, cam.height);
    const bgKey = createScrollingBackgroundTexture(this, stage);
    this.bgTile = this.add.tileSprite(cam.width / 2, cam.height / 2, cam.width, cam.height, bgKey).setDepth(-10);
    this.scrollSpeed = BASE_SCROLL_SPEED * (stage.speedTier ?? 1);
    this.add
      .text(cam.width / 2, 52, `STAGE ${stage.id}  ${stage.name}`, { fontSize: '32px', fontFamily: 'sans-serif', color: '#ffffff' })
      .setOrigin(0.5)
      .setDepth(900);

    this.playerProjectiles = createPool(this, Projectile, 90);
    this.enemyProjectiles = createPool(this, Projectile, 140);
    this.enemyPool = createPool(this, Enemy, 24);
    this.itemPool = createPool(this, Item, 12);
    this.boss = new Boss(this, 0, 0);

    const playerCount = GameState.players.length;
    const ys = playerCount === 2 ? [cam.height / 2 - 140, cam.height / 2 + 140] : [cam.height / 2];
    this.players = GameState.players.map((pState, idx) => {
      const scheme = idx === 0 ? 'arrows' : 'wasd';
      const input = new InputManager(this, idx, scheme);
      return new Player(this, 220, ys[idx], pState.characterId, idx, input);
    });

    this._setupCollisions();

    this.spawnDirector = new SpawnDirector(this, GameState.currentStageIndex);

    this.events.on('ultimate:bomb-explode', this._onBombExplode, this);

    this._bgm = playLoopingBgm(this, stage.bgmKey ?? 'bgm_main_theme');

    if (!this.scene.isActive('UI')) {
      this.scene.launch('UI');
    }
  }

  getNearestAlivePlayer(x, y) {
    let best = null;
    let bestDist = Infinity;
    for (const p of this.players) {
      if (!p.active) continue;
      const d = Phaser.Math.Distance.Between(x, y, p.x, p.y);
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    return best;
  }

  addScore(playerIndex, amount) {
    const pState = GameState.players[playerIndex];
    if (!pState) return;
    pState.score += amount;
    EventBus.emit(GAME_EVENTS.SCORE_CHANGED, { playerIndex, score: pState.score });
  }

  // 주의: Phaser Arcade overlap은 Group과 단일 GameObject를 짝지을 때 콜백 인자 순서를
  // (단일 객체, 그룹 멤버) 로 강제 정렬한다 - physics.add.overlap()에 넘긴 인자 순서와 무관하다.
  // Group-vs-Group(예: playerProjectiles vs enemyPool)일 때만 선언한 순서가 그대로 유지된다.
  // (Phaser 3.90 기준 실제 동작 확인됨: 콘솔에 양쪽 constructor.name을 찍어 직접 검증)
  _setupCollisions() {
    this.physics.add.overlap(this.playerProjectiles, this.enemyPool, (proj, enemy) => {
      if (!proj.active || !enemy.active) return;
      const dead = enemy.takeDamage(proj.damage);
      if (proj.hitSfx) play(this, proj.hitSfx, { volume: 0.35 });
      proj.registerHit();
      if (dead) {
        this.addScore(proj.ownerPlayerIndex, enemy.scoreValue);
        enemy.die();
      }
    });

    // boss는 단일 객체이므로 콜백 인자는 (boss, proj) 순서로 들어온다.
    this.physics.add.overlap(this.playerProjectiles, this.boss, (boss, proj) => {
      if (!proj.active || !boss.active) return;
      // boss.takeDamage()가 자체적으로 sfx_boss_hit + 화이트 플래시를 재생하므로 여기서는 중복 재생하지 않는다.
      const dead = boss.takeDamage(proj.damage);
      proj.registerHit();
      if (dead) {
        this.addScore(proj.ownerPlayerIndex, 2000);
        boss.die();
      }
    });

    this.players.forEach((player, idx) => {
      // player가 단일 객체이므로 콜백 인자는 (player, proj) 순서로 들어온다.
      this.physics.add.overlap(this.enemyProjectiles, player, (ply, proj) => {
        if (!proj.active || !ply.active) return;
        proj.deactivate();
        ply.handleHit();
      });
      this.physics.add.overlap(this.enemyPool, player, (ply) => {
        if (!ply.active) return;
        ply.handleHit();
      });
      this.physics.add.overlap(this.boss, player, () => {
        if (!this.boss.active || !player.active) return;
        player.handleHit();
      });
      this.physics.add.overlap(this.itemPool, player, (ply, item) => {
        if (!item.active || !ply.active) return;
        this._collectItem(item, idx);
      });
    });
  }

  _collectItem(item, playerIndex) {
    const pState = GameState.players[playerIndex];
    if (!pState) return;
    if (item.itemType === ITEM_TYPES.POWERUP) {
      pState.powerLevel = Math.min(POWER_LEVEL_MAX, pState.powerLevel + 1);
      EventBus.emit(GAME_EVENTS.POWER_LEVEL_CHANGED, { playerIndex, powerLevel: pState.powerLevel });
      play(this, 'sfx_item_pickup_powerup', { volume: 0.6 });
    } else {
      pState.ultimateCharges += 1;
      EventBus.emit(GAME_EVENTS.ULTIMATE_CHARGES_CHANGED, { playerIndex, charges: pState.ultimateCharges });
      play(this, 'sfx_item_pickup_bomb', { volume: 0.6 });
    }
    item.deactivate();
  }

  _onBombExplode({ x, y, playerIndex }) {
    this.cameras.main.shake(220, 0.012);
    const ring = this.add.circle(x, y, 20, 0xffaa33, 0.55).setDepth(950);
    this.tweens.add({
      targets: ring,
      radius: 300,
      alpha: 0,
      duration: 380,
      onComplete: () => ring.destroy(),
    });

    this.enemyPool.children.each((enemy) => {
      if (!enemy.active) return;
      if (Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= BOMB_EXPLOSION_RADIUS) {
        const dead = enemy.takeDamage(BOMB_DAMAGE_ENEMY);
        if (dead) {
          this.addScore(playerIndex, enemy.scoreValue);
          enemy.die();
        }
      }
    });

    if (this.boss.active && Phaser.Math.Distance.Between(x, y, this.boss.x, this.boss.y) <= BOMB_EXPLOSION_RADIUS + 80) {
      const dead = this.boss.takeDamage(BOMB_DAMAGE_BOSS);
      if (dead) {
        this.addScore(playerIndex, 2000);
        this.boss.die();
      }
    }
  }

  update(time, delta) {
    if (this._transitioning) return;

    this.bgTile.tilePositionX += this.scrollSpeed * (delta / 1000);

    this.players.forEach((p) => p.update(time, delta));
    if (this.boss.active) this.boss.update(time, delta);
    this.spawnDirector.update(time, delta);

    if (this.spawnDirector.isStageComplete()) {
      this._onStageClear();
    } else if (GameState.allPlayersOutOfLives()) {
      this._onAllPlayersDown();
    }
  }

  _onStageClear() {
    this._transitioning = true;
    EventBus.emit(GAME_EVENTS.STAGE_CLEARED, { stageIndex: GameState.currentStageIndex });
    play(this, 'sfx_stage_clear', { volume: 0.7 });

    const next = GameState.currentStageIndex + 1;
    if (next >= STAGE_COUNT) {
      this.time.delayedCall(1200, () => this._onVictory());
    } else {
      GameState.currentStageIndex = next;
      this.time.delayedCall(1200, () => this.scene.restart());
    }
  }

  _onVictory() {
    EventBus.emit(GAME_EVENTS.GAME_WON, {});
    this._bgm?.stop();
    this.scene.stop('UI');
    this.scene.start('GameOver', { win: true });
  }

  _onAllPlayersDown() {
    this._transitioning = true;
    EventBus.emit(GAME_EVENTS.GAME_OVER, {});
    this._bgm?.stop();
    this.scene.stop('UI');
    this.scene.start('GameOver', { win: false });
  }
}
