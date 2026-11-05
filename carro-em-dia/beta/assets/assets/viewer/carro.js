// Visualizador 3D do carro (Three.js). Recebe do app: as rodas, o carro
// (arquivos GLB em base64, feitos no Blender) e o estilo da Garagem.
import * as THREE from '%THREE%';
import { GLTFLoader } from '%GLTF%';
import { OrbitControls } from '%ORBIT%';
import { RoomEnvironment } from '%ROOM%';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// Fundo branco opaco (igual ao cartão): WebView transparente com WebGL não
// aparece em alguns Androids.
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 300);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.minPolarAngle = 0.3;
controls.maxPolarAngle = 1.48;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.1;

const sun = new THREE.DirectionalLight(0xffffff, 1.7);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.radius = 5;
sun.shadow.bias = -0.0005;
scene.add(sun, sun.target);
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a939c, 0.65));
const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.2 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const loader = new GLTFLoader();
const holder = new THREE.Group(); // carroceria (desce quando rebaixado)
const wheelsHolder = new THREE.Group();
scene.add(holder, wheelsHolder);
let wheelsLib = null, carRoot = null, info = null, mats = {}, style = null, carId = null;

function b64ToBuffer(b64) {
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u.buffer;
}
const parse = (b64) => new Promise((res, rej) => loader.parse(b64ToBuffer(b64), '', res, rej));
const css = (n) => '#' + (n & 0xffffff).toString(16).padStart(6, '0');

// ------------------------------------------------------------ comandos
async function handle(m) {
  if (m.cmd === 'rodas') {
    wheelsLib = (await parse(m.glb)).scene;
    if (carRoot) applyStyle();
  } else if (m.cmd === 'carro') {
    if (m.id === carId) return;
    const g = await parse(m.glb);
    holder.clear();
    carRoot = g.scene;
    carId = m.id;
    holder.add(carRoot);
    info = (carRoot.children[0] && carRoot.children[0].userData) || {};
    mats = {};
    carRoot.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        const list = Array.isArray(o.material) ? o.material : [o.material];
        for (const mt of list) if (mt && mt.name) (mats[mt.name] = mats[mt.name] || []).push(mt);
      }
    });
    frame();
    if (style) applyStyle();
    window.avisar({ tipo: 'carregado', id: m.id, tela: [window.innerWidth, window.innerHeight] });
  } else if (m.cmd === 'estilo') {
    style = m;
    if (carRoot) applyStyle();
  } else if (m.cmd === 'fundo') {
    renderer.setClearColor(m.cor, 1);
    document.body.style.background = css(m.cor);
  } else if (m.cmd === 'girar') {
    controls.autoRotate = !!m.ligado;
  }
}

// Enquadra a câmera no carro (de frente e um pouco de lado, como na prévia).
function frame() {
  const box = new THREE.Box3().setFromObject(carRoot);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const radius = size.length() / 2;
  const fov = (camera.fov * Math.PI) / 180;
  const aspect = Math.max(0.6, camera.aspect);
  // Distância para o carro ocupar bem a área (mais perto em telas largas).
  const dist = (radius / Math.tan(fov / 2)) * (aspect < 1.2 ? 1.1 / aspect : 0.62 + 0.3 / aspect);
  controls.target.set(center.x, size.y * 0.42, center.z);
  camera.position.set(center.x + dist * 0.66, size.y * 0.42 + dist * 0.34, center.z + dist * 0.66);
  camera.near = dist / 50;
  camera.far = dist * 10;
  camera.updateProjectionMatrix();
  // Luz quase de cima: sombra curta, logo embaixo do carro.
  sun.position.set(center.x + radius * 0.5, radius * 4, center.z + radius * 0.7);
  sun.target.position.copy(center);
  const s = sun.shadow.camera;
  s.left = s.bottom = -radius * 1.3;
  s.right = s.top = radius * 1.3;
  s.near = 0.1;
  s.far = radius * 8;
  s.updateProjectionMatrix();
  controls.update();
}

// ------------------------------------------------------------ texturas
// Lateral (UV 1): u = comprimento, v = altura. Topo (UV 2): u = comprimento,
// v = largura. Desenha em metros e converte para pixels.
function sideCanvas(paint) {
  const L = info.comprimento, H = info.altura;
  const W = 2048, Hc = Math.max(256, Math.round((2048 * H) / L / 2) * 2);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = Math.min(1024, Hc);
  const g = c.getContext('2d');
  const X = (x) => ((x - info.xr) / L) * c.width;
  const Y = (z) => (1 - (z - info.zmin) / H) * c.height;
  g.fillStyle = css(paint);
  g.fillRect(0, 0, c.width, c.height);
  const poly = (pts, color) => {
    g.fillStyle = color;
    g.beginPath();
    pts.forEach(([x, z], i) => (i ? g.lineTo(X(x), Y(z)) : g.moveTo(X(x), Y(z))));
    g.closePath();
    g.fill();
  };
  const rect = (x0, z0, x1, z1, color) => poly([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], color);
  const disc = (cx, cz, r, color) => {
    g.fillStyle = color;
    g.beginPath();
    g.ellipse(X(cx), Y(cz), (r / L) * c.width, (r / H) * c.height, 0, 0, Math.PI * 2);
    g.fill();
  };
  const st = style;
  const xr = info.xr, xf = info.xr + L, yb = info.yb, belt = info.cintura;
  const yLo = yb + 0.1, yHi = belt - 0.05, yc = (yLo + yHi) / 2, h = yHi - yLo;
  const x0 = xf - 0.28, len = L - 0.5;
  const pc = css(st.corEstampa);
  switch (st.estampa) {
    case 'chamas': {
      const flame = (k) => [
        [x0, yc + 0.45 * h * k], [x0 - 0.22 * len * k, yc + 0.32 * h * k], [x0 - 0.36 * len * k, yc + 0.46 * h * k],
        [x0 - 0.36 * len * k, yc + 0.2 * h * k], [x0 - 0.58 * len * k, yc + 0.3 * h * k], [x0 - 0.52 * len * k, yc + 0.04 * h * k],
        [x0 - 0.82 * len * k, yc - 0.02 * h * k], [x0 - 0.55 * len * k, yc - 0.2 * h * k], [x0 - 0.66 * len * k, yc - 0.4 * h * k],
        [x0 - 0.36 * len * k, yc - 0.3 * h * k], [x0 - 0.42 * len * k, yc - 0.48 * h * k], [x0 - 0.14 * len * k, yc - 0.4 * h * k],
        [x0, yc - 0.45 * h * k],
      ];
      poly(flame(1), pc);
      const inner = new THREE.Color(st.corEstampa).lerp(new THREE.Color(0xffe066), 0.65);
      poly(flame(0.62), '#' + inner.getHexString());
      break;
    }
    case 'xadrez': {
      const s = 0.11;
      const other = new THREE.Color(st.corEstampa).getHSL({}).l > 0.5 ? '#26282c' : '#f7f7f2';
      for (let x = xr + 0.25, i = 0; x < xf - 0.3; x += s, i++)
        for (let j = 0; j < 2; j++) {
          const z = yHi - 0.03 - (j + 1) * s;
          rect(x, z, x + s, z + s, (i + j) % 2 === 0 ? pc : other);
        }
      break;
    }
    case 'camuflagem': {
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const base = new THREE.Color(st.corEstampa);
      const tones = [pc, '#' + base.clone().lerp(new THREE.Color(0), 0.35).getHexString(),
        '#' + base.clone().lerp(new THREE.Color(0xffffff), 0.3).getHexString()];
      for (let i = 0; i < Math.round(len * 7); i++) {
        const cx = xr + 0.1 + rnd() * (len + 0.3), cz = yLo + rnd() * h, rr = 0.08 + rnd() * 0.12;
        const pts = [];
        for (let k = 0; k < 7; k++)
          pts.push([cx + Math.cos((2 * Math.PI * k) / 7) * rr * (0.7 + rnd() * 0.6),
            cz + Math.sin((2 * Math.PI * k) / 7) * rr * 0.75 * (0.7 + rnd() * 0.6)]);
        poly(pts, tones[i % 3]);
      }
      break;
    }
    case 'raio': {
      const top = [], bot = [];
      for (let k = 0; k <= 6; k++) {
        const x = x0 - (len * 0.9 * k) / 6, z = yc + (k % 2 === 0 ? 0.1 : -0.06) * h * 2, th = 0.09 * (1 - k / 7);
        top.push([x, z + th / 2]);
        bot.push([x, z - th / 2]);
      }
      poly([...bot, [x0 - len * 0.98, yc], ...top.reverse()], pc);
      break;
    }
    case 'bolinhas':
      for (let x = xr + 0.3, i = 0; x < xf - 0.3; x += 0.24, i++)
        for (let z = yLo + 0.06 + (i % 2 ? 0.11 : 0); z < yHi - 0.03; z += 0.22) disc(x, z, 0.06, pc);
      break;
  }
  if (st.faixas === 'lateral') rect(xr + 0.15, belt - 0.24, xf - 0.3, belt - 0.16, css(st.corFaixa));
  if (st.numero) {
    const ds = info.portas || [];
    const rx = info.rodas_x || [xr + L * 0.3, xf - L * 0.3];
    const cx = ds.length > 1 ? (ds[0] + ds[1]) / 2 - 0.2 : (rx[0] + rx[1]) / 2, cz = (yb + belt) / 2 + 0.03;
    disc(cx, cz, 0.2, '#2e3136');
    disc(cx, cz, 0.17, '#f7f7f2');
    rect(cx - 0.025, cz - 0.1, cx + 0.025, cz + 0.1, '#2e3136');
  }
  return c;
}

function topCanvas(bg, carbon) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = css(bg);
  g.fillRect(0, 0, c.width, c.height);
  const W = info.largura_uv, L = info.comprimento;
  const V = (y) => (0.5 - y / W) * c.height; // y em metros a partir do centro
  if (carbon) {
    const cell = (0.08 / L) * c.width, cellY = (0.08 / W) * c.height;
    g.fillStyle = '#3b3f46';
    for (let y = 0, j = 0; y < c.height; y += cellY, j++)
      for (let x = (j % 2) * cell; x < c.width; x += cell * 2) g.fillRect(x, y, cell, cellY);
  }
  if (style.faixas === 'corrida') {
    g.fillStyle = css(style.corFaixa);
    const a = Math.min(0.09, info.largura_uv * 0.05), b = Math.min(0.24, info.largura_uv * 0.13);
    for (const s of [1, -1]) g.fillRect(0, Math.min(V(s * a), V(s * b)), c.width, Math.abs(V(s * b) - V(s * a)));
  }
  return c;
}

function texture(canvas, channel) {
  const t = new THREE.CanvasTexture(canvas);
  t.flipY = false; // as UVs do glTF já vêm com a origem em cima
  t.colorSpace = THREE.SRGBColorSpace;
  t.channel = channel;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

function setMat(name, fn) {
  for (const m of mats[name] || []) {
    fn(m);
    m.needsUpdate = true;
  }
}

function applyStyle() {
  const st = style;
  const paint = st.pintura;
  const hoodBg = st.capo === 'pretoFosco' ? 0x1f2124 : st.capo === 'carbono' ? 0x2b2e33 : paint;
  const roof = st.teto == null ? paint : st.teto;
  const old = [];
  setMat('Pintura', (m) => { old.push(m.map); m.color.set(0xffffff); m.map = texture(sideCanvas(paint), 0); });
  setMat('PinturaTopo', (m) => { old.push(m.map); m.color.set(0xffffff); m.map = texture(topCanvas(paint, false), 1); });
  setMat('Capo', (m) => {
    old.push(m.map);
    m.color.set(0xffffff);
    m.map = texture(topCanvas(hoodBg, st.capo === 'carbono'), 1);
    m.roughness = st.capo === 'pretoFosco' ? 0.85 : 0.28;
    if ('clearcoat' in m) m.clearcoat = st.capo === 'pretoFosco' ? 0 : 0.6;
  });
  setMat('Teto', (m) => { old.push(m.map); m.color.set(0xffffff); m.map = texture(topCanvas(roof, false), 1); });
  old.forEach((t) => t && t.dispose());
  setMat('Vidro', (m) => { m.color.set(st.insulfilm ? 0x07090b : 0x1d2832); m.roughness = 0.04; m.metalness = 0.3; });
  setMat('Farol', (m) => {
    m.color.set(st.farol);
    m.emissive.set(st.farol);
    m.emissiveIntensity = st.farol === 0x6e737a ? 0.15 : 0.9;
  });
  // Acessórios: mostra só os escolhidos.
  const acc = {
    acc_rack: st.rack, acc_bagageiro: st.bagageiro, acc_led: st.led, acc_quebramato: st.quebramato,
    acc_estribo: st.estribo, acc_aerofolio: st.aerofolio, acc_milha: st.milha, acc_tomada: st.capo === 'entradaDeAr',
  };
  carRoot.traverse((o) => { if (o.name in acc) o.visible = !!acc[o.name]; });
  holder.position.y = st.rebaixado ? -0.05 : 0;
  placeWheels();
}

// Rodas: a escolhida, copiada para cada marcador do carro (escala pelo raio e
// pela largura; do lado direito espelhada para a face do aro ficar para fora).
function placeWheels() {
  wheelsHolder.clear();
  if (!wheelsLib) return;
  const src = wheelsLib.getObjectByName('roda_' + style.roda) || wheelsLib.getObjectByName('roda_liga');
  const rim = new THREE.Color(style.aro);
  const k = style.grandes ? 1.1 : 1.0;
  carRoot.traverse((m) => {
    if (!m.name.startsWith('roda_') || !m.userData.raio) return;
    const w = src.clone(true);
    w.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        if (o.material && o.material.name === 'Aro') {
          o.material = o.material.clone();
          o.material.color.copy(rim);
        }
      }
    });
    const p = new THREE.Vector3();
    m.getWorldPosition(p);
    const r = m.userData.raio * k;
    w.position.set(p.x, r, p.z);
    w.rotation.set(0, 0, 0);
    w.scale.set(r, r, (m.userData.largura / 0.65) * m.userData.lado);
    wheelsHolder.add(w);
  });
}

// ------------------------------------------------------------ laço
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
  if (carRoot) frame();
}
window.addEventListener('resize', resize);
resize();
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

// Fila de comandos: os que chegaram antes do visualizador ficar pronto e os novos.
let busy = Promise.resolve();
const run = (m) => { busy = busy.then(() => handle(m)).catch((e) => window.avisar({ tipo: 'erro', msg: String(e) })); };
window.carroCmd = run;
(window.__fila || []).splice(0).forEach(run);
window.avisar({ tipo: 'iniciado' });
