// key -> 파일 경로 매핑. 오디오는 Ninja Adventure Asset Pack(pixel-boy & AAA, CC0)에서 가져왔다.
// 출처: https://pixel-boy.itch.io/ninja-adventure-asset-pack - 저작자 표시 불필요, 상업적 이용 가능.
export const AUDIO_ENABLED = true;

export const BGM_MANIFEST = {
  bgm_main_theme: '/assets/audio/bgm/main_theme.ogg',
};

export const SFX_MANIFEST = {
  // 플레이어 무기
  sfx_bow_twang: '/assets/audio/sfx/bow_twang.wav',
  sfx_arrow_storm: '/assets/audio/sfx/arrow_storm.wav',
  sfx_arrow_hit: '/assets/audio/sfx/arrow_hit.wav',
  sfx_gunshot: '/assets/audio/sfx/gunshot.wav',
  sfx_bomb_blast: '/assets/audio/sfx/bomb_blast.wav',
  sfx_bullet_hit: '/assets/audio/sfx/bullet_hit.wav',
  sfx_boomerang_throw: '/assets/audio/sfx/boomerang_throw.wav',
  sfx_giant_boomerang: '/assets/audio/sfx/giant_boomerang.wav',
  sfx_boomerang_hit: '/assets/audio/sfx/boomerang_hit.wav',
  sfx_dagger_throw: '/assets/audio/sfx/dagger_throw.wav',
  sfx_stealth_in: '/assets/audio/sfx/stealth_in.wav',
  sfx_dagger_hit: '/assets/audio/sfx/dagger_hit.wav',

  // 공용
  sfx_player_hurt: '/assets/audio/sfx/player_hurt.wav',
  sfx_player_death: '/assets/audio/sfx/player_death.wav',
  sfx_item_pickup_powerup: '/assets/audio/sfx/item_pickup_powerup.wav',
  sfx_item_pickup_bomb: '/assets/audio/sfx/item_pickup_bomb.wav',
  sfx_ui_click: '/assets/audio/sfx/ui_click.wav',
  sfx_warning_siren: '/assets/audio/sfx/warning_siren.wav',
  sfx_stage_clear: '/assets/audio/sfx/stage_clear.wav',
  sfx_enemy_die: '/assets/audio/sfx/enemy_die.wav',
  sfx_boss_hit: '/assets/audio/sfx/boss_hit.wav',
  sfx_boss_die: '/assets/audio/sfx/boss_die.wav',
  sfx_charge_start: '/assets/audio/sfx/charge_start.wav',
  sfx_charge_release: '/assets/audio/sfx/charge_release.wav',

  // 스테이지 1~5 일반 적
  sfx_enemy_sword_swing: '/assets/audio/sfx/enemy_sword_swing.wav',
  sfx_enemy_crossbow: '/assets/audio/sfx/enemy_crossbow.wav',
  sfx_enemy_pistol: '/assets/audio/sfx/enemy_pistol.wav',
  sfx_enemy_dynamite: '/assets/audio/sfx/enemy_dynamite.wav',
  sfx_enemy_kunai: '/assets/audio/sfx/enemy_kunai.wav',
  sfx_enemy_poison_dart: '/assets/audio/sfx/enemy_poison_dart.wav',
  sfx_enemy_gatling: '/assets/audio/sfx/enemy_gatling.wav',
  sfx_enemy_flame_jet: '/assets/audio/sfx/enemy_flame_jet.wav',
  sfx_enemy_curse_blade: '/assets/audio/sfx/enemy_curse_blade.wav',
  sfx_enemy_dark_orb: '/assets/audio/sfx/enemy_dark_orb.wav',

  // 보스 1~5
  sfx_boss1_axe_throw: '/assets/audio/sfx/boss1_axe_throw.wav',
  sfx_boss1_slam: '/assets/audio/sfx/boss1_slam.wav',
  sfx_boss2_whip: '/assets/audio/sfx/boss2_whip.wav',
  sfx_boss2_dynamite_barrage: '/assets/audio/sfx/boss2_dynamite_barrage.wav',
  sfx_boss3_orb_cast: '/assets/audio/sfx/boss3_orb_cast.wav',
  sfx_boss3_curse_spiral: '/assets/audio/sfx/boss3_curse_spiral.wav',
  sfx_boss4_laser: '/assets/audio/sfx/boss4_laser.wav',
  sfx_boss4_missiles: '/assets/audio/sfx/boss4_missiles.wav',
  sfx_boss5_feather_rain: '/assets/audio/sfx/boss5_feather_rain.wav',
  sfx_boss5_void_pillar: '/assets/audio/sfx/boss5_void_pillar.wav',
  sfx_boss5_sky_collapse: '/assets/audio/sfx/boss5_sky_collapse.wav',
};

export function preloadAllAudio(scene) {
  if (!AUDIO_ENABLED) return;
  const allEntries = { ...BGM_MANIFEST, ...SFX_MANIFEST };
  for (const [key, path] of Object.entries(allEntries)) {
    scene.load.audio(key, path);
  }
  scene.load.on('loaderror', (file) => {
    if (allEntries[file.key]) {
      console.warn(`[SoundRegistry] audio missing, skipping: ${file.key}`);
    }
  });
}

export function play(scene, key, config) {
  if (!AUDIO_ENABLED) return;
  if (!scene.sound.get(key) && !scene.cache.audio.exists(key)) return;
  try {
    scene.sound.play(key, config);
  } catch {
    // 파일 디코드 실패 등 - 무음 처리, 게임플레이는 계속
  }
}

export function playLoopingBgm(scene, key, config = {}) {
  if (!AUDIO_ENABLED) return null;
  if (!scene.cache.audio.exists(key)) return null;
  // sound.play()는 재생 성공 여부(boolean)를 반환하므로, 인스턴스를 따로 들고 있어야
  // 나중에 .stop()을 호출할 수 있다.
  const bgm = scene.sound.add(key, { loop: true, volume: 0.5, ...config });
  bgm.play();
  return bgm;
}
