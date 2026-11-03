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
    var res = await worker.recognize(new Blob([bytes]));
    return res.data.text || '';
  };
})();
