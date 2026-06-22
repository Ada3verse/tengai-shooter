// 실제 2D 캐릭터 스프라이트 (Ninja Adventure Asset Pack by pixel-boy & AAA, CC0 라이선스).
// 출처: https://pixel-boy.itch.io/ninja-adventure-asset-pack - 저작자 표시 불필요, 상업적 이용 가능.
//
// 캐릭터/적 SeparateAnim 시트는 16x16 프레임, 열(column)이 방향: 0=아래,1=위,2=왼쪽,3=오른쪽.
// Walk.png는 4열(방향) x 4행(걷기 프레임), Idle.png는 4열 x 1행(방향별 정지 포즈 1장).
import { CHARACTER_IDS } from '../core/constants.js';

export const DIRECTION_COL = { DOWN: 0, UP: 1, LEFT: 2, RIGHT: 3 };

export const CHARACTER_SPRITES = {
  [CHARACTER_IDS.ARCHER]: { id: 'ARCHER', frameSize: 16, walkCols: 4, walkRows: 4 },
  [CHARACTER_IDS.GUNNER]: { id: 'GUNNER', frameSize: 16, walkCols: 4, walkRows: 4 },
  [CHARACTER_IDS.HUNTER]: { id: 'HUNTER', frameSize: 16, walkCols: 4, walkRows: 4 },
  [CHARACTER_IDS.NINJA]: { id: 'NINJA', frameSize: 16, walkCols: 4, walkRows: 4 },
};

// 일반 적(졸병) 타입 -> 같은 팩의 캐릭터 폴더. 침략군 소속이라는 설정상 인간 병사부터
// 마물/마도사까지 섞여 있어도 자연스럽다.
export const ENEMY_SPRITE_FOLDERS = {
  grunt_swordsman: 'Knight',
  archer_sentinel: 'SamuraiBlue',
  desert_raider: 'CamouflageGreen',
  dynamite_thrower: 'CamouflageRed',
  forest_assassin: 'NinjaGreen',
  poison_blower: 'NinjaMageOrange',
  mech_soldier: 'RobotGrey',
  flame_turret_drone: 'RobotCamouflage',
  demon_knight: 'DemonRed',
  dark_mage: 'SorcererBlack',
};

export const ENEMY_SPRITE_DEFAULT = { frameSize: 16, walkCols: 4, walkRows: 4 };

// 보스는 방향 구분 없이 항상 플레이어 쪽(좌측)을 향하는 단일 시퀀스.
export const BOSS_SPRITES = {
  boss_1: { id: 'boss_1', frameWidth: 96, frameHeight: 48, idleFrames: 6, walkFrames: 6 },
  boss_2: { id: 'boss_2', frameWidth: 76, frameHeight: 79, idleFrames: 4, walkFrames: 4 },
  boss_3: { id: 'boss_3', frameWidth: 62, frameHeight: 62, idleFrames: 6, walkFrames: 12 },
  boss_4: { id: 'boss_4', frameWidth: 50, frameHeight: 50, idleFrames: 5, walkFrames: 6 },
  boss_5: { id: 'boss_5', frameWidth: 82, frameHeight: 82, idleFrames: 6, walkFrames: 10 },
};
