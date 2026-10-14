/* ==========================================================================
   La boucle, le film (essai) : l'expérience de pensée « Un jour sans fin »
   de Monsieur Phi, racontée à la craie sur le tableau de Phi.

   Ronan (12 octobre) : séparer le questionnaire de la vidéo finale ; « dans
   la vidéo finale, on la met en forme d'un petit dessin animé, comme on avait
   fait avec les trucs à la craie » ; puis « tu peux essayer de faire la
   version en image de ça, avec la mise en scène ».

   Le style reste celui de Phi : des formes exactes, tracées sous nos yeux par
   son œil, qui tient la craie ; la craie n'est que la matière (le grain, le
   halo), il n'y a pas de main qui tremble. Le blanc pour le monde, le doré
   pour le joueur. La mise en scène vient du tableau lui-même :
     - le cadran de la journée, en haut à gauche ;
     - à minuit, une brosse passe et efface le monde ; elle n'efface pas le
       doré : ce qui reste, c'est la mémoire du joueur ;
     - la caméra se promène sur un grand tableau : le laboratoire, la
       pizzeria, la rue de Bob et de Charlie ;
     - on ne montre jamais un coup de feu : un trait de craie, et la fenêtre
       du voisin s'éteint ;
     - pour sortir de la boucle, le cadran roule en déposant la journée sur
       une droite : le temps reprend sa course.

   Tout est fonction du temps t (en secondes) : composer(t) dessine l'image de
   l'instant t. La page joue le film en direct ; tools/rendre-film.cjs le rend
   image par image (25 i/s) pour en faire une vidéo, et calcule son son (la
   craie, la brosse : tools/son-film.cjs) à partir de ce que fait la plume.
   Ce son est aussi dans son.mp3, que la page joue avec l'image : relancer le
   rendu après chaque changement de temps.

   Paramètres : ?t=42.5 (une image fixe) · ?rendu=1 (pour le rendu vidéo)
   Sans ?t, la page montre une image du film (l'affiche) ; la lecture part du début.
   ========================================================================== */

const params = new URLSearchParams(location.search);
const RENDU = params.has('rendu');
const W = 1920, H = 1080;
const DUREE = 105;
const AFFICHE = 21.5;                           // le labo refait à l'identique, le joueur et son premier souvenir
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const doux = (k) => { k = clamp(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const lisse = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
const seg = (t, [a, b]) => clamp((t - a) / (b - a));
const dans = (t, [a, b]) => t >= a && t < b;
function graine(s) { let x = s >>> 0 || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 1000003) / 1000003; }; }
// Une valeur qui suit des points clés [[t, v], …], en douceur entre deux points
function cles(t, kf, f = doux) {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    if (t <= kf[i][0]) {
      const [t0, v0] = kf[i - 1], [t1, v1] = kf[i];
      return t1 === t0 ? v1 : lerp(v0, v1, f((t - t0) / (t1 - t0)));
    }
  }
  return kf[kf.length - 1][1];
}
const marche = (t, kf) => { let v = kf[0][1]; for (const [a, b] of kf) if (t >= a) v = b; return v; };

const CRAIE = '#ede6d5', OR = '#e9b947', ARDOISE = '#1b2220';
const POLICE = { mono: '"Plex Mono", ui-monospace, monospace', inter: 'Inter, system-ui, sans-serif' };

// --- Les toiles : le film, et trois calques de craie (blanche, dorée, surimpression) -----------
const toile = document.getElementById('film');
const ctx = toile.getContext('2d');
const calque = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const LB = calque(), LO = calque(), LS = calque();
const cb = LB.getContext('2d'), co = LO.getContext('2d'), cs = LS.getContext('2d');

// Le tableau : une ardoise, de vieilles traces d'effaçage, de la poussière (tout tiré d'une graine)
const MONDE_W = 6400;
const HAUT_ARDOISE = 300;                       // le tableau dépasse le cadre de base, en haut et en bas
const ardoise = calque(MONDE_W / 2, (H + 2 * HAUT_ARDOISE) / 2);
(function () {
  const c = ardoise.getContext('2d'), r = graine(7);
  c.fillStyle = ARDOISE;
  c.fillRect(0, 0, ardoise.width, ardoise.height);
  // les traces, posées nettes sur un calque, puis floutées d'un seul coup (une par une, c'est lent)
  const traces = calque(ardoise.width, ardoise.height), ct = traces.getContext('2d');
  for (let i = 0; i < 260; i++) {
    const x = r() * ardoise.width, y = r() * ardoise.height, w = 60 + r() * 360, h = 8 + r() * 34;
    ct.fillStyle = `rgba(226,234,228,${0.01 + r() * 0.028})`;
    ct.beginPath();
    ct.ellipse(x, y, w / 2, h / 2, (r() - 0.5) * 0.25, 0, TAU);
    ct.fill();
  }
  c.filter = 'blur(9px)';
  c.drawImage(traces, 0, 0);
  c.filter = 'none';
  for (let i = 0; i < 12000; i++) {
    c.fillStyle = `rgba(226,234,228,${0.015 + r() * 0.05})`;
    c.fillRect(r() * ardoise.width, r() * ardoise.height, 1, 1);
  }
})();
// Le grain de la craie : de petits trous, qui restent attachés au tableau quand la caméra bouge
const grain = calque(256, 256);
(function () {
  const c = grain.getContext('2d'), r = graine(11);
  for (let i = 0; i < 5600; i++) {
    c.fillStyle = `rgba(0,0,0,${0.22 + r() * 0.6})`;
    c.beginPath();
    c.arc(r() * 256, r() * 256, 0.5 + r() * 1.5, 0, TAU);
    c.fill();
  }
})();
const motifs = new Map();
function grainer(c, m) {                     // m : la matrice monde → écran, pour que le grain suive le tableau
  if (!motifs.has(c)) motifs.set(c, c.createPattern(grain, 'repeat'));
  const p = motifs.get(c);
  p.setTransform(new DOMMatrix([m.z, 0, 0, m.z, m.ox, m.oy]));
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'destination-out';
  c.fillStyle = p;
  c.fillRect(0, 0, W, H);
  c.restore();
}

// --- Les dessins : des traits exacts, tracés dans l'ordre par la plume ---------------------------
class Dessin {
  constructor({ col = CRAIE, w = 5 } = {}) { this.traits = []; this.textes = []; this.remplis = []; this.L = 0; this.col = col; this.w = w; }
  // ce qui reconnaît un dessin d'une image à l'autre (même tracé, même clé), pour le son de la plume
  get cle() { return `${Math.round(this.L)}/${this.traits.length}`; }
  _add(pts, o = {}) {
    let l = 0;
    for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    this.traits.push({ pts, l, a: this.L, col: o.col || this.col, w: o.w || this.w, al: o.al ?? 1 });
    this.L += l;
    return this;
  }
  ligne(x1, y1, x2, y2, o) { return this._add([[x1, y1], [x2, y2]], o); }
  poly(pts, o) { return this._add(pts, o); }
  rect(x, y, w, h, o) { return this._add([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], o); }
  arc(cx, cy, rx, ry, a0, a1, o) {
    const n = Math.max(10, Math.ceil((Math.abs(a1 - a0) * Math.max(rx, ry)) / 7));
    const pts = [];
    for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    return this._add(pts, o);
  }
  cercle(cx, cy, r, o) { return this.arc(cx, cy, r, r, -Math.PI / 2, -Math.PI / 2 + TAU, o); }
  texte(s, x, y, o = {}) {
    this.textes.push({ s, x, y, at: this.L, taille: o.taille || 34, police: o.police || 'mono', poids: o.poids || 500, align: o.align || 'center', col: o.col || this.col });
    return this;
  }
  // Une surface hachurée (la lumière d'une fenêtre, un corps), qui apparaît quand la plume l'a entourée
  hachurer(chemin, o = {}) { this.remplis.push({ chemin, at: this.L, col: o.col || this.col, pas: o.pas || 10, al: o.al ?? 0.5, bb: o.bb }); return this; }
}
function traitPartiel(c, tr, g, alpha) {
  const pts = tr.pts, cible = tr.l * g;
  let acc = 0, fin = pts[0];
  c.strokeStyle = tr.col;
  c.lineWidth = tr.w;
  c.globalAlpha = alpha * tr.al;
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + l >= cible) {
      const k = l ? (cible - acc) / l : 0;
      fin = [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
      c.lineTo(fin[0], fin[1]);
      break;
    }
    acc += l;
    c.lineTo(pts[i][0], pts[i][1]);
    fin = pts[i];
  }
  c.stroke();
  c.globalAlpha = 1;
  return fin;
}
function hachures(c, r, alpha) {
  const [x, y, w, h] = r.bb;
  c.save();
  c.beginPath();
  r.chemin(c);
  c.clip();
  c.strokeStyle = r.col;
  c.lineWidth = 2.2;
  c.globalAlpha = alpha * r.al;
  c.beginPath();
  for (let k = -h; k < w; k += r.pas) { c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); }
  c.stroke();
  c.restore();
  c.globalAlpha = 1;
}
function ecrire(c, tx, alpha) {
  c.font = `${tx.poids} ${tx.taille}px ${POLICE[tx.police]}`;
  c.textAlign = tx.align;
  c.textBaseline = 'alphabetic';
  c.fillStyle = tx.col;
  c.globalAlpha = alpha;
  c.fillText(tx.s, tx.x, tx.y);
  c.globalAlpha = 1;
}
// Trace le dessin jusqu'à la fraction f. « suite » : un trait après l'autre, comme la plume ;
// « ensemble » : tout à la fois (le monde qui se reforme après la brosse). Rend la pointe de la plume.
// Un dessin qui a un fond (un humain, une bulle) est devant le reste : sous sa silhouette, on gratte
// la craie blanche déjà posée (masque : le calque blanc, quand le dessin est doré).
function tracer(c, d, f, { mode = 'suite', alpha = 1, masque = c } = {}) {
  if (f <= 0 || !d) return null;
  if (d.fond) {
    masque.save();
    masque.globalCompositeOperation = 'destination-out';
    masque.globalAlpha = alpha * clamp(f * 3);
    masque.beginPath();
    d.fond(masque);
    masque.fill();
    masque.restore();
  }
  const s = f * d.L;
  let pointe = null;
  d.traits.forEach((tr, i) => {
    const g = mode === 'suite' ? clamp((s - tr.a) / tr.l) : f;
    if (g > 0) { const p = traitPartiel(c, tr, g, alpha); if (g < 1) pointe = { p, cle: d.cle, i, s }; }
  });
  for (const r of d.remplis) { const g = mode === 'suite' ? clamp((s - r.at) / 140) : f; if (g > 0) hachures(c, r, g * alpha); }
  for (const tx of d.textes) { const g = mode === 'suite' ? clamp((s - tx.at) / 90) : f; if (g > 0) ecrire(c, tx, g * alpha); }
  return f < 1 && mode === 'suite' ? pointe : null;
}

// --- Le monde, en formes exactes -------------------------------------------------------------
const SOL = 880, S = 130;                      // le sol, la taille d'un humain
// Un humain, en modèle : un rond, un corps ; la tête au-dessus de (x, y)
function humain(x, y = SOL - 0.36 * S, { col = CRAIE, s = S, plein = 0.42, w } = {}) {
  const hr = 0.14 * s, hy = y - 0.17 * s, bw = 0.26 * s, bb = y + 0.36 * s, bh = 0.34 * s;
  const d = new Dessin({ col, w: w || 4.5 });
  d.cercle(x, hy, hr);
  d.arc(x, bb, bw, bh, Math.PI, TAU);
  d.ligne(x + bw, bb, x - bw, bb);
  d.hachurer((c) => { c.moveTo(x + hr, hy); c.arc(x, hy, hr, 0, TAU); c.moveTo(x - bw, bb); c.ellipse(x, bb, bw, bh, 0, Math.PI, TAU); c.closePath(); },
    { col, pas: 8, al: plein, bb: [x - bw, hy - hr, 2 * bw, bb - hy + hr] });
  // sa silhouette, un peu élargie : ce qui passe derrière lui (un mur, une fenêtre) ne le traverse pas
  const m = 3;
  d.fond = (c) => { c.moveTo(x + hr + m, hy); c.arc(x, hy, hr + m, 0, TAU); c.moveTo(x - bw - m, bb); c.ellipse(x, bb, bw + m, bh + m, 0, Math.PI, TAU); c.closePath(); };
  return d;
}
const teteDe = (x, y = SOL - 0.36 * S, s = S) => [x, y - 0.17 * s];

function dessinLabo() {
  const d = new Dessin();
  d.ligne(80, SOL, 1840, SOL);
  d.cercle(600, 520, 250).cercle(600, 520, 204, { w: 3.5 });
  for (let k = 0; k < 12; k++) {            // les aimants autour de l'anneau
    const a = (k / 12) * TAU, cx = 600 + 227 * Math.cos(a), cy = 520 + 227 * Math.sin(a);
    const u = [Math.cos(a), Math.sin(a)], v = [-u[1], u[0]], hw = 24, hh = 13;
    const p = (s, t) => [cx + u[0] * s + v[0] * t, cy + u[1] * s + v[1] * t];
    d.poly([p(-hh, -hw), p(hh, -hw), p(hh, hw), p(-hh, hw), p(-hh, -hw)], { w: 3 });
  }
  d.ligne(850, 498, 1120, 498, { w: 3.5 }).ligne(850, 542, 1120, 542, { w: 3.5 });
  d.rect(1120, 430, 150, 180);
  d.hachurer((c) => c.rect(1120, 430, 150, 180), { pas: 14, al: 0.3, bb: [1120, 430, 150, 180] });
  d.rect(1360, 720, 340, 20).ligne(1382, 740, 1382, SOL).ligne(1678, 740, 1678, SOL);
  d.rect(1420, 590, 210, 125, { w: 3.5 });
  const onde = [];
  for (let i = 0; i <= 40; i++) onde.push([1440 + i * 4.25, 652 - 26 * Math.sin(i * 0.6) * Math.exp(-i / 30)]);
  d.poly(onde, { w: 2.5 });
  d.rect(1740, 560, 110, 320).cercle(1830, 724, 6, { w: 3 });
  return d;
}
function dessinPizzeria() {
  const d = new Dessin();
  d.ligne(2120, SOL, 2860, SOL);
  d.rect(2240, 470, 520, 410);
  d.texte('PIZZERIA', 2500, 507, { taille: 34 });
  d.rect(2220, 520, 560, 40);
  for (let x = 2220; x < 2780; x += 56) {
    d.ligne(x + 28, 520, x + 28, 560, { w: 3 });
    d.arc(x + 28, 560, 28, 22, 0, Math.PI, { w: 3.5 });
  }
  d.rect(2280, 630, 250, 190);
  d.ligne(2405, 630, 2405, 820, { w: 3 });
  d.rect(2590, 640, 120, 240).cercle(2690, 765, 6, { w: 3 });
  return d;
}
function maison(x, w, h, { fenetres = 2 } = {}) {
  const d = new Dessin(), haut = SOL - h;
  d.ligne(x - 40, SOL, x + w + 40, SOL);
  d.rect(x, haut, w, h);
  d.poly([[x - 26, haut], [x + w / 2, haut - 130], [x + w + 26, haut]]);
  const fw = 96, fh = 92;
  if (fenetres >= 1) d.rect(x + 40, haut + 66, fw, fh);
  if (fenetres >= 2) d.rect(x + w - 40 - fw, haut + 66, fw, fh);
  d.rect(x + w / 2 - 32, SOL - 128, 64, 128);
  return d;
}
// La fenêtre allumée du voisin, et sa silhouette : c'est elle qui s'éteint
const FENETRE = (x, w, h) => { const haut = SOL - h; return [x + 40, haut + 66, 96, 92]; };
function lumiere([fx, fy, fw, fh]) {
  const d = new Dessin({ w: 3.5 });
  d.hachurer((c) => c.rect(fx + 4, fy + 4, fw - 8, fh - 8), { pas: 9, al: 0.55, bb: [fx, fy, fw, fh] });
  const cx = fx + fw / 2;
  d.cercle(cx, fy + fh - 52, 13);
  d.arc(cx, fy + fh - 4, 26, 30, Math.PI, TAU);
  return d;
}
function billet(x, y) {
  const d = new Dessin({ w: 3.5 });
  d.rect(x, y, 66, 36).arc(x + 33, y + 18, 13, 10, -Math.PI / 2, -Math.PI / 2 + TAU, { w: 3 });
  return d;
}
function bulle(x, y, w, h, vers, o = {}) {      // une bulle de parole ; vers : la tête de celui qui parle
  const d = new Dessin({ col: o.col || CRAIE, w: 3.5 }), r = 18;
  d.fond = (c) => c.roundRect(x, y, w, h, r);
  d.poly([[x + r, y], [x + w - r, y]]).arc(x + w - r, y + r, r, r, -Math.PI / 2, 0)
    .poly([[x + w, y + r], [x + w, y + h - r]]).arc(x + w - r, y + h - r, r, r, 0, Math.PI / 2)
    .poly([[x + w - r, y + h], [x + 70, y + h], [vers[0] + 14, vers[1] - 24], [x + 40, y + h], [x + r, y + h]])
    .arc(x + r, y + h - r, r, r, Math.PI / 2, Math.PI).poly([[x, y + h - r], [x, y + r]]).arc(x + r, y + r, r, r, Math.PI, Math.PI * 1.5);
  if (o.texte) d.texte(o.texte, x + w / 2, y + h / 2 + 11, { police: 'inter', taille: 30, poids: 500, col: o.col || CRAIE });
  if (o.points) for (let i = 0; i < 3; i++) d.cercle(x + w / 2 - 22 + i * 22, y + h / 2, 4, { w: 4 });
  return d;
}

// Le décor : où sont les choses sur le grand tableau
const LABO_JOUEUR = 1250;
const BOB = { maison: [3000, 360, 330], x: 3460, voisin: [3560, 360, 330] };
const CHARLIE = { maison: [4300, 360, 330], x: 4760, voisin: [4860, 360, 330] };
const D_LABO = dessinLabo(), D_PIZZERIA = dessinPizzeria();
const D_MAISONS = [BOB.maison, BOB.voisin, CHARLIE.maison, CHARLIE.voisin].map(([x, w, h], i) => maison(x, w, h, { fenetres: i % 2 ? 1 : 2 }));
const D_LUMIERES = [BOB.voisin, CHARLIE.voisin].map(([x, w, h]) => lumiere(FENETRE(x, w, h)));
const D_JOUEUR_LABO = humain(LABO_JOUEUR, undefined, { col: OR });

// --- Le temps du film ------------------------------------------------------------------------
// (secondes) Chaque scène a ses temps ; les légendes viennent ensuite
const K = {
  anneau: [0.8, 2.4], grad: [2.4, 3.2], heures: [3.2, 3.6], coin: [8.6, 9.8],
  labo: [9.8, 14.0], joueur: [14.0, 14.6], accident: [14.9, 16.3],
  gomme1: [18.7, 19.6], refait1: [19.7, 20.3], gomme2: [22.2, 23.0], refait2: [23.1, 23.6],
  versPizzeria: [24.0, 25.6], pizzeria: [25.5, 27.8], alice1: [28.0, 29.6], bulle1: [29.7, 30.4],
  gomme3: [31.3, 32.1], refait3: [32.2, 32.7], alice2: [32.8, 34.0], bulle2: [34.1, 34.6],
  versMaisons: [35.6, 37.4], maisons: [37.2, 40.0], lumieres: [40.0, 40.6], bobCharlie: [40.6, 41.4],
  billets: [42.0, 42.8], note: [43.2, 44.6], pensee: [46.8, 48.4], tirs: [49.0, 49.35], noir: [49.35, 49.9],
  montage: [51.4, 55.2], versBob: [55.4, 56.6], joueurBob: [56.6, 57.6], paroleBob: [57.7, 58.3], refus: [59.0, 59.4],
  versCharlie: [62.4, 63.8], joueurCharlie: [63.8, 64.8], paroleCharlie: [64.9, 65.5], tirCharlie: [66.6, 66.95], noirCharlie: [66.95, 67.5],
  gomme4: [68.2, 68.9], refait4: [69.0, 69.5], cordes: [69.8, 70.8],
  versLabo: [73.4, 75.4], porte: [75.6, 76.4], grandit: [79.2, 80.2], deroule: [80.2, 82.4], prolonge: [82.4, 83.4],
  versRue: [84.0, 86.4], tirsFinal: [89.45, 89.8], noirFinal: [89.8, 90.35],
  gommeFinale: [91.8, 93.0], q1: [93.6, 95.8], q2: [96.8, 97.8], titre: [100.6, 101.6],
};
// L'aiguille du cadran : l'heure de la journée (0 → 1), qui revient à 0 à chaque boucle
const AIGUILLE = [
  [0, 0], [3.6, 0], [5.6, 1], [5.62, 1], [5.95, 0], [6.2, 0], [7.8, 1], [7.82, 1], [8.15, 0],
  [14.9, 0], [15.2, 0.55], [15.45, 0.15], [15.75, 0.85], [16.05, 0.3], [16.3, 0], [16.6, 0], [18.6, 1], [18.7, 0],
  [19.8, 0], [22.1, 1], [22.2, 0], [23.3, 0], [25.4, 0.25],
  [27.8, 0.4], [29.7, 0.52], [30.6, 0.6], [31.2, 1], [31.3, 0], [32.7, 0.35], [34.1, 0.52], [35.3, 1], [35.4, 0],
  [40.6, 0], [42.0, 0.7], [48.4, 0.72], [49.0, 0.875], [50.6, 1], [50.7, 0],
  [55.3, 0], [56.6, 0.3], [57.7, 0.45], [59.0, 0.7], [60.4, 0.875], [61.8, 1], [61.9, 0],
  [63.8, 0.3], [64.9, 0.45], [65.8, 0.7], [66.6, 0.875], [68.1, 1], [68.2, 0],
  [69.5, 0], [70.0, 0.6], [71.4, 0.875], [73.2, 1], [73.3, 0],
];
const BOUCLE = [[16.3, 1], [19.6, 2], [23.0, 3], [32.1, 4], [35.4, 5], [55.3, 1001], [61.9, 1002], [68.2, 1003], [73.3, 1004]];
// La journée qui se pose sur la droite, le dernier jour : 0 → 1 (24 h), puis au-delà
const JOUR_FINAL = [[86.4, 0], [87.8, 0.6], [89.45, 0.875], [90.8, 1], [92.0, 1.25]];

const LEGENDES = [
  [0.8, 4.6, 'Vous connaissez « Un jour sans fin » ?'],
  [4.6, 8.6, 'Le héros y revit la même journée, encore et encore. Lui seul s’en souvient.'],
  [9.9, 14.8, 'Imaginez : dans votre laboratoire, une expérience de physique tourne mal.'],
  [15.0, 19.4, 'Vous voilà pris dans une boucle temporelle. Vous êtes la seule personne à en avoir conscience.'],
  [19.6, 24.4, 'À chaque boucle, tout revient exactement au même état. Tout, sauf votre mémoire.'],
  [25.6, 30.6, 'Tant que vous n’intervenez pas, chacun refait exactement la même chose.'],
  [30.6, 35.6, 'Alice, par exemple, commande toujours la même pizza. Avec les mêmes mots.'],
  [37.4, 42.9, 'Ce jour-là, on propose de l’argent à Bob et à Charlie pour qu’ils tuent leur voisin.'],
  [42.9, 46.8, 'Personne ne les force : ni besoin vital, ni pression, ni menace.'],
  [46.8, 51.4, 'Après mûre réflexion, ils acceptent. Et ils tirent.'],
  [51.4, 55.4, 'À chaque boucle. Sans aucune exception.'],
  [56.6, 62.4, 'Mais quand vous parlez à Bob, il se range à vos raisons, et ne tire pas. À chaque fois.'],
  [63.8, 68.2, 'Charlie, lui, ne change jamais d’avis.'],
  [68.4, 73.4, 'Les seules fois où vous l’en empêchez, c’est par la force.'],
  [75.4, 79.4, 'Pour sortir de la boucle, vous devez rester toute une journée dans votre laboratoire, sans aucune interaction.'],
  [79.6, 84.0, 'Vous le faites. Le temps reprend son cours.'],
  [86.4, 91.6, 'Ce jour-là, comme chaque fois que vous n’intervenez pas, Bob et Charlie acceptent. Et tirent.'],
];

// --- La caméra : elle se promène sur le grand tableau -------------------------------------------
const CAM = [
  [0, 960, 540, 1], [24.0, 960, 540, 1], [25.6, 2490, 600, 1.12], [35.6, 2490, 600, 1.12],
  [37.4, 4110, 610, 0.86], [55.4, 4110, 610, 0.86], [56.6, 3420, 640, 1.24], [62.4, 3420, 640, 1.24],
  [63.8, 4720, 640, 1.24], [73.4, 4720, 640, 1.24], [75.4, 960, 560, 1.06], [84.0, 960, 560, 1.06],
  [86.4, 4110, 610, 0.86], [DUREE, 4110, 610, 0.86],
];
function camera(t) {
  let i = 0;
  while (i < CAM.length - 1 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)];
  const k = b[0] === a[0] ? 0 : doux((t - a[0]) / (b[0] - a[0]));
  // le zoom passe en échelle logarithmique : un mouvement régulier pour l'œil
  const z = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), k));
  const x = lerp(a[1], b[1], k), y = lerp(a[2], b[2], k);
  return { x, y, z, ox: W / 2 - x * z, oy: H / 2 - y * z };
}
const versEcran = (m, [x, y]) => [x * m.z + m.ox, y * m.z + m.oy];

// --- Le cadran (surimpression) : au centre au début, puis dans le coin, puis il roule -------------
const LIGNE = { x0: 150, y: 150, R: 140 };
LIGNE.L = TAU * LIGNE.R;
LIGNE.x1 = LIGNE.x0 + LIGNE.L;
function etatCadran(t) {
  const coin = doux(seg(t, K.coin)), grand = doux(seg(t, K.grandit)), roule = seg(t, K.deroule);
  let cx = lerp(960, 112, coin), cy = lerp(470, 112, coin), R = lerp(240, 54, coin);
  cx = lerp(cx, LIGNE.x0, grand); cy = lerp(cy, LIGNE.y + LIGNE.R, grand); R = lerp(R, LIGNE.R, grand);
  return { cx, cy, R, roule: t >= K.deroule[0] ? roule : 0 };
}
// Un point de la journée (u : 0 → 1) sur le cadran ; dr < 0 : vers l'intérieur. Quand le cadran roule,
// la part déjà déroulée se pose sur la droite (la journée tient sous la ligne, le cadran y est suspendu)
function pointCadran(e, u, dr = 0) {
  if (e.roule <= 0) { const a = TAU * u; return [e.cx + (e.R + dr) * Math.sin(a), e.cy - (e.R + dr) * Math.cos(a)]; }
  const k = e.roule;
  if (u <= k) return [LIGNE.x0 + u * LIGNE.L, LIGNE.y - dr];
  const a = TAU * (u - k), cx = LIGNE.x0 + k * LIGNE.L, cy = LIGNE.y + LIGNE.R;
  return [cx + (LIGNE.R + dr) * Math.sin(a), cy - (LIGNE.R + dr) * Math.cos(a)];
}
function cheminCadran(c, e, u0, u1, dr = 0) {
  const n = Math.max(2, Math.ceil((u1 - u0) * 180));
  c.beginPath();
  for (let i = 0; i <= n; i++) { const [x, y] = pointCadran(e, u0 + ((u1 - u0) * i) / n, dr); i ? c.lineTo(x, y) : c.moveTo(x, y); }
}
function dessinerCadran(c, t, pointes) {
  const e = etatCadran(t);
  const fA = seg(t, K.anneau), fG = seg(t, K.grad), fH = seg(t, K.heures);
  const ep = e.R > 120 ? 5 : 3.2;
  c.lineCap = 'round';
  c.strokeStyle = CRAIE;
  // l'anneau, tracé par la plume au début
  if (fA > 0) {
    c.lineWidth = ep;
    cheminCadran(c, e, 0, fA);
    c.stroke();
    if (fA < 1) pointes.push({ p: pointCadran(e, fA), ecran: true, cle: 'anneau', i: 0, s: fA * TAU * e.R });
  }
  // les graduations : une par heure, plus longues toutes les six heures
  const ng = Math.floor(24 * fG);
  c.lineWidth = e.R > 120 ? 3.5 : 2.2;
  c.beginPath();
  for (let h = 0; h < ng; h++) {
    const lg = (h % 6 ? 0.07 : 0.14) * Math.min(e.R, 160);
    const [x1, y1] = pointCadran(e, h / 24, 0), [x2, y2] = pointCadran(e, h / 24, -lg);
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
  }
  c.stroke();
  if (fG > 0 && fG < 1) pointes.push({ p: pointCadran(e, ng / 24, 0), ecran: true, cle: 'graduations', i: ng, s: fG * 24 * 12 });
  // les heures, quand le cadran est grand et rond
  const aH = fH * (1 - seg(t, [K.coin[0], K.coin[0] + 0.4])) * (1 - seg(t, [K.grandit[0], K.grandit[0] + 0.01]));
  if (aH > 0 && e.roule === 0) {
    c.font = `500 ${Math.round(e.R * 0.12)}px ${POLICE.mono}`;
    c.textAlign = 'center';
    c.fillStyle = CRAIE;
    c.globalAlpha = aH * 0.85;
    for (const h of [0, 6, 12, 18]) { const [x, y] = pointCadran(e, h / 24, -e.R * 0.26); c.fillText(`${h} h`, x, y + e.R * 0.045); }
    c.globalAlpha = 1;
  }
  // l'aiguille : la part de la journée écoulée, en trait épais, et sa pointe
  const u = t < K.deroule[0] ? cles(t, AIGUILLE, lisse) : 0;
  if (u > 0.003 && fA >= 1) {
    const dedans = -Math.min(e.R * 0.09, 20);       // un peu à l'intérieur de l'anneau
    c.lineWidth = e.R > 120 ? 12 : 6.5;
    cheminCadran(c, e, 0, u, dedans);
    c.stroke();
    const [px, py] = pointCadran(e, u, dedans);
    c.beginPath();
    c.arc(px, py, e.R > 120 ? 11 : 6, 0, TAU);
    c.fillStyle = CRAIE;
    c.fill();
  }
  // le compteur de boucles, à côté du petit cadran
  const n = marche(t, BOUCLE);
  const aC = seg(t, [16.3, 16.8]) * (1 - seg(t, K.grandit));
  if (aC > 0 && t < K.deroule[0]) {
    c.font = `500 30px ${POLICE.mono}`;
    c.textAlign = 'left';
    c.fillStyle = CRAIE;
    c.globalAlpha = aC;
    const nb = t >= K.montage[0] && t < K.montage[1] ? Math.round(lerp(5, 1000, Math.pow(seg(t, K.montage), 2.2))) : n;
    c.fillText(`BOUCLE N° ${nb.toLocaleString('fr-FR')}`, 190, 124);
    c.globalAlpha = 1;
  }
  if (e.roule > 0 && e.roule < 1) pointes.push({ p: [LIGNE.x0 + e.roule * LIGNE.L, LIGNE.y], ecran: true, cle: 'roule', i: Math.floor(e.roule * 24), s: e.roule * LIGNE.L });
  // le cadran qui roule, puis la droite qui continue : le temps reprend sa course
  const fP = seg(t, K.prolonge);
  if (fP > 0) {
    const x2 = lerp(LIGNE.x1, 1780, fP);
    c.lineWidth = 3.2;
    c.beginPath();
    c.moveTo(LIGNE.x1, LIGNE.y);
    c.lineTo(x2, LIGNE.y);
    if (fP >= 1) { c.moveTo(x2 - 16, LIGNE.y - 10); c.lineTo(x2, LIGNE.y); c.lineTo(x2 - 16, LIGNE.y + 10); }
    c.stroke();
    if (fP < 1) pointes.push({ p: [x2, LIGNE.y], ecran: true, cle: 'prolonge', i: 0, s: x2 });
  }
  // le dernier jour, sur la droite : une pointe qui avance, et au-delà de minuit, le jour suivant
  if (t >= JOUR_FINAL[0][0]) {
    const v = cles(t, JOUR_FINAL, lisse);
    const xv = v <= 1 ? LIGNE.x0 + v * LIGNE.L : lerp(LIGNE.x1, 1780, (v - 1) / 0.75);
    c.lineWidth = 6.5;
    c.beginPath();
    c.moveTo(LIGNE.x0, LIGNE.y);
    c.lineTo(xv, LIGNE.y);
    c.stroke();
    c.beginPath();
    c.arc(xv, LIGNE.y, 6, 0, TAU);
    c.fill();
  }
}

// --- La brosse : elle passe à minuit, et efface la craie blanche (pas le doré) ------------------
const BROSSES = [K.gomme1, K.gomme2, K.gomme3, K.gomme4, K.gommeFinale];
function bordBrosse(t, g) { return lerp(-140, W + 140, lisse(seg(t, g))); }
function effacer(c, x) {
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'destination-out';
  const grad = c.createLinearGradient(x - 70, 0, x, 0);
  grad.addColorStop(0, 'rgba(0,0,0,1)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = '#000';
  c.fillRect(0, 0, Math.max(0, x - 70), H);
  c.fillStyle = grad;
  c.fillRect(x - 70, 0, 70, H);
  c.restore();
}
function dessinerBrosse(c, x, t) {
  c.save();
  c.translate(x, 0);
  c.fillStyle = '#2a2420';
  c.fillRect(-10, -20, 46, H + 40);
  c.fillStyle = '#3b332c';
  c.fillRect(36, -20, 34, H + 40);
  c.strokeStyle = 'rgba(237,230,213,.35)';
  c.lineWidth = 2;
  c.beginPath();
  for (let y = -20; y < H + 20; y += 14) { c.moveTo(-10, y); c.lineTo(36, y + 8); }
  c.stroke();
  // la poussière qui tombe derrière la brosse
  const r = graine(Math.floor(t * 25) + 3);
  c.fillStyle = 'rgba(237,230,213,.5)';
  for (let i = 0; i < 70; i++) c.fillRect(-20 - r() * 90, r() * H, 1.5 + r() * 2.5, 1.5 + r() * 2.5);
  c.restore();
}

// --- L'œil de Phi : il tient la craie ----------------------------------------------------------
function oeil(c, x, y, R, T, { look = null, alpha = 1 } = {}) {
  const ring = R * 0.19, RIN = R - ring / 2 - R * 0.013;
  const slot = Math.floor(T / 2.7), uu = T / 2.7 - slot;
  const h = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  const glance = !look && h(slot) < 0.35 && uu > 0.25 && uu < 0.75 ? (h(slot + 9) < 0.5 ? -1 : 1) * 0.14 * R * Math.sin(Math.PI * (uu - 0.25) * 2) : 0;
  const lx = (look ? look[0] : 0) + glance, ly = look ? look[1] : 0;
  const bslot = Math.floor(T / 5), bu = T - bslot * 5, at = 1 + 3 * h(bslot + 3);
  const cl = bu - at >= 0 && bu - at < 0.22 ? 1 - Math.sin((Math.PI * (bu - at)) / 0.22) : 1;
  const r = R * 0.4 * cl;
  c.save();
  c.globalAlpha = alpha;
  // la lueur
  const g = c.createRadialGradient(x + lx, y + ly, 0, x + lx, y + ly, R * 0.75);
  g.addColorStop(0, 'rgba(143,192,214,.45)');
  g.addColorStop(1, 'rgba(143,192,214,0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x + lx, y + ly, R * 0.75, 0, TAU);
  c.fill();
  c.strokeStyle = CRAIE;
  c.lineCap = 'round';
  c.lineWidth = ring;
  c.beginPath();
  c.arc(x, y, R, 0, TAU);
  c.moveTo(x, y - R * 1.48);
  c.lineTo(x, y - R - ring / 2 + 0.6);
  c.moveTo(x, y + R + ring / 2 - 0.6);
  c.lineTo(x, y + R * 1.48);
  c.stroke();
  // les six lames du diaphragme
  const cx = x + lx, cy = y + ly, a0 = -90 + (0.4 * R - r) * (2.6 * 31) / R;
  const U = [], V = [];
  for (let k = 0; k < 6; k++) { const a = ((a0 + 60 * k) * Math.PI) / 180; U.push([Math.cos(a), Math.sin(a)]); V.push([cx + r * U[k][0], cy + r * U[k][1]]); }
  c.lineWidth = R * 0.07;
  c.globalAlpha = alpha * 0.9;
  c.beginPath();
  for (let k = 0; k < 6; k++) {
    const p = (k + 5) % 6;
    let dx = U[k][0] - U[p][0], dy = U[k][1] - U[p][1];
    const L = Math.hypot(dx, dy); dx /= L; dy /= L;
    const bx = V[k][0] - x, by = V[k][1] - y, b = bx * dx + by * dy, cc = bx * bx + by * by - RIN * RIN;
    const tt = -b + Math.sqrt(Math.max(0, b * b - cc));
    c.moveTo(V[p][0], V[p][1]);
    c.lineTo(V[k][0] + dx * tt, V[k][1] + dy * tt);
  }
  c.stroke();
  c.globalAlpha = alpha;
  c.fillStyle = '#8fc0d6';
  c.beginPath();
  c.arc(cx, cy, Math.min(R * 0.135, r * 0.62), 0, TAU);
  c.fill();
  c.restore();
}

// --- Les légendes ------------------------------------------------------------------------------
function legende(c, t) {
  for (const [a, b, texte] of LEGENDES) {
    if (t < a || t > b) continue;
    const al = Math.min(seg(t, [a, a + 0.35]), 1 - seg(t, [b - 0.35, b]));
    c.save();
    c.font = `500 38px ${POLICE.inter}`;
    c.textAlign = 'center';
    // deux lignes au plus, coupées à la largeur
    const mots = texte.split(' ');
    let lignes = [texte];
    if (c.measureText(texte).width > 1380) {          // deux lignes, coupées là où elles s'équilibrent le mieux
      let mieux = null;
      for (let i = 1; i < mots.length; i++) {
        const a = mots.slice(0, i).join(' '), b = mots.slice(i).join(' ');
        const pire = Math.max(c.measureText(a).width, c.measureText(b).width);
        if (!mieux || pire < mieux[0]) mieux = [pire, a, b];
      }
      lignes = [mieux[1], mieux[2]];
    }
    const y0 = H - 66 - (lignes.length - 1) * 50;
    const g = c.createLinearGradient(0, H - 230, 0, H);
    g.addColorStop(0, 'rgba(10,13,12,0)');
    g.addColorStop(1, 'rgba(10,13,12,.55)');
    c.globalAlpha = al;
    c.fillStyle = g;
    c.fillRect(0, H - 230, W, 230);
    c.fillStyle = '#f4efe3';
    c.shadowColor = 'rgba(0,0,0,.6)';
    c.shadowBlur = 10;
    lignes.forEach((li, i) => c.fillText(li, W / 2, y0 + i * 50));
    c.restore();
  }
}

// --- Les scènes ---------------------------------------------------------------------------------
// Chaque fonction dessine sa part du monde à l'instant t, et signale la pointe de la plume
function marcheHumain(t, [a, b], x0, x1) { const k = lisse(seg(t, [a, b])); return [lerp(x0, x1, k), -Math.abs(Math.sin(k * Math.PI * 5)) * 6 * (k > 0 && k < 1)]; }
function scenes(t, m, pointes) {
  const enMonde = (c) => c.setTransform(m.z, 0, 0, m.z, m.ox, m.oy);
  enMonde(cb);
  enMonde(co);
  const plume = (r) => { if (r) pointes.push({ ...r, ecran: false }); };

  // Le laboratoire : dessiné, effacé à minuit, refait à l'identique (deux fois), puis il reste
  const fLabo = seg(t, K.labo);
  if (t < K.gomme1[1]) {
    plume(tracer(cb, D_LABO, fLabo));
  }
  if (t >= K.refait1[0] && t < K.gomme2[1]) tracer(cb, D_LABO, seg(t, K.refait1), { mode: 'ensemble' });
  if (t >= K.refait2[0]) tracer(cb, D_LABO, seg(t, K.refait2), { mode: 'ensemble' });
  // le joueur, en or : la brosse ne l'efface pas
  plume(tracer(co, D_JOUEUR_LABO, seg(t, K.joueur), { masque: cb }));
  // ses souvenirs : un point doré de plus à chaque boucle
  const souvenirs = (t >= K.gomme1[1]) + (t >= K.gomme2[1]) + (t >= K.gomme3[1]) + (t >= K.gomme4[1]) + (t >= K.montage[0] ? Math.min(14, Math.floor(seg(t, K.montage) * 14)) : 0);
  for (let i = 0; i < souvenirs; i++) {
    const [hx, hy] = teteDe(LABO_JOUEUR);
    co.fillStyle = OR;
    co.beginPath();
    co.arc(hx - 70 + (i % 10) * 15.5, hy - 46 - Math.floor(i / 10) * 15, 4.2, 0, TAU);
    co.fill();
  }
  // l'accident : des ondes partent de l'anneau, le tableau s'éclaire
  const fAcc = seg(t, K.accident);
  if (fAcc > 0 && fAcc < 1) {
    cb.strokeStyle = CRAIE;
    for (let i = 0; i < 3; i++) {
      const k = clamp(fAcc * 1.6 - i * 0.25);
      if (k <= 0 || k >= 1) continue;
      cb.globalAlpha = 1 - k;
      cb.lineWidth = 4;
      cb.beginPath();
      cb.arc(600, 520, 250 + k * 900, 0, TAU);
      cb.stroke();
    }
    cb.globalAlpha = 1;
  }
  // la porte fermée : un cadre doré autour du joueur
  plume(tracer(co, (() => { const d = new Dessin({ col: OR, w: 5 }); d.rect(LABO_JOUEUR - 105, 735, 210, 160); return d; })(), seg(t, K.porte)));

  // La pizzeria et Alice
  if (t >= K.pizzeria[0]) {
    if (t < K.gomme3[1]) plume(tracer(cb, D_PIZZERIA, seg(t, K.pizzeria)));
    if (t >= K.refait3[0]) tracer(cb, D_PIZZERIA, seg(t, K.refait3), { mode: 'ensemble' });
    // Alice : deux journées identiques, au mot près
    for (const [marcheK, bulleK, fin] of [[K.alice1, K.bulle1, K.gomme3[1]], [K.alice2, K.bulle2, 35.9]]) {
      if (t < marcheK[0] || t >= fin) continue;
      const part = fin < 35 ? 1 : 1 - seg(t, [35.2, 35.9]);
      const [x, dy] = marcheHumain(t, marcheK, 2110, 2380);
      const a = humain(x, SOL - 0.36 * S + dy);
      tracer(cb, a, Math.min(1, seg(t, [marcheK[0], marcheK[0] + 0.5])), { mode: 'ensemble', alpha: part });
      cb.font = `500 26px ${POLICE.mono}`;
      cb.textAlign = 'center';
      cb.fillStyle = CRAIE;
      cb.globalAlpha = seg(t, [marcheK[0] + 0.3, marcheK[0] + 0.7]) * 0.85 * part;
      cb.fillText('ALICE', x, SOL + 40);
      cb.globalAlpha = 1;
      if (t >= bulleK[0]) plume(tracer(cb, bulle(2300, 650, 470, 70, teteDe(2380), { texte: 'Une margherita, s’il vous plaît.' }), seg(t, bulleK), { alpha: part }));
    }
  }

  // La rue de Bob et de Charlie
  if (t >= K.maisons[0]) {
    // après la brosse de la boucle de Charlie, la rue se reforme d'un coup, comme le labo
    const reforme = t < K.gomme4[1] ? 1 : seg(t, K.refait4);
    const ens = t >= K.gomme4[1] && reforme < 1;
    const fM = seg(t, K.maisons) * reforme;
    D_MAISONS.forEach((d, i) => plume(tracer(cb, d, ens ? reforme : clamp(fM * 4 - i), { mode: ens ? 'ensemble' : 'suite' })));
    // les fenêtres des voisins : allumées, et elles s'éteignent quand on tire
    const eteinte = (qui) => {
      if (qui === 0) {
        if (dans(t, [K.noir[0], K.montage[0]])) return seg(t, K.noir);
        if (dans(t, K.montage)) return enMontage(t) ? 1 : 0;
        if (t >= K.noirFinal[0]) return seg(t, K.noirFinal);
        return 0;
      }
      if (dans(t, [K.noir[0], K.montage[0]])) return seg(t, K.noir);
      if (dans(t, K.montage)) return enMontage(t) ? 1 : 0;
      if (dans(t, [K.noirCharlie[0], K.gomme4[1]])) return seg(t, K.noirCharlie);
      if (t >= K.noirFinal[0]) return seg(t, K.noirFinal);
      return 0;
    };
    D_LUMIERES.forEach((d, i) => tracer(cb, d, seg(t, K.lumieres) * reforme, { mode: 'ensemble', alpha: 1 - eteinte(i) }));
    // Bob et Charlie
    for (const [qui, nom] of [[BOB, 'BOB'], [CHARLIE, 'CHARLIE']]) {
      plume(tracer(cb, humain(qui.x), seg(t, K.bobCharlie) * reforme, { mode: ens ? 'ensemble' : 'suite' }));
      cb.font = `500 26px ${POLICE.mono}`;
      cb.textAlign = 'center';
      cb.fillStyle = CRAIE;
      cb.globalAlpha = seg(t, [K.bobCharlie[1] - 0.2, K.bobCharlie[1] + 0.2]) * 0.85;
      cb.fillText(nom, qui.x, SOL + 40);
      cb.globalAlpha = 1;
    }
    // l'argent proposé
    const fB = seg(t, K.billets);
    const billetsVisibles = t < K.montage[0] || t >= K.versBob[0];
    if (fB > 0 && billetsVisibles) for (const qui of [BOB, CHARLIE]) plume(tracer(cb, billet(qui.x + 40, SOL - 120), fB * reforme, { mode: ens ? 'ensemble' : 'suite' }));
    // ce que dit le texte : personne ne les force
    const fN = seg(t, K.note), aN = 1 - seg(t, [K.montage[0], K.montage[0] + 0.5]);
    if (fN > 0 && aN > 0) {
      const d = new Dessin({ w: 3 });
      d.texte('PERSONNE NE LES FORCE', 4110, 320, { taille: 30 });
      d.texte('ni besoin vital · ni pression · ni menace', 4110, 362, { taille: 26 });
      d.poly([[3900, 384], [BOB.x + 20, SOL - 175]], { w: 2.5, al: 0.6 });
      d.poly([[4320, 384], [CHARLIE.x - 20, SOL - 175]], { w: 2.5, al: 0.6 });
      plume(tracer(cb, d, fN, { alpha: aN }));
    }
    // après mûre réflexion : une bulle de pensée et sa petite horloge qui tourne
    const fP = seg(t, K.pensee), aP = 1 - seg(t, [K.pensee[1], K.pensee[1] + 0.4]);
    if (fP > 0 && aP > 0) {
      for (const qui of [BOB, CHARLIE]) {
        const [hx, hy] = teteDe(qui.x), cx = hx + 46, cy = hy - 96;
        const d = new Dessin({ w: 3 });
        d.cercle(hx + 16, hy - 30, 5).cercle(hx + 28, hy - 52, 8).cercle(cx, cy, 34);
        tracer(cb, d, Math.min(1, fP * 3), { alpha: aP });
        const a = -Math.PI / 2 + fP * TAU * 2;
        cb.globalAlpha = aP;
        cb.lineWidth = 3;
        cb.strokeStyle = CRAIE;
        cb.beginPath();
        cb.moveTo(cx, cy);
        cb.lineTo(cx + 22 * Math.cos(a), cy + 22 * Math.sin(a));
        cb.moveTo(cx, cy);
        cb.lineTo(cx + 14 * Math.cos(a / 12 - Math.PI / 2), cy + 14 * Math.sin(a / 12 - Math.PI / 2));
        cb.stroke();
        cb.globalAlpha = 1;
      }
    }
    // les tirs : un trait de craie, de l'épaule vers la fenêtre du voisin
    const trait = (qui, f, al = 1) => {
      if (f <= 0) return;
      const [hx, hy] = teteDe(qui.x), [fx, fy, fw, fh] = FENETRE(...qui.voisin);
      const d = new Dessin({ w: 3.5 });
      d.ligne(hx + 30, hy + 12, fx + fw / 2, fy + fh / 2);
      plume(tracer(cb, d, f, { alpha: al }));
    };
    const aTir = 1 - seg(t, [K.noir[1] + 0.6, K.montage[0]]);
    if (dans(t, [K.tirs[0], K.montage[0]])) { trait(BOB, seg(t, K.tirs), aTir); trait(CHARLIE, seg(t, K.tirs), aTir); }
    if (dans(t, K.montage) && enMontage(t)) { trait(BOB, 1, 0.8); trait(CHARLIE, 1, 0.8); }
    // Bob : le joueur vient lui parler ; Bob refuse, le billet est barré
    if (dans(t, [K.joueurBob[0], K.versCharlie[1]])) {
      const [x, dy] = marcheHumain(t, K.joueurBob, 3200, 3335);
      const al = 1 - seg(t, [K.versCharlie[0], K.versCharlie[0] + 0.6]);
      tracer(co, humain(x, SOL - 0.36 * S + dy, { col: OR }), Math.min(1, seg(t, [K.joueurBob[0], K.joueurBob[0] + 0.4])), { mode: 'ensemble', alpha: al, masque: cb });
      if (t >= K.paroleBob[0]) plume(tracer(co, bulle(3232, 712, 132, 54, teteDe(3335), { col: OR, points: true }), seg(t, K.paroleBob), { alpha: al, masque: cb }));
      const d = new Dessin({ w: 4.5 });
      d.ligne(BOB.x + 32, SOL - 128, BOB.x + 114, SOL - 76).ligne(BOB.x + 114, SOL - 128, BOB.x + 32, SOL - 76);
      plume(tracer(cb, d, seg(t, K.refus), { alpha: al }));
    }
    // Charlie : le joueur lui parle ; rien n'y fait. Puis, la boucle d'après, il le retient de force
    if (dans(t, [K.joueurCharlie[0], K.versLabo[1]])) {
      const [x, dy] = marcheHumain(t, K.joueurCharlie, 4500, 4635);
      const al = 1 - seg(t, [K.versLabo[0], K.versLabo[0] + 0.6]);
      tracer(co, humain(x, SOL - 0.36 * S + dy, { col: OR }), Math.min(1, seg(t, [K.joueurCharlie[0], K.joueurCharlie[0] + 0.4])), { mode: 'ensemble', alpha: al, masque: cb });
      if (dans(t, [K.paroleCharlie[0], K.gomme4[0]])) plume(tracer(co, bulle(4532, 712, 132, 54, teteDe(4635), { col: OR, points: true }), seg(t, K.paroleCharlie), { alpha: al * (1 - seg(t, [K.gomme4[0] - 0.4, K.gomme4[0]])), masque: cb }));
      if (dans(t, [K.tirCharlie[0], K.gomme4[1]])) trait(CHARLIE, seg(t, K.tirCharlie));
      if (t >= K.cordes[0]) {                      // les cordes : trois anneaux dorés autour de Charlie
        const [hx, hy] = teteDe(CHARLIE.x), d = new Dessin({ col: OR, w: 4.5 });
        for (let i = 0; i < 3; i++) d.arc(CHARLIE.x, hy + 32 + i * 14, 46, 10, 0, TAU);
        d.ligne(4635 + 28, hy + 40, CHARLIE.x - 46, hy + 46);
        plume(tracer(co, d, seg(t, K.cordes), { alpha: al }));
      }
    }
    // le dernier jour : ils tirent
    if (t >= K.tirsFinal[0]) { trait(BOB, seg(t, K.tirsFinal)); trait(CHARLIE, seg(t, K.tirsFinal)); }
  }
}
// Le montage : des centaines de boucles en accéléré ; dans chacune, à 21 h, la fenêtre s'éteint
function enMontage(t) {
  const k = seg(t, K.montage), n = lerp(0, 60, Math.pow(k, 1.6)), p = n - Math.floor(n);
  return p > 0.62 && p < 0.97;
}

// --- La question, à la fin : écrite à la craie, par la plume ----------------------------------
function question(c, t, pointes) {
  for (const [texte, k, y, taille] of [['Bob a-t-il agi librement ?', K.q1, 470, 86], ['Et Charlie ?', K.q2, 610, 86]]) {
    const f = seg(t, k);
    if (f <= 0) continue;
    c.save();
    c.font = `600 ${taille}px ${POLICE.inter}`;
    c.textAlign = 'center';
    const w = c.measureText(texte).width, x0 = W / 2 - w / 2, x = x0 + w * f;
    c.beginPath();
    c.rect(0, 0, x, H);
    c.clip();
    c.fillStyle = CRAIE;
    c.fillText(texte, W / 2, y);
    c.restore();
    if (f < 1) pointes.push({ p: [x, y - taille * 0.35], ecran: true, cle: texte, i: 0, s: x });
  }
  const fT = seg(t, K.titre);
  if (fT > 0) {
    c.font = `500 30px ${POLICE.mono}`;
    c.textAlign = 'center';
    c.fillStyle = CRAIE;
    c.globalAlpha = fT * 0.75;
    c.fillText('XPHI · LA BOUCLE · ESSAI', W / 2, H - 90);
    c.globalAlpha = 1;
  }
}

// --- L'image de l'instant t ------------------------------------------------------------------
// Ce que fait la plume à l'instant t (tools/rendre-film.cjs en tire le son : la craie qui gratte)
const ETAT = { plume: false, x: 0, y: 0, cle: '', i: 0, s: 0 };
function composer(t) {
  const m = camera(t);
  for (const c of [cb, co, cs]) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); c.lineCap = 'round'; c.lineJoin = 'round'; }
  const pointes = [];
  scenes(t, m, pointes);
  // la brosse efface la craie blanche (le doré reste : c'est la mémoire du joueur)
  for (const g of BROSSES) if (dans(t, g)) effacer(cb, bordBrosse(t, g));
  // après la brosse finale, le monde n'est plus dessiné
  if (t >= K.gommeFinale[1]) { cb.setTransform(1, 0, 0, 1, 0, 0); cb.clearRect(0, 0, W, H); co.setTransform(1, 0, 0, 1, 0, 0); co.clearRect(0, 0, W, H); }
  // la surimpression : le cadran (jusqu'à la brosse finale), puis la question
  cs.setTransform(1, 0, 0, 1, 0, 0);
  if (t < K.gommeFinale[1]) {
    dessinerCadran(cs, t, pointes);
    if (dans(t, K.gommeFinale)) effacer(cs, bordBrosse(t, K.gommeFinale));
  }
  question(cs, t, pointes);
  grainer(cb, m);
  grainer(co, m);
  grainer(cs, { z: 1, ox: 0, oy: 0 });

  // le tableau
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = ARDOISE;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.setTransform(m.z * 2, 0, 0, m.z * 2, m.ox, m.oy - HAUT_ARDOISE * m.z);
  ctx.drawImage(ardoise, 0, 0);
  ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,.5)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  // l'accident éclaire le tableau
  const fl = seg(t, K.accident);
  if (fl > 0 && fl < 1) { ctx.fillStyle = `rgba(237,230,213,${0.22 * Math.sin(Math.PI * Math.min(1, fl * 2.2))})`; ctx.fillRect(0, 0, W, H); }
  // la craie : un léger halo, puis le trait
  const voile = 1 - 0.68 * Math.min(seg(t, [K.grandit[0] - 0.3, K.grandit[1]]), 1 - seg(t, [K.versRue[0], K.versRue[0] + 0.8]));
  ctx.filter = 'blur(3px)';
  ctx.globalAlpha = 0.32 * voile;
  ctx.drawImage(LB, 0, 0);
  ctx.drawImage(LO, 0, 0);
  ctx.globalAlpha = 0.32;
  ctx.drawImage(LS, 0, 0);
  ctx.filter = 'none';
  ctx.globalAlpha = voile;
  ctx.drawImage(LB, 0, 0);
  ctx.drawImage(LO, 0, 0);
  ctx.globalAlpha = 1;
  ctx.drawImage(LS, 0, 0);
  // la brosse
  for (const g of BROSSES) if (dans(t, g)) dessinerBrosse(ctx, bordBrosse(t, g), t);
  // l'œil de Phi : à la pointe de la plume quand il dessine, sinon en haut à droite, qui regarde
  const actif = pointes.length ? pointes[pointes.length - 1] : null;
  const repos = [W - 120, 128];
  const ou = actif ? (actif.ecran ? actif.p : versEcran(m, actif.p)) : repos;
  Object.assign(ETAT, { plume: !!actif, x: Math.round(ou[0]), y: Math.round(ou[1]), cle: actif ? actif.cle : '', i: actif ? actif.i : 0, s: actif ? Math.round(actif.s * 10) / 10 : 0 });
  const aO = seg(t, [0.1, 0.8]) * (1 - seg(t, [DUREE - 1.2, DUREE - 0.2]));
  oeil(ctx, ou[0], ou[1], actif ? 30 : 36, t, { look: actif ? [0, 0.12 * 30] : null, alpha: aO });
  legende(ctx, t);
}

// --- Le son (son.mp3) : s'il est là, il joue avec l'image, et c'est lui qui donne l'heure ------------
let sonTampon = null, audio = null, source = null, debutSon = 0;
if (!RENDU) {
  fetch('son.mp3').then((r) => (r.ok ? r.arrayBuffer() : null))
    .then((ab) => ab && new OfflineAudioContext(2, 1, 48000).decodeAudioData(ab))
    .then((b) => { sonTampon = b || null; }).catch(() => {});
}
function sonCoupe() { if (source) { try { source.stop(); } catch { /* déjà arrêté */ } source.disconnect(); source = null; } }
function sonJoue(t) {
  sonCoupe();
  if (!sonTampon || t >= sonTampon.duration) return;
  audio = audio || new AudioContext();
  audio.resume();
  source = audio.createBufferSource();
  source.buffer = sonTampon;
  source.connect(audio.destination);
  source.start(0, t);
  debutSon = audio.currentTime - t;
}

// --- La lecture ----------------------------------------------------------------------------------
const lecture = document.getElementById('lecture'), curseur = document.getElementById('curseur'), affiche = document.getElementById('temps');
let t0 = null, tPause = params.has('t') ? +params.get('t') : 0, joue = false;
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function image(t) {
  composer(t);
  affiche.textContent = `${fmt(t)} / ${fmt(DUREE)}`;
  curseur.value = Math.round((1000 * t) / DUREE);
}
function boucleLecture(now) {
  if (!joue) return;
  const t = source ? audio.currentTime - debutSon : (now - t0) / 1000;
  if (t >= DUREE) { joue = false; sonCoupe(); lecture.textContent = 'Lecture'; tPause = 0; image(DUREE - 0.01); return; }
  tPause = t;
  image(t);
  requestAnimationFrame(boucleLecture);
}
function basculer() {
  joue = !joue;
  lecture.textContent = joue ? 'Pause' : 'Lecture';
  if (joue) { t0 = performance.now() - tPause * 1000; sonJoue(tPause); requestAnimationFrame(boucleLecture); } else sonCoupe();
}
lecture.addEventListener('click', basculer);
toile.addEventListener('click', basculer);
document.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); basculer(); } });
curseur.addEventListener('input', () => { tPause = (curseur.value / 1000) * DUREE; if (joue) { t0 = performance.now() - tPause * 1000; sonJoue(tPause); } else image(tPause); });
let calme;
document.addEventListener('pointermove', () => { document.documentElement.classList.remove('calme'); clearTimeout(calme); calme = setTimeout(() => joue && document.documentElement.classList.add('calme'), 2500); });

if (RENDU) document.documentElement.classList.add('rendu');
Promise.all([document.fonts.load(`500 38px ${POLICE.inter}`), document.fonts.load(`600 86px ${POLICE.inter}`), document.fonts.load(`500 30px ${POLICE.mono}`)]).then(() => {
  if (params.has('t') || RENDU) image(tPause);
  else { composer(AFFICHE); affiche.textContent = `${fmt(0)} / ${fmt(DUREE)}`; }
  window.film = { duree: DUREE, image: (t) => { composer(t); return { ...ETAT }; }, pret: true, K, brosses: BROSSES, aiguille: AIGUILLE, largeur: W };
});
