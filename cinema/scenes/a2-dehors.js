/* ==========================================================================
   Décor « a2-dehors » — extérieur, plan d'ouverture de l'Acte 2.
   Un petit immeuble de ville, un matin d'automne lumineux. Le soleil, bas,
   vient de la gauche et de devant : il dore les étages, tandis que la rue et
   le bas de la façade restent dans l'ombre bleutée des immeubles d'en face.
   À gauche, un arbre de rue aux feuilles jaunes et rousses perd lentement
   ses feuilles ; son ombre tachetée glisse sur la façade. Au deuxième étage,
   au centre : la fenêtre du couple, des plantes vertes sur l'appui et une
   lampe allumée derrière la vitre.

   Paramètres (p) :
     vent    0 → 1   souffle dans l'arbre et dans les feuilles (1 par défaut)
     soleil  0 → 1   intensité du soleil (1)
     reflet  0 → 1   reflet du ciel qui glisse sur la vitre du couple
   ========================================================================== */
import { rng } from '../kit.js';
import { TAU, clamp, lerp } from '../../film/engine.js';

/* ---------- Outils de tracé ---------- */
const q = (v) => Math.round(v * 10) / 10;
const XY = (p) => `${q(p[0])} ${q(p[1])}`;
const pl = (a) => a.map((p) => `${q(p[0])},${q(p[1])}`).join(' ');

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
// Tache organique (contour irrégulier lissé)
function tache(r, cx, cy, rx, ry, n = 9, jit = 0.22) {
  const p = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + (r() - 0.5) * 0.35;
    const k = 1 + (r() - 0.5) * 2 * jit;
    p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return lisse(p);
}
// Couronne : lobes répartis en tournesol (couverture régulière, sans trous)
function couronne(seed, cx, cy, rx, ry, n, r0, r1) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const d = Math.sqrt((i + 0.5) / n) * 0.92, a = i * 2.39996 + r() * 0.5;
    out.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, r0 + r() * (r1 - r0), Math.floor(r() * 1e6)]);
  }
  return out.sort((u, v) => u[1] - v[1]);
}

// Dégradés et filtres en coordonnées du décor
const stops = (s) => s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
const grad = (id, x1, y1, x2, y2, s) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${q(x1)}" y1="${q(y1)}" x2="${q(x2)}" y2="${q(y2)}">${stops(s)}</linearGradient>`;
const radial = (id, cx, cy, r, s) =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${q(cx)}" cy="${q(cy)}" r="${q(r)}">${stops(s)}</radialGradient>`;
const boite = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
const blur = (id, s) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
// Touche de brosse : la couleur n'apparaît que par plaques allongées (bruit étiré)
const brosse = (id, fx, fy, seed, gain = 3, cut = 1.25) =>
  `<filter id="${id}" filterUnits="objectBoundingBox" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="3" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${gain} 0 0 0 -${cut}" result="a"/>` +
  `<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>`;
const rect = (x, y, w, h, attrs) => `<rect x="${q(x)}" y="${q(y)}" width="${q(w)}" height="${q(h)}" ${attrs}/>`;

/* ---------- Géométrie ---------- */
const IM = { L: 470, R: 1450, base: 940, haut: 120 };         // façade de l'immeuble
const BAIES = [568, 764, 960, 1156, 1352];
const FEN = { x: 896, y: 340, w: 128, h: 162 };               // fenêtre du couple
const WC = [FEN.x + FEN.w / 2, FEN.y + FEN.h / 2];             // son centre (960, 421)
const VOISIN_D = { L: 1450, R: 2180, haut: 306 };             // immeuble voisin, en retrait
const TRONC = [[334, 1012], [338, 900], [343, 790], [349, 680], [356, 566]];
const PIED = TRONC[0];

// Ombre des immeubles d'en face : la rue et le bas des façades restent à l'ombre.
// Bord supérieur (découpé par les toits et une cheminée d'en face)
const BORD_OMBRE = [
  [-300, 650], [70, 644], [250, 610], [430, 642], [760, 648], [1050, 654], [1062, 624],
  [1118, 626], [1130, 658], [1448, 664], [1452, 696], [1700, 686], [1880, 692], [2200, 712],
];
// Trouée entre deux immeubles d'en face : une bande de soleil monte du trottoir sur la façade
const TROUEE = [[1166, 1100], [1236, 940], [1236, 600], [1292, 600], [1292, 940], [1222, 1100]];
function ligneOmbre(x) {
  const b = BORD_OMBRE;
  if (x <= b[0][0]) return b[0][1];
  for (let i = 1; i < b.length; i++) {
    if (x <= b[i][0]) return lerp(b[i - 1][1], b[i][1], (x - b[i - 1][0]) / (b[i][0] - b[i - 1][0]));
  }
  return b[b.length - 1][1];
}

/* ---------- Calque 1 : ciel et ville au loin ---------- */
function villeLoin() {
  const r = rng(12);
  let s = '', x = 1330;
  while (x < 2200) {
    const w = 90 + r() * 150, top = 150 + r() * 90, toit = r() < 0.4;
    s += `<path d="M${q(x)} 760V${q(top)}${toit ? `L${q(x + w * 0.5)} ${q(top - 26 - r() * 20)}` : ''}L${q(x + w)} ${q(top)}V760Z" fill="${r() < 0.5 ? '#c3c8cb' : '#bcc2c8'}"/>`;
    s += `<rect x="${q(x)}" y="${q(top)}" width="${q(w * 0.18)}" height="${q(760 - top)}" fill="#e2d7c6" opacity="0.55"/>`;
    for (let yy = top + 22; yy < 400; yy += 34) {
      for (let xx = x + 16; xx < x + w - 14; xx += 26) if (r() < 0.75) s += `<rect x="${q(xx)}" y="${q(yy)}" width="9" height="14" fill="#a9b0b8" opacity="0.5"/>`;
    }
    x += w + 4 + r() * 18;
  }
  return s;
}
const CIEL = `
<defs>
  ${grad('a2-dehors-ciel', 0, -160, 0, 760, [[0, '#a6c0cc'], [0.3, '#c4d6db'], [0.58, '#e3e6dc'], [1, '#f3e2c4']])}
  ${radial('a2-dehors-astre', -340, -80, 1500, [[0, '#fff6e0', 0.95], [0.25, '#fde8c2', 0.55], [1, '#f6dfbd', 0]])}
  ${blur('a2-dehors-f14', 14)}${blur('a2-dehors-f3', 3)}
</defs>
<rect x="-240" y="-160" width="2400" height="920" fill="url(#a2-dehors-ciel)"/>
<rect x="-240" y="-160" width="2400" height="920" fill="url(#a2-dehors-astre)"/>
<!-- voiles de nuages hauts, étirés par le vent -->
<g filter="url(#a2-dehors-f14)">
  <path d="${tache(rng(5), 1320, 40, 420, 22, 10, 0.2)}" fill="#fbf3e6" opacity="0.7"/>
  <path d="${tache(rng(6), 1760, 92, 300, 16, 10, 0.2)}" fill="#f8efe2" opacity="0.6"/>
  <path d="${tache(rng(7), 980, -40, 360, 18, 10, 0.2)}" fill="#fff8ec" opacity="0.55"/>
  <path d="${tache(rng(8), 1500, 150, 220, 12, 10, 0.2)}" fill="#f6ecdf" opacity="0.5"/>
</g>
<!-- la ville au loin, dans la brume du matin -->
<g filter="url(#a2-dehors-f3)" opacity="0.9">${villeLoin()}</g>
<rect x="1300" y="120" width="900" height="640" fill="#e6e2d6" opacity="0.35"/>
`;

/* ---------- Calque 2 : l'immeuble, ses voisins, le trottoir ---------- */
// Une fenêtre de façade : ouverture en retrait, châssis à deux battants et imposte,
// appui en saillie. (cx, y) : milieu du haut de l'ouverture.
//   o.store : fraction baissée du store ; o.rideau : 'g' | 'd' | 'deux' ; o.voile ;
//   o.pot : une plante sur l'appui, dehors ; o.feuilles : feuilles tombées sur l'appui ;
//   o.mur : couleurs du mur autour (lumière du tableau, ombre)
function fenetre(cx, y, w, h, o = {}) {
  const x = cx - w / 2, fr = 8, mt = 5;
  const ix = x + fr, iy = y + fr, iw = w - 2 * fr, ih = h - 2 * fr;
  const ty = iy + ih * 0.3, mx = ix + iw / 2;
  const r = rng(Math.round(cx * 7 + y * 3));
  const vitres = [
    [ix, iy, iw / 2 - mt / 2, ty - iy - mt / 2], [mx + mt / 2, iy, iw / 2 - mt / 2, ty - iy - mt / 2],
    [ix, ty + mt / 2, iw / 2 - mt / 2, iy + ih - ty - mt / 2], [mx + mt / 2, ty + mt / 2, iw / 2 - mt / 2, iy + ih - ty - mt / 2],
  ];
  const R = ([a, b, c, d]) => `M${q(a)} ${q(b)}h${q(c)}v${q(d)}h${q(-c)}Z`;
  let s = '';
  // L'intérieur : pénombre fraîche, un peu plus claire en haut (plafond)
  s += rect(x, y, w, h, `fill="${o.interieur || (r() < 0.4 ? 'url(#a2-dehors-int2)' : 'url(#a2-dehors-int)')}"`);
  if (o.dedans) s += o.dedans;
  // Store baissé (toile beige) et rideaux
  if (o.store) {
    const sh = ih * o.store;
    s += rect(ix - 2, iy, iw + 4, sh, 'fill="#d8c6a6"');
    for (let k = 1; k < 6; k++) s += `<path d="M${q(ix)} ${q(iy + (sh * k) / 6)}h${q(iw)}" stroke="#c4b192" stroke-width="1.2" opacity="0.7"/>`;
    s += rect(ix - 2, iy + sh - 4, iw + 4, 5, 'fill="#a99678"');
  }
  const pan = (x0, sens, larg) => {
    const p = [[x0, iy], [x0 + sens * larg, iy], [x0 + sens * (larg - 4), iy + ih * 0.4], [x0 + sens * (larg + 6), iy + ih], [x0, iy + ih]];
    let t = `<path d="M${XY(p[0])}L${XY(p[1])}${trace(p.slice(1, 4), true)}L${XY(p[4])}Z" fill="#efe6d6" opacity="0.92"/>`;
    for (let k = 0; k < 3; k++) {
      const xx = x0 + sens * (6 + k * (larg / 3.2));
      t += `<path d="M${q(xx)} ${q(iy + 2)}Q${q(xx - sens * 3)} ${q(iy + ih * 0.5)} ${q(xx + sens * 2)} ${q(iy + ih)}" stroke="#cbbda5" stroke-width="3" fill="none" opacity="0.8"/>`;
    }
    return t;
  };
  if (o.rideau === 'g' || o.rideau === 'deux') s += pan(ix, 1, iw * 0.3);
  if (o.rideau === 'd' || o.rideau === 'deux') s += pan(ix + iw, -1, iw * 0.3);
  if (o.voile) {
    s += rect(ix, iy, iw, ih, 'fill="#efe9de" opacity="0.55"');
    for (let k = 0; k < 7; k++) s += `<path d="M${q(ix + 4 + k * (iw / 7))} ${q(iy)}v${q(ih)}" stroke="#d9cfbf" stroke-width="2.5" opacity="0.6"/>`;
  }
  // Reflet du ciel sur les vitres (plus fort en haut à gauche), différent d'une fenêtre à l'autre
  const ref = o.reflet ?? 0.6 + r() * 0.45;
  const vues = o.ouvert ? vitres.slice(0, 3) : vitres;
  s += `<path d="${vues.map(R).join('')}" fill="url(#a2-dehors-reflet)" opacity="${q(ref)}"/>`;
  s += `<path d="M${q(ix + 4)} ${q(iy + ih * 0.62)}L${q(ix + iw * 0.42)} ${q(iy + 2)}h12L${q(ix + 14)} ${q(iy + ih * 0.8)}Z" fill="#f4f8f6" opacity="${q(0.16 * ref)}"/>`;
  // Battant droit entrouvert vers l'intérieur : on voit la pièce, et la tranche du battant
  if (o.ouvert) {
    const [vx, vy, vw, vh] = vitres[3];
    s += rect(vx, vy, vw, vh, 'fill="#3a3a42" opacity="0.55"');
    s += `<path d="M${q(vx + vw - 2)} ${q(vy - 2)}L${q(vx + vw - 20)} ${q(vy + 6)}V${q(vy + vh - 4)}L${q(vx + vw - 2)} ${q(vy + vh + 2)}Z" fill="#e2d8c8"/>`;
    s += `<path d="M${q(vx + vw - 6)} ${q(vy + 2)}L${q(vx + vw - 16)} ${q(vy + 8)}V${q(vy + vh - 6)}L${q(vx + vw - 6)} ${q(vy + vh - 2)}Z" fill="#aab7bd" opacity="0.8"/>`;
  }
  // Châssis blanc cassé
  s += `<path d="${R([x, y, w, h])}${vitres.map(R).join('')}" fill="#ece2d3" fill-rule="evenodd"/>`;
  s += `<path d="M${q(x)} ${q(y + h - 1.5)}h${q(w)}" stroke="#fffaf0" stroke-width="2"/>`;
  // Ombre du tableau gauche et du linteau sur le châssis (soleil bas, à gauche)
  s += `<path d="M${q(x)} ${q(y)}H${q(x + w)}V${q(y + 10)}H${q(x + 20)}L${q(x + 14)} ${q(y + h)}H${q(x)}Z" fill="#5f5f8c" opacity="0.4"/>`;
  // Tableau visible : à gauche du centre on voit le tableau gauche (à l'ombre),
  // à droite le tableau droit (au soleil) ; sous-face du linteau à l'ombre
  if (cx < 930) s += `<polygon points="${pl([[x, y], [x + 7, y + 5], [x + 7, y + h], [x, y + h]])}" fill="${o.mur?.ombre || '#a5919a'}"/>`;
  if (cx > 990) s += `<polygon points="${pl([[x + w, y], [x + w - 7, y + 5], [x + w - 7, y + h], [x + w, y + h]])}" fill="${o.mur?.lum || '#fbe1c0'}"/>`;
  s += `<polygon points="${pl([[x, y], [x + w, y], [x + w - (cx > 990 ? 7 : 0), y + 5], [x + (cx < 930 ? 7 : 0), y + 5]])}" fill="#ad928f"/>`;
  // Appui en saillie : dessus au soleil, face, ombre portée sur le mur (vers la droite et le bas)
  const ay = y + h;
  s += `<path d="M${q(x - 6)} ${q(ay + 14)}H${q(x + w + 12)}L${q(x + w + 26)} ${q(ay + 26)}H${q(x + 8)}Z" fill="#6c6994" opacity="0.42" filter="url(#a2-dehors-f4)"/>`;
  s += rect(x - 10, ay, w + 20, 5, 'fill="#fbecd2"');
  s += rect(x - 10, ay + 5, w + 20, 9, 'fill="#dcc2a2"');
  s += `<path d="M${q(x - 10)} ${q(ay + 13.5)}h${q(w + 20)}" stroke="#a48c7c" stroke-width="1.6"/>`;
  // Coulures légères sous l'appui (le temps)
  for (let k = 0; k < 3; k++) {
    const xx = x + 8 + r() * (w - 16), l = 30 + r() * 50;
    s += `<path d="M${q(xx)} ${q(ay + 15)}q${q((r() - 0.5) * 4)} ${q(l * 0.5)} ${q((r() - 0.5) * 6)} ${q(l)}" stroke="#a7826a" stroke-width="${q(3 + r() * 4)}" opacity="0.08" fill="none" stroke-linecap="round"/>`;
  }
  if (o.feuilles) {
    for (let k = 0; k < o.feuilles; k++) {
      const fx = x - 4 + r() * (w + 8), c = ['#e2a640', '#c8682e', '#eec05a'][k % 3];
      s += `<ellipse cx="${q(fx)}" cy="${q(ay + 1)}" rx="${q(4 + r() * 3)}" ry="2" fill="${c}" transform="rotate(${q((r() - 0.5) * 30)} ${q(fx)} ${q(ay + 1)})"/>`;
    }
  }
  if (o.pot) {
    const px = x + w * 0.72;
    s += `<path d="M${q(px - 13)} ${q(ay - 18)}h26l-3 18h-20Z" fill="#c9b9a2"/><path d="M${q(px - 13)} ${q(ay - 18)}h26v3h-26Z" fill="#e5d8c4"/>`;
    for (let k = 0; k < 9; k++) {
      const a = -Math.PI / 2 + (k - 4) * 0.32, l = 16 + r() * 10, ex = px + Math.cos(a) * l, ey = ay - 18 + Math.sin(a) * l;
      s += `<path d="M${q(px)} ${q(ay - 18)}Q${q(px + Math.cos(a) * l * 0.4)} ${q(ay - 18 + Math.sin(a) * l * 0.7)} ${q(ex)} ${q(ey)}" stroke="#4f6b3e" stroke-width="2" fill="none"/>`;
      s += `<ellipse cx="${q(ex)}" cy="${q(ey)}" rx="5.5" ry="3.2" fill="${k < 4 ? '#8aa65a' : '#5c7a45'}" transform="rotate(${q((a * 180) / Math.PI)} ${q(ex)} ${q(ey)})"/>`;
    }
  }
  return s;
}

// L'intérieur du couple : un mur crème réchauffé par une lampe suspendue, et sur
// l'appui intérieur trois plantes vertes, dont les feuilles se découpent sur la lumière
function interieurCouple() {
  const { x, y, w, h } = FEN, fr = 8, ix = x + fr, iw = w - 2 * fr, bas = y + h - fr;
  const r = rng(808);
  // Feuille lancéolée, base à l'origine, orientée selon a (degrés)
  const feuille = (fx, fy, l, lg, a, c) =>
    `<path d="M0 0C${q(l * 0.3)} ${q(-lg)} ${q(l * 0.75)} ${q(-lg * 0.8)} ${q(l)} 0C${q(l * 0.75)} ${q(lg * 0.8)} ${q(l * 0.3)} ${q(lg)} 0 0Z" fill="${c}" transform="translate(${q(fx)} ${q(fy)}) rotate(${q(a)})"/>`;
  let p = '';
  // Le mur du fond, une étagère et l'angle d'un placard, dans la lumière de la lampe
  p += rect(ix, y + 60, iw, 3, 'fill="#9c6c47" opacity="0.55"');
  p += rect(ix + 8, y + 46, 9, 14, 'fill="#8e9f86" opacity="0.8"');
  p += rect(ix + 20, y + 50, 7, 10, 'fill="#d9c7a8" opacity="0.8"');
  p += rect(ix + iw - 16, y, 16, h, 'fill="#7b4f35" opacity="0.35"');
  // La lampe suspendue, à droite
  const lx = x + w * 0.7, ly = y + 64;
  p += `<path d="M${q(lx)} ${q(y)}V${q(ly - 12)}" stroke="#5a4232" stroke-width="1.4"/>`;
  p += `<ellipse cx="${q(lx)}" cy="${q(ly + 10)}" rx="40" ry="30" fill="url(#a2-dehors-lampe)"/>`;
  p += `<path d="M${q(lx - 16)} ${q(ly)}C${q(lx - 14)} ${q(ly - 13)} ${q(lx + 14)} ${q(ly - 13)} ${q(lx + 16)} ${q(ly)}Z" fill="#c9b796"/>`;
  p += `<path d="M${q(lx - 10)} ${q(ly - 6)}C${q(lx - 6)} ${q(ly - 11)} ${q(lx + 2)} ${q(ly - 11)} ${q(lx + 6)} ${q(ly - 10)}" stroke="#efe3cb" stroke-width="2" fill="none"/>`;
  p += `<ellipse cx="${q(lx)}" cy="${q(ly)}" rx="16" ry="3.2" fill="#fff8e2"/>`;
  p += `<path d="M${q(lx - 16)} ${q(ly)}h32" stroke="#7d6a52" stroke-width="1.2"/>`;
  // Pots crème sur l'appui intérieur
  const pot = (px, pw, ph, c) => `<path d="M${q(px - pw / 2)} ${q(bas - ph)}h${q(pw)}l-2 ${q(ph)}h${q(-pw + 4)}Z" fill="${c}"/>` +
    rect(px - pw / 2, bas - ph, pw, 2.5, 'fill="#fbf3e4"');
  // 1. Plante retombante à gauche
  let pl1 = '';
  const p1 = [x + 26, bas - 14];
  for (let k = 0; k < 16; k++) {
    const a = 180 + (r() - 0.3) * 200, l = 8 + r() * 6;
    const d = 4 + r() * 22, ang = ((a - 180) * Math.PI) / 180;
    const fx = p1[0] + Math.cos(ang) * d * (r() < 0.5 ? -1 : 1), fy = p1[1] - 6 + Math.abs(Math.sin(ang)) * d * 0.5 + r() * 14;
    const c = ['#2f4a33', '#46653d', '#6f8f4c', '#9bb167'][Math.floor(r() * 4)];
    pl1 += feuille(fx, fy, l, l * 0.42, a + r() * 60, c);
  }
  // 2. Grande plante aux feuilles dressées, au milieu
  let pl2 = '';
  const p2 = [x + 62, bas - 16];
  for (let k = 0; k < 9; k++) {
    const a = -90 + (k - 4) * 9 + (r() - 0.5) * 6, l = 34 + r() * 26, lg = 3.6 + r() * 1.6;
    const c = ['#2c4630', '#3d5c38', '#55773f', '#7d9a52'][k % 4];
    pl2 += feuille(p2[0] + (k - 4) * 1.8, p2[1], l, lg, a, c);
  }
  // 3. Petite plante aux feuilles rondes, à droite
  let pl3 = '';
  const p3 = [x + 98, bas - 12];
  for (let k = 0; k < 11; k++) {
    const a = -Math.PI / 2 + (k - 5) * 0.26 + (r() - 0.5) * 0.2, l = 12 + r() * 14;
    const ex = p3[0] + Math.cos(a) * l, ey = p3[1] + Math.sin(a) * l * 0.9;
    pl3 += `<path d="M${q(p3[0])} ${q(p3[1])}L${q(ex)} ${q(ey)}" stroke="#4b6438" stroke-width="1.1"/>`;
    pl3 += `<ellipse cx="${q(ex)}" cy="${q(ey)}" rx="${q(5 + r() * 2)}" ry="${q(4 + r() * 1.5)}" fill="${['#3f5f39', '#5d7e45', '#86a45a'][k % 3]}"/>`;
  }
  // Liseré chaud de la lampe autour des feuilles (contre-jour intérieur), puis les feuilles
  p += `<g stroke="#f3cc84" stroke-width="2.4" opacity="0.5">${pl1}${pl2}${pl3}</g><g>${pl1}${pl2}${pl3}</g>`;
  p += pot(p1[0], 22, 15, '#e6ddcc') + pot(p2[0], 20, 17, '#d6d0c0') + pot(p3[0], 18, 13, '#ece2d0');
  p += rect(ix, bas - 2, iw, 4, 'fill="#c9a77e"');
  return p;
}

// Fenêtres d'un immeuble voisin (plus simples : même grammaire)
function fenetreSimple(cx, y, w, h, o = {}) {
  return fenetre(cx, y, w, h, { reflet: 0.9, ...o });
}

// Façade enduite, chaude, au soleil du matin
function immeuble() {
  const { L, R, base } = IM;
  const r = rng(77);
  // Texture de l'enduit : plaques plus claires ou plus sombres, réparations
  let enduit = '';
  for (let i = 0; i < 26; i++) {
    const cx = L + r() * (R - L), cy = 130 + r() * 790;
    enduit += `<path d="${tache(r, cx, cy, 40 + r() * 120, 20 + r() * 60, 9, 0.3)}" fill="${r() < 0.5 ? '#fbe2c2' : '#d39f82'}" opacity="${q(0.08 + r() * 0.1)}"/>`;
  }
  // Les fenêtres, étage par étage
  const etage = (y, yc, opts) => BAIES.map((cx, i) => {
    if (cx === 960 && y === 346) return '';
    const centre = cx === 960;
    return fenetre(cx, centre ? yc : y, centre ? 124 : 100, centre ? 160 : 150, opts[i] || {});
  }).join('');
  const f3 = etage(146, 142, [{ rideau: 'deux' }, { store: 0.45 }, { voile: true }, { ouvert: true, rideau: 'g' }, { store: 0.2, pot: true }]);
  const f2 = etage(346, 340, [{ store: 0.3 }, { rideau: 'g' }, {}, { voile: true }, {}]);
  const f1 = etage(548, 546, [{ feuilles: 5 }, {}, { rideau: 'deux' }, { store: 0.6 }, { rideau: 'd' }]);
  const rdc = [568, 764, 1156, 1352].map((cx, i) => fenetre(cx, 760, 100, 112, [{}, { voile: true }, { store: 0.5 }, {}][i])).join('');
  // Porte d'entrée en bois, au centre, avec imposte vitrée
  const porte = (() => {
    const x = 890, w = 140, y = 744, h = 196;
    const vitre = (a, b, c, d) => rect(a, b, c, d, 'fill="url(#a2-dehors-int)"') + rect(a, b, c, d, 'fill="url(#a2-dehors-reflet)" opacity="0.7"');
    let s = rect(x - 12, y - 12, w + 24, h + 12, 'fill="#ead6b8"');
    s += rect(x, y, w, h, 'fill="#3d3330"');
    s += vitre(x + 6, y + 4, w - 12, 26);
    s += `<path d="M${x + 70} ${y + 4}v26" stroke="#7a5236" stroke-width="3"/>`;
    for (const [bx, sens] of [[x + 4, 1], [x + 72, -1]]) {
      s += rect(bx, y + 36, 64, h - 38, 'fill="url(#a2-dehors-bois)"');
      s += vitre(bx + 10, y + 46, 44, 62);
      s += rect(bx + 10, y + 120, 44, 64, 'fill="none" stroke="#6a4630" stroke-width="2.5"');
      s += `<path d="M${bx + 12} ${y + 182}h40" stroke="#c19468" stroke-width="1.5" opacity="0.7"/>`;
      s += `<circle cx="${bx + (sens > 0 ? 58 : 6)}" cy="${y + 118}" r="2.6" fill="#3a3734"/>`;
    }
    // ombre du linteau et du tableau gauche dans l'embrasure
    s += `<path d="M${x} ${y}H${x + w}V${y + 12}H${x + 22}L${x + 16} ${y + h}H${x}Z" fill="#4c4a74" opacity="0.4"/>`;
    // marche de pierre
    s += rect(x - 16, base - 2, w + 32, 6, 'fill="#e4d9c6"') + rect(x - 16, base + 4, w + 32, 9, 'fill="#bdb1a0"');
    return s;
  })();
  // Corniche : dessus au soleil, sous-face à l'ombre, ombre portée sur la façade
  const corniche = `
    ${rect(L - 16, 92, R - L + 32, 10, 'fill="#f7e3c4"')}
    ${rect(L - 12, 102, R - L + 24, 9, 'fill="#e4c3a2"')}
    ${rect(L - 8, 111, R - L + 16, 9, 'fill="#ab918f"')}
    <path d="M${L - 16} 92.5h${R - L + 32}" stroke="#fff4dd" stroke-width="2"/>
    <path d="M${L} 120H${R}V136H${L + 30}Z" fill="#6b6894" opacity="0.38" filter="url(#a2-dehors-f4)"/>`;
  // Toit : un bandeau d'ardoise au-dessus de la corniche, deux souches de cheminée
  const toit = `
    <polygon points="${pl([[L - 16, 93], [R + 16, 93], [R - 30, 40], [L + 30, 40]])}" fill="url(#a2-dehors-toit)"/>
    <g stroke="#5c5a68" stroke-width="1.2" opacity="0.5">${Array.from({ length: 5 }, (_, i) => `<path d="M${L + 20} ${50 + i * 9}H${R - 20}"/>`).join('')}</g>
    <path d="M${L + 30} 40.5H${R - 30}" stroke="#b3aab0" stroke-width="2"/>
    ${[640, 1288].map((cx) => `
      ${rect(cx - 30, -8, 60, 70, 'fill="url(#a2-dehors-souche)"')}
      ${rect(cx - 36, -18, 72, 11, 'fill="#e9cfae"')}
      ${rect(cx - 36, -7, 72, 4, 'fill="#9d8487"')}
      <path d="M${cx + 30} -3L${cx + 50} 6V62H${cx + 30}Z" fill="#59577a" opacity="0.25"/>`).join('')}`;
  // Bandeau entre le rez-de-chaussée et le premier étage
  const bandeau = `
    ${rect(L, 708, R - L, 7, 'fill="#fae4c4"')}
    ${rect(L, 715, R - L, 9, 'fill="#dcb999"')}
    <path d="M${L} 724H${R}V734H${L + 24}Z" fill="#6b6894" opacity="0.35" filter="url(#a2-dehors-f4)"/>`;
  // Soubassement de pierre grise
  const socle = `
    ${rect(L, 888, R - L, 52, 'fill="url(#a2-dehors-socle)"')}
    ${rect(L, 886, R - L, 5, 'fill="#e2d4bf"')}
    <g stroke="#8f8577" stroke-width="1.4" opacity="0.55">
      ${Array.from({ length: 13 }, (_, i) => `<path d="M${L + 40 + i * 76} 891v49"/>`).join('')}
      <path d="M${L} 915H${R}"/>
    </g>`;
  // Descente d'eau pluviale, à droite
  const descente = `
    ${rect(R - 22, 100, 10, 840, 'fill="url(#a2-dehors-zinc)"')}
    ${[230, 430, 630, 830].map((yy) => rect(R - 25, yy, 16, 5, 'fill="#8b8a92"')).join('')}`;
  // Petit laurier en pot près de la porte
  const laurier = (() => {
    const cx = 1060, cy = 878;
    let s = `<path d="M${cx - 20} 904h40l-5 36h-30Z" fill="#9c958c"/>` + rect(cx - 22, 900, 44, 6, 'fill="#c2bbb0"');
    s += `<path d="M${cx} 904V880" stroke="#5a4a3a" stroke-width="3"/>`;
    s += `<path d="${tache(rng(91), cx, cy, 30, 28, 11, 0.16)}" fill="#5b7449"/>`;
    s += `<path d="${tache(rng(92), cx - 8, cy - 8, 20, 17, 9, 0.2)}" fill="#7f9860" opacity="0.8"/>`;
    const rr = rng(93);
    for (let k = 0; k < 26; k++) {
      const a = rr() * TAU, d = Math.sqrt(rr()) * 26;
      s += `<ellipse cx="${q(cx + Math.cos(a) * d)}" cy="${q(cy + Math.sin(a) * d)}" rx="3.4" ry="1.8" fill="${rr() < 0.4 ? '#a2b878' : '#46603e'}" transform="rotate(${q(rr() * 180)} ${q(cx + Math.cos(a) * d)} ${q(cy + Math.sin(a) * d)})"/>`;
    }
    return s;
  })();
  return `
  <defs>
    ${grad('a2-dehors-facade', L, 100, R, base, [[0, '#fadcaa'], [0.45, '#f1c38f'], [1, '#e0aa7c']])}
    ${radial('a2-dehors-chaleur', 380, 160, 900, [[0, '#fff2d2', 0.7], [0.55, '#ffe4b4', 0.2], [1, '#ffe4b4', 0]])}
    ${boite('a2-dehors-int', [[0, '#5f6670'], [0.5, '#474e58'], [1, '#353a43']])}
    ${boite('a2-dehors-int2', [[0, '#6e645d'], [0.5, '#544c49'], [1, '#3b3638']])}
    ${grad('a2-dehors-soleil-fac', L, 0, R, 0, [[0, '#fff0cc', 0.42], [0.45, '#fff0cc', 0.06], [1, '#8a7c98', 0.08]])}
    ${boite('a2-dehors-reflet', [[0, '#e9f0f0', 0.62], [0.45, '#d8e3e6', 0.22], [0.7, '#ffffff', 0.05], [1, '#fff3e4', 0.18]], 0, 0, 1, 1)}
    ${boite('a2-dehors-bois', [[0, '#a47048'], [0.5, '#8f5f3d'], [1, '#7a5034']], 0, 0, 1, 0)}
    ${boite('a2-dehors-toit', [[0, '#8f8b97'], [1, '#6f6c7b']], 0, 0, 1, 0)}
    ${boite('a2-dehors-souche', [[0, '#f0cfae'], [1, '#d6ab8f']], 0, 0, 1, 0)}
    ${boite('a2-dehors-socle', [[0, '#c9bba7'], [1, '#b1a491']])}
    ${boite('a2-dehors-zinc', [[0, '#c4c4c8'], [0.4, '#9d9ca4'], [1, '#76757f']], 0, 0, 1, 0)}
    <radialGradient id="a2-dehors-lampe" cx="0.5" cy="0.5" r="0.5">${stops([[0, '#fff3d4', 0.9], [1, '#ffd9a0', 0]])}</radialGradient>
    ${radial('a2-dehors-chaud', WC[0] + 14, FEN.y + 60, 120, [[0, '#ffe9bf'], [0.35, '#f2c486'], [0.75, '#c88a58'], [1, '#93603f']])}
    <clipPath id="a2-dehors-clip-facade"><rect x="${L}" y="120" width="${R - L}" height="${base - 120}"/></clipPath>
    ${blur('a2-dehors-f4', 4)}${blur('a2-dehors-f8', 8)}
    ${brosse('a2-dehors-br1', 0.012, 0.05, 4, 3, 1.3)}
    ${brosse('a2-dehors-br2', 0.02, 0.006, 9, 3, 1.35)}
  </defs>
  ${toit}
  <!-- Façade au soleil -->
  ${rect(L, 120, R - L, base - 120, 'fill="url(#a2-dehors-facade)"')}
  <g clip-path="url(#a2-dehors-clip-facade)">
    ${rect(L, 120, R - L, base - 120, 'fill="url(#a2-dehors-chaleur)"')}
    ${rect(L, 120, R - L, base - 120, 'fill="url(#a2-dehors-soleil-fac)"')}
    ${enduit}
    ${rect(L, 120, R - L, base - 120, 'fill="#c9946c" opacity="0.18" filter="url(#a2-dehors-br1)"')}
    ${rect(L, 120, R - L, base - 120, 'fill="#fff0d6" opacity="0.25" filter="url(#a2-dehors-br2)"')}
  </g>
  ${corniche}
  ${bandeau}
  ${f3}${f2}${f1}${rdc}
  <!-- La fenêtre du couple -->
  ${fenetre(WC[0], FEN.y, FEN.w, FEN.h, { interieur: 'url(#a2-dehors-chaud)', dedans: interieurCouple(), reflet: 0.55 })}
  ${socle}
  ${porte}
  ${laurier}
  ${descente}
  <path d="M${R - 1} 120V${base}" stroke="#fff3df" stroke-width="1.5" opacity="0.6"/>`;
}

// Voisin de gauche : plus haut, enduit crème pâle, en grande partie caché par l'arbre
function voisinGauche() {
  const L = -260, R = IM.L;
  let f = '';
  for (const y of [44, 224, 404, 584]) for (const cx of [-120, 70, 300]) f += fenetreSimple(cx, y, 92, 140, { feuilles: y === 584 ? 3 : 0 });
  for (const cx of [-120, 70, 300]) f += fenetreSimple(cx, 770, 92, 104, {});
  return `
  <defs>${grad('a2-dehors-vg', L, 0, R, 940, [[0, '#f1e3cc'], [1, '#dccab0']])}</defs>
  ${rect(L, -60, R - L, 1000, 'fill="url(#a2-dehors-vg)"')}
  ${rect(L - 10, -70, R - L + 10, 14, 'fill="#f4e6cf"')}${rect(L - 10, -56, R - L + 10, 8, 'fill="#a99597"')}
  <path d="M${L} -48H${R}V-34H${L + 20}Z" fill="#6b6894" opacity="0.35" filter="url(#a2-dehors-f4)"/>
  ${f}
  ${rect(L, 888, R - L, 52, 'fill="url(#a2-dehors-socle)"')}
  <path d="M${R} -60V940" stroke="#b49a86" stroke-width="2" opacity="0.6"/>`;
}

// Voisin de droite : plus bas, en léger retrait, enduit vert-de-gris pâle
function voisinDroite() {
  const { L, R, haut } = VOISIN_D;
  let f = '';
  for (const y of [352, 562]) for (const cx of [1600, 1800, 2000]) f += fenetreSimple(cx, y, 100, 150, y === 352 && cx === 2000 ? { rideau: 'deux' } : cx === 1800 && y === 562 ? { store: 0.4 } : {});
  f += fenetreSimple(1600, 770, 100, 110, {}) + fenetreSimple(2000, 770, 100, 110, { voile: true });
  return `
  <defs>
    ${grad('a2-dehors-vd', L, haut, R, 940, [[0, '#d9d6bc'], [1, '#bdbca2']])}
    ${boite('a2-dehors-toit2', [[0, '#8a8794'], [1, '#6e6b79']], 0, 0, 1, 0)}
  </defs>
  <polygon points="${pl([[L - 10, haut - 20], [R + 10, haut - 20], [R, haut - 74], [L + 24, haut - 74]])}" fill="url(#a2-dehors-toit2)"/>
  ${rect(1930, haut - 120, 52, 60, 'fill="#cbc6ad"')}${rect(1924, haut - 128, 64, 10, 'fill="#e6e0c6"')}
  ${rect(L, haut, R - L, 940 - haut, 'fill="url(#a2-dehors-vd)"')}
  ${rect(L - 10, haut - 20, R - L + 20, 10, 'fill="#eee8d0"')}${rect(L - 6, haut - 10, R - L + 12, 10, 'fill="#a6a296"')}
  ${f}
  <!-- porte d'entrée du voisin -->
  ${rect(1745, 752, 110, 188, 'fill="#5d4a3e"')}${rect(1752, 760, 96, 180, 'fill="#6f5a49"')}
  ${rect(1762, 772, 76, 70, 'fill="url(#a2-dehors-int)"')}
  ${rect(L, 890, R - L, 50, 'fill="url(#a2-dehors-socle)"')}`;
}

// Trottoir de pierre claire, bordure, caniveau, chaussée ; feuilles tombées
const VP = [960, 860];                                          // point de fuite (hauteur des yeux)
function trottoir() {
  const yF = IM.base, yB = 1032;
  const sur = (x, y) => [VP[0] + (x - VP[0]) * ((y - VP[1]) / (yB - VP[1])), y];   // x au bord → x à la profondeur y
  let joints = '';
  for (let x = -1400; x <= 3400; x += 150) {
    const a = sur(x, yF), b = [x, yB];
    joints += `<path d="M${q(a[0])} ${yF}L${q(b[0])} ${yB}"/>`;
  }
  joints += `<path d="M-260 975H2180M-260 1004H2180"/>`;
  // Feuilles tombées : plus nombreuses près de l'arbre et le long du caniveau
  const r = rng(404);
  let tapis = '';
  const tons = ['#e3a84a', '#c76a32', '#efc35e', '#b2552c', '#d9913c'];
  for (let i = 0; i < 230; i++) {
    let x, y;
    const u = r();
    if (u < 0.45) { x = PIED[0] + (r() - 0.4) * 520 * Math.sqrt(r()); y = yF + 8 + r() * (yB - yF - 6); }
    else if (u < 0.75) { x = -260 + r() * 2440; y = 1050 + r() * 18; }
    else { x = -260 + r() * 2440; y = yF + 6 + r() * (yB - yF); }
    const k = 0.6 + ((y - yF) / (1070 - yF)) * 0.6, s = (4 + r() * 4) * k;
    tapis += `<ellipse cx="${q(x)}" cy="${q(y)}" rx="${q(s)}" ry="${q(s * 0.42)}" fill="${tons[Math.floor(r() * tons.length)]}" transform="rotate(${q((r() - 0.5) * 70)} ${q(x)} ${q(y)})" opacity="${q(0.75 + r() * 0.25)}"/>`;
  }
  return `
  <defs>
    ${grad('a2-dehors-dalle', 0, yF, 0, yB, [[0, '#cdc2b2'], [1, '#ddd3c4']])}
    ${grad('a2-dehors-route', 0, 1066, 0, 1300, [[0, '#76727a'], [1, '#5c5961']])}
  </defs>
  ${rect(-260, yF, 2440, yB - yF, 'fill="url(#a2-dehors-dalle)"')}
  <g stroke="#a69c8e" stroke-width="1.6" opacity="0.6">${joints}</g>
  <!-- pied de l'arbre : un carré de terre, bordé de pierre, couvert de feuilles -->
  <path d="${tache(rng(410), PIED[0] + 6, PIED[1] + 4, 66, 15, 11, 0.12)}" fill="#a39888"/>
  <path d="${tache(rng(411), PIED[0] + 6, PIED[1] + 3, 58, 11, 11, 0.12)}" fill="#6e5946"/>
  <!-- bordure, caniveau, chaussée -->
  ${rect(-260, yB, 2440, 9, 'fill="#e7e0d4"')}
  ${rect(-260, yB + 9, 2440, 15, 'fill="#aea596"')}
  ${rect(-260, 1056, 2440, 12, 'fill="#8c867f"')}
  ${rect(-260, 1068, 2440, 200, 'fill="url(#a2-dehors-route)"')}
  ${tapis}
  <!-- pied des façades : occlusion -->
  ${rect(-260, yF - 6, 2440, 14, 'fill="#5d5868" opacity="0.35" filter="url(#a2-dehors-f8)"')}`;
}

const IMMEUBLE = `${voisinGauche()}${voisinDroite()}${immeuble()}${trottoir()}`;

/* ---------- Calque 3 : l'arbre de rue ---------- */
// Feuillage peint, éclairé d'en haut à gauche : une masse modelée par des
// croissants de lumière et des creux d'ombre fondus, puis des touches de feuilles
function feuillage(id, lobes, t, o = {}) {
  const lum = o.lum || [-0.72, -0.7], flou = o.flou ?? 3, nf = o.feuilles ?? 10;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y, r] of lobes) { x0 = Math.min(x0, x - r); x1 = Math.max(x1, x + r); y0 = Math.min(y0, y - r); y1 = Math.max(y1, y + r); }
  let sil = '', clair = '', creux = '', feuilles = '', sombres = '', vif = '';
  const a0 = Math.atan2(lum[1], lum[0]);
  for (const [x, y, r, sd] of lobes) {
    const rr = rng(sd);
    sil += `<path d="${tache(rr, x, y, r, r * 0.9, 12, 0.16)}"/>`;
    const nb = 4 + Math.floor(rr() * 5);
    for (let i = 0; i < nb; i++) {
      const a = rr() * TAU, d = r * (0.8 + rr() * 0.16), s = r * (0.09 + rr() * 0.11);
      sil += `<path d="${tache(rr, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.9, s, s * 0.85, 7, 0.3)}"/>`;
    }
    clair += `<path d="${tache(rng(sd + 1), x + lum[0] * r * 0.3, y + lum[1] * r * 0.3, r * 0.7, r * 0.58, 10, 0.2)}"/>`;
    // éclat franc sur le bord tourné vers le soleil
    vif += `<path d="${tache(rng(sd + 3), x + lum[0] * r * 0.58, y + lum[1] * r * 0.58, r * 0.34, r * 0.24, 8, 0.3)}"/>`;
    creux += `<path d="${tache(rng(sd + 2), x - lum[0] * r * 0.45, y - lum[1] * r * 0.55, r * 0.6, r * 0.38, 9, 0.25)}"/>`;
    for (let i = 0; i < nf; i++) {
      const a = a0 + (rr() - 0.5) * 2.1, d = r * (0.5 + rr() * 0.48), s = Math.max(2, r * (0.05 + rr() * 0.06));
      const fx = x + Math.cos(a) * d, fy = y + Math.sin(a) * d;
      feuilles += `<path d="M${q(-s)} 0Q0 ${q(-s * 0.55)} ${q(s)} 0Q0 ${q(s * 0.55)} ${q(-s)} 0Z" transform="translate(${q(fx)} ${q(fy)}) rotate(${q(rr() * 180)})"/>`;
      const b = a0 + Math.PI + (rr() - 0.5) * 2, e = r * (0.3 + rr() * 0.6);
      const gx = x + Math.cos(b) * e, gy = y + Math.sin(b) * e;
      sombres += `<ellipse cx="${q(gx)}" cy="${q(gy)}" rx="${q(s * 1.1)}" ry="${q(s * 0.7)}" transform="rotate(${q(rr() * 180)} ${q(gx)} ${q(gy)})"/>`;
    }
  }
  const lx = lum[0] < 0 ? x0 : x1, ly = lum[1] < 0 ? y0 : y1;
  return `
  <defs>
    <linearGradient id="${id}-g" gradientUnits="userSpaceOnUse" x1="${q(lx)}" y1="${q(ly)}" x2="${q(x0 + x1 - lx)}" y2="${q(y0 + y1 - ly)}">
      <stop offset="0" stop-color="${t.lumiere}"/><stop offset="0.45" stop-color="${t.moyen}"/><stop offset="1" stop-color="${t.ombre}"/>
    </linearGradient>
    <clipPath id="${id}-c">${sil}</clipPath>
    <filter id="${id}-f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${flou}"/></filter>
  </defs>
  <g fill="url(#${id}-g)">${sil}</g>
  <g clip-path="url(#${id}-c)">
    <g filter="url(#${id}-f)">
      <g fill="${t.creux}" opacity="0.5">${creux}</g>
      <g fill="${t.lumiere}" opacity="0.85">${clair}</g>
    </g>
    <g fill="${t.creux}" opacity="0.4">${sombres}</g>
    <g fill="${t.eclat}" opacity="0.45">${vif}</g>
    <g fill="${t.eclat}" opacity="0.7">${feuilles}</g>
    ${o.voile ? `<rect x="${q(x0)}" y="${q(y0)}" width="${q(x1 - x0)}" height="${q(y1 - y0)}" fill="#4a2a1c" opacity="${o.voile}"/>` : ''}
  </g>`;
}
// Fond de couronne : la masse sombre et chaude, entre les grappes de feuilles
const F_OR = { ombre: '#a8592a', moyen: '#e29a36', lumiere: '#fcd66a', eclat: '#fff4c2', creux: '#7e3a1a' };
const F_ROUX = { ombre: '#7e3420', moyen: '#c75d2a', lumiere: '#f2a24f', eclat: '#fdd69c', creux: '#5a2416' };
const F_MIEL = { ombre: '#9a682c', moyen: '#d8a444', lumiere: '#f6da7a', eclat: '#fff2c6', creux: '#6e4622' };
// Gammes d'automne, de l'ombre à la lumière : or, roux, miel
const PAL_OR = ['#73381c', '#9c5426', '#c97b2c', '#e8a43a', '#f8cc5a', '#fff0a8'];
const PAL_ROUX = ['#552216', '#7d3320', '#a94a26', '#d06a30', '#ec9245', '#fbc07a'];
const PAL_MIEL = ['#5c4024', '#86602e', '#b4893c', '#d9b152', '#f0d278', '#fff0bc'];
const LUM = [-0.72, -0.69];                                    // direction de la lumière (haut gauche)

// Grappes de feuilles : chaque grappe est éclairée selon sa place dans la masse
// (côté soleil en haut à gauche), puis les feuilles une à une, pointues
function grappes(masses, seed) {
  const r = rng(seed), toutes = [];
  for (const [cx, cy, rx, ry, pal, n] of masses) {
    for (let i = 0; i < n; i++) {
      const d = Math.sqrt((i + 0.5) / n) * (0.95 + r() * 0.2), a = i * 2.39996 + r() * 0.6;
      if (d < 0.72 && r() < 0.45) continue;                    // l'intérieur est déjà peint
      const nx = Math.cos(a) * d, ny = Math.sin(a) * d;
      const v = clamp(0.5 + 0.45 * (nx * LUM[0] + ny * LUM[1]) + (r() - 0.5) * 0.3 + 0.1 * (d - 0.5));
      toutes.push([cx + nx * rx, cy + ny * ry, v, pal, 12 + r() * 12, Math.floor(r() * 1e6)]);
    }
  }
  toutes.sort((u, w) => u[2] - w[2]);
  let s = '';
  for (const [x, y, v, pal, rc, sd] of toutes) {
    const rr = rng(sd);
    for (let k = 0; k < 8; k++) {
      const b = rr() * TAU, e = Math.sqrt(rr()) * rc, lx = x + Math.cos(b) * e, ly = y + Math.sin(b) * e * 0.85;
      const vv = clamp(v + (rr() - 0.5) * 0.26 - 0.1 * Math.sin(b));
      const l = 7 + rr() * 6, w = l * (0.3 + rr() * 0.1);
      s += `<path d="M${q(-l / 2)} 0Q0 ${q(-w)} ${q(l / 2)} 0Q0 ${q(w)} ${q(-l / 2)} 0Z" fill="${pal[Math.min(5, Math.floor(vv * 6))]}" transform="translate(${q(lx)} ${q(ly)}) rotate(${q(rr() * 360)})"/>`;
    }
  }
  return s;
}

const BRANCHES = [
  [[[352, 600], [300, 500], [228, 410], [150, 320], [70, 210]], 30, 9],
  [[[356, 586], [410, 486], [480, 386], [560, 296], [650, 214]], 28, 8],
  [[[354, 574], [360, 462], [350, 340], [330, 220], [300, 80]], 26, 8],
  [[[410, 480], [478, 462], [560, 446], [668, 436]], 12, 4],
  [[[232, 412], [180, 386], [96, 384]], 11, 3],
  [[[330, 230], [250, 150], [170, 90]], 10, 3],
  [[[340, 300], [420, 210], [500, 150]], 10, 3],
];
function arbre() {
  const r = rng(505);
  // Ramilles fines dans les trouées du feuillage
  let ramilles = '';
  for (let i = 0; i < 26; i++) {
    const b = BRANCHES[Math.floor(r() * 3)][0], k = 1 + Math.floor(r() * (b.length - 2));
    const p0 = b[k], a = -Math.PI / 2 + (r() - 0.5) * 2.4, l = 40 + r() * 70;
    const p1 = [p0[0] + Math.cos(a) * l * 0.5 + (r() - 0.5) * 10, p0[1] + Math.sin(a) * l * 0.5], p2 = [p0[0] + Math.cos(a) * l, p0[1] + Math.sin(a) * l];
    ramilles += `<path d="${trace([p0, p1, p2])}" stroke="#5a4c46" stroke-width="${q(1.5 + r() * 1.5)}" fill="none" stroke-linecap="round"/>`;
  }
  // Bouquets de la couronne : [cx, cy, rx, ry, gamme, plan] ; plan 0 au fond (plus sombre), 2 devant.
  // Ils se recouvrent en partie et laissent des trouées où passent les branches
  const BOUQUETS = [
    [430, -80, 210, 110, 'miel', 0], [120, 40, 180, 120, 'roux', 0], [590, 120, 140, 100, 'or', 0],
    [-90, 150, 150, 140, 'roux', 1], [290, -40, 200, 120, 'or', 1], [50, 280, 150, 115, 'roux', 1], [480, 236, 125, 84, 'or', 1],
    [250, 156, 170, 100, 'or', 2], [604, 346, 124, 78, 'roux', 2], [706, 226, 64, 54, 'or', 2],
  ];
  const GAMMES = { or: [F_OR, PAL_OR], roux: [F_ROUX, PAL_ROUX], miel: [F_MIEL, PAL_MIEL] };
  const bouquets = BOUQUETS.map(([cx, cy, rx, ry, gm, plan], i) => {
    const lobes = couronne(540 + i, cx, cy, rx * 0.74, ry * 0.7, Math.round((rx * ry) / 4600) + 3, ry * 0.4, ry * 0.62);
    return feuillage(`a2-dehors-b${i}`, lobes, GAMMES[gm][0], { flou: 5, feuilles: 9, voile: [0.32, 0.12, 0][plan] }) +
      grappes([[cx, cy, rx * 0.98, ry * 0.95, GAMMES[gm][1], Math.round((rx + ry) / 3.2)]], 560 + i);
  });
  return `
  <defs>
    ${grad('a2-dehors-ecorce', 300, 0, 400, 0, [[0, '#b4a28a'], [0.35, '#857767'], [0.7, '#5d5552'], [1, '#48434c']])}
    ${grad('a2-dehors-branche', 0, 600, 0, 60, [[0, '#6e6159'], [1, '#7e6c5f']])}
  </defs>
  <!-- Tronc lisse, éclairé à gauche -->
  <path d="${tige(TRONC, 54, 36)}" fill="url(#a2-dehors-ecorce)"/>
  <path d="${trace([[318, 1004], [322, 900], [328, 780], [336, 660]])}" stroke="#d6c4a8" stroke-width="5" fill="none" opacity="0.45"/>
  <g stroke="#4c4348" stroke-width="2" fill="none" opacity="0.45">
    <path d="M350 900q6 -20 2 -40M340 820q8 -14 4 -32M356 740q-4 -14 2 -30M346 960q4 -16 0 -30M352 640q-3 -12 2 -24"/>
  </g>
  <!-- écorce : plaques plus claires et lenticelles -->
  <g fill="#c8b89e" opacity="0.35">
    <path d="${tache(rng(611), 326, 940, 9, 22, 8, 0.3)}"/><path d="${tache(rng(612), 334, 860, 7, 16, 8, 0.3)}"/><path d="${tache(rng(613), 338, 760, 8, 20, 8, 0.3)}"/><path d="${tache(rng(614), 344, 680, 6, 14, 8, 0.3)}"/>
  </g>
  <g stroke="#3f3a40" stroke-width="1.6" opacity="0.4">
    ${Array.from({ length: 12 }, (_, i) => { const y = 600 + i * 34, x = 330 + (i % 3) * 8 + (y - 600) * -0.02; return `<path d="M${q(x)} ${y}h${6 + (i % 4) * 2}"/>`; }).join('')}
  </g>
  ${BRANCHES.map(([p, a, b]) => `<path d="${tige(p, a, b)}" fill="url(#a2-dehors-branche)"/>`).join('')}
  ${BRANCHES.slice(0, 3).map(([p, a]) => `<path d="${trace(p)}" stroke="#bda88c" stroke-width="${q(a * 0.18)}" fill="none" opacity="0.5" transform="translate(-${q(a * 0.25)} 0)"/>`).join('')}
  ${ramilles}
  ${bouquets.join('')}
  <!-- les branches basses, déjà presque nues : quelques feuilles éparses -->
  ${grappes([[190, 384, 120, 46, PAL_ROUX, 22], [420, 384, 80, 36, PAL_OR, 12], [610, 440, 70, 24, PAL_ROUX, 8]], 590)}`;
}
const ARBRE = arbre();

/* ---------- Calque 4 : branche floue au premier plan (en haut à droite) ---------- */
const PREMIER = (() => {
  const r = rng(606);
  let s = `<path d="${tige([[2260, -260], [2000, -150], [1760, -40], [1520, 60], [1330, 130]], 34, 6)}" fill="#4a3a32"/>`;
  s += `<path d="${tige([[1900, -110], [1820, 10], [1700, 110]], 14, 4)}" fill="#4a3a32"/>`;
  const tons = ['#e9a945', '#c96a33', '#f2c867', '#a8512a', '#dc8c3c'];
  const amas = [[1430, 128, 46], [1560, 66, 64], [1740, -14, 84], [1700, 104, 48], [1930, -110, 110]];
  for (const [cx, cy, rr] of amas) {
    for (let i = 0; i < 18; i++) {
      const a = r() * TAU, d = Math.sqrt(r()) * rr, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8, sz = 16 + r() * 16;
      s += `<ellipse cx="${q(x)}" cy="${q(y)}" rx="${q(sz)}" ry="${q(sz * 0.55)}" fill="${tons[Math.floor(r() * tons.length)]}" transform="rotate(${q(r() * 180)} ${q(x)} ${q(y)})"/>`;
    }
  }
  return s;
})();

/* ---------- Effets procéduraux ---------- */
// Ombre tachetée de la couronne sur la façade : une texture peinte une fois,
// dense à gauche (sous l'arbre), qui s'éclaircit vers la fenêtre du couple
const TACHES_BOX = [300, -80, 760, 760];
// Densité de l'ombre de la couronne (projetée vers la droite et un peu vers le bas)
function densite(x, y) {
  const e = (cx, cy, rx, ry) => Math.max(0, 1 - Math.hypot((x - cx) / rx, (y - cy) / ry));
  return Math.min(1, 1.6 * e(530, 190, 330, 230) + 1.4 * e(780, 410, 170, 120) + 0.9 * e(860, 250, 150, 170));
}
function texTaches(c, k) {
  const [bx, by, bw, bh] = TACHES_BOX;
  const r = rng(707);
  c.scale(k, k);
  c.translate(-bx, -by);
  c.filter = 'blur(2px)';
  c.fillStyle = '#fff';
  const feuille = (x, y, s) => {
    c.beginPath();
    c.ellipse(x, y, s * (0.8 + r() * 0.6), s * (0.45 + r() * 0.3), r() * Math.PI, 0, TAU);
    c.fill();
  };
  // Grappes de taches, plus nombreuses et plus grosses là où la couronne est épaisse
  for (let i = 0; i < 900; i++) {
    const x = bx + r() * bw, y = by + r() * bh, d = densite(x, y);
    if (r() > d) continue;
    const n = Math.round(3 + d * 9), e = 8 + d * 22;
    for (let j = 0; j < n; j++) { const a = r() * TAU, dd = Math.sqrt(r()) * e; feuille(x + Math.cos(a) * dd, y + Math.sin(a) * dd * 0.8, 3 + r() * 5 * (0.6 + d)); }
  }
  // Ombres de quelques branches (traits souples)
  c.strokeStyle = '#fff';
  c.lineCap = 'round';
  for (const [x0, y0, x1, y1, w] of [[470, 520, 700, 470, 9], [480, 300, 690, 200, 6], [600, 470, 860, 470, 5]]) {
    c.lineWidth = w;
    c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 24, x1, y1); c.stroke();
  }
  // Trous de soleil dans les parties denses
  c.globalCompositeOperation = 'destination-out';
  c.filter = 'blur(1.4px)';
  for (let i = 0; i < 260; i++) {
    const x = bx + r() * bw, y = by + r() * bh;
    if (densite(x, y) < 0.5) continue;
    c.beginPath(); c.ellipse(x, y, 2.5 + r() * 6, 2 + r() * 4, r() * Math.PI, 0, TAU); c.fill();
  }
}

// Masque de l'ombre des immeubles d'en face (rue, bas des façades, pied de l'arbre)
// et de l'ombre portée de notre immeuble sur le voisin en retrait
const OMBRE_BOX = [-260, 180, 2440, 1120];
function texOmbre(c, k) {
  const [bx, by] = OMBRE_BOX;
  c.scale(k, k);
  c.translate(-bx, -by);
  c.filter = 'blur(3px)';
  c.fillStyle = '#fff';
  c.beginPath();
  BORD_OMBRE.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.lineTo(2200, 1320); c.lineTo(-300, 1320); c.closePath(); c.fill();
  // le tronc, plus près des immeubles d'en face, a son ombre plus haut
  const tr = new Path2D(tige(TRONC, 54, 36));
  c.save();
  c.beginPath(); c.rect(250, 540, 200, 200); c.clip();
  c.fill(tr);
  c.restore();
  // notre immeuble masque le soleil sur une bande du voisin en retrait
  c.beginPath();
  c.moveTo(1450, VOISIN_D.haut - 76); c.lineTo(1512, VOISIN_D.haut - 46); c.lineTo(1514, 1320); c.lineTo(1450, 1320); c.closePath(); c.fill();
  // la trouée de soleil, découpée dans l'ombre
  c.globalCompositeOperation = 'destination-out';
  c.filter = 'blur(4px)';
  c.beginPath();
  TROUEE.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath(); c.fill();
}

// Petites images de travail, peintes une fois
let SP = null;
function sprites() {
  if (SP) return SP;
  const mk = (w, h, draw) => {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    draw(c.getContext('2d'), c.width, c.height);
    return c;
  };
  // Teinte un masque blanc dans une couleur donnée
  const teinte = (m, col) => mk(m.width, m.height, (c) => {
    c.drawImage(m, 0, 0);
    c.globalCompositeOperation = 'source-in';
    c.fillStyle = col;
    c.fillRect(0, 0, m.width, m.height);
  });
  const KT = 1.25, KO = 0.5;
  const taches = mk(TACHES_BOX[2] * KT, TACHES_BOX[3] * KT, (c) => texTaches(c, KT));
  const ombre = mk(OMBRE_BOX[2] * KO, OMBRE_BOX[3] * KO, (c) => texOmbre(c, KO));
  // Feuille floue du premier plan (trois teintes)
  const feuilleFloue = (col) => mk(96, 96, (c) => {
    c.filter = 'blur(5px)';
    c.fillStyle = col;
    c.translate(48, 48);
    c.beginPath();
    c.moveTo(-30, 0);
    c.bezierCurveTo(-18, -22, 14, -20, 32, 0);
    c.bezierCurveTo(14, 20, -18, 22, -30, 0);
    c.fill();
  });
  const doux = (rgb, a0 = 1, k = 0.45) => mk(64, 64, (c, w) => {
    const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, `rgba(${rgb},${a0})`);
    g.addColorStop(k, `rgba(${rgb},${a0 * 0.8})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, w, w);
  });
  SP = {
    tachesMul: teinte(taches, 'rgb(170,168,206)'), tachesScr: teinte(taches, 'rgb(22,24,48)'),
    ombreMul: teinte(ombre, 'rgb(156,156,196)'), ombreScr: teinte(ombre, 'rgb(24,26,48)'),
    floues: ['#e9a945', '#c8652f', '#f0c565'].map(feuilleFloue),
    eclat: doux('255,236,190', 1, 0.3),
    halo: doux('255,214,150', 1, 0.2),
  };
  return SP;
}

const mod = (v, m) => ((v % m) + m) % m;
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rgbMix = (a, b, k) => `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))})`;

// Feuilles qui tombent de l'arbre, au plan de la façade
const FACES = ['#f1c04e', '#e08a3a', '#c95a2c', '#eab04a'].map(hex);
const REVERS = ['#dcbb80', '#c99a6a', '#ad6c4c', '#d4b072'].map(hex);
const OMBRE_C = hex('#8a86a6');
const CHUTE = (() => {
  const r = rng(301);
  return Array.from({ length: 46 }, () => ({
    x: 40 + Math.pow(r(), 1.25) * 1300, y: r() * 1240, vy: 26 + r() * 26, vx: 7 + r() * 12,
    amp: 12 + r() * 26, f: 0.5 + r() * 0.6, ph: r() * TAU, s: 11 + r() * 8,
    spin: (r() - 0.5) * 1.2, tour: 1.4 + r() * 1.8, c: Math.floor(r() * 4),
  }));
})();
// Grandes feuilles floues, tout près de la caméra
const FLOUES = (() => {
  const r = rng(302);
  return [[180, 0.1], [1660, 0.35], [520, 0.62], [1400, 0.85], [1820, 0.05]].map(([x, y]) => ({
    x, y: y * 1500, vy: 52 + r() * 22, vx: 10 + r() * 14, amp: 30 + r() * 30, f: 0.4 + r() * 0.3, ph: r() * TAU,
    s: 34 + r() * 18, spin: (r() - 0.5) * 0.8, tour: 0.9 + r() * 0.8, c: Math.floor(r() * 3),
  }));
})();
// Scintillements du soleil dans la couronne
const ECLATS = (() => {
  const r = rng(303);
  return Array.from({ length: 18 }, () => {
    const a = Math.PI + r() * 1.6, d = 0.75 + r() * 0.3;
    return { x: 330 + Math.cos(a) * 340 * d, y: 140 + Math.sin(a) * 220 * d, s: 6 + r() * 12, ph: r() * TAU, f: 0.7 + r() * 1.1, a: 0.3 + r() * 0.4 };
  });
})();

function feuilleChemin(c, s) {
  c.beginPath();
  c.moveTo(-s * 0.5, 0);
  c.bezierCurveTo(-s * 0.3, -s * 0.36, s * 0.25, -s * 0.34, s * 0.55, 0);
  c.bezierCurveTo(s * 0.25, s * 0.34, -s * 0.3, s * 0.36, -s * 0.5, 0);
  c.fill();
}

/* ---------- Le décor ---------- */
export default {
  id: 'a2-dehors',
  bg: '#d9dcd6',
  home: { x: 960, y: 540, z: 1 },
  region: { portrait: [340, -200, 1240, 1480] },
  layers: {
    ciel: { box: [-240, -160, 2400, 920], svg: CIEL, filters: ['paint'], par: 0.4 },
    immeuble: { box: [-240, -120, 2400, 1380], svg: IMMEUBLE, filters: ['paint'], par: 1, res: 1.25 },
    arbre: { box: [-240, -240, 1300, 1290], svg: ARBRE, filters: ['paint'], par: 1, res: 1.1 },
    premier: { box: [1100, -360, 1300, 760], svg: PREMIER, filters: ['paint', 'b16'], par: 1.5 },
  },

  render(g, p, T) {
    const vent = p.vent ?? 1, soleil = p.soleil ?? 1;
    const S = sprites();

    g.img('ciel');
    g.img('immeuble');

    // Ombre tachetée de la couronne, au soleil seulement (au-dessus de l'ombre de la rue)
    g.fx(1, (c) => {
      // seulement sur les façades (voisin de gauche, notre immeuble), au-dessus de l'ombre de la rue
      c.beginPath();
      c.moveTo(-260, -70); c.lineTo(IM.L, -70); c.lineTo(IM.L, 92); c.lineTo(IM.R, 92);
      for (let x = IM.R; x >= -260; x -= 20) c.lineTo(x, ligneOmbre(x));
      c.closePath(); c.clip();
      const [bx, by, bw, bh] = TACHES_BOX;
      const gx = vent * (-7 * Math.sin(0.17 * T) - 3 * Math.sin(0.07 * T + 1)), gy = vent * 3 * Math.sin(0.12 * T);
      for (const [a, dx, dy] of [[0.62, 0, 0], [0.3, 4 * Math.sin(1.1 * T), 2.5 * Math.sin(0.8 * T + 1)]]) {
        c.globalCompositeOperation = 'multiply';
        c.globalAlpha = a * soleil;
        c.drawImage(S.tachesMul, bx + gx + dx * vent, by + gy + dy * vent, bw, bh);
        c.globalCompositeOperation = 'screen';
        c.globalAlpha = a * 0.8 * soleil;
        c.drawImage(S.tachesScr, bx + gx + dx * vent, by + gy + dy * vent, bw, bh);
      }
    });

    // La fenêtre du couple : halo chaud de la lampe, reflet du ciel qui glisse
    g.fx(1, (c) => {
      const { x, y, w, h } = FEN;
      c.save();
      c.beginPath(); c.rect(x + 8, y + 8, w - 16, h - 16); c.clip();
      c.globalCompositeOperation = 'screen';
      const x0 = x - 50 + 170 * (p.reflet ?? 0);
      for (const [dx, ww, a] of [[0, 30, 0.22], [42, 12, 0.15]]) {
        const gr = c.createLinearGradient(x0 + dx, 0, x0 + dx + ww, 0);
        gr.addColorStop(0, 'rgba(236,243,242,0)');
        gr.addColorStop(0.5, `rgba(236,243,242,${a})`);
        gr.addColorStop(1, 'rgba(236,243,242,0)');
        c.fillStyle = gr;
        c.save();
        c.translate(x0 + dx + ww / 2, WC[1]); c.transform(1, 0, -0.45, 1, 0, 0); c.translate(-(x0 + dx + ww / 2), -WC[1]);
        c.fillRect(x0 + dx, y, ww, h);
        c.restore();
      }
      c.restore();
      c.globalCompositeOperation = 'screen';
      c.globalAlpha = 0.22;
      c.drawImage(S.halo, x + w * 0.7 - 60, y + 64 - 60, 120, 120);
    });

    // L'arbre se balance à peine
    const rot = vent * (0.0028 * Math.sin(0.5 * T) + 0.0012 * Math.sin(1.3 * T + 1));
    g.img('arbre', { tf: { rot, ox: PIED[0], oy: PIED[1] } });

    // Ombre bleutée des immeubles d'en face : rue, bas des façades, pied de l'arbre
    g.fx(1, (c) => {
      const [bx, by, bw, bh] = OMBRE_BOX;
      c.globalCompositeOperation = 'multiply';
      c.globalAlpha = soleil;
      c.drawImage(S.ombreMul, bx, by, bw, bh);
      c.globalCompositeOperation = 'screen';
      c.globalAlpha = 0.85 * soleil;
      c.drawImage(S.ombreScr, bx, by, bw, bh);
    });

    // Scintillements du soleil au bord de la couronne
    g.fx(1, (c) => {
      c.translate(PIED[0], PIED[1]); c.rotate(rot); c.translate(-PIED[0], -PIED[1]);
      c.globalCompositeOperation = 'screen';
      for (const e of ECLATS) {
        const k = 0.5 + 0.5 * Math.sin(e.f * T + e.ph);
        c.globalAlpha = e.a * k * k * soleil;
        c.drawImage(S.eclat, e.x - e.s, e.y - e.s, e.s * 2, e.s * 2);
      }
    });

    // Feuilles qui tombent, en tournoyant ; dorées au soleil, bleutées dans l'ombre de la rue
    g.fx(1, (c) => {
      for (const d of CHUTE) {
        const y = mod(d.y + d.vy * T, 1240) - 160;
        const x = d.x + d.vx * T * vent + d.amp * Math.sin(d.f * T + d.ph);
        const tour = Math.cos(d.tour * T + d.ph);
        const om = smooth(ligneOmbre(x) - 14, ligneOmbre(x) + 14, y);
        const col = tour > 0 ? FACES[d.c] : REVERS[d.c];
        c.save();
        c.translate(x, y);
        c.rotate(d.spin * T + 0.5 * Math.sin(d.f * T + d.ph));
        c.scale(1, Math.max(0.12, Math.abs(tour)));
        c.fillStyle = rgbMix(col, OMBRE_C, om * 0.55);
        feuilleChemin(c, d.s);
        c.restore();
      }
    });

    // Air lumineux du matin : chaleur venue d'en haut à gauche
    g.fx(1, (c) => {
      c.globalCompositeOperation = 'screen';
      const h = c.createRadialGradient(-200, -150, 0, -200, -150, 1500);
      h.addColorStop(0, `rgba(255,234,196,${0.26 * soleil})`);
      h.addColorStop(0.45, `rgba(255,234,196,${0.06 * soleil})`);
      h.addColorStop(1, 'rgba(255,234,196,0)');
      c.fillStyle = h;
      c.fillRect(-300, -300, 2600, 1700);
    });

    g.img('premier', { tf: { rot: vent * 0.006 * Math.sin(0.6 * T + 0.5), ox: 2260, oy: -260 } });

    // Grandes feuilles floues au premier plan
    g.fx(1.45, (c) => {
      for (const d of FLOUES) {
        const y = mod(d.y + d.vy * T, 1500) - 260;
        const x = d.x + d.vx * T * vent + d.amp * Math.sin(d.f * T + d.ph);
        const tour = Math.cos(d.tour * T + d.ph);
        c.save();
        c.translate(x, y);
        c.rotate(d.spin * T + 0.4 * Math.sin(d.f * T + d.ph));
        c.scale(d.s / 64, (d.s / 64) * Math.max(0.15, Math.abs(tour)));
        c.globalAlpha = 0.85;
        c.drawImage(S.floues[d.c], -48, -48, 96, 96);
        c.restore();
      }
    });

    // Finition : densité des valeurs, comme une pellicule
    g.screen((c) => {
      c.globalCompositeOperation = 'soft-light';
      c.globalAlpha = 0.34;
      c.drawImage(c.canvas, 0, 0);
    });
  },

  shots: {
    // Lent travelling avant vers la fenêtre du couple, qui finit cadrée au centre
    ouverture: {
      dur: 6.5,
      cam: (t, portrait) => {
        const k = clamp(t / 6.5), e = 0.3 * k + 0.7 * k * k * (3 - 2 * k);
        return portrait
          ? { x: WC[0], y: lerp(505, WC[1], e), z: lerp(1, 1.25, e) }
          : { x: lerp(930, WC[0], e), y: lerp(505, WC[1], e), z: lerp(1, 1.25, e) };
      },
      p: (t) => ({ vent: 1, soleil: 1, reflet: clamp(t / 6.5) }),
    },
  },
};
