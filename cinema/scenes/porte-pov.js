/* ==========================================================================
   Décor « porte-pov » — vue subjective (variante D) : c'est le joueur qui
   entre. Du couloir éclairé par une lampe, notre main droite pousse la porte
   entrouverte ; le battant pivote et découvre la chambre dorée ; on avance,
   le chambranle sort du cadre.

   Perspective : une petite caméra (en mètres) projette la porte, son battant
   et les ébrasements. La chambre et le couloir sont des toiles peintes posées
   à leur profondeur : le travelling avant les agrandit autour du point de
   fuite. Le battant est peint à plat puis dessiné en bandes verticales, ce
   qui donne une perspective exacte pendant qu'il pivote.
   ========================================================================== */
import { P, rng } from '../kit.js';
import { raster } from '../raster.js';
import { TAU, clamp, lerp, ease, seg } from '../../film/engine.js';

/* ---------- Outils de tracé ---------- */
const q = (v) => Math.round(v * 10) / 10;
const XY = (p) => `${q(p[0])} ${q(p[1])}`;
const dpath = (ps) => 'M' + ps.map(XY).join('L') + 'Z';

// Courbe lisse fermée passant par les points (Catmull-Rom → Bézier)
function lisse(p) {
  const n = p.length;
  let d = `M${XY(p[0])}`;
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n], b = p[i], c = p[(i + 1) % n], e = p[(i + 2) % n];
    d += `C${XY([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6])} ${XY([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6])} ${XY(c)}`;
  }
  return d + 'Z';
}
// Courbe lisse ouverte ; « suite » la raccorde au tracé précédent
function trace(p, suite = false) {
  let d = suite ? `L${XY(p[0])}` : `M${XY(p[0])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || p[i + 1];
    d += `C${XY([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6])} ${XY([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6])} ${XY(c)}`;
  }
  return d;
}
const ruban = (g, d) => trace(g) + trace(d.slice().reverse(), true) + 'Z';
// Tige effilée le long d'une ligne médiane
function tige(p, w0, w1) {
  const L = [], R = [];
  p.forEach((m, i) => {
    const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * (i / (p.length - 1))) / 2;
    L.push([m[0] + (dy / l) * w, m[1] - (dx / l) * w]);
    R.push([m[0] - (dy / l) * w, m[1] + (dx / l) * w]);
  });
  return ruban(L, R);
}
// Dégradés en coordonnées du décor
const stops = (s) => s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
const linU = (id, s, x1, y1, x2, y2) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${q(x1)}" y1="${q(y1)}" x2="${q(x2)}" y2="${q(y2)}">${stops(s)}</linearGradient>`;
const radU = (id, s, cx, cy, r, extra = '') =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${q(cx)}" cy="${q(cy)}" r="${q(r)}" ${extra}>${stops(s)}</radialGradient>`;
const linB = (id, s, x1, y1, x2, y2) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;

// Découpe d'un polygone par un rectangle [x0, y0, x1, y1] (Sutherland–Hodgman)
function clipBox(poly, [x0, y0, x1, y1]) {
  const tests = [(p) => p[0] - x0, (p) => x1 - p[0], (p) => p[1] - y0, (p) => y1 - p[1]];
  let out = poly;
  for (const f of tests) {
    const inp = out;
    out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[i], b = inp[(i + 1) % inp.length];
      const fa = f(a), fb = f(b);
      if (fa >= 0) out.push(a);
      if (fa >= 0 !== fb >= 0) {
        const k = fa / (fa - fb);
        out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
      }
    }
    if (!out.length) break;
  }
  return out;
}
// Enveloppe convexe (chaîne monotone) : contour d'un faisceau de lumière
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const v of p) {
    while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], v) <= 0) lo.pop();
    lo.push(v);
  }
  for (let i = p.length - 1; i >= 0; i--) {
    const v = p[i];
    while (hi.length > 1 && cross(hi[hi.length - 2], hi[hi.length - 1], v) <= 0) hi.pop();
    hi.push(v);
  }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}

/* ---------- Caméra et géométrie (mètres) ---------- */
const F = 900;              // focale : pixels du décor pour 1 m vu à 1 m
const VX = 960, VY = 260;   // point de fuite (horizon à hauteur des yeux)
const EYE = 1.62;           // hauteur des yeux
const D0 = 1.1;             // distance de départ au plan de la porte
const CZ1 = 0.8;            // position finale de la caméra, dans la chambre
const WALK = D0 + CZ1;      // longueur de l'avancée
const ZR = 3.45;            // profondeur de référence de la chambre (le berceau)
const DW = 0.83, DH = 2.04; // battant
const HX = -DW / 2, HZ = 0.04; // gond (à gauche)
const WT = 0.12;            // épaisseur du mur (ébrasement)
const TH0 = 0.07, TH1 = 1.5; // battant entrouvert → grand ouvert (radians)

const proj = (X, Y, Z, cz) => {
  const d = Z - cz;
  return [VX + (F * X) / d, VY - (F * (Y - EYE)) / d, d];
};
const R = (X, Y, Z) => proj(X, Y, Z, CZ1);   // chambre, vue de la position finale
const C = (X, Y, Z) => proj(X, Y, Z, -D0);   // couloir, vu de la position de départ

// La chambre (mètres), raccord avec le décor « chambre » : pièce de 3,8 m de large, mur du
// fond à ZB, grande fenêtre sur le mur de droite (deux battants, 4 × 3 carreaux)
const XL = -1.9, XR = 1.9, ZB = 3.8, HC = 2.45;
const WIN = { z0: 1.22, z1: 3.48, y0: 0.75, y1: 2.2, d: 0.2 };
const OUVERT = [1.48, 3.24]; // partie de la fenêtre laissée libre par les rideaux mi-tirés
const COLS = [[1.28, 1.785], [1.815, 2.32], [2.38, 2.885], [2.915, 3.42]];
const ROWS = [[0.81, 1.27], [1.3, 1.74], [1.77, 2.14]];
const SUN = [-1, -0.7, 0.45]; // direction des rayons du soleil (même soleil que « chambre »)
// Point où un rayon parti de la fenêtre (y, z) touche le sol ou un mur
const sunHit = (y, z, x = XR) => {
  const t = Math.min(y / -SUN[1], (ZB - z) / SUN[2], (x - XL) / -SUN[0]);
  return [x + SUN[0] * t, y + SUN[1] * t, z + SUN[2] * t];
};
// Berceau : contre le mur du fond, un peu à gauche du milieu (comme dans « chambre »)
const CR = { x0: -0.95, x1: 0.3, zf: 3.14, zb: 3.74, post: 0.05 };
// Carreaux dégagés par les rideaux (sources des rayons), un peu rétrécis pour la pénombre
const MOBILE_HUB = [(CR.x0 + CR.x1) / 2 + 0.02, 1.62, (CR.zf + CR.zb) / 2 + 0.01]; // moyeu du mobile
const PANES = [];
for (const [za, zb] of COLS) {
  for (const [ya, yb] of ROWS) {
    const z0 = Math.max(za + 0.022, OUVERT[0]), z1 = Math.min(zb - 0.022, OUVERT[1]);
    if (z1 - z0 > 0.03) PANES.push([z0, z1, ya + 0.025, yb - 0.025]);
  }
}

/* ==========================================================================
   Calque « chambre » : la pièce entière, peinte depuis la position finale
   ========================================================================== */
const RBOX = [-20, -230, 1960, 1690];
const RBOX_LARGE = [-400, -230, 2720, 1690];  // sous-couche basse définition pour les bords
const RCLIP = [-420, -280, 2340, 1510];

// Outils 3D pour les taches de soleil (mêmes constructions que dans « chambre »)
const boite = (x0, x1, y0, y1, z0, z1) =>
  [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
// Découpe d'un polygone 3D par un demi-espace f(p) ≥ 0
function coupe(poly, f) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const fa = f(a), fb = f(b);
    if (fa >= 0) out.push(a);
    if (fa >= 0 !== fb >= 0) {
      const t = fa / (fa - fb);
      out.push(a.map((v, j) => v + (b[j] - v) * t));
    }
  }
  return out;
}
// Enveloppe convexe de points posés dans un plan (axes i, j), rendue en 3D
const enveloppe = (ps, i, j) => {
  const h = hull(ps.map((p) => [p[i], p[j]]));
  return h.map(([u, v]) => ps.find((p) => p[i] === u && p[j] === v));
};
// Projections le long du soleil : sur le plancher, sur le mur du fond, sur un plan horizontal y
const surPlan = (y0) => (p) => { const k = (p[1] - y0) / -SUN[1]; return [p[0] + SUN[0] * k, y0, p[2] + SUN[2] * k]; };
const surMur = (p) => { const k = (ZB - p[2]) / SUN[2]; return [p[0] + SUN[0] * k, p[1] + SUN[1] * k, ZB]; };
// Un point reçoit-il le soleil (le rayon qui y mène passe-t-il par la partie dégagée de la fenêtre) ?
const auSoleil = (x, y, z) => {
  const t = (XR - x) / -SUN[0], yw = y - SUN[1] * t, zw = z - SUN[2] * t;
  return zw > OUVERT[0] + 0.02 && zw < OUVERT[1] - 0.02 && yw > ROWS[0][0] && yw < ROWS[2][1];
};

// Berceau : hauteurs (mètres) et volumes qui portent ombre dans les taches de soleil
const CY = { yr0: 0.86, yr1: 0.92, yb0: 0.3, yb1: 0.36, ym: 0.44, ytop: 0.98 };
const BEBE_X = CR.x0 + 0.205;  // tête du bébé, à gauche dans le berceau
const OMBRANTS = (() => {
  const { x0, x1, zf, zb, post } = CR, { yr0, yr1, yb0, yb1, ym, ytop } = CY, br = 0.012, o = [];
  const pitch = (x1 - x0 - 2 * post) / 14, pz = (zb - zf - 2 * post) / 5;
  for (const z of [zf, zb]) {
    for (let i = 0; i < 14; i++) { const xc = x0 + post + (i + 0.5) * pitch; o.push(boite(xc - br, xc + br, yb1, yr0, z - br, z + br)); }
    o.push(boite(x0, x1, yr0, yr1, z - 0.015, z + 0.015), boite(x0, x1, yb0, yb1, z - 0.015, z + 0.015));
  }
  for (const x of [x0, x1]) for (let i = 0; i < 5; i++) { const zc = zf + post + (i + 0.5) * pz; o.push(boite(x - br, x + br, yb1, yr0, zc - br, zc + br)); }
  for (const [x, z] of [[x0, zf], [x1 - post, zf], [x0, zb - post], [x1 - post, zb - post]]) o.push(boite(x, x + post, 0, ytop, z, z + post));
  o.push(boite(x0 + 0.02, x1 - 0.02, yb0, ym, zf + 0.02, zb - 0.02));                 // matelas
  o.push(boite(BEBE_X - 0.06, BEBE_X + 0.62, ym, ym + 0.11, zf + 0.2, zb - 0.16));   // le bébé
  return o;
})();

function chambreSVG() {
  const r = rng(71);
  const out = [];
  const face = (pts3, attrs) => {
    const c = clipBox(pts3.map((p) => R(...p)), RCLIP);
    return c.length > 2 ? `<path d="${dpath(c)}" ${attrs}/>` : '';
  };
  const ZN = 1.15;
  const BL = R(XL, 0, ZB), BR = R(XR, 0, ZB), TL = R(XL, HC, ZB), TR = R(XR, HC, ZB);
  const W = WIN, X1 = XR + W.d;
  const glass = [R(X1, W.y0, 2.2), R(X1, W.y0, W.z1), R(X1, W.y1, W.z1), R(X1, W.y1, 2.2)];
  const baie = [[XR, W.y0, W.z0], [XR, W.y0, W.z1], [XR, W.y1, W.z1], [XR, W.y1, W.z0]];

  /* Dégradés */
  out.push(`<defs>
    ${linU('pp-fond', [[0, '#7f8d92'], [0.45, '#9eaaa9'], [0.85, '#b1b0a1'], [1, '#bba98c']], 0, TL[1], 0, BL[1])}
    ${radU('pp-fondombre', [[0, '#5d6b74', 0.45], [1, '#5d6b74', 0]], TL[0], TL[1], 620)}
    ${radU('pp-fondchaud', [[0, '#f0d6a6', 0.4], [1, '#f0d6a6', 0]], BR[0], BR[1] - 260, 520)}
    ${linU('pp-murg', [[0, '#6f7c80'], [0.55, '#8f9c9c'], [1, '#a6b0ac']], -20, 0, BL[0], 0)}
    ${linU('pp-murd', [[0, '#7b878a'], [0.35, '#758185'], [1, '#646f74']], BR[0], 0, 1960, 0)}
    ${linU('pp-plaf', [[0, '#c1b7a3'], [1, '#d6cab0']], 0, -230, 0, TL[1])}
    ${linU('pp-sol', [[0, '#d9a96e', 0.3], [0.18, '#b07d52', 0], [0.4, '#4e301b', 0.15], [0.7, '#3a2516', 0.55], [0.92, '#33211a', 0.92], [1, '#33211a', 1]], 0, BL[1], 0, 1460)}
    ${linU('pp-vitre', [[0, '#e3ebe6'], [0.5, '#fbf4e2'], [1, '#fff6e0']], 0, glass[2][1], 0, glass[1][1])}
    ${linB('pp-bar', [[0, '#7c5533'], [0.28, '#b88a57'], [0.7, '#dcae74'], [1, '#c09060']], 0, 0, 1, 0)}
    ${linB('pp-barsol', [[0, '#9a6b42'], [0.3, '#d6a56c'], [0.72, '#ffd99b'], [1, '#efbf80']], 0, 0, 1, 0)}
    ${linB('pp-bardos', [[0, '#6c4a2e'], [0.4, '#9a7048'], [0.8, '#b9895a'], [1, '#9a7048']], 0, 0, 1, 0)}
    ${linB('pp-rail', [[0, '#f0c68c'], [0.3, '#cf9f66'], [1, '#8c623d']], 0, 0, 0, 1)}
    ${linB('pp-post', [[0, '#7f5734'], [0.35, '#c09060'], [0.75, '#e8bd84'], [1, '#c99a62']], 0, 0, 1, 0)}
    ${linB('pp-postsol', [[0, '#9a6b42'], [0.35, '#dcab70'], [0.75, '#ffdca0'], [1, '#f0c084']], 0, 0, 1, 0)}
    <radialGradient id="pp-boule" cx="0.46" cy="0.44" r="0.6" fx="0.64" fy="0.3">${stops([[0, '#ffe6b4'], [0.3, P.woodLight], [0.72, P.wood], [1, '#94693f']])}</radialGradient>
    ${linB('pp-drap', [[0, '#cdbda4'], [0.5, '#e9dfcd'], [1, '#f6eddd']], 0, 0, 0, 1)}
    ${linB('pp-gigo', [[0, P.roseLight], [0.45, P.rose], [1, P.roseShade]], 0, 0, 0, 1)}
    <clipPath id="pp-vitre-clip"><path d="${dpath(glass)}"/></clipPath>
    <clipPath id="pp-baie-clip"><path d="${dpath(clipBox(baie.map((p) => R(...p)), RCLIP))}"/></clipPath>
    <clipPath id="pp-sol-clip"><path d="${dpath(clipBox([[XL, 0, ZN], [XR, 0, ZN], [XR, 0, ZB], [XL, 0, ZB]].map((p) => R(...p)), RCLIP))}"/></clipPath>
  </defs>`);

  /* Plafond, murs */
  out.push(face([[XL, HC, ZN], [XR, HC, ZN], [XR, HC, ZB], [XL, HC, ZB]], 'fill="url(#pp-plaf)"'));
  out.push(face([[XL, 0, ZB], [XR, 0, ZB], [XR, HC, ZB], [XL, HC, ZB]], 'fill="url(#pp-fond)"'));
  out.push(face([[XL, 0, ZB], [XR, 0, ZB], [XR, HC, ZB], [XL, HC, ZB]], 'fill="url(#pp-fondombre)"'));
  out.push(face([[XL, 0, ZB], [XR, 0, ZB], [XR, HC, ZB], [XL, HC, ZB]], 'fill="url(#pp-fondchaud)"'));
  out.push(face([[XL, 0, ZN], [XL, 0, ZB], [XL, HC, ZB], [XL, HC, ZN]], 'fill="url(#pp-murg)"'));
  out.push(face([[XR, 0, ZB], [XR, 0, ZN], [XR, HC, ZN], [XR, HC, ZB]], 'fill="url(#pp-murd)"'));
  // Enduit peint : grandes marbrures douces sur les murs
  {
    const rb = rng(17);
    let m = '';
    for (let i = 0; i < 18; i++) {
      const X = lerp(XL, XR, rb()), Y = lerp(0.2, HC, rb());
      const [x, y, d] = R(X, Y, ZB);
      const rad = ((0.22 + rb() * 0.35) * F) / d;
      m += `<ellipse cx="${q(x)}" cy="${q(y)}" rx="${q(rad * 1.3)}" ry="${q(rad)}" fill="${rb() < 0.5 ? '#c4cbc5' : '#6f7d84'}" opacity="${q(0.1 + rb() * 0.1)}"/>`;
    }
    for (let i = 0; i < 10; i++) {
      const Z = lerp(2.2, ZB, rb()), Y = lerp(0.2, HC, rb());
      const [x, y, d] = R(XL, Y, Z);
      const rad = ((0.25 + rb() * 0.3) * F) / d;
      m += `<ellipse cx="${q(x)}" cy="${q(y)}" rx="${q(rad * 0.6)}" ry="${q(rad)}" fill="${rb() < 0.5 ? '#bfc7c1' : '#66747b'}" opacity="${q(0.1 + rb() * 0.1)}"/>`;
    }
    out.push(`<g filter="url(#b28)">${m}</g>`);
  }
  // Rebonds chauds : bas du mur du fond (le parquet ensoleillé), plafond près de la fenêtre
  out.push(`<g filter="url(#b28)" opacity="0.6">
    ${face([[-1.2, 0, ZB], [XR, 0, ZB], [XR, 0.5, ZB], [-1.2, 0.5, ZB]], 'fill="#d6b182"')}
    ${face([[XL, 0, 2.6], [XL, 0, ZB], [XL, 0.45, ZB], [XL, 0.45, 2.6]], 'fill="#b9a284"')}
    ${face([[0.2, HC, 1.9], [XR, HC, 1.9], [XR, HC, ZB], [0.2, HC, ZB]], 'fill="#f1d9ac"')}
  </g>`);
  // Coins (ombre douce)
  out.push(`<g filter="url(#b10)" opacity="0.55" stroke-linecap="round">
    <path d="M${XY(BL)}L${XY(TL)}" stroke="#56626a" stroke-width="16"/>
    <path d="M${XY(BR)}L${XY(TR)}" stroke="#4a555c" stroke-width="18"/>
    <path d="M${XY(TL)}L${XY(TR)}" stroke="#7d7a70" stroke-width="12"/>
  </g>`);

  /* Plinthes */
  out.push(face([[XL, 0, ZB], [XR, 0, ZB], [XR, 0.09, ZB], [XL, 0.09, ZB]], 'fill="#ddd3c0"'));
  out.push(face([[XL, 0, ZN], [XL, 0, ZB], [XL, 0.09, ZB], [XL, 0.09, ZN]], 'fill="#cbc2b0"'));
  out.push(face([[XR, 0, ZB], [XR, 0, ZN], [XR, 0.09, ZN], [XR, 0.09, ZB]], 'fill="#a59e90"'));
  out.push(`<path d="M${XY(R(XL, 0.09, ZB))}L${XY(R(XR, 0.09, ZB))}" stroke="#867f72" stroke-width="2" opacity="0.6"/>`);

  /* Étagère sur le mur du fond, à gauche du berceau (comme dans « chambre ») ; petit cadre au-dessus */
  {
    const x0 = -1.7, x1 = -1.04, y = 1.3, dz = 0.2, zf = ZB - dz;
    // ombre portée douce sous la planche
    out.push(`<g filter="url(#b10)" opacity="0.4">${face([[x0 - 0.02, y - 0.17, ZB - 0.003], [x1 + 0.01, y - 0.17, ZB - 0.003], [x1 + 0.01, y - 0.01, ZB - 0.003], [x0 - 0.02, y - 0.01, ZB - 0.003]], 'fill="#4a5560"')}</g>`);
    // équerres
    for (const xe of [x0 + 0.08, x1 - 0.08]) out.push(face([[xe, y - 0.03, ZB - 0.005], [xe, y - 0.03, zf + 0.03], [xe, y - 0.19, ZB - 0.005]], 'fill="#8f6c4b"'));
    // planche : dessus (on la voit d'en haut), chant avant, bout
    out.push(face([[x0, y, ZB], [x1, y, ZB], [x1, y, zf], [x0, y, zf]], `fill="${P.woodLight}"`));
    out.push(face([[x0, y - 0.03, zf], [x1, y - 0.03, zf], [x1, y, zf], [x0, y, zf]], 'fill="#b88d5e"'));
    out.push(face([[x1, y - 0.03, zf], [x1, y - 0.03, ZB], [x1, y, ZB], [x1, y, zf]], 'fill="#8e6a48"'));
    // livres debout, dos vers nous ; l'un penché contre les autres
    const cols = ['#7f8f8b', '#b98a6a', '#c8b88e', '#6f7b8e', '#a8756a', '#ddd2bd', '#8b9a7c', '#c49a74'];
    const br = rng(31), za = zf + 0.03, zk = ZB - 0.02;
    let x = x0 + 0.04;
    for (let i = 0; i < 8; i++) {
      const w = 0.026 + br() * 0.022, h = 0.17 + br() * 0.08, c = cols[i];
      const lean = i === 6 ? 0.32 : 0, X = i === 6 ? x + 0.02 : x;
      const dx = h * Math.sin(lean), hy = h * Math.cos(lean);
      const fr = [[X, y, za], [X + w, y, za], [X + w + dx, y + hy, za], [X + dx, y + hy, za]];
      out.push(face([[X + w, y, za], [X + w, y, zk], [X + w + dx, y + hy, zk], [X + w + dx, y + hy, za]], `fill="${c}"`));
      out.push(face([[X + w, y, za], [X + w, y, zk], [X + w + dx, y + hy, zk], [X + w + dx, y + hy, za]], 'fill="#2e2a2a" opacity="0.32"'));
      out.push(face(fr, `fill="${c}" stroke="#3b3330" stroke-opacity="0.25" stroke-width="1.2"`));
      out.push(face([[X + dx * 0.8, y + hy * 0.78, za - 0.001], [X + w + dx * 0.8, y + hy * 0.78, za - 0.001], [X + w + dx * 0.82, y + hy * 0.82, za - 0.001], [X + dx * 0.82, y + hy * 0.82, za - 0.001]], 'fill="#f1e6d0" opacity="0.45"'));
      out.push(face([[X + dx, y + hy, za], [X + w + dx, y + hy, za], [X + w + dx, y + hy, zk], [X + dx, y + hy, zk]], 'fill="#e9dcc2"'));
      x += i === 6 ? w + dx + 0.03 : w + 0.003;
    }
    // petit bol en céramique au bout de l'étagère
    {
      const [bx, by, bd] = R(x1 - 0.1, y, zf + 0.09), kb = F / bd;
      out.push(`<path d="M${q(bx - 0.06 * kb)} ${q(by - 0.05 * kb)}Q${q(bx)} ${q(by + 0.025 * kb)} ${q(bx + 0.06 * kb)} ${q(by - 0.05 * kb)}Z" fill="#c9cfc7"/>`);
      out.push(`<ellipse cx="${q(bx)}" cy="${q(by - 0.05 * kb)}" rx="${q(0.06 * kb)}" ry="${q(0.012 * kb)}" fill="#e3e6df"/>`);
    }
    // petit cadre : un soleil sur des collines
    const a = R(-1.5, 1.8, ZB - 0.01), b = R(-1.24, 1.53, ZB - 0.01);
    const w = b[0] - a[0], hh = b[1] - a[1], fx = a[0], fy = a[1];
    out.push(`<g>
      <rect x="${q(fx + 4)}" y="${q(fy + 5)}" width="${q(w)}" height="${q(hh)}" fill="#4f5b5f" opacity="0.4" filter="url(#b3)"/>
      <rect x="${q(fx)}" y="${q(fy)}" width="${q(w)}" height="${q(hh)}" fill="${P.woodDark}"/>
      <rect x="${q(fx + 4)}" y="${q(fy + 4)}" width="${q(w - 8)}" height="${q(hh - 8)}" fill="#efe6d4"/>
      <rect x="${q(fx + 11)}" y="${q(fy + 11)}" width="${q(w - 22)}" height="${q(hh - 22)}" fill="#cfdde0"/>
      <circle cx="${q(fx + w * 0.6)}" cy="${q(fy + hh * 0.42)}" r="${q(w * 0.1)}" fill="#e9a87c"/>
      <path d="M${q(fx + 11)} ${q(fy + hh * 0.7)}C${q(fx + w * 0.32)} ${q(fy + hh * 0.48)} ${q(fx + w * 0.5)} ${q(fy + hh * 0.66)} ${q(fx + w - 11)} ${q(fy + hh * 0.58)}V${q(fy + hh - 11)}H${q(fx + 11)}Z" fill="${P.leafLight}"/>
      <path d="M${q(fx + 11)} ${q(fy + hh * 0.82)}C${q(fx + w * 0.4)} ${q(fy + hh * 0.7)} ${q(fx + w * 0.6)} ${q(fy + hh * 0.82)} ${q(fx + w - 11)} ${q(fy + hh * 0.76)}V${q(fy + hh - 11)}H${q(fx + 11)}Z" fill="${P.leaf}"/>
    </g>`);
  }

  /* Fenêtre du mur de droite : embrasure, jardin, croisée (vus par l'ouverture du mur) */
  out.push('<g clip-path="url(#pp-baie-clip)">');
  {
    out.push(face([[X1, W.y0, W.z0], [X1, W.y0, W.z1], [X1, W.y1, W.z1], [X1, W.y1, W.z0]], 'fill="url(#pp-vitre)"'));
    // Le jardin, surexposé, vu à travers la vitre : feuillage doré, trouées de ciel, pelouse
    const rr = rng(5);
    let gard = face([[X1, W.y0 - 0.1, 1.9], [X1, W.y0 - 0.1, W.z1 + 0.1], [X1, 1.25, W.z1 + 0.1], [X1, 1.25, 1.9]], 'fill="#dcd6a0"');
    gard += face([[X1, 1.12, 1.9], [X1, 1.12, W.z1 + 0.1], [X1, 1.3, W.z1 + 0.1], [X1, 1.3, 1.9]], 'fill="#a8b585"');
    for (let i = 0; i < 64; i++) {
      const Z = lerp(2.0, W.z1 + 0.05, rr()), Y = lerp(1.25, W.y1 + 0.1, rr());
      const [x, y, d] = R(X1 + 0.3, Y, Z);
      const rad = ((0.05 + rr() * 0.09) * F) / d;
      const col = ['#a6b47f', '#c9c68c', '#93a578', '#e0d69e', '#bcc189', '#eef0dc'][Math.floor(rr() * 6)];
      gard += `<ellipse cx="${q(x)}" cy="${q(y)}" rx="${q(rad * 0.55)}" ry="${q(rad)}" fill="${col}" opacity="${q(0.6 + rr() * 0.35)}"/>`;
    }
    out.push(`<g clip-path="url(#pp-vitre-clip)"><g filter="url(#b6)">${gard}</g>
    ${face([[X1, W.y0, 2.2], [X1, W.y0, W.z1], [X1, W.y1, W.z1], [X1, W.y1, 2.2]], 'fill="#fff4dc" opacity="0.3" filter="url(#b10)"')}</g>`);
    // Croisée en contre-jour : deux battants de deux colonnes sur trois rangées (cadre crème)
    const Xf = X1 - 0.01;
    const P3 = (y, z) => R(Xf, y, z);
    const rect3 = (za, zb, ya, yb) => clipBox([P3(ya, za), P3(ya, zb), P3(yb, zb), P3(yb, za)], RCLIP);
    const dp = (a) => (a.length > 2 ? dpath(a) : '');
    let d = dp(rect3(W.z0, W.z1, W.y0, W.y1));
    for (const [za, zb] of COLS) for (const [ya, yb] of ROWS) d += dp(rect3(za, zb, ya, yb));
    out.push(`<path fill-rule="evenodd" d="${d}" fill="#b4a892"/>`);
    // liserés de lumière sur les petits bois
    let rim = '';
    for (const [za] of COLS) rim += `M${XY(P3(W.y0 + 0.06, za))}L${XY(P3(W.y1 - 0.06, za))}`;
    for (const [ya] of ROWS) rim += `M${XY(P3(ya, 2.3))}L${XY(P3(ya, W.z1 - 0.06))}`;
    out.push(`<path d="${rim}" stroke="#fff1d2" stroke-width="2.2" opacity="0.7" fill="none"/>`);
    // Embrasure : joue du fond (éclairée), linteau (ombre), appui (éclairé)
    out.push(face([[XR, W.y0, W.z1], [X1, W.y0, W.z1], [X1, W.y1, W.z1], [XR, W.y1, W.z1]], 'fill="#f3dfba"'));
    out.push(face([[XR, W.y1, W.z0], [X1, W.y1, W.z0], [X1, W.y1, W.z1], [XR, W.y1, W.z1]], 'fill="#8e958f"'));
    out.push(face([[XR - 0.07, W.y0, W.z0 - 0.05], [X1, W.y0, W.z0], [X1, W.y0, W.z1], [XR - 0.07, W.y0, W.z1 + 0.05]], 'fill="#fcedd0"'));
    out.push(face([[XR - 0.07, W.y0 - 0.04, W.z0 - 0.05], [XR - 0.07, W.y0, W.z0 - 0.05], [XR - 0.07, W.y0, W.z1 + 0.05], [XR - 0.07, W.y0 - 0.04, W.z1 + 0.05]], 'fill="#bdb19a"'));
  }
  out.push('</g>');
  // Halo du contre-jour autour de la baie
  out.push(`<path d="${dpath(clipBox(baie.map((p) => R(...p)), RCLIP))}" fill="none" stroke="#ffe7bb" stroke-width="40" opacity="0.3" filter="url(#b16)"/>`);

  /* Rideaux de lin mi-tirés, lumineux en contre-jour */
  {
    const xr = XR - 0.05, top = 2.3, bot = 0.03;
    out.push(`<path d="M${XY(R(xr, top + 0.03, 1.6))}L${XY(R(xr, top + 0.03, ZB - 0.02))}" stroke="#6d4c31" stroke-width="7" stroke-linecap="round"/>`);
    const rideau = (za, zb) => {
      const n = 12, folds = 7;
      let s = '';
      const zs = Array.from({ length: folds + 1 }, (_, k) => lerp(za, zb, k / folds));
      for (let k = 0; k < folds; k++) {
        const L = [], Rr = [];
        for (let i = 0; i <= n; i++) {
          const y = lerp(top, bot, i / n), w = 0.006 * Math.sin(i * 0.8 + k * 1.7);
          L.push(R(xr, y, zs[k] + w));
          Rr.push(R(xr, y, zs[k + 1] + w));
        }
        // Chaque pli : une bande plus ou moins éclairée ; devant la vitre, le lin s'illumine
        const zc = (zs[k] + zs[k + 1]) / 2;
        const onGlass = zc > W.z0 && zc < W.z1;
        const base = onGlass ? (k % 2 ? '#f3dfbb' : '#fff1d6') : k % 2 ? '#8f7e66' : '#a6947a';
        s += `<path d="${ruban(L, Rr)}" fill="${base}"/>`;
      }
      // Bandes lumineuses où le lin passe devant la vitre ; plus sombre sur le mur
      s += `<g clip-path="url(#pp-baie-clip)">${face([[xr, top, za], [xr, top, zb], [xr, bot, zb], [xr, bot, za]], 'fill="#fff3da" opacity="0.5"')}</g>`;
      // Arêtes des plis
      for (let k = 1; k < folds; k++) {
        const pts = [];
        for (let i = 0; i <= n; i++) pts.push(R(xr - 0.005, lerp(top, bot, i / n), zs[k] + 0.006 * Math.sin(i * 0.8 + k * 1.7)));
        s += `<path d="${trace(pts)}" fill="none" stroke="${k % 2 ? '#fff8e8' : '#7f705c'}" stroke-width="${k % 2 ? 2.5 : 3}" opacity="0.45"/>`;
      }
      return `<g filter="url(#soft)">${s}</g>`;
    };
    out.push(rideau(3.22, 3.74));
  }

  /* Plancher : lames miel vers le point de fuite */
  {
    const tones = ['#a8764b', '#b07e52', '#9f6d45', '#ad7a4f', '#a3714a', '#b5845a', '#9a6943'];
    let s = '';
    const step = 0.136;
    for (let X = XL; X < XR - 1e-6; X += step) {
      const X2 = Math.min(XR, X + step);
      s += face([[X, 0, ZN], [X2, 0, ZN], [X2, 0, ZB], [X, 0, ZB]], `fill="${tones[Math.floor(r() * tones.length)]}"`);
    }
    let seams = '';
    for (let X = XL + step; X < XR - 1e-6; X += step) {
      const a = R(X, 0, ZB), b = R(X, 0, 1.4);
      seams += `M${XY(a)}L${XY(b)}`;
      for (let k = 0; k < 2; k++) {
        const z = lerp(1.7, ZB - 0.15, r());
        seams += `M${XY(R(X - step, 0, z))}L${XY(R(X, 0, z))}`;
      }
    }
    out.push(`<g>${s}</g><path d="${seams}" stroke="${P.floorDark}" stroke-width="1.8" opacity="0.45" fill="none"/>`);
    // Reflet de la fenêtre sur le parquet ciré
    out.push(`<g filter="url(#b16)" opacity="0.5">${face([[XR - 0.55, 0, 2.3], [XR - 0.05, 0, 2.1], [XR - 0.05, 0, W.z1], [XR - 0.4, 0, W.z1 + 0.1]], 'fill="#f5d9a6"')}</g>`);
    out.push(`<path d="M-70 ${q(BL[1])}H1990V1510H-70Z" fill="url(#pp-sol)" clip-path="url(#pp-sol-clip)"/>`);
  }

  /* Tapis rond tissé crème, devant le berceau, un peu à gauche */
  {
    const x0 = -0.4, z0 = 2.6, R0 = 0.52;
    const ring = (rad) => {
      const pts = [];
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * TAU;
        pts.push(R(x0 + Math.cos(a) * rad, 0.005, z0 + Math.sin(a) * rad));
      }
      return lisse(pts);
    };
    out.push(`<path d="${ring(R0 + 0.03)}" fill="#4f3522" opacity="0.4" filter="url(#b6)"/>`);
    out.push(`<path d="${ring(R0)}" fill="#bfa77f"/>`);
    let braid = '';
    for (let k = 1; R0 - k * 0.034 > 0.03; k++) {
      braid += `<path d="${ring(R0 - k * 0.034)}" fill="none" stroke="${k % 2 ? '#a88f6c' : '#d2bd97'}" stroke-width="2.4" opacity="0.7"/>`;
    }
    out.push(braid);
  }

  /* Taches de soleil : chaque carreau dégagé, projeté le long du soleil sur le plancher et
     sur le mur du fond ; le berceau y découpe son ombre (même construction que « chambre ») */
  {
    const poly = (a) => {
      if (a.length < 3) return '';
      const c = clipBox(a.map((p) => R(...p)), RCLIP);
      return c.length > 2 ? `<path d="${dpath(c)}"/>` : '';
    };
    const surSol = surPlan(0);
    let solL = '', murL = '', solO = '', murO = '';
    for (const [z0, z1, y0, y1] of PANES) {
      const pane = [[XR, y0, z0], [XR, y0, z1], [XR, y1, z1], [XR, y1, z0]];
      solL += poly(coupe(coupe(pane.map(surSol), (p) => ZB - p[2]), (p) => p[0] - XL));
      murL += poly(coupe(coupe(coupe(pane.map(surMur), (p) => p[1]), (p) => p[0] - XL), (p) => HC - p[1]));
    }
    for (const b of OMBRANTS) {
      solO += poly(coupe(enveloppe(b.map(surSol), 0, 2), (p) => ZB - p[2]));
      murO += poly(coupe(enveloppe(b.map(surMur), 0, 1), (p) => p[1]));
    }
    const M = 'maskUnits="userSpaceOnUse" x="-420" y="-280" width="2760" height="1790"';
    out.push(`<mask id="pp-tache-sol" ${M}><g fill="#fff">${solL}</g><g fill="#000">${solO}</g></mask>`);
    out.push(`<mask id="pp-tache-mur" ${M}><g fill="#fff">${murL}</g><g fill="#000">${murO}</g></mask>`);
    // près du bord bas de la toile, la lumière s'efface (pas de coupure pendant l'avancée)
    out.push(`${linU('pp-fondu', [[0, '#fff'], [0.62, '#fff'], [1, '#000']], 0, 700, 0, 1450)}
      <mask id="pp-tache-fondu" ${M}><rect x="-420" y="-280" width="2760" height="1790" fill="url(#pp-fondu)"/></mask>`);
    // lumière diffuse autour des taches, puis les taches, à peine adoucies (pénombre)
    out.push(`<g mask="url(#pp-tache-fondu)">
      <g filter="url(#b28)" opacity="0.3" fill="#ffd99a">${solL}${murL}</g>
      <g filter="url(#b3)">
        <rect x="-420" y="-280" width="2760" height="1790" fill="#ffcf86" opacity="0.6" mask="url(#pp-tache-sol)"/>
        <rect x="-420" y="-280" width="2760" height="1790" fill="#ffd690" opacity="0.82" mask="url(#pp-tache-mur)"/>
      </g>
    </g>`);
  }

  /* Berceau */
  out.push(berceauSVG(face));
  return out.join('\n');
}

/* Fauteuil vert-gris au premier plan à gauche (comme dans « chambre ») : calque à part,
   posé à sa propre profondeur pour que la parallaxe soit juste pendant l'avancée.
   Il regarde le berceau : on le voit de profil, dossier à gauche, accoudoir roulé à droite.
   Il est peint décalé de F_OFF vers la droite (la bande peinte en téléphone commence à x = 330). */
const FZ = 2.3, FX = -1.2, F_OFF = 900;
const FBASE = R(FX, 0, FZ);
const FK = F / FBASE[2];
const FBOX = [FBASE[0] + F_OFF - 0.62 * FK, FBASE[1] - 1.12 * FK, 1.3 * FK, 1.2 * FK];
function fauteuilSVG() {
  const k = FK, ox = FBASE[0] + F_OFF, oy = FBASE[1];
  const S = (x, y) => [ox + x * k, oy - y * k];
  const s = [];
  s.push(`<defs>
    ${linU('pp-fdos', [[0, '#3f4945'], [0.55, '#55615a'], [1, '#69766e']], S(-0.42, 0)[0], 0, S(-0.12, 0)[0], 0)}
    ${linU('pp-fbras', [[0, '#6f7c73'], [0.4, '#5c6862'], [1, '#3f4845']], 0, S(0, 0.64)[1], 0, S(0, 0.1)[1])}
  </defs>`);
  // Ombre douce au sol (le soleil vient de la droite)
  s.push(`<ellipse cx="${q(S(-0.12, 0)[0])}" cy="${q(oy - 4)}" rx="${q(0.62 * k)}" ry="${q(0.06 * k)}" fill="#24180f" opacity="0.55" filter="url(#b10)"/>`);
  // Pieds fuselés en bois
  s.push(`<path d="M${XY(S(-0.34, 0.12))}L${XY(S(-0.36, 0))}M${XY(S(0.3, 0.12))}L${XY(S(0.33, 0.005))}" stroke="#5e4029" stroke-width="${q(0.032 * k)}" stroke-linecap="round"/>`);
  // Dossier haut et arrondi, un peu incliné
  s.push(`<path d="${lisse([S(-0.36, 0.14), S(-0.42, 0.62), S(-0.4, 0.86), S(-0.32, 0.97), S(-0.2, 0.96), S(-0.14, 0.84), S(-0.15, 0.5), S(-0.1, 0.16)])}" fill="url(#pp-fdos)"/>`);
  s.push(`<path d="${trace([S(-0.4, 0.84), S(-0.33, 0.95), S(-0.21, 0.95)])}" fill="none" stroke="#86948a" stroke-width="${q(0.018 * k)}" opacity="0.6" stroke-linecap="round"/>`);
  // Assise et coussin
  s.push(`<path d="${lisse([S(-0.36, 0.16), S(-0.34, 0.44), S(-0.05, 0.5), S(0.3, 0.47), S(0.36, 0.3), S(0.3, 0.14), S(0, 0.12)])}" fill="#4f5a54"/>`);
  s.push(`<path d="${lisse([S(-0.2, 0.44), S(0.04, 0.5), S(0.3, 0.47), S(0.32, 0.42), S(0.04, 0.42)])}" fill="#6a776f"/>`);
  // Accoudoir roulé (côté proche)
  s.push(`<path d="${lisse([S(-0.24, 0.14), S(-0.25, 0.5), S(-0.18, 0.6), S(0.24, 0.6), S(0.36, 0.62), S(0.43, 0.55), S(0.42, 0.46), S(0.34, 0.42), S(0.33, 0.14)])}" fill="url(#pp-fbras)"/>`);
  s.push(`<ellipse cx="${q(S(0.37, 0.535)[0])}" cy="${q(S(0.37, 0.535)[1])}" rx="${q(0.06 * k)}" ry="${q(0.07 * k)}" fill="#55615a"/>`);
  s.push(`<path d="${trace([S(0.33, 0.585), S(0.4, 0.58), S(0.42, 0.52), S(0.38, 0.47)])}" fill="none" stroke="#7b897f" stroke-width="${q(0.014 * k)}" opacity="0.7"/>`);
  // Le soleil de la fenêtre, de l'autre côté de la pièce, effleure le haut de l'accoudoir et le dossier
  s.push(`<path d="${trace([S(-0.16, 0.6), S(0.2, 0.61), S(0.38, 0.625), S(0.44, 0.56)])}" fill="none" stroke="#f0d3a0" stroke-width="${q(0.02 * k)}" stroke-linecap="round" opacity="0.5" filter="url(#b3)"/>`);
  s.push(`<path d="${trace([S(-0.2, 0.95), S(-0.14, 0.84), S(-0.145, 0.62)])}" fill="none" stroke="#d9c39a" stroke-width="${q(0.014 * k)}" opacity="0.45" filter="url(#soft)"/>`);
  // Ombre du soir sur le bas (le fauteuil est loin de la fenêtre)
  s.push(`<path d="${lisse([S(-0.38, 0.14), S(0.36, 0.14), S(0.36, 0.3), S(-0.38, 0.3)])}" fill="#1f2624" opacity="0.25" filter="url(#b6)"/>`);
  return `<g>${s.join('')}</g>`;
}

/* Berceau : barreaux, montants à boule, matelas, bébé endormi, bras du mobile */
function berceauSVG(face) {
  const out = [];
  const { x0, x1, zf, zb, post } = CR;
  const { yr0, yr1, yb0, yb1, ym, ytop } = CY;
  const bar = 0.024, n = 14;
  const barsLong = (z, fill) => {
    let s = '';
    const pitch = (x1 - x0 - 2 * post) / n;
    for (let i = 0; i < n; i++) {
      const xc = x0 + post + (i + 0.5) * pitch;
      const sunny = auSoleil(xc, 0.62, z - 0.02);
      s += face([[xc - bar / 2, yb1, z], [xc + bar / 2, yb1, z], [xc + bar / 2, yr0, z], [xc - bar / 2, yr0, z]], `fill="url(#${sunny ? 'pp-barsol' : fill})"`);
    }
    return s;
  };
  const barsEnd = (x, fill) => {
    let s = '';
    const pitch = (zb - zf - 2 * post) / 5;
    for (let i = 0; i < 5; i++) {
      const zc = zf + post + (i + 0.5) * pitch;
      s += face([[x, yb1, zc - bar / 2], [x, yb1, zc + bar / 2], [x, yr0, zc + bar / 2], [x, yr0, zc - bar / 2]], `fill="url(#${fill})"`);
    }
    return s;
  };
  const rail = (z, ya, yb2, fill) => face([[x0, ya, z], [x1, ya, z], [x1, yb2, z], [x0, yb2, z]], `fill="${fill}"`);
  const postF = (x, z) => {
    const fill = auSoleil(x + post / 2, 0.62, z - 0.02) ? 'pp-postsol' : 'pp-post';
    let s = face([[x, 0, z], [x + post, 0, z], [x + post, ytop, z], [x, ytop, z]], `fill="url(#${fill})"`);
    const [cx, cy, d] = R(x + post / 2, ytop + 0.032, z + post / 2);
    const rr = (0.037 * F) / d;
    s += `<circle cx="${q(cx)}" cy="${q(cy)}" r="${q(rr)}" fill="url(#pp-boule)"/>`;
    return s;
  };

  // Ombre de contact sous le berceau
  out.push(`<g filter="url(#b10)" opacity="0.5">${face([[x0 - 0.04, 0, zf], [x1 + 0.04, 0, zf], [x1 + 0.04, 0, zb], [x0 - 0.04, 0, zb]], 'fill="#3e2a1c"')}</g>`);
  // Côté du fond
  out.push(rail(zb, yr0, yr1, '#9c7046'));
  out.push(rail(zb, yb0, yb1, '#83603d'));
  out.push(barsLong(zb, 'pp-bardos'));
  out.push(postF(x0, zb - post));
  out.push(postF(x1 - post, zb - post));
  // Bras du mobile, fixé au montant droit (au fond), qui s'incurve au-dessus du berceau
  {
    const a = R(x1 - post / 2, ytop - 0.12, zb - post / 2), b = R(x1 - post / 2, 1.62, zb - post / 2);
    const c = R(x1 - 0.12, 1.69, (zf + zb) / 2 + 0.06), e = R(...MOBILE_HUB);
    out.push(`<path d="${tige([a, b], 7, 6)}" fill="#c3925c"/>`);
    out.push(`<path d="${tige([b, c, e], 6, 4)}" fill="#a87a4c"/>`);
    out.push(`<path d="${trace([[b[0] + 1.5, b[1]], c, e])}" fill="none" stroke="#f3cf95" stroke-width="1.6" opacity="0.8"/>`);
    out.push(`<path d="M${XY([a[0] + 2, a[1]])}L${XY([b[0] + 2, b[1]])}" stroke="#f3cf95" stroke-width="2" opacity="0.7"/>`);
  }
  // Côtés courts (faces intérieures)
  out.push(barsEnd(x0 + 0.01, 'pp-bardos'));
  out.push(barsEnd(x1 - 0.01, 'pp-barsol'));
  out.push(face([[x0, yr0, zf], [x0, yr0, zb], [x0, yr1, zb], [x0, yr1, zf]], 'fill="#a77a4b"'));
  out.push(face([[x1, yr0, zf], [x1, yr0, zb], [x1, yr1, zb], [x1, yr1, zf]], 'fill="#f0c58a"'));
  // Matelas, drap-housse
  out.push(face([[x0 + 0.02, yb1, zf + 0.02], [x1 - 0.02, yb1, zf + 0.02], [x1 - 0.02, ym, zf + 0.02], [x0 + 0.02, ym, zf + 0.02]], `fill="${P.sheetShade}"`));
  out.push(face([[x0 + 0.02, ym, zf + 0.02], [x1 - 0.02, ym, zf + 0.02], [x1 - 0.02, ym, zb - 0.02], [x0 + 0.02, ym, zb - 0.02]], 'fill="url(#pp-drap)"'));
  // Soleil sur le drap, zébré par l'ombre des barreaux de devant
  {
    const poly = (a) => {
      if (a.length < 3) return '';
      const c = clipBox(a.map((p) => R(...p)), RCLIP);
      return c.length > 2 ? `<path d="${dpath(c)}"/>` : '';
    };
    const surDrap = surPlan(ym + 0.002);
    const dansLeLit = (a) => coupe(coupe(coupe(coupe(a, (p) => p[0] - x0 - 0.02), (p) => x1 - 0.02 - p[0]), (p) => p[2] - zf - 0.02), (p) => zb - 0.02 - p[2]);
    let lit = '', holes = '';
    for (const [z0, z1, y0, y1] of PANES) {
      lit += poly(dansLeLit([[XR, y0, z0], [XR, y0, z1], [XR, y1, z1], [XR, y1, z0]].map(surDrap)));
    }
    for (const b of OMBRANTS.slice(0, -2)) {
      if (Math.max(...b.map((p) => p[1])) <= ym + 0.01) continue;
      const hb = b.map((p) => [p[0], Math.max(p[1], ym + 0.01), p[2]]);
      holes += poly(coupe(enveloppe(hb.map(surDrap), 0, 2), (p) => p[0] - x0));
    }
    out.push(`<mask id="pp-tache-drap" maskUnits="userSpaceOnUse" x="-420" y="-280" width="2760" height="1790"><g fill="#fff">${lit}</g><g fill="#000">${holes}</g></mask>`);
    out.push(`<g filter="url(#b3)"><rect x="-420" y="-280" width="2760" height="1790" fill="#ffe2a6" opacity="0.6" mask="url(#pp-tache-drap)"/></g>`);
  }
  out.push(bebeSVG());
  // Côté avant
  out.push(rail(zf, yb0, yb1, `url(#pp-rail)`));
  out.push(barsLong(zf, 'pp-bar'));
  out.push(rail(zf, yr0, yr1, `url(#pp-rail)`));
  out.push(face([[x0, yr1, zf], [x1, yr1, zf], [x1, yr1, zf + 0.03], [x0, yr1, zf + 0.03]], 'fill="#f6d39c"'));
  out.push(postF(x0, zf));
  out.push(postF(x1 - post, zf));
  // Liseré de soleil sur le haut de la barrière, côté fenêtre
  out.push(`<path d="M${XY(R(-0.3, yr1 + 0.001, zf + 0.01))}L${XY(R(x1, yr1 + 0.001, zf + 0.01))}" stroke="#ffe4b0" stroke-width="2.5" opacity="0.8" filter="url(#soft)"/>`);
  return out.join('\n');
}

/* Le bébé, vu à travers les barreaux : sur le dos, tête à gauche, bras levés */
function bebeSVG() {
  const [hx, hy, d] = R(BEBE_X, 0.53, 3.45);
  const k = F / d / 290;
  const S = (x, y) => [hx + x * k, hy + y * k];
  const s = [];
  // Ombre douce sous le corps
  s.push(`<ellipse cx="${q(S(100, 30)[0])}" cy="${q(S(100, 30)[1])}" rx="${q(110 * k)}" ry="${q(10 * k)}" fill="#a8977c" opacity="0.6" filter="url(#b3)"/>`);
  // Gigoteuse
  const sac = lisse([S(16, 6), S(36, -12), S(90, -18), S(148, -12), S(192, -2), S(204, 14), S(190, 28), S(120, 33), S(50, 31), S(20, 22)]);
  s.push(`<path d="${sac}" fill="url(#pp-gigo)"/>`);
  s.push(`<path d="${trace([S(64, -14), S(72, 6), S(68, 28)])}" fill="none" stroke="${P.roseShade}" stroke-width="2" opacity="0.6"/>`);
  s.push(`<path d="${trace([S(40, -7), S(100, -15), S(170, -6)])}" fill="none" stroke="#fbd8cc" stroke-width="3" opacity="0.7"/>`);
  // Étoiles crème semées
  const star = (x, y, rr) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r2 = i % 2 ? rr * 0.45 : rr;
      pts.push(S(x + Math.cos(a) * r2, y + Math.sin(a) * r2));
    }
    return `<path d="${dpath(pts)}" fill="#f8ecd8"/>`;
  };
  [[52, 2], [84, -8], [110, 12], [142, -2], [170, 14], [96, 24], [182, 0], [128, -10]].forEach(([x, y]) => s.push(star(x, y, 4)));
  // Col du body crème
  s.push(`<path d="${lisse([S(12, -4), S(24, -11), S(29, 4), S(24, 20), S(12, 18)])}" fill="${P.sheet}"/>`);
  // Bras côté mur, levé et plié : le poing repose au-dessus de la tête, sans toucher le crâne
  // (collé au crâne, il se lisait comme un bonnet à pompon)
  s.push(`<path d="${tige([S(24, -10), S(21, -30), S(4, -38)], 9, 8)}" fill="#ece0cc"/>`);
  s.push(`<circle cx="${q(S(0, -37)[0])}" cy="${q(S(0, -37)[1])}" r="${q(5.4 * k)}" fill="${P.skin}"/>`);
  s.push(`<path d="${trace([S(-3, -36), S(0, -38.5), S(3, -36)])}" fill="none" stroke="${P.skinDeep}" stroke-width="0.9" opacity="0.6"/>`);
  // Tête
  s.push(`<ellipse cx="${q(hx)}" cy="${q(hy)}" rx="${q(22 * k)}" ry="${q(19 * k)}" fill="${P.skin}"/>`);
  s.push(`<path d="${lisse([S(-21, 5), S(-6, 15), S(12, 17), S(21, 6), S(10, 19), S(-12, 17)])}" fill="${P.skinShade}" opacity="0.55"/>`);
  // Cheveux fins, châtain clair (sommet du crâne vers la gauche)
  s.push(`<path d="${lisse([S(-22, 3), S(-21, -11), S(-10, -19), S(3, -19), S(-2, -11), S(-12, -4), S(-17, 7)])}" fill="${P.hair}"/>`);
  s.push(`<path d="${trace([S(-15, -15), S(-6, -17), S(2, -16)])}" fill="none" stroke="#c4936a" stroke-width="1.2"/>`);
  // Oreille, œil fermé (cils), joue, bouche entrouverte
  s.push(`<ellipse cx="${q(S(-4, 4)[0])}" cy="${q(S(-4, 4)[1])}" rx="${q(3.6 * k)}" ry="${q(4.6 * k)}" fill="${P.skinShade}"/>`);
  s.push(`<path d="${trace([S(5, -7), S(9.5, -5.2), S(14, -7)])}" fill="none" stroke="#6e4a3e" stroke-width="1.4" stroke-linecap="round"/>`);
  s.push(`<path d="M${XY(S(7, -6))}l-1 2M${XY(S(10, -5))}l0 2.2M${XY(S(13, -6))}l1 2" stroke="#6e4a3e" stroke-width="0.8"/>`);
  s.push(`<ellipse cx="${q(S(11, 3)[0])}" cy="${q(S(11, 3)[1])}" rx="${q(5.5 * k)}" ry="${q(3.8 * k)}" fill="${P.cheek}" opacity="0.6"/>`);
  s.push(`<ellipse cx="${q(S(20, -5)[0])}" cy="${q(S(20, -5)[1])}" rx="${q(1.7 * k)}" ry="${q(1.3 * k)}" fill="#b0645c"/>`);
  // Poing près de la joue (bras côté caméra)
  s.push(`<path d="${tige([S(27, 15), S(17, 19), S(10, 13)], 9, 8)}" fill="#f1e6d3"/>`);
  s.push(`<circle cx="${q(S(8, 10)[0])}" cy="${q(S(8, 10)[1])}" r="${q(5.4 * k)}" fill="${P.skin}"/>`);
  s.push(`<path d="${trace([S(5, 9), S(8, 7), S(11, 9)])}" fill="none" stroke="${P.skinDeep}" stroke-width="0.9" opacity="0.7"/>`);
  return `<g>${s.join('')}</g>`;
}

/* ==========================================================================
   Calque « couloir » : mur crème, applique, chambranle (avec le vide de la
   porte). Peint depuis la position de départ.
   ========================================================================== */
const CBOX = [-80, -80, 2080, 1240];
const OPEN_L = C(HX, 0, 0)[0], OPEN_R = C(-HX, 0, 0)[0];  // bords de l'ouverture
const CAS = (0.07 * F) / D0;                                // largeur du chambranle
const LAMPW = C(-0.78, 1.8, 0), LAMP = C(-0.78, 1.8, -0.12);

function couloirSVG() {
  const out = [];
  const corner = C(0.98, 0, 0)[0];
  const hole = `M-80 -80H2000V1160H-80Z M${q(OPEN_L)} -200V1300H${q(OPEN_R)}V-200Z`;
  const [wx, wy] = LAMPW;
  out.push(`<defs>
    ${radU('pp-cmur', [[0, '#f2dfbf'], [0.1, '#ead5b2'], [0.3, '#dcc5a1'], [0.6, '#bea78c'], [1, '#867672']], wx, wy, 1800)}
    ${linU('pp-cbas', [[0, '#3a3036', 0], [1, '#2c2430', 0.32]], 0, 380, 0, 1160)}
    ${linU('pp-ccoin', [[0, '#b8a084'], [0.5, '#968173'], [1, '#6c5f61']], corner, 0, 2080, 0)}
    ${linB('pp-cas', [[0, '#fff6e6'], [0.2, '#f1e5cf'], [0.75, '#e2d3b9'], [1, '#c9b89b']], 0, 0, 1, 0)}
    ${linB('pp-casd', [[0, '#f6ead6'], [0.25, '#e3d4ba'], [0.8, '#cdbb9e'], [1, '#ad9a7f']], 0, 0, 1, 0)}
    ${linU('pp-casv', [[0, '#ffffff', 0.12], [0.5, '#000000', 0], [1, '#2e2018', 0.32]], 0, -80, 0, 1160)}
    ${linU('pp-abat', [[0, '#e3a965'], [0.12, '#ffd99c'], [0.55, '#fff0d0'], [1, '#ffd08a']], 0, LAMP[1] - 60, 0, LAMP[1] + 60)}
    ${radU('pp-cone', [[0, '#fffaee', 1], [0.35, '#fff0d4', 0.7], [1, '#ffe8c4', 0]], wx, wy, 620)}
  </defs>`);
  // Mur percé de l'ouverture
  out.push(`<path fill-rule="evenodd" fill="url(#pp-cmur)" d="${hole}"/>`);
  // Retour de mur à droite (angle du couloir), plus sombre
  out.push(`<path d="M${q(corner)} -80H2000V1160H${q(corner)}Z" fill="url(#pp-ccoin)"/>`);
  out.push(`<path d="M${q(corner)} -80V1160" stroke="#4f3b2d" stroke-width="12" opacity="0.4" filter="url(#b6)"/>`);
  // Cimaise (moulure à hauteur d'appui) ; sous elle, le mur prend un peu moins de lumière
  {
    const yc = C(0, 0.92, 0)[1], h = 0.035 * F / D0;
    const seg2 = (x0, x1) => `<rect x="${q(x0)}" y="${q(yc - h / 2)}" width="${q(x1 - x0)}" height="${q(h)}" fill="#e9dcc6"/>` +
      `<rect x="${q(x0)}" y="${q(yc - h / 2)}" width="${q(x1 - x0)}" height="3" fill="#fff6e6" opacity="0.8"/>` +
      `<rect x="${q(x0)}" y="${q(yc + h / 2 - 2)}" width="${q(x1 - x0)}" height="4" fill="#6e5e58" opacity="0.5"/>` +
      `<rect x="${q(x0)}" y="${q(yc + h / 2 + 2)}" width="${q(x1 - x0)}" height="10" fill="#4a3c3a" opacity="0.18" filter="url(#b3)"/>`;
    out.push(`<rect x="-80" y="${q(yc)}" width="${q(OPEN_L - CAS + 80)}" height="${q(1160 - yc)}" fill="#3c3036" opacity="0.1"/>`);
    out.push(`<rect x="${q(OPEN_R + CAS)}" y="${q(yc)}" width="${q(corner - OPEN_R - CAS)}" height="${q(1160 - yc)}" fill="#3c3036" opacity="0.1"/>`);
    out.push(seg2(-80, OPEN_L - CAS), seg2(OPEN_R + CAS, corner));
  }
  // Lumière de l'applique : deux éventails sur le mur, au-dessus et au-dessous
  out.push(`<g filter="url(#b16)">
    <path d="M${q(wx - 50)} ${q(wy - 30)}C${q(wx - 140)} ${q(wy - 120)} ${q(wx - 230)} -40 ${q(wx - 300)} -80H${q(wx + 300)}C${q(wx + 230)} -40 ${q(wx + 140)} ${q(wy - 120)} ${q(wx + 50)} ${q(wy - 30)}Z" fill="url(#pp-cone)"/>
    <path d="M${q(wx - 50)} ${q(wy + 50)}C${q(wx - 160)} ${q(wy + 200)} ${q(wx - 250)} ${q(wy + 380)} ${q(wx - 330)} ${q(wy + 560)}H${q(wx + 330)}C${q(wx + 250)} ${q(wy + 380)} ${q(wx + 160)} ${q(wy + 200)} ${q(wx + 50)} ${q(wy + 50)}Z" fill="url(#pp-cone)" opacity="0.85"/>
  </g>`);
  out.push(`<path fill-rule="evenodd" fill="url(#pp-cbas)" d="${hole}"/>`);
  // Applique : platine, bras, abat-jour en tissu qui luit
  {
    const [lx, ly] = LAMP, k = F / 0.98;
    const w = 0.17 * k, h = 0.13 * k;
    out.push(`<ellipse cx="${q(wx)}" cy="${q(wy + 8)}" rx="13" ry="21" fill="#d9c7a6"/>`);
    out.push(`<path d="${tige([[wx, wy + 8], [lx + 20, ly + 20], [lx + 4, ly + 22]], 8, 9)}" fill="#a69d8e"/>`);
    out.push(`<path d="M${q(lx - w / 2)} ${q(ly - h / 2)}C${q(lx - w / 2)} ${q(ly - h / 2 - 9)} ${q(lx + w / 2)} ${q(ly - h / 2 - 9)} ${q(lx + w / 2)} ${q(ly - h / 2)}L${q(lx + w / 2 + 8)} ${q(ly + h / 2)}C${q(lx + w / 2)} ${q(ly + h / 2 + 20)} ${q(lx - w / 2)} ${q(ly + h / 2 + 20)} ${q(lx - w / 2 - 8)} ${q(ly + h / 2)}Z" fill="url(#pp-abat)"/>`);
    out.push(`<path d="M${q(lx - w / 2 + 6)} ${q(ly - h / 2 + 2)}C${q(lx - w / 2 + 4)} ${q(ly)} ${q(lx - w / 2)} ${q(ly + h / 4)} ${q(lx - w / 2 - 6)} ${q(ly + h / 2)}" fill="none" stroke="#e7b06a" stroke-width="6" opacity="0.5"/>`);
    out.push(`<ellipse cx="${q(lx)}" cy="${q(ly + h / 2 + 6)}" rx="${q(w / 2 + 5)}" ry="12" fill="#fffbf0"/>`);
  }
  // Interrupteur
  {
    const [sx, sy] = C(0.6, 1.08, 0), w = (0.08 * F) / D0;
    out.push(`<rect x="${q(sx - w / 2 + 7)}" y="${q(sy - w / 2 + 6)}" width="${q(w)}" height="${q(w)}" rx="6" fill="#4a3628" opacity="0.4" filter="url(#b3)"/>`);
    out.push(`<rect x="${q(sx - w / 2)}" y="${q(sy - w / 2)}" width="${q(w)}" height="${q(w)}" rx="6" fill="#d9ccb5"/>`);
    out.push(`<rect x="${q(sx - w / 5)}" y="${q(sy - w / 3.2)}" width="${q((w * 2) / 5)}" height="${q(w / 1.6)}" rx="3" fill="#cbbda4" stroke="#b5a487" stroke-width="1.5"/>`);
  }
  // Ombre du chambranle droit sur le mur (la lampe est à gauche)
  out.push(`<rect x="${q(OPEN_R + CAS - 6)}" y="-80" width="40" height="1240" fill="#3e2c20" opacity="0.4" filter="url(#b10)"/>`);
  // Chambranles moulurés
  const casing = (x, w, grad, left) => {
    let s = `<rect x="${q(x)}" y="-80" width="${q(w)}" height="1240" fill="url(#${grad})"/>`;
    const bead = left ? x + 7 : x + w - 7, step = left ? x + w - 14 : x + 14;
    s += `<path d="M${q(bead)} -80V1160" stroke="${left ? '#fffaf0' : '#9c8a70'}" stroke-width="3" opacity="0.8"/>`;
    s += `<path d="M${q(bead + (left ? 5 : -5))} -80V1160" stroke="${left ? '#c9b89c' : '#efe2cb'}" stroke-width="2" opacity="0.7"/>`;
    s += `<path d="M${q(step)} -80V1160" stroke="${left ? '#a8957a' : '#f7ecd8'}" stroke-width="3" opacity="0.8"/>`;
    s += `<rect x="${q(x)}" y="-80" width="${q(w)}" height="1240" fill="url(#pp-casv)"/>`;
    return s;
  };
  out.push(casing(OPEN_L - CAS, CAS, 'pp-cas', true));
  out.push(casing(OPEN_R, CAS, 'pp-casd', false));
  return out.join('\n');
}

/* ==========================================================================
   Calque « porte » : le battant vu de face, en millimètres (0 → 830, 0 → 2040)
   ========================================================================== */
function porteSVG() {
  const out = [];
  out.push(`<defs>
    ${linU('pp-plum', [[0, '#fff3dc', 0.45], [0.4, '#ffffff', 0], [1, '#3a2a1f', 0.38]], 0, 0, 830, 2040)}
    ${linU('pp-pchamp', [[0, '#e7dac4'], [1, '#dccdb4']], 0, 0, 0, 2040)}
  </defs>`);
  out.push(`<rect x="-14" y="-14" width="858" height="2068" fill="#eadfca"/>`);
  const panel = (x0, y0, x1, y1) => {
    const b = 34;
    let s = `<rect x="${x0 - 7}" y="${y0 - 7}" width="${x1 - x0 + 14}" height="${y1 - y0 + 14}" fill="none" stroke="#bfae93" stroke-width="3.5" opacity="0.75"/>`;
    s += `<rect x="${x0 - 3}" y="${y0 - 3}" width="${x1 - x0 + 6}" height="${y1 - y0 + 6}" fill="none" stroke="#fff8ea" stroke-width="2.5" opacity="0.75"/>`;
    s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#pp-pchamp)"/>`;
    s += `<path d="M${x0} ${y0}H${x1}L${x1 - b} ${y0 + b}H${x0 + b}Z" fill="#bcad96"/>`;
    s += `<path d="M${x0} ${y0}L${x0 + b} ${y0 + b}V${y1 - b}L${x0} ${y1}Z" fill="#c9baa2"/>`;
    s += `<path d="M${x0} ${y1}L${x0 + b} ${y1 - b}H${x1 - b}L${x1} ${y1}Z" fill="#f6ecdb"/>`;
    s += `<path d="M${x1} ${y0}L${x1} ${y1}L${x1 - b} ${y1 - b}V${y0 + b}Z" fill="#efe4d1"/>`;
    s += `<rect x="${x0 + b}" y="${y0 + b}" width="${x1 - x0 - 2 * b}" height="${y1 - y0 - 2 * b}" fill="none" stroke="#b5a68e" stroke-width="2" opacity="0.5"/>`;
    return s;
  };
  out.push(panel(115, 120, 365, 920), panel(465, 120, 715, 920), panel(115, 1120, 365, 1840), panel(465, 1120, 715, 1840));
  // Lumière de l'applique (en haut à gauche) qui s'éteint vers le bas et la droite
  out.push(`<rect x="-14" y="-14" width="858" height="2068" fill="url(#pp-plum)"/>`);
  // Poignée en métal clair (bec-de-cane tourné vers le gond)
  out.push(`<g>
    <path d="${tige([[778, 1050], [700, 1056], [640, 1066]], 22, 18)}" fill="#3e3028" opacity="0.35" filter="url(#b6)"/>
    <ellipse cx="782" cy="1054" rx="34" ry="36" fill="#3e3028" opacity="0.3" filter="url(#b6)"/>
    <circle cx="772" cy="1040" r="30" fill="#9ea5ab"/>
    <circle cx="768" cy="1035" r="23" fill="#d3d8db"/>
    <path d="${tige([[772, 1036], [700, 1038], [636, 1046]], 22, 18)}" fill="#b6bdc2"/>
    <path d="${trace([[766, 1028], [700, 1030], [640, 1038]])}" fill="none" stroke="#f1f3f0" stroke-width="5" stroke-linecap="round"/>
    <path d="${trace([[768, 1046], [700, 1048], [642, 1055]])}" fill="none" stroke="#737c84" stroke-width="4" stroke-linecap="round"/>
  </g>`);
  return out.join('\n');
}

/* ==========================================================================
   Calque « main » : main droite à plat sur la porte, manche de pull bleu-gris
   ========================================================================== */
const TH_REL = 0.3;         // part d'ouverture au moment où la main lâche la porte
const HA = 0.7, HYc = 1.27;  // point d'appui de la main sur le battant
const contact = (th, cz) => proj(HX + HA * Math.cos(th), HYc, HZ + HA * Math.sin(th), cz);
const H0 = contact(TH0, -D0);
const HROT = -0.36;
// Repère local de la main → décor
const HL = (x, y) => [H0[0] + x * Math.cos(HROT) - y * Math.sin(HROT), H0[1] + x * Math.sin(HROT) + y * Math.cos(HROT)];

// Doigt : capsule légèrement effilée, au bout arrondi (repère local)
function doigt(b, t, w0, w1) {
  const dx = t[0] - b[0], dy = t[1] - b[1], l = Math.hypot(dx, dy);
  const ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
  const P2 = (s, n) => HL(b[0] + ux * s + nx * n, b[1] + uy * s + ny * n);
  const a = [P2(0, w0 / 2), P2(l * 0.45, w0 * 0.49), P2(l - w1 * 0.6, w1 / 2), P2(l - w1 * 0.12, w1 * 0.36), P2(l, 0), P2(l - w1 * 0.12, -w1 * 0.36), P2(l - w1 * 0.6, -w1 / 2), P2(l * 0.45, -w0 * 0.49), P2(0, -w0 / 2)];
  return trace(a) + 'Z';
}
// Main fine (fiche de personnage) : doigts longs et étroits, dos de main mince, aucun bijou
const FINGERS = [
  // base, bout, largeurs (repère local, doigts vers le haut, serrés)
  [[-31, -44], [-34, -148], 22, 19.5],
  [[-10, -50], [-12, -164], 23, 20],
  [[11, -47], [10, -154], 22, 19],
  [[30, -38], [32, -122], 19, 16.5],
];
const THUMB = [[-35, 20], [-72, -45], 25, 19];
const HAND_BACK = [[-44, -46], [-47, -12], [-44, 20], [-34, 50], [-22, 70], [4, 76], [28, 68], [38, 40], [44, 6], [46, -26], [40, -42], [24, -50], [0, -54], [-24, -52]];
const HANDS = {
  fingers: FINGERS.map(([b, t, w0, w1]) => doigt(b, t, w0, w1)),
  thumb: doigt(...THUMB),
  back: lisse(HAND_BACK.map(([x, y]) => HL(x, y))),
};
// Manche : l'avant-bras vient vers nous, en fort raccourci ; elle s'ouvre vers le coin bas droit
// (manche un peu longue et ample : le revers couvre le poignet)
const SLEEVE_PTS = (() => {
  const c0 = HL(6, 96);
  const A = (dx, dy) => [c0[0] + dx, c0[1] + dy];
  const L = [HL(-60, 110), A(-56, 150), A(-14, 330), A(66, 560), A(166, 820), A(256, 1060)];
  const Rr = [HL(68, 104), A(134, 110), A(334, 250), A(604, 420), A(904, 600), A(1204, 780)];
  return { L, R: Rr };
})();
const SLEEVE = ruban(SLEEVE_PTS.L, SLEEVE_PTS.R);

function mainSVG() {
  const out = [];
  const [cx, cy] = H0;
  const { L, R: Rr } = SLEEVE_PTS;
  out.push(`<defs>
    ${linU('pp-manche', [[0, '#77808c'], [0.25, P.clothLight], [0.6, P.cloth], [1, '#1c2128']], L[2][0], L[2][1], Rr[2][0], Rr[2][1])}
    ${linU('pp-peau', [[0, '#f2caa9'], [0.45, '#e4b192'], [1, '#c68d6f']], cx - 90, cy - 140, cx + 80, cy + 80)}
  </defs>`);
  // Manche : volume, bord éclairé par l'applique (haut gauche), plis doux
  out.push(`<path d="${SLEEVE}" fill="url(#pp-manche)"/>`);
  out.push(`<path d="${trace(L.slice(0, 6).map(([x, y], i) => [x + 14 + i * 6, y + 2]))}" fill="none" stroke="#a1aab5" stroke-width="${14}" opacity="0.4" filter="url(#b10)"/>`);
  const crease = (i, k0, k1, bend, w) => {
    const a = [lerp(L[i][0], Rr[i][0], k0), lerp(L[i][1], Rr[i][1], k0)];
    const b = [lerp(L[i][0], Rr[i][0], k1), lerp(L[i][1], Rr[i][1], k1)];
    const m = [(a[0] + b[0]) / 2 + bend[0], (a[1] + b[1]) / 2 + bend[1]];
    return `<path d="${trace([a, m, b])}" fill="none" stroke="#1c2129" stroke-width="${w}" stroke-linecap="round" opacity="0.5" filter="url(#b3)"/>` +
      `<path d="${trace([[a[0] - 3, a[1] - 7], [m[0] - 3, m[1] - 8], [b[0] - 3, b[1] - 7]])}" fill="none" stroke="#7d8794" stroke-width="${w * 0.6}" stroke-linecap="round" opacity="0.35" filter="url(#b3)"/>`;
  };
  out.push(crease(1, 0.08, 0.7, [10, 26], 8), crease(2, 0.12, 0.8, [16, 40], 11), crease(3, 0.2, 0.75, [24, 50], 15), crease(2, 0.45, 0.95, [10, 30], 9));
  // Mailles : côtes très discrètes près du poignet
  let rib = '';
  for (let j = 1; j < 12; j++) {
    const k = j / 12;
    const pts = L.slice(0, 3).map((p, i) => [lerp(p[0], Rr[i][0], k), lerp(p[1], Rr[i][1], k)]);
    rib += `<path d="${trace(pts)}" fill="none" stroke="${j % 2 ? '#262c35' : '#6a7480'}" stroke-width="1.4" opacity="0.12"/>`;
  }
  out.push(rib);
  // Doigts (derrière le dos de la main), pouce, dos de la main
  // Même dégradé (repère du décor) pour toutes les parties : raccords invisibles
  out.push(`<path d="${HANDS.thumb}" fill="url(#pp-peau)"/>`);
  out.push(`<path d="${HANDS.back}" fill="url(#pp-peau)"/>`);
  HANDS.fingers.forEach((f) => out.push(`<path d="${f}" fill="url(#pp-peau)"/>`));
  // Volume des doigts : un côté dans l'ombre, l'autre dans la lumière de l'applique
  FINGERS.forEach(([b, t, w0]) => {
    const sh = [0.1, 0.5, 0.86].map((k) => HL(lerp(b[0], t[0], k) + w0 * 0.36, lerp(b[1], t[1], k)));
    const li = [0.15, 0.5, 0.8].map((k) => HL(lerp(b[0], t[0], k) - w0 * 0.22, lerp(b[1], t[1], k)));
    out.push(`<path d="${trace(sh)}" fill="none" stroke="#b47a5f" stroke-width="${q(w0 * 0.24)}" stroke-linecap="round" opacity="0.32" filter="url(#soft)"/>`);
    out.push(`<path d="${trace(li)}" fill="none" stroke="#f9dcc4" stroke-width="${q(w0 * 0.2)}" stroke-linecap="round" opacity="0.42" filter="url(#soft)"/>`);
  });
  // Bord du petit doigt et bas de la main dans l'ombre
  out.push(`<path d="${trace([HL(44, -34), HL(44, 0), HL(38, 36), HL(26, 62)])}" fill="none" stroke="#a26c55" stroke-width="8" opacity="0.32" filter="url(#b3)"/>`);
  // Séparations entre doigts, jointures, plis, ongles
  FINGERS.forEach(([b, t, w0], i) => {
    const mid2 = (k, off = 0) => HL(lerp(b[0], t[0], k) + off, lerp(b[1], t[1], k));
    if (i < 3) {
      const a = mid2(0.0, w0 / 2), e = mid2(0.8, w0 / 2 - 2);
      out.push(`<path d="M${XY(a)}L${XY(e)}" stroke="#94604b" stroke-width="1.8" opacity="0.26" filter="url(#soft)"/>`);
    }
    const kn = HL(b[0] + 1, b[1] + 6);
    out.push(`<ellipse cx="${q(kn[0])}" cy="${q(kn[1])}" rx="${q(w0 * 0.34)}" ry="${q(w0 * 0.24)}" fill="#f8dcc4" opacity="0.2" filter="url(#soft)"/>`);
    const j1 = mid2(0.42), j2 = mid2(0.72);
    out.push(`<path d="M${XY([j1[0] - 6, j1[1] + 1])}Q${XY([j1[0], j1[1] - 3])} ${XY([j1[0] + 6, j1[1] + 1])}M${XY([j2[0] - 5, j2[1] + 1])}Q${XY([j2[0], j2[1] - 2])} ${XY([j2[0] + 5, j2[1] + 1])}" fill="none" stroke="#a87158" stroke-width="0.9" opacity="0.15"/>`);
    const nail = mid2(0.885);
    out.push(`<ellipse cx="${q(nail[0])}" cy="${q(nail[1])}" rx="${q(w0 * 0.27)}" ry="${q(w0 * 0.38)}" transform="rotate(${q((HROT * 180) / Math.PI)} ${q(nail[0])} ${q(nail[1])})" fill="#efcdb9" opacity="0.75"/>`);
    out.push(`<ellipse cx="${q(nail[0] - 2)}" cy="${q(nail[1] - 3)}" rx="${q(w0 * 0.07)}" ry="${q(w0 * 0.13)}" fill="#fff6ee" opacity="0.7"/>`);
  });
  // Ongle du pouce, pli du pouce
  {
    const [b, t, w0] = THUMB;
    const nail = HL(lerp(b[0], t[0], 0.86), lerp(b[1], t[1], 0.86));
    out.push(`<ellipse cx="${q(nail[0])}" cy="${q(nail[1])}" rx="${q(w0 * 0.22)}" ry="${q(w0 * 0.3)}" transform="rotate(${q((HROT * 180) / Math.PI - 34)} ${q(nail[0])} ${q(nail[1])})" fill="#f0cdb9" opacity="0.85"/>`);
    out.push(`<path d="${trace([HL(-40, 0), HL(-34, 22), HL(-26, 44)])}" fill="none" stroke="#a87158" stroke-width="2.6" opacity="0.3" filter="url(#soft)"/>`);
  }
  // Tendons discrets
  [[-24, -30, -14, 40], [-4, -36, 0, 44], [17, -32, 14, 40]].forEach(([x0, y0, x1, y1]) => {
    out.push(`<path d="M${XY(HL(x0, y0))}L${XY(HL(x1, y1))}" stroke="#f3cdb0" stroke-width="4" opacity="0.1" stroke-linecap="round" filter="url(#b3)"/>`);
  });
  // Ombre douce du revers sur le dos de la main
  out.push(`<path d="${trace([HL(-42, 50), HL(2, 60), HL(46, 46)])}" fill="none" stroke="#8a5a46" stroke-width="12" opacity="0.26" filter="url(#b6)"/>`);
  // Revers du pull, souple et un peu lâche : il couvre le poignet
  const cuff = ruban([HL(-50, 54), HL(2, 64), HL(52, 50)], [HL(-60, 112), HL(4, 128), HL(68, 106)]);
  out.push(`<path d="${cuff}" fill="#56606d"/>`);
  for (let i = 0; i < 15; i++) {
    const k = i / 14;
    const a = HL(lerp(-47, 50, k), lerp(58, 53, k) + Math.sin(k * 3) * 3), b = HL(lerp(-57, 65, k), lerp(116, 110, k) + Math.sin(k * 3) * 5);
    out.push(`<path d="M${XY(a)}L${XY(b)}" stroke="${i % 2 ? '#3a424d' : '#6c7684'}" stroke-width="2.4" opacity="0.32" filter="url(#soft)"/>`);
  }
  out.push(`<path d="${trace([HL(-50, 55), HL(2, 65), HL(52, 51)])}" fill="none" stroke="#8c96a3" stroke-width="3.5" opacity="0.6" filter="url(#soft)"/>`);
  return out.join('\n');
}
// Silhouettes de la main et de la manche (pour la lumière procédurale)
let HAND_PATH = null, SLEEVE_PATH = null;
const handPath = () => {
  if (HAND_PATH) return HAND_PATH;
  const p = new Path2D();
  [...HANDS.fingers, HANDS.thumb, HANDS.back].forEach((d) => p.addPath(new Path2D(d)));
  return (HAND_PATH = p);
};
const sleevePath = () => SLEEVE_PATH || (SLEEVE_PATH = new Path2D(SLEEVE));

/* ==========================================================================
   Procédural : rayons, poussière, mobile, ébrasements, battant
   ========================================================================== */
// Rayons de soleil : un faisceau par carreau dégagé, cœur plus clair et bords doux
// (trois passes de plus en plus étroites), qui s'éteint en approchant du sol
function rayons(c, T, k) {
  c.globalCompositeOperation = 'screen';
  PANES.forEach(([z0, z1, y0, y1], i) => {
    const fl = 0.8 + 0.2 * Math.sin(T * 0.45 + i * 1.9);
    for (let pass = 0; pass < 3; pass++) {
      const sh = pass * 0.22;
      const za = lerp(z0, z1, sh / 2), zb = lerp(z1, z0, sh / 2), ya = lerp(y0, y1, sh / 2), yb = lerp(y1, y0, sh / 2);
      const src3 = [[XR + 0.1, ya, za], [XR + 0.1, ya, zb], [XR + 0.1, yb, zb], [XR + 0.1, yb, za]];
      const dst3 = src3.map(([, y, z]) => sunHit(y, z, XR + 0.1));
      const src = src3.map((p) => R(...p)), dst = dst3.map((p) => R(...p));
      const h = hull(src.concat(dst).map((p) => [p[0], p[1]]));
      const sc = src.reduce((acc, p) => [acc[0] + p[0] / 4, acc[1] + p[1] / 4], [0, 0]);
      const dc = dst.reduce((acc, p) => [acc[0] + p[0] / 4, acc[1] + p[1] / 4], [0, 0]);
      const gr = c.createLinearGradient(sc[0], sc[1], dc[0], dc[1]);
      const a = (0.13 * k * fl) / (1 + pass * 0.3);
      gr.addColorStop(0, `rgba(255,224,165,${a})`);
      gr.addColorStop(0.4, `rgba(255,212,145,${a * 0.42})`);
      gr.addColorStop(0.68, `rgba(255,206,140,${a * 0.06})`);
      gr.addColorStop(0.85, 'rgba(255,206,140,0)');
      c.fillStyle = gr;
      c.beginPath();
      h.forEach(([x, y], j) => (j ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.closePath();
      c.fill();
    }
  });
}

// Lumière d'ensemble de la chambre : ombres froides loin de la fenêtre, chaleur près d'elle,
// éclat de la tache de soleil et de la baie (repère de la chambre peinte)
const SUNSPOT = R(0.2, 0.55, ZB), BAIE = R(XR + 0.1, 1.5, 2.9);
function lumiere(c, T) {
  c.globalCompositeOperation = 'multiply';
  const cool = c.createLinearGradient(-40, 0, 1100, 0);
  cool.addColorStop(0, 'rgba(92,104,128,0.42)');
  cool.addColorStop(0.55, 'rgba(150,160,180,0.12)');
  cool.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = cool;
  c.fillRect(-40, -230, 2000, 1700);
  const top = c.createLinearGradient(0, -230, 0, 520);
  top.addColorStop(0, 'rgba(110,118,140,0.35)');
  top.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = top;
  c.fillRect(-40, -230, 2000, 750);
  c.globalCompositeOperation = 'screen';
  const pulse = 0.93 + 0.07 * Math.sin(T * 0.35);
  const warm = c.createRadialGradient(BAIE[0], BAIE[1], 60, BAIE[0] - 150, BAIE[1] + 80, 1100);
  warm.addColorStop(0, `rgba(255,214,150,${0.3 * pulse})`);
  warm.addColorStop(0.5, `rgba(255,200,130,${0.1 * pulse})`);
  warm.addColorStop(1, 'rgba(255,200,130,0)');
  c.fillStyle = warm;
  c.fillRect(-40, -230, 2000, 1700);
  const spot = c.createRadialGradient(SUNSPOT[0], SUNSPOT[1], 20, SUNSPOT[0], SUNSPOT[1], 380);
  spot.addColorStop(0, `rgba(255,214,140,${0.3 * pulse})`);
  spot.addColorStop(1, 'rgba(255,214,140,0)');
  c.fillStyle = spot;
  c.fillRect(SUNSPOT[0] - 400, SUNSPOT[1] - 400, 800, 800);
}

// Poussière : des grains qui dérivent et ne s'allument que dans les faisceaux
const DUST = (() => {
  const r = rng(909);
  return Array.from({ length: 170 }, () => ({ x: r(), y: r(), z: r(), s: 0.5 + r() * 1.3, ph: r() * TAU, sp: 0.4 + r() * 0.8 }));
})();
const inPane = (y, z) => {
  let best = 0;
  for (const [z0, z1, y0, y1] of PANES) {
    const m = Math.min(z - z0, z1 - z, y - y0, y1 - y);
    best = Math.max(best, clamp(m / 0.05 + 0.5));
  }
  return best;
};
function poussiere(c, T, k) {
  c.globalCompositeOperation = 'screen';
  for (const d of DUST) {
    const X = lerp(-1.1, 1.85, (d.x + 0.004 * T * d.sp) % 1);
    const Y = 0.3 + 1.8 * ((d.y + 0.01 * T * d.sp + 0.015 * Math.sin(T * 0.4 + d.ph)) % 1);
    const Z = lerp(2.2, 3.75, (d.z + 0.008 * Math.sin(T * 0.3 + d.ph * 2)) % 1);
    // Remonte le rayon jusqu'à la fenêtre : le grain est-il éclairé ?
    const t = XR - X;
    const lit = inPane(Y - SUN[1] * t, Z - SUN[2] * t);
    const tw = 0.55 + 0.45 * Math.sin(T * 1.6 * d.sp + d.ph);
    const a = 0.6 * k * lit * tw;
    if (a < 0.02) continue;
    const [x, y, dd] = R(X, Y, Z);
    const rad = (d.s * 5.5) / dd;
    c.fillStyle = `rgba(255,238,200,${a})`;
    c.beginPath();
    c.arc(x, y, rad, 0, TAU);
    c.fill();
  }
}

// Mobile en feutrine : étoile, lune, nuage, petit soleil, qui tournent lentement
function mobile(c, T) {
  const HUB = MOBILE_HUB;
  const hub = R(...HUB), cross = R(HUB[0], 1.5, HUB[2]);
  c.globalCompositeOperation = 'source-over';
  c.strokeStyle = 'rgba(80,64,52,0.55)';
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(hub[0], hub[1]); c.lineTo(cross[0], cross[1]); c.stroke();
  const phi = T * 0.2;
  const items = [
    { col: '#e8c46a', kind: 'etoile' },
    { col: '#a9c0cf', kind: 'lune' },
    { col: '#f1ece3', kind: 'nuage' },
    { col: '#e9a87c', kind: 'soleil' },
  ].map((it, i) => {
    const a = phi + (i * TAU) / 4;
    const X = HUB[0] + 0.14 * Math.cos(a), Z = HUB[2] + 0.14 * Math.sin(a);
    const Yb = 1.29 + 0.015 * Math.sin(T * 0.8 + i * 1.3) + (i % 2) * 0.05;
    return { ...it, a, i, arm: R(X, 1.5, Z), pos: R(X, Yb, Z) };
  });
  c.strokeStyle = 'rgba(150,108,68,0.95)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(items[0].arm[0], items[0].arm[1]); c.lineTo(items[2].arm[0], items[2].arm[1]);
  c.moveTo(items[1].arm[0], items[1].arm[1]); c.lineTo(items[3].arm[0], items[3].arm[1]);
  c.stroke();
  items.sort((u, v) => v.pos[2] - u.pos[2]);
  for (const it of items) {
    const [x, y, d] = it.pos;
    const s = (0.085 * F) / d;
    c.strokeStyle = 'rgba(80,64,52,0.45)';
    c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(it.arm[0], it.arm[1]); c.lineTo(x, y - s * 0.45); c.stroke();
    c.save();
    c.translate(x, y);
    c.rotate(0.12 * Math.sin(T * 0.6 + it.i));
    // Chaque pièce pivote doucement sur son fil
    c.scale(0.78 + 0.22 * Math.cos(T * 0.5 + it.i * 1.7), 1);
    c.fillStyle = it.col;
    c.beginPath();
    if (it.kind === 'etoile') {
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = (i % 2 ? 0.45 : 1) * s * 0.55;
        c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      c.closePath();
    } else if (it.kind === 'lune') {
      c.arc(0, 0, s * 0.42, -Math.PI * 0.62, Math.PI * 0.62, true);
      c.quadraticCurveTo(-s * 0.05, 0, Math.cos(-Math.PI * 0.62) * s * 0.42, Math.sin(-Math.PI * 0.62) * s * 0.42);
      c.closePath();
    } else if (it.kind === 'nuage') {
      c.arc(-s * 0.2, s * 0.06, s * 0.2, 0, TAU);
      c.arc(s * 0.04, -s * 0.06, s * 0.26, 0, TAU);
      c.arc(s * 0.27, s * 0.07, s * 0.18, 0, TAU);
      c.rect(-s * 0.2, s * 0.06, s * 0.47, s * 0.19);
    } else {
      c.arc(0, 0, s * 0.27, 0, TAU);
    }
    c.fill();
    // Lumière dorée sur le bord droit, ombre bleutée à gauche (dans la forme seulement)
    c.save();
    c.clip();
    const gr = c.createLinearGradient(-s * 0.5, 0, s * 0.5, 0);
    gr.addColorStop(0, 'rgba(60,62,80,0.3)');
    gr.addColorStop(0.55, 'rgba(255,230,180,0)');
    gr.addColorStop(1, 'rgba(255,232,185,0.55)');
    c.fillStyle = gr;
    c.fillRect(-s, -s, 2 * s, 2 * s);
    c.restore();
    if (it.kind === 'soleil') {
      c.strokeStyle = it.col;
      c.lineWidth = s * 0.08;
      c.lineCap = 'round';
      c.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * TAU) / 8;
        c.moveTo(Math.cos(a) * s * 0.36, Math.sin(a) * s * 0.36);
        c.lineTo(Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5);
      }
      c.stroke();
    }
    c.restore();
  }
}

// Joues de l'ouverture (épaisseur du mur), en perspective exacte
function ebrasements(c, cz, open) {
  const glow = clamp(0.35 + open);
  for (const side of [-1, 1]) {
    const X = side * (DW / 2);
    const pts = [[X, 0, 0], [X, DH, 0], [X, DH, WT], [X, 0, WT]].map((p) => proj(...p, cz));
    if (pts.some((p) => p[2] < 0.06)) continue;
    const gr = c.createLinearGradient(pts[0][0], 0, pts[2][0], 0);
    if (side < 0) {
      gr.addColorStop(0, '#bfa682');
      gr.addColorStop(1, `rgb(${q(lerp(200, 252, glow))},${q(lerp(180, 226, glow))},${q(lerp(150, 176, glow))})`);
    } else {
      gr.addColorStop(0, '#e9cf9f');
      gr.addColorStop(1, '#fff0c8');
    }
    c.fillStyle = gr;
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
  }
}

// Battant : peint une fois (même filtre que les calques), puis dessiné colonne par colonne,
// chacune à sa profondeur — perspective exacte du pivot, sans escalier. Flou quand il frôle la caméra.
const PORTE_BOX = [-14, -14, 858, 2068];
const PORTE_RES = 1.4;  // pixels par millimètre (le battant ne dépasse pas ~0,8 px/mm net à l'écran)
const PORTE_SVG = porteSVG();
const [PORTE_NET, PORTE_FLOU] = await Promise.all([
  raster({ box: PORTE_BOX, svg: PORTE_SVG, filters: ['paint'] }, PORTE_RES),
  raster({ box: PORTE_BOX, svg: PORTE_SVG, filters: ['paint', 'b16'] }, 0.5),
]);
function battant(c, th, cz) {
  const co = Math.cos(th), si = Math.sin(th), D = HZ - cz;
  const aAt = (x) => (F * HX - (x - VX) * D) / ((x - VX) * si - F * co);
  const xAt = (a) => VX + (F * (HX + a * co)) / (D + a * si);
  let aMin = 0;
  const aMax = DW;
  if (si > 1e-4) aMin = Math.max(aMin, (0.06 - D) / si);
  if (D + aMin * si < 0.06 || aMin >= aMax) return;
  // Champ visible (repère du décor), d'après la transformation de la caméra
  const m = c.getTransform();
  const vl = -m.e / m.a - 20, vr = (c.canvas.width - m.e) / m.a + 20;
  const xl = Math.max(xAt(aMin), vl), xr = Math.min(xAt(aMax), vr);
  if (xr <= xl) return;
  const [bx, by, bw] = PORTE_BOX;
  const dxda0 = F * (co * D - HX * si);
  c.imageSmoothingQuality = 'high';
  let a = clamp(aAt(xl), aMin, aMax);
  const aEnd = clamp(aAt(xr), aMin, aMax);
  for (let guard = 0; a < aEnd - 1e-7 && guard < 900; guard++) {
    // Pas : colonnes fines là où la profondeur varie vite (pas d'escalier sur les moulures)
    const d = D + a * si;
    const blurHere = clamp((1.15 - d) / 0.5);
    const tol = lerp(0.0016, 0.006, blurHere);
    const stepScreen = 5 / Math.max(1e-6, Math.abs(dxda0) / (d * d));
    const stepDepth = si > 1e-4 ? (tol * d) / si : 1;
    const a1 = Math.min(aEnd, a + Math.max(2e-5, Math.min(stepScreen, stepDepth)));
    const a0 = a;
    a = a1;
    const dm = D + ((a0 + a1) / 2) * si;
    const x0 = xAt(a0), x1 = xAt(a1);
    // Hauteur : le battant (0 → 2040 mm) à la profondeur de la colonne
    const yTop = VY - (F * (DH - EYE)) / dm;
    const yBot = VY + (F * EYE) / dm;
    const blur = clamp((1.15 - dm) / 0.5);
    for (const [img, alpha] of [[PORTE_NET, 1 - blur], [PORTE_FLOU, blur]]) {
      if (alpha <= 0.002) continue;
      const k = img.canvas.width / bw;
      const sx0 = (a0 * 1000 - bx) * k, sw = Math.max(0.5, (a1 - a0) * 1000 * k);
      c.globalAlpha = img === PORTE_FLOU && blur < 1 ? alpha : 1;
      c.drawImage(img.canvas, sx0, -by * k, sw, DH * 1000 * k, x0 - 0.3, yTop, x1 - x0 + 0.6, yBot - yTop);
    }
  }
  c.globalAlpha = 1;
}
// Contour visible du battant (la partie trop proche de la caméra est écartée)
const leafQuad = (th, cz) => {
  const co = Math.cos(th), si = Math.sin(th), D = HZ - cz;
  const a0 = si > 1e-4 ? Math.max(0, (0.12 - D) / si) : 0;
  if (a0 >= DW || D + a0 * si < 0.12) return null;
  const X0 = HX + a0 * co, Z0 = HZ + a0 * si, Xf = HX + DW * co, Zf = HZ + DW * si;
  return [proj(X0, DH, Z0, cz), proj(Xf, DH, Zf, cz), proj(Xf, 0, Zf, cz), proj(X0, 0, Z0, cz)];
};

/* ==========================================================================
   Le décor
   ========================================================================== */
const CHAMBRE = chambreSVG();
export default {
  id: 'porte-pov',
  home: { x: 960, y: 540, z: 1 },
  // En téléphone, la caméra ne quitte pas la bande x 380 → 1880 : on ne peint que celle-ci
  region: { portrait: [330, -300, 1600, 2000] },
  bg: '#16110d',
  layers: {
    chambreBords: { box: RBOX_LARGE, svg: CHAMBRE, filters: ['paint'], res: 0.5 },
    chambre: { box: RBOX, svg: CHAMBRE, filters: ['paint'] },
    couloir: { box: CBOX, svg: couloirSVG(), filters: ['paint'] },
    main: { box: [960, 280, 1100, 1280], svg: mainSVG(), filters: ['paint'] },
    fauteuil: { box: FBOX, svg: fauteuilSVG(), filters: ['paint', 'b10'] },
  },

  render(g, p, T) {
    const open = clamp(p.open ?? 0), walk = clamp(p.walk ?? 0), rel = clamp(p.release ?? 0);
    const th = TH0 + (TH1 - TH0) * open;
    const cz = -D0 + WALK * walk;
    const sR = (ZR - CZ1) / (ZR - cz);
    const roomTf = (c) => { c.translate(VX, VY); c.scale(sR, sR); c.translate(-VX, -VY); };
    const light = clamp(open * 1.6);

    /* 1. La chambre (avec un fond de secours sous la toile, pour les bords) */
    g.fx(1, (c) => {
      roomTf(c);
      c.fillStyle = '#33211a';
      c.fillRect(-900, 1400, 3800, 2600);
      c.fillStyle = '#c1b7a3';
      c.fillRect(-900, -1600, 3800, 1420);
    });
    if (sR < 0.995) g.img('chambreBords', { tf: { sx: sR, sy: sR, ox: VX, oy: VY } });
    g.img('chambre', { tf: { sx: sR, sy: sR, ox: VX, oy: VY } });
    g.fx(1, (c) => {
      roomTf(c);
      lumiere(c, T);
      rayons(c, T, 0.7 + 0.3 * light);
      poussiere(c, T, 0.5 + 0.5 * light);
      mobile(c, T);
    });
    // Le fauteuil du premier plan, à sa profondeur : il glisse vers la gauche pendant qu'on avance
    const sF = (FZ - CZ1) / (FZ - cz);
    g.img('fauteuil', { tf: { ox: VX + F_OFF, oy: VY, x: -F_OFF, y: 0, sx: sF, sy: sF } });

    /* 2. Ébrasements, puis le battant */
    g.fx(1, (c) => ebrasements(c, cz, open));
    g.fx(1, (c) => battant(c, th, cz));
    // Le battant se tourne vers la fenêtre : il prend la lumière dorée ; près du gond, l'ombre du mur
    g.fx(1, (c) => {
      const Qd = leafQuad(th, cz);
      if (!Qd) return;
      c.beginPath();
      Qd.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.closePath();
      const k = Math.sin(th) ** 2;
      const near = clamp((1.4 - Qd[0][2]) / 1.0);
      const gr = c.createLinearGradient(Qd[0][0], 0, Qd[1][0], 0);
      gr.addColorStop(0, `rgba(54,42,40,${0.3 * k + 0.5 * near})`);
      gr.addColorStop(0.6, `rgba(96,82,76,${0.32 * near})`);
      gr.addColorStop(1, `rgba(255,210,150,${0.32 * k * (1 - near)})`);
      c.fillStyle = gr;
      c.fill();
      // Le filet de lumière de l'entrebâillement
      const gap = 1 - clamp(open * 4);
      if (gap > 0) {
        const xe = Qd[1][0], xr = proj(DW / 2, 0, 0, cz)[0];
        const gl = c.createLinearGradient(xe - 30, 0, xr + 30, 0);
        gl.addColorStop(0, 'rgba(255,214,150,0)');
        gl.addColorStop(0.55, `rgba(255,208,130,${0.85 * gap})`);
        gl.addColorStop(1, 'rgba(255,214,150,0)');
        c.globalCompositeOperation = 'screen';
        c.fillStyle = gl;
        c.fillRect(xe - 30, -100, xr - xe + 60, 1300);
      }
    });

    /* 3. Le couloir (mur, chambranle) — il sort du cadre quand on passe la porte */
    const dc = -cz;
    if (dc > 0.14) {
      const sC = D0 / dc;
      g.img('couloir', { tf: { sx: sC, sy: sC, ox: VX, oy: VY } });
      g.fx(1, (c) => {
        c.translate(VX, VY); c.scale(sC, sC); c.translate(-VX, -VY);
        // Halo de l'applique
        c.globalCompositeOperation = 'screen';
        const hl = c.createRadialGradient(LAMP[0], LAMP[1] + 10, 10, LAMP[0], LAMP[1] + 10, 340);
        hl.addColorStop(0, 'rgba(255,214,150,0.6)');
        hl.addColorStop(1, 'rgba(255,226,170,0)');
        c.fillStyle = hl;
        c.fillRect(LAMP[0] - 360, LAMP[1] - 360, 720, 720);
        // L'œil s'habitue à la chambre : le couloir paraît plus sombre
        c.globalCompositeOperation = 'multiply';
        c.fillStyle = `rgba(150,118,98,${0.4 * light})`;
        c.beginPath();
        c.rect(-200, -200, 2400, 1600);
        c.rect(OPEN_R, -300, OPEN_L - OPEN_R, 2000);
        c.fill('evenodd');
        // Lumière dorée qui déborde de l'ouverture sur le chambranle (pas sur la chambre)
        c.globalCompositeOperation = 'screen';
        const mx = (OPEN_L + OPEN_R) / 2;
        const gr = c.createRadialGradient(mx + 80, 420, 200, mx, 420, 760);
        gr.addColorStop(0, `rgba(255,205,135,${0.3 * light})`);
        gr.addColorStop(1, 'rgba(255,205,135,0)');
        c.fillStyle = gr;
        c.beginPath();
        c.rect(-200, -200, 2400, 1600);
        c.rect(OPEN_R, -300, OPEN_L - OPEN_R, 2000);
        c.fill('evenodd');
      });
    }

    /* 4. La main : appui, accompagnement du battant, puis elle se retire */
    if (rel < 1) {
      const thc = Math.min(th, TH0 + (TH1 - TH0) * TH_REL);
      const [hx, hy, hd] = contact(thc, -D0);
      const s = H0[2] / hd;
      const dxda = (t) => (F * (Math.cos(t) * (HZ + D0) - HX * Math.sin(t))) / (HZ + HA * Math.sin(t) + D0) ** 2;
      const kx = clamp(dxda(thc) / dxda(TH0) / s, 0.75, 1);
      const k = rel;
      // En lâchant, la main revient vers nous et descend hors champ ; le poignet se relâche
      // (les doigts pivotent vers l'avant : la main se raccourcit en hauteur)
      const x = lerp(hx, 1470, k), y = lerp(hy, 1700, k ** 1.3);
      const sc = lerp(s, 1.3, k), sx = sc * lerp(kx, 1, k), rot = 0.4 * k;
      const tf = { x: x - H0[0], y: y - H0[1], ox: H0[0], oy: H0[1], sx, sy: sc * lerp(1, 0.6, k), rot };
      // Ombre de contact : la silhouette de la main, floutée, décalée vers la droite (lampe à gauche)
      g.fx(1, (c) => {
        const a = 0.42 * (1 - clamp(k * 3));
        if (a <= 0) return;
        c.translate(tf.ox + tf.x, tf.oy + tf.y);
        c.rotate(tf.rot);
        c.scale(tf.sx, tf.sy);
        c.translate(-tf.ox, -tf.oy);
        const m = c.getTransform();
        const ds = Math.hypot(m.a, m.b);
        c.setTransform(m.a, m.b, m.c, m.d, m.e - 40000, m.f);
        c.shadowColor = `rgba(70,46,34,${a})`;
        c.shadowBlur = 10 * ds;
        c.shadowOffsetX = 40000 + 9 * ds;
        c.shadowOffsetY = 4 * ds;
        c.fillStyle = '#000';
        c.fill(handPath());
      });
      g.img('main', { tf });
      // Lumière dorée venue de l'entrebâillement, sur le flanc droit
      const L = clamp(open * 3.5) * (1 - k);
      if (L > 0.01) {
        g.fx(1, (c) => {
          c.translate(tf.ox + tf.x, tf.oy + tf.y);
          c.rotate(tf.rot);
          c.scale(tf.sx, tf.sy);
          c.translate(-tf.ox, -tf.oy);
          c.globalCompositeOperation = 'screen';
          const gr = c.createLinearGradient(H0[0] + 70, 0, H0[0] - 10, 0);
          gr.addColorStop(0, `rgba(255,205,140,${0.6 * L})`);
          gr.addColorStop(1, 'rgba(255,205,140,0)');
          c.fillStyle = gr;
          c.fill(handPath());
          const R0 = SLEEVE_PTS.R[1], L0 = SLEEVE_PTS.L[1];
          const g2 = c.createLinearGradient(R0[0], R0[1], lerp(R0[0], L0[0], 0.6), lerp(R0[1], L0[1], 0.6));
          g2.addColorStop(0, `rgba(255,198,128,${0.42 * L})`);
          g2.addColorStop(1, 'rgba(255,198,128,0)');
          c.fillStyle = g2;
          c.fill(sleevePath());
        });
      }
    }

    /* 5. Éblouissement doux à l'ouverture, qui s'apaise quand on entre */
    g.fx(1, (c) => {
      const b = light * (1 - 0.8 * walk) * 0.12;
      if (b <= 0) return;
      c.globalCompositeOperation = 'screen';
      const gr = c.createRadialGradient(1150, 330, 40, 1050, 400, 1000);
      gr.addColorStop(0, `rgba(255,200,120,${b})`);
      gr.addColorStop(1, 'rgba(255,200,120,0)');
      c.fillStyle = gr;
      c.fillRect(-300, -300, 2600, 1700);
    });
  },

  shots: {
    'entree-pov': {
      dur: 7,
      cam: (t, portrait) => {
        const w = seg(t, 2.9, 7.0);
        // Pas : balancement très doux (un cycle latéral = deux pas)
        const env = seg(t, 3.0, 3.9) * (1 - 0.65 * seg(t, 6.0, 7.0));
        const ph = (t - 3.0) * TAU * 0.8;
        const bx = 2.6 * Math.sin(ph) * env + 1.2 * Math.sin(t * 0.7);
        const by = 3.6 * Math.sin(2 * ph) * env + 1.0 * Math.sin(t * 0.53 + 1);
        const x = portrait ? lerp(1060, 895, w) : 960;
        return { x: x + bx, y: 540 + by, z: 1 };
      },
      p: (t) => ({
        open: seg(t, 0.5, 3.3),
        release: seg(t, 1.45, 2.25, ease.inOut),
        walk: seg(t, 2.9, 7.0),
      }),
    },
  },
};
