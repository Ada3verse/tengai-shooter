import Phaser from 'phaser';
import { getStage } from '../data/stageConfig.js';
import { getDifficulty } from '../data/difficultyConfig.js';
import GameState from '../core/GameState.js';
import EventBus from '../core/EventBus.js';
import { GAME_EVENTS } from '../core/constants.js';

// stageConfig를 읽어 적 웨이브를 타임라인대로 스폰하고, 모두 처리되면 WARNING -> 보스전으로 넘어간다.
export default class SpawnDirector {
  constructor(scene, stageIndex) {
    this.scene = scene;
    this.stage = getStage(stageIndex);
    this.diff = getDifficulty(GameState.difficulty);
    this.waveQueue = [...this.stage.enemyWaves];
    this.currentWave = null;
    this.spawnedInWave = 0;
    this.waveTimer = 0;
    this.allWavesDone = false;
    this.bossTriggered = false;
    this.bossSpawned = false;
    this._startNextWave();
  }

  _startNextWave() {
    this.currentWave = this.waveQueue.shift() ?? null;
    this.spawnedInWave = 0;
    this.waveTimer = 400;
  }

  update(time, delta) {
    if (this.currentWave && this.spawnedInWave < this.currentWave.count) {
      this.waveTimer -= delta;
      if (this.waveTimer <= 0) {
        this._spawnOne(this.currentWave);
        this.spawnedInWave += 1;
        this.waveTimer = this.currentWave.spawnIntervalMs;
      }
    } else if (this.currentWave) {
      this._startNextWave();
    } else if (!this.allWavesDone) {
      this.allWavesDone = true;
    }

    if (this.allWavesDone && !this.bossTriggered && this._noActiveEnemies()) {
      this.bossTriggered = true;
      this._beginBossWarning();
    }
  }

  _spawnOne(wave) {
    const cam = this.scene.cameras.main;
    const y = Phaser.Math.Between(50, cam.height - 50);
    const enemy = this.scene.enemyPool.get(cam.width + 40, y);
    if (!enemy) return;
    enemy.spawn({
      x: cam.width + 40,
      y,
      waveData: wave,
      speedMult: this.diff.enemySpeedMult * (this.stage.speedTier ?? 1),
      hpMult: this.diff.enemyHpMult,
      fireRateMult: this.diff.enemyFireRateMult,
      stageSpeedTier: this.stage.speedTier ?? 1,
    });
  }

  _noActiveEnemies() {
    return this.scene.enemyPool.countActive(true) === 0;
  }

  _beginBossWarning() {
    EventBus.emit(GAME_EVENTS.BOSS_WARNING_START, { durationMs: this.stage.boss.warningDurationMs, bossName: this.stage.boss.name });
    this.scene.time.delayedCall(this.stage.boss.warningDurationMs, () => this._spawnBoss());
  }

  _spawnBoss() {
    this.bossSpawned = true;
    this.scene.boss.init(this.stage.boss, this.diff.enemyHpMult, this.diff.enemyFireRateMult, this.stage.speedTier ?? 1);
    EventBus.emit(GAME_EVENTS.BOSS_SPAWNED, { bossId: this.stage.boss.id, name: this.stage.boss.name });
  }

  isStageComplete() {
    return this.bossSpawned && !this.scene.boss.active;
  }
}
