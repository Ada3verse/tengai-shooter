import { CHARACTER_IDS } from '../core/constants.js';

// weapon.levels[0..3] = 파워업 1~4단계. powerLevel(1~4)로 인덱싱: levels[powerLevel - 1]
export const CHARACTERS = {
  [CHARACTER_IDS.ARCHER]: {
    id: CHARACTER_IDS.ARCHER,
    name: '질풍궁 하늬',
    title: '궁수',
    color: 0x3ddc84,
    moveSpeed: 460,
    weapon: {
      projectileType: 'arrow',
      levels: [
        { fireRateMs: 460, damage: 1, pattern: 'single', projectileSpeed: 1040 },
        { fireRateMs: 360, damage: 1, pattern: 'single', projectileSpeed: 1120 },
        { fireRateMs: 320, damage: 1, pattern: 'twin', projectileSpeed: 1160 },
        { fireRateMs: 260, damage: 2, pattern: 'triple-spread', projectileSpeed: 1200, pierce: 1 },
      ],
    },
    ultimate: { id: 'arrowStorm', behavior: 'fullscreen-volley' },
    sfx: { fire: 'sfx_bow_twang', ultimate: 'sfx_arrow_storm', hit: 'sfx_arrow_hit' },
    chargeWeapon: {
      maxHoldMs: 2000,
      projectileSpeed: 1600,
      // 차지 시간에 따라 도달하는 1~4단계. 단계가 오를수록 데미지뿐 아니라 발사 패턴(개수)도 강해진다.
      tiers: [
        { damage: 6, pattern: 'single' },
        { damage: 9, pattern: 'single' },
        { damage: 12, pattern: 'twin' },
        { damage: 16, pattern: 'triple-spread' },
      ],
    },
  },

  [CHARACTER_IDS.GUNNER]: {
    id: CHARACTER_IDS.GUNNER,
    name: '황야의 총잡이 잭',
    title: '카우보이',
    color: 0xd9a23b,
    moveSpeed: 420,
    weapon: {
      projectileType: 'bullet',
      levels: [
        { fireRateMs: 260, damage: 1, pattern: 'single', projectileSpeed: 1360 },
        { fireRateMs: 200, damage: 1, pattern: 'single', projectileSpeed: 1400 },
        { fireRateMs: 175, damage: 1, pattern: 'twin', projectileSpeed: 1440 },
        { fireRateMs: 140, damage: 2, pattern: 'triple-spread', projectileSpeed: 1480, pierce: 1 },
      ],
    },
    ultimate: { id: 'centerBomb', behavior: 'center-aoe-explosion' },
    sfx: { fire: 'sfx_gunshot', ultimate: 'sfx_bomb_blast', hit: 'sfx_bullet_hit' },
    chargeWeapon: {
      maxHoldMs: 2000,
      projectileSpeed: 1900,
      tiers: [
        { damage: 7, pattern: 'single' },
        { damage: 10, pattern: 'single' },
        { damage: 13, pattern: 'twin' },
        { damage: 17, pattern: 'triple-spread' },
      ],
    },
  },

  [CHARACTER_IDS.HUNTER]: {
    id: CHARACTER_IDS.HUNTER,
    name: '황혼의 사냥꾼 로한',
    title: '사냥꾼',
    color: 0xc1542c,
    moveSpeed: 440,
    weapon: {
      projectileType: 'boomerang',
      levels: [
        { fireRateMs: 620, damage: 1, pattern: 'single', projectileSpeed: 800 },
        { fireRateMs: 520, damage: 1, pattern: 'single', projectileSpeed: 880 },
        { fireRateMs: 460, damage: 1, pattern: 'dual-vertical', projectileSpeed: 920 },
        { fireRateMs: 400, damage: 2, pattern: 'triple-spread', projectileSpeed: 960 },
      ],
    },
    ultimate: { id: 'giantBoomerang', behavior: 'full-height-sweep' },
    sfx: { fire: 'sfx_boomerang_throw', ultimate: 'sfx_giant_boomerang', hit: 'sfx_boomerang_hit' },
    chargeWeapon: {
      maxHoldMs: 2000,
      projectileSpeed: 1100,
      tiers: [
        { damage: 8, pattern: 'single' },
        { damage: 11, pattern: 'single' },
        { damage: 15, pattern: 'dual-vertical' },
        { damage: 20, pattern: 'triple-spread' },
      ],
    },
  },

  [CHARACTER_IDS.NINJA]: {
    id: CHARACTER_IDS.NINJA,
    name: '그림자 닌자 카게',
    title: '닌자',
    color: 0x6b5ce0,
    moveSpeed: 500,
    weapon: {
      projectileType: 'dagger',
      levels: [
        { fireRateMs: 300, damage: 1, pattern: 'single', projectileSpeed: 1240 },
        { fireRateMs: 240, damage: 1, pattern: 'single', projectileSpeed: 1320 },
        { fireRateMs: 210, damage: 1, pattern: 'twin', projectileSpeed: 1360 },
        { fireRateMs: 170, damage: 2, pattern: 'triple-spread', projectileSpeed: 1400, pierce: 1 },
      ],
    },
    ultimate: { id: 'shadowVeil', behavior: 'stealth-timed' },
    sfx: { fire: 'sfx_dagger_throw', ultimate: 'sfx_stealth_in', hit: 'sfx_dagger_hit' },
    chargeWeapon: {
      maxHoldMs: 2000,
      projectileSpeed: 1800,
      tiers: [
        { damage: 6, pattern: 'single' },
        { damage: 9, pattern: 'single' },
        { damage: 12, pattern: 'twin' },
        { damage: 16, pattern: 'triple-spread' },
      ],
    },
  },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);

export function getCharacter(id) {
  return CHARACTERS[id];
}

export const ULTIMATE_START_CHARGES = 2;
export const POWER_LEVEL_MAX = 4;
