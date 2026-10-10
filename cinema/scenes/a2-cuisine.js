/* ==========================================================================
   Décor « a2-cuisine » — Acte 2. La cuisine d'un petit appartement en ville,
   un matin d'automne, en plan large.
   La pièce est construite en mètres puis projetée (perspective à un point de
   fuite) : X de gauche à droite, Y vers le haut (sol = 0), Z depuis le mur du
   fond vers nous. La caméra est à hauteur des yeux du couple assis.
   La fenêtre est sur le mur de gauche : le soleil bas du matin entre en biais,
   traverse la pièce vers la droite et vers nous, et pose sur la table une
   grande tache claire coupée par l'ombre du montant. Le couple (A à gauche,
   B à droite) est assis face à face, de profil, en léger contre-jour ; entre
   eux, deux tasses qui fument, l'enveloppe ouverte et la lettre dépliée. Par
   la porte du fond, la chambre vide et son carton.

   Paramètres (p) :
     reach  0 → 1   B tend lentement la main vers celle de A
   ========================================================================== */
import { rng } from '../kit.js';
import { TAU, clamp, lerp, ease, seg } from '../../film/engine.js';

/* ---------- Outils de tracé ---------- */
const f1 = (v) => +v.toFixed(1);
const xy = (p) => `${f1(p[0])} ${f1(p[1])}`;

// Courbe lisse (Catmull-Rom → Bézier) le long d'une suite de points, de
// l'indice i0 à i1. Un point [x, y, 1] marque un angle vif.
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

// Contour d'un « boudin » (bras, manche, doigt) le long d'un axe, rayons variables, bouts ronds
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

// Dégradés et filtres, en coordonnées du décor
const stops = (s) => s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
const grad = (id, x1, y1, x2, y2, s) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}">${stops(s)}</linearGradient>`;
const radial = (id, cx, cy, r, s, fx = cx, fy = cy) =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fx="${f1(fx)}" fy="${f1(fy)}">${stops(s)}</radialGradient>`;
const blur = (id, s) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
// Touche de brosse : la couleur n'apparaît que par plaques allongées (bruit étiré)
const brosse = (id, fx, fy, seed, gain = 3, cut = 1.25) =>
  `<filter id="${id}" filterUnits="objectBoundingBox" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="3" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${gain} 0 0 0 -${cut}" result="a"/>` +
  `<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>`;

// Filtres partagés par les calques (chaque calque est un SVG à part : on les redéclare)
const FX = [1, 2, 3, 4, 6, 10, 16, 24].map((s) => blur(`a2-cuisine-f${s}`, s)).join('') +
  brosse('a2-cuisine-br1', 0.03, 0.008, 8) + brosse('a2-cuisine-br2', 0.05, 0.012, 21, 3, 1.4) +
  brosse('a2-cuisine-br3', 0.012, 0.03, 5, 3, 1.3) + brosse('a2-cuisine-br4', 0.02, 0.02, 17, 2.6, 1.2);
const F_ = (s) => `filter="url(#a2-cuisine-f${s})"`;

// Liseré de lumière le long d'un bord, gardé à l'intérieur de la forme (clip)
const rim = (d, clip, w, color = '#ffd9a0', core = 0, b = 2) =>
  `<g clip-path="url(#${clip})">` +
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${F_(b)}/>` +
  (core ? `<path d="${d}" fill="none" stroke="#fff1d4" stroke-width="${core}" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>` : '') +
  '</g>';
const stroke = (d, color, w, op = 1, b = 0) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" ${b ? F_(b) : ''}/>`;

/* ---------- Projection ---------- */
const D = 6.5, FOC = 1700, EYE = 1.32, CX = 2.15, VX = 960, VY = 380;
const RW = 4.4, RH = 2.65, NEAR = 4.6; // largeur, hauteur de la pièce ; bord avant (hors cadre)
const kz = (Z) => FOC / (D - Z); // pixels par mètre à la profondeur Z
const pr = (X, Y, Z) => { const k = kz(Z); return [VX + (X - CX) * k, VY - (Y - EYE) * k]; };
const pt = (p) => xy(pr(p[0], p[1], p[2]));
const poly3 = (a, at = '') => (a.length > 2 ? `<polygon points="${a.map(pt).join(' ')}" ${at}/>` : '');
const path3 = (cmds) => cmds.map(([c, ...ps]) => c + ps.map(pt).join(' ')).join(' ');
const quadX = (x, z0, z1, y0, y1) => [[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]];
const quadY = (y, x0, x1, z0, z1) => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];
const quadZ = (z, x0, x1, y0, y1) => [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]];
const box = (x0, x1, y0, y1, z0, z1) =>
  [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
const scr = (a) => a.map((p) => pr(p[0], p[1], p[2]));

// Découpe d'un polygone convexe par un demi-espace f(p) ≥ 0 (Sutherland–Hodgman)
function clip(poly, f) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const fa = f(a), fb = f(b);
    if (fa >= 0) out.push(a);
    if ((fa >= 0) !== (fb >= 0)) {
      const t = fa / (fa - fb);
      out.push(a.map((v, j) => v + (b[j] - v) * t));
    }
  }
  return out;
}
// Enveloppe convexe de points 3D posés dans un plan (axes i, j)
function hull(ps, i, j) {
  const s = [...ps].sort((a, b) => a[i] - b[i] || a[j] - b[j]);
  const cr = (o, a, b) => (a[i] - o[i]) * (b[j] - o[j]) - (a[j] - o[j]) * (b[i] - o[i]);
  const lo = [], hi = [];
  for (const p of s) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of s.reverse()) { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}

/* ---------- Soleil du matin : bas, il entre par la gauche et vient vers nous ---------- */
const SUN = [1, -0.42, 0.5];
const toY = (y) => (p) => { const k = (p[1] - y) / -SUN[1]; return [p[0] + SUN[0] * k, y, p[2] + SUN[2] * k]; };

/* ---------- Fenêtre (mur de gauche, X = 0) : deux battants, trois carreaux chacun ---------- */
const WIN = { z0: 0.5, z1: 2.55, y0: 0.95, y1: 2.35, mz: 1.525, depth: 0.2 };
const W_COLS = [[0.55, 1.5], [1.55, 2.5]];
const W_ROWS = [[0.99, 1.4], [1.44, 1.86], [1.9, 2.31]];
const PANES = [];
for (const [a, b] of W_COLS) for (const [c, d] of W_ROWS) PANES.push(quadX(0, a, b, c, d));
// Pour la lumière, les vitres sont un peu rétrécies : la pénombre élargit l'ombre des petits bois
const PANES_L = PANES.map((q) => {
  const z0 = q[0][2] + 0.02, z1 = q[1][2] - 0.02, y0 = q[0][1] + 0.02, y1 = q[2][1] - 0.02;
  return quadX(0, z0, z1, y0, y1);
});

/* ---------- La table (bois clair), en long vers nous ; les chaises ---------- */
const TAB = { x0: 1.72, x1: 2.58, z0: 1.15, z1: 4.0, y: 0.76, th: 0.045 };
const LEGS = [[TAB.x0 + 0.05, TAB.z0 + 0.06], [TAB.x1 - 0.05, TAB.z0 + 0.06], [TAB.x0 + 0.05, TAB.z1 - 0.07], [TAB.x1 - 0.05, TAB.z1 - 0.07]];
const ZC = 3.0; // profondeur du couple

/* ==========================================================================
   Calque « fond » : la cuisine (murs crème, parquet clair, fenêtre et ville
   du matin, plan de travail, étagères et bocaux, porte de la chambre vide)
   ========================================================================== */
const R = rng(2407);

// Parquet clair : lames qui fuient vers le point de fuite, joints décalés
function plancher() {
  const tones = ['#c79a6b', '#c0915f', '#cda172', '#c39566', '#bb8d5f', '#caa070', '#c49868'];
  const n = 24, bw = RW / n;
  let s = '';
  for (let i = 0; i < n; i++) {
    const x0 = i * bw, x1 = x0 + bw;
    s += poly3(quadY(0, x0, x1, -0.02, NEAR), `fill="${tones[Math.floor(R() * tones.length)]}"`);
    for (let j = 0; j < 3; j++) {
      const z = 0.2 + j * 1.5 + R() * 1.2;
      s += `<path d="${path3([['M', [x0, 0, z]], ['L', [x1, 0, z]]])}" stroke="#8a6440" stroke-opacity=".35" stroke-width="1.2" fill="none"/>`;
    }
  }
  for (let i = 1; i < n; i++) {
    s += `<path d="${path3([['M', [i * bw, 0, 0]], ['L', [i * bw, 0, NEAR]]])}" stroke="#8a6440" stroke-opacity=".42" stroke-width="1.2" fill="none"/>`;
  }
  return s;
}

// La ville, vue à travers la vitre : brume du matin, immeubles en contre-jour, un arbre roux
function vue() {
  const r = rng(61);
  const [ax, ay] = pr(0, WIN.y1, WIN.z1), [bx, by] = pr(0, WIN.y0, WIN.z0);
  const x0 = ax - 40, x1 = bx + 30, y0 = ay - 40, y1 = by + 60;
  let s = `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(x1 - x0)}" height="${f1(y1 - y0)}" fill="url(#a2-cuisine-ciel)"/>`;
  // immeubles d'en face, à contre-jour : silhouettes bleutées dans la brume, toits simples
  const rows = [[300, '#ddd5cb', 0.65], [370, '#cfc5bb', 0.7]];
  for (const [base, col, op] of rows) {
    let x = x0 - 20;
    while (x < x1) {
      const w = 60 + r() * 90, h = 90 + r() * 170, top = base - h;
      s += `<path d="M${f1(x)} ${f1(y1)} L${f1(x)} ${f1(top + 8)} Q${f1(x)} ${f1(top)} ${f1(x + 8)} ${f1(top)} L${f1(x + w - 8)} ${f1(top)} Q${f1(x + w)} ${f1(top)} ${f1(x + w)} ${f1(top + 8)} L${f1(x + w)} ${f1(y1)} Z" fill="${col}" opacity="${op}"/>`;
      // rangées de fenêtres, à peine plus sombres
      for (let yy = top + 22; yy < y1 - 10; yy += 34) {
        for (let xx = x + 12; xx < x + w - 18; xx += 26) s += `<rect x="${f1(xx)}" y="${f1(yy)}" width="12" height="18" fill="#a59a96" opacity="${f1(0.1 + r() * 0.08)}"/>`;
      }
      x += w + 6 + r() * 20;
    }
  }
  // voile de brume dorée vers le soleil (en haut, côté gauche de la vitre)
  s += `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(x1 - x0)}" height="${f1(y1 - y0)}" fill="url(#a2-cuisine-brume)"/>`;
  // un arbre de la rue, roux, traversé de lumière
  // branches fines, feuillage roux en petites touches ; les bords prennent le soleil
  s += `<path d="M96 560 C100 470 104 400 96 300 M100 400 C130 360 160 320 210 270 M98 330 C80 280 70 220 60 150 M150 320 C170 250 200 200 250 160" stroke="#7a6152" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/>`;
  const tree = [[70, 140, 70], [200, 230, 60], [250, 130, 55], [130, 260, 50], [40, 300, 45]];
  for (const [cx, cy, rr] of tree) {
    for (let i = 0; i < 46; i++) {
      const a = r() * TAU, d = Math.sqrt(r()) * rr, s2 = 4 + r() * 7;
      const c = ['#d49a52', '#e6b465', '#c27f3e', '#eec27a', '#b8743a'][Math.floor(r() * 5)];
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8;
      s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(s2)}" ry="${f1(s2 * 0.6)}" transform="rotate(${f1(r() * 180)} ${f1(x)} ${f1(y)})" fill="${c}" opacity="${f1(0.6 + r() * 0.35)}"/>`;
    }
  }
  s += `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(x1 - x0)}" height="${f1(y1 - y0)}" fill="url(#a2-cuisine-brume)" opacity=".3"/>`;
  return s;
}

// Fenêtre : embrasure, cadre crème à contre-jour, petits bois, appui baigné de soleil
function fenetre() {
  const { z0, z1, y0, y1, depth } = WIN, xg = -depth;
  let s = '';
  // embrasure : joue du fond (lumière du ciel), linteau (ombre)
  s += poly3([[0, y0, z0], [xg, y0, z0], [xg, y1, z0], [0, y1, z0]], 'fill="#cdbfa9"');
  s += poly3([[0, y1, z0], [xg, y1, z0], [xg, y1, z1], [0, y1, z1]], 'fill="#a3998b"');
  // la vue, découpée par l'ouverture
  s += `<clipPath id="a2-cuisine-c-vitre">${poly3(quadX(xg + 0.06, z0, z1, y0, y1))}</clipPath>`;
  s += `<g clip-path="url(#a2-cuisine-c-vitre)">${vue()}</g>`;
  // cadre et petits bois (crème, gris dans le contre-jour)
  const fx = xg + 0.06, fw = 0.045;
  const bars = [
    quadX(fx, z0, z1, y1 - fw, y1), quadX(fx, z0, z1, y0, y0 + fw),
    quadX(fx, z0, z0 + fw, y0, y1), quadX(fx, z1 - fw, z1, y0, y1),
    quadX(fx, WIN.mz - 0.03, WIN.mz + 0.03, y0, y1),
  ];
  for (const [a, b] of [[1.4, 1.44], [1.86, 1.9]]) bars.push(quadX(fx, z0, z1, a, b));
  s += bars.map((q) => poly3(q, 'fill="#a69a88"')).join('');
  s += poly3(quadX(fx, WIN.mz - 0.03, WIN.mz - 0.01, y0, y1), 'fill="#d6c9b2" opacity=".8"');
  // appui intérieur : dessus au soleil, chant à l'ombre
  s += poly3([[0, y0, z0 - 0.08], [0.24, y0, z0 - 0.08], [0.24, y0, z1 + 0.08], [0, y0, z1 + 0.08]], 'fill="#f3dfbb"');
  s += poly3(quadX(0.24, z0 - 0.08, z1 + 0.08, y0 - 0.035, y0), 'fill="#b2a690"');
  s += poly3([[0.24, y0 - 0.035, z0 - 0.08], [0.24, y0 - 0.035, z1 + 0.08], [0.02, y0 - 0.2, z1 + 0.08], [0.02, y0 - 0.2, z0 - 0.08]], `fill="#6f665c" opacity=".25" ${F_(6)}`);
  return s;
}

// Plantes vertes sur l'appui, à contre-jour : feuilles sombres, bords qui s'allument
function plantesAppui() {
  const r = rng(73);
  let s = '';
  const pots = [
    { z: 0.82, h: 0.12, w: 0.13, col: '#b56a4c', kind: 'herbe' },
    { z: 1.32, h: 0.15, w: 0.15, col: '#e2d9c8', kind: 'ronde' },
    { z: 1.88, h: 0.11, w: 0.12, col: '#9cab92', kind: 'herbe' },
    { z: 2.3, h: 0.16, w: 0.16, col: '#c27a58', kind: 'retombante' },
  ];
  for (const p of pots) {
    const [cx, cy] = pr(0.12, WIN.y0, p.z), k = kz(p.z);
    const w = p.w * k, h = p.h * k;
    // pot : légèrement évasé, bord roulé
    s += `<path d="M${f1(cx - w * 0.42)} ${f1(cy)} L${f1(cx - w * 0.5)} ${f1(cy - h)} L${f1(cx + w * 0.5)} ${f1(cy - h)} L${f1(cx + w * 0.42)} ${f1(cy)} Z" fill="${p.col}"/>`;
    s += `<rect x="${f1(cx - w * 0.54)}" y="${f1(cy - h - h * 0.14)}" width="${f1(w * 1.08)}" height="${f1(h * 0.18)}" rx="2" fill="${p.col}"/>`;
    s += `<path d="M${f1(cx - w * 0.42)} ${f1(cy)} L${f1(cx - w * 0.5)} ${f1(cy - h)} L${f1(cx - w * 0.2)} ${f1(cy - h)} L${f1(cx - w * 0.16)} ${f1(cy)} Z" fill="#fff2d8" opacity=".3"/>`;
    s += `<path d="M${f1(cx + w * 0.1)} ${f1(cy)} L${f1(cx + w * 0.12)} ${f1(cy - h)} L${f1(cx + w * 0.5)} ${f1(cy - h)} L${f1(cx + w * 0.42)} ${f1(cy)} Z" fill="#3e3a3a" opacity=".22"/>`;
    // feuillage
    const top = cy - h * 1.1;
    const n = p.kind === 'herbe' ? 14 : p.kind === 'ronde' ? 10 : 12;
    for (let i = 0; i < n; i++) {
      let a, L, lw, ox = 0, oy = 0;
      if (p.kind === 'retombante') { a = -Math.PI / 2 + (r() - 0.5) * 3.4; L = (0.12 + r() * 0.2) * k; lw = 0.045 * k; }
      else if (p.kind === 'ronde') { a = -Math.PI / 2 + (r() - 0.5) * 2.4; L = (0.1 + r() * 0.12) * k; lw = 0.06 * k; }
      else { a = -Math.PI / 2 + (r() - 0.5) * 1.5; L = (0.12 + r() * 0.16) * k; lw = 0.028 * k; }
      if (p.kind === 'retombante' && Math.sin(a) > -0.2) { oy = L * 0.6; }
      const ex = cx + ox + Math.cos(a) * L, ey = top + oy + Math.sin(a) * L;
      const nx = -Math.sin(a) * lw, ny = Math.cos(a) * lw;
      const mx = (cx + ex) / 2, my = (top + ey) / 2;
      const d = `M${f1(cx)} ${f1(top)} Q${f1(mx + nx)} ${f1(my + ny)} ${f1(ex)} ${f1(ey)} Q${f1(mx - nx)} ${f1(my - ny)} ${f1(cx)} ${f1(top)} Z`;
      const g = ['#3f5a3c', '#4c6a43', '#35503a', '#58744a'][Math.floor(r() * 4)];
      s += `<path d="${d}" fill="${g}"/>`;
      s += `<path d="M${f1(cx)} ${f1(top)} Q${f1(mx + nx * 0.9)} ${f1(my + ny * 0.9)} ${f1(ex)} ${f1(ey)}" fill="none" stroke="#c9d98a" stroke-width="1.6" opacity=".55"/>`;
    }
  }
  return s;
}

// Petit bocal sans étiquette (sur l'étagère), vu presque de face
function bocal(X, Y, Z, w, h, fill, level, lid) {
  const [cx, cy] = pr(X, Y, Z), k = kz(Z);
  const W = w * k, H = h * k, rr = W * 0.2;
  const body = `M${f1(cx - W / 2)} ${f1(cy - 2)} L${f1(cx - W / 2)} ${f1(cy - H + rr)} Q${f1(cx - W / 2)} ${f1(cy - H)} ${f1(cx - W / 2 + rr)} ${f1(cy - H)} L${f1(cx + W / 2 - rr)} ${f1(cy - H)} Q${f1(cx + W / 2)} ${f1(cy - H)} ${f1(cx + W / 2)} ${f1(cy - H + rr)} L${f1(cx + W / 2)} ${f1(cy - 2)} Q${f1(cx)} ${f1(cy + 3)} ${f1(cx - W / 2)} ${f1(cy - 2)} Z`;
  let s = `<path d="${body}" fill="#e8e2d6" opacity=".5"/>`;
  const lv = cy - H * level;
  s += `<path d="M${f1(cx - W / 2 + 2)} ${f1(lv)} L${f1(cx + W / 2 - 2)} ${f1(lv)} L${f1(cx + W / 2 - 2)} ${f1(cy - 3)} Q${f1(cx)} ${f1(cy + 1)} ${f1(cx - W / 2 + 2)} ${f1(cy - 3)} Z" fill="${fill}"/>`;
  s += `<rect x="${f1(cx - W / 2 + 2)}" y="${f1(lv)}" width="${f1(W * 0.35)}" height="${f1(cy - lv - 3)}" fill="#fff" opacity=".12"/>`;
  s += `<path d="${body}" fill="none" stroke="#f6f1e6" stroke-width="1.4" opacity=".6"/>`;
  s += `<path d="M${f1(cx - W / 2 + W * 0.16)} ${f1(cy - H + rr)} L${f1(cx - W / 2 + W * 0.16)} ${f1(cy - 6)}" stroke="#fffaf0" stroke-width="${f1(Math.max(1.5, W * 0.08))}" opacity=".55" stroke-linecap="round"/>`;
  s += `<rect x="${f1(cx - W / 2 - 1)}" y="${f1(cy - H - W * 0.18)}" width="${f1(W + 2)}" height="${f1(W * 0.22)}" rx="2" fill="${lid}"/>`;
  return s;
}

// Le coin cuisine : meubles bas vert sauge, plan de travail en chêne, crédence, étagères
function cuisine() {
  const x0 = 0, x1 = 2.98, zf = 0.6, top = 0.92;
  let s = '';
  // crédence : petits carreaux crème
  s += poly3(quadZ(0.002, x0, x1, top, 1.44), 'fill="#cdc1ab"');
  for (let x = 0.1; x < x1; x += 0.1) s += `<path d="${path3([['M', [x, top, 0.003]], ['L', [x, 1.44, 0.003]]])}" stroke="#a89d89" stroke-width="1" opacity=".35" fill="none"/>`;
  for (let y = top + 0.1; y < 1.44; y += 0.1) s += `<path d="${path3([['M', [x0, y, 0.003]], ['L', [x1, y, 0.003]]])}" stroke="#a89d89" stroke-width="1" opacity=".35" fill="none"/>`;
  s += poly3(quadZ(0.004, x0, x1, 1.43, 1.45), 'fill="#d4c9b5"');
  // plan de travail : dessus, chant
  s += poly3(quadY(top, x0, x1, 0, zf + 0.03), 'fill="#c8a477"');
  s += poly3(quadZ(zf + 0.03, x0, x1, top - 0.04, top), 'fill="#a98457"');
  s += `<path d="${path3([['M', [x0, top, zf + 0.03]], ['L', [x1, top, zf + 0.03]]])}" stroke="#e8c999" stroke-width="2" opacity=".7" fill="none"/>`;
  // meubles bas : portes à cadre, boutons ronds, plinthe en retrait
  s += poly3(quadZ(zf, x0, x1, 0.1, top - 0.04), 'fill="#a4a68b"');
  s += poly3(quadZ(zf - 0.04, x0, x1, 0, 0.1), 'fill="#5d5c4f"');
  const nd = 4, dw = x1 / nd;
  for (let i = 0; i < nd; i++) {
    const a = i * dw + 0.012, b = (i + 1) * dw - 0.012;
    s += poly3(quadZ(zf + 0.001, a, b, 0.11, top - 0.055), 'fill="#aaac91" stroke="#7f8169" stroke-width="1.6"');
    s += poly3(quadZ(zf + 0.002, a + 0.06, b - 0.06, 0.18, top - 0.13), 'fill="#9fa286" stroke="#87896f" stroke-width="1.4"');
    s += `<path d="${path3([['M', [a + 0.06, top - 0.13, zf + 0.003]], ['L', [b - 0.06, top - 0.13, zf + 0.003]]])}" stroke="#c7c8ad" stroke-width="1.6" fill="none" opacity=".8"/>`;
    const kx = i % 2 ? a + 0.05 : b - 0.05;
    const [px, py] = pr(kx, top - 0.16, zf + 0.01);
    s += `<circle cx="${f1(px)}" cy="${f1(py)}" r="3.6" fill="#d8cdb3"/><circle cx="${f1(px - 0.8)}" cy="${f1(py - 0.8)}" r="1.4" fill="#fff6e4" opacity=".7"/>`;
  }
  // ombre sous le plan de travail sur le haut des portes
  s += poly3(quadZ(zf + 0.004, x0, x1, top - 0.16, top - 0.04), `fill="#4c4a3e" opacity=".22" ${F_(4)}`);
  // sur le plan de travail : planche à découper, bouilloire, petite plante
  const [bx, by] = pr(0.42, top, 0.05), kb = kz(0.05);
  s += `<path d="M${f1(bx - 0.13 * kb)} ${f1(by)} L${f1(bx - 0.12 * kb)} ${f1(by - 0.34 * kb)} Q${f1(bx)} ${f1(by - 0.42 * kb)} ${f1(bx + 0.12 * kb)} ${f1(by - 0.34 * kb)} L${f1(bx + 0.13 * kb)} ${f1(by)} Z" fill="#c19563"/>`;
  s += `<circle cx="${f1(bx)}" cy="${f1(by - 0.33 * kb)}" r="${f1(0.018 * kb)}" fill="#8d6a46"/>`;
  s += `<path d="M${f1(bx - 0.12 * kb)} ${f1(by - 0.3 * kb)} L${f1(bx - 0.12 * kb)} ${f1(by - 4)}" stroke="#e7c391" stroke-width="2.5" opacity=".6"/>`;
  const [kx, ky] = pr(1.38, top, 0.3), kk = kz(0.3);
  s += `<ellipse cx="${f1(kx + 4)}" cy="${f1(ky)}" rx="${f1(0.11 * kk)}" ry="${f1(0.02 * kk)}" fill="#5a5444" opacity=".3" ${F_(3)}/>`;
  s += `<path d="M${f1(kx - 0.09 * kk)} ${f1(ky)} C${f1(kx - 0.11 * kk)} ${f1(ky - 0.1 * kk)} ${f1(kx - 0.08 * kk)} ${f1(ky - 0.17 * kk)} ${f1(kx - 0.04 * kk)} ${f1(ky - 0.19 * kk)} L${f1(kx + 0.04 * kk)} ${f1(ky - 0.19 * kk)} C${f1(kx + 0.08 * kk)} ${f1(ky - 0.17 * kk)} ${f1(kx + 0.11 * kk)} ${f1(ky - 0.1 * kk)} ${f1(kx + 0.09 * kk)} ${f1(ky)} Z" fill="url(#a2-cuisine-bouilloire)"/>`;
  s += `<path d="M${f1(kx + 0.09 * kk)} ${f1(ky - 0.12 * kk)} L${f1(kx + 0.17 * kk)} ${f1(ky - 0.17 * kk)}" stroke="#d8d0bf" stroke-width="${f1(0.022 * kk)}" stroke-linecap="round"/>`;
  s += `<path d="M${f1(kx - 0.05 * kk)} ${f1(ky - 0.2 * kk)} Q${f1(kx)} ${f1(ky - 0.27 * kk)} ${f1(kx + 0.05 * kk)} ${f1(ky - 0.2 * kk)}" stroke="#3d3833" stroke-width="${f1(0.014 * kk)}" fill="none"/>`;
  const [qx, qy] = pr(2.62, top, 0.22), kq = kz(0.22);
  s += `<path d="M${f1(qx - 0.06 * kq)} ${f1(qy)} L${f1(qx - 0.07 * kq)} ${f1(qy - 0.11 * kq)} L${f1(qx + 0.07 * kq)} ${f1(qy - 0.11 * kq)} L${f1(qx + 0.06 * kq)} ${f1(qy)} Z" fill="#e0d6c3"/>`;
  const r = rng(19);
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * 2.6, L = (0.12 + r() * 0.14) * kq, ex = qx + Math.cos(a) * L, ey = qy - 0.11 * kq + Math.sin(a) * L;
    const sx = qx, sy = qy - 0.11 * kq, mx = (sx + ex) / 2 - Math.sin(a) * 6, my = (sy + ey) / 2 + Math.cos(a) * 6;
    s += `<path d="M${f1(sx)} ${f1(sy)} Q${f1(mx)} ${f1(my)} ${f1(ex)} ${f1(ey)} Q${f1(mx + Math.sin(a) * 10)} ${f1(my - Math.cos(a) * 10)} ${f1(sx)} ${f1(sy)} Z" fill="${['#577049', '#4a6340', '#66804f'][i % 3]}"/>`;
  }
  // deux étagères ouvertes : bocaux sans étiquette, bols, assiettes, un pothos qui retombe
  for (const [y, objs] of [[1.62, 'bocaux'], [1.98, 'vaisselle']]) {
    const sx0 = 0.32, sx1 = 1.98, dz = 0.22;
    s += poly3(quadZ(0.002, sx0 - 0.02, sx1 + 0.02, y - 0.12, y - 0.02), `fill="#6d6253" opacity=".22" ${F_(6)}`);
    if (objs === 'bocaux') {
      const J = [[0.42, 0.1, 0.2, '#e9dfc9', 0.78], [0.56, 0.11, 0.26, '#b9773f', 0.7], [0.71, 0.09, 0.17, '#e2bf72', 0.8], [0.84, 0.1, 0.23, '#6d4433', 0.6],
        [0.99, 0.11, 0.19, '#d8c49b', 0.75], [1.15, 0.08, 0.15, '#9a5a3c', 0.7]];
      for (const [X, w, h, c, l] of J) s += bocal(X, y, 0.11, w, h, c, l, '#b48a5c');
      // pile de bols
      const [ux, uy] = pr(1.5, y, 0.11), ku = kz(0.11);
      for (let i = 0; i < 3; i++) s += `<path d="M${f1(ux - (0.09 - i * 0.005) * ku)} ${f1(uy - i * 0.035 * ku - 0.04 * ku)} Q${f1(ux)} ${f1(uy - i * 0.035 * ku + 0.012 * ku)} ${f1(ux + (0.09 - i * 0.005) * ku)} ${f1(uy - i * 0.035 * ku - 0.04 * ku)} Z" fill="${['#d9d2c4', '#c9b8a0', '#e6dfd2'][i]}" stroke="#a69a88" stroke-width="1"/>`;
      s += bocal(1.78, y, 0.11, 0.1, 0.2, '#e7d9b8', 0.55, '#b48a5c');
    } else {
      const [ax, ay] = pr(0.5, y, 0.08), ka = kz(0.08);
      for (let i = 0; i < 3; i++) s += `<ellipse cx="${f1(ax + i * 0.05 * ka)}" cy="${f1(ay - 0.12 * ka)}" rx="${f1(0.025 * ka)}" ry="${f1(0.12 * ka)}" fill="${['#e9e3d7', '#d6cbb8', '#a9b5a2'][i]}" stroke="#9e9381" stroke-width="1"/>`;
      const [jx, jy] = pr(1.0, y, 0.1), kj = kz(0.1);
      s += `<path d="M${f1(jx - 0.06 * kj)} ${f1(jy)} C${f1(jx - 0.08 * kj)} ${f1(jy - 0.1 * kj)} ${f1(jx - 0.04 * kj)} ${f1(jy - 0.16 * kj)} ${f1(jx - 0.035 * kj)} ${f1(jy - 0.2 * kj)} L${f1(jx + 0.045 * kj)} ${f1(jy - 0.21 * kj)} C${f1(jx + 0.04 * kj)} ${f1(jy - 0.16 * kj)} ${f1(jx + 0.08 * kj)} ${f1(jy - 0.1 * kj)} ${f1(jx + 0.06 * kj)} ${f1(jy)} Z" fill="#c98f6c"/>`;
      s += `<path d="M${f1(jx - 0.05 * kj)} ${f1(jy - 4)} C${f1(jx - 0.07 * kj)} ${f1(jy - 0.1 * kj)} ${f1(jx - 0.035 * kj)} ${f1(jy - 0.16 * kj)} ${f1(jx - 0.03 * kj)} ${f1(jy - 0.19 * kj)}" stroke="#f0c9a6" stroke-width="2.4" fill="none" opacity=".7"/>`;
      // pothos : il retombe de l'étagère en longues tiges
      const [px, py] = pr(1.6, y, 0.1), kp = kz(0.1);
      s += `<path d="M${f1(px - 0.07 * kp)} ${f1(py)} L${f1(px - 0.08 * kp)} ${f1(py - 0.1 * kp)} L${f1(px + 0.08 * kp)} ${f1(py - 0.1 * kp)} L${f1(px + 0.07 * kp)} ${f1(py)} Z" fill="#d7cbb4"/>`;
      const rp = rng(88);
      for (let v = 0; v < 4; v++) {
        let x = px + (v - 1.5) * 9, yy = py - 0.08 * kp;
        const len = 5 + v * 2;
        for (let i = 0; i < len; i++) {
          const nx = x + (rp() - 0.5) * 10 + (v - 1.5) * 2, ny = yy + 14 + rp() * 6;
          s += `<path d="M${f1(x)} ${f1(yy)} L${f1(nx)} ${f1(ny)}" stroke="#4f6a42" stroke-width="1.6"/>`;
          const sd = i % 2 ? 1 : -1;
          s += `<ellipse cx="${f1(nx + sd * 6)}" cy="${f1(ny)}" rx="7" ry="4.6" transform="rotate(${f1(sd * 30 + (rp() - 0.5) * 30)} ${f1(nx + sd * 6)} ${f1(ny)})" fill="${['#55703f', '#6a8650', '#47613a'][i % 3]}"/>`;
          x = nx; yy = ny;
        }
      }
      // feuilles sur le dessus
      for (let i = 0; i < 8; i++) s += `<ellipse cx="${f1(px + (rp() - 0.5) * 40)}" cy="${f1(py - 0.11 * kp - rp() * 10)}" rx="8" ry="5" fill="${['#55703f', '#6a8650'][i % 2]}"/>`;
    }
    // planche : dessous (on est sous l'étagère) et chant
    s += poly3([[sx0, y - 0.03, 0], [sx1, y - 0.03, 0], [sx1, y - 0.03, dz], [sx0, y - 0.03, dz]], 'fill="#9c7a55"');
    s += poly3(quadZ(dz, sx0, sx1, y - 0.03, y), 'fill="#d2ad7e"');
    s += `<path d="${path3([['M', [sx0, y, dz]], ['L', [sx1, y, dz]]])}" stroke="#f0d3a6" stroke-width="1.5" fill="none" opacity=".8"/>`;
  }
  return s;
}

// Porte ouverte au fond, à droite : la chambre vide, nue et ensoleillée, un carton fermé
const DOOR = { x0: 3.6, x1: 4.32, h: 2.05 };
function porte() {
  const { x0, x1, h } = DOOR, back = -3.0, wall = -0.12;
  let s = `<clipPath id="a2-cuisine-c-porte">${poly3(quadZ(0, x0, x1, 0, h))}</clipPath><g clip-path="url(#a2-cuisine-c-porte)">`;
  // la pièce d'à côté : mur du fond clair, parquet, tache de soleil venue de sa fenêtre (à gauche)
  s += poly3(quadZ(back, 2.5, 6.5, 0, 2.7), 'fill="#e9dcc6"');
  s += poly3(quadY(0, 2.5, 6.5, back, wall), 'fill="#cfa274"');
  for (let x = 2.6; x < 6.5; x += 0.17) s += `<path d="${path3([['M', [x, 0, back]], ['L', [x, 0, wall]]])}" stroke="#9c7650" stroke-width="1" opacity=".35" fill="none"/>`;
  s += poly3(quadX(x1 + 0.4, back, wall, 0, 2.7), 'fill="#d8c9b0"');
  // soleil : sur le mur du fond (bas) et sur le parquet, coupé par les montants de sa fenêtre
  for (const [za, zb] of [[-2.9, -2.45], [-2.4, -1.95]]) {
    s += poly3([[3.9, 0, za + 0.9], [5.6, 0, za + 1.75], [5.6, 0, zb + 1.75], [3.9, 0, zb + 0.9]], 'fill="#f6d39c" opacity=".85"');
  }
  s += poly3([[4.3, 0.02, back], [5.4, 0.02, back], [5.4, 0.62, back], [4.3, 0.62, back]], 'fill="#fbe2b4" opacity=".7"');
  s += poly3([[4.78, 0.02, back + 0.01], [4.86, 0.02, back + 0.01], [4.86, 0.62, back + 0.01], [4.78, 0.62, back + 0.01]], 'fill="#e2cfb0"');
  // le carton fermé, posé au sol, son ombre
  const C = { x0: 4.36, x1: 4.74, z0: -1.42, z1: -1.02, y: 0.34 };
  s += poly3([[C.x1, 0, C.z0], [C.x1 + 0.5, 0, C.z0 + 0.25], [C.x1 + 0.5, 0, C.z1 + 0.25], [C.x1, 0, C.z1]], `fill="#8e6a48" opacity=".35" ${F_(3)}`);
  s += poly3(quadZ(C.z1, C.x0, C.x1, 0, C.y), 'fill="#b48a5c"');
  s += poly3(quadY(C.y, C.x0, C.x1, C.z0, C.z1), 'fill="#d4ab78"');
  s += poly3(quadY(C.y + 0.001, C.x0, C.x1, (C.z0 + C.z1) / 2 - 0.025, (C.z0 + C.z1) / 2 + 0.025), 'fill="#e6c595" opacity=".9"');
  s += poly3(quadZ(C.z1 + 0.001, (C.x0 + C.x1) / 2 - 0.025, (C.x0 + C.x1) / 2 + 0.025, C.y - 0.09, C.y), 'fill="#c79f6f"');
  s += `<path d="${path3([['M', [C.x0, C.y, C.z1]], ['L', [C.x1, C.y, C.z1]]])}" stroke="#f2d3a0" stroke-width="2" fill="none"/>`;
  // ombre douce au pied des murs
  s += poly3(quadY(0.001, 2.5, 6.5, back, back + 0.4), `fill="#8c7458" opacity=".25" ${F_(6)}`);
  s += '</g>';
  // tableau de porte (joue de droite, vue), chambranle crème
  s += poly3([[x1, 0, 0], [x1, 0, wall], [x1, h, wall], [x1, h, 0]], 'fill="#cfc3ae"');
  s += poly3([[x0, h, 0], [x1, h, 0], [x1, h, wall], [x0, h, wall]], 'fill="#b9ad98"');
  const tw = 0.065;
  s += poly3(quadZ(0.004, x0 - tw, x0, 0, h + tw), 'fill="#e3dac9"');
  s += poly3(quadZ(0.004, x1, x1 + tw, 0, h + tw), 'fill="#e3dac9"');
  s += poly3(quadZ(0.004, x0 - tw, x1 + tw, h, h + tw), 'fill="#ebe3d4"');
  s += poly3(quadZ(0.005, x0 - 0.01, x0, 0, h), 'fill="#b4a892"');
  return s;
}

// Mur de droite : une petite estampe abstraite, une grande plante dans l'angle
function murDroit() {
  let s = '';
  const z0 = 1.5, z1 = 2.05, y0 = 1.3, y1 = 1.82;
  s += poly3(quadX(RW - 0.004, z0 - 0.02, z1 + 0.03, y0 - 0.05, y1 - 0.01), `fill="#7e735f" opacity=".25" ${F_(4)}`);
  s += poly3(quadX(RW - 0.01, z0, z1, y0, y1), 'fill="#b58d61"');
  s += poly3(quadX(RW - 0.012, z0 + 0.025, z1 - 0.025, y0 + 0.025, y1 - 0.025), 'fill="#efe6d4"');
  const [cx, cy] = pr(RW - 0.014, 1.6, 1.72);
  s += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="16" ry="34" fill="#d9a35f" opacity=".85"/>`;
  s += poly3(quadX(RW - 0.015, 1.62, 1.95, 1.36, 1.5), 'fill="#94a38a" opacity=".85"');
  // grande plante en pot, dans l'angle du mur de droite
  const [px, py] = pr(4.12, 0, 1.1), k = kz(1.1);
  s += `<ellipse cx="${f1(px - 10)}" cy="${f1(py)}" rx="${f1(0.24 * k)}" ry="${f1(0.05 * k)}" fill="#5e4c3c" opacity=".3" ${F_(6)}/>`;
  s += `<path d="M${f1(px - 0.15 * k)} ${f1(py)} L${f1(px - 0.18 * k)} ${f1(py - 0.36 * k)} L${f1(px + 0.18 * k)} ${f1(py - 0.36 * k)} L${f1(px + 0.15 * k)} ${f1(py)} Z" fill="#b8694a"/>`;
  s += `<path d="M${f1(px - 0.15 * k)} ${f1(py)} L${f1(px - 0.18 * k)} ${f1(py - 0.36 * k)} L${f1(px - 0.08 * k)} ${f1(py - 0.36 * k)} L${f1(px - 0.06 * k)} ${f1(py)} Z" fill="#d3896a" opacity=".6"/>`;
  s += `<rect x="${f1(px - 0.2 * k)}" y="${f1(py - 0.4 * k)}" width="${f1(0.4 * k)}" height="${f1(0.05 * k)}" rx="3" fill="#a65e42"/>`;
  const r = rng(47);
  const base = [px, py - 0.38 * k];
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * 1.9, L = (0.5 + r() * 0.9) * k;
    const tip = [base[0] + Math.cos(a) * L * 0.55, base[1] + Math.sin(a) * L];
    s += `<path d="M${xy(base)} Q${f1(base[0] + Math.cos(a) * L * 0.2)} ${f1(base[1] - L * 0.5)} ${xy(tip)}" stroke="#4d5f3f" stroke-width="2" fill="none"/>`;
    const lw = (0.09 + r() * 0.06) * k, ll = (0.22 + r() * 0.12) * k, ang = (a * 180) / Math.PI + 90 + (r() - 0.5) * 40;
    const col = ['#4f6942', '#5f7a4c', '#43593a', '#6c8655'][i % 4];
    s += `<ellipse cx="${f1(tip[0])}" cy="${f1(tip[1])}" rx="${f1(lw)}" ry="${f1(ll)}" transform="rotate(${f1(ang)} ${xy(tip)})" fill="${col}"/>`;
    s += `<ellipse cx="${f1(tip[0] + lw * 0.35)}" cy="${f1(tip[1])}" rx="${f1(lw * 0.6)}" ry="${f1(ll * 0.92)}" transform="rotate(${f1(ang)} ${xy(tip)})" fill="#24331f" opacity=".3"/>`;
    s += `<ellipse cx="${f1(tip[0])}" cy="${f1(tip[1])}" rx="${f1(lw)}" ry="${f1(ll)}" transform="rotate(${f1(ang)} ${xy(tip)})" fill="none" stroke="#b9c48e" stroke-width="1.6" stroke-dasharray="${f1(ll * 1.6)} ${f1(ll * 4)}" opacity=".45"/>`;
    s += `<path d="M${f1(tip[0])} ${f1(tip[1] - ll * 0.8)} L${f1(tip[0])} ${f1(tip[1] + ll * 0.8)}" transform="rotate(${f1(ang)} ${xy(tip)})" stroke="#86a06a" stroke-width="1.2" opacity=".5"/>`;
  }
  return s;
}

// Ombres d'ambiance : coins, pied des murs, le mur de la fenêtre à contre-jour
function ambiance() {
  let s = '';
  s += poly3(quadZ(0.001, 0, RW, 0, RH), 'fill="url(#a2-cuisine-ombreFond)"');
  s += poly3(quadZ(0.001, 0, RW, RH - 0.35, RH), 'fill="url(#a2-cuisine-coinH)"');
  s += poly3(quadY(0.001, 0, RW, 0, 0.16), `fill="#5b4f45" opacity=".25" ${F_(6)}`);
  const m = rng(5);
  for (let i = 0; i < 12; i++) {
    const [cx, cy] = pr(m() * RW, 0.3 + m() * 2.1, 0);
    const c = ['#c9bba3', '#b9aa93', '#c3b49c', '#b1a28c'][i % 4];
    s += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(110 + m() * 160)}" ry="${f1(70 + m() * 110)}" fill="${c}" opacity=".55" ${F_(24)}/>`;
  }
  return s;
}

const FOND = `
<defs>
  ${FX}
  ${grad('a2-cuisine-murFond', 398, 0, 1548, 0, [[0, '#cdbda2'], [0.45, '#c0ae94'], [1, '#ab9a82']])}
  ${grad('a2-cuisine-murG', -240, 0, 398, 0, [[0, '#6f675e'], [0.55, '#857b6f'], [1, '#9b9081']])}
  ${grad('a2-cuisine-murD', 1548, 0, 2160, 0, [[0, '#c2b39c'], [1, '#a69780']])}
  ${grad('a2-cuisine-plafond', 0, -140, 0, 40, [[0, '#8f8472'], [1, '#b0a590']])}
  ${grad('a2-cuisine-sol', 0, 720, 0, 1220, [[0, '#3a2c22', 0.18], [0.3, '#3a2c22', 0.04], [1, '#2a2026', 0.35]])}
  ${grad('a2-cuisine-ombreFond', 0, 30, 0, 730, [[0, '#4e4a52', 0.12], [0.5, '#4e4a52', 0], [1, '#4e4a52', 0.12]])}
  ${grad('a2-cuisine-coinH', 0, 30, 0, 130, [[0, '#4e4a52', 0.25], [1, '#4e4a52', 0]])}
  ${grad('a2-cuisine-ciel', 0, -80, 0, 560, [[0, '#fbf6ea'], [0.45, '#fff7e6'], [0.8, '#fcebcb'], [1, '#f6dfb6']])}
  ${radial('a2-cuisine-brume', 20, 60, 420, [[0, '#fffaee', 0.8], [0.5, '#fff3dc', 0.35], [1, '#fff3dc', 0.05]])}
  ${grad('a2-cuisine-bouilloire', 700, 0, 840, 0, [[0, '#f3ecdd'], [0.45, '#ddd4c2'], [1, '#a9a091']])}
</defs>
${poly3(quadY(RH, -0.3, RW + 0.3, 0, NEAR), 'fill="url(#a2-cuisine-plafond)"')}
${poly3(quadX(0, 0, NEAR, -0.1, RH), 'fill="url(#a2-cuisine-murG)"')}
${poly3(quadX(RW, 0, NEAR, -0.1, RH), 'fill="url(#a2-cuisine-murD)"')}
${poly3(quadZ(0, 0, RW, 0, RH), 'fill="url(#a2-cuisine-murFond)"')}
${plancher()}
${poly3(quadY(0.001, -0.1, RW + 0.1, 0, NEAR), 'fill="url(#a2-cuisine-sol)"')}
${ambiance()}
${poly3(quadZ(0.003, 0, RW, RH - 0.04, RH), 'fill="#d9cfbd"')}
${poly3(quadX(0.003, 0, NEAR, RH - 0.04, RH), 'fill="#a59c8d"')}
${poly3(quadX(RW - 0.003, 0, NEAR, RH - 0.04, RH), 'fill="#cfc3ad"')}
${poly3(quadZ(0.004, 2.98, RW, 0, 0.09), 'fill="#e6dccb"')}
${poly3(quadX(0.004, 0, NEAR, 0, 0.09), 'fill="#9b9283"')}
${poly3(quadX(RW - 0.004, 0, NEAR, 0, 0.09), 'fill="#d9cdb7"')}
${fenetre()}
${plantesAppui()}
${cuisine()}
${porte()}
${murDroit()}
`;

/* ==========================================================================
   Calque « table » : la grande table en bois clair, les deux chaises, la
   suspension en céramique au-dessus de la table
   ========================================================================== */
// Chaise en bois simple : assise, dossier à barreaux (côté hors de la table)
function chaise(xs, side) {
  const { y } = { y: 0.46 };
  const zA = ZC - 0.2, zB = ZC + 0.2, xb = side < 0 ? xs - 0.21 : xs + 0.21, xf = side < 0 ? xs + 0.21 : xs - 0.21;
  const w = 0.035;
  let s = '';
  // pieds arrière et avant
  for (const [x, z] of [[xb, zA], [xb, zB], [xf, zA], [xf, zB]]) s += poly3(quadZ(z, x - w / 2, x + w / 2, 0, y), 'fill="#9a7148"');
  // assise
  s += poly3(quadY(y, Math.min(xb, xf) - 0.02, Math.max(xb, xf) + 0.02, zA - 0.02, zB + 0.02), 'fill="#c79a68"');
  s += poly3(quadZ(zB + 0.02, Math.min(xb, xf) - 0.02, Math.max(xb, xf) + 0.02, y - 0.03, y), 'fill="#a87d52"');
  // dossier : deux montants, barre haute cintrée, barreaux
  for (const z of [zA, zB]) s += poly3(quadZ(z, xb - w / 2, xb + w / 2, y, 0.9), 'fill="url(#a2-cuisine-montant)"');
  s += poly3(quadX(xb, zA - 0.02, zB + 0.02, 0.78, 0.9), 'fill="#b88b5b"');
  s += `<path d="${path3([['M', [xb, 0.9, zA - 0.02]], ['L', [xb, 0.9, zB + 0.02]]])}" stroke="#e7c38f" stroke-width="2.4" fill="none" opacity=".8"/>`;
  for (let i = 1; i < 4; i++) {
    const z = lerp(zA, zB, i / 4);
    s += poly3(quadX(xb, z - 0.009, z + 0.009, y + 0.03, 0.78), 'fill="#a77c50"');
  }
  return s;
}

function table() {
  const { x0, x1, z0, z1, y, th } = TAB;
  let s = '';
  // ombre de la table sur le parquet (pénombre douce), plus dense au centre
  s += poly3(quadY(0.002, x0 - 0.12, x1 + 0.12, z0 - 0.1, z1 + 0.1), `fill="#3c2c24" opacity=".35" ${F_(16)}`);
  s += poly3(quadY(0.003, x0 + 0.1, x1 - 0.1, z0 + 0.2, z1 - 0.2), `fill="#2e221d" opacity=".35" ${F_(10)}`);
  // pieds (du fond vers nous)
  for (const [x, z] of LEGS) {
    s += poly3(quadZ(z + 0.03, x - 0.03, x + 0.03, 0, y - th), 'fill="url(#a2-cuisine-pied)"');
  }
  // ceinture sous le plateau (côté proche)
  s += poly3(quadZ(z1 - 0.05, x0 + 0.03, x1 - 0.03, y - th - 0.09, y - th), 'fill="#a77d50"');
  s += poly3(quadZ(z1 - 0.05, x0 + 0.03, x1 - 0.03, y - th - 0.09, y - th - 0.075), 'fill="#7e5b3b" opacity=".6"');
  // plateau : dessus en quatre planches, chant du bout
  s += poly3(quadY(y, x0, x1, z0, z1), 'fill="url(#a2-cuisine-plateau)"');
  const pw = (x1 - x0) / 4, r = rng(91);
  for (let i = 0; i < 4; i++) {
    const a = x0 + i * pw;
    s += poly3(quadY(y + 0.0005, a + 0.003, a + pw - 0.003, z0, z1), `fill="${['#d9b88a', '#d3b082', '#dcbc90', '#d6b386'][i]}" opacity=".55"`);
    for (let j = 0; j < 3; j++) {
      const xv = a + pw * (0.2 + r() * 0.6), wv = pw * 0.12;
      s += `<path d="${path3([['M', [xv, y + 0.001, z0 + 0.05]], ['C', [xv + wv, y + 0.001, z0 + 0.9], [xv - wv, y + 0.001, z0 + 1.8], [xv + wv * 0.4, y + 0.001, z1 - 0.05]]])}" stroke="#a9845a" stroke-width="1.1" opacity=".3" fill="none"/>`;
    }
    if (i) s += `<path d="${path3([['M', [a, y + 0.001, z0]], ['L', [a, y + 0.001, z1]]])}" stroke="#9c7650" stroke-width="1.3" opacity=".45" fill="none"/>`;
  }
  // un nœud du bois, quelques marques d'usage
  const [nx, ny] = pr(2.36, y, 3.55);
  s += `<ellipse cx="${f1(nx)}" cy="${f1(ny)}" rx="9" ry="2.6" fill="none" stroke="#a67f55" stroke-width="1.2" opacity=".4"/>`;
  s += poly3(quadZ(z1, x0, x1, y - th, y), 'fill="url(#a2-cuisine-chant)"');
  s += `<path d="${path3([['M', [x0, y, z1]], ['L', [x1, y, z1]]])}" stroke="#f2d8ad" stroke-width="2.2" fill="none" opacity=".85"/>`;
  // le dessus s'assombrit doucement au loin (hors du soleil)
  s += poly3(quadY(y + 0.002, x0, x1, z0, z1), 'fill="url(#a2-cuisine-plateauOmbre)"');
  return s;
}

// Suspension en céramique crème au-dessus de la table (éteinte, le matin)
function lampe() {
  const Z = 2.45, X = 2.15;
  const [cx, cy] = pr(X, 1.93, Z), k = kz(Z);
  const [tx, ty] = pr(X, 2.08, Z), [ux, uy] = pr(X, RH, Z);
  const w = 0.19 * k;
  let s = `<path d="M${f1(ux)} ${f1(uy - 40)} L${f1(tx)} ${f1(ty - 0.03 * k)}" stroke="#4a403a" stroke-width="2" fill="none"/>`;
  s += `<rect x="${f1(tx - 0.018 * k)}" y="${f1(ty - 0.035 * k)}" width="${f1(0.036 * k)}" height="${f1(0.04 * k)}" rx="2" fill="#6b5f55"/>`;
  s += `<path d="M${f1(cx - w)} ${f1(cy)} C${f1(cx - w)} ${f1(ty + 0.02 * k)} ${f1(cx - w * 0.45)} ${f1(ty)} ${f1(cx)} ${f1(ty)} C${f1(cx + w * 0.45)} ${f1(ty)} ${f1(cx + w)} ${f1(ty + 0.02 * k)} ${f1(cx + w)} ${f1(cy)} Z" fill="url(#a2-cuisine-abatjour)"/>`;
  s += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(w)}" ry="${f1(0.022 * k)}" fill="#6f655b"/>`;
  s += `<ellipse cx="${f1(cx)}" cy="${f1(cy - 1)}" rx="${f1(w * 0.9)}" ry="${f1(0.016 * k)}" fill="#4d443d"/>`;
  s += `<path d="M${f1(cx - w * 0.95)} ${f1(cy - 3)} C${f1(cx - w * 0.92)} ${f1(ty + 0.03 * k)} ${f1(cx - w * 0.5)} ${f1(ty + 3)} ${f1(cx - w * 0.1)} ${f1(ty + 2)}" stroke="#fff3dc" stroke-width="4" fill="none" opacity=".75" stroke-linecap="round"/>`;
  return s;
}

const TABLE = `
<defs>
  ${FX}
  ${grad('a2-cuisine-plateau', 0, 560, 0, 770, [[0, '#cfac7e'], [1, '#dcbb8d']])}
  ${grad('a2-cuisine-plateauOmbre', 0, 555, 0, 640, [[0, '#6d5a4c', 0.3], [1, '#6d5a4c', 0]])}
  ${grad('a2-cuisine-chant', 0, 760, 0, 792, [[0, '#c49a68'], [1, '#9c7448']])}
  ${grad('a2-cuisine-pied', 640, 0, 760, 0, [[0, '#8e6a45'], [0.5, '#b38a5d'], [1, '#7c5a3a']])}
  ${grad('a2-cuisine-montant', 400, 0, 1500, 0, [[0, '#b08356'], [1, '#9f7448']])}
  ${grad('a2-cuisine-abatjour', 890, 0, 1030, 0, [[0, '#f1e6d2'], [0.45, '#ddd0ba'], [1, '#b3a690']])}
</defs>
${chaise(1.5, -1)}
${chaise(2.79, 1)}
${table()}
${lampe()}
`;

/* ==========================================================================
   Calque « objets » : sur la table, les deux tasses (sauge, terre cuite),
   l'enveloppe ouverte et la lettre dépliée. Aucun texte lisible : des lignes
   grises, et le petit anneau de cercles dont un seul est teinté de laiton.
   ========================================================================== */
const CUPS = [
  { X: 1.86, Z: 2.42, col: '#9fb198', lit: '#d6e2c4', dark: '#617460', side: -1 }, // sauge, anse vers A
  { X: 2.44, Z: 2.36, col: '#c0704e', lit: '#f0b088', dark: '#7e4130', side: 1 },  // terre cuite, anse vers B
];
const CUP_H = 0.095, CUP_R = 0.043;
const cupTop = (c) => pr(c.X, TAB.y + CUP_H, c.Z);

// Ombre portée d'une boîte sur le plateau (le long du soleil)
const onTable = (b) => clip(clip(clip(clip(hull(b.map(toY(TAB.y)), 0, 2), (p) => p[0] - TAB.x0), (p) => TAB.x1 - p[0]), (p) => p[2] - TAB.z0), (p) => TAB.z1 - p[2]);

function tasse(c) {
  const k = kz(c.Z), [bx, by] = pr(c.X, TAB.y, c.Z), [tx, ty] = cupTop(c);
  const w = CUP_R * k, e = w * ((EYE - TAB.y - CUP_H) / (D - c.Z)) * 1.6, eb = w * ((EYE - TAB.y) / (D - c.Z)) * 1.6;
  let s = '';
  // ombre longue du matin, vers la droite et vers nous
  const sh = onTable(box(c.X - CUP_R * 0.8, c.X + CUP_R * 0.8, TAB.y, TAB.y + CUP_H, c.Z - CUP_R * 0.8, c.Z + CUP_R * 0.8));
  s += poly3(sh, `fill="#5b4330" opacity=".42" ${F_(2)}`);
  s += `<ellipse cx="${f1(bx + 2)}" cy="${f1(by + 1)}" rx="${f1(w * 1.05)}" ry="${f1(eb * 1.1)}" fill="#3e2c22" opacity=".45" ${F_(1)}/>`;
  // anse (derrière ou devant selon le côté)
  const hx = tx + c.side * w * 0.98, hy0 = ty + (by - ty) * 0.22, hy1 = ty + (by - ty) * 0.72;
  const anse = `M${f1(hx - c.side * 2)} ${f1(hy0)} C${f1(hx + c.side * w * 0.62)} ${f1(hy0 - 2)} ${f1(hx + c.side * w * 0.66)} ${f1(hy1 + 2)} ${f1(hx - c.side * 2)} ${f1(hy1)}`;
  s += `<path d="${anse}" fill="none" stroke="${c.dark}" stroke-width="${f1(w * 0.3)}" stroke-linecap="round"/>`;
  s += `<path d="${anse}" fill="none" stroke="${c.col}" stroke-width="${f1(w * 0.16)}" stroke-linecap="round" transform="translate(${-c.side * 0.6} -0.6)"/>`;
  // corps : légèrement bombé, pied arrondi
  const body = `M${f1(tx - w)} ${f1(ty)} C${f1(tx - w * 1.02)} ${f1(ty + (by - ty) * 0.5)} ${f1(bx - w * 1.0)} ${f1(by - eb * 2)} ${f1(bx - w * 0.86)} ${f1(by - eb * 0.3)} ` +
    `Q${f1(bx)} ${f1(by + eb * 1.3)} ${f1(bx + w * 0.86)} ${f1(by - eb * 0.3)} C${f1(bx + w * 1.0)} ${f1(by - eb * 2)} ${f1(tx + w * 1.02)} ${f1(ty + (by - ty) * 0.5)} ${f1(tx + w)} ${f1(ty)} Z`;
  s += `<path d="${body}" fill="url(#a2-cuisine-tasse-${c.side})"/>`;
  // émail : un reflet vif du côté de la fenêtre, un rebond chaud du plateau en bas
  s += `<path d="M${f1(tx - w * 0.7)} ${f1(ty + 3)} C${f1(tx - w * 0.78)} ${f1(ty + (by - ty) * 0.4)} ${f1(bx - w * 0.72)} ${f1(by - (by - ty) * 0.35)} ${f1(bx - w * 0.6)} ${f1(by - 4)}" stroke="#fffaf0" stroke-width="${f1(w * 0.16)}" fill="none" opacity=".7" stroke-linecap="round"/>`;
  s += `<path d="M${f1(bx - w * 0.6)} ${f1(by - 3)} Q${f1(bx)} ${f1(by + eb)} ${f1(bx + w * 0.7)} ${f1(by - 3)}" stroke="#ffd9a6" stroke-width="2.4" fill="none" opacity=".45"/>`;
  // le bord, et le café (surface sombre, petite lueur)
  s += `<ellipse cx="${f1(tx)}" cy="${f1(ty)}" rx="${f1(w)}" ry="${f1(Math.max(1.6, e))}" fill="${c.lit}"/>`;
  s += `<ellipse cx="${f1(tx)}" cy="${f1(ty + 0.4)}" rx="${f1(w * 0.84)}" ry="${f1(Math.max(1, e * 0.75))}" fill="#3a2418"/>`;
  s += `<ellipse cx="${f1(tx + w * 0.25)}" cy="${f1(ty + 0.4)}" rx="${f1(w * 0.3)}" ry="${f1(Math.max(0.6, e * 0.4))}" fill="#a86f45" opacity=".6"/>`;
  return s;
}

// Lettre (A4 pliée en trois, dépliée, les plis encore marqués) : le grand côté vers nous
const LET = { x0: 2.02, x1: 2.23, z: [2.55, 2.65, 2.75, 2.85], lift: [0.05, 0.004, 0.004, 0.016] };
function lettre() {
  const { x0, x1, z, lift } = LET, y = TAB.y;
  const P3 = (x, i) => [x, y + lift[i], z[i]];
  let s = '';
  // ombre de la feuille sur le plateau (le panneau du fond, relevé, la projette vers nous)
  s += poly3(onTable([P3(x0, 0), P3(x1, 0), P3(x0, 1), P3(x1, 1)]), `fill="#5b4330" opacity=".3" ${F_(2)}`);
  // panneaux : celui du fond se relève et regarde la fenêtre, celui du milieu est à plat
  const fills = ['#fbf6ec', '#efe8dc', '#e3dbcd'];
  for (let i = 0; i < 3; i++) s += poly3([P3(x0, i), P3(x1, i), P3(x1, i + 1), P3(x0, i + 1)], `fill="${fills[i]}"`);
  // plis
  for (const i of [1, 2]) s += `<path d="${path3([['M', P3(x0, i)], ['L', P3(x1, i)]])}" stroke="#c7bba8" stroke-width="1.2" fill="none"/>`;
  // lignes grises abstraites (aucun texte), sur le panneau du fond
  const lines = [[0.1, 0.62], [0.1, 0.86], [0.1, 0.78], [0.1, 0.5], [0.1, 0.7]];
  lines.forEach(([a, b], j) => {
    const u = 0.2 + j * 0.15, zz = lerp(z[0], z[1], u), yy = y + lerp(lift[0], lift[1], u);
    s += `<path d="${path3([['M', [lerp(x0, x1, a), yy + 0.001, zz]], ['L', [lerp(x0, x1, b), yy + 0.001, zz]]])}" stroke="#8d8a86" stroke-width="1.1" opacity=".75" fill="none"/>`;
  });
  // petit schéma : un anneau de cercles, un seul teinté de laiton (illisible à cette distance)
  const cz = lerp(z[1], z[2], 0.45), cxm = lerp(x0, x1, 0.5);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU, [px, py] = pr(cxm + 0.016 * Math.cos(a), y + 0.005, cz + 0.016 * Math.sin(a));
    s += `<circle cx="${f1(px)}" cy="${f1(py)}" r="1.05" fill="${i === 3 ? '#d7a548' : '#9a958d'}" opacity="${i === 3 ? 1 : 0.7}"/>`;
  }
  // lumière rasante sur l'arête relevée
  s += `<path d="${path3([['M', P3(x0, 0)], ['L', P3(x1, 0)]])}" stroke="#fff8e6" stroke-width="1.6" fill="none"/>`;
  return s;
}

// Enveloppe ouverte, rabat relevé, posée derrière la lettre
function enveloppe() {
  const x0 = 2.1, x1 = 2.34, z0 = 2.18, z1 = 2.34, y = TAB.y + 0.003;
  let s = poly3(onTable(box(x0, x1, TAB.y, TAB.y + 0.045, z0 - 0.02, z0)), `fill="#5b4330" opacity=".3" ${F_(2)}`);
  s += poly3(quadY(y, x0, x1, z0, z1), 'fill="#e9e1d1"');
  s += `<path d="${path3([['M', [x0, y, z1]], ['L', [(x0 + x1) / 2, y, z0 + 0.05]], ['L', [x1, y, z1]]])}" stroke="#c8bba5" stroke-width="1" fill="none"/>`;
  // rabat ouvert, dressé vers le fond : il prend le soleil
  s += poly3([[x0, y, z0], [x1, y, z0], [(x0 + x1) / 2, y + 0.05, z0 - 0.025]], 'fill="#f7f0e2"');
  s += `<path d="${path3([['M', [x0, y, z0]], ['L', [x1, y, z0]]])}" stroke="#b9ab94" stroke-width="1" fill="none"/>`;
  return s;
}

const OBJETS = `
<defs>
  ${FX}
  ${CUPS.map((c) => { const [tx] = cupTop(c), w = CUP_R * kz(c.Z); return grad(`a2-cuisine-tasse-${c.side}`, tx - w, 0, tx + w, 0, [[0, c.lit], [0.28, c.col], [0.75, c.col], [1, c.dark]]); }).join('')}
</defs>
${enveloppe()}
${tasse(CUPS[0])}
${lettre()}
${tasse(CUPS[1])}
`;

/* ==========================================================================
   Calque « couple » : A (à gauche, profil vers la droite) et B (à droite,
   profil vers la gauche), assis de part et d'autre de la table.
   Le soleil vient de la gauche et de derrière eux : liseré doré sur le dos,
   la nuque et le chignon de A ; sur le front, le nez, la barbe et la poitrine
   de B. Le côté tourné vers nous reste dans une ombre douce, réchauffée par
   le rebond du plateau ensoleillé.
   ========================================================================== */
// Peau mate de A (bible : #c9946f, ombre #9e6d4f). Les faisceaux passent devant
// elle et posent un voile clair (environ un quart en « screen ») : on la peint
// plus profonde et plus chaude pour qu'à l'image elle garde sa teinte mate.
const CA = {
  skin: '#a9643e', skinSh: '#844e2e', skinDeep: '#603622', skinLit: '#cd8a5a',
  hair: '#2e1f18', hairDeep: '#1a110c', hairLit: '#4a3125',
  knit: '#b5654a', knitSh: '#874632', knitDeep: '#64321f', knitLit: '#e39a72',
  top: '#ece2cf', pants: '#cfc1a8', pantsSh: '#9c8f7a',
};
const CB = {
  skin: '#e8bfa0', skinSh: '#c4927a', skinDeep: '#9d6c57', skinLit: '#ffdcb8',
  hair: '#4a3226', hairDeep: '#2a1b14', hairLit: '#76513a', beard: '#4f3628',
  knit: '#3f5a4c', knitSh: '#2b4036', knitDeep: '#1f2f28', knitLit: '#7b9877',
  pants: '#36332f', pantsSh: '#242220',
};
const RIM = '#ffd49a';

// Têtes : dessinées de profil vers la droite (repère local, unités du décor)
const HEAD_A = [
  [18, 94], [16, 76], [17, 63], // 0-2 gorge
  [22, 57], [31, 53], [37, 49], // 3-5 sous la mâchoire
  [42, 44], [43, 38], // 6-7 menton
  [41, 35], [44, 31.5], [43.5, 29, 1], [45.5, 26], [44, 22.5], // 8-12 lèvres
  [46, 20], [51.5, 15.5], [50, 11], [45, 1], [42, -5], // 13-17 nez
  [43, -11], [41, -20], [37, -32], [30, -44], // 18-21 front
  [18, -55], [0, -61], [-20, -58], [-36, -47], // 22-25 crâne
  [-45, -30], [-47, -8], [-42, 14], [-33, 34], // 26-29 arrière
  [-26, 52], [-26, 70], [-28, 94], // 30-32 nuque
];
// Cheveux de A : tirés en arrière, chignon bas et lâche sur la nuque, l'oreille dégagée
const HAIR_A = [
  [31, -43], [34, -50], [25, -59], [8, -66], [-12, -66], [-31, -59], [-44, -46], // 0-6
  [-51, -27], [-52, -5], [-48, 13], // 7-9
  [-52, 21], [-62, 20], [-72, 28], [-75, 42], [-67, 54], [-52, 57], [-39, 51], // 10-16 chignon
  [-31, 43], [-25, 33], // 17-18
  [-15, 22], [-9, 13], [-7, 1], [-5, -10], // 19-22 derrière l'oreille
  [3, -18], [11, -25], [19, -32], [26, -38], // 23-26 tempe
];
const HEAD_B = [
  [18, 96], [16, 77], [17, 64],
  [24, 60], [34, 57], [41, 52],
  [45, 46], [46, 39],
  [44, 35], [46.5, 32], [45.5, 29.5, 1], [47.5, 26.5], [46, 23],
  [48, 21], [55.5, 16], [53.5, 10], [47, 0], [44, -6],
  [46.5, -11], [44, -21], [39, -34], [31, -46],
  [18, -57], [-1, -63], [-22, -60], [-38, -48],
  [-47, -30], [-49, -6], [-44, 16], [-35, 34],
  [-28, 52], [-30, 70], [-33, 96],
];
// Cheveux courts de B
const HAIR_B = [
  [32, -45], [36, -52], [27, -62], [8, -68], [-14, -68], [-33, -59], [-46, -45],
  [-52, -25], [-53, -3], [-49, 15], [-42, 29], [-35, 33], [-27, 24], [-18, 12],
  [-9, -4], [-1, -12], [7, -14], [11, -25], [18, -35], [26, -42],
];
// Barbe courte et soignée : favoris, joue basse, menton, moustache
const BEARD_B = [
  [7, -13], [12, -13], [14, -1], [17, 10], [25, 17], [34, 21], [42, 22], [47, 23.5], [48.2, 26.6],
  [44.5, 28.8], [44, 31], [45, 34.2], [46.8, 37], [47, 43], [44, 51], [37, 58], [26, 63], [15, 63],
  [7, 54], [3, 38], [3, 20], [4, 2],
];

// Oreille, œil, sourcil, lèvres : traits minimaux, à la Dudok de Wit
const ear = (c) => `<path d="M-5 -10 C1 -15 9 -13 11 -5 C13 4 9 14 3 17 C-1 19 -5 15 -5 8 Z" fill="${c.skin}"/>` +
  `<path d="M-5 -10 C1 -15 9 -13 11 -5 C13 4 9 14 3 17 C-1 19 -5 15 -5 8 Z" fill="${c.skinSh}" opacity=".45" transform="translate(1.5 1.5) scale(.82)"/>` +
  `<path d="M1 -6 C6 -7 8 -2 7 4 C6 8 4 10 2 10" stroke="${c.skinDeep}" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>`;

// A : un peu de chaleur sur la pommette ; narine et lèvres un ton sous la peau mate
function faceA() {
  return `
  <ellipse cx="29" cy="12" rx="10" ry="7" fill="#b2553c" opacity=".32" ${F_(4)}/>
  <path d="M27 -15 C31 -17.2 36 -17.4 41 -15.2" stroke="${CA.hairDeep}" stroke-width="2.3" fill="none" stroke-linecap="round" opacity=".85"/>
  <path d="M29.5 -6.4 C31.8 -2.4 35.8 -1.8 39 -4.4 C35.8 -4 32 -4.4 29.5 -6.4 Z" fill="#efe1d0" opacity=".85"/>
  <ellipse cx="35.8" cy="-3.3" rx="2.3" ry="1.8" fill="#24150f"/>
  <path d="M29 -6.8 C32 -4.8 35.8 -4.4 39.6 -5.4" stroke="#24150f" stroke-width="2.3" fill="none" stroke-linecap="round"/>
  <path d="M30 -9.6 C33 -10.6 36.4 -10.2 39 -8.6" stroke="#6b4232" stroke-width="1" fill="none" opacity=".5"/>
  <path d="M39.2 -5.4 L42 -4.2" stroke="#24150f" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M46 18.6 C47.2 17.4 48.8 17.4 49.6 18.4" stroke="#5a3424" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M37.6 29.4 L43.4 29" stroke="#55291f" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M39 30 C41 29.4 43.6 29.6 44 30.2 C44.4 32 42.6 33.4 40 33 Z" fill="#8e4a3b" opacity=".85"/>
  <path d="M40 26 C42 25.6 44.4 26 45 27 C44 28.2 41.8 28.6 40 28.4 Z" fill="#7f4033" opacity=".6"/>`;
}
function faceB() {
  return `
  <path d="M26 -16 C31 -19.4 37 -19.8 43 -17" stroke="${CB.hairDeep}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>
  <path d="M30.5 -7 C32.8 -2.8 37 -2.2 40.2 -4.9 C37 -4.5 33 -4.9 30.5 -7 Z" fill="#f1e4d6" opacity=".85"/>
  <ellipse cx="37" cy="-3.7" rx="2.3" ry="1.8" fill="#2a1a12"/>
  <path d="M30 -7.4 C33.2 -5.2 37 -4.8 40.8 -6" stroke="#2a1a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M31 -10.4 C34 -11.6 37.6 -11.2 40.4 -9.4" stroke="#8a5e48" stroke-width="1" fill="none" opacity=".5"/>
  <path d="M47.6 19.4 C49 18 51 18 52 19.2" stroke="#8a5a46" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M41.5 31 C43.4 30.4 45.6 30.8 46 31.6 C46 33.2 44 34 42 33.6 Z" fill="#b26e5e" opacity=".9"/>`;
}

// Une tête complète (peau, oreille, cheveux, barbe éventuelle, traits, lumière)
function tete(id, H, HA, c, tf, opts) {
  const { beard, face, earAt, bun } = opts;
  const cP = `a2-cuisine-c-peau-${id}`, cH = `a2-cuisine-c-chev-${id}`;
  let s = `<defs>
    <clipPath id="${cP}"><path d="${shape(H)}"/></clipPath>
    <clipPath id="${cH}"><path d="${shape(HA)}"/></clipPath>
    ${grad(`a2-cuisine-peau-${id}`, -40, -60, 50, 60, [[0, c.skinSh], [0.5, c.skin], [1, c.skinSh]])}
    ${opts.rimFront ? grad(`a2-cuisine-chev-${id}`, 40, -66, -40, 30, [[0, c.hairLit], [0.4, c.hair], [1, c.hairDeep]]) : grad(`a2-cuisine-chev-${id}`, -66, -50, 30, 10, [[0, c.hairLit], [0.4, c.hair], [1, c.hairDeep]])}
  </defs><g transform="${tf}">`;
  s += `<path d="${shape(H)}" fill="url(#a2-cuisine-peau-${id})"/>`;
  s += `<g clip-path="url(#${cP})">`;
  // ombre douce côté caméra (le jour vient de derrière), cou dans l'ombre du menton
  s += `<ellipse cx="-6" cy="10" rx="40" ry="52" fill="${c.skinSh}" opacity=".45" ${F_(10)}/>`;
  s += `<path d="M44 40 C30 58 0 62 -30 58 L-40 110 L40 110 Z" fill="${c.skinDeep}" opacity=".55" ${F_(4)}/>`;
  // rebond chaud du plateau ensoleillé : sous le menton, la joue, le dessous du nez
  s += `<ellipse cx="34" cy="30" rx="16" ry="20" fill="${c.skinLit}" opacity=".35" ${F_(6)}/>`;
  s += `<ellipse cx="30" cy="4" rx="10" ry="8" fill="${c.skinLit}" opacity=".2" ${F_(4)}/>`;
  s += '</g>';
  // liseré : la lumière vient de la gauche du cadre (dos de A, visage de B)
  s += opts.rimFront
    ? rim(arc(H, 6, 22), cP, 4.5, RIM, 1.2, 1) + rim(arc(H, 0, 3), cP, 6, RIM, 0, 2)
    : rim(arc(H, 27, 32), cP, 7, RIM, 1.2, 2);
  s += `<g transform="translate(${earAt[0]} ${earAt[1]})">${ear(c)}</g>`;
  if (beard) {
    s += `<path d="${shape(beard)}" fill="${c.beard}" ${F_(1)}/>`;
    s += `<g clip-path="url(#${cP})" opacity=".5">`;
    const r = rng(33);
    for (let i = 0; i < 70; i++) {
      const x = 6 + r() * 42, y = -8 + r() * 70;
      s += `<path d="M${f1(x)} ${f1(y)} l${f1(1 + r() * 2)} ${f1(2 + r() * 3)}" stroke="${r() < 0.5 ? c.hairDeep : '#8a6046'}" stroke-width=".9" opacity=".6"/>`;
    }
    s += '</g>';
    s += rim(arc(beard, 7, 17), cP, 3, '#f0c48e', 0, 1);
  }
  // cheveux
  s += `<path d="${shape(HA)}" fill="url(#a2-cuisine-chev-${id})"/>`;
  s += `<g clip-path="url(#${cH})" fill="none" stroke-linecap="round">`;
  const r = rng(id === 'a' ? 3 : 4);
  if (bun) {
    // longues mèches tirées du front et de la tempe vers le chignon
    for (let i = 0; i < 30; i++) {
      const u = r(), st = u < 0.5 ? [lerp(3, 26, u * 2), lerp(-18, -38, u * 2)] : [lerp(31, -10, u * 2 - 1), lerp(-44, -64, u * 2 - 1)];
      const en = [-56 + (r() - 0.5) * 14, 30 + (r() - 0.5) * 16];
      const mid = [(st[0] + en[0]) / 2, (st[1] + en[1]) / 2], nrm = norm([mid[0] + 5, mid[1] + 8]);
      const cp = [mid[0] + nrm[0] * 22, mid[1] + nrm[1] * 22];
      s += `<path d="M${xy(st)} Q${xy(cp)} ${xy(en)}" stroke="${r() < 0.15 ? '#7a5038' : c.hairDeep}" stroke-width="${f1(0.8 + r() * 1.2)}" opacity="${f1(0.3 + r() * 0.35)}"/>`;
    }
  } else {
    // cheveux courts : de petites touches couchées vers l'arrière
    for (let i = 0; i < 70; i++) {
      const a = -Math.PI * (0.05 + r() * 0.95), rr = 30 + r() * 30;
      const p0 = [-6 + Math.cos(a) * rr, -12 + Math.sin(a) * rr * 1.05];
      const t = [-Math.sin(a), Math.cos(a)], L = 5 + r() * 7;
      const dir = norm([-1 + 0.4 * t[0], 0.25 + 0.4 * t[1]]);
      s += `<path d="M${xy(p0)} l${f1(dir[0] * L)} ${f1(dir[1] * L)}" stroke="${r() < 0.35 ? c.hairLit : c.hairDeep}" stroke-width="${f1(1 + r())}" opacity="${f1(0.35 + r() * 0.3)}"/>`;
    }
  }
  if (bun) s += `<path d="M-56 25 C-70 26 -72 44 -60 51 M-62 30 C-68 38 -64 48 -54 51 M-50 24 C-60 30 -58 44 -48 52" stroke="${c.hairLit}" stroke-width="1.6" opacity=".55"/>`;
  s += '</g>';
  s += opts.rimFront
    ? rim(arc(HA, 18, 20) + ' ' + arc(HA, 0, 4), cH, 5, RIM, 1, 2)
    : rim(arc(HA, 3, 17), cH, 8, RIM, 1.8, 2);
  // mèches folles qui s'échappent et attrapent la lumière
  if (bun) s += stroke('M14 -27 C17 -13 15 1 11 15', c.hair, 1.2, 0.8) + stroke('M-64 52 C-62 62 -58 70 -53 76', '#e2a874', 1, 0.7) +
    stroke('M-48 -44 C-58 -36 -62 -24 -60 -12', '#e9b47e', 1, 0.7) + stroke('M-73 34 C-80 38 -82 46 -79 54', '#e9b47e', 1, 0.6);
  s += face();
  return s + '</g>';
}

// Corps de A : gilet en maille terre cuite ouvert sur un haut crème, pantalon crème
const TORSO_A = [
  [592, 531], [612, 538], [642, 541], // 0-2 encolure
  [653, 548], [663, 566], [669, 592], [670, 618], [665, 640], [662, 662], [666, 694], [671, 728], [675, 760], // 3-11 devant
  [692, 774], [750, 782], [812, 790], [818, 804], [800, 812], [690, 810], [600, 806], // 12-18 cuisses (sous la table)
  [578, 800], [568, 786], // 19-20 hanche
  [564, 750], [563, 700], [565, 652], [570, 610], [578, 574], [586, 548], // 21-26 dos
];
// A et B sont dessinés à leur place d'origine puis rapprochés de la table (DXA, DXB)
const DXA = 55, DXB = -65;
const ARM_A = { up: tube([[624, 558], [655, 584], [688, 610], [718, 630]], [25, 22, 20, 18]), fore: tube([[716, 634], [752, 637], [790, 639], [815, 640]], [18, 17, 16, 15]) };
const HAND_A = [[813, 627], [827, 624], [843, 626], [859, 631], [871, 636], [881, 641], [887, 646], [884, 650], [867, 651.5], [843, 652.5], [825, 653], [813, 651]];

// Corps de B : pull vert forêt ras du cou, pantalon sombre
const TORSO_B = [
  [1352, 530], [1322, 538], [1292, 542], // 0-2 encolure
  [1279, 548], [1267, 566], [1259, 594], [1256, 626], [1257, 660], [1259, 696], [1261, 730], [1258, 762], // 3-10 devant
  [1240, 776], [1180, 782], [1102, 790], [1096, 804], [1112, 812], [1220, 810], [1330, 806], // 11-17 cuisses
  [1358, 800], [1369, 786], // 18-19 hanche
  [1376, 750], [1378, 700], [1376, 650], [1370, 604], [1361, 568], [1353, 545], // 20-25 dos
];

// Jambe sous la table (cuisse vue dessous, tibia qui descend vers le parquet)
// Jambes sous la table, dans l'ombre : tibia, mollet, chaussure (dir : sens des pieds)
function jambe(kx, dir, col, colSh) {
  const one = (x, y0, c, lit) => {
    const X = (v) => f1(x + dir * v);
    return `<path d="M${X(22)} ${y0} C${X(26)} ${y0 + 60} ${X(16)} ${y0 + 150} ${X(10)} ${y0 + 232} L${X(-16)} ${y0 + 234} C${X(-22)} ${y0 + 170} ${X(-34)} ${y0 + 110} ${X(-30)} ${y0 + 50} C${X(-28)} ${y0 + 20} ${X(-20)} ${y0 + 4} ${X(-8)} ${y0 - 4} Z" fill="${c}"/>` +
      `<path d="M${X(22)} ${y0} C${X(26)} ${y0 + 60} ${X(16)} ${y0 + 150} ${X(10)} ${y0 + 232}" stroke="${lit}" stroke-width="5" fill="none" opacity=".45" ${F_(2)}/>` +
      `<path d="M${X(-20)} ${y0 + 228} C${X(-24)} ${y0 + 246} ${X(-16)} ${y0 + 254} ${X(6)} ${y0 + 254} L${X(44)} ${y0 + 252} C${X(50)} ${y0 + 240} ${X(30)} ${y0 + 230} ${X(10)} ${y0 + 226} Z" fill="#2a221e"/>`;
  };
  return one(kx - dir * 26, 792, colSh, col) + one(kx, 800, colSh, col);
}

function corpsA() {
  const cT = 'a2-cuisine-c-torseA', cU = 'a2-cuisine-c-brasA', cF = 'a2-cuisine-c-avbrasA', cM = 'a2-cuisine-c-mainA';
  let s = `<defs>
    <clipPath id="${cT}"><path d="${shape(TORSO_A)}"/></clipPath>
    <clipPath id="${cU}"><path d="${shape(ARM_A.up)}"/></clipPath>
    <clipPath id="${cF}"><path d="${shape(ARM_A.fore)}"/></clipPath>
    <clipPath id="${cM}"><path d="${shape(HAND_A)}"/></clipPath>
    ${grad('a2-cuisine-giletA', 560, 0, 680, 0, [[0, CA.knitLit], [0.16, CA.knit], [0.6, CA.knitSh], [1, CA.knitDeep]])}
    ${grad('a2-cuisine-mancheA', 0, 548, 0, 660, [[0, CA.knitLit], [0.3, CA.knit], [1, CA.knitSh]])}
    ${grad('a2-cuisine-mainA', 0, 622, 0, 654, [[0, CA.skinLit], [0.35, CA.skin], [1, CA.skinSh]])}
  </defs>`;
  s = `<g transform="translate(${DXA} 0)">` + s;
  s += jambe(800, 1, '#857a69', '#554b41');
  // la tête d'abord : le col du gilet passe devant le cou
  s += tete('a', HEAD_A, HAIR_A, CA, 'translate(628 452) rotate(7)', { face: faceA, earAt: [2, 3], bun: true, rimFront: false });
  s += `<path d="${shape(TORSO_A)}" fill="url(#a2-cuisine-giletA)"/>`;
  s += `<g clip-path="url(#${cT})">`;
  // pantalon crème, à l'ombre de la table
  s += `<path d="M560 794 C640 794 720 790 830 792 L830 840 L560 840 Z" fill="${CA.pantsSh}"/>`;
  s += `<path d="M560 794 C640 794 720 790 830 792 L830 798 C720 796 640 800 560 800 Z" fill="${CA.pants}" opacity=".5"/>`;
  // maille : plaques de brosse, côtes verticales très douces
  s += `<rect x="555" y="525" width="130" height="250" fill="${CA.knitLit}" opacity=".22" filter="url(#a2-cuisine-br3)"/>`;
  s += `<rect x="555" y="525" width="130" height="250" fill="${CA.knitDeep}" opacity=".3" filter="url(#a2-cuisine-br1)"/>`;
  for (let x = 570; x < 676; x += 7) s += stroke(`M${x} 552 C${x + 2} 620 ${x - 1} 690 ${x + 1} 742`, CA.knitDeep, 1.2, 0.18);
  // le haut crème dans l'ouverture du gilet, bord du gilet, trois boutons
  s += `<path d="M640 541 C652 548 662 566 669 592 C672 612 668 632 663 646 L654 644 C658 626 660 606 656 590 C650 568 642 552 632 544 Z" fill="${CA.top}"/>`;
  s += `<path d="M632 544 C642 552 650 568 656 590 C660 606 658 626 654 644 C652 668 656 700 660 742" stroke="${CA.knitDeep}" stroke-width="3" fill="none" opacity=".55"/>`;
  for (const y of [668, 694, 720]) s += `<circle cx="${f1(657 + (y - 668) * 0.08)}" cy="${y}" r="3" fill="#e9dcc4"/><circle cx="${f1(656.4 + (y - 668) * 0.08)}" cy="${y - 0.8}" r="1.1" fill="#fff" opacity=".6"/>`;
  // bord-côte du gilet sur les hanches
  s += `<path d="M560 764 C600 768 640 770 690 774 L700 796 C640 796 600 796 560 794 Z" fill="${CA.knitSh}"/>`;
  for (let x = 566; x < 698; x += 6) s += stroke(`M${x} 768 L${x + 1} 794`, CA.knitDeep, 1.4, 0.5);
  // ombre du bras proche sur le flanc ; la lumière qui enveloppe le dos
  s += `<path d="M610 580 C640 610 690 630 740 650 L740 690 C680 670 630 650 600 620 Z" fill="${CA.knitDeep}" opacity=".45" ${F_(6)}/>`;
  s += stroke('M584 552 C572 600 566 660 566 740', '#f0b98e', 16, 0.35, 10);
  s += '</g>';
  s += rim(arc(TORSO_A, 19, 28), cT, 7, RIM, 1.4, 2);
  s += rim(arc(TORSO_A, 0, 3), cT, 5, RIM, 1, 2);
  // bras proche : manche du gilet, coude posé sur la table
  s += `<path d="${shape(ARM_A.up)}" fill="${CA.knitDeep}" opacity=".5" transform="translate(4 4)" ${F_(3)}/>`;
  s += `<path d="${shape(ARM_A.up)}" fill="url(#a2-cuisine-mancheA)"/>`;
  s += `<g clip-path="url(#${cU})">`;
  s += `<rect x="600" y="540" width="170" height="110" fill="${CA.knitDeep}" opacity=".28" filter="url(#a2-cuisine-br2)"/>`;
  s += stroke('M630 590 C656 612 680 630 712 648', CA.knitDeep, 8, 0.35, 4);
  s += stroke('M676 592 C684 602 688 610 688 620', CA.knitDeep, 2.4, 0.4, 1);
  s += stroke('M696 604 C704 612 706 620 704 628', CA.knitDeep, 2.4, 0.4, 1);
  s += '</g>';
  s += rim(open([[612, 538], [636, 548], [662, 568], [690, 590], [720, 612]]), cU, 7, RIM, 1.4, 2);
  s += `<path d="${shape(ARM_A.fore)}" fill="url(#a2-cuisine-mancheA)"/>`;
  s += `<g clip-path="url(#${cF})">`;
  s += stroke('M728 640 C758 646 788 650 814 650', CA.knitDeep, 8, 0.4, 3);
  s += `<path d="M798 620 L818 620 L818 658 L798 658 Z" fill="${CA.knitSh}"/>`;
  for (let x = 800; x < 818; x += 4) s += stroke(`M${x} 622 L${x} 656`, CA.knitDeep, 1.2, 0.5);
  s += '</g>';
  s += rim(open([[716, 615], [752, 620], [792, 622], [816, 624]]), cF, 6, RIM, 1.2, 2);
  // la main, posée à plat, dans le soleil
  s += `<path d="${shape(HAND_A)}" fill="url(#a2-cuisine-mainA)"/>`;
  s += `<g clip-path="url(#${cM})">`;
  s += stroke('M829 650 C847 650 865 650 881 648', CA.skinDeep, 4, 0.45, 2);
  s += stroke('M865 640 C869 644 871 648 872 651', CA.skinSh, 1.2, 0.7);
  s += stroke('M875 642 C878 645 879 648 879 651', CA.skinSh, 1.2, 0.6);
  s += '</g>';
  s += rim(open([[815, 626], [829, 623], [845, 626], [861, 631], [875, 638], [885, 644]]), cM, 4, '#ffe2b8', 1, 1);
  return s + '</g>';
}

function corpsB() {
  const cT = 'a2-cuisine-c-torseB';
  let s = `<defs>
    <clipPath id="${cT}"><path d="${shape(TORSO_B)}"/></clipPath>
    ${grad('a2-cuisine-pullB', 1250, 0, 1380, 0, [[0, CB.knitLit], [0.14, CB.knit], [0.6, CB.knitSh], [1, CB.knitDeep]])}
  </defs>`;
  s = `<g transform="translate(${DXB} 0)">` + s;
  s += jambe(1108, -1, '#3a3532', '#1c1918');
  s += tete('b', HEAD_B, HAIR_B, CB, 'translate(1300 450) scale(-1 1) rotate(7)', { face: faceB, earAt: [0, 2], beard: BEARD_B, rimFront: true });
  s += `<path d="${shape(TORSO_B)}" fill="url(#a2-cuisine-pullB)"/>`;
  s += `<g clip-path="url(#${cT})">`;
  s += `<path d="M1090 772 C1180 776 1260 772 1380 770 L1380 840 L1090 840 Z" fill="${CB.pants}"/>`;
  s += `<rect x="1245" y="525" width="140" height="250" fill="${CB.knitLit}" opacity=".2" filter="url(#a2-cuisine-br3)"/>`;
  s += `<rect x="1245" y="525" width="140" height="250" fill="${CB.knitDeep}" opacity=".35" filter="url(#a2-cuisine-br1)"/>`;
  // col rond en côtes, bord-côte à la taille
  s += `<path d="M1288 540 C1306 534 1330 532 1354 528 L1356 542 C1332 546 1308 550 1290 554 Z" fill="${CB.knitSh}"/>`;
  s += stroke('M1290 548 C1310 543 1332 540 1355 536', CB.knitDeep, 1.4, 0.7);
  s += `<path d="M1254 742 C1300 746 1340 746 1380 744 L1380 772 C1340 774 1300 774 1252 770 Z" fill="${CB.knitSh}"/>`;
  for (let x = 1256; x < 1380; x += 6) s += stroke(`M${x} 746 L${x - 1} 772`, CB.knitDeep, 1.4, 0.55);
  // plis du pull, la poitrine prend le soleil, le dos reste dans l'ombre
  s += stroke('M1262 600 C1270 650 1268 700 1262 740', '#f2c48c', 18, 0.32, 10);
  s += stroke('M1280 700 C1310 712 1340 716 1370 712', CB.knitDeep, 5, 0.4, 3);
  s += stroke('M1270 650 C1296 664 1320 668 1344 664', CB.knitDeep, 4, 0.35, 3);
  s += '</g>';
  s += rim(arc(TORSO_B, 2, 11), cT, 8, RIM, 1.6, 2);
  s += rim(arc(TORSO_B, 23, 27), cT, 4, '#a5b49a', 0, 3);
  return s + '</g>';
}

// La table cache le bas des corps : on évide le calque du chant et des pieds proches
const TABLE_FRONT = (() => {
  const { x0, x1, z1, y, th } = TAB;
  const d = (a) => 'M' + scr(a).map(xy).join(' L') + ' Z';
  // le plateau (partie proche, devant leur ventre), le chant, la ceinture
  let s = d([[x0, y, ZC + 0.07], [x1, y, ZC + 0.07], [x1, y, z1], [x1, y - th - 0.09, z1], [x0, y - th - 0.09, z1], [x0, y, z1]]);
  for (const [x, z] of LEGS.slice(2)) s += ' ' + d(quadZ(z + 0.03, x - 0.03, x + 0.03, -0.2, y - th - 0.09));
  return s;
})();

const COUPLE = `
<defs>
  ${FX}
  <clipPath id="a2-cuisine-c-table"><path clip-rule="evenodd" d="M300 300 L1500 300 L1500 1260 L300 1260 Z ${TABLE_FRONT}"/></clipPath>
</defs>
<g clip-path="url(#a2-cuisine-c-table)">
  ${corpsA()}
  ${corpsB()}
</g>
`;

/* ==========================================================================
   Calque « bras » : le bras proche de B, en trois pièces (bras, avant-bras,
   main) rangées l'une sous l'autre dans le calque. Au rendu, chaque pièce est
   découpée puis remise en place. Au repos, l'avant-bras de B est un peu tourné
   vers nous (raccourci) ; en tendant la main, il pivote vers A et s'allonge.
   ========================================================================== */
const S0 = [1245, 556], E0 = [1150, 636], W0 = [1030, 638]; // épaule, coude, poignet (dessin)
const L_UP = Math.hypot(E0[0] - S0[0], E0[1] - S0[1]), L_FO = W0[0] - E0[0];
const HIP_B = [1307, 800];                 // pivot de B quand il se penche
const OFF = { fore: 200, hand: 330 };      // décalage vertical des pièces dans le calque
const BAND = { up: [500, 740], fore: [740, 900], hand: [900, 1020] };

const UP_B = tube([[1250, 550], [1218, 578], [1184, 606], [1152, 632]], [29, 25, 22, 20]);
const FORE_B = tube([[1150, 636], [1110, 637], [1068, 638], [1032, 638]], [20, 19, 17, 16]);
const HAND_B = [[1030, 625], [1014, 622], [998, 624], [982, 629], [970, 634], [959, 640], [953, 645], [956, 649], [974, 650.5], [998, 651.5], [1016, 652.5], [1030, 651]];
const shift = (a, dy) => a.map(([x, y]) => [x, y + dy]);

function brasB() {
  const F = shift(FORE_B, OFF.fore), H = shift(HAND_B, OFF.hand), oh = OFF.hand, of = OFF.fore;
  const cU = 'a2-cuisine-c-brasB', cF = 'a2-cuisine-c-avbrasB', cM = 'a2-cuisine-c-mainB';
  let s = `<defs>${FX}
    <clipPath id="${cU}"><path d="${shape(UP_B)}"/></clipPath>
    <clipPath id="${cF}"><path d="${shape(F)}"/></clipPath>
    <clipPath id="${cM}"><path d="${shape(H)}"/></clipPath>
    ${grad('a2-cuisine-mancheB', 0, 520, 0, 662, [[0, CB.knitLit], [0.28, CB.knit], [1, CB.knitDeep]])}
    ${grad('a2-cuisine-mancheB2', 0, 615 + of, 0, 657 + of, [[0, CB.knitLit], [0.35, CB.knit], [1, CB.knitDeep]])}
    ${grad('a2-cuisine-mainB', 0, 620 + oh, 0, 654 + oh, [[0, CB.skinLit], [0.4, CB.skin], [1, CB.skinSh]])}
  </defs>`;
  // la main (dessous : le poignet du pull la recouvre)
  s += `<path d="${shape(H)}" fill="url(#a2-cuisine-mainB)"/>`;
  s += `<g clip-path="url(#${cM})">`;
  s += stroke(`M962 ${648 + oh} C982 ${650 + oh} 1002 ${651 + oh} 1026 ${651 + oh}`, CB.skinDeep, 4, 0.4, 2);
  s += stroke(`M974 ${640 + oh} C970 ${644 + oh} 968 ${648 + oh} 967 ${651 + oh}`, CB.skinSh, 1.2, 0.7);
  s += stroke(`M964 ${642 + oh} C961 ${645 + oh} 960 ${648 + oh} 960 ${651 + oh}`, CB.skinSh, 1.2, 0.6);
  s += '</g>';
  s += rim(open(shift([[1028, 624], [1012, 621], [996, 624], [980, 630], [966, 637], [955, 644]], oh)), cM, 4, '#ffe6c0', 1, 1);
  // l'avant-bras (manche du pull), poignet côtelé
  s += `<path d="${shape(F)}" fill="url(#a2-cuisine-mancheB2)"/>`;
  s += `<g clip-path="url(#${cF})">`;
  s += `<rect x="1020" y="${600 + of}" width="150" height="60" fill="${CB.knitDeep}" opacity=".3" filter="url(#a2-cuisine-br2)"/>`;
  s += stroke(`M1042 ${652 + of} C1080 ${654 + of} 1120 ${652 + of} 1152 ${650 + of}`, CB.knitDeep, 8, 0.45, 3);
  s += `<path d="M1022 ${615 + of} L1046 ${615 + of} L1046 ${660 + of} L1022 ${660 + of} Z" fill="${CB.knitSh}"/>`;
  for (let x = 1025; x < 1046; x += 4) s += stroke(`M${x} ${618 + of} L${x} ${658 + of}`, CB.knitDeep, 1.2, 0.55);
  s += stroke(`M1074 ${624 + of} C1078 ${632 + of} 1078 ${640 + of} 1074 ${648 + of}`, CB.knitDeep, 2.2, 0.4, 1);
  s += '</g>';
  s += rim(open(shift([[1152, 616], [1110, 618], [1068, 621], [1028, 622]], of)), cF, 6, RIM, 1.3, 2);
  // le bras (épaule → coude)
  s += `<path d="${shape(UP_B)}" fill="url(#a2-cuisine-mancheB)"/>`;
  s += `<g clip-path="url(#${cU})">`;
  s += `<rect x="1110" y="520" width="180" height="140" fill="${CB.knitDeep}" opacity=".3" filter="url(#a2-cuisine-br2)"/>`;
  s += stroke('M1240 600 C1210 616 1180 632 1150 650', CB.knitDeep, 9, 0.4, 4);
  s += stroke('M1196 594 C1190 604 1188 614 1190 622', CB.knitDeep, 2.4, 0.4, 1);
  s += stroke('M1172 606 C1164 614 1162 622 1164 630', CB.knitDeep, 2.4, 0.4, 1);
  s += '</g>';
  s += rim(open([[1256, 523], [1232, 534], [1206, 554], [1178, 582], [1150, 612]]), cU, 7, RIM, 1.5, 2);
  return s;
}
const BRAS = brasB();

const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const dAng = (x) => Math.atan2(Math.sin(x), Math.cos(x));
const rotAbout = (p, c, t) => [c[0] + (p[0] - c[0]) * Math.cos(t) - (p[1] - c[1]) * Math.sin(t), c[1] + (p[0] - c[0]) * Math.sin(t) + (p[1] - c[1]) * Math.cos(t)];

// Pose de B pour un geste donné : buste penché, épaule avancée, coude qui glisse,
// poignet qui avance sur la table (l'avant-bras se déplie : il s'allonge à l'écran)
function poseB(reach, T) {
  const lean = -0.06 * reach;
  const breath = Math.sin((T * TAU) / 4.4 + 1.3);
  const S = rotAbout(S0, HIP_B, lean);
  S[0] += -18 * reach; S[1] += 2 * reach - 1 * breath;
  const goal = [lerp(E0[0], E0[0] - 24, reach), E0[1]];
  const u = norm([goal[0] - S[0], goal[1] - S[1]]);
  const E = [S[0] + u[0] * L_UP, S[1] + u[1] * L_UP];
  const W = [lerp(1060, 1001, reach), W0[1] - 1.5 * reach];
  return { lean, breath, S, E, W, sxF: Math.hypot(W[0] - E[0], W[1] - E[1]) / -L_FO, sxH: lerp(0.86, 1, reach) };
}

/* ==========================================================================
   Calque « premier » : au premier plan, en bas à gauche, les grandes feuilles
   floues d'une plante posée au sol, tout près de nous
   ========================================================================== */
const PREMIER = (() => {
  const r = rng(12);
  let s = `<defs>${grad('a2-cuisine-feuille', -200, 0, 420, 0, [[0, '#26331f'], [0.6, '#33452b'], [1, '#4b6338']])}</defs>`;
  const L = [[-60, 1180, -70, 520, 120], [60, 1200, -40, 600, 110], [150, 1220, -20, 440, 95], [-150, 1100, -95, 470, 110], [240, 1240, 5, 360, 80]];
  for (const [x, y, a, len, w] of L) {
    const t = (a * Math.PI) / 180, tip = [x + Math.cos(t) * len, y + Math.sin(t) * len];
    const m = [(x + tip[0]) / 2, (y + tip[1]) / 2], n = [-Math.sin(t) * w, Math.cos(t) * w];
    s += `<path d="M${x} ${y} Q${f1(m[0] + n[0])} ${f1(m[1] + n[1])} ${xy(tip)} Q${f1(m[0] - n[0])} ${f1(m[1] - n[1])} ${x} ${y} Z" fill="url(#a2-cuisine-feuille)"/>`;
    s += `<path d="M${x} ${y} Q${f1(m[0] + n[0] * 0.1)} ${f1(m[1] + n[1] * 0.1)} ${xy(tip)}" stroke="#6f8a52" stroke-width="5" fill="none" opacity=".5"/>`;
    s += `<path d="M${x} ${y} Q${f1(m[0] + n[0] * 0.95)} ${f1(m[1] + n[1] * 0.95)} ${xy(tip)}" stroke="#c9b06a" stroke-width="7" fill="none" opacity="${f1(0.25 + r() * 0.2)}"/>`;
  }
  return s;
})();

/* ==========================================================================
   Lumière (procédurale) : taches de soleil, faisceaux, poussière, vapeur
   ========================================================================== */
const polyPath = (c, a) => { c.moveTo(a[0][0], a[0][1]); for (let i = 1; i < a.length; i++) c.lineTo(a[i][0], a[i][1]); c.closePath(); };
const onFloor = (q) => clip(clip(clip(q.map(toY(0)), (p) => RW - p[0]), (p) => p[0]), (p) => NEAR - p[2]);

// Volumes qui portent ombre (le couple, les chaises, la table, les tasses)
const CASTERS = [
  box(1.31, 1.66, 0.45, 1.03, 2.86, 3.14), box(1.38, 1.59, 1.03, 1.3, 2.93, 3.08), box(1.66, 2.11, 0.77, 0.84, 2.98, 3.05),
  box(2.62, 2.95, 0.45, 1.03, 2.86, 3.14), box(2.67, 2.87, 1.03, 1.3, 2.93, 3.08), box(2.22, 2.92, 0.02, 0.55, 2.86, 3.14),
  box(1.26, 1.32, 0.46, 0.9, 2.8, 3.2), box(2.97, 3.03, 0.46, 0.9, 2.8, 3.2),
  box(TAB.x0, TAB.x1, TAB.y - TAB.th - 0.09, TAB.y, TAB.z0, TAB.z1),
  ...LEGS.map(([x, z]) => box(x - 0.03, x + 0.03, 0, TAB.y, z - 0.03, z + 0.03)),
];
const CUP_BOX = CUPS.map((c) => box(c.X - CUP_R * 0.8, c.X + CUP_R * 0.8, TAB.y, TAB.y + CUP_H, c.Z - CUP_R * 0.8, c.Z + CUP_R * 0.8));

let SUNP = null;
function sunPaths() {
  if (SUNP) return SUNP;
  const mk = () => { const h = new Path2D(); h.rect(-400, -300, 2800, 1800); return h; };
  const add = (path, a) => { if (a.length > 2) polyPath(path, scr(a)); };
  const table = { lit: new Path2D(), holes: mk() }, sol = { lit: new Path2D(), holes: mk() };
  for (const q of PANES_L) {
    add(table.lit, clip(clip(clip(clip(q.map(toY(TAB.y)), (p) => p[0] - TAB.x0), (p) => TAB.x1 - p[0]), (p) => p[2] - TAB.z0), (p) => TAB.z1 - p[2]));
    add(sol.lit, onFloor(q));
  }
  for (const b of CASTERS.slice(0, 3)) add(table.holes, onTable(b));
  for (const b of CUP_BOX) add(table.holes, onTable(b));
  for (const b of CASTERS) add(sol.holes, clip(hull(b.map(toY(0)), 0, 2), (p) => NEAR - p[2]));
  // faisceaux : pour chaque vitre, l'enveloppe entre la vitre et l'endroit où la lumière se pose
  const shafts = PANES_L.map((q) => {
    const land = q.map((p) => {
      const kt = (p[1] - TAB.y) / -SUN[1], xt = p[0] + SUN[0] * kt;
      const k = xt >= TAB.x0 && xt <= TAB.x1 ? kt : Math.min(p[1] / -SUN[1], (RW - p[0]) / SUN[0]);
      return [p[0] + SUN[0] * k, p[1] + SUN[1] * k, p[2] + SUN[2] * k];
    });
    const a = scr(q), b = scr(land);
    const ca = a.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4], [0, 0]), cb = b.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4], [0, 0]);
    const p = new Path2D();
    polyPath(p, hull([...a, ...b].map(([x, y]) => [x, y, 0]), 0, 1));
    return { p, a: ca, b: cb, row: PANES_L.indexOf(q) % 3 };
  });
  return (SUNP = { table, sol, shafts });
}

// Tache de soleil adoucie : masque (lumière moins ombres) peint hors champ, puis reposé flou
let BUF = null;
function tache(c, part, T, warm, k, flicker) {
  const W = c.canvas.width, H = c.canvas.height;
  if (!BUF || BUF.width !== W || BUF.height !== H) { BUF = document.createElement('canvas'); BUF.width = W; BUF.height = H; }
  const b = BUF.getContext('2d');
  const m = c.getTransform();
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.globalCompositeOperation = 'source-over';
  b.clearRect(0, 0, W, H);
  b.setTransform(m);
  b.save(); b.clip(part.holes, 'evenodd'); b.fillStyle = '#fff'; b.fill(part.lit); b.restore();
  // les feuilles de l'arbre, dehors, bougent : quelques ombres mouvantes dans la tache
  if (flicker) {
    b.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 7; i++) {
      const x = 860 + 260 * Math.sin(i * 2.1) + 26 * Math.sin(T * 0.45 + i * 1.7) + 12 * Math.sin(T * 1.1 + i);
      const y = 640 + 40 * Math.cos(i * 1.3) + 4 * Math.sin(T * 0.6 + i * 2.3);
      const r = 26 + 14 * Math.sin(i * 3.7);
      const g = b.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${0.32 + 0.12 * Math.sin(T * 0.8 + i)})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      b.fillStyle = g;
      b.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  }
  const off = 4 * W, bl = 5 * m.a;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.shadowOffsetX = off; c.shadowBlur = bl;
  c.globalCompositeOperation = 'multiply';
  c.shadowColor = `rgba(255,${warm[0]},${warm[1]},${0.55 * k})`;
  c.drawImage(BUF, -off, 0);
  c.globalCompositeOperation = 'screen';
  c.shadowColor = `rgba(255,228,176,${0.95 * k})`;
  c.drawImage(BUF, -off, 0);
  c.restore();
}

// Faisceaux dans l'air, poussière qui danse dedans
const MOTES = (() => {
  const r = rng(404);
  return Array.from({ length: 120 }, () => ({ q: Math.floor(r() * 6), u: r(), v: r(), k: r(), ph: r() * TAU, sp: 0.12 + r() * 0.25, s: 0.6 + r() * r() * 1.8 }));
})();
function faisceaux(c, T) {
  const { shafts } = sunPaths();
  c.globalCompositeOperation = 'screen';
  const br = 1 + 0.07 * Math.sin(T * 0.5) + 0.03 * Math.sin(T * 1.3);
  for (const s of shafts) {
    const a0 = s.row === 1 ? 0.24 : 0.14;
    const g = c.createLinearGradient(s.a[0], s.a[1], s.b[0], s.b[1]);
    g.addColorStop(0, `rgba(255,232,190,${a0 * br})`);
    g.addColorStop(0.5, `rgba(255,224,178,${a0 * 0.45 * br})`);
    g.addColorStop(1, 'rgba(255,220,170,0.01)');
    c.fillStyle = g;
    c.fill(s.p);
  }
  for (const m of MOTES) {
    const q = PANES_L[m.q];
    const p0 = [0, lerp(q[0][1], q[2][1], m.v), lerp(q[0][2], q[1][2], m.u)];
    const kmax = Math.min(p0[1] / -SUN[1], (RW - 0.2) / SUN[0]);
    const k = (0.05 + 0.85 * m.k) * kmax + 0.06 * Math.sin(T * m.sp + m.ph);
    const p = [p0[0] + SUN[0] * k + 0.03 * Math.sin(T * 0.21 + m.ph), p0[1] + SUN[1] * k + 0.03 * Math.sin(T * m.sp * 0.9 + m.ph * 1.3) + 0.004 * T, p0[2] + SUN[2] * k];
    const [x, y] = pr(p[0], p[1], p[2]);
    const tw = 0.5 + 0.5 * Math.sin(T * (0.7 + m.sp * 2) + m.ph * 3);
    const a = (0.25 + 0.75 * tw * tw) * (1 - 0.5 * m.k);
    const rr = m.s * 1.3 * (kz(p[2]) / 380);
    c.fillStyle = `rgba(255,236,200,${0.18 * a})`;
    c.beginPath(); c.arc(x, y, rr * 2.6, 0, TAU); c.fill();
    c.fillStyle = `rgba(255,250,232,${0.7 * a})`;
    c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill();
  }
}

// Vapeur des tasses : de fines volutes qui montent, s'élargissent et se défont ;
// elles s'allument en traversant le soleil
function vapeur(c, T) {
  c.globalCompositeOperation = 'screen';
  c.lineCap = 'round';
  CUPS.forEach((cup, ci) => {
    const [tx, ty] = cupTop(cup), w = CUP_R * kz(cup.Z);
    for (let j = 0; j < 3; j++) {
      const ph = ci * 2.3 + j * 2.1, H = 150 + 40 * Math.sin(ph * 1.7);
      const life = 0.55 + 0.45 * Math.sin(T * 0.37 + ph); // chaque volute s'épaissit et s'éteint
      let px = tx + (j - 1) * w * 0.4, py = ty - 2;
      for (let i = 1; i <= 26; i++) {
        const u = i / 26, h = u * H;
        const amp = 2 + 16 * Math.pow(u, 1.3);
        const x = tx + (j - 1) * w * 0.4 * (1 - u) + 14 * u * u +
          amp * Math.sin(h * 0.045 - T * 1.15 + ph) + amp * 0.45 * Math.sin(h * 0.09 - T * 0.7 + ph * 2);
        const y = ty - 2 - h;
        const a = 0.28 * life * Math.min(1, u * 6) * Math.pow(1 - u, 1.3);
        c.strokeStyle = `rgba(255,246,228,${a * 0.45})`;
        c.lineWidth = 6 + 16 * u;
        c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke();
        c.strokeStyle = `rgba(255,250,238,${a})`;
        c.lineWidth = 1.6 + 4 * u;
        c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke();
        px = x; py = y;
      }
    }
  });
}

// Ombres de contact des avant-bras et des mains sur le plateau
function contact(c, pose) {
  c.globalCompositeOperation = 'multiply';
  c.lineCap = 'round';
  const seg2 = (a, b, w, al) => { c.strokeStyle = `rgba(96,66,44,${al})`; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
  for (const [w, al] of [[20, 0.1], [12, 0.16], [6, 0.22]]) {
    seg2([776, 652], [938, 652], w, al);                  // A
    seg2([pose.W[0] - 70 * pose.sxH, 652], [Math.min(1150, pose.E[0]), 652], w, al);
  }
}

// Halo de la fenêtre, rebond chaud de la table sur les visages, étalonnage
function ambiances(c) {
  c.globalCompositeOperation = 'screen';
  const glow = (x, y, r, rgb, a) => {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  glow(180, 260, 420, '255,232,190', 0.3);
  glow(120, 120, 260, '255,248,230', 0.25);
  glow(960, 650, 300, '255,206,150', 0.12);
  glow(722, 478, 120, '255,200,140', 0.08);
  glow(1196, 478, 120, '255,200,140', 0.1);
}
function etalonnage(c, W, H) {
  c.globalCompositeOperation = 'multiply';
  const g = c.createLinearGradient(0, 0, W, H * 0.6);
  g.addColorStop(0, 'rgb(255,248,236)');
  g.addColorStop(1, 'rgb(216,214,232)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'screen';
  const l = c.createRadialGradient(-W * 0.05, H * 0.1, 0, -W * 0.05, H * 0.1, W * 0.5);
  l.addColorStop(0, 'rgba(255,214,160,0.34)');
  l.addColorStop(1, 'rgba(255,214,160,0)');
  c.fillStyle = l;
  c.fillRect(0, 0, W, H);
}

/* ==========================================================================
   Le décor
   ========================================================================== */
const XCUT = 990; // sépare A et B dans le calque « couple »
export default {
  id: 'a2-cuisine',
  bg: '#1d1a18',
  home: { x: 960, y: 540, z: 1 },
  layers: {
    fond: { box: [-240, -140, 2400, 1360], svg: FOND, filters: ['paint', 'soft'], par: 0.94 },
    table: { box: [300, -140, 1400, 1360], svg: TABLE, filters: ['paint'] },
    objets: { box: [780, 520, 400, 160], svg: OBJETS, filters: ['ink'], res: 1.6 },
    couple: { box: [440, 360, 1000, 760], svg: COUPLE, filters: ['paint'], res: 1.3 },
    bras: { box: [930, 500, 430, 520], svg: BRAS, filters: ['paint'], res: 1.3 },
    premier: { box: [-300, 560, 800, 760], svg: PREMIER, filters: ['b16'], par: 1.35, res: 0.6 },
  },

  render(g, p, T) {
    const reach = clamp(p.reach ?? 0);
    const pose = poseB(reach, T);
    const brA = Math.sin((T * TAU) / 4.8);
    const sp = sunPaths();

    g.img('fond');
    g.fx(1, (c) => tache(c, sp.sol, T, [170, 96], 0.75, false));
    g.img('table');
    g.fx(1, (c) => tache(c, sp.table, T, [182, 104], 1, true));
    g.img('objets');
    g.fx(1, (c) => contact(c, pose));
    // A : respiration lente ; B : respiration, il se penche vers elle
    g.img('couple', { tf: { sy: 1 + 0.004 * brA, ox: 655, oy: 800 }, clip: (c) => { c.beginPath(); c.rect(300, 300, XCUT - 300, 1000); } });
    g.img('couple', { tf: { rot: pose.lean, sy: 1 + 0.004 * pose.breath, ox: HIP_B[0], oy: HIP_B[1] }, clip: (c) => { c.beginPath(); c.rect(XCUT, 300, 600, 1000); } });
    // le bras de B : main, avant-bras, bras (chaque pièce découpée dans sa bande du calque)
    const band = (b) => (c) => { c.beginPath(); c.rect(900, b[0], 500, b[1] - b[0]); };
    const aF = dAng(ang(pose.E, pose.W) - ang(E0, W0));
    g.img('bras', { tf: { ox: W0[0], oy: W0[1] + OFF.hand, x: pose.W[0] - W0[0], y: pose.W[1] - W0[1] - OFF.hand, rot: 0.1 * aF, sx: pose.sxH }, clip: band(BAND.hand) });
    g.img('bras', { tf: { ox: E0[0], oy: E0[1] + OFF.fore, x: pose.E[0] - E0[0], y: pose.E[1] - E0[1] - OFF.fore, rot: aF, sx: pose.sxF }, clip: band(BAND.fore) });
    g.img('bras', { tf: { ox: S0[0], oy: S0[1], x: pose.S[0] - S0[0], y: pose.S[1] - S0[1], rot: dAng(ang(pose.S, pose.E) - ang(S0, E0)) }, clip: band(BAND.up) });
    g.fx(1, (c) => { faisceaux(c, T); vapeur(c, T); ambiances(c); });
    g.img('premier');
    g.screen((c, W, H) => etalonnage(c, W, H));
    // finition : un peu de densité dans les valeurs, comme une pellicule
    g.screen((c) => { c.globalCompositeOperation = 'soft-light'; c.globalAlpha = 0.3; c.drawImage(c.canvas, 0, 0); });
  },

  shots: {
    // Plan large : lent travelling latéral ; la vapeur monte, B tend lentement la main vers celle de A
    large: {
      dur: 6.5,
      cam: (t, portrait) => {
        const k = 0.5 * clamp(t / 6.5) + 0.5 * ease.inOut(clamp(t / 6.5));
        return portrait
          ? { x: lerp(972, 946, k), y: 528, z: lerp(1.04, 1.07, k) }
          : { x: lerp(1000, 925, k), y: 532, z: lerp(1.01, 1.035, k) };
      },
      p: (t) => ({ reach: seg(t, 1.0, 5.9, ease.inOut) }),
    },
  },
};
