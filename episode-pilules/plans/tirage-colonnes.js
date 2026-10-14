/* ==========================================================================
   Les deux pilules, l'épisode — plans/tirage-colonnes.js : P39–P43, le tirage au sort
   (le lot « tirage », de 526,9 à 618,2 s ; plans/tirage.js en est le sommaire)

   La foule du test (les cent premiers participants, PREMIERS, la grille
   d'index.html) se dédouble en deux colonnes, A et B, la même foule : la mise
   en page des colonnes (commun.js : COLONNES, GRILLE, le filet en x 960, l'œil
   au sommet du filet). Le cadre du tirage saute d'une grille à l'autre et
   s'arrête ENTRE les deux : chacun a été tiré au sort, pas une salle. La
   fenêtre RÈGLES du test revient, ses règles se recomposent en la description
   A, son étiquette « A » (la graine plantée en P10) grandit et devient le
   titre. La description B s'écrit au rythme de la voix (R04). Puis les deux
   descriptions se démontent en morceaux de phrase soulignés, reliés par des
   fils à deux issues communes : ceux de A vont en rails parallèles, ceux de B
   se croisent (« prenez le temps de vérifier » : la pupille de Phi suit chaque
   fil, en silence). Les morceaux de B prennent l'ordre de A et les fils se
   décroisent ; les mots qui diffèrent pulsent. Chaque grille regarde l'autre
   fenêtre (ils l'ont lue aussi), et « lue en premier » se pose sous chacune.
   Enfin les coches du test : 9,4 % et 7,1 % d'erreurs, une case = 1 % du
   groupe, la décimale en coche à demi tracée.

   UN ÉCART À COLONNES (commun.js), voulu : ses fenêtres (y 60–300) passent
   sous le cartouche de la surimpression (x 40–388, y 32–132), qui cacherait
   le titre « DESCRIPTION A » et l'étiquette qui le devient. Comme le film de
   3 min 20 (ses fenêtres descendues en y 214 « pour laisser respirer le
   cartouche »), les fenêtres sont posées en y 146–336 (même x, même largeur)
   et les grilles 40 px plus bas (GRILLE(cx, i) + 40 : y 390–804) ; tout tient
   au-dessus de y 830. Les « 9,4 % » et « 7,1 % » se posent à côté des grilles
   (dessous, il n'y a plus la place).

   Repris : commun.js (fenetreRegles, etiquetteA, fenetreDescription, GRILLE,
   COLONNES, filet, tirage, cadreTirage, compteARebours, signe) ; la morph des
   règles en description, recopiée de film-pilules/plans/regles.js (morph, non
   exportée) ; l'étiquette qui devient titre et les morceaux, fils et issues
   sont nouveaux (EPISODE.md, « Ce qui est nouveau »).
   ========================================================================== */
import {
  CRAIE, GRIS, GRIS_FIG, LABO, LAITON, BLEU, ROUGE, ROUGE_TXT, FILET, MONO, PIX, G, NB,
  clamp, lerp, seg, cloche, cles, eIO, eOut, eBack, hache, rng, mix, rgba, fr, pc, balise, coupeBalise, ecrit, espace,
  signe, fond, fenetre, humeur, oeil, flotte, creeRegard, VOUS, point, dessineSujet, PREMIERS, FOULE, toile,
  filet, GRILLE, COLONNES, REGLES, hauteurRegles, fenetreRegles, etiquetteA, fenetreDescription,
  tirage, cadreTirage, compteARebours,
} from '../commun.js';
import { DESCRIPTIONS, lettres, plume as plumeBoite } from '../texte.js';
import { TEST } from '../donnees.js';
import { B, S } from './tirage-temps.js';

// ================================================================ la mise en page (voir l'en-tête : l'écart à COLONNES)
export const DY = 40;
export const FEN = Object.freeze([Object.freeze({ x: 80, y: 146, w: 780, h: 190 }), Object.freeze({ x: 1060, y: 146, w: 780, h: 190 })]);
const W_DEM = 540, FEN_DEM_X = Object.freeze([80, 1840 - W_DEM]);   // démontées, les fenêtres se resserrent vers les bords
export const ISSUES = Object.freeze([Object.freeze({ x: 760, y: 322, w: 400, h: 196 }), Object.freeze({ x: 760, y: 562, w: 400, h: 196 })]);
const CX = COLONNES.grilles, CS3 = COLONNES.cs;
export const place = (j, i) => { const [x, y] = GRILLE(CX[j], i); return { x, y: y + DY }; };
// la grille d'index.html (FOULE), centrée sous l'œil d'entrée (960) : la foule du test, telle qu'elle paraît
const depart = i => ({ x: FOULE[i].cx + 310, y: FOULE[i].cy });
const OEIL_ENTREE = Object.freeze({ x: 960, y: 150, s: 140 }), OEIL = Object.freeze({ x: COLONNES.oeil.x, y: COLONNES.oeil.y, s: COLONNES.oeil.taille });
const CENTRE_FEN = j => ({ x: FEN[j].x + FEN[j].w / 2, y: FEN[j].y + FEN[j].h / 2 });
const RECT_GRILLE = j => ({ x: CX[j] - 210, y: 366, w: 420, h: 460 });
const RECT_ENTRE = Object.freeze({ x: 960 - 36, y: 366, w: 72, h: 460 });   // entre les deux grilles : autour du filet
const TXT = `19px ${MONO}`, LH = 28, GAP = 16;

// ================================================================ les deux descriptions : à plat, puis démontées en morceaux
let MES = null;
const mesureur = () => MES || (MES = toile(8, 8).getContext('2d'));
const plat = txt => { const out = []; for (const l of balise(txt)) for (const s of l) for (const ch of s.s) out.push({ ch, c: s.c }); return out; };
// les caractères d'un texte balisé, coupé comme fenetreDescription le coupe (coupeBalise à w, IBM Plex Mono 19 px) :
// { i (l'indice dans le texte, à partir de i0), ch, c, x (depuis le début de la ligne), li, w } ; l'espace d'une coupure
// n'est sur aucune ligne
function disposer(txt, w, i0 = 0) {
  const m = mesureur(); m.font = TXT;
  const P = plat(txt), lignes = coupeBalise(m, txt, w), out = [];
  let p = 0;
  lignes.forEach((l, li) => {
    if (li > 0 && P[p] && P[p].ch === ' ') p++;
    let x = 0;
    for (const s of l) for (const ch of s.s) { const cw = m.measureText(ch).width; out.push({ i: i0 + p, ch, c: s.c, x, li, w: cw }); x += cw; p++; }
  });
  return { chars: out, n: lignes.length };
}
// les morceaux de phrase (EPISODE.md, P41), dans l'ordre du texte ; issues : celles qu'ils décrivent (0 : la bleue
// majoritaire, tout le monde vit ; 1 : sinon)
export const MORCEAUX = Object.freeze({
  A: [
    { id: 'a1', txt: fr('Si plus de la moitié d’entre vous prend la [b]bleue[/b], tout le monde vit.'), issues: [0] },
    { id: 'a2', txt: fr('Si au moins la moitié prend la [r]rouge[/r], ceux qui ont pris la [b]bleue[/b] meurent, seuls ceux qui ont pris la [r]rouge[/r] survivent.'), issues: [1] },
  ],
  B: [
    { id: 'b1', txt: fr('Si vous prenez la [b]bleue[/b], vous mourez,'), issues: [1] },
    { id: 'b2', txt: fr('sauf si la majorité a aussi pris la [b]bleue[/b] : dans ce cas, il ne vous arrive rien.'), issues: [0] },
    { id: 'b3', txt: fr('Si vous prenez la [r]rouge[/r], il ne vous arrive rien.'), issues: [0, 1] },
  ],
});
const ORDRE_DE_A = Object.freeze({ A: ['a1', 'a2'], B: ['b2', 'b1', 'b3'] });
// la tournure : les mots qui diffèrent (P42)
const DIFFERENTS = Object.freeze({ A: ['tout le monde vit', 'meurent', 'survivent'], B: ['vous mourez', 'il ne vous arrive rien'] });
const DISPO = new Map();
export function dispo(L) {
  if (DISPO.has(L)) return DISPO.get(L);
  const txt = DESCRIPTIONS[L], chaine = plat(txt).map(o => o.ch).join('');
  const flot = disposer(txt, FEN[0].w - 48);
  const morceaux = MORCEAUX[L].map(M => {
    const pm = plat(M.txt).map(o => o.ch).join(''), i0 = chaine.indexOf(pm), d = disposer(M.txt, W_DEM - 48, Math.max(0, i0));
    return { ...M, i0, chars: d.chars, n: d.n };
  });
  const pile = ordre => { let y = 0; const o = {}; for (const id of ordre) { const M = morceaux.find(m => m.id === id); o[id] = y; y += M.n * LH + GAP; } return o; };
  const lignes = morceaux.reduce((s, m) => s + m.n, 0);
  const mots = DIFFERENTS[L].flatMap(w => { const out = []; let k = -1; while ((k = chaine.indexOf(w, k + 1)) >= 0) out.push([k, k + w.length]); return out; });
  const D = {
    chaine, flot, morceaux, mots,
    y0: pile(morceaux.map(m => m.id)), y1: pile(ORDRE_DE_A[L]),
    hDem: 92 + (lignes - 1) * LH + (morceaux.length - 1) * GAP + 30,
    parI: new Map(flot.chars.map(c => [c.i, c])),
    // les morceaux recollés redonnent la description, mot pour mot
    ok: morceaux.every(m => m.i0 >= 0) && morceaux.map(m => plat(m.txt).map(o => o.ch).join('')).join(' ') === chaine,
  };
  if (!D.ok) console.warn(`[tirage] les morceaux de la description ${L} ne redonnent plus son texte`);
  DISPO.set(L, D);
  return D;
}
const H_DEM = () => Math.max(dispo('A').hDem, dispo('B').hDem);

// ================================================================ ce qui bouge, en fonction du temps
// démontées : 0 (à plat, la fenêtre du découpage) → 1 (en morceaux, la fenêtre resserrée vers le bord)
const kDem = T => eIO(seg(T, S.demonte0, S.demonte1)) * (1 - eIO(seg(T, S.plusTard + .2, S.plusTard + 1.1)));
// les morceaux de B dans l'ordre de A (P42), puis de retour
const kOrdre = T => eIO(seg(T, S.ordre, S.ordre + .6)) * (1 - eIO(seg(T, S.ordreRetour, S.ordreRetour + .6)));
const aGrilles = T => lerp(1, .15, eIO(seg(T, S.p41, S.p41 + .5))) + .85 * eIO(seg(T, S.plusTard + .3, S.plusTard + 1));
const aFilet = T => (1 - seg(T, S.p41, S.p41 + .5)) + seg(T, S.plusTard + .3, S.plusTard + 1);
const aIssues = T => seg(T, S.issues, S.issues + .4) * (1 - seg(T, S.plusTard, S.plusTard + .5));
// les issues allumées : la première sur « tout le monde vit », la seconde sur « Sinon » (la première baisse alors) ;
// éteintes avant que les morceaux ne changent de place (on voit les fils se décroiser)
const allume = (q, T) => (q === 0 ? seg(T, S.issue1, S.issue1 + .3) * (1 - .6 * seg(T, S.issue2, S.issue2 + .4)) : seg(T, S.issue2, S.issue2 + .3))
  * (1 - seg(T, S.ordre - .5, S.ordre));
const pulseTitre = (j, T) => { const t = j === 0 ? S.titreA : S.titreB; return cloche(T, t, t + .15, t + .9, t + 1.4); };
const pulseReexplique = T => cloche(T, S.reexplique, S.reexplique + .15, S.reexplique + .5, S.reexplique + .9);
const pulseMots = T => cloche(T, S.tournure, S.tournure + .2, S.tournure + 1.4, S.tournure + 1.9) * (.65 + .35 * Math.sin((T - S.tournure) * 9));

// la fenêtre j à l'instant T : { x, y, w, h, k (démontée) }
function rectFen(j, T) {
  const k = kDem(T), F = FEN[j];
  return { x: lerp(F.x, FEN_DEM_X[j], k), y: F.y, w: lerp(F.w, W_DEM, k), h: lerp(F.h, H_DEM(), k), k };
}

// ================================================================ les fils (P41) : de chaque morceau à son issue
// Des rails : on sort du morceau à l'horizontale, on tourne en x (xt), on rejoint l'issue à l'horizontale. Ceux de A
// sont emboîtés (le morceau du haut tourne plus loin) : parallèles. Ceux de B se croisent ; quand ses morceaux prennent
// l'ordre de A (P42), b1 et b2 échangent leur tournant et se décroisent (b3, qui va aux deux issues, en tirets, croise
// forcément b1).
export const FILS = Object.freeze([
  { L: 'A', m: 'a1', q: 0, pas: 0 }, { L: 'A', m: 'a2', q: 1, pas: 1 },
  { L: 'B', m: 'b2', q: 0, pas: 2 }, { L: 'B', m: 'b1', q: 1, pas: 3 },
  { L: 'B', m: 'b3', q: 0, pas: 4, tirets: true }, { L: 'B', m: 'b3', q: 1, pas: 4, tirets: true },
].map(Object.freeze));
export const D_FIL = .4;
export const tFil = pas => S.verif0 + .15 + pas * (S.verif1 - S.verif0 - .55) / 4;   // un par un, 0,4 s chacun, en silence
function ancre(L, id, T) {
  const D = dispo(L), M = D.morceaux.find(m => m.id === id), j = L === 'A' ? 0 : 1, R = rectFen(j, T);
  const by = lerp(D.y0[id], D.y1[id], L === 'B' ? kOrdre(T) : 0);
  return { x: j === 0 ? R.x + R.w + 9 : R.x - 9, y: R.y + 92 + by + (M.n - 1) * LH / 2 - 6 };
}
function route(F, T) {
  const a = ancre(F.L, F.m, T), I = ISSUES[F.q];
  if (F.L === 'A') { const xt = F.m === 'a1' ? 714 : 682, ye = I.y + 110; return [[a.x, a.y], [xt, a.y], [xt, ye], [I.x - 8, ye]]; }
  const kO = kOrdre(T), xt = { b1: lerp(1226, 1242, kO), b2: lerp(1250, 1204, kO), b3: 1274 }[F.m], ye = I.y + (F.m === 'b3' ? 142 : 90);
  return [[a.x, a.y], [xt, a.y], [xt, ye], [I.x + I.w + 8, ye]];
}
// le point atteint à la part k d'une ligne brisée ; et son tracé jusque-là
function lePoint(pts, k) {
  const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
  let r = clamp(k) * tot;
  for (let i = 0; i < L.length; i++) { if (r <= L[i] || i === L.length - 1) { const u = L[i] ? clamp(r / L[i]) : 1; return { x: lerp(pts[i][0], pts[i + 1][0], u), y: lerp(pts[i][1], pts[i + 1][1], u), i }; } r -= L[i]; }
  return { x: pts[0][0], y: pts[0][1], i: 0 };
}
function trace(ctx, pts, k) {
  if (k <= 0) return;
  const p = lePoint(pts, k);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= p.i; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.lineTo(p.x, p.y); ctx.stroke();
}
function fils(ctx, T) {
  const aF = 1 - seg(T, S.plusTard, S.plusTard + .5);
  if (aF <= 0 || T < tFil(0)) return;
  for (const F of FILS) {
    const k = eOut(seg(T, tFil(F.pas), tFil(F.pas) + D_FIL)); if (k <= 0) continue;
    const pts = route(F, T), lit = allume(F.q, T);
    ctx.save();
    ctx.globalAlpha = aF * (.6 + .4 * lit); ctx.strokeStyle = lit > .05 ? mix(CRAIE, LABO, .25 * lit) : CRAIE;
    ctx.lineWidth = 1.5 + 1.5 * lit; ctx.lineJoin = 'miter';
    if (lit > .05) { ctx.shadowColor = rgba(LABO, .8); ctx.shadowBlur = 10 * lit; }
    if (F.tirets) ctx.setLineDash([7, 5]);
    trace(ctx, pts, k);
    ctx.restore();
    // les deux bouts : une case
    ctx.globalAlpha = aF; ctx.fillStyle = CRAIE;
    ctx.fillRect(Math.round(pts[0][0]) - 2, Math.round(pts[0][1]) - 2, 5, 5);
    if (k >= 1) { const e = pts[pts.length - 1]; ctx.fillRect(Math.round(e[0]) - 2, Math.round(e[1]) - 2, 5, 5); }
    ctx.globalAlpha = 1;
  }
}

// ================================================================ les deux issues (P41) : deux petites fenêtres, deux mini-foules
const MINI = Object.freeze([0, 1].map(q => {
  const R = rng(q ? 4153 : 4141), ordre = [...Array(20).keys()];
  for (let i = 19; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [ordre[i], ordre[j]] = [ordre[j], ordre[i]]; }
  const nb = q ? 7 : 12;   // la bleue majoritaire (12 sur 20), ou non (7 sur 20) : EXEMPLE, pas des données
  return Object.freeze([...Array(20).keys()].map(k => Object.freeze({ f: PREMIERS[(k * 7 + (q ? 53 : 3)) % 100], bleu: ordre.indexOf(k) < nb, k })));
}));
const placeMini = (q, k) => ({ x: 960 - 153 + (k % 10) * 34, y: ISSUES[q].y + 96 + Math.floor(k / 10) * 44 });
const LEGENDES = Object.freeze(['tout le monde vit', 'les [b]bleus[/b] meurent · les [r]rouges[/r] vivent']);
function issues(ctx, T, O) {
  const a0 = aIssues(T); if (a0 <= .001) return;
  ISSUES.forEach((I, q) => {
    const a = a0 * eOut(seg(T, S.issues + q * .15, S.issues + q * .15 + .4)); if (a <= .001) return;
    const lit = allume(q, T);
    fenetre(ctx, I.x, I.y, I.w, I.h, a, mix(CRAIE, LABO, .7 * lit));
    if (lit > 0) { ctx.globalAlpha = a * .09 * lit; ctx.fillStyle = q === 0 ? LABO : ROUGE; ctx.fillRect(I.x, I.y, I.w, I.h); }
    ctx.globalAlpha = a; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = `24px ${PIX}`; ctx.fillStyle = LABO; ctx.fillText(`ISSUE ${q + 1}`, I.x + 20, I.y + 36);
    ctx.font = `500 13px ${MONO}`; ctx.fillStyle = GRIS; espace(ctx, 'EXEMPLE', I.x + I.w - 20, I.y + 33, 2, 'right');
    ctx.fillStyle = FILET; ctx.fillRect(I.x + 20, I.y + 48, I.w - 40, 2);
    for (const m of MINI[q]) {
      const p = placeMini(q, m.k), e = { col: m.bleu ? BLEU : ROUGE, a, mode: 'repos', phi: O, cible: O, reflet: true };
      if (q === 0 && T >= S.issue1) { e.mode = 'vie'; e.k = .8 * lit + .2; }
      if (q === 1 && T >= S.issue2) {
        if (m.bleu) { e.mode = 'peur'; const td = S.meurent + hache(m.k * 13 + 7) * .35; e.dis = seg(T, td, td + 1.6); if (e.dis >= 1) continue; }
        else if (T >= S.vivent) { e.mode = 'vie'; e.k = .6; }
      }
      dessineSujet(ctx, m.f, p.x, p.y, 2, e, T);
    }
    // la légende, quand l'issue s'allume (les mots de R07, R08)
    if (lit > 0) {
      ctx.globalAlpha = a * seg(lit, .2, 1); ctx.font = `16px ${MONO}`;
      const lignes = balise(LEGENDES[q], GRIS), w = ctx.measureText(lignes[0].map(s => s.s).join('')).width;
      ecrit(ctx, lignes, 960 - w / 2, I.y + I.h - 16, 20);
    }
    ctx.globalAlpha = 1;
  });
  // le temps de vérifier : le compte à rebours, sous les issues
  compteARebours(ctx, T, S.verif0, S.verif1 - S.verif0, ISSUES[1].x, ISSUES[1].y + ISSUES[1].h + 24, ISSUES[1].w, { a: a0 });
}

// ================================================================ les fenêtres de description
// le titre et la morph (P39) : RÈGLES (index.html, son étiquette « A ») revient du coin haut droit, glisse sur la colonne
// de gauche, se tasse ; ses règles se défont en caractères LABO et se recomposent en la description A (la morph de
// film-pilules/plans/regles.js, recopiée) ; l'étiquette grandit et devient le « A » du titre « DESCRIPTION A ».
const H5 = hauteurRegles(5);
const yRegle = i => { let y = 92; for (let j = 0; j < i; j++) y += REGLES[j].length * 31 + 16; return y; };
let SRC = null;
function dispoRegles() {
  if (SRC) return SRC;
  const m = mesureur(); m.font = `21px ${MONO}`;
  SRC = [];
  REGLES.forEach((r, i) => r.forEach((l, li) => { let x = 24; for (const s of l) for (const ch of s.s) { const cw = m.measureText(ch).width; if (ch !== ' ') SRC.push({ ch, c: s.c, x, y: yRegle(i) + li * 31 }); x += cw; } }));
  return SRC;
}
const glyphe = (j, T) => G[Math.floor(hache(j * 13 + Math.floor(T * 14) * 7919) * G.length)];
const FIN_MORPH = () => Math.max(S.morph + 2.15, S.titre1);
function rectRegles(T) {
  const k = eIO(seg(T, S.glisse0, S.glisse1)), F = FEN[0];
  return { x: lerp(1290, F.x, k), y: lerp(40, F.y, k), w: lerp(570, F.w, k) };
}
// où est l'étiquette « A » (son coin haut gauche, sa taille), entre RÈGLES et le titre
function etiquetteAnim(ctx, T) {
  const F = FEN[0]; ctx.font = `26px ${PIX}`;
  const ax = F.x + 24 + ctx.measureText('DESCRIPTION ').width, aw = ctx.measureText('A').width;
  const k = eIO(seg(T, S.etiq0, S.etiq1)), s = lerp(22, 36, k);
  const cx = lerp(F.x + F.w - 36 + 11, ax + aw / 2, k), cy = lerp(F.y + 14 + 11, F.y + 40 - 9, k);
  return { x: cx - s / 2, y: cy - s / 2, s, k, cx, cy, ax };
}
function morphRegles(ctx, T) {
  const F = FEN[0], x = F.x, y = F.y, w = F.w, h = lerp(H5, F.h, eIO(seg(T, S.morph, S.morph + .6))), ky = h / H5;
  fenetre(ctx, x, y, w, h, 1);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  // « RÈGLES » s'efface pendant que l'étiquette grandit ; « DESCRIPTION » s'écrit devant le « A » qu'elle est devenue
  const aR = 1 - seg(T, S.etiq0, S.etiq0 + .3);
  if (aR > 0) { ctx.globalAlpha = aR; ctx.font = `24px ${PIX}`; ctx.fillStyle = LABO; ctx.fillText('RÈGLES', x + 24, y + 40); }
  ctx.globalAlpha = 1; ctx.fillStyle = FILET; ctx.fillRect(x + 24, y + 54, w - 48, 2);
  const E = etiquetteAnim(ctx, T), boite = 1 - seg(T, S.etiq1, S.etiq1 + .25);
  if (boite > 0) etiquetteA(ctx, E.x, E.y, lerp(.4, 1, E.k) * boite, 'A', { taille: E.s, col: mix(GRIS, LABO, E.k) });
  if (T >= S.etiq1) {
    ctx.font = `26px ${PIX}`; ctx.fillStyle = LABO;
    ctx.globalAlpha = seg(T, S.etiq1, S.etiq1 + .25); ctx.fillText('A', E.ax, y + 40);
    const n = clamp(Math.floor((T - S.etiq1 - .05) * 36), 0, 12);
    ctx.globalAlpha = 1; if (n > 0) ctx.fillText('DESCRIPTION '.slice(0, n), x + 24, y + 40);
  }
  // les caractères
  const src = dispoRegles(), dst = dispo('A').flot.chars.filter(c => c.ch !== ' ' && c.ch !== NB), Ns = src.length, Nt = dst.length, t0 = S.morph;
  ctx.save(); ctx.beginPath(); ctx.rect(x + 4, y + 60, w - 8, h - 64); ctx.clip();
  const pris = new Uint8Array(Ns);
  for (let j = 0; j < Nt; j++) pris[Math.floor(j * Ns / Nt)] = 1;
  ctx.font = `21px ${MONO}`;
  for (let s = 0; s < Ns; s++) {          // ceux qui ne servent pas : ils montent et s'éteignent
    if (pris[s]) continue;
    const c = src[s], ts = t0 + (s / Ns) * .3, k = seg(T, ts, ts + .7);
    if (k >= 1) continue;
    ctx.globalAlpha = (1 - k) * .9; ctx.fillStyle = T < ts ? c.c : mix(LABO, CRAIE, k);
    ctx.fillText(T < ts ? c.ch : glyphe(s, T), x + c.x, y + c.y * ky - 40 * eOut(k));
  }
  for (let j = 0; j < Nt; j++) {          // ceux qui voyagent : de leur place dans les règles à leur place dans la description
    const d = dst[j], s = Math.floor(j * Ns / Nt), c = src[s];
    const ts = t0 + (s / Ns) * .3, tf = t0 + .2 + (j / Nt) * .55 + hache(j * 7 + 3) * .15, u = eIO(seg(T, tf, tf + .75));
    const sx = x + c.x, sy = y + c.y * ky, dx = x + 24 + d.x, dy = y + 92 + d.li * LH;
    if (u >= 1) {
      const fl = 1 - seg(T, tf + .75, tf + 1.2);
      ctx.font = TXT;
      if (fl > 0) { ctx.globalAlpha = .14 * fl; ctx.fillStyle = LABO; ctx.fillRect(dx - 1, dy - 17, d.w + 2, 23); }
      ctx.globalAlpha = 1; ctx.fillStyle = fl > 0 ? mix(d.c, LABO, fl * .6) : d.c; ctx.fillText(d.ch, dx, dy);
      continue;
    }
    if (T < ts) { ctx.font = `21px ${MONO}`; ctx.globalAlpha = 1; ctx.fillStyle = c.c; ctx.fillText(c.ch, sx, sy); continue; }
    const lx = lerp(sx, dx, u), ly = lerp(sy, dy, u), len = Math.hypot(dx - sx, dy - sy) || 1, sw = Math.sin(Math.PI * u) * (hache(j * 31 + 1) - .5) * 160;
    ctx.font = TXT; ctx.globalAlpha = .55 + .45 * Math.sin(Math.PI * u) + (u > .9 ? .3 : 0);
    ctx.fillStyle = u > .85 ? mix(LABO, d.c, (u - .85) / .15) : LABO;
    ctx.fillText(u > .92 ? d.ch : glyphe(j, T), lx - (dy - sy) / len * sw, ly + (dx - sx) / len * sw);
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
// la description B écrite au rythme de la voix (R04 : « « Si vous… rien. » ») : les caractères de la fenêtre, sans le
// « « » et l'espace qui ouvrent la réplique, ni les espaces des coupures (qui ne sont sur aucune ligne)
export function nB(T) {
  if (T < S.r04) return 0;
  const n = Math.max(0, lettres('R04', T) - 2), C = dispo('B').flot.chars;
  let k = 0; while (k < C.length && C[k].i < n) k++;
  return k;
}
function plumeB(T) {
  const n = nB(T), C = dispo('B').flot.chars, F = FEN[1];
  if (T < S.r04 - .3 || n >= C.length) return null;
  const c = C[Math.max(0, n - 1)];
  return n === 0 ? { x: F.x + 24, y: F.y + 92 - 7 } : { x: F.x + 24 + c.x + c.w, y: F.y + 92 + c.li * LH - 7 };
}
// une fenêtre démontée : le cadre, le titre, les morceaux soulignés (chaque caractère va de sa place à plat à sa place
// dans son morceau), les mots qui diffèrent quand ils pulsent
function fenetreDemontee(ctx, T, j, R, bord) {
  const L = j === 0 ? 'A' : 'B', D = dispo(L), F = FEN[j], k = R.k, kO = L === 'B' ? kOrdre(T) : 0, pm = pulseMots(T);
  fenetre(ctx, R.x, R.y, R.w, R.h, 1, bord);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = `26px ${PIX}`; ctx.fillStyle = mix(LABO, CRAIE, .5 * pulseTitre(j, T)); ctx.fillText(`DESCRIPTION ${L}`, R.x + 24, R.y + 40);
  ctx.fillStyle = FILET; ctx.fillRect(R.x + 24, R.y + 54, R.w - 48, 2);
  ctx.font = TXT;
  const dans = i => D.mots.some(([a, b]) => i >= a && i < b);
  for (const M of D.morceaux) {
    const by = lerp(D.y0[M.id], D.y1[M.id], kO), lignes = new Map();
    for (const c of M.chars) {
      const f = D.parI.get(c.i);
      const x = f ? lerp(F.x + 24 + f.x, FEN_DEM_X[j] + 24 + c.x, k) : FEN_DEM_X[j] + 24 + c.x;
      const y = f ? lerp(F.y + 92 + f.li * LH, F.y + 92 + by + c.li * LH, k) : F.y + 92 + by + c.li * LH;
      const l = lignes.get(c.li) || { x0: Infinity, x1: -Infinity, y }; l.x0 = Math.min(l.x0, x); l.x1 = Math.max(l.x1, x + c.w); l.y = y; lignes.set(c.li, l);
      if (c.ch === ' ' || c.ch === NB) continue;
      if (pm > 0 && dans(c.i)) { ctx.globalAlpha = .45 * pm; ctx.fillStyle = LABO; ctx.fillRect(x - 1, y - 17, c.w + 2, 24); }
      ctx.globalAlpha = 1; ctx.fillStyle = pm > 0 && dans(c.i) ? mix(c.c, CRAIE, .4 * pm) : c.c; ctx.fillText(c.ch, x, y);
    }
    // le souligné du morceau (GRIS), qui se tire une fois démonté
    const ks = seg(k, .55, 1);
    if (ks > 0) { ctx.globalAlpha = ks; ctx.fillStyle = GRIS; for (const l of lignes.values()) ctx.fillRect(Math.round(l.x0), Math.round(l.y + 7), Math.round((l.x1 - l.x0) * ks), 2); }
  }
  ctx.globalAlpha = 1;
}
function fenetres(ctx, T) {
  // la fenêtre de gauche : RÈGLES, puis la description A
  if (T >= S.regles) {
    if (T < S.morph) {
      const r = rectRegles(T), a = seg(T, S.regles, S.regles + .25);
      fenetreRegles(ctx, T, 5, { a, x: r.x, y: r.y, w: r.w, etiquette: { a: .4 } });
    } else if (T < FIN_MORPH()) morphRegles(ctx, T);
  }
  for (const j of [0, 1]) {
    if (j === 0 && T < FIN_MORPH()) continue;
    if (j === 1 && T < S.fenB) continue;
    const F = FEN[j], R = rectFen(j, T);
    const bord = mix(CRAIE, LABO, Math.max(pulseTitre(j, T), pulseReexplique(T)));
    if (j === 1 && T < S.fenB + .35) {     // la fenêtre B s'ouvre, vide
      const hh = F.h * eOut(seg(T, S.fenB, S.fenB + .35));
      fenetre(ctx, F.x, F.y + (F.h - hh) / 2, F.w, hh, 1); ctx.globalAlpha = 1;
      continue;
    }
    if (R.k > 0) { fenetreDemontee(ctx, T, j, R, bord); continue; }
    const o = { bord };
    if (j === 1) {
      o.n = nB(T);
      o.titre = 'DESCRIPTION B'.slice(0, clamp(Math.floor((T - S.fenB - .35) * 40), 0, 13));
      // la plume LABO : prête (elle clignote) avant que la voix ne commence, puis elle écrit avec elle
      o.plume = T < S.r04fin + .1 && (T >= S.r04 || Math.floor(T * 2.5) % 2 === 0);
    }
    fenetreDescription(ctx, T, j === 0 ? 'A' : 'B', F.x, F.y, F.w, F.h, o);
    if (pulseTitre(j, T) > 0) { ctx.globalAlpha = .5 * pulseTitre(j, T); ctx.font = `26px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'left'; ctx.fillText(`DESCRIPTION ${j ? 'B' : 'A'}`, F.x + 24, F.y + 40); ctx.globalAlpha = 1; }
  }
}
// « lue en premier » (P42), sous chaque fenêtre, du côté de sa grille (au bord : les coches de P43 ne la touchent pas)
function etiquettesPremier(ctx, T) {
  ctx.font = `500 16px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const txt = 'lue en premier', w = ctx.measureText(txt).width + 24;
  [0, 1].forEach(j => {
    const t = S.premier + j * .25; if (T < t) return;
    const F = FEN[j], x = j === 0 ? F.x + 16 : F.x + F.w - 16 - w, y = F.y + F.h + 10 - 8 * (1 - eBack(seg(T, t, t + .3)));
    ctx.globalAlpha = seg(T, t, t + .2);
    ctx.fillStyle = 'rgba(12,11,13,.92)'; ctx.fillRect(x, y, w, 24);
    ctx.strokeStyle = LAITON; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, 24);
    ctx.fillStyle = LAITON; ctx.fillText(txt, x + 12, y + 17);
  });
  ctx.globalAlpha = 1;
}

// ================================================================ les deux grilles (la même foule, deux fois)
// erreurs au test (P43) : 9,4 % à gauche (neuf, et un dixième à 40 %), 7,1 % à droite (sept, et un huitième à 10 %)
const melange = graine => { const R = rng(graine), a = [...Array(100).keys()]; for (let i = 99; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const ERREURS = Object.freeze([TEST.erreurs.A, TEST.erreurs.B]);
export const FAUX = Object.freeze(ERREURS.map((v, j) => Object.freeze(melange(j ? 7107 : 9409).slice(0, Math.ceil(v)))));
const partFaux = j => +(ERREURS[j] - Math.floor(ERREURS[j])).toFixed(3);   // .4 et .1 : la décimale
export const tFaux = (j, r) => (j ? S.septUn : S.neufQuatre) + .15 + r * .12;
export const tCorrige = (j, r) => S.corrige + j * .1 + r * .04;
export const tCoche = (j, i) => S.compris + .05 + ((i % 10) + Math.floor(i / 10)) * .03 + j * .08;
// l'instant où le sujet i de la grille j sort de sa place d'index.html (le dédoublement) : un peu de désordre
const tSort = i => S.dedouble0 + hache(i * 17 + 5) * .3;
function marque(j, i, T) {
  const tc = tCoche(j, i); if (T < tc) return null;
  const k = eBack(seg(T, tc, tc + .3)), r = FAUX[j].indexOf(i);
  if (r >= 0 && T >= tFaux(j, r) && T < tCorrige(j, r)) {
    const part = r === FAUX[j].length - 1 && partFaux(j) > 0 ? partFaux(j) : 1;
    return { faux: true, part, k };
  }
  const flash = r >= 0 && T >= tCorrige(j, r) ? 1 - seg(T, tCorrige(j, r), tCorrige(j, r) + .5) : 0;
  return { faux: false, k, flash };
}
function etatGrille(j, i, T, O) {
  const e = { col: GRIS_FIG, mode: 'repos', phi: O, cible: O, reflet: true, a: aGrilles(T) };
  // P42 : chacun regarde l'autre fenêtre (il l'a lue aussi), puis la sienne
  const tt = S.autre + (i % 10) * .025 + Math.floor(i / 10) * .03;
  if (T >= tt && T < tt + 1.4) { e.fixe = true; e.cible = CENTRE_FEN(1 - j); }
  else if (T >= tt + 1.4 && T < tt + 2.4) { e.fixe = true; e.cible = CENTRE_FEN(j); }
  // P43 : ceux qui se sont trompés regardent leurs pieds, jusqu'à ce qu'on leur réexplique
  const r = FAUX[j].indexOf(i);
  if (r >= 0 && T >= tFaux(j, r) && T < tCorrige(j, r)) e.mode = 'penaud';
  return e;
}
function grilles(ctx, T, O) {
  const a0 = seg(T, S.foule, S.foule + .4);
  if (a0 <= 0) return;
  for (let i = 0; i < 100; i++) {
    const f = PREMIERS[i], p0 = depart(i), ts = tSort(i), k = eIO(seg(T, ts, ts + .7));
    if (k <= 0) { dessineSujet(ctx, f, p0.x, p0.y, 4, { col: GRIS_FIG, a: a0, mode: 'repos', phi: O, cible: O, reflet: true }, T); continue; }
    for (const j of [0, 1]) {
      // P42 : en regardant l'autre fenêtre, chacun se penche un peu vers elle (à cs 3, les yeux seuls ne se voient guère)
      const tt = S.autre + (i % 10) * .025 + Math.floor(i / 10) * .03, dx = (j === 0 ? 4 : -4) * cloche(T, tt, tt + .25, tt + 1.2, tt + 1.5);
      const p = place(j, i), x = lerp(p0.x, p.x, k) + dx, y = lerp(p0.y, p.y, k);
      dessineSujet(ctx, f, x, y, k < .5 ? 4 : CS3, k < 1 ? { col: GRIS_FIG, mode: 'repos', phi: O, cible: O, reflet: true } : etatGrille(j, i, T, O), T);
    }
  }
  ctx.globalAlpha = 1;
  // P40 : un « ? » qui pulse au-dessus de chacun
  const aq = seg(T, B.P40 - .2, B.P40 + .3) * (1 - seg(T, S.p41, S.p41 + .3));
  if (aq > 0) {
    ctx.font = `18px ${PIX}`; ctx.fillStyle = GRIS; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    for (const j of [0, 1]) for (let i = 0; i < 100; i++) { const p = place(j, i); ctx.globalAlpha = aq * (.45 + .4 * Math.sin(T * 3 + i + j * 2)); ctx.fillText('?', p.x, p.y - 24); }
    ctx.globalAlpha = 1;
  }
  // P43 : les coches (verifs d'index.html), ✗ en ROUGE_TXT ; la dernière erreur, à demi (la décimale)
  if (T >= S.compris) for (const j of [0, 1]) for (let i = 0; i < 100; i++) {
    const m = marque(j, i, T); if (!m) continue;
    // la coche tient dans les 10 px entre deux rangées (des cases de 1 px : 7 × 7) ; la croix, plus grande, déborde un peu
    const p = place(j, i), y = p.y - 23;
    if (m.faux) {
      if (m.part < 1) { ctx.globalAlpha = 1 - m.part; ctx.fillStyle = LABO; signe(ctx, '✓', p.x, y, 12 * m.k); }
      ctx.globalAlpha = m.part; ctx.fillStyle = ROUGE_TXT; signe(ctx, '✗', p.x, y, 17 * m.k);
    } else { ctx.globalAlpha = 1; ctx.fillStyle = m.flash > 0 ? mix(LABO, CRAIE, m.flash) : LABO; signe(ctx, '✓', p.x, y, (m.flash > .3 ? 17 : 12) * m.k); }
  }
  ctx.globalAlpha = 1;
}
// les chiffres (P43), à côté de chaque grille : « 9,4 % », « au moins une erreur au test »
function chiffres(ctx, T) {
  [0, 1].forEach(j => {
    const t = (j ? S.septUn : S.neufQuatre) + .1; if (T < t) return;
    const x = j ? 1712 : 208, a = seg(T, t, t + .3);
    ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = `40px ${PIX}`; ctx.fillStyle = CRAIE; ctx.fillText(pc(ERREURS[j]), x, 600);
    ctx.font = `18px ${MONO}`; ctx.fillStyle = GRIS; ctx.fillText('au moins une erreur', x, 636); ctx.fillText('au test', x, 660);
  });
  ctx.globalAlpha = 1;
}

// ================================================================ le tirage (P39) : le cadre laiton ne se pose pas
const ETAT_TIRAGE = T => tirage(T, S.tirage, 3, { n: 8, d0: .12, d1: .6, ordre: [0, 1, 0, 1, 0, 1, 0, 1, 2] });
const rectTirage = c => (c === 2 ? RECT_ENTRE : RECT_GRILLE(c));
function leTirage(ctx, T) {
  const e = ETAT_TIRAGE(T); if (!e) return;
  const a = 1 - seg(T, S.entre + .9, S.entre + 1.7); if (a <= 0) return;
  cadreTirage(ctx, T, e, rectTirage(e.cible), { pose: false, marge: 0, a });
  // arrêté entre les deux : chacun, de chaque côté, est tiré à son tour (un éclat laiton sur chaque sujet)
  ctx.strokeStyle = LAITON; ctx.lineWidth = 2;
  for (const j of [0, 1]) for (let i = 0; i < 100; i++) {
    const tf = S.entre + .15 + hache(j * 1000 + i * 3 + 1) * .9, u = seg(T, tf, tf + .22);
    if (u <= 0 || u >= 1) continue;
    const p = place(j, i); ctx.globalAlpha = 1 - u; ctx.strokeRect(p.x - 19, p.y - 22, 38, 44);
  }
  ctx.globalAlpha = 1;
}
const sujetTire = T => { let best = null, bt = -1; for (const j of [0, 1]) for (let i = 0; i < 100; i++) { const tf = S.entre + .15 + hache(j * 1000 + i * 3 + 1) * .9; if (tf <= T && tf > bt) { bt = tf; best = place(j, i); } } return best && { x: best.x, y: best.y - 12 }; };

// ================================================================ Phi, au sommet du filet
const placeOeil = T => cles(T, [[S.dedouble0, OEIL_ENTREE], [S.dedouble1, OEIL]]);
const HUMEURS_COL = Object.freeze([
  [S.tirage, 'curieux', .3], [S.entre + .3, 'neutre'],
  [S.etiq0, 'grand', .3], [S.titre1 + .5, 'neutre'],     // l'étiquette qui grandit : lui savait
  [S.mourez, 'doute'], [S.rien, 'neutre'],
  [S.verif0, 'plisse', .4], [S.verif1, 'neutre'],
  [S.egal, 'grand', .25], [S.egal + 1.2, 'neutre'],
  [S.tournure, 'curieux'], [S.titreA, 'neutre'],
  [S.premier, 'grand', .3], [S.premier + 1.2, 'neutre'],
  [S.compris, 'curieux'], [S.neufQuatre, 'neutre'], [S.reexplique, 'grand', .3],
]);
const centreIssue = q => ({ x: ISSUES[q].x + ISSUES[q].w / 2, y: ISSUES[q].y + ISSUES[q].h / 2 });
// les mots qui diffèrent, dans la fenêtre B démontée : la pupille passe de l'un à l'autre
const motPulse = T => {
  const D = dispo('B'), [i0] = D.mots[Math.floor(Math.max(0, T - S.tournure) / .6) % D.mots.length];
  const M = D.morceaux.find(m => m.chars.some(c => c.i === i0)); if (!M) return CENTRE_FEN(1);
  const c = M.chars.find(x => x.i === i0), R = rectFen(1, T);
  return { x: R.x + 24 + c.x + 40, y: R.y + 92 + lerp(D.y0[M.id], D.y1[M.id], kOrdre(T)) + c.li * LH - 7 };
};
const dernierFaux = j => T => { let best = null; for (let r = 0; r < FAUX[j].length; r++) if (tFaux(j, r) <= T) best = place(j, FAUX[j][r]); return best && { x: best.x, y: best.y - 20 }; };
let REGARD = null;
function regard() {
  if (REGARD) return REGARD;
  const C = [
    { t: S.foule, d: S.dedouble0 - S.foule, cible: point(960, 480) },
    { t: S.dedouble0, d: .5, cible: point(CX[0], 560) }, { t: S.dedouble0 + .5, d: .7, cible: point(CX[1], 560) },
    { t: S.tirage, d: S.entre - S.tirage + .15, cible: T => { const e = ETAT_TIRAGE(T); if (!e) return null; const r = rectTirage(e.cible); return { x: r.x + r.w / 2, y: 560 }; }, pause: .12 },
    { t: S.entre + .15, d: 1.0, cible: sujetTire, pause: .22 },
    { t: S.moitie, d: 1.4, cible: point(CX[0], 560) },
    { t: S.regles, d: S.morph - S.regles, cible: T => { const r = rectRegles(T); return { x: r.x + r.w / 2, y: r.y + 120 }; }, pause: .15 },
    { t: S.morph, d: S.etiq0 - S.morph, cible: point(470, 250) },
    { t: S.etiq0, d: S.titre1 - S.etiq0 + .5, cible: T => { if (T >= FIN_MORPH()) return point(200, 186); const m = mesureur(); const E = etiquetteAnim(m, T); return { x: E.cx, y: E.cy }; }, pause: .12 },
    { t: S.fenB, d: S.r04 - S.fenB, cible: point(CENTRE_FEN(1).x, 230) },
    { t: S.r04, d: S.r04fin - S.r04, cible: plumeB, pause: .15 },
    { t: S.demonte0, d: 1.2, cible: point(350, 300) },
    { t: S.issues + .6, d: .9, cible: centreIssue(0) },
    // le temps de vérifier : la pupille suit chaque fil, du morceau à l'issue
    ...FILS.filter((F, k) => k < 5).map(F => ({ t: tFil(F.pas), d: D_FIL + .1, cible: T => { const p = lePoint(route(F, T), eOut(seg(T, tFil(F.pas), tFil(F.pas) + D_FIL))); return { x: p.x, y: p.y }; }, pause: .08 })),
    { t: S.egal, d: 1.0, cible: point(960, 250) },
    { t: S.issue1, d: 1.6, cible: centreIssue(0) },
    { t: S.issue2, d: 2.2, cible: centreIssue(1) }, { t: S.meurent, d: 1.6, cible: point(960, ISSUES[1].y + 110) },
    { t: S.ordre, d: S.tournure - S.ordre, cible: point(1570, 300) },
    { t: S.tournure, d: 1.6, cible: motPulse, pause: .5 },
    { t: S.titreA, d: 1.0, cible: point(200, 186) }, { t: S.titreB, d: 1.0, cible: point(1180, 186) },
    { t: S.plusTard + .3, d: 1.2, cible: point(CX[0], 560) },
    { t: S.autre, d: .8, cible: point(CX[0], 520) }, { t: S.autre + .8, d: .8, cible: point(CX[1], 520) },
    { t: S.premier, d: .5, cible: point(170, 356) }, { t: S.premier + .5, d: .8, cible: point(1750, 356) },
    { t: S.compris, d: .7, cible: point(CX[0], 500) }, { t: S.compris + .7, d: .7, cible: point(CX[1], 500) },
    { t: S.neufQuatre, d: 1.4, cible: dernierFaux(0), pause: .15 }, { t: S.neufQuatre + 1.5, d: 1.2, cible: point(208, 590) },
    { t: S.septUn, d: 1.0, cible: dernierFaux(1), pause: .15 }, { t: S.septUn + 1.0, d: .7, cible: point(1712, 590) },
    { t: S.reexplique, d: 1.2, cible: VOUS },
  ];
  const auHasard = T => { const n = Math.floor(T / .9), j = hache(n * 3 + 1) < .5 ? 0 : 1, p = place(j, Math.floor(hache(n * 7 + 2) * 100)); return T < S.dedouble1 ? null : { x: p.x, y: p.y - 12 }; };
  REGARD = creeRegard({ cibles: C, repos: [[2, VOUS], [3, T => plumeBoite(T)], [1.5, auHasard]] });
  return REGARD;
}

// ================================================================ l'image (P39–P43 : un seul décor, chaque plan en est un moment)
export function dessineColonnes(ctx, T) {
  fond(ctx, T, { sol: .4, centre: [960, 470] });
  const P = placeOeil(T), O = { x: P.x, y: P.y + flotte(T) };
  // le filet descend avec le dédoublement ; il s'efface quand les issues prennent le milieu
  const kf = eOut(seg(T, S.dedouble0 + .2, S.dedouble1 + .2));
  if (kf > 0) filet(ctx, COLONNES.filet.x, COLONNES.filet.y0, lerp(COLONNES.filet.y0, COLONNES.filet.y1, kf), clamp(aFilet(T)));
  grilles(ctx, T, O);
  leTirage(ctx, T);
  issues(ctx, T, O);
  fils(ctx, T);
  fenetres(ctx, T);
  etiquettesPremier(ctx, T);
  chiffres(ctx, T);
  // « = » : les deux règles décrivent exactement la même situation
  const ae = seg(T, S.egal, S.egal + .2) * (1 - seg(T, S.plusTard, S.plusTard + .5));
  if (ae > 0) {
    const s = eBack(seg(T, S.egal, S.egal + .35));
    ctx.save(); ctx.globalAlpha = ae; ctx.translate(960, 250); ctx.scale(s, s);
    ctx.font = `60px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('=', 0, 0);
    ctx.restore();
  }
  oeil(ctx, T, { x: P.x, y: P.y, taille: P.s, humeur: humeur(T, HUMEURS_COL), regard: regard() });
}

// pour les essais
export const ESSAI_COLONNES = Object.freeze({
  dispo, nB, kDem, kOrdre, route: (i, T) => route(FILS[i], T), regard: T => { const c = regard().cible(T); return c && c.vous ? 'vous' : c && { x: Math.round(c.x), y: Math.round(c.y) }; },
});
