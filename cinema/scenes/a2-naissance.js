/* ==========================================================================
   Décor « a2-naissance » — gros plan : le nouveau-né de l'Acte 2, endormi
   dans les bras de A. Dernière image de l'Acte 2 quand le couple conçoit.

   Le bébé (quelques jours) est couché en diagonale, tête en haut à gauche,
   la nuque au creux du coude de A : la manche de maille terre cuite passe
   sous lui, et les doigts de A (peau mate) reviennent par-dessus la
   couverture vert d'eau, à droite. Le petit poing sorti du lange serre
   l'index de B (peau claire), qui vient d'en haut à droite.
   Matin d'automne : le soleil entre par la gauche (fenêtre sur le mur de
   gauche), lumière blanche et chaude, ombres bleutées. Derrière, flou, la
   chambre désormais aménagée : un lit à barreaux peint en crème, une tache
   de soleil sur le mur, une plante suspendue devant la fenêtre.

   Le bébé et la main de B sont dessinés dans le repère du bébé (x : en
   travers du corps, y : du crâne vers les pieds), puis couchés en diagonale.

   Paramètres (p) :
     dusk    0 → 1   la lumière baisse (fin de l'acte)
     grip    0 → 1   le poing serre le doigt (0,5 au repos)
     smile   0 → 1   sourire aux anges, dans le sommeil
     suck    0 → 1   petite tétée dans le sommeil
     rock    0 → 1   amplitude du bercement
   ========================================================================== */
import { P, rng } from '../kit.js';
import { TAU, clamp, lerp, seg, ease } from '../../film/engine.js';

const HOME = { x: 960, y: 540, z: 1 };

/* --------------------------------------------------------------------------
   Outils de tracé
   -------------------------------------------------------------------------- */
const n1 = (v) => Math.round(v * 10) / 10;
const norm = ([x, y]) => { const m = Math.hypot(x, y) || 1; return [x / m, y / m]; };
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

// Courbe lisse (Catmull-Rom → Bézier) passant par les points
function curve(pts, closed = false) {
  const n = pts.length;
  const g = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${n1(pts[0][0])},${n1(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += `C${n1(p1[0] + (p2[0] - p0[0]) / 6)},${n1(p1[1] + (p2[1] - p0[1]) / 6)} ` +
      `${n1(p2[0] - (p3[0] - p1[0]) / 6)},${n1(p2[1] - (p3[1] - p1[1]) / 6)} ${n1(p2[0])},${n1(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}

// Doigt, membre : contour d'un « boudin » le long d'un axe, rayons variables, bouts ronds
function tube(c, r) {
  const n = c.length, A = [], B = [];
  const tan = (i) => norm([c[Math.min(n - 1, i + 1)][0] - c[Math.max(0, i - 1)][0], c[Math.min(n - 1, i + 1)][1] - c[Math.max(0, i - 1)][1]]);
  for (let i = 0; i < n; i++) {
    const [tx, ty] = tan(i);
    A.push([c[i][0] - ty * r[i], c[i][1] + tx * r[i]]);
    B.push([c[i][0] + ty * r[i], c[i][1] - tx * r[i]]);
  }
  const cap = (i, angles) => {
    const [tx, ty] = tan(i), out = [];
    for (const a of angles) {
      const ca = Math.cos(a), sa = Math.sin(a);
      out.push([c[i][0] + r[i] * (ca * tx - sa * ty), c[i][1] + r[i] * (ca * ty + sa * tx)]);
    }
    return out;
  };
  const q = Math.PI / 4;
  return curve([...A, ...cap(n - 1, [q, 0, -q]), ...B.reverse(), ...cap(0, [-3 * q, Math.PI, 3 * q])], true);
}

const ell = (cx, cy, rx, ry) =>
  `M${n1(cx - rx)},${n1(cy)}A${rx},${ry} 0 1,0 ${n1(cx + rx)},${n1(cy)}A${rx},${ry} 0 1,0 ${n1(cx - rx)},${n1(cy)}Z`;

/* --------------------------------------------------------------------------
   Repère du bébé : centre de la tête, inclinaison
   -------------------------------------------------------------------------- */
const HX = 790, HY = 370, ROT = -58;
const RR = (ROT * Math.PI) / 180;
const UX = [Math.cos(RR), Math.sin(RR)];              // x local (vers le haut à droite de l'écran)
const UY = [-Math.sin(RR), Math.cos(RR)];             // y local (du crâne vers les pieds)
const at = (x, y) => [HX + x * UX[0] + y * UY[0], HY + x * UX[1] + y * UY[1]];
const GROUP = `translate(${HX} ${HY}) rotate(${ROT})`;

// Le soleil vient de la gauche (un peu d'en haut) ; dans le repère du bébé,
// il arrive presque du côté du crâne
const SUN_S = norm([-0.89, -0.45]);
const SUN_L = [SUN_S[0] * UX[0] + SUN_S[1] * UX[1], SUN_S[0] * UY[0] + SUN_S[1] * UY[1]];

/* --------------------------------------------------------------------------
   Filtres propres au décor : volume (bords dans l'ombre, cœur éclairé du
   côté de la fenêtre), ombre de bord, flous, grain de lavis
   -------------------------------------------------------------------------- */
const volF = (id, er, bl, k, L) =>
  `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%">` +
  `<feMorphology in="SourceGraphic" operator="erode" radius="${er}" result="e"/>` +
  `<feGaussianBlur in="e" stdDeviation="${bl}" result="b"/>` +
  `<feOffset in="b" dx="${n1(L[0] * k)}" dy="${n1(L[1] * k)}" result="o"/>` +
  `<feComposite in="o" in2="SourceAlpha" operator="in"/></filter>`;
// Ombre de bord : la forme, sauf son cœur éclairé (pour ombrer les motifs posés dessus)
const rimF = (id, er, bl, k, L) =>
  `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">` +
  `<feMorphology in="SourceAlpha" operator="erode" radius="${er}" result="e"/>` +
  `<feGaussianBlur in="e" stdDeviation="${bl}" result="b"/>` +
  `<feOffset in="b" dx="${n1(L[0] * k)}" dy="${n1(L[1] * k)}" result="o"/>` +
  `<feComposite in="SourceGraphic" in2="o" operator="out" result="r"/>` +
  `<feComposite in="r" in2="SourceAlpha" operator="in"/></filter>`;
const blurF = (id, s) =>
  `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
const texF = (id, freq, amp, seed) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 1" result="g"/>` +
  `<feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="${amp}" k2="${1 - amp / 2}" k3="0" k4="0" result="m"/>` +
  `<feComposite in="m" in2="SourceGraphic" operator="in"/></filter>`;
// Touche de brosse : la couleur n'apparaît que par plaques allongées
const brosse = (id, fx, fy, seed, gain = 3, cut = 1.25) =>
  `<filter id="${id}" filterUnits="objectBoundingBox" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="3" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${gain} 0 0 0 -${cut}" result="a"/>` +
  `<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>`;

const FX = [
  // repère du bébé (lumière du côté du crâne)
  volF('a2n-vs', 2, 3, 2, SUN_L), volF('a2n-vm', 5, 7, 5, SUN_L), volF('a2n-vl', 14, 18, 12, SUN_L),
  volF('a2n-hs', 4.5, 3, 4, SUN_L), volF('a2n-hm', 11, 8, 10, SUN_L), volF('a2n-hl', 40, 26, 34, SUN_L),
  rimF('a2n-rl', 16, 22, 16, SUN_L),
  // repère de l'écran (bras de A)
  volF('a2n-ws', 3, 4, 3, SUN_S), volF('a2n-wm', 8, 10, 8, SUN_S), volF('a2n-wl', 22, 26, 22, SUN_S),
  volF('a2n-ks', 6, 5, 6, SUN_S), volF('a2n-km', 16, 12, 16, SUN_S), volF('a2n-kl', 50, 34, 50, SUN_S),
  ...[1, 2, 3, 4, 6, 8, 12, 18, 24, 30, 45].map((s) => blurF(`a2n-f${s}`, s)),
  texF('a2n-peau', 0.013, 0.08, 4), texF('a2n-tissu', 0.05, 0.14, 9), texF('a2n-lavis', 0.02, 0.16, 12),
  texF('a2n-maille', 0.2, 0.3, 17),
  brosse('a2n-br1', 0.03, 0.01, 8), brosse('a2n-br2', 0.012, 0.04, 21, 3, 1.4),
].join('');

// Une forme en volume : ombre de bord, corps, reflet (repère du bébé : v/h, écran : w/k)
const vol = (d, shade, base, light, k = 'm', lo = 0.75, s = 'v') =>
  `<path d="${d}" fill="${shade}"/><path d="${d}" fill="${base}" filter="url(#a2n-${s}${k})"/>` +
  (light ? `<path d="${d}" fill="${light}" opacity="${lo}" filter="url(#a2n-${s === 'v' ? 'h' : 'k'}${k})"/>` : '');
const line = (d, color, w, op, blur = 2) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"${blur ? ` filter="url(#a2n-f${blur})"` : ''}/>`;
const P2 = (p) => `${n1(p[0])},${n1(p[1])}`;

/* --------------------------------------------------------------------------
   Calque : la chambre, très floue (repère de l'écran). Fenêtre lumineuse à
   gauche, plante suspendue, mur crème, tache de soleil sur le mur du fond,
   lit à barreaux peint en crème, parquet clair
   -------------------------------------------------------------------------- */
const grad = (id, x1, y1, x2, y2, s) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}">` +
  s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('') + '</linearGradient>';
const radial = (id, cx, cy, r, s) =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}">` +
  s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('') + '</radialGradient>';

const CRIB = { x0: 1480, x1: 2300, top: 392, bot: 860, post: 1500 };

const FOND = (() => {
  const r = rng(41);
  let s = `<defs>${FX}
    ${grad('a2n-mur', -240, 0, 2160, 0, [[0, '#f6eee0'], [0.2, '#e9dfcc'], [0.48, '#d2c5af'], [1, '#a39680']])}
    ${grad('a2n-mur-v', 0, -140, 0, 900, [[0, '#9a9080', 0.3], [0.45, '#9a9080', 0], [1, '#8a8274', 0.12]])}
    ${grad('a2n-sol', 0, 880, 0, 1220, [[0, '#d5ab7c'], [0.4, '#c79a6b'], [1, '#a77a52']])}
    ${grad('a2n-vitre', 0, -140, 0, 700, [[0, '#fffaf0'], [0.6, '#fff6e6'], [1, '#f8ead2']])}
    ${radial('a2n-halo', -60, 260, 1300, [[0, '#fff4dc', 0.4], [0.35, '#fbe8c8', 0.14], [1, '#f6e2c0', 0]])}
    <linearGradient id="a2n-bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fffdf6"/><stop offset=".4" stop-color="#f3ece0"/><stop offset=".85" stop-color="#cfc4b2"/><stop offset="1" stop-color="#b8ad9a"/></linearGradient>
  </defs>`;
  // le mur crème, plus clair près de la fenêtre
  s += `<rect x="-240" y="-140" width="2400" height="1360" fill="url(#a2n-mur)"/>`;
  s += `<rect x="-240" y="-140" width="2400" height="1360" fill="url(#a2n-mur-v)"/>`;
  // grandes variations de teinte (lavis)
  for (let i = 0; i < 14; i++) {
    const x = -200 + r() * 2300, y = -100 + r() * 1000, rx = 160 + r() * 280, ry = 120 + r() * 200;
    const c = x < 700 ? '#fff6e6' : r() < 0.6 ? '#cfc2ad' : '#efe4d0';
    s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${c}" opacity=".3" filter="url(#a2n-f45)"/>`;
  }
  // la tache de soleil sur le mur du fond : l'image de la fenêtre, avec l'ombre
  // du montant et des feuilles de la plante
  s += `<g filter="url(#a2n-f18)">`;
  s += `<path d="M1470,-40 L1990,-110 L2070,300 L1520,350 Z" fill="#fff2d6" opacity=".85"/>`;
  s += `<path d="M1716,-76 L1756,-82 L1830,316 L1790,320 Z" fill="#c9bba4" opacity=".7"/>`;
  for (let i = 0; i < 9; i++) {
    const x = 1520 + r() * 480, y = -60 + r() * 240, rr = 16 + r() * 26;
    s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rr * 1.4)}" ry="${n1(rr)}" transform="rotate(${n1(r() * 180)} ${n1(x)} ${n1(y)})" fill="#d8cab2" opacity=".55"/>`;
  }
  s += `</g>`;
  // plinthe et parquet clair
  s += `<rect x="-240" y="858" width="2400" height="30" fill="#efe7da" filter="url(#a2n-f6)"/>`;
  s += `<rect x="-240" y="884" width="2400" height="340" fill="url(#a2n-sol)"/>`;
  for (let x = -400; x < 2400; x += 150) s += line(`M${x},884L${n1(x + (x - 900) * 0.55)},1220`, '#9c7149', 5, 0.25, 6);
  s += `<rect x="-240" y="884" width="2400" height="40" fill="#7a6a5a" opacity=".22" filter="url(#a2n-f12)"/>`;
  // la fenêtre : vitre éblouissante, croisée, embrasure prise dans le soleil
  s += `<g filter="url(#a2n-f8)">`;
  s += `<rect x="-240" y="-140" width="560" height="830" fill="url(#a2n-vitre)"/>`;
  s += `<rect x="80" y="-140" width="34" height="830" fill="#ddd0b9" opacity=".8"/>`;
  s += `<rect x="-240" y="250" width="560" height="28" fill="#ddd0b9" opacity=".7"/>`;
  s += `<path d="M320,-140 L430,-140 L430,700 L320,690 Z" fill="#f3e7d1"/>`;
  s += `<path d="M430,-140 L446,-140 L446,700 L430,700 Z" fill="#c9bba3" opacity=".6"/>`;
  s += `<rect x="-240" y="690" width="690" height="34" fill="#f3e8d4"/>`;
  s += `<rect x="-240" y="724" width="690" height="60" fill="#a99c88" opacity=".45"/>`;
  s += `</g>`;
  // voilage blanc cassé, tiré contre l'embrasure : quelques plis doux
  s += `<g filter="url(#a2n-f12)">`;
  s += `<path d="M300,-140 C330,200 300,500 330,760 L470,760 C450,500 470,200 450,-140 Z" fill="#fbf4e6" opacity=".8"/>`;
  for (const [x, w, c, o] of [[322, 26, '#e0d2ba', 0.6], [372, 18, '#fffaf0', 0.8], [410, 22, '#d8c9b0', 0.5]]) {
    s += `<path d="M${x},-140 C${x + 14},200 ${x - 8},500 ${x + 10},760 L${x + w + 10},760 C${x + w - 8},500 ${x + w + 14},200 ${x + w},-140 Z" fill="${c}" opacity="${o}"/>`;
  }
  s += `</g>`;
  // plante suspendue devant la vitre : pot crème au bout d'un cordon, tiges qui
  // retombent, feuilles en cœur à contre-jour
  s += `<g filter="url(#a2n-f5)">`;
  s += line('M170,-140L172,-6M226,-140L218,-6', '#b7a88f', 3, 0.8, 0);
  s += `<path d="M118,-12 L272,-12 L258,64 C250,92 140,92 132,64 Z" fill="#e2d6c1"/><path d="M118,-12 L272,-12 L270,0 L120,0 Z" fill="#cbbda4"/>`;
  s += `<path d="M132,64 C150,88 240,88 258,64" fill="none" stroke="#b3a48b" stroke-width="10" opacity=".6"/>`;
  const vines = [[150, 60, 110, 330], [196, 70, 236, 420], [240, 60, 330, 250], [130, 50, 40, 260], [180, 70, 160, 520], [220, 70, 290, 470]];
  for (const [x0, y0, x1, y1] of vines) {
    const pts = [];
    for (let k = 0; k <= 9; k++) {
      const u = k / 9;
      pts.push([lerp(x0, x1, u) + Math.sin(u * 4 + x0) * 14, lerp(y0, y1, u * u * 0.3 + u * 0.7)]);
    }
    s += line(curve(pts), '#5f7150', 3.5, 0.75, 0);
    for (let k = 1; k <= 9; k++) {
      const [x, y] = pts[k], side = k % 2 ? 1 : -1, a = 90 + side * (35 + r() * 35);
      const L = (54 - k * 3) * (0.8 + r() * 0.4);
      s += `<path d="M0,0 C${n1(L * 0.3)},${n1(-L * 0.5)} ${n1(L * 0.95)},${n1(-L * 0.42)} ${n1(L * 1.1)},0 C${n1(L * 0.95)},${n1(L * 0.42)} ${n1(L * 0.3)},${n1(L * 0.5)} 0,0 Z" ` +
        `transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(a)})" fill="${r() < 0.45 ? '#87a06c' : r() < 0.6 ? '#5c7450' : '#6f875c'}" opacity=".95"/>`;
    }
  }
  s += `</g>`;
  // le lit à barreaux, peint en crème : ombre sur le mur, barreaux, barre du haut
  s += `<g filter="url(#a2n-f6)">`;
  s += `<path d="M${CRIB.x0 + 40},${CRIB.top + 20} L2300,${CRIB.top + 10} L2300,${CRIB.bot} L${CRIB.x0 + 60},${CRIB.bot} Z" fill="#7d7262" opacity=".35" transform="translate(46 22)"/>`;
  s += `<rect x="${CRIB.x0}" y="${CRIB.top + 30}" width="${CRIB.x1 - CRIB.x0}" height="${CRIB.bot - CRIB.top - 60}" fill="#e9dfcc" opacity=".7"/>`;
  for (let x = CRIB.post + 60; x < CRIB.x1; x += 64) {
    s += `<rect x="${x - 12}" y="${CRIB.top + 20}" width="24" height="${CRIB.bot - CRIB.top - 40}" rx="10" fill="url(#a2n-bar)"/>`;
  }
  s += `<rect x="${CRIB.post - 28}" y="${CRIB.top - 90}" width="56" height="${CRIB.bot - CRIB.top + 110}" rx="24" fill="url(#a2n-bar)"/>`;
  s += `<rect x="${CRIB.post - 28}" y="${CRIB.top - 90}" width="56" height="14" rx="7" fill="#fffdf6"/>`;
  s += `<rect x="${CRIB.x0}" y="${CRIB.top}" width="${CRIB.x1 - CRIB.x0}" height="38" rx="14" fill="#efe7da"/>`;
  s += `<rect x="${CRIB.x0}" y="${CRIB.top}" width="${CRIB.x1 - CRIB.x0}" height="10" rx="5" fill="#fffaf0"/>`;
  s += `<rect x="${CRIB.x0}" y="${CRIB.bot - 40}" width="${CRIB.x1 - CRIB.x0}" height="40" rx="12" fill="#ddd2c0"/>`;
  // une couverture pliée sur la barre (jaune paille très pâle)
  s += `<path d="M1620,${CRIB.top - 18} C1690,${CRIB.top - 30} 1760,${CRIB.top - 28} 1820,${CRIB.top - 14} L1832,${CRIB.top + 210} C1760,${CRIB.top + 224} 1690,${CRIB.top + 220} 1630,${CRIB.top + 206} Z" fill="#efdfb8"/>`;
  s += `<path d="M1630,${CRIB.top + 30} C1690,${CRIB.top + 44} 1760,${CRIB.top + 44} 1828,${CRIB.top + 30}" fill="none" stroke="#cdb98e" stroke-width="12" opacity=".6"/>`;
  s += `</g>`;
  // halo de la fenêtre sur toute la pièce
  s += `<rect x="-240" y="-140" width="2400" height="1360" fill="url(#a2n-halo)"/>`;
  return s;
})();

/* --------------------------------------------------------------------------
   Calque : le bras de A (repère de l'écran). La manche de gilet en maille
   terre cuite arrive de la gauche, plie au coude sous la tête du bébé, puis
   l'avant-bras file sous le lange vers le bas à droite. Dessous, flou, le
   pantalon crème de A (ses genoux)
   -------------------------------------------------------------------------- */
const A_SKIN = { base: '#c9946f', shade: '#9e6d4f', light: '#e0b08a', deep: '#7c5039' };
const B_SKIN = { base: '#e8bfa0', shade: '#c4927a', light: '#f8dcc4', deep: '#a8735e' };
const TERRA = { base: '#b5654a', shade: '#86402d', light: '#dc8d68', deep: '#5e2a1c' };

const ARM_C = [[-320, 556], [-40, 570], [240, 600], [470, 652], [640, 714], [800, 786], [960, 868], [1120, 958], [1290, 1060], [1460, 1170]];
const ARM_R = [172, 162, 170, 160, 150, 140, 128, 122, 118, 116];
const SLEEVE_D = tube(ARM_C, ARM_R);
// Décalage d'une courbe le long de sa normale (côtes de la maille, plis)
function offset(c, o) {
  return c.map((p, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
    const [tx, ty] = norm([b[0] - a[0], b[1] - a[1]]);
    return [p[0] - ty * o, p[1] + tx * o];
  });
}
// Point de l'axe du bras (u de 0 à 1) et sa normale
function armAt(u) {
  const n = ARM_C.length - 1, k = Math.min(n - 1, Math.floor(u * n)), f = u * n - k;
  const a = ARM_C[k], b = ARM_C[k + 1];
  const [tx, ty] = norm([b[0] - a[0], b[1] - a[1]]);
  return { p: [lerp(a[0], b[0], f), lerp(a[1], b[1], f)], t: [tx, ty], n: [-ty, tx], r: lerp(ARM_R[k], ARM_R[k + 1], f) };
}

const BRAS = (() => {
  const r = rng(63);
  let s = `<defs>${FX}
    ${volF('a2n-wx', 40, 50, 40, SUN_S)}${volF('a2n-kx', 95, 60, 80, SUN_S)}
    <clipPath id="a2n-c-manche"><path d="${SLEEVE_D}"/></clipPath>
    ${grad('a2n-genoux', -260, 700, 900, 1240, [[0, '#d8c7a8'], [0.5, '#c7b496'], [1, '#a8957a']])}
    ${grad('a2n-g-pdc', 60, 0, 520, 0, [[0, '#000'], [1, '#fff']])}
    <mask id="a2n-m-pdc" maskUnits="userSpaceOnUse" x="-300" y="300" width="2600" height="1000"><rect x="-300" y="300" width="2600" height="1000" fill="url(#a2n-g-pdc)"/></mask>
    ${grad('a2n-g-rim', 200, 0, 760, 0, [[0, '#fff'], [1, '#000']])}
    <mask id="a2n-m-rim" maskUnits="userSpaceOnUse" x="-300" y="300" width="2600" height="1000"><rect x="-300" y="300" width="2600" height="1000" fill="url(#a2n-g-rim)"/></mask>
  </defs>`;
  // les genoux de A, sous le bébé, très flous et dans l'ombre du bras
  s += `<g filter="url(#a2n-f18)">`;
  s += `<path d="M-260,700 C200,690 700,780 1100,960 C1360,1060 1760,1010 2160,960 L2160,1240 L-260,1240 Z" fill="url(#a2n-genoux)"/>`;
  s += `<ellipse cx="60" cy="900" rx="520" ry="150" fill="#f1e3c9" opacity=".5"/>`;
  for (const [d, k] of [['M-200,880 C120,850 420,900 640,1010', 1], ['M-120,1000 C200,980 480,1030 640,1130', 0.8], ['M-240,1100 C40,1090 260,1120 420,1200', 0.6]]) {
    s += line(d, '#8f7b60', 44, 0.3 * k, 0);
    s += `<path d="${d}" transform="translate(-6 -26)" fill="none" stroke="#f6ebd6" stroke-width="26" stroke-linecap="round" opacity="${0.35 * k}"/>`;
  }
  s += line('M1300,1080 C1600,1040 1900,1030 2160,1040', '#a8977c', 40, 0.3, 0);
  s += `</g>`;
  // ombre portée du bras sur les genoux
  s += `<path d="${SLEEVE_D}" transform="translate(30 70)" fill="#3e302c" opacity=".4" filter="url(#a2n-f30)"/>`;
  // le poignet nu, qui file sous le lange
  // la manche : volume, maille, plis
  let m = `<path d="${SLEEVE_D}" fill="${TERRA.shade}"/>`;
  m += `<path d="${SLEEVE_D}" fill="${TERRA.base}" filter="url(#a2n-wx)"/>`;
  m += `<path d="${SLEEVE_D}" fill="${TERRA.light}" opacity=".5" filter="url(#a2n-kx)"/>`;
  m += `<g clip-path="url(#a2n-c-manche)">`;
  // touches de brosse : plaques plus chaudes et plus sombres
  for (let i = 0; i < 10; i++) {
    const A = armAt(0.05 + i * 0.1), o = (r() - 0.5) * 160;
    m += `<ellipse cx="${n1(A.p[0] + A.n[0] * o)}" cy="${n1(A.p[1] + A.n[1] * o)}" rx="${n1(80 + r() * 90)}" ry="${n1(50 + r() * 50)}" fill="${r() < 0.5 ? '#cf7a5a' : '#7a3626'}" opacity=".22" filter="url(#a2n-f24)"/>`;
  }
  // côtes de la maille, discrètes, le long du bras
  for (let o = -160; o <= 160; o += 20) {
    const c = offset(ARM_C, o + (r() - 0.5) * 4);
    m += `<path d="${curve(c)}" fill="none" stroke="#6b2f20" stroke-width="3" opacity=".16" filter="url(#a2n-f2)"/>`;
    m += `<path d="${curve(offset(c, 5))}" fill="none" stroke="#eaa27e" stroke-width="2" opacity=".1" filter="url(#a2n-f2)"/>`;
  }
  // longs plis souples sur le haut du bras, et la maille qui fronce au coude
  const drape = [[0.02, 0.32, -60, 1], [0.05, 0.36, 40, 0.8], [0.08, 0.3, 110, 0.6], [0.7, 0.98, 50, 0.6]];
  for (const [u0, u1, o, k] of drape) {
    const pts = [];
    for (let i = 0; i <= 6; i++) { const A = armAt(lerp(u0, u1, i / 6)); const oo = o + 12 * Math.sin(i * 1.3 + o); pts.push([A.p[0] + A.n[0] * oo, A.p[1] + A.n[1] * oo]); }
    m += line(curve(pts), TERRA.deep, 46, 0.22 * k, 18);
    m += `<path d="${curve(pts)}" transform="translate(-10 -22)" fill="none" stroke="#e8a07a" stroke-width="26" stroke-linecap="round" opacity="${n1(0.22 * k)}" filter="url(#a2n-f12)"/>`;
  }
  const folds = [[0.47, -1, 1], [0.53, 1, 0.8], [0.58, -1, 0.9], [0.63, 1, 0.6], [0.42, 1, 0.5]];
  for (const [u, sd, k] of folds) {
    const A = armAt(u), B = armAt(u + 0.03 * sd);
    const p0 = [A.p[0] + A.n[0] * A.r * 0.98, A.p[1] + A.n[1] * A.r * 0.98];
    const p1 = [B.p[0] + B.n[0] * A.r * 0.3, B.p[1] + B.n[1] * A.r * 0.3];
    const p2 = [A.p[0] - A.n[0] * A.r * 0.2 + A.t[0] * 20 * sd, A.p[1] - A.n[1] * A.r * 0.2 + A.t[1] * 20 * sd];
    const d = curve([p0, p1, p2]);
    m += line(d, TERRA.deep, 18, 0.45 * k, 6);
    m += `<path d="${d}" transform="translate(-10 -7)" fill="none" stroke="#e8a07a" stroke-width="9" stroke-linecap="round" opacity="${n1(0.42 * k)}" filter="url(#a2n-f4)"/>`;
  }
  // le poignet côtelé
  const C1 = armAt(0.9), C2 = armAt(0.995);
  const cuff = [
    [C1.p[0] + C1.n[0] * C1.r, C1.p[1] + C1.n[1] * C1.r], [C2.p[0] + C2.n[0] * C2.r * 1.02, C2.p[1] + C2.n[1] * C2.r * 1.02],
    [C2.p[0] - C2.n[0] * C2.r * 1.02, C2.p[1] - C2.n[1] * C2.r * 1.02], [C1.p[0] - C1.n[0] * C1.r, C1.p[1] - C1.n[1] * C1.r],
  ];
  m += `<path d="M${cuff.map(P2).join('L')}Z" fill="#9a5039" opacity=".55"/>`;
  for (let i = 0; i <= 16; i++) {
    const w = -1 + (2 * i) / 16;
    m += line(`M${P2([C1.p[0] + C1.n[0] * C1.r * w, C1.p[1] + C1.n[1] * C1.r * w])}L${P2([C2.p[0] + C2.n[0] * C2.r * w, C2.p[1] + C2.n[1] * C2.r * w])}`, '#5e2a1c', 3, 0.3, 1);
  }
  // ombre de la tête et du lange sur la manche, au creux du coude
  m += `<ellipse cx="720" cy="600" rx="240" ry="110" transform="rotate(30 720 600)" fill="#4a2018" opacity=".5" filter="url(#a2n-f24)"/>`;
  m += `<path d="M760,660 L1300,980 L1240,1080 L700,760 Z" fill="#4a2018" opacity=".4" filter="url(#a2n-f18)"/>`;
  // liseré de lumière : le bord de la manche tourné vers la fenêtre
  const top = curve(offset(ARM_C.slice(0, 7), -ARM_R[2] + 10));
  m += `<g mask="url(#a2n-m-rim)">${line(top, '#ffc89c', 34, 0.32, 14)}${line(top, '#ffe6cc', 6, 0.25, 4)}</g>`;
  m += `</g>`;
  // le haut du bras, plus près de nous, est flou ; le coude, sous la tête, est net
  s += `<g filter="url(#a2n-maille)"><g filter="url(#a2n-f8)">${m}</g><g mask="url(#a2n-m-pdc)">${m}</g></g>`;
  // duvet de la maille qui accroche la lumière, sur le bord
  s += `<g mask="url(#a2n-m-rim)">${line(curve(offset(ARM_C.slice(0, 7), -ARM_R[2] - 2)), '#f6c39a', 6, 0.22, 5)}</g>`;
  return s;
})();

/* --------------------------------------------------------------------------
   Calque : le lange (repère du bébé). Couverture vert d'eau pâle à petits
   points crème : un nid derrière la tête, le corps emmailloté, le pan qui
   croise sur la poitrine. Les doigts de A reviennent par-dessus, à droite
   -------------------------------------------------------------------------- */
const MINT = { base: '#cfe0d6', shade: '#8aa39d', deep: '#5f7a76', light: '#f6f4e6' };
const NEST_D = curve([[-236, 30], [-226, -40], [-195, -95], [-120, -128], [0, -135], [120, -128], [195, -95], [226, -40], [236, 30],
  [222, 120], [150, 200], [0, 230], [-150, 200], [-222, 120]], true);
const bend = ([x, y]) => [x - Math.max(0, y - 760) * 0.55, y];
const BODY_PTS = [[-200, 90], [-240, 170], [-262, 290], [-272, 440], [-268, 610], [-255, 790], [-232, 970], [-198, 1140], [-140, 1300],
  [-50, 1390], [60, 1390], [150, 1300], [205, 1140], [238, 970], [258, 790], [270, 610], [274, 440], [264, 290], [244, 170], [205, 90],
  [140, 150], [70, 185], [0, 195], [-70, 185], [-140, 150]].map(bend);
const BODY_D = curve(BODY_PTS, true);
// Bord du pan qui croise : de sous le menton jusqu'à la hanche droite (côté +x)
const FLAP_EDGE = [[-30, 184], [40, 262], [100, 330], [150, 388], [210, 462], [271, 560]];
const FLAP_D = curve([...FLAP_EDGE, ...[[270, 610], [258, 790], [238, 970], [205, 1140], [150, 1300], [60, 1390], [-50, 1390], [-140, 1300],
  [-198, 1140], [-232, 970], [-255, 790], [-268, 610], [-272, 440], [-262, 290], [-240, 170], [-200, 90], [-140, 150], [-80, 182]].map(bend)], true);

// Doigts de A, posés sur le lange (bout vers -x)
const A_FINGERS = [
  { c: [[300, 506], [246, 498], [190, 494], [146, 500]], r: [24, 22.5, 20.5, 18.5] },
  { c: [[302, 552], [240, 548], [178, 550], [126, 562]], r: [24.5, 23, 21, 19] },
  { c: [[298, 598], [238, 600], [184, 608], [142, 622]], r: [23.5, 22, 20, 18] },
  { c: [[288, 642], [244, 650], [204, 662], [178, 676]], r: [20.5, 19, 17.5, 16] },
].map((f) => ({ ...f, d: tube(f.c, f.r) }));
const A_BACK_D = curve([[236, 484], [288, 476], [318, 504], [328, 572], [322, 640], [306, 690], [270, 714], [236, 706]], true);

const LANGE = (() => {
  const r = rng(17);
  let s = `<defs>${FX}
    ${volF('a2n-vx', 40, 50, 36, SUN_L)}${volF('a2n-hx', 90, 60, 80, SUN_L)}
    <clipPath id="a2n-c-corps"><path d="${BODY_D}"/></clipPath>
    <clipPath id="a2n-c-nid"><path d="${NEST_D}"/></clipPath>
  </defs><g transform="${GROUP}">`;
  // le dos de la main de A, derrière le lange (on ne le voit qu'au-delà du bord)
  s += `<g filter="url(#a2n-f2)">${vol(A_BACK_D, '#7a5440', '#a87a5c', null, 'm')}</g>`;
  // le nid de couverture derrière la tête
  s += '<g filter="url(#a2n-tissu)">';
  s += vol(NEST_D, MINT.shade, MINT.base, MINT.light, 'l', 0.6);
  s += `<g clip-path="url(#a2n-c-nid)">`;
  for (let y = -130; y < 230; y += 44) for (let x = -236; x < 236; x += 46) {
    const px = x + (r() - 0.5) * 16 + ((y / 44) % 2 ? 23 : 0), py = y + (r() - 0.5) * 14;
    s += `<circle cx="${n1(px)}" cy="${n1(py)}" r="${n1(4.2 + r() * 1.6)}" fill="#f7f1e2" opacity=".85"/>`;
  }
  s += `</g>`;
  s += `<path d="${NEST_D}" fill="${MINT.deep}" opacity=".5" filter="url(#a2n-rl)"/>`;
  // ourlet roulé du nid, pris dans la lumière du côté de la fenêtre
  s += line('M-232,60C-236,0 -222,-60 -190,-100', MINT.light, 14, 0.6, 4);
  s += line('M232,60C236,0 222,-60 190,-100', '#e8eee2', 10, 0.35, 4);
  s += '</g>';
  // le corps emmailloté
  s += '<g filter="url(#a2n-tissu)">';
  s += `<path d="${BODY_D}" fill="${MINT.shade}"/><path d="${BODY_D}" fill="${MINT.base}" filter="url(#a2n-vx)"/>`;
  s += `<path d="${BODY_D}" fill="${MINT.light}" opacity=".5" filter="url(#a2n-hx)"/>`;
  s += `<g clip-path="url(#a2n-c-corps)">`;
  // grandes variations (lavis)
  for (let i = 0; i < 8; i++) {
    const x = (r() - 0.5) * 460, y = 200 + r() * 1100;
    s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(90 + r() * 120)}" ry="${n1(60 + r() * 90)}" fill="${r() < 0.5 ? '#e4ece0' : '#b3c7c0'}" opacity=".35" filter="url(#a2n-f30)"/>`;
  }
  // le pan inférieur (sous le pan qui croise) : ombre de contact le long du bord
  s += line(curve(FLAP_EDGE.map(([x, y]) => [x + 12, y - 10])), MINT.deep, 22, 0.5, 8);
  // le pan qui croise : un second volume, un peu plus clair
  s += `<path d="${FLAP_D}" fill="${MINT.shade}" opacity=".9"/>`;
  s += `<path d="${FLAP_D}" fill="${MINT.base}" filter="url(#a2n-vx)"/>`;
  s += `<path d="${FLAP_D}" fill="${MINT.light}" opacity=".45" filter="url(#a2n-hx)"/>`;
  // points crème semés
  for (let y = 120; y < 1400; y += 44) for (let x = -470; x < 290; x += 46) {
    const px = x + (r() - 0.5) * 16 + ((y / 44) % 2 ? 23 : 0), py = y + (r() - 0.5) * 14;
    s += `<circle cx="${n1(px)}" cy="${n1(py)}" r="${n1(4.2 + r() * 1.6)}" fill="#f7f1e2" opacity=".85"/>`;
  }
  // plis doux du pan : ombre du côté des pieds, lumière du côté de la tête
  const PL = [
    'M-262,520C-180,540 -100,590 -20,660', 'M-250,760C-150,780 -40,830 60,900', 'M60,620C120,700 170,780 230,860',
    'M-150,330C-110,380 -60,420 0,450', 'M-230,1000C-120,1040 0,1080 120,1160', 'M150,1000C170,1060 190,1120 200,1180',
  ];
  for (const d of PL) {
    s += line(d, MINT.deep, 20, 0.35, 8);
    s += `<path d="${d}" transform="translate(${n1(SUN_L[0] * 12)} ${n1(SUN_L[1] * 12)})" fill="none" stroke="${MINT.light}" stroke-width="10" stroke-linecap="round" opacity=".55" filter="url(#a2n-f6)"/>`;
  }
  // l'ourlet du pan, roulé, attrape la lumière
  s += `<path d="${curve(FLAP_EDGE)}" fill="none" stroke="#f9f6ea" stroke-width="9" stroke-linecap="round" opacity=".75" filter="url(#a2n-f2)"/>`;
  s += `<path d="${curve(FLAP_EDGE.map(([x, y]) => [x - 9, y + 8]))}" fill="none" stroke="${MINT.shade}" stroke-width="6" opacity=".5" filter="url(#a2n-f3)"/>`;
  // le col sous le menton : un repli
  s += line('M-200,120C-120,190 -40,214 40,214C110,212 170,184 230,140', MINT.deep, 18, 0.35, 8);
  s += line('M-196,110C-120,176 -40,200 40,200C110,198 166,172 226,130', MINT.light, 7, 0.5, 3);
  s += `</g>`;
  // ombre de bord sur tout le corps (assombrit aussi les points côté ombre)
  s += `<path d="${BODY_D}" fill="${MINT.deep}" opacity=".55" filter="url(#a2n-rl)"/>`;
  s += '</g>';
  // les doigts de A, par-dessus : ombre portée, volume, plis, ongles
  s += `<g transform="translate(-6 16)" fill="#3c5450" opacity=".42" filter="url(#a2n-f8)">${A_FINGERS.map((f) => `<path d="${f.d}"/>`).join('')}</g>`;
  s += '<g filter="url(#a2n-peau)">';
  for (const f of A_FINGERS) s += vol(f.d, A_SKIN.shade, A_SKIN.base, A_SKIN.light, 'm', 0.6);
  // sang sous la peau : jointures et bouts des doigts un peu plus rouges
  for (const f of A_FINGERS) {
    const [, m1, m2, tp] = f.c;
    for (const [p, rr, o] of [[m1, f.r[1] * 0.8, 0.22], [[lerp(m2[0], tp[0], 0.3), lerp(m2[1], tp[1], 0.3)], f.r[2] * 0.7, 0.18], [tp, f.r[3] * 0.8, 0.25]]) {
      s += `<ellipse cx="${n1(p[0])}" cy="${n1(p[1])}" rx="${n1(rr)}" ry="${n1(rr * 0.8)}" fill="#b8664c" opacity="${o}" filter="url(#a2n-f4)"/>`;
    }
  }
  for (const f of A_FINGERS) {
    const [b, m1, m2, tp] = f.c;
    // plis des articulations, en travers du doigt
    for (const [p, w] of [[[lerp(m1[0], m2[0], 0.1), lerp(m1[1], m2[1], 0.1)], f.r[1] * 0.75], [[lerp(m2[0], tp[0], 0.25), lerp(m2[1], tp[1], 0.25)], f.r[2] * 0.6]]) {
      s += line(`M${n1(p[0] + 3)},${n1(p[1] - w)}C${n1(p[0] - 2)},${n1(p[1] - w * 0.3)} ${n1(p[0] - 2)},${n1(p[1] + w * 0.3)} ${n1(p[0] + 3)},${n1(p[1] + w)}`, A_SKIN.deep, 2.2, 0.4, 1);
    }
    // ongle, près du bout
    const nx = tp[0] + 12, ny = tp[1] - 1;
    s += `<ellipse cx="${n1(nx)}" cy="${n1(ny)}" rx="${n1(f.r[3] * 0.72)}" ry="${n1(f.r[3] * 0.6)}" fill="#dcae95" opacity=".85"/>`;
    s += `<ellipse cx="${n1(nx - 3)}" cy="${n1(ny - 3)}" rx="${n1(f.r[3] * 0.35)}" ry="${n1(f.r[3] * 0.22)}" fill="#f6dccb" opacity=".6" filter="url(#a2n-f1)"/>`;
    // jointure entre les doigts, là où ils sortent de derrière le lange
    s += line(`M${n1(b[0] - 6)},${n1(b[1] + f.r[0] * 0.9)}L${n1(b[0] - 36)},${n1(b[1] + f.r[0] * 0.9)}`, A_SKIN.deep, 3, 0.4, 2);
  }
  s += '</g>';
  return s + '</g>';
})();

/* --------------------------------------------------------------------------
   Calque : la tête (repère du bébé) — visage de nouveau-né, un peu fripé,
   bonnet de maille crème à revers côtelé, quelques cheveux sombres qui
   dépassent. Les yeux, les sourcils et la bouche sont dessinés à chaque image
   -------------------------------------------------------------------------- */
const SKIN = { base: '#f0c4a8', shade: '#cf947a', light: '#fbdcc6', deep: '#b97a64' };
const CREAM = { base: '#efe6d4', shade: '#c4b399', light: '#fffaf0', deep: '#a39279' };
const HEAD_D = curve([[0, -166], [70, -158], [122, -124], [148, -70], [155, -10], [154, 50], [144, 102], [116, 140], [66, 162], [0, 170],
  [-66, 162], [-116, 140], [-144, 102], [-154, 50], [-155, -10], [-148, -70], [-122, -124], [-70, -158]], true);
const BONNET_OUT = [[-168, 66], [-175, -10], [-165, -92], [-129, -153], [-68, -189], [0, -198], [68, -189], [129, -153], [165, -92], [175, -10], [168, 66]];
const BRIM = [[-151, 68], [-148, 20], [-133, -22], [-96, -50], [-48, -64], [0, -68], [48, -64], [96, -50], [133, -22], [148, 20], [151, 68]];
const CUFF = [[-162, 60], [-160, 2], [-148, -46], [-110, -84], [-56, -103], [0, -108], [56, -103], [110, -84], [148, -46], [160, 2], [162, 60]];
const BONNET_D = curve([...BONNET_OUT, ...BRIM.slice().reverse()], true);
const CUFF_D = curve([...CUFF, ...BRIM.slice().reverse()], true);

const TETE = (() => {
  const r = rng(29);
  let s = `<defs>${FX}
    <radialGradient id="a2n-joue"><stop offset="0" stop-color="#ec9583" stop-opacity=".75"/><stop offset=".5" stop-color="#ee9c8c" stop-opacity=".33"/><stop offset="1" stop-color="#ee9c8c" stop-opacity="0"/></radialGradient>
    <linearGradient id="a2n-modele" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2e2" stop-opacity=".15"/><stop offset=".5" stop-color="#e7a98e" stop-opacity="0"/><stop offset="1" stop-color="#b06c5e" stop-opacity=".45"/></linearGradient>
    <linearGradient id="a2n-froid" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#8287a8" stop-opacity=".42"/><stop offset=".5" stop-color="#8a8fae" stop-opacity="0"/></linearGradient>
    <clipPath id="a2n-c-tete"><path d="${HEAD_D}"/></clipPath>
    <clipPath id="a2n-c-bonnet"><path d="${BONNET_D}"/></clipPath>
    <clipPath id="a2n-c-revers"><path d="${CUFF_D}"/></clipPath>
  </defs><g transform="${GROUP}">`;
  // ombre de la tête sur le nid et le col
  s += `<path d="${HEAD_D}" transform="translate(-10 26)" fill="#3e5651" opacity=".38" filter="url(#a2n-f12)"/>`;
  s += '<g filter="url(#a2n-peau)">';
  s += vol(HEAD_D, SKIN.shade, SKIN.base, SKIN.light, 'l', 0.45);
  s += `<path d="${HEAD_D}" fill="url(#a2n-modele)"/><path d="${HEAD_D}" fill="url(#a2n-froid)"/>`;
  s += `<g clip-path="url(#a2n-c-tete)">`;
  // rougeurs de nouveau-né, irrégulières
  for (let i = 0; i < 7; i++) {
    const x = (r() - 0.5) * 240, y = -40 + r() * 180;
    s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(26 + r() * 30)}" ry="${n1(18 + r() * 22)}" fill="#e79a86" opacity=".14" filter="url(#a2n-f12)"/>`;
  }
  // rebond vert d'eau du lange sous la mâchoire
  s += `<path d="M-150,90C-110,150 -50,172 0,174C50,172 110,150 150,90L160,200L-160,200Z" fill="#c9dccf" opacity=".28" filter="url(#a2n-f8)"/>`;
  s += `</g>`;
  // joues
  s += `<ellipse cx="86" cy="86" rx="62" ry="50" fill="url(#a2n-joue)"/><ellipse cx="-86" cy="86" rx="60" ry="48" fill="url(#a2n-joue)" opacity=".9"/>`;
  s += `<ellipse cx="-92" cy="70" rx="18" ry="10" fill="#fff1e4" opacity=".4" filter="url(#a2n-f4)"/>`;
  // front bombé, sous le revers
  s += `<ellipse cx="-14" cy="-30" rx="80" ry="34" fill="#fff0de" opacity=".45" filter="url(#a2n-f12)"/>`;
  // orbites, paupières gonflées de nouveau-né
  for (const k of [-1, 1]) {
    s += `<ellipse cx="${52 * k}" cy="20" rx="38" ry="22" fill="#c7826c" opacity=".2" filter="url(#a2n-f8)"/>`;
    s += `<ellipse cx="${52 * k - 2}" cy="12" rx="22" ry="11" fill="#fff0e2" opacity=".55" filter="url(#a2n-f4)"/>`;
    s += line(`M${52 * k - 18},40C${52 * k - 6},46 ${52 * k + 8},46 ${52 * k + 20},40`, '#c58670', 3, 0.28, 2);
  }
  // nez en bouton, large et plat
  s += line('M-6,40C-14,52 -18,64 -16,76', '#c98a72', 6, 0.18, 4);
  s += `<ellipse cx="-2" cy="72" rx="20" ry="13" fill="#fbdcc4" opacity=".6" filter="url(#a2n-f3)"/>`;
  s += line('M-20,84C-10,90 10,90 20,84', '#bb7863', 6, 0.3, 3);
  s += line('M-14,82C-12,79 -8,79 -6,82', '#a05e4c', 2.6, 0.45, 1) + line('M14,82C12,79 8,79 6,82', '#a05e4c', 2.6, 0.4, 1);
  s += `<ellipse cx="-4" cy="66" rx="5" ry="3.4" fill="#fff6ec" opacity=".5" filter="url(#a2n-f2)"/>`;
  // philtrum, sillon sous la lèvre, petit menton, double menton
  s += line('M-6,92C-6,98 -7,102 -8,106M6,92C6,98 7,102 8,106', '#cf957b', 3, 0.22, 2);
  s += line('M-18,140C-8,145 8,145 18,140', '#c27e68', 5, 0.3, 3);
  s += `<ellipse cx="-4" cy="152" rx="28" ry="10" fill="#fde4cd" opacity=".4" filter="url(#a2n-f4)"/>`;
  s += line('M-80,160C-40,178 40,178 80,160', '#b97462', 6, 0.3, 4);
  // un pli de front (il est tout neuf), à peine marqué
  s += line('M-40,-46C-14,-50 14,-50 40,-45', '#d39b82', 3, 0.22, 2);
  s += '</g>';
  // quelques cheveux sombres qui dépassent du bonnet, aux tempes et au front
  s += '<g fill="none" stroke-linecap="round">';
  // mèches fines couchées le long des tempes, quelques poils sous le revers
  const tufts = [[-149, 30, 9, 1.3], [-152, 8, 7, 1.4], [148, 30, 7, 1.85], [151, 10, 6, 1.75], [-16, -66, 4, 1.62], [14, -66, 3, 1.52]];
  for (const [x, y, n, a0] of tufts) {
    for (let i = 0; i < n; i++) {
      const a = a0 + (r() - 0.5) * 0.25, L = (x * x > 400 ? 10 : 5) + r() * (x * x > 400 ? 14 : 5);
      const bx = x + (r() - 0.5) * 10 * Math.sin(a0), by = y + (r() - 0.5) * 12 * Math.abs(Math.cos(a0)) + (r() - 0.5) * 4;
      const ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L, bend = (r() - 0.5) * 4;
      s += `<path d="M${n1(bx)},${n1(by)}Q${n1((bx + ex) / 2 + bend)},${n1((by + ey) / 2)} ${n1(ex)},${n1(ey)}" stroke="${r() < 0.6 ? '#2e211b' : '#4a3529'}" stroke-width="${n1(0.7 + r() * 0.6)}" opacity="${n1(0.45 + r() * 0.3)}"/>`;
    }
  }
  s += '</g>';
  // ombre du bonnet sur le front
  s += `<path d="${curve(BRIM)}" transform="translate(${n1(-SUN_L[0] * 8)} ${n1(-SUN_L[1] * 8)})" fill="none" stroke="#a96c5b" stroke-width="14" opacity=".3" filter="url(#a2n-f6)"/>`;
  // le bonnet : maille crème, côtes qui montent vers le sommet
  s += '<g filter="url(#a2n-maille)">';
  s += vol(BONNET_D, CREAM.shade, CREAM.base, CREAM.light, 'l', 0.6);
  s += `<g clip-path="url(#a2n-c-bonnet)">`;
  for (let i = -10; i <= 10; i++) {
    const x0 = i * 15, top = [i * 2, -200];
    s += `<path d="M${x0},-60Q${n1(x0 * 0.9)},-150 ${top[0]},${top[1]}" fill="none" stroke="${CREAM.deep}" stroke-width="2" opacity=".25" filter="url(#a2n-f1)"/>`;
  }
  s += `</g>`;
  // le revers côtelé
  s += vol(CUFF_D, CREAM.shade, '#f2eadb', CREAM.light, 'm', 0.7);
  s += `<g clip-path="url(#a2n-c-revers)">`;
  for (let i = 0; i <= 30; i++) {
    const u = (i / 30) * 10, j = Math.min(9, Math.floor(u)), k = u - j;
    const pa = [lerp(BRIM[j][0], BRIM[j + 1][0], k), lerp(BRIM[j][1], BRIM[j + 1][1], k)];
    const pb = [lerp(CUFF[j][0], CUFF[j + 1][0], k), lerp(CUFF[j][1], CUFF[j + 1][1], k)];
    s += `<path d="M${P2(pa)}L${P2(pb)}" stroke="${CREAM.deep}" stroke-width="3.2" opacity=".32" filter="url(#a2n-f1)"/>`;
  }
  s += line(curve(CUFF), CREAM.deep, 5, 0.35, 2);
  s += `</g>`;
  s += line(curve(BRIM), '#9c8b72', 4, 0.45, 1);
  s += '</g>';
  // le liseré du soleil sur le sommet du bonnet, côté fenêtre
  s += `<g clip-path="url(#a2n-c-bonnet)">${line(curve(BONNET_OUT.slice(1, 7)), '#fffbf0', 16, 0.75, 6)}${line(curve(BONNET_OUT.slice(1, 6)), '#ffffff', 4, 0.6, 2)}</g>`;
  // duvet de la maille qui accroche la lumière
  s += line(curve(BONNET_OUT.slice(0, 8).map(([x, y]) => [x * 1.02, y * 1.015])), '#fff4de', 3, 0.4, 2);
  return s + '</g>';
})();

/* --------------------------------------------------------------------------
   Calque : le poing du bébé qui serre l'index de B (repère du bébé). Le
   petit avant-bras (manche de body crème) sort de sous le pan du lange ; la
   main de B arrive d'en haut à droite, dos vers nous, pouce le long de
   l'index, les autres doigts repliés. Elle est un peu plus près de nous que
   le bébé : nette au bout du doigt, de plus en plus floue vers le poignet
   -------------------------------------------------------------------------- */
// Repère de la main du bébé : a du poignet vers les doigts, b le long de l'index de B
const HA = norm([0.5, -0.87]), HB = [-HA[1], HA[0]];
const W0 = [131, 276];
const hf = (a, b) => [W0[0] + a * HA[0] + b * HB[0], W0[1] + a * HA[1] + b * HB[1]];
const hfs = (pts) => pts.map(([a, b]) => hf(a, b));
const B_ANG = n1((Math.atan2(HB[1], HB[0]) * 180) / Math.PI);
const K = 1.35;                                             // taille de la main du bébé
const hk = (a, b) => hf(a * K, b * K);
const hks = (pts) => pts.map(([a, b]) => hk(a, b));
const FIST = hk(20, 0);                                     // pivot du poing

// main de B (dos vers nous, vue un peu du côté du pouce, raccourcie par la perspective)
const BA = 62;                                              // axe de l'index de B
const B_INDEX = tube(hfs([[BA, -84], [BA, -10], [BA, 70], [BA, 150]]), [19, 21, 22, 23.5]);
const B_BACK = curve(hfs([[40, 132], [36, 200], [42, 270], [62, 326], [100, 350], [150, 350], [186, 326], [202, 270], [204, 196],
  [200, 150], [176, 128], [140, 124], [108, 126], [74, 124]]), true);
const B_SLEEVE = tube(hfs([[110, 330], [190, 420], [300, 540], [420, 660]]), [112, 118, 124, 130]);
// petit bras nu et potelé, puis le poing
const BABY_ARM = tube(hks([[-110, 2], [-80, 1], [-46, 0], [-14, 0], [0, 0]]), [26, 27.5, 26, 22, 22].map((v) => v * K));
const BABY_HAND = curve(hks([[-6, -26], [8, -31], [26, -32], [40, -28], [47, -18], [48, -4], [48, 10], [46, 22], [38, 30], [22, 32], [6, 29], [-6, 24]]), true);
const BABY_FING = [-19, -5, 9, 22].map((b, i) => {
  const k = (i === 3 ? 0.86 : 1) * K;
  return { b, d: tube(hks([[38, b], [54, b - 0.5], [67, b - 1]]), [8.6 * k, 8.2 * k, 7.4 * k]) };
});
const BABY_THUMB = tube(hks([[8, -27], [24, -39], [42, -43], [58, -40], [67, -33]]), [10, 9.4, 8.6, 7.8, 7].map((v) => v * K));
// Côté « sous le pan » du bord du lange : le petit bras n'est visible qu'au-delà
const UNDER_D = `M${FLAP_EDGE.map(P2).join('L')}L700,560L700,-400L-30,-400Z`;

const DOIGT = (() => {
  const g0 = hf(BA, 10), g1 = hf(BA, 120);
  let s = `<defs>${FX}
    <clipPath id="a2n-c-lange2"><path d="${BODY_D}"/></clipPath>
    <clipPath id="a2n-c-dessous"><path d="${UNDER_D}"/></clipPath>
    <clipPath id="a2n-c-index"><path d="${B_INDEX}"/></clipPath>
    <clipPath id="a2n-c-bmain"><path d="${B_BACK}"/></clipPath>
    ${grad('a2n-g-net', g0[0], g0[1], g1[0], g1[1], [[0, '#fff'], [1, '#000']])}
    <mask id="a2n-m-net" maskUnits="userSpaceOnUse" x="-1200" y="-1200" width="3000" height="3000"><rect x="-1200" y="-1200" width="3000" height="3000" fill="url(#a2n-g-net)"/></mask>
  </defs><g transform="${GROUP}">`;
  // ombres portées sur le lange (la main de B est un peu au-dessus)
  s += `<g clip-path="url(#a2n-c-lange2)">`;
  s += `<g transform="translate(10 50)" fill="#2f4446" opacity=".3" filter="url(#a2n-f12)"><path d="${B_INDEX}"/><path d="${B_BACK}"/></g>`;
  s += `<g transform="translate(4 16)" fill="#2f4446" opacity=".36" filter="url(#a2n-f6)"><path d="${BABY_HAND}"/>${BABY_FING.map((f) => `<path d="${f.d}"/>`).join('')}</g>`;
  s += `<g clip-path="url(#a2n-c-dessous)"><path d="${BABY_ARM}" transform="translate(4 14)" fill="#2f4446" opacity=".36" filter="url(#a2n-f6)"/></g>`;
  s += `</g>`;
  // le petit bras nu sort de sous le pan : bourrelets, pli du poignet
  s += `<g clip-path="url(#a2n-c-dessous)" filter="url(#a2n-peau)">` + vol(BABY_ARM, '#d39a80', '#f1c5a9', '#fde3cd', 'm', 0.75);
  for (const [a, k] of [[-8, 0.55], [-30, 0.25], [-60, 0.3]]) s += line(`M${P2(hk(a, -24))}C${P2(hk(a - 3, -8))} ${P2(hk(a - 3, 8))} ${P2(hk(a, 24))}`, '#bf7b65', 3, k, 2);
  s += `</g>`;
  // ombre de contact là où le bras passe sous le pan, et le pan qui bâille un peu
  s += line(`M${P2(hk(-60, -30))}C${P2(hk(-56, -10))} ${P2(hk(-56, 10))} ${P2(hk(-60, 30))}`, '#46605b', 12, 0.3, 6);
  // la main de B, floue (manche vert forêt, pouce, dos, doigts repliés, index)
  s += `<g filter="url(#a2n-f3)">`;
  s += vol(B_SLEEVE, '#26382f', '#3f5a4c', '#5b7866', 'l', 0.55);
  s += line(`M${P2(hf(14, 380))}L${P2(hf(196, 266))}`, '#22322a', 22, 0.5, 2);
  s += '<g filter="url(#a2n-peau)">';
  s += vol(B_BACK, B_SKIN.shade, B_SKIN.base, B_SKIN.light, 'l', 0.6);
  s += `<g clip-path="url(#a2n-c-bmain)">`;
  // tendons en éventail du poignet vers les jointures
  for (const [a0, a1] of [[90, 62], [112, 104], [134, 142], [150, 180]]) s += line(`M${P2(hf(a0, 330))}C${P2(hf(lerp(a0, a1, 0.4), 260))} ${P2(hf(lerp(a0, a1, 0.8), 200))} ${P2(hf(a1, 150))}`, B_SKIN.light, 9, 0.35, 3);
  for (const a of [84, 124, 162]) s += line(`M${P2(hf(a, 150))}C${P2(hf(a + 2, 220))} ${P2(hf(a + 2, 280))} ${P2(hf(a + 4, 330))}`, B_SKIN.shade, 8, 0.25, 4);
  s += line(`M${P2(hf(40, 330))}C${P2(hf(100, 344))} ${P2(hf(150, 344))} ${P2(hf(200, 320))}`, B_SKIN.deep, 5, 0.3, 3);
  s += `</g>`;
  // doigts repliés : leur dos, posés sous la ligne des jointures
  for (const [a, rr] of [[100, 19], [138, 18], [172, 15]]) {
    const d = tube(hfs([[a, 144], [a - 2, 126], [a - 4, 114]]), [rr, rr * 0.95, rr * 0.9]);
    s += vol(d, B_SKIN.deep, B_SKIN.shade, B_SKIN.base, 's', 0.45);
    const tp = hf(a - 4, 104);
    s += `<ellipse cx="${n1(tp[0])}" cy="${n1(tp[1])}" rx="${rr}" ry="9" transform="rotate(${B_ANG} ${n1(tp[0])} ${n1(tp[1])})" fill="${B_SKIN.deep}" opacity=".45" filter="url(#a2n-f3)"/>`;
  }
  // jointures : reliefs clairs, creux entre elles
  for (const a of [62, 102, 140, 176]) { const k = hf(a, 142); s += `<ellipse cx="${n1(k[0])}" cy="${n1(k[1])}" rx="15" ry="11" transform="rotate(${B_ANG} ${n1(k[0])} ${n1(k[1])})" fill="${B_SKIN.light}" opacity=".6" filter="url(#a2n-f3)"/>`; }
  for (const a of [82, 121, 158]) s += line(`M${P2(hf(a, 128))}L${P2(hf(a, 170))}`, B_SKIN.deep, 5, 0.3, 3);
  s += vol(B_INDEX, B_SKIN.shade, B_SKIN.base, B_SKIN.light, 's', 0.7);
  s += '</g></g>';
  // l'index net, près du poing
  s += `<g mask="url(#a2n-m-net)" filter="url(#a2n-peau)">`;
  s += vol(B_INDEX, B_SKIN.shade, B_SKIN.base, B_SKIN.light, 's', 0.75);
  s += `<g clip-path="url(#a2n-c-index)">`;
  for (const b of [58, 84]) s += line(`M${P2(hf(BA - 20, b))}C${P2(hf(BA - 8, b - 4))} ${P2(hf(BA + 8, b - 4))} ${P2(hf(BA + 20, b))}`, B_SKIN.deep, 2.2, 0.35, 1);
  // ongle de B, au-delà du poing
  const nl = hf(BA, -86);
  s += `<ellipse cx="${n1(nl[0])}" cy="${n1(nl[1])}" rx="13" ry="12" transform="rotate(${B_ANG} ${n1(nl[0])} ${n1(nl[1])})" fill="#efcab8"/>`;
  const nh = hf(BA + 6, -90);
  s += `<ellipse cx="${n1(nh[0])}" cy="${n1(nh[1])}" rx="5" ry="3" transform="rotate(${B_ANG} ${n1(nh[0])} ${n1(nh[1])})" fill="#fff6ee" opacity=".7" filter="url(#a2n-f1)"/>`;
  s += line(`M${P2(hf(BA - 16, -74))}C${P2(hf(BA - 6, -70))} ${P2(hf(BA + 6, -70))} ${P2(hf(BA + 16, -74))}`, '#c9937e', 1.8, 0.6, 0);
  // ombres de contact des petits doigts sur l'index
  for (const f of [...BABY_FING, { b: -40 }]) {
    const p = hk(58, f.b + 4);
    s += `<ellipse cx="${n1(p[0])}" cy="${n1(p[1])}" rx="11" ry="22" transform="rotate(${B_ANG} ${n1(p[0])} ${n1(p[1])})" fill="#99624e" opacity=".32" filter="url(#a2n-f3)"/>`;
  }
  s += `</g></g>`;
  // le poing : dos de la main, quatre doigts enroulés d'un seul tenant, pouce
  s += '<g filter="url(#a2n-peau)">';
  s += vol(BABY_HAND, '#d39a80', '#f2c6aa', '#fde3cd', 'm', 0.8);
  s += `<g fill="#d39a80">${BABY_FING.map((f) => `<path d="${f.d}"/>`).join('')}</g>`;
  s += `<g fill="#f4c9ad" filter="url(#a2n-vs)">${BABY_FING.map((f) => `<path d="${f.d}"/>`).join('')}</g>`;
  s += `<g fill="#fee6d2" opacity=".7" filter="url(#a2n-hs)">${BABY_FING.map((f) => `<path d="${f.d}"/>`).join('')}</g>`;
  // sillons entre les doigts (courts), fossettes des jointures, bouts de doigts
  for (let i = 0; i < 3; i++) {
    const b = (BABY_FING[i].b + BABY_FING[i + 1].b) / 2;
    s += line(`M${P2(hk(44, b))}L${P2(hk(66, b - 1))}`, '#b8745f', 2.4, 0.45, 1);
  }
  for (const f of BABY_FING) {
    const k = hk(32, f.b), tp = hk(66, f.b - 1);
    s += `<circle cx="${n1(k[0])}" cy="${n1(k[1])}" r="3" fill="#c27f69" opacity=".4" filter="url(#a2n-f1)"/>`;
    s += `<circle cx="${n1(tp[0])}" cy="${n1(tp[1])}" r="4.6" fill="#ffefe2" opacity=".5" filter="url(#a2n-f2)"/>`;
  }
  s += vol(BABY_THUMB, '#d39a80', '#f3c9ad', '#fde4cf', 's', 0.75);
  s += '</g>';
  return s + '</g>';
})();

/* --------------------------------------------------------------------------
   Visage : paupières closes, sourcils à peine dessinés, bouche (repère local)
   -------------------------------------------------------------------------- */
function eyes(c, T, q) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const k of [-1, 1]) {
    const cx = 52 * k, cy = 21;
    // sommeil agité : la paupière frémit à peine
    const fl = 0.5 * Math.sin(T * 6.1 + k * 1.3) * Math.max(0, Math.sin(T * 0.7 + 0.8));
    const A = [cx - 22, cy - 2], B = [cx + 22, cy - 1];
    const U1 = [cx - 9, cy + 8 + fl], U2 = [cx + 9, cy + 8.5 + fl];
    const lid = () => { c.beginPath(); c.moveTo(A[0], A[1]); c.bezierCurveTo(U1[0], U1[1], U2[0], U2[1], B[0], B[1]); };
    c.strokeStyle = 'rgba(120,70,58,0.22)'; c.lineWidth = 6; lid(); c.stroke();
    c.strokeStyle = '#6a4034'; c.lineWidth = 2.1; lid(); c.stroke();
    // cils courts et clairsemés, vers la joue
    c.strokeStyle = 'rgba(78,50,42,0.85)';
    c.lineWidth = 0.95;
    for (let i = 0; i < 7; i++) {
      const u = 0.2 + 0.68 * (i / 6), v = 1 - u;
      const px = v * v * v * A[0] + 3 * v * v * u * U1[0] + 3 * v * u * u * U2[0] + u * u * u * B[0];
      const py = v * v * v * A[1] + 3 * v * v * u * U1[1] + 3 * v * u * u * U2[1] + u * u * u * B[1];
      const L = 3.5 + 3.5 * Math.sin(Math.PI * u), dx = (u - 0.5) * 0.9 + 0.25 * k;
      c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + dx * L * 0.4, py + L * 0.6, px + dx * L, py + L); c.stroke();
    }
  }
  // sourcils : presque rien, un duvet
  c.lineWidth = 3;
  for (const k of [-1, 1]) {
    c.strokeStyle = 'rgba(176,122,96,0.16)';
    c.beginPath(); c.moveTo(24 * k, -10); c.quadraticCurveTo(50 * k, -18, 78 * k, -9); c.stroke();
  }
}

function mouth(c, T, q) {
  const sk = q.suck * (0.5 + 0.5 * Math.sin(T * TAU * 1.3));
  const sm = clamp(q.smile);
  const y0 = 113, w = 15 + 3 * sm - 3 * sk, cyy = y0 + 1 - 4.5 * sm;
  const k = Math.hypot(c.getTransform().a, c.getTransform().b);
  c.save();
  c.shadowColor = 'rgba(210,130,115,0.7)';
  c.shadowBlur = 2.2 * k;
  // lèvre inférieure, pleine
  const lb = y0 + 10 + 2 * sk;
  const lg = c.createLinearGradient(0, y0, 0, lb);
  lg.addColorStop(0, '#d98c82'); lg.addColorStop(0.6, '#e6a598'); lg.addColorStop(1, '#e2a294');
  c.fillStyle = lg;
  c.beginPath();
  c.moveTo(-w + 1, cyy); c.bezierCurveTo(-8, y0 + 2, 8, y0 + 2, w - 1, cyy);
  c.bezierCurveTo(11, lb, -11, lb, -w + 1, cyy);
  c.fill();
  // lèvre supérieure, en arc de Cupidon
  c.fillStyle = '#d58d84';
  c.beginPath();
  c.moveTo(-w, cyy);
  c.bezierCurveTo(-12, y0 - 2.5, -8, y0 - 6.5, -4, y0 - 6);
  c.quadraticCurveTo(0, y0 - 4.2, 4, y0 - 6);
  c.bezierCurveTo(8, y0 - 6.5, 12, y0 - 2.5, w, cyy);
  c.bezierCurveTo(10, y0 + 2.5, 4, y0 + 2.5, 0, y0 + 2.6);
  c.bezierCurveTo(-4, y0 + 2.5, -10, y0 + 2.5, -w, cyy);
  c.fill();
  c.restore();
  // fente des lèvres
  c.strokeStyle = 'rgba(130,64,60,0.75)';
  c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-w + 1, cyy); c.bezierCurveTo(-8, y0 + 2.6, 8, y0 + 2.6, w - 1, cyy); c.stroke();
  // reflet sur la lèvre inférieure, commissures
  c.fillStyle = 'rgba(255,238,228,0.5)';
  c.beginPath(); c.ellipse(-3, y0 + 6.5, 4.5, 1.8, 0, 0, TAU); c.fill();
  c.fillStyle = `rgba(170,96,84,${0.25 + 0.15 * sm})`;
  for (const x of [-w, w]) { c.beginPath(); c.arc(x, cyy, 1.8, 0, TAU); c.fill(); }
}

/* --------------------------------------------------------------------------
   Mouvements de vie
   -------------------------------------------------------------------------- */
// Respiration de nouveau-né : rapide et légère, inspiration plus courte
const breath = (T, rate = 1) => {
  const ph = (T * rate) / 2.3, f = ph - Math.floor(ph);
  return f < 0.4 ? ease.inOut(f / 0.4) : 1 - ease.inOut((f - 0.4) / 0.6);
};
// Bercement : une rotation et un petit déplacement communs à tout ce que portent les bras
const PIV = [640, 680];
function rig(C, s, rot, d, extra = [0, 0], drot = 0) {
  const cr = Math.cos(rot), sr = Math.sin(rot), vx = C[0] - PIV[0], vy = C[1] - PIV[1];
  return {
    ox: C[0], oy: C[1], rot: rot + drot, sx: s, sy: s,
    x: PIV[0] + d[0] + cr * vx - sr * vy - C[0] + extra[0],
    y: PIV[1] + d[1] + sr * vx + cr * vy - C[1] + extra[1],
  };
}
const applyTf = (c, { x = 0, y = 0, rot = 0, sx = 1, sy = 1, ox = 0, oy = 0 }) => {
  c.translate(ox + x, oy + y); c.rotate(rot); c.scale(sx, sy); c.translate(-ox, -oy);
};

// Sprites : point doux (poussière, bokeh)
let SPR = null;
function sprites() {
  if (SPR) return SPR;
  const mk = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
  const dot = mk(64, 64), d = dot.getContext('2d');
  const gd = d.createRadialGradient(32, 32, 0, 32, 32, 32);
  gd.addColorStop(0, 'rgba(255,246,226,1)'); gd.addColorStop(0.3, 'rgba(255,236,200,0.55)'); gd.addColorStop(1, 'rgba(255,226,180,0)');
  d.fillStyle = gd; d.fillRect(0, 0, 64, 64);
  const disc = mk(64, 64), e = disc.getContext('2d');
  const ge = e.createRadialGradient(32, 32, 0, 32, 32, 31);
  ge.addColorStop(0, 'rgba(255,248,232,0.55)'); ge.addColorStop(0.82, 'rgba(255,244,222,0.65)'); ge.addColorStop(0.94, 'rgba(255,240,214,0.72)'); ge.addColorStop(1, 'rgba(255,240,214,0)');
  e.fillStyle = ge; e.fillRect(0, 0, 64, 64);
  return (SPR = { dot, disc });
}

// Poussière dans le rayon de soleil, bokeh de la fenêtre (positions tirées une fois)
const DUST = (() => {
  const r = rng(5);
  return Array.from({ length: 110 }, () => ({ u: r() * 2600 - 300, v: (r() - 0.5) * 700, s: 1.4 + r() * 2.6, ph: r() * TAU, sp: 0.4 + r() * 0.8 }));
})();
const BOKEH = (() => {
  const r = rng(77);
  return Array.from({ length: 22 }, (_, i) => (i < 14
    ? { x: -200 + r() * 560, y: -120 + r() * 760, s: 18 + r() * 46, ph: r() * TAU, k: 0.2 + r() * 0.35 }
    : { x: 1200 + r() * 600, y: -60 + r() * 480, s: 24 + r() * 40, ph: r() * TAU, k: 0.12 + r() * 0.2 }));
})();

// Le rayon de soleil : il entre par la fenêtre (en haut à gauche) et traverse
// le visage et le poing, vers le bas à droite
const BEAM_D = norm([0.89, 0.45]);
const BEAM_N = [-BEAM_D[1], BEAM_D[0]];
const BEAM_C = [840, 330];
const beamAt = (x, y, w = 260) => {
  const v = (x - BEAM_C[0]) * BEAM_N[0] + (y - BEAM_C[1]) * BEAM_N[1];
  return Math.exp(-((v / w) ** 2));
};

// Rayons : origine dans la fenêtre, demi-largeur, intensité, phase
const RAYS = [[-200, -60, 70, 0.07, 0], [-120, 120, 40, 0.06, 2.1], [-260, 260, 90, 0.05, 4.2], [0, -160, 50, 0.05, 1.3]];
const DEF = { dusk: 0, grip: 0.5, smile: 0, suck: 0, rock: 1, rate: 1 };

/* --------------------------------------------------------------------------
   Le décor
   -------------------------------------------------------------------------- */
const FIST_S = at(...FIST);
const CHEST = at(0, 480);

export default {
  id: 'a2-naissance',
  home: HOME,
  bg: '#1e1915',
  layers: {
    fond: { box: [-240, -140, 2400, 1360], svg: FOND, filters: ['paint'], par: 0.8, res: 0.5 },
    bras: { box: [-240, 360, 2400, 880], svg: BRAS, filters: ['paint'], res: 0.9 },
    lange: { box: [500, 40, 1660, 1200], svg: LANGE, filters: ['ink'], res: 1 },
    tete: { box: [560, 140, 470, 470], svg: TETE, filters: ['ink'], res: 1.8 },
    doigt: { box: [880, -220, 1040, 800], svg: DOIGT, filters: ['ink'], res: 1.4 },
  },

  render(g, p, T) {
    const q = { ...DEF, ...p };
    const du = clamp(q.dusk);
    const br = breath(T, q.rate);
    // bercement lent des bras de A
    const w = (TAU * T) / 6.5;
    const rot = 0.006 * q.rock * Math.sin(w);
    const d = [4 * q.rock * Math.sin(w + 0.6), 3 * q.rock * Math.sin(w + 1.2)];
    const sb = 1 + 0.008 * br;
    const tf = {
      bras: rig(PIV, 1, rot, d),
      lange: rig(CHEST, sb, rot, d),
      // la tête se soulève à peine avec le souffle
      tete: rig([HX, HY], 1, rot, d, [-UY[0] * 1.4 * br, -UY[1] * 1.4 * br], 0.003 * br),
      // le poing suit la poitrine, et tire un peu sur le doigt quand il serre
      doigt: rig(FIST_S, 1, rot, d, [(sb - 1) * (FIST_S[0] - CHEST[0]), (sb - 1) * (FIST_S[1] - CHEST[1])],
        -0.03 * (q.grip - 0.5) + 0.004 * Math.sin(T * 1.1)),
    };

    g.img('fond');
    // bokeh de la fenêtre et de la tache de soleil
    g.fx(0.8, (c) => {
      const { disc } = sprites();
      c.globalCompositeOperation = 'screen';
      for (const b of BOKEH) {
        c.globalAlpha = b.k * (0.6 + 0.4 * Math.sin(T * 0.6 + b.ph)) * (1 - 0.7 * du);
        c.drawImage(disc, b.x + 8 * Math.sin(T * 0.25 + b.ph) - b.s, b.y + 5 * Math.sin(T * 0.2 + b.ph * 2) - b.s, b.s * 2, b.s * 2);
      }
    });
    g.img('bras', { tf: tf.bras });
    g.img('lange', { tf: tf.lange });
    g.img('tete', { tf: tf.tete });
    g.fx(1, (c) => {
      applyTf(c, tf.tete);
      c.translate(HX, HY); c.rotate(RR);
      eyes(c, T, q);
      mouth(c, T, q);
    });
    g.img('doigt', { tf: tf.doigt });

    // Lumière
    g.fx(1, (c) => {
      const sun = 1 - 0.75 * du;
      // ombres bleutées, loin de la fenêtre
      c.globalCompositeOperation = 'multiply';
      let gr = c.createLinearGradient(200, 200, 2000, 900);
      gr.addColorStop(0, 'rgba(255,255,255,0)');
      gr.addColorStop(1, `rgba(138,150,192,${0.68 + 0.12 * du})`);
      c.fillStyle = gr;
      c.fillRect(-600, -600, 3400, 2400);
      gr = c.createRadialGradient(600, 320, 260, 600, 320, 1500);
      gr.addColorStop(0, 'rgba(255,255,255,0)');
      gr.addColorStop(1, `rgba(112,108,134,${0.58 + 0.12 * du})`);
      c.fillStyle = gr;
      c.fillRect(-600, -600, 3400, 2400);
      gr = c.createLinearGradient(0, 640, 0, 1240);
      gr.addColorStop(0, 'rgba(255,255,255,0)');
      gr.addColorStop(1, 'rgba(150,146,168,0.55)');
      c.fillStyle = gr;
      c.fillRect(-600, -600, 3400, 2400);
      if (du > 0) {
        c.fillStyle = `rgb(${n1(lerp(255, 190, du))},${n1(lerp(255, 180, du))},${n1(lerp(255, 182, du))})`;
        c.fillRect(-600, -600, 3400, 2400);
      }
      // le rayon de soleil, chaud : il traverse le visage et le poing
      c.save();
      c.translate(BEAM_C[0], BEAM_C[1]);
      c.transform(BEAM_D[0], BEAM_D[1], BEAM_N[0], BEAM_N[1], 0, 0);
      const bw = 300;
      for (const [op, a] of [['soft-light', 0.6], ['screen', 0.05]]) {
        c.globalCompositeOperation = op;
        gr = c.createLinearGradient(0, -bw * 1.6, 0, bw * 1.6);
        gr.addColorStop(0, 'rgba(255,224,170,0)');
        gr.addColorStop(0.5, `rgba(255,${n1(lerp(206, 160, du))},${n1(lerp(140, 104, du))},${n1(a * sun)})`);
        gr.addColorStop(1, 'rgba(255,224,170,0)');
        c.fillStyle = gr;
        c.fillRect(-1600, -bw * 1.6, 3600, bw * 3.2);
      }
      c.restore();
      // rayons dans l'air, depuis la fenêtre, en travers de l'image
      c.globalCompositeOperation = 'screen';
      for (const [x0, y0, w, k, ph] of RAYS) {
        const al = k * sun * (0.7 + 0.3 * Math.sin(T * 0.35 + ph));
        c.save();
        c.translate(x0, y0);
        c.transform(BEAM_D[0], BEAM_D[1], BEAM_N[0], BEAM_N[1], 0, 0);
        const rg = c.createLinearGradient(0, -w, 0, w);
        rg.addColorStop(0, 'rgba(255,230,190,0)');
        rg.addColorStop(0.5, `rgba(255,230,190,${n1(al * 1000) / 1000})`);
        rg.addColorStop(1, 'rgba(255,230,190,0)');
        c.fillStyle = rg;
        const lg = c.createLinearGradient(0, 0, 1900, 0);
        c.fillRect(0, -w, 1900, 2 * w);
        void lg;
        c.restore();
      }
      // halo de la fenêtre (atmosphère)
      c.globalCompositeOperation = 'screen';
      gr = c.createRadialGradient(-120, 180, 40, -120, 180, 1300);
      gr.addColorStop(0, `rgba(255,240,214,${0.18 * sun})`);
      gr.addColorStop(1, 'rgba(255,240,214,0)');
      c.fillStyle = gr;
      c.fillRect(-600, -600, 3400, 2400);
      // douce lumière sur le visage
      const fc = at(-20, 30);
      c.globalCompositeOperation = 'soft-light';
      gr = c.createRadialGradient(fc[0] - 40, fc[1] - 30, 20, fc[0], fc[1], 380);
      gr.addColorStop(0, `rgba(255,206,160,${0.3 - 0.1 * du})`);
      gr.addColorStop(1, 'rgba(255,214,170,0)');
      c.fillStyle = gr;
      c.fillRect(fc[0] - 420, fc[1] - 420, 840, 840);
      // au soir, un dernier reflet chaud reste sur la joue
      if (du > 0) {
        gr = c.createRadialGradient(fc[0] - 30, fc[1] - 20, 10, fc[0], fc[1], 300);
        gr.addColorStop(0, `rgba(255,168,104,${n1(0.42 * du * 1000) / 1000})`);
        gr.addColorStop(1, 'rgba(255,168,104,0)');
        c.fillStyle = gr;
        c.fillRect(fc[0] - 340, fc[1] - 340, 680, 680);
      }
      // poussière qui flotte dans le rayon
      const { dot } = sprites();
      c.globalCompositeOperation = 'screen';
      for (const m of DUST) {
        const u = ((m.u + T * 7 * m.sp) % 2600 + 2600) % 2600 - 300;
        const v = m.v + Math.sin(T * 0.4 * m.sp + m.ph) * 16 - T * 2 * m.sp;
        const x = BEAM_C[0] + (u - 900) * BEAM_D[0] + v * BEAM_N[0], y = BEAM_C[1] + (u - 900) * BEAM_D[1] + v * BEAM_N[1];
        const a = beamAt(x, y) * (0.5 + 0.5 * Math.sin(T * 1.3 * m.sp + m.ph * 3)) * sun;
        if (a < 0.05) continue;
        c.globalAlpha = a * 0.8;
        c.drawImage(dot, x - m.s, y - m.s, m.s * 2, m.s * 2);
      }
    });

    // Finition : densité des valeurs, comme une pellicule
    g.screen((c) => {
      c.globalCompositeOperation = 'soft-light';
      c.globalAlpha = 0.34;
      c.drawImage(c.canvas, 0, 0);
    });
    // La lumière baisse : voile froid, dernier reflet chaud en haut à gauche
    if (du > 0) {
      g.screen((c, W, H) => {
        c.globalCompositeOperation = 'soft-light';
        const gr = c.createLinearGradient(0, 0, W, H);
        gr.addColorStop(0, `rgba(255,186,120,${0.26 * du})`);
        gr.addColorStop(0.5, 'rgba(128,128,128,0)');
        gr.addColorStop(1, `rgba(52,74,120,${0.4 * du})`);
        c.fillStyle = gr;
        c.fillRect(0, 0, W, H);
      });
    }
  },

  shots: {
    // Il dort, sa main serre le doigt de B ; lente poussée vers le visage
    bras: {
      dur: 7,
      cam: (t, portrait) => {
        const k = 0.6 * ease.inOut(clamp(t / 7)) + 0.4 * clamp(t / 7);
        return portrait
          ? { x: lerp(962, 932, k), y: lerp(468, 444, k), z: lerp(1.0, 1.12, k) }
          : { x: lerp(1000, 966, k), y: lerp(470, 446, k), z: lerp(1.0, 1.13, k) };
      },
      p: (t) => ({
        grip: 0.5 + 0.5 * seg(t, 1.4, 2.4) * (1 - seg(t, 4.6, 5.8)),
        suck: seg(t, 0.3, 0.8) * (1 - seg(t, 1.6, 2.2)),
        smile: seg(t, 3.5, 4.3) * (1 - seg(t, 5.3, 6.4)),
      }),
    },
    // Un peu plus large, apaisé ; la lumière baisse lentement. Dernière image de l'acte
    fin: {
      dur: 7,
      cam: (t, portrait) => {
        const k = clamp(t / 7);
        return portrait
          ? { x: lerp(962, 964, k), y: lerp(480, 486, k), z: lerp(0.95, 0.91, k) }
          : { x: lerp(984, 990, k), y: lerp(498, 504, k), z: lerp(0.9, 0.86, k) };
      },
      p: (t) => ({ dusk: seg(t, 0.2, 7, ease.inOut), rock: lerp(1, 0.55, clamp(t / 7)), rate: 0.9, smile: 0.25 * seg(t, 1.5, 3) * (1 - seg(t, 4, 5.5)) }),
    },
  },
};
