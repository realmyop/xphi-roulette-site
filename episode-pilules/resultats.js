/* ==========================================================================
   Les deux pilules, l'épisode — resultats.js : les DOUZE ÉCRANS de Thibaut

   Ronan : « On reprend son test et ses douze écrans de résultats, avec les
   nouveaux bonshommes » ; puis : « je veux que tu prennes les petits
   bonhommes que tu as dans le premier film de 3 minutes 20, on est bien
   d'accord ? »

   Les scènes de mockups/resultats-pilules/index.html (sceneJauge,
   scenePredictions, sceneEcart, sceneMemeChose, sceneTrompeuse,
   sceneMemeChoix, sceneQui, sceneEchelle, sceneMeta, sceneScenarios),
   portées en FONCTIONS PURES DU TEMPS : mêmes mises en page, mêmes textes,
   mêmes couleurs que Thibaut, mais ses figures (fig) deviennent les
   bonshommes du film de 3 min 20 (dessineSujet de commun.js : l'atlas, les
   coiffes de PREMIERS, les états). Ses « pop » de couleur deviennent le saut
   du choix (la couleur change en l'air) ; ses halos, la vie (bras levés) ;
   ses dissolutions, la peur puis la mort en caractères du film. Ses chiffres
   viennent de donnees.js (les mêmes, avec leur statut).

   commun.js est celui de l'épisode (./commun.js), la copie de celui du film
   avec les mêmes bonshommes : au montage, l'import provisoire du film
   (../film-pilules/commun.js) a basculé ici, les écrans au pixel près les
   mêmes (essai-resultats.html et l'épisode, comparés avant et après).

   ---------------------------------------------------------------------------
   L'API
   ---------------------------------------------------------------------------
   ecran(ctx, T, n, d, o = {}) → infos
       Dessine l'écran n (1 à 12, l'ordre de Thibaut) à l'instant T (temps
       absolu de l'épisode). d : les instants (absolus) où commence chaque pas
       de Thibaut (son Tin(i) devient T − d[i] ; un pas absent ou Infinity :
       pas encore). Rien n'est gardé d'une image à l'autre : ?t donne l'image.
   Une fonction par écran, la même chose nommée (o.etapes = d) :
       ecranJauge(ctx, T, { etapes: [t0, t1, t2], groupe: 'A' | 'B', … }, cam?)   écrans 01 et 03
       ecranPredictions(ctx, T, { etapes, groupe: 'A' | 'B', … }, cam?)           écrans 02 et 05
       ecranEcart · ecranMemeChose · ecranTrompeuse · ecranMemeChoix · ecranQui ·
       ecranEchelle · ecranMeta · ecranScenarios (ctx, T, { etapes, … }, cam?)  écrans 04, 06 à 12
       (o.de : le début du plan, pris pour etapes[0] si etapes manque)
   cam (ou o.cam) : la caméra (un cadre() de commun.js : le monde de Thibaut → l'écran). Par défaut, CADRE_RESULTATS :
       ×0,81 autour de (960, 140) (y 140 → 140, y 980 → 820), pour que tout tienne au-dessus de la boîte XPHI (y < 830).
       IDENTITE : la page de Thibaut à l'identique. Une caméra de plan (un zoom ×1,3 « dans l'écran ») se compose avec
       dansCadre(camPlan). Les textes et les formes sont dessinés sous la caméra ; les bonshommes HORS caméra, à leur place
       à l'écran et à cs ENTIER (nets) : cs 3 (écrans 01, 03, 08, 12, les témoins), 2 (les prédictions), 4 (le N°48 de
       l'écran 11) dans le cadre des résultats, proportionnels ailleurs (csDe).
   o (tout est facultatif) :
       a          (0..1, 1 par défaut) tout l'écran en fondu, d'un bloc (un calque de la taille de la toile, posé avec
                  l'alpha) ; à 0, rien n'est dessiné et infos est vide
       phi        { x, y } : l'œil de Phi À L'ÉCRAN (la lumière, les reflets, ce qu'ils regardent) ; PHI par défaut
       sujet(cle, e, T, info) un crochet : le plan change l'état d'un bonhomme avant qu'il soit dessiné (mode, cible,
                  fixe, reflet, col, p, extra…) et le rend (ou le modifie) ; cle : l'indice de la figure (0 à 99) ou le nom
                  d'un témoin ('temoinA', 'n48'…) ; info : { n, x, y, cs (à l'écran), panneau, role, part }
       sans       les parties à ne pas dessiner : un nom, un tableau ou un Set (voir ECRANS[n].parties)
       decimale   (écrans 01, 03 ; vrai par défaut) 65,5 % = 65 bleus et un sujet moitié bleu ; 12,6 % = 12 bleus et un
                  sujet bleu à 60 % ; false : les 66 et 13 de la page de Thibaut
       notes      (faux par défaut) les notes de bas de page de Thibaut (y 1 032 : sous la boîte ; l'épisode les met en
                  mention)
       instants   des gestes datés (absolus) qui n'ont pas de pas chez Thibaut (voir ECRANS[n].instants)
       vide       (écran 09) l'instant où toute la mise en page paraît, barres à zéro et « ? » (la devinette de P61) ; par
                  défaut, comme chez Thibaut, chaque groupe paraît à son pas (le genre au pas 0, la politique au pas 1)
       vraisHumains (écran 12) personne ne part en caractères : les bleus de B ont peur, et plus personne n'a le reflet
                  de Phi (P76 ; l'ombre, la respiration, le pouls : le crochet sujet, avec vraisHumains de partage) ; faux :
                  Thibaut
       chiffres   (écran 12 ; faux par défaut) les pourcentages de la jauge qui hésite (une illustration : « BLEUE ? »)
   infos (rendu) : { sujets: [{ cle, x, y, cs, col, mode }] (à l'écran), reperes: { nom: { x, y } } (à l'écran : la
       jauge, le chiffre, les barres… : pour le regard de Phi) }.

   Les états des bonshommes, pas après pas (les instants de Thibaut ; le crochet sujet peut tout changer) :
       arrivée    son eBack (l'échelle, sur les 0,45 s de son arrivée) ; écrans 01, 03 : gris, un « ? » qui pulse
       le choix   le saut du film (accroupi, en l'air, la couleur change en l'air, retombé), au milieu de son « pop »
       la vie     (écran 01, pas 2 ; témoins de l'écran 04) bras levés, petits bonds, halo, pendant 3,4 s ; puis debout,
                  un halo posé (0,5) ; un plan qui veut la vie plus longtemps la redonne par le crochet (e.mode = 'vie')
       la mort    (écran 03, pas 2 ; témoin bleu de B à l'écran 04 ; écran 12, pas 1) la peur (raides, la goutte), puis
                  la dissolution en caractères du film, en partant des pieds ; la part rouge du sujet de la décimale a
                  peur avec elle, puis reste
       le regard  ils regardent Phi par moments (le repos du film), avec son reflet LABO dans les yeux ; les témoins
                  regardent leur barre ; à l'écran 08, ceux qui l'admettent regardent Phi, ceux qui s'illusionnent
                  regardent ailleurs (sans reflet)
       le N°48    (écran 11) cs 4, au pied des barres, avec ses crochets laiton (partie 'crochets')
   Les textes passent par txt() : les signes qu'aucune police n'a (C.SIGNES : ✓ ✗ ▶, et ≈ dans la copie de l'épisode)
   y sont dessinés en pixels.

   Le reste :
       ECRANS[n] = { nom, titre, pas, note, humeurs, secoue, parties, instants } (les humeurs de Phi par pas, de la page
         de Thibaut ; secoue : [pas, délai] de sa secousse) ; ECRAN_DE (nom → n)
       moments(n, d, o) : les instants de ce qui se passe (sauts, seuil, tampon, vie, envols…) : pour le son et le regard
       fondResultats(ctx, T, n, d, o) : le fond de la page de Thibaut (centre 900, 520), qui s'éclaircit quand tout le
         monde vit (01) et chauffe quand les bleus meurent (03) ; o.teinte false : jamais
       PHI = { x: 1790, y: 120, taille: 120 } (sa place sur les écrans de Thibaut, EPISODE.md) ; PHI_THIBAUT (sa page)
       CADRE_RESULTATS, Z_CADRE, dansCadre(cam), csDe(csCadre, cam)
       les briques (ctx en premier, coordonnées de Thibaut) : txt, fenetre, boite, tampon, tirets, cerne, barre, jaugeH,
         fleche, note, coupeSujet
       les géométries : posJauge(i) (écrans 01, 03), GRILLE(cx, i) (08, 12), PRED.A / PRED.B (les prédictions : items,
         cible, depart, zone, nb), xVal, Q, BASE, X0, X1, NC, PXC, enHaut, enBas, empile ; les tirages de sa page :
         R1, R2, PERM, RANG (rng(99), rejoué dans son ordre : les mêmes bleus, les mêmes ordres que chez lui)
       les teintes de sa page : PISTE, LABO_FONCE, NEUTRE, TIEDE, CHAUD, SABLE, ACCORD, TROMPE
   ========================================================================== */
import * as C from './commun.js';
import * as D from './donnees.js';

const {
  CRAIE, GRIS, NUIT, LABO, LAITON, BLEU, BLEU_TXT, ROUGE, ROUGE_TXT, GRIS_FIG, MONO, PIX,
  clamp, lerp, seg, eIO, eOut, eBack, rng, hache, mix, nombre, dessineSujet, PREMIERS, N48, SW, CS,
} = C;

// ================================================================ la page de Thibaut : ses teintes, ses tirages
export const PISTE = '#1e1c20', LABO_FONCE = '#557f92', NEUTRE = '#4a4548', TIEDE = '#8f7468', CHAUD = '#c9a48f', SABLE = '#c9c0b2';
// ses tirages de rng(99), dans son ordre : 3 par case de ses figures (37 cases, cent figures), puis R1, R2, PERM
const RF = rng(99);
for (let k = 0; k < 100 * 37 * 3; k++) RF();
export const R1 = Object.freeze([...Array(100)].map(() => RF()));
export const R2 = Object.freeze([...Array(100)].map(() => RF()));
const melange = n => { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(RF() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const PERM = Object.freeze([melange(100), melange(100), melange(100)].map(Object.freeze));
export const RANG = Object.freeze(PERM.map(p => { const r = []; p.forEach((v, k) => { r[v] = k; }); return Object.freeze(r); }));

const fmt = (v, d = 1) => v.toFixed(d).replace('.', ',');
const fmtV = v => fmt(v, v % 1 ? 1 : 0);             // « 65,5 », « 70 »

// ================================================================ la caméra : le cadre des résultats
export const Z_CADRE = .81;
export const CADRE_RESULTATS = C.cadre(960, 140, 960, 140, Z_CADRE);
// une caméra de plan (à l'écran) posée sur le cadre des résultats : écran = camPlan(CADRE(monde))
export function dansCadre(cam, base = CADRE_RESULTATS) {
  if (!cam) return base;
  return C.cadre(0, 0, cam.z * base.ox + cam.ox, cam.z * base.oy + cam.oy, cam.z * base.z);
}
// la taille des cases d'un bonhomme, entière : csCadre dans le cadre des résultats, proportionnelle sous une autre caméra
export const csDe = (csCadre, cam = CADRE_RESULTATS) => Math.max(1, Math.round(csCadre * cam.z / Z_CADRE));
// l'œil de Phi sur les écrans de Thibaut (EPISODE.md, « La grammaire ») ; sur sa page : (1 806, 116), 150 px
export const PHI = Object.freeze({ x: 1790, y: 120, taille: 120 });
export const PHI_THIBAUT = Object.freeze({ x: 1806, y: 116, taille: 150 });

// ================================================================ les briques (coordonnées de Thibaut, sous la caméra)
// les caractères qu'aucune police du dépôt n'a (C.SIGNES : ✓ ✗ ▶ ; ≈ dans la copie de l'épisode) sont dessinés en pixels
const SIGNES_RE = new RegExp(`[${Object.keys(C.SIGNES || {}).join('')}]`);
export function txt(ctx, s, x, y, size, col, align = 'left', a = 1, font = PIX) {
  if (a <= 0) return;
  ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  if (SIGNES_RE.test(s)) C.texteSignes(ctx, s, x, y); else ctx.fillText(s, x, y);
  ctx.globalAlpha = 1;
}
export function fenetre(ctx, x, y, w, h, a, bord = CRAIE) {
  if (a <= 0) return;
  C.fenetre(ctx, x, y, w, h, a, bord);
  ctx.globalAlpha = 1;
}
// une fenêtre centrée en cx, dont le haut est en y : lignes = [[texte, taille, couleur], …] ; rend son rectangle
export function boite(ctx, cx, y, lignes, a, bord = CRAIE) {
  if (a <= 0) return null;
  let w = 0, h = 0;
  for (const [s, z] of lignes) { ctx.font = `${z}px ${PIX}`; w = Math.max(w, ctx.measureText(s).width); h += z * 1.38; }
  w += 70; h += 34;
  const o = eOut(clamp(a)), y0 = y + (1 - o) * 14;
  fenetre(ctx, cx - w / 2, y0, w, h, a, bord);
  let yy = y0 + 17;
  for (const [s, z, c] of lignes) { yy += z * 1.38; txt(ctx, s, cx, yy - z * .36, z, c, 'center', a); }
  return { x: cx - w / 2, y: y0, w, h };
}
// le tampon de Thibaut : il tombe à l'instant t (de ×1,5 à ×1), tourné de −6°
export function tampon(ctx, T, cx, cy, s, col, size, t) {
  C.tampon(ctx, T, { t, txt: s, taille: size, c: col, x: cx, y: cy, fond: .86 });
  ctx.globalAlpha = 1;
}
export function tirets(ctx, x0, y0, x1, y1, col, a, lw = 2, motif = [10, 8]) {
  if (a <= 0) return;
  ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(motif);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
}
// le cadre qui clignote autour de ce qu'on montre
export function cerne(ctx, x, y, w, h, col, a, T) {
  if (a <= 0) return;
  const pu = .5 + .5 * Math.sin(T * 5);
  ctx.globalAlpha = a * (.75 + .25 * pu); ctx.strokeStyle = col; ctx.lineWidth = 4;
  ctx.strokeRect(x - 3 * pu, y - 3 * pu, w + 6 * pu, h + 6 * pu); ctx.globalAlpha = 1;
}
// une barre verticale empilée, remplie de bas en haut jusqu'à k (0..1) de sa hauteur ; segs = [{ v (en %), col }]
export function barre(ctx, cx, bw, yb, bh, segs, k, a = 1) {
  if (a <= 0) return;
  ctx.globalAlpha = a; ctx.fillStyle = PISTE; ctx.fillRect(cx - bw / 2, yb - bh, bw, bh);
  let cum = 0;
  for (const s of segs) {
    const v0 = cum, v1 = cum + s.v; cum = v1;
    const top = Math.min(v1, k * 100); if (top <= v0) continue;
    ctx.fillStyle = s.col; ctx.fillRect(cx - bw / 2, yb - bh * top / 100, bw, bh * (top - v0) / 100);
  }
  ctx.strokeStyle = CRAIE; ctx.lineWidth = 3; ctx.strokeRect(cx - bw / 2, yb - bh, bw, bh);
  ctx.globalAlpha = 1;
}
// la jauge horizontale bleue / rouge (celle du test) ; sansChiffre : « BLEUE ? » et « ? ROUGE »
export function jaugeH(ctx, x0, y, w, pb, pr, a, gros = false, sansChiffre = false) {
  if (a <= 0) return;
  const ep = gros ? 22 : 16;
  ctx.globalAlpha = a;
  ctx.fillStyle = PISTE; ctx.fillRect(x0, y, w, ep);
  ctx.fillStyle = BLEU; ctx.fillRect(x0, y, w * pb / 100, ep);
  ctx.fillStyle = ROUGE; ctx.fillRect(x0 + w - w * pr / 100, y, w * pr / 100, ep);
  ctx.fillStyle = CRAIE; ctx.fillRect(x0 + w / 2 - 1.5, y - 12, 3, ep + 24);
  ctx.globalAlpha = 1;
  const z = gros ? 24 : 20;
  txt(ctx, sansChiffre ? 'BLEUE ?' : `BLEUE ${fmt(pb, pb % 1 ? 1 : 0)} %`, x0, y - 14, z, BLEU_TXT, 'left', a, MONO);
  txt(ctx, sansChiffre ? '? ROUGE' : `${fmt(pr, pr % 1 ? 1 : 0)} % ROUGE`, x0 + w, y - 14, z, ROUGE_TXT, 'right', a, MONO);
  txt(ctx, '50 %', x0 + w / 2, y - 22, z - 2, GRIS, 'center', a, MONO);
}
export function fleche(ctx, x0, y0, x1, y1, col, a, lw = 4) {
  if (a <= 0) return;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(ang) * 14, y1 - Math.sin(ang) * 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(ang - .45) * 24, y1 - Math.sin(ang - .45) * 24);
  ctx.lineTo(x1 - Math.cos(ang + .45) * 24, y1 - Math.sin(ang + .45) * 24); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
}
// la note de bas de page de Thibaut (en (64, 1 032) : sous la boîte XPHI dans l'épisode, qui la met en mention)
export const note = (ctx, s, a = 1) => txt(ctx, s, 64, 1032, 18, GRIS, 'left', a, MONO);
// la découpe d'un sujet de deux couleurs (la décimale) : la part bleue fb à gauche (film-pilules/plans/europe-salles.js)
export function coupeSujet(ctx, cx, fb, gauche, cs = CS) {
  const xs = Math.round(cx - SW * cs / 2 + (2 + 7 * fb) * cs);
  ctx.beginPath(); if (gauche) ctx.rect(cx - 60 * cs / CS, -1e4, xs - (cx - 60 * cs / CS), 2e4); else ctx.rect(xs, -1e4, cx + 60 * cs / CS - xs, 2e4); ctx.clip();
}

// ================================================================ le contexte d'un écran (le temps des pas, la caméra, les bonshommes)
function contexte(ctx, T, n, o, cam) {
  const d = Array.isArray(o.etapes) ? o.etapes : o.de !== undefined ? [o.de] : [];
  const sans = new Set(typeof o.sans === 'string' ? [o.sans] : o.sans || []);
  cam = cam || o.cam || CADRE_RESULTATS;
  const S = {
    ctx, T, n, o, cam, d,
    // Tin(i) de Thibaut : le temps écoulé dans le pas i (négatif : pas encore)
    Tin: i => T - (d[i] ?? Infinity),
    t: i => d[i] ?? Infinity,
    P: (i, a = 0, b = 1) => eIO(seg(T - (d[i] ?? Infinity), a, b)),
    voit: nom => !sans.has(nom),
    phi: o.phi || PHI,
    I: (nom, defaut) => (o.instants && o.instants[nom] !== undefined ? o.instants[nom] : defaut),
    sujets: [], reperes: {},
    ecran: (x, y) => cam.ecran(x, y),
    cs: c => csDe(c, cam),
    monde(fn) { ctx.save(); cam.applique(ctx); fn(); ctx.restore(); ctx.globalAlpha = 1; },
    repere(nom, x, y) { S.reperes[nom] = cam.ecran(x, y); },
  };
  return S;
}
const infos = S => ({ sujets: S.sujets, reperes: S.reperes });
// o.a (0..1) : tout l'écran en fondu, d'un bloc (ce qui se chevauche ne se voit pas par transparence) : il est dessiné
// dans un calque de la taille de la toile (une mémoire de calcul, une par contexte), posé avec l'alpha ; à 0, rien
// (ni sujets ni repères). À 1 (ou absent), directement sur la toile, sans calque.
const CALQUES = new WeakMap();
function calque(ctx) {
  const cv = ctx.canvas;
  let L = CALQUES.get(ctx);
  if (!L || L.canvas.width !== cv.width || L.canvas.height !== cv.height) { L = C.toile(cv.width, cv.height).getContext('2d'); CALQUES.set(ctx, L); }
  L.setTransform(1, 0, 0, 1, 0, 0); L.globalAlpha = 1; L.clearRect(0, 0, cv.width, cv.height);
  L.setTransform(ctx.getTransform()); L.imageSmoothingEnabled = ctx.imageSmoothingEnabled;
  return L;
}
const fondu = fn => (ctx, T, o = {}, cam) => {
  const a = o.a ?? 1;
  if (a >= 1) return fn(ctx, T, o, cam);
  if (!(a > 0)) return { sujets: [], reperes: {} };
  const L = calque(ctx), r = fn(L, T, o, cam);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.drawImage(L.canvas, 0, 0); ctx.restore();
  return r;
};

// un bonhomme du film à la place (x, y) d'une figure de Thibaut (ses coordonnées), dessiné hors caméra à cs entier.
// q : { cle (pour le crochet), f (le sujet : PREMIERS[i]), cs (en cases du cadre des résultats), k (l'échelle de l'arrivée),
//       pied (true : (x, y) est le sol sous ses pieds), panneau, role } ; e : son état (dessineSujet) ;
// e2 et q.fb : un sujet de deux couleurs (la décimale) : e pour la part bleue (à gauche, fb), e2 pour la rouge
function bonhomme(S, x, y, q, e, e2) {
  const { ctx, T } = S, p = S.ecran(x, y), cs = S.cs(q.cs) * (q.k ?? 1);
  if (cs <= .05) return;
  const cy = q.pied ? p.y - 6 * cs : p.y;
  const prepare = (et, part) => {
    if (!et.phi) et.phi = S.phi;
    if (et.cible === undefined) et.cible = S.phi;
    if (et.reflet === undefined) et.reflet = true;
    if (S.o.sujet) { const r = S.o.sujet(q.cle, et, T, { n: S.n, x: p.x, y: cy, cs, panneau: q.panneau, role: q.role, part }); if (r && typeof r === 'object') et = r; }
    return et;
  };
  e = prepare(e, e2 ? 'bleue' : null);
  S.sujets.push({ cle: q.cle, x: p.x, y: cy, cs, col: e.col, mode: e.mode || 'repos' });
  if (!e2) { dessineSujet(ctx, q.f, p.x, cy, cs, e, T); ctx.globalAlpha = 1; return; }
  e2 = prepare(e2, 'rouge');
  ctx.save(); coupeSujet(ctx, p.x, q.fb, true, cs); dessineSujet(ctx, q.f, p.x, cy, cs, e, T); ctx.restore();
  ctx.save(); coupeSujet(ctx, p.x, q.fb, false, cs); dessineSujet(ctx, q.f, p.x, cy, cs, e2, T); ctx.restore();
  ctx.globalAlpha = 1;
}
// le saut du choix à l'instant tc (la couleur passe de avant à col, en l'air) : l'état, ou null hors du saut
const saut = (T, tc, col, avant = GRIS_FIG) => (T >= tc - .2 && T < tc + .45 ? { col: T < tc ? avant : col, mode: 'saut', t0: tc } : null);
// un hochement de tête, deux fois, à partir de t
const hoche = (T, t) => { const k = T - t; return (k >= 0 && k < .18) || (k >= .36 && k < .54); };

// ================================================================ écrans 01 et 03 : la jauge (description A, description B)
export const posJauge = i => [960 - 570 + (i % 20) * 60, 430 + Math.floor(i / 20) * 72];
const sautJauge = (d1, i) => d1 + .2 + RANG[1][i] * .021 + .125;
// la part bleue de la figure i : 1, 0, ou la décimale (le sujet de deux couleurs), dans l'ordre PERM[0] de Thibaut
function partJauge(g, i, decimale) {
  const F = D.FIGURES[g], nb = decimale ? F.bleus : F.arrondi, part = decimale ? F.part : 0, r = RANG[0][i];
  return r < nb ? 1 : part > 0 && r === nb ? part : 0;
}
const envolJauge = (d2, i) => d2 + .5 + R2[i] * .9;
const JAUGE_Q = { A: ['Quelle part a pris la pilule bleue ?'], B: ['Mêmes pilules, même règle.', 'Quelle part a pris la bleue ?'] };
export const ecranJauge = fondu(function ecranJauge(ctx, T, o = {}, cam) {
  const g = o.groupe === 'B' ? 'B' : 'A', S = contexte(ctx, T, g === 'A' ? 1 : 3, o, cam);
  const vie = g === 'A', Ch = D.CHOIX[g], pct = Ch.pct, dec = o.decimale !== false;
  const t0 = S.Tin(0), t1 = S.Tin(1), t2 = S.Tin(2), d1 = S.t(1), d2 = S.t(2);
  S.monde(() => {
    if (S.voit('boite')) boite(ctx, 960, 160, [[`DESCRIPTION ${g}`, 26, LABO], ...JAUGE_Q[g].map(l => [l, 38, CRAIE])], seg(t0, .1, .5) * (1 - seg(t1, 0, .35)));
    if (S.voit('questions') && t1 < 0) for (let i = 0; i < 100; i++) {
      const [cx, cy] = posJauge(i), ka = eBack(seg(t0, R1[i] * .8, R1[i] * .8 + .45));
      if (ka > .01) txt(ctx, '?', cx, cy - 36, 18, GRIS, 'center', Math.min(1, ka) * (.45 + .4 * Math.sin(T * 3 + i)));
    }
  });
  if (S.voit('figures')) for (let i = 0; i < 100; i++) {
    const [cx, cy] = posJauge(i), ka = eBack(seg(t0, R1[i] * .8, R1[i] * .8 + .45));
    if (ka <= .01) continue;
    const fb = partJauge(g, i, dec), tc = sautJauge(d1, i), td = envolJauge(d2, i);
    // l'état d'une part du sujet, de couleur col ; meurt : la part bleue quand la bleue perd
    const etat = (col, meurt, voisin) => {
      const s = saut(T, tc, col); if (s) return s;
      if (T < tc) return { col: GRIS_FIG, a: .82 };
      const e = { col };
      if (vie) {
        const lu = seg(t2, 0, .6) * (1 - seg(t2, 3.4, 4.4));
        if (lu > 0) { e.mode = 'vie'; e.k = lu; }
        e.halo = .5 * seg(t2, 3.4, 4.4);
      } else if ((meurt || voisin) && T >= d2) {
        if (T < td + (voisin ? 2.5 : 0)) e.mode = 'peur';
        if (meurt) { e.dis = seg(T, td, td + 2); if (e.dis >= 1) e.a = 0; }
      }
      return e;
    };
    const q = { cle: i, f: PREMIERS[i], cs: 3, k: Math.min(ka, 1.2), role: fb ? 'bleu' : 'rouge' };
    if (fb === 1 || fb === 0) bonhomme(S, cx, cy, q, etat(fb ? BLEU : ROUGE, !vie && fb === 1, false));
    else bonhomme(S, cx, cy, { ...q, fb, role: 'decimale' }, etat(BLEU, !vie, false), etat(ROUGE, false, !vie));
  }
  const kg = eIO(seg(t1, .2, 2.4));
  S.monde(() => {
    if (S.voit('jauge')) jaugeH(ctx, 390, 830, 1140, pct * kg, (100 - pct) * kg, seg(t1, 0, .4), true);
    if (S.voit('resultat')) boite(ctx, 960, 160, [[`${fmt(pct)} %`, 70, BLEU_TXT], ['ONT PRIS LA PILULE BLEUE', 26, CRAIE], [`${nombre(Ch.bleue)} BLEUES · ${nombre(Ch.rouge)} ROUGES`, 20, GRIS]], seg(t1, 2.3, 2.8));
    if (S.voit('tampon')) tampon(ctx, T, 960, 580, vie ? 'TOUT LE MONDE SURVIT' : 'LES BLEUS MEURENT', vie ? LABO : ROUGE_TXT, 54, d2 + (vie ? .7 : 2.4));
  });
  S.repere('question', 960, 230); S.repere('chiffre', 960, 230); S.repere('foule', 960, 574);
  S.repere('jauge', 390 + 11.4 * pct * kg, 841); S.repere('seuil', 960, 841); S.repere('tampon', 960, 580);
  return infos(S);
});

// ================================================================ écrans 02 et 05 : les prédictions (une figure = 1 % du groupe)
export const X0 = 300, X1 = 1640, BASE = 590, NC = 84, PXC = (X1 - X0) / (NC - 1), CAP = 10;
export const xVal = v => X0 + v / 100 * (X1 - X0);
// n valeurs tirées des paliers bp (la fonction Q de Thibaut)
export const Q = (bp, n) => [...Array(n).keys()].map(i => { const q = (i + .5) / n; return bp.find(([e]) => q < e)[1]; });
export function empile(items) {
  const cnt = new Map(), pos = {};
  [...items].sort((a, b) => a.v - b.v || a.id - b.id).forEach(it => {
    const c0 = Math.round(it.v / 100 * (NC - 1));
    for (let dd = 0; dd < 60; dd++) {
      const c = c0 + (dd === 0 ? 0 : dd % 2 ? (dd + 1) / 2 : -dd / 2);
      if (c < 0 || c > NC - 1) continue;
      const k = cnt.get(c) || 0;
      if (k < CAP) { pos[it.id] = { c, r: k }; cnt.set(c, k + 1); break; }
    }
  });
  return pos;
}
export const enHaut = p => [X0 + p.c * PXC, BASE - 26 - p.r * 28];
export const enBas = p => [X0 + p.c * PXC, BASE + 56 + p.r * 28];
function geometriePredictions(g) {
  const nb = D.FIGURES[g].arrondi;
  const items = [...D.repartition(g, 'bleus', nb).map((v, k) => ({ id: k, v, b: true })), ...D.repartition(g, 'rouges', 100 - nb).map((v, k) => ({ id: nb + k, v, b: false }))].map(Object.freeze);
  const tous = empile(items), haut = empile(items.filter(it => it.b)), bas = empile(items.filter(it => !it.b));
  const cible = it => (it.b ? enHaut(haut[it.id]) : enBas(bas[it.id]));
  const depart = it => enHaut(tous[it.id]);
  const zone = ids => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    ids.forEach(id => { const [x, y] = cible(items[id]); x0 = Math.min(x0, x - 10); x1 = Math.max(x1, x + 10); y0 = Math.min(y0, y - 15); y1 = Math.max(y1, y + 15); });
    return [x0, y0, x1 - x0, y1 - y0];
  };
  // le contour des figures ids, à leur place : colonne par colonne, de la première à la dernière figure choisie ;
  // l'union de ces rectangles, en escalier (un polygone par suite de colonnes voisines). Entre deux figures (choisie
  // et pas choisie, presque jointives), le trait passe à mi-chemin (PXC / 2 de côté, un demi-rang, 14 px, en haut et en
  // bas) ; là où il n'y a personne à côté, il prend du large (13 px de côté, 17 en haut et en bas : il reste sous le
  // « 0 % » de l'axe). Un seul rectangle autour de zone(ids) entourait aussi les figures des mêmes colonnes qui
  // n'étaient pas choisies (en B, « LA MOITIÉ DES ROUGES PRÉDIT 2 % OU MOINS » encadrait 50 rouges sur 87, à 3, 4 et
  // 5 % compris : empile range par colonnes de dix).
  const occupe = new Set(items.map(it => { const p = (it.b ? haut : bas)[it.id]; return `${it.b}|${p.c}|${p.r}`; }));
  const contour = ids => {
    const cols = new Map();
    ids.forEach(id => {
      const it = items[id], p = (it.b ? haut : bas)[id], [x, y] = cible(it), k = cols.get(p.c);
      if (!k) { cols.set(p.c, { b: it.b, c: p.c, x, r0: p.r, r1: p.r, ya: y, yb: y }); return; }
      if (p.r < k.r0) { k.r0 = p.r; k.ya = y; }
      if (p.r > k.r1) { k.r1 = p.r; k.yb = y; }
    });
    const suites = [];
    [...cols.values()].sort((a, b) => a.c - b.c).forEach(k => { const r = suites[suites.length - 1]; if (r && k.c === r[r.length - 1].c + 1) r.push(k); else suites.push([k]); });
    const colonneHabitee = (k, dc) => [...occupe].some(o => o.startsWith(`${k.b}|${k.c + dc}|`));
    return suites.map(r => {
      // le haut et le bas de chaque colonne, à l'écran (ya : la première figure choisie, yb : la dernière ; en haut de
      // l'axe, les rangs montent) : un demi-rang s'il y a une figure juste au-delà, du large sinon
      const bords = r.map(k => {
        const s = Math.sign(k.yb - k.ya) || 1, avant = occupe.has(`${k.b}|${k.c}|${k.r0 - 1}`), apres = occupe.has(`${k.b}|${k.c}|${k.r1 + 1}`);
        const ea = k.ya - s * (avant ? 14 : 17), eb = k.yb + s * (apres ? 14 : 17);
        return { x: k.x, y0: Math.min(ea, eb), y1: Math.max(ea, eb) };
      });
      const g0 = colonneHabitee(r[0], -1) ? PXC / 2 : 13, d1 = colonneHabitee(r[r.length - 1], 1) ? PXC / 2 : 13;
      const xg = i => (i === 0 ? bords[0].x - g0 : bords[i].x - PXC / 2), xd = i => (i === r.length - 1 ? bords[i].x + d1 : bords[i].x + PXC / 2);
      return Object.freeze([
        ...bords.flatMap((k, i) => [[xg(i), k.y0], [xd(i), k.y0]]),
        ...bords.map((k, i) => i).reverse().flatMap(i => [[xd(i), bords[i].y1], [xg(i), bords[i].y1]]),
      ]);
    });
  };
  return Object.freeze({ g, nb, items: Object.freeze(items), tous, haut, bas, cible, depart, zone, contour });
}
// le cerne en escalier des figures ids de G (G.contour) : le trait de cerne(), qui palpite, sans grandir ; il passe entre
// des figures presque jointives : une saignée de nuit sous lui les sépare, pour qu'il se lise
export function cerneFigures(ctx, G, ids, col, a, T) {
  if (a <= 0 || !ids.length) return;
  const pu = .5 + .5 * Math.sin(T * 5);
  ctx.beginPath();
  for (const pts of G.contour(ids)) { pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
  ctx.lineJoin = 'miter';
  ctx.globalAlpha = a; ctx.strokeStyle = NUIT; ctx.lineWidth = 6; ctx.stroke();
  ctx.globalAlpha = a * (.75 + .25 * pu); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
  ctx.globalAlpha = 1;
}
const dansPolygone = (x, y, pts) => {
  let dedans = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dedans = !dedans;
  }
  return dedans;
};
export const PRED = Object.freeze({ A: geometriePredictions('A'), B: geometriePredictions('B') });
// ce que Thibaut montre ensuite, pas après pas (ses « surlignes ») ; les nombres de donnees.js
const PA = D.PREDICTIONS.A, PB = D.PREDICTIONS.B;
export const SURLIGNES = Object.freeze({
  A: [
    { filtre: it => !it.b && it.v === 0, lignes: [`${PA.reperes.rougesZero} % DES ROUGES`, 'PRÉDISENT 0 %'], lx: x => x - 8, ly: (y, h) => y + h + 56 },
    { filtre: it => it.b && it.v < 50, chaque: true, lignes: [`≈ ${PA.reperes.bleusSousMoitie} % DES BLEUS PRÉDISENT`, 'MOINS DE 50 % DE BLEUE'], lx: x => x - 30, ly: y => y - 120 },
  ],
  B: [
    { filtre: it => !it.b && it.v <= 2, lignes: ['LA MOITIÉ DES ROUGES', 'PRÉDIT 2 % OU MOINS'], lx: () => xVal(PB.reel) + 30, ly: () => BASE - 170 },
  ],
});
// l'essai : ce que le cerne d'une surligne entoure, ce sont exactement les figures qu'elle compte (verifie() de l'épisode
// et essai-resultats.html) ; rend la liste de ce qui cloche
export function verifieSurlignes() {
  const pb = [];
  for (const [g, liste] of Object.entries(SURLIGNES)) liste.forEach((s, j) => {
    if (s.chaque) return;
    const G = PRED[g], ids = G.items.filter(s.filtre).map(it => it.id), polys = G.contour(ids);
    const dedans = G.items.filter(it => { const [x, y] = G.cible(it); return polys.some(p => dansPolygone(x, y, p)); });
    const manquent = ids.filter(id => !dedans.some(it => it.id === id)), en_trop = dedans.filter(it => !ids.includes(it.id));
    if (manquent.length || en_trop.length) pb.push(`écran ${g === 'A' ? '02' : '05'}, « ${s.lignes.join(' ')} » : le cerne entoure ${dedans.length} figures pour ${ids.length} comptées (${en_trop.length} de trop : ${[...new Set(en_trop.map(it => it.v))].join(', ')} % ; ${manquent.length} dehors)`);
  });
  return pb;
}
const sautPred = (d1, id) => d1 + R2[id] * .5 + .15;
export const ecranPredictions = fondu(function ecranPredictions(ctx, T, o = {}, cam) {
  const g = o.groupe === 'B' ? 'B' : 'A', S = contexte(ctx, T, g === 'A' ? 2 : 5, o, cam), G = PRED[g], P = D.PREDICTIONS[g];
  const t0 = S.Tin(0), t1 = S.Tin(1), a0 = seg(t0, 0, .4), d1 = S.t(1);
  const reel = P.reel, reelDroite = g === 'B', moyTous = P.moyennes.tous, moyB = P.moyennes.bleus, moyR = P.moyennes.rouges;
  S.monde(() => {
    if (S.voit('axe')) {
      ctx.globalAlpha = a0; ctx.fillStyle = CRAIE; ctx.fillRect(X0 - 30, BASE - 2, X1 - X0 + 60, 3); ctx.globalAlpha = 1;
      [0, 25, 50, 75, 100].forEach(v => {
        ctx.globalAlpha = a0; ctx.fillStyle = CRAIE; ctx.fillRect(xVal(v) - 1, BASE - 8, 2, 14); ctx.globalAlpha = 1;
        txt(ctx, `${v} %`, xVal(v), BASE + 32, 20, GRIS, 'center', a0, MONO);
      });
      txt(ctx, 'PRÉDICTION : PART DE BLEUE CHEZ LES AUTRES', X0 - 30, 205, 22, GRIS, 'left', a0);
    }
    if (S.voit('reel')) {
      tirets(ctx, xVal(reel), BASE - 350, xVal(reel), BASE + 350, CRAIE, a0 * .9, 2, [8, 7]);
      txt(ctx, `VALEUR RÉELLE ${fmt(reel)} %`, xVal(reel) + (reelDroite ? 14 : -14), BASE - 335, 22, CRAIE, reelDroite ? 'left' : 'right', a0);
    }
  });
  // tous ensemble, puis séparés : chacun saute en prenant sa couleur, puis glisse à sa place
  if (S.voit('figures')) for (const it of G.items) {
    const [xa, ya] = G.depart(it), [xb, yb] = G.cible(it);
    const ka = eBack(seg(t0, .2 + R1[it.id] * 1.2, .65 + R1[it.id] * 1.2)); if (ka <= .01) continue;
    const km = eIO(seg(t1, .3 + R2[it.id] * .6, 1.4 + R2[it.id] * .6)), col = it.b ? BLEU : ROUGE, tc = sautPred(d1, it.id);
    const e = saut(T, tc, col) || { col: T < tc ? GRIS_FIG : col };
    bonhomme(S, lerp(xa, xb, km), lerp(ya, yb, km), { cle: it.id, f: PREMIERS[it.id], cs: 2, k: Math.min(ka, 1.2), role: it.b ? 'bleu' : 'rouge' }, e);
  }
  S.monde(() => {
    if (S.voit('moyennes')) {
      if (moyTous !== null) {
        const a = a0 * (1 - seg(t1, 0, .4));
        tirets(ctx, xVal(moyTous), BASE + 14, xVal(moyTous), BASE - 320, LABO, a, 3, [4, 6]);
        txt(ctx, `MOYENNE DES PRÉDICTIONS ${fmt(moyTous)} %`, xVal(moyTous) - 14, BASE + 80, 22, LABO, 'right', a);
      }
      const am = seg(t1, 1.6, 2.1);
      tirets(ctx, xVal(moyB), BASE - 14, xVal(moyB), BASE - 330, BLEU_TXT, am, 3, [4, 6]);
      txt(ctx, `BLEUS : MOYENNE ${fmtV(moyB)} %`, xVal(moyB) + 14, BASE - 335, 22, BLEU_TXT, 'left', am);
      tirets(ctx, xVal(moyR), BASE + 40, xVal(moyR), BASE + 350, ROUGE_TXT, am, 3, [4, 6]);
      txt(ctx, `ROUGES : MOYENNE ${fmt(moyR, 0)} %`, xVal(moyR) + 14, BASE + 345, 22, ROUGE_TXT, 'left', am);
    }
    if (S.voit('surlignes')) SURLIGNES[g].forEach((s, j) => {
      const t = S.Tin(2 + j); if (t < 0) return;
      const ids = G.items.filter(s.filtre).map(it => it.id), a = seg(t, 0, .4);
      if (s.chaque) ids.forEach(id => { const [x, y] = G.cible(G.items[id]); cerne(ctx, x - 16, y - 21, 32, 42, CRAIE, a, T); });
      else cerneFigures(ctx, G, ids, CRAIE, a, T);
      const [x, y, w, h] = G.zone(ids);
      s.lignes.forEach((l, k) => txt(ctx, l, s.lx(x, w), s.ly(y, h) + k * 34, 26, CRAIE, 'left', seg(t, .3 + k * .5, .7 + k * .5)));
    });
    if (o.notes) note(ctx, 'Chaque figure représente 1 % des participants du groupe.', a0);
  });
  S.repere('reel', xVal(reel), BASE - 340); S.repere('moyenne', xVal(moyTous ?? reel), BASE - 320);
  S.repere('bleus', xVal(moyB), BASE - 120); S.repere('rouges', xVal(moyR), BASE + 120); S.repere('nuage', 970, BASE - 60);
  SURLIGNES[g].forEach((s, j) => { const [x, y, w, h] = G.zone(G.items.filter(s.filtre).map(it => it.id)); S.repere(`surligne${j}`, x + w / 2, y + h / 2); });
  return infos(S);
});

// ================================================================ écran 04 : les deux jauges côte à côte (53 points)
// Au pied de chaque barre, deux témoins (un bleu à gauche, un rouge à droite) : pas des proportions. EPISODE.md, P53 :
// ceux de A lèvent les bras (instants.vie) ; sous B, le bleu a peur et part en caractères (instants.mort).
const TEMOINS_ECART = Object.freeze({ A: [PREMIERS[11], PREMIERS[26]], B: [PREMIERS[63], PREMIERS[84]] });
export const ecranEcart = fondu(function ecranEcart(ctx, T, o = {}, cam) {
  const S = contexte(ctx, T, 4, o, cam);
  const t0 = S.Tin(0), YB = 900, BH = 600, BW = 170, a0 = seg(t0, 0, .4);
  const B2 = [{ g: 'A', x: 760, pct: D.CHOIX.A.pct, l: 'DESCRIPTION A', d: 0 }, { g: 'B', x: 1160, pct: D.CHOIX.B.pct, l: 'DESCRIPTION B', d: .7 }];
  const yA = YB - BH * B2[0].pct / 100, yB = YB - BH * B2[1].pct / 100, xb = 1400;
  S.monde(() => {
    if (S.voit('barres')) {
      B2.forEach(b => {
        const k = eIO(seg(t0, .3 + b.d, 1.6 + b.d));
        barre(ctx, b.x, BW, YB, BH, [{ v: b.pct * k, col: BLEU }, { v: (100 - b.pct) * k, col: PISTE }], 1, a0);
        // le rouge descend du haut
        ctx.globalAlpha = a0; ctx.fillStyle = ROUGE; ctx.fillRect(b.x - BW / 2 + 1.5, YB - BH + 1.5, BW - 3, Math.max(0, BH * (100 - b.pct) / 100 * k - 1.5)); ctx.globalAlpha = 1;
        ctx.strokeStyle = CRAIE; ctx.lineWidth = 3; ctx.globalAlpha = a0; ctx.strokeRect(b.x - BW / 2, YB - BH, BW, BH); ctx.globalAlpha = 1;
        txt(ctx, b.l, b.x, YB + 50, 28, CRAIE, 'center', a0);
        const yb = YB - BH * b.pct / 100 * k;
        txt(ctx, `${fmt(b.pct * k)} %`, b.x - BW / 2 - 24, yb + 14, 40, BLEU_TXT, 'right', seg(t0, .3 + b.d, .6 + b.d));
      });
      tirets(ctx, 540, YB - BH / 2, 1380, YB - BH / 2, CRAIE, a0 * .8);
      txt(ctx, '50 %', 520, YB - BH / 2 + 8, 22, GRIS, 'right', a0, MONO);
    }
    if (S.voit('ecart')) {
      const k1 = S.P(1, 0, .8);
      tirets(ctx, B2[0].x + BW / 2, yA, lerp(B2[0].x + BW / 2, xb + 20, k1), yA, BLEU_TXT, k1, 3, [6, 6]);
      tirets(ctx, B2[1].x + BW / 2, yB, lerp(B2[1].x + BW / 2, xb + 20, k1), yB, BLEU_TXT, k1, 3, [6, 6]);
      const k2 = S.P(1, .7, 1.4);
      if (k2 > 0) {
        ctx.globalAlpha = k2; ctx.strokeStyle = CRAIE; ctx.lineWidth = 4;
        const ym = lerp(yA, yB, .5), h2 = (yB - yA) / 2 * k2;
        ctx.beginPath(); ctx.moveTo(xb, ym - h2); ctx.lineTo(xb + 20, ym - h2); ctx.moveTo(xb + 20, ym - h2); ctx.lineTo(xb + 20, ym + h2); ctx.lineTo(xb, ym + h2); ctx.stroke();
        ctx.globalAlpha = 1;
        txt(ctx, String(D.CHOIX.ecartArrondi), xb + 50, ym + 6, 96, CRAIE, 'left', seg(S.Tin(1), 1.2, 1.6));
        txt(ctx, 'POINTS D’ÉCART', xb + 54, ym + 56, 26, CRAIE, 'left', seg(S.Tin(1), 1.4, 1.8));
      }
    }
  });
  if (S.voit('temoins')) {
    const tv = S.I('vie', S.t(0) + 1.9), tm = S.I('mort', S.t(0) + 2.6);
    B2.forEach((b, j) => [BLEU, ROUGE].forEach((col, c) => {
      const ka = eBack(seg(t0, .2 + j * .3 + c * .15, .65 + j * .3 + c * .15)); if (ka <= .01) return;
      const e = { col };
      if (b.g === 'A' && T >= tv) { const lu = seg(T, tv, tv + .6) * (1 - seg(T, tv + 3.4, tv + 4.4)); if (lu > 0) { e.mode = 'vie'; e.k = lu; } e.halo = .5 * seg(T, tv + 3.4, tv + 4.4); }
      if (b.g === 'B' && c === 0 && T >= tm) { e.mode = 'peur'; e.dis = seg(T, tm + .8, tm + 2.8); if (e.dis >= 1) return; }
      const x = b.x + (c ? 1 : -1) * (BW / 2 + 34);
      bonhomme(S, x, YB, { cle: `temoin${b.g}${c ? 'Rouge' : 'Bleu'}`, f: TEMOINS_ECART[b.g][c], cs: 3, k: Math.min(ka, 1.2), pied: true, role: c ? 'rouge' : 'bleu' }, e);
    }));
  }
  S.repere('barreA', 760, yA); S.repere('barreB', 1160, yB); S.repere('ecart', xb + 110, lerp(yA, yB, .5));
  S.repere('titreA', 760, YB + 40); S.repere('titreB', 1160, YB + 40);
  return infos(S);
});

// ================================================================ écran 06 : les deux descriptions disent-elles la même chose ?
export const ACCORD = Object.freeze([['TOUT À FAIT D’ACCORD', LABO], ['PLUTÔT D’ACCORD', LABO_FONCE], ['NEUTRE', NEUTRE], ['PLUTÔT PAS D’ACCORD', TIEDE], ['PAS DU TOUT D’ACCORD', CHAUD]]);
const pourcents = n => { const s = n.reduce((a, b) => a + b, 0); return n.map(v => v / s * 100); };
// au pied de chaque barre, un témoin gris qui lève les yeux vers elle et hoche la tête quand elle dit « d'accord » (P56)
const TEMOINS_MEME = Object.freeze({ A: PREMIERS[5], B: PREMIERS[71] });
export const ecranMemeChose = fondu(function ecranMemeChose(ctx, T, o = {}, cam) {
  const S = contexte(ctx, T, 6, o, cam);
  const t0 = S.Tin(0), a0 = seg(t0, 0, .4), YB = 880, BH = 560, BW = 150;
  const M = D.MEME_CHOSE;
  const G2 = [
    { g: 'A', x: 820, n: M.A.reponses, ok: `${fmt(M.A.accord)} %`, non: `${fmt(M.A.desaccord)} %`, l: 'GROUPE A', d: 0 },
    { g: 'B', x: 1340, n: M.B.reponses, ok: `${fmt(M.B.accord)} %`, non: `${fmt(M.B.desaccord)} %`, l: 'GROUPE B', d: .5 },
  ];
  S.monde(() => {
    if (S.voit('boite')) boite(ctx, 960, 160, [['« Les deux descriptions sont factuellement équivalentes. »', 30, CRAIE]], a0);
    if (S.voit('barres')) G2.forEach(gr => {
      const p = pourcents(gr.n), k = eIO(seg(t0, .3 + gr.d, 1.6 + gr.d));
      barre(ctx, gr.x, BW, YB, BH, p.map((v, i) => ({ v, col: ACCORD[i][1] })), k, a0);
      txt(ctx, gr.l, gr.x, YB + 46, 26, CRAIE, 'center', a0);
      const a1 = S.P(1, 0, .5), ha = BH * (p[0] + p[1]) / 100;
      cerne(ctx, gr.x - BW / 2 - 8, YB - ha - 8, BW + 16, ha + 16, CRAIE, a1, T);
      txt(ctx, gr.ok, gr.x + BW / 2 + 36, YB - ha / 2 + 10, 72, LABO, 'left', a1);
      txt(ctx, 'D’ACCORD', gr.x + BW / 2 + 40, YB - ha / 2 + 54, 26, LABO, 'left', a1);
      txt(ctx, `${gr.non} PAS D’ACCORD`, gr.x + BW / 2 + 40, YB - BH + 30, 20, CHAUD, 'left', S.P(1, .4, .9));
    });
    if (S.voit('legende')) ACCORD.forEach(([l, c], i) => {
      const y = 560 + i * 54;
      ctx.globalAlpha = a0; ctx.fillStyle = c; ctx.fillRect(110, y - 24, 30, 30); ctx.globalAlpha = 1;
      txt(ctx, l, 156, y, 22, CRAIE, 'left', a0);
    });
  });
  if (S.voit('temoins')) G2.forEach((gr, j) => {
    const ka = eBack(seg(t0, .3 + gr.d, .75 + gr.d)); if (ka <= .01) return;
    const p = pourcents(gr.n), haut = S.ecran(gr.x, YB - BH * (p[0] + p[1]) / 100 * eIO(seg(t0, .3 + gr.d, 1.6 + gr.d)));
    const e = { col: GRIS_FIG, cible: haut, fixe: t0 > .5 + gr.d };
    const th = S.I(`hoche${gr.g}`, S.t(1) + .2 + j * .4);
    if (hoche(T, th) || hoche(T, th + 1.2)) e.p = { bob: 1, yy: 1 };
    bonhomme(S, gr.x - BW / 2 - 34, YB, { cle: `temoin${gr.g}`, f: TEMOINS_MEME[gr.g], cs: 3, k: Math.min(ka, 1.2), pied: true, role: 'temoin' }, e);
  });
  S.repere('question', 960, 200);
  G2.forEach(gr => { const p = pourcents(gr.n); S.repere(`barre${gr.g}`, gr.x, YB - BH * (p[0] + p[1]) / 200); S.repere(`chiffre${gr.g}`, gr.x + BW / 2 + 120, YB - BH * (p[0] + p[1]) / 200); });
  return infos(S);
});

// ================================================================ écran 07 : plus ou moins trompeuse ?
export const TROMPE = Object.freeze([LABO, NEUTRE, CHAUD]);   // moins trompeuse / ni plus ni moins / plus trompeuse (de bas en haut)
export const ecranTrompeuse = fondu(function ecranTrompeuse(ctx, T, o = {}, cam) {
  const S = contexte(ctx, T, 7, o, cam), Tr = D.TROMPEUSE;
  const t0 = S.Tin(0), a0 = seg(t0, 0, .4), YB = 880, BH = 560, BW = 150;
  const kB = S.P(2, 0, 1.2);
  const qA = seg(t0, 0, .4) * (1 - seg(S.Tin(2), 0, .3)), qB = seg(S.Tin(2), .3, .7);
  const trio = v => [v.moins, v.ni, v.plus];
  const BARS = [
    { x: 760, l: 'ONT PRIS LA BLEUE', c: BLEU_TXT, col: BLEU, A: trio(Tr.A.bleus), B: trio(Tr.B.bleus), cote: -1 },
    { x: 1160, l: 'ONT PRIS LA ROUGE', c: ROUGE_TXT, col: ROUGE, A: trio(Tr.A.rouges), B: trio(Tr.B.rouges), cote: 1 },
  ];
  S.monde(() => {
    if (S.voit('boite')) {
      boite(ctx, 960, 150, [['GROUPE A', 24, LABO], ['« La description B est-elle plus ou moins trompeuse que la A ? »', 28, CRAIE]], qA);
      boite(ctx, 960, 150, [['GROUPE B', 24, LABO], ['« La description A est-elle plus ou moins trompeuse que la B ? »', 28, CRAIE]], qB);
    }
    if (S.voit('barres')) BARS.forEach((b, j) => {
      const v = b.A.map((x, i) => lerp(x, b.B[i], kB)), k = eIO(seg(t0, .3 + j * .5, 1.6 + j * .5));
      barre(ctx, b.x, BW, YB, BH, v.map((x, i) => ({ v: x, col: TROMPE[i] })), k, a0);
      txt(ctx, b.l, b.x, YB + 100, 24, b.c, 'center', a0);
      // ce qui donne raison à son choix : pour les bleus du groupe A, la B est plus trompeuse ; etc.
      const montre = (i, val, lab, a) => {
        if (a <= 0) return;
        const y0 = YB - BH * v.slice(0, i).reduce((s, x) => s + x, 0) / 100, h = BH * v[i] / 100;
        cerne(ctx, b.x - BW / 2 - 8, y0 - h - 8, BW + 16, h + 16, CRAIE, a, T);
        const x = b.x + b.cote * (BW / 2 + 34), al = b.cote < 0 ? 'right' : 'left';
        txt(ctx, val, x, y0 - h / 2 + 10, 60, CRAIE, al, a);
        txt(ctx, lab, x, y0 - h / 2 + 50, 22, CRAIE, al, a);
      };
      const a1 = S.P(1, 0, .5) * (1 - seg(S.Tin(2), 0, .3)), a2 = seg(S.Tin(2), 1.2, 1.7);
      if (j === 0) { montre(2, `${fmtV(Tr.A.bleus.plus)} %`, 'JUGENT LA B PLUS TROMPEUSE', a1); montre(0, `${fmtV(Tr.B.bleus.moins)} %`, 'JUGENT LA A MOINS TROMPEUSE', a2); }
      else { montre(0, `${fmtV(Tr.A.rouges.moins)} %`, 'JUGENT LA B MOINS TROMPEUSE', a1); montre(2, `${fmtV(Tr.B.rouges.plus)} %`, 'JUGENT LA A PLUS TROMPEUSE', a2); }
    });
    if (S.voit('legende')) [['PLUS TROMPEUSE', CHAUD], ['NI PLUS NI MOINS', NEUTRE], ['MOINS TROMPEUSE', LABO]].forEach(([l, c], i) => {
      const y = 600 + i * 54;
      ctx.globalAlpha = a0; ctx.fillStyle = c; ctx.fillRect(1600, y - 24, 30, 30); ctx.globalAlpha = 1;
      txt(ctx, l, 1646, y, 22, CRAIE, 'left', a0);
    });
  });
  // ses deux petites figures, sous les barres : un bonhomme bleu, un rouge ; ils lèvent les yeux vers leur barre (P57)
  if (S.voit('figures')) BARS.forEach((b, j) => {
    if (a0 <= .01) return;
    const tr = S.I('regard', S.t(0) + 1.6);
    const e = { col: b.col, a: a0, cible: S.ecran(b.x, YB - BH * .55), fixe: T >= tr };
    bonhomme(S, b.x, YB + 44, { cle: j, f: PREMIERS[j], cs: 3, role: j ? 'rouge' : 'bleu' }, e);
  });
  S.repere('question', 960, 200); S.repere('barreBleus', 760, YB - BH / 2); S.repere('barreRouges', 1160, YB - BH / 2);
  S.repere('chiffreBleus', 760 - BW / 2 - 120, YB - BH * .75); S.repere('chiffreRouges', 1160 + BW / 2 + 120, YB - BH * .3);
  return infos(S);
});

// ================================================================ écran 08 : auriez-vous fait le même choix ?
export const GRILLE = (cx, i) => [cx - 189 + (i % 10) * 42, 350 + Math.floor(i / 10) * 46];
const MC = D.FIGURES.memeChoix, MCD = D.MEME_CHOIX.deduits;
const PANNEAUX_CHOIX = Object.freeze([
  { g: 'A', cx: 540, de: BLEU, vers: ROUGE, tit: 'GROUPE A · ONT PRIS LA BLEUE', tc: BLEU_TXT, n: MC.A.changent, adm: MC.A.admettent, s0: 0, p: 1,
    l1: `≈ ${MCD.A} % AURAIENT PRIS LA ROUGE`, l1b: 'AVEC LA DESCRIPTION B', l2: `${D.MEME_CHOIX.A.admettent} % L’ADMETTENT` },
  { g: 'B', cx: 1380, de: ROUGE, vers: BLEU, tit: 'GROUPE B · ONT PRIS LA ROUGE', tc: ROUGE_TXT, n: MC.B.changent, adm: MC.B.admettent, s0: 3, p: 2,
    l1: `≈ ${MCD.B} % AURAIENT PRIS LA BLEUE`, l1b: 'AVEC LA DESCRIPTION A', l2: `${D.MEME_CHOIX.B.admettent} % L’ADMETTENT`,
    // ce que dit le texte de Ronan (M16–M17) : parmi les autres, ceux qui n'admettent pas, au moins la moitié se trompent
    // (donnees.js : moitieB). La page de Thibaut disait « ≈ 40 % S'ILLUSIONNENT », sur tous les rouges de B, comme le
    // graphique d'origine : le même fait, compté sur une autre base que celle de la voix. « 1 sur n » arrondit n vers le
    // haut : l'étiquette ne dit jamais plus que le calcul
    l3: `LES AUTRES : AU MOINS 1 SUR ${Math.ceil(100 / MCD.moitieB)} SE TROMPE` },
].map(Object.freeze));
// la note de l'écran 08 (sa mention dans la page d'essai, la note de bas de page de la page de Thibaut) : d'où vient
// chaque chiffre déduit qu'on y lit, l'étiquette « au moins 1 sur 2 » comprise (elle prend aussi les 21 % qui l'admettent)
export const NOTE_CHOIX = `≈ ${MCD.A} %, ≈ ${MCD.B} % et « au moins 1 sur ${Math.ceil(100 / MCD.moitieB)} » : déduits de l’écart entre les deux groupes (${fmt(D.CHOIX.A.pct)} % de bleue avec A, ${fmt(D.CHOIX.B.pct)} % avec B) et des ${D.MEME_CHOIX.B.admettent} % qui l’admettent.`;
const sautChoix = (d1, r) => d1 + .3 + r * .025 + .125;
export const ecranMemeChoix = fondu(function ecranMemeChoix(ctx, T, o = {}, cam) {
  const S = contexte(ctx, T, 8, o, cam);
  PANNEAUX_CHOIX.forEach(pn => {
    const t0 = S.Tin(pn.s0), t1 = S.Tin(pn.s0 + 1), t2 = S.Tin(pn.s0 + 2), a0 = seg(t0, 0, .4), d1 = S.t(pn.s0 + 1), d2 = S.t(pn.s0 + 2);
    if (t0 < 0) return;
    const rang = RANG[pn.p];
    S.monde(() => {
      if (S.voit('textes')) txt(ctx, pn.tit, pn.cx, 300, 26, pn.tc, 'center', a0);
      // les cases : ceux qui l'admettent en bleu laboratoire ; les autres, ceux qui n'admettent pas, dans un cadre GRIS (le
      // groupe dont parle « LES AUTRES : … ») ; parmi eux, ceux qui s'illusionnent passent aux pointillés
      if (S.voit('cases')) for (let i = 0; i < 100; i++) {
        const [x, y] = GRILLE(pn.cx, i), r = rang[i];
        if (r < pn.adm) {
          const k = seg(t2, .2 + r * .02, .5 + r * .02); if (k <= 0) continue;
          ctx.globalAlpha = .3 * k; ctx.fillStyle = LABO; ctx.fillRect(x - 19, y - 21, 38, 42);
          ctx.globalAlpha = k; ctx.strokeStyle = LABO; ctx.lineWidth = 2; ctx.strokeRect(x - 19, y - 21, 38, 42); ctx.globalAlpha = 1;
        } else if (pn.l3) {
          const ka = seg(t2, 1.2 + (r - pn.adm) * .01, 1.5 + (r - pn.adm) * .01);
          const k = r < pn.n ? seg(t2, 1.6 + (r - pn.adm) * .02, 1.9 + (r - pn.adm) * .02) : 0;
          if (ka * (1 - k) > 0) {
            ctx.globalAlpha = .55 * ka * (1 - k); ctx.strokeStyle = GRIS; ctx.lineWidth = 2;
            ctx.strokeRect(x - 19, y - 21, 38, 42); ctx.globalAlpha = 1;
          }
          if (k <= 0) continue;
          ctx.globalAlpha = k * (.65 + .35 * Math.sin(T * 4 + i)); ctx.strokeStyle = CRAIE; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
          ctx.strokeRect(x - 19, y - 21, 38, 42); ctx.setLineDash([]); ctx.globalAlpha = 1;
        }
      }
    });
    if (S.voit('figures')) for (let i = 0; i < 100; i++) {
      const [x, y] = GRILLE(pn.cx, i), r = rang[i];
      const ka = eBack(seg(t0, .1 + R1[i] * .8, .55 + R1[i] * .8)); if (ka <= .01) continue;
      const change = r < pn.n, tc = sautChoix(d1, r), col = change && T >= tc ? pn.vers : pn.de;
      const e = (change && saut(T, tc, pn.vers, pn.de)) || { col };
      if (e.mode !== 'saut') {
        if (r < pn.adm && T >= d2 + .5 + r * .02) { e.fixe = true; e.cible = S.phi; }                    // ils l'admettent : ils regardent Phi
        else if (pn.l3 && change && T >= d2 + 1.8 + (r - pn.adm) * .02) { e.p = { yx: hache(i * 13 + pn.p) < .5 ? -1 : 1, yy: 0 }; e.reflet = false; }   // ils regardent ailleurs
      }
      bonhomme(S, x, y, { cle: i, f: PREMIERS[i], cs: 3, k: Math.min(ka, 1.2), panneau: pn.g, role: change ? 'change' : 'garde' }, e);
    }
    S.monde(() => {
      if (!S.voit('textes')) return;
      txt(ctx, pn.l1, pn.cx, 846, 26, mix(pn.vers, CRAIE, .25), 'center', seg(t1, 2.0, 2.5));
      txt(ctx, pn.l1b, pn.cx, 880, 20, GRIS, 'center', seg(t1, 2.2, 2.7));
      txt(ctx, pn.l2, pn.cx, 938, 30, LABO, 'center', seg(t2, .8, 1.3));
      if (pn.l3) txt(ctx, pn.l3, pn.cx, 982, 30, CRAIE, 'center', seg(t2, 2.6, 3.1));
    });
    S.repere(`titre${pn.g}`, pn.cx, 290); S.repere(`panneau${pn.g}`, pn.cx, 557); S.repere(`texte${pn.g}`, pn.cx, 900);
  });
  S.monde(() => {
    if (S.voit('filet')) { ctx.globalAlpha = seg(S.Tin(3), 0, .4) * .5; ctx.fillStyle = CRAIE; ctx.fillRect(959, 280, 2, 720); ctx.globalAlpha = 1; }
    if (o.notes) note(ctx, NOTE_CHOIX, seg(S.Tin(1), 2, 2.5));
  });
  return infos(S);
});

// ================================================================ écran 09 : qui prend la bleue ?
// Au pied de chaque barre (sous son nom), le même bonhomme gris partout : seul le mot dit qui ils sont (EPISODE.md, S09).
const QUI = Object.freeze([
  { titre: 'GENRE', cx: 400, pas: 0, bars: [['HOMMES', D.GENRE.hommes], ['FEMMES', D.GENRE.femmes]] },
  { titre: 'ORIENTATION POLITIQUE', cx: 1260, pas: 1, bars: [['TRÈS À\nGAUCHE', D.POLITIQUE.tresGauche], ['PLUTÔT À\nGAUCHE', D.POLITIQUE.plutotGauche], ['AU\nCENTRE', D.POLITIQUE.centre], ['PLUTÔT À\nDROITE', D.POLITIQUE.plutotDroite], ['TRÈS À\nDROITE', D.POLITIQUE.tresDroite]] },
].map(q => Object.freeze({ ...q, bars: q.bars.map(([l, v]) => [l, 100 * v.bleue / v.total]) })));
const QUI_PAS = 170, QUI_YB = 840, QUI_BH = 480, QUI_BW = 104;
const quiX = (q, j) => q.cx - (q.bars.length - 1) * QUI_PAS / 2 + j * QUI_PAS;
export const ecranQui = fondu(function ecranQui(ctx, T, o = {}, cam) {
  const S = contexte(ctx, T, 9, o, cam), YB = QUI_YB, BH = QUI_BH, BW = QUI_BW;
  const vide = o.vide ?? Infinity;
  QUI.forEach((q, gi) => {
    const t = S.Tin(q.pas), tv = T - Math.min(vide, S.t(q.pas)), a = seg(tv, 0, .4);
    if (tv < 0) return;
    S.monde(() => {
      if (!S.voit('barres')) return;
      txt(ctx, q.titre, q.cx, 250, 26, LABO, 'center', a);
      const x0 = quiX(q, 0);
      tirets(ctx, x0 - 90, YB - BH / 2, x0 + (q.bars.length - 1) * QUI_PAS + 90, YB - BH / 2, CRAIE, a * .5);
      q.bars.forEach(([lab, v], j) => {
        const x = quiX(q, j), k = eIO(seg(t, .3 + j * .15, 1.4 + j * .15));
        barre(ctx, x, BW, YB, BH, [{ v, col: BLEU }], k, a);
        txt(ctx, `${fmt(v * k, 0)} %`, x, YB - BH * v / 100 * k - 16, 34, BLEU_TXT, 'center', seg(t, .3 + j * .15, .6 + j * .15));
        if (t < .6) txt(ctx, '?', x, YB - BH - 22, 30, GRIS, 'center', a * (1 - seg(t, 0, .6)) * (.55 + .35 * Math.sin(T * 3 + j + gi * 2)));   // la devinette
        lab.split('\n').forEach((l, li) => txt(ctx, l, x, YB + 40 + li * 28, 22, CRAIE, 'center', a));
      });
    });
    if (S.voit('temoins')) q.bars.forEach(([lab, v], j) => {
      const x = quiX(q, j), ka = eBack(seg(tv, .1 + j * .08, .55 + j * .08)); if (ka <= .01) return;
      const k = eIO(seg(t, .3 + j * .15, 1.4 + j * .15)), haut = S.ecran(x, YB - BH * v / 100 * k);
      const e = { col: GRIS_FIG, cible: haut, fixe: t >= .3 + j * .15 };
      bonhomme(S, x, YB + 148, { cle: `temoin${gi}${j}`, f: PREMIERS[(gi * 37 + j * 11 + 3) % 100 === N48 ? 1 : (gi * 37 + j * 11 + 3) % 100], cs: 3, k: Math.min(ka, 1.2), pied: true, panneau: q.titre, role: lab.replace('\n', ' ') }, e);
    });
    q.bars.forEach(([lab, v], j) => S.repere(`barre${gi}${j}`, quiX(q, j), YB - BH * v / 100));
  });
  S.monde(() => { if (o.notes) note(ctx, 'Les deux groupes confondus.', seg(S.Tin(0), 0, .4)); });
  return infos(S);
});

// ================================================================ écran 10 : tous les écarts sur une même échelle
export const ecranEchelle = fondu(function ecranEchelle(ctx, T, o = {}, cam) {
  const S = contexte(ctx, T, 10, o, cam), XG = 640, PT = 19, E = D.ECARTS;
  const L = [
    { l: E.genre.nom, v: E.genre.points, y: 420, s: 0, d: 0 },
    { l: E.politique.nom, v: E.politique.points, y: 530, s: 0, d: .4 },
    { l: E.pays.nom, v: E.pays.points, y: 640, s: 0, d: .8 },
    { l: E.description.nom, v: E.description.points, y: 800, s: 1, d: 0 },
  ];
  S.monde(() => {
    txt(ctx, 'ÉCART DE PART DE BLEUE, EN POINTS', XG, 300, 24, GRIS, 'left', seg(S.Tin(0), 0, .4));
    L.forEach(r => {
      const t = S.Tin(r.s), a = seg(t, r.d, r.d + .4); if (a <= 0) return;
      txt(ctx, r.l, XG - 36, r.y + 14, 28, CRAIE, 'right', a);
      if (r.v === null) {
        ctx.globalAlpha = a; ctx.strokeStyle = GRIS; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.strokeRect(XG, r.y - 22, 20 * PT, 48); ctx.setLineDash([]); ctx.globalAlpha = 1;
        txt(ctx, 'À MESURER', XG + 24, r.y + 12, 24, GRIS, 'left', a);
        return;
      }
      const k = r.s === 1 ? eOut(seg(t, .2, 1.0)) : eIO(seg(t, r.d + .2, r.d + 1.0)), w = r.v * PT * k, col = r.s === 1 ? CRAIE : LABO;
      ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(XG, r.y - 22, w, 48); ctx.globalAlpha = 1;
      txt(ctx, `${Math.round(r.v * k)} PTS`, XG + w + 24, r.y + 16, r.s === 1 ? 48 : 36, col, 'left', a);
    });
    ctx.globalAlpha = seg(S.Tin(0), 0, .4); ctx.fillStyle = CRAIE; ctx.fillRect(XG - 2, 350, 3, 500); ctx.globalAlpha = 1;
  });
  L.forEach((r, j) => S.repere(['genre', 'politique', 'pays', 'description'][j], XG + (r.v ?? 20) * PT, r.y));
  return infos(S);
});

// ================================================================ écran 11 : le méta-dilemme
// Au pied des barres, entre elles, le N°48 les regarde (EPISODE.md, P75) : la barre A, puis la barre B.
export const ecranMeta = fondu(function ecranMeta(ctx, T, o = {}, cam) {
  const S = contexte(ctx, T, 11, o, cam), YB = 870, BH = 540, BW = 170, M = D.META;
  const G2 = [{ x: 760, a: M.A.pctA, b: M.A.pctB, l: ['EXPOSÉS D’ABORD', 'À LA DESCRIPTION A'], s: 0 }, { x: 1160, a: M.B.pctA, b: M.B.pctB, l: ['EXPOSÉS D’ABORD', 'À LA DESCRIPTION B'], s: 1 }];
  S.monde(() => {
    if (S.voit('boite')) boite(ctx, 960, 150, [['Pour cent vrais participants,', 30, CRAIE], ['quelle description choisissez-vous ?', 30, CRAIE]], seg(S.Tin(0), 0, .4));
    if (S.voit('barres')) G2.forEach(g => {
      const t = S.Tin(g.s), a = seg(t, 0, .4); if (t < 0) return;
      const k = eIO(seg(t, .2, 1.4));
      barre(ctx, g.x, BW, YB, BH, [{ v: g.a, col: SABLE }, { v: g.b, col: LABO }], k, a);
      g.l.forEach((l, i) => txt(ctx, l, g.x, YB + 44 + i * 30, 22, CRAIE, 'center', a));
      const ka = seg(t, 1.2, 1.6);
      txt(ctx, `${fmtV(g.a)} %`, g.x, YB - BH * g.a / 200 + 14, 36, NUIT, 'center', ka);
      txt(ctx, `${fmtV(g.b)} %`, g.x, YB - BH * (g.a + g.b / 2) / 100 + 14, 44, NUIT, 'center', ka);
    });
    if (S.voit('legende')) [['CHOISISSENT LA DESCRIPTION B', LABO], ['CHOISISSENT LA DESCRIPTION A', SABLE]].forEach(([l, c], i) => {
      const y = 620 + i * 54, a = seg(S.Tin(0), 0, .4);
      ctx.globalAlpha = a; ctx.fillStyle = c; ctx.fillRect(1380, y - 24, 30, 30); ctx.globalAlpha = 1;
      txt(ctx, l, 1426, y, 22, CRAIE, 'left', a);
    });
  });
  if (S.voit('temoins')) {
    const t0 = S.Tin(0), ka = eBack(seg(t0, .2, .65));
    if (ka > .01) {
      const versB = T >= S.I('regardB', S.t(1) + .3), g = G2[versB ? 1 : 0];
      const e = { col: GRIS_FIG, cible: S.ecran(g.x, YB - BH * .5), fixe: t0 >= .6 };
      bonhomme(S, 960, YB, { cle: 'n48', f: PREMIERS[N48], cs: 4, k: Math.min(ka, 1.2), pied: true, role: 'N°48' }, e);
      // ses crochets laiton (commun.js), comme partout où il est le N°48 ; S.voit('crochets') : o.sans les retire
      const n = S.sujets[S.sujets.length - 1];
      if (n && n.cle === 'n48' && S.voit('crochets')) C.crochets(ctx, n.x, n.y, n.cs / C.CS, { a: Math.min(1, ka), k: seg(t0, .3, 1) });
    }
  }
  G2.forEach((g, j) => { S.repere(`barre${'AB'[j]}`, g.x, YB - BH * .5); S.repere(`partB${'AB'[j]}`, g.x, YB - BH * (g.a + g.b / 2) / 100); });
  S.repere('question', 960, 200);
  return infos(S);
});

// ================================================================ écran 12 : deux scénarios pour cent vrais participants
// À gauche (A) : l'issue incertaine, les sujets hésitent (entre 44 et 58 bleus : une illustration de Thibaut ; ils
// changent de couleur en sautant) ; la jauge ne dit AUCUN chiffre (« BLEUE ? »), sauf o.chiffres. À droite (B) : 12,6 %,
// treize bleus ; au pas 1, « LA BLEUE PERD : ≈ 13 MORTS » et ils partent en caractères (Thibaut), ou, o.vraisHumains, ils
// ont peur et restent (P76 : ce sont de vrais humains, et c'est une question).
const SC = D.SCENARIOS;
// la figure i du panneau A hésite : sa couleur et son dernier changement (ou le prochain, s'il est tout proche)
function hesite(i, T) {
  const w = 1.1 + R1[i] * 1.7, ph0 = R2[i] * 9, ph = T * w + ph0;
  const bleu = Math.sin(ph) > 0, kd = Math.floor(ph / Math.PI);
  return { bleu, avant: (kd * Math.PI - ph0) / w, apres: ((kd + 1) * Math.PI - ph0) / w };
}
export const ecranScenarios = fondu(function ecranScenarios(ctx, T, o = {}, cam) {
  const S = contexte(ctx, T, 12, o, cam);
  const t0 = S.Tin(0), t1 = S.Tin(1), a0 = seg(t0, 0, .4), d1 = S.t(1);
  const PN = [{ cx: 540, l: 'AVEC LA DESCRIPTION A', g: 'A' }, { cx: 1380, l: 'AVEC LA DESCRIPTION B', g: 'B' }];
  PN.forEach((pn, j) => {
    S.monde(() => { if (S.voit('textes')) txt(ctx, pn.l, pn.cx, 300, 26, LABO, 'center', a0); });
    let nb = 0;
    for (let i = 0; i < 100; i++) {
      const [x, y] = GRILLE(pn.cx, i), r = RANG[j][i];
      const ka = eBack(seg(t0, .1 + R1[i] * .8, .55 + R1[i] * .8));
      let e, role;
      if (j === 0) {
        const h = hesite(i, T), sur = r < SC.A.bleusMin, hes = !sur && r < SC.A.bleusMax, bleu = sur || (hes && h.bleu);
        if (bleu) nb++;
        role = sur ? 'bleu' : hes ? 'hesite' : 'rouge';
        e = { col: bleu ? BLEU : ROUGE };
        if (hes) {   // il change de couleur en sautant : le saut entoure le changement (0,2 s avant, 0,45 s après)
          const tc = T - h.avant < .45 ? h.avant : h.apres - T < .2 ? h.apres : null;
          if (tc !== null) { e.mode = 'saut'; e.t0 = tc; }
        }
      } else {
        const bleu = r < SC.B.bleus;
        role = bleu ? 'bleu' : 'rouge';
        e = { col: bleu ? BLEU : ROUGE };
        if (bleu && T >= d1) {
          if (o.vraisHumains) e.mode = 'peur';
          else { const td = d1 + .2 + R2[i] * .8; if (T < td + .2) e.mode = 'peur'; e.dis = seg(T, td, td + 2); }
        }
      }
      if (ka <= .01 || e.dis >= 1 || !S.voit('figures')) continue;
      if (o.vraisHumains) e.reflet = false;
      bonhomme(S, x, y, { cle: i, f: PREMIERS[i], cs: 3, k: Math.min(ka, 1.2), panneau: pn.g, role }, e);
    }
    const pb = j === 0 ? nb : D.CHOIX.B.pct;
    S.monde(() => {
      if (S.voit('jauges')) jaugeH(ctx, pn.cx - 230, 860, 460, pb * seg(t0, .4, 1.2), (100 - pb) * seg(t0, .4, 1.2), a0, false, j === 0 && !o.chiffres);
      if (!S.voit('textes')) return;
      if (j === 0) txt(ctx, 'ISSUE INCERTAINE', pn.cx, 940, 30, CRAIE, 'center', seg(t0, 1.2, 1.6));
      else txt(ctx, `LA BLEUE PERD : ≈ ${SC.B.bleus} MORTS`, pn.cx, 940, 30, ROUGE_TXT, 'center', seg(t1, 1.6, 2.1));
    });
    S.repere(`panneau${pn.g}`, pn.cx, 557); S.repere(`jauge${pn.g}`, pn.cx - 230 + 4.6 * pb, 868); S.repere(`texte${pn.g}`, pn.cx, 930);
  });
  S.monde(() => { if (S.voit('filet')) { ctx.globalAlpha = a0 * .5; ctx.fillStyle = CRAIE; ctx.fillRect(959, 280, 2, 700); ctx.globalAlpha = 1; } });
  return infos(S);
});

// ================================================================ la table des écrans
const F = (fn, groupe) => (ctx, T, d, o = {}) => fn(ctx, T, { ...o, etapes: d, groupe }, o.cam);
export const ECRANS = Object.freeze({
  1: { nom: 'Description A : la révélation', titre: 'DESCRIPTION A', pas: 3, note: null, humeurs: ['curieux', 'neutre', 'grand'], secoue: null,
    parties: ['boite', 'questions', 'figures', 'jauge', 'resultat', 'tampon'], instants: [], dessine: F(ecranJauge, 'A') },
  2: { nom: 'Prédictions, groupe A', titre: 'PRÉDICTIONS · GROUPE A', pas: 4, note: 'Chaque figure représente 1 % des participants du groupe.', humeurs: ['neutre', 'curieux', 'plisse', 'doute'], secoue: null,
    parties: ['axe', 'reel', 'figures', 'moyennes', 'surlignes'], instants: [], dessine: F(ecranPredictions, 'A') },
  3: { nom: 'Description B : la révélation', titre: 'DESCRIPTION B', pas: 3, note: null, humeurs: ['curieux', 'bas', 'plisse'], secoue: [2, 2.3],
    parties: ['boite', 'questions', 'figures', 'jauge', 'resultat', 'tampon'], instants: [], dessine: F(ecranJauge, 'B') },
  4: { nom: 'A contre B : 53 points', titre: 'LA MÊME RÈGLE, DEUX FOIS', pas: 2, note: null, humeurs: ['neutre', 'grand'], secoue: null,
    parties: ['barres', 'ecart', 'temoins'], instants: ['vie', 'mort'], dessine: F(ecranEcart) },
  5: { nom: 'Prédictions, groupe B', titre: 'PRÉDICTIONS · GROUPE B', pas: 3, note: 'Chaque figure représente 1 % des participants du groupe.', humeurs: ['neutre', 'curieux', 'neutre'], secoue: null,
    parties: ['axe', 'reel', 'figures', 'moyennes', 'surlignes'], instants: [], dessine: F(ecranPredictions, 'B') },
  6: { nom: 'Les deux descriptions disent-elles la même chose ?', titre: 'MÊME SITUATION ?', pas: 2, note: null, humeurs: ['neutre', 'grand'], secoue: null,
    parties: ['boite', 'barres', 'legende', 'temoins'], instants: ['hocheA', 'hocheB'], dessine: F(ecranMemeChose) },
  7: { nom: 'Plus ou moins trompeuse ?', titre: 'PLUS OU MOINS TROMPEUSE ?', pas: 3, note: null, humeurs: ['neutre', 'curieux', 'doute'], secoue: null,
    parties: ['boite', 'barres', 'legende', 'figures'], instants: ['regard'], dessine: F(ecranTrompeuse) },
  8: { nom: 'Auriez-vous fait le même choix ?', titre: 'LE MÊME CHOIX ?', pas: 6, note: NOTE_CHOIX, humeurs: ['neutre', 'curieux', 'grand', 'neutre', 'curieux', 'doute'], secoue: null,
    parties: ['textes', 'cases', 'figures', 'filet'], instants: [], dessine: F(ecranMemeChoix) },
  9: { nom: 'Qui prend la bleue ?', titre: 'QUI PREND LA BLEUE ?', pas: 2, note: 'Les deux groupes confondus.', humeurs: ['curieux', 'neutre'], secoue: null,
    parties: ['barres', 'temoins'], instants: [], dessine: F(ecranQui) },
  10: { nom: 'Tous les écarts, même échelle', titre: 'TOUS LES ÉCARTS', pas: 2, note: null, humeurs: ['neutre', 'grand'], secoue: [1, .3],
    parties: [], instants: [], dessine: F(ecranEchelle) },
  11: { nom: 'Le méta-dilemme', titre: 'LE MÉTA-DILEMME', pas: 2, note: null, humeurs: ['curieux', 'grand'], secoue: null,
    parties: ['boite', 'barres', 'legende', 'temoins', 'crochets'], instants: ['regardB'], dessine: F(ecranMeta) },
  12: { nom: 'Deux scénarios pour cent vrais participants', titre: 'POUR DE VRAI ?', pas: 2, note: null, humeurs: ['doute', 'bas'], secoue: null,
    parties: ['textes', 'figures', 'jauges', 'filet'], instants: [], dessine: F(ecranScenarios) },
});
export const ECRAN_DE = Object.freeze({ jauge: 1, predictionsA: 2, jaugeB: 3, ecart: 4, predictionsB: 5, memeChose: 6, trompeuse: 7, memeChoix: 8, qui: 9, echelle: 10, meta: 11, scenarios: 12 });
export function ecran(ctx, T, n, d, o = {}) {
  const E = ECRANS[n]; if (!E) throw new Error(`resultats.js : pas d’écran ${n}`);
  return E.dessine(ctx, T, d, o);
}

// ================================================================ les instants de ce qui se passe (le son, le regard)
// Rend un objet de listes d'instants absolus, triées : sauts (chaque bonhomme qui change de couleur en sautant), arrivees,
// et selon l'écran : seuil (la jauge passe les 50 %), vie, peurs, envols (les départs en caractères), tampon, cases
// (les cases LABO), secoue (la secousse de Phi, de la page de Thibaut).
export function moments(n, d = [], o = {}) {
  const t = i => d[i] ?? Infinity, out = { sauts: [], envols: [], arrivees: [] }, tri = a => a.sort((x, y) => x - y);
  const E = ECRANS[n];
  if (E && E.secoue) out.secoue = t(E.secoue[0]) + E.secoue[1];
  if (n === 1 || n === 3) {
    const g = n === 1 ? 'A' : 'B', dec = o.decimale !== false, pct = D.CHOIX[g].pct;
    for (let i = 0; i < 100; i++) {
      out.arrivees.push(t(0) + R1[i] * .8);
      out.sauts.push(sautJauge(t(1), i));
      if (n === 3 && partJauge(g, i, dec) > 0) out.envols.push(envolJauge(t(2), i));
    }
    if (pct > 50) {   // l'instant où la jauge passe le trait (le déclic) : eIO(seg(t1, .2, 2.4)) · pct = 50
      let a = 0, b = 1; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (eIO(m) * pct < 50) a = m; else b = m; }
      out.seuil = t(1) + .2 + 2.2 * b;
    } else out.seuil = null;
    out.resultat = t(1) + 2.3;
    out.tampon = t(2) + (n === 1 ? .7 : 2.4);
    if (n === 1) out.vie = t(2); else out.peurs = [t(2)];
  } else if (n === 2 || n === 5) {
    const G = PRED[n === 2 ? 'A' : 'B'];
    for (const it of G.items) { out.arrivees.push(t(0) + .2 + R1[it.id] * 1.2); out.sauts.push(sautPred(t(1), it.id)); }
    out.moyennes = t(1) + 1.6;
    out.surlignes = SURLIGNES[G.g].map((s, j) => t(2 + j));
  } else if (n === 4) {
    out.vie = o.instants?.vie ?? t(0) + 1.9; out.peurs = [o.instants?.mort ?? t(0) + 2.6]; out.envols = [out.peurs[0] + .8];
    out.ecart = t(1) + 1.2;
  } else if (n === 8) {
    out.cases = [];
    for (const pn of PANNEAUX_CHOIX) {
      for (let r = 0; r < pn.n; r++) out.sauts.push(sautChoix(t(pn.s0 + 1), r));
      for (let r = 0; r < pn.adm; r++) out.cases.push(t(pn.s0 + 2) + .2 + r * .02);
    }
    tri(out.cases);
  } else if (n === 12) {
    out.morts = t(1) + 1.6;
    if (!o.vraisHumains) for (let i = 0; i < 100; i++) if (RANG[1][i] < SC.B.bleus) out.envols.push(t(1) + .2 + R2[i] * .8);
  }
  tri(out.sauts); tri(out.envols); tri(out.arrivees);
  return out;
}

// ================================================================ le fond de la page de Thibaut
// commun.fond centré en (900, 520), sans sol ; il s'éclaircit quand tout le monde vit (01) et chauffe quand les bleus
// meurent (03), comme le fond du test (o.teinte false : jamais)
export function fondResultats(ctx, T, n, d = [], o = {}) {
  const t2 = T - (d[2] ?? Infinity), teinte = o.teinte !== false;
  C.fond(ctx, T, { centre: [900, 520], sol: 0, clair: teinte && n === 1 ? .55 * seg(t2, 0, .8) : 0, chaud: teinte && n === 3 ? .7 * seg(t2, 0, 1.2) : 0 });
}
