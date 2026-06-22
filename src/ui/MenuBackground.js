import { createStageBackgroundTexture } from '../utils/graphicsFactory.js';
import FireEffect from './FireEffect.js';

// 대시보드/캐릭터선택/게임오버 등 메뉴 화면에서 공통으로 쓰는 황궁 성문 배경 + 불씨 효과.
// 실제 스테이지5(황궁의 최후 관문) 배경 그리기 로직을 재사용해 톤을 통일한다.
const MENU_STAGE = {
  id: 'menu',
  bgTheme: 'palace-gate',
  bgColor: 0x2a1018,
  fireSpots: [
    { x: 150, y: 300, scale: 1.2 },
    { x: 1770, y: 300, scale: 1.2 },
    { x: 150, y: 700, scale: 0.9 },
    { x: 1770, y: 700, scale: 0.9 },
  ],
};

export function addMenuBackground(scene) {
  const cam = scene.cameras.main;
  const bgKey = createStageBackgroundTexture(scene, MENU_STAGE, cam.width, cam.height);
  scene.add.image(cam.width / 2, cam.height / 2, bgKey).setDepth(-10);
  scene.add.rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, 0x000000, 0.45).setDepth(-5);
  return new FireEffect(scene, MENU_STAGE.fireSpots, -3);
}
