import { createItemTexture } from '../utils/graphicsFactory.js';
import { ITEM_TYPES } from '../core/constants.js';

function spawnItem(scene, x, y, itemType, opts = {}) {
  const texKey = createItemTexture(scene, itemType);
  const item = scene.itemPool.get(x, y, texKey);
  if (!item) return null;
  item.spawn({ x, y, itemType, texture: texKey, driftSpeed: opts.driftSpeed ?? -110, ttlMs: opts.ttlMs ?? 9000 });
  return item;
}

// 강한 적(dropsItem=true) 격파 시 일정 확률로 powerup 또는 bomb 드롭 (요구사항 #28-#30)
export function maybeDropFromEnemy(scene, enemyData) {
  if (!enemyData.dropsItem) return;
  if (Math.random() > (enemyData.dropChance ?? 0.3)) return;
  const itemType = Math.random() < 0.6 ? ITEM_TYPES.POWERUP : ITEM_TYPES.BOMB;
  spawnItem(scene, enemyData.x, enemyData.y, itemType);
}

// 플레이어 사망 시 그 자리에 즉시 회수 가능한 powerup을 떨어뜨림 (요구사항 #32)
export function dropDeathPowerup(scene, x, y) {
  return spawnItem(scene, x, y, ITEM_TYPES.POWERUP, { driftSpeed: 0, ttlMs: 12000 });
}
