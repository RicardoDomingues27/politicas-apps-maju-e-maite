// Lê o texto da foto da nota direto no navegador (Tesseract.js), sem
// mandar a imagem para nenhum servidor. Os arquivos do leitor vêm junto
// com o app (pasta tesseract/) e ficam guardados para usar offline.
(function () {
  var worker = null;
  var base = new URL('tesseract/', document.baseURI).href;
  var report = function () {};
  var pass = '';
  var names = {
    'loading tesseract core': 'Preparando o leitor…',
    'initializing tesseract': 'Preparando o leitor…',
    'loading language traineddata': 'Carregando o português…',
    'initializing api': 'Preparando o leitor…',
    'recognizing text': 'Lendo a nota'
  };

  // Prepara a foto: respeita a rotação do celular, deixa num tamanho bom
  // para o leitor e devolve duas versões: tons de cinza com contraste
  // esticado e preto-e-branco "adaptativo" (cada região clareada conforme a
  // luz dela, o que tira sombras e o papel térmico apagado).
  async function prepare(bytes) {
    var bmp = await createImageBitmap(new Blob([bytes]), {imageOrientation: 'from-image'});
    var big = Math.max(bmp.width, bmp.height);
    var k = big > 2600 ? 2600 / big : (big < 1600 ? 1600 / big : 1);
    var w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d', {willReadFrequently: true});
    g.drawImage(bmp, 0, 0, w, h);
    var img = g.getImageData(0, 0, w, h), d = img.data;
    var n = w * h, gray = new Uint8ClampedArray(n), hist = new Uint32Array(256);
    for (var i = 0, j = 0; j < n; i += 4, j++) {
      var y = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000 | 0;
      gray[j] = y;
      hist[y]++;
    }
    // Contraste: corta 1% dos extremos e estica o resto para 0..255.
    var lo = 0, hi = 255, acc = 0;
    while (lo < 255 && (acc += hist[lo]) < n * 0.01) lo++;
    acc = 0;
    while (hi > 0 && (acc += hist[hi]) < n * 0.01) hi--;
    var span = Math.max(1, hi - lo);
    for (j = 0; j < n; j++) gray[j] = (gray[j] - lo) * 255 / span;

    // Limiar adaptativo (Bradley): compara cada ponto com a média da janela
    // em volta, usando uma imagem integral.
    var integ = new Float64Array((w + 1) * (h + 1));
    for (var yy = 0; yy < h; yy++) {
      var row = 0;
      for (var xx = 0; xx < w; xx++) {
        row += gray[yy * w + xx];
        integ[(yy + 1) * (w + 1) + xx + 1] = integ[yy * (w + 1) + xx + 1] + row;
      }
    }
    var win = Math.max(15, Math.round(Math.max(w, h) / 24)) >> 1;
    var bin = new Uint8ClampedArray(n);
    for (yy = 0; yy < h; yy++) {
      var y0 = Math.max(0, yy - win), y1 = Math.min(h - 1, yy + win);
      for (xx = 0; xx < w; xx++) {
        var x0 = Math.max(0, xx - win), x1 = Math.min(w - 1, xx + win);
        var count = (x1 - x0 + 1) * (y1 - y0 + 1);
        var sum = integ[(y1 + 1) * (w + 1) + x1 + 1] - integ[y0 * (w + 1) + x1 + 1]
          - integ[(y1 + 1) * (w + 1) + x0] + integ[y0 * (w + 1) + x0];
        bin[yy * w + xx] = gray[yy * w + xx] * count < sum * 0.85 ? 0 : 255;
      }
    }

    function toBlob(px) {
      for (var i = 0, j = 0; j < n; i += 4, j++) d[i] = d[i + 1] = d[i + 2] = px[j];
      g.putImageData(img, 0, 0);
      return new Promise(function (r) { c.toBlob(r, 'image/png'); });
    }
    return {gray: await toBlob(gray), bin: await toBlob(bin)};
  }

  async function read(image, psm) {
    await worker.setParameters({tessedit_pageseg_mode: psm, preserve_interword_spaces: '1'});
    var res = await worker.recognize(image);
    return {text: res.data.text || '', conf: res.data.confidence || 0};
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
          if (m.status === 'recognizing text') t += pass + '… ' + Math.round((m.progress || 0) * 100) + '%';
          report(t);
        }
      });
    }
    var imgs;
    try {
      report('Melhorando a foto…');
      imgs = await prepare(bytes);
    } catch (e) {
      var raw = new Blob([bytes]);
      imgs = {gray: raw, bin: raw};
    }
    // Duas leituras: preto-e-branco como um bloco só (mantém item e preço na
    // mesma linha, mesmo com o preço bem à direita) e tons de cinza em modo
    // coluna. Fica a que achou mais valores em R$; empate, a mais confiável.
    pass = ' (1/2)';
    var a = await read(imgs.bin, '6');
    pass = ' (2/2)';
    var b = await read(imgs.gray, '4');
    pass = '';
    var money = /\d+[.,]\d{2}(?!\d)/g;
    function score(r) { return (r.text.match(money) || []).length * 10 + r.conf; }
    return (score(a) >= score(b) ? a : b).text;
  };
})();
