import { spawnFromPool } from './ObjectPoolFactory.js';
import { createProjectileTexture } from '../utils/graphicsFactory.js';
import { play } from '../core/SoundRegistry.js';

// 패턴 문자열 -> 발사 오프셋/각도 목록. 파워레벨이 오를수록 더 화려한 패턴을 쓰게 된다.
// ChargeWeaponSystem도 차지 단계별 발사 패턴에 그대로 재사용한다.
export function getPatternShots(pattern) {
  switch (pattern) {
    case 'twin':
      return [{ dy: -18, angleRad: 0 }, { dy: 18, angleRad: 0 }];
    case 'dual-vertical':
      return [{ dy: -32, angleRad: 0 }, { dy: 32, angleRad: 0 }];
    case 'triple-spread':
      return [
        { dy: 0, angleRad: -0.16 },
        { dy: 0, angleRad: 0 },
        { dy: 0, angleRad: 0.16 },
      ];
    case 'single':
    default:
      return [{ dy: 0, angleRad: 0 }];
  }
}

// 캐릭터/파워레벨 데이터(characterConfig)만 보고 발사 패턴을 결정 - 캐릭터별 서브클래스 불필요.
export function fireWeapon(scene, player) {
  const cfg = player.characterConfig;
  const levelCfg = cfg.weapon.levels[player.powerLevel - 1];
  const texKey = createProjectileTexture(scene, cfg.weapon.projectileType, cfg.color, player.powerLevel);
  const isBoomerang = cfg.weapon.projectileType === 'boomerang';
  const shots = getPatternShots(levelCfg.pattern);

  for (const shot of shots) {
    const x = player.x + 48;
    const y = player.y + shot.dy;
    const proj = spawnFromPool(scene.playerProjectiles, x, y, texKey);
    if (!proj) continue;
    const speed = levelCfg.projectileSpeed;
    proj.fire({
      x,
      y,
      vx: Math.cos(shot.angleRad) * speed,
      vy: Math.sin(shot.angleRad) * speed,
      damage: levelCfg.damage,
      pierce: levelCfg.pierce ?? 0,
      owner: 'player',
      ownerPlayerIndex: player.playerIndex,
      texture: texKey,
      isBoomerang,
      boomerangRange: 640,
      ttlMs: 2600,
      hitSfx: cfg.sfx.hit,
    });
  }
  play(scene, cfg.sfx.fire, { volume: 0.5 });
}
