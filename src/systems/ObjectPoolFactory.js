// Arcade Physics Group 풀링 헬퍼. spawn 시 destroy() 대신 group.get()으로 비활성 멤버를 재사용한다.
export function createPool(scene, classType, maxSize, warmTexture) {
  const group = scene.physics.add.group({
    classType,
    maxSize,
    runChildUpdate: false, // 각 인스턴스가 자체 preUpdate에서 처리
  });
  if (warmTexture) {
    group.createMultiple({ key: warmTexture, quantity: Math.min(8, maxSize), active: false, visible: false });
    group.children.each((c) => {
      c.setActive(false).setVisible(false);
      if (c.body) c.body.enable = false;
    });
  }
  return group;
}

// group.get()이 null을 반환하면(풀 고갈) 그 스폰을 조용히 스킵한다.
// body 재활성화는 각 엔티티의 fire()/spawn()/init()이 명시적으로 처리한다.
export function spawnFromPool(group, x, y, texture) {
  return group.get(x, y, texture);
}
