/* ==========================================================================
   Décor « a3-pilules » — Acte 3, le sondage. Une paume ouverte, vue de
   dessus, et les deux gélules.

   Une main adulte (main droite, paume vers le ciel, pouce à droite) vue
   en plongée : c'est notre main, tenue au-dessus de l'eau. Les doigts,
   raccourcis par la vue d'en haut, se recourbent mollement vers la paume et
   se touchent ; la paume se creuse pour tenir les gélules. Elle sort d'une
   manche de lin crème, au revers marqué, qui entre par le bas à droite. Au
   creux de la paume, nettes et brillantes, deux simples gélules : la bleue
   à gauche, la rouge à droite, posées en V ouvert vers les doigts. Ce sont
   les deux seules couleurs saturées de l'image.

   Le fond est la surface du lac vue d'en haut, floue : le reflet du ciel
   pêche et lavande, de longues rides, et à droite la colonne de
   scintillements du soleil levant, qui deviennent de petits disques dorés
   (bokeh) hors de la profondeur de champ. Pas d'horizon : on regarde sa
   main, et l'eau dessous. Le soleil se lève à droite : lumière rasante et
   dorée venue du haut à droite, filet de soleil sur les bords droits, ombres
   bleu-lavande longues, portées vers le bas à gauche.

   Les gélules sont dessinées en procédural (elles restent nettes à tous les
   grossissements) : volume du cylindre, reflet chaud qui glisse le long de
   la gélule, reflet du ciel sur le dos, rebond chaud de la peau dessous,
   ombre portée sur la paume et petite tache de lumière colorée qui traverse
   la gélatine (caustique). La coiffe, un rien plus large et plus claire,
   recouvre le corps : un décrochement et une ombre en anneau à la jointure.
   Un grain très léger les fait appartenir au monde peint.

   La main est dessinée dans son propre repère : origine au milieu de la
   paume, x vers le pouce, y vers le poignet ; on la pose dans le cadre par
   une translation et une petite rotation (doigts un peu vers la gauche,
   poignet vers le bas à droite).

   Paramètres (p) :
     glint   0 → 1   le reflet du soleil glisse le long des gélules (la bleue
                     d'abord, puis la rouge), et finit sur le bout arrondi
     sun     0 → 1   le soleil monte : la lumière se réchauffe un peu
     breath  0 / 1   la main vit (respiration, très faible)
     dbg     0 / 1   (contrôle) les deux gélules en grand, seules

   Plan : « paume » (6,5 s). Lente poussée vers les gélules ; le mouvement
   s'apaise à la fin, qui sert d'image figée du choix.
   ========================================================================== */
import { rng, lin, rad } from '../kit.js';
import { TAU, clamp, lerp, ease, seg } from '../../film/engine.js';

const ID = 'a3-pilules';
const u = (n) => `${ID}-${n}`;
const url = (n) => `url(#${ID}-${n})`;
const DEG = Math.PI / 180;
const HOME = { x: 960, y: 540, z: 1 };

/* --------------------------------------------------------------------------
   Outils de tracé
   -------------------------------------------------------------------------- */
const n1 = (v) => Math.round(v * 10) / 10;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const rotv = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
const perp = (v) => [-v[1], v[0]];
const norm = ([x, y]) => { const m = Math.hypot(x, y) || 1; return [x / m, y / m]; };
const P2 = (p) => `${n1(p[0])},${n1(p[1])}`;

// Courbe lisse (Catmull-Rom → Bézier) passant par les points
function curve(pts, closed = false) {
  const n = pts.length;
  const g = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${P2(pts[0])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += `C${n1(p1[0] + (p2[0] - p0[0]) / 6)},${n1(p1[1] + (p2[1] - p0[1]) / 6)} ` +
      `${n1(p2[0] - (p3[0] - p1[0]) / 6)},${n1(p2[1] - (p3[1] - p1[1]) / 6)} ${P2(p2)}`;
  }
  return closed ? d + 'Z' : d;
}

// Membre : contour d'un « boudin » le long d'un axe, rayons variables, bouts ronds
function tube(c, r) {
  const n = c.length, A = [], B = [];
  const tan = (i) => norm(sub(c[Math.min(n - 1, i + 1)], c[Math.max(0, i - 1)]));
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
  return curve([...A, ...cap(n - 1, [q, 0, -q]), ...B.reverse(), ...cap(0, [-3 * q, Math.PI, 3 * q])], true);
}

const paths = (arr) => arr.map((d) => `<path d="${d}"/>`).join('');
const line = (d, color, w, op, blur = 2) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${n1(w)}" stroke-linecap="round" stroke-linejoin="round" opacity="${n1(op * 100) / 100}"${blur ? ` filter="${url('f' + blur)}"` : ''}/>`;
const ell = (c, rx, ry, rot, fill, op, blur) =>
  `<ellipse cx="${n1(c[0])}" cy="${n1(c[1])}" rx="${n1(rx)}" ry="${n1(ry)}" transform="rotate(${n1(rot)} ${n1(c[0])} ${n1(c[1])})" fill="${fill}" opacity="${op}"${blur ? ` filter="${url('f' + blur)}"` : ''}/>`;

/* --------------------------------------------------------------------------
   La lumière : soleil levant à droite, un peu au-dessus de l'horizon, donc
   venu du haut à droite du cadre. LT pointe vers le soleil (repère écran).
   -------------------------------------------------------------------------- */
const LT = norm([0.82, -0.57]);

/* --------------------------------------------------------------------------
   Pose de la main dans le cadre
   -------------------------------------------------------------------------- */
const HX = 958, HY = 548;              // milieu de la paume
const HROT = -22;                      // degrés : doigts vers le haut à gauche
const LH = rotv(LT, -HROT * DEG);      // la lumière dans le repère de la main
const toS = (p) => add([HX, HY], rotv(p, HROT * DEG));   // main → décor
const WRIST = toS([0, 260]);           // pivot de la respiration (dans la manche)

/* --------------------------------------------------------------------------
   Filtres propres au décor
   -------------------------------------------------------------------------- */
const blurF = (s) =>
  `<filter id="${u('f' + s)}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
const texF = (id, freq, amp, seed) =>
  `<filter id="${u(id)}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 1" result="g"/>` +
  `<feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="${amp}" k2="${1 - amp / 2}" k3="0" k4="0" result="m"/>` +
  `<feComposite in="m" in2="SourceGraphic" operator="in"/></filter>`;
// Volume : le cœur de la forme, rongé puis flouté, décalé vers la lumière ;
// « v » donne le corps (bords sombres), « h » le modelé clair côté soleil
function volSet(tag, L) {
  const f = (kind, k, er, bl, off) =>
    `<filter id="${u(tag + '-' + kind + k)}" x="-25%" y="-25%" width="150%" height="150%">` +
    `<feMorphology in="SourceGraphic" operator="erode" radius="${er}" result="e"/>` +
    `<feGaussianBlur in="e" stdDeviation="${bl}" result="b"/>` +
    `<feOffset in="b" dx="${n1(L[0] * off)}" dy="${n1(L[1] * off)}" result="o"/>` +
    `<feComposite in="o" in2="SourceAlpha" operator="in"/></filter>`;
  return f('v', 'm', 4, 6, 3) + f('v', 'l', 10, 13, 6) + f('h', 'm', 9, 8, 7) + f('h', 'l', 22, 18, 15);
}
const volG = (inner, shade, base, light, tag, k = 'm', lo = 0.6) =>
  `<g fill="${shade}">${inner}</g><g fill="${base}" filter="${url(tag + '-v' + k)}">${inner}</g>` +
  (light ? `<g fill="${light}" opacity="${lo}" filter="${url(tag + '-h' + k)}">${inner}</g>` : '');

// Liseré : bande le long du bord tourné vers la lumière (sgn = 1) ou vers l'ombre (−1)
const rimF = (id, L, sgn, off, blur, color, op) =>
  `<filter id="${u(id)}" x="-10%" y="-10%" width="120%" height="120%">` +
  `<feOffset in="SourceAlpha" dx="${n1(-L[0] * off * sgn)}" dy="${n1(-L[1] * off * sgn)}" result="o"/>` +
  `<feComposite in="SourceAlpha" in2="o" operator="out" result="e"/>` +
  `<feGaussianBlur in="e" stdDeviation="${blur}" result="b"/>` +
  `<feComposite in="b" in2="SourceAlpha" operator="in" result="c"/>` +
  `<feFlood flood-color="${color}" flood-opacity="${op}"/>` +
  `<feComposite in2="c" operator="in"/></filter>`;
// Dégradé en repère utilisateur, le long de la lumière (du côté soleil vers l'ombre)
const sideGrad = (id, L, R, stops) =>
  `<linearGradient id="${u(id)}" gradientUnits="userSpaceOnUse" x1="${n1(L[0] * R)}" y1="${n1(L[1] * R)}" x2="${n1(-L[0] * R)}" y2="${n1(-L[1] * R)}">` +
  stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('') + '</linearGradient>';

const FX = [
  volSet('h', LH), volSet('s', LH),
  // filet de soleil franc à droite ; à gauche, la peau s'éteint dans le lavande
  rimF('rim-sun', LH, 1, 10, 3, '#fff3da', 1), rimF('rim-sun2', LH, 1, 3, 1, '#fff6e6', 0.9),
  rimF('rim-sss', LH, -1, 7, 3, '#c25a44', 0.3), rimF('rim-nuit', LH, -1, 22, 9, '#5f5070', 0.6),
  // côté pouce chaud, côté auriculaire dans une ombre lavande et rosée
  sideGrad('g-ombre', LH, 210, [[0, '#ffbf86', 0.25], [0.36, '#a48a8e', 0], [0.58, '#a4807e', 0.38], [1, '#7a6888', 0.8]]),
  sideGrad('g-lin', LH, 260, [[0, '#fff6e6', 0.25], [0.5, '#8f8fb5', 0], [1, '#8f8fb5', 0.45]]),
  ...Array.from({ length: 30 }, (_, i) => i + 1).map(blurF), // f1 … f30
  texF('peau', 0.018, 0.16, 4), texF('pore', 0.09, 0.08, 13), texF('lin', 0.16, 0.2, 9),
].join('');

/* --------------------------------------------------------------------------
   La main (repère local : origine au milieu de la paume, x vers le pouce,
   y vers le poignet).

   Une paume droite tournée vers le ciel, vue d'en haut, un peu inclinée :
   elle se présente en coupe, plus large que longue. Ce qui la fait lire
   comme une main, d'après l'anatomie :
   - les quatre doigts naissent sur un arc (le majeur le plus haut, l'index
     et l'annulaire un peu plus bas, l'auriculaire juste en dessous de
     l'annulaire) ; vus côté paume, leurs trois segments sont presque égaux,
     mais ils se recourbent vers nous : le raccourci écrase les derniers ;
   - chaque doigt s'affine vers le bout, ses pulpes bombent entre les plis
     (double à la base et au milieu, simple au dernier) ;
   - le pouce ne part pas du bord de la paume : il sort de l'éminence
     thénar, le gros coussin charnu qui occupe tout le bas du côté pouce
     jusqu'au poignet ; il monte en s'écartant, puis son bout revient vers
     les doigts ;
   - côté auriculaire, l'éminence hypothénar, longue et plus basse ;
   - au milieu, le creux, cerné par les deux éminences et le bourrelet sous
     les doigts : c'est là que reposent les gélules.
   -------------------------------------------------------------------------- */
const SKIN = {
  base: '#e2b394', shade: '#b98568', cool: '#8f8fb5', hollow: '#9c7a7e', light: '#ffd9b8', deep: '#8a5548',
  crease: '#9a614c', flush: '#e3917c', rim: '#c9614a', sun: '#ffd8a8',
};

// La paume, du poignet (côté auriculaire) au poignet (côté pouce) ; le haut
// est caché par la base des doigts, le bas par la manche
const PALM = [
  [-98, 250], [-100, 170], [-106, 110], [-110, 40], [-108, -20], [-102, -80], [-96, -112],
  [-43, -142], [12, -153], [71, -150], [128, -126],
  [146, -98], [164, -50], [184, 0], [186, 58], [164, 112], [128, 146], [110, 250],
];
// Les doigts. (base : là où le doigt quitte la paume, côté paume ; angle par
// rapport à l'axe de la main, positif vers le pouce ; longueurs des segments
// à l'écran, du pli de la base au pli du milieu, au dernier pli, au bout ;
// largeurs à la base, au milieu, au dernier pli, au bout ; courbures entre
// segments en degrés, qui referment un peu les doigts vers le majeur)
const FINGERS = [
  { name: 'index', base: [99, -130], ang: 6, L: [84, 56, 40], w: [58, 52, 47, 46], bend: [-7, -10] },
  { name: 'majeur', base: [41, -140], ang: 1, L: [95, 62, 44], w: [60, 54, 49, 48], bend: [-1, -2] },
  { name: 'annulaire', base: [-17, -135], ang: -4, L: [86, 57, 40], w: [56, 50, 46, 45], bend: [6, 8] },
  { name: 'auriculaire', base: [-69, -117], ang: -7, L: [66, 44, 33], w: [48, 43, 39, 38], bend: [8, 11] },
].map((f) => {
  const d1 = rotv([0, -1], f.ang * DEG), d2 = rotv(d1, f.bend[0] * DEG), d3 = rotv(d2, f.bend[1] * DEG);
  const [r0, r1, r2, rt] = f.w.map((w) => w / 2);
  const mcp = f.base, pip = add(mcp, mul(d1, f.L[0])), dip = add(pip, mul(d2, f.L[1]));
  const tip = add(dip, mul(d3, Math.max(4, f.L[2] - rt)));   // centre du bout arrondi
  const root = add(mcp, mul(d1, -46));                       // (sous la paume)
  // le contour : évasé dans la paume, une pulpe qui bombe à peine au milieu
  // de chaque segment, un léger étranglement aux plis
  const S = [
    [root, r0 * 1.16], [mix(root, mcp, 0.5), r0 * 1.1], [mcp, r0 * 1.02],
    [mix(mcp, pip, 0.4), lerp(r0, r1, 0.4) * 1.035], [mix(mcp, pip, 0.75), lerp(r0, r1, 0.75) * 1.02], [pip, r1 * 0.97],
    [mix(pip, dip, 0.5), lerp(r1, r2, 0.5) * 1.035], [dip, r2 * 0.97],
    [mix(dip, tip, 0.5), lerp(r2, rt, 0.5) * 1.03], [tip, rt],
  ];
  const pts = S.map((v) => v[0]), rr = S.map((v) => v[1]);
  return { ...f, d1, d2, d3, r0, r1, r2, rt, mcp, pip, dip, tip, root, pts, rr, d: tube(pts, rr) };
});
// Le pouce : sa base est noyée dans l'éminence thénar, près du poignet ; il
// monte en s'écartant de l'index, et son bout revient vers les doigts. Il est
// tourné sur le côté : on voit sa pulpe et son flanc.
const THUMB = (() => {
  // (deux phalanges : de la sortie du thénar à l'articulation, puis la
  // dernière, dont la pulpe s'arrondit et revient vers les doigts)
  const c = [[92, 104], [128, 46], [160, -4], [181, -50], [191, -94], [192, -134], [181, -166]];
  const r = [50, 40, 32.5, 28.5, 26, 26.5, 24];
  return { c, r, mcp: c[2], ip: c[4], d: tube(c, r) };
})();
const SIL = [curve(PALM, true), THUMB.d, ...FINGERS.map((f) => f.d)];
const HDY = 40; // décalage de la main (et de la manche) sous les gélules

function handSVG() {
  const L = LH, side = (n) => (dot(n, L) > 0 ? n : mul(n, -1));
  const r = rng(314);
  const ang = (d) => Math.atan2(d[1], d[0]) / DEG;
  // (la main entière descend un peu sous les gélules : ses doigts de pleine
  // longueur doivent tenir dans le cadre)
  let s = `<g transform="translate(0 ${HDY})"><clipPath id="${u('c-main')}">${paths(SIL)}</clipPath>`;
  // ce qui dépasse de la paume (le contour des doigts s'y arrête)
  s += `<mask id="${u('m-doigts')}" maskUnits="userSpaceOnUse" x="-500" y="-600" width="1000" height="1100">` +
    `<rect x="-500" y="-600" width="1000" height="1100" fill="#fff"/><path d="${curve(PALM, true)}" fill="#000" filter="${url('f4')}"/></mask>`;
  // l'intérieur sombre de la manche, sous le poignet
  s += ell([-4, 152], 128, 30, 6, '#5b4b46', 0.85, 6);
  s += `<g filter="${url('peau')}"><g filter="${url('pore')}">`;
  s += volG(paths(SIL), SKIN.shade, SKIN.base, SKIN.light, 'h', 'm', 0.55);
  s += `<g clip-path="url(#${u('c-main')})">`;

  // le creux de la paume, cerné par les éminences : un fond lavande et rosé
  s += ell([2, -30], 100, 100, 0, '#9a5e5a', 0.66, 26);
  s += ell([10, -32], 70, 72, 0, SKIN.hollow, 0.58, 16);
  // la paroi côté auriculaire regarde le soleil : elle s'éclaire, et sa
  // lèvre dessine le bord de la coupe
  s += ell([-80, -10], 26, 100, 2, SKIN.light, 0.42, 14);
  s += line(curve([[-86, -100], [-96, -40], [-98, 30], [-90, 104]]), '#fff0dc', 10, 0.5, 5);
  // le bourrelet sous les doigts, autre bord de la coupe, pris dans le soleil
  s += line(curve([[-92, -104], [-40, -124], [14, -130], [70, -126], [122, -108]]), '#ffe6cc', 14, 0.34, 7);
  // l'éminence thénar : le gras du pouce, gros et chaud, éclairé sur son dos ;
  // son flanc intérieur, tourné vers le creux, retombe dans l'ombre
  s += ell([128, 62], 46, 82, -16, SKIN.light, 0.62, 18);
  s += ell([150, 44], 16, 54, -18, '#fff0dc', 0.45, 7);
  s += ell([106, 104], 36, 44, -10, SKIN.flush, 0.22, 12);
  s += ell([72, 40], 28, 84, -10, '#7f6276', 0.42, 14);
  // l'éminence hypothénar, longue et basse, côté ombre
  s += ell([-96, 50], 24, 104, 3, SKIN.cool, 0.22, 16);
  // le bourrelet sous les doigts : une rangée de coussinets
  for (const f of FINGERS) s += ell(add(f.mcp, mul(f.d1, -16)), f.r0 * 0.8, 15, f.ang, SKIN.light, 0.32, 6);
  s += ell([-6, -126], 120, 18, -4, SKIN.flush, 0.12, 12);
  // le talon de la main, juste au-dessus du revers
  s += ell([-10, 132], 96, 34, 0, '#f4d4bc', 0.42, 14);

  // les plis de la paume : francs mais brisés en deux ou trois traits,
  // chacun bordé d'un fil de lumière côté soleil
  const crease = (pts, w, op) =>
    line(curve(pts), SKIN.crease, w, op, 1) +
    line(curve(pts.map((p) => add(p, mul(L, 3)))), '#fff0e2', w * 0.7, op * 0.6, 1);
  const broken = (segs, w, op) => segs.map((g, i) => crease(g, w * (1 - 0.15 * i), op * (1 - 0.12 * i))).join('');
  s += broken([[[-144, -78], [-104, -88], [-58, -96]], [[-50, -98], [0, -108], [44, -124]], [[50, -127], [64, -140]]], 3.4, 0.55);   // pli du haut
  s += broken([[[148, -84], [110, -70], [68, -58]], [[58, -55], [8, -42], [-42, -26]], [[-52, -22], [-90, -8]]], 3.2, 0.5);           // pli du milieu
  s += broken([[[146, -82], [108, -56], [84, -18]], [[80, -6], [68, 36], [72, 82]], [[76, 96], [92, 138]]], 3.6, 0.55);               // pli du pouce
  s += crease([[-24, 22], [-16, 62], [-6, 106]], 2, 0.2);                                                                        // pli léger
  // ombre douce au pied de l'éminence thénar
  s += line(curve([[132, -80], [90, -34], [68, 24], [66, 90], [80, 146]]), '#7d5a68', 26, 0.24, 12);

  // les doigts : modelé, pulpes, plis des articulations
  const fold = (c, d, rr, len, bow, op, w) => {
    const n = perp(d);
    const a = add(c, mul(n, rr * len)), b = sub(c, mul(n, rr * len * (0.8 + 0.3 * r()))), m = add(c, mul(d, -bow));
    s += line(`M${P2(a)}Q${P2(m)} ${P2(b)}`, SKIN.crease, w, op, 1);
    s += line(`M${P2(add(a, mul(d, 2.6)))}Q${P2(add(m, mul(d, 2.6)))} ${P2(add(b, mul(d, 2.6)))}`, '#fff0e2', w * 0.7, op * 0.55, 1);
  };
  // chaque doigt, un peu soulevé, porte une ombre lavande vers le bas à
  // gauche : sur son voisin et sur la paume, plus marquée sous le bout
  const sh = mul(L, -1);
  FINGERS.forEach((f, i) => {
    const o = mul(sh, 22), ot = mul(sh, 30);
    s += `<mask id="${u('m-om' + i)}" maskUnits="userSpaceOnUse" x="-500" y="-600" width="1000" height="1100">` +
      `<path d="${f.d}" fill="#fff" transform="translate(${n1(o[0])} ${n1(o[1])})" filter="${url('f5')}"/>` +
      ell(add(mix(f.dip, f.tip, 0.6), ot), f.rt * 1.05, f.rt * 0.9, 0, '#fff', 1, 6) +
      `<path d="${f.d}" fill="#000" filter="${url('f1')}"/></mask>`;
    s += `<rect x="-500" y="-600" width="1000" height="1100" fill="#625380" opacity=".5" mask="url(#${u('m-om' + i)})"/>`;
  });
  FINGERS.forEach((f) => {
    const n = f.pts.length;
    const dirs = f.pts.map((p, j) => norm(sub(f.pts[Math.min(n - 1, j + 1)], f.pts[Math.max(0, j - 1)])));
    const off = (kk) => f.pts.slice(2).map((p, j) => add(p, mul(side(perp(dirs[j + 2])), f.rr[j + 2] * kk)));
    s += line(curve(off(0.42)), SKIN.light, f.r1 * 0.5, 0.5, 4);
    // le flanc gauche, à l'ombre, lavande
    s += line(curve(off(-0.66)), '#7a6c94', f.r1 * 0.55, 0.5, 5);
    // le doigt voisin se lit par son contour
    s += `<g mask="url(#${u('m-doigts')})"><path d="${f.d}" fill="none" stroke="${SKIN.deep}" stroke-width="2.6" opacity=".4" filter="${url('f1')}"/></g>`;
    // les pulpes, bombées entre les plis
    const pads = [[mix(f.mcp, f.pip, 0.5), f.r0, f.d1, f.L[0]], [mix(f.pip, f.dip, 0.5), f.r1, f.d2, f.L[1]]];
    pads.forEach(([c, rr, d, len]) => {
      s += ell(add(c, mul(side(perp(d)), rr * 0.22)), len * 0.36, rr * 0.6, ang(d), SKIN.light, 0.42, 5);
    });
    // pliés, les segments se relèvent vers la lumière et vers nous : la
    // première phalange, couchée, reste dans le ton de la paume, la suivante
    // s'éclaire, la pulpe du bout est la plus claire
    s += ell(add(mix(f.mcp, f.pip, 0.45), mul(side(perp(f.d1)), -f.r0 * 0.2)), f.L[0] * 0.5, f.r0 * 0.9, ang(f.d1), '#8c7896', 0.2, 8);
    s += ell(add(mix(f.pip, f.dip, 0.5), mul(side(perp(f.d2)), f.r1 * 0.15)), f.L[1] * 0.42, f.r1 * 0.7, ang(f.d2), '#ffe4c8', 0.35, 7);
    // les articulations pliées : une ombre lavande dans chaque pli
    const dp = norm(add(f.d1, f.d2)), dd = norm(add(f.d2, f.d3));
    s += ell(add(f.pip, mul(dp, 1)), 7, f.r1 * 0.84, ang(dp), '#8a6488', 0.34, 2);
    s += ell(add(f.dip, mul(dd, 3)), 8, f.r2 * 0.88, ang(dd), '#7e5a84', 0.42, 2);
    // et, juste au-delà du pli, le segment suivant bombe dans la lumière
    s += ell(add(f.pip, mul(dp, 11)), 6, f.r1 * 0.7, ang(dp), '#ffe6cc', 0.4, 3);
    s += ell(add(f.dip, mul(dd, 13)), 6, f.r2 * 0.7, ang(dd), '#ffe6cc', 0.45, 3);
    // le bout se replie vers nous : sa pulpe se présente un peu de face,
    // ronde, rose et claire, prise dans la lumière de droite
    const tc = mix(f.dip, f.tip, 0.62);
    s += ell(tc, f.rt * 0.9, f.rt * 0.84, ang(f.d3), SKIN.flush, 0.36, 6);
    s += ell(add(tc, mul(side(perp(f.d3)), f.rt * 0.22)), f.rt * 0.72, f.rt * 0.66, ang(f.d3), '#fff2e0', 0.9, 3);
    // le bord de la pulpe, côté paume, dessine le repli
    {
      const c = add(f.dip, mul(f.d3, 5)), nn = perp(f.d3), Rr = f.rt * 0.78;
      const a = add(c, mul(nn, Rr)), b = sub(c, mul(nn, Rr)), m = add(c, mul(f.d3, Rr * 0.5));
      s += line(`M${P2(a)}Q${P2(m)} ${P2(b)}`, SKIN.deep, 2.8, 0.5, 1);
    }
    // les plis : double à la base et au milieu, simple au dernier
    const pinky = f.name === 'auriculaire';
    fold(add(f.mcp, mul(f.d1, 3)), f.d1, f.r0, pinky ? 0.55 : 0.66, 3 + 2 * r(), 0.48, 2.8);
    fold(add(f.mcp, mul(f.d1, 8)), f.d1, f.r0, 0.42, 2 + 2 * r(), 0.16, 1.6);
    fold(add(f.pip, mul(dp, -3)), dp, f.r1, 0.62, 2 + 2 * r(), 0.42, 2.4);
    fold(add(f.pip, mul(dp, 3.5)), dp, f.r1, 0.45, 2 + 2 * r(), 0.2, 1.6);
    // le bord de l'ongle pointe à peine au bout
    const tp = add(f.tip, mul(f.d3, f.rt * 0.8));
    s += ell(tp, f.rt * 0.55, 4, ang(f.d3) + 90, '#f6e2d4', 0.45, 1);
  });
  // les doigts se touchent à la base : sillons
  for (let i = 0; i < 3; i++) {
    const a = FINGERS[i], b = FINGERS[i + 1];
    const m = mix(a.mcp, b.mcp, 0.5), d = norm(add(a.d1, b.d1));
    s += line(curve([add(m, mul(d, -2)), add(m, mul(d, 26))]), SKIN.deep, 5, 0.36, 3);
  }

  // le creux entre le pouce et l'index, dans l'ombre
  s += line(curve([[166, -176], [152, -136], [142, -98], [132, -60]]), '#7d5a68', 14, 0.3, 6);
  // le pouce : pulpe, pli de l'articulation, pli de la base, flanc dans l'ombre
  {
    const tp = THUMB.c, td = norm(sub(tp[6], tp[4])), d2 = norm(sub(tp[4], tp[2]));
    const tn = side(perp(td));
    s += line(curve(tp.slice(1).map((p, j) => add(p, mul(side(perp(j < 3 ? d2 : td)), THUMB.r[j + 1] * 0.38)))), SKIN.light, 14, 0.5, 6);
    s += line(curve(tp.slice(2).map((p, j) => sub(p, mul(side(perp(j < 2 ? d2 : td)), THUMB.r[j + 2] * 0.6)))), SKIN.deep, 9, 0.22, 6);
    // la pulpe du bout, ronde et rose, et celle de la première phalange
    s += ell(mix(tp[5], tp[6], 0.45), 30, 22, ang(td), SKIN.flush, 0.3, 6);
    s += ell(add(mix(tp[5], tp[6], 0.35), mul(tn, 7)), 22, 14, ang(td), '#ffe4c8', 0.5, 5);
    s += ell(add(mix(tp[2], tp[4], 0.5), mul(side(perp(d2)), 6)), 32, 17, ang(d2), SKIN.light, 0.38, 6);
    // l'ongle, à peine : un fil clair sur le bord extérieur du bout
    const nb = add(add(tp[6], mul(tn, 18)), mul(td, -6));
    s += ell(nb, 14, 3, ang(td), '#f8e6da', 0.55, 1);
    s += ell(add(nb, mul(tn, 3)), 13, 1.6, ang(td), '#c79a88', 0.4, 0);
    // le pli de l'articulation (ombre lavande dans le pli), et celui où le
    // pouce sort du thénar
    const nI = perp(norm(add(td, d2)));
    s += line(`M${P2(add(THUMB.ip, mul(nI, 22)))}L${P2(sub(THUMB.ip, mul(nI, 20)))}`, '#7e6b8c', 10, 0.24, 5);
    s += line(`M${P2(add(THUMB.ip, mul(nI, 22)))}Q${P2(add(THUMB.ip, mul(d2, -5)))} ${P2(sub(THUMB.ip, mul(nI, 20)))}`, SKIN.crease, 2.4, 0.45, 1);
    const nM = perp(d2);
    s += line(`M${P2(add(THUMB.mcp, mul(nM, 26)))}Q${P2(add(THUMB.mcp, mul(d2, -7)))} ${P2(sub(THUMB.mcp, mul(nM, 22)))}`, SKIN.crease, 2.4, 0.32, 1);
  }
  // le côté pouce reste chaud, le côté auriculaire s'éteint dans le lavande
  s += `<rect x="-300" y="-420" width="600" height="800" fill="url(#${u('g-ombre')})"/>`;
  s += '</g></g></g>';
  // bords : la lumière chaude traverse la peau du côté de l'ombre, qui
  // s'assombrit ; filet de soleil franc sur les bords tournés vers lui
  s += `<g fill="#000" filter="${url('rim-nuit')}">${paths(SIL)}</g>`;
  s += `<g fill="#000" filter="${url('rim-sss')}">${paths(SIL)}</g>`;
  s += `<g fill="#000" filter="${url('rim-sun')}">${paths(SIL)}</g>`;
  s += `<g fill="#000" filter="${url('rim-sun2')}">${paths(SIL)}</g>`;
  return s + '</g>';
}

/* --------------------------------------------------------------------------
   La manche : lin crème, ample, qui couvre le poignet et sort du cadre
   -------------------------------------------------------------------------- */
const LINEN = { base: '#ebe0cc', shade: '#bdae96', light: '#fbf3e4', deep: '#9a8a74' };
function sleeveSVG() {
  const C = LINEN, L = LH;
  const body = curve([
    [-132, 262], [-60, 252], [10, 258], [80, 246], [136, 236], [170, 330], [196, 470], [214, 640],
    [100, 700], [-80, 700], [-170, 640], [-160, 480], [-148, 360],
  ], true);
  const cid = u('c-manche');
  // (la manche remonte jusqu'au talon de la main : pas de poignet nu ; son
  // revers est un peu relevé côté auriculaire, où le talon finit plus bas)
  let s = `<g transform="translate(0 -48) rotate(9 136 240)"><clipPath id="${cid}"><path d="${body}"/></clipPath>`;
  s += `<g filter="url(#paint)"><g filter="${url('lin')}">` + volG(`<path d="${body}"/>`, C.shade, C.base, C.light, 's', 'l', 0.7) + '</g>';
  s += `<g clip-path="url(#${cid})">`;
  // le revers : une large bande retournée, éclairée sur sa tranche, qui porte
  // une ombre nette sur la manche dessous
  s += line(curve([[-132, 268], [-60, 258], [10, 264], [80, 252], [136, 242]]), C.light, 8, 0.85, 1);
  s += line(curve([[-136, 330], [-60, 322], [10, 328], [84, 316], [150, 304]]), '#8a7a7e', 9, 0.5, 3);
  s += line(curve([[-136, 322], [-60, 314], [10, 320], [84, 308], [150, 296]]), C.deep, 2.4, 0.75, 1);
  s += line(curve([[-136, 316], [-60, 308], [10, 314], [84, 302], [150, 290]]), C.light, 3, 0.7, 1);
  // la couture du revers et deux petits plis où il se tasse
  s += line(curve([[-128, 286], [-60, 278], [10, 284], [80, 272], [138, 262]]), C.deep, 1.2, 0.4, 0);
  for (const [x0, y0] of [[-74, 268], [52, 262], [118, 252]]) {
    s += line(`M${x0},${y0 + 6}Q${x0 + 4},${y0 + 28} ${x0 - 2},${y0 + 50}`, C.deep, 4, 0.35, 2);
  }
  // plis du lin : de longues ombres, chacune bordée de clair côté soleil
  for (const [pts, a] of [
    [[[-52, 340], [-30, 450], [-24, 560], [6, 700]], 1, 16],
    [[[70, 336], [80, 410], [112, 540], [124, 700]], 0.8, 11],
    [[[-112, 356], [-128, 470], [-104, 640]], 0.75, 18],
    [[[10, 336], [24, 392], [20, 446]], 0.5, 8],
  ]) {
    s += line(curve(pts), C.deep, a > 0.7 ? 14 : 10, 0.4 * a, 6);
    s += line(curve(pts.map((p) => add(p, mul(L, 10)))), C.light, 8, 0.5 * a, 5);
  }
  // côté gauche, à l'ombre : le froid lavande du ciel
  s += `<rect x="-240" y="200" width="480" height="560" fill="url(#${u('g-lin')})"/>`;
  s += '</g></g></g>';
  return s;
}

const POSE = `transform="translate(${HX} ${HY}) rotate(${HROT})"`;
const MAIN = `<defs>${FX}</defs><g ${POSE}>${handSVG()}</g>`;
const MANCHE = `<defs>${FX}</defs><g ${POSE}>${sleeveSVG()}</g>`;

/* --------------------------------------------------------------------------
   Calque : l'aube sur le lac, très floue (vue plongeante au-dessus de l'eau)
   -------------------------------------------------------------------------- */
const FOND = (() => {
  const r = rng(23);
  let s = `<defs>
    ${lin(u('ciel'), [[0, '#b09cb8'], [0.4, '#9690b6'], [1, '#7c7aa8']])}
    ${lin(u('chaud'), [[0, '#e8b9a2', 0], [0.45, '#e2b2a4', 0.35], [0.75, '#f0c4a4', 0.8], [1, '#f4cfae', 0.85]], 0, 0, 1, 0)}
    ${lin(u('colonne'), [[0, '#ffeccc', 0], [0.4, '#ffeccc', 0.5], [0.6, '#ffeccc', 0.5], [1, '#ffeccc', 0]], 0, 0, 1, 0)}
  </defs>`;
  // l'eau, vue d'en haut : sous nos yeux elle reflète le haut du ciel, encore
  // lavande ; elle se réchauffe en pêche vers le soleil (à droite)
  s += `<rect x="-240" y="-140" width="2400" height="1360" fill="url(#${u('ciel')})"/>`;
  s += `<rect x="-240" y="-140" width="2400" height="1360" fill="url(#${u('chaud')})"/>`;
  // de longues rides ondulées : chacune a un flanc clair (le ciel chaud) et
  // un flanc lavande, plus serrées et plus fines vers le haut (plus loin)
  for (let i = 0; i < 64; i++) {
    const y0 = -120 + 1340 * r(), x0 = -300 + 2300 * r(), w = 300 + 800 * r();
    const k = 0.003 + 0.004 * r(), A = 6 + 10 * r(), ph = TAU * r(), sw = 10 + 16 * (y0 + 120) / 1340 + 6 * r();
    const pts = [];
    for (let x = x0; x <= x0 + w; x += 40) pts.push([x, y0 + A * Math.sin(k * x + ph)]);
    const warm = x0 + w / 2 > 1000;
    s += line(curve(pts), warm ? '#ffe4c8' : '#e4c4c6', sw, 0.55, 0);
    s += line(curve(pts.map(([x, y]) => [x, y + sw * 1.1])), '#6f6c9c', sw * 0.9, 0.42, 0);
  }
  // la colonne de scintillements du soleil, à droite : une bande chaude, et
  // des éclats courts et serrés, couchés sur les rides
  s += `<rect x="1230" y="-140" width="480" height="1360" fill="url(#${u('colonne')})"/>`;
  for (let i = 0; i < 170; i++) {
    const y = -120 + 1340 * r(), x = 1470 + (r() + r() + r() - 1.5) * 240;
    s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(10 + 30 * r())}" ry="${n1(5 + 5 * r())}" fill="#fffaf0" opacity="${n1((0.6 + 0.4 * r()) * 100) / 100}"/>`;
  }
  // la lumière froide du ciel tombe en bas à gauche
  s += `<rect x="-240" y="600" width="1100" height="620" fill="#7a78a8" opacity=".3" filter="${url('f30')}"/>`;
  return `<defs>${blurF(30)}</defs>` + s;
})();

/* --------------------------------------------------------------------------
   Les gélules (procédural, dans le repère de la main)
   -------------------------------------------------------------------------- */
const CAPS = [
  // bleue à gauche, rouge à droite ; posées en V ouvert vers les doigts
  // (angles donnés à l'écran, ramenés dans le repère de la main)
  { c: [-46, 6], ang: -104 - HROT, len: 118, r: 22, dark: [22, 52, 112], base: [63, 120, 201], lite: [118, 160, 226], hi: [169, 200, 240], glow: [110, 160, 255], ph: 0 },
  { c: [46, -4], ang: -66 - HROT, len: 118, r: 22, dark: [112, 26, 26], base: [200, 66, 58], lite: [228, 112, 98], hi: [242, 164, 154], glow: [255, 120, 96], ph: 0.3 },
];
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.round(clamp(a) * 1000) / 1000})`;
const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// Contour d'une demi-gélule : de x0 à x1, un bout arrondi du côté indiqué
function halfPath(c, x0, x1, r, roundLeft) {
  c.beginPath();
  if (roundLeft) {
    c.moveTo(x1, -r);
    c.lineTo(x0 + r, -r);
    c.arc(x0 + r, 0, r, -Math.PI / 2, Math.PI / 2, true);
    c.lineTo(x1, r);
  } else {
    c.moveTo(x0, -r);
    c.lineTo(x1 - r, -r);
    c.arc(x1 - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
    c.lineTo(x0, r);
  }
  c.closePath();
}
function capsulePath(c, len, r) {
  c.beginPath();
  c.moveTo(-len / 2 + r, -r);
  c.lineTo(len / 2 - r, -r);
  c.arc(len / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
  c.lineTo(-len / 2 + r, r);
  c.arc(-len / 2 + r, 0, r, Math.PI / 2, -Math.PI / 2, false);
  c.closePath();
}

// Une moitié peinte : cylindre éclairé d'un côté, rebond chaud de l'autre
function paintHalf(c, K, x0, x1, r, roundLeft, ly, warm) {
  const s = ly < 0 ? -1 : 1; // côté éclairé (en y local)
  halfPath(c, x0, x1, r, roundLeft);
  const gr = c.createLinearGradient(0, s * r, 0, -s * r);
  gr.addColorStop(0, rgba(mixc(K.lite, [255, 236, 210], 0.15 * warm), 1));
  gr.addColorStop(0.28, rgba(K.base, 1));
  gr.addColorStop(0.68, rgba(mixc(K.base, K.dark, 0.68), 1));
  gr.addColorStop(0.9, rgba(K.dark, 1));
  gr.addColorStop(1, rgba(mixc(K.dark, [226, 160, 128], 0.35), 1)); // rebond de la peau
  c.fillStyle = gr;
  c.fill();
}

// Un grain très léger (fixe, tiré une fois) pour que les gélules soient peintes
let GRAIN = null;
function grain(c) {
  if (!GRAIN) {
    const r = rng(77), n = 96;
    GRAIN = document.createElement('canvas');
    GRAIN.width = GRAIN.height = n;
    const g = GRAIN.getContext('2d'), im = g.createImageData(n, n);
    for (let i = 0; i < n * n; i++) {
      const v = 255 - 46 * r() * r();
      im.data[4 * i] = v; im.data[4 * i + 1] = v; im.data[4 * i + 2] = v; im.data[4 * i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
  }
  return c.createPattern(GRAIN, 'repeat');
}

function drawCapsule(c, K, q, T, rot) {
  const { len, r } = K;
  const Lc = rotv(LT, -rot); // la lumière dans le repère de la gélule
  const s = Lc[1] < 0 ? -1 : 1;
  const dir = Lc[0] > 0 ? 1 : -1; // le bout tourné vers le soleil
  const xc = len * 0.04; // la jointure : la coiffe (gauche) recouvre le corps
  const rc = r * 1.07;   // la coiffe, un rien plus large
  // le corps, avec l'ombre en anneau que la coiffe pose à la jointure
  paintHalf(c, K, -len * 0.1, len / 2, r, false, Lc[1], q.sun);
  c.save();
  halfPath(c, -len * 0.1, len / 2, r, false);
  c.clip();
  let gr = c.createLinearGradient(xc, 0, xc + 9, 0);
  gr.addColorStop(0, rgba(K.dark, 0.55));
  gr.addColorStop(1, rgba(K.dark, 0));
  c.fillStyle = gr;
  c.fillRect(xc, -r, 9, 2 * r);
  c.restore();
  // la coiffe, plus claire
  const Kc = { ...K, base: mixc(K.base, K.lite, 0.2), lite: mixc(K.lite, K.hi, 0.25) };
  paintHalf(c, Kc, -len / 2, xc, rc, true, Lc[1], q.sun);
  // la tranche de la coiffe : sombre côté ombre, un fil clair côté soleil
  c.lineWidth = 1.4;
  c.strokeStyle = rgba(K.dark, 0.6);
  c.beginPath(); c.moveTo(xc + 0.6, -rc); c.lineTo(xc + 0.6, rc); c.stroke();
  c.strokeStyle = rgba(K.hi, 0.6);
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(xc - 1, s * rc * 0.98); c.lineTo(xc - 1, s * rc * 0.62); c.stroke();

  c.save();
  capsulePath(c, len, rc);
  c.clip();
  // le grain, en multiply, à peine
  try {
    c.globalCompositeOperation = 'multiply';
    c.globalAlpha = 0.55;
    c.fillStyle = grain(c);
    c.fillRect(-len / 2, -rc, len, 2 * rc);
    c.globalAlpha = 1;
  } catch { /* pas de vrai canvas : pas de grain */ }
  c.globalCompositeOperation = 'screen';
  // la gélatine laisse passer un peu de lumière : le côté ombré s'allume par-dessous
  gr = c.createRadialGradient(0, -s * r * 0.55, 1, 0, -s * r * 0.55, r * 1.6);
  gr.addColorStop(0, rgba(K.glow, 0.0));
  gr.addColorStop(0.6, rgba(K.glow, 0.0));
  gr.addColorStop(1, rgba(K.glow, 0.18));
  c.fillStyle = gr;
  c.fillRect(-len / 2, -r * 1.1, len, r * 2.2);
  // le reflet du ciel, long et calme, sur le côté éclairé ; il s'interrompt
  // à la jointure (la coiffe le décale)
  const ys = s * r * 0.5;
  gr = c.createLinearGradient(-len / 2, 0, len / 2, 0);
  gr.addColorStop(0, rgba(K.hi, 0.0));
  gr.addColorStop(0.18, rgba(K.hi, 0.45));
  gr.addColorStop(0.82, rgba(K.hi, 0.45));
  gr.addColorStop(1, rgba(K.hi, 0.0));
  c.fillStyle = gr;
  for (const [x0, x1, dy] of [[-len / 2, xc - 2.5, s * 1.2], [xc + 4, len / 2, 0]]) {
    c.save();
    c.beginPath(); c.rect(x0, -rc, x1 - x0, 2 * rc); c.clip();
    c.beginPath();
    c.ellipse(0, ys + dy, len * 0.4, r * 0.16, 0, 0, TAU);
    c.fill();
    c.restore();
  }
  // le reflet du soleil glisse le long de la gélule (la rouge suit la bleue),
  // puis s'enroule sur le bout arrondi tourné vers le soleil
  const g = clamp(q.glint * (1 + K.ph) - K.ph);
  const run = 0.82;
  let gx, gy, gs = 1;
  if (g < run) {
    gx = dir * lerp(-len * 0.34, len / 2 - r, g / run);
    gy = ys * 0.9;
  } else {
    const a = lerp(0, 1.15, (g - run) / (1 - run)); // 0 : sur le dos, vers le bout
    gx = dir * (len / 2 - r + r * 0.62 * Math.sin(a));
    gy = ys * 0.9 * Math.cos(a);
    gs = 1 - 0.35 * Math.sin(a);
  }
  // halo, puis cœur franc (deux fois : il sature au blanc)
  for (const [w, h, a, op] of [[len * 0.46, r * 0.56, 0.55, 'screen'], [len * 0.26, r * 0.34, 0.9, 'screen'], [len * 0.17, r * 0.22, 1, 'screen'], [len * 0.12, r * 0.15, 0.8, 'lighter']]) {
    c.save();
    c.globalCompositeOperation = op;
    c.translate(gx, gy);
    c.scale(w * gs, h);
    gr = c.createRadialGradient(0, 0, 0, 0, 0, 1);
    gr.addColorStop(0, `rgba(255,250,238,${a})`);
    gr.addColorStop(0.45, `rgba(255,250,238,${a * 0.6})`);
    gr.addColorStop(1, 'rgba(255,250,238,0)');
    c.fillStyle = gr;
    c.fillRect(-1, -1, 2, 2);
    c.restore();
  }
  // petit éclat permanent sur le bout arrondi tourné vers le soleil
  const ex = dir * (len / 2 - r * 0.55);
  gr = c.createRadialGradient(ex, s * r * 0.45, 0, ex, s * r * 0.45, r * 0.4);
  gr.addColorStop(0, 'rgba(255,248,230,0.6)');
  gr.addColorStop(1, 'rgba(255,248,230,0)');
  c.fillStyle = gr;
  c.fillRect(ex - r, -r * 1.1, 2 * r, r * 2.2);
  c.restore();
}

// Ombres portées des gélules sur la paume (multiply), et la lumière colorée
// qui traverse la gélatine (caustique, en screen)
function drawShadows(c, q, k) {
  const Ld = norm(rotv(LT, -HROT * DEG)); // dans le repère de la main
  const sh = mul(Ld, -1);
  for (const K of CAPS) {
    const place = (o) => { c.translate(K.c[0] + o[0], K.c[1] + o[1]); c.rotate(K.ang * DEG); };
    const blob = (o, a, blur, col, grow = 1) => {
      c.save();
      // l'ombre est décalée en pixels de l'écran : on pousse la forme hors du
      // canvas dans ce repère-là, et l'ombre revient à sa place
      c.setTransform(new DOMMatrix().translate(-9000, 0).multiply(c.getTransform()));
      place(o);
      c.shadowColor = col.replace('A', a);
      c.shadowBlur = blur * k;
      c.shadowOffsetX = 9000;
      c.fillStyle = '#000';
      capsulePath(c, K.len * grow, K.r * grow);
      c.fill();
      c.restore();
    };
    c.globalCompositeOperation = 'multiply';
    // ombre longue et douce (lumière rasante d'aube), puis contact serré, plus sombre
    // (la forme traînée le long de la lumière : l'ombre s'allonge et pâlit)
    for (const o of [30, 24, 18, 12]) blob(mul(sh, o), 0.36, 3 + o * 0.25, 'rgba(84,60,100,A)', 1.0);
    blob(mul(sh, 9), 0.55, 6, 'rgba(92,60,86,A)', 1.0);
    blob(mul(sh, 4), 0.8, 3.5, 'rgba(78,44,56,A)', 0.96);
    // la caustique : un ovale de lumière teinté, dans l'ombre, près de la gélule
    c.globalCompositeOperation = 'screen';
    c.save();
    place(mul(sh, 26));
    c.scale(1, 0.42);
    const gr = c.createRadialGradient(0, 0, 0, 0, 0, K.len * 0.34);
    gr.addColorStop(0, rgba(K.glow, 0.4 + 0.1 * q.sun));
    gr.addColorStop(1, rgba(K.glow, 0));
    c.fillStyle = gr;
    c.fillRect(-K.len, -K.len, 2 * K.len, 2 * K.len);
    c.restore();
  }
}

/* --------------------------------------------------------------------------
   Les scintillements de l'eau, hors de la profondeur de champ (bokeh)
   -------------------------------------------------------------------------- */
// (petits, dorés, groupés dans la colonne du soleil, à droite de la main)
const BOKEH = (() => {
  const r = rng(91), out = [];
  for (let i = 0; i < 26; i++) {
    out.push({
      x: 1480 + (r() + r() - 1) * 200,
      y: 120 + 860 * r(),
      r: 6 + 14 * r(),
      a: 0.16 + 0.16 * r(),
      w: 0.6 + 1.4 * r(), ph: TAU * r(),
    });
  }
  return out;
})();
function bokeh(c, q, T) {
  c.globalCompositeOperation = 'screen';
  const col = [255, 214, 150];
  for (const b of BOKEH) {
    const tw = 0.55 + 0.45 * Math.sin(T * b.w + b.ph);
    const a = b.a * tw * (0.85 + 0.3 * q.sun);
    const x = b.x + 4 * Math.sin(T * 0.21 + b.ph), y = b.y;
    const gr = c.createRadialGradient(x, y, 0, x, y, b.r);
    gr.addColorStop(0, rgba(col, a * 0.6));
    gr.addColorStop(0.75, rgba(col, a * 0.8));
    gr.addColorStop(0.92, rgba(col, a * 0.7));
    gr.addColorStop(1, rgba(col, 0));
    c.fillStyle = gr;
    c.beginPath();
    c.arc(x, y, b.r, 0, TAU);
    c.fill();
  }
}

// Quelques poussières dorées dans la lumière rasante, qui dérivent lentement
// (seulement à droite, hors de la main)
const MOTES = (() => {
  const r = rng(57), out = [];
  for (let i = 0; i < 12; i++) {
    out.push({ x: 1360 + 300 * r(), y: 120 + 760 * r(), s: 1.4 + 2.2 * r(), v: 4 + 8 * r(), ph: TAU * r(), w: 0.4 + 0.8 * r() });
  }
  return out;
})();
function motes(c, T) {
  c.globalCompositeOperation = 'screen';
  for (const m of MOTES) {
    const x = m.x + m.v * T + 10 * Math.sin(T * 0.3 + m.ph), y = m.y - 0.5 * m.v * T + 6 * Math.sin(T * 0.5 + m.ph * 2);
    const a = 0.35 + 0.35 * Math.sin(T * m.w * 2 + m.ph);
    const R = m.s * 3.2;
    const gr = c.createRadialGradient(x, y, 0, x, y, R);
    gr.addColorStop(0, `rgba(255,240,214,${a.toFixed(3)})`);
    gr.addColorStop(0.3, `rgba(255,226,180,${(a * 0.5).toFixed(3)})`);
    gr.addColorStop(1, 'rgba(255,226,180,0)');
    c.fillStyle = gr;
    c.fillRect(x - R, y - R, 2 * R, 2 * R);
  }
}

// Le voile du soleil levant, depuis le haut à droite ; il se réchauffe
function veil(c, q, k) {
  c.globalCompositeOperation = 'screen';
  const gr = c.createRadialGradient(1900, 60, 40, 1900, 60, 1500);
  gr.addColorStop(0, `rgba(255,214,160,${k * (0.34 + 0.12 * q.sun)})`);
  gr.addColorStop(0.5, `rgba(255,206,150,${k * (0.1 + 0.05 * q.sun)})`);
  gr.addColorStop(1, 'rgba(255,206,150,0)');
  c.fillStyle = gr;
  c.fillRect(-300, -200, 2600, 1500);
}

/* --------------------------------------------------------------------------
   Le décor
   -------------------------------------------------------------------------- */
const DEF = { glint: 0.5, sun: 0.5, breath: 1 };
const tfHand = (q, T) => {
  const b = q.breath ? Math.sin((T * TAU) / 4.6) : 0;
  return { ox: WRIST[0], oy: WRIST[1], rot: 0.0035 * b, y: -1.2 * b, x: 0.6 * b };
};
// même transformation que le compositeur, pour poser les gélules sur la main
const applyTf = (c, t) => {
  c.translate(t.ox + t.x, t.oy + t.y);
  c.rotate(t.rot);
  c.translate(-t.ox, -t.oy);
};

export default {
  id: ID,
  home: HOME,
  bg: '#cdb8b8',
  layers: {
    // l'eau est loin sous la main : floue, mais on y lit encore les rides
    fond: { box: [-240, -140, 2400, 1360], svg: FOND, filters: ['b10'], res: 0.6, par: 0.55 },
    main: { box: [680, 150, 600, 820], svg: MAIN, filters: ['paint', 'ink'], res: 1.7 },
    // la manche est plus près de l'objectif : à peine floue
    manche: { box: [790, 500, 760, 760], svg: MANCHE, filters: ['b3'], res: 0.9, par: 1.06 },
  },

  render(g, p, T) {
    const q = { ...DEF, ...p };
    const tf = tfHand(q, T);

    // L'aube, floue, et ses scintillements
    g.img('fond');
    g.fx(0.55, (c) => { veil(c, q, 1); bokeh(c, q, T); });

    // La main
    g.img('main', { tf });
    g.img('manche', { tf: { ...tf, x: tf.x * 1.2, y: tf.y * 1.2 } });

    // Les gélules, leurs ombres et leurs reflets
    g.fx(1, (c) => {
      const m = c.getTransform();
      const k = Math.hypot(m.a, m.b);
      applyTf(c, tf);
      c.translate(HX, HY);
      c.rotate(HROT * DEG);
      drawShadows(c, q, k);
      c.globalCompositeOperation = 'source-over';
      for (const K of CAPS) {
        c.save();
        c.translate(K.c[0], K.c[1]);
        c.rotate(K.ang * DEG);
        drawCapsule(c, K, q, T, (HROT + K.ang) * DEG);
        c.restore();
      }
    });

    if (q.dbg) {
      g.fx(1, (c) => {
        c.fillStyle = '#d9b49a'; c.fillRect(0, 0, 1920, 1080);
        const k = Math.hypot(c.getTransform().a, c.getTransform().b);
        c.save(); c.translate(960, 540); c.scale(4, 4); c.rotate(HROT * DEG); drawShadows(c, q, k * 4); c.restore();
        c.globalCompositeOperation = 'source-over';
        CAPS.forEach((K) => { c.save(); c.translate(960, 540); c.scale(4, 4); c.rotate(HROT * DEG); c.translate(K.c[0], K.c[1]); c.rotate(K.ang * DEG); drawCapsule(c, K, q, T, (HROT + K.ang) * DEG); c.restore(); });
      });
      return;
    }
    // Le soleil chauffe le côté de la main tourné vers lui (bout du pouce, doigts)
    g.fx(1, (c) => {
      applyTf(c, tf);
      const o = toS([170, -170]);
      c.globalCompositeOperation = 'soft-light';
      const gr = c.createRadialGradient(o[0], o[1], 0, o[0], o[1], 420);
      gr.addColorStop(0, `rgba(255,190,120,${0.45 + 0.15 * q.sun})`);
      gr.addColorStop(1, 'rgba(255,190,120,0)');
      c.fillStyle = gr;
      c.fillRect(o[0] - 420, o[1] - 420, 840, 840);
    });

    // Le soleil rasant, devant tout : un léger voile doré en haut à droite,
    // et quelques poussières qui flottent dans la lumière
    g.fx(0.8, (c) => veil(c, q, 0.35));
    g.fx(0.9, (c) => motes(c, T));

    // Densité des valeurs, comme une pellicule ; ombres lavande sur les bords
    g.screen((c, W, H) => {
      c.globalCompositeOperation = 'soft-light';
      c.globalAlpha = 0.25;
      c.drawImage(c.canvas, 0, 0);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'multiply';
      const gr = c.createLinearGradient(0, H, W * 0.7, 0);
      gr.addColorStop(0, 'rgba(150,146,190,0.5)');
      gr.addColorStop(0.45, 'rgba(150,146,190,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
    });
  },

  shots: {
    // Lente poussée vers les gélules ; le reflet glisse, puis tout s'apaise
    paume: {
      dur: 6.5,
      cam: (t, portrait) => {
        const k = ease.out(clamp(t / 6.5)) * 0.7 + 0.3 * clamp(t / 6.5);
        return portrait
          ? { x: lerp(976, 962, k), y: lerp(510, 538, k), z: lerp(1.3, 1.52, k) }
          : { x: lerp(990, 962, k), y: lerp(500, 540, k), z: lerp(1.16, 1.46, k) };
      },
      p: (t) => ({
        glint: seg(t, 1, 5),
        sun: clamp(t / 6.5),
        breath: 1,
      }),
    },
  },
};
