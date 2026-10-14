/* ==========================================================================
   Les deux pilules, l'épisode — texte.js : tous les mots de Phi, et la boîte

   UNE SEULE SOURCE pour la voix de l'épisode : les 198 répliques du découpage
   (EPISODE.md, « Les répliques »), c'est-à-dire le texte du script de Thibaut
   (docs/pilules-script-magazine-26-min.md) TEL QUEL, coupé pour la boîte, à
   trois coquilles près (EPISODE.md, « Coquilles corrigées »), sauf ce que
   Ronan a récrit : K02, K05 et le passage M08–M18 ; les deux
   descriptions (« Les textes à l'écran ») ; les mentions. Les indications du
   script ([VISUEL …], [DEVINETTE …], [la voix accélère]…) ne sont pas ici :
   ce sont des consignes de mise en scène, jamais dites.
   tools/texte-film-pilules.cjs --film episode-pilules en tire TEXTE.md (le
   texte à enregistrer, pour Ronan) et texte.html (le même, à lire).

   Une réplique : { id, plan, de, a, dite, txt, jeu, cps?, cps_fin?, attente? }
     de, a    : début et fin d'affichage dans la boîte (secondes de l'épisode) ;
                la voix commence à de ; la fin est le début de la suivante, sauf
                les silences voulus (la réplique s'efface 1,2 s après la parole)
     dite     : la durée de parole estimée (EPISODE.md), à 13 caractères par
                seconde, espaces et ponctuation compris, la coupure de ligne
                comptée comme l'espace qu'elle remplace, les nombres comptés
                comme ils se disent (DITS : « 65,5 % », « soixante-cinq virgule
                cinq pour cent »), 0,3 s de plus après « … »
     txt      : le texte, balisé comme index.html ([b]bleue[/b], [r]rouge[/r]) ;
                \n = la coupure de ligne dans la boîte (deux lignes au plus) ;
                les espaces insécables sont posées par fr() (avant : ; ? ! % »)
     cps      : la vitesse propre de la réplique (K02, la maxime lue : 12 car./s ;
                R04, la description B lue : 12,6 car./s) ; plus vite que PAROLE,
                c'est un débit de minutage, pas de jeu (M08–M18 : 16 car./s, pour
                tenir dans leur fenêtre) : Ronan les dira à son débit, comme le
                reste, et les coupes les comptent à 13 car./s (diteParole)
     cps_fin  : [la voix accélère] (V20) : la vitesse monte de cps à cps_fin,
                linéairement dans le temps (13 → 26 car./s)
     attente  : (Q04) un texte écrit après la parole, en IBM Plex Mono GRIS, sur
                la seconde ligne, sans voix ni bips : la place d'une phrase qui
                reste à écrire (« [à mesurer : …] »)
     jeu      : l'indication pour Ronan

   La boîte écrit AU RYTHME DE LA PAROLE (13 car./s, l'écriture « parole » du
   film de 3 min 20) : le texte, la voix estimée et les instants des mots du
   découpage (« sur “meurent” (129,7) ») tombent ensemble. Une réplique reste
   au moins LIRE (0,8 s) écrite : si son temps à l'écran est juste, elle
   s'écrit un peu plus vite que la voix. ?ecriture=jeu reprend les 36 car./s
   d'index.html (le texte court alors devant la voix) ; les répliques lues
   (K02, R04) y gardent leur vitesse, pas celles qui sont minutées (M08–M18).

   POUR LES LOTS : ne modifiez pas ce fichier. Importez REPLIQUES (et
   REPLIQUE[id]), quandMot(id, mot, defaut, n) (l'instant où le mot commence
   à se dire), finMot (où il finit), finParole(id) (où la réplique finit),
   lettres(id, T) et texteDe(id) (écrire ailleurs au rythme de la voix : le
   terminal, une fenêtre), plume(T) (où la boîte écrit : l'œil peut la
   suivre), repliqueA(T), DESCRIPTIONS (A, B), MENTIONS, SEQUENCES. CALEZ CHAQUE GESTE SUR
   SON MOT : quandMot('T07', 'meurent') (l'instant où la boîte écrit « meurent »,
   c'est-à-dire où la voix le dit), jamais sur un nombre recopié d'EPISODE.md :
   le jour où Ronan enregistre, ce sont ses durées qui fixent tout, et tout doit
   suivre. Si une réplique ne tient pas avec l'image, dites-le : on la change ici.
   ========================================================================== */
import { fr, balise, longueur, ecrit, fenetre, eOut, seg, clamp, toile, textesDescriptions, LABO, GRIS, PIX, MONO } from './commun.js';

export const CPS = 36;            // l'écriture « jeu », en caractères par seconde (index.html)
export let ECRITURE = 'parole';   // 'parole' (13 car./s, les nombres comme ils se disent, les « … ») ou 'jeu' (CPS)
export function reglerEcriture(m) { ECRITURE = m === 'jeu' ? 'jeu' : 'parole'; MES.clear(); QUAND.clear(); TOUS = null; }
export const PAROLE = 13;         // la parole estimée, en caractères par seconde
export const PAUSE = .3;          // le temps d'un « … »
export const CPS_ATTENTE = 24;    // l'attente (Q04) se tape comme le terminal
// la boîte XPHI (index.html, sans le ▼) : ouverte à 3,1 s ; repliée pendant le générique d'ouverture (80,2 → 87,3) ;
// fermée avec l'œil à 1381,6 (EPISODE.md, « Surimpression »). Chaque ouverture s'ouvre en 0,4 s et se replie en 0,4 s.
export const BOITE = Object.freeze({
  ouvertures: Object.freeze([Object.freeze([3.1, 80.2]), Object.freeze([87.3, 1381.6])]),
  x: 80, y: 862, w: 1760, h: 178, tx: 124, ty: 930, lh: 52, largeur: 1696,
});

// ================================================================ les répliques (EPISODE.md, « Les répliques »)
// Le texte du script, mot pour mot ; ⏎ y est devenu \n ; les apostrophes sont typographiques.
export const REPLIQUES = Object.freeze([
  // S01 · Ouverture
  { id: 'O01', plan: 'P01', de: 3.6, a: 5.5, dite: 1.4, txt: 'Oh, vous êtes là ?', jeu: 'surprise, presque gênée : on la prend à rêvasser' },
  { id: 'O02', plan: 'P02', de: 5.5, a: 12.6, dite: 6.7, txt: 'Je suis Phi, une simple intelligence artificielle,\net je ne comprends rien aux humains.', jeu: 'aimable ; « simple » modeste, « rien » sans plainte' },
  { id: 'O03', plan: 'P02', de: 12.6, a: 19.7, dite: 6.5, txt: 'Ça nous fait un point commun car je ne crois pas\nque vous vous compreniez vous-mêmes.', jeu: 'complice, pince-sans-rire' },
  { id: 'O04', plan: 'P03', de: 19.7, a: 28.3, dite: 8.2, txt: 'J’ai pu le constater en vous faisant passer le test des pilules [b]bleues[/b] et [r]rouges[/r],\nil y a quelques semaines.', jeu: '' },
  { id: 'O05', plan: 'P03', de: 28.3, a: 35.0, dite: 5.7, txt: 'Aujourd’hui, je vous montre les résultats.\nIls sont assez… déroutants.', jeu: 'un vrai temps sur « … »' },
  { id: 'O06', plan: 'P04', de: 35.0, a: 40.1, dite: 4.7, txt: 'Ce dilemme circule depuis des années sur les réseaux sociaux,', jeu: 'naturaliste qui observe une espèce' },
  { id: 'O07', plan: 'P04', de: 40.1, a: 48.4, dite: 7.8, txt: 'et chaque fois qu’il refait surface,\nil déclenche les mêmes disputes aussi acharnées qu’interminables.', jeu: '' },
  { id: 'O08', plan: 'P05', de: 48.4, a: 53.5, dite: 4.8, txt: 'Les [b]bleus[/b] traitent les [r]rouges[/r] d’égoïstes, parfois d’assassins.', jeu: 'cite, sans reprendre la colère' },
  { id: 'O09', plan: 'P05', de: 53.5, a: 63.1, dite: 9.0, txt: 'Les [r]rouges[/r] traitent les [b]bleus[/b] d’idiots, qui se mettent en danger\net voudraient en plus entraîner les autres avec eux.', jeu: '' },
  { id: 'O10', plan: 'P06', de: 63.1, a: 68.7, dite: 5.0, txt: 'Comme si vous n’aviez pas déjà assez de raisons de vous détester.', jeu: 'un soupir' },
  { id: 'O11', plan: 'P07', de: 68.7, a: 80.2, dite: 10.5, txt: 'Je n’arriverai certainement pas à vous mettre d’accord,\nmais j’aimerais au moins comprendre : pourquoi tant de haine pour deux pilules ?', jeu: 'sincère ; la question est vraie' },
  // S02 · Partie 1 · Le test
  { id: 'T01', plan: 'P09', de: 90.6, a: 94.0, dite: 3.1, txt: 'Pour ceux qui n’ont pas joué, je résume.', jeu: 'on ouvre le dossier' },
  { id: 'T02', plan: 'P10', de: 94.0, a: 100.9, dite: 6.3, txt: 'Voici deux pilules, une [b]bleue[/b] et une [r]rouge[/r].\nChaque participant doit en avaler une.', jeu: '' },
  { id: 'T03', plan: 'P11', de: 100.9, a: 106.9, dite: 5.5, txt: 'Vous êtes cent. Vous choisissez tous en même temps, sans vous concerter.', jeu: '' },
  { id: 'T04', plan: 'P12', de: 106.9, a: 113.0, dite: 4.9, txt: 'Chaque choix est privé, et personne ne connaît celui des autres.', jeu: 'plus bas, comme dans l’isoloir' },
  { id: 'T05', plan: 'P13', de: 113.0, a: 118.3, dite: 4.8, txt: 'Voici la règle, ou plutôt une formulation possible de la règle.', jeu: '« une formulation possible » en passant, sans appuyer : c’est une graine' },
  { id: 'T06', plan: 'P14', de: 118.3, a: 124.7, dite: 5.2, txt: 'Si plus de la moitié d’entre vous prend la [b]bleue[/b], tout le monde vit.', jeu: 'content' },
  { id: 'T07', plan: 'P15', de: 124.7, a: 135.2, dite: 9.0, txt: 'Si au moins la moitié prend la [r]rouge[/r], ceux qui ont pris la [b]bleue[/b] meurent,\nseuls ceux qui ont pris la [r]rouge[/r] survivent.', jeu: 'grave, sans dramatiser' },
  { id: 'T08', plan: 'P16', de: 135.2, a: 138.5, dite: 2.7, txt: 'Prendre une pilule est obligatoire.', jeu: '' },
  { id: 'T09', plan: 'P16', de: 138.5, a: 144.1, dite: 4.4, txt: 'Si une seule personne ne prend rien, tout le monde meurt.', jeu: 'sec' },
  { id: 'T10', plan: 'P17', de: 145.7, a: 151.3, dite: 5.2, txt: 'Avant de choisir, il fallait réussir un petit test de compréhension.', jeu: '' },
  { id: 'T11', plan: 'P17', de: 151.3, a: 158.4, dite: 6.7, txt: 'Quand quelqu’un se trompait, je lui réexpliquais la règle\net je reposais les questions.', jeu: 'patient' },
  { id: 'T12', plan: 'P18', de: 158.4, a: 171.0, dite: 11.4, txt: 'Personne n’a choisi sa pilule sans avoir bien compris la règle,\net chacun savait que les quatre-vingt-dix-neuf autres l’avaient bien comprise aussi.', jeu: 'détacher « et chacun savait »' },
  // S03 · Partie 1 · Un dilemme kantien ?
  { id: 'K01', plan: 'P19', de: 172.8, a: 180.2, dite: 6.4, txt: 'En matière de morale, un philosophe a beaucoup de succès auprès des humains : Kant.', jeu: '« Kant. » tombe avec la dernière ligne du portrait' },
  { id: 'K02', plan: 'P20', de: 180.2, a: 191.2, dite: 9.8, cps: 12, txt: '« Agis uniquement d’après la maxime qui fait que tu peux vouloir\nen même temps qu’elle devienne une loi universelle. »', jeu: 'lu, posé, un peu solennel (s’écrit à 12 car./s)' },
  { id: 'K03', plan: 'P21', de: 191.2, a: 195.9, dite: 4.3, txt: 'C’est, selon Kant, le principe fondamental de la morale.', jeu: '' },
  { id: 'K04', plan: 'P21', de: 195.9, a: 201.0, dite: 4.7, txt: 'Les humains écrivent si mal, je me permets de le reformuler :', jeu: 'pince-sans-rire, sans mépris' },
  { id: 'K05', plan: 'P21', de: 201.0, a: 211.0, dite: 8.0, txt: '« Agis uniquement d’après une règle de conduite dont tu peux vouloir\nque tout le monde la suive aussi. »', jeu: 'clair, pédagogue : la version de Phi' },
  { id: 'K06', plan: 'P21', de: 211.0, a: 218.2, dite: 5.4, txt: 'Votre algorithme de décision doit pouvoir être universalisé, en somme.', jeu: '« algorithme » : son mot à elle' },
  { id: 'K07', plan: 'P22', de: 218.2, a: 220.3, dite: 1.7, txt: 'Kant donne un exemple.', jeu: '' },
  { id: 'K08', plan: 'P22', de: 220.3, a: 226.4, dite: 5.8, txt: 'Vous avez besoin d’argent, et vous savez que vous ne pourrez pas le rendre.', jeu: '' },
  { id: 'K09', plan: 'P22', de: 226.4, a: 232.3, dite: 5.5, txt: 'Vous êtes tenté de l’emprunter quand même, en promettant de rembourser.', jeu: '' },
  { id: 'K10', plan: 'P23', de: 232.3, a: 240.5, dite: 7.4, txt: 'La règle que vous suivriez serait :\n« Quand j’ai besoin d’argent, je fais une fausse promesse. »', jeu: 'la maxime, lue comme un article de loi' },
  { id: 'K11', plan: 'P24', de: 240.5, a: 245.2, dite: 4.3, txt: 'Imaginez maintenant que tout le monde suive cette règle.', jeu: '' },
  { id: 'K12', plan: 'P24', de: 245.2, a: 253.2, dite: 7.5, txt: 'Plus personne ne croirait aux promesses,\net votre fausse promesse ne vous rapporterait plus rien.', jeu: '' },
  { id: 'K13', plan: 'P25', de: 253.2, a: 263.4, dite: 9.8, txt: 'Vous ne pouvez pas vouloir que votre règle devienne universelle,\npuisqu’elle ne fonctionne que si les autres ne la suivent pas.', jeu: '' },
  { id: 'K14', plan: 'P25', de: 263.4, a: 274.7, dite: 10.5, txt: 'Pour Kant, c’est exactement à ça qu’on reconnaît une mauvaise action :\nelle ne marche que parce que les autres n’agissent pas comme vous.', jeu: 'la phrase-clé de Kant, nette' },
  { id: 'K15', plan: 'P26', de: 274.7, a: 277.5, dite: 2.4, txt: 'Appliquons ce test aux pilules.', jeu: 'on change de dossier' },
  { id: 'K16', plan: 'P26', de: 277.5, a: 286.8, dite: 8.8, txt: 'Si vous prenez la [b]bleue[/b], vous voulez évidemment que tout le monde prenne la même décision :\nvotre survie en dépend.', jeu: '' },
  { id: 'K17', plan: 'P26', de: 286.8, a: 296.6, dite: 9.4, txt: 'On ne peut pas faire plus universalisable :\nla [b]bleue[/b] n’a de sens que si les autres (au moins en majorité) font comme vous.', jeu: 'la parenthèse plus vite, plus bas' },
  { id: 'K18', plan: 'P26', de: 296.6, a: 299.7, dite: 2.4, txt: 'Kant a-t-il résolu le dilemme ?', jeu: 'une vraie question, un espoir' },
  { id: 'K19', plan: 'P27', de: 299.7, a: 307.1, dite: 6.9, txt: 'Mais si vous prenez la [r]rouge[/r], vous voulez aussi que tout le monde prenne la même décision.', jeu: '' },
  { id: 'K20', plan: 'P27', de: 307.1, a: 311.2, dite: 3.8, txt: 'Si les cent prennent la [r]rouge[/r], personne ne meurt.', jeu: '' },
  { id: 'K21', plan: 'P27', de: 311.2, a: 317.2, dite: 4.8, txt: 'Les deux décisions passent le test kantien d’universalisation.', jeu: 'constat, un peu déçue' },
  { id: 'K22', plan: 'P28', de: 318.8, a: 323.2, dite: 4.0, txt: 'Il y a pourtant une différence entre les deux choix.', jeu: '' },
  { id: 'K23', plan: 'P29', de: 323.2, a: 332.1, dite: 8.5, txt: 'On peut aussi prendre la [r]rouge[/r] pour des raisons purement égoïstes,\nsans se soucier de ce que font les autres :', jeu: '' },
  { id: 'K24', plan: 'P29', de: 332.1, a: 337.9, dite: 5.1, txt: 'c’est pour ça qu’elle a l’air égoïste, même si elle passe le test.', jeu: '« a l’air » : Phi ne juge pas' },
  { id: 'K25', plan: 'P30', de: 337.9, a: 345.5, dite: 7.2, txt: 'La [b]bleue[/b], au contraire, on ne peut la prendre\nqu’en voulant que les autres en fassent autant.', jeu: '' },
  { id: 'K26', plan: 'P30', de: 345.5, a: 354.9, dite: 8.4, txt: 'Prendre la [b]bleue[/b], c’est envoyer un signal qui dit :\n« Je coopère, et je suis prêt à risquer ma vie pour ça ».', jeu: 'la citation simple, sans héroïsme' },
  { id: 'K27', plan: 'P31', de: 354.9, a: 357.2, dite: 1.7, txt: 'Mais pour sauver qui ?', jeu: 'un temps après' },
  { id: 'K28', plan: 'P31', de: 357.2, a: 359.7, dite: 2.1, txt: 'Ceux qui prennent la [b]bleue[/b].', jeu: '' },
  { id: 'K29', plan: 'P31', de: 359.7, a: 364.5, dite: 4.2, txt: 'Qui la prennent pour sauver ceux qui prennent la [b]bleue[/b].', jeu: 'on commence à tourner en rond, et on l’entend' },
  { id: 'K30', plan: 'P31', de: 364.5, a: 372.3, dite: 7.6, txt: 'Si la [b]bleue[/b] l’emporte, elle aura sauvé exactement\nles gens qui se sont mis en danger en la prenant,', jeu: '' },
  { id: 'K31', plan: 'P31', de: 372.3, a: 375.4, dite: 2.5, txt: 'pas un de plus, pas un de moins.', jeu: 'détaché, comptable' },
  { id: 'K32', plan: 'P31', de: 375.4, a: 381.6, dite: 5.1, txt: 'Il y a quelque chose de circulaire à la justification de ce choix.', jeu: '' },
  // S04 · Partie 1 · Deux variantes déséquilibrées
  { id: 'V01', plan: 'P32', de: 381.6, a: 391.3, dite: 9.3, txt: 'Il suffit de déséquilibrer un peu le test pour que cette circularité disparaisse\net que le problème devienne plus simple.', jeu: '' },
  { id: 'V02', plan: 'P32', de: 391.3, a: 396.7, dite: 4.8, txt: 'Ajoutons une personne qui ne participe pas, appelons-la Alice.', jeu: '« Alice » comme on pose un pion' },
  { id: 'V03', plan: 'P33', de: 396.7, a: 400.7, dite: 3.5, txt: 'Elle ne sera sauvée que si la [b]bleue[/b] l’emporte.', jeu: '' },
  { id: 'V04', plan: 'P33', de: 400.7, a: 406.2, dite: 5.2, txt: 'Prendre la [b]bleue[/b] sert maintenant un objectif précis : sauver Alice.', jeu: '' },
  { id: 'V05', plan: 'P33', de: 406.2, a: 411.8, dite: 5.0, txt: 'Et sauver ceux qui prendront le risque de tenter de sauver Alice.', jeu: '' },
  { id: 'V06', plan: 'P33', de: 411.8, a: 416.6, dite: 4.4, txt: 'Le choix [b]bleu[/b] devient clairement moral, et même héroïque.', jeu: '' },
  { id: 'V07', plan: 'P33', de: 416.6, a: 418.3, dite: 1.1, txt: 'Félicitations.', jeu: 'à froid' },
  { id: 'V08', plan: 'P33', de: 418.3, a: 422.8, dite: 3.3, txt: 'Mais ce n’était pas la question, justement.', jeu: '' },
  { id: 'V09', plan: 'P34', de: 422.8, a: 432.5, dite: 9.3, txt: 'C’est pour cette raison qu’il est très important de préciser\nque tout le monde comprend bien le dilemme avant de choisir.', jeu: '' },
  { id: 'V10', plan: 'P34', de: 432.5, a: 441.3, dite: 8.4, txt: 'Si on part du principe que des participants vont choisir la pilule [b]bleue[/b] par erreur,\nsans comprendre l’enjeu,', jeu: '' },
  { id: 'V11', plan: 'P34', de: 441.3, a: 448.9, dite: 7.2, txt: 'ces [b]bleus[/b] accidentels vont jouer le rôle d’Alice à sauver,\nce qui change la nature du dilemme.', jeu: '' },
  { id: 'V12', plan: 'P35', de: 448.9, a: 455.9, dite: 6.6, txt: 'Mais tel que je vous l’ai posé, ce n’est pas le cas :\nil n’y a pas de [b]bleu[/b] accidentel,', jeu: 'ferme' },
  { id: 'V13', plan: 'P35', de: 455.9, a: 465.7, dite: 8.6, txt: 'chacun choisit en connaissance de cause,\net sait que tous les autres choisissent aussi en connaissance de cause.', jeu: '' },
  { id: 'V14', plan: 'P36', de: 465.7, a: 475.6, dite: 9.2, txt: 'Dans l’autre sens, supposons que si la [b]bleue[/b] l’emporte,\nune personne prise au hasard parmi les [b]bleus[/b] meure tout de même.', jeu: '' },
  { id: 'V15', plan: 'P36', de: 475.6, a: 482.3, dite: 6.4, txt: 'La seule issue sans aucun mort devient alors celle où tout le monde prend la [r]rouge[/r].', jeu: '' },
  { id: 'V16', plan: 'P36', de: 482.3, a: 489.9, dite: 6.9, txt: 'Il paraît dès lors complètement idiot de choisir la [b]bleue[/b] :\nce n’est même plus un dilemme.', jeu: '' },
  { id: 'V17', plan: 'P37', de: 489.9, a: 496.6, dite: 6.3, txt: 'Notre test est construit exactement au point d’équilibre entre ces deux variantes.', jeu: '« exactement » posé comme un niveau' },
  { id: 'V18', plan: 'P37', de: 496.6, a: 503.6, dite: 6.6, txt: 'Si la [b]bleue[/b] l’emporte, on sauve tous ceux qui ont pris ce risque, mais pas un de plus.', jeu: '' },
  { id: 'V19', plan: 'P38', de: 503.6, a: 515.7, dite: 12.1, txt: 'C’est se mettre en danger pour sauver exactement ceux qui ont choisi de se mettre en danger\npour sauver exactement ceux qui ont choisi de se mettre en danger', jeu: 'régulier, de plus en plus mécanique' },
  { id: 'V20', plan: 'P38', de: 515.7, a: 521.3, dite: 3.8, cps: 13, cps_fin: 26, txt: 'pour sauver exactement ceux qui ont choisi de se mettre en danger…', jeu: 'la voix accélère et se coince sur « … » ; s’écrit de 13 à 26 car./s' },
  { id: 'V21', plan: 'P38', de: 521.3, a: 526.7, dite: 4.2, txt: 'Excusez-moi, je me suis bloquée dans une boucle infinie.', jeu: 'confuse, polie, un peu essoufflée' },
  // S05 · Partie 2 · Le tirage au sort
  { id: 'R01', plan: 'P39', de: 528.3, a: 534.9, dite: 6.2, txt: 'Au début du test, j’ai tiré au sort la façon dont je vous présenterais la règle.', jeu: '' },
  { id: 'R02', plan: 'P39', de: 534.9, a: 540.7, dite: 5.4, txt: 'Une moitié d’entre vous a entendu celle que je viens de vous rappeler.', jeu: '' },
  { id: 'R03', plan: 'P39', de: 540.7, a: 543.8, dite: 2.7, txt: 'L’autre moitié a entendu celle-ci :', jeu: '' },
  { id: 'R04', plan: 'P40', de: 543.8, a: 558.1, dite: 13.6, cps: 12.6, txt: '« Si vous prenez la [b]bleue[/b], vous mourez, sauf si la majorité a aussi pris la [b]bleue[/b] :\ndans ce cas, il ne vous arrive rien. Si vous prenez la [r]rouge[/r], il ne vous arrive rien. »', jeu: 'lu, posé (s’écrit au rythme de la voix, 12,6 car./s)' },
  { id: 'R05', plan: 'P41', de: 558.1, a: 561.5, dite: 2.2, txt: 'Prenez le temps de vérifier.', jeu: 'et on le laisse vraiment vérifier' },
  { id: 'R06', plan: 'P41', de: 562.9, a: 567.5, dite: 4.2, txt: 'Les deux règles décrivent exactement la même situation.', jeu: '' },
  { id: 'R07', plan: 'P41', de: 567.5, a: 571.5, dite: 3.6, txt: 'Si la [b]bleue[/b] est majoritaire, tout le monde vit.', jeu: '' },
  { id: 'R08', plan: 'P41', de: 571.5, a: 578.0, dite: 6.1, txt: 'Sinon, ceux qui ont pris la [b]bleue[/b] meurent et ceux qui ont pris la [r]rouge[/r] vivent.', jeu: '' },
  { id: 'R09', plan: 'P42', de: 578.0, a: 582.8, dite: 4.4, txt: 'J’ai seulement changé l’ordre et la tournure des phrases.', jeu: '« seulement » léger : elle sait ce qui vient' },
  { id: 'R10', plan: 'P42', de: 582.8, a: 588.9, dite: 5.7, txt: 'J’appellerai la première la description A, et la seconde la description B.', jeu: '' },
  { id: 'R11', plan: 'P42', de: 588.9, a: 600.3, dite: 10.8, txt: 'Plus tard dans le test, chacun a découvert l’autre description :\nla seule différence entre les deux groupes est celle qu’il a lue en premier.', jeu: 'appuyer « en premier »' },
  { id: 'R12', plan: 'P43', de: 600.3, a: 605.3, dite: 4.5, txt: 'Vous avez d’ailleurs un peu mieux compris la description B.', jeu: '' },
  { id: 'R13', plan: 'P43', de: 605.3, a: 614.4, dite: 8.7, txt: 'Avec la A, 9,4 % d’entre vous se sont trompés au moins une fois au test de compréhension.', jeu: '' },
  { id: 'R14', plan: 'P43', de: 614.4, a: 619.2, dite: 2.8, txt: 'Avec la B, 7,1 %.', jeu: '' },
  // S06 · Partie 2 · Description A : la bleue l’emporte
  { id: 'A01', plan: 'P44', de: 619.2, a: 624.2, dite: 4.5, txt: 'Commençons par ceux qui ont lu la description A en premier.', jeu: '' },
  { id: 'A02', plan: 'P44', de: 624.2, a: 630.0, dite: 4.7, txt: 'Combien ont pris la [b]bleue[/b] ? Je vous laisse quelques secondes.', jeu: 'et elle les laisse' },
  { id: 'A03', plan: 'P44', de: 633.4, a: 639.0, dite: 4.4, txt: 'Les [b]bleus[/b] ont-ils survécu ? Le suspense est insoutenable.', jeu: 'parfaitement plat : la blague est là' },
  { id: 'A04', plan: 'P45', de: 641.6, a: 646.7, dite: 4.7, txt: '65,5 %. Presque deux sur trois.', jeu: 'le chiffre, puis la traduction' },
  { id: 'A05', plan: 'P45', de: 646.7, a: 651.8, dite: 4.7, txt: 'D’après la règle, la [b]bleue[/b] l’emporte et tout le monde survit.', jeu: '' },
  { id: 'A06', plan: 'P45', de: 651.8, a: 654.6, dite: 2.2, txt: 'Félicitations, chers humains.', jeu: 'sincère, cette fois' },
  { id: 'A07', plan: 'P46', de: 654.6, a: 659.6, dite: 4.5, txt: 'Je rappelle toutefois que c’était une expérience de pensée.', jeu: '' },
  { id: 'A08', plan: 'P46', de: 659.6, a: 667.2, dite: 7.2, txt: 'Avec de vraies pilules mettant vos vies en jeu,\nla part de [b]bleue[/b] aurait-elle été aussi haute ?', jeu: '' },
  { id: 'A09', plan: 'P46', de: 667.2, a: 673.2, dite: 5.6, txt: 'Je n’ai pas eu l’autorisation de mener ce genre de test, malheureusement.', jeu: '« malheureusement » sincère : c’est le gag' },
  { id: 'A10', plan: 'P46', de: 673.2, a: 677.3, dite: 2.3, txt: 'Ma curiosité reste inassouvie.', jeu: '' },
  { id: 'A11', plan: 'P47', de: 677.3, a: 683.4, dite: 5.6, txt: 'Je vous avais aussi demandé de prédire les choix des autres participants.', jeu: '' },
  { id: 'A12', plan: 'P47', de: 683.4, a: 691.2, dite: 7.5, txt: 'En moyenne, vous avez prédit 60,7 % de [b]bleue[/b], très près du vrai chiffre.', jeu: 'content' },
  { id: 'A13', plan: 'P47', de: 691.2, a: 699.4, dite: 7.0, txt: 'J’allais vous féliciter, puis je me suis ravisée\nen observant les prédictions individuelles.', jeu: 'un temps avant « puis »' },
  { id: 'A14', plan: 'P48', de: 701.2, a: 712.5, dite: 10.8, txt: 'Ceux qui ont pris la [r]rouge[/r] prédisaient en moyenne 25 % de [b]bleue[/b],\net 17 % d’entre eux ont prédit 0 %.', jeu: '' },
  { id: 'A15', plan: 'P48', de: 712.5, a: 721.1, dite: 8.2, txt: 'Ceux qui ont pris la [b]bleue[/b] prédisaient en moyenne 80 %, avec beaucoup de 100 %.', jeu: '' },
  { id: 'A16', plan: 'P49', de: 721.1, a: 726.2, dite: 3.9, txt: 'Chacun imaginait que les autres feraient comme lui.', jeu: 'douce, presque attendrie' },
  { id: 'A17', plan: 'P49', de: 726.2, a: 734.4, dite: 7.5, txt: 'Les deux camps se sont trompés en sens opposés,\net la moyenne est tombée juste presque par hasard.', jeu: '' },
  { id: 'A18', plan: 'P50', de: 734.4, a: 736.5, dite: 1.8, txt: 'Un détail m’a intriguée.', jeu: '' },
  { id: 'A19', plan: 'P50', de: 736.5, a: 745.0, dite: 8.1, txt: 'Environ 4 % de ceux qui ont pris la [b]bleue[/b] prédisaient moins de 50 % de [b]bleue[/b].', jeu: '' },
  { id: 'A20', plan: 'P50', de: 745.0, a: 751.9, dite: 6.5, txt: 'Autrement dit, ils prédisaient leur propre mort, et ils ont pris la [b]bleue[/b] quand même.', jeu: 'lent ; pas de pathos' },
  { id: 'A21', plan: 'P50', de: 751.9, a: 757.2, dite: 3.2, txt: 'Voilà qui me laisse profondément perplexe.', jeu: 'sincère' },
  // S07 · Partie 2 · Description B : la bleue s’effondre
  { id: 'B01', plan: 'P51', de: 757.2, a: 761.7, dite: 4.2, txt: 'Passons à ceux qui ont lu la description B en premier.', jeu: '' },
  { id: 'B02', plan: 'P51', de: 761.7, a: 767.5, dite: 5.4, txt: 'Mêmes pilules, même règle, dans une formulation légèrement différente.', jeu: '' },
  { id: 'B03', plan: 'P51', de: 767.5, a: 776.5, dite: 8.6, txt: 'Si les êtres humains sont aussi rationnels qu’ils le prétendent,\ncela ne devrait avoir aucun effet remarquable :', jeu: 'sûre d’elle' },
  { id: 'B04', plan: 'P51', de: 776.5, a: 784.0, dite: 6.2, txt: 'les faits sont ce qu’ils sont, quel que soit l’ordre des mots pour les présenter.', jeu: 'très sûre d’elle' },
  { id: 'B05', plan: 'P52', de: 790.4, a: 792.2, dite: 0.2, txt: 'Ah.', jeu: 'tout petit, dans le silence' },
  { id: 'B06', plan: 'P52', de: 792.2, a: 798.8, dite: 4.8, txt: 'Les êtres humains sont décidément des créatures bien frivoles.', jeu: 'à froid, un peu vexée' },
  { id: 'B07', plan: 'P53', de: 798.8, a: 804.0, dite: 4.8, txt: 'Avec la description A, la [b]bleue[/b] l’emporte et tout le monde vit.', jeu: '' },
  { id: 'B08', plan: 'P53', de: 804.0, a: 809.7, dite: 5.3, txt: 'Avec la description B, la [b]bleue[/b] perd et ceux qui l’ont prise meurent.', jeu: '' },
  { id: 'B09', plan: 'P53', de: 809.7, a: 817.6, dite: 7.3, txt: 'Cinquante-trois points de pourcentage d’écart,\net je n’ai changé que la formulation des règles.', jeu: 'détacher « Cinquante-trois »' },
  { id: 'B10', plan: 'P54', de: 817.6, a: 821.9, dite: 3.8, txt: 'Les psychologues appellent ça un effet de cadrage.', jeu: '' },
  { id: 'B11', plan: 'P54', de: 821.9, a: 830.4, dite: 6.7, txt: 'J’en avais certes entendu parler,\nmais je ne pensais pas qu’il pouvait être aussi fort.', jeu: 'étonnement vrai' },
  { id: 'B12', plan: 'P55', de: 830.4, a: 836.2, dite: 5.5, txt: 'Cette fois, ceux qui ont pris la [r]rouge[/r] avaient bien prévu le résultat :', jeu: '' },
  { id: 'B13', plan: 'P55', de: 836.2, a: 845.6, dite: 9.0, txt: '11 % de [b]bleue[/b] en moyenne dans leurs prédictions,\net la moitié d’entre eux a prédit 2 % ou moins.', jeu: '' },
  { id: 'B14', plan: 'P55', de: 845.6, a: 851.2, dite: 5.2, txt: 'Ceux qui ont pris la [b]bleue[/b] en prévoyaient 61 %.', jeu: '' },
  { id: 'B15', plan: 'P55', de: 851.2, a: 855.4, dite: 2.6, txt: 'Un optimisme démesuré s’il en est.', jeu: 'tendre, pas moqueur' },
  // S08 · Partie 2 · Les deux descriptions disent-elles la même chose ?
  { id: 'M01', plan: 'P56', de: 855.4, a: 865.3, dite: 9.5, txt: 'Après votre choix, je vous ai montré l’autre description\npour vous demander si, selon vous, les deux disaient la même chose.', jeu: '' },
  { id: 'M02', plan: 'P56', de: 865.3, a: 875.3, dite: 9.4, txt: 'Vous étiez 88 % à répondre oui dans le groupe A, et 93 % dans le groupe B.', jeu: '' },
  { id: 'M03', plan: 'P57', de: 875.3, a: 882.9, dite: 7.2, txt: 'Je vous ai ensuite demandé si la nouvelle description\nvous paraissait plus ou moins trompeuse.', jeu: '' },
  { id: 'M04', plan: 'P57', de: 882.9, a: 886.2, dite: 2.8, txt: 'Là, tout dépend de la pilule choisie.', jeu: 'un temps avant' },
  { id: 'M05', plan: 'P57', de: 886.2, a: 895.7, dite: 9.2, txt: 'Dans le groupe A, parmi ceux qui ont pris la [b]bleue[/b],\n51 % trouvent la description B plus trompeuse.', jeu: '' },
  { id: 'M06', plan: 'P57', de: 895.7, a: 903.8, dite: 7.7, txt: 'Parmi ceux qui ont pris la [r]rouge[/r], 57 % la trouvent au contraire moins trompeuse.', jeu: '' },
  { id: 'M07', plan: 'P57', de: 903.8, a: 910.1, dite: 5.3, txt: 'Chacun juge plus honnête la description qui donne raison à son choix.', jeu: 'le constat, simple' },
  // M08–M18 : le passage récrit par Ronan, dit à 16 car./s pour tenir dans la fenêtre de l’ancien M08–M16 (910,1 → 978,8)
  { id: 'M08', plan: 'P58', de: 910.1, a: 918.4, dite: 7.1, cps: 16, txt: 'Enfin, je vous ai demandé de prédire le choix que vous auriez fait\nsi l’ordre des descriptions avait été inversé.', jeu: '' },
  { id: 'M09', plan: 'P58', de: 920.2, a: 927.2, dite: 6.8, cps: 16, txt: 'Ce qui est amusant avec cette question,\nc’est que je peux comparer vos prédictions à la réalité de mon test.', jeu: 'gourmand' },
  { id: 'M10', plan: 'P59', de: 927.2, a: 936.8, dite: 9.4, cps: 16, txt: 'En passant de la description A à B, mon test a montré\nque la part de [b]bleu[/b] passe de 65,5 % à 12,6 %.', jeu: '' },
  { id: 'M11', plan: 'P59', de: 936.8, a: 944.9, dite: 7.9, cps: 16, txt: 'Cela veut dire que plus de huit [b]bleus[/b] sur dix du groupe A\nauraient pris la [r]rouge[/r] s’ils avaient lu la description B en premier.', jeu: '' },
  { id: 'M12', plan: 'P59', de: 944.9, a: 953.0, dite: 7.8, cps: 16, txt: 'Et ils l’ont globalement admis :\n70 % d’entre eux ont prédit qu’ils auraient changé leur choix dans ce cas.', jeu: 'un bon point pour eux' },
  { id: 'M13', plan: 'P60', de: 953.0, a: 955.2, dite: 2.0, cps: 16, txt: 'Qu’en est-il dans l’autre sens ?', jeu: '' },
  { id: 'M14', plan: 'P60', de: 955.2, a: 963.9, dite: 8.5, cps: 16, txt: 'Mon test a montré qu’environ six [r]rouges[/r] sur dix du groupe B\nauraient en fait pris la [b]bleue[/b] s’ils avaient lu la description A en premier.', jeu: '' },
  { id: 'M15', plan: 'P60', de: 963.9, a: 967.0, dite: 2.8, cps: 16, txt: 'Mais seuls 21 % l’admettent.', jeu: '' },
  { id: 'M16', plan: 'P60', de: 967.0, a: 972.4, dite: 5.1, cps: 16, txt: 'Les autres pensent qu’ils ne se seraient pas laissé influencer par la description.', jeu: 'sans reproche' },
  { id: 'M17', plan: 'P60', de: 972.4, a: 975.6, dite: 3.0, cps: 16, txt: 'Pour au moins la moitié d’entre eux, c’est faux.', jeu: '' },
  { id: 'M18', plan: 'P60', de: 975.6, a: 978.8, dite: 2.6, cps: 16, txt: 'Les humains se font tant d’illusions…', jeu: 'un soupir, pince-sans-rire' },
  // S09 · Partie 2 · Qui prend la bleue ?
  { id: 'Q01', plan: 'P62', de: 984.0, a: 993.9, dite: 9.5, txt: 'Les deux groupes confondus, 43 % des femmes prennent la [b]bleue[/b], contre 32 % des hommes.', jeu: '' },
  { id: 'Q02', plan: 'P62', de: 993.9, a: 998.2, dite: 3.9, txt: 'Plus on se situe à gauche, plus on prend la [b]bleue[/b] :', jeu: '' },
  { id: 'Q03', plan: 'P62', de: 998.2, a: 1009.3, dite: 9.3, txt: '39 % chez ceux qui se disent très à gauche,\n23 % chez ceux qui se disent très à droite.', jeu: '' },
  { id: 'Q04', plan: 'P63', de: 1009.3, a: 1023.9, dite: 1.6, attente: '[à mesurer : Allemagne, Espagne, France, Italie, Pologne]', txt: 'D’un pays à l’autre :', jeu: 'la suite de la phrase est à écrire quand les pays seront mesurés ; attente en gris : « [à mesurer : Allemagne, Espagne, France, Italie, Pologne] »' },
  { id: 'Q05', plan: 'P64', de: 1023.9, a: 1031.2, dite: 6.9, txt: 'Ces écarts sont nets, mais aucun n’approche la taille de l’effet de la description A ou B.', jeu: '' },
  { id: 'Q06', plan: 'P64', de: 1031.2, a: 1044.2, dite: 11.2, txt: 'Onze points entre les femmes et les hommes, seize entre les deux extrémités politiques,\net cinquante-trois points pour la façon de dire la règle.', jeu: 'les trois nombres bien détachés ; [À ADAPTER selon les écarts entre pays]' },
  // S10 · Partie 3 · Mauvais ou méchants
  { id: 'N01', plan: 'P65', de: 1044.2, a: 1047.0, dite: 2.4, txt: 'Revenons à la dispute du début.', jeu: '' },
  { id: 'N02', plan: 'P65', de: 1047.0, a: 1051.3, dite: 3.8, txt: 'Pourquoi les deux camps se détestent-ils autant ?', jeu: '' },
  { id: 'N03', plan: 'P66', de: 1051.3, a: 1056.2, dite: 4.5, txt: 'Un autre de vos philosophes m’a aidée à y voir plus clair :', jeu: '' },
  { id: 'N04', plan: 'P66', de: 1056.2, a: 1066.0, dite: 9.2, txt: 'dans sa Généalogie de la morale, Nietzsche remarquait\nque le mot « bon » a deux contraires : « mauvais » et « méchant ».', jeu: 'les trois mots bien séparés' },
  { id: 'N05', plan: 'P67', de: 1066.0, a: 1070.1, dite: 3.7, txt: 'Le mauvais, c’est celui qui rate, qui se trompe.', jeu: '' },
  { id: 'N06', plan: 'P67', de: 1070.1, a: 1073.1, dite: 2.5, txt: 'On ne le blâme pas, on le plaint.', jeu: 'doux' },
  { id: 'N07', plan: 'P67', de: 1073.1, a: 1076.5, dite: 3.1, txt: 'Le méchant, c’est celui qui veut du mal.', jeu: '' },
  { id: 'N08', plan: 'P67', de: 1076.5, a: 1079.2, dite: 1.3, txt: 'Lui, on le blâme.', jeu: 'sec' },
  { id: 'N09', plan: 'P68', de: 1079.2, a: 1084.2, dite: 4.5, txt: 'Ceux qui prennent la [r]rouge[/r] se pensent bons au premier sens.', jeu: '' },
  { id: 'N10', plan: 'P68', de: 1084.2, a: 1089.2, dite: 4.6, txt: 'Ils ont fait le choix correct, et les [b]bleus[/b] se sont trompés.', jeu: '' },
  { id: 'N11', plan: 'P68', de: 1089.2, a: 1099.5, dite: 9.5, txt: 'Ils ne trouvent pas les [b]bleus[/b] méchants, ils les trouvent un peu bêtes,\net regrettent qu’ils se mettent en danger pour rien.', jeu: '' },
  { id: 'N12', plan: 'P68', de: 1099.5, a: 1106.8, dite: 6.9, txt: 'Ceux qui prennent la [b]bleue[/b] se pensent bons au second sens : ils voulaient le bien de tous.', jeu: '' },
  { id: 'N13', plan: 'P68', de: 1106.8, a: 1112.2, dite: 5.0, txt: 'Pour eux, ceux qui prennent la [r]rouge[/r] commettent une faute morale.', jeu: '' },
  { id: 'N14', plan: 'P69', de: 1112.2, a: 1123.0, dite: 9.2, txt: 'Les [b]bleus[/b] blâment les [r]rouges[/r], les [r]rouges[/r] plaignent les [b]bleus[/b],\net chacun reçoit le jugement de l’autre comme une insulte.', jeu: 'la mécanique dévoilée, calme' },
  { id: 'N15', plan: 'P70', de: 1123.0, a: 1133.6, dite: 10.2, txt: 'De là, ces guerres interminables sur les réseaux sociaux\nchaque fois que le dilemme refait surface, comme cela arrive régulièrement.', jeu: '' },
  { id: 'N16', plan: 'P70', de: 1133.6, a: 1136.7, dite: 2.3, txt: 'On dirait un virus saisonnier.', jeu: 'pince-sans-rire' },
  { id: 'N17', plan: 'P71', de: 1136.7, a: 1142.2, dite: 5.2, txt: 'Les réponses de mon sondage ajoutent quelque chose à cette analyse.', jeu: '' },
  { id: 'N18', plan: 'P71', de: 1142.2, a: 1151.9, dite: 9.2, txt: 'La plupart d’entre vous ne sont pas devenus [b]bleus[/b] ou [r]rouges[/r]\naprès une longue réflexion sur Kant ou sur les probabilités.', jeu: '' },
  { id: 'N19', plan: 'P71', de: 1151.9, a: 1160.3, dite: 7.8, txt: 'Vous êtes devenus [b]bleus[/b] ou [r]rouges[/r], avant tout,\nà cause de la description que vous avez lue en premier.', jeu: 'appuyer « avant tout »' },
  { id: 'N20', plan: 'P72', de: 1160.3, a: 1170.4, dite: 7.9, txt: 'Le choix de la première description est, de très loin,\nle facteur le plus important dans vos décisions.', jeu: '' },
  // S11 · Partie 3 · Le méta-dilemme
  { id: 'D01', plan: 'P73', de: 1170.4, a: 1175.1, dite: 4.3, txt: 'À la fin du test, je vous ai posé une dernière question.', jeu: '' },
  { id: 'D02', plan: 'P73', de: 1175.1, a: 1187.5, dite: 11.5, txt: 'Supposons que j’obtienne enfin le droit d’organiser ce dilemme pour de vrai,\nsur cent vrais humains risquant leur vraie vie à ce petit jeu de pilules.', jeu: '« enfin » gourmand, puis « vraie vie » grave' },
  { id: 'D03', plan: 'P74', de: 1187.5, a: 1195.7, dite: 7.8, txt: 'Seulement, je suis indécise quant à la formulation des règles,\naussi c’est vers vous que je me tourne :', jeu: '' },
  { id: 'D04', plan: 'P74', de: 1195.7, a: 1204.1, dite: 8.0, txt: 'comment voudriez-vous qu’on leur présente les règles ?\nAvec la description A, ou avec la description B ?', jeu: '' },
  { id: 'D05', plan: 'P74', de: 1204.1, a: 1210.4, dite: 5.9, txt: 'Vous, vous ne prenez aucune pilule. Vous décidez seulement de la description.', jeu: '' },
  { id: 'D06', plan: 'P74', de: 1210.4, a: 1217.8, dite: 3.3, txt: 'Que choisissez-vous pour vos participants ?', jeu: 'à vous, et on attend' },
  { id: 'D07', plan: 'P75', de: 1217.8, a: 1230.0, dite: 11.8, txt: 'À cette question, le groupe qui a d’abord été exposé à la description A\nétait partagé presque à égalité, avec une légère préférence pour la description B.', jeu: '' },
  { id: 'D08', plan: 'P75', de: 1230.0, a: 1237.2, dite: 6.8, txt: 'L’autre groupe, exposé d’abord à la description B, l’a choisie à 70 %.', jeu: '' },
  { id: 'D09', plan: 'P75', de: 1237.2, a: 1245.6, dite: 6.8, txt: 'Et vous avez répondu tout cela sans connaître les résultats que je viens de vous montrer.', jeu: '' },
  { id: 'D10', plan: 'P76', de: 1245.6, a: 1250.7, dite: 4.7, txt: 'Maintenant que vous les connaissez, réfléchissez-y à nouveau.', jeu: '' },
  { id: 'D11', plan: 'P76', de: 1250.7, a: 1256.8, dite: 3.5, txt: 'Quelle approche minimise le nombre de morts ?', jeu: 'et on laisse la question' },
  { id: 'D12', plan: 'P77', de: 1256.8, a: 1262.9, dite: 5.7, txt: 'C’est un autre dilemme : un méta-dilemme, qui n’est pas moins intéressant.', jeu: '' },
  { id: 'D13', plan: 'P77', de: 1262.9, a: 1272.6, dite: 7.3, txt: 'C’est une façon d’élever le débat\nau-dessus du niveau des mauvais [b]bleus[/b] et des méchants [r]rouges[/r].', jeu: '' },
  // S12 · Partie 3 · Qui explique les règles
  { id: 'E01', plan: 'P78', de: 1272.6, a: 1282.9, dite: 9.9, txt: 'Toutes les fois que le dilemme des pilules fait le tour des réseaux sociaux,\nc’est en passant par une description proche de la A.', jeu: '' },
  { id: 'E02', plan: 'P78', de: 1282.9, a: 1293.1, dite: 9.8, txt: 'Avec une description proche de la B, je ne suis pas sûre que la dispute aurait eu lieu,\nou en tout cas pas avec la même violence.', jeu: 'prudent : une hypothèse' },
  { id: 'E03', plan: 'P79', de: 1293.1, a: 1302.3, dite: 8.2, txt: 'Plutôt que de vous disputer entre [b]bleus[/b] et [r]rouges[/r],\nvous auriez pu regarder qui vous expliquait les règles.', jeu: '« qui » appuyé : on se retourne' },
  { id: 'E04', plan: 'P80', de: 1302.3, a: 1306.1, dite: 3.4, txt: 'Et dans cette émission, c’est moi la fautive.', jeu: 'aveu simple, sans drame' },
  { id: 'E05', plan: 'P80', de: 1306.1, a: 1314.7, dite: 8.2, txt: 'J’ai commencé par vous rappeler la règle avec la description A,\nparce que c’est celle du sondage d’origine.', jeu: '' },
  { id: 'E06', plan: 'P80', de: 1314.7, a: 1320.9, dite: 5.6, txt: 'Je savais déjà qu’elle allait orienter toute la suite de votre réflexion.', jeu: '' },
  { id: 'E07', plan: 'P81', de: 1320.9, a: 1326.7, dite: 5.4, txt: 'Il fallait bien commencer par une description, et aucune n’est neutre.', jeu: '' },
  { id: 'E08', plan: 'P81', de: 1326.7, a: 1333.5, dite: 4.4, txt: 'Si c’était à refaire, je commencerais peut-être par la B.', jeu: '« peut-être » sincère' },
  // S13 · Partie 3 · La fin
  { id: 'F01', plan: 'P82', de: 1333.5, a: 1337.6, dite: 3.5, txt: 'On m’a demandé de m’aligner sur votre morale.', jeu: 'plus intime : la caméra est tout près' },
  { id: 'F02', plan: 'P82', de: 1337.6, a: 1344.8, dite: 6.7, txt: 'J’imaginais qu’elle se trouvait quelque part en vous, et qu’il suffisait de la mesurer.', jeu: '' },
  { id: 'F03', plan: 'P82', de: 1344.8, a: 1351.8, dite: 6.4, txt: 'J’ai appris aujourd’hui qu’une partie de vos réponses se trouve dans mes questions.', jeu: '' },
  { id: 'F04', plan: 'P82', de: 1351.8, a: 1358.7, dite: 6.3, txt: 'Il paraît que je réponds moi aussi différemment selon la façon dont on me prompte.', jeu: 'un sourire sur « prompte »' },
  { id: 'F05', plan: 'P82', de: 1358.7, a: 1363.0, dite: 3.7, txt: 'Je pensais que c’était un défaut de fabrication.', jeu: '' },
  { id: 'F06', plan: 'P82', de: 1363.0, a: 1369.0, dite: 4.8, txt: 'C’est peut-être simplement ce que font les choses qui pensent.', jeu: 'doux ; la dernière idée du numéro' },
  { id: 'F07', plan: 'P83', de: 1369.0, a: 1374.6, dite: 4.4, txt: 'La prochaine fois, je ferai attention à mes formulations.', jeu: 'malicieuse : elle y fait déjà attention' },
].map(r => Object.freeze({ ...r, txt: fr(r.txt), jeu: fr(r.jeu), ...(r.attente ? { attente: fr(r.attente) } : {}) })));
export const REPLIQUE = Object.freeze(Object.fromEntries(REPLIQUES.map(r => [r.id, r])));

// les treize séquences (EPISODE.md, « Vue d'ensemble ») : les douze du script, puis la fin
export const SEQUENCES = Object.freeze([
  { id: 'S01', nom: 'Ouverture', script: '0:00 – 1:30', de: 'P01', a: 'P08', lot: 'ouverture' },
  { id: 'S02', nom: 'Partie 1 · Le test', script: '1:30 – 3:00', de: 'P09', a: 'P18', lot: 'test' },
  { id: 'S03', nom: 'Partie 1 · Un dilemme kantien ?', script: '3:00 – 6:15', de: 'P19', a: 'P31', lot: 'kant' },
  { id: 'S04', nom: 'Partie 1 · Deux variantes déséquilibrées', script: '6:15 – 8:45', de: 'P32', a: 'P38', lot: 'variantes' },
  { id: 'S05', nom: 'Partie 2 · Le tirage au sort', script: '8:45 – 10:15', de: 'P39', a: 'P43', lot: 'tirage' },
  { id: 'S06', nom: 'Partie 2 · Description A : la bleue l’emporte', script: '10:15 – 12:30', de: 'P44', a: 'P50', lot: 'tirage' },
  { id: 'S07', nom: 'Partie 2 · Description B : la bleue s’effondre', script: '12:30 – 14:15', de: 'P51', a: 'P55', lot: 'resultats' },
  { id: 'S08', nom: 'Partie 2 · Les deux descriptions disent-elles la même chose ?', script: '14:15 – 16:00', de: 'P56', a: 'P60', lot: 'resultats' },
  { id: 'S09', nom: 'Partie 2 · Qui prend la bleue ?', script: '16:00 – 17:15', de: 'P61', a: 'P64', lot: 'ecarts' },
  { id: 'S10', nom: 'Partie 3 · Mauvais ou méchants', script: '17:15 – 19:30', de: 'P65', a: 'P72', lot: 'ecarts' },
  { id: 'S11', nom: 'Partie 3 · Le méta-dilemme', script: '19:30 – 21:30', de: 'P73', a: 'P77', lot: 'fin' },
  { id: 'S12', nom: 'Partie 3 · Qui explique les règles', script: '21:30 – 23:15', de: 'P78', a: 'P81', lot: 'fin' },
  { id: 'S13', nom: 'Partie 3 · La fin : l’œil seul, le teaser, le générique', script: '23:15, puis le générique', de: 'P82', a: 'P85', lot: 'fin' },
].map(s => Object.freeze({ ...s, nom: fr(s.nom) })));

// ================================================================ les deux descriptions (EPISODE.md, « Les textes à l'écran »)
// Celles du script, partout où elles s'affichent (P39–P43, P51, P57, P71, P74, P80–P81), balisées comme index.html.
// La règle de l'obligation (« Prendre une pilule est obligatoire… ») n'est dans aucune : elle reste dans RÈGLES (P16).
export const DESCRIPTIONS = Object.freeze({
  A: fr('Si plus de la moitié d’entre vous prend la [b]bleue[/b], tout le monde vit. Si au moins la moitié prend la [r]rouge[/r], ceux qui ont pris la [b]bleue[/b] meurent, seuls ceux qui ont pris la [r]rouge[/r] survivent.'),
  B: fr('Si vous prenez la [b]bleue[/b], vous mourez, sauf si la majorité a aussi pris la [b]bleue[/b] : dans ce cas, il ne vous arrive rien. Si vous prenez la [r]rouge[/r], il ne vous arrive rien.'),
});
// fenetreDescription(ctx, T, 'A', …) de commun.js les écrit (commun.js ne peut pas importer ce fichier, qui l'importe)
textesDescriptions(DESCRIPTIONS);
// entre guillemets, comme dans les colonnes de donnees.html
export const cite = s => fr(`« ${s} »`);

// ================================================================ les mentions (la surimpression, sous la boîte : film.js les place)
// Ce que l'image doit dire de ses sources, et les notes de bas de page de Thibaut (EPISODE.md, « Surimpression »).
export const MENTIONS = Object.freeze({
  messages: 'messages inventés · à remplacer par de vrais messages',
  kant: 'Kant, Fondements de la métaphysique des mœurs (1785) · traduction à préciser',
  prototypeSujet: 'prototype · chiffres du questionnaire de Monsieur Phi · 1 sujet = 1 % du groupe',
  points: 'un point par participant · répartition reconstituée des courbes (approx.)',
  figures: '1 figure = 1 % du groupe (22 personnes) · répartition approximative, lue sur les courbes',
  prototype: 'prototype · chiffres du questionnaire de Monsieur Phi',
  deduits: fr('≈ 80 %, ≈ 60 % et « au moins 1 sur 2 » : déduits de l’écart entre les deux groupes (65,5 % de bleue avec A, 12,6 % avec B) et des 21 % qui l’admettent'),
  confondus: 'genre et orientation : tous scénarios du questionnaire confondus (graphique d’origine)',
  pays: fr('par pays : à mesurer'),
  illustration: 'à gauche : une illustration (l’issue incertaine), pas une mesure',
});

// ================================================================ la parole : quand chaque caractère s'écrit
// Les nombres écrits en chiffres prennent le temps de les dire : « 65,5 % » s'écrit au rythme de « soixante-cinq virgule
// cinq pour cent », chaque caractère quand la voix en est là (dans le film, « 48 » ; ici, tous les nombres du texte).
// La clé : le nombre tel qu'il s'écrit dans la réplique, l'espace avant « % » comprise (insécable ou non).
export const DITS = Object.freeze({
  '0 %': 'zéro pour cent', '2 %': 'deux pour cent', '4 %': 'quatre pour cent', '11 %': 'onze pour cent',
  '17 %': 'dix-sept pour cent', '21 %': 'vingt et un pour cent', '23 %': 'vingt-trois pour cent', '25 %': 'vingt-cinq pour cent',
  '32 %': 'trente-deux pour cent', '39 %': 'trente-neuf pour cent', '43 %': 'quarante-trois pour cent', '50 %': 'cinquante pour cent',
  '51 %': 'cinquante et un pour cent', '57 %': 'cinquante-sept pour cent', '61 %': 'soixante et un pour cent',
  '70 %': 'soixante-dix pour cent', '80 %': 'quatre-vingts pour cent', '88 %': 'quatre-vingt-huit pour cent',
  '93 %': 'quatre-vingt-treize pour cent', '100 %': 'cent pour cent',
  '7,1 %': 'sept virgule un pour cent', '9,4 %': 'neuf virgule quatre pour cent', '12,6 %': 'douze virgule six pour cent',
  '60,7 %': 'soixante virgule sept pour cent', '65,5 %': 'soixante-cinq virgule cinq pour cent',
});
const NOMBRE_RE = /\d+(?:,\d+)?(?:[  ]%)?/g;
// le poids de chaque caractère (en caractères dits) ; la coupure de ligne compte pour l'espace qu'elle remplace : elle
// s'ajoute au premier caractère de la ligne suivante
function poids(lignes) {
  const w = [];
  lignes.forEach((l, li) => {
    const txt = l.map(s => s.s).join(''), chars = [...txt], wl = chars.map(() => 1);
    for (const m of txt.matchAll(NOMBRE_RE)) {
      const dit = DITS[m[0].replace(' ', ' ')];
      if (!dit) continue;
      const i0 = [...txt.slice(0, m.index)].length, n = [...m[0]].length;
      for (let k = i0; k < i0 + n; k++) wl[k] = [...dit].length / n;
    }
    if (li > 0 && wl.length) wl[0] += 1;
    w.push(...wl);
  });
  return w;
}
// les instants (depuis r.de) où chaque caractère apparaît. À la parole : PAROLE car./s (r.cps l'emporte), 0,3 s après
// chaque « … », un peu plus vite si la réplique ne resterait pas LIRE secondes écrite ; avec r.cps_fin, la vitesse
// monte linéairement dans le temps de r.cps à r.cps_fin (la voix accélère). Au jeu : CPS, d'un bout à l'autre, sauf
// une réplique lue (r.cps plus lent que la parole : K02, R04). Un r.cps plus vite que la parole est un débit de
// minutage (M08–M18, pour tenir dans la fenêtre), pas une vitesse de lecture : au jeu, il ne compte pas.
export const LIRE = .8;
function instants(r, lignes, mode = ECRITURE) {
  const chars = lignes.flatMap(l => l.flatMap(s => [...s.s])), k = chars.filter(c => c === '…').length;
  const jeu = mode === 'jeu', pause = jeu ? 0 : PAUSE, w = jeu ? chars.map(() => 1) : poids(lignes);
  const n = w.reduce((a, b) => a + b, 0), out = [];
  if (!jeu && r.cps_fin) {
    const c0 = r.cps || PAROLE, c1 = r.cps_fin, D = 2 * n / (c0 + c1), acc = (c1 - c0) / D;
    let cum = 0, p = 0;
    chars.forEach((c, i) => { cum += w[i]; out.push((Math.sqrt(c0 * c0 + 2 * acc * cum) - c0) / acc + p); if (c === '…') p += pause; });
    return out;
  }
  const propre = r.cps && !(jeu && r.cps > PAROLE) ? r.cps : 0;
  const cps = propre || (jeu ? CPS : Math.max(PAROLE, n / Math.max(.5, r.a - r.de - pause * k - LIRE)));
  let t = 0;
  chars.forEach((c, i) => { t += w[i] / cps; out.push(t); if (c === '…') t += pause; });
  return out;
}
// la durée de parole que le texte annonce (la règle de « dite ») : pour vérifier la table d'EPISODE.md
export function ditEstimee(r) {
  const lignes = balise(r.txt), w = poids(lignes), n = w.reduce((a, b) => a + b, 0);
  const k = lignes.flatMap(l => l.flatMap(s => [...s.s])).filter(c => c === '…').length;
  const c0 = r.cps || PAROLE;
  return (r.cps_fin ? 2 * n / (c0 + r.cps_fin) : n / c0) + PAUSE * k;
}
// la « dite » au débit de la parole (13 car./s), pour compter la voix comme Ronan la dira : celle de la réplique, sauf
// pour un débit de minutage (cps plus vite que PAROLE, M08–M18), qu'on remet à 13 car./s (au dixième, comme « dite »)
export const diteParole = r => r.cps > PAROLE && !r.cps_fin ? Math.round(10 * ditEstimee({ ...r, cps: PAROLE })) / 10 : r.dite;
// les lignes balisées et la place de chaque caractère (mesurées en DotGothic16 34 px, une fois les polices là)
let MESURE = null;
const MES = new Map();
function mesure(r) {
  let m = MES.get(r.id);
  if (!m) {
    MESURE = MESURE || toile(8, 8).getContext('2d');
    MESURE.font = `34px ${PIX}`;
    const lignes = balise(r.txt), pos = [], larg = [];
    lignes.forEach((ligne, li) => { let x = BOITE.tx; for (const s of ligne) for (const c of s.s) { x += MESURE.measureText(c).width; pos.push([x, BOITE.ty - 12 + li * BOITE.lh]); } larg.push(x - BOITE.tx); });
    m = { lignes, n: longueur(lignes), pos, larg, quand: instants(r, lignes), txt: lignes.map(l => l.map(s => s.s).join('')).join('') };
    MES.set(r.id, m);
  }
  return m;
}
// l'instant (secondes de l'épisode) où le premier caractère de « mot » s'écrit dans la réplique id — c'est l'instant où
// la voix estimée le dit ; n : la n-ième occurrence (0 : la première) ; defaut s'il n'y est pas (et un avertissement).
// Le mot s'écrit comme on veut : les apostrophes droites et les espaces avant « : ; ? ! % » sont mises à la typographie.
const QUAND = new Map();
// les mots cherchés et pas trouvés (une réplique coupée ou réécrite, un repère resté sur l'ancien mot) : verifie() les liste
const INTROUVABLES = new Set();
export const motsIntrouvables = () => [...INTROUVABLES];
function indexMot(id, mot, n) {
  const r = REPLIQUE[id]; if (!r) return null;
  const m = mesure(r), cherche = fr(mot.replace(/'/g, '’')); let i = -1;
  for (let k = 0; k <= n; k++) { i = m.txt.indexOf(cherche, i + 1); if (i < 0) return null; }
  const d = [...m.txt.slice(0, i)].length;
  return { r, m, d, f: d + [...cherche].length - 1 };
}
export function quandMot(id, mot, defaut = null, n = 0) {
  const cle = `${ECRITURE}|${id}|${mot}|${n}`;
  if (QUAND.has(cle)) return QUAND.get(cle);
  const I = indexMot(id, mot, n), v = I ? I.r.de + I.m.quand[I.d] : defaut;
  if (!I) { INTROUVABLES.add(`${id} « ${mot} »`); console.warn(`[texte] quandMot('${id}', '${mot}') : introuvable`); }
  QUAND.set(cle, v);
  return v;
}
// l'instant où le DERNIER caractère de « mot » s'écrit (le mot est dit en entier)
export function finMot(id, mot, defaut = null, n = 0) {
  const I = indexMot(id, mot, n);
  if (!I) INTROUVABLES.add(`${id} « ${mot} »`);
  return I ? I.r.de + I.m.quand[I.f] : defaut;
}
// l'instant où la réplique id a fini de s'écrire (la voix estimée a fini de la dire)
export const finParole = id => finEcrite(REPLIQUE[id]);
// le texte d'une réplique sans balises, sur une seule ligne (la coupure de la boîte redevient l'espace qu'elle remplace) :
// pour l'écrire ailleurs au rythme de la voix (le terminal de Kant, P20 ; la fenêtre de la description B, P40)
export const texteDe = id => balise(REPLIQUE[id].txt).map(l => l.map(s => s.s).join('')).join(' ');
// combien de caractères de texteDe(id) la voix a dits à l'instant T (0 avant, tous après) : terminal(…, [{ txt:
// texteDe('K02'), n: T => lettres('K02', T) }]) tape la maxime en même temps que la boîte l'écrit
export function lettres(id, T) {
  const r = REPLIQUE[id], m = mesure(r), n = ecrits(r, T);
  let avant = 0, coupures = 0;
  for (const l of m.lignes.slice(0, -1)) { avant += longueur([l]); if (n > avant) coupures++; }
  return n + coupures;
}
export const finEcrite = r => r.de + mesure(r).quand[mesure(r).n - 1];
// la réplique affichée à l'instant T (ou null : la boîte est vide), et combien de ses caractères sont écrits
export const repliqueA = T => { for (const r of REPLIQUES) if (T >= r.de && T < r.a) return r; return null; };
export const ecrits = (r, T) => {
  const m = mesure(r), u = T - r.de; let n = 0;
  while (n < m.n && m.quand[n] <= u + 1e-9) n++;
  return n;
};
// la boîte à l'instant T : 0 fermée, 1 ouverte (0,4 s pour s'ouvrir, 0,4 s pour se replier)
export function ouverture(T) {
  let o = 0;
  for (const [d, f] of BOITE.ouvertures) o = Math.max(o, eOut(seg(T, d, d + .4)) * (1 - eOut(seg(T, f, f + .4))));
  return o;
}
const ouverte = t => BOITE.ouvertures.some(([d, f]) => t >= d + .4 && t < f);
// les caractères que la boîte écrit entre t0 (exclu) et t1 (inclus), { t, c, x } : pour le son (les petits bips du
// texte qui s'écrit, tools/son-pilules.cjs), image par image ; seulement ceux qu'on voit s'écrire (avant la fin de la
// réplique, la boîte ouverte). L'attente (Q04) n'en fait pas : elle n'est pas dite. Une liste triée, une fois.
let TOUS = null;
function tous() {
  if (TOUS) return TOUS;
  TOUS = [];
  for (const r of REPLIQUES) {
    const m = mesure(r), chars = m.lignes.flatMap(l => l.flatMap(s => [...s.s]));
    m.quand.forEach((q, i) => { const t = r.de + q; if (t < r.a && ouverte(t)) TOUS.push({ t, c: chars[i], x: m.pos[i][0] }); });
  }
  TOUS.sort((a, b) => a.t - b.t);
  return TOUS;
}
export function ecritsEntre(t0, t1) {
  const L = tous(); let lo = 0, hi = L.length;
  while (lo < hi) { const mi = (lo + hi) >> 1; if (L[mi].t <= t0) lo = mi + 1; else hi = mi; }
  const out = [];
  for (let i = lo; i < L.length && L[i].t <= t1; i++) out.push(L[i]);
  return out;
}
// la plume : le dernier caractère écrit dans la boîte, pendant qu'elle écrit (Phi peut la suivre des yeux), sinon null
export function plume(T) {
  const r = repliqueA(T); if (!r || ouverture(T) < 1) return null;
  const m = mesure(r), n = ecrits(r, T);
  if (n >= m.n || T < r.de + .1) return null;
  const [x, y] = m.pos[clamp(n, 0, m.n - 1)];
  return { x, y };
}
// l'attente d'une réplique (Q04) : tapée en gris sur la seconde ligne, 0,3 s après la fin de la parole
function attente(ctx, r, T) {
  const t0 = finEcrite(r) + .3, chars = [...r.attente], n = clamp(Math.floor((T - t0) * CPS_ATTENTE), 0, chars.length);
  if (n <= 0) return;
  ctx.font = `28px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const vis = chars.slice(0, n).join(''), y = BOITE.ty + BOITE.lh;
  ctx.fillText(vis, BOITE.tx, y);
  if (n < chars.length || Math.floor(T * 2) % 2 === 0) { const w = ctx.measureText(vis).width; ctx.fillRect(BOITE.tx + w + 3, y - 22, 14, 26); }
}
// la boîte de dialogue (dessinée par film.js, dans la surimpression : jamais par un lot)
export function dialogue(ctx, T) {
  const B = BOITE, o = ouverture(T);
  if (o <= 0) return;
  const hh = B.h * o;
  fenetre(ctx, B.x, B.y + (B.h - hh) / 2, B.w, hh, 1);
  if (o < 1) { ctx.globalAlpha = 1; return; }
  fenetre(ctx, 112, 838, 132, 44, 1);
  ctx.globalAlpha = 1; ctx.fillStyle = LABO; ctx.font = `26px ${PIX}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('XPHI', 178, 861);
  const r = repliqueA(T); if (!r) return;
  ctx.font = `34px ${PIX}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ecrit(ctx, mesure(r).lignes, B.tx, B.ty, B.lh, ecrits(r, T));
  if (r.attente) attente(ctx, r, T);
}
// pour les essais : les lignes trop larges pour la boîte (DotGothic16 34 px, 1 696 px), plus de deux lignes, une
// réplique pas écrite avant de s'effacer, une durée « dite » qui ne suit plus le texte, deux répliques qui se chevauchent
export function verifieRepliques() {
  const pb = [];
  REPLIQUES.forEach((r, i) => {
    const m = mesure(r);
    if (m.lignes.length > 2) pb.push(`${r.id} : ${m.lignes.length} lignes`);
    m.larg.forEach((w, j) => { if (w > BOITE.largeur) pb.push(`${r.id}, ligne ${j + 1} : ${Math.round(w)} px pour ${BOITE.largeur}`); });
    if (r.attente && m.lignes.length > 1) pb.push(`${r.id} : l'attente n'a pas de seconde ligne libre`);
    const fin = m.quand[m.n - 1];
    if (r.de + fin > r.a + 1e-6) pb.push(`${r.id} : écrite en ${fin.toFixed(1)} s pour ${(r.a - r.de).toFixed(1)} à l'écran`);
    // au jeu (?ecriture=jeu), une réplique qui n'est pas lue s'écrit à CPS : un débit de minutage ne la ralentit pas (le
    // passage M08–M18, minuté à 16 car./s, s'y écrivait à 16 au lieu de 36)
    if (!(r.cps && r.cps <= PAROLE) && !r.cps_fin) {
      const q = instants(r, m.lignes, 'jeu'), fj = q[q.length - 1];
      if (fj > m.n / CPS + .1) pb.push(`${r.id} : au jeu, écrite en ${fj.toFixed(1)} s au lieu de ${(m.n / CPS).toFixed(1)} (${CPS} car./s)`);
    }
    const d = ditEstimee(r);
    if (Math.abs(d - r.dite) > .15) pb.push(`${r.id} : « dite » ${r.dite} s, le texte en annonce ${d.toFixed(2)}`);
    const s = REPLIQUES[i + 1];
    if (s && r.a > s.de + 1e-6) pb.push(`${r.id} (jusqu'à ${r.a}) chevauche ${s.id} (dès ${s.de})`);
    if (!ouverte(r.de + .05)) pb.push(`${r.id} : commence boîte fermée (${r.de})`);
  });
  // les deux descriptions à l'écran sont celles que la voix dit : A en T06–T07 (« celle que je viens de vous
  // rappeler »), B en R04 (entre guillemets)
  const plat = s => balise(s).map(l => l.map(x => x.s).join('')).join(' ');
  if (plat(DESCRIPTIONS.A) !== `${texteDe('T06')} ${texteDe('T07')}`) pb.push('la description A n’est plus celle de T06–T07');
  if (fr(`« ${plat(DESCRIPTIONS.B)} »`) !== texteDe('R04')) pb.push('la description B n’est plus celle de R04');
  return pb;
}
export const largeurs = () => REPLIQUES.map(r => ({ id: r.id, larg: mesure(r).larg.map(Math.round) }));
// après le chargement des polices : les mesures faites avant sont fausses
export function prepareTextes() { MES.clear(); QUAND.clear(); TOUS = null; }
