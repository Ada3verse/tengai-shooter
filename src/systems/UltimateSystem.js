import GameState from '../core/GameState.js';
import EventBus from '../core/EventBus.js';
import { GAME_EVENTS } from '../core/constants.js';
import { play } from '../core/SoundRegistry.js';
import { spawnFromPool } from './ObjectPoolFactory.js';
import { createProjectileTexture, createGiantBoomerangTexture, createBombBulletTexture } from '../utils/graphicsFactory.js';

const NINJA_STEALTH_MS = 4000;
const ULTIMATE_BLOCK_MS = 1200;

// 필살기 충전(개수)을 소비하고 캐릭터별 고유 필살기를 실행한다. 충전 1개 = 1회 사용.
export function tryUseUltimate(scene, player) {
  const pState = GameState.players[player.playerIndex];
  if (!pState || pState.ultimateCharges <= 0) return false;

  pState.ultimateCharges -= 1;
  EventBus.emit(GAME_EVENTS.ULTIMATE_CHARGES_CHANGED, { playerIndex: player.playerIndex, charges: pState.ultimateCharges });

  // 어떤 캐릭터든 필살기를 쓰는 동안에는 적 무기류에 노출되지 않아야 한다: 화면의 적 투사체를
  // 전부 지우고 짧은 무적 시간을 준다(위기 탈출용 필살기라는 취지에 맞춤).
  _blockEnemyWeapons(scene, player);

  const behavior = player.characterConfig.ultimate.behavior;
  if (behavior === 'fullscreen-volley') fullscreenVolley(scene, player);
  else if (behavior === 'center-aoe-explosion') centerAoeExplosion(scene, player);
  else if (behavior === 'full-height-sweep') fullHeightSweep(scene, player);
  else if (behavior === 'stealth-timed') stealthTimed(scene, player);

  play(scene, player.characterConfig.sfx.ultimate, { volume: 0.7 });
  return true;
}

function _blockEnemyWeapons(scene, player) {
  scene.enemyProjectiles.children.each((p) => {
    if (p.active) p.deactivate();
  });
  player.invulnerableUntil = Math.max(player.invulnerableUntil, scene.time.now + ULTIMATE_BLOCK_MS);
}

// 궁수: 화면 전체를 가득 채우는 화살비
function fullscreenVolley(scene, player) {
  const tex = createProjectileTexture(scene, 'arrow', player.characterConfig.color, player.powerLevel);
  const rows = 16;
  const h = scene.cameras.main.height;
  for (let i = 0; i < rows; i++) {
    const y = (h / rows) * i + h / rows / 2;
    const proj = spawnFromPool(scene.playerProjectiles, 0, y, tex);
    if (!proj) continue;
    proj.fire({
      x: 0,
      y,
      vx: 1560,
      vy: 0,
      damage: 4,
      pierce: 99,
      owner: 'player',
      ownerPlayerIndex: player.playerIndex,
      texture: tex,
      ttlMs: 1700,
      hitSfx: player.characterConfig.sfx.hit,
    });
  }
}

// 카우보이: 화면 중앙으로 날아가는 폭탄형 총알 1발 (착탄 시 광역 폭발)
function centerAoeExplosion(scene, player) {
  const tex = createBombBulletTexture(scene, player.characterConfig.color);
  const startX = player.x + 40;
  const startY = player.y;
  const targetX = scene.cameras.main.width / 2;
  const speed = 1080;
  const travelMs = Math.max(180, (Math.abs(targetX - startX) / speed) * 1000);

  const proj = spawnFromPool(scene.playerProjectiles, startX, startY, tex);
  if (!proj) return;
  proj.fire({
    x: startX,
    y: startY,
    vx: speed,
    vy: 0,
    damage: 0, // 직접 충돌 데미지 없음 - 착탄 폭발로만 데미지
    pierce: 99,
    owner: 'player',
    ownerPlayerIndex: player.playerIndex,
    texture: tex,
    ttlMs: travelMs + 40,
  });

  scene.time.delayedCall(travelMs, () => {
    if (proj.active) proj.deactivate();
    scene.events.emit('ultimate:bomb-explode', { x: targetX, y: startY, playerIndex: player.playerIndex });
  });
}

// 사냥꾼: 화면 전체 높이를 차지하는 대형 부메랑이 좌->우로 관통
function fullHeightSweep(scene, player) {
  const tex = createGiantBoomerangTexture(scene, player.characterConfig.color);
  const y = scene.cameras.main.height / 2;
  const proj = spawnFromPool(scene.playerProjectiles, -140, y, tex);
  if (!proj) return;
  proj.fire({
    x: -140,
    y,
    vx: 920,
    vy: 0,
    damage: 6,
    pierce: 99,
    owner: 'player',
    ownerPlayerIndex: player.playerIndex,
    texture: tex,
    ttlMs: 2800,
    hitSfx: player.characterConfig.sfx.hit,
  });
}

// 닌자: 일정 시간 은신 - 적이 도적을 인식/공격하지 못함(무적 처리), 공격은 계속 자동 발사됨
function stealthTimed(scene, player) {
  player.activateStealth(NINJA_STEALTH_MS);
}
