/* ==========================================================================
   Les deux pilules, l'épisode — plans/test.js : le lot « test »
   P09–P18, de 87,8 à 171,6 s (1:27,8–2:51,6), répliques T01–T12.
   Partie 1 · Le test (dans le script : 1:30 – 3:00).

   Ronan : « On reprend son test et ses douze écrans de résultats, avec les
   nouveaux bonshommes » ; « je veux que tu prennes les petits bonhommes que tu
   as dans le premier film de 3 minutes 20 ». Ici, le test jouable de Thibaut
   (mockups/pilules/index.html), rejoué en fonction du temps avec les
   bonshommes du film (commun.js : dessineSujet, l'atlas, les coiffes, les
   états), sur les CENT PREMIERS PARTICIPANTS (PREMIERS, la grille
   d'index.html ; le N°48 est PREMIERS[47]) : le terminal, les deux pilules qui
   se forment de ses caractères, la foule, l'isoloir du N°48, la démonstration
   (sous l'étiquette « EXEMPLE » : ce ne sont pas des résultats), celui qui ne
   prend rien, les quatre questions, les coches, le tampon. Une seule graine
   nouvelle, plantée sans bruit : la petite étiquette « A » dans le coin de
   RÈGLES (commun.js : fenetreRegles, etiquetteA), qu'on ne commente jamais.

   Les dix plans sont un seul décor, le laboratoire d'index.html : scene(t)
   dessine tout, chaque plan n'en est qu'un moment (la caméra, l'œil, la
   lumière changent ; rien ne saute aux frontières). La démonstration
   d'index.html, pilotée par des événements (fouleMontre, fouleChoisit,
   fouleLueur, fouleTue, fouleRemet, verifs), est réécrite en dates : les
   instants de SUJETS. Chaque geste tombe sur son mot (quandMot de texte.js :
   le jour où la voix de Ronan est posée, tout suit) ; aucun état d'une image à
   l'autre, jamais Math.random (hache, rng à graines fixes).

   Repris (recopiés, non exportés par leur module) : film-pilules/plans/
   regles.js (SUJETS, couleur, dissolution, etatSujet, compte, laJauge,
   posePilule, dernier, parmi, la caméra du lot) ; film-pilules/plans/
   isoloir.js (parois, cadenas, question, QUESTIONS, OPT4, BOUTON) ;
   pilules/index.html (TERM, prepareTerminal, fouleCamera, verifs, st.pulse,
   les tampons OBLIGATOIRE et « 100 / 100 ONT COMPRIS »).

   Trois écarts au découpage, voulus (EPISODE.md, P09, P14, P16) :
   - le terminal est posé en (110, 420), sous l'œil, et non en (110, 160) :
     l'œil est déjà là (650, 240, 220), et la deuxième ligne (« … choix
     simultanés ») passerait dedans (index.html n'allumait l'œil qu'après) ;
   - la vague des sauts de P14 part un peu avant « bleue », pour que la jauge
     passe le trait des 50 % SUR « bleue » et que la foule s'illumine sur
     « tout le monde vit » (partie sur « bleue », la vague de 2,2 s n'aurait
     pas fini quand la voix dit « vit ») ;
   - pour celui qui ne prend rien (P16), l'œil va à sa place de l'isoloir
     (1 110, 300, 150), comme dans index.html : au-dessus de lui, il couvrirait
     son voisin agrandi.
   Et deux choix de mise en scène que le découpage laisse ouverts : les icônes
   des pilules s'effacent pendant les poussées (elles flotteraient sur les
   sujets agrandis), puis restent au-dessus de la foule jusqu'à la fin, comme
   dans le test ; l'étiquette « EXEMPLE » reste seule pendant P16, quand la
   jauge s'en va (c'est encore une démonstration).

   Raccords :
   - entrée (87,8 s) : le laboratoire vide, l'œil en (650, 240, 220) qui vous
     regarde (la fin du lot ouverture) ;
   - sortie (171,6 s) : la foule PREMIERS grise, ses ✓ ; le tampon « 100 / 100
     ONT COMPRIS » ; RÈGLES et ses cinq règles (et le petit « A ») ; les deux
     pilules en icônes (index.html) ; l'œil en (650, 160, 160) ; coupe franche
     vers Kant.

   Essais : index.html?plan=test (le lot en boucle), ?plan=P14, ?t=121.5 ; et,
   dans la console, (await import('./plans/test.js')).ESSAI : le minutage, ce
   que regarde Phi, et ce que fait la foule à un instant (combien ont peur,
   sautent, vivent, partent en caractères) — une peur restée coincée jusqu'à
   P18 s'est vue ainsi.
   ========================================================================== */
import {
  W, CRAIE, GRIS, GRIS_FIG, LABO, LAITON, BLEU, ROUGE, ROUGE_TXT, FILET, MONO, PIX, G, FOND_FENETRE,
  clamp, lerp, seg, cloche, eIO, eOut, eBack, cles, hache, rng, mix, fr, balise, ecrit, coupe, espace, texteSignes,
  fond, fenetre, tampon, jauge, pilule, PILULES, POSES, humeur, flotte, cligne, oeil, creeRegard, VOUS, point,
  dessineSujet, PREMIERS, LOTS, ORDRE, MAUVAIS, N48, ABSTIENT, crochets, cadre, etiquette,
  REGLES, REGLES_FEN, fenetreRegles,
} from '../commun.js';
import { REPLIQUE, quandMot, plume as plumeBoite } from '../texte.js';

export const LOT = { id: 'test', de: 87.8, a: 171.6 };

// ================================================================ les mots dits : les gestes tombent dessus
// quandMot (texte.js) : l'instant où la boîte écrit le mot, c'est-à-dire où la voix (estimée, puis enregistrée) le dit.
const mot = (id, m) => quandMot(id, m, REPLIQUE[id].de);
const de = id => REPLIQUE[id].de;

// les sauts du choix (index.html : fouleChoisit, la vague dans l'ORDRE, 0,022 s d'un sujet au suivant)
const RANG = Object.freeze(PREMIERS.map(f => ORDRE.indexOf(f.i)));
// le rang, dans la vague de b62, du 51e bleu (la jauge passe le trait des 50 %)
const K51 = (() => { let n = 0; for (let k = 0; k < 100; k++) if (LOTS.b62.has(ORDRE[k]) && ++n === 51) return k; return 80; })();

// ================================================================ le minutage du lot (EPISODE.md, P09–P18)
const S = (() => {
  const s = {};
  // P09 · le terminal (sans voix : il s'écrit avant T01, à partir du début du lot, comme l'étape « accueil » d'index.html)
  s.term = [LOT.de + .3, LOT.de + 1.5, LOT.de + 2.6];
  s.pourCeux = mot('T01', 'Pour ceux');                     // Phi vous regarde
  s.resume = mot('T01', 'je résume');                       // les caractères du terminal s'envolent
  // P10 · les deux pilules se forment des caractères (pilule(…, { t0 }) : entières environ 1,5 s après t0)
  s.bleue = mot('T02', 'une bleue') - .45;
  s.rouge = mot('T02', 'une rouge') - .45;
  s.participant = mot('T02', 'Chaque participant');
  s.r0 = mot('T02', 'avaler');                              // RÈGLES s'ouvre, la règle 0
  // P11 · vous êtes cent
  s.cent = mot('T03', 'Vous êtes cent');                    // les pilules en icônes ; l'œil monte ; la foule paraît
  s.montre = s.cent + .3;
  s.cligne = mot('T03', 'en même temps') + .25;             // les cent clignent ensemble, une fois
  s.concerter = mot('T03', 'sans vous concerter');          // chacun regarde ailleurs
  // P12 · l'isoloir du N°48
  s.prive = mot('T04', 'Chaque');                           // la poussée ×1 → ×4,2 (1,6 s)
  s.connait = mot('T04', 'personne ne connaît');            // les « ? » pulsent, l'un après l'autre
  s.r1 = mot('T04', 'celui des autres');
  // P13 · une formulation possible
  s.recul = mot('T05', 'Voici');                            // ×4,2 → ×1 (1,2 s)
  s.formulation = mot('T05', 'formulation possible');       // RÈGLES pulse, l'étiquette « A » s'allume d'un cran
  s.possible = mot('T05', 'possible');                      // Phi y jette un œil, 0,3 s
  // P14 · tout le monde vit (b62) : la vague est calée pour que la jauge passe le trait sur « bleue »
  s.jauge = de('T06') + .3;
  s.seuil = mot('T06', 'bleue');
  s.choix1 = s.seuil - .3 - K51 * .022;
  s.lueur = Math.max(mot('T06', 'tout le monde vit'), s.choix1 + .3 + 99 * .022 + .1);
  s.r2 = s.lueur + .6;
  // P15 · les bleus meurent (b40)
  s.remet1 = de('T07');
  s.choix2 = mot('T07', 'la rouge');
  s.meurent = mot('T07', 'meurent');
  s.r3 = mot('T07', 'survivent');
  // P16 · obligatoire ; celui qui ne prend rien ; tout le monde meurt
  s.remet2 = de('T08');
  s.oblig = mot('T08', 'obligatoire') + .25;               // le tampon tombe
  s.seule = mot('T09', 'une seule personne');               // le tampon s'efface ; la vague, sauf un
  s.choix3 = s.seule + .1;
  s.abst = s.choix3 + .1;                                   // il croise les bras (il ne saute pas)
  s.marque = s.choix3 + .55;                                // cerclé, Ø
  s.rien = mot('T09', 'ne prend rien') - .15;               // la poussée sur lui (0,95 s)
  s.meurt = mot('T09', 'tout le monde meurt');              // le recul, et toute la foule part en caractères
  s.r4 = s.meurt + .6;
  // P17 · le test de compréhension (QUESTIONS d'index.html, rejouées vite)
  s.p17 = LOT.de + (144.9 - 87.8);                          // la coupe de P17 : la foule se recompose
  s.q2 = mot('T10', 'test de compréhension');
  s.trompe = mot('T11', 'se trompait');
  s.reexplique = mot('T11', 'réexpliquais');
  s.repose = mot('T11', 'reposais');
  // P18 · cent sur cent
  s.p18 = LOT.de + (158.4 - 87.8);
  s.verif = mot('T12', 'Personne');                         // la vague des ✓
  s.corr = mot('T12', 'compris la règle');                  // RÈGLES pulse : les huit ✗ sont corrigés
  s.savait = mot('T12', 'chacun savait');                   // les têtes se tournent, de proche en proche
  s.tampon = mot('T12', 'comprise aussi') + .2;             // « 100 / 100 ONT COMPRIS »
  s.aussi = mot('T12', 'aussi');
  return Object.freeze(s);
})();

// ---------------------------------------------------------------- les quatre questions d'index.html (QUESTIONS, OPT4)
const OPT2 = Object.freeze(['Tout le monde vit.', 'Tout le monde meurt.']);
const OPT4 = Object.freeze(['Tout le monde vit.', 'Les bleus vivent, les rouges meurent.', 'Les bleus meurent, les rouges vivent.', 'Tout le monde meurt.']);
const QUESTIONS = Object.freeze([
  { txt: fr('Si tout le monde prend la [b]bleue[/b] :'), lot: 'b100', opts: OPT2, ok: 0, issue: 'vie' },
  { txt: fr('Si tout le monde prend la [r]rouge[/r] :'), lot: 'b0', opts: OPT2, ok: 0, issue: 'vie' },
  { txt: fr('Si 25 % prennent la [b]bleue[/b] et 75 % la [r]rouge[/r] :'), lot: 'b25', opts: OPT4, ok: 2, issue: 'mort' },
  { txt: fr('Si 75 % prennent la [b]bleue[/b] et 25 % la [r]rouge[/r] :'), lot: 'b75', opts: OPT4, ok: 0, issue: 'vie' },
]);
// chaque question posée : de (elle s'affiche, la foule se remet), choix (la vague : pas s par sujet), tsel (le cadre
// laiton se pose sur la réponse sel), rep (✓ ou ✗, et ce que la règle fait à la foule), a (elle s'en va)
const POSEES = (() => {
  const q1 = { q: 0, de: S.p17 + .6, sel: 0 };
  Object.assign(q1, { choix: q1.de + .7, pas: .006, tsel: q1.de + 1.75, rep: q1.de + 2.1 });
  const q2 = { q: 1, de: S.q2, sel: 0 };
  Object.assign(q2, { choix: q2.de + .35, pas: .006, tsel: q2.de + 1.1, rep: q2.de + 1.45 });
  const q3 = { q: 2, de: S.trompe - .15, sel: 0, essai: '1re tentative' };          // la réponse fausse
  Object.assign(q3, { choix: q3.de + .25, pas: .005, tsel: q3.de + .7, rep: q3.de + 1.0 });
  const q3b = { q: 2, de: S.repose, sel: 2, essai: '2e tentative' };                 // reposée : juste
  Object.assign(q3b, { choix: q3b.de + .1, pas: .004, tsel: q3b.de + .5, rep: q3b.de + .75 });
  const q4 = { q: 3, de: q3b.rep + .45, sel: 0 };                                      // très brève
  Object.assign(q4, { choix: q4.de + .35, pas: .004, tsel: q4.de + .8, rep: q4.de + 1.05 });
  q1.a = q2.de; q2.a = q3.de; q3.a = S.reexplique + .35; q3b.a = q4.de; q4.a = S.p18 + .4;
  return Object.freeze([q1, q2, q3, q3b, q4].map(p => Object.freeze({ ...p, Q: QUESTIONS[p.q], juste: p.sel === QUESTIONS[p.q].ok })));
})();
const [Q1, Q2, Q3, Q3B, Q4] = POSEES;
// la fenêtre de question, sous la foule (y 652–802 : son cadre laiton laisse respirer l'étiquette XPHI, en y 838)
const FQ = Object.freeze({ x: 80, y: 652, w: 1760, h: 150 });
const BOUTON = (n, i) => {
  if (n === 2) { const bw = 560, gap = 40, x0 = 960 - (2 * bw + gap) / 2; return { x: x0 + i * (bw + gap), y: FQ.y + 70, w: bw, h: 64 }; }
  const bw = (FQ.w - 48 - 3 * 16) / 4; return { x: FQ.x + 24 + i * (bw + 16), y: FQ.y + 70, w: bw, h: 64 };
};
const aFenetreQ = T => Math.max(cloche(T, Q1.de, Q1.de + .3, S.reexplique, S.reexplique + .3), cloche(T, Q3B.de - .05, Q3B.de + .25, S.p18, S.p18 + .4));

// la vie : la lueur (index.html : fouleLueur), et ses intervalles (bras au ciel, halos, petits bonds)
const VIES = Object.freeze([[S.lueur, S.remet1, 1], [Q1.rep + .15, Q2.de, .55], [Q2.rep + .15, Q3.de, .55], [Q4.rep + .1, S.p18 + .25, .55]]);
const lueurVie = T => Math.max(0, ...VIES.map(([a, b]) => seg(T, a, a + .6) * (1 - seg(T, b, b + 1))));
const clair = T => Math.max(0, ...VIES.map(([a, b, k]) => k * seg(T, a, a + .8) * (1 - seg(T, b, b + 1.2))));
const chaud = T => Math.max(cloche(T, S.meurent, S.meurent + 1.2, S.remet2, S.remet2 + .8), cloche(T, S.meurt, S.meurt + 1.2, S.p17, S.p17 + 1.5),
  .6 * cloche(T, Q3.rep, Q3.rep + .5, S.reexplique, S.reexplique + .6), .6 * cloche(T, Q3B.rep, Q3B.rep + .5, Q4.de, Q4.de + .6));

// ================================================================ les cent premiers participants, en dates
// Pour chacun : son arrivée (ta), ses couleurs ([t, col, saut]), ses morts ({ td, d, tr, dr } : partir en caractères à
// td en d secondes ; se recomposer à tr en dr secondes, la dissolution jouée à l'envers), ses peurs ([de, à]), ses
// coches (P18). Les couleurs et les morts d'index.html : fouleChoisit (la vague), fouleRemet, fouleTue.
const D2 = 2.4, D3 = 2.0;
const SUJETS = Object.freeze(PREMIERS.map(f => {
  const i = f.i, ord = RANG[i], abst = i === ABSTIENT;
  const coul = [], morts = [], peurs = [];
  const choisit = (t0, lot, pas, sauf = false) => { if (!sauf) coul.push([t0 + .3 + ord * pas, LOTS[lot].has(i) ? BLEU : ROUGE, true]); };
  const remet = t => coul.push([t, GRIS_FIG, false]);
  const ta = S.montre + f.r1 * 1.2;
  // P14 : b62, puis P15 : fouleRemet, b40, les bleus meurent
  choisit(S.choix1, 'b62', .022);
  remet(S.remet1 + f.r3 * .4);
  choisit(S.choix2, 'b40', .022);
  const bleu2 = LOTS.b40.has(i);
  if (bleu2) {
    peurs.push([S.meurent - .05 + f.r1 * .25, Infinity]);
    morts.push({ td: S.meurent + .8 + f.r2 * 1.4, d: D2, tr: S.remet2 + f.r1 * .4, dr: .9 });
  }
  // P16 : fouleRemet (les morts redescendent, gris), puis b62 sauf celui qui ne prend rien, puis tout le monde meurt
  const tr2 = bleu2 ? morts[0].tr : S.remet2 + f.r3 * .3;
  remet(tr2);
  const tc3 = Math.max(S.choix3 + .15 + ord * .005, (bleu2 ? tr2 + .9 : tr2) + .25) - .3;
  if (!abst) choisit(tc3, 'b62', 0);
  peurs.push([S.meurt - .12 + f.r1 * .1, Infinity]);
  const td2 = bleu2 ? morts[0].td : null, td3 = S.meurt + .35 + f.r2 * 1.0;
  morts.push({ td: td3, d: D3, tr: S.p17 + f.r1 * .35, dr: .9 });
  remet(S.p17 + f.r1 * .35);
  // P17 : les questions, chacune avec sa petite simulation
  for (const P of POSEES) {
    if (P !== Q1) {
      const mort = morts[morts.length - 1];
      if (mort.tr === Infinity) { mort.tr = P.de + f.r1 * .05; remet(mort.tr); }   // ils redescendent
      else remet(Math.min(P.de + f.r3 * .2, P.choix - .12));   // (toujours avant son saut)
    }
    choisit(P.choix - .3, P.Q.lot, P.pas);
    const bleu = LOTS[P.Q.lot].has(i);
    if (P.Q.issue === 'mort' && bleu) {
      if (P.juste) {          // la règle s'applique : les bleus partent (vite)
        peurs.push([P.rep + .05 + f.r1 * .1, Infinity]);
        morts.push({ td: P.rep + .1 + f.r2 * .1, d: .6, tr: Infinity, dr: .3 });
      } else peurs.push([P.rep + .1 + f.r1 * .15, S.reexplique + .2]);   // la réponse fausse : la peur, et Phi réexplique
    }
    if (P === Q3) remet(S.reexplique + .2 + f.r3 * .25);
  }
  remet(S.p18 + .25 + f.r3 * .3);
  coul.sort((a, b) => a[0] - b[0]);
  // les fins des peurs : quand on redescend de la mort qui suit (la peur dure jusqu'à la dissolution, qui la prend)
  for (const p of peurs) if (p[1] === Infinity) { const m = morts.find(m => m.tr > p[0]); p[1] = m ? m.tr : p[0] + 2; }
  // P18 : la coche (verifs d'index.html), la correction des huit MAUVAIS, les têtes qui se tournent
  const tck = S.verif + .5 + ord * .025, mauvais = MAUVAIS.has(i), tfix = mauvais ? S.corr + .4 + f.r3 * .9 : -Infinity;
  const tw = S.savait + (f.cx - 175) / 950 * 1.0 + hache(i * 5 + 3) * .15;
  return Object.freeze({ f, i, ord, abst, ta, td2, td3, coul: Object.freeze(coul), morts: Object.freeze(morts.map(m => Object.freeze(m))), peurs: Object.freeze(peurs), tck, mauvais, tfix, tw });
}));

// la couleur à l'instant T (on part en caractères dans sa couleur ; on revient gris)
function couleur(s, T) {
  let c = GRIS_FIG;
  for (const [t, col] of s.coul) { if (t > T) break; c = col; }
  return c;
}
// le dernier saut commencé (son instant), s'il est en cours
function saut(s, T) {
  let t0 = null;
  for (const [t, , sa] of s.coul) { if (t - .2 > T) break; if (sa && T < t + .45) t0 = t; }
  return t0;
}
// la dissolution : 0 entier, 1 parti ; à l'envers pendant qu'il se recompose
function dissolution(s, T) {
  for (const m of s.morts) {
    if (T < m.td || T >= m.tr + m.dr) continue;
    if (T < m.tr) return seg(T, m.td, m.td + m.d);
    return seg(m.tr, m.td, m.td + m.d) * (1 - eIO(seg(T, m.tr, m.tr + m.dr)));
  }
  return 0;
}
const recompose = (s, T) => s.morts.some(m => T >= m.tr && T < m.tr + m.dr);
const aPeur = (s, T) => s.peurs.some(([a, b]) => T >= a && T < b);
const rienFait = (s, T) => s.abst && T >= S.abst && T < S.p17 + .5;
const echelle = (s, T) => eBack(seg(T, s.ta, s.ta + .45));
const visible = (s, T) => T > s.ta + .3 && dissolution(s, T) < .3;
// les participants bleus et rouges de la démonstration, comptés (la jauge d'index.html)
function compte(T) {
  let nb = 0, nr = 0;
  for (const s of SUJETS) { if (T < s.ta) continue; const c = couleur(s, T); if (c === BLEU) nb++; else if (c === ROUGE) nr++; }
  return { nb, nr };
}

// ================================================================ la caméra du lot
// [t, wx, wy, sx, sy, z] : « le point (wx, wy) du monde en (sx, sy) à ×z » (le zoom en échelle logarithmique). Le monde
// est la composition d'index.html (×1). Deux poussées, celles de fouleCamera d'index.html : le N°48 (525, 484) amené en
// (650, 470) à ×4,2 (P12), puis celui qui ne prend rien (ABSTIENT : 775, 484), le même cadre (P16).
const F48 = PREMIERS[N48], FAB = PREMIERS[ABSTIENT];
const CAM = [
  [LOT.de, F48.cx, F48.cy, F48.cx, F48.cy, 1],
  [S.prive, F48.cx, F48.cy, F48.cx, F48.cy, 1],
  [S.prive + 1.6, F48.cx, F48.cy, 650, 470, 4.2],
  [S.recul, F48.cx, F48.cy, 650, 470, 4.2],
  [S.recul + 1.2, F48.cx, F48.cy, F48.cx, F48.cy, 1],
  [S.recul + 1.2, FAB.cx, FAB.cy, FAB.cx, FAB.cy, 1],      // (la même image, un autre point fixe)
  [S.rien, FAB.cx, FAB.cy, FAB.cx, FAB.cy, 1],
  [S.rien + .95, FAB.cx, FAB.cy, 650, 470, 4.2],
  [S.meurt, FAB.cx, FAB.cy, 650, 470, 4.2],
  [S.meurt + .9, FAB.cx, FAB.cy, FAB.cx, FAB.cy, 1],
];
function camLot(T) {
  let i = 0;
  while (i < CAM.length - 1 && T > CAM[i + 1][0]) i++;
  const A = CAM[i], B = CAM[Math.min(i + 1, CAM.length - 1)];
  const k = B[0] === A[0] || T <= A[0] ? (T >= B[0] ? 1 : 0) : eIO(clamp((T - A[0]) / (B[0] - A[0])));
  // la secousse de « tout le monde meurt » (avec celle de l'œil) : 3 px qui s'éteignent en 0,6 s (film-pilules, regles.js)
  const q = T - (S.meurt + .05), sh = q >= 0 && q < .6 ? Math.sin(q * 46) * 3 * (1 - q / .6) : 0;
  return cadre(lerp(A[1], B[1], k), lerp(A[2], B[2], k), lerp(A[3], B[3], k) + sh, lerp(A[4], B[4], k) + sh * .4,
    Math.exp(lerp(Math.log(A[5]), Math.log(B[5]), k)));
}
// l'isoloir : 1 à ×4,2, 0 à ×1 (index.html : k, le progrès du zoom)
const isoDe = z => clamp(Math.log(z) / Math.log(4.2));
// qui est dans l'isoloir : le N°48 jusqu'au recul de P13, puis celui qui ne prend rien
const focus = T => (T < S.recul + 1.2 ? F48 : FAB);
const prive = T => T >= S.prive && T < S.recul + 1.2;

// ================================================================ le terminal d'index.html (TERM, prepareTerminal)
// IBM Plex Mono 34 px (une chasse de 0,6 em : 20,4 px), une ligne toutes les 54 px, 24 caractères par seconde ; à
// « je résume », chaque caractère s'envole et dérive en virant au LABO, puis rejoint l'une des deux pilules qui se
// forment (sa couleur), et s'y fond. Le terminal est posé SOUS l'œil, en (110, 420) : à sa place d'index.html (110,
// 160), sa deuxième ligne passerait dans l'œil de Phi, qui est déjà là (index.html l'allumait après le terminal).
const TERM = Object.freeze([
  { t0: S.term[0], txt: '> charger test_01.pilules', c: CRAIE },
  { t0: S.term[1], txt: '  sujets : 100 · choix simultanés', c: GRIS },
  { t0: S.term[2], txt: '  rendu : constellation', c: GRIS },
]);
const TX = 110, TY = 420, TLH = 54, CW = 34 * .6, CPS_T = 24;
const finTerm = TERM[2].t0 + [...TERM[2].txt].length / CPS_T;
const CARS_TERM = (() => {
  const R = rng(7), out = [];
  TERM.forEach((l, li) => [...l.txt].forEach((ch, i) => {
    if (ch === ' ') return;
    const k = out.length, j = hache(k * 7 + 1) < .5 ? 0 : 1, P = PILULES[j].pts[Math.floor(hache(k * 13 + 5) * PILULES[j].pts.length)];
    out.push({
      ch, c: l.c, x: TX + i * CW, y: TY + li * TLH, t: l.t0 + i / CPS_T, td: S.resume + R() * .9, a: R() * Math.PI * 2, d: 90 + R() * 240, g: G[Math.floor(R() * G.length)],
      j, tv: (j ? S.rouge : S.bleue) + .1 + hache(k * 3 + 2) * .7, lx: P.lx, ly: P.ly,
    });
  }));
  return Object.freeze(out);
})();
// la place d'un point de la pilule j (comme pilule() de commun.js : l'angle, l'échelle)
const dansPilule = (j, lx, ly, p) => {
  const a = PILULES[j].ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  return { x: p.x + p.ps * (lx * ca - ly * sa), y: p.y + p.ps * (lx * sa + ly * ca) };
};
// O : l'œil de Phi ; les caractères qui s'envolent s'effacent en l'approchant, jamais dans son iris (à « je résume », ils
// le traversaient : window.film.sousOeil() le voit)
function terminalTest(ctx, T, O) {
  if (T > S.rouge + 2.2) return;
  ctx.font = `34px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  for (const c of CARS_TERM) {
    if (T < c.t) continue;
    const k = seg(T, c.td, c.td + 1.3), e = eOut(k);
    let x = c.x + Math.cos(c.a) * c.d * e, y = c.y + Math.sin(c.a) * c.d * e - 40 * e, al = 1 - .45 * k, col = k > 0 ? mix(c.c, LABO, Math.min(1, k * 2)) : c.c;
    if (k >= 1) {            // il flotte, puis rejoint sa pilule et s'y fond
      x += Math.sin(T * 1.7 + c.a * 3) * 6; y += Math.cos(T * 1.3 + c.a * 5) * 5;
      const u = eIO(seg(T, c.tv, c.tv + 1.1));
      if (u >= 1) continue;
      const p = dansPilule(c.j, c.lx, c.ly, posePilule(c.j, T));
      x = lerp(x, p.x, u); y = lerp(y, p.y, u); al = .55 * (1 - u * u); col = mix(LABO, PILULES[c.j].col, u);
    }
    if (O) al *= seg(Math.hypot(x - O.x, y - O.y) / O.s, .5, .8);
    if (al <= .01) continue;
    ctx.globalAlpha = al; ctx.fillStyle = col;
    ctx.fillText(k > .12 ? c.g : c.ch, x, y);
  }
  // le curseur bloc LABO : au bout de ce qui s'écrit, puis il clignote jusqu'à l'envol
  if (T >= S.term[0] && T < S.resume) {
    let li = 0; for (let j = 0; j < TERM.length; j++) if (T >= TERM[j].t0) li = j;
    const L = TERM[li], n = clamp(Math.floor((T - L.t0) * CPS_T) + 1, 0, [...L.txt].length), ecrit = n < [...L.txt].length;
    if (ecrit || Math.floor(T * 2.4) % 2 === 0) { ctx.globalAlpha = 1; ctx.fillStyle = LABO; ctx.fillRect(TX + n * CW + 6, TY + li * TLH - 18, CW * .9, 36); }
  }
  ctx.globalAlpha = 1;
}
const plumeTerm = T => {
  if (T < S.term[0] || T > finTerm) return null;
  let li = 0; for (let j = 0; j < TERM.length; j++) if (T >= TERM[j].t0) li = j;
  const n = clamp(Math.floor((T - TERM[li].t0) * CPS_T) + 1, 0, [...TERM[li].txt].length);
  return point(TX + n * CW, TY + li * TLH);
};

// ================================================================ les pilules (index.html : POSES, pilulesVers)
// la bleue en (380, 450), la rouge en (920, 450), ps 0,8 ; sur « Vous êtes cent », elles filent en icônes au-dessus de la
// foule ((400, 196) et (900, 196), ps 0,3 : POSES.icones), où elles restent (comme dans le test)
function posePilule(i, T) {
  const k = eIO(seg(T, S.cent, S.cent + 1.3)), [x0, y0, p0] = POSES.choix[i], [x1, y1, p1] = POSES.icones[i];
  return { x: lerp(x0, x1, k), y: lerp(y0, y1, k), ps: lerp(p0, p1, k) };
}
// (pendant les poussées dans l'isoloir, les icônes s'effacent : elles flotteraient sur les sujets agrandis)
function pilules(ctx, T, cam) {
  const a = 1 - seg(isoDe(cam.z), .05, .4); if (a <= .01) return;
  [[0, S.bleue], [1, S.rouge]].forEach(([i, t0]) => {
    const p = posePilule(i, T);
    pilule(ctx, T, i, { x: p.x, y: p.y, ps: p.ps, t0, lab: t0 + 1.6, a });
  });
}

// ================================================================ RÈGLES et la graine « A » (commun.js : fenetreRegles)
const TREGLE = Object.freeze([S.r0, S.r1, S.r2, S.r3, S.r4]);
const LISTE_REGLES = Object.freeze(TREGLE.map((t, i) => Object.freeze({ i, t })));
// ses pulsations (st.pulse d'index.html) : « formulation possible », « réexpliquais », « compris la règle »
const PULSES = Object.freeze([S.formulation, S.reexplique, S.corr]);
const pulseA = T => { let p = null; for (const t of PULSES) if (T >= t) p = t; return p; };
const puRegles = T => { const p = pulseA(T); return p === null ? 0 : seg(T, p, p + .3) * (1 - seg(T, p + 1.6, p + 2.4)); };
// l'étiquette « A » : α 0,4 ; un cran (0,8) sur « formulation possible », 0,6 s ; elle pulse un peu avec la fenêtre
// quand Phi réexplique (P17) et corrige (P18). On ne la commente jamais.
const aEtiquette = T => {
  const cran = .4 * cloche(T, S.formulation, S.formulation + .15, S.formulation + .35, S.formulation + .6);
  const avec = pulseA(T) !== null && pulseA(T) !== S.formulation ? .2 * puRegles(T) : 0;
  return .4 + Math.max(cran, avec);
};
const RX = REGLES_FEN.x, RY = REGLES_FEN.y, RW = REGLES_FEN.w;
const ETIQUETTE_A = point(RX + RW - 36 + 11, RY + 14 + 11);
const yRegle = i => { let y = 92; for (let j = 0; j < i; j++) y += REGLES[j].length * REGLES_FEN.lh + REGLES_FEN.gap; return y; };
// où s'écrit la règle i (la plume de fenetreRegles), pour que Phi la suive
const plumeRegle = i => T => {
  const n = clamp(Math.floor((T - TREGLE[i]) * REGLES_FEN.cps), 0, 120);
  let m = n;
  for (const [li, l] of REGLES[i].entries()) { const L = l.reduce((a, s) => a + [...s.s].length, 0); if (m < L) return point(RX + 24 + m * 12.6, RY + yRegle(i) + li * REGLES_FEN.lh - 8); m -= L; }
  return point(RX + 200, RY + yRegle(i));
};
function regles(ctx, T) {
  if (T < S.r0 - .4) return;
  fenetreRegles(ctx, T, LISTE_REGLES, { a: seg(T, S.r0 - .4, S.r0 - .1), pulse: pulseA(T), etiquette: { a: aEtiquette(T) } });
}

// ================================================================ l'œil de Phi : sa place, son humeur, son regard
// ses places d'index.html : (650, 240, 220) avec les pilules ; (650, 160, 160) au-dessus de la foule ; (1 110, 300, 150)
// à côté de l'isoloir (fouleCamera, pour le N°48 comme pour celui qui ne prend rien : au-dessus de lui, l'œil couvrirait
// son voisin agrandi)
const OEIL = [
  [LOT.de, { x: 650, y: 240, s: 220 }],
  [S.cent, { x: 650, y: 240, s: 220 }],
  [S.cent + .8, { x: 650, y: 160, s: 160 }],
  [S.prive, { x: 650, y: 160, s: 160 }],
  [S.prive + 1.4, { x: 1110, y: 300, s: 150 }],
  [S.recul, { x: 1110, y: 300, s: 150 }],
  [S.recul + 1.2, { x: 650, y: 160, s: 160 }],
  [S.rien, { x: 650, y: 160, s: 160 }],
  [S.rien + .95, { x: 1110, y: 300, s: 150 }],
  [S.meurt, { x: 1110, y: 300, s: 150 }],
  [S.meurt + 1.0, { x: 650, y: 160, s: 160 }],
];
const HUMEURS_LOT = Object.freeze([
  [S.concerter, 'bas'], [S.recul, 'neutre'],
  [S.lueur, 'grand'], [S.remet1, 'neutre'], [S.choix2 + .05, 'doute'], [S.meurent - .05, 'plisse'],
  [S.remet2, 'neutre'], [S.seule, 'doute'], [S.meurt - .05, 'plisse'],
  [S.p17, 'curieux'], [S.p17 + 1.4, 'neutre'],
  [Q1.rep, 'grand', .25], [Q1.rep + 1.2, 'neutre'], [Q2.rep, 'grand', .25], [Q2.rep + 1.0, 'neutre'],
  [Q3.rep, 'plisse', .25], [S.reexplique, 'neutre'], [Q3B.rep, 'grand', .25], [Q3B.rep + .5, 'neutre'], [Q4.rep, 'grand', .25],
  [S.p18, 'bas'], [S.corr, 'neutre'], [S.tampon, 'grand', .3],
]);

// les points que l'on regarde (à l'écran, sous la caméra du moment)
const ecran = (x, y, T) => camLot(T).ecran(x, y);
const visage = (s, T) => ecran(s.f.cx, s.f.cy - 12, T);
const dernier = (quand, duree = Infinity) => T => {
  let best = null, bt = -Infinity;
  for (const s of SUJETS) { const q = quand(s); if (q !== null && q !== undefined && q <= T && T < q + duree && q > bt) { bt = q; best = s; } }
  return best && visage(best, T);
};
const parmi = (ok, P = .55) => T => {
  const i0 = Math.floor(hache(Math.floor(T / P) * 97 + 3) * 100);
  for (let j = 0; j < 100; j++) { const s = SUJETS[(i0 + j * 37) % 100]; if (visible(s, T) && ok(s, T)) return visage(s, T); }
  return null;
};
const pil = i => T => { const p = posePilule(i, T); return point(p.x, p.y); };
const jaugeC = T => { const { nb, nr } = compte(T); return point(150 + 10 * (nb + (100 - nb - nr) / 2), 699); };
const tcDe = (s, P) => { for (const [t, , sa] of s.coul) if (sa && t >= P.choix && t < P.choix + 2) return t; return null; };
const texteQuestion = point(FQ.x + 520, FQ.y + 34);
const centreBouton = (P) => { const b = BOUTON(P.Q.opts.length, P.sel); return point(b.x + b.w / 2, b.y + b.h / 2); };
const fenetreR = point(RX + RW / 2, RY + 180);
const SUJET_48 = SUJETS[N48], SUJET_AB = SUJETS[ABSTIENT];

let REGARD = null;
function regard() {
  if (REGARD) return REGARD;
  const cibles = [
    // P09 : la plume du terminal ; vous dès « Pour ceux qui n'ont pas joué »
    [LOT.de, S.pourCeux - LOT.de, plumeTerm, .15], [S.pourCeux, S.bleue - S.pourCeux, VOUS],
    // P10 : la bleue qui se forme, la rouge, vous, la règle qui s'écrit, vous
    [S.bleue + .2, .95, pil(0)], [S.rouge + .2, .95, pil(1)], [S.participant, S.r0 - S.participant, VOUS],
    [S.r0, .55, plumeRegle(0), .15], [S.r0 + .55, 1.4, VOUS],
    // P11 : les pilules qui filent, la foule qui arrive (le dernier arrivé), puis vous
    [S.cent, .35, pil(0)], [S.montre + .1, 1.5, dernier(s => s.ta, 1)], [S.montre + 1.6, S.prive - S.montre - 1.6, VOUS],
    // P12 : le N°48, qui lui rend son regard
    [S.prive, S.recul - S.prive, T => visage(SUJET_48, T), .4],
    // P13 : vous ; une seule saccade vers l'étiquette « A » (0,3 s), sur « possible » ; vous
    [S.recul, S.possible - S.recul, VOUS], [S.possible, .3, ETIQUETTE_A], [S.possible + .3, S.jauge - S.possible - .3, VOUS],
    // P14 : la vague (le dernier qui saute), la jauge au passage du trait, les bras levés, la règle
    [S.choix1 + .3, S.seuil - S.choix1 - .4, dernier(s => tcDe(s, { choix: S.choix1 }), .5)], [S.seuil - .1, .6, jaugeC],
    [S.seuil + .5, S.lueur - S.seuil - .5, dernier(s => tcDe(s, { choix: S.choix1 }), .5)],
    [S.lueur, 1.1, parmi((s, T) => couleur(s, T) !== GRIS_FIG)], [S.r2, .7, plumeRegle(2), .2], [S.r2 + .7, 1.3, VOUS],
    // P15 : la vague de b40, la jauge, les bleus qui partent jusqu'au dernier, puis la règle qui s'écrit
    [S.choix2 + .3, 2.2, dernier(s => tcDe(s, { choix: S.choix2 }), .5)], [S.choix2 + 2.5, .5, jaugeC],
    [S.meurent - .05, .8, parmi(s => LOTS.b40.has(s.i))], [S.meurent + .8, S.r3 - S.meurent - .8, dernier(s => s.td2, 2.2)],
    [S.r3, .8, plumeRegle(3), .2], [S.r3 + .8, S.remet2 - S.r3 - .8, dernier(s => s.td2, 2.6)],
    // P16 : les caractères qui redescendent ; le tampon ; celui qui n'a pas sauté (il l'emporte sur tout) ; la foule
    // qui part, jusqu'au dernier
    [S.remet2 + .1, 1.2, parmi(s => LOTS.b40.has(s.i))], [S.oblig + .05, 1.4, point(650, 540)],
    [S.choix3 + .2, .4, dernier(s => tcDe(s, { choix: S.choix3 + .1 }), .5)],
    [S.abst + .3, S.meurt + .9 - S.abst - .3, T => visage(SUJET_AB, T), .3],
    [S.meurt + .9, 2.2, dernier(s => s.td3, 2)], [S.r4 + .2, .6, plumeRegle(4), .2],
    [S.meurt + 3.1, S.p17 - S.meurt - 3.1, VOUS],
    // P17 : la foule qui se recompose ; pour chaque question : la question, la réponse choisie, ce qu'elle fait à la
    // foule ; RÈGLES pendant la réexplication
    [S.p17, .6, parmi(() => true)],
    ...POSEES.flatMap(P => [
      [P.de + .05, .55, texteQuestion], [P.choix + .2, P.tsel - .32 - P.choix, dernier(s => tcDe(s, P), .5)], [P.tsel - .12, .55, centreBouton(P)],
      [P.rep + .3, Math.min(1.0, P.a - P.rep - .3), parmi((s, T) => couleur(s, T) !== GRIS_FIG)],
    ]),
    [S.reexplique, 1.6, fenetreR, .4],
    // P18 : celui qu'il mesure ; RÈGLES ; les corrigés ; les têtes qui se tournent ; le tampon ; vous sur « aussi »
    [S.verif + .3, 2.6, dernier(s => s.tck - .3, .3), .25], [S.corr - .05, .4, fenetreR],
    [S.corr + .35, 1.6, dernier(s => (s.mauvais ? s.tfix : null), 1.5), .2],
    [S.savait, 2.0, dernier(s => s.tw, .5), .3], [S.savait + 2.0, S.tampon - S.savait - 2.0, VOUS],
    [S.tampon + .05, S.aussi - S.tampon + .1, point(650, 540)], [S.aussi + .15, 10, VOUS],
  ];
  return (REGARD = creeRegard({
    cibles: cibles.map(([t, d, c, p]) => [t, Math.max(0, d), c, p]).filter(c => c[1] > 0),
    repos: [[3, VOUS], [2, T => plumeBoite(T)], [1.5, T => (T > S.montre + 1.4 ? parmi(() => true, 1.15)(T) : null)]],
  }));
}
// l'état de l'œil à l'instant T (avant le monde : les sujets lui rendent son regard)
function etatOeil(T, cam) {
  const P = cles(T, OEIL), h = humeur(T, HUMEURS_LOT), y = P.y + flotte(T, 4);
  const g = regard().pupille(T, P.x, y, h.r);
  const ouvert = cligne(T) > .5;
  const w = g.pose ? { ...cam.monde(g.pose.x, g.pose.y), t: g.pose.t } : null;
  return { T, x: P.x, y: P.y, s: P.s, h, g, phiW: cam.monde(P.x, y), pose: { w, ouvert } };
}

// ================================================================ l'état d'un participant, pour dessineSujet
// (l'ordre des cas est celui d'index.html : etatSujet)
const DIAG = Object.freeze([[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 1]]);   // « ailleurs » : jamais vers un voisin
function etatSujet(s, T, O, cam) {
  const f = s.f, col = couleur(s, T), dis = dissolution(s, T), moi = s.i === N48;
  const e = { col, a: col === GRIS_FIG ? .82 : 1, dis, mode: 'repos', phi: O.phiW, cible: O.phiW, fixe: false, reflet: O.pose.ouvert };
  if (dis > 0) {
    if (recompose(s, T)) { e.p = { bob: 0, yx: 0, yy: 0, goutte: 0 }; return e; }   // il redescend, debout
    e.mode = rienFait(s, T) ? 'rien' : 'peur';                                    // on part dans la pose où la sentence nous a pris
    return e;
  }
  // les morts qui reviennent, gris (index.html : fa · seg(T, tr, tr + .8))
  for (const m of s.morts) if (T >= m.tr + m.dr && T < m.tr + m.dr + .3) e.a *= lerp(.75, 1, seg(T, m.tr + m.dr, m.tr + m.dr + .3));
  const vu = O.pose.w ? Math.hypot(f.cx - O.pose.w.x, f.cy - 12 - O.pose.w.y) : Infinity;
  e.fixe = (T > s.ta + .45 && T < s.ta + 1.6)                                    // en arrivant, on lève les yeux vers Phi
    || (vu < 60 && T > O.pose.w.t + .15 + vu / 160)                              // Phi le fixe : il lui rend son regard
    || (T > S.lueur + .3 && T < S.lueur + 2 && col !== GRIS_FIG);                // la vie : vers Phi
  const t0 = saut(s, T);
  if (t0 !== null) { e.mode = 'saut'; e.t0 = t0; return e; }
  const lu = lueurVie(T);
  if (lu > 0 && col !== GRIS_FIG) { e.mode = 'vie'; e.k = lu; return e; }
  if (rienFait(s, T)) { e.mode = 'rien'; return e; }
  if (aPeur(s, T)) { e.mode = 'peur'; return e; }
  // P18 : les huit qui se sont trompés regardent leurs pieds, jusqu'à leur correction ; puis ils relèvent la tête
  if (s.mauvais && T >= s.tck && T < s.tfix) { e.mode = 'penaud'; return e; }
  if (s.mauvais && T >= s.tfix && T < s.tfix + 1.2) { e.fixe = true; return e; }
  // P18 : « et chacun savait » : la tête se tourne vers le ✓ du voisin de gauche, puis de droite, puis vers Phi
  if (T >= s.tw) {
    if (T < s.tw + .45) e.p = { yx: -1, yy: -1 };
    else if (T < s.tw + .9) e.p = { yx: 1, yy: -1 };
    else e.fixe = true;
    return e;
  }
  // P12 : en choix privé, on lorgne vers le N°48, sans rien savoir ; lui cherche les autres des yeux, d'une paroi à
  // l'autre (index.html : ±900 px, toutes les 1,1 s) ; sur « personne ne connaît », il rend son regard à Phi
  if (prive(T) && isoDe(cam.z) > .2) {
    if (moi) {
      if (T >= S.connait + .1 && T < S.connait + 1.3) { e.fixe = true; e.reflet = O.pose.ouvert; return e; }
      e.mode = 'prive'; e.cible = { x: f.cx + (Math.floor((T - S.prive) / 1.1) % 2 ? 900 : -900), y: f.cy };
      return e;
    }
    e.mode = 'prive'; e.cible = { x: F48.cx, y: F48.cy }; return e;
  }
  // P15 : les rouges restent debout, immobiles (pas de joie)
  if (col === ROUGE && T >= S.meurent && T < S.remet2) { e.p = { bob: 0, yx: 0, yy: 0 }; return e; }
  // P11 : les cent clignent ensemble, une fois ; puis chacun regarde ailleurs (jamais son voisin)
  if (T >= S.cligne && T < S.cligne + .16) { e.yeux = 'f'; return e; }
  const ta = S.concerter + hache(s.i * 3 + 1) * .35;
  if (T >= ta && T < S.prive) {
    const n = Math.floor((T - ta) / 1.6), d = DIAG[Math.floor(hache(s.i * 29 + n * 7 + 3) * DIAG.length)];
    e.p = { yx: d[0], yy: d[1] }; e.fixe = false; return e;
  }
  return e;
}

// ================================================================ le décor et ses éléments
const aJauge = T => seg(T, S.jauge, S.jauge + .5) * (1 - seg(T, S.remet2, S.remet2 + .5));
function laJauge(ctx, T) {
  const a = aJauge(T);
  if (a > .01) { const { nb, nr } = compte(T); jauge(ctx, { bleue: nb, rouge: nr, a, etiquette: 'EXEMPLE' }); }   // la démonstration : ce ne sont pas des résultats
  // P16 (celui qui ne prend rien, puis tout le monde meurt) est encore une démonstration : sans la jauge, l'étiquette
  // reste à sa place, seule, jusqu'à ce que la foule se recompose pour le test de compréhension
  const e = cloche(T, S.remet2, S.remet2 + .3, S.p17, S.p17 + .4) * (1 - a);
  if (e > .01) { ctx.globalAlpha = e; ctx.font = `500 16px ${MONO}`; ctx.fillStyle = GRIS; ctx.textBaseline = 'alphabetic'; espace(ctx, 'EXEMPLE', 130, 705, 3, 'right'); ctx.globalAlpha = 1; }
}
// un cadenas en pixels (film-pilules/plans/isoloir.js, cadenas) : posé sur (x, y bas), u la taille d'une case
function cadenas(ctx, x, y, u, col = LABO) {
  ctx.fillStyle = col;
  ctx.fillRect(x - 3.5 * u, y - 5 * u, 7 * u, 5 * u);
  ctx.fillRect(x - 2.5 * u, y - 8 * u, u, 3 * u); ctx.fillRect(x + 1.5 * u, y - 8 * u, u, 3 * u);
  ctx.fillRect(x - 1.5 * u, y - 9 * u, 3 * u, u);
  ctx.fillStyle = '#0c0b0d'; ctx.fillRect(x - .5 * u, y - 3.8 * u, u, 1.6 * u);
}
// les parois de l'isoloir (film-pilules/plans/isoloir.js, parois : les mesures d'index.html à ×4,2, ramenées au monde)
function parois(ctx, F, a) {
  const u = 1 / 4.2;
  ctx.globalAlpha = a;
  for (const sx of [-1, 1]) {
    const x = F.cx + sx * 125 * u;
    ctx.fillStyle = 'rgba(241,233,220,.07)'; ctx.fillRect(sx < 0 ? x - 26 * u : x, F.cy - 150 * u, 26 * u, 300 * u);
    ctx.strokeStyle = 'rgba(241,233,220,.55)'; ctx.lineWidth = 2 * u; ctx.strokeRect(sx < 0 ? x - 26 * u : x, F.cy - 150 * u, 26 * u, 300 * u);
  }
  ctx.strokeStyle = 'rgba(241,233,220,.35)'; ctx.lineWidth = 2 * u;
  ctx.beginPath(); ctx.moveTo(F.cx - 151 * u, F.cy + 150 * u); ctx.lineTo(F.cx + 151 * u, F.cy + 150 * u); ctx.stroke();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- la foule (sous la caméra), et ce qui flotte au-dessus des têtes
function foule(ctx, T, O, cam) {
  if (T < S.montre) return;
  const z = cam.z, iso = isoDe(z), F = focus(T);
  const vu0 = cam.monde(-60, -80), vu1 = cam.monde(W + 60, 900);
  const signes = [];                                   // ✓ ✗ ? Ø : à l'écran, en tailles entières (après la foule)
  ctx.save(); cam.applique(ctx);
  // l'isoloir du N°48 (P12) : ses parois, dans le monde
  const aParois = prive(T) ? seg(iso, .6, 1) : 0;
  if (aParois > 0) parois(ctx, F48, aParois);
  for (const s of SUJETS) {
    const f = s.f;
    if (f.cx < vu0.x || f.cx > vu1.x || f.cy < vu0.y || f.cy > vu1.y) continue;
    const sc = echelle(s, T); if (sc <= .01) continue;
    const e = etatSujet(s, T, O, cam);
    if (e.dis >= 1) continue;
    dessineSujet(ctx, f, f.cx, f.cy, 4 * sc, e, T);
    // P12 : un « ? » au-dessus de chaque voisin (ils pulsent l'un après l'autre sur « personne ne connaît ») ; le
    // cadenas LABO au-dessus du N°48
    if (aParois > 0 && e.dis === 0) {
      // (pas pour celui de dessous : sa marque tomberait dans l'isoloir)
      if (s.i !== N48) {
        const tq = S.connait + Math.hypot(f.cx - F48.cx, f.cy - F48.cy) / 650 * .9, pu = 1 + .45 * cloche(T, tq, tq + .1, tq + .2, tq + .45);
        if (!(Math.abs(f.cx - F48.cx) < 30 && f.cy > F48.cy)) signes.push({ ch: '?', x: f.cx, y: f.cy - 31, px: 14 * z * pu, col: GRIS, a: seg(iso, .2, .8) });
      } else { ctx.globalAlpha = aParois; cadenas(ctx, f.cx, f.cy - 28, 1); }
    }
    // P18 : Phi mesure (le trait LABO de la tête aux pieds), puis la coche au-dessus de la tête (verifs d'index.html)
    if (T >= s.tck - .3 && e.dis === 0) {
      if (T < s.tck) { ctx.globalAlpha = .85; ctx.fillStyle = LABO; ctx.fillRect(f.cx - 24, f.cy - 26 + 52 * seg(T, s.tck - .3, s.tck), 48, 2); }
      else {
        const k = eBack(seg(T, s.tck, s.tck + .35)), faux = s.mauvais && T < s.tfix, fl = s.mauvais && T >= s.tfix ? 1 - seg(T, s.tfix, s.tfix + .5) : 0;
        // « et chacun savait » : quand la vague des regards passe, chaque ✓ s'allume un instant (on le voit, on est vu)
        const vu = cloche(T, s.tw + .05, s.tw + .2, s.tw + .5, s.tw + .9), g = Math.max(fl, .7 * vu);
        signes.push({ ch: faux ? '✗' : '✓', x: f.cx, y: f.cy - 31, px: 18 * k + 6 * g, col: faux ? ROUGE_TXT : mix(LABO, CRAIE, g), a: clamp(k) });
      }
    }
  }
  ctx.restore();
  // celui qui ne prend rien (P16) : cerclé de craie (un cercle exact, 2 px), un Ø au-dessus de la tête, sur une pastille
  // (pour qu'on le lise par-dessus le voisin du dessus)
  if (T >= S.marque && dissolution(SUJET_AB, T) === 0 && T < S.p17) {
    const k = eOut(seg(T, S.marque, S.marque + .25)), pu = .5 + .5 * Math.sin(T * 6), c = cam.ecran(FAB.cx, FAB.cy), o = cam.ecran(FAB.cx, FAB.cy - 47);
    ctx.globalAlpha = k; ctx.strokeStyle = CRAIE; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(c.x, c.y, (lerp(46, 30, k) + 4 * pu) * z, 0, Math.PI * 2); ctx.stroke();
    const r = 14 * Math.min(z, 2.4);
    ctx.fillStyle = FOND_FENETRE; ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = `${Math.round(22 * Math.min(z, 2.4))}px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Ø', o.x, o.y + 1);
  }
  // les signes, à l'écran (du texte sous une transformation, à des tailles fractionnaires, ne se rend pas au pixel près)
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const g of signes) {
    if (g.a <= 0 || g.px < 1) continue;
    const p = cam.ecran(g.x, g.y);
    ctx.globalAlpha = Math.min(1, g.a); ctx.font = `${Math.max(1, Math.round(g.px))}px ${PIX}`; ctx.fillStyle = g.col;
    texteSignes(ctx, g.ch, Math.round(p.x), Math.round(p.y));
  }
  ctx.globalAlpha = 1;
}
// la pénombre autour de l'isoloir (index.html : fouleCamera, un dégradé radial de 150 à 520 px, jusqu'à 0,9)
function penombre(ctx, T, cam) {
  const k = isoDe(cam.z); if (k <= .001) return;
  const F = focus(T), c = cam.ecran(F.cx, F.cy);
  const g = ctx.createRadialGradient(c.x, c.y, 150, c.x, c.y, 520);
  g.addColorStop(0, 'rgba(12,11,13,0)'); g.addColorStop(1, `rgba(12,11,13,${(.9 * k).toFixed(3)})`);
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, 830);
}
// l'isoloir à l'écran : les crochets laiton du N°48 (sans texte : sa marque, elle reviendra au méta-dilemme) et son
// étiquette ; à P16, l'étiquette de celui qui ne prend rien
function isoloir(ctx, T, cam) {
  const iso = isoDe(cam.z), a = seg(iso, .6, 1); if (a <= 0) return;
  const F = focus(T), c = cam.ecran(F.cx, F.cy);
  if (prive(T)) {
    crochets(ctx, c.x, c.y, cam.z, { a, label: '', k: seg(iso, .7, 1) });
    const h = cam.ecran(F.cx, F.cy - 200 / 4.2);
    etiquette(ctx, 'SUJET N°48 · CHOIX PRIVÉ', h.x, h.y, a, LABO);
  } else {
    const b = cam.ecran(F.cx, F.cy + 150 / 4.2);
    etiquette(ctx, 'SUJET N°53 · AUCUNE PILULE', b.x, b.y, a * (1 - seg(T, S.meurt + .3, S.meurt + .6)), CRAIE);
  }
}

// ---------------------------------------------------------------- les questions, sous la foule (index.html : fenetreQuestion ;
// film-pilules/plans/isoloir.js : question) : le titre, la question, la tentative ; 2 ou 4 réponses ; le cadre laiton se
// pose sur la réponse choisie ; ✓ LABO sur la bonne, ✗ ROUGE_TXT sur une fausse
function questions(ctx, T) {
  const A = aFenetreQ(T); if (A <= .01) return;
  fenetre(ctx, FQ.x, FQ.y, FQ.w, FQ.h, A);
  ctx.fillStyle = FILET; ctx.fillRect(FQ.x + 24, FQ.y + 54, FQ.w - 48, 2);
  for (const P of POSEES) {
    if (T < P.de - .05 || T >= P.a) continue;
    const aq = A * seg(T, P.de, P.de + .25) * (1 - seg(T, P.a - .2, P.a));
    if (aq <= .01) continue;
    ctx.globalAlpha = aq; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = `24px ${PIX}`; ctx.fillStyle = LABO;
    const titre = `QUESTION ${P.q + 1} / 4`;
    ctx.fillText(titre, FQ.x + 24, FQ.y + 40);
    const xq = FQ.x + 24 + ctx.measureText(titre).width + 30;
    ctx.font = `21px ${MONO}`; ecrit(ctx, balise(P.Q.txt), xq, FQ.y + 38, 0);
    if (P.essai) { ctx.font = `16px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'right'; ctx.fillText(P.essai, FQ.x + FQ.w - 24, FQ.y + 37); ctx.textAlign = 'left'; }
    const n = P.Q.opts.length, rep = T >= P.rep;
    for (let i = 0; i < n; i++) {
      const b = BOUTON(n, i), k = eBack(seg(T, P.de + .1 + i * .06, P.de + .4 + i * .06));
      if (k <= 0) continue;
      const choisi = T >= P.tsel && i === P.sel, juste = i === P.Q.ok, ks = choisi && !rep ? eBack(seg(T, P.tsel, P.tsel + .25)) : 1;
      let bord = CRAIE, txt = CRAIE, ab = 1, lw = 3;
      if (rep) {
        const fk = juste && P.juste ? 1 - seg(T, P.rep, P.rep + .5) : 0;   // l'éclair de la bonne réponse : craie → LABO
        if (juste) { bord = mix(LABO, CRAIE, fk); txt = bord; lw = 5; }
        else if (choisi) { bord = ROUGE_TXT; txt = ROUGE_TXT; lw = 5; }
        else ab = .35;
      } else if (choisi) { bord = LAITON; txt = LAITON; lw = 5; }
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2, w = b.w * k, h = b.h * k;
      ctx.globalAlpha = aq * ab * Math.min(1, k);
      ctx.fillStyle = choisi && !rep ? 'rgba(215,165,72,.12)' : FOND_FENETRE; ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
      ctx.strokeStyle = bord; ctx.lineWidth = lw * Math.min(1, ks); ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
      // l'éclair LABO sur la bonne réponse
      if (rep && juste && P.juste) { const fl = 1 - seg(T, P.rep, P.rep + .5); if (fl > 0) { ctx.globalAlpha = aq * .22 * fl; ctx.fillStyle = LABO; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.globalAlpha = aq * ab; } }
      if (k < .9) continue;
      ctx.font = `16px ${PIX}`; ctx.fillStyle = choisi && !rep ? LAITON : GRIS; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), b.x + 10, b.y + 15);
      ctx.textAlign = 'center'; ctx.font = `21px ${PIX}`; ctx.fillStyle = txt;
      const lignes = coupe(ctx, P.Q.opts[i], b.w - 56);
      lignes.forEach((l, li) => ctx.fillText(l, cx, cy + 2 + (li - (lignes.length - 1) / 2) * 27));
      if (rep && (choisi || juste)) {
        const kk = eBack(seg(T, P.rep, P.rep + .3));
        ctx.font = `${Math.max(1, Math.round(24 * kk))}px ${PIX}`; ctx.fillStyle = txt; texteSignes(ctx, choisi && !juste ? '✗' : '✓', b.x + b.w - 18, b.y + 17);
      }
      ctx.textBaseline = 'alphabetic';
    }
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

// ---------------------------------------------------------------- les tampons (index.html : st.tampon, en (650, 540), −6°)
function tampons(ctx, T) {
  if (T >= S.oblig && T < S.seule + .3) tampon(ctx, T, { t: S.oblig, txt: 'OBLIGATOIRE', taille: 104, c: CRAIE, a: 1 - seg(T, S.seule - .1, S.seule + .2) });
  if (T >= S.tampon) tampon(ctx, T, { t: S.tampon, txt: '100 / 100 ONT COMPRIS', taille: 64, c: LABO });
}

// ================================================================ la scène, à l'instant T
function scene(ctx, T) {
  const cam = camLot(T), O = etatOeil(T, cam);
  // le fond du laboratoire (index.html), qui chauffe avec la mort et s'éclaire avec la vie ; le sol baisse avec la foule
  fond(ctx, T, { chaud: chaud(T), clair: clair(T), sol: 1 - .55 * seg(T, S.montre, S.montre + 1) });
  // le monde, sous la caméra (rien sous y = 830)
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 830); ctx.clip();
  foule(ctx, T, O, cam);
  penombre(ctx, T, cam);
  ctx.restore();
  isoloir(ctx, T, cam);
  // ce qui est posé à l'écran : les pilules, la jauge, les questions, les tampons, RÈGLES, le terminal
  pilules(ctx, T, cam);
  laJauge(ctx, T);
  questions(ctx, T);
  tampons(ctx, T);
  regles(ctx, T);
  terminalTest(ctx, T, O);
  // Phi (hors caméra : c'est lui qui regarde) ; secoué quand tout le monde meurt (index.html : secoue)
  oeil(ctx, T, { x: O.x, y: O.y, taille: O.s, humeur: O.h, regard: O.g, secoue: S.meurt + .1 });
  ctx.globalAlpha = 1;
}

// ================================================================ les plans (EPISODE.md, « Les plans »)
const dessine = (ctx, t) => scene(ctx, t);
export const PLANS = [
  { id: 'P09', de: 87.8, a: 94.0, dessine },    // Le terminal (T01)
  { id: 'P10', de: 94.0, a: 100.9, dessine },   // Deux pilules (T02)
  { id: 'P11', de: 100.9, a: 106.9, dessine },  // Vous êtes cent (T03)
  { id: 'P12', de: 106.9, a: 113.0, dessine },  // L'isoloir du N°48 (T04)
  { id: 'P13', de: 113.0, a: 118.3, dessine },  // Une formulation possible (T05)
  { id: 'P14', de: 118.3, a: 124.7, dessine },  // Tout le monde vit (T06)
  { id: 'P15', de: 124.7, a: 135.2, dessine },  // Les bleus meurent (T07)
  { id: 'P16', de: 135.2, a: 144.9, dessine },  // Obligatoire (T08–T09)
  { id: 'P17', de: 144.9, a: 158.4, dessine },  // Le test de compréhension (T10–T11)
  { id: 'P18', de: 158.4, a: 171.6, dessine },  // Cent sur cent (T12)
];

// ================================================================ les indices sonores (tools/son-pilules.cjs)
// f : la hauteur (tic, hop, note, grain : Hz) ; pour un souffle, le sens du glissement (−1 descend, 1 monte). Les « hop » :
// un par saut, hauteur tirée par hache, placés dans la stéréo ; les coches de P18, une par participant, en pluie.
const pan = x => clamp((x - 960) / 960 * .8, -1, 1);
const r3 = t => +t.toFixed(3);
const sautsDe = (t0, t1, g) => SUJETS.flatMap(s => s.coul.filter(([t, , sa]) => sa && t >= t0 && t < t1)
  .map(([t], k) => ({ t: r3(t), son: 'hop', f: 380 + hache(s.i * 11 + Math.round(t * 10) + k) * 420, g, pan: pan(s.f.cx) })));
const premierTd2 = Math.min(...SUJETS.filter(s => s.td2 !== null).map(s => s.td2));
export const SONS = Object.freeze([
  { t: LOT.de, son: 'nappe', f: 'labo', g: .5 },
  // P09 : la frappe du terminal (un tic par caractère, très bas) ; l'envol de ses caractères
  ...CARS_TERM.map(c => ({ t: r3(c.t), son: 'tic', f: 3000 + hache(Math.round(c.x) * 3 + c.y) * 500, g: .05, pan: pan(c.x) })),
  { t: r3(S.resume), son: 'envol', d: 1.6, g: .28 },
  // P10 : le grain des caractères qui s'assemblent (aigu pour la bleue, plus grave pour la rouge) ; la frappe de la règle
  { t: r3(S.bleue), son: 'grain', d: 2.4, f: 2400, g: .35, pan: pan(380) },
  { t: r3(S.rouge), son: 'grain', d: 2.4, f: 1300, g: .35, pan: pan(920) },
  ...TREGLE.map((t, i) => ({ t: r3(t), son: 'frappe', d: [24, 65, 45, 60, 55][i] / REGLES_FEN.cps, g: .25, pan: .55 })),
  // P11 : les pilules en icônes ; les tic d'arrivée, en pluie ; un tout petit clic collectif au clignement
  { t: r3(S.cent), son: 'souffle', d: 1.0, f: -1, g: .3 },
  ...SUJETS.map(s => ({ t: r3(s.ta), son: 'tic', g: .08, f: 1800 + hache(s.i * 3 + 1) * 900, pan: pan(s.f.cx) })),
  { t: r3(S.cligne), son: 'declic', g: .16 },
  // P12 : un souffle qui se resserre pour la poussée ; la salle baisse (derrière les parois) ; le clac doux du cadenas
  { t: r3(S.prive), son: 'souffle', d: 1.5, f: [1800, 500], g: .28 },
  { t: r3(S.prive + .4), son: 'nappe', f: 'labo', g: .25 },
  { t: r3(S.prive + 1.35), son: 'clac', g: .3, pan: -.3 },
  { t: r3(S.recul), son: 'nappe', f: 'labo', g: .5 },
  { t: r3(S.recul), son: 'souffle', d: 1.1, f: [600, 1600], g: .2 },
  // P14 : la cascade de hop ; le declic du seuil ; la vie
  ...sautsDe(S.choix1, S.choix1 + 3, .16),
  { t: r3(S.seuil), son: 'declic', g: .45 },
  { t: r3(S.lueur), son: 'vie', d: 2.0, g: .5 },
  // P15 : les hop ; la peur ; l'envol des caractères
  ...sautsDe(S.choix2, S.choix2 + 3, .16),
  { t: r3(S.meurent), son: 'peur', d: 1.6, g: .35 },
  { t: r3(premierTd2), son: 'envol', d: 3.4, g: .45 },
  // P16 : les caractères qui redescendent ; le tampon ; les hop serrés ; celui qui ne saute pas ; la poussée ; le coup
  // sourd quand tout le monde part, puis l'envol de cent sujets
  { t: r3(S.remet2), son: 'retour', d: 1.2, g: .35 },
  { t: r3(S.oblig), son: 'tampon', g: .6 },
  ...sautsDe(S.choix3, S.choix3 + 1.5, .12),
  { t: r3(S.marque), son: 'tic', f: 660, g: .3, pan: pan(FAB.cx) },
  { t: r3(S.rien), son: 'souffle', d: .9, f: [1800, 500], g: .25 },
  { t: r3(S.meurt), son: 'note', f: 50, d: .9, g: .8 },
  { t: r3(S.meurt + .35), son: 'envol', d: 3.0, g: .55 },
  // P17 : la foule se recompose ; pour chaque question, les petits hop de la simulation, le cadre qui se pose, ✓ (coche)
  // ou ✗ (croix : un « bonk » grave et doux), et ce que la règle fait à la foule
  { t: r3(S.p17), son: 'retour', d: 1.2, g: .3 },
  ...POSEES.flatMap(P => [
    ...sautsDe(P.choix, P.choix + 1, .08),
    { t: r3(P.tsel), son: 'declic', g: .3, pan: pan(centreBouton(P).x) },
    { t: r3(P.rep), son: P.juste ? 'coche' : 'croix', g: .55, pan: pan(centreBouton(P).x) },
    ...(P.Q.issue === 'vie' ? [{ t: r3(P.rep + .15), son: 'vie', d: 1.2, g: .3 }] : P.juste ? [{ t: r3(P.rep + .3), son: 'envol', d: 1.2, g: .3 }] : [{ t: r3(P.rep + .1), son: 'peur', d: 1.0, g: .25 }]),
  ]),
  { t: r3(Q4.de), son: 'retour', d: .5, g: .2 },
  // P18 : la pluie de coches en vague ; les corrigés ; le froissement des têtes qui tournent ; le tampon
  ...SUJETS.map(s => ({ t: r3(s.tck), son: 'coche', g: s.mauvais ? .16 : .1, pan: pan(s.f.cx) })),
  ...SUJETS.filter(s => s.mauvais).map(s => ({ t: r3(s.tfix), son: 'coche', g: .35, pan: pan(s.f.cx) })),
  { t: r3(S.savait), son: 'souffle', d: 1.8, f: [700, 1300], g: .15 },
  { t: r3(S.tampon), son: 'tampon', g: .7 },
].sort((a, b) => a.t - b.t));

// ================================================================ pour les essais (la console, un script de vérification)
// le minutage du lot, les questions posées, les sujets, ce que regarde Phi (le point visé, ou « vous »), et ce que fait
// la foule à l'instant T : le nombre de sujets par
// mode (repos, saut, vie, peur, rien, prive, penaud), par couleur, en train de partir en caractères, et visibles
export const ESSAI = Object.freeze({
  S, POSEES, SUJETS,
  regard: T => { const c = regard().cible(T); return c && c.vous ? 'vous' : c && { x: Math.round(c.x), y: Math.round(c.y) }; },
  foule(T) {
    const cam = camLot(T), O = etatOeil(T, cam), out = { modes: {}, couleurs: {}, dis: 0, visibles: 0 };
    for (const s of SUJETS) {
      if (echelle(s, T) <= .01) continue;
      const e = etatSujet(s, T, O, cam);
      out.visibles++;
      if (e.dis > 0) { out.dis++; continue; }
      out.modes[e.mode] = (out.modes[e.mode] || 0) + 1;
      out.couleurs[e.col] = (out.couleurs[e.col] || 0) + 1;
    }
    return out;
  },
});
