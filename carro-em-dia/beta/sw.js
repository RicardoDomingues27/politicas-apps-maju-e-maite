// Gerado por tools/make_service_worker.py — não editar à mão.
const CACHE = 'carro-em-dia-20261104-220033';
const CORE = ["./", "index.html", "flutter_bootstrap.js", "flutter.js", "main.dart.js", "manifest.json", "favicon.png", "ocr.js", "atualizar.js"];
const FILES = ["assets/AssetManifest.bin", "assets/AssetManifest.bin.json", "assets/FontManifest.json", "assets/NOTICES", "assets/assets/carros/conversivel.glb", "assets/assets/carros/hatch_compacto.glb", "assets/assets/carros/hatch_esportivo.glb", "assets/assets/carros/miniaturas/conversivel.jpg", "assets/assets/carros/miniaturas/hatch_compacto.jpg", "assets/assets/carros/miniaturas/hatch_esportivo.jpg", "assets/assets/carros/miniaturas/onibus_urbano.jpg", "assets/assets/carros/miniaturas/picape_dupla.jpg", "assets/assets/carros/miniaturas/picape_simples.jpg", "assets/assets/carros/miniaturas/sedan_classico.jpg", "assets/assets/carros/miniaturas/sedan_esportivo.jpg", "assets/assets/carros/miniaturas/suv_crossover.jpg", "assets/assets/carros/miniaturas/suv_jipe.jpg", "assets/assets/carros/miniaturas/van_furgao.jpg", "assets/assets/carros/miniaturas/van_passageiros.jpg", "assets/assets/carros/onibus_urbano.glb", "assets/assets/carros/picape_dupla.glb", "assets/assets/carros/picape_simples.glb", "assets/assets/carros/rodas.glb", "assets/assets/carros/sedan_classico.glb", "assets/assets/carros/sedan_esportivo.glb", "assets/assets/carros/suv_crossover.glb", "assets/assets/carros/suv_jipe.glb", "assets/assets/carros/van_furgao.glb", "assets/assets/carros/van_passageiros.glb", "assets/assets/viewer/carro.js", "assets/assets/viewer/lib/BufferGeometryUtils.js", "assets/assets/viewer/lib/GLTFLoader.js", "assets/assets/viewer/lib/OrbitControls.js", "assets/assets/viewer/lib/RoomEnvironment.js", "assets/assets/viewer/lib/three.module.min.js", "assets/assets/viewer/viewer.html", "assets/fonts/MaterialIcons-Regular.otf", "assets/fonts/fallback/Roboto-Regular.ttf", "assets/packages/cupertino_icons/assets/CupertinoIcons.ttf", "assets/packages/material_ui/shaders/ink_sparkle.frag", "assets/shaders/ink_sparkle.frag", "assets/shaders/stretch_effect.frag", "canvaskit/canvaskit.js", "canvaskit/canvaskit.wasm", "canvaskit/chromium/canvaskit.js", "canvaskit/chromium/canvaskit.wasm", "icons/Icon-192.png", "icons/Icon-512.png", "icons/Icon-maskable-192.png", "icons/Icon-maskable-512.png", "tesseract/lang/por.traineddata.gz", "tesseract/tesseract-core-lstm.wasm.js", "tesseract/tesseract-core-simd-lstm.wasm.js", "tesseract/tesseract.min.js", "tesseract/worker.min.js"];
const FRESH = ['', 'index.html', 'flutter_bootstrap.js', 'main.dart.js', 'version.json', 'ocr.js', 'atualizar.js'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map((f) => new Request(f, {cache: 'reload'})));
    // 'reload' ignora o cache HTTP: sem isso vinham imagens da versão anterior.
    // Os demais um a um: se algum falhar, o resto continua.
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
