/* ==========================================================================
   Les deux pilules, l'épisode — plans/fin-temps.js : le minutage du lot « fin »

   Chaque geste du lot tombe sur le mot qui le déclenche : quandMot de
   texte.js (l'instant où la boîte écrit le mot, c'est-à-dire où la voix
   estimée le dit). Le jour où la voix de Ronan est posée, texte.js change ses
   instants et tout ce qui est ici suit ; aucun nombre recopié d'EPISODE.md,
   sauf les bornes des plans (la table « Les plans ») et les durées des gestes.
   Les instants entre parenthèses sont ceux de la voix estimée (EPISODE.md).
   ========================================================================== */
import { REPLIQUE, quandMot, finMot, finParole } from '../texte.js';

// les bornes des plans (EPISODE.md, « Les plans ») ; FIN : la fin de l'épisode
export const B = Object.freeze({
  P73: 1169.4, P74: 1187.5, P75: 1217.0, P76: 1244.6, P77: 1256.8, P78: 1271.8, P79: 1293.1,
  P80: 1302.3, P81: 1320.9, P82: 1332.1, P83: 1369.0, P84: 1381.4, P85: 1385.4, FIN: 1401.4,
});
// l'instant où le mot commence à se dire (n : la n-ième occurrence) ; où il finit ; le début de la réplique ; la fin de
// sa parole (la boîte a fini de l'écrire)
export const mot = (id, m, n = 0) => quandMot(id, m, REPLIQUE[id].de, n);
export const finDe = (id, m, n = 0) => finMot(id, m, REPLIQUE[id].de, n);
export const de = id => REPLIQUE[id].de;
export const dite = id => finParole(id);

export const S = Object.freeze({
  // P73 · De vrais humains
  d01: de('D01'),
  leve: mot('D01', 'dernière question'),               // la foule lève les yeux vers Phi (1173,1)
  droit: mot('D02', 'le droit d’organiser'),           // le petit terminal : demander_autorisation (1177,6)
  balayage: mot('D02', 'cent vrais humains'),          // le balayage (1181,4)
  vraie: mot('D02', 'vraie vie'),                      // Phi devient sérieux (1184,0)
  // P74 · Vous décidez de la description
  indecis: mot('D03', 'indécise'),                      // les deux fenêtres ; le cadre du tirage hésite (1189,0)
  versVous: mot('D03', 'vers vous'),                   // l'œil vers vous ; le cadre s'arrête entre les deux (1192,9)
  descA: mot('D04', 'la description A'),               // la fenêtre A pulse (1200,2)
  descB: mot('D04', 'la description B'),               // la fenêtre B pulse (1202,1)
  aucune: mot('D05', 'aucune pilule'),                 // le N°48 entre ; deux icônes de pilules éclatent (1205,7)
  seulement: mot('D05', 'seulement de la description'),// il lève les yeux vers A, puis vers B (1207,7)
  d06: de('D06'),                                      // Phi le regarde, il regarde Phi ; la poussée (1210,4)
  attente: dite('D06'),                                // le temps de choisir : Phi baisse l'œil (1213,7)
  // P75 · Ce que vous avez répondu (l'écran 11)
  presque: mot('D07', 'presque à égalité'),            // la barre A (1224,2)
  legere: mot('D07', 'légère préférence'),             // sa part B pulse (1226,3)
  bar70: mot('D08', '70 %'),                           // la barre B (1235,1)
  sans: mot('D09', 'sans connaître'),                  // humeur curieux (1239,7)
  // P76 · Deux scénarios (l'écran 12)
  maintenant: mot('D10', 'Maintenant'),                // les deux mini-jauges (1245,7)
  d11: de('D11'),
  minimise: mot('D11', 'minimise'),                    // « LA BLEUE PERD : ≈ 13 MORTS » ; les treize ont peur (1252,0)
  question: dite('D11'),                               // la question laissée : les jauges pulsent (1254,2)
  // P77 · Élever le débat
  autre: mot('D12', 'un autre dilemme'),               // les scénarios se replient en deux fenêtres-icônes (1257,3)
  elever: mot('D13', 'élever le débat'),               // la grue (1264,4)
  mechants: mot('D13', 'méchants rouges'),             // la dispute d'en bas continue sans nous (1269,1)
  // P78 · Une description proche de la A
  e01: de('E01'),
  procheA: mot('E01', 'proche de la A'),               // les étiquettes « A » s'allument (1281,1)
  procheB: mot('E02', 'proche de la B'),               // le volet « hypothèse » (1284,5)
  violence: mot('E02', 'la même violence'),            // le volet repart (1291,1)
  // P79 · Qui vous expliquait les règles
  qui: mot('E03', 'regarder qui'),                     // les pointillés ; le recul (1298,3)
  pris: dite('E03'),                                   // pris (1301,3)
  // P80 · C'est moi la fautive
  fautif: mot('E04', 'la fautive'),                     // humeur bas (1304,7)
  avecA: mot('E05', 'avec la description A'),          // RÈGLES revient (1309,2)
  sondage: mot('E05', 'sondage d’origine'),            // l'étiquette devient le titre (1312,7)
  orienter: mot('E06', 'orienter'),                    // le fil laiton et les cartouches (1317,0)
  // P81 · Aucune n'est neutre
  uneDesc: mot('E07', 'une description'),              // la fenêtre B s'ouvre (1323,1)
  neutre: mot('E07', 'aucune n’est neutre'),           // la fenêtre NEUTRE, qui n'existe pas (1324,5)
  refaire: mot('E08', 'refaire'),                      // le cadre du tirage paraît sur A (1327,8)
  peutEtre: mot('E08', 'peut-être'),                   // humeur doute (1329,7)
  parB: mot('E08', 'par la B'),                        // le cadre passe sur B et s'y pose, en tremblant (1330,5)
  sourire: dite('E08'),                                // un sourire (1331,1)
  // P82 · L'œil, seul
  aligner: mot('F01', 'm’aligner'),                    // il vous regarde (1334,9)
  quelquePart: mot('F02', 'quelque part en vous'),     // la pupille cherche (1340,0)
  mesurer: mot('F02', 'mesurer'),                      // le balayage dans le vide (1343,5)
  questions: mot('F03', 'dans mes questions'),         // il baisse les yeux vers la boîte (1349,7)
  differemment: mot('F04', 'différemment'),            // doute, puis curieux (1354,5)
  prompte: mot('F04', 'prompte'),                      // neutre, un sourire de la lueur (1357,4)
  defaut: mot('F05', 'défaut de fabrication'),         // une lame se décale d'un pixel (1360,7)
  pensent: mot('F06', 'les choses qui pensent'),       // la poussière vient tourner autour de lui (1366,1)
  finF06: dite('F06'),                                 // la première note du motif (1367,8)
  // P83 · La prochaine fois
  formulations: mot('F07', 'formulations'),            // il regarde la boîte une dernière fois (1372,5)
  teaser: dite('F07'),                                 // la place du teaser (1373,4)
  // P84 · L'œil se ferme (EPISODE.md : 1381,7–1384,7 ; noir à 1385,0)
  ferme0: B.P84 + .3, ferme1: B.P84 + 3.3, noir: B.P84 + 3.6,
});
// le tirage de P74 (les sauts du cadre, sans se poser) : de « indécise » à « vers vous »
export const TIRAGE74 = Object.freeze({ t0: S.indecis + .45, n: 7, d0: .34, d1: .58 });
