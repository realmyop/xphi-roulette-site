/* ==========================================================================
   Les deux pilules, le film — plans/regles.js : le lot « regles »
   P07–P10, de 40,8 à 86,8 s : les règles et les mots.

   Ronan : « Tu peux faire différents plans, concevoir une petite histoire pour
   rendre ça plus vivant et qu'il y ait un peu d'émotion. Phi peut faire des
   petites blagues. » Ici, Phi pose le jeu : deux pilules, la démonstration
   d'index.html (sur des SUJETS DE DÉMONSTRATION, sous l'étiquette « EXEMPLE »),
   la machine qui rembobine (« Rassurez-vous »), puis les mêmes règles dites
   de deux façons, et le hasard qui choisit celle que lira le N°48.

   Les quatre plans sont un seul décor, le laboratoire d'index.html : scene(t)
   dessine tout, chaque plan n'en est qu'un moment (la caméra, l'œil, la
   lumière changent ; rien ne saute aux frontières). Tout est fonction du temps
   absolu t : la démonstration d'index.html, pilotée par des événements, est
   réécrite en dates (fouleMontre, fouleChoisit, fouleLueur, fouleTue,
   fouleRemet, fouleCache deviennent les instants de SUJETS) ; le regard de
   Phi est un creeRegard() de commun.js ; aucun état d'une image à l'autre.

   Raccords : à 40,8 s, le fond du laboratoire et l'œil seul en (650, 240,
   220), neutre, regard vous (fin du lot nuit) ; coupe franche à 86,8 s sur
   l'isoloir (lot isoloir).
   Partagés (commun.js) : les sujets de démonstration (DEMO), la dissolution et
   son envers, les crochets du N°48, les pilules, la jauge ; les deux
   descriptions viennent de texte.js. RÈGLES est celle d'index.html (recopiée
   ici, rendue fonction de t : elle n'est pas au socle).

   Essais : index.html?plan=regles (le lot en boucle), ?plan=P08, ?t=57.8.
   ========================================================================== */
import {
  W, CRAIE, GRIS, LABO, LAITON, BLEU, ROUGE, GRIS_FIG, FILET, MONO, PIX, G,
  clamp, lerp, seg, cloche, eIO, eOut, eIn, eBack, lisse, cles, vers, hache, mix, rgba, interp,
  fr, balise, coupeBalise, espace, toile,
  fond, sol, fenetre, jauge, pilule, POSES,
  humeur, cligne, microsaccade, flotte, dessineOeil, creeRegard, VOUS,
  dessineSujet, halo, DEMO, PREMIERS, LOTS, ORDRE, ABSTIENT, N48, crochets, cadre,
} from '../commun.js';
import { REPLIQUES, DESCRIPTIONS, cite, ecrits, plume as plumeBoite } from '../texte.js';

export const LOT = { id: 'regles', de: 40.8, a: 86.8 };

// ================================================================ les mots dits, et quand ils s'écrivent
// Les gestes tombent sur les mots : l'instant où la réplique a écrit son k-ième caractère (texte.js écrit au rythme de
// la parole), cherché par dichotomie sur ecrits() ; mémorisé (il ne dépend que du texte).
const REP = id => REPLIQUES.find(r => r.id === id);
const R15 = REP('R15');
const QUAND = new Map();
function quandEcrit(r, k) {
  const cle = `${r.id}|${k}`;
  if (QUAND.has(cle)) return QUAND.get(cle);
  let a = r.de - 1e-6, b = r.a;   // (si la réplique n'arrive jamais à k : sa fin)
  if (ecrits(r, b - 1e-6) >= k) for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (ecrits(r, m) >= k) b = m; else a = m; }
  QUAND.set(cle, b);
  return b;
}
const texteDe = r => balise(r.txt).map(l => l.map(s => s.s).join('')).join('');
// l'instant où le mot commence à s'écrire (à défaut : le début de la réplique)
const motA = (id, mot) => { const r = REP(id), txt = texteDe(r), k = txt.indexOf(mot); return k < 0 ? r.de : quandEcrit(r, [...txt.slice(0, k)].length + 1); };

// ================================================================ le minutage de la démonstration (SCENARIO.md, P07–P10)
const S = Object.freeze({
  bleue: 41.2, rouge: 42.0,                  // P07 : les pilules se forment (index.html, « les pilules »)
  icones: 45.2,                              // P08 : pilulesVers('icones')
  montre: 45.55,                             // fouleMontre : les sujets de démonstration reviennent (les pilules ont filé)
  choix1: 45.6, lueur: 48.3, remet1: 50.2,   // b62 : tout le monde vit
  choix2: 50.6, peur2: 54.4, tue2: 55.4,     // b40 : les bleus ont peur, puis partent en caractères
  remet2: 56.8, choix3: 57.0, abst: 57.6, tue3: 57.9,   // l'abstention : tout le monde meurt
  fige: 59.4, figeD: 1.0,                    // « Je déconseille » : l'œil ne bouge plus d'un pixel
  retour: 61.4,                              // P09 : la machine rembobine (61,4–63,4)
  vous: 64.7,                                // « Les choix, eux » : les cent vous regardent
  cache: 67.4,                               // P10 : la foule s'efface
  glisse: 67.6, glisseFin: 68.6, tasse: 69.4,   // RÈGLES glisse à gauche (lisible), puis se tasse et devient DESCRIPTION COLLECTIVE
  ouvre: 69.6,                               // DESCRIPTION INDIVIDUELLE s'ouvre
  ligne: 81.4,                               // « chacun joue avec ceux qui ont lu les mêmes mots »
  tirage: 83.0, pose: 85.9,                  // le tirage : huit sauts, posé sur INDIVIDUELLE
  n48: 86.0, sort: 86.1, fin: 86.8,          // le petit N°48 ; la fenêtre de gauche s'en va
});
const D2 = 1.1;     // la dissolution des bleus (b40), courte : on remet la foule 1,4 s après
const D3 = 4.0;     // la dissolution de tous : les caractères flottent encore quand la machine rembobine

// ================================================================ la caméra du lot, et l'œil de Phi
// Le décor est un seul plan large (la composition d'index.html) ; la caméra respire : une poussée lente sur les
// pilules (P07), le recul qui découvre la salle (45,2), une poussée sur la mort des bleus, la secousse de « Tout le
// monde meurt », l'immobilité de « Je déconseille », une poussée lente pendant le pacte (P09), le retour au plan
// d'ensemble pour les deux descriptions, et la poussée vers la droite du tirage (85,6–86,8).
// [t, wx, wy, sx, sy, z, easing du segment qui y mène]
const CAM = [
  [40.8, 650, 450, 650, 450, 1],
  [45.2, 650, 450, 650, 450, 1.03, k => k],         // P07 : la poussée lente sur les pilules
  [46.4, 650, 450, 650, 450, 1],                    // 45,2 : le recul découvre la salle (« EXEMPLE » et RÈGLES restent dans le cadre)
  [54.2, 800, 470, 800, 470, 1],
  [56.2, 800, 470, 800, 470, 1.04],                 // la mort des bleus : on s'approche
  [63.0, 800, 470, 800, 470, 1.04],                 // le rembobinage, plan tenu
  [67.3, 650, 485, 650, 525, 1.2, lisse],           // P09 : le pacte (la pilule bleue reste sous le cartouche) ; RÈGLES sort à moitié du cadre, dans l’ombre
  [68.7, 960, 540, 960, 540, 1],                    // P10 : retour au plan d'ensemble
  [85.6, 960, 540, 960, 540, 1],
  [86.8, 1060, 400, 1060, 410, 1.06, eOut],         // « celle-ci » : la poussée vers la droite
];
function camLot(T) {
  let i = 0;
  while (i < CAM.length - 1 && T > CAM[i + 1][0]) i++;
  const A = CAM[i], B = CAM[Math.min(i + 1, CAM.length - 1)];
  const k = B[0] === A[0] || T <= A[0] ? (T >= B[0] ? 1 : 0) : (B[6] || eIO)(clamp((T - A[0]) / (B[0] - A[0])));
  // la secousse de « Tout le monde meurt » (avec celle de l'œil) : 3 px qui s'éteignent en 0,6 s
  const q = T - (S.tue3 + .05), sh = q >= 0 && q < .6 ? Math.sin(q * 46) * 3 * (1 - q / .6) : 0;
  return cadre(lerp(A[1], B[1], k), lerp(A[2], B[2], k), lerp(A[3], B[3], k) + sh, lerp(A[4], B[4], k) + sh * .4,
    Math.exp(lerp(Math.log(A[5]), Math.log(B[5]), k)));
}
// l'œil (hors caméra : c'est lui qui regarde) : sa place d'index.html à chaque moment
const OEIL = [
  [40.8, { x: 650, y: 240, s: 220 }],
  [45.2, { x: 650, y: 240, s: 220 }],
  [46.3, { x: 650, y: 160, s: 160 }],
  [60.8, { x: 650, y: 160, s: 160 }],
  [67.4, { x: 650, y: 180, s: 190 }, lisse],   // P09 : la poussée lente sur l'œil
  [68.0, { x: 960, y: 370, s: 150 }],          // P10 : entre les deux descriptions (centré sur elles), avant que RÈGLES passe
];
// l'horloge du corps de l'œil (flotter, cligner, les petits sauts de fixation) : elle s'arrête une seconde sur « Je
// déconseille ». Pas un pixel ne bouge ; puis elle repart d'où elle s'était arrêtée (l'image reste continue).
const horlogeOeil = T => T - clamp(T - S.fige, 0, S.figeD);
// Phi ne cligne pas sur les moments où il regarde : « tout le monde vit », « Les choix, eux », « celle-ci » (bornes
// choisies hors d'un clignement : rien ne saute)
const SANS_CLIGNER = [[48.0, 49.6], [64.3, 66.0], [85.5, 86.8]];
const clignement = (T, Tv) => (SANS_CLIGNER.some(([a, b]) => T >= a && T < b) ? 1 : cligne(Tv));
let HUMEURS_LOT = null;
function humeursLot() {
  if (HUMEURS_LOT) return HUMEURS_LOT;
  return (HUMEURS_LOT = [
    [S.lueur, 'grand'], [S.remet1, 'neutre'], [S.choix2 + .05, 'doute'], [S.tue2 - .05, 'plisse'],
    [S.remet2, 'neutre'], [S.choix3 + .05, 'doute'], [S.tue3 - .05, 'plisse'],
    [S.fige - .35, 'neutre', .3],                                 // « Je déconseille » : neutre, puis plus rien ne bouge
    [S.retour - .1, { glow: .45 }, .8],                           // « Rassurez-vous »
    [S.vous, { glow: .6 }, .6], [S.cache, { glow: .35 }, .8],     // « Les choix, eux » : Phi vous regarde, lueur 0,6
    [motA('R15', 'mourez') - .1, 'doute'], [motA('R15', 'sauf') - .05, 'neutre'],
    [S.pose, { glow: .55 }, .25], [S.pose + .9, { glow: .35 }, .8],
  ]);
}

// ================================================================ les sujets de démonstration, en dates
// Les cent sujets de démonstration (DEMO : la grille d'index.html, les coiffes de démonstration ; pas des
// participants). Pour chacun, les instants de la démonstration d'index.html, rejouée sur les mots de Phi.
const ordre = i => ORDRE.indexOf(i);
const SUJETS = Object.freeze(DEMO.map(f => {
  const ord = ordre(f.i);
  const ta = S.montre + f.r1 * .5;                                               // fouleMontre (plus serrée qu'index.html)
  const tc1 = Math.max(S.choix1 + .3 + ord * .022, ta + .5);                    // fouleChoisit(b62) : la vague, 45,9–48,1
  const col1 = LOTS.b62.has(f.i) ? BLEU : ROUGE;
  const tr1 = S.remet1 + f.r3 * .4;                                              // fouleRemet
  const tc2 = S.choix2 + .3 + ord * .022, col2 = LOTS.b40.has(f.i) ? BLEU : ROUGE;   // fouleChoisit(b40), 50,9–53,1
  const meurt2 = col2 === BLEU;
  const tp2 = meurt2 ? S.peur2 + f.r1 * .25 : null, td2 = meurt2 ? S.tue2 + f.r2 * .35 : null;  // fouleTue (les bleus)
  const tr2 = meurt2 ? Math.max(S.remet2 + f.r3 * .25, td2 + .95) : S.remet2 + f.r3 * .25;     // fouleRemet (en 0,4 s)
  const abst = f.i === ABSTIENT;
  // fouleChoisit(b62, ABSTIENT) : une vague rapide (57,15–57,55), finie avant « Tout le monde meurt »
  const tc3 = abst ? null : Math.max(S.choix3 + .15 + ord * .004, tr2 + .25);
  const col3 = abst ? GRIS_FIG : LOTS.b62.has(f.i) ? BLEU : ROUGE;
  const td3 = Math.max(S.tue3 + f.r2 * 1.0, (tc3 ?? S.abst) + .5);              // fouleTue(tous)
  const tp3 = Math.max(S.tue3 - .12, (tc3 ?? S.abst) + .42);
  const rs = S.retour + f.r1 * .5, re = rs + 1.5;                                // le rembobinage : 61,4–63,4
  const te = S.cache + f.r2 * .5;                                                // fouleCache (avant que RÈGLES passe)
  return Object.freeze({ f, ord, ta, tc1, col1, tr1, tc2, col2, meurt2, tp2, td2, tr2, abst, tc3, col3, td3, tp3, rs, re, te });
}));
// la couleur à l'instant T (on part en caractères dans sa couleur ; on revient gris)
function couleur(s, T) {
  if (T >= s.rs) return GRIS_FIG;
  if (s.tc3 !== null && T >= s.tc3) return s.col3;
  if (T >= s.tr2) return GRIS_FIG;
  if (T >= s.tc2) return s.col2;
  if (T >= s.tr1) return GRIS_FIG;
  if (T >= s.tc1) return s.col1;
  return GRIS_FIG;
}
// la dissolution : 0 entier, 1 parti ; à l'envers pendant le rembobinage (les caractères qui flottent s'arrêtent à
// 61,4, puis redescendent et recomposent le sujet)
function dissolution(s, T) {
  if (s.meurt2 && T >= s.td2 && T < s.tr2) return seg(T, s.td2, s.td2 + D2);
  if (T >= S.retour) {
    const d0 = seg(S.retour, s.td3, s.td3 + D3);
    return T < s.rs ? d0 : d0 * (1 - eIO(seg(T, s.rs, s.re)));
  }
  if (T >= s.td3) return seg(T, s.td3, s.td3 + D3);
  return 0;
}
const lueurVie = T => seg(T, S.lueur, S.lueur + .6) * (1 - seg(T, S.remet1, S.remet1 + 1));
const echelle = (s, T) => eBack(seg(T, s.ta, s.ta + .45)) * (1 - eIn(seg(T, s.te, s.te + .4)));
const visible = (s, T) => T > s.ta + .3 && T < s.te && dissolution(s, T) < .3;
// l'état du sujet pour dessineSujet (l'ordre des cas est celui d'index.html)
function etatSujet(s, T, phiW, pose) {
  const f = s.f, col = couleur(s, T), dis = dissolution(s, T);
  let fa = col === GRIS_FIG ? .82 : 1;
  if (s.meurt2 && T >= s.tr2 && T < s.tr2 + .5) fa *= seg(T, s.tr2, s.tr2 + .5);   // les morts reviennent, gris
  const e = { col, a: fa, dis, mode: 'repos', phi: phiW, cible: phiW, fixe: false, reflet: pose.ouvert };
  const dw = Math.hypot(f.cx - phiW.x, f.cy - phiW.y) / 900;                       // la vague part de Phi
  if (dis > 0) {
    if (T >= s.rs) { e.p = { bob: 0, yx: 0, yy: 0, goutte: 0 }; return e; }        // il se recompose, debout
    e.mode = s.abst && T >= S.abst ? 'rien' : 'peur';                              // on part dans la pose où la sentence nous a pris
    return e;
  }
  const vu = pose.w ? Math.hypot(f.cx - pose.w.x, f.cy - 12 - pose.w.y) : Infinity;
  e.fixe = (T > s.ta + .45 && T < s.ta + 1.6)                                      // en arrivant, on lève les yeux vers Phi
    || (T > S.lueur + .3 + dw && T < S.lueur + 2 + dw)                             // Phi s'allume : de proche en proche
    || (vu < 60 && T > pose.w.t + .15 + vu / 160);                                 // Phi le fixe : il lui rend son regard
  const lu = lueurVie(T);
  for (const tc of [s.tc1, s.tc2, s.tc3]) if (tc !== null && T > tc - .2 && T < tc + .45) { e.mode = 'saut'; e.t0 = tc; return e; }
  if (lu > 0 && col !== GRIS_FIG) { e.mode = 'vie'; e.k = lu; return e; }
  if (s.abst && T >= S.abst && T < s.rs) { e.mode = 'rien'; return e; }
  if ((s.meurt2 && T >= s.tp2 && T < s.tr2) || (T >= s.tp3 && T < s.rs)) { e.mode = 'peur'; return e; }
  // « Les choix, eux » : les cent vous regardent, droit devant (la vague part de Phi)
  if (T >= S.vous + dw * .5) { e.p = { yx: 0, yy: 0 }; e.fixe = false; }
  return e;
}

// ================================================================ RÈGLES (index.html), qui devient DESCRIPTION COLLECTIVE
const REGLES = [
  ['Chacun avale une pilule.'],
  ['Choix simultanés et privés :', 'personne ne connaît celui des autres.'],
  ['[b]■[/b] plus de 50 % de [b]bleues[/b]', '  → tout le monde vit'],
  ['[r]■[/r] au moins 50 % de [r]rouges[/r]', '  → ceux qui ont la [b]bleue[/b] meurent'],
  ['Ø une seule personne sans pilule', '  → tout le monde meurt'],   // Ø : ∅ n'est dans aucune police du dépôt
].map(r => balise(fr(r.join('\n'))));
const TREGLE = [42.6, 43.8, 49.0, 55.8, 58.6];                // règle 0 à 4 (SCENARIO.md)
const RX = 1290, RY = 40, RW = 570, RLH = 31, RGAP = 16, CPS_R = 70;
const hauteurRegles = n => (n === 0 ? 0 : 74 + REGLES.slice(0, n).reduce((a, r) => a + r.length * RLH, 0) + (n - 1) * RGAP + 18);
const H5 = hauteurRegles(5);
const reglesH = T => vers(T, TREGLE.map((t, i) => [t - .4, hauteurRegles(i + 1), .4]), 0);
const reglesA = T => seg(T, TREGLE[0] - .4, TREGLE[0]);
const yRegle = i => { let y = 92; for (let j = 0; j < i; j++) y += REGLES[j].length * RLH + RGAP; return y; };   // dans la fenêtre
// les deux fenêtres de P10 (SCENARIO.md) : à gauche la collective (RÈGLES transformée), à droite l'individuelle
// (le scénario les met en y 170 ; plus bas, elles laissent respirer le cartouche et centrent la composition dans la zone utile)
const FG = Object.freeze({ x: 100, y: 214, w: 760, h: 330 }), FD = Object.freeze({ x: 1060, y: 214, w: 760, h: 330 });
// le texte : IBM Plex Mono 24 px (22 dans le scénario : trop petit pour quatre lignes dans 760 px), coupé à 600 px, en deux
// paragraphes (une phrase, ou une proposition, chacun) : les deux descriptions se lisent en parallèle, ligne à ligne
const TXT_FONT = `24px ${MONO}`, TXT_LH = 38, TXT_Y = 116, TXT_W = 600, TXT_PG = 16, TITRE_FONT = `24px ${PIX}`;
// la fenêtre de gauche à l'instant T : RÈGLES en haut à droite (dans l'ombre pendant le pacte), puis elle glisse à
// gauche (67,6–68,6), se tasse en devenant la description collective (68,6–69,4), et s'en va (86,1–86,8)
function rectGauche(T) {
  const R0 = { x: RX, y: RY, w: RW, h: T < S.glisse ? reglesH(T) : H5 };
  if (T < S.glisse) return { ...R0, a: reglesA(T) * (1 - .65 * cloche(T, S.retour + 1.6, S.retour + 3, S.cache - .4, S.glisse + .2)) };
  const k = eIO(seg(T, S.glisse, S.glisseFin)), r = interp(R0, FG, k);
  r.h = lerp(H5, FG.h, eIO(seg(T, S.glisseFin, S.tasse)));   // elle glisse entière, puis se tasse en se recomposant
  const ks = eIn(seg(T, S.sort + .2, S.fin));
  const ombre = 1 - .65 * (1 - seg(T, S.cache - .4, S.glisse + .2));
  // pendant que l'autre s'écrit, elle baisse un peu (on lit à droite) ; elle revient pour la comparaison et le tirage
  const lit = 1 - .25 * cloche(T, R15.de - .2, R15.de + .6, S.ligne - .4, S.ligne + .2);
  return { x: r.x - 1000 * ks, y: r.y, w: r.w, h: r.h, a: ombre * lit * (1 - .85 * eOut(seg(T, S.sort, S.sort + .3))) };
}

// ---------------------------------------------------------------- la disposition des textes (mesurée une fois, polices chargées)
let MES = null;
const mesureur = () => MES || (MES = toile(8, 8).getContext('2d'));
const DISPO = new Map();
// une description en deux paragraphes : coupée après son premier « ; » ou « . » (la première proposition)
const paragraphes = txt => { const m = txt.match(/^(.*?[;.]) (.*)$/u); return m ? [m[1], m[2]] : [txt]; };
// les caractères d'une description, coupée à TXT_W par paragraphe : { ch, c (couleur), x, y, li } relatifs au début du texte
function disposition(cle, txt) {
  if (DISPO.has(cle)) return DISPO.get(cle);
  const m = mesureur(); m.font = TXT_FONT;
  const cars = []; let li = 0;
  paragraphes(txt).forEach((p, pi) => coupeBalise(m, p, TXT_W).forEach(l => {
    let x = 0; const y = li * TXT_LH + pi * TXT_PG;
    for (const s of l) for (const ch of s.s) { cars.push({ ch, c: s.c, x, y, li }); x += m.measureText(ch).width; }
    li++;
  }));
  const d = { cars, n: li };
  DISPO.set(cle, d);
  return d;
}
const dispoRegles = () => {
  if (DISPO.has('regles')) return DISPO.get('regles');
  const m = mesureur(); m.font = `21px ${MONO}`;
  const cars = [];
  REGLES.forEach((r, i) => r.forEach((l, li) => { let x = 24; for (const s of l) for (const ch of s.s) { cars.push({ ch, c: s.c, x, y: yRegle(i) + li * RLH, i }); x += m.measureText(ch).width; } }));
  const d = { cars }; DISPO.set('regles', d); return d;
};
const TXT_COLL = cite(DESCRIPTIONS.collective), TXT_INDIV = cite(DESCRIPTIONS.individuelle);
const dispoColl = () => disposition('coll', TXT_COLL);
const dispoIndiv = () => disposition('indiv', TXT_INDIV);

// ---------------------------------------------------------------- la description individuelle s'écrit avec la voix (R15)
// R15 est la même phrase, dite (« vous mourez… sauf si ») ; on aligne lettre à lettre : un caractère de la fenêtre
// paraît quand R15 a écrit le sien. Une ponctuation paraît avec celle qui suit la lettre d'avant dans R15.
let SYNC = null;
function sync() {
  if (SYNC) return SYNC;
  const lettre = c => /[\p{L}\p{N}]/u.test(c);
  const r15 = [...texteDe(R15)], d = dispoIndiv().cars.map(c => c.ch);
  const lr = [], ld = [];
  r15.forEach((c, i) => { if (lettre(c)) lr.push(i); });
  d.forEach((c, i) => { if (lettre(c)) ld.push(i); });
  const ok = lr.length === ld.length;
  let rang = -1;
  const besoin = d.map((c, i) => {
    if (!ok) return Math.round((i + 1) * r15.length / d.length);      // (au cas où les textes divergent : à proportion)
    if (lettre(c)) { rang++; return lr[rang] + 1; }
    return rang < 0 ? 1 : Math.min(r15.length, lr[rang] + 2);
  });
  return (SYNC = { besoin, ok });
}
const ecritsIndiv = T => {
  const w = T >= R15.a ? Infinity : ecrits(R15, T), b = sync().besoin;
  let n = 0; while (n < b.length && b[n] <= w) n++;
  return n;
};

// ---------------------------------------------------------------- le tirage : huit sauts qui ralentissent, de 0,12 à 0,7 s
// les durées d = 0,12 + 0,58 · (k/7)^p, p choisi pour que les huit sauts finissent juste à 85,9
const SAUTS = (() => {
  const somme = p => { let s = 0; for (let k = 0; k < 8; k++) s += .12 + .58 * Math.pow(k / 7, p); return s; };
  let a = .2, b = 6; for (let i = 0; i < 50; i++) { const m = (a + b) / 2; if (somme(m) > S.pose - S.tirage) a = m; else b = m; }
  const out = [S.tirage]; let t = S.tirage;
  for (let k = 0; k < 8; k++) { t += .12 + .58 * Math.pow(k / 7, a); out.push(t); }
  out[8] = S.pose;
  return Object.freeze(out);
})();
// le cadre apparaît sur la droite à 83,0, saute huit fois, se pose sur la droite (INDIVIDUELLE) à 85,9
function tirage(T) {
  if (T < S.tirage) return null;
  let k = 0; while (k < 8 && T >= SAUTS[k + 1]) k++;
  return { droite: k % 2 === 0, depuis: T - SAUTS[k], k, pose: T >= S.pose };
}

// ================================================================ le regard de Phi
// Il regarde ce que montre la démonstration (index.html : les pilules qui se forment, les arrivées, les sauts, la jauge,
// les vivants, les condamnés, celui qui ne prend rien, la règle qu'il écrit), puis la plume de la description, puis le
// cadre du tirage, de saut en saut, et enfin le petit N°48. Tout en coordonnées de l'écran (sous la caméra du lot).
const ecran = (x, y, T) => camLot(T).ecran(x, y);
const visage = (s, T) => ecran(s.f.cx, s.f.cy - 12, T);
const dernier = (quand, duree = Infinity) => T => {
  let best = null, bt = -Infinity;
  for (const s of SUJETS) { const q = quand(s); if (q !== null && q !== undefined && q <= T && T < q + duree && q > bt) { bt = q; best = s; } }
  return best && visage(best, T);
};
const parmi = (ok, P = .55) => T => {
  const i0 = Math.floor(hache(Math.floor(T / P) * 97 + 3) * 100);
  for (let j = 0; j < 100; j++) { const s = SUJETS[(i0 + j * 37) % 100]; if (visible(s, T) && ok(s, T)) return visage(s, T); }
  return null;
};
const posePilule = (i, T) => {
  const k = eIO(seg(T, S.icones, S.icones + .8)), [x0, y0, p0] = POSES.choix[i], [x1, y1, p1] = POSES.icones[i];
  return { x: lerp(x0, x1, k), y: lerp(y0, y1, k), ps: lerp(p0, p1, k) };
};
const pil = i => T => { const p = posePilule(i, T); return ecran(p.x, p.y, T); };
const regle = i => T => {
  const R = rectGauche(T), n = clamp(Math.floor((T - TREGLE[i]) * CPS_R), 0, 80);
  let m = n;
  for (const [li, l] of REGLES[i].entries()) { const L = l.reduce((a, s) => a + [...s.s].length, 0); if (m < L) return ecran(R.x + 24 + m * 12.6, R.y + yRegle(i) + li * RLH - 8, T); m -= L; }
  return ecran(R.x + 200, R.y + yRegle(i), T);
};
const jaugeC = T => {
  if (aJauge(T) < .5) return null;
  const { nb, nr } = compte(T);
  return ecran(150 + 10 * (nb + (100 - nb - nr) / 2), 699, T);
};
const fenetreG = T => { const R = rectGauche(T); return ecran(R.x + R.w / 2, R.y + Math.max(60, R.h) / 2, T); };
const fenetreD = T => ecran(FD.x + FD.w / 2, FD.y + FD.h / 2, T);
const texteColl = T => ecran(FG.x + FG.w / 2, FG.y + TXT_Y + 30, T);
const plumeD = T => { const p = plumeIndiv(T); return p ? ecran(p.x, p.y, T) : null; };
const plumeL = T => { const p = plumeLigne(T); return p ? ecran(p.x, p.y, T) : null; };
const cadreT = T => { const r = tirage(T); return r ? (r.droite ? fenetreD(T) : ecran(FG.x + FG.w / 2, FG.y + FG.h / 2, T)) : null; };
const petit48 = T => ecran(N48X, N48Y - 12, T);
let REGARD = null;
function regard() {
  if (REGARD) return REGARD;
  const mourez = motA('R15', 'mourez');
  return (REGARD = creeRegard({
    cibles: [
      // P07 : la bleue qui se forme, la rouge, la règle qui s'écrit, vous
      [40.8, .55, VOUS], [41.35, .85, pil(0)], [42.2, .4, pil(1)], [42.6, .7, regle(0), .2], [43.3, .5, pil(1)],
      [43.8, 1.0, regle(1), .2], [44.8, .45, VOUS],
      // P08 : les arrivées, les sauts, la jauge, les vivants, la règle ; les sauts, la jauge, les condamnés…
      [45.25, .3, pil(0)], [45.55, .5, dernier(s => s.ta, 1)], [45.9, 1.7, dernier(s => s.tc1, .5)], [47.6, .7, jaugeC],
      [48.3, .7, parmi((s, T) => couleur(s, T) !== GRIS_FIG)], [49.0, .75, regle(2), .2], [49.75, .85, VOUS],
      [50.9, 2.0, dernier(s => s.tc2, .5)], [52.9, .7, jaugeC], [53.6, .8, VOUS],
      [54.4, 1.0, parmi(s => s.meurt2)], [55.4, .45, dernier(s => s.td2, 2)], [55.85, .7, regle(3), .2],
      [56.55, .3, dernier(s => s.td2, 2)], [56.85, .4, VOUS],
      [57.25, .3, dernier(s => s.tc3, .5)], [57.55, .35, T => visage(SUJETS[ABSTIENT], T)],
      [57.9, .75, dernier(s => s.td3, 2)], [58.65, .6, regle(4), .2],
      [59.25, 1.6, VOUS],                                                  // « Je déconseille » : vous, sans bouger
      // P09 : les caractères qui flottent, ceux qui se recomposent, puis vous
      [60.85, .5, T => ecran(650, 300, T)], [61.45, 1.9, dernier(s => s.rs, .8)], [64.55, 2.85, VOUS],
      // P10 : la fenêtre qui glisse, le texte recomposé, la fenêtre qui s'ouvre, la plume, le tirage, le N°48
      [67.4, .25, VOUS], [67.65, .95, fenetreG], [68.6, 1.0, texteColl], [69.6, .9, fenetreD], [70.5, .35, VOUS],
      [70.85, 10.3, plumeD, .25], [mourez, .85, VOUS],
      [S.ligne - .05, 1.0, plumeL, .2], [S.ligne + .95, .65, VOUS],
      [S.tirage, S.pose - S.tirage, cadreT, .1], [S.pose, .15, fenetreD], [S.n48 + .05, .8, petit48],
    ],
    repos: [
      [3, VOUS], [2, T => plumeBoite(T)],
      [2, T => (T > S.montre + 1 && T < S.cache ? parmi(() => true, 1.15)(T) : null)],
      [1, T => (reglesA(T) > .5 && T < S.glisse ? ecran(RX + 60 + hache(Math.floor(T / 1.15) * 53 + 5) * 300, RY + 100, T) : null)],
    ],
  }));
}
// l'état de l'œil à l'instant T (avant le monde : les sujets lui rendent son regard)
function etatOeil(T, cam) {
  const P = cles(T, OEIL), Tv = horlogeOeil(T);
  const y = P.y + flotte(Tv, 4);
  const e = humeur(T, humeursLot());
  const g = regard().pupille(T, P.x, y, e.r);
  const ouvert = clignement(T, Tv) > .5;
  const w = g.pose ? { ...cam.monde(g.pose.x, g.pose.y), t: g.pose.t } : null;
  return { T, x: P.x, y, s: P.s, e, g, Tv, phiW: cam.monde(P.x, y), pose: { w, ouvert } };
}
// l'œil, dessiné comme oeil() de commun.js, mais avec deux horloges : le scénario (l'humeur, le regard) et le corps
// (flotter, cligner, les petits sauts de fixation, la lueur qui respire, la secousse), qui s'arrête sur « Je déconseille »
function dessinePhi(ctx, O) {
  const { e: h, g, Tv } = O, e = { ...h };
  const [mx, my] = microsaccade(Tv), gx = g.gx + mx, gy = g.gy + my, a = -e.rot * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  e.x = e.x * g.w + gx * ca - gy * sa; e.y = e.y * g.w + gx * sa + gy * ca;
  e.r *= clignement(O.T, Tv);
  e.glow += .06 * Math.sin(Tv * 2.1);
  const k = Tv - (S.tue3 + .05); e.dx = k >= 0 && k < .9 ? Math.sin(k * 22) * 3 * (1 - k / .9) : 0;   // secoue (index.html)
  dessineOeil(ctx, O.x, O.y, O.s, e, 1);
}

// ================================================================ le décor et ses éléments
const aJauge = T => seg(T, 45.8, 46.3) * (1 - seg(T, 62.65, 63.1));
function compte(T) {
  let nb = 0, nr = 0;
  for (const s of SUJETS) { if (T < s.ta) continue; const c = couleur(s, T < s.rs + .75 ? Math.min(T, s.rs - 1e-6) : T); if (c === BLEU) nb++; else if (c === ROUGE) nr++; }
  return { nb, nr };
}
const chaud = T => vers(T, [[S.tue2, 1, 1.2], [S.remet2, 0, .8], [S.tue3, 1, 1.2], [S.retour + .3, 0, 2.2]], 0);
const clair = T => vers(T, [[S.lueur, 1, .8], [S.remet1 + .2, 0, 1.2], [S.vous, .22, 1.2], [S.cache, 0, 1.2]], 0);

// la lumière des pilules sur le sol : une flaque de leur couleur sous chacune (elle s'éteint quand elles deviennent icônes)
function flaques(ctx, T) {
  const ki = 1 - eIO(seg(T, S.icones, S.icones + 1)), fin = 1 - seg(T, S.cache, S.cache + .5);
  [[S.bleue, BLEU, 380], [S.rouge, ROUGE, 920]].forEach(([t0, col, x]) => {
    const a = .16 * seg(T, t0 + .4, t0 + 2.2) * ki * fin;
    if (a <= .002) return;
    ctx.save(); ctx.translate(x, 668); ctx.scale(1, .16);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 330);
    g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(-330, -330, 660, 660);
    ctx.restore();
  });
}
function pilules(ctx, T) {
  const a = 1 - seg(T, S.cache, S.cache + .5);
  if (a <= 0) return;
  [[0, S.bleue], [1, S.rouge]].forEach(([i, t0]) => {
    const p = posePilule(i, T);
    pilule(ctx, T, i, { x: p.x, y: p.y, ps: p.ps, a, t0, lab: t0 + 1.6 });
  });
}
function foule(ctx, T, O) {
  if (T < S.montre || T > S.cache + 1.3) return;
  for (const s of SUJETS) {
    const sc = echelle(s, T);
    if (sc <= .01) continue;
    const e = etatSujet(s, T, O.phiW, O.pose);
    if (e.dis >= 1) continue;
    // « Les choix, eux » : une vague de lumière LABO part de Phi ; chacun, quand elle le touche, vous regarde
    const tv = S.vous + Math.hypot(s.f.cx - O.phiW.x, s.f.cy - O.phiW.y) / 900 * .5, lv = cloche(T, tv - .05, tv + .15, tv + .5, tv + 1.6);
    if (lv > 0) { ctx.globalAlpha = .5 * lv; ctx.drawImage(halo(LABO), s.f.cx - 44, s.f.cy - 44, 88, 88); }
    dessineSujet(ctx, s.f, s.f.cx, s.f.cy, 4 * sc, e, T);
    // celui qui ne prend rien (index.html) : cerclé de craie, ∅ (sur une pastille, pour qu'on le lise par-dessus le
    // voisin du dessus : la vague est rapide, il n'a que 0,4 s pour se faire remarquer)
    if (s.abst && T >= S.abst - .1 && e.dis === 0 && T < s.rs) {
      const k = eOut(seg(T, S.abst - .1, S.abst + .1)), pu = .5 + .5 * Math.sin(T * 6), x = s.f.cx, y = s.f.cy;
      ctx.globalAlpha = k; ctx.strokeStyle = CRAIE; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x, y, lerp(46, 30, k) + 4 * pu, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(12,11,13,.92)'; ctx.beginPath(); ctx.arc(x, y - 47, 14, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = `22px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Ø', x, y - 46);
    }
  }
  ctx.globalAlpha = 1;
  // ce ne sont pas des participants : on le dit, sous la foule
  const al = seg(T, S.montre + .4, S.montre + 1.2) * (1 - seg(T, S.cache, S.cache + .5));
  if (al > 0) {
    ctx.globalAlpha = al * .9; ctx.font = `16px ${MONO}`; ctx.fillStyle = GRIS; ctx.textBaseline = 'alphabetic';
    espace(ctx, 'sujets de démonstration', 1126, 652, 1, 'right');
    ctx.globalAlpha = 1;
  }
}
// la jauge d'index.html, et son étiquette : ce ne sont pas des résultats
function laJauge(ctx, T) {
  const a = aJauge(T); if (a <= .01) return;
  const { nb, nr } = compte(T);
  jauge(ctx, { bleue: nb, rouge: nr, a, etiquette: 'EXEMPLE' });
}

// ---------------------------------------------------------------- la fenêtre de gauche : RÈGLES, puis DESCRIPTION COLLECTIVE
const titreLettres = (ctx, txt, x, y, n) => { ctx.fillText([...txt].slice(0, n).join(''), x, y); };
const glyphe = (n, T, v = 12) => G[Math.floor(hache(n * 13 + Math.floor(T * v) * 7) * G.length)];
function fenetreGauche(ctx, T) {
  const R = rectGauche(T);
  if (R.a <= .01) return;
  const h = Math.max(64, R.h);
  fenetre(ctx, R.x, R.y, R.w, h, R.a);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  // le titre : RÈGLES se défait (68,5–68,85), DESCRIPTION COLLECTIVE s'écrit (68,9)
  ctx.font = TITRE_FONT; ctx.fillStyle = LABO; ctx.globalAlpha = R.a;
  const tg = M0 - .05;
  if (T < tg) ctx.fillText('RÈGLES', R.x + 24, R.y + 40);
  else if (T < tg + .45) {
    ctx.globalAlpha = R.a * (1 - seg(T, tg + .2, tg + .45));
    ctx.fillText([...'RÈGLES'].map((c, i) => (T > tg + i * .04 ? glyphe(i + 50, T) : c)).join(''), R.x + 24, R.y + 40);
  } else titreLettres(ctx, 'DESCRIPTION COLLECTIVE', R.x + 24, R.y + 40, Math.floor((T - tg - .4) * 40));
  ctx.globalAlpha = R.a; ctx.fillStyle = FILET; ctx.fillRect(R.x + 24, R.y + 54, R.w - 48, 2);
  if (T < M0) reglesTexte(ctx, T, R);
  morph(ctx, T, R);
  ctx.globalAlpha = 1;
}
// les règles d'index.html, écrites à 70 caractères par seconde avec le voile LABO d'ajouteRegle
function reglesTexte(ctx, T, R) {
  ctx.font = `21px ${MONO}`;
  const ky = T >= S.glisse ? R.h / H5 : 1;   // quand elle se tasse, les lignes se resserrent avec elle
  REGLES.forEach((lignes, i) => {
    const n = Math.floor((T - TREGLE[i]) * CPS_R);
    if (n <= 0) return;
    const y = R.y + yRegle(i) * ky;
    const fl = 1 - seg(T, TREGLE[i], TREGLE[i] + 1.4);
    if (fl > 0) { ctx.globalAlpha = R.a; ctx.fillStyle = rgba(LABO, .14 * fl); ctx.fillRect(R.x + 12, y - 24, R.w - 24, lignes.length * RLH + 8); }
    ctx.globalAlpha = R.a;
    let m = n;
    lignes.forEach((l, li) => {
      let x = R.x + 24;
      for (const s of l) { if (m <= 0) break; const vis = [...s.s].slice(0, m).join(''); m -= [...s.s].length; ctx.fillStyle = s.c; ctx.fillText(vis, x, y + li * RLH); x += ctx.measureText(vis).width; }
    });
  });
}
// les cinq règles se défont en caractères LABO, qui volent se recomposer en la description collective (68,55–70,1)
const M0 = S.glisseFin - .05;
function morph(ctx, T, R) {
  if (T < M0) return;
  const src = dispoRegles().cars, dst = dispoColl().cars, Ns = src.length, Nt = dst.length, ky = R.h / H5;
  const t0 = M0;   // 68,55 : les caractères s'allument en LABO, en vague
  ctx.save(); ctx.beginPath(); ctx.rect(R.x + 4, R.y + 60, R.w - 8, R.h - 64); ctx.clip();   // sous le titre, dans la fenêtre
  ctx.font = TXT_FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  // ceux qui ne servent pas : ils montent et s'éteignent
  const pris = new Uint8Array(Ns);
  for (let j = 0; j < Nt; j++) pris[Math.floor(j * Ns / Nt)] = 1;
  ctx.font = `21px ${MONO}`;
  for (let s = 0; s < Ns; s++) {
    if (pris[s]) continue;
    const c = src[s], ts = t0 + (s / Ns) * .3, k = seg(T, ts, ts + .7);
    if (k >= 1) continue;
    ctx.globalAlpha = R.a * (1 - k) * .9; ctx.fillStyle = T < ts ? c.c : mix(LABO, CRAIE, k);
    ctx.fillText(T < ts ? c.ch : glyphe(s, T), R.x + c.x, R.y + c.y * ky - 40 * eOut(k));
  }
  // ceux qui voyagent : de leur place dans les règles à leur place dans la description
  ctx.font = TXT_FONT;
  for (let j = 0; j < Nt; j++) {
    const d = dst[j], s = Math.floor(j * Ns / Nt), c = src[s];
    const ts = t0 + (s / Ns) * .3, tf = t0 + .2 + (j / Nt) * .55 + hache(j * 7 + 3) * .15, u = eIO(seg(T, tf, tf + .75));
    const sx = R.x + c.x, sy = R.y + c.y * ky, dx = R.x + 24 + d.x, dy = R.y + TXT_Y + d.y;
    if (u >= 1) {
      const fl = 1 - seg(T, tf + .75, tf + 1.2);
      if (fl > 0 && d.ch !== ' ') { ctx.globalAlpha = R.a * .14 * fl; ctx.fillStyle = LABO; ctx.fillRect(dx - 1, dy - 18, 15, 24); }
      ctx.globalAlpha = R.a; ctx.fillStyle = fl > 0 ? mix(d.c, LABO, fl * .6) : d.c; ctx.fillText(d.ch, dx, dy);
      continue;
    }
    if (T < ts) { ctx.font = `21px ${MONO}`; ctx.globalAlpha = R.a; ctx.fillStyle = c.c; ctx.fillText(c.ch, sx, sy); ctx.font = TXT_FONT; continue; }
    // en vol : un caractère LABO qui scintille, sur un arc
    const lx = lerp(sx, dx, u), ly = lerp(sy, dy, u), len = Math.hypot(dx - sx, dy - sy) || 1, sw = Math.sin(Math.PI * u) * (hache(j * 31 + 1) - .5) * 160;
    ctx.globalAlpha = R.a * (.55 + .45 * Math.sin(Math.PI * u) + (u > .9 ? .3 : 0));
    ctx.fillStyle = u > .85 ? mix(LABO, d.c, (u - .85) / .15) : LABO;
    ctx.fillText(u > .92 ? d.ch : glyphe(j, T), lx - (dy - sy) / len * sw, ly + (dx - sx) / len * sw);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- la fenêtre de droite : DESCRIPTION INDIVIDUELLE, écrite avec la voix
function plumeIndiv(T) {
  if (T < R15.de || T > R15.a + .3) return null;
  const D = dispoIndiv(), n = ecritsIndiv(T);
  if (n <= 0 || n >= D.cars.length) return null;
  const c = D.cars[n - 1], m = mesureur(); m.font = TXT_FONT;
  return { x: FD.x + 24 + c.x + m.measureText(c.ch).width, y: FD.y + TXT_Y + c.y - 8 };
}
function fenetreDroite(ctx, T) {
  if (T < S.ouvre) return;
  const o = eOut(seg(T, S.ouvre, S.ouvre + .35)), hh = FD.h * o;
  fenetre(ctx, FD.x, FD.y + (FD.h - hh) / 2, FD.w, hh, 1);
  if (o < 1) { ctx.globalAlpha = 1; return; }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = TITRE_FONT; ctx.fillStyle = LABO; ctx.globalAlpha = 1;
  titreLettres(ctx, 'DESCRIPTION INDIVIDUELLE', FD.x + 24, FD.y + 40, Math.floor((T - S.ouvre - .4) * 40));
  ctx.fillStyle = FILET; ctx.fillRect(FD.x + 24, FD.y + 54, FD.w - 48, 2);
  const D = dispoIndiv(), n = ecritsIndiv(T);
  if (n <= 0) return;
  ctx.font = TXT_FONT;
  // le voile LABO sous la ligne qui s'écrit (ajouteRegle d'index.html), qui s'efface 1,4 s après
  const derniere = D.cars[n - 1].li, fini = n >= D.cars.length;
  for (let li = 0; li <= derniere; li++) {
    const tl = li < derniere || fini ? finLigne(li) : Infinity, fl = 1 - seg(T, tl, tl + 1.4);
    const yl = D.cars.find(c => c.li === li).y;
    if (fl > 0) { ctx.fillStyle = rgba(LABO, .12 * fl); ctx.fillRect(FD.x + 12, FD.y + TXT_Y + yl - 27, FD.w - 24, 37); }
  }
  for (let i = 0; i < n; i++) { const c = D.cars[i]; ctx.fillStyle = c.c; ctx.fillText(c.ch, FD.x + 24 + c.x, FD.y + TXT_Y + c.y); }
  // la plume : un curseur LABO, qui clignote quand la voix fait une pause, et s'éteint 0,5 s après la fin
  const p = plumeIndiv(T);
  const tFin = finLigne(D.n - 1);
  if (p && (Math.floor(T * 4) % 2 === 0 || ecritsIndiv(T - .12) < n)) { ctx.fillStyle = LABO; ctx.fillRect(p.x - 1, p.y - 9, 8, 20); }
  else if (fini && T < tFin + .5 && Math.floor(T * 4) % 2 === 0) {
    const c = D.cars[D.cars.length - 1], m = mesureur(); m.font = TXT_FONT;
    ctx.fillStyle = LABO; ctx.fillRect(FD.x + 24 + c.x + m.measureText(c.ch).width + 1, FD.y + TXT_Y + c.y - 17, 8, 20);
  }
}
// l'instant où la ligne li de la description individuelle a fini de s'écrire
const FINS = new Map();
function finLigne(li) {
  if (FINS.has(li)) return FINS.get(li);
  const D = dispoIndiv(); let k = 0; for (let i = 0; i < D.cars.length; i++) if (D.cars[i].li <= li) k = i + 1;
  let a = R15.de, b = R15.a + .01;
  for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (ecritsIndiv(m) >= k) b = m; else a = m; }
  FINS.set(li, b);
  return b;
}

// ---------------------------------------------------------------- « chacun joue avec ceux qui ont lu les mêmes mots »
const LIGNE = 'chacun joue avec ceux qui ont lu les mêmes mots', LIGNE_Y = 608;   // sous les deux fenêtres
function plumeLigne(T) {
  const n = Math.floor((T - S.ligne) * 40);
  if (n <= 0 || n >= LIGNE.length) return null;
  const m = mesureur(); m.font = `18px ${MONO}`;
  const w = m.measureText(LIGNE).width;
  return { x: 960 - w / 2 + m.measureText(LIGNE.slice(0, n)).width, y: LIGNE_Y - 6 };
}
function ligne(ctx, T) {
  const n = Math.floor((T - S.ligne) * 40);
  if (n <= 0) return;
  const a = 1 - seg(T, S.sort, S.sort + .4);
  if (a <= 0) return;
  ctx.font = `18px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(LIGNE).width;
  ctx.globalAlpha = a; ctx.fillStyle = GRIS; ctx.fillText(LIGNE.slice(0, n), 960 - w / 2, LIGNE_Y);
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- le tirage : un cadre laiton saute d'une fenêtre à l'autre
function cadreTirage(ctx, T) {
  const r = tirage(T); if (!r) return;
  const F = r.droite ? FD : (() => { const R = rectGauche(T); return { x: R.x, y: R.y, w: R.w, h: R.h }; })();
  const flash = 1 - seg(r.depuis, 0, .18);                 // chaque saut : un éclat qui retombe
  const clac = r.pose ? eOut(seg(T, S.pose, S.pose + .35)) : 1, gr = r.pose ? lerp(10, 0, clac) : 0;
  const m = 20 + gr;
  ctx.save();
  ctx.globalAlpha = .7 + .3 * flash;
  ctx.shadowColor = rgba(LAITON, .8); ctx.shadowBlur = 14 + 22 * flash + (r.pose ? 16 * (1 - clac) : 0);
  ctx.strokeStyle = LAITON; ctx.lineWidth = r.pose ? 5 : 4;
  ctx.strokeRect(F.x - m, F.y - m, F.w + 2 * m, F.h + 2 * m);
  ctx.restore();
  // posé : un éclat laiton bref sur la fenêtre choisie (le verrou)
  if (r.pose) { const e = 1 - seg(T, S.pose, S.pose + .45); if (e > 0) { ctx.globalAlpha = .1 * e; ctx.fillStyle = LAITON; ctx.fillRect(F.x, F.y, F.w, F.h); } ctx.globalAlpha = 1; }
}

// ---------------------------------------------------------------- le petit N°48, sous sa description
const N48X = 1440, N48Y = 684;   // (1440, 640) dans le scénario, sous la fenêtre descendue de 44 px
function leN48(ctx, T, O) {
  if (T < S.n48) return;
  const sc = eBack(seg(T, S.n48, S.n48 + .3)), N = PREMIERS[N48];
  dessineSujet(ctx, N, N48X, N48Y, 8 * sc, { col: GRIS_FIG, phi: O.phiW, cible: { x: N48X, y: FD.y + 120 }, fixe: T > S.n48 + .3, reflet: O.pose.ouvert }, T);
  crochets(ctx, N48X, N48Y, 2, { k: seg(T, S.n48 + .15, S.n48 + .55), a: seg(T, S.n48, S.n48 + .15) });
}

// ================================================================ la scène, à l'instant T
function scene(ctx, T) {
  const cam = camLot(T), O = etatOeil(T, cam);
  // le fond du laboratoire (index.html), qui chauffe avec la mort et s'éclaire avec la vie ; le sol suit la caméra
  fond(ctx, T, { chaud: chaud(T), clair: clair(T), sol: 0 });
  ctx.save(); cam.applique(ctx);
  sol(ctx, 1 - .55 * seg(T, S.montre, S.montre + 1) * (1 - seg(T, S.cache, S.cache + 1.2)));   // .45 avec une foule (index.html)
  flaques(ctx, T);
  pilules(ctx, T);
  foule(ctx, T, O);
  laJauge(ctx, T);
  fenetreGauche(ctx, T);
  fenetreDroite(ctx, T);
  cadreTirage(ctx, T);
  ligne(ctx, T);
  leN48(ctx, T, O);
  ctx.restore();
  // la lueur de Phi sur la salle, quand il vous regarde (« Les choix, eux, sont bien réels »)
  const lu = cloche(T, S.vous - .2, S.vous + .8, S.cache - .3, S.cache + .6);
  if (lu > 0) {
    const g = ctx.createRadialGradient(O.x, O.y, 20, O.x, O.y, 900);
    g.addColorStop(0, rgba(LABO, .07 * lu)); g.addColorStop(1, rgba(LABO, 0));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1080); ctx.restore();
  }
  // Phi
  dessinePhi(ctx, O);
  ctx.globalAlpha = 1;
}

// ================================================================ les plans
export const PLANS = [
  { id: 'P07', de: 40.8, a: 45.2, dessine: (ctx, t) => scene(ctx, t) },   // Les pilules
  { id: 'P08', de: 45.2, a: 60.8, dessine: (ctx, t) => scene(ctx, t) },   // La démonstration
  { id: 'P09', de: 60.8, a: 67.4, dessine: (ctx, t) => scene(ctx, t) },   // Rassurez-vous
  { id: 'P10', de: 67.4, a: 86.8, dessine: (ctx, t) => scene(ctx, t) },   // Autrement dit
];

// ================================================================ les indices sonores (vocabulaire : SCENARIO.md, « Le contrat technique »)
// f : la hauteur (tic, hop, note, grain : Hz) ; pour un souffle, le sens du glissement (−1 descend, 1 monte).
// La nappe dit laquelle par type ('labo'). Les « hop » : un par saut, hauteur tirée par hache, placés dans la stéréo.
const pan = x => clamp((x - 960) / 960 * .8, -1, 1);
export const SONS = Object.freeze([
  { t: 40.8, son: 'nappe', type: 'labo', g: .5 },
  // P07 : le scintillement des caractères qui s'assemblent (aigu pour la bleue, plus grave pour la rouge)
  { t: S.bleue, son: 'grain', d: 2.4, f: 2400, g: .35, pan: pan(380) },
  { t: S.rouge, son: 'grain', d: 2.4, f: 1300, g: .35, pan: pan(920) },
  ...TREGLE.map((t, i) => ({ t, son: 'frappe', d: [24, 65, 45, 60, 55][i] / CPS_R, g: .25, pan: .55 })),
  // P08 : les pilules deviennent icônes ; la foule revient (un tic par arrivée) ; un « hop » par saut
  { t: S.icones, son: 'souffle', d: 1.0, f: -1, g: .3 },
  ...SUJETS.map(s => ({ t: +s.ta.toFixed(3), son: 'tic', g: .08, f: 1800 + hache(s.f.i * 3 + 1) * 900, pan: pan(s.f.cx) })),
  ...SUJETS.flatMap(s => [s.tc1, s.tc2, s.tc3].filter(t => t !== null).map((t, k) => ({ t: +t.toFixed(3), son: 'hop', f: 380 + hache(s.f.i * 11 + k) * 420, g: k === 2 ? .12 : .16, pan: pan(s.f.cx) }))),
  { t: S.lueur, son: 'vie', d: 2.0, g: .5 },
  { t: S.peur2, son: 'peur', d: 1.4, g: .35 },
  { t: S.tue2, son: 'envol', d: 1.9, g: .45 },
  { t: S.remet2, son: 'souffle', d: .4, g: .15 },
  { t: S.abst, son: 'tic', f: 660, g: .3, pan: pan(775) },
  { t: S.tue3, son: 'note', f: 49, d: .9, g: .8 },               // le coup sourd : tout le monde meurt
  { t: S.tue3 + .05, son: 'envol', d: 4.0, g: .55 },
  { t: S.fige, son: 'silence', d: S.figeD },                     // « Je déconseille » : la salle se tait une seconde
  // P09 : le bruissement des caractères joué à l'envers ; puis la salle, apaisée
  { t: S.retour, son: 'retour', d: 2.0, g: .5 },
  { t: S.vous, son: 'note', f: 220, d: 1.6, g: .18 },
  // P10 : la fenêtre qui glisse ; les caractères qui se recomposent ; l'autre fenêtre ; les bips de l'écriture
  { t: S.cache, son: 'souffle', d: .8, g: .2 },
  { t: S.glisse, son: 'souffle', d: 1.2, f: 1, g: .3, pan: -.4 },
  { t: M0, son: 'grain', d: 1.5, f: 2000, g: .3, pan: -.4 },
  { t: S.ouvre, son: 'declic', g: .35, pan: .5 },
  { t: R15.de, son: 'frappe', d: R15.a - R15.de - .2, g: .12, pan: .5 },
  { t: S.ligne, son: 'frappe', d: LIGNE.length / 40, g: .15 },
  // le tirage : des tics de roulette qui ralentissent, puis le verrou
  ...SAUTS.slice(0, 8).map((t, k) => ({ t: +t.toFixed(3), son: 'tic', f: 1400, g: .3, pan: k % 2 ? -.5 : .5 })),
  { t: S.pose, son: 'clac', g: .6, pan: .5 },
  { t: S.n48, son: 'pop', g: .25, pan: .5 },
  { t: S.sort + .2, son: 'souffle', d: .5, f: -1, g: .25, pan: -.6 },
].sort((a, b) => a.t - b.t));
