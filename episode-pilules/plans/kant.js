/* ==========================================================================
   Les deux pilules, l'épisode — plans/kant.js : le lot « kant »
   P19–P31, de 171,6 à 381,6 s (2:51,6–6:21,6), répliques K01–K32.
   Partie 1 · Un dilemme kantien ? (dans le script : 3:00 – 6:15).

   Ronan : « Toutes les séquences du script, dans l'ordre, avec le texte de
   Thibaut tel quel pour la voix et les images qu'il indique […] et on crée le
   reste (Kant, Alice, Nietzsche, le méta-dilemme) » ; « je veux que tu
   prennes les petits bonhommes que tu as dans le premier film de 3 minutes
   20 ». Ici, Kant, et le test d'universalisation, en bonshommes du film
   (commun.js : dessineSujet, l'atlas, les coiffes, les états), sur les
   SUJETS DE DÉMONSTRATION (DEMO : jamais le N°48) :

   - P19–P21, le cabinet : la fenêtre « KANT », où le portrait se calcule
     rangée par rangée sous la ligne de balayage (un bonhomme de l'atlas,
     cs 32, coiffé de la perruque à catogan et du jabot : PORTRAITS.kant) ;
     le terminal tape « > ouvrir kant », puis la maxime au rythme de la voix ;
     Phi la récrit DESSOUS, en LABO, sans rien raturer, et en fait une
     fonction : « > universaliser(règle) → ✓ ou ✗ ».
   - P22–P23, la fausse promesse en champ-contrechamp : la main tendue, la
     pièce, « Je te rembourse demain. », puis le dos et ses doigts croisés,
     et la fenêtre « MAXIME ».
   - P24–P27, la grille des cent : la même vague de proche en proche, trois
     fois (partage.js : vague) — la promesse (→ ✗), la bleue (→ ✓), la rouge
     (→ ✓) —, les trois verdicts empilés au terminal ; « EXEMPLE » sur la
     jauge : ce ne sont pas des résultats.
   - P28–P30, l'écran partagé (cent bleus, cent rouges, « cent survivants »),
     les quatre configurations (la rouge vit dans tous les cas ; la bleue :
     ✓ ✓ ✗ ✗), le signal, et la rime du dos : les mains ouvertes.
   - P31, l'anneau : les 62 bleus de b62 en cercle (partage.js : anneau,
     ORDRE_ANNEAU), leurs flèches, « SAUVÉS = EN DANGER », la rotation.

   Chaque geste tombe sur son mot (quandMot, finParole, lettres de texte.js :
   le jour où la voix de Ronan est posée, tout suit) ; aucun état d'une image
   à l'autre, jamais Math.random (hache) ; ?t=287.2 donne l'image de la
   lecture. Les petits dessins qui manquent à commun.js sont dans
   plans/kant-outils.js.

   Écarts au découpage, voulus (EPISODE.md, P19–P31) :
   - P19–P21 : la fenêtre KANT descend sous le cartouche du socle (x 140–560,
     y 148–558, au lieu de y 60–540 : le cartouche, en (48, 40), en couvrait
     le coin) ; le terminal va de y 606 à 830, ses six rangées y tiennent
     (le titre, la maxime, la version de Phi, la fonction) ;
   - P20 : « > kant.imperatif() » se tape juste AVANT la voix (0,45 s), pour
     que la maxime s'écrive au terminal en même temps que la boîte ;
   - P23, P30 : les doigts croisés et les mains ouvertes de POSES_EP sont
     repeints en craie (la lettre G de l'atlas) : en lumière (L) sur un sujet
     gris, ils ne se lisaient pas ;
   - P24 : les « x » des doigts croisés et les mains tendues restent jusqu'au
     rembobinage de P25 (« les mains restent tendues, vides ») ;
   - P25 : pendant la poussée sur l'emprunteur, le terminal et la vignette de
     Kant s'effacent (la foule agrandie passerait dessous) et l'œil monte un
     peu, en (650, 132, 140) ;
   - P26–P27 : « vous » est cerclé sur « Si vous prenez la bleue », mais ne
     saute (et ne prend sa couleur) que sur le mot « bleue », puis « rouge » ;
   - P29–P30 : la poussée est à ×5/3 (et non ×1,8), pour que les bonshommes
     restent à case entière (cs 3 → cs 5) ; le sujet rouge suivi est DEMO[49]
     (le « vous » de P26–P27), le bleu suivi DEMO[50] (son voisin : bleu
     dans b62, c'est lui qu'on retrouve cerclé en P31) ;
   - P31 : les bleus de l'anneau sont dessinés à cs 3 (à cs 4, les 62 places
     d'un cercle de 270 px se touchent), leurs flèches par flechesAnneau sur
     le cercle agrandi à ×1,13, juste au-dehors d'eux (avec ses réglages par
     défaut, une corde de 27 px n'a plus de flèche : il ne reste que la
     pointe, posée sur le sujet suivant). Le lot variantes doit reprendre les
     mêmes : plans/kant-anneau.js les dessine (anneauKant). « EN DANGER » se
     trace sur « exactement » ; « SAUVÉS » tombe et s'y pose exactement sur
     « en danger » (la voix dit « sauvé », « exactement », puis « en
     danger ») ; les deux contours s'effacent quand « SAUVÉS = EN DANGER »
     est écrit au centre (l'image de raccord n'a pas de contour).

   Raccords :
   - entrée (171,6 s) : coupe franche depuis la foule du test ;
   - sortie (381,6 s) : anneauKant(ctx, T, { t0: RACCORD.t0 }) de
     plans/kant-anneau.js (l'anneau qui tourne depuis « circulaire », une
     place toutes les 0,5 s : pasAnneau(T, RACCORD.t0) ; ses flèches ;
     « SAUVÉS = EN DANGER » au centre ; les rouges assombris aux bords), le
     fond fond(ctx, T, { sol: .4, centre: [960, 470] }), l'œil en (1 700, 150,
     120), humeur doute. Le lot variantes reprend cette image, sans coupe.

   Essais : index.html?plan=kant (le lot en boucle), ?plan=P26, ?t=287.2 ;
   dans la console, (await import('./plans/kant.js')).ESSAI : le minutage
   (S), ce que regarde Phi à un instant, et l'état de la grille.
   ========================================================================== */
import {
  W, CRAIE, GRIS, GRIS_FIG, LABO, LAITON, BLEU, BLEU_TXT, ROUGE, ROUGE_TXT, FILET, MONO, PIX, SH, SW, calque,
  clamp, lerp, seg, cloche, eIO, eOut, eBack, hache, balise, espace, texteSignes, largeurSignes, coupe,
  fond, fenetre, jauge, pilule, POSES, humeur, flotte, cligne, oeil, creeRegard, VOUS, point, cadre, IDENTITE, camera, toile,
  dessineSujet, halo, DEMO, LOTS,
  filet, tirets, etiquette, terminal, vague, ANNEAU, ORDRE_ANNEAU, RANG_ANNEAU, ROUGES_ANNEAU, anneau, pasAnneau,
  placeRouge, portrait, POSES_EP, bulle,
} from '../commun.js';
import { REPLIQUE, quandMot, finParole, lettres, texteDe, plume as plumeBoite } from '../texte.js';
import {
  piece, miniBulle, croixHanche, envolMots, casesConfig, CASE, ondes, cercleTirets, puce, tapes, cercle, vignetteKant, VIGNETTE,
} from './kant-outils.js';
import { ANNEAU_KANT, anneauKant, flechesKant } from './kant-anneau.js';

export const LOT = Object.freeze({ id: 'kant', de: 171.6, a: 381.6 });

// ================================================================ les mots dits : les gestes tombent dessus
const mot = (id, m, n = 0) => quandMot(id, m, REPLIQUE[id].de, n);
const de = id => REPLIQUE[id].de;
// les lignes d'une réplique telles que la boîte les écrit (sans balises)
const lignesDe = id => balise(REPLIQUE[id].txt).map(l => l.map(s => s.s).join(''));
// combien de caractères de la ligne j de la réplique id la voix a dits à l'instant T (lettres() compte la coupure de
// la boîte comme l'espace qu'elle remplace) : pour taper ailleurs au rythme de la voix
function nLigne(id, j) {
  const L = lignesDe(id); let off = 0;
  for (let i = 0; i < j; i++) off += [...L[i]].length + 1;
  const n = [...L[j]].length;
  return T => clamp(lettres(id, T) - off, 0, n);
}
// la même chose pour un morceau de la réplique (à partir de son caractère i0) : la maxime de K10, dans sa fenêtre
const nDepuis = (id, i0, n) => T => clamp(lettres(id, T) - i0, 0, n);

// les bornes des plans (EPISODE.md, « Les plans ») : un plan est actif de de (inclus) à a (exclu)
const PB = Object.freeze({
  P19: [171.6, 180.2], P20: [180.2, 191.2], P21: [191.2, 217.4], P22: [217.4, 232.3], P23: [232.3, 240.5],
  P24: [240.5, 253.2], P25: [253.2, 274.7], P26: [274.7, 299.7], P27: [299.7, 316.4], P28: [316.4, 323.2],
  P29: [323.2, 337.9], P30: [337.9, 354.9], P31: [354.9, 381.6],
});

// ================================================================ le minutage du lot (EPISODE.md, P19–P31)
const S = (() => {
  const s = {};
  // P19 · Kant
  s.ouvre = PB.P19[0] + .2;                                  // les deux fenêtres s'ouvrent (0,4 s)
  s.ouvrir = mot('K01', 'morale');                           // « > ouvrir kant »
  s.calcul = mot('K01', 'philosophe');                       // le portrait se calcule, rangée par rangée…
  s.kant = mot('K01', 'Kant.');                              // … jusqu'à « Kant. »
  s.leve = finParole('K01');                                 // le silence : Kant lève les yeux vers Phi
  // P20 · l'impératif
  s.imp = de('K02') - .45;                                   // « > kant.imperatif() » (0,4 s), juste avant la voix
  s.hoche = mot('K02', 'loi universelle');                   // Kant hoche la tête
  // P21 · les humains écrivent si mal
  s.principe = mot('K03', 'principe fondamental');           // « PRINCIPE FONDAMENTAL DE LA MORALE »
  s.siMal = mot('K04', 'écrivent si mal');                   // la ligne LABO parcourt la maxime ; Kant penaud
  s.mal = mot('K04', 'si mal');
  s.reform = mot('K04', 'reformuler');
  s.phi = de('K05');                                         // Phi tape sa version, au rythme de la voix
  s.algo = mot('K06', 'algorithme');                         // « > universaliser(règle) → ✓ ou ✗ »
  s.somme = mot('K06', 'en somme');
  // P22 · la fausse promesse
  s.p22 = PB.P22[0];                                         // les deux sujets entrent (0,8 s)
  s.exemple = mot('K07', 'exemple');
  s.besoin = mot('K08', 'besoin d\'argent');                 // la bulle de pensée et la pièce en pointillés
  s.rendre = mot('K08', 'pas le rendre');                    // un petit ✗ sur la pièce
  s.emprunter = mot('K09', 'emprunter');                     // il tend la main
  s.promettant = mot('K09', 'en promettant');                // « Je te rembourse demain. »
  s.rembourser = mot('K09', 'rembourser');                   // la pièce passe en arc (0,6 s)
  s.ting = s.rembourser + .6;
  // P23 · les doigts croisés (le contrechamp)
  s.p23 = PB.P23[0];
  s.regle = mot('K10', 'La règle');                          // la fenêtre MAXIME s'ouvre
  s.quand = mot('K10', 'Quand j\'ai besoin');                // la maxime s'y écrit
  s.fausse = mot('K10', 'fausse promesse');                  // recul ×6 → ×3
  // P24 · si tout le monde
  s.p24 = PB.P24[0]; s.recul = s.p24 + 1.4;                  // recul ×3 → ×1 : les deux rejoignent la grille
  s.tous = mot('K11', 'tout le monde');                      // « > universaliser(maxime) » ; la vague
  s.plusPers = mot('K12', 'Plus personne');                  // les bulles partent en caractères
  s.rien = mot('K12', 'plus rien');                          // l'emprunteur cerclé ; « → ✗ »
  // P25 · ne marche que si les autres ne la suivent pas
  s.rembob = mot('K13', 'Vous ne pouvez pas');               // les caractères redescendent (0,9 s)
  s.eteint = s.rembob + 1.2;                                 // tout s'éteint, sauf chez lui
  s.suivent = mot('K13', 'ne la suivent pas');               // son voisin lui tend la pièce
  s.pourKant = mot('K14', 'Pour Kant');                      // la poussée, lente, toute la phrase
  s.pousseFin = Math.max(s.pourKant + 4, finParole('K14'));
  s.agissent = mot('K14', 'n\'agissent pas');                // les 99 s'éclairent derrière lui
  s.commeVous = mot('K14', 'comme vous');
  // P26 · appliquons ce test aux pilules
  s.p26 = PB.P26[0];
  s.pilules = mot('K15', 'aux pilules');                     // « > universaliser(bleue) »
  s.vous = mot('K16', 'Si vous prenez la bleue');            // « vous » : cerclé
  s.bleue = mot('K16', 'bleue');                             // il saute, bleu (la couleur tombe avec son mot)
  s.vague1 = mot('K16', 'tout le monde prenne');             // la vague, en bleu
  s.survie = mot('K16', 'votre survie');                     // la vie
  s.univ = mot('K17', 'plus universalisable');               // « → ✓ »
  s.kantQ = mot('K18', 'Kant a-t-il');                       // un « ? » sur la vignette de Kant
  // P27 · et la rouge
  s.p27 = PB.P27[0];                                         // les couleurs s'éteignent ; « > universaliser(rouge) »
  s.rouge = mot('K19', 'rouge');                             // le même saute, rouge (sur son mot)
  s.vague2 = mot('K19', 'tout le monde prenne');
  s.meurt = mot('K20', 'personne ne meurt');                 // la vie, ici aussi
  s.passent = mot('K21', 'passent le test');                 // « → ✓ »
  // P28 · deux foules (2,4 s de silence avant la voix)
  s.p28 = PB.P28[0];
  s.cent = s.p28 + .8; s.survivants = s.p28 + 1.4;
  s.diff = mot('K22', 'une différence');                     // les bras retombent
  // P29 · une différence
  s.p29 = PB.P29[0]; s.pousse29 = s.p29 + 1.2;
  s.egoistes = mot('K23', 'purement égoïstes');              // cerclé ; les autres changent de pilule en boucle
  s.boucleR = s.egoistes + .5;
  s.airEgo = mot('K24', 'a l\'air égoïste');                 // il ne regarde personne
  s.memeSi = mot('K24', 'même si elle passe le test');
  // P30 · un signal
  s.p30 = PB.P30[0]; s.glisse = s.p30 + 1.0;
  s.contraire = mot('K25', 'au contraire');
  s.voulant = mot('K25', 'en voulant');                      // il regarde les autres, un par un
  s.c0 = s.contraire + .15;
  s.slot = Math.max(.45, (s.voulant - 1.15 - s.c0) / 3);     // les quatre configurations, une seule fois
  s.recompose = s.voulant - .8;                              // il se recompose (0,8 s) : on ne laisse pas la mort s'installer
  s.signal = mot('K26', 'envoyer un signal');                // les anneaux
  s.coopere = mot('K26', 'Je coopère');                      // la bulle
  s.pourCa = mot('K26', 'pour ça');
  s.dos = Math.min(PB.P30[1] - .5, finParole('K26') + .02);  // la rime : son dos, les mains ouvertes
  // P31 · pour sauver qui
  s.p31 = PB.P31[0];
  s.qui = mot('K27', 'qui ?');
  s.ceux = mot('K28', 'Ceux qui prennent la bleue');         // les bleus forment l'anneau
  s.fleches = mot('K29', 'pour sauver ceux');                // les flèches, l'une après l'autre (1,6 s)
  s.ferme = s.fleches + 1.6;
  s.exact = mot('K30', 'exactement');                        // « EN DANGER » se trace
  s.danger = mot('K30', 'en danger');                        // « SAUVÉS » tombe exactement dessus
  s.plusUn = mot('K31', 'pas un de plus');                   // « SAUVÉS = EN DANGER »
  s.circ = mot('K32', 'circulaire');                         // l'anneau tourne
  return Object.freeze(s);
})();

// ================================================================ les personnages
const EMP = DEMO[49], PRE = DEMO[50];              // l'emprunteur et le prêteur, voisins dans la grille (P22–P25)
const VOUS_G = DEMO[49];                           // « vous » (P26–P27), le rouge suivi (P29)
const BLEU_SUIVI = DEMO[50];                       // le bleu suivi (P30), cerclé en P31 (bleu dans b62)
const CENTRE_G = Object.freeze({ x: 650, y: 484 }); // le centre de la grille d'index.html
const colonne = f => f.i % 20;
const sensVers = f => (colonne(f) <= 9 ? 1 : -1);   // dans la vague, chacun tend la main vers le milieu
// où tombe la main tendue (POSES_EP.tend : la case de lumière en colonne 10, rangée 8) d'un sujet en (x, y), cases cs
const main = (x, y, cs, sens) => ({ x: x + sens * 5 * cs, y: y + 2.5 * cs });
const visage = (x, y, cs) => ({ x, y: y - 3 * cs });

// ================================================================ l'œil de Phi : sa place, son humeur
// ses places, plan par plan (EPISODE.md) : (1 180, 280, 200) à côté du portrait ; (1 560, 180, 150) près de la scène de
// la promesse ; (650, 160, 160) au-dessus de la grille (index.html) ; (960, 90, 90) au sommet du filet ; (1 700, 150,
// 120) au-dessus de l'anneau
function placeOeil(T) {
  if (T < PB.P22[0]) return { x: 1180, y: 280, s: 200 };
  if (T < PB.P24[0]) return { x: 1560, y: 180, s: 150 };
  if (T < PB.P26[0]) {
    if (T < S.pourKant) return { x: 650, y: 160, s: 160 };
    const k = eIO(seg(T, S.pourKant, S.pourKant + 1.4));
    return { x: 650, y: lerp(160, 132, k), s: lerp(160, 140, k) };
  }
  if (T < PB.P28[0]) return { x: 650, y: 160, s: 160 };
  if (T < PB.P31[0]) return { x: 960, y: 90, s: 90 };
  return { x: 1700, y: 150, s: 120 };
}
const HUMEURS_LOT = Object.freeze([
  [S.kant, 'grand', .3], [S.kant + 1.0, 'neutre'],
  [S.siMal, 'plisse', .3], [S.reform, 'neutre'], [S.somme, 'curieux', .4], [S.somme + 1.2, 'neutre'],
  [S.p22, 'neutre'], [S.rien, 'doute'], [S.rembob, 'neutre'], [S.agissent, 'grand', .4], [S.agissent + 1.4, 'neutre'],
  [S.survie, 'grand', .3], [S.univ, 'neutre'], [S.kantQ, 'curieux', .4],
  [S.p27, 'neutre'], [S.meurt, 'grand', .3], [S.passent, 'doute', .5],
  [S.p28, 'neutre'], [S.diff, 'curieux', .4], [S.p29, 'neutre'],
  [S.signal, { glow: .7 }, .4], [S.dos, 'neutre'],
  [S.qui, 'curieux', .4], [S.ceux, 'neutre'], [S.circ, 'doute', .5],
]);

// ================================================================ P19–P21 · le cabinet de Kant
// (EPISODE.md place la fenêtre en x 140–560, y 60–540 et le terminal en y 590–820 : le cartouche du socle, en (48, 40),
// couvrirait le haut de la fenêtre ; elle descend sous lui, le terminal descend jusqu'à y 830, et ses six rangées tiennent)
const FK = Object.freeze({ x: 140, y: 148, w: 420, h: 410 });                        // la fenêtre KANT
// son portrait (330 × 360 px : à cs 32, ses pieds descendaient jusqu'en y 545, sous l'étiquette « KANT » posée en
// y 538 ; à cs 30, ils s'arrêtent en 533, et il respire dans sa fenêtre comme Nietzsche dans la sienne)
const PK = Object.freeze({ x: 350, y: 353, cs: 30 });
const TK = Object.freeze({ x: 140, y: 606, w: 1640, h: 224, taille: 26, lh: 32, marge: 18 });   // le terminal
const K02 = lignesDe('K02'), K05 = lignesDe('K05');
const L_OUVRIR = { t0: S.ouvrir, txt: '> ouvrir kant', col: CRAIE, cps: 24 };
const L_IMP = { t0: S.imp, txt: '> kant.imperatif()', col: CRAIE, cps: 45 };
const L_TITRE = { t0: S.imp + .4, txt: '', col: LAITON };       // la ligne où s'écrira « PRINCIPE FONDAMENTAL… »
const L_M1 = { txt: K02[0], col: CRAIE, n: nLigne('K02', 0) };
const L_M2 = { txt: K02[1], col: CRAIE, n: nLigne('K02', 1) };
const L_P1 = { txt: K05[0], col: LABO, n: nLigne('K05', 0) };
const L_P2 = { txt: K05[1], col: LABO, n: nLigne('K05', 1) };
const L_REGLE = { t0: S.algo, txt: '> universaliser(règle) → ✓ ou ✗', col: LABO, cps: 24 };
const LIGNES_K = Object.freeze([L_OUVRIR, L_IMP, L_TITRE, L_M1, L_M2, L_P1, L_P2, L_REGLE]);
const TITRE_PRINCIPE = 'PRINCIPE FONDAMENTAL DE LA MORALE';
// la poussée très lente de P21 (×1 → ×1,025 sur le terminal), linéaire. Au montage : à ×1,04 autour de (960, 718),
// le haut de la fenêtre KANT passait sous le cartouche (16 px) ; entre le cartouche (y 133) et la boîte (y 853), la
// fenêtre et le terminal (y 140–838 avec leurs filets) ne tiennent que jusqu'à ×1,028 : ×1,025, le terminal glissé
// de 10 px vers le bas (la fenêtre finit en y 136, le terminal en 851)
const CAM_P21 = Object.freeze([[PB.P21[0], 960, 718, 960, 718, 1], [PB.P21[1], 960, 718, 960, 728, 1.025]]);
const camCabinet = T => (T >= PB.P21[0] ? camera(T, CAM_P21, k => k) : IDENTITE);
// le portrait : les rangées calculées (une à une, comme une imprimante matricielle), et la tête d'impression
const rangeesKant = T => (T < S.calcul ? 0 : T >= S.kant ? SH : Math.floor(SH * seg(T, S.calcul, S.kant)));
const teteImpression = T => {        // où en est le calcul de la rangée en cours : { x, y } dans le monde, ou null
  if (T < S.calcul || T >= S.kant) return null;
  const u = SH * seg(T, S.calcul, S.kant), r = Math.floor(u), k = u - r, haut = PK.y - SH * PK.cs / 2;
  return { x: PK.x - SW * PK.cs / 2 + k * SW * PK.cs, y: haut + (r + .5) * PK.cs };
};
// le terminal du cabinet, mis en page comme terminal() de commun.js le dessine (les mêmes coupes, le même défilement),
// sans rien dessiner : où sont ses rangées, et où s'écrit la plume, à l'instant T (dans le monde du cabinet). Une
// fonction pure du temps : le regard de Phi l'appelle à d'autres instants que celui de l'image.
let MESUREUR = null;
function rangsK(T) {
  const o = TK, g = MESUREUR || (MESUREUR = toile(8, 8).getContext('2d')), haut = o.y + o.marge, rangs = [];
  g.font = `${o.taille}px ${MONO}`;
  for (const L of LIGNES_K) {
    const chars = [...(L.txt ?? '')];
    const n = L.n ? clamp(Math.floor(L.n(T)), 0, chars.length) : (T < L.t0 ? -1 : clamp(Math.floor((T - L.t0) * (L.cps ?? 24)), 0, chars.length));
    if (n < 0 || (L.n && n === 0 && !(T >= (L.t0 ?? Infinity)))) continue;
    const morceaux = chars.length ? coupe(g, L.txt, o.w - 2 * o.marge) : [''];
    let i0 = 0;
    for (const m of morceaux) { const lm = [...m].length; rangs.push({ txt: m, n: clamp(n - i0, 0, lm), ligne: L, fini: n >= chars.length }); i0 += lm + 1; }
  }
  const place = Math.max(1, Math.floor((o.y + o.h - haut - o.marge * .5) / o.lh)), vus = rangs.slice(Math.max(0, rangs.length - place));
  vus.forEach((r, j) => { r.x = o.x + o.marge; r.y = haut + o.taille + j * o.lh; r.w = largeurSignes(g, [...r.txt].slice(0, r.n).join('')); });
  return vus;
}
// la plume du terminal du cabinet, à l'écran (sous la caméra de P21), ou null : le bout de la rangée qui s'écrit
function plumeK(T) {
  if (T < S.ouvrir || T >= PB.P22[0]) return null;
  const r = rangsK(T).find(r => !r.fini && r.n < [...r.txt].length);
  return r ? camCabinet(T).ecran(r.x + r.w, r.y - TK.taille * .35) : null;
}
// le milieu d'une rangée (à l'écran), ou null si elle n'est pas visible
function rangK(T, L) { const r = rangsK(T).find(r => r.ligne === L); return r ? camCabinet(T).ecran(r.x + Math.max(60, r.w / 2), r.y - TK.taille * .35) : null; }
function etatKant(T, O, cam) {
  const phiW = cam.monde(O.x, O.yv), e = { phi: phiW, cible: phiW, reflet: false, fixe: false, mode: 'repos', bob: 0 };
  if (T >= S.leve && T < S.imp + .3) { e.fixe = true; e.reflet = O.ouvert; }                  // face à face
  if (T >= S.imp + .3 && T < finParole('K02') + .2) {                                       // il regarde sa maxime s'écrire
    const p = plumeK(T); if (p) { e.mode = 'prive'; e.cible = cam.monde(p.x, p.y); }
  }
  if (T >= S.hoche && T < S.hoche + .4) e.bob = 1;                                           // il hoche la tête
  if (T >= S.principe && T < S.siMal) { e.fixe = true; e.reflet = O.ouvert; }
  if (T >= S.siMal + .1 && T < S.reform + .8) e.mode = 'penaud';                             // il baisse les yeux
  if (T >= S.phi && T < finParole('K05') + .4) {                                            // il regarde Phi le récrire
    const p = plumeK(T); if (p) { e.mode = 'prive'; e.cible = cam.monde(p.x, p.y); }
  }
  return e;
}
function cabinet(ctx, T) {
  const cam = camCabinet(T), O = etatOeil(T);
  fond(ctx, T, { sol: .35 });
  const ko = eOut(seg(T, S.ouvre, S.ouvre + .4));
  ctx.save(); cam.applique(ctx);
  // la fenêtre KANT (elle s'ouvre depuis sa ligne du milieu)
  if (ko > 0) {
    const hh = FK.h * ko;
    fenetre(ctx, FK.x, FK.y + (FK.h - hh) / 2, FK.w, hh, ko);
    ctx.globalAlpha = 1;
  }
  if (ko >= 1) {
    // la grille des cases à calculer (11 × 12, des points LABO), qui s'efface quand le portrait est là
    const ag = .22 * (1 - seg(T, S.kant, S.kant + .8));
    if (ag > .001) {
      const x0 = PK.x - SW * PK.cs / 2, y0 = PK.y - SH * PK.cs / 2;
      ctx.globalAlpha = ag; ctx.fillStyle = LABO;
      for (let j = 0; j <= SH; j++) for (let i = 0; i <= SW; i++) ctx.fillRect(x0 + i * PK.cs - 1, y0 + j * PK.cs - 1, 2, 2);
      ctx.globalAlpha = 1;
    }
    const e = etatKant(T, O, cam);
    portrait(ctx, T, 'kant', PK.x, PK.y, PK.cs, { rangees: rangeesKant(T), balayage: true, ...e });
    const tp = teteImpression(T);
    if (tp) { ctx.globalAlpha = .9; ctx.fillStyle = LABO; ctx.fillRect(Math.round(tp.x) - 4, Math.round(tp.y) - 4, 8, 8); ctx.globalAlpha = 1; }
    etiquette(ctx, 'KANT', PK.x, FK.y + FK.h - 20, seg(T, S.kant - .1, S.kant + .25));
  }
  // le terminal
  const R = terminal(ctx, T, LIGNES_K, { ...TK, a: ko });
  // « PRINCIPE FONDAMENTAL DE LA MORALE », dans la ligne laissée vide au-dessus de la maxime
  const rt = R.rangs.find(r => r.ligne === L_TITRE);
  if (rt && T >= S.principe) {
    const n = tapes(T, S.principe, 40, TITRE_PRINCIPE.length);
    ctx.font = `500 16px ${MONO}`; ctx.fillStyle = LAITON; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1;
    espace(ctx, TITRE_PRINCIPE.slice(0, n), rt.x, rt.y - 4, 3);
  }
  // l'analyse : une ligne LABO parcourt la maxime (sur « écrivent si mal »), sans rien rayer
  const m1 = R.rangs.find(r => r.ligne === L_M1), m2 = R.rangs.find(r => r.ligne === L_M2);
  const ka = seg(T, S.siMal, S.siMal + 1.5), fa = 1 - seg(T, S.siMal + 1.5, S.siMal + 2.3);
  if (m1 && m2 && ka > 0 && fa > 0) {
    ctx.font = `${TK.taille}px ${MONO}`;
    const wMax = Math.max(ctx.measureText(K02[0]).width, ctx.measureText(K02[1]).width), xb = m1.x + wMax * eIO(ka);
    const y0 = m1.y - TK.taille, y1 = m2.y + 8;
    ctx.globalAlpha = .15 * fa; ctx.fillStyle = LABO; ctx.fillRect(m1.x - 4, y0, xb - m1.x + 4, y1 - y0);
    ctx.globalAlpha = .95 * fa; ctx.fillRect(Math.round(xb) - 1, y0 - 4, 3, y1 - y0 + 8);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  dessineOeil(ctx, T, O);
}
// les points que Phi regarde, dans le cabinet (à l'écran)
const ecranK = (x, y, T) => camCabinet(T).ecran(x, y);
const yeuxKant = T => ecranK(PK.x, PK.y - SH * PK.cs / 2 + 3.5 * PK.cs, T);
const scanKant = T => { const p = teteImpression(T); return p ? ecranK(p.x, p.y, T) : null; };
const maximeK = T => rangK(T, L_M1);

// ================================================================ P22–P23 · la fausse promesse, champ et contrechamp
const E22 = Object.freeze({ x: 780, y: 520 }), R22 = Object.freeze({ x: 1140, y: 520 }), CS22 = 12;
const VK_HAUT = Object.freeze({ x: 1680, y: 110 });          // la vignette de Kant, à côté de l'œil
const VK_COIN = Object.freeze({ x: 1720, y: 286 });          // au coin du terminal (P24–P27)
const MAIN_E = main(E22.x, E22.y, CS22, 1), MAIN_R = main(R22.x, R22.y, CS22, -1);
const PENSEE = Object.freeze({ x: 682, y: 226, w: 170, h: 120 }), PIECE_PENSEE = Object.freeze({ x: 767, y: 286 });
const PAROLE = Object.freeze({ x: 560, y: 326, w: 420, h: 72 });
// la pièce : dans la main du prêteur, puis l'arc (0,6 s), puis dans la main de l'emprunteur. Rend { x, y, larg, sol }.
function pieceVol(T, de0, a0, t0, h = 90) {
  if (T < t0 - .25) return null;
  const u = seg(T, t0, t0 + .6), x = lerp(de0.x, a0.x, u), y = lerp(de0.y, a0.y, u) - 2 - h * Math.sin(Math.PI * u);
  return { x, y, larg: 1 + 4 * Math.abs(Math.cos(2 * Math.PI * u)), u };
}
function promesse(ctx, T) {
  const O = etatOeil(T);
  fond(ctx, T, { sol: .8 });
  const ke = eOut(seg(T, S.p22, S.p22 + .8));
  const xe = lerp(E22.x - 90, E22.x, ke), xr = lerp(R22.x + 90, R22.x, ke);
  const phi = { x: O.x, y: O.yv };
  // l'emprunteur : il regarde le prêteur ; la main tendue sur « emprunter »
  const eE = { col: GRIS_FIG, a: ke, mode: 'prive', cible: visage(xr, R22.y, CS22), phi, reflet: false };
  if (T >= S.emprunter) Object.assign(eE, POSES_EP.tend(1));
  dessineSujet(ctx, EMP, xe, E22.y, CS22, eE, T);
  // le prêteur : il le regarde ; il tend la pièce sur « rembourser »
  const eR = { col: GRIS_FIG, a: ke, mode: 'prive', cible: visage(xe, E22.y, CS22), phi, reflet: false };
  if (T >= S.rembourser - .25 && T < S.ting + .6) Object.assign(eR, POSES_EP.tend(-1));
  dessineSujet(ctx, PRE, xr, R22.y, CS22, eR, T);
  // la bulle de pensée : une pièce en pointillés (il n'en a pas) ; sur « pas le rendre », un petit ✗
  const ap = 1 - seg(T, S.promettant - .1, S.promettant + .2);
  if (T >= S.besoin && ap > 0) {
    bulle(ctx, PENSEE.x, PENSEE.y, PENSEE.w, PENSEE.h, { type: 'pensee', queue: { x: E22.x - 8, y: E22.y - 6 * CS22 - 4 }, k: seg(T, S.besoin, S.besoin + .35), a: ap });
    if (T >= S.besoin + .3) {
      piece(ctx, PIECE_PENSEE.x, PIECE_PENSEE.y, 10, { contour: true, a: ap * seg(T, S.besoin + .3, S.besoin + .5) });
      if (T >= S.rendre) {
        const k = eBack(seg(T, S.rendre, S.rendre + .3));
        ctx.globalAlpha = ap * clamp(k); ctx.fillStyle = GRIS; ctx.font = `${Math.max(1, Math.round(34 * k))}px ${PIX}`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; texteSignes(ctx, '✗', PIECE_PENSEE.x, PIECE_PENSEE.y);
        ctx.globalAlpha = 1;
      }
    }
  }
  // la bulle de parole
  if (T >= S.promettant) bulle(ctx, PAROLE.x, PAROLE.y, PAROLE.w, PAROLE.h, { type: 'parole', queue: { x: E22.x + 20, y: E22.y - 6 * CS22 - 6 }, txt: 'Je te rembourse demain.', taille: 26, k: seg(T, S.promettant, S.promettant + .3) });
  // la pièce, de sa main à la sienne
  const p = pieceVol(T, MAIN_R, MAIN_E, S.rembourser);
  if (p) piece(ctx, p.x, p.y, 5, { larg: p.larg, ombre: E22.y + 6 * CS22 + 2 });
  vignetteKant(ctx, T, VK_HAUT.x, VK_HAUT.y, { phi, cible: phi, fixe: dansK(T, S.exemple, S.besoin), reflet: O.ouvert });
  dessineOeil(ctx, T, O);
}
const dansK = (T, a, b) => T >= a && T < b;
// P23 : le contrechamp. On est derrière l'emprunteur (son dos, ×6, cs 24), le prêteur en face (×3, α 0,5) ; sur
// « fausse promesse », recul ×6 → ×3
const MAXIME = Object.freeze({ x: 560, y: 50, w: 800, h: 140 });
// les doigts croisés de POSES_EP.dos (le « x » de cinq cases de lumière, là où les mains se rejoignent), repeints en
// craie (la lettre G de l'atlas : la goutte de sueur, en craie) : « un x dans le dos, net »
const DOIGTS_NETS = Object.freeze(calque(7, ['....G.G....', '.....G.....', '....G.G....']));
// et la rime (P30) : les mains ouvertes de POSES_EP.dosMains, à la même place, en craie elles aussi
const MAINS_NETTES = Object.freeze(calque(8, ['....G.G....']));
const TXT_K10 = texteDe('K10'), I_MAX = [...TXT_K10].indexOf('«'), MAXIME_TXT = [...TXT_K10].slice(I_MAX).join('');
const N_MAX = nDepuis('K10', I_MAX, [...MAXIME_TXT].length);
function contrechamp(T) {
  const k = eIO(seg(T, S.fausse, S.fausse + 1.0)), z = lerp(6, 3, k);
  const e = { x: lerp(960, 900, k), y: lerp(450, 486, k) };
  return { z, e, r: { x: e.x + 55 * z, y: e.y - 5 * z } };
}
function doigts(ctx, T) {
  const O = etatOeil(T), C = contrechamp(T), phi = { x: O.x, y: O.yv };
  fond(ctx, T, { sol: .8, centre: [1100, 430] });
  // le prêteur, au fond, qui le regarde
  dessineSujet(ctx, PRE, C.r.x, C.r.y, 2 * C.z, { col: GRIS_FIG, a: .5, mode: 'prive', cible: C.e, phi, reflet: false }, T);
  // l'emprunteur, de dos : ni yeux ni bouche, les doigts croisés au creux des reins
  const D = POSES_EP.dos();
  dessineSujet(ctx, EMP, C.e.x, C.e.y, 4 * C.z, { col: GRIS_FIG, ...D, extra: [...D.extra, DOIGTS_NETS], extraCle: 'dosK' }, T);
  // la fenêtre MAXIME
  const am = eOut(seg(T, S.regle, S.regle + .3));
  if (am > 0) {
    fenetre(ctx, MAXIME.x, MAXIME.y, MAXIME.w, MAXIME.h, am);
    ctx.globalAlpha = am; ctx.font = `24px ${PIX}`; ctx.fillStyle = LABO; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('MAXIME', MAXIME.x + 24, MAXIME.y + 36);
    ctx.fillStyle = FILET; ctx.fillRect(MAXIME.x + 24, MAXIME.y + 48, MAXIME.w - 48, 2);
    const n = N_MAX(T);
    if (n > 0) {
      ctx.font = `26px ${PIX}`; ctx.fillStyle = CRAIE;
      let reste = n;
      coupe(ctx, MAXIME_TXT, MAXIME.w - 48).forEach((l, i) => {
        const v = [...l].slice(0, reste).join(''); reste -= [...l].length + 1;
        if (v) ctx.fillText(v, MAXIME.x + 24, MAXIME.y + 88 + i * 34);
      });
    }
    ctx.globalAlpha = 1;
  }
  vignetteKant(ctx, T, VK_HAUT.x, VK_HAUT.y, { phi, cible: phi });
  dessineOeil(ctx, T, O);
}
const plumeMaxime = T => {
  const n = N_MAX(T); if (n <= 0 || n >= [...MAXIME_TXT].length) return null;
  const u = n / [...MAXIME_TXT].length;
  return point(MAXIME.x + 24 + 740 * ((u * 2) % 1), MAXIME.y + 80 + (u < .5 ? 0 : 34));
};
const doigtsCroises = T => { const C = contrechamp(T); return point(C.e.x, C.e.y + 2.5 * 4 * C.z); };

// ================================================================ P24–P27 · la grille des cent sujets de démonstration
// La foule d'index.html (FOULE : 20 × 5, x 175–1 125, y 360–608), à ×1 (cs 4), grise ; le terminal, réduit, à la place
// de RÈGLES (x 1 290–1 860, y 40–260), la vignette de Kant à son coin, l'œil en (650, 160, 160).
const TR = Object.freeze({ x: 1290, y: 40, w: 570, h: 220, taille: 20, lh: 30, marge: 20 });
const L_DEF = { t0: -Infinity, txt: '> universaliser(règle) → ✓ ou ✗', col: LABO };
const L_MAXIME = { t0: S.tous, txt: '> universaliser(maxime)', col: LABO, cps: 24, verdict: { t: S.rien, signe: '✗', col: CRAIE } };
const L_BLEUE = { t0: S.pilules, txt: '> universaliser(bleue)', col: LABO, cps: 24, verdict: { t: S.univ, signe: '✓', col: LABO } };
const L_ROUGE = { t0: S.p27 + .15, txt: '> universaliser(rouge)', col: LABO, cps: 24, verdict: { t: S.passent, signe: '✓', col: LABO } };
const LIGNES_R = Object.freeze([L_DEF, L_MAXIME, L_BLEUE, L_ROUGE]);
// la caméra de la grille : le recul de P24 (×3 → ×1) et la poussée de P25 (×1 → ×2,5 sur l'emprunteur)
function camGrille(T) {
  if (T < S.recul) {
    const k = eIO(seg(T, S.p24, S.recul));
    return cadre(CENTRE_G.x, CENTRE_G.y, lerp(960, CENTRE_G.x, k), lerp(520, CENTRE_G.y, k), Math.exp(lerp(Math.log(3), 0, k)));
  }
  if (T >= S.pourKant && T < PB.P26[0]) {
    const k = eIO(seg(T, S.pourKant, S.pousseFin));
    return cadre(EMP.cx, EMP.cy, lerp(EMP.cx, 960, k), lerp(EMP.cy, 590, k), Math.exp(lerp(0, Math.log(2.5), k)));
  }
  return IDENTITE;
}
// l'alpha du terminal et de la vignette (ils s'ouvrent pendant le recul, s'effacent pendant la poussée)
const aTerminal = T => seg(T, S.p24 + .4, S.p24 + .9) * (T < PB.P26[0] ? 1 - seg(T, S.pourKant, S.pourKant + .6) : 1);
const placeVignette = T => { const k = eIO(seg(T, S.p24, S.recul)); return { x: lerp(VK_HAUT.x, VK_COIN.x, k), y: lerp(VK_HAUT.y, VK_COIN.y, k) }; };

// les instants de chaque sujet, une fois (ce sont des dates : rien ne se garde d'une image à l'autre)
const G = Object.freeze(DEMO.map(f => {
  const i = f.i, d = vague(f, 49, 0, 1);              // la distance de proche en proche à l'emprunteur (en anneaux)
  return Object.freeze({
    f, i, d, sens: sensVers(f),
    tv: vague(f, 49, S.tous, .09),                    // la promesse lui parvient : il tend la main, sa bulle, son « x »
    tb: vague(f, 49, S.plusPers, .05),                // sa bulle part en caractères
    tr: S.rembob + .03 * d,                           // les caractères redescendent (0,6 s)
    tl: vague(f, 49, S.agissent, .06),                // il s'éclaire derrière l'emprunteur (P25)
    tbleu: i === 49 ? S.bleue + .05 : vague(f, 49, S.vague1, .09) + .1,  // il saute, bleu (P26)
    tgris: S.p27 + f.r3 * .45,                        // fouleRemet (P27)
    trouge: i === 49 ? S.rouge + .05 : vague(f, 49, S.vague2, .09) + .1, // il saute, rouge (P27)
  });
}));
// sa couleur, et son saut en cours (l'instant du saut, ou null), dans la grille de P24–P27
function couleurG(g, T) {
  if (T < PB.P26[0]) return { col: GRIS_FIG, t0: null };
  if (T < PB.P27[0]) return T >= g.tbleu ? { col: BLEU, t0: T < g.tbleu + .45 ? g.tbleu : null } : { col: GRIS_FIG, t0: T >= g.tbleu - .2 ? g.tbleu : null };
  if (T < g.tgris) return { col: BLEU, t0: null };
  if (T < g.trouge) return { col: GRIS_FIG, t0: T >= g.trouge - .2 ? g.trouge : null };
  return { col: ROUGE, t0: T < g.trouge + .45 ? g.trouge : null };
}
// la promesse (P24–P25) : la main, la mini-bulle (son ouverture, son envol, son rembobinage), le « x »
function promesseG(g, T) {
  const out = { tend: false, bulle: 0, envol: 0, x: 0 };
  if (T < g.tv || T >= PB.P26[0]) return out;
  const lui = g.i === 49, eteint = lui ? Infinity : S.eteint;
  out.tend = T < eteint;
  out.x = seg(T, g.tv, g.tv + .15) * (1 - seg(T, eteint, eteint + .25));
  if (T < g.tb) out.bulle = seg(T, g.tv, g.tv + .15);
  else if (T < g.tr) out.envol = seg(T, g.tb, g.tb + 1.2);
  else if (T < g.tr + .6) out.envol = 1 - seg(T, g.tr, g.tr + .6);
  else out.bulle = lui ? 1 - seg(T, S.eteint, S.eteint + .2) : 1 - seg(T, eteint, eteint + .2);
  if (out.envol <= 0 && T >= g.tr && T < g.tr + .6) out.bulle = 1;
  return out;
}
const enVie = T => (T >= S.survie && T < PB.P27[0] ? seg(T, S.survie, S.survie + .4) * (1 - seg(T, PB.P27[0] - .1, PB.P27[0] + .3)) : 0)
  || (T >= S.meurt && T < PB.P28[0] ? seg(T, S.meurt, S.meurt + .4) : 0);
const ecranG = (x, y, T) => camGrille(T).ecran(x, y);
// la place et la taille d'un sujet de la grille à l'instant T (à l'écran) : l'emprunteur et le prêteur glissent de la
// scène de P22 à leur place pendant le recul ; les autres sont sous la caméra
function placeG(g, T) {
  const cam = camGrille(T), p = cam.ecran(g.f.cx, g.f.cy), cs = 4 * cam.z;
  if (T < S.recul && (g.i === 49 || g.i === 50)) {
    const k = eIO(seg(T, S.p24, S.recul)), d0 = g.i === 49 ? E22 : R22;
    return { x: lerp(d0.x, p.x, k), y: lerp(d0.y, p.y, k), cs: lerp(CS22, 4, k), a: 1 };
  }
  return { x: p.x, y: p.y, cs, a: T < S.recul ? seg(eIO(seg(T, S.p24, S.recul)), .25, .9) : 1 };
}
function grille(ctx, T) {
  const O = etatOeil(T), phi = { x: O.x, y: O.yv }, vie = enVie(T), cam = camGrille(T);
  const clair = vie * .7;
  fond(ctx, T, { sol: .45, clair });
  // les pilules en icônes, au-dessus de la foule (P26–P27 : index.html, POSES.icones), la jauge « EXEMPLE »
  const aP = T >= PB.P26[0] ? seg(T, PB.P26[0], PB.P26[0] + .5) : 0;
  if (aP > 0) {
    const hb = cloche(T, S.bleue - .2, S.bleue + .2, PB.P27[0] - .4, PB.P27[0]), hr = cloche(T, S.rouge - .2, S.rouge + .2, PB.P28[0] - .5, PB.P28[0]);
    pilule(ctx, T, 0, { x: POSES.icones[0][0], y: POSES.icones[0][1], ps: POSES.icones[0][2], a: aP, hl: hb });
    pilule(ctx, T, 1, { x: POSES.icones[1][0], y: POSES.icones[1][1], ps: POSES.icones[1][2], a: aP, hl: hr });
  }
  // les sujets ; les halos de craie (P25) d'abord, sous eux. Pendant la poussée de P25 (×2,5), les rangées du bas
  // descendent sous la boîte XPHI et s'y lisaient à travers : au montage, le monde est coupé au haut de la boîte
  // (y 856, sous son filet laiton), comme l'écran 02 poussé du lot tirage
  const sousBoite = T >= S.pourKant && T < PB.P26[0];
  if (sousBoite) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 856); ctx.clip(); }
  const P = G.map(g => ({ g, ...placeG(g, T) }));
  if (T >= S.agissent && T < PB.P26[0]) {
    const H = halo(CRAIE);
    for (const q of P) {
      if (q.g.i === 49) continue;
      const k = seg(T, q.g.tl, q.g.tl + .5); if (k <= 0) continue;
      const r = 12 * q.cs;
      ctx.globalAlpha = .55 * k * (.85 + .15 * Math.sin(T * 4 + q.g.i)); ctx.drawImage(H, q.x - r, q.y - r, 2 * r, 2 * r);
    }
    ctx.globalAlpha = 1;
  }
  const phiW = phi, signes = [];
  for (const q of P) {
    const { g } = q; if (q.a <= .001) continue;
    if (q.x < -60 || q.x > W + 60 || q.y < -80 || q.y > 920) continue;
    const c = couleurG(g, T), pr = promesseG(g, T);
    const e = { col: c.col, a: q.a, mode: 'repos', phi: phiW, cible: phiW, reflet: O.ouvert && T >= S.recul };
    if (c.t0 !== null) { e.mode = 'saut'; e.t0 = c.t0; }
    else if (vie > 0 && c.col !== GRIS_FIG) { e.mode = 'vie'; e.k = vie; }
    if (pr.tend) Object.assign(e, POSES_EP.tend(g.sens));
    if (g.i === 50 && T >= S.suivent - .2 && T < S.suivent + 1.0) Object.assign(e, POSES_EP.tend(-1));   // la pièce
    if (T < S.recul && (g.i === 49 || g.i === 50)) { e.mode = 'prive'; e.cible = g.i === 49 ? { x: q.x + 100, y: q.y - 20 } : { x: q.x - 100, y: q.y - 20 }; e.reflet = false; }
    dessineSujet(ctx, g.f, q.x, q.y, q.cs, e, T);
    if (pr.x > 0) signes.push(() => croixHanche(ctx, q.x - g.sens * 3.4 * q.cs, q.y + 2.6 * q.cs, Math.max(2, Math.round(q.cs / 2)), pr.x));
    if (pr.bulle > 0 && !(g.i === 49 && T >= S.eteint + .2)) signes.push(() => miniBulle(ctx, q.x + g.sens * 6 * q.cs / 4, q.y - 7.2 * q.cs, 1, pr.bulle));
    if (pr.envol > 0) signes.push(() => envolMots(ctx, q.x + g.sens * 6 * q.cs / 4, q.y - 7.2 * q.cs - 6, pr.envol, g.i));
  }
  for (const s of signes) s();
  // la pièce que son voisin lui tend (P25), de main à main
  if (T >= S.suivent - .2 && T < PB.P26[0]) {
    const qe = P[49], qr = P[50], pv = pieceVol(T, main(qr.x, qr.y, qr.cs, -1), main(qe.x, qe.y, qe.cs, 1), S.suivent, 24 * qe.cs / 4);
    if (pv) piece(ctx, pv.x, pv.y, Math.max(2, Math.round(qe.cs / 2)), { larg: pv.larg });
  }
  if (sousBoite) { ctx.restore(); ctx.globalAlpha = 1; }
  // l'emprunteur : sa bulle (P25), son cercle (P24–P25) ; « vous » (P26–P27)
  const qe = P[49];
  if (T >= S.eteint + .2 && T < PB.P26[0]) {
    const w = 340, h = 54, x = qe.x - 130, y = qe.y - 6 * qe.cs - 26 - h;
    bulle(ctx, x, y, w, h, { type: 'parole', queue: { x: qe.x + 6, y: qe.y - 6 * qe.cs - 4 }, txt: 'Je te rembourse demain.', taille: 22, k: seg(T, S.eteint + .2, S.eteint + .5) });
  }
  if (T >= S.rien && T < PB.P26[0]) cercle(ctx, T, qe.x, qe.y, 32 * qe.cs / 4, S.rien);
  if (T >= S.vous && T < PB.P28[0]) {
    cercle(ctx, T, qe.x, qe.y, 32, S.vous + .2);
    const al = seg(T, S.vous + .4, S.vous + .7);
    if (al > 0) {
      ctx.globalAlpha = al; ctx.fillStyle = CRAIE; ctx.fillRect(649, 334, 2, qe.y - 30 - 334);
      ctx.font = `16px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText('vous', 650, 326);
      ctx.globalAlpha = 1;
    }
  }
  // « sujets de démonstration », sous la foule (P24–P25, plan large)
  const as = (T < PB.P26[0] ? seg(T, S.recul - .3, S.recul + .3) : 1) * (T >= S.pourKant && T < PB.P26[0] ? 1 - seg(T, S.pourKant, S.pourKant + .5) : 1);
  if (as > 0 && T < PB.P26[0]) { ctx.globalAlpha = as; ctx.font = `16px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.fillText('sujets de démonstration', 1125, 664); ctx.globalAlpha = 1; }
  // la jauge (P26–P27) : elle suit le nombre de bleus ; son trait s'allume en laiton quand il passe les 50 %
  if (aP > 0) {
    let nb = 0, nr = 0;
    for (const g of G) { const c = couleurG(g, T).col; if (c === BLEU) nb++; else if (c === ROUGE) nr++; }
    jauge(ctx, { bleue: nb, rouge: nr, a: aP, etiquette: 'EXEMPLE' });
    if (nb > 50) { ctx.globalAlpha = aP; ctx.fillStyle = LAITON; ctx.fillRect(150 + 500 - 1.5, 692 - 12, 3, 38); ctx.globalAlpha = 1; }
  }
  // le terminal, la vignette de Kant
  terminalGrille(ctx, T);
  const v = placeVignette(T), av = aTerminal(T);
  const q = T >= S.kantQ && T < PB.P27[0] ? seg(T, S.kantQ, S.kantQ + .3) * (1 - seg(T, PB.P27[0] - .3, PB.P27[0])) : 0;
  vignetteKant(ctx, T, v.x, v.y, { a: av, phi, cible: phi, fixe: q > 0, reflet: O.ouvert && q > 0, question: q });
  dessineOeil(ctx, T, O);
}
// le terminal réduit, et ses verdicts (« → ✗ » en craie, « → ✓ » en LABO), tapés au bout de leur ligne
function terminalGrille(ctx, T) {
  const a = aTerminal(T); if (a <= .001) return null;
  const derniere = [...LIGNES_R].reverse().find(L => T >= L.t0);
  const R = terminal(ctx, T, LIGNES_R, { ...TR, a, curseur: !(derniere && derniere.verdict && T >= derniere.verdict.t) });
  ctx.save(); ctx.globalAlpha = a; ctx.font = `${TR.taille}px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  for (const r of R.rangs) {
    const v = r.ligne.verdict; if (!v || T < v.t) continue;
    const x = r.x + ctx.measureText(r.ligne.txt).width, n = tapes(T, v.t, 24, 3);
    ctx.fillStyle = r.ligne.col; ctx.fillText(' → '.slice(0, n), x, r.y);
    if (T >= v.t + .12) {
      const k = eBack(seg(T, v.t + .12, v.t + .4));
      ctx.fillStyle = v.col; ctx.font = `${Math.max(1, Math.round(TR.taille * (.6 + .4 * k)))}px ${MONO}`;
      texteSignes(ctx, v.signe, x + ctx.measureText(' → ').width + 2 / (TR.taille / 20), r.y);
      ctx.font = `${TR.taille}px ${MONO}`;
    }
  }
  ctx.restore();
  return R;
}
// ce que Phi regarde dans la grille
const faceG = (i, T) => { const q = placeG(G[i], T); return point(q.x, q.y - 3 * q.cs); };
const frontVague = (t0, pas) => T => {     // le front de la vague : un sujet de l'anneau qu'elle atteint
  const d = clamp(Math.floor((T - t0) / pas), 0, 10), cands = G.filter(g => g.d === d);
  if (!cands.length) return null;
  const g = cands[Math.floor(hache(Math.floor(T / .3) * 17 + d) * cands.length)];
  return faceG(g.i, T);
};
const jaugeTrait = point(650, 699);
const plumeR = T => (T >= S.tous ? point(TR.x + 330, TR.y + 80) : null);

// ================================================================ P28–P30 · l'écran partagé
// À gauche, cent bleus ; à droite, cent rouges : la même grille à ×0,8 (cs 3), mêmes places, mêmes coiffes ; le filet
// laiton en x 960 ; l'œil au sommet du filet. Une caméra d'ensemble (compCam) pousse ensuite sur une moitié (×5/3).
const MOITIE = Object.freeze({ g: cadre(CENTRE_G.x, CENTRE_G.y, 480, 440, .8), d: cadre(CENTRE_G.x, CENTRE_G.y, 1440, 440, .8) });
const FOCUS_R = MOITIE.d.ecran(VOUS_G.cx, VOUS_G.cy), FOCUS_B = MOITIE.g.ecran(BLEU_SUIVI.cx, BLEU_SUIVI.cy);
const ZP = 5 / 3;
const CAM_PARTAGE = Object.freeze([
  [PB.P28[0], 960, 440, 960, 440, 1], [S.p29, 960, 440, 960, 440, 1], [S.pousse29, FOCUS_R.x, FOCUS_R.y, 960, 440, ZP],
  [S.p30, FOCUS_R.x, FOCUS_R.y, 960, 440, ZP], [S.glisse, FOCUS_B.x, FOCUS_B.y, 960, 440, ZP],
]);
const compCam = T => camera(T, CAM_PARTAGE);
// un sujet d'une moitié (M : MOITIE.g ou .d), à l'écran sous la caméra d'ensemble
const ecranP = (M, cam, x, y) => { const p = M.ecran(x, y); return cam.ecran(p.x, p.y); };
const CONFIGS = Object.freeze(['b100', 'b75', 'b25', 'b0']);
const FB = Object.freeze({ b100: 1, b75: .75, b25: .25, b0: 0 });
// P29 : la configuration jouée à droite (en boucle, 0,8 s chacune), ou null
const configR = T => (T >= S.boucleR && T < PB.P31[0] ? Math.floor((T - S.boucleR) / .8) : null);
// P30 : la configuration jouée à gauche (une seule fois), ou null
const configB = T => (T >= S.c0 && T < S.c0 + 4 * S.slot ? Math.floor((T - S.c0) / S.slot) : null);
const debutConfigR = n => S.boucleR + n * .8, debutConfigB = n => S.c0 + n * S.slot;
// P30 : le bleu suivi a peur et part en caractères à la troisième configuration, se recompose avant « en voulant »
const T_PEUR = debutConfigB(2) + .1, T_DIS = debutConfigB(2) + .22;
const disBleu = T => (T < T_DIS ? 0 : T < S.recompose ? seg(T, T_DIS, T_DIS + .35) : 1 - eIO(seg(T, S.recompose, S.voulant)));
// ceux qu'il regarde, un par un (P30) : huit voisins, dans le sens des aiguilles d'une montre
const REGARDES = Object.freeze([27, 15, 58, 96, 73, 83, 42, 4].map(i => DEMO[i]));
const dRegard = (S.signal - .3 - S.voulant) / REGARDES.length;
const tRegard = j => S.voulant + j * dRegard;
const DOS = Object.freeze({ x: 960, y: 470, cs: 24 });
function partage(ctx, T) {
  if (T >= S.dos) { dosSignal(ctx, T); return; }
  const O = etatOeil(T), cam = compCam(T), phi = { x: O.x, y: O.yv }, z = cam.z;
  const vie = T < S.diff + .2 ? seg(T, PB.P28[0] + .2, PB.P28[0] + .6) * (1 - seg(T, S.diff, S.diff + .3)) : 0;
  fond(ctx, T, { sol: .4, clair: vie * .5, centre: [960, 470] });
  const xf = cam.ecran(960, 0).x;
  const lui = { x: 960, y: 440 };
  const anneauxT = [S.signal, S.signal + .45, S.signal + .9];
  for (const cote of ['g', 'd']) {
    const M = MOITIE[cote];
    ctx.save(); ctx.beginPath();
    if (cote === 'g') ctx.rect(0, 0, xf - 1, 830); else ctx.rect(xf + 1, 0, W - xf - 1, 830);
    ctx.clip();
    const suivi = cote === 'd' ? VOUS_G.i : BLEU_SUIVI.i, base = cote === 'd' ? ROUGE : BLEU;
    for (const f of DEMO) {
      const p = ecranP(M, cam, f.cx, f.cy), cs = 3 * z;
      if (p.x < -40 || p.x > W + 40) continue;
      const e = { col: base, mode: 'repos', phi, cible: phi, reflet: O.ouvert };
      if (vie > 0) { e.mode = 'vie'; e.k = vie; }
      const moi = f.i === suivi;
      if (cote === 'd' && T >= S.egoistes && !moi) {
        const n = configR(T);
        if (n === null || T < S.boucleR) e.col = T >= S.egoistes + hache(f.i * 3 + 1) * .3 ? GRIS_FIG : base;
        else {
          const cfg = CONFIGS[n % 4], col = LOTS[cfg].has(f.i) ? BLEU : ROUGE, prev = n === 0 ? GRIS_FIG : (LOTS[CONFIGS[(n + 3) % 4]].has(f.i) ? BLEU : ROUGE);
          e.col = col;
          const ts = debutConfigR(n) + hache(f.i * 7 + n) * .12;
          if (col !== prev && T >= ts - .2 && T < ts + .45) { e.mode = 'saut'; e.t0 = ts; e.col = T < ts ? prev : col; }
          else if (cfg === 'b25' && col === BLEU && T > ts + .3) { e.mode = 'peur'; e.k = .7; }
        }
      }
      if (cote === 'd' && moi && T >= S.airEgo) { e.p = { yx: 0, yy: 0 }; e.fixe = false; e.cible = null; }
      if (cote === 'g' && T >= S.contraire && !moi) {
        const n = configB(T);
        if (n === null) e.col = T < S.c0 ? (T >= S.contraire + hache(f.i * 3 + 2) * .12 ? GRIS_FIG : base) : GRIS_FIG;
        else {
          const cfg = CONFIGS[n], col = LOTS[cfg].has(f.i) ? BLEU : ROUGE, prev = n === 0 ? GRIS_FIG : (LOTS[CONFIGS[n - 1]].has(f.i) ? BLEU : ROUGE);
          e.col = col;
          const ts = debutConfigB(n) + hache(f.i * 11 + n) * .08;
          if (col !== prev && T >= ts - .2 && T < ts + .45) { e.mode = 'saut'; e.t0 = ts; e.col = T < ts ? prev : col; }
        }
        // les anneaux du signal : quand le premier l'atteint, il tourne les yeux vers lui
        if (T >= S.signal) {
          const u = clamp((Math.hypot(p.x - lui.x, p.y - lui.y) - 10) / 690), tt = S.signal + 1.2 * (1 - Math.cbrt(1 - u));   // eOut, à l'envers
          if (T >= tt) { e.fixe = true; e.cible = lui; e.reflet = false; }
        }
      }
      if (cote === 'g' && moi) {
        if (T >= T_PEUR && T < S.voulant) { e.mode = 'peur'; e.dis = disBleu(T); if (T >= S.recompose) { e.mode = 'repos'; e.p = { bob: 0, yx: 0, yy: 0, goutte: 0 }; } }
        if (T >= S.voulant && T < S.signal) { const j = clamp(Math.floor((T - S.voulant) / dRegard), 0, REGARDES.length - 1), c = REGARDES[j]; e.mode = 'prive'; e.cible = ecranP(M, cam, c.cx, c.cy); }
        if (T >= S.signal) { e.mode = 'repos'; e.fixe = true; e.cible = phi; }
      }
      dessineSujet(ctx, f, p.x, p.y, cs, e, T);
    }
    // les pointillés vers ceux qu'il regarde, les anneaux du signal (P30)
    if (cote === 'g' && T >= S.voulant) {
      const al = 1 - seg(T, S.coopere, S.coopere + .5);
      REGARDES.forEach((c, j) => {
        const t0 = tRegard(j); if (T < t0 || al <= 0) return;
        const q = ecranP(M, cam, c.cx, c.cy), k = eOut(seg(T, t0, t0 + .25));
        tirets(ctx, lui.x, lui.y - 2 * 3 * z, lerp(lui.x, q.x, k), lerp(lui.y - 6 * z, q.y - 6 * z, k), GRIS, .8 * al, 2, [5, 5]);
      });
      ondes(ctx, T, lui.x, lui.y - 3 * z, anneauxT, { r: 700, d: 1.2, col: BLEU_TXT, a: .5 });
    }
    ctx.restore();
  }
  // le filet laiton (il s'interrompt autour de l'œil, qui s'y pose comme une perle) ; quand la poussée de P29 le fait
  // glisser dans la largeur du cartouche (« UN DILEMME KANTIEN ? » : x 39–422, y 31–133 avec ses filets), il part de
  // sous lui : il passait au-dessus, puis dessous, comme s'il le transperçait
  if (xf > -5 && xf < W + 5) {
    const y0 = xf < 440 ? 150 : 0;
    if (Math.abs(xf - O.x) < 50) { filet(ctx, xf, y0, O.yv - 50); filet(ctx, xf, O.yv + 50, 830); } else filet(ctx, xf, y0, 830);
  }
  // « CENT BLEUS », « CENT ROUGES », « cent survivants » (les mots du script)
  const al = 1 - seg(T, S.p29, S.p29 + .5);
  if (al > 0) {
    for (const [cote, txt, col] of [['g', 'CENT BLEUS', BLEU_TXT], ['d', 'CENT ROUGES', ROUGE_TXT]]) {
      const p = cam.ecran(MOITIE[cote].sx, 0).x;
      const a1 = seg(T, S.cent, S.cent + .3) * al, a2 = seg(T, S.survivants, S.survivants + .3) * al;
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      if (a1 > 0) { ctx.globalAlpha = a1; ctx.font = `28px ${PIX}`; ctx.fillStyle = col; ctx.fillText(txt, p, 616); }
      if (a2 > 0) { ctx.globalAlpha = a2; ctx.font = `20px ${MONO}`; ctx.fillStyle = CRAIE; ctx.fillText('cent survivants', p, 652); }
    }
    ctx.globalAlpha = 1;
  }
  // P29 : le rouge suivi, cerclé, et ses quatre cases (il vit dans tous les cas)
  if (T >= S.egoistes && T < S.p30 + .3) {
    const a = 1 - seg(T, S.p30, S.p30 + .3), p = cam.ecran(FOCUS_R.x, FOCUS_R.y);
    cercle(ctx, T, p.x, p.y, 34 * z / ZP * 1.25, S.egoistes, { a });
    const n = configR(T);
    casesConfig(ctx, T, p.x, p.y + 6 * 3 * z + 20, CONFIGS.map((c, j) => ({ fb: FB[c], verdict: '✓', t: debutConfigR(j) + .35 })), { a: a * seg(T, S.boucleR - .2, S.boucleR + .1), actuelle: n === null ? -1 : n % 4 });
  }
  // P30 : le bleu suivi, cerclé, ses cases (✓ ✓ ✗ ✗), sa bulle
  if (T >= S.contraire) {
    const p = cam.ecran(FOCUS_B.x, FOCUS_B.y), n = configB(T);
    cercle(ctx, T, p.x, p.y, 34 * 1.25, S.contraire);
    const ac = seg(T, S.c0 - .2, S.c0 + .1) * (1 - seg(T, S.voulant + 1.5, S.voulant + 2));
    casesConfig(ctx, T, p.x, p.y + 6 * 3 * z + 20, CONFIGS.map((c, j) => ({ fb: FB[c], verdict: j < 2 ? '✓' : '✗', t: debutConfigB(j) + .25 })), { a: ac, actuelle: n === null ? -1 : n });
    if (T >= S.coopere) {
      ctx.font = `22px ${PIX}`;
      const txt = 'Je coopère, et je suis prêt à risquer ma vie pour ça', w = Math.ceil(ctx.measureText(txt).width) + 52, h = 56;
      bulle(ctx, p.x - w / 2, p.y - 6 * 3 * z - 30 - h, w, h, { type: 'parole', queue: { x: p.x + 4, y: p.y - 6 * 3 * z - 6 }, txt, taille: 22, k: seg(T, S.coopere, S.coopere + .3) });
    }
  }
  dessineOeil(ctx, T, O);
}
// la rime (P30, la fin) : coupe sur son dos, les mains ouvertes ; devant lui, les autres, qui le regardent
function dosSignal(ctx, T) {
  const O = etatOeil(T), phi = { x: O.x, y: O.yv };
  fond(ctx, T, { sol: .8, centre: [1000, 430] });
  [27, 28, 29, 31, 32, 33].forEach((i, j) => dessineSujet(ctx, DEMO[i], 620 + j * 136, 300 + (j % 2) * 18, 8, { col: GRIS_FIG, a: .5, mode: 'prive', cible: { x: DOS.x, y: DOS.y }, phi, reflet: false }, T));
  const D = POSES_EP.dosMains();
  dessineSujet(ctx, BLEU_SUIVI, DOS.x, DOS.y, DOS.cs, { col: BLEU, ...D, extra: [...D.extra, MAINS_NETTES], extraCle: 'dosMainsK' }, T);
  dessineOeil(ctx, T, O);
}
const mainsOuvertes = point(DOS.x, DOS.y + 3.5 * DOS.cs);

// ================================================================ P31 · l'anneau
// Les 62 bleus de LOTS.b62 quittent la grille à petits sauts et forment l'anneau (partage.js : anneau, ORDRE_ANNEAU :
// centre (960, 440), rayon 270) ; les 38 rouges vont aux bords (placeRouge), assombris à 50 %. Une fois tous arrivés,
// l'image est celle de plans/kant-anneau.js (anneauKant) : la même fonction peut dessiner le début du lot variantes.
export const RACCORD = Object.freeze({ t0: S.circ, ...ANNEAU_KANT });   // l'anneau tourne depuis « circulaire »
const R_CONTOUR = ANNEAU.r + 62;                    // les contours : au-dehors des flèches (rayon 305)
const departBleu = k => S.ceux + .05 + k * .025;
const departRouge = j => S.ceux + .15 + j * .02;
const TOUS_ARRIVES = Math.max(departBleu(ANNEAU.n - 1) + 1.0, departRouge(ROUGES_ANNEAU.length - 1) + 1.1);
function placeAnneau(f, T) {
  const k = RANG_ANNEAU.get(f.i);
  if (k !== undefined) {
    const td = departBleu(k), u = seg(T, td, td + 1.0), q = anneau(k, pasAnneau(T, S.circ));
    return { x: lerp(f.cx, q.x, eIO(u)), y: lerp(f.cy, q.y, eIO(u)) - 12 * Math.abs(Math.sin(3 * Math.PI * u)), cs: u < .5 ? 4 : ANNEAU_KANT.csBleus, col: BLEU, a: 1, u, k };
  }
  const j = ROUGES_ANNEAU.indexOf(f.i), td = departRouge(j), u = seg(T, td, td + 1.1), q = placeRouge(j);
  return { x: lerp(f.cx, q.x, eIO(u)), y: lerp(f.cy, q.y, eIO(u)) - 10 * Math.abs(Math.sin(2 * Math.PI * u)), cs: ANNEAU_KANT.csRouges, col: ROUGE, a: lerp(1, ANNEAU_KANT.aRouges, u), u, j };
}
function anneauScene(ctx, T) {
  const O = etatOeil(T), phi = { x: O.x, y: O.yv };
  fond(ctx, T, { sol: .4, centre: [960, 470] });
  const rot = pasAnneau(T, S.circ);
  // les contours (sous les sujets) : « EN DANGER » se trace ; « SAUVÉS » tombe exactement dessus ; puis s'effacent
  const fc = 1 - seg(T, S.plusUn + .4, S.plusUn + 1.4);
  if (T >= S.exact && fc > 0) {
    cercleTirets(ctx, ANNEAU.x, ANNEAU.y, R_CONTOUR, seg(T, S.exact, S.exact + .9), { col: GRIS, a: fc });
    const ys = sauvesY(T);
    if (ys !== null) cercleTirets(ctx, ANNEAU.x, ANNEAU.y + ys, R_CONTOUR, 1, { col: CRAIE, a: fc * seg(T, S.danger - 1.0, S.danger - .8) });
  }
  // les sujets, les flèches (l'une après l'autre ; la dernière ferme la boucle), « SAUVÉS = EN DANGER » (tapé)
  const nF = T >= S.fleches ? ANNEAU.n * seg(T, S.fleches, S.ferme) : 0, txt = ANNEAU_KANT.texte, nT = [...txt.txt].length;
  const nTxt = T >= S.plusUn ? tapes(T, S.plusUn, 24, nT) : 0;
  if (T >= TOUS_ARRIVES) anneauKant(ctx, T, { t0: S.circ, phi, reflet: O.ouvert, fleches: nF > 0 ? 1 : 0, n: nF, texte: nTxt >= nT ? 1 : 0 });
  else {
    for (const f of DEMO) {
      const q = placeAnneau(f, T), e = { col: q.col, a: q.a, mode: 'repos', phi, cible: phi, reflet: O.ouvert && q.col === BLEU };
      if (q.k !== undefined && q.u > 0 && q.u < 1) e.p = { yx: 0, yy: 0 };
      dessineSujet(ctx, f, q.x, q.y, q.cs, e, T);
    }
    if (nF > 0) flechesKant(ctx, T, { rot, n: nF });
  }
  if (nTxt > 0 && nTxt < nT) {
    ctx.font = `${txt.taille}px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    ctx.fillText([...txt.txt].slice(0, nTxt).join(''), txt.x - ctx.measureText(txt.txt).width / 2, txt.y);
  }
  // le bleu suivi, cerclé, et son « ? » (avant l'anneau) ; « EXEMPLE » sous la foule
  const ac = 1 - seg(T, S.ceux, S.ceux + .3);
  if (ac > 0) {
    cercle(ctx, T, BLEU_SUIVI.cx, BLEU_SUIVI.cy, 32, PB.P31[0] - 1, { a: ac });
    if (T >= S.qui) {
      const k = eBack(seg(T, S.qui, S.qui + .3));
      puce(ctx, '?', BLEU_SUIVI.cx, BLEU_SUIVI.cy - 50, { a: ac * clamp(k), taille: Math.max(1, Math.round(30 * k)), marge: 6, bord: CRAIE });
    }
    ctx.globalAlpha = ac; ctx.font = `500 16px ${MONO}`; ctx.fillStyle = GRIS; ctx.textBaseline = 'alphabetic';
    espace(ctx, 'EXEMPLE', CENTRE_G.x, 664, 3, 'center'); ctx.globalAlpha = 1;
  }
  // les étiquettes des contours : « EN DANGER » en haut du sien ; « SAUVÉS » tombe sur lui
  if (T >= S.exact && fc > 0) {
    const yT = ANNEAU.y - R_CONTOUR, al = 1 - seg(T, S.plusUn, S.plusUn + .4);
    puce(ctx, 'EN DANGER', ANNEAU.x, yT, { col: GRIS, a: al * seg(T, S.exact + .5, S.exact + .8), taille: 22, bord: GRIS });
    const ys = sauvesY(T);
    if (ys !== null) puce(ctx, 'SAUVÉS', ANNEAU.x, yT + ys - 34, { col: CRAIE, a: al * seg(T, S.danger - 1.0, S.danger - .8), taille: 22, bord: CRAIE });
  }
  dessineOeil(ctx, T, O);
}
// le contour « SAUVÉS » : il paraît au-dessus, tombe et se pose exactement sur « EN DANGER » sur « en danger » (son
// décalage vertical, ou null avant)
function sauvesY(T) {
  if (T < S.danger - 1.0) return null;
  const k = seg(T, S.danger - .8, S.danger);
  return -360 * (1 - k * k);
}
// ce que Phi regarde dans l'anneau
const pointeFleche = T => { const n = ANNEAU.n * seg(T, S.fleches, S.ferme); return anneau(Math.min(ANNEAU.n, n + .5), pasAnneau(T, S.circ)); };
const tourAnneau = (t0, d) => T => anneau(ANNEAU.n * seg(T, t0, t0 + d), pasAnneau(T, S.circ));
const dernierBleu = T => {
  let best = null, bt = -Infinity;
  for (const i of ORDRE_ANNEAU) { const k = RANG_ANNEAU.get(i), td = departBleu(k); if (td <= T && td > bt && T < td + 1.0) { bt = td; best = DEMO[i]; } }
  if (!best) return null;
  const q = placeAnneau(best, T); return point(q.x, q.y - 12);
};

// ================================================================ l'œil : l'état d'une image, et son regard
let REGARD = null;
function regard() {
  if (REGARD) return REGARD;
  const C = [
    // P19 : la fenêtre qui s'ouvre ; la plume du terminal ; la ligne du balayage, rangée par rangée ; le face à face
    [PB.P19[0], S.ouvre + .6 - PB.P19[0], point(FK.x + FK.w / 2, FK.y + FK.h / 2)],
    [S.ouvrir, .7, T => plumeK(T) || point(TK.x + 120, TK.y + 40), .2],
    [S.calcul, S.kant - S.calcul, scanKant, .12],
    [S.leve, S.imp + .5 - S.leve, yeuxKant, .4],
    // P20 : la plume du terminal, mot à mot
    [S.imp + .5, finParole('K02') - S.imp - .5, plumeK, .25],
    // P21 : le titre ; la maxime pendant l'analyse ; Kant sur « si mal » ; la plume LABO ; la fonction ; vous sur « en somme »
    [S.principe, .9, T => rangK(T, L_TITRE)],
    [S.siMal, S.mal + .1 - S.siMal, maximeK], [S.mal + .1, 1.2, yeuxKant, .4], [S.mal + 1.3, S.reform - S.mal - 1.3, maximeK],
    [S.phi, finParole('K05') - S.phi, plumeK, .2],
    [S.algo, finParole('K06') - S.algo, T => plumeK(T) || rangK(T, L_REGLE), .2],
    [S.somme, PB.P22[0] - S.somme, VOUS],
    // P22 : l'entrée ; Kant (son exemple) ; l'emprunteur ; la bulle ; le ✗ ; la main ; la bulle de parole ; la pièce ; le prêteur
    [S.p22, .8, point(960, 470)], [S.exemple, S.besoin - S.exemple, point(VK_HAUT.x + VIGNETTE.w / 2, VK_HAUT.y + 50)],
    [S.besoin, .5, point(E22.x, E22.y - 36)], [S.besoin + .5, S.rendre - S.besoin - .5, point(PIECE_PENSEE.x, PIECE_PENSEE.y)],
    [S.rendre, S.emprunter - S.rendre, point(PIECE_PENSEE.x, PIECE_PENSEE.y)],
    [S.emprunter, S.promettant - S.emprunter, point(MAIN_E.x, MAIN_E.y)],
    [S.promettant, S.rembourser - .2 - S.promettant, point(PAROLE.x + PAROLE.w / 2, PAROLE.y + PAROLE.h / 2)],
    [S.rembourser - .2, .8, T => { const p = pieceVol(T, MAIN_R, MAIN_E, S.rembourser); return p ? point(p.x, p.y) : point(MAIN_R.x, MAIN_R.y); }, .12],
    [S.ting + .1, PB.P23[0] - S.ting - .1, point(R22.x, R22.y - 36)],
    // P23 : les doigts croisés ; puis la maxime qui s'écrit
    [S.p23, S.quand - S.p23, doigtsCroises, .3], [S.quand, finParole('K10') - S.quand, plumeMaxime, .2],
    [finParole('K10'), PB.P24[0] - finParole('K10'), VOUS],
    // P24 : le terminal ; le front de la vague ; les bulles qui partent ; l'emprunteur et sa main vide
    [S.tous, .4, plumeR], [S.tous + .4, .9, frontVague(S.tous, .09), .1],
    [S.tous + 1.3, S.plusPers - S.tous - 1.3, T => faceG(49, T)],
    [S.plusPers, 1.2, frontVague(S.plusPers, .05), .15], [S.rien - .4, PB.P25[0] - S.rien + .4, T => faceG(49, T)],
    // P25 : l'emprunteur ; la pièce ; les 99 ; vous sur « comme vous »
    [S.rembob, S.suivent - S.rembob, T => faceG(49, T), .5], [S.suivent, 1.0, T => faceG(50, T)],
    [S.pourKant, S.agissent - S.pourKant, T => faceG(49, T), .5],
    [S.agissent, S.commeVous - S.agissent, T => faceG(G[Math.floor(hache(Math.floor(T / .45) * 13 + 5) * 100)].i, T), .45],
    [S.commeVous, PB.P26[0] - S.commeVous, VOUS],
    // P26 : le terminal ; « vous » ; le front de la vague ; la jauge au trait ; le ✓ ; Kant sur la question
    [S.pilules, .6, plumeR], [S.vous, S.vague1 - S.vous, T => faceG(49, T)], [S.vague1, 1.0, frontVague(S.vague1 + .1, .09), .1],
    [S.vague1 + 1.0, .7, jaugeTrait], [S.survie, 1.2, T => faceG(G[Math.floor(hache(Math.floor(T / .4) * 7 + 1) * 100)].i, T), .4],
    [S.univ, 1.0, point(TR.x + 360, TR.y + 110)], [S.kantQ, PB.P27[0] - S.kantQ, point(VK_COIN.x + 60, VK_COIN.y + 60)],
    // P27 : le terminal ; « vous » ; la vague ; les bras levés ; les trois lignes du terminal, de haut en bas
    [S.p27 + .1, .6, plumeR], [S.rouge, S.vague2 - S.rouge, T => faceG(49, T)], [S.vague2, 1.0, frontVague(S.vague2 + .1, .09), .1],
    [S.meurt, 1.4, T => faceG(G[Math.floor(hache(Math.floor(T / .4) * 5 + 3) * 100)].i, T), .4],
    [S.passent, .5, point(TR.x + 200, TR.y + 80)], [S.passent + .5, .5, point(TR.x + 200, TR.y + 110)],
    [S.passent + 1.0, .6, point(TR.x + 200, TR.y + 140)], [S.passent + 1.6, .7, point(TR.x + 360, TR.y + 140)],
    // P28 : gauche, droite, gauche : il compare
    [S.p28, .9, point(480, 440)], [S.p28 + .9, .9, point(1440, 440)], [S.p28 + 1.8, .8, point(480, 610)], [S.p28 + 2.6, .8, point(1440, 610)],
    [S.diff, PB.P29[0] - S.diff, T => (Math.floor((T - S.diff) / .9) % 2 ? point(1440, 440) : point(480, 440))],
    // P29 : le sujet rouge ; ses quatre cases ; vous sur « même si elle passe le test »
    [S.p29, S.boucleR - S.p29, point(960, 420)], [S.boucleR, 3.4, T => point(960 + ((configR(T) ?? 0) % 4 - 1.5) * (CASE.w + CASE.gap), 440 + 50 + 30), .2],
    [S.boucleR + 3.4, S.memeSi - S.boucleR - 3.4, point(960, 420)], [S.memeSi, PB.P30[0] - S.memeSi, VOUS],
    // P30 : le sujet bleu ; ses cases ; les autres qu'il regarde ; le signal ; la bulle ; vous sur « pour ça » ; son dos
    [S.p30, S.c0 - S.p30, point(960, 420)],
    [S.c0, S.voulant - S.c0, T => { const n = configB(T); return n === null ? point(960, 420) : point(960 + (n - 1.5) * (CASE.w + CASE.gap), 440 + 50 + 30); }, .2],
    [S.voulant, S.signal - S.voulant, T => { const j = clamp(Math.floor((T - S.voulant) / dRegard), 0, REGARDES.length - 1), c = REGARDES[j], q = ecranP(MOITIE.g, compCam(T), c.cx, c.cy); return point(q.x, q.y - 12); }, .3],
    [S.signal, S.coopere - S.signal, T => { const r = 10 + 690 * eOut(seg(T, S.signal, S.signal + 1.2)); return point(960 + r * .7, 440 + r * .2); }, .15],
    [S.coopere, S.pourCa - S.coopere, point(960, 330)], [S.pourCa, S.dos - S.pourCa, VOUS], [S.dos, PB.P31[0] - S.dos, mainsOuvertes],
    // P31 : le bleu cerclé ; son « ? » ; les bleus qui partent ; la flèche qui se trace (le tour) ; les contours ; le centre ;
    // sur « circulaire », un tour, seul
    [S.p31, S.qui - S.p31, T => point(BLEU_SUIVI.cx, BLEU_SUIVI.cy - 12)], [S.qui, S.ceux - S.qui, point(BLEU_SUIVI.cx, BLEU_SUIVI.cy - 46)],
    [S.ceux, departBleu(ANNEAU.n - 1) + 1.0 - S.ceux, dernierBleu, .2],
    [S.fleches, S.ferme - S.fleches + .2, pointeFleche, .1],
    [S.exact, .9, T => { const a = -Math.PI / 2 + 2 * Math.PI * seg(T, S.exact, S.exact + .9); return point(ANNEAU.x + R_CONTOUR * Math.cos(a), ANNEAU.y + R_CONTOUR * Math.sin(a)); }, .1],
    [S.danger - .9, 1.0, T => point(ANNEAU.x, Math.max(20, ANNEAU.y - R_CONTOUR + (sauvesY(T) ?? 0) - 34)), .15],
    [S.danger + .1, S.plusUn - S.danger - .1, point(ANNEAU.x, ANNEAU.y - R_CONTOUR)],
    [S.plusUn, 1.6, point(ANNEAU.x, ANNEAU.y)], [S.plusUn + 1.6, S.circ - S.plusUn - 1.6, VOUS],
    [S.circ, 2.4, tourAnneau(S.circ, 2.4), .1], [S.circ + 2.4, 10, T => anneau(ANNEAU.n * .25, pasAnneau(T, S.circ)), .4],
  ];
  return (REGARD = creeRegard({
    cibles: C.map(([t, d, c, p]) => [t, Math.max(0, d), c, p]).filter(c => c[1] > 0),
    repos: [[3, VOUS], [2, T => plumeBoite(T)]],
  }));
}
// l'état de l'œil à l'instant T (calculé avant le monde : les sujets regardent sa vraie place et lui rendent son regard)
function etatOeil(T) {
  const P = placeOeil(T), h = humeur(T, HUMEURS_LOT), yv = P.y + flotte(T, 4);
  const g = regard().pupille(T, P.x, yv, h.r);
  return { x: P.x, y: P.y, yv, s: P.s, h, g, ouvert: cligne(T) > .5 };
}
function dessineOeil(ctx, T, O) { oeil(ctx, T, { x: O.x, y: O.y, taille: O.s, humeur: O.h, regard: O.g }); }

// ================================================================ les plans
export const PLANS = Object.freeze([
  { id: 'P19', de: PB.P19[0], a: PB.P19[1], dessine: (ctx, t) => cabinet(ctx, t) },        // Kant (K01)
  { id: 'P20', de: PB.P20[0], a: PB.P20[1], dessine: (ctx, t) => cabinet(ctx, t) },        // L'impératif (K02)
  { id: 'P21', de: PB.P21[0], a: PB.P21[1], dessine: (ctx, t) => cabinet(ctx, t) },        // Les humains écrivent si mal (K03–K06)
  { id: 'P22', de: PB.P22[0], a: PB.P22[1], dessine: (ctx, t) => promesse(ctx, t) },       // La fausse promesse (K07–K09)
  { id: 'P23', de: PB.P23[0], a: PB.P23[1], dessine: (ctx, t) => doigts(ctx, t) },         // Les doigts croisés (K10)
  { id: 'P24', de: PB.P24[0], a: PB.P24[1], dessine: (ctx, t) => grille(ctx, t) },         // Si tout le monde (K11–K12)
  { id: 'P25', de: PB.P25[0], a: PB.P25[1], dessine: (ctx, t) => grille(ctx, t) },         // Ne marche que si… (K13–K14)
  { id: 'P26', de: PB.P26[0], a: PB.P26[1], dessine: (ctx, t) => grille(ctx, t) },         // Appliquons ce test aux pilules (K15–K18)
  { id: 'P27', de: PB.P27[0], a: PB.P27[1], dessine: (ctx, t) => grille(ctx, t) },         // Et la rouge (K19–K21)
  { id: 'P28', de: PB.P28[0], a: PB.P28[1], dessine: (ctx, t) => partage(ctx, t) },        // Deux foules (K22)
  { id: 'P29', de: PB.P29[0], a: PB.P29[1], dessine: (ctx, t) => partage(ctx, t) },        // Une différence (K23–K24)
  { id: 'P30', de: PB.P30[0], a: PB.P30[1], dessine: (ctx, t) => partage(ctx, t) },        // Un signal (K25–K26)
  { id: 'P31', de: PB.P31[0], a: PB.P31[1], dessine: (ctx, t) => anneauScene(ctx, t) },    // Pour sauver qui (K27–K32)
].map(p => Object.freeze(p)));

// ================================================================ le son (le vocabulaire de tools/son-pilules.cjs)
const pan = x => clamp((x - 960) / 960 * .8, -1, 1);
const r3 = t => +t.toFixed(3);
// les instants où un texte tapé au rythme de la voix fait paraître chacun de ses caractères (n(T) en marches)
function instantsTapes(n, t0, t1, pas = .004) {
  const out = []; let v = n(t0);
  for (let t = t0; t <= t1; t += pas) { const w = n(t); if (w > v) { const c = w - v; for (let k = 0; k < c; k++) out.push(t); v = w; } }
  return out;
}
const tapesA = (t0, n, cps) => [...Array(n).keys()].map(k => t0 + (k + 1) / cps);
const ticsTexte = (ts, f, g, x) => ts.map(t => ({ t: r3(t), son: 'tic', f, g, pan: pan(x) }));
const CLAIR = 3400, SOMBRE = 1900;     // le tic des lignes de Phi (LABO), plus clair que celui de Kant (CRAIE)
export const SONS = Object.freeze([
  { t: LOT.de, son: 'nappe', f: 'labo', g: .5 },
  // P19 : les fenêtres, le terminal, le calcul (un tic sec par rangée, très bas), le declic sur « Kant. »
  { t: r3(S.ouvre), son: 'souffle', d: .5, f: [600, 1500], g: .18 },
  ...ticsTexte(tapesA(S.ouvrir, [...L_OUVRIR.txt].length, 24), SOMBRE, .05, 700),
  ...[...Array(SH).keys()].map(r => ({ t: r3(lerp(S.calcul, S.kant, r / SH)), son: 'tic', f: 1200, g: .12, pan: pan(PK.x) })),
  { t: r3(S.kant), son: 'declic', g: .4, pan: pan(PK.x) },
  // P20 : la commande, puis la maxime au rythme de la voix (très douce)
  ...ticsTexte(tapesA(S.imp, [...L_IMP.txt].length, 45), SOMBRE, .04, 700),
  ...ticsTexte(instantsTapes(T => lettres('K02', T), de('K02'), finParole('K02') + .1), SOMBRE, .035, 900),
  { t: r3(de('K02') + .05), son: 'frappe', d: +(finParole('K02') - de('K02')).toFixed(2), g: .08, pan: pan(900) },
  { t: r3(S.hoche), son: 'haptique', g: .25, pan: pan(PK.x) },
  // P21 : le titre (laiton), l'analyse, la version de Phi (plus claire), la fonction
  ...ticsTexte(tapesA(S.principe, TITRE_PRINCIPE.length, 40).filter((_, k) => k % 2 === 0), 2600, .03, 500),
  { t: r3(S.siMal), son: 'souffle', d: 1.5, f: [900, 2400], g: .16 },
  { t: r3(de('K05') + .05), son: 'frappe', d: +(finParole('K05') - de('K05')).toFixed(2), g: .08, pan: pan(900) },
  ...ticsTexte(instantsTapes(T => lettres('K05', T), de('K05'), finParole('K05') + .1), CLAIR, .04, 900),
  ...ticsTexte(tapesA(S.algo, [...L_REGLE.txt].length, 24), CLAIR, .05, 600),
  // P22 : les deux qui entrent, la bulle de pensée, la parole, la pièce (son « ting » : deux notes aiguës, très courtes)
  { t: r3(S.p22), son: 'souffle', d: .7, f: [500, 1100], g: .15 },
  { t: r3(S.besoin), son: 'pop', f: 700, g: .3, pan: pan(PENSEE.x) },
  { t: r3(S.rendre), son: 'croix', g: .2, pan: pan(PENSEE.x) },
  { t: r3(S.emprunter), son: 'haptique', g: .25, pan: pan(E22.x) },
  { t: r3(S.promettant), son: 'pop', f: 900, g: .3, pan: pan(PAROLE.x + 200) },
  { t: r3(S.rembourser), son: 'souffle', d: .6, f: [1200, 2600], g: .12, pan: pan(960) },
  { t: r3(S.ting), son: 'note', f: 1760, d: .08, g: .3, pan: pan(E22.x) },
  { t: r3(S.ting + .06), son: 'note', f: 2637, d: .12, g: .3, pan: pan(E22.x) },
  // P23 : à la coupe, un silence net (la nappe à −6 dB), puis la frappe de la maxime
  { t: r3(S.p23), son: 'silence', d: .5 }, { t: r3(S.p23), son: 'nappe', f: 'labo', g: .25 },
  { t: r3(S.regle), son: 'declic', g: .25, pan: pan(960) },
  { t: r3(S.quand), son: 'frappe', d: +(finParole('K10') - S.quand).toFixed(2), g: .1, pan: pan(960) },
  ...ticsTexte(instantsTapes(N_MAX, S.quand - .2, finParole('K10') + .1), SOMBRE, .045, 960),
  { t: r3(S.fausse), son: 'souffle', d: 1.0, f: [1600, 600], g: .15 },
  // P24 : la nappe revient ; une pluie de petits hop qui montent d'un demi-ton par anneau ; l'envol des bulles ; le ✗
  { t: r3(S.p24), son: 'nappe', f: 'labo', g: .5 }, { t: r3(S.p24), son: 'souffle', d: 1.3, f: [1800, 500], g: .2 },
  ...ticsTexte(tapesA(S.tous, [...L_MAXIME.txt].length, 24), CLAIR, .04, 1500),
  ...[...Array(11).keys()].map(d => ({ t: r3(S.tous + d * .09), son: 'hop', f: Math.round(440 * Math.pow(2, d / 12)), g: .18 + .02 * d, pan: 0 })),
  { t: r3(S.plusPers), son: 'envol', d: 1.6, g: .4 },
  { t: r3(S.rien), son: 'croix', g: .5, pan: pan(1500) },
  // P25 : l'envol à l'envers ; le « ting » de la pièce, seul
  { t: r3(S.rembob), son: 'retour', d: .9, g: .35 },
  { t: r3(S.suivent + .6), son: 'note', f: 1760, d: .08, g: .28, pan: pan(650) },
  { t: r3(S.suivent + .66), son: 'note', f: 2637, d: .12, g: .28, pan: pan(650) },
  { t: r3(S.pourKant), son: 'souffle', d: 3.0, f: [500, 1300], g: .1 },
  // P26 : la commande ; « vous » saute ; la vague (des hop qui montent) ; le declic du seuil ; la vie ; la coche ; le « ? »
  ...ticsTexte(tapesA(S.pilules, [...L_BLEUE.txt].length, 24), CLAIR, .04, 1500),
  { t: r3(S.bleue + .05), son: 'hop', f: 660, g: .3, pan: pan(625) },
  ...[...Array(11).keys()].map(d => ({ t: r3(S.vague1 + .1 + d * .09), son: 'hop', f: Math.round(523 * Math.pow(2, d / 12)), g: .2, pan: 0 })),
  { t: r3(G.filter(g => g.i !== 49).map(g => g.tbleu).sort((a, b) => a - b)[49]), son: 'declic', g: .45 },
  { t: r3(S.survie), son: 'vie', d: 2.2, g: .5 },
  { t: r3(S.univ + .12), son: 'coche', g: .5, pan: pan(1600) },
  { t: r3(S.kantQ), son: 'pop', f: 1100, g: .3, pan: pan(1780) },
  // P27 : les couleurs s'éteignent ; la commande ; la rouge (des hop plus graves) ; la vie, la même ; une coche
  { t: r3(S.p27), son: 'retour', d: .6, g: .2 },
  ...ticsTexte(tapesA(S.p27 + .15, [...L_ROUGE.txt].length, 24), CLAIR, .04, 1500),
  { t: r3(S.rouge + .05), son: 'hop', f: 440, g: .3, pan: pan(625) },
  ...[...Array(11).keys()].map(d => ({ t: r3(S.vague2 + .1 + d * .09), son: 'hop', f: Math.round(330 * Math.pow(2, d / 12)), g: .2, pan: 0 })),
  { t: r3(S.meurt), son: 'vie', d: 2.2, g: .5 },
  { t: r3(S.passent + .12), son: 'coche', g: .5, pan: pan(1600) },
  // P28 : la vie des deux côtés, panoramiquée à gauche et à droite, à l'unisson
  { t: r3(S.p28 + .2), son: 'vie', d: 2.6, g: .4, pan: -.7 }, { t: r3(S.p28 + .2), son: 'vie', d: 2.6, g: .4, pan: .7 },
  { t: r3(S.diff), son: 'souffle', d: .6, f: [1400, 700], g: .12 },
  // P29 : la poussée ; un pop à chaque configuration ; une coche à chaque ✓ (le premier tour)
  { t: r3(S.p29), son: 'souffle', d: 1.2, f: [600, 1600], g: .15 },
  { t: r3(S.egoistes), son: 'tic', f: 660, g: .3 },
  ...[...Array(Math.floor((PB.P30[0] - S.boucleR) / .8) + 1).keys()].filter(n => debutConfigR(n) < PB.P30[0]).map(n => ({ t: r3(debutConfigR(n)), son: 'pop', f: [1100, 950, 800, 650][n % 4], g: .22 })),
  ...[0, 1, 2, 3].map(j => ({ t: r3(debutConfigR(j) + .35), son: 'coche', g: .4, pan: (j - 1.5) * .08 })),
  // P30 : le glissement ; les configurations ; ✓ ✓ ✗ ✗ ; sa peur, son envol, son retour ; le signal (un sonar doux : une
  // note qui descend, trois fois) ; la bulle ; la coupe sur le dos : le même silence net que pour la fausse promesse
  { t: r3(S.p30), son: 'souffle', d: 1.0, f: [1300, 700], g: .15 },
  { t: r3(S.contraire), son: 'tic', f: 660, g: .3 },
  ...[0, 1, 2, 3].map(j => ({ t: r3(debutConfigB(j)), son: 'pop', f: [1100, 950, 800, 650][j], g: .22 })),
  ...[0, 1, 2, 3].map(j => ({ t: r3(debutConfigB(j) + .25), son: j < 2 ? 'coche' : 'croix', g: .4 })),
  { t: r3(T_PEUR), son: 'peur', d: .4, g: .25 }, { t: r3(T_DIS), son: 'envol', d: .6, g: .25 }, { t: r3(S.recompose), son: 'retour', d: .8, g: .25 },
  ...REGARDES.map((c, j) => ({ t: r3(tRegard(j)), son: 'tic', f: 2200, g: .1, pan: (j % 2 ? .1 : -.1) })),
  ...[0, 1, 2].map(j => ({ t: r3(S.signal + j * .45), son: 'note', f: [988, 880, 784][j], d: .5, g: .22 })),
  { t: r3(S.coopere), son: 'pop', f: 900, g: .28 },
  { t: r3(S.dos), son: 'silence', d: .5 }, { t: r3(S.dos), son: 'nappe', f: 'labo', g: .25 },
  // P31 : la nappe revient ; un tic par sujet qui rejoint l'anneau ; le motif de quatre notes des flèches (deux fois : il
  // boucle, il reviendra) ; un clac quand la boucle se ferme ; les contours ; le texte ; « circulaire »
  { t: r3(S.p31), son: 'nappe', f: 'labo', g: .5 },
  { t: r3(S.qui), son: 'pop', f: 1000, g: .25, pan: pan(BLEU_SUIVI.cx) },
  ...ORDRE_ANNEAU.map((i, k) => ({ t: r3(departBleu(k) + 1.0), son: 'tic', f: 1800 + (k % 8) * 120, g: .07, pan: pan(anneau(k).x) })),
  { t: r3(S.ceux + .2), son: 'souffle', d: 1.4, f: [700, 1400], g: .12 },
  { t: r3(S.fleches), son: 'motif', g: .4 }, { t: r3(S.fleches + .8), son: 'motif', g: .4 },
  { t: r3(S.ferme), son: 'clac', g: .4 },
  { t: r3(S.exact), son: 'souffle', d: .9, f: [800, 1600], g: .12 },
  { t: r3(S.danger - .8), son: 'souffle', d: .8, f: [2200, 600], g: .14 }, { t: r3(S.danger), son: 'declic', g: .4 },
  ...ticsTexte(tapesA(S.plusUn, [...ANNEAU_KANT.texte.txt].length, 24), CLAIR, .05, 960),
  { t: r3(S.circ), son: 'motif', f: 'lent', g: .35 },
].sort((a, b) => a.t - b.t));

// ================================================================ pour les essais (la console)
export const ESSAI = Object.freeze({
  S, RACCORD,
  regard: T => { const c = regard().cible(T); return c && c.vous ? 'vous' : c && { x: Math.round(c.x), y: Math.round(c.y) }; },
  grille(T) {
    const out = { couleurs: {}, tend: 0, bulles: 0, envols: 0 };
    for (const g of G) { const c = couleurG(g, T).col, p = promesseG(g, T); out.couleurs[c] = (out.couleurs[c] || 0) + 1; if (p.tend) out.tend++; if (p.bulle > 0) out.bulles++; if (p.envol > 0) out.envols++; }
    return out;
  },
});
