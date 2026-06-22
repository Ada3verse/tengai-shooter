import { DIFFICULTY_IDS } from '../core/constants.js';

// 난이도별 기본 목숨 / 이어하기 횟수 / 적 강함 배율
export const DIFFICULTY = {
  [DIFFICULTY_IDS.LOW]: {
    id: DIFFICULTY_IDS.LOW,
    label: '하',
    baseLives: 5,
    continues: 3,
    enemyHpMult: 0.85,
    enemySpeedMult: 0.85,
    enemyFireRateMult: 1.3, // 숫자가 클수록 적 공격 간격이 길어져 더 여유로움
  },
  [DIFFICULTY_IDS.MEDIUM]: {
    id: DIFFICULTY_IDS.MEDIUM,
    label: '중',
    baseLives: 3,
    continues: 2,
    enemyHpMult: 1.0,
    enemySpeedMult: 1.0,
    enemyFireRateMult: 1.0,
  },
  [DIFFICULTY_IDS.HIGH]: {
    id: DIFFICULTY_IDS.HIGH,
    label: '상',
    baseLives: 2,
    continues: 1,
    enemyHpMult: 1.3,
    enemySpeedMult: 1.15,
    enemyFireRateMult: 0.75,
  },
};

export function getDifficulty(id) {
  return DIFFICULTY[id] ?? DIFFICULTY[DIFFICULTY_IDS.MEDIUM];
}
