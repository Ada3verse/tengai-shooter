// 가로 화면 전용 게임이므로, 세로 모드일 때는 회전 안내 오버레이를 띄우고 게임 루프를 멈춘다.
export function setupOrientationGuard(game) {
  const overlay = document.getElementById('rotate-overlay');
  if (!overlay) return;

  function check() {
    const isPortrait = window.innerWidth < window.innerHeight;
    overlay.style.display = isPortrait ? 'flex' : 'none';

    // 게임 부트 직후(아직 sound 매니저 등이 준비되지 않은 시점)에 호출돼도 죽지 않게 방어.
    if (isPortrait) {
      game.pause?.();
      game.sound?.pauseAll?.();
    } else {
      game.resume?.();
      game.sound?.resumeAll?.();
    }
  }

  window.addEventListener('resize', check);
  window.addEventListener('orientationchange', check);
  check();
}
