// 배경 곳곳에서 흔들리는 불씨 효과. 모양은 한 번만 그리고(Graphics) 스케일만 tween하므로
// 매 프레임 다시 그리는 비용이 들지 않는다 - WARNING 배너처럼 1회성 정적 장식에만 쓰는 패턴.
export default class FireEffect {
  constructor(scene, spots = [], depth = 5) {
    this.scene = scene;
    this.flames = spots.map(({ x, y, scale = 1 }) => {
      const flame = scene.add.graphics({ x, y }).setDepth(depth);
      this._drawFlame(flame, scale);
      scene.tweens.add({
        targets: flame,
        scaleY: { from: 0.85, to: 1.2 },
        scaleX: { from: 1.1, to: 0.88 },
        duration: 240 + Math.random() * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return flame;
    });
  }

  _drawFlame(g, scale) {
    g.fillStyle(0xff7a1a, 0.92);
    g.fillTriangle(-28 * scale, 0, 0, -92 * scale, 28 * scale, 0);
    g.fillStyle(0xffd23f, 0.95);
    g.fillTriangle(-14 * scale, 0, 0, -52 * scale, 14 * scale, 0);
  }

  destroy() {
    this.flames.forEach((f) => f.destroy());
  }
}
