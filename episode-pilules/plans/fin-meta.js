/* ==========================================================================
   Les deux pilules, l'épisode — plans/fin-meta.js : le méta-dilemme
   P73–P77, de 1169,4 à 1271,8 s (19:29,4–21:11,8), répliques D01–D13.
   Partie 3 · Le méta-dilemme (dans le script : 19:30 – 21:30).

   « Cette fois, ce sont de vrais humains » : Phi les mesure. P73 et P74 sont
   un seul décor, le laboratoire d'index.html : la foule des sujets de
   démonstration (DEMO, à leurs places d'index.html ; jamais le N°48) ; sur
   « cent vrais humains », une ligne LABO descend sur elle et, derrière la
   ligne, chacun prend du poids (commun.js : vraisHumains, ombre) : une ombre
   au sol, une respiration à son rythme, un pouls ; plus de reflet, plus de
   regard vers Phi. Puis le méta-dilemme a la forme du dilemme : deux fenêtres
   DESCRIPTION à la place des deux pilules d'index.html, le cadre du tirage qui
   hésite ; le N°48 revient du test, les mains vides (deux petites icônes de
   pilules éclatent au-dessus de lui) ; on ne voit pas ce qu'il choisit, et
   Phi baisse l'œil. P75 et P76 sont les écrans 11 et 12 de Thibaut
   (resultats.js, dans le cadre des résultats), l'écran 12 avec les vrais
   humains : personne n'y part en caractères. P77 : les deux scénarios se
   replient en deux fenêtres-icônes, aux places des pilules ; la grue : le
   laboratoire descend, et sous une ligne de sol en pointillés paraît, en
   petit, la dispute d'en bas (les deux colonnes de P68), qui continue sans
   nous.

   Le N°48 est PREMIERS[47] (frange, sans écharpe, ses crochets laiton) : il
   incarne « vous », revenu du test ; les vrais humains sont des DEMO (P73–P74)
   puis les figures de Thibaut (PREMIERS, écran 12) : les mêmes bonshommes,
   rien qui imite un humain réel. Aucun chiffre qui ne soit dans donnees.js
   (65,5 %, 12,6 %, 48,7 / 51,3, 30 / 70 ; « ≈ 13 MORTS » : la page de
   Thibaut) ; l'issue incertaine (à gauche) est une illustration, sans chiffre
   (la mention le dit : le socle).

   La grue (EPISODE.md, P77 : « la caméra monte (le monde descend de 640 px
   en 2,2 s) ; l'œil monte avec elle » ; « en bas de l'image paraît ce qui
   reste en dessous ») : à la lettre, un monde qui descend fait paraître ce
   qui est au-dessus, pas en dessous. Lu ainsi, la première passe : l'étage du
   méta-dilemme (les deux fenêtres-icônes, le N°48) monte avec la caméra et
   avec l'œil (il reste à sa place à l'écran) ; le laboratoire où il se tenait
   (son sol de points) descend de 640 px et sort par le bas ; sous la ligne de
   sol en pointillés, la dispute d'en bas paraît, petite, et rapetisse encore
   (elle s'éloigne). À juger sur l'écran.
   ========================================================================== */
import {
  W, H, CRAIE, GRIS, GRIS_FIG, LABO, LAITON, BLEU, ROUGE, NUIT, MONO, PIX, FILET,
  clamp, lerp, seg, cloche, eIO, eOut, eBack, hache, mix, rgba, fr, pc, toile,
  fond, sol, fenetre, pilule, HUMEURS, humeur, oeil, creeRegard, VOUS, point, flotte,
  dessineSujet, DEMO, PREMIERS, N48, crochets, camera, coupeBalise, ecrit, filet, tirets,
  terminal, bulle, vraisHumains, ombre, tirage, cadreTirage, sautsTirage, POSES,
} from '../commun.js';
import { DESCRIPTIONS, plume as plumeBoite } from '../texte.js';
import { ebauche } from './ebauche.js';
import { B, S, TIRAGE74 } from './fin-temps.js';

// ================================================================ les places
const OEIL_LABO = Object.freeze({ x: 1500, y: 260, taille: 180 });          // P73, P74 (EPISODE.md) ; P77 après le repli
const CS_FOULE = 4;
// les deux fenêtres de P74, à la place des deux pilules d'index.html (POSES.icones : (400, 196), (900, 196)) ;
// EPISODE.md les met en y 110–270 : le haut de la fenêtre A passerait sous le cartouche (x 40–460, y 32–132), qui en
// cacherait le titre. Elles sont posées en y 146–306 (au-dessus de la foule, qui commence en y 336).
const FEN74 = Object.freeze([Object.freeze({ x: 200, y: 146, w: 400, h: 160 }), Object.freeze({ x: 700, y: 146, w: 400, h: 160 })]);
const ENTRE74 = Object.freeze({ x: 560, y: 146, w: 180, h: 160 });           // le cadre s'arrête entre les deux
const centre = r => point(r.x + r.w / 2, r.y + r.h / 2);
// le N°48 de P74 : il entre par la gauche et s'avance jusqu'à (650, 700), ×2,5 (cs 10)
const F48 = PREMIERS[N48];
const N48_74 = Object.freeze({ x0: -90, x: 650, y: 700, cs: 10, marche: 1.8, pas: .2 });
// la poussée de P74, à la fin (D06 et le temps de choisir) : vers le N°48, ×1 → ×1,12 et non ×1,2 (EPISODE.md) : à
// ×1,2, la fenêtre A repasserait sous le cartouche, ou le N°48 sous la boîte ; à ×1,12, le haut des fenêtres reste en
// y 142 et les pieds du N°48 au-dessus de y 830
export const CAM74 = Object.freeze([[S.d06, 650, 453, 650, 453, 1], [B.P75, 650, 453, 650, 486, 1.12]]);
const cam74 = t => camera(t, CAM74);

// ================================================================ P73 · la foule, le balayage, les vrais humains
// la ligne du balayage descend de y 300 à 660 en 1,4 s, à vitesse constante (une ligne de balayage) ; un sujet devient
// un « vrai humain » quand elle passe son centre
const BAL = Object.freeze({ y0: 300, y1: 660, d: 1.4 });
const yBalayage = t => lerp(BAL.y0, BAL.y1, seg(t, S.balayage, S.balayage + BAL.d));
const passe = f => S.balayage + BAL.d * clamp((f.cy - BAL.y0) / (BAL.y1 - BAL.y0));
export const finBalayage = S.balayage + BAL.d;

function foule(ctx, t, phi, a = 1) {
  if (a <= .001) return;
  for (const f of DEMO) {
    const tp = passe(f);
    if (t < tp) {
      // avant le balayage : des sujets de démonstration ; sur « une dernière question », ils lèvent les yeux vers Phi
      const leve = t >= S.leve + hache(f.i * 7 + 1) * .5;
      dessineSujet(ctx, f, f.cx, f.cy, CS_FOULE, { col: GRIS_FIG, a, mode: 'repos', phi, cible: phi, fixe: leve, reflet: true }, t);
    } else {
      // derrière la ligne : une ombre au sol, une respiration à son rythme, un pouls ; sans reflet, sans regarder Phi
      const E = vraisHumains(f, { col: GRIS_FIG, a, mode: 'repos', phi }, t);
      ombre(ctx, f.cx, f.cy, CS_FOULE, phi, 1.3 * a * seg(t, tp, tp + .4));   // α 0,5 (EPISODE.md, P73)
      dessineSujet(ctx, f, f.cx, f.cy, CS_FOULE * E.echelle, E, t);
    }
  }
  ctx.globalAlpha = 1;
}
function ligneBalayage(ctx, t) {
  if (t < S.balayage || t > finBalayage + .3) return;
  const y = Math.round(yBalayage(t)), a = 1 - seg(t, finBalayage, finBalayage + .3);
  const g = ctx.createLinearGradient(0, y - 40, 0, y);
  g.addColorStop(0, rgba(LABO, 0)); g.addColorStop(1, rgba(LABO, .16 * a));
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(120, y - 40, 1060, 40);
  ctx.globalAlpha = .9 * a; ctx.fillStyle = LABO; ctx.fillRect(120, y - 1, 1060, 2);
  ctx.globalAlpha = 1;
}
// la légende, sous la foule : « sujets de démonstration » (GRIS) devient « cent vrais humains » (CRAIE)
function legende(ctx, t, a = 1) {
  const k = seg(t, finBalayage - .2, finBalayage + .4);
  ctx.font = `18px ${MONO}`; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  if (k < 1) { ctx.globalAlpha = a * (1 - k) * .9; ctx.fillStyle = GRIS; ctx.fillText('sujets de démonstration', 1147, 670); }
  if (k > 0) { ctx.globalAlpha = a * k; ctx.fillStyle = CRAIE; ctx.fillText('cent vrais humains', 1147, 670); }
  ctx.globalAlpha = 1;
}
// le petit terminal (celui de P46) : supposons qu'on obtienne enfin le droit
const TERM73 = Object.freeze({ x: 1300, y: 700, w: 560, h: 100, taille: 20 });
const LIGNES73 = Object.freeze([
  Object.freeze({ t0: S.droit, txt: '> demander_autorisation(test_réel)', col: LABO, cps: 24 }),
  Object.freeze({ t0: S.droit + 34 / 24 + .7, txt: fr('… accordée ?'), col: GRIS, cps: 14 }),
]);
const aTerm73 = t => seg(t, S.droit - .35, S.droit) * (1 - seg(t, S.indecis, S.indecis + .5));
// le bout de ce qui s'écrit (Plex 20 px : 12 px par caractère), pour que l'œil le suive sans redessiner le terminal
function plumeTerm73(t) {
  for (let j = LIGNES73.length - 1; j >= 0; j--) {
    const L = LIGNES73[j]; if (t < L.t0) continue;
    const n = Math.min([...L.txt].length, Math.floor((t - L.t0) * L.cps));
    return point(TERM73.x + 24 + 12 * n, TERM73.y + 24 + 20 + j * 29 - 7);
  }
  return null;
}

// ================================================================ P74 · les deux fenêtres, le N°48
// une fenêtre de description compacte : celle de commun.js (fenetreDescription) à la taille des pilules d'index.html
// (400 × 160) — son titre en DotGothic16 22 px, le texte du script en Plex 15 px (EPISODE.md, P74), plus haut
function fenetreCompacte(ctx, lettre, r, o = {}) {
  const a = o.a ?? 1; if (a <= .001) return;
  fenetre(ctx, r.x, r.y, r.w, r.h, a, o.bord ?? CRAIE);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha = a; ctx.font = `22px ${PIX}`; ctx.fillStyle = LABO; ctx.fillText(`DESCRIPTION ${lettre}`, r.x + 18, r.y + 32);
  ctx.fillStyle = FILET; ctx.fillRect(r.x + 18, r.y + 43, r.w - 36, 2);
  ctx.font = `15px ${MONO}`;
  ecrit(ctx, coupeBalise(ctx, DESCRIPTIONS[lettre], r.w - 36), r.x + 18, r.y + 66, 19);
  ctx.globalAlpha = 1;
}
const aFen74 = t => eOut(seg(t, S.indecis, S.indecis + .4));
const pulse = (t, t0) => cloche(t, t0, t0 + .25, t0 + 1.1, t0 + 1.7);
function fenetres74(ctx, t) {
  const a = aFen74(t); if (a <= .001) return;
  const dy = (1 - a) * 10;
  [['A', S.descA], ['B', S.descB]].forEach(([l, tp], j) => {
    const r = { ...FEN74[j], y: FEN74[j].y + dy };
    fenetreCompacte(ctx, l, r, { a, bord: mix(CRAIE, LABO, pulse(t, tp)) });
  });
}
// le cadre du tirage saute de l'une à l'autre sans se poser ; sur « vers vous », il s'arrête entre les deux
function cadre74(ctx, t) {
  if (t < TIRAGE74.t0) return;
  const aF = 1 - seg(t, S.descA - .4, S.descA + .1); if (aF <= 0) return;
  const E = tirage(t, TIRAGE74.t0, 2, TIRAGE74);
  if (t < S.versVous) { cadreTirage(ctx, t, E, FEN74[E.cible], { pose: false, marge: 14, a: aF }); return; }
  const k = eIO(seg(t, S.versVous, S.versVous + .45)), R0 = FEN74[E.cible];
  const r = { x: lerp(R0.x, ENTRE74.x, k), y: R0.y, w: lerp(R0.w, ENTRE74.w, k), h: R0.h };
  cadreTirage(ctx, t, { ...E, depuis: 1, pose: false }, r, { pose: false, marge: 14, a: lerp(1, .45, k) * aF });
}
export const SAUTS74 = sautsTirage(TIRAGE74.t0, TIRAGE74.n, TIRAGE74.d0, TIRAGE74.d1);

// le N°48 : sa place et son pas à l'instant t (il marche de x0 à x, en ralentissant, un pas toutes les 0,2 s)
function etat48(t) {
  const u = seg(t, S.aucune, S.aucune + N48_74.marche), x = lerp(N48_74.x0, N48_74.x, eOut(u));
  const n = Math.floor((t - S.aucune) / N48_74.pas), marche = t >= S.aucune && u < 1;
  return { x, y: N48_74.y, marche, pied: marche && n % 2 === 1, n };
}
export const PAS48 = (() => {   // les instants des pas (le son)
  const out = [];
  for (let t = S.aucune; t < S.aucune + N48_74.marche; t += N48_74.pas) {
    const u = seg(t, S.aucune, S.aucune + N48_74.marche);
    if (eOut(u) < .995) out.push({ t: +t.toFixed(3), x: lerp(N48_74.x0, N48_74.x, eOut(u)) });
  }
  return Object.freeze(out);
})();
const T_ECLAT = S.aucune + 1.0;          // les deux petites icônes de pilules éclatent : les mains vides
export const ECLAT74 = T_ECLAT;
function n48_74(ctx, t, phiW) {
  if (t < S.aucune) return;
  const P = etat48(t), cs = N48_74.cs, a = seg(t, S.aucune, S.aucune + .25);
  // ce qu'il regarde : les fenêtres, A puis B ; Phi qui le regarde ; puis, le temps de choisir, droit devant lui
  let cible = null, fixe = false;
  if (t >= S.seulement && t < S.d06) { cible = centre(FEN74[t < S.seulement + 1.1 ? 0 : 1]); fixe = true; }
  else if (t >= S.d06 && t < S.attente) { cible = phiW; fixe = true; }
  else if (!P.marche && t < S.seulement) { cible = centre(FEN74[0]); fixe = true; }
  const p = P.marche ? { jambes: P.pied ? 'saut' : 'droit', bob: 0, yx: 1, yy: 0 } : t >= S.attente ? { yx: 0, yy: 0 } : undefined;
  const y = P.y - (P.pied ? cs * .5 : 0);
  dessineSujet(ctx, F48, P.x, y, cs, { col: GRIS_FIG, a, mode: 'repos', phi: phiW, cible, fixe, reflet: true, p }, t);
  // ses crochets ; leur « N°48 » (12 px à cette taille, sur la foule) est écrit à côté, détouré, en plus grand
  const kc = seg(t, S.aucune + .4, S.aucune + 1.2);
  crochets(ctx, P.x, P.y, cs / CS_FOULE, { a, k: kc, label: '' });
  detoure(ctx, 'N°48', P.x + 87, P.y - 46, `20px ${PIX}`, LAITON, a * kc, 'left');
  // les deux petites icônes de pilules : elles passent au-dessus de lui et éclatent
  const ap = seg(t, S.aucune + .4, S.aucune + .6);
  if (ap > 0) {
    const xp = etat48(Math.min(t, T_ECLAT)).x;
    [0, 1].forEach(i => pilule(ctx, t, i, { x: xp + (i ? 36 : -36), y: P.y - 100, ps: .14, a: ap, eclat: T_ECLAT }));
  }
  // le temps de choisir : un « ? » au-dessus de lui (on ne voit pas ce qu'il choisit)
  const aq = seg(t, S.attente, S.attente + .3);
  if (aq > 0) detoure(ctx, '?', P.x, P.y - 74, `48px ${PIX}`, CRAIE, aq * (.8 + .2 * Math.sin(t * 4)), 'center');
}
// un mot détouré de nuit (il passe devant la foule) : 6 px de NUIT autour, puis le mot
function detoure(ctx, txt, x, y, font, col, a, align = 'center') {
  if (a <= .001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = NUIT; ctx.strokeText(txt, x, y);
  ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore();
}
// la tête du N°48 à l'écran (pour l'œil)
const tete48 = t => { const P = etat48(t); return cam74(t).ecran(P.x, P.y - 30); };

// ================================================================ P73–P74 : le laboratoire, un seul décor
function labo(ctx, t, cam) {
  fond(ctx, t, { sol: .45 });
  const phiW = cam.monde(OEIL_LABO.x, OEIL_LABO.y + flotte(t));
  ctx.save(); cam.applique(ctx);
  fenetres74(ctx, t);
  cadre74(ctx, t);
  foule(ctx, t, phiW, seg(t, B.P73, B.P73 + 1));
  ligneBalayage(ctx, t);
  legende(ctx, t, seg(t, B.P73, B.P73 + 1));
  n48_74(ctx, t, phiW);
  ctx.restore();
  terminal(ctx, t, LIGNES73, { ...TERM73, a: aTerm73(t) });
}
// le regard de Phi (P73–P74) : il regarde ce dont il parle (EPISODE.md, « Phi regarde »)
const visageDemo = T => { const k = Math.floor(hache(Math.floor(T / 1.4) * 37 + 11) * 100), f = DEMO[k]; return cam74(T).ecran(f.cx, f.cy - 12); };
const fen74 = j => T => { const c = centre(FEN74[j]); return cam74(T).ecran(c.x, c.y); };
const REG_LABO = creeRegard({
  repos: [[3, visageDemo], [2, VOUS], [1, T => plumeBoite(T)]],
  cibles: [
    // P73 : la foule ; le terminal ; la ligne du balayage, de haut en bas ; puis la foule, longuement ; une respiration
    [S.leve, 1.6, point(650, 470)],
    [S.droit, 2.6, T => plumeTerm73(T)],
    [S.balayage, BAL.d, T => point(650, yBalayage(T)), .14],
    [finBalayage, S.vraie - finBalayage, T => visageDemo(T), .9],
    [S.vraie + .6, 1.6, VOUS],
    // P74 : les deux fenêtres (le cadre qui saute) ; vous ; A, B ; le N°48 qui entre ; A, B ; le N°48 ; vers le bas
    [S.indecis + .1, TIRAGE74.t0 - S.indecis, fen74(0)],
    [TIRAGE74.t0, S.versVous - TIRAGE74.t0, T => { const E = tirage(T, TIRAGE74.t0, 2, TIRAGE74); return E ? fen74(E.cible)(T) : null; }, .2],
    [S.versVous, 2.8, VOUS],
    [S.descA, 1.6, fen74(0)],
    [S.descB, 1.6, fen74(1)],
    [S.aucune, S.seulement - S.aucune, tete48, .2],
    [S.seulement, 1.1, fen74(0)],
    [S.seulement + 1.1, S.d06 - S.seulement - 1.1, fen74(1)],
    [S.d06, S.attente - S.d06, tete48],
    [S.attente, B.P75 + .5 - S.attente, point(1490, 780)],
  ],
});
const H_LABO = [
  [S.leve, 'curieux'], [S.leve + 1.6, 'neutre'], [S.balayage, 'plisse', .3], [finBalayage + .2, 'neutre'],
  [S.vraie, { ...HUMEURS.bas, glow: .2 }], [S.indecis, 'doute'], [S.versVous, { ...HUMEURS.neutre, glow: .6 }],
  [S.descA, 'neutre'], [S.d06, 'curieux'], [S.attente, 'bas'],
];
function oeilLabo(ctx, t, o = {}) {
  const O = { ...OEIL_LABO, ...o };
  return oeil(ctx, t, { ...O, humeur: humeur(t, H_LABO), regard: o.regard ?? REG_LABO, alpha: o.alpha ?? 1 });
}
export function dessineP73(ctx, t, cam) { labo(ctx, t, cam); oeilLabo(ctx, t); }
export function dessineP74(ctx, t, cam) { labo(ctx, t, cam); oeilLabo(ctx, t); }

// ================================================================ P75 · l'écran 11 (resultats.js : ecranMeta)
// La barre A attend « presque à égalité », la barre B « 70 % » : l'écran est dessiné deux fois, sa boîte, sa légende et
// le N°48 (au pas 0, à la coupe), puis ses barres (leurs propres pas, calés sur les mots).
const D11_1 = Object.freeze([B.P75, Infinity]), D11_2 = Object.freeze([S.presque, S.bar70]);
const YB = 870, BH = 540;      // les barres de l'écran 11 (resultats.js, ecranMeta), dans les coordonnées de Thibaut
const BARRE = (R, j, v) => R.CADRE_RESULTATS.ecran(j ? 1160 : 760, YB - BH * v);
const memo = new Map();
const une = (cle, f) => { if (!memo.has(cle)) memo.set(cle, f()); return memo.get(cle); };
function regard75(R, Dn) {
  return une('r75', () => {
    const M = Dn ? Dn.META : null, a = M ? M.A.pctA / 100 : .487;
    return creeRegard({
      repos: [[3, VOUS], [1, T => plumeBoite(T)]],
      cibles: [
        [B.P75 + .2, 1.8, R.CADRE_RESULTATS.ecran(960, 210)],
        [B.P75 + 2.0, 1.4, R.CADRE_RESULTATS.ecran(960, YB - 40)],
        [S.presque, 2.0, BARRE(R, 0, .5)],
        [S.legere, 1.8, BARRE(R, 0, a + (1 - a) / 2)],
        [S.bar70, 2.2, BARRE(R, 1, .5)],
        [S.bar70 + 2.2, 1.4, BARRE(R, 1, .3 + .35)],
      ],
    });
  });
}
const H75 = [[B.P75, 'neutre'], [S.presque, 'curieux'], [S.bar70 + 1.2, 'grand'], [S.sans, 'curieux']];
export function dessineP75(ctx, t, cam, infos) {
  const R = infos.resultats; if (!R) return ebauche(ctx, t, cam, infos);
  R.fondResultats(ctx, t, 11, D11_1, {});
  const question = R.CADRE_RESULTATS.ecran(960, 210);
  // le N°48 regarde la question avant que les barres paraissent, puis la barre A, puis la barre B
  const sujet = (cle, e) => (cle === 'n48' && t < S.presque ? { ...e, cible: question, fixe: true } : e);
  R.ecranMeta(ctx, t, { etapes: D11_1, sans: ['barres'], instants: { regardB: S.bar70 + .3 }, phi: R.PHI, sujet });
  R.ecranMeta(ctx, t, { etapes: D11_2, sans: ['boite', 'legende', 'temoins', 'crochets'], phi: R.PHI });
  // « légère préférence » : la part B de la barre A pulse
  const k = cloche(t, S.legere, S.legere + .25, S.legere + 1.2, S.legere + 1.8);
  const M = infos.donnees ? infos.donnees.META : null;
  if (k > 0 && M) {
    const hB = BH * M.A.pctB / 100;
    ctx.save(); R.CADRE_RESULTATS.applique(ctx);
    ctx.globalAlpha = .22 * k; ctx.fillStyle = CRAIE; ctx.fillRect(760 - 85, YB - BH, 170, hB);
    R.cerne(ctx, 760 - 85, YB - BH, 170, hB, LABO, k, t);
    ctx.restore(); ctx.globalAlpha = 1;
  }
  oeil(ctx, t, { ...R.PHI, humeur: humeur(t, H75), regard: regard75(R, infos.donnees) });
}

// ================================================================ P76 · l'écran 12 avec les vrais humains (ecranScenarios)
// le pas 1 de Thibaut (la peur des treize, puis « LA BLEUE PERD : ≈ 13 MORTS », 1,6 s plus tard) : le texte tombe juste
// après « minimise le nombre de morts »
const D12 = Object.freeze([B.P76, S.minimise - 1.2]);
// le panneau B : les mêmes figures (PREMIERS[i]), d'autres rythmes (on ne respire pas tous ensemble)
const RYTHME_B = Object.freeze(PREMIERS.map(f => Object.freeze({ i: f.i + 100, r1: f.r3, r2: f.r1, r3: f.r2 })));
// l'écran 12, ses figures en vrais humains (une ombre au sol, une respiration, sans reflet, sans regarder Phi), sur
// ctx (sans fond) ; le crochet dessine l'ombre juste avant le bonhomme
function scenarios(ctx, t, R) {
  const sujet = (cle, e, T, info) => {
    if (typeof cle !== 'number') return e;
    const f = info.panneau === 'B' ? RYTHME_B[cle] : PREMIERS[cle], E = vraisHumains(f, e, T);
    ombre(ctx, info.x, info.y, info.cs, R.PHI, e.a ?? 1);
    return E;
  };
  return R.ecranScenarios(ctx, t, { etapes: D12, vraisHumains: true, phi: R.PHI, sujet });
}
// « Maintenant que vous les connaissez » : deux mini-jauges rappellent les résultats (donnees.js : CHOIX)
function miniJauges(ctx, t, Dn, a = 1) {
  const k = seg(t, S.maintenant, S.maintenant + .4) * a; if (k <= .001 || !Dn) return;
  [['A', Dn.CHOIX.A.pct], ['B', Dn.CHOIX.B.pct]].forEach(([l, v], j) => {
    const y = 160 + j * 42, x = 860, w = 170;
    ctx.globalAlpha = k; ctx.textBaseline = 'alphabetic';
    ctx.font = `22px ${PIX}`; ctx.fillStyle = LABO; ctx.textAlign = 'right'; ctx.fillText(l, x - 14, y + 9);
    ctx.fillStyle = '#1e1c20'; ctx.fillRect(x, y - 5, w, 10);
    ctx.fillStyle = BLEU; ctx.fillRect(x, y - 5, Math.round(w * v / 100), 10);
    ctx.fillStyle = ROUGE; ctx.fillRect(x + Math.round(w * v / 100) + 1, y - 5, w - Math.round(w * v / 100) - 1, 10);
    ctx.fillStyle = CRAIE; ctx.fillRect(x + w / 2 - 1, y - 9, 2, 18);
    ctx.font = `18px ${MONO}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'left'; ctx.fillText(pc(v), x + w + 14, y + 6);
  });
  ctx.globalAlpha = 1;
}
// pendant la question : les deux jauges des scénarios pulsent
function pulseJauges(ctx, t, R) {
  const k = seg(t, S.question, S.question + .3) * (1 - seg(t, S.autre, S.autre + .3)); if (k <= .001) return;
  ctx.save(); R.CADRE_RESULTATS.applique(ctx);
  [540, 1380].forEach((cx, j) => R.cerne(ctx, cx - 236, 852, 472, 32, LABO, k * (.55 + .45 * Math.sin(t * 5 + j * Math.PI)), t));
  ctx.restore(); ctx.globalAlpha = 1;
}
// le N°48, petit (cs 4), au milieu en bas, devant le filet ; il regarde les deux scénarios
const N48_76 = Object.freeze({ x: 960, y: 776 });
function cible76(t, R) {
  const C = R.CADRE_RESULTATS;
  if (t >= S.question) return Math.floor((t - S.question) / .8) % 2 ? C.ecran(1380, 557) : C.ecran(540, 557);
  if (t >= S.minimise) return C.ecran(1380, 868);
  if (t >= S.d11) return C.ecran(540, 868);
  if (t >= S.maintenant && t < S.maintenant + 2.4) return point(960, 180);
  return C.ecran(540, 557);
}
function n48_76(ctx, t, R, x = N48_76.x, y = N48_76.y, o = {}) {
  const a = (o.a ?? 1) * eBack(seg(t, B.P76 + .3, B.P76 + .8));
  if (a <= .001) return;
  dessineSujet(ctx, F48, x, y, 4, { col: GRIS_FIG, a: Math.min(1, a), mode: 'repos', phi: R.PHI, cible: o.cible ?? cible76(t, R), fixe: true, reflet: true, p: o.p }, t);
  crochets(ctx, x, y, 1, { a: Math.min(1, a), k: seg(t, B.P76 + .4, B.P76 + 1.1) });
}
function regard76(R) {
  return une('r76', () => {
    const C = R.CADRE_RESULTATS;
    return creeRegard({
      repos: [[3, VOUS], [1, T => plumeBoite(T)]],
      cibles: [
        [B.P76 + .3, 1.4, C.ecran(540, 557)],
        [S.maintenant, 2.4, point(960, 180)],
        [S.d11, 1.3, C.ecran(540 - 230 + 4.6 * 50, 868)],
        [S.d11 + 1.3, 1.6, C.ecran(1380 - 230 + 4.6 * 12.6, 868)],
        [S.minimise + .6, 1.4, C.ecran(1380, 930)],
        [S.question, S.autre - S.question, point(N48_76.x, N48_76.y - 12)],
      ],
    });
  });
}
const H76 = [[B.P76, 'doute'], [S.minimise, 'bas']];
export function dessineP76(ctx, t, cam, infos) {
  const R = infos.resultats; if (!R) return ebauche(ctx, t, cam, infos);
  R.fondResultats(ctx, t, 12, D12, {});
  scenarios(ctx, t, R);
  miniJauges(ctx, t, infos.donnees);
  pulseJauges(ctx, t, R);
  n48_76(ctx, t, R);
  oeil(ctx, t, { ...R.PHI, humeur: humeur(t, H76), regard: regard76(R) });
}

// ================================================================ P77 · le repli en deux fenêtres-icônes ; la grue
const ICONES = Object.freeze(POSES.icones.map(([x, y]) => Object.freeze({ x: x - 84, y: y - 56, w: 168, h: 112 })));
const D_REPLI = 1.1;
const kRepli = t => eIO(seg(t, S.autre, S.autre + D_REPLI));
const D_GRUE = 2.2, DESCENTE = 640;
export const kGrue = t => eIO(seg(t, S.elever, S.elever + D_GRUE));
const SOL_ETAGE = 556;                       // la ligne de sol en pointillés, entre les deux étages
// une fenêtre-icône : « DESCRIPTION » et sa lettre en grand
function icone(ctx, t, j, a) {
  if (a <= .001) return;
  const r = ICONES[j];
  fenetre(ctx, r.x, r.y, r.w, r.h, a);
  ctx.globalAlpha = a; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
  ctx.font = `500 12px ${MONO}`; ctx.fillStyle = LABO; ctx.fillText('DESCRIPTION', r.x + r.w / 2, r.y + 24);
  ctx.fillStyle = FILET; ctx.fillRect(r.x + 16, r.y + 33, r.w - 32, 2);
  ctx.font = `56px ${PIX}`; ctx.fillStyle = CRAIE; ctx.fillText('AB'[j], r.x + r.w / 2, r.y + 92);
  ctx.globalAlpha = 1;
}
// le N°48 après le repli : il quitte le milieu de l'écran 12 pour se tenir sous les deux fenêtres, seul
const N48_77 = Object.freeze({ x: 650, y: 508 });
function etat48_77(t) {
  const u = seg(t, S.autre + .25, S.autre + 1.35), k = eIO(u);
  return { x: lerp(N48_76.x, N48_77.x, k), y: lerp(N48_76.y, N48_77.y, k), marche: u > 0 && u < 1, n: Math.floor((t - S.autre) / .18) };
}
export const PAS77 = Object.freeze([...Array(6).keys()].map(k => +(S.autre + .25 + k * .18).toFixed(3)));
// la dispute d'en bas : les deux colonnes de P68, en petit (la bleue à gauche : BON / MÉCHANT ; la rouge : BON /
// MAUVAIS), un sujet sous chaque mot, et des bulles de jurons qui se croisent encore. Dans un repère de 1 920 × 540,
// posé à l'échelle s, son haut au milieu en (960, y0).
const JURONS = Object.freeze(['#%*x!', 'x*#%!']);
const PERIODE_JURON = 2.6;
function dispute(ctx, t, y0, s, a, phiEcran) {
  if (a <= .001) return;
  const ox = 960 - 960 * s, X = x => ox + x * s, Y = y => y0 + y * s, cs = Math.max(2, Math.round(12 * s));
  ctx.save(); ctx.translate(ox, y0); ctx.scale(s, s);
  ctx.globalAlpha = a; ctx.fillStyle = LAITON; ctx.fillRect(959, 0, 2, 520);
  const cols = [{ cx: 480, p: 0, mots: ['BON', 'MÉCHANT'] }, { cx: 1440, p: 1, mots: ['BON', 'MAUVAIS'] }];
  const places = [];
  for (const c of cols) {
    pilule(ctx, t, c.p, { x: c.cx, y: 80, ps: .34, a });
    ctx.globalAlpha = a; ctx.font = `44px ${PIX}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const w0 = ctx.measureText(c.mots[0]).width, ws = ctx.measureText(' / ').width, w1 = ctx.measureText(c.mots[1]).width, x0 = c.cx - (w0 + ws + w1) / 2;
    ctx.fillStyle = CRAIE; ctx.fillText(c.mots[0], x0, 220); ctx.fillText(c.mots[1], x0 + w0 + ws, 220);
    ctx.fillStyle = GRIS; ctx.fillText(' / ', x0 + w0, 220);
    // sous « BON », un sujet de sa couleur ; sous l'autre mot, un sujet de l'autre camp
    places.push({ x: x0 + w0 / 2, col: c.p ? ROUGE : BLEU, f: DEMO[c.p ? 61 : 12] }, { x: x0 + w0 + ws + w1 / 2, col: c.p ? BLEU : ROUGE, f: DEMO[c.p ? 74 : 33] });
  }
  // les bulles de jurons : du bleu « bon » vers la colonne rouge, du rouge « bon » vers la colonne bleue
  const vols = [{ de: places[0].x, a: places[2].x, y: 282, ph: 0 }, { de: places[2].x, a: places[0].x, y: 318, ph: 0 }];   // elles se croisent
  const recus = new Map();
  vols.forEach((v, j) => {
    const u = (((t - S.autre) / PERIODE_JURON + v.ph) % 1 + 1) % 1, x = lerp(v.de, v.a, eIO(seg(u, .05, .8))), ab = cloche(u, .05, .15, .78, .9);
    if (ab > 0) bulle(ctx, x - 80, v.y - 28, 160, 56, { txt: JURONS[j], taille: 28, font: MONO, a: a * ab, col: CRAIE });
    if (u > .8) recus.set(j ? 0 : 2, 1);   // celui qui reçoit sursaute
  });
  ctx.restore();
  places.forEach((P, k) => {
    const e = { col: P.col, a, mode: recus.has(k) ? 'peur' : 'repos', k: .8, phi: phiEcran, cible: phiEcran, reflet: false };
    dessineSujet(ctx, P.f, X(P.x), Y(420), cs, e, t);
  });
  ctx.globalAlpha = 1;
}
// le regard de P77 : le N°48 sous les icônes, A, B ; la grue : il monte et regarde en bas ; puis vous
function regard77(R) {
  return une('r77', () => creeRegard({
    repos: [[2, VOUS], [1, T => plumeBoite(T)]],
    cibles: [
      [B.P77, S.autre - B.P77, point(N48_76.x, N48_76.y - 12)],
      [S.autre, 1.3, T => point(ICONES[0].x + 84, 196)],
      [S.autre + 1.3, 1.2, point(ICONES[1].x + 84, 196)],
      [S.autre + 2.5, S.elever - S.autre - 2.5, point(N48_77.x, N48_77.y - 12)],
      [S.elever + .3, S.mechants - S.elever - .3, T => point(960, lerp(SOL_ETAGE + 40, 700, kGrue(T)))],
    ],
  }));
}
const H77 = [[B.P77, 'bas'], [S.autre, 'neutre'], [S.elever, 'curieux'], [S.mechants, 'neutre']];
// l'œil quitte sa place des écrans de Thibaut pour celle du laboratoire (P73–P74) pendant le repli ; puis il monte
// avec la caméra : il reste à sa place à l'écran
function placeOeil77(t, R) {
  const k = kRepli(t), P = R.PHI;
  return { x: lerp(P.x, OEIL_LABO.x, k), y: lerp(P.y, OEIL_LABO.y, k), taille: lerp(P.taille, OEIL_LABO.taille, k) };
}
let CALQUE77 = null;
export function dessineP77(ctx, t, cam, infos) {
  const R = infos.resultats; if (!R) return ebauche(ctx, t, cam, infos);
  const kr = kRepli(t), kg = kGrue(t), O = placeOeil77(t, R);
  // le fond : celui de l'écran 12 devient le laboratoire ; son sol de points descend avec la grue
  // (fondResultats est le fond du laboratoire centré en (900, 520), sans sol : le centre glisse vers (760, 470))
  if (kr <= 0) R.fondResultats(ctx, t, 12, D12, {});
  else {
    fond(ctx, t, { sol: 0, centre: [lerp(900, 760, kr), lerp(520, 470, kr)] });
    ctx.save(); ctx.translate(0, DESCENTE * kg); sol(ctx, .45 * kr); ctx.restore();
  }
  // l'écran 12, puis son repli : chaque moitié se replie dans sa fenêtre-icône
  if (kr <= 0) { scenarios(ctx, t, R); miniJauges(ctx, t, infos.donnees); pulseJauges(ctx, t, R); }
  else if (kr < 1) {
    if (!CALQUE77) CALQUE77 = toile(W, H);
    const L = CALQUE77.getContext('2d');
    L.setTransform(1, 0, 0, 1, 0, 0); L.globalAlpha = 1; L.clearRect(0, 0, W, H);
    scenarios(L, t, R); miniJauges(L, t, infos.donnees); pulseJauges(L, t, R);
    const a = 1 - seg(kr, .55, 1);
    [[0, 0], [1, 960]].forEach(([j, sx]) => {
      const r = ICONES[j], x = lerp(sx, r.x, kr), y = lerp(0, r.y, kr), w = lerp(960, r.w, kr), h = lerp(830, r.h, kr);
      ctx.globalAlpha = a; ctx.drawImage(CALQUE77, sx, 0, 960, 830, x, y, w, h);
    });
    ctx.globalAlpha = 1;
  }
  // les deux fenêtres-icônes, aux places des pilules d'index.html : un dilemme de plus, un étage au-dessus
  [0, 1].forEach(j => icone(ctx, t, j, seg(kr, .45, 1)));
  // la grue : la ligne de sol en pointillés ; dessous, la dispute d'en bas, petite, qui s'éloigne
  const ag = seg(kg, .15, .8);
  if (ag > 0) {
    tirets(ctx, 140, SOL_ETAGE, 1780, SOL_ETAGE, CRAIE, .7 * ag, 2, [8, 8]);
    dispute(ctx, t, lerp(536, 578, kg), lerp(.5, .4, kg), seg(kg, .3, 1), { x: O.x, y: O.y });
  }
  // le N°48 : au milieu de l'écran 12, puis seul sous les deux fenêtres
  const P = etat48_77(t);
  const cible = t < S.autre ? cible76(t, R) : t < S.autre + 1.4 ? point(P.x, 0)
    : t >= S.elever + 1 ? point(960, 760) : Math.floor((t - S.autre) / 1.6) % 2 ? centre(ICONES[1]) : centre(ICONES[0]);
  const p = P.marche ? { jambes: P.n % 2 ? 'saut' : 'droit', bob: 0, yx: N48_77.x < P.x ? -1 : 1, yy: 0 } : undefined;
  n48_76(ctx, t, R, P.x, P.y - (P.marche && P.n % 2 ? 2 : 0), { cible, p });
  oeil(ctx, t, { ...O, humeur: humeur(t, H77), regard: regard77(R) });
}

// ================================================================ les sons (tools/son-pilules.cjs)
const r3 = t => +t.toFixed(3);
const pan = x => clamp((x - 960) / 960 * .8, -1, 1);
// cent pouls, très bas, désaccordés : chacun son rythme (vraisHumains de commun.js : 62 à 88 par minute, f.r2 ; sa phase
// f.r3), panoramiqués selon leur place ; du balayage (P73) jusqu'à la grue (P77), où ils s'éteignent. Sur l'écran 12
// (P76–P77), les cinquante de gauche restent à leur rythme, ceux de droite battent plus vite (la peur).
function poulsDe(f, t0, t1, g, pn, vite = 1) {
  const bpm = (62 + (f.r2 ?? .5) * 26) * vite, ph = f.r3 ?? .5, T = 60 / bpm, out = [];
  for (let k = Math.ceil(t0 / T + ph); ; k++) {
    const t = (k - ph) * T; if (t >= t1) break;
    const gg = g * (1 - seg(t, S.elever, S.elever + D_GRUE));
    if (gg > .002) out.push({ t: r3(t), son: 'pouls', f: Math.round(44 + (f.r1 ?? .5) * 22), g: +gg.toFixed(4), pan: pn });
  }
  return out;
}
const G_POULS = .017;   // chacun : cent ensemble font un murmure (≈ 3 dB au-dessus de la nappe seule)
const POULS = (() => {
  const out = [];
  for (const f of DEMO) {
    const t0 = passe(f) + .25;
    out.push(...poulsDe(f, t0, B.P76, G_POULS, +pan(f.cx).toFixed(2)));
    const droite = f.i >= 50;
    out.push(...poulsDe(f, B.P76, S.elever + D_GRUE, G_POULS, droite ? .55 : -.55, droite ? 1.3 : 1));
  }
  // deux sons ne tombent jamais au même instant pile (chaque indice est pris par une image et une seule : peu importe ;
  // mais le même pouls deux fois serait un écho)
  return out.sort((a, b) => a.t - b.t);
})();
const tPas = PAS48.map(p => ({ t: p.t, son: 'tic', f: 320, g: .13, pan: pan(p.x) }));
export const SONS_META = Object.freeze([
  { t: B.P73, son: 'nappe', f: 'labo', g: .5 },
  // P73 : le terminal ; le balayage, un souffle fin qui descend ; puis les cent pouls
  { t: r3(S.droit), son: 'frappe', d: 1.4, g: .14, pan: .6 },
  { t: r3(LIGNES73[1].t0), son: 'frappe', d: .7, g: .1, pan: .6 },
  { t: r3(S.balayage), son: 'souffle', d: BAL.d, f: [2600, 900], g: .16 },
  ...POULS,
  // P74 : les fenêtres ; les tic du tirage qui hésite, sans clac ; l'arrêt ; les pas du N°48 ; l'éclat des pilules
  { t: r3(S.indecis), son: 'pop', f: 700, g: .22, pan: -.4 },
  ...SAUTS74.map((t, k) => ({ t: r3(t), son: 'tic', f: 2400, g: .24, pan: k % 2 ? -.15 : -.5 })),
  { t: r3(S.versVous), son: 'souffle', d: .45, f: [1400, 700], g: .12, pan: -.3 },
  { t: r3(S.descA), son: 'tic', f: 1800, g: .14, pan: -.5 },
  { t: r3(S.descB), son: 'tic', f: 1800, g: .14, pan: -.15 },
  ...tPas,
  { t: r3(ECLAT74), son: 'grain', d: .9, f: 3000, g: .16, pan: -.3 },
  // P75 : les barres (un souffle), un tic par chiffre
  ...[S.presque, S.bar70].flatMap((t, j) => [
    { t: r3(t + .2), son: 'souffle', d: 1.2, f: [300, 900], g: .2, pan: j ? .2 : -.2 },
    { t: r3(t + 1.2), son: 'tic', f: 2200, g: .2, pan: j ? .2 : -.2 },
    { t: r3(t + 1.32), son: 'tic', f: 2600, g: .2, pan: j ? .2 : -.2 },
  ]),
  // P76 : la peur, très bas, à droite ; un tic pour « ≈ 13 MORTS »
  { t: r3(D12[1]), son: 'peur', d: 3.6, g: .1, pan: .55 },
  { t: r3(D12[1] + 1.6), son: 'tic', f: 1700, g: .2, pan: .55 },
  // P77 : le repli (un souffle) ; les pas du N°48 ; la grue (un souffle qui monte) ; la rumeur de la dispute d'en bas
  { t: r3(S.autre), son: 'souffle', d: .9, f: [1600, 500], g: .2 },
  ...PAS77.map(t => ({ t, son: 'tic', f: 300, g: .07, pan: -.2 })),
  { t: r3(S.elever), son: 'souffle', d: D_GRUE, f: [260, 1500], g: .32 },
  // (les deux bulles partent ensemble, à chaque période : un pop chacune, puis un grain bref quand elles se croisent)
  ...[...Array(7).keys()].map(k => S.autre + (k + .05) * PERIODE_JURON).filter(t => t > S.elever + .4 && t < B.P78 - .4)
    .flatMap((t, k) => [
      { t: r3(t), son: 'pop', f: 520, g: +(.05 * Math.pow(.75, k)).toFixed(4), pan: -.2 },
      { t: r3(t + .02), son: 'pop', f: 460, g: +(.05 * Math.pow(.75, k)).toFixed(4), pan: .2 },
      { t: r3(t + PERIODE_JURON * .38), son: 'grain', d: .35, f: 1800, g: +(.05 * Math.pow(.75, k)).toFixed(4) },
    ]),
]);
