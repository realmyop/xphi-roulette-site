/* ==========================================================================
   Les deux pilules, l'épisode — plans/fin-nuit.js : l'œil seul, le teaser,
   l'œil qui se ferme, le générique de fin
   P82–P85, de 1332,1 à 1401,4 s (22:12,1–23:21,4), répliques F01–F07.

   [VISUEL : l'œil de Phi, seul au centre de l'écran.] La nuit de
   l'ouverture (commun.js : FOND_NUIT), l'œil en (960, 420), 300 px : la
   boucle du numéro se referme. Rien d'autre que lui, et ce qu'un œil peut
   faire : vous regarder, chercher (quatre petites saccades autour de vous),
   balayer le vide (une ligne LABO qui ne trouve rien), baisser les yeux vers
   la boîte où s'écrivent ses propres questions, hésiter, sourire de la lueur,
   laisser voir un défaut — une lame du diaphragme se décale, tremble, se
   remet — ; enfin la poussière de caractères vient tourner autour de lui,
   sans se poser. Très lente poussée ×1 → ×1,1 sur tout le plan (l'œil grandit
   de 300 à 330 px, la poussière s'écarte du centre).
   [TEASER : l'expérience du prochain numéro.] Le terminal du test, à sa
   place d'index.html (110, 160), tape « > charger test_02. » et son curseur
   attend le nom ; un carton « PROCHAIN NUMÉRO » / « à venir ». Rien d'autre
   n'est inventé.
   [VISUEL : l'œil se ferme lentement. GÉNÉRIQUE DE FIN.] Les lames se
   referment, la lueur s'éteint, les caractères qui tournaient retombent en
   poussière ; noir. Puis le générique : ses lignes montent lentement, et les
   cent premiers participants traversent en file ; le dernier, le N°48, se
   retourne et lève les yeux là où était l'œil.

   L'œil de commun.js (dessineOeil, oeil) n'a pas de lame à part : il est
   recopié ici (son origine en commentaire), avec une seule chose en plus, le
   décalage d'une lame (« défaut de fabrication »).
   ========================================================================== */
import {
  W, H, CRAIE, GRIS, GRIS_FIG, LABO, MONO, PIX, NB,
  clamp, lerp, seg, cloche, eIO, eOut, hache, rgba, fr,
  fond, FOND_NUIT, POUSSIERE, HUMEURS, humeur, cligne, microsaccade, flotte, creeRegard, VOUS, point,
  carton, dessineSujet, PREMIERS, N48, crochets,
} from '../commun.js';
import { plume as plumeBoite } from '../texte.js';
import { B, S } from './fin-temps.js';

// ================================================================ l'œil, avec une lame à part
// commun.js, dessineOeil (recopié) : o.lame = { k (la lame, 0 à 5), dx, dy (en unités de l'œil : 100 = son diamètre) }
function dessineOeilLame(ctx, cx, cy, size, s, alpha = 1, lame = null) {
  if (alpha <= .001 || size <= 0) return;
  const R0 = 12.5, RIN = 31 - 2.6 - .4;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy); ctx.scale(size / 100, size / 100); ctx.translate(-50 + (s.dx || 0), -50);
  ctx.translate(50, 50); ctx.rotate(s.rot * Math.PI / 180); ctx.translate(-50, -50);
  const ox = 50 + s.x, oy = 50 + s.y, r = Math.max(0, s.r);
  const ha = clamp(s.glow, 0, 1) * Math.min(1, r / 6), hr = (6 + 8 * s.glow) * 1.7;
  if (ha > 0) {
    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, hr);
    g.addColorStop(0, rgba(LABO, .9 * ha)); g.addColorStop(1, rgba(LABO, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, hr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = CRAIE; ctx.lineCap = 'round';
  ctx.lineWidth = 5.2;
  ctx.beginPath(); ctx.arc(50, 50, 31, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(50, 4); ctx.lineTo(50, 17); ctx.moveTo(50, 83); ctx.lineTo(50, 96); ctx.stroke();
  const a0 = -90 + (R0 - r) * 2.6, Vx = [], U = [];
  for (let k = 0; k < 6; k++) { const a = (a0 + 60 * k) * Math.PI / 180; U.push([Math.cos(a), Math.sin(a)]); Vx.push([ox + r * Math.cos(a), oy + r * Math.sin(a)]); }
  ctx.lineWidth = 2.1; ctx.globalAlpha = alpha * .9; ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const p = (k + 5) % 6; let dx = U[k][0] - U[p][0], dy = U[k][1] - U[p][1]; const L = Math.hypot(dx, dy); dx /= L; dy /= L;
    const [x0, y0] = Vx[k], bx = x0 - 50, by = y0 - 50, b = bx * dx + by * dy, c = bx * bx + by * by - RIN * RIN;
    const t = -b + Math.sqrt(Math.max(0, b * b - c));
    // (l'ajout : la lame k décalée)
    const ex = lame && lame.k === k ? lame.dx : 0, ey = lame && lame.k === k ? lame.dy : 0;
    ctx.moveTo(Vx[p][0] + ex, Vx[p][1] + ey); ctx.lineTo(x0 + dx * t + ex, y0 + dy * t + ey);
  }
  ctx.stroke(); ctx.globalAlpha = alpha;
  const pr = Math.min(4.2, r * .62);
  if (pr > .05) {
    ctx.fillStyle = LABO; ctx.beginPath(); ctx.arc(ox, oy, pr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(ox + pr * .33, oy - pr * .33, pr * .24, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// commun.js, oeil (recopié), qui dessine avec dessineOeilLame ; o.lame en plus
function oeilNuit(ctx, T, o) {
  const { x, taille = 300, alpha = 1, ouvert = 1 } = o;
  const y = o.y + flotte(T, o.flotte ?? 4);
  const e = { ...HUMEURS.neutre, ...(typeof o.humeur === 'string' ? HUMEURS[o.humeur] : o.humeur || {}) };
  if (o.lueur !== undefined) e.glow = o.lueur;
  let g = o.regard;
  if (g && g.pupille) g = g.pupille(T, x, y, e.r);
  g = g || { gx: 0, gy: 0, w: 1 };
  const [mx, my] = microsaccade(T), gx = g.gx + mx, gy = g.gy + my, a = -e.rot * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  e.x = e.x * g.w + gx * ca - gy * sa; e.y = e.y * g.w + gx * sa + gy * ca;
  e.r *= (o.cligne === false ? 1 : cligne(T)) * ouvert;
  e.glow += .06 * Math.sin(T * 2.1);
  dessineOeilLame(ctx, x, y, taille, e, alpha, o.lame);
  return { x, y, regard: g };
}

// ================================================================ la nuit, la poussée, la poussière qui tourne
const OEIL = Object.freeze({ x: 960, y: 420, taille: 300 });
const zoom = t => 1 + .1 * eIO(seg(t, B.P82, B.P83));
// chaque caractère de la poussière de la nuit (commun.js : POUSSIERE, à la vitesse de FOND_NUIT) : sa dérive libre, puis,
// sur « les choses qui pensent », il glisse vers une orbite autour de l'œil (un rayon, une vitesse, une phase à lui) ; à la
// fermeture, il retombe et s'éteint
const ORBITES = Object.freeze(POUSSIERE.map((p, j) => Object.freeze({
  a0: hache(j * 7 + 1) * Math.PI * 2, w: .1 + hache(j * 11 + 3) * .16, R: 180 + hache(j * 17 + 5) * 190, d: hache(j * 13 + 9) * 1.8,
})));
function poussiereNuit(ctx, t) {
  const z = zoom(t), u = t * FOND_NUIT.vitesse;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  POUSSIERE.forEach((p, j) => {
    const O = ORBITES[j];
    let x = ((p.x + p.vx * u) % W + W) % W, y = ((p.y + p.vy * u) % H + H) % H;
    x = OEIL.x + (x - OEIL.x) * z; y = OEIL.y + (y - OEIL.y) * z;
    const k = eIO(seg(t, S.pensent + O.d, S.pensent + O.d + 3.4));
    if (k > 0) {
      const th = O.a0 + O.w * (t - S.pensent);
      x = lerp(x, OEIL.x + O.R * Math.cos(th), k); y = lerp(y, OEIL.y + .82 * O.R * Math.sin(th), k);
    }
    let a = p.a * (1 + 1.4 * k);
    const f = seg(t, S.ferme0 + O.d * .4, S.ferme0 + 1.9 + O.d * .4);
    if (f > 0) { y += 320 * f * f; a *= 1 - f; }
    if (a <= .002) return;
    ctx.globalAlpha = a; ctx.fillStyle = p.c; ctx.font = `${p.sz}px ${MONO}`; ctx.fillText(p.g, x, y);
  });
  ctx.globalAlpha = 1;
}
// « mesurer » : une ligne de balayage traverse la nuit de haut en bas, et ne trouve rien
const D_SCAN = 1.8;
const yScan = t => lerp(-10, 840, seg(t, S.mesurer, S.mesurer + D_SCAN));
function balayageVide(ctx, t) {
  if (t < S.mesurer || t > S.mesurer + D_SCAN) return;
  const y = Math.round(yScan(t)), g = ctx.createLinearGradient(0, y - 60, 0, y);
  g.addColorStop(0, rgba(LABO, 0)); g.addColorStop(1, rgba(LABO, .09));
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, y - 60, W, 60);
  ctx.globalAlpha = .55; ctx.fillStyle = LABO; ctx.fillRect(0, y - 1, W, 2); ctx.globalAlpha = 1;
}
// « défaut de fabrication » : une lame se décale d'un cran (1,5 unité du dessin de l'œil, 5 px à cette taille), tremble
// 1,5 s, puis se remet
const D_LAME = 1.5;
const lame = t => (t >= S.defaut && t < S.defaut + D_LAME ? { k: 4, dx: 1.5 + .45 * Math.sin((t - S.defaut) * 46), dy: .7 } : null);

// ================================================================ le teaser : le terminal du test, le carton
const TERM = Object.freeze({ x: 110, y: 160, txt: '> charger test_02.', cps: 24, t0: S.teaser + .3 });
const aTeaser = t => 1 - seg(t, B.P84, B.P84 + .8);
function terminalTeaser(ctx, t) {
  const a = aTeaser(t); if (t < TERM.t0 || a <= .001) return null;
  const chars = [...TERM.txt], n = clamp(Math.floor((t - TERM.t0) * TERM.cps), 0, chars.length), vis = chars.slice(0, n).join('');
  ctx.globalAlpha = a; ctx.font = `34px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = CRAIE;
  ctx.fillText(vis, TERM.x, TERM.y);
  // le curseur bloc LABO : au bout de ce qui s'écrit ; puis il clignote là où le nom devrait suivre
  const xc = TERM.x + ctx.measureText(vis).width + 4;
  if (n < chars.length || Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = LABO; ctx.fillRect(xc, TERM.y - 17, 20, 34); }
  ctx.globalAlpha = 1;
  return point(xc, TERM.y);
}
const CARTON = Object.freeze({ t0: S.teaser + 1.5, y: 760 });
function cartonTeaser(ctx, t) {
  const a = aTeaser(t); if (t < CARTON.t0 || a <= .001) return;
  carton(ctx, t, {
    a, y: CARTON.y, lignes: [
      { txt: 'PROCHAIN NUMÉRO', taille: 32, col: CRAIE, font: PIX, t0: CARTON.t0, cps: 20 },
      { txt: 'à venir', taille: 18, col: GRIS, font: MONO, t0: CARTON.t0 + 1.1, cps: 14 },
    ],
  });
}

// ================================================================ P82–P84 : un seul plan, l'œil
const SACCADES = Object.freeze([[70, 46], [-84, 30], [46, -52], [-58, -40]]);
const REG_NUIT = creeRegard({
  repos: [[1, VOUS]],
  cibles: [
    [B.P82, S.aligner - B.P82, point(640, 330)],
    [S.aligner, S.quelquePart - S.aligner, VOUS],
    ...SACCADES.map(([dx, dy], j) => [S.quelquePart + .1 + .38 * j, .38, point(OEIL.x + dx, OEIL.y + dy)]),
    [S.mesurer, D_SCAN, T => point(OEIL.x, yScan(T)), .12],
    [S.questions, 2.8, T => plumeBoite(T) || point(700, 930), .3],
    [S.formulations, 1.4, T => plumeBoite(T) || point(800, 930), .3],
    [TERM.t0, 1.4, T => point(TERM.x + 21 * clamp((T - TERM.t0) * TERM.cps, 0, 18), TERM.y), .25],
    [CARTON.t0 + .2, 1.6, point(960, CARTON.y)],
  ],
});
const H_NUIT = [
  [B.P82, 'neutre'], [S.differemment, 'doute'], [S.differemment + .9, 'curieux'], [S.prompte, { ...HUMEURS.neutre, glow: .85 }, .3],
  [S.prompte + .8, 'neutre'], [S.pensent, { ...HUMEURS.grand, glow: .5 }], [S.formulations, 'curieux'], [S.teaser, { ...HUMEURS.neutre, glow: .45 }],
];
function nuit(ctx, t) {
  fond(ctx, t, { ...FOND_NUIT, poussiere: 0 });
  balayageVide(ctx, t);
  poussiereNuit(ctx, t);
  terminalTeaser(ctx, t);
  cartonTeaser(ctx, t);
  const h = humeur(t, H_NUIT), kf = eIO(seg(t, S.ferme0, S.ferme1));
  oeilNuit(ctx, t, { ...OEIL, taille: OEIL.taille * zoom(t), humeur: h, regard: REG_NUIT, lame: lame(t), ouvert: 1 - kf, lueur: h.glow * (1 - kf) });
  // le noir (EPISODE.md, P84 : « 1385,0 : noir »)
  const n = seg(t, S.ferme1, S.noir);
  if (n > 0) { ctx.globalAlpha = n; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
export const dessineP82 = (ctx, t) => nuit(ctx, t);
export const dessineP83 = (ctx, t) => nuit(ctx, t);
export const dessineP84 = (ctx, t) => nuit(ctx, t);

// ================================================================ P85 · le générique de fin
const GENERIQUE = Object.freeze([
  { txt: 'XPHI · LES DEUX PILULES', font: PIX, taille: 48, col: CRAIE, apres: 84 },
  { txt: fr('texte : Thibaut Giraud'), taille: 22, col: CRAIE },
  { txt: fr('d’après le questionnaire « A ou B ? » de Monsieur Phi'), taille: 22, col: CRAIE },
  { txt: fr(`chiffres : questionnaire de Monsieur Phi (près de 10${NB}000 répondants), présentés comme ceux de la collecte`), taille: 22, col: GRIS },
  { txt: fr('messages des réseaux : inventés, provisoires'), taille: 22, col: GRIS },
  { txt: fr('voix : à enregistrer'), taille: 22, col: GRIS },
  { txt: 'animatique · prototype', taille: 22, col: GRIS },
  { txt: fr('les autres noms : à compléter'), taille: 18, col: GRIS, a: .7 },
].map(Object.freeze));
const Y_GEN = 600, MONTEE = 24;   // le titre part de y 600 et monte de 24 px par seconde
function lignesGenerique(ctx, t) {
  let y = Y_GEN - MONTEE * (t - B.P85);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  GENERIQUE.forEach((l, i) => {
    const a = (l.a ?? 1) * seg(y, 780, 700) * seg(t, B.P85 + .2 + .2 * i, B.P85 + 1 + .2 * i);
    if (a > .001) { ctx.globalAlpha = a; ctx.font = `${l.taille}px ${l.font ?? MONO}`; ctx.fillStyle = l.col; ctx.fillText(l.txt, 960, y); }
    y += l.apres ?? 52;
  });
  ctx.globalAlpha = 1;
}
// la file des cent premiers participants (PREMIERS, chacun sa coiffe), de gauche à droite, à petits pas (cs 3) ; le N°48
// en dernier : il s'arrête, se retourne, et lève les yeux là où était l'œil
const FILE = Object.freeze([...PREMIERS.filter(f => f.i !== N48), PREMIERS[N48]]);
const FILE_Y = 812, ECART = 30, V_FILE = 220, X_STOP = 1300;
const T_STOP = B.P85 + 13.2, T_RETOURNE = B.P85 + 13.6, T_LEVE = B.P85 + 14.5;
const xTete = t => X_STOP + (FILE.length - 1) * ECART - V_FILE * (T_STOP - t);   // le premier de la file
function file(ctx, t) {
  const x0 = xTete(t), phi = point(OEIL.x, OEIL.y);
  FILE.forEach((f, j) => {
    const dernier = j === FILE.length - 1;
    let x = x0 - j * ECART;
    if (dernier) x = Math.min(x, X_STOP);
    if (x < -30 || x > W + 30) return;
    const marche = !dernier || t < T_STOP, n = Math.floor((t + hache(f.i * 3 + 1) * .44) / .22);
    let p, cible = null, fixe = false;
    if (marche) p = { jambes: n % 2 ? 'saut' : 'droit', bob: 0, yx: 1, yy: 0 };
    else if (t < T_RETOURNE) p = { yx: 1, yy: 0 };
    else if (t < T_LEVE) p = { yx: -1, yy: 0 };
    else { cible = phi; fixe = true; }
    dessineSujet(ctx, f, x, FILE_Y - (marche && n % 2 ? 1 : 0), 3, { col: GRIS_FIG, mode: 'repos', phi, cible, fixe, reflet: false, p }, t);
    if (dernier) crochets(ctx, x, FILE_Y, .75, { a: seg(t, T_STOP - 1.2, T_STOP - .6), k: seg(t, T_STOP - .6, T_STOP + .4) });
  });
}
export function dessineP85(ctx, t) {
  fond(ctx, t, FOND_NUIT);
  lignesGenerique(ctx, t);
  file(ctx, t);
}

// ================================================================ les sons (tools/son-pilules.cjs)
const r3 = t => +t.toFixed(3);
const PAS_FILE = (() => { const out = []; for (let t = B.P85 + .1; t < T_STOP + .1; t += .44) out.push({ t: r3(t), son: 'tic', f: 260, g: .03, pan: .2 }); return out; })();
export const SONS_NUIT = Object.freeze([
  // P82 : la nappe de nuit, seule ; le balayage, un souffle très fin ; la lame, un minuscule declic (et quand elle se remet) ;
  // la poussière qui vient ; à la fin, la première note du motif de Phi, tenue
  { t: B.P82, son: 'nappe', f: 'nuit', g: .55 },
  { t: r3(S.mesurer), son: 'souffle', d: D_SCAN, f: [3400, 2300], g: .07 },
  { t: r3(S.defaut), son: 'declic', g: .08 },
  { t: r3(S.defaut + D_LAME), son: 'declic', g: .06 },
  { t: r3(S.pensent + .4), son: 'grain', d: 3, f: 1500, g: .05 },
  { t: r3(S.finF06 + .1), son: 'note', f: 659.25, d: 3.2, g: .14 },
  // P83 : la frappe du terminal ; le motif de Phi, la moitié seulement (il reste en suspens)
  { t: r3(TERM.t0), son: 'frappe', d: [...TERM.txt].length / TERM.cps, g: .16, pan: -.6 },
  { t: r3(CARTON.t0), son: 'frappe', d: .8, g: .1 },
  { t: r3(CARTON.t0 + .2), son: 'note', f: 659.25, d: 1.1, g: .12 },
  { t: r3(CARTON.t0 + .56), son: 'note', f: 783.99, d: 2.4, g: .12 },
  // P84 : la nappe s'éteint avec la lueur ; la dernière note du motif, tenue jusqu'au noir
  { t: r3(S.ferme0), son: 'nappe', f: 'nuit', g: 0 },
  { t: r3(B.P84 + .2), son: 'motif', f: 'derniere', d: 3.4, g: .2 },
  // P85 : le motif de Phi, lent, une seule fois ; les pas des cent, très doux ; le N°48 se retourne
  { t: r3(B.P85 + .6), son: 'motif', f: 'lent', g: .24 },
  ...PAS_FILE,
  { t: r3(T_RETOURNE), son: 'tic', f: 340, g: .06, pan: .35 },
]);
