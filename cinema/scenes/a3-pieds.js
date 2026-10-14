/* ==========================================================================
   Décor « a3-pieds » — Acte 3, le lac. Gros plan sur les pieds d'une
   personne de la file, à cheval sur la jointure des deux pontons : un pied
   sur les planches bleues (à gauche), un sur les rouges (à droite).

   La caméra est derrière la personne, comme dans le plan « ecart » de
   a3-lac (la file vue de dos), un peu au-dessus de ses talons : légère
   plongée ; les verticales restent verticales, comme un objectif décentré.
   On voit les talons, l'arrière du pantalon, et le bout des chaussures qui
   dépasse de part et d'autre des jambes. Les planches peintes, passées,
   fuient vers le haut du cadre ; aux deux coins du haut, le lac reflète le
   ciel d'aube (lavande à gauche, pêche à droite, scintillements du soleil).

   Chaussures de toile simples, couleur avoine sourde, semelle crème ;
   pantalon brun. Le soleil rasant se lève devant la personne, à droite
   (derrière la rive droite) : contre-jour doré en haut à droite, liseré
   d'or sur le côté droit des jambes et des chaussures, fil clair sur
   l'arête de chaque planche, longues ombres lavande qui filent vers la
   gauche et vers nous (en bas à gauche), comme dans « ecart ».

   Pendant le plan, les pontons s'écartent : chaque pied suit le sien, les
   jambes s'ouvrent doucement, et une bande d'eau s'ouvre entre les deux.
   L'eau a la couleur du lac (lavande et pêche du ciel au loin, plus
   profonde contre les flancs) ; on y voit les flotteurs, masses sombres
   sous la surface, le reflet tremblé des deux flancs (le bleu, au soleil,
   garde un filet doré sur sa lisse ; le rouge est dans l'ombre), des
   touches dorées que les rides cassent, et un peu de brume qui glisse.

   Géométrie : tout est construit en centimètres puis projeté (pr). X de
   gauche à droite (0 = la jointure), Y vers le haut (0 = le dessus des
   planches), Z en s'éloignant de la caméra. Un écart des pontons est une
   translation en X, ce qui, sur le plan des planches, revient à cisailler
   l'image autour de la ligne d'horizon : les calques des pontons sont donc
   peints une fois (pontons collés) puis cisaillés au rendu. Les chaussures,
   qui ont une hauteur, pencheraient : elles sont peintes à sept écarts, et
   seul le petit reste est cisaillé. Le flanc des pontons, l'eau, les reflets et les ombres portées sont
   procéduraux (g.fx). Remarque : le cisaillement est posé dans la fonction
   `clip` de g.img (le compositeur l'applique juste avant de dessiner) ; un
   `skew` dans `tf` serait plus propre, le jour où le compositeur l'aura.

   Paramètres (p) :
     gap   0 → 1   les pontons s'écartent (1 ≈ un pas, 60 cm). Le plan va
                   jusqu'à 0,6.
     life  0 / 1   la personne vit (léger transfert de poids)

   Plan : « pieds » (6,5 s). La caméra recule un peu à mesure que les pieds
   s'écartent ; l'eau s'ouvre entre eux.
   ========================================================================== */
import { rng } from '../kit.js';
import { TAU, clamp, lerp, ease, seg } from '../../film/engine.js';

const ID = 'a3-pieds';
const DEG = Math.PI / 180;

/* --------------------------------------------------------------------------
   Outils de tracé
   -------------------------------------------------------------------------- */
const f1 = (v) => +v.toFixed(1);
const pt = (p) => `${f1(p[0])},${f1(p[1])}`;
const poly = (ps, attrs = '') => `<polygon points="${ps.map(pt).join(' ')}" ${attrs}/>`;
const line = (ps) => `M${ps.map(pt).join(' L')}`;

// Courbe lisse (Catmull-Rom) passant par les points
function smooth(ps, closed = true) {
  const n = ps.length;
  const at = (i) => (closed ? ps[((i % n) + n) % n] : ps[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pt(ps[0])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return closed ? d + 'Z' : d;
}

// Enveloppe convexe (chaîne monotone)
function hull(ps) {
  const a = ps.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cr = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const lo = [], hi = [];
  for (const p of a) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of a.reverse()) { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}

// Couleurs
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixc = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const css = (c, a) => {
  const [r, g, b] = c.map((v) => Math.round(clamp(v, 0, 255)));
  return a == null ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${f1(a * 100) / 100})`;
};
const mixh = (a, b, k) => css(mixc(hex(a), hex(b), k));
// le même mélange, rendu en hexadécimal (pour pouvoir le remélanger)
const mixx = (a, b, k) => '#' + mixc(hex(a), hex(b), k).map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// Dégradés et flous en coordonnées du décor
const stops = (s) => s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
const grad = (id, a, b, s) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}">${stops(s)}</linearGradient>`;
const radial = (id, c, r, s) =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r)}">${stops(s)}</radialGradient>`;
const blurF = (id, s) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`;

/* --------------------------------------------------------------------------
   Perspective. Caméra à 80 cm au-dessus des planches, objectif décentré vers
   le bas : l'horizon est hors cadre, au-dessus (y = −460).
   -------------------------------------------------------------------------- */
const F = 1600, CX = 960, YH = -460, CH = 80;
const pr = (X, Y, Z) => [CX + (F * X) / Z, YH + (F * (CH - Y)) / Z];
const px = (cm, Z) => (cm * F) / Z;

// Pontons : largeur, lisses de bord, franc-bord (hauteur des planches
// au-dessus de l'eau : une dizaine de centimètres), étendue
const PW = 120, RAIL = 4.5, FB = 10, ZA = 60, ZB = 640, PITCH = 14, BOARD = 13.2;
// Le flanc d'un ponton, de haut en bas : le bout peint des planches, la
// lisse de bois brut, puis l'ombre sous le plancher jusqu'à l'eau
const ENDS = 2.4, BEAM = 7;
const GAPCM = 60; // p.gap = 1 : un pas

// Soleil d'aube : bas (14°), devant la personne et à droite ; les ombres
// filent vers la gauche et vers la caméra
const SUN_E = 14 * DEG;
const SH = (() => { const v = [-0.95, -0.3], m = Math.hypot(v[0], v[1]); return [v[0] / m, v[1] / m]; })();
const KSH = 1 / Math.tan(SUN_E);
const SUN = [-SH[0] * Math.cos(SUN_E), Math.sin(SUN_E), -SH[1] * Math.cos(SUN_E)];
// pente du soleil dans le plan (X, Y) : le ponton rouge fait de l'ombre au flanc bleu
const SUN_XY = SUN[1] / SUN[0];
// L'éclairement d'une facette de normale n (wrap > 0 : la lumière
// « enveloppe » un peu la forme, comme sur une toile), de 0 à 1
function lum(n, wrap = 0.3) {
  const m = Math.hypot(n[0], n[1], n[2]) || 1;
  return Math.max(0, ((n[0] * SUN[0] + n[1] * SUN[1] + n[2] * SUN[2]) / m + wrap) / (1 + wrap));
}
const AMB = [0.6, 0.57, 0.72], SUNC = [1.16, 0.93, 0.7];
function shade(alb, n, k = 1, wrap = 0) {
  const m = Math.hypot(n[0], n[1], n[2]) || 1;
  const nl = lum(n, wrap);
  const sky = 0.6 + (0.4 * n[1]) / m;
  return [0, 1, 2].map((i) => 255 * alb[i] * (AMB[i] * sky + k * SUNC[i] * nl));
}
// Peint, pas modelé : deux ou trois valeurs (ombre lavande, demi-teinte,
// lumière chaude), avec des passages courts entre elles
function tone(T3, l) {
  const [d, m, h] = T3.map(hex);
  return css(mixc(mixc(d, m, smoothstep(0.1, 0.24, l)), h, smoothstep(0.52, 0.64, l)));
}

/* --------------------------------------------------------------------------
   Les pieds. Une chaussure est un champ de hauteur posé sur une semelle :
   le contour (v du talon −14 au bout +14,5 ; u en travers, + côté intérieur)
   et la hauteur de l'empeigne le long du pied. Le talon est arrondi (on le
   voit de dos).
   -------------------------------------------------------------------------- */
const SV = [-14, -13.75, -13.2, -12.2, -9, -5, 0, 4, 7, 10, 12, 13.2, 14, 14.5];
const SLO = [-0.5, -2.1, -3.0, -3.8, -4.3, -4.2, -4.6, -5.1, -5.2, -4.9, -4.3, -3.5, -2.5, -0.9];
const SHI = [0.5, 2.0, 2.8, 3.4, 3.8, 3.4, 3.8, 4.8, 5.0, 4.8, 4.3, 3.7, 2.9, 1.4];
// (un soulier bas : le talon ne monte pas haut ; au bout, la hauteur retombe à presque rien : l'empeigne se referme sur la semelle)
const SHT = [6.2, 6.8, 7.1, 7.3, 7.7, 8.6, 8.4, 7.4, 6.5, 5.6, 5.0, 4.3, 3.2, 0.3];
const SOLE = 2.2;
function tab(A, v) {
  if (v <= SV[0]) return A[0];
  for (let i = 1; i < SV.length; i++) {
    if (v <= SV[i]) return lerp(A[i - 1], A[i], (v - SV[i - 1]) / (SV[i] - SV[i - 1]));
  }
  return A[A.length - 1];
}

// Les deux pieds de la personne (pontons collés) ; side −1 : sur le bleu.
// Les pointes s'ouvrent un peu vers l'extérieur (splay).
const FEET = [
  { side: -1, X: -13, Z: 128, splay: 19, hipX: -8 },
  { side: 1, X: 13, Z: 125, splay: 21, hipX: 8 },
];

// Repère d'un pied : (u, v, Y) → point du monde [X, Y, Z] ; la personne
// regarde vers le fond (v croît en s'éloignant de la caméra)
function frame(f, dx = 0) {
  const a = f.splay * DEG;
  const d = [f.side * Math.sin(a), Math.cos(a)];
  const e = [-f.side * Math.cos(a), f.side * Math.sin(a)]; // vers l'intérieur
  return (U, v, Y) => [f.X + dx + U * e[0] + v * d[0], Y, f.Z + U * e[1] + v * d[1]];
}
// Point de l'empeigne : a de 0 (côté extérieur) à 1 (intérieur)
const upperH = (a, v) => tab(SHT, v) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(2 * a - 1), 4)), 0.3);
const upperP = (fr, a, v, lift = 0) => fr(lerp(tab(SLO, v), tab(SHI, v), a) * 0.98, v, SOLE + upperH(a, v) + lift);
// Contour de la semelle (sens horaire vu de dessus), au niveau Y
function soleRing(fr, Y, k = 1.03) {
  const vs = [];
  for (let i = 0; i <= 40; i++) vs.push(-14 + 28.5 * (1 - Math.cos((Math.PI * i) / 40)) / 2);
  const A = vs.map((v) => fr(tab(SHI, v) * k, v, Y));
  const B = vs.slice().reverse().map((v) => fr(tab(SLO, v) * k, v, Y));
  return A.concat(B);
}
// Hauteur du contrefort (la pièce qui tient le talon), au-dessus de la semelle
const heelH = (v) => 4.3 * smoothstep(-6.5, -12.5, v);

const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const CAM = [0, CH, 0];

// Les trois valeurs de la toile, de la semelle et du contrefort
const CANVAS = ['#6b5649', '#917659', '#c79d69'];
const HEEL = ['#5a473e', '#7d6550', '#b48c60'];
const RUBBER = ['#a39693', '#c7b7a2', '#e4cfa8'];

// Une chaussure en SVG : semelle, empeigne peinte en deux ou trois valeurs,
// contrefort, lacets croisés, col
function shoe(f, k0, dx = 0, step = 0) {
  const fr = frame(f, dx);
  const inside = fr(0, 0, SOLE + 4);
  const faces = [];
  const face = (q, T3, nn = null) => {
    let n = nn || cross(sub3(q[2], q[0]), sub3(q[3], q[1]));
    const c = [0, 1, 2].map((i) => (q[0][i] + q[1][i] + q[2][i] + q[3][i]) / 4);
    if (dot3(n, sub3(c, inside)) < 0) n = n.map((v) => -v);
    if (dot3(n, sub3(CAM, c)) <= 0) return;
    faces.push({ d: Math.hypot(c[0], c[1] - CH, c[2]), q, col: tone(T3, lum(n)) });
  };
  // Le flanc de la semelle
  const r0 = soleRing(fr, 0), r1 = soleRing(fr, SOLE);
  for (let i = 0; i < r0.length; i++) {
    const j = (i + 1) % r0.length;
    // normale horizontale, vers l'extérieur du contour
    face([r0[i], r0[j], r1[j], r1[i]], RUBBER, [r0[j][2] - r0[i][2], 0, r0[i][0] - r0[j][0]]);
  }
  const sideFaces = faces.splice(0);
  // L'empeigne (et, en bas autour du talon, le contrefort)
  const nu = 16, nv = 40;
  const vs = [];
  for (let i = 0; i <= nv; i++) vs.push(-14 + 28.5 * (1 - Math.cos((Math.PI * i) / nv)) / 2);
  for (let i = 0; i < nv; i++) {
    for (let j = 0; j < nu; j++) {
      const a0 = j / nu, a1 = (j + 1) / nu;
      const vm = (vs[i] + vs[i + 1]) / 2, am = (a0 + a1) / 2;
      face([upperP(fr, a0, vs[i]), upperP(fr, a1, vs[i]), upperP(fr, a1, vs[i + 1]), upperP(fr, a0, vs[i + 1])],
        upperH(am, vm) < heelH(vm) ? HEEL : CANVAS);
    }
  }
  // la petite paroi du talon, tout au fond (le champ de hauteur s'y ferme)
  for (let j = 0; j < nu; j++) {
    const a0 = j / nu, a1 = (j + 1) / nu, w = (a) => fr(lerp(tab(SLO, -14), tab(SHI, -14), a) * 0.98, -14, SOLE);
    face([w(a0), w(a1), upperP(fr, a1, -14), upperP(fr, a0, -14)], HEEL, [0, 0, -1]);
  }
  const P3 = (w) => pr(w[0], w[1], w[2]);
  const draw = (L) => L.sort((p, q) => q.d - p.d)
    .map((F2) => poly(F2.q.map(P3), `fill="${F2.col}" stroke="${F2.col}" stroke-width="1.1" stroke-linejoin="round"`)).join('');
  const Z = f.Z;
  const id = `${ID}-s${k0}-${step}`;
  // la silhouette (pour y garder la texture de la toile)
  const all = [];
  for (const w of r0) all.push(P3(w));
  for (let i = 0; i <= nv; i += 2) for (let j = 0; j <= nu; j += 2) all.push(P3(upperP(fr, j / nu, vs[i])));
  const sil = hull(all);
  let s = `<defs><clipPath id="${id}-c"><path d="${line(sil)}Z"/></clipPath>${blurF(`${id}-b`, 1.6)}</defs>`;
  s += draw(sideFaces);
  // le haut de la semelle : un mince fil clair, seulement côté soleil
  const lip = [];
  for (const w of r1) lip.push(w);
  s += `<path d="${line(lip.map(P3))}Z" fill="none" stroke="#efe0c2" stroke-width="${f1(px(0.18, Z))}" opacity=".35"/>`;
  s += draw(faces);

  const P = (a, v, l = 0) => P3(upperP(fr, a, v, l));
  s += `<g clip-path="url(#${id}-c)">`;
  // la toile : un grain de trame croisée, à peine visible
  const r = rng(200 + k0);
  for (let i = 0; i < 70; i++) {
    const a = 0.08 + 0.84 * r(), v = -13 + 27 * r(), p0 = P(a, v, 0.05);
    const ang = (r() < 0.5 ? 0.6 : -0.6) + 0.2 * (r() - 0.5), L = px(0.8 + 1.4 * r(), Z);
    s += `<path d="M${pt(p0)} l${f1(Math.cos(ang) * L)},${f1(Math.sin(ang) * L)}" stroke="${r() < 0.5 ? '#f4e6cc' : '#4d4352'}" stroke-width="${f1(px(0.12, Z))}" opacity="${f1(0.08 + 0.08 * r())}"/>`;
  }
  // l'ombre lavande sur le côté gauche, le soleil sur le côté droit
  const gx = P3(fr(0, -2, 5));
  const gl = gx[0] - px(7, Z), gr = gx[0] + px(7, Z);
  s += `<defs>${grad(`${id}-l`, [gl, 0], [gr, 0], [[0, '#5d5578', 0.35], [0.45, '#5d5578', 0], [0.75, '#ffd49a', 0], [1, '#ffd49a', 0.3]])}</defs>`;
  s += `<rect x="${f1(gl - 40)}" y="0" width="${f1(gr - gl + 80)}" height="1400" fill="url(#${id}-l)"/>`;
  s += '</g>';
  // le liseré de soleil : le bord droit de la silhouette (seulement l'empeigne)
  {
    const rim = [];
    for (let i = 4; i <= nv - 2; i += 2) {
      // le point le plus à droite de la tranche v
      let best = null;
      for (let j = 0; j <= nu; j++) { const q = P(j / nu, vs[i]); if (!best || q[0] > best[0]) best = q; }
      rim.push(best);
    }
    s += `<path d="${smooth(rim, false)}" fill="none" stroke="#ffd79e" stroke-width="${f1(px(0.45, Z))}" opacity=".55" filter="url(#${id}-b)"/>`;
  }
  // le contrefort : une couture qui suit son bord
  {
    const st = [];
    for (const side of [0, 1]) {
      const pts2 = [];
      for (let v = -6.8; v >= -13.8; v -= 0.5) {
        const h = heelH(v), H = tab(SHT, v);
        if (h >= H) continue;
        const x = Math.pow(1 - Math.pow(h / H, 1 / 0.3), 0.25);
        pts2.push(P(side ? (1 + x) / 2 : (1 - x) / 2, v, 0.05));
      }
      st.push(side ? pts2.reverse() : pts2);
    }
    const seam = st[0].concat(st[1]);
    s += `<path d="${smooth(seam, false)}" fill="none" stroke="#f1e2c6" stroke-width="${f1(px(0.12, Z))}" stroke-dasharray="${f1(px(0.4, Z))} ${f1(px(0.3, Z))}" opacity=".45"/>`;
    // la couture verticale, au milieu du talon
    const b0 = P3(fr(0, -14.05, SOLE + 0.3)), b1 = P3(fr(0, -14.05, SOLE + 8.8));
    s += `<path d="M${pt(b0)} L${pt(b1)}" stroke="#5a4f5c" stroke-width="${f1(px(0.25, Z))}" opacity=".45"/>`;
  }
  // Le col : l'ouverture et son bourrelet
  {
    const op = [];
    for (let i = 0; i <= 16; i++) {
      const t = (TAU * i) / 16, a = 0.5 + 0.32 * Math.cos(t), v = -8.4 + 4.6 * Math.sin(t);
      op.push(P(a, v, -0.6));
    }
    s += `<path d="${smooth(op)}" fill="#3b3340" opacity=".85"/>`;
    s += `<path d="${smooth(op)}" fill="none" stroke="#c9b496" stroke-width="${f1(px(0.7, Z))}" opacity=".7"/>`;
  }
  // La languette et les lacets croisés (crème), entre deux rangs d'œillets
  {
    const tg = [];
    for (let v = -5.4; v <= 5.0; v += 0.8) tg.push(P(0.4, v, 0.05));
    for (let v = 5.0; v >= -5.4; v -= 0.8) tg.push(P(0.6, v, 0.05));
    s += poly(tg, `fill="#6a5f62" opacity=".28"`);
    const rows = [-4.4, -2.3, -0.2, 1.9, 4.0];
    const A = rows.map((v) => P(0.33, v, 0.3)), B = rows.map((v) => P(0.67, v, 0.3));
    const lw = f1(px(0.42, Z));
    for (let i = 0; i < rows.length - 1; i++) {
      for (const [p, q] of [[A[i], B[i + 1]], [B[i], A[i + 1]]]) {
        s += `<path d="M${pt(p)} L${pt(q)}" stroke="#4a4048" stroke-width="${lw}" opacity=".3" transform="translate(0 ${f1(px(0.3, Z))})"/>`;
        s += `<path d="M${pt(p)} L${pt(q)}" stroke="#e8dcc4" stroke-width="${lw}" stroke-linecap="round"/>`;
      }
    }
    for (const e of A.concat(B)) s += `<circle cx="${f1(e[0])}" cy="${f1(e[1])}" r="${f1(px(0.3, Z))}" fill="#4a4038" opacity=".7"/>`;
  }
  // le bout renforcé : une couture en travers
  const cap = [];
  for (let a = 0.08; a <= 0.92 + 1e-6; a += 0.084) cap.push(P(a, 9.8 - 2.2 * Math.pow(Math.abs(2 * a - 1), 2), 0.05));
  s += `<path d="${smooth(cap, false)}" fill="none" stroke="#f0e2c8" stroke-width="${f1(px(0.12, Z))}" stroke-dasharray="${f1(px(0.45, Z))} ${f1(px(0.35, Z))}" opacity=".45"/>`;
  return s;
}

/* --------------------------------------------------------------------------
   Une jambe de pantalon : un cylindre de la cheville à la hanche. On la voit
   de dos : l'ourlet tombe derrière sur le contrefort (il en couvre le haut et
   le col), remonte un peu sur les côtés, et repose devant sur le cou-de-pied.
   -------------------------------------------------------------------------- */
const HEM_BACK = 7.2;
function legGeom(f, r = 5.8, dx = 0) {
  const fr = frame(f, dx);
  const A = fr(0, -8.6, 0);
  const H = [f.hipX, 88, f.Z + 3];
  const front = SOLE + tab(SHT, -8.6 + r) + 0.8;
  // phi : angle autour de la jambe ; sin(phi) < 0 du côté de la caméra
  const Yh = (phi) => {
    const s = Math.sin(phi);
    return s < 0 ? HEM_BACK + 0.6 * (1 + s) : HEM_BACK + 0.6 + (front - HEM_BACK - 0.6) * s * s;
  };
  const center = (Y) => { const k = (Y - 8) / 80; return [lerp(A[0], H[0], k), lerp(A[2], H[2], k)]; };
  // un peu d'aisance en bas, plus étroit au mollet, plus large à la cuisse
  const rad = (Y) => r * (1.05 - 0.08 * smoothstep(8, 45, Y) + 0.16 * smoothstep(50, 104, Y));
  // (un pantalon repassé : la jambe est un peu aplatie d'avant en arrière)
  const at = (phi, Y) => { const c = center(Y), R = rad(Y); return pr(c[0] + R * Math.cos(phi), Y, c[1] + 0.66 * R * Math.sin(phi)); };
  return { A, H, Yh, center, rad, at, ank: pr(A[0], 9, A[2]) };
}

function trouser(f, look, id) {
  const G = legGeom(f, look.r);
  const { at, Yh } = G;
  const Z = G.A[2];
  const left = [], right = [], hem = [];
  for (let Y = 104; Y > Yh(Math.PI); Y -= 8) left.push(at(Math.PI, Y));
  for (let i = 0; i <= 24; i++) { const phi = Math.PI + (Math.PI * i) / 24; hem.push(at(phi, Yh(phi))); }
  for (let Y = Yh(0); Y <= 104; Y += 8) right.push(at(0, Y));
  right.push(at(0, 104));
  const outline = left.concat(hem, right);
  // Dégradé en travers de la jambe, peint en trois valeurs : l'ombre
  // lavande à gauche, la demi-teinte du dos (le ciel), puis la lumière du
  // contre-jour qui ne prend que le côté droit
  const gl = at(Math.PI, 40), gr = at(0, 40);
  const [dk, md, hi] = look.tones.map(hex);
  const st = [];
  for (let i = 0; i <= 12; i++) {
    const a = i / 12, c = 2 * a - 1, s = -Math.sqrt(Math.max(0, 1 - c * c));
    const l = lum([c, 0.05, s], 0.15);
    st.push([f1(a), css(mixc(mixc(dk, md, smoothstep(0.05, 0.45, a)), hi, smoothstep(0.3, 0.56, l)))]);
  }
  let s = `<defs>${grad(`${id}-g`, gl, gr, st)}
    ${grad(`${id}-v`, at(-Math.PI / 2, 100), at(-Math.PI / 2, 8), [[0, '#ffffff', 0], [0.75, '#ffffff', 0], [1, '#2a2030', 0.2]])}
    <clipPath id="${id}-c"><path d="${line(outline)}Z"/></clipPath>
    ${blurF(`${id}-f2`, 2)}${blurF(`${id}-f5`, 5)}${blurF(`${id}-f9`, 9)}</defs>`;
  // l'ombre de l'ourlet sur le talon et autour
  const hemLow = [];
  for (let i = 0; i <= 24; i++) { const phi = Math.PI + (Math.PI * i) / 24; hemLow.push(at(phi, Yh(phi) - 1.8)); }
  s += `<path d="${smooth(hemLow, false)}" fill="none" stroke="#2c2230" stroke-width="${f1(px(2.4, Z))}" opacity=".5" filter="url(#${id}-f5)"/>`;
  // la jambe
  s += `<path d="${line(outline)}Z" fill="url(#${id}-g)"/>`;
  s += `<g clip-path="url(#${id}-c)">`;
  s += `<path d="${line(outline)}Z" fill="url(#${id}-v)"/>`;
  const r = rng(look.seed);
  // trame : quelques longues traces verticales
  for (let i = 0; i < 9; i++) {
    const phi = Math.PI * (1.08 + 0.84 * r());
    const a = at(phi, 10 + r() * 20), b = at(phi, 104);
    s += `<path d="M${pt(a)} L${pt(b)}" stroke="${r() < 0.6 ? '#1e1520' : '#e8c8a4'}" stroke-width="${f1(px(0.8 + 1.4 * r(), Z))}" opacity="${f1(0.03 + 0.04 * r())}" filter="url(#${id}-f2)"/>`;
  }
  // de grands plis souples, du mollet à l'ourlet : une ombre, et la
  // lumière qui en attrape le bord droit
  for (const [p0, a0] of [[1.24, 0.2], [1.38, 0.16], [1.66, 0.14], [1.8, 0.12]]) {
    const dk = [], lt = [];
    for (let Y = Yh(p0 * Math.PI) + 2; Y <= 104; Y += 6) {
      const ph = p0 * Math.PI + 0.07 * Math.sin(Y * 0.09 + p0 * 7);
      dk.push(at(ph, Y));
      lt.push(at(ph + 0.12, Y));
    }
    s += `<path d="${smooth(dk, false)}" fill="none" stroke="#1f1418" stroke-width="${f1(px(1.6, Z))}" opacity="${a0}" filter="url(#${id}-f5)"/>`;
    s += `<path d="${smooth(lt, false)}" fill="none" stroke="#e7b987" stroke-width="${f1(px(1.0, Z))}" opacity="${f1(a0 * 0.55)}" filter="url(#${id}-f5)"/>`;
  }
  // le pli repassé de l'arrière, au milieu de la jambe
  const cr1 = at(1.52 * Math.PI, Yh(1.52 * Math.PI) + 6), cr2 = at(1.52 * Math.PI, 104);
  s += `<path d="M${pt(cr1)} L${pt(cr2)}" stroke="#f1c99c" stroke-width="${f1(px(0.7, Z))}" opacity=".14" filter="url(#${id}-f2)"/>`;
  s += `<path d="M${pt([cr1[0] - px(0.8, Z), cr1[1]])} L${pt([cr2[0] - px(0.8, Z), cr2[1]])}" stroke="#2a1d22" stroke-width="${f1(px(0.6, Z))}" opacity=".14" filter="url(#${id}-f2)"/>`;
  // le tissu se tasse un peu au-dessus de l'ourlet : deux plis doux
  for (const [y0, w0, a0] of [[3.5, 1.6, 0.22]]) {
    const fold = [];
    for (let i = 4; i <= 20; i++) {
      const phi = Math.PI + (Math.PI * i) / 24, w = Math.sin((Math.PI * (i - 4)) / 16);
      fold.push(at(phi, Yh(phi) + y0 + w0 * w));
    }
    s += `<path d="${smooth(fold, false)}" fill="none" stroke="#24191f" stroke-width="${f1(px(1.4, Z))}" opacity="${a0}" filter="url(#${id}-f5)"/>`;
  }
  // liseré de soleil, doré, sur le bord droit (contre-jour)
  const rimP = [], rimQ = [];
  for (let Y = Yh(0) + 0.5; Y <= 104; Y += 6) { rimP.push(at(-0.06, Y)); rimQ.push(at(-0.32, Y)); }
  s += `<path d="${line(rimQ)}" stroke="#f0a560" stroke-width="${f1(px(1.6, Z))}" opacity=".22" fill="none" filter="url(#${id}-f5)"/>`;
  s += `<path d="${line(rimP)}" stroke="#ffd08a" stroke-width="${f1(px(0.9, Z))}" opacity=".75" fill="none" filter="url(#${id}-f2)"/>`;
  // ombre lavande du côté gauche
  const shP = [];
  for (let Y = Yh(Math.PI) + 1; Y <= 104; Y += 8) shP.push(at(Math.PI + 0.14, Y));
  s += `<path d="${line(shP)}" stroke="#2a2440" stroke-width="${f1(px(2.4, Z))}" opacity=".32" fill="none" filter="url(#${id}-f5)"/>`;
  s += '</g>';
  // l'ourlet : une arête sombre, un fil de lumière juste au-dessus, côté soleil
  s += `<path d="${smooth(hem, false)}" fill="none" stroke="#21171c" stroke-width="${f1(px(0.45, Z))}" opacity=".55"/>`;
  s += `<path d="${smooth(hem.slice(14, 24).map((p) => [p[0], p[1] - px(0.6, Z)]), false)}" fill="none" stroke="#f2c899" stroke-width="${f1(px(0.35, Z))}" opacity=".4"/>`;
  return s;
}

/* --------------------------------------------------------------------------
   Calques « bleu » et « rouge » : un ponton, pontons collés (planches
   peintes, passées, lisses de bois brut, clous). Le lointain et le
   tout-près sont flous (profondeur de champ : on fait le point sur les
   pieds).
   -------------------------------------------------------------------------- */
const HERO_LEG = { tones: ['#30242a', '#4c372f', '#8e6442'], r: 5.8, seed: 5 };
// Les planches que couvrent les chaussures : on n'y use pas la peinture
const underFoot = (x, Z) => x < 30 && Z > 98 && Z < 160;

function ponton(sd) {
  const blue = sd < 0;
  // peinture passée : la teinte de la bible, un peu lavée par le soleil
  const C = blue
    ? { base: '#5d7fa6', shade: '#3c5675', light: '#8fb0d1', fade: '#9aa6b3' }
    : { base: mixx('#b5523f', '#9c6f6c', 0.32), shade: '#7e3529', light: mixx('#d9826b', '#c9a097', 0.3), fade: '#b49088' };
  const id = (n) => `${ID}-${blue ? 'b' : 'r'}-${n}`;
  const r = rng(blue ? 31 : 47);
  const P = (x, Z, Y = 0) => pr(sd * x, Y, Z);
  const WOOD = '#8a6a4c';

  let deck = poly([P(0, ZA), P(PW, ZA), P(PW, ZB), P(0, ZB)], `fill="${mixh(C.shade, '#1b1c25', 0.55)}"`);
  const x0 = RAIL + 0.3, x1 = PW - RAIL - 0.3;
  for (let Z0 = ZA; Z0 < ZB; Z0 += PITCH) {
    const Z1 = Z0 + BOARD, t = r();
    const col = t < 0.22 ? mixh(C.base, C.shade, 0.3) : t < 0.55 ? C.base : t < 0.8 ? mixh(C.base, C.light, 0.25) : mixh(C.base, C.fade, 0.5);
    deck += poly([P(x0, Z0), P(x1, Z0), P(x1, Z1), P(x0, Z1)], `fill="${col}"`);
    // l'arête de devant (vers nous) est à contre-jour ; l'arête du fond,
    // arrondie par l'usure, attrape le soleil : un fil clair, cassé
    deck += poly([P(x0, Z0), P(x1, Z0), P(x1, Z0 + 1.2), P(x0, Z0 + 1.2)], `fill="${C.shade}" opacity=".55"`);
    {
      let xa = x0 + r() * 6;
      while (xa < x1 - 2) {
        const xb = Math.min(x1, xa + 8 + r() * 40);
        deck += poly([P(xa, Z1 - 0.9), P(xb, Z1 - 0.9), P(xb, Z1 - 0.1), P(xa, Z1 - 0.1)], `fill="#f6dcb4" opacity="${f1(0.3 + 0.35 * r())}"`);
        xa = xb + 1 + r() * 12;
      }
    }
    // nuances longues de la peinture
    for (let k = 0; k < 2; k++) {
      const xa = x0 + r() * 60, xb = Math.min(x1, xa + 25 + r() * 60), za = Z0 + 1.5 + r() * 6, zb = za + 2 + r() * 4;
      deck += poly([P(xa, za), P(xb, za + r()), P(xb, Math.min(Z1 - 0.5, zb)), P(xa, Math.min(Z1 - 0.5, zb - r()))], `fill="${r() < 0.5 ? C.light : C.shade}" opacity="${f1(0.12 + 0.12 * r())}"`);
    }
    // usure : la peinture frottée le long du fil du bois, surtout près de la
    // jointure (là où l'on passe) ; de longs frottis effilés, jamais d'ovale
    const nw = r() < 0.75 ? 1 + Math.floor(r() * 3) : 0;
    for (let k = 0; k < nw; k++) {
      const near = r() < 0.7;
      const xa = near ? x0 + 34 * Math.pow(r(), 1.4) : x0 + (x1 - x0) * r();
      const len = 8 + r() * 34, zc = Z0 + 2 + r() * 9, th = 0.25 + r() * 0.9;
      const xb = Math.min(x1, xa + len);
      if (underFoot(xa, zc) || underFoot(xb, zc)) continue;
      const top = [], bot = [];
      for (let m = 0; m <= 8; m++) {
        const u = m / 8, w = th * Math.pow(Math.sin(Math.PI * u), 0.6) * (0.6 + 0.6 * r());
        const z = zc + 0.3 * Math.sin(u * 5 + k);
        top.push(P(lerp(xa, xb, u), clamp(z - w, Z0 + 0.3, Z1 - 0.3)));
        bot.push(P(lerp(xa, xb, u), clamp(z + w, Z0 + 0.3, Z1 - 0.3)));
      }
      deck += `<path d="${line(top.concat(bot.reverse()))}Z" fill="${r() < 0.6 ? '#a58a6c' : '#bfae96'}" opacity="${f1(0.22 + r() * 0.25)}"/>`;
      // quelques griffures plus fines dans le même sens
      for (let m = 0; m < 2; m++) {
        const za = zc + (r() - 0.5) * 2 * th, xs = xa + r() * len * 0.4;
        deck += `<path d="M${pt(P(xs, za))} L${pt(P(Math.min(x1, xs + len * (0.3 + 0.5 * r())), za + (r() - 0.5) * 0.4))}" stroke="#c8b69c" stroke-width="${f1(px(0.15, za))}" opacity="${f1(0.25 + 0.2 * r())}"/>`;
      }
    }
    // écailles : la peinture partie au bord des planches, le bois brut dessous
    const nc = Math.floor(r() * 3.2);
    for (let k = 0; k < nc; k++) {
      const atEnd = r() < 0.4;
      const xc = atEnd ? (r() < 0.5 ? x0 + 1.5 * r() : x1 - 1.5 * r()) : x0 + (x1 - x0) * r();
      const edge = r() < 0.5;
      const zc = atEnd ? Z0 + 1 + r() * (BOARD - 2) : edge ? Z0 + 0.4 : Z1 - 0.4;
      if (underFoot(xc, zc)) continue;
      const w = 0.8 + r() * 3.2, h = 0.4 + r() * 1.3, ps = [];
      for (let m = 0; m < 7; m++) {
        const ang = (m / 7) * TAU, j = 0.55 + 0.6 * r();
        ps.push(P(clamp(xc + Math.cos(ang) * w * j, x0, x1), clamp(zc + Math.sin(ang) * h * j, Z0 + 0.1, Z1 - 0.1)));
      }
      deck += poly(ps, `fill="${WOOD}" opacity="${f1(0.75 + 0.2 * r())}"`);
      deck += poly(ps.map((p) => [p[0], p[1] - 0.8]), `fill="none" stroke="${mixh(C.light, '#f2e6d2', 0.4)}" stroke-width=".8" opacity=".35"`);
    }
    // veines du bois sous la peinture
    for (let k = 0; k < 2; k++) {
      const zz = Z0 + 2 + r() * 9, ps = [];
      for (let m = 0; m <= 6; m++) ps.push(P(lerp(x0, x1, m / 6), zz + (r() - 0.5) * 0.7));
      deck += `<path d="${line(ps)}" fill="none" stroke="${C.shade}" stroke-width="${f1(px(0.16, zz))}" opacity="${f1(0.22 + 0.2 * r())}"/>`;
    }
    // clous, près des lisses
    for (const xx of [x0 + 2.4, x1 - 2.4]) {
      for (const zz of [Z0 + 3, Z1 - 3]) {
        const c = P(xx, zz);
        deck += `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(px(0.9, zz))}" fill="#6e5038" opacity=".2"/>`;
        deck += `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(px(0.4, zz))}" fill="#2c2a2e" opacity=".6"/>`;
      }
    }
  }
  // Lisses de bois brut, de chaque côté
  const wood = [WOOD, '#9b7a5a', '#7a5c42', '#a2896d'];
  for (const [ra, rb] of [[0.25, RAIL], [PW - RAIL, PW]]) {
    deck += poly([P(ra, ZA), P(rb, ZA), P(rb, ZB), P(ra, ZB)], `fill="${wood[0]}"`);
    let zj = ZA + r() * 120;
    while (zj < ZB) {
      deck += `<path d="M${pt(P(ra, zj))} L${pt(P(rb, zj))}" stroke="#3e2f24" stroke-width="${f1(px(0.4, zj))}" opacity=".6"/>`;
      zj += 180 + r() * 90;
    }
    for (let k = 0; k < 7; k++) {
      const xx = lerp(ra + 0.6, rb - 0.6, r()), ps = [];
      for (let m = 0; m <= 14; m++) ps.push(P(xx + (r() - 0.5) * 0.4, lerp(ZA, ZB, m / 14)));
      deck += `<path d="${line(ps)}" fill="none" stroke="${wood[1 + Math.floor(r() * 3)]}" stroke-width="${f1(px(0.6 + r() * 0.8, 160))}" opacity="${f1(0.35 + 0.3 * r())}"/>`;
    }
    for (let zz = ZA + 20; zz < ZB; zz += 40) {
      const c = P((ra + rb) / 2, zz);
      deck += `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(px(0.45, zz))}" fill="#2c2a2e" opacity=".6"/>`;
    }
  }
  // la fente de la jointure, et le fil de lumière sur l'arête extérieure
  // (côté soleil pour le rouge, côté jointure pour le bleu)
  deck += `<path d="M${pt(P(0.3, ZA))} L${pt(P(0.3, ZB))}" stroke="#15151b" stroke-width="3" opacity=".8"/>`;
  deck += `<path d="M${pt(P(PW - 0.4, ZA))} L${pt(P(PW - 0.4, ZB))}" stroke="${blue ? '#c9b8a8' : '#f2c79a'}" stroke-width="2.5" opacity="${blue ? 0.3 : 0.6}"/>`;
  if (blue) deck += `<path d="M${pt(P(1.2, ZA))} L${pt(P(1.2, ZB))}" stroke="#f0cf9c" stroke-width="2" opacity=".35"/>`;

  // Profondeur de champ : copies floues, masquées vers le lointain et le tout-près
  const far = grad(id('m-far'), [0, -280], [0, 440], [[0, '#fff'], [0.45, '#fff', 0.85], [1, '#fff', 0]]);
  const near = grad(id('m-near'), [0, 820], [0, 1240], [[0, '#fff', 0], [1, '#fff', 0.9]]);
  return `<defs>
    ${far}${near}
    <mask id="${id('mf')}" maskUnits="userSpaceOnUse" x="-400" y="-400" width="2800" height="1800"><rect x="-400" y="-400" width="2800" height="1800" fill="url(#${id('m-far')})"/></mask>
    <mask id="${id('mn')}" maskUnits="userSpaceOnUse" x="-400" y="-400" width="2800" height="1800"><rect x="-400" y="-400" width="2800" height="1800" fill="url(#${id('m-near')})"/></mask>
    ${blurF(id('bf'), 7)}${blurF(id('bn'), 3)}
  </defs>
  <g id="${id('net')}">${deck}</g>
  <use href="#${id('net')}" filter="url(#${id('bf')})" mask="url(#${id('mf')})"/>
  <use href="#${id('net')}" filter="url(#${id('bn')})" mask="url(#${id('mn')})"/>`;
}

/* --------------------------------------------------------------------------
   Calque « fond » : l'eau, pontons ôtés. Les mêmes valeurs que le lac de
   a3-lac : le ciel d'aube s'y reflète, pêche au loin et côté soleil, lavande
   plus près et à gauche ; jamais de bleu franc (réservé aux pontons).
   -------------------------------------------------------------------------- */
function fond() {
  const r = rng(73);
  let s = `<defs>
    ${grad(`${ID}-eau`, [0, -200], [0, 1220], [[0, '#efcfb9'], [0.16, '#d8c0c8'], [0.4, '#b2a8c6'], [0.7, '#9c94b8'], [1, '#8a83a8']])}
    ${radial(`${ID}-peche`, [2150, -180], 1150, [[0, '#f8cfa4', 0.85], [0.45, '#eab092', 0.3], [1, '#eab092', 0]])}
    ${radial(`${ID}-lav`, [-200, 0], 900, [[0, '#c9c2e0', 0.5], [1, '#c9c2e0', 0]])}
    ${blurF(`${ID}-f3`, 3)}
  </defs>`;
  s += `<rect x="-240" y="-180" width="2400" height="1400" fill="url(#${ID}-eau)"/>`;
  s += `<rect x="-240" y="-180" width="2400" height="1400" fill="url(#${ID}-peche)"/>`;
  s += `<rect x="-240" y="-180" width="2400" height="1400" fill="url(#${ID}-lav)"/>`;
  // rides : traits clairs (le ciel) et plus sombres, couchés par la perspective
  for (let i = 0; i < 140; i++) {
    const Z = 80 + Math.pow(r(), 0.7) * 620, X = (r() - 0.5) * 2 * (PW + 260);
    const c = pr(X, -FB, Z);
    if (c[0] < -260 || c[0] > 2180 || c[1] < -160 || c[1] > 1240) continue;
    const rx = px(6 + r() * 26, Z), ry = rx * (0.05 + 0.08 * ((CH + FB) / Z));
    const light = r() < 0.6;
    const col = light ? (c[0] > 960 ? '#ffe0c0' : '#e2dcf4') : '#6c6688';
    s += `<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}" opacity="${f1((light ? 0.12 : 0.12) + 0.12 * r())}" filter="url(#${ID}-f3)"/>`;
  }
  return s;
}

/* --------------------------------------------------------------------------
   Procédural : l'eau qui s'ouvre, le flanc des pontons, les reflets
   -------------------------------------------------------------------------- */
const sparkle = (T, w, ph) => Math.pow(0.5 + 0.5 * Math.sin(T * w * 2.2 + ph), 5);
const SPARK = (() => {
  const r = rng(19), out = [];
  for (let i = 0; i < 90; i++) {
    const right = r() < 0.72;
    out.push({ right, d: 4 + Math.pow(r(), 1.3) * 300, Z: 170 + r() * 520, L: 4 + r() * 16, w: 0.5 + 1.5 * r(), ph: TAU * r() });
  }
  return out;
})();
// Les touches dorées du reflet : chacune sa place, sa longueur, sa dérive
const GOLD = (() => {
  const r = rng(91), out = [];
  for (let i = 0; i < 150; i++) {
    out.push({
      Z: 66 + Math.pow(r(), 1.35) * 470, // plus nombreuses tout près
      d: Math.pow(r(), 1.7), // près du flanc bleu
      L: 0.4 + Math.pow(r(), 1.5) * 1.6, th: 0.4 + 0.7 * r(),
      ph: TAU * r(), ph2: TAU * r(), w: 0.4 + 0.9 * r(), wav: 0.5 + r(), cool: r() < 0.12,
    });
  }
  return out;
})();
// La brume qui glisse dans la fente
const VEILS = (() => {
  const r = rng(57), out = [];
  for (let i = 0; i < 7; i++) out.push({ Z: 90 + r() * 420, u: r() - 0.5, sp: 3 + 4 * r(), ph: TAU * r(), s: 0.7 + 0.6 * r() });
  return out;
})();

function path(c, ps) {
  c.beginPath();
  ps.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  c.closePath();
}

// Scintillements du soleil sur le lac, aux deux coins du haut
function lake(c, o, T) {
  c.globalCompositeOperation = 'screen';
  for (const g of SPARK) {
    const X = (g.right ? 1 : -1) * (PW + o + g.d);
    const p = pr(X, -FB, g.Z);
    if (p[1] > 520) continue;
    const a = sparkle(T, g.w, g.ph) * (g.right ? 0.85 : 0.35);
    if (a < 0.02) continue;
    const rx = px(g.L, g.Z) * 0.5, ry = Math.max(0.8, rx * 0.12);
    c.fillStyle = g.right ? `rgba(255,222,170,${a.toFixed(3)})` : `rgba(226,222,255,${a.toFixed(3)})`;
    c.beginPath();
    c.ellipse(p[0], p[1], rx, ry, 0, 0, TAU);
    c.fill();
  }
}

// Les Z découpés finement, plus serrés tout près
const ZSTEPS = (() => { const a = []; for (let Z = ZA; Z < 560; Z *= 1.035) a.push(Z); a.push(560); return a; })();
// Le tremblé des rides, en cm, le long de la fente
const wob = (Z, T, k) => 0.55 * Math.sin(Z * 0.31 + T * 1.15 + k * 1.7) + 0.35 * Math.sin(Z * 0.83 - T * 0.7 + k) + 0.2 * Math.sin(Z * 2.1 + T * 2.3);
// Transparence : tout près on voit dans l'eau, au loin elle renvoie le ciel
const seeIn = (Z) => clamp(1 - (Z - 70) / 260);

// L'eau entre les pontons
function gapWater(c, o, T) {
  const W = [pr(-o, -FB, ZA), pr(-o, -FB, ZB), pr(o, -FB, ZB), pr(o, -FB, ZA)];
  const k = clamp(o / 5);
  const yAt = (Z) => pr(0, -FB, Z)[1];
  c.save();
  path(c, W);
  c.clip();
  // 1. Tout près, on voit un peu dans l'eau : une profondeur prune, douce
  c.globalCompositeOperation = 'source-over';
  let gr = c.createLinearGradient(0, yAt(330), 0, yAt(70));
  gr.addColorStop(0, 'rgba(110,100,136,0)');
  gr.addColorStop(0.6, 'rgba(98,90,124,0.3)');
  gr.addColorStop(1, 'rgba(86,80,114,0.45)');
  c.fillStyle = gr;
  c.fillRect(-400, -300, 2800, 1700);
  // 2. Les flotteurs : masses sombres arrondies sous la surface, de part et
  // d'autre ; on ne les voit que là où l'eau est transparente
  for (const sd of [-1, 1]) {
    for (let z = ZA - 30; z < 460; z += 96) {
      const z0 = z, z1 = z + 80, zc = (z0 + z1) / 2;
      const inner = [], outer = [];
      for (let i = 0; i <= 14; i++) {
        const Z = lerp(z0, z1, i / 14);
        const e = Math.sqrt(Math.max(0, 1 - Math.pow((Z - zc) / 40, 6)));
        inner.push(pr(sd * (o - 5.5 * e), -FB - 6, Z));
        outer.push(pr(sd * (o + 2), -FB - 6, Z));
      }
      const a = 0.55 * seeIn(zc);
      if (a < 0.02) continue;
      const shp = inner.concat(outer.reverse());
      c.fillStyle = `rgba(44,40,58,${(a * 0.45).toFixed(3)})`;
      path(c, shp.map((p, i) => (i < 15 ? [p[0] - sd * px(1.2, zc), p[1]] : p)));
      c.fill();
      c.fillStyle = `rgba(36,33,48,${a.toFixed(3)})`;
      path(c, shp);
      c.fill();
      // le dessus du flotteur, juste sous l'eau, prend un peu de jour
      c.strokeStyle = `rgba(150,140,178,${(a * 0.5).toFixed(3)})`;
      c.lineWidth = Math.max(1, px(0.5, zc));
      c.beginPath();
      inner.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
      c.stroke();
    }
  }
  // 3. Au loin, le ciel s'y reflète : pêche et lavande, comme le lac
  c.globalCompositeOperation = 'source-over';
  gr = c.createLinearGradient(0, yAt(560), 0, yAt(120));
  gr.addColorStop(0, 'rgba(226,196,196,0.75)');
  gr.addColorStop(0.45, 'rgba(184,172,204,0.35)');
  gr.addColorStop(1, 'rgba(170,160,198,0)');
  c.fillStyle = gr;
  c.fillRect(-400, -300, 2800, 1700);
  // 4. Contre les flancs, l'eau reflète le dessous sombre des pontons
  c.globalCompositeOperation = 'multiply';
  const wmax = Math.min(7, 0.3 * 2 * o);
  for (let j = 1; j <= 8; j++) {
    const w = (wmax * j) / 8;
    for (const sd of [-1, 1]) {
      c.fillStyle = sd < 0 ? 'rgba(112,100,140,0.09)' : 'rgba(96,84,124,0.11)';
      path(c, [pr(sd * o, -FB, ZA), pr(sd * o, -FB, ZB), pr(sd * (o - w), -FB, ZB), pr(sd * (o - w), -FB, ZA)]);
      c.fill();
    }
  }
  // 5. Le reflet tremblé des deux flancs : bandes colorées à l'envers (le
  // vide sous le plancher, la lisse, le bout peint des planches)
  c.globalCompositeOperation = 'source-over';
  const lit = Math.min(FB, 2 * o * SUN_XY);
  for (const sd of [-1, 1]) {
    const blue = sd < 0;
    const bands = blue
      ? [[-FB, -BEAM, [40, 38, 52]], [-BEAM, -ENDS, [196, 150, 98]], [-ENDS, 0, [138, 158, 190]]]
      : [[-FB, -BEAM, [34, 30, 42]], [-BEAM, -ENDS, [92, 68, 60]], [-ENDS, 0, [118, 60, 54]]];
    bands.forEach(([y0, y1, col], bi) => {
      // le miroir de l'eau : Y → −2 FB − Y ; les rides le découpent en
      // tranches tremblées, plus ou moins lisibles
      const m0 = -2 * FB - y0, m1 = -2 * FB - y1;
      const a1 = blue ? 0.75 : 0.65;
      let prev = null;
      for (const Z of ZSTEPS) {
        const s0 = Math.max(0, wob(Z, T, sd + bi * 0.7)) * (0.3 + 0.15 * bi);
        const s1 = 0.3 + Math.max(0, wob(Z, T, sd + bi * 0.7 + 0.5)) * (0.7 + 0.25 * bi);
        const cur = [pr(sd * (o - s0), m0, Z), pr(sd * (o - s1), m1, Z)];
        if (prev) {
          const rip = 0.5 + 0.5 * Math.sin(Z * 0.47 - T * 1.2 + 2.1 * Math.sin(Z * 0.13 + T * 0.4) + bi);
          const a = a1 * (0.35 + 0.65 * Math.pow(rip, 0.6)) * clamp((560 - Z) / 300);
          c.fillStyle = css(col, a);
          path(c, [prev[0], cur[0], cur[1], prev[1]]);
          c.fill();
        }
        prev = cur;
      }
    });
  }
  // 6. Le reflet doré de la lisse au soleil : une lueur douce et continue
  // contre le flanc bleu, puis des touches couchées que les rides cassent
  if (lit > 0.2) {
    const kl = k * clamp(lit / 4);
    c.globalCompositeOperation = 'screen';
    const wg = Math.min(2 * o, 3 + 0.25 * 2 * o);
    for (let j = 1; j <= 6; j++) {
      const w = (wg * j) / 6;
      const g = c.createLinearGradient(0, yAt(480), 0, yAt(70));
      g.addColorStop(0, 'rgba(255,196,128,0)');
      g.addColorStop(0.6, `rgba(255,192,124,${(0.05 * kl).toFixed(3)})`);
      g.addColorStop(1, `rgba(255,186,118,${(0.085 * kl).toFixed(3)})`);
      c.fillStyle = g;
      const A = [], B = [];
      for (const Z of ZSTEPS) {
        A.push(pr(-o, -FB, Z));
        B.push(pr(-o + w * (0.75 + 0.25 * Math.sin(Z * 0.05 + j + T * 0.3)), -FB, Z));
      }
      path(c, A.concat(B.reverse()));
      c.fill();
    }
    c.globalCompositeOperation = 'source-over';
    for (const g of GOLD) {
      const Z = g.Z + 4 * Math.sin(T * 0.22 + g.ph);
      const near = clamp((300 - Z) / 220);
      const far = clamp((540 - Z) / 260);
      // l'éventail : serré contre le flanc au loin, plus large tout près
      const spread = 2 * o * lerp(0.12, 0.6, near);
      const X0 = -o + 0.4 + g.d * spread + 0.8 * Math.sin(T * 0.35 + g.ph2) * (0.3 + near);
      const L = g.L * (1.2 + 3.2 * near) * (0.6 + 0.4 * Math.min(1, o / 12));
      const X1 = Math.min(o - 0.5, X0 + L);
      if (X1 <= X0) continue;
      const tw = 0.55 + 0.45 * Math.sin(T * g.w * 1.6 + g.ph);
      const a = tw * far * kl * (0.35 + 0.45 * (1 - g.d)) * (g.cool ? 0.5 : 0.9);
      if (a < 0.03) continue;
      const p0 = pr(X0, -FB, Z), p1 = pr(X1, -FB, Z);
      // épaisseur : une touche couchée, aplatie par la perspective
      const th = Math.max(0.5, (F * (CH + FB) * 0.3 * g.th) / (Z * Z) * (0.8 + 0.5 * near));
      const amp = th * 0.8 * g.wav;
      const top = [], bot = [];
      for (let i = 0; i <= 8; i++) {
        const u = i / 8, x = lerp(p0[0], p1[0], u);
        const y = p0[1] + amp * Math.sin(u * 4.2 + g.ph + T * 0.9);
        const h = th * Math.pow(Math.sin(Math.PI * u), 0.7);
        top.push([x, y - h]);
        bot.push([x, y + h]);
      }
      c.fillStyle = g.cool ? `rgba(226,218,250,${(0.8 * a).toFixed(3)})` : `rgba(${244 + Math.round(10 * near)},${178 + Math.round(22 * near)},${104 + Math.round(30 * near)},${(0.85 * a).toFixed(3)})`;
      path(c, top.concat(bot.reverse()));
      c.fill();
    }
  }
  // 7. Grandes rides lentes : le ciel lavande glisse sur l'eau
  c.globalCompositeOperation = 'screen';
  for (let j = 0; j < 14; j++) {
    const Z = 70 * Math.pow(1.13, j) + 6 * Math.sin(T * 0.35 + j);
    if (Z > 560) break;
    const a = 0.08 * (0.5 + 0.5 * Math.sin(T * 0.8 + j * 1.9)) * k;
    const p0 = pr(-o, -FB, Z), p1 = pr(o, -FB, Z);
    const ry = Math.max(0.8, px(0.5, Z));
    const gr2 = c.createLinearGradient(p0[0], 0, p1[0], 0);
    gr2.addColorStop(0, 'rgba(210,200,240,0)');
    gr2.addColorStop(0.5, `rgba(210,200,240,${a.toFixed(3)})`);
    gr2.addColorStop(1, 'rgba(210,200,240,0)');
    c.fillStyle = gr2;
    c.beginPath();
    c.ellipse((p0[0] + p1[0]) / 2, p0[1], (p1[0] - p0[0]) / 2, ry, 0, 0, TAU);
    c.fill();
  }
  // 8. Un peu de brume qui glisse dans la fente, plus dense au loin
  for (const v of VEILS) {
    const Z = 90 + ((v.Z - 90 + T * v.sp) % 430);
    const p = pr(v.u * o * 0.8, -FB + 4, Z);
    const rx = px(2 * o * 0.9 * v.s + 8, Z), ry = rx * 0.16;
    const a = 0.2 * k * clamp((Z - 90) / 120) * clamp((520 - Z) / 80) * (0.7 + 0.3 * Math.sin(T * 0.5 + v.ph));
    if (a < 0.01) continue;
    const e = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], rx);
    e.addColorStop(0, `rgba(236,226,242,${a.toFixed(3)})`);
    e.addColorStop(1, 'rgba(236,226,242,0)');
    c.save();
    c.translate(p[0], p[1]);
    c.scale(1, ry / rx);
    c.translate(-p[0], -p[1]);
    c.fillStyle = e;
    c.fillRect(p[0] - rx, p[1] - rx, 2 * rx, 2 * rx);
    c.restore();
  }
  c.restore();
}

// Le flanc intérieur d'un ponton : le bout peint des planches, la lisse de
// bois brut, puis l'ombre sous le plancher jusqu'à l'eau
function flank(c, sd, o, T) {
  const blue = sd < 0, X = sd * o;
  const Q = (y0, y1) => [pr(X, y0, ZA), pr(X, y0, ZB), pr(X, y1, ZB), pr(X, y1, ZA)];
  c.globalCompositeOperation = 'source-over';
  // l'ombre sous le plancher
  c.fillStyle = blue ? '#2a2733' : '#1f1d27';
  path(c, Q(-BEAM, -FB - 0.3));
  c.fill();
  // la lisse, puis le bout peint des planches
  c.fillStyle = blue ? '#6e5a4a' : '#4b3b37';
  path(c, Q(-ENDS, -BEAM));
  c.fill();
  c.fillStyle = blue ? '#3e5878' : '#5c2c27';
  path(c, Q(0, -ENDS));
  c.fill();
  if (blue) {
    // le soleil passe au-dessus du ponton rouge et prend le haut du flanc
    const lit = Math.min(FB, 2 * o * SUN_XY);
    if (lit > 0.2) {
      c.fillStyle = '#a7b3c2';
      path(c, Q(0, -Math.min(lit, ENDS)));
      c.fill();
      if (lit > ENDS) {
        c.fillStyle = '#d1a066';
        path(c, Q(-ENDS, -Math.min(lit, BEAM)));
        c.fill();
      }
      c.globalCompositeOperation = 'screen';
      c.fillStyle = 'rgba(255,214,150,0.4)';
      path(c, Q(0, -Math.min(lit, 0.8)));
      c.fill();
    }
    // la lumière renvoyée par l'eau danse sous le plancher
    c.globalCompositeOperation = 'screen';
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      for (let i = 0; i <= 40; i++) {
        const Z = lerp(66, 420, i / 40);
        const Y = -FB + 0.8 + k * 0.8 + 0.35 * Math.sin(Z * 0.21 + T * (1.4 + 0.2 * k) + k);
        const p = pr(X, Y, Z);
        i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]);
      }
      c.strokeStyle = `rgba(255,214,160,${(0.16 * clamp(o / 6)).toFixed(3)})`;
      c.lineWidth = 1.6;
      c.stroke();
    }
  }
  // la ligne d'eau
  c.globalCompositeOperation = 'screen';
  c.beginPath();
  const a = pr(X, -FB, ZA), b = pr(X, -FB, ZB);
  c.moveTo(a[0], a[1]);
  c.lineTo(b[0], b[1]);
  c.strokeStyle = blue ? 'rgba(255,214,170,0.35)' : 'rgba(170,160,210,0.25)';
  c.lineWidth = 2;
  c.stroke();
}

/* --------------------------------------------------------------------------
   La lumière rasante sur les planches, puis les ombres portées (jambes et
   chaussures), coupées au bord des pontons
   -------------------------------------------------------------------------- */
function deckClip(c, o) {
  c.beginPath();
  for (const sd of [-1, 1]) {
    const xa = sd * o, xb = sd * (o + PW);
    const q = [pr(xa, 0, ZA), pr(xb, 0, ZA), pr(xb, 0, ZB), pr(xa, 0, ZB)];
    q.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
    c.closePath();
  }
  c.clip();
}

function sunOnDeck(c, o) {
  c.save();
  deckClip(c, o);
  c.globalCompositeOperation = 'soft-light';
  let gr = c.createLinearGradient(2200, -100, 700, 900);
  gr.addColorStop(0, 'rgba(255,200,140,0.6)');
  gr.addColorStop(0.45, 'rgba(255,196,134,0.3)');
  gr.addColorStop(1, 'rgba(255,190,120,0)');
  c.fillStyle = gr;
  c.fillRect(-400, -300, 2800, 1700);
  c.globalCompositeOperation = 'screen';
  gr = c.createLinearGradient(2100, 0, 300, 700);
  gr.addColorStop(0, 'rgba(255,206,150,0.22)');
  gr.addColorStop(0.6, 'rgba(255,200,140,0.06)');
  gr.addColorStop(1, 'rgba(255,200,140,0.03)');
  c.fillStyle = gr;
  c.fillRect(-400, -300, 2800, 1700);
  c.restore();
}

const onDeck = (X, Y, Z) => [X + SH[0] * KSH * Y, Z + SH[1] * KSH * Y];
// Coupe un polygone (X, Z) au-delà de Z ≥ zmin (Sutherland-Hodgman)
function clipZ(ps, zmin) {
  const out = [];
  for (let i = 0; i < ps.length; i++) {
    const a = ps[i], b = ps[(i + 1) % ps.length];
    const ia = a[1] >= zmin, ib = b[1] >= zmin;
    if (ia) out.push(a);
    if (ia !== ib) { const t = (zmin - a[1]) / (b[1] - a[1]); out.push([lerp(a[0], b[0], t), zmin]); }
  }
  return out;
}
function castShadows(c, o, legs) {
  c.save();
  deckClip(c, o);
  c.globalCompositeOperation = 'multiply';
  for (const L of legs) {
    const { f, dx, r, k } = L;
    const fr = frame(f, dx);
    const G = legGeom(f, r, dx);
    const A = onDeck(G.A[0], 8, G.A[2]);
    const H = onDeck(f.hipX, 88, f.Z + 3);
    const ax = [H[0] - A[0], H[1] - A[1]], m = Math.hypot(ax[0], ax[1]);
    const n = [-ax[1] / m, ax[0] / m];
    const pts = [];
    for (const s of [-1, 1]) {
      pts.push([A[0] + n[0] * r * s, A[1] + n[1] * r * s], [H[0] + n[0] * r * 1.1 * s, H[1] + n[1] * r * 1.1 * s]);
    }
    for (let v = -14; v <= 14.2; v += 2) {
      for (const uu of [tab(SLO, v), tab(SHI, v)]) {
        const w = fr(uu, v, 0);
        pts.push([w[0], w[2]]);
        pts.push(onDeck(w[0], SOLE + tab(SHT, v) * 0.8, w[2]));
      }
    }
    const h = hull(pts);
    const cx = h.reduce((s, p) => s + p[0], 0) / h.length, cz = h.reduce((s, p) => s + p[1], 0) / h.length;
    for (const [grow, al] of [[1.6, 0.18], [0.8, 0.22], [0, 0.32]]) {
      c.fillStyle = `rgba(118,106,160,${(al * k).toFixed(3)})`;
      const g = clipZ(h.map((p) => {
        const dxp = p[0] - cx, dzp = p[1] - cz, dm = Math.hypot(dxp, dzp) || 1;
        return [p[0] + (dxp / dm) * grow, p[1] + (dzp / dm) * grow];
      }), 30);
      if (g.length < 3) continue;
      path(c, g.map((p) => pr(p[0], 0, p[1])));
      c.fill();
    }
  }
  c.restore();
}

// Ombre de contact sous une chaussure : sombre et serrée, à sa vraie place
function contact(c, f, dx) {
  const fr = frame(f, dx);
  c.globalCompositeOperation = 'multiply';
  for (const [k, a] of [[1.22, 0.16], [1.1, 0.3], [1.03, 0.5], [0.99, 0.8]]) {
    const ring = soleRing(fr, 0, k).map((w) => pr(w[0], 0, w[2]));
    c.fillStyle = `rgba(40,30,52,${a})`;
    path(c, ring);
    c.fill();
  }
}

/* --------------------------------------------------------------------------
   L'air : contre-jour en haut à droite, voiles de brume, poussières dorées
   -------------------------------------------------------------------------- */
const MOTES = (() => {
  const r = rng(133), out = [];
  for (let i = 0; i < 46; i++) {
    out.push({ x: 1050 + 1000 * Math.pow(r(), 0.7), y: -120 + 640 * Math.pow(r(), 1.3), s: 0.8 + 2.2 * r(), sp: 0.2 + 0.5 * r(), ph: TAU * r() });
  }
  return out;
})();

function air(c, T) {
  c.globalCompositeOperation = 'screen';
  let gr = c.createRadialGradient(2150, -120, 40, 2150, -120, 1500);
  gr.addColorStop(0, 'rgba(255,204,140,0.5)');
  gr.addColorStop(0.35, 'rgba(255,190,130,0.18)');
  gr.addColorStop(1, 'rgba(255,190,130,0)');
  c.fillStyle = gr;
  c.fillRect(-300, -300, 2600, 1700);
  gr = c.createLinearGradient(0, -200, 0, 300);
  gr.addColorStop(0, 'rgba(244,210,184,0.24)');
  gr.addColorStop(1, 'rgba(244,210,184,0)');
  c.fillStyle = gr;
  c.fillRect(-300, -300, 2600, 640);
  // voiles de brume qui glissent au ras de l'eau, au loin
  for (let i = 0; i < 5; i++) {
    const x = ((i * 530 + T * (14 + 4 * i)) % 2600) - 300, y = -60 + 40 * i + 8 * Math.sin(T * 0.4 + i);
    const e = c.createRadialGradient(x, y, 10, x, y, 320);
    e.addColorStop(0, 'rgba(236,226,240,0.13)');
    e.addColorStop(1, 'rgba(236,226,240,0)');
    c.save();
    c.translate(x, y);
    c.scale(1, 0.22);
    c.translate(-x, -y);
    c.fillStyle = e;
    c.fillRect(x - 320, y - 320, 640, 640);
    c.restore();
  }
  // poussières et gouttelettes de brume dans le contre-jour
  for (const m of MOTES) {
    const x = m.x + 18 * Math.sin(T * m.sp + m.ph) - 6 * T;
    const y = m.y + 10 * Math.sin(T * m.sp * 0.8 + m.ph * 1.7) - 3 * T * m.sp;
    const tw = 0.5 + 0.5 * Math.sin(T * (0.8 + m.sp * 2) + m.ph * 3);
    const a = (0.25 + 0.75 * tw * tw) * clamp((x - 950) / 250);
    if (a < 0.02) continue;
    c.fillStyle = `rgba(255,226,180,${(0.16 * a).toFixed(3)})`;
    c.beginPath(); c.arc(x, y, m.s * 2.8, 0, TAU); c.fill();
    c.fillStyle = `rgba(255,246,224,${(0.6 * a).toFixed(3)})`;
    c.beginPath(); c.arc(x, y, m.s, 0, TAU); c.fill();
  }
}

/* --------------------------------------------------------------------------
   Le décor
   -------------------------------------------------------------------------- */
const DEF = { gap: 0, life: 1 };
// cisaillement « le ponton glisse de dx » sur le plan de hauteur Y0
const shearOf = (dx, Y0 = 0) => dx / (CH - Y0);
// Les chaussures : un cisaillement les ferait pencher (elles ont une
// hauteur, les planches non). Elles sont donc peintes à plusieurs écarts
// (tous les 3 cm de glissement, jusqu'à l'écart de la fin du plan) ; au
// rendu on prend la plus proche, et seul le reste (1,5 cm au plus) est
// cisaillé, à mi-hauteur de la chaussure : ni glissement ni penché visibles.
// Au-delà de 18 cm (gap > 0,6, hors du plan), la dernière est cisaillée.
const SHOE_DO = 3, SHOE_Y = 4;
const SHOE_STEPS = [0, 3, 6, 9, 12, 15, 18];
const shearClip = (dx, Y0, rect) => (c) => {
  const s = shearOf(dx, Y0);
  c.transform(1, 0, s, 1, -s * YH, 0);
  c.beginPath();
  c.rect(rect[0], rect[1], rect[2], rect[3]);
};
const LEFT = [-600, -800, 1560, 2400], RIGHT = [960, -800, 1600, 2400];

// Pose de la jambe : la cheville suit la chaussure, la hanche reste en place
function legPose(f, o, sway) {
  const G = legGeom(f, HERO_LEG.r);
  const P0 = G.ank;
  const tx = px(f.side * o, G.A[2]); // le vrai déplacement de la cheville
  const Hs = pr(f.hipX + sway, 88, f.Z + 3);
  const v0 = [Hs[0] - P0[0], Hs[1] - P0[1]];
  const v1 = [Hs[0] - P0[0] - tx, Hs[1] - P0[1]];
  const rot = Math.atan2(v1[1], v1[0]) - Math.atan2(v0[1], v0[0]);
  return { ox: P0[0], oy: P0[1], x: tx, y: 0, rot };
}

const BOX_B = [-260, -280, 1250, 1520], BOX_R = [930, -280, 1250, 1520];

export default {
  id: ID,
  bg: '#1a1d29',
  home: { x: 960, y: 500, z: 1 },
  layers: {
    fond: { box: [-240, -180, 2400, 1400], svg: fond(), filters: ['soft'], res: 0.6 },
    bleu: { box: BOX_B, svg: ponton(-1), filters: ['paint'] },
    rouge: { box: BOX_R, svg: ponton(1), filters: ['paint'] },
    ...Object.fromEntries(SHOE_STEPS.map((d, k) => [`chaussures${k}`,
      { box: [440, 260, 1040, 560], svg: FEET.map((f, i) => shoe(f, i, f.side * d, k)).join(''), filters: ['paint', 'soft'], res: 1.5 }])),
    jambes: { box: [560, -730, 800, 1460], svg: FEET.map((f, i) => trouser(f, HERO_LEG, `${ID}-j${i}`)).join(''), filters: ['paint'], res: 1.2 },
  },

  render(g, p, T) {
    const q = { ...DEF, ...p };
    const o = (GAPCM * Math.max(0, q.gap)) / 2;
    // un très léger transfert de poids d'un pied sur l'autre
    const sway = q.life ? 0.8 * Math.sin((T * TAU) / 5.2) : 0;

    // L'eau, le lac aux coins, et ce qui s'ouvre entre les pontons
    g.img('fond');
    g.fx(1, (c) => {
      lake(c, o, T);
      if (o > 0.15) {
        gapWater(c, o, T);
        flank(c, -1, o, T);
        flank(c, 1, o, T);
      }
    });

    // Les deux pontons, chacun glisse de son côté
    g.img('bleu', { clip: shearClip(-o, 0, [BOX_B[0] - 10, BOX_B[1] - 10, BOX_B[2] + 20, BOX_B[3] + 20]) });
    g.img('rouge', { clip: shearClip(o, 0, [BOX_R[0] - 10, BOX_R[1] - 10, BOX_R[2] + 20, BOX_R[3] + 20]) });

    // Le soleil rasant sur les planches, puis les ombres portées des jambes
    // et des chaussures (elles suivent chacune son ponton), puis les ombres
    // de contact
    g.fx(1, (c) => {
      sunOnDeck(c, o);
      castShadows(c, o, FEET.map((f) => ({ f, dx: f.side * o, r: HERO_LEG.r, k: 1 })));
    });
    g.fx(1, (c) => { for (const f of FEET) contact(c, f, f.side * o); });

    // Les chaussures, chacune avec son ponton
    // (la planche peinte la plus proche de l'écart voulu, cisaillée du reste)
    const k = Math.min(SHOE_STEPS.length - 1, Math.round(o / SHOE_DO));
    const rest = o - SHOE_STEPS[k];
    g.img(`chaussures${k}`, { clip: shearClip(-rest, SHOE_Y, LEFT) });
    g.img(`chaussures${k}`, { clip: shearClip(rest, SHOE_Y, RIGHT) });

    // Les jambes : la cheville suit le pied, la hanche ne bouge pas
    g.img('jambes', { tf: legPose(FEET[0], o, sway), clip: (c) => { c.beginPath(); c.rect(LEFT[0], LEFT[1], LEFT[2], LEFT[3]); } });
    g.img('jambes', { tf: legPose(FEET[1], o, sway), clip: (c) => { c.beginPath(); c.rect(RIGHT[0], RIGHT[1], RIGHT[2], RIGHT[3]); } });

    // Lumière d'aube : contre-jour en haut à droite, brume, poussières
    g.fx(1, (c) => air(c, T));

    // Densité, ombres lavande en bas à gauche, chaleur en haut à droite
    g.screen((c, W, H) => {
      c.globalCompositeOperation = 'soft-light';
      c.globalAlpha = 0.25;
      c.drawImage(c.canvas, 0, 0);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'multiply';
      let gr = c.createLinearGradient(0, H, W * 0.75, 0);
      gr.addColorStop(0, 'rgba(150,142,192,0.42)');
      gr.addColorStop(0.55, 'rgba(140,134,190,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'soft-light';
      gr = c.createRadialGradient(W, 0, 0, W, 0, W * 0.85);
      gr.addColorStop(0, 'rgba(255,200,140,0.45)');
      gr.addColorStop(1, 'rgba(255,200,140,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
    });
  },

  shots: {
    // Les pontons s'écartent sous les pieds ; la caméra recule un peu
    pieds: {
      dur: 6.5,
      cam: (t, portrait) => {
        const k = ease.inOut(clamp((t - 0.2) / 6.2)) * 0.8 + 0.2 * clamp(t / 6.5);
        return portrait
          ? { x: 960, y: lerp(486, 520, k), z: lerp(1.2, 0.74, k) }
          : { x: 960, y: lerp(560, 575, k), z: lerp(1.16, 0.96, k) };
      },
      p: (t) => ({ gap: 0.6 * seg(t, 0.5, 6.2), life: 1 }),
    },
  },
};
