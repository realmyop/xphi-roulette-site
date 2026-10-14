/* ==========================================================================
   Les deux pilules, l'épisode — plans/resultats.js : le lot « resultats »
   P51–P60, de 756,2 à 978,4 s (12:36,2–16:18,4), répliques B01–M18.
   Partie 2 · Description B : la bleue s'effondre (dans le script : 12:30 –
   14:15) ; Les deux descriptions disent-elles la même chose ? (14:15 – 16:00).

   Ronan : « On reprend son test et ses douze écrans de résultats, avec les
   nouveaux bonshommes » ; « je veux que tu prennes les petits bonhommes que tu
   as dans le premier film de 3 minutes 20 ». Ici, les écrans 03 à 08 de
   Thibaut (mockups/resultats-pilules/index.html), dessinés par resultats.js
   (le socle : ecran(ctx, T, n, d, o)) dans le cadre des résultats (×0,81
   autour de (960, 140)), avec les bonshommes du film à cs entier ; ses pas
   tombent sur les mots (quandMot de texte.js : le jour où la voix de Ronan est
   posée, tout suit) ; l'œil de Phi à sa place des résultats (1 790, 120, 120),
   qui regarde ce dont il parle.

   Ce que le lot ajoute aux écrans de Thibaut (EPISODE.md, « Ce qui est
   nouveau ») :
   - P51 : la jauge vide de la devinette (« BLEUE ? », « ? ROUGE ») ; les deux
     descriptions en petit (×0,5) sur « légèrement différente » ; les
     POINTILLÉS DE PHI, tracés dans la jauge vide jusqu'à 65,5 % avec
     l'étiquette « A : 65,5 % » : ce qu'il attend ; le compte à rebours.
   - P52 : les pointillés restent, vides, et baissent à 20 % : la machine ne
     rature pas, son erreur reste à l'image ; le tampon tombe avant « Ah. »,
     pour que « Ah. » soit presque seul.
   - P53 : les deux titres qui pulsent sur « formulation ».
   - P54 : L'EFFET DE CADRAGE : une seule foule grise (la grille de l'écran
     01) et deux cadres laiton (quatre coins de 40 px, 520 × 340) qui glissent
     dessus ; sous le cadre A, les sujets prennent les couleurs du groupe A,
     sous le cadre B celles du groupe B : les mêmes sujets ; à la fin, chacun
     sur une moitié de la foule. L'œil, qui est un diaphragme, resserre ses
     lames sur « cadrage ».
   - P55 : la pluie de 2 235 points (un par participant du groupe B, leurs
     prédictions tirées des tables de Thibaut : donnees.js, repartition), qui se
     sépare (bleus dessus, rouges dessous) puis se condense en cent bonshommes
     (cs 2, aux places de sa page) ; chaque moyenne sur son mot ; la longue
     flèche de l'« optimisme démesuré ».
   - P56, P57 : les deux groupes (P56) et les deux camps (P57) révélés chacun
     sur son mot : l'écran est dessiné deux fois, chaque moitié avec ses
     instants (une découpe verticale), parce que sa page les montre ensemble ;
     les deux petites fenêtres A et B de « Chacun », que les deux bonshommes
     regardent.
   - P58 : la devinette (la boîte de Thibaut, 38 px), un bonhomme gris (cs 6)
     entre deux petites fenêtres A et B, son « ? » ; le compte à rebours.
   - P59, P60 : les deux mini-jauges (65,5 → 12,6) ; les cases LABO, les
     pointillés et les textes de l'écran 08 sont redessinés ici (recopiés de
     resultats.js, ecranMemeChoix) pour que « LES AUTRES : AU MOINS 1 SUR 2 SE
     TROMPE » tombe sur « c'est faux » et non trois secondes après « 21 % » ;
     sur « Les autres », un cadre GRIS autour de ceux qui n'admettent pas (le
     groupe dont parle l'étiquette : les pointillés sont la moitié d'entre
     eux) ; les bonshommes restent ceux du socle (un crochet retient le regard
     de côté jusque-là). Le « ≈ » passe par texteSignes de ../commun.js (en
     pixels).

   Repris : resultats.js (ecran, fondResultats, boite, txt, jaugeH, tampon,
   tirets, ACCORD, PRED, posJauge, GRILLE, RANG, PERM, CADRE_RESULTATS, csDe,
   PHI) ; commun.js (fenetreDescription, compteARebours, trotteuses,
   devinette, coupeSujet, flechePixel, dessineSujet, oeil, creeRegard) ;
   donnees.js (tous les chiffres). Recopié (non exporté) : resultats.js,
   sautJauge, partJauge, envolJauge, sautChoix et les cases et les textes
   d'ecranMemeChoix ; le compte de la boîte de Thibaut (boite).

   Aucun chiffre n'est écrit ici : tous viennent de donnees.js (avec la
   précision des écrans de Thibaut ; la voix dit « 61 % » et « 51 % », l'écran
   61,8 % et 51,6 % : voir les questions pour Thibaut d'EPISODE.md).

   Raccords :
   - entrée (756,2 s) : coupe franche depuis l'écran 02 (lot tirage) : l'écran
     03, sa boîte « DESCRIPTION B », la foule grise qui arrive ;
   - sortie (978,4 s) : l'écran 08 entier, les deux panneaux (et les deux
     mini-jauges au-dessus du panneau A) ; coupe franche vers l'écran 09 (lot
     ecarts).

   Essais : index.html?plan=resultats (le lot en boucle), ?plan=P54, ?t=823.5 ;
   dans la console, (await import('./plans/resultats.js')).ESSAI : les
   instants du lot, et les changements de couleur de l'effet de cadrage.
   ========================================================================== */
import {
  W, H, CRAIE, GRIS, LABO, LAITON, BLEU, BLEU_TXT, ROUGE, ROUGE_TXT, GRIS_FIG, MONO, PIX,
  clamp, lerp, seg, cloche, eIO, eOut, eIn, eBack, hache, mix,
  oeil, creeRegard, humeur, VOUS, point, dessineSujet, PREMIERS, SH,
  fenetreDescription, compteARebours, trotteuses, devinette, coupeSujet, flechePixel, texteSignes,
} from '../commun.js';
import { REPLIQUE, quandMot, finParole, texteDe, MENTIONS, plume as plumeBoite } from '../texte.js';
import * as R from '../resultats.js';
import * as D from '../donnees.js';

export const LOT = { id: 'resultats', de: 756.2, a: 978.4 };

// les bornes des plans (EPISODE.md, « Les plans ») : les instants du lot s'y rattachent quand un plan commence sans voix
const BORNES = Object.freeze({
  P51: [756.2, 786.0], P52: [786.0, 797.8], P53: [797.8, 817.6], P54: [817.6, 829.4], P55: [829.4, 854.4],
  P56: [854.4, 875.3], P57: [875.3, 910.1], P58: [910.1, 925.1], P59: [925.1, 952.4], P60: [952.4, 978.4],
});

// ================================================================ les mots dits : les gestes tombent dessus
const mot = (id, m) => quandMot(id, m, REPLIQUE[id].de);
const de = id => REPLIQUE[id].de;

// les écrans de Thibaut : sa caméra (le cadre des résultats), la place de Phi
const CAM = R.CADRE_RESULTATS, PHI = R.PHI;
const E = (x, y) => CAM.ecran(x, y);
const monde = (ctx, fn) => { ctx.save(); CAM.applique(ctx); fn(); ctx.restore(); ctx.globalAlpha = 1; };
const fmt = (v, d = 1) => v.toFixed(d).replace('.', ',');
const fmtV = v => fmt(v, v % 1 ? 1 : 0);
const NB = ' ';
// R.txt, mais avec les signes de ../commun.js (≈ en pixels : « ≈ 80 % »)
function ecrire(ctx, s, x, y, size, col, align = 'left', a = 1, font = PIX) {
  if (a <= 0) return;
  ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  texteSignes(ctx, s, x, y);
  ctx.globalAlpha = 1;
}

// ================================================================ le minutage du lot (EPISODE.md, P51–P60)
const S = (() => {
  const s = {};
  // P51 · Devinette B : l'écran 03, pas 0 (la boîte, la foule grise et ses « ? »)
  s.p51 = BORNES.P51[0];
  s.desc = mot('B02', 'légèrement différente');           // les deux descriptions, en petit, 2 s
  s.trace = mot('B03', 'aucun effet remarquable');        // Phi trace ses pointillés jusqu'à 65,5 %
  s.traceFin = s.trace + 1.3;
  s.surs = mot('B04', 'les faits sont');                   // humeur grand : sûr de lui
  // la révélation (pas 1) au début de P52, après le compte à rebours (3,2 s, qui suit la fin de B04)
  s.reveal = BORNES.P52[0];
  s.compte = Math.max(finParole('B04'), s.reveal - 3.2);
  // P52 · la jauge monte à peine (pas 1) ; les bleus meurent (pas 2), quand la jauge a fini de monter (2,4 s)
  s.d3 = [s.p51, s.reveal, s.reveal + 2.4];
  s.tampon3 = s.d3[2] + 1.1;                               // avant « Ah. » (le socle le pose 2,4 s après le pas 2)
  s.ah = de('B05');
  s.frivoles = mot('B06', 'frivoles');                     // humeur plisse ; les rouges regardent Phi
  // P53 · Côte à côte : l'écran 04
  s.p53 = BORNES.P53[0];
  s.descA = mot('B07', 'description A');
  s.vit = mot('B07', 'tout le monde vit');                 // les témoins de A lèvent les bras
  s.descB = mot('B08', 'description B');
  s.meurent = mot('B08', 'meurent');                       // le témoin bleu de B a peur, part en caractères
  s.c53 = mot('B09', 'Cinquante-trois');                   // l'accolade, « 53 / POINTS D'ÉCART »
  s.d4 = [s.p53, s.c53 - .3];
  s.chiffre53 = s.d4[1] + 1.2;                             // le « 53 » paraît (resultats.js : seg(Tin(1), 1,2, 1,6))
  s.formulation = mot('B09', 'formulation');               // les deux titres pulsent ; humeur doute
  // P54 · un effet de cadrage
  s.p54 = BORNES.P54[0];
  s.cadreA = mot('B10', 'effet de cadrage');               // le cadre A glisse de gauche à droite
  s.cadrage = mot('B10', 'cadrage');                       // les lames se resserrent
  s.cadreB = mot('B11', 'entendu parler');                 // le cadre B glisse à son tour, sur les mêmes sujets
  s.fort = mot('B11', 'aussi fort');                       // les deux cadres s'arrêtent côte à côte
  // P55 · prédictions B : l'écran 05
  s.p55 = BORNES.P55[0];
  s.pluie = s.p55 + .2;                                    // 2 235 points tombent (2,6 s pour les départs)
  s.prevu = mot('B12', 'bien prévu');                      // le nuage se sépare…
  s.condense = s.prevu + 1.2;                              // … et se condense en bonshommes
  s.moyR = mot('B13', '11 %');                             // « ROUGES : MOYENNE 11 % »
  s.moitie = mot('B13', '2 % ou moins');                   // la moitié des rouges, cernée (son pas 2)
  s.moyB = mot('B14', '61 %');                             // « BLEUS : MOYENNE 61,8 % »
  s.optimisme = mot('B15', 'optimisme démesuré');          // la longue flèche ; les bleus lèvent les yeux
  s.d5 = [s.p55, s.prevu, s.moitie];
  // P56 · même situation ? l'écran 06 : les barres sur « la même chose », chaque groupe sur son chiffre
  s.p56 = BORNES.P56[0];
  s.barres6 = mot('M01', 'la même chose') - .3;
  s.c88 = mot('M02', '88 %'); s.c93 = mot('M02', '93 %');
  s.d6A = [s.barres6, s.c88]; s.d6B = [s.barres6, s.c93];
  s.hocheA = s.c88 + .3; s.hocheB = s.c93 + .3;
  // P57 · plus ou moins trompeuse ? l'écran 07 : chaque camp sur son chiffre ; le pas 2 (groupe B) sans voix, après « Chacun »
  s.p57 = BORNES.P57[0];
  s.choisie = mot('M04', 'pilule choisie');                // les deux bonshommes lèvent les yeux vers leur barre
  s.c51 = mot('M05', '51 %'); s.c57 = mot('M06', '57 %');
  s.chacun = mot('M07', 'Chacun');                         // les deux petites fenêtres ; les têtes tournent
  s.pas2 = s.chacun + 1.5;
  s.d7b = [s.p57, s.c51, s.pas2]; s.d7r = [s.p57, s.c57, s.pas2];
  // P58 · devinette : le même choix ?
  s.p58 = BORNES.P58[0];
  s.compte8 = finParole('M08'); s.compte8d = Math.max(.5, de('M09') - s.compte8);
  s.comparer = mot('M09', 'je peux comparer');             // la boîte et le bonhomme s'effacent ; humeur grand
  // P59–P60 · l'écran 08 : ses six pas. M09 et M12 débordent sur P59 et P60 : les deux panneaux tombent sur leurs mots
  s.panneauA = Math.max(BORNES.P59[0], mot('M09', 'la réalité'));   // « … à la réalité de mon test » : le groupe A
  s.c655 = mot('M10', '65,5 %'); s.c126 = mot('M10', '12,6 %');   // les deux mini-jauges
  s.huit = mot('M11', 'huit bleus');
  s.c70 = mot('M12', '70 %');
  s.panneauB = mot('M13', 'autre sens');                   // « Qu'en est-il dans l'autre sens ? » : le groupe B
  s.six = mot('M14', 'six rouges');
  s.c21 = mot('M15', '21 %');
  s.autres = mot('M16', 'Les autres');                     // le cadre GRIS de ceux qui n'admettent pas
  s.illusion = mot('M17', 'c’est faux') + .1;              // les pointillés, « LES AUTRES : AU MOINS 1 SUR 2… », les regards de côté
  s.etiquette = [s.illusion + .2, s.illusion + .6];        // l'étiquette, posée pendant « c'est faux », avant « Les humains »
  s.illusions = mot('M18', 'illusions');                   // Phi vous regarde, les paupières plissées
  // les sauts commencent sur le mot (resultats.js : sautChoix(d, 0) = d + 0,425) ; les cases aussi (d + 0,2)
  s.d8 = [s.panneauA, s.huit - .4, s.c70 - .2, s.panneauB, s.six - .4, s.c21 - .2];
  return Object.freeze(s);
})();

// ================================================================ les géométries (coordonnées de Thibaut, sauf mention)
// l'écran 03 : la jauge (jaugeH, x 390, y 830, 1 140 px, 22 px d'épaisseur), ce qu'attend Phi (65,5 %)
const JX = 390, JY = 830, JW = 1140, JE = 22, PCT_A = D.CHOIX.A.pct, PCT_B = D.CHOIX.B.pct;
const J65 = JX + JW * PCT_A / 100;
// la boîte de la devinette B (resultats.js : ecranJauge, boite(960, 160, …)) : sa hauteur, pour le compte à rebours dessous
const LIGNES_B = [['DESCRIPTION B', 26], ['Mêmes pilules, même règle.', 38], ['Quelle part a pris la bleue ?', 38]];
const H_BOITE_B = LIGNES_B.reduce((a, [, z]) => a + z * 1.38, 0) + 34;
// resultats.js (non exporté) : l'instant du saut de la figure i à l'écran 03, sa part bleue, son départ en caractères
const sautJauge = (d1, i) => d1 + .2 + R.RANG[1][i] * .021 + .125;
function partJauge(g, i) { const F = D.FIGURES[g], r = R.RANG[0][i]; return r < F.bleus ? 1 : F.part > 0 && r === F.bleus ? F.part : 0; }
const envolJauge = (d2, i) => d2 + .5 + R.R2[i] * .9;
const BLEUS_B = Object.freeze([...Array(100).keys()].filter(i => partJauge('B', i) > 0));
const DERNIER_ENVOL = Math.max(...BLEUS_B.map(i => envolJauge(S.d3[2], i)));
const premierEnvol = Math.min(...BLEUS_B.map(i => envolJauge(S.d3[2], i)));
const posJ = i => { const [x, y] = R.posJauge(i); return E(x, y); };
// l'écran 04 (resultats.js : ecranEcart) : le haut des barres, l'écart, les titres
const E4 = { yb: 900, bh: 600, xa: 760, xb: 1160 };
const yBarre4 = pct => E4.yb - E4.bh * pct / 100;

// ================================================================ P51–P52 · l'écran 03 : devinette B, la jauge monte à peine
// les pointillés de Phi : le contour de ce qu'il attend (de 0 à 65,5 % de la jauge), tracé au fil de k (0..1)
// (le contour passe 6 px autour de la jauge : sur le fond, il reste visible quand la jauge se remplit de rouge)
const TM = 6;
const TRACE = Object.freeze([[JX - TM, JY - TM], [J65 + TM, JY - TM], [J65 + TM, JY + JE + TM], [JX - TM, JY + JE + TM], [JX - TM, JY - TM]]);
const LONGUEURS = TRACE.slice(1).map((p, i) => Math.hypot(p[0] - TRACE[i][0], p[1] - TRACE[i][1]));
const L_TRACE = LONGUEURS.reduce((a, b) => a + b, 0);
function pointeTrace(k) {
  let reste = clamp(k) * L_TRACE;
  for (let i = 0; i < LONGUEURS.length; i++) {
    if (reste <= LONGUEURS[i] || i === LONGUEURS.length - 1) { const u = LONGUEURS[i] ? clamp(reste / LONGUEURS[i]) : 1; return [lerp(TRACE[i][0], TRACE[i + 1][0], u), lerp(TRACE[i][1], TRACE[i + 1][1], u), i]; }
    reste -= LONGUEURS[i];
  }
  return [JX, JY, 0];
}
// les instants où le tracé passe un coin (pour le tic des pointillés qui se posent)
const COINS_TRACE = (() => { let c = 0; return LONGUEURS.slice(0, -1).map(l => { c += l; return S.trace + (S.traceFin - S.trace) * c / L_TRACE; }); })();
function pointilles(ctx, T) {
  if (T < S.trace) return;
  const k = seg(T, S.trace, S.traceFin), a = 1 - .8 * seg(T, S.d3[1] + 2.4, S.d3[1] + 3.4);   // vides, ils baissent à 20 %
  const [px, py, n] = pointeTrace(k);
  monde(ctx, () => {
    ctx.globalAlpha = a; ctx.strokeStyle = LABO; ctx.lineWidth = 3; ctx.setLineDash([9, 7]); ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(TRACE[0][0], TRACE[0][1]);
    for (let i = 1; i <= n; i++) ctx.lineTo(TRACE[i][0], TRACE[i][1]);
    ctx.lineTo(px, py); ctx.stroke();
    // le repère des 65,5 % et l'étiquette « A : 65,5 % », sous la jauge
    const ae = a * seg(T, S.traceFin - .5, S.traceFin);
    if (ae > 0) {
      ctx.globalAlpha = ae; ctx.beginPath(); ctx.moveTo(J65, JY - 18); ctx.lineTo(J65, JY + JE + 18); ctx.stroke();
    }
    ctx.setLineDash([]);
    ecrire(ctx, `A${NB}: ${fmt(PCT_A)}${NB}%`, J65, JY + JE + 50, 24, LABO, 'center', a * seg(T, S.traceFin - .2, S.traceFin + .3), MONO);
    // la pointe qui trace : le curseur LABO de Phi
    if (k > 0 && k < 1) { ctx.globalAlpha = 1; ctx.fillStyle = LABO; ctx.fillRect(px - 5, py - 5, 10, 10); }
  });
}
// les deux descriptions, en petit (×0,8), côte à côte sous la boîte, 2 s (commun.js : fenetreDescription, la taille du
// tirage). À ×0,5, leur texte faisait 9,5 px : illisible à l'écran ; à ×0,8, 15 px, sur deux rangées de la foule
function petite(ctx, T, lettre, x, y, k, a, w = 780, h = 240, o = {}) {
  if (a <= .001) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  fenetreDescription(ctx, T, lettre, 0, 0, w, h, { a, ...o });
  ctx.restore(); ctx.globalAlpha = 1;
}
const DESC51 = Object.freeze({ y: 312, k: .8, xs: [328, 968] });   // 624 × 192 chacune, 16 px entre elles, centrées
function descriptions51(ctx, T) {
  const a = cloche(T, S.desc, S.desc + .3, S.desc + 2.0, S.desc + 2.4);
  petite(ctx, T, 'A', DESC51.xs[0], DESC51.y, DESC51.k, a);
  petite(ctx, T, 'B', DESC51.xs[1], DESC51.y, DESC51.k, a);
}
// le compte à rebours de la devinette, sous la boîte de Thibaut (sa largeur se mesure : DotGothic16)
function compte3(ctx, T) {
  if (T < S.compte - .3 || T > S.reveal + .3) return;
  let w = 0; for (const [s, z] of LIGNES_B) { ctx.font = `${z}px ${PIX}`; w = Math.max(w, ctx.measureText(s).width); }
  w += 70;
  monde(ctx, () => compteARebours(ctx, T, S.compte, S.reveal - S.compte, 960 - w / 2 + 24, 160 + H_BOITE_B + 22, w - 48));
}
// le crochet des bonshommes de l'écran 03 : sur « frivoles », les rouges regardent Phi
function sujet3(cle, e, T, info) {
  if (T >= S.frivoles && (info.role === 'rouge' || info.role === 'decimale') && e.mode !== 'saut' && !(e.dis > 0)) e.fixe = true;
  return e;
}
function scene3(ctx, T) {
  const d = S.d3;
  R.fondResultats(ctx, T, 3, d);
  // la jauge de la devinette, vide (« BLEUE ? », « ? ROUGE ») : celle du socle la remplace à la révélation
  const aj = seg(T, d[0] + .3, d[0] + .7) * (1 - seg(T, d[1], d[1] + .4));
  monde(ctx, () => R.jaugeH(ctx, JX, JY, JW, 0, 0, aj, true, true));
  R.ecran(ctx, T, 3, d, { phi: PHI, sans: ['tampon'], sujet: sujet3 });
  pointilles(ctx, T);
  monde(ctx, () => R.tampon(ctx, T, 960, 580, 'LES BLEUS MEURENT', ROUGE_TXT, 54, S.tampon3));
  descriptions51(ctx, T);
  compte3(ctx, T);
}

// ================================================================ P53 · l'écran 04 : côte à côte, 53 points
function scene4(ctx, T) {
  R.fondResultats(ctx, T, 4, S.d4);
  R.ecran(ctx, T, 4, S.d4, { phi: PHI, instants: { vie: S.vit, mort: S.meurent } });
  // sur « formulation », les deux titres sous les barres pulsent (deux fois, en LABO)
  const k = T - S.formulation;
  if (k >= 0 && k < 1.6) {
    const p = .95 * Math.max(0, Math.sin(k * Math.PI / .8));
    monde(ctx, () => { R.txt(ctx, 'DESCRIPTION A', E4.xa, E4.yb + 50, 28, LABO, 'center', p); R.txt(ctx, 'DESCRIPTION B', E4.xb, E4.yb + 50, 28, LABO, 'center', p); });
  }
}

// ================================================================ P54 · un effet de cadrage : une foule, deux cadres
// La foule grise de l'écran 01 (posJauge, cs 3) ; deux cadres de 520 × 340 (à l'écran) qui glissent dessus. Un sujet
// prend les couleurs d'un cadre quand son centre est dedans (B passe devant A) : celles de son groupe, à sa place de
// l'écran 01 (l'ordre PERM[0] de Thibaut : 65 bleus et un moitié bleu ; 12 bleus et un à 60 %), les mêmes sujets.
const CADRE = Object.freeze({ w: 520, h: 340, coin: 40, yc: Math.round(E(960, 574).y) });
// le centre (x, à l'écran) et l'alpha de chaque cadre à l'instant T ; null avant qu'il paraisse
function cadres(T) {
  const out = { A: null, B: null };
  if (T >= S.cadreA) {
    let x = lerp(200, 960, eIO(seg(T, S.cadreA, S.cadreA + 2.6)));        // de gauche à droite, jusqu'au milieu
    x = lerp(x, 695, eIO(seg(T, S.cadreB, S.cadreB + 1.4)));               // il laisse la place à B : la moitié gauche
    out.A = { x, a: seg(T, S.cadreA, S.cadreA + .35) };
  }
  if (T >= S.cadreB) {
    let x = lerp(1720, 960, eIO(seg(T, S.cadreB, S.cadreB + 2.4)));       // de droite à gauche, sur les mêmes sujets
    x = lerp(x, 1225, eIO(seg(T, S.fort, S.fort + 1.0)));                  // côte à côte : la moitié droite
    out.B = { x, a: seg(T, S.cadreB, S.cadreB + .35) };
  }
  return out;
}
const dansCadre = (c, x) => c && x >= c.x - CADRE.w / 2 && x <= c.x + CADRE.w / 2;
const zoneSous = (C, i) => { const x = posJ(i).x; return dansCadre(C.B, x) ? 'B' : dansCadre(C.A, x) ? 'A' : null; };
// la couleur d'un sujet sous un cadre : { col, fb } (fb : la part bleue du sujet de deux couleurs)
const teinteCadre = (z, i) => { if (!z) return { col: GRIS_FIG, fb: 0 }; const fb = partJauge(z, i); return { col: fb >= .5 ? BLEU : ROUGE, fb }; };
// les changements de zone de chaque sujet, calculés une fois (une mémoire de calcul : un pas de 5 ms sur tout le plan)
const CHANGEMENTS = (() => {
  const out = [...Array(100)].map(() => []), pas = .005;
  const prec = new Array(100).fill(null);
  for (let T = BORNES.P54[0]; T <= BORNES.P54[1] + .6; T = +(T + pas).toFixed(4)) {
    const C = cadres(T);
    for (let i = 0; i < 100; i++) { const z = zoneSous(C, i); if (z !== prec[i]) { out[i].push([T, z]); prec[i] = z; } }
  }
  return Object.freeze(out.map(Object.freeze));
})();
function zoneDe(i, T) { let z = null, tc = -Infinity, avant = null; for (const [t, zz] of CHANGEMENTS[i]) { if (t > T) break; avant = z; z = zz; tc = t; } return { z, tc, avant }; }
function sceneCadrage(ctx, T) {
  R.fondResultats(ctx, T, 4, []);
  const cs = R.csDe(3);
  for (let i = 0; i < 100; i++) {
    const p = posJ(i), x = Math.round(p.x), y = Math.round(p.y), f = PREMIERS[i];
    const { z, tc, avant } = zoneDe(i, T), now = teinteCadre(z, i);
    const e = { col: now.col, phi: PHI, cible: PHI, reflet: true, a: z ? 1 : .82 };
    // un sujet qui prend une couleur saute (le saut du film : la couleur change en l'air) ; vers le gris, sans bruit
    if (z && T >= tc - .2 && T < tc + .45) { e.mode = 'saut'; e.t0 = tc; e.col = T < tc ? teinteCadre(avant, i).col : now.col; }
    if (now.fb > 0 && now.fb < 1 && e.mode !== 'saut') {
      ctx.save(); coupeSujet(ctx, x, now.fb, true, cs); dessineSujet(ctx, f, x, y, cs, { ...e, col: BLEU }, T); ctx.restore();
      ctx.save(); coupeSujet(ctx, x, now.fb, false, cs); dessineSujet(ctx, f, x, y, cs, { ...e, col: ROUGE }, T); ctx.restore();
    } else dessineSujet(ctx, f, x, y, cs, e, T);
  }
  ctx.globalAlpha = 1;
  // les deux cadres : quatre coins laiton (les crochets du N°48, en grand), leur titre au-dessus du coin gauche
  const C = cadres(T);
  [['A', C.A], ['B', C.B]].forEach(([l, c]) => {
    if (!c || c.a <= 0) return;
    const x0 = Math.round(c.x - CADRE.w / 2), y0 = CADRE.yc - CADRE.h / 2, x1 = x0 + CADRE.w, y1 = y0 + CADRE.h, b = CADRE.coin;
    ctx.globalAlpha = c.a; ctx.strokeStyle = LAITON; ctx.lineWidth = 3; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    ctx.beginPath();
    for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x1, y1, -1, -1], [x0, y1, 1, -1]]) { ctx.moveTo(x + sx * b, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * b); }
    ctx.stroke();
    ctx.font = `500 16px ${MONO}`; ctx.fillStyle = LAITON; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(`DESCRIPTION ${l}`, x0 + 2, y0 - 12);
    ctx.globalAlpha = 1;
  });
}

// ================================================================ P55 · l'écran 05 : la pluie, les deux nuages, les bonshommes
// Un point par participant du groupe B (281 bleus, 1 954 rouges : donnees.js), sa prédiction tirée des tables de Thibaut
// (repartition, ses paliers qb et qr : approx.) ; chacun rejoint la figure qui le représente (1 figure = 1 % du groupe,
// 22 personnes : les 13 bleus et 87 rouges de sa page, PRED.B de resultats.js), triés par prédiction des deux côtés.
const G5 = R.PRED.B, BASE = R.BASE, xVal = R.xVal, PB5 = D.PREDICTIONS.B;
const COLONNE = v => Math.round(v / 100 * (R.NC - 1));
const POINTS = (() => {
  const camp = (b, n, nf, id0) => D.repartition('B', b ? 'bleus' : 'rouges', n).map((v, k) => ({ v, b, fig: id0 + Math.floor(k * nf / n) }));
  const nb = G5.nb, pts = [...camp(true, D.CHOIX.B.bleue, nb, 0), ...camp(false, D.CHOIX.B.rouge, 100 - nb, nb)];
  const compte = filtre => { const m = new Map(); pts.filter(filtre).forEach(p => m.set(COLONNE(p.v), (m.get(COLONNE(p.v)) || 0) + 1)); return m; };
  const tous = compte(() => true), bl = compte(p => p.b), ro = compte(p => !p.b);
  const max = m => Math.max(...m.values());
  const haut = (m, p, h0, h1) => h0 + h1 * Math.sqrt(m.get(COLONNE(p.v)) / max(m));
  return Object.freeze(pts.map((p, k) => {
    const u1 = hache(k * 7 + 11), u2 = hache(k * 13 + 5), u3 = hache(k * 17 + 3), u4 = hache(k * 19 + 23);
    const x = xVal(p.v) + (u1 - .5) * R.PXC * 1.7;
    const tous0 = E(x, BASE - 26 - u2 * haut(tous, p, 20, 230));
    const separe = p.b ? E(x, BASE - 26 - u3 * haut(bl, p, 16, 190)) : E(x, BASE + 46 + u3 * haut(ro, p, 16, 250));
    const [fx, fy] = G5.cible(G5.items[p.fig]), fig = E(fx + (u4 - .5) * 14, fy + (u2 - .5) * 20);
    return Object.freeze({ b: p.b, tc: S.pluie + u4 * 2.6, ts: S.prevu + u1 * .25, tg: S.condense + u3 * .35, x0: tous0.x, y0: tous0.y, x1: separe.x, y1: separe.y, x2: fig.x, y2: fig.y, yh: E(0, BASE - 430).y });
  }));
})();
// l'instant où la figure j paraît : quand ses points l'ont rejointe
const APPARITION5 = Object.freeze(G5.items.map(it => S.condense + .55 + hache(it.id * 3 + 1) * .3));
function points5(ctx, T) {
  if (T < S.pluie) return;
  // trois passes : la craie (la pluie, le nuage d'avant), puis le bleu, puis le rouge ; un fillRect de 3 px par point
  for (const passe of ['craie', 'bleu', 'rouge']) {
    ctx.fillStyle = passe === 'craie' ? CRAIE : passe === 'bleu' ? BLEU : ROUGE;
    for (const p of POINTS) {
      if (T < p.tc) continue;
      const sep = seg(T, p.ts, p.ts + .8), gr = seg(T, p.tg, p.tg + .7);
      if (gr >= 1) continue;
      const colore = sep > 0;
      if ((passe === 'craie') === colore) continue;
      if (colore && (passe === 'bleu') !== p.b) continue;
      let x, y, a;
      if (!colore) { const kf = eIn(seg(T, p.tc, p.tc + .6)); x = p.x0; y = lerp(p.yh, p.y0, kf); a = .7 * (.4 + .6 * kf); }
      else if (gr <= 0) { const k = eIO(sep); x = lerp(p.x0, p.x1, k); y = lerp(p.y0, p.y1, k); a = .9; }
      else { const k = eIn(gr); x = lerp(p.x1, p.x2, k); y = lerp(p.y1, p.y2, k); a = .9 * (1 - k); }
      ctx.globalAlpha = a; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
    }
  }
  ctx.globalAlpha = 1;
}
function figures5(ctx, T) {
  const cs = R.csDe(2), haut = E(0, BASE - 330).y;
  for (const it of G5.items) {
    const ta = APPARITION5[it.id], ka = eBack(seg(T, ta, ta + .45));
    if (ka <= .01) continue;
    const [fx, fy] = G5.cible(it), p = E(fx, fy), x = Math.round(p.x), y = Math.round(p.y);
    const e = { col: it.b ? BLEU : ROUGE, phi: PHI, cible: PHI, reflet: true };
    if (it.b && T >= S.optimisme + .3) { e.fixe = true; e.cible = { x, y: haut }; }      // les bleus lèvent les yeux
    dessineSujet(ctx, PREMIERS[it.id], x, y, cs * Math.min(ka, 1.2), e, T);
  }
  ctx.globalAlpha = 1;
}
// les deux moyennes, chacune sur son mot (resultats.js : ecranPredictions, « moyennes », recopié)
function moyennes5(ctx, T) {
  const mR = PB5.moyennes.rouges, mB = PB5.moyennes.bleus, aR = seg(T, S.moyR, S.moyR + .5), aB = seg(T, S.moyB, S.moyB + .5);
  monde(ctx, () => {
    R.tirets(ctx, xVal(mR), BASE + 40, xVal(mR), BASE + 350, ROUGE_TXT, aR, 3, [4, 6]);
    R.txt(ctx, `ROUGES : MOYENNE ${fmt(mR, 0)} %`, xVal(mR) + 14, BASE + 345, 22, ROUGE_TXT, 'left', aR);
    R.tirets(ctx, xVal(mB), BASE - 14, xVal(mB), BASE - 330, BLEU_TXT, aB, 3, [4, 6]);
    R.txt(ctx, `BLEUS : MOYENNE ${fmtV(mB)} %`, xVal(mB) + 14, BASE - 335, 22, BLEU_TXT, 'left', aB);
  });
}
// « un optimisme démesuré » : une longue flèche CRAIE, du trait réel (12,6 %) à la moyenne des bleus (61,8 %)
const FLECHE5 = Object.freeze({ x0: E(xVal(PB5.reel), 0).x, x1: E(xVal(PB5.moyennes.bleus), 0).x, y: Math.round(E(0, BASE - 300).y) });
function fleche5(ctx, T) {
  const k = eOut(seg(T, S.optimisme, S.optimisme + .9));
  if (k <= 0) return;
  flechePixel(ctx, FLECHE5.x0 + 6, FLECHE5.y, FLECHE5.x1 - 6, FLECHE5.y, { col: CRAIE, lw: 3, k, c: 4 });
}
function scene5(ctx, T) {
  R.fondResultats(ctx, T, 5, S.d5);
  R.ecran(ctx, T, 5, S.d5, { phi: PHI, sans: ['figures', 'moyennes'] });
  points5(ctx, T);
  figures5(ctx, T);
  moyennes5(ctx, T);
  fleche5(ctx, T);
}

// ================================================================ P56 · l'écran 06 : même situation ?
// Sa page montre les deux groupes au même pas ; ici chacun sur son chiffre (« 88 % », « 93 % ») : l'écran est dessiné
// deux fois, la moitié gauche (le groupe A, la légende) avec les instants de A, la droite avec ceux de B. La découpe
// passe entre le « 88,1 % » de A et le témoin de B (x 1 140 à l'écran). La boîte et la légende sont là dès la coupe.
const XC6 = 1140;
const Q6 = [['« Les deux descriptions sont factuellement équivalentes. »', 30, CRAIE]];
function decoupe(ctx, x0, x1, fn) { ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, x1 - x0, H); ctx.clip(); fn(); ctx.restore(); ctx.globalAlpha = 1; }
function scene6(ctx, T) {
  R.fondResultats(ctx, T, 6, S.d6A);
  const a = seg(T, S.p56, S.p56 + .4);
  monde(ctx, () => {
    R.boite(ctx, 960, 160, Q6, a);
    R.ACCORD.forEach(([l, c], i) => {            // la légende (resultats.js : ecranMemeChose, recopié)
      const y = 560 + i * 54;
      ctx.globalAlpha = a; ctx.fillStyle = c; ctx.fillRect(110, y - 24, 30, 30); ctx.globalAlpha = 1;
      R.txt(ctx, l, 156, y, 22, CRAIE, 'left', a);
    });
  });
  const o = { phi: PHI, sans: ['boite', 'legende'], instants: { hocheA: S.hocheA, hocheB: S.hocheB } };
  decoupe(ctx, 0, XC6, () => R.ecran(ctx, T, 6, S.d6A, o));
  decoupe(ctx, XC6, W, () => R.ecran(ctx, T, 6, S.d6B, o));
}

// ================================================================ P57 · l'écran 07 : plus ou moins trompeuse ?
// Les bleus (à gauche du milieu) sur « 51 % », les rouges (à droite) sur « 57 % » : deux passes, découpées en x 960. Sur
// « Chacun », deux petites fenêtres, A en haut à gauche, B en haut à droite : le bonhomme bleu tourne la tête vers A,
// le rouge vers B ; puis, sans voix, le pas 2 de Thibaut (le groupe B), les têtes restent tournées.
const FEN7 = Object.freeze({ A: { x: 70, y: 215 }, B: { x: 1470, y: 215 }, w: 380, h: 236 });
const centreFen7 = l => ({ x: FEN7[l].x + FEN7.w / 2, y: FEN7[l].y + FEN7.h / 2 });
// une petite fenêtre de description : le titre en DotGothic16 26 px, le texte du script en 16 px (en 11 px, il ne se
// lisait pas à l'écran, pendant que la voix parle des descriptions) : six rangées de 34 caractères
const petiteFenetre = (ctx, T, l, x, y, a) => petite(ctx, T, l, x, y, 1, a, FEN7.w, FEN7.h, { taille: 16, lh: 22 });
function sujet7(cle, e, T) {
  if (T >= S.chacun + .25 && (cle === 0 || cle === 1)) { e.fixe = true; e.cible = centreFen7(cle === 0 ? 'A' : 'B'); }
  return e;
}
function scene7(ctx, T) {
  R.fondResultats(ctx, T, 7, S.d7b);
  const o = { phi: PHI, instants: { regard: S.choisie }, sujet: sujet7 };
  decoupe(ctx, 0, 960, () => R.ecran(ctx, T, 7, S.d7b, o));
  decoupe(ctx, 960, W, () => R.ecran(ctx, T, 7, S.d7r, o));
  const a = seg(T, S.chacun, S.chacun + .4);
  petiteFenetre(ctx, T, 'A', FEN7.A.x, FEN7.A.y, a);
  petiteFenetre(ctx, T, 'B', FEN7.B.x, FEN7.B.y, a);
}

// ================================================================ P58 · devinette : le même choix ?
// La boîte de Thibaut (DotGothic16 38 px, dans le cadre des résultats) ; dessous, un bonhomme gris (cs 6) entre deux
// petites fenêtres A et B qui se font face ; il regarde l'une, puis l'autre, un « ? » au-dessus de la tête.
const Q8 = 'Auriez-vous fait le même choix avec l’autre description ?';
const DEV8 = Object.freeze({ y: 230, sujet: { x: 960, y: 560, cs: 6 }, A: { x: 380, y: 472 }, B: { x: 1160, y: 472 } });
const hesite8 = T => Math.floor((T - S.p58 - .8) / 1.15) % 2;      // 0 : il regarde A ; 1 : B
function sceneDevinette8(ctx, T) {
  R.fondResultats(ctx, T, 8, []);
  const out = 1 - seg(T, S.comparer, S.comparer + .5);
  monde(ctx, () => devinette(ctx, T, { lignes: [[Q8, 38, CRAIE]], cx: 960, y: DEV8.y, t0: S.p58, a: out, compte: { t0: S.compte8, d: S.compte8d } }));
  const a = seg(T, S.p58 + .3, S.p58 + .8) * out;
  if (a <= .001) return;
  petiteFenetre(ctx, T, 'A', DEV8.A.x, DEV8.A.y, a);
  petiteFenetre(ctx, T, 'B', DEV8.B.x, DEV8.B.y, a);
  const { x, y, cs } = DEV8.sujet, h = hesite8(T);
  const vers = h ? { x: DEV8.B.x + FEN7.w / 2, y: DEV8.B.y + FEN7.h / 2 } : { x: DEV8.A.x + FEN7.w / 2, y: DEV8.A.y + FEN7.h / 2 };
  dessineSujet(ctx, PREMIERS[30], x, y, cs, { col: GRIS_FIG, a: .9 * a, phi: PHI, cible: vers, fixe: T >= S.p58 + .8, reflet: true }, T);
  ecrire(ctx, '?', x, y - SH * cs / 2 - 14, 40, GRIS, 'center', a * (.55 + .4 * Math.sin(T * 3)));
}

// ================================================================ P59–P60 · l'écran 08 : auriez-vous fait le même choix ?
// Les bonshommes sont ceux du socle (ecranMemeChoix) ; ses cases, ses pointillés et ses textes sont recopiés ici pour
// que chacun tombe sur son mot ; les deux mini-jauges (65,5 → 12,6) au-dessus du panneau A.
const MC = D.FIGURES.memeChoix, MCD = D.MEME_CHOIX.deduits;
const PANNEAUX = Object.freeze([
  { g: 'A', cx: 540, de: BLEU, vers: ROUGE, tit: 'GROUPE A · ONT PRIS LA BLEUE', tc: BLEU_TXT, n: MC.A.changent, adm: MC.A.admettent, s0: 0, p: 1,
    l1: `≈ ${MCD.A} % AURAIENT PRIS LA ROUGE`, l1b: 'AVEC LA DESCRIPTION B', l2: `${D.MEME_CHOIX.A.admettent} % L’ADMETTENT` },
  { g: 'B', cx: 1380, de: ROUGE, vers: BLEU, tit: 'GROUPE B · ONT PRIS LA ROUGE', tc: ROUGE_TXT, n: MC.B.changent, adm: MC.B.admettent, s0: 3, p: 2,
    l1: `≈ ${MCD.B} % AURAIENT PRIS LA BLEUE`, l1b: 'AVEC LA DESCRIPTION A', l2: `${D.MEME_CHOIX.B.admettent} % L’ADMETTENT`,
    l3: `LES AUTRES : AU MOINS 1 SUR ${Math.ceil(100 / MCD.moitieB)} SE TROMPE` },   // M16–M17 (donnees.js : moitieB)
].map(Object.freeze));
const sautChoix = (d1, r) => d1 + .3 + r * .025 + .125;           // resultats.js (non exporté)
// les cases : ceux qui l'admettent en LABO (au pas 2 du panneau) ; les autres, ceux qui n'admettent pas, dans un cadre
// GRIS (sur « Les autres ») ; parmi eux, ceux qui ont changé de pilule passent aux pointillés (sur « c'est faux ») : ils
// s'illusionnent — resultats.js : ecranMemeChoix, recopié avec l'instant des pointillés, et le cadre GRIS en plus
function cases8(ctx, T) {
  monde(ctx, () => PANNEAUX.forEach(pn => {
    const t2 = T - S.d8[pn.s0 + 2], rang = R.RANG[pn.p];
    for (let i = 0; i < 100; i++) {
      const [x, y] = R.GRILLE(pn.cx, i), r = rang[i];
      if (r < pn.adm) {
        const k = seg(t2, .2 + r * .02, .5 + r * .02); if (k <= 0) continue;
        ctx.globalAlpha = .3 * k; ctx.fillStyle = LABO; ctx.fillRect(x - 19, y - 21, 38, 42);
        ctx.globalAlpha = k; ctx.strokeStyle = LABO; ctx.lineWidth = 2; ctx.strokeRect(x - 19, y - 21, 38, 42); ctx.globalAlpha = 1;
      } else if (pn.l3) {
        const ka = seg(T, S.autres + (r - pn.adm) * .01, S.autres + .3 + (r - pn.adm) * .01);
        const k = r < pn.n ? seg(T, S.illusion + (r - pn.adm) * .02, S.illusion + .3 + (r - pn.adm) * .02) : 0;
        if (ka * (1 - k) > 0) {
          ctx.globalAlpha = .55 * ka * (1 - k); ctx.strokeStyle = GRIS; ctx.lineWidth = 2;
          ctx.strokeRect(x - 19, y - 21, 38, 42); ctx.globalAlpha = 1;
        }
        if (k <= 0) continue;
        ctx.globalAlpha = k * (.65 + .35 * Math.sin(T * 4 + i)); ctx.strokeStyle = CRAIE; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
        ctx.strokeRect(x - 19, y - 21, 38, 42); ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
    }
  }));
}
function textes8(ctx, T) {
  monde(ctx, () => PANNEAUX.forEach(pn => {
    const t0 = T - S.d8[pn.s0], t1 = T - S.d8[pn.s0 + 1], t2 = T - S.d8[pn.s0 + 2];
    if (t0 < 0) return;
    ecrire(ctx, pn.tit, pn.cx, 300, 26, pn.tc, 'center', seg(t0, 0, .4));
    ecrire(ctx, pn.l1, pn.cx, 846, 26, mix(pn.vers, CRAIE, .25), 'center', seg(t1, 2.0, 2.5));
    ecrire(ctx, pn.l1b, pn.cx, 880, 20, GRIS, 'center', seg(t1, 2.2, 2.7));
    ecrire(ctx, pn.l2, pn.cx, 938, 30, LABO, 'center', seg(t2, .8, 1.3));
    if (pn.l3) ecrire(ctx, pn.l3, pn.cx, 982, 30, CRAIE, 'center', seg(T, S.etiquette[0], S.etiquette[1]));
  }));
}
// le crochet des bonshommes de l'écran 08 : ceux qui s'illusionnent ne regardent ailleurs qu'à partir de « c'est faux »
// (le socle les détourne 1,8 s après le pas 5)
function sujet8(cle, e, T, info) {
  if (info.panneau === 'B' && info.role === 'change' && e.mode !== 'saut') {
    const r = R.RANG[2][cle], adm = MC.B.admettent;
    if (r >= adm && T < S.illusion + .2 + (r - adm) * .02) { delete e.p; e.reflet = true; }
  }
  return e;
}
// les deux mini-jauges, au-dessus du panneau A (à l'écran) : « A 65,5 % », « B 12,6 % », une flèche de l'une à l'autre
const MINI = Object.freeze({ x: 470, w: 300, ys: [170, 218], h: 12 });
function miniJauges(ctx, T) {
  const lignes = [['A', PCT_A, S.c655], ['B', PCT_B, S.c126]];
  lignes.forEach(([l, v, t], j) => {
    const a = seg(T, t - .2, t + .2); if (a <= 0) return;
    const k = eIO(seg(T, t - .1, t + .7)), y = MINI.ys[j], x = MINI.x, w = MINI.w;
    ctx.globalAlpha = a;
    ctx.fillStyle = R.PISTE; ctx.fillRect(x, y, w, MINI.h);
    ctx.fillStyle = BLEU; ctx.fillRect(x, y, Math.round(w * v / 100 * k), MINI.h);
    ctx.fillStyle = ROUGE; const wr = Math.round(w * (100 - v) / 100 * k); ctx.fillRect(x + w - wr, y, wr, MINI.h);
    ctx.fillStyle = CRAIE; ctx.fillRect(x + w / 2 - 1, y - 5, 2, MINI.h + 10);
    ctx.globalAlpha = 1;
    ecrire(ctx, `DESCRIPTION ${l}`, x - 14, y + 12, 18, CRAIE, 'right', a);
    ecrire(ctx, `${fmt(v)}${NB}%`, x + w + 14, y + 13, 20, BLEU_TXT, 'left', a, MONO);
  });
  const kf = eOut(seg(T, S.c126 + .5, S.c126 + 1.1));
  if (kf > 0) flechePixel(ctx, MINI.x + MINI.w * PCT_A / 100, MINI.ys[0] + MINI.h + 4, MINI.x + MINI.w * PCT_B / 100, MINI.ys[1] - 7, { col: CRAIE, lw: 2, k: kf, c: 3 });
}
function scene8(ctx, T) {
  R.fondResultats(ctx, T, 8, S.d8);
  cases8(ctx, T);
  R.ecran(ctx, T, 8, S.d8, { phi: PHI, sans: ['cases', 'textes'], sujet: sujet8 });
  textes8(ctx, T);
  miniJauges(ctx, T);
}

// ================================================================ Phi : ses humeurs, ce qu'il regarde
// (EPISODE.md, « Phi regarde » de chaque plan ; les humeurs des écrans de Thibaut, ECRANS[n].humeurs, sur les mots)
const HUMEURS_LOT = [
  [S.p51, 'curieux', .01], [S.trace, 'neutre'], [S.surs, 'grand'], [S.reveal, 'neutre'], [S.d3[2], 'grand', .3], [S.ah - .25, 'bas', .4], [S.frivoles, 'plisse'],
  [S.p53, 'neutre', .01], [S.chiffre53, 'grand'], [S.formulation, 'doute'],
  [S.p54, 'neutre', .01], [S.cadrage - .05, { r: 6 }, .25], [S.cadrage + .45, { r: 12.5 }, .35], [S.fort, 'grand'],
  [S.p55, 'neutre', .01], [S.prevu, 'curieux'], [S.moyB, 'neutre'], [S.optimisme, 'plisse'],
  [S.p56, 'neutre', .01], [S.c93, 'grand'],
  [S.p57, 'neutre', .01], [S.choisie, 'curieux'], [S.chacun, 'doute'],
  [S.p58, 'curieux', .01], [S.compte8, 'neutre'], [S.comparer, 'grand'],
  [S.panneauA, 'neutre'], [S.huit, 'curieux'], [S.c70, 'grand'],
  [S.panneauB, 'neutre'], [S.six, 'curieux'], [S.illusion - .1, 'neutre'], [S.illusions, 'plisse'],
];
// les secousses : le tampon des bleus (P52), le « 53 » (P53)
const SECOUSSES = [S.tampon3 + .05, S.chiffre53];
const secousse = T => { let s = -99; for (const t of SECOUSSES) if (T >= t) s = t; return s; };
// ce qu'il regarde : des points à l'écran, ou des fonctions de T (ce qui bouge)
const P = (x, y) => { const p = E(x, y); return point(p.x, p.y); };
const FOULE3 = P(960, 574);
const parmiFoule = T => { const i = Math.floor(hache(Math.floor(T / .9) * 31 + 7) * 100); const p = posJ(i); return point(p.x, p.y - 10); };
const pointeTraceEcran = T => { const [x, y] = pointeTrace(seg(T, S.trace, S.traceFin)); return P(x, y); };
const frontJauge = T => P(JX + JW * PCT_B / 100 * eIO(seg(T - S.d3[1], .2, 2.4)), JY + 11);
// le bleu qui part en caractères (le plus récent à partir), jusqu'au dernier caractère
const bleuQuiPart = T => {
  let best = null, tb = -Infinity;
  for (const i of BLEUS_B) { const td = envolJauge(S.d3[2], i); if (td <= T + .2 && td > tb) { tb = td; best = i; } }
  if (best === null) best = BLEUS_B[0];
  const p = posJ(best); return point(p.x, p.y - 50 * seg(T, tb, tb + 2));
};
const bordCadre = (l, cote) => T => { const c = cadres(T)[l]; return c ? point(c.x + cote * CADRE.w / 2, CADRE.yc) : null; };
const centreCadre = l => T => { const c = cadres(T)[l]; return c ? point(c.x, CADRE.yc) : null; };
const MOITIE5 = (() => { const ids = G5.items.filter(it => !it.b && it.v <= 2).map(it => it.id); const [x, y, w, h] = G5.zone(ids); return P(x + w / 2, y + h / 2); })();
const pointeFleche = T => point(lerp(FLECHE5.x0, FLECHE5.x1, eOut(seg(T, S.optimisme, S.optimisme + .9))), FLECHE5.y);
const pA6 = (D.MEME_CHOSE.A.reponses[0] + D.MEME_CHOSE.A.reponses[1]) / D.MEME_CHOSE.A.total, pB6 = (D.MEME_CHOSE.B.reponses[0] + D.MEME_CHOSE.B.reponses[1]) / D.MEME_CHOSE.B.total;
// le dernier qui saute, à l'écran 08 (panneau pn) : PERM[p][r] est le sujet de rang r
const dernierQuiSaute = pn => T => {
  const d1 = S.d8[pn.s0 + 1], r = clamp(Math.floor((T - d1 - .425) / .025), 0, pn.n - 1), i = R.PERM[pn.p][r];
  const [x, y] = R.GRILLE(pn.cx, i); return P(x, y);
};
let REGARD = null;
function regard() {
  if (REGARD) return REGARD;
  const [pA, pB] = PANNEAUX;
  const cibles = [
    // P51 : la question, les deux descriptions, les pointillés qu'elle trace, vous (très sûre d'elle), la foule pendant le silence
    [S.p51 + .3, 1.8, P(960, 240)], [S.desc + .1, .9, point(DESC51.xs[0] + 390 * DESC51.k, DESC51.y + 120 * DESC51.k)], [S.desc + 1.0, .9, point(DESC51.xs[1] + 390 * DESC51.k, DESC51.y + 120 * DESC51.k)],
    [S.trace, S.traceFin - S.trace + .1, pointeTraceEcran, .15], [S.traceFin + .1, .8, P(J65, JY + JE + 40)],
    [S.surs, 3.2, VOUS], [S.compte, S.reveal - S.compte, parmiFoule, .9],
    // P52 : la jauge qui monte, les pointillés, les bleus jusqu'au dernier caractère ; « Ah. » : vous, les yeux baissés
    [S.reveal + .2, 2.2, frontJauge, .25], [S.reveal + 2.4, .7, P(J65, JY + 11)],
    [S.d3[2], DERNIER_ENVOL + 1.6 - S.d3[2], bleuQuiPart, .25], [S.ah - .3, S.frivoles - S.ah + .3, VOUS], [S.frivoles, 1.6, FOULE3],
    // P53 : la barre A, la barre B, l'écart, les deux titres
    [S.p53 + .3, 1.2, P(E4.xa, yBarre4(PCT_A))], [S.descA, 1.4, P(E4.xa, yBarre4(PCT_A))], [S.vit, 1.2, P(E4.xa, E4.yb - 20)],
    [S.descB, 1.4, P(E4.xb, yBarre4(PCT_B))], [S.meurent, 1.3, P(E4.xb - 119, E4.yb - 30)], [S.c53, 2.6, P(1510, (yBarre4(PCT_A) + yBarre4(PCT_B)) / 2)],
    [S.formulation, .7, P(E4.xa, E4.yb + 40)], [S.formulation + .7, .8, P(E4.xb, E4.yb + 40)],
    // P54 : le bord du cadre qui avance, ce qu'il recolore ; l'un, puis l'autre ; vous sur « aussi fort »
    [S.p54 + .2, 1.4, FOULE3], [S.cadreA, 2.6, bordCadre('A', 1), .2], [S.cadreA + 2.6, S.cadreB - S.cadreA - 2.6, centreCadre('A'), .5],
    [S.cadreB, 2.4, bordCadre('B', -1), .2], [S.cadreB + 2.4, 1.0, centreCadre('A')], [S.cadreB + 3.4, 1.0, centreCadre('B')], [S.fort, 1.8, VOUS],
    // P55 : le trait réel, la pluie, les rouges près du trait, la moitié cernée ; puis les bleus, loin à droite, la flèche
    [S.p55 + .3, 1.0, P(xVal(PB5.reel), BASE - 300)], [S.pluie + .6, 2.6, P(760, BASE - 80), .6], [S.prevu, 2.4, P(560, BASE + 60)],
    [S.moyR, 2.0, P(xVal(PB5.moyennes.rouges), BASE + 120)], [S.moitie, 2.0, MOITIE5], [S.moyB, 1.8, P(xVal(PB5.moyennes.bleus), BASE - 80)],
    [S.optimisme, 1.3, pointeFleche, .2],
    // P56 : la question ; la barre A, son chiffre ; la barre B, son chiffre
    [S.p56 + .2, 1.6, P(960, 200)], [S.barres6, 1.4, P(820, 880 - 560 * pA6)], [S.c88, 1.5, P(1015, 880 - 280 * pA6)], [S.c93, 1.5, P(1535, 880 - 280 * pB6)],
    // P57 : la question ; la barre bleue, son chiffre ; la rouge, son chiffre ; les deux fenêtres ; le groupe B
    [S.p57 + .2, 1.8, P(960, 200)], [S.choisie, 1.0, P(760, 600)], [S.c51 - .3, 1.8, P(560, 465)], [S.c57 - .3, 1.8, P(1360, 720)],
    [S.chacun, .75, centreFen7('A')], [S.chacun + .75, .75, centreFen7('B')], [S.pas2, 1.0, P(960, 200)], [S.pas2 + 1.2, .9, P(560, 760)], [S.pas2 + 2.1, .9, P(1360, 480)],
    // P58 : la question ; le bonhomme qui hésite ; vous pendant le compte à rebours
    [S.p58 + .2, 1.4, P(960, 275)], [S.p58 + 1.6, S.compte8 - S.p58 - 1.6, point(DEV8.sujet.x, DEV8.sujet.y - 10), .6], [S.compte8, S.compte8d + .2, VOUS],
    [S.comparer, Math.min(2.4, S.panneauA - S.comparer), VOUS],
    // P59 : le panneau ; les mini-jauges ; le dernier qui saute ; les cases ; vous
    [S.panneauA + .1, 1.4, P(pA.cx, 290)], [S.c655 - .1, 1.0, point(MINI.x + MINI.w * PCT_A / 100, MINI.ys[0])], [S.c126 - .1, 1.4, point(MINI.x + MINI.w * PCT_B / 100, MINI.ys[1])],
    [S.huit, 2.6, dernierQuiSaute(pA), .2], [S.huit + 2.6, 1.3, P(pA.cx, 846)], [S.c70, 2.0, P(pA.cx, 557)], [S.c70 + 2.0, 3.5, VOUS],
    // P60 : le panneau de droite, les sauts, les cases, les autres, les pointillés et l'étiquette ; vous, sur « illusions »
    [S.panneauB + .05, 1.4, P(pB.cx, 290)], [S.six, 2.0, dernierQuiSaute(pB), .2], [S.six + 2.0, 1.3, P(pB.cx, 846)], [S.c21, 1.8, P(pB.cx, 557)],
    [S.autres, 1.6, P(pB.cx, 557)], [S.illusion, S.illusions - S.illusion, P(pB.cx, 600)], [S.illusions, 1.2, VOUS],
  ];
  return (REGARD = creeRegard({
    cibles: cibles.map(([t, d, c, p]) => [t, Math.max(0, d), c, p]).filter(c => c[1] > 0),
    repos: [[3, VOUS], [2, T => plumeBoite(T)]],
  }));
}
function phi(ctx, T) {
  oeil(ctx, T, { x: PHI.x, y: PHI.y, taille: PHI.taille, humeur: humeur(T, HUMEURS_LOT, 'curieux'), regard: regard(), secoue: secousse(T) });
  ctx.globalAlpha = 1;
}

// ================================================================ les plans (EPISODE.md, « Les plans »)
const avecPhi = scene => (ctx, t) => { scene(ctx, t); phi(ctx, t); };
export const PLANS = [
  { id: 'P51', de: 756.2, a: 786.0, dessine: avecPhi(scene3) },          // Devinette B (B01–B04)
  { id: 'P52', de: 786.0, a: 797.8, dessine: avecPhi(scene3) },          // La jauge monte à peine (B05–B06)
  { id: 'P53', de: 797.8, a: 817.6, dessine: avecPhi(scene4) },          // Côte à côte (B07–B09)
  { id: 'P54', de: 817.6, a: 829.4, dessine: avecPhi(sceneCadrage) },    // Un effet de cadrage (B10–B11)
  { id: 'P55', de: 829.4, a: 854.4, dessine: avecPhi(scene5) },          // Prédictions B (B12–B15)
  { id: 'P56', de: 854.4, a: 875.3, dessine: avecPhi(scene6) },          // Même situation ? (M01–M02)
  { id: 'P57', de: 875.3, a: 910.1, dessine: avecPhi(scene7) },          // Plus ou moins trompeuse ? (M03–M07)
  { id: 'P58', de: 910.1, a: 925.1, dessine: avecPhi(sceneDevinette8) }, // Devinette : le même choix ? (M08–M09)
  { id: 'P59', de: 925.1, a: 952.4, dessine: avecPhi(scene8) },          // Huit bleus sur dix (M10–M12)
  { id: 'P60', de: 952.4, a: 978.4, dessine: avecPhi(scene8) },          // Six rouges sur dix (M13–M18)
];

// ================================================================ les indices sonores (tools/son-pilules.cjs)
// f : la hauteur (tic, hop, pop : Hz) ; pour un souffle, [de, à] en Hz (1 monte, −1 descend). Les hop : un par saut, leur
// hauteur tirée par hache, placés dans la stéréo ; les pop : un par sujet qui prend une couleur, un par case LABO.
const pan = x => clamp((x - 960) / 960 * .8, -1, 1);
const r3 = t => +t.toFixed(3);
const hopsJauge = (() => [...Array(100).keys()].map(i => ({ t: r3(sautJauge(S.d3[1], i)), son: 'hop', f: 380 + hache(i * 11 + 3) * 420, g: .1, pan: pan(posJ(i).x) })))();
// (une colonne de la foule entre dans un cadre d'un coup : ses pop de même hauteur, au même instant, n'en font qu'un)
const popsCadrage = (() => {
  const m = new Map();
  CHANGEMENTS.forEach((ch, i) => ch.filter(([, z]) => z).forEach(([t, z]) => {
    const f = partJauge(z, i) >= .5 ? 1250 : 820, cle = `${r3(t)}|${f}`, p = m.get(cle);
    if (p) { p.n++; p.x += posJ(i).x; } else m.set(cle, { t: r3(t), f, n: 1, x: posJ(i).x });
  }));
  return [...m.values()].map(p => ({ t: p.t, son: 'pop', f: p.f, g: +Math.min(.16, .07 * Math.sqrt(p.n)).toFixed(3), pan: pan(p.x / p.n) }));
})();
const hopsChoix = PANNEAUX.flatMap(pn => [...Array(pn.n).keys()].map(r => { const i = R.PERM[pn.p][r], [x] = R.GRILLE(pn.cx, i); return { t: r3(sautChoix(S.d8[pn.s0 + 1], r)), son: 'hop', f: 380 + hache(i * 13 + pn.p) * 420, g: .09, pan: pan(E(x, 0).x) }; }));
const popsCases = PANNEAUX.flatMap(pn => [...Array(pn.adm).keys()].map(r => { const i = R.PERM[pn.p][r], [x] = R.GRILLE(pn.cx, i); return { t: r3(S.d8[pn.s0 + 2] + .2 + r * .02), son: 'pop', f: 1500 + hache(i * 5 + pn.p) * 300, g: .06, pan: pan(E(x, 0).x) }; }));
export const SONS = Object.freeze([
  // P51 : la salle ; les deux fenêtres ; un tic quand les pointillés se posent (chaque coin, puis l'étiquette) ; la trotteuse
  { t: S.p51, son: 'nappe', f: 'labo', g: .5 },
  { t: r3(S.desc), son: 'pop', f: 1100, g: .14, pan: -.15 }, { t: r3(S.desc + .09), son: 'pop', f: 1100, g: .14, pan: .15 },
  { t: r3(S.trace), son: 'tic', f: 3000, g: .2, pan: pan(E(JX, 0).x) },
  ...COINS_TRACE.map((t, k) => ({ t: r3(t), son: 'tic', f: 3200 + k * 150, g: .2, pan: pan(E(k ? J65 : JX, 0).x) })),
  { t: r3(S.traceFin + .1), son: 'tic', f: 2600, g: .25, pan: pan(E(J65, 0).x) },
  ...trotteuses(r3(S.compte), S.reveal - S.compte),
  // P52 : les hop (pas de declic : le trait n'est pas passé) ; la peur ; l'envol ; le tampon ; la salle baisse pour « Ah. »
  ...hopsJauge,
  { t: r3(S.d3[2]), son: 'peur', d: 1.4, g: .3 },
  { t: r3(premierEnvol), son: 'envol', d: 2.6, g: .4 },
  { t: r3(S.tampon3), son: 'tampon', g: .5 },
  { t: r3(S.tampon3 + .35), son: 'nappe', f: 'labo', g: .25 },
  // P53 : la salle revient ; les barres qui montent ; la vie, petite ; l'envol du bleu de B ; le tampon du « 53 »
  { t: S.p53, son: 'nappe', f: 'labo', g: .5 },
  { t: r3(S.p53 + .3), son: 'souffle', d: 2.0, f: 1, g: .22 },
  { t: r3(S.vit), son: 'vie', d: 1.4, g: .2 },
  { t: r3(S.meurent + .8), son: 'envol', d: 1.8, g: .25, pan: pan(E(E4.xb - 119, 0).x) },
  { t: r3(S.chiffre53), son: 'tampon', g: .42 },
  // P54 : le glissement des cadres (un souffle feutré) ; un pop par sujet qui prend une couleur ; un declic pour les lames
  { t: r3(S.cadreA), son: 'souffle', d: 2.6, f: [450, 800], g: .16, pan: -.3 },
  { t: r3(S.cadrage), son: 'declic', g: .3, pan: .7 },
  { t: r3(S.cadreB), son: 'souffle', d: 2.4, f: [800, 450], g: .16, pan: .3 },
  { t: r3(S.fort), son: 'souffle', d: 1.0, f: [500, 700], g: .1 },
  ...popsCadrage,
  // P55 : la pluie ; la séparation ; la condensation ; un tic par chiffre ; la flèche, un glissement qui monte
  { t: r3(S.pluie), son: 'grain', d: 3.2, f: 2600, g: .3 },
  { t: r3(S.prevu), son: 'souffle', d: 1.0, f: [1400, 700], g: .18 },
  { t: r3(S.condense), son: 'grain', d: 1.1, f: 1500, g: .25 },
  { t: r3(S.moyR), son: 'tic', f: 2400, g: .25, pan: pan(E(xVal(PB5.moyennes.rouges), 0).x) },
  { t: r3(S.moitie), son: 'tic', f: 2600, g: .25, pan: pan(MOITIE5.x) },
  { t: r3(S.moyB), son: 'tic', f: 2800, g: .25, pan: pan(E(xVal(PB5.moyennes.bleus), 0).x) },
  { t: r3(S.optimisme), son: 'souffle', d: 1.0, f: [500, 2600], g: .28 },
  // P56 : les barres (un souffle) ; un tic par chiffre ; un tic doux par hochement
  { t: r3(S.barres6 + .3), son: 'souffle', d: 2.0, f: 1, g: .22 },
  { t: r3(S.c88), son: 'tic', f: 2600, g: .25, pan: -.1 }, { t: r3(S.c93), son: 'tic', f: 2800, g: .25, pan: .35 },
  ...[S.hocheA, S.hocheA + 1.2].map(t => ({ t: r3(t), son: 'tic', f: 1500, g: .1, pan: pan(E(711, 0).x) })),
  ...[S.hocheB, S.hocheB + 1.2].map(t => ({ t: r3(t), son: 'tic', f: 1500, g: .1, pan: pan(E(1231, 0).x) })),
  // P57 : les barres ; un tic par chiffre ; les deux fenêtres ; un froissement quand les têtes tournent ; le groupe B
  { t: r3(S.p57 + .3), son: 'souffle', d: 2.0, f: 1, g: .22 },
  { t: r3(S.c51), son: 'tic', f: 2600, g: .25, pan: -.3 }, { t: r3(S.c57), son: 'tic', f: 2800, g: .25, pan: .3 },
  { t: r3(S.chacun), son: 'pop', f: 1100, g: .14, pan: -.6 }, { t: r3(S.chacun + .09), son: 'pop', f: 1100, g: .14, pan: .6 },
  { t: r3(S.chacun + .25), son: 'souffle', d: .3, f: [3000, 1700], g: .12 },
  { t: r3(S.pas2), son: 'souffle', d: 1.2, f: [900, 1300], g: .15 },
  { t: r3(S.pas2 + 1.2), son: 'tic', f: 2600, g: .2, pan: -.3 }, { t: r3(S.pas2 + 1.3), son: 'tic', f: 2800, g: .2, pan: .3 },
  // P58 : la trotteuse pendant le compte à rebours
  ...trotteuses(r3(S.compte8), S.compte8d),
  // P59–P60 : les hop des sauts ; un pop LABO par case ; rien pour le cadre GRIS ni pour les pointillés
  ...hopsChoix,
  ...popsCases,
].sort((a, b) => a.t - b.t));

// ================================================================ les essais (film.verifie() les appelle)
export function verifie() {
  const pb = [];
  // l'étiquette de l'écran 08 tombe sur « c'est faux » et finit de paraître avant « Les humains… » (M18) : réglée à
  // « c'est faux » + 0,9 s, elle s'écrivait sous « humains »
  if (S.etiquette[0] < mot('M17', 'c’est faux') - 1e-6 || S.etiquette[1] > de('M18') + 1e-6) {
    pb.push(`P60 : l'étiquette « ${PANNEAUX[1].l3} » paraît de ${fmt(S.etiquette[0], 2)} à ${fmt(S.etiquette[1], 2)} s, hors de « c’est faux » (${fmt(mot('M17', 'c’est faux'), 2)}) → « Les humains » (${fmt(de('M18'), 2)})`);
  }
  // les chiffres que la voix dit sont ceux des données (et de l'écran) : 65,5 % et 12,6 % (M10), 70 % (M12), 21 % (M15) ;
  // « plus de huit » (M11) et « environ six » (M14) sur dix, d'après les minimums
  const dit = (id, s) => texteDe(id).replace(/[\u00a0\u202f]/g, ' ').includes(s);
  const MCm = D.MEME_CHOIX;
  for (const [id, s] of [['M10', `${fmt(PCT_A)} %`], ['M10', `${fmt(PCT_B)} %`], ['M12', `${MCm.A.admettent} %`], ['M15', `${MCm.B.admettent} %`]]) {
    if (!dit(id, s)) pb.push(`${id} ne dit plus « ${s} », le chiffre de donnees.js`);
  }
  if (dit('M11', 'plus de huit') && !(MCm.deduits.minimumA > 80)) pb.push(`M11 dit « plus de huit bleus sur dix », le minimum est ${MCm.deduits.minimumA} %`);
  if (dit('M14', 'environ six') && Math.round(MCm.deduits.minimumB / 10) !== 6) pb.push(`M14 dit « environ six rouges sur dix », le minimum est ${MCm.deduits.minimumB} %`);
  // la mention de P59–P60 et la note de l'écran 08 de Thibaut disent d'où vient chaque chiffre déduit qu'on lit à l'écran,
  // l'étiquette comprise (la note de Thibaut s'arrêtait à « ≈ 80 % et ≈ 60 % »)
  const plat = s => String(s).replace(/[\u00a0\u202f]/g, ' ');
  for (const [qui, s] of [['la mention (texte.js, MENTIONS.deduits)', MENTIONS.deduits], ['la note de l’écran 08 (resultats.js)', R.ECRANS[8].note]]) {
    for (const f of [`≈ ${MCD.A} %`, `≈ ${MCD.B} %`, `au moins 1 sur ${Math.ceil(100 / MCD.moitieB)}`, `${MCm.B.admettent} % qui l’admettent`]) {
      if (!plat(s).includes(f)) pb.push(`${qui} ne dit pas d’où vient « ${f} »`);
    }
  }
  return pb;
}

// ================================================================ pour les essais (la console)
export const ESSAI = Object.freeze({
  instants: S,
  cadrage: T => Object.fromEntries([...Array(100).keys()].map(i => [i, zoneDe(i, T).z])),
  changements: CHANGEMENTS,
  points: POINTS.length,
});
