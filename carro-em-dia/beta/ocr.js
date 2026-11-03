// Lê o texto da foto da nota direto no navegador (Tesseract.js), sem
// mandar a imagem para nenhum servidor. Os arquivos do leitor vêm junto
// com o app (pasta tesseract/) e ficam guardados para usar offline.
(function () {
  var worker = null;
  var base = new URL('tesseract/', document.baseURI).href;
  var report = function () {};
  var names = {
    'loading tesseract core': 'Preparando o leitor…',
    'initializing tesseract': 'Preparando o leitor…',
    'loading language traineddata': 'Carregando o português…',
    'initializing api': 'Preparando o leitor…',
    'recognizing text': 'Lendo a nota'
  };
  // Melhora a foto antes de ler: respeita a rotação do celular, deixa num
  // tamanho bom para o leitor, tons de cinza e contraste esticado (nota de
  // papel térmico costuma sair apagada).
  async function prepare(bytes) {
    try {
      var bmp = await createImageBitmap(new Blob([bytes]), {imageOrientation: 'from-image'});
      var k = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
      if (Math.max(bmp.width, bmp.height) < 1400) k = 1400 / Math.max(bmp.width, bmp.height);
      var w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var g = c.getContext('2d');
      g.drawImage(bmp, 0, 0, w, h);
      var img = g.getImageData(0, 0, w, h), d = img.data;
      var hist = new Uint32Array(256);
      for (var i = 0; i < d.length; i += 4) {
        var y = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000 | 0;
        d[i] = y;
        hist[y]++;
      }
      // Corta 1% dos extremos e estica o resto para 0..255.
      var n = w * h, lo = 0, hi = 255, acc = 0;
      while (lo < 255 && (acc += hist[lo]) < n * 0.01) lo++;
      acc = 0;
      while (hi > 0 && (acc += hist[hi]) < n * 0.01) hi--;
      var span = Math.max(1, hi - lo);
      for (var j = 0; j < d.length; j += 4) {
        var v = Math.max(0, Math.min(255, (d[j] - lo) * 255 / span));
        d[j] = d[j + 1] = d[j + 2] = v;
      }
      g.putImageData(img, 0, 0);
      return await new Promise(function (r) { c.toBlob(r, 'image/png'); });
    } catch (e) {
      return new Blob([bytes]);
    }
  }

  window.carroOcr = async function (bytes, onStatus) {
    report = onStatus || function () {};
    if (!worker) {
      report('Preparando o leitor…');
      worker = await Tesseract.createWorker('por', 1, {
        workerPath: base + 'worker.min.js',
        corePath: base,
        langPath: base + 'lang',
        gzip: true,
        logger: function (m) {
          var t = names[m.status];
          if (!t) return;
          if (m.status === 'recognizing text') t += '… ' + Math.round((m.progress || 0) * 100) + '%';
          report(t);
        }
      });
    }
    var res = await worker.recognize(await prepare(bytes));
    return res.data.text || '';
  };
})();
