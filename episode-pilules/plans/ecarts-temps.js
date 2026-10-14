/* ==========================================================================
   Les deux pilules, l'épisode — plans/ecarts-temps.js : le minutage du lot « ecarts »

   Les bornes des plans (EPISODE.md, « Les plans ») et les instants de chaque
   geste, calés sur leur mot par quandMot de texte.js : le jour où la voix de
   Ronan est posée, tout suit. Les seuls nombres écrits ici sont des durées de
   geste (« la boîte s'ouvre en 0,3 s »), jamais l'instant d'un mot recopié
   d'EPISODE.md. Les places de Phi, plan par plan.
   ========================================================================== */
import { REPLIQUE, quandMot, finParole } from '../texte.js';

export const BORNES = Object.freeze({
  P61: [978.4, 984.0], P62: [984.0, 1008.1], P63: [1008.1, 1022.9], P64: [1022.9, 1043.2],
  P65: [1043.2, 1051.3], P66: [1051.3, 1066.0], P67: [1066.0, 1078.4], P68: [1078.4, 1112.2],
  P69: [1112.2, 1122.4], P70: [1122.4, 1136.7], P71: [1136.7, 1160.3], P72: [1160.3, 1169.4],
});

// l'instant où la voix estimée dit ce mot (son premier caractère) ; le début de la réplique s'il manquait (et texte.js
// le dit dans la console)
export const mot = (id, m) => quandMot(id, m, REPLIQUE[id].de);
export const de = id => REPLIQUE[id].de;

export const S = Object.freeze((() => {
  const s = {};
  // ---- P61 · la devinette (sans voix) : trois lignes tapées, puis le compte à rebours jusqu'à la voix
  s.p61 = BORNES.P61[0];
  s.lignes = [s.p61 + .2, s.p61 + 1.0, s.p61 + 1.8];
  s.compteD = 3;
  s.compte = de('Q01') - s.compteD;
  // ---- P62 · genre, politique (l'écran 09, pas 0 et 1)
  s.efface = de('Q01');                       // « Les deux groupes » : la boîte s'efface
  s.femmes = mot('Q01', '43 %');
  s.hommes = mot('Q01', '32 %');
  s.pol = mot('Q02', 'Plus on se situe');      // les cinq barres, en cascade
  s.pente = s.pol + 2.1;                       // le trait qui joint leurs sommets (une fois montées)
  s.c39 = mot('Q03', '39 %');
  s.c23 = mot('Q03', '23 %');
  // ---- P63 · l'Europe à mesurer
  s.p63 = BORNES.P63[0];
  s.fenetre = s.p63 + .45;                      // la fenêtre PAYS s'ouvre pendant que la terre se pose
  s.q04 = de('Q04');
  s.finQ04 = finParole('Q04');
  // les cinq pays du script, dans son ordre, 2 s chacun, à partir de la fin de « D'un pays à l'autre : »
  s.pays = [0, 1, 2, 3, 4].map(k => s.finQ04 + .4 + 2 * k);
  // ---- P64 · tous les écarts (l'écran 10)
  s.p64 = BORNES.P64[0];
  s.ecarts = mot('Q05', 'Ces écarts');          // femmes / hommes, gauche / droite poussent
  s.desc = mot('Q05', 'la description A ou B'); // la barre de la description file
  s.c11 = mot('Q06', 'Onze');
  s.c16 = mot('Q06', 'seize');
  s.c53 = mot('Q06', 'cinquante-trois');
  // ---- P65 · les messages, floutés
  s.p65 = BORNES.P65[0];
  s.revenons = de('N01');
  s.detestent = mot('N02', 'se détestent-ils');
  s.autant = mot('N02', 'autant');
  // ---- P66 · Nietzsche
  s.p66 = BORNES.P66[0];
  s.terminal = de('N03') + .2;                  // « > ouvrir généalogie_de_la_morale »
  s.calcul = s.terminal + 1.6;                   // le portrait se calcule, rangée par rangée…
  s.nom = mot('N04', 'Nietzsche');               // … jusqu'à son nom
  s.bon = mot('N04', '« bon »');
  s.contraires = mot('N04', 'deux contraires');
  s.mauvais = mot('N04', '« mauvais »');
  s.mechant = mot('N04', '« méchant »');
  // ---- P67 · le mauvais, le méchant
  s.p67 = BORNES.P67[0];
  s.rate = mot('N05', 'celui qui rate');        // il saute… et rate
  s.trompe = mot('N05', 'qui se trompe');
  s.plaint = mot('N06', 'on le plaint');         // ses voisins s'approchent, l'un tend la main
  s.veut = mot('N07', 'veut du mal');            // la bulle de pensée
  s.blame = mot('N08', 'on le blâme');           // ses voisins s'écartent et le montrent du doigt
  // ---- P68 · bon / mauvais, bon / méchant
  s.p68 = BORNES.P68[0];
  s.rouges = de('N09');
  s.premier = mot('N09', 'premier sens');
  s.correct = mot('N10', 'le choix correct');
  s.trompes = mot('N10', 'se sont trompés');
  s.betes = mot('N11', 'un peu bêtes');
  s.regrettent = mot('N11', 'regrettent');
  s.bleus = de('N12');
  s.second = mot('N12', 'second sens');
  s.bien = mot('N12', 'le bien de tous');
  s.faute = mot('N13', 'faute morale');
  // ---- P69 · une insulte
  s.p69 = BORNES.P69[0];
  s.blament = mot('N14', 'Les bleus blâment');
  s.plaignent = mot('N14', 'les rouges plaignent');
  s.insulte = mot('N14', 'comme une insulte');
  // ---- P70 · un virus saisonnier : quatre vagues (la première, « interminable », dure jusqu'à la deuxième)
  s.p70 = BORNES.P70[0];
  s.vagues = [s.p70 + .2, mot('N15', 'refait surface'), mot('N15', 'régulièrement'), mot('N16', 'virus saisonnier')];
  s.saisonnier = mot('N16', 'saisonnier');
  // ---- P71 · avant tout, la description
  s.p71 = BORNES.P71[0];
  s.sondage = de('N17');
  s.kant = mot('N18', 'Kant');
  s.proba = mot('N18', 'probabilités');
  s.avantTout = mot('N19', 'avant tout');
  s.cause = mot('N19', 'à cause de la description');
  s.lue = mot('N19', 'lue en premier');
  // ---- P72 · de très loin
  s.p72 = BORNES.P72[0];
  s.loin = mot('N20', 'de très loin');
  s.important = mot('N20', 'le plus important');
  return s;
})());

// les places de Phi (EPISODE.md, plan par plan) : { x, y, taille }
export const OEIL = Object.freeze({
  resultats: Object.freeze({ x: 1790, y: 120, taille: 120 }),   // les écrans de Thibaut (P61–P62, P64, P72)
  carte: Object.freeze({ x: 1560, y: 84, taille: 100 }),        // la carte (OEIL_COIN de film-pilules/plans/europe.js)
  filet: Object.freeze({ x: 960, y: 90, taille: 100 }),         // au sommet du filet (P65, P68–P69)
  nietzsche: Object.freeze({ x: 1180, y: 280, taille: 180 }),   // entre les mots et la fenêtre NIETZSCHE (P66–P67)
  vagues: Object.freeze({ x: 1700, y: 120, taille: 110 }),      // en haut à droite (P70)
  colonnes: Object.freeze({ x: 960, y: 90, taille: 90 }),       // au sommet du filet des colonnes du tirage (P71)
});
