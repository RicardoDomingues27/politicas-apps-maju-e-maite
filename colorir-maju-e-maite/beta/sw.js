// Funciona sem internet, mas busca sempre a versão nova quando há internet.
var V = 'colorir-v2b-1.1.3';
var FILES = ['./', 'index.html', 'style.css', 'app.js', 'pages.js', 'pages2.js', 'pages3.js', 'version.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'audio/fundo.mp3', 'img/cadeado.webp', 'img/logo.webp', 'img/ilha-1.webp', 'img/ilha-2.webp', 'img/ilha-3.webp', 'img/ilha-4.webp', 'img/ilha-5.webp', 'img/ilha-6.webp', 'img/cartao-simples.webp', 'img/cartao-verde.webp', 'img/cartao-azul.webp', 'img/cartao-laranja.webp', 'img/cartao-amarelo.webp', 'img/cartao-vermelho.webp', 'img/cartao-turquesa.webp'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); })); self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || e.request.url.indexOf('version.json') >= 0) return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(function (res) {
    var copy = res.clone(); caches.open(V).then(function (c) { c.put(e.request, copy); }); return res;
  }).catch(function () { return caches.match(e.request); }));
});
