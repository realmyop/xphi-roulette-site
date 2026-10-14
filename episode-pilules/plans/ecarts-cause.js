/* ==========================================================================
   Les deux pilules, l'épisode — plans/ecarts-cause.js : P70–P71
   Le virus saisonnier ; avant tout, la description.

   - P70 : plein cadre, sur la nuit assombrie, un lent recul ×1 → ×0,8. Des
     cartes de publication (commun.js : carte, réduites à 340 px : un
     avatar-bonhomme, des barres grises ; une sur trois porte un mot du script
     lisible, « égoïstes. », « assassins. », « idiots. ») paraissent dans tout
     le champ PAR VAGUES DE PROCHE EN PROCHE (commun.js : vague, la même que
     l'universalisation de Kant), chaque vague partant d'une carte du dilemme :
     elle monte, s'étale, puis s'éteint. Quatre vagues : la première, sur
     « ces guerres interminables », s'étale lentement et dure jusqu'à la
     deuxième ; les trois autres, sur « refait surface », « régulièrement » et
     « virus saisonnier », sont exactement les mêmes (même vitesse, même
     tenue), parties d'ailleurs : la régularité d'une saison. Aucune marque,
     aucun nom, aucun chiffre, aucune date. Chaque carte est dessinée une fois
     dans une toile (une mémoire de calcul, à T = 0 : l'image ne dépend pas de
     l'instant où on l'a faite), puis posée par drawImage.
   - P71 : la mise en page des colonnes du tirage, telle que le lot tirage la
     pose (plans/tirage-colonnes.js : les fenêtres de description descendues
     en y 146–336, sous le cartouche, les grilles 40 px plus bas), ici
     COLORÉES par les résultats : à gauche 65 bleus, un moitié bleu, 34 rouges
     (la description A) ; à droite 12 bleus, un bleu à 60 %, 87 rouges (la
     description B) ; l'ordre est celui de Thibaut (resultats.js, RANG[0],
     comme ses écrans 01 et 03 : les 12 bleus de B sont parmi les 65 de A, la
     même foule deux fois). Sur « Kant », la vignette de Kant (PORTRAITS.kant,
     cs 4, GRIS) en (880, 520) ; sur « probabilités », un « % » GRIS en
     (1 040, 520) ; de chacun, quelques pointillés très fins vers quelques
     sujets, qui pâlissent aussitôt. Sur « à cause de la description », de
     chaque fenêtre descend UN FIL PAR SUJET (CRAIE, 1 px, net) jusqu'à sa
     tête, rangée après rangée ; les fils passent derrière les sujets (des
     fils de marionnette) ; chacun lève les yeux vers sa fenêtre quand le
     sien l'atteint. Sur « lue en premier », les étiquettes LAITON de P42.
   ========================================================================== */
import {
  W, H, CRAIE, GRIS, LAITON, BLEU, ROUGE, MONO, PIX, NUIT, ZONE_UTILE,
  lerp, seg, eIO, eOut, eBack, hache, toile, rgba,
  fond, FOND_NUIT, carte, CARTE_H, MOTS_FIL, vague, dessineSujet, coupeSujet, PREMIERS,
  fenetreDescription, GRILLE, COLONNES, portrait,
} from '../commun.js';
import * as R from '../resultats.js';
import * as D from '../donnees.js';
import { S, BORNES, OEIL } from './ecarts-temps.js';
import { filetSousOeil } from './ecarts-morale.js';

const noir = (ctx, a) => { if (a <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; };

// ================================================================ P70 · un virus saisonnier
// le champ : des places de cartes en quinconce (7 colonnes × 7 rangées), dans le monde ; la place (c, r) a l'indice
// c + 20 r, pour que vague() de commun.js (une grille de 20 de large, la distance de Tchebychev) les compte
const CW = 340, CH = CARTE_H, NC = 7, NR = 7;
const PLACES = Object.freeze([...Array(NC * NR).keys()].map(k => {
  const c = k % NC, r = Math.floor(k / NC);
  return Object.freeze({ i: c + 20 * r, c, r, x: -230 + c * 380 + (r % 2) * 190, y: -90 + r * 150 });
}));
const PAR_I = new Map(PLACES.map(p => [p.i, p]));
// les quatre vagues : l'instant, la carte du dilemme d'où elle part, le temps d'un anneau, la tenue d'une carte
const VAGUES = Object.freeze(S.vagues.map((t0, w) => Object.freeze({
  t0, origine: [3 + 3 * 20, 1 + 2 * 20, 4 + 4 * 20, 2 + 5 * 20][w],   // (c, r) : (3, 3), (1, 2), (4, 4), (2, 5)
  pas: w === 0 ? .22 : .09, tient: w === 0 ? Math.max(1.2, S.vagues[1] - t0 - 6 * .22 - .2) : 1.1,
})));
// la carte d'une place dans une vague : présente ou non, son dessin (une des 24 cartes du jeu), une carte du dilemme à
// l'origine
// (les mots, comme dans le fil de P05 : les bleus écrivent « égoïstes. » ou « assassins. », les rouges « idiots. » ; la
// carte du dilemme a un avatar gris, comme en tête des colonnes de P05)
const motDe = d => (d < 2 || d % 3 !== 1 ? null : d % 2 ? MOTS_FIL[2].txt : MOTS_FIL[Math.floor(d / 6) % 2].txt);
const DESSINS = Object.freeze([...Array(24).keys()].map(d => Object.freeze({
  i: 400 + d, camp: d < 2 ? 'gris' : d % 2 ? 'rouge' : 'bleu', dilemme: d < 2, barres: 2 + (d % 4 === 3 ? 1 : 0), mot: motDe(d),
})));
// (aucune carte là où se posent le cartouche et l'œil : x < 480 et y < 150 ; autour de (1 700, 120) ; on regarde la
// place à mi-recul)
const libre = p => {
  const z = .9, x0 = 960 + (p.x - 960) * z, y0 = 415 + (p.y - 415) * z, x1 = x0 + CW * z, y1 = y0 + CH * z;
  if (x0 < 480 && y0 < 150) return false;
  return !(x1 > 1590 && x0 < 1810 && y0 < 230 && y1 > 10);
};
function carteDe(w, p) {
  const V = VAGUES[w];
  if (p.i === V.origine) return DESSINS[w % 2];
  if (!libre(p) || hache(w * 977 + p.i * 31 + 7) > .62) return null;
  return DESSINS[2 + Math.floor(hache(w * 131 + p.i * 17 + 3) * 22)];
}
const tCarte = (w, p) => vague(p.i, VAGUES[w].origine, VAGUES[w].t0, VAGUES[w].pas);
// chaque dessin, une fois, dans une toile (à T = 0 : la même image quel que soit l'instant où on la fait)
const TOILES = new Map();
function toileCarte(d) {
  let c = TOILES.get(d.i);
  if (!c) {
    c = toile(CW + 8, CH + 8);
    const g = c.getContext('2d');
    carte(g, 0, { i: d.i, camp: d.camp, dilemme: d.dilemme, barres: d.barres, retrait: false }, 4, 4, CW, { mot: d.mot, motA: d.mot ? 1 : 0 });
    TOILES.set(d.i, c);
  }
  return c;
}
// le recul (dans le monde : autour du milieu de la zone utile)
export const zVagues = T => lerp(1, .8, eIO(seg(T, BORNES.P70[0], BORNES.P70[1])));
const versEcran = (T, x, y) => { const z = zVagues(T); return { x: 960 + (x - 960) * z, y: 415 + (y - 415) * z }; };
// le centre d'une carte à l'écran ; la première et la dernière carte d'une vague (l'œil va de l'une à l'autre)
export const centreCarteVague = (T, p) => versEcran(T, p.x + CW / 2, p.y + CH / 2);
export function bornesVague(w) {
  const V = VAGUES[w], o = PAR_I.get(V.origine);
  let loin = o, dl = -1;
  for (const p of PLACES) { if (!carteDe(w, p)) continue; const d = tCarte(w, p); if (d > dl && p.x > -100 && p.x < 1800 && p.y > 0 && p.y < 700) { dl = d; loin = p; } }
  return { origine: o, loin, t0: V.t0, tLoin: dl, fin: dl + V.tient };
}
// les anneaux d'une vague (pour le son) : l'instant de chacun, et le reflux
export function anneauxVague(w) {
  const V = VAGUES[w], ds = new Set();
  for (const p of PLACES) if (carteDe(w, p)) ds.add(Math.round((tCarte(w, p) - V.t0) / V.pas));
  return { anneaux: [...ds].sort((a, b) => a - b).map(d => +(V.t0 + d * V.pas).toFixed(3)), reflux: +(V.t0 + Math.max(...ds) * V.pas + V.tient).toFixed(3) };
}
export function virus(ctx, T) {
  fond(ctx, T, FOND_NUIT); noir(ctx, .45);
  const z = zVagues(T);
  ctx.save(); ctx.translate(960, 415); ctx.scale(z, z); ctx.translate(-960, -415);
  const lisse0 = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = true;
  VAGUES.forEach((V, w) => {
    if (T < V.t0) return;
    for (const p of PLACES) {
      const d = carteDe(w, p); if (!d) continue;
      const ta = tCarte(w, p), a = seg(T, ta, ta + .2) * (1 - seg(T, ta + V.tient, ta + V.tient + .5));
      if (a <= .002) continue;
      const s = lerp(.86, 1, eBack(seg(T, ta, ta + .28))), cx = p.x + CW / 2, cy = p.y + CH / 2;
      ctx.globalAlpha = a;
      ctx.drawImage(toileCarte(d), cx - (CW / 2 + 4) * s, cy - (CH / 2 + 4) * s, (CW + 8) * s, (CH + 8) * s);
    }
  });
  ctx.imageSmoothingEnabled = lisse0;
  ctx.restore(); ctx.globalAlpha = 1;
  pied(ctx);
}
// le pied de l'image (au montage) : sous la zone utile, les cartes s'enfoncent dans la nuit, comme le mur de P06–P07
// (plans/ouverture.js, pied, recopié) ; sans lui, celles de la dernière rangée se lisaient à travers la boîte XPHI
function pied(ctx) {
  const g = ctx.createLinearGradient(0, ZONE_UTILE - 40, 0, ZONE_UTILE + 35);   // nuit pleine sous le haut de la boîte
  g.addColorStop(0, rgba(NUIT, 0)); g.addColorStop(1, rgba(NUIT, .97));
  ctx.fillStyle = g; ctx.fillRect(0, ZONE_UTILE - 40, W, H - ZONE_UTILE + 40);
}
export { PAR_I as PLACES_VAGUES, VAGUES };

// ================================================================ P71 · avant tout, la description
// la mise en page du tirage (plans/tirage-colonnes.js : FEN, DY ; non importée : un autre lot) : les fenêtres en
// y 146–336, les grilles GRILLE(cx, i) + 40, cs 3 ; le filet en x 960
const FEN = Object.freeze([Object.freeze({ x: 80, y: 146, w: 780, h: 190 }), Object.freeze({ x: 1060, y: 146, w: 780, h: 190 })]);
const DY = 40, CX = COLONNES.grilles, CS3 = COLONNES.cs;
export const placeGrille = (j, i) => { const [x, y] = GRILLE(CX[j], i); return { x, y: y + DY }; };
// la part bleue du sujet i dans la grille j (resultats.js, partJauge : non exportée, recopiée ; RANG[0] pour les deux)
function partBleue(j, i) {
  const F = D.FIGURES[j ? 'B' : 'A'], r = R.RANG[0][i];
  return r < F.bleus ? 1 : F.part > 0 && r === F.bleus ? F.part : 0;
}
export const centreFenetre = j => ({ x: FEN[j].x + FEN[j].w / 2, y: FEN[j].y + FEN[j].h / 2 });
export const basFenetre = j => ({ x: FEN[j].x + FEN[j].w / 2, y: FEN[j].y + FEN[j].h + 8 });
export const KANT71 = Object.freeze({ x: 880, y: 520 }), POURCENT = Object.freeze({ x: 1040, y: 520 });
// les pointillés de Kant (vers la grille A) et du « % » (vers la grille B) : cinq sujets chacun, tirés par hache
const VISES = Object.freeze([0, 1].map(j => Object.freeze([...Array(5).keys()].map(k => Math.floor(hache(j * 53 + k * 19 + 5) * 100)))));
// le fil du sujet i de la grille j : d'où il part (le bas de la fenêtre), l'instant où il part, où il arrive
const tFil = (j, i) => S.cause + j * .05 + Math.floor(i / 10) * .07 + (i % 10) * .012;
export const D_FIL = .3;
function origineFil(j, i) {
  const F = FEN[j], c = i % 10, r = Math.floor(i / 10);
  return { x: lerp(F.x + 46, F.x + F.w - 46, (c + .5) / 10) + (r - 4.5) * 5, y: F.y + F.h + 8 };
}
const teteSujet = (j, i) => { const p = placeGrille(j, i); return { x: p.x, y: p.y - 3 * CS3 - 4 }; };
// les instants où chaque fil atteint sa tête (pour la pluie de tic) : [{ t, x }]
export const ARRIVEES_FILS = Object.freeze([0, 1].flatMap(j => [...Array(100).keys()].map(i => Object.freeze({ t: +(tFil(j, i) + D_FIL).toFixed(3), x: placeGrille(j, i).x, j }))).sort((a, b) => a.t - b.t));
export const finFils = () => ARRIVEES_FILS[ARRIVEES_FILS.length - 1].t;
// le fil le plus récent qui arrive (l'œil suit la pluie), ou null
export function filQuiArrive(T, j) {
  let best = null;
  for (let i = 0; i < 100; i++) { const t = tFil(j, i); if (t <= T && (!best || t > best.t)) best = { t, i }; }
  return best ? teteSujet(j, best.i) : null;
}
// « lue en premier » (plans/tirage-colonnes.js, etiquettesPremier, recopiée : la même étiquette, à la même place)
function etiquettesPremier(ctx, T) {
  ctx.font = `500 16px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const txt = 'lue en premier', w = ctx.measureText(txt).width + 24;
  [0, 1].forEach(j => {
    const t = S.lue + j * .25; if (T < t) return;
    const F = FEN[j], x = j === 0 ? F.x + 16 : F.x + F.w - 16 - w, y = F.y + F.h + 10 - 8 * (1 - eBack(seg(T, t, t + .3)));
    ctx.globalAlpha = seg(T, t, t + .2);
    ctx.fillStyle = 'rgba(12,11,13,.92)'; ctx.fillRect(x, y, w, 24);
    ctx.strokeStyle = LAITON; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, 24);
    ctx.fillStyle = LAITON; ctx.fillText(txt, x + 12, y + 17);
  });
  ctx.globalAlpha = 1;
}
export const etiquettePremier = j => ({ x: j === 0 ? FEN[0].x + 80 : FEN[1].x + FEN[1].w - 80, y: FEN[j].y + FEN[j].h + 22 });
export function description(ctx, T, oeilXY) {
  fond(ctx, T, { sol: .4, centre: [960, 470] });
  filetSousOeil(ctx, T, OEIL.colonnes, COLONNES.filet.y1);
  fenetreDescription(ctx, T, 'A', FEN[0].x, FEN[0].y, FEN[0].w, FEN[0].h);
  fenetreDescription(ctx, T, 'B', FEN[1].x, FEN[1].y, FEN[1].w, FEN[1].h);
  // les fils (sous les sujets : ils passent derrière eux et s'attachent à leur tête)
  if (T >= S.cause) {
    ctx.save(); ctx.strokeStyle = CRAIE; ctx.lineWidth = 1; ctx.globalAlpha = .55; ctx.beginPath();
    for (const j of [0, 1]) for (let i = 0; i < 100; i++) {
      const k = eOut(seg(T, tFil(j, i), tFil(j, i) + D_FIL)); if (k <= 0) continue;
      const o = origineFil(j, i), h = teteSujet(j, i);
      ctx.moveTo(Math.round(o.x) + .5, o.y); ctx.lineTo(Math.round(lerp(o.x, h.x, k)) + .5, lerp(o.y, h.y, k));
    }
    ctx.stroke(); ctx.restore();
  }
  // les deux grilles, colorées par les résultats (la décimale : un sujet de deux couleurs, coupeSujet)
  for (const j of [0, 1]) {
    const haut = basFenetre(j);
    for (let i = 0; i < 100; i++) {
      const p = placeGrille(j, i), fb = partBleue(j, i), tf = tFil(j, i) + D_FIL;
      const e = { phi: oeilXY, cible: T >= tf ? haut : oeilXY, fixe: T >= tf, reflet: true };
      if (fb >= 1 || fb <= 0) { dessineSujet(ctx, PREMIERS[i], p.x, p.y, CS3, { ...e, col: fb >= 1 ? BLEU : ROUGE }, T); continue; }
      ctx.save(); coupeSujet(ctx, p.x, fb, true, CS3); dessineSujet(ctx, PREMIERS[i], p.x, p.y, CS3, { ...e, col: BLEU }, T); ctx.restore();
      ctx.save(); coupeSujet(ctx, p.x, fb, false, CS3); dessineSujet(ctx, PREMIERS[i], p.x, p.y, CS3, { ...e, col: ROUGE }, T); ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
  // Kant et les probabilités : une vignette, un « % », des pointillés qui pâlissent aussitôt
  const ak = seg(T, S.kant, S.kant + .3) * lerp(1, .45, seg(T, S.cause, S.cause + .6));
  if (ak > 0) portrait(ctx, T, 'kant', KANT71.x, KANT71.y, 4, { col: GRIS, a: ak, phi: oeilXY, cible: oeilXY });
  const ap = seg(T, S.proba, S.proba + .3) * lerp(1, .45, seg(T, S.cause, S.cause + .6));
  if (ap > 0) { ctx.globalAlpha = ap; ctx.font = `40px ${PIX}`; ctx.fillStyle = GRIS; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('%', POURCENT.x, POURCENT.y); ctx.globalAlpha = 1; }
  [[S.kant, KANT71, 0], [S.proba, POURCENT, 1]].forEach(([t0, O, j]) => {
    VISES[j].forEach((i, k) => {
      const t = t0 + .15 + k * .1, kk = eOut(seg(T, t, t + .25)), a = .75 * kk * (1 - seg(T, t + .3, t + 1.2));
      if (a <= .002) return;
      const h = teteSujet(j, i);
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = GRIS; ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(O.x, O.y); ctx.lineTo(lerp(O.x, h.x, kk), lerp(O.y, h.y, kk)); ctx.stroke(); ctx.restore();
    });
  });
  etiquettesPremier(ctx, T);
}
export const VISES_TETES = Object.freeze(VISES.map((L, j) => Object.freeze(L.map(i => teteSujet(j, i)))));
