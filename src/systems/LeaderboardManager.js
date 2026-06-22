const STORAGE_KEY = 'tengai-shooter:leaderboard:v1';
const MAX_ENTRIES = 20;

let memoryFallback = [];

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return memoryFallback;
  }
}

function writeRaw(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    memoryFallback = list;
  }
}

// 여러 사람이 한 기기를 돌려가며 플레이하는 공용 점수판 (localStorage, 비공개 모드 등에서는 메모리 폴백)
export function submitScore(entry) {
  const list = readRaw();
  list.push({
    name: (entry.name || '???').slice(0, 8),
    score: entry.score,
    characterId: entry.characterId,
    difficulty: entry.difficulty,
    stageReached: entry.stageReached,
    dateISO: new Date().toISOString(),
  });
  list.sort((a, b) => b.score - a.score);
  const trimmed = list.slice(0, MAX_ENTRIES);
  writeRaw(trimmed);
  return trimmed;
}

export function getTopScores(n = 10) {
  return readRaw()
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
