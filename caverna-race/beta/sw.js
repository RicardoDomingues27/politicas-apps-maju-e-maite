// Gerado por tool/make_service_worker.py — não editar à mão.
const CACHE = 'caverna-race-20261102-005120';
const CORE = ["./", "index.html", "flutter_bootstrap.js", "flutter.js", "main.dart.js", "manifest.json", "favicon.png", "apple-touch-icon.png"];
const FILES = ["assets/AssetManifest.bin", "assets/AssetManifest.bin.json", "assets/FontManifest.json", "assets/NOTICES", "assets/assets/audio/boost.wav", "assets/assets/audio/click.wav", "assets/assets/audio/coin.wav", "assets/assets/audio/crash.wav", "assets/assets/audio/engine.wav", "assets/assets/audio/food.wav", "assets/assets/audio/goal.wav", "assets/assets/audio/jump.wav", "assets/assets/audio/land.wav", "assets/assets/audio/music.wav", "assets/assets/audio/music_deserto.wav", "assets/assets/audio/music_gelo.wav", "assets/assets/audio/music_penhasco.wav", "assets/assets/audio/music_vale.wav", "assets/assets/audio/music_vulcao.wav", "assets/assets/audio/pop.wav", "assets/assets/audio/prize.wav", "assets/assets/audio/rare.wav", "assets/assets/audio/tick.wav", "assets/assets/audio/use.wav", "assets/assets/audio/vrum.wav", "assets/assets/audio/wind.wav", "assets/assets/images/app_icon.png", "assets/assets/images/balloon_0.png", "assets/assets/images/balloon_1.png", "assets/assets/images/bar.png", "assets/assets/images/bg_deserto_far.png", "assets/assets/images/bg_deserto_mid.png", "assets/assets/images/bg_gelo_far.png", "assets/assets/images/bg_gelo_mid.png", "assets/assets/images/bg_penhasco_far.png", "assets/assets/images/bg_penhasco_mid.png", "assets/assets/images/bg_vale_far.png", "assets/assets/images/bg_vale_mid.png", "assets/assets/images/bg_vulcao_far.png", "assets/assets/images/bg_vulcao_mid.png", "assets/assets/images/bone_big.png", "assets/assets/images/bone_small.png", "assets/assets/images/bones.png", "assets/assets/images/bush.png", "assets/assets/images/cactus_a.png", "assets/assets/images/cactus_b.png", "assets/assets/images/cactus_c.png", "assets/assets/images/cactus_d.png", "assets/assets/images/cactus_e.png", "assets/assets/images/cactus_f.png", "assets/assets/images/car_cacamba.png", "assets/assets/images/car_cacamba_preview.png", "assets/assets/images/car_esteira.png", "assets/assets/images/car_esteira_preview.png", "assets/assets/images/car_ossos.png", "assets/assets/images/car_ossos_preview.png", "assets/assets/images/car_pedra.png", "assets/assets/images/car_pedra_preview.png", "assets/assets/images/car_voo.png", "assets/assets/images/car_voo_preview.png", "assets/assets/images/caveman_borg_pose.png", "assets/assets/images/caveman_hugo_pose.png", "assets/assets/images/caveman_kina_pose.png", "assets/assets/images/caveman_tuk_pose.png", "assets/assets/images/caveman_xama_pose.png", "assets/assets/images/cloud_a.png", "assets/assets/images/cloud_b.png", "assets/assets/images/coin.png", "assets/assets/images/driver_borg.png", "assets/assets/images/driver_hugo.png", "assets/assets/images/driver_kina.png", "assets/assets/images/driver_tuk.png", "assets/assets/images/driver_xama.png", "assets/assets/images/dust_a.png", "assets/assets/images/dust_b.png", "assets/assets/images/fern_a.png", "assets/assets/images/fern_b.png", "assets/assets/images/flag.png", "assets/assets/images/food.png", "assets/assets/images/glider.png", "assets/assets/images/ground_deserto_fill.png", "assets/assets/images/ground_deserto_top.png", "assets/assets/images/ground_gelo_fill.png", "assets/assets/images/ground_gelo_top.png", "assets/assets/images/ground_penhasco_fill.png", "assets/assets/images/ground_penhasco_top.png", "assets/assets/images/ground_vale_fill.png", "assets/assets/images/ground_vale_top.png", "assets/assets/images/ground_vulcao_fill.png", "assets/assets/images/ground_vulcao_top.png", "assets/assets/images/icon_bag.png", "assets/assets/images/icon_engine.png", "assets/assets/images/icon_legs.png", "assets/assets/images/icon_map.png", "assets/assets/images/icon_motor.png", "assets/assets/images/icon_tire.png", "assets/assets/images/icon_wing.png", "assets/assets/images/icon_wrench.png", "assets/assets/images/palm_a.png", "assets/assets/images/palm_b.png", "assets/assets/images/palm_c.png", "assets/assets/images/pebbles.png", "assets/assets/images/pop_0.png", "assets/assets/images/pop_1.png", "assets/assets/images/pop_2.png", "assets/assets/images/prize.png", "assets/assets/images/ptero_0.png", "assets/assets/images/ptero_1.png", "assets/assets/images/pw_bota.png", "assets/assets/images/pw_bota_raro.png", "assets/assets/images/pw_cabeca.png", "assets/assets/images/pw_carga.png", "assets/assets/images/pw_carga_raro.png", "assets/assets/images/pw_escudo.png", "assets/assets/images/pw_escudo_raro.png", "assets/assets/images/pw_mola.png", "assets/assets/images/pw_mola_raro.png", "assets/assets/images/pw_pimenta.png", "assets/assets/images/pw_pimenta_raro.png", "assets/assets/images/pw_spike.png", "assets/assets/images/pw_spike_raro.png", "assets/assets/images/ribs.png", "assets/assets/images/rock_a.png", "assets/assets/images/rock_b.png", "assets/assets/images/roulette.png", "assets/assets/images/skull.png", "assets/assets/images/stone_small.png", "assets/assets/images/stones.png", "assets/assets/images/sun.png", "assets/assets/images/tree_big.png", "assets/assets/images/tree_desert.png", "assets/assets/images/ui_board.png", "assets/assets/images/ui_board_coin.png", "assets/assets/images/ui_board_dist.png", "assets/assets/images/ui_button_orange.png", "assets/assets/images/ui_button_wood.png", "assets/assets/images/ui_gas.png", "assets/assets/images/ui_jump.png", "assets/assets/images/ui_pause.png", "assets/assets/images/ui_reverse.png", "assets/assets/images/volcano.png", "assets/assets/images/wheel_gelo.png", "assets/assets/images/wheel_pedra.png", "assets/assets/images/wheel_spike.png", "assets/assets/images/wheel_stone.png", "assets/assets/images/wheel_terra.png", "assets/fonts/MaterialIcons-Regular.otf", "assets/fonts/fallback/Roboto-Regular.ttf", "assets/packages/cupertino_icons/assets/CupertinoIcons.ttf", "assets/shaders/ink_sparkle.frag", "assets/shaders/stretch_effect.frag", "canvaskit/canvaskit.js", "canvaskit/canvaskit.wasm", "canvaskit/chromium/canvaskit.js", "canvaskit/chromium/canvaskit.wasm", "icons/Icon-192.png", "icons/Icon-512.png", "icons/Icon-maskable-192.png", "icons/Icon-maskable-512.png"];
const FRESH = ['', 'index.html', 'flutter_bootstrap.js', 'main.dart.js', 'version.json'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map((f) => new Request(f, {cache: 'reload'})));
    // 'reload' ignora o cache HTTP: sem isso vinham imagens da versão anterior.
    // Os demais um a um: se algum falhar, o resto continua. Avisa a página
    // do progresso (botão "verificar atualizações" mostra a porcentagem).
    let done = 0, lastSent = 0;
    const post = async (p) => {
      for (const c of await self.clients.matchAll({includeUncontrolled: true})) {
        c.postMessage({type: 'nova-progress', p});
      }
    };
    await Promise.all(FILES.map((f) => cache.add(new Request(f, {cache: 'reload'}))
      .catch(() => null)
      .then(() => {
        done++;
        if (done - lastSent >= 20 || done === FILES.length) {
          lastSent = done;
          post(done / FILES.length);
        }
      })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((r) => { clearTimeout(t); resolve(r); }, (e) => { clearTimeout(t); reject(e); });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname.replace(self.registration.scope.replace(self.location.origin, ''), '');
  const fresh = FRESH.includes(path) || req.mode === 'navigate';

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Arquivos com intervalo (áudio) não entram no cache como parciais.
    const plain = !req.headers.get('range');
    if (fresh) {
      try {
        // 'no-cache': confere no servidor; sem isso o cache HTTP do navegador
        // (10 min no GitHub Pages) devolvia o código e o texto antigos.
        const res = await withTimeout(fetch(req, {cache: 'no-cache'}), 3000);
        if (res.ok && plain) cache.put(req, res.clone());
        return res;
      } catch (e) {
        const hit = await cache.match(req, {ignoreSearch: true})
          || (req.mode === 'navigate' && await cache.match('index.html'));
        if (hit) return hit;
        throw e;
      }
    }
    const hit = await cache.match(req, {ignoreSearch: true});
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok && plain && res.status === 200) cache.put(req, res.clone());
    return res;
  })());
});
