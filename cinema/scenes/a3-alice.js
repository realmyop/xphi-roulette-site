/* ==========================================================================
   Décor « a3-alice » — Acte 3, le lac. La même scène que « a3-lac », mais
   une personne, Alice, est assise et attachée sur une chaise au milieu du
   ponton bleu.

   Alice (fiche de la bible) : une trentaine d'années, cheveux noirs bouclés
   courts, pull moutarde passé, pantalon gris chaud. Elle est assise bien
   droite sur une simple chaise en bois clair à accoudoirs, les avant-bras
   posés sur les accoudoirs et liés au poignet par quelques tours d'une corde
   de chanvre claire, les mains abandonnées au bout du bois. Presque de
   profil, tournée vers la droite : elle regarde la file. Calme, digne : ni
   bâillon, ni larmes, ni lien serré au cou ou aux jambes.

   Derrière elle, floue (longue focale, profondeur de champ courte), la file
   des participants debout sur la jointure, un pied sur chaque ponton ; elle
   part à sa droite et fuit vers la gauche jusqu'au bout des pontons, dans la
   brume. À droite, le ponton rouge et le lac. Le soleil vient de se lever,
   hors champ en haut à droite : liseré d'or sur le profil d'Alice et sur le
   côté droit des silhouettes, longues ombres lavande couchées vers nous et
   vers la gauche sur les planches bleues, scintillements sur l'eau.

   La file s'interrompt derrière la tête d'Alice (entre 7 et 10 m) : personne
   ne dépasse au-dessus de ses boucles, et devant son regard il reste une
   trouée de ciel et de brume. Les deux plus proches sont voilés et franchement
   flous : la mise au point est sur elle.

   Construction : la caméra est posée à 1,10 m au-dessus des planches (à
   hauteur du regard d'une personne assise), juste au-delà du bord gauche du
   ponton bleu, tournée de 14° vers la droite. Les pontons, les ombres et les
   gens sont construits en mètres puis projetés (pr) ; Alice et sa chaise
   sont dessinées à la main dans un repère local (pixels à sa profondeur),
   posé sur le point du siège. La profondeur de champ est peinte : les
   planches sont doublées de copies floues fondues en haut (le lointain) et
   en bas (le premier plan) ; la file est floutée par paquets de profondeur.
   Les joints des planches et les ombres sont dans un calque à part, sans la
   texture de peinture : de longs traits ondulés se liraient comme des vagues.

   Paramètres (p) :
     breath  0 → 1   amplitude de la respiration d'Alice (1 par défaut)
     mist    0 → 1   densité de la brume qui passe entre Alice et la file (la
                     nappe qui traverse derrière sa tête, de droite à gauche)
     sun     0 → 1   le soleil monte un peu : la lumière s'intensifie

   Plan : « alice » (7 s). Lente poussée vers Alice ; elle respire (le buste
   seul, au-dessus des accoudoirs), cligne une fois des yeux, une nappe de
   brume passe derrière elle. En 16:9, tout son corps reste au-dessus des
   sous-titres. La fin du plan sert d'image figée du choix.
   ========================================================================== */
import { rng } from '../kit.js';
import { TAU, clamp, lerp, ease, seg } from '../../film/engine.js';

const ID = 'a3-alice';
const u = (n) => `${ID}-${n}`;
const url = (n) => `url(#${ID}-${n})`;
const f1 = (v) => +v.toFixed(1);
const xy = (p) => `${f1(p[0])} ${f1(p[1])}`;
const ptS = (p) => `${f1(p[0])},${f1(p[1])}`;
const poly = (ps, a = '') => `<polygon points="${ps.map(ptS).join(' ')}" ${a}/>`;
const stops = (s) => s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
const grad = (id, a, b, s) =>
  `<linearGradient id="${u(id)}" gradientUnits="userSpaceOnUse" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}">${stops(s)}</linearGradient>`;
const radial = (id, c, r, s, sy = 1) =>
  `<radialGradient id="${u(id)}" gradientUnits="userSpaceOnUse" cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r)}"` +
  (sy !== 1 ? ` gradientTransform="translate(0 ${f1(c[1] * (1 - sy))}) scale(1 ${sy})"` : '') + `>${stops(s)}</radialGradient>`;
const blurF = (id, s) => `<filter id="${u(id)}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`;

// Couleurs : mélange de deux teintes hexadécimales
const rgbOf = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixc = (a, b, k) => {
  const A = rgbOf(a), B = rgbOf(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join('');
};
const rgba = (h, a) => { const [r, g, b] = rgbOf(h); return `rgba(${r},${g},${b},${f1(a * 1000) / 1000})`; };

// Courbe lisse (Catmull-Rom → Bézier) le long d'une suite de points ;
// un point [x, y, 1] marque un angle vif.
function arc(a, i0, i1, closed = true) {
  const n = a.length;
  const at = (i) => (closed ? a[((i % n) + n) % n] : a[Math.max(0, Math.min(n - 1, i))]);
  const k = 1 / 6;
  let d = `M${xy(at(i0))}`;
  for (let i = i0; i < i1; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${xy(c1)} ${xy(c2)} ${xy(p2)}`;
  }
  return d;
}
const shape = (a) => arc(a, 0, a.length) + 'Z';
const open = (a) => arc(a, 0, a.length - 1, false);
const norm = ([x, y]) => { const m = Math.hypot(x, y) || 1; return [x / m, y / m]; };

// Contour d'un « boudin » (bras, jambe, montant) le long d'un axe, rayons variables
function tube(c, r) {
  const n = c.length, A = [], B = [];
  const tan = (i) => norm([c[Math.min(n - 1, i + 1)][0] - c[Math.max(0, i - 1)][0], c[Math.min(n - 1, i + 1)][1] - c[Math.max(0, i - 1)][1]]);
  for (let i = 0; i < n; i++) {
    const [tx, ty] = tan(i);
    A.push([c[i][0] - ty * r[i], c[i][1] + tx * r[i]]);
    B.push([c[i][0] + ty * r[i], c[i][1] - tx * r[i]]);
  }
  const cap = (i, angles) => {
    const [tx, ty] = tan(i);
    return angles.map((a) => [c[i][0] + r[i] * (Math.cos(a) * tx - Math.sin(a) * ty), c[i][1] + r[i] * (Math.cos(a) * ty + Math.sin(a) * tx)]);
  };
  const q = Math.PI / 4;
  return [...A, ...cap(n - 1, [q, 0, -q]), ...B.reverse(), ...cap(0, [-3 * q, Math.PI, 3 * q])];
}

/* --------------------------------------------------------------------------
   La scène, en mètres. X vers la droite (0 = la jointure, le bleu à gauche),
   Y vers le haut (0 = le dessus des planches), Z vers le fond. La caméra est
   en (CAMX, CAMH, 0), regard horizontal tourné de YAW vers la droite.
   -------------------------------------------------------------------------- */
const F = 1800, CXS = 840, CY = 330, CAMX = -2.45, CAMH = 1.1;
const YAW = (14 * Math.PI) / 180, SN = Math.sin(YAW), CS = Math.cos(YAW);
const zcOf = (X, Z) => (X - CAMX) * SN + Z * CS;
const pr = (X, Y, Z) => {
  const dx = X - CAMX, xc = dx * CS - Z * SN, zc = dx * SN + Z * CS;
  return [CXS + (F * xc) / zc, CY + (F * (CAMH - Y)) / zc];
};
const DH = 0.32;            // hauteur des planches au-dessus de l'eau
const WP = 2.3;             // largeur d'un ponton
const ZN = 1.4, ZF = 125;   // les pontons, de sous la caméra au bout de la file
const SHORE = 337;          // ligne d'eau des rives lointaines
const VPX = CXS - F * Math.tan(YAW); // point de fuite des pontons
// Le soleil : hors champ, en haut à droite. Direction vers le soleil (monde)
const SUNV = (() => { const az = (40 * Math.PI) / 180, el = (12 * Math.PI) / 180; return [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]; })();
const SUN = [1730, -110];   // où il serait sur l'image
// Ombre portée sur les planches d'un point (X, Y, Z)
const onDeck = (X, Y, Z) => [X - (SUNV[0] * Y) / SUNV[1], 0, Z - (SUNV[2] * Y) / SUNV[1]];
// Voile de l'air : les lointains se fondent dans la lumière de l'aube
const HAZE = (Z) => 1 - Math.exp(-Z / 55);

// Palette de la bible (Acte 3)
const C = {
  blue: '#5d7fa6', blueS: '#3c5675', blueL: '#8fb0d1',
  red: '#b5523f', redS: '#7e3529', redL: '#d9826b',
  wood: '#8a6a4c', woodS: '#5e4838', woodL: '#b8936a',
  peach: '#f2c9a8', lav: '#b9b4cf', gold: '#ffd598', haze: '#e9cfc2', rim: '#ffd28c',
};

/* --------------------------------------------------------------------------
   Alice et la chaise : repère local en pixels (à sa profondeur, ~377 px/m),
   origine au milieu du siège, u vers la droite, v vers le bas.
   -------------------------------------------------------------------------- */
const AX = -1.35, AZ = 4.6, SEATH = 0.46;
const O = pr(AX, SEATH, AZ);                  // le siège, à l'image
const K = F / zcOf(AX, AZ);                   // pixels par mètre chez Alice
const L2W = ([a, b]) => [O[0] + a, O[1] + b];
const AL = {
  skin: '#c48d6c', skinSh: '#8f6458', skinDeep: '#6c4a48', skinLit: '#f0b98a',
  hair: '#1e1819', hairDeep: '#0f0c0e', hairLit: '#4a3a36',
  knit: '#c49a3a', knitSh: '#8e7a52', knitDeep: '#5f5246', knitLit: '#efc565',
  pants: '#958879', pantsSh: '#6d6463', pantsDeep: '#4e4849', pantsLit: '#d2b896',
  shoe: '#6b5d52', sole: '#d8ccb8',
  wood: '#b58d5f', woodSh: '#76604f', woodDeep: '#4f4342', woodLit: '#ecc283',
  rope: '#d6c393', ropeSh: '#94836a', ropeLit: '#fbe8bd',
};

/* --------------------------------------------------------------------------
   Le ciel, les montagnes, les rives et l'eau (un calque, flou de lointain)
   -------------------------------------------------------------------------- */
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
function trees(seed, ps, hmin, hmax) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < ps.length - 1; i++) {
    const [x, y] = ps[i], [x2, y2] = ps[i + 1];
    const n = Math.max(1, Math.round((x2 - x) / 9));
    for (let j = 0; j < n; j++) {
      const k = j / n, xx = lerp(x, x2, k), yy = lerp(y, y2, k);
      const h = lerp(hmin, hmax, r()), w = 3 + r() * 3;
      out.push([xx - w, yy + 1], [xx - w * 0.25, yy - h * 0.55], [xx, yy - h], [xx + w * 0.25, yy - h * 0.55], [xx + w, yy + 1]);
    }
  }
  return out;
}
const closeDown = (ps, yb) => [...ps, [ps[ps.length - 1][0], yb], [ps[0][0], yb]];
const MONTS = closeDown(ridge(4, -260, 2180, 10, (x) => SHORE - 38 + 0.012 * (x - 900), [[92, 680, 1.6], [44, 290, 1.3], [16, 120, 1.2]]), SHORE + 2);
const COLLINES = closeDown(ridge(9, -260, 2180, 12, SHORE - 20, [[44, 560, 1.1], [18, 210, 1.2]]), SHORE + 2);
const RIVE_G = (() => {
  const top = ridge(14, -260, 760, 14, (x) => SHORE - 16 - 40 * clamp((520 - x) / 700), [[18, 300, 1], [8, 90, 1]]);
  top.push([820, SHORE - 1]);
  return closeDown(trees(15, top, 6, 18), SHORE + 2);
})();
const RIVE_D = (() => {
  const base = (x) => SHORE - 8 - 120 * Math.pow(clamp((x - 1250) / 900), 0.75);
  const top = [[1120, SHORE - 1], ...ridge(23, 1160, 2180, 14, base, [[16, 260, 1], [7, 80, 1]])];
  return closeDown(trees(24, top, 7, 20), SHORE + 2);
})();

function fond() {
  const r = rng(43);
  const mirror = (ps) => ps.map(([x, y]) => [x, 2 * SHORE - y]);
  let s = '<defs>';
  s += grad('ciel', [0, -160], [0, SHORE], [[0, '#9b98bd'], [0.35, '#b3add0'], [0.62, '#d9bfc6'], [0.82, '#f2c9a8'], [1, '#fbe2c5']]);
  s += radial('halo', SUN, 1500, [[0, '#fff4da', 1], [0.1, '#ffe2b2', 0.8], [0.3, '#f8cb9c', 0.4], [0.6, '#f2c2a2', 0.12], [1, '#f2c2a2', 0]], 0.8);
  s += grad('monts', [-240, 0], [2160, 0], [[0, '#a29fbf'], [0.4, '#b3abc7'], [0.75, '#dcc3c3'], [1, '#e8cbbb']]);
  s += grad('collines', [-240, 0], [2160, 0], [[0, '#8a8bad'], [0.5, '#a09ab6'], [1, '#c9adb0']]);
  s += grad('riveG', [0, SHORE - 70], [0, SHORE], [[0, '#6b7092'], [1, '#777b99']]);
  s += grad('riveD', [1100, 0], [2160, 0], [[0, '#7c7896'], [0.5, '#6f6886'], [1, '#7e6f86']]);
  s += grad('eau', [0, SHORE], [0, 1240], [[0, '#f8dcc2'], [0.05, '#e8c9c0'], [0.15, '#c9b4c6'], [0.35, '#9d9bbf'], [0.6, '#7b7fa6'], [1, '#585e85']]);
  s += `<radialGradient id="${u('colonne')}" gradientUnits="userSpaceOnUse" cx="${SUN[0]}" cy="${SHORE}" r="900" gradientTransform="translate(${f1(SUN[0] * 0.8)} 0) scale(0.2 1)">${stops([[0, '#ffe6bd', 0.85], [0.3, '#f9cfa3', 0.4], [1, '#f7c99d', 0]])}</radialGradient>`;
  s += blurF('f2', 1.6) + blurF('f4', 4) + blurF('f8', 8) + blurF('f14', 14);
  s += '</defs>';
  s += `<rect x="-240" y="-160" width="2400" height="${SHORE + 164}" fill="${url('ciel')}"/>`;
  s += `<rect x="-240" y="-160" width="2400" height="${SHORE + 164}" fill="${url('halo')}"/>`;
  // de longues bandes de nuages d'altitude, éclairées par-dessous près du soleil
  s += `<g filter="${url('f8')}">`;
  for (let i = 0; i < 11; i++) {
    const y = -130 + Math.pow(r(), 0.9) * 360, x = -260 + r() * 2300;
    const w = 380 + r() * 800, h = 12 + r() * 18;
    const near = Math.exp(-(((x - SUN[0]) / 700) ** 2));
    const body = mixc('#9f9abd', '#c8b2c4', 0.3 + 0.4 * (i / 10));
    const lit = mixc('#f0c3b6', '#ffdcae', near);
    for (let k = 0; k < 6; k++) {
      const xx = x + (k - 2.5) * w * 0.15 + r() * 40, ww = w * (0.16 + r() * 0.14), hh = h * (0.5 + r() * 0.8);
      s += `<ellipse cx="${f1(xx)}" cy="${f1(y)}" rx="${f1(ww)}" ry="${f1(hh)}" fill="${body}" opacity="${f1(0.45 + r() * 0.3)}"/>`;
    }
    s += `<ellipse cx="${f1(x + 50)}" cy="${f1(y + h * 0.55)}" rx="${f1(w * 0.42)}" ry="${f1(Math.max(3, h * 0.35))}" fill="${lit}" opacity="${f1(0.5 + 0.45 * near)}"/>`;
  }
  s += '</g>';
  // l'horizon : montagnes lavande, collines, rives boisées
  s += poly(MONTS, `fill="${url('monts')}" filter="${url('f2')}"`);
  s += `<rect x="-240" y="${SHORE - 70}" width="2400" height="72" fill="#f3d6c4" opacity="0.35" filter="${url('f14')}"/>`;
  s += poly(COLLINES, `fill="${url('collines')}" filter="${url('f2')}"`);
  s += `<rect x="-240" y="${SHORE - 30}" width="2400" height="34" fill="#f6dccb" opacity="0.35" filter="${url('f8')}"/>`;
  s += poly(RIVE_G, `fill="${url('riveG')}"`);
  s += poly(RIVE_D, `fill="${url('riveD')}"`);
  // la crête de droite prend le premier soleil
  s += `<path d="${'M' + RIVE_D.slice(0, -2).filter((_, i) => i % 5 === 2).map(xy).join(' L')}" fill="none" stroke="#ffd59a" stroke-width="2.4" opacity="0.7" filter="${url('f2')}"/>`;
  // l'eau : miroir du ciel et des rives
  s += `<rect x="-240" y="${SHORE - 2}" width="2400" height="${1222 - SHORE}" fill="${url('eau')}"/>`;
  s += `<rect x="-240" y="${SHORE - 2}" width="2400" height="${1222 - SHORE}" fill="${url('colonne')}"/>`;
  s += `<g filter="${url('f4')}">`;
  s += poly(mirror(MONTS), `fill="#b4a8c2" opacity="0.5"`);
  s += poly(mirror(COLLINES), `fill="#9890b0" opacity="0.6"`);
  s += poly(mirror(RIVE_G), `fill="#686d90" opacity="0.8"`);
  s += poly(mirror(RIVE_D), `fill="#655f80" opacity="0.8"`);
  s += '</g>';
  s += `<rect x="-240" y="${SHORE - 3}" width="2400" height="12" fill="#fde6cf" opacity="0.7" filter="${url('f4')}"/>`;
  // rides : de longs traits horizontaux, fins au loin, plus larges devant
  for (let i = 0; i < 300; i++) {
    const k = Math.pow(r(), 1.5);
    const y = SHORE + 5 + k * 860;
    const d = (y - CY) / 700;
    const x = -240 + r() * 2400;
    const w = (24 + r() * 120) * (0.4 + d * 2.4);
    const h = 0.6 + d * 2.6;
    const near = Math.exp(-(((x - SUN[0]) / (160 + d * 500)) ** 2));
    const light = r() < 0.55;
    const col = light ? mixc('#d9cde0', '#ffe2bd', near) : mixc('#6f7096', '#8a7a8e', near);
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w / 2)}" ry="${f1(h / 2)}" fill="${col}" opacity="${f1((light ? 0.22 : 0.18) + 0.3 * near)}"/>`;
  }
  return s;
}

/* --------------------------------------------------------------------------
   La file (avant les pontons : leurs ombres sont peintes sur les planches)
   -------------------------------------------------------------------------- */
const SKIN = ['#efcfb4', '#e3b48f', '#c99670', '#a8735a', '#7d5341', '#f2d6c2', '#d2a07c'];
const HAIRC = ['#211b19', '#3d2c22', '#5e4330', '#9a928c', '#dcd6cf', '#6c6560', '#a8875e'];
// Vêtements sourds : ni bleu franc ni rouge franc, ni les couleurs des Actes 1 et 2
const TOPS = ['#9f7c48', '#8b8178', '#899a7f', '#dccfb6', '#6c4e3a', '#76576b', '#c0ab88', '#6e6c4b', '#7d6e63', '#4b4643', '#8e7f8c', '#cfc2a6', '#94693f', '#a49a73', '#e6ddca'];
const PANTS = ['#4b4540', '#6a5a4a', '#857b6c', '#58563f', '#3c3836', '#ab9d82', '#6b625f', '#5a4a40'];
const FILE = (() => {
  const r = rng(61);
  const out = [];
  let Z = 5.9;
  for (let i = 0; Z < 110; i++) {
    out.push({
      i, Z,
      h: 1.58 + r() * 0.3, w: 0.9 + r() * 0.25,
      top: TOPS[Math.floor(r() * TOPS.length)], pants: PANTS[Math.floor(r() * PANTS.length)],
      skin: SKIN[Math.floor(r() * SKIN.length)], hair: HAIRC[Math.floor(r() * HAIRC.length)],
      kind: Math.floor(r() * 6), coat: r() < 0.35, lean: (r() - 0.5) * 0.03, sx: (r() - 0.5) * 0.05,
      // la jambe qui se repose (un genou plie, la hanche descend de ce côté)
      rest: r() < 0.5 ? -1 : 1, veil: 0,
    });
    Z += 1.0 + r() * 0.5 + Z * 0.012;
    // Derrière la tête d'Alice, la file s'interrompt : les gens qui se
    // tiendraient là (entre 7 et 10 m) dépasseraient au-dessus de ses boucles
    // comme une auréole. La caméra n'en voit rien : Alice cache la trouée, et
    // devant son regard il reste du ciel et de la brume.
    if (i === 1) Z = 10;
  }
  // les deux plus proches, ceux qu'Alice regarde : des teintes plus profondes,
  // mais voilées par l'air et la brume (la mise au point est sur Alice)
  Object.assign(out[0], { top: '#6c4e3a', pants: '#4b4540', kind: 0, hair: '#3d2c22', coat: true, veil: 0.16, h: 1.64, rest: 1 });
  Object.assign(out[1], { top: '#76576b', pants: '#58563f', veil: 0.1, rest: -1 });
  // juste derrière sa tête : des cheveux de teinte moyenne, ni pâles (auréole)
  // ni noirs (ils se confondraient avec ses boucles)
  for (const P of out.slice(2, 5)) Object.assign(P, { hair: '#5e4330', kind: P.kind === 4 ? 0 : P.kind });
  return out;
})();

// Une silhouette debout, de dos (trois quarts), un pied sur chaque ponton.
// Dessinée en centimètres autour de ses pieds, puis posée et mise à l'échelle.
function personne(P) {
  const hz = clamp(HAZE(P.Z) * 0.85 + P.veil);
  const air = (c) => mixc(c, C.haze, hz);
  const shade = (c) => air(mixc(mixc(c, '#5a5878', 0.36), '#000000', 0.14));
  const warm = (c) => air(mixc(c, '#ffc98a', 0.42));
  const H = P.h * 100, W = P.w;
  const hip = H * 0.52, sh = H * 0.815, hc = H * 0.925, hr = H * 0.064;
  const sw = 21 * W, ww = 16 * W, hw = 18 * W;
  const hem = P.coat ? hip - 24 : hip - 5;
  const id = u(`p${P.i}`);
  let s = `<defs><linearGradient id="${id}t" x1="0" y1="0" x2="1" y2="0">${stops([[0, shade(P.top)], [0.6, shade(P.top)], [0.88, mixc(shade(P.top), warm(P.top), 0.55)], [1, warm(P.top)]])}</linearGradient>` +
    `<linearGradient id="${id}k" x1="0" y1="0" x2="1" y2="0">${stops([[0, shade(P.skin)], [0.65, shade(P.skin)], [1, warm(P.skin)]])}</linearGradient>` +
    `<linearGradient id="${id}j" x1="0" y1="0" x2="1" y2="0">${stops([[0, shade(P.pants)], [0.7, shade(P.pants)], [1, mixc(shade(P.pants), warm(P.pants), 0.6)]])}</linearGradient></defs>`;
  // les jambes, un pied sur chaque ponton ; la jambe au repos plie le genou
  // vers l'intérieur et son talon se soulève un peu
  const leg = (k) => {
    const b = k === P.rest ? 1 : 0, kx = -k * 3.5 * b, fy = -3 * b;
    return shape([[k * 1, -hip + 4], [k * 15, -hip + 2], [k * 17 + kx, -hip * 0.5], [k * 21 + kx * 0.4, -8 + fy], [k * 21 + kx * 0.4, -2 + fy, 1], [k * 10 + kx * 0.4, -2 + fy, 1], [k * 9 + kx, -hip * 0.5], [k * 1, -hip * 0.62]]);
  };
  s += `<path d="${leg(-1)}" fill="${shade(P.pants)}"/><path d="${leg(1)}" fill="url(#${id}j)"/>`;
  for (const k of [-1, 1]) {
    const b = k === P.rest ? 1 : 0;
    s += `<ellipse cx="${f1(k * 16 - k * 1.4 * b)}" cy="${f1(-2.5 - 3 * b)}" rx="${f1(8 - 0.8 * b)}" ry="${f1(4 - 0.6 * b)}" fill="${air('#2a2524')}"/>`;
  }
  // les bras le long du corps, le bras droit dans le soleil
  const arm = (k) => shape(tube([[k * (sw - 5), -sh + 6], [k * (sw + 1), -sh * 0.68], [k * (hw + 4), -hip + 4]], [6.5, 5.6, 4.8]));
  // les mains, petites, assombries par le contre-jour, à moitié dans les manches
  const hand = (k, col) => `<ellipse cx="${f1(k * (hw + 3.6))}" cy="${f1(-hip + 8.5)}" rx="3" ry="4.2" fill="${col}"/>`;
  const handC = air(mixc(mixc(P.skin, '#8a6a5a', 0.6), '#3a2c2c', 0.15));
  s += hand(-1, mixc(handC, '#2e2a3a', 0.2));
  s += `<path d="${arm(-1)}" fill="${shade(P.top)}"/>`;
  // le torse (manteau ou pull)
  const torso = shape([
    [-7, -sh - 3], [-sw * 0.75, -sh - 0.5], [-sw, -sh + 6], [-sw - 1, -sh + 22], [-ww, -hip - 14], [-hw - (P.coat ? 3 : 0), -hem, 1],
    [hw + (P.coat ? 3 : 0), -hem, 1], [ww, -hip - 14], [sw + 1, -sh + 22], [sw, -sh + 6], [sw * 0.75, -sh - 0.5], [7, -sh - 3],
  ]);
  s += `<path d="${torso}" fill="url(#${id}t)"/>`;
  if (P.coat) s += `<path d="M0 ${f1(-hip - 6)} L0 ${f1(-hem)}" stroke="${shade(mixc(P.top, '#000000', 0.3))}" stroke-width="1.4" opacity="0.6"/>`;
  s += `<path d="M${f1(-sw * 0.5)} ${f1(-sh + 16)} Q0 ${f1(-sh + 22)} ${f1(sw * 0.4)} ${f1(-sh + 14)}" fill="none" stroke="${shade(mixc(P.top, '#000000', 0.3))}" stroke-width="1.6" opacity="0.4"/>`;
  s += hand(1, handC);
  s += `<path d="${arm(1)}" fill="url(#${id}t)"/>`;
  // nuque et tête
  s += `<path d="M-5.5 ${f1(-sh - 2)} L-4.5 ${f1(-hc + hr * 0.4)} L4.5 ${f1(-hc + hr * 0.4)} L5.5 ${f1(-sh - 2)} Z" fill="${shade(P.skin)}"/>`;
  s += `<ellipse cx="0" cy="${f1(-hc)}" rx="${f1(hr * 0.84)}" ry="${f1(hr * 1.06)}" fill="url(#${id}k)"/>`;
  // de dos : c'est l'oreille droite qu'on voit, dans le soleil
  s += `<ellipse cx="${f1(hr * 0.8)}" cy="${f1(-hc + 1)}" rx="2.4" ry="4" fill="${warm(P.skin)}"/>`;
  // les cheveux couvrent l'arrière de la tête : six manières (court, long,
  // chignon, bonnet, gris, carré)
  const hcol = air(P.hair), x0 = -hr * 0.9, x1 = hr * 0.88;
  const cap = (yb, col, wide = 0) => `<path d="M${f1(x0 - wide)} ${f1(-hc + hr * 0.15)} C${f1(x0 - wide)} ${f1(-hc - hr * 1.4)} ${f1(x1 + wide)} ${f1(-hc - hr * 1.4)} ${f1(x1 + wide)} ${f1(-hc + hr * 0.15)} ` +
    `C${f1(x1 + wide)} ${f1(yb - hr * 0.2)} ${f1(x1 * 0.5)} ${f1(yb)} 0 ${f1(yb)} C${f1(x0 * 0.5)} ${f1(yb)} ${f1(x0 - wide)} ${f1(yb - hr * 0.2)} ${f1(x0 - wide)} ${f1(-hc + hr * 0.15)} Z" fill="${col}"/>`;
  switch (P.kind) {
    case 0: s += cap(-hc + hr * 0.75, hcol); break;
    case 1: s += cap(-sh + 12, hcol, 1.5); break;
    case 2: s += cap(-hc + hr * 0.7, hcol) + `<circle cx="-1" cy="${f1(-hc + hr * 0.15)}" r="${f1(hr * 0.42)}" fill="${mixc(hcol, '#000000', 0.15)}"/>`; break;
    case 3: s += cap(-hc + hr * 0.8, hcol) + `<path d="M${f1(x0 - 1)} ${f1(-hc - hr * 0.05)} C${f1(x0 - 1)} ${f1(-hc - hr * 1.55)} ${f1(x1 + 1)} ${f1(-hc - hr * 1.55)} ${f1(x1 + 1)} ${f1(-hc - hr * 0.05)} Z" fill="${air(TOPS[(P.i * 7) % TOPS.length])}"/>`; break;
    case 4: s += cap(-hc + hr * 0.7, air('#b9b1aa')); break;
    default: s += cap(-hc + hr * 1.05, hcol, 1.2);
  }
  // liseré d'or à droite (le soleil est devant eux, à droite)
  const rim = air(C.rim);
  s += `<path d="M${f1(hr * 0.6)} ${f1(-hc - hr * 0.95)} Q${f1(hr * 1.05)} ${f1(-hc - hr * 0.3)} ${f1(hr * 0.78)} ${f1(-hc + hr * 0.7)}" fill="none" stroke="${rim}" stroke-width="2.4" opacity="0.9"/>`;
  s += `<path d="M${f1(sw * 0.8)} ${f1(-sh + 0.5)} Q${f1(sw + 7)} ${f1(-sh + 6)} ${f1(sw + 7)} ${f1(-sh + 26)} L${f1(hw + 8)} ${f1(-hip + 4)}" fill="none" stroke="${rim}" stroke-width="2.6" opacity="0.75"/>`;
  s += `<path d="M${f1(19)} ${f1(-hip * 0.5)} L${f1(22)} -8" stroke="${rim}" stroke-width="2" opacity="0.6"/>`;
  return s;
}

function file() {
  // paquets de profondeur : plus loin, plus flou (la mise au point est sur
  // Alice, à 4,6 m ; même le plus proche, à 1,3 m derrière elle, est déjà
  // franchement flou : il ne doit pas lui disputer le regard)
  const packs = [[0, 6.5, 5.5], [6.5, 9, 6], [9, 14, 6.5], [14, 30, 7], [30, 999, 7.5]];
  let s = '<defs>' + packs.map((p, i) => blurF(`fp${i}`, p[2])).join('') + '</defs>';
  for (let k = packs.length - 1; k >= 0; k--) {
    const [z0, z1] = packs[k];
    s += `<g filter="${url(`fp${k}`)}">`;
    for (const P of [...FILE].reverse()) {
      if (P.Z < z0 || P.Z >= z1) continue;
      const [x, y] = pr(0, 0, P.Z);
      const kk = F / zcOf(0, P.Z);
      s += `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1((P.lean * 180) / Math.PI)}) scale(${+(kk / 100).toFixed(4)})">${personne(P)}</g>`;
    }
    s += '</g>';
  }
  return s;
}
const FBOX = (() => {
  const near = FILE[0];
  const [x] = pr(0, 0, near.Z), k = F / zcOf(0, near.Z);
  return [VPX - 30, CY - k * 0.95, x + k * 0.6 - VPX + 30, k * 2.25];
})();

/* --------------------------------------------------------------------------
   Les pontons (un calque) : planches, bords, flanc, ombres portées ; puis la
   profondeur de champ (copies floues fondues en haut et en bas)
   -------------------------------------------------------------------------- */
// Un polygone posé sur les planches, coupé devant la caméra (zc ≥ 1) puis projeté
function deckPath(ps) {
  const out = [];
  const zc = (p) => zcOf(p[0], p[2]) - 1;
  for (let i = 0; i < ps.length; i++) {
    const a = ps[i], b = ps[(i + 1) % ps.length], da = zc(a), db = zc(b);
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)) { const k = da / (da - db); out.push([lerp(a[0], b[0], k), 0, lerp(a[2], b[2], k)]); }
  }
  return out.length > 2 ? 'M' + out.map((p) => xy(pr(p[0], 0, p[2]))).join(' L') + ' Z ' : '';
}
// ombres portées des gens de la file : jambes, corps, tête, couchés vers nous
function ombresFile() {
  let d = '';
  for (const P of FILE) {
    if (P.Z > 70) continue;
    const H = P.h, hip = H * 0.53;
    const S = (X, Y) => onDeck(X, Y, P.Z);
    d += deckPath([S(-0.19, 0), S(-0.11, 0), S(0.05, hip), S(-0.1, hip)]);
    d += deckPath([S(0.11, 0), S(0.19, 0), S(0.1, hip), S(-0.05, hip)]);
    d += deckPath([S(-0.17, hip - 0.05), S(0.17, hip - 0.05), S(0.2, H * 0.84), S(-0.2, H * 0.84)]);
    const c = S(0, H * 0.97), c2 = S(0, H * 0.84);
    d += deckPath([[c2[0] - 0.08, 0, c2[2]], [c2[0] + 0.08, 0, c2[2]], [c[0] + 0.09, 0, c[2]], [c[0] - 0.09, 0, c[2]]]);
  }
  return d;
}
// ombre d'Alice et de sa chaise sur les planches (à peu près : une silhouette assise)
function ombreAlice() {
  const pts = [[-0.25, 0, -0.22], [0.22, 0, -0.22], [0.25, 0.46, -0.2], [0.16, 0.7, -0.16], [0.08, 1.2, -0.1], [0.04, 1.34, -0.1], [-0.12, 1.34, -0.1], [-0.16, 1.1, -0.2], [-0.28, 0.95, -0.26], [-0.28, 0.46, -0.24]];
  return deckPath(pts.map(([dx, y, dz]) => onDeck(AX + dx, y, AZ + dz)));
}

const deckQ = (xa, xb, za, zb) => [pr(xa, 0, za), pr(xb, 0, za), pr(xb, 0, zb), pr(xa, 0, zb)];
// Les planches, de la caméra au bout des pontons : [Z, épaisseur, hauteur à
// l'image]. Tirées une fois, partagées par les planches peintes et les joints.
const PLANCHES = (() => {
  const r = rng(78), out = [];
  let Z = ZN;
  while (Z < ZF) {
    const d = 0.15 + r() * 0.012;
    const hpx = pr(0, 0, Z)[1] - pr(0, 0, Z + d)[1];
    if (hpx > 1.2) { out.push([Z, d, hpx]); Z += d + 0.012; } else { out.push([Z, d * 6, 0]); Z += d * 6; }
  }
  return out;
})();
// La profondeur de champ des pontons : le dessin net, puis deux copies floues
// fondues en haut (le lointain) et en bas (le premier plan)
function profondeur(tag, g) {
  let s = '<defs>';
  s += grad(tag + 'mloin', [0, CY], [0, 560], [[0, '#fff'], [0.55, '#fff', 0.7], [1, '#fff', 0]]);
  s += grad(tag + 'mpres', [0, 860], [0, 1080], [[0, '#fff', 0], [1, '#fff']]);
  s += blurF(tag + 'dl', 4.5) + blurF(tag + 'dp', 5);
  s += `<mask id="${u(tag + 'mL')}" maskUnits="userSpaceOnUse" x="-300" y="0" width="2600" height="1400"><rect x="-300" y="0" width="2600" height="1400" fill="${url(tag + 'mloin')}"/></mask>`;
  s += `<mask id="${u(tag + 'mP')}" maskUnits="userSpaceOnUse" x="-300" y="0" width="2600" height="1400"><rect x="-300" y="0" width="2600" height="1400" fill="${url(tag + 'mpres')}"/></mask>`;
  s += `<g id="${u(tag + 'net')}">${g}</g>`;
  s += '</defs>';
  s += `<use href="#${u(tag + 'net')}"/>`;
  s += `<g mask="url(#${u(tag + 'mL')})"><g filter="${url(tag + 'dl')}"><use href="#${u(tag + 'net')}"/></g></g>`;
  s += `<g mask="url(#${u(tag + 'mP')})"><g filter="${url(tag + 'dp')}"><use href="#${u(tag + 'net')}"/></g></g>`;
  return s;
}

function pontons() {
  const r = rng(77);
  let g = '';
  // le flanc gauche du ponton bleu, à l'ombre, ses flotteurs et son reflet
  const XL = -WP;
  g += poly([pr(XL, -DH, ZN), pr(XL, -DH, ZF), pr(XL, -DH * 2.2, ZF), pr(XL, -DH * 2.2, ZN)], `fill="#3d4166" opacity="0.55" filter="${url('f6')}"`);
  g += poly([pr(XL, -DH, ZN), pr(XL, 0, ZN), pr(XL, 0, ZF), pr(XL, -DH, ZF)], `fill="${url('flanc')}"`);
  g += poly([pr(XL + 0.03, -DH, ZN), pr(XL + 0.03, -DH + 0.1, ZN), pr(XL + 0.03, -DH + 0.1, ZF), pr(XL + 0.03, -DH, ZF)], `fill="#2b2934" opacity="0.85"`);
  for (let Z = ZN + 0.6; Z < 40; Z += 3) {
    const a = pr(XL, -DH + 0.02, Z), b = pr(XL, 0, Z);
    g += `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="#30262a" stroke-width="${f1(Math.max(0.6, 28 / Z))}" opacity="0.45"/>`;
  }
  // les deux ponts
  for (const side of ['blue', 'red']) {
    const sg = side === 'blue' ? -1 : 1;
    const X1 = sg * WP;
    const base = C[side], dark = C[side + 'S'], light = C[side + 'L'];
    g += poly(deckQ(0, X1, ZN, ZF), `fill="${base}"`);
    for (const [Z, d, hpx] of PLANCHES) {
      // près de la caméra, les planches varient moins d'une à l'autre : de
      // grandes bandes claires et sombres s'y liraient comme des vagues
      const k = r(), worn = r() < 0.2, amp = hpx > 9 ? 0.45 : 1;
      let col = k < 0.35 ? mixc(base, dark, amp * (0.22 + r() * 0.2)) : k < 0.7 ? mixc(base, light, amp * (0.15 + r() * 0.25)) : base;
      if (worn) col = mixc(col, C.woodL, amp * (0.3 + r() * 0.2));
      if (hpx > 0) {
        g += poly(deckQ(0, X1, Z, Z + d), `fill="${col}" opacity="${f1(0.55 + 0.3 * r())}"`);
        // la peinture partie par endroits : le bois en dessous
        if (r() < 0.5) {
          const x0 = sg * (0.15 + r() * (WP - 0.6)), w = sg * (0.15 + r() * 0.6);
          g += poly(deckQ(x0, x0 + w, Z + d * 0.2, Z + d * 0.75), `fill="${C.woodL}" opacity="${f1(0.15 + 0.25 * r())}"`);
        }
        // veines du bois, au premier plan : de courts traits droits, dans le
        // sens de la planche (les joints, eux, sont dans le calque « joints »)
        if (hpx > 14 && r() < 0.7) {
          const x0 = sg * (0.1 + r() * (WP - 0.5)), x1 = x0 + sg * (0.3 + r() * 0.8), zz = Z + d * (0.3 + r() * 0.4);
          g += `<path d="M${xy(pr(x0, 0, zz))} L${xy(pr(x1, 0, zz))}" stroke="${mixc(dark, '#1f1a22', 0.3)}" stroke-width="${f1(0.5 + hpx * 0.02)}" opacity="0.18" fill="none"/>`;
        }
      } else {
        g += poly(deckQ(0, X1, Z, Z + d), `fill="${col}" opacity="${f1(0.25 + 0.2 * r())}"`);
      }
    }
    // bords en bois brut
    for (const [xa, xb] of [[0, sg * 0.11], [X1 - sg * 0.12, X1]]) {
      g += poly(deckQ(xa, xb, ZN, ZF), `fill="${C.wood}"`);
      g += `<path d="M${xy(pr(xa + (xb - xa) * 0.5, 0, ZN))} L${xy(pr(xa + (xb - xa) * 0.5, 0, ZF))}" stroke="${C.woodL}" stroke-width="2" opacity="0.5"/>`;
    }
  }
  // la jointure
  g += `<path d="M${xy(pr(0, 0, ZN))} L${xy(pr(0, 0, ZF))}" stroke="#2b2026" stroke-width="3" opacity="0.7"/>`;
  // l'arête du ponton rouge prend le soleil
  g += `<path d="M${xy(pr(WP, 0, ZN))} L${xy(pr(WP, 0, ZF))}" stroke="#ffd29a" stroke-width="3" opacity="0.6"/>`;
  let s = '<defs>';
  s += grad('flanc', [0, pr(0, 0, ZF)[1]], [0, 1100], [[0, '#c8b4b8'], [0.3, '#7f6f72'], [1, '#463a40']]);
  s += blurF('f6', 6);
  s += '</defs>';
  return s + profondeur('d', g);
}
const PBOX = [-240, CY + 4, 2400, 1180 - CY];

/* --------------------------------------------------------------------------
   Les joints et les ombres (un calque sans la texture de peinture, qui
   ferait onduler les longs traits comme des vagues) : des joints droits,
   réguliers, qui se resserrent avec la distance ; les ombres lavande de la
   file, de la chaise et d'Alice ; puis le voile de l'air sur les deux ponts.
   -------------------------------------------------------------------------- */
// Un point de l'image posé sur les planches → ses coordonnées (X, Z) en mètres
function surPlanches([sx, sy]) {
  const zc = (F * CAMH) / (sy - CY), xc = ((sx - CXS) * zc) / F;
  return [CAMX + xc * CS + zc * SN, -xc * SN + zc * CS];
}
// Les pieds de la chaise, dans le repère local d'Alice (pixels), et la hauteur
// de chacun de ses montants (mètres) : les pieds avant montent jusqu'aux
// accoudoirs, les pieds arrière jusqu'au dossier
const PIEDS = [[-38, 167, 0.46 + 236 / K], [110, 171, 0.46 + 90 / K], [38, 181, 0.46 + 74 / K], [-114, 177, 0.46 + 228 / K]];
// Une barre d'ombre sur les planches : de (X, Z) au pied jusqu'à l'ombre du point à la hauteur h
function barre(X, Z, h0, h1, w) {
  const a = onDeck(X, h0, Z), b = onDeck(X, h1, Z);
  const n = norm([b[2] - a[2], -(b[0] - a[0])]);
  const o = [n[0] * w * 0.5, n[1] * w * 0.5];
  return deckPath([[a[0] - o[0], 0, a[2] - o[1]], [a[0] + o[0], 0, a[2] + o[1]], [b[0] + o[0], 0, b[2] + o[1]], [b[0] - o[0], 0, b[2] - o[1]]]);
}
function ombreChaise() {
  const P = PIEDS.map(([lu, lv, h]) => [...surPlanches(L2W([lu, lv])), h]);
  let d = '';
  for (const [X, Z, h] of P) d += barre(X, Z, 0, h, 0.045);
  // le siège, puis les accoudoirs et la traverse du dossier
  d += deckPath(P.map(([X, Z]) => onDeck(X, SEATH, Z)));
  const [bf, ff, fn, bn] = P;
  for (const [a, b] of [[bn, fn], [bf, ff]]) {
    const A = onDeck(a[0], SEATH + 80 / K, a[1]), B = onDeck(b[0], SEATH + 80 / K, b[1]);
    d += deckPath([[A[0], 0, A[2] - 0.03], [B[0], 0, B[2] - 0.03], [B[0], 0, B[2] + 0.03], [A[0], 0, A[2] + 0.03]]);
  }
  const A = onDeck(bn[0], bn[2] - 0.02, bn[1]), B = onDeck(bf[0], bf[2] - 0.02, bf[1]);
  d += deckPath([[A[0], 0, A[2] - 0.05], [B[0], 0, B[2] - 0.05], [B[0], 0, B[2] + 0.05], [A[0], 0, A[2] + 0.05]]);
  return d;
}

function joints() {
  let g = '';
  for (const side of [-1, 1]) {
    const X1 = side * WP, dark = side < 0 ? C.blueS : C.redS;
    const jc = mixc(dark, '#1f1a22', 0.45);
    for (const [Z, d, hpx] of PLANCHES) {
      if (!hpx) continue;
      // joint entre deux planches : un trait droit, d'épaisseur réglée sur
      // la profondeur (plus fin au loin)
      const zj = Z + d + 0.006;
      g += `<path d="M${xy(pr(side * 0.11, 0, zj))} L${xy(pr(X1 - side * 0.12, 0, zj))}" stroke="${jc}" stroke-width="${f1(clamp(0.25 + hpx * 0.06, 0.3, 2.6))}" opacity="${f1(clamp(0.3 + hpx * 0.02, 0, 0.7))}"/>`;
      // et ses clous
      if (hpx > 10) {
        for (const xn of [side * 0.22, side * (WP - 0.22)]) {
          const n = pr(xn, 0, Z + d * 0.5);
          g += `<ellipse cx="${f1(n[0])}" cy="${f1(n[1])}" rx="${f1(hpx * 0.06)}" ry="${f1(hpx * 0.04)}" fill="#2a2228" opacity="0.55"/>`;
        }
      }
    }
    // modules du ponton, tous les 6 m
    for (let z = ZN + 2.2; z < ZF; z += 6) {
      const w = Math.min(4, Math.max(0.5, 160 / z));
      g += `<path d="M${xy(pr(0, 0, z))} L${xy(pr(X1, 0, z))}" stroke="#2a2228" stroke-width="${f1(w)}" opacity="0.5"/>`;
    }
  }
  // ombres portées : lavande, couchées vers nous et vers la gauche, en barres
  // franches comme dans « a3-lac »
  const both = [pr(-WP, 0, ZN), pr(WP, 0, ZN), pr(WP, 0, ZF), pr(-WP, 0, ZF)];
  g += `<clipPath id="${u('cdeck')}">${poly(both)}</clipPath>`;
  g += `<g clip-path="url(#${u('cdeck')})"><path d="${ombresFile()}" fill="#4a4f8c" opacity="0.45" filter="${url('f1')}"/>`;
  g += `<path d="${ombreChaise()}" fill="#454a86" opacity="0.55" filter="${url('f1')}"/>`;
  g += `<path d="${ombreAlice()}" fill="#454a86" opacity="0.5" filter="${url('f2')}"/></g>`;
  // la chaleur du soleil à droite ; au loin, l'air de l'aube voile les ponts
  g += poly(both, `fill="${url('dore')}"`);
  g += poly(both, `fill="${url('voile')}"`);
  let s = '<defs>';
  s += grad('voile', [0, pr(0, 0, ZF)[1]], [0, pr(0, 0, 22)[1]], [[0, C.haze, 0.75], [0.4, C.haze, 0.35], [1, C.haze, 0]]);
  s += grad('dore', [600, 0], [2100, 0], [[0, '#ffd598', 0], [0.5, '#ffd598', 0.1], [1, '#ffd598', 0.3]]);
  s += blurF('f1', 1.2) + blurF('f2', 2);
  s += '</defs>';
  return s + profondeur('j', g);
}

/* --------------------------------------------------------------------------
   La chaise et les jambes d'Alice (un calque, immobile)
   Repère local : origine au milieu du siège ; la chaise regarde vers la
   droite, tournée d'un quart vers nous (le côté droit d'Alice est le nôtre).
   -------------------------------------------------------------------------- */
// quelques repères de la chaise (local, pixels)
const SEAT = { bn: [-112, 6], fn: [38, 16], ff: [110, -4], bf: [-40, -14], th: 14 };
const ARM = { n0: [-112, -76], n1: [44, -72], f0: [-44, -96], f1: [112, -92] };
const FOOT = 173; // le plancher, sous le siège
// Le liseré d'or franc du soleil levant (2 à 3 px, en « screen » : il éclaire
// ce qu'il touche) sur les bords tournés vers la droite
const rimS = (d, w = 2.6, op = 0.85) =>
  `<path d="${d}" fill="none" stroke="#ffd9a0" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" style="mix-blend-mode:screen"/>`;

function chaise() {
  const W = AL;
  const T = (x, y) => [x, y];
  let s = '<defs>';
  s += grad('bois', [-130, 0], [130, 0], [[0, W.woodSh], [0.55, W.wood], [1, W.woodLit]]);
  s += grad('boisV', [0, -240], [0, 200], [[0, W.wood], [1, W.woodSh]]);
  s += grad('pant', [-60, 0], [210, 0], [[0, AL.pantsDeep], [0.45, AL.pantsSh], [0.85, AL.pants], [1, AL.pantsLit]]);
  s += grad('tibia', [90, 0], [215, 0], [[0, AL.pantsDeep], [0.5, AL.pantsSh], [0.8, AL.pants], [1, AL.pantsLit]]);
  s += blurF('c1', 1) + blurF('c2', 2) + blurF('c4', 4);
  s += '</defs>';
  s += `<g transform="translate(${f1(O[0])} ${f1(O[1])})">`;
  // ombre de contact sous la chaise
  s += `<ellipse cx="0" cy="${FOOT + 6}" rx="150" ry="20" fill="#3c3f74" opacity="0.35" filter="${url('c4')}"/>`;
  // pieds arrière (loin), montant arrière lointain, accoudoir lointain
  const leg = (a, b, w, fill) => `<path d="${shape(tube([a, b], [w, w * 0.85]))}" fill="${fill}"/>`;
  s += leg(T(-40, -14), T(-38, FOOT - 6), 5.5, W.woodDeep);
  s += leg(T(108, -4), T(110, FOOT - 2), 6, W.woodSh);
  s += leg(T(-44, -12), T(-58, -236), 6, W.woodSh);                 // montant arrière lointain
  s += leg(ARM.f0, ARM.f1, 6.5, W.wood);                             // accoudoir lointain
  s += leg(T(108, -4), T(110, -90), 5, W.woodSh);                    // son support
  s += rimS('M115 -2 L116 168', 2.2, 0.45) + rimS('M-39 -16 L-52 -230', 2.2, 0.4);
  // le dossier : traverse haute et deux barreaux, entre les montants
  s += `<path d="${shape([[-122, -232], [-58, -246], [-56, -222], [-120, -206]])}" fill="url(#${u('boisV')})"/>`;
  s += `<path d="M-120 -230 L-58 -244" stroke="${W.woodLit}" stroke-width="2" opacity="0.6"/>`;
  for (const k of [0.33, 0.66]) {
    const xa = lerp(-118, -56, k);
    s += leg(T(xa, -214 + k * -8), T(xa + 3, -40), 4, W.woodSh);
  }
  s += `<path d="${shape([[-118, -132], [-54, -146], [-53, -132], [-117, -118]])}" fill="${W.woodSh}"/>`;
  // le siège
  s += `<path d="M${xy(SEAT.bn)} L${xy(SEAT.fn)} L${xy(SEAT.ff)} L${xy(SEAT.bf)} Z" fill="${W.wood}"/>`;
  s += `<path d="M${xy(SEAT.bn)} L${xy(SEAT.fn)} L${SEAT.fn[0]} ${SEAT.fn[1] + SEAT.th} L${SEAT.bn[0]} ${SEAT.bn[1] + SEAT.th} Z" fill="${W.woodSh}"/>`;
  s += `<path d="M${xy(SEAT.fn)} L${xy(SEAT.ff)} L${SEAT.ff[0]} ${SEAT.ff[1] + SEAT.th} L${SEAT.fn[0]} ${SEAT.fn[1] + SEAT.th} Z" fill="${W.wood}"/>`;
  s += `<path d="M${xy(SEAT.fn)} L${xy(SEAT.ff)}" stroke="${W.woodLit}" stroke-width="2.4" opacity="0.8"/>`;
  // traverses basses entre les pieds
  s += leg(T(-110, 110), T(36, 118), 3.5, W.woodSh);
  s += leg(T(36, 118), T(108, 106), 3.2, W.woodDeep);
  // la jambe lointaine d'Alice : cuisse, genou, tibia, chaussure
  // (le genou est bas et fin : la cuisse descend un peu du siège vers lui)
  const thighF = tube([[-10, -36], [60, -30], [138, -14]], [27, 23, 18.5]);
  const shinF = tube([[148, -8], [157, 60], [164, 140]], [18, 15, 12]);
  // chaussures : petites, posées à plat, le talon pour pivot
  const shoe = (hx, hy, body) => `<g transform="translate(${hx} ${hy}) scale(0.85) translate(${-hx} ${-hy})">${body}</g>`;
  s += `<path d="${shape(shinF)}" fill="url(#${u('tibia')})"/>`;
  s += shoe(152, 162, `<path d="M${xy([150, 136])} C${xy([150, 162])} ${xy([176, 166])} ${xy([214, 160])} C${xy([222, 156])} ${xy([216, 146])} ${xy([200, 142])} C${xy([188, 138])} ${xy([180, 132])} ${xy([176, 128])} Z" fill="${AL.shoe}"/>` +
    `<path d="M${xy([152, 158])} C${xy([170, 166])} ${xy([200, 164])} ${xy([216, 159])}" stroke="${AL.sole}" stroke-width="3" fill="none" opacity="0.8"/>`);
  s += `<path d="${shape(thighF)}" fill="url(#${u('pant')})"/>`;
  // pied avant proche (devant le tibia lointain) : la jambe proche
  s += leg(T(36, 18), T(38, FOOT + 8), 6.5, W.wood);
  const thighN = tube([[-40, -16], [40, -6], [116, 10]], [30, 25, 20]);
  const shinN = tube([[119, 18], [124, 90], [129, 160]], [19.5, 16, 12.5]);
  s += `<path d="${shape(shinN)}" fill="url(#${u('tibia')})"/>`;
  s += shoe(118, 184, `<path d="M${xy([112, 156])} C${xy([110, 182])} ${xy([140, 188])} ${xy([182, 182])} C${xy([192, 178])} ${xy([186, 166])} ${xy([168, 162])} C${xy([156, 158])} ${xy([146, 152])} ${xy([142, 146])} Z" fill="${mixc(AL.shoe, '#3a3540', 0.2)}"/>` +
    `<path d="M${xy([114, 178])} C${xy([132, 188])} ${xy([166, 186])} ${xy([186, 180])}" stroke="${AL.sole}" stroke-width="3.4" fill="none" opacity="0.85"/>` +
    `<path d="M${xy([150, 160])} C${xy([164, 160])} ${xy([178, 164])} ${xy([186, 170])}" stroke="#ffd9a0" stroke-width="2.4" fill="none" opacity="0.8" style="mix-blend-mode:screen"/>`);
  s += `<path d="${shape(thighN)}" fill="url(#${u('pant')})"/>`;
  // plis du pantalon : au genou, à l'aine ; lumière sur le dessus des cuisses
  s += `<path d="M10 -44 C50 -48 96 -36 132 -24" stroke="${AL.pantsLit}" stroke-width="5" fill="none" opacity="0.55" filter="${url('c2')}"/>`;
  s += `<path d="M100 2 C108 10 110 18 110 26 M88 6 C96 14 100 22 100 30" stroke="${AL.pantsDeep}" stroke-width="2" fill="none" opacity="0.45"/>`;
  s += `<path d="M130 24 C134 60 134 100 137 150" stroke="${AL.pantsDeep}" stroke-width="1.6" fill="none" opacity="0.35"/>`;
  // liseré d'or : le dessus du genou et le devant du tibia lointain, dans le soleil
  s += `<g filter="${url('c1')}">${rimS('M112 -36 C132 -35 150 -28 160 -16 C163 -12 164 -8 164 -4', 3, 0.5)}${rimS('M170 14 C173 50 174 100 172 132', 2.4, 0.35)}</g>`;
  // pieds de la chaise côté nous : arrière proche (le montant monte jusqu'au dossier)
  s += leg(T(-112, 6), T(-114, FOOT + 4), 7, W.woodSh);
  s += leg(T(-112, 6), T(-124, -228), 7, `url(#${u('bois')})`);
  s += `<path d="M-118 -220 L-108 0" stroke="${W.woodLit}" stroke-width="1.6" opacity="0.35"/>`;
  // liseré d'or sur le bord droit des montants (le soleil est à droite)
  const rimB = (d, op = 0.85) => rimS(d, 2.4, op);
  s += rimB('M-112 -224 L-105 0 M-105 10 L-107 176', 0.6);
  s += rimB('M43 22 L44 178', 0.7);
  s += '</g>';
  return s;
}
const CBOX = [O[0] - 180, O[1] - 290, 440, 510];

/* --------------------------------------------------------------------------
   Alice : torse, bras, tête, accoudoir proche et cordes (un calque qui respire)
   -------------------------------------------------------------------------- */
// la tête, dans son propre repère (centre du crâne), regard vers la droite
const HEAD = [
  [-30, 26], [-36, 4], [-36, -18], [-26, -38], [-6, -48], [16, -45], [30, -33], // 0-6 crâne
  [35, -18], [36, -9], [43, 5], [45, 9, 1], [38, 12], [38.5, 15], [37, 18.5], [38.5, 21.5], // 7-14 front, nez, lèvres
  [35, 26], [33, 33], [27, 38], [14, 40], [2, 36], // 15-19 menton, mâchoire
];
// cheveux noirs bouclés courts : une calotte de boucles serrées, l'oreille
// dégagée, la nuque courte
const HAIR = [
  [-37, 16], [-42, -4], [-41, -26], [-31, -45], [-13, -55], [8, -56], [24, -49], [34, -38], [37, -29], // 0-8 dessus
  [29, -27], [20, -28], [12, -24], [6, -17], [1, -12], [-6, -13], [-14, -12], // 9-15 front, tempe, au-dessus de l'oreille
  [-19, -4], [-21, 10], [-27, 20], // 16-18 derrière l'oreille, nuque
];
const HS = 1.12; // la tête, un peu plus grande que le gabarit
const HEADC = [15, -269]; // centre de la tête, repère local d'Alice (le cou est court)
const EYE = [HEADC[0] + HS * 22.6, HEADC[1] + HS * -8];
// Bras proche : épaule, coude posé sur l'accoudoir, poignet ; main tombante
const ARMN = tube([[-28, -192], [-44, -148], [-62, -96]], [21, 19, 17]);
const FORN = tube([[-70, -92], [-30, -88], [16, -84], [36, -82]], [17, 16, 14, 12]);
const HANDN = [[30, -94], [44, -93], [56, -88], [62, -78], [64, -64], [60, -52], [54, -50], [50, -58], [46, -66], [36, -70], [28, -72]];
// Bras lointain : on ne voit que l'avant-bras et la main, au-delà de la poitrine
const FORF = tube([[0, -112], [50, -108], [104, -104]], [15, 14, 12]);
const HANDF = [[98, -114], [112, -112], [122, -104], [126, -92], [126, -80], [121, -72], [116, -74], [114, -84], [108, -90], [98, -92]];
const TORSO = [
  [-74, -4], [-77, -60], [-72, -118], [-64, -160], [-54, -190], [-36, -208], // 0-5 dos
  [-12, -217], [12, -220], [30, -214], // 6-8 col, épaule
  [42, -198], [51, -170], [54, -140], [48, -106], [44, -76], [50, -46], [60, -18], // 9-15 poitrine, ventre
  [36, -4], [0, 0], [-40, 2], // 16-18 hanches
];

function alice() {
  const A = AL;
  let s = '<defs>';
  s += `<clipPath id="${u('cT')}"><path d="${shape(TORSO)}"/></clipPath>`;
  s += `<clipPath id="${u('cA')}"><path d="${shape(ARMN)}"/></clipPath>`;
  s += `<clipPath id="${u('cF')}"><path d="${shape(FORN)}"/></clipPath>`;
  s += `<clipPath id="${u('cH')}"><path d="${shape(HEAD)}"/></clipPath>`;
  s += `<clipPath id="${u('cC')}"><path d="${shape(HAIR)}"/></clipPath>`;
  s += grad('pull', [-80, 0], [64, 0], [[0, A.knitDeep], [0.35, A.knitSh], [0.75, mixc(A.knit, A.knitSh, 0.35)], [0.93, A.knit], [1, A.knitLit]]);
  s += grad('manche', [0, -200], [0, -80], [[0, mixc(A.knitSh, A.knit, 0.3)], [1, mixc(A.knitSh, A.knitDeep, 0.3)]]);
  s += grad('avbras', [-70, -100], [40, -76], [[0, mixc(A.knitSh, A.knitDeep, 0.35)], [0.55, A.knitSh], [1, mixc(A.knit, A.knitLit, 0.2)]]);
  s += grad('peau', [-36, 0], [46, 0], [[0, A.skinDeep], [0.45, A.skinSh], [0.82, A.skin], [1, A.skinLit]]);
  s += grad('main', [28, -90], [64, -56], [[0, A.skin], [1, A.skinSh]]);
  s += grad('chev', [-44, 20], [40, -60], [[0, A.hairDeep], [0.6, A.hair], [1, A.hairLit]]);
  s += grad('boisN', [-120, 0], [50, 0], [[0, A.woodSh], [0.7, A.wood], [1, A.woodLit]]);
  s += blurF('a1', 1) + blurF('a2', 2) + blurF('a3', 3) + blurF('a5', 5) + blurF('a8', 8);
  s += '</defs>';
  const rimIn = (d, clip, w, col = C.rim, op = 0.9, b = 'a2') =>
    `<g clip-path="url(#${u(clip)})"><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" filter="${url(b)}"/></g>`;
  const ln = (d, col, w, op = 1, b = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" ${b ? `filter="${url(b)}"` : ''}/>`;

  s += `<g transform="translate(${f1(O[0])} ${f1(O[1])})">`;

  // l'avant-bras lointain et sa corde, au-delà de la poitrine
  s += `<path d="${shape(FORF)}" fill="${mixc(A.knitSh, A.knit, 0.3)}"/>`;
  s += ln('M8 -124 C40 -122 80 -118 104 -116', A.knitLit, 3, 0.7, 'a1');
  s += `<path d="${shape(HANDF)}" fill="${A.skinSh}"/>`;
  s += ln(open([[112, -112], [122, -104], [126, -92], [126, -80]]), A.skinLit, 2.4, 0.8, 'a1');
  s += corde([80, -106], 13, 1, -0.04);

  // le torse : pull moutarde passé, côtes au col, à la taille et aux poignets
  s += `<path d="${shape(TORSO)}" fill="${url('pull')}"/>`;
  s += `<g clip-path="url(#${u('cT')})">`;
  s += `<path d="M-70 -200 C-40 -150 -40 -60 -70 0 L-90 0 L-90 -220 Z" fill="${A.knitDeep}" opacity="0.35" filter="${url('a8')}"/>`;
  const r = rng(5);
  for (let i = 0; i < 26; i++) {
    const x = -74 + i * 5.3 + r() * 2;
    s += ln(`M${f1(x)} ${f1(-206 + Math.abs(x) * 0.12)} C${f1(x + 2)} -140 ${f1(x - 2)} -80 ${f1(x + 1)} -10`, A.knitDeep, 1, 0.12);
  }
  // plis : sous la poitrine, au ventre, au creux du coude
  s += ln('M-20 -110 C0 -104 24 -104 44 -112', A.knitDeep, 3, 0.35, 'a2');
  s += ln('M-30 -56 C0 -48 30 -48 52 -56', A.knitDeep, 3, 0.35, 'a2');
  s += ln('M-10 -30 C14 -24 36 -22 56 -30', A.knitDeep, 2, 0.3, 'a1');
  // bord-côte du bas du pull
  s += `<path d="M-78 -26 C-30 -20 20 -18 62 -26 L66 -6 C20 2 -30 2 -80 -2 Z" fill="${A.knitSh}" opacity="0.8"/>`;
  for (let x = -76; x < 64; x += 5) s += ln(`M${x} ${f1(-24 + Math.abs(x) * 0.02)} L${x + 1} -2`, A.knitDeep, 1.2, 0.35);
  s += '</g>';
  // liseré d'or : la poitrine et le haut des épaules
  s += rimIn(arc(TORSO, 7, 15), 'cT', 7, C.rim, 0.9);
  s += rimIn(arc(TORSO, 4, 8), 'cT', 4, '#ffe2b0', 0.55);
  // et le trait franc sur le devant du pull, de l'épaule au ventre
  s += `<g clip-path="url(#${u('cT')})">${rimS(arc(TORSO, 8, 15), 5, 0.9)}</g>`;

  // le cou et la tête
  s += `<path d="M-2 -212 C-1 -222 -3 -232 -4 -242 L30 -242 C31 -234 32 -222 31 -212 Z" fill="${A.skinSh}"/>`;
  s += `<path d="M-4 -230 C6 -226 20 -226 30 -232 L30 -214 L-2 -214 Z" fill="${A.skinDeep}" opacity="0.35" filter="${url('a3')}"/>`;
  s += ln('M24 -238 C27 -230 29 -224 29 -216', A.skinLit, 3, 0.7, 'a1');
  s += rimS('M27 -236 C29 -228 31 -222 31 -216', 2.2, 0.7);
  // col rond en côtes
  s += `<path d="M-6 -222 C6 -214 22 -212 34 -218 L36 -208 C22 -202 4 -204 -10 -212 Z" fill="${A.knitSh}"/>`;
  s += ln('M-6 -216 C6 -210 22 -208 35 -213', A.knitLit, 1.6, 0.6);
  s += tete();

  // l'accoudoir proche, son support, puis le bras proche posé dessus
  s += `<path d="${shape(tube([[36, -74], [38, 18]], [6.5, 6.5]))}" fill="${url('boisN')}"/>`;
  s += `<path d="${shape([[-118, -82], [44, -80], [48, -74], [46, -64], [-116, -66], [-120, -72]])}" fill="${url('boisN')}"/>`;
  s += ln('M-116 -80 L46 -78', A.woodLit, 2.2, 0.75);
  s += ln('M-116 -66 L46 -64', A.woodDeep, 1.6, 0.5);
  // ombre du bras sur le bois
  s += `<path d="M-74 -78 L30 -76 L30 -68 L-74 -70 Z" fill="${A.woodDeep}" opacity="0.4" filter="${url('a2')}"/>`;
  // bras proche : la manche, le coude sur l'accoudoir
  s += `<path d="${shape(ARMN)}" fill="${url('manche')}"/>`;
  s += `<g clip-path="url(#${u('cA')})">${ln('M-20 -190 C-30 -150 -40 -120 -50 -96', A.knit, 6, 0.5, 'a3')}${ln('M-52 -130 C-58 -122 -62 -112 -62 -104', A.knitDeep, 2, 0.4)}</g>`;
  s += `<path d="${shape(FORN)}" fill="${url('avbras')}"/>`;
  s += `<g clip-path="url(#${u('cF')})">${ln('M-60 -102 C-20 -100 10 -98 36 -94', A.knitLit, 4, 0.55, 'a2')}</g>`;
  // poignet côtelé, puis la main qui tombe au bout de l'accoudoir
  s += `<path d="${shape([[20, -98], [34, -96], [36, -72], [22, -74]])}" fill="${A.knitSh}"/>`;
  for (let x = 22; x < 36; x += 3) s += ln(`M${x} -96 L${x} -74`, A.knitDeep, 1, 0.45);
  s += `<path d="${shape(HANDN)}" fill="${url('main')}"/>`;
  s += ln('M44 -93 C56 -88 62 -78 64 -64', A.skinLit, 2.2, 0.7, 'a1');
  s += ln('M52 -64 C54 -60 56 -56 56 -52 M47 -68 C49 -64 51 -60 50 -56', A.skinDeep, 1.2, 0.5);
  // la corde du poignet proche
  s += corde([4, -82], 15, 0, 0.02);
  s += '</g>';
  return s;
}

// Quelques tours d'une corde de chanvre claire autour de l'avant-bras et de
// l'accoudoir, serrés sur le bois, avec un petit nœud dessous et une seule
// queue courte. (cx, cy) : milieu des tours.
function corde([cx, cy], R, far, tilt) {
  const A = AL;
  let s = '';
  const turns = 3;
  const top = cy - R - 2, bot = cy + R + 4, sk = tilt * 60;
  for (let i = 0; i < turns; i++) {
    const x = cx + (i - 1) * 7.5;
    // le brin qui passe devant, de l'avant-bras au dessous de l'accoudoir
    const d = `M${f1(x - 3 + sk)} ${f1(top)} C${f1(x + 4)} ${f1(top + 6)} ${f1(x + 5)} ${f1(bot - 6)} ${f1(x - 1 - sk)} ${f1(bot)}`;
    s += `<path d="${d}" fill="none" stroke="${A.ropeSh}" stroke-width="6.4" stroke-linecap="round"/>`;
    s += `<path d="${d}" fill="none" stroke="${far ? mixc(A.rope, A.ropeSh, 0.3) : A.rope}" stroke-width="4.4" stroke-linecap="round"/>`;
    // la torsion du chanvre : de petits traits obliques
    for (let k = 1; k < 6; k++) {
      const yy = lerp(top, bot, k / 6), xx = x + 3 * Math.sin((k / 6) * Math.PI);
      s += `<path d="M${f1(xx - 2)} ${f1(yy - 1.5)} L${f1(xx + 2)} ${f1(yy + 1.5)}" stroke="${A.ropeSh}" stroke-width="0.9" opacity="0.7"/>`;
    }
    s += `<path d="M${f1(x - 1 + sk)} ${f1(top + 2)} C${f1(x + 4)} ${f1(top + 8)} ${f1(x + 4)} ${f1(cy)} ${f1(x + 3)} ${f1(cy + 4)}" fill="none" stroke="${A.ropeLit}" stroke-width="1.4" opacity="${far ? 0.55 : 0.85}"/>`;
  }
  // le nœud sous l'accoudoir, et sa queue courte (25 px environ)
  const kx = cx + 2, ky = bot + 2;
  s += `<path d="M${f1(kx)} ${f1(ky + 2)} C${f1(kx - 1)} ${f1(ky + 10)} ${f1(kx + 2)} ${f1(ky + 18)} ${f1(kx)} ${f1(ky + 25)}" stroke="${A.ropeSh}" stroke-width="4.4" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M${f1(kx)} ${f1(ky + 2)} C${f1(kx - 1)} ${f1(ky + 10)} ${f1(kx + 2)} ${f1(ky + 18)} ${f1(kx)} ${f1(ky + 24)}" stroke="${A.rope}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="${f1(kx)}" cy="${f1(ky)}" rx="6" ry="4.5" fill="${A.ropeSh}"/><ellipse cx="${f1(kx - 1)}" cy="${f1(ky - 1)}" rx="4.4" ry="3.2" fill="${A.rope}"/>`;
  return s;
}

function tete() {
  const A = AL;
  const [hx, hy] = HEADC;
  let s = `<g transform="translate(${hx} ${hy}) scale(${HS})">`;
  s += `<path d="${shape(HEAD)}" fill="${url('peau')}"/>`;
  s += `<g clip-path="url(#${u('cH')})">`;
  // la joue et le cou de notre côté restent dans l'ombre douce ; rebond chaud des planches sous le menton
  s += `<ellipse cx="-16" cy="10" rx="28" ry="40" fill="${A.skinSh}" opacity="0.45" filter="${url('a8')}"/>`;
  s += `<ellipse cx="24" cy="30" rx="12" ry="8" fill="${A.skinLit}" opacity="0.25" filter="${url('a3')}"/>`;
  // la joue côté soleil se réchauffe : la lumière vient de l'avant, à droite
  s += `<ellipse cx="28" cy="2" rx="16" ry="22" fill="${A.skinLit}" opacity="0.55" filter="${url('a5')}"/>`;
  s += `<ellipse cx="34" cy="-14" rx="8" ry="10" fill="#ffd2a0" opacity="0.35" filter="${url('a3')}"/>`;
  s += `<ellipse cx="23" cy="12" rx="9" ry="6" fill="#d0705a" opacity="0.32" filter="${url('a3')}"/>`;
  s += '</g>';
  // liseré : le profil, du front au menton
  s += `<g clip-path="url(#${u('cH')})"><path d="${arc(HEAD, 6, 17)}" fill="none" stroke="${C.rim}" stroke-width="5" opacity="0.85" filter="${url('a1')}"/>` +
    `<path d="${arc(HEAD, 7, 16)}" fill="none" stroke="#fff1d4" stroke-width="1.4" opacity="0.8"/></g>`;
  // et le trait franc : front, nez, lèvres, menton
  s += rimS(arc(HEAD, 6, 17, false), 2.2, 0.9);
  // oreille
  s += `<path d="M-14 -4 C-8 -10 -1 -8 0 0 C1 8 -3 14 -9 15 C-13 15 -15 10 -15 4 Z" fill="${A.skinSh}"/>`;
  s += `<path d="M-10 -2 C-6 -4 -3 0 -4 5 C-5 8 -7 10 -9 10" stroke="${A.skinDeep}" stroke-width="1.4" fill="none" opacity="0.7" stroke-linecap="round"/>`;
  // l'œil (regard vers la droite, vers la file), le sourcil, l'autre œil derrière le nez
  s += `<path d="M16 -8 C19 -11 25 -11 29 -7.5 C25 -5 20 -5 16 -8 Z" fill="#efe2d6" opacity="0.85"/>`;
  s += `<ellipse cx="25.6" cy="-7.6" rx="2.6" ry="2.3" fill="#21160f"/>`;
  s += `<path d="M15.5 -8.4 C19.5 -11.8 25.5 -11.6 29.6 -7.8" stroke="#24150f" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M17 -16 C21 -18.6 27 -18.6 32 -16.4" stroke="${A.hairDeep}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.9"/>`;
  s += `<path d="M34 -9 C35 -8 35.6 -7 35.6 -6" stroke="#24150f" stroke-width="1.3" fill="none" opacity="0.6"/>`;
  // narine, bouche calme, menton
  s += `<path d="M36 9.6 C37.4 8.4 39 8.6 39.8 9.6" stroke="${A.skinDeep}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M28.5 18.6 C31.5 18 34.5 18.2 37.4 18.4" stroke="#6a3a30" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M30 19.6 C32.4 21.6 35 21.8 37 20.8" stroke="#8c4f43" stroke-width="1.6" fill="none" opacity="0.6" stroke-linecap="round"/>`;
  s += `<path d="M25 32 C28 34 31 34 33 32" stroke="${A.skinDeep}" stroke-width="1.2" fill="none" opacity="0.35"/>`;
  // les cheveux : une masse noire, puis des boucles serrées tout autour
  s += `<path d="${shape(HAIR)}" fill="${url('chev')}"/>`;
  const r = rng(29);
  const curls = [];
  for (let i = 0; i < 9; i++) {
    const a = HAIR[i], b = HAIR[i + 1];
    for (let k = 0; k < 3; k++) curls.push([lerp(a[0], b[0], k / 3) + (r() - 0.5) * 3, lerp(a[1], b[1], k / 3) + (r() - 0.5) * 3]);
  }
  for (let i = 0; i < 30; i++) curls.push([-36 + r() * 64, -52 + r() * 60]);
  for (const [x, y] of curls) {
    // pas de boucle sur le visage ni sur l'oreille
    if (y > -30 + Math.max(0, (-x - 12)) * 2.4 && x > -18) continue;
    if (y > 14) continue;
    const rr = 3.6 + r() * 2;
    s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr)}" fill="${r() < 0.5 ? A.hair : A.hairDeep}"/>`;
    // la boucle attrape un peu de lumière sur son bord droit-haut
    const lit = clamp((x + 10) / 50) * clamp((-y + 10) / 60);
    s += `<path d="M${f1(x - rr * 0.6)} ${f1(y - rr * 0.6)} A${f1(rr)} ${f1(rr)} 0 0 1 ${f1(x + rr * 0.8)} ${f1(y + rr * 0.2)}" fill="none" stroke="${mixc(A.hairLit, '#c4875a', lit)}" stroke-width="${f1(1 + lit * 1.4)}" opacity="${f1(0.4 + 0.5 * lit)}" stroke-linecap="round"/>`;
  }
  // une ou deux boucles sur le front, la nuque courte
  s += `<circle cx="31" cy="-32" r="4.4" fill="${A.hair}"/><circle cx="22" cy="-30" r="3.6" fill="${A.hairDeep}"/><circle cx="12" cy="-27" r="3.4" fill="${A.hair}"/>`;
  s += `<path d="M-30 20 C-26 26 -20 28 -14 24" stroke="${A.hairDeep}" stroke-width="3" fill="none" opacity="0.8"/>`;
  // liseré d'or sur le haut des boucles (le soleil est haut à droite, derrière)
  s += `<path d="M-30 -44 C-18 -58 6 -64 26 -54 C34 -48 40 -38 41 -26" fill="none" stroke="${C.rim}" stroke-width="3.2" opacity="0.8" filter="${url('a2')}"/>`;
  s += `<path d="M-14 -58 C0 -63 14 -61 26 -54 C32 -50 37 -42 39 -32" fill="none" stroke="#fff0cf" stroke-width="1.2" opacity="0.7" stroke-dasharray="5 3"/>`;
  s += rimS('M-6 -61 C8 -63 22 -58 30 -50 C36 -44 40 -36 41 -28', 2.4, 0.85);
  return s + '</g>';
}
const ABOX = [O[0] - 140, O[1] - 380, 300, 410];

/* --------------------------------------------------------------------------
   La brume (un petit calque très flou) : de longs voiles qu'on fait dériver
   -------------------------------------------------------------------------- */
function brume() {
  const r = rng(93);
  let s = '';
  for (let i = 0; i < 22; i++) {
    const x = -200 + r() * 2320, y = 360 + r() * 140 * r(), w = 220 + r() * 480, h = 8 + r() * 16;
    const warm = Math.exp(-(((x - SUN[0]) / 600) ** 2));
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w)}" ry="${f1(h)}" fill="${mixc('#f3eaee', '#fff0dc', warm)}" opacity="${f1(0.35 + r() * 0.4)}"/>`;
  }
  return s;
}
const BBOX = [-240, 300, 2400, 260];

// La nappe qui passe derrière Alice : deux strates de brume dense, l'une à
// hauteur des têtes, l'autre des épaules de la file. Dessinée autour de (0, 0),
// on la fait glisser de droite à gauche pendant le plan.
function nappe() {
  const r = rng(57);
  let s = '';
  for (const [y0, h0, n] of [[-30, 30, 9], [80, 42, 8]]) {
    s += `<ellipse cx="0" cy="${y0}" rx="430" ry="${h0}" fill="#f6ebe6" opacity="0.8"/>`;
    for (let i = 0; i < n; i++) {
      const x = -460 + (i / (n - 1)) * 920 + (r() - 0.5) * 80, y = y0 + (r() - 0.5) * h0 * 1.6;
      s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(110 + r() * 150)}" ry="${f1(h0 * (0.6 + r() * 0.7))}" fill="${mixc('#f4e8ea', '#fff0dc', x > 0 ? 0.7 : 0.2)}" opacity="${f1(0.55 + r() * 0.35)}"/>`;
    }
  }
  return s;
}
const NBOX = [-720, -170, 1440, 380];

/* --------------------------------------------------------------------------
   Procédural : scintillements sur l'eau, poussières d'or dans la lumière
   -------------------------------------------------------------------------- */
const GLINTS = (() => {
  const r = rng(6);
  return Array.from({ length: 220 }, () => {
    const k = Math.pow(r(), 1.6);
    return { v: SHORE + 3 + k * 500, u: (r() - 0.5) * (r() < 0.75 ? 1 : 2.4), l: 0.5 + r(), ph: r() * TAU, sp: 0.7 + r() * 2.2 };
  });
})();
function glints(c, T, kSun) {
  c.globalCompositeOperation = 'screen';
  for (const g of GLINTS) {
    const d = g.v - CY;
    const x = SUN[0] - 40 + g.u * (40 + d * 0.9);
    const tw = Math.pow(0.5 + 0.5 * Math.sin(T * g.sp + g.ph), 3);
    const a = tw * Math.exp(-Math.abs(g.u) * 1.2) * (0.6 + 0.4 * kSun);
    if (a < 0.03) continue;
    const L = (3 + d * 0.08) * g.l, th = 0.8 + d * 0.007;
    c.fillStyle = `rgba(255,240,212,${f1(a * 1000) / 1000})`;
    c.fillRect(x - L / 2, g.v - th / 2, L, th);
  }
}
const MOTES = (() => {
  const r = rng(88);
  return Array.from({ length: 46 }, () => ({ x: r() * 2000, y: 60 + r() * 700, s: r(), ph: r() * TAU, sp: 0.3 + r() * 0.6 }));
})();
function motes(c, T) {
  c.globalCompositeOperation = 'screen';
  for (const m of MOTES) {
    const x = ((m.x + T * (8 + 10 * m.s)) % 2100) - 90 + 14 * Math.sin(T * m.sp + m.ph);
    const y = m.y + 10 * Math.sin(T * m.sp * 0.7 + m.ph * 2) - T * 3 * m.s;
    // plus près du soleil, plus brillantes
    const near = clamp(1 - Math.hypot(x - SUN[0], y - 200) / 1500);
    const a = (0.12 + 0.4 * near) * (0.6 + 0.4 * Math.sin(T * 1.7 + m.ph));
    if (a < 0.03) continue;
    const R = 1.2 + m.s * m.s * 7;
    const g = c.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, `rgba(255,236,200,${f1(a * 1000) / 1000})`);
    g.addColorStop(1, 'rgba(255,236,200,0)');
    c.fillStyle = g;
    c.fillRect(x - R, y - R, 2 * R, 2 * R);
  }
}

/* --------------------------------------------------------------------------
   Le décor
   -------------------------------------------------------------------------- */
const DEF = { breath: 1, mist: 0.6, sun: 0.4 };
const CUT = -100; // la respiration ne joue qu'au-dessus de cette ligne (repère local)
// ombres de contact : [u, v, rayon, demi-hauteur, opacité] dans le repère
// local ; un peu décalées vers la gauche, du côté où tombent les ombres
const CONTACTS = [
  [-42, 172, 20, 4.5, 0.85], [106, 175, 20, 4.5, 0.8], [33, 187, 22, 5, 0.9], [-119, 183, 22, 5, 0.9],
  [144, 187, 46, 7, 0.9], [180, 165, 40, 6, 0.8],
];
const BREATH = 4.2; // une respiration lente, en secondes
const blinkAt = (T) => Math.max(0, 1 - Math.abs(T - 3.9) / 0.09);

export default {
  id: ID,
  bg: '#c9b6bf',
  home: { x: 960, y: 540, z: 1 },
  layers: {
    fond: { box: [-240, -160, 2400, 1380], svg: fond(), filters: ['paint', 'b3'], par: 0.94 },
    pontons: { box: PBOX, svg: pontons(), filters: ['paint'] },
    joints: { box: PBOX, svg: joints(), filters: ['ink'] },
    file: { box: FBOX, svg: file(), filters: ['paint'], res: 0.8 },
    chaise: { box: CBOX, svg: chaise(), filters: ['paint'], res: 1.5 },
    alice: { box: ABOX, svg: alice(), filters: ['paint'], res: 1.6 },
    brume: { box: BBOX, svg: brume(), filters: ['b28'], res: 0.5 },
    nappe: { box: NBOX, svg: nappe(), filters: ['b28'], res: 0.5 },
  },

  render(g, p, T) {
    const q = { ...DEF, ...p };
    const kSun = clamp(q.sun), mist = clamp(q.mist);
    const drift = T * 9;

    g.img('fond');
    g.fx(0.94, (c) => glints(c, T, kSun));
    g.img('brume', { par: 0.97, alpha: 0.55, tf: { x: drift * 0.6, y: -8 } });
    g.img('pontons');
    g.img('joints');
    g.img('file');
    // la brume qui passe entre la file et Alice : un voile bas sur les
    // planches, et une nappe dense qui traverse derrière sa tête, de droite à
    // gauche, en 7 s
    g.img('brume', { alpha: 0.3 * mist, tf: { x: -60 + drift * 1.4, y: 200, sy: 0.9, oy: 400 } });
    g.img('nappe', { alpha: 0.65 * mist, tf: { x: O[0] + 560 - 160 * T, y: O[1] - 290 } });
    // ombres de contact sous les pieds de la chaise et sous les chaussures
    g.fx(1, (c) => {
      c.globalCompositeOperation = 'multiply';
      for (const [lu, lv, rx, ry, a] of CONTACTS) {
        const x = O[0] + lu, y = O[1] + lv;
        c.save();
        c.translate(x, y);
        c.scale(1, ry / rx);
        const gr = c.createRadialGradient(0, 0, 0, 0, 0, rx);
        gr.addColorStop(0, rgba('#3c5675', a));
        gr.addColorStop(0.55, rgba('#3c5675', a * 0.55));
        gr.addColorStop(1, rgba('#3c5675', 0));
        c.fillStyle = gr;
        c.fillRect(-rx, -rx, 2 * rx, 2 * rx);
        c.restore();
      }
    });
    g.img('chaise');
    // Alice respire : seul le buste se soulève, au-dessus des accoudoirs ; le
    // bas du corps reste posé (les pieds ne glissent pas sur les planches)
    const br = 1 + 0.0065 * q.breath * Math.sin((T * TAU) / BREATH);
    const cut = O[1] + CUT;
    g.img('alice', { clip: (c) => { c.beginPath(); c.rect(O[0] - 400, cut - 0.5, 800, 700); } });
    g.img('alice', { tf: { ox: O[0], oy: cut, sx: 1 + (br - 1) * 0.4, sy: br }, clip: (c) => { c.beginPath(); c.rect(O[0] - 400, cut - 700, 800, 700.5); } });
    // un clignement des yeux, une fois dans le plan
    const bl = blinkAt(T);
    if (bl > 0) {
      g.fx(1, (c) => {
        const ex = O[0] + EYE[0], ey = cut + (O[1] + EYE[1] - cut) * br;
        c.fillStyle = AL.skinSh;
        c.beginPath();
        c.ellipse(ex + 1, ey - 2.4 + 2.2 * bl, 7.4, 4.2 * bl + 0.2, -0.05, Math.PI, TAU);
        c.fill();
        c.strokeStyle = '#24150f';
        c.lineWidth = 1.8;
        c.beginPath();
        c.moveTo(ex - 6, ey - 0.4 + 2 * bl);
        c.quadraticCurveTo(ex, ey + 2 * bl + 1.2, ex + 6, ey + 0.4 + 2 * bl);
        c.stroke();
      });
    }
    // poussières d'or dans la lumière rasante
    g.fx(1, (c) => motes(c, T));
    // un voile de brume basse au premier plan, très léger
    g.img('brume', { par: 1.15, alpha: 0.18 * mist, tf: { x: drift * 2, y: 560, sy: 1.4, oy: 400 } });

    // le soleil, hors champ en haut à droite : halo qui déborde dans l'image
    g.fx(1, (c) => {
      c.globalCompositeOperation = 'screen';
      const R = 900 + 150 * kSun;
      const gr = c.createRadialGradient(SUN[0], SUN[1], 0, SUN[0], SUN[1], R);
      gr.addColorStop(0, `rgba(255,228,180,${0.5 + 0.2 * kSun})`);
      gr.addColorStop(0.25, `rgba(255,210,160,${0.14 + 0.06 * kSun})`);
      gr.addColorStop(1, 'rgba(255,210,160,0)');
      c.fillStyle = gr;
      c.fillRect(SUN[0] - R, SUN[1] - R, 2 * R, 2 * R);
    });

    // densité des valeurs : ombres lavande à gauche, chaleur à droite
    g.screen((c, W, H) => {
      c.globalCompositeOperation = 'soft-light';
      c.globalAlpha = 0.22;
      c.drawImage(c.canvas, 0, 0);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'multiply';
      let gr = c.createLinearGradient(0, H, W * 0.6, H * 0.3);
      gr.addColorStop(0, 'rgba(130,128,178,0.4)');
      gr.addColorStop(1, 'rgba(130,128,178,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'soft-light';
      gr = c.createRadialGradient(W * 0.9, 0, 0, W * 0.9, 0, W * 0.8);
      gr.addColorStop(0, `rgba(255,200,140,${0.3 + 0.1 * kSun})`);
      gr.addColorStop(1, 'rgba(255,200,140,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
    });
  },

  shots: {
    // Alice sur sa chaise ; lente poussée vers elle
    alice: {
      dur: 7,
      cam: (t, portrait) => {
        const k = 0.6 * ease.inOut(clamp(t / 7)) + 0.4 * clamp(t / 7);
        return portrait
          ? { x: lerp(O[0] + 70, O[0] + 50, k), y: lerp(500, 490, k), z: lerp(1.12, 1.26, k) }
          // en 16:9, le cadre descend un peu en se resserrant : les pieds
          // restent au-dessus des sous-titres (y écran < 820) jusqu'à la fin
          : { x: lerp(O[0] + 100, O[0] + 80, k), y: lerp(556, 566, k), z: lerp(1.2, 1.34, k) };
      },
      p: (t) => ({ breath: 1, mist: 0.45 + 0.35 * seg(t, 0.5, 6.5), sun: 0.35 + 0.15 * clamp(t / 7) }),
    },
  },
};
