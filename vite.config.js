import { defineConfig } from 'vite';

// GitHub Pages는 https://<user>.github.io/tengai-shooter/ 처럼 서브경로에서 서빙되므로
// 프로덕션 빌드에서만 base를 repo 이름으로 맞춰준다. 로컬 개발 서버는 그대로 '/'를 쓴다.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/tengai-shooter/' : '/',
}));
