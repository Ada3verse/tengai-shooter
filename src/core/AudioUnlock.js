// 브라우저는 사용자가 직접 클릭/탭/키 입력을 하기 전까지 AudioContext를 'suspended' 상태로 막아둔다.
// Phaser가 보통 알아서 풀어주지만, 환경에 따라 놓치는 경우를 대비해 모든 사용자 입력에서
// 매번 한 번 더 확인해서 풀어준다(이미 켜져 있으면 비용이 거의 없는 단순 상태 체크).
export function setupAudioUnlock(game) {
  const tryResume = () => {
    const ctx = game.sound?.context;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  };

  document.addEventListener('pointerdown', tryResume);
  document.addEventListener('touchstart', tryResume, { passive: true });
  document.addEventListener('keydown', tryResume);
}
