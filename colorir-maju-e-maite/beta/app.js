/* Colorir e Desenhar v2 — sem rede, sem dados, sem links. */
(function () {
  'use strict';
  var LAYOUT = document.body.getAttribute('data-layout') || 'a';
  var W = 1200, H = 900;
  var COLORS = ['#FF3B30', '#FF9500', '#FFD60A', '#7ED957', '#1E9E4A', '#20C9C9',
                '#1E88FF', '#8E5CF0', '#FF6FB5', '#8B5A2B', '#222222', '#FFFFFF',
                '#FFB3C7', '#FFC9A0', '#FFF08A', '#BDF5A0', '#9FE8E0', '#A5D3FF',
                '#D5B8FF', '#C0392B', '#0B4F9C', '#E6A15B', '#F2D2B0', '#808080'];
  var NOTES = [262, 294, 330, 392, 440, 523, 587, 659, 784, 880, 1047, 1175];
  var SIZES = [14, 30, 56];
  var UNDO_MAX = 6;
  var STAMPS = { star: 1, heart: 1 };

  function $(id) { return document.getElementById(id); }
  var screens = { home: $('home'), worlds: $('worlds'), gallery: $('gallery'), editor: $('editor') };
  var current = 'home';
  function show(name) {
    current = name; for (var k in screens) screens[k].hidden = (k !== name);
    if (name === 'editor') fit();
  }

  var paint = $('paint'), tmp = $('tmp'), lines = $('lines'), stage = $('stage'), area = $('area');
  var pctx = paint.getContext('2d');   // sem willReadFrequently: fica na placa de vídeo (rápido no iPad)
  var tctx = tmp.getContext('2d');
  var lctx = lines.getContext('2d');
  var scratch = document.createElement('canvas'), maskCv = document.createElement('canvas');
  var sctx = scratch.getContext('2d'), mctx = maskCv.getContext('2d');
  var labels = null, regBox = [], maskImg = null, maskId = -1, dc = null, clipOn = false, pool = [];
  function setDims(w, h) {
    labels = null; maskId = -1;
    if (w === W && h === H && paint.width === w) { [paint, tmp, lines, scratch, maskCv].forEach(function (c) { c.getContext('2d').clearRect(0, 0, w, h); }); return; }
    W = w; H = h; pool = []; maskImg = null;
    [paint, tmp, lines, scratch, maskCv].forEach(function (c) { c.width = w; c.height = h; });
  }
  setDims(1200, 900);

  var mode = 'draw', tool = 'pencil', lastTool = 'pencil', colorIdx = 0, sizeIdx = 1, muted = false;
  var lineAlpha = null, curPage = null, pageId = 'livre';
  var undoStack = [], redoStack = [], workDirty = false;

  /* ---------- sons ---------- */
  var actx = null;
  function audio() {
    if (muted) return null;
    if (!actx) { var C = window.AudioContext || window.webkitAudioContext; if (C) actx = new C(); }
    if (actx && actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(f, dur, type, vol, delay, to) {
    var a = audio(); if (!a) return;
    var t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol || 0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  var snd = {
    tap: function () { tone(660, 0.07, 'sine', 0.12); },
    color: function (i) { tone(NOTES[i % 12], 0.18, 'triangle', 0.18); },
    fill: function (i) { var n = NOTES[i % 12]; tone(n / 2, 0.12, 'sine', 0.2, 0, n); tone(n, 0.22, 'triangle', 0.15, 0.08); },
    stamp: function () { tone(880, 0.06, 'triangle', 0.1); },
    undo: function () { tone(500, 0.12, 'sine', 0.14, 0, 300); },
    clear: function () { tone(700, 0.3, 'sawtooth', 0.05, 0, 120); },
    save: function () { tone(523, 0.12, 'triangle', 0.18); tone(659, 0.12, 'triangle', 0.18, 0.1); tone(784, 0.25, 'triangle', 0.18, 0.2); }
  };

  /* ---------- ícones SVG de tela cheia ---------- */
  var ICON_FULL = '<svg viewBox="0 0 24 24" fill="none" stroke="#1b3a63" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  var ICON_EXIT = '<svg viewBox="0 0 24 24" fill="none" stroke="#1b3a63" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';

  /* ---------- paleta ---------- */
  var swWrap = $('swatches');
  COLORS.forEach(function (c, i) {
    var b = document.createElement('button');
    b.className = 'sw'; b.style.background = c; b.setAttribute('aria-label', 'Cor ' + (i + 1));
    b.addEventListener('click', function () {
      colorIdx = i; if (tool === 'eraser') tool = lastTool;
      refreshUI(); snd.color(i);
    });
    swWrap.appendChild(b);
  });
  if (LAYOUT === 'a') $('strip').appendChild(swWrap);   // v2a: cores na mesma faixa rolante
  var swatches = swWrap.children;
  var toolBtns = Array.prototype.slice.call(document.querySelectorAll('[data-tool]'));
  var sizeBtns = Array.prototype.slice.call(document.querySelectorAll('.size'));
  toolBtns.forEach(function (b) { b.addEventListener('click', function () { snd.tap(); setTool(b.getAttribute('data-tool')); }); });
  sizeBtns.forEach(function (b) { b.addEventListener('click', function () { sizeIdx = +b.getAttribute('data-s'); snd.tap(); refreshUI(); }); });

  function setTool(t) { tool = t; if (t !== 'eraser') lastTool = t; refreshUI(); }
  function refreshUI() {
    for (var i = 0; i < swatches.length; i++) swatches[i].classList.toggle('on', i === colorIdx && tool !== 'eraser');
    toolBtns.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tool') === tool); });
    sizeBtns.forEach(function (b) {
      b.classList.toggle('on', +b.getAttribute('data-s') === sizeIdx);
      b.firstElementChild.style.background = COLORS[colorIdx] === '#FFFFFF' ? '#bbb' : COLORS[colorIdx];
    });
    var chalkBtn = document.querySelector('[data-tool="chalk"]'); if (chalkBtn) chalkBtn.innerHTML = crayonIconSVG(COLORS[colorIdx]);
    $('bBucket').hidden = (mode !== 'color');
    $('bUndo').disabled = !undoStack.length; $('bRedo').disabled = !redoStack.length;
    $('bZoom').hidden = zs <= 1.02;
    $('bSound').textContent = muted ? '🔇' : '🔊';
    var fs = fsOn(); $('bFull').innerHTML = $('hFull').innerHTML = fs ? ICON_EXIT : ICON_FULL;
  }

  /* ---------- tela cheia e barra de ferramentas ---------- */
  var pseudoFull = false;
  function fsOn() { return !!(document.fullscreenElement || document.webkitFullscreenElement) || pseudoFull; }
  function setBar() {}   // as ferramentas ficam sempre visíveis (quem usa é a criança)
  function toggleFull() {
    var de = document.documentElement, rq = de.requestFullscreen || de.webkitRequestFullscreen;
    if (fsOn()) {
      var ex = document.exitFullscreen || document.webkitExitFullscreen;
      if ((document.fullscreenElement || document.webkitFullscreenElement) && ex) { try { var r = ex.call(document); if (r && r.catch) r.catch(function () {}); } catch (e) {} }
      pseudoFull = false; setBar(false);
    } else {
      if (rq) { try { var p = rq.call(de); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
      pseudoFull = true; setBar(true);   // sem API de tela cheia (iPhone): só esconde as ferramentas
    }
    refreshUI(); setTimeout(fit, 120);
  }
  function onFsChange() {
    if (!(document.fullscreenElement || document.webkitFullscreenElement) && pseudoFull && (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)) {
      pseudoFull = false; setBar(false);
    }
    refreshUI(); setTimeout(function () { fit(); checkOrientation(); }, 250);
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
  $('bFull').addEventListener('click', function () { snd.tap(); toggleFull(); });
  $('hFull').addEventListener('click', function () { snd.tap(); toggleFull(); });

  /* ---------- tamanho do desenho (ocupa o máximo da tela) ---------- */
  var zs = 1, zx = 0, zy = 0;
  function applyZoom() { stage.style.transform = 'translate(' + zx + 'px,' + zy + 'px) scale(' + zs + ')'; }
  function resetZoom() { zs = 1; zx = zy = 0; applyZoom(); refreshUI(); }
  function fit() {
    var r = area.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var bd = 14, k = Math.min((r.width - bd) / W, (r.height - bd) / H);   // a moldura (14px) conta fora do desenho: encosta no topo e no fundo
    stage.style.width = Math.floor(W * k + bd) + 'px'; stage.style.height = Math.floor(H * k + bd) + 'px';
    if (zs !== 1) resetZoom();
  }
  if (window.ResizeObserver) new ResizeObserver(fit).observe(area);
  var rzTimer = null;
  function onResize() { fit(); clearTimeout(rzTimer); rzTimer = setTimeout(checkOrientation, 200); }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', function () { setTimeout(onResize, 200); });

  // o quadro de desenho tem o formato da área livre da tela (celular em pé, deitado, tablet)
  function dimsFor() {
    var ar = area.getBoundingClientRect(), aw, ah;
    if (ar.width > 50 && ar.height > 50) { aw = ar.width - 14; ah = ar.height - 14; }   // mede a área livre de verdade (já sem as barras e recortes da tela)
    else { aw = window.innerWidth - 14 - (LAYOUT === 'b' ? 258 : 0); ah = window.innerHeight - 14 - (LAYOUT === 'a' ? 78 : 0); }
    var r = aw / ah, w, h;
    if (r >= 1) { h = 900; w = Math.max(900, Math.min(2600, Math.round(900 * r))); }
    else { w = 900; h = Math.max(900, Math.min(2600, Math.round(900 / r))); }
    return [w - (w % 2), h - (h % 2)];
  }
  // desenha uma imagem antiga no quadro novo mantendo a escala do desenho (a página fica alinhada)
  function drawScaled(src, sw, sh) {
    var k = Math.min(W / 400, H / 300) / Math.min(sw / 400, sh / 300), dw = sw * k, dh = sh * k;
    pctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
  }
  function checkOrientation() {
    if (current !== 'editor') return;
    var d = dimsFor();
    if (Math.abs(d[0] - W) / W < 0.03 && Math.abs(d[1] - H) / H < 0.03) return;   // refaz quando o formato da área muda (girar, tela cheia)
    var tc = document.createElement('canvas'); tc.width = W; tc.height = H;
    tc.getContext('2d').drawImage(paint, 0, 0);
    var ow = W, oh = H;
    setDims(d[0], d[1]); drawScaled(tc, ow, oh);
    undoStack = []; redoStack = [];
    setLines(curPage); fit(); refreshUI();
  }

  /* ---------- desfazer / refazer ---------- */
  // o histórico guarda cópias da tela (canvas -> canvas, rápido) em vez de ler pixel por pixel
  function takeSnap() {
    var c = pool.pop();
    if (!c) { c = document.createElement('canvas'); c.width = W; c.height = H; }
    var x = c.getContext('2d'); x.globalCompositeOperation = 'copy'; x.drawImage(paint, 0, 0); x.globalCompositeOperation = 'source-over';
    return c;
  }
  function freeSnap(c) { if (c && c.width === W && c.height === H) pool.push(c); }
  function restoreSnap(c) { pctx.globalCompositeOperation = 'copy'; pctx.drawImage(c, 0, 0); pctx.globalCompositeOperation = 'source-over'; }
  function resetHistory() { undoStack.forEach(freeSnap); redoStack.forEach(freeSnap); undoStack = []; redoStack = []; }
  function snapshot() {
    workDirty = true; undoStack.push(takeSnap()); if (undoStack.length > UNDO_MAX) freeSnap(undoStack.shift());
    redoStack.forEach(freeSnap); redoStack = []; refreshUI();
  }
  function undo() { var s = undoStack.pop(); if (!s) return; workDirty = true; redoStack.push(takeSnap()); restoreSnap(s); freeSnap(s); snd.undo(); refreshUI(); }
  function redo() { var s = redoStack.pop(); if (!s) return; workDirty = true; undoStack.push(takeSnap()); restoreSnap(s); freeSnap(s); snd.undo(); refreshUI(); }

  /* ---------- pincéis ---------- */
  function pos(e) {
    var r = (drawing && prect) ? prect : paint.getBoundingClientRect();
    return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
  }
  var mkPts = [];
  // marcador: redesenha o risco inteiro a cada movimento por cima do papel de antes (sem camada temporária)
  function markerRedraw() {
    var base = undoStack[undoStack.length - 1]; if (!base || !mkPts.length) return;
    restoreSnap(base);
    var c = clipOn ? sctx : pctx, w = SIZES[sizeIdx] * 1.5, p = mkPts;
    if (clipOn) sctx.clearRect(0, 0, W, H);
    c.save(); c.globalAlpha = clipOn ? 1 : 0.55; c.globalCompositeOperation = 'source-over';
    c.strokeStyle = c.fillStyle = COLORS[colorIdx]; c.lineWidth = w; c.lineCap = c.lineJoin = 'round';
    c.beginPath();
    if (p.length < 2) { c.arc(p[0][0], p[0][1], w / 2, 0, 6.283); c.fill(); }
    else {
      c.moveTo(p[0][0], p[0][1]);
      for (var i = 1; i < p.length - 1; i++) c.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
      c.lineTo(p[p.length - 1][0], p[p.length - 1][1]); c.stroke();
    }
    c.restore();
    if (clipOn) {
      sctx.globalCompositeOperation = 'destination-in'; sctx.drawImage(maskCv, 0, 0); sctx.globalCompositeOperation = 'source-over';
      pctx.globalAlpha = 0.55; pctx.drawImage(scratch, 0, 0); pctx.globalAlpha = 1;
    }
  }
  function flushClip(x0, y0, x1, y1) {   // só marca a área suja; o recorte é feito 1x por quadro
    if (!clipOn || tool === 'marker') return;
    var p = SIZES[sizeIdx] * 3 + 6;
    var bx = Math.min(x0, x1) - p, by = Math.min(y0, y1) - p, ex = Math.max(x0, x1) + p, ey = Math.max(y0, y1) + p;
    if (!dirty) dirty = [bx, by, ex, ey];
    else { dirty[0] = Math.min(dirty[0], bx); dirty[1] = Math.min(dirty[1], by); dirty[2] = Math.max(dirty[2], ex); dirty[3] = Math.max(dirty[3], ey); }
    if (!raf) raf = requestAnimationFrame(doFlush);
  }
  function doFlush() {
    raf = 0; if (!dirty) return;
    var bx = Math.max(0, Math.floor(dirty[0])), by = Math.max(0, Math.floor(dirty[1]));
    var bw = Math.min(W, Math.ceil(dirty[2])) - bx, bh = Math.min(H, Math.ceil(dirty[3])) - by;
    dirty = null;
    if (bw <= 0 || bh <= 0) return;
    var c = tool === 'marker' ? tctx : sctx;
    c.globalCompositeOperation = 'destination-in'; c.drawImage(maskCv, bx, by, bw, bh, bx, by, bw, bh);
    c.globalCompositeOperation = 'source-over';
    if (tool !== 'marker') { pctx.drawImage(scratch, bx, by, bw, bh, bx, by, bw, bh); sctx.clearRect(bx, by, bw, bh); }
  }
  function setup(c, comp) {
    c.globalCompositeOperation = comp || 'source-over';
    c.strokeStyle = c.fillStyle = COLORS[colorIdx]; c.lineCap = c.lineJoin = 'round';
    c.lineWidth = SIZES[sizeIdx] * (tool === 'eraser' ? 1.6 : tool === 'marker' ? 1.5 : 1);
  }
  function star(c, x, y, r) {
    c.beginPath();
    for (var k = 0; k < 10; k++) {
      var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r;
      c[k ? 'lineTo' : 'moveTo'](x + rr * Math.cos(a), y + rr * Math.sin(a));
    }
    c.closePath(); c.fill();
  }
  function heart(c, x, y, r) {
    c.beginPath(); c.moveTo(x, y + r * 0.9);
    c.bezierCurveTo(x - r * 1.6, y - r * 0.1, x - r * 0.8, y - r * 1.1, x, y - r * 0.35);
    c.bezierCurveTo(x + r * 0.8, y - r * 1.1, x + r * 1.6, y - r * 0.1, x, y + r * 0.9);
    c.fill();
  }
  function stampAt(x, y) {
    setup(dc); var r = SIZES[sizeIdx] * 1.6;
    (tool === 'star' ? star : heart)(dc, x, y, r);
  }
  function chalkAt(x, y) {
    setup(dc); var s = SIZES[sizeIdx] * 1.1;
    for (var i = 0; i < 7; i++) {
      var a = Math.random() * 6.283, d = Math.random() * s * 0.55;
      dc.globalAlpha = 0.5 + Math.random() * 0.5;
      dc.beginPath(); dc.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1 + Math.random() * 2.4, 0, 6.283); dc.fill();
    }
    dc.globalAlpha = 1;
  }

  var prect = null, dirty = null, raf = 0;
  var drawing = false, lx = 0, ly = 0, mx = 0, my = 0, sx = 0, sy = 0, hue = 0;
  function beginStroke(p) {
    snapshot(); drawing = true; prect = paint.getBoundingClientRect();
    lx = mx = sx = p[0]; ly = my = sy = p[1]; hue = Math.random() * 360;
    // modo colorir: o pincel só pinta dentro do espaço onde o dedo encostou primeiro
    clipOn = (mode === 'color' && !!labels && tool !== 'eraser');
    if (clipOn) buildMask(regionAt(p[0], p[1]));
    dc = (clipOn && tool !== 'marker') ? sctx : pctx;
    switch (tool) {
      case 'pencil': case 'eraser':
        setup(dc, tool === 'eraser' ? 'destination-out' : null);
        dc.beginPath(); dc.arc(lx, ly, dc.lineWidth / 2, 0, 6.283); dc.fill(); break;
      case 'marker': mkPts = [[lx, ly]]; markerRedraw(); break;
      case 'chalk': chalkAt(lx, ly); break;
      case 'rainbow':
        setup(dc); dc.fillStyle = 'hsl(' + hue + ',95%,55%)';
        dc.beginPath(); dc.arc(lx, ly, dc.lineWidth / 2, 0, 6.283); dc.fill(); break;
      default: stampAt(lx, ly); snd.stamp();
    }
    flushClip(lx, ly, lx, ly);
  }
  function strokeTo(x, y) {
    var ox = lx, oy = ly;
    switch (tool) {
      case 'marker': mkPts.push([x, y]); break;
      case 'pencil': case 'eraser':
        var c = dc;
        setup(c, tool === 'eraser' ? 'destination-out' : null);
        var cx = (lx + x) / 2, cy = (ly + y) / 2;
        c.beginPath(); c.moveTo(mx, my); c.quadraticCurveTo(lx, ly, cx, cy); c.stroke();
        mx = cx; my = cy; break;
      case 'chalk':
        var d = Math.hypot(x - lx, y - ly), step = Math.max(3, SIZES[sizeIdx] / 5), n = Math.max(1, Math.round(d / step));
        for (var i = 1; i <= n; i++) chalkAt(lx + (x - lx) * i / n, ly + (y - ly) * i / n);
        break;
      case 'rainbow':
        var dd = Math.hypot(x - lx, y - ly); hue = (hue + dd * 0.8) % 360;
        setup(dc); dc.strokeStyle = 'hsl(' + hue + ',95%,55%)';
        dc.beginPath(); dc.moveTo(lx, ly); dc.lineTo(x, y); dc.stroke(); break;
      default:
        if (Math.hypot(x - sx, y - sy) >= SIZES[sizeIdx] * 2.6) { stampAt(x, y); sx = x; sy = y; snd.stamp(); }
    }
    flushClip(ox, oy, x, y);
    lx = x; ly = y;
  }
  function endStroke() {
    if (!drawing) return; drawing = false;
    if (tool === 'pencil' || tool === 'eraser') {
      var c = dc;
      setup(c, tool === 'eraser' ? 'destination-out' : null);
      c.beginPath(); c.moveTo(mx, my); c.lineTo(lx, ly); c.stroke();
      flushClip(mx, my, lx, ly);
    }
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    doFlush();
    if (tool === 'marker') markerRedraw();
    pctx.globalCompositeOperation = 'source-over'; pctx.globalAlpha = 1; sctx.globalAlpha = 1; clipOn = false;
  }
  function cancelStroke() {
    if (!drawing) return; hideCursor(); drawing = false; clipOn = false; dirty = null; if (raf) { cancelAnimationFrame(raf); raf = 0; } tctx.clearRect(0, 0, W, H); sctx.clearRect(0, 0, W, H);
    var s = undoStack.pop(); if (s) { restoreSnap(s); freeSnap(s); }
    pctx.globalCompositeOperation = 'source-over'; pctx.globalAlpha = 1; refreshUI();
  }

  /* ---------- ferramenta na ponta do dedo (mostra qual está em uso) ---------- */
  // giz desenhado na cor escolhida (o emoji é sempre vermelho)
  function crayonParts(c) {
    return '<path d="M-30 -205 L-11 -262 Q0 -274 11 -262 L30 -205 Z" fill="' + c + '"/>' +
      '<path d="M-30 -205 L30 -205 L30 -14 Q30 0 16 0 L-16 0 Q-30 0 -30 -14 Z" fill="' + c + '"/>' +
      '<rect x="-30" y="-165" width="60" height="100" fill="#fff" stroke-width="7"/>' +
      '<path d="M-30 -150 L30 -150 M-30 -80 L30 -80" stroke="' + c + '" stroke-width="11" fill="none"/>' +
      '<rect x="-20" y="-200" width="8" height="180" rx="4" fill="#fff" opacity=".4" stroke="none"/>';
  }
  var CR_ST = ' stroke="#1b3a63" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"';
  function crayonCursorSVG(c) {   // ponta embaixo à esquerda, corpo para cima e para a direita
    return '<svg viewBox="-20 -240 260 260" style="display:block;width:108px;height:108px"><g transform="rotate(225) translate(0,262)"' + CR_ST + '>' + crayonParts(c) + '</g></svg>';
  }
  function crayonIconSVG(c) {     // para o botão da barra (em pé)
    return '<svg viewBox="-42 -282 84 296" style="display:block;width:30px;height:52px"><g' + CR_ST + '>' + crayonParts(c) + '</g></svg>';
  }
  var TOOL_EMOJI = { pencil: '🖌️', chalk: '🖍️', marker: '🖊️', rainbow: '🌈', star: '⭐', heart: '❤️', eraser: '🧽' };
  var cur = document.createElement('div'); cur.id = 'cursor'; cur.hidden = true;
  var curRing = document.createElement('i'), curTip = document.createElement('b');
  curRing.className = 'ring'; curTip.className = 'tip'; cur.appendChild(curRing); cur.appendChild(curTip); document.body.appendChild(cur);
  function showCursor(x, y) {
    var r = paint.getBoundingClientRect(), mult = tool === 'eraser' ? 1.6 : tool === 'marker' ? 1.5 : tool === 'chalk' ? 1.1 : 1;
    var d = Math.max(8, SIZES[sizeIdx] * mult * r.width / W), stamp = (tool === 'star' || tool === 'heart' || tool === 'rainbow');
    if (tool === 'chalk') curTip.innerHTML = crayonCursorSVG(COLORS[colorIdx]); else curTip.textContent = TOOL_EMOJI[tool] || '';
    curTip.style.fontSize = (tool === 'pencil' || tool === 'chalk' || tool === 'marker' ? 92 : 64) + 'px';
    curTip.className = 'tip' + (tool === 'eraser' || stamp ? ' mid' : '');
    curRing.style.display = (tool === 'star' || tool === 'heart') ? 'none' : 'block';
    curRing.style.width = curRing.style.height = d + 'px';
    curRing.style.background = tool === 'eraser' ? 'rgba(255,255,255,.35)' : (tool === 'rainbow' ? 'rgba(255,255,255,.2)' : COLORS[colorIdx] + 'aa');
    cur.hidden = false; moveCursor(x, y);
  }
  function moveCursor(x, y) { cur.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
  function hideCursor() { cur.hidden = true; }

  /* ---------- toques: desenhar com 1 dedo, zoom/mover com 2 dedos ---------- */
  var ptrs = {}, pinch = null, blocked = false, tap = null;
  function keys() { return Object.keys(ptrs); }
  function startPinch() {
    var k = keys(), a = ptrs[k[0]], b = ptrs[k[1]];
    pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, s0: zs, x0: zx, y0: zy };
  }
  function doPinch() {
    var k = keys(), a = ptrs[k[0]], b = ptrs[k[1]]; if (!a || !b) return;
    var d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    var r = area.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var ns = Math.max(1, Math.min(4, pinch.s0 * d / pinch.d0));
    var qx = (pinch.mx - cx - pinch.x0) / pinch.s0, qy = (pinch.my - cy - pinch.y0) / pinch.s0;
    zx = m.x - cx - ns * qx; zy = m.y - cy - ns * qy; zs = ns;
    var lim_x = Math.max(0, (zs * stage.offsetWidth - r.width) / 2) + 40, lim_y = Math.max(0, (zs * stage.offsetHeight - r.height) / 2) + 40;
    zx = Math.max(-lim_x, Math.min(lim_x, zx)); zy = Math.max(-lim_y, Math.min(lim_y, zy));
    applyZoom();
  }
  stage.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
    try { stage.setPointerCapture(e.pointerId); } catch (x) {}
    if (keys().length >= 2) { cancelStroke(); tap = null; blocked = true; startPinch(); return; }
    if (blocked) return;
    var p = pos(e);
    if (tool === 'bucket') { tap = { x: e.clientX, y: e.clientY, px: p[0], py: p[1] }; return; }
    beginStroke(p); showCursor(e.clientX, e.clientY);
  });
  stage.addEventListener('pointermove', function (e) {
    var q = ptrs[e.pointerId]; if (!q) return;
    q.x = e.clientX; q.y = e.clientY;
    if (pinch) { doPinch(); return; }
    if (!drawing || blocked) return;
    e.preventDefault();
    var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    if (!evs.length) evs = [e];
    evs.forEach(function (ev) { var p = pos(ev); strokeTo(p[0], p[1]); });
    if (tool === 'marker') markerRedraw();
    moveCursor(e.clientX, e.clientY);
  });
  function up(e) {
    var q = ptrs[e.pointerId]; if (!q) return;
    hideCursor();
    if (tap && !blocked && e.type === 'pointerup' && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 14) {
      snapshot();
      if (bucket(tap.px, tap.py, COLORS[colorIdx])) { snd.fill(colorIdx); sparkle(tap.x, tap.y); } else { freeSnap(undoStack.pop()); refreshUI(); }
    }
    tap = null; delete ptrs[e.pointerId];
    if (drawing) endStroke();
    if (keys().length < 2 && pinch) { pinch = null; if (zs < 1.08) resetZoom(); else refreshUI(); }
    if (!keys().length) blocked = false;
  }
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  /* ---------- faíscas de alegria ---------- */
  function sparkle(x, y) {
    var icons = ['✨', '⭐', '💫', '✨', '🌟', '✨'];
    for (var i = 0; i < 6; i++) {
      var s = document.createElement('span'), ang = (i / 6) * 6.283 + Math.random() * 0.6, dist = 50 + Math.random() * 40;
      s.className = 'spark'; s.textContent = icons[i];
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(ang) * dist + 'px'); s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      document.body.appendChild(s);
      setTimeout(function (el) { el.remove(); }, 750, s);
    }
  }
  /* título colorido da tela inicial */
  (function () {
    var t = 'Colorir e Desenhar', box = $('logo');
    for (var i = 0; i < t.length; i++) { var s = document.createElement('span'); s.textContent = t[i] === ' ' ? '\u00a0' : t[i]; s.style.setProperty('--i', i); box.appendChild(s); }
  })();

  /* ---------- balde ---------- */
  var THRESH = 25;
  function hexToU32(h) { var n = parseInt(h.slice(1), 16); return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0; }
  function bucket(x, y, hex) {
    if (!lineAlpha) return false;
    x = Math.max(0, Math.min(W - 1, Math.round(x))); y = Math.max(0, Math.min(H - 1, Math.round(y)));
    var la = lineAlpha, seed = y * W + x;
    if (la[seed] > THRESH) {
      seed = -1;
      for (var rad = 1; rad <= 10 && seed < 0; rad++)
        for (var dy = -rad; dy <= rad && seed < 0; dy++)
          for (var dx = -rad; dx <= rad; dx++) {
            var nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            if (la[ny * W + nx] <= THRESH) { seed = ny * W + nx; break; }
          }
      if (seed < 0) return false;
    }
    var img = pctx.getImageData(0, 0, W, H), buf = new Uint32Array(img.data.buffer), col = hexToU32(hex);
    var vis = new Uint8Array(W * H), stack = [seed];
    while (stack.length) {
      var p = stack.pop();
      if (vis[p] || la[p] > THRESH) continue;
      var row = p - (p % W), px = p - row, l = px, r = px;
      while (l > 0 && !vis[row + l - 1] && la[row + l - 1] <= THRESH) l--;
      while (r < W - 1 && !vis[row + r + 1] && la[row + r + 1] <= THRESH) r++;
      for (var i = l; i <= r; i++) { vis[row + i] = 1; buf[row + i] = col; }
      for (var d = -1; d <= 1; d += 2) {
        var nr = row + d * W; if (nr < 0 || nr >= W * H) continue;
        var inSpan = false;
        for (var j = l; j <= r; j++) {
          var blk = vis[nr + j] || la[nr + j] > THRESH;
          if (!blk && !inSpan) { stack.push(nr + j); inSpan = true; } else if (blk) inSpan = false;
        }
      }
    }
    pctx.putImageData(img, 0, 0);
    return true;
  }

  /* ---------- espaços da página (para o pincel não vazar) ---------- */
  function labelRegions(la) {
    var lab = new Int32Array(W * H), id = 0, stack = [], N = W * H; regBox = [];
    for (var s = 0; s < N; s++) {
      if (lab[s] || la[s] > THRESH) continue;
      id++; stack.length = 0; stack.push(s);
      var b0 = W, b1 = H, b2 = 0, b3 = 0;
      while (stack.length) {
        var p = stack.pop();
        if (lab[p] || la[p] > THRESH) continue;
        var row = p - (p % W), px = p - row, l = px, r = px;
        while (l > 0 && !lab[row + l - 1] && la[row + l - 1] <= THRESH) l--;
        while (r < W - 1 && !lab[row + r + 1] && la[row + r + 1] <= THRESH) r++;
        for (var i = l; i <= r; i++) lab[row + i] = id;
        var yy = (row / W) | 0; if (l < b0) b0 = l; if (r > b2) b2 = r; if (yy < b1) b1 = yy; if (yy > b3) b3 = yy;
        for (var d = -1; d <= 1; d += 2) {
          var nr = row + d * W; if (nr < 0 || nr >= N) continue;
          var inSpan = false;
          for (var j = l; j <= r; j++) {
            var blk = lab[nr + j] || la[nr + j] > THRESH;
            if (!blk && !inSpan) { stack.push(nr + j); inSpan = true; } else if (blk) inSpan = false;
          }
        }
      }
      regBox[id] = [b0, b1, b2, b3];
    }
    return lab;
  }
  function regionAt(x, y) {
    x = Math.max(0, Math.min(W - 1, Math.round(x))); y = Math.max(0, Math.min(H - 1, Math.round(y)));
    if (labels[y * W + x]) return labels[y * W + x];
    for (var rad = 1; rad <= 14; rad++)
      for (var dy = -rad; dy <= rad; dy++)
        for (var dx = -rad; dx <= rad; dx++) {
          var nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          if (labels[ny * W + nx]) return labels[ny * W + nx];
        }
    return 0;
  }
  function buildMask(id) {
    if (id === maskId) return; maskId = id;
    mctx.clearRect(0, 0, W, H); if (!id) return;
    var b = regBox[id], x0 = Math.max(0, b[0] - 4), y0 = Math.max(0, b[1] - 4), x1 = Math.min(W - 1, b[2] + 4), y1 = Math.min(H - 1, b[3] + 4);
    if (!maskImg) maskImg = mctx.createImageData(W, H);
    var d = maskImg.data, lab = labels;
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
      var i = y * W + x, v = lab[i], on = (v === id);
      if (!on && v === 0) on = (x >= 3 && lab[i - 3] === id) || (x < W - 3 && lab[i + 3] === id) || (y >= 3 && lab[i - 3 * W] === id) || (y < H - 3 && lab[i + 3 * W] === id);
      d[i * 4 + 3] = on ? 255 : 0;
    }
    mctx.putImageData(maskImg, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  }

  /* ---------- páginas ---------- */
  function svgUrl(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
  function setLines(page, done) {
    lctx.clearRect(0, 0, W, H); labels = null;
    if (!page) { lineAlpha = null; done && done(); return; }
    var img = new Image(), w = W, h = H;
    img.onload = function () {
      if (w !== W || h !== H) return;   // girou de novo enquanto carregava
      var t = document.createElement('canvas'); t.width = W; t.height = H;
      var c = t.getContext('2d', { willReadFrequently: true });
      c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
      var pk = Math.min(W / 400, H / 300), pw = 400 * pk, ph = 300 * pk; c.drawImage(img, (W - pw) / 2, (H - ph) / 2, pw, ph);
      var src = c.getImageData(0, 0, W, H).data, out = lctx.createImageData(W, H), a = new Uint8Array(W * H);
      for (var i = 0, n = W * H; i < n; i++) { var v = 255 - src[i * 4]; a[i] = v; out.data[i * 4 + 3] = v; }
      lctx.putImageData(out, 0, 0); lineAlpha = a; labels = labelRegions(a); maskId = -1; done && done();
    };
    img.src = svgUrl(page.svg);
  }

  /* ---------- guardar o desenho no aparelho (nunca sai do aparelho) ---------- */
  var DB = null, saved = {}, cardImgs = {};
  function dbOpen(cb) {
    try {
      var rq = indexedDB.open('colorir-obras', 1);
      rq.onupgradeneeded = function () { rq.result.createObjectStore('obras'); };
      rq.onsuccess = function () { DB = rq.result; cb(); };
      rq.onerror = function () { cb(); };
    } catch (e) { cb(); }
  }
  function dbPut(id, rec) { if (!DB) return; try { DB.transaction('obras', 'readwrite').objectStore('obras').put(rec, id); } catch (e) {} }
  function dbLoadAll(done) {
    if (!DB) { done(); return; }
    try {
      var rq = DB.transaction('obras').objectStore('obras').openCursor();
      rq.onsuccess = function () { var c = rq.result; if (c) { saved[c.key] = c.value; c['continue'](); } else done(); };
      rq.onerror = function () { done(); };
    } catch (e) { done(); }
  }
  function refreshThumbs() {
    window.PAGES.forEach(function (p) { var ims = cardImgs[p.id]; if (ims) { var u = saved[p.id] ? saved[p.id].thumb : svgUrl(p.svg); ims.forEach(function (im) { im.src = u; }); } });
    var dt = $('drawThumb'); if (saved.livre) { dt.src = saved.livre.thumb; dt.hidden = false; } else dt.hidden = true;
  }
  function saveWork(cb) {
    if (!workDirty) { cb && cb(); return; }
    workDirty = false;
    var id = pageId, w = W, h = H, k = Math.min(W / 400, H / 300), cw = 400 * k, ch = 300 * k;
    var tc = document.createElement('canvas'); tc.width = 360; tc.height = 270;
    var x = tc.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 360, 270);
    x.drawImage(paint, (W - cw) / 2, (H - ch) / 2, cw, ch, 0, 0, 360, 270);
    x.drawImage(lines, (W - cw) / 2, (H - ch) / 2, cw, ch, 0, 0, 360, 270);
    var thumb = tc.toDataURL('image/jpeg', 0.82);
    paint.toBlob(function (blob) {
      if (blob) { var rec = { blob: blob, w: w, h: h, thumb: thumb, t: Date.now() }; saved[id] = rec; dbPut(id, rec); }
      refreshThumbs(); cb && cb();
    }, 'image/png');
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden && current === 'editor') saveWork(); });
  window.addEventListener('pagehide', function () { if (current === 'editor') saveWork(); });

  function openEditor(m, page) {
    mode = m; curPage = page; pageId = page ? page.id : 'livre'; resetHistory(); workDirty = false;
    show('editor');   // primeiro mostra a tela, para medir o espaço livre de verdade
    var d = dimsFor(); setDims(d[0], d[1]);
    var rec = saved[pageId], id0 = pageId;
    if (rec) {
      var url = URL.createObjectURL(rec.blob), im = new Image();
      im.onload = function () { if (pageId === id0 && !workDirty) drawScaled(im, rec.w, rec.h); URL.revokeObjectURL(url); };
      im.src = url;
    }
    tool = lastTool = 'pencil';   // sempre começa com o pincel na mão
    resetZoom(); setBar(pseudoFull); refreshUI(); fit();
    setLines(page);
  }
  var curWorld = null, galScroll = 0, islScroll = 0;
  function leaveEditor() {
    saveWork();
    if (mode === 'color') { show('gallery'); $('grid').scrollTop = galScroll; } else show('home');
  }
  function regImg(id, im) { (cardImgs[id] = cardImgs[id] || []).push(im); }

  /* ---------- ilhas (temas) com cartões espalhados; um toque abre a ilha ---------- */
  var pageById = {};
  window.PAGES.forEach(function (p) { pageById[p.id] = p; });
  var LAYOUT7 = [[8, 23, -8], [37, 20, -2], [66, 24, 8], [16, 42, -5], [44, 41, 4], [70, 43, -8]];
  function openWorld(w) {
    curWorld = w; var grid = $('grid'); grid.innerHTML = '';
    (cardImgs.__g || []).forEach(function () {}); 
    window.PAGES.forEach(function (p) { if (cardImgs[p.id]) cardImgs[p.id] = cardImgs[p.id].filter(function (im) { return !im.__g; }); });
    var t = $('galTitle'); t.textContent = w.emoji[0] + ' ' + w.nome; t.style.setProperty('--c', w.pasta || '#4cc15f');
    w.paginas.forEach(function (id) {
      var p = pageById[id]; if (!p) return;
      var b = document.createElement('button'), im = new Image();
      b.className = 'card k' + (grid.children.length % 6); b.setAttribute('aria-label', p.nome); im.alt = ''; im.__g = true;
      b.appendChild(im); regImg(id, im);
      b.addEventListener('click', function () { snd.tap(); galScroll = grid.scrollTop; openEditor('color', p); });
      grid.appendChild(b);
    });
    refreshThumbs(); grid.scrollTop = 0; show('gallery');
  }
  (function buildIslands() {
    var box = $('islands');
    (window.WORLDS || []).forEach(function (w, i) {
      var b = document.createElement('button');
      b.className = 'isl'; b.setAttribute('aria-label', w.nome);
      b.style.setProperty('--img', 'url(img/ilha-' + (i + 1) + '.webp)'); b.style.setProperty('--d', (-i * 1.1) + 's'); b.style.setProperty('--c', w.pasta || '#4cc15f');
      w.paginas.slice(0, 6).forEach(function (id, k) {
        var p = pageById[id]; if (!p) return;
        var L = LAYOUT7[k], m = document.createElement('span'), im = new Image();
        m.className = 'mini'; m.style.left = L[0] + '%'; m.style.top = L[1] + '%'; m.style.setProperty('--r', L[2] + 'deg'); m.style.zIndex = 3 + k;
        im.alt = ''; m.appendChild(im); regImg(id, im); b.appendChild(m);
      });
      var nm = document.createElement('span'); nm.className = 'isl-name'; nm.textContent = w.nome; b.appendChild(nm);
      b.addEventListener('click', function () { snd.tap(); islScroll = box.scrollLeft; openWorld(w); });
      box.appendChild(b);
    });
    refreshThumbs();
  })();
  dbOpen(function () { dbLoadAll(refreshThumbs); });

  /* ---------- botões ---------- */
  $('goDraw').addEventListener('click', function () { snd.tap(); openEditor('draw', null); });
  $('goColor').addEventListener('click', function () { snd.tap(); show('worlds'); });
  $('worldsBack').addEventListener('click', function () { snd.tap(); show('home'); });
  $('galBack').addEventListener('click', function () { snd.tap(); show('worlds'); $('islands').scrollLeft = islScroll; });
  $('bBack').addEventListener('click', function () { snd.tap(); leaveEditor(); });
  $('bUndo').addEventListener('click', undo);
  $('bRedo').addEventListener('click', redo);
  $('bClear').addEventListener('click', function () { snapshot(); pctx.clearRect(0, 0, W, H); snd.clear(); });
  $('bZoom').addEventListener('click', function () { snd.tap(); resetZoom(); });
  $('bSound').addEventListener('click', function () { muted = !muted; refreshUI(); snd.tap(); });

  /* ---------- salvar (no celular abre "Salvar imagem" para a galeria) ---------- */
  function toast() { var t = $('toast'); t.hidden = true; void t.offsetWidth; t.hidden = false; setTimeout(function () { t.hidden = true; }, 1000); }
  $('bSave').addEventListener('click', function () {
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(paint, 0, 0); x.drawImage(lines, 0, 0);
    snd.save();
    c.toBlob(function (blob) {
      if (!blob) return;
      var file = null;
      try { file = new File([blob], 'meu-desenho.png', { type: 'image/png' }); } catch (e) {}
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file] }).then(toast, function () {}); return;
      }
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'meu-desenho.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      toast();
    }, 'image/png');
  });

  /* ---------- versão fixa + atualizar ---------- */
  var VER = window.APP_VERSION || '?', verBtn = $('verBtn'), verTxt = $('verTxt'), newVer = null, verTimer = null;
  function verLabel() { verBtn.classList.remove('new'); verTxt.textContent = 'Versão ' + VER + ' · 🔄 Atualizar'; }
  function verSay(t, ms) { verTxt.textContent = t; clearTimeout(verTimer); if (ms) verTimer = setTimeout(function () { newVer ? verNew() : verLabel(); }, ms); }
  function verNew() { verBtn.classList.add('new'); verTxt.textContent = '🆕 Versão ' + newVer + ' · Toque para instalar'; }
  function checkVersion(quiet) {
    if (!/^https?:$/.test(location.protocol)) { if (!quiet) verSay('Abra pelo site para atualizar', 3000); return; }
    if (!quiet) verSay('Procurando…');
    fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.versao && j.versao !== VER) { newVer = j.versao; verNew(); }
      else if (!quiet) verSay('Versão ' + VER + ' · ✓ em dia', 2500);
    }).catch(function () { if (!quiet) verSay('Sem internet', 2500); });
  }
  function installNew() {
    verSay('Atualizando…');
    var done = function () { location.reload(); };
    var p = [];
    if (navigator.serviceWorker) p.push(navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); }));
    if (window.caches) p.push(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); }));
    Promise.all(p).then(done, done);
  }
  verBtn.addEventListener('click', function () { if (newVer) installNew(); else checkVersion(false); });
  verLabel(); checkVersion(true);

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
  refreshUI();
})();
