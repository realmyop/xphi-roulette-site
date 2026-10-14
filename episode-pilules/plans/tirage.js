/* ==========================================================================
   Les deux pilules, l'épisode — plans/tirage.js : le lot « tirage »
   P39–P50, de 526,9 à 756,2 s (8:46,9–12:36,2), répliques R01–A21.
   Partie 2 · Le tirage au sort (dans le script : 8:45 – 10:15) ; Description A :
   la bleue l'emporte (10:15 – 12:30) — les écrans 01 et 02 de Thibaut.

   Ronan : « Toutes les séquences du script, dans l'ordre, avec le texte de
   Thibaut tel quel pour la voix et les images qu'il indique. On reprend son
   test et ses douze écrans de résultats, avec les nouveaux bonshommes » ;
   « je veux que tu prennes les petits bonhommes que tu as dans le premier
   film de 3 minutes 20 ». Ici, les bonshommes du film (commun.js :
   dessineSujet), la foule des cent premiers participants (PREMIERS).

   Trois fichiers, deux décors :
   - plans/tirage-colonnes.js (P39–P43) : la mise en page des colonnes — la
     foule du test qui se dédouble, le tirage qui ne se pose pas, RÈGLES qui
     devient la description A (son étiquette « A » devient le titre), la
     description B à la voix, les morceaux de phrase, leurs fils et les deux
     issues, l'ordre et la tournure, « lue en premier », les erreurs au test ;
   - plans/tirage-ecrans.js (P44–P50) : les écrans 01 et 02 de Thibaut
     (resultats.js), la devinette et son silence, la bulle de pensée, la pluie
     d'un point par participant et sa condensation en figures, les gros plans,
     les fantômes ;
   - plans/tirage-temps.js : le minutage, chaque geste calé sur son mot
     (quandMot de texte.js).
   Chaque plan n'est qu'un moment de son décor : rien ne saute aux frontières
   des plans, sauf les coupes franches voulues (P43 → P44, l'écran 01 ; P46 →
   P47, l'écran 02 ; les gros plans de P49, aller et retour).

   Ce qui s'écarte du découpage (EPISODE.md), et pourquoi :
   - les fenêtres de COLONNES (y 60–300) passeraient sous le cartouche
     (x 40–388, y 32–132), qui cacherait « DESCRIPTION A » et l'étiquette qui
     le devient : elles sont posées en y 146–336, les grilles 40 px plus bas
     (comme le film, qui avait descendu ses fenêtres « pour laisser respirer
     le cartouche ») ; à reporter dans COLONNES pour P71, P74, P80–P81 ;
   - démontées (P41–P42), les fenêtres se resserrent vers les bords (540 px)
     pour laisser le milieu aux issues (x 760–1 160, y 322–518 et 562–758) ;
   - « 9,4 % » et « 7,1 % » (P43) se posent à côté des grilles : dessous, il
     n'y a plus la place au-dessus de y 830 ;
   - la pluie (P47) se pose en colonnes de 220 points au plus (dix figures de
     Thibaut × 22 personnes) : chaque paquet d'environ 22 points devient
     exactement une figure à la condensation ;
   - la caméra « dans le nuage » (×1,3) garde tout l'axe (0 à 100 %) ;
   - les moyennes et les surlignes de l'écran 02 sont dessinées ici (une
     recopie de resultats.js), pour tomber chacune sur son mot (Thibaut les
     montre ensemble) ; « ≈ » y est dessiné en pixels.

   Raccords :
   - entrée (526,9 s) : le laboratoire vide (le sol à 0,4, le centre du fond en
     (960, 470)), l'œil en (960, 150, 140) qui vous regarde (la fin du lot
     variantes) : la foule paraît en fondu dessous ;
   - sortie (756,2 s) : l'écran 02 entier (×1), ses bonshommes, ses moyennes et
     ses surlignes, l'œil (1 790, 120, 120) en doute ; coupe franche vers
     l'écran 03 (lot resultats).

   Essais : index.html?plan=tirage (le lot en boucle), ?plan=P41, ?t=568.1 ;
   dans la console, (await import('./plans/tirage.js')).ESSAI : le minutage, ce
   que regarde Phi, le bilan des 2 222 points (ils redonnent les repères du
   script : moyennes, 17 % à 0 %, ≈ 4 % sous 50 %), les morceaux recollés.
   ========================================================================== */
import { clamp, hache, trotteuses } from '../commun.js';
import * as R from '../resultats.js';
import { B, S } from './tirage-temps.js';
import { dessineColonnes, ESSAI_COLONNES, FILS, D_FIL, tFil, FAUX, tFaux, tCorrige, tCoche } from './tirage-colonnes.js';
import { dessineEcrans, ESSAI_ECRANS, MOMENTS } from './tirage-ecrans.js';

export const LOT = { id: 'tirage', de: 526.9, a: 756.2 };

const colonnes = (ctx, t) => dessineColonnes(ctx, t);
const ecrans = (ctx, t) => dessineEcrans(ctx, t);
// un plan : { id, de, a, dessine(ctx, t, cam, infos) } ; les bornes de la table « Les plans » (EPISODE.md)
export const PLANS = [
  { id: 'P39', de: B.P39, a: B.P40, dessine: colonnes },   // L'écran se dédouble (R01–R03)
  { id: 'P40', de: B.P40, a: B.P41, dessine: colonnes },   // Celle-ci (R04)
  { id: 'P41', de: B.P41, a: B.P42, dessine: colonnes },   // Les mêmes issues (R05–R08)
  { id: 'P42', de: B.P42, a: B.P43, dessine: colonnes },   // L'ordre et la tournure (R09–R11)
  { id: 'P43', de: B.P43, a: B.P44, dessine: colonnes },   // Un peu mieux compris (R12–R14)
  { id: 'P44', de: B.P44, a: B.P45, dessine: ecrans },     // Devinette A (A01–A03) — coupe franche : l'écran 01
  { id: 'P45', de: B.P45, a: B.P46, dessine: ecrans },     // 65,5 % (A04–A06)
  { id: 'P46', de: B.P46, a: B.P47, dessine: ecrans },     // Une expérience de pensée (A07–A10)
  { id: 'P47', de: B.P47, a: B.P48, dessine: ecrans },     // Prédire les autres (A11–A13) — coupe : l'écran 02
  { id: 'P48', de: B.P48, a: B.P49, dessine: ecrans },     // Deux nuages (A14–A15)
  { id: 'P49', de: B.P49, a: B.P50, dessine: ecrans },     // Chacun comme lui (A16–A17)
  { id: 'P50', de: B.P50, a: B.fin, dessine: ecrans },     // Leur propre mort (A18–A21)
];

// ================================================================ les indices sonores (tools/son-pilules.cjs)
// f : la hauteur (tic, hop, pop, note, grain : Hz) ; pour un souffle, son glissement (1 monte, −1 descend, [de, à]).
const r3 = t => +t.toFixed(3);
const pan = x => clamp((x - 960) / 960 * .8, -1, 1);
const panJauge = i => pan(960 + (R.posJauge(i)[0] - 960) * R.Z_CADRE);
export const SONS = Object.freeze([
  { t: LOT.de, son: 'nappe', f: 'labo', g: .5 },
  // P39 : le dédoublement (un souffle qui s'ouvre dans la stéréo) ; le tirage, de plus en plus lent, sans clac (il ne
  // se pose pas) ; chacun tiré à son tour (un grain) ; RÈGLES qui glisse, la frappe de sa recomposition, le declic de
  // l'étiquette devenue titre ; la fenêtre B qui s'ouvre
  { t: r3(S.dedouble0), son: 'souffle', d: 1.0, f: [700, 2200], g: .26, pan: -.5 },
  { t: r3(S.dedouble0 + .05), son: 'souffle', d: 1.0, f: [700, 2200], g: .26, pan: .5 },
  ...S.sauts.slice(0, 8).map((t, k) => ({ t: r3(t), son: 'tic', f: 2600, g: .45 - k * .025, pan: k % 2 ? .5 : -.5 })),
  { t: r3(S.entre), son: 'tic', f: 1700, g: .28 },
  { t: r3(S.entre + .15), son: 'grain', d: 1.0, f: 2000, g: .2 },
  { t: r3(S.glisse0), son: 'souffle', d: .9, f: [1600, 700], g: .22, pan: -.1 },
  { t: r3(S.morph), son: 'frappe', d: 1.5, g: .3, pan: -.5 },
  { t: r3(S.etiq1), son: 'declic', g: .45, pan: -.6 },
  { t: r3(S.fenB), son: 'pop', f: 700, g: .25, pan: .5 },
  // P40 : la frappe de la description B, au rythme de la voix
  { t: r3(S.r04), son: 'frappe', d: r3(S.r04fin - S.r04), g: .2, pan: .5 },
  // P41 : le démontage ; le temps de vérifier (la trotteuse, un tic par fil posé) ; « = » (une quinte) ; la vie,
  // petite ; l'envol, petit
  { t: r3(S.demonte0), son: 'souffle', d: .9, f: [900, 1800], g: .18 },
  ...trotteuses(S.verif0, S.verif1 - S.verif0),
  ...[...new Set(FILS.map(F => F.pas))].map(pas => ({ t: r3(tFil(pas) + D_FIL), son: 'tic', f: 3000, g: .3, pan: pas < 2 ? -.3 : .3 })),
  { t: r3(S.egal), son: 'note', f: 523.25, d: .5, g: .45 },
  { t: r3(S.egal + .14), son: 'note', f: 783.99, d: .7, g: .45 },
  { t: r3(S.issue1), son: 'vie', d: 1.2, g: .3 },
  { t: r3(S.meurent), son: 'envol', d: 1.6, g: .25 },
  // P42 : les morceaux qui changent de place (un souffle aller, un retour) ; les titres ; les têtes qui se tournent ;
  // un declic par étiquette « lue en premier »
  { t: r3(S.ordre), son: 'souffle', d: .6, f: 1, g: .22, pan: .5 },
  { t: r3(S.ordreRetour), son: 'souffle', d: .6, f: -1, g: .22, pan: .5 },
  { t: r3(S.titreA), son: 'tic', f: 2200, g: .2, pan: -.5 },
  { t: r3(S.titreB), son: 'tic', f: 2200, g: .2, pan: .5 },
  { t: r3(S.plusTard), son: 'souffle', d: 1.0, f: [1800, 800], g: .18 },
  { t: r3(S.autre), son: 'souffle', d: 1.4, f: [700, 1300], g: .12 },
  { t: r3(S.premier), son: 'declic', g: .35, pan: -.7 },
  { t: r3(S.premier + .25), son: 'declic', g: .35, pan: .7 },
  // P43 : les coches, en vague (une par rangée, de chaque côté) ; un croix doux par ✗ ; les coche du retour
  ...[0, 1].flatMap(j => [...Array(10).keys()].map(k => ({ t: r3(tCoche(j, k * 11)), son: 'coche', g: .1, pan: j ? .5 : -.5 }))),
  ...[0, 1].flatMap(j => FAUX[j].map((i, r) => ({ t: r3(tFaux(j, r)), son: 'croix', g: r === FAUX[j].length - 1 ? .15 : .3, pan: j ? .5 : -.5 }))),
  ...[0, 1].flatMap(j => FAUX[j].map((i, r) => ({ t: r3(tCorrige(j, r)), son: 'coche', g: .25, pan: j ? .5 : -.5 }))),
  // P44 : la trotteuse pendant les quelques secondes ; sur le suspense, trois pouls graves
  ...trotteuses(S.compte0, S.compte1 - S.compte0),
  ...[.15, .55, .95].map(dt => ({ t: r3(S.suspense + dt), son: 'pouls', f: 48, g: .55 })),
  // P45 : la cascade des hop ; le declic au passage du trait ; la vie ; le tampon
  ...MOMENTS.M1.sauts.map((t, k) => ({ t: r3(t), son: 'hop', f: 380 + hache(k * 11 + 3) * 420, g: .14, pan: panJauge(k) })),
  { t: r3(MOMENTS.M1.seuil), son: 'declic', g: .45 },
  { t: r3(S.d2), son: 'vie', d: 3.0, g: .5 },
  { t: r3(MOMENTS.M1.tampon), son: 'tampon', g: .6 },
  // P46 : la bulle (un souffle doux qui monte) ; le tremblement (un vibrato léger) ; le terminal, « refusé » (deux tic
  // qui descendent) ; l'éclat (le grain)
  { t: r3(S.pensee), son: 'souffle', d: 1.0, f: [400, 1500], g: .3, pan: .4 },
  { t: r3(S.vraies), son: 'vibreur', d: 1.1, g: .1 },
  { t: r3(S.autor), son: 'frappe', d: 1.3, g: .25, pan: -.6 },
  { t: r3(S.refuse), son: 'tic', f: 1500, g: .35, pan: -.6 },
  { t: r3(S.refuse + .13), son: 'tic', f: 900, g: .35, pan: -.6 },
  { t: r3(S.inassouvie), son: 'grain', d: 1.0, f: 2600, g: .45 },
  // P47 : un tic pour chaque tireté ; la pluie (un crépitement qui se pose)
  { t: r3(S.e0 + .1), son: 'tic', f: 2400, g: .3 },
  { t: r3(MOMENTS.premiereChute()), son: 'grain', d: r3(MOMENTS.derniereChute() - MOMENTS.premiereChute()), f: 3200, g: .4 },
  { t: r3(S.moy), son: 'tic', f: 2000, g: .3 },
  // P48 : la séparation (les bleus montent, les rouges descendent) ; un pop par bonhomme formé, en grappe ; un tic par
  // surlignage
  { t: r3(S.sep0), son: 'souffle', d: 1.0, f: 1, g: .2, pan: .3 },
  { t: r3(S.sep0 + .05), son: 'souffle', d: 1.0, f: -1, g: .2, pan: -.3 },
  ...MOMENTS.figures().map((t, id) => ({ t: r3(t + .45), son: 'pop', f: 700 + hache(id * 7 + 1) * 500, g: .08 })),
  ...[S.moyR, S.zero, S.moyB, S.cent].map(t => ({ t: r3(t), son: 'tic', f: 2200, g: .25 })),
  // P49 : la salle baisse, un pouls lent de chaque côté ; le retour ; les deux flèches ; le dé (trois tic qui rebondissent)
  { t: r3(S.gros), son: 'nappe', f: 'labo', g: .25 },
  ...[.3, 1.5, 2.7].map(dt => ({ t: r3(S.gros + dt), son: 'pouls', f: 50, g: .45, pan: -.6 })),
  ...[.9, 2.1, 3.3].map(dt => ({ t: r3(S.gros + dt), son: 'pouls', f: 46, g: .45, pan: .6 })),
  { t: r3(S.retour), son: 'nappe', f: 'labo', g: .5 },
  { t: r3(S.retour + .3), son: 'souffle', d: .5, f: 1, g: .14, pan: .4 },
  { t: r3(S.retour + .6), son: 'souffle', d: .5, f: 1, g: .14, pan: -.4 },
  ...MOMENTS.REBONDS.map((dt, k) => ({ t: r3(S.hasard + dt), son: 'tic', f: 1800 - k * 300, g: .4 - k * .12 })),
  // P50 : un tic par cerne ; l'envol des fantômes, très bas ; puis rien
  ...[0, 1, 2].map(k => ({ t: r3(S.sous50 + .1 * k), son: 'tic', f: 2400, g: .22 })),
  ...[0, 1, 2].map(k => ({ t: r3(S.mort + k * .25 + 1.0), son: 'envol', d: 3.0, g: .16 })),
].sort((a, b) => a.t - b.t));

// ================================================================ pour les essais (la console, un script de vérification)
export const ESSAI = Object.freeze({
  S, B,
  regard: T => (T < B.P44 ? ESSAI_COLONNES.regard(T) : ESSAI_ECRANS.regard(T)),
  colonnes: ESSAI_COLONNES,
  ecrans: ESSAI_ECRANS,
  // les morceaux de phrase recollés redonnent les deux descriptions, mot pour mot
  morceaux: () => ({ A: ESSAI_COLONNES.dispo('A').ok, B: ESSAI_COLONNES.dispo('B').ok }),
  points: () => ESSAI_ECRANS.bilan(),
});
