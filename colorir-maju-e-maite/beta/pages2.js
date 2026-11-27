/* Mais páginas para colorir, organizadas em "ilhas" (mundos).
   Cada desenho é um SVG 400x300 feito à mão: contornos pretos, formas brancas.
   Para criar uma nova página: copie um bloco add(...) e depois coloque o id em uma ilha (WORLDS, no fim). */
(function () {
  var P = window.PAGES;

  function wrap(b) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="1200" height="900">' +
      '<rect width="400" height="300" fill="#fff" stroke="none"/>' +
      '<g fill="#fff" stroke="#000" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">' + b + '</g></svg>';
  }
  function add(id, nome, body) { P.push({ id: id, nome: nome, svg: wrap(body) }); }

  /* peças reutilizáveis */
  function tube(d, w) {   // "cano" com contorno (rabos, pescoços, troncos)
    return '<path d="' + d + '" fill="none" stroke-width="' + (w + 10) + '"/><path d="' + d + '" fill="none" stroke="#fff" stroke-width="' + w + '"/>';
  }
  function star(cx, cy, R, r) {
    var pts = [];
    for (var k = 0; k < 10; k++) {
      var a = -Math.PI / 2 + k * Math.PI / 5, rad = k % 2 ? r : R;
      pts.push((cx + rad * Math.cos(a)).toFixed(1) + ' ' + (cy + rad * Math.sin(a)).toFixed(1));
    }
    return '<path d="M' + pts.join(' L') + ' Z"/>';
  }
  function cloud(x, y, s) {
    return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" stroke-width="' + (5 / s) + '" d="M40 70 Q40 40 70 45 Q85 20 115 40 Q145 35 145 65 Q145 80 125 80 L55 80 Q40 80 40 70 Z"/>';
  }
  function eye(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 8) + '" fill="#000"/>'; }
  var GROUND = '<path d="M10 290 L390 290" fill="none"/>';

  /* ======== BICHINHOS ======== */
  add('cachorro', 'Cachorrinho',
    '<ellipse cx="108" cy="135" rx="30" ry="58" transform="rotate(-14 108 135)"/>' +
    '<ellipse cx="292" cy="135" rx="30" ry="58" transform="rotate(14 292 135)"/>' +
    '<circle cx="200" cy="150" r="85"/>' +
    '<ellipse cx="200" cy="188" rx="46" ry="36"/>' +
    '<ellipse cx="200" cy="170" rx="17" ry="12" fill="#000"/>' +
    eye(165, 128, 9) + eye(235, 128, 9) +
    '<path d="M200 182 L200 196 M200 196 Q185 210 170 198 M200 196 Q215 210 230 198" fill="none"/>' +
    '<path d="M190 206 Q200 240 212 206 Z"/>' +
    '<path d="M135 238 Q200 268 265 238 L270 258 Q200 290 130 258 Z"/><circle cx="200" cy="276" r="12"/>');

  var mane = '', mane2 = '';
  for (var m = 0; m < 12; m++) {
    var ma = m * Math.PI / 6, mx = (200 + 80 * Math.cos(ma)).toFixed(1), my = (150 + 80 * Math.sin(ma)).toFixed(1);
    mane += '<circle cx="' + mx + '" cy="' + my + '" r="30"/>'; mane2 += '<circle cx="' + mx + '" cy="' + my + '" r="30"/>';
  }
  add('leao', 'Leãozinho',
    '<g stroke-width="10">' + mane + '</g><g stroke="none">' + mane2 + '</g>' +
    '<circle cx="148" cy="98" r="16"/><circle cx="252" cy="98" r="16"/>' +
    '<circle cx="200" cy="150" r="62"/>' +
    eye(178, 135, 7) + eye(222, 135, 7) +
    '<ellipse cx="200" cy="178" rx="27" ry="17"/>' +
    '<path d="M188 156 L212 156 L200 170 Z" fill="#000"/>' +
    '<path d="M200 170 L200 180 M200 180 Q188 192 177 182 M200 180 Q212 192 223 182" fill="none"/>');

  add('elefante', 'Elefantinho',
    '<circle cx="108" cy="135" r="56"/><circle cx="292" cy="135" r="56"/>' +
    tube('M200 150 Q198 232 228 246 Q252 256 254 232', 30) +
    '<circle cx="200" cy="135" r="76"/>' +
    '<circle cx="108" cy="135" r="30"/><circle cx="292" cy="135" r="30"/>' +
    eye(168, 118, 8) + eye(232, 118, 8) +
    '<path d="M170 158 Q200 175 230 158" fill="none"/>');

  /* ======== CASINHAS ======== */
  var win = '';
  [[125, 60], [185, 60], [245, 60], [125, 100], [185, 100], [245, 100], [125, 140], [185, 140], [245, 140], [125, 180], [185, 180], [245, 180]].forEach(function (w) {
    win += '<rect x="' + w[0] + '" y="' + w[1] + '" width="32" height="28"/>';
  });
  add('predio', 'Prédio',
    '<circle cx="355" cy="42" r="24"/>' +
    '<rect x="290" y="150" width="75" height="140"/><rect x="305" y="165" width="20" height="20"/><rect x="335" y="165" width="20" height="20"/><rect x="305" y="205" width="20" height="20"/><rect x="335" y="205" width="20" height="20"/>' +
    '<rect x="30" y="190" width="75" height="100"/><rect x="45" y="205" width="20" height="20"/><rect x="75" y="205" width="20" height="20"/><rect x="45" y="245" width="20" height="20"/>' +
    '<rect x="110" y="45" width="180" height="245"/>' + '<path d="M200 45 L200 15" fill="none"/><circle cx="200" cy="12" r="5"/>' + win +
    '<rect x="172" y="232" width="56" height="58" rx="4"/>' + GROUND);

  add('castelo', 'Castelo',
    cloud(300, 5, 0.8) +
    '<rect x="78" y="110" width="62" height="180"/><path d="M70 110 L109 55 L148 110 Z"/>' +
    '<rect x="260" y="110" width="62" height="180"/><path d="M252 110 L291 55 L330 110 Z"/>' +
    '<path d="M109 55 L109 28 M291 55 L291 28" fill="none"/><path d="M109 28 L135 36 L109 45 Z"/><path d="M291 28 L317 36 L291 45 Z"/>' +
    '<rect x="140" y="130" width="120" height="160"/>' +
    '<rect x="140" y="112" width="22" height="18"/><rect x="170" y="112" width="22" height="18"/><rect x="200" y="112" width="22" height="18"/><rect x="230" y="112" width="22" height="18"/>' +
    '<path d="M178 290 L178 235 Q200 205 222 235 L222 290 Z"/>' +
    '<path d="M95 160 L95 140 Q109 125 123 140 L123 160 Z"/><path d="M277 160 L277 140 Q291 125 305 140 L305 160 Z"/>' +
    '<circle cx="200" cy="165" r="14"/>' + GROUND);

  add('celeiro', 'Celeiro',
    '<circle cx="45" cy="45" r="24"/>' +
    '<rect x="335" y="105" width="50" height="185"/><path d="M335 105 Q360 55 385 105 Z"/><path d="M335 150 L385 150 M335 195 L385 195" fill="none"/>' +
    '<path d="M70 290 L70 140 L125 85 L275 85 L330 140 L330 290 Z"/>' +
    '<rect x="172" y="105" width="56" height="34"/><path d="M200 105 L200 139 M172 122 L228 122" fill="none"/>' +
    '<rect x="145" y="170" width="110" height="120"/><path d="M145 170 L255 290 M255 170 L145 290" fill="none"/>' + GROUND);

  add('barraca', 'Barraca',
    '<circle cx="330" cy="55" r="28"/><path d="M345 40 Q325 45 325 62 Q335 58 345 40Z" stroke="none"/>' +
    star(60, 50, 14, 6) + star(130, 30, 10, 4) + star(270, 40, 12, 5) +
    '<path d="M55 290 L200 75 L345 290 Z"/>' +
    '<path d="M165 290 L200 200 L235 290 Z"/>' +
    '<path d="M200 75 L200 45" fill="none"/><path d="M200 45 L232 55 L200 66 Z"/>' +
    '<path d="M100 290 L200 150 L300 290" fill="none"/>' + GROUND);

  /* ======== AUTOMÓVEIS ======== */
  add('onibus', 'Ônibus',
    '<path d="M10 268 L390 268" fill="none"/>' +
    '<rect x="25" y="85" width="350" height="145" rx="24"/>' +
    '<rect x="42" y="105" width="52" height="48" rx="6"/><rect x="104" y="105" width="52" height="48" rx="6"/><rect x="166" y="105" width="52" height="48" rx="6"/><rect x="228" y="105" width="52" height="48" rx="6"/>' +
    '<rect x="296" y="105" width="64" height="104" rx="6"/><path d="M328 105 L328 209" fill="none"/>' +
    '<path d="M25 175 L296 175" fill="none"/><circle cx="48" cy="195" r="9"/><rect x="345" y="215" width="30" height="10" rx="4"/>' +
    '<circle cx="110" cy="235" r="34"/><circle cx="110" cy="235" r="13"/><circle cx="295" cy="235" r="34"/><circle cx="295" cy="235" r="13"/>');

  add('caminhao', 'Caminhão',
    '<path d="M10 268 L390 268" fill="none"/>' +
    '<rect x="18" y="80" width="205" height="150" rx="8"/><path d="M18 150 L223 150" fill="none"/>' +
    '<path d="M228 125 L290 125 L335 178 L358 178 L358 230 L228 230 Z"/>' +
    '<path d="M244 140 L282 140 L312 178 L244 178 Z"/><circle cx="350" cy="198" r="9"/>' +
    '<circle cx="80" cy="236" r="32"/><circle cx="80" cy="236" r="12"/><circle cx="175" cy="236" r="32"/><circle cx="175" cy="236" r="12"/><circle cx="295" cy="236" r="32"/><circle cx="295" cy="236" r="12"/>');

  add('trem', 'Trenzinho',
    cloud(60, 0, 0.7) + cloud(130, 20, 0.5) +
    '<path d="M10 262 L390 262" fill="none"/>' +
    '<path d="M60 215 L28 245 L62 245 Z"/>' +
    '<rect x="55" y="130" width="175" height="95" rx="16"/><path d="M78 130 L78 102 L70 82 L124 82 L116 102 L116 130 Z"/>' +
    '<rect x="222" y="95" width="100" height="130" rx="6"/><rect x="214" y="85" width="116" height="16" rx="6"/>' +
    '<rect x="240" y="115" width="62" height="50" rx="6"/><circle cx="90" cy="228" r="27"/><circle cx="90" cy="228" r="9"/>' +
    '<circle cx="150" cy="228" r="27"/><circle cx="150" cy="228" r="9"/><circle cx="272" cy="228" r="31"/><circle cx="272" cy="228" r="11"/>' +
    '<circle cx="62" cy="170" r="12"/>');

  add('aviao', 'Aviãozinho',
    cloud(10, 10, 0.9) + cloud(270, 215, 0.9) +
    '<path d="M325 140 L372 75 L390 75 L360 150 Z"/>' +
    '<path d="M215 150 L158 60 L205 60 L268 150 Z"/>' +
    '<ellipse cx="195" cy="155" rx="150" ry="38"/>' +
    '<path d="M180 160 L125 245 L172 245 L250 163 Z"/>' +
    '<circle cx="110" cy="148" r="10"/><circle cx="145" cy="148" r="10"/><circle cx="180" cy="148" r="10"/><circle cx="215" cy="148" r="10"/><circle cx="250" cy="148" r="10"/>' +
    '<path d="M48 160 Q50 128 80 120 L80 188 Q52 186 48 160 Z"/>');

  /* ======== DINOSSAUROS ======== */
  add('trex', 'Tiranossauro',
    GROUND +
    '<path d="M280 150 Q345 135 388 195 Q335 190 290 215 Z"/>' +
    '<path d="M170 120 L180 92 L195 115 Z M205 112 L218 86 L232 112 Z M240 118 L252 92 L266 120 Z"/>' +
    '<rect x="212" y="205" width="46" height="72" rx="16"/><path d="M204 290 Q206 268 246 270 Q292 272 298 290 Z"/>' +
    '<ellipse cx="205" cy="175" rx="90" ry="62"/>' +
    '<path d="M95 135 Q58 120 60 90 Q63 60 110 58 L160 66 Q188 80 178 122 Q166 152 130 162 Z"/>' +
    eye(122, 86, 8) + '<circle cx="72" cy="78" r="3" fill="#000"/>' +
    '<path d="M62 108 Q112 128 172 114" fill="none"/>' +
    '<path d="M75 112 L83 125 L92 116 Z M98 118 L106 130 L115 120 Z M122 121 L130 132 L138 121 Z"/>' +
    '<path d="M150 190 L124 204 L146 210" fill="none"/>');

  add('tricera', 'Tricerátops',
    GROUND +
    '<path d="M325 172 L388 196 L320 206 Z"/>' +
    '<rect x="150" y="215" width="30" height="72" rx="10"/><rect x="190" y="220" width="30" height="67" rx="10"/><rect x="268" y="220" width="30" height="67" rx="10"/><rect x="306" y="215" width="30" height="72" rx="10"/>' +
    '<ellipse cx="238" cy="180" rx="102" ry="58"/>' +
    '<circle cx="120" cy="150" r="60"/>' +
    '<circle cx="95" cy="112" r="9"/><circle cx="125" cy="98" r="9"/><circle cx="158" cy="112" r="9"/><circle cx="170" cy="145" r="9"/>' +
    '<ellipse cx="86" cy="186" rx="50" ry="36"/>' +
    '<path d="M64 160 L38 100 L92 152 Z"/><path d="M104 152 L102 96 L130 150 Z"/><path d="M42 180 L16 192 L46 198 Z"/>' +
    eye(82, 172, 7) + '<path d="M52 202 Q72 210 98 202" fill="none"/>');

  add('bronto', 'Dino pescoçudo',
    GROUND +
    tube('M315 205 Q360 215 386 246', 26) +
    '<rect x="165" y="238" width="30" height="50" rx="10"/><rect x="205" y="242" width="30" height="46" rx="10"/><rect x="272" y="242" width="30" height="46" rx="10"/><rect x="306" y="238" width="30" height="50" rx="10"/>' +
    '<path d="M168 195 Q112 165 106 100 Q102 66 86 56" fill="none" stroke-width="44"/>' +
    '<ellipse cx="238" cy="203" rx="98" ry="48"/>' +
    '<path d="M168 195 Q112 165 106 100 Q102 66 86 56" fill="none" stroke="#fff" stroke-width="34"/>' +
    '<ellipse cx="72" cy="50" rx="32" ry="21"/>' + eye(62, 44, 6) + '<path d="M44 58 Q60 68 78 62" fill="none"/>' +
    '<circle cx="215" cy="190" r="14"/><circle cx="262" cy="202" r="12"/><circle cx="236" cy="224" r="10"/>');

  var plates = '';
  [[150, 55], [185, 72], [222, 74], [258, 62], [292, 46]].forEach(function (p) {
    plates += '<path d="M' + (p[0] - 19) + ' 158 L' + p[0] + ' ' + (158 - p[1]) + ' L' + (p[0] + 19) + ' 158 Z"/>';
  });
  add('estego', 'Estegossauro',
    GROUND + plates +
    '<rect x="150" y="232" width="30" height="55" rx="10"/><rect x="190" y="236" width="30" height="51" rx="10"/><rect x="268" y="236" width="30" height="51" rx="10"/><rect x="302" y="232" width="30" height="55" rx="10"/>' +
    '<path d="M305 192 Q362 172 388 200 Q356 226 305 216 Z"/><path d="M346 178 L354 152 L364 182 Z"/><path d="M368 186 L386 164 L385 196 Z"/>' +
    '<ellipse cx="212" cy="196" rx="108" ry="52"/>' +
    '<ellipse cx="92" cy="218" rx="34" ry="23"/>' + eye(84, 212, 6) + '<path d="M66 228 Q82 236 100 230" fill="none"/>');

  add('ptero', 'Pterodáctilo',
    cloud(20, 200, 0.8) + cloud(280, 215, 0.7) +
    '<path d="M168 150 L18 100 L56 140 L34 152 L76 166 L58 184 L172 176 Z"/>' +
    '<path d="M232 150 L382 100 L344 140 L366 152 L324 166 L342 184 L228 176 Z"/>' +
    '<path d="M240 168 L296 196 L238 186 Z"/>' +
    '<ellipse cx="200" cy="165" rx="48" ry="28"/>' +
    '<path d="M186 108 L232 78 L222 122 Z"/>' +
    '<ellipse cx="170" cy="130" rx="36" ry="24"/>' +
    '<path d="M138 124 L82 118 L138 142 Z"/>' + eye(164, 124, 6) +
    '<path d="M190 190 L186 212 M210 190 L214 212" fill="none"/>');

  add('ovodino', 'Ovo de dino',
    GROUND +
    '<circle cx="200" cy="118" r="52"/><path d="M176 72 L186 50 L197 68 Z"/><path d="M203 68 L214 50 L224 72 Z"/>' +
    eye(181, 112, 7) + eye(219, 112, 7) + '<circle cx="160" cy="135" r="10"/><circle cx="240" cy="135" r="10"/>' +
    '<path d="M184 135 Q200 150 216 135" fill="none"/>' +
    '<path d="M105 290 Q88 195 140 162 L158 188 L180 152 L200 184 L220 152 L242 188 L260 162 Q312 195 295 290 Z"/>' +
    '<circle cx="150" cy="235" r="14"/><circle cx="243" cy="248" r="18"/><circle cx="200" cy="215" r="9"/>');

  /* ======== PLANTAS ======== */
  var sp = '';
  for (var i = 0; i < 12; i++) sp += '<ellipse cx="200" cy="52" rx="15" ry="33" transform="rotate(' + (i * 30) + ' 200 112)"/>';
  var seeds = '';
  [[185, 98], [215, 98], [200, 112], [180, 125], [220, 125], [200, 135], [190, 114], [210, 114]].forEach(function (s) { seeds += '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="3.5" fill="#000"/>'; });
  add('girassol', 'Girassol',
    '<path d="M192 148 L192 295 L208 295 L208 148 Z"/>' +
    '<path d="M208 235 Q275 195 295 235 Q255 268 208 235 Z"/><path d="M192 215 Q125 175 105 215 Q145 248 192 215 Z"/>' +
    sp + '<circle cx="200" cy="112" r="40"/>' + seeds);

  add('cacto', 'Cacto',
    '<path d="M148 232 L252 232 L240 292 L160 292 Z"/><rect x="142" y="218" width="116" height="20" rx="6"/>' +
    '<g stroke-width="10"><rect x="165" y="75" width="70" height="150" rx="35"/><rect x="112" y="118" width="38" height="88" rx="19"/><rect x="130" y="172" width="55" height="34" rx="14"/>' +
    '<rect x="250" y="95" width="38" height="75" rx="19"/><rect x="215" y="140" width="55" height="30" rx="14"/></g>' +
    '<g stroke="none"><rect x="165" y="75" width="70" height="150" rx="35"/><rect x="112" y="118" width="38" height="88" rx="19"/><rect x="130" y="172" width="55" height="34" rx="14"/>' +
    '<rect x="250" y="95" width="38" height="75" rx="19"/><rect x="215" y="140" width="55" height="30" rx="14"/></g>' +
    '<circle cx="200" cy="72" r="13"/><circle cx="200" cy="72" r="4" fill="#000"/>' +
    eye(185, 135, 6) + eye(215, 135, 6) + '<path d="M185 158 Q200 172 215 158" fill="none"/>' +
    '<path d="M175 190 L168 186 M225 190 L232 186 M200 200 L200 208" fill="none"/>');

  add('cogumelo', 'Cogumelo',
    '<path d="M160 172 L148 290 L252 290 L240 172 Z"/>' +
    '<path d="M65 175 Q65 55 200 52 Q335 55 335 175 Q200 195 65 175 Z"/>' +
    '<circle cx="125" cy="118" r="18"/><circle cx="215" cy="92" r="22"/><circle cx="288" cy="132" r="16"/><circle cx="178" cy="150" r="11"/>' +
    eye(180, 218, 7) + eye(220, 218, 7) + '<path d="M180 245 Q200 262 220 245" fill="none"/>' +
    '<path d="M285 258 Q285 218 320 214 Q356 218 356 258 Z"/><rect x="308" y="258" width="24" height="32" rx="4"/>' +
    '<circle cx="312" cy="238" r="5"/><circle cx="332" cy="232" r="4"/>' + GROUND);

  var leaves = '';
  [200, 235, 270, 305, 340, 20, 155].forEach(function (a) {
    var r = a * Math.PI / 180, cx = 215 + 55 * Math.cos(r), cy = 118 + 55 * Math.sin(r);
    leaves += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="62" ry="15" transform="rotate(' + a + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')"/>';
  });
  add('palmeira', 'Palmeira',
    '<circle cx="345" cy="50" r="26"/>' +
    '<path d="M10 292 Q200 240 390 292 Z"/>' +
    tube('M200 275 Q180 200 215 122', 32) +
    leaves + '<circle cx="204" cy="134" r="11"/><circle cx="228" cy="136" r="11"/><circle cx="216" cy="152" r="11"/>');

  add('pinheiro', 'Pinheirinho',
    GROUND +
    '<rect x="172" y="238" width="56" height="52"/>' +
    '<path d="M70 245 L200 150 L330 245 Z"/><path d="M92 185 L200 100 L308 185 Z"/><path d="M118 130 L200 48 L282 130 Z"/>' +
    star(200, 38, 20, 9) +
    '<circle cx="150" cy="220" r="9"/><circle cx="240" cy="205" r="9"/><circle cx="190" cy="165" r="8"/><circle cx="235" cy="125" r="8"/><circle cx="170" cy="100" r="7"/>');

  /* ======== CÉU E MAR ======== */
  add('baleia', 'Baleia',
    '<path d="M120 90 Q116 55 96 42 M120 90 Q126 52 152 40" fill="none"/>' +
    '<circle cx="78" cy="40" r="7"/><circle cx="170" cy="36" r="7"/><circle cx="60" cy="62" r="5"/>' +
    '<path d="M335 175 Q372 160 388 108 Q380 150 392 182 Q362 190 335 198 Z"/>' +
    '<path d="M42 172 Q55 92 175 90 Q312 88 345 175 Q335 242 200 246 Q70 248 42 172 Z"/>' +
    '<path d="M70 200 Q200 232 330 200" fill="none"/>' +
    eye(105, 150, 9) + '<path d="M55 188 Q95 210 140 194" fill="none"/>' +
    '<path d="M190 215 Q215 255 245 240 Q235 222 220 218 Z"/>' +
    '<path d="M0 262 Q25 244 50 262 T100 262 T150 262 T200 262 T250 262 T300 262 T350 262 T400 262 L400 300 L0 300 Z"/>');

  add('foguete', 'Foguete',
    star(50, 50, 16, 7) + star(340, 40, 12, 5) + star(360, 140, 14, 6) + star(45, 210, 12, 5) +
    '<circle cx="350" cy="232" r="24"/><path d="M318 236 Q350 258 386 230" fill="none"/>' +
    '<path d="M146 165 L98 238 L148 228 Z"/><path d="M254 165 L302 238 L252 228 Z"/>' +
    '<path d="M200 25 Q268 90 258 205 L142 205 Q132 90 200 25 Z"/>' +
    '<circle cx="200" cy="112" r="30"/><circle cx="200" cy="112" r="17"/>' +
    '<path d="M162 205 L238 205 L228 232 L172 232 Z"/>' +
    '<path d="M174 232 Q200 295 226 232 Z"/>');

  /* ======== AS ILHAS ======== */
  window.WORLDS = [
    { id: 'bichos', nome: 'Bichinhos', emoji: ['🐮', '🐷', '🐥', '🐑'], cima: '#8fe36a', baixo: '#4cc15f', terra: '#a2703d',
      paginas: ['patinho', 'pintinho', 'vaca', 'porquinho', 'ovelha', 'gato', 'coelho', 'cachorro', 'leao', 'elefante', 'borboleta'] },
    { id: 'casas', nome: 'Casinhas', emoji: ['🏠', '🏰', '🏢', '🌳'], cima: '#b6e86a', baixo: '#7fcb4a', terra: '#b5804a',
      paginas: ['casa', 'predio', 'castelo', 'celeiro', 'barraca'] },
    { id: 'autos', nome: 'Automóveis', emoji: ['🚗', '🚌', '🚚', '✈️'], cima: '#9aa7b8', baixo: '#6e7c91', terra: '#4a5568',
      paginas: ['carro', 'onibus', 'caminhao', 'trem', 'aviao'] },
    { id: 'dinos', nome: 'Dinossauros', emoji: ['🦖', '🦕', '🥚', '🌋'], cima: '#ffcf70', baixo: '#f0a040', terra: '#9c5a2b',
      paginas: ['trex', 'tricera', 'bronto', 'estego', 'ptero', 'ovodino'] },
    { id: 'plantas', nome: 'Plantas', emoji: ['🌻', '🌵', '🍄', '🌴'], cima: '#5fd08a', baixo: '#2fa866', terra: '#7a4f2a',
      paginas: ['flor', 'arvore', 'girassol', 'cacto', 'cogumelo', 'palmeira', 'pinheiro'] },
    { id: 'ceu', nome: 'Céu e Mar', emoji: ['🌈', '🐳', '🚀', '⭐'], cima: '#ffffff', baixo: '#cfeaff', terra: '#8fc8f5',
      paginas: ['arcoiris', 'estrela', 'balao', 'barco', 'peixe', 'baleia', 'foguete'] }
  ];
})();
