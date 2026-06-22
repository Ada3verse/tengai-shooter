import { DIFFICULTY_IDS, GAME_MODES } from './constants.js';
import { getDifficulty } from '../data/difficultyConfig.js';
import { ULTIMATE_START_CHARGES } from '../data/characterConfig.js';

// 씬 간 공유 게임 진행 상태. Phaser registry 대신 일반 싱글톤 모듈을 쓰는 이유는
// players[] 같은 중첩 구조와 resetForContinue() 같은 동작(메서드)을 함께 둘 수 있어서다.
const GameState = {
  mode: GAME_MODES.ONE_PLAYER,
  difficulty: DIFFICULTY_IDS.MEDIUM,
  players: [],
  currentStageIndex: 0,
  continuesUsed: 0,

  initPlayers(characterIds) {
    this.players = characterIds.map((characterId) => this._createPlayerState(characterId));
    this.currentStageIndex = 0;
    this.continuesUsed = 0;
  },

  _createPlayerState(characterId) {
    const diff = getDifficulty(this.difficulty);
    return {
      characterId,
      lives: diff.baseLives,
      score: 0,
      powerLevel: 1,
      ultimateCharges: ULTIMATE_START_CHARGES,
    };
  },

  // 목숨을 잃었을 때: 무기 단계 1로, 필살기 개수 2로 초기화 (요구사항 #32/#33)
  resetPlayerOnDeath(playerIndex) {
    const p = this.players[playerIndex];
    if (!p) return;
    p.powerLevel = 1;
    p.ultimateCharges = ULTIMATE_START_CHARGES;
  },

  totalScore() {
    return this.players.reduce((sum, p) => sum + p.score, 0);
  },

  allPlayersOutOfLives() {
    return this.players.length > 0 && this.players.every((p) => p.lives <= 0);
  },

  canContinue() {
    return this.continuesUsed < getDifficulty(this.difficulty).continues;
  },

  // 이어하기: 난이도별 잔여 횟수 소비, 점수는 무조건 0으로, 현재 스테이지 처음부터 재개 (요구사항 #6/#7)
  applyContinue() {
    if (!this.canContinue()) return false;
    this.continuesUsed += 1;
    const diff = getDifficulty(this.difficulty);
    for (const p of this.players) {
      p.lives = diff.baseLives;
      p.score = 0;
      p.powerLevel = 1;
      p.ultimateCharges = ULTIMATE_START_CHARGES;
    }
    return true;
  },

  // 처음부터: 스테이지1로, 점수/이어하기횟수 전부 초기화 (요구사항 #6)
  resetForRestart() {
    this.currentStageIndex = 0;
    this.continuesUsed = 0;
    const diff = getDifficulty(this.difficulty);
    for (const p of this.players) {
      p.lives = diff.baseLives;
      p.score = 0;
      p.powerLevel = 1;
      p.ultimateCharges = ULTIMATE_START_CHARGES;
    }
  },

  fullReset() {
    this.mode = GAME_MODES.ONE_PLAYER;
    this.difficulty = DIFFICULTY_IDS.MEDIUM;
    this.players = [];
    this.currentStageIndex = 0;
    this.continuesUsed = 0;
  },
};

export default GameState;
