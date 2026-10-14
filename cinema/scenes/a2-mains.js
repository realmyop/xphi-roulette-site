/* ==========================================================================
   Décor « a2-mains » — Acte 2, gros plan en plongée : les mains sur la table.

   Le pendant tendre du gros plan du bébé de l'Acte 1. La main de A (peau
   mate, manche de gilet terre cuite) tient la lettre du test génétique, à
   demi dépliée sur la table, les doigts et le bout du pouce posés dessus.
   La main de B (peau claire, manche vert forêt) quitte le bord de la lettre,
   passe de l'ombre au soleil, se pose sur la sienne et la serre doucement.

   A est assise en face de nous (son bras monte du bas du cadre) ; B, à sa
   droite, avance le bras depuis la droite : sa paume se pose en travers du dos
   de la main de A, ses doigts se replient sur le côté du pouce, son pouce
   repose sur le poignet de A.

   Matin d'automne : le soleil entre bas par la fenêtre de gauche ; la tache
   de soleil, découpée par l'embrasure et le feuillage des plantes de l'appui,
   glisse lentement ; ombres longues et bleutées vers la droite, rebond chaud
   du bois. Une tasse vert sauge fume en haut à gauche ; la tasse terre cuite
   passe, très floue, au premier plan en bas à droite. Profondeur de champ :
   le loin (haut du cadre) et le près (bas) sont doux, les mains nettes.

   Les mains sont dessinées dans leur propre repère (origine au poignet, x vers
   le bout des doigts, y vers le pouce). La main de B tient en trois calques :
   paume et pouce ; doigts détendus (posée, puis en l'air) ; doigts qui
   enveloppent (une fois posée) — ces derniers se raccourcissent quand elle serre.
   L'éclairage est calculé à chaque image : couleur peinte × (ciel froid +
   soleil chaud dans la tache, moins les ombres portées).

   Paramètres (p) :
     land     0 → 1   trajet de la main de B (bord de la lettre → main de A)
     squeeze  0 → 1   la main de B serre (les doigts se referment)
     answer   0 → 1   la main de A répond (elle se tourne un peu vers B)
     slide    0 → 1   glissement de la tache de soleil
     dbg      0 / 1   (contrôle) affiche seulement la carte de lumière
   ========================================================================== */
import { P, lin, rad, rng, lerp } from '../kit.js';
import { TAU, clamp, seg, ease } from '../../film/engine.js';

const ID = 'a2-mains';
const u = (n) => `${ID}-${n}`;
const url = (n) => `url(#${ID}-${n})`;
const HOME = { x: 960, y: 540, z: 1 };
const DEG = Math.PI / 180;

/* --------------------------------------------------------------------------
   Outils de tracé
   -------------------------------------------------------------------------- */
const n1 = (v) => Math.round(v * 10) / 10;
const n4 = (v) => Math.round(v * 10000) / 10000;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const rotv = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
const perp = (v) => [-v[1], v[0]];
const norm = ([x, y]) => { const m = Math.hypot(x, y) || 1; return [x / m, y / m]; };
const P2 = (p) => `${n1(p[0])},${n1(p[1])}`;
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

const ellD = (cx, cy, rx, ry) =>
  `M${n1(cx - rx)},${n1(cy)}A${rx},${ry} 0 1,0 ${n1(cx + rx)},${n1(cy)}A${rx},${ry} 0 1,0 ${n1(cx - rx)},${n1(cy)}Z`;

/* --------------------------------------------------------------------------
   La lumière du matin : elle vient de la fenêtre de gauche, rase, et avance
   vers la droite (un peu vers nous). Ombres longues.
   -------------------------------------------------------------------------- */
const DL = norm([0.92, 0.39]);          // sens de propagation sur la table
const LT = [-DL[0], -DL[1]];            // vers la fenêtre
const NL = [-DL[1], DL[0]];             // en travers du faisceau
const COT = 1.4;                        // longueur d'ombre / hauteur (soleil bas)

/* --------------------------------------------------------------------------
   Repères des deux mains
   -------------------------------------------------------------------------- */
// A : main droite à plat, doigts vers le haut (sur la lettre), pouce à gauche
const A_W = [720, 640];
const A_ANG = -78 * DEG;
const dA = [Math.cos(A_ANG), Math.sin(A_ANG)];
const eA = [dA[1], -dA[0]];                                  // côté du pouce
const toA = (p) => [A_W[0] + p[0] * dA[0] + p[1] * eA[0], A_W[1] + p[0] * dA[1] + p[1] * eA[1]];
const A_MAT = `matrix(${n4(dA[0])} ${n4(dA[1])} ${n4(eA[0])} ${n4(eA[1])} ${A_W[0]} ${A_W[1]})`;
const LA = norm([dot(LT, dA), dot(LT, eA)]);                 // lumière dans le repère de A

// B : main droite, dessinée en miroir (y local vers le pouce, retourné à l'écran).
// Elle arrive de la droite ; sa paume se pose en travers du dos de la main de A,
// ses doigts se referment sur le côté du pouce, son pouce sur le poignet de A.
const B_PALM = 100;
const B1_ANG = 170 * DEG;
const dB1 = [Math.cos(B1_ANG), Math.sin(B1_ANG)];
const B1_W = sub(toA([108, 0]), mul(dB1, B_PALM));
const B0_W = [1410, 520], B0_ANG = 176 * DEG;                 // au départ : posée près de la lettre, dans l'ombre
const LB = norm([dot(LT, dB1), -dot(LT, [-Math.sin(B1_ANG), Math.cos(B1_ANG)])]);
const B_K = 188;                                             // ligne des jointures (pivot des doigts)

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
// Volume : bords plus sombres, cœur décalé vers la lumière (L dans le repère local)
function volSet(tag, L) {
  const f = (kind, k, er, bl, off) =>
    `<filter id="${u(tag + '-' + kind + k)}" x="-25%" y="-25%" width="150%" height="150%">` +
    `<feMorphology in="SourceGraphic" operator="erode" radius="${er}" result="e"/>` +
    `<feGaussianBlur in="e" stdDeviation="${bl}" result="b"/>` +
    `<feOffset in="b" dx="${n1(L[0] * off)}" dy="${n1(L[1] * off)}" result="o"/>` +
    `<feComposite in="o" in2="SourceAlpha" operator="in"/></filter>`;
  return f('v', 's', 2, 3, 1.5) + f('v', 'm', 4.5, 6, 3) + f('v', 'l', 11, 15, 7) + f('v', 'x', 22, 26, 14) +
    f('h', 's', 4.5, 3, 3.5) + f('h', 'm', 10, 8, 7) + f('h', 'l', 28, 20, 18) + f('h', 'x', 50, 34, 34);
}
const FX = [
  volSet('a', LA), volSet('b', LB), volSet('d', LT),
  ...[1, 2, 3, 4, 6, 8, 12, 18, 30].map(blurF),
  texF('peau', 0.016, 0.1, 4), texF('pores', 0.32, 0.07, 8), texF('tricot', 0.09, 0.22, 9), texF('papier', 0.5, 0.06, 15),
].join('');

// Une forme (ou un groupe de formes réunies) en volume : ombre de bord, corps, reflet
const volG = (inner, shade, base, light, tag, k = 'm', lo = 0.7) =>
  `<g fill="${shade}">${inner}</g><g fill="${base}" filter="${url(tag + '-v' + k)}">${inner}</g>` +
  (light ? `<g fill="${light}" opacity="${lo}" filter="${url(tag + '-h' + k)}">${inner}</g>` : '');
const paths = (arr) => arr.map((d) => `<path d="${d}"/>`).join('');
const line = (d, color, w, op, blur = 2) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${n1(w)}" stroke-linecap="round" stroke-linejoin="round" opacity="${n1(op * 100) / 100}"${blur ? ` filter="${url('f' + blur)}"` : ''}/>`;

/* --------------------------------------------------------------------------
   Modèle de main (repère local : origine au poignet, x vers le bout des
   doigts, y vers le pouce ; unités du décor, une main d'homme ≈ 410)
   -------------------------------------------------------------------------- */
const FING = [
  { mcp: [186, 52], ang: 7, L: [92, 53, 44], r: [20.5, 19, 17, 15] },        // index
  { mcp: [198, 15], ang: 1, L: [101, 61, 46], r: [21.5, 19.8, 17.4, 15.4] },  // majeur
  { mcp: [189, -22], ang: -5, L: [95, 57, 44], r: [20, 18.4, 16.4, 14.6] },   // annulaire
  { mcp: [166, -55], ang: -12, L: [75, 43, 38], r: [17.2, 15.6, 14.2, 12.8] }, // auriculaire
];
const DORSUM = [
  [-70, -63], [0, -62], [60, -67], [118, -71], [154, -69], [174, -56], [188, -34], [198, -6],
  [202, 22], [196, 50], [186, 70], [166, 82], [138, 88], [112, 89], [86, 83], [60, 73], [28, 66], [0, 63], [-70, 64],
];
const THUMB = { c: [[18, 42], [56, 70], [94, 98], [128, 118], [156, 132], [176, 140]], r: [38, 33, 28, 25.5, 23.5, 21] };

function handModel(o) {
  const k = o.k;
  const S = (p) => [p[0] * k, p[1] * k];
  const F = FING.map((f, i) => {
    const a0 = (f.ang + o.spread[i]) * DEG;
    const d1 = [Math.cos(a0), Math.sin(a0)];
    const mcp = S(f.mcp);
    const L = f.L.map((v) => v * k);
    const r = f.r.map((v) => v * k * o.slim);
    const d2 = rotv(d1, o.bend[i][0] * DEG), d3 = rotv(d2, o.bend[i][1] * DEG);
    const [c1, c2, c3] = o.curl[i];
    const pip = add(mcp, mul(d1, L[0] * c1));
    const dip = add(pip, mul(d2, L[1] * c2));
    const L3c = L[2] * c3;
    const tip = add(dip, mul(d3, Math.max(3, L3c - r[3])));
    const p0 = add(mcp, mul(d1, -18 * k));
    const pts = [p0, mcp, mix(mcp, pip, 0.5), pip, mix(pip, dip, 0.5), dip, mix(dip, tip, 0.5), tip];
    const rr = [r[0] * 0.98, r[0] * 1.03, r[0] * 0.93, r[1] * 1.04, r[1] * 0.92, r[2] * 1.02, r[2] * 0.95, r[3]];
    const stubEnd = add(mcp, mul(d1, 30 * k));
    return {
      i, mcp, pip, dip, tip, d1, d2, d3, r, L3c, pts, rr,
      d: tube(pts, rr), stub: tube([p0, mcp, stubEnd], [r[0] * 0.98, r[0] * 1.03, r[0] * 0.97]),
    };
  });
  const dorsum = curve(DORSUM.map(S), true);
  const t0 = S(THUMB.c[0]), tr = (o.thumbRot || 0) * DEG;
  const tc = THUMB.c.map((p) => add(t0, rotv(sub(S(p), t0), tr)));
  const thumb = { pts: tc, r: THUMB.r.map((v) => v * k * o.slim) };
  thumb.d = tube(tc, thumb.r);
  return { F, dorsum, thumb, k };
}

// Ongle : plaque bombée, bord libre clair, reflet de la fenêtre, cuticule
function nailSVG(base, d, rr, len, S, L, wk = 1, cid) {
  const n = perp(d);
  const nl = dot(n, L) > 0 ? n : mul(n, -1);
  const tipE = add(base, mul(d, rr * 0.8));
  const cut = add(tipE, mul(d, -len));
  const w1 = rr * 0.72 * wk, w0 = rr * 0.64 * wk;
  const o = (p, a, b) => add(add(p, mul(d, a)), mul(n, b));
  const pts = [
    o(cut, 0, w0), o(mix(cut, tipE, 0.55), 0, (w0 + w1) / 2 + 0.5), o(tipE, -w1 * 0.45, w1), o(tipE, -w1 * 0.08, w1 * 0.62),
    tipE, o(tipE, -w1 * 0.08, -w1 * 0.62), o(tipE, -w1 * 0.45, -w1), o(mix(cut, tipE, 0.55), 0, -(w0 + w1) / 2 - 0.5),
    o(cut, 0, -w0), o(cut, -2.4, 0),
  ];
  const nd = curve(pts, true);
  let s = `<clipPath id="${cid}"><path d="${nd}"/></clipPath>`;
  s += `<path d="${nd}" fill="${S.nail}" opacity=".88"/>`;
  s += `<g clip-path="url(#${cid})">`;
  s += line(curve([pts[2], pts[3], pts[4], pts[5], pts[6]]), S.nailE, 2.6, 0.38, 1);
  s += line(curve([o(cut, 2, 0), o(tipE, -w1 * 0.5, 0)]), S.nailL, w0 * 0.9, 0.35, 2);
  s += line(curve([o(cut, 3, 0).map((v, j) => v + nl[j] * w0 * 0.42), o(tipE, -w1 * 0.55, 0).map((v, j) => v + nl[j] * w1 * 0.4)]), '#fffaf4', 1.8, 0.6, 1);
  s += line(curve([pts[0], pts[1], pts[2]]), S.crease, 1.2, 0.25, 1) + line(curve([pts[6], pts[7], pts[8]]), S.crease, 1.2, 0.25, 1);
  s += '</g>';
  s += line(curve([pts[8], pts[9], pts[0]]), S.crease, 1.3, 0.5, 0);
  s += line(curve([o(cut, -4, w0 * 0.9), o(cut, -6.2, 0), o(cut, -4, -w0 * 0.9)]), S.light, 3, 0.35, 2);
  return s;
}

// Plis de peau en travers d'une articulation
function creases(c, d, r, S, offs, k) {
  const n = perp(d);
  let s = '';
  for (const [o, w, op] of offs) {
    const p = add(c, mul(d, o * k));
    const a = add(p, mul(n, r * w)), b = sub(p, mul(n, r * w)), m = add(p, mul(d, 3.4 * k));
    s += line(`M${P2(a)}Q${P2(m)} ${P2(b)}`, S.crease, 1.5, op, 1);
  }
  return s;
}

// Dessin de la main (part : 'all', 'palm' — paume, pouce, amorces des doigts —, 'fingers')
function handSVG(H, S, L, part, name, o = {}) {
  const tag = S.tag, k = H.k;
  const palm = part !== 'fingers', fing = part !== 'palm';
  const shapes = [];
  if (palm) shapes.push(H.dorsum, H.thumb.d);
  for (const f of H.F) shapes.push(fing ? f.d : f.stub);
  const side = (n) => (dot(n, L) > 0 ? n : mul(n, -1));
  let s = `<g filter="${url('peau')}">`;
  s += volG(paths(shapes), S.shade, S.base, S.light, tag, 'm', S.hl);
  // lumière chaude qui traverse la peau sur les bords à l'ombre
  s += `<g fill="none" stroke="${S.rim}" stroke-width="5" opacity=".22" filter="${url('f3')}" transform="translate(${n1(-L[0] * 2)} ${n1(-L[1] * 2)})">${paths(shapes)}</g>`;

  if (palm) {
    const T = H.thumb;
    s += `<clipPath id="${u(name + '-c-dos')}"><path d="${H.dorsum}"/></clipPath><g clip-path="url(#${u(name + '-c-dos')})">`;
    s += `<ellipse cx="${n1(95 * k)}" cy="${n1(4 * k)}" rx="${n1(70 * k)}" ry="${n1(48 * k)}" fill="${S.light}" opacity=".18" filter="${url('f18')}"/>`;
    s += `<ellipse cx="${n1(176 * k)}" cy="${n1(0)}" rx="${n1(26 * k)}" ry="${n1(80 * k)}" fill="${S.flush}" opacity=".16" filter="${url('f12')}"/>`;
    s += `<ellipse cx="${n1(10 * k)}" cy="${n1(-10 * k)}" rx="${n1(40 * k)}" ry="${n1(70 * k)}" fill="${S.vein}" opacity=".12" filter="${url('f18')}"/>`;
    s += '</g>';
    // grand modelé du dos de la main, côté fenêtre
    s += `<path d="${H.dorsum}" fill="${S.light}" opacity=".3" filter="${url(tag + '-hl')}"/>`;
    // creux entre le pouce et l'index
    s += `<ellipse cx="${n1(118 * k)}" cy="${n1(84 * k)}" rx="${n1(34 * k)}" ry="${n1(16 * k)}" transform="rotate(25 ${n1(118 * k)} ${n1(84 * k)})" fill="${S.deep}" opacity=".3" filter="${url('f6')}"/>`;
    // tendons : du poignet vers chaque jointure
    for (const f of H.F) {
      const w = [16 * k, f.mcp[1] * 0.3];
      const m = mix(w, f.mcp, 0.55);
      const n = side(perp(norm(sub(f.mcp, w))));
      const pts = [w, add(m, mul(n, 2)), sub(f.mcp, mul(f.d1, 6 * k))];
      s += line(curve(pts.map((p) => add(p, mul(n, 4 * k)))), S.light, 6 * k, 0.24 * (o.tendon ?? 1), 4);
      s += line(curve(pts.map((p) => sub(p, mul(n, 5 * k)))), S.deep, 4 * k, 0.12 * (o.tendon ?? 1), 4);
    }
    // jointures : bosses osseuses éclairées, creux entre elles
    for (const f of H.F) {
      const n = side(perp(f.d1));
      const c = add(add(f.mcp, mul(f.d1, 4 * k)), mul(n, f.r[0] * 0.25));
      if (o.flush) s += `<ellipse cx="${n1(f.mcp[0])}" cy="${n1(f.mcp[1])}" rx="${n1(f.r[0] * 0.9)}" ry="${n1(f.r[0] * 0.75)}" fill="${S.flush}" opacity="${0.2 * o.flush}" filter="${url('f6')}"/>`;
      if (o.knuckleDark) s += `<ellipse cx="${n1(f.mcp[0])}" cy="${n1(f.mcp[1])}" rx="${n1(f.r[0] * 0.8)}" ry="${n1(f.r[0] * 0.6)}" fill="${S.deep}" opacity="${0.18 * o.knuckleDark}" filter="${url('f4')}"/>`;
      s += `<ellipse cx="${n1(c[0])}" cy="${n1(c[1])}" rx="${n1(f.r[0] * 0.6)}" ry="${n1(f.r[0] * 0.48)}" fill="${S.light}" opacity="${o.knuckle ?? 0.5}" filter="${url('f3')}"/>`;
      s += creases(add(f.mcp, mul(f.d1, 6 * k)), f.d1, f.r[0], S, [[-3, 0.35, 0.18], [3, 0.42, 0.22]], k);
    }
    for (let i = 0; i < 3; i++) {
      const a = H.F[i], b = H.F[i + 1];
      const m = mix(a.mcp, b.mcp, 0.5), d = norm(add(a.d1, b.d1));
      s += line(curve([sub(m, mul(d, 40 * k)), add(m, mul(d, 6 * k))]), S.deep, 5 * k, 0.3, 3);
    }
    // os du poignet (côté auriculaire) et plis du poignet
    s += `<ellipse cx="${n1(4 * k)}" cy="${n1(-50 * k)}" rx="${n1(12 * k)}" ry="${n1(8 * k)}" fill="${S.light}" opacity=".4" filter="${url('f3')}"/>`;
    s += line(`M${P2([6 * k, -52 * k])}Q${P2([12 * k, -10 * k])} ${P2([8 * k, 40 * k])}`, S.crease, 1.4, 0.18, 2);
    // veines, très douces
    if (o.veins) {
      const V = [
        [[-40, 8], [20, 2], [70, -6], [118, -16], [160, -24]],
        [[40, 1], [84, 16], [130, 30], [168, 40]],
        [[-30, -26], [30, -32], [90, -40], [140, -46]],
      ];
      for (const v of V) {
        const pts = v.map(([x, y]) => [x * k, y * k]);
        s += line(curve(pts), S.vein, 6 * k, 0.2 * o.veins, 3);
        s += line(curve(pts.map((p) => add(p, mul(L, 2.5)))), S.light, 3.5 * k, 0.2 * o.veins, 3);
      }
    }
    // le pouce : modelé, pli de l'articulation, ongle vu de biais
    const tp = T.pts, td = norm(sub(tp[5], tp[4]));
    const tn = side(perp(td));
    s += line(curve(tp.slice(1).map((p, j) => add(p, mul(tn, T.r[j + 1] * 0.38)))), S.light, 10 * k, 0.4, 4);
    s += line(curve(tp.slice(1).map((p, j) => sub(p, mul(tn, T.r[j + 1] * 0.62)))), S.deep, 6 * k, 0.22, 4);
    s += creases(tp[3], norm(sub(tp[4], tp[2])), T.r[3], S, [[-4, 0.45, 0.28], [1, 0.55, 0.36], [6, 0.4, 0.24]], k);
    s += nailSVG(tp[5], td, T.r[5], 30 * k, S, L, 0.82, u(name + '-ongle-pouce'));
  }

  if (fing) {
    for (const f of H.F) {
      const cid = u(`${name}-doigt${f.i}`);
      s += `<clipPath id="${cid}"><path d="${f.d}"/></clipPath><g clip-path="url(#${cid})">`;
      const dirs = [f.d1, f.d1, f.d1, f.d1, f.d2, f.d2, f.d3, f.d3];
      const off = (kk) => f.pts.slice(1).map((p, j) => add(p, mul(side(perp(dirs[j + 1])), f.rr[j + 1] * kk)));
      s += line(curve(off(0.36)), S.light, f.r[1] * 0.62, 0.42, 3);
      s += line(curve(off(-0.62)), S.deep, f.r[1] * 0.42, 0.26, 3);
      s += line(curve(off(-0.95)), S.rim, 3, 0.3, 2);
      if (o.wrap) {
        s += line(curve([f.pip, f.dip, add(f.tip, mul(f.d3, f.r[3] * 0.6))]), S.light, f.r[1] * 1.3, 0.5, 4);
        s += line(curve([add(f.pip, mul(f.d1, -10 * k)), add(f.pip, mul(f.d1, 4 * k))]), S.crease, f.r[1] * 1.6, 0.12, 4);
      }
      s += '</g>';
      // articulations : plis, petites bosses, un peu de rose sur la peau claire
      const npip = side(perp(f.d1));
      if (o.flush) {
        s += `<ellipse cx="${n1(f.pip[0])}" cy="${n1(f.pip[1])}" rx="${n1(14 * k)}" ry="${n1(f.r[1] * 0.8)}" fill="${S.flush}" opacity="${0.22 * o.flush}" filter="${url('f4')}"/>`;
        s += `<circle cx="${n1(f.tip[0])}" cy="${n1(f.tip[1])}" r="${n1(f.r[3] * 0.9)}" fill="${S.flush}" opacity="${0.2 * o.flush}" filter="${url('f4')}"/>`;
      }
      const bp = add(f.pip, mul(npip, f.r[1] * 0.28));
      s += `<ellipse cx="${n1(bp[0])}" cy="${n1(bp[1])}" rx="${n1(f.r[1] * 0.55)}" ry="${n1(f.r[1] * 0.45)}" fill="${S.light}" opacity="${o.wrap ? 0.6 : 0.3}" filter="${url('f2')}"/>`;
      s += `<ellipse cx="${n1(f.pip[0])}" cy="${n1(f.pip[1])}" rx="${n1(9 * k)}" ry="${n1(f.r[1] * 0.7)}" transform="rotate(${n1(Math.atan2(f.d1[1], f.d1[0]) / DEG)} ${n1(f.pip[0])} ${n1(f.pip[1])})" fill="${S.crease}" opacity=".1" filter="${url('f3')}"/>`;
      s += creases(f.pip, norm(add(f.d1, f.d2)), f.r[1], S, o.wrap ? [[-9, 0.5, 0.34], [-4, 0.66, 0.46], [1, 0.62, 0.4], [6, 0.5, 0.3]] : [[-5, 0.46, 0.26], [0, 0.6, 0.36], [5, 0.44, 0.24]], k);
      s += creases(f.dip, norm(add(f.d2, f.d3)), f.r[2], S, [[-2, 0.42, 0.24], [2.5, 0.36, 0.18]], k);
      if (!o.wrap) s += nailSVG(f.tip, f.d3, f.r[3], Math.min(f.L3c * 0.62, 30 * k), S, L, 1, u(`${name}-ongle${f.i}`));
    }
    // les doigts se touchent à la base : sillons sombres
    for (let i = 0; i < 3; i++) {
      const a = H.F[i], b = H.F[i + 1];
      const m = mix(a.mcp, b.mcp, 0.5), d = norm(add(a.d1, b.d1));
      s += line(curve([add(m, mul(d, 8 * k)), add(m, mul(d, 40 * k))]), S.deep, 3 * k, 0.35, 2);
    }
  }
  return s + '</g>';
}

/* --------------------------------------------------------------------------
   Manches en maille (repère de la main : la manche s'étend vers x < 0)
   -------------------------------------------------------------------------- */
function sleeveSVG(o) {
  const r = rng(o.seed);
  const top = [], bot = [];
  for (let x = o.from; x <= o.x1; x += 110) {
    const w = o.R * (1 + 0.035 * Math.sin(x * 0.011 + o.seed));
    top.push([x, w + (r() - 0.5) * 5]);
    bot.push([x, -w + (r() - 0.5) * 5]);
  }
  const body = curve([...top, [o.x1 + 22, o.R * 0.72], [o.x1 + 32, 4], [o.x1 + 22, -o.R * 0.7], ...bot.reverse()], true);
  const c0 = o.c0, c1 = o.c1, Rc = o.Rc;
  const cuff = curve([[c0, Rc], [(c0 + c1) / 2, Rc * 0.99], [c1 - 8, Rc * 0.95], [c1 + 2, Rc * 0.62], [c1 + 5, 0], [c1 + 2, -Rc * 0.62], [c1 - 8, -Rc * 0.95], [(c0 + c1) / 2, -Rc * 0.99], [c0, -Rc]], true);
  const C = o.C, tag = o.tag, L = o.L;
  const cb = u(o.name + '-c-corps'), cc = u(o.name + '-c-poignet'), pat = u(o.name + '-maille');
  let s = `<defs>
    <clipPath id="${cb}"><path d="${body}"/></clipPath>
    <clipPath id="${cc}"><path d="${cuff}"/></clipPath>
    <pattern id="${pat}" patternUnits="userSpaceOnUse" width="10" height="9">
      <path d="M0.4,0.6Q4.6,2.2 9,4.5M0.4,8.4Q4.6,6.8 9,4.5" stroke="${C.deep}" stroke-width="1.5" fill="none" opacity=".6"/>
      <path d="M1.4,2.5Q4.8,3.6 7.6,4.5M1.4,6.5Q4.8,5.4 7.6,4.5" stroke="${C.light}" stroke-width="1.2" fill="none" opacity=".5"/>
    </pattern>
  </defs>`;
  // le poignet côtelé
  s += `<g filter="${url('tricot')}">` + volG(`<path d="${cuff}"/>`, C.shade, C.base, C.light, tag, 'l', 0.6) + '</g>';
  s += `<g clip-path="url(#${cc})">`;
  for (let j = 0; j <= 18; j++) {
    const ph = -1.42 + (2.84 * j) / 18, y = Rc * Math.sin(ph), w = Math.cos(ph);
    s += `<path d="M${c0},${n1(y)}L${c1 + 6},${n1(y * 0.98)}" stroke="${C.deep}" stroke-width="${n1(1 + 2.4 * w)}" opacity=".45"/>`;
    const y2 = Rc * Math.sin(ph + 0.08);
    s += `<path d="M${c0},${n1(y2)}L${c1 + 6},${n1(y2 * 0.98)}" stroke="${C.light}" stroke-width="${n1(0.6 + 2 * w)}" opacity=".35"/>`;
  }
  s += line(curve([[c1 - 3, Rc * 0.9], [c1 + 3, 0], [c1 - 3, -Rc * 0.9]]), C.deep, 5, 0.5, 2);
  s += line(curve([[c1 - 10, Rc * 0.85], [c1 - 5, 0], [c1 - 10, -Rc * 0.85]]), C.light, 4, 0.3, 2);
  s += '</g>';
  // ombre de la manche sur le haut du poignet côtelé
  s += `<path d="${body}" transform="translate(16 ${n1(-L[1] * 6)})" fill="${C.deep}" opacity=".45" filter="${url('f8')}" clip-path="url(#${cc})"/>`;
  // la manche : volume, maille, plis
  s += `<path d="${body}" fill="none" stroke="${C.base}" stroke-width="6" opacity=".6" filter="${url('f2')}"/>`;
  s += `<g filter="${url('tricot')}">` + volG(`<path d="${body}"/>`, C.shade, C.base, C.light, tag, 'x', 0.55) + '</g>';
  s += `<g clip-path="url(#${cb})">`;
  s += `<rect x="${o.from}" y="${-o.R - 20}" width="${o.x1 - o.from + 60}" height="${2 * o.R + 40}" fill="url(#${pat})" opacity=".55"/>`;
  // plis en croissant au-dessus du poignet (la manche blouse)
  for (const [x, a] of o.folds) {
    const f = curve([[x, o.R * 1.1], [x + 13, o.R * 0.4], [x + 16, 0], [x + 13, -o.R * 0.4], [x, -o.R * 1.1]]);
    s += line(f, C.deep, 13, 0.42 * a, 6);
    s += `<path d="${f}" transform="translate(${n1(L[0] * 9 + 9)} ${n1(L[1] * 9)})" fill="none" stroke="${C.light}" stroke-width="8" opacity="${n1(0.32 * a * 100) / 100}" filter="${url('f6')}"/>`;
  }
  // plis longs
  for (const [y0, y1, a] of o.long) {
    s += line(curve([[o.from, y0], [(o.from + o.x1) / 2, (y0 + y1) / 2 + 6], [o.x1 - 30, y1]]), C.deep, 14, 0.25 * a, 8);
  }
  // bords assombris (la maille s'enroule)
  s += `<path d="${body}" fill="none" stroke="${C.deep}" stroke-width="22" opacity=".35" filter="${url('f8')}"/>`;
  s += '</g>';
  return { svg: s, body, cuff };
}

/* --------------------------------------------------------------------------
   Les deux mains (géométrie)
   -------------------------------------------------------------------------- */
// (albédos : sous le soleil du matin, la peau retrouve les teintes de la bible)
const SKIN_A = {
  tag: 'a', base: '#ad7d5f', shade: '#875a45', light: '#c29373', deep: '#653b29', crease: '#5e3726',
  rim: '#a84c36', nail: '#c99c86', nailL: '#e6cdbd', nailE: '#ddc9ba', vein: '#77728c', flush: '#a8563f', hl: 0.55,
};
const SKIN_B = {
  tag: 'b', base: '#d0a183', shade: '#ad7560', light: '#e2b698', deep: '#8e5b49', crease: '#8c5649',
  rim: '#cc624c', nail: '#e2b5a2', nailL: '#f4dccf', nailE: '#ecdacd', vein: '#7f87a6', flush: '#d4735f', hl: 0.45,
};
const KNIT_A = { base: '#b5654a', shade: '#87442f', light: '#d98d6b', deep: '#5e2b1d' };
const KNIT_B = { base: '#3f5a4c', shade: '#2a3f35', light: '#628170', deep: '#1a2922' };

// A : doigts posés sur la lettre, un peu écartés
const HA = handModel({
  k: 0.92, slim: 0.93, thumbRot: 2,
  spread: [2, 0, -1.5, -3],
  bend: [[-2, -3], [0, -2], [2, 1], [4, 3]],
  curl: [[1, 0.95, 0.84], [1, 0.95, 0.82], [1, 0.95, 0.84], [1, 0.96, 0.86]],
});
// B : doigts serrés, qui retombent par-dessus le tranchant de la main de A
// B, doigts détendus (posée sur la table, puis en l'air)
const HB = handModel({
  k: 0.97, slim: 1, thumbRot: -10,
  spread: [-1, 0, 2, 5],
  bend: [[-3, -4], [-1, -3], [1, -1], [3, 1]],
  curl: [[0.97, 0.86, 0.7], [0.97, 0.85, 0.68], [0.97, 0.86, 0.7], [0.98, 0.88, 0.74]],
});
// B, doigts qui enveloppent le côté de la main de A (ils plongent par-dessus le bord)
const HBW = handModel({
  k: 0.97, slim: 1.02, thumbRot: -10,
  spread: [-4, -1, 2, 5],
  bend: [[-6, -8], [-2, -4], [2, 0], [6, 4]],
  curl: [[0.86, 0.36, 0.2], [0.84, 0.34, 0.18], [0.86, 0.36, 0.2], [0.9, 0.4, 0.24]],
});

const SLEEVE_A = sleeveSVG({
  name: 'a', seed: 3, from: -1150, x1: -96, R: 90, c0: -150, c1: -8, Rc: 70, C: KNIT_A, tag: 'a', L: LA,
  folds: [[-128, 1], [-210, 0.8], [-330, 0.6]], long: [[46, 30, 1], [-50, -38, 0.8]],
});
const SLEEVE_B = sleeveSVG({
  name: 'b', seed: 8, from: -1800, x1: -104, R: 98, c0: -160, c1: -8, Rc: 76, C: KNIT_B, tag: 'b', L: LB,
  folds: [[-134, 1], [-226, 0.8], [-352, 0.7]], long: [[50, 34, 1], [-56, -40, 0.8]],
});

// Silhouettes (ombres portées, découpes de lumière)
const SIL_A_HAND = [HA.dorsum, HA.thumb.d, ...HA.F.map((f) => f.d)];
const SIL_A_ARM = [SLEEVE_A.body, SLEEVE_A.cuff];
const SIL_B_PALM = [HB.dorsum, HB.thumb.d];
const SIL_B_FING = HB.F.map((f) => f.d);
const SIL_B_WRAP = HBW.F.map((f) => f.d);
const SIL_B_ARM = [SLEEVE_B.body, SLEEVE_B.cuff];

/* --------------------------------------------------------------------------
   La lettre : feuille pliée en trois, à demi ouverte ; un panneau près de A,
   le rabat ouvert au-delà du pli. Lignes grises abstraites, petit schéma en
   anneau (un seul cercle teinté de laiton), à moitié sous l'auriculaire.
   -------------------------------------------------------------------------- */
const LC = [792, 340];
const LANG = 16;                                                // l'écriture est tournée vers A
const LS = 0.85;                                                // format de la feuille
const LX = [Math.cos(LANG * DEG), Math.sin(LANG * DEG)], LY = perp(LX);
const DLL = [dot(DL, LX), dot(DL, LY)];                         // la lumière dans le repère de la lettre

const LETTRE = (() => {
  const r = rng(77);
  const low = 'M-210,0L210,0L211,194C211,198 209,200 205,200L-205,200C-209,200 -211,198 -211,194Z';
  const up = 'M-210,0L210,0L213,-176C120,-183 -96,-181 -208,-178Z';
  let s = `<defs>
    ${lin(u('papier-bas'), [[0, '#f4efe7'], [1, '#e9e2d7']], 0, 0, 0, 1)}
    ${lin(u('papier-haut'), [[0, '#fbf7f0'], [0.7, '#f1ebe1'], [1, '#e2dacd']], 0, 1, 0, 0)}
    <clipPath id="${u('c-bas')}"><path d="${low}"/></clipPath>
    <clipPath id="${u('c-haut')}"><path d="${up}"/></clipPath>
  </defs>`;
  s += `<g transform="translate(${n1(LC[0])} ${n1(LC[1])}) rotate(${n1(LANG)}) scale(${LS})">`;
  // ombre de la feuille : le pli épais du bas et le rabat soulevé
  s += `<path d="${low}" transform="translate(${n1(DLL[0] * 7)} ${n1(DLL[1] * 7)})" fill="#4a4258" opacity=".35" filter="${url('f4')}"/>`;
  s += `<path d="${up}" transform="translate(${n1(DLL[0] * 16)} ${n1(DLL[1] * 16)})" fill="#4a4258" opacity=".3" filter="${url('f8')}"/>`;
  s += `<g filter="${url('papier')}">`;
  s += `<path d="${up}" fill="url(#${u('papier-haut')})"/>`;
  s += `<path d="${low}" fill="url(#${u('papier-bas')})"/>`;
  s += '</g>';
  // lignes d'écriture : des traits gris, coupés en « mots » sans lettres
  const rows = (y0, y1, x0, x1, clip, op = 0.5) => {
    let t = `<g clip-path="url(#${clip})" fill="none" stroke="#8d8986" stroke-linecap="round" opacity="${op}" filter="${url('f1')}">`;
    for (let y = y0; y < y1; y += 12.5) {
      if (r() < 0.1) { y += 6; continue; }
      const long = r() < 0.18 ? 0.25 + r() * 0.45 : 0.86 + r() * 0.14;
      let x = x0, dash = '';
      while (x < x0 + (x1 - x0) * long) { const w = 8 + r() * 26; dash += `${n1(w)} ${n1(4 + r() * 2)} `; x += w + 5; }
      t += `<path d="M${x0},${n1(y)}L${n1(x0 + (x1 - x0) * long)},${n1(y + (r() - 0.5) * 0.6)}" stroke-width="3.2" stroke-dasharray="${dash.trim()}"/>`;
    }
    return t + '</g>';
  };
  // en-tête : quelques lignes courtes, puis une ligne plus marquée
  s += `<g fill="#8f8a86" opacity=".55" filter="${url('f1')}">`;
  for (const [x, y, w] of [[-176, -160, 70], [-176, -148, 92], [-176, -136, 58], [110, -160, 62]]) s += `<rect x="${x}" y="${y}" width="${w}" height="3.4" rx="1.7"/>`;
  s += '</g>';
  s += `<rect x="-176" y="-114" width="190" height="5" rx="2.5" fill="#7d7874" opacity=".6" filter="${url('f1')}"/>`;
  s += rows(-96, -8, -176, 176, u('c-haut'));
  s += rows(18, 186, -176, 176, u('c-bas'));
  // le schéma : un anneau de petits cercles, un seul teinté de laiton
  const RC = [80, 60];
  s += `<g filter="${url('f2')}" opacity=".85">`;
  s += `<rect x="${RC[0] - 40}" y="${RC[1] - 40}" width="80" height="80" fill="#f6f1e9"/>`;
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI / 2 + (i * TAU) / 11, x = RC[0] + 27 * Math.cos(a), y = RC[1] + 27 * Math.sin(a);
    s += i === 3
      ? `<circle cx="${n1(x)}" cy="${n1(y)}" r="5.6" fill="${P.brass}" stroke="${P.brassDark}" stroke-width="1"/><circle cx="${n1(x - 1.6)}" cy="${n1(y - 1.6)}" r="1.6" fill="${P.brassLight}"/>`
      : `<circle cx="${n1(x)}" cy="${n1(y)}" r="5.2" fill="none" stroke="#8a8682" stroke-width="1.5" opacity=".75"/>`;
  }
  s += '</g>';
  // le pli (creux) entre les deux panneaux, et le pli épais du bas
  s += line('M-210,1L210,1', '#9a9188', 6, 0.45, 3) + line('M-210,6L210,6', '#ffffff', 3, 0.5, 2);
  s += line('M-208,196L208,196', '#ffffff', 3, 0.6, 1) + line('M-210,201L210,201', '#a49a8f', 2, 0.5, 1);
  // le bord du rabat, soulevé, accroche la lumière
  s += line('M-208,-178C-96,-181 120,-183 213,-176', '#ffffff', 2.4, 0.7, 1);
  s += '</g>';
  return s;
})();

/* --------------------------------------------------------------------------
   Calque : la table (bois clair veiné, planches, usure)
   -------------------------------------------------------------------------- */
const SEAMS = [78, 372, 666, 960];
const SLOPE = -0.03;
const seamY = (y0, x) => y0 + (x - 960) * SLOPE;

const TABLE = (() => {
  const r = rng(11);
  let s = `<defs>${FX}
    ${lin(u('bois'), [[0, '#c9a77f'], [0.5, '#d6b68e'], [1, '#cdab82']], 0, 0, 1, 1)}
  </defs>`;
  s += `<rect x="-240" y="-140" width="2400" height="1360" fill="url(#${u('bois')})"/>`;
  // chaque planche a sa teinte
  const bands = [-260, ...SEAMS, 1300];
  const tones = ['#d3b088', '#cfab84', '#d9ba92', '#cba57c', '#d6b48b', '#d0ad85'];
  for (let i = 0; i < bands.length - 1; i++) {
    const a = bands[i], b = bands[i + 1];
    s += `<path d="M-240,${n1(seamY(a, -240))}L2160,${n1(seamY(a, 2160))}L2160,${n1(seamY(b, 2160))}L-240,${n1(seamY(b, -240))}Z" fill="${tones[i]}" opacity=".7"/>`;
  }
  // lavis : grandes variations de teinte
  s += '<g>';
  for (let i = 0; i < 18; i++) {
    const x = -200 + r() * 2300, y = -100 + r() * 1300, rx = 160 + r() * 300, ry = 60 + r() * 120;
    const c = r() < 0.5 ? '#e4c8a0' : r() < 0.6 ? '#b99068' : '#c9b4a0';
    s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rx)}" ry="${n1(ry)}" transform="rotate(${n1(SLOPE * 57 + (r() - 0.5) * 8)} ${n1(x)} ${n1(y)})" fill="${c}" opacity=".3" filter="${url('f30')}"/>`;
  }
  s += '</g>';
  // veinage : lignes ondulées le long des planches, cathédrales, pores
  // (flou de profondeur : le loin en haut, le près en bas)
  const groups = { loin: '', net: '', pres: '' };
  const band = (y) => (y < 170 ? 'loin' : y > 880 ? 'pres' : 'net');
  for (let i = 0; i < bands.length - 1; i++) {
    const a = bands[i], b = bands[i + 1], W = b - a;
    const ph1 = r() * TAU, ph2 = r() * TAU, f1 = 0.0016 + r() * 0.001, f2 = 0.005 + r() * 0.003;
    const wave = (x) => 7 * Math.sin(x * f1 + ph1) + 3 * Math.sin(x * f2 + ph2);
    for (let j = 0; j < 26; j++) {
      const v = ((j + r() * 0.7) / 26) * W, amp = 0.6 + r() * 0.8;
      let d = '';
      for (let x = -240; x <= 2160; x += 40) {
        const y = seamY(a, x) + v + wave(x) * amp + Math.sin(x * 0.02 + j) * 0.8;
        d += `${d ? 'L' : 'M'}${x},${n1(y)}`;
      }
      const dark = r() < 0.62;
      groups[band(a + v)] += `<path d="${d}" fill="none" stroke="${dark ? '#9c7550' : '#ead0a8'}" stroke-width="${n1(dark ? 1 + r() * 1.8 : 2 + r() * 3)}" opacity="${n1(dark ? 0.2 + r() * 0.25 : 0.2 + r() * 0.2)}"/>`;
    }
    // cathédrales : arcs emboîtés du bois de dosse
    const xc = 100 + r() * 1700, yc = a + W * (0.35 + r() * 0.3), dir = r() < 0.5 ? 1 : -1;
    for (let m = 0; m < 8; m++) {
      const tip = xc + dir * (30 + m * 52), w = 9 + m * 13, Lm = 380 + m * 90;
      const up = [], dn = [];
      for (let q = 0; q <= 12; q++) {
        const t = q / 12, x = tip - dir * Lm * t * t, yy = w * Math.sqrt(t);
        up.push([x, seamY(yc, x) - yy + wave(x) * 0.5]);
        dn.push([x, seamY(yc, x) + yy + wave(x) * 0.5]);
      }
      groups[band(yc)] += `<path d="${curve([...up.reverse(), ...dn.slice(1)])}" fill="none" stroke="${m % 2 ? '#e9cfa6' : '#987250'}" stroke-width="${m % 2 ? 2.6 : 1.6}" opacity="${m % 2 ? 0.3 : 0.32}"/>`;
    }
    // pores : petits traits sombres dans le fil
    for (let q = 0; q < 70; q++) {
      const x = -240 + r() * 2400, y = seamY(a, x) + r() * W + wave(x);
      groups[band(y)] += `<path d="M${n1(x)},${n1(y)}l${n1(5 + r() * 12)},${n1(SLOPE * 10)}" stroke="#7d5a3a" stroke-width="1.3" opacity=".22"/>`;
    }
  }
  s += `<g filter="${url('f4')}">${groups.loin}</g><g filter="${url('f1')}">${groups.net}</g><g filter="${url('f3')}">${groups.pres}</g>`;
  // un nœud, loin à droite
  const K = [1640, 230];
  s += `<g filter="${url('f2')}">`;
  for (let m = 0; m < 6; m++) s += `<ellipse cx="${K[0]}" cy="${K[1]}" rx="${16 + m * 13}" ry="${7 + m * 4.5}" transform="rotate(${n1(SLOPE * 57)} ${K[0]} ${K[1]})" fill="none" stroke="${m % 2 ? '#e2c49a' : '#8a6444'}" stroke-width="${m ? 1.6 : 4}" opacity="${m ? 0.3 : 0.55}"/>`;
  s += `<ellipse cx="${K[0]}" cy="${K[1]}" rx="11" ry="5" fill="#6b4a30" opacity=".6"/></g>`;
  // joints des planches : rainure sombre, arête claire
  let jl = '', jn = '';
  for (const y0 of SEAMS) {
    const d = `M-240,${n1(seamY(y0, -240))}L2160,${n1(seamY(y0, 2160))}`;
    const g = `<path d="${d}" stroke="#5f4632" stroke-width="5" opacity=".7"/><path d="${d}" transform="translate(0 4)" stroke="#f0d8b2" stroke-width="2.4" opacity=".55"/><path d="${d}" transform="translate(0 -3)" stroke="#8a6a4c" stroke-width="3" opacity=".3"/>`;
    if (y0 < 170 || y0 > 880) jl += g; else jn += g;
  }
  s += `<g filter="${url('f3')}">${jl}</g><g filter="${url('f1')}">${jn}</g>`;
  // la trace ronde, à peine visible, d'une tasse posée un autre matin
  s += `<ellipse cx="1450" cy="742" rx="84" ry="80" fill="none" stroke="#a07c56" stroke-width="5" stroke-dasharray="120 18 60 30 90 14" opacity=".12" filter="${url('f2')}"/>`;
  return s;
})();

/* --------------------------------------------------------------------------
   Calque : la tasse vert sauge, en haut à gauche (un peu floue : plus loin)
   -------------------------------------------------------------------------- */
const TC = [392, 236], TRX = 92, TRY = 86, TH = 56;
const TASSE = (() => {
  const r = rng(23);
  const [cx, cy] = TC;
  const body = `M${cx - TRX},${cy}A${TRX},${TRY} 0 0,1 ${cx + TRX},${cy}L${cx + TRX},${cy + TH}A${TRX},${TRY} 0 0,1 ${cx - TRX},${cy + TH}Z`;
  const inner = ellD(cx, cy, TRX - 8, TRY - 7.5);
  const liq = ellD(cx, cy + 9, TRX - 15, TRY - 15);
  // anse : un anneau vu d'en haut, à droite (côté ombre)
  const hx = cx + TRX - 6, hy = cy + 26;
  const anse = `M${hx},${hy - 22}C${hx + 30},${hy - 30} ${hx + 64},${hy - 12} ${hx + 62},${hy + 12}C${hx + 60},${hy + 34} ${hx + 26},${hy + 42} ${hx},${hy + 32}` +
    `L${hx},${hy + 18}C${hx + 18},${hy + 24} ${hx + 42},${hy + 20} ${hx + 43},${hy + 8}C${hx + 44},${hy - 6} ${hx + 20},${hy - 14} ${hx},${hy - 8}Z`;
  let s = `<defs>${FX}
    <linearGradient id="${u('glacure')}" gradientUnits="userSpaceOnUse" x1="${cx - TRX}" y1="0" x2="${cx + TRX}" y2="0">
      <stop offset="0" stop-color="#cbd8bf"/><stop offset="0.3" stop-color="#a9bb9d"/><stop offset="0.75" stop-color="#7c8e78"/><stop offset="0.92" stop-color="#66786a"/><stop offset="1" stop-color="#78897a"/>
    </linearGradient>
    <linearGradient id="${u('paroi')}" gradientUnits="userSpaceOnUse" x1="${cx - TRX}" y1="0" x2="${cx + TRX}" y2="0">
      <stop offset="0" stop-color="#53634f"/><stop offset="0.45" stop-color="#7b8c72"/><stop offset="1" stop-color="#c3d1b5"/>
    </linearGradient>
    ${rad(u('the'), [[0, '#b0702f'], [0.6, '#7d461f'], [1, '#4b2a14']], 0.62, 0.55, 0.62)}
    <clipPath id="${u('c-tasse')}"><path d="${body}"/></clipPath>
    <clipPath id="${u('c-dedans')}"><path d="${inner}"/></clipPath>
  </defs><g filter="${url('f2')}">`;
  // ombre de contact
  s += `<ellipse cx="${cx + 8}" cy="${cy + TH + 6}" rx="${TRX + 6}" ry="${TRY * 0.8}" fill="#3b3346" opacity=".45" filter="${url('f8')}"/>`;
  // anse
  s += volG(`<path d="${anse}"/>`, '#4f6050', '#7a8c76', '#a8b99b', 'd', 's', 0.6);
  // corps émaillé
  s += `<path d="${body}" fill="url(#${u('glacure')})"/>`;
  s += `<g clip-path="url(#${u('c-tasse')})">`;
  s += `<ellipse cx="${cx - 40}" cy="${cy + 30}" rx="30" ry="70" fill="#eef3e4" opacity=".35" filter="${url('f8')}"/>`;
  s += `<path d="M${cx - TRX},${cy + TH}A${TRX},${TRY} 0 0,0 ${cx + TRX},${cy + TH}" fill="none" stroke="#3e4a3e" stroke-width="10" opacity=".35" filter="${url('f4')}"/>`;
  for (let i = 0; i < 90; i++) {
    const a = r() * TAU, rr = Math.sqrt(r()), x = cx + Math.cos(a) * TRX * rr, y = cy + TH * 0.5 + Math.sin(a) * TRY * rr;
    s += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(0.6 + r() * 1.1)}" fill="${r() < 0.6 ? '#4c5948' : '#eef0e2'}" opacity=".45"/>`;
  }
  s += '</g>';
  // lèvre de la tasse, intérieur, thé
  s += `<path d="${ellD(cx, cy, TRX, TRY)}" fill="#c5d2b8"/>`;
  s += `<path d="${inner}" fill="url(#${u('paroi')})"/>`;
  s += `<g clip-path="url(#${u('c-dedans')})">`;
  s += `<path d="${liq}" fill="url(#${u('the')})"/>`;
  // ombre du bord sur le thé, côté fenêtre ; reflet du ciel ; voile de vapeur
  s += `<path d="${ellD(cx - 26, cy + 4, TRX - 12, TRY - 6)}" fill="none" stroke="#2c1a10" stroke-width="30" opacity=".45" filter="${url('f6')}"/>`;
  s += `<ellipse cx="${cx - 30}" cy="${cy - 8}" rx="22" ry="12" transform="rotate(-20 ${cx - 30} ${cy - 8})" fill="#f7efe2" opacity=".35" filter="${url('f4')}"/>`;
  s += `<ellipse cx="${cx + 18}" cy="${cy + 16}" rx="40" ry="30" fill="#e8d7c4" opacity=".14" filter="${url('f8')}"/>`;
  s += '</g>';
  // arêtes de la lèvre : lumière côté fenêtre, ombre de l'autre
  s += `<path d="M${cx - TRX + 2},${cy + 6}A${TRX},${TRY} 0 0,1 ${cx + 20},${cy - TRY + 1}" fill="none" stroke="#f4f7ea" stroke-width="3" opacity=".8" filter="${url('f1')}"/>`;
  s += `<path d="M${cx + TRX - 10},${cy - 30}A${TRX - 8},${TRY - 7.5} 0 0,1 ${cx + 10},${cy + TRY - 7}" fill="none" stroke="#e6eedb" stroke-width="3" opacity=".6" filter="${url('f1')}"/>`;
  return s + '</g>';
})();

/* --------------------------------------------------------------------------
   Calque : la main de A, la manche, la lettre (immobiles ensemble)
   -------------------------------------------------------------------------- */
const MAIN_A = (() => {
  let s = `<defs>${FX}</defs>`;
  s += LETTRE;
  // ombre de contact de la main et de la manche (bleutée, vers la droite)
  const sil = paths([...SIL_A_HAND, ...SIL_A_ARM]);
  s += `<g transform="translate(${n1(DL[0] * 14)} ${n1(DL[1] * 14)}) ${A_MAT}" fill="#3a3348" opacity=".42" filter="${url('f12')}">${sil}</g>`;
  s += `<g transform="translate(${n1(DL[0] * 3)} ${n1(DL[1] * 3)}) ${A_MAT}" fill="#2e2633" opacity=".5" filter="${url('f3')}">${sil}</g>`;
  s += `<g transform="${A_MAT}">`;
  s += handSVG(HA, SKIN_A, LA, 'all', 'a', { veins: 0.6, tendon: 1.5, knuckleDark: 1.2, knuckle: 0.55 });
  // le poignet côtelé jette une ombre sur le poignet
  s += `<path d="${SLEEVE_A.cuff}" transform="translate(10 ${n1(-LA[1] * 4)})" fill="#4a2c22" opacity=".5" filter="${url('f6')}"/>`;
  s += SLEEVE_A.svg;
  s += '</g>';
  // le bout du pouce disparaît sous la feuille
  return s;
})();

/* --------------------------------------------------------------------------
   Calques : la main de B (paume, pouce, manche ; puis les doigts)
   -------------------------------------------------------------------------- */
const BRAS_B = (() => {
  let s = `<defs>${FX}</defs>`;
  s += handSVG(HB, SKIN_B, LB, 'palm', 'b', { veins: 1.3, tendon: 1.3, flush: 1, knuckle: 0.6 });
  s += `<path d="${SLEEVE_B.cuff}" transform="translate(10 ${n1(-LB[1] * 4)})" fill="#1b2a22" opacity=".5" filter="${url('f6')}"/>`;
  s += SLEEVE_B.svg;
  return s;
})();
const fingersLayer = (H, name, wrap) => {
  let s = `<defs>${FX}
    <linearGradient id="${u(name + '-fondu')}" gradientUnits="userSpaceOnUse" x1="${B_K - 30}" y1="0" x2="${B_K + 4}" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <mask id="${u(name + '-m')}" maskUnits="userSpaceOnUse" x="100" y="-200" width="420" height="400">
      <rect x="100" y="-200" width="420" height="400" fill="url(#${u(name + '-fondu')})"/>
    </mask>
  </defs>`;
  s += `<g mask="url(#${u(name + '-m')})">${handSVG(H, SKIN_B, LB, 'fingers', name, { flush: 1, wrap })}</g>`;
  return s;
};
const DOIGTS_B = fingersLayer(HB, 'bd', false);
const DOIGTS_BW = fingersLayer(HBW, 'bw', true);

/* --------------------------------------------------------------------------
   Calque : la tasse terre cuite, au premier plan, très floue
   -------------------------------------------------------------------------- */
const PREMIER = (() => {
  const cx = 1440, cy = 905, rx = 165, ry = 154, h = 100;
  const body = `M${cx - rx},${cy}A${rx},${ry} 0 0,1 ${cx + rx},${cy}L${cx + rx},${cy + h}A${rx},${ry} 0 0,1 ${cx - rx},${cy + h}Z`;
  return `<defs>
    <linearGradient id="${u('tc')}" gradientUnits="userSpaceOnUse" x1="${cx - rx}" y1="0" x2="${cx + rx}" y2="0">
      <stop offset="0" stop-color="#e3a07c"/><stop offset="0.35" stop-color="#c0704f"/><stop offset="1" stop-color="#6d3524"/>
    </linearGradient>
    ${rad(u('the2'), [[0, '#9a5f2c'], [1, '#3c2112']], 0.6, 0.55, 0.6)}
  </defs>
  <path d="${body}" fill="url(#${u('tc')})"/>
  <path d="${ellD(cx, cy, rx, ry)}" fill="#e8b393"/>
  <path d="${ellD(cx, cy, rx - 16, ry - 15)}" fill="#8e4a31"/>
  <path d="${ellD(cx + 6, cy + 14, rx - 30, ry - 30)}" fill="url(#${u('the2')})"/>
  <path d="M${cx - rx + 4},${cy + 10}A${rx},${ry} 0 0,1 ${cx + 30},${cy - ry + 2}" fill="none" stroke="#fff1e4" stroke-width="10" opacity=".7"/>`;
})();

/* --------------------------------------------------------------------------
   Pose de la main de B, en fonction du trajet
   -------------------------------------------------------------------------- */
function poseB(q) {
  const k = ease.inOut(clamp(q.land));
  const arc = Math.sin(Math.PI * k);
  const W = add(mix(B0_W, B1_W, k), mul([0.2, -1], 34 * arc));           // trajectoire légèrement bombée
  const ang = lerp(B0_ANG, B1_ANG, k) - 0.03 * arc;
  const h = lerp(0, 34, k) + 56 * Math.pow(arc, 0.9);                     // hauteur au-dessus de la table
  const sq = clamp(q.squeeze);
  const press = mul([Math.cos(ang), Math.sin(ang)], 3 * sq);              // la paume appuie un peu vers les doigts
  // en l'air les doigts s'ouvrent un peu ; posés ils enveloppent ; ils serrent
  const wrap = smooth(0.87, 0.975, k);                                     // les doigts se referment en se posant
  const open = 1 + 0.08 * Math.pow(arc, 0.7) - 0.4 * smooth(0.8, 0.975, k); // échelle des doigts détendus
  const curl = lerp(1.18, 1, smooth(0.84, 1, k)) - 0.12 * sq;             // échelle des doigts qui enveloppent
  return { W: add(W, press), ang, s: 1 + h / 1700, h, onA: smooth(0.8, 1, k), sq, wrap, open, curl };
}
// B est une main droite dessinée comme une gauche : retournée (sy < 0)
const tfB = (b) => ({ x: b.W[0], y: b.W[1], rot: b.ang, sx: b.s, sy: -b.s });
function tfFingers(b, sc) {
  // les doigts pivotent autour de la ligne des jointures et se raccourcissent (ils se replient)
  const o = [B_K, 0];
  return {
    ox: o[0], oy: o[1],
    x: b.W[0] + b.s * B_K * Math.cos(b.ang) - o[0], y: b.W[1] + b.s * B_K * Math.sin(b.ang) - o[1],
    rot: b.ang - 0.02 * b.sq, sx: b.s * sc, sy: -b.s * (1 - 0.025 * b.sq),
  };
}
const applyTf = (c, { x = 0, y = 0, rot = 0, sx = 1, sy = 1, ox = 0, oy = 0 }) => {
  c.translate(ox + x, oy + y); c.rotate(rot); c.scale(sx, sy); c.translate(-ox, -oy);
};
const tfA = (q, T) => ({ ox: A_W[0], oy: A_W[1], rot: -0.012 * q.answer, x: 0, y: 0.5 * Math.sin(T * 1.3) });

/* --------------------------------------------------------------------------
   La tache de soleil : bande de la fenêtre (montant, traverse), feuillage de
   l'appui ; elle glisse lentement
   -------------------------------------------------------------------------- */
const C0 = [760, 480];
const V1 = -215, V2 = 345, XS = 95, XH = 1190;
const shiftOf = (q) => [-44 * q.slide, 20 * q.slide];
const vProfile = (v) => smooth(V1 - 34, V1 + 34, v) * (1 - smooth(V2 - 40, V2 + 40, v));
const xProfile = (x) => smooth(XS - 60, XS + 50, x) * (1 - smooth(XH - 70, XH + 60, x));
function patchAt(x, y, q) {
  const [sx, sy] = shiftOf(q);
  const px = x - sx, py = y - sy;
  return vProfile((px - C0[0]) * NL[0] + (py - C0[1]) * NL[1]) * xProfile(px);
}
const LEAVES = (() => {
  const r = rng(41), out = [];
  for (const [cx, cy, n] of [[170, 300, 7], [240, 760, 9], [130, 980, 5]]) {
    for (let i = 0; i < n; i++) {
      const a = (r() - 0.5) * 2.4, d = 30 + r() * 120;
      out.push({ x: cx + Math.cos(a) * d * 1.3, y: cy + Math.sin(a) * d, l: 70 + r() * 60, w: 24 + r() * 16, a: (r() - 0.5) * 1.8, ph: r() * TAU, cx, cy });
    }
  }
  return out;
})();

let LM = null, PATCH = null, ALB = null, MASK = null, TMP = null, SMALL = null, HALF = null;
const canvasLike = (c, W, H) => { if (!c || c.width !== W || c.height !== H) { c = document.createElement('canvas'); c.width = W; c.height = H; } return c; };

// Remplit une silhouette décalée dans le sens de la lumière, avec un flou (ombre douce)
function sweep(o, list, m, pre, d0, d1, blur, k, steps = 6) {
  for (let i = 0; i < steps; i++) {
    const d = lerp(d0, d1, steps === 1 ? 0 : i / (steps - 1));
    o.save();
    o.setTransform(m);
    o.translate(DL[0] * d - 9000, DL[1] * d);
    pre(o);
    o.shadowColor = 'rgba(0,0,0,0.85)';
    o.shadowBlur = (blur + d * 0.05) * k;
    o.shadowOffsetX = 9000 * Math.hypot(m.a, m.b);
    o.shadowOffsetY = 0;
    o.fillStyle = '#000';
    for (const p of list) o.fill(p);
    o.restore();
  }
}

let PATHS = null;
function pathsOnce() {
  if (PATHS) return PATHS;
  const L2D = (arr) => arr.map((d) => new Path2D(d));
  return (PATHS = {
    aHand: L2D(SIL_A_HAND), aArm: L2D(SIL_A_ARM), aAll: L2D([...SIL_A_HAND, ...SIL_A_ARM]),
    bPalm: L2D(SIL_B_PALM), bFing: L2D(SIL_B_FING), bWrap: L2D(SIL_B_WRAP), bArm: L2D(SIL_B_ARM),
    cup: L2D([ellD(TC[0], TC[1] + TH, TRX, TRY)]),
  });
}
const preA = (q, T) => (o) => { applyTf(o, tfA(q, T)); o.transform(dA[0], dA[1], eA[0], eA[1], A_W[0], A_W[1]); };

// Ombres des objets immobiles (tasse, bras et main de A), calculées une fois
// dans le repère du décor (2 unités par pixel), puis posées à chaque image
const SC = 0.5, SX0 = -240, SY0 = -140, SW = 2400, SH = 1360;
let STATIC = null, LEAF = null;
// Ombre floue d'une feuille (dessinée une fois)
function leafSprite() {
  if (LEAF) return LEAF;
  LEAF = document.createElement('canvas');
  LEAF.width = 160; LEAF.height = 96;
  const o = LEAF.getContext('2d');
  o.translate(80 - 4000, 48);
  o.shadowColor = 'rgba(0,0,0,0.7)';
  o.shadowBlur = 9;
  o.shadowOffsetX = 4000;
  o.beginPath();
  o.moveTo(-60, 0);
  o.bezierCurveTo(-24, -30, 30, -23, 60, 0);
  o.bezierCurveTo(30, 23, -24, 30, -60, 0);
  o.fill();
  return LEAF;
}
function staticShadows() {
  if (STATIC) return STATIC;
  STATIC = document.createElement('canvas');
  STATIC.width = SW * SC; STATIC.height = SH * SC;
  const o = STATIC.getContext('2d');
  const m = new DOMMatrix([SC, 0, 0, SC, -SX0 * SC, -SY0 * SC]);
  const PA = pathsOnce();
  const pA = (c) => c.transform(dA[0], dA[1], eA[0], eA[1], A_W[0], A_W[1]);
  sweep(o, PA.cup, m, () => {}, 0, 190 * COT, 6, SC, 8);
  sweep(o, PA.aArm, m, pA, 0, 100 * COT, 8, SC);
  sweep(o, PA.aHand, m, pA, 0, 40 * COT, 5, SC);
  return STATIC;
}
const preB = (b) => (o) => applyTf(o, tfB(b));
// les doigts visibles (détendus, ou qui enveloppent une fois posée)
const fingB = (b, PA) => (b.wrap > 0.5 ? { list: PA.bWrap, pre: (o) => applyTf(o, tfFingers(b, b.curl)) } : { list: PA.bFing, pre: (o) => applyTf(o, tfFingers(b, b.open)) });

// Carte de lumière, à demi-résolution (elle est douce par nature)
function lightMap(c, q, T, b) {
  const W = Math.ceil(c.canvas.width / 2), H = Math.ceil(c.canvas.height / 2);
  LM = canvasLike(LM, W, H); PATCH = canvasLike(PATCH, W, H);
  const m0 = c.getTransform();
  const m = new DOMMatrix([m0.a / 2, m0.b / 2, m0.c / 2, m0.d / 2, m0.e / 2, m0.f / 2]);
  const k = Math.hypot(m.a, m.b);
  const PA = pathsOnce();
  // 1. la tache seule
  let o = PATCH.getContext('2d');
  o.setTransform(1, 0, 0, 1, 0, 0);
  o.globalCompositeOperation = 'source-over';
  o.globalAlpha = 1;
  o.clearRect(0, 0, W, H);
  const [sx, sy] = shiftOf(q);
  o.setTransform(m);
  o.translate(sx, sy);
  o.save();
  o.transform(DL[0], DL[1], NL[0], NL[1], C0[0], C0[1]);
  let gr = o.createLinearGradient(0, -700, 0, 800);
  for (let i = 0; i <= 100; i++) {
    const v = -700 + i * 15;
    gr.addColorStop(i / 100, `rgba(255,220,166,${n1(vProfile(v) * 1000) / 1000})`);
  }
  o.fillStyle = gr;
  o.fillRect(-3000, -700, 6000, 1500);
  o.restore();
  o.globalCompositeOperation = 'destination-in';
  gr = o.createLinearGradient(-300, 0, 2300, 0);
  for (let i = 0; i <= 104; i++) {
    const x = -300 + i * 25;
    gr.addColorStop(i / 104, `rgba(0,0,0,${n1(xProfile(x) * 1000) / 1000})`);
  }
  o.fillStyle = gr;
  o.fillRect(-600, -600, 3200, 2400);
  // feuillage des plantes de l'appui : ombres qui bougent à peine
  o.globalCompositeOperation = 'destination-out';
  const LF = leafSprite();
  for (const L of LEAVES) {
    // la feuille se balance doucement autour de sa tige
    const sw = 0.06 * Math.sin(T * 0.8 + L.ph) + 0.03 * Math.sin(T * 1.9 + L.ph * 2);
    const bx = L.x + 6 * Math.sin(T * 0.6 + L.ph), by = L.y + 4 * Math.sin(T * 0.7 + L.ph);
    o.save();
    o.translate(bx, by);
    o.rotate(Math.atan2(DL[1], DL[0]) + L.a + sw);
    o.drawImage(LF, -L.l * 0.9, -L.w * 1.45, L.l * 1.8, L.w * 2.9);
    o.restore();
  }
  // 2. avec les ombres portées
  o = LM.getContext('2d');
  o.setTransform(1, 0, 0, 1, 0, 0);
  o.globalCompositeOperation = 'source-over';
  o.globalAlpha = 1;
  o.clearRect(0, 0, W, H);
  o.drawImage(PATCH, 0, 0);
  o.globalCompositeOperation = 'destination-out';
  const pA = preA(q, T);
  o.setTransform(m);
  o.drawImage(staticShadows(), SX0, SY0, SW, SH);
  sweep(o, PA.bArm, m, preB(b), b.h * 0.6 * COT, (b.h * 0.6 + 100) * COT, 8, k, 4);
  sweep(o, PA.bPalm, m, preB(b), b.h * COT, (b.h + 38) * COT, 5 + b.h * 0.15, k, 4);
  const FB = fingB(b, PA);
  sweep(o, FB.list, m, FB.pre, b.h * COT * 0.9, (b.h * 0.9 + 30) * COT, 5 + b.h * 0.15, k, 4);
  // 3. la main de A reste au soleil ; la main de B, posée, lui fait de l'ombre
  MASK = canvasLike(MASK, W, H); TMP = canvasLike(TMP, W, H);
  const mk = MASK.getContext('2d'), tp = TMP.getContext('2d');
  const restore = (parts, then) => {
    mk.setTransform(1, 0, 0, 1, 0, 0);
    mk.globalCompositeOperation = 'source-over';
    mk.clearRect(0, 0, W, H);
    mk.fillStyle = '#fff';
    for (const [pre, list] of parts) {
      mk.save(); mk.setTransform(m); pre(mk);
      for (const path of list) mk.fill(path);
      mk.restore();
    }
    tp.setTransform(1, 0, 0, 1, 0, 0);
    tp.globalCompositeOperation = 'copy';
    tp.drawImage(PATCH, 0, 0);
    tp.globalCompositeOperation = 'destination-in';
    tp.drawImage(MASK, 0, 0);
    if (then) { tp.globalCompositeOperation = 'destination-out'; then(tp); }
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalCompositeOperation = 'destination-out';
    o.drawImage(MASK, 0, 0);
    o.globalCompositeOperation = 'lighter';
    o.drawImage(TMP, 0, 0);
  };
  const hh = Math.max(0, b.h - 32);
  restore([[pA, PA.aAll]], (t) => {
    sweep(t, PA.bPalm, m, preB(b), hh * COT, (hh + 34) * COT, 4 + hh * 0.15, k, 3);
    sweep(t, FB.list, m, FB.pre, hh * COT, (hh + 26) * COT, 4 + hh * 0.15, k, 3);
    sweep(t, PA.bArm, m, preB(b), hh * COT, (hh + 80) * COT, 6, k, 2);
  });
  restore([[preB(b), [...PA.bPalm, ...PA.bArm]], [FB.pre, FB.list]]);
  return LM;
}

/* --------------------------------------------------------------------------
   Vapeur du thé : rubans qui montent et se défont ; poussière dans le soleil
   -------------------------------------------------------------------------- */
let DOT = null;
function dotSprite() {
  if (DOT) return DOT;
  DOT = document.createElement('canvas');
  DOT.width = DOT.height = 64;
  const d = DOT.getContext('2d');
  const g = d.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  d.fillStyle = g;
  d.fillRect(0, 0, 64, 64);
  return DOT;
}
const STEAM = (() => {
  const r = rng(61);
  return Array.from({ length: 8 }, (_, i) => ({
    x: TC[0] - 46 + r() * 92, y: TC[1] + r() * 24 - 6, ph: r() * TAU, sp: 0.07 + r() * 0.05,
    a1: 10 + r() * 16, f1: 1.0 + r() * 1.2, w1: 0.5 + r() * 0.5, drift: 70 + r() * 90, Hs: 90 + r() * 70, k: 0.6 + r() * 0.5,
  }));
})();
function steam(c, q, T) {
  const D = dotSprite();
  c.globalCompositeOperation = 'screen';
  for (const s of STEAM) {
    const N = 30;
    for (let j = 0; j < N; j++) {
      const t = (j / N + T * s.sp + s.ph) % 1;
      const y = s.y - t * s.Hs;
      const wob = s.a1 * Math.pow(t, 0.8) * Math.sin(t * s.f1 * TAU - T * s.w1 * TAU * 0.3 + s.ph) +
        6 * t * Math.sin(t * 9 - T * 1.1 + s.ph * 2);
      const x = s.x + s.drift * t * t + wob;
      const env = smooth(0, 0.12, t) * (1 - smooth(0.45, 1, t)) * (0.7 + 0.3 * Math.sin(T * 0.7 + s.ph + t * 3));
      const lit = 0.45 + 0.55 * patchAt(x - 40, y + 30, q);
      const a = 0.15 * s.k * env * lit;
      if (a < 0.004) continue;
      const rr = 10 + 46 * t;
      c.globalAlpha = a;
      c.drawImage(D, x - rr, y - rr, rr * 2, rr * 2);
    }
  }
  c.globalAlpha = 1;
}
const DUST = (() => {
  const r = rng(5);
  return Array.from({ length: 70 }, () => ({ x: -100 + r() * 2100, y: -100 + r() * 1200, s: 1 + r() * 2.4, ph: r() * TAU, sp: 0.3 + r() * 0.6, big: r() < 0.1 }));
})();
function dust(c, q, T) {
  const D = dotSprite();
  c.globalCompositeOperation = 'screen';
  for (const d of DUST) {
    const x = d.x + 18 * Math.sin(T * 0.21 * d.sp + d.ph) + 6 * T, y = d.y - 4 * T * d.sp + 10 * Math.sin(T * 0.3 * d.sp + d.ph * 2);
    const lit = patchAt(x - 120, y + 60, q) * (0.5 + 0.5 * Math.sin(T * 1.3 * d.sp + d.ph * 3));
    if (lit < 0.05) continue;
    const rr = d.big ? 16 + d.s * 5 : 1.6 + d.s * 1.2;
    c.globalAlpha = (d.big ? 0.05 : 0.22) * lit;
    c.drawImage(D, x - rr, y - rr, rr * 2, rr * 2);
  }
  c.globalAlpha = 1;
}

/* --------------------------------------------------------------------------
   Le décor
   -------------------------------------------------------------------------- */
const DEF = { land: 0, squeeze: 0, answer: 0, slide: 0 };

export default {
  id: ID,
  home: HOME,
  bg: '#2a2320',
  layers: {
    table: { box: [-240, -140, 2400, 1360], svg: TABLE + TASSE, filters: ['paint'], res: 1 },
    mainA: { box: [-240, 60, 1500, 1160], svg: MAIN_A, filters: ['ink'], res: 1.7 },
    brasB: { box: [-1800, -170, 2060, 350], svg: BRAS_B, filters: ['ink'], res: 1.5 },
    doigtsB: { box: [130, -140, 320, 270], svg: DOIGTS_B, filters: ['ink'], res: 1.8 },
    doigtsBW: { box: [130, -140, 260, 270], svg: DOIGTS_BW, filters: ['ink'], res: 1.8 },
    premier: { box: [1180, 650, 560, 520], svg: PREMIER, filters: ['b28'], res: 0.5, par: 1.25 },
  },

  render(g, p, T) {
    const q = { ...DEF, ...p };
    const b = poseB(q);

    g.img('table');
    g.img('mainA', { tf: tfA(q, T) });

    // ombre douce de la main de B sur la table et sur la main de A (occlusion)
    g.fx(1, (c) => {
      const m = c.getTransform();
      const k = Math.hypot(m.a, m.b);
      const PA = pathsOnce();
      const free = Math.max(0, b.h - 34 * b.onA);
      c.globalCompositeOperation = 'multiply';
      const draw = (pre, list, d, blur, a) => {
        c.save();
        c.translate(DL[0] * d - 9000, DL[1] * d);
        pre(c);
        c.shadowColor = `rgba(58,48,72,${a})`;
        c.shadowBlur = blur * k;
        c.shadowOffsetX = 9000 * k;
        c.fillStyle = '#000';
        for (const path of list) c.fill(path);
        c.restore();
      };
      const a = 0.55 / (1 + free * 0.03);
      draw(preB(b), PA.bPalm, 6 + free * 0.9, 10 + free * 0.4, a);
      const FB = fingB(b, PA);
      draw(FB.pre, FB.list, 5 + free * 0.9, 8 + free * 0.4, a);
      draw(preB(b), PA.bArm, 14 + free * 0.6, 12, 0.3);
    });

    g.img('brasB', { tf: tfB(b) });
    if (b.wrap > 0) g.img('doigtsBW', { tf: tfFingers(b, b.curl) });
    if (b.wrap < 1) g.img('doigtsB', { tf: tfFingers(b, b.open), alpha: 1 - b.wrap });

    // les jointures de B (bosses osseuses, creux entre elles) ; elles ressortent quand il serre
    g.fx(1, (c) => {
      applyTf(c, tfB(b));
      const kn = 0.06 + 0.1 * b.sq, va = 0.1 + 0.16 * b.sq;
      for (let i = 0; i < 4; i++) {
        const f = HB.F[i];
        const p = add(add(f.mcp, mul(f.d1, -9)), mul(LB, 4));
        c.globalCompositeOperation = 'screen';
        c.save();
        c.translate(p[0], p[1]);
        c.rotate(Math.atan2(f.d1[1], f.d1[0]));
        c.scale(1.5, 1);
        let rg = c.createRadialGradient(0, 0, 0, 0, 0, f.r[0] * 0.8);
        rg.addColorStop(0, `rgba(255,232,208,${kn})`);
        rg.addColorStop(1, 'rgba(255,232,208,0)');
        c.fillStyle = rg;
        c.fillRect(-30, -30, 60, 60);
        c.restore();
        if (i < 3) {
          const g2 = HB.F[i + 1];
          const v = add(mix(f.mcp, g2.mcp, 0.5), mul(f.d1, -8));
          c.globalCompositeOperation = 'multiply';
          rg = c.createRadialGradient(v[0], v[1], 0, v[0], v[1], 15);
          rg.addColorStop(0, `rgba(150,92,74,${va})`);
          rg.addColorStop(1, 'rgba(150,92,74,0)');
          c.fillStyle = rg;
          c.fillRect(v[0] - 16, v[1] - 16, 32, 32);
        }
      }
    });

    // Lumière : la couleur peinte est l'albédo ; ciel froid partout, soleil chaud ajouté dans la tache
    g.fx(1, (c) => {
      const m = c.getTransform();
      const W = c.canvas.width, H = c.canvas.height;
      ALB = canvasLike(ALB, W, H);
      const a = ALB.getContext('2d');
      a.setTransform(1, 0, 0, 1, 0, 0);
      a.globalAlpha = 1;
      a.globalCompositeOperation = 'copy';
      a.drawImage(c.canvas, 0, 0);
      // le ciel du matin, froid et doux, plus faible loin de la fenêtre ; il
      // comprend le rebond chaud du bois ensoleillé, qui réchauffe les ombres
      c.globalCompositeOperation = 'multiply';
      let gr = c.createLinearGradient(-200, 300, 2100, 700);
      gr.addColorStop(0, 'rgb(207,209,223)');
      gr.addColorStop(1, 'rgb(153,156,183)');
      c.fillStyle = gr;
      c.fillRect(-600, -800, 3200, 2400);
      // le soleil : albédo × couleur du soleil, dans la tache
      const lm = lightMap(c, q, T, b);
      a.globalCompositeOperation = 'multiply';
      a.fillStyle = 'rgb(255,216,170)';
      a.fillRect(0, 0, W, H);
      a.globalCompositeOperation = 'destination-in';
      a.drawImage(lm, 0, 0, W, H);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = 0.5;
      c.drawImage(ALB, 0, 0);
      // un peu d'éclat et de chaleur dans la lumière
      c.globalCompositeOperation = 'soft-light';
      c.globalAlpha = 0.3;
      c.drawImage(lm, 0, 0, W, H);
      c.globalAlpha = 1;
      c.setTransform(m);
      // halo de la fenêtre, à gauche (atmosphère)
      c.globalCompositeOperation = 'screen';
      gr = c.createRadialGradient(-300, 420, 50, -300, 420, 1300);
      gr.addColorStop(0, 'rgba(255,220,170,0.16)');
      gr.addColorStop(1, 'rgba(255,220,170,0)');
      c.fillStyle = gr;
      c.fillRect(-600, -800, 1600, 2400);
    });

    if (q.dbg) {
      g.fx(1, (c) => { const lm = lightMap(c, q, T, b); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.fillStyle = '#000'; c.fillRect(0, 0, c.canvas.width, c.canvas.height); c.drawImage(lm, 0, 0, c.canvas.width, c.canvas.height); });
      return;
    }
    g.fx(1, (c) => { steam(c, q, T); dust(c, q, T); });

    // Profondeur de champ : le loin (haut du cadre) et le près (bas) se brouillent ;
    // l'image réduite puis agrandie est reposée par fines bandes d'opacité croissante
    g.screen((c, W, H) => {
      HALF = canvasLike(HALF, Math.ceil(W / 2), Math.ceil(H / 2));
      SMALL = canvasLike(SMALL, Math.ceil(W / 4), Math.ceil(H / 4));
      const hf = HALF.getContext('2d'), sm = SMALL.getContext('2d');
      hf.globalCompositeOperation = sm.globalCompositeOperation = 'copy';
      hf.drawImage(c.canvas, 0, 0, HALF.width, HALF.height);
      sm.drawImage(HALF, 0, 0, SMALL.width, SMALL.height);
      const kx = SMALL.width / W, ky = SMALL.height / H;
      const band = (y0, y1, a0, a1, n) => {
        for (let i = 0; i < n; i++) {
          const ya = y0 + ((y1 - y0) * i) / n, yb = y0 + ((y1 - y0) * (i + 1)) / n;
          const a = lerp(a0, a1, (i + 0.5) / n);
          if (a < 0.01) continue;
          c.globalAlpha = a * a * (3 - 2 * a);
          c.drawImage(SMALL, 0, ya * ky, SMALL.width, (yb - ya) * ky, 0, ya, W, yb - ya);
        }
      };
      band(0, H * 0.17, 0.8, 0, 14);
      band(H * 0.64, H, 0, 0.85, 22);
    });

    g.img('premier');

    // Finition : densité des valeurs, comme une pellicule
    g.screen((c) => {
      c.globalCompositeOperation = 'soft-light';
      c.globalAlpha = 0.25;
      c.drawImage(c.canvas, 0, 0);
    });
  },

  shots: {
    // La main de B se pose sur celle de A (1 → 3,5 s), puis la serre ; lente poussée
    mains: {
      dur: 6.5,
      cam: (t, portrait) => {
        const k = 0.6 * ease.inOut(clamp(t / 6.5)) + 0.4 * clamp(t / 6.5);
        return portrait
          ? { x: lerp(772, 744, k), y: lerp(500, 494, k), z: lerp(1.2, 1.32, k) }
          : { x: lerp(880, 820, k), y: lerp(520, 516, k), z: lerp(1.22, 1.36, k) };
      },
      p: (t) => ({
        land: seg(t, 1.0, 3.5, ease.lin),
        squeeze: seg(t, 3.9, 5.1),
        answer: seg(t, 4.3, 5.8),
        slide: t / 6.5,
      }),
    },
  },
};
