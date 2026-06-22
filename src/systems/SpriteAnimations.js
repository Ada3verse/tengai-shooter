import { CHARACTER_SPRITES, BOSS_SPRITES, ENEMY_SPRITE_FOLDERS, ENEMY_SPRITE_DEFAULT, DIRECTION_COL } from '../data/spriteConfig.js';

export function preloadCharacterSprites(scene) {
  for (const id of Object.keys(CHARACTER_SPRITES)) {
    const fs = CHARACTER_SPRITES[id].frameSize;
    scene.load.spritesheet(`char_${id}_idle`, `/assets/sprites/characters/${id}/Idle.png`, { frameWidth: fs, frameHeight: fs });
    scene.load.spritesheet(`char_${id}_walk`, `/assets/sprites/characters/${id}/Walk.png`, { frameWidth: fs, frameHeight: fs });
  }
}

export function preloadEnemySprites(scene) {
  const fs = ENEMY_SPRITE_DEFAULT.frameSize;
  for (const type of Object.keys(ENEMY_SPRITE_FOLDERS)) {
    scene.load.spritesheet(`enemy_${type}_idle`, `/assets/sprites/enemies/${type}/Idle.png`, { frameWidth: fs, frameHeight: fs });
    scene.load.spritesheet(`enemy_${type}_walk`, `/assets/sprites/enemies/${type}/Walk.png`, { frameWidth: fs, frameHeight: fs });
  }
}

export function preloadBossSprites(scene) {
  for (const id of Object.keys(BOSS_SPRITES)) {
    const cfg = BOSS_SPRITES[id];
    scene.load.spritesheet(`boss_${id}_idle`, `/assets/sprites/bosses/${id}/Idle.png`, {
      frameWidth: cfg.frameWidth,
      frameHeight: cfg.frameHeight,
    });
  }
}

// Phaser의 AnimationManager는 게임 전역(Scene 간 공유)이라 한 번만 등록하면 모든 씬에서 재사용된다.
export function createAllAnimations(scene) {
  for (const id of Object.keys(CHARACTER_SPRITES)) {
    const cfg = CHARACTER_SPRITES[id];
    const animKey = `char_${id}_walk_right`;
    if (scene.anims.exists(animKey)) continue;
    const frames = [];
    for (let row = 0; row < cfg.walkRows; row++) {
      frames.push({ key: `char_${id}_walk`, frame: row * cfg.walkCols + DIRECTION_COL.RIGHT });
    }
    scene.anims.create({ key: animKey, frames, frameRate: 8, repeat: -1 });
  }

  for (const type of Object.keys(ENEMY_SPRITE_FOLDERS)) {
    const cfg = ENEMY_SPRITE_DEFAULT;
    const animKey = `enemy_${type}_walk_left`;
    if (scene.anims.exists(animKey)) continue;
    const frames = [];
    for (let row = 0; row < cfg.walkRows; row++) {
      frames.push({ key: `enemy_${type}_walk`, frame: row * cfg.walkCols + DIRECTION_COL.LEFT });
    }
    scene.anims.create({ key: animKey, frames, frameRate: 7, repeat: -1 });
  }

  for (const id of Object.keys(BOSS_SPRITES)) {
    const cfg = BOSS_SPRITES[id];
    const animKey = `boss_${id}_idle_loop`;
    if (scene.anims.exists(animKey)) continue;
    scene.anims.create({
      key: animKey,
      frames: scene.anims.generateFrameNumbers(`boss_${id}_idle`, { start: 0, end: cfg.idleFrames - 1 }),
      frameRate: 6,
      repeat: -1,
    });
  }
}

export function getCharacterIdleFrame() {
  return DIRECTION_COL.RIGHT;
}

export function getEnemyIdleFrame() {
  return DIRECTION_COL.LEFT;
}
