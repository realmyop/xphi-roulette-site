/* ==========================================================================
   Les deux pilules, l'épisode — plans/tirage-temps.js : le minutage du lot « tirage »

   Chaque geste des plans P39–P50 tombe sur son mot : quandMot (texte.js),
   l'instant où la boîte écrit le mot, c'est-à-dire où la voix (estimée, puis
   enregistrée par Ronan) le dit. Les nombres d'EPISODE.md ne sont pas
   recopiés : ils redonnent ce que calcule ce fichier aujourd'hui (le
   commentaire de chaque ligne le dit), et suivront la voix le jour où elle
   sera posée. Seules les bornes des plans (B) sont des nombres : celles de la
   table « Les plans » (film.js, DECOUPAGE).
   ========================================================================== */
import { sautsTirage } from '../commun.js';
import { REPLIQUE, quandMot, finParole } from '../texte.js';

const mot = (id, m, n = 0) => quandMot(id, m, REPLIQUE[id].de, n);
const de = id => REPLIQUE[id].de;
const fin = id => finParole(id);

// les bornes des plans (EPISODE.md, « Les plans »)
export const B = Object.freeze({
  P39: 526.9, P40: 543.8, P41: 558.1, P42: 578.0, P43: 600.3, P44: 618.2,
  P45: 639.0, P46: 654.6, P47: 676.3, P48: 698.8, P49: 721.1, P50: 734.4, fin: 756.2,
});

export const S = (() => {
  const s = {};
  // ---------------------------------------------------------------- P39 · l'écran se dédouble
  s.foule = B.P39;                                        // la foule du test paraît en fondu (0,4 s), sous l'œil
  s.dedouble1 = Math.max(B.P39 + 1.2, de('R01'));         // 528,3 : chaque sujet s'est doublé, les copies sont posées
  s.dedouble0 = s.dedouble1 - 1;                          // 527,3
  s.tirage = mot('R01', 'tiré au sort');                  // 530,0 : le cadre laiton saute d'une grille à l'autre
  s.sauts = sautsTirage(s.tirage, 8, .12, .6);            // huit sauts qui ralentissent ; le neuvième instant : entre les deux
  s.entre = s.sauts[8];                                   // il s'arrête ENTRE les deux grilles (pas de clac)
  s.moitie = mot('R02', 'Une moitié');                    // Phi regarde la grille de gauche
  s.regles = mot('R02', 'celle que je viens');            // 537,4 : RÈGLES revient, en haut à droite
  s.glisse0 = s.regles + .25; s.glisse1 = s.glisse0 + .9; // elle glisse sur la colonne de gauche
  s.morph = s.glisse1 - .05;                              // ses règles se défont et se recomposent en la description A
  s.etiq0 = Math.max(mot('R02', 'rappeler'), s.morph + .7);   // l'étiquette « A » grandit…
  s.etiq1 = s.etiq0 + .6;                                 // … et devient le titre (un declic)
  s.titre1 = s.etiq1 + .4;                                // « DESCRIPTION A » écrit
  s.fenB = mot('R03', 'celle-ci');                        // 542,4 : la fenêtre B s'ouvre, vide
  // ---------------------------------------------------------------- P40 · celle-ci (R04, 12,6 car./s)
  s.r04 = de('R04'); s.r04fin = fin('R04');
  s.mourez = mot('R04', 'vous mourez');                   // 546,0 : doute
  s.rien = mot('R04', 'il ne vous arrive rien');          // 551,6 : neutre
  // ---------------------------------------------------------------- P41 · les mêmes issues
  s.p41 = B.P41;                                          // les grilles baissent, le filet s'efface
  s.demonte0 = B.P41 + .25; s.demonte1 = s.demonte0 + .9; // les descriptions se démontent en morceaux
  s.issues = B.P41 + .5;                                  // les deux issues paraissent
  s.verif0 = fin('R05'); s.verif1 = de('R06');            // 560,3–562,9 : le temps de vérifier, en silence
  s.egal = mot('R06', 'exactement');                      // 564,8 : « = »
  s.issue1 = mot('R07', 'tout le monde vit');             // 569,5 : l'issue 1 s'allume
  s.issue2 = mot('R08', 'Sinon');                         // 571,6 : l'issue 2 s'allume
  s.meurent = mot('R08', 'meurent');                      // 574,0 : ses bleus partent en caractères
  s.vivent = mot('R08', 'vivent');                        // 576,8 : ses rouges lèvent les bras
  // ---------------------------------------------------------------- P42 · l'ordre et la tournure
  s.ordre = mot('R09', 'l\'ordre');                       // 579,6 : les morceaux de B prennent l'ordre de A
  s.tournure = mot('R09', 'la tournure');                 // 580,4 : les mots qui diffèrent pulsent
  s.ordreRetour = Math.max(fin('R09') - .3, s.tournure + 1.3);   // ils reviennent à leur place
  s.titreA = mot('R10', 'la description A');              // 584,7
  s.titreB = mot('R10', 'la description B');              // 587,0
  s.plusTard = mot('R11', 'Plus tard');                   // 589,0 : issues et fils s'effacent, les grilles reviennent
  s.autre = mot('R11', 'l\'autre description');           // 592,2 : chaque grille regarde l'autre fenêtre
  s.premier = mot('R11', 'en premier');                   // 598,8 : « lue en premier »
  // ---------------------------------------------------------------- P43 · un peu mieux compris
  s.compris = mot('R12', 'mieux compris');                // 602,4 : ✓ LABO au-dessus de chacun
  s.neufQuatre = mot('R13', '9,4 %');                     // 606,5 : neuf ✗ à gauche, et un dixième à 40 %
  s.septUn = mot('R14', '7,1 %');                         // 615,6 : sept ✗ à droite, et un huitième à 10 %
  s.reexplique = fin('R14') + .1;                         // 617,4 : les fenêtres pulsent (on leur a réexpliqué)
  s.corrige = s.reexplique + .3;                          // les ✗ redeviennent des ✓
  // ---------------------------------------------------------------- P44 · devinette A (écran 01, pas 0)
  s.d0 = B.P44;
  s.compte0 = fin('A02'); s.compte1 = de('A03');          // 628,9–633,4 : le compte à rebours, en silence
  s.insout = mot('A03', 'insoutenable');                  // 636,9 : plisse, parfaitement immobile
  s.suspense = fin('A03');                                // 637,8 : trois pouls graves
  // ---------------------------------------------------------------- P45 · 65,5 % (pas 1 et 2)
  s.d1 = de('A04') - 2.6;                                 // 639,0 : la jauge se remplit (sa boîte « 65,5 % » à la voix)
  s.d2 = mot('A05', 'tout le monde survit');              // 649,6 : la vie, le tampon
  s.felic = mot('A06', 'Félicitations');                  // 651,9 : Phi vous regarde
  s.chers = mot('A06', 'chers humains');                  // 652,9 : les cent se tournent vers Phi ; grand
  // ---------------------------------------------------------------- P46 · une expérience de pensée
  s.pensee = mot('A07', 'expérience de pensée');          // 657,4 : la bulle sort de l'œil
  s.vraies = mot('A08', 'vraies pilules');                // 660,3 : son contour tremble
  s.haute = mot('A08', 'aussi haute');                    // 665,5 : le fantôme de la jauge
  s.autor = mot('A09', 'l\'autorisation');                // 668,3 : le petit terminal
  s.malheur = mot('A09', 'malheureusement');              // 671,3 : « refusé » ; Phi vous regarde
  s.refuse = s.malheur - .3;
  s.inassouvie = mot('A10', 'inassouvie');                // 674,7 : la bulle éclate
  // ---------------------------------------------------------------- P47 · prédire les autres (écran 02)
  s.e0 = B.P47;
  s.predire = mot('A11', 'prédire');                      // 679,6 : la pluie des 2 222 points
  s.moy = mot('A12', '60,7');                             // 685,9 : « MOYENNE DES PRÉDICTIONS 60,7 % »
  s.pres = mot('A12', 'très près');                       // 688,6 : le tireté réel et la moyenne clignotent
  s.feliciter = mot('A13', 'féliciter');                  // 692,4 : grand
  s.ravise = mot('A13', 'ravisée');                        // 694,4 : plisse ; poussée ×1 → ×1,3 dans le nuage
  // ---------------------------------------------------------------- P48 · deux nuages
  s.cond1 = de('A14') - .2;                               // 701,0 : condensés en bonshommes
  s.cond0 = s.cond1 - 1;                                  // 700,0 : la condensation (la mention change, film.js)
  s.sep0 = s.cond0 - 1.2;                                 // 698,8 : chaque point prend sa couleur, le nuage se sépare
  s.moyR = mot('A14', '25 %');                            // 705,3 : « ROUGES : MOYENNE 25 % »
  s.zero = mot('A14', '0 %');                             // 710,9 : la pile à 0 % cernée
  s.moyB = mot('A15', '80 %');                            // 716,6 : « BLEUS : MOYENNE 80 % »
  s.cent = mot('A15', 'beaucoup');                        // 718,4 : la pile à 100 % s'illumine
  // ---------------------------------------------------------------- P49 · chacun comme lui
  s.gros = de('A16');                                     // 721,1 : deux gros plans, le reflet de leur couleur
  s.cligne = fin('A16');                                  // 725,0 : ils clignent, chacun à son rythme
  s.retour = mot('A17', 'sens opposés') - .25;            // 728,6 : retour au graphique, deux flèches
  s.hasard = mot('A17', 'presque par hasard');            // 732,2 : la moyenne retombe comme un dé
  // ---------------------------------------------------------------- P50 · leur propre mort
  s.intrigue = mot('A18', 'intriguée');                    // 735,3 : curieux
  s.pousse0 = de('A18') + .2; s.pousse1 = s.pousse0 + 4;  // la poussée ×1 → ×2,2 sur les bleus sous 50 %
  s.sous50 = mot('A19', 'moins de 50 %');                 // 741,5 : les trois cernés
  s.mort = mot('A20', 'leur propre mort');                // 747,3 : leurs fantômes, qui partent en caractères
  s.quandMeme = mot('A20', 'quand même');                 // 750,4 : ils lèvent les yeux vers Phi
  s.perplexe = mot('A21', 'perplexe');                    // 754,5 : doute, un long clignement
  s.recul0 = de('A21') + .3; s.recul1 = B.fin - .4;       // le retour ×1 : l'écran 02 entier pour la coupe
  return Object.freeze(s);
})();
