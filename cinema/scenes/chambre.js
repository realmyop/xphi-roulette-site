/* ==========================================================================
   La chambre — plan large, perspective à un point de fuite.
   La pièce est construite en mètres puis projetée : X de gauche à droite
   (0 → 3,8), Y vers le haut (sol = 0), Z depuis le mur du fond vers nous.
   Le soleil entre par la fenêtre du mur de droite : les taches sur le mur
   du fond et sur le plancher sont obtenues en projetant chaque vitre le long
   d'une même direction, elles se raccordent donc au pied du mur, et le
   berceau y découpe l'ombre de ses barreaux.
   ========================================================================== */
import { P, lin, rad, rng } from '../kit.js';
import { TAU, clamp, lerp, ease, seg } from '../../film/engine.js';

/* ---------- Projection ---------- */
const D = 6, EYE = 1.13, CX = 1.9, F = 1698, VX = 1000, VY = 400;
const RW = 3.8, RH = 2.45; // largeur et hauteur de la pièce (m)
const pr = (X, Y, Z) => { const k = F / (D - Z); return [VX + (X - CX) * k, VY - (Y - EYE) * k]; };
const kz = (Z) => F / (D - Z); // pixels par mètre à la profondeur Z
const n1 = (v) => Math.round(v * 10) / 10;
const pt = (p) => { const [x, y] = pr(p[0], p[1], p[2]); return `${n1(x)},${n1(y)}`; };
const pts3 = (a) => a.map(pt).join(' ');
const poly3 = (a, attrs = '') => (a.length > 2 ? `<polygon points="${pts3(a)}" ${attrs}/>` : '');
// Chemin décrit par des commandes en 3D : ['M', p], ['L', p], ['Q', p, p], ['C', p, p, p], ['Z']
const path3 = (cmds) => cmds.map(([c, ...ps]) => c + ps.map(pt).join(' ')).join(' ');
// Rectangles dans les plans de la pièce
const quadX = (x, z0, z1, y0, y1) => [[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]];
const quadY = (y, x0, x1, z0, z1) => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];
const quadZ = (z, x0, x1, y0, y1) => [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]];
const box = (x0, x1, y0, y1, z0, z1) =>
  [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
const scr = (a) => a.map((p) => pr(p[0], p[1], p[2]));

/* ---------- Soleil ---------- */
const SUN = [-1, -0.7, -0.45]; // direction des rayons : vers la gauche, vers le bas, vers le mur du fond
const along = (p, k) => [p[0] + SUN[0] * k, p[1] + SUN[1] * k, p[2] + SUN[2] * k];
const toY = (y) => (p) => along(p, (p[1] - y) / -SUN[1]);
const toZ = (z) => (p) => along(p, (p[2] - z) / -SUN[2]);

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

/* ---------- Fenêtre (mur de droite) ---------- */
const WIN = { z0: 0.32, z1: 2.58, y0: 0.75, y1: 2.2, depth: 0.2 };
const OPEN = [0.56, 2.32]; // partie laissée libre par les rideaux mi-tirés
const COLS = [[0.38, 0.885], [0.915, 1.42], [1.48, 1.985], [2.015, 2.52]];
const ROWS = [[0.81, 1.27], [1.3, 1.74], [1.77, 2.14]];
const PANES = [];
for (const [a, b] of COLS) for (const [c, d] of ROWS) PANES.push(quadX(RW, a, b, c, d));
// Pour la lumière, les vitres sont un peu rétrécies : la pénombre élargit l'ombre des croisillons
const PANES_L = [];
for (const [a, b] of COLS) for (const [c, d] of ROWS) PANES_L.push(quadX(RW, a + 0.022, b - 0.022, c + 0.025, d - 0.025));
const LIT = PANES_L.map((q) => clip(clip(q, (p) => p[2] - OPEN[0]), (p) => OPEN[1] - p[2])).filter((q) => q.length > 2);

// Taches de soleil : sur le plancher (devant le mur) et sur le mur du fond (au-dessus du sol)
const onFloor = (q) => clip(clip(q.map(toY(0)), (p) => p[2]), (p) => p[0]);
const onWall = (q) => clip(clip(q.map(toZ(0)), (p) => p[1]), (p) => p[0]);
const FLOOR_LIT = LIT.map(onFloor).filter((q) => q.length > 2);
const WALL_LIT = LIT.map(onWall).filter((q) => q.length > 2);
// Ouverture entière (sans croisillons) : sert à éclairer le berceau sans le zébrer
const OPENING = clip(clip(quadX(RW, WIN.z0, WIN.z1, ROWS[0][0], ROWS[2][1]), (p) => p[2] - OPEN[0]), (p) => OPEN[1] - p[2]);

/* ---------- Berceau ---------- */
const CR = { x0: 0.95, x1: 2.2, zb: 0.07, zf: 0.64, top: 0.915, bot: 0.3, post: 0.027, mat0: 0.4, mat1: 0.53 };
const BARS = Array.from({ length: 14 }, (_, i) => CR.x0 + ((CR.x1 - CR.x0) * (i + 1)) / 15);
const ENDS = Array.from({ length: 6 }, (_, i) => CR.zb + ((CR.zf - CR.zb) * (i + 1)) / 7);
const BAR_R = 0.011;

// Volumes qui portent ombre dans la tache de soleil
const CASTERS = [];
for (const z of [CR.zb, CR.zf]) {
  for (const x of BARS) CASTERS.push(box(x - BAR_R, x + BAR_R, CR.bot + 0.04, CR.top - 0.04, z - BAR_R, z + BAR_R));
  CASTERS.push(box(CR.x0, CR.x1, CR.top - 0.04, CR.top, z - 0.018, z + 0.018));
  CASTERS.push(box(CR.x0, CR.x1, CR.bot, CR.bot + 0.04, z - 0.018, z + 0.018));
}
for (const x of [CR.x0, CR.x1]) {
  for (const z of ENDS) CASTERS.push(box(x - BAR_R, x + BAR_R, CR.bot + 0.04, CR.top - 0.04, z - BAR_R, z + BAR_R));
  CASTERS.push(box(x - 0.018, x + 0.018, CR.top - 0.04, CR.top, CR.zb, CR.zf));
  for (const z of [CR.zb, CR.zf]) CASTERS.push(box(x - CR.post, x + CR.post, 0, CR.top + 0.07, z - CR.post, z + CR.post));
}
CASTERS.push(box(CR.x0 + 0.03, CR.x1 - 0.03, CR.bot + 0.02, CR.mat1, CR.zb + 0.03, CR.zf - 0.03)); // matelas et sommier
CASTERS.push(box(1.2, 1.9, CR.mat1, 0.66, 0.22, 0.5)); // le bébé
const shadowFloor = (c) => clip(hull(c.map(toY(0)), 0, 2), (p) => p[2]);
const shadowWall = (c) => clip(hull(c.map(toZ(0)), 0, 1), (p) => p[1]);

/* ---------- Calque « fond » : la pièce ---------- */
const R = rng(1907);
const NEAR = 3.75; // profondeur du bord avant de la pièce (hors cadre)

// Plancher : lames qui fuient vers le point de fuite, joints décalés, veinage léger
function plancher() {
  const tones = ['#a8764c', '#b07d52', '#9f6d45', '#ab7a50', '#a37149', '#b5845a'];
  const bw = RW / 28;
  let s = '';
  for (let i = 0; i < 28; i++) {
    const x0 = i * bw, x1 = x0 + bw;
    s += poly3(quadY(0, x0, x1, 0, NEAR), `fill="${tones[Math.floor(R() * tones.length)]}"`);
    // joints de bout : deux par lame, à des profondeurs tirées au sort
    for (let j = 0; j < 2; j++) {
      const z = 0.3 + j * 1.7 + R() * 1.4;
      s += `<path d="${path3([['M', [x0, 0, z]], ['L', [x1, 0, z]]])}" stroke="${P.floorDark}" stroke-opacity=".35" stroke-width="1.3" fill="none"/>`;
    }
    // veinage : une ligne souple, très discrète
    const xv = x0 + bw * (0.3 + R() * 0.4), w = bw * 0.18;
    s += `<path d="${path3([['M', [xv, 0, 0.1]], ['C', [xv + w, 0, 1.2], [xv - w, 0, 2.2], [xv + w * 0.5, 0, NEAR]]])}" stroke="#7a5233" stroke-opacity=".22" stroke-width="1.2" fill="none"/>`;
  }
  // rainures entre les lames
  for (let i = 1; i < 28; i++) {
    const x = i * bw;
    s += `<path d="${path3([['M', [x, 0, 0]], ['L', [x, 0, NEAR]]])}" stroke="${P.floorDark}" stroke-opacity=".5" stroke-width="1.3" fill="none"/>`;
  }
  return s;
}

// Tapis rond tressé : anneaux concentriques
function tapis() {
  const cx = 1.5, cz = 1.55, rings = ['#cbb48c', '#d4bf99', '#ccb68f', '#d8c4a0', '#cfb993', '#dac7a3', '#d2bd97'];
  let s = '';
  // ombre douce sous le bord
  const edge = Array.from({ length: 64 }, (_, i) => [cx + 0.72 * Math.cos((i / 64) * TAU), 0, cz + 0.72 * Math.sin((i / 64) * TAU)]);
  s += `<polygon points="${pts3(edge)}" fill="#3a2a22" opacity=".35" filter="url(#b6)"/>`;
  rings.forEach((c, k) => {
    const r = 0.68 * (1 - k / rings.length);
    const ring = Array.from({ length: 72 }, (_, i) => [cx + r * Math.cos((i / 72) * TAU), 0.006, cz + r * Math.sin((i / 72) * TAU)]);
    s += `<polygon points="${pts3(ring)}" fill="${c}" stroke="#a88f6c" stroke-opacity=".35" stroke-width="1.1"/>`;
  });
  return s;
}

// Porte (mur de gauche), fermée ; un filet de lumière chaude du couloir dessous
function porte() {
  const z0 = 1.32, z1 = 2.22, h = 2.02, f = 0.075;
  let s = '';
  s += poly3(quadX(0.005, z0 - f, z1 + f, 0, h + f), `fill="#e2dccf"`); // chambranle
  s += poly3(quadX(0.012, z0, z1, 0.012, h), `fill="#ece6da"`);         // battant
  // panneaux moulurés
  for (const [y0, y1] of [[0.18, 0.92], [1.08, 1.86]]) {
    const q = quadX(0.014, z0 + 0.12, z1 - 0.12, y0, y1);
    s += poly3(q, `fill="#e2dbcd" stroke="#b9b0a0" stroke-width="2.4"`);
    s += `<path d="${path3([['M', [0.014, y0, z0 + 0.12]], ['L', [0.014, y1, z0 + 0.12]], ['L', [0.014, y1, z1 - 0.12]]])}" stroke="#a69d8d" stroke-width="3" fill="none" opacity=".7"/>`;
    s += `<path d="${path3([['M', [0.014, y1, z1 - 0.12]], ['L', [0.014, y0, z1 - 0.12]], ['L', [0.014, y0, z0 + 0.12]]])}" stroke="#faf6ee" stroke-width="2.4" fill="none"/>`;
  }
  // poignée en métal clair
  const hx = 0.03, hz = z1 - 0.09, hy = 1.0;
  s += poly3(quadX(0.016, hz - 0.02, hz + 0.02, hy - 0.07, hy + 0.07), `fill="#b5bab8" stroke="#8e9493" stroke-width="1.5"`);
  s += `<path d="${path3([['M', [hx, hy + 0.012, hz]], ['Q', [hx + 0.055, hy + 0.014, hz - 0.01], [hx + 0.06, hy + 0.004, hz - 0.12]]])}" stroke="#7d8483" stroke-width="9" stroke-linecap="round" fill="none"/>`;
  s += `<path d="${path3([['M', [hx, hy + 0.016, hz]], ['Q', [hx + 0.055, hy + 0.018, hz - 0.01], [hx + 0.06, hy + 0.008, hz - 0.12]]])}" stroke="#d3d8d6" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  // ombre propre du battant (il est dans le côté sombre de la pièce)
  s += poly3(quadX(0.016, z0 - f, z1 + f, 0, h + f), `fill="url(#chambre-porteOmbre)"`);
  // filet lumineux sous la porte
  s += poly3(quadX(0.02, z0 + 0.02, z1 - 0.02, 0, 0.012), `fill="#ffe2b0"`);
  return s;
}

// Rideaux de lin mi-tirés, lumineux en contre-jour
function rideau(zA, zB, inner) {
  const x = RW - 0.045, top = 2.27, bot = 0.03;
  // bord intérieur ondulé, ourlet souple
  const zi = inner === 'right' ? zB : zA, zo = inner === 'right' ? zA : zB;
  const sw = inner === 'right' ? 1 : -1;
  const d = path3([
    ['M', [x, top, zo]], ['L', [x, top, zi]],
    ['C', [x, 1.6, zi + sw * 0.05], [x, 0.9, zi - sw * 0.03], [x, bot, zi + sw * 0.07]],
    ['Q', [x, bot - 0.03, (zi + zo) / 2], [x, bot + 0.01, zo]], ['Z'],
  ]);
  let s = `<path d="${d}" fill="url(#chambre-lin-${inner})"/>`;
  // plis : bandes d'ombre verticales
  const n = 6;
  for (let i = 1; i < n; i++) {
    const z = lerp(zo, zi, i / n), w = 0.015 + 0.01 * (i % 2), dz = (zi - zo) / n;
    s += `<path d="${path3([['M', [x, top, z]], ['C', [x, 1.5, z + w], [x, 0.8, z - w], [x, bot + 0.02, z + 2 * w]]])}" stroke="#a8977a" stroke-opacity=".6" stroke-width="${6 + 4 * (i % 2)}" fill="none" filter="url(#b3)"/>`;
    s += `<path d="${path3([['M', [x, top, z + dz * 0.45]], ['C', [x, 1.5, z + w + dz * 0.45], [x, 0.8, z - w + dz * 0.45], [x, bot + 0.02, z + 2 * w + dz * 0.45]]])}" stroke="#fffaf0" stroke-opacity=".5" stroke-width="4" fill="none" filter="url(#b3)"/>`;
  }
  // anneaux sur la tringle
  for (let i = 0; i <= 5; i++) {
    const [rx, ry] = pr(x, top + 0.035, lerp(zo, zi, i / 5)), k = kz(lerp(zo, zi, i / 5));
    s += `<ellipse cx="${n1(rx)}" cy="${n1(ry)}" rx="${n1(0.012 * k)}" ry="${n1(0.03 * k)}" fill="none" stroke="${P.woodDark}" stroke-width="2.4"/>`;
  }
  return s;
}

// Fenêtre : embrasure, cadre crème, vitres éblouies, un peu de feuillage au-dehors
function fenetre() {
  const { z0, z1, y0, y1, depth } = WIN, xg = RW + depth;
  let s = '';
  // embrasure : joue du fond (au soleil), linteau (à l'ombre), appui
  s += poly3([[RW, y0, z0], [xg, y0, z0], [xg, y1, z0], [RW, y1, z0]], `fill="#f4dcb4"`);
  s += poly3([[RW, y1, z0], [xg, y1, z0], [xg, y1, z1], [RW, y1, z1]], `fill="#9aa3a0"`);
  s += poly3([[RW - 0.07, y0, z0 - 0.05], [xg, y0, z0], [xg, y0, z1], [RW - 0.07, y0, z1 + 0.05]], `fill="#efe2cc"`);
  s += poly3(quadX(RW - 0.07, z0 - 0.05, z1 + 0.05, y0 - 0.04, y0), `fill="#d9cdb8"`);
  // cadre et petits bois
  s += poly3(quadX(xg - 0.01, z0, z1, y0, y1), `fill="#e9dfcd"`);
  // vitres : ciel éclatant, feuillage pâle dans le bas
  const cl = PANES.map((q) => q.map((p) => [xg - 0.02, p[1], p[2]]));
  s += `<clipPath id="chambre-vitres">${cl.map((q) => poly3(q)).join('')}</clipPath>`;
  s += `<g clip-path="url(#chambre-vitres)">`;
  s += poly3(quadX(xg - 0.02, z0, z1, y0, y1), `fill="url(#chambre-vitre)"`);
  const fol = rng(77);
  for (let i = 0; i < 9; i++) {
    const z = z0 + fol() * (z1 - z0), y = y0 + 0.05 + fol() * 0.55, r = 0.18 + fol() * 0.22;
    const [cx, cy] = pr(xg, y, z), k = kz(z);
    s += `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(r * k * 0.45)}" ry="${n1(r * k * 0.8)}" fill="${P.leafLight}" opacity=".32" filter="url(#b10)"/>`;
  }
  s += `</g>`;
  return s;
}

// Étagère et livres (mur du fond, à gauche du berceau) ; petit cadre au-dessus
function etagere() {
  const x0 = 0.2, x1 = 0.86, y = 1.3, dz = 0.2;
  let s = '';
  // ombre portée douce sous la planche
  s += poly3(quadZ(0.002, x0 - 0.02, x1 + 0.01, y - 0.16, y - 0.02), `fill="#4a5560" opacity=".28" filter="url(#b6)"`);
  // livres debout
  const cols = ['#7f8f8b', '#b98a6a', '#c8b88e', '#6f7b8e', '#a8756a', '#ddd2bd', '#8b9a7c', '#c49a74'];
  const br = rng(31);
  let x = x0 + 0.04;
  for (let i = 0; i < 8; i++) {
    const w = 0.026 + br() * 0.022, h = 0.17 + br() * 0.08, c = cols[i];
    if (i === 6) { // un livre penché contre les autres
      const a = 0.32, X = x + 0.02;
      const q = [[X, y, dz - 0.03], [X + w, y, dz - 0.03], [X + w + h * Math.sin(a), y + h * Math.cos(a), dz - 0.03], [X + h * Math.sin(a), y + h * Math.cos(a), dz - 0.03]];
      s += poly3(q, `fill="${c}" stroke="#3b3330" stroke-opacity=".25" stroke-width="1.2"`);
      x += w + h * Math.sin(a) + 0.03;
      continue;
    }
    s += poly3(quadZ(dz - 0.03, x, x + w, y, y + h), `fill="${c}" stroke="#3b3330" stroke-opacity=".25" stroke-width="1.2"`);
    s += poly3(quadZ(dz - 0.029, x, x + w, y + h * 0.78, y + h * 0.82), `fill="#f1e6d0" opacity=".45"`);
    x += w + 0.003;
  }
  // petit bol en céramique au bout de l'étagère
  const [bx, by] = pr(x1 - 0.1, y, dz - 0.08), kb = kz(dz - 0.08);
  s += `<path d="M${n1(bx - 0.06 * kb)},${n1(by - 0.05 * kb)} Q${n1(bx)},${n1(by + 0.02 * kb)} ${n1(bx + 0.06 * kb)},${n1(by - 0.05 * kb)} Z" fill="#c9cfc7"/>`;
  // planche : face avant et dessous (on est sous l'étagère)
  s += poly3([[x0, y, 0], [x1, y, 0], [x1, y, dz], [x0, y, dz]], `fill="#b88d5e"`);
  s += poly3(quadZ(dz, x0, x1, y - 0.03, y), `fill="${P.woodLight}"`);
  s += poly3([[x0, y - 0.03, 0], [x1, y - 0.03, 0], [x1, y - 0.03, dz], [x0, y - 0.03, dz]], `fill="#8e6a48"`);
  // équerres
  for (const xe of [x0 + 0.08, x1 - 0.08]) s += poly3([[xe, y - 0.03, 0.005], [xe, y - 0.03, dz - 0.02], [xe, y - 0.2, 0.005]], `fill="#9b7550"`);

  // cadre : un soleil sur des collines
  const fx0 = 0.4, fx1 = 0.66, fy0 = 1.53, fy1 = 1.8;
  s += poly3(quadZ(0.002, fx0 - 0.025, fx1 - 0.02, fy0 - 0.04, fy1 - 0.025), `fill="#45505a" opacity=".3" filter="url(#b3)"`);
  s += poly3(quadZ(0.02, fx0, fx1, fy0, fy1), `fill="${P.woodDark}"`);
  s += poly3(quadZ(0.021, fx0 + 0.015, fx1 - 0.015, fy0 + 0.015, fy1 - 0.015), `fill="#efe6d4"`);
  const ix0 = fx0 + 0.04, ix1 = fx1 - 0.04, iy0 = fy0 + 0.04, iy1 = fy1 - 0.04;
  s += poly3(quadZ(0.022, ix0, ix1, iy0, iy1), `fill="#cfdde0"`);
  const [sx, sy] = pr((ix0 + ix1) / 2 + 0.02, iy0 + 0.11, 0.022);
  s += `<circle cx="${n1(sx)}" cy="${n1(sy)}" r="${n1(0.03 * kz(0.022))}" fill="#e9a87c"/>`;
  s += `<path d="${path3([['M', [ix0, iy0, 0.023]], ['L', [ix0, iy0 + 0.06, 0.023]], ['Q', [ix0 + 0.06, iy0 + 0.12, 0.023], [ix0 + 0.12, iy0 + 0.05, 0.023]], ['Q', [ix1 - 0.03, iy0 + 0.1, 0.023], [ix1, iy0 + 0.06, 0.023]], ['L', [ix1, iy0, 0.023]], ['Z']])}" fill="${P.leafLight}"/>`;
  s += `<path d="${path3([['M', [ix0, iy0, 0.024]], ['L', [ix0, iy0 + 0.025, 0.024]], ['Q', [ix0 + 0.1, iy0 + 0.07, 0.024], [ix1, iy0 + 0.02, 0.024]], ['L', [ix1, iy0, 0.024]], ['Z']])}" fill="${P.leaf}"/>`;
  return s;
}

// Ombres d'ambiance (occlusion) : coins de la pièce, pied des murs
function ambiance() {
  let s = '';
  const dark = '#3c4655';
  s += poly3(quadZ(0.001, 0, RW, 0, RH), `fill="url(#chambre-ombreG)"`);
  s += poly3(quadZ(0.001, 0, 0.35, 0, RH), `fill="url(#chambre-coinG)"`);
  s += poly3(quadZ(0.001, RW - 0.35, RW, 0, RH), `fill="url(#chambre-coinD)"`);
  s += poly3(quadZ(0.001, 0, RW, RH - 0.3, RH), `fill="url(#chambre-coinH)"`);
  // ombre au ras du sol, le long du mur du fond
  s += poly3(quadY(0.001, 0, RW, 0, 0.14), `fill="${dark}" opacity=".22" filter="url(#b6)"`);
  // pénombre derrière et sous le berceau (ombre bleutée)
  s += poly3(quadZ(0.002, CR.x0 - 0.02, CR.x1 + 0.02, 0, CR.top + 0.02), `fill="${dark}" opacity=".2" filter="url(#b16)"`);
  s += poly3(quadY(0.002, CR.x0 - 0.04, CR.x1 + 0.05, CR.zb - 0.05, CR.zf + 0.07), `fill="#2e3546" opacity=".42" filter="url(#b10)"`);
  // grandes taches de peinture sur les murs : le mur n'est jamais uni
  const m = rng(5);
  for (let i = 0; i < 14; i++) {
    const [cx, cy] = pr(m() * RW, 0.3 + m() * 2, 0);
    const c = ['#b4bfbb', '#97a3a4', '#aeb8b1', '#a1aca9'][i % 4];
    s += `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(110 + m() * 180)}" ry="${n1(70 + m() * 130)}" fill="${c}" opacity=".6" filter="url(#b28)"/>`;
  }
  return s;
}

const FOND = `
<defs>
  ${lin('chambre-murFond', [[0, '#9eaaa9'], [0.45, P.wall], [1, '#a6b0aa']])}
  ${lin('chambre-murG', [[0, '#5f6a6e'], [0.6, '#7b8687'], [1, P.wallLeft]], 0, 0, 1, 0)}
  ${lin('chambre-murD', [[0, P.wallRight], [0.5, '#8a9595'], [1, '#6d787b']], 0, 0, 1, 0)}
  ${lin('chambre-plafond', [[0, '#a59f92'], [1, P.ceiling]])}
  ${lin('chambre-sol', [[0, '#000', 0], [0.35, '#2a1c16', 0.12], [1, '#1d1418', 0.55]])}
  ${lin('chambre-vitre', [[0, '#fffdf6'], [0.5, '#fff6e2'], [1, '#ffe9bc']])}
  ${lin('chambre-porteOmbre', [[0, '#46505f', 0.46], [1, '#56606e', 0.26]], 0, 0, 1, 0)}
  ${lin('chambre-lin-right', [[0, '#b3a385'], [0.4, '#d3c2a2'], [0.62, '#f1e2c6'], [1, '#fbf1de']], 0, 0, 1, 0)}
  ${lin('chambre-lin-left', [[0, '#fff8ea'], [0.4, '#f9eedb'], [0.62, P.linen], [1, '#c9b694']], 0, 0, 1, 0)}
  ${lin('chambre-coinG', [[0, '#3c4655', 0.32], [1, '#3c4655', 0]], 0, 0, 1, 0)}
  ${lin('chambre-coinD', [[0, '#3c4655', 0], [1, '#3c4655', 0.26]], 0, 0, 1, 0)}
  ${lin('chambre-ombreG', [[0, '#34405a', 0.42], [0.45, '#34405a', 0.14], [0.8, '#34405a', 0]], 0, 0, 1, 0)}
  ${lin('chambre-coinH', [[0, '#3c4655', 0.22], [1, '#3c4655', 0]])}
</defs>
${poly3(quadY(RH, -0.2, RW + 0.2, 0, NEAR), 'fill="url(#chambre-plafond)"')}
${poly3(quadX(0, 0, NEAR, -0.1, RH), 'fill="url(#chambre-murG)"')}
${poly3(quadX(RW, 0, NEAR, -0.1, RH), 'fill="url(#chambre-murD)"')}
${poly3(quadZ(0, 0, RW, 0, RH), 'fill="url(#chambre-murFond)"')}
${plancher()}
${poly3(quadY(0.001, 0, RW, 0, NEAR), 'fill="url(#chambre-sol)"')}
${ambiance()}
${poly3(quadZ(0.003, 0, RW, RH - 0.035, RH), 'fill="#d9d2c3"')}
${poly3(quadX(0.003, 0, NEAR, RH - 0.035, RH), 'fill="#b9b4a8"')}
${poly3(quadX(RW - 0.003, 0, NEAR, RH - 0.035, RH), 'fill="#c3bdb0"')}
${poly3(quadZ(0.004, 0, RW, 0, 0.09), `fill="${P.base}"`)}
${poly3(quadZ(0.005, 0, RW, 0.082, 0.09), 'fill="#f6f1e8"')}
${poly3(quadX(0.004, 0, NEAR, 0, 0.09), 'fill="#c9c3b7"')}
${poly3(quadX(RW - 0.004, 0, NEAR, 0, 0.09), 'fill="#d4cdc0"')}
${porte()}
${fenetre()}
<path d="${path3([['M', [RW - 0.06, 2.31, 0.1]], ['L', [RW - 0.06, 2.31, 2.84]]])}" stroke="${P.woodDark}" stroke-width="5" stroke-linecap="round" fill="none"/>
${rideau(0.14, OPEN[0], 'right')}
${rideau(OPEN[1], 2.8, 'left')}
${etagere()}
${tapis()}
`;

/* ---------- Calque « lumiere » : taches de soleil (fusion en « screen ») ---------- */
const MASK_BOX = 'x="-300" y="-200" width="2600" height="1500"';
const LUMIERE = `
<defs>
  <mask id="chambre-ombres" maskUnits="userSpaceOnUse" ${MASK_BOX}>
    <rect ${MASK_BOX} fill="#fff"/>
    <g fill="#000">${CASTERS.map((c) => poly3(shadowFloor(c)) + poly3(shadowWall(c))).join('')}</g>
  </mask>
</defs>
<g mask="url(#chambre-ombres)">
  <g filter="url(#b16)" opacity=".5">
    ${FLOOR_LIT.map((q) => poly3(q, 'fill="#ffb862"')).join('')}
    ${WALL_LIT.map((q) => poly3(q, 'fill="#ffc47a"')).join('')}
  </g>
  ${FLOOR_LIT.map((q) => poly3(q, 'fill="#ffcb82" opacity=".92"')).join('')}
  ${WALL_LIT.map((q) => poly3(q, 'fill="#ffd696" opacity=".85"')).join('')}
</g>
`;

/* ---------- Le berceau, en deux calques (derrière le bébé / devant) ---------- */
const dPoly = (a) => (a.length > 2 ? 'M' + a.map(pt).join(' L') + ' Z' : '');
const dCircle = ([x, y], r) => `M${n1(x - r)},${n1(y)} a${n1(r)},${n1(r)} 0 1,0 ${n1(2 * r)},0 a${n1(r)},${n1(r)} 0 1,0 ${n1(-2 * r)},0 Z`;
// Barreau arrondi vertical, dans le plan Z = z
const dBar = (x, z, y0, y1, r) => {
  const k = kz(z), [a, b] = pr(x - r, y1, z), [c, d] = pr(x + r, y0, z), rr = n1(r * k);
  return `M${n1(a)},${n1(b + rr)} Q${n1(a)},${n1(b)} ${n1((a + c) / 2)},${n1(b)} Q${n1(c)},${n1(b)} ${n1(c)},${n1(b + rr)} L${n1(c)},${n1(d - rr)} Q${n1(c)},${n1(d)} ${n1((a + c) / 2)},${n1(d)} Q${n1(a)},${n1(d)} ${n1(a)},${n1(d - rr)} Z`;
};
// Montant : pied, fût, col tourné et boule
function montant(x, z) {
  const r = CR.post, T = CR.top, k = kz(z);
  const body = dBar(x, z, 0, T + 0.05, r);
  const neck = dBar(x, z, T + 0.04, T + 0.075, r * 0.55);
  const ball = dCircle(pr(x, T + 0.105, z), 0.036 * k);
  return { d: body + neck + ball, ball: pr(x, T + 0.105, z), rb: 0.036 * k };
}
// Rail horizontal (le long de X) dans le plan Z = z
function dRailX(z, y0, y1) {
  const [a, b] = pr(CR.x0, y1, z), [c, d] = pr(CR.x1, y0, z), rr = n1((d - b) / 2);
  return `M${n1(a)},${n1(b + rr)} Q${n1(a)},${n1(b)} ${n1(a + rr)},${n1(b)} L${n1(c - rr)},${n1(b)} Q${n1(c)},${n1(b)} ${n1(c)},${n1(b + rr)} L${n1(c)},${n1(d - rr)} Q${n1(c)},${n1(d)} ${n1(c - rr)},${n1(d)} L${n1(a + rr)},${n1(d)} Q${n1(a)},${n1(d)} ${n1(a)},${n1(d - rr)} Z`;
}

const WOOD = `
  ${lin('chambre-bois', [[0, P.woodDark], [0.3, P.wood], [0.72, P.woodLight], [1, '#d9a86e']], 0, 0, 1, 0)}
  ${lin('chambre-boisRail', [[0, P.woodLight], [0.5, P.wood], [1, P.woodDark]])}
  ${rad('chambre-boule', [[0, '#f3cf98'], [0.45, P.woodLight], [1, P.woodDark]], 0.62, 0.35, 0.7)}
  ${lin('chambre-drap', [[0, '#d6cbb8'], [0.5, '#c4b59d'], [1, '#a99a83']])}
`;
const barsFill = 'fill="url(#chambre-bois)" stroke="#6e4a2c" stroke-opacity=".35" stroke-width="1"';

// Derrière : montants et barreaux du fond, côtés, sommier et matelas
const BACK = [], FRONT = [], MAT = [];
let BERCEAU_FOND = `<defs>${WOOD}</defs>`;
{
  const z = CR.zb;
  for (const x of [CR.x0, CR.x1]) { const m = montant(x, z); BACK.push(m.d); BERCEAU_FOND += `<path d="${m.d}" ${barsFill}/>`; }
  let bars = BARS.map((x) => dBar(x, z, CR.bot + 0.03, CR.top - 0.03, BAR_R)).join('');
  BERCEAU_FOND += `<path d="${bars}" ${barsFill}/>`;
  BERCEAU_FOND += `<path d="${dRailX(z, CR.top - 0.04, CR.top)}" fill="url(#chambre-boisRail)"/>`;
  BERCEAU_FOND += `<path d="${dRailX(z, CR.bot, CR.bot + 0.04)}" fill="url(#chambre-boisRail)"/>`;
  BACK.push(bars);
  // côtés (vus de l'intérieur) : barreaux et rail supérieur, en perspective
  for (const x of [CR.x0, CR.x1]) {
    const s = ENDS.map((zz) => dBar(x, zz, CR.bot + 0.03, CR.top - 0.03, BAR_R)).join('');
    const rail = dPoly([[x, CR.top - 0.04, CR.zb], [x, CR.top - 0.04, CR.zf], [x, CR.top, CR.zf], [x, CR.top, CR.zb]]);
    const low = dPoly([[x, CR.bot, CR.zb], [x, CR.bot, CR.zf], [x, CR.bot + 0.04, CR.zf], [x, CR.bot + 0.04, CR.zb]]);
    BERCEAU_FOND += `<path d="${s}" ${barsFill} opacity=".95"/><path d="${rail + low}" fill="${P.wood}" stroke="#6e4a2c" stroke-opacity=".3"/>`;
    BACK.push(s, rail);
  }
  // sommier, puis matelas habillé du drap-housse
  const x0 = CR.x0 + 0.03, x1 = CR.x1 - 0.03, z0 = CR.zb + 0.03, z1 = CR.zf - 0.025;
  BERCEAU_FOND += poly3(quadZ(z1, x0, x1, CR.mat0 - 0.04, CR.mat0), `fill="${P.woodDark}"`);
  const top = path3([
    ['M', [x0 + 0.03, CR.mat1, z0]], ['L', [x1 - 0.03, CR.mat1, z0]], ['Q', [x1, CR.mat1, z0], [x1, CR.mat1, z0 + 0.04]],
    ['L', [x1, CR.mat1, z1]], ['L', [x0, CR.mat1, z1]], ['L', [x0, CR.mat1, z0 + 0.04]], ['Q', [x0, CR.mat1, z0], [x0 + 0.03, CR.mat1, z0]], ['Z'],
  ]);
  const face = path3([
    ['M', [x0, CR.mat1, z1]], ['L', [x1, CR.mat1, z1]], ['Q', [x1 + 0.01, CR.mat1 - 0.01, z1], [x1 + 0.005, CR.mat1 - 0.04, z1]],
    ['L', [x1 + 0.005, CR.mat0 + 0.01, z1]], ['Q', [x1, CR.mat0, z1], [x1 - 0.03, CR.mat0, z1]], ['L', [x0 + 0.03, CR.mat0, z1]],
    ['Q', [x0, CR.mat0, z1], [x0 - 0.005, CR.mat0 + 0.01, z1]], ['L', [x0 - 0.005, CR.mat1 - 0.04, z1]], ['Q', [x0 - 0.01, CR.mat1 - 0.01, z1], [x0, CR.mat1, z1]], ['Z'],
  ]);
  BERCEAU_FOND += `<path d="${top}" fill="#e2d8c6"/><path d="${face}" fill="url(#chambre-drap)"/>`;
  // plis du drap et ourlet élastique
  BERCEAU_FOND += `<path d="${path3([['M', [x0 + 0.02, CR.mat0 + 0.02, z1]], ['Q', [(x0 + x1) / 2, CR.mat0 + 0.035, z1], [x1 - 0.02, CR.mat0 + 0.02, z1]]])}" stroke="#c9b89c" stroke-width="2" fill="none" opacity=".7"/>`;
  BERCEAU_FOND += `<path d="${path3([['M', [x0 + 0.1, CR.mat1, z1 - 0.06]], ['Q', [x0 + 0.25, CR.mat1, z1 - 0.12], [x0 + 0.4, CR.mat1, z1 - 0.1]]])}" stroke="#ddd0bb" stroke-width="2" fill="none"/>`;
  MAT.push(top, face);
  // ombre du bébé sur le drap (douce, bleutée)
  BERCEAU_FOND += `<ellipse cx="${n1(pr(1.54, CR.mat1, 0.4)[0])}" cy="${n1(pr(1.54, CR.mat1, 0.4)[1])}" rx="115" ry="9" fill="#6a6f86" opacity=".35" filter="url(#b6)"/>`;
}

// Devant : barreaux et rails côté chambre, montants à boule, bras du mobile
const HUB = [1.58, 1.42, 0.38]; // point d'attache du mobile
let BERCEAU_AVANT = `<defs>${WOOD}</defs>`;
{
  const z = CR.zf;
  const low = dRailX(z, CR.bot, CR.bot + 0.04);
  const bars = BARS.map((x) => dBar(x, z, CR.bot + 0.03, CR.top - 0.03, BAR_R)).join('');
  const top = dRailX(z, CR.top - 0.042, CR.top);
  BERCEAU_AVANT += `<path d="${low}" fill="url(#chambre-boisRail)"/><path d="${bars}" ${barsFill}/><path d="${top}" fill="url(#chambre-boisRail)" stroke="#6e4a2c" stroke-opacity=".3"/>`;
  // dessus du rail, éclairé par le plafond
  BERCEAU_AVANT += `<path d="${path3([['M', [CR.x0, CR.top, z]], ['L', [CR.x1, CR.top, z]]])}" stroke="#f0cd96" stroke-width="2" fill="none" opacity=".8"/>`;
  FRONT.push(low, bars, top);
  for (const x of [CR.x0, CR.x1]) {
    const m = montant(x, z);
    FRONT.push(m.d);
    BERCEAU_AVANT += `<path d="${m.d}" ${barsFill}/>`;
    BERCEAU_AVANT += `<circle cx="${n1(m.ball[0])}" cy="${n1(m.ball[1])}" r="${n1(m.rb)}" fill="url(#chambre-boule)"/>`;
  }
  // bras du mobile : pince sur le montant droit, tige qui monte puis se courbe au-dessus du matelas
  const arm = path3([
    ['M', [CR.x1 + 0.01, CR.top + 0.02, z]], ['L', [CR.x1 + 0.01, 1.3, z - 0.02]],
    ['C', [CR.x1 + 0.01, 1.5, z - 0.04], [CR.x1 - 0.12, 1.52, z - 0.12], [1.9, 1.51, 0.46]],
    ['Q', [HUB[0], 1.5, HUB[2]], [HUB[0], 1.49, HUB[2]]],
  ]);
  BERCEAU_AVANT += `<path d="${arm}" stroke="${P.woodDark}" stroke-width="8" stroke-linecap="round" fill="none"/>`;
  BERCEAU_AVANT += `<path d="${arm}" stroke="${P.woodLight}" stroke-width="3" stroke-linecap="round" fill="none" transform="translate(1.5 -1.5)" opacity=".85"/>`;
  const clamp1 = dBar(CR.x1 + 0.012, z + 0.01, CR.top - 0.06, CR.top + 0.035, 0.022);
  BERCEAU_AVANT += `<path d="${clamp1}" fill="${P.woodDark}"/>`;
  FRONT.push(clamp1);
  // embout sous la courbe, d'où pend le mobile
  const [hx, hy] = pr(HUB[0], 1.49, HUB[2]);
  BERCEAU_AVANT += `<circle cx="${n1(hx)}" cy="${n1(hy + 3)}" r="5" fill="${P.woodDark}"/>`;
}

/* ---------- Le bébé : couché sur le dos, tête à gauche, bras levés ---------- */
const [BX, BY] = pr(1.263, 0.605, 0.36); // centre de la tête (le visage tombe entre deux barreaux)
const BREATH_Y = BY + 22; // ligne d'appui sur le matelas
const star = (x, y, r) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    d += (i ? 'L' : 'M') + n1(x + rr * Math.cos(a)) + ',' + n1(y + rr * Math.sin(a));
  }
  return d + 'Z';
};
const BABY_SIL =
  'M27,-12 C40,-24 75,-26 105,-23 C145,-22 182,-15 200,-4 C210,3 209,17 198,21 C160,24 80,24 40,23 C30,22 24,24 14,22 ' +
  'C-4,24 -24,14 -23,0 C-22,-14 -14,-22 -2,-24 C-8,-34 6,-34 8,-26 C16,-24 22,-20 27,-14 Z';
const BEBE = `
<defs>
  ${rad('chambre-peau', [[0, '#f6d3b6'], [0.55, P.skin], [1, P.skinShade]], 0.66, 0.3, 0.8)}
  ${lin('chambre-gigo', [[0, P.roseLight], [0.4, P.rose], [1, P.roseShade]])}
  ${lin('chambre-manche', [[0, '#e4dac7'], [1, '#bfb29b']])}
</defs>
<g transform="translate(${n1(BX)} ${n1(BY)})">
  <!-- gigoteuse rose poudré, semée d'étoiles crème -->
  <path d="M27,-12 C40,-24 75,-26 105,-23 C145,-20 182,-14 200,-4 C210,3 209,17 198,21 C160,24 80,24 40,23 C30,20 26,8 27,-12 Z" fill="url(#chambre-gigo)"/>
  <path d="M48,-17 C90,-17 150,-12 196,-3" stroke="#f6d6cd" stroke-width="2" fill="none" opacity=".55"/>
  <path d="M60,22 C100,19 160,19 196,15" stroke="${P.roseShade}" stroke-width="3" fill="none" opacity=".35"/>
  <path d="M118,-22 C122,-8 121,8 116,22" stroke="${P.roseShade}" stroke-width="1.2" fill="none" opacity=".3"/>
  <g fill="#f8eedf">
    <path d="${star(64, -10, 3.4)}${star(90, 6, 3.2)}${star(112, -12, 3.4)}${star(140, 5, 3.2)}${star(163, -6, 3)}${star(184, 8, 2.8)}${star(74, 15, 2.8)}${star(130, -2, 2.8)}"/>
  </g>
  <!-- col du body crème -->
  <path d="M19,-8 C26,-12 33,-8 33,0 C33,10 29,18 22,20 C25,10 24,0 19,-8 Z" fill="#ddd3c1"/>
  <!-- tête : cheveux fins châtain clair, oreille, visage endormi -->
  <ellipse cx="0" cy="0" rx="23" ry="21.5" fill="url(#chambre-peau)"/>
  <path d="M-3,-21.5 C-15,-20 -24,-10 -23,2 C-22,10 -18,16 -12,19 C-15,8 -13,-5 -3,-13 C1,-16 5,-19 -3,-21.5 Z" fill="${P.hair}" opacity=".88"/>
  <path d="M-2,-21 C3,-24 7,-23 9,-20.5 M-9,-18.5 C-7,-22.5 -2,-24.5 1,-22.5 M-18,-9 C-19,-14 -16,-18 -12,-19" stroke="${P.hair}" stroke-width="1.2" fill="none" opacity=".75"/>
  <path d="M-7,1 C-12,1.5 -12.5,9 -7.5,10.5 C-5.5,9 -5,4 -7,1 Z" fill="${P.skinShade}" stroke="${P.skinDeep}" stroke-width=".8" opacity=".9"/>
  <ellipse cx="9.5" cy="4" rx="7.5" ry="5.5" fill="${P.cheek}" opacity=".5"/>
  <path d="M4,-5.5 Q8.8,-1.8 13.6,-5.6" stroke="#6a4a3e" stroke-width="1.7" fill="none" stroke-linecap="round"/>
  <path d="M6.6,-3.6 l-0.7,1.4 M10.2,-3.3 l0.2,1.5" stroke="#6a4a3e" stroke-width=".8" stroke-linecap="round" opacity=".7"/>
  <path d="M20,-13 Q25,-10 21.5,-6.5" stroke="${P.skinDeep}" stroke-width="1.3" fill="none"/>
  <path d="M17.5,0 Q19.5,-1.2 21.5,0 Q19.5,2.6 17.5,0 Z" fill="#b8706a"/>
  <!-- bras levé de notre côté, le poing près de la joue -->
  <path d="M42,6 C40,18 33,21 24,20 L12,17" stroke="url(#chambre-manche)" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M38,16 Q33,22 24,22" stroke="#c4b79f" stroke-width="1.6" fill="none" opacity=".7"/>
  <path d="M12,12 C8,9 1,10 0.5,15 C0,20 7,22 11,19.5 Z" fill="${P.skin}" stroke="${P.skinShade}" stroke-width=".8"/>
  <path d="M5,11.5 Q8.5,12 9.5,15" stroke="${P.skinShade}" stroke-width=".9" fill="none"/>
</g>
`;

/* ---------- Fauteuil vert-gris au premier plan (flou) ---------- */
const FAUTEUIL = `
<defs>
  ${lin('chambre-fauteuil', [[0, '#3c4642'], [0.7, '#4c5751'], [1, '#56625b']], 0, 0, 1, 0)}
  ${lin('chambre-accoudoir', [[0, '#66736b'], [0.35, '#56625b'], [1, '#3e4844']])}
</defs>
<g transform="translate(170 20)">
<!-- dossier haut et arrondi, vu de profil -->
<path d="M-300,1320 L-290,650 C-286,594 -232,560 -160,556 C-70,552 16,570 46,616 C64,646 66,706 62,770 L84,1320 Z" fill="url(#chambre-fauteuil)"/>
<path d="M-286,640 C-280,592 -230,562 -160,558 C-72,554 14,572 44,614" stroke="#7c897f" stroke-width="12" fill="none" opacity=".6"/>
<path d="M46,618 C62,648 64,700 60,760" stroke="#b39a74" stroke-width="7" fill="none" opacity=".45"/>
<!-- accoudoir roulé -->
<path d="M30,770 C30,742 64,728 120,726 L330,730 C384,732 414,758 414,798 C414,836 388,858 352,858 C338,858 328,866 328,886 L334,1320 L30,1320 Z" fill="url(#chambre-accoudoir)"/>
<path d="M44,742 C70,730 110,728 150,728 L330,732 C376,734 404,754 410,784" stroke="#8d998f" stroke-width="10" fill="none" opacity=".7"/>
<path d="M410,786 C416,826 392,856 352,858" stroke="#c4a67c" stroke-width="7" fill="none" opacity=".55"/>
<ellipse cx="368" cy="800" rx="26" ry="34" fill="#3a433f" opacity=".5"/>
</g>
`;

/* ---------- Effets procéduraux ---------- */
const centroid = (a) => a.reduce((s, p) => [s[0] + p[0] / a.length, s[1] + p[1] / a.length], [0, 0]);
const polyPath = (c, a) => { c.moveTo(a[0][0], a[0][1]); for (let i = 1; i < a.length; i++) c.lineTo(a[i][0], a[i][1]); c.closePath(); };

// Faisceaux : pour chaque vitre, l'enveloppe entre la vitre et sa tache
const SHAFTS = LIT.map((q) => {
  const f = onFloor(q), w = onWall(q), end = f.length > 2 ? f : w;
  return { poly: hull(scr([...q, ...f, ...w]), 0, 1), a: centroid(scr(q)), b: centroid(scr(end)) };
});
const FLOOR_C = centroid(scr(FLOOR_LIT.flat())), WALL_C = centroid(scr(WALL_LIT.flat()));

// Poussière en suspension dans le faisceau (positions tirées une fois pour toutes)
const MOTES = (() => {
  const r = rng(404);
  return Array.from({ length: 110 }, () => ({
    z0: lerp(OPEN[0] + 0.04, OPEN[1] - 0.04, r()), y0: lerp(0.84, 2.12, r()),
    k: r(), ph: r() * TAU, sp: 0.12 + r() * 0.22, s: 0.5 + r() * r() * 1.6,
  }));
})();

// Lumière reçue par le plan Z = z pour un soleil S, trouée par l'ombre des volumes placés devant
function shadeS(z, casters, S = SUN) {
  const tZ = (p) => { const k = (p[2] - z) / -S[2]; return [p[0] + S[0] * k, p[1] + S[1] * k, z]; };
  const holes = new Path2D(), lit = new Path2D();
  holes.rect(-400, -300, 2800, 1700);
  for (const c of casters) {
    const sh = clip(hull(c.map(tZ), 0, 1), (p) => p[1]);
    if (sh.length > 2) polyPath(holes, scr(sh));
  }
  const l = clip(clip(OPENING.map(tZ), (p) => p[1]), (p) => RW - p[0]);
  if (l.length > 2) polyPath(lit, scr(l));
  return { lit, holes };
}

// Chemins de découpe (créés au premier rendu, dans le navigateur)
let CLIPS = null;
function clips() {
  if (CLIPS) return CLIPS;
  const frontCasters = CASTERS.slice(0, -2).filter((c) => c[0][2] > CR.zf - 0.1 || c[4][2] > CR.zf - 0.1);
  const mattress = CASTERS[CASTERS.length - 2];
  const part = (shape, z, casters) => ({ shape, z, casters, ...shadeS(z, casters) });
  const baby = new Path2D();
  baby.addPath(new Path2D(BABY_SIL), new DOMMatrix([1, 0, 0, 1, BX, BY]));
  CLIPS = {
    back: part(new Path2D(BACK.join(' ')), CR.zb + 0.03, [...frontCasters, mattress]),
    mat: part(new Path2D(MAT.join(' ')), CR.zf - 0.04, frontCasters),
    baby: part(baby, 0.36, frontCasters),
    front: part(new Path2D(FRONT.join(' ')), CR.zf, []),
    beam: SHAFTS.map((s) => { const p = new Path2D(); polyPath(p, s.poly); return p; }),
  };
  return CLIPS;
}

// Soleil sur une partie du berceau : découpe par sa forme, par la lumière, et par les ombres portées
function sunOn(c, part, L, warm, tf, S) {
  if (L <= 0.01) return;
  if (S) part = { shape: part.shape, ...shadeS(part.z, part.casters, S) };
  c.save();
  if (tf) c.transform(...tf);
  c.clip(part.shape);
  if (tf) c.setTransform(c.getTransform().multiply(new DOMMatrix(tf).inverse()));
  c.clip(part.lit);
  c.clip(part.holes, 'evenodd');
  c.globalCompositeOperation = 'screen';
  c.fillStyle = `rgba(255,${Math.round(lerp(200, 150, warm))},${Math.round(lerp(126, 80, warm))},${0.42 * L})`;
  c.fillRect(-400, -300, 2800, 1700);
  c.restore();
}

// Un rond de lumière douce (rebond, halo)
function glow(c, x, y, r, rgb, a) {
  if (a <= 0.003) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.fillRect(x - r, y - r, 2 * r, 2 * r);
}

/* ---------- Mobile en feutrine ---------- */
// Formes dessinées dans un carré unité (hauteur ≈ 1), centrées
const FELT_D = {
  etoile: (() => {
    const o = [], n = 5;
    for (let i = 0; i < 2 * n; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / n, r = i % 2 ? 0.25 : 0.54;
      o.push([r * Math.cos(a), r * Math.sin(a) + 0.04]);
    }
    let d = `M${((o[9][0] + o[0][0]) / 2).toFixed(3)},${((o[9][1] + o[0][1]) / 2).toFixed(3)}`;
    for (let i = 0; i < 2 * n; i++) {
      const p = o[i], q = o[(i + 1) % (2 * n)];
      d += ` Q${p[0].toFixed(3)},${p[1].toFixed(3)} ${((p[0] + q[0]) / 2).toFixed(3)},${((p[1] + q[1]) / 2).toFixed(3)}`;
    }
    return d + ' Z';
  })(),
  lune: 'M0.16,-0.48 A0.5,0.5 0 1,0 0.16,0.48 A0.36,0.36 0 0,1 0.16,-0.48 Z',
  nuage: 'M-0.48,0.2 C-0.64,0.2 -0.64,-0.06 -0.44,-0.08 C-0.44,-0.3 -0.14,-0.36 -0.06,-0.18 C0.02,-0.42 0.42,-0.38 0.4,-0.1 C0.62,-0.12 0.66,0.2 0.46,0.22 Q0,0.25 -0.48,0.2 Z',
  soleil: (() => {
    let d = 'M0.3,0 A0.3,0.3 0 1,1 -0.3,0 A0.3,0.3 0 1,1 0.3,0 Z';
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8, b = 0.16, c = Math.cos, s = Math.sin;
      d += ` M${(0.33 * c(a - b)).toFixed(3)},${(0.33 * s(a - b)).toFixed(3)} Q${(0.56 * c(a)).toFixed(3)},${(0.56 * s(a)).toFixed(3)} ${(0.33 * c(a + b)).toFixed(3)},${(0.33 * s(a + b)).toFixed(3)} Z`;
    }
    return d;
  })(),
};
const FELT = [
  { id: 'etoile', col: '#e8c46a', dark: '#c49d45', len: 0.15 },
  { id: 'lune', col: '#a9c0cf', dark: '#8299aa', len: 0.21 },
  { id: 'nuage', col: '#f1ece3', dark: '#cfc6b8', len: 0.13 },
  { id: 'soleil', col: '#e9a87c', dark: '#c78560', len: 0.18 },
];
let FELT_P = null;

function mobile(c, T, dim) {
  FELT_P ??= Object.fromEntries(Object.entries(FELT_D).map(([k, d]) => [k, new Path2D(d)]));
  const th = 0.55 + 0.21 * T + 0.08 * Math.sin(T * 0.31); // rotation lente, jamais à vitesse constante
  const R = 0.16, Y = HUB[1] - 0.05;
  const [hx, hy] = pr(HUB[0], HUB[1] + 0.07, HUB[2]);
  const [cx0, cy0] = pr(HUB[0], Y, HUB[2]);
  c.lineCap = 'round';
  // fil central et croisillon de bois
  c.strokeStyle = 'rgba(70,58,50,.55)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(hx, hy); c.lineTo(cx0, cy0); c.stroke();
  const ends = FELT.map((_, i) => {
    const a = th + (i * TAU) / 4;
    return [HUB[0] + R * Math.cos(a), Y, HUB[2] + R * Math.sin(a)];
  });
  c.strokeStyle = P.woodDark; c.lineWidth = 3.2;
  for (const [i, j] of [[0, 2], [1, 3]]) {
    const [ax, ay] = pr(...ends[i]), [bx, by] = pr(...ends[j]);
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  }
  c.fillStyle = P.wood; c.beginPath(); c.arc(cx0, cy0, 3.6, 0, TAU); c.fill();
  // les formes, de la plus lointaine à la plus proche
  const items = FELT.map((f, i) => {
    const e = ends[i], p = [e[0], Y - f.len, e[2]];
    const tw = th + (i * TAU) / 4 + 0.6 * Math.sin(T * 0.37 + i * 1.7); // chaque forme pivote un peu sur son fil
    return { f, e, p, tw, z: p[2] };
  }).sort((a, b) => a.z - b.z);
  for (const it of items) {
    const [ex, ey] = pr(...it.e), [x, y] = pr(...it.p), k = kz(it.p[2]);
    const size = 0.13 * k, sx = Math.cos(it.tw), w = Math.max(0.16, Math.abs(sx));
    const sway = 0.04 * Math.sin(T * 0.9 + it.z * 9);
    c.strokeStyle = 'rgba(70,58,50,.5)'; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(ex, ey); c.lineTo(x, y - size * 0.42); c.stroke();
    c.save();
    c.translate(x, y);
    c.rotate(sway);
    c.scale(size * w * (sx < 0 ? -1 : 1), size);
    const path = FELT_P[it.f.id];
    // feutre : aplat, modelé doux (lumière venant de la droite), point de couture
    c.fillStyle = sx < 0 ? it.f.dark : it.f.col;
    c.fill(path);
    c.save();
    c.clip(path);
    const g = c.createLinearGradient(-0.6 * Math.sign(sx || 1), 0.5, 0.6 * Math.sign(sx || 1), -0.5);
    g.addColorStop(0, 'rgba(60,62,90,.28)');
    g.addColorStop(0.55, 'rgba(255,255,255,0)');
    g.addColorStop(1, `rgba(255,236,200,${0.3 * (1 - dim)})`);
    c.fillStyle = g; c.fillRect(-1, -1, 2, 2);
    c.restore();
    if (w > 0.45) {
      c.save();
      c.scale(0.8, 0.8);
      c.setLineDash([0.06, 0.05]);
      c.lineWidth = 0.028;
      c.strokeStyle = 'rgba(255,250,240,.55)';
      c.stroke(path);
      c.restore();
    }
    c.restore();
  }
}

/* ---------- Tache de soleil au crépuscule ---------- */
// Le soleil descend : la tache s'allonge et monte sur le mur, l'ombre du berceau s'étire
const SUN_D = [-1, -0.34, -0.62];
function sunPatches(S) {
  const tY = (p) => { const k = p[1] / -S[1]; return [p[0] + S[0] * k, 0, p[2] + S[2] * k]; };
  const tZ = (p) => { const k = p[2] / -S[2]; return [p[0] + S[0] * k, p[1] + S[1] * k, 0]; };
  const tX = (p) => { const k = p[0] / -S[0]; return [0, p[1] + S[1] * k, p[2] + S[2] * k]; };
  const lit = new Path2D(), holes = new Path2D();
  holes.rect(-400, -300, 2800, 1700);
  const add = (path, a) => { if (a.length > 2) polyPath(path, scr(a)); };
  for (const q of LIT) {
    add(lit, clip(clip(q.map(tY), (p) => p[2]), (p) => p[0]));
    add(lit, clip(clip(clip(q.map(tZ), (p) => p[1]), (p) => p[0]), (p) => RH - p[1]));
    add(lit, clip(clip(clip(q.map(tX), (p) => p[1]), (p) => p[2]), (p) => RH - p[1]));
  }
  for (const c of CASTERS) {
    add(holes, clip(hull(c.map(tY), 0, 2), (p) => p[2]));
    add(holes, clip(hull(c.map(tZ), 0, 1), (p) => p[1]));
  }
  return { lit, holes };
}
let DUSK_BUF = null;
const sunAt = (d) => { const e = seg(d, 0.12, 1, ease.inOut); return [-1, lerp(SUN[1], SUN_D[1], e), lerp(SUN[2], SUN_D[2], e)]; };
function tacheDuSoir(c, d, a) {
  if (a <= 0.004) return;
  const S = sunAt(d);
  const { lit, holes } = sunPatches(S);
  // la tache est d'abord peinte en masque (lumière moins ombres du berceau) hors de l'image…
  const W = c.canvas.width, H = c.canvas.height;
  if (!DUSK_BUF || DUSK_BUF.width !== W || DUSK_BUF.height !== H) {
    DUSK_BUF = document.createElement('canvas');
    DUSK_BUF.width = W; DUSK_BUF.height = H;
  }
  const b = DUSK_BUF.getContext('2d');
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, W, H);
  b.setTransform(c.getTransform());
  b.save(); b.clip(holes, 'evenodd'); b.fillStyle = '#fff'; b.fill(lit); b.restore();
  // … puis posée avec un flou (pénombre d'un soleil bas), teintée, en deux passes
  const off = 4 * W, blur = (7 + 8 * d) * c.getTransform().a;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.shadowOffsetX = off; c.shadowBlur = blur;
  c.globalCompositeOperation = 'multiply';
  c.shadowColor = `rgba(255,${Math.round(lerp(196, 140, d))},${Math.round(lerp(120, 70, d))},${0.55 * a})`;
  c.drawImage(DUSK_BUF, -off, 0);
  c.globalCompositeOperation = 'screen';
  c.shadowColor = `rgba(255,${Math.round(lerp(206, 158, d))},${Math.round(lerp(134, 80, d))},${0.95 * a})`;
  c.drawImage(DUSK_BUF, -off, 0);
}

/* ---------- Faisceau et poussière ---------- */
function faisceau(c, T, L, warm) {
  if (L <= 0.01) return;
  const C = clips();
  const gg = Math.round(lerp(226, 170, warm)), bb = Math.round(lerp(168, 110, warm));
  c.globalCompositeOperation = 'screen';
  const breathe = 1 + 0.06 * Math.sin(T * 0.5) + 0.03 * Math.sin(T * 1.27);
  SHAFTS.forEach((s, i) => {
    const g = c.createLinearGradient(s.a[0], s.a[1], s.b[0], s.b[1]);
    g.addColorStop(0, `rgba(255,${gg},${bb},${0.12 * L * breathe})`);
    g.addColorStop(0.55, `rgba(255,${gg},${bb},${0.055 * L * breathe})`);
    g.addColorStop(1, `rgba(255,${gg},${bb},${0.012 * L})`);
    c.fillStyle = g;
    c.fill(C.beam[i]);
  });
  // poussière : de petits points qui dérivent, s'allument et s'éteignent dans la lumière
  for (const m of MOTES) {
    const kmax = Math.min(m.y0 / -SUN[1], m.z0 / -SUN[2]);
    const k = (0.06 + 0.86 * m.k) * kmax + 0.05 * Math.sin(T * m.sp + m.ph);
    const p = along([RW, m.y0, m.z0], k);
    p[0] += 0.025 * Math.sin(T * 0.23 + m.ph);
    p[1] += 0.035 * Math.sin(T * m.sp * 0.8 + m.ph * 1.3) - 0.004 * T;
    p[2] += 0.02 * Math.cos(T * 0.19 + m.ph);
    const [x, y] = pr(p[0], p[1], p[2]);
    const tw = 0.5 + 0.5 * Math.sin(T * (0.7 + m.sp * 2) + m.ph * 3);
    const a = L * (0.25 + 0.75 * tw * tw) * (1 - 0.55 * (k / kmax));
    const r = m.s * 1.45 * (kz(p[2]) / 300);
    c.fillStyle = `rgba(255,${gg + 14},${bb + 40},${0.2 * a})`;
    c.beginPath(); c.arc(x, y, r * 2.6, 0, TAU); c.fill();
    c.fillStyle = `rgba(255,248,226,${0.75 * a})`;
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
}

/* ---------- Le décor ---------- */
const lerpRGB = (a, b, k) => a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',');

export default {
  id: 'chambre',
  home: { x: 1000, y: 500, z: 1.06 },
  bg: '#1b1a1e',
  layers: {
    fond: { box: [-240, -140, 2400, 1360], svg: FOND, filters: ['paint'] },
    lumiere: { box: [380, 200, 1300, 760], svg: LUMIERE, filters: ['b3', 'paint'] },
    berceauFond: { box: [660, 400, 480, 360], svg: BERCEAU_FOND, filters: ['ink'] },
    bebe: { box: [740, 500, 300, 100], svg: BEBE, filters: ['ink'], res: 1.5 },
    berceauAvant: { box: [660, 260, 500, 520], svg: BERCEAU_AVANT, filters: ['ink'] },
    fauteuil: { box: [-200, 520, 900, 820], svg: FAUTEUIL, filters: ['paint', 'b16'], par: 1.4 },
  },
  // p.dusk : 0 (début d'après-midi) → 1 (le soleil s'en va, la chambre se réchauffe et s'assombrit)
  render(g, p, T) {
    const d = clamp(p.dusk ?? 0);
    const L = 1 - 0.88 * d;         // force du soleil direct
    const C = clips();
    const breath = 1 + 0.03 * Math.sin((TAU * T) / 3.4); // respiration lente du bébé
    const btf = [1, 0, 0, breath, 0, BREATH_Y * (1 - breath)];

    g.img('fond');
    // tache peinte (après-midi) puis, quand le jour baisse, tache recalculée qui glisse et rougit
    const xf = seg(d, 0, 0.22, ease.lin);
    g.img('lumiere', { blend: 'multiply', alpha: 0.6 * (1 - xf) });
    g.img('lumiere', { blend: 'screen', alpha: 1 - xf });
    if (d > 0) g.fx(1, (c) => tacheDuSoir(c, d, xf * (0.9 - 0.5 * d)));
    g.fx(1, (c) => {
      c.globalCompositeOperation = 'screen';
      // rebonds chauds de la tache au sol et du mur, halo de la fenêtre
      glow(c, FLOOR_C[0], FLOOR_C[1] - 60, 520, '255,186,120', 0.11 * L);
      glow(c, WALL_C[0], WALL_C[1], 380, '255,206,150', 0.08 * L);
      glow(c, 1740, 320, 600, lerpRGB([255, 228, 186], [255, 160, 110], d), 0.2 * (1 - 0.6 * d));
      glow(c, 1700, 300, 240, '255,244,220', 0.14 * (1 - 0.8 * d));
      // reflet de la fenêtre dans le plancher ciré, très doux
      for (const q of PANES) {
        const m = scr(q.map((v) => [RW + 0.2, -v[1], v[2]]));
        const top = Math.min(...m.map((v) => v[1])), bot = Math.max(...m.map((v) => v[1]));
        const gr = c.createLinearGradient(0, top, 0, bot);
        gr.addColorStop(0, `rgba(255,236,200,${0.1 * L})`);
        gr.addColorStop(1, 'rgba(255,236,200,0)');
        c.fillStyle = gr; c.beginPath(); polyPath(c, m); c.fill();
      }
      // la vitre se colore quand le jour baisse
      if (d > 0) {
        c.globalCompositeOperation = 'source-over';
        c.fillStyle = `rgba(252,172,100,${0.42 * d})`;
        c.beginPath(); polyPath(c, scr(quadX(RW + 0.18, WIN.z0, WIN.z1, WIN.y0, WIN.y1))); c.fill();
      }
      // lampe du couloir : filet sous la porte, plus visible quand la chambre s'assombrit
      c.globalCompositeOperation = 'screen';
      const fan = scr([[0.01, 0.002, 1.36], [0.01, 0.002, 2.18], [0.42, 0.002, 2.3], [0.42, 0.002, 1.3]]);
      const gd = c.createLinearGradient(fan[0][0], 0, fan[3][0], 0);
      gd.addColorStop(0, `rgba(255,214,160,${0.24 + 0.36 * d})`);
      gd.addColorStop(1, 'rgba(255,214,160,0)');
      c.fillStyle = gd; c.beginPath(); polyPath(c, fan); c.fill();
    });
    g.img('berceauFond');
    // le berceau au soleil : lumière de l'après-midi, puis lumière basse du soir
    const S = d > 0 ? sunAt(d) : null, Ld = xf * (0.9 - 0.5 * d);
    const both = (c, part, k, tf) => { sunOn(c, part, k * (1 - xf), d, tf); if (S) sunOn(c, part, k * Ld, d, tf, S); };
    g.fx(1, (c) => { both(c, C.back, 0.75); both(c, C.mat, 0.45); });
    g.img('bebe', { tf: { sy: breath, oy: BREATH_Y } });
    g.fx(1, (c) => both(c, C.baby, 0.9, btf));
    g.img('berceauAvant');
    g.fx(1, (c) => both(c, C.front, 1));
    g.fx(1, (c) => mobile(c, T, d));
    g.fx(1, (c) => faisceau(c, T, L, d));
    g.img('fauteuil');
    // étalonnage : ombres bleutées à gauche, chaleur à droite ; au crépuscule tout baisse et se réchauffe
    g.screen((c, W, H) => {
      const gr = c.createLinearGradient(0, 0, W, H * 0.4);
      gr.addColorStop(0, `rgb(${lerpRGB([220, 226, 242], [132, 130, 178], d)})`);
      gr.addColorStop(1, `rgb(${lerpRGB([255, 247, 234], [218, 172, 148], d)})`);
      c.globalCompositeOperation = 'multiply';
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      // le bas de l'image (plancher, tapis) s'enfonce dans l'ombre le soir
      if (d > 0) {
        const gv = c.createLinearGradient(0, H * 0.55, 0, H);
        gv.addColorStop(0, 'rgba(70,64,100,0)');
        gv.addColorStop(1, `rgba(70,64,100,${0.5 * d})`);
        c.fillStyle = gv;
        c.fillRect(0, 0, W, H);
      }
    });
  },
  shots: {
    // Lent travelling latéral de droite à gauche ; le fauteuil glisse plus vite (parallaxe)
    large: {
      dur: 6.5,
      cam: (t, portrait) => {
        const k = 0.55 * (t / 6.5) + 0.45 * ease.inOut(clamp(t / 6.5));
        return portrait
          ? { x: lerp(960, 900, k), y: 515, z: 1.3 }
          : { x: lerp(1050, 950, k), y: 500, z: 1.06 + 0.012 * k };
      },
      p: () => ({ dusk: 0 }),
    },
    // Même cadrage, presque fixe : la lumière baisse et se réchauffe
    crepuscule: {
      dur: 6,
      cam: (t, portrait) => {
        const k = ease.inOut(clamp(t / 6));
        return portrait
          ? { x: lerp(925, 915, k), y: 515, z: lerp(1.3, 1.33, k) }
          : { x: lerp(985, 975, k), y: 500, z: lerp(1.08, 1.1, k) };
      },
      p: (t) => ({ dusk: ease.inOut(clamp(t / 6)) }),
    },
  },
};
