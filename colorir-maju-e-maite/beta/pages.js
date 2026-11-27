/* Páginas para colorir: desenhos em SVG feitos à mão (viewBox 400x300).
   Para criar uma nova página, copie um bloco "add(...)" e mude o desenho.
   Regra: contornos pretos grossos, formas com preenchimento branco. */
(function () {
  var P = [];

  function wrap(b) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="1200" height="900">' +
      '<rect width="400" height="300" fill="#fff" stroke="none"/>' +
      '<g fill="#fff" stroke="#000" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">' + b + '</g></svg>';
  }
  function add(id, nome, body) { P.push({ id: id, nome: nome, svg: wrap(body) }); }

  // Patinho (herói do canal, com o raio no peito)
  add('patinho', 'Patinho',
    '<path d="M300 185 L345 150 L335 205 Z"/>' +
    '<path d="M165 255 L145 287 L200 287 Z"/><path d="M225 255 L205 287 L260 287 Z"/>' +
    '<ellipse cx="205" cy="195" rx="100" ry="68"/>' +
    '<path d="M165 190 Q205 140 250 195 Q210 238 165 190 Z"/>' +
    '<path d="M135 172 L118 204 L132 204 L124 228 L150 196 L136 196 Z"/>' +
    '<circle cx="165" cy="100" r="55"/>' +
    '<path d="M115 95 Q70 90 72 112 Q85 128 122 118 Z"/>' +
    '<circle cx="150" cy="82" r="8" fill="#000"/>' +
    '<path d="M162 46 Q152 18 178 28" fill="none"/>');

  // Pintinho
  add('pintinho', 'Pintinho',
    '<path d="M175 268 L175 288 M160 290 L175 288 L190 290" fill="none"/>' +
    '<path d="M225 268 L225 288 M210 290 L225 288 L240 290" fill="none"/>' +
    '<circle cx="200" cy="165" r="105"/>' +
    '<path d="M98 160 Q58 180 82 225 Q115 218 118 185 Z"/>' +
    '<path d="M302 160 Q342 180 318 225 Q285 218 282 185 Z"/>' +
    '<circle cx="165" cy="140" r="9" fill="#000"/><circle cx="235" cy="140" r="9" fill="#000"/>' +
    '<circle cx="138" cy="178" r="14"/><circle cx="262" cy="178" r="14"/>' +
    '<path d="M183 160 L217 160 L200 190 Z"/>' +
    '<path d="M200 62 Q188 32 175 42 M200 62 Q206 28 222 38" fill="none"/>');

  // Vaquinha
  add('vaca', 'Vaquinha',
    '<ellipse cx="95" cy="112" rx="42" ry="20" transform="rotate(-20 95 112)"/>' +
    '<ellipse cx="305" cy="112" rx="42" ry="20" transform="rotate(20 305 112)"/>' +
    '<path d="M150 75 Q132 30 160 36 Q168 56 172 72 Z"/><path d="M250 75 Q268 30 240 36 Q232 56 228 72 Z"/>' +
    '<ellipse cx="200" cy="150" rx="92" ry="88"/>' +
    '<path d="M138 82 Q172 66 178 98 Q165 122 135 108 Z"/>' +
    '<ellipse cx="200" cy="208" rx="58" ry="42"/>' +
    '<circle cx="180" cy="208" r="7" fill="#000"/><circle cx="220" cy="208" r="7" fill="#000"/>' +
    '<circle cx="162" cy="135" r="9" fill="#000"/><circle cx="238" cy="135" r="9" fill="#000"/>');

  // Porquinho
  add('porquinho', 'Porquinho',
    '<path d="M125 88 L105 30 L168 62 Z"/><path d="M275 88 L295 30 L232 62 Z"/>' +
    '<circle cx="200" cy="158" r="105"/>' +
    '<circle cx="120" cy="185" r="15"/><circle cx="280" cy="185" r="15"/>' +
    '<ellipse cx="200" cy="190" rx="52" ry="38"/>' +
    '<ellipse cx="183" cy="190" rx="7" ry="12" fill="#000"/><ellipse cx="217" cy="190" rx="7" ry="12" fill="#000"/>' +
    '<circle cx="152" cy="135" r="9" fill="#000"/><circle cx="248" cy="135" r="9" fill="#000"/>' +
    '<path d="M168 242 Q200 262 232 242" fill="none"/>');

  // Ovelhinha
  var wool = [[170, 130, 50], [225, 105, 52], [280, 130, 48], [300, 180, 45], [255, 215, 50], [190, 210, 50], [235, 160, 60]];
  var w1 = '', w2 = '';
  wool.forEach(function (c) {
    w1 += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>';
    w2 += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>';
  });
  add('ovelha', 'Ovelhinha',
    '<rect x="185" y="240" width="22" height="48" rx="8"/><rect x="265" y="240" width="22" height="48" rx="8"/>' +
    '<g stroke-width="10">' + w1 + '</g><g stroke="none">' + w2 + '</g>' +
    '<ellipse cx="68" cy="152" rx="26" ry="14" transform="rotate(30 68 152)"/>' +
    '<ellipse cx="100" cy="178" rx="38" ry="46"/>' +
    '<circle cx="100" cy="128" r="22"/>' +
    '<circle cx="86" cy="168" r="7" fill="#000"/>' +
    '<ellipse cx="78" cy="198" rx="9" ry="6" fill="#000"/>');

  // Flor
  var petals = '';
  for (var i = 0; i < 8; i++) {
    petals += '<ellipse cx="200" cy="57" rx="24" ry="42" transform="rotate(' + (i * 45) + ' 200 105)"/>';
  }
  add('flor', 'Flor',
    '<path d="M40 70 Q40 40 70 45 Q85 20 115 40 Q145 35 145 65 Q145 80 125 80 L55 80 Q40 80 40 70 Z"/>' +
    '<path d="M192 140 L192 295 L208 295 L208 140 Z"/>' +
    '<path d="M208 245 Q275 205 295 245 Q255 278 208 245 Z"/>' +
    '<path d="M192 225 Q125 185 105 225 Q145 258 192 225 Z"/>' +
    petals + '<circle cx="200" cy="105" r="32"/>');

  // Casinha
  add('casa', 'Casinha',
    '<circle cx="355" cy="40" r="24"/>' +
    '<rect x="270" y="55" width="32" height="70"/>' +
    '<rect x="90" y="140" width="220" height="150"/>' +
    '<path d="M68 145 L200 38 L332 145 Z"/>' +
    '<rect x="175" y="205" width="50" height="85" rx="6"/><circle cx="212" cy="250" r="5" fill="#000"/>' +
    '<rect x="110" y="170" width="45" height="45"/><path d="M132 170 L132 215 M110 192 L155 192" fill="none"/>' +
    '<rect x="245" y="170" width="45" height="45"/><path d="M267 170 L267 215 M245 192 L290 192" fill="none"/>' +
    '<path d="M15 292 L385 292" fill="none"/>');

  // Carrinho
  add('carro', 'Carrinho',
    '<path d="M10 268 L390 268" fill="none"/>' +
    '<path d="M40 210 L40 170 Q40 155 60 152 L105 150 L140 105 Q148 95 165 95 L255 95 Q272 95 282 108 L312 150 L345 155 Q365 160 365 180 L365 210 Q365 222 350 222 L50 222 Q40 222 40 210 Z"/>' +
    '<path d="M122 150 L148 110 L195 110 L195 150 Z"/><path d="M210 110 L255 110 L285 150 L210 150 Z"/>' +
    '<path d="M215 178 L242 178" fill="none"/>' +
    '<circle cx="350" cy="188" r="10"/>' +
    '<circle cx="115" cy="225" r="34"/><circle cx="115" cy="225" r="13"/>' +
    '<circle cx="290" cy="225" r="34"/><circle cx="290" cy="225" r="13"/>');

  // Estrela com carinha
  function star(cx, cy, R, r) {
    var pts = [];
    for (var k = 0; k < 10; k++) {
      var a = -Math.PI / 2 + k * Math.PI / 5, rad = k % 2 ? r : R;
      pts.push((cx + rad * Math.cos(a)).toFixed(1) + ' ' + (cy + rad * Math.sin(a)).toFixed(1));
    }
    return '<path d="M' + pts.join(' L') + ' Z"/>';
  }
  add('estrela', 'Estrela',
    star(60, 60, 34, 15) + star(345, 70, 30, 13) + star(335, 245, 34, 15) + star(55, 235, 28, 12) +
    star(200, 155, 125, 55) +
    '<circle cx="170" cy="145" r="9" fill="#000"/><circle cx="230" cy="145" r="9" fill="#000"/>' +
    '<path d="M170 180 Q200 210 230 180" fill="none"/>');

  function cloud(x, y, s) {
    return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" stroke-width="' + (5 / s) + '" d="M40 70 Q40 40 70 45 Q85 20 115 40 Q145 35 145 65 Q145 80 125 80 L55 80 Q40 80 40 70 Z"/>';
  }

  // Arco-íris
  add('arcoiris', 'Arco-íris',
    '<circle cx="345" cy="50" r="28"/>' +
    '<path d="M60 245 A140 140 0 0 1 340 245 Z"/><path d="M85 245 A115 115 0 0 1 315 245 Z"/>' +
    '<path d="M110 245 A90 90 0 0 1 290 245 Z"/><path d="M135 245 A65 65 0 0 1 265 245 Z"/>' +
    cloud(-10, 190, 1.1) + cloud(230, 190, 1.1));

  // Borboleta
  add('borboleta', 'Borboleta',
    '<path d="M192 130 Q110 40 60 85 Q40 130 100 160 Q150 165 192 150 Z"/>' +
    '<path d="M208 130 Q290 40 340 85 Q360 130 300 160 Q250 165 208 150 Z"/>' +
    '<path d="M192 160 Q120 175 95 225 Q110 260 150 235 Q190 215 192 175 Z"/>' +
    '<path d="M208 160 Q280 175 305 225 Q290 260 250 235 Q210 215 208 175 Z"/>' +
    '<circle cx="115" cy="100" r="16"/><circle cx="285" cy="100" r="16"/>' +
    '<circle cx="135" cy="213" r="12"/><circle cx="265" cy="213" r="12"/>' +
    '<path d="M195 85 Q180 45 163 42 M205 85 Q220 45 237 42" fill="none"/>' +
    '<ellipse cx="200" cy="165" rx="12" ry="75"/><circle cx="200" cy="92" r="17"/>' +
    '<circle cx="195" cy="90" r="3" fill="#000"/><circle cx="206" cy="90" r="3" fill="#000"/>');

  // Peixinho
  add('peixe', 'Peixinho',
    '<path d="M285 150 L355 95 Q343 150 355 205 Z"/>' +
    '<path d="M165 90 Q200 35 240 90 Z"/>' +
    '<ellipse cx="190" cy="150" rx="110" ry="70"/>' +
    '<path d="M180 118 Q205 150 180 182 M218 112 Q243 150 218 188" fill="none"/>' +
    '<circle cx="125" cy="135" r="11" fill="#000"/>' +
    '<path d="M88 165 Q103 177 115 165" fill="none"/>' +
    '<circle cx="60" cy="100" r="11"/><circle cx="42" cy="68" r="8"/><circle cx="72" cy="50" r="13"/>');

  // Árvore
  var crown = [[200, 105, 60], [145, 140, 48], [255, 140, 48], [170, 172, 45], [230, 172, 45]];
  var c1 = '', c2 = '';
  crown.forEach(function (c) {
    c1 += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>';
    c2 += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>';
  });
  add('arvore', 'Árvore',
    '<circle cx="45" cy="45" r="26"/>' +
    '<path d="M172 292 L180 180 L222 180 L228 292 Z"/>' +
    '<g stroke-width="10">' + c1 + '</g><g stroke="none">' + c2 + '</g>' +
    '<circle cx="190" cy="100" r="9"/><circle cx="145" cy="145" r="9"/><circle cx="255" cy="135" r="9"/><circle cx="215" cy="170" r="9"/>' +
    '<path d="M15 292 L385 292" fill="none"/>');

  // Gatinho
  add('gato', 'Gatinho',
    '<path d="M122 112 L112 38 L178 78 Z"/><path d="M278 112 L288 38 L222 78 Z"/>' +
    '<circle cx="200" cy="160" r="92"/>' +
    '<path d="M200 70 L200 98 M178 76 L184 98 M222 76 L216 98" fill="none"/>' +
    '<ellipse cx="163" cy="145" rx="10" ry="15" fill="#000"/><ellipse cx="237" cy="145" rx="10" ry="15" fill="#000"/>' +
    '<path d="M188 177 L212 177 L200 191 Z"/>' +
    '<path d="M200 191 L200 200 M200 200 Q185 214 170 202 M200 200 Q215 214 230 202" fill="none"/>' +
    '<path d="M118 180 L55 168 M118 196 L55 202 M282 180 L345 168 M282 196 L345 202" fill="none"/>');

  // Coelhinho
  add('coelho', 'Coelhinho',
    '<ellipse cx="155" cy="62" rx="26" ry="58" transform="rotate(-8 155 90)"/>' +
    '<ellipse cx="245" cy="62" rx="26" ry="58" transform="rotate(8 245 90)"/>' +
    '<ellipse cx="156" cy="68" rx="11" ry="38" transform="rotate(-8 155 90)"/>' +
    '<ellipse cx="244" cy="68" rx="11" ry="38" transform="rotate(8 245 90)"/>' +
    '<circle cx="200" cy="175" r="88"/>' +
    '<circle cx="150" cy="195" r="13"/><circle cx="250" cy="195" r="13"/>' +
    '<circle cx="170" cy="158" r="9" fill="#000"/><circle cx="230" cy="158" r="9" fill="#000"/>' +
    '<ellipse cx="200" cy="184" rx="11" ry="8" fill="#000"/>' +
    '<path d="M200 192 L200 204 M200 204 Q186 216 174 206 M200 204 Q214 216 226 206" fill="none"/>' +
    '<path d="M190 208 L210 208 L210 228 L190 228 Z"/>');

  // Balão
  add('balao', 'Balão',
    cloud(10, 190, 0.9) + cloud(270, 40, 0.8) +
    '<path d="M200 225 Q180 250 205 265 Q225 280 195 297" fill="none"/>' +
    '<ellipse cx="200" cy="115" rx="80" ry="95"/>' +
    '<path d="M190 210 L210 210 L200 226 Z"/>' +
    '<path d="M200 20 Q150 115 200 210 M200 20 Q250 115 200 210" fill="none"/>' +
    '<path d="M150 70 Q138 100 152 128" fill="none"/>');

  // Barquinho
  add('barco', 'Barquinho',
    '<circle cx="335" cy="55" r="30"/>' + cloud(20, 10, 1) +
    '<rect x="196" y="55" width="8" height="140"/>' +
    '<path d="M204 62 L204 182 L292 182 Z"/><path d="M196 85 L196 182 L130 182 Z"/>' +
    '<path d="M204 56 L204 28 L238 42 Z"/>' +
    '<path d="M92 192 L308 192 L272 255 L128 255 Z"/>' +
    '<circle cx="150" cy="218" r="9"/><circle cx="200" cy="218" r="9"/><circle cx="250" cy="218" r="9"/>' +
    '<path d="M0 250 Q25 232 50 250 T100 250 T150 250 T200 250 T250 250 T300 250 T350 250 T400 250 L400 300 L0 300 Z"/>' +
    '<path d="M0 275 Q25 260 50 275 T100 275 T150 275 T200 275 T250 275 T300 275 T350 275 T400 275" fill="none"/>');

  window.PAGES = P;
})();
