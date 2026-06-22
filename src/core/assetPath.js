// GitHub Pages처럼 도메인 루트가 아닌 서브경로(예: /tengai-shooter/)에 배포될 때도
// 절대경로 에셋 참조가 깨지지 않도록 Vite의 BASE_URL을 붙여준다.
// 개발 서버에서는 BASE_URL이 '/'이므로 기존 동작과 동일하다.
export function assetUrl(path) {
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return normalizedBase + path.replace(/^\//, '');
}
