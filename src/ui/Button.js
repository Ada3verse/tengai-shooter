import { play } from '../core/SoundRegistry.js';

// 여러 씬에서 재사용하는 간단한 버튼 (배경 사각형 + 텍스트, hover/press 피드백 포함)
export function createButton(scene, x, y, width, height, label, onClick, opts = {}) {
  const bgColor = opts.bg ?? 0x2a2a35;
  const hoverColor = opts.hoverBg ?? 0x3a3a4c;
  const bg = scene.add.rectangle(x, y, width, height, bgColor, 1);
  bg.setStrokeStyle(4, opts.border ?? 0x4dd0e1, 0.85);
  const text = scene.add
    .text(x, y, label, {
      fontSize: opts.fontSize ?? '36px',
      fontFamily: 'sans-serif',
      color: opts.color ?? '#ffffff',
      fontStyle: opts.fontStyle ?? 'normal',
    })
    .setOrigin(0.5);

  bg.setInteractive({ useHandCursor: true });
  bg.on('pointerover', () => bg.setFillStyle(hoverColor));
  bg.on('pointerout', () => bg.setFillStyle(bgColor));
  bg.on('pointerdown', () => bg.setScale(0.95));
  bg.on('pointerup', () => {
    bg.setScale(1);
    play(scene, 'sfx_ui_click', { volume: 0.5 });
    onClick();
  });

  return { bg, text, setLabel: (s) => text.setText(s) };
}
