/* ==========================================================================
   Les deux pilules, l'épisode — plans/ecarts-morale.js : P65–P69
   Partie 3 · Mauvais ou méchants : la dispute floutée, Nietzsche, le mauvais
   et le méchant, les deux colonnes, l'insulte.

   - P65 : le fil en deux colonnes de P05 (commun.js : colonnesFil, ses cartes,
     ses mots), FLOUTÉ par la machine : tout le fil est dessiné dans une toile
     douze fois plus petite, puis agrandi sans lissage (colonnesFil, o.flou :
     mosaique ; jamais getImageData) ; des carrés de 12 px exacts, on devine
     les avatars bleus et rouges. Les flèches de réponse de P05 (recopiées de
     plans/ouverture.js, FLECHES) passent encore, nettes, d'une colonne à
     l'autre, l'une après l'autre ; sur « se détestent-ils », toutes clignotent
     ensemble. La nuit assombrie de P05 ; l'œil au sommet du filet, le filet
     interrompu autour de lui (comme P05).
   - P66 : le fil recule (×0,92) et s'assombrit à 30 % ; l'œil vient en
     (1 180, 280, 180). Un petit terminal tape « > ouvrir
     généalogie_de_la_morale » ; dans la fenêtre « NIETZSCHE » (le gabarit de
     celle de Kant, x 1 360–1 780, y 60–540), le portrait se calcule rangée
     par rangée, comme Kant en P19 (commun.js : portrait, PORTRAITS.nietzsche,
     la moustache), jusqu'à son nom ; l'étiquette LABO « NIETZSCHE ». « BON »
     (560, 300), deux traits LAITON, « MAUVAIS » (300, 480), « MÉCHANT »
     (820, 480), chacun sur son mot.
   - P67 : sous chaque mot, trois sujets de démonstration (DEMO, cs 8, gris).
     Le mauvais saute… et rate : il retombe accroupi, de travers (l'image
     penchée de 9°, des cases exactes), regarde ses pieds, un « ? » ; ses deux
     voisins s'approchent (deux pas), l'un lui tend la main (POSES_EP.tend), il
     lève les yeux vers lui. Le méchant : une bulle de pensée où un tout petit
     sujet part en caractères (la dissolution du film, en boucle) ; il ne fait
     rien d'autre ; ses voisins reculent (deux pas secs) et le montrent du
     doigt (POSES_EP.montre), un « ! » au-dessus de chacun.
   - P68 : DEUX COLONNES de part et d'autre du filet laiton (x 960), LA BLEUE À
     GAUCHE (la règle de l'épisode, même sous Nietzsche) : la pilule bleue en
     (480, 150), ps 0,45, et « BON / MÉCHANT » ; la pilule rouge en
     (1 440, 150) et « BON / MAUVAIS » (DotGothic16 44 px, CRAIE, le « / » en
     GRIS ; chaque mot centré à 150 px de l'axe de sa colonne, baseline
     y 318). Sous chaque mot un sujet ×3 (cs 12, centré en y 540) : à gauche
     un bleu sous « BON » (330), un rouge sous « MÉCHANT » (630) ; à droite un
     rouge sous « BON » (1 290), un bleu sous « MAUVAIS » (1 590). La colonne
     rouge d'abord (la bleue à 50 %) : « BON » en LABO, le ✓ au-dessus du
     rouge, le bleu penaud et son « ? », le rouge qui s'approche (deux pas,
     jusqu'en 1 440) et lui tend la main ; puis la colonne bleue (la rouge à
     50 %) : « BON » en LABO, les anneaux du signal (la rime de P30 :
     plans/kant-outils.js, ondes, recopiée), le bleu qui montre du doigt le
     rouge, « ! ». (Le lot fin reprend ces deux colonnes en petit, en P77.)
   - P69 : les deux colonnes à pleine lumière. Une bulle « MÉCHANT » part du
     bleu vers le rouge (en haut, y 372), une bulle « MAUVAIS » du rouge vers
     le bleu (dessous, y 436) ; elles avancent jusqu'au filet, attendent, puis
     se croisent sur « comme une insulte » : chaque lettre, en passant le
     filet, tourne sur elle-même et devient un caractère de Phi (# % * x) ;
     celui qui reçoit sursaute (la peur 0,4 s, les grands yeux, un saut en
     arrière) et se détourne.

   Repris : commun.js (colonnesFil, carte, FIL_COLONNES, CARTES_COLONNES,
   CARTE_H, CARTE_GAP, filet, flechePixel, terminal, portrait, PORTRAITS,
   etiquette, POSES_EP, bulle, pilule, signe, dessineSujet, DEMO, fond,
   FOND_NUIT) ; recopiés : les flèches de P05 (plans/ouverture.js, FLECHES,
   bordCarte), les anneaux du signal (plans/kant-outils.js, ondes), la tête
   d'impression du portrait (plans/kant.js, teteImpression).
   ========================================================================== */
import {
  W, H, CRAIE, GRIS, GRIS_FIG, LABO, LAITON, BLEU, BLEU_TXT, ROUGE, PIX, SW, SH,
  clamp, lerp, seg, eIO, eOut, eBack, hache, fond, FOND_NUIT, fenetre, dessineSujet, DEMO, pilule, signe,
  filet, flechePixel, etiquette, terminal, portrait, POSES_EP, bulle, colonnesFil,
  FIL_COLONNES, CARTES_COLONNES, CARTE_H, CARTE_GAP,
} from '../commun.js';
import { S, BORNES, OEIL } from './ecarts-temps.js';

const noir = (ctx, a) => { if (a <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; };
// le filet laiton, interrompu autour de l'œil quand il est posé dessus (plans/ouverture.js, filetSousOeil, recopié)
export function filetSousOeil(ctx, T, O, y1 = 830, a = 1) {
  const cy = O.y + Math.sin(T * .9) * 4;   // flotte(T) de commun.js : le vrai centre de l'œil
  if (Math.abs(O.x - 960) < 2) {
    const h0 = cy - O.taille * .5 - 8, h1 = cy + O.taille * .5 + 8;
    filet(ctx, 960, 0, Math.min(y1, h0), a); if (y1 > h1) filet(ctx, 960, h1, y1, a);
  } else filet(ctx, 960, 0, y1, a);
}

// ================================================================ P65–P67 · le fil de P05, flouté
const yCol = k => 40 + k * (CARTE_H + CARTE_GAP);
// les flèches de réponse de P05 (plans/ouverture.js, FLECHES : de la carte qui parle vers la carte d'en face)
const FLECHES = Object.freeze([
  { de: [0, 1], vers: [1, 1], dy: -22 }, { de: [0, 2], vers: [1, 2], dy: -22 },
  { de: [1, 1], vers: [0, 1], dy: 22 }, { de: [1, 3], vers: [0, 3], dy: 22 },
]);
const bordCarte = ([col, k], cote, dy = 0) => {
  const C = FIL_COLONNES[col], c = CARTES_COLONNES[col][k];
  return { x: cote > 0 ? C.x + C.w : C.x + (c.retrait ? 40 : 0), y: yCol(k) + CARTE_H / 2 + dy };
};
// les flèches passent l'une après l'autre (une toutes les 0,85 s, dans l'ordre de P05) ; n : le créneau, F : la flèche
const PAS_FLECHE = .85;
const creneauFleche = T => Math.floor((T - S.revenons) / PAS_FLECHE);
const flecheDe = n => FLECHES[((n % 4) + 4) % 4];
function geoFleche(F) {
  const gauche = F.de[0] === 0, A = bordCarte(F.de, gauche ? 1 : -1, F.dy), B = bordCarte(F.vers, gauche ? -1 : 1, F.dy);
  const L = Math.hypot(B.x - A.x, B.y - A.y), ux = (B.x - A.x) / L, uy = (B.y - A.y) / L;
  return { x0: A.x + ux * 6, y0: A.y + uy * 6, x1: B.x - ux * 6, y1: B.y - uy * 6 };
}
// la pointe de la flèche qui part (l'œil la suit), ou null
export function flecheQuiPasse(T) {
  if (T < S.revenons || T >= BORNES.P66[0]) return null;
  const n = creneauFleche(T), t0 = S.revenons + n * PAS_FLECHE, g = geoFleche(flecheDe(n)), k = eOut(seg(T, t0, t0 + .35));
  return { x: lerp(g.x0, g.x1, k), y: lerp(g.y0, g.y1, k) };
}
function fleches(ctx, T) {
  if (T < S.revenons) return;
  const clig = T >= S.detestent && T < S.detestent + .84;
  if (clig) {   // « se détestent-ils » : toutes ensemble, trois fois
    const on = Math.floor((T - S.detestent) / .14) % 2 === 0;
    for (const F of FLECHES) { const g = geoFleche(F); flechePixel(ctx, g.x0, g.y0, g.x1, g.y1, { col: CRAIE, lw: 1.5, a: on ? 1 : .2, c: 4 }); }
    return;
  }
  const n = creneauFleche(T);
  for (const m of [n - 1, n]) {
    const t0 = S.revenons + m * PAS_FLECHE; if (t0 < S.revenons || T < t0) continue;
    if (t0 < S.detestent + .84 && t0 + 1.4 > S.detestent) continue;   // pas de flèche « en plus » pendant le clignement
    const g = geoFleche(flecheDe(m)), k = eOut(seg(T, t0, t0 + .35)), a = 1 - seg(T, t0 + .7, t0 + 1.4);
    if (a > 0) flechePixel(ctx, g.x0, g.y0, g.x1, g.y1, { col: CRAIE, lw: 1.5, k, a, c: 4 });
  }
}
// le fil flouté : o.a (son alpha), o.z (le recul, autour du milieu de la zone utile). L'alpha est celui de la mosaïque
// entière (la petite toile posée avec ctx.globalAlpha), pas celui des cartes : carte() de commun.js dessine son avatar
// sans son o.a (dessineSujet sans « a »), qui resterait plein dans une carte à 30 %.
function filFloute(ctx, T, o = {}) {
  const z = o.z ?? 1;
  ctx.save();
  if (z !== 1) { ctx.translate(960, 415); ctx.scale(z, z); ctx.translate(-960, -415); }
  ctx.globalAlpha = o.a ?? 1;
  colonnesFil(ctx, T, { flou: 12, filet: false, a: 1, mots: 1 });
  ctx.restore(); ctx.globalAlpha = 1;
}
export function messagesFloutes(ctx, T) {
  fond(ctx, T, FOND_NUIT); noir(ctx, .5);
  filFloute(ctx, T);
  filetSousOeil(ctx, T, OEIL.filet);
  fleches(ctx, T);
}

// ================================================================ P66–P67 · Nietzsche
const FN = Object.freeze({ x: 1360, y: 60, w: 420, h: 480 });   // la fenêtre NIETZSCHE (le gabarit de celle de Kant)
const PN = Object.freeze({ x: 1570, y: 60 + 24 + SH * 32 / 2, cs: 32 });
const TN = Object.freeze({ x: 1180, y: 580, w: 620, h: 74, taille: 22, lh: 32, marge: 18 });
const L_OUVRIR = Object.freeze({ t0: S.terminal, txt: '> ouvrir généalogie_de_la_morale', col: CRAIE, cps: 24 });
export const MOTS = Object.freeze({
  bon: Object.freeze({ txt: 'BON', x: 560, y: 300, z: 72, t: S.bon }),
  mauvais: Object.freeze({ txt: 'MAUVAIS', x: 300, y: 480, z: 48, t: S.mauvais }),
  mechant: Object.freeze({ txt: 'MÉCHANT', x: 820, y: 480, z: 48, t: S.mechant }),
});
const TRAITS = Object.freeze([[560, 346, 336, 442], [560, 346, 784, 442]]);
const rangeesN = T => (T < S.calcul ? 0 : T >= S.nom ? SH : Math.floor(SH * seg(T, S.calcul, S.nom)));
// la tête d'impression (plans/kant.js, teteImpression, recopiée) : où en est la rangée en cours, ou null
export function teteImpression(T) {
  if (T < S.calcul || T >= S.nom) return null;
  const u = SH * seg(T, S.calcul, S.nom), r = Math.floor(u), k = u - r, haut = PN.y - SH * PN.cs / 2;
  return { x: PN.x - SW * PN.cs / 2 + k * SW * PN.cs, y: haut + (r + .5) * PN.cs };
}
export const visageNietzsche = Object.freeze({ x: PN.x, y: PN.y - 2.5 * PN.cs });
export const plumeTerminalN = T => {
  if (T < S.terminal) return null;
  const n = Math.floor((T - S.terminal) * L_OUVRIR.cps); if (n >= [...L_OUVRIR.txt].length) return null;
  return { x: TN.x + TN.marge + n * 13.2, y: TN.y + TN.marge + TN.taille * .6 };
};
// les rangées du portrait, pour le son : l'instant où chacune est calculée
export const RANGEES_N = Object.freeze([...Array(SH).keys()].map(r => +(S.calcul + (r + 1) / SH * (S.nom - S.calcul)).toFixed(3)));
function mot(ctx, T, M) {
  const k = seg(T, M.t, M.t + .3); if (k <= 0) return;
  const s = lerp(.8, 1, eBack(k));
  ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate(M.x, M.y); ctx.scale(s, s);
  ctx.font = `${M.z}px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(M.txt, 0, 0);
  ctx.restore(); ctx.globalAlpha = 1;
}
function nietzsche(ctx, T, oeilXY) {
  const ko = eOut(seg(T, S.terminal - .15, S.terminal + .25));
  if (ko > 0) { const hh = FN.h * ko; fenetre(ctx, FN.x, FN.y + (FN.h - hh) / 2, FN.w, hh, ko); ctx.globalAlpha = 1; }
  if (ko >= 1) {
    // la grille des cases à calculer (des points LABO), qui s'efface quand le portrait est là (comme Kant)
    const ag = .22 * (1 - seg(T, S.nom, S.nom + .8));
    if (ag > .001) {
      const x0 = PN.x - SW * PN.cs / 2, y0 = PN.y - SH * PN.cs / 2;
      ctx.globalAlpha = ag; ctx.fillStyle = LABO;
      for (let j = 0; j <= SH; j++) for (let i = 0; i <= SW; i++) ctx.fillRect(x0 + i * PN.cs - 1, y0 + j * PN.cs - 1, 2, 2);
      ctx.globalAlpha = 1;
    }
    // ce qu'il regarde : Phi une fois calculé ; « BON » quand il paraît, puis Phi
    const regardeMot = T >= S.bon && T < S.mechant + 1.2;
    const cible = regardeMot ? { x: MOTS.bon.x, y: MOTS.bon.y } : oeilXY;
    portrait(ctx, T, 'nietzsche', PN.x, PN.y, PN.cs, { rangees: rangeesN(T), balayage: true, phi: oeilXY, cible, fixe: T >= S.nom + .3, reflet: T >= S.nom + .3 && !regardeMot });
    const tp = teteImpression(T);
    if (tp) { ctx.globalAlpha = .9; ctx.fillStyle = LABO; ctx.fillRect(Math.round(tp.x) - 4, Math.round(tp.y) - 4, 8, 8); ctx.globalAlpha = 1; }
    etiquette(ctx, 'NIETZSCHE', PN.x, FN.y + FN.h - 54, seg(T, S.nom - .1, S.nom + .25));
  }
  terminal(ctx, T, [L_OUVRIR], { ...TN, a: ko });
}
function motsNietzsche(ctx, T) {
  mot(ctx, T, MOTS.bon);
  TRAITS.forEach(([x0, y0, x1, y1], j) => {
    const k = eOut(seg(T, S.contraires + j * .12, S.contraires + j * .12 + .35)); if (k <= 0) return;
    ctx.save(); ctx.strokeStyle = LAITON; ctx.lineWidth = 3; ctx.lineCap = 'square';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, k), lerp(y0, y1, k)); ctx.stroke(); ctx.restore();
  });
  mot(ctx, T, MOTS.mauvais);
  mot(ctx, T, MOTS.mechant);
}
// ---------------------------------------------------------------- P67 · le mauvais, le méchant : deux petites scènes
const CS8 = 8, PIEDS = 700, CY8 = PIEDS - SH * CS8 / 2;
const SCENES = Object.freeze({
  mauvais: Object.freeze({ cx: 300, lui: DEMO[12], voisins: [DEMO[33], DEMO[71]] }),
  mechant: Object.freeze({ cx: 820, lui: DEMO[58], voisins: [DEMO[24], DEMO[86]] }),
});
const BULLE_PENSEE = Object.freeze({ x: 880, y: 512, w: 150, h: 84 });
const PETIT = DEMO[5];
// un pas : la place glisse de a à b entre t et t + d, avec un petit bond (une demi-case)
const pas = (T, t, a, b, d = .3) => { const k = seg(T, t, t + d); return { x: lerp(a, b, eIO(k)), dy: -Math.sin(Math.PI * k) * .5 }; };
// où est le voisin j (0 à gauche, 1 à droite) de la scène, et son bond
function placeVoisin(scene, j, T) {
  const sg = j ? 1 : -1, sc = SCENES[scene];
  if (scene === 'mauvais') {   // deux pas vers lui : de ±170 à ±104
    const p1 = pas(T, S.plaint, sc.cx + sg * 170, sc.cx + sg * 137), p2 = pas(T, S.plaint + .35, sc.cx + sg * 137, sc.cx + sg * 104);
    return T < S.plaint + .35 ? p1 : p2;
  }
  // deux pas secs en arrière : de ±170 à ±236
  const p1 = pas(T, S.blame, sc.cx + sg * 170, sc.cx + sg * 203, .18), p2 = pas(T, S.blame + .24, sc.cx + sg * 203, sc.cx + sg * 236, .18);
  return T < S.blame + .24 ? p1 : p2;
}
export const teteMauvais = Object.freeze({ x: SCENES.mauvais.cx + 6, y: CY8 - 2 * CS8 });
export const teteMechant = Object.freeze({ x: SCENES.mechant.cx, y: CY8 - 3 * CS8 });
export const teteVoisin = (scene, j, T) => { const p = placeVoisin(scene, j, T); return { x: p.x, y: CY8 - 3 * CS8 }; };
export const centreBullePensee = Object.freeze({ x: BULLE_PENSEE.x + BULLE_PENSEE.w / 2, y: BULLE_PENSEE.y + BULLE_PENSEE.h / 2 });
const tSaut = () => S.rate + .15;   // le saut du film : accroupi 0,16 s avant, en l'air jusqu'à + 0,3, retombé à + 0,42
function scenes(ctx, T, oeilXY) {
  const a = seg(T, S.p67, S.p67 + .3); if (a <= 0) return;
  const base = { col: GRIS_FIG, a, phi: oeilXY, reflet: true };
  // ---- le mauvais
  const sm = SCENES.mauvais, ts = tSaut(), atterri = ts + .3;
  sm.voisins.forEach((f, j) => {
    const p = placeVoisin('mauvais', j, T), regarde = T >= S.rate && T < BORNES.P68[0];
    const e = { ...base, cible: teteMauvais, fixe: regarde };
    // le voisin de gauche lui tend la main (on le plaint)
    if (j === 0 && T >= S.plaint + .75) Object.assign(e, POSES_EP.tend(1));
    dessineSujet(ctx, f, p.x, CY8 + p.dy * CS8, CS8, e, T);
  });
  {
    let e = { ...base, cible: oeilXY }, x = sm.cx, rot = 0;
    if (T >= ts - .16 && T < atterri) { e.mode = 'saut'; e.t0 = ts; x = sm.cx + 6 * seg(T, ts - .04, ts + .3); }
    else if (T >= atterri) {
      x = sm.cx + 6;
      // retombé de travers : accroupi, l'image penchée, puis il regarde ses pieds (penaud), toujours un peu penché
      const k = T - atterri;
      rot = -9 * (k < .5 ? 1 : lerp(1, .5, seg(k, .5, 1)));
      e.mode = 'penaud';
      if (k < .5) e.p = { acc: 1, bob: 0 };
      // on lui tend la main : il lève les yeux vers celui qui la tend
      if (T >= S.plaint + 1.05) { e.mode = 'repos'; e.fixe = true; e.cible = teteVoisin('mauvais', 0, T); rot = lerp(rot, 0, seg(T, S.plaint + 1.05, S.plaint + 1.4)); }
    }
    if (rot) {
      ctx.save(); ctx.translate(x, PIEDS); ctx.rotate(rot * Math.PI / 180); ctx.translate(-x, -PIEDS);
      dessineSujet(ctx, sm.lui, x, CY8, CS8, e, T); ctx.restore();
    } else dessineSujet(ctx, sm.lui, x, CY8, CS8, e, T);
    // le « ? » au-dessus de lui
    const aq = seg(T, atterri + .25, atterri + .5) * (1 - seg(T, S.plaint + 1.05, S.plaint + 1.4));
    if (aq > 0) { ctx.globalAlpha = aq * a * (.65 + .35 * Math.sin(T * 4)); ctx.font = `34px ${PIX}`; ctx.fillStyle = GRIS; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText('?', x + 4, CY8 - SH * CS8 / 2 - 12); ctx.globalAlpha = 1; }
  }
  // ---- le méchant
  const sc = SCENES.mechant;
  sc.voisins.forEach((f, j) => {
    const p = placeVoisin('mechant', j, T), recule = T >= S.blame;
    const e = { ...base, cible: recule ? teteMechant : (T >= S.veut + .3 ? centreBullePensee : oeilXY), fixe: T >= S.veut + .3 };
    if (T >= S.blame + .5) Object.assign(e, POSES_EP.montre(j ? -1 : 1));
    dessineSujet(ctx, f, p.x, CY8 + p.dy * CS8, CS8, e, T);
    const ae = seg(T, S.blame + .55, S.blame + .7);
    if (ae > 0) { ctx.globalAlpha = ae * a; ctx.font = `34px ${PIX}`; ctx.fillStyle = GRIS; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText('!', p.x, CY8 - SH * CS8 / 2 - 12); ctx.globalAlpha = 1; }
  });
  // lui : il ne fait rien d'autre que penser (il regarde devant lui, immobile)
  dessineSujet(ctx, sc.lui, sc.cx, CY8, CS8, { ...base, cible: oeilXY, fixe: T >= S.veut }, T);
  // sa bulle de pensée : un tout petit sujet qui part en caractères (ce qu'il veut), en boucle
  const kb = seg(T, S.veut, S.veut + .35);
  if (kb > 0) {
    const B = BULLE_PENSEE;
    bulle(ctx, B.x, B.y, B.w, B.h, { type: 'pensee', queue: { x: sc.cx + 26, y: CY8 - SH * CS8 / 2 + 6 }, k: kb, a });
    if (kb >= 1) {
      // en boucle (2,4 s) : il a peur (0,5 s), part en caractères (1,5 s), puis l'envers le recompose (0,4 s)
      const u = ((T - S.veut - .35) % 2.4 + 2.4) % 2.4, dis = u < .5 ? 0 : u < 2 ? seg(u, .5, 2) : 1 - seg(u, 2, 2.4);
      ctx.save(); ctx.beginPath(); ctx.rect(B.x + 4, B.y + 4, B.w - 8, B.h - 8); ctx.clip();
      dessineSujet(ctx, PETIT, B.x + B.w / 2, B.y + B.h / 2 + 8, 4, { col: GRIS_FIG, a, mode: 'peur', dis }, T);
      ctx.restore();
    }
  }
}
// P66–P67 : le fil recule et s'assombrit ; la fenêtre ; les mots ; les scènes
export function genealogie(ctx, T, oeilXY) {
  fond(ctx, T, FOND_NUIT); noir(ctx, .5);
  const k = eIO(seg(T, BORNES.P66[0], BORNES.P66[0] + .8));
  filFloute(ctx, T, { a: lerp(1, .3, k), z: lerp(1, .92, k) });
  // le filet du fil recule avec lui, puis s'efface ; tant que l'œil le quitte, il reste interrompu autour de lui, comme
  // en P65 (filetSousOeil : jamais à travers l'œil)
  const z = lerp(1, .92, k), af = lerp(1, .3, k) * (1 - seg(T, BORNES.P66[0] + .4, BORNES.P66[0] + 1.2));
  ctx.save(); ctx.translate(960, 415); ctx.scale(z, z); ctx.translate(-960, -415);
  const r = (oeilXY.taille ?? 100) * .5 + 8;
  if (Math.abs(oeilXY.x - 960) < r) { const yo = 415 + (oeilXY.y - 415) / z; filet(ctx, 960, 0, yo - r / z, af); filet(ctx, 960, yo + r / z, 830, af); }
  else filet(ctx, 960, 0, 830, af);
  ctx.restore();
  nietzsche(ctx, T, oeilXY);
  motsNietzsche(ctx, T);
  scenes(ctx, T, oeilXY);
}

// ================================================================ P68–P69 · les deux colonnes
// LA BLEUE À GAUCHE : colonne 0, la bleue (BON / MÉCHANT) ; colonne 1, la rouge (BON / MAUVAIS)
export const COLS = Object.freeze([
  Object.freeze({ cx: 480, pil: 0, mots: ['BON', 'MÉCHANT'] }),
  Object.freeze({ cx: 1440, pil: 1, mots: ['BON', 'MAUVAIS'] }),
]);
const Y_MOTS = 318, Z_MOTS = 44, DX_MOT = 150, CS12 = 12, CY12 = 540;
export const teteY = CY12 - 3 * CS12;
// les quatre sujets (sujets de démonstration) : la place de départ sous leur mot, leur couleur
export const QUATRE = Object.freeze({
  bleuBon: Object.freeze({ f: DEMO[40], x: 330, col: BLEU }),
  rougeMechant: Object.freeze({ f: DEMO[61], x: 630, col: ROUGE }),
  rougeBon: Object.freeze({ f: DEMO[17], x: 1290, col: ROUGE }),
  bleuMauvais: Object.freeze({ f: DEMO[83], x: 1590, col: BLEU }),
});
// la lumière des colonnes : d'abord les deux ; la rouge seule pendant N09–N11 ; la bleue seule pendant N12–N13 ;
// les deux à pleine lumière en P69
export function lumiere(j, T) {
  const tr = S.rouges, ts = S.second, t9 = BORNES.P69[0];
  const baisse = (t0, t1) => lerp(1, .5, eIO(seg(T, t0, t0 + .5))) + .5 * eIO(seg(T, t1, t1 + .5));
  const v = j === 0 ? (T < ts ? baisse(tr, ts) : 1) : (T < ts ? 1 : lerp(1, .5, eIO(seg(T, ts, ts + .5))));
  return Math.min(1, T >= t9 ? lerp(v, 1, eIO(seg(T, t9, t9 + .4))) : v);
}
// la place du rouge « bon » : deux pas vers le bleu penaud (« un peu bêtes ») ; il y reste
export function xRougeBon(T) {
  const a = QUATRE.rougeBon.x;
  const p1 = pas(T, S.betes, a, a + 75), p2 = pas(T, S.betes + .4, a + 75, a + 150);
  return T < S.betes + .4 ? p1 : p2;
}
// les deux bulles de P69 et ceux qui les reçoivent
const B1 = Object.freeze({ txt: 'MÉCHANT', de: 'bleuBon', vers: 'rougeBon', y: 372, t0: () => S.blament, x0: 430, xw: 744, x1: 1330 });
const B2 = Object.freeze({ txt: 'MAUVAIS', de: 'rougeBon', vers: 'bleuBon', y: 436, t0: () => S.plaignent, x0: 1340, xw: 1176, x1: 440 });
const BW = 236, BH = 58, ZB = 30;
const tCroise = () => S.insulte - .45, D_CROISE = 1.3;
export const tRecu = () => tCroise() + D_CROISE;
// le centre de la bulle à l'instant T (null avant son départ, ou après son arrivée)
export function centreBulle(B, T) {
  const t0 = B.t0(), tc = tCroise();
  if (T < t0 || T >= tRecu() + .3) return null;
  const x = T < tc ? lerp(B.x0, B.xw, eOut(seg(T, t0 + .25, t0 + 2.4))) : lerp(B.xw, B.x1, eIO(seg(T, tc, tc + D_CROISE)));
  return { x, y: B.y + Math.sin((T - t0) * 3.1) * 3 * (1 - seg(T, tc, tc + .2)) };
}
export const BULLES = Object.freeze([B1, B2]);
// l'instant où le caractère d'abscisse dx (depuis le centre de la bulle) passe le filet (x 960), en croisant
const passeFilet = (B, dx) => {
  const tc = tCroise(), cible = 960 - dx, dir = Math.sign(B.x1 - B.xw);
  if ((cible - B.xw) * dir <= 0) return tc;
  if ((cible - B.x1) * dir >= 0) return Infinity;
  let a = 0, b = 1; for (let i = 0; i < 24; i++) { const m = (a + b) / 2; if ((lerp(B.xw, B.x1, eIO(m)) - cible) * dir < 0) a = m; else b = m; }
  return tc + D_CROISE * b;
};
const JURONS = '#%*x';
function bulleInsulte(ctx, T, B) {
  const c = centreBulle(B, T); if (!c) return;
  const t0 = B.t0(), k = seg(T, t0, t0 + .3), fin = 1 - seg(T, tRecu(), tRecu() + .3);
  // la queue : vers celui qui parle, tant que la bulle sort de lui ; ensuite elle s'en détache et file sans queue (une
  // queue vers l'arrière tomberait sur la tête du voisin, en passant)
  const xDe = B === B2 ? xRougeBon(T).x : QUATRE[B.de].x;
  const queue = T < t0 + .6 ? { x: xDe, y: teteY } : null;
  bulle(ctx, c.x - BW / 2, c.y - BH / 2, BW, BH, { type: 'parole', queue, k: k * fin, a: fin });
  if (k < 1 || fin <= 0) return;
  // les lettres, une à une : en passant le filet, chacune tourne sur elle-même et devient un juron de caractères
  ctx.save(); ctx.globalAlpha = fin; ctx.font = `${ZB}px ${PIX}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const chars = [...B.txt], ws = chars.map(ch => ctx.measureText(ch).width), tot = ws.reduce((s, v) => s + v, 0);
  let x = -tot / 2;
  chars.forEach((ch, i) => {
    const cx = x + ws[i] / 2; x += ws[i];
    const tp = passeFilet(B, cx), u = seg(T, tp, tp + .16);
    const glyphe = u < .5 ? ch : JURONS[Math.floor(hache(i * 7 + (B === B1 ? 3 : 11)) * JURONS.length)];
    const sx = Math.abs(Math.cos(Math.PI * u));   // il tourne : sa largeur passe par zéro au milieu du tour
    ctx.save(); ctx.translate(c.x + cx, c.y + 1); ctx.scale(Math.max(.05, sx), 1);
    ctx.fillStyle = CRAIE;
    ctx.fillText(glyphe, 0, 0);
    ctx.restore();
  });
  ctx.restore(); ctx.globalAlpha = 1;
}
function marque(ctx, txt, x, y, a, z = 40, col = GRIS) {
  if (a <= 0) return;
  ctx.globalAlpha = a; ctx.fillStyle = col; ctx.font = `${z}px ${PIX}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(txt, x, y); ctx.globalAlpha = 1;
}
// les anneaux du signal (plans/kant-outils.js, ondes, recopiée) : trois cercles exacts qui partent de (x, y) aux instants
// t0s et s'élargissent en d secondes jusqu'à r
function ondes(ctx, T, x, y, t0s, o = {}) {
  const d = o.d ?? 1.2, r = o.r ?? 640, col = o.col ?? BLEU;
  ctx.save(); ctx.lineWidth = o.lw ?? 2; ctx.strokeStyle = col;
  for (const t0 of t0s) {
    const k = seg(T, t0, t0 + d); if (k <= 0 || k >= 1) continue;
    ctx.globalAlpha = (o.a ?? .5) * (1 - k * k);
    ctx.beginPath(); ctx.arc(x, y, 10 + (r - 10) * eOut(k), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}
export const ANNEAUX = Object.freeze([0, .45, .9].map(d => d + S.bien));
function etatQuatre(cle, T, oeilXY) {
  const Q = QUATRE[cle], e = { col: Q.col, phi: oeilXY, cible: oeilXY, reflet: true };
  const tr = tRecu(), p69 = BORNES.P69[0];
  let x = Q.x, dy = 0;
  if (cle === 'rougeBon') {
    const p = xRougeBon(T); x = p.x; dy = p.dy;
    if (T >= S.correct && T < S.betes) { e.fixe = true; e.cible = oeilXY; }                       // fier : il regarde Phi
    if (T >= S.betes) { e.fixe = true; e.cible = { x: QUATRE.bleuMauvais.x, y: teteY }; }        // il va vers le bleu
    if (T >= S.regrettent && T < p69 + .3) Object.assign(e, POSES_EP.tend(1));                   // il lui tend la main
    if (T >= p69 + .3 && T < S.plaignent + 2) { e.fixe = true; e.cible = { x: QUATRE.bleuBon.x, y: teteY }; }   // il plaint l'autre bleu
  }
  if (cle === 'bleuMauvais') {
    if (T >= S.trompes + .1 && T < p69 + .3) e.mode = 'penaud';
    if (T >= S.regrettent + .5 && T < p69 + .3) { e.mode = 'prive'; e.cible = { x: xRougeBon(T).x, y: teteY + 30 }; }   // il voit la main
  }
  if (cle === 'bleuBon') {
    if (T >= S.bien - .2 && T < S.faute) { e.fixe = true; e.cible = oeilXY; }
    if (T >= S.faute && T < p69 + .3) { Object.assign(e, POSES_EP.montre(1)); e.fixe = true; e.cible = { x: QUATRE.rougeMechant.x, y: teteY }; }
    if (T >= p69 + .3 && T < tr) { e.fixe = true; e.cible = { x: xRougeBon(T).x, y: teteY }; }     // il blâme le rouge, d'en face
  }
  if (cle === 'rougeMechant' && T >= S.faute + .3 && T < p69 + .3) { e.fixe = true; e.cible = { x: QUATRE.bleuBon.x, y: teteY }; }
  // P69 : celui qui reçoit le jugement de l'autre sursaute (la peur, les grands yeux, un saut en arrière) et se détourne
  const recoit = cle === 'rougeBon' || cle === 'bleuBon';
  if (recoit && T >= tr) {
    const sens = cle === 'rougeBon' ? 1 : -1, k = T - tr;
    x += sens * 22 * eOut(seg(k, 0, .25)); dy -= Math.sin(Math.PI * seg(k, 0, .25)) * .8;
    if (k < .4) { e.mode = 'peur'; e.k = 1; e.yeux = 'g'; }
    else { e.mode = 'repos'; e.fixe = false; e.p = { ...(e.p || {}), yx: sens, yy: 0 }; }
  }
  return { e, x, dy };
}
export function deuxColonnes(ctx, T, oeilXY) {
  fond(ctx, T, { sol: .35, centre: [960, 470] });
  filetSousOeil(ctx, T, OEIL.filet);
  COLS.forEach((C, j) => {
    const a = lumiere(j, T), focus = (j === 1 && T >= S.rouges && T < S.second) || (j === 0 && T >= S.second && T < BORNES.P69[0]);
    pilule(ctx, T, C.pil, { x: C.cx, y: 150, ps: .45, a, hl: focus ? 1 : 0 });
    // « BON / MÉCHANT », « BON / MAUVAIS » ; « BON » en LABO quand sa colonne parle de lui
    const bonLabo = j === 1 ? seg(T, S.premier, S.premier + .3) : seg(T, S.second, S.second + .3);
    ctx.globalAlpha = a; ctx.font = `${Z_MOTS}px ${PIX}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = bonLabo > .5 && T < BORNES.P69[0] ? LABO : CRAIE; ctx.fillText(C.mots[0], C.cx - DX_MOT, Y_MOTS);
    ctx.fillStyle = GRIS; ctx.fillText('/', C.cx, Y_MOTS);
    ctx.fillStyle = CRAIE; ctx.fillText(C.mots[1], C.cx + DX_MOT, Y_MOTS);
    ctx.globalAlpha = 1;
  });
  // les anneaux du signal, derrière les sujets
  ondes(ctx, T, QUATRE.bleuBon.x, teteY + 6, ANNEAUX, { r: 330, d: 1.2, col: BLEU_TXT, a: .55 });
  for (const cle of Object.keys(QUATRE)) {
    const j = cle === 'bleuBon' || cle === 'rougeMechant' ? 0 : 1, { e, x, dy } = etatQuatre(cle, T, oeilXY);
    e.a = lumiere(j, T);
    dessineSujet(ctx, QUATRE[cle].f, x, CY12 + dy * CS12, CS12, e, T);
  }
  // les marques au-dessus des têtes : ✓ (le choix correct), « ? » (il s'est trompé), « ! » (la faute morale)
  const p69 = BORNES.P69[0], hors = 1 - seg(T, p69, p69 + .3), yM = CY12 - SH * CS12 / 2 - 22;
  const kc = seg(T, S.correct, S.correct + .3) * hors;
  if (kc > 0) {
    const x = QUATRE.rougeBon.x; ctx.globalAlpha = kc * lumiere(1, T); ctx.fillStyle = CRAIE;
    signe(ctx, '✓', T < S.betes ? x : xRougeBon(T).x, yM - 14, 46 * lerp(1.3, 1, eBack(seg(T, S.correct, S.correct + .3)))); ctx.globalAlpha = 1;
  }
  marque(ctx, '?', QUATRE.bleuMauvais.x, yM, seg(T, S.trompes + .2, S.trompes + .45) * hors * lumiere(1, T) * (.7 + .3 * Math.sin(T * 4)));
  marque(ctx, '!', QUATRE.bleuBon.x, yM, seg(T, S.faute + .15, S.faute + .3) * hors);
  // P69 : les deux bulles
  for (const B of BULLES) bulleInsulte(ctx, T, B);
}
