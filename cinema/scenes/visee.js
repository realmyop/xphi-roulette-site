/* ==========================================================================
   La visée — par-dessus l'épaule, et sa version en vue subjective.
   Plan de fond net : le berceau au deuxième plan, le bébé endormi, la tache
   de soleil au mur. Premier plan flou à droite : la nuque, l'épaule, le bras
   qui monte avec le revolver. En vue subjective : deux mains entrent par le
   bas du cadre. C'est aussi l'image figée du choix : forte, lisible, calme.

   Paramètres : arm (0 bras baissé → 1 en visée), pov (vue subjective),
   sway (amplitude du tremblement des mains, 0 → 1).
   ========================================================================== */
import { P, lin, rad, rng } from '../kit.js';
import { TAU, clamp, lerp, ease, seg } from '../../film/engine.js';

/* --------------------------------------------------------------------------
   Perspective : la chambre est construite en centimètres, puis projetée.
   Caméra au-dessus de l'épaule (2,15 m), axe vers le mur du fond ; les
   verticales restent verticales (décentrement, comme un objectif à bascule).
   -------------------------------------------------------------------------- */
const F = 1200, CX = 1010, CY = -40, CH = 215;
const pr = (X, Y, Z) => [CX + (F * X) / Z, CY + (F * (CH - Y)) / Z];

// Berceau : repère local (u le long, vers les pieds ; v en profondeur, vers le mur)
const ROT = (14 * Math.PI) / 180, CRIB = [-80, 275];
const cs = Math.cos(ROT), sn = Math.sin(ROT);
const wz = (u, v) => CRIB[1] - u * sn + v * cs;
const cw = (u, Y, v) => pr(CRIB[0] + u * cs + v * sn, Y, wz(u, v));
const kz = (u, v) => F / wz(u, v); // pixels par centimètre à cet endroit

const L2 = 62, D2 = 32;                 // demi-longueur, demi-profondeur
const RAIL = 83, RAIL_H = 5.5, RAIL_T = 3.8;
const LOW = 27, LOW_H = 5;
const MAT = 64, MAT_B = 50;             // dessus et dessous du matelas
const POST = 5.8, POST_TOP = 90, BALL = 4.3, BAR = 2.6;

// Mur du fond, murs latéraux
const WZ = 330, XL = -280, XR = 175, CEIL = 255;

// Point d'attache du mobile (u, Y, v), au-dessus du milieu du berceau
const MOB = [-4, 150, 2];

/* -------------------------------------------------------------------------- */
const f1 = (v) => +v.toFixed(1);
const pt = (p) => `${f1(p[0])},${f1(p[1])}`;
const poly = (ps, attrs = '') => `<polygon points="${ps.map(pt).join(' ')}" ${attrs}/>`;

// Polygone aux coins arrondis (r en pixels)
function roundPath(ps, r) {
  let d = '';
  for (let i = 0; i < ps.length; i++) {
    const a = ps[(i + ps.length - 1) % ps.length], b = ps[i], c = ps[(i + 1) % ps.length];
    const da = Math.hypot(a[0] - b[0], a[1] - b[1]), dc = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const ra = Math.min(r, da / 2) / da, rc = Math.min(r, dc / 2) / dc;
    const p1 = [b[0] + (a[0] - b[0]) * ra, b[1] + (a[1] - b[1]) * ra];
    const p2 = [b[0] + (c[0] - b[0]) * rc, b[1] + (c[1] - b[1]) * rc];
    d += `${i ? 'L' : 'M'}${pt(p1)} Q${pt(b)} ${pt(p2)} `;
  }
  return d + 'Z';
}

// Dégradés du bois (chaque calque est un SVG à part : on les répète)
// Lumière de droite : le bois s'éclaire vers le pied du berceau
const WOOD_DEFS =
  lin('visee-bois-v', [[0, '#7a5232'], [0.35, P.wood], [0.75, P.woodLight], [1, '#f6d39c']], 0, 0, 1, 0) +
  lin('visee-bois-mi', [[0, '#6e4a30'], [0.4, '#a87a4c'], [0.8, '#d4a56c'], [1, '#e2b77d']], 0, 0, 1, 0) +
  lin('visee-bois-ombre', [[0, '#5a3c27'], [0.5, '#86603d'], [1, '#a77d52']], 0, 0, 1, 0) +
  rad('visee-boule', [[0, '#fbe0ad'], [0.4, P.wood], [1, '#6e4a30']], 0.68, 0.3, 0.75) +
  `<linearGradient id="visee-rail" gradientUnits="userSpaceOnUse" x1="300" y1="0" x2="1000" y2="0">` +
  `<stop offset="0" stop-color="#8a603c"/><stop offset=".55" stop-color="${P.wood}"/><stop offset="1" stop-color="#e9bb80"/></linearGradient>` +
  `<linearGradient id="visee-rail-haut" gradientUnits="userSpaceOnUse" x1="300" y1="0" x2="1000" y2="0">` +
  `<stop offset="0" stop-color="#b48a5e"/><stop offset=".6" stop-color="${P.woodLight}"/><stop offset="1" stop-color="#ffe0a8"/></linearGradient>` +
  `<filter id="visee-peint" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="warp"/>` +
  `<feDisplacementMap in="SourceGraphic" in2="warp" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="shape"/>` +
  `<feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="3" seed="11" result="tex"/>` +
  `<feColorMatrix in="tex" type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1" result="gray"/>` +
  `<feComposite in="shape" in2="gray" operator="arithmetic" k1="0.2" k2="0.9" k3="0" k4="0" result="mod"/>` +
  `<feComposite in="mod" in2="shape" operator="in"/></filter>`;
const woodFill = (u, shade) => `url(#${shade || u < -30 ? 'visee-bois-ombre' : u < 18 ? 'visee-bois-mi' : 'visee-bois-v'})`;

/* --------------------------------------------------------------------------
   Le berceau, pièce par pièce
   -------------------------------------------------------------------------- */
// Montant : bois tourné, collerette, boule
function post(u, v, shade = 0) {
  const k = kz(u, v), [x, yt] = cw(u, POST_TOP, v), [, yb] = cw(u, 0, v);
  const w = POST * k;
  const [, yc] = cw(u, POST_TOP + 1.8, v);
  const [, yo] = cw(u, POST_TOP + 1.8 + BALL * 0.92, v);
  const fill = woodFill(u, shade);
  return (
    `<rect x="${f1(x - w / 2)}" y="${f1(yt)}" width="${f1(w)}" height="${f1(yb - yt)}" rx="${f1(w * 0.28)}" fill="${fill}"/>` +
    `<rect x="${f1(x - w * 0.36)}" y="${f1(yc)}" width="${f1(w * 0.72)}" height="${f1(yt - yc + 2)}" rx="${f1(w * 0.2)}" fill="${fill}"/>` +
    `<circle cx="${f1(x)}" cy="${f1(yo)}" r="${f1(BALL * k)}" fill="url(#visee-boule)"/>` +
    `<path d="M${f1(x + w * 0.3)},${f1(yt + 4)} L${f1(x + w * 0.3)},${f1(yb - 6)}" stroke="${P.woodLight}" stroke-width="${f1(w * 0.14)}" opacity=".55"/>`
  );
}

// Barreau vertical arrondi
function bar(u, v, shade = 0) {
  const k = kz(u, v), [x, y1] = cw(u, RAIL - RAIL_H, v), [, y2] = cw(u, LOW, v);
  const w = BAR * k;
  return `<rect x="${f1(x - w / 2)}" y="${f1(y1 - 1)}" width="${f1(w)}" height="${f1(y2 - y1 + 2)}" rx="${f1(w / 2)}" fill="${woodFill(u, shade)}"/>`;
}

// Traverse le long de u (face avant + dessus)
function railU(u1, u2, v0, yb, yt, face, top, edge = true) {
  const t = RAIL_T / 2;
  const fr = [cw(u1, yt, v0 - t), cw(u2, yt, v0 - t), cw(u2, yb, v0 - t), cw(u1, yb, v0 - t)];
  const tp = [cw(u1, yt, v0 - t), cw(u2, yt, v0 - t), cw(u2, yt, v0 + t), cw(u1, yt, v0 + t)];
  return (
    poly(fr, `fill="${face}"`) + poly(tp, `fill="${top}"`) +
    (edge ? `<path d="M${pt(fr[0])} L${pt(fr[1])}" stroke="${P.woodLight}" stroke-width="2" opacity=".8"/>` : '')
  );
}

// Traverse le long de v (face côté +u + dessus)
function railV(v1, v2, u0, yb, yt, face, top) {
  const t = RAIL_T / 2;
  const sd = [cw(u0 + t, yt, v1), cw(u0 + t, yt, v2), cw(u0 + t, yb, v2), cw(u0 + t, yb, v1)];
  const tp = [cw(u0 - t, yt, v1), cw(u0 - t, yt, v2), cw(u0 + t, yt, v2), cw(u0 + t, yt, v1)];
  return poly(sd, `fill="${face}"`) + poly(tp, `fill="${top}"`) +
    `<path d="M${pt(sd[0])} L${pt(sd[1])}" stroke="${P.woodLight}" stroke-width="1.6" opacity=".7"/>`;
}

const barsU = (v, shade) => Array.from({ length: 14 }, (_, i) => bar(-L2 + (2 * L2 * (i + 1)) / 15, v, shade)).join('');
const barsV = (u, shade) => Array.from({ length: 6 }, (_, j) => bar(u, -D2 + (2 * D2 * (j + 1)) / 7, shade)).join('');

/* --------------------------------------------------------------------------
   Calque « fond » : murs, fenêtre, plancher, étagère, tache de soleil,
   arrière du berceau, matelas.
   -------------------------------------------------------------------------- */
const W = (X, Y) => pr(X, Y, WZ);
const RW = (Y, Z) => pr(XR, Y, Z);

// Tache de soleil au mur : la fenêtre (Z 200 → 282) projetée selon le soleil
const SUN = [-1, -0.5, 0.5];
const onWall = (Y, Z) => { const t = (WZ - Z) / SUN[2]; return [XR + SUN[0] * t, Y + SUN[1] * t]; };
const patchPt = (Y, Z) => { const [X, Yw] = onWall(Y, Z); return W(X, Yw); };
const PATCH = { z1: 200, z2: 282, y1: 95, y2: 215 };

function fond() {
  const r = rng(11);
  let s = '';
  s += `<defs>
    ${lin('visee-mur', [[0, '#76838a'], [0.45, '#9eaaa9'], [0.9, '#a9b1aa'], [1, '#9aa39e']])}
    ${lin('visee-mur-g', [[0, '#2a3342', 0.5], [0.45, '#2a3342', 0.14], [1, '#2a3342', 0]], 0, 0, 1, 0)}
    ${lin('visee-mur-d', [[0, '#5d6870'], [0.6, '#4c5660'], [1, '#3e4751']], 0, 0, 1, 0)}
    ${lin('visee-tache-bord', [[0, '#ffe0aa', 0.92], [0.78, '#fbd89f', 0.88], [1, '#f6cf92', 0]], 0, 0, 1, 0)}
    ${lin('visee-sol', [[0, P.floorBack], [0.5, P.floor], [1, '#7c5134']])}
    ${WOOD_DEFS}
    ${lin('visee-drap', [[0, '#e9dcc6'], [0.6, P.sheet], [1, '#fbf0dc']], 0, 0, 1, 0)}
    ${lin('visee-drap-ombre', [[0, '#a99d8c'], [0.6, '#c3b59f'], [1, '#d6c6ab']], 0, 0, 1, 0)}
    ${lin('visee-vitre', [[0, '#fff6e2'], [0.5, '#fde9c4'], [1, '#f5dcae']], 0, 0, 0, 1)}
    ${lin('visee-lin', [[0, '#f8ead0'], [0.5, P.linen], [1, '#e7d3ad']], 0, 0, 1, 0)}
    <filter id="visee-doux" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.5"/></filter>
    <filter id="visee-flou" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="visee-flou2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="30"/></filter>
  </defs>`;

  // Mur du fond (bleu-gris poudré), ombré à gauche, loin de la fenêtre
  const bwTL = W(XL, CEIL + 60), bwTR = W(XR, CEIL + 60), bwBR = W(XR, 0), bwBL = W(XL, 0);
  s += poly([[bwTL[0] - 400, bwTL[1]], bwTR, bwBR, [bwBL[0] - 400, bwBL[1]]], 'fill="url(#visee-mur)"');
  s += `<rect x="-240" y="-160" width="${f1(bwTR[0] + 240)}" height="${f1(bwBR[1] + 160)}" fill="url(#visee-mur-g)"/>`;
  // Taches de peinture irrégulières (le mur vit un peu)
  for (let i = 0; i < 26; i++) {
    const x = -200 + r() * 1840, y = -140 + r() * 860;
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(60 + r() * 140)}" ry="${f1(30 + r() * 70)}" fill="${r() < 0.5 ? '#8e9a9c' : '#b6beb6'}" opacity="${f1(0.05 + r() * 0.07)}"/>`;
  }
  // Coin du mur de droite : ombre portée douce
  s += `<rect x="${f1(bwTR[0] - 120)}" y="-160" width="120" height="${f1(bwBR[1] + 160)}" fill="#4d5866" opacity=".22" filter="url(#visee-flou)"/>`;

  // Mur de droite (celui de la fenêtre) : en contre-jour, plus sombre
  const rwA = RW(CEIL + 80, WZ), rwB = RW(CEIL + 80, 120), rwC = RW(0, 120), rwD = RW(0, WZ);
  s += poly([rwA, rwB, rwC, rwD], 'fill="url(#visee-mur-d)"');

  // Fenêtre : vitres très claires, menuiserie crème, rideaux de lin mi-tirés
  const wz1 = 140, wz2 = 292, wy1 = 92, wy2 = 220;
  const win = [RW(wy2, wz2), RW(wy2, wz1), RW(wy1, wz1), RW(wy1, wz2)];
  // embrasure (épaisseur du mur) puis vitre
  s += poly([RW(wy2 + 6, wz2 + 6), RW(wy2 + 6, wz1 - 6), RW(wy1 - 6, wz1 - 6), RW(wy1 - 6, wz2 + 6)], `fill="${P.base}"`);
  s += poly(win, 'fill="url(#visee-vitre)"');
  // dehors : un feuillage très clair et flou, un ciel blanc chaud
  s += `<g filter="url(#visee-flou)" opacity=".55">
    <ellipse cx="${f1(RW(170, 240)[0])}" cy="${f1(RW(170, 240)[1])}" rx="90" ry="140" fill="#cbd3a8"/>
    <ellipse cx="${f1(RW(120, 200)[0])}" cy="${f1(RW(120, 200)[1])}" rx="120" ry="120" fill="#d7d9ae"/>
  </g>`;
  // croisillons
  const mz = 231, my = 162;
  s += poly([RW(wy2, mz - 2.5), RW(wy2, mz + 2.5), RW(wy1, mz + 2.5), RW(wy1, mz - 2.5)], `fill="${P.base}"`);
  s += poly([RW(my + 2.5, wz2), RW(my + 2.5, wz1), RW(my - 2.5, wz1), RW(my - 2.5, wz2)], `fill="${P.base}"`);
  // cadre
  for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0]]) {
    s += `<path d="M${pt(win[a])} L${pt(win[b])}" stroke="#efe7d8" stroke-width="10" fill="none"/>`;
  }
  // appui de fenêtre
  s += poly([RW(wy1, wz2 + 8), RW(wy1, wz1 - 8), RW(wy1 - 5, wz1 - 8), RW(wy1 - 5, wz2 + 8)], 'fill="#f2ead9"');
  // rideau du fond (côté mur du fond), lumineux en contre-jour, plis verticaux
  const cz1 = 296, cz2 = 262;
  const cTop = 232, cBot = 70;
  let cur = `M${pt(RW(cTop, cz1))}`;
  for (let i = 0; i <= 8; i++) {
    const z = lerp(cz1, cz2, i / 8), [x, y] = RW(cTop, z);
    cur += ` L${f1(x)},${f1(y + (i % 2 ? 6 : 0))}`;
  }
  const [bx2, by2] = RW(cBot, cz2 - 4), [bx1, by1] = RW(cBot, cz1);
  cur += ` C${f1(bx2 + 6)},${f1(by2 - 300)} ${f1(bx2 - 10)},${f1(by2 - 120)} ${f1(bx2)},${f1(by2)} L${f1(bx1)},${f1(by1)} Z`;
  s += `<path d="${cur}" fill="url(#visee-lin)"/>`;
  for (let i = 1; i < 7; i++) {
    const z = lerp(cz1, cz2, i / 7), [x1, y1] = RW(cTop, z), [x2, y2] = RW(cBot + 4, z);
    s += `<path d="M${f1(x1)},${f1(y1 + 10)} C${f1(x1 + 8)},${f1(lerp(y1, y2, 0.35))} ${f1(x2 - 8)},${f1(lerp(y1, y2, 0.7))} ${f1(x2)},${f1(y2)}" stroke="${i % 2 ? '#d9c39b' : '#fff3dc'}" stroke-width="${i % 2 ? 6 : 4}" fill="none" opacity=".75"/>`;
  }
  // tringle
  s += `<path d="M${pt(RW(238, WZ - 2))} L${pt(RW(238, 120))}" stroke="#d8d0c0" stroke-width="5"/>`;

  // Plancher : lames miel qui fuient vers le mur du fond
  s += poly([W(XL - 200, 0), W(XR, 0), pr(XR, 0, 140), pr(XL - 200, 0, 140)], 'fill="url(#visee-sol)"');
  for (let X = XL - 196; X < XR; X += 14) {
    const a = W(X, 0), b = W(X + 14, 0), c = pr(X + 14, 0, 150), d = pr(X, 0, 150);
    const tone = r();
    s += poly([a, b, c, d], `fill="${tone < 0.33 ? '#b47f53' : tone < 0.66 ? '#9c6a43' : '#a8774c'}" opacity=".55"`);
    s += `<path d="M${pt(a)} L${pt(d)}" stroke="#5e3c24" stroke-width="1.6" opacity=".55"/>`;
    // joints de bout de lame
    const zj = 170 + r() * 150;
    const j1 = pr(X, 0, zj), j2 = pr(X + 14, 0, zj);
    s += `<path d="M${pt(j1)} L${pt(j2)}" stroke="#5e3c24" stroke-width="1.4" opacity=".45"/>`;
  }
  // l'ombre du fond de la pièce sur le sol, la lumière chaude au pied du mur
  s += poly([W(XL - 200, 0), W(XR, 0), pr(XR, 0, 250), pr(XL - 200, 0, 250)], 'fill="#3a3340" opacity=".18" filter="url(#visee-flou)"');
  // Plinthes
  s += poly([W(XL - 200, 9), W(XR, 9), W(XR, 0), W(XL - 200, 0)], `fill="${P.base}"`);
  s += `<path d="M${pt(W(XL - 200, 9))} L${pt(W(XR, 9))}" stroke="#fbf6ec" stroke-width="2"/>`;
  s += poly([RW(9, WZ), RW(9, 120), RW(0, 120), RW(0, WZ)], 'fill="#cfc8bb"');

  // Tapis rond tissé crème, à moitié sous le berceau
  const rug = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * TAU;
    rug.push(pr(-70 + 80 * Math.cos(a), 0.4, 220 + 62 * Math.sin(a)));
  }
  s += `<path d="M${rug.map(pt).join('L')}Z" fill="#d8c4a0"/>`;
  for (let k = 1; k < 5; k++) {
    const ring = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * TAU;
      ring.push(pr(-70 + (80 - k * 15) * Math.cos(a), 0.5, 220 + (62 - k * 11.5) * Math.sin(a)));
    }
    s += `<path d="M${ring.map(pt).join('L')}Z" fill="none" stroke="#a8936f" stroke-width="2.4" opacity=".55"/>`;
  }
  // le tapis est dans l'ombre du berceau
  s += `<path d="M${rug.map(pt).join('L')}Z" fill="#3a3340" opacity=".28"/>`;

  // Étagère : quelques livres aux couleurs sourdes, le petit cadre (soleil sur des collines)
  const sy = 126, sx1 = -262, sx2 = -168;
  s += poly([pr(sx1, sy, WZ), pr(sx2, sy, WZ), pr(sx2, sy, WZ - 18), pr(sx1, sy, WZ - 18)], `fill="${P.base}"`);
  s += poly([pr(sx1, sy, WZ - 18), pr(sx2, sy, WZ - 18), pr(sx2, sy - 2.5, WZ - 18), pr(sx1, sy - 2.5, WZ - 18)], 'fill="#c9c0b0"');
  s += poly([pr(sx1, sy - 2.5, WZ - 18), pr(sx2, sy - 2.5, WZ - 18), pr(sx2 - 6, sy - 26, WZ), pr(sx1 + 6, sy - 26, WZ)], 'fill="#3c4552" opacity=".18" filter="url(#visee-doux)"');
  const books = [['#8a9a7b', 3.4, 22], ['#7d8fa3', 2.6, 20], ['#c49a5a', 3.8, 24], ['#b9785e', 2.8, 19], ['#8a6a78', 3.2, 23], ['#d6c7aa', 2.4, 18]];
  let bxp = sx1 + 4;
  for (const [c, w, h] of books) {
    const z = WZ - 10;
    const a = pr(bxp, sy + h, z - 6), b = pr(bxp + w, sy, z - 6);
    s += `<rect x="${f1(a[0])}" y="${f1(a[1])}" width="${f1(b[0] - a[0])}" height="${f1(b[1] - a[1])}" fill="${c}"/>`;
    s += `<rect x="${f1(b[0] - (b[0] - a[0]) * 0.28)}" y="${f1(a[1])}" width="${f1((b[0] - a[0]) * 0.28)}" height="${f1(b[1] - a[1])}" fill="#fff" opacity=".12"/>`;
    s += `<rect x="${f1(a[0])}" y="${f1(a[1] + (b[1] - a[1]) * 0.18)}" width="${f1(b[0] - a[0])}" height="2" fill="#f3ead8" opacity=".35"/>`;
    bxp += w + 0.4;
  }
  // un livre couché
  {
    const a = pr(bxp + 1, sy + 3.2, WZ - 16), b = pr(bxp + 21, sy, WZ - 16);
    s += `<rect x="${f1(a[0])}" y="${f1(a[1])}" width="${f1(b[0] - a[0])}" height="${f1(b[1] - a[1])}" fill="#9a8d74"/>`;
  }
  // petit cadre posé contre le mur
  {
    const a = pr(-196, sy + 24, WZ - 5), b = pr(-172, sy + 3.2, WZ - 5);
    const w = b[0] - a[0], h = b[1] - a[1];
    s += `<rect x="${f1(a[0] - 5)}" y="${f1(a[1] + 3)}" width="${f1(w)}" height="${f1(h)}" fill="#3c4552" opacity=".25" filter="url(#visee-doux)"/>`;
    s += `<rect x="${f1(a[0])}" y="${f1(a[1])}" width="${f1(w)}" height="${f1(h)}" fill="${P.woodLight}"/>`;
    s += `<rect x="${f1(a[0] + 5)}" y="${f1(a[1] + 5)}" width="${f1(w - 10)}" height="${f1(h - 10)}" fill="#efe4cc"/>`;
    const ix = a[0] + 10, iy = a[1] + 10, iw = w - 20, ih = h - 20;
    s += `<rect x="${f1(ix)}" y="${f1(iy)}" width="${f1(iw)}" height="${f1(ih)}" fill="#cfdcdc"/>`;
    s += `<circle cx="${f1(ix + iw * 0.62)}" cy="${f1(iy + ih * 0.42)}" r="${f1(iw * 0.17)}" fill="#e9a87c"/>`;
    s += `<path d="M${f1(ix)},${f1(iy + ih * 0.7)} Q${f1(ix + iw * 0.3)},${f1(iy + ih * 0.45)} ${f1(ix + iw * 0.6)},${f1(iy + ih * 0.68)} T${f1(ix + iw)},${f1(iy + ih * 0.6)} L${f1(ix + iw)},${f1(iy + ih)} L${f1(ix)},${f1(iy + ih)} Z" fill="#9fae86"/>`;
    s += `<path d="M${f1(ix)},${f1(iy + ih * 0.86)} Q${f1(ix + iw * 0.5)},${f1(iy + ih * 0.66)} ${f1(ix + iw)},${f1(iy + ih * 0.84)} L${f1(ix + iw)},${f1(iy + ih)} L${f1(ix)},${f1(iy + ih)} Z" fill="#7f9170"/>`;
  }

  // Tache de soleil : la fenêtre projetée sur le mur, croisillons en ombre,
  // bord droit adouci par le rideau de lin
  {
    const { z1, z2, y1, y2 } = PATCH;
    const q = [patchPt(y2, z2), patchPt(y2, z1), patchPt(y1, z1), patchPt(y1, z2)];
    // coupe au ras du sol
    const floorY = W(0, 0)[1];
    const clip = q.map(([x, y]) => [x, Math.min(y, floorY)]);
    s += `<g filter="url(#visee-doux)">`;
    s += `<path d="${roundPath(clip, 10)}" fill="url(#visee-tache-bord)"/>`;
    // croisillon vertical (z = 231) et horizontal (y = 162)
    const m1 = patchPt(y2, mz), m2 = patchPt(y1, mz);
    s += `<path d="M${pt(m1)} L${f1(m2[0])},${f1(Math.min(m2[1], floorY))}" stroke="#a7a99c" stroke-width="12" opacity=".75"/>`;
    const h1 = patchPt(my, z2), h2 = patchPt(my, z1);
    s += `<path d="M${pt(h1)} L${pt(h2)}" stroke="#a7a99c" stroke-width="11" opacity=".75"/>`;
    s += `</g>`;
    // halo chaud autour de la tache (la lumière rebondit)
    s += `<path d="${roundPath(clip, 10)}" fill="#ffd79a" opacity=".22" filter="url(#visee-flou2)"/>`;
    // reflet chaud sur la plinthe et le sol, au pied de la tache
    s += `<ellipse cx="${f1((q[2][0] + q[3][0]) / 2 + 60)}" cy="${f1(floorY + 20)}" rx="300" ry="40" fill="#ffcf8c" opacity=".2" filter="url(#visee-flou)"/>`;
  }

  // Ombre du berceau sur le sol (douce, vers la gauche : la lumière vient de droite)
  const foot = [cw(-L2 - 6, 0, -D2 - 6), cw(L2 + 6, 0, -D2 - 6), cw(L2 + 6, 0, D2 + 6), cw(-L2 - 6, 0, D2 + 6)];
  s += `<path d="${roundPath(foot, 30)}" fill="#2e2a33" opacity=".42" filter="url(#visee-flou)"/>`;
  const castL = [cw(-L2 - 70, 0, -D2), cw(L2 - 40, 0, -D2), cw(L2 - 40, 0, D2 + 10), cw(-L2 - 70, 0, D2 + 10)];
  s += `<path d="${roundPath(castL, 40)}" fill="#2e2a33" opacity=".2" filter="url(#visee-flou2)"/>`;
  // Ombre douce du berceau sur le mur du fond
  s += `<path d="M${pt(W(-178, 0))} L${pt(W(-178, 70))} Q${pt(W(-120, 92))} ${pt(W(-40, 78))} L${pt(W(-30, 0))} Z" fill="#3c4552" opacity=".2" filter="url(#visee-flou2)"/>`;

  // Arrière du berceau : montant arrière gauche, côté du fond, tête de lit
  s += post(-L2, D2, 1);
  s += railU(-L2, L2, D2, LOW - LOW_H, LOW, '#8a5f3b', '#b4875a', false);
  s += barsU(D2, 1);
  s += railU(-L2, L2, D2, RAIL - RAIL_H, RAIL, '#9b6c44', P.woodLight);
  s += railV(-D2, D2, -L2, LOW - LOW_H, LOW, '#8a5f3b', '#b4875a');
  s += barsV(-L2, 1);
  s += railV(-D2, D2, -L2, RAIL - RAIL_H, RAIL, '#a87a4e', P.woodLight);

  // Bras du mobile : fixé au montant arrière droit, il monte et s'arrondit
  // au-dessus du berceau, en crosse douce
  {
    const k = kz(L2, D2);
    const a = cw(L2, POST_TOP + 3, D2), h = cw(MOB[0], MOB[1] + 4, MOB[2]);
    const up = cw(L2, 138, D2);
    const d = `M${pt(a)} L${pt(up)} C${f1(up[0])},${f1(up[1] - 70)} ${f1(h[0] + 150)},${f1(h[1] - 52)} ${f1(h[0] + 40)},${f1(h[1] - 16)} Q${f1(h[0] + 12)},${f1(h[1] - 8)} ${pt(h)}`;
    s += `<path d="${d}" stroke="${P.woodDark}" stroke-width="${f1(1.9 * k)}" fill="none" stroke-linecap="round"/>`;
    s += `<path d="${d}" stroke="${P.woodLight}" stroke-width="${f1(0.6 * k)}" fill="none" stroke-linecap="round" opacity=".75" transform="translate(1.5 -1.5)"/>`;
    s += `<circle cx="${f1(h[0])}" cy="${f1(h[1])}" r="${f1(1.4 * k)}" fill="${P.wood}"/>`;
    // pince sur le montant
    s += `<rect x="${f1(a[0] - 2.4 * k)}" y="${f1(a[1] - 4)}" width="${f1(4.8 * k)}" height="${f1(6 * k)}" rx="4" fill="${P.woodDark}"/>`;
  }

  // Matelas et drap-housse crème
  {
    const top = [cw(-L2 + 2, MAT, -D2 + 2), cw(L2 - 2, MAT, -D2 + 2), cw(L2 - 2, MAT, D2 - 2), cw(-L2 + 2, MAT, D2 - 2)];
    const front = [cw(-L2 + 2, MAT, -D2 + 2), cw(L2 - 2, MAT, -D2 + 2), cw(L2 - 2, MAT_B, -D2 + 2), cw(-L2 + 2, MAT_B, -D2 + 2)];
    // sommier sombre sous le matelas
    s += poly([cw(-L2, MAT_B, -D2), cw(L2, MAT_B, -D2), cw(L2, MAT_B - 4, -D2), cw(-L2, MAT_B - 4, -D2)], 'fill="#5a3d27"');
    s += `<path d="${roundPath(front, 8)}" fill="url(#visee-drap-ombre)"/>`;
    s += `<path d="${roundPath(top, 14)}" fill="url(#visee-drap)"/>`;
    // plis du drap aux coins, ombre de la tête de lit
    s += `<path d="M${pt(cw(-L2 + 4, MAT, D2 - 4))} Q${pt(cw(-L2 + 14, MAT, D2 - 14))} ${pt(cw(-L2 + 26, MAT, D2 - 10))}" stroke="#d6c4a8" stroke-width="3" fill="none"/>`;
    s += `<path d="M${pt(cw(L2 - 4, MAT, -D2 + 6))} Q${pt(cw(L2 - 16, MAT, -D2 + 12))} ${pt(cw(L2 - 30, MAT, -D2 + 8))}" stroke="#d6c4a8" stroke-width="3" fill="none"/>`;
    s += poly([cw(-L2 + 2, MAT, -D2 + 2), cw(-L2 + 16, MAT, -D2 + 2), cw(-L2 + 16, MAT, D2 - 2), cw(-L2 + 2, MAT, D2 - 2)], 'fill="#8e8a8c" opacity=".22" filter="url(#visee-doux)"');
    // ombre des barreaux de la tête de lit sur le drap, côté fond
    s += poly([cw(-L2 + 2, MAT, D2 - 2), cw(L2 - 2, MAT, D2 - 2), cw(L2 - 2, MAT, D2 - 9), cw(-L2 + 2, MAT, D2 - 9)], 'fill="#9d958e" opacity=".3" filter="url(#visee-doux)"');
  }
  return s;
}

/* --------------------------------------------------------------------------
   Calque « avant » : le côté du berceau qui fait face, le pied de lit
   -------------------------------------------------------------------------- */
function avant() {
  let s = '';
  // montant arrière droit (le mobile y est fixé)
  s += post(L2, D2, 0);
  // pied de lit (face extérieure, côté lumière)
  s += railV(-D2, D2, L2, LOW - LOW_H, LOW, P.wood, P.woodLight);
  s += barsV(L2, 0);
  s += railV(-D2, D2, L2, RAIL - RAIL_H, RAIL, P.wood, '#f3cf95');
  // côté avant
  s += railU(-L2, L2, -D2, LOW - LOW_H, LOW, 'url(#visee-rail)', 'url(#visee-rail-haut)');
  s += barsU(-D2, 0);
  s += railU(-L2, L2, -D2, RAIL - RAIL_H, RAIL, 'url(#visee-rail)', 'url(#visee-rail-haut)');
  // montants avant
  s += post(L2, -D2, 0);
  s += post(-L2, -D2, 0);
  // le soleil accroche le pied de lit : arêtes chaudes
  {
    const t = RAIL_T / 2;
    const e1 = cw(L2 + t, RAIL, -D2), e2 = cw(L2 + t, RAIL, D2);
    s += `<path d="M${pt(e1)} L${pt(e2)}" stroke="#ffe2a8" stroke-width="3" opacity=".9"/>`;
    const f1_ = cw(L2 - 30, RAIL, -D2 - t), f2_ = cw(L2, RAIL, -D2 - t);
    s += `<path d="M${pt(f1_)} L${pt(f2_)}" stroke="#ffe2a8" stroke-width="2.6" opacity=".75"/>`;
    for (const [u, v] of [[L2, -D2], [L2, D2]]) {
      const k = kz(u, v), [x, y] = cw(u, POST_TOP + 1.8 + BALL * 0.92, v);
      s += `<circle cx="${f1(x + BALL * k * 0.35)}" cy="${f1(y - BALL * k * 0.35)}" r="${f1(BALL * k * 0.38)}" fill="#fff0cc" opacity=".8"/>`;
    }
  }
  return `<defs>${WOOD_DEFS}</defs><g filter="url(#visee-peint)">${s}</g>`;
}

/* --------------------------------------------------------------------------
   Calque « bebe » : couché sur le dos, tête vers la gauche, bras levés,
   un poing près de la joue ; gigoteuse rose poudré semée d'étoiles crème.
   Dessiné en centimètres dans le repère du corps (x vers les pieds,
   y vers le bas de l'image), puis posé sur le matelas.
   -------------------------------------------------------------------------- */
const HEAD = cw(-45, MAT + 7.5, 3);
const FEET = cw(25, MAT + 7.5, 3);
const BODY_ANG = (Math.atan2(FEET[1] - HEAD[1], FEET[0] - HEAD[0]) * 180) / Math.PI;
const BODY_S = Math.hypot(FEET[0] - HEAD[0], FEET[1] - HEAD[1]) / 70;

const star = (x, y, r, rot) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = rot + (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${(x + rr * Math.cos(a)).toFixed(2)},${(y + rr * Math.sin(a) * 0.8).toFixed(2)}`;
  }
  return d + 'Z';
};

function bebe() {
  const r = rng(5);
  const skinLit = '#f7d3b6';
  const cream = '#efe3cf', creamShade = '#d8c7ae';
  let s = `<defs>
    ${lin('visee-gigo', [[0, P.roseLight], [0.45, P.rose], [1, P.roseShade]], 0, 0, 0, 1)}
    ${rad('visee-gigo-l', [[0, '#ffe3c8', 0.75], [1, '#ffe3c8', 0]], 0.7, 0.3, 0.6)}
    ${rad('visee-tete', [[0, skinLit], [0.55, P.skin], [1, P.skinShade]], 0.62, 0.55, 0.62)}
    ${rad('visee-joue', [[0, P.cheek, 0.75], [1, P.cheek, 0]])}
    ${lin('visee-cheveux', [[0, '#8a5d3e'], [1, P.hair]], 0, 0, 1, 0)}
    ${WOOD_DEFS}
    <filter id="visee-b-flou" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.1"/></filter>
    <filter id="visee-b-flou2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0.5"/></filter>
  </defs>`;
  s += `<g filter="url(#visee-peint)"><g transform="translate(${f1(HEAD[0])} ${f1(HEAD[1])}) rotate(${f1(BODY_ANG)}) scale(${BODY_S.toFixed(3)})">`;
  // ombre portée sur le drap (vers le fond et la gauche)
  s += `<ellipse cx="30" cy="2.5" rx="42" ry="8.5" fill="#6f6670" opacity=".38" filter="url(#visee-b-flou)"/>`;
  s += `<ellipse cx="-2" cy="1" rx="11" ry="9" fill="#6f6670" opacity=".3" filter="url(#visee-b-flou)"/>`;
  // bras du fond, levé derrière la tête
  s += `<path d="M13.6,-6.4 C14,-9.6 12.6,-11.4 10,-11.2 C8,-11 6,-10.4 4.4,-9.8" stroke="#cdbca2" stroke-width="3.2" stroke-linecap="round" fill="none"/>`;
  s += `<path d="M13.2,-8 C13.2,-10 12.2,-10.6 10.2,-10.4" stroke="${cream}" stroke-width="1" stroke-linecap="round" fill="none"/>`;
  s += `<ellipse cx="2.4" cy="-9.4" rx="2.4" ry="2.2" fill="${P.skinShade}"/><ellipse cx="2.8" cy="-9.8" rx="1.8" ry="1.6" fill="${P.skin}"/>`;
  s += `<path d="M1.2,-10.4 Q2.1,-9.4 1.6,-8.2 M2.4,-11.2 Q3.2,-10.4 2.9,-9.2" stroke="${P.skinDeep}" stroke-width=".24" fill="none"/>`;
  // gigoteuse
  const bag = 'M9,-4.6 C12,-7.4 18,-8.8 26,-9.4 C34,-10 44,-9.2 54,-7.6 C62,-6.3 68,-4.8 70.6,-1.8 C72.6,0.8 71.2,5 67.2,7 C60,9.5 48,9.8 36,9.8 C26,9.8 17,9.4 12.6,7.8 C9.6,6.6 8.2,4 8.4,1.2 Z';
  s += `<path d="${bag}" fill="url(#visee-gigo)"/>`;
  s += `<path d="${bag}" fill="url(#visee-gigo-l)"/>`;
  // le ventre qui bombe, la lumière sur le dessus
  s += `<ellipse cx="27" cy="-4.6" rx="12" ry="3.6" fill="${P.roseLight}" opacity=".55" filter="url(#visee-b-flou2)"/>`;
  s += `<path d="M14,-7.6 C22,-9.6 40,-10 56,-7.8 C62,-6.8 67,-5.6 69.6,-3.2" stroke="#ffd9c4" stroke-width=".9" fill="none" opacity=".8"/>`;
  // plis : les jambes dans le sac
  s += `<path d="M42,4.6 C50,2.6 58,3 64,5.2 M46,-1.6 C53,-2.8 60,-2.2 66.4,-0.4" stroke="${P.roseShade}" stroke-width="1.4" fill="none" opacity=".35" filter="url(#visee-b-flou2)"/>`;
  // étoiles crème
  for (let i = 0; i < 40 && s.split('visee-etoile').length < 20; i++) {
    const x = 13 + r() * 56, y = -8.4 + r() * 16.6;
    const ex = (x - 40) / 31, ey = (y - 0.4) / 9.6;
    if (ex * ex + ey * ey > 0.8) continue;
    const shade = y > 4 ? '#ead5c6' : '#fbf1e2';
    s += `<path class="visee-etoile" d="${star(x, y, 0.95 + r() * 0.35, r() * TAU)}" fill="${shade}" opacity=".92"/>`;
  }
  // col du body
  s += `<path d="M8,-4.8 C10.8,-2.6 11.2,2.6 8.4,5.2 L10.2,6 C13,2.8 12.8,-3 10,-5.6 Z" fill="${cream}"/>`;
  s += `<path d="M8.2,-4.4 C10.4,-2.4 10.6,2.4 8.4,4.8" stroke="${creamShade}" stroke-width=".5" fill="none"/>`;
  // tête
  s += `<ellipse cx="0" cy="0" rx="8.8" ry="7.7" fill="url(#visee-tete)"/>`;
  // cheveux fins châtain clair, sur le sommet du crâne
  s += `<path d="M-2.6,-7.5 C-6,-7.4 -8.9,-4.8 -9.1,-1 C-9.3,2.8 -7.4,6 -4.2,7.2 C-5.6,5 -6.4,2.4 -6.2,-0.2 C-6,-3.2 -4.8,-5.8 -2.6,-7.5 Z" fill="url(#visee-cheveux)" opacity=".82" filter="url(#visee-b-flou2)"/>`;
  s += `<path d="M-4.4,-6.8 C-5.8,-4.4 -6.6,-1.2 -6.4,1.8 M-7.2,-5 C-8,-2.6 -8.2,0.8 -7.4,3.4" stroke="#c99a6c" stroke-width=".28" fill="none" opacity=".55"/>`;
  s += `<path d="M-3.2,-7.4 c-0.3,-0.9 0.3,-1.3 0.9,-1.1 M-6.6,-6 c-0.6,-0.5 -0.4,-1.2 0.3,-1.3 M-8.9,-2.4 c-0.8,-0.1 -1,-0.8 -0.6,-1.3" stroke="${P.hair}" stroke-width=".26" fill="none" opacity=".8"/>`;
  // oreilles (en bord de silhouette)
  s += `<path d="M-2.2,-7.3 C-2,-9.2 0.6,-9.3 1.1,-7.6" fill="${P.skinShade}" stroke="${P.skinDeep}" stroke-width=".25"/>`;
  s += `<path d="M-2,7.1 C-1.8,9 0.8,9.1 1.2,7.4" fill="${P.skin}" stroke="${P.skinDeep}" stroke-width=".25"/>`;
  // joues
  s += `<circle cx="4.6" cy="-4.2" r="2.4" fill="url(#visee-joue)"/>`;
  s += `<circle cx="4.8" cy="4.6" r="3" fill="url(#visee-joue)"/>`;
  // paupières closes, cils
  const eye = (x, y) =>
    `<path d="M${x - 0.3},${y - 1.55} Q${x + 1.05},${y} ${x - 0.3},${y + 1.55}" stroke="#6b4a3a" stroke-width=".36" fill="none" stroke-linecap="round"/>` +
    `<path d="M${x + 0.35},${y - 0.9} l.55,-.25 M${x + 0.45},${y} l.65,0 M${x + 0.35},${y + 0.9} l.55,.25" stroke="#6b4a3a" stroke-width=".22" stroke-linecap="round"/>`;
  s += eye(1.4, -3.1) + eye(1.6, 3.2);
  s += `<path d="M-1.4,-4.6 Q-1.9,-3.1 -1.4,-1.6 M-1.2,1.8 Q-1.8,3.3 -1.2,4.8" stroke="#b08262" stroke-width=".3" fill="none" opacity=".45"/>`;
  // nez, bouche entrouverte
  s += `<path d="M3.9,-0.6 Q5.3,0.2 4.1,1.4" stroke="${P.skinDeep}" stroke-width=".38" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="6.7" cy="0.3" rx=".75" ry="1.15" fill="#b8655d"/>`;
  s += `<ellipse cx="6.9" cy="0.3" rx=".38" ry=".7" fill="#7f3d3c"/>`;
  s += `<path d="M6.1,-0.9 Q6.6,0.3 6.1,1.5" stroke="#d98a7e" stroke-width=".3" fill="none"/>`;
  // ombre sous le menton
  s += `<ellipse cx="8.4" cy="0.2" rx="1" ry="4.4" fill="${P.skinDeep}" opacity=".3" filter="url(#visee-b-flou2)"/>`;
  // bras proche : du coude vers la joue, le poing contre la joue
  s += `<path d="M13.6,6 C13.4,9.4 12,11.6 10.2,11.6 C8.6,11.6 7.4,10.2 6.4,8.2" stroke="${creamShade}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  s += `<path d="M13,6.4 C12.8,9.2 11.6,10.8 10.2,10.8 C9,10.8 8,9.8 7.2,8.2" stroke="${cream}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
  s += `<path d="M9.6,11.4 C10.6,11.6 11.8,11.2 12.6,10.2" stroke="#c9b79c" stroke-width=".5" fill="none"/>`;
  s += `<path d="M14.6,6.4 C14.6,9.2 13,11 10.6,11.2" stroke="${creamShade}" stroke-width="1" stroke-linecap="round" fill="none"/>`;
  s += `<ellipse cx="6" cy="6.6" rx="2.25" ry="2.05" fill="${P.skinShade}"/><ellipse cx="6.4" cy="6.2" rx="1.75" ry="1.55" fill="${skinLit}"/>`;
  s += `<path d="M4.8,5.6 Q5.6,6.4 5.2,7.6 M6.2,5 Q6.9,5.8 6.6,6.9" stroke="${P.skinDeep}" stroke-width=".22" fill="none"/>`;
  s += `</g></g>`;
  return s;
}

/* --------------------------------------------------------------------------
   Outils de tracé : courbes lisses passant par des points (Catmull-Rom)
   -------------------------------------------------------------------------- */
function smooth(ps) {
  let d = `M${pt(ps[0])}`;
  for (let i = 0; i < ps.length; i++) {
    const p0 = ps[(i - 1 + ps.length) % ps.length], p1 = ps[i], p2 = ps[(i + 1) % ps.length], p3 = ps[(i + 2) % ps.length];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d + 'Z';
}
function smoothOpen(ps) {
  let d = `M${pt(ps[0])}`;
  for (let i = 0; i < ps.length - 1; i++) {
    const p0 = ps[Math.max(0, i - 1)], p1 = ps[i], p2 = ps[i + 1], p3 = ps[Math.min(ps.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d;
}
const rel = (o, ps) => ps.map(([x, y]) => [o[0] + x, o[1] + y]);
const blur = (id, s) => `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${s}"/></filter>`;

/* --------------------------------------------------------------------------
   Calque « epaule » : la personne de dos, floue au premier plan.
   Fiche de personnage : cheveux châtain foncé mi-longs jusqu'à la mâchoire,
   qui couvrent les oreilles ; nuque fine ; pull ras du cou bleu-gris.
   Contre-jour : la fenêtre (à droite) pose un liseré chaud sur le bord
   droit des cheveux, de la nuque et de l'épaule.
   -------------------------------------------------------------------------- */
const HC = [1640, 400];   // centre de la masse des cheveux
const SH = [1452, 742];   // articulation de l'épaule gauche : pivot du bras

// Carré mi-long vu de dos, tête à peine tournée vers le berceau : calotte
// ronde, deux pans lisses qui tombent jusqu'à la mâchoire, pointes souples ;
// entre les pans, le bas des cheveux remonte et découvre la nuque
const HS = 0.9; // échelle de la tête
const HAIR_PTS = [
  [-6, -170], [42, -164], [86, -142], [116, -106], [134, -60], [142, -10], [144, 44], [139, 96], [130, 136],
  [116, 166], [100, 184], [84, 186], [68, 176], [48, 164], [24, 157], [0, 155], [-26, 158], [-52, 167],
  [-72, 180], [-90, 190], [-106, 190], [-122, 174], [-136, 142], [-146, 98], [-150, 48], [-148, -4],
  [-136, -58], [-114, -106], [-82, -144], [-44, -164],
];
const HAIR = rel(HC, HAIR_PTS.map(([x, y]) => [x * HS, y * HS]));
// bord droit (côté fenêtre) et calotte : pour le liseré de lumière
const HAIR_RIM = HAIR.slice(1, 11), HAIR_TOP = [...HAIR.slice(-3), ...HAIR.slice(0, 3)];
const NECK = rel(HC, [[-36, 80], [36, 80], [38, 170], [56, 238], [-56, 238], [-38, 170]]);
// Le buste : trapèzes, épaule gauche arrondie (le bras en part), dos
const TORSO = rel(HC, [
  [-76, 236], [-150, 272], [-204, 300], [-246, 330], [-268, 372], [-268, 420], [-252, 480],
  [-244, 620], [-240, 900], [440, 900], [440, 352], [300, 312], [214, 290], [148, 270], [76, 236],
]);

function epaule() {
  const H = smooth(HAIR);
  const [hx, hy] = HC;
  const P_ = (x, y) => `${f1(hx + x)},${f1(hy + y)}`;
  const Q = (x, y) => P_(x * HS, y * HS); // dans la tête (à l'échelle)
  return `<defs>
    ${lin('visee-pull', [[0, '#3b4554'], [0.35, '#28303b'], [1, '#191d25']], 0, 0, 0.35, 1)}
    ${lin('visee-cheveux-p', [[0, '#191113'], [0.45, '#271b19'], [0.8, '#36261f'], [1, '#463024']], 0, 0, 1, 0.2)}
    ${lin('visee-nuque', [[0, '#3a2820'], [0.5, '#56392e'], [0.84, '#7c533e'], [1, '#e2a070']], 0, 0, 1, 0)}
    ${lin('visee-col', [[0, '#2c3440'], [0.6, '#3c4756'], [1, '#6b7787']], 0, 0, 1, 0)}
    <clipPath id="visee-c-cheveux"><path d="${H}"/></clipPath>
    <clipPath id="visee-c-buste"><path d="${smooth(TORSO)}"/></clipPath>
    ${blur('visee-e-f4', 4)}${blur('visee-e-f8', 8)}
  </defs>
  <!-- le buste, pull bleu-gris dans l'ombre -->
  <path d="${smooth(TORSO)}" fill="url(#visee-pull)"/>
  <g clip-path="url(#visee-c-buste)" fill="none" stroke-linecap="round">
    <!-- omoplates, plis souples du dos -->
    <path d="M${P_(-200, 420)} C${P_(-150, 470)} ${P_(-110, 560)} ${P_(-100, 700)} M${P_(40, 380)} C${P_(60, 470)} ${P_(50, 580)} ${P_(30, 700)}" stroke="#12151b" stroke-width="26" opacity=".45" filter="url(#visee-e-f8)"/>
    <!-- couture d'épaule, le pull tiré par le bras levé -->
    <path d="M${P_(-120, 262)} C${P_(-170, 300)} ${P_(-210, 360)} ${P_(-236, 440)}" stroke="#12151b" stroke-width="10" opacity=".4" filter="url(#visee-e-f4)"/>
    <path d="M${P_(-230, 360)} C${P_(-200, 400)} ${P_(-150, 430)} ${P_(-90, 440)}" stroke="#151920" stroke-width="16" opacity=".35" filter="url(#visee-e-f8)"/>
    <!-- lumière froide de la pièce sur l'épaule gauche -->
    <path d="M${P_(-84, 240)} C${P_(-140, 266)} ${P_(-200, 296)} ${P_(-250, 336)}" stroke="#7a889a" stroke-width="10" opacity=".5"/>
    <!-- liseré chaud de la fenêtre sur l'épaule droite -->
    <path d="M${P_(80, 240)} C${P_(150, 268)} ${P_(240, 290)} ${P_(300, 310)} S${P_(400, 340)} ${P_(440, 352)}" stroke="#f3bd82" stroke-width="13" opacity=".85"/>
    <path d="M${P_(120, 262)} C${P_(200, 290)} ${P_(300, 320)} ${P_(420, 360)}" stroke="#c99a74" stroke-width="30" opacity=".22" filter="url(#visee-e-f8)"/>
  </g>
  <!-- la nuque, fine, avec le liseré de lumière sur son bord droit -->
  <path d="${smooth(NECK)}" fill="url(#visee-nuque)"/>
  <path d="M${P_(36, 150)} C${P_(39, 186)} ${P_(44, 218)} ${P_(56, 240)}" stroke="#ffd6a2" stroke-width="10" fill="none" opacity=".9"/>
  <!-- ombre des cheveux sur la nuque -->
  <path d="M${P_(-60, 112)} C${P_(-30, 104)} ${P_(30, 104)} ${P_(60, 112)} L${P_(60, 150)} C${P_(30, 140)} ${P_(-30, 140)} ${P_(-60, 150)} Z" fill="#24170f" opacity=".6" filter="url(#visee-e-f8)"/>
  <!-- col ras du cou, côtelé -->
  <path d="M${P_(-84, 232)} Q${P_(0, 262)} ${P_(84, 232)} L${P_(90, 256)} Q${P_(0, 292)} ${P_(-90, 256)} Z" fill="url(#visee-col)"/>
  <path d="M${P_(-80, 246)} Q${P_(0, 276)} ${P_(80, 246)}" stroke="#1d232c" stroke-width="3" fill="none" opacity=".45"/>
  <!-- les cheveux : la masse sombre, le liseré de contre-jour sur le bord droit -->
  <!-- la tête penche à peine vers le berceau : on regarde le long du bras -->
  <g transform="rotate(-5 ${hx} ${hy + 150})">
  <path d="${H}" fill="url(#visee-cheveux-p)"/>
  <g clip-path="url(#visee-c-cheveux)">
    <!-- liseré de contre-jour sur le bord droit, lumière du ciel sur la calotte -->
    <path d="${smoothOpen(HAIR_RIM)}" stroke="#ffd7a4" stroke-width="28" fill="none"/>
    <path d="${smoothOpen(HAIR_RIM)}" stroke="#a46a40" stroke-width="34" fill="none" opacity=".45" filter="url(#visee-e-f4)"/>
    <path d="${smoothOpen(HAIR_TOP)}" stroke="#6e5446" stroke-width="12" fill="none" opacity=".6"/>
    <path d="${smoothOpen(HAIR.slice(0, 6))}" stroke="#e3aa78" stroke-width="12" fill="none" opacity=".8"/>
    <!-- reflet du ciel sur la calotte, en arc -->
    <path d="M${Q(-118, -40)} C${Q(-80, -112)} ${Q(10, -134)} ${Q(84, -110)} C${Q(108, -98)} ${Q(124, -80)} ${Q(132, -56)}" stroke="#57402f" stroke-width="22" fill="none" opacity=".55" filter="url(#visee-e-f4)"/>
    <!-- mèches lisses : elles partent de la raie (à gauche) et tombent -->
    <g fill="none" stroke-linecap="round">
      <path d="M${Q(-44, -150)} C${Q(-110, -110)} ${Q(-140, -10)} ${Q(-120, 180)}" stroke="#0d0909" stroke-width="7" opacity=".4"/>
      <path d="M${Q(-38, -148)} C${Q(-80, -80)} ${Q(-90, 30)} ${Q(-82, 160)}" stroke="#0e0907" stroke-width="6" opacity=".45"/>
      <path d="M${Q(-30, -150)} C${Q(0, -100)} ${Q(-10, 20)} ${Q(-20, 120)}" stroke="#0e0907" stroke-width="6" opacity=".35"/>
      <path d="M${Q(-24, -152)} C${Q(50, -120)} ${Q(76, 10)} ${Q(62, 140)}" stroke="#0e0907" stroke-width="6" opacity=".45"/>
      <path d="M${Q(-18, -156)} C${Q(84, -140)} ${Q(130, -30)} ${Q(108, 178)}" stroke="#0e0907" stroke-width="6" opacity=".45"/>
      <path d="M${Q(-52, -136)} C${Q(-98, -90)} ${Q(-120, 10)} ${Q(-104, 170)}" stroke="#4e3526" stroke-width="5" opacity=".4"/>
      <path d="M${Q(-20, -142)} C${Q(30, -110)} ${Q(40, 10)} ${Q(30, 126)}" stroke="#4e3526" stroke-width="5" opacity=".3"/>
      <path d="M${Q(2, -150)} C${Q(90, -124)} ${Q(112, -20)} ${Q(96, 170)}" stroke="#6a4a33" stroke-width="6" opacity=".4"/>
    </g>
    <!-- la raie, sur le côté -->
    <path d="M${Q(-34, -160)} C${Q(-44, -144)} ${Q(-54, -132)} ${Q(-68, -122)}" stroke="#0b0705" stroke-width="5" fill="none" opacity=".6"/>
  </g>
  <!-- halo chaud : la lumière traverse les pointes, à droite -->
  <path d="M${Q(112, -100)} C${Q(140, -40)} ${Q(144, 60)} ${Q(124, 176)}" stroke="#ffd9a4" stroke-width="18" fill="none" opacity=".35" filter="url(#visee-e-f8)"/>
  </g>`;
}

/* --------------------------------------------------------------------------
   Calque « bras » : le bras gauche tendu vers le berceau, la main, le
   revolver de profil. Dessiné dans sa pose finale ; au rendu, il pivote
   autour de l'épaule (SH) pour monter depuis le bas du cadre.
   -------------------------------------------------------------------------- */
const WR = [1212, 596];   // poignet : fin de la manche
const GRIP = [1172, 588]; // centre de la crosse, dans le poing
const ARM_L = Math.hypot(WR[0] - SH[0], WR[1] - SH[1]);
const ARM_D = [(WR[0] - SH[0]) / ARM_L, (WR[1] - SH[1]) / ARM_L];
const ARM_N = [-ARM_D[1], ARM_D[0]]; // vers le dessus du bras
// le coude casse un peu le bras vers le bas
const bend = (s) => -30 * Math.max(0, 1 - Math.abs(s - 0.5) / 0.5);
const arm = (s, w) => {
  const ww = w + bend(s);
  return [SH[0] + ARM_D[0] * s * ARM_L + ARM_N[0] * ww, SH[1] + ARM_D[1] * s * ARM_L + ARM_N[1] * ww];
};

// La manche, ample : [s le long du bras, demi-largeur dessus, dessous]
const SLEEVE = [[0.02, 70, 74], [0.18, 64, 74], [0.34, 56, 70], [0.5, 48, 62], [0.6, 42, 50], [0.72, 38, 42], [0.84, 37, 38], [0.9, 31, 31], [1, 29, 29]];
const sleevePath = () => {
  const top = SLEEVE.map(([s, a]) => arm(s, a));
  const bot = SLEEVE.map(([s, , b]) => arm(s, -b)).reverse();
  // bout arrondi derrière l'épaule (caché par le buste)
  const back = [arm(-0.14, -40), arm(-0.2, 0), arm(-0.14, 40)];
  return smooth([...top, ...bot, ...back]);
};

// Revolver de profil, canon vers la gauche ; origine au centre de la crosse.
// Canon court (deux longueurs de barillet), barillet bombé, chien, pontet
// rond, crosse arrondie en bois sombre. La main gauche le tient : on voit le
// côté droit, le pouce le long de la carcasse, les doigts repliés.
function revolverProfil() {
  const st = '#1c2126', st2 = '#2c343c', rim = '#d9d6cf', wood = '#4a3426';
  return `
    <path d="M-8,-30 L12,-46 C22,-30 28,-8 30,12 C32,28 30,40 21,46 C12,51 1,47 -3,37 C-7,22 -8,-2 -8,-30 Z" fill="${wood}"/>
    <path d="M16,-34 C22,-18 26,4 26,26 C26,34 24,40 20,43" stroke="#7a573f" stroke-width="3" fill="none" opacity=".7"/>
    <path d="M-45,-27 C-49,-12 -41,-1 -28,-1 C-16,-1 -10,-11 -10,-25" stroke="${st}" stroke-width="5" fill="none"/>
    <path d="M-22,-28 C-20,-20 -22,-14 -26,-10" stroke="${st}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <path d="M-130,-57 L-54,-59 L-54,-42 L-128,-42 C-131,-42 -132,-45 -132,-48 L-132,-54 C-132,-56 -131,-57 -130,-57 Z" fill="${st}"/>
    <path d="M-104,-43 L-54,-43 L-54,-35 L-100,-35 C-104,-35 -106,-39 -104,-43 Z" fill="${st2}"/>
    <path d="M-127,-57 L-124,-63 L-118,-63 L-117,-57 Z" fill="${st}"/>
    <path d="M-58,-71 L-6,-73 L4,-67 L7,-40 L2,-27 L-44,-25 L-58,-30 Z" fill="${st}"/>
    <path d="M-53,-60 C-54,-70 -49,-73 -42,-73 L-18,-73 C-11,-73 -8,-70 -9,-60 L-9,-40 C-8,-30 -11,-27 -18,-27 L-42,-27 C-49,-27 -54,-30 -53,-40 Z" fill="url(#visee-barillet-p)"/>
    <path d="M-52,-58 L-10,-58 M-52,-43 L-10,-43" stroke="#12161a" stroke-width="3.4" opacity=".6"/>
    <path d="M-49,-66 L-13,-66" stroke="#aab4bc" stroke-width="2.4" opacity=".45"/>
    <path d="M-5,-66 C-3,-73 3,-79 12,-82 C19,-84 24,-81 22,-76 C19,-71 13,-67 8,-61 Z" fill="${st}"/>
    <path d="M-129,-57.6 L-56,-59.6 M-50,-72.4 L-13,-72.4 M-4,-72 L4,-67" stroke="${rim}" stroke-width="2.4" fill="none" opacity=".8"/>
    <path d="M0,-71 C5,-77 11,-81 18,-82.5" stroke="${rim}" stroke-width="2.4" fill="none" opacity=".75"/>`;
}

function mainGauche() {
  // Le poing autour de la crosse (le talon arrondi dépasse sous le petit
  // doigt), les doigts repliés, le pouce allongé le long de la carcasse :
  // l'index n'est pas sur la détente
  return `
    <path d="M28,-24 C38,-20 46,-10 50,2 L48,22 C40,26 32,24 26,18 Z" fill="url(#visee-poignet)"/>
    <path d="M10,-48 C22,-46 32,-32 34,-14 C36,0 33,14 27,22 C20,30 4,32 -8,28 C-18,24 -24,16 -24,4 C-24,-8 -22,-20 -18,-30 C-12,-40 0,-48 10,-48 Z" fill="url(#visee-poing)"/>
    <g stroke-linecap="round" fill="none">
      <path d="M-23,-18 C-14,-20 -4,-19 6,-15" stroke="#e6b296" stroke-width="12"/>
      <path d="M-24,-4 C-14,-6 -4,-5 7,-1" stroke="#d5a086" stroke-width="12"/>
      <path d="M-23,10 C-14,8 -4,9 6,13" stroke="#c39079" stroke-width="11"/>
      <path d="M-18,22 C-11,21 -4,22 3,24" stroke="#ac7f6a" stroke-width="9"/>
      <path d="M-22,-11 C-12,-13 -2,-12 8,-8 M-23,3 C-13,1 -3,2 8,6 M-21,17 C-12,16 -3,17 6,19" stroke="#7a4b38" stroke-width="2.2" opacity=".75"/>
      <path d="M8,-17 L8,-12 M9,-3 L9,2 M8,11 L8,16" stroke="#f4c6a0" stroke-width="3" opacity=".6"/>
    </g>
    <path d="M14,-42 C4,-40 -12,-36 -28,-31 C-34,-29 -35,-24 -30,-22 C-16,-24 0,-27 14,-28 Z" fill="#d4a086"/>
    <path d="M-29,-30 C-14,-34 0,-37 12,-40" stroke="#f6c49a" stroke-width="2.4" fill="none" opacity=".85"/>
    <path d="M-30,-29 C-33,-26 -32,-23 -28,-23" stroke="#f1d0b4" stroke-width="2" fill="none" opacity=".7"/>
    <path d="M10,-47 C20,-45 30,-34 33,-18" stroke="#f3b88c" stroke-width="3" fill="none" opacity=".7"/>`;
}

function bras() {
  const tf = `translate(${GRIP[0]} ${GRIP[1]}) rotate(-3) scale(1.12)`;
  const g0 = arm(0.5, 52), g1 = arm(0.5, -62);
  const S = sleevePath();
  // plis de la manche ample : elle pend sous le bras, se plisse au creux du
  // coude, fronce au-dessus du poignet
  const crease = (pts, col, w, o) => `<path d="${smoothOpen(pts.map(([u, v]) => arm(u, v)))}" stroke="${col}" stroke-width="${w}" opacity="${o}"/>`;
  const folds =
    crease([[0.06, -56], [0.22, -46], [0.38, -56]], '#0f1218', 14, 0.5) +
    crease([[0.1, -30], [0.26, -24], [0.4, -34]], '#56657a', 10, 0.35) +
    crease([[0.3, -64], [0.42, -50], [0.5, -60]], '#0f1218', 9, 0.5) +
    crease([[0.46, 46], [0.5, 22], [0.535, -4]], '#12161d', 5, 0.6) +
    crease([[0.53, 42], [0.56, 20], [0.585, 0]], '#12161d', 4.5, 0.55) +
    crease([[0.495, 44], [0.525, 22], [0.555, 2]], '#5f6e84', 3.5, 0.55) +
    crease([[0.47, -52], [0.52, -58], [0.58, -48]], '#4a586e', 6, 0.5) +
    crease([[0.62, 38], [0.66, 10], [0.64, -24]], '#12161d', 4, 0.45) +
    crease([[0.78, 34], [0.805, 4], [0.79, -32]], '#12161d', 4, 0.6) +
    crease([[0.8, 34], [0.83, 6], [0.815, -30]], '#5f6e84', 3, 0.5) +
    crease([[0.845, 34], [0.865, 4], [0.85, -32]], '#12161d', 4, 0.6) +
    crease([[0.12, 64], [0.4, 54], [0.62, 44], [0.88, 34]], '#6f7f93', 7, 0.55) +
    crease([[0.5, 47], [0.7, 39], [0.88, 34]], '#e2ad7c', 4.5, 0.65);
  // poignet côtelé
  const cuff = [arm(0.9, 31), arm(1, 29), arm(1, -29), arm(0.9, -31)];
  const ribs = Array.from({ length: 6 }, (_, i) => {
    const w = -24 + i * 9.6;
    return `<path d="M${pt(arm(0.905, w))} L${pt(arm(0.995, w))}" stroke="#1a1f27" stroke-width="2"/>`;
  }).join('');
  return `<defs>
    <linearGradient id="visee-manche" gradientUnits="userSpaceOnUse" x1="${f1(g0[0])}" y1="${f1(g0[1])}" x2="${f1(g1[0])}" y2="${f1(g1[1])}">
      <stop offset="0" stop-color="#4f5d70"/><stop offset=".3" stop-color="#323b49"/><stop offset=".75" stop-color="#20262f"/><stop offset="1" stop-color="#171b22"/>
    </linearGradient>
    <linearGradient id="visee-m-pres" gradientUnits="userSpaceOnUse" x1="${SH[0]}" y1="${SH[1]}" x2="${WR[0]}" y2="${WR[1]}">
      <stop offset=".55" stop-color="#fff"/><stop offset=".85" stop-color="#000"/>
    </linearGradient>
    <linearGradient id="visee-m-loin" gradientUnits="userSpaceOnUse" x1="${SH[0]}" y1="${SH[1]}" x2="${WR[0]}" y2="${WR[1]}">
      <stop offset=".3" stop-color="#000"/><stop offset=".6" stop-color="#fff"/>
    </linearGradient>
    <mask id="visee-masque-pres" maskUnits="userSpaceOnUse" x="900" y="300" width="800" height="700"><rect x="900" y="300" width="800" height="700" fill="url(#visee-m-pres)"/></mask>
    <mask id="visee-masque-loin" maskUnits="userSpaceOnUse" x="900" y="300" width="800" height="700"><rect x="900" y="300" width="800" height="700" fill="url(#visee-m-loin)"/></mask>
    <clipPath id="visee-c-manche"><path d="${S}"/></clipPath>
    ${lin('visee-barillet-p', [[0, '#7d8994'], [0.3, '#4c5762'], [0.7, '#2c343c'], [1, '#161a1e']], 0, 0, 0, 1)}
    ${lin('visee-poing', [[0, '#e2ad90'], [0.5, '#c28f77'], [1, '#85594b']], 0, 0, 0.3, 1)}
    ${lin('visee-poignet', [[0, '#d2a089'], [1, '#8a5f50']], 0, 0, 0, 1)}
    ${blur('visee-b-f8', 8)}
    <filter id="visee-bras-peint" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="3" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="3" seed="11" result="tex"/>
      <feColorMatrix in="tex" type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1" result="gray"/>
      <feComposite in="shape" in2="gray" operator="arithmetic" k1="0.2" k2="0.9" k3="0" k4="0" result="mod"/>
      <feComposite in="mod" in2="shape" operator="in"/>
    </filter>
    <g id="visee-manche-g">
      <path d="${S}" fill="url(#visee-manche)"/>
      <g clip-path="url(#visee-c-manche)" fill="none" stroke-linecap="round">${folds}</g>
      <path d="${smooth(cuff)}" fill="#2a313c"/>
      ${ribs}
      <path d="M${pt(arm(0.9, 31))} L${pt(arm(1, 29))}" stroke="#d9a578" stroke-width="3" opacity=".6"/>
    </g>
  </defs>
  <!-- la main et l'arme : nettes, à peine floues (calque b3) -->
  <g filter="url(#visee-bras-peint)"><g transform="${tf}">${revolverProfil()}${mainGauche()}</g></g>
  <!-- la manche : floue près de l'épaule (comme le buste), plus nette vers le poignet -->
  <g filter="url(#paint)">
    <g mask="url(#visee-masque-pres)"><g filter="url(#visee-b-f8)"><use href="#visee-manche-g"/></g></g>
    <g mask="url(#visee-masque-loin)"><use href="#visee-manche-g"/></g>
  </g>`;
}

/* --------------------------------------------------------------------------
   Calque « mains » (vue subjective) : on tient le revolver à deux mains, vu
   de derrière et d'un peu au-dessus. L'arme est un petit modèle en
   millimètres (x à droite, y en haut, z vers l'avant), tourné de quelques
   degrés vers le berceau puis projeté : le canon court fuit vers le haut,
   le barillet dépasse de chaque côté de la carcasse, le chien est au plus
   près. Les mains sont dessinées autour : la gauche (main forte) serre la
   crosse, la droite l'enveloppe et ses doigts repliés reviennent sur le
   flanc gauche ; les deux pouces sont allongés sur le flanc droit.
   La lumière de la fenêtre vient de la droite.
   -------------------------------------------------------------------------- */
// En téléphone, la personne glisse vers la gauche pour rester dans le cadre
const PORTRAIT_SHIFT = { x: -300, y: 0 };
// Place du chien à l'écran (repère 1920 × 1080), inclinaison, échelle
const POVG = { x: 1092, y: 626, rot: -3, k: 1.22 };
const POV_DY = 26; // les mains, un peu sous l'arme : on voit la crosse au-dessus

// Projection de l'arme : tangage (vue d'un peu au-dessus), lacet (le canon
// tourné vers le berceau), échelle en pixels par millimètre
const GV = (() => {
  const th = (22 * Math.PI) / 180, ps = (5 * Math.PI) / 180;
  return { ct: Math.cos(th), st: Math.sin(th), cp: Math.cos(ps), sp: Math.sin(ps), s: 2.55 };
})();
const gRaw = (X, Y, Z) => {
  const X1 = X * GV.cp - Z * GV.sp, Z1 = X * GV.sp + Z * GV.cp;
  return [GV.s * X1, -GV.s * (Y * GV.ct + Z1 * GV.st)];
};
const G0 = gRaw(0, 14, -10); // le chien : origine du calque
const gp = (X, Y, Z) => { const r = gRaw(X, Y, Z); return [r[0] - G0[0], r[1] - G0[1]]; };

// Enveloppe convexe (chaîne monotone) : silhouette d'un volume simple
function hull(ps) {
  const p = [...ps].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of [...p].reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}
// Cercle d'axe z, cylindre d'axe z, pavé : en points projetés
const ring = (xc, yc, r, z, n = 32) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * TAU;
  return gp(xc + r * Math.cos(a), yc + r * Math.sin(a), z);
});
const tube = (xc, yc, r, z1, z2) => hull([...ring(xc, yc, r, z1), ...ring(xc, yc, r, z2)]);
const brick = (x1, x2, y1, y2, z1, z2) => hull([x1, x2].flatMap((x) => [y1, y2].flatMap((y) => [z1, z2].map((z) => gp(x, y, z)))));
const dpath = (ps) => `M${ps.map(pt).join(' L')} Z`;
const line = (a, b) => `M${pt(a)} L${pt(b)}`;

// Le barillet : rayon, axe (sous le canon), arrière et avant
const CYL = { r: 20, y: -11, z1: 4, z2: 44 };

// Le corps du barillet vu de derrière : silhouette, cannelures, reflets
function barilletDos() {
  const { r, y: cy, z1, z2 } = CYL, rim = '#cfd3d2', sky = '#76828c';
  let s = `<path d="${dpath(tube(0, cy, r, z1, z2))}" fill="url(#visee-pov-barillet)"/>`;
  for (const a of [150, 30, 210, 330]) {
    const c = Math.cos((a * Math.PI) / 180), n = Math.sin((a * Math.PI) / 180);
    const A = gp(r * 0.97 * c, cy + r * 0.97 * n, z1 + 6), B = gp(r * 0.97 * c, cy + r * 0.97 * n, z2 - 6);
    s += `<path d="${line(A, B)}" stroke="#0d1013" stroke-width="7" stroke-linecap="round" opacity=".55"/>`;
  }
  const lit = (a, col, w, o) => {
    const c = Math.cos((a * Math.PI) / 180), n = Math.sin((a * Math.PI) / 180);
    return `<path d="${line(gp(r * c, cy + r * n, z1 + 4), gp(r * c, cy + r * n, z2 - 3))}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
  };
  return s + lit(62, sky, 4, 0.55) + lit(118, sky, 3, 0.4) + lit(4, rim, 3.4, 0.75) + lit(-12, rim, 2.4, 0.5);
}

function revolverDos() {
  const st = '#1f252b', st2 = '#2b333b', rim = '#cfd3d2', sky = '#76828c';
  let s = '';
  // guidon, au bout du canon (le plus loin)
  s += `<path d="${dpath(brick(-1.6, 1.6, 7, 15, 98, 110))}" fill="${st}"/>`;
  // canon court : il fuit vers le berceau ; le ciel sur le dessus, la fenêtre à droite
  const bar = tube(0, 0, 8, 44, 112);
  s += `<path d="${dpath(bar)}" fill="url(#visee-pov-canon)"/>`;
  s += `<path d="${line(gp(-1.5, 8, 50), gp(-1.5, 8, 110))}" stroke="${sky}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
  s += `<path d="${line(gp(7.4, 3, 50), gp(7.4, 3, 110))}" stroke="${rim}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`;
  // le barillet, bombé, puis sa face arrière qui dépasse de chaque côté de
  // la carcasse
  const { r, y: cy, z1 } = CYL;
  s += barilletDos();
  s += `<path d="${dpath(ring(0, cy, r, z1))}" fill="url(#visee-pov-face)"/>`;
  s += `<path d="${dpath(ring(0, cy, r - 2.2, z1))}" fill="none" stroke="#0e1114" stroke-width="2" opacity=".55"/>`;
  // la sangle supérieure et sa rainure (le cran de mire), jusqu'au canon
  s += `<path d="${dpath(brick(-8.5, 8.5, 9, 14, -1, 46))}" fill="${st2}"/>`;
  s += `<path d="${dpath([gp(-8.5, 14, -1), gp(8.5, 14, -1), gp(8.5, 14, 46), gp(-8.5, 14, 46)])}" fill="#3a434c"/>`;
  s += `<path d="${line(gp(0, 14, 0), gp(0, 14, 45))}" stroke="#0b0d0f" stroke-width="3.4"/>`;
  s += `<path d="${line(gp(8.5, 14, 2), gp(8.5, 14, 44))}" stroke="${rim}" stroke-width="2" opacity=".6"/>`;
  // la crosse en bois sombre, plus large que la carcasse : ses plaquettes
  // l'encadrent, puis elle plonge dans les mains
  const gr = [gp(-17, -4, -2), gp(17, -4, -2), gp(18, -44, -18), gp(-18, -44, -18)];
  s += `<path d="${roundPath(gr, 14)}" fill="url(#visee-pov-bois)"/>`;
  s += `<path d="${line(gp(16.4, -6, -3), gp(17.4, -40, -17))}" stroke="#8a634a" stroke-width="2.6" opacity=".8"/>`;
  s += `<path d="${dpath([gp(-5, -15, -1), gp(5, -15, -1), gp(5, -44, -18.5), gp(-5, -44, -18.5)])}" fill="#262c32"/>`;
  // l'arrière de la carcasse, plus étroit que le barillet
  const fr = [gp(-10, 13, 0), gp(10, 13, 0), gp(12, 4, 0), gp(12.5, -15, 0), gp(-12.5, -15, 0), gp(-12, 4, 0)];
  s += `<path d="${roundPath(fr, 10)}" fill="${st}"/>`;
  s += `<path d="${line(gp(11.5, 6, 0), gp(12.3, -13, 0))}" stroke="${rim}" stroke-width="2.4" opacity=".55"/>`;
  // le chien : corps dans sa fente, crête striée tournée vers nous
  s += `<path d="${dpath(brick(-4, 4, 2, 12, -10, 0))}" fill="#15191d"/>`;
  const sp = [gp(-6.5, 9, -7), gp(6.5, 9, -7), gp(7, 21, -15), gp(-7, 21, -15)];
  s += `<path d="${roundPath(sp, 6)}" fill="url(#visee-pov-chien)"/>`;
  for (let i = 0; i < 4; i++) {
    const y = 11.5 + i * 2.6, z = -8.5 - i * 1.7;
    s += `<path d="${line(gp(-5.2, y, z), gp(5.2, y, z))}" stroke="#0d1013" stroke-width="1.6" opacity=".75"/>`;
  }
  s += `<path d="${line(gp(6.6, 10, -7.5), gp(6.8, 20, -14))}" stroke="${rim}" stroke-width="2" opacity=".85"/>`;
  return s;
}

// Main gauche (main forte) : le dos de la main, dans l'ombre, la rangée des
// articulations sur le flanc gauche ; le creux du pouce sous le chien
const POV_MG = [
  [6, 50], [-22, 48], [-50, 54], [-76, 66], [-98, 84], [-110, 106], [-114, 132], [-108, 158],
  [-96, 180], [-80, 198], [-58, 208], [-34, 206], [-14, 190], [-2, 150], [4, 100],
];
// Main droite (soutien) : elle enveloppe la gauche par la droite et par-dessous,
// le dos de la main dans la lumière de la fenêtre
const POV_MD = [
  [10, 80], [34, 74], [62, 76], [88, 86], [106, 104], [116, 128], [114, 156], [104, 180],
  [88, 198], [64, 212], [36, 216], [8, 212], [-16, 202], [-30, 184], [-28, 158], [-16, 128], [-2, 100],
];

function mains() {
  const skL = '#efc2a2', sk = '#d39e7f', skS = '#9c6a56', skD = '#5e3d33';
  // les doigts de la main droite reviennent sur le flanc gauche, par-dessus
  // ceux de la main gauche : on voit leurs dernières phalanges, repliées
  const doigts = [[-100, 84, 21], [-112, 112, 22], [-112, 140, 21], [-104, 166, 18]].map(([x, y, w], i) =>
    `<path d="M${x + 30},${y - 2} C${x + 8},${y - 8} ${x - 14},${y - 6} ${x - 18},${y + 8}" stroke="${['#94695a', '#896152', '#7e594b', '#725144'][i]}" stroke-width="${w}" stroke-linecap="round" fill="none"/>` +
    `<path d="M${x - 4},${y - 8} C${x - 12},${y - 6} ${x - 18},${y} ${x - 20},${y + 6}" stroke="#d9ab90" stroke-width="3" stroke-linecap="round" fill="none" opacity=".6"/>` +
    `<path d="M${x + 28},${y + 9} C${x + 8},${y + 5} ${x - 6},${y + 8} ${x - 12},${y + 17}" stroke="${skD}" stroke-width="2.4" fill="none" opacity=".6"/>`).join('');
  // articulations de la main droite, sur son flanc, prises dans la lumière
  const bossesD = [[104, 98], [114, 124], [112, 150], [102, 174]].map(([x, y]) =>
    `<ellipse cx="${x - 7}" cy="${y}" rx="10" ry="11" fill="#f6d6bc" opacity=".55"/>` +
    `<path d="M${x - 16},${y + 10} q8,5 15,1" stroke="${skS}" stroke-width="2.4" fill="none" opacity=".6"/>`).join('');
  // articulations de la main gauche, dans l'ombre
  const bossesG = [[-96, 80], [-108, 106], [-110, 132], [-102, 158]].map(([x, y]) =>
    `<ellipse cx="${x + 8}" cy="${y}" rx="9" ry="10" fill="#a07868" opacity=".6"/>`).join('');
  return `<defs>
    ${lin('visee-pov-canon', [[0, '#14181c'], [0.45, '#2c343c'], [0.8, '#5d6872'], [1, '#2a3036']], 0, 0, 1, 0)}
    ${lin('visee-pov-barillet', [[0, '#121518'], [0.3, '#2e363e'], [0.62, '#3c4650'], [0.86, '#8f9aa3'], [1, '#2a3036']], 0, 0, 1, 0)}
    ${lin('visee-pov-face', [[0, '#1a1f24'], [0.6, '#262d34'], [1, '#3b444d']], 0, 0, 1, 0)}
    ${lin('visee-pov-chien', [[0, '#2a3036'], [0.5, '#46505a'], [1, '#8c979f']], 0, 0, 1, 0)}
    ${lin('visee-pov-bois', [[0, '#2e2018'], [0.5, '#4a3426'], [1, '#6a4a36']], 0, 0, 1, 0)}
    ${lin('visee-pov-mg', [[0, '#4a3632'], [0.45, '#664a40'], [1, '#86604f']], 0, 0, 1, 0.3)}
    ${lin('visee-pov-md', [[0, '#8e604f'], [0.35, '#b58268'], [0.7, sk], [1, skL]], 0, 0, 1, 0)}
    ${lin('visee-pov-manche-g', [[0, '#1b2029'], [0.6, '#2a313c'], [1, '#3d4757']], 0, 0, 1, 0)}
    ${lin('visee-pov-manche-d', [[0, '#2a323d'], [0.55, P.cloth], [1, '#66768a']], 0, 0, 1, 0)}
    <filter id="visee-pov-peint" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="9" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="3" seed="11" result="tex"/>
      <feColorMatrix in="tex" type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1" result="gray"/>
      <feComposite in="shape" in2="gray" operator="arithmetic" k1="0.2" k2="0.9" k3="0" k4="0" result="mod"/>
      <feComposite in="mod" in2="shape" operator="in"/>
    </filter>
    <clipPath id="visee-pov-c-mg"><path d="${smooth(POV_MG)}"/></clipPath>
    <clipPath id="visee-pov-c-md"><path d="${smooth(POV_MD)}"/></clipPath>
    ${blur('visee-pov-f10', 10)}${blur('visee-pov-f3', 1.2)}
  </defs>
  <g filter="url(#visee-pov-peint)"><g transform="translate(${POVG.x} ${POVG.y}) rotate(${POVG.rot}) scale(${POVG.k})">
    ${revolverDos()}
    <g transform="translate(0 ${POV_DY})">
    <!-- avant-bras dans les manches amples : ils viennent de nous, flous -->
    <g filter="url(#visee-pov-f10)">
      <path d="M-104,190 C-150,250 -210,330 -290,460 L-20,500 C-24,400 -26,300 -28,212 Z" fill="url(#visee-pov-manche-g)"/>
      <path d="M14,212 C20,300 30,400 48,500 L330,450 C250,350 180,270 108,186 Z" fill="url(#visee-pov-manche-d)"/>
      <path d="M-190,330 C-140,350 -90,356 -30,352 M44,356 C110,362 170,350 240,320" stroke="#141820" stroke-width="14" fill="none" opacity=".4"/>
      <path d="M120,210 C180,280 240,350 300,440" stroke="#8796a8" stroke-width="12" fill="none" opacity=".45"/>
    </g>
    <!-- poignets côtelés -->
    <path d="M-100,186 C-78,204 -52,214 -24,212 L-26,244 C-58,246 -88,234 -112,214 Z" fill="#262d37"/>
    <path d="M10,212 C42,220 78,210 104,190 L116,218 C90,240 52,250 14,244 Z" fill="#46525f"/>
    <path d="${[0, 1, 2, 3, 4, 5].map((i) => `M${-100 + i * 14},${200 + i * 2.6} l-3,30`).join(' ')}" stroke="#141820" stroke-width="2" opacity=".55"/>
    <path d="${[0, 1, 2, 3, 4, 5].map((i) => `M${22 + i * 15},${218 - i * 4} l4,28`).join(' ')}" stroke="#2a323d" stroke-width="2" opacity=".55"/>
    <g filter="url(#visee-pov-f3)">
      <!-- main gauche : dos de la main dans l'ombre, articulations à gauche -->
      <path d="${smooth(POV_MG)}" fill="url(#visee-pov-mg)"/>
      <g clip-path="url(#visee-pov-c-mg)" fill="none">
        ${bossesG}
        <path d="M2,58 C-26,56 -56,64 -84,84" stroke="#b08672" stroke-width="9" opacity=".6"/>
        <path d="M-40,96 C-48,130 -50,164 -46,200 M-64,92 C-74,124 -76,158 -70,192" stroke="${skD}" stroke-width="3" opacity=".3"/>
      </g>
      ${doigts}
      <path d="M-30,56 C-10,48 14,50 30,62" stroke="#3a2620" stroke-width="12" stroke-linecap="round" fill="none" opacity=".45"/>
      <!-- main droite : elle enveloppe la gauche, son dos dans la lumière -->
      <path d="${smooth(POV_MD)}" fill="url(#visee-pov-md)"/>
      <g clip-path="url(#visee-pov-c-md)" fill="none">
        ${bossesD}
        <path d="M34,112 C42,142 44,170 40,200 M60,106 C70,136 72,166 66,196 M84,108 C92,134 92,160 86,186" stroke="${skS}" stroke-width="3" opacity=".3"/>
        <path d="M116,112 C122,140 118,168 104,192" stroke="#ffe0c4" stroke-width="7" opacity=".6"/>
        <path d="M-6,104 C-24,130 -30,160 -26,190" stroke="${skD}" stroke-width="10" opacity=".45"/>
        <path d="M12,84 C40,80 70,84 96,98" stroke="#6b463a" stroke-width="10" opacity=".35"/>
        <path d="M20,150 C40,170 70,178 100,170" stroke="#7a5244" stroke-width="16" opacity=".22"/>
      </g>
    </g>
    </g>
    <!-- les deux pouces, allongés vers l'avant sur le flanc droit, leurs
         bouts sous le renflement du barillet : celui de la main gauche
         contre la carcasse, celui de la main droite plus bas, à l'extérieur -->
    <g filter="url(#visee-pov-f3)">
      <!-- pouce droit : plus bas, le long de la carcasse, son bout dépasse -->
      <path d="M30,158 C38,128 48,98 56,72 C60,58 76,56 80,68 C84,84 80,116 72,142 C66,162 34,172 30,158 Z" fill="${sk}"/>
      <path d="M58,70 C61,61 74,60 77,68 L76,82 C70,88 61,87 57,82 Z" fill="#f2d4c0"/>
      <path d="M81,76 C83,100 78,126 70,150" stroke="#ffe4cc" stroke-width="3.4" fill="none" opacity=".8"/>
      <path d="M50,112 C58,110 66,112 74,118" stroke="${skS}" stroke-width="2.4" fill="none" opacity=".5"/>
      <!-- ombre du pouce gauche sur le pouce droit -->
      <path d="M26,126 C34,112 42,96 50,80" stroke="#6b463a" stroke-width="10" stroke-linecap="round" fill="none" opacity=".45"/>
      <!-- pouce gauche : il part du creux de la main, sous le chien, et
           s'allonge contre la carcasse jusque sous le barillet -->
      <path d="M-10,104 C2,94 14,82 24,70 C30,62 44,60 47,70 C50,84 44,98 36,110 C26,124 2,130 -10,104 Z" fill="${skL}"/>
      <path d="M26,68 C31,60 43,60 46,68 L44,80 C38,85 30,84 27,79 Z" fill="#fae2d2"/>
      <path d="M-8,100 C4,92 16,80 25,70" stroke="${skS}" stroke-width="3" fill="none" opacity=".55"/>
      <path d="M47,74 C47,88 42,100 34,112" stroke="#fff2e4" stroke-width="3" fill="none" opacity=".75"/>
      <path d="M8,92 C14,92 20,94 24,98" stroke="${skS}" stroke-width="2.2" fill="none" opacity=".5"/>
    </g>
  </g></g>`;
}

/* --------------------------------------------------------------------------
   Lumière volumétrique : rayons du soleil (peints une fois, très flous,
   dans un petit canvas mis en cache) et poussière qui danse dedans.
   -------------------------------------------------------------------------- */
const BOX = [-240, -160, 2400, 1400];

// Les rais : la lumière entre par la fenêtre (derrière la tête) et file vers
// le mur et le berceau, en éventail
// [départ y au bord de la fenêtre, arrivée (x, y), largeurs, intensité]
const STREAKS = [
  [-30, 1060, 250, 46, 74, 0.2],
  [52, 760, 392, 58, 92, 0.32],
  [136, 840, 520, 34, 60, 0.26],
  [214, 900, 650, 84, 130, 0.22],
  [300, 1010, 760, 26, 46, 0.3],
  [380, 1150, 830, 60, 90, 0.16],
].map(([sy, ex, ey, w0, w1, a], i) => {
  const S = [1990, sy], dx = ex - S[0], dy = ey - S[1], len = Math.hypot(dx, dy);
  return { S, D: [dx / len, dy / len], len, w: w0, w1, a, grp: i % 2 };
});

let RAYS = null;
function rays() {
  if (RAYS) return RAYS;
  const k = 1 / 5;
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = BOX[2] * k; c.height = BOX[3] * k;
    const ctx = c.getContext('2d');
    ctx.scale(k, k);
    ctx.translate(-BOX[0], -BOX[1]);
    return [c, ctx];
  };
  // adoucit en repassant par une résolution encore plus basse
  const soften = (c) => {
    const d = document.createElement('canvas');
    d.width = c.width / 2; d.height = c.height / 2;
    const x = d.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(c, 0, 0, d.width, d.height);
    return d;
  };
  const beam = (ctx, st, aMul = 1, wMul = 1) => {
    const { S, D, len } = st;
    const B = [S[0] + D[0] * len, S[1] + D[1] * len];
    const nx = -D[1], ny = D[0];
    const wa = (st.w * wMul) / 2, wb = (st.w1 * wMul) / 2;
    const a = st.a * aMul;
    const g = ctx.createLinearGradient(S[0], S[1], B[0], B[1]);
    g.addColorStop(0, `rgba(255,228,172,${a * 0.5})`);
    g.addColorStop(0.18, `rgba(255,226,168,${a})`);
    g.addColorStop(0.6, `rgba(255,218,156,${a * 0.6})`);
    g.addColorStop(1, 'rgba(255,210,140,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(S[0] + nx * wa, S[1] + ny * wa);
    ctx.lineTo(B[0] + nx * wb, B[1] + ny * wb);
    ctx.lineTo(B[0] - nx * wb, B[1] - ny * wb);
    ctx.lineTo(S[0] - nx * wa, S[1] - ny * wa);
    ctx.closePath();
    ctx.fill();
  };
  // nappe d'ensemble, très légère et très large
  const [c0, x0] = mk();
  for (const st of STREAKS) beam(x0, st, 0.22, 2.6);
  const out = [soften(c0)];
  for (const grp of [0, 1]) {
    const [c, x] = mk();
    for (const st of STREAKS) if (st.grp === grp) beam(x, st);
    out.push(soften(c));
  }
  return (RAYS = out);
}

// Poussière : des grains pris dans les rais, qui dérivent lentement
const DUST = (() => {
  const r = rng(23);
  return Array.from({ length: 120 }, () => {
    const st = STREAKS[Math.floor(r() * STREAKS.length)];
    return { st, o: (r() - 0.5) * 0.9, s: r(), sp: 0.004 + r() * 0.008, ph: r() * TAU, big: r() < 0.1 };
  });
})();

function dust(c, T, k = 1) {
  c.globalCompositeOperation = 'screen';
  for (const d of DUST) {
    const { S, D, len, w, a: sa } = d.st;
    const s = (d.s + T * d.sp) % 1;
    const along = s * len * 0.85;
    const off = d.o * lerp(w, d.st.w1, s);
    const x = S[0] + D[0] * along - D[1] * off + 4 * Math.sin(T * 0.37 + d.ph);
    const y = S[1] + D[1] * along + D[0] * off + 5 * Math.sin(T * 0.29 + d.ph * 1.7);
    const tw = 0.5 + 0.5 * Math.sin(T * (0.8 + d.sp * 80) + d.ph * 3);
    const fade = Math.min(1, s * 5, (1 - s) * 3) * (1 - 2 * Math.abs(d.o) * 0.6);
    const a = Math.min(1, 3.4 * sa) * tw * fade * k;
    if (a <= 0.03) continue;
    const rr = d.big ? 2.8 : 1.2 + d.sp * 80;
    const g = c.createRadialGradient(x, y, 0, x, y, rr * 2.2);
    g.addColorStop(0, `rgba(255,242,210,${a})`);
    g.addColorStop(1, 'rgba(255,242,210,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, rr * 2.2, 0, TAU);
    c.fill();
  }
}

/* --------------------------------------------------------------------------
   Mobile en feutrine : étoile, lune, nuage, petit soleil (procédural)
   -------------------------------------------------------------------------- */
const MOBILE = [
  { kind: 'etoile', col: '#e8c46a', len: 12 },
  { kind: 'lune', col: '#a9c0cf', len: 16 },
  { kind: 'nuage', col: '#f1ece3', len: 10 },
  { kind: 'soleil', col: '#e9a87c', len: 14 },
];

function feltShape(c, kind, r) {
  c.beginPath();
  if (kind === 'etoile') {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.48 : r;
      c.lineTo(rr * Math.cos(a), rr * Math.sin(a));
    }
    c.closePath();
  } else if (kind === 'lune') {
    c.arc(0, 0, r, Math.PI * 0.35, Math.PI * 1.65, false);
    c.bezierCurveTo(-r * 0.05, -r * 0.55, -r * 0.05, r * 0.55, r * Math.cos(Math.PI * 0.35), r * Math.sin(Math.PI * 0.35));
    c.closePath();
  } else if (kind === 'nuage') {
    c.moveTo(-r, r * 0.35);
    c.bezierCurveTo(-r * 1.15, -r * 0.2, -r * 0.55, -r * 0.45, -r * 0.35, -r * 0.2);
    c.bezierCurveTo(-r * 0.25, -r * 0.8, r * 0.45, -r * 0.8, r * 0.45, -r * 0.25);
    c.bezierCurveTo(r * 0.85, -r * 0.4, r * 1.2, r * 0.05, r, r * 0.35);
    c.closePath();
  } else {
    c.arc(0, 0, r * 0.62, 0, TAU);
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8;
      c.moveTo(r * 0.72 * Math.cos(a), r * 0.72 * Math.sin(a));
      c.arc(r * 0.86 * Math.cos(a), r * 0.86 * Math.sin(a), r * 0.15, a + Math.PI, a + Math.PI + TAU);
    }
  }
}

function mobile(c, T) {
  const hang = cw(MOB[0], MOB[1], MOB[2]), hub = cw(MOB[0], 139, MOB[2]);
  c.strokeStyle = 'rgba(80,70,60,.6)';
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(hang[0], hang[1]); c.lineTo(hub[0], hub[1]); c.stroke();
  const th = 0.4 + 0.17 * T;
  const items = MOBILE.map((m, i) => {
    const a = th + (i * TAU) / 4;
    const u = MOB[0] + 15 * Math.cos(a), v = MOB[2] + 15 * Math.sin(a);
    return { ...m, i, a, u, v, z: wz(u, v) };
  }).sort((p, q) => q.z - p.z);
  // croisillon de bois
  c.strokeStyle = P.woodDark;
  c.lineWidth = 2.2;
  for (let i = 0; i < 2; i++) {
    const a = th + (i * TAU) / 4;
    const p1 = cw(MOB[0] + 15 * Math.cos(a), 139, MOB[2] + 15 * Math.sin(a));
    const p2 = cw(MOB[0] - 15 * Math.cos(a), 139, MOB[2] - 15 * Math.sin(a));
    c.beginPath(); c.moveTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.stroke();
  }
  for (const m of items) {
    const top = cw(m.u, 139, m.v);
    const swing = 0.05 * Math.sin(T * 0.9 + m.i * 1.7);
    const k = kz(m.u, m.v);
    const bot = [top[0] + Math.sin(swing) * m.len * k, top[1] + Math.cos(swing) * m.len * k];
    c.strokeStyle = 'rgba(90,80,70,.55)';
    c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(top[0], top[1]); c.lineTo(bot[0], bot[1]); c.stroke();
    const r = 4.2 * k;
    // la forme tourne doucement sur son fil : largeur apparente qui varie
    const turn = 0.72 + 0.28 * Math.cos(T * 0.45 + m.i * 2.1);
    c.save();
    c.translate(bot[0], bot[1] + r * 0.9);
    c.rotate(swing * 0.6);
    c.scale(turn, 1);
    feltShape(c, m.kind, r);
    const g = c.createRadialGradient(r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.3);
    g.addColorStop(0, '#fff6e6');
    g.addColorStop(0.25, m.col);
    g.addColorStop(1, shade(m.col, 0.72));
    c.fillStyle = g;
    c.fill();
    c.strokeStyle = 'rgba(255,248,235,.55)';
    c.setLineDash([2, 2.5]);
    c.lineWidth = 0.8;
    c.save(); c.scale(0.8, 0.8); feltShape(c, m.kind, r); c.restore();
    c.stroke();
    c.setLineDash([]);
    c.restore();
  }
}

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k * 1.04);
  return `rgb(${r},${g},${Math.min(255, b)})`;
}

/* --------------------------------------------------------------------------
   Caméras et plans
   -------------------------------------------------------------------------- */
const CAM = {
  // par-dessus l'épaule, 16:9
  o0: { x: 962, y: 540, z: 1 },
  o1: { x: 944, y: 550, z: 1.035 },   // fin de « vise » : l'image du choix
  o2: { x: 912, y: 566, z: 1.08 },    // fin de « detente »
  o3: { x: 956, y: 544, z: 1.02 },    // fin de « baisse »
  // par-dessus l'épaule, téléphone
  p0: { x: 906, y: 548, z: 0.8 },
  p1: { x: 898, y: 552, z: 0.82 },
  p2: { x: 870, y: 566, z: 0.87 },
  p3: { x: 904, y: 550, z: 0.81 },
  // vue subjective, 16:9
  s0: { x: 690, y: 630, z: 1.07 },
  s1: { x: 684, y: 636, z: 1.1 },
  s2: { x: 672, y: 640, z: 1.16 },
  s3: { x: 688, y: 632, z: 1.08 },
  // vue subjective, téléphone
  t0: { x: 660, y: 640, z: 1.0 },
  t1: { x: 656, y: 644, z: 1.03 },
  t2: { x: 648, y: 648, z: 1.09 },
  t3: { x: 660, y: 640, z: 1.01 },
};
const camMix = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) });

// Un plan : caméra de A vers B ; en vue subjective, la respiration de la personne
const shot = (dur, A, B, pov, p) => ({
  dur,
  cam: (t, portrait) => {
    const c = camMix(CAM[(portrait ? (pov ? 't' : 'p') : pov ? 's' : 'o') + A], CAM[(portrait ? (pov ? 't' : 'p') : pov ? 's' : 'o') + B], seg(t, 0, dur, ease.inOut));
    if (pov) {
      const env = Math.sin(Math.PI * clamp(t / dur));
      c.y += env * 2.2 * Math.sin((t * TAU) / 4.2);
      c.x += env * 1.2 * Math.sin((t * TAU) / 6.3 + 1);
    }
    return c;
  },
  p: (t) => ({ ...p(t), pov }),
});

const vise = (t) => ({ arm: seg(t, 0.5, 3.0), sway: 0.35 });
const detente = (t) => ({ arm: 1, sway: 0.6 + 0.4 * seg(t, 0, 1.5) });
const baisse = (t) => ({ arm: 1 - seg(t, 0.3, 3.7), sway: 0.35 * (1 - seg(t, 0, 2)) });

/* --------------------------------------------------------------------------
   Le décor
   -------------------------------------------------------------------------- */
export default {
  id: 'visee',
  bg: '#1a1a20',
  home: { x: 960, y: 540, z: 1 },
  layers: {
    fond: { box: BOX, svg: fond(), filters: ['paint'] },
    bebe: { box: [390, 462, 450, 206], svg: bebe(), res: 1.6 },
    avant: { box: [290, 420, 720, 700], svg: avant(), res: 1.3 },
    bras: { box: [990, 450, 640, 460], svg: bras(), filters: ['b3'], par: 1.25 },
    epaule: { box: [1280, 180, 900, 1120], svg: epaule(), filters: ['paint', 'b10'], par: 1.3 },
    mains: { box: [660, 400, 1300, 900], svg: mains(), filters: ['soft'], par: 0 },
  },

  render(g, p, T) {
    const arm = clamp(p.arm ?? 1), pov = !!p.pov, sway = clamp(p.sway ?? 0);
    const breath = Math.sin((T * TAU) / 2.6);

    g.img('fond');

    // La tache de soleil vit : le rideau bouge à peine
    g.fx(1, (c) => {
      c.globalCompositeOperation = 'screen';
      const k = 0.1 + 0.03 * Math.sin(T * 0.7) + 0.02 * Math.sin(T * 1.9 + 1);
      const q = patchPt(160, 240);
      const gr = c.createRadialGradient(q[0], q[1], 20, q[0], q[1], 420);
      gr.addColorStop(0, `rgba(255,214,150,${k})`);
      gr.addColorStop(1, 'rgba(255,214,150,0)');
      c.fillStyle = gr;
      c.fillRect(q[0] - 420, q[1] - 420, 840, 840);
    });

    // Le bébé respire (la cage thoracique monte, très peu)
    g.img('bebe', { tf: { sy: 1 + 0.012 * breath, sx: 1 + 0.004 * breath, ox: HEAD[0] + 120, oy: HEAD[1] + 40 } });

    // Lumière douce, filtrée par le lin, sur le bébé
    g.fx(1, (c) => {
      c.globalCompositeOperation = 'screen';
      const k = 0.2 + 0.03 * Math.sin(T * 0.7);
      c.translate(HEAD[0] + 110, HEAD[1] + 10);
      c.rotate((BODY_ANG * Math.PI) / 180);
      c.scale(1, 0.42);
      const gr = c.createRadialGradient(-40, 0, 10, 0, 0, 260);
      gr.addColorStop(0, `rgba(255,218,168,${k})`);
      gr.addColorStop(0.6, `rgba(255,214,160,${k * 0.45})`);
      gr.addColorStop(1, 'rgba(255,214,160,0)');
      c.fillStyle = gr;
      c.fillRect(-300, -300, 600, 600);
    });

    g.img('avant');
    g.fx(1, (c) => mobile(c, T));

    // Rayons et poussière
    g.fx(1, (c) => {
      const R = rays();
      c.globalCompositeOperation = 'screen';
      c.imageSmoothingQuality = 'high';
      c.globalAlpha = 1;
      c.drawImage(R[0], BOX[0], BOX[1], BOX[2], BOX[3]);
      // les rais respirent, chacun à son rythme (le feuillage bouge dehors)
      c.globalAlpha = 0.75 + 0.25 * Math.sin(T * 0.53);
      c.drawImage(R[1], BOX[0], BOX[1], BOX[2], BOX[3]);
      c.globalAlpha = 0.75 + 0.25 * Math.sin(T * 0.41 + 2.2);
      c.drawImage(R[2], BOX[0], BOX[1], BOX[2], BOX[3]);
      c.globalAlpha = 1;
      dust(c, T);
    });

    // La fenêtre éblouit un peu : halo chaud dans le coin droit
    g.fx(1, (c) => {
      c.globalCompositeOperation = 'screen';
      const x = 1900, y = 220;
      const gr = c.createRadialGradient(x, y, 20, x, y, 520);
      gr.addColorStop(0, 'rgba(255,226,176,0.42)');
      gr.addColorStop(0.4, 'rgba(255,214,160,0.14)');
      gr.addColorStop(1, 'rgba(255,214,160,0)');
      c.fillStyle = gr;
      c.fillRect(x - 520, y - 520, 1040, 1040);
    });

    if (!pov) {
      // Le bras pivote autour de l'épaule : il monte depuis le bas du cadre
      // (bras le long du corps, l'arme vers le sol) jusqu'à la visée.
      // Tremblement infime quand il est levé.
      const k = 1 - arm;
      const tr = sway * (Math.sin(T * 5.3) * 0.6 + Math.sin(T * 8.9 + 1.3) * 0.4);
      const tr2 = sway * (Math.sin(T * 4.1 + 0.7) * 0.6 + Math.sin(T * 7.3 + 2.1) * 0.4);
      const ep = g.portrait ? PORTRAIT_SHIFT : { x: 0, y: 0 };
      const lift = 4 * breath - 10 * arm;
      g.img('bras', {
        tf: {
          ox: SH[0], oy: SH[1],
          x: ep.x + 1.2 * tr2 * arm, y: ep.y + lift + 1.4 * tr * arm,
          rot: -2.02 * k + 0.004 * tr * arm,
        },
      });
      // La personne : épaules qui respirent, qui se soulèvent avec le bras
      g.img('epaule', { tf: { x: ep.x, y: ep.y + lift, rot: -0.01 * arm, ox: 1640, oy: 900 } });
      // Halo de la fenêtre qui « mange » le bord de la silhouette
      g.fx(1.3, (c) => {
        c.globalCompositeOperation = 'screen';
        const x = 1880 + ep.x, y = 250;
        const gr = c.createRadialGradient(x, y, 30, x, y, 380);
        gr.addColorStop(0, 'rgba(255,224,170,0.1)');
        gr.addColorStop(1, 'rgba(255,224,170,0)');
        c.fillStyle = gr;
        c.fillRect(x - 360, y - 360, 720, 720);
      });
    } else {
      // Vue subjective : les mains montent depuis le bas du cadre
      const k = 1 - arm;
      const tr = sway * (Math.sin(T * 5.1) * 0.6 + Math.sin(T * 8.3 + 1) * 0.4);
      const tr2 = sway * (Math.sin(T * 3.7 + 0.4) * 0.6 + Math.sin(T * 6.9 + 2) * 0.4);
      const pp = g.portrait ? { x: 0, y: 30, rot: 0.06 } : { x: 0, y: 0, rot: 0 };
      g.img('mains', {
        par: 0,
        tf: {
          ox: POVG.x, oy: POVG.y,
          x: pp.x + 90 * k + 1.5 * tr2, y: pp.y + 720 * k + 1.8 * tr + 2.5 * breath,
          rot: pp.rot - 0.35 * k + 0.005 * tr,
        },
      });
    }
    // Étalonnage : ombres froides à gauche et en haut, la chaleur reste à droite
    g.screen((c, W, H) => {
      c.globalCompositeOperation = 'multiply';
      let gr = c.createLinearGradient(0, 0, W * 0.55, 0);
      gr.addColorStop(0, 'rgba(70,82,104,0.55)');
      gr.addColorStop(1, 'rgba(70,82,104,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      gr = c.createLinearGradient(0, 0, 0, H * 0.4);
      gr.addColorStop(0, 'rgba(80,90,112,0.35)');
      gr.addColorStop(1, 'rgba(80,90,112,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'soft-light';
      gr = c.createRadialGradient(W * 0.58, H * 0.42, 0, W * 0.58, H * 0.42, W * 0.5);
      gr.addColorStop(0, 'rgba(255,200,130,0.3)');
      gr.addColorStop(1, 'rgba(255,200,130,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
    });
  },

  shots: {
    vise: shot(5, 0, 1, false, vise),
    detente: shot(3, 1, 2, false, detente),
    baisse: shot(4, 1, 3, false, baisse),
    'vise-pov': shot(5, 0, 1, true, vise),
    'detente-pov': shot(3, 1, 2, true, detente),
    'baisse-pov': shot(4, 1, 3, true, baisse),
  },
};
