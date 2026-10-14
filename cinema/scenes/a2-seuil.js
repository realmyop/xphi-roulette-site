/* ==========================================================================
   Décor « a2-seuil » — Acte 2. Le seuil : par-dessus les épaules du couple,
   sur le pas de la porte de la chambre vide. C'est le pendant de la visée de
   l'Acte 1 et l'image figée du choix.

   Premier plan flou, de dos et à contre-jour : A à gauche (chignon bas et
   lâche, gilet terre cuite), B à droite (cheveux courts, pull vert forêt),
   leurs mains jointes entre eux. Au fond, net : la chambre vide d'un matin
   d'automne (murs crème, parquet clair, la fenêtre sur le mur de gauche, une
   grande tache de soleil au sol, croisée par l'ombre de la fenêtre, un seul
   carton fermé et sa longue ombre bleutée). La porte, ouverte en grand dans
   la chambre, est cachée derrière le chambranle de droite ; elle peut se
   refermer (il reste alors un filet de jour côté serrure).

   Paramètres (p) :
     light    0 → 1   la lumière du jour baisse (fin « renoncer »)
     door     0 → 1   la porte, grande ouverte, se referme doucement
     couple   1 / 0   le couple au premier plan (absent dans « vide »)
     squeeze  0 → 1   les mains se serrent

   Plans : « seuil » (5 s, image figée du choix à la fin) et « vide » (7 s).
   ========================================================================== */
import { rng } from '../kit.js';
import { TAU, clamp, lerp, ease, seg } from '../../film/engine.js';

const DEG = Math.PI / 180;
const f1 = (v) => +v.toFixed(1);
const pt = (p) => `${f1(p[0])},${f1(p[1])}`;
const poly = (ps, attrs = '') => `<polygon points="${ps.map(pt).join(' ')}" ${attrs}/>`;
const quad = (ps) => `M${ps.map(pt).join(' L')} Z`;
const norm = ([x, y]) => { const m = Math.hypot(x, y) || 1; return [x / m, y / m]; };

// Courbe lisse (Catmull-Rom) passant par les points ; [x, y, 1] : angle vif
function smooth(ps, closed = true) {
  const n = ps.length;
  const at = (i) => (closed ? ps[((i % n) + n) % n] : ps[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pt(ps[0])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return closed ? d + 'Z' : d;
}
const open = (ps) => smooth(ps, false);

// Membre : contour d'un « boudin » le long d'un axe, rayons variables, bouts ronds
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
  return smooth([...A, ...cap(n - 1, [q, 0, -q]), ...B.reverse(), ...cap(0, [-3 * q, Math.PI, 3 * q])]);
}

// Dégradés en coordonnées du décor, flous, liserés
const stops = (s) => s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
const grad = (id, a, b, s) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}">${stops(s)}</linearGradient>`;
const radial = (id, c, r, s, f = c) =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r)}" fx="${f1(f[0])}" fy="${f1(f[1])}">${stops(s)}</radialGradient>`;
const blurF = (id, s) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
// Lavis : grain de papier très léger dans la couleur
const lavis = (id, freq, amp, seed) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 1" result="g"/>` +
  `<feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="${amp}" k2="${1 - amp / 2}" k3="0" k4="0" result="m"/>` +
  `<feComposite in="m" in2="SourceGraphic" operator="in"/></filter>`;
// Liseré de contre-jour, gardé à l'intérieur de la forme
const rim = (d, clip, w, color, blur, op = 1) =>
  `<g clip-path="url(#${clip})"><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" filter="url(#${blur})"/></g>`;

/* --------------------------------------------------------------------------
   Perspective : la chambre et la porte sont construites en centimètres puis
   projetées. Caméra à 1,30 m dans l'axe de la porte, perspective centrale,
   calme ; les verticales restent verticales (décentrement).
   -------------------------------------------------------------------------- */
const F = 1000, CX = 960, CY = 290, CH = 130;
const YAW = 0, CAMX = 0;
const cY = Math.cos(YAW), sY = Math.sin(YAW);
function pr(X, Y, Z) {
  const x = X - CAMX;
  const xc = x * cY + Z * sY, zc = Z * cY - x * sY;
  return [CX + (F * xc) / zc, CY + (F * (CH - Y)) / zc];
}

// Mur du couloir (nu côté couloir, côté chambre), baie de la porte
const ZH = 140, ZE = 154, XO0 = -46, XO1 = 46, HO = 205;
// Chambre : mur gauche (fenêtre), mur droit, mur du fond, plafond
const XL = -72, XR = 200, ZF = 520, HP = 262;
// Fenêtre : deux battants et une imposte, en retrait de d dans le mur
const WIN = { z1: 240, z2: 450, y1: 36, y2: 228, d: 12 };
WIN.zm = (WIN.z1 + WIN.z2) / 2;
WIN.yt = WIN.y1 + 0.76 * (WIN.y2 - WIN.y1);

// Soleil du matin : assez bas, il entre par la gauche et file un peu vers le fond
const SUN = (() => {
  const e = 34 * DEG, a = 18 * DEG;
  return [Math.cos(e) * Math.cos(a), -Math.sin(e), Math.cos(e) * Math.sin(a)];
})();

// Ouvertures utiles des carreaux (sur le nu intérieur du mur, X = XL) : le
// carreau, décalé par l'épaisseur de l'embrasure, coupé par l'ouverture
const PANES = (() => {
  const { z1, z2, y1, y2, d, zm, yt } = WIN;
  const fw = 6, mw = 5.5, tw = 3.5;
  const glass = [
    [z1 + fw, zm - mw, y1 + fw, yt - tw], [zm + mw, z2 - fw, y1 + fw, yt - tw],
    [z1 + fw, zm - mw, yt + tw, y2 - fw], [zm + mw, z2 - fw, yt + tw, y2 - fw],
  ];
  const t = d / SUN[0], dz = SUN[2] * t, dy = SUN[1] * t;
  return glass
    .map(([za, zb, ya, yb]) => [Math.max(za + dz, z1), Math.min(zb + dz, z2), Math.max(ya + dy, y1), Math.min(yb + dy, y2)])
    .filter(([za, zb, ya, yb]) => zb - za > 2 && yb - ya > 2);
})();

// Où tombe le rayon qui passe par (XL, Y, Z) : au sol, ou sur le mur du fond
const toFloor = (Y, Z) => { const t = Y / -SUN[1]; return [XL + SUN[0] * t, 0, Z + SUN[2] * t]; };
const toWall = (Y, Z) => { const t = (ZF - Z) / SUN[2]; return [XL + SUN[0] * t, Y + SUN[1] * t, ZF]; };
const landT = (Y, Z) => Math.min(Y / -SUN[1], (ZF - Z) / SUN[2]);

// Le carton : posé dans le soleil, un peu de biais
const BOX = { x: -6, z: 404, w: 48, d: 36, h: 34, rot: -14 * DEG };
const boxPt = (u, v, y) => {
  const c = Math.cos(BOX.rot), s = Math.sin(BOX.rot);
  return [BOX.x + u * c - v * s, y, BOX.z + u * s + v * c];
};

// Quadrilatères des surfaces de la chambre (à l'écran)
const Q_FLOOR = [pr(XL, 0, ZE), pr(XR, 0, ZE), pr(XR, 0, ZF), pr(XL, 0, ZF)];
const Q_FAR = [pr(XL, 0, ZF), pr(XR, 0, ZF), pr(XR, HP, ZF), pr(XL, HP, ZF)];
const Q_LEFT = [pr(XL, 0, ZE), pr(XL, 0, ZF), pr(XL, HP, ZF), pr(XL, HP, ZE)];
const Q_WIN = [pr(XL, WIN.y1, WIN.z1), pr(XL, WIN.y1, WIN.z2), pr(XL, WIN.y2, WIN.z2), pr(XL, WIN.y2, WIN.z1)];

/* --------------------------------------------------------------------------
   Calques « fond » (soleil) et « ombre » (la lumière est partie) : la
   chambre vide. Même dessin, même graine ; seule la lumière change.
   -------------------------------------------------------------------------- */
function chambre(sun) {
  const k = sun ? 's' : 'o';
  const id = (n) => `a2-seuil-${k}-${n}`;
  const r = rng(17);
  const fl = Q_FLOOR, far = Q_FAR, lw = Q_LEFT;
  const C = sun
    ? { far: '#e0cfb2', farLo: '#ebd8b8', farHi: '#cdbea5', left: '#a69b8b', leftFar: '#c2b5a0', ceil: '#d1c7b4', ceilFar: '#ddd2bf',
      floorNear: '#8c6a4d', floorMid: '#ac835d', floorFar: '#c49a6f', base: '#e9dfce', baseShade: '#bdb19e' }
    : { far: '#b8b3a9', farLo: '#bdb5a8', farHi: '#a9a59e', left: '#8e8b85', leftFar: '#a19c93', ceil: '#aeaaa2', ceilFar: '#b8b3aa',
      floorNear: '#6f5a4a', floorMid: '#86684f', floorFar: '#977860', base: '#c9c4b9', baseShade: '#9d9a92' };

  let s = `<defs>
    ${grad(id('far'), pr(XL, HP, ZF), pr(XL, 0, ZF), [[0, C.farHi], [0.55, C.far], [1, C.farLo]])}
    ${grad(id('far-h'), pr(XL, 100, ZF), pr(140, 100, ZF), [[0, '#8e8c92', 0.28], [0.35, '#8e8c92', 0], [1, '#fff4dc', sun ? 0.16 : 0]])}
    ${grad(id('left'), pr(XL, 120, 260), pr(XL, 120, ZF), [[0, C.left], [1, C.leftFar]])}
    ${grad(id('ceil'), pr(0, HP, 300), pr(0, HP, ZF), [[0, C.ceil], [1, C.ceilFar]])}
    ${grad(id('floor'), pr(0, 0, 175), pr(0, 0, ZF), [[0, C.floorNear], [0.45, C.floorMid], [1, C.floorFar]])}
    ${grad(id('vitre'), pr(XL - WIN.d, WIN.y2, 340), pr(XL - WIN.d, WIN.y1, 340), sun
      ? [[0, '#ece9e0'], [0.45, '#f7eedb'], [1, '#fbe9c9']] : [[0, '#d9dcdc'], [0.5, '#e2e1db'], [1, '#e4dfd4']])}
    <clipPath id="${id('c-floor')}"><path d="${quad(fl)}"/></clipPath>
    <clipPath id="${id('c-far')}"><path d="${quad(far)}"/></clipPath>
    <clipPath id="${id('c-left')}"><path d="${quad(lw)}"/></clipPath>
    <clipPath id="${id('c-win')}"><path d="${quad(Q_WIN)}"/></clipPath>
    ${blurF(id('f1'), 1.2)}${blurF(id('f2'), 2)}${blurF(id('f4'), 4)}${blurF(id('f8'), 8)}${blurF(id('f16'), 16)}${blurF(id('f30'), 30)}
    ${lavis(id('lavis'), 0.018, 0.14, 12)}
    ${grad(id('bleu'), pr(XL, HP, ZF), pr(120, 0, ZF), [[0, '#7d8597', sun ? 0.26 : 0.18], [0.55, '#7d8597', sun ? 0.1 : 0.1], [1, '#7d8597', 0]])}
  </defs>`;

  // Plafond, mur du fond, mur de gauche
  s += `<rect x="440" y="-140" width="1040" height="1360" fill="${C.ceil}"/>`;
  s += `<g filter="url(#${id('lavis')})">`;
  s += `<path d="${quad([pr(XL, HP, ZE), pr(XR, HP, ZE), pr(XR, HP, ZF), pr(XL, HP, ZF)])}" fill="url(#${id('ceil')})"/>`;
  s += `<path d="${quad(far)}" fill="url(#${id('far')})"/>`;
  s += `<path d="${quad(far)}" fill="url(#${id('far-h')})"/>`;
  s += `<path d="${quad(far)}" fill="url(#${id('bleu')})"/>`;
  s += `<path d="${quad(lw)}" fill="url(#${id('left')})"/>`;
  s += `<path d="${quad(lw)}" fill="#6f7789" opacity="${sun ? 0.16 : 0.12}"/>`;
  // le plancher
  s += `<path d="${quad(fl)}" fill="url(#${id('floor')})"/>`;
  s += '</g>';

  // Grandes variations de teinte (le mur vit un peu), dans chaque surface
  s += `<g clip-path="url(#${id('c-far')})">`;
  for (let i = 0; i < 9; i++) {
    const p = pr(XL + r() * 300, r() * HP, ZF);
    s += `<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="${f1(40 + r() * 90)}" ry="${f1(30 + r() * 60)}" fill="${r() < 0.5 ? '#efe4d0' : '#a9a49c'}" opacity="${f1(0.12 + r() * 0.1)}" filter="url(#${id('f16')})"/>`;
  }
  s += '</g>';
  s += `<g clip-path="url(#${id('c-left')})">`;
  for (let i = 0; i < 6; i++) {
    const p = pr(XL, r() * HP, 260 + r() * 300);
    s += `<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="${f1(20 + r() * 40)}" ry="${f1(40 + r() * 80)}" fill="${r() < 0.5 ? '#c3b8a6' : '#7f7b78'}" opacity="${f1(0.14 + r() * 0.1)}" filter="url(#${id('f16')})"/>`;
  }
  s += '</g>';

  // Corniche discrète au plafond, angle du fond
  s += `<path d="M${pt(pr(XL, HP, ZF))} L${pt(pr(XR, HP, ZF))}" stroke="${sun ? '#f1e8d8' : '#c4bfb6'}" stroke-width="3" opacity=".7"/>`;
  s += `<path d="M${pt(pr(XL, HP - 3, ZF))} L${pt(pr(XR, HP - 3, ZF))}" stroke="#7d776f" stroke-width="2" opacity=".25" filter="url(#${id('f2')})"/>`;
  s += `<path d="M${pt(pr(XL, HP, ZE))} L${pt(pr(XL, HP, ZF))}" stroke="${sun ? '#ece2d1' : '#bdb8af'}" stroke-width="3" opacity=".6"/>`;
  // Arête verticale du coin du fond : ombre douce côté mur de gauche
  {
    const a = pr(XL, 0, ZF), b = pr(XL, HP, ZF);
    s += `<path d="M${pt(a)} L${pt(b)}" stroke="#6e6a68" stroke-width="16" opacity="${sun ? 0.16 : 0.2}" filter="url(#${id('f8')})"/>`;
  }

  // Parquet : lames qui fuient vers le fond, joints, nuances de bois
  s += `<g clip-path="url(#${id('c-floor')})">`;
  const LAME = 11.5;
  for (let X = XL; X < XR; X += LAME) {
    let Z = ZE - r() * 60;
    while (Z < ZF) {
      const L = 70 + r() * 90, Z2 = Math.min(ZF, Z + L);
      const tone = r();
      const c = tone < 0.3 ? '#b8855a' : tone < 0.6 ? '#93684a' : tone < 0.85 ? '#a7774f' : '#c99e72';
      s += poly([pr(X, 0, Math.max(Z, ZE)), pr(X + LAME, 0, Math.max(Z, ZE)), pr(X + LAME, 0, Z2), pr(X, 0, Z2)], `fill="${c}" opacity="${f1(0.18 + r() * 0.16)}"`);
      if (Z2 < ZF) s += `<path d="M${pt(pr(X, 0, Z2))} L${pt(pr(X + LAME, 0, Z2))}" stroke="#5d4130" stroke-width="1.3" opacity=".42"/>`;
      Z = Z2;
    }
    s += `<path d="M${pt(pr(X, 0, ZE))} L${pt(pr(X, 0, ZF))}" stroke="#5a3e2d" stroke-width="1.5" opacity="${sun ? 0.5 : 0.45}"/>`;
    s += `<path d="M${pt(pr(X + 1.2, 0, ZE))} L${pt(pr(X + 1.2, 0, ZF))}" stroke="#f0cfa0" stroke-width="1" opacity="${sun ? 0.14 : 0.06}"/>`;
  }
  // reflet de la fenêtre sur le parquet ciré (flou, vertical)
  {
    const a = pr(XL + 18, 0, WIN.z1 + 30), b = pr(XL + 18, 0, WIN.z2);
    const cx = (a[0] + b[0]) / 2, top = Math.min(a[1], b[1]);
    s += `<ellipse cx="${f1(cx + 18)}" cy="${f1(top + 90)}" rx="70" ry="120" fill="${sun ? '#ffe9c4' : '#d9d6cc'}" opacity="${sun ? 0.22 : 0.12}" filter="url(#${id('f30')})"/>`;
  }
  // ombre du fond de la pièce au pied des murs, pénombre vers la porte
  s += `<path d="M${pt(pr(XL, 0, ZF))} L${pt(pr(XR, 0, ZF))}" stroke="#4a3a33" stroke-width="22" opacity=".3" filter="url(#${id('f8')})"/>`;
  s += `<path d="M${pt(pr(XL, 0, ZE))} L${pt(pr(XL, 0, ZF))}" stroke="#4a3a33" stroke-width="26" opacity=".32" filter="url(#${id('f8')})"/>`;
  s += poly([pr(XL, 0, ZE), pr(XR, 0, ZE), pr(XR, 0, 215), pr(XL, 0, 215)], `fill="#3b2c26" opacity=".38" filter="url(#${id('f30')})"`);
  s += '</g>';

  // Plinthes crème
  s += poly([pr(XL, 0, ZF), pr(XR, 0, ZF), pr(XR, 9, ZF), pr(XL, 9, ZF)], `fill="${C.base}"`);
  s += `<path d="M${pt(pr(XL, 9, ZF))} L${pt(pr(XR, 9, ZF))}" stroke="#fffaf0" stroke-width="1.6" opacity=".6"/>`;
  s += poly([pr(XL, 0, ZE), pr(XL, 0, ZF), pr(XL, 9, ZF), pr(XL, 9, ZE)], `fill="${C.baseShade}"`);

  // La fenêtre : embrasure, vitre (le dehors, flou), menuiseries, appui
  {
    const { z1, z2, y1, y2, d, zm, yt } = WIN;
    const G = (Y, Z) => pr(XL - d, Y, Z);
    s += `<g clip-path="url(#${id('c-win')})">`;
    s += `<path d="${quad([G(y1, z1), G(y1, z2), G(y2, z2), G(y2, z1)])}" fill="url(#${id('vitre')})"/>`;
    // dehors : la façade d'en face très claire, un arbre aux feuilles d'automne
    s += `<g filter="url(#${id('f8')})" opacity="${sun ? 0.75 : 0.6}">`;
    const fac = [G(y1, z1 - 40), G(y1, z2 + 30), G(150, z2 + 30), G(165, z1 - 40)];
    s += `<path d="${quad(fac)}" fill="${sun ? '#efe3cb' : '#cfcbc2'}"/>`;
    for (let i = 0; i < 9; i++) {
      const p = G(130 + r() * 110, z1 + r() * (z2 - z1));
      s += `<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="${f1(8 + r() * 14)}" ry="${f1(10 + r() * 16)}" fill="${sun ? (r() < 0.5 ? '#e7c27c' : '#d7a964') : '#b7aa8a'}" opacity="${f1(0.5 + r() * 0.4)}"/>`;
    }
    s += '</g>';
    // menuiseries (blanc cassé) : dormant, battue centrale, imposte
    const fr = sun ? '#efe9de' : '#cdc9c0', frS = sun ? '#c8bfb1' : '#a6a29b';
    const bar = (ya, yb, za, zb, c) => `<path d="${quad([G(ya, za), G(ya, zb), G(yb, zb), G(yb, za)])}" fill="${c}"/>`;
    s += bar(y1, y1 + 6, z1, z2, fr) + bar(y2 - 6, y2, z1, z2, frS) + bar(y1, y2, z1, z1 + 6, frS) + bar(y1, y2, z2 - 6, z2, fr);
    s += bar(y1, yt, zm - 4, zm + 4, fr) + bar(yt - 2.5, yt + 2.5, z1, z2, fr);
    s += `<path d="M${pt(G(y1, zm + 4))} L${pt(G(yt, zm + 4))}" stroke="${frS}" stroke-width="1.6"/>`;
    // béquilles de la fenêtre, à peine
    s += `<path d="M${pt(G(118, zm - 6))} L${pt(G(104, zm - 6))}" stroke="#a7a9a8" stroke-width="2.4" stroke-linecap="round"/>`;
    // embrasure du fond (face à nous) : prise dans le soleil
    const rev = [pr(XL, y1, z2), pr(XL - d, y1, z2), pr(XL - d, y2, z2), pr(XL, y2, z2)];
    s += `<path d="${quad(rev)}" fill="${sun ? '#fff2da' : '#cfcbc3'}"/>`;
    // tableau du haut (sous le linteau) dans l'ombre
    s += `<path d="${quad([pr(XL, y2, z1), pr(XL, y2, z2), pr(XL - d, y2, z2), pr(XL - d, y2, z1)])}" fill="${sun ? '#b1a796' : '#97938b'}"/>`;
    // appui : dessus clair
    s += `<path d="${quad([pr(XL + 3, y1, z1 - 4), pr(XL + 3, y1, z2 + 4), pr(XL - d, y1, z2), pr(XL - d, y1, z1)])}" fill="${sun ? '#f6eddc' : '#cbc6bc'}"/>`;
    s += '</g>';
    // nez de l'appui, ombre portée sur le mur dessous
    s += `<path d="M${pt(pr(XL + 3, y1, z1 - 4))} L${pt(pr(XL + 3, y1, z2 + 4))}" stroke="${sun ? '#fff6e6' : '#d6d1c6'}" stroke-width="3"/>`;
    s += `<path d="M${pt(pr(XL + 1, y1 - 4, z1))} L${pt(pr(XL + 1, y1 - 4, z2))}" stroke="#5f5a54" stroke-width="7" opacity=".35" filter="url(#${id('f4')})"/>`;
    // le mur autour de la fenêtre, plus sombre (contre-jour), et un halo
    s += `<path d="${quad(Q_WIN)}" fill="none" stroke="#6f6a63" stroke-width="22" opacity="${sun ? 0.2 : 0.14}" filter="url(#${id('f16')})"/>`;
  }

  // Tache de soleil : chaque carreau projeté au sol, puis sur le mur du fond
  if (sun) {
    const floorQ = (pn) => { const [za, zb, ya, yb] = pn; return [toFloor(ya, za), toFloor(ya, zb), toFloor(yb, zb), toFloor(yb, za)].map((p) => pr(...p)); };
    const wallQ = (pn) => { const [za, zb, ya, yb] = pn; return [toWall(ya, za), toWall(ya, zb), toWall(yb, zb), toWall(yb, za)].map((p) => pr(...p)); };
    const patches = (fn) => PANES.map((pn) => `<path d="${quad(fn(pn))}"/>`).join('');
    s += `<defs><clipPath id="${id('c-sol')}">${patches(floorQ)}</clipPath></defs>`;
    // halo chaud (la lumière rebondit), puis la tache nette, puis son cœur
    s += `<g clip-path="url(#${id('c-floor')})">`;
    s += `<g fill="#ffc987" opacity=".22" filter="url(#${id('f30')})">${patches(floorQ)}</g>`;
    s += `<g fill="#f4c27f" opacity=".95" filter="url(#${id('f1')})">${patches(floorQ)}</g>`;
    s += `<g fill="#ffe2b2" opacity=".6" filter="url(#${id('f4')})" transform="translate(0 -2)">${patches(floorQ)}</g>`;
    // le parquet reste visible dans la lumière : joints dorés
    s += `<g clip-path="url(#${id('c-sol')})">`;
    for (let X = XL; X < XR; X += LAME) {
      s += `<path d="M${pt(pr(X, 0, ZE))} L${pt(pr(X, 0, ZF))}" stroke="#a8703f" stroke-width="1.4" opacity=".45"/>`;
    }
    // ombre portée du carton dans la tache : longue, bleutée
    const top = [boxPt(-BOX.w / 2, -BOX.d / 2, BOX.h), boxPt(BOX.w / 2, -BOX.d / 2, BOX.h), boxPt(BOX.w / 2, BOX.d / 2, BOX.h), boxPt(-BOX.w / 2, BOX.d / 2, BOX.h)];
    const t = BOX.h / -SUN[1];
    const cast = top.map(([x, , z]) => pr(x + SUN[0] * t, 0, z + SUN[2] * t));
    const base = [boxPt(-BOX.w / 2, -BOX.d / 2, 0), boxPt(BOX.w / 2, -BOX.d / 2, 0), boxPt(BOX.w / 2, BOX.d / 2, 0), boxPt(-BOX.w / 2, BOX.d / 2, 0)].map((p) => pr(...p));
    const hull = convexHull([...base, ...cast]);
    s += `<path d="${quad(hull)}" fill="#7e6a62" opacity=".72" filter="url(#${id('f2')})"/>`;
    s += `<path d="${quad(hull)}" fill="#6f6a78" opacity=".3" filter="url(#${id('f8')})"/>`;
    s += '</g></g>';
    // sur le mur du fond
    s += `<g clip-path="url(#${id('c-far')})">`;
    s += `<g fill="#ffe2b4" opacity=".4" filter="url(#${id('f30')})">${patches(wallQ)}</g>`;
    s += `<g fill="#fff0d6" opacity=".9" filter="url(#${id('f2')})">${patches(wallQ)}</g>`;
    s += '</g>';
    // la lumière rebondit sur la plinthe et le bas du mur du fond
    const pb = pr(60, 50, ZF);
    s += `<g clip-path="url(#${id('c-far')})"><ellipse cx="${f1(pb[0])}" cy="${f1(pb[1])}" rx="300" ry="170" fill="#f7c98e" opacity=".3" filter="url(#${id('f30')})"/></g>`;
    const pc = pr(0, 6, ZF);
    s += `<ellipse cx="${f1(pc[0] + 40)}" cy="${f1(pc[1])}" rx="160" ry="34" fill="#ffd9a4" opacity=".28" filter="url(#${id('f16')})"/>`;
  }

  // Le carton fermé
  s += carton(sun, id, r);
  return s;
}

// Enveloppe convexe (pour l'ombre portée du carton)
function convexHull(ps) {
  const p = [...ps].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}

// Le carton : faces éclairées selon le soleil, ruban adhésif sur le dessus
function carton(sun, id, r) {
  const W2 = BOX.w / 2, D2 = BOX.d / 2, H = BOX.h;
  const P_ = (u, v, y) => pr(...boxPt(u, v, y));
  const light = [-SUN[0], -SUN[1], -SUN[2]];
  const c = Math.cos(BOX.rot), sn = Math.sin(BOX.rot);
  const faces = [
    { n: [-c, 0, -sn], q: [P_(-W2, D2, 0), P_(-W2, -D2, 0), P_(-W2, -D2, H), P_(-W2, D2, H)], name: 'g' },
    { n: [sn, 0, -c], q: [P_(-W2, -D2, 0), P_(W2, -D2, 0), P_(W2, -D2, H), P_(-W2, -D2, H)], name: 'av' },
    { n: [c, 0, sn], q: [P_(W2, -D2, 0), P_(W2, D2, 0), P_(W2, D2, H), P_(W2, -D2, H)], name: 'd' },
  ];
  const cam = [CAMX, CH, 0];
  let s = '';
  // ombre de contact
  s += `<path d="${quad([P_(-W2 - 3, -D2 - 3, 0), P_(W2 + 3, -D2 - 3, 0), P_(W2 + 3, D2 + 3, 0), P_(-W2 - 3, D2 + 3, 0)])}" fill="#3a2a24" opacity=".45" filter="url(#${id('f4')})"/>`;
  for (const f of faces) {
    const ctr = boxPt(0, 0, H / 2);
    const fc = [ctr[0] + f.n[0] * 25, ctr[1], ctr[2] + f.n[2] * 25];
    const toCam = [cam[0] - fc[0], cam[1] - fc[1], cam[2] - fc[2]];
    if (toCam[0] * f.n[0] + toCam[2] * f.n[2] <= 0) continue;
    const lit = sun ? Math.max(0, f.n[0] * light[0] + f.n[2] * light[2]) : 0;
    const col = sun ? mixHex('#7d5f45', '#e6b982', Math.min(1, 0.15 + lit * 1.25)) : '#8a7058';
    s += `<path d="${quad(f.q)}" fill="${col}"/>`;
    // carton ondulé : quelques traces, bords un peu usés
    s += `<path d="${quad(f.q)}" fill="none" stroke="${sun ? '#5c4331' : '#4e3d31'}" stroke-width="1.2" opacity=".35"/>`;
  }
  // dessus : deux rabats, ruban
  const top = [P_(-W2, -D2, H), P_(W2, -D2, H), P_(W2, D2, H), P_(-W2, D2, H)];
  s += `<path d="${quad(top)}" fill="${sun ? '#f0cb93' : '#9d8167'}"/>`;
  s += `<path d="M${pt(P_(-W2, 0, H))} L${pt(P_(W2, 0, H))}" stroke="${sun ? '#9d7650' : '#6b5644'}" stroke-width="1.4" opacity=".7"/>`;
  s += `<path d="${quad([P_(-W2, -2.6, H + 0.2), P_(W2, -2.6, H + 0.2), P_(W2, 2.6, H + 0.2), P_(-W2, 2.6, H + 0.2)])}" fill="${sun ? '#d9b07a' : '#8f765f'}" opacity=".9"/>`;
  s += `<path d="M${pt(P_(-W2, -2.2, H + 0.3))} L${pt(P_(W2, -2.2, H + 0.3))}" stroke="${sun ? '#fff1d2' : '#b5a28c'}" stroke-width="1.2" opacity=".75"/>`;
  // le ruban descend sur la face avant
  s += `<path d="${quad([P_(-W2, -2.6, H), P_(-W2, 2.6, H), P_(-W2, 2.6, H - 9), P_(-W2, -2.6, H - 9)])}" fill="${sun ? '#f2c58c' : '#8d735c'}" opacity=".9"/>`;
  // arête du dessus prise dans la lumière
  if (sun) s += `<path d="M${pt(P_(-W2, D2, H))} L${pt(P_(-W2, -D2, H))} L${pt(P_(W2, -D2, H))}" stroke="#fff0cf" stroke-width="1.8" fill="none" opacity=".8"/>`;
  return s;
}

function mixHex(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (p, sh) => (p >> sh) & 255;
  const m = (sh) => Math.round(lerp(ch(pa, sh), ch(pb, sh), k));
  return `rgb(${m(16)},${m(8)},${m(0)})`;
}

/* --------------------------------------------------------------------------
   Calque « cadre » : le mur du couloir dans la pénombre, le chambranle, les
   embrasures de la porte éclairées par la chambre
   -------------------------------------------------------------------------- */
function cadre() {
  const id = (n) => `a2-seuil-cadre-${n}`;
  const CW = 7, CP = 2; // largeur et saillie du chambranle
  const yTop = HO + CW;
  const outer = [pr(XO0 - CW, -30, ZH - CP), pr(XO0 - CW, yTop, ZH - CP), pr(XO1 + CW, yTop, ZH - CP), pr(XO1 + CW, -30, ZH - CP)];
  const hole = [pr(XO0, -30, ZH), pr(XO0, HO, ZH), pr(XO1, HO, ZH), pr(XO1, -30, ZH)];
  const midL = pr(XO0, 110, ZE), midR = pr(XO1, 110, ZE);
  const ctr = [(midL[0] + midR[0]) / 2, 520];
  let s = `<defs>
    ${radial(id('mur'), ctr, 1150, [[0, '#c2ae92'], [0.3, '#a2927b'], [0.55, '#837767'], [1, '#544b42']])}
    ${grad(id('mur-v'), [0, -140], [0, 1220], [[0, '#3b3530', 0.35], [0.35, '#3b3530', 0], [0.75, '#3b3530', 0], [1, '#2a2522', 0.3]])}
    ${grad(id('tab-g'), pr(XO0, 100, ZH), pr(XO0, 100, ZE), [[0, '#c9b69b'], [1, '#f4e3c6']])}
    ${grad(id('tab-d'), pr(XO1, 100, ZH), pr(XO1, 100, ZE), [[0, '#b6a68f'], [1, '#e3d1b4']])}
    ${grad(id('chb-g'), pr(XO0 - CW, 0, ZH), pr(XO0, 0, ZH), [[0, '#a19580'], [0.7, '#c9baa1'], [1, '#e9d9bd']])}
    ${grad(id('chb-d'), pr(XO1, 0, ZH), pr(XO1 + CW, 0, ZH), [[0, '#e2d1b5'], [0.3, '#c2b39b'], [1, '#958a77']])}
    ${blurF(id('f3'), 3)}${blurF(id('f8'), 8)}${blurF(id('f20'), 20)}${blurF(id('f40'), 40)}
    ${lavis(id('lavis'), 0.012, 0.16, 5)}
  </defs>`;
  // le mur, percé de la baie (chambranle compris)
  s += `<g filter="url(#${id('lavis')})">`;
  s += `<path d="M-240,-140 H2160 V1220 H-240 Z ${quad(outer)}" fill-rule="evenodd" fill="url(#${id('mur')})"/>`;
  s += `<path d="M-240,-140 H2160 V1220 H-240 Z ${quad(outer)}" fill-rule="evenodd" fill="url(#${id('mur-v')})"/>`;
  s += '</g>';
  // la lumière de la chambre déborde sur le mur, autour du chambranle :
  // nappe chaude, plus forte en bas (le parquet ensoleillé la renvoie)
  s += `<path d="${quad(outer)}" fill="none" stroke="#e9c597" stroke-width="150" opacity=".26" filter="url(#${id('f40')})"/>`;
  s += `<path d="${quad(outer)}" fill="none" stroke="#f3d4a6" stroke-width="40" opacity=".3" filter="url(#${id('f20')})"/>`;
  s += `<ellipse cx="${f1(ctr[0])}" cy="900" rx="620" ry="380" fill="#d9b183" opacity=".18" filter="url(#${id('f40')})"/>`;
  // grandes taches de peinture du mur (lavis), et pénombre vers les bords
  const r = rng(41);
  for (let i = 0; i < 14; i++) {
    const x = r() < 0.5 ? -200 + r() * 700 : 1300 + r() * 800, y = -100 + r() * 1300;
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(80 + r() * 160)}" ry="${f1(120 + r() * 220)}" fill="${r() < 0.5 ? '#a99a84' : '#3e3832'}" opacity="${f1(0.08 + r() * 0.1)}" filter="url(#${id('f40')})"/>`;
  }
  s += `<rect x="-240" y="-140" width="520" height="1360" fill="#2a2522" opacity=".3" filter="url(#${id('f40')})"/>`;
  s += `<rect x="1640" y="-140" width="520" height="1360" fill="#2a2522" opacity=".3" filter="url(#${id('f40')})"/>`;
  // ombre du chambranle sur le mur (il est en saillie)
  s += `<path d="M${pt(pr(XO0 - CW, -30, ZH))} L${pt(pr(XO0 - CW, yTop, ZH))}" stroke="#2e2924" stroke-width="10" opacity=".35" filter="url(#${id('f3')})" transform="translate(-4 0)"/>`;
  s += `<path d="M${pt(pr(XO1 + CW, -30, ZH))} L${pt(pr(XO1 + CW, yTop, ZH))}" stroke="#2e2924" stroke-width="10" opacity=".35" filter="url(#${id('f3')})" transform="translate(4 0)"/>`;
  // chambranle (blanc cassé, dans la pénombre ; son bord intérieur éclairé)
  s += `<path d="${quad([pr(XO0 - CW, -30, ZH - CP), pr(XO0 - CW, yTop, ZH - CP), pr(XO0, yTop, ZH - CP), pr(XO0, -30, ZH - CP)])}" fill="url(#${id('chb-g')})"/>`;
  s += `<path d="${quad([pr(XO1, -30, ZH - CP), pr(XO1, yTop, ZH - CP), pr(XO1 + CW, yTop, ZH - CP), pr(XO1 + CW, -30, ZH - CP)])}" fill="url(#${id('chb-d')})"/>`;
  s += `<path d="${quad([pr(XO0 - CW, HO, ZH - CP), pr(XO0 - CW, yTop, ZH - CP), pr(XO1 + CW, yTop, ZH - CP), pr(XO1 + CW, HO, ZH - CP)])}" fill="#b3a68f"/>`;
  // moulure du chambranle
  for (const [x, c, o] of [[XO0 - CW + 2, '#6f665a', 0.35], [XO0 - 1.5, '#fff1d8', 0.5], [XO1 + 1.5, '#fbe8c8', 0.45], [XO1 + CW - 2, '#5f574c', 0.35]]) {
    s += `<path d="M${pt(pr(x, -30, ZH - CP))} L${pt(pr(x, yTop, ZH - CP))}" stroke="${c}" stroke-width="2" opacity="${o}"/>`;
  }
  // embrasures : éclairées par la chambre (plus chaud côté chambre)
  s += `<path d="${quad([pr(XO0, -30, ZH - CP), pr(XO0, -30, ZE), pr(XO0, HO, ZE), pr(XO0, HO, ZH - CP)])}" fill="url(#${id('tab-g')})"/>`;
  s += `<path d="${quad([pr(XO1, -30, ZE), pr(XO1, -30, ZH - CP), pr(XO1, HO, ZH - CP), pr(XO1, HO, ZE)])}" fill="url(#${id('tab-d')})"/>`;
  // arrêt de porte (fine moulure) et paumelles côté droit
  s += `<path d="M${pt(pr(XO1, -30, ZE - 2))} L${pt(pr(XO1, HO, ZE - 2))}" stroke="#9c8d77" stroke-width="2" opacity=".5"/>`;
  for (const y of [24, 182]) {
    const a = pr(XO1, y, ZE - 1), b = pr(XO1, y + 11, ZE - 1);
    s += `<path d="M${pt(a)} L${pt(b)}" stroke="#a9adad" stroke-width="5" stroke-linecap="round"/>`;
  }
  // l'arête vive entre embrasure et chambranle attrape la lumière
  s += `<path d="M${pt(pr(XO0, -30, ZH - CP))} L${pt(pr(XO0, HO, ZH - CP))}" stroke="#fff3dc" stroke-width="2.4" opacity=".7"/>`;
  s += `<path d="M${pt(pr(XO1, -30, ZH - CP))} L${pt(pr(XO1, HO, ZH - CP))}" stroke="#f8e6c6" stroke-width="2" opacity=".55"/>`;
  return s;
}

/* --------------------------------------------------------------------------
   Calque « porte » : le vantail vu de face, côté couloir (peint à plat, puis
   posé en perspective par bandes verticales selon son angle d'ouverture).
   Blanc cassé, deux panneaux moulurés, béquille en métal clair.
   -------------------------------------------------------------------------- */
const DK = 4, DB = [500, 120], DW = 92, DHH = 203; // le vantail à plat, dans un coin du repère
const HINGE = [46.5, 152]; // axe des paumelles (X, Z), derrière l'arête de l'embrasure
const PHI0 = 105 * DEG, PHI1 = 4.5 * DEG; // grande ouverte → close, un filet de jour
function porte() {
  const X = (u) => DB[0] + DK * u, Y = (v) => DB[1] + DK * v;
  const id = (n) => `a2-seuil-porte-${n}`;
  const panel = (u0, v0, u1, v1) => {
    const a = [X(u0), Y(v0)], b = [X(u1), Y(v1)];
    return `<rect x="${a[0]}" y="${a[1]}" width="${b[0] - a[0]}" height="${b[1] - a[1]}" fill="#e6dfd1"/>` +
      `<path d="M${a[0]},${b[1]} V${a[1]} H${b[0]}" stroke="#cdc3b2" stroke-width="4" fill="none" filter="url(#${id('f')})"/>` +
      `<path d="M${a[0] + 5},${b[1] - 4} V${a[1] + 5} H${b[0] - 4}" stroke="#fffbf2" stroke-width="2" fill="none" opacity=".55"/>` +
      `<path d="M${b[0]},${a[1]} V${b[1]} H${a[0]}" stroke="#fdf9f1" stroke-width="4" fill="none" opacity=".7" filter="url(#${id('f')})"/>` +
      `<rect x="${a[0] + 6}" y="${a[1] + 6}" width="${b[0] - a[0] - 12}" height="${b[1] - a[1] - 12}" fill="#f1ebdf" opacity=".5" filter="url(#${id('g')})"/>`;
  };
  return `<defs>
    ${grad(id('bois'), [X(0), 0], [X(DW), 0], [[0, '#e9e2d4'], [0.5, '#efe9dd'], [1, '#e2dacb']])}
    ${grad(id('metal'), [0, Y(97)], [0, Y(102)], [[0, '#f4f4f0'], [0.5, '#b9bcbd'], [1, '#7b7f82']])}
    ${lavis(id('lavis'), 0.03, 0.12, 8)}
    ${blurF(id('f'), 2.5)}${blurF(id('g'), 14)}
  </defs>
  <g filter="url(#${id('lavis')})">
    <rect x="${X(0)}" y="${Y(0)}" width="${DK * DW}" height="${DK * DHH}" fill="url(#${id('bois')})"/>
    ${panel(12, 14, 80, 108)}${panel(12, 122, 80, 190)}
  </g>
  <!-- béquille, côté du bord libre -->
  <circle cx="${X(7)}" cy="${Y(99)}" r="${DK * 2.6}" fill="#9a9ea0"/>
  <circle cx="${X(7) - 1.5}" cy="${Y(99) - 1.5}" r="${DK * 2}" fill="#d9dbda"/>
  <rect x="${X(7)}" y="${Y(98.1)}" width="${DK * 12}" height="${DK * 1.9}" rx="${DK * 0.9}" fill="url(#${id('metal')})"/>
  <rect x="${X(5.5)}" y="${Y(110)}" width="${DK * 3}" height="${DK * 1.6}" rx="3" fill="#8e9294" opacity=".7"/>`;
}

/* --------------------------------------------------------------------------
   Le couple, de dos, à contre-jour. Chaque personne est dessinée dans son
   repère (centimètres ; origine à la base de la nuque, y vers le bas), puis
   posée à 7,9 px/cm. Ils se tiennent la main, coudes un peu pliés : les
   mains jointes restent au-dessus de la bande des sous-titres. La lumière
   vient de la chambre, devant eux : liserés chauds sur les bords tournés
   vers la porte ; le couloir, derrière nous, pose sur leur dos une lumière
   douce et froide.
   -------------------------------------------------------------------------- */
const S = 7.9;
const A0 = [640, 426], B0 = [1290, 331];
const GRIP = [962, 760];
const mA = (p) => [A0[0] + S * p[0], A0[1] + S * p[1], p[2]];
const mB = (p) => [B0[0] + S * p[0], B0[1] + S * p[1], p[2]];
const MA = (ps) => ps.map(mA), MB = (ps) => ps.map(mB);
const RS = (rs) => rs.map((v) => v * S);

// A : chignon bas et lâche, gilet terre cuite, pantalon crème
const A_HAIR = [
  [-5.2, -5.6], [-6.8, -8.6], [-7.9, -12.4], [-8.1, -16.4], [-7.0, -20.2], [-4.8, -23.0], [-1.6, -24.4], [1.8, -24.4],
  [4.9, -23.0], [7.1, -20.2], [8.2, -16.4], [8.1, -12.4], [7.1, -8.6], [5.6, -5.8], [2.8, -4.6], [0.2, -4.4], [-2.6, -4.6],
];
const A_BUN = [
  [-5.6, -6.4], [-4.2, -9.2], [-1.2, -10.4], [2.4, -10.4], [5.6, -9.0], [7.2, -6.4], [6.8, -3.6], [4.6, -2.0],
  [1.0, -1.5], [-2.6, -1.8], [-5.2, -3.4],
];
const A_NECK = [[-4.4, -5.4], [4.6, -5.4], [4.9, -2.4], [5.6, -0.4], [-5.4, -0.4], [-4.8, -2.4]];
const A_TORSO = [
  [-5.4, -1.4], [-9.4, 0.6], [-13.4, 2.8], [-16.6, 4.8], [-18.6, 7.6], [-19.2, 11.2], [-18.6, 15.6], [-17.4, 20],
  [-16.4, 27], [-15.8, 34], [-16.4, 41], [-17.6, 48], [-18.4, 54.6, 1], [-9, 56.2], [0, 56.6], [9, 56.2], [18.4, 54.6, 1],
  [17.6, 48], [16.4, 41], [15.8, 34], [16.4, 27], [17.4, 20], [18.6, 15.6], [19.2, 11.2], [18.6, 7.6], [16.6, 4.8],
  [13.4, 2.8], [9.4, 0.6], [5.4, -1.4], [0, -1.0],
];
const A_LEGS = [
  [-17.6, 50], [-18.2, 62], [-17.8, 80], [-16.8, 104], [-1.2, 104], [-0.7, 66], [0.7, 66], [1.2, 104],
  [16.8, 104], [17.8, 80], [18.2, 62], [17.6, 50],
];
const A_ARM_L = tube(MA([[-15.8, 10], [-18.6, 17], [-19.8, 27], [-19.8, 38], [-19.2, 48], [-18.8, 54]]), RS([4.8, 4.7, 4.4, 4.0, 3.8, 3.7]));
const A_HAND_L = tube(MA([[-18.7, 55], [-18.4, 60.5], [-18.0, 66]]), RS([3.3, 3.5, 2.9]));
// bras droit, vers B : coude un peu sorti, l'avant-bras file vers les mains jointes
const A_ARM_R_PTS = [[15.8, 10], [19.4, 17], [22.4, 25], [27.0, 31], [32.0, 36], [36.6, 40]];
const A_ARM_R_R = [4.8, 4.7, 4.5, 4.2, 3.9, 3.6];
const A_ARM_R = tube(MA(A_ARM_R_PTS), RS(A_ARM_R_R));

// B : cheveux courts, barbe courte, pull vert forêt, pantalon sombre
const B_HEAD = [
  [-6.4, -6.4], [-7.8, -10.2], [-8.4, -14.4], [-8.0, -18.8], [-6.4, -22.6], [-3.8, -25.0], [-0.4, -25.9], [3.0, -25.4],
  [5.9, -23.4], [7.8, -19.9], [8.6, -15.4], [8.3, -10.9], [7.0, -6.8], [4.6, -5.0], [0.6, -4.5], [-3.6, -5.0],
];
const B_HAIRLINE = [[-8.6, -11.2], [-7.4, -10.0], [-6.0, -7.8], [-3.2, -6.4], [0.4, -6.0], [3.8, -6.6], [6.6, -8.2], [7.9, -10.6], [9.0, -11.6]];
const B_NECK = [[-6.4, -8], [-6.0, -3.6], [-6.8, -0.5], [7.0, -0.5], [6.4, -3.6], [6.8, -8.2]];
const B_EAR = (k) => [[7.8 * k, -16.8], [9.5 * k, -16.8], [10.6 * k, -14.8], [10.5 * k, -11.8], [9.6 * k, -9.4], [8.0 * k, -8.6]];
const B_BEARD = (k) => [[6.5 * k, -9.2], [7.5 * k, -7.4], [7.4 * k, -5.2], [6.6 * k, -3.8], [6.0 * k, -5.4], [6.0 * k, -7.6]];
const B_TORSO = [
  [-6.4, -1.2], [-11.0, 0.6], [-15.6, 2.8], [-19.2, 5.0], [-21.4, 8.0], [-22.0, 12.0], [-21.4, 17], [-20.6, 24],
  [-19.8, 34], [-19.6, 46], [-20.0, 56], [-20.4, 62.5, 1], [-10, 63.4], [0, 63.6], [10, 63.4], [20.4, 62.5, 1],
  [20.0, 56], [19.6, 46], [19.8, 34], [20.6, 24], [21.4, 17], [22.0, 12.0], [21.4, 8.0], [19.2, 5.0], [15.6, 2.8],
  [11.0, 0.6], [6.4, -1.2], [0, -0.8],
];
const B_LEGS = [
  [-19.6, 58], [-20.0, 72], [-19.2, 92], [-17.8, 116], [-1.2, 116], [-0.7, 78], [0.7, 78], [1.2, 116],
  [17.8, 116], [19.2, 92], [20.0, 72], [19.6, 58],
];
const B_ARM_R = tube(MB([[18.2, 11], [21.6, 19], [22.8, 30], [22.6, 42], [22.0, 53], [21.6, 60]]), RS([5.4, 5.3, 4.9, 4.4, 4.1, 3.9]));
const B_HAND_R = tube(MB([[21.5, 61], [21.2, 67], [20.8, 74]]), RS([3.6, 3.8, 3.2]));
const B_ARM_L_PTS = [[-18.2, 11], [-21.8, 19.5], [-24.8, 29], [-28.6, 37], [-33.2, 44.5], [-37.4, 51]];
const B_ARM_L_R = [5.4, 5.3, 4.9, 4.4, 4.1, 3.8];
const B_ARM_L = tube(MB(B_ARM_L_PTS), RS(B_ARM_L_R));

// bord d'un membre (côté +1 ou -1 de son axe), pour les liserés
function edge(c, r, side) {
  const n = c.length;
  return c.map((p, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
    const [tx, ty] = norm([b[0] - a[0], b[1] - a[1]]);
    return [p[0] - side * ty * r[i] * 0.92, p[1] + side * tx * r[i] * 0.92];
  });
}

function couple() {
  const id = (n) => `a2-seuil-c-${n}`;
  const PA = (x, y) => pt(mA([x, y])), PB = (x, y) => pt(mB([x, y]));
  const EA = (x, y, rx, ry, a) => { const [cx, cy] = mA([x, y]); return `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx * S)}" ry="${f1(ry * S)}" ${a}/>`; };
  const EB = (x, y, rx, ry, a) => { const [cx, cy] = mB([x, y]); return `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx * S)}" ry="${f1(ry * S)}" ${a}/>`; };
  // la tête de A s'incline un peu vers B ; celle de B à peine vers A
  const tiltA = `rotate(5 ${PA(0, -3).replace(',', ' ')})`;
  const tiltB = `rotate(-3 ${PB(0, -4).replace(',', ' ')})`;
  const hairA = smooth(MA(A_HAIR)), bunA = smooth(MA(A_BUN)), torsoA = smooth(MA(A_TORSO)), legsA = smooth(MA(A_LEGS));
  const headB = smooth(MB(B_HEAD)), torsoB = smooth(MB(B_TORSO)), legsB = smooth(MB(B_LEGS)), neckB = smooth(MB(B_NECK));
  const nuqueB = smooth(MB([...B_HAIRLINE, [9, -2], [-8.6, -2]]));
  const armRA = MA(A_ARM_R_PTS), armLB = MB(B_ARM_L_PTS);
  let s = `<defs>
    <clipPath id="${id('ca-chev')}"><path d="${hairA}"/></clipPath>
    <clipPath id="${id('ca-chignon')}"><path d="${bunA}"/></clipPath>
    <clipPath id="${id('ca-torse')}"><path d="${torsoA}"/></clipPath>
    <clipPath id="${id('ca-bras-d')}"><path d="${A_ARM_R}"/></clipPath>
    <clipPath id="${id('ca-bras-g')}"><path d="${A_ARM_L}"/></clipPath>
    <clipPath id="${id('ca-jambes')}"><path d="${legsA}"/></clipPath>
    <clipPath id="${id('cb-tete')}"><path d="${headB}"/></clipPath>
    <clipPath id="${id('cb-torse')}"><path d="${torsoB}"/></clipPath>
    <clipPath id="${id('cb-bras-g')}"><path d="${B_ARM_L}"/></clipPath>
    <clipPath id="${id('cb-bras-d')}"><path d="${B_ARM_R}"/></clipPath>
    <clipPath id="${id('cb-cou')}"><path d="${neckB}"/></clipPath>
    <clipPath id="${id('cb-jambes')}"><path d="${legsB}"/></clipPath>
    ${grad(id('ga-gilet'), mA([-21, 0]), mA([21, 0]), [[0, '#5a2c22'], [0.35, '#733a2a'], [0.72, '#8c4833'], [1, '#ad5d42']])}
    ${grad(id('ga-gilet-v'), mA([0, -1]), mA([0, 56]), [[0, '#2b1714', 0], [0.55, '#2b1714', 0.1], [1, '#2b1714', 0.35]])}
    ${grad(id('ga-manche'), mA([16, 0]), mA([40, 30]), [[0, '#6c3426'], [0.6, '#86432f'], [1, '#9d5139']])}
    ${grad(id('ga-chev'), mA([-8, -20]), mA([8, -8]), [[0, '#160e0b'], [0.55, '#25180f'], [1, '#3a2619']])}
    ${grad(id('ga-jambe'), mA([-18, 0]), mA([18, 0]), [[0, '#8a7f6b'], [0.55, '#a1957e'], [1, '#c7b798']])}
    ${radial(id('ga-froid'), mA([-2, 16]), 15 * S, [[0, '#a07b78', 0.3], [1, '#a07b78', 0]])}
    ${grad(id('gb-pull'), mB([-24, 0]), mB([24, 0]), [[0, '#46644f'], [0.22, '#324a3a'], [0.6, '#25382d'], [1, '#1c2a22']])}
    ${grad(id('gb-pull-v'), mB([0, -1]), mB([0, 63]), [[0, '#101813', 0], [0.55, '#101813', 0.1], [1, '#101813', 0.32]])}
    ${grad(id('gb-manche'), mB([-18, 0]), mB([-40, 30]), [[0, '#2b4234'], [0.6, '#33503f'], [1, '#3d5c49']])}
    ${grad(id('gb-chev'), mB([-8, -20]), mB([9, -10]), [[0, '#6a4734'], [0.4, '#4a3226'], [1, '#2f2018']])}
    ${grad(id('gb-cou'), mB([-7, 0]), mB([7, 0]), [[0, '#dcac8e'], [0.35, '#c4927a'], [1, '#a4776a']])}
    ${grad(id('gb-jambe'), mB([-20, 0]), mB([20, 0]), [[0, '#3c3633'], [0.4, '#2d2a28'], [1, '#221f1e']])}
    ${radial(id('gb-froid'), mB([2, 18]), 17 * S, [[0, '#6f8a88', 0.26], [1, '#6f8a88', 0]])}
    ${blurF(id('f2'), 2)}${blurF(id('f4'), 4)}${blurF(id('f8'), 8)}${blurF(id('f14'), 14)}
  </defs>`;

  /* ----- A ----- */
  // jambes (pantalon crème), sous le gilet
  s += `<path d="${legsA}" fill="url(#${id('ga-jambe')})"/>`;
  s += `<g clip-path="url(#${id('ca-jambes')})" fill="none">`;
  s += `<path d="M${PA(-0.8, 64)} C${PA(-1, 80)} ${PA(-1.2, 92)} ${PA(-1.4, 104)}" stroke="#5f5546" stroke-width="18" opacity=".55" filter="url(#${id('f8')})"/>`;
  s += `<path d="M${PA(17.6, 52)} C${PA(18.2, 68)} ${PA(17.8, 86)} ${PA(16.8, 104)}" stroke="#f1dfbd" stroke-width="12" opacity=".6" filter="url(#${id('f4')})"/>`;
  s += '</g>';
  // bras gauche (extérieur), qui pend le long du corps, et sa main
  s += `<path d="${A_HAND_L}" fill="#74492f"/>`;
  s += `<path d="${A_ARM_L}" fill="#743a2a"/>`;
  s += `<g clip-path="url(#${id('ca-bras-g')})" fill="none">`;
  s += `<path d="M${PA(-21.5, 12)} C${PA(-23, 26)} ${PA(-23, 40)} ${PA(-21.5, 54)}" stroke="#4a2419" stroke-width="20" opacity=".5" filter="url(#${id('f8')})"/>`;
  s += `<path d="M${PA(-19.6, 50)} L${PA(-19.2, 55)}" stroke="#5a2c20" stroke-width="${f1(S * 8)}" opacity=".45"/>`;
  s += '</g>';
  // bras droit (vers B), dans la manche du gilet ; il passe sous l'épaule
  s += `<path d="${A_ARM_R}" fill="url(#${id('ga-manche')})"/>`;
  s += `<g clip-path="url(#${id('ca-bras-d')})" fill="none">`;
  s += `<path d="${open(edge(armRA, RS(A_ARM_R_R), 1))}" stroke="#4d2519" stroke-width="16" opacity=".5" filter="url(#${id('f8')})"/>`;
  // pli du coude
  s += `<path d="M${PA(22, 24)} C${PA(23.6, 27)} ${PA(25.4, 28.6)} ${PA(27.6, 29)}" stroke="#4a2318" stroke-width="5" opacity=".55" filter="url(#${id('f2')})"/>`;
  // bord-côte du poignet
  s += `<path d="M${PA(33.2, 36.6)} L${PA(36.8, 40)}" stroke="#6a3324" stroke-width="${f1(S * 7.6)}" opacity=".55"/>`;
  s += '</g>';
  // liseré : la lumière de la chambre sur le dessus de l'avant-bras et du coude
  s += rim(open(edge(armRA, RS(A_ARM_R_R), -1)), id('ca-bras-d'), 22, '#f6ad80', id('f4'), 1);
  s += rim(open(edge(armRA, RS(A_ARM_R_R), -1).slice(1)), id('ca-bras-d'), 5, '#ffd8b0', id('f2'), 0.7);
  // le dos : gilet en maille terre cuite
  s += `<path d="${torsoA}" fill="url(#${id('ga-gilet')})"/>`;
  s += `<g clip-path="url(#${id('ca-torse')})" fill="none" stroke-linecap="round">`;
  s += `<path d="${torsoA}" fill="url(#${id('ga-gilet-v')})" stroke="none"/>`;
  s += `<path d="${torsoA}" fill="url(#${id('ga-froid')})" stroke="none"/>`;
  // omoplates, creux du dos, plis souples de la maille
  s += EA(-8, 12, 6, 7, `fill="#4b2419" opacity=".25" filter="url(#${id('f14')})"`);
  s += EA(8.5, 12, 6, 7, `fill="#4b2419" opacity=".2" filter="url(#${id('f14')})"`);
  s += `<path d="M${PA(0.3, 4)} C${PA(0.6, 18)} ${PA(0.2, 32)} ${PA(0.4, 46)}" stroke="#4d2519" stroke-width="10" opacity=".3" filter="url(#${id('f8')})"/>`;
  s += `<path d="M${PA(-14, 36)} C${PA(-8, 39)} ${PA(-2, 39.6)} ${PA(5, 38.6)}" stroke="#4b2419" stroke-width="12" opacity=".35" filter="url(#${id('f8')})"/>`;
  s += `<path d="M${PA(-10, 44)} C${PA(-8, 48)} ${PA(-8.4, 52)} ${PA(-9.6, 56)}" stroke="#4b2419" stroke-width="10" opacity=".35" filter="url(#${id('f8')})"/>`;
  s += `<path d="M${PA(8, 42)} C${PA(9.2, 47)} ${PA(9, 51)} ${PA(8, 56)}" stroke="#4b2419" stroke-width="10" opacity=".3" filter="url(#${id('f8')})"/>`;
  for (let i = -8; i <= 8; i++) s += `<path d="M${PA(i * 2.2, 2)} L${PA(i * 2.3, 53)}" stroke="#5c2c20" stroke-width="2" opacity=".2"/>`;
  // bord-côte du bas du gilet
  s += `<path d="M${PA(-19, 52.6)} C${PA(-8, 53.8)} ${PA(8, 53.8)} ${PA(19, 52.6)}" stroke="#4f2619" stroke-width="3" opacity=".45"/>`;
  // coutures d'emmanchure (épaules un peu tombantes)
  s += `<path d="M${PA(16.2, 3.4)} C${PA(17.8, 8)} ${PA(17.8, 13)} ${PA(17, 18)}" stroke="#4a2318" stroke-width="5" opacity=".45" filter="url(#${id('f2')})"/>`;
  s += `<path d="M${PA(-16.2, 3.4)} C${PA(-17.8, 8)} ${PA(-17.8, 13)} ${PA(-17, 18)}" stroke="#3e1d14" stroke-width="5" opacity=".45" filter="url(#${id('f2')})"/>`;
  s += '</g>';
  // contre-jour : le gilet s'allume sur l'épaule et le flanc tournés vers la porte
  s += rim(open(MA([[5.4, -1.4], [9.4, 0.6], [13.4, 2.8], [16.6, 4.8], [18.6, 7.6], [19.2, 11.2]])), id('ca-torse'), 24, '#f3a87f', id('f4'), 0.95);
  s += rim(open(MA([[9.4, 0.6], [13.4, 2.8], [16.6, 4.8], [18.6, 7.6]])), id('ca-torse'), 5, '#ffcfa6', id('f2'), 0.7);
  s += rim(open(MA([[17.4, 20], [16.4, 27], [15.8, 34], [16.4, 41], [17.6, 48]])), id('ca-torse'), 12, '#d0805f', id('f4'), 0.55);
  s += rim(open(MA([[-16.6, 4.8], [-13.4, 2.8], [-9.4, 0.6], [-5.4, -1.4]])), id('ca-torse'), 8, '#c07a5e', id('f4'), 0.45);
  // la nuque, sous le chignon
  s += `<path d="${smooth(MA(A_NECK))}" fill="#83563d"/>`;
  s += `<path d="M${PA(-3.8, -1.6)} C${PA(-1.4, -2.2)} ${PA(1.6, -2.2)} ${PA(4.4, -1.6)}" stroke="#a46d4d" stroke-width="5" fill="none" opacity=".5" filter="url(#${id('f2')})"/>`;
  s += `<path d="M${PA(4.6, -5)} C${PA(4.9, -3)} ${PA(5.1, -1.4)} ${PA(5.6, -0.4)}" stroke="#eaa97c" stroke-width="6" fill="none" opacity=".8" filter="url(#${id('f2')})"/>`;
  // encolure : le haut crème sous le gilet, puis le col côtelé du gilet
  s += `<path d="M${PA(-5.2, -1.6)} C${PA(-2, -0.5)} ${PA(2, -0.5)} ${PA(5.4, -1.6)}" stroke="#c9b99e" stroke-width="${f1(S * 1.1)}" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M${PA(-6.4, -0.2)} C${PA(-2.4, 1.3)} ${PA(2.4, 1.3)} ${PA(6.6, -0.2)}" stroke="#7a3c2b" stroke-width="${f1(S * 2.3)}" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M${PA(2.6, 0.7)} C${PA(4.4, 0.5)} ${PA(5.6, 0.2)} ${PA(6.6, -0.2)}" stroke="#eea47c" stroke-width="5" fill="none" opacity=".7" filter="url(#${id('f2')})"/>`;
  // la tête : cheveux tirés vers le chignon bas
  s += `<g transform="${tiltA}">`;
  // lobes d'oreilles qui dépassent à peine des cheveux
  s += EA(8.0, -8.4, 0.9, 1.4, 'fill="#b5754f"');
  s += EA(-7.6, -8.2, 0.8, 1.3, 'fill="#7a4e38"');
  s += `<path d="${hairA}" fill="url(#${id('ga-chev')})"/>`;
  s += `<g clip-path="url(#${id('ca-chev')})" fill="none" stroke-linecap="round">`;
  // reflet sur la calotte, mèches qui convergent vers le chignon
  s += `<path d="M${PA(-6.5, -18.4)} C${PA(-3, -23.4)} ${PA(3.6, -23.6)} ${PA(7.6, -18.6)}" stroke="#6a4934" stroke-width="16" opacity=".6" filter="url(#${id('f4')})"/>`;
  s += `<path d="M${PA(3.4, -22)} C${PA(6.4, -18)} ${PA(6.4, -12)} ${PA(4.2, -8.6)}" stroke="#7a5238" stroke-width="12" opacity=".55" filter="url(#${id('f4')})"/>`;
  for (const [x0, y0, x1, y1, c, w, o] of [
    [-6.8, -19, -3.4, -9, '#0f0906', 6, 0.5], [-3.2, -23, -1.2, -10, '#0f0906', 5, 0.45], [1.2, -24, 1.4, -10.5, '#4d3425', 4, 0.5],
    [4.8, -22.6, 2.8, -10.2, '#0f0906', 5, 0.45], [7.8, -17, 4.6, -9.4, '#5c3f2c', 5, 0.55], [-7.8, -13, -4.4, -8.6, '#3d2a1f', 4, 0.5],
    [8.4, -12, 5.6, -8.0, '#6e4c36', 4, 0.6],
  ]) s += `<path d="M${PA(x0, y0)} Q${PA((x0 + x1) / 2 + (x0 > 0 ? 1.4 : -1.4), (y0 + y1) / 2)} ${PA(x1, y1)}" stroke="${c}" stroke-width="${w}" opacity="${o}"/>`;
  s += '</g>';
  // liseré de contre-jour sur le bord droit des cheveux (côté porte et fenêtre)
  s += rim(open(MA(A_HAIR.slice(6, 14))), id('ca-chev'), 18, '#cf8d5c', id('f4'), 0.95);
  s += rim(open(MA(A_HAIR.slice(8, 13))), id('ca-chev'), 4, '#f4c491', id('f2'), 0.85);
  // le chignon, bas et lâche
  // ombre du chignon sur la nuque et le col
  s += `<path d="${bunA}" fill="#120a07" opacity=".55" filter="url(#${id('f4')})" transform="translate(0 6)"/>`;
  s += `<path d="${bunA}" fill="#24170f"/>`;
  s += `<g clip-path="url(#${id('ca-chignon')})" fill="none" stroke-linecap="round">`;
  // volume : à peine plus clair dessus, plus sombre dessous
  s += EA(2.0, -8.2, 5.2, 2.4, `fill="#4a3022" opacity=".7" filter="url(#${id('f4')})"`);
  s += EA(0.6, -2.4, 6, 2.0, `fill="#0b0604" opacity=".6" filter="url(#${id('f4')})"`);
  // les torsades du chignon, dans la même matière que les cheveux
  s += `<path d="M${PA(-4.6, -7.4)} C${PA(-1.8, -10.2)} ${PA(3.4, -10.2)} ${PA(6.4, -6.8)}" stroke="#5a3b29" stroke-width="5" opacity=".7"/>`;
  s += `<path d="M${PA(-4.8, -4.6)} C${PA(-1.6, -7.2)} ${PA(2.8, -7.6)} ${PA(6.6, -4.6)}" stroke="#090503" stroke-width="7" opacity=".55"/>`;
  s += `<path d="M${PA(-3.6, -2.8)} C${PA(-0.6, -4.6)} ${PA(3.4, -4.4)} ${PA(5.6, -2.6)}" stroke="#4a3123" stroke-width="5" opacity=".6"/>`;
  s += '</g>';
  // seul le bord tourné vers la porte s'allume
  s += rim(open(MA([[2.4, -10.4], [5.6, -9.0], [7.2, -6.4], [6.8, -3.6]])), id('ca-chignon'), 10, '#c98656', id('f4'), 0.85);
  s += rim(open(MA([[5.6, -9.0], [7.2, -6.4]])), id('ca-chignon'), 3.5, '#f6c792', id('f2'), 0.7);
  // mèches échappées du chignon, sur la nuque et à la tempe, dans la lumière
  s += '<g fill="none" stroke-linecap="round">';
  for (const [d, c, w, o] of [
    [[[5.6, -4.2], [6.6, -2.4], [6.9, -0.2]], '#e4a56f', 1.6, 0.75], [[[4.2, -2.4], [4.6, -0.6], [4.2, 1.0]], '#c98a5a', 1.4, 0.6],
    [[[-3.6, -2.6], [-4.4, -1.0], [-4.0, 0.6]], '#4a3122', 1.6, 0.6], [[[8.1, -10.4], [9.0, -8.6], [9.2, -6.4]], '#ecb27b', 1.4, 0.7],
    [[[6.3, -6.4], [7.8, -5.0], [8.2, -3.0]], '#eab07a', 1.3, 0.6], [[[1.8, -24.4], [4.2, -25.2], [6.8, -24.0]], '#d9a070', 1.2, 0.55],
  ]) s += `<path d="${open(MA(d))}" stroke="${c}" stroke-width="${f1(w * 2)}" opacity="${o}"/>`;
  s += '</g></g>';

  /* ----- B ----- */
  s += `<path d="${legsB}" fill="url(#${id('gb-jambe')})"/>`;
  s += `<g clip-path="url(#${id('cb-jambes')})" fill="none">`;
  s += `<path d="M${PB(-19.6, 62)} C${PB(-20, 80)} ${PB(-19.4, 98)} ${PB(-17.8, 116)}" stroke="#7d695a" stroke-width="10" opacity=".55" filter="url(#${id('f4')})"/>`;
  s += `<path d="M${PB(-0.8, 76)} C${PB(-1, 90)} ${PB(-1.2, 104)} ${PB(-1.3, 116)}" stroke="#121010" stroke-width="16" opacity=".5" filter="url(#${id('f8')})"/>`;
  s += '</g>';
  // bras droit (extérieur) et sa main
  s += `<path d="${B_HAND_R}" fill="#b58470"/>`;
  s += `<path d="${B_ARM_R}" fill="#24362c"/>`;
  s += `<g clip-path="url(#${id('cb-bras-d')})" fill="none">`;
  s += `<path d="M${PB(24, 12)} C${PB(25.5, 28)} ${PB(25.5, 44)} ${PB(24.5, 60)}" stroke="#141f19" stroke-width="22" opacity=".5" filter="url(#${id('f8')})"/>`;
  s += `<path d="M${PB(22.8, 56)} L${PB(22.4, 61)}" stroke="#1c2b23" stroke-width="${f1(S * 8.4)}" opacity=".5"/>`;
  s += '</g>';
  // bras gauche (vers A), sous l'épaule
  s += `<path d="${B_ARM_L}" fill="url(#${id('gb-manche')})"/>`;
  s += `<g clip-path="url(#${id('cb-bras-g')})" fill="none">`;
  s += `<path d="${open(edge(armLB, RS(B_ARM_L_R), -1))}" stroke="#16211b" stroke-width="18" opacity=".55" filter="url(#${id('f8')})"/>`;
  s += `<path d="M${PB(-24, 27)} C${PB(-25.6, 30)} ${PB(-27.4, 31.6)} ${PB(-29.6, 32)}" stroke="#121b16" stroke-width="5" opacity=".55" filter="url(#${id('f2')})"/>`;
  s += `<path d="M${PB(-33.6, 45)} L${PB(-37.4, 51)}" stroke="#1f2f27" stroke-width="${f1(S * 8)}" opacity=".55"/>`;
  s += '</g>';
  s += rim(open(edge(armLB, RS(B_ARM_L_R), 1)), id('cb-bras-g'), 22, '#ccce9a', id('f4'), 1);
  s += rim(open(edge(armLB, RS(B_ARM_L_R), 1).slice(1)), id('cb-bras-g'), 5, '#f4eec6', id('f2'), 0.6);
  // le dos : pull vert forêt
  s += `<path d="${torsoB}" fill="url(#${id('gb-pull')})"/>`;
  s += `<g clip-path="url(#${id('cb-torse')})" fill="none" stroke-linecap="round">`;
  s += `<path d="${torsoB}" fill="url(#${id('gb-pull-v')})" stroke="none"/>`;
  s += `<path d="${torsoB}" fill="url(#${id('gb-froid')})" stroke="none"/>`;
  s += EB(-9, 13, 7, 8, `fill="#121b16" opacity=".28" filter="url(#${id('f14')})"`);
  s += EB(9.5, 13, 7, 8, `fill="#121b16" opacity=".24" filter="url(#${id('f14')})"`);
  s += `<path d="M${PB(0.3, 4)} C${PB(0.6, 20)} ${PB(0.2, 36)} ${PB(0.4, 54)}" stroke="#121b16" stroke-width="12" opacity=".3" filter="url(#${id('f8')})"/>`;
  s += `<path d="M${PB(-16, 44)} C${PB(-8, 47)} ${PB(4, 47.6)} ${PB(14, 45.4)}" stroke="#121b16" stroke-width="12" opacity=".3" filter="url(#${id('f8')})"/>`;
  for (let i = -9; i <= 9; i++) s += `<path d="M${PB(i * 2.3, 2)} L${PB(i * 2.35, 60)}" stroke="#18251e" stroke-width="2" opacity=".2"/>`;
  s += `<path d="M${PB(-21, 59.8)} C${PB(-8, 61)} ${PB(8, 61)} ${PB(21, 59.8)}" stroke="#14201a" stroke-width="3" opacity=".5"/>`;
  s += `<path d="M${PB(-16.4, 3.6)} C${PB(-18.6, 9)} ${PB(-18.8, 15)} ${PB(-18, 21)}" stroke="#101813" stroke-width="5" opacity=".5" filter="url(#${id('f2')})"/>`;
  s += `<path d="M${PB(16.4, 3.6)} C${PB(18.6, 9)} ${PB(18.8, 15)} ${PB(18, 21)}" stroke="#0e1511" stroke-width="5" opacity=".5" filter="url(#${id('f2')})"/>`;
  s += '</g>';
  s += rim(open(MB([[-6.4, -1.2], [-11.0, 0.6], [-15.6, 2.8], [-19.2, 5.0], [-21.4, 8.0], [-22.0, 12.0]])), id('cb-torse'), 24, '#c9cb96', id('f4'), 0.85);
  s += rim(open(MB([[-11.0, 0.6], [-15.6, 2.8], [-19.2, 5.0], [-21.4, 8.0]])), id('cb-torse'), 5, '#eeeac0', id('f2'), 0.55);
  s += rim(open(MB([[-21.4, 17], [-20.6, 24], [-19.8, 34], [-19.6, 46], [-20.0, 56]])), id('cb-torse'), 10, '#8f9b72', id('f4'), 0.5);
  s += rim(open(MB([[6.4, -1.2], [11.0, 0.6], [15.6, 2.8], [19.2, 5.0]])), id('cb-torse'), 8, '#85906a', id('f4'), 0.4);
  // le cou, la nuque dégagée
  s += `<path d="${neckB}" fill="url(#${id('gb-cou')})"/>`;
  s += `<g clip-path="url(#${id('cb-cou')})" fill="none">`;
  s += `<path d="M${PB(0.4, -7)} L${PB(0.4, -0.2)}" stroke="#93685a" stroke-width="9" opacity=".4" filter="url(#${id('f4')})"/>`;
  s += `<path d="M${PB(-6.2, -7.6)} C${PB(-5.8, -4.6)} ${PB(-6.2, -1.6)} ${PB(-6.8, -0.4)}" stroke="#ffd2aa" stroke-width="8" opacity=".75" filter="url(#${id('f2')})"/>`;
  s += '</g>';
  // col ras du cou, côtelé
  s += `<path d="M${PB(-7.0, -0.8)} C${PB(-3, 0.8)} ${PB(3, 0.8)} ${PB(7.2, -0.8)}" stroke="#25392e" stroke-width="${f1(S * 2.2)}" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M${PB(-7.2, -1.1)} C${PB(-5.8, -0.4)} ${PB(-4.2, 0.1)} ${PB(-2.6, 0.4)}" stroke="#cbcc9e" stroke-width="5" fill="none" opacity=".6" filter="url(#${id('f2')})"/>`;
  // la tête
  s += `<g transform="${tiltB}">`;
  // barbe courte qui dépasse au bord de la mâchoire
  for (const k of [-1, 1]) s += `<path d="${smooth(MB(B_BEARD(k)))}" fill="#3a271d"/>`;
  // oreilles : la lumière de la chambre les traverse
  for (const k of [-1, 1]) {
    const e = smooth(MB(B_EAR(k)));
    s += `<path d="${e}" fill="${k < 0 ? '#e0866a' : '#c87a62'}"/>`;
    s += `<path d="${e}" fill="none" stroke="${k < 0 ? '#ffbb8e' : '#f6a57e'}" stroke-width="7" opacity=".9" filter="url(#${id('f2')})"/>`;
  }
  s += `<path d="${headB}" fill="url(#${id('gb-chev')})"/>`;
  s += `<g clip-path="url(#${id('cb-tete')})" fill="none">`;
  // la nuque sous la ligne des cheveux, dégradé court
  s += `<path d="${nuqueB}" fill="#c08f78" stroke="none"/>`;
  s += `<path d="${open(MB(B_HAIRLINE))}" stroke="#5a3d2e" stroke-width="11" opacity=".6" filter="url(#${id('f4')})"/>`;
  // cheveux courts : reflet sur la calotte, bord gauche dans la lumière
  s += `<path d="M${PB(-7, -17.5)} C${PB(-4, -24.5)} ${PB(4, -25.5)} ${PB(8, -18.5)}" stroke="#8a6448" stroke-width="11" opacity=".45" filter="url(#${id('f4')})"/>`;
  s += `<path d="M${PB(-7.6, -19.5)} C${PB(-8.6, -14.5)} ${PB(-8.2, -10.5)} ${PB(-7, -7.5)}" stroke="#d6a070" stroke-width="11" opacity=".75" filter="url(#${id('f4')})"/>`;
  s += '</g>';
  s += rim(open(MB(B_HEAD.slice(0, 7))), id('cb-tete'), 14, '#e9b27f', id('f4'), 0.85);
  s += '</g>';
  return s;
}

/* --------------------------------------------------------------------------
   Calque « mains » : les mains jointes, doigts entrelacés. On voit le dos de
   la main gauche de B (peau claire) ; les doigts de A (peau mate) passent
   entre les siens et se replient sur le dos de sa main ; le pouce de A longe
   le bord de la main de B. Repère : centimètres autour du point de prise.
   -------------------------------------------------------------------------- */
const mG = (p) => [GRIP[0] + S * p[0], GRIP[1] + S * p[1], p[2]];
const MG = (ps) => ps.map(mG);
function mains() {
  const id = (n) => `a2-seuil-m-${n}`;
  const A_MAIN = [[-7.2, -3.6], [-3.6, -4.8], [-0.6, -2.4], [1.2, 1.2], [1.4, 4.8], [0.0, 7.4], [-2.6, 8.0], [-4.8, 6.4], [-6.0, 3.2], [-6.8, -0.2]];
  const B_MAIN = [[0.6, -5.4], [-1.6, -2.4], [-3.4, 0.6], [-4.2, 2.8], [-3.6, 4.8], [-1.6, 6.2], [0.8, 7.1], [3.2, 6.9], [5.0, 4.4], [6.6, 1.2], [7.6, -1.6], [5.2, -3.8], [2.8, -5.2]];
  const A_DOIGTS = [
    [[[-2.2, 6.6], [-2.6, 4.6], [-2.8, 2.8]], 0.95, '#8c5a3d'],
    [[[0.0, 7.4], [-0.4, 5.2], [-0.8, 3.2], [-1.0, 1.8]], 1.0, '#94603f'],
    [[[2.2, 7.8], [1.8, 5.6], [1.4, 3.6], [1.2, 2.2]], 0.98, '#8a573b'],
    [[[4.2, 7.0], [3.8, 5.2], [3.4, 3.8]], 0.85, '#90603f'],
  ];
  const B_DOIGTS = [[-1.2, 7.4], [1.1, 8.0], [3.2, 7.9], [5.0, 6.6]];
  const POUCE_A = [[-5.6, -0.8], [-5.0, 1.6], [-4.4, 3.8], [-3.6, 5.6]];
  let s = `<defs>
    <clipPath id="${id('cb')}"><path d="${smooth(MG(B_MAIN))}"/></clipPath>
    <clipPath id="${id('ca')}"><path d="${smooth(MG(A_MAIN))}"/></clipPath>
    ${grad(id('gb'), mG([6, -5]), mG([-3, 6]), [[0, '#d8aa8e'], [0.5, '#c4937b'], [1, '#b2826c']])}
    ${grad(id('ga'), mG([-7, -4]), mG([1, 7]), [[0, '#6f452f'], [0.6, '#8a593c'], [1, '#9c6646']])}
    ${blurF(id('f1'), 1)}${blurF(id('f2'), 2)}${blurF(id('f3'), 3)}
  </defs>`;
  // main de A, derrière : poignet, talon de la main
  s += `<path d="${smooth(MG(A_MAIN))}" fill="url(#${id('ga')})"/>`;
  s += `<g clip-path="url(#${id('ca')})" fill="none">`;
  s += `<path d="${open(MG([[-6.6, 0], [-5.6, 4], [-3.2, 7.4], [0, 7.6]]))}" stroke="#eaa476" stroke-width="7" opacity=".7" filter="url(#${id('f2')})"/>`;
  s += '</g>';
  // dos de la main de B
  s += `<path d="${smooth(MG(B_MAIN))}" fill="url(#${id('gb')})"/>`;
  s += `<g clip-path="url(#${id('cb')})" fill="none">`;
  s += `<path d="${open(MG([[4.6, -4.2], [3.0, -0.4], [1.6, 3.0], [0.8, 6.2]]))}" stroke="#a47360" stroke-width="3" opacity=".35" filter="url(#${id('f2')})"/>`;
  s += `<path d="${open(MG([[6.4, -2.4], [5.2, 1.0], [4.0, 4.4], [3.4, 6.8]]))}" stroke="#a47360" stroke-width="3" opacity=".3" filter="url(#${id('f2')})"/>`;
  s += `<path d="${open(MG([[-3.8, 3.4], [-2.0, 5.8], [1.0, 7.2], [3.6, 6.8], [5.2, 4.2]]))}" stroke="#ffd4ae" stroke-width="6" opacity=".65" filter="url(#${id('f2')})"/>`;
  s += `<path d="${open(MG([[5.4, 3.8], [6.8, 0.8], [7.6, -1.8]]))}" stroke="#ffd9b6" stroke-width="5" opacity=".6" filter="url(#${id('f2')})"/>`;
  s += '</g>';
  // les doigts de B qui partent vers l'avant, entre ceux de A
  for (const [x, y] of B_DOIGTS) s += `<path d="${tube(MG([[x, y - 0.6], [x - 0.3, y + 0.6]]), RS([0.95, 0.85]))}" fill="#d29e84"/>`;
  // les doigts de A, repliés sur le dos de la main de B
  for (const [c, r, col] of A_DOIGTS) {
    const d = tube(MG(c), RS(c.map((_, i) => r * (1 - 0.06 * i))));
    s += `<path d="${d}" fill="#3a251c" opacity=".45" filter="url(#${id('f2')})" transform="translate(2 3)"/>`;
    s += `<path d="${d}" fill="${col}"/>`;
    s += `<path d="${open(MG(c.slice(0, -1)))}" stroke="#c88d65" stroke-width="2.6" fill="none" opacity=".5" transform="translate(-2 -1)"/>`;
    // ongle, au bout du doigt
    const e = mG(c[c.length - 1]), q = mG(c[c.length - 2]);
    const a = Math.atan2(e[1] - q[1], e[0] - q[0]);
    s += `<ellipse cx="${f1(e[0] - Math.cos(a) * 2.5)}" cy="${f1(e[1] - Math.sin(a) * 2.5)}" rx="${f1(r * S * 0.5)}" ry="${f1(r * S * 0.38)}" transform="rotate(${f1((a * 180) / Math.PI)} ${f1(e[0] - Math.cos(a) * 2.5)} ${f1(e[1] - Math.sin(a) * 2.5)})" fill="#d8a487" opacity=".65"/>`;
  }
  // pouce de A le long du bord de la main de B
  s += `<path d="${tube(MG(POUCE_A), RS([1.05, 1.08, 1.0, 0.88]))}" fill="#9c6646"/>`;
  s += `<path d="${open(MG(POUCE_A))}" stroke="#eca879" stroke-width="3" fill="none" opacity=".6" transform="translate(-3 0)"/>`;
  return s;
}

/* --------------------------------------------------------------------------
   Lumière procédurale : rais du soleil (calculés une fois, très flous),
   poussière qui danse dedans, éclat de la fenêtre
   -------------------------------------------------------------------------- */
const FBOX = [440, -140, 1040, 1360];
let BEAMS = null;
function beams() {
  if (BEAMS) return BEAMS;
  const k = 1 / 4;
  const c = document.createElement('canvas');
  c.width = FBOX[2] * k; c.height = FBOX[3] * k;
  const x = c.getContext('2d');
  x.scale(k, k);
  x.translate(-FBOX[0], -FBOX[1]);
  for (const [za, zb, ya, yb] of PANES) {
    const corners = [[ya, za], [ya, zb], [yb, zb], [yb, za]];
    const pts = [];
    for (const [Y, Z] of corners) {
      const T = landT(Y, Z);
      for (let i = 0; i <= 8; i++) {
        const t = (T * i) / 8;
        pts.push(pr(XL + SUN[0] * t, Y + SUN[1] * t, Z + SUN[2] * t));
      }
    }
    const h = convexHull(pts);
    const a = pr(XL, (ya + yb) / 2, (za + zb) / 2);
    const L = landT((ya + yb) / 2, (za + zb) / 2);
    const b = pr(XL + SUN[0] * L, (ya + yb) / 2 + SUN[1] * L, (za + zb) / 2 + SUN[2] * L);
    const gr = x.createLinearGradient(a[0], a[1], b[0], b[1]);
    gr.addColorStop(0, 'rgba(255,236,200,0.5)');
    gr.addColorStop(0.35, 'rgba(255,226,180,0.32)');
    gr.addColorStop(1, 'rgba(255,214,160,0.12)');
    x.fillStyle = gr;
    x.beginPath();
    h.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
    x.closePath();
    x.fill();
  }
  // adoucit en repassant par une résolution plus basse, deux fois
  const soften = (src) => {
    const d = document.createElement('canvas');
    d.width = Math.max(1, Math.round(src.width / 2)); d.height = Math.max(1, Math.round(src.height / 2));
    const dx = d.getContext('2d');
    dx.imageSmoothingQuality = 'high';
    dx.drawImage(src, 0, 0, d.width, d.height);
    return d;
  };
  return (BEAMS = soften(soften(c)));
}

// Poussière : des grains pris dans les rais, qui dérivent lentement
const DUST = (() => {
  const r = rng(29);
  return Array.from({ length: 140 }, () => {
    const pn = PANES[Math.floor(r() * PANES.length)];
    return { Y: lerp(pn[2], pn[3], r()), Z: lerp(pn[0], pn[1], r()), u: r(), sp: 0.004 + r() * 0.008, ph: r() * TAU, s: 0.8 + r() * 1.6, big: r() < 0.08 };
  });
})();
function dust(c, T, k) {
  c.globalCompositeOperation = 'screen';
  for (const d of DUST) {
    const L = landT(d.Y, d.Z);
    const u = (d.u + T * d.sp) % 1;
    const t = (0.08 + 0.84 * u) * L;
    const p = pr(XL + SUN[0] * t, d.Y + SUN[1] * t + 3 * Math.sin(T * 0.4 + d.ph), d.Z + SUN[2] * t + 4 * Math.sin(T * 0.31 + d.ph * 1.7));
    const tw = 0.5 + 0.5 * Math.sin(T * (0.9 + d.sp * 70) + d.ph * 3);
    const fade = Math.min(1, u * 6, (1 - u) * 4);
    const a = 0.7 * tw * fade * k;
    if (a < 0.03) continue;
    const rr = d.big ? 4.5 : d.s * 1.5;
    const g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr * 2);
    g.addColorStop(0, `rgba(255,244,214,${a * (d.big ? 0.35 : 1)})`);
    g.addColorStop(1, 'rgba(255,244,214,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(p[0], p[1], rr * 2, 0, TAU);
    c.fill();
  }
}

/* --------------------------------------------------------------------------
   La porte, posée en perspective : chaque bande verticale du vantail est
   mise à l'échelle de sa profondeur (les verticales restent verticales)
   -------------------------------------------------------------------------- */
// Angle du vantail : son bord libre balaie l'écran à vitesse régulière
const edgeX = (phi) => leafCol(0, phi)[0];
function phiOf(door) {
  const target = lerp(edgeX(PHI0), edgeX(PHI1), clamp(door));
  let a = PHI1, b = PHI0;
  for (let i = 0; i < 28; i++) { const m = (a + b) / 2; if (edgeX(m) > target) b = m; else a = m; }
  return (a + b) / 2;
}
function leafCol(u, phi) {
  const w = DW - u;
  const X = HINGE[0] - w * Math.cos(phi), Z = HINGE[1] + w * Math.sin(phi);
  const b = pr(X, 0, Z), t = pr(X, DHH, Z);
  return [b[0], t[1], b[1], X, Z];
}
function drawDoor(g, phi) {
  const a = leafCol(0, phi), b = leafCol(DW, phi);
  if (b[0] - a[0] < 1.5) return null; // vu par la tranche : caché derrière le chambranle
  const N = 44;
  for (let i = 0; i < N; i++) {
    const u0 = (DW * i) / N, u1 = (DW * (i + 1)) / N;
    const c0 = leafCol(u0, phi), c1 = leafCol(u1, phi), m = leafCol((u0 + u1) / 2, phi);
    const sx = (c1[0] - c0[0]) / (DK * (u1 - u0));
    if (sx <= 0) continue;
    const top = Math.min(c0[1], c1[1]), bot = Math.max(c0[2], c1[2]);
    const sy = (bot - top) / (DK * DHH);
    const tf = { x: c0[0] - sx * (DB[0] + DK * u0), y: top - sy * DB[1], sx, sy };
    // découpe au trapèze exact de la bande (le haut et le bas fuient)
    const qd = [[c0[0] - 0.6, c0[1]], [c1[0] + 0.6, c1[1]], [c1[0] + 0.6, c1[2]], [c0[0] - 0.6, c0[2]]]
      .map(([X, Y]) => [(X - tf.x) / sx, (Y - tf.y) / sy]);
    g.img('porte', {
      par: 1.08,
      tf,
      clip: (c) => { c.beginPath(); qd.forEach((q, j) => (j ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); },
    });
  }
  return [[a[0], a[1]], [b[0], b[1]], [b[0], b[2]], [a[0], a[2]]];
}

/* --------------------------------------------------------------------------
   Le décor
   -------------------------------------------------------------------------- */
const DEF = { light: 0, door: 0, couple: 1, squeeze: 0 };

export default {
  id: 'a2-seuil',
  bg: '#1d1a17',
  home: { x: 960, y: 540, z: 1 },
  // on ne pixellise que ce que les caméras peuvent montrer
  region: { wide: [40, -10, 1840, 1090], portrait: [430, -130, 1070, 1350] },
  layers: {
    fond: { box: FBOX, svg: chambre(true), filters: ['paint'], res: 1.6 },
    ombre: { box: FBOX, svg: chambre(false), filters: ['paint'], res: 1.6 },
    porte: { box: [DB[0], DB[1], DK * DW, DK * DHH], svg: porte(), filters: ['paint', 'soft'], res: 2.6 },
    cadre: { box: [-240, -140, 2400, 1360], svg: cadre(), filters: ['paint', 'b3'], par: 1.08 },
    mains: { box: [884, 696, 160, 150], svg: mains(), filters: ['paint', 'b3'], par: 1.3, res: 1.5 },
    couple: { box: [300, -60, 1400, 1280], svg: couple(), filters: ['paint', 'b10'], par: 1.3 },
  },

  render(g, p, T) {
    const q = { ...DEF, ...p };
    const light = clamp(q.light), sunK = 1 - light;
    const phi = phiOf(q.door);
    const shut = 1 - (phi - PHI1) / (PHI0 - PHI1); // 0 grande ouverte → 1 close

    // La chambre : au soleil, puis la lumière s'en va
    g.img('fond');
    if (light > 0) g.img('ombre', { alpha: light });

    // Rais du soleil, poussière, éclat de la fenêtre
    if (sunK > 0.01) {
      g.fx(1, (c) => {
        c.globalCompositeOperation = 'screen';
        c.imageSmoothingQuality = 'high';
        c.globalAlpha = sunK * (0.22 + 0.06 * Math.sin(T * 0.47));
        c.drawImage(beams(), FBOX[0], FBOX[1], FBOX[2], FBOX[3]);
        c.globalAlpha = 1;
        dust(c, T, sunK);
        const w = pr(XL - 4, 150, 360);
        const gr = c.createRadialGradient(w[0], w[1], 10, w[0], w[1], 260);
        gr.addColorStop(0, `rgba(255,236,200,${0.1 * sunK})`);
        gr.addColorStop(1, 'rgba(255,240,210,0)');
        c.fillStyle = gr;
        c.fillRect(w[0] - 260, w[1] - 260, 520, 520);
      });
    }

    // La porte, quand elle se referme
    const leaf = drawDoor(g, phi);
    if (leaf) {
      g.fx(1.08, (c) => {
        // elle se détourne de la chambre : de plus en plus dans la pénombre du couloir
        c.beginPath();
        leaf.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
        c.closePath();
        c.clip();
        c.globalCompositeOperation = 'multiply';
        const k = clamp(shut);
        const gr = c.createLinearGradient(leaf[0][0], 0, leaf[1][0], 0);
        gr.addColorStop(0, `rgb(${f1(lerp(240, 214, k))},${f1(lerp(228, 204, k))},${f1(lerp(208, 188, k))})`);
        gr.addColorStop(0.55, `rgb(${f1(lerp(232, 204, k))},${f1(lerp(220, 194, k))},${f1(lerp(200, 180, k))})`);
        gr.addColorStop(1, `rgb(${f1(lerp(220, 176, k))},${f1(lerp(208, 166, k))},${f1(lerp(190, 154, k))})`);
        c.fillStyle = gr;
        c.fillRect(0, -200, 2000, 1500);
      });
    }

    // Le couloir et le chambranle
    g.img('cadre');
    if (leaf && shut > 0.6) {
      // porte presque close : un filet de jour reste côté serrure
      g.fx(1.08, (c) => {
        const x0 = pr(XO0, 0, ZE)[0], x1 = leafCol(0, phi)[0];
        if (x1 <= x0) return;
        const yt = pr(XO0, HO, ZE)[1], yb = pr(XO0, 0, ZE)[1];
        const a = clamp((shut - 0.6) / 0.4) * (0.95 - 0.35 * light);
        // la fente laisse voir la chambre éteinte : on la réchauffe d'abord
        c.globalCompositeOperation = 'multiply';
        c.fillStyle = `rgba(255,214,170,${f1(a * 1000) / 1000})`;
        c.fillRect(x0 - 2, yt, x1 - x0 + 4, yb - yt);
        c.globalCompositeOperation = 'screen';
        for (const [w, k] of [[110, 0.22], [34, 0.45], [9, 0.95]]) {
          const xm = (x0 + x1) / 2;
          const gr = c.createLinearGradient(xm - w, 0, xm + w, 0);
          gr.addColorStop(0, 'rgba(255,212,158,0)');
          gr.addColorStop(0.5, `rgba(255,212,158,${a * k})`);
          gr.addColorStop(1, 'rgba(255,212,158,0)');
          c.fillStyle = gr;
          c.fillRect(xm - w, yt, 2 * w, yb - yt);
        }
      });
    }
    if (shut > 0) {
      // la porte se ferme : la lumière de la chambre ne déborde plus sur les
      // murs du couloir (la baie elle-même garde sa valeur)
      g.fx(1.08, (c) => {
        c.globalCompositeOperation = 'multiply';
        const k = 0.42 * clamp(shut);
        const x0 = pr(XO0 - 7, 0, ZH)[0], x1 = pr(XO1 + 7, 0, ZH)[0];
        const gr = c.createLinearGradient(x0 - 260, 0, x1 + 260, 0);
        const L = x1 - x0 + 520;
        const col = (a) => `rgba(66,58,52,${f1(a * 1000) / 1000})`;
        gr.addColorStop(0, col(k));
        gr.addColorStop(200 / L, col(k * 0.8));
        gr.addColorStop(250 / L, col(0));
        gr.addColorStop(1 - 250 / L, col(0));
        gr.addColorStop(1 - 200 / L, col(k * 0.8));
        gr.addColorStop(1, col(k));
        c.fillStyle = gr;
        c.fillRect(-240, -140, 2400, 1360);
      });
    }

    // Le couple
    if (q.couple > 0) {
      const brA = Math.sin((T * TAU) / 4.3), brB = Math.sin((T * TAU) / 5.1 + 1.3);
      const sq = clamp(q.squeeze);
      g.img('mains', { tf: { ox: GRIP[0], oy: GRIP[1], rot: -0.06 * sq, sx: 1 - 0.05 * sq, sy: 1 - 0.02 * sq, y: -3 * sq + 0.8 * (brA + brB) } });
      g.img('couple', {
        tf: { ox: A0[0], oy: 1200, sy: 1 + 0.0028 * brA, x: 1.6 * sq },
        clip: (c) => { c.beginPath(); c.rect(240, -100, 721, 1400); },
      });
      g.img('couple', {
        tf: { ox: B0[0], oy: 1200, sy: 1 + 0.0026 * brB, x: -1.6 * sq },
        clip: (c) => { c.beginPath(); c.rect(961, -100, 900, 1400); },
      });
    }

    // Un peu de densité dans les valeurs, comme une pellicule
    g.screen((c) => {
      c.globalCompositeOperation = 'soft-light';
      c.globalAlpha = 0.3;
      c.drawImage(c.canvas, 0, 0);
    });

    // Étalonnage : ombres froides sur les bords, chaleur au cœur de la baie ;
    // puis la lumière du jour baisse
    g.screen((c, W, H) => {
      c.globalCompositeOperation = 'multiply';
      let gr = c.createLinearGradient(0, 0, W, 0);
      gr.addColorStop(0, 'rgba(78,86,104,0.5)');
      gr.addColorStop(0.3, 'rgba(78,86,104,0)');
      gr.addColorStop(0.7, 'rgba(78,86,104,0)');
      gr.addColorStop(1, 'rgba(78,86,104,0.45)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'soft-light';
      gr = c.createRadialGradient(W * 0.53, H * 0.5, 0, W * 0.53, H * 0.5, W * 0.45);
      gr.addColorStop(0, `rgba(255,206,140,${0.15 * sunK})`);
      gr.addColorStop(1, 'rgba(255,206,140,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      if (light > 0) {
        const d = light;
        c.globalCompositeOperation = 'multiply';
        c.fillStyle = `rgb(${f1(lerp(255, 206, d))},${f1(lerp(255, 199, d))},${f1(lerp(255, 194, d))})`;
        c.fillRect(0, 0, W, H);
      }
    });
  },

  shots: {
    // Très lente poussée vers la chambre ; les mains se serrent
    seuil: {
      dur: 5,
      cam: (t, portrait) => {
        const k = 0.65 * ease.inOut(clamp(t / 5)) + 0.35 * clamp(t / 5);
        return portrait
          ? { x: lerp(962, 964, k), y: lerp(522, 532, k), z: lerp(0.88, 0.93, k) }
          : { x: lerp(958, 962, k), y: lerp(548, 572, k), z: lerp(1.08, 1.13, k) };
      },
      p: (t) => ({ couple: 1, squeeze: seg(t, 1.4, 3.4) }),
    },
    // La chambre seule : la lumière baisse, la porte se referme doucement
    vide: {
      dur: 7,
      cam: (t, portrait) => {
        const k = clamp(t / 7);
        return portrait
          ? { x: lerp(962, 961, k), y: lerp(512, 516, k), z: lerp(1.0, 1.06, k) }
          : { x: lerp(962, 961, k), y: lerp(514, 518, k), z: lerp(1.6, 1.7, k) };
      },
      p: (t) => ({ couple: 0, light: seg(t, 0.2, 6.6), door: seg(t, 3.7, 7.0) }),
    },
  },
};
