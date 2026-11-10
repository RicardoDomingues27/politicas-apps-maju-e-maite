// Procura versão nova: compara o version.json publicado com a versão do app.
// Se for nova, pede ao service worker para baixar tudo e devolve o número.
(function () {
  window.carroCheckUpdate = async function (current) {
    var r = await fetch('version.json?t=' + Date.now(), {cache: 'no-store'});
    var v = (await r.json()).version;
    if (!v || v === current) return null;
    if ('serviceWorker' in navigator) {
      try {
        var reg = await navigator.serviceWorker.getRegistration();
        if (!reg) reg = await navigator.serviceWorker.register('sw.js');
        else await reg.update();
        var sw = reg.installing || reg.waiting;
        if (sw && sw.state !== 'activated') {
          await new Promise(function (res) {
            var t = setTimeout(res, 60000);
            sw.addEventListener('statechange', function () {
              if (sw.state === 'activated' || sw.state === 'redundant') { clearTimeout(t); res(); }
            });
          });
        }
      } catch (e) { /* sem service worker: recarregar já pega a versão nova */ }
    }
    return v;
  };
  window.carroApplyUpdate = function () { location.reload(); };
})();
