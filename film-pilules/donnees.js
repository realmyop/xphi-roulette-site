/* ==========================================================================
   Les deux pilules, le film — donnees.js : les CHIFFRES du film

   Depuis le 13 octobre, ce sont ceux du questionnaire de Monsieur Phi, comme
   dans le script du magazine de Thibaut (docs/pilules-script-magazine-26-min.md,
   « présentés comme s'ils venaient de la collecte Arte ») et dans ses données
   (docs/pilules-donnees-sondage.md) : les deux groupes tirés au sort, qui ne
   diffèrent que par la description lue en premier (collective = A, individuelle
   = B). Ronan : « fais les trois » (ranger, aligner le film, la présentation).
   Restent inventés, et dits comme tels à l'écran : les chiffres PAR PAYS
   (europe.js, « à mesurer » dans le script) ; et l'histoire du N°48 (son heure,
   ses relectures), le rythme de la collecte (dix jours), qui ne sont pas des
   résultats.

   Tout chiffre affiché en est dérivé (pc, nombre de commun.js pour l'écrire).
   Les données PAR PAYS sont dans europe.js (EUROPE.donnees, fabriqué et vérifié
   par tools/carte-europe.cjs) ; verifie() contrôle que les totaux concordent.

   Pour les lots : importez-le, ne le modifiez pas ; si un chiffre manque ou
   cloche, dites-le.
   ========================================================================== */

export const FICTIVES = false;   // les résultats sont ceux de Monsieur Phi ; seuls les chiffres par pays sont inventés

// ---------------------------------------------------------------- la collecte et le N°48
export const PARTICIPANTS = 4457;                        // les deux groupes : 2 222 (description A) + 2 235 (B)
// les arrivées : beaucoup le premier jour, puis de moins en moins ; la part arrivée après j jours suit 1 − e^(−j/τ),
// normée sur les 10 jours (τ = 3 : environ 29 % le J1). Seul le compteur de P13 (« J1 … J10 ») l'affiche (mise en scène).
export const COLLECTE = Object.freeze({ jours: 10, appel: 'J1, 23:00', tau: 3 });
export const N48 = Object.freeze({
  indice: 47, rang: 48,                                  // le 48e participant
  vuAppel: '23:41',                                      // P01
  description: 'individuelle',                           // tirée au sort (P10)
  test: 'erreur à la question 3, juste après une réexplication',
  ouverture: '23:44:02', valide: '23:48:19',             // l'horloge de P12
  duree: 4 * 60 + 17,                                    // 4 min 17 s
  relectures: 2,
  choix: 'bleue',                                        // caché en P12, révélé en P17
  pose: '23:49',                                         // le téléphone posé (P19)
});

// ---------------------------------------------------------------- le test de compréhension
// au moins une erreur avant de choisir (on lui réexplique, puis un autre test) : 9,4 % avec la description
// collective, 7,1 % avec l'individuelle (le script) ; 368 sur 4 457, 8,3 % (« un sur douze ») ; au moment de choisir, tous
export const TEST = Object.freeze({
  erreurs: Object.freeze({ collective: 209, individuelle: 159 }),
  compris: 4457,
});
export const ERREURS = TEST.erreurs.collective + TEST.erreurs.individuelle;   // 368

// ---------------------------------------------------------------- les choix (chaque salle compte sa propre majorité)
export const CHOIX = Object.freeze({
  collective: Object.freeze({ n: 2222, bleues: 1456 }),   // 65,5 % : plus de 50 %, tout le monde vit
  individuelle: Object.freeze({ n: 2235, bleues: 281 }),  // 12,6 % : les bleus meurent (281 personnes)
});
export const SEUIL = 50;
export const pct = (b, n) => Math.round(1000 * b / n) / 10;   // au dixième
export const BLEUE_COLL = pct(CHOIX.collective.bleues, CHOIX.collective.n);       // 65,5
export const BLEUE_INDIV = pct(CHOIX.individuelle.bleues, CHOIX.individuelle.n);  // 12,6
export const ECART = Math.round(10 * (BLEUE_COLL - BLEUE_INDIV)) / 10;            // 52,9 (65,5 − 12,6) : « −53 », « 52,9 exactement »
// dans les salles : 1 sujet = 1 % de sa salle (22 personnes : 22,2 et 22,4) ; la décimale devient un sujet de deux couleurs
export const PAR_SUJET = 22;
export const salle = bleue => ({ bleus: Math.floor(bleue + 1e-9), part: Math.round(10 * (bleue - Math.floor(bleue + 1e-9))) / 10 });
// « c'est la même chose » : les deux descriptions sont factuellement équivalentes (tout à fait ou plutôt d'accord),
// une fois l'autre montrée, après le choix : 1 959 sur 2 222 (A), 2 088 sur 2 235 (B), 4 047 en tout (« neuf sur dix »)
export const MEME_CHOSE = Object.freeze({ n: 4047, part: 90.8 });
// toutes descriptions confondues (jamais montré : cela mélange deux parties) : 1 737 bleues, 39,0 %

// ---------------------------------------------------------------- la vérification (les sous-totaux tombent sur les totaux)
export function verifie(europe = globalThis.EUROPE) {
  const pb = [], ok = (c, m) => { if (!c) pb.push(m); };
  ok(CHOIX.collective.n + CHOIX.individuelle.n === PARTICIPANTS, 'collective + individuelle ≠ participants');
  ok(TEST.compris === PARTICIPANTS, 'test : compris ≠ participants');
  ok(pct(TEST.erreurs.collective, CHOIX.collective.n) === 9.4 && pct(TEST.erreurs.individuelle, CHOIX.individuelle.n) === 7.1, 'erreurs au test ≠ 9,4 % et 7,1 %');
  ok(pct(ERREURS, PARTICIPANTS) === 8.3, 'erreurs au test ≠ 8,3 % en tout');
  ok(pct(MEME_CHOSE.n, PARTICIPANTS) === MEME_CHOSE.part, '« la même chose » ≠ 90,8 %');
  ok(BLEUE_COLL === 65.5 && BLEUE_INDIV === 12.6 && ECART === 52.9, 'les pourcentages ne font pas 65,5 / 12,6 / 52,9');
  ok(Math.round(CHOIX.collective.n / 100) === PAR_SUJET && Math.round(CHOIX.individuelle.n / 100) === PAR_SUJET, '1 sujet ≠ 22 personnes');
  if (europe && europe.donnees) {
    const t = europe.donnees.total;
    ok(t.participants === PARTICIPANTS, 'europe.js : participants ≠ 4 457');
    ok(t.collective.n === CHOIX.collective.n && t.collective.bleues === CHOIX.collective.bleues, 'europe.js : la collective ne concorde pas');
    ok(t.individuelle.n === CHOIX.individuelle.n && t.individuelle.bleues === CHOIX.individuelle.bleues, 'europe.js : l’individuelle ne concorde pas');
    ok(t.ecart === ECART, 'europe.js : l’écart de l’ensemble ≠ 52,9');
  }
  return pb;
}
