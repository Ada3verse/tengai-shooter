// 적/보스가 맞거나 죽을 때의 시각 효과. 풀링 대상이 아닌 1회성 장식이라
// WarningBanner/FireEffect와 같은 패턴(짧게 살다 스스로 destroy)을 따른다.
export function flashHit(target) {
  target.setTintFill(0xffffff);
  target.scene.time.delayedCall(90, () => {
    if (target.active) target.clearTint();
  });
}

export function spawnDeathBurst(scene, x, y, color = 0xffaa33) {
  const core = scene.add.circle(x, y, 10, color, 0.85).setDepth(800);
  scene.tweens.add({
    targets: core,
    radius: 46,
    alpha: 0,
    duration: 280,
    onComplete: () => core.destroy(),
  });

  const sparkCount = 6;
  for (let i = 0; i < sparkCount; i++) {
    const angle = (i / sparkCount) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 50 + Math.random() * 20;
    const spark = scene.add.circle(x, y, 4, 0xffffff, 0.9).setDepth(800);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0,
      duration: 260 + Math.random() * 100,
      onComplete: () => spark.destroy(),
    });
  }
}
