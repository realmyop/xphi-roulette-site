/* ==========================================================================
   Les deux pilules, l'épisode — partage.js : un autre nom pour commun.js

   EPISODE.md (« Le socle ») appelle partage.js « ce que plusieurs lots
   dessinent pareil » : le terminal, RÈGLES et l'étiquette « A », les fenêtres
   de description, le fil des réseaux, la vague, l'anneau, Kant et Nietzsche,
   les poses nouvelles, les bulles, Alice, le tirage, la devinette, les vrais
   humains. Tout cela est écrit À LA FIN DE commun.js (avec les bonshommes du
   film de 3 min 20, dans le même module) ; ce fichier le réexporte, pour que
   import { portrait, vague } from '../partage.js' marche aussi, avec les
   DESCRIPTIONS de texte.js. Les mêmes objets, le même code : rien d'autre ici.
   Le socle : les lots ne le modifient pas.
   ========================================================================== */
export * from './commun.js';
export { DESCRIPTIONS } from './texte.js';
