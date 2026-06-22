export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

export const DIFFICULTY_IDS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
};

export const CHARACTER_IDS = {
  ARCHER: 'ARCHER',
  GUNNER: 'GUNNER',
  HUNTER: 'HUNTER',
  NINJA: 'NINJA',
};

export const ITEM_TYPES = {
  POWERUP: 'POWERUP',
  BOMB: 'BOMB',
};

export const GAME_MODES = {
  ONE_PLAYER: '1P',
  TWO_PLAYER: '2P',
};

export const GAME_EVENTS = {
  SCORE_CHANGED: 'score:changed',
  LIVES_CHANGED: 'lives:changed',
  POWER_LEVEL_CHANGED: 'power:changed',
  ULTIMATE_CHARGES_CHANGED: 'ultimate:charges-changed',
  PLAYER_DIED: 'player:died',
  PLAYER_ULTIMATE_USED: 'player:ultimate-used',
  STAGE_CLEARED: 'stage:cleared',
  BOSS_WARNING_START: 'boss:warning-start',
  BOSS_SPAWNED: 'boss:spawned',
  BOSS_DEFEATED: 'boss:defeated',
  GAME_OVER: 'game:over',
  GAME_WON: 'game:won',
};
