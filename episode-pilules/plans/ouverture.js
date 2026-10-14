/* ==========================================================================
   Les deux pilules, l'épisode — plans/ouverture.js : le lot « ouverture »
   S01 · OUVERTURE (0:00–1:30 dans le script), puis le générique « Xphi · Les
   deux pilules » : P01–P08, de 0,0 à 87,8 s, répliques O01–O11.
   EPISODE.md fait foi (S01, et « Le brief du lot `ouverture` »).

   P01  0,0– 5,5  L'œil s'ouvre : la nuit, l'œil au centre ; à gauche, à droite, puis vous ; « là » : grand.
   P02  5,5–19,7  Une simple intelligence artificielle : l'œil rapetisse ; un bonhomme du film sort du noir,
                  lève les yeux vers Phi ; un « ? » au-dessus de chacun ; « vous-mêmes » : penaud.
   P03 19,7–35,0  Le test : l'œil monte ; la bleue, la rouge en nuages de caractères ; « test 01 · les deux
                  pilules » ; la jauge vide, dont la tête hésite sans jamais se poser (aucun chiffre).
   P04 35,0–48,4  Le fil : des publications abstraites qui défilent avec inertie ; la carte du dilemme refait
                  surface (elle remonte en tête, son bord s'éclaire) ; les réponses s'empilent ; le fil ne s'arrête plus.
   P05 48,4–63,1  Égoïstes, assassins, idiots : le fil se dédouble (les bleus à gauche, les rouges à droite),
                  le filet laiton ; les mots du script tombent dans les cartes ; les flèches de réponse.
   P06 63,1–68,7  Assez de raisons : le recul ×1 → ×0,45 sur un mur de fils gris (d'autres disputes) ; sous la zone
                  utile, le mur s'enfonce dans la nuit (la mention reste lisible).
   P07 68,7–80,2  Pourquoi tant de haine : les cartes partent en caractères ; les bleus et les rouges
                  deviennent les deux pilules.
   P08 80,2–87,8  Générique : les pilules éclatent, leurs caractères (ceux qui restent visibles dans l'éclat)
                  forment « XPHI », puis « LES DEUX PILULES » s'écrit ; la nuit devient le laboratoire ; le titre
                  glisse au cartouche, l'œil à sa place d'index.html.

   Le contrat (film.js, commun.js) : tout est fonction du temps absolu t (hache, aucune mémoire d'une image à
   l'autre, sauf des mémoires de calcul qui ne changent pas l'image : le mur de fils, les points du titre, l'atlas
   des caractères) ; le plan peint tout son fond, dessine le monde puis l'œil ; jamais la boîte XPHI, le cartouche,
   la mention ni le voile (le socle les dessine) ; rien d'important sous y = 830.

   Les gestes se calent sur les mots (quandMot de texte.js), jamais sur un instant recopié d'EPISODE.md : le jour où
   Ronan enregistre la voix, tout suit. Seul P08, sans voix, se cale sur ses propres bornes.

   Raccords. Entrée : le noir du début. Sortie (87,8 s) : le laboratoire vide (fond(ctx, t) : TEINTE_LABO, le sol,
   la poussière), l'œil en (650, 240, 220), neutre, qui vous regarde ; le lot test y tape son terminal. Le fil en
   deux colonnes (P05) est dessiné comme colonnesFil de commun.js le dessine (P65 le reprend flouté, P78 avec ses
   étiquettes « A ») : au repos, l'image est la même.

   Ce qui est recopié du film (non exporté là-bas) : lueur, le titre en caractères (titre, dessineTitre,
   blocTitre de film-pilules/plans/nuit.js), l'atlas des caractères de la dissolution (glyphes de commun.js),
   les tailles des caractères des pilules (TAILLES de commun.js).
   ========================================================================== */
import {
  W, H, CRAIE, GRIS, NUIT, LABO, LAITON, BLEU, ROUGE, GRIS_FIG, MONO, PIX, G, TEINTE_NUIT, TEINTE_LABO,
  clamp, lerp, seg, eIO, eOut, cles, hache, mix, rgba, toile,
  fond, FOND_NUIT, sol, poussiere, jauge, pilule, PILULES, carton,
  humeur, oeil, creeRegard, VOUS, point, flotte,
  dessineSujet, DEMO, SH,
  carte, FIL, CARTE_H, CARTE_GAP, FIL_COLONNES, CARTES_COLONNES, MOTS_FIL, filet, flechePixel, cheminPixel,
  ZONE_UTILE, camera, cadre,
} from '../commun.js';
import { quandMot, plume, REPLIQUE, ECRITURE } from '../texte.js';

export const LOT = { id: 'ouverture', de: 0, a: 87.8 };

// les bornes des plans (EPISODE.md, « Les plans »)
const B = Object.freeze({
  P01: [0, 5.5], P02: [5.5, 19.7], P03: [19.7, 35.0], P04: [35.0, 48.4],
  P05: [48.4, 63.1], P06: [63.1, 68.7], P07: [68.7, 80.2], P08: [80.2, 87.8],
});

// ================================================================ outils du lot
const noir = (ctx, a) => { if (a <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; };
// une lueur ronde (film-pilules/plans/nuit.js, lueur, recopiée)
function lueur(ctx, x, y, r, col, a) {
  if (a <= .002 || r <= 1) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(.45, rgba(col, a * .45)); g.addColorStop(1, rgba(col, 0));
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
// une ombre douce derrière l'œil, quand il passe sur des cartes (film-pilules/plans/nuit.js, P04)
function ombreOeil(ctx, x, y, s, a) {
  if (a <= .01) return;
  const g = ctx.createRadialGradient(x, y, s * .3, x, y, s * 1.05);
  g.addColorStop(0, `rgba(12,11,13,${.85 * a})`); g.addColorStop(1, 'rgba(12,11,13,0)');
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(x - s * 1.1, y - s * 1.1, s * 2.2, s * 2.2);
}
// un rebond doux (eBack de commun.js, avec un dépassement de 4 % au lieu de 10 %)
const rebond = k => { const c = .9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
// la nuit (FOND_NUIT de commun.js) ; sombre : assombrie (P04–P07 : 50 %)
function nuit(ctx, t, sombre = 0) { fond(ctx, t, FOND_NUIT); noir(ctx, sombre); }
// les tailles des caractères des pilules (commun.js, TAILLES : non exporté)
const TAILLES = [10, 13, 16, 20, 24];

// l'atlas des caractères qui s'envolent (commun.js, glyphes() : non exporté, recopié) : (couleur, pas vers la craie,
// caractère), dessinés à 36 px dans des cases de 40, posés à la taille voulue par drawImage
const GW = 40, TEINTES = [GRIS_FIG, BLEU, ROUGE];
let ATLAS = null;
function atlas() {
  if (ATLAS) return ATLAS;
  const c = toile(GW * G.length * TEINTES.length, GW * 6), g = c.getContext('2d');
  g.font = `36px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  TEINTES.forEach((col, ci) => { for (let s = 0; s < 6; s++) { g.fillStyle = mix(col, CRAIE, s / 5); G.forEach((ch, gi) => g.fillText(ch, (ci * G.length + gi) * GW + GW / 2, s * GW + GW / 2)); } });
  if (typeof document === 'undefined' || !document.fonts || document.fonts.check(`36px "IBM Plex Mono"`)) ATLAS = c;
  return c;
}
// un caractère de l'atlas, centré en (x, y), d'environ « taille » px ; ci : 0 gris, 1 bleu, 2 rouge ; s : 0..5 vers la craie
function glyphe(ctx, A, ci, s, gi, x, y, taille) {
  ctx.drawImage(A, (ci * G.length + gi) * GW, s * GW, GW, GW, x - taille * .55, y - taille * .55, taille * 1.1, taille * 1.1);
}

// ================================================================ les mots (quandMot) et ce qui en découle
// Calculés une fois par écriture (?ecriture=jeu change les instants des mots : l'image suit la boîte).
const MEMO = new Map();
function rep() {
  let R = MEMO.get(ECRITURE);
  if (R) return R;
  const q = (id, mot, d) => quandMot(id, mot, d);
  R = {
    la: q('O01', 'là', 4.5),
    simple: q('O02', 'simple', 6.8), humains: q('O02', 'humains', 11.3),
    commun: q('O03', 'point commun', 13.9), memes: q('O03', 'vous-mêmes', 18.2),
    o04: REPLIQUE.O04.de,
    bleues: q('O04', 'bleues', 24.4), rouges: q('O04', 'rouges', 25.2), semaines: q('O04', 'quelques semaines', 26.3),
    resultats: q('O05', 'résultats', 30.8), deroutants: q('O05', 'déroutants', 33.2),
    circule: q('O06', 'circule', 35.9), surface: q('O07', 'refait surface', 41.7),
    disputes: q('O07', 'disputes', 44.6), interminables: q('O07', 'interminables', 46.6),
    egoistes: q('O08', 'égoïstes', 50.7), assassins: q('O08', 'assassins', 52.1),
    idiots: q('O09', 'idiots', 56.0), entrainer: q('O09', 'entraîner', 60.1), finO09: REPLIQUE.O09.de + REPLIQUE.O09.dite,
    detester: q('O10', 'détester', 67.3),
    accord: q('O11', "mettre d'accord", 71.8), comprendre: q('O11', 'comprendre', 75.0),
    pourquoi: q('O11', 'pourquoi', 76.0), deuxPilules: q('O11', 'deux pilules', 78.2),
  };
  // P04 : les coups de pouce qui font défiler le fil (inertie : chaque coup s'amortit en exponentielle)
  R.coups = [[35.25, 110, .45]];
  for (let k = 0, tf = R.circule + .05; tf < R.surface - .45; k++) { R.coups.push([tf, 290 + 170 * hache(k * 7 + 1), .3]); tf += Math.max(.38, .72 - .045 * k); }
  // « refait surface » : la première carte du dilemme sous l'écran remonte en tête, d'un coup ; elle s'y pose (y 56) à
  // la fin du saut, les coups d'avant amortis compris
  R.saut = 0;
  const D0 = defileBrut(R.surface, R), D1 = defileBrut(R.surface + .6, R);
  for (let n = 2; ; n += 4) { if (40 + PAS * n - D0 > ZONE_UTILE) { R.saut = 40 + PAS * n - D1 - 56; R.nSurface = n; break; } }
  R.v48 = (defileBrut(B.P04[1], R) - defileBrut(B.P04[1] - .01, R)) / .01;   // la vitesse du fil à la fin de P04
  // P07 : le mur s'arrête, puis part en caractères (les gris d'abord, nos deux colonnes en dernier)
  const Dc = Math.max(1.2, R.comprendre - R.accord);
  R.gris = [R.accord, R.accord + .55 * Dc];
  R.nous = [R.accord + .55 * Dc, R.comprendre - .1];
  R.fD = Math.max(0, (R.deuxPilules - R.comprendre - 1.4) / 1.3);   // les retards des caractères, pour finir sur « deux pilules »
  R.humeurs = [
    [R.la - .05, 'grand', .25], [R.la + .6, 'neutre', .5],
    [R.memes, 'plisse'], [R.memes + 1.3, 'neutre'],
    [R.deroutants, 'doute', .3], [B.P04[0], 'neutre', .4],
    [R.detester, 'bas'], [B.P07[0] + .3, 'neutre', .6],
    [R.pourquoi, 'curieux'], [B.P07[1] - .4, 'neutre', .6],
  ];
  MEMO.set(ECRITURE, R);
  R.regard = regardLot(R);
  return R;
}

// ================================================================ l'œil : sa place, plan par plan
const OE = (x, y, s) => Object.freeze({ x, y, s });
const O_NUIT = OE(960, 420, 300), O_P02 = OE(960, 420, 270), O_P03 = OE(960, 300, 220), O_P04 = OE(1650, 170, 140);
const O_FILET = OE(960, 90, 100), O_P07 = OE(960, 200, 200), O_P08 = OE(960, 250, 140), O_TEST = OE(650, 240, 220);
function placeOeil(t) {
  const R = rep();
  if (t < B.P04[0]) return cles(t, [[0, O_NUIT], [R.simple, O_NUIT], [R.simple + .5, O_P02], [R.o04 + .2, O_P02], [R.o04 + 1.2, O_P03]]);
  if (t < B.P05[0]) return O_P04;
  if (t < B.P07[0]) return cles(t, [[B.P05[0], O_P04], [B.P05[0] + .8, O_FILET]]);
  if (t < B.P08[0]) return cles(t, [[B.P07[0], O_FILET], [B.P07[0] + 1, O_P07]]);
  return cles(t, [[B.P08[0], O_P07], [B.P08[0] + .6, O_P08], [P8.oeil, O_P08], [B.P08[1], O_TEST]]);
}
function etatPhi(t) {
  const R = rep(), O = placeOeil(t), h = humeur(t, R.humeurs), ey = O.y + flotte(t);
  const g = R.regard.pupille(t, O.x, ey, h.r);
  return { O, h, g, centre: { x: O.x, y: ey } };
}
const dessinePhi = (ctx, t, P, o = {}) => oeil(ctx, t, { x: P.O.x, y: P.O.y, taille: P.O.s, humeur: P.h, regard: P.g, ...o });

// ================================================================ P02–P03 : le sujet, et la caméra qui pousse
// Un bonhomme du film (DEMO[0] : un sujet de démonstration quelconque, jamais le N°48), ×3 (cs 12), GRIS_FIG.
const SUJET = DEMO[0], SUJ = Object.freeze({ x: 430, y: 650, cs: 12 });
// P02 : la très lente poussée ×1 → ×1,05 sur l'œil ; P03 la garde (fixe), pour que le sujet ne saute pas à la coupe
const CAM_P02 = Object.freeze([[B.P02[0], 960, 420, 960, 420, 1], [B.P02[1], 960, 420, 960, 420, 1.05]]);
const CAM_P03 = cadre(960, 420, 960, 420, 1.05);
const camSujet = t => (t < B.P02[1] ? camera(t, CAM_P02) : CAM_P03);
const visageSujet = t => { const c = camSujet(t); return c.ecran(SUJ.x, SUJ.y - 2 * SUJ.cs); };
const PIL_P03 = Object.freeze([[640, 330], [1280, 330]]);
function etatSujet(t, phiMonde, cam) {
  const R = rep();
  const e = { col: GRIS_FIG, a: eIO(seg(t, R.humains, R.humains + .8)), phi: phiMonde, cible: phiMonde, fixe: false, reflet: false };
  if (t >= R.humains + .5 && t < R.memes) { e.fixe = true; e.reflet = true; }      // il lève les yeux vers Phi
  if (t >= R.memes && t < R.memes + 2.4) e.mode = 'penaud';                         // « vous-mêmes » : ses pieds
  // P03 : la bleue, puis la rouge, l'une après l'autre ; puis la jauge qui hésite ; Phi entre deux
  const vers = (x, y) => { e.fixe = true; e.reflet = false; e.cible = cam.monde(x, y); };
  if (t >= R.bleues + .3 && t < R.bleues + 1.1) vers(...PIL_P03[0]);
  else if (t >= R.rouges + .3 && t < R.rouges + 1.2) vers(...PIL_P03[1]);
  else if (t >= R.rouges + 1.2 && t < R.semaines + .4) { e.fixe = true; e.reflet = true; }
  else if (t >= R.resultats + .6 && t < R.deroutants) vers(960, 640);
  else if (t >= R.deroutants + .3 && t < B.P03[1]) { e.fixe = true; e.reflet = true; }
  return e;
}
// le « ? » (DotGothic16, GRIS) : il s'allume en grandissant (eBack), comme les « ? » du film
function interrogation(ctx, t, x, y, t0, t1, taille) {
  if (t < t0) return;
  const k = eOut(seg(t, t0, t0 + .3)), a = seg(t, t0, t0 + .15) * (1 - seg(t, t1, t1 + .4));
  if (a <= 0 || k <= 0) return;
  ctx.globalAlpha = a; ctx.font = `${Math.max(1, Math.round(taille * (.6 + .4 * k)))}px ${PIX}`; ctx.fillStyle = GRIS;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', x, y);
  ctx.globalAlpha = 1;
}
const TAILLE_Q = 48;   // EPISODE.md dit 22 px ; à cs 12 (×3), 22 px se perdait : 48, le rapport des « ? » du film (18 px à cs 4)

// le monde des trois premiers plans : la nuit, la lueur de l'œil, le sujet (sous la caméra) ; rend la caméra
function mondeNuit(ctx, t, P) {
  const R = rep(), cam = camSujet(t);
  ctx.save(); cam.applique(ctx);
  fond(ctx, t, FOND_NUIT);
  ctx.restore();
  // la lueur de l'œil sur la nuit, quand il s'ouvre
  lueur(ctx, P.O.x, P.centre.y, P.O.s * 1.8, LABO, .05 * eOut(seg(t, .9, 1.9)));
  if (t >= R.humains) {
    const phi = cam.monde(P.centre.x, P.centre.y), c = cam.ecran(SUJ.x, SUJ.y);
    dessineSujet(ctx, SUJET, c.x, c.y, SUJ.cs * cam.z, etatSujet(t, phi, cam), t);
    const q = cam.ecran(SUJ.x, SUJ.y - SH * SUJ.cs / 2 - 34);
    interrogation(ctx, t, q.x, q.y, R.humains + .9, R.memes, TAILLE_Q);
  }
  return cam;
}

// ================================================================ P01 · 0,0–5,5 · L'œil s'ouvre
const OUVRE = Object.freeze([.95, 1.65]);   // les lames s'ouvrent (le déclic au début, les deux notes pendant)
function dessineP01(ctx, t) {
  const P = etatPhi(t);
  mondeNuit(ctx, t, P);
  noir(ctx, 1 - eIO(seg(t, .3, .9)));
  // l'anneau en 0,4 s (0,8–1,2), puis les lames de 0 à 12,5 en 0,7 s (0,95–1,65) : le geste de dessineP02 du film
  // (film-pilules/plans/nuit.js : l'anneau 6,0–6,4, les lames 6,3–7,0), les lames partant avant que l'anneau soit plein
  dessinePhi(ctx, t, P, { alpha: eIO(seg(t, .8, 1.2)), ouvert: eIO(seg(t, OUVRE[0], OUVRE[1])) });
}

// ================================================================ P02 · 5,5–19,7 · Une simple intelligence artificielle
function dessineP02(ctx, t) {
  const R = rep(), P = etatPhi(t);
  mondeNuit(ctx, t, P);
  // « point commun » : le même « ? », au-dessus de l'œil
  interrogation(ctx, t, P.O.x, P.centre.y - P.O.s / 2 - 40, R.commun, R.memes, TAILLE_Q);
  dessinePhi(ctx, t, P);
}

// ================================================================ P03 · 19,7–35,0 · Le test, il y a quelques semaines
const TEST01 = 'test 01 · les deux pilules';
// la tête de la jauge : entre 30 et 70 %, sans jamais se poser ; elle s'emballe sur « déroutants »
function teteJauge(t) {
  const R = rep(), u = t + 2.4 * eIO(seg(t, R.deroutants, R.deroutants + .9));
  return 50 + 20 * (.62 * Math.sin(1.9 * u + .4) + .38 * Math.sin(3.3 * u + 2.1));
}
const JAUGE = Object.freeze({ x: 660, y: 633, w: 600 });
const pointJauge = t => point(JAUGE.x + JAUGE.w * teteJauge(t) / 100, JAUGE.y + 7);
function dessineP03(ctx, t) {
  const R = rep(), P = etatPhi(t);
  mondeNuit(ctx, t, P);
  // la bleue, la rouge (pilule() de commun.js, ps 0,35 : les caractères arrivent des bords)
  pilule(ctx, t, 0, { x: PIL_P03[0][0], y: PIL_P03[0][1], ps: .35, t0: R.bleues - .3, lab: R.bleues + 2.1 });
  pilule(ctx, t, 1, { x: PIL_P03[1][0], y: PIL_P03[1][1], ps: .35, t0: R.rouges - .3, lab: R.rouges + 2.1 });
  // « test 01 · les deux pilules », tapé sous l'œil (24 car./s, le curseur LABO)
  carton(ctx, t, { y: 560, lignes: [{ txt: TEST01, taille: 18, font: MONO, col: GRIS, t0: R.semaines, cps: 24 }] });
  // la jauge d'index.html, vide, son trait des 50 % ; ni valeur, ni seuil écrit : aucun chiffre
  const a = seg(t, R.resultats - .1, R.resultats + .3);
  if (a > 0) {
    const k = eOut(seg(t, R.resultats + .2, R.resultats + .9)), x = teteJauge(t);
    jauge(ctx, { ...JAUGE, style: 'demo', bleue: x * k, rouge: (100 - x) * k, valeurs: false, seuil: null, a });
  }
  dessinePhi(ctx, t, P, { secoue: R.deroutants });
}

// ================================================================ P04 · 35,0–48,4 · Le fil
// Le fil au centre (x 640–1 280) : les cartes FIL de commun.js (une sur quatre : la carte du dilemme), qui défilent
// vers le haut. Le défilement : un pouce lent, des coups qui s'amortissent (l'inertie), « refait surface » (la carte du
// dilemme remonte en tête, avec un petit rebond), puis « interminables » : il ne s'arrête plus. Sur « disputes », sous
// chaque carte du dilemme, les réponses s'empilent (en retrait, bleues et rouges en alternance, de plus en plus serrées).
const FX = 640, FW = 640, PAS = CARTE_H + CARTE_GAP;
function defileBrut(t, R) {
  if (t <= B.P04[0]) return 0;
  let D = 42 * (Math.min(t, R.surface) - B.P04[0]) + 18 * Math.max(0, t - R.surface);
  for (const [tf, A, tau] of R.coups) if (t > tf) D += A * (1 - Math.exp(-(t - tf) / tau));
  if (t > R.surface) D += R.saut * rebond(seg(t, R.surface, R.surface + .6));
  if (t > R.interminables) D += .5 * 1300 * (t - R.interminables) ** 2;
  return D;
}
// après P04 (le dédoublement de P05), le fil lancé s'amortit
function defile(t) {
  const R = rep();
  if (t <= B.P04[1]) return defileBrut(t, R);
  return defileBrut(B.P04[1], R) + R.v48 * .3 * (1 - Math.exp(-(t - B.P04[1]) / .3));
}
// les réponses : leur nombre (fractionnaire : la dernière arrive), et la place qu'elles prennent sous la carte du dilemme
const reponses = t => 9 * Math.pow(seg(t, rep().disputes, rep().disputes + 2.6), 1.35);
const ECARTS = [...Array(10).keys()].map(k => (k === 0 ? CARTE_H + 10 : 18 + 60 * Math.pow(.72, k - 1)));
const placeReponses = r => ECARTS.reduce((s, g, k) => s + g * eOut(clamp(r - k, 0, 1)), 0);
const REPONSES = new Map();
function reponse(n, j) {
  const cle = n * 16 + j;
  if (!REPONSES.has(cle)) REPONSES.set(cle, Object.freeze({ i: 600 + cle, camp: (j + (n >> 2)) % 2 ? 'rouge' : 'bleu', barres: 2, retrait: true }));
  return REPONSES.get(cle);
}
// les cartes du fil à l'instant t : [{ c, y, a, n, j (−1 : une carte du fil ; sinon la j-ième réponse) }], dans l'ordre
// où on les dessine
function cartesFil(t) {
  const D = defile(t), r = reponses(t), Gr = placeReponses(r), P4 = 4 * PAS + Gr, out = [];
  for (let n = Math.max(0, 4 * Math.floor((D - 40) / P4) - 4); ; n++) {
    const y = 40 + PAS * n + Math.floor((n + 1) / 4) * Gr - D;
    if (y > ZONE_UTILE + 60) break;
    const c = FIL[n % FIL.length];
    if (y + CARTE_H > -20) out.push({ c, y, a: 1, n, j: -1 });
    if (c.dilemme && r > 0) {
      let yy = y;
      for (let j = 0; j < Math.ceil(r); j++) {
        const qj = clamp(r - j, 0, 1); yy += ECARTS[j] * eOut(qj);
        if (yy > ZONE_UTILE + 60) break;
        if (yy + CARTE_H > -20) out.push({ c: reponse(n, j), y: yy, a: Math.min(1, qj * 2), n, j });
      }
    }
  }
  return out;
}
// la carte du dilemme que Phi lit : la plus haute à l'écran (ou rien : il l'a perdue)
function dilemmeLu(T) {
  if (T < B.P04[0] || T >= B.P04[1]) return null;
  const d = cartesFil(T).find(o => o.j < 0 && o.c.dilemme && o.y > 10 && o.y < 700);
  return d ? point(FX + 230, d.y + 64) : null;
}
const carteAuHasard = (T, liste) => (liste.length ? liste[Math.floor(hache(Math.floor(T / .8) * 37 + 5) * liste.length)] : null);
// « refait surface » : la carte du dilemme qui remonte en tête s'éclaire (son bord CRAIE), le temps qu'on la suive
function surface(ctx, t, cartes) {
  const R = rep(), a = .9 * seg(t, R.surface, R.surface + .2) * (1 - seg(t, R.surface + .9, R.surface + 1.7));
  if (a <= 0) return;
  const o = cartes.find(o => o.j < 0 && o.n === R.nSurface);
  if (!o) return;
  ctx.save(); ctx.globalAlpha = a; cheminPixel(ctx, FX, o.y, FW, CARTE_H, 12, 4); ctx.strokeStyle = CRAIE; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
}
function dessineP04(ctx, t) {
  nuit(ctx, t, .5);
  const cartes = cartesFil(t);
  for (const o of cartes) carte(ctx, t, o.c, FX, o.y, FW, { a: o.a });
  surface(ctx, t, cartes);
  pied(ctx);   // (au montage) les cartes qui montent de sous la boîte s'y lisaient à travers : elles sortent de la nuit
  dessinePhi(ctx, t, etatPhi(t));
}

// ================================================================ P05 · 48,4–63,1 · Égoïstes, assassins, idiots
// Les deux colonnes de commun.js (FIL_COLONNES, CARTES_COLONNES, MOTS_FIL), dessinées comme colonnesFil les dessine
// (au repos, la même image : P65 et P78 les reprennent), avec ce que P05 y ajoute : la carte qui reçoit le mot plonge
// d'un rien et s'éclaire, les flèches de réponse traversent le filet.
const motsInstants = R => [R.egoistes, R.assassins, R.idiots, R.entrainer];
const yCol = k => 40 + k * PAS;
// o : { a, dx(col) (décalage en x : le dédoublement), mots (j → alpha), bosse (col, k → dy), eclat (col, k → alpha
//       du bord éclairé), toutes (les huit cartes, même sous la boîte : le recul), sauf (col, k → true : ne pas la
//       dessiner), coupe (col, k → la part haute de la carte qui reste, 0..1 : la dissolution) }
function colonnes(ctx, T, o = {}) {
  const a = o.a ?? 1; if (a <= .001) return;
  for (const col of [0, 1]) {
    const C = FIL_COLONNES[col], dx = o.dx ? o.dx(col) : 0;
    CARTES_COLONNES[col].forEach((c, k) => {
      const y = yCol(k) + (o.bosse ? o.bosse(col, k) : 0);
      if (!o.toutes && (y > ZONE_UTILE + 40 || y + CARTE_H < -20)) return;
      if (o.sauf && o.sauf(col, k)) return;
      const reste = o.coupe ? o.coupe(col, k) : 1;
      if (reste <= 0) return;
      const j = MOTS_FIL.findIndex(m => m.col === col && m.k === k);
      const opts = { a, mot: j >= 0 ? MOTS_FIL[j].txt : null, motA: j >= 0 ? (o.mots ? o.mots(j) : 1) : 0 };
      if (reste < 1) { ctx.save(); ctx.beginPath(); ctx.rect(C.x + dx - 10, y - 10, C.w + 20, 10 + CARTE_H * reste); ctx.clip(); }
      carte(ctx, T, c, C.x + dx, y, C.w, opts);
      if (reste < 1) ctx.restore();
      const ec = o.eclat ? o.eclat(col, k) : 0;
      if (ec > 0) {
        const xr = C.x + dx + (c.retrait ? 40 : 0), wr = C.w - (c.retrait ? 40 : 0);
        ctx.save(); ctx.globalAlpha = ec * a; cheminPixel(ctx, xr, y, wr, CARTE_H, 12, 4); ctx.strokeStyle = CRAIE; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      }
    });
  }
}
// les flèches de réponse : de la carte qui parle vers la carte d'en face (MOTS_FIL[j] : [col, k] → [col, k]),
// horizontales (la pointe en pixels de flechePixel est nette à l'horizontale) ; celles qui vont à droite passent
// un peu plus haut que celles qui reviennent
const FLECHES = Object.freeze([
  { j: 0, de: [0, 1], vers: [1, 1], dy: -22 }, { j: 1, de: [0, 2], vers: [1, 2], dy: -22 },
  { j: 2, de: [1, 1], vers: [0, 1], dy: 22 }, { j: 3, de: [1, 3], vers: [0, 3], dy: 22 },
]);
const bordCarte = ([col, k], cote, dy = 0) => {
  const C = FIL_COLONNES[col], c = CARTES_COLONNES[col][k];
  const x = cote > 0 ? C.x + C.w : C.x + (c.retrait ? 40 : 0);
  return { x, y: yCol(k) + CARTE_H / 2 + dy };
};
const centreCarte = ([col, k]) => point(FIL_COLONNES[col].x + FIL_COLONNES[col].w / 2, yCol(k) + CARTE_H / 2);
function fleches(ctx, t, a = 1) {
  const R = rep(), I = motsInstants(R);
  for (const F of FLECHES) {
    const t0 = I[F.j] + .08; if (t < t0) continue;
    const gauche = F.de[0] === 0, A = bordCarte(F.de, gauche ? 1 : -1, F.dy), Bv = bordCarte(F.vers, gauche ? -1 : 1, F.dy);
    const k = eOut(seg(t, t0, t0 + .35)), L = Math.hypot(Bv.x - A.x, Bv.y - A.y), ux = (Bv.x - A.x) / L, uy = (Bv.y - A.y) / L;
    const b = 12 * Math.sin(Math.PI * seg(t, t0 + .35, t0 + .6));   // elle rebondit sur la carte
    const al = a * (1 - .45 * seg(t, t0 + 1.2, t0 + 1.8));
    flechePixel(ctx, A.x + ux * 6, A.y + uy * 6, Bv.x + ux * (b - 6), Bv.y + uy * (b - 6), { col: CRAIE, lw: 1.5, k, a: al, c: 4 });
  }
}
// le filet laiton, interrompu autour de l'œil quand il est posé dessus (film-pilules/plans/issue.js le fait ainsi)
function filetSousOeil(ctx, y1, P, a = 1) {
  if (Math.abs(P.O.x - 960) < 2) {
    const h0 = P.centre.y - P.O.s * .5 - 8, h1 = P.centre.y + P.O.s * .5 + 8;
    filet(ctx, 960, 0, Math.min(y1, h0), a); if (y1 > h1) filet(ctx, 960, h1, y1, a);
  } else filet(ctx, 960, 0, y1, a);
}
function optionsColonnes(t) {
  const R = rep(), I = motsInstants(R);
  const qui = (col, k) => MOTS_FIL.findIndex(m => m.col === col && m.k === k);
  return {
    mots: j => seg(t, I[j], I[j] + .12),
    bosse: (col, k) => { const j = qui(col, k); return j < 0 ? 0 : 7 * Math.sin(Math.PI * seg(t, I[j], I[j] + .3)); },
    eclat: (col, k) => { const j = qui(col, k); return j < 0 || t < I[j] ? 0 : .9 * (1 - seg(t, I[j], I[j] + .7)); },
  };
}
function dessineP05(ctx, t) {
  nuit(ctx, t, .5);
  const k = eIO(seg(t, B.P05[0], B.P05[0] + .8)), P = etatPhi(t);
  // le fil de P04 se dédouble : ses cartes à avatar bleu glissent à gauche, les rouges à droite, et s'effacent
  const aF = 1 - seg(t, B.P05[0] + .15, B.P05[0] + .55);
  if (aF > 0) for (const o of cartesFil(t)) {
    const C = FIL_COLONNES[o.c.camp === 'rouge' ? 1 : 0];
    carte(ctx, t, o.c, lerp(FX, C.x, k), o.y, lerp(FW, C.w, k), { a: o.a * aF });
  }
  // les deux colonnes paraissent, venues du centre
  colonnes(ctx, t, { a: seg(t, B.P05[0] + .3, B.P05[0] + .7), dx: col => lerp(FX - FIL_COLONNES[col].x, 0, k), ...optionsColonnes(t) });
  filetSousOeil(ctx, ZONE_UTILE * eOut(seg(t, B.P05[0] + .3, B.P05[0] + 1.1)), P);
  fleches(ctx, t);
  pied(ctx);   // (au montage) comme en P04, P06 et P07 : rien du fil ne se lit à travers la boîte
  ombreOeil(ctx, P.O.x, P.centre.y, P.O.s, Math.sin(Math.PI * k));   // l'œil passe sur les cartes en gagnant le filet
  dessinePhi(ctx, t, P);
}

// ================================================================ P06–P07 : le mur de fils
// Une quinzaine d'autres fils autour des nôtres, tout gris (avatars GRIS_FIG, barres grises), chacun à son rythme :
// d'autres disputes. Chaque fil est une colonne de cartes de 660 px, dessinée une fois dans une toile (quatre toiles,
// mémoires de calcul), puis posée carte par carte, décalée. La grille : des colonnes tous les 860 px (les nôtres sont
// en x 200 et 1 060), des rangées tous les 1 200 px (les nôtres en y 40, 1 072 px de haut).
// Le recul : ×1 → ×0,45 autour de (960, 540), en échelle logarithmique (camera() de commun.js) : nos deux colonnes
// deviennent un petit carré au centre (y 315–797), l'œil au-dessus.
const CAM_MUR = Object.freeze([[B.P06[0], 960, 540, 960, 540, 1], [B.P06[0] + 3, 960, 540, 960, 540, .45]]);
const camMur = t => camera(t, CAM_MUR);
const PAR_TOILE = 10, HAUT_TOILE = PAR_TOILE * PAS, HAUT_FIL = 7 * PAS + CARTE_H;   // 1 360 ; 1 072
const TOILES = [];
function toileMur(v) {
  if (TOILES[v]) return TOILES[v];
  const c = toile(660, HAUT_TOILE), g = c.getContext('2d');
  for (let k = 0; k < PAR_TOILE; k++) {
    const n = 700 + v * 40 + k;
    carte(g, 0, Object.freeze({ i: n, camp: 'gris', barres: 2 + (hache(n * 7 + 3) < .45 ? 1 : 0), retrait: hache(n * 11 + 1) < .22 }), 0, k * PAS, 660, {});
  }
  TOILES[v] = c;
  return c;
}
const MUR = Object.freeze((() => {
  const out = [];
  for (let m = -1; m <= 1; m++) for (let n = -2; n <= 3; n++) {
    if (m === 0 && (n === 0 || n === 1)) continue;
    const id = out.length, h1 = hache(id * 13 + 7), h2 = hache(id * 29 + 3);
    out.push(Object.freeze({ id, x: 200 + 860 * n, y: 40 + 1200 * m, v: Math.floor(hache(id * 5 + 1) * 4), vit: 28 + 70 * h1, ph: h2 * HAUT_TOILE, osc: 30 + 50 * h2 }));
  }
  return out;
})());
// le temps du mur : il défile, puis s'arrête sur « mettre d'accord » (une décélération de 0,8 s)
function tempsMur(t) {
  const t1 = rep().accord - .8, D = .8;
  if (t < t1) return t;
  if (t < t1 + D) { const u = t - t1; return t1 + u - u * u / (2 * D); }
  return t1 + D / 2;
}
const decalage = (F, t) => { const u = tempsMur(t); return (((F.vit * u + F.ph + F.osc * Math.sin(u * .9 + F.id)) % HAUT_TOILE) + HAUT_TOILE) % HAUT_TOILE; };
// les cartes visibles d'un fil, dans sa fenêtre (0..HAUT_FIL) : [{ k, y0 (le haut de la carte dans le monde), v0, v1
// (la part visible : de v0 à v1 px depuis le haut de la carte) }]
function cartesMur(F, t) {
  const o = decalage(F, t), out = [];
  for (let k = 0; k < PAR_TOILE; k++) for (const s of [0, HAUT_TOILE]) {
    const yl = k * PAS + s - o, v0 = Math.max(0, -yl), v1 = Math.min(CARTE_H, HAUT_FIL - yl);
    if (v1 - v0 > 1) out.push({ k, y0: F.y + yl, v0, v1, cle: F.id * 64 + k * 2 + (s ? 1 : 0) });
  }
  return out;
}
// le mur : chaque carte posée de sa toile ; reste (cle, y0) → la part haute qui reste (0..1, la dissolution)
function dessineMur(ctx, t, reste) {
  for (const F of MUR) {
    const im = toileMur(F.v);
    for (const c of cartesMur(F, t)) {
      const r = reste ? reste(c) : 1; if (r <= 0) continue;
      const v1 = Math.min(c.v1, CARTE_H * r); if (v1 - c.v0 <= 1) continue;
      ctx.drawImage(im, 0, c.k * PAS + c.v0, 660, v1 - c.v0, F.x, c.y0 + c.v0, 660, v1 - c.v0);
    }
  }
}
// le balayage de Phi sur le mur (P06) : un fil après l'autre, à l'écran. Chaque fixation se décide à son début, quand
// le recul n'en est qu'à ×0,8–0,9 : les fils visés étaient encore hors du cadre, et la pupille se collait au bord de
// l'iris (il fixait le vide pendant que les fils entraient). Il regarde donc où chaque fil va se poser (le cadrage
// final, CAM_FIN), dans sa part qui sera à l'écran (window.film.regardHors() le vérifie).
const BALAYAGE = Object.freeze([[-1, -1], [2, -1], [3, 0], [-2, 0], [-1, -1], [0, -1], [2, 0]]);
function pointMur(T) {
  const j = Math.floor((T - B.P06[0] - .3) / .5);
  if (j < 0 || j >= BALAYAGE.length) return null;
  const [n, m] = BALAYAGE[j], p = CAM_FIN.ecran(200 + 860 * n + 330, 40 + 1200 * m + 536);
  return point(clamp(p.x, 40, 1880), clamp(p.y, 40, 800));
}
const centreNotre = T => camMur(T).ecran(960, 40 + HAUT_FIL / 2);
// les fils qu'on voit au-dessus de la boîte, une fois le recul fait (Phi y pose les yeux quand ils partent en caractères)
const CAM_FIN = cadre(960, 540, 960, 540, .45);
const MUR_VU = Object.freeze(MUR.filter(F => { const c = CAM_FIN.ecran(F.x + 330, F.y + 536); return c.x > 80 && c.x < 1840 && c.y > 40 && c.y < 800; }));
// le filet laiton sous la caméra du mur, interrompu autour de l'œil (qui est à l'écran, hors caméra)
function filetMonde(ctx, cam, y1, P, a = 1) {
  const h0 = cam.monde(0, P.centre.y - P.O.s * .5 - 8).y, h1 = cam.monde(0, P.centre.y + P.O.s * .5 + 8).y;
  if (Math.abs(P.O.x - 960) > P.O.s * .6) { filet(ctx, 960, 0, y1, a); return; }
  if (h0 > 0) filet(ctx, 960, 0, Math.min(y1, h0), a);
  if (y1 > Math.max(0, h1)) filet(ctx, 960, Math.max(0, h1), y1, a);
}

// la dissolution (P07) : chaque carte part en caractères, du bas vers le haut (un trait qui remonte la carte, et les
// caractères qui s'en envolent, comme la mort des sujets du film). Les grises d'abord (R.gris), nos deux colonnes en
// dernier (R.nous). Les caractères des cartes bleues et rouges ne s'en vont pas : ils flottent, puis deviennent les
// deux pilules (P07, « comprendre »).
const ENVOL = 1.3;
const departCarte = (cle, R) => lerp(R.gris[0], R.gris[1] - .5, hache(cle * 7 + 11));
const resteCarte = (td, t) => 1 - seg(t, td, td + .5);
const PAR_CARTE = 22;
function envols(ctx, t, A, cartes) {   // cartes : [{ x, y0, v0, v1, td, cle }] (le monde)
  for (const c of cartes) {
    if (t < c.td || t > c.td + .5 + ENVOL) continue;
    for (let i = 0; i < PAR_CARTE; i++) {
      const h = c.cle * 131 + i * 17, u = hache(h + 1), v = c.v0 + (c.v1 - c.v0) * hache(h + 2);
      const tl = c.td + .5 * (1 - v / CARTE_H), a = t - tl;   // le trait passe sur lui : il part
      if (a < 0 || a > ENVOL) continue;
      const q = a / ENVOL, vit = .7 + .6 * hache(h + 3), ph = hache(h + 4) * 6.283;
      const x = c.x + 20 + u * 620 + Math.sin(a * 5 + ph) * 14 * a, y = c.y0 + v - Math.pow(a, 1.4) * 150 * vit;
      ctx.globalAlpha = .9 * (1 - q);
      glyphe(ctx, A, 0, Math.min(5, Math.round(q * 5)), Math.floor(hache(h + 5) * G.length), x, y, 26);
    }
  }
  ctx.globalAlpha = 1;
}
function cartesGrises(t, R) {
  const out = [];
  for (const F of MUR) for (const c of cartesMur(F, t)) out.push({ ...c, x: F.x, td: departCarte(c.cle, R) });
  // les cartes du dilemme de nos deux colonnes (grises) partent avec elles
  for (const col of [0, 1]) out.push({ k: 0, x: FIL_COLONNES[col].x, y0: yCol(0), v0: 0, v1: CARTE_H, cle: 9000 + col, td: departNous(col, 0, R) });
  return out;
}
// nos cartes : de la plus basse à la plus haute, la gauche un rien avant la droite
const departNous = (col, k, R) => lerp(R.nous[0], R.nous[1] - .5, (7 - k) / 7) + col * .04;

// ---------------------------------------------------------------- les caractères de nos cartes, qui deviennent les pilules
// Chaque caractère des deux pilules (PILULES de commun.js, 380 chacune) part d'une de nos cartes : la bleue des cartes
// bleues (colonne de gauche, k 1 à 7), la rouge des rouges. Il flotte un peu au-dessus de sa carte, puis, sur
// « comprendre », il rejoint sa place dans la pilule (la même courbe que pilule() : à l'arrivée, la même image, et
// pilule() prend le relais). Les retards de pilule() sont étirés pour que les deux pilules soient entières sur « deux
// pilules ».
const PIL_P07 = Object.freeze([[700, 470], [1220, 470]]), PS7 = .8;
const COL_ATLAS = c => (c === BLEU ? 1 : c === ROUGE ? 2 : -1);
function sourceCaractere(i, n) {
  const k = 1 + (n % 7), C = FIL_COLONNES[i], c = CARTES_COLONNES[i][k], x0 = C.x + (c.retrait ? 40 : 0);
  const u = hache(n * 17 + 3 + i * 5000), v = 8 + 104 * hache(n * 29 + 5 + i * 5000);
  return { k, x: x0 + 18 + u * (C.w - (c.retrait ? 40 : 0) - 36), y: yCol(k) + v, v, ph: hache(n * 41 + 7 + i * 5000) * 6.283 };
}
function pilulesNaissantes(ctx, t, cam) {
  const R = rep(), A = atlas();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const i of [0, 1]) {
    const Pi = PILULES[i], [px, py] = PIL_P07[i], an = Pi.ang * Math.PI / 180, ca = Math.cos(an), sa = Math.sin(an);
    const fl = Math.sin(t * 1.1 + Pi.ph) * 6 * PS7;
    let cur = -1;
    Pi.pts.forEach((p, n) => {
      const S = sourceCaractere(i, n), td = departNous(i, S.k, R), tl = td + .5 * (1 - S.v / CARTE_H);
      if (t < tl) return;
      const tf = R.comprendre + p.delay * R.fD, k = t < tf ? 0 : eOut(clamp((t - tf) / 1.4, 0, 1));
      const hx = px + PS7 * (p.lx * ca - p.ly * sa), hy = py + fl + PS7 * (p.lx * sa + p.ly * ca);
      const fin = Math.min(1, p.al * (.62 + .38 * Math.sin(t * p.w + p.ph)));
      if (k >= 1) {   // posé : exactement pilule()
        if (p.si !== cur) { cur = p.si; ctx.font = `${Math.round(TAILLES[cur] * PS7)}px ${MONO}`; }
        ctx.globalAlpha = fin; ctx.fillStyle = p.c;
        ctx.fillText(G[(p.g + (p.fl ? Math.floor(t * p.fl) : 0)) % G.length], hx, hy);
        return;
      }
      // il flotte au-dessus de sa carte (le monde, sous la caméra du mur), puis il vole (l'écran)
      const flotteA = a => cam.ecran(S.x + Math.sin(a * 1.6 + S.ph) * 8, S.y - 46 * eOut(Math.min(1, a / 1.1)) - 5 * a);
      const s0 = flotteA((t < tf ? t : tf) - tl);
      let x = s0.x, y = s0.y;
      if (k > 0) {
        const dx = hx - s0.x, dy = hy - s0.y, L = Math.hypot(dx, dy) || 1, sw = Math.sin(Math.PI * k) * p.sw;
        x = s0.x + dx * k - dy / L * sw; y = s0.y + dy * k + dx / L * sw;
      }
      ctx.globalAlpha = lerp(.85, fin, k);
      const ci = COL_ATLAS(p.c), gi = (p.g + Math.floor(t * (p.fl || 5))) % G.length, taille = TAILLES[p.si] * lerp(cam.z, PS7, k);
      glyphe(ctx, A, Math.max(0, ci), ci < 0 ? 5 : 0, gi, x, y, taille);
    });
  }
  ctx.globalAlpha = 1;
}
// les deux pilules de P07–P08 : en train de naître, puis entières (pilule()), puis qui éclatent (P08)
function deuxPilules(ctx, t, cam) {
  const R = rep();
  if (t < R.deuxPilules) { pilulesNaissantes(ctx, t, cam); return; }
  for (const i of [0, 1]) pilule(ctx, t, i, { x: PIL_P07[i][0], y: PIL_P07[i][1], ps: PS7, eclat: P8.eclat });
}

// le pied de l'image (P04–P07) : le fil, puis le mur, s'enfoncent dans la nuit sous la zone utile, pour que la mention,
// sous la boîte, reste lisible, et que rien ne se lise à travers la boîte (rien d'important n'y est)
function pied(ctx, a = 1) {
  if (a <= 0) return;
  const g = ctx.createLinearGradient(0, ZONE_UTILE - 30, 0, ZONE_UTILE + 150);
  g.addColorStop(0, rgba(NUIT, 0)); g.addColorStop(1, rgba(NUIT, .94));
  ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(0, ZONE_UTILE - 30, W, H - ZONE_UTILE + 30); ctx.globalAlpha = 1;
}

// ================================================================ P06 · 63,1–68,7 · Assez de raisons
function dessineP06(ctx, t) {
  nuit(ctx, t, .5);
  const cam = camMur(t), P = etatPhi(t);
  ctx.save(); cam.applique(ctx);
  dessineMur(ctx, t);
  colonnes(ctx, t, { toutes: true });
  filetMonde(ctx, cam, lerp(ZONE_UTILE, 40 + HAUT_FIL, seg(t, B.P06[0], B.P06[0] + .8)), P);
  fleches(ctx, t);
  ctx.restore();
  pied(ctx);
  ombreOeil(ctx, P.O.x, P.centre.y, P.O.s, 1);
  dessinePhi(ctx, t, P);
}

// ================================================================ P07 · 68,7–80,2 · Pourquoi tant de haine
function dessineP07(ctx, t) {
  const R = rep(), cam = camMur(t), P = etatPhi(t);
  nuit(ctx, t, .5 * (1 - eIO(seg(t, R.comprendre + .5, R.comprendre + 2.5))));
  ctx.save(); cam.applique(ctx);
  dessineMur(ctx, t, c => resteCarte(departCarte(c.cle, R), t));
  colonnes(ctx, t, { toutes: true, coupe: (col, k) => resteCarte(departNous(col, k, R), t) });
  filetMonde(ctx, cam, 40 + HAUT_FIL, P, 1 - seg(t, R.nous[0], R.nous[0] + .8));
  fleches(ctx, t, 1 - seg(t, R.accord, R.accord + .6));
  envols(ctx, t, atlas(), cartesGrises(t, R));
  ctx.restore();
  pied(ctx, 1 - seg(t, R.nous[1], R.nous[1] + 1));
  deuxPilules(ctx, t, cam);
  ombreOeil(ctx, P.O.x, P.centre.y, P.O.s, 1 - seg(t, R.gris[0], R.gris[1]));
  dessinePhi(ctx, t, P);
}

// ================================================================ P08 · 80,2–87,8 · Générique : Xphi · Les deux pilules
// Sans voix : ses instants se calent sur ses propres bornes. Les deux pilules éclatent (pilule(…, { eclat })) ; leurs
// caractères se reposent et forment « XPHI » (DotGothic16 180 px, CRAIE, centré en (960, 470)) : le titre de P02 du
// film (titre() de film-pilules/plans/nuit.js, recopié : les points de la police relevés une fois, chacun qui vole en
// caractère et se pose en carré de craie), sauf que chaque point part d'un caractère des pilules éclatées. Dessous,
// « LES DEUX PILULES » se décode lettre à lettre entre deux mini-nuages. La nuit passe au laboratoire. Puis le titre
// rétrécit et glisse au cartouche (48, 40), où la surimpression le reprend (« XPHI » / « LES DEUX PILULES ») ; l'œil
// glisse à sa place d'index.html.
const P8 = Object.freeze({
  eclat: B.P08[0] + .3,                       // 80,5 : les pilules éclatent
  titre: B.P08[0] + .4,                       // 80,6 : les premiers caractères éclatés repartent vers « XPHI »
  sous: B.P08[0] + 2.2,                       // 82,4 : « LES DEUX PILULES »
  labo: [B.P08[0] + 3.0, B.P08[0] + 5.0],     // 83,2–85,2 : la nuit devient le laboratoire
  glisse: B.P08[1] - 1.8,                     // 86,0 : le titre glisse au cartouche (il y est à 86,6)
  oeil: B.P08[1] - 1.2,                       // 86,6 : l'œil glisse à sa place d'index.html (il y est à 87,8)
});
const TF = 180, TD = TF / 16, TITRE_Y = 470;
const SOUS = 'LES DEUX PILULES', SOUS_T = 44, SOUS_Y = 608;   // EPISODE.md dit y 560 : « XPHI » centré en 470 descend à 544
const CART_X = 70, CART_Y1 = 74, CART_Y2 = 108, CART_S = 24 / TF, CART_S2 = 24 / SOUS_T;   // le cartouche (48, 40) de commun.js
let TITRE = null;
function titre() {
  if (TITRE) return TITRE;
  const LW = 480, LH = 260, ox = 30, base = 200, c = toile(LW, LH), g = c.getContext('2d', { willReadFrequently: true });
  g.font = `${TF}px ${PIX}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = '#fff';
  g.fillText('XPHI', ox, base);
  const d = g.getImageData(0, 0, LW, LH).data, A = (x, y) => d[(Math.round(y) * LW + Math.round(x)) * 4 + 3] || 0;
  // le pas de la grille de la police : le décalage où les centres des cases tombent net (tout ou rien)
  const flou = (dx, dy) => { let s = 0; for (let y = dy + TD / 2; y < LH; y += TD) for (let x = dx + TD / 2; x < LW; x += TD) { const a = A(x, y); s += Math.min(a, 255 - a); } return s; };
  let best = [0, 0], bf = Infinity;
  for (let dy = 0; dy < TD; dy += .5) for (let dx = 0; dx < TD; dx += .5) { const f = flou(dx, dy); if (f < bf) { bf = f; best = [dx, dy]; } }
  const pts = [];
  for (let y = best[1] + TD / 2; y < LH; y += TD) for (let x = best[0] + TD / 2; x < LW; x += TD) if (A(x, y) > 127) pts.push({ x: x - ox, y: y - base });
  const x0 = Math.min(...pts.map(p => p.x)), x1 = Math.max(...pts.map(p => p.x)), y0 = Math.min(...pts.map(p => p.y)), y1 = Math.max(...pts.map(p => p.y));
  const O = { x: 960 - (x0 + x1) / 2, y: TITRE_Y - (y0 + y1) / 2 };
  const T = {
    O, x0, x1, y0, y1,
    pts: pts.map((p, k) => {
      const h1 = hache(k * 7 + 1), h2 = hache(k * 13 + 5), h3 = hache(k * 29 + 11), u = (p.x - x0) / Math.max(1, x1 - x0);
      // le caractère des pilules d'où il part : une pilule sur deux, un caractère tiré
      const i = k % 2, n = Math.floor(hache(k * 31 + 7) * PILULES[i].pts.length);
      return { ...p, h1, h2, i, n, ta: P8.titre + .45 * u + .3 * h1, dur: .5 + .25 * h2, sw: (h2 - .5) * 300, g: Math.floor(h1 * G.length), fl: 8 + h3 * 10 };
    }),
  };
  const pret = typeof document === 'undefined' || !document.fonts || document.fonts.check(`${TF}px "DotGothic16"`);
  if (pret) TITRE = T;
  return T;
}
// où est, à l'instant T, le caractère n de la pilule i qui éclate (pilule() de commun.js, eclat)
function eclate(i, n, T) {
  const Pi = PILULES[i], p = Pi.pts[n], [px, py] = PIL_P07[i], an = Pi.ang * Math.PI / 180, ca = Math.cos(an), sa = Math.sin(an);
  const ek = T >= P8.eclat ? eOut(seg(T, P8.eclat, P8.eclat + 1.6)) : 0, fl = Math.sin(T * 1.1 + Pi.ph) * 6 * PS7;
  return { x: px + PS7 * (p.lx * ca - p.ly * sa) + p.bx * p.bd * ek, y: py + fl + PS7 * (p.lx * sa + p.ly * ca) + p.by * p.bd * ek, p };
}
const kGlisse = t => eIO(seg(t, P8.glisse, P8.glisse + .6));
const blocTitre = (Ti, k) => ({ x: lerp(Ti.O.x, CART_X, k), y: lerp(Ti.O.y, CART_Y1, k), s: Math.exp(lerp(0, Math.log(CART_S), k)) });
// le front des caractères qui se posent (l'œil le suit)
function frontTitre(T) {
  const Ti = titre(); let best = null;
  for (const p of Ti.pts) if (p.ta + p.dur <= T && (!best || p.ta + p.dur > best.ta + best.dur)) best = p;
  return best && T < best.ta + best.dur + .3 ? point(Ti.O.x + best.x, Ti.O.y + best.y) : null;
}
function dessineTitre(ctx, t) {
  // La surimpression fait paraître le cartouche « XPHI / LES DEUX PILULES » de 86,6 à 87,2 : le titre y est arrivé à
  // 86,6 et s'y fond (s'il glissait pendant qu'elle le fait paraître, on verrait deux titres) ; à 87,2, elle le tient seule.
  if (t >= P8.oeil + .6) return;
  const Ti = titre(), kG = kGlisse(t), Bl = blocTitre(Ti, kG);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const p of Ti.pts) {
    const q = seg(t, p.ta, p.ta + p.dur);
    if (q <= 0) {              // pas encore parti : il reste visible dans l'éclat (les autres s'éteignent autour de lui)
      if (t < P8.eclat) continue;
      const S = eclate(p.i, p.n, t);
      ctx.globalAlpha = .9; ctx.fillStyle = S.p.c; ctx.font = `${Math.round(TAILLES[S.p.si] * PS7)}px ${MONO}`;
      ctx.fillText(G[(p.g + Math.floor(t * p.fl)) % G.length], S.x, S.y);
      continue;
    }
    const A = { x: Ti.O.x + p.x, y: Ti.O.y + p.y };
    if (q < 1) {               // en vol : un caractère qui change, de la couleur de sa pilule à la craie, sur une courbe
      const S = eclate(p.i, p.n, p.ta), e = eOut(q), dx = A.x - S.x, dy = A.y - S.y, L = Math.hypot(dx, dy) || 1, s = Math.sin(Math.PI * e) * p.sw;
      const x = S.x + dx * e - dy / L * s, y = S.y + dy * e + dx / L * s;
      ctx.globalAlpha = .95; ctx.fillStyle = mix(S.p.c, CRAIE, e);
      ctx.font = `${Math.round(lerp(TAILLES[S.p.si] * PS7, 15, e))}px ${MONO}`;
      ctx.fillText(G[(p.g + Math.floor(t * p.fl)) % G.length], x, y);
      continue;
    }
    // posé : un carré de craie (une case de la police, un fil de nuit entre deux), un éclair LABO en se posant ; puis
    // le mot glisse d'un bloc au cartouche, où les cases se touchent et virent au laiton
    const fr = Math.sin(Math.PI * kG) * 3, s = (TD - 1.6 * (1 - kG)) * Bl.s;
    const x = Bl.x + p.x * Bl.s + (p.h1 - .5) * fr, y = Bl.y + p.y * Bl.s + (p.h2 - .5) * fr;
    const fl = 1 - seg(t, p.ta + p.dur, p.ta + p.dur + .35), sc = 1 + .5 * fl;
    ctx.globalAlpha = 1; ctx.fillStyle = kG > 0 ? mix(CRAIE, LAITON, kG) : fl > 0 ? mix(CRAIE, LABO, fl * .8) : CRAIE;
    ctx.fillRect(x - s * sc / 2, y - s * sc / 2, s * sc, s * sc);
  }
  // « LES DEUX PILULES » : décodé lettre à lettre (un caractère de la machine, puis la lettre), puis il devient la
  // deuxième ligne du cartouche
  ctx.font = `${SOUS_T}px ${PIX}`;
  const ws = [...SOUS].map(ch => ctx.measureText(ch).width), tot = ws.reduce((a, b) => a + b, 0), x0 = 960 - tot / 2;
  const bx = lerp(x0, CART_X, kG), by = lerp(SOUS_Y, CART_Y2, kG), sS = Math.exp(lerp(0, Math.log(CART_S2), kG));
  ctx.save(); ctx.translate(bx, by); ctx.scale(sS, sS);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let cx = 0;
  [...SOUS].forEach((ch, j) => {
    const tj = P8.sous + j * (.75 / SOUS.length);
    if (t >= tj && ch !== ' ') {
      const dec = t < tj + .1;
      ctx.globalAlpha = dec ? .9 : 1; ctx.fillStyle = dec ? LABO : CRAIE;
      ctx.fillText(dec ? G[(j * 3 + Math.floor(t * 30)) % G.length] : ch, cx, 0);
    }
    cx += ws[j];
  });
  ctx.restore();
  // les deux mini-nuages, la bleue à gauche, la rouge à droite
  const aM = 1 - seg(t, P8.glisse, P8.glisse + .3);
  if (aM > 0) {
    pilule(ctx, t, 0, { x: x0 - 64, y: SOUS_Y - 16, ps: .15, t0: P8.sous - .25, a: aM });
    pilule(ctx, t, 1, { x: x0 + tot + 64, y: SOUS_Y - 16, ps: .15, t0: P8.sous - .25, a: aM });
  }
  ctx.globalAlpha = 1;
}
// la nuit qui devient le laboratoire : la teinte, le sol qui s'allume, la poussière de la nuit (lente) qui laisse la
// place à celle du laboratoire ; à la fin, exactement fond(ctx, t) (le lot test part de là)
function fondNuitLabo(ctx, t) {
  const k = eIO(seg(t, P8.labo[0], P8.labo[1]));
  if (k <= 0) { fond(ctx, t, FOND_NUIT); return; }
  if (k >= 1) { fond(ctx, t); return; }
  const g = ctx.createRadialGradient(760, 470, 40, 760, 470, 1250);
  g.addColorStop(0, mix(TEINTE_NUIT, TEINTE_LABO, k)); g.addColorStop(.75, NUIT); g.addColorStop(1, NUIT);
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  sol(ctx, lerp(FOND_NUIT.sol, 1, k));
  poussiere(ctx, t, 1 - k, FOND_NUIT.vitesse); poussiere(ctx, t, k, 1);
}
function dessineP08(ctx, t) {
  fondNuitLabo(ctx, t);
  deuxPilules(ctx, t, camMur(t));
  dessineTitre(ctx, t);
  dessinePhi(ctx, t, etatPhi(t));
}

// ================================================================ le regard de Phi, sur tout le lot
// Il regarde ce dont il parle, au moment où il le dit (creeRegard de commun.js) ; vous quand il s'adresse à vous.
function regardLot(R) {
  const I = motsInstants(R);
  const cibles = [
    // P01 : gauche, droite, puis vous (le [VISUEL] du script) ; il ne vous quitte plus du plan
    [0, 1.7, VOUS], [1.7, .7, point(360, 420)], [2.4, .8, point(1560, 420)], [3.2, B.P02[0] - 3.2, VOUS],
    // P02 : vous ; le sujet dès qu'il paraît ; « point commun » : ils se regardent ; vous sur « vous-mêmes »
    [B.P02[0], R.humains - B.P02[0], VOUS],
    [R.humains + .1, R.memes - R.humains - .1, visageSujet, .4],
    [R.memes, B.P03[0] - R.memes, VOUS],
    // P03 : la bleue, la rouge, la ligne qui s'écrit, la jauge qui hésite ; vous sur « déroutants »
    [B.P03[0], R.bleues - .25 - B.P03[0], VOUS],
    [R.bleues - .25, .8, point(...PIL_P03[0])], [R.rouges - .2, .9, point(...PIL_P03[1])],
    [R.rouges + .7, R.semaines - R.rouges - .7, VOUS],
    [R.semaines, [...TEST01].length / 24 + .2, T => { const n = Math.floor((T - R.semaines) * 24); return n >= 0 && n < [...TEST01].length ? point(960 - 140 + n * 10.8, 562) : null; }, .15],
    [R.resultats + .15, R.deroutants - R.resultats - .15, pointJauge, .22],
    [R.deroutants, B.P04[0] - R.deroutants, VOUS],
    // P04 : il lit : la carte du dilemme, qu'il perd et retrouve quand elle refait surface
    [B.P04[0], B.P04[1] - B.P04[0], dilemmeLu, .22],
    // P05 : la carte qui reçoit le mot, puis celle qui reçoit la flèche : un arbitre de tennis
    [B.P05[0], .9, VOUS], [B.P05[0] + .9, .7, centreCarte([0, 1])], [B.P05[0] + 1.6, .6, centreCarte([1, 1])],
    ...FLECHES.flatMap(F => [[I[F.j] - .12, .62, centreCarte(F.de)], [I[F.j] + .5, .75, centreCarte(F.vers)]]),
    [I[3] + 1.25, B.P06[0] - I[3] - 1.25, VOUS],
    // P06 : il balaie le mur, puis revient au petit carré bleu et rouge
    [B.P06[0], .3, VOUS], [B.P06[0] + .3, 3.5, pointMur, .5], [B.P06[0] + 3.8, B.P07[0] - B.P06[0] - 3.8, centreNotre, .3],
    // P07 : les caractères qui volent ; la bleue, la rouge ; vous sur la question
    [B.P07[0], R.accord - B.P07[0], centreNotre, .3],
    [R.accord, R.gris[1] - R.accord, T => { const F = carteAuHasard(T, MUR_VU); return F ? CAM_FIN.ecran(F.x + 330, F.y + 536) : null; }, .45],
    [R.nous[0], R.comprendre - R.nous[0], centreNotre, .3],
    [R.comprendre, 1.3, point(...PIL_P07[0])], [R.comprendre + 1.3, R.pourquoi - R.comprendre - 1.3, point(...PIL_P07[1])],
    [R.pourquoi, B.P08[0] - R.pourquoi + .3, VOUS],
    // P08 : les pilules qui éclatent, les caractères qui se posent, le sous-titre ; vous
    [P8.eclat, .5, point(960, 470)], [P8.titre + .3, 1.4, frontTitre, .15], [P8.sous + .1, .8, point(960, SOUS_Y - 16)],
    [P8.sous + 1, B.P08[1] - P8.sous - 1 + .5, VOUS],
  ].filter(c => c[1] > 0);
  const repos = [
    [3, VOUS], [1, T => plume(T)],
    [2, T => { if (T < B.P04[0] || T >= B.P04[1]) return null; const o = carteAuHasard(T, cartesFil(T).filter(o => o.y > 0 && o.y < 700)); return o ? point(FX + 200, o.y + 60) : null; }],
  ];
  return creeRegard({ cibles, repos });
}

// ================================================================ les plans
export const PLANS = [
  { id: 'P01', de: B.P01[0], a: B.P01[1], dessine: dessineP01 },   // L'œil s'ouvre (O01)
  { id: 'P02', de: B.P02[0], a: B.P02[1], dessine: dessineP02 },   // Une simple intelligence artificielle (O02–O03)
  { id: 'P03', de: B.P03[0], a: B.P03[1], dessine: dessineP03 },   // Le test, il y a quelques semaines (O04–O05)
  { id: 'P04', de: B.P04[0], a: B.P04[1], dessine: dessineP04 },   // Le fil (O06–O07)
  { id: 'P05', de: B.P05[0], a: B.P05[1], dessine: dessineP05 },   // Égoïstes, assassins, idiots (O08–O09)
  { id: 'P06', de: B.P06[0], a: B.P06[1], dessine: dessineP06 },   // Assez de raisons (O10)
  { id: 'P07', de: B.P07[0], a: B.P07[1], dessine: dessineP07 },   // Pourquoi tant de haine (O11)
  { id: 'P08', de: B.P08[0], a: B.P08[1], dessine: dessineP08 },   // Générique : Xphi · Les deux pilules (sans voix)
];

// ================================================================ le son (le vocabulaire de tools/son-pilules.cjs)
// Calé sur les mots, comme les gestes ; le défilement du fil (P04) est lu dans le fil lui-même : un haptique quand une
// carte entre par le bas, un pop quand c'est une carte du dilemme qui revient.
function sonsFil(R) {
  const out = [], vus = new Set(); let avant = new Map(), dernier = -1;
  for (let t = B.P04[0] + .01; t < B.P05[0] + .6; t += .01) {
    const maintenant = new Map();
    for (const o of cartesFil(t)) if (o.j < 0) {
      maintenant.set(o.n, o.y);
      const y0 = avant.get(o.n);
      if (y0 !== undefined && y0 > ZONE_UTILE && o.y <= ZONE_UTILE && !vus.has(o.n)) {
        vus.add(o.n);
        if (o.c.dilemme) out.push({ t: +t.toFixed(2), son: 'pop', f: 900, g: .5, pan: .1 });
        else if (t - dernier > .06) { out.push({ t: +t.toFixed(2), son: 'haptique', g: .45 }); dernier = t; }
      }
    }
    avant = maintenant;
  }
  return out;
}
function sons() {
  const R = rep(), I = motsInstants(R);
  const S = [
    // P01 : la nappe de la nuit qui monte avec la lueur ; les lames : un déclic, deux notes qui montent (une quinte) ;
    // un tic très bas à chaque saccade
    { t: 0, son: 'nappe', f: 'nuit', g: .55 },
    { t: OUVRE[0], son: 'declic', g: .5 }, { t: OUVRE[0] + .2, son: 'note', f: 440, d: .7, g: .45 }, { t: OUVRE[0] + .5, son: 'note', f: 660, d: .9, g: .45 },
    { t: 1.7, son: 'tic', f: 1300, g: .22, pan: -.4 }, { t: 2.4, son: 'tic', f: 1300, g: .22, pan: .4 }, { t: 3.2, son: 'tic', f: 1300, g: .22 },
    // P02 : un pop sec pour chaque « ? »
    { t: +(R.humains + .9).toFixed(2), son: 'pop', f: 1200, g: .55, pan: -.5 }, { t: +R.commun.toFixed(2), son: 'pop', f: 1200, g: .55 },
    // P03 : le grain des caractères qui s'assemblent (plus grave pour la rouge) ; un souffle très bas qui suit la jauge
    { t: +(R.bleues - .3).toFixed(2), son: 'grain', f: 2400, d: 2.4, g: .5, pan: -.35 },
    { t: +(R.rouges - .3).toFixed(2), son: 'grain', f: 1500, d: 2.4, g: .5, pan: .35 },
    { t: +(R.resultats + .1).toFixed(2), son: 'souffle', f: [380, 900], d: 2.4, g: .3 },
    { t: +R.deroutants.toFixed(2), son: 'souffle', f: [600, 1500], d: 1.1, g: .35 },
    // P04 : le fil (haptique, pop)
    ...sonsFil(R),
    // P05 : une notification sèche à chaque mot qui tombe (à gauche aigu, à droite plus grave)
    ...I.map((t, j) => ({ t: +t.toFixed(2), son: 'tic', f: MOTS_FIL[j].col ? 1600 : 2400, g: .5, pan: MOTS_FIL[j].col ? .55 : -.55 })),
    // P06 : la rumeur des notifications grossit en un souffle, puis se tasse
    { t: B.P06[0], son: 'souffle', f: [500, 2200], d: 3.4, g: .5 },
    ...[...Array(14).keys()].map(j => ({ t: +(B.P06[0] + .2 + 2.6 * Math.pow(j / 14, .8) + .05 * hache(j * 3 + 1)).toFixed(2), son: 'tic', f: 1500 + 1200 * hache(j * 5 + 2), g: .12 + .14 * Math.sin(Math.PI * j / 14), pan: hache(j * 7 + 3) * 1.6 - .8 })),
    // P07 : l'envol (de l'aigu vers le grave), puis le grain qui se pose en deux nuages
    { t: +R.accord.toFixed(2), son: 'envol', d: 2.2, g: .5 },
    { t: +R.nous[0].toFixed(2), son: 'envol', d: 1.5, g: .35 },
    { t: +R.comprendre.toFixed(2), son: 'grain', f: 2400, d: 3.0, g: .5, pan: -.3 },
    { t: +(R.comprendre + .1).toFixed(2), son: 'grain', f: 1500, d: 3.0, g: .5, pan: .3 },
    // P08 : les pilules éclatent ; le motif (les quatre notes de Phi) sur la pluie de tic des caractères qui se posent ;
    // la nappe passe de la nuit au laboratoire
    { t: P8.eclat, son: 'envol', d: 1.3, g: .4 },
    ...[...Array(16).keys()].map(j => ({ t: +(P8.titre + .5 + j * .085 + .03 * hache(j * 11 + 4)).toFixed(2), son: 'tic', f: 2800 + 900 * hache(j * 13 + 5), g: .18, pan: -.6 + 1.2 * j / 15 })),
    { t: +(P8.titre + .6).toFixed(2), son: 'motif', g: .7 },
    { t: P8.labo[0], son: 'nappe', f: 'labo', g: .5 },
  ];
  return S;
}
export const SONS = sons();
