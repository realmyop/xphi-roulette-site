/* ==========================================================================
   Les deux pilules, le film — plans/europe-carte.js : l'Europe en points

   La carte de P14–P15 (lot europe) : une grille de points de 12 px tirée de
   Natural Earth (europe.js, globalThis.EUROPE), la terre en points GRIS_FIG à
   25 %, la mer vide ; et UN POINT DE 3 × 3 PX PAR PARTICIPANT (4 457), posé
   dans son pays, avec exactement les effectifs et les bleues de la table par
   pays (données fictives, EUROPE.donnees). Chaque participant p (l'ordre
   d'arrivée de la constellation, P13) reçoit, par un tirage à graine fixe :
   son pays, sa description (collective ou individuelle), son choix ; le N°48
   (p = 47) a lu l'individuelle et pris la bleue (P17 le révèle), mais rien
   ne dit où il habite : ses crochets s'effacent en chemin.

   Le minutage S du lot (P14–P16) est ici : la carte en dépend image par image.
   Tout est fonction du temps : la place, la couleur et la lumière de chaque
   point se calculent de t et de ses tirages (hache), sans mémoire.
   Les points sont dessinés par lots de même couleur et même alpha (une
   fillStyle par lot), en quatre couches entrelacées (le rouge et le bleu
   alternent : aucune couleur ne recouvre l'autre là où les points se serrent).
   ========================================================================== */
import {
  CRAIE, GRIS, GRIS_FIG, LABO, LAITON, BLEU, ROUGE, clamp, lerp, seg, eIO, eOut, lisse, rng, hache, cadre,
  placeParticipant, CAM_CONSTELLATION, N48,
} from '../commun.js';
import { PARTICIPANTS } from '../donnees.js';

// ================================================================ le minutage du lot (SCENARIO.md, P14–P16 ; les mots de R22–R26)
export const S = Object.freeze({
  // P14 · L'Europe
  envol: 118.6,                 // les points quittent la constellation, pays par pays (dans l'ordre des effectifs)
  pasPays: .05,                 // le décalage d'un pays à l'autre
  posees: 120.4,                // tous posés
  fenetre: 120.0,               // la fenêtre PAYS s'ouvre
  couleurs: 120.4,              // la collective prend ses couleurs, l'individuelle baisse à 8 %
  lignes: 120.55, pasLigne: .13, // les lignes de la fenêtre se remplissent
  bleue: 122.7,                 // « partout, la bleue » (R22)
  lueur: 122.6, lueurFin: 124.2, // la lueur LABO passe d'ouest en est : tout le monde vit
  retape: 125.0,                // « PAYS · DESCRIPTION INDIVIDUELLE »
  vague: 125.4, vagueFin: 127.2, // la vague d'ouest en est vers l'individuelle
  rouge: 126.2,                 // « Et l'autre : partout, la rouge. » (R23)
  // P15 · Deux phrases
  ecart: 129.0,                 // la fenêtre devient ÉCART (le titre se retape, les barres poussent)
  neutre: 129.4, neutreFin: 131.6, // la carte redevient neutre, du nord au sud ; les frontières s'effacent (la fermeture éclair)
  fermeFenetre: 131.7,          // la fenêtre se replie (la place est libre à droite quand la carte se dédouble)
  tri: 131.8, triFin: 132.95,   // « La vraie frontière » : la carte se dédouble ; chacun va dans l'Europe de la description
                                // qu'il a lue (DEUX : la collective à gauche, l'individuelle à droite, chacune entière)
  filet: 132.8, filetFin: 133.6, // « frontière » : le filet laiton descend en x 960, ENTRE les deux Europes
  tetes: 133.9,                 // « DESCRIPTION / COLLECTIVE » à gauche, « … INDIVIDUELLE » à droite : on comprend le tri
  phrases: 135.3,               // « elle sépare deux phrases » : les points vont écrire les deux descriptions
  ecrit: 135.95, ecritFin: 136.85, // les descriptions s'écrivent (les points arrivent sous la plume)
  effaceCarte: 135.3, effaceCarteFin: 136.1,
  remonte: 137.6, remonteFin: 138.4, // le filet remonte ; l'œil vient au centre
  // P16 · Les deux salles : le minutage de la slide et des gestes de Phi est dans europe-salles.js (MINUTAGE)
});

// ================================================================ les deux Europes du tri (P15), en pixels de l'écran
// « La vraie frontière ne sépare pas deux pays » : on ne coupe jamais la géographie. Au tri, la carte se dédouble en deux
// Europes entières à ×0,5, une de chaque côté du filet : à gauche les seuls lecteurs de la collective, à droite les seuls
// lecteurs de l'individuelle. Chaque pays est des deux côtés ; la frontière sépare deux phrases. (Une première version
// coupait la carte à sa médiane, pile sur la frontière franco-allemande : l'image disait le contraire de la phrase.)
// Les centres (520 et 1400, symétriques autour de 960) laissent libres les colonnes des descriptions (x < 313, x > 1606).
export const DEUX = Object.freeze({ x: Object.freeze([520, 1400]), y: 430, ech: .5 });

// ================================================================ la carte et les participants (une fois, à la première image)
const PAS = 12;
let D = null;
export function carte(E = globalThis.EUROPE) {
  if (D || !E) return D;
  const N = PARTICIPANTS, dn = E.donnees, X0 = E.ecran.x, Y0 = E.ecran.y;
  // ---- les places : (pays, description, choix), autant que la table en compte
  const slots = [];
  const ajoute = (c, d, b, n) => { for (let i = 0; i < n; i++) slots.push(c * 4 + d * 2 + b); };
  for (const c of dn.ordre) {
    const P = dn.parPays[c];
    ajoute(c, 0, 1, P.collective.bleues); ajoute(c, 0, 0, P.collective.n - P.collective.bleues);
    ajoute(c, 1, 1, P.individuelle.bleues); ajoute(c, 1, 0, P.individuelle.n - P.individuelle.bleues);
  }
  // les « autres pays » : 104 et 104, répartis entre sept pays (la répartition d'europe.js, jamais affichée)
  const A = dn.autres, aut = [];
  for (const [d, x] of [[0, A.collective], [1, A.individuelle]]) { for (let i = 0; i < x.n; i++) aut.push(d * 2 + (i < x.bleues ? 1 : 0)); }
  melange(aut, rng(4807));
  let ia = 0;
  for (const [c, n] of Object.entries(A.repartition)) for (let i = 0; i < n; i++) slots.push(+c * 4 + aut[ia++]);
  if (slots.length !== N) console.warn(`[europe] ${slots.length} places pour ${N} participants`);
  melange(slots, rng(2168));
  // le N°48 a lu l'individuelle et pris la bleue (P10, P17) : s'il n'est pas tombé dessus, il échange avec le premier qui l'a
  if ((slots[N48] & 3) !== 3) { const q = slots.findIndex((v, i) => i !== N48 && (v & 3) === 3); [slots[N48], slots[q]] = [slots[q], slots[N48]]; }

  const pays = new Uint8Array(N), desc = new Uint8Array(N), bleue = new Uint8Array(N), rang = new Uint8Array(N);
  const rangDe = new Map(dn.ordre.map((c, i) => [c, i]));
  for (let p = 0; p < N; p++) { const v = slots[p]; pays[p] = v >> 2; desc[p] = (v >> 1) & 1; bleue[p] = v & 1; rang[p] = rangDe.has(pays[p]) ? rangDe.get(pays[p]) : dn.ordre.length; }

  // ---- la place de chacun dans son pays : une case fine (4 px) tirée par strate, puis un décalage de 0 à 2 px
  const mx = new Float32Array(N), my = new Float32Array(N);
  const parPays = new Map();
  for (let p = 0; p < N; p++) { if (!parPays.has(pays[p])) parPays.set(pays[p], []); parPays.get(pays[p]).push(p); }
  for (const [c, L] of parPays) {
    const F = E.fin.casesDe(c), m = F.length, n = L.length;
    L.forEach((p, j) => {
      const k = F[Math.min(m - 1, Math.floor((j + hache(p * 13 + 5)) * m / n))];
      mx[p] = X0 + k[0] * E.fin.pas + Math.floor(hache(p * 7 + 1) * 3);
      my[p] = Y0 + k[1] * E.fin.pas + Math.floor(hache(p * 7 + 2) * 3);
    });
  }
  // ---- la carte neutre (P15) n'est plus qu'un continent : la lumière d'un point y est divisée par la densité de son
  // pays, rapportée à celle du plus grand effectif (la France). Sans cela, la Belgique (1 236 points sur 145 cases :
  // 2,3 fois la densité française) restait une tache blanche au moment où les pays ne comptent plus, et le
  // Luxembourg (236 sur 12) plus encore. densite[c] : participants par case fine ; neutre[c] : le facteur (≤ 1).
  const densite = new Float32Array(64), neutre = new Float32Array(64).fill(1);
  for (const [c, L] of parPays) densite[c] = L.length / Math.max(1, E.fin.casesDe(c).length);
  const densRef = densite[dn.ordre[0]];
  for (const [c] of parPays) neutre[c] = Math.min(1, densRef / densite[c]);
  // ---- la constellation (fin de P13) : écran = (monde − (150, 329)) · 0,245 + (62, 230), un carré 3 × 3 centré
  // (le calcul même de P13, lot isoloir : w · z + o, pour tomber sur les mêmes pixels)
  const kx = new Float64Array(N), ky = new Float64Array(N);
  for (let p = 0; p < N; p++) { const w = placeParticipant(p); kx[p] = w.x * CAM_CONSTELLATION.z + CAM_CONSTELLATION.ox; ky[p] = w.y * CAM_CONSTELLATION.z + CAM_CONSTELLATION.oy; }
  // ---- les tirages de chacun (hache, une fois)
  const h = i => { const a = new Float32Array(N); for (let p = 0; p < N; p++) a[p] = hache(p * 977 + i * 7919 + 13); return a; };
  const H = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(h);
  // l'envol : le pays (rang), un peu de hasard ; la durée ; l'arc
  const t0 = new Float32Array(N), dur = new Float32Array(N);
  for (let p = 0; p < N; p++) { t0[p] = S.envol + rang[p] * S.pasPays + H[0][p] * .2; dur[p] = 1.0 + H[1][p] * .12; }
  // les quatre couches entrelacées
  const couche = new Uint8Array(N); for (let p = 0; p < N; p++) couche[p] = Math.floor(H[8][p] * 4);

  // ---- la terre : une case de 12 px = un point ; les bords de la grille s'effacent (la grille s'arrête net à l'est et au sud)
  const terre = [];
  let tx0 = Infinity, tx1 = -Infinity, ty0 = Infinity, ty1 = -Infinity;
  for (let y = 0; y < E.hauteur; y++) for (let x = 0; x < E.largeur; x++) {
    const c = E.case(x, y); if (!c) continue;
    const d = Math.min(x + 3, E.largeur - 1 - x, y + 3, E.hauteur - 1 - y);
    const wx = X0 + x * PAS + PAS / 2, wy = Y0 + y * PAS + PAS / 2;
    terre.push({ x: wx, y: wy, c, bord: lisse(clamp(d / 7)), h: hache(x * 131 + y * 977 + 5) });
    tx0 = Math.min(tx0, wx); tx1 = Math.max(tx1, wx); ty0 = Math.min(ty0, wy); ty1 = Math.max(ty1, wy);
  }
  // ---- le tri (P15) : chacun va, dans l'Europe de sa description (DEUX), à sa place réduite : même pays, même place
  // dans le pays. Le centre de la terre vient au centre de chaque copie. gx, gy : en pixels de l'écran.
  const cx = (tx0 + tx1) / 2, cy = (ty0 + ty1) / 2, deux = (w, cote) => DEUX.x[cote] + (w - cx) * DEUX.ech;
  const gx = new Float32Array(N), gy = new Float32Array(N);
  for (let p = 0; p < N; p++) { gx[p] = deux(mx[p], desc[p]); gy[p] = DEUX.y + (my[p] - cy) * DEUX.ech; }
  for (const c of terre) { c.gx = [deux(c.x, 0), deux(c.x, 1)]; c.gy = DEUX.y + (c.y - cy) * DEUX.ech; }
  // ---- les frontières (entre deux pays) et les côtes, en pixels du monde ; la fermeture éclair va du nord au sud
  const traits = E.traits.map(T => {
    const pts = []; for (let i = 0; i < T.pts.length; i += 2) pts.push(X0 + T.pts[i] * PAS, Y0 + T.pts[i + 1] * PAS);
    let sy = 0; for (let i = 1; i < pts.length; i += 2) sy += pts[i];
    const ymoy = sy / (pts.length / 2);
    const exp = c => c >= 1 && c <= 17;   // les pays de l'expérience (europe.js : codes 1 à 17)
    return { a: T.a, b: T.b, pts, ymoy, exp: exp(T.a) || exp(T.b), tz: S.neutre + clamp((ymoy - Y0) / (E.hauteur * PAS)) * 1.9 };
  });
  // ---- les centres des dix pays de la fenêtre (pour la vague, la lueur, le regard)
  const centre = c => { const k = E.centroides[c]; return k ? { x: X0 + k[0] * PAS, y: Y0 + k[1] * PAS } : null; };
  D = { E, N, pays, desc, bleue, rang, mx, my, kx, ky, H, t0, dur, couche, gx, gy, terre, traits, centre, densite, neutre, X0, Y0, W: E.largeur * PAS, Hh: E.hauteur * PAS };
  return D;
}
function melange(a, R) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ================================================================ la caméra de la carte (P14–P15)
// P14 : une lente poussée ×1 → ×1,05 ; P15 : tenue (au tri, les points et la terre vont aux deux Europes de DEUX, en
// pixels de l'écran : la caméra ne bouge plus).
export function cameraCarte(T) {
  const A = [620, 410, 620, 410, 1], B = [612, 410, 620, 410, 1.05];
  if (T <= S.envol) return cadre(...A);
  if (T <= 128.8) {
    const k = eIO(seg(T, S.envol, 128.8));
    return cadre(lerp(A[0], B[0], k), lerp(A[1], B[1], k), A[2], A[3], k >= 1 ? B[4] : Math.exp(lerp(Math.log(A[4]), Math.log(B[4]), k)));
  }
  return cadre(...B);
}

// ================================================================ le pinceau : des carrés rangés par couleur et par alpha
// Une clé = (couche, couleur, alpha) ; dessiner = une fillStyle et un globalAlpha par clé, puis des fillRect entiers.
// Le plus coûteux du film (~24 000 carrés par image en P14–P15). Pas optimisé : sur le PC de Ronan (RTX 3070),
// 13–14 ms par image en médiane, 31 ms pour 95 % des images, sous les 40 ms d'une image (README, film des pilules).
export const COULEURS = Object.freeze([GRIS_FIG, ROUGE, BLEU, CRAIE, LABO, GRIS, LAITON]);
export const C_GRIS = 0, C_ROUGE = 1, C_BLEU = 2, C_CRAIE = 3, C_LABO = 4;
const NA = 33, NC = COULEURS.length, NK = 4 * NC * NA;
export class Pinceau {
  constructor(n) { this.x = new Int16Array(n); this.y = new Int16Array(n); this.s = new Uint8Array(n); this.k = new Uint16Array(n); this.o = new Uint32Array(n); this.c = new Uint32Array(NK + 1); this.n = 0; }
  vide() { this.n = 0; }
  // (x, y) : le coin haut gauche, s : le côté, couleur : un indice de COULEURS, a : l'alpha (0..1), couche : 0..3
  pose(x, y, s, couleur, a, couche = 0) {
    if (a <= .004 || this.n >= this.x.length) return;
    const i = this.n++;
    this.x[i] = Math.round(x); this.y[i] = Math.round(y); this.s[i] = s;
    this.k[i] = (couche * NC + couleur) * NA + Math.min(NA - 1, Math.round(a * (NA - 1)));
  }
  dessine(ctx, mult = 1) {
    const n = this.n, c = this.c; if (!n) return;
    c.fill(0);
    for (let i = 0; i < n; i++) c[this.k[i] + 1]++;
    for (let k = 0; k < NK; k++) c[k + 1] += c[k];
    for (let i = 0; i < n; i++) this.o[c[this.k[i]]++] = i;
    let k0 = -1;
    for (let j = 0; j < n; j++) {
      const i = this.o[j], k = this.k[i];
      if (k !== k0) { k0 = k; const a = k % NA, col = Math.floor(k / NA) % NC; ctx.fillStyle = COULEURS[col]; ctx.globalAlpha = Math.min(1, a / (NA - 1) * mult); }
      const s = this.s[i]; ctx.fillRect(this.x[i], this.y[i], s, s);
    }
    ctx.globalAlpha = 1;
  }
}
