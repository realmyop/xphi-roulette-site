/* ==========================================================================
   Les deux pilules, l'épisode — plans/fin.js : le lot « fin »
   P73–P85, de 1169,4 à 1401,4 s (19:29,4–23:21,4), répliques D01–F07.
   Partie 3 · Le méta-dilemme (dans le script : 19:30 – 21:30, écrans 11 et
   12 de Thibaut) ; Qui explique les règles (21:30 – 23:15) ; l'œil seul, le
   teaser, l'œil qui se ferme, le générique de fin.

   Ronan : « Toutes les séquences du script, dans l'ordre, avec le texte de
   Thibaut tel quel pour la voix et les images qu'il indique. On reprend son
   test et ses douze écrans de résultats, avec les nouveaux bonshommes, et on
   crée le reste (Kant, Alice, Nietzsche, le méta-dilemme). » Puis : « je veux
   que tu prennes les petits bonhommes que tu as dans le premier film de 3
   minutes 20, on est bien d'accord ? » Ici, les bonshommes du film (commun.js :
   dessineSujet, les sujets de démonstration DEMO, les cent premiers
   participants PREMIERS, le N°48 et ses crochets) deviennent de vrais humains
   (une ombre, une respiration, un pouls, plus de reflet), regardent deux
   fenêtres de description à la place des deux pilules, peuplent les écrans 11
   et 12 de Thibaut (resultats.js), et traversent le générique en file.

   Le lot est en quatre fichiers :
   - plans/fin-temps.js : le minutage, chaque geste calé sur son mot (quandMot) ;
   - plans/fin-meta.js : P73–P77, le méta-dilemme (le laboratoire, le balayage,
     les fenêtres A et B, le N°48 ; les écrans 11 et 12 ; le repli en deux
     fenêtres-icônes et la grue) ;
   - plans/fin-aveu.js : P78–P81, qui explique les règles (le fil et ses
     étiquettes « A », le volet « hypothèse », les pointillés vers l'œil ; RÈGLES
     qui devient « DESCRIPTION A », le fil des cartouches, la fenêtre NEUTRE, le
     cadre qui se pose sur B) ;
   - plans/fin-nuit.js : P82–P85, l'œil seul (la lame décalée, la poussière qui
     tourne), le teaser, la fermeture, le générique.
   Leurs en-têtes disent les choix et les écarts au découpage (les fenêtres de
   P74 sous le cartouche, la poussée ×1,12, le fil de P78 descendu d'une carte,
   l'œil de P78 décalé, la grue lue comme un étage qui monte avec la caméra).

   Raccords :
   - entrée (1169,4 s) : coupe franche depuis l'écran 10 (lot ecarts) ; la foule
     des sujets de démonstration paraît en fondu (1 s) ;
   - sortie (1401,4 s) : le noir (fondu d'une seconde), fin de l'épisode. La
     boîte se ferme avec l'œil (P84) et le cartouche s'en va à P82 : le socle.

   Essais : index.html?plan=fin (le lot en boucle), ?plan=P74, ?t=1202.2 ; dans
   la console, (await import('./plans/fin.js')).ESSAI : le minutage du lot.
   ========================================================================== */
import { B, S } from './fin-temps.js';
import { dessineP73, dessineP74, dessineP75, dessineP76, dessineP77, CAM74, SONS_META } from './fin-meta.js';
import { dessineP78, dessineP79, dessineP80, dessineP81, CAM79, SONS_AVEU } from './fin-aveu.js';
import { dessineP82, dessineP83, dessineP84, dessineP85, SONS_NUIT } from './fin-nuit.js';

export const LOT = { id: 'fin', de: 1169.4, a: 1401.4 };

// les plans (EPISODE.md, « Les plans ») : des coupes franches, sauf le générique, qui sort du noir et y retourne
export const PLANS = [
  { id: 'P73', de: B.P73, a: B.P74, dessine: dessineP73 },                                  // De vrais humains (D01–D02)
  { id: 'P74', de: B.P74, a: B.P75, dessine: dessineP74, camera: CAM74 },                   // Vous décidez de la description (D03–D06)
  { id: 'P75', de: B.P75, a: B.P76, dessine: dessineP75 },                                  // Ce que vous avez répondu (D07–D09) : écran 11
  { id: 'P76', de: B.P76, a: B.P77, dessine: dessineP76 },                                  // Deux scénarios (D10–D11) : écran 12
  { id: 'P77', de: B.P77, a: B.P78, dessine: dessineP77 },                                  // Élever le débat (D12–D13) : la grue
  { id: 'P78', de: B.P78, a: B.P79, dessine: dessineP78 },                                  // Une description proche de la A (E01–E02)
  { id: 'P79', de: B.P79, a: B.P80, dessine: dessineP79, camera: CAM79 },                   // Qui vous expliquait les règles (E03)
  { id: 'P80', de: B.P80, a: B.P81, dessine: dessineP80 },                                  // C'est moi la fautive (E04–E06)
  { id: 'P81', de: B.P81, a: B.P82, dessine: dessineP81 },                                  // Aucune n'est neutre (E07–E08)
  { id: 'P82', de: B.P82, a: B.P83, dessine: dessineP82 },                                  // L'œil, seul (F01–F06)
  { id: 'P83', de: B.P83, a: B.P84, dessine: dessineP83 },                                  // La prochaine fois (F07)
  { id: 'P84', de: B.P84, a: B.P85, dessine: dessineP84 },                                  // L'œil se ferme (sans voix)
  { id: 'P85', de: B.P85, a: B.FIN, dessine: dessineP85, entree: { type: 'noir', d: .8 }, sortie: { type: 'noir', d: 1 } },   // Générique de fin
];

// les indices sonores, en temps absolu, dans le vocabulaire de tools/son-pilules.cjs (film.js : VOCABULAIRE)
export const SONS = Object.freeze([...SONS_META, ...SONS_AVEU, ...SONS_NUIT].sort((a, b) => a.t - b.t));

// pour la console : le minutage du lot (les mots et leurs instants), les bornes des plans
export const ESSAI = Object.freeze({ S, B });
