// 스테이지별 고유 적 웨이브 + 고유 보스(외형/이름/패턴/효과음).
// 세계관: 오리엔탈 중세 왕국이 바다 건너 마군(魔軍)/외세의 침략을 받는 이야기.
// 인간 침략병부터 마물·마도사까지 같은 침략군 소속의 서로 다른 부대로 등장한다.
// dropsItem: true인 적("강한 적")은 격파 시 dropChance 확률로 powerup/bomb 아이템 드롭.
export const STAGES = [
  {
    id: 1,
    name: '화염에 휩싸인 성문',
    bgTheme: 'burning-gate',
    bgColor: 0x3a2420,
    speedTier: 0.4, // 스테이지가 올라갈수록 적/투사체 속도가 빨라짐 (1단계는 매우 느림)
    enemyWaves: [
      {
        type: 'grunt_swordsman',
        label: '침략군 검병',
        color: 0x8a8a8a,
        count: 9,
        spawnIntervalMs: 900,
        hp: 3,
        speed: 180,
        attack: { type: 'melee_lunge', sfx: 'sfx_enemy_sword_swing' },
        dropsItem: false,
      },
      {
        type: 'archer_sentinel',
        label: '침략군 석궁병',
        color: 0x5d7a4f,
        count: 6,
        spawnIntervalMs: 1300,
        hp: 4,
        speed: 120,
        attack: { type: 'arrow_volley', sfx: 'sfx_enemy_crossbow' },
        dropsItem: true,
        dropChance: 0.35,
      },
    ],
    boss: {
      id: 'boss_1',
      name: '침략군 선봉장 가론',
      hp: 140,
      color: 0x707880,
      warningDurationMs: 3000,
      phases: [
        { hpThreshold: 1.0, pattern: 'spread_axe_throw', speedMult: 1.0, sfx: 'sfx_boss1_axe_throw' },
        { hpThreshold: 0.45, pattern: 'shockwave_slam', speedMult: 1.25, sfx: 'sfx_boss1_slam' },
      ],
    },
  },

  {
    id: 2,
    name: '불타는 포구마을',
    bgTheme: 'burning-harbor',
    bgColor: 0x402a1c,
    speedTier: 0.55, // 스테이지가 올라갈수록 적/투사체 속도가 빨라짐 (1단계는 매우 느림)
    enemyWaves: [
      {
        type: 'desert_raider',
        label: '침략군 총병',
        color: 0xc99a4e,
        count: 9,
        spawnIntervalMs: 850,
        hp: 4,
        speed: 220,
        attack: { type: 'twin_pistol_burst', sfx: 'sfx_enemy_pistol' },
        dropsItem: false,
      },
      {
        type: 'dynamite_thrower',
        label: '침략군 척탄병',
        color: 0x9c3b2c,
        count: 6,
        spawnIntervalMs: 1400,
        hp: 5,
        speed: 140,
        attack: { type: 'arc_dynamite', sfx: 'sfx_enemy_dynamite' },
        dropsItem: true,
        dropChance: 0.4,
      },
    ],
    boss: {
      id: 'boss_2',
      name: '함대 사령관 바라크',
      hp: 170,
      color: 0xb06a2c,
      warningDurationMs: 3000,
      phases: [
        { hpThreshold: 1.0, pattern: 'whip_crack_line', speedMult: 1.0, sfx: 'sfx_boss2_whip' },
        { hpThreshold: 0.5, pattern: 'dynamite_barrage', speedMult: 1.3, sfx: 'sfx_boss2_dynamite_barrage' },
      ],
    },
  },

  {
    id: 3,
    name: '안개 낀 매복림',
    bgTheme: 'forest',
    bgColor: 0x241f1a,
    speedTier: 0.7, // 스테이지가 올라갈수록 적/투사체 속도가 빨라짐 (1단계는 매우 느림)
    enemyWaves: [
      {
        type: 'forest_assassin',
        label: '침략군 척살대',
        color: 0x2f4d3a,
        count: 11,
        spawnIntervalMs: 800,
        hp: 4,
        speed: 260,
        attack: { type: 'kunai_flurry', sfx: 'sfx_enemy_kunai' },
        dropsItem: false,
      },
      {
        type: 'poison_blower',
        label: '침략군 독술사',
        color: 0x5a8f4a,
        count: 6,
        spawnIntervalMs: 1350,
        hp: 5,
        speed: 120,
        attack: { type: 'poison_dart', sfx: 'sfx_enemy_poison_dart' },
        dropsItem: true,
        dropChance: 0.4,
      },
    ],
    boss: {
      id: 'boss_3',
      name: '침략군 주술군관 모로',
      hp: 200,
      color: 0x4a7a3f,
      warningDurationMs: 3000,
      phases: [
        { hpThreshold: 1.0, pattern: 'poison_cloud_orbs', speedMult: 1.0, sfx: 'sfx_boss3_orb_cast' },
        { hpThreshold: 0.5, pattern: 'curse_spiral', speedMult: 1.35, sfx: 'sfx_boss3_curse_spiral' },
      ],
    },
  },

  {
    id: 4,
    name: '침략군 강철 진영',
    bgTheme: 'fortress',
    bgColor: 0x2e2420,
    speedTier: 0.85, // 스테이지가 올라갈수록 적/투사체 속도가 빨라짐 (1단계는 매우 느림)
    enemyWaves: [
      {
        type: 'mech_soldier',
        label: '침략군 기갑병',
        color: 0x55606e,
        count: 11,
        spawnIntervalMs: 800,
        hp: 5,
        speed: 200,
        attack: { type: 'gatling_burst', sfx: 'sfx_enemy_gatling' },
        dropsItem: false,
      },
      {
        type: 'flame_turret_drone',
        label: '침략군 화염 포탑',
        color: 0xb5502a,
        count: 6,
        spawnIntervalMs: 1400,
        hp: 6,
        speed: 100,
        attack: { type: 'flame_jet', sfx: 'sfx_enemy_flame_jet' },
        dropsItem: true,
        dropChance: 0.45,
      },
    ],
    boss: {
      id: 'boss_4',
      name: '침략군 공성대장 바슈타르',
      hp: 240,
      color: 0x707888,
      warningDurationMs: 3200,
      phases: [
        { hpThreshold: 1.0, pattern: 'laser_sweep', speedMult: 1.0, sfx: 'sfx_boss4_laser' },
        { hpThreshold: 0.5, pattern: 'missile_barrage', speedMult: 1.4, sfx: 'sfx_boss4_missiles' },
      ],
    },
  },

  {
    id: 5,
    name: '황궁의 최후 관문',
    bgTheme: 'palace-gate',
    bgColor: 0x251a30,
    speedTier: 1.0, // 스테이지가 올라갈수록 적/투사체 속도가 빨라짐 (1단계는 매우 느림)
    enemyWaves: [
      {
        type: 'demon_knight',
        label: '마군 저주기사',
        color: 0x5a2c5e,
        count: 11,
        spawnIntervalMs: 780,
        hp: 6,
        speed: 220,
        attack: { type: 'curse_blade_wave', sfx: 'sfx_enemy_curse_blade' },
        dropsItem: false,
      },
      {
        type: 'dark_mage',
        label: '마군 암흑 마도사',
        color: 0x382a66,
        count: 8,
        spawnIntervalMs: 1300,
        hp: 6,
        speed: 120,
        attack: { type: 'dark_orb', sfx: 'sfx_enemy_dark_orb' },
        dropsItem: true,
        dropChance: 0.5,
      },
    ],
    boss: {
      id: 'boss_5',
      name: '천공마왕 텐가이',
      hp: 320,
      color: 0x9b2f4f,
      warningDurationMs: 3500,
      phases: [
        { hpThreshold: 1.0, pattern: 'feather_blade_rain', speedMult: 1.0, sfx: 'sfx_boss5_feather_rain' },
        { hpThreshold: 0.6, pattern: 'void_pillar_barrage', speedMult: 1.3, sfx: 'sfx_boss5_void_pillar' },
        { hpThreshold: 0.3, pattern: 'sky_collapse', speedMult: 1.5, sfx: 'sfx_boss5_sky_collapse' },
      ],
    },
  },
];

export function getStage(index) {
  return STAGES[index] ?? null;
}

export const STAGE_COUNT = STAGES.length;
