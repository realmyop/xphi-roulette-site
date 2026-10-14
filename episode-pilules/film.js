/* ==========================================================================
   Les deux pilules, l'épisode — film.js : le cadre (l'animatique entière)

   Ronan : « Toutes les séquences du script, dans l'ordre, avec le texte de
   Thibaut tel quel pour la voix et les images qu'il indique. On reprend son
   test et ses douze écrans de résultats, avec les nouveaux bonshommes, et on
   crée le reste (Kant, Alice, Nietzsche, le méta-dilemme). Environ 20
   minutes de voix : d'abord en images simples calées sur le texte, ensuite
   on peaufine. » Puis : « je veux que tu prennes les petits bonhommes que tu
   as dans le premier film de 3 minutes 20, on est bien d'accord ? »

   Le script de Thibaut (docs/pilules-script-magazine-26-min.md) est la
   référence ; son découpage, séquence par séquence et plan par plan, est
   EPISODE.md (il fait foi : les instants, les places, les gestes, les sons).
   Ce fichier est le moteur du film de 3 min 20 (mockups/film-pilules/film.js,
   qui n'est pas touché), recopié et porté à l'épisode : 1 401,4 s, 13
   séquences, 85 plans, 198 répliques, 8 lots.

   Tout est fonction du temps t (en secondes) : composer(t) dessine l'image de
   l'instant t ; la page joue l'épisode en direct, ?t=642.5 en montre une
   image fixe, ?rendu=1 et window.film servent au rendu vidéo image par image
   (25 i/s, tools/rendre-film.cjs --film episode-pilules).

   Ce fichier tient la ligne de temps (DUREE, LOTS, DECOUPAGE), appelle le bon
   plan, fait les transitions, dessine la SURIMPRESSION (la boîte de dialogue
   XPHI, le cartouche, la mention, puis le voile par-dessus tout) et la
   lecture.

   Paramètres : ?t=642.5 (une image fixe, en pause ; ?t=642,5 aussi, comme
   EPISODE.md écrit ses instants) · ?plan=kant (un lot), ?plan=P42 (un plan) ou
   ?plan=S05 (une séquence) : le mode plan, qui boucle · ?de=600&a=640 (boucle
   sur un moment ; ?a=640 seul : de 0 à 640) · ?rendu=1 (ni barre ni commandes :
   pour le rendu vidéo) · ?ecriture=jeu (la boîte écrit à 36 car./s, comme
   index.html, au lieu du rythme de la parole : voir texte.js).
   Clavier : espace lecture/pause · ← → 5 s · Maj+← → 1 s · , . une image ·
   R recommencer (la boucle) · C la barre de temps · M le son (son.mp3,
   calculé par tools/rendre-film.cjs --film episode-pilules --son-seul, chargé
   à la première lecture et joué avec l'image par un élément audio ; sans lui,
   l'épisode est muet). Début : la touche Origine.
   Sans ?t, la page montre l'affiche (le titre, AFFICHE) ; la lecture part du
   début (de la boucle en mode plan, qui joue tout de suite).

   ---------------------------------------------------------------------------
   CONTRAT POUR LES LOTS — ce qu'un lot écrit, ce qu'il peut utiliser
   ---------------------------------------------------------------------------
   1. Les huit lots (LOTS ci-dessous ; EPISODE.md, « Les lots ») sont écrits
      en parallèle. Un lot n'écrit QUE ses fichiers : plans/<lot>.js (et, s'il
      en veut, plans/<lot>-*.js, plans/essai-<lot>.html). Il ne touche ni à ce
      fichier, ni à index.html, commun.js, partage.js, texte.js,
      plans/ebauche.js (le socle), ni à resultats.js et donnees.js (écrits par
      un autre agent, EN MÊME TEMPS que le socle), ni au film de 3 min 20
      (mockups/film-pilules/), ni aux autres lots. S'il lui faut un utilitaire
      qui n'existe pas, il le définit chez lui (son origine en commentaire
      s'il le recopie d'un module du film qui ne l'exporte pas) ; si un
      raccord entre deux lots en dépend, ou si un texte ou un chiffre ne va
      pas, il le dit : on le change à la source (commun.js, texte.js,
      donnees.js).

   2. plans/<lot>.js est un module ES qui exporte :
        export const LOT = { id: 'kant', de: 171.6, a: 381.6 };
        export const PLANS = [
          { id: 'P19', de: 171.6, a: 180.2,
            dessine(ctx, t, cam, infos) { … },
            camera: [[t, wx, wy, sx, sy, z], …],     // facultatif
            entree: { type: 'volet', sens: 'droite' }, // facultatif
            sortie: { type: 'noir', d: .6 } },         // facultatif
          …
        ];
        export const SONS = [ { t: 172.8, son: 'declic', g: .4, pan: -.2 }, … ];
        export function verifie() { return ['…ce qui cloche', …]; }   // facultatif : verifie() l'appelle
      Les bornes du lot sont celles de LOTS ; celles des plans, celles de
      DECOUPAGE (EPISODE.md, « Les plans ») ; un plan ne sort jamais de son lot
      (un id de plan commence par celui de DECOUPAGE : 'P22', ou 'P22b' pour un
      morceau de P22). Aux frontières, l'image de raccord est dans EPISODE.md
      (le premier et le dernier plan de chaque lot, et « RACCORDS » du brief).
      SONS : le vocabulaire de tools/son-pilules.cjs (VOCABULAIRE ci-dessous :
      nappe (f 'labo' | 'nuit', g), silence (d), tic (f), haptique, frappe, hop,
      pop, grain, souffle, vie, peur, envol, retour, tampon, coche, croix,
      declic, clac, trotteuse, pouls, motif, vibreur, note (f, d) ; g, pan, d) ;
      t en temps absolu. Les petits bips du texte qui s'écrit sont ajoutés par
      le socle. Calez les sons sur les mots, comme les gestes (quandMot).

   3. dessine(ctx, t, cam, infos) — appelée à chaque image où le plan est actif :
      - t : le temps ABSOLU de l'épisode (de 0 à 1 401,4). Aucun état d'une
        image à l'autre : ?t=123.4 doit donner exactement l'image de la
        lecture (hache, rng à graines fixes ; jamais Math.random ; les
        mémoires de calcul sont permises si elles ne changent pas l'image).
      - ctx : une toile 1920×1080 à soi, remise à zéro avant chaque appel
        (transformation, alpha, découpe : rien ne fuit vers la surimpression
        ni vers l'image suivante). Le plan peint TOUT son fond.
      - cam : la caméra du plan à l'instant t, tirée de plan.camera (images
        clés [t, wx, wy, sx, sy, z] : « le point (wx, wy) du monde en (sx, sy)
        à ×z », en douceur, le zoom en échelle logarithmique) ; IDENTITE sans
        plan.camera. cam.applique(ctx) (entre save et restore), cam.ecran(x,
        y), cam.monde(x, y), cam.z. Un plan qui a plusieurs caméras (l'écran
        partagé, le cadre des résultats de resultats.js) les calcule lui-même :
        camera(t, cles) et cadre() de commun.js. « Le monde qui penche »
        (variantes) : une rotation de la couche du monde que le plan applique
        lui-même, jamais à l'œil.
      - infos : { lot, plan (sa ligne de DECOUPAGE : titre, sequence, script,
        repliques), europe (globalThis.EUROPE, ou null), resultats (le module
        resultats.js, ou null s'il manque), donnees (donnees.js, ou null),
        rendu }.
      Le plan dessine le MONDE (sous sa caméra) puis PHI (l'œil-diaphragme,
      oeil() et creeRegard() de commun.js, placé plan par plan, hors caméra :
      il regarde ce dont il parle au moment où il le dit). Il ne dessine NI la
      boîte de dialogue XPHI, NI le cartouche, NI la mention, NI le voile :
      c'est la surimpression, dessinée ici, par-dessus (SURIMPRESSION
      ci-dessous). Rien d'important sous y = 830 (la boîte : x 80–1840,
      y 862–1040, étiquette XPHI en 112, 838).

   4. Les transitions :
      - coupe (par défaut) et raccord : deux plans qui se suivent ;
      - fondu enchaîné : deux plans d'un même lot qui se chevauchent (un plan
        peut déborder de 0,5 s sur son voisin, jamais hors de son lot) ; pendant
        le chevauchement, le second apparaît sur le premier (eIO) ;
      - volet : le même chevauchement, avec entree: { type: 'volet', sens }
        sur le second (sens 'droite' : le bord part de la gauche ; 'gauche',
        'bas', 'haut') ;
      - fondu au noir : entree / sortie: { type: 'noir', d } (le plan sort du
        noir, ou y entre, en d secondes ; la surimpression reste).
      Dans un chevauchement, chaque plan reçoit le même t : le premier doit
      savoir se dessiner un peu après sa fin nominale.

   5. Ce qu'on peut importer (depuis plans/) :
      - '../commun.js' : la DA et LES BONSHOMMES DU FILM DE 3 MIN 20 (une copie
        exacte de mockups/film-pilules/commun.js : dessineSujet, l'atlas, les
        coiffes, les états, l'œil, le regard, les foules PREMIERS et DEMO…),
        plus ce que plusieurs lots dessinent pareil (le terminal, RÈGLES et
        l'étiquette « A », les fenêtres de description, le fil des réseaux,
        la vague, l'anneau, Kant et Nietzsche, les poses nouvelles, les
        bulles, Alice, le tirage, la devinette et son compte à rebours, le
        carton, les vrais humains) : voir son en-tête. '../partage.js' en est
        un autre nom (EPISODE.md l'appelle ainsi) : les mêmes objets.
      - '../texte.js' : REPLIQUES, REPLIQUE[id], quandMot(id, mot), finMot,
        finParole(id), lettres(id, T), texteDe(id), plume(T), repliqueA(T),
        DESCRIPTIONS (A, B), MENTIONS, SEQUENCES. CALEZ CHAQUE GESTE SUR SON
        MOT : quandMot('T07', 'meurent'), jamais un nombre recopié
        d'EPISODE.md (le jour où Ronan enregistre, tout doit suivre).
      - '../resultats.js' (les douze écrans de Thibaut : ecran(ctx, T, n, d,
        o)…) et '../donnees.js' (tous les chiffres du sondage, avec leur
        statut) : écrits par un autre agent, en même temps que ce socle. Un
        lot qui les importe ne se charge pas tant qu'ils manquent ou sont
        cassés : l'épisode montre alors son ébauche et le dit (console,
        verifie()). Pour s'en passer sans casser : infos.resultats (null s'il
        manque) plutôt qu'un import.
      - globalThis.EUROPE (../film-pilules/europe.js, chargé par index.html) :
        la terre et ses pays, pour la carte « à mesurer » (P63) ; ses données
        par pays sont INVENTÉES : ne pas les montrer.
      - les modules du film, seulement ce qu'ils exportent (une fonction non
        exportée se recopie chez soi).
      Ce fichier se lit (DUREE, LOTS, DECOUPAGE, SURIMPRESSION) sans être
      importé par un lot : infos suffit.

   6. Si dessine lève une erreur, l'épisode l'écrit dans la console (une fois)
      et sur l'image, et continue ; un lot qui ne se charge pas est remplacé
      par son ébauche (plans/ebauche.js : le plan, l'indication du script, ses
      répliques). window.film.verifie() liste ce qui cloche : les lots absents
      ou cassés, les plans hors de leur lot, les moments sans plan, les
      répliques trop larges ou trop longues, les sons pris par deux images ou
      hors du vocabulaire, les caractères hors des polices, les données, les
      cernes des écrans de résultats (ce qu'ils entourent, ce qu'ils
      comptent), la lecture de l'adresse, le curseur du terminal après ses
      signes, resultats.js et europe.js absents.
      Quatre essais plus lents dessinent l'épisode : window.film.glyphes() (les
      caractères hors des polices), window.film.sousSurimpression() (ce qu'un
      plan dessine sous la boîte XPHI, qui se lit à travers, ou sous le
      cartouche, qui le cache), window.film.sousOeil() (ce qui passe sous
      l'œil de Phi, qui paraît tranché) et window.film.regardHors() (ce que
      regarde Phi, hors de l'image). Hors ?rendu=1,
      window.film.essaiLecture() joue le début de quelques plans.
   ========================================================================== */
import * as C from './commun.js';
import { dialogue, verifieRepliques, motsIntrouvables, prepareTextes, reglerEcriture, ecritsEntre, REPLIQUES, DESCRIPTIONS, MENTIONS, SEQUENCES } from './texte.js';
import { ebauche } from './plans/ebauche.js';

const { W, H } = C;
export const DUREE = 1401.4;
export const IPS = 25;
export const AFFICHE = 85.6;          // l'image de la page avant la lecture : le titre « XPHI · LES DEUX PILULES » (P08)

// ================================================================ la ligne de temps (EPISODE.md, « Les lots », « Les plans »)
export const LOTS = Object.freeze([
  { id: 'ouverture', plans: 'P01–P08', sequences: 'Ouverture, générique « Xphi · Les deux pilules »', de: 0, a: 87.8 },
  { id: 'test', plans: 'P09–P18', sequences: 'Partie 1 · Le test', de: 87.8, a: 171.6 },
  { id: 'kant', plans: 'P19–P31', sequences: 'Partie 1 · Un dilemme kantien ?', de: 171.6, a: 381.6 },
  { id: 'variantes', plans: 'P32–P38', sequences: 'Partie 1 · Deux variantes déséquilibrées', de: 381.6, a: 526.9 },
  { id: 'tirage', plans: 'P39–P50', sequences: 'Partie 2 · Le tirage au sort ; Description A (écrans 01 et 02)', de: 526.9, a: 756.2 },
  { id: 'resultats', plans: 'P51–P60', sequences: 'Partie 2 · Description B ; Les deux descriptions… (écrans 03 à 08)', de: 756.2, a: 978.4 },
  { id: 'ecarts', plans: 'P61–P72', sequences: 'Partie 2 · Qui prend la bleue ? (écrans 09, 10) ; Partie 3 · Mauvais ou méchants', de: 978.4, a: 1169.4 },
  { id: 'fin', plans: 'P73–P85', sequences: 'Partie 3 · Le méta-dilemme (écrans 11, 12) ; Qui explique les règles ; la fin', de: 1169.4, a: DUREE },
].map(l => Object.freeze({ ...l, sequences: C.fr(l.sequences) })));
// un plan : [id, de, a, lot, séquence, titre, répliques, l'indication du script qu'il réalise (citée, jamais dite)]
// (le ∅ du script s'écrit Ø : aucune police du dépôt ne l'a)
export const DECOUPAGE = Object.freeze([
  ['P01', 0.0, 5.5, 'ouverture', 'S01', 'L’œil s’ouvre', 'O01', '[VISUEL : fond nuit. L’œil de Phi s’ouvre au centre de l’écran, regarde à gauche, à droite, puis la caméra.]'],
  ['P02', 5.5, 19.7, 'ouverture', 'S01', 'Une simple intelligence artificielle', 'O02–O03', null],
  ['P03', 19.7, 35.0, 'ouverture', 'S01', 'Le test, il y a quelques semaines', 'O04–O05', null],
  ['P04', 35.0, 48.4, 'ouverture', 'S01', 'Le fil', 'O06–O07', null],
  ['P05', 48.4, 63.1, 'ouverture', 'S01', 'Égoïstes, assassins, idiots', 'O08–O09', null],
  ['P06', 63.1, 68.7, 'ouverture', 'S01', 'Assez de raisons', 'O10', null],
  ['P07', 68.7, 80.2, 'ouverture', 'S01', 'Pourquoi tant de haine', 'O11', null],
  ['P08', 80.2, 87.8, 'ouverture', 'S01', 'Générique : Xphi · Les deux pilules', '—', '[GÉNÉRIQUE : Xphi · Les deux pilules]'],
  ['P09', 87.8, 94.0, 'test', 'S02', 'Le terminal', 'T01', '[VISUEL : les images de l’animation jouable. Le terminal, puis les deux pilules qui se forment en nuages de caractères.]'],
  ['P10', 94.0, 100.9, 'test', 'S02', 'Deux pilules', 'T02', null],
  ['P11', 100.9, 106.9, 'test', 'S02', 'Vous êtes cent', 'T03', '[VISUEL : les cent sujets en pixels apparaissent. Puis le gros plan sur le sujet n°48 dans son isoloir, avec un « ? » au-dessus de ses voisins.]'],
  ['P12', 106.9, 113.0, 'test', 'S02', 'L’isoloir du N°48', 'T04', null],
  ['P13', 113.0, 118.3, 'test', 'S02', 'Une formulation possible', 'T05', null],
  ['P14', 118.3, 124.7, 'test', 'S02', 'Tout le monde vit', 'T06', '[VISUEL : la foule choisit, la jauge passe la barre des 50 %, la foule s’illumine. Puis la foule rechoisit, le rouge l’emporte, et les sujets bleus se dissolvent en caractères.]'],
  ['P15', 124.7, 135.2, 'test', 'S02', 'Les bleus meurent', 'T07', null],
  ['P16', 135.2, 144.9, 'test', 'S02', 'Obligatoire', 'T08–T09', '[VISUEL : un seul sujet reste gris, cerclé, avec un Ø au-dessus de la tête. Puis toute la foule se dissout.]'],
  ['P17', 144.9, 158.4, 'test', 'S02', 'Le test de compréhension', 'T10–T11', '[VISUEL : les quatre questions de compréhension, puis les coches au-dessus des cent sujets, et le tampon « 100 / 100 ONT COMPRIS ».]'],
  ['P18', 158.4, 171.6, 'test', 'S02', 'Cent sur cent', 'T12', null],
  ['P19', 171.6, 180.2, 'kant', 'S03', 'Kant', 'K01', '[VISUEL : un portrait de Kant en pixels. Sous lui, la formule de l’impératif catégorique s’écrit dans le terminal.]'],
  ['P20', 180.2, 191.2, 'kant', 'S03', 'L’impératif', 'K02', null],
  ['P21', 191.2, 217.4, 'kant', 'S03', 'Les humains écrivent si mal', 'K03–K06', null],
  ['P22', 217.4, 232.3, 'kant', 'S03', 'La fausse promesse', 'K07–K09', '[VISUEL : un sujet en pixels tend la main vers un autre et reçoit une pièce. Une bulle : « Je te rembourse demain. » Ses doigts sont croisés dans son dos.]'],
  ['P23', 232.3, 240.5, 'kant', 'S03', 'Les doigts croisés', 'K10', null],
  ['P24', 240.5, 253.2, 'kant', 'S03', 'Si tout le monde', 'K11–K12', null],
  ['P25', 253.2, 274.7, 'kant', 'S03', 'Ne marche que si les autres ne la suivent pas', 'K13–K14', null],
  ['P26', 274.7, 299.7, 'kant', 'S03', 'Appliquons ce test aux pilules', 'K15–K18', '[VISUEL : la foule de cent sujets. Chaque sujet reçoit la même pilule que son voisin, de proche en proche.]'],
  ['P27', 299.7, 316.4, 'kant', 'S03', 'Et la rouge', 'K19–K21', null],
  ['P28', 316.4, 323.2, 'kant', 'S03', 'Deux foules', 'K22', '[VISUEL : deux foules côte à côte. Cent bleus : cent survivants. Cent rouges : cent survivants.]'],
  ['P29', 323.2, 337.9, 'kant', 'S03', 'Une différence', 'K23–K24', null],
  ['P30', 337.9, 354.9, 'kant', 'S03', 'Un signal', 'K25–K26', null],
  ['P31', 354.9, 381.6, 'kant', 'S03', 'Pour sauver qui', 'K27–K32', null],
  ['P32', 381.6, 396.7, 'variantes', 'S04', 'Déséquilibrer', 'V01–V02', '[VISUEL : à côté de la foule, un cent-unième sujet seul dans une pièce, sans pilule.]'],
  ['P33', 396.7, 422.2, 'variantes', 'S04', 'Sauver Alice', 'V03–V08', null],
  ['P34', 422.2, 448.9, 'variantes', 'S04', 'Les bleus accidentels', 'V09–V11', null],
  ['P35', 448.9, 465.1, 'variantes', 'S04', 'En connaissance de cause', 'V12–V13', null],
  ['P36', 465.1, 489.9, 'variantes', 'S04', 'Un bleu tiré au hasard', 'V14–V16', '[VISUEL : retour au test de base. La bleue l’emporte, et un sujet bleu tiré au hasard se dissout quand même.]'],
  ['P37', 489.9, 503.6, 'variantes', 'S04', 'Le point d’équilibre', 'V17–V18', null],
  ['P38', 503.6, 526.9, 'variantes', 'S04', 'La boucle infinie', 'V19–V21', '[la voix accélère]'],
  ['P39', 526.9, 543.8, 'tirage', 'S05', 'L’écran se dédouble', 'R01–R03', '[VISUEL : l’écran se dédouble. Deux colonnes, A et B, avec la même foule de cent sujets.]'],
  ['P40', 543.8, 558.1, 'tirage', 'S05', 'Celle-ci', 'R04', null],
  ['P41', 558.1, 578.0, 'tirage', 'S05', 'Les mêmes issues', 'R05–R08', '[VISUEL : les deux règles côte à côte. Les mêmes issues s’allument en face de chacune.]'],
  ['P42', 578.0, 600.3, 'tirage', 'S05', 'L’ordre et la tournure', 'R09–R11', null],
  ['P43', 600.3, 618.2, 'tirage', 'S05', 'Un peu mieux compris', 'R12–R14', null],
  ['P44', 618.2, 639.0, 'tirage', 'S06', 'Devinette A', 'A01–A03', '[DEVINETTE : « Description A. Quelle part a pris la pilule bleue ? »]'],
  ['P45', 639.0, 654.6, 'tirage', 'S06', '65,5 %', 'A04–A06', '[VISUEL : la jauge de l’animation se remplit de bleu et dépasse le trait des 50 %. La foule s’illumine.]'],
  ['P46', 654.6, 676.3, 'tirage', 'S06', 'Une expérience de pensée', 'A07–A10', null],
  ['P47', 676.3, 698.8, 'tirage', 'S06', 'Prédire les autres', 'A11–A13', null],
  ['P48', 698.8, 721.1, 'tirage', 'S06', 'Deux nuages', 'A14–A15', '[VISUEL : le nuage des prédictions individuelles, un point par participant, qui se sépare en deux nuages, rouge et bleu.]'],
  ['P49', 721.1, 734.4, 'tirage', 'S06', 'Chacun comme lui', 'A16–A17', null],
  ['P50', 734.4, 756.2, 'tirage', 'S06', 'Leur propre mort', 'A18–A21', null],
  ['P51', 756.2, 786.0, 'resultats', 'S07', 'Devinette B', 'B01–B04', '[DEVINETTE : « Description B. Mêmes pilules, même règle. Quelle part a pris la bleue ? »]'],
  ['P52', 786.0, 797.8, 'resultats', 'S07', 'La jauge monte à peine', 'B05–B06', '[VISUEL : la jauge monte à peine. Les sujets bleus se dissolvent.]'],
  ['P53', 797.8, 817.6, 'resultats', 'S07', 'Côte à côte', 'B07–B09', '[VISUEL : les deux jauges côte à côte, 65,5 % et 12,6 %, l’écart de 53 points matérialisé.]'],
  ['P54', 817.6, 829.4, 'resultats', 'S07', 'Un effet de cadrage', 'B10–B11', null],
  ['P55', 829.4, 854.4, 'resultats', 'S07', 'Prédictions B', 'B12–B15', null],
  ['P56', 854.4, 875.3, 'resultats', 'S08', 'Même situation ?', 'M01–M02', null],
  ['P57', 875.3, 910.1, 'resultats', 'S08', 'Plus ou moins trompeuse ?', 'M03–M07', null],
  ['P58', 910.1, 925.1, 'resultats', 'S08', 'Devinette : le même choix ?', 'M08–M09', '[DEVINETTE : « Auriez-vous fait le même choix avec l’autre description ? »]'],
  ['P59', 925.1, 952.4, 'resultats', 'S08', 'Huit bleus sur dix', 'M10–M12', null],
  ['P60', 952.4, 978.4, 'resultats', 'S08', 'Six rouges sur dix', 'M13–M18', null],
  ['P61', 978.4, 984.0, 'ecarts', 'S09', 'Devinette : qui ?', '—', '[DEVINETTE : « Femmes ou hommes ? Gauche ou droite ? Qui prend le plus la bleue ? »]'],
  ['P62', 984.0, 1008.1, 'ecarts', 'S09', 'Genre, politique', 'Q01–Q03', null],
  ['P63', 1008.1, 1022.9, 'ecarts', 'S09', 'L’Europe à mesurer', 'Q04', '[VISUEL : carte de l’Europe, un chiffre par pays.] — puis, dans le texte : [À MESURER : Allemagne, Espagne, France, Italie, Pologne]'],
  ['P64', 1022.9, 1043.2, 'ecarts', 'S09', 'Tous les écarts', 'Q05–Q06', '[VISUEL : tous les écarts sur une même échelle. Genre, politique, pays, puis la barre de la description, beaucoup plus longue.] — et, dans le texte : [À ADAPTER selon les écarts entre pays.]'],
  ['P65', 1043.2, 1051.3, 'ecarts', 'S10', 'Les messages, floutés', 'N01–N02', '[VISUEL : retour aux messages haineux du début, floutés.]'],
  ['P66', 1051.3, 1066.0, 'ecarts', 'S10', 'Nietzsche', 'N03–N04', null],
  ['P67', 1066.0, 1078.4, 'ecarts', 'S10', 'Le mauvais, le méchant', 'N05–N08', null],
  ['P68', 1078.4, 1112.2, 'ecarts', 'S10', 'Bon / mauvais, bon / méchant', 'N09–N13', '[VISUEL : deux colonnes. Sous la pilule rouge, « bon / mauvais ». Sous la pilule bleue, « bon / méchant ».]'],
  ['P69', 1112.2, 1122.4, 'ecarts', 'S10', 'Une insulte', 'N14', null],
  ['P70', 1122.4, 1136.7, 'ecarts', 'S10', 'Un virus saisonnier', 'N15–N16', '[VISUEL : des tweets et des messages tirés des nombreuses apparitions de ce dilemme sur les réseaux sociaux.]'],
  ['P71', 1136.7, 1160.3, 'ecarts', 'S10', 'Avant tout, la description', 'N17–N19', null],
  ['P72', 1160.3, 1169.4, 'ecarts', 'S10', 'De très loin', 'N20', null],
  ['P73', 1169.4, 1187.5, 'fin', 'S11', 'De vrais humains', 'D01–D02', '[VISUEL : la foule de cent sujets réapparaît. Cette fois, ce sont de vrais humains.]'],
  ['P74', 1187.5, 1217.0, 'fin', 'S11', 'Vous décidez de la description', 'D03–D06', null],
  ['P75', 1217.0, 1244.6, 'fin', 'S11', 'Ce que vous avez répondu', 'D07–D09', null],
  ['P76', 1244.6, 1256.8, 'fin', 'S11', 'Deux scénarios', 'D10–D11', '[VISUEL : deux scénarios pour les cent vrais participants. À gauche, description A : une jauge autour de 50 %, l’issue incertaine. À droite, description B : une jauge bleue très courte.]'],
  ['P77', 1256.8, 1271.8, 'fin', 'S11', 'Élever le débat', 'D12–D13', null],
  ['P78', 1271.8, 1293.1, 'fin', 'S12', 'Une description proche de la A', 'E01–E02', null],
  ['P79', 1293.1, 1302.3, 'fin', 'S12', 'Qui vous expliquait les règles', 'E03', null],
  ['P80', 1302.3, 1320.9, 'fin', 'S12', 'C’est moi le fautif', 'E04–E06', null],
  ['P81', 1320.9, 1332.1, 'fin', 'S12', 'Aucune n’est neutre', 'E07–E08', null],
  ['P82', 1332.1, 1369.0, 'fin', 'S13', 'L’œil, seul', 'F01–F06', '[VISUEL : l’œil de Phi, seul au centre de l’écran.]'],
  ['P83', 1369.0, 1381.4, 'fin', 'S13', 'La prochaine fois', 'F07', '[TEASER : l’expérience du prochain numéro.]'],
  ['P84', 1381.4, 1385.4, 'fin', 'S13', 'L’œil se ferme', '—', '[VISUEL : l’œil se ferme lentement. GÉNÉRIQUE DE FIN.]'],
  ['P85', 1385.4, 1401.4, 'fin', 'S13', 'Générique de fin', '—', null],
].map(([id, de, a, lot, sequence, titre, repliques, script]) => Object.freeze({ id, de, a, lot, sequence, titre: C.fr(titre), repliques, script: script && C.fr(script) })));

// ================================================================ la surimpression (EPISODE.md, « Surimpression »)
// Dessinée par le cadre, pas par les plans, dans cet ordre : la boîte de dialogue XPHI (texte.js : ouverte à 3,1 s,
// repliée pendant le générique d'ouverture, fermée à 1 381,6 avec l'œil), le cartouche, la mention ; puis le voile
// (trame + vignettage) par-dessus tout.
const K = (de, a, haut, bas, entree = .3) => Object.freeze({ de, a, mots: Object.freeze([C.fr(haut), C.fr(bas)]), entree });
const P1 = 'PARTIE 1 · REJOUER LE TEST', P2 = 'PARTIE 2 · LES RÉSULTATS', P3 = 'PARTIE 3 · CE QUE ÇA VEUT DIRE';
export const SURIMPRESSION = Object.freeze({
  // le cartouche (« haut » en LAITON, « bas » en CRAIE, en (48, 40)) ; quand il change de mots sans s'effacer, c'est un
  // relais : le même cadre se redimensionne, la ligne qui change s'efface et se retape. Aucun pendant l'ouverture (avant
  // le titre), la carte (P63) et la fin (P82–P85). Le premier naît du titre (P08 l'y amène : 86,6 → 87,2).
  cartouches: Object.freeze([
    K(86.6, 87.8, 'XPHI', 'LES DEUX PILULES', .6),
    K(87.8, 171.6, P1, 'LE TEST'),
    K(171.6, 381.6, P1, 'UN DILEMME KANTIEN ?'),
    K(381.6, 526.9, P1, 'DEUX VARIANTES DÉSÉQUILIBRÉES'),
    K(526.9, 618.2, P2, 'LE TIRAGE AU SORT'),
    K(618.2, 676.3, 'RÉSULTATS 01', 'DESCRIPTION A'),
    K(676.3, 756.2, 'RÉSULTATS 02', 'PRÉDICTIONS · GROUPE A'),
    K(756.2, 797.8, 'RÉSULTATS 03', 'DESCRIPTION B'),
    K(797.8, 829.4, 'RÉSULTATS 04', 'LA MÊME RÈGLE, DEUX FOIS'),
    K(829.4, 854.4, 'RÉSULTATS 05', 'PRÉDICTIONS · GROUPE B'),
    K(854.4, 875.3, 'RÉSULTATS 06', 'MÊME SITUATION ?'),
    K(875.3, 910.1, 'RÉSULTATS 07', 'PLUS OU MOINS TROMPEUSE ?'),
    K(910.1, 978.4, 'RÉSULTATS 08', 'LE MÊME CHOIX ?'),
    K(978.4, 1008.1, 'RÉSULTATS 09', 'QUI PREND LA BLEUE ?'),
    K(1022.9, 1043.2, 'RÉSULTATS 10', 'TOUS LES ÉCARTS'),
    K(1043.2, 1169.4, P3, 'MAUVAIS OU MÉCHANTS'),
    K(1169.4, 1217.0, P3, 'LE MÉTA-DILEMME'),
    K(1217.0, 1244.6, 'RÉSULTATS 11', 'LE MÉTA-DILEMME'),
    K(1244.6, 1271.8, 'RÉSULTATS 12', 'POUR DE VRAI ?'),
    K(1271.8, 1332.1, P3, 'QUI EXPLIQUE LES RÈGLES'),
  ]),
  // la mention : ce que l'image doit dire de ses sources, et les notes de bas de page de Thibaut (IBM Plex Mono 16 px,
  // GRIS, alignée à droite en (1840, 1068), sous la boîte ; fondu de 0,3 s ; deux mentions qui se suivent se relaient :
  // l'une s'efface, l'autre paraît). En P48, « un point par participant… » passe à « 1 figure = 1 %… » à la condensation (700,0).
  mentions: Object.freeze([
    [35.0, 80.2, 'messages'], [180.2, 217.4, 'kant'], [600.3, 676.3, 'prototypeSujet'], [676.3, 700.0, 'points'],
    [700.0, 756.2, 'figures'], [756.2, 829.4, 'prototypeSujet'], [829.4, 854.4, 'figures'], [854.4, 925.1, 'prototype'],
    [925.1, 978.4, 'deduits'], [978.4, 1008.1, 'confondus'], [1008.1, 1022.9, 'pays'], [1022.9, 1043.2, 'prototype'],
    [1043.2, 1051.3, 'messages'], [1122.4, 1136.7, 'messages'], [1136.7, 1169.4, 'prototype'], [1217.0, 1244.6, 'prototype'],
    [1244.6, 1256.8, 'illustration'], [1271.8, 1302.3, 'messages'],
  ].map(([de, a, cle]) => Object.freeze({ de, a, cle, txt: MENTIONS[cle] }))),
});

// ================================================================ l'état de l'épisode (les lots chargés, les modules du socle)
const etatLots = {};          // id → { module, plans, sons, statut, erreur }
let EUROPE = null, RESULTATS = null, DONNEES = null, RENDU = false;
const MODULES = { resultats: null, donnees: null };   // { erreur } si un module manque ou ne se charge pas
const dejaDit = new Set();
const ditUneFois = (cle, ...m) => { if (!dejaDit.has(cle)) { dejaDit.add(cle); console.error(...m); } };

export function lotA(t) { for (const L of LOTS) if (t >= L.de && t < L.a) return L; return t >= DUREE ? LOTS[LOTS.length - 1] : LOTS[0]; }
export const planDecoupage = t => DECOUPAGE.find(p => t >= p.de && t < p.a) || null;
export const sequenceA = t => { const P = planDecoupage(t); return P ? SEQUENCES.find(s => s.id === P.sequence) || null : null; };

// les plans actifs à l'instant t : ceux du lot dont [de, a) contient t, dans l'ordre de PLANS ; à défaut, l'ébauche
function actifs(L, t) {
  const E = etatLots[L.id], liste = E && E.plans ? E.plans.filter(p => t >= p.de && t < p.a) : [];
  if (liste.length) return liste;
  const D = planDecoupage(t);
  return D ? [{ id: D.id, de: D.de, a: D.a, dessine: ebauche, ebauche: true }] : [];
}
// la ligne de DECOUPAGE d'un plan d'un lot : 'P22' ou 'P22b' (un morceau de P22)
const ligneDe = id => DECOUPAGE.find(d => d.id === id) || DECOUPAGE.find(d => id.startsWith(d.id)) || null;

// ================================================================ composer(t) : l'image de l'instant t
let ctx = null, A = null, B = null;
const ETAT = { t: 0, lot: '', plans: [], ebauche: false };
function remise(c) {
  if (c.reset) c.reset();
  else { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.clearRect(0, 0, W, H); }
  c.imageSmoothingEnabled = true; c.lineCap = 'butt'; c.lineJoin = 'miter';
}
function propre(c) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.imageSmoothingEnabled = true; c.setLineDash([]); c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)';
}
function rendrePlan(c, L, P, t) {
  remise(c);
  const D = ligneDe(P.id) || planDecoupage(t);
  const E = etatLots[L.id] || {};
  const infos = {
    lot: L, plan: D, europe: EUROPE, resultats: RESULTATS, donnees: DONNEES, rendu: RENDU,
    statut: P.ebauche ? E.statut : undefined, erreur: P.ebauche ? E.erreur : undefined,
  };
  try {
    const cam = P.camera ? C.camera(t, P.camera) : C.IDENTITE;
    (P.dessine || ebauche)(c, t, cam, infos);
  } catch (e) {
    ditUneFois(`${P.id}|${e.message}`, `[épisode] ${P.id} (lot ${L.id}) à ${t.toFixed(2)} s :`, e);
    remise(c);
    c.fillStyle = '#1a0c0c'; c.fillRect(0, 0, W, H);
    c.font = `28px ${C.PIX}`; c.fillStyle = C.ROUGE_TXT; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.fillText(`${P.id} · erreur dans plans/${L.id}.js à ${t.toFixed(2)} s`, 120, 380);
    c.font = `20px ${C.MONO}`; c.fillStyle = C.CRAIE;
    C.coupe(c, String(e && e.stack || e), 1600).slice(0, 8).forEach((l, i) => c.fillText(l, 120, 430 + i * 30));
  }
}
function transition(P, k) {
  const e = P.entree || {};
  return e.type === 'volet' ? { type: 'volet', k: C.eIO(k), sens: e.sens || 'droite' } : e.type === 'coupe' ? { type: 'coupe' } : { type: 'fondu', k: C.eIO(k) };
}
function poser(src, tr) {
  if (tr.type === 'coupe') { ctx.drawImage(src, 0, 0); return; }
  if (tr.type === 'fondu') { ctx.globalAlpha = tr.k; ctx.drawImage(src, 0, 0); ctx.globalAlpha = 1; return; }
  const k = tr.k, r = { droite: [0, 0, W * k, H], gauche: [W * (1 - k), 0, W * k, H], bas: [0, 0, W, H * k], haut: [0, H * (1 - k), W, H * k] }[tr.sens] || [0, 0, W * k, H];
  ctx.save(); ctx.beginPath(); ctx.rect(...r); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore();
}
function noir(P, t) {
  let a = 0;
  if (P.entree && P.entree.type === 'noir') a = Math.max(a, 1 - C.seg(t, P.de, P.de + (P.entree.d ?? .6)));
  if (P.sortie && P.sortie.type === 'noir') a = Math.max(a, C.seg(t, P.a - (P.sortie.d ?? .6), P.a));
  return a;
}
export function composer(t) {
  remise(ctx);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const L = lotA(t), P = t >= 0 && t < DUREE ? actifs(L, t) : [];
  if (P.length) {
    rendrePlan(A.getContext('2d'), L, P[0], t);
    ctx.drawImage(A, 0, 0);
    for (let i = 1; i < P.length; i++) {   // un chevauchement : le suivant apparaît sur le précédent
      rendrePlan(B.getContext('2d'), L, P[i], t);
      poser(B, transition(P[i], C.seg(t, P[i].de, Math.min(P[i - 1].a, P[i].a))));
    }
    const n = Math.max(...P.map(p => noir(p, t)));
    if (n > 0) { ctx.globalAlpha = n; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }
  propre(ctx);   // la surimpression part d'un contexte propre (sans reset() : la toile garde son image)
  surimpression(ctx, t);
  C.voile(ctx);
  ETAT.t = t; ETAT.lot = L.id; ETAT.plans = P.map(p => p.id); ETAT.ebauche = P.some(p => p.ebauche || p.dessine === ebauche);
  return ETAT;
}

// ================================================================ la surimpression
const RELAIS = .6;
const colle = (a, b) => Math.abs(a - b) < 1e-6;
function surimpression(c, t) {
  dialogue(c, t);
  // le cartouche : il entre en fondu, s'en va en fondu (.3 s) ; quand il change de mots sans s'en aller, c'est un relais
  const Ks = SURIMPRESSION.cartouches;
  Ks.forEach((K, i) => {
    const avant = Ks[i - 1], apres = Ks[i + 1];
    const relaisAvant = avant && colle(avant.a, K.de), relaisApres = apres && colle(apres.de, K.a);
    if (relaisAvant && t >= K.de && t < K.de + RELAIS) { relaisCartouche(c, t, avant, K); return; }
    const entre = relaisAvant ? (t >= K.de + RELAIS ? 1 : 0) : K.entree ? C.seg(t, K.de, K.de + K.entree) : t >= K.de ? 1 : 0;
    const a = entre * (relaisApres ? (t < K.a ? 1 : 0) : 1 - C.seg(t, K.a, K.a + .3));
    if (a > 0) C.cartouche(c, K.mots[0], K.mots[1], a);
  });
  // la mention
  const Ms = SURIMPRESSION.mentions;
  c.font = `16px ${C.MONO}`; c.fillStyle = C.GRIS; c.textAlign = 'right'; c.textBaseline = 'alphabetic';
  Ms.forEach((M, i) => {
    const avant = Ms[i - 1], apres = Ms[i + 1];
    // deux mentions qui se suivent : la première s'efface (0,2 s), puis la seconde paraît (0,2 s) ; jamais l'une sur l'autre
    const [e0, e1] = avant && colle(avant.a, M.de) ? [M.de, M.de + .2] : [M.de, M.de + .3];
    const [s0, s1] = apres && colle(apres.de, M.a) ? [M.a - .2, M.a] : [M.a - .3, M.a];
    const al = C.cloche(t, e0, e1, s0, s1);
    if (al <= 0) return;
    c.globalAlpha = al; C.texteSignes(c, M.txt, 1840, 1068);   // « ≈ » en pixels (aucune police du dépôt ne l'a)
  });
  c.globalAlpha = 1;
}
// le relais : le cadre passe d'une largeur à l'autre ; une ligne qui ne change pas reste, l'autre s'efface et se retape
function relaisCartouche(c, t, P, K) {
  const k = C.seg(t, K.de, K.de + RELAIS), { x, y, h } = C.CARTOUCHE;
  const w = C.lerp(C.largeurCartouche(c, ...P.mots), C.largeurCartouche(c, ...K.mots), C.eIO(C.seg(k, .15, .65)));
  C.fenetre(c, x, y, w, h, 1);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.font = `24px ${C.PIX}`; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  const ligne = (txt, n, col, yy) => { const v = [...txt].slice(0, n).join(''); if (v) { c.fillStyle = col; c.fillText(v, x + 22, yy); } };
  const garde = [P.mots[0] === K.mots[0], P.mots[1] === K.mots[1]], cols = [C.LAITON, C.CRAIE], ys = [y + 34, y + 68];
  const sort = 1 - C.seg(k, 0, .3);
  const tapes = [0, 1].filter(j => !garde[j]).map(j => [...K.mots[j]].length), n = Math.floor(tapes.reduce((s, v) => s + v, 0) * C.seg(k, .4, 1));
  let reste = n;
  for (const j of [0, 1]) {
    if (garde[j]) { c.globalAlpha = 1; ligne(K.mots[j], Infinity, cols[j], ys[j]); continue; }
    if (sort > 0) { c.globalAlpha = sort; ligne(P.mots[j], Infinity, cols[j], ys[j]); }
    const lj = [...K.mots[j]].length, nj = Math.min(reste, lj); reste -= nj;
    c.globalAlpha = 1; ligne(K.mots[j], nj, cols[j], ys[j]);
  }
  c.restore(); c.globalAlpha = 1;
}

// ================================================================ le son de l'image : ce qui sonne pendant l'image de l'instant t
// La page décrit le son, image par image ; tools/son-pilules.cjs le synthétise (tools/rendre-film.cjs --film
// episode-pilules) : les indices SONS des lots qui tombent dans l'image (t − 1/25, t], et les caractères que la boîte
// écrit pendant ce temps (les petits bips du texte, qui s'effaceront quand la voix de Ronan sera posée).
// Les bornes partent du numéro entier de l'image (k = t · 25) : la borne haute de l'image k − 1 est exactement la borne
// basse de l'image k, et chaque indice tombe dans une image et une seule (le film de 3 min 20 l'a appris : avec
// t − 1/25 en flottants, un son sonnait deux fois, un autre jamais).
export const VOCABULAIRE = Object.freeze(['tic', 'trotteuse', 'declic', 'haptique', 'frappe', 'hop', 'pop', 'grain', 'souffle', 'vie', 'peur',
  'envol', 'retour', 'tampon', 'coche', 'croix', 'clac', 'pouls', 'motif', 'vibreur', 'note', 'nappe', 'silence']);   // tools/son-pilules.cjs
let SONS_FILM = [];
const EPS = 1e-9;
function sonsEntre(t0, t1) {   // SONS_FILM est trié : une recherche par dichotomie (35 000 images à décrire)
  let lo = 0, hi = SONS_FILM.length;
  while (lo < hi) { const mi = (lo + hi) >> 1; if (SONS_FILM[mi].t <= t0) lo = mi + 1; else hi = mi; }
  const out = [];
  for (let i = lo; i < SONS_FILM.length && SONS_FILM[i].t <= t1; i++) out.push(SONS_FILM[i]);
  return out;
}
export function evenements(t) {
  const k = Math.round(t * IPS), t1 = k / IPS + EPS, t0 = (k - 1) / IPS + EPS;
  return {
    t,
    bips: ecritsEntre(t0, t1).map(b => ({ t: Math.round(b.t * 1e4) / 1e4, c: b.c, x: Math.round(b.x) })),
    sons: sonsEntre(t0, t1),
  };
}
// chaque indice SONS, et chaque caractère écrit, est pris par une image et une seule, de 0 à DUREE (pour verifie())
function verifieSons() {
  const pb = [], vus = new Map(), bips = new Map(), n = Math.round(DUREE * IPS);
  for (let i = 0; i <= n; i++) {
    const e = evenements(i / IPS);
    for (const s of e.sons) vus.set(s, (vus.get(s) || 0) + 1);
    for (const b of e.bips) bips.set(`${b.t}|${b.c}|${b.x}`, (bips.get(`${b.t}|${b.c}|${b.x}`) || 0) + 1);
  }
  const nom = s => `${s.t} ${s.son} (${s.lot})`;
  const doubles = SONS_FILM.filter(s => vus.get(s) > 1), perdus = SONS_FILM.filter(s => s.t > -1 / IPS + EPS && s.t <= DUREE + EPS && !vus.has(s));
  if (doubles.length) pb.push(`son : ${doubles.length} indices pris par deux images (${doubles.slice(0, 4).map(nom).join(', ')}…)`);
  if (perdus.length) pb.push(`son : ${perdus.length} indices pris par aucune image (${perdus.slice(0, 4).map(nom).join(', ')}…)`);
  const inconnus = SONS_FILM.filter(s => !VOCABULAIRE.includes(s.son));
  if (inconnus.length) pb.push(`son : ${inconnus.length} indices hors du vocabulaire de tools/son-pilules.cjs (${[...new Set(inconnus.map(nom))].slice(0, 4).join(', ')}…)`);
  const tous = ecritsEntre(-1, DUREE + 1).length, bd = [...bips.values()].filter(v => v > 1).length;
  if (bd || bips.size !== tous) pb.push(`son : bips du texte, ${bd} doublés, ${tous - bips.size} perdus`);
  return pb;
}

// ================================================================ les caractères : tous dans les polices du dépôt
// Les caractères de DotGothic16 et d'IBM Plex Mono 400 et 500 (../pilules/fonts/, des sous-ensembles latins), en plages
// hexadécimales. MONO et PIX se relaient (commun.js) : un caractère est dessiné par une police du dépôt s'il est dans
// l'une ou l'autre. Hors de là, le navigateur le prend dans une police du système, et l'image dépend de la machine
// (✓ ✗ ▶ ≈ sont dessinés en pixels par signe() et texteSignes() de commun.js ; ∅ s'écrit Ø). À refaire si les polices
// changent :
//   python3 -c "from fontTools.ttLib import TTFont; import glob; print(sorted({c for f in glob.glob('mockups/pilules/fonts/*.woff2') for c in TTFont(f).getBestCmap()}))"
const PLAGES_POLICES = '0 d 20-7e a0-ff 131 152-153 2bb-2bc 2c6 2da 2dc 300-301 303-304 308-309 323 3c6 2013-2014 2018-201a ' +
  '201c-201e 2022 2026 2032-2033 2039-203a 2044 20ac 2122 2190-2193 2212 2215 25a0 25b2-25b3 25b7 25bc';
const PLAGES = PLAGES_POLICES.split(' ').map(r => r.split('-').map(h => parseInt(h, 16)));
const dansPolices = c => { const n = c.codePointAt(0); return PLAGES.some(([a, b = a]) => n >= a && n <= b); };
export const horsPolices = txt => [...new Set([...txt].filter(c => c !== '\n' && !dansPolices(c)))];
// les textes de l'épisode (texte.js, les cartouches, la poussière de caractères ; les mentions passent par texteSignes,
// qui dessine ≈ en pixels) ; les mots écrits dans les plans, glyphes() les voit
function verifieCaracteres() {
  const signes = new Set(Object.keys(C.SIGNES));
  const textes = [...REPLIQUES.flatMap(r => [r.txt, r.attente || '']), DESCRIPTIONS.A, DESCRIPTIONS.B,
    ...SURIMPRESSION.cartouches.flatMap(k => k.mots), ...DECOUPAGE.flatMap(d => [d.titre, d.script || '']), ...SEQUENCES.map(s => s.nom), C.G.join('')];
  const hors = horsPolices(textes.join(''));
  const horsMentions = horsPolices(Object.values(MENTIONS).join('')).filter(c => !signes.has(c));
  const tout = [...new Set([...hors, ...horsMentions])];
  return tout.length ? [`texte : ${tout.join(' ')} hors des polices du dépôt (une police du système les dessinerait)`] : [];
}
// tout ce que l'épisode écrit (fillText, strokeText), de de à a, une image toutes les pas secondes : les caractères hors
// des polices du dépôt, avec un instant et une police où ils paraissent. Lent : pour les essais, pas pour verifie().
// window.film.glyphes(.25, 171.6, 381.6)
export function glyphes(pas = .25, de = 0, a = DUREE) {
  const P = CanvasRenderingContext2D.prototype, ft = P.fillText, st = P.strokeText, vus = new Map();
  let t = de;
  const note = (c, s) => { for (const ch of horsPolices(String(s))) if (!vus.has(ch)) vus.set(ch, `${ch} U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')} (${t.toFixed(2)} s, ${c.font})`); };
  P.fillText = function (s, ...r) { note(this, s); return ft.call(this, s, ...r); };
  P.strokeText = function (s, ...r) { note(this, s); return st.call(this, s, ...r); };
  try { for (; t < a; t = +(t + pas).toFixed(6)) composer(t); } finally { P.fillText = ft; P.strokeText = st; }
  return [...vus.values()];
}

// ce que les plans dessinent SOUS la surimpression, de de à a, une image toutes les pas secondes : sous la boîte XPHI
// (x 100–1820, y 880–1020), translucide (FOND_FENETRE, à 92 %), un plan clair se lit à travers, derrière les mots de Phi
// (au montage : les fils de P04–P05, P70, P78, la foule poussée de P25) ; sous le cartouche, quand il est là, un plan
// est caché (au montage : la fenêtre KANT de P21, poussée sous lui). Rend les instants où plus de 0,4 % des pixels du
// plan sous la boîte (1 % sous le cartouche) sont plus clairs que seuil (luminance 0–255), et ceux où une ligne fine
// passe sous le cartouche (une colonne de 20 pixels clairs : le filet de P28 que la poussée de P29 y faisait glisser).
// Restent, voulus ou sans conséquence : le titre qui vole dans le cartouche (P08, 87 s), les messages floutés de P65
// sous lui, le cadre du tirage de P74 qui le frôle (1 191–1 192 s), le titre de l'écran 02 qui passe derrière lui
// pendant le recul de P50 (753,9–754,0 s). Lent : pour les essais, pas pour verifie(). window.film.sousSurimpression(.5)
export function sousSurimpression(pas = .5, de = 0, a = DUREE, seuil = 110) {
  const out = [];
  const part = (g, x, y, w, h) => {
    const d = g.getImageData(x, y, w, h).data;
    let n = 0;
    for (let j = 0; j < d.length; j += 16) if (.3 * d[j] + .59 * d[j + 1] + .11 * d[j + 2] > seuil) n++;
    return n / (d.length / 16);
  };
  const ligne = (g, x, y, w, h) => {   // la colonne qui a le plus de pixels clairs : { x, n }
    const d = g.getImageData(x, y, w, h).data;
    let n = 0, xl = x;
    for (let i = 0; i < w; i++) {
      let k = 0;
      for (let j = 0; j < h; j++) { const q = 4 * (j * w + i); if (.3 * d[q] + .59 * d[q + 1] + .11 * d[q + 2] > seuil) k++; }
      if (k > n) { n = k; xl = x + i; }
    }
    return { x: xl, n };
  };
  for (let t = de; t < a; t = +(t + pas).toFixed(6)) {
    const E = composer(t), K = SURIMPRESSION.cartouches.find(k => t >= k.de && t < k.a);
    const wK = K ? C.largeurCartouche(ctx, ...K.mots) : 0;
    E.plans.forEach((id, i) => {
      const g = (i ? B : A).getContext('2d'), pb = part(g, 100, 880, 1720, 140);
      if (pb > .004) out.push(`${t.toFixed(2)} s, ${id} : ${(100 * pb).toFixed(1)} % du plan sous la boîte`);
      const pc = K ? part(g, C.CARTOUCHE.x - 9, C.CARTOUCHE.y - 9, wK + 18, C.CARTOUCHE.h + 18) : 0;   // avec ses filets
      if (pc > .01) out.push(`${t.toFixed(2)} s, ${id} : ${(100 * pc).toFixed(1)} % du plan sous le cartouche`);
      else if (K) {   // une ligne fine (un filet) : trop peu de pixels pour la part, mais une colonne claire de 20 px ou plus
        const l = ligne(g, C.CARTOUCHE.x - 9, C.CARTOUCHE.y - 9, wK + 18, C.CARTOUCHE.h + 18);
        if (l.n >= 20) out.push(`${t.toFixed(2)} s, ${id} : une ligne passe sous le cartouche (x ${l.x}, ${l.n} px)`);
      }
    });
  }
  return out;
}

// ce que les plans dessinent SOUS l'œil de Phi, de de à a, une image toutes les pas secondes : l'œil n'est pas dessiné
// (C.ESSAI_OEIL), on regarde sa place, un disque de 0,45 × sa taille, dans la toile du plan. Rend les instants où plus
// de 1 % du disque est plus clair que seuil (luminance 0–255) : le narrateur paraît tranché par ce qui passe sous lui
// (au montage : la poussée de P50 sur le graphique de l'écran 02). Les plans voulus (permis) n'y sont pas : P39–P43,
// où Phi se tient au sommet du filet qui sépare les deux colonnes. Lent : pour les essais, pas pour verifie().
// window.film.sousOeil(.5)
export function sousOeil(pas = .5, de = 0, a = DUREE, seuil = 110, permis = ['P39', 'P40', 'P41', 'P42', 'P43']) {
  const out = [];
  C.ESSAI_OEIL.saute = true;
  try {
    for (let t = de; t < a; t = +(t + pas).toFixed(6)) {
      C.ESSAI_OEIL.places.length = 0;
      const E = composer(t);
      if (E.plans.some(id => permis.some(p => id.startsWith(p)))) continue;
      for (const o of C.ESSAI_OEIL.places) {
        const r = .45 * o.taille, x0 = Math.max(0, Math.floor(o.x - r)), y0 = Math.max(0, Math.floor(o.y - r));
        const w = Math.min(W, Math.ceil(o.x + r)) - x0, h = Math.min(H, Math.ceil(o.y + r)) - y0;
        if (w <= 0 || h <= 0) continue;
        const d = o.ctx.getImageData(x0, y0, w, h).data;
        let n = 0, clairs = 0;
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
          const dx = x0 + i + .5 - o.x, dy = y0 + j + .5 - o.y; if (dx * dx + dy * dy > r * r) continue;
          const q = 4 * (j * w + i); n++;
          if (.3 * d[q] + .59 * d[q + 1] + .11 * d[q + 2] > seuil) clairs++;
        }
        if (n && clairs / n > .01) out.push(`${t.toFixed(2)} s, ${E.plans.join(' + ')} : ${(100 * clairs / n).toFixed(1)} % du disque de l'œil (${Math.round(o.x)}, ${Math.round(o.y)}) clair sous lui`);
      }
    }
  } finally { C.ESSAI_OEIL.saute = false; C.ESSAI_OEIL.places.length = 0; }
  return out;
}

// ce que Phi regarde, de de à a, une image toutes les pas secondes : le point visé par sa pupille (creeRegard) doit être
// à l'écran (en P06, il « balayait le mur » en fixant des fils encore hors du cadre, la pupille collée au bord de
// l'iris). Rend les instants où il est hors de [0, 1920] × [0, 1080], sauf pendant les moments permis ([de, a] :
// le N°48 qui entre par la gauche en P74, que Phi voit venir). Lent : pour les essais. window.film.regardHors(.25)
export function regardHors(pas = .25, de = 0, a = DUREE, permis = [[1205.5, 1206.3]]) {
  const out = [];
  C.ESSAI_OEIL.note = true;
  try {
    for (let t = de; t < a; t = +(t + pas).toFixed(6)) {
      C.ESSAI_OEIL.places.length = 0;
      const E = composer(t);
      if (permis.some(([p0, p1]) => t >= p0 && t <= p1)) continue;
      for (const o of C.ESSAI_OEIL.places) if (!(o.cx >= 0 && o.cx <= W && o.cy >= 0 && o.cy <= H)) out.push(`${t.toFixed(2)} s, ${E.plans.join(' + ')} : l'œil (${Math.round(o.x)}, ${Math.round(o.y)}) regarde (${Math.round(o.cx)}, ${Math.round(o.cy)}), hors de l'image`);
    }
  } finally { C.ESSAI_OEIL.note = false; C.ESSAI_OEIL.places.length = 0; }
  return out;
}

// le curseur du terminal (commun.js : terminal) tombe après le dernier signe dessiné : ✓ ✗ ▶ ≈ sont dessinés en pixels,
// plus larges que ne les mesure la police (en P21, le curseur couvrait la moitié du ✗ de « → ✓ ou ✗ », une demi-seconde
// sur deux). On écrit des lignes à signes dans un terminal hors de l'image, et on regarde où tombent les cases.
function verifieCurseur() {
  const pb = [], g = C.toile(900, 120).getContext('2d'), fr = g.fillRect;
  for (const txt of ['> universaliser(règle) → ✓ ou ✗', '→ ✓', '≈ 80 % ▶ fin']) {
    const cases = [];
    g.fillRect = function (x, y, w, h) { cases.push({ x, w, col: String(this.fillStyle).toLowerCase() }); return fr.call(this, x, y, w, h); };
    try { C.terminal(g, 0, [{ txt, t0: -100, col: C.CRAIE }], { x: 0, y: 0, w: 880, h: 110, taille: 26, fenetre: false }); } finally { delete g.fillRect; }
    const curseur = cases.filter(c => c.col === C.LABO.toLowerCase()).pop(), signes = cases.filter(c => c.col === C.CRAIE.toLowerCase() && c.w <= 12);
    const fin = Math.max(...signes.map(c => c.x + c.w));
    if (!curseur) pb.push(`terminal : pas de curseur après « ${txt} »`);
    else if (signes.length && curseur.x < fin - .5) pb.push(`terminal : après « ${txt} », le curseur (x ${curseur.x.toFixed(1)}) couvre le dernier signe (jusqu'à x ${fin.toFixed(1)})`);
  }
  return pb;
}

// ================================================================ la vérification (pour les lots, et les essais)
export function verifie() {
  const pb = [];
  for (const L of LOTS) {
    const E = etatLots[L.id];
    if (!E || E.erreur) { pb.push(`lot ${L.id} : ${E ? E.erreur : 'absent'}`); continue; }
    const M = E.module;
    if (M.LOT && (M.LOT.id !== L.id || Math.abs(M.LOT.de - L.de) > 1e-6 || Math.abs(M.LOT.a - L.a) > 1e-6)) pb.push(`lot ${L.id} : LOT = ${JSON.stringify(M.LOT)}, l'épisode dit ${L.de} → ${L.a}`);
    for (const p of E.plans) {
      if (typeof p.dessine !== 'function') pb.push(`${L.id}/${p.id} : pas de dessine()`);
      if (p.de < L.de - 1e-6 || p.a > L.a + 1e-6) pb.push(`${L.id}/${p.id} : ${p.de} → ${p.a} sort du lot (${L.de} → ${L.a})`);
      const D = ligneDe(String(p.id));
      if (!D) pb.push(`${L.id}/${p.id} : ce plan n'est pas dans le découpage (EPISODE.md)`);
      else if (D.lot !== L.id) pb.push(`${L.id}/${p.id} : le découpage le donne au lot ${D.lot}`);
    }
    for (let x = L.de; x < L.a - 1e-6; x += .1) if (!E.plans.some(p => x >= p.de && x < p.a)) { pb.push(`lot ${L.id} : aucun plan à ${x.toFixed(1)} s (l'ébauche le remplace)`); break; }
    // les essais propres au lot (une étiquette qui arrive trop tard, un chiffre dit qui ne suit plus les données…)
    if (typeof M.verifie === 'function') { try { for (const m of M.verifie()) pb.push(`${L.id} : ${m}`); } catch (e) { pb.push(`${L.id} : verifie() a levé « ${e.message} »`); } }
  }
  for (const m of verifieRepliques()) pb.push(`texte : ${m}`);
  for (const m of motsIntrouvables()) pb.push(`texte : ${m} n'est plus dans la réplique : le repère d'image accroché à ce mot est perdu`);
  for (const m of verifieSons()) pb.push(m);
  for (const m of verifieCaracteres()) pb.push(m);
  for (const m of verifieAdresse()) pb.push(m);
  for (const m of verifieCurseur()) pb.push(m);
  if (RESULTATS && typeof RESULTATS.verifieSurlignes === 'function') for (const m of RESULTATS.verifieSurlignes()) pb.push(`résultats : ${m}`);
  if (DONNEES && typeof DONNEES.verifie === 'function') { try { for (const m of DONNEES.verifie()) pb.push(`données : ${m}`); } catch (e) { pb.push(`données : verifie() a levé « ${e.message} »`); } }
  for (const [nom, M] of Object.entries(MODULES)) if (!M || M.erreur) pb.push(`${nom}.js ${M && M.erreur ? `illisible (${M.erreur})` : 'absent'} : les lots qui l'importent montrent leur ébauche`);
  if (!EUROPE) pb.push('europe.js absent : globalThis.EUROPE est vide (la carte P63 attendra)');
  return pb;
}

// ================================================================ l'adresse : la boucle et l'instant
// ?plan= (un lot, une séquence, un plan), ?de=, ?a= (un moment) : le mode boucle, qui joue tout de suite ; ?t= : une
// image fixe. Les instants s'écrivent avec un point ou une virgule (EPISODE.md les écrit à la française : « 202,5 s ») ;
// un instant illisible est dit (avertissements) et ignoré : la page revient à l'affiche (ou au début de la boucle).
// Pure (verifie() l'essaie) : lisAdresse('?t=202,5').T0 → 202.5.
const lisNombre = v => { const x = parseFloat(String(v).trim().replace(',', '.')); return Number.isFinite(x) ? x : null; };
export function lisAdresse(q) {
  const params = q instanceof URLSearchParams ? q : new URLSearchParams(q), avertissements = [];
  let boucle = [0, DUREE];
  const pl = params.get('plan');
  if (pl) {
    const L = LOTS.find(l => l.id === pl), D = DECOUPAGE.find(d => d.id === pl.toUpperCase()), S = SEQUENCES.find(s => s.id === pl.toUpperCase());
    if (L) boucle = [L.de, L.a];
    else if (D) boucle = [D.de, D.a];
    else if (S) boucle = [DECOUPAGE.find(d => d.id === S.de).de, DECOUPAGE.find(d => d.id === S.a).a];
    else avertissements.push(`?plan=${pl} : ni un lot (${LOTS.map(l => l.id).join(', ')}), ni une séquence (S01…S13), ni un plan (P01…P85)`);
  }
  const instant = cle => {
    if (!params.has(cle)) return null;
    const v = lisNombre(params.get(cle));
    if (v === null) avertissements.push(`?${cle}=${params.get(cle)} : illisible (un nombre de secondes, comme 202.5 ou 202,5)`);
    return v;
  };
  const de = instant('de'), a = instant('a');
  if (de !== null || a !== null) boucle = [de ?? boucle[0], a ?? boucle[1]];
  // le mode boucle : un plan, un lot, une séquence, ou un moment (?de=, ?a=, ou les deux : ?a= seul boucle sur [0, a])
  const enBoucle = !!pl || params.has('de') || params.has('a');
  return { pl, boucle, enBoucle, T0: instant('t'), avertissements };
}
function verifieAdresse() {
  const pb = [], essai = (q, attendu) => {
    const r = lisAdresse(q), vu = { boucle: r.boucle, enBoucle: r.enBoucle, T0: r.T0 }, ok = Object.entries(attendu).every(([k, v]) => JSON.stringify(vu[k]) === JSON.stringify(v));
    if (!ok) pb.push(`adresse : ${q} donne ${JSON.stringify(vu)}, attendu ${JSON.stringify(attendu)}`);
  };
  essai('?t=202,5', { T0: 202.5, enBoucle: false });
  essai('?t=202.5', { T0: 202.5 });
  essai('?t=abc', { T0: null });
  essai('?de=600,5&a=605', { boucle: [600.5, 605], enBoucle: true });
  essai('?a=2', { boucle: [0, 2], enBoucle: true });
  essai('?plan=P42', { boucle: [578, 600.3], enBoucle: true });
  return pb;
}

// ================================================================ le démarrage, la lecture
const fmt = s => { const m = Math.floor(s / 60), r = s - 60 * m; return `${m}:${r.toFixed(1).padStart(4, '0').replace('.', ',')}`; };
const erreurDe = M => String(M && M.erreur && (M.erreur.message || M.erreur) || 'module absent');
// lots : { id → module (ou { erreur }) } chargés par index.html ; europe : globalThis.EUROPE (ou null) ; resultats,
// donnees : les modules resultats.js et donnees.js (ou { erreur }, ou absents) — écrits à part : leur absence ne casse rien
export async function demarre({ lots = {}, europe = null, resultats = null, donnees = null } = {}) {
  const params = new URLSearchParams(location.search);
  RENDU = params.has('rendu');
  if (params.has('ecriture')) reglerEcriture(params.get('ecriture'));
  EUROPE = europe || globalThis.EUROPE || null;
  MODULES.resultats = resultats; MODULES.donnees = donnees;
  RESULTATS = resultats && !resultats.erreur ? resultats : null;
  DONNEES = donnees && !donnees.erreur ? donnees : null;
  for (const [nom, M] of Object.entries(MODULES)) if (M && M.erreur) console.info(`[épisode] ${nom}.js : ${erreurDe(M)}`);
  for (const L of LOTS) {
    const M = lots[L.id];
    if (!M || M.erreur) { etatLots[L.id] = { erreur: erreurDe(M), statut: 'module absent ou cassé', plans: [], sons: [] }; if (M) console.error(`[épisode] lot ${L.id} :`, M.erreur); continue; }
    const plans = Array.isArray(M.PLANS) ? [...M.PLANS] : [];
    etatLots[L.id] = { module: M, plans, sons: Array.isArray(M.SONS) ? M.SONS : [], statut: plans.length ? '' : 'PLANS vide' };
  }
  const toileFilm = document.getElementById('film');
  ctx = toileFilm.getContext('2d');
  A = C.toile(W, H); B = C.toile(W, H);
  // les polices avant la première image (elles sont dans le dépôt : ../pilules/fonts/)
  const polices = Promise.all(['34px "DotGothic16"', '20px "IBM Plex Mono"', '500 20px "IBM Plex Mono"'].map(f => document.fonts.load(f)));
  await Promise.race([polices, new Promise(r => setTimeout(r, 3000))]).catch(() => {});
  C.prepare(); prepareTextes();

  // la boucle et l'instant de l'adresse
  const { pl, boucle, enBoucle, T0, avertissements } = lisAdresse(params);
  for (const m of avertissements) console.warn(`[épisode] ${m}`);

  const sons = LOTS.flatMap(L => (etatLots[L.id].sons || []).map(s => ({ ...s, lot: L.id })));
  SONS_FILM = sons.filter(s => Number.isFinite(s.t)).sort((a, b) => a.t - b.t);
  window.film = {
    pret: false, duree: DUREE, ips: IPS, largeur: W, hauteur: H,
    lots: LOTS, decoupage: DECOUPAGE, sequences: SEQUENCES, surimpression: SURIMPRESSION, sons,
    // une image : la dessine et rend ce qui s'y passe (le lot, les plans) et ce qui y sonne — pour tools/rendre-film.cjs
    image: t => ({ ...composer(t), plans: [...ETAT.plans], ...evenements(t) }),
    // ce qui sonne pendant l'image de l'instant t, sans la dessiner (le son seul : rendre-film.cjs --son-seul)
    evenements,
    verifie,
    glyphes,
    sousSurimpression,
    sousOeil,
    regardHors,
  };
  if (RENDU) {
    document.documentElement.classList.add('rendu');
    composer(T0 ?? AFFICHE);
    window.film.pret = true;
    return;
  }

  // ---------------------------------------------------------------- la lecture
  const barre = document.getElementById('barre'), piste = document.getElementById('piste'), tete = document.getElementById('tete');
  const etiquette = document.getElementById('etiquette'), temps = document.getElementById('temps'), aide = document.getElementById('aide');
  const segs = document.getElementById('segments');
  for (const L of LOTS) {
    const s = document.createElement('div'); s.className = 'seg'; s.title = `${L.id} · ${L.plans} · ${L.sequences}`;
    s.style.left = `${100 * L.de / DUREE}%`; s.style.width = `${100 * (L.a - L.de) / DUREE}%`;
    if (etatLots[L.id].erreur || !etatLots[L.id].plans.length || etatLots[L.id].plans.every(p => p.dessine === ebauche)) s.classList.add('absent');
    segs.appendChild(s);
  }
  if (enBoucle) {
    const b = document.createElement('div'); b.className = 'boucle';
    b.style.left = `${100 * boucle[0] / DUREE}%`; b.style.width = `${100 * (boucle[1] - boucle[0]) / DUREE}%`;
    segs.appendChild(b);
  }
  let t = T0 ?? (enBoucle ? boucle[0] : 0), joue = false, depart = 0, tDepart = 0, raf = 0, dernier = 0;
  // ---------------------------------------------------------------- le son (son.mp3), joué avec l'image
  // son.mp3 est calculé par node tools/rendre-film.cjs --film episode-pilules --son-seul (à relancer quand le temps de
  // l'épisode ou ses SONS changent). S'il joue, c'est lui qui donne l'heure pendant la lecture ; sinon (tant qu'il
  // arrive, ou que le navigateur ne le laisse pas jouer), l'horloge de la page. M coupe le son.
  // Il est lu par un élément audio, au fil de la lecture, sans être décodé d'avance : décodé en entier (comme dans le
  // film de 3 min 20, qui dure sept fois moins), il coûtait 538 Mo de mémoire par onglet et 10 s de calcul. Rien n'est
  // chargé avant la première lecture (une image fixe ?t= ne le demande pas). Si le serveur sert des morceaux de fichier
  // (Accept-Ranges : GitHub Pages), l'élément le lit directement ; sinon (python3 -m http.server ne le sait pas, et
  // l'élément ne pourrait que repartir du début), il est d'abord téléchargé en entier (22 Mo, en mémoire comme fichier).
  const son = { existe: false, morceaux: false, charge: false, audio: null, muet: false };
  const sonLa = fetch('son.mp3', { method: 'HEAD' }).then(r => {   // l'en-tête seul : y a-t-il un son, se lit-il par morceaux ?
    son.existe = r.ok; son.morceaux = r.ok && /bytes/i.test(r.headers.get('accept-ranges') || ''); majAide();
  }).catch(() => {});
  const sonCharge = () => {
    if (son.charge) return;
    son.charge = true;
    const pose = src => {
      const a = new Audio(); a.preload = 'auto'; a.muted = son.muet;
      a.addEventListener('loadedmetadata', () => { son.audio = a; if (joue) sonJoue(t); majAide(); }, { once: true });
      a.addEventListener('error', () => { son.audio = null; son.existe = false; majAide(); }, { once: true });
      a.src = src;
    };
    sonLa.then(() => {
      if (!son.existe) return;
      if (son.morceaux) pose('son.mp3');
      else fetch('son.mp3').then(r => (r.ok ? r.blob() : null)).then(b => { if (b) pose(URL.createObjectURL(b)); }).catch(() => {});
    });
  };
  const sonCoupe = () => { if (son.audio) son.audio.pause(); };
  const sonJoue = x => {
    if (!son.audio) { sonCharge(); return; }   // le son arrive : il se calera sur l'image (loadedmetadata)
    const a = son.audio;
    if (!(x < a.duration - .05)) { a.pause(); return; }
    a.currentTime = x;
    const p = a.play();
    if (p) p.catch(() => {});   // le navigateur attend un geste (une lecture partie seule, en mode boucle) : l'image continue, muette
  };
  // le son donne l'heure quand il joue vraiment (ni en pause, ni en train de se déplacer, ni à court de données)
  const sonCourt = () => { const a = son.audio; return !!a && !a.paused && !a.seeking && a.readyState >= 3; };
  const afficher = x => {
    t = x; composer(t);
    const D = planDecoupage(Math.min(t, DUREE - 1e-6)), S = sequenceA(Math.min(t, DUREE - 1e-6));
    tete.style.left = `${100 * C.clamp(t / DUREE)}%`;
    temps.textContent = `${fmt(t)} / ${fmt(DUREE)}`;
    etiquette.textContent = `${S ? `${S.id} · ` : ''}${D ? `${D.id} · ${D.titre}` : ''} · lot ${ETAT.lot}${ETAT.ebauche ? ' (ébauche)' : ''}${pl ? ` · boucle ${pl}` : ''}`;
  };
  // L'image suit le son quand il joue, sinon l'horloge de la page, qui part de l'instant du départ (tDepart) : prise
  // avec performance.now(), comme depart (l'horodatage de requestAnimationFrame est celui du début de l'image, souvent
  // antérieur au départ : la première image de la lecture tombait avant lui, dans le plan d'avant). Et pendant une
  // lecture, l'image ne recule jamais (dernier) : le son qui se cale après un déplacement la retient un instant.
  const avance = () => {
    if (!joue) return;
    let x;
    if (sonCourt()) { x = son.audio.currentTime; tDepart = x; depart = performance.now(); }   // l'horloge de la page suit le son
    else x = tDepart + Math.max(0, performance.now() - depart) / 1000;
    x = Math.max(x, dernier);
    if (x >= boucle[1]) {
      if (enBoucle) { tDepart = boucle[0]; depart = performance.now(); x = boucle[0]; sonJoue(x); }
      else { joue = false; sonCoupe(); afficher(DUREE - 1e-3); majAide(); return; }
    }
    dernier = x;
    afficher(x);
    raf = requestAnimationFrame(avance);
  };
  const majAide = () => {
    const m = son.existe ? (son.muet ? ' · M : son coupé' : ' · M') : '';
    aide.textContent = joue ? `espace : pause${m}` : `espace : lecture · ← → 5 s · Maj 1 s · , . une image · R · C${m}`; barre.classList.toggle('joue', joue);
  };
  const memorise = () => {   // en pause, l'adresse garde l'instant (?t=) : on peut la donner à quelqu'un
    const p = new URLSearchParams(location.search); p.set('t', t.toFixed(2)); history.replaceState(null, '', `?${p}`);
  };
  // une seule boucle d'images : relancer la lecture pendant qu'elle tourne annule l'image demandée avant d'en redemander
  // une (sinon chaque R ajoutait une boucle, et l'image était composée plusieurs fois par affichage)
  const lecture = (oui = !joue) => {
    if (oui && t >= boucle[1] - 1e-3) t = boucle[0];
    joue = oui; majAide();
    cancelAnimationFrame(raf);
    if (joue) { tDepart = dernier = t; depart = performance.now(); sonJoue(t); raf = requestAnimationFrame(avance); } else { sonCoupe(); memorise(); }
  };
  const aller = x => { const y = C.clamp(x, 0, DUREE - 1e-3); if (joue) { tDepart = dernier = y; depart = performance.now(); sonJoue(y); } afficher(y); if (!joue) memorise(); };
  toileFilm.addEventListener('click', () => lecture());
  piste.addEventListener('click', e => { const r = piste.getBoundingClientRect(); aller(DUREE * (e.clientX - r.left) / r.width); });
  addEventListener('keydown', e => {
    const k = e.key;
    if (k === ' ') { e.preventDefault(); lecture(); }
    else if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); aller(t + (k === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 1 : 5)); }
    else if (k === '.' || k === ',') aller(t + (k === '.' ? 1 : -1) / IPS);
    else if (k === 'r' || k === 'R') { aller(boucle[0]); lecture(true); }
    else if (k === 'c' || k === 'C') barre.classList.toggle('cachee');
    else if (k === 'm' || k === 'M') { son.muet = !son.muet; if (son.audio) son.audio.muted = son.muet; majAide(); }
    else if (k === 'Home') aller(boucle[0]);
  });
  let calme;
  if (T0 !== null) barre.classList.add('calme');   // une image fixe (une capture) : la barre attend la souris
  addEventListener('pointermove', () => { barre.classList.remove('calme'); clearTimeout(calme); calme = setTimeout(() => joue && barre.classList.add('calme'), 2500); });
  window.film.aller = x => { lecture(false); aller(x); };
  window.film.lecture = lecture;
  // l'essai de la lecture (hors ?rendu=1, asynchrone) : partie de l'image fixe du début d'un plan, la lecture ne montre
  // jamais une image d'avant le départ, ni d'un autre plan (la première image tombait dans le plan d'avant : un éclair
  // de P08 en partant de P09). window.film.essaiLecture(['P09', 'P19']) → [] si tout va bien.
  window.film.essaiLecture = async (ids = ['P09', 'P19', 'P42']) => {
    const pb = [], avant = t, image = () => new Promise(r => requestAnimationFrame(() => r()));
    for (const id of ids) {
      const D = DECOUPAGE.find(d => d.id === id);
      if (!D) { pb.push(`essaiLecture : ${id} n'est pas un plan`); continue; }
      lecture(false); aller(D.de); await image();
      lecture(true);
      for (let i = 0; i < 6; i++) {
        await image();
        if (ETAT.t < D.de - 1e-9 || !ETAT.plans.some(p => p.startsWith(D.id))) { pb.push(`lecture depuis ${id} (${D.de} s) : image ${i + 1} à ${ETAT.t.toFixed(3)} s (${ETAT.plans.join(', ') || 'aucun plan'})`); break; }
      }
      lecture(false);
    }
    aller(avant);
    return pb;
  };

  afficher(T0 ?? (enBoucle ? boucle[0] : AFFICHE));
  if (T0 === null && !enBoucle) { t = 0; tete.style.left = '0%'; temps.textContent = `${fmt(0)} / ${fmt(DUREE)}`; etiquette.textContent = `l’affiche (${fmt(AFFICHE)})`; }
  majAide();
  window.film.pret = true;
  const pb = verifie();
  if (pb.length) console.info(`[épisode] à vérifier (${pb.length}) :\n- ${pb.join('\n- ')}`);
  if (T0 === null && enBoucle) lecture(true);
}
