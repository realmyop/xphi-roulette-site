/* ==========================================================================
   Les deux pilules, le film — plans/isoloir.js : le lot « isoloir »
   P11–P13, de 86,8 à 118,6 s : le test, le choix, la constellation.

   Ronan : « Tu peux faire différents plans, concevoir une petite histoire pour
   rendre ça plus vivant et qu'il y ait un peu d'émotion. » Ici, le cœur
   intime du film : le N°48 se trompe au test (comme un sur douze), on
   lui réexplique, il comprend ; il hésite quatre minutes, relit deux fois,
   regarde Phi, qui ne lui souffle rien ; il choisit, et Phi ne regarde pas,
   par politesse. Puis le recul le perd parmi plus de quatre mille participants.

   Un seul décor, l'isoloir d'index.html (fouleCamera, CAM : le N°48 (525, 484)
   en (650, 470) à ×4,2), sur les cent premiers participants (PREMIERS) ; les
   trois plans n'en sont que des moments : scene(t) dessine tout, une seule
   caméra traverse le lot (×4,2 → ×2 → ×4,2 → ×5 → ×1 → ×0,245), rien ne saute
   aux frontières. Tout est fonction du temps absolu t (hache à graines fixes,
   creeRegard de commun.js) : aucun état d'une image à l'autre.

   On ne voit JAMAIS la couleur du N°48 : il saute gris, un éclair de craie
   remplit l'isoloir au sommet du saut, il retombe gris ; ses deux pilules
   s'éteignent sans éclater. Son choix (bleue) n'est révélé qu'en P17.

   Raccords :
   - entrée : coupe franche à 86,8 s (le lot regles finit sur la fenêtre
     individuelle et le petit N°48) ;
   - sortie : à 118,6 s, la constellation entière et immobile (SCENARIO.md, fin
     de P13) : écran = (monde − (150, 329)) · 0,245 + (62, 230)
     (CAM_CONSTELLATION) ; pour chaque participant p, un carré 3 × 3 GRIS_FIG
     (α 0,9) au point placeParticipant(p), posé au pixel :
       fillRect(round(x − 1,5), round(y − 1,5), 3, 3) ;
     le N°48 (p = 47) dans ses crochets (crochets(ctx, x, y, 0,245)) ;
     « 4 457 PARTICIPANTS » (DotGothic16 40 px, CRAIE, centré en (960, 170)) ;
     « J10 · 4 457 » (Plex Mono 22 px, GRIS, en (62, 190)) ; l'œil en (1560,
     84, 100), neutre, qui regarde (960, 520) ; le fond du laboratoire sans sol
     (fond(ctx, t, { sol: 0 })) ; pas de cartouche (la surimpression).
   Le carnet du coin (note 0003, 109,8 s) est à la surimpression : le coin haut
   droit est libre à partir de 109,4.

   Essais : index.html?plan=isoloir (le lot en boucle), ?plan=P12, ?t=107.5.
   ========================================================================== */
import {
  CRAIE, GRIS, GRIS_FIG, LABO, LAITON, ROUGE_TXT, FILET, MONO, PIX, NB,
  clamp, lerp, seg, cloche, eIO, eOut, eBack, lisse, cles, hache, mix, rgba,
  fr, balise, coupe, coupeBalise, ecrit, nombre, pc, texteSignes,
  fond, fenetre, tampon, pilule, humeur, oeil, creeRegard, VOUS, point, cligne,
  dessineSujet, PREMIERS, MAUVAIS, N48, participant, placeParticipant, CONSTELLATION, TUILES_RANG,
  crochets, cadre, toile, W, H,
} from '../commun.js';
import { REPLIQUES, DESCRIPTIONS, cite, ecrits, NOTES } from '../texte.js';
import { PARTICIPANTS, TEST, ERREURS, COLLECTE, N48 as LE48, pct } from '../donnees.js';

export const LOT = { id: 'isoloir', de: 86.8, a: 118.6 };

// ================================================================ les mots dits, et quand ils s'écrivent
// Les gestes tombent sur les mots : l'instant où la réplique a écrit le premier caractère du mot (texte.js écrit au
// rythme de la parole, 13 car./s), cherché par dichotomie sur ecrits() ; mémorisé (il ne dépend que du texte). Si un
// mot disparaît de texte.js, l'instant du scénario sert de secours.
const REP = id => REPLIQUES.find(r => r.id === id);
const texteDe = r => balise(r.txt).map(l => l.map(s => s.s).join('')).join('');
const MOTS = new Map();
function motA(id, mot, secours) {
  const cle = `${id}|${mot}`;
  if (MOTS.has(cle)) return MOTS.get(cle);
  let v = secours;
  try {
    const r = REP(id), txt = r ? texteDe(r) : '', i = txt.indexOf(mot);
    if (r && i >= 0) {
      const k = [...txt.slice(0, i)].length + 1;
      let a = r.de - 1e-6, b = r.a;
      if (ecrits(r, b - 1e-6) >= k) { for (let j = 0; j < 40; j++) { const m = (a + b) / 2; if (ecrits(r, m) >= k) b = m; else a = m; } v = b; }
    }
  } catch (e) { v = secours; }
  MOTS.set(cle, v);
  return v;
}

// ================================================================ le minutage (SCENARIO.md, P11–P13)
const S = Object.freeze({
  // P11 · le test
  coupe: 86.8,
  boutons: 86.95,                                  // les quatre réponses arrivent (index.html : eBack, décalées de 0,08 s)
  choix1: 87.8,                                    // son cadre laiton se pose sur « Tout le monde vit. »
  faux: motA('R17', 'Il se trompe', 88.6),         // ✗ ; Phi l'a mesuré juste avant (le trait LABO, 0,3 s)
  stats: motA('R17', 'un sur douze', 90.05) - .05, // « au moins une erreur au test » / « 8,3 % se trompent »
  releve: 92.8,                                    // il ne baisse plus les yeux : il relit sa description
  reexplique: motA('R18', 'réexplique', 93.1),     // sa description pulse et se réécrit d'un trait
  q2: 93.8,                                        // une autre question (40 / 60)
  choix2: 94.4,                                    // son cadre sur la bonne réponse
  juste: motA('R18', 'c’est juste', 95.0),         // ✓ et l'éclair de la correction ; Phi grand une seconde
  recul: 96.0, reculFin: 96.8,                     // ×4,2 → ×2 : ses voisins, leurs ✓
  corrige: 96.4,                                   // les quatre corrigés passent de ✗ à ✓ (96,4–97,0)
  tampon: 97.4,                                    // « 4 457 / 4 457 ONT COMPRIS »
  // P12 · le choix
  p12: 98.4, retourFin: 99.2,                      // ×2 → ×4,2 : l'isoloir privé
  horloge: 98.8,                                   // 23:44:02 (l'ouverture de son choix)
  relit1: 99.8, relit2: motA('R19', 'Deux fois', 100.4),
  emballe: motA('R19', 'Quatre', 101.2) + .2, emballeFin: 103.6,   // « Quatre minutes passent » : l'horloge s'emballe
  regardePhi: 104.0, baisse: 104.8,                // il regarde Phi ; Phi baisse l'œil ; il baisse la tête
  detourne: motA('R20', 'Je ne regarde', 107.3),   // Phi détourne les yeux et se plisse en fente
  silence: 107.4,                                  // tout se tait
  accroupi: 107.8, saut: 108.04,                   // il s'accroupit ; le saut (t0 de dessineSujet : en l'air à 108,0)
  eclair: 108.15, eclairFin: 108.3,                // l'éclair de craie, au sommet ; l'horloge s'arrête : 23:48:19
  point: 108.6,                                    // il est retombé, gris : un « ? »
  descFin: 109.4, oeilRevient: 109.6,              // le coin haut droit se libère (le carnet tape 0003 à 109,8)
  cadenas: 110.0,                                  // les « ? » deviennent des cadenas, de proche en proche
  recul2: 110.4, recul2Fin: 111.8,                 // ×5 → ×1 : toute la salle des cent premiers
  // P13 · la constellation
  tuiles: 112.0, tuilesFin: 116.0,                 // les 45 tuiles, dans l'ordre d'arrivée
  glisse: 112.4, glisseFin: 113.6,                 // l'œil glisse de (650, 160, 160) à (1560, 84, 100)
  vingt: motA('R21', 'quatre mille', 113.7),       // il regarde le champ
  champ: 114.4,                                    // ×0,245 : la caméra ne bouge plus
  titre: 116.2,                                    // « 4 457 PARTICIPANTS »
  fin: 118.6,
});

// ================================================================ la caméra : une seule pour le lot
// [t, wx, wy, sx, sy, z, easing du segment qui y mène] : « le point (wx, wy) du monde en (sx, sy) à ×z », le zoom en
// échelle logarithmique. Au recul ×2 (P11), le N°48 descend un peu (650, 530) : le tampon (636, 400) tombe sur ses
// voisins, pas sur lui.
const CAM = [
  [S.coupe, 525, 484, 650, 470, 4.2],
  [S.juste, 525, 484, 650, 470, 4.32, lisse],     // le test : une poussée à peine sensible (il est seul avec la question)
  [S.recul, 525, 484, 650, 470, 4.32],
  [S.reculFin, 525, 484, 650, 530, 2],
  [S.p12, 525, 484, 650, 530, 2],
  [S.retourFin, 525, 484, 650, 470, 4.2],
  [109.0, 525, 484, 650, 466, 5, lisse],          // la très lente poussée (×4,2 → ×5)
  [S.recul2, 525, 484, 650, 466, 5],
  [S.recul2Fin, 525, 484, 525, 484, 1],           // ×1 : la composition d'index.html (l'identité)
  [S.recul2Fin, 150, 329, 150, 329, 1],           // (la même image, un autre point fixe : le coin de la tuile 0)
  [S.champ, CONSTELLATION.wx, CONSTELLATION.wy, CONSTELLATION.sx, CONSTELLATION.sy, CONSTELLATION.z],
];
function camLot(T) {
  let i = 0;
  while (i < CAM.length - 1 && T >= CAM[i + 1][0]) i++;
  const A = CAM[i], B = CAM[Math.min(i + 1, CAM.length - 1)];
  const k = B[0] === A[0] || T <= A[0] ? (T >= B[0] ? 1 : 0) : (B[6] || eIO)(clamp((T - A[0]) / (B[0] - A[0])));
  return cadre(lerp(A[1], B[1], k), lerp(A[2], B[2], k), lerp(A[3], B[3], k), lerp(A[4], B[4], k), Math.exp(lerp(Math.log(A[5]), Math.log(B[5]), k)));
}
// l'isoloir : 1 à ×4,2 et plus, 0 à ×1 (index.html : k, le progrès du zoom, en échelle logarithmique)
const isoDe = z => clamp(Math.log(z) / Math.log(4.2));
// la découpe de l'isoloir (index.html : x < 1272) ; en bas, y < 650 pendant le test (la question dessous), puis la zone
// utile entière pendant le choix (la rangée de dessous, dans la pénombre)
const decoupeY = T => lerp(650, 830, eIO(seg(T, S.p12, S.retourFin)));

// ================================================================ l'œil de Phi : sa place, son humeur, son regard
const OEIL = [
  // à la coupe, l'œil est encore où P10 l'a laissé (entre les deux descriptions) : il glisse à sa place, sans sauter
  [S.coupe, { x: 960, y: 370, s: 150 }],
  [S.coupe + .6, { x: 1110, y: 300, s: 150 }],
  [S.recul2, { x: 1110, y: 300, s: 150 }],
  [S.recul2Fin, { x: 650, y: 160, s: 160 }],
  [S.glisse, { x: 650, y: 160, s: 160 }],
  [S.glisseFin, { x: 1560, y: 84, s: 100 }],
];
const HUMEURS_LOT = [
  [S.juste - .05, 'grand', .25],                                 // il a compris : Phi s'en réjouit (pas de son choix)
  [S.juste + 1.0, 'neutre', .6],
  [S.p12 + .2, { x: 0, y: 6, r: 11, rot: 0, glow: .2 }, .8],     // « bas », lueur 0,2 : discret
  [S.regardePhi + .1, { y: 7, r: 10, glow: .12 }, .5],           // il le regarde : Phi baisse l'œil, ne souffle rien
  [S.detourne, { r: 4, rot: -4, glow: .1 }, .22],                // « Je ne regarde pas » : une fente
  [S.oeilRevient, 'neutre', .5],
];

// les points que l'on regarde (à l'écran, sous la caméra du moment)
const ecranDe = (x, y, T) => camLot(T).ecran(x, y);
const visage48 = T => ecranDe(525, 484 - 12, T);
const DESC = Object.freeze({ x: 1290, y: 40, w: 570, h: 230 });   // « SA DESCRIPTION », à la place de RÈGLES
const Q = Object.freeze({ x: 70, y: 662, w: 1160, h: 150 });     // la question, sous l'isoloir (y 660–830)
const BOUTON = i => { const bw = (Q.w - 48 - 3 * 14) / 4; return { x: Q.x + 24 + i * (bw + 14), y: Q.y + 68, w: bw, h: 66 }; };
const centreBouton = i => { const b = BOUTON(i); return point(b.x + b.w / 2, b.y + b.h / 2); };
const PIL = [Object.freeze({ x: 318, y: 436 }), Object.freeze({ x: 982, y: 436 })];   // les petites pilules, de part et d'autre
const HORLOGE = Object.freeze({ x: 110, y: 190 });
const C4 = Object.freeze([27, 28, 45, 23]);     // les quatre corrigés du recul (les ✗ de la salle que montre le ×2)
const corrige = i => S.corrige + C4.indexOf(i) * .2;
const dernierCorrige = T => { let b = null; for (const i of C4) if (T >= corrige(i) - .15) b = i; return b === null ? null : ecranDe(PREMIERS[b].cx, PREMIERS[b].cy - 12, T); };
const auHasardSalle = T => { const f = PREMIERS[Math.floor(hache(Math.floor(T / .5) * 97 + 3) * 100)]; return ecranDe(f.cx, f.cy - 12, T); };
const derniereTuile = T => { let k = 0; while (k + 1 < NT && T >= TUILE_T[k + 1]) k++; const o = decalageTuile(k); return ecranDe(650 + o.x, 480 + o.y, T); };

let REGARD = null;
function regardPhi() {
  if (REGARD) return REGARD;
  return (REGARD = creeRegard({
    cibles: [
      // P11 : lui ; sa réponse, la bonne ; lui ; les 18,9 % ; lui ; sa description qui pulse ; la question ; sa réponse ;
      // lui, qui a compris ; les corrigés, de l'un à l'autre ; le tampon
      [S.coupe, .9, visage48, .4], [S.choix1 - .15, .75, centreBouton(0)], [S.faux, .55, centreBouton(2)],
      [S.faux + .55, 1.2, visage48, .4], [S.stats + .2, .9, point(1420, 322)], [S.stats + 1.1, 2.0, visage48, .4],
      [S.reexplique, .7, point(DESC.x + DESC.w / 2, DESC.y + 120)], [S.q2, .55, point(Q.x + 520, Q.y + 36)],
      [S.choix2, .6, centreBouton(2)], [S.juste, 1.0, visage48, .4],
      [S.recul + .1, .3, visage48], [S.corrige - .1, 1.0, dernierCorrige, .2], [S.tampon + .05, 1.05, point(636, 400)],
      [S.tampon + 1.1, .9, visage48, .4],
      // P12 : lui (il revient dans l'isoloir), sa description quand il la relit, l'horloge qui s'emballe, lui ; puis
      // quand il le regarde, Phi baisse les yeux (vous, en humeur « bas ») ; « Je ne regarde pas » : le bord droit
      [S.p12, 1.4, visage48, .4], [S.relit1, .4, point(DESC.x + DESC.w / 2, DESC.y + 120)], [S.relit1 + .4, .2, visage48],
      [S.relit2, .45, point(DESC.x + DESC.w / 2, DESC.y + 120)], [S.relit2 + .45, .6, visage48, .3],
      [S.emballe + .1, .7, point(HORLOGE.x + 70, HORLOGE.y - 12)], [S.emballe + .8, 2.4, visage48, .3],
      [S.regardePhi, S.detourne - S.regardePhi, VOUS],
      [S.detourne, S.oeilRevient - S.detourne, point(1900, 300)],
      [S.oeilRevient, .8, visage48, .4], [S.recul2, 1.4, auHasardSalle],
      // P13 : les tuiles qui s'allument, puis le champ entier ; le titre
      [S.recul2Fin, S.vingt - S.recul2Fin, derniereTuile, .35], [S.vingt, 30, point(960, 520)],
      [S.titre + .05, .75, point(960, 170)], [S.titre + .8, 30, point(960, 520)],
    ],
    repos: [[1, visage48]],
  }));
}
// l'état de l'œil à l'instant T (avant le monde : les sujets lui rendent son regard)
function etatOeil(T, cam) {
  const P = cles(T, OEIL);
  const h = humeur(T, HUMEURS_LOT);
  const y = P.y + Math.sin(T * .9) * 4;          // flotte(T) : son centre vrai, pour que les sujets le regardent
  return { x: P.x, y: P.y, s: P.s, h, phiW: cam.monde(P.x, y), ouvert: cligne(T) > .5, detourne: T >= S.detourne && T < S.oeilRevient };
}

// ================================================================ les cent premiers participants, en dates
// Tous gris (on ne voit aucun choix). Pendant le test (P11), chacun est mesuré (le trait LABO, puis ✓ ou ✗, au-dessus
// de la tête) ; les 19 de MAUVAIS (dont le N°48) ont ✗ et baissent les yeux jusqu'à leur correction, puis relèvent la
// tête vers Phi. Pendant le choix (P12), les voisins lorgnent vers le N°48, un « ? » au-dessus d'eux ; à 110,0, de
// proche en proche, les « ? » deviennent de petits cadenas LABO : les choix sont faits, et privés.
const tck = i => (i === N48 ? S.faux : 87.35 + hache(i * 13 + 5) * 2.6);
const tfix = i => {
  if (i === N48) return S.juste;
  if (C4.includes(i)) return corrige(i);
  return 90.6 + hache(i * 29 + 7) * 4.4;          // ailleurs dans la salle (hors du cadre), avant le recul
};
const distN48 = f => Math.hypot(f.cx - 525, f.cy - 484);
const tCadenas = f => S.cadenas + distN48(f) / 700 * .9;
// le regard du N°48 pendant le choix : les pilules, sa description (deux fois), de plus en plus vite quand l'horloge
// s'emballe ; Phi ; puis la tête basse ; puis droit devant, et il saute
const COUPS = [[S.p12, 'face'], [98.75, 'bleue'], [99.25, 'rouge'], [S.relit1 - .05, 'desc'], [S.relit1 + .4, 'bleue'],
  [S.relit2 - .05, 'desc'], [S.relit2 + .5, 'rouge']];
const RYTHME = ['bleue', 'rouge', 'bleue', 'rouge', 'desc', 'rouge', 'bleue', 'desc'];
function regard48(T) {
  if (T >= S.accroupi - .3) return 'face';
  if (T >= S.baisse) return 'bas';
  if (T >= S.regardePhi) return 'phi';
  const t0 = S.relit2 + 1.0;
  if (T >= t0) {          // les regards s'accélèrent avec l'horloge (un coup toutes les 0,55 s, puis neuf par seconde)
    const n = Math.floor((T - t0) / .55 + 15 * eIO(seg(T, S.emballe, S.emballeFin)));
    return RYTHME[n % RYTHME.length];
  }
  let c = COUPS[0][1]; for (const [t, v] of COUPS) if (T >= t) c = v;
  return c;
}
// depuis quand il regarde ce qu'il regarde (pour que la pilule regardée s'éclaire en douceur, comme dans index.html)
function debutCoup(T) {
  const r = regard48(T);
  let a = Math.max(S.p12, T - 1.5), b = T;
  if (regard48(a) === r) return a;
  for (let j = 0; j < 24; j++) { const m = (a + b) / 2; if (regard48(m) === r) b = m; else a = m; }
  return b;
}
const descEcran = () => point(DESC.x + 200, DESC.y + 110);

// l'état du sujet f (des cent premiers) à l'instant T, pour dessineSujet (dans le repère du monde)
function etatPremier(f, T, O, cam) {
  const i = f.i, moi = i === N48;
  const e = { col: GRIS_FIG, a: moi ? lerp(.82, .94, isoDe(cam.z)) : .82, mode: 'repos', phi: O.phiW, cible: O.phiW, fixe: false, reflet: O.ouvert && !O.detourne };
  if (T < S.p12) {                                                       // P11 : le test
    if (moi) {
      e.reflet = false;
      if (T < S.choix1) e.p = { yx: 0, yy: 1 };                          // il lit la question, sous lui
      else if (T < S.faux) e.p = { yx: -1, yy: 1 };                      // sa réponse, à gauche
      else if (T < S.releve) e.mode = 'penaud';                          // ✗ : il regarde ses pieds
      else if (T < S.q2) { e.fixe = true; e.cible = cam.monde(descEcran().x, descEcran().y); }   // il relit sa description
      else if (T < S.juste) e.p = { yx: 1, yy: 1 };                      // la nouvelle question, sa réponse à droite
      else if (T < S.juste + 1.7) { e.fixe = true; e.reflet = O.ouvert; } // il relève la tête vers Phi
      else e.reflet = O.ouvert;
      return e;
    }
    const tc = tck(i), tf = tfix(i), mauvais = MAUVAIS.has(i);
    if (mauvais && T >= tc && T < tf) e.mode = 'penaud';
    e.fixe = (T > tc - .3 && T < tc + .5) || (mauvais && T > tf && T < tf + 1.2);
    return e;
  }
  if (moi) {                                                             // P12 : son choix
    e.reflet = false;
    if (T >= S.accroupi && T < S.saut - .16) { e.p = { acc: 1, bob: 0, yx: 0, yy: 0 }; return e; }
    if (T >= S.saut - .16 && T < S.saut + .45) { e.mode = 'saut'; e.t0 = S.saut; return e; }
    if (T >= S.saut + .45) { if (T < S.recul2) e.p = { yx: 0, yy: 0 }; e.reflet = O.ouvert && T >= S.oeilRevient; return e; }
    const r = regard48(T);
    if (r === 'bas') e.p = { yx: 0, yy: 1, bob: 0 };
    else if (r === 'face') e.p = { yx: 0, yy: 0 };
    else if (r === 'phi') { e.fixe = true; e.reflet = O.ouvert; if (T < S.regardePhi + .45) e.yeux = 'g'; }
    else {
      const p = r === 'desc' ? descEcran() : PIL[r === 'bleue' ? 0 : 1];
      e.fixe = true; e.cible = cam.monde(p.x, p.y);
    }
    return e;
  }
  if (T < tCadenas(f) + .2) { e.mode = 'prive'; e.cible = { x: 525, y: 484 }; }   // les voisins lorgnent vers lui
  return e;
}

// ================================================================ petits dessins du lot
// un cadenas en pixels (comme les sujets : des cases), posé sur (x, y bas), u la taille d'une case (dans le repère courant)
function cadenas(ctx, x, y, u, col = LABO) {
  ctx.fillStyle = col;
  ctx.fillRect(x - 3.5 * u, y - 5 * u, 7 * u, 5 * u);                      // le corps
  ctx.fillRect(x - 2.5 * u, y - 8 * u, u, 3 * u); ctx.fillRect(x + 1.5 * u, y - 8 * u, u, 3 * u);   // l'anse
  ctx.fillRect(x - 1.5 * u, y - 9 * u, 3 * u, u);
  ctx.fillStyle = '#0c0b0d'; ctx.fillRect(x - .5 * u, y - 3.8 * u, u, 1.6 * u);   // la serrure
}
// une étiquette d'isoloir (index.html : « SUJET N°48 · CHOIX PRIVÉ », cadre LABO), centrée en x, son haut en y
function etiquette(ctx, txt, x, y, a, col = LABO) {
  if (a <= 0) return;
  ctx.globalAlpha = a; ctx.font = `24px ${PIX}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const lw = ctx.measureText(txt).width + 36;
  ctx.fillStyle = 'rgba(12,11,13,.92)'; ctx.fillRect(x - lw / 2, y, lw, 40);
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(x - lw / 2, y, lw, 40);
  ctx.fillStyle = col; ctx.fillText(txt, x, y + 28);
  ctx.globalAlpha = 1;
}
const OUVERTURE = LE48.ouverture.split(':').reduce((a, v) => a * 60 + +v, 0);   // 23:44:02 (donnees.js)
const hms = s => { const t = OUVERTURE + Math.floor(s); const h = Math.floor(t / 3600) % 24, m = Math.floor(t / 60) % 60, x = t % 60; return [h, m, x].map(v => String(v).padStart(2, '0')).join(':'); };

// ---------------------------------------------------------------- l'horloge : 23:44:02 → 23:48:19 (4 min 17 s)
// Une seconde par seconde ; sur « Quatre minutes passent », elle s'emballe (eIO) ; elle repart à une seconde par seconde
// et s'arrête, en laiton, au sommet du saut, sur 23:48:19.
const DUREE48 = LE48.duree;                                           // 257 s
const C1 = DUREE48 - (S.eclair - S.emballeFin);                       // là où l'emballement la pose
const C0 = S.emballe - S.horloge;
function horloge(T) {
  if (T < S.horloge) return 0;
  if (T < S.emballe) return T - S.horloge;
  if (T < S.emballeFin) return lerp(C0, C1, eIO(seg(T, S.emballe, S.emballeFin)));
  if (T < S.eclair) return C1 + (T - S.emballeFin);
  return DUREE48;
}
// le temps des autres pendant l'emballement : une part (12 %) des quatre minutes qui filent ; constant ensuite
const accelere = T => { const u = clamp(T, S.emballe, S.emballeFin); return .12 * (horloge(u) - C0 - (u - S.emballe)); };
// les instants où l'horloge change de seconde (pour la trotteuse) : de l'ouverture au silence
const TICS = (() => {
  const out = [];
  for (let n = 1; n < DUREE48; n++) {
    let a = S.horloge, b = S.eclair;
    if (horloge(b - 1e-6) < n) break;
    for (let j = 0; j < 40; j++) { const m = (a + b) / 2; if (horloge(m) >= n) b = m; else a = m; }
    if (b < S.silence && (!out.length || b - out[out.length - 1] >= .03)) out.push(b);
  }
  return Object.freeze(out);
})();

// ================================================================ la constellation (P13)
// 45 tuiles de cent : la tuile k est la grille d'index.html décalée de ((k mod 7) · 1050, ⌊k / 7⌋ · 340) ; elles
// s'allument dans l'ordre d'arrivée, de plus en plus vite puis de moins en moins (u = 0,3 x + 0,7 lisse(x)) : la pluie
// grossit, puis se pose. En dessous de ×0,3, chaque sujet devient un carré de 3 × 3 px GRIS_FIG (α 0,9).
const NT = Math.ceil(PARTICIPANTS / 100);
const decalageTuile = k => ({ x: (k % TUILES_RANG) * 1050, y: Math.floor(k / TUILES_RANG) * 340 });
const TUILE_T = (() => {
  const out = new Float64Array(NT); out[0] = -Infinity;
  for (let k = 1; k < NT; k++) {
    const u = k / (NT - 1); let a = 0, b = 1;
    for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (.3 * m + .7 * lisse(m) < u) a = m; else b = m; }
    out[k] = S.tuiles + (S.tuilesFin - S.tuiles) * (a + b) / 2;
  }
  return out;
})();
const aTuile = (k, T) => (k === 0 ? 1 : eOut(seg(T, TUILE_T[k], TUILE_T[k] + .35)));
const nTuile = k => Math.min(100, PARTICIPANTS - 100 * k);
const PARTS = [];
const part = p => PARTS[p] || (PARTS[p] = Object.freeze(participant(p)));
// le compteur : les participants arrivés, et leur jour (donnees.js, COLLECTE : 10 jours, beaucoup le premier)
function compteur(T) {
  let n = 100;
  for (let k = 1; k < NT; k++) n += nTuile(k) * seg(T, TUILE_T[k], TUILE_T[k] + .25);
  n = Math.round(n);
  const tau = COLLECTE.tau, J = COLLECTE.jours, x = n / PARTICIPANTS * (1 - Math.exp(-J / tau));
  const jour = Math.min(J, Math.floor(-tau * Math.log(1 - Math.min(x, .999999)) + 1e-9) + 1);
  return { n, jour: n >= PARTICIPANTS ? J : jour };
}

// ================================================================ la scène
// la toile du fond (une mémoire de calcul : elle est repeinte en entier à chaque image)
let FOND_T = null;
function toileFond() {
  const F = FOND_T || (FOND_T = toile(W, H).getContext('2d'));
  F.setTransform(1, 0, 0, 1, 0, 0); F.globalAlpha = 1; F.globalCompositeOperation = 'source-over';
  return F;
}
export function scene(ctx, T) {
  const cam = camLot(T), z = cam.z, iso = isoDe(z);
  const O = etatOeil(T, cam);
  const p13 = T >= S.recul2Fin;

  // ---------------------------------------------------------------- le monde, sous la caméra, sur la toile vide
  // (la salle découpée comme dans index.html, x < 1272 ; ses bords s'éteignent en douceur ; le fond passe dessous)
  const clipY = decoupeY(T), avecClip = !p13;
  ctx.save();
  if (avecClip) { ctx.beginPath(); ctx.rect(0, 0, 1272, clipY); ctx.clip(); }
  if (p13) constellation(ctx, T, cam, O);
  else salle(ctx, T, cam, O, iso);
  ctx.restore();
  // la pénombre de l'isoloir (index.html), puis les bords de la découpe qui s'effacent
  if (avecClip) penombre(ctx, T, cam, iso, clipY);

  // ---------------------------------------------------------------- le fond, dessous (le sol s'efface pour la constellation)
  // Peint à part, puis glissé dessous d'un bloc : peint directement en destination-over, son dégradé opaque recouvrait
  // sa propre poussière de caractères, qui manquait à tout le lot et réapparaissait à la coupe sur l'Europe (118,6).
  const F = toileFond();
  fond(F, T, { sol: .45 * (1 - seg(T, S.recul2Fin, S.recul2Fin + 1.2)) });
  ctx.globalCompositeOperation = 'destination-over'; ctx.globalAlpha = 1;
  ctx.drawImage(F.canvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';

  // ---------------------------------------------------------------- l'isoloir : l'étiquette, l'éclair
  if (!p13) isoloir(ctx, T, cam, iso);

  // ---------------------------------------------------------------- les pilules du choix (à l'écran, de part et d'autre)
  if (T >= S.p12 && T < S.point + .6) {
    const a = 1 - seg(T, S.eclairFin, S.eclairFin + .55);         // elles s'éteignent, sans éclater (on ne sait pas laquelle)
    const d0 = T < S.accroupi ? debutCoup(T) : 0, r = T < S.accroupi ? regard48(T) : '', avant = r ? regard48(d0 - 1e-4) : '';
    const kr = r ? seg(T, d0, d0 + .18) : 0;
    [0, 1].forEach(i => {
      const nom = i === 0 ? 'bleue' : 'rouge', hl = r === nom ? kr : avant === nom ? 1 - kr : 0;
      const ai = a * seg(T, S.p12 + .5 + .25 * i, S.retourFin + .3 + .25 * i);
      pilule(ctx, T, i, { x: PIL[i].x, y: PIL[i].y, ps: .45, lab: S.retourFin + .2 + .25 * i, hl, a: ai * (.78 + .22 * hl) });
    });
  }

  // ---------------------------------------------------------------- les crochets du N°48 (à l'écran ; dès qu'on recule)
  const aCro = p13 ? 1 : 1 - seg(z, 2.3, 3.0);
  if (aCro > 0) { const c = cam.ecran(525, 484); crochets(ctx, c.x, c.y, z, { a: aCro }); }

  // ---------------------------------------------------------------- les fenêtres
  if (T < S.descFin + .5) saDescription(ctx, T);
  if (T >= S.stats && T < S.p12 + .4) statsTest(ctx, T);
  if (T < S.recul + .5) question(ctx, T);
  if (T >= S.tampon && T < S.p12 + .5) {
    tampon(ctx, T, { t: S.tampon, segs: [{ s: `${nombre(TEST.compris)} / ${nombre(PARTICIPANTS)} ONT COMPRIS`, c: LABO }], taille: 56, c: LABO, x: 636, y: 400, rot: -6, a: 1 - seg(T, S.p12, S.p12 + .4) });
  }
  if (T >= S.horloge && T < S.recul2 + 1) horlogeEtMediane(ctx, T);
  if (T >= S.recul2Fin) textesConstellation(ctx, T);

  // ---------------------------------------------------------------- Phi (hors caméra : c'est lui qui regarde)
  oeil(ctx, T, { x: O.x, y: O.y, taille: O.s, humeur: O.h, regard: regardPhi() });
}

// ---------------------------------------------------------------- la salle des cent premiers (P11, P12)
function salle(ctx, T, cam, O, iso) {
  ctx.save();
  cam.applique(ctx);
  const z = cam.z;
  const vu = cam.monde(0, 0), vu2 = cam.monde(1272, decoupeY(T));     // ce que montre la découpe, dans le monde
  const marques = T < S.p12 + .4, aMarques = 1 - seg(T, S.p12, S.p12 + .4);
  const aPrive = T >= S.p12 ? seg(iso, .2, .8) : 0;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // l'isoloir privé (index.html : deux parois, un sol), dans le monde : il grandit avec la poussée
  const aParois = T >= S.p12 ? seg(iso, .6, 1) : 0;
  if (aParois > 0) parois(ctx, aParois);
  // les signes au-dessus des têtes (✓, ✗, ?) s'écrivent après, à l'écran, en tailles entières : du texte sous une
  // transformation, à des tailles fractionnaires, ne se rend pas au pixel près selon ce qui a été dessiné avant
  const signes = [];
  const signe = (ch, x, y, px, col, a) => { if (a > 0 && px >= 1) signes.push({ ch, x, y, px, col, a }); };
  for (const f of PREMIERS) {
    if (f.cx < vu.x - 30 || f.cx > vu2.x + 30 || f.cy < vu.y - 40 || f.cy > vu2.y + 40) continue;
    const moi = f.i === N48;
    // pendant que l'horloge s'emballe, les autres vivent en accéléré (ils respirent, clignent, plus vite) ; lui, non
    dessineSujet(ctx, f, f.cx, f.cy, 4, etatPremier(f, T, O, cam), moi ? T : T + accelere(T));
    // P11 : Phi mesure (le trait LABO de la tête aux pieds), puis la coche au-dessus de la tête
    // (pas pour ceux que la découpe coupe : une coche sans sujet ; ni pour lui quand ses crochets le désignent)
    if (marques && f.cy * z + cam.oy < decoupeY(T) - 40) marque(ctx, f, T, z, aMarques * (moi ? seg(z, 2.3, 3.0) : 1), signe);
    // P12 : le « ? » des voisins, puis les cadenas ; le cadenas du N°48 (celui de l'isoloir), et son « ? » après le saut
    if (T >= S.p12) {
      const tc = tCadenas(f), kc = seg(T, tc, tc + .25);
      const dedans = !moi && Math.abs(f.cx - 525) < 30 && f.cy > 484 ? 1 - aParois : 1;   // celui de dessous : sa marque tomberait dans l'isoloir
      if (!moi) signe('?', f.cx, f.cy - 31, 14 * z, GRIS, aPrive * (1 - kc) * dedans);
      // lui : le cadenas de l'isoloir pendant qu'il choisit ; retombé, un « ? » à sa place (on ne sait pas) ; puis le
      // petit cadenas, comme tous
      const q48 = moi ? cloche(T, S.point - .12, S.point + .02, S.cadenas, S.cadenas + .25) : 0;
      // (quand ses crochets reviennent, ils prennent la place de son cadenas : leur nom « N°48 » est là)
      const aC = (moi ? Math.max(aParois, kc) * (1 - q48) * seg(z, 2.3, 3.0) : kc * eBack(kc)) * dedans;
      if (aC > 0) { ctx.globalAlpha = Math.min(1, aC) * (1 - seg(z, .6, .3)); cadenas(ctx, f.cx, f.cy - 28, 1); }
      if (q48 > 0) signe('?', f.cx, f.cy - 31, 15 * z * eBack(seg(T, S.point, S.point + .3)), CRAIE, q48);
    }
  }
  // l'éclair de craie : il remplit l'isoloir, au sommet du saut (on ne voit pas la couleur)
  const fl = flash(T);
  if (fl > 0) {
    ctx.globalAlpha = fl; ctx.fillStyle = CRAIE;
    ctx.fillRect(525 - 125 / 4.2, 484 - 150 / 4.2, 250 / 4.2, 300 / 4.2);
  }
  ctx.restore();
  // les signes, à l'écran
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const g of signes) {
    const e = cam.ecran(g.x, g.y);
    ctx.globalAlpha = Math.min(1, g.a); ctx.font = `${Math.max(1, Math.round(g.px))}px ${PIX}`; ctx.fillStyle = g.col;
    texteSignes(ctx, g.ch, Math.round(e.x), Math.round(e.y));   // ✓ et ✗ en pixels (commun.js : signe)
  }
  ctx.globalAlpha = 1;
}
const flash = T => (T < S.eclair || T >= S.eclairFin ? 0 : T < S.eclair + .1 ? .96 : .96 * (1 - seg(T, S.eclair + .1, S.eclairFin)));
function parois(ctx, a) {
  const u = 1 / 4.2;   // les mesures d'index.html (à ×4,2), ramenées au monde
  ctx.globalAlpha = a;
  for (const sx of [-1, 1]) {
    const x = 525 + sx * 125 * u;
    ctx.fillStyle = 'rgba(241,233,220,.07)'; ctx.fillRect(sx < 0 ? x - 26 * u : x, 484 - 150 * u, 26 * u, 300 * u);
    ctx.strokeStyle = 'rgba(241,233,220,.55)'; ctx.lineWidth = 2 * u; ctx.strokeRect(sx < 0 ? x - 26 * u : x, 484 - 150 * u, 26 * u, 300 * u);
  }
  ctx.strokeStyle = 'rgba(241,233,220,.35)'; ctx.lineWidth = 2 * u;
  ctx.beginPath(); ctx.moveTo(525 - 151 * u, 484 + 150 * u); ctx.lineTo(525 + 151 * u, 484 + 150 * u); ctx.stroke();
  ctx.globalAlpha = 1;
}
// la coche de compréhension d'un participant (index.html : verifs), à la taille de l'écran bornée à 44 px
function marque(ctx, f, T, z, aG, signe) {
  const moi = f.i === N48, tc = tck(f.i), tf = tfix(f.i), mauvais = MAUVAIS.has(f.i);
  // la mesure : un trait LABO de la tête aux pieds, 0,3 s avant la coche (deux fois pour lui : avant ✗, avant ✓)
  for (const tm of moi ? [tc, tf] : [tc]) {
    if (T >= tm - .3 && T < tm) { ctx.globalAlpha = .85 * aG; ctx.fillStyle = LABO; ctx.fillRect(f.cx - 24, f.cy - 26 + 52 * seg(T, tm - .3, tm), 48, 2 / z); }
  }
  if (T < tc) return;
  const k = eBack(seg(T, tc, tc + .35)), faux = mauvais && T < tf, flashK = mauvais && T >= tf ? 1 - seg(T, tf, tf + .5) : 0;
  const ecranPx = Math.min(18 * z, 44) * k + 6 * flashK * Math.min(z, 2.4);
  signe(faux ? '✗' : '✓', f.cx, f.cy - 31, ecranPx, faux ? ROUGE_TXT : mix(LABO, CRAIE, flashK), aG * clamp(k));
}
// la pénombre autour de l'isoloir (index.html : un dégradé radial, 150 → 520 px, jusqu'à 0,9), et ses bords qui
// s'éteignent (au recul ×2, la découpe ne tranche pas les voisins à vif)
function penombre(ctx, T, cam, iso, clipY) {
  const c = cam.ecran(525, 484), z = cam.z;
  const kc = seg(z, 1.05, 1.8);                    // la pénombre s'en va quand on revient à ×1
  if (kc <= 0) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, 1272, clipY); ctx.clip();
  const r0 = lerp(300, 125, iso), r1 = lerp(780, 470, iso), aOut = lerp(.72, .92, iso) * kc;
  const g = ctx.createRadialGradient(c.x, c.y, r0, c.x, c.y, r1);
  g.addColorStop(0, 'rgba(12,11,13,0)'); g.addColorStop(1, `rgba(12,11,13,${aOut.toFixed(3)})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1272, clipY);
  // les bords : la salle et sa pénombre s'effacent sur le fond (destination-in, dans la découpe seulement)
  ctx.globalCompositeOperation = 'destination-in';
  const bord = (x0, y0, x1, y1, rx, ry, rw, rh) => {
    const gr = ctx.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, `rgba(0,0,0,${(1 - kc).toFixed(3)})`);
    ctx.save(); ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip(); ctx.fillStyle = gr; ctx.fillRect(rx, ry, rw, rh); ctx.restore();
  };
  bord(1272 - 190, 0, 1272, 0, 1272 - 190, 0, 190, clipY);
  const hb = clipY > 700 ? 130 : 70;
  bord(0, clipY - hb, 0, clipY, 0, clipY - hb, 1272, hb);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
// l'étiquette de l'isoloir (dans le monde : elle suit la poussée ; le texte garde sa taille) et le halo de l'éclair
function isoloir(ctx, T, cam, iso) {
  const haut = cam.ecran(525, 484 - 200 / 4.2), a = seg(iso, .6, 1);
  if (T < S.p12) etiquette(ctx, `SUJET N°${LE48.rang} · TEST`, haut.x, haut.y, a);
  else etiquette(ctx, `SUJET N°${LE48.rang} · CHOIX PRIVÉ`, haut.x, haut.y, a * (1 - seg(T, S.accroupi - .2, S.accroupi + .1)));
  const fl = flash(T);
  if (fl > 0) {
    const c = cam.ecran(525, 484), r = 140 * cam.z;
    const g = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, r);
    g.addColorStop(0, rgba(CRAIE, .55 * fl)); g.addColorStop(1, rgba(CRAIE, 0));
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(c.x - r, c.y - r, 2 * r, 2 * r);
  }
}

// ---------------------------------------------------------------- « SA DESCRIPTION » (à la place de RÈGLES)
// La description individuelle, celle que le hasard lui a donnée. Sur « réexplique », elle pulse en LABO et se réécrit
// d'un trait ; en P12, il la relit deux fois (elle pulse, un trait LABO passe sous les lignes). Elle s'efface à 109,4
// pour laisser le coin au carnet.
const TXT_DESC = cite(DESCRIPTIONS.individuelle);
let LIGNES_DESC = null;
function lignesDesc(ctx) {
  if (LIGNES_DESC) return LIGNES_DESC;
  ctx.font = `19px ${MONO}`;
  return (LIGNES_DESC = coupeBalise(ctx, TXT_DESC, DESC.w - 48));
}
function saDescription(ctx, T) {
  const a = 1 - seg(T, S.descFin, S.descFin + .4);
  if (a <= 0) return;
  const pulse = t0 => seg(T, t0, t0 + .2) * (1 - seg(T, t0 + .5, t0 + 1.1));
  const pu = Math.max(pulse(S.reexplique), .8 * pulse(S.relit1), .8 * pulse(S.relit2));
  fenetre(ctx, DESC.x, DESC.y, DESC.w, DESC.h, a, pu > 0 ? mix(CRAIE, LABO, pu) : CRAIE);
  ctx.globalAlpha = a; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = `24px ${PIX}`; ctx.fillStyle = LABO; ctx.fillText('SA DESCRIPTION', DESC.x + 24, DESC.y + 40);
  ctx.fillStyle = FILET; ctx.fillRect(DESC.x + 24, DESC.y + 54, DESC.w - 48, 2);
  const L = lignesDesc(ctx), y0 = DESC.y + 98, lh = 32;
  // la réécriture d'un trait (150 car./s), sous le voile LABO
  const tr = S.reexplique + .1, n = T >= tr && T < tr + 2 ? Math.floor((T - tr) * 150) : Infinity;
  const voile = Math.max(pu * .9, T >= tr ? 1 - seg(T, tr + .4, tr + 1.6) : 0);
  if (voile > 0) { ctx.fillStyle = rgba(LABO, .13 * voile); ctx.fillRect(DESC.x + 12, y0 - 26, DESC.w - 24, L.length * lh + 10); }
  // il relit : un trait LABO passe sous les lignes, l'une après l'autre
  for (const t0 of [S.relit1, S.relit2]) {
    const k = seg(T, t0, t0 + .55);
    if (k > 0 && k < 1) {
      const li = Math.min(L.length - 1, Math.floor(k * L.length)), u = k * L.length - li;
      ctx.fillStyle = rgba(LABO, .55 * a); ctx.fillRect(DESC.x + 24, y0 + li * lh + 7, (DESC.w - 48) * eOut(u), 2);
    }
  }
  ctx.font = `19px ${MONO}`; ctx.globalAlpha = a;
  ecrit(ctx, L, DESC.x + 24, y0, lh, n);
  if (n !== Infinity && n < 200) {      // la plume de la réécriture
    let m = n, li = 0; while (li < L.length - 1 && m > L[li].reduce((s, g) => s + [...g.s].length, 0)) { m -= L[li].reduce((s, g) => s + [...g.s].length, 0); li++; }
    const vis = L[li].map(g => g.s).join('').slice(0, m);
    ctx.fillStyle = LABO; ctx.fillRect(DESC.x + 24 + ctx.measureText(vis).width + 2, y0 + li * lh - 16, 8, 19);
  }
  ctx.font = `15px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'right'; ctx.globalAlpha = a * .9;
  ctx.fillText('tirée au sort', DESC.x + DESC.w - 24, DESC.y + DESC.h - 18);
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}
// « au moins une erreur au test » / « 8,3 % se trompent » (Plex 18 GRIS, sous SA DESCRIPTION)
function statsTest(ctx, T) {
  const a = seg(T, S.stats, S.stats + .4) * (1 - seg(T, S.p12, S.p12 + .4));
  if (a <= 0) return;
  ctx.globalAlpha = a; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = `18px ${MONO}`;
  ctx.fillStyle = GRIS; ctx.fillText(fr('au moins une erreur au test'), DESC.x + 24, 316);
  const p = pc(pct(ERREURS, PARTICIPANTS));
  ctx.globalAlpha = a * seg(T, S.stats + .25, S.stats + .65);
  ctx.fillStyle = CRAIE; ctx.fillText(p, DESC.x + 24, 343);
  ctx.fillStyle = GRIS; ctx.fillText(' se trompent', DESC.x + 24 + ctx.measureText(p).width, 343);
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- la question, sous l'isoloir (index.html : fenetreQuestion, OPT4)
const OPT4 = Object.freeze(['Tout le monde vit.', 'Les bleus vivent, les rouges meurent.', 'Les bleus meurent, les rouges vivent.', 'Tout le monde meurt.']);
const QUESTIONS = Object.freeze([
  { de: S.coupe - 1, a: S.reexplique, txt: fr('Si 25 % prennent la [b]bleue[/b] et 75 % la [r]rouge[/r] :'), essai: '1re tentative', sel: 0, tsel: S.choix1, rep: S.faux, ok: 2, boutons: S.boutons },
  { de: S.q2 - .25, a: S.recul + .4, txt: fr('Si 40 % prennent la [b]bleue[/b] et 60 % la [r]rouge[/r] :'), essai: '2e tentative', sel: 2, tsel: S.choix2, rep: S.juste, ok: 2, boutons: S.q2 },
]);
function question(ctx, T) {
  const a = 1 - seg(T, S.recul, S.recul + .4);
  if (a <= 0) return;
  fenetre(ctx, Q.x, Q.y, Q.w, Q.h, a);
  ctx.globalAlpha = a; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = `24px ${PIX}`; ctx.fillStyle = LABO; ctx.fillText('QUESTION 3 / 4', Q.x + 24, Q.y + 40);
  const xq = Q.x + 24 + ctx.measureText('QUESTION 3 / 4').width + 30;
  ctx.fillStyle = FILET; ctx.fillRect(Q.x + 24, Q.y + 54, Q.w - 48, 2);
  for (const q of QUESTIONS) {
    if (T < q.de || T >= q.a) continue;
    const aq = a * seg(T, q.de, q.de + .25) * (1 - seg(T, q.a - .3, q.a));
    // la question, et la tentative (à droite, en gris)
    ctx.globalAlpha = aq; ctx.font = `21px ${MONO}`;
    ecrit(ctx, balise(q.txt), xq, Q.y + 38, 0);
    ctx.font = `16px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'right'; ctx.fillText(q.essai, Q.x + Q.w - 24, Q.y + 37); ctx.textAlign = 'left';
    const rep = T >= q.rep;
    for (let i = 0; i < 4; i++) {
      const b = BOUTON(i), k = eBack(seg(T, q.boutons + i * .08, q.boutons + .35 + i * .08));
      if (k <= 0) continue;
      const choisi = T >= q.tsel && i === q.sel, juste = i === q.ok;
      const ks = choisi && !rep ? eBack(seg(T, q.tsel, q.tsel + .25)) : 1;
      let bord = CRAIE, txt = CRAIE, ab = 1, lw = 3;
      if (rep) {
        const fk = juste && q.ok === q.sel ? 1 - seg(T, q.rep, q.rep + .5) : 0;   // l'éclair de la correction : craie → LABO
        if (juste) { bord = mix(LABO, CRAIE, fk); txt = bord; lw = 5; }
        else if (choisi) { bord = ROUGE_TXT; txt = ROUGE_TXT; lw = 5; }
        else ab = .35;
      } else if (choisi) { bord = LAITON; txt = LAITON; lw = 5; }
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2, w = b.w * k, h = b.h * k;
      ctx.globalAlpha = aq * ab * Math.min(1, k);
      ctx.fillStyle = choisi && !rep ? 'rgba(215,165,72,.12)' : 'rgba(12,11,13,.92)'; ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
      ctx.strokeStyle = bord; ctx.lineWidth = lw * Math.min(1, ks); ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
      if (k < .9) continue;
      ctx.font = `16px ${PIX}`; ctx.fillStyle = choisi && !rep ? LAITON : GRIS; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), b.x + 10, b.y + 15);
      ctx.textAlign = 'center'; ctx.font = `21px ${PIX}`; ctx.fillStyle = txt;
      const lignes = coupe(ctx, OPT4[i], b.w - 56);
      lignes.forEach((l, li) => ctx.fillText(l, cx, cy + 2 + (li - (lignes.length - 1) / 2) * 27));
      if (rep && (juste || choisi)) {
        const kk = eBack(seg(T, q.rep, q.rep + .3));
        ctx.font = `${Math.round(24 * kk)}px ${PIX}`; texteSignes(ctx, juste ? '✓' : '✗', b.x + b.w - 18, b.y + 17);
      }
      ctx.textBaseline = 'alphabetic';
    }
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

// ---------------------------------------------------------------- l'horloge du doute
function horlogeEtMediane(ctx, T) {
  const a = seg(T, S.horloge, S.horloge + .35) * (1 - seg(T, S.recul2 + .3, S.recul2 + .9));
  if (a <= 0) return;
  const arret = T >= S.eclair, vite = T >= S.emballe && T < S.emballeFin ? Math.sin(Math.PI * seg(T, S.emballe, S.emballeFin)) : 0;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const ombre = ctx.createLinearGradient(HORLOGE.x - 30, 0, HORLOGE.x + 560, 0);
  ombre.addColorStop(0, 'rgba(12,11,13,.72)'); ombre.addColorStop(.75, 'rgba(12,11,13,.55)'); ombre.addColorStop(1, 'rgba(12,11,13,0)');
  ctx.globalAlpha = a; ctx.fillStyle = ombre; ctx.fillRect(HORLOGE.x - 30, HORLOGE.y - 44, 590, 90);
  ctx.font = `30px ${MONO}`;
  const s = hms(horloge(T));
  // pendant l'emballement, les secondes filent : une traînée de chiffres
  if (vite > .15) { ctx.globalAlpha = a * .22 * vite; ctx.fillStyle = LABO; ctx.fillText(hms(horloge(T - .03)), HORLOGE.x, HORLOGE.y - 3); ctx.fillText(hms(horloge(T - .06)), HORLOGE.x, HORLOGE.y + 3); }
  ctx.globalAlpha = a;
  const kl = arret ? seg(T, S.eclair, S.eclair + .25) : 0;
  ctx.fillStyle = kl > 0 ? mix(LABO, LAITON, kl) : LABO;
  ctx.fillText(s, HORLOGE.x, HORLOGE.y);
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- la constellation (P13)
function constellation(ctx, T, cam, O) {
  const z = cam.z;
  const sa = seg(z, .26, .36);                     // les sujets (au-dessus de ×0,36) ; les carrés (en dessous de ×0,26)
  const v0 = cam.monde(-60, -60), v1 = cam.monde(1980, 1140);
  // les sujets, sous la caméra
  if (sa > 0) {
    ctx.save(); cam.applique(ctx);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const aCad = seg(z, .3, .6);
    for (let k = 0; k < NT; k++) {
      const at = aTuile(k, T); if (at <= 0) continue;
      const o = decalageTuile(k);
      if (o.x + 1150 < v0.x || o.x + 150 > v1.x || o.y + 640 < v0.y || o.y + 330 > v1.y) continue;
      for (let j = 0; j < nTuile(k); j++) {
        const p = 100 * k + j, f = part(p);
        const ta = k === 0 ? -Infinity : TUILE_T[k] + f.r1 * .25, sc = k === 0 ? 1 : eBack(seg(T, ta, ta + .45));
        if (sc <= .01) continue;
        const e = { col: GRIS_FIG, a: .82 * sa, mode: 'repos', phi: O.phiW, cible: O.phiW, reflet: O.ouvert && z > .5 };
        dessineSujet(ctx, f, f.cx, f.cy, 4 * sc, e, k === 0 && p !== N48 ? T + accelere(T) : T);   // (la salle garde son avance)
        if (aCad > 0 && p !== N48) { ctx.globalAlpha = aCad * sa * Math.min(1, sc); cadenas(ctx, f.cx, f.cy - 28, 1); }
      }
    }
    ctx.restore();
  }
  // les carrés de 3 × 3 px (à l'écran, posés au pixel) : un chemin pour les tuiles entières, un par tuile qui s'allume
  // (elle s'allume en LABO, puis prend le gris des autres)
  const aq = (1 - sa) * .9;
  if (aq > 0) {
    ctx.fillStyle = GRIS_FIG;
    const plein = new Path2D(); let rien = true;
    for (let k = 0; k < NT; k++) {
      const at = aTuile(k, T); if (at <= 0) continue;
      const o = decalageTuile(k);
      if (o.x + 1150 < v0.x || o.x + 150 > v1.x || o.y + 640 < v0.y || o.y + 330 > v1.y) continue;
      const ch = at >= 1 && T >= TUILE_T[k] + .6 ? plein : new Path2D();
      for (let j = 0; j < nTuile(k); j++) {
        const w = placeParticipant(100 * k + j), x = w.x * z + cam.ox, y = w.y * z + cam.oy;
        ch.rect(Math.round(x - 1.5), Math.round(y - 1.5), 3, 3);
      }
      if (at >= 1 && T >= TUILE_T[k] + .6) rien = false;
      else { ctx.globalAlpha = aq * at; ctx.fillStyle = mix(LABO, GRIS_FIG, seg(T, TUILE_T[k] + .1, TUILE_T[k] + .6)); ctx.fill(ch); }
    }
    ctx.fillStyle = GRIS_FIG;
    if (!rien) { ctx.globalAlpha = aq; ctx.fill(plein); }
    ctx.globalAlpha = 1;
  }
}
// le compteur (J1 … J10), et le titre
function textesConstellation(ctx, T) {
  const ac = seg(T, S.tuiles - .1, S.tuiles + .3);
  if (ac > 0) {
    const { n, jour } = compteur(T);
    ctx.globalAlpha = ac; ctx.font = `22px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = GRIS;
    ctx.fillText(`J${jour} · ${nombre(n)}`, 62, 190);
  }
  const at = seg(T, S.titre, S.titre + .5);
  if (at > 0) {
    ctx.globalAlpha = at; ctx.font = `40px ${PIX}`; ctx.textAlign = 'center'; ctx.fillStyle = CRAIE;
    ctx.fillText(`${nombre(PARTICIPANTS)} PARTICIPANTS`, 960, 170 + 6 * (1 - eOut(at)));
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

// ================================================================ les plans
export const PLANS = [
  { id: 'P11', de: 86.8, a: 98.4, dessine: (ctx, t) => scene(ctx, t) },     // Le test
  { id: 'P12', de: 98.4, a: 111.8, dessine: (ctx, t) => scene(ctx, t) },    // Le choix
  { id: 'P13', de: 111.8, a: 118.6, dessine: (ctx, t) => scene(ctx, t) },   // Constellation
];

// ================================================================ les indices sonores (SCENARIO.md, « Son » de P11–P13)
const pan = x => +clamp((x - 960) / 960, -1, 1).toFixed(2);
const r3 = t => +t.toFixed(3);
// le pouls : deux coups sourds à 55 Hz, de plus en plus lents, de l'horloge au silence
const POULS = (() => { const out = []; let t = S.horloge + .2, d = .9; while (t < S.silence - .3) { out.push(t, t + .2); t += d; d = Math.min(1.6, d + .09); } return out; })();
export const SONS = [
  // P11 : le test
  { t: S.coupe, son: 'nappe', f: 'labo', g: .4 },
  ...[0, 1, 2, 3].map(i => ({ t: r3(S.boutons + i * .08), son: 'pop', g: .1, pan: pan(centreBouton(i).x) })),
  { t: S.choix1, son: 'declic', g: .25, pan: pan(centreBouton(0).x) },
  { t: r3(S.faux - .3), son: 'grain', d: .3, f: 3200, g: .08 },
  { t: S.faux, son: 'croix', g: .4, pan: -.3 },                          // un « bonk » grave et doux : rien de punitif
  ...[...PREMIERS].filter(f => f.i !== N48 && Math.abs(f.cx - 525) < 160 && Math.abs(f.cy - 484) < 70).map(f => ({ t: r3(tck(f.i)), son: MAUVAIS.has(f.i) ? 'croix' : 'coche', g: .05, pan: pan(650 + (f.cx - 525) * 4.2) })),
  { t: r3(S.reexplique + .1), son: 'frappe', d: .9, g: .18, pan: .65 },  // la réécriture : un froissement de frappe rapide
  ...[0, 1, 2, 3].map(i => ({ t: r3(S.q2 + i * .08), son: 'pop', g: .08, pan: pan(centreBouton(i).x) })),
  { t: S.choix2, son: 'declic', g: .25, pan: pan(centreBouton(2).x) },
  { t: r3(S.juste - .3), son: 'grain', d: .3, f: 3200, g: .08 },
  { t: r3(S.juste), son: 'coche', g: .45 },                               // un tic clair
  { t: r3(S.juste + .05), son: 'note', f: 1046, d: .45, g: .1 },          // Phi grand : content pour lui
  { t: S.recul, son: 'souffle', d: .8, f: -1, g: .14 },
  ...C4.map((i, k) => ({ t: r3(corrige(i)), son: 'coche', g: .18, pan: pan(650 + (PREMIERS[i].cx - 525) * 2) })),
  { t: S.tampon, son: 'tampon', g: .5 },                                  // un coup mat
  // P12 : le choix
  { t: S.p12, son: 'souffle', d: .8, f: 1, g: .1 },
  { t: S.retourFin - .1, son: 'declic', g: .16 },                         // l'isoloir se referme (le cadenas)
  { t: S.horloge, son: 'nappe', f: 'labo', g: .25 },
  ...TICS.map((t, k) => ({ t: r3(t), son: t > S.emballe && t < S.emballeFin ? 'tic' : 'trotteuse', g: t > S.emballe && t < S.emballeFin ? .05 : .2 })),
  { t: S.emballe, son: 'souffle', d: S.emballeFin - S.emballe, f: [400, 1600], g: .12 },   // les tics se serrent en bourdonnement
  ...POULS.map((t, k) => ({ t: r3(t), son: 'pouls', f: 55, g: k % 2 ? .22 : .32 })),
  { t: r3(S.relit1), son: 'note', f: 660, d: .3, g: .06, pan: .7 }, { t: r3(S.relit2), son: 'note', f: 660, d: .3, g: .06, pan: .7 },
  { t: S.silence, son: 'silence', d: S.point - S.silence },             // tout se coupe, 0,6 s avant le saut
  { t: S.saut, son: 'hop', f: 160, g: .16 },                              // le saut, étouffé (derrière la paroi)
  { t: S.eclair, son: 'souffle', d: .15, f: [5000, 1800], g: .3 },       // l'éclair : un souffle blanc très court
  { t: S.point, son: 'tic', f: 520, g: .08 },
  { t: S.point, son: 'nappe', f: 'labo', g: .3 },                         // puis la salle, seule
  { t: S.descFin, son: 'souffle', d: .4, g: .06, pan: .7 },
  { t: NOTES[2] && NOTES[2].t ? NOTES[2].t : 109.8, son: 'frappe', d: .7, g: .16, pan: .7 },   // le carnet : 0003
  ...PREMIERS.filter(f => distN48(f) < 400).map(f => ({ t: r3(tCadenas(f)), son: 'declic', g: .035, pan: pan(650 + (f.cx - 525) * 5) })),
  { t: S.recul2, son: 'souffle', d: 1.4, f: -1, g: .16 },
  // P13 : une pluie de micro-tics (un par tuile qui s'allume), qui grossit en souffle, puis se pose
  ...[...TUILE_T].slice(1).map((t, k) => ({ t: r3(t), son: 'tic', g: .05, f: 2200 + hache(k * 7 + 3) * 1600, pan: pan(62 + (decalageTuile(k + 1).x + 650 - 150) * .114) })),
  { t: S.tuiles + .4, son: 'souffle', d: 3.4, f: [300, 1200], g: .2 },
  { t: S.titre, son: 'note', f: 330, d: 1.4, g: .1 },
];
