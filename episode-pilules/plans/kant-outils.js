/* ==========================================================================
   Les deux pilules, l'épisode — plans/kant-outils.js : les petits dessins du
   lot « kant » que commun.js n'a pas (EPISODE.md, P19–P31)

   La pièce de la fausse promesse (pleine, ou en pointillés dans la bulle de
   pensée ; elle tourne sur elle-même), la mini-bulle et le petit « x » de la
   vague de proche en proche (P24), les mots qui partent en caractères (les
   bulles, jamais les gens), les quatre cases des configurations (P29, P30),
   les anneaux du signal (P30), le contour en tirets qui se trace (P31), une
   étiquette posée sur un fond sombre, un texte tapé, la vignette de Kant.
   Des pixels calculés, des formes exactes ; tout est fonction de ses
   arguments (aucun état d'une image à l'autre, jamais Math.random).
   ========================================================================== */
import {
  CRAIE, GRIS, LABO, LAITON, BLEU, ROUGE, FOND_FENETRE, MONO, PIX, G,
  clamp, lerp, seg, eOut, eBack, hache, mix, texteSignes, fenetre, portrait,
} from '../commun.js';

// ---------------------------------------------------------------- la pièce
// Un disque de 5 × 5 cases (les coins vides), des cases de c px, centré en (x, y). o : { a (1), contour (false : pleine ;
// true : le contour seul, case par case, en pointillés), larg (5 : sa largeur en cases ; elle tourne : 5 → 1 → 5),
// col (CRAIE), ombre (un y : son ombre au sol, sous elle) }
const DISQUE = Object.freeze(['.###.', '#####', '#####', '#####', '.###.']);
const plein = (i, j) => j >= 0 && j < 5 && i >= 0 && i < 5 && DISQUE[j][i] === '#';
const BORD = Object.freeze([...Array(25).keys()].filter(k => {
  const i = k % 5, j = Math.floor(k / 5);
  return plein(i, j) && (!plein(i - 1, j) || !plein(i + 1, j) || !plein(i, j - 1) || !plein(i, j + 1));
}));
export function piece(ctx, x, y, c, o = {}) {
  const a = o.a ?? 1; if (a <= .001) return;
  const larg = clamp(o.larg ?? 5, 1, 5), col = o.col ?? CRAIE, cw = larg * c / 5;
  ctx.globalAlpha = a;
  if (o.ombre !== undefined) {
    ctx.fillStyle = 'rgba(0,0,0,.42)';
    ctx.fillRect(Math.round(x - 2 * c), Math.round(o.ombre), Math.round(4 * c), Math.max(2, Math.round(c * .6)));
  }
  const x0 = x - 2.5 * cw, y0 = Math.round(y - 2.5 * c);
  for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) {
    if (!plein(i, j)) continue;
    const bord = BORD.includes(j * 5 + i);
    if (o.contour && !bord) continue;
    const xa = Math.round(x0 + i * cw), xb = Math.max(xa + 1, Math.round(x0 + (i + 1) * cw));
    if (o.contour) { ctx.fillStyle = col; ctx.fillRect(xa + 1, y0 + j * c + 1, Math.max(1, xb - xa - 2), c - 2); continue; }
    // la frappe de la pièce : le centre, une case d'ombre ; le reste en craie
    ctx.fillStyle = i === 2 && j === 2 ? mix(col, '#0c0b0d', .45) : bord ? col : mix(col, LAITON, .25);
    ctx.fillRect(xa, y0 + j * c, xb - xa, c);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- la vague de la fausse promesse (P24)
// La mini-bulle : 16 × 12 px, trois points, sa queue d'une case vers le sujet ; (x, y) : le milieu de son bord bas.
// k : l'ouverture (0 → 1, elle grandit de 0,5 à 1). Des rectangles pleins : net, et peu coûteux (cent à la fois).
export function miniBulle(ctx, x, y, a, k = 1, col = CRAIE) {
  if (a <= .001 || k <= 0) return;
  const s = lerp(.5, 1, eBack(clamp(k))), w = Math.round(16 * s), h = Math.round(12 * s), x0 = Math.round(x - w / 2), y0 = Math.round(y - h);
  ctx.globalAlpha = a;
  ctx.fillStyle = FOND_FENETRE; ctx.fillRect(x0, y0, w, h);
  ctx.fillStyle = col;
  ctx.fillRect(x0, y0, w, 2); ctx.fillRect(x0, y0 + h - 2, w, 2); ctx.fillRect(x0, y0, 2, h); ctx.fillRect(x0 + w - 2, y0, 2, h);
  ctx.fillRect(Math.round(x) - 1, y0 + h, 2, 2);   // la queue
  if (s > .8) for (let d = 0; d < 3; d++) ctx.fillRect(x0 + 3 + d * 4, y0 + Math.round(h / 2) - 1, 2, 2);
  ctx.globalAlpha = 1;
}
// le petit « x » à la hanche (les doigts croisés qu'on ne voit pas de face) : trois cases de u px en croix, centré en (x, y)
export function croixHanche(ctx, x, y, u, a, col = CRAIE) {
  if (a <= .001) return;
  ctx.globalAlpha = a; ctx.fillStyle = col;
  const x0 = Math.round(x - 1.5 * u), y0 = Math.round(y - 1.5 * u);
  for (const [i, j] of [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]]) ctx.fillRect(x0 + i * u, y0 + j * u, u, u);
  ctx.globalAlpha = 1;
}
// les mots qui partent en caractères (la dissolution du film, appliquée aux bulles, jamais aux gens) : k de 0 (sur la
// bulle) à 1 (partis) ; joué de 1 à 0, c'est le rembobinage (les caractères redescendent et refont la bulle).
// (x, y) : le milieu de la bulle ; graine : pour que chaque bulle ait ses caractères.
export function envolMots(ctx, x, y, k, graine, o = {}) {
  if (k <= 0 || k >= 1) return;
  const n = o.n ?? 5, z = o.taille ?? 12, haut = o.haut ?? 90;
  ctx.font = `${z}px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let j = 0; j < n; j++) {
    const h = hache(graine * 31 + j * 7 + 3), ph = h * 6.283, q = clamp(k * (1.15 + .3 * h) - .1 * h);
    if (q <= 0 || q >= 1) continue;
    const px = x - 6 + j * 3 + Math.sin(q * 5 + ph) * 10 * q, py = y - Math.pow(q, 1.3) * haut * (.7 + .6 * h);
    ctx.globalAlpha = (1 - q) * .95; ctx.fillStyle = mix(CRAIE, LABO, Math.min(1, q * 1.6));
    ctx.fillText(G[Math.floor(h * 1000) % G.length], Math.round(px), Math.round(py));
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- les quatre configurations (P29, P30)
// Quatre petites cases côte à côte, centrées en x, leur haut en y : dans chacune, la configuration (une mini-jauge : la
// part des autres qui prend la bleue) et, une fois allumée, ce qui arrive au sujet cerclé (✓ LABO : il vit ; ✗ CRAIE :
// il meurt). cfgs : [{ fb, verdict, t }] ; o : { a, actuelle (l'indice de la configuration jouée : son cadre en laiton) }
export const CASE = Object.freeze({ w: 66, h: 62, gap: 12 });
export function casesConfig(ctx, T, x, y, cfgs, o = {}) {
  const a = o.a ?? 1; if (a <= .001) return;
  const n = cfgs.length, L = n * CASE.w + (n - 1) * CASE.gap, x0 = Math.round(x - L / 2);
  cfgs.forEach((c, i) => {
    const cx = x0 + i * (CASE.w + CASE.gap), act = o.actuelle === i;
    ctx.globalAlpha = a;
    ctx.fillStyle = FOND_FENETRE; ctx.fillRect(cx, y, CASE.w, CASE.h);
    ctx.strokeStyle = act ? LAITON : GRIS; ctx.lineWidth = act ? 3 : 2; ctx.strokeRect(cx, y, CASE.w, CASE.h);
    // la configuration : la part des autres qui prend la bleue
    const jw = 46, jx = cx + (CASE.w - jw) / 2, jy = y + 10;
    ctx.fillStyle = ROUGE; ctx.fillRect(jx, jy, jw, 6);
    if (c.fb > 0) { ctx.fillStyle = BLEU; ctx.fillRect(jx, jy, Math.round(jw * c.fb), 6); }
    // le verdict, quand la case s'allume
    if (T >= c.t) {
      const k = eBack(seg(T, c.t, c.t + .3));
      ctx.globalAlpha = a * clamp(k); ctx.fillStyle = c.verdict === '✓' ? LABO : CRAIE;
      ctx.font = `${Math.max(1, Math.round(30 * k))}px ${PIX}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      texteSignes(ctx, c.verdict, cx + CASE.w / 2, y + 40);
    }
  });
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- les anneaux du signal (P30)
// Trois cercles exacts qui partent de (x, y) aux instants t0s et s'élargissent en d secondes jusqu'à r (BLEU_TXT, 2 px,
// α 0,5 qui s'éteint au bord)
export function ondes(ctx, T, x, y, t0s, o = {}) {
  const d = o.d ?? 1.2, r = o.r ?? 640, col = o.col ?? BLEU;
  ctx.save(); ctx.lineWidth = o.lw ?? 2; ctx.strokeStyle = col;
  for (const t0 of t0s) {
    const k = seg(T, t0, t0 + d); if (k <= 0 || k >= 1) continue;
    ctx.globalAlpha = (o.a ?? .5) * (1 - k * k);
    ctx.beginPath(); ctx.arc(x, y, 10 + (r - 10) * eOut(k), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- le contour qui se trace (P31)
// Un cercle en tirets, tracé depuis le haut dans le sens des aiguilles d'une montre : k de 0 à 1
export function cercleTirets(ctx, cx, cy, r, k, o = {}) {
  if (k <= 0 || (o.a ?? 1) <= .001) return;
  ctx.save(); ctx.globalAlpha = o.a ?? 1; ctx.strokeStyle = o.col ?? GRIS; ctx.lineWidth = o.lw ?? 2; ctx.setLineDash(o.motif ?? [10, 8]);
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * clamp(k)); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- des mots posés, tapés
// Une étiquette posée sur un fond sombre (sans cadre, ou avec : o.bord), centrée en (x, y) (ligne de base au milieu).
// o : { a, taille (22), font (PIX), col (CRAIE), bord (null), marge (10), n (les caractères visibles : tapée) }
export function puce(ctx, txt, x, y, o = {}) {
  const a = o.a ?? 1; if (a <= .001) return null;
  const z = o.taille ?? 22, m = o.marge ?? 10;
  ctx.font = `${z}px ${o.font ?? PIX}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width, x0 = Math.round(x - w / 2), vis = [...txt].slice(0, o.n ?? Infinity).join('');
  ctx.globalAlpha = a * (o.fond ?? .85); ctx.fillStyle = FOND_FENETRE; ctx.fillRect(x0 - m, Math.round(y - z * .75), Math.round(w + 2 * m), Math.round(z * 1.5));
  if (o.bord) { ctx.globalAlpha = a; ctx.strokeStyle = o.bord; ctx.lineWidth = 2; ctx.strokeRect(x0 - m, Math.round(y - z * .75), Math.round(w + 2 * m), Math.round(z * 1.5)); }
  ctx.globalAlpha = a; ctx.fillStyle = o.col ?? CRAIE;
  if (vis) texteSignes(ctx, vis, x0, y);
  ctx.globalAlpha = 1;
  return { x: x0 - m, y: y - z * .75, w: w + 2 * m, h: z * 1.5, fin: x0 + ctx.measureText(vis).width };
}
// combien de caractères d'un texte tapé à cps car./s depuis t0 (0 avant)
export const tapes = (T, t0, cps, n) => clamp(Math.floor((T - t0) * cps), 0, n);
// un cercle de craie autour d'un sujet (le « vous », celui qu'on suit) : il se pose en se resserrant
export function cercle(ctx, T, x, y, r, t0, o = {}) {
  const a = (o.a ?? 1) * seg(T, t0, t0 + .25); if (a <= .001) return;
  const k = eOut(seg(T, t0, t0 + .3)), pu = o.pulse ? .5 + .5 * Math.sin(T * 6) : 0;
  ctx.globalAlpha = a; ctx.strokeStyle = o.col ?? CRAIE; ctx.lineWidth = o.lw ?? 2;
  ctx.beginPath(); ctx.arc(x, y, lerp(r * 1.5, r, k) + 3 * pu, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- la vignette de Kant (P22–P27)
// Une petite fenêtre (w × h, 120 × 140), Kant en cs 8 dedans ; o : { a, phi, cible, fixe, reflet, mode, question (alpha
// du « ? » LABO au-dessus de sa tête) }. Rend { yeux, tete } (pour le regard de Phi).
export const VIGNETTE = Object.freeze({ w: 120, h: 140, cs: 8 });
export function vignetteKant(ctx, T, x, y, o = {}) {
  const a = o.a ?? 1, cx = x + VIGNETTE.w / 2, cy = y + VIGNETTE.h / 2 + 10;
  const out = { yeux: { x: cx, y: cy - 2.5 * VIGNETTE.cs }, tete: { x: cx, y: cy - 6 * VIGNETTE.cs } };
  if (a <= .001) return out;
  fenetre(ctx, x, y, VIGNETTE.w, VIGNETTE.h, a);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, VIGNETTE.w, VIGNETTE.h); ctx.clip();
  portrait(ctx, T, 'kant', cx, cy, VIGNETTE.cs, { a, phi: o.phi, cible: o.cible, fixe: o.fixe, reflet: o.reflet, mode: o.mode });
  ctx.restore();
  const q = o.question ?? 0;
  if (q > .001) {
    const k = eBack(clamp(q));
    ctx.globalAlpha = a * clamp(q); ctx.fillStyle = LABO; ctx.font = `${Math.max(1, Math.round(30 * k))}px ${PIX}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', cx + 34, y + 26);
    ctx.globalAlpha = 1;
  }
  ctx.globalAlpha = 1;
  return out;
}
