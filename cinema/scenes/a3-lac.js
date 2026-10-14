/* ==========================================================================
   Décor « a3-lac » — Acte 3, le lac. La règle des pilules rendue concrète.

   Un grand lac de montagne à l'aube, eau parfaitement calme. Deux longs
   pontons flottants en planches, posés côte à côte dans la profondeur : le
   bleu à gauche, le rouge à droite ; leur jointure fuit vers l'horizon. Sur
   la jointure, une longue file de personnes, de dos, un pied sur chaque
   ponton (une trentaine qu'on distingue, puis d'autres qui se perdent dans
   la brume : on comprend qu'il y en a une centaine).

   Le soleil se lève derrière la rive de droite : lumière rasante et dorée,
   liseré d'or sur le côté droit des silhouettes, longues ombres lavande
   couchées vers la gauche sur le ponton bleu, traînée de scintillements sur
   l'eau sous le soleil. Rives boisées bleutées, montagnes lavande, brume
   basse sur l'eau.

   La caméra est posée à 3,10 m au-dessus de l'eau, un peu à gauche de la
   file (on voit la file en biais, les têtes sous l'horizon : légère
   plongée). Les pontons et les gens sont construits en mètres puis
   projetés ; les pontons sont peints une fois, collés (p.gap = 0), puis
   redécoupés en fines bandes horizontales qu'on glisse chacune de l'écart
   vu à sa profondeur : chaque ponton s'éloigne en vraie perspective, sans
   être repeint. Les jambes sont tracées à chaque image (elles s'écartent
   avec les pontons) ; le haut des corps vient d'une planche de 16
   silhouettes peintes. Dans « fin », la caméra du décor elle-même monte et
   recule (p.lift) : les pontons sont alors redessinés en procédural, petits,
   sous un banc de brume en bourrelets qui s'amincit au-dessus d'eux.

   Paramètres (p) :
     gap    0 → 2   les pontons s'écartent (0 collés, 1 environ un pas) ;
                    au-delà de ~1,2 chacun a fini sur un seul ponton
     mist   0 → 1   un banc de brume en bourrelets voile l'eau, les pontons et
                    la file (plan « fin »)
     sun    0 → 1   le soleil monte un peu : la lumière s'intensifie
     lift   0 → 1   la caméra monte et recule (plan « fin ») : pontons et
                    file, redessinés en procédural, deviennent petits

   Plans : « ouverture » (7 s, plan large, pontons collés), « ecart » (6 s,
   plus serré sur l'arrière de la file, les pontons s'écartent, image figée
   du choix à la fin) et « fin » (7,5 s, la caméra s'élève vers le ciel et
   la brume ; pontons petits et écartés, on ne voit pas qui est où).
   ========================================================================== */
import { rng } from '../kit.js';
import { TAU, clamp, lerp, ease, seg } from '../../film/engine.js';

const ID = 'a3-lac';
const u = (n) => `${ID}-${n}`;
const url = (n) => `url(#${ID}-${n})`;
const f1 = (v) => +v.toFixed(1);
const pt = (p) => `${f1(p[0])},${f1(p[1])}`;
const poly = (ps, a = '') => `<polygon points="${ps.map(pt).join(' ')}" ${a}/>`;
const pathOf = (ps) => `M${ps.map(pt).join(' L')} Z`;
const stops = (s) => s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
const grad = (id, a, b, s) =>
  `<linearGradient id="${u(id)}" gradientUnits="userSpaceOnUse" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}">${stops(s)}</linearGradient>`;
const radial = (id, c, r, s, sy = 1) =>
  `<radialGradient id="${u(id)}" gradientUnits="userSpaceOnUse" cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r)}"` +
  (sy !== 1 ? ` gradientTransform="translate(0 ${f1(c[1] * (1 - sy))}) scale(1 ${sy})"` : '') + `>${stops(s)}</radialGradient>`;
const boxGrad = (id, s, x2 = 1, y2 = 0) =>
  `<linearGradient id="${u(id)}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
const blurF = (id, s) => `<filter id="${u(id)}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`;

// Couleurs : mélange de deux teintes hexadécimales
const rgbOf = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixc = (a, b, k) => {
  const A = rgbOf(a), B = rgbOf(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join('');
};
const rgba = (h, a) => { const [r, g, b] = rgbOf(h); return `rgba(${r},${g},${b},${f1(a * 1000) / 1000})`; };

/* --------------------------------------------------------------------------
   La scène, en mètres. Caméra à CAMX (à gauche de la jointure) et CAMH
   au-dessus de l'eau, regard horizontal ; X vers la droite, Y vers le haut,
   Z vers le fond. L'horizon est à CY.
   -------------------------------------------------------------------------- */
const F = 1050, CX = 820, CY = 452, CAMX = -3.0, CAMH = 3.1;
// La caméra peut monter et reculer (plan « fin », p.lift) : V la décrit, en
// mètres (X latéral, H hauteur, B recul). Elle regarde toujours à
// l'horizontale : l'horizon et les lointains (ciel, rives, eau) ne bougent pas.
const V0 = { X: CAMX, H: CAMH, B: 0 };
let V = V0;
const viewOf = (lift) => (lift <= 0 ? V0 : { X: lerp(CAMX, -1.25, lift), H: lerp(CAMH, 7.2, lift), B: lerp(0, 15, lift) });
const pr = (X, Y, Z) => [CX + (F * (X - V.X)) / (Z + V.B), CY + (F * (V.H - Y)) / (Z + V.B)];
const ppm = (Z) => F / (Z + V.B); // pixels par mètre à la profondeur Z
const DH = 0.32;           // hauteur du pont au-dessus de l'eau
const WP = 2.3;            // largeur d'un ponton
const ZN = 3.2, ZF = 95;   // les pontons, du bord du cadre au bout de la file
const SH = 0.25;           // chaque ponton s'éloigne de SH mètres par unité de gap
const SHORE = 467;         // ligne d'eau des rives lointaines
const SUN = [1478, 436];   // le soleil, à peine levé derrière la rive droite
// profondeur d'une ligne d'écran sur le pont
const zOfRow = (v) => (F * (CAMH - DH)) / (v - CY);
// voile de l'air : les lointains se fondent dans la lumière de l'aube
const HAZE = (Z) => 1 - Math.exp(-Z / 62);

// Palette de la bible (Acte 3)
const C = {
  blue: '#5d7fa6', blueS: '#3c5675', blueL: '#8fb0d1',
  red: '#b5523f', redS: '#7e3529', redL: '#d9826b',
  wood: '#8a6a4c', woodS: '#5e4838', woodL: '#b8936a',
  peach: '#f2c9a8', lav: '#b9b4cf', gold: '#ffd598', haze: '#e9cfc2',
};

/* --------------------------------------------------------------------------
   Le ciel, les montagnes et les rives (un calque)
   -------------------------------------------------------------------------- */
// Ligne de crête : somme de bosses pointues, déterministe
function ridge(seed, x0, x1, step, base, waves) {
  const r = rng(seed);
  const ph = waves.map(() => r() * TAU);
  const ps = [];
  for (let x = x0; x <= x1 + 0.1; x += step) {
    let y = typeof base === 'function' ? base(x) : base;
    waves.forEach(([a, l, p], i) => { y -= a * Math.pow(1 - Math.abs(Math.sin((Math.PI * x) / l + ph[i])), p); });
    ps.push([x, y]);
  }
  return ps;
}
// Lisière de résineux sur une crête : petites pointes serrées
function trees(seed, ps, hmin, hmax) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < ps.length - 1; i++) {
    const [x, y] = ps[i], [x2, y2] = ps[i + 1];
    const n = Math.max(1, Math.round((x2 - x) / 7));
    for (let j = 0; j < n; j++) {
      const k = j / n, xx = lerp(x, x2, k), yy = lerp(y, y2, k);
      const h = lerp(hmin, hmax, r()), w = 2.2 + r() * 2.4;
      out.push([xx - w, yy + 1], [xx - w * 0.25, yy - h * 0.55], [xx, yy - h], [xx + w * 0.25, yy - h * 0.55], [xx + w, yy + 1]);
    }
  }
  return out;
}
const closeDown = (ps, yb) => [...ps, [ps[ps.length - 1][0], yb], [ps[0][0], yb]];

// Les silhouettes de l'horizon, partagées avec leur reflet dans l'eau
const MONTS = closeDown(ridge(3, -260, 2180, 10, (x) => SHORE - 40 + 0.012 * (x - 900), [[118, 640, 1.6], [62, 290, 1.3], [26, 120, 1.2]]), SHORE + 2);
const COLLINES = closeDown(ridge(8, -260, 2180, 12, SHORE - 12, [[34, 520, 1.1], [16, 210, 1.2]]), SHORE + 2);
const RIVE_G = (() => {
  const top = ridge(12, -260, 700, 14, (x) => SHORE - 18 - 26 * clamp((560 - x) / 600), [[16, 300, 1], [7, 90, 1]]);
  top.push([760, SHORE - 2]);
  return closeDown([...trees(13, top, 4, 13)], SHORE + 2);
})();
const RIVE_D = (() => {
  // la rive droite monte en colline ; le soleil se lève dans le creux, vers SUN
  const base = (x) => SHORE - 6 - 74 * Math.pow(clamp((x - 1180) / 700), 0.7) + 30 * Math.exp(-(((x - SUN[0]) / 80) ** 2));
  const top = [[1040, SHORE - 1], ...ridge(21, 1100, 2180, 14, base, [[12, 260, 1], [6, 80, 1]])];
  return closeDown(trees(22, top, 5, 15), SHORE + 2);
})();

// L'îlot : une bosse de rochers et quelques résineux, posé sur l'eau à mi-distance
const ILOT_Y = 492;
const ILOT = (() => {
  const top = ridge(17, 170, 470, 9, (x) => ILOT_Y - 4 - 16 * Math.sin(Math.PI * clamp((x - 170) / 300)), [[5, 90, 1]]);
  const r = rng(18);
  const out = [];
  for (const [x, y] of top) {
    const tall = x > 225 && x < 425 && r() < 0.85;
    const h = tall ? 10 + r() * 22 * Math.sin(Math.PI * clamp((x - 205) / 240)) : 1 + r() * 3;
    const w = tall ? 4 + h * 0.18 : 5;
    out.push([x - w, y + 1], [x - w * 0.45, y - h * 0.45], [x, y - h], [x + w * 0.45, y - h * 0.45], [x + w, y + 1]);
  }
  return closeDown(out, ILOT_Y);
})();

function ciel() {
  const r = rng(41);
  let s = '<defs>';
  s += grad('ciel', [0, -460], [0, SHORE], [
    [0, '#8e90b6'], [0.3, '#a9a5c7'], [0.55, C.lav], [0.75, '#dcbfc2'], [0.88, '#f0c8ad'], [0.96, '#f8dabb'], [1, '#fbe4c6'],
  ]);
  s += radial('halo', SUN, 980, [[0, '#fff3da', 0.95], [0.06, '#ffe6b8', 0.85], [0.22, '#f8cf9e', 0.45], [0.5, '#f2c2a2', 0.16], [1, '#f2c2a2', 0]], 0.62);
  s += grad('monts', [-240, 0], [2160, 0], [[0, '#a7a2c0'], [0.45, '#b9b0c8'], [0.62, '#d6c0c6'], [0.72, '#e6cbbf'], [0.85, '#d2bcc6'], [1, '#b6aac3']]);
  s += grad('collines', [-240, 0], [2160, 0], [[0, '#8b8cad'], [0.45, '#9c9ab6'], [0.64, '#c4adb8'], [0.75, '#c8adb2'], [1, '#9b93b1']]);
  s += grad('riveG', [0, SHORE - 60], [0, SHORE], [[0, '#6c7193'], [1, '#757a98']]);
  s += grad('riveD', [1100, 0], [2160, 0], [[0, '#7a7896'], [0.25, '#6f6a8a'], [0.5, '#676181'], [1, '#5f5a7b']]);
  s += grad('brumeH', [0, SHORE - 34], [0, SHORE + 6], [[0, '#fbe3cc', 0], [0.6, '#fbe3cc', 0.55], [1, '#fde9d4', 0.7]]);
  s += blurF('f3', 3) + blurF('f6', 5) + blurF('f8', 8) + blurF('f14', 14) + blurF('f2', 1.6);
  s += '</defs>';
  s += `<rect x="-240" y="-460" width="2400" height="${SHORE + 470}" fill="${url('ciel')}"/>`;
  s += `<rect x="-240" y="-460" width="2400" height="${SHORE + 470}" fill="${url('halo')}"/>`;

  // Nuages : de longues bandes d'altitude, lavande, que le soleil encore bas
  // éclaire par-dessous (or rosé près de lui, rose passé plus loin)
  s += `<g filter="${url('f6')}">`;
  for (let i = 0; i < 13; i++) {
    const y = -420 + Math.pow(r(), 0.8) * 640, x = -260 + r() * 2300;
    const w = 420 + r() * 900, h = 14 + r() * 22 * (1 - i / 16);
    const near = Math.exp(-(((x - SUN[0]) / 800) ** 2));
    const body = mixc('#9d98bb', '#c9b3c4', 0.25 + 0.4 * (i / 11));
    const lit = mixc('#f0c3b6', '#ffdcae', near);
    // le corps du nuage, en quelques lobes allongés
    for (let k = 0; k < 7; k++) {
      const xx = x + (k - 3) * w * 0.14 + r() * 50, ww = w * (0.16 + r() * 0.16), hh = h * (0.5 + r() * 0.9) * (1 - Math.abs(k - 3) * 0.12);
      s += `<ellipse cx="${f1(xx)}" cy="${f1(y - hh * 0.2)}" rx="${f1(ww)}" ry="${f1(hh)}" fill="${body}" opacity="${f1(0.5 + r() * 0.3)}"/>`;
    }
    // le dessous éclairé
    s += `<ellipse cx="${f1(x + 40)}" cy="${f1(y + h * 0.5)}" rx="${f1(w * 0.45)}" ry="${f1(Math.max(3, h * 0.36))}" fill="${lit}" opacity="${f1(0.55 + 0.4 * near)}"/>`;
    s += `<ellipse cx="${f1(x + 60)}" cy="${f1(y + h * 0.62)}" rx="${f1(w * 0.3)}" ry="${f1(Math.max(1.5, h * 0.14))}" fill="#fff0d8" opacity="${f1(0.3 + 0.5 * near)}"/>`;
  }
  s += '</g>';

  // Les plans de l'horizon, du plus lointain au plus proche
  s += `<g filter="${url('f2')}">`;
  s += poly(MONTS, `fill="${url('monts')}"`);
  // neige et pentes éclairées : quelques lumières rasantes sur les crêtes, côté soleil
  s += `<g opacity="0.55">${poly(MONTS.map(([x, y]) => [x + 5, y + 3]), `fill="#c9bfd2"`)}</g>`;
  s += '</g>';
  s += `<rect x="-240" y="${SHORE - 60}" width="2400" height="64" fill="#f3d6c4" opacity="0.3" filter="${url('f14')}"/>`;
  s += poly(COLLINES, `fill="${url('collines')}" filter="${url('f2')}"`);
  s += `<rect x="-240" y="${SHORE - 26}" width="2400" height="30" fill="#f6dccb" opacity="0.3" filter="${url('f8')}"/>`;
  s += poly(RIVE_G, `fill="${url('riveG')}"`);
  s += poly(RIVE_D, `fill="${url('riveD')}"`);
  // le soleil, dans le creux de la rive droite, et le liseré d'or sur la crête
  s += `<circle cx="${SUN[0]}" cy="${SUN[1]}" r="58" fill="#fff0cf" opacity="0.55" filter="${url('f14')}"/>`;
  s += `<circle cx="${SUN[0]}" cy="${SUN[1]}" r="23" fill="#fffaf0"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="31" fill="#fff4dc" opacity="0.6" filter="${url('f3')}"/>`;
  s += `<g filter="${url('f3')}"><path d="M${RIVE_D.slice(0, -2).filter((_, i) => i % 5 === 2).map(pt).join(' L')}" fill="none" stroke="#ffd59a" stroke-width="2.6" opacity="0.8" style="mask:none" stroke-linejoin="round"/></g>`;
  // brume sur l'eau au pied des rives
  s += `<rect x="-240" y="${SHORE - 22}" width="2400" height="28" fill="${url('brumeH')}" filter="${url('f6')}"/>`;
  // un îlot boisé, à mi-distance sur la gauche, et sa petite plage de rochers
  s += poly(ILOT, `fill="#5f6488"`);
  s += `<path d="M${pt(ILOT[0])} L${pt(ILOT[ILOT.length - 3])}" stroke="#d8c0b8" stroke-width="1.6" opacity="0.6"/>`;
  return s;
}

/* --------------------------------------------------------------------------
   L'eau (un calque) : miroir du ciel, reflet des rives, chemin du soleil,
   rides très fines
   -------------------------------------------------------------------------- */
function eau() {
  const r = rng(57);
  const mirror = (ps) => ps.map(([x, y]) => [x, 2 * SHORE - y]);
  let s = '<defs>';
  s += grad('eau', [0, SHORE], [0, 1240], [
    [0, '#f6dac2'], [0.04, '#ebcbc0'], [0.12, '#d0b8c6'], [0.28, '#a7a2c2'], [0.5, '#8486a9'], [0.75, '#666b92'], [1, '#4f5579'],
  ]);
  s += radial('chemin', [SUN[0], SHORE + 4], 820, [[0, '#fff1d6', 0.95], [0.08, '#ffdcae', 0.7], [0.3, '#f6c79f', 0.32], [1, '#f6c79f', 0]], 0.0);
  s += `<radialGradient id="${u('colonne')}" gradientUnits="userSpaceOnUse" cx="${SUN[0]}" cy="${SHORE}" r="800" gradientTransform="translate(${SUN[0] * 0.78} 0) scale(0.22 1)">${stops([[0, '#ffe2b5', 0.75], [0.35, '#f7c99d', 0.35], [1, '#f7c99d', 0]])}</radialGradient>`;
  s += radial('lueur', [SUN[0], SHORE], 600, [[0, '#ffe7c2', 0.8], [0.4, '#f8d0ac', 0.3], [1, '#f8d0ac', 0]], 0.18);
  s += grad('brumeR', [0, SHORE - 4], [0, SHORE + 56], [[0, '#f3e0d6', 0.75], [0.45, '#ead8d8', 0.4], [1, '#e2d4dc', 0]]);
  s += blurF('f4', 4) + blurF('f10', 10) + blurF('fr', 2.4);
  s += '</defs>';
  s += `<rect x="-240" y="${SHORE - 4}" width="2400" height="${1244 - SHORE}" fill="${url('eau')}"/>`;
  s += `<rect x="-240" y="${SHORE - 4}" width="2400" height="${1244 - SHORE}" fill="${url('colonne')}"/>`;
  s += `<rect x="-240" y="${SHORE - 4}" width="2400" height="200" fill="${url('lueur')}"/>`;
  // Reflets des rives : la même silhouette renversée, adoucie, plus sombre et
  // plus bleue que l'original. Les montagnes, lointaines, ne laissent qu'un
  // reflet très léger : trop marqué, le ciel pris entre leurs pointes
  // renversées dessinait des arches roses qui, grossies dans « ecart », se
  // lisaient comme des nuages posés sur le lac.
  s += `<g filter="${url('fr')}">`;
  s += poly(mirror(MONTS), `fill="#9a9aba" opacity="0.22"`);
  s += poly(mirror(COLLINES), `fill="#7f7ea2" opacity="0.5"`);
  s += poly(mirror(RIVE_G), `fill="#686d90" opacity="0.85"`);
  s += poly(mirror(RIVE_D), `fill="#645f80" opacity="0.85"`);
  s += poly(ILOT.map(([x, y]) => [x, 2 * ILOT_Y - y]), `fill="#575c80" opacity="0.75"`);
  s += '</g>';
  // le miroir se brouille un peu en s'approchant : de fines bandes claires le traversent
  for (let i = 0; i < 18; i++) {
    const y = SHORE + 8 + i * i * 0.9 + r() * 4;
    s += `<rect x="-240" y="${f1(y)}" width="2400" height="${f1(0.8 + i * 0.12)}" fill="#efdcd6" opacity="${f1(0.18 + r() * 0.15)}"/>`;
  }
  // les reflets sont coupés par des rides claires, de plus en plus serrées vers la rive
  for (let i = 0; i < 26; i++) {
    const y = SHORE + 4 + Math.pow(i / 26, 1.6) * 190 + r() * 3;
    s += `<rect x="-240" y="${f1(y)}" width="2400" height="${f1(0.9 + i * 0.09)}" fill="#e6dbe4" opacity="${f1(0.22 + r() * 0.16)}"/>`;
  }
  // et ils s'effacent sous la bande de brume qui longe la rive
  s += `<rect x="-240" y="${SHORE - 4}" width="2400" height="60" fill="${url('brumeR')}"/>`;
  s += `<rect x="-240" y="${SHORE - 2}" width="2400" height="12" fill="#fde6cf" opacity="0.65" filter="${url('f4')}"/>`;
  // Rides : de longs traits horizontaux, très fins au loin, plus larges devant
  for (let i = 0; i < 360; i++) {
    const k = Math.pow(r(), 1.5);
    const y = SHORE + 6 + k * 770;
    const d = (y - CY) / 700; // proximité
    const x = -240 + r() * 2400;
    const w = (20 + r() * 120) * (0.4 + d * 2.6);
    const h = 0.6 + d * 2.4;
    const near = Math.exp(-(((x - SUN[0]) / (120 + d * 500)) ** 2));
    const light = r() < 0.55;
    const col = light ? mixc('#d9cde0', '#ffe2bd', near) : mixc('#6f7096', '#8a7a8e', near);
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w / 2)}" ry="${f1(h / 2)}" fill="${col}" opacity="${f1((light ? 0.22 : 0.18) + 0.25 * near)}"/>`;
  }
  return s;
}

/* --------------------------------------------------------------------------
   Les pontons (un calque) : peints collés, en perspective exacte
   -------------------------------------------------------------------------- */
const XO = { blue: -WP, red: WP };
function pontons() {
  const r = rng(73);
  let s = '<defs>';
  const vF = pr(0, DH, ZF)[1], vN = pr(0, DH, ZN)[1];
  s += grad('voile', [0, vF], [0, pr(0, DH, 26)[1]], [[0, C.haze, 0.7], [0.35, C.haze, 0.38], [1, C.haze, 0]]);
  s += grad('dore', [700, 0], [2200, 0], [[0, '#ffd598', 0], [0.5, '#ffd598', 0.1], [1, '#ffd598', 0.32]]);
  s += grad('flanc', [0, vF], [0, vN + 120], [[0, '#c8b4b8'], [0.25, '#8f7c78'], [1, '#5c4a42']]);
  s += grad('reflet', [0, vF], [0, vN + 200], [[0, '#b6a7bb', 0.5], [1, '#3e4466', 0.7]]);
  s += blurF('f2', 1.8) + blurF('f5', 5);
  // La peinture du calque : la même texture que le filtre « paint » du kit, mais
  // une déformation trois fois plus faible (avec « paint », les joints fins des
  // planches ondulaient comme des strates une fois grossis dans « ecart »)
  s += `<filter id="${u('peint')}" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">` +
    '<feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="3" result="warp"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="warp" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="shape"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="3" seed="11" result="tex"/>' +
    '<feColorMatrix in="tex" type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1" result="gray"/>' +
    '<feComposite in="shape" in2="gray" operator="arithmetic" k1="0.2" k2="0.9" k3="0" k4="0" result="mod"/>' +
    '<feComposite in="mod" in2="shape" operator="in"/></filter>';
  s += '</defs>';
  s += `<g filter="${url('peint')}">`;

  // Le flanc gauche du ponton bleu (à l'ombre : le soleil est à droite) et son reflet
  const XL = XO.blue;
  s += poly([pr(XL, 0, ZN), pr(XL, 0, ZF), pr(XL, -DH * 1.1, ZF), pr(XL, -DH * 1.1, ZN)], `fill="${url('reflet')}" filter="${url('f5')}"`);
  s += poly([pr(XL, 0, ZN), pr(XL, DH, ZN), pr(XL, DH, ZF), pr(XL, 0, ZF)], `fill="${url('flanc')}"`);
  // flotteurs sombres au ras de l'eau, et les montants des sections
  s += poly([pr(XL + 0.05, 0, ZN), pr(XL + 0.05, 0.09, ZN), pr(XL + 0.05, 0.09, ZF), pr(XL + 0.05, 0, ZF)], `fill="#2f2c38" opacity="0.85"`);
  for (let Z = ZN + 1.1; Z < ZF; Z += 3) {
    const a = pr(XL, 0.02, Z), b = pr(XL, DH, Z);
    if (Math.abs(b[1] - a[1]) < 2) break;
    s += `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="#3d302c" stroke-width="${f1(Math.max(0.5, 22 / Z))}" opacity="0.4"/>`;
  }
  // l'arête du pont, à peine éclairée
  s += `<path d="M${pt(pr(XL, DH, ZN))} L${pt(pr(XL, DH, ZF))}" stroke="#a88d78" stroke-width="2.4" fill="none" opacity="0.8"/>`;

  // Les deux ponts
  for (const side of ['blue', 'red']) {
    const sg = side === 'blue' ? -1 : 1;
    const X1 = XO[side];
    const base = C[side], dark = C[side + 'S'], light = C[side + 'L'];
    const deck = (xa, xb, za, zb) => [pr(xa, DH, za), pr(xb, DH, za), pr(xb, DH, zb), pr(xa, DH, zb)];
    s += poly(deck(0, X1, ZN, ZF), `fill="${base}"`);
    // Les planches, en travers, du même vocabulaire que « a3-pieds » : joints
    // droits et réguliers, peinture à peine nuancée d'une planche à l'autre,
    // quelques plaques usées où le bois réapparaît, des clous tout près. Au
    // loin, elles se fondent en une seule teinte.
    let Z = ZN;
    while (Z < ZF) {
      const d = 0.15;
      const a = pr(0, DH, Z)[1], b = pr(0, DH, Z + d)[1];
      const hpx = a - b;
      const k = r();
      const col = k < 0.3 ? mixc(base, dark, 0.1 + r() * 0.06) : k < 0.65 ? mixc(base, light, 0.06 + r() * 0.08) : base;
      if (hpx > 1.2) {
        s += poly(deck(0, X1, Z, Z + d), `fill="${col}" opacity="0.7"`);
        // l'arête de devant prend la lumière
        if (hpx > 5) s += poly(deck(0, X1, Z + d * 0.04, Z + d * 0.16), `fill="${light}" opacity="0.18"`);
        // plaques usées : la peinture partie, le bois clair dessous
        if (r() < 0.12) {
          const xc = sg * (0.3 + r() * (WP - 0.8)), hl = 0.12 + r() * 0.35, zc = Z + d * (0.35 + r() * 0.3), ht = d * (0.18 + r() * 0.12);
          const ps = [];
          for (let m = 0; m < 8; m++) {
            const ang = (m / 8) * TAU, j = 0.75 + 0.4 * r();
            ps.push(pr(xc + Math.cos(ang) * hl * j, DH, zc + Math.sin(ang) * ht * j));
          }
          s += poly(ps, `fill="${r() < 0.6 ? '#a68b6c' : '#cbbfae'}" opacity="${f1(0.28 + r() * 0.25)}"`);
        }
        // joint entre deux planches : un trait droit, sourd
        s += `<path d="M${pt(pr(0, DH, Z + d))} L${pt(pr(X1, DH, Z + d))}" stroke="${mixc(dark, '#2a2230', 0.3)}" stroke-width="${f1(clamp(0.12 + hpx * 0.07, 0.5, 2.4))}" opacity="${f1(clamp(0.18 + hpx * 0.018, 0.2, 0.5))}"/>`;
        // clous près des lisses, seulement là où une planche fait plus de 9 px
        if (hpx > 9) {
          for (const xx of [sg * 0.2, X1 - sg * 0.21]) {
            const c = pr(xx, DH, Z + d * 0.5), rr = clamp(hpx * 0.05, 0.6, 2.2);
            s += `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(rr * 1.8)}" fill="#6e5038" opacity=".18"/><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(rr)}" fill="#2c2a2e" opacity=".6"/>`;
          }
        }
        Z += d + 0.012;
      } else {
        // bandes plus larges : le grain des planches devient une vibration de teinte
        const dd = d * 6;
        s += poly(deck(0, X1, Z, Z + dd), `fill="${col}" opacity="${f1(0.2 + 0.15 * r())}"`);
        Z += dd;
      }
    }
    // les modules du ponton, tous les 6 m : un joint un peu plus marqué
    for (let z = ZN + 2.6; z < ZF; z += 6) {
      const w = Math.max(0.5, 140 / (z * z) * 10);
      s += `<path d="M${pt(pr(0, DH, z))} L${pt(pr(X1, DH, z))}" stroke="#2a2228" stroke-width="${f1(Math.min(3.2, w))}" opacity="0.4"/>`;
    }
    // bords en bois brut, de chaque côté
    for (const [xa, xb] of [[0, sg * 0.11], [X1 - sg * 0.12, X1]]) {
      s += poly(deck(xa, xb, ZN, ZF), `fill="${C.wood}"`);
      s += `<path d="M${pt(pr(xa + (xb - xa) * 0.5, DH, ZN))} L${pt(pr(xa + (xb - xa) * 0.5, DH, ZF))}" stroke="${C.woodL}" stroke-width="1.4" opacity="0.5"/>`;
    }
  }
  // la jointure : un trait d'ombre entre les deux bords
  // la jointure : une fente sombre et fine au milieu de la double lisse (on voit
  // ainsi, même collés, qu'il y a deux pontons et un pied de chaque côté)
  s += poly([pr(-0.014, DH, ZN), pr(0.014, DH, ZN), pr(0.014, DH, ZF), pr(-0.014, DH, ZF)], `fill="#1d171d" opacity="0.85"`);
  s += `<path d="M${pt(pr(0, DH, ZN))} L${pt(pr(0, DH, ZF))}" stroke="#1d171d" stroke-width="1.2" opacity="0.6"/>`;
  // la lumière rasante de droite réchauffe les ponts ; au loin, l'air de l'aube les voile
  const both = [pr(XO.blue, DH, ZN), pr(XO.red, DH, ZN), pr(XO.red, DH, ZF), pr(XO.blue, DH, ZF)];
  s += poly(both, `fill="${url('dore')}"`);
  // le bleu, du côté opposé au soleil, perd un peu de lumière (sinon il attire l'œil à gauche)
  s += poly([pr(XO.blue, DH, ZN), pr(0, DH, ZN), pr(0, DH, ZF), pr(XO.blue, DH, ZF)], `fill="#262a40" opacity="0.13"`);
  s += poly([pr(XO.blue, 0, ZN), ...both.slice(1, 3), pr(XO.blue, 0, ZF)], `fill="${url('voile')}"`);
  // le bout des pontons, très loin
  s += poly([pr(XO.blue, 0, ZF), pr(XO.red, 0, ZF), pr(XO.red, DH, ZF), pr(XO.blue, DH, ZF)], `fill="#c9b2b0"`);
  return s + '</g>';
}
const PBOX = [700, 470, 1500, 800];

/* --------------------------------------------------------------------------
   Les gens : une planche de 16 hauts de corps, de dos ou de trois quarts.
   Chaque case fait 180 × 200 unités, 200 unités par mètre ; l'ancre (le
   bassin) est en (90, 180). Les jambes sont tracées à chaque image.
   -------------------------------------------------------------------------- */
const CELL = [180, 200], ANC = [90, 180], UPM = 200, COLS = 8;
const SKIN = ['#efcfb4', '#e3b48f', '#c99670', '#a8735a', '#7d5341', '#f2d6c2', '#d2a07c'];
const HAIR = { noir: '#211b19', brun: '#3d2c22', chatain: '#5e4330', gris: '#9a928c', blanc: '#dcd6cf', poivre: '#6c6560', blond: '#a8875e' };
// Vêtements sourds : ni bleu franc ni rouge franc (pontons), ni les couleurs des Actes 1 et 2
const CL = {
  ocre: '#9f7c48', gris: '#8b8178', sauge: '#899a7f', creme: '#dccfb6', brun: '#6c4e3a', prune: '#76576b',
  sable: '#c0ab88', olive: '#6e6c4b', taupe: '#7d6e63', anthra: '#4b4643', mauve: '#8e7f8c', lin: '#cfc2a6',
  caramel: '#94693f', kaki: '#a49a73', ivoire: '#e6ddca', miel: '#d6bd96',
};
// Pantalons : gris sombres, mais aussi brun, ocre foncé, sauge foncé, crème sale, prune passée
const PANTS = ['#4b4540', '#6a4e3a', '#7a6139', '#56604f', '#b1a389', '#5f4a5a', '#3c3836', '#857b6c', '#58563f', '#6b625f'];

const FIGS = [
  { hair: 'court', hc: 'gris', top: 'gris', sw: 44, ww: 34, hw: 36, hem: 196, coat: 1 },
  { hair: 'long', hc: 'brun', top: 'creme', sw: 36, ww: 27, hw: 32, hem: 186 },
  { hair: 'chauve', hc: 'gris', top: 'sauge', sw: 47, ww: 40, hw: 40, hem: 184 },
  { hair: 'chignon', hc: 'noir', top: 'prune', sw: 37, ww: 28, hw: 34, hem: 198, coat: 1 },
  { hair: 'boucles', hc: 'chatain', top: 'ocre', sw: 39, ww: 31, hw: 34, hem: 184, turn: 1 },
  { hair: 'court', hc: 'noir', top: 'brun', sw: 43, ww: 32, hw: 34, hem: 188 },
  { hair: 'carre', hc: 'blanc', top: 'sable', sw: 36, ww: 30, hw: 35, hem: 197, coat: 1 },
  { hair: 'queue', hc: 'chatain', top: 'olive', sw: 37, ww: 29, hw: 33, hem: 188, turn: 1 },
  { hair: 'bonnet', hc: 'brun', top: 'taupe', sw: 42, ww: 33, hw: 35, hem: 190, hat: 'kaki' },
  { hair: 'blanc', hc: 'blanc', top: 'ivoire', sw: 39, ww: 33, hw: 35, hem: 186, stoop: 1 },
  { hair: 'tresse', hc: 'noir', top: 'miel', sw: 35, ww: 27, hw: 32, hem: 186 },
  { hair: 'court', hc: 'chatain', top: 'kaki', sw: 41, ww: 30, hw: 32, hem: 186, turn: 1 },
  { hair: 'rase', hc: 'noir', top: 'anthra', sw: 45, ww: 33, hw: 34, hem: 199, coat: 1 },
  { hair: 'court', hc: 'poivre', top: 'caramel', sw: 48, ww: 42, hw: 41, hem: 186 },
  { hair: 'capuche', hc: 'brun', top: 'sauge', sw: 41, ww: 32, hw: 34, hem: 188 },
  { hair: 'long', hc: 'blond', top: 'lin', sw: 37, ww: 29, hw: 33, hem: 192, scarf: 'brun', turn: 1 },
];

function figure(i, f) {
  const ox = (i % COLS) * CELL[0], oy = Math.floor(i / COLS) * CELL[1];
  const cx = ox + ANC[0], by = oy + ANC[1];
  const skin = SKIN[i % SKIN.length];
  const top = CL[f.top], hc = HAIR[f.hc];
  const turn = f.turn ? 1 : 0;
  const st = f.stoop ? 5 : 0;
  const hx = cx + turn * 2 + st * 0.3, hy = oy + 31 + st;
  const shY = oy + 64 + st * 0.6;
  const sw = f.sw, ww = f.ww, hw = f.hw, hem = oy + f.hem;
  const P = (n) => u(`f${i}-${n}`);
  // Le dos est à l'ombre (le soleil est devant, à droite) : teintes refroidies,
  // chaleur qui monte vers le bord droit, liseré d'or
  const shade = (c) => mixc(mixc(c, '#5d5a7c', 0.32), '#000000', 0.1);
  const warm = (c) => mixc(c, '#ffc98a', 0.38);
  let d = '<defs>';
  const lit = (n, c) => `<linearGradient id="${P(n)}" x1="0" y1="0" x2="1" y2="0">${stops([[0, mixc(shade(c), '#3e3d5a', 0.25)], [0.55, shade(c)], [0.86, mixc(shade(c), warm(c), 0.55)], [1, warm(c)]])}</linearGradient>`;
  d += lit('top', top) + lit('skin', skin) + lit('hair', hc);
  if (f.hat) d += lit('hat', CL[f.hat]);
  if (f.scarf) d += lit('scarf', CL[f.scarf]);
  // Contours
  const torso = `M${cx - sw + 8},${shY - 5} Q${cx},${shY - 12} ${cx + sw - 8},${shY - 5} Q${cx + sw + 1},${shY - 1} ${cx + sw},${shY + 14} ` +
    `L${cx + ww + 1},${oy + 138} Q${cx + hw + 2},${oy + 166} ${cx + hw + (f.coat ? 4 : 0)},${hem} L${cx - hw - (f.coat ? 4 : 0)},${hem} ` +
    `Q${cx - hw - 2},${oy + 166} ${cx - ww - 1},${oy + 138} L${cx - sw},${shY + 14} Q${cx - sw - 1},${shY - 1} ${cx - sw + 8},${shY - 5} Z`;
  const arm = (k) => {
    const x0 = cx + k * (sw - 6), x1 = cx + k * (sw + 5), x2 = cx + k * (hw + 10);
    const w0 = 9.5, w1 = 7.5;
    return `M${x0 - w0},${shY + 2} Q${x1 - w0},${shY + 50} ${x2 - w1},${oy + 170} L${x2 + w1},${oy + 172} Q${x1 + w0 + 2},${shY + 50} ${x0 + w0},${shY} Z`;
  };
  const hand = (k) => `M${cx + k * (hw + 10) - 6},${oy + 168} q0,13 6,16 q6,-3 6,-16 z`;
  const neck = `M${hx - 10},${hy + 12} L${hx + 10},${hy + 12} L${cx + 12},${shY - 4} L${cx - 12},${shY - 4} Z`;
  const head = `M${hx},${hy - 22} C${hx + 13},${hy - 22} ${hx + 18},${hy - 10} ${hx + 18},${hy + 1} C${hx + 18},${hy + 14} ${hx + 9},${hy + 21} ${hx},${hy + 21} C${hx - 9},${hy + 21} ${hx - 18},${hy + 14} ${hx - 18},${hy + 1} C${hx - 18},${hy - 10} ${hx - 13},${hy - 22} ${hx},${hy - 22} Z`;
  // Cheveux
  const hs = turn ? -3 : 0; // de trois quarts : la chevelure glisse, la joue paraît à droite
  let hair = '';
  const capH = (yb, wide = 19) => `M${hx + hs - wide},${hy + 2} C${hx + hs - wide - 1},${hy - 16} ${hx + hs - 12},${hy - 25} ${hx + hs},${hy - 25} C${hx + hs + 12},${hy - 25} ${hx + hs + wide + 1},${hy - 16} ${hx + hs + wide},${hy + 2} C${hx + hs + wide - 1},${yb - 6} ${hx + hs + 8},${yb} ${hx + hs},${yb} C${hx + hs - 8},${yb} ${hx + hs - wide + 1},${yb - 6} ${hx + hs - wide},${hy + 2} Z`;
  switch (f.hair) {
    case 'court': hair = capH(hy + 15); break;
    case 'rase': hair = capH(hy + 13, 18.5); break;
    case 'carre': hair = `M${hx - 22},${hy + 20} C${hx - 24},${hy - 14} ${hx - 13},${hy - 25} ${hx},${hy - 25} C${hx + 13},${hy - 25} ${hx + 24},${hy - 14} ${hx + 22},${hy + 20} Q${hx},${hy + 26} ${hx - 22},${hy + 20} Z`; break;
    case 'long': hair = `M${hx + hs - 21},${hy + 4} C${hx + hs - 22},${hy - 16} ${hx + hs - 12},${hy - 25} ${hx + hs},${hy - 25} C${hx + hs + 12},${hy - 25} ${hx + hs + 22},${hy - 16} ${hx + hs + 21},${hy + 4} C${hx + hs + 24},${hy + 40} ${hx + hs + 26},${hy + 66} ${hx + hs + 18},${hy + 82} Q${hx + hs},${hy + 88} ${hx + hs - 18},${hy + 82} C${hx + hs - 26},${hy + 66} ${hx + hs - 24},${hy + 40} ${hx + hs - 21},${hy + 4} Z`; break;
    case 'chignon': hair = capH(hy + 14) + ` M${hx - 11},${hy + 9} a11,10 0 1,0 22,0 a11,10 0 1,0 -22,0 Z`; break;
    case 'queue': hair = capH(hy + 14) + ` M${hx + hs - 5},${hy + 8} C${hx + hs - 9},${hy + 30} ${hx + hs - 4},${hy + 50} ${hx + hs + 1},${hy + 60} C${hx + hs + 6},${hy + 48} ${hx + hs + 7},${hy + 28} ${hx + hs + 5},${hy + 8} Z`; break;
    case 'tresse': {
      hair = capH(hy + 15);
      for (let k = 0; k < 7; k++) hair += ` M${hx - 5.5},${hy + 16 + k * 10} a5.5,6.4 0 1,0 11,0 a5.5,6.4 0 1,0 -11,0 Z`;
      break;
    }
    case 'boucles': {
      const rr = rng(100 + i);
      for (let k = 0; k < 15; k++) {
        const a = (k / 15) * TAU, rad = 18 + rr() * 3;
        const x = hx + hs + Math.cos(a) * rad * 0.95, y = hy - 2 + Math.sin(a) * rad * (a > 0.3 && a < 2.8 ? 0.7 : 1);
        hair += ` M${f1(x - 8)},${f1(y)} a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0 Z`;
      }
      hair += ' ' + capH(hy + 12, 21);
      break;
    }
    case 'chauve': hair = `M${hx - 18},${hy - 2} C${hx - 18},${hy + 10} ${hx - 9},${hy + 18} ${hx},${hy + 18} C${hx + 9},${hy + 18} ${hx + 18},${hy + 10} ${hx + 18},${hy - 2} L${hx + 15},${hy + 6} C${hx + 8},${hy + 12} ${hx - 8},${hy + 12} ${hx - 15},${hy + 6} Z`; break;
    case 'blanc': hair = capH(hy + 13, 19.5); break;
    case 'bonnet': hair = capH(hy + 14); break;
    case 'capuche': hair = ''; break;
  }
  let s = d;
  const clipOf = (n, path) => `<clipPath id="${P('c' + n)}"><path d="${path}"/></clipPath>`;
  s += clipOf('torso', torso) + clipOf('head', head) + clipOf('arm0', arm(-1)) + clipOf('arm1', arm(1));
  if (hair) s += clipOf('hair', hair);
  s += '</defs>';
  // forme éclairée : couleur, puis le liseré d'or sur le bord droit (croissant)
  const rimmed = (n, path, fill, wRim = 4.5, op = 0.95) =>
    `<g clip-path="url(#${P('c' + n)})"><path d="${path}" fill="#ffd28c" opacity="${op}"/>` +
    `<path d="${path}" fill="${fill}" transform="translate(${-wRim},${wRim * 0.25})"/></g>`;
  // bras gauche (dans l'ombre), torse, bras droit
  s += rimmed('arm0', arm(-1), `url(#${P('top')})`, 2);
  s += `<path d="${hand(-1)}" fill="${shade(skin)}"/>`;
  s += `<path d="${neck}" fill="${shade(skin)}"/>`;
  s += rimmed('torso', torso, `url(#${P('top')})`, 4);
  // plis et coutures du dos
  s += `<g fill="none" stroke="${mixc(shade(top), '#1d1a26', 0.35)}" stroke-linecap="round" opacity="0.45">`;
  s += `<path d="M${cx - 3},${shY + 6} Q${cx - 5},${oy + 120} ${cx - 2},${hem - 4}" stroke-width="1.6"/>`;
  s += `<path d="M${cx - sw + 10},${shY + 26} Q${cx - ww + 4},${oy + 118} ${cx - ww + 2},${oy + 140}" stroke-width="1.3"/>`;
  if (f.coat) s += `<path d="M${cx},${hem - 34} L${cx},${hem - 1}" stroke-width="1.8"/><path d="M${cx - hw - 2},${oy + 150} Q${cx},${oy + 156} ${cx + hw + 2},${oy + 150}" stroke-width="1.2"/>`;
  else s += `<path d="M${cx - hw},${hem - 6} Q${cx},${hem - 3} ${cx + hw},${hem - 6}" stroke-width="2"/>`;
  s += '</g>';
  s += `<path d="${shY ? `M${cx - sw + 8},${shY - 5} Q${cx},${shY - 12} ${cx + sw - 8},${shY - 5}` : ''}" fill="none" stroke="${mixc(top, '#ffffff', 0.12)}" stroke-width="2" opacity="0.35"/>`;
  s += rimmed('arm1', arm(1), `url(#${P('top')})`, 4.5);
  s += `<path d="${hand(1)}" fill="${mixc(shade(skin), warm(skin), 0.6)}"/>`;
  // la tête
  if (f.hair === 'capuche') {
    const hood = `M${hx - 26},${shY + 4} C${hx - 30},${hy - 14} ${hx - 16},${hy - 30} ${hx},${hy - 30} C${hx + 16},${hy - 30} ${hx + 30},${hy - 14} ${hx + 26},${shY + 4} Q${hx},${shY + 14} ${hx - 26},${shY + 4} Z`;
    s += `<defs>${clipOf('hood', hood)}</defs>` + rimmed('hood', hood, `url(#${P('top')})`, 4.5);
    s += `<path d="M${hx - 22},${shY - 2} Q${hx},${shY + 8} ${hx + 22},${shY - 2}" fill="none" stroke="${shade(top)}" stroke-width="2" opacity="0.6"/>`;
    return s;
  }
  s += rimmed('head', head, `url(#${P('skin')})`, turn ? 7 : 3.5);
  // une seule oreille, petite, couleur de peau, du côté tourné vers nous et vers
  // le soleil (deux oreilles claires de part et d'autre se lisaient comme un casque) ;
  // les cheveux longs, le carré et les boucles la couvrent
  if (!['long', 'carre', 'boucles'].includes(f.hair)) {
    s += `<ellipse cx="${f1(hx + 17.5 + turn)}" cy="${hy + 3}" rx="${turn ? 3.4 : 2.6}" ry="5.2" fill="${mixc(shade(skin), warm(skin), 0.45)}"/>`;
  }
  if (hair) s += rimmed('hair', hair, `url(#${P('hair')})`, 4, 0.85);
  // mèches : quelques traits plus sombres, pour la matière des cheveux
  if (hair && f.hair !== 'chauve') {
    const rr = rng(200 + i);
    s += `<g fill="none" stroke="${mixc(hc, '#0f0c10', 0.45)}" stroke-linecap="round" opacity="0.35" clip-path="url(#${P('chair')})">`;
    for (let k = 0; k < 9; k++) {
      const x = hx + hs - 14 + rr() * 28;
      s += `<path d="M${f1(x)},${hy - 20 + rr() * 6} Q${f1(x + (rr() - 0.5) * 8)},${hy} ${f1(x + (rr() - 0.5) * 6)},${hy + 14 + rr() * 30}" stroke-width="${f1(0.8 + rr())}"/>`;
    }
    s += '</g>';
  }
  if (f.hat) {
    const hat = `M${hx - 20},${hy - 2} C${hx - 21},${hy - 22} ${hx - 10},${hy - 29} ${hx},${hy - 29} C${hx + 10},${hy - 29} ${hx + 21},${hy - 22} ${hx + 20},${hy - 2} Q${hx},${hy + 3} ${hx - 20},${hy - 2} Z`;
    s += `<defs>${clipOf('hat', hat)}</defs>` + rimmed('hat', hat, `url(#${P('hat')})`, 4);
    s += `<path d="M${hx - 20},${hy - 7} Q${hx},${hy - 2} ${hx + 20},${hy - 7}" fill="none" stroke="${shade(CL[f.hat])}" stroke-width="3" opacity="0.7"/>`;
  }
  if (f.scarf) {
    const sc = `M${cx - 17},${shY - 10} Q${cx},${shY - 2} ${cx + 17},${shY - 10} L${cx + 19},${shY - 2} Q${cx},${shY + 8} ${cx - 19},${shY - 2} Z`;
    s += `<path d="${sc}" fill="url(#${P('scarf')})"/>`;
  }
  return s;
}
const GENS_SVG = FIGS.map((f, i) => figure(i, f)).join('');

// La file : derrière (près de nous) d'abord dans la liste, puis on la retourne
const LEGS_C = PANTS;
const FILE = (() => {
  const r = rng(31);
  const out = [];
  let Z = 7.1, prev = -1;
  for (let i = 0; Z < 92; i++) {
    let v = Math.floor(r() * 16);
    if (v === prev) v = (v + 5) % 16;
    prev = v;
    out.push({
      i, Z, v,
      h: 1.56 + r() * 0.32,
      w: 0.9 + r() * 0.24,
      pants: LEGS_C[Math.floor(r() * LEGS_C.length)],
      side: r() < 0.5 ? -1 : 1,
      off: 0.04 + r() * 0.26,
      ph: r() * TAU,
      lean: (r() - 0.5) * 0.04,
    });
    Z += 0.9 + r() * 0.5 + Z * 0.004;
  }
  return out.reverse();
})();

/* --------------------------------------------------------------------------
   La brume (un petit calque très flou) : de longs voiles qu'on fait dériver
   -------------------------------------------------------------------------- */
function brume() {
  const r = rng(91);
  let s = '<defs>';
  s += radial('w', [0, 0], 1, [[0, '#fbeee4', 0.9], [0.55, '#f1e1dc', 0.45], [1, '#ece0e2', 0]]);
  s += '</defs>';
  for (let i = 0; i < 26; i++) {
    const x = -200 + r() * 2320, y = 420 + r() * 150 * r(), w = 220 + r() * 520, h = 8 + r() * 18;
    const warm = Math.exp(-(((x - SUN[0]) / 500) ** 2));
    const col = mixc('#f3eaee', '#fff0dc', warm);
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w)}" ry="${f1(h)}" fill="${col}" opacity="${f1(0.35 + r() * 0.4)}"/>`;
  }
  return s;
}
const BBOX = [-240, 260, 2400, 480];

/* --------------------------------------------------------------------------
   Procédural : scintillements du soleil sur l'eau
   -------------------------------------------------------------------------- */
const GLINTS = (() => {
  const r = rng(5);
  return Array.from({ length: 300 }, () => {
    const k = Math.pow(r(), 1.7);
    return { v: SHORE + 3 + k * 780, u: (r() - 0.5) * (r() < 0.75 ? 1 : 2.4), l: 0.5 + r(), ph: r() * TAU, sp: 0.7 + r() * 2.4 };
  });
})();
function glints(c, T, kSun) {
  c.globalCompositeOperation = 'screen';
  for (const g of GLINTS) {
    const d = g.v - CY;
    const w = 26 + d * 0.62;
    const x = SUN[0] + g.u * w;
    const tw = Math.pow(0.5 + 0.5 * Math.sin(T * g.sp + g.ph), 3);
    const fall = Math.exp(-Math.abs(g.u) * 1.2) * (0.55 + 0.45 * Math.exp(-d / 240));
    const a = tw * fall * (0.75 + 0.25 * kSun);
    if (a < 0.03) continue;
    const L = (3 + d * 0.07) * g.l, th = 0.8 + d * 0.006;
    c.fillStyle = `rgba(255,240,212,${f1(a * 1000) / 1000})`;
    c.fillRect(x - L / 2, g.v - th / 2, L, th);
  }
}

/* --------------------------------------------------------------------------
   Procédural : le banc de brume du dernier plan. Des rangs de bourrelets
   posés sur l'eau, en perspective (plus gros devant), lavande dessous, dorés
   dessus du côté du soleil ; entre les rangs et dans les rangs, des trous où
   l'eau sombre réapparaît. Sur la bande des pontons la brume s'amincit : on
   doit lire les deux lames, bleue et rouge, et l'eau noire entre elles.
   -------------------------------------------------------------------------- */
const LOBES = (() => {
  const r = rng(77);
  const out = [];
  for (let row = 0; row < 15; row++) {
    const y = 488 + Math.pow(row / 14, 1.45) * 720 + r() * 10;
    const d = (y - CY) / 600;
    let x = -460 + r() * 200;
    while (x < 2500) {
      const rx = (60 + r() * 120) * (0.35 + d * 1.8);
      // un trou dans le rang : l'eau réapparaît
      if (r() < 0.3) { x += rx * (1.6 + r()); continue; }
      out.push({ x, y: y + (r() - 0.5) * 12 * (0.4 + d), rx, ry: rx * (0.2 + r() * 0.1), sp: 4 + r() * 6 });
      x += rx * (0.9 + r() * 0.6);
    }
  }
  return out;
})();
const HOLES = (() => {
  const r = rng(78);
  return Array.from({ length: 16 }, () => {
    const y = 560 + r() * 560, d = (y - CY) / 600;
    return { x: -200 + r() * 2300, y, rx: (120 + r() * 220) * (0.4 + d * 1.6), ry: (14 + r() * 18) * (0.4 + d * 1.8), sp: 3 + r() * 3 };
  });
})();
function lobe(c, x, y, rx, ry, col, a) {
  if (a < 0.01) return;
  c.save();
  c.translate(x, y);
  c.scale(rx, ry);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, rgba(col, a));
  g.addColorStop(0.55, rgba(col, a * 0.75));
  g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, 1, 0, TAU);
  c.fill();
  c.restore();
}
// La bande des pontons à la hauteur y (en coordonnées de l'image) : centre et demi-largeur
function band(y, s) {
  if (y <= CY + 2) return [CX, 0];
  const Z = (F * (V.H - DH)) / (y - CY) - V.B;
  const a = pr(-WP - s - 0.3, DH, Z)[0], b = pr(WP + s + 0.3, DH, Z)[0];
  return [(a + b) / 2, (b - a) / 2];
}
function brouillard(c, T, m, s) {
  const drift = (x, sp) => ((x + T * sp + 600) % 3200) - 600;
  // l'eau sombre qui réapparaît par les trous
  c.globalCompositeOperation = 'multiply';
  for (const H of HOLES) lobe(c, drift(H.x, H.sp), H.y, H.rx, H.ry * 1.3, '#50537c', 0.5 * m);
  c.globalCompositeOperation = 'source-over';
  for (const L of LOBES) {
    const x = drift(L.x, L.sp);
    if (x + L.rx < -500 || x - L.rx > 2500) continue;
    const [bc, bw] = band(L.y, s);
    // sur les pontons, la brume s'amincit
    const on = bw > 0 ? Math.exp(-Math.pow(Math.max(0, Math.abs(x - bc) - bw * 0.6) / (L.rx * 0.6 + 1), 2)) : 0;
    const a = m * (1 - 0.9 * on) * clamp((L.y - 484) / 40);
    const near = Math.exp(-(((x - SUN[0]) / 700) ** 2));
    // dessous lavande, corps clair, dessus doré du côté du soleil
    lobe(c, x, L.y + L.ry * 0.5, L.rx * 1.05, L.ry * 0.9, '#a9a1c4', 0.42 * a);
    lobe(c, x, L.y, L.rx, L.ry, mixc('#efe3e4', '#fbe6cf', near), 0.52 * a);
    lobe(c, x + L.rx * 0.18, L.y - L.ry * 0.45, L.rx * 0.62, L.ry * 0.5, mixc('#fbefe8', '#ffd9a0', 0.25 + 0.75 * near), (0.35 + 0.4 * near) * a);
  }
}

/* --------------------------------------------------------------------------
   Procédural : les pontons vus de haut et de loin (plan « fin »). Quand la
   caméra monte et recule, le calque peint (construit pour la caméra basse)
   ne convient plus : on les redessine simplement, petits, en vraie
   perspective, avec l'eau sombre qui les sépare.
   -------------------------------------------------------------------------- */
function pontonsLoin(c, s, T) {
  // vus de plus loin, les pontons continuent derrière l'ancienne caméra : on
  // ne voit jamais leur bout, ils sortent par le bas de l'image
  const Z0 = Math.max(ZN - 8, 2 - V.B);
  // l'eau entre les deux, puis le flanc du rouge (chenal)
  chenal(c, s, T, 1.6, Z0);
  for (const side of ['blue', 'red']) {
    const sg = side === 'blue' ? -1 : 1;
    const xa = sg * s, xb = sg * (s + WP);
    const base = C[side], dark = C[side + 'S'], light = C[side + 'L'];
    const quad = (x0, x1, z0, z1, y = DH) => [pr(x0, y, z0), pr(x1, y, z0), pr(x1, y, z1), pr(x0, y, z1)];
    // le bout du ponton, face à nous, et son reflet
    fillPoly(c, [pr(xa, -DH * 0.9, Z0), pr(xb, -DH * 0.9, Z0), pr(xb, 0, Z0), pr(xa, 0, Z0)]);
    c.fillStyle = 'rgba(70,72,108,0.35)';
    c.fill();
    fillPoly(c, [pr(xa, 0, Z0), pr(xb, 0, Z0), pr(xb, DH, Z0), pr(xa, DH, Z0)]);
    c.fillStyle = '#4e3f3c';
    c.fill();
    // le pont : la peinture, plus claire et voilée au loin
    const near = pr(0, DH, Math.max(Z0, 8)), far = pr(0, DH, 70);
    const gr = c.createLinearGradient(0, near[1], 0, far[1]);
    gr.addColorStop(0, side === 'blue' ? mixc(base, '#262a40', 0.12) : base);
    gr.addColorStop(0.5, mixc(base, light, 0.15));
    gr.addColorStop(1, mixc(base, C.haze, 0.5));
    fillPoly(c, quad(xa, xb, Z0, ZF));
    c.fillStyle = gr;
    c.fill();
    // les joints des planches, tant qu'on les distingue
    c.strokeStyle = rgba(mixc(dark, '#2a2230', 0.3), 0.32);
    c.lineWidth = 0.7;
    c.beginPath();
    for (let Z = Z0 + 0.162; Z < ZF; Z += 0.162) {
      const p0 = pr(xa, DH, Z), p1 = pr(xb, DH, Z);
      if (pr(0, DH, Z - 0.162)[1] - p0[1] < 2.2) break;
      c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]);
    }
    c.stroke();
    // les lisses de bois brut
    for (const [x0, x1] of [[xa, xa + sg * 0.11], [xb - sg * 0.12, xb]]) {
      fillPoly(c, quad(x0, x1, Z0, ZF));
      c.fillStyle = C.wood;
      c.fill();
    }
  }
  // la lumière rasante de droite réchauffe les ponts
  c.globalCompositeOperation = 'soft-light';
  fillPoly(c, [pr(-WP - s, DH, Z0), pr(WP + s, DH, Z0), pr(WP + s, DH, ZF), pr(-WP - s, DH, ZF)]);
  const g2 = c.createLinearGradient(pr(-WP - s, DH, Z0)[0], 0, pr(WP + s, DH, Z0)[0], 0);
  g2.addColorStop(0, 'rgba(255,213,152,0)');
  g2.addColorStop(1, 'rgba(255,213,152,0.5)');
  c.fillStyle = g2;
  c.fill();
  c.globalCompositeOperation = 'source-over';
}

/* --------------------------------------------------------------------------
   Procédural : l'eau qui s'ouvre entre les pontons
   -------------------------------------------------------------------------- */
const fillPoly = (c, ps) => { c.beginPath(); ps.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); };
function chenal(c, s, T, dark = 1, zn = ZN) {
  if (s <= 0.001) return;
  const zf = ZF;
  // l'eau sombre : on la voit de haut, entre deux murs, elle ne reflète plus le ciel
  const water = [pr(-s, DH, zn), pr(s, 0, zn), pr(s, 0, zf), pr(-s, DH, zf)];
  fillPoly(c, water);
  const a = pr(0, 0, 8), b = pr(0, 0, ZF);
  const gr = c.createLinearGradient(0, a[1], 0, b[1]);
  gr.addColorStop(0, '#1b1d2e');
  gr.addColorStop(0.55, '#33354d');
  gr.addColorStop(1, mixc('#9d93a6', '#3a3b55', clamp((dark - 1) * 2.4)));
  c.fillStyle = gr;
  c.fill();
  // un fil de ciel au fond du chenal, qui tremble à peine
  c.save();
  fillPoly(c, water);
  c.clip();
  c.globalCompositeOperation = 'screen';
  for (let k = 0; k < 26; k++) {
    const Z = 7 + k * 2.6 + Math.sin(T * 0.6 + k) * 0.3;
    const p0 = pr(-s * 0.2, 0, Z), p1 = pr(s * 0.6, 0, Z);
    const al = 0.08 + 0.08 * Math.sin(T * 1.3 + k * 1.7);
    c.strokeStyle = `rgba(232,214,214,${f1(Math.max(0, al) * 1000) / 1000})`;
    c.lineWidth = Math.max(0.6, 14 / Z);
    c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke();
  }
  c.restore();
  // le flanc du ponton rouge, à l'ombre, avec ses flotteurs
  const face = [pr(s, 0, zn), pr(s, DH, zn), pr(s, DH, zf), pr(s, 0, zf)];
  fillPoly(c, face);
  const g2 = c.createLinearGradient(0, a[1], 0, b[1]);
  g2.addColorStop(0, '#2e2833');
  g2.addColorStop(0.6, '#4d4250');
  g2.addColorStop(1, '#b4a2aa');
  c.fillStyle = g2;
  c.fill();
  fillPoly(c, [pr(s, 0, zn), pr(s, 0.09, zn), pr(s, 0.09, zf), pr(s, 0, zf)]);
  c.fillStyle = 'rgba(22,20,30,0.8)';
  c.fill();
  // la peinture rouge déborde un peu sur le haut du flanc
  fillPoly(c, [pr(s, DH * 0.82, zn), pr(s, DH, zn), pr(s, DH, zf), pr(s, DH * 0.82, zf)]);
  c.fillStyle = 'rgba(126,53,41,0.55)';
  c.fill();
}

/* --------------------------------------------------------------------------
   Procédural : les gens (pose, ombres portées, jambes)
   -------------------------------------------------------------------------- */
// Pose d'une personne pour un écart donné : pieds, bassin, échelle
// Les pieds sont posés à 20 cm de la jointure, au-delà de la double lisse : un
// pied bien sur le bleu, l'autre bien sur le rouge.
const FOOT = 0.2;
function pose(P, gap, T) {
  const s = SH * gap;
  const choose = seg(gap, 1.15, 1.7);
  let fl = -(FOOT + s), fr = FOOT + s;
  // au-delà d'un pas, chacun a fini sur un seul ponton, pieds joints
  const cs = P.side * (s + FOOT + P.off);
  fl = lerp(fl, cs - 0.11, choose);
  fr = lerp(fr, cs + 0.11, choose);
  const sway = 0.006 * Math.sin(T * 0.8 + P.ph);
  const L = 0.49 * P.h;
  const a = Math.max(0, (fr - fl) / 2 - 0.085);
  // les pieds écartés, on plie un peu les genoux et le bassin descend : un
  // équilibre calme, pas un compas
  const flex = clamp((fr - fl - 0.42) / 0.45) * (1 - choose);
  const hipH = Math.sqrt(Math.max(0.1, L * L - a * a)) - 0.035 * flex;
  return { fl, fr, xh: (fl + fr) / 2 + sway + P.lean * 0.2, hipH, s, flex };
}
// Ombres portées : le soleil est bas, devant à droite ; elles filent vers la gauche
const SD = (() => { const m = Math.hypot(-0.84, -0.55); return [-0.84 / m, -0.55 / m]; })();
const SLEN = 5.6; // longueur d'ombre par mètre de hauteur
function shadows(c, gap, T, k = 1) {
  // Chaque ombre est un peu plus large que la personne (pénombre du soleil bas),
  // pleine aux pieds, de plus en plus pâle vers la tête, et peinte en deux
  // passes (large et légère, puis plus étroite) pour un bord adouci
  const list = [];
  for (const P of FILE) {
    if (P.Z > 60) continue;
    const q = pose(P, gap, T);
    const at = (X, z, l) => pr(X + SD[0] * l, DH, z + SD[1] * l);
    const hl = q.hipH * SLEN, tl = P.h * SLEN;
    const shape = (w) => {
      const path = new Path2D();
      const add = (ps) => { ps.forEach((p, i) => (i ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1]))); path.closePath(); };
      // deux jambes qui se rejoignent au bassin, puis le corps, puis la tête
      for (const fx of [q.fl, q.fr]) add([at(fx - 0.05 * w, P.Z, 0), at(fx + 0.05 * w, P.Z, 0), at(q.xh + 0.08 * w, P.Z, hl), at(q.xh - 0.08 * w, P.Z, hl)]);
      add([at(q.xh - 0.17 * w, P.Z, hl), at(q.xh + 0.17 * w, P.Z, hl), at(q.xh + 0.21 * w, P.Z, tl * 0.84), at(q.xh - 0.21 * w, P.Z, tl * 0.84)]);
      add([at(q.xh - 0.1 * w, P.Z, tl * 0.84), at(q.xh + 0.1 * w, P.Z, tl * 0.84), at(q.xh + 0.08 * w, P.Z, tl), at(q.xh - 0.08 * w, P.Z, tl)]);
      return path;
    };
    list.push({ wide: shape(1.9), mid: shape(1.4), a: at(q.xh, P.Z, 0), b: at(q.xh, P.Z, tl) });
  }
  const s = SH * gap;
  c.globalCompositeOperation = 'multiply';
  // sur les ponts seulement, lavande
  for (const [xa, xb] of [[-WP - s, -s], [s, WP + s]]) {
    c.save();
    fillPoly(c, [pr(xa, DH, ZN), pr(xb, DH, ZN), pr(xb, DH, ZF), pr(xa, DH, ZF)]);
    c.clip();
    for (const L of list) {
      for (const [path, a0] of [[L.wide, 0.22], [L.mid, 0.36]]) {
        const gr = c.createLinearGradient(L.a[0], L.a[1], L.b[0], L.b[1]);
        gr.addColorStop(0, `rgba(108,100,158,${f1(a0 * k * 1000) / 1000})`);
        gr.addColorStop(0.45, `rgba(118,110,164,${f1(a0 * 0.7 * k * 1000) / 1000})`);
        gr.addColorStop(1, `rgba(130,122,172,${f1(a0 * 0.3 * k * 1000) / 1000})`);
        c.fillStyle = gr;
        c.fill(path);
      }
    }
    c.restore();
  }
}
function legs(c, P, q, alpha) {
  const k = ppm(P.Z); // pixels par mètre
  const hipY = DH + q.hipH;
  const pants = P.pants;
  const dark = mixc(mixc(pants, '#4d4a6c', 0.3), '#000000', 0.12);
  for (const side of [-1, 1]) {
    const foot = pr(side < 0 ? q.fl : q.fr, DH, P.Z);
    const hip = pr(q.xh + side * 0.085, hipY, P.Z);
    const dx = foot[0] - hip[0], dy = foot[1] - hip[1];
    const m = Math.hypot(dx, dy) || 1;
    const nx = -dy / m, ny = dx / m;
    const w0 = 0.085 * k, w1 = 0.05 * k;
    // genou : un peu plus haut que le milieu, poussé vers l'extérieur quand on plie
    const kb = (0.006 + 0.022 * (q.flex || 0)) * k;
    const knee = [hip[0] + dx * 0.47 - nx * kb * side, hip[1] + dy * 0.47 - ny * kb * side];
    c.beginPath();
    c.moveTo(hip[0] - nx * w0, hip[1] - ny * w0);
    c.quadraticCurveTo(knee[0] - nx * w0 * 0.8, knee[1] - ny * w0 * 0.8, foot[0] - nx * w1, foot[1] - ny * w1 - 0.04 * k);
    c.lineTo(foot[0] + nx * w1, foot[1] + ny * w1 - 0.04 * k);
    c.quadraticCurveTo(knee[0] + nx * w0 * 0.8, knee[1] + ny * w0 * 0.8, hip[0] + nx * w0, hip[1] + ny * w0);
    c.closePath();
    const gr = c.createLinearGradient(hip[0] - w0 * 1.2, 0, hip[0] + w0 * 1.2, 0);
    gr.addColorStop(0, mixc(dark, '#2e2c44', 0.2));
    gr.addColorStop(0.6, dark);
    gr.addColorStop(1, mixc(pants, '#ffc98a', side > 0 ? 0.4 : 0.15));
    c.globalAlpha = alpha;
    c.fillStyle = gr;
    c.fill();
    // le talon de la chaussure
    c.fillStyle = '#2a2524';
    c.beginPath();
    c.ellipse(foot[0], foot[1] - 0.025 * k, 0.06 * k, 0.04 * k, 0, 0, TAU);
    c.fill();
    if (side > 0 && k > 40) {
      c.fillStyle = 'rgba(255,214,150,0.5)';
      c.beginPath();
      c.ellipse(foot[0] + 0.045 * k, foot[1] - 0.03 * k, 0.015 * k, 0.03 * k, 0, 0, TAU);
      c.fill();
    }
  }
  c.globalAlpha = 1;
}

/* --------------------------------------------------------------------------
   Le décor
   -------------------------------------------------------------------------- */
const DEF = { gap: 0, mist: 0, sun: 0.3, lift: 0 };
const STRIP = 6;

export default {
  id: ID,
  bg: '#c9b6bf',
  home: { x: 960, y: 540, z: 1 },
  layers: {
    ciel: { box: [-240, -460, 2400, 960], svg: ciel(), filters: ['paint'] },
    eau: { box: [-240, 440, 2400, 800], svg: eau(), filters: ['paint'] },
    pontons: { box: PBOX, svg: pontons(), filters: [], res: 1.6 },
    gens: { box: [0, 0, COLS * CELL[0], 2 * CELL[1]], svg: GENS_SVG, filters: ['paint'], res: 2 },
    brume: { box: BBOX, svg: brume(), filters: ['b28'], res: 0.5 },
  },

  render(g, p, T, view) {
    const q = { ...DEF, ...p };
    const gap = Math.max(0, q.gap), s = SH * gap;
    const kSun = clamp(q.sun), mist = clamp(q.mist), lift = clamp(q.lift);
    // la caméra du décor (elle ne monte et ne recule que dans « fin »)
    V = viewOf(lift);
    const drift = T * 14;

    g.img('ciel');
    g.img('eau');
    g.fx(1, (c) => glints(c, T, kSun));
    // la brume lointaine, derrière les pontons
    g.img('brume', { alpha: 0.5, tf: { x: drift, y: 6 } });

    // Les pontons : collés, d'un seul tenant ; écartés, en fines bandes
    if (lift > 0) {
      g.fx(1, (c) => pontonsLoin(c, s, T));
    } else if (s < 0.0005) {
      g.img('pontons');
    } else {
      g.fx(1, (c) => chenal(c, s, T));
      const cam = view?.cam;
      let v0 = PBOX[1], v1 = PBOX[1] + PBOX[3];
      if (cam) {
        const hh = 540 / cam.z + 20;
        v0 = Math.max(v0, cam.y - hh); v1 = Math.min(v1, cam.y + hh);
      }
      const xj = (v) => CX + ((0 - CAMX) * (v - CY)) / (CAMH - DH);
      for (const sg of [-1, 1]) {
        for (let v = Math.max(CY + 26, v0); v < v1; v += STRIP) {
          const va = v - 0.6, vb = v + STRIP + 0.6;
          const dx = (sg * F * s) / zOfRow(v + STRIP / 2);
          const xe = sg < 0 ? PBOX[0] - 10 : PBOX[0] + PBOX[2] + 10;
          g.img('pontons', {
            tf: { x: dx },
            clip: (c) => fillPoly(c, [[xe, va], [xj(va), va], [xj(vb), vb], [xe, vb]]),
          });
        }
      }
    }

    // Ombres portées des gens
    g.fx(1, (c) => shadows(c, gap, T, 1 - 0.5 * mist));

    // La file, du plus lointain au plus proche
    for (const P of FILE) {
      const qq = pose(P, gap, T);
      // les lointains s'effacent dans l'air (selon leur distance à la caméra) ; dans
      // « fin », la file reste continue jusqu'au premier plan : c'est la distance
      // et le voile de brume qui empêchent de voir qui est où, pas le vide
      const alpha = 1 - 0.85 * clamp((P.Z + V.B - 18) / 70);
      if (alpha <= 0.04) continue;
      g.fx(1, (c) => {
        // petite ombre de contact sous les pieds
        const k = ppm(P.Z);
        c.globalCompositeOperation = 'multiply';
        c.fillStyle = `rgba(90,84,120,${f1(0.5 * alpha * 100) / 100})`;
        for (const X of [qq.fl, qq.fr]) {
          const f = pr(X, DH, P.Z);
          c.beginPath(); c.ellipse(f[0], f[1], 0.09 * k, 0.025 * k, 0, 0, TAU); c.fill();
        }
        c.globalCompositeOperation = 'source-over';
        legs(c, P, qq, alpha);
      });
      const hip = pr(qq.xh, DH + qq.hipH, P.Z);
      const kk = ppm(P.Z) * (P.h / 1.7) / UPM;
      const breath = 1 + 0.006 * Math.sin((T * TAU) / (3.8 + (P.i % 5) * 0.3) + P.ph);
      // quelques-uns, parmi les plus proches, déplacent à peine le poids du corps
      const shift = P.i < 7 && P.i % 2 === 0 ? 0.016 * Math.sin(T * 0.9 + P.ph) * Math.sin(T * 0.37 + P.i) : 0;
      const ox = (P.v % COLS) * CELL[0] + ANC[0], oy = Math.floor(P.v / COLS) * CELL[1] + ANC[1];
      g.img('gens', {
        alpha,
        tf: { ox, oy, x: hip[0] - ox, y: hip[1] - oy, sx: kk * P.w, sy: kk * breath, rot: P.lean + shift },
        clip: (c) => { c.beginPath(); c.rect(ox - ANC[0], oy - ANC[1], CELL[0], CELL[1]); },
      });
    }

    // L'air de l'aube : voile chaud sur les lointains, brume qui dérive
    g.fx(1, (c) => {
      const gr = c.createLinearGradient(0, CY - 20, 0, CY + 120);
      gr.addColorStop(0, 'rgba(250,226,206,0)');
      gr.addColorStop(0.2, 'rgba(250,226,206,0.22)');
      gr.addColorStop(1, 'rgba(250,226,206,0)');
      c.fillStyle = gr;
      c.fillRect(-300, CY - 20, 2500, 140);
    });
    g.img('brume', { alpha: 0.3, tf: { x: -drift * 0.7, y: 10, sy: 0.6, oy: 470 } });
    if (mist > 0.01) {
      // un banc de brume posé sur l'eau : un voile léger (0,5 au plus, la file
      // et les pontons restent lisibles dessous) qui donne à tous la même teinte
      // d'air lavande et or, puis des bourrelets qui roulent lentement
      g.fx(1, (c) => {
        const y0 = SHORE - 10, y1 = 1240;
        const gr = c.createLinearGradient(0, y0, 0, y1);
        const at = (y) => (y - y0) / (y1 - y0);
        gr.addColorStop(0, rgba('#f6e4da', 0));
        gr.addColorStop(at(490), rgba('#f3e2da', 0.22 * mist));
        gr.addColorStop(at(560), rgba('#ecdcdc', 0.4 * mist));
        gr.addColorStop(at(700), rgba('#e2d6de', 0.48 * mist));
        gr.addColorStop(1, rgba('#d4c9db', 0.5 * mist));
        c.fillStyle = gr;
        // la brume s'amincit au-dessus des pontons (0,3 au lieu de 0,5) : les deux
        // lames et l'eau noire entre elles restent lisibles d'un coup d'œil
        const deckBand = () => {
          const z0 = Math.max(ZN - 8, 2 - V.B);
          [pr(-WP - s - 0.2, DH, z0), pr(WP + s + 0.2, DH, z0), pr(WP + s + 0.2, DH, ZF), pr(-WP - s - 0.2, DH, ZF)]
            .forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
          c.closePath();
        };
        c.save();
        c.beginPath();
        c.rect(-600, y0, 3200, 1400);
        deckBand();
        c.clip('evenodd');
        c.fillRect(-600, y0, 3200, 1400);
        c.restore();
        c.save();
        c.globalAlpha = 0.6;
        c.beginPath();
        deckBand();
        c.fill();
        c.restore();
        // le soleil dore le dessus de la brume
        c.globalCompositeOperation = 'soft-light';
        const g2 = c.createRadialGradient(SUN[0], SHORE + 60, 0, SUN[0], SHORE + 60, 900);
        g2.addColorStop(0, rgba('#ffcf96', 0.6 * mist));
        g2.addColorStop(1, rgba('#ffcf96', 0));
        c.fillStyle = g2;
        c.fillRect(-600, SHORE - 200, 3200, 1400);
      });
      g.fx(1, (c) => brouillard(c, T, mist, s));
    }

    // Le soleil : halo doré qui déborde de la rive
    g.fx(1, (c) => {
      c.globalCompositeOperation = 'screen';
      const r = 520 + 120 * kSun;
      const gr = c.createRadialGradient(SUN[0], SUN[1], 0, SUN[0], SUN[1], r);
      gr.addColorStop(0, `rgba(255,228,180,${0.5 + 0.2 * kSun})`);
      gr.addColorStop(0.2, `rgba(255,210,160,${0.18 + 0.08 * kSun})`);
      gr.addColorStop(1, 'rgba(255,210,160,0)');
      c.fillStyle = gr;
      c.fillRect(SUN[0] - r, SUN[1] - r, 2 * r, 2 * r);
    });

    // Densité des valeurs, ombres lavande à gauche, chaleur à droite
    g.screen((c, W, H) => {
      c.globalCompositeOperation = 'soft-light';
      c.globalAlpha = 0.25;
      c.drawImage(c.canvas, 0, 0);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'multiply';
      let gr = c.createLinearGradient(0, 0, W, H * 0.4);
      gr.addColorStop(0, 'rgba(140,138,184,0.42)');
      gr.addColorStop(0.45, 'rgba(140,138,184,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'soft-light';
      gr = c.createRadialGradient(W * 0.78, H * 0.42, 0, W * 0.78, H * 0.42, W * 0.6);
      gr.addColorStop(0, `rgba(255,200,140,${0.22 + 0.1 * kSun})`);
      gr.addColorStop(1, 'rgba(255,200,140,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
    });
  },

  shots: {
    // Plan large d'établissement : le lac, les pontons collés, la file
    ouverture: {
      dur: 7,
      cam: (t, portrait) => {
        const k = 0.6 * ease.inOut(clamp(t / 7)) + 0.4 * clamp(t / 7);
        return portrait
          ? { x: lerp(1150, 1162, k), y: lerp(600, 600, k), z: lerp(0.92, 1.0, k) }
          : { x: lerp(960, 985, k), y: lerp(600, 612, k), z: lerp(1.0, 1.1, k) };
      },
      p: (t) => ({ gap: 0, mist: 0, sun: 0.2 + 0.1 * clamp(t / 7) }),
    },
    // Plus serré, sur l'arrière de la file : les pontons s'écartent
    ecart: {
      dur: 6,
      cam: (t, portrait) => {
        const k = 0.65 * ease.inOut(clamp(t / 6)) + 0.35 * clamp(t / 6);
        return portrait
          ? { x: lerp(1360, 1350, k), y: lerp(720, 726, k), z: lerp(1.3, 1.36, k) }
          : { x: lerp(1300, 1294, k), y: lerp(712, 716, k), z: lerp(1.72, 1.8, k) };
      },
      p: (t) => ({ gap: seg(t, 0.7, 5.3), mist: 0, sun: 0.35 + 0.1 * clamp(t / 6) }),
    },
    // La caméra s'élève et recule, vers le ciel et la brume : les pontons
    // deviennent deux lames étroites, bleue et rouge, séparées d'eau sombre ;
    // la file, petite et voilée, s'y tient encore, on ne voit plus qui est où
    fin: {
      dur: 7.5,
      cam: (t, portrait) => {
        const k = 0.7 * ease.inOut(clamp(t / 7.5)) + 0.3 * clamp(t / 7.5);
        return portrait
          ? { x: lerp(1080, 1050, k), y: lerp(480, 340, k), z: lerp(0.96, 0.9, k) }
          : { x: lerp(965, 935, k), y: lerp(470, 330, k), z: lerp(0.96, 0.86, k) };
      },
      p: (t) => {
        const k = 0.7 * ease.inOut(clamp(t / 7.5)) + 0.3 * clamp(t / 7.5);
        return { gap: lerp(1.9, 2.1, clamp(t / 7.5)), mist: 0.85 + 0.15 * seg(t, 0, 6), sun: 0.5 + 0.4 * clamp(t / 7.5), lift: lerp(0.2, 1, k) };
      },
    },
  },
};
