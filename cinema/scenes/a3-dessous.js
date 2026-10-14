/* ==========================================================================
   Décor « a3-dessous » — Acte 3. Sous l'eau, sous le ponton bleu.

   On est descendu à quatre mètres sous la tête de la file, un peu avant le
   bout des deux pontons, et on lève franchement les yeux, la tête penchée
   comme un nageur qui flotte sur le dos. Toute la moitié haute de l'image
   est la surface vue d'en dessous : la « fenêtre » claire de l'eau (le
   cercle de ciel qu'on voit en levant la tête sous l'eau), ridée, avec le
   ciel de l'aube passé à travers, lavande à gauche, doré en haut à droite
   (le soleil se lève derrière la rive droite) ; au-delà de son bord, très
   fondu, la surface redevient miroir, vert sombre. Le réseau doux des
   caustiques (des cellules arrondies, en traits larges) ondule sur la
   partie claire seulement.

   En travers de ce plafond, en diagonale, le bout des deux pontons : bleu à
   gauche, rouge à droite. On voit leurs têtes peintes au-dessus de l'eau,
   puis leur dessous, une masse un peu floue à contre-jour qui file vers le
   bas à gauche et se fond dans le vert ; le dessous garde la couleur de
   chaque ponton (bleu passé, rouge passé), le jour passe entre les planches,
   les flotteurs sombres sont de longs blocs arrondis. Dans la fente d'eau
   libre, le ciel pêche et lavande, le flanc peint du bleu, et les jambes de
   la file à cheval sur les deux rives, sombres sur le clair, les semelles
   au bord de chaque ponton ; la première personne, tout au bout, se
   découpe sur la surface claire. De grands rayons descendent en biais de la
   surface dorée vers la gauche, d'autres, fins, tombent de la fente ; les
   pontons et le caisson font de l'ombre du côté gauche ; des particules
   flottent.

   Sous le ponton bleu, pendu à ses deux rangées de flotteurs par deux
   colliers sombres : le caisson. Une boîte gris mat (#5b6168), plate et
   large, cerclée d'un rebord, quatre vis, sobre ; sur sa face du dessous,
   un petit voyant ambré (le laiton du joueur) qui pulse lentement. Il fait
   une ombre douce sous le ponton ; la lumière danse sur son flanc droit,
   tourné vers le soleil, dont l'arête est chaude. Rien de menaçant : un
   objet calme, posé là, dont on comprend seulement qu'il est là.

   Tout est construit en mètres puis projeté : X de gauche à droite (0 au
   milieu de la fente), Y vers le haut (0 à la surface), Z vers le fond, le
   long des pontons (ils commencent à ZN devant nous). Calques : l'eau et
   la fenêtre de la surface (« fond »), les pontons et leurs flotteurs
   (« pontons »), le caisson et ses colliers (« caisson »). Caustiques,
   ciel de la fente, personnes, rayons, ombres, particules et voyant sont
   tracés à chaque image ; caustiques, personnes, rayons et ombres sont
   peints dans une petite image puis agrandis, pour des bords doux.

   Paramètres (p) :
     rays   0 → 1   intensité des rayons et des reflets (1 par défaut)
     lamp   0 → 1   le voyant est allumé (il pulse lentement, toutes les 3,4 s)

   Plan : « dessous » (6 s) : lente poussée vers le caisson (1 → 1,18), en
   flottant (léger balancement de nageur) ; le caisson glisse doucement du
   tiers gauche vers le centre de l'image.
   ========================================================================== */
import { rng, P } from '../kit.js';
import { TAU, clamp, lerp, ease } from '../../film/engine.js';

const ID = 'a3-dessous';
const DEG = Math.PI / 180;
const u = (n) => `${ID}-${n}`;
const url = (n) => `url(#${ID}-${n})`;
const f1 = (v) => +v.toFixed(1);
const f3 = (v) => +v.toFixed(3);
const pt = (p) => `${f1(p[0])},${f1(p[1])}`;
const pathOf = (ps) => `M${ps.map(pt).join(' L')} Z`;
const poly = (ps, a = '') => `<path d="${pathOf(ps)}" ${a}/>`;
const line = (a, b, a2 = '') => `<path d="M${pt(a)} L${pt(b)}" fill="none" ${a2}/>`;
const stops = (s) => s.map(([o, c, a = 1]) => `<stop offset="${f3(o)}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
const grad = (id, a, b, s) =>
  `<linearGradient id="${u(id)}" gradientUnits="userSpaceOnUse" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}">${stops(s)}</linearGradient>`;
const radial = (id, c, r, s, sy = 1) =>
  `<radialGradient id="${u(id)}" gradientUnits="userSpaceOnUse" cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r)}"` +
  (sy !== 1 ? ` gradientTransform="translate(0 ${f1(c[1] * (1 - sy))}) scale(1 ${sy})"` : '') + `>${stops(s)}</radialGradient>`;
const blurF = (id, s) => `<filter id="${u(id)}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
// Lavis : grain de papier très léger dans la couleur
const lavis = (id, freq, amp, seed) =>
  `<filter id="${u(id)}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 1" result="g"/>` +
  `<feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="${amp}" k2="${1 - amp / 2}" k3="0" k4="0" result="m"/>` +
  `<feComposite in="m" in2="SourceGraphic" operator="in"/></filter>`;

// Couleurs : mélange de deux teintes hexadécimales
const rgbOf = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) => '#' + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mixc = (a, b, k) => { const A = rgbOf(a), B = rgbOf(b); return hex(A.map((v, i) => lerp(v, B[i], clamp(k)))); };
const rgba = (rgb, a) => `rgba(${rgb},${f3(clamp(a))})`;

// Enveloppe convexe de points de l'écran (pour la silhouette d'un bloc)
function hull(ps) {
  const p = [...ps].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}

/* --------------------------------------------------------------------------
   Perspective : caméra à 4,2 m sous la surface, un peu en retrait du bout
   des pontons ; le regard levé de 55° (la surface est au-dessus de nous), et
   la tête penchée de 30°, comme un nageur qui flotte sur le dos : les
   pontons partent en diagonale vers le bas à gauche, le bleu à gauche, le
   rouge à droite ; la lumière est en haut à droite.
   -------------------------------------------------------------------------- */
const F = 860, CAM = [0.6, -4.2], YAW = 0 * DEG, PITCH = 55 * DEG, ROLL = -30 * DEG;
const cyw = Math.cos(YAW), syw = Math.sin(YAW), cp = Math.cos(PITCH), sp = Math.sin(PITCH);
const crl = Math.cos(ROLL), srl = Math.sin(ROLL);
function cam3(X, Y, Z) {
  const dx = X - CAM[0], dy = Y - CAM[1];
  const xc = dx * cyw - Z * syw, z1 = dx * syw + Z * cyw;
  const yc = dy * cp - z1 * sp;
  return [xc * crl - yc * srl, xc * srl + yc * crl, dy * sp + z1 * cp];
}
const pr = (X, Y, Z) => { const [x, y, z] = cam3(X, Y, Z); return [960 + (F * x) / z, 540 - (F * y) / z]; };
const scl = (X, Y, Z) => F / cam3(X, Y, Z)[2];                  // pixels par mètre à cet endroit
const dist = (X, Y, Z) => Math.hypot(X - CAM[0], Y - CAM[1], Z);
// Une direction (et non un point) : où elle « tombe » à l'écran
function dirPr(dX, dY, dZ) {
  const xc = dX * cyw - dZ * syw, z1 = dX * syw + dZ * cyw;
  const yc = dY * cp - z1 * sp, z = Math.max(0.012, dY * sp + z1 * cp);
  const x = xc * crl - yc * srl, y = xc * srl + yc * crl;
  return [clamp(960 + (F * x) / z, -30000, 30000), clamp(540 - (F * y) / z, -30000, 30000)];
}
// Retour de la caméra au monde (pour semer les particules dans le champ)
function world(xs, ys, zc) {
  const xc = xs * crl + ys * srl, yc = -xs * srl + ys * crl;
  const dy = yc * cp + zc * sp, z1 = -yc * sp + zc * cp;
  return [CAM[0] + xc * cyw + z1 * syw, CAM[1] + dy, -xc * syw + z1 * cyw];
}
// Angle depuis la verticale, vu de la caméra, d'un point de la surface
const zenAng = (X, Z) => Math.atan2(Math.hypot(X - CAM[0], Z), -CAM[1]);

// La fenêtre de la surface : sous l'eau, le ciel tient dans un cône de
// 48,6° autour de la verticale ; au-delà, la surface est un miroir
const WIN = 48.6 * DEG;
const ring = (th, n = 96) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * TAU;
  return dirPr(Math.sin(th) * Math.cos(a), Math.cos(th), Math.sin(th) * Math.sin(a));
});
// Le soleil, passé à travers la surface : au bord droit de la fenêtre
const SUN = dirPr(Math.sin(34 * DEG) * Math.cos(-32 * DEG), Math.cos(34 * DEG), Math.sin(34 * DEG) * Math.sin(-32 * DEG));

const G = 0.62;            // la fente entre les pontons (ils viennent de s'écarter)
const WP = 2.3;            // largeur d'un ponton
const FB = 0.36;           // les flotteurs plongent de 36 cm
const HB = 0.4;            // le pont est à 40 cm au-dessus de l'eau
const ZN = 2.6, ZF = 60;   // les pontons commencent juste devant nous et filent au fond
const BL = [-G / 2 - WP, -G / 2], RD = [G / 2, G / 2 + WP];

// Le brouillard de l'eau : clair sur les premiers mètres, puis il mange
// vite tout ce qui est au-delà de 8 m
const FOG = '#2f6660';
const fogK = (d) => clamp(1 - Math.exp(-Math.max(0, d - 4.5) / 5 - (Math.max(0, d - 6.5) / 2) ** 2));
const fog = (c, d, k = 1) => mixc(c, FOG, fogK(d) * k);

// Les flotteurs : deux rangées par ponton, en retrait des bords (le bord du
// pont fait la silhouette), longs blocs de 3 m espacés de 50 cm
const ROWS = [
  [BL[0] + 0.5, BL[0] + 0.98, 'b'], [BL[1] - 0.98, BL[1] - 0.5, 'b'],
  [RD[0] + 0.5, RD[0] + 0.98, 'r'], [RD[1] - 0.98, RD[1] - 0.5, 'r'],
];
const FLOATS = (() => {
  const out = [];
  for (const [x0, x1, s] of ROWS) {
    for (let z = ZN + 0.1; z < 30; z += 3.5) out.push({ x0, x1, z0: z, z1: z + 3, s, d: dist((x0 + x1) / 2, -FB / 2, z + 1.5) });
  }
  return out.sort((a, b) => b.d - a.d); // du fond vers nous
})();

// Le caisson : plat et large, sous le ponton bleu, à cheval sur ses deux
// rangées de flotteurs ; on voit son dessous, sa face avant et son flanc droit
const BOX = { x0: -2.1, x1: -0.95, y0: -0.86, y1: -0.6, z0: ZN + 0.35, z1: ZN + 1.0 };
const BANDS = [BOX.z0 + 0.14, BOX.z1 - 0.14];           // les deux colliers
const LAMP = [BOX.x1 - 0.13, BOX.y0, BOX.z0 + 0.12];      // le voyant, sous le caisson, côté droit

// Les personnes de la file, à cheval sur la fente ; la première tout au bout
const FILE = (() => {
  const r = rng(31);
  const out = [{ z: ZN + 0.12, h: 1.0, ph: 0.4, c: '#3b3631' }];
  const cols = ['#45403a', '#3a3d3a', '#4a3d40', '#433a31', '#3d3a36'];
  for (let z = ZN + 1.5, i = 0; z < 14; z += 1.6 + r() * 0.6, i++) out.push({ z, h: 0.92 + r() * 0.2, ph: r() * TAU, c: cols[i % cols.length] });
  return out;
})();

// Particules en suspension, semées dans le champ de la caméra (graine fixe)
const MOTES = (() => {
  const r = rng(77);
  const out = [];
  while (out.length < 240) {
    const zc = 0.9 + Math.pow(r(), 1.5) * 14;
    const w = world((r() - 0.5) * 2.3 * zc, (r() - 0.5) * 1.3 * zc, zc);
    if (w[1] > -0.25) continue; // sous la surface seulement
    out.push({ w, near: zc < 1.9, ph: r() * TAU, sp: 0.6 + r() * 0.8, s: 0.6 + r() * 1.2, warm: r() < 0.25 });
  }
  return out;
})();

// Les rayons : la lumière vient de la droite et descend vers la gauche
const SUNDIR = [-0.55, -1, 0.12];
const RAYS = (() => {
  const r = rng(53);
  const out = [];
  // devant le bout des pontons : la grande eau libre au-dessus de nous
  for (let i = 0; i < 9; i++) { const X = -3.5 + i * 1.0 + r() * 0.6; out.push({ X, Z: 0.8 + r() * 1.6, w: 0.1 + r() * 0.14, ph: r() * TAU, sp: 0.22 + r() * 0.3, a: 0.5 + r() * 0.4, warm: X > 0.5 }); }
  // à droite du ponton rouge, du côté du soleil
  for (let i = 0; i < 8; i++) out.push({ X: RD[1] + 0.3 + r() * 3.2, Z: ZN + r() * 9, w: 0.14 + r() * 0.18, ph: r() * TAU, sp: 0.2 + r() * 0.3, a: 0.6 + r() * 0.4, warm: true });
  // la fente : des lames fines
  for (let i = 0; i < 7; i++) out.push({ X: (r() - 0.5) * G * 0.6, Z: ZN + 0.4 + i * 1.1 + r() * 0.5, w: 0.07 + r() * 0.06, ph: r() * TAU, sp: 0.25 + r() * 0.35, a: 1.1 + r() * 0.3, warm: false, gap: true });
  // à gauche du ponton bleu, plus froids
  for (let i = 0; i < 5; i++) out.push({ X: BL[0] - 0.3 - r() * 2.6, Z: ZN + r() * 8, w: 0.1 + r() * 0.14, ph: r() * TAU, sp: 0.2 + r() * 0.3, a: 0.4 + r() * 0.3, warm: false });
  return out.map((o) => ({ ...o, d: dist(o.X, -2, o.Z) })).sort((a, b) => b.d - a.d);
})();

// Le réseau des caustiques : une grille de germes un peu dérangée, posée
// sur la surface ; à chaque image, chaque germe bouge et l'on trace sa cellule
// (ce qui est plus près de lui que de ses voisins), arrondie
const CS = 0.62, CI = 15, CJ = 24;
const SEEDS = (() => {
  const r = rng(91);
  const out = [];
  for (let j = 0; j < CJ; j++) {
    const row = [];
    for (let i = 0; i < 2 * CI + 1; i++) row.push({ X: CAM[0] + (i - CI + (j % 2) * 0.5) * CS + (r() - 0.5) * 0.6 * CS, Z: -1.2 + j * CS * 0.87 + (r() - 0.5) * 0.6 * CS, ph: r() * TAU, ph2: r() * TAU });
    out.push(row);
  }
  return out;
})();

// Dégradé le long d'un ponton : la couleur à chaque profondeur, voilée par l'eau
function along(id, X, Y, col, k = 1, zs = [ZN, 2.5, 4, 6, 8, 11, 15, 22, 34, ZF]) {
  const a = pr(X, Y, zs[0]), b = pr(X, Y, zs[zs.length - 1]);
  const L2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
  const st = zs.map((Z) => {
    const p = pr(X, Y, Z);
    return [clamp(((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / L2), fog(col, dist(X, Y, Z), k)];
  });
  return grad(id, a, b, st);
}

/* --------------------------------------------------------------------------
   Calque « fond » : l'eau, le miroir de la surface et sa fenêtre claire
   -------------------------------------------------------------------------- */
// Les anneaux de la fenêtre, du bord vers le centre : plus clair vers la verticale
const WBANDS = [[64, '#2d6660'], [58, '#3c776d'], [54, '#55907f'], [50.5, '#76aa97'], [48, '#96c2ad'], [46, '#accfba'], [44, '#bcd9c3'], [39, '#cde3cb'], [32, '#dbead2'], [24, '#e5efd8'], [14, '#ecf2dd']];

function fond() {
  const r = rng(11);
  const rim = ring(WIN);
  const bot = dirPr(0, Math.cos(WIN), Math.sin(WIN));        // le bas du cercle, à l'écran
  let s = `<defs>
    ${grad('miroir', [0, bot[1] - 60], [0, 1220], [[0, '#3f7a70'], [0.3, '#2c625c'], [0.65, '#1b4645'], [1, '#0d272b']])}
    ${radial('soleil', SUN, 1350, [[0, '#ffe0a0', 1], [0.25, '#fad095', 0.8], [0.55, '#f2c9a8', 0.35], [1, '#f2c9a8', 0]], 0.8)}
    ${radial('lavande', [700, 40], 800, [[0, '#c3bed8', 0.55], [0.6, '#b9b4cf', 0.2], [1, '#b9b4cf', 0]], 0.7)}
    ${blurF('f8', 8)}${blurF('f22', 22)}${blurF('f40', 40)}
    <clipPath id="${u('win')}"><path d="${pathOf(rim)}"/></clipPath>
    ${lavis('lavis', 0.012, 0.16, 7)}
  </defs>`;
  s += `<g filter="${url('lavis')}">`;
  // au-delà de la fenêtre, la surface est un miroir des profondeurs
  s += `<rect x="-240" y="-140" width="2400" height="1360" fill="${url('miroir')}"/>`;
  // la fenêtre, anneau par anneau, fondue
  s += `<g filter="${url('f40')}">`;
  for (const [a, c] of WBANDS) s += poly(ring(a * DEG), `fill="${c}"`);
  s += '</g>';
  // le ciel de l'aube à travers la surface : lavande à gauche, or à droite
  s += `<g clip-path="${url('win')}">`;
  s += `<rect x="-240" y="-140" width="2400" height="1360" fill="${url('lavande')}"/>`;
  s += `<rect x="-240" y="-140" width="2400" height="1360" fill="${url('soleil')}"/>`;
  // de grandes ondulations de la surface (projetées : elles s'aplatissent au loin)
  for (let i = 0; i < 30; i++) {
    const X = -6 + r() * 11, Z = -0.4 + r() * 4.5, rx = 0.5 + r() * 1.1, rz = 0.18 + r() * 0.3, a0 = (r() - 0.5) * 0.8;
    if (zenAng(X, Z) > WIN) continue;
    const ps = Array.from({ length: 14 }, (_, k) => {
      const a = (k / 14) * TAU, ca = Math.cos(a) * rx, sa = Math.sin(a) * rz;
      return pr(X + ca * Math.cos(a0) - sa * Math.sin(a0), 0, Z + ca * Math.sin(a0) + sa * Math.cos(a0));
    });
    s += poly(ps, `fill="${r() < 0.55 ? '#fbf6e0' : '#79a996'}" opacity="${f1(0.08 + r() * 0.1)}" filter="${url('f8')}"`);
  }
  s += '</g>';
  s += '</g>';
  // le liseré lumineux au bord de la fenêtre
  s += `<path d="${pathOf(rim)}" fill="none" stroke="#f3f0d4" stroke-width="16" opacity="0.16" filter="${url('f8')}"/>`;
  s += `<path d="${pathOf(rim)}" fill="none" stroke="#fbf3d6" stroke-width="4" opacity="0.12" filter="${url('f8')}"/>`;
  // grandes respirations de l'eau profonde, sous la fenêtre
  for (let i = 0; i < 12; i++) {
    const x = -200 + r() * 2300, y = bot[1] + 60 + r() * 420;
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(160 + r() * 260)}" ry="${f1(50 + r() * 100)}" fill="${r() < 0.45 ? '#4f8a7c' : '#0f2c30'}" opacity="${f1(0.12 + r() * 0.12)}" filter="${url('f40')}"/>`;
  }
  return s;
}

/* --------------------------------------------------------------------------
   Calque « pontons » : têtes peintes au-dessus de l'eau, dessous des planches,
   bordures de bois, flanc du rouge dans la fente, flotteurs
   -------------------------------------------------------------------------- */
// Un flotteur : sa silhouette (enveloppe des huit coins), arrondie par un
// trait épais de la même couleur, puis son dessous un peu plus clair
function float(f) {
  const { x0, x1, z0, z1 } = f;
  const blue = f.s === 'b';
  const d = f.d, dn = dist((x0 + x1) / 2, -FB, z0);
  const corners = [];
  for (const X of [x0, x1]) for (const Y of [0, -FB]) for (const Z of [z0, z1]) corners.push(pr(X, Y, Z));
  const base = blue ? '#2c4058' : '#66322a';      // à contre-jour : presque des silhouettes, teintées
  const c0 = fog(base, d), c1 = fog(mixc(base, blue ? '#3a5470' : '#6a3a31', 0.5), d);
  const w = f1(Math.max(1, 0.16 * scl(x0, -FB, z0)));
  let s = poly(hull(corners), `fill="${c0}" stroke="${c0}" stroke-width="${w}" stroke-linejoin="round"`);
  const e = 0.08;
  // l'arête du bout, tournée vers nous, attrape la lumière
  s += line(pr(x0 + e, -FB, z0), pr(x1 - e, -FB, z0), `stroke="${fog('#9fbfae', dn, 0.8)}" stroke-width="${f1(Math.max(1, 0.025 * scl(x0, -FB, z0)))}" stroke-linecap="round" opacity="0.35"`);
  return s;
}

function pontons() {
  let s = `<defs>${lavis('lavis2', 0.03, 0.2, 21)}
    ${along('dess-b', (BL[0] + BL[1]) / 2, 0, mixc('#3c5675', '#5d7fa6', 0.3), 0.85)}
    ${along('dess-r', (RD[0] + RD[1]) / 2, 0, mixc('#7e3529', '#b5523f', 0.35), 0.85)}
    ${along('flanc-b', BL[1], HB / 2, '#6f91b8', 0.9)}
    ${grad('tete-b', pr(BL[0], 0, ZN), pr(BL[0], HB, ZN), [[0, '#3c5675'], [0.35, '#5d7fa6'], [1, '#8fb0d1']])}
    ${grad('tete-r', pr(RD[0], 0, ZN), pr(RD[0], HB, ZN), [[0, '#7e3529'], [0.35, '#b5523f'], [1, '#d9826b']])}
    ${blurF('o10', 10)}
  </defs>`;
  s += `<g filter="${url('lavis2')}">`;
  // le dessous des planches, dans l'ombre des pontons : bleu passé, rouge passé
  s += poly([pr(BL[0], 0, ZN), pr(BL[1], 0, ZN), pr(BL[1], 0, ZF), pr(BL[0], 0, ZF)], `fill="${url('dess-b')}"`);
  s += poly([pr(RD[0], 0, ZN), pr(RD[1], 0, ZN), pr(RD[1], 0, ZF), pr(RD[0], 0, ZF)], `fill="${url('dess-r')}"`);
  // un peu de lumière remonte sous le bord des pontons, côté soleil
  s += poly([pr(RD[1] - 0.5, 0, ZN), pr(RD[1], 0, ZN), pr(RD[1], 0, ZN + 4), pr(RD[1] - 0.5, 0, ZN + 4)], `fill="#e0a07a" opacity="0.16" filter="${url('o10')}"`);
  s += poly([pr(BL[1] - 0.35, 0, ZN), pr(BL[1], 0, ZN), pr(BL[1], 0, ZN + 4), pr(BL[1] - 0.35, 0, ZN + 4)], `fill="#9ab8d6" opacity="0.18" filter="${url('o10')}"`);
  // le jour passe entre les planches : de fins filets clairs, en travers
  for (const [X0, X1] of [BL, RD]) {
    for (let z = ZN + 0.16; z < ZN + 8; z += 0.3) {
      const d = dist((X0 + X1) / 2, 0, z), al = 0.2 * (1 - fogK(d));
      if (al < 0.03) break;
      s += line(pr(X0 + 0.08, 0, z), pr(X1 - 0.08, 0, z), `stroke="#dfe9cc" stroke-width="${f1(Math.max(0.6, 0.014 * scl(X0, 0, z)))}" opacity="${f3(al)}"`);
    }
  }
  // les traverses, sous les planches
  for (const [X0, X1, c] of [[BL[0], BL[1], '#22324a'], [RD[0], RD[1], '#4a2722']]) {
    for (let z = ZN + 0.9; z < 26; z += 2.4) {
      s += line(pr(X0 + 0.05, 0, z), pr(X1 - 0.05, 0, z), `stroke="${fog(c, dist((X0 + X1) / 2, 0, z), 0.85)}" stroke-width="${f1(Math.max(0.6, 0.09 * scl(X0, 0, z)))}" opacity="0.55"`);
    }
  }
  // le flanc peint du ponton bleu, au-dessus de l'eau, vu par la fente
  s += poly([pr(BL[1], 0, ZN), pr(BL[1], 0, ZF), pr(BL[1], HB, ZF), pr(BL[1], HB, ZN)], `fill="${url('flanc-b')}"`);
  // les bordures de bois brut, le long des bords
  for (const X of [BL[0], BL[1], RD[0], RD[1]]) {
    const ps = [ZN, 3, 6, 10, 16, 26].map((Z) => pr(X, 0.02, Z));
    for (let i = 1; i < ps.length; i++) {
      const Z = [ZN, 3, 6, 10, 16, 26][i];
      s += line(ps[i - 1], ps[i], `stroke="${fog('#8a6a4c', dist(X, 0, Z), 0.9)}" stroke-width="${f1(Math.max(0.8, 0.06 * scl(X, 0, Z)))}" stroke-linecap="round" opacity="0.8"`);
    }
  }
  // les têtes des pontons, au-dessus de l'eau, vues à travers la surface
  const dt = dist(0, HB / 2, ZN);
  for (const [X0, X1, id, lite] of [[BL[0], BL[1], 'tete-b', '#8fb0d1'], [RD[0], RD[1], 'tete-r', '#d9826b']]) {
    s += poly([pr(X0, 0, ZN), pr(X1, 0, ZN), pr(X1, HB, ZN), pr(X0, HB, ZN)], `fill="${url(id)}" opacity="0.92"`);
    // les planches, en lames horizontales
    for (let k = 1; k < 4; k++) s += line(pr(X0, (HB * k) / 4, ZN), pr(X1, (HB * k) / 4, ZN), `stroke="${fog(mixc(lite, '#1d2a35', 0.55), dt, 0.4)}" stroke-width="1.4" opacity="0.45"`);
    // la bordure de bois sur le dessus
    s += poly([pr(X0, HB - 0.06, ZN), pr(X1, HB - 0.06, ZN), pr(X1, HB, ZN), pr(X0, HB, ZN)], `fill="#8a6a4c" opacity="0.85"`);
    // la ligne d'eau, claire
    s += line(pr(X0, 0.01, ZN), pr(X1, 0.01, ZN), `stroke="#eef4dc" stroke-width="3" opacity="0.5"`);
  }
  s += '</g>';
  for (const f of FLOATS) s += float(f);
  return s;
}

/* --------------------------------------------------------------------------
   Calque « caisson » : la boîte gris mat, cerclée, ses deux colliers et
   l'ombre qu'elle fait sous le ponton
   -------------------------------------------------------------------------- */
const { x0: BX0, x1: BX1, y0: BY0, y1: BY1, z0: BZ0, z1: BZ1 } = BOX;
const FO = ROWS[0], FI = ROWS[1];                     // les deux rangées de flotteurs du bleu
const CBOX = (() => {
  const ps = [];
  for (const X of [FO[0] - 0.3, FI[1] + 0.3]) for (const Y of [BY0 - 0.05, 0.05]) for (const Z of [BZ0 - 0.3, BZ1 + 0.3]) ps.push(pr(X, Y, Z));
  const xs = ps.map((p) => p[0]), ys = ps.map((p) => p[1]);
  const x = Math.floor(Math.min(...xs) - 40), y = Math.floor(Math.min(...ys) - 40);
  return [x, y, Math.ceil(Math.max(...xs) + 40 - x), Math.ceil(Math.max(...ys) + 40 - y)];
})();

function caisson() {
  const grey = '#5b6168';
  const dF = dist(BX1, BY0, BZ0), dB = dist(BX0, BY0, BZ1);
  const k = 0.35; // le caisson est assez près : l'eau ne le voile qu'un peu
  const bottom = [pr(BX0, BY0, BZ0), pr(BX1, BY0, BZ0), pr(BX1, BY0, BZ1), pr(BX0, BY0, BZ1)];
  const front = [pr(BX0, BY1, BZ0), pr(BX1, BY1, BZ0), pr(BX1, BY0, BZ0), pr(BX0, BY0, BZ0)];
  const side = [pr(BX1, BY1, BZ0), pr(BX1, BY1, BZ1), pr(BX1, BY0, BZ1), pr(BX1, BY0, BZ0)];
  let s = `<defs>
    ${grad('dessous', pr(BX0, BY0, BZ0), pr(BX1, BY0, BZ1), [[0, fog(mixc(grey, '#3e4a4c', 0.35), dF, k)], [0.7, fog(mixc(grey, '#56645f', 0.2), dF, k)], [1, fog(mixc(grey, '#7d7a6c', 0.3), dB, k)]])}
    ${grad('face', pr(BX0, BY1, BZ0), pr(BX0, BY0, BZ0), [[0, fog(mixc(grey, '#2c3438', 0.4), dF, k)], [1, fog(mixc(grey, '#4a5456', 0.25), dF, k)]])}
    ${grad('flanc', pr(BX1, BY1, BZ0), pr(BX1, BY0, BZ1), [[0, fog(mixc(grey, '#c9a77e', 0.35), dF, k)], [1, fog(mixc(grey, '#8f8a78', 0.3), dB, k)]])}
    ${blurF('c10', 18)}${blurF('c4', 4)}
  </defs>`;
  // l'ombre du caisson sous le ponton : il coupe la lumière qui remonte
  const ao = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * TAU;
    return pr((BX0 + BX1) / 2 - 0.08 + Math.cos(a) * 0.85, -FB - 0.01, (BZ0 + BZ1) / 2 + Math.sin(a) * 0.62);
  });
  s += poly(ao, `fill="#0c1418" opacity="0.3" filter="${url('c10')}"`);
  s += poly(bottom, `fill="${url('dessous')}" stroke="${fog(grey, dF, k)}" stroke-width="2" stroke-linejoin="round"`);
  s += poly(front, `fill="${url('face')}"`);
  s += poly(side, `fill="${url('flanc')}"`);
  // le rebord qui cercle le dessous (un cadre en léger relief)
  const ins = (e) => [pr(BX0 + e, BY0, BZ0 + e), pr(BX1 - e, BY0, BZ0 + e), pr(BX1 - e, BY0, BZ1 - e), pr(BX0 + e, BY0, BZ1 - e)];
  s += `<path d="${pathOf(ins(0.02))}" fill="none" stroke="${fog('#9aa6a2', dF, k)}" stroke-width="3" stroke-linejoin="round" opacity="0.7"/>`;
  s += `<path d="${pathOf(ins(0.06))}" fill="none" stroke="${fog('#343c40', dF, k)}" stroke-width="2.2" stroke-linejoin="round" opacity="0.7"/>`;
  s += `<path d="${pathOf(ins(0.068))}" fill="none" stroke="${fog('#7e8b88', dF, k)}" stroke-width="1" stroke-linejoin="round" opacity="0.5"/>`;
  // arêtes : celle de droite, côté soleil, prend une lumière chaude
  s += line(pr(BX1, BY0, BZ0), pr(BX1, BY0, BZ1), `stroke="#efc996" stroke-width="2.6" stroke-linecap="round" opacity="0.75"`);
  s += line(pr(BX1, BY1, BZ0), pr(BX1, BY0, BZ0), `stroke="#d8b88c" stroke-width="1.8" stroke-linecap="round" opacity="0.55"`);
  s += line(pr(BX0, BY0, BZ0), pr(BX1, BY0, BZ0), `stroke="#8d9a96" stroke-width="1.8" stroke-linecap="round" opacity="0.6"`);
  // quatre vis aux coins du dessous
  for (const [X, Z] of [[BX0 + 0.04, BZ0 + 0.04], [BX1 - 0.04, BZ0 + 0.04], [BX0 + 0.04, BZ1 - 0.04], [BX1 - 0.04, BZ1 - 0.04]]) {
    const p = pr(X, BY0, Z);
    s += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="3.2" fill="#363e42"/><circle cx="${f1(p[0] - 0.7)}" cy="${f1(p[1] - 0.8)}" r="1.3" fill="#a3aea9" opacity="0.6"/>`;
  }
  // les deux colliers : sous le caisson, puis sous les deux flotteurs qu'il
  // relie, et le long du flanc du flotteur intérieur jusqu'à la surface
  for (const Z of BANDS) {
    const w = 0.035, e = 0.008;
    const dz = dist(BX1, BY0, Z);
    const band = fog('#262c30', dz, k), edge = fog('#7d8a86', dz, k);
    s += poly([pr(BX0 - e, BY0 - e, Z - w), pr(BX1 + e, BY0 - e, Z - w), pr(BX1 + e, BY0 - e, Z + w), pr(BX0 - e, BY0 - e, Z + w)], `fill="${band}"`);
    s += poly([pr(BX1 + e, BY1, Z - w), pr(BX1 + e, BY1, Z + w), pr(BX1 + e, BY0 - e, Z + w), pr(BX1 + e, BY0 - e, Z - w)], `fill="${band}"`);
    s += poly([pr(FO[0] - e, -FB - e, Z - w), pr(BX0, -FB - e, Z - w), pr(BX0, -FB - e, Z + w), pr(FO[0] - e, -FB - e, Z + w)], `fill="${band}"`);
    s += poly([pr(BX1, -FB - e, Z - w), pr(FI[1] + e, -FB - e, Z - w), pr(FI[1] + e, -FB - e, Z + w), pr(BX1, -FB - e, Z + w)], `fill="${band}"`);
    // de petits montants entre le caisson et les flotteurs
    for (const X of [BX0 + 0.03, BX1 + e]) s += poly([pr(X, BY1, Z - w), pr(X, BY1, Z + w), pr(X, -FB, Z + w), pr(X, -FB, Z - w)], `fill="${band}" stroke="${band}" stroke-width="1.5"`);
    s += line(pr(BX0, BY0 - e, Z - w), pr(BX1, BY0 - e, Z - w), `stroke="${edge}" stroke-width="1.2" opacity="0.6"`);
    const b = pr(BX1 + 0.01, (BY0 + BY1) / 2, Z);
    s += `<circle cx="${f1(b[0])}" cy="${f1(b[1])}" r="2.6" fill="#2a3034"/>`;
  }
  // le logement du voyant : une petite collerette sombre
  const l = pr(...LAMP), rr = 0.032 * scl(...LAMP);
  s += `<circle cx="${f1(l[0])}" cy="${f1(l[1])}" r="${f1(rr * 1.45)}" fill="#353d41"/>`;
  s += `<circle cx="${f1(l[0])}" cy="${f1(l[1])}" r="${f1(rr * 1.45)}" fill="none" stroke="#9aa6a2" stroke-width="1" opacity="0.6"/>`;
  s += `<circle cx="${f1(l[0])}" cy="${f1(l[1])}" r="${f1(rr * 0.85)}" fill="${P.brassDark}"/>`;
  // quelques algues fines sur l'arête de devant : il est là depuis un moment
  const r = rng(5);
  for (let i = 0; i < 9; i++) {
    const a = pr(lerp(BX0 + 0.05, BX1 - 0.05, r()), BY0, BZ0);
    const len = 8 + r() * 14;
    s += `<path d="M${pt(a)} q ${f1((r() - 0.5) * 7)} ${f1(len * 0.6)} ${f1((r() - 0.5) * 9)} ${f1(len)}" stroke="#55724f" stroke-width="1.8" stroke-linecap="round" opacity="0.5" fill="none"/>`;
  }
  return s;
}

/* --------------------------------------------------------------------------
   Effets procéduraux
   -------------------------------------------------------------------------- */
const path = (c, ps) => { c.beginPath(); ps.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); };

// Dessin flou : on peint dans une petite image du décor (k = résolution),
// puis on l'agrandit, ce qui adoucit tous les bords
const OFF = {};
function soft(c, k, fn, op = 'screen', alpha = 1) {
  const W = Math.round(2400 * k), H = Math.round(1360 * k);
  let o = OFF[k];
  if (!o) { o = OFF[k] = document.createElement('canvas'); o.width = W; o.height = H; }
  const x = o.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = 'source-over';
  x.globalAlpha = 1;
  x.clearRect(0, 0, W, H);
  x.setTransform(k, 0, 0, k, 240 * k, 140 * k);
  fn(x);
  c.save();
  c.globalCompositeOperation = op;
  c.globalAlpha = alpha;
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high';
  c.drawImage(o, -240, -140, 2400, 1360);
  c.restore();
}

// Les caustiques : le réseau des cellules arrondies qui ondulent lentement,
// en traits larges et doux, seulement sur la surface claire (la fenêtre)
function caustics(c, T, k) {
  c.lineCap = 'round';
  c.lineJoin = 'round';
  const pos = (m) => [m.X + 0.13 * CS * Math.sin(T * 0.33 + m.ph), m.Z + 0.13 * CS * Math.sin(T * 0.27 + m.ph2)];
  const P2 = SEEDS.map((row) => row.map(pos));
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  for (let j = 1; j < CJ - 1; j++) {
    for (let i = 1; i < 2 * CI; i++) {
      const p = P2[j][i];
      const th = zenAng(p[0], p[1]);
      const fade = clamp((WIN - 3 * DEG - th) / (14 * DEG));
      if (fade <= 0 || cam3(p[0], 0, p[1])[2] < 0.6) continue;
      // la cellule : un carré autour du germe, coupé par les médiatrices
      let poly = [[p[0] - CS, p[1] - CS], [p[0] + CS, p[1] - CS], [p[0] + CS, p[1] + CS], [p[0] - CS, p[1] + CS]];
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const q = P2[j + dj][i + di], n = [q[0] - p[0], q[1] - p[1]], m0 = mid(p, q);
        const side = (v) => (v[0] - m0[0]) * n[0] + (v[1] - m0[1]) * n[1];
        const out = [];
        for (let e = 0; e < poly.length; e++) {
          const A = poly[e], B = poly[(e + 1) % poly.length], sa = side(A), sb = side(B);
          if (sa <= 0) out.push(A);
          if (sa * sb < 0) { const t = sa / (sa - sb); out.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]); }
        }
        poly = out;
      }
      if (poly.length < 3) continue;
      // un peu rentrée vers le germe, puis arrondie (courbe par les milieux)
      const ps = poly.map((v) => pr(p[0] + (v[0] - p[0]) * 0.97, 0, p[1] + (v[1] - p[1]) * 0.97));
      const sc = scl(p[0], 0, p[1]);
      const lw = clamp(0.03 * sc, 3, 6.5);
      const warm = clamp((p[0] - CAM[0] + 1) / 4);
      const col = warm > 0.5 ? '255,238,196' : '244,250,224';
      const a = k * fade * (0.3 + 0.1 * Math.sin(T * 0.7 + SEEDS[j][i].ph * 3));
      c.beginPath();
      let m1 = mid(ps[ps.length - 1], ps[0]);
      c.moveTo(m1[0], m1[1]);
      for (let e = 0; e < ps.length; e++) { const q = ps[e]; m1 = mid(q, ps[(e + 1) % ps.length]); c.quadraticCurveTo(q[0], q[1], m1[0], m1[1]); }
      for (const [kw, ka] of [[2.8, 0.3], [1, 0.8]]) {
        c.strokeStyle = rgba(col, a * ka);
        c.lineWidth = lw * kw;
        c.stroke();
      }
    }
  }
}

// Le ciel de l'aube vu par la fente : pêche près de nous, lavande au loin
function gapSky(c) {
  c.save();
  path(c, GAPQ);
  c.clip();
  const a = pr(0, 0, ZN), b = pr(0, 0, ZN + 7);
  const sky = c.createLinearGradient(a[0], a[1], b[0], b[1]);
  sky.addColorStop(0, 'rgba(250,214,178,0.93)');
  sky.addColorStop(0.35, 'rgba(240,204,186,0.85)');
  sky.addColorStop(0.7, 'rgba(196,188,214,0.55)');
  sky.addColorStop(1, 'rgba(150,186,178,0)');
  c.fillStyle = sky;
  c.fillRect(-240, -140, 2400, 1360);
  c.restore();
}

// Au-dessus de l'eau, à travers les rides : les jambes de la file, à cheval
// sur la fente, sombres sur le ciel. La première personne, tout au bout, se
// découpe sur la surface claire (les têtes des pontons, peintes ensuite,
// cachent ses pieds) ; les suivantes ne se voient que par la fente, où la
// réfraction ramasse leurs semelles, posées au bord de chaque ponton, et le
// haut de leurs jambes.
const GAPQ = [pr(BL[1], HB, ZN), pr(RD[0], 0, ZN), pr(RD[0], 0, 20), pr(BL[1], HB, 20)];
function person(c, f, T) {
  const sw = 0.025 * Math.sin(T * 0.6 + f.ph);              // chacun se tient en équilibre
  // les rides de la surface font onduler l'image
  const wob = (p) => [p[0] + 2.4 * Math.sin(p[1] * 0.05 + T * 1.3 + f.ph), p[1] + 1.5 * Math.sin(p[0] * 0.04 + T * 1.0)];
  const P = (X, Y) => wob(pr(X + sw * (1 + (Y - HB)), Y, f.z));
  const fade = 1 - fogK(dist(0, HB, f.z)) * 0.9;
  const col = rgbOf(mixc(mixc(f.c, '#17181b', 0.45), '#8fa9a0', 1 - fade)).join(',');
  const a = 1;                                              // opaque : le fondu passe par la couleur
  const k = scl(0, HB + 0.5, f.z) * 1.3;                     // la réfraction grossit un peu
  const yh = HB + 0.95 * f.h;
  // le haut du corps, très raccourci vu d'en dessous, adouci par la surface :
  // on le devine plus qu'on ne le voit
  const hL = P(-0.17, yh), hR = P(0.17, yh), sL = P(-0.24, yh + 0.5 * f.h), sR = P(0.24, yh + 0.5 * f.h);
  const gt = c.createLinearGradient((hL[0] + hR[0]) / 2, (hL[1] + hR[1]) / 2, (sL[0] + sR[0]) / 2, (sL[1] + sR[1]) / 2);
  gt.addColorStop(0, rgba(col, a * 0.75));
  gt.addColorStop(1, rgba(col, 0));
  c.fillStyle = gt;
  c.beginPath(); c.moveTo(...hL); c.lineTo(...hR); c.lineTo(...sR); c.lineTo(...sL); c.closePath(); c.fill();
  // les deux jambes de pantalon et le bassin (opaques : pas de recouvrement visible)
  c.fillStyle = rgba(col, a);
  for (const sd of [-1, 1]) {
    const pa = P(sd * (G / 2 + 0.02), HB + 0.08), pb = P(sd * 0.1, yh);
    const ra = 0.07 * k, rb = 0.1 * k;
    const dx = pb[0] - pa[0], dy = pb[1] - pa[1], m = Math.hypot(dx, dy) || 1, nx = -dy / m, ny = dx / m;
    c.beginPath();
    c.moveTo(pa[0] + nx * ra, pa[1] + ny * ra);
    c.lineTo(pb[0] + nx * rb, pb[1] + ny * rb);
    c.lineTo(pb[0] - nx * rb, pb[1] - ny * rb);
    c.lineTo(pa[0] - nx * ra, pa[1] - ny * ra);
    c.closePath();
    c.fill();
    for (const [q, r] of [[pa, ra], [pb, rb]]) { c.beginPath(); c.arc(q[0], q[1], r, 0, TAU); c.fill(); }
  }
  c.beginPath(); c.moveTo(...P(-0.17, yh)); c.lineTo(...P(0.17, yh)); c.lineTo(...P(0, yh - 0.12)); c.closePath(); c.fill();
  // les chaussures, posées au bord de chaque ponton : la semelle dépasse un peu
  c.fillStyle = mixc('#161418', '#8fa9a0', 1 - fade);
  for (const sd of [-1, 1]) {
    const s0 = wob(pr(sd * (G / 2 - 0.03) + sw, HB, f.z - 0.15)), s2 = wob(pr(sd * (G / 2 - 0.03) + sw, HB, f.z + 0.15));
    c.beginPath();
    c.ellipse((s0[0] + s2[0]) / 2, (s0[1] + s2[1]) / 2, Math.hypot(s2[0] - s0[0], s2[1] - s0[1]) / 2 + 4, 0.06 * k, Math.atan2(s2[1] - s0[1], s2[0] - s0[0]), 0, TAU);
    c.fill();
  }
}
function legs(c, T, gap) {
  c.lineCap = 'round';
  c.lineJoin = 'round';
  if (!gap) { person(c, FILE[0], T); return; }
  c.save();
  path(c, GAPQ);
  c.clip();
  for (let i = FILE.length - 1; i >= 1; i--) person(c, FILE[i], T);
  c.restore();
}

// Les rayons : de la surface vers le bas et vers la gauche ; ils respirent
function rays(c, T, k, gap) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (const r of RAYS) {
    if (!!r.gap !== gap) continue;
    const sway = 0.08 * Math.sin(T * r.sp + r.ph);
    const top = [r.X + sway, 0, r.Z];
    // on raccourcit le rayon s'il passerait derrière nous
    let L = 9;
    while (L > 2 && cam3(r.X + SUNDIR[0] * L, SUNDIR[1] * L, r.Z + SUNDIR[2] * L)[2] < 0.8) L -= 0.5;
    const bot = [r.X + SUNDIR[0] * L + sway * 3, SUNDIR[1] * L, r.Z + SUNDIR[2] * L];
    const pa = pr(...top), pb = pr(...bot);
    const breath = 0.55 + 0.45 * Math.sin(T * r.sp * 1.6 + r.ph * 2);
    const a = r.a * breath * k * (0.3 - 0.12 * clamp((r.d - 4) / 14));
    if (a < 0.005) continue;
    const dx = pb[0] - pa[0], dy = pb[1] - pa[1], m = Math.hypot(dx, dy) || 1;
    const nx = -dy / m, ny = dx / m;
    const c0 = r.warm ? '255,226,170' : '216,240,190', c1 = r.warm ? '220,214,160' : '176,220,172';
    for (const [kw, ka] of [[2.2, 0.5], [1, 0.8]]) {
      const wa = r.w * kw * scl(...top), wb = r.w * kw * 2.2 * scl(...bot);
      const g = c.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
      g.addColorStop(0, rgba(c0, 0));
      g.addColorStop(0.1, rgba(c0, a * ka));
      g.addColorStop(0.45, rgba(c1, a * ka * 0.5));
      g.addColorStop(1, 'rgba(150,200,160,0)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(pa[0] + nx * wa, pa[1] + ny * wa);
      c.lineTo(pb[0] + nx * wb, pb[1] + ny * wb);
      c.lineTo(pb[0] - nx * wb, pb[1] - ny * wb);
      c.lineTo(pa[0] - nx * wa, pa[1] - ny * wa);
      c.closePath();
      c.fill();
    }
  }
  c.restore();
}

// L'ombre du caisson dans l'eau : un pan plus sombre qui part vers le bas à
// gauche, à l'opposé du soleil ; même chose, très doucement, sous le bleu
function shadows(c) {
  const L = 3.2;
  const vol = (X0, X1, Y, Z0, Z1, al) => {
    const ps = [[X0, Y, Z0], [X1, Y, Z0], [X1, Y, Z1], [X0, Y, Z1]];
    const all = [...ps, ...ps.map(([X, Y2, Z]) => [X + SUNDIR[0] * L, Y2 + SUNDIR[1] * L, Z + SUNDIR[2] * L])].map((q) => pr(...q));
    path(c, hull(all));
    const a = pr(X1, Y, Z0), b = pr(X0 + SUNDIR[0] * L, Y + SUNDIR[1] * L, Z0 + SUNDIR[2] * L);
    const g = c.createLinearGradient(a[0], a[1], b[0], b[1]);
    g.addColorStop(0, `rgba(40,70,72,${al})`);
    g.addColorStop(1, 'rgba(40,70,72,0)');
    c.fillStyle = g;
    c.fill();
  };
  vol(BL[0], BL[1], -FB, ZN, ZN + 14, 0.3);
  vol(RD[0], RD[1], -FB, ZN, ZN + 14, 0.3);
  vol(BX0, BX1, BY0, BZ0, BZ1, 0.55);
}

// Particules en suspension : flottent à peine, scintillent dans la lumière
function motes(c, T, k, near) {
  c.save();
  c.globalCompositeOperation = 'screen';
  for (const m of MOTES) {
    if (m.near !== near) continue;
    const X = m.w[0] + 0.16 * Math.sin(T * 0.13 * m.sp + m.ph) + 0.025 * T;
    const Y = m.w[1] + 0.08 * Math.sin(T * 0.21 * m.sp + m.ph * 1.7) + 0.01 * T * m.sp;
    const Z = m.w[2] + 0.1 * Math.sin(T * 0.09 + m.ph * 2.3);
    const z = cam3(X, Y, Z)[2];
    if (z < 0.4) continue;
    const p = pr(X, Y, Z);
    if (p[0] < -300 || p[0] > 2220 || p[1] < -200 || p[1] > 1280) continue;
    const up = clamp((Y + 4.5) / 4.2);                       // plus clair près de la surface
    const tw = 0.6 + 0.4 * Math.sin(T * (0.8 + m.sp) + m.ph * 3);
    const a = k * tw * (0.22 + 0.5 * up) * (1 - 0.75 * fogK(dist(X, Y, Z)));
    const rr = near ? (F * 0.022 * m.s) / z : Math.max(0.9, (F * 0.006 * m.s) / z);
    const col = m.warm ? '240,226,180' : '214,236,206';
    const g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr * 2.2);
    g.addColorStop(0, rgba(col, near ? a * 0.12 : a));
    g.addColorStop(near ? 0.75 : 0.4, rgba(col, near ? a * 0.09 : a * 0.35));
    g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g;
    c.fillRect(p[0] - rr * 2.2, p[1] - rr * 2.2, rr * 4.4, rr * 4.4);
  }
  c.restore();
}

// Le voyant ambré, qui pulse lentement (une respiration toutes les 3,4 s)
function lamp(c, T, k) {
  const l = pr(...LAMP), rr = 0.032 * scl(...LAMP);
  const ph = 0.5 - 0.5 * Math.cos((T * TAU) / 3.4);
  const pulse = k * (0.3 + 0.7 * ph * ph * (3 - 2 * ph));
  c.save();
  let g = c.createRadialGradient(l[0] - rr * 0.2, l[1] - rr * 0.25, 0, l[0], l[1], rr * 0.85);
  g.addColorStop(0, P.brassLight);
  g.addColorStop(0.5, P.brass);
  g.addColorStop(1, P.brassDark);
  c.globalAlpha = 0.3 + 0.7 * pulse;
  c.fillStyle = g;
  c.beginPath();
  c.arc(l[0], l[1], rr * 0.85, 0, TAU);
  c.fill();
  c.globalAlpha = 1;
  // le halo, dans l'eau
  c.globalCompositeOperation = 'screen';
  for (const [R, a] of [[rr * 7, 0.12], [rr * 2.4, 0.36]]) {
    g = c.createRadialGradient(l[0], l[1], 0, l[0], l[1], R);
    g.addColorStop(0, rgba('247,206,128', a * pulse));
    g.addColorStop(1, 'rgba(247,206,128,0)');
    c.fillStyle = g;
    c.fillRect(l[0] - R, l[1] - R, 2 * R, 2 * R);
  }
  // un reflet chaud sur le rebord tout proche
  const e0 = pr(LAMP[0] - 0.12, BY0, BZ0 + 0.02), e1 = pr(BX1 - 0.02, BY0, BZ0 + 0.02);
  c.strokeStyle = rgba('240,196,120', 0.3 * pulse);
  c.lineWidth = 1.8;
  c.beginPath(); c.moveTo(e0[0], e0[1]); c.lineTo(e1[0], e1[1]); c.stroke();
  c.restore();
}

// La lumière danse sur le flanc droit du caisson, tourné vers le soleil
function shimmer(c, T, k) {
  c.save();
  c.globalCompositeOperation = 'screen';
  path(c, [pr(BX1, BY1, BZ0), pr(BX1, BY1, BZ1), pr(BX1, BY0, BZ1), pr(BX1, BY0, BZ0)]);
  c.clip();
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    for (let j = 0; j <= 20; j++) {
      const Z = lerp(BZ0, BZ1, j / 20);
      const Y = lerp(BY1, BY0, (i + 0.5) / 5) + 0.03 * Math.sin(Z * 9 + T * (1 + 0.15 * i) + i * 2);
      const p = pr(BX1, Y, Z);
      j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]);
    }
    c.strokeStyle = rgba('248,226,182', (0.14 + 0.08 * Math.sin(T * 0.9 + i)) * k);
    c.lineWidth = 2.6;
    c.stroke();
  }
  c.restore();
}

/* --------------------------------------------------------------------------
   Le décor
   -------------------------------------------------------------------------- */
const DEF = { rays: 1, lamp: 1 };

export default {
  id: ID,
  bg: '#0c2428',
  home: { x: 960, y: 540, z: 1 },
  layers: {
    fond: { box: [-240, -140, 2400, 1360], svg: fond(), filters: ['paint'], par: 0.96 },
    pontons: { box: [-240, -140, 2400, 1360], svg: pontons(), filters: ['paint', 'b3'] },
    caisson: { box: CBOX, svg: caisson(), filters: ['paint', 'soft'], res: 2 },
  },

  render(g, p, T) {
    const q = { ...DEF, ...p };
    const k = clamp(q.rays);

    g.img('fond');
    g.fx(1, (c) => {
      soft(c, 0.5, (x) => caustics(x, T, k));
      soft(c, 0.12, (x) => rays(x, T, k, false));
      soft(c, 0.5, (x) => legs(x, T, false), 'source-over', 0.92);
    });
    g.img('pontons');
    g.fx(1, (c) => {
      gapSky(c);
      soft(c, 0.5, (x) => legs(x, T, true), 'source-over', 0.9);
      soft(c, 0.1, shadows, 'multiply');
      soft(c, 0.12, (x) => rays(x, T, k, true));
    });
    g.img('caisson');
    g.fx(1, (c) => {
      shimmer(c, T, k);
      if (q.lamp > 0) lamp(c, T, clamp(q.lamp));
      motes(c, T, 0.8 + 0.2 * k, false);
    });
    g.fx(1.12, (c) => motes(c, T, 0.8, true));

    // Étalonnage : le haut s'ouvre vers la lumière (or à droite, lavande à
    // gauche), le bas tombe dans le vert profond
    g.screen((c, W, H) => {
      c.globalCompositeOperation = 'multiply';
      let gr = c.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, 'rgba(120,150,140,0)');
      gr.addColorStop(0.6, 'rgba(70,110,104,0.1)');
      gr.addColorStop(1, 'rgba(30,64,66,0.5)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'soft-light';
      gr = c.createRadialGradient(W * 0.88, 0, 0, W * 0.88, 0, W * 0.6);
      gr.addColorStop(0, 'rgba(255,204,132,0.6)');
      gr.addColorStop(1, 'rgba(255,214,150,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
    });
  },

  shots: {
    // Lente poussée vers le caisson, en flottant ; le caisson monte vers le centre
    dessous: {
      dur: 6,
      cam: (t, portrait) => {
        const k = 0.6 * ease.inOut(clamp(t / 6)) + 0.4 * clamp(t / 6);
        const bob = Math.sin((t * TAU) / 5.2), sway = Math.sin((t * TAU) / 7.3 + 1);
        return portrait
          ? { x: lerp(720, 680, k) + 3 * sway, y: lerp(560, 505, k) + 3 * bob, z: lerp(1.0, 1.18, k) }
          : { x: lerp(1000, 860, k) + 4 * sway, y: lerp(560, 500, k) + 4 * bob, z: lerp(1.0, 1.18, k) };
      },
      p: () => ({ rays: 1, lamp: 1 }),
    },
  },
};
