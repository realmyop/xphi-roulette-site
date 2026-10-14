/* ==========================================================================
   Les deux pilules, l'épisode — plans/fin-aveu.js : qui explique les règles
   P78–P81, de 1271,8 à 1332,1 s (21:11,8–22:12,1), répliques E01–E08.
   Partie 3 · Qui explique les règles (dans le script : 21:30 – 23:15, la
   première moitié).

   Le contrechamp du numéro. Le fil en deux colonnes de P05 revient, net, avec
   ses mots (commun.js : colonnesFil, carte, et les flèches de réponse de P05) ;
   la petite étiquette « A », plantée dans RÈGLES dès le test, est là aussi,
   dans le coin des cartes du dilemme et des cartes qui citent la règle :
   presque invisible, elle s'allume sur « proche de la A ». Un volet en
   pointillés montre l'hypothèse (le même fil avec des « B » : moins de
   cartes, plus de mots du script, presque plus de flèches), puis repart. Des
   étiquettes partent des pointillés ; la caméra recule et les suit : au bout,
   l'œil de Phi. C'était lui. Puis l'aveu, au laboratoire : la fenêtre RÈGLES
   du test revient, son « A » grandit et devient le titre « DESCRIPTION A »
   (comme au tirage, P39), ses règles se recomposent en la description A ; un
   fil laiton entraîne les cartouches de l'épisode, en miniature : toute la
   suite. Enfin la fenêtre B, une fenêtre « NEUTRE » qui se dessine et
   s'efface (elle n'existe pas), et le cadre du tirage qui se pose sur B, en
   pointillés, en tremblant : « peut-être ».

   Messages inventés : des cartes abstraites (un avatar-bonhomme, des barres
   grises), seuls les mots du script lisibles, et la règle citée (la
   description A, en gris) ; ni nom, ni marque, ni compteur, ni date. La
   mention le dit (le socle, P78–P79).

   Deux écarts au découpage, voulus :
   - l'œil de P78 est en (1 790, 130, 110) et non en (1 700, 120, 110) : à
     x 1 700, il couvrait l'étiquette « A » de la carte du dilemme de droite
     (son coin, x 1 686–1 708, y 52–74) ;
   - la fenêtre RÈGLES revient avec sa hauteur de P18 (cinq règles : y 160–
     595) et non y 160–520 ; la description A, qu'elle devient, est plus
     basse (y 160–374), en x 1 100–1 700 (600 px : la largeur de P81).
   ========================================================================== */
import {
  W, H, CRAIE, GRIS, LABO, LAITON, MONO, PIX, FILET, NUIT, ZONE_UTILE,
  clamp, lerp, seg, cloche, eIO, eOut, eIn, hache, mix, rgba, fr, toile,
  fond, FOND_NUIT, fenetre, cartouche, largeurCartouche, etiquetteA, flechePixel, filet, tirets, rectTirets,
  colonnesFil, carte, FIL_COLONNES, CARTES_COLONNES, CARTE_H, CARTE_GAP,
  REGLES, REGLES_FEN, hauteurRegles, fenetreRegles, fenetreDescription, coupeBalise, ecrit, longueur,
  cadreTirage, oeil, creeRegard, humeur, HUMEURS, VOUS, point, flotte, camera,
} from '../commun.js';
import { DESCRIPTIONS, plume as plumeBoite } from '../texte.js';
import { B, S } from './fin-temps.js';

const noir = (ctx, a) => { if (a <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; };
// le fond du fil : la nuit assombrie de P05 (plans/ouverture.js : nuit(ctx, t, .5))
const fondFil = (ctx, t) => { fond(ctx, t, FOND_NUIT); noir(ctx, .5); };

// ================================================================ P78 · le fil, ses étiquettes « A »
// le haut de la première carte : 144 et non 40 (P05) — le cartouche (x 40–460, y 32–132), présent ici, couvrait la
// carte du dilemme de gauche ; le fil est descendu d'une carte, rien d'autre ne change
const Y0 = 144;
const yCarte = k => Y0 + k * (CARTE_H + CARTE_GAP);
// le rectangle d'une carte (son retrait compris) : comme carte() de commun.js le dessine
function rectCarte(col, k) {
  const C = FIL_COLONNES[col], c = CARTES_COLONNES[col][k], dx = c.retrait ? 40 : 0;
  return { x: C.x + dx, y: yCarte(k), w: C.w - dx, h: CARTE_H };
}
// les cartes qui portent l'étiquette : les deux cartes du dilemme, et deux réponses qui citent la règle (la description A)
const CITANTES = Object.freeze([[0, 4], [1, 4]]);
const ETIQUETEES = Object.freeze([[0, 0], [1, 0], ...CITANTES]);
// l'étiquette d'une carte : 22 × 22 dans son coin haut droit (carte() de commun.js : xr + wr − 34, y + 12)
const placeEtiquette = ([col, k]) => { const r = rectCarte(col, k); return { x: r.x + r.w - 34, y: r.y + 12, cx: r.x + r.w - 23, cy: r.y + 23 }; };
const CITATION = Object.freeze([fr('« Si plus de la moitié d’entre vous prend la bleue,'), fr('tout le monde vit… »')]);
function citation(ctx, r) {
  const bx = r.x + 96;
  ctx.globalAlpha = 1; ctx.fillStyle = '#121015'; ctx.fillRect(bx - 2, r.y + 42, r.w - 96 - 22, 66);
  ctx.font = `16px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(CITATION[0], bx, r.y + 62); ctx.fillText(CITATION[1], bx, r.y + 86);
}
// les flèches de réponse de P05 (plans/ouverture.js, FLECHES, bordCarte : recopiés), à leur alpha de repos
const FLECHES = Object.freeze([
  { de: [0, 1], vers: [1, 1], dy: -22 }, { de: [0, 2], vers: [1, 2], dy: -22 },
  { de: [1, 1], vers: [0, 1], dy: 22 }, { de: [1, 3], vers: [0, 3], dy: 22 },
]);
const bordCarte = ([col, k], cote, dy = 0) => { const r = rectCarte(col, k); return { x: cote > 0 ? r.x + r.w : r.x, y: r.y + CARTE_H / 2 + dy }; };
function fleches(ctx, a, liste = FLECHES) {
  for (const F of liste) {
    const gauche = F.de[0] === 0, A = bordCarte(F.de, gauche ? 1 : -1, F.dy), Bv = bordCarte(F.vers, gauche ? -1 : 1, F.dy);
    const L = Math.hypot(Bv.x - A.x, Bv.y - A.y), ux = (Bv.x - A.x) / L, uy = (Bv.y - A.y) / L;
    flechePixel(ctx, A.x + ux * 6, A.y + uy * 6, Bv.x - ux * 6, Bv.y - uy * 6, { col: CRAIE, lw: 1.5, a, c: 4 });
  }
}
// l'allumage des étiquettes : presque invisibles (la graine du test : GRIS, α 0,3), puis toutes ensemble, LABO, puis CRAIE
const allume = t => eOut(seg(t, S.procheA, S.procheA + .3));
function etiquettes(ctx, t, lettre = 'A') {
  const k = allume(t), flash = cloche(t, S.procheA, S.procheA + .15, S.procheA + .5, S.procheA + 1.3);
  for (const e of ETIQUETEES) {
    const p = placeEtiquette(e);
    etiquetteA(ctx, p.x, p.y, lerp(.3, 1, k), lettre, { col: flash > 0 ? mix(CRAIE, LABO, flash) : k > 0 ? mix(GRIS, CRAIE, k) : GRIS });
  }
}
// le fil réel : les deux colonnes de P05, avec leurs mots, les citations, les flèches, les étiquettes
function filReel(ctx, t) {
  colonnesFil(ctx, t, { y0: Y0 });
  for (const [col, k] of CITANTES) citation(ctx, rectCarte(col, k));
  fleches(ctx, .55);
  etiquettes(ctx, t);
}
// l'hypothèse : le même fil, plus calme — moins de cartes, plus de mots du script, une seule flèche, des « B »
const HYPO = Object.freeze([[0, 0], [0, 2], [0, 4], [1, 0], [1, 3]]);
function filHypothese(ctx, t) {
  fondFil(ctx, t);
  for (const [col, k] of HYPO) {
    const C = FIL_COLONNES[col], c = CARTES_COLONNES[col][k];
    carte(ctx, t, c, C.x, yCarte(k), C.w, { mot: null, etiquette: c.dilemme ? 'B' : null, etiquetteA: 1, etiquetteCol: CRAIE });
  }
  filet(ctx, 960, 0, 830, 1);
  fleches(ctx, .22, [FLECHES[0]]);
  // son titre, « hypothèse », dans un petit cadre en pointillés, en haut, au pied du filet
  ctx.font = `14px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText('hypothèse').width;
  ctx.fillStyle = 'rgba(12,11,13,.9)'; ctx.fillRect(980, 60, w + 24, 30);
  ctx.globalAlpha = 1; ctx.fillStyle = GRIS; ctx.fillText('hypothèse', 992, 80);
  rectTirets(ctx, 980, 60, w + 24, 30, GRIS, .9, 1.5, [4, 4]);
}
// le volet : il passe de gauche à droite sur « proche de la B », et repart sur « la même violence »
function xVolet(t) {
  if (t < S.procheB) return 0;
  if (t < S.violence) return W * eIO(seg(t, S.procheB, S.procheB + 1));
  return W * (1 - eIO(seg(t, S.violence, S.violence + 1)));
}
// ================================================================ P79 · les pointillés vers l'œil ; le recul
export const CAM79 = Object.freeze([[S.qui, 960, 480, 960, 480, 1], [S.qui + 2.6, 960, 480, 600, 620, .4]]);
const OEIL78 = Object.freeze({ x: 1790, y: 130, taille: 110 }), OEIL79 = Object.freeze({ x: 1420, y: 300, taille: 220 });
const placeOeil79 = t => { const k = eIO(seg(t, S.qui, S.qui + 2.6)); return { x: lerp(OEIL78.x, OEIL79.x, k), y: lerp(OEIL78.y, OEIL79.y, k), taille: lerp(OEIL78.taille, OEIL79.taille, k) }; };
const kPointille = (t, j) => eOut(seg(t, S.qui + .12 * j, S.qui + 1.3 + .12 * j));
// (ils s'arrêtent à l'anneau de l'œil, sans entrer dans son diaphragme)
function pointilles(ctx, t, cam, O) {
  ETIQUETEES.forEach((e, j) => {
    const k = kPointille(t, j); if (k <= 0) return;
    const p = placeEtiquette(e), a = cam.ecran(p.cx, p.cy), d = Math.hypot(O.x - a.x, O.y - a.y), u = k * Math.max(0, 1 - O.r / d);
    tirets(ctx, a.x, a.y, lerp(a.x, O.x, u), lerp(a.y, O.y, u), CRAIE, .85, 2, [6, 6]);
  });
}
// le fil, P78 et P79 : un seul décor
function fil(ctx, t, cam) {
  fondFil(ctx, t);
  ctx.save(); cam.applique(ctx);
  filReel(ctx, t);
  const xv = xVolet(t);
  if (xv > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, xv, H); ctx.clip(); filHypothese(ctx, t); ctx.restore();
    if (xv < W) tirets(ctx, xv, 0, xv, 830, CRAIE, .8, 2, [6, 6]);
  }
  ctx.restore();
  pied(ctx, clamp((cam.z - .6) / .35));
}
// le pied de l'image (au montage) : sous la zone utile, la dernière rangée de cartes s'enfonce dans la nuit, comme le
// mur de P06–P07 (plans/ouverture.js, pied, recopié) ; sans lui, elle se lisait à travers la boîte XPHI. Il s'efface
// quand la caméra recule (P79) : le fil entier tient alors au-dessus de la boîte.
function pied(ctx, a = 1) {
  if (a <= 0) return;
  const g = ctx.createLinearGradient(0, ZONE_UTILE - 40, 0, ZONE_UTILE + 35);   // nuit pleine sous le haut de la boîte
  g.addColorStop(0, rgba(NUIT, 0)); g.addColorStop(1, rgba(NUIT, .97));
  ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(0, ZONE_UTILE - 40, W, H - ZONE_UTILE + 40); ctx.globalAlpha = 1;
}
// le regard (P78–P79) : les étiquettes ; le fil hypothétique ; le vrai ; puis, la caméra arrivée, vous : pris
const cam79 = t => camera(t, CAM79);
const etiquetteEcran = j => T => { const p = placeEtiquette(ETIQUETEES[j]); return cam79(T).ecran(p.cx, p.cy); };
const carteAuHasard = T => { const n = Math.floor(T / 1.1), col = hache(n * 7 + 1) < .5 ? 0 : 1, k = Math.floor(hache(n * 13 + 3) * 6); const r = rectCarte(col, k); return cam79(T).ecran(r.x + 60, r.y + 60); };
const REG_FIL = creeRegard({
  repos: [[3, carteAuHasard], [1, VOUS], [1, T => plumeBoite(T)]],
  cibles: [
    ...ETIQUETEES.map((e, j) => [S.procheA + .1 + .45 * j, .45, etiquetteEcran(j)]),
    [S.procheB, 1, T => point(xVolet(T), 300), .15],
    [S.procheB + 1, S.violence - S.procheB - 1, T => { const n = Math.floor(T / 1.2), [col, k] = HYPO[Math.floor(hache(n * 11 + 5) * HYPO.length)]; return point(FIL_COLONNES[col].x + 60, yCarte(k) + 60); }, 1.2],
    [S.violence, 1, T => point(xVolet(T), 300), .15],
    [B.P79, S.qui - B.P79, T => etiquetteEcran(Math.floor((T - B.P79) / .6) % ETIQUETEES.length)(T), .6],
    [S.qui, S.pris - S.qui, T => cam79(T).ecran(960, 480), .4],
    [S.pris, B.P80 - S.pris + .1, VOUS],
  ],
});
const H_FIL = [[B.P78, 'neutre'], [S.procheA, 'curieux'], [S.procheB, 'doute'], [S.violence + 1, 'neutre'], [S.pris, { ...HUMEURS.grand, glow: .6 }, .25], [S.pris + .6, 'neutre']];
export function dessineP78(ctx, t, cam) {
  fil(ctx, t, cam);
  oeil(ctx, t, { ...OEIL78, humeur: humeur(t, H_FIL), regard: REG_FIL });
}
export function dessineP79(ctx, t, cam) {
  fil(ctx, t, cam);
  const O = placeOeil79(t), centre = { x: O.x, y: O.y + flotte(t), r: O.taille * .36 };
  pointilles(ctx, t, cam, centre);
  oeil(ctx, t, { ...O, humeur: humeur(t, H_FIL), regard: REG_FIL });
}

// ================================================================ P80 · c'est moi la fautive : RÈGLES, la description A, la suite
const OEIL80 = Object.freeze({ x: 760, y: 360, taille: 200 }), OEIL81 = Object.freeze({ x: 960, y: 260, taille: 180 });
const YF = 160, X80 = 1100, X81 = 1160, WD = 600;
const H5 = hauteurRegles(5);
// la hauteur d'une fenêtre de description de largeur w (fenetreDescription : le texte en Plex 19 px, 28 px
// d'interligne, la première ligne en y + 92) ; une mémoire de calcul, mesurée une fois les polices chargées
const HAUTEURS = new Map();
function hautDesc(ctx, lettre, w = WD) {
  const cle = `${lettre}|${w}`;
  if (!HAUTEURS.has(cle)) { ctx.font = `19px ${MONO}`; HAUTEURS.set(cle, 92 + (coupeBalise(ctx, DESCRIPTIONS[lettre], w - 48).length - 1) * 28 + 34); }
  return HAUTEURS.get(cle);
}
// les pointillés de P79 se décrochent de l'œil et s'éteignent (ils venaient d'en bas à gauche, du fil)
const FILS80 = Object.freeze([[-140, 900], [120, 1120], [420, 1180], [-200, 640]]);
function decroche(ctx, t) {
  const k = seg(t, B.P80, B.P80 + 1.3); if (k >= 1) return;
  const O = { x: OEIL80.x, y: OEIL80.y + flotte(t) }, u = eIn(k);
  for (const [x1, y1] of FILS80) tirets(ctx, lerp(O.x, x1, .15 + .5 * u), lerp(O.y, y1, .15 + .5 * u) + 90 * u, x1, y1 + 90 * u, CRAIE, .85 * (1 - k), 2, [6, 6]);
}
// la fenêtre, de RÈGLES (P18) à la description A (comme au tirage, P39)
const xFenetre = t => (t < B.P81 ? lerp(X80 + 80, X80, eOut(seg(t, S.avecA, S.avecA + .45))) : lerp(X80, X81, eIO(seg(t, B.P81, B.P81 + .8))));
const aFenetre = t => seg(t, S.avecA, S.avecA + .35);
const T_MORPH = S.sondage, FIN_MORPH = S.sondage + 2.2;
// l'étiquette grandit et devient le « A » du titre : sa place (son centre) et sa taille à l'instant t
function etiquetteMorph(ctx, t, x) {
  ctx.font = `26px ${PIX}`;
  const ax = x + 24 + ctx.measureText('DESCRIPTION ').width, aw = ctx.measureText('A').width, k = eIO(seg(t, T_MORPH, T_MORPH + .6));
  return { k, ax, s: lerp(22, 34, k), cx: lerp(x + REGLES_FEN.w - 36 + 11, ax + aw / 2, k), cy: lerp(YF + 25, YF + 31, k) };
}
function morph(ctx, t, x) {
  const hA = hautDesc(ctx, 'A'), kw = eIO(seg(t, T_MORPH + .2, T_MORPH + .8)), w = lerp(REGLES_FEN.w, WD, kw), h = lerp(H5, hA, kw);
  fenetre(ctx, x, YF, w, h, 1);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  // « RÈGLES » s'efface pendant que l'étiquette grandit ; « DESCRIPTION » s'écrit devant le « A » qu'elle est devenue
  const aR = 1 - seg(t, T_MORPH, T_MORPH + .3);
  if (aR > 0) { ctx.globalAlpha = aR; ctx.font = `24px ${PIX}`; ctx.fillStyle = LABO; ctx.fillText('RÈGLES', x + 24, YF + 40); }
  ctx.globalAlpha = 1; ctx.fillStyle = FILET; ctx.fillRect(x + 24, YF + 54, w - 48, 2);
  const E = etiquetteMorph(ctx, t, x), boite = 1 - seg(t, T_MORPH + .6, T_MORPH + .85);
  if (boite > 0) etiquetteA(ctx, E.cx - E.s / 2, E.cy - E.s / 2, boite, 'A', { taille: E.s, col: mix(CRAIE, LABO, E.k) });
  if (t >= T_MORPH + .6) {
    ctx.font = `26px ${PIX}`; ctx.fillStyle = LABO;
    ctx.globalAlpha = seg(t, T_MORPH + .6, T_MORPH + .85); ctx.fillText('A', E.ax, YF + 40);
    const n = clamp(Math.floor((t - T_MORPH - .65) * 36), 0, 12);
    ctx.globalAlpha = 1; if (n > 0) ctx.fillText('DESCRIPTION '.slice(0, n), x + 24, YF + 40);
  }
  ctx.save(); ctx.beginPath(); ctx.rect(x + 4, YF + 60, w - 8, h - 64); ctx.clip();
  // les règles se défont : elles montent, virent au LABO et s'éteignent
  const kd = seg(t, T_MORPH + .1, T_MORPH + .8);
  if (kd < 1) {
    ctx.font = `21px ${MONO}`; let yy = YF + 92;
    for (const lignes of REGLES) {
      ctx.globalAlpha = 1 - kd; ecrit(ctx, kd > .3 ? lignes.map(l => l.map(s => ({ s: s.s, c: LABO }))) : lignes, x + 24, yy - 30 * eOut(kd), REGLES_FEN.lh);
      yy += lignes.length * REGLES_FEN.lh + REGLES_FEN.gap;
    }
  }
  // la description A se tape (150 car./s), sous un voile LABO qui s'efface
  const n = Math.floor((t - (T_MORPH + .7)) * 150);
  if (n > 0) {
    ctx.font = `19px ${MONO}`;
    const L = coupeBalise(ctx, DESCRIPTIONS.A, WD - 48), fl = 1 - seg(t, T_MORPH + .7, T_MORPH + 2.2);
    ctx.globalAlpha = 1; ecrit(ctx, L, x + 24, YF + 92, 28, n);
    if (fl > 0) { ctx.globalAlpha = .12 * fl; ctx.fillStyle = LABO; ctx.fillRect(x + 12, YF + 70, w - 24, L.length * 28 + 6); }
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
function fenetreA(ctx, t) {
  const a = aFenetre(t); if (a <= .001) return null;
  const x = xFenetre(t);
  if (t < T_MORPH) {
    // telle qu'elle était en P18 : ses cinq règles, la petite étiquette « A » dans son coin (Phi la regarde : elle se lit)
    const ke = seg(t, S.avecA + 1.3, S.avecA + 1.9);
    fenetreRegles(ctx, t, 5, { x, y: YF, a, etiquette: { a: lerp(.4, 1, ke), col: mix(GRIS, CRAIE, ke) } });
    return { x, y: YF, w: REGLES_FEN.w, h: H5 };
  }
  if (t < FIN_MORPH) { morph(ctx, t, x); return { x, y: YF, w: WD, h: hautDesc(ctx, 'A') }; }
  fenetreDescription(ctx, t, 'A', x, YF, WD, hautDesc(ctx, 'A'));
  return { x, y: YF, w: WD, h: hautDesc(ctx, 'A') };
}
// le fil laiton, et les cartouches de l'épisode qu'il entraîne vers la gauche (EPISODE.md, « Surimpression »)
const P1 = 'PARTIE 1 · REJOUER LE TEST', P2 = 'PARTIE 2 · LES RÉSULTATS', P3 = 'PARTIE 3 · CE QUE ÇA VEUT DIRE';
const CARTOUCHES_EP = Object.freeze([
  [P1, 'LE TEST'], [P1, 'UN DILEMME KANTIEN ?'], [P1, 'DEUX VARIANTES DÉSÉQUILIBRÉES'], [P2, 'LE TIRAGE AU SORT'],
  ['RÉSULTATS 01', 'DESCRIPTION A'], ['RÉSULTATS 02', 'PRÉDICTIONS · GROUPE A'], ['RÉSULTATS 03', 'DESCRIPTION B'],
  ['RÉSULTATS 04', 'LA MÊME RÈGLE, DEUX FOIS'], ['RÉSULTATS 05', 'PRÉDICTIONS · GROUPE B'], ['RÉSULTATS 06', 'MÊME SITUATION ?'],
  ['RÉSULTATS 07', 'PLUS OU MOINS TROMPEUSE ?'], ['RÉSULTATS 08', 'LE MÊME CHOIX ?'], ['RÉSULTATS 09', 'QUI PREND LA BLEUE ?'],
  ['RÉSULTATS 10', 'TOUS LES ÉCARTS'], [P3, 'MAUVAIS OU MÉCHANTS'], [P3, 'LE MÉTA-DILEMME'],
].map(([h, b]) => Object.freeze([fr(h), fr(b)])));
const Y_FIL = 650, ECH = .5;
const aFilLaiton = t => 1 - seg(t, B.P81, B.P81 + .5);
const departTrain = S.orienter + .45;
const distance = t => { const u = Math.max(0, t - departTrain); return 200 * u + 204 * u * u; };
function filLaiton(ctx, t, F) {
  const k = eOut(seg(t, S.orienter, S.orienter + .7)), a = aFilLaiton(t); if (k <= 0 || a <= 0 || !F) return;
  const xc = Math.round(F.x + F.w / 2), yb = F.y + F.h + 8, L1 = Y_FIL - yb, L2 = xc + 20, L = (L1 + L2) * k;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = LAITON; ctx.lineWidth = 3; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(xc, yb); ctx.lineTo(xc, yb + Math.min(L, L1)); if (L > L1) ctx.lineTo(xc - (L - L1), Y_FIL); ctx.stroke();
  ctx.fillStyle = LAITON; ctx.fillRect(xc - 5, yb - 5, 10, 10);
  // les cartouches, accrochés au fil, sortent de son coude et filent vers la gauche, de plus en plus vite
  ctx.beginPath(); ctx.rect(0, 0, xc - 8, H); ctx.clip();
  let off = 10;
  for (const [h, b] of CARTOUCHES_EP) {
    const w = largeurCartouche(ctx, h, b) * ECH, x = xc + off - distance(t);
    off += w + 26;
    if (x > xc || x + w < -20) continue;
    ctx.globalAlpha = a; ctx.fillStyle = LAITON; ctx.fillRect(Math.round(x + w / 2) - 1, Y_FIL, 2, 12);
    ctx.save(); ctx.translate(x, Y_FIL + 12); ctx.scale(ECH, ECH); cartouche(ctx, h, b, a, { x: 0, y: 0 }); ctx.restore();
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
// une petite toile pour mesurer (le regard de Phi se calcule sans dessiner) ; les polices sont chargées quand il sert
let MES = null;
const mesureur = () => (MES = MES || toile(8, 8).getContext('2d'));
// le cartouche le plus à gauche encore bien dans l'image (pour l'œil)
function cartoucheEnTete(t, xc) {
  const m = mesureur(); let off = 10;
  for (const [h, b] of CARTOUCHES_EP) {
    const w = largeurCartouche(m, h, b) * ECH, x = xc + off - distance(t);
    off += w + 26;
    if (x > 160 && x < xc - w) return point(x + w / 2, Y_FIL + 34);
  }
  return point(lerp(xc, 200, seg(t, S.orienter, S.orienter + 3)), Y_FIL);
}

// ================================================================ P81 · aucune n'est neutre
const placeOeil81 = t => { const k = eIO(seg(t, B.P81, B.P81 + .8)); return { x: lerp(OEIL80.x, OEIL81.x, k), y: lerp(OEIL80.y, OEIL81.y, k), taille: lerp(OEIL80.taille, OEIL81.taille, k) }; };
const XB = 160;
function fenetreB(ctx, t) {
  const a = seg(t, S.uneDesc, S.uneDesc + .3); if (a <= .001) return null;
  const n = Math.floor((t - S.uneDesc - .2) * 150), h = hautDesc(ctx, 'B');
  fenetreDescription(ctx, t, 'B', XB, YF, WD, h, { a, n: Math.max(0, n), plume: true });
  return { x: XB, y: YF, w: WD, h };
}
// la fenêtre « NEUTRE » : elle se dessine en pointillés, son titre se tape, elle reste vide… et s'efface
const NEUTRE = Object.freeze({ x: 810, y: 440, w: 300, h: 180 });
function fenetreNeutre(ctx, t) {
  const k = seg(t, S.neutre, S.neutre + .7), a = 1 - seg(t, S.neutre + 1.9, S.neutre + 2.6);
  if (k <= 0 || a <= 0) return;
  const { x, y, w, h } = NEUTRE, P = 2 * (w + h);
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = GRIS; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
  ctx.beginPath(); ctx.moveTo(x, y);
  // le chemin, côté par côté, jusqu'à la part tracée
  let px = x, py = y, reste = P * eOut(k);
  for (const [dx, dy, L] of [[1, 0, w], [0, 1, h], [-1, 0, w], [0, -1, h]]) {
    const l = Math.min(L, reste); if (l <= 0) break;
    px += dx * l; py += dy * l; ctx.lineTo(px, py); reste -= l;
  }
  ctx.stroke();
  const n = clamp(Math.floor((t - S.neutre - .35) * 16), 0, 6);
  ctx.setLineDash([]); ctx.font = `26px ${PIX}`; ctx.fillStyle = GRIS; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (n > 0) ctx.fillText('NEUTRE'.slice(0, n), x + 24, y + 40);
  if (k >= 1) tirets(ctx, x + 24, y + 54, x + w - 24, y + 54, GRIS, a, 2, [6, 6]);
  ctx.restore(); ctx.globalAlpha = 1;
}
// le cadre du tirage : sur A (« refaire »), puis il passe sur B et s'y pose, en pointillés, en tremblant : « peut-être »
const D_PASSE = .45;
function cadre81(ctx, t, RA, RB) {
  if (t < S.refaire || !RA) return;
  const a = seg(t, S.refaire, S.refaire + .25), k = eIO(seg(t, S.parB, S.parB + D_PASSE)), R1 = RB || RA;
  const r = { x: lerp(RA.x, R1.x, k), y: lerp(RA.y, R1.y, k), w: lerp(RA.w, R1.w, k), h: lerp(RA.h, R1.h, k) };
  if (t < S.parB + D_PASSE) { cadreTirage(ctx, t, { k: 0, depuis: t - (t < S.parB ? S.refaire : S.parB), pose: false }, r, { pose: false, marge: 18, a }); return; }
  const tp = S.parB + D_PASSE, n = Math.floor(t * 14), tr = (hache(n * 7 + 3) - .5) * 4, ty = (hache(n * 13 + 5) - .5) * 3;
  const m = 18 + 8 * (1 - eOut(seg(t, tp, tp + .4)));
  ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = rgba(LAITON, .6); ctx.shadowBlur = 12;
  ctx.strokeStyle = LAITON; ctx.lineWidth = 4; ctx.setLineDash([16, 10]);
  ctx.strokeRect(r.x - m + tr, r.y - m + ty, r.w + 2 * m, r.h + 2 * m);
  ctx.restore(); ctx.globalAlpha = 1;
}

// ================================================================ P80–P81 : le laboratoire, un seul décor
function aveu(ctx, t) {
  fond(ctx, t);
  if (t < B.P81) decroche(ctx, t);
  const FA = fenetreA(ctx, t);
  filLaiton(ctx, t, FA);
  let FB = null;
  if (t >= B.P81) { FB = fenetreB(ctx, t); fenetreNeutre(ctx, t); cadre81(ctx, t, FA, FB); }
  return { FA, FB };
}
const centreR = r => point(r.x + r.w / 2, r.y + Math.min(r.h, 220) / 2);
const RECT_A80 = { x: X80, y: YF, w: REGLES_FEN.w, h: H5 }, RECT_A81 = { x: X81, y: YF, w: WD, h: 214 }, RECT_B81 = { x: XB, y: YF, w: WD, h: 214 };
const REG_AVEU = creeRegard({
  repos: [[3, VOUS], [1, T => plumeBoite(T)]],
  cibles: [
    // P80 : vous ; la fenêtre ; l'étiquette (comme on regarde une preuve) ; elle devient titre ; le fil des cartouches
    [B.P80, 1.8, VOUS],
    [S.avecA + .2, 1.2, centreR(RECT_A80)],
    [S.avecA + 1.4, T_MORPH - S.avecA - 1.4, point(X80 + REGLES_FEN.w - 25, YF + 25)],
    [T_MORPH, 1.4, T => { const E = etiquetteMorph(mesureur(), T, X80); return point(E.cx, E.cy); }],
    [T_MORPH + 1.4, 1.4, point(X80 + 300, YF + 140)],
    [S.orienter, B.P81 - S.orienter, T => cartoucheEnTete(T, X80 + WD / 2), .5],
    // P81 : A ; B ; la fenêtre fantôme ; A ; B ; vous
    [B.P81 + .3, 1.4, centreR(RECT_A81)],
    [S.uneDesc, 1.4, centreR(RECT_B81)],
    [S.neutre, 2.3, point(NEUTRE.x + NEUTRE.w / 2, NEUTRE.y + NEUTRE.h / 2)],
    [S.refaire, 1.6, centreR(RECT_A81)],
    [S.parB, S.sourire - S.parB, centreR(RECT_B81)],
    [S.sourire, B.P82 - S.sourire, VOUS],
  ],
});
const H_AVEU = [
  [B.P80, 'neutre'], [S.fautif, 'bas'], [S.avecA, 'neutre'], [S.avecA + 1.4, 'plisse'], [T_MORPH + .8, 'neutre'], [S.orienter, 'doute'],
  [B.P81, 'neutre'], [S.neutre, 'doute', .3], [S.neutre + 2.4, 'neutre'], [S.peutEtre, 'doute'], [S.sourire, { ...HUMEURS.grand, glow: .25 }],
];
export function dessineP80(ctx, t) {
  aveu(ctx, t);
  oeil(ctx, t, { ...OEIL80, humeur: humeur(t, H_AVEU), regard: REG_AVEU });
}
export function dessineP81(ctx, t) {
  aveu(ctx, t);
  oeil(ctx, t, { ...placeOeil81(t), humeur: humeur(t, H_AVEU), regard: REG_AVEU });
}

// ================================================================ les sons (tools/son-pilules.cjs)
const r3 = t => +t.toFixed(3);
// la rumeur du fil : des vibrations étouffées, lentes ; derrière le volet, à moitié ; elle s'arrête quand on remonte les
// pointillés
const RUMEUR = (() => {
  const out = [];
  for (let k = 0; ; k++) {
    const t = B.P78 + .3 + k * .47 + hache(k * 17 + 3) * .12; if (t >= S.qui) break;
    const derriere = t >= S.procheB + .5 && t < S.violence + .5;
    out.push({ t: r3(t), son: 'haptique', g: derriere ? .035 : .07, pan: k % 2 ? .45 : -.45 });
  }
  return out;
})();
export const SONS_AVEU = Object.freeze([
  { t: B.P78, son: 'nappe', f: 'nuit', g: .45 },
  ...RUMEUR,
  // P78 : les étiquettes s'allument ; le volet passe, repart
  { t: r3(S.procheA), son: 'pop', f: 1300, g: .22 },
  { t: r3(S.procheA + .04), son: 'pop', f: 1500, g: .16, pan: .3 },
  { t: r3(S.procheB), son: 'souffle', d: 1, f: [1400, 700], g: .14 },
  { t: r3(S.violence), son: 'souffle', d: 1, f: [700, 1400], g: .14 },
  // P79 : un glissement qui monte en suivant les pointillés ; arrivé à l'œil, un tic, puis rien
  { t: r3(S.qui), son: 'souffle', d: 2.6, f: [450, 2200], g: .2 },
  { t: r3(S.qui + 2.6), son: 'tic', f: 2600, g: .3 },
  { t: r3(S.qui + 2.65), son: 'silence', d: 1 },
  // P80 : le laboratoire ; la fenêtre ; l'étiquette devient titre (un declic) ; le souffle du fil
  { t: B.P80, son: 'nappe', f: 'labo', g: .5 },
  { t: r3(S.avecA), son: 'pop', f: 620, g: .16, pan: .45 },
  { t: r3(T_MORPH + .6), son: 'declic', g: .32, pan: .45 },
  { t: r3(T_MORPH + .7), son: 'frappe', d: 1.3, g: .12, pan: .45 },
  { t: r3(S.orienter), son: 'souffle', d: 3.4, f: [700, 260], g: .24, pan: -.3 },
  // P81 : la fenêtre B ; la fenêtre fantôme, un souffle qui ne se pose pas ; le cadre, un clac très doux
  { t: r3(S.uneDesc), son: 'pop', f: 640, g: .15, pan: -.45 },
  { t: r3(S.uneDesc + .2), son: 'frappe', d: 1.1, g: .1, pan: -.45 },
  { t: r3(S.neutre), son: 'souffle', d: 1.5, f: [700, 1300], g: .14 },
  { t: r3(S.refaire), son: 'tic', f: 2400, g: .22, pan: .45 },
  { t: r3(S.parB), son: 'tic', f: 2400, g: .22, pan: -.45 },
  { t: r3(S.parB + D_PASSE), son: 'clac', g: .12, pan: -.45 },
]);
