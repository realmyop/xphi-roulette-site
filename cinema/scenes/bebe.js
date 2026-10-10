/* ==========================================================================
   Décor « bebe » — gros plan : le bébé endormi, vu en plongée dans le berceau.
   Le plan le plus tendre du film, celui sur lequel l'émission revient.

   Le bébé est dessiné dans son propre repère (visage droit, sommet du crâne en
   haut, unités du décor) puis couché en diagonale : tête vers la gauche, corps
   vers le bas à droite. Le soleil entre par la droite : une bande dorée
   traverse le drap et la poitrine, rayée par l'ombre des barreaux ; les ombres
   rondes du mobile y glissent lentement.

   Paramètres (p) :
     eyes   0 → 1   paupières closes → yeux grands ouverts
     look   0 → 1   le regard monte vers le haut à gauche du cadre
     worry  0 → 1   sourcils inquiets, petite moue (sans pleurs)
     fist   0 → 1   poing près de la joue : relâché → serré (0,5 au repos)
     dusk   0 → 1   la lumière baisse (fin du film)
     sway   0 → 1   tremblement de caméra subjective
     pov    0 / 1   vue subjective : barreaux du côté opposé en haut du cadre
     rail   0 | y   barre du berceau floue en bas du cadre (y : fraction de l'écran)
     fg     0 → 1   barreaux très flous au premier plan, bord droit
     suck   0 → 1   petite tétée dans le sommeil
     mouth  0 → 1   bouche entrouverte (0,6 au repos)
   ========================================================================== */
import { P, lin, rad, rng, lerp } from '../kit.js';
import { TAU, clamp, seg, ease } from '../../film/engine.js';

const HOME = { x: 960, y: 540, z: 1 };

/* --------------------------------------------------------------------------
   Repère du bébé et outils de tracé
   -------------------------------------------------------------------------- */
const HX = 800, HY = 400, ROT = -58;                 // centre de la tête, inclinaison
const RR = (ROT * Math.PI) / 180;
const UX = [Math.cos(RR), Math.sin(RR)];              // x local (côté gauche du bébé)
const UY = [-Math.sin(RR), Math.cos(RR)];             // y local (du crâne vers les pieds)
const at = (x, y) => [HX + x * UX[0] + y * UY[0], HY + x * UX[1] + y * UY[1]];
const GROUP = `translate(${HX} ${HY}) rotate(${ROT})`;

const n1 = (v) => Math.round(v * 10) / 10;
const norm = ([x, y]) => { const m = Math.hypot(x, y) || 1; return [x / m, y / m]; };
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

// Point d'une courbe de Bézier cubique
const bez = (p0, p1, p2, p3, u) => {
  const v = 1 - u;
  return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
    v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]];
};

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

// Membre potelé : contour d'un « boudin » le long d'un axe, rayons variables, bouts ronds
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

// Repère d'une main : origine au poignet, a le long des doigts, b vers le pouce
const handFrame = (w, d, k = 1) => {
  const e = [-d[1], d[0]];
  return (a, b) => [w[0] + k * (a * d[0] + b * e[0]), w[1] + k * (a * d[1] + b * e[1])];
};

/* --------------------------------------------------------------------------
   Filtres propres au décor : volume (bords plus sombres, centre éclairé du
   côté de la fenêtre, +x local), flous doux, grain de lavis très léger
   -------------------------------------------------------------------------- */
const volF = (id, er, bl, dx) =>
  `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%">` +
  `<feMorphology in="SourceGraphic" operator="erode" radius="${er}" result="e"/>` +
  `<feGaussianBlur in="e" stdDeviation="${bl}" result="b"/>` +
  `<feOffset in="b" dx="${dx}" dy="${-dx * 0.25}" result="o"/>` +
  `<feComposite in="o" in2="SourceAlpha" operator="in"/></filter>`;
const blurF = (id, s) =>
  `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
const texF = (id, freq, amp, seed) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 1" result="g"/>` +
  `<feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="${amp}" k2="${1 - amp / 2}" k3="0" k4="0" result="m"/>` +
  `<feComposite in="m" in2="SourceGraphic" operator="in"/></filter>`;
const FX = [
  volF('bebe-vs', 2, 3, 1.5), volF('bebe-vm', 5, 7, 3), volF('bebe-vl', 12, 16, 7),
  volF('bebe-hs', 4.5, 3, 3.5), volF('bebe-hm', 11, 8, 8), volF('bebe-hl', 34, 22, 20),
  blurF('bebe-f1', 1), blurF('bebe-f2', 2), blurF('bebe-f3', 3), blurF('bebe-f4', 4),
  blurF('bebe-f6', 6), blurF('bebe-f8', 8), blurF('bebe-f12', 12), blurF('bebe-f18', 18),
  blurF('bebe-f30', 30), blurF('bebe-f45', 45),
  texF('bebe-peau', 0.013, 0.09, 4), texF('bebe-tissu', 0.06, 0.16, 9), texF('bebe-lavis', 0.02, 0.16, 12),
].join('');

// Une forme en volume : ombre de bord, corps, reflet
const vol = (d, shade, base, light, k = 'm', lo = 0.75) =>
  `<path d="${d}" fill="${shade}"/><path d="${d}" fill="${base}" filter="url(#bebe-v${k})"/>` +
  (light ? `<path d="${d}" fill="${light}" opacity="${lo}" filter="url(#bebe-h${k})"/>` : '');
// Plusieurs formes ombrées comme une seule (pas de couture au coude)
const volU = (ds, shade, base, light, k = 'm', lo = 0.75) => {
  const g = ds.map((d) => `<path d="${d}"/>`).join('');
  return `<g fill="${shade}">${g}</g><g fill="${base}" filter="url(#bebe-v${k})">${g}</g>` +
    (light ? `<g fill="${light}" opacity="${lo}" filter="url(#bebe-h${k})">${g}</g>` : '');
};
const line = (d, color, w, op, blur = 2) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}" filter="url(#bebe-f${blur})"/>`;

/* --------------------------------------------------------------------------
   Formes du bébé (repère local)
   -------------------------------------------------------------------------- */
const HEAD_D = 'M0,-174C92,-174 156,-112 157,-30C158,22 154,70 136,106C116,148 66,176 0,176' +
  'C-66,176 -116,148 -136,106C-154,70 -158,22 -157,-30C-156,-112 -92,-174 0,-174Z';
const HAIR_D = 'M-157,-24C-160,-114 -94,-178 0,-178C94,-178 160,-114 157,-24C146,-46 124,-70 92,-84' +
  'C60,-96 28,-101 0,-101C-28,-101 -60,-96 -92,-84C-124,-70 -146,-46 -157,-24Z';
const EAR = (s) => `M${148 * s},-18C${163 * s},-27 ${177 * s},-13 ${176 * s},9C${175 * s},33 ${165 * s},50 ${148 * s},50Z`;
const EAR_IN = (s) => `M${156 * s},-6C${165 * s},-2 ${167 * s},18 ${160 * s},34`;

// Gigoteuse (sac de couchage sans manches), encolure ronde
const SACK_D = 'M-126,192C-98,216 -50,228 0,228C50,228 98,216 126,192C150,182 178,190 194,210' +
  'C206,236 204,270 196,298C214,352 242,462 258,562C272,700 286,900 294,1100L302,1440L-302,1440' +
  'L-294,1100C-286,900 -272,700 -258,562C-242,462 -214,352 -196,298C-204,270 -206,236 -194,210' +
  'C-178,190 -150,182 -126,192Z';
// Haut du body crème (col et épaules), sous la gigoteuse
const TORSO_D = 'M-176,240C-156,190 -92,160 0,160C92,160 156,190 176,240L190,300L-190,300Z';

// Bras potelés (épaule → coude, coude → poignet)
const ARM = {
  ru: tube([[150, 300], [200, 266], [248, 232], [290, 202]], [48, 47, 44, 40]),
  rf: tube([[294, 198], [276, 166], [248, 136], [220, 112]], [38, 36, 33, 28]),
  lu: tube([[-150, 300], [-204, 262], [-252, 224], [-292, 190]], [48, 47, 44, 40]),
  lf: tube([[-296, 184], [-292, 136], [-284, 88], [-276, 40]], [38, 37, 34, 28]),
};
const SLEEVE = {
  r: tube([[146, 300], [180, 276], [210, 256]], [50, 50, 48]),
  l: tube([[-146, 300], [-182, 274], [-212, 252]], [50, 50, 48]),
};

// Main ouverte (bras -x, près de la tempe), vue de dos, doigts mollement repliés
const HL = handFrame([-276, 40], norm([20, -144]), 1.05);
const hl = (pts) => pts.map(([a, b]) => HL(a, b));
const HAND_PALM = curve(hl([[-4, -25], [12, -29], [30, -30], [46, -27], [54, -18], [56, -4], [54, 10], [48, 22], [34, 28], [16, 29], [2, 26], [-4, 20]]), true);
const HAND_FING = [
  [[48, -19], [59, -20], [68, -17]], [[51, -9], [66, -9], [78, -4]],
  [[52, 2], [69, 4], [82, 10]], [[50, 13], [65, 16], [76, 23]],
].map((c, i) => ({ d: tube(hl(c), i === 0 ? [6.6, 6.1, 5.5] : [7.6, 7, 6.2]), mid: HL(...c[1]) }));
const HAND_THUMB = tube(hl([[12, 24], [24, 35], [37, 41], [47, 41]]), [9.6, 8.6, 7.8, 7]);

// Poing près de la joue (bras +x), vu de dos : jointures, doigts repliés, pouce rentré
const FW_ = [220, 112];
const FD = norm([220 - 294, 112 - 198]);
const FH = handFrame(FW_, FD, 1.12);
const fh = (pts) => pts.map(([a, b]) => FH(a, b));
const FIST_D = curve(fh([
  [-6, -27], [14, -31], [34, -32], [50, -31], [59, -28], [64, -22], [62, -16], [67, -10], [65, -3],
  [68, 4], [66, 11], [68, 17], [64, 24], [54, 29], [36, 31], [18, 30], [2, 27], [-6, 21],
]), true);
const FIST_THUMB = tube(fh([[14, 28], [30, 35], [45, 33], [54, 25]]), [10.5, 9.6, 8.6, 7.6]);
const FIST_PIVOT = at(FW_[0], FW_[1]);

// Silhouettes réunies (ombre portée sur le drap)
const SIL = [HEAD_D, SACK_D, ARM.ru, ARM.rf, ARM.lu, ARM.lf, HAND_PALM, FIST_D, SLEEVE.r, SLEEVE.l];

/* --------------------------------------------------------------------------
   Calque : drap-housse crème (et le bord du matelas, tout en haut)
   -------------------------------------------------------------------------- */
const LIGHT_DIR = norm([0.6, -0.8]);           // vers la fenêtre (haut droite)
function fold(x0, y0, x1, y1, x2, y2, x3, y3, w, k = 1) {
  // un pli : arête effilée aux deux bouts ; ombre du côté opposé à la lumière,
  // lumière du côté de la fenêtre, le tout très flou
  const P0 = [x0, y0], P1 = [x1, y1], P2 = [x2, y2], P3 = [x3, y3], N = 14;
  const pts = [], nor = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, v = 1 - u;
    pts.push(bez(P0, P1, P2, P3, u));
    const d = norm([3 * v * v * (x1 - x0) + 6 * v * u * (x2 - x1) + 3 * u * u * (x3 - x2), 3 * v * v * (y1 - y0) + 6 * v * u * (y2 - y1) + 3 * u * u * (y3 - y2)]);
    let n = [-d[1], d[0]];
    if (n[0] * LIGHT_DIR[0] + n[1] * LIGHT_DIR[1] < 0) n = [-n[0], -n[1]];
    nor.push(n);
  }
  const lens = (a, b) => {
    const A = [], B = [];
    for (let i = 0; i <= N; i++) {
      const t = Math.sin((Math.PI * i) / N) ** 0.8;
      A.push([pts[i][0] + nor[i][0] * a * t, pts[i][1] + nor[i][1] * a * t]);
      B.push([pts[i][0] + nor[i][0] * b * t, pts[i][1] + nor[i][1] * b * t]);
    }
    return curve([...A, ...B.reverse()], true);
  };
  return `<path d="${lens(-w * 1.3, w * 0.05)}" fill="#837c78" opacity="${n1(0.34 * k)}" filter="url(#bebe-f8)"/>` +
    `<path d="${lens(-w * 0.35, 0)}" fill="#6f6866" opacity="${n1(0.22 * k)}" filter="url(#bebe-f3)"/>` +
    `<path d="${lens(w * 0.08, w * 0.8)}" fill="#fffaf0" opacity="${n1(0.5 * k)}" filter="url(#bebe-f6)"/>`;
}

const DRAP = (() => {
  const r = rng(7);
  let s = `<defs>${FX}
    ${lin('bebe-drap', [[0, '#f2e4ca'], [0.45, '#ddd0b9'], [1, '#b2aba1']], 1, 0, 0, 0.8)}
    ${lin('bebe-bord', [[0, '#8a8580', 0], [0.55, '#7a7470', 0.5], [1, '#3e3533', 0.95]], 0, 1, 0, 0)}
  </defs>`;
  // la feuille de drap ; le matelas s'arrondit vers son bord (y ≈ -60)
  let edge = 'M-240,1260L-240,-56';
  for (let x = -160; x <= 2160; x += 80) edge += `L${x},${n1(-58 + Math.sin(x * 0.013) * 3 + (r() - 0.5) * 3)}`;
  s += `<g filter="url(#bebe-lavis)"><path d="${edge}L2160,1260Z" fill="url(#bebe-drap)"/>`;
  // grandes variations de teinte (lavis)
  for (let i = 0; i < 18; i++) {
    const x = -200 + r() * 2300, y = -20 + r() * 1260, rx = 120 + r() * 260, ry = 80 + r() * 160;
    const c = x > 900 ? (r() < 0.7 ? '#f8e6c8' : '#c9c0b8') : r() < 0.6 ? '#aeb4c4' : '#efe3cf';
    s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rx)}" ry="${n1(ry)}" transform="rotate(${n1(r() * 180)} ${n1(x)} ${n1(y)})" fill="${c}" opacity=".22" filter="url(#bebe-f45)"/>`;
  }
  s += '</g>';
  s += `<rect x="-240" y="-76" width="2400" height="130" fill="url(#bebe-bord)" filter="url(#bebe-f12)"/>`;
  s += line('M-240,-56C400,-60 1200,-54 2160,-60', '#4a403c', 18, 0.55, 6);
  s += line('M-240,-6C500,-12 1300,-8 2160,-14', '#fff6e8', 14, 0.35, 8);
  // l'élastique du drap fronce le bord
  for (let x = -200; x < 2160; x += 46 + r() * 40) s += line(`M${n1(x)},-52L${n1(x + (r() - 0.5) * 16)},${n1(-12 - r() * 20)}`, '#8b847c', 6, 0.3, 4);
  // creux du matelas sous le bébé : halo froid, puis contact plus net
  const sil = SIL.map((d) => `<path d="${d}"/>`).join('');
  s += `<g transform="${GROUP} translate(-26 10)" fill="#5a5f72" opacity=".42" filter="url(#bebe-f30)">${sil}</g>`;
  s += `<g transform="${GROUP} translate(-7 3)" fill="#4a4b58" opacity=".55" filter="url(#bebe-f6)">${sil}</g>`;
  // plis doux
  const F = [
    [1170, 350, 1300, 280, 1450, 230, 1680, 90, 26],
    [1260, 470, 1460, 420, 1660, 330, 1960, 290, 22],
    [1530, 660, 1730, 600, 1930, 650, 2180, 560, 28],
    [120, 140, 400, 60, 700, 140, 1040, 30, 30, 0.8],
    [700, 830, 560, 880, 420, 910, 160, 1020, 24],
    [990, 890, 910, 1000, 840, 1100, 780, 1280, 28],
    [470, 500, 360, 540, 220, 560, -140, 530, 22, 0.8],
    [1730, 930, 1870, 970, 2010, 1000, 2190, 1110, 22],
    [1350, 170, 1490, 140, 1610, 70, 1720, -40, 18, 0.7],
    [40, 320, 170, 350, 300, 380, 430, 450, 16, 0.6],
  ];
  for (const f of F) s += fold(...f);
  // la tête et le corps creusent le matelas : un creux doux, ombré à l'opposé du jour
  s += `<g transform="${GROUP}">`;
  s += `<path d="${ell(0, -6, 214, 214)}" fill="none" stroke="#8a8380" stroke-width="40" opacity=".18" filter="url(#bebe-f18)" transform="translate(-14 6)"/>`;
  s += `<path d="${ell(0, -6, 232, 232)}" fill="none" stroke="#fff8ec" stroke-width="22" opacity=".22" filter="url(#bebe-f12)" transform="translate(16 -4)"/>`;
  s += '</g>';
  return s;
})();

/* --------------------------------------------------------------------------
   Calque : le corps (bras, main ouverte, body crème, gigoteuse étoilée)
   -------------------------------------------------------------------------- */
const SKIN_RIM = '#d79c82';
const star = (x, y, r0, a) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r0 * 0.48 : r0, t = a + (i * Math.PI) / 5;
    pts.push([x + rr * Math.sin(t), y - rr * Math.cos(t)]);
  }
  return curve(pts, true);
};

const CORPS = (() => {
  const r = rng(31);
  let s = `<defs>${FX}<clipPath id="bebe-sac"><path d="${SACK_D}"/></clipPath></defs><g transform="${GROUP}">`;
  s += '<g filter="url(#bebe-peau)">';
  // bras : haut puis avant-bras (le coude se forme au croisement)
  s += volU([ARM.lu, ARM.lf], SKIN_RIM, '#ecbe9f', '#f8dac3', 'm', 0.6);
  s += volU([ARM.ru, ARM.rf], SKIN_RIM, P.skin, '#fde3cd', 'm');
  // plis potelés : creux des coudes, poignets, bourrelet de l'avant-bras
  s += line('M232,190C242,184 252,182 262,185', '#c08068', 4, 0.32, 3);
  s += line('M-244,186C-252,178 -260,173 -268,171', '#c08068', 4, 0.3, 3);
  s += line(curve([HL(4, -27), HL(1, 0), HL(4, 27)]), '#bf7f68', 3.5, 0.5, 2);
  s += line('M-306,106C-292,112 -278,112 -264,106', '#c78a72', 3, 0.3, 2);
  s += line('M246,104C240,118 236,128 228,140', '#c78a72', 3, 0.3, 2);
  // main ouverte, doigts repliés
  s += `<path d="${HAND_PALM}" transform="translate(-6 5)" fill="#7d5a55" opacity=".22" filter="url(#bebe-f6)"/>`;
  s += vol(HAND_PALM, SKIN_RIM, '#f0c4a6', '#fbdfca', 'm', 0.7);
  for (const f of HAND_FING) s += vol(f.d, SKIN_RIM, '#f1c6a8', '#fbdec8', 's', 0.6);
  s += vol(HAND_THUMB, SKIN_RIM, '#f1c6a8', '#fbdec8', 's', 0.6);
  for (const f of HAND_FING) s += `<circle cx="${n1(f.mid[0])}" cy="${n1(f.mid[1])}" r="2.6" fill="#c98e77" opacity=".28" filter="url(#bebe-f1)"/>`;
  // cou (dans l'ombre du menton)
  s += `<ellipse cx="0" cy="180" rx="90" ry="32" fill="#cf9479"/>`;
  s += '</g>';
  // haut du body crème + manches courtes
  s += vol(TORSO_D, '#c5b49a', '#e0d4bf', '#ede4d4', 'l', 0.5);
  for (const k of ['r', 'l']) s += vol(SLEEVE[k], '#c4b399', '#e2d6c2', '#f0e7d8', 'm', 0.5);
  s += line('M196,214C210,232 218,250 222,270', '#b8a68b', 5, 0.5, 2) + line('M-196,212C-212,230 -220,248 -226,268', '#b8a68b', 5, 0.5, 2);
  // col du body (bord côtelé)
  s += line('M-104,164C-70,194 70,194 104,164', '#c8b89c', 14, 0.9, 2) + line('M-102,160C-68,188 68,188 102,160', '#efe6d6', 4, 0.45, 1);
  // gigoteuse
  s += '<g filter="url(#bebe-tissu)">' + vol(SACK_D, P.roseShade, P.rose, P.roseLight, 'l', 0.7);
  // étoiles crème semées
  s += '<g clip-path="url(#bebe-sac)">';
  for (let y = 290; y < 1440; y += 66) {
    for (let x = -300; x < 300; x += 70) {
      const px = x + (r() - 0.5) * 44 + ((y / 66) % 2) * 35, py = y + (r() - 0.5) * 38;
      s += `<path d="${star(px, py, 7 + r() * 3.5, r() * 1.2)}" fill="#f6ecdc" opacity="${n1(0.7 + r() * 0.22)}"/>`;
    }
  }
  s += '</g>';
  // plis de la gigoteuse (ombres et reflets doux)
  const PL = [
    ['M-196,320C-150,390 -110,460 -70,530', -1], ['M196,320C150,390 110,450 80,510', 1],
    ['M-196,640C-90,610 60,615 190,660', 0], ['M-240,900C-150,950 -40,990 60,1010', -1],
    ['M240,820C170,890 120,960 70,1120', 1], ['M-120,1160C-60,1200 20,1220 120,1200', 0],
    ['M-60,270C-40,310 -10,330 30,340', 0],
  ];
  for (const [d, k] of PL) {
    s += line(d, P.roseShade, 18, 0.45, 8);
    s += `<path d="${d}" transform="translate(${8 + k * 2} -4)" fill="none" stroke="${P.roseLight}" stroke-width="9" stroke-linecap="round" opacity=".45" filter="url(#bebe-f6)"/>`;
  }
  // les jambes repliées sous le tissu
  s += `<ellipse cx="-120" cy="1130" rx="110" ry="190" fill="${P.roseLight}" opacity=".25" filter="url(#bebe-f30)"/>`;
  s += `<ellipse cx="120" cy="1110" rx="110" ry="190" fill="${P.roseLight}" opacity=".3" filter="url(#bebe-f30)"/>`;
  s += '</g>';
  // encolure et emmanchures : bord cousu
  s += line('M-126,194C-98,218 -50,230 0,230C50,230 98,218 126,194', '#9e6a66', 4, 0.5, 2);
  s += line('M194,212C206,238 204,270 196,298', '#9e6a66', 4, 0.45, 2) + line('M-194,212C-206,238 -204,270 -196,298', '#9e6a66', 4, 0.45, 2);
  // pressions aux épaules
  for (const k of [-1, 1]) s += `<circle cx="${156 * k}" cy="198" r="5.5" fill="#f4eadb" opacity=".95"/><circle cx="${156 * k + 1.5}" cy="196.5" r="1.8" fill="#fff" opacity=".8"/>`;
  return s + '</g>';
})();

/* --------------------------------------------------------------------------
   Calque : la tête (peau, oreilles, nez, joues, cheveux) — sans les yeux ni
   la bouche, dessinés à chaque image
   -------------------------------------------------------------------------- */
const hairline = (x) => -100 + 76 * (x / 157) ** 2;
function insideHair(x, y) {
  return (x / 156) ** 2 + ((y + 22) / 156) ** 2 < 1 && y < hairline(x) - 3;
}

const TETE = (() => {
  const r = rng(21);
  let s = `<defs>${FX}
    ${rad('bebe-joue', [[0, P.cheek, 0.72], [0.5, P.cheek, 0.32], [1, P.cheek, 0]])}
    ${rad('bebe-chev', [[0, '#8f6243', 0.75], [0.5, P.hair, 0.55], [0.82, P.hair, 0.2], [1, P.hair, 0]], 0.56, 0.1, 0.84)}
    ${lin('bebe-froid', [[0, '#787a9c', 0.3], [0.5, '#787a9c', 0]], 0, 0, 1, 0)}
    ${lin('bebe-modele', [[0, '#c4846a', 0.5], [0.28, '#cf9378', 0.22], [0.55, '#d9a084', 0]], 0.1, 0.9, 0.85, 0.2)}
    <clipPath id="bebe-crane"><path d="${HEAD_D}" transform="scale(1.025)"/></clipPath>
  </defs><g transform="${GROUP}">`;
  // ombre du menton sur le col
  s += `<ellipse cx="0" cy="190" rx="108" ry="24" fill="#6d5554" opacity=".3" filter="url(#bebe-f8)"/>`;
  s += '<g filter="url(#bebe-peau)">';
  // oreilles
  for (const k of [-1, 1]) {
    s += vol(EAR(k), '#d39a80', k > 0 ? '#f1c2a4' : '#e4b296', k > 0 ? '#fcdcc4' : null, 's', 0.6);
    s += line(EAR_IN(k), '#bf8470', 4.5, 0.45, 2);
  }
  // le visage : volume, ombre froide côté opposé à la fenêtre
  s += vol(HEAD_D, '#dba083', P.skin, '#fde6d1', 'l', 0.8);
  s += `<path d="${HEAD_D}" fill="url(#bebe-modele)"/>`;
  s += `<path d="${HEAD_D}" fill="url(#bebe-froid)"/>`;
  // reflet chaud du drap ensoleillé sous la joue
  s += `<ellipse cx="124" cy="104" rx="34" ry="56" fill="#ffd0a4" opacity=".3" filter="url(#bebe-f12)"/>`;
  // joues
  s += `<ellipse cx="90" cy="82" rx="66" ry="52" fill="url(#bebe-joue)"/>`;
  s += `<ellipse cx="-90" cy="82" rx="64" ry="50" fill="url(#bebe-joue)" opacity=".85"/>`;
  s += `<ellipse cx="104" cy="66" rx="16" ry="10" fill="#fff0e2" opacity=".4" filter="url(#bebe-f4)"/>`;
  // front bombé
  s += `<ellipse cx="34" cy="-56" rx="90" ry="58" fill="#fff1df" opacity=".35" filter="url(#bebe-f18)"/>`;
  // orbites et paupières bombées
  for (const k of [-1, 1]) {
    s += `<ellipse cx="${60 * k}" cy="14" rx="44" ry="24" fill="#c98b74" opacity=".16" filter="url(#bebe-f8)"/>`;
    s += `<ellipse cx="${60 * k + 4}" cy="9" rx="22" ry="9" fill="#fff2e4" opacity=".45" filter="url(#bebe-f4)"/>`;
  }
  // nez en bouton : surtout des ombres douces
  s += line('M-11,50C-19,60 -22,70 -18,80', '#c98a72', 7, 0.2, 4);
  s += line('M-17,86C-8,92 8,92 17,86', '#bd7a64', 6, 0.3, 3);
  s += `<ellipse cx="3" cy="73" rx="16" ry="12" fill="#fbdcc3" opacity=".7" filter="url(#bebe-f3)"/>`;
  s += line('M-12,83C-10,80 -6,80 -5,83', '#a5624f', 2.6, 0.38, 1) + line('M14,83C12,80 8,80 7,83', '#a5624f', 2.6, 0.3, 1);
  s += `<ellipse cx="7" cy="68" rx="4.5" ry="3" fill="#fff8ee" opacity=".45" filter="url(#bebe-f2)"/>`;
  // philtrum, sillon sous la lèvre, menton, double menton
  s += line('M-6,94C-6,100 -7,104 -8,108M6,94C6,100 7,104 8,108', '#cf957b', 3, 0.22, 2);
  s += line('M-20,144C-9,149 9,149 20,144', '#c48069', 5, 0.3, 3);
  s += `<ellipse cx="6" cy="158" rx="30" ry="11" fill="#fde4cd" opacity=".4" filter="url(#bebe-f4)"/>`;
  s += line('M-84,164C-40,184 40,184 84,164', '#c07c66', 6, 0.26, 4);
  s += '</g>';
  // cheveux fins : voile translucide, puis mèches courtes couchées qui partent de l'épi
  s += `<path d="${HAIR_D}" fill="url(#bebe-chev)" filter="url(#bebe-f4)"/>`;
  s += '<g clip-path="url(#bebe-crane)">';
  const W0 = [30, -148];
  for (let i = 0, n = 0; i < 1400 && n < 300; i++) {
    const x = (r() - 0.5) * 316, y = -180 + r() * 172;
    if (!insideHair(x, y)) continue;
    n++;
    const dist = Math.hypot(x - W0[0], y - W0[1]);
    const [dx, dy] = norm([x - W0[0], y - W0[1]]);
    const sw = 0.9 * Math.exp(-dist / 70) + 0.25, ca = Math.cos(sw), sa = Math.sin(sw);
    const d = [dx * ca - dy * sa, dx * sa + dy * ca];
    const L = 12 + r() * 22, bend = (r() - 0.4) * 0.3;
    const x2 = x + d[0] * L, y2 = y + d[1] * L;
    const cx = x + d[0] * L * 0.5 - d[1] * L * bend, cy = y + d[1] * L * 0.5 + d[0] * L * bend;
    const lit = x > 10 + (r() - 0.5) * 60;
    const col = lit ? (r() < 0.35 ? '#e4ba88' : '#c99a6c') : r() < 0.5 ? '#80583b' : '#9a6d4b';
    s += `<path d="M${n1(x)},${n1(y)}Q${n1(cx)},${n1(cy)} ${n1(x2)},${n1(y2)}" fill="none" stroke="${col}" stroke-width="${n1(0.75 + r() * 0.75)}" stroke-linecap="round" opacity="${n1(0.24 + r() * 0.28)}"/>`;
  }
  s += '</g>';
  // duvet de la lisière
  for (let i = 0; i < 46; i++) {
    const x = -142 + (284 * i) / 45 + (r() - 0.5) * 6, y = hairline(x) - 1;
    const L = 5 + r() * 7, a = Math.atan2(y + 20, x) + (r() - 0.5) * 0.6;
    s += `<path d="M${n1(x - Math.cos(a) * 3)},${n1(y - Math.sin(a) * 3)}l${n1(Math.cos(a) * L)},${n1(Math.sin(a) * L)}" stroke="${x > 20 ? '#c99a6c' : '#a07656'}" stroke-width=".8" stroke-linecap="round" opacity=".2"/>`;
  }
  // quelques cheveux follets, couchés le long du contour, dorés côté fenêtre
  for (let i = 0; i < 16; i++) {
    const a = Math.PI + 0.35 + (Math.PI - 0.7) * (i / 15) + (r() - 0.5) * 0.08;
    const bx = 153 * Math.cos(a), by = -22 + 155 * Math.sin(a);
    const t = a + (bx > 0 ? 1 : -1) * (Math.PI / 2 - 0.35);
    const L = 12 + r() * 12, ex = bx + Math.cos(t) * L, ey = by + Math.sin(t) * L;
    const lit = bx > 0;
    s += `<path d="M${n1(bx)},${n1(by)}Q${n1(bx + Math.cos(t) * L * 0.6 + Math.cos(a) * 4)},${n1(by + Math.sin(t) * L * 0.6 + Math.sin(a) * 4)} ${n1(ex)},${n1(ey)}" fill="none" stroke="${lit ? '#efcc9a' : '#9a6c4b'}" stroke-width=".85" stroke-linecap="round" opacity="${lit ? 0.7 : 0.35}"/>`;
  }
  return s + '</g>';
})();

/* --------------------------------------------------------------------------
   Calque : le poing près de la joue (animé autour du poignet)
   -------------------------------------------------------------------------- */
const POING = (() => {
  let s = `<defs>${FX}</defs><g transform="${GROUP}">`;
  // ombre douce du poing sur la joue et le drap
  s += `<path d="${FIST_D}" transform="translate(-9 7)" fill="#7a4f4a" opacity=".3" filter="url(#bebe-f6)"/>`;
  s += '<g filter="url(#bebe-peau)">';
  s += vol(FIST_D, SKIN_RIM, '#f4caab', '#fde5d0', 'm', 0.8);
  // doigts repliés : sillons entre les doigts, de la jointure au bord
  for (const b of [-16, -6.5, 7.5]) s += line(curve(fh([[48, b + 1], [57, b + 0.5], [64, b]])), '#bf7c66', 2.6, 0.42, 1);
  // jointures : petites fossettes et reflets
  for (const b of [-16, -6.5, 7.5]) { const p = FH(44, b); s += `<ellipse cx="${n1(p[0])}" cy="${n1(p[1])}" rx="2.2" ry="1.6" fill="#c48570" opacity=".3" filter="url(#bebe-f1)"/>`; }
  for (const b of [-21, -11, 1, 13]) { const p = FH(52, b); s += `<ellipse cx="${n1(p[0])}" cy="${n1(p[1])}" rx="4.5" ry="3.2" fill="#fff1e3" opacity=".5" filter="url(#bebe-f2)"/>`; }
  s += line(curve(fh([[3, -25], [0, 0], [3, 25]])), '#bf7c66', 3, 0.42, 2);
  // pouce rentré par-dessus l'index
  s += vol(FIST_THUMB, SKIN_RIM, '#f6ceb1', '#fee8d5', 's', 0.8);
  const tn = FH(51, 26);
  s += `<ellipse cx="${n1(tn[0])}" cy="${n1(tn[1])}" rx="4" ry="3.2" fill="#f9e2d6" opacity=".8" filter="url(#bebe-f1)"/>`;
  return s + '</g></g>';
})();

/* --------------------------------------------------------------------------
   Calque : premier plan flou (barreaux du bord droit ; barre du berceau
   pour la vue subjective). Repère propre, placé à l'écran au rendu.
   -------------------------------------------------------------------------- */
const PREMIER = (() => {
  let s = `<defs>
    ${lin('bebe-barreau', [[0, '#7a5232'], [0.3, '#9a6c42'], [0.6, P.wood], [0.82, '#dcaa6c'], [0.94, '#f6d090'], [1, '#ffe8bc']], 0, 0, 1, 0)}
    ${lin('bebe-barre', [[0, '#ffe2b0'], [0.15, P.woodLight], [0.5, P.wood], [0.78, P.woodDark], [1, '#4a301d']])}
  </defs>`;
  // barreaux légèrement penchés (perspective plongeante)
  for (const [x, w] of [[170, 108], [400, 116], [640, 122]]) {
    s += `<path d="M${x - w / 2},1400C${x - w / 2 + 6},900 ${x - w / 2 + 28},400 ${x - w / 2 + 48},0L${x + w / 2 + 54},0C${x + w / 2 + 32},400 ${x + w / 2 + 8},900 ${x + w / 2},1400Z" fill="url(#bebe-barreau)"/>`;
  }
  // la barre du haut du berceau (vue subjective)
  s += `<path d="M1000,120C1400,108 2000,108 2400,118L2400,420C2000,412 1400,412 1000,420Z" fill="url(#bebe-barre)"/>`;
  s += `<path d="M1000,150C1400,140 2000,140 2400,148" stroke="#fff0cc" stroke-width="18" fill="none" opacity=".6"/>`;
  return s;
})();

/* --------------------------------------------------------------------------
   Calque : côté opposé du berceau, vu d'en haut (vue subjective seulement)
   -------------------------------------------------------------------------- */
const LOIN = (() => {
  const r = rng(53);
  let s = `<defs>${FX}
    ${lin('bebe-sol', [[0, '#3d302b'], [0.7, '#5b463a'], [1, '#6a5244']])}
    ${lin('bebe-bar2', [[0, '#5e3e27'], [0.3, P.woodDark], [0.65, P.wood], [0.9, P.woodLight], [1, '#ffe0aa']], 0, 0, 1, 0)}
  </defs>`;
  // le sol, loin en contrebas ; un bout du tapis tissé
  s += `<rect x="-240" y="-640" width="2400" height="620" fill="url(#bebe-sol)"/>`;
  s += `<ellipse cx="1300" cy="-200" rx="700" ry="160" fill="#d8c4a0" opacity=".28" filter="url(#bebe-f30)"/>`;
  // barreaux : ils montent vers nous et s'écartent depuis le nadir
  const N0 = [960, 2600];
  for (let i = 0; i < 14; i++) {
    const bx = -230 + i * 182 + (r() - 0.5) * 4;
    const [dx, dy] = norm([bx - N0[0], -62 - N0[1]]);
    const L = 700, w0 = 46, w1 = 66;
    const tx = bx + dx * L, ty = -62 + dy * L;
    const d = `M${n1(bx - w0 / 2)},-30L${n1(tx - w1 / 2)},${n1(ty)}L${n1(tx + w1 / 2)},${n1(ty)}L${n1(bx + w0 / 2)},-30Z`;
    s += `<path d="${d}" transform="translate(-14 6)" fill="#1f1714" opacity=".35" filter="url(#bebe-f8)"/>`;
    s += `<path d="${d}" fill="url(#bebe-bar2)" filter="url(#bebe-f3)"/>`;
  }
  return s;
})();

/* --------------------------------------------------------------------------
   Lumière : bande de soleil, rayée par l'ombre des barreaux
   -------------------------------------------------------------------------- */
const DL = norm([-0.7, 0.71]);                 // sens de propagation (haut droite → bas gauche)
const NL = [DL[1], -DL[0]];                     // normale (vers le bas à droite)
const C0 = [1150, 556];                         // milieu de la bande (haut de la poitrine)
const bump = (v, c, w, e) => smooth(c - w - e, c - w + e, v) * (1 - smooth(c + w - e, c + w + e, v));
function bandAt(v, dusk = 0) {
  v += 230 * dusk;                                // au soir, le dernier rayon remonte sur les joues
  const hw = 180 - 90 * dusk;
  const edge = smooth(-hw - 60, -hw + 10, v) * (1 - smooth(hw - 10, hw + 60, v));
  return edge * (1 - 0.85 * bump(v, 95 - 60 * dusk, 22, 14));
}
// Lueur du rideau de lin (diffuse) : la tête baigne dedans, le reste s'éteint doucement
const glowAt = (v, dusk = 0) => (0.24 - 0.16 * dusk) * smooth(-860, -420, v) * (1 - smooth(-210, -110, v));
const lightAt = (v, dusk = 0) => { const b = bandAt(v, dusk); return b + glowAt(v, dusk) * (1 - b); };

// Ombre portée du bébé dans le soleil (pré-calculée une fois)
let CAST = null;
function castShadow() {
  if (CAST) return CAST;
  const S = 0.5, X0 = 380, Y0 = 60, W = 1800, H = 1240;
  const cv = document.createElement('canvas');
  cv.width = W * S; cv.height = H * S;
  const o = cv.getContext('2d');
  const sil = SIL.map((d) => new Path2D(d));
  const fill = (dx, dy, blur, color) => {
    o.save();
    o.setTransform(S, 0, 0, S, (-X0 + dx) * S - 4000, (-Y0 + dy) * S);
    o.translate(HX, HY); o.rotate(RR);
    o.shadowColor = color; o.shadowBlur = blur * S; o.shadowOffsetX = 4000;
    o.fillStyle = '#000';
    for (const p of sil) o.fill(p);
    o.restore();
  };
  // l'ombre s'allonge dans le sens de la lumière ; le bébé lui-même reste éclairé
  for (let k = 1; k <= 6; k++) fill(DL[0] * 20 * k, DL[1] * 20 * k, 14 + k * 4, 'rgba(0,0,0,0.5)');
  o.globalCompositeOperation = 'destination-out';
  o.save();
  o.setTransform(S, 0, 0, S, -X0 * S, -Y0 * S);
  o.translate(HX, HY); o.rotate(RR);
  for (const p of sil) o.fill(p);
  o.restore();
  return (CAST = { cv, X0, Y0, W, H });
}

// Formes du mobile (pour leurs ombres) : étoile, lune, nuage, soleil
function mobileShape(c, i, s) {
  c.beginPath();
  if (i === 0) {
    for (let k = 0; k < 10; k++) {
      const rr = k % 2 ? 30 * s : 66 * s, t = (k * Math.PI) / 5;
      c.lineTo(rr * Math.sin(t), -rr * Math.cos(t));
    }
  } else if (i === 1) {
    c.arc(0, 0, 60 * s, 0.6, TAU - 0.6);
    c.arc(26 * s, -10 * s, 48 * s, TAU - 0.95, 0.95, true);
  } else if (i === 2) {
    c.arc(-34 * s, 8 * s, 34 * s, 0, TAU);
    c.moveTo(54 * s, -8 * s); c.arc(10 * s, -8 * s, 44 * s, 0, TAU);
    c.moveTo(78 * s, 14 * s); c.arc(48 * s, 14 * s, 30 * s, 0, TAU);
  } else {
    c.arc(0, 0, 40 * s, 0, TAU);
    for (let k = 0; k < 8; k++) {
      const t = (k * TAU) / 8;
      c.moveTo(Math.cos(t - 0.16) * 44 * s, Math.sin(t - 0.16) * 44 * s);
      c.lineTo(Math.cos(t) * 66 * s, Math.sin(t) * 66 * s);
      c.lineTo(Math.cos(t + 0.16) * 44 * s, Math.sin(t + 0.16) * 44 * s);
    }
  }
  c.closePath();
}

// Carte de lumière du soleil (écran) : bande, ombre portée, ombres du mobile
let LM = null;
function lightMap(c, q, T) {
  const W = c.canvas.width, H = c.canvas.height;
  if (!LM || LM.width !== W || LM.height !== H) { LM = document.createElement('canvas'); LM.width = W; LM.height = H; }
  const o = LM.getContext('2d');
  const m = c.getTransform();
  const k = Math.hypot(m.a, m.b);
  o.setTransform(1, 0, 0, 1, 0, 0);
  o.globalCompositeOperation = 'source-over';
  o.globalAlpha = 1;
  o.clearRect(0, 0, W, H);
  o.setTransform(m);
  // la bande, dans son propre repère (u le long de la lumière, v en travers) ; au
  // soir elle glisse vers le bas à gauche et rougit
  const du = q.dusk;
  o.save();
  o.transform(DL[0], DL[1], NL[0], NL[1], C0[0], C0[1]);
  const gr = o.createLinearGradient(0, -900, 0, 300);
  const col = [255, lerp(210, 146, du), lerp(134, 92, du)];
  for (let i = 0; i <= 80; i++) {
    const v = -900 + i * 15;
    gr.addColorStop(i / 80, `rgba(${col[0]},${n1(col[1])},${n1(col[2])},${n1(lightAt(v, du) * 1000) / 1000})`);
  }
  o.fillStyle = gr;
  o.fillRect(-1800, -900, 3600, 1200);
  o.restore();
  // ombre portée du bébé
  const cs = castShadow();
  o.globalCompositeOperation = 'destination-out';
  o.drawImage(cs.cv, cs.X0, cs.Y0, cs.W, cs.H);
  // ombres rondes du mobile : il tourne lentement, chaque forme se balance
  const ph = T * (TAU / 64) + 0.9;
  const MC = [C0[0] - DL[0] * 40, C0[1] - DL[1] * 40];
  o.fillStyle = '#000';
  for (let i = 0; i < 4; i++) {
    const a = ph + (i * TAU) / 4;
    const bob = Math.sin(T * 0.8 + i * 1.7) * 10;
    const x = MC[0] + DL[0] * (290 * Math.cos(a) + bob) + NL[0] * 120 * Math.sin(a);
    const y = MC[1] + DL[1] * (290 * Math.cos(a) + bob) + NL[1] * 120 * Math.sin(a);
    o.save();
    o.translate(x, y);
    o.rotate(Math.atan2(DL[1], DL[0]));
    o.scale(1.25, 1);
    o.rotate(Math.sin(T * 0.37 + i) * 0.5 + i);
    // la forme est rejetée hors champ : seule son ombre floue revient en place
    const mm = o.getTransform();
    o.setTransform(mm.a, mm.b, mm.c, mm.d, mm.e - 6000, mm.f);
    o.shadowColor = 'rgba(0,0,0,0.62)';
    o.shadowBlur = 21 * k;
    o.shadowOffsetX = 6000;
    mobileShape(o, i, 1.05);
    o.fill();
    o.restore();
  }
  return LM;
}

/* --------------------------------------------------------------------------
   Visage : yeux, sourcils, bouche (dessinés à chaque image, repère local)
   -------------------------------------------------------------------------- */

function eye(c, s, o, gx, gy, worry) {
  const cx = 60 * s, cy = 20, w = 29;
  const A = [cx - s * w, cy - 1], B = [cx + s * w, cy + 2];
  // paupière haute : le coin intérieur se relève un peu quand il s'inquiète
  const U1 = [cx - s * w * 0.42, lerp(cy + 8, cy - 23 - 3 * worry, o)], U2 = [cx + s * w * 0.5, lerp(cy + 9, cy - 21 + 2 * worry, o)];
  const L1 = [cx + s * w * 0.5, lerp(cy + 9, cy + 13 - 2 * worry, o)], L2 = [cx - s * w * 0.42, lerp(cy + 8, cy + 12 - 2.5 * worry, o)];
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (o > 0.015) {
    c.save();
    c.beginPath();
    c.moveTo(A[0], A[1]); c.bezierCurveTo(U1[0], U1[1], U2[0], U2[1], B[0], B[1]);
    c.bezierCurveTo(L1[0], L1[1], L2[0], L2[1], A[0], A[1]);
    c.closePath();
    c.clip();
    c.fillStyle = '#eee6e1';
    c.fillRect(cx - 40, cy - 40, 80, 80);
    const ix = cx + gx * 7 + s * 0.5, iy = cy + 1 + gy * 7;
    const ig = c.createRadialGradient(ix, iy, 1, ix, iy, 16);
    ig.addColorStop(0, '#8e928c'); ig.addColorStop(0.4, '#6b7379'); ig.addColorStop(0.85, '#3f464e'); ig.addColorStop(1, '#2a2e35');
    c.fillStyle = ig;
    c.beginPath(); c.arc(ix, iy, 16, 0, TAU); c.fill();
    c.fillStyle = '#16131a';
    c.beginPath(); c.arc(ix, iy, 6.8, 0, TAU); c.fill();
    // ombre de la paupière sur l'œil
    const sg = c.createLinearGradient(0, cy - 24, 0, cy + 8);
    sg.addColorStop(0, 'rgba(86,52,46,0.62)'); sg.addColorStop(1, 'rgba(86,52,46,0)');
    c.fillStyle = sg;
    c.fillRect(cx - 40, cy - 30, 80, 38);
    // reflets de la fenêtre
    c.fillStyle = 'rgba(255,251,242,0.95)';
    c.beginPath(); c.arc(ix + 5.5, iy - 4, 3.4, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,251,242,0.45)';
    c.beginPath(); c.arc(ix - 4.5, iy + 5, 1.5, 0, TAU); c.fill();
    c.restore();
    // pli de la paupière, bord inférieur humide
    c.strokeStyle = `rgba(178,116,98,${0.3 * o})`;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(A[0] + s * 5, A[1] - 6 * o); c.bezierCurveTo(U1[0], U1[1] - 8, U2[0], U2[1] - 7, B[0] - s * 3, B[1] - 7 * o);
    c.stroke();
    c.strokeStyle = `rgba(165,104,90,${0.35 * o})`;
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(B[0], B[1]); c.bezierCurveTo(L1[0], L1[1], L2[0], L2[1], A[0], A[1]);
    c.stroke();
  }
  // bord de la paupière (trait doux puis trait net)
  const lid = () => { c.beginPath(); c.moveTo(A[0], A[1]); c.bezierCurveTo(U1[0], U1[1], U2[0], U2[1], B[0], B[1]); };
  c.strokeStyle = 'rgba(98,60,50,0.25)'; c.lineWidth = 5.5; lid(); c.stroke();
  c.strokeStyle = '#5c3c33'; c.lineWidth = lerp(2.3, 2, o); lid(); c.stroke();
  // cils : vers la joue quand il dort, courts et relevés quand il ouvre les yeux
  c.strokeStyle = '#4c3029';
  c.lineWidth = lerp(1.05, 0.85, o);
  const n = 9;
  for (let i = 0; i < n; i++) {
    const u = 0.22 + 0.76 * (i / (n - 1));
    const p = bez(A, U1, U2, B, u);
    const L = lerp(5 + 7 * u, 2.2 + 3 * u, o);
    const d = norm([lerp(s * (0.15 + 0.6 * u), s * (0.2 + 0.8 * u), o), lerp(1, -0.8, o)]);
    const cu = lerp(-1, 1, o) * s * 0.3;
    c.beginPath();
    c.moveTo(p[0], p[1]);
    c.quadraticCurveTo(p[0] + d[0] * L * 0.55 - d[1] * cu * L, p[1] + d[1] * L * 0.55 + d[0] * cu * L, p[0] + d[0] * L, p[1] + d[1] * L);
    c.stroke();
  }
}

function brows(c, worry) {
  const k = Math.hypot(c.getTransform().a, c.getTransform().b);
  c.lineCap = 'round';
  for (const s of [-1, 1]) {
    const a = [34 * s, -28 - 17 * worry], m = [60 * s, -37 - 5 * worry], b = [92 * s, -27 + 6 * worry];
    const at = (u) => { const v = 1 - u; return [v * v * a[0] + 2 * v * u * m[0] + u * u * b[0], v * v * a[1] + 2 * v * u * m[1] + u * u * b[1]]; };
    c.save();
    c.shadowColor = 'rgba(150,96,70,0.4)';
    c.shadowBlur = 3 * k;
    c.strokeStyle = `rgba(160,104,76,${0.08 + 0.05 * worry})`;
    c.lineWidth = 4.5;
    c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(m[0], m[1], b[0], b[1]); c.stroke();
    c.restore();
    c.strokeStyle = `rgba(118,76,52,${0.2 + 0.08 * worry})`;
    c.lineWidth = 0.7;
    for (let i = 0; i < 14; i++) {
      const u = 0.04 + (0.9 * i) / 13, p0 = at(u), p1 = at(Math.min(1, u + 0.09));
      const off = ((i * 7) % 5 - 2) * 0.9;
      c.beginPath(); c.moveTo(p0[0], p0[1] + off); c.lineTo(p1[0], p1[1] + off * 0.4 - 0.8); c.stroke();
    }
  }
}

function mouth(c, q, T) {
  const sk = q.suck * (0.5 + 0.5 * Math.sin(T * TAU * 1.3));
  const m = clamp(q.mouth * (1 - 0.75 * sk));
  const pw = clamp(q.worry * 0.8 + sk * 0.5), cd = q.worry;
  const y0 = 119, Lx = -21 + 2 * pw, Rx = 21 - 2 * pw, ly = y0 + 1.5 + 4.5 * cd;
  const k = Math.hypot(c.getTransform().a, c.getTransform().b);
  c.save();
  c.shadowColor = 'rgba(205,128,112,0.7)';
  c.shadowBlur = 2.4 * k;
  // ouverture
  const top = y0 + 2.5, bot = y0 + 3 + 6.5 * m;
  c.fillStyle = '#8c4a4b';
  c.beginPath();
  c.moveTo(Lx + 4, ly); c.bezierCurveTo(-7, top, 7, top, Rx - 4, ly);
  c.bezierCurveTo(7, bot, -7, bot, Lx + 4, ly);
  c.fill();
  // lèvre inférieure, pleine
  const lt = y0 + 3 + 5 * m, lb = y0 + 14 + 5 * pw;
  const lg = c.createLinearGradient(0, lt, 0, lb);
  lg.addColorStop(0, '#d98e83'); lg.addColorStop(0.55, '#e6a497'); lg.addColorStop(1, '#e3a092');
  c.fillStyle = lg;
  c.beginPath();
  c.moveTo(Lx + 2, ly); c.bezierCurveTo(-8, lt, 8, lt, Rx - 2, ly);
  c.bezierCurveTo(12, lb, -12, lb, Lx + 2, ly);
  c.fill();
  // lèvre supérieure, fine, en arc de Cupidon
  c.fillStyle = '#d6938a';
  c.beginPath();
  c.moveTo(Lx, ly);
  c.bezierCurveTo(-15, y0 - 2.5, -9, y0 - 7, -4.5, y0 - 6.5);
  c.quadraticCurveTo(0, y0 - 4.5, 4.5, y0 - 6.5);
  c.bezierCurveTo(9, y0 - 7, 15, y0 - 2.5, Rx, ly);
  c.bezierCurveTo(12, y0 + 3, 5, y0 + 2 + 2 * m, 0, y0 + 3.5 + 2 * m);
  c.bezierCurveTo(-5, y0 + 2 + 2 * m, -12, y0 + 3, Lx, ly);
  c.fill();
  c.restore();
  // reflets
  c.fillStyle = 'rgba(255,238,228,0.5)';
  c.beginPath(); c.ellipse(5, (lt + lb) / 2 + 1, 5, 2.2, 0, 0, TAU); c.fill();
  // commissures
  c.fillStyle = 'rgba(160,90,80,0.3)';
  for (const x of [Lx, Rx]) { c.beginPath(); c.arc(x, ly, 2, 0, TAU); c.fill(); }
}

/* --------------------------------------------------------------------------
   Mouvements de vie
   -------------------------------------------------------------------------- */
// Respiration lente, inspiration un peu plus courte que l'expiration
const breath = (T, amp, rate = 1) => {
  const ph = (T * rate) / 2.7;
  const f = ph - Math.floor(ph);
  return amp * (f < 0.42 ? ease.inOut(f / 0.42) : 1 - ease.inOut((f - 0.42) / 0.58));
};
const swayAt = (s, T) => [
  s * (5.5 * Math.sin(T * 0.83 + 0.4) + 2.6 * Math.sin(T * 1.91 + 1.3) + 1.1 * Math.sin(T * 3.7)),
  s * (4.2 * Math.sin(T * 0.67 + 2.1) + 2.2 * Math.sin(T * 1.53 + 0.2) + 0.9 * Math.sin(T * 4.1 + 1)),
];
// Reproduit la transformation locale du compositeur (tf) sur un contexte
const applyTf = (c, { x = 0, y = 0, rot = 0, sx = 1, sy = 1, ox = 0, oy = 0 }) => {
  c.translate(ox + x, oy + y); c.rotate(rot); c.scale(sx, sy); c.translate(-ox, -oy);
};

// Poussière dans le soleil (positions tirées une fois)
const DUST = (() => {
  const r = rng(5);
  return Array.from({ length: 90 }, () => ({ u: (r() - 0.5) * 2600, v: (r() - 0.5) * 520, s: 0.7 + r() * 1.6, ph: r() * TAU, sp: 0.15 + r() * 0.35, big: r() < 0.12 }));
})();

const DEF = { eyes: 0, look: 0, worry: 0, fist: 0.5, dusk: 0, sway: 0, pov: 0, rail: 0, fg: 1, suck: 0, breath: 1, mouth: 0.6, rate: 1 };

/* --------------------------------------------------------------------------
   Le décor
   -------------------------------------------------------------------------- */
const FACE = at(0, 40);

export default {
  id: 'bebe',
  home: HOME,
  bg: '#1c1613',
  layers: {
    loin: { box: [-240, -640, 2400, 620], svg: LOIN, filters: ['paint'], res: 0.7 },
    drap: { box: [-240, -140, 2400, 1400], svg: DRAP, filters: ['ink'], res: 1 },
    corps: { box: [480, 140, 1680, 1120], svg: CORPS, filters: ['ink'], res: 1.6 },
    tete: { box: [585, 180, 440, 440], svg: TETE, filters: ['ink'], res: 2.4 },
    poing: { box: [860, 160, 230, 230], svg: POING, filters: ['ink'], res: 2.4 },
    premier: { box: [0, 0, 2400, 1400], svg: PREMIER, filters: ['b28'], res: 0.5 },
  },

  render(g, p, T, view) {
    const q = { ...DEF, ...p };
    const cam = (view && view.cam) || HOME;
    const sw = swayAt(q.sway, T);
    const br = breath(T, q.breath, q.rate);

    // Respiration : la gigoteuse se soulève (léger grossissement autour du ventre)
    const B0 = at(0, 520);
    const sb = 1 + 0.012 * br;
    const tfCorps = { ox: B0[0], oy: B0[1], x: sw[0], y: sw[1], sx: sb, sy: sb };
    // La tête bouge à peine avec le souffle ; elle se tourne un peu au réveil
    const hd = [-UY[0] * 1.6 * br, -UY[1] * 1.6 * br];
    const tfTete = { ox: HX, oy: HY, x: sw[0] + hd[0], y: sw[1] + hd[1], rot: 0.004 * br - 0.025 * q.look };
    // Le poing suit le bras, et se serre ou se relâche autour du poignet
    const fk = q.fist - 0.5;
    const Wp = [B0[0] + sb * (FIST_PIVOT[0] - B0[0]), B0[1] + sb * (FIST_PIVOT[1] - B0[1])];
    const tfPoing = { ox: FIST_PIVOT[0], oy: FIST_PIVOT[1], x: Wp[0] - FIST_PIVOT[0] + sw[0], y: Wp[1] - FIST_PIVOT[1] + sw[1], rot: -0.12 * fk, sx: sb * (1 - 0.07 * fk), sy: sb * (1 - 0.07 * fk) };

    if (q.pov) g.img('loin', { tf: { x: sw[0], y: sw[1] } });
    g.img('drap', { tf: { x: sw[0], y: sw[1] } });
    g.img('corps', { tf: tfCorps });
    g.img('tete', { tf: tfTete });

    // Traits du visage
    g.fx(1, (c) => {
      applyTf(c, tfTete);
      c.translate(HX, HY); c.rotate(RR);
      const o = clamp(q.eyes);
      // regard : vers le haut à gauche de l'écran, ramené dans le repère du visage
      const S = norm([-0.55, -0.83]);
      const gx = q.look * (S[0] * UX[0] + S[1] * UX[1]), gy = q.look * (S[0] * UY[0] + S[1] * UY[1]);
      brows(c, q.worry);
      for (const s of [-1, 1]) eye(c, s, o, gx, gy, q.worry);
      mouth(c, q, T);
    });

    g.img('poing', { tf: tfPoing });

    // Lumière
    g.fx(1, (c) => {
      c.translate(sw[0], sw[1]);
      const sun = 1 - 0.3 * q.dusk;
      const m = c.getTransform();
      if (q.dusk > 0) {
        const d = q.dusk;
        c.globalCompositeOperation = 'multiply';
        c.fillStyle = `rgb(${n1(lerp(255, 160, d))},${n1(lerp(255, 165, d))},${n1(lerp(255, 184, d))})`;
        c.fillRect(-600, -800, 3200, 2400);
      }
      // ombre froide du côté opposé à la fenêtre
      c.globalCompositeOperation = 'multiply';
      let gr = c.createLinearGradient(1500, 100, 300, 1100);
      gr.addColorStop(0, 'rgba(255,255,255,0)');
      gr.addColorStop(1, `rgba(160,170,200,${0.6 + 0.2 * q.dusk})`);
      c.fillStyle = gr;
      c.fillRect(-600, -800, 3200, 2400);
      // la lumière tombe : les bords loin du soleil s'assombrissent
      gr = c.createRadialGradient(1000, 470, 240, 1000, 470, 1250);
      gr.addColorStop(0, 'rgba(255,255,255,0)');
      gr.addColorStop(1, `rgba(112,110,132,${0.62 + 0.1 * q.dusk})`);
      c.fillStyle = gr;
      c.fillRect(-600, -800, 3200, 2400);
      // douce lumière de fenêtre sur le visage
      c.globalCompositeOperation = 'soft-light';
      gr = c.createRadialGradient(FACE[0] + 60, FACE[1] - 60, 20, FACE[0] + 60, FACE[1] - 60, 420);
      gr.addColorStop(0, `rgba(255,200,150,${0.32 - 0.12 * q.dusk})`);
      gr.addColorStop(1, 'rgba(255,206,160,0)');
      c.fillStyle = gr;
      c.fillRect(-600, -800, 3200, 2400);
      // la bande de soleil
      const lm = lightMap(c, q, T);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalCompositeOperation = 'soft-light';
      c.globalAlpha = 0.95 * sun;
      c.drawImage(lm, 0, 0);
      c.globalCompositeOperation = 'screen';
      c.globalAlpha = 0.3 * sun;
      c.drawImage(lm, 0, 0);
      c.globalAlpha = 1;
      c.setTransform(m);
      // halo de la fenêtre, en haut à droite (atmosphère)
      c.globalCompositeOperation = 'screen';
      gr = c.createRadialGradient(2100, -200, 50, 2100, -200, 1500);
      gr.addColorStop(0, `rgba(255,200,140,${0.2 * (1 - q.dusk)})`);
      gr.addColorStop(1, 'rgba(255,200,140,0)');
      c.fillStyle = gr;
      c.fillRect(-600, -800, 3200, 2400);
      // rayons dans l'air, au-dessus de la bande
      c.save();
      c.transform(DL[0], DL[1], NL[0], NL[1], C0[0], C0[1]);
      for (const [v, w, a, f] of [[-120, 60, 0.06, 0.5], [30, 90, 0.05, 0.7], [150, 50, 0.045, 0.9]]) {
        const al = a * (1 - 0.7 * q.dusk) * (0.75 + 0.25 * Math.sin(T * f + v));
        const rg = c.createLinearGradient(0, v - w, 0, v + w);
        rg.addColorStop(0, 'rgba(255,214,150,0)');
        rg.addColorStop(0.5, `rgba(255,214,150,${al})`);
        rg.addColorStop(1, 'rgba(255,214,150,0)');
        c.fillStyle = rg;
        c.fillRect(-1600, v - w, 3200, 2 * w);
      }
      // poussière qui danse dans le soleil
      for (const d of DUST) {
        const u = ((d.u + T * 9 * d.sp + 1300) % 2600) - 1300;
        const v = d.v + Math.sin(T * d.sp + d.ph) * 14;
        const lit = bandAt(v, q.dusk) * (1 - 0.5 * q.dusk) * (0.5 + 0.5 * Math.sin(T * 1.7 * d.sp + d.ph * 3));
        if (lit < 0.03) continue;
        const rr = d.big ? 9 + d.s * 5 : d.s * 1.6;
        const rg = c.createRadialGradient(u, v, 0, u, v, rr);
        rg.addColorStop(0, `rgba(255,236,196,${(d.big ? 0.12 : 0.75) * lit})`);
        rg.addColorStop(1, 'rgba(255,236,196,0)');
        c.fillStyle = rg;
        c.beginPath(); c.arc(u, v, rr, 0, TAU); c.fill();
      }
      c.restore();
    });

    // Premier plan : barreaux flous au bord droit (placés à l'écran)
    const FW = g.portrait ? 864 : 1920;
    const place = (fx, fy) => [cam.x + ((fx - 0.5) * FW) / cam.z, cam.y + ((fy - 0.5) * 1080) / cam.z];
    if (q.fg > 0) {
      const [ax, ay] = place(g.portrait ? 0.97 : 0.86, 0.5);
      const sc = (g.portrait ? 0.72 : 0.95) * Math.pow(cam.z, 0.25) / cam.z;
      g.img('premier', {
        alpha: (g.portrait ? 0.78 : 0.88) * q.fg,
        tf: { ox: 170, oy: 700, x: ax - 170 + sw[0] * 1.6, y: ay - 700 + sw[1] * 1.6, sx: sc, sy: sc * (g.portrait ? 1.3 : 1.1) },
        clip: (c) => { c.beginPath(); c.rect(-200, -100, 1170, 1600); },
      });
    }
    if (q.rail > 0) {
      const [ax, ay] = place(0.5, q.rail);
      g.img('premier', {
        tf: { ox: 1700, oy: 270, x: ax - 1700 + sw[0] * 1.9, y: ay - 270 + sw[1] * 1.9, sx: 1.7 / cam.z, sy: 0.85 / cam.z },
        clip: (c) => { c.beginPath(); c.rect(970, -200, 1600, 900); },
      });
    }

    // Finition : un peu de densité dans les valeurs, comme une pellicule
    g.screen((c) => {
      c.globalCompositeOperation = 'soft-light';
      c.globalAlpha = 0.28;
      c.drawImage(c.canvas, 0, 0);
    });

    // La lumière baisse : un voile froid unifie aussi le premier plan
    if (q.dusk > 0) {
      g.screen((c, W, H) => {
        const d = q.dusk;
        c.globalCompositeOperation = 'multiply';
        c.fillStyle = `rgb(${n1(lerp(255, 222, d))},${n1(lerp(255, 224, d))},${n1(lerp(255, 236, d))})`;
        c.fillRect(0, 0, W, H);
        c.globalCompositeOperation = 'soft-light';
        const gr = c.createLinearGradient(W, 0, 0, H);
        gr.addColorStop(0, `rgba(255,180,140,${0.18 * d})`);
        gr.addColorStop(1, `rgba(60,80,130,${0.3 * d})`);
        c.fillStyle = gr;
        c.fillRect(0, 0, W, H);
      });
    }
  },

  shots: {
    // Lent travelling avant : il dort
    sieste: {
      dur: 6.5,
      cam: (t, portrait) => {
        const k = t / 6.5;
        return portrait
          ? { x: lerp(905, 885, k), y: lerp(500, 468, k), z: lerp(1.0, 1.12, k) }
          : { x: lerp(1010, 950, k), y: lerp(524, 486, k), z: lerp(1.0, 1.12, k) };
      },
      p: (t) => ({ suck: seg(t, 3.2, 3.8) * (1 - seg(t, 4.8, 5.5)) }),
    },
    // Plus serré sur le visage : il dort ; le poing se relâche un peu vers 1,2 s
    clic: {
      dur: 4.5,
      cam: (t, portrait) => {
        const k = t / 4.5;
        return portrait
          ? { x: lerp(872, 866, k), y: lerp(420, 414, k), z: lerp(1.72, 1.78, k) }
          : { x: lerp(860, 852, k), y: lerp(430, 424, k), z: lerp(1.86, 1.93, k) };
      },
      p: (t) => ({ fist: lerp(0.5, 0.1, seg(t, 1.2, 2.3)) }),
    },
    // Même cadrage : il ouvre les yeux, regarde vers le haut à gauche, inquiet
    reveil: {
      dur: 6,
      cam: (t, portrait) => {
        const k = t / 6;
        return portrait
          ? { x: lerp(866, 860, k), y: lerp(414, 408, k), z: lerp(1.78, 1.85, k) }
          : { x: lerp(852, 842, k), y: lerp(424, 416, k), z: lerp(1.93, 2.02, k) };
      },
      p: (t) => {
        const open = 0.45 * seg(t, 0.95, 1.25) + 0.55 * seg(t, 1.5, 1.95);
        const blink = 1 - 0.85 * seg(t, 4.1, 4.2, ease.lin) * (1 - seg(t, 4.25, 4.42, ease.lin));
        return {
          eyes: open * blink,
          look: seg(t, 1.8, 2.8),
          worry: 0.85 * seg(t, 2.1, 3.3),
          fist: lerp(0.5, 1, seg(t, 2.0, 2.9)),
          mouth: lerp(0.6, 0.1, seg(t, 1.4, 2.6)),
          breath: lerp(1, 1.3, seg(t, 1, 3)),
          rate: lerp(1, 1.25, seg(t, 1, 3)),
        };
      },
    },
    // Un peu plus large, apaisé ; la lumière baisse lentement. Dernière image du film
    fin: {
      dur: 7,
      cam: (t, portrait) => {
        const k = t / 7;
        return portrait
          ? { x: 880, y: lerp(452, 456, k), z: lerp(1.3, 1.24, k) }
          : { x: lerp(926, 932, k), y: lerp(468, 472, k), z: lerp(1.4, 1.32, k) };
      },
      p: (t) => ({ dusk: seg(t, 0.2, 7, ease.inOut), rate: 0.85 }),
    },
    // Vue subjective : un adulte debout, penché sur le berceau, s'approche
    pov: {
      dur: 6.5,
      cam: (t, portrait) => {
        const k = t / 6.5;
        return portrait
          ? { x: lerp(890, 875, k), y: lerp(430, 446, k), z: lerp(0.86, 0.95, k) }
          : { x: lerp(985, 955, k), y: lerp(420, 446, k), z: lerp(0.86, 0.95, k) };
      },
      p: (t) => ({ sway: 0.6, pov: 1, fg: 0, rail: lerp(0.96, 1.0, t / 6.5) }),
    },
  },
};
