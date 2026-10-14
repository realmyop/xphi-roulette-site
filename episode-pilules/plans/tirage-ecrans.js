/* ==========================================================================
   Les deux pilules, l'épisode — plans/tirage-ecrans.js : P44–P50, la description A
   (le lot « tirage », de 618,2 à 756,2 s ; plans/tirage.js en est le sommaire)

   Les écrans 01 et 02 de Thibaut, dessinés par resultats.js (ecranJauge,
   ecranPredictions : ses mises en page, ses textes, ses couleurs, avec les
   bonshommes du film de 3 min 20 à case entière), dans le cadre des
   résultats (×0,81 autour de (960, 140)), ses pas d[i] calés sur les mots.
   L'œil de Phi à sa place des résultats, en haut à droite (1 790, 120, 120).

   Ce que ce fichier ajoute aux écrans de Thibaut (EPISODE.md, « Ce qui est
   nouveau ») :
   - P44 : le compte à rebours de la devinette (commun.js : compteARebours),
     les regards de la foule pendant le silence (le crochet sujet) ;
   - P46 : la bulle de pensée qui sort de l'œil et enveloppe la foule (ils
     vivent dans la tête de Phi), le fantôme en pointillés de la jauge (« ? »,
     aucun chiffre), le petit terminal « > demander_autorisation(test_réel) »
     → « refusé », la bulle qui éclate en caractères ;
   - P47–P48 : LA PLUIE, un point par participant (2 222 carrés de 3 px), aux
     valeurs de la fonction Q de Thibaut appelée avec n = 1 456 et 766
     (donnees.js : repartition, [approx.]), par rangées de quatre points dans
     la colonne de leur valeur ; la séparation (les bleus au-dessus, les rouges
     dessous), puis la condensation : chaque paquet d'environ 22 points devient
     une figure de Thibaut (1 figure = 1 % du groupe) ; les moyennes et ses
     surlignes, chacune sur son mot (recopiées de resultats.js : SURLIGNES et
     le dessin des moyennes, non exportés, pour les poser au mot près) ;
   - P49 : les deux gros plans ×8, le reflet de LEUR couleur dans les yeux, une
     foule imaginée derrière chacun ; les deux flèches, la moyenne qui retombe
     comme un dé ;
   - P50 : la poussée sur les trois bleus qui prédisaient moins de 50 %, leurs
     fantômes (le contour, 2 px, comme le fantôme du N°48 de
     film-pilules/plans/issue.js) qui partent en caractères, et leur regard
     vers Phi.
   ========================================================================== */
import {
  CRAIE, GRIS, GRIS_FIG, LABO, BLEU, ROUGE, BLEU_TXT, ROUGE_TXT, MONO, PIX, G,
  clamp, lerp, seg, cloche, cles, eIO, eOut, eIn, hache, mix, rgba, texteSignes, virgule,
  tampon, humeur, oeil, flotte, microsaccade, creeRegard, VOUS, point, dessineSujet, pose, sprite, PREMIERS, SW, SH, CS,
  cadre, filet, bulle, cheminPixel, disquePixel, terminal, compteARebours,
} from '../commun.js';
import * as R from '../resultats.js';
import { CHOIX, PREDICTIONS, repartition } from '../donnees.js';
import { REPLIQUE, plume as plumeBoite } from '../texte.js';
import { B, S } from './tirage-temps.js';

const PA = PREDICTIONS.A, GA = R.PRED.A, CADRE = R.CADRE_RESULTATS;
const PHI = R.PHI;   // (1 790, 120, 120)
// les pas de Thibaut, calés sur les mots (tirage-temps.js) : écran 01 [la question, la jauge, la vie] ; écran 02 [l'axe,
// les figures en place (cachées tant que la pluie n'est pas condensée), la pile des rouges à 0 %, les bleus sous 50 %]
const D1 = Object.freeze([S.d0, S.d1, S.d2]);
const D2 = Object.freeze([S.e0, S.e0, S.zero, S.sous50]);
const M1 = R.moments(1, D1);
const fmt = (v, d = 1) => virgule(v, d);
// un texte de Thibaut (sous la caméra, ses coordonnées), avec ≈ ✓ ✗ en pixels (texteSignes de l'épisode)
function txt(ctx, s, x, y, size, col, align = 'left', a = 1, font = PIX) {
  if (a <= 0) return;
  ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  texteSignes(ctx, s, x, y); ctx.globalAlpha = 1;
}

// ================================================================ la caméra du plan (posée sur le cadre des résultats)
// P46 : un léger recul (×0,92) pour laisser entrer la bulle ; P47 : sur « ravisée », la lente poussée ×1,3 dans le nuage,
// qui revient à ×1 pendant la condensation (P48) ; P50 : la poussée ×2,2 sur les trois bleus sous 50 %, et le retour ×1
// pour la coupe (l'écran 02 entier).
// le nuage : à ×1,3, tout l'axe tient encore (0 % à 100 %), son titre reste sous le cartouche, les rouges au-dessus de 830
const NUAGE = Object.freeze({ x: 968, y: 440, sx: 960, sy: 480 });
const TROIS = (() => {
  const ps = [0, 1, 2].map(id => { const [x, y] = GA.cible(GA.items[id]); return CADRE.ecran(x, y); });
  return Object.freeze({ x: ps.reduce((s, p) => s + p.x, 0) / 3, y: ps[0].y - 20, sx: 820, sy: 500 });
})();
function camPlan(T) {
  if (T < B.P47) { const k = eIO(seg(T, S.pensee, S.pensee + 1.3)); return cadre(960, 480, 960, 480, Math.exp(k * Math.log(.92))); }
  if (T < S.gros) {
    const k = eIO(seg(T, S.ravise, B.P48)) * (1 - eIO(seg(T, S.cond0, S.cond1)));
    return cadre(NUAGE.x, NUAGE.y, lerp(NUAGE.x, NUAGE.sx, k), lerp(NUAGE.y, NUAGE.sy, k), Math.exp(k * Math.log(1.3)));
  }
  const k = eIO(seg(T, S.pousse0, S.pousse1)) * (1 - eIO(seg(T, S.recul0, S.recul1)));
  return cadre(TROIS.x, TROIS.y, lerp(TROIS.x, TROIS.sx, k), lerp(TROIS.y, TROIS.sy, k), Math.exp(k * Math.log(2.2)));
}
const camDe = T => R.dansCadre(camPlan(T));
const ecr = (T, x, y) => camDe(T).ecran(x, y);
const monde = (ctx, cam, fn) => { ctx.save(); cam.applique(ctx); fn(); ctx.restore(); ctx.globalAlpha = 1; };

// ================================================================ P44 : la devinette et son silence
// la boîte de Thibaut (ecranJauge la dessine en (960, 160) de sa page) : le compte à rebours se pose dessous
function rectQuestion(ctx) {
  let w = 0; for (const [s, z] of [['DESCRIPTION A', 26], ['Quelle part a pris la pilule bleue ?', 38]]) { ctx.font = `${z}px ${PIX}`; w = Math.max(w, ctx.measureText(s).width); }
  w += 70; return { x: 960 - w / 2, y: 160, w, h: (26 + 38) * 1.38 + 34 };
}
// pendant les quelques secondes, ils lorgnent leurs voisins, et une vague de regards monte vers Phi, de gauche à droite
const tRegard = i => S.compte0 + .3 + ((i % 20) / 19) * (S.compte1 - S.compte0 - 1.4) + Math.floor(i / 20) * .07;
function sujet01(cle, e, T, info) {
  if (typeof cle !== 'number') return e;
  if (T >= S.compte0 - .2 && T < S.compte1 + .3) {
    const tr = tRegard(cle);
    if (T >= tr && T < tr + .9) { e.fixe = true; e.cible = { x: PHI.x, y: PHI.y }; }
    else { e.mode = 'prive'; e.cible = { x: info.x + (hache(cle * 5 + Math.floor(T / 1.3)) < .5 ? -80 : 80), y: info.y }; }
  }
  if (T >= S.chers) { e.fixe = true; e.cible = { x: PHI.x, y: PHI.y }; }   // « chers humains » : les cent se tournent vers lui
  return e;
}
const visageJauge = (T, i) => { const [x, y] = R.posJauge(i); return ecr(T, x, y - 14); };

// ================================================================ P46 : la bulle de pensée, le fantôme de la jauge, le terminal
const BULLE = Object.freeze({ x: 460, y: 120, w: 1000, h: 660 });   // autour de la foule, du chiffre et de la jauge (à ×1, à l'écran)
const kBulle = T => seg(T, S.pensee, S.pensee + .9);
function rectBulle(T) {
  const c = camPlan(T), p = c.ecran(BULLE.x, BULLE.y);
  const tr = cloche(T, S.vraies, S.vraies + .1, S.vraies + 1.2, S.vraies + 1.4), n = Math.floor(T * 22);
  return { x: p.x + (hache(n * 3 + 1) - .5) * 4 * tr, y: p.y + (hache(n * 3 + 2) - .5) * 4 * tr, w: BULLE.w * c.z, h: BULLE.h * c.z };
}
const queueBulle = () => ({ x: PHI.x - 52, y: PHI.y + 58 });
function laBulle(ctx, T) {
  const k = kBulle(T); if (k <= 0 || T >= S.inassouvie + .15) return;
  const r = rectBulle(T), q = queueBulle(), a = 1 - seg(T, S.inassouvie, S.inassouvie + .15);
  bulle(ctx, r.x, r.y, r.w, r.h, { type: 'pensee', queue: q, k, a });
  // le double cadre craie, grandi depuis la queue avec elle
  const kk = eOut(clamp(k));
  ctx.save(); ctx.globalAlpha = .5 * a; ctx.translate(q.x, q.y); ctx.scale(kk, kk); ctx.translate(-q.x, -q.y);
  ctx.strokeStyle = CRAIE; ctx.lineWidth = 2; cheminPixel(ctx, r.x - 9, r.y - 9, r.w + 18, r.h + 18, 36, 4); ctx.stroke();
  ctx.restore(); ctx.globalAlpha = 1;
}
// l'éclat : le contour de la bulle part en caractères (comme l'éclat des pilules), la foule reste
function eclatBulle(ctx, T) {
  const t0 = S.inassouvie; if (T < t0 || T > t0 + 1.2) return;
  const r = rectBulle(t0), per = 2 * (r.w + r.h), n = Math.round(per / 15), cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  ctx.font = `16px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let j = 0; j < n; j++) {
    let d = j / n * per, x, y;
    if (d < r.w) { x = r.x + d; y = r.y; } else if ((d -= r.w) < r.h) { x = r.x + r.w; y = r.y + d; } else if ((d -= r.h) < r.w) { x = r.x + r.w - d; y = r.y + r.h; } else { x = r.x; y = r.y + r.h - (d - r.w); }
    const u = seg(T, t0 + hache(j * 7 + 1) * .15, t0 + .9 + hache(j * 7 + 2) * .3); if (u >= 1) continue;
    const dx = x - cx, dy = y - cy, L = Math.hypot(dx, dy) || 1, v = 90 + hache(j * 7 + 3) * 160;
    ctx.globalAlpha = (1 - u) * .9; ctx.fillStyle = mix(CRAIE, LABO, u);
    ctx.fillText(G[Math.floor(hache(j * 13 + Math.floor(T * 12)) * G.length)], x + dx / L * v * eOut(u), y + dy / L * v * eOut(u) + 30 * u * u);
  }
  ctx.globalAlpha = 1;
}
// le fantôme de la partie bleue de la jauge (Phi l'imagine) : il glisse dessous, descend vers le trait, hésite, revient.
// En pointillés LABO, un « ? » GRIS au bout, aucun chiffre.
const VAL_FANTOME = Object.freeze([[S.haute + .4, CHOIX.A.pct], [S.haute + 1.4, 44], [S.haute + 1.9, 56], [S.haute + 2.3, 47], [S.haute + 2.6, 53], [S.haute + 3.4, CHOIX.A.pct]]);
const aFantome = T => cloche(T, S.haute, S.haute + .3, S.haute + 3.6, S.haute + 4.0);
const finFantome = T => ({ x: 390 + 11.4 * cles(T, VAL_FANTOME), y: 830 + 34 * eIO(seg(T, S.haute, S.haute + .4)) * (1 - eIO(seg(T, S.haute + 3.4, S.haute + 3.8))) });
function fantomeJauge(ctx, T, cam) {
  const a = aFantome(T); if (a <= 0) return;
  const f = finFantome(T);
  monde(ctx, cam, () => {
    ctx.globalAlpha = a; ctx.strokeStyle = LABO; ctx.lineWidth = 2.5; ctx.setLineDash([7, 6]);
    ctx.strokeRect(390, f.y, f.x - 390, 22); ctx.setLineDash([]);
    txt(ctx, '?', f.x + 24, f.y + 22, 30, GRIS, 'center', a);
  });
}
function terminalAutorisation(ctx, T) {
  if (T < S.autor - .3) return;
  terminal(ctx, T, [
    { t0: S.autor, txt: '> demander_autorisation(test_réel)', col: LABO, cps: 26 },
    { t0: S.refuse, txt: 'refusé', col: GRIS, cps: 20 },
  ], { x: 40, y: 652, w: 420, h: 118, taille: 18, a: seg(T, S.autor - .3, S.autor) });   // (x 40–460 : à 440 de large, son cadre recouvrait le bord gauche de la bulle, après le recul ×0,92)
}

// ================================================================ l'écran 01 (P44–P46)
function ecran01(ctx, T) {
  const cam = camDe(T);
  R.fondResultats(ctx, T, 1, D1);
  laBulle(ctx, T);
  R.ecranJauge(ctx, T, { etapes: D1, groupe: 'A', phi: { x: PHI.x, y: PHI.y }, sujet: sujet01, sans: ['tampon'] }, cam);
  // le tampon de Thibaut (le même), qui s'efface quand la bulle entre
  monde(ctx, cam, () => tampon(ctx, T, { t: S.d2 + .7, txt: 'TOUT LE MONDE SURVIT', taille: 54, c: LABO, x: 960, y: 580, fond: .86, a: 1 - seg(T, S.pensee, S.pensee + .5) }));
  // le compte à rebours, sous la boîte de la question
  if (T >= S.compte0 - .4 && T < S.compte1 + .4) {
    const q = rectQuestion(ctx), p = cam.ecran(q.x + 24, q.y + q.h + 22);
    compteARebours(ctx, T, S.compte0, S.compte1 - S.compte0, p.x, p.y, (q.w - 48) * cam.z);
  }
  fantomeJauge(ctx, T, cam);
  terminalAutorisation(ctx, T);
  eclatBulle(ctx, T);
}

// ================================================================ P47–P48 : un point par participant
const BLEUS = repartition('A', 'bleus', CHOIX.A.bleue), ROUGES_P = repartition('A', 'rouges', CHOIX.A.rouge);
const NB_P = BLEUS.length + ROUGES_P.length, NB_FIG = GA.nb;   // 2 222 ; 66 figures bleues (sa page arrondit), 34 rouges
const CAP_P = 220;   // une colonne tient 220 points (10 figures de Thibaut × 22 personnes)
let PTS = null;
function points() {
  if (PTS) return PTS;
  const v = new Float32Array(NB_P), bleu = new Uint8Array(NB_P);
  BLEUS.forEach((x, k) => { v[k] = x; bleu[k] = 1; });
  ROUGES_P.forEach((x, k) => { v[BLEUS.length + k] = x; });
  // empile (resultats.js) pour des points : la colonne de la valeur, sinon la plus proche qui a de la place
  const empile = ids => {
    const cnt = new Map(), out = new Map();
    [...ids].sort((a, b) => v[a] - v[b] || hache(a * 7 + 1) - hache(b * 7 + 1)).forEach(p => {
      const c0 = Math.round(v[p] / 100 * (R.NC - 1));
      for (let dd = 0; dd < 200; dd++) {
        const c = c0 + (dd === 0 ? 0 : dd % 2 ? (dd + 1) / 2 : -dd / 2);
        if (c < 0 || c > R.NC - 1) continue;
        const k = cnt.get(c) || 0;
        if (k < CAP_P) { out.set(p, { c, k }); cnt.set(c, k + 1); break; }
      }
    });
    return out;
  };
  const tous = [...Array(NB_P).keys()], E0 = empile(tous), EB = empile(tous.filter(p => bleu[p])), ER = empile(tous.filter(p => !bleu[p]));
  const xCol = c => CADRE.ecran(R.X0 + c * R.PXC, 0).x, yAxe = CADRE.ecran(0, R.BASE - 2).y, yRouge = CADRE.ecran(0, R.BASE + 44).y;
  const x0 = new Float32Array(NB_P), y0 = new Float32Array(NB_P), x1 = new Float32Array(NB_P), y1 = new Float32Array(NB_P), x2 = new Float32Array(NB_P), y2 = new Float32Array(NB_P);
  const rang = new Float32Array(NB_P), fig = new Uint8Array(NB_P);
  for (let p = 0; p < NB_P; p++) {
    const a = E0.get(p), b = bleu[p] ? EB.get(p) : ER.get(p);
    x0[p] = xCol(a.c) - 6 + (a.k % 4) * 3; y0[p] = yAxe - 5 - Math.floor(a.k / 4) * 3;
    x1[p] = xCol(b.c) - 6 + (b.k % 4) * 3; y1[p] = bleu[p] ? yAxe - 5 - Math.floor(b.k / 4) * 3 : yRouge + Math.floor(b.k / 4) * 3;
    rang[p] = Math.floor(a.k / 4);
    // la figure de Thibaut que ce point rejoint : les bleus triés par paquets de 1 456 / 66, les rouges de 766 / 34
    const id = bleu[p] ? Math.min(NB_FIG - 1, Math.floor(p * NB_FIG / BLEUS.length)) : NB_FIG + Math.min(99 - NB_FIG, Math.floor((p - BLEUS.length) * (100 - NB_FIG) / ROUGES_P.length));
    fig[p] = id;
    const [fx, fy] = GA.cible(GA.items[id]), f = CADRE.ecran(fx, fy);
    x2[p] = f.x - 1 + (hache(p * 3 + 1) - .5) * 10; y2[p] = f.y - 1 + (hache(p * 3 + 2) - .5) * 14;
  }
  PTS = { v, bleu, x0, y0, x1, y1, x2, y2, rang, fig };
  return PTS;
}
// la chute : les rangées du bas d'abord, chacun tombe du haut de l'image en 0,55 s
const tChute = (P, p) => S.predire + (P.rang[p] / 55) * 1.6 + hache(p * 11 + 5) * .7;
const tCouleur = p => S.sep0 + hache(p * 13 + 3) * .3;
const tSepare = p => S.sep0 + .1 + hache(p * 17 + 9) * .3;
const tFig = id => S.cond0 + (id / 100) * .35;
function pluie(ctx, T, cam0) {
  if (T < S.predire || T > S.cond1 + .3) return;
  const P = points();
  ctx.save(); cam0.applique(ctx);
  const passe = (couleur, filtre) => {
    ctx.fillStyle = couleur; ctx.globalAlpha = 1;
    for (let p = 0; p < NB_P; p++) {
      if (!filtre(p)) continue;
      let x = P.x0[p], y = P.y0[p], a = 1;
      if (T < S.sep0) {
        const tc = tChute(P, p); if (T < tc) continue;
        y = lerp(-20, y, eIn(seg(T, tc, tc + .55)));
      } else {
        const ks = eIO(seg(T, tSepare(p), tSepare(p) + .8));
        x = lerp(x, P.x1[p], ks); y = lerp(y, P.y1[p], ks);
        if (T >= S.cond0) {
          const t = tFig(P.fig[p]), kc = eIO(seg(T, t, t + .6));
          x = lerp(x, P.x2[p], kc); y = lerp(y, P.y2[p], kc); a = 1 - seg(kc, .45, 1);
          if (a <= 0) continue;
        }
      }
      if (a < 1) ctx.globalAlpha = a; else if (ctx.globalAlpha !== 1) ctx.globalAlpha = 1;
      ctx.fillRect(x, y, 3, 3);
    }
  };
  // par lots de même couleur : gris tant qu'ils n'ont pas pris la leur, puis bleus, puis rouges
  passe(GRIS_FIG, p => T < tCouleur(p));
  if (T >= S.sep0) { passe(BLEU, p => P.bleu[p] && T >= tCouleur(p)); passe(ROUGE, p => !P.bleu[p] && T >= tCouleur(p)); }
  ctx.restore(); ctx.globalAlpha = 1;
}
// le crochet des figures de l'écran 02 : elles paraissent quand leur paquet de points les rejoint ; la pile des 100 %
// s'illumine sur « beaucoup de 100 % » ; en P50, les trois bleus sous 50 % lèvent les yeux vers Phi sur « quand même »
function sujet02(cle, e, T) {
  if (typeof cle !== 'number') return e;
  if (T < S.cond1 + 1) e.a = (e.a ?? 1) * seg(T, tFig(cle) + .3, tFig(cle) + .6);
  const it = GA.items[cle];
  if (it.b && it.v === 100 && T >= S.cent && T < S.gros) e.halo = .9 * seg(T, S.cent, S.cent + .3) * (.75 + .25 * Math.sin(T * 4 + cle));
  if (cle < 3 && T >= S.quandMeme + cle * .2) { e.fixe = true; e.cible = { x: PHI.x, y: PHI.y }; }
  return e;
}

// ================================================================ les moyennes et les surlignes de Thibaut, chacune sur son mot
// (resultats.js, ecranPredictions : le dessin des moyennes et SURLIGNES, non exportés, recopiés ici)
const SURL = Object.freeze([
  { t: S.zero, filtre: it => !it.b && it.v === 0, lignes: [`${PA.reperes.rougesZero} % DES ROUGES`, 'PRÉDISENT 0 %'], lx: x => x - 8, ly: (y, h) => y + h + 56 },
  { t: S.sous50, filtre: it => it.b && it.v < 50, chaque: true, lignes: [`≈ ${PA.reperes.bleusSousMoitie} % DES BLEUS PRÉDISENT`, 'MOINS DE 50 % DE BLEUE'], lx: x => x - 30, ly: y => y - 120 },
]);
// la moyenne qui retombe comme un dé (P49) : une chute, deux rebonds (les trois tic) ; rend le décalage vertical
export const REBONDS = Object.freeze([.35, .65, .83]);
function rebond(s) {
  if (s < 0) return -1e4;
  if (s < .35) { const k = s / .35; return -240 * (1 - k * k); }
  if ((s -= .35) < .3) { const k = s / .3; return -44 * 4 * k * (1 - k); }
  if ((s -= .3) < .18) { const k = s / .18; return -12 * 4 * k * (1 - k); }
  return 0;
}
function moyennes(ctx, T, cam) {
  const { BASE, xVal } = R, M = PA.moyennes;
  monde(ctx, cam, () => {
    // la valeur réelle et la moyenne clignotent ensemble sur « très près »
    const cl = T >= S.pres && T < S.pres + 1.5 ? (Math.floor((T - S.pres) * 5) % 2 ? .35 : 1) : 1;
    if (T >= S.pres && T < S.pres + 1.5) R.tirets(ctx, xVal(PA.reel), BASE - 350, xVal(PA.reel), BASE + 350, LABO, cl, 3, [8, 7]);
    // « MOYENNE DES PRÉDICTIONS 60,7 % » (P47) ; elle s'efface quand le nuage se sépare, et retombe en P49
    const a1 = seg(T, S.moy, S.moy + .4) * (1 - seg(T, S.sep0, S.sep0 + .4));
    if (a1 > 0) {
      R.tirets(ctx, xVal(M.tous), BASE + 14, xVal(M.tous), BASE - 320, LABO, a1 * cl, 3, [4, 6]);
      txt(ctx, `MOYENNE DES PRÉDICTIONS ${fmt(M.tous)} %`, xVal(M.tous) - 14, BASE + 80, 22, LABO, 'right', a1 * cl);
    }
    if (T >= S.hasard && T >= S.retour) {
      const dy = rebond(T - S.hasard);
      // (son étiquette sous celle de la valeur réelle, au-dessus des bleus de 30 à 60 % : rien ne s'y chevauche)
      R.tirets(ctx, xVal(M.tous), BASE + 14 + dy, xVal(M.tous), BASE - 240 + dy, LABO, 1, 3, [4, 6]);
      txt(ctx, `MOYENNE DES PRÉDICTIONS ${fmt(M.tous)} %`, xVal(M.tous) - 14, BASE - 250 + dy, 22, LABO, 'right', seg(T, S.hasard, S.hasard + .2));
    }
    // les deux camps, chacun sur son mot
    const ar = seg(T, S.moyR, S.moyR + .4);
    if (ar > 0) { R.tirets(ctx, xVal(M.rouges), BASE + 40, xVal(M.rouges), BASE + 350, ROUGE_TXT, ar, 3, [4, 6]); txt(ctx, `ROUGES : MOYENNE ${fmt(M.rouges, 0)} %`, xVal(M.rouges) + 14, BASE + 345, 22, ROUGE_TXT, 'left', ar); }
    const ab = seg(T, S.moyB, S.moyB + .4);
    if (ab > 0) { R.tirets(ctx, xVal(M.bleus), BASE - 14, xVal(M.bleus), BASE - 330, BLEU_TXT, ab, 3, [4, 6]); txt(ctx, `BLEUS : MOYENNE ${fmt(M.bleus, M.bleus % 1 ? 1 : 0)} %`, xVal(M.bleus) + 14, BASE - 335, 22, BLEU_TXT, 'left', ab); }
    // les surlignes
    SURL.forEach(s => {
      const t = T - s.t; if (t < 0) return;
      const ids = GA.items.filter(s.filtre).map(it => it.id), a = seg(t, 0, .4);
      if (s.chaque) ids.forEach(id => { const [x, y] = GA.cible(GA.items[id]); R.cerne(ctx, x - 16, y - 21, 32, 42, CRAIE, a, T); });
      else R.cerneFigures(ctx, GA, ids, CRAIE, a, T);   // en escalier, à mi-chemin des voisines (au-dessous du « 0 % » de l'axe)
      const [x, y, w, h] = GA.zone(ids);
      s.lignes.forEach((l, k) => txt(ctx, l, s.lx(x, w), s.ly(y, h) + k * 34, 26, CRAIE, 'left', seg(t, .3 + k * .5, .7 + k * .5)));
    });
    // P49 : deux flèches partent du trait réel, l'une vers la moyenne des bleus, l'autre vers celle des rouges
    if (T >= S.retour + .3) {
      const k1 = eOut(seg(T, S.retour + .3, S.retour + .8)), k2 = eOut(seg(T, S.retour + .6, S.retour + 1.1)), x0 = xVal(PA.reel);
      if (k1 > 0) R.fleche(ctx, x0, BASE - 300, lerp(x0 + 30, xVal(M.bleus), k1), BASE - 300, CRAIE, 1, 4);
      if (k2 > 0) R.fleche(ctx, x0, BASE + 300, lerp(x0 - 30, xVal(M.rouges), k2), BASE + 300, CRAIE, 1, 4);
    }
  });
}

// ================================================================ P50 : les fantômes de la mort qu'ils prédisaient
// Le contour seul, 2 px (le fantôme du N°48, film-pilules/plans/issue.js : fantome, non exporté, recopié et simplifié),
// à côté de chacun ; il part une fois, lentement, en caractères, case par case depuis les pieds (comme dessineSujet).
function fantome(ctx, T, f, cx, cy, cs, dis, a) {
  if (a <= .001) return;
  const { p } = pose(f, { col: BLEU, mode: 'trace', ouverts: true }, T, cx, cy), g = sprite(BLEU, p).g;
  const q = (x, y) => clamp((dis * 2 - (SH - 1 - y) / (SH - 1) * .45) / 1.4, 0, 1);
  const la = (x, y) => x >= 0 && x < SW && y >= 0 && y < SH && g[y * SW + x] > 0 && q(x, y) <= 0;
  const ox = Math.round(cx - SW * cs / 2), oy = Math.round(cy - SH * cs / 2), d = 1;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = BLEU_TXT; ctx.lineWidth = 2; ctx.lineCap = 'square'; ctx.beginPath();
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
    if (!la(x, y)) continue;
    const x0 = ox + x * cs, y0 = oy + y * cs, x1 = x0 + cs, y1 = y0 + cs;
    if (!la(x, y - 1)) { ctx.moveTo(x0, y0 + d); ctx.lineTo(x1, y0 + d); }
    if (!la(x, y + 1)) { ctx.moveTo(x0, y1 - d); ctx.lineTo(x1, y1 - d); }
    if (!la(x - 1, y)) { ctx.moveTo(x0 + d, y0); ctx.lineTo(x0 + d, y1); }
    if (!la(x + 1, y)) { ctx.moveTo(x1 - d, y0); ctx.lineTo(x1 - d, y1); }
  }
  ctx.stroke();
  ctx.fillStyle = BLEU_TXT;
  g.forEach((v, k) => { const x = k % SW, y = Math.floor(k / SW); if (v === 4 && la(x, y)) ctx.fillRect(ox + x * cs + cs * .25, oy + y * cs + cs * .25, cs * .5, cs * .5); });
  // les cases parties : des caractères qui montent et virent à la craie
  ctx.font = `${Math.round(12 * cs / CS)}px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  g.forEach((v, k) => {
    if (!v) return;
    const x = k % SW, y = Math.floor(k / SW), u = q(x, y); if (u <= 0 || u >= 1) return;
    const hz = hache((f.i ?? 0) * 997 + k * 31), vit = .6 + hache(k * 131 + 7) * .8;
    ctx.globalAlpha = a * (1 - u) * .9; ctx.fillStyle = mix(BLEU_TXT, CRAIE, u);
    ctx.fillText(G[Math.floor(hz * 1000) % G.length], ox + x * cs + cs / 2 + Math.sin(u * 5 + hz * 6.283) * 14 * u * cs / CS, oy + y * cs + cs / 2 - Math.pow(u, 1.4) * 170 * vit * cs / CS);
  });
  ctx.restore(); ctx.globalAlpha = 1;
}
const D_FANTOME = 3.6;
function fantomes(ctx, T, sujets) {
  if (T < S.mort) return;
  for (const s of sujets) {
    if (!(s.cle < 3)) continue;
    const t0 = S.mort + s.cle * .25, a = seg(T, t0, t0 + .35), dis = seg(T, t0 + 1.0, t0 + 1.0 + D_FANTOME);   // il tient 1 s, puis part
    if (dis >= 1) continue;
    fantome(ctx, T, PREMIERS[s.cle], s.x + 13 * s.cs, s.y, s.cs, dis, a * .9);
  }
}

// ================================================================ P49 : chacun comme lui (deux gros plans ×8)
const pris = (b, v) => GA.items.filter(it => it.b === b && it.v === v);
export const GROS = Object.freeze([
  { f: PREMIERS[pris(true, PA.moyennes.bleus)[5]?.id ?? 30], col: BLEU, cx: 480, v: PA.moyennes.bleus },
  { f: PREMIERS[pris(false, PA.moyennes.rouges)[0]?.id ?? 86], col: ROUGE, cx: 1440, v: PA.moyennes.rouges },
]);
const CY_GROS = 430, CS_GROS = 32;
function grosPlans(ctx, T) {
  R.fondResultats(ctx, T, 2, D2, { teinte: false });
  const phi = { x: PHI.x, y: PHI.y };
  GROS.forEach((g, j) => {
    // le monde comme il le voit : une lueur de sa couleur, et une foule imaginée de sa couleur, derrière lui
    const gr = ctx.createRadialGradient(g.cx, CY_GROS, 40, g.cx, CY_GROS, 520);
    gr.addColorStop(0, rgba(g.col, .16)); gr.addColorStop(1, rgba(g.col, 0));
    ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.fillRect(j ? 960 : 0, 0, 960, 830);
    for (let k = 0; k < 20; k++) {
      const x = g.cx + (k % 10 - 4.5) * 84, y = 520 + Math.floor(k / 10) * 72 + (k % 2) * 10;
      dessineSujet(ctx, PREMIERS[(k * 11 + 17 + j * 40) % 100], x, y, 3, { col: g.col, a: .2, mode: 'repos', phi }, T);
    }
    // lui, ×8 : le reflet de SA couleur dans les yeux ; il cligne, à son rythme, pendant le silence
    const tc = S.cligne + (j ? .55 : .2), cl = T >= tc && T < tc + .16;
    dessineSujet(ctx, g.f, g.cx, CY_GROS, CS_GROS, { col: g.col, mode: 'repos', phi, reflet: { couleurs: [g.col, g.col] }, p: { yx: 0, yy: 0 }, ...(cl ? { yeux: 'f' } : {}) }, T);
    txt(ctx, `prédit ${fmt(g.v, 0)} % de bleue`, g.cx, CY_GROS + SH * CS_GROS / 2 + 40, 20, GRIS, 'center', 1, MONO);
  });
  filet(ctx, 960, 40, 800, 1);
}

// ================================================================ l'écran 02 (P47–P50)
function ecran02(ctx, T) {
  if (T >= S.gros && T < S.retour) { grosPlans(ctx, T); return null; }
  const cam0 = camPlan(T), cam = R.dansCadre(cam0);
  R.fondResultats(ctx, T, 2, D2);
  const sans = ['moyennes', 'surlignes', ...(T < S.cond0 ? ['figures'] : [])];
  // poussé dans l'écran (P47–P48 ×1,3, P50 ×2,2), ce qui descend sous la boîte XPHI ne doit pas reparaître dessous
  // (entre la boîte et le bas de l'image) : le monde est coupé à y 850, caché derrière le haut de la boîte. Et il passe
  // derrière Phi, jamais à travers lui : un disque autour de l'œil et de ses tiges reste vide (en P50, les tirets de la
  // valeur réelle et la flèche de P49 traversaient l'anneau et la tige du haut ; window.film.sousOeil() le voit)
  ctx.save();
  if (cam0.z > 1.01) {
    ctx.beginPath(); ctx.rect(0, 0, 1920, 850);
    ctx.moveTo(PHI.x + .6 * PHI.taille, PHI.y); ctx.arc(PHI.x, PHI.y, .6 * PHI.taille, 0, 2 * Math.PI);
    ctx.clip('evenodd');
  }
  const I = R.ecranPredictions(ctx, T, { etapes: D2, groupe: 'A', phi: { x: PHI.x, y: PHI.y }, sujet: sujet02, sans }, cam);
  pluie(ctx, T, cam0);
  moyennes(ctx, T, cam);
  fantomes(ctx, T, I.sujets);
  ctx.restore(); ctx.globalAlpha = 1;
  return I;
}

// ================================================================ Phi, en haut à droite
const HUMEURS_EC = Object.freeze([
  [S.d0, 'curieux', .3], [REPLIQUE.A01.de, 'neutre'], [S.compte0, 'curieux'], [S.compte1, 'neutre'], [S.insout, 'plisse', .3],
  [S.d1, 'neutre'], [M1.seuil, 'grand', .2], [M1.seuil + .8, 'neutre'], [S.d2, 'grand', .3], [S.d2 + 1.6, 'neutre'], [S.chers, 'grand', .3],
  [S.pensee - .4, 'neutre'], [S.vraies, 'curieux'], [S.haute, 'doute'], [S.autor, 'neutre'], [S.malheur, 'bas', .4], [S.malheur + 1.2, 'neutre'], [S.inassouvie, 'bas'],
  [B.P47, 'neutre'], [S.feliciter, 'grand', .3], [S.ravise, 'plisse', .4],
  [S.sep0, 'curieux'], [S.moyR, 'neutre'], [S.zero, 'plisse'], [S.moyB, 'neutre'], [S.cent, 'grand', .3], [S.cent + 1.2, 'neutre'],
  [S.gros, 'neutre'], [S.retour, 'curieux'], [S.hasard, 'doute'], [S.hasard + 1.4, 'neutre'],
  [S.intrigue, 'curieux'], [S.mort, 'neutre'], [S.perplexe, 'doute', .4],
]);
const figureA = (T, id) => { const [x, y] = GA.cible(GA.items[id]); return ecr(T, x, y - 8); };
let REGARD = null;
function regard() {
  if (REGARD) return REGARD;
  const { BASE, xVal } = R, M = PA.moyennes;
  const C = [
    // P44 : la question ; vous ; la foule, sujet après sujet, pendant le silence ; vous sur « insoutenable »
    { t: S.d0, d: 1.2, cible: T => ecr(T, 960, 220) },
    { t: REPLIQUE.A01.de, d: 2.2, cible: VOUS },
    { t: S.compte0, d: S.compte1 - S.compte0, cible: T => { let best = -1, bt = -1; for (let i = 0; i < 100; i++) { const t = tRegard(i); if (t <= T && t > bt) { bt = t; best = i; } } return best < 0 ? null : visageJauge(T, best); }, pause: .3 },
    { t: S.insout, d: B.P45 - S.insout, cible: VOUS },
    // P45 : la tête de la jauge, le trait, le chiffre, la foule ; vous sur « Félicitations »
    { t: S.d1 + .2, d: 2.2, cible: T => ecr(T, 390 + 11.4 * CHOIX.A.pct * eIO(seg(T - S.d1, .2, 2.4)), 841), pause: .15 },
    { t: M1.seuil - .15, d: .6, cible: T => ecr(T, 960, 841) },
    { t: REPLIQUE.A04.de - .2, d: 1.8, cible: T => ecr(T, 960, 230) },
    { t: S.d2, d: 2.2, cible: T => ecr(T, 960, 560) },
    { t: S.felic, d: 2.4, cible: VOUS },
    // P46 : la bulle, la foule dedans, le fantôme de la jauge, le terminal ; vous sur « malheureusement »
    { t: S.pensee, d: 1.4, cible: T => { const r = rectBulle(T); return { x: r.x + r.w * .6, y: r.y + 40 }; } },
    { t: S.vraies, d: 2.0, cible: T => ecr(T, 960, 560) },
    { t: S.haute, d: 3.4, cible: T => { const f = finFantome(T); return ecr(T, f.x, f.y + 11); }, pause: .2 },
    { t: S.autor, d: S.malheur - S.autor, cible: point(330, 700) },
    { t: S.malheur, d: 1.6, cible: VOUS },
    { t: S.inassouvie, d: 1.0, cible: T => ecr(T, 960, 450) },
    // P47 : la valeur réelle ; la pluie ; la moyenne, le trait ; l'intérieur du nuage
    { t: S.e0 + .1, d: 1.4, cible: T => ecr(T, xVal(PA.reel), BASE - 335) },
    { t: S.predire, d: 3.0, cible: T => ecr(T, xVal(5 + 90 * ((T - S.predire) / 3)), BASE - 60), pause: .3 },
    { t: S.moy, d: 1.6, cible: T => ecr(T, xVal(M.tous), BASE - 150) },
    { t: S.pres, d: 1.4, cible: T => ecr(T, xVal(PA.reel), BASE - 150) },
    { t: S.ravise, d: B.P48 - S.ravise, cible: T => { const n = Math.floor(T / .55); return ecr(T, xVal(55 + 42 * hache(n * 3 + 1)), BASE - 20 - 110 * hache(n * 3 + 2)); }, pause: .5 },
    // P48 : la séparation ; le tireté rouge, la pile à zéro ; le tireté bleu, la pile à cent
    { t: S.sep0, d: 1.2, cible: T => ecr(T, xVal(70), BASE) },
    { t: S.cond0, d: 1.2, cible: T => ecr(T, xVal(75), BASE - 80) },
    { t: S.moyR, d: 2, cible: T => ecr(T, xVal(M.rouges), BASE + 200) },
    { t: S.zero, d: 2.5, cible: T => ecr(T, xVal(0), BASE + 120) },
    { t: S.moyB, d: 1.8, cible: T => ecr(T, xVal(M.bleus), BASE - 200) },
    { t: S.cent, d: 2.2, cible: T => ecr(T, xVal(100), BASE - 120) },
    // P49 : le bleu, le rouge, l'un puis l'autre ; les deux flèches, la moyenne qui retombe
    { t: S.gros, d: S.retour - S.gros, cible: T => point(Math.floor((T - S.gros) / 1.25) % 2 ? GROS[1].cx : GROS[0].cx, CY_GROS - 3 * CS_GROS), pause: .4 },
    { t: S.retour + .3, d: .8, cible: T => ecr(T, xVal(M.bleus), BASE - 300) },
    { t: S.retour + 1.1, d: .8, cible: T => ecr(T, xVal(M.rouges), BASE + 300) },
    { t: S.hasard, d: 1.8, cible: T => ecr(T, xVal(M.tous), BASE - 300 + rebond(T - S.hasard)), pause: .12 },
    // P50 : les trois, un par un ; leurs fantômes ; eux, qui le regardent : il soutient leur regard
    { t: S.pousse0, d: S.sous50 - S.pousse0, cible: T => figureA(T, 1) },
    { t: S.sous50, d: .9, cible: T => figureA(T, 0) }, { t: S.sous50 + .9, d: .9, cible: T => figureA(T, 1) }, { t: S.sous50 + 1.8, d: .9, cible: T => figureA(T, 2) },
    { t: S.sous50 + 2.7, d: 1.6, cible: T => { const [x, y, w] = GA.zone([0, 1, 2]); return ecr(T, x + w / 2, y - 100); } },
    { t: S.mort, d: S.quandMeme - S.mort, cible: T => { const id = Math.floor((T - S.mort) / .9) % 3, [x, y] = GA.cible(GA.items[id]); const p = ecr(T, x, y), c = camDe(T); return { x: p.x + 13 * R.csDe(2, c), y: p.y }; }, pause: .9 },
    { t: S.quandMeme, d: B.fin + 1 - S.quandMeme, cible: T => figureA(T, Math.floor((T - S.quandMeme) / 1.3) % 3), pause: 1.3 },
  ];
  REGARD = creeRegard({ cibles: C, repos: [[2, VOUS], [3, T => plumeBoite(T)], [1, T => (T < B.P47 ? ecr(T, 960, 560) : ecr(T, R.xVal(70), R.BASE - 60))]] });
  return REGARD;
}

// ================================================================ l'image (P44–P50)
export function dessineEcrans(ctx, T) {
  if (T < B.P47) ecran01(ctx, T); else ecran02(ctx, T);
  // Phi : « insoutenable », il se fige (ni flottement, ni microsaccade, ni clignement) jusqu'à la jauge ; « perplexe »,
  // un long clignement
  const fige = T >= S.insout && T < S.d1, [mx, my] = microsaccade(T);
  const tp = S.perplexe + .15, ouvert = 1 - cloche(T, tp, tp + .12, tp + .55, tp + .75);
  oeil(ctx, T, {
    x: PHI.x, y: fige ? PHI.y + flotte(S.insout) : PHI.y, taille: PHI.taille, humeur: humeur(T, HUMEURS_EC),
    regard: fige ? { gx: -mx, gy: -my, w: 1 } : regard(), ...(fige ? { flotte: 0, cligne: false } : {}), ouvert,
  });
}

// pour le son (tirage.js) et les essais
export const MOMENTS = Object.freeze({
  M1, D1, D2, REBONDS, D_FANTOME,
  premiereChute: () => { const P = points(); let m = Infinity; for (let p = 0; p < NB_P; p++) m = Math.min(m, tChute(P, p)); return m; },
  derniereChute: () => { const P = points(); let m = 0; for (let p = 0; p < NB_P; p++) m = Math.max(m, tChute(P, p) + .55); return m; },
  figures: () => [...Array(100).keys()].map(tFig),
});
export const ESSAI_ECRANS = Object.freeze({
  points, camPlan, TROIS, GROS,
  regard: T => { const c = regard().cible(T); return c && c.vous ? 'vous' : c && { x: Math.round(c.x), y: Math.round(c.y) }; },
  // les points : combien par couleur, et ce qu'ils redonnent (moyennes, parts : les repères du script, [approx.])
  bilan() {
    const P = points(); let sb = 0, sr = 0, nb = 0, nr = 0, z = 0, s50 = 0, c100 = 0;
    for (let p = 0; p < NB_P; p++) { if (P.bleu[p]) { nb++; sb += P.v[p]; if (P.v[p] < 50) s50++; if (P.v[p] === 100) c100++; } else { nr++; sr += P.v[p]; if (P.v[p] === 0) z++; } }
    return { points: NB_P, bleus: nb, rouges: nr, moyenne: (sb + sr) / NB_P, moyBleus: sb / nb, moyRouges: sr / nr, rougesZero: 100 * z / nr, bleusSous50: 100 * s50 / nb, bleusCent: 100 * c100 / nb };
  },
});
