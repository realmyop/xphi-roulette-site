/* ==========================================================================
   Les deux pilules, l'épisode — plans/ecarts.js : le lot « ecarts »
   P61–P72, de 978,4 à 1169,4 s (16:18,4–19:29,4), répliques Q01–N20.
   Partie 2 · Qui prend la bleue ? (dans le script : 16:00 – 17:15 : les
   écrans 09 et 10 de Thibaut, la carte « à mesurer ») ; Partie 3 · Mauvais
   ou méchants (17:15 – 19:30).

   Ronan : « Toutes les séquences du script, dans l'ordre, avec le texte de
   Thibaut tel quel pour la voix et les images qu'il indique. On reprend son
   test et ses douze écrans de résultats, avec les nouveaux bonshommes, et on
   crée le reste (Kant, Alice, Nietzsche, le méta-dilemme). » ; « je veux que
   tu prennes les petits bonhommes que tu as dans le premier film de 3
   minutes 20 ». Ici : les écrans 09 et 10 de Thibaut (resultats.js), la carte
   « à mesurer », la dispute floutée, Nietzsche, le mauvais et le méchant,
   les deux colonnes, l'insulte, le virus saisonnier, la description avant
   tout, et l'écran 10 qui revient : chaque [VISUEL] du script de ces deux
   séquences (EPISODE.md, P61–P72), en bonshommes du film (commun.js :
   dessineSujet, l'atlas, les états).

   Les fichiers du lot :
   - ecarts-temps.js   le minutage (chaque geste sur son mot : quandMot) et les
                       places de Phi ;
   - ecarts-ecrans.js  P61–P64, P72 : les écrans 09 et 10, la carte ;
   - ecarts-morale.js  P65–P69 : le fil flouté, Nietzsche, les deux scènes, les
                       deux colonnes, l'insulte ;
   - ecarts-cause.js   P70–P71 : les vagues, la description et ses fils ;
   - ce fichier        LOT, PLANS, SONS, et Phi (où il est, ce qu'il regarde,
                       ses humeurs).
   Chacun dit en tête ce qu'il dessine, ce qu'il reprend et ce qu'il recopie.

   AUCUN CHIFFRE n'est écrit dans ces fichiers : ils viennent de donnees.js
   (GENRE, POLITIQUE, ECARTS, PAYS, FIGURES), avec la précision des écrans de
   Thibaut. Les pays restent « à mesurer » : la carte n'a ni point de
   participant ni chiffre (EUROPE.donnees, inventé, n'est jamais lu).
   Les messages des réseaux sont des cartes abstraites (commun.js : carte),
   sans nom, sans marque, sans date ; la mention « messages inventés… » est
   posée par le socle.

   Raccords :
   - entrée (978,4 s) : coupe franche depuis l'écran 08 (lot resultats) :
     l'écran 09 vide, la devinette qui se tape ;
   - sortie (1 169,4 s) : l'écran 10, toutes ses lignes posées, la barre des
     53 allumée, les autres à 40 % ; coupe franche vers le laboratoire (P73,
     lot fin) ;
   - les deux colonnes de P68 (reprises en petit en P77 par le lot fin) : voir
     ecarts-morale.js, COLS et QUATRE (la bleue à gauche : la pilule en
     (480, 150), « BON / MÉCHANT » ; la rouge en (1 440, 150), « BON /
     MAUVAIS » ; les mots en DotGothic16 44 px, baseline y 318, à ±150 px de
     l'axe de leur colonne ; un sujet ×3 sous chaque mot, centré en y 540).

   Essais : index.html?plan=ecarts (le lot en boucle), ?plan=P63, ?t=1015.5 ;
   dans la console, (await import('./plans/ecarts.js')).ESSAI : les instants.
   ========================================================================== */
import {
  clamp, lerp, seg, eIO, interp, oeil, humeur, creeRegard, VOUS, point, flotte, hache,
} from '../commun.js';
import { plume as plumeBoite } from '../texte.js';
import { ebauche } from './ebauche.js';
import { S, BORNES, OEIL } from './ecarts-temps.js';
import {
  ecran09, plumeDev, centreDev, BARRES9, hautBarre9, debutBarre, teteTemoin9, carte, centrePays, lignePays,
  fenetrePaysCentre, rangeesPays, echelle, boutLigne, etiquettePts, I64, I72,
} from './ecarts-ecrans.js';
import {
  messagesFloutes, flecheQuiPasse, genealogie, MOTS, teteImpression, visageNietzsche, plumeTerminalN, RANGEES_N,
  teteMauvais, teteMechant, teteVoisin, centreBullePensee, deuxColonnes, QUATRE, teteY, xRougeBon, BULLES,
  centreBulle, tRecu, ANNEAUX,
} from './ecarts-morale.js';
import {
  virus, bornesVague, anneauxVague, centreCarteVague, VAGUES, description, centreFenetre, KANT71, POURCENT,
  filQuiArrive, ARRIVEES_FILS, etiquettePremier, VISES_TETES,
} from './ecarts-cause.js';

export const LOT = { id: 'ecarts', de: 978.4, a: 1169.4 };

// ================================================================ Phi : où il est
const P = BORNES;
function placeOeil(T) {
  if (T < P.P63[0]) return OEIL.resultats;
  if (T < P.P64[0]) return OEIL.carte;
  if (T < P.P65[0]) return OEIL.resultats;
  if (T < P.P66[0]) return OEIL.filet;
  if (T < P.P68[0]) return interp(OEIL.filet, OEIL.nietzsche, eIO(seg(T, P.P66[0], P.P66[0] + .8)));   // il glisse vers Nietzsche
  if (T < P.P70[0]) return OEIL.filet;
  if (T < P.P71[0]) return OEIL.vagues;
  if (T < P.P72[0]) return OEIL.colonnes;
  return OEIL.resultats;
}
// son vrai centre (il flotte de 4 px) : la lumière des sujets, ce qu'ils regardent quand ils lèvent les yeux
const oeilXY = T => { const O = placeOeil(T); return { x: O.x, y: O.y + flotte(T), taille: O.taille }; };

// ================================================================ Phi : ce qu'il regarde (EPISODE.md, « Phi regarde »)
const pt = q => (q ? point(q.x, q.y) : null);
const au = (q, dy = 0) => point(q.x, q.y + dy);
const bout10 = (cle, I) => T => pt(boutLigne(cle, T, I));
function cibles() {
  const C = [];
  const add = (t, d, c, p) => { if (d > 0) C.push([t, d, c, p]); };
  // P61 : les lignes de la question, à mesure qu'elles s'écrivent ; vous ; les barres vides, une à une
  add(S.p61 + .15, S.compte - S.p61 - .15, T => pt(plumeDev(T)) || au(centreDev), .15);
  add(S.compte, .8, VOUS);
  BARRES9.forEach((b, k) => add(S.compte + .8 + k * .3, .3, au(hautBarre9(b, S.p61), -28)));
  // P62 : femmes, hommes (le sommet qui monte) ; les barres politiques, de gauche à droite ; la pente ; les deux extrêmes
  add(S.efface, S.femmes - S.efface, au(teteTemoin9(1)));
  add(S.femmes, 1.9, T => pt(hautBarre9(BARRES9[1], T)), .2);
  add(S.femmes + 1.9, S.hommes - S.femmes - 1.9, VOUS);
  add(S.hommes, 1.9, T => pt(hautBarre9(BARRES9[0], T)), .2);
  add(S.hommes + 1.9, S.pol - S.hommes - 1.9, VOUS);
  add(debutBarre(BARRES9[2]), 2.0, T => { const k = clamp(Math.floor((T - debutBarre(BARRES9[2])) / .15), 0, 4); return pt(hautBarre9(BARRES9[2 + k], T)); }, .2);
  add(S.pente, 1.0, T => { const k = eIO(seg(T, S.pente, S.pente + .9)) * 4, j = Math.min(3, Math.floor(k)); const a = hautBarre9(BARRES9[2 + j], T), b = hautBarre9(BARRES9[3 + j], T); return point(lerp(a.x, b.x, k - j), lerp(a.y, b.y, k - j)); }, .15);
  add(S.c39, 1.7, au(hautBarre9(BARRES9[2], P.P63[0])));
  add(S.c23, 1.7, au(hautBarre9(BARRES9[6], P.P63[0])));
  add(S.c23 + 1.7, P.P63[0] - S.c23 - 1.7, VOUS);
  // P63 : la terre qui se pose ; la boîte ; chaque pays quand il s'allume, puis sa ligne dans la fenêtre
  add(P.P63[0], 1.0, point(620, 360));
  add(P.P63[0] + 1.0, .6, au(fenetrePaysCentre));
  S.pays.forEach((t, k) => { add(t, .95, T => pt(centrePays(k, T)), .3); add(t + .95, .8, au(lignePays(k))); });
  add(S.pays[4] + 1.75, P.P64[0] - S.pays[4] - 1.75, VOUS);
  // P64 : les noms qui se rangent ; chaque barre quand elle pousse ; la longue jusqu'au bout ; chaque « PTS » ; vous
  add(P.P64[0], .9, au(boutLigne('pays', P.P64[0], I64)));
  add(S.ecarts + .1, 1.0, bout10('genre', I64), .15);
  add(S.ecarts + 1.1, 1.0, bout10('politique', I64), .15);
  add(S.ecarts + 2.1, S.desc - S.ecarts - 2.1, VOUS);
  add(S.desc + .1, 2.0, bout10('description', I64), .15);
  add(S.desc + 2.1, S.c11 - S.desc - 2.1, VOUS);
  add(S.c11, 1.1, au(etiquettePts('genre', I64)));
  add(S.c16, 1.1, au(etiquettePts('politique', I64)));
  add(S.c53, 1.8, au(etiquettePts('description', I64)));
  add(S.c53 + 1.8, P.P65[0] - S.c53 - 1.8, VOUS);
  // P65 : le fil (la colonne bleue, puis la rouge) ; les flèches qui passent ; toutes, quand elles clignotent ; vous sur « autant ? »
  add(P.P65[0], .9, point(530, 330));
  add(P.P65[0] + .9, S.revenons - P.P65[0] - .9, point(1390, 330));
  add(S.revenons, S.detestent - S.revenons, T => pt(flecheQuiPasse(T)), .2);
  add(S.detestent, S.autant - S.detestent, point(960, 330));
  add(S.autant, P.P66[0] - S.autant, VOUS);
  // P66 : le terminal ; la ligne du balayage ; son visage ; « BON », les deux traits, « MAUVAIS », « MÉCHANT »
  add(P.P66[0], S.calcul - P.P66[0], T => pt(plumeTerminalN(T)) || point(1570, 300), .2);
  add(S.calcul, S.nom - S.calcul, T => pt(teteImpression(T)), .25);
  add(S.nom, S.bon - S.nom, au(visageNietzsche));
  add(S.bon, S.contraires - S.bon, au(MOTS.bon));
  add(S.contraires, S.mauvais - S.contraires, point(430, 420));
  add(S.mauvais, S.mechant - S.mauvais, au(MOTS.mauvais));
  add(S.mechant, P.P67[0] - S.mechant, au(MOTS.mechant));
  // P67 : le mauvais, et ceux qui s'approchent ; le méchant, sa pensée, et ceux qui s'écartent
  add(P.P67[0], S.plaint - P.P67[0], au(teteMauvais));
  add(S.plaint, .6, T => pt(teteVoisin('mauvais', 1, T)));
  add(S.plaint + .6, 1.1, T => pt(teteVoisin('mauvais', 0, T)));
  add(S.plaint + 1.7, S.veut - S.plaint - 1.7, VOUS);
  add(S.veut, 1.3, au(centreBullePensee));
  add(S.veut + 1.3, S.blame - S.veut - 1.3, au(teteMechant));
  add(S.blame, .6, T => pt(teteVoisin('mechant', 0, T)));
  add(S.blame + .6, .7, T => pt(teteVoisin('mechant', 1, T)));
  // P68 : la colonne rouge (le rouge, son ✓, le bleu penaud, le rouge qui s'approche, la main) ; la colonne bleue (le
  // bleu, ses anneaux, puis le rouge montré du doigt)
  const tete = cle => T => point(cle === 'rougeBon' ? xRougeBon(T).x : QUATRE[cle].x, teteY);
  add(P.P68[0] + .1, S.rouges - P.P68[0] - .1, point(1440, 160));
  add(S.rouges, S.premier - S.rouges, tete('rougeBon'));
  add(S.premier, S.correct - S.premier, point(QUATRE.rougeBon.x, 300));
  add(S.correct, S.trompes - S.correct, point(QUATRE.rougeBon.x, teteY - 90));
  add(S.trompes, S.betes - S.trompes, tete('bleuMauvais'));
  add(S.betes, S.regrettent - S.betes, tete('rougeBon'), .2);
  add(S.regrettent, 1.6, point(QUATRE.rougeBon.x + 225, teteY + 50));
  add(S.regrettent + 1.6, S.bleus - S.regrettent - 1.6, VOUS);
  add(S.bleus, S.second - S.bleus, point(480, 160));
  add(S.second, S.bien - S.second, point(QUATRE.bleuBon.x, 300));
  add(S.bien, 1.4, T => { const r = 10 + 320 * clamp((T - ANNEAUX[0]) / 1.2); return point(QUATRE.bleuBon.x + r * .7, teteY + r * .5); }, .2);
  add(S.bien + 1.4, S.faute - .2 - S.bien - 1.4, VOUS);
  add(S.faute - .2, .5, tete('bleuBon'));
  add(S.faute + .3, P.P69[0] - S.faute - .3, tete('rougeMechant'));
  // P69 : les deux bulles qui se croisent ; celui qui reçoit
  const [B1, B2] = BULLES;
  add(S.blament, S.plaignent - S.blament, T => pt(centreBulle(B1, T)), .3);
  add(S.plaignent, 1.4, T => pt(centreBulle(B2, T)), .3);
  add(S.plaignent + 1.4, tRecu() - 1.3 - S.plaignent - 1.4, VOUS);
  add(tRecu() - 1.3, 1.2, point(960, 404));
  add(tRecu() - .1, 1.1, tete('rougeBon'));
  add(tRecu() + 1.0, .9, tete('bleuBon'));
  add(tRecu() + 1.9, P.P70[0] - tRecu() - 1.9, VOUS);
  // P70 : chaque vague, de sa première carte à la dernière ; vous sur « saisonnier »
  VAGUES.forEach((V, w) => {
    const b = bornesVague(w), fin = w < 3 ? VAGUES[w + 1].t0 : P.P71[0];
    add(V.t0, .6, T => pt(centreCarteVague(T, b.origine)));
    add(V.t0 + .6, Math.min(fin, b.tLoin + .6) - V.t0 - .6, T => pt(centreCarteVague(T, b.loin)));
  });
  add(S.saisonnier, P.P71[0] - S.saisonnier, VOUS);
  // P71 : les deux fenêtres ; Kant, le « % » ; vous sur « avant tout » ; les fils qui descendent, de chaque fenêtre ;
  // les étiquettes « lue en premier »
  add(P.P71[0], 1.1, au(centreFenetre(0)));
  add(P.P71[0] + 1.1, 1.1, au(centreFenetre(1)));
  add(P.P71[0] + 2.2, S.kant - P.P71[0] - 2.2, VOUS);
  add(S.kant, .55, au(KANT71));
  add(S.kant + .55, .65, au(VISES_TETES[0][2]));
  add(S.proba, .55, au(POURCENT));
  add(S.proba + .55, .65, au(VISES_TETES[1][2]));
  add(S.proba + 1.2, S.avantTout - S.proba - 1.2, VOUS);
  add(S.avantTout, S.cause - S.avantTout, VOUS);
  add(S.cause, .7, T => pt(filQuiArrive(T, 0)), .15);
  add(S.cause + .7, .7, T => pt(filQuiArrive(T, 1)), .15);
  add(S.cause + 1.4, S.lue - S.cause - 1.4, au(centreFenetre(0)));
  add(S.lue, .55, au(etiquettePremier(0)));
  add(S.lue + .55, .55, au(etiquettePremier(1)));
  add(S.lue + 1.1, P.P72[0] - S.lue - 1.1, VOUS);
  // P72 : la longue barre, jusqu'au bout ; vous
  add(P.P72[0], .9, au(boutLigne('description', P.P72[0], I72)));
  add(P.P72[0] + .9, S.loin - P.P72[0] - .9, VOUS);
  add(S.loin, 1.9, au(boutLigne('description', S.loin, I72)));
  add(S.important, 1.2, au(boutLigne('description', S.loin, I72), -10));
  add(S.important + 1.2, P.P72[1] - S.important - 1.2, VOUS);
  return C;
}
let REGARD = null;
const regard = () => REGARD || (REGARD = creeRegard({ cibles: cibles(), repos: [[3, VOUS], [2, T => plumeBoite(T)]] }));

// ses humeurs (EPISODE.md ; les humeurs des écrans de Thibaut, ECRANS[9] et [10] : curieux, neutre ; neutre, grand)
const HUMEURS = [
  [S.p61, 'curieux', .01], [S.pol, 'neutre'], [S.c39, 'grand'], [S.c23 + 1.2, 'neutre'],
  [P.P63[0], 'neutre', .01], [S.finQ04, 'curieux'], [S.pays[4] + 1.2, 'doute'],
  [P.P64[0], 'neutre', .01], [S.desc + .3, 'grand'], [S.c53 + 1.5, 'neutre'],
  [P.P65[0], 'neutre', .01], [S.detestent, 'doute'],
  [P.P66[0], 'curieux', .4], [S.nom, 'neutre'], [S.bon, 'grand'], [S.mechant + .9, 'neutre'],
  [S.plaint, 'bas'], [S.veut, 'neutre'], [S.blame, 'plisse'],
  [P.P68[0], 'neutre', .01], [S.betes, 'doute'], [S.second, 'neutre'], [S.bien, 'grand'], [S.faute, 'plisse'],
  [P.P69[0], 'neutre', .3], [S.insulte, 'doute'],
  [P.P70[0], 'neutre', .01], [S.vagues[1], 'curieux'], [S.vagues[3], 'plisse'],
  [P.P71[0], 'neutre', .01], [S.avantTout, 'grand'], [S.lue + 1, 'neutre'],
  [P.P72[0], 'neutre', .01], [S.loin, 'grand'],
];
// la secousse de Thibaut (écran 10 : son pas 1, + 0,3 s) : quand la barre de la description file
const SECOUSSE = S.desc + .3;
function phi(ctx, T) {
  const O = placeOeil(T);
  oeil(ctx, T, { x: O.x, y: O.y, taille: O.taille, humeur: humeur(T, HUMEURS, 'curieux'), regard: regard(), secoue: T >= SECOUSSE ? SECOUSSE : -99 });
  ctx.globalAlpha = 1;
}

// ================================================================ les plans (EPISODE.md, « Les plans »)
const avecPhi = scene => (ctx, t, cam, infos) => { scene(ctx, t, infos); phi(ctx, t); };
const sceneCarte = (ctx, t, cam, infos) => {
  if (!carte(ctx, t, infos)) { ebauche(ctx, t, cam, { ...infos, statut: 'europe.js absent : pas de carte' }); return; }
  phi(ctx, t);
};
export const PLANS = [
  { id: 'P61', de: P.P61[0], a: P.P61[1], dessine: avecPhi(ecran09) },                                // Devinette : qui ? (sans voix)
  { id: 'P62', de: P.P62[0], a: P.P62[1], dessine: avecPhi(ecran09) },                                // Genre, politique (Q01–Q03)
  { id: 'P63', de: P.P63[0], a: P.P63[1], dessine: sceneCarte },                                      // L'Europe à mesurer (Q04)
  { id: 'P64', de: P.P64[0], a: P.P64[1], dessine: avecPhi((ctx, t) => echelle(ctx, t, I64)) },       // Tous les écarts (Q05–Q06)
  { id: 'P65', de: P.P65[0], a: P.P65[1], dessine: avecPhi(messagesFloutes) },                        // Les messages, floutés (N01–N02)
  { id: 'P66', de: P.P66[0], a: P.P66[1], dessine: avecPhi((ctx, t) => genealogie(ctx, t, oeilXY(t))) },   // Nietzsche (N03–N04)
  { id: 'P67', de: P.P67[0], a: P.P67[1], dessine: avecPhi((ctx, t) => genealogie(ctx, t, oeilXY(t))) },   // Le mauvais, le méchant (N05–N08)
  { id: 'P68', de: P.P68[0], a: P.P68[1], dessine: avecPhi((ctx, t) => deuxColonnes(ctx, t, oeilXY(t))) }, // Bon / mauvais, bon / méchant (N09–N13)
  { id: 'P69', de: P.P69[0], a: P.P69[1], dessine: avecPhi((ctx, t) => deuxColonnes(ctx, t, oeilXY(t))) }, // Une insulte (N14)
  { id: 'P70', de: P.P70[0], a: P.P70[1], dessine: avecPhi(virus) },                                  // Un virus saisonnier (N15–N16)
  { id: 'P71', de: P.P71[0], a: P.P71[1], dessine: avecPhi((ctx, t) => description(ctx, t, oeilXY(t))) },  // Avant tout, la description (N17–N19)
  { id: 'P72', de: P.P72[0], a: P.P72[1], dessine: avecPhi((ctx, t) => echelle(ctx, t, I72)) },       // De très loin (N20)
];

// ================================================================ les indices sonores (tools/son-pilules.cjs)
// f : la hauteur (tic, hop, pop, note : Hz ; souffle : [de, à] en Hz, 1 monte, −1 descend) ; pan : la place dans la stéréo
const pan = x => +clamp((x - 960) / 960 * .8, -1, 1).toFixed(2);
const r3 = t => +t.toFixed(3);
function sons() {
  const L = [];
  const s = o => L.push({ ...o, t: r3(o.t) });
  // P61 : la salle ; la frappe des trois lignes ; la trotteuse pendant le compte à rebours
  s({ t: S.p61, son: 'nappe', f: 'labo', g: .5 });
  ['Femmes ou hommes ?', 'Gauche ou droite ?', 'Qui prend le plus la bleue ?'].forEach((l, k) => s({ t: S.lignes[k], son: 'frappe', d: +(l.length / 36).toFixed(2), g: .4 }));
  for (let k = 0; k < Math.ceil(S.compteD - 1e-6); k++) s({ t: S.compte + k, son: 'trotteuse', g: .3 });
  // P62 : les barres (un souffle court) ; un tic par chiffre ; la pente ; les cernes
  for (const b of [BARRES9[1], BARRES9[0]]) {
    const x = hautBarre9(b, S.p61).x;
    s({ t: debutBarre(b), son: 'souffle', d: 1.0, f: [500, 1500], g: .18, pan: pan(x) });
    s({ t: debutBarre(b) + .3, son: 'tic', f: 2600, g: .25, pan: pan(x) });
  }
  s({ t: debutBarre(BARRES9[2]), son: 'souffle', d: 1.9, f: [500, 1500], g: .2, pan: .3 });
  BARRES9.slice(2).forEach((b, j) => s({ t: debutBarre(b) + .3, son: 'tic', f: 2400 + 120 * j, g: .2, pan: pan(hautBarre9(b, S.p61).x) }));
  s({ t: S.pente, son: 'souffle', d: .9, f: [1600, 900], g: .1, pan: .3 });
  s({ t: S.c39, son: 'tic', f: 2900, g: .25, pan: pan(hautBarre9(BARRES9[2], S.p61).x) });
  s({ t: S.c23, son: 'tic', f: 2900, g: .25, pan: pan(hautBarre9(BARRES9[6], S.p61).x) });
  // P63 : un tic par rangée de cases qui s'allume, en pluie courte, pour chaque pays ; rien d'autre (la place de la voix)
  for (let k = 0; k < 5; k++) for (const r of rangeesPays(k)) s({ t: r.t, son: 'tic', f: 3000 + 200 * k + 80 * hache(Math.round(r.t * 100)), g: .07, pan: pan(r.x) });
  // P64 : les barres (un souffle), la longue plus longtemps ; un tic par chiffre ; la secousse
  s({ t: S.ecarts + .2, son: 'souffle', d: .8, f: [600, 1400], g: .18, pan: -.2 });
  s({ t: S.ecarts + .6, son: 'souffle', d: .8, f: [600, 1500], g: .18, pan: -.1 });
  s({ t: S.desc + .2, son: 'souffle', d: 1.8, f: [400, 2600], g: .3, pan: .2 });
  s({ t: S.c11, son: 'tic', f: 2500, g: .28, pan: -.2 });
  s({ t: S.c16, son: 'tic', f: 2700, g: .28, pan: -.1 });
  s({ t: S.c53, son: 'tic', f: 3000, g: .32, pan: .4 });
  // P65 : la nuit ; la rumeur des notifications, étouffée (des haptique lents, très bas) ; les flèches qui clignotent
  s({ t: P.P65[0], son: 'nappe', f: 'nuit', g: .5 });
  for (let t = S.revenons; t < P.P66[0] - .3; t += .85) if (!(t > S.detestent - .2 && t < S.detestent + .84)) s({ t, son: 'haptique', g: .12, pan: hache(Math.round(t * 10)) < .5 ? -.4 : .4 });
  [0, .28, .56].forEach(d => s({ t: S.detestent + d, son: 'haptique', g: .16 }));
  // P66 : le terminal ; les tic du calcul du portrait (un par rangée, comme pour Kant) ; un tic par mot posé ; les traits
  s({ t: S.terminal, son: 'frappe', d: 1.3, g: .35, pan: .4 });
  RANGEES_N.forEach(t => s({ t, son: 'tic', f: 1800, g: .1, pan: .6 }));
  s({ t: S.nom, son: 'declic', g: .3, pan: .6 });
  s({ t: S.bon, son: 'tic', f: 2200, g: .3, pan: -.4 });
  s({ t: S.contraires, son: 'souffle', d: .45, f: [1800, 1100], g: .1, pan: -.4 });
  s({ t: S.mauvais, son: 'tic', f: 2000, g: .28, pan: -.7 });
  s({ t: S.mechant, son: 'tic', f: 2400, g: .28, pan: -.15 });
  // P67 : le saut raté ; des pas doux pour l'approche ; la bulle ; des pas secs pour l'écart (des tic graves) ; « ! »
  s({ t: S.rate + .11, son: 'hop', f: 560, g: .25, pan: -.7 });
  s({ t: S.rate + .45, son: 'haptique', g: .3, pan: -.7 });
  [0, .35].forEach(d => { s({ t: S.plaint + d, son: 'tic', f: 640, g: .14, pan: -.8 }); s({ t: S.plaint + d + .05, son: 'tic', f: 600, g: .14, pan: -.55 }); });
  s({ t: S.veut, son: 'pop', f: 700, g: .16, pan: -.1 });
  s({ t: S.veut + .5, son: 'envol', d: 1.2, g: .08, pan: -.1 });
  [0, .24].forEach(d => { s({ t: S.blame + d, son: 'tic', f: 380, g: .3, pan: -.35 }); s({ t: S.blame + d + .03, son: 'tic', f: 340, g: .3, pan: .05 }); });
  s({ t: S.blame + .55, son: 'tic', f: 3000, g: .22, pan: -.15 });
  // P68 : la salle ; le ✓ ; des pas doux ; le sonar doux du signal (les trois notes de P30) ; un tic sec pour le « ! »
  s({ t: P.P68[0], son: 'nappe', f: 'labo', g: .5 });
  s({ t: S.correct, son: 'coche', g: .3, pan: pan(QUATRE.rougeBon.x) });
  [0, .4].forEach(d => s({ t: S.betes + d, son: 'tic', f: 620, g: .15, pan: pan(QUATRE.rougeBon.x + 75 * (1 + d / .4)) }));
  ANNEAUX.forEach((t, j) => s({ t, son: 'note', f: [988, 880, 784][j], d: .5, g: .16, pan: pan(QUATRE.bleuBon.x) }));
  s({ t: S.faute + .15, son: 'tic', f: 3100, g: .26, pan: pan(QUATRE.bleuBon.x) });
  // P69 : chaque bulle, un petit glissement ; en passant le filet, un grésillement de caractères ; le sursaut
  s({ t: S.blament, son: 'souffle', d: .5, f: [900, 1500], g: .14, pan: -.5 });
  s({ t: S.plaignent, son: 'souffle', d: .5, f: [1500, 900], g: .14, pan: .5 });
  s({ t: tRecu() - 1.0, son: 'grain', d: 1.1, f: 2400, g: .3 });
  s({ t: tRecu(), son: 'haptique', g: .28, pan: pan(QUATRE.rougeBon.x + 150) });
  s({ t: tRecu() + .04, son: 'haptique', g: .28, pan: pan(QUATRE.bleuBon.x) });
  // P70 : la nuit ; chaque vague, une montée de haptique et de pop (un par anneau), puis le reflux (un souffle qui descend)
  s({ t: P.P70[0], son: 'nappe', f: 'nuit', g: .45 });
  VAGUES.forEach((V, w) => {
    const { anneaux, reflux } = anneauxVague(w);
    anneaux.forEach((t, d) => { s({ t, son: 'haptique', g: .08 + .012 * d }); s({ t: t + .02, son: 'pop', f: 700 + 90 * d, g: .07 }); });
    s({ t: Math.min(reflux, P.P71[0] - .6), son: 'souffle', d: .9, f: -1, g: .16 });
  });
  // P71 : la salle ; Kant, le « % » (un pop chacun) ; les fils fins : rien ; les fils nets : une pluie de tic clairs, un
  // par sujet relié ; les étiquettes
  s({ t: P.P71[0], son: 'nappe', f: 'labo', g: .5 });
  s({ t: S.kant, son: 'pop', f: 900, g: .1, pan: pan(KANT71.x) });
  s({ t: S.proba, son: 'pop', f: 1000, g: .1, pan: pan(POURCENT.x) });
  ARRIVEES_FILS.forEach((a, n) => s({ t: a.t, son: 'tic', f: [3200, 3500, 3800, 4100][n % 4], g: .045, pan: pan(a.x) }));
  [0, .25].forEach((d, j) => s({ t: S.lue + d, son: 'tic', f: 2200, g: .18, pan: pan(etiquettePremier(j).x) }));
  // P72 : un tic sur « très loin »
  s({ t: S.loin, son: 'tic', f: 2800, g: .32, pan: .2 });
  return Object.freeze(L.sort((a, b) => a.t - b.t).map(Object.freeze));
}
export const SONS = sons();

// ================================================================ pour les essais (la console)
export const ESSAI = Object.freeze({ instants: S, bornes: BORNES, sons: SONS.length });
