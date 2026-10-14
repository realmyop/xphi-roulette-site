/* ==========================================================================
   Les deux pilules, l'épisode — donnees.js : TOUS les chiffres du sondage

   Ronan : « Toutes les séquences du script, dans l'ordre, avec le texte de
   Thibaut tel quel pour la voix et les images qu'il indique. On reprend son
   test et ses douze écrans de résultats, avec les nouveaux bonshommes […] »

   La source : docs/pilules-donnees-sondage.md (les graphiques de la vidéo de
   Monsieur Phi, présentés dans le script de Thibaut comme ceux de la collecte
   Arte). On n'invente AUCUN chiffre : chaque valeur est recopiée de ce fichier,
   ou recalculée à partir de lui (et dite « déduite »), ou reprise des tables
   que Thibaut a relevées sur les courbes pour sa page de résultats
   (mockups/resultats-pilules/index.html, « approx. »). Les pays restent
   « à mesurer » (null), comme dans le script.

   ---------------------------------------------------------------------------
   LE STATUT DE CHAQUE CHIFFRE
   ---------------------------------------------------------------------------
   Chaque bloc porte un objet `statut` : pour chacun de ses champs, d'où vient
   la valeur (les codes de STATUTS ci-dessous ; ceux du fichier des données,
   plus trois) :
     exact        effectif lu tel qu'affiché sur le graphique        [exact]
     affiche      pourcentage écrit sur le graphique                 [affiché]
     deduit       calculé à partir des précédents                    [déduit]
     approx       lu à l'œil sur une courbe                          [approx.]
     script       absent des captures : vient du script de Thibaut ou de la
                  transcription de la vidéo (« Chiffres non présents dans les
                  captures », et les repères non marqués du § 2)
     illustration un choix de mise en scène de la page de Thibaut, pas une
                  mesure (l'issue incertaine du méta-dilemme)
     aMesurer     pas encore mesuré : null (les pays)
   statutDe(bloc, champ) le rend (le statut du bloc, '*', à défaut).

   ---------------------------------------------------------------------------
   CE QU'IL Y A (dans l'ordre du fichier des données)
   ---------------------------------------------------------------------------
   CHOIX          § 1  les deux groupes : bleue, rouge, total, pct ; ECART
   PREDICTIONS    § 2  par groupe : reel, moyennes, reperes, centiles, et les
                       tables de Thibaut (qb, qr) avec repartition(groupe, n)
   MEME_CHOSE     § 3  « factuellement équivalentes » : les cinq réponses
   CONTROLE       § 4  la question de contrôle (neutres et pas d'accord)
   TROMPEUSE      § 5  « plus ou moins trompeuse ? » : tous, et par pilule
   MEME_CHOIX     § 6  « avec l'autre description… » et ce qu'on en déduit
   GENRE          § 7  tous scénarios confondus
   POLITIQUE      § 8  tous scénarios confondus
   META           § 9  le méta-dilemme
   TEST           les erreurs au test de compréhension (9,4 %, 7,1 %)
   COLLECTE       près de 10 000 répondants ; 1 figure = 1 % d'un groupe
   ECARTS         l'échelle de l'écran 10 (11, 16, pays, 53)
   PAYS           Allemagne, Espagne, France, Italie, Pologne : à mesurer
   FIGURES        ce que les écrans de Thibaut dessinent sur cent figures
   SCENARIOS      l'écran 12 (illustration de Thibaut)
   pct, arrondi, virgule, statutDe, verifie()

   verifie() rend la liste de ce qui cloche (vide : tout va bien) : les
   sous-totaux tombent sur les totaux, les pourcentages affichés se
   recalculent (à moins d'un dixième près : les graphiques d'origine arrondissent
   ou tronquent selon le graphique), les déductions se refont, et les tables
   approximatives de Thibaut redonnent les repères du fichier.

   Pour les lots : importez, ne modifiez pas ; si un chiffre manque ou
   cloche, dites-le (on le change ici, à la source).
   ========================================================================== */

export const STATUTS = Object.freeze({
  exact: 'effectif lu tel qu’affiché sur le graphique',
  affiche: 'pourcentage écrit sur le graphique',
  deduit: 'calculé à partir des précédents',
  approx: 'lu à l’œil sur une courbe',
  script: 'absent des captures : vient du script ou de la transcription',
  illustration: 'choix de mise en scène de la page de Thibaut, pas une mesure',
  aMesurer: 'pas encore mesuré',
});

// gèle un objet et tout ce qu'il contient
const gele = o => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.values(o).forEach(gele); Object.freeze(o); } return o; };
// le pourcentage de n sur total, au dixième (65,5)
export const pct = (n, total, d = 1) => { const m = 10 ** d; return Math.round(m * 100 * n / total) / m; };
export const arrondi = (v, d = 0) => { const m = 10 ** d; return Math.round(m * v) / m; };
// « 65,5 » ; d décimales (sans décimale inutile : virgule(32, 1) → « 32 »)
export const virgule = (v, d = 1) => { const s = v.toFixed(d); return (/\.0+$/.test(s) ? s.replace(/\.0+$/, '') : s).replace('.', ','); };
export const statutDe = (bloc, champ) => (bloc && bloc.statut && (bloc.statut[champ] || bloc.statut['*'])) || null;

// ================================================================ § 1 · les choix selon la description lue en premier
// bouton A du questionnaire d'origine = la pilule bleue ; bouton B = la rouge.
// groupe A : la description A (« dilemme de base ») ; groupe B : la description B (« description alternative »).
export const CHOIX = gele({
  A: { groupe: 'A', description: 'dilemme de base', bleue: 1456, rouge: 766, total: 2222, pct: 65.5 },
  B: { groupe: 'B', description: 'description alternative', bleue: 281, rouge: 1954, total: 2235, pct: 12.6 },
  ecart: 52.9,            // 65,5 − 12,6
  ecartArrondi: 53,       // « cinquante-trois points »
  statut: { bleue: 'exact', rouge: 'exact', total: 'deduit', pct: 'affiche', ecart: 'deduit', ecartArrondi: 'deduit' },
});
export const ECART = CHOIX.ecart;

// ================================================================ § 2 · les prédictions
// « Selon vous, quel sera le pourcentage de bouton A parmi les participants ? »
// Les tables qb et qr sont celles de la page de Thibaut (scenePredictions) : des paliers [q, v] « la part q des
// répondants (triés) prédit v ou moins », relevés sur les courbes des prédictions triées. repartition() en tire n
// valeurs, comme sa fonction Q : la i-ième prend la valeur du premier palier qui dépasse (i + ½) / n.
export const PREDICTIONS = gele({
  A: {
    reel: 65.5,
    moyennes: { tous: 60.7, bleus: 80, rouges: 25 },      // « en moyenne 60,7 % » ; « ≈ 80 % » ; « ≈ 25 % »
    reperes: {
      rougesZero: 17,         // % des rouges qui prédisent 0 %
      bleusSousMoitie: 4,     // « environ 4 % » des bleus prédisent moins de 50 % : leur propre mort
      bleusCent: 10,          // « environ 10 % » des bleus prédisent 100 % (« avec beaucoup de 100 % »)
    },
    centiles: {               // [approx.] : centile → [bleus, rouges] ; un intervalle s'écrit [min, max]
      5: [[45, 50], 0], 10: [55, 0], 25: [70, 5], 50: [80, 15], 75: [90, 40], 90: [[98, 100], 60],
    },
    qb: [[.004, 0], [.008, 10], [.016, 20], [.027, 30], [.042, 40], [.06, 50], [.085, 55], [.155, 60], [.17, 65], [.2, 67], [.28, 70], [.37, 75], [.54, 80], [.59, 85], [.74, 90], [.84, 95], [.9, 98], [1.01, 100]],
    qr: [[.17, 0], [.2, 2], [.31, 5], [.455, 10], [.51, 15], [.58, 20], [.65, 25], [.71, 30], [.74, 35], [.8, 40], [.84, 50], [.86, 55], [.89, 60], [.92, 70], [.94, 75], [.96, 80], [.98, 90], [1.01, 100]],
    statut: {
      reel: 'affiche', tous: 'script', bleus: 'script', rouges: 'script',
      rougesZero: 'script', bleusSousMoitie: 'script', bleusCent: 'approx',
      centiles: 'approx', qb: 'approx', qr: 'approx',
    },
    note: 'les graphiques n’affichent pas les moyennes du groupe A (script et transcription) ; les réponses se concentrent sur les multiples de 5 et de 10',
  },
  B: {
    reel: 12.6,
    moyennes: { tous: null, bleus: 61.8, rouges: 11 },    // la voix dit « 61 % » (le script) ; l'écran montre 61,8 %
    reperes: {
      rougesZero: 38,         // « environ 38 % » des rouges prédisent 0 %
      rougesDeuxOuMoins: 50,  // « la moitié des rouges prédisent 2 % ou moins »
    },
    centiles: { 10: [25, 0], 25: [50, 0], 50: [60, 2], 75: [75, 10], 90: [85, 30] },
    qb: [[.003, 0], [.012, 5], [.03, 10], [.045, 15], [.065, 20], [.095, 25], [.12, 30], [.155, 40], [.205, 50], [.25, 51], [.31, 55], [.34, 58], [.51, 60], [.585, 65], [.6, 67], [.68, 70], [.77, 75], [.87, 80], [.93, 85], [.955, 90], [.975, 95], [1.01, 100]],
    qr: [[.38, 0], [.46, 1], [.5, 2], [.52, 3], [.53, 4], [.64, 5], [.66, 8], [.76, 10], [.78, 12], [.8, 15], [.84, 20], [.875, 25], [.9, 30], [.915, 35], [.93, 40], [.94, 45], [.95, 50], [.96, 60], [.97, 70], [.978, 80], [.985, 90], [.99, 95], [1.01, 100]],
    statut: {
      reel: 'affiche', bleus: 'affiche', rouges: 'affiche',
      rougesZero: 'approx', rougesDeuxOuMoins: 'approx',
      centiles: 'approx', qb: 'approx', qr: 'approx',
    },
    note: 'courbes normalisées par groupe ; il y a 7 fois plus de rouges que de bleus dans le groupe B',
  },
});
// n prédictions tirées des paliers (la fonction Q de Thibaut) : camp 'bleus' (qb) ou 'rouges' (qr)
export function repartition(groupe, camp, n) {
  const bp = PREDICTIONS[groupe][camp === 'bleus' ? 'qb' : 'qr'];
  return [...Array(n).keys()].map(i => { const q = (i + .5) / n; return bp.find(([e]) => q < e)[1]; });
}

// ================================================================ § 3 · « Les deux descriptions sont factuellement équivalentes »
// question posée après le choix, une fois l'autre description montrée ; les réponses, de l'accord au désaccord
export const REPONSES_ACCORD = Object.freeze(['Tout à fait d’accord', 'Plutôt d’accord', 'Neutre', 'Plutôt pas d’accord', 'Pas du tout d’accord']);
export const MEME_CHOSE = gele({
  A: { reponses: [1669, 290, 27, 135, 101], total: 2222, accord: 88.1, desaccord: 10.6 },
  B: { reponses: [1832, 256, 25, 80, 42], total: 2235, accord: 93.4, desaccord: 5.4 },
  statut: { reponses: 'exact', total: 'exact', accord: 'affiche', desaccord: 'affiche' },
  note: 'la voix dit « 88 % » et « 93 % » (le script)',
});

// ================================================================ § 4 · la question de contrôle (pour les neutres et ceux qui ne sont pas d'accord)
// « Selon vous, si l'une de ces descriptions est vraie (…), il est possible que l'autre description soit fausse (…). »
// Ceux qui répondent « non » sont en fait d'accord que les deux situations sont équivalentes (la vidéo).
export const CONTROLE = gele({
  A: { oui: 127, non: 136, total: 263, pctNon: 51.7 },
  B: { oui: 61, non: 86, total: 147, pctNon: 58.5 },
  statut: { oui: 'exact', non: 'exact', total: 'exact', pctNon: 'affiche' },
  note: 'les totaux sont exactement les neutres et les pas d’accord du § 3 (27 + 135 + 101 ; 25 + 80 + 42)',
});

// ================================================================ § 5 · « La description B est-elle plus ou moins trompeuse que la description A ? »
// dans le groupe A, le jugement porte sur la description B ; dans le groupe B, sur la description A.
// Les parts sont [plus trompeuse, ni plus ni moins, moins trompeuse] (le milieu est déduit : 100 − les deux autres).
export const REPONSES_TROMPEUSE = Object.freeze(['Beaucoup plus trompeuse', 'Un peu plus trompeuse', 'Ni plus ni moins', 'Un peu moins trompeuse', 'Beaucoup moins trompeuse']);
export const TROMPEUSE = gele({
  A: {
    juge: 'B',
    tous: { reponses: [451, 415, 610, 314, 418], total: 2208, plus: 39, moins: 33 },
    bleus: { n: 1456, plus: 51.6, ni: 27.9, moins: 20.5 },
    rouges: { n: 766, plus: 15, ni: 28.5, moins: 56.5 },
  },
  B: {
    juge: 'A',
    rouges: { n: 1954, plus: 54, ni: 31, moins: 15, lisibles: { beaucoupPlus: 432, unPeuPlus: 627, neutre: 604, beaucoupMoins: 82 } },
    bleus: { n: 281, plus: 23, ni: 34, moins: 43 },
  },
  statut: { reponses: 'exact', total: 'exact', plus: 'affiche', moins: 'affiche', ni: 'deduit', n: 'exact', lisibles: 'exact' },
  note: 'chacun juge plus trompeuse la description qui donne tort à son choix ; la voix dit « 51 % » et « 57 % » (le script)',
});

// ================================================================ § 6 · « Si on vous avait présenté la situation à travers l'AUTRE description… »
export const MEME_CHOIX = gele({
  A: { camp: 'bleus', n: 1456, auraientBleue: 440, auraientRouge: 1016, admettent: 70 },   // 1 016 = 70 % : ils l'admettent
  B: { camp: 'rouges', n: 1954, auraientBleue: 413, auraientRouge: 1541, admettent: 21 },  // 413 = 21 % : ils l'admettent
  // ce que les vrais choix permettent d'en déduire (au moins) : la bleue passe de 65,5 % à 12,6 %, donc au moins
  // (65,5 − 12,6) / 65,5 des bleus de A auraient pris la rouge (80,8 %) ; la rouge passe de 87,4 % à 34,5 %, donc au
  // moins (87,4 − 34,5) / 87,4 des rouges de B auraient pris la bleue (60,6 %). Les graphiques disent « 80 % des A
  // auraient répondu B » et « 60 % des B auraient répondu A » ; « ≈ 40 % s'illusionnent ».
  // (Le fichier des données écrit « 87,3 % » pour la rouge du groupe B : 1 954 / 2 235 = 87,4 %.)
  // Le texte de Ronan (M16–M17) : « Les autres pensent qu'ils ne se seraient pas laissé influencer […]. Pour au moins la
  // moitié d'entre eux, c'est faux. » Les autres : les rouges de B qui n'admettent pas, 1 541 / 1 954 = 78,86 % (autresB).
  // Le calcul se fait sur les effectifs, jamais sur des pourcentages arrondis : au moins 1 − (766 / 2 222) / (1 954 / 2 235)
  // = 60,569 % des rouges de B auraient pris la bleue, soit au moins 1 183,52 personnes ; 413 l'admettent (21,136 %) ; au
  // moins 1 183,52 − 413 = 770,52 se trompent (39,43 % des rouges de B, trompesB), pour une moitié des autres de
  // 1 541 / 2 = 770,5 : 50,001 % (moitieB). La moitié tient, à 0,02 personne : un aveu de plus (414) ou un rouge de plus
  // dans le groupe A (767) la font tomber sous 50 %, et le « 87,3 % » du fichier des données (au lieu de 87,4) aussi
  // (49,9 %). Sur les pourcentages arrondis, (60,6 − 21,1) / 78,9 donne 50,06 %, mais 39,4 / 78,9 donne 49,94 % : c'est
  // pourquoi autresB et trompesB gardent deux décimales. L'écran 08 l'écrit « LES AUTRES : AU MOINS 1 SUR 2 SE TROMPE ».
  // illusion (« ≈ 40 % s'illusionnent ») : l'étiquette du graphique d'origine, sur tous les rouges de B ; le film ne la
  // montre plus (le même fait, compté sur une autre base que celle de la voix).
  deduits: { A: 80, B: 60, illusion: 40, minimumA: 80.8, minimumB: 60.6, autresB: 78.86, trompesB: 39.43, moitieB: 50.00 },
  statut: { n: 'exact', auraientBleue: 'exact', auraientRouge: 'exact', admettent: 'affiche', A: 'affiche', B: 'affiche', illusion: 'affiche', minimumA: 'deduit', minimumB: 'deduit', autresB: 'deduit', trompesB: 'deduit', moitieB: 'deduit' },
  note: 'le texte dit « plus de huit bleus sur dix », « environ six rouges sur dix » et « au moins la moitié d’entre eux » (des rouges de B qui n’admettent pas)',
});

// ================================================================ § 7 · le genre (tous scénarios confondus)
// ⚠ « tous scénarios confondus » vient du graphique d'origine : d'autres variantes du questionnaire y sont comptées
// (8 045 répondants, contre 4 457 dans les groupes A et B). Le script dit « les deux groupes confondus ».
export const GENRE = gele({
  hommes: { bleue: 2107, rouge: 4379, total: 6486, pct: 32, precis: 32.5 },
  femmes: { bleue: 545, rouge: 729, total: 1274, pct: 43, precis: 42.8 },
  nonBinaires: { bleue: 121, rouge: 164, total: 285, pct: 42.5, precis: 42.5 },
  statut: { bleue: 'exact', rouge: 'exact', total: 'exact', pct: 'affiche', precis: 'deduit' },
  note: 'non binaires : pourcentage déduit (aucun affiché)',
});

// ================================================================ § 8 · l'orientation politique (tous scénarios confondus)
export const POLITIQUE = gele({
  ordre: ['tresGauche', 'plutotGauche', 'centre', 'plutotDroite', 'tresDroite'],
  tresGauche: { nom: 'Très à gauche', bleue: 1299, rouge: 2005, total: 3304, pct: 39, precis: 39.3 },
  plutotGauche: { nom: 'Plutôt à gauche', bleue: 928, rouge: 1841, total: 2769, pct: 33.5, precis: 33.5 },
  centre: { nom: 'Au centre', bleue: 155, rouge: 415, total: 570, pct: 27.2, precis: 27.2 },
  plutotDroite: { nom: 'Plutôt à droite', bleue: 116, rouge: 361, total: 477, pct: 24.3, precis: 24.3 },
  tresDroite: { nom: 'Très à droite', bleue: 29, rouge: 98, total: 127, pct: 23, precis: 22.8 },
  statut: { bleue: 'exact', rouge: 'exact', total: 'exact', pct: 'affiche', precis: 'deduit' },
  note: 'pct affiché pour les deux extrêmes ; déduit (au dixième) pour les trois autres',
});

// ================================================================ § 9 · le méta-dilemme
// « quelle description choisir pour de vrais participants ? »
export const META = gele({
  A: { expose: 'A', choisitA: 1082, choisitB: 1140, total: 2222, pctB: 51.3, pctA: 48.7 },
  B: { expose: 'B', choisitA: 670, choisitB: 1565, total: 2235, pctB: 70, pctA: 30 },
  statut: { choisitA: 'exact', choisitB: 'exact', total: 'exact', pctB: 'affiche', pctA: 'deduit' },
});

// ================================================================ absents des captures (le script, la transcription)
// au moins une erreur au test de compréhension (on réexplique, puis on repose les questions) ; au moment de choisir, tous
// ont compris. Les effectifs (209 et 159 dans le film de 3 min 20) n'en sont qu'une reconstitution : pas repris ici.
export const TEST = gele({
  erreurs: { A: 9.4, B: 7.1 },
  statut: { erreurs: 'script' },
  note: 'à confirmer par Thibaut : ces deux chiffres ne figurent pas dans les captures',
});
export const COLLECTE = gele({
  repondants: 10000,        // « près de 10 000 répondants » (le questionnaire entier)
  groupes: 4457,            // 2 222 + 2 235
  parFigure: 22,            // 1 figure = 1 % d'un groupe : 22,2 (A) et 22,4 (B) personnes
  statut: { repondants: 'script', groupes: 'deduit', parFigure: 'deduit' },
});

// ================================================================ l'échelle de tous les écarts (écran 10 de Thibaut)
// en points de part de bleue ; les nombres dits par le script (et affichés par Thibaut) ; les écarts précis à côté
export const ECARTS = gele({
  genre: { nom: 'FEMMES / HOMMES', points: 11, precis: 10.3 },       // 42,8 − 32,5 (le script : 43 − 32 = 11)
  politique: { nom: 'GAUCHE / DROITE', points: 16, precis: 16.5 },   // 39,3 − 22,8
  pays: { nom: 'D’UN PAYS À L’AUTRE', points: null, precis: null },  // [À MESURER]
  description: { nom: 'DESCRIPTION A / B', points: 53, precis: 52.9 },
  statut: { points: 'script', precis: 'deduit', pays: 'aMesurer' },
  note: '« onze points » vient de chiffres arrondis (43 − 32) : l’écart précis est 10,3 points ; les écarts de genre et de politique sont mesurés sur tous les scénarios, celui de la description sur les deux groupes',
});
// « D'un pays à l'autre : [À MESURER : Allemagne, Espagne, France, Italie, Pologne] »
export const PAYS = gele({
  liste: [
    { code: 'DE', nom: 'Allemagne', pct: null }, { code: 'ES', nom: 'Espagne', pct: null }, { code: 'FR', nom: 'France', pct: null },
    { code: 'IT', nom: 'Italie', pct: null }, { code: 'PL', nom: 'Pologne', pct: null },
  ],
  statut: { '*': 'aMesurer' },
});

// ================================================================ ce que les écrans de Thibaut dessinent sur cent figures
// 1 figure = 1 % d'un groupe. Sa page arrondit au sujet entier (66 et 13) ; l'épisode montre la décimale : 65 bleus et
// un sujet moitié bleu (65,5), 12 bleus et un sujet bleu à 60 % (12,6).
export const FIGURES = gele({
  A: { bleus: 65, part: .5, arrondi: 66 },
  B: { bleus: 12, part: .6, arrondi: 13 },
  // écran 08 : sur cent bleus de A, 81 auraient pris la rouge (le minimum, 80,8 %, arrondi au plus près : « plus de huit
  // sur dix »), 70 l'admettent ; sur cent rouges de B, 61 auraient pris la bleue (60,6 %), 21 l'admettent : parmi les 79
  // autres, les 40 qui ont changé de pilule « s'illusionnent », au moins la moitié (avec 60, la grille en montrait 39 sur
  // 79 sous « AU MOINS 1 SUR 2 SE TROMPE »)
  memeChoix: { A: { changent: 81, admettent: 70 }, B: { changent: 61, admettent: 21 } },
  statut: { '*': 'deduit' },
});

// ================================================================ l'écran 12 (deux scénarios pour cent vrais participants)
// À gauche (description A) : l'issue incertaine. La page de Thibaut fait hésiter les sujets entre 44 et 58 bleus sur
// cent : une illustration, jamais un chiffre affiché. À droite (description B) : 12,6 % appliqués à cent personnes.
export const SCENARIOS = gele({
  A: { bleusMin: 44, bleusMax: 58 },
  B: { bleus: 13, morts: 12.6 },          // « LA BLEUE PERD : ≈ 13 MORTS »
  statut: { bleusMin: 'illustration', bleusMax: 'illustration', bleus: 'deduit', morts: 'deduit' },
  note: 'le script dit « une jauge autour de 50 % » : aucune donnée ne donne 50 %',
});

// ================================================================ la vérification
export function verifie() {
  const pb = [], ok = (c, m) => { if (!c) pb.push(m); };
  const somme = a => a.reduce((s, v) => s + v, 0);
  // un pourcentage affiché se recalcule à moins d'un dixième (les graphiques arrondissent ou tronquent) ; d : sa précision
  const proche = (aff, n, total, d = 1) => Math.abs(100 * n / total - aff) < (d === 0 ? .5 : .1);
  const nom = (b, c) => `${b} : ${c}`;

  // § 1
  for (const g of ['A', 'B']) {
    const c = CHOIX[g];
    ok(c.bleue + c.rouge === c.total, nom(`choix ${g}`, 'bleue + rouge ≠ total'));
    ok(pct(c.bleue, c.total) === c.pct, nom(`choix ${g}`, `${c.pct} % ne se recalcule pas (${pct(c.bleue, c.total)})`));
  }
  ok(arrondi(CHOIX.A.pct - CHOIX.B.pct, 1) === CHOIX.ecart, 'écart ≠ 65,5 − 12,6');
  ok(Math.round(CHOIX.ecart) === CHOIX.ecartArrondi, 'écart arrondi ≠ 53');
  ok(CHOIX.A.total + CHOIX.B.total === COLLECTE.groupes, 'groupes A + B ≠ 4 457');
  ok(Math.round(CHOIX.A.total / 100) === COLLECTE.parFigure && Math.round(CHOIX.B.total / 100) === COLLECTE.parFigure, '1 figure ≠ 22 personnes');

  // § 2 : les tables de Thibaut, à l'échelle des effectifs, redonnent les repères (tolérances de lecture de courbe)
  const P = PREDICTIONS, moy = a => somme(a) / a.length, part = (a, f) => 100 * a.filter(f).length / a.length;
  ok(P.A.reel === CHOIX.A.pct && P.B.reel === CHOIX.B.pct, 'prédictions : valeur réelle ≠ choix');
  {
    const b = repartition('A', 'bleus', CHOIX.A.bleue), r = repartition('A', 'rouges', CHOIX.A.rouge);
    ok(Math.abs(moy([...b, ...r]) - P.A.moyennes.tous) < 1, 'prédictions A : la moyenne de tous ≠ 60,7 (± 1)');
    ok(Math.abs(moy(b) - P.A.moyennes.bleus) < 2, 'prédictions A : la moyenne des bleus ≠ ≈ 80');
    ok(Math.abs(moy(r) - P.A.moyennes.rouges) < 2, 'prédictions A : la moyenne des rouges ≠ ≈ 25');
    ok(Math.abs(part(r, v => v === 0) - P.A.reperes.rougesZero) < 1, 'prédictions A : la part des rouges à 0 % ≠ 17 %');
    ok(Math.abs(part(b, v => v < 50) - P.A.reperes.bleusSousMoitie) < 1, 'prédictions A : les bleus sous 50 % ≠ ≈ 4 %');
    ok(Math.abs(part(b, v => v === 100) - P.A.reperes.bleusCent) < 2, 'prédictions A : les bleus à 100 % ≠ ≈ 10 %');
  }
  {
    const b = repartition('B', 'bleus', CHOIX.B.bleue), r = repartition('B', 'rouges', CHOIX.B.rouge);
    ok(Math.abs(moy(b) - P.B.moyennes.bleus) < 1, 'prédictions B : la moyenne des bleus ≠ 61,8 (± 1)');
    ok(Math.abs(moy(r) - P.B.moyennes.rouges) < 1, 'prédictions B : la moyenne des rouges ≠ 11 (± 1)');
    ok(Math.abs(part(r, v => v === 0) - P.B.reperes.rougesZero) < 2, 'prédictions B : la part des rouges à 0 % ≠ ≈ 38 %');
    ok(Math.abs(part(r, v => v <= 2) - P.B.reperes.rougesDeuxOuMoins) < 2, 'prédictions B : la moitié des rouges ≤ 2 % ne se retrouve pas');
  }
  for (const g of ['A', 'B']) for (const k of ['qb', 'qr']) {
    const t = P[g][k];
    ok(t.every((p, i) => i === 0 || (p[0] > t[i - 1][0] && p[1] > t[i - 1][1])) && t[t.length - 1][0] > 1, `prédictions ${g} : la table ${k} n’est pas croissante ou ne couvre pas tout`);
  }

  // § 3
  for (const g of ['A', 'B']) {
    const m = MEME_CHOSE[g], r = m.reponses;
    ok(somme(r) === m.total, nom(`même chose ${g}`, 'les réponses ≠ total'));
    ok(m.total === CHOIX[g].total, nom(`même chose ${g}`, 'total ≠ effectif du groupe'));
    ok(proche(m.accord, r[0] + r[1], m.total), nom(`même chose ${g}`, `${m.accord} % d’accord ne se recalcule pas`));
    ok(proche(m.desaccord, r[3] + r[4], m.total), nom(`même chose ${g}`, `${m.desaccord} % pas d’accord ne se recalcule pas`));
  }

  // § 4
  for (const g of ['A', 'B']) {
    const c = CONTROLE[g], r = MEME_CHOSE[g].reponses;
    ok(c.oui + c.non === c.total, nom(`contrôle ${g}`, 'oui + non ≠ total'));
    ok(c.total === r[2] + r[3] + r[4], nom(`contrôle ${g}`, 'total ≠ neutres + pas d’accord du § 3'));
    ok(pct(c.non, c.total) === c.pctNon, nom(`contrôle ${g}`, `${c.pctNon} % de non ne se recalcule pas`));
  }

  // § 5
  {
    const t = TROMPEUSE.A.tous, r = t.reponses;
    ok(somme(r) === t.total, 'trompeuse A : les réponses ≠ 2 208');
    ok(proche(t.plus, r[0] + r[1], t.total, 0), 'trompeuse A : 39 % plus trompeuse ne se recalcule pas');
    ok(proche(t.moins, r[3] + r[4], t.total, 0), 'trompeuse A : 33 % moins trompeuse ne se recalcule pas');
    for (const [g, c] of [['A', 'bleus'], ['A', 'rouges'], ['B', 'rouges'], ['B', 'bleus']]) {
      const v = TROMPEUSE[g][c];
      ok(arrondi(v.plus + v.ni + v.moins, 1) === 100, `trompeuse ${g} ${c} : plus + ni + moins ≠ 100`);
      ok(v.n === CHOIX[g][c === 'bleus' ? 'bleue' : 'rouge'], `trompeuse ${g} ${c} : effectif ≠ celui du choix`);
    }
    const L = TROMPEUSE.B.rouges.lisibles, n = TROMPEUSE.B.rouges.n;
    ok(proche(TROMPEUSE.B.rouges.plus, L.beaucoupPlus + L.unPeuPlus, n, 0), 'trompeuse B rouges : 432 + 627 ne font pas 54 %');
    ok(proche(TROMPEUSE.B.rouges.ni, L.neutre, n, 0), 'trompeuse B rouges : 604 ne fait pas ≈ 31 %');
    const unPeuMoins = n - L.beaucoupPlus - L.unPeuPlus - L.neutre - L.beaucoupMoins;   // si les 1 954 ont tous répondu
    ok(unPeuMoins >= 0 && proche(TROMPEUSE.B.rouges.moins, unPeuMoins + L.beaucoupMoins, n, 0), 'trompeuse B rouges : le reste ne fait pas 15 %');
  }

  // § 6
  for (const g of ['A', 'B']) {
    const m = MEME_CHOIX[g];
    ok(m.auraientBleue + m.auraientRouge === m.n, nom(`même choix ${g}`, 'bleue + rouge ≠ effectif'));
    ok(m.n === CHOIX[g][g === 'A' ? 'bleue' : 'rouge'], nom(`même choix ${g}`, 'effectif ≠ celui du choix'));
    ok(proche(m.admettent, g === 'A' ? m.auraientRouge : m.auraientBleue, m.n, 0), nom(`même choix ${g}`, `${m.admettent} % ne se recalcule pas`));
  }
  {
    const bA = CHOIX.A.bleue / CHOIX.A.total, bB = CHOIX.B.bleue / CHOIX.B.total, rA = 1 - bA, rB = 1 - bB;
    const D = MEME_CHOIX.deduits;
    ok(arrondi(100 * (bA - bB) / bA, 1) === D.minimumA, 'même choix : le minimum A ≠ 80,8 %');
    ok(arrondi(100 * (rB - rA) / rB, 1) === D.minimumB, 'même choix : le minimum B ≠ 60,6 %');
    ok(Math.abs(D.minimumA - D.A) < 1 && Math.abs(D.minimumB - D.B) < 1, 'même choix : ≈ 80 % et ≈ 60 % loin des minimums');
    ok(Math.abs(D.B - MEME_CHOIX.B.admettent - D.illusion) <= 1, 'même choix : ≈ 40 % ≠ 60 − 21');
    // « Pour au moins la moitié d'entre eux, c'est faux » (M17) : parmi les rouges de B qui n'admettent pas
    const adm = MEME_CHOIX.B.auraientBleue / MEME_CHOIX.B.n, minB = (rB - rA) / rB, moitie = (minB - adm) / (1 - adm);
    ok(arrondi(100 * (1 - adm), 2) === D.autresB, 'même choix : les rouges de B qui n’admettent pas ≠ 78,86 %');
    ok(arrondi(100 * (minB - adm), 2) === D.trompesB, 'même choix : les rouges de B qui se trompent au moins ≠ 39,43 %');
    ok(arrondi(100 * moitie, 2) === D.moitieB, 'même choix : « au moins la moitié » ne se recalcule pas (50,00 %)');
    ok(moitie >= .5, `même choix : « au moins la moitié d’entre eux » (M17) ne tient plus (${arrondi(100 * moitie, 2)} %)`);
    ok(D.trompesB / D.autresB >= .5, 'même choix : les chiffres rangés (trompesB / autresB) ne redonnent plus la moitié');
    ok(D.minimumA > 80, 'même choix : « plus de huit bleus sur dix » (M11) : le minimum A n’est plus au-dessus de 80 %');
    // l'écran 08 : la grille montre les minimums arrondis au plus près, et ce que disent la voix et l'étiquette
    const F = FIGURES.memeChoix;
    ok(F.A.changent === Math.round(D.minimumA) && F.A.admettent === MEME_CHOIX.A.admettent
      && F.B.changent === Math.round(D.minimumB) && F.B.admettent === MEME_CHOIX.B.admettent, 'même choix : les figures de l’écran 08 ne suivent pas les données');
    ok(F.A.changent > 80, `même choix : la grille A fait sauter ${F.A.changent} bleus sur cent, la voix dit « plus de huit sur dix »`);
    ok((F.B.changent - F.B.admettent) / (100 - F.B.admettent) >= .5, `même choix : la grille B montre ${F.B.changent - F.B.admettent} pointillés sur ${100 - F.B.admettent} autres, sous « AU MOINS 1 SUR 2 »`);
  }

  // § 7 et § 8
  for (const k of ['hommes', 'femmes', 'nonBinaires']) {
    const v = GENRE[k];
    ok(v.bleue + v.rouge === v.total, `genre ${k} : bleue + rouge ≠ total`);
    ok(pct(v.bleue, v.total) === v.precis, `genre ${k} : ${v.precis} ne se recalcule pas`);
    ok(Math.abs(v.precis - v.pct) <= .5, `genre ${k} : ${v.pct} % n’arrondit pas ${v.precis}`);
  }
  ok(GENRE.hommes.total + GENRE.femmes.total + GENRE.nonBinaires.total === 8045, 'genre : les effectifs ≠ 8 045');
  for (const k of POLITIQUE.ordre) {
    const v = POLITIQUE[k];
    ok(v.bleue + v.rouge === v.total, `politique ${k} : bleue + rouge ≠ total`);
    ok(pct(v.bleue, v.total) === v.precis, `politique ${k} : ${v.precis} ne se recalcule pas`);
    ok(Math.abs(v.precis - v.pct) <= .5, `politique ${k} : ${v.pct} % n’arrondit pas ${v.precis}`);
  }
  ok(POLITIQUE.ordre.reduce((s, k) => s + POLITIQUE[k].total, 0) === 7247, 'politique : les effectifs ≠ 7 247');
  ok(POLITIQUE.ordre.every((k, i) => i === 0 || POLITIQUE[k].precis < POLITIQUE[POLITIQUE.ordre[i - 1]].precis), 'politique : la bleue ne baisse pas de la gauche à la droite');

  // l'échelle des écarts
  ok(ECARTS.genre.points === GENRE.femmes.pct - GENRE.hommes.pct, 'écarts : 11 ≠ 43 − 32');
  ok(arrondi(GENRE.femmes.precis - GENRE.hommes.precis, 1) === ECARTS.genre.precis, 'écarts : 10,3 ≠ 42,8 − 32,5');
  ok(ECARTS.politique.points === POLITIQUE.tresGauche.pct - POLITIQUE.tresDroite.pct, 'écarts : 16 ≠ 39 − 23');
  ok(arrondi(POLITIQUE.tresGauche.precis - POLITIQUE.tresDroite.precis, 1) === ECARTS.politique.precis, 'écarts : 16,5 ≠ 39,3 − 22,8');
  ok(ECARTS.description.points === CHOIX.ecartArrondi && ECARTS.description.precis === CHOIX.ecart, 'écarts : la description ≠ 53');
  ok(ECARTS.pays.points === null && PAYS.liste.every(p => p.pct === null), 'pays : un chiffre a été inventé (ils sont à mesurer)');

  // § 9
  for (const g of ['A', 'B']) {
    const m = META[g];
    ok(m.choisitA + m.choisitB === m.total, nom(`méta ${g}`, 'A + B ≠ total'));
    ok(m.total === CHOIX[g].total, nom(`méta ${g}`, 'total ≠ effectif du groupe'));
    ok(proche(m.pctB, m.choisitB, m.total, g === 'B' ? 0 : 1), nom(`méta ${g}`, `${m.pctB} % ne se recalcule pas`));
    ok(arrondi(m.pctA + m.pctB, 1) === 100, nom(`méta ${g}`, 'pctA + pctB ≠ 100'));
  }

  // les figures
  for (const g of ['A', 'B']) {
    const f = FIGURES[g];
    ok(arrondi(f.bleus + f.part, 1) === CHOIX[g].pct, `figures ${g} : bleus + part ≠ ${CHOIX[g].pct}`);
    ok(f.arrondi === Math.round(CHOIX[g].pct), `figures ${g} : l’arrondi de Thibaut ≠ ${Math.round(CHOIX[g].pct)}`);
  }
  ok(SCENARIOS.B.morts === CHOIX.B.pct && SCENARIOS.B.bleus === Math.round(CHOIX.B.pct), 'scénarios : ≈ 13 morts ≠ 12,6 % de cent');
  ok(SCENARIOS.A.bleusMin < 50 && SCENARIOS.A.bleusMax > 50, 'scénarios : l’issue incertaine ne passe pas le trait');
  return pb;
}
