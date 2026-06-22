import { ITEM_TYPES, GAME_WIDTH, GAME_HEIGHT } from '../core/constants.js';

// Graphics는 텍스처 생성 시 딱 한 번만 그리고 캐싱한다 (모바일에서 풀링된 다수 인스턴스가
// 매 프레임 즉시모드로 다시 그려지면 비용이 크기 때문). 이후 모든 인스턴스는 일반 Sprite로
// 이 텍스처 키를 재사용한다.
function ensureTexture(scene, key, width, height, drawFn) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  drawFn(g);
  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

// level(1~4)이 오를수록 투사체 자체가 커지고 흰색 테두리 글로우가 더해지며, 4단계는 끝에
// 밝은 코어까지 붙는다 - 파워업을 한 번만 먹어도(2단계) 바로 형태 차이가 보이도록 설계.
export function createProjectileTexture(scene, projectileType, color, level = 1) {
  const key = `tex_proj_${projectileType}_${color}_lv${level}`;
  const scale = 1 + (level - 1) * 0.32;
  const w = Math.round(48 * scale);
  const h = Math.round(24 * scale);
  return ensureTexture(scene, key, w, h, (g) => {
    _drawProjectileShape(g, projectileType, w, h, color);
    if (level >= 2) {
      g.lineStyle(Math.max(2, level), 0xffffff, 0.5 + level * 0.08);
      _strokeProjectileShape(g, projectileType, w, h);
    }
    if (level >= 4) {
      g.fillStyle(0xffffff, 0.85);
      g.fillCircle(w * 0.8, h / 2, h * 0.22);
    }
  });
}

function _drawProjectileShape(g, projectileType, w, h, color) {
  g.fillStyle(color, 1);
  switch (projectileType) {
    case 'arrow':
      g.fillTriangle(w, h / 2, w * 0.58, h * 0.08, w * 0.58, h * 0.92);
      g.fillRect(w * 0.08, h * 0.33, w * 0.58, h * 0.34);
      break;
    case 'bullet':
      g.fillEllipse(w / 2, h / 2, w * 0.75, h * 0.58);
      break;
    case 'boomerang':
      g.fillEllipse(w / 2, h / 2, w * 0.75, h * 0.83);
      g.fillStyle(0x000000, 0.3);
      g.fillEllipse(w / 2, h / 2, w * 0.33, h * 0.33);
      break;
    case 'dagger':
      g.fillTriangle(w, h / 2, w * 0.33, h * 0.08, w * 0.33, h * 0.92);
      g.fillRect(w * 0.08, h * 0.33, w * 0.33, h * 0.34);
      break;
    default:
      g.fillRect(0, 0, w * 0.67, h * 0.67);
  }
}

function _strokeProjectileShape(g, projectileType, w, h) {
  switch (projectileType) {
    case 'arrow':
      g.strokeTriangle(w, h / 2, w * 0.58, h * 0.08, w * 0.58, h * 0.92);
      break;
    case 'dagger':
      g.strokeTriangle(w, h / 2, w * 0.33, h * 0.08, w * 0.33, h * 0.92);
      break;
    case 'bullet':
      g.strokeEllipse(w / 2, h / 2, w * 0.75, h * 0.58);
      break;
    case 'boomerang':
      g.strokeEllipse(w / 2, h / 2, w * 0.75, h * 0.83);
      break;
    default:
      g.strokeRect(0, 0, w * 0.67, h * 0.67);
  }
}

export function createEnemyProjectileTexture(scene, key, color, big = false) {
  const texKey = `tex_eproj_${key}_${big ? 'big' : 'sm'}`;
  const size = big ? 56 : 28;
  return ensureTexture(scene, texKey, size, size, (g) => {
    g.fillStyle(color, 1);
    g.fillCircle(size / 2, size / 2, size / 2 - 2);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(size / 2, size / 2, size / 4);
  });
}

export function createGiantBoomerangTexture(scene, color) {
  const key = `tex_giant_boomerang_${color}`;
  return ensureTexture(scene, key, 180, 960, (g) => {
    g.fillStyle(color, 0.92);
    g.fillEllipse(90, 480, 160, 920);
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(90, 480, 72, 840);
  });
}

export function createBombBulletTexture(scene, color) {
  const key = `tex_bomb_bullet_${color}`;
  return ensureTexture(scene, key, 60, 60, (g) => {
    g.fillStyle(0x222222, 1);
    g.fillCircle(30, 30, 24);
    g.fillStyle(color, 1);
    g.fillCircle(30, 30, 16);
    g.fillStyle(0xffd23f, 1);
    g.fillRect(26, 2, 8, 12);
  });
}

export function createExplosionTexture(scene) {
  const key = 'tex_explosion_ring';
  return ensureTexture(scene, key, 8, 8, (g) => {
    g.fillStyle(0xffaa33, 1);
    g.fillCircle(4, 4, 4);
  });
}

export function createItemTexture(scene, itemType) {
  const key = `tex_item_${itemType}`;
  return ensureTexture(scene, key, 52, 52, (g) => {
    if (itemType === ITEM_TYPES.POWERUP) {
      g.fillStyle(0x3ddcff, 1);
      drawStar(g, 26, 26, 5, 24, 10);
    } else {
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(26, 28, 20);
      g.fillStyle(0xff5b3b, 1);
      g.fillCircle(26, 28, 12);
      g.fillStyle(0xffd23f, 1);
      g.fillRect(22, 2, 6, 10);
    }
  });
}

function drawStar(g, cx, cy, points, outerR, innerR) {
  const step = Math.PI / points;
  const path = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    path.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.fillPoints(
    path.reduce((acc, v, i) => {
      if (i % 2 === 0) acc.push({ x: v, y: path[i + 1] });
      return acc;
    }, []),
    true
  );
}

export function createWarningStripeTexture(scene) {
  const key = 'tex_warning_stripe';
  return ensureTexture(scene, key, 128, 128, (g) => {
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 128, 128);
    g.fillStyle(0xff2b2b, 1);
    g.fillTriangle(0, 128, 64, 0, 128, 128);
  });
}

// 스테이지 배경: 외세 침략을 받는 오리엔탈 중세 왕국 - 불타는 하늘 + 성문/포구/요새/황궁 실루엣.
// 테마별로 한 번만 그려 텍스처로 캐싱한다 (정적 배경이므로 매 프레임 다시 그릴 필요 없음).
// w/h를 받아 메뉴 화면 등 다른 캔버스 크기에도 재사용할 수 있다(기본값은 게임 해상도).
export function createStageBackgroundTexture(scene, stage, w = GAME_WIDTH, h = GAME_HEIGHT) {
  const key = `tex_bg_stage_${stage.id}_${w}x${h}`;
  return ensureTexture(scene, key, w, h, (g) => {
    _drawBurningSky(g, w, h, stage.bgColor);
    _drawSmokePlumes(g, [w * 0.25, w * 0.55, w * 0.8], h * 0.78);
    _drawStageSilhouette(g, stage.bgTheme, w, h * 0.78);
  });
}

// 인게임 스크롤 배경: 캔버스 2배 너비로 그려서 TileSprite가 무한히 흘러가는 것처럼 보이게 한다.
// 같은 실루엣 그리기 함수를 두 번(translateCanvas로 위치 이동) 호출해 마을/외곽이 이어지는 느낌을 준다.
export function createScrollingBackgroundTexture(scene, stage) {
  const cellW = GAME_WIDTH;
  const h = GAME_HEIGHT;
  const w = cellW * 2;
  const key = `tex_scrollbg_${stage.id}`;
  return ensureTexture(scene, key, w, h, (g) => {
    const groundY = h * 0.78;
    _drawBurningSky(g, w, h, stage.bgColor);
    _drawSmokePlumes(g, [cellW * 0.3, cellW * 0.75, cellW * 1.3, cellW * 1.75], groundY);

    [0, cellW].forEach((offsetX) => {
      g.save();
      g.translateCanvas(offsetX, 0);
      _drawStageSilhouette(g, stage.bgTheme, cellW, groundY);
      g.restore();
    });
  });
}

// Phaser Graphics의 fillGradientStyle은 generateTexture로 굽는 과정에서 제대로 반영되지 않는
// 경우가 있어(WebGL 셰이더 기반 그라디언트 vs 텍스처 베이크 불일치), 얇은 띠를 여러 장 겹쳐 그려
// "수동 그라디언트"를 만든다 - 단색 fillRect만 쓰므로 베이크 결과가 항상 정확하다.
function lerpColor(c1, c2, t) {
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;
  const r = Math.round(r1 + (r2 - r1) * t);
  const gg = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return (r << 16) | (gg << 8) | b;
}

function drawVerticalGradient(g, x, y, w, h, colorTop, colorBottom, steps = 40) {
  const bandH = h / steps;
  for (let i = 0; i < steps; i++) {
    const t = (i + 0.5) / steps;
    g.fillStyle(lerpColor(colorTop, colorBottom, t), 1);
    g.fillRect(x, y + i * bandH, w, bandH + 1);
  }
}

// 불타는 하늘: 위는 노을빛 보라, 지평선 쪽은 환한 주황으로 - 모든 스테이지가 공통으로 "불타는" 톤을 갖는다.
// stage.bgColor는 바닥 쪽 색조 변화(스테이지별 차이)에만 옅게 섞어 쓴다.
function _drawBurningSky(g, w, h, groundTint) {
  const groundY = h * 0.78;
  drawVerticalGradient(g, 0, 0, w, groundY, 0x4a2050, 0xff8a3a, 40);

  // 바닥 (스테이지별 색조를 옅게 섞음)
  g.fillStyle(0x1c1014, 1);
  g.fillRect(0, groundY, w, h - groundY);
  g.fillStyle(groundTint, 0.45);
  g.fillRect(0, groundY, w, h - groundY);
  g.fillStyle(0xff7a2e, 0.7);
  g.fillRect(0, groundY, w, 6);
}

// 옅고 작은 연기 몇 점만 - 너무 크게/진하게 그리면 하늘 그라디언트와 뭉쳐 얼룩처럼 보인다.
function _drawSmokePlumes(g, xs, groundY) {
  xs.forEach((sx, i) => {
    g.fillStyle(0x1a1218, 0.22);
    g.fillEllipse(sx, groundY - 420 - (i % 2) * 60, 110, 170);
    g.fillEllipse(sx + 30, groundY - 540 - (i % 2) * 40, 80, 120);
  });
}

function _drawStageSilhouette(g, theme, w, groundY) {
  g.fillStyle(0x140a10, 1);

  if (theme === 'burning-gate') {
    [120, w - 300].forEach((tx) => {
      g.fillRect(tx, groundY - 460, 180, 460);
      g.fillTriangle(tx - 28, groundY - 460, tx + 90, groundY - 560, tx + 208, groundY - 460);
    });
    g.fillRect(w / 2 - 260, groundY - 320, 520, 320);
    g.fillStyle(0x150d0a, 1);
    g.fillEllipse(w / 2, groundY - 100, 280, 240);
    g.fillStyle(0x2a2018, 0.5);
    g.fillEllipse(w * 0.2, groundY - 520, 280, 140);
    g.fillEllipse(w * 0.8, groundY - 560, 320, 160);
  } else if (theme === 'burning-harbor') {
    for (let i = 0; i < 4; i++) {
      const x = 160 + i * 460;
      g.fillRect(x, groundY - 380, 12, 380);
      g.fillTriangle(x - 4, groundY - 300, x + 6, groundY - 380, x + 72, groundY - 280);
    }
    for (let i = 0; i < 3; i++) {
      const x = 300 + i * 600;
      g.fillRect(x, groundY - 140, 140, 140);
      g.fillTriangle(x, groundY - 140, x + 70, groundY - 220, x + 140, groundY - 140);
    }
  } else if (theme === 'forest') {
    for (let i = 0; i < 9; i++) {
      const x = i * 240 + (i % 2 === 0 ? 0 : 120);
      const treeH = 280 + (i % 3) * 80;
      g.fillTriangle(x, groundY, x + 80, groundY - treeH, x + 160, groundY);
    }
  } else if (theme === 'fortress') {
    g.fillRect(0, groundY - 300, w, 300);
    g.fillStyle(0x140e0c, 1);
    for (let i = 0; i < 10; i++) {
      g.fillRect(i * 200 + 20, groundY - 340, 120, 40);
    }
    g.fillStyle(0x0c0808, 1);
    g.fillRect(w / 2 - 320, groundY - 440, 640, 440);
  } else if (theme === 'palace-gate') {
    for (let i = 0; i < 3; i++) {
      const ry = groundY - 280 - i * 140;
      const rw = 840 - i * 140;
      g.fillTriangle(w / 2 - rw / 2, ry + 100, w / 2, ry - 60, w / 2 + rw / 2, ry + 100);
      g.fillRect(w / 2 - rw / 2 + 20, ry + 80, rw - 40, 32);
    }
    g.fillRect(w / 2 - 180, groundY - 260, 360, 260);
  }
}
