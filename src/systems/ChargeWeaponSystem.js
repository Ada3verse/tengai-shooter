import { spawnFromPool } from './ObjectPoolFactory.js';
import { createProjectileTexture } from '../utils/graphicsFactory.js';
import { getPatternShots } from './WeaponSystem.js';
import { play } from '../core/SoundRegistry.js';

export const CHARGE_MIN_HOLD_MS = 300; // 이보다 짧게 누르고 떼면 차지가 무효(발사 안 됨)

// 누르고 있던 시간(holdMs)이 어느 차지 단계(1~4)에 도달했는지 계산.
// MIN_HOLD_MS 미만이면 0(차지 무효)을 반환한다.
export function getChargeTier(holdMs, chargeCfg) {
  if (holdMs < CHARGE_MIN_HOLD_MS) return 0;
  const ratio = Math.min(1, (holdMs - CHARGE_MIN_HOLD_MS) / (chargeCfg.maxHoldMs - CHARGE_MIN_HOLD_MS));
  return 1 + Math.min(3, Math.floor(ratio * 4));
}

// 필살기와는 별개로, 차지 키를 누르고 있던 시간(=도달한 단계)에 따라 강력해지는 단발 차지샷을 쏜다.
// 단계가 오를수록 데미지/발사 개수(패턴)뿐 아니라 투사체 모양 자체도 커지고 화려해진다.
// 추가로 평소 무기 파워레벨(1~4)도 데미지에 소폭 보너스를 줘서, 파워업을 모은 보람이 차지샷에도 남는다.
export function fireChargedShot(scene, player, tier) {
  const cfg = player.characterConfig;
  const chargeCfg = cfg.chargeWeapon;
  if (!chargeCfg || tier < 1) return;

  const tierCfg = chargeCfg.tiers[tier - 1];
  const texKey = createProjectileTexture(scene, cfg.weapon.projectileType, cfg.color, tier);
  const isBoomerang = cfg.weapon.projectileType === 'boomerang';
  const powerBonus = 1 + (player.powerLevel - 1) * 0.25;
  const shots = getPatternShots(tierCfg.pattern);

  for (const shot of shots) {
    const x = player.x + 48;
    const y = player.y + shot.dy;
    const proj = spawnFromPool(scene.playerProjectiles, x, y, texKey);
    if (!proj) continue;
    proj.fire({
      x,
      y,
      vx: Math.cos(shot.angleRad) * chargeCfg.projectileSpeed,
      vy: Math.sin(shot.angleRad) * chargeCfg.projectileSpeed,
      damage: Math.round(tierCfg.damage * powerBonus),
      pierce: 99,
      owner: 'player',
      ownerPlayerIndex: player.playerIndex,
      texture: texKey,
      isBoomerang,
      boomerangRange: 900,
      ttlMs: 3000,
      hitSfx: cfg.sfx.hit,
    });
  }

  play(scene, 'sfx_charge_release', { volume: 0.7 });
}
