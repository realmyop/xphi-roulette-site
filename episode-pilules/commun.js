/* ==========================================================================
   Les deux pilules, l'épisode — commun.js : le socle de la direction artistique

   Ronan : « je veux que tu prennes les petits bonhommes que tu as dans le
   premier film de 3 minutes 20, on est bien d'accord ? » Oui : ce fichier est
   la COPIE de mockups/film-pilules/commun.js (le film n'est pas touché), avec
   les MÊMES bonshommes (l'atlas 11 × 12 cases, dessineSujet, les sept coiffes,
   l'écharpe, les états : l'attente, le saut du choix, la vie bras levés, la
   peur, la mort en caractères et son envers, le regard vers Phi et son reflet
   LABO), le même œil-diaphragme et son regard, les mêmes foules (FOULE, DEMO,
   PREMIERS, LOTS, ORDRE, MAUVAIS, N48, ABSTIENT). Deux choses seulement ont
   changé dans la partie recopiée : ≈ est dessiné en pixels (SIGNES), comme
   ✓ ✗ ▶ (aucune police du dépôt ne l'a) ; et l'épisode ajoute, À LA FIN DU
   FICHIER, ce que plusieurs lots dessinent pareil (EPISODE.md l'appelle
   partage.js : il est ici, dans le même module ; partage.js n'en est qu'un
   autre nom, qui réexporte tout). Que le film de 3 min 20 et l'épisode
   dessinent les mêmes bonshommes et le même œil, au pixel près, se vérifie :
   essai-socle.html les dessine des deux côtés et compare les pixels.

   La DA de Thibaut (mockups/pilules/index.html), reprise en FONCTIONS PURES
   DU TEMPS : l'image de l'instant T ne dépend que de T, jamais des images
   déjà jouées.

   ---------------------------------------------------------------------------
   CONTRAT POUR LES LOTS (plans/<lot>.js) — voir aussi l'en-tête de film.js
   ---------------------------------------------------------------------------
   - Chaque lot n'écrit QUE plans/<lot>.js (et plans/<lot>-*.js, plans/essai-
     <lot>.html s'il en veut). Il ne touche ni à ce fichier, ni à partage.js,
     film.js, index.html, texte.js, plans/ebauche.js, ni à resultats.js et
     donnees.js (écrits par un autre agent, en même temps que ce socle), ni au
     film de 3 min 20 (mockups/film-pilules/), ni aux autres lots.
   - resultats.js (les douze écrans de Thibaut) et donnees.js (les chiffres du
     sondage) se chargent à part : un lot qui les importe ne se charge pas tant
     qu'ils manquent ou sont cassés (l'épisode montre son ébauche et le dit) ;
     infos.resultats et infos.donnees (film.js) valent null s'ils manquent.
     resultats.js importe ce fichier, comme les lots (au montage, il a quitté
     le commun.js du film : les mêmes bonshommes, au pixel près).
   - On importe ce qu'il faut : import { fond, oeil, creeRegard, dessineSujet,
     … } from '../commun.js'. On ne modifie JAMAIS ce fichier depuis un lot, et
     on ne mute aucun de ses objets exportés (FOULE, DEMO, PREMIERS, CORPS,
     HUMEURS, REGLES, PORTRAITS… sont gelés ou partagés). Un utilitaire qui
     manque se définit chez soi (son origine en commentaire, s'il est recopié
     d'un module du film qui ne l'exporte pas) ; une forme de sujet qui manque
     passe par e.p (la pose) et e.extra (des calques en plus, avec extraCle),
     sans toucher à l'atlas. S'il manque quelque chose de COMMUN (un raccord
     entre deux lots en dépend), dites-le : on l'ajoute ici.
   - Toutes les fonctions qui dessinent prennent le contexte en premier
     argument, et le temps ABSOLU de l'épisode T quand elles animent.
   - Rien ne garde d'état d'une image à l'autre : seules des mémoires de calcul
     (l'atlas des sujets, les glyphes, les halos, la toile de la mosaïque), qui
     ne changent pas l'image. Jamais Math.random : rng(graine) et hache(n).
   - Les fonctions posent globalAlpha, fillStyle, font, textAlign… sans toujours
     les rendre : posez-les avant de dessiner. Celles qui transforment ou
     découpent le contexte font save()/restore().
   - Les polices sont chargées par la page avant la première image ; une toile
     mesurée avant (Node, essais) mesure de travers : prepare() remet à zéro.
   - Le style de la machine : pixels calculés, formes exactes, rien qui imite la
     main d'un artiste humain ; ni logo ni charte de marque. Les caractères hors
     des polices du dépôt (DotGothic16, IBM Plex Mono) se dessinent en pixels
     (✓ ✗ ▶ ≈ : signe(), texteSignes()) ; ∅ s'écrit Ø ; pas d'italique.

   CE QU'IL Y A (dans l'ordre du fichier)
   La partie recopiée du film :
   - base : W, H, la palette (CRAIE, GRIS, NUIT, LABO, LAITON, BLEU, BLEU_TXT,
     ROUGE, ROUGE_TXT, GRIS_FIG, FILET, SURTITRE, les teintes du fond), MONO,
     PIX, G (les caractères '01·:+*#%xφ'), NB (l'espace insécable), toile(w, h)
   - le temps : clamp, lerp, seg(t, a, b), dans, cloche, eIO, eOut, eIn, eBack,
     lisse, cles(t, [[t, v, f?]…]) (images clés), marche(t, …) (paliers),
     vers(T, [[t, v, d]…], depart) (les valeurs V d'index.html, en pur)
   - le hasard : rng(graine), hache(n) ; les couleurs : hex, mix, rgba
   - le texte : fr (insécables), pc (« 65,5 % »), virgule, nombre (« 4 457 »),
     balise ([b]…[/b] bleu, [r]…[/r] rouge, \n), longueur, ecrit, largeur,
     coupe, coupeBalise, espace (lettres espacées), signe et texteSignes
     (✓ ✗ ▶ ≈ en pixels), pastille
   - le décor : SOL, POUSSIERE, sol, poussiere, fond (laboratoire, chaud, clair,
     nuit : FOND_NUIT), trame, vignettage, voile
   - les fenêtres : fenetre, cartouche (+ CARTOUCHE, largeurCartouche), tampon,
     jauge (style index.html « demo » ou donnees.html « donnees », seuil 50 %)
   - les pilules : PILULES, POSES, pilule(ctx, T, i, { x, y, ps, t0, lab, eclat… })
   - Phi : HUMEURS, humeur(T, ordres), cligne, clin, microsaccade, flotte,
     dessineOeil, oeil(ctx, T, { x, y, taille, humeur, regard, … })
   - le regard de Phi : VOUS, point, decalage, creeRegard({ cibles, repos })
   - les sujets : SW, SH, CS, LETTRE, calque, TETE, TETE_NUIT, miroir, COIFFES,
     ECHARPE, CORPS (bas, hop, leves, serres, croises, tient), JAMBES, grille,
     sprite, halo, regardeVers, pose, dessineSujet (états, regard, reflet,
     dissolution, son envers, couché)
   - les foules : FOULE, DEMO (les sujets de démonstration : Kant, les
     variantes, Nietzsche, les vrais humains ; jamais le N°48), PREMIERS (les
     cent premiers participants : le test, le tirage, les résultats, le
     générique ; le N°48 est PREMIERS[47]), LOTS (b62, b40, b100, b0, b25, b75),
     ORDRE, MAUVAIS (8, dont le 47), N48, ABSTIENT, participant(p),
     placeParticipant(p), CONSTELLATION
   - les éléments du film : crochets (le N°48), carnet (+ CARNET_PAGE, CARNET_COIN)
   - la caméra : cadre(wx, wy, sx, sy, z), IDENTITE, CAM_CONSTELLATION,
     camera(T, cles)
   - prepare() : après le chargement des polices
   Ce que l'épisode ajoute (à la fin du fichier ; « D'abord » : simple et juste) :
   - repères : ZONE_UTILE (830), PHI_PLACES (nuit, test, foule, isoloir, filet,
     resultats : { x, y, taille })
   - petits outils : cheminPixel (les coins en escalier), filet (le filet laiton),
     coupeSujet (le sujet de deux couleurs : la décimale), tirets, rectTirets,
     flechePixel (la pointe en pixels), etiquette (« KANT », « SUJET N°48 · … »),
     mosaique (le flou de machine, P65)
   - le terminal de Phi : terminal(ctx, T, lignes, o) (lignes tapées, au rythme
     de la voix si l'on veut, ✓ ✗ en pixels, le curseur LABO, le défilement)
   - RÈGLES et la graine : REGLES, REGLES_FEN, hauteurRegles, fenetreRegles(ctx,
     T, regles, o), etiquetteA(ctx, x, y, a, lettre, o)
   - les descriptions : fenetreDescription(ctx, T, lettre, x, y, w, h, o) (le
     texte : DESCRIPTIONS.A / B de texte.js, qui les enregistre ici :
     textesDescriptions), COLONNES, GRILLE(cx, i)
   - le fil des réseaux : carte(ctx, T, c, x, y, w, o), FIL, CARTE_H,
     CARTE_GAP, FIL_COLONNES, CARTES_COLONNES, MOTS_FIL, colonnesFil(ctx, T, o)
   - la vague de proche en proche : vague(f, origine, t0, pas)
   - l'anneau des bleus : ANNEAU, ORDRE_ANNEAU, RANG_ANNEAU, ROUGES_ANNEAU,
     anneau(k, rot), pasAnneau(T, t0, periode, glisse), placeRouge(j),
     flechesAnneau(ctx, T, o)
   - Kant et Nietzsche : PORTRAITS, portrait(ctx, T, qui, cx, cy, cs, o)
   - les poses nouvelles : POSES_EP (tend, montre, dos, dosMains, cape)
   - les bulles : bulle(ctx, x, y, w, h, o) (parole, pensée), disquePixel
   - Alice : ALICE, pieceAlice(ctx, T, x, y, w, h, o)
   - le tirage : sautsTirage, tirage(T, t0, cibles, o), cadreTirage(ctx, T, etat, r, o)
   - les devinettes : compteARebours(ctx, T, t0, d, x, y, w, o), trotteuses(t0,
     d), devinette(ctx, T, o) (la boîte de question de Thibaut et son compte)
   - le carton : carton(ctx, T, o) (le teaser, le générique de fin) ; le carton
     de chapitre : chapitre(ctx, T, haut, bas, o) (la partie et la séquence du
     script en grand, si un lot en veut un ; le cartouche reste à film.js)
   - les vrais humains : vraisHumains(f, e, T), ombre(ctx, cx, cy, cs, phi, a)
   ========================================================================== */

// ================================================================ base
export const W = 1920, H = 1080;
export const CRAIE = '#f1e9dc', GRIS = '#8f877b', NUIT = '#0c0b0d', LABO = '#8fc0d6', LAITON = '#d7a548';
export const BLEU = '#4f86e8', BLEU_TXT = '#6f9cf0', ROUGE = '#d9483b', ROUGE_TXT = '#e2675b', GRIS_FIG = '#a39a8c';
export const FILET = '#3a363a';                   // le filet sous le titre des fenêtres
export const FOND_FENETRE = 'rgba(12,11,13,.92)';
// les teintes du centre du fond : le laboratoire, chaud (la mort), clair (la vie), la nuit du N°48
export const TEINTE_LABO = '#121a2a', TEINTE_CHAUDE = '#2b1a10', TEINTE_CLAIRE = '#18273f', TEINTE_NUIT = '#0e1320';
// Les polices du dépôt sont des sous-ensembles latins : un caractère qui leur manque, le navigateur le prend dans une
// police du système (lisse, et différente d'une machine à l'autre : la vidéo rendue sous Linux n'est plus la page vue
// sur une autre machine). φ, → et ■ manquent à IBM Plex Mono mais pas à DotGothic16 : elle le relaie dans MONO.
// ✓ ✗ ▶ ne sont dans aucune : signe() les dessine en pixels ; ∅ s'écrit Ø (dans les deux).
export const MONO = '"IBM Plex Mono", "DotGothic16", ui-monospace, monospace';
export const PIX = '"DotGothic16", "IBM Plex Mono", monospace';
export const G = '01·:+*#%xφ'.split('');
export const NB = '\u00a0';                       // l’espace insécable : « 65,5 % », « scalpel : » ne se coupent jamais

// une toile hors écran (le navigateur ; OffscreenCanvas ailleurs)
export function toile(w, h) {
  if (typeof document !== 'undefined') { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  return new OffscreenCanvas(w, h);
}

// ================================================================ le temps
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
export const dans = (t, a, b) => t >= a && t < b;
// monte de a à b, tient, redescend de c à d
export const cloche = (t, a, b, c, d) => seg(t, a, b) * (1 - seg(t, c, d));
export const eIO = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const eOut = k => 1 - Math.pow(1 - k, 3);
export const eIn = k => k * k * k;
export const eBack = k => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export const lisse = k => k * k * (3 - 2 * k);

// interpolation de nombres, de tableaux ou d'objets de nombres (le reste bascule à la fin)
export function interp(a, b, k) {
  if (typeof b === 'number') return lerp(typeof a === 'number' ? a : b, b, k);
  if (Array.isArray(b)) return b.map((v, i) => interp(a ? a[i] : undefined, v, k));
  if (b && typeof b === 'object') { const o = {}; for (const c in b) o[c] = interp(a ? a[c] : undefined, b[c], k); return o; }
  return k >= 1 || a === undefined ? b : a;
}
// images clés : [[t, v], [t, v, f], …] ; v atteinte à l'instant t ; f : l'easing du segment qui y mène (eIO par défaut)
export function cles(t, kf, f = eIO) {
  if (!kf.length) return undefined;
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    if (t <= kf[i][0]) {
      const [t0, v0] = kf[i - 1], [t1, v1, fi] = kf[i];
      return t1 === t0 ? v1 : interp(v0, v1, (fi || f)(clamp((t - t0) / (t1 - t0))));
    }
  }
  return kf[kf.length - 1][1];
}
// paliers : la dernière valeur dont l'instant est passé (la première avant)
export function marche(t, kf) { let v = kf[0][1]; for (const [a, b] of kf) if (t >= a) v = b; return v; }
// les valeurs V d'index.html, en pur : chaque ordre [t, v, d] part, à l'instant t, de la valeur qu'on a alors,
// et rejoint v en d secondes (eIO) ; un ordre peut en interrompre un autre
export function vers(T, ordres, depart) {
  let a = depart, b = depart, t0 = -Infinity, d = 0;
  for (const [t, v, dd = .8] of ordres) {
    if (t > T) break;
    a = interp(a, b, d > 0 ? eIO(seg(t, t0, t0 + d)) : 1); b = v; t0 = t; d = dd;
  }
  return interp(a, b, d > 0 ? eIO(seg(T, t0, t0 + d)) : 1);
}

// ================================================================ le hasard, les couleurs
export const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
// un nombre fixe dans [0, 1[ pour chaque entier (le premier tirage de rng(n)) : rejouable, sans rien allouer
export const hache = n => { let t = (n | 0) + 0x6D2B79F5 | 0; t = Math.imul(t ^ t >>> 15, 1 | t); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const mix = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
export const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };
// les surtitres (« DESCRIPTION », « HYPOTHÈSE ») : entre le gris et la craie (donnees.html)
export const SURTITRE = mix(GRIS, CRAIE, .5);

// ================================================================ le texte
export const fr = s => s.replace(/ ([:;?!%»])/g, NB + '$1').replace(/« /g, '«' + NB);
export const virgule = (v, d = 1) => v.toFixed(d).replace('.', ',');
export const pc = (v, d = 1) => virgule(v, d) + NB + '%';
export const nombre = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
// texte balisé : [b]…[/b] en bleu, [r]…[/r] en rouge ; \n = saut de ligne → [[{ s, c }, …], …]
export function balise(txt, base = CRAIE) {
  return txt.split('\n').map(l => {
    const segs = []; const re = /\[(b|r)\](.*?)\[\/\1\]/g; let m, last = 0;
    while ((m = re.exec(l))) { if (m.index > last) segs.push({ s: l.slice(last, m.index), c: base }); segs.push({ s: m[2], c: m[1] === 'b' ? BLEU_TXT : ROUGE_TXT }); last = re.lastIndex; }
    if (last < l.length) segs.push({ s: l.slice(last), c: base });
    return segs;
  });
}
export const sansBalise = txt => txt.replace(/\[\/?[br]\]/g, '');
export const longueur = lignes => lignes.reduce((a, l) => a + l.reduce((b, s) => b + [...s.s].length, 0), 0);
// écrit les n premiers caractères des lignes balisées, à partir de (x, y), interligne lh (police et alignement à gauche posés avant)
export function ecrit(ctx, lignes, x, y, lh, n = Infinity) {
  lignes.forEach((l, li) => {
    let cx = x; const cy = y + li * lh;
    for (const s of l) {
      if (n <= 0) break;
      const chars = [...s.s], vis = chars.slice(0, n).join(''); n -= chars.length;
      ctx.fillStyle = s.c; ctx.fillText(vis, cx, cy); cx += ctx.measureText(vis).width;
    }
  });
}
export const largeur = (ctx, lignes) => Math.max(0, ...lignes.map(l => ctx.measureText(l.map(s => s.s).join('')).width));
// coupe un texte simple aux espaces pour tenir dans w (police courante)
export function coupe(ctx, txt, w) {
  const mots = txt.split(' '), out = []; let l = '';
  for (const m of mots) { const e = l ? l + ' ' + m : m; if (ctx.measureText(e).width > w && l) { out.push(l); l = m; } else l = e; }
  if (l) out.push(l);
  return out;
}
// un texte balisé d'une ligne, coupé aux espaces pour tenir dans w ; les insécables ne coupent pas (donnees.html)
export function coupeBalise(ctx, txt, w, base = CRAIE) {
  const cars = []; for (const l of balise(txt, base)) for (const s of l) for (const ch of s.s) cars.push({ ch, c: s.c });
  const larg = (a, b) => ctx.measureText(cars.slice(a, b).map(o => o.ch).join('')).width;
  const bornes = []; let d = 0, esp = -1;
  for (let i = 0; i < cars.length; i++) {
    if (cars[i].ch === ' ') esp = i;
    if (larg(d, i + 1) > w && esp > d) { bornes.push([d, esp]); d = esp + 1; esp = -1; }
  }
  bornes.push([d, cars.length]);
  return bornes.map(([a, b]) => {
    const out = [];
    for (const o of cars.slice(a, b)) { const l = out[out.length - 1]; if (l && l.c === o.c) l.s += o.ch; else out.push({ s: o.ch, c: o.c }); }
    return out;
  });
}
// des lettres espacées de sp px (« B L E U E ») ; rend la largeur
export function espace(ctx, txt, x, y, sp, align = 'left') {
  const ws = [...txt].map(c => ctx.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let cx = align === 'center' ? x - tot / 2 : align === 'right' ? x - tot : x; ctx.textAlign = 'left';
  [...txt].forEach((c, i) => { ctx.fillText(c, cx, y); cx += ws[i] + sp; });
  return tot;
}
// ✓ ✗ ▶ ≈ en pixels (aucune police du dépôt ne les a) : une grille de 7 × 7 cases à la couleur et à l'alpha courants,
// d'environ les trois quarts de la taille de la police (px), centrée en (x, y). Des cases entières : net à toute taille.
export const SIGNES = Object.freeze({
  '✓': ['.......', '......#', '.....##', '#...##.', '##.##..', '.###...', '..#....'],
  '✗': ['#.....#', '##...##', '.##.##.', '..###..', '.##.##.', '##...##', '#.....#'],
  '▶': ['##.....', '####...', '######.', '#######', '######.', '####...', '##.....'],
  '≈': ['.......', '.##...#', '#..###.', '.......', '.##...#', '#..###.', '.......'],   // l'épisode : « ≈ 80 % »
});
const caseSigne = px => Math.max(1, Math.round(px * .75 / 7));
export function signe(ctx, ch, x, y, px) {
  const g = SIGNES[ch]; if (!g || !(px >= 1)) return;
  const c = caseSigne(px), x0 = Math.round(x - 3.5 * c), y0 = Math.round(y - 3.5 * c);
  g.forEach((l, j) => { for (let i = 0; i < 7; i++) if (l[i] === '#') ctx.fillRect(x0 + i * c, y0 + j * c, c, c); });
}
// fillText, avec ✓ ✗ ▶ dessinés par signe() : la police, l'alignement (left, center, right) et la ligne de base
// (middle, alphabetic) sont ceux du contexte
const morceauxSignes = txt => [...txt].reduce((a, ch) => { if (SIGNES[ch]) a.push({ signe: ch }, ''); else a[a.length - 1] += ch; return a; }, ['']);
const pxPolice = ctx => +((ctx.font.match(/(\d+(?:\.\d+)?)px/) || [0, 16])[1]);
// la largeur de ce que texteSignes dessine (les morceaux de texte, et 8 cases par signe) : measureText mesure ✓ ✗ ▶ ≈
// comme des caractères de police, plus étroits (le curseur du terminal tombait sur le ✗ de « → ✓ ou ✗ »)
export function largeurSignes(ctx, txt) {
  const c = caseSigne(pxPolice(ctx));
  return morceauxSignes(txt).reduce((a, m) => a + (typeof m === 'string' ? ctx.measureText(m).width : 8 * c), 0);
}
export function texteSignes(ctx, txt, x, y) {
  const morceaux = morceauxSignes(txt);
  const px = pxPolice(ctx), c = caseSigne(px);
  const larg = m => (typeof m === 'string' ? ctx.measureText(m).width : 8 * c);
  const tot = morceaux.reduce((a, m) => a + larg(m), 0), al = ctx.textAlign;
  let cx = al === 'center' ? x - tot / 2 : al === 'right' || al === 'end' ? x - tot : x;
  const ym = ctx.textBaseline === 'middle' ? y : ctx.textBaseline === 'top' ? y + px / 2 : y - px * .36;
  ctx.textAlign = 'left';
  for (const m of morceaux) {
    if (typeof m === 'string') { if (m) ctx.fillText(m, cx, y); }
    else signe(ctx, m.signe, cx + 4 * c, ym, px);
    cx += larg(m);
  }
  ctx.textAlign = al;
}
// la pastille : une petite pilule de la couleur de sens (fb : la part bleue, le reste rouge)
export function pastille(ctx, x, y, fb, w = 22, h = 10) {
  const x0 = x - w / 2, y0 = y - h / 2;
  ctx.save(); ctx.beginPath(); ctx.roundRect(x0, y0, w, h, h / 2); ctx.clip();
  ctx.fillStyle = ROUGE; ctx.fillRect(x0, y0, w, h);
  ctx.fillStyle = BLEU; ctx.fillRect(x0, y0, w * fb, h);
  ctx.restore();
}

// ================================================================ le décor
// le sol de points LABO, en perspective (index.html)
export const SOL = (() => {
  const out = [];
  for (let r = 0; r < 13; r++) {
    const k = r / 12, y = 640 + 440 * k * k, step = 26 + 110 * k * k;
    for (let x = 960 % step - step; x < W + step; x += step) out.push({ x, y, r: .9 + 2 * k, a: .06 + .3 * k });
  }
  return Object.freeze(out);
})();
// la poussière de caractères qui monte (index.html, donnees.html : la même graine)
export const POUSSIERE = (() => { const R = rng(41), out = []; for (let i = 0; i < 170; i++) out.push({ x: R() * W, y: R() * H, vx: (R() - .5) * 14, vy: -4 - R() * 10, a: .05 + R() * .14, g: G[Math.floor(R() * G.length)], c: R() < .5 ? LABO : CRAIE, sz: 10 + Math.round(R() * 8) }); return Object.freeze(out); })();
export function sol(ctx, a = 1) {
  if (a <= 0) return;
  ctx.fillStyle = LABO;
  for (const d of SOL) { ctx.globalAlpha = d.a * a; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill(); }
  ctx.globalAlpha = 1;
}
// vitesse : × la vitesse de la poussière (la nuit : 0,4) ; la position est vitesse · T, sans mémoire
export function poussiere(ctx, T, a = 1, vitesse = 1) {
  if (a <= 0) return;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const u = T * vitesse;
  for (const p of POUSSIERE) {
    const x = ((p.x + p.vx * u) % W + W) % W, y = ((p.y + p.vy * u) % H + H) % H;
    ctx.globalAlpha = p.a * a; ctx.fillStyle = p.c; ctx.font = `${p.sz}px ${MONO}`; ctx.fillText(p.g, x, y);
  }
  ctx.globalAlpha = 1;
}
// le fond (index.html) : un dégradé radial vers la nuit, le sol, la poussière.
//   o.chaud (0..1, la mort), o.clair (0..1, la vie), o.teinte (le centre, prioritaire : TEINTE_NUIT pour la nuit),
//   o.centre ([760, 470] le laboratoire ; [960, 470] donnees.html), o.sol (alpha du sol : 1 ; .45 avec une foule ;
//   0 sans), o.poussiere (alpha), o.vitesse (de la poussière)
// La nuit du N°48 (lots nuit, issue) : fond(ctx, T, FOND_NUIT).
export const FOND_NUIT = Object.freeze({ teinte: TEINTE_NUIT, sol: .3, vitesse: .4 });
export function fond(ctx, T, o = {}) {
  const { chaud = 0, clair = 0, teinte = null, centre = [760, 470], sol: aSol = 1, poussiere: aP = 1, vitesse = 1 } = o;
  let inner = teinte || mix(TEINTE_LABO, TEINTE_CHAUDE, chaud);
  if (!teinte && clair > .01) inner = mix(TEINTE_LABO, TEINTE_CLAIRE, clair);
  const g = ctx.createRadialGradient(centre[0], centre[1], 40, centre[0], centre[1], 1250);
  g.addColorStop(0, inner); g.addColorStop(.75, NUIT); g.addColorStop(1, NUIT);
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  sol(ctx, aSol);
  poussiere(ctx, T, aP, vitesse);
}
// le voile : la trame de lignes (une ligne noire sur trois) et le vignettage, par-dessus tout
const TRAMES = new WeakMap();
export function trame(ctx) {
  let p = TRAMES.get(ctx);
  if (!p) { const c = toile(1, 3), x = c.getContext('2d'); x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(0, 0, 1, 1); p = ctx.createPattern(c, 'repeat'); TRAMES.set(ctx, p); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = p; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
}
export function vignettage(ctx) {
  const v = ctx.createRadialGradient(960, 540, 520, 960, 540, 1180);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)');
  ctx.globalAlpha = 1; ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
export function voile(ctx) { trame(ctx); vignettage(ctx); }

// ================================================================ fenêtres façon jeu rétro
export function fenetre(ctx, x, y, w, h, a = 1, bord = CRAIE) {
  ctx.globalAlpha = a;
  ctx.fillStyle = FOND_FENETRE; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = LAITON; ctx.lineWidth = 3; ctx.strokeRect(x - 7.5, y - 7.5, w + 15, h + 15);
  ctx.strokeStyle = bord; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
}
// le cartouche en haut à gauche (index.html : fenetre(48, 40, 300, 84)) ; il s'élargit si ses mots dépassent
// (« PHILOSOPHIE EXPÉRIMENTALE » ne tient pas dans 300 px en DotGothic16 24 px)
export const CARTOUCHE = Object.freeze({ x: 48, y: 40, w: 300, h: 84 });
export function largeurCartouche(ctx, haut, bas) {
  ctx.font = `24px ${PIX}`;
  return Math.max(CARTOUCHE.w, Math.ceil(Math.max(ctx.measureText(haut).width, ctx.measureText(bas).width)) + 44);
}
export function cartouche(ctx, haut, bas, a = 1, o = {}) {
  if (a <= 0) return;
  const x = o.x ?? CARTOUCHE.x, y = o.y ?? CARTOUCHE.y, w = o.w ?? largeurCartouche(ctx, haut, bas);
  fenetre(ctx, x, y, w, CARTOUCHE.h, a);
  ctx.font = `24px ${PIX}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = LAITON; ctx.fillText(haut, x + 22, y + 34);
  ctx.fillStyle = CRAIE; ctx.fillText(bas, x + 22, y + 68);
  ctx.globalAlpha = 1;
}
// le tampon (index.html, et ses segments de couleur de donnees.html) : il tombe à l'instant t, de 1,5 à 1.
//   o : { t, txt | segs [{ s, c }], taille (64), c (couleur du texte et du bord), bord, x (650), y (540),
//         rot (−6°), fond (.8), a (1) }
export function tampon(ctx, T, o) {
  const { t, taille = 64, c = CRAIE, x = 650, y = 540, rot = -6, fond: af = .8 } = o;
  if (T < t) return;
  const a = seg(T, t, t + .3) * (o.a ?? 1), s = lerp(1.5, 1, eOut(seg(T, t, t + .35)));
  if (a <= 0) return;
  const segs = o.segs || [{ s: o.txt, c }];
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot * Math.PI / 180); ctx.scale(s, s);
  ctx.font = `${taille}px ${PIX}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const tw = segs.reduce((acc, sg) => acc + ctx.measureText(sg.s).width, 0), w = tw + (o.marge ?? (segs.length > 1 ? 70 : 90)), h = taille * 1.45;
  ctx.fillStyle = `rgba(12,11,13,${af})`; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = o.bord || c; ctx.lineWidth = 5; ctx.strokeRect(-w / 2, -h / 2, w, h);
  let cx = -tw / 2;
  for (const sg of segs) { ctx.fillStyle = sg.c; ctx.fillText(sg.s, cx, taille * .09); cx += ctx.measureText(sg.s).width; }
  ctx.restore();
}
// la jauge bleu/rouge et son seuil 50 %.
//   style 'demo' (index.html) : x 150, y 692, 1000 px ; « BLEUE 62 % » à gauche, « 38 % ROUGE » à droite, « 50 % » au-dessus.
//   style 'donnees' (donnees.html) : 460 px ; pastilles, valeurs à une décimale, « seuil 50 % » sur sa ligne, et le
//     pointillé du seuil jusqu'à o.pointille (un y), s'il est donné.
//   o : { x, y, w, h (14), bleue, rouge (0..100), a, style, valeurs (true : sinon « BLEUE », « ROUGE » seuls),
//         etiquette (« EXEMPLE » : à gauche, en gris), seuil (le texte ; null pour le taire) }
export function jauge(ctx, o) {
  const st = o.style || 'demo', D = st === 'donnees';
  const { x = 150, y = 692, w = D ? 460 : 1000, h = 14, bleue = 0, rouge = 0, a = 1, valeurs = true } = o;
  if (a <= .01) return;
  ctx.globalAlpha = a;
  ctx.fillStyle = '#1e1c20'; ctx.fillRect(x, y, w, h);
  const wb = w * bleue / 100, wr = w * rouge / 100;
  ctx.textBaseline = 'alphabetic';
  if (D) {
    ctx.fillStyle = BLEU; if (wb > 0) ctx.fillRect(x, y, Math.max(0, wb - (rouge > 0 ? 1 : 0)), h);
    ctx.fillStyle = ROUGE; if (wr > 0) ctx.fillRect(x + w - wr + (bleue > 0 ? 1 : 0), y, Math.max(0, wr - (bleue > 0 ? 1 : 0)), h);
    ctx.fillStyle = CRAIE; ctx.fillRect(x + w / 2 - 1.5, y - 30, 3, h + 40);
    if (o.pointille) {
      ctx.strokeStyle = rgba(CRAIE, .3); ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(x + w / 2, y + h + 12); ctx.lineTo(x + w / 2, o.pointille); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.font = `500 19px ${MONO}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'left';
    pastille(ctx, x + 11, y - 17, 1); ctx.fillText(valeurs ? `BLEUE ${pc(bleue)}` : 'BLEUE', x + 30, y - 11);
    ctx.textAlign = 'right';
    pastille(ctx, x + w - 11, y - 17, 0); ctx.fillText(valeurs ? `${pc(rouge)} ROUGE` : 'ROUGE', x + w - 30, y - 11);
    const s = o.seuil === undefined ? `seuil 50${NB}%` : o.seuil;
    if (s) { ctx.textAlign = 'center'; ctx.fillStyle = GRIS; ctx.font = `500 18px ${MONO}`; ctx.fillText(s, x + w / 2, y - 36); }
  } else {
    ctx.fillStyle = BLEU; ctx.fillRect(x, y, wb, h);
    ctx.fillStyle = ROUGE; ctx.fillRect(x + w - wr, y, wr, h);
    ctx.fillStyle = CRAIE; ctx.fillRect(x + w / 2 - 1.5, y - 12, 3, 38);
    ctx.font = `500 20px ${MONO}`;
    ctx.textAlign = 'left'; ctx.fillStyle = BLEU_TXT; ctx.fillText(valeurs ? `BLEUE ${Math.round(bleue)}${NB}%` : 'BLEUE', x, y - 12);
    ctx.textAlign = 'right'; ctx.fillStyle = ROUGE_TXT; ctx.fillText(valeurs ? `${Math.round(rouge)}${NB}% ROUGE` : 'ROUGE', x + w, y - 12);
    const s = o.seuil === undefined ? `50${NB}%` : o.seuil;
    if (s) { ctx.textAlign = 'center'; ctx.fillStyle = GRIS; ctx.fillText(s, x + w / 2, y - 20); }
  }
  if (o.etiquette) { ctx.font = `500 16px ${MONO}`; ctx.fillStyle = GRIS; espace(ctx, o.etiquette, x - 20, y + h - 1, 3, 'right'); }
  ctx.globalAlpha = 1;
}

// ================================================================ les pilules, en nuages de caractères (index.html)
const TAILLES = [10, 13, 16, 20, 24];
function nuage(seed, col) {
  const R = rng(seed), L = 190, RAY = 85, out = [];
  for (let i = 0; i < 380; i++) {
    const t = (R() * 2 - 1) * (L + RAY); let u = (R() * 2 - 1) * RAY;
    const over = Math.max(0, Math.abs(t) - L), lim = Math.sqrt(Math.max(0, RAY * RAY - over * over));
    if (Math.abs(u) > lim) u = Math.sign(u) * lim * R();
    const z = lim > 0 ? Math.sqrt(Math.max(0, 1 - (u / lim) ** 2)) : 0, front = R() < .55 ? 1 : .55;
    const shine = u < -RAY * .35 && Math.abs(t) < L * .6 && R() < .5;
    const ang = R() * Math.PI * 2;
    out.push({
      lx: t, ly: u, si: clamp(Math.round(z * front * 4), 0, 4), al: .22 + .78 * z * front, c: shine ? CRAIE : col,
      g: Math.floor(R() * G.length), fl: R() < .25 ? 1 + R() * 3 : 0, ph: R() * 6.283, w: 1 + R() * 2,
      sx: R() * W, sy: R() * H * .8, delay: R() * 1.3, sw: (R() - .5) * 260, bx: Math.cos(ang), by: Math.sin(ang), bd: 300 + R() * 700,
    });
  }
  return Object.freeze(out.sort((a, b) => a.si - b.si));
}
export const PILULES = Object.freeze([
  { nom: 'BLEUE', col: BLEU, txt: BLEU_TXT, ang: -22, pts: nuage(11, BLEU), ph: 0 },
  { nom: 'ROUGE', col: ROUGE, txt: ROUGE_TXT, ang: 22, pts: nuage(23, ROUGE), ph: 2 },
]);
// les poses d'index.html : [x, y, ps] de la bleue (0) et de la rouge (1)
export const POSES = Object.freeze({ icones: [[400, 196, .3], [900, 196, .3]], choix: [[380, 450, .8], [920, 450, .8]] });
// la pilule i (0 bleue, 1 rouge) à l'instant T. e : { x, y, ps (l'échelle), a (1), hl (0..1 : mise en avant),
//   t0 (les caractères arrivent des quatre coins à partir de t0 ; −Infinity : déjà formée), lab (le nom apparaît),
//   eclat (elle éclate en poussière : P.eclat d'index.html) }. Sous ps 0,5, des carrés au lieu des caractères.
export function pilule(ctx, T, i, e) {
  const P = PILULES[i], { x: px, y: py, a: A = 1, hl = 0, t0 = -Infinity, lab = Infinity, eclat = Infinity } = e;
  if (T < t0 || A <= .01) return;
  const ps = e.ps * (1 + .07 * hl);
  const ek = T >= eclat ? eOut(seg(T, eclat, eclat + 1.6)) : 0;
  if (ek >= 1) return;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const a = P.ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  const fl = Math.sin(T * 1.1 + P.ph) * 6 * ps;
  let cur = -1;
  for (const p of P.pts) {
    const k = eOut(clamp((T - t0 - p.delay) / 1.4, 0, 1));
    if (k <= 0) continue;
    const hx = px + ps * (p.lx * ca - p.ly * sa), hy = py + fl + ps * (p.lx * sa + p.ly * ca);
    const dx = hx - p.sx, dy = hy - p.sy, len = Math.hypot(dx, dy) || 1, sw = Math.sin(Math.PI * k) * p.sw;
    let x = p.sx + dx * k - dy / len * sw, y = p.sy + dy * k + dx / len * sw;
    if (ek > 0) { x += p.bx * p.bd * ek; y += p.by * p.bd * ek; }
    ctx.globalAlpha = Math.min(1, A * (1 - ek) * p.al * (.62 + .38 * Math.sin(T * p.w + p.ph)) * Math.min(1, k * 1.6) * (1 + .35 * hl));
    ctx.fillStyle = p.c;
    if (ps < .5) { const s = Math.max(1.6, TAILLES[p.si] * ps * .6); ctx.fillRect(x - s / 2, y - s / 2, s, s); }
    else {
      if (p.si !== cur) { cur = p.si; ctx.font = `${Math.round(TAILLES[cur] * ps)}px ${MONO}`; }
      ctx.fillText(G[(p.g + (p.fl ? Math.floor(T * p.fl) : 0)) % G.length], x, y);
    }
  }
  const la = seg(T, lab, lab + .8) * A * (1 - ek), grand = seg(ps, .6, .8), petit = 1 - seg(ps, .35, .55);
  ctx.fillStyle = P.txt;
  if (la * grand > 0) { ctx.globalAlpha = la * grand; ctx.font = `500 26px ${MONO}`; espace(ctx, P.nom, px, py + 200 * ps, 12, 'center'); }
  if (la * petit > 0) { ctx.globalAlpha = la * petit; ctx.font = `500 16px ${MONO}`; espace(ctx, P.nom, px, py + 70, 6, 'center'); }
  ctx.globalAlpha = 1;
}

// ================================================================ Phi : l'œil-diaphragme (index.html)
// L'humeur donne la forme de l'œil (r : l'ouverture, rot, glow : la lueur) ; son x/y n'est que la pose de la pupille
// quand Phi vous regarde (le doute de côté, la curiosité en haut, « bas » les yeux baissés) : elle s'efface dès
// qu'il regarde quelque chose (voir creeRegard).
export const HUMEURS = Object.freeze({
  neutre: Object.freeze({ x: 0, y: 0, r: 12.5, rot: 0, glow: .35 }),
  grand: Object.freeze({ x: 0, y: 0, r: 17, rot: 0, glow: 1 }),
  plisse: Object.freeze({ x: 0, y: 5, r: 6, rot: -4, glow: .2 }),
  doute: Object.freeze({ x: -3, y: 2, r: 10, rot: -6, glow: .35 }),
  curieux: Object.freeze({ x: 5, y: -5, r: 9.5, rot: 9, glow: .4 }),
  bas: Object.freeze({ x: 0, y: 6, r: 11, rot: 0, glow: .35 }),
  ferme: Object.freeze({ x: 0, y: 0, r: 0, rot: 0, glow: 0 }),       // l'œil éteint (avant l'accueil, la fin)
});
const humeurDe = h => (typeof h === 'string' ? HUMEURS[h] : h) || {};
// l'humeur à l'instant T. ordres : [[t, h, d = .5], …] dans l'ordre du temps ; h : un nom de HUMEURS (forme complète)
// ou un objet partiel ({ r: 4 }, { glow: .1 }) qui se pose sur l'humeur d'avant. Chaque changement part de l'état
// du moment et dure d (0,5 s, comme humeur() d'index.html). depart : l'humeur avant le premier ordre.
export function humeur(T, ordres, depart = 'neutre') {
  let cible = { ...HUMEURS.neutre, ...humeurDe(depart) };
  const debut = cible;
  const O = ordres.map(([t, h, d = .5]) => { cible = typeof h === 'string' ? { ...HUMEURS.neutre, ...humeurDe(h) } : { ...cible, ...h }; return [t, cible, d]; });
  return vers(T, O, debut);
}
// le clignement de repos (deux périodes premières entre elles), et un clin à l'instant t0 (Phi cligne deux fois : deux clins)
const unClin = d => (d < 0 ? 1 : d < .1 ? 1 - d / .1 : d < .26 ? (d - .1) / .16 : 1);
export function cligne(T) { return Math.min(unClin(((T % 5.3) + 5.3) % 5.3), unClin((((T + 2.1) % 7.9) + 7.9) % 7.9)); }
export const clin = (T, t0) => unClin(T - t0);
// les petits sauts de fixation : toutes les 0,3 à 1,5 s, moins d'une unité ; un saut, pas une dérive
export function microsaccade(T) {
  let n = Math.floor(T / .3);
  for (let j = 0; j < 4 && hache(n * 13 + 7) > .45; j++) n--;
  return [(hache(n * 31 + 1) - .5) * 1.5, (hache(n * 31 + 2) - .5) * 1.5];
}
// l'œil flotte doucement (4 px) : son centre vrai est (x, y + flotte(T))
export const flotte = (T, amp = 4) => Math.sin(T * .9) * amp;
// le dessin de l'œil : (cx, cy) son centre, size son diamètre (100 = l'unité de ses formes), s : { x, y, r, rot, glow, dx }
export function dessineOeil(ctx, cx, cy, size, s, alpha = 1) {
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
  // le diaphragme : six lames qui partent des sommets de l'ouverture et rejoignent l'anneau
  const a0 = -90 + (R0 - r) * 2.6, Vx = [], U = [];
  for (let k = 0; k < 6; k++) { const a = (a0 + 60 * k) * Math.PI / 180; U.push([Math.cos(a), Math.sin(a)]); Vx.push([ox + r * Math.cos(a), oy + r * Math.sin(a)]); }
  ctx.lineWidth = 2.1; ctx.globalAlpha = alpha * .9; ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const p = (k + 5) % 6; let dx = U[k][0] - U[p][0], dy = U[k][1] - U[p][1]; const L = Math.hypot(dx, dy); dx /= L; dy /= L;
    const [x0, y0] = Vx[k], bx = x0 - 50, by = y0 - 50, b = bx * dx + by * dy, c = bx * bx + by * by - RIN * RIN;
    const t = -b + Math.sqrt(Math.max(0, b * b - c));
    ctx.moveTo(Vx[p][0], Vx[p][1]); ctx.lineTo(x0 + dx * t, y0 + dy * t);
  }
  ctx.stroke(); ctx.globalAlpha = alpha;
  const pr = Math.min(4.2, r * .62);
  if (pr > .05) {
    ctx.fillStyle = LABO; ctx.beginPath(); ctx.arc(ox, oy, pr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(ox + pr * .33, oy - pr * .33, pr * .24, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// Phi à l'instant T. o : {
//   x, y, taille (le diamètre : 160 avec la foule, 220, 260 à l'accueil…), alpha (1),
//   humeur : un nom ou un état { x, y, r, rot, glow } (humeur(T, ordres) pour l'animer),
//   regard : un regard de creeRegard (il se calcule depuis le vrai centre de l'œil), ou { gx, gy, w } déjà calculé,
//            ou rien (il vous regarde, posé par l'humeur),
//   lueur (remplace glow), ouvert (0..1 : multiplie l'ouverture ; 0 l'œil fermé), cligne (true : le clignement de repos),
//   clins ([t…] : des clins voulus), secoue (l'instant d'une secousse : secoue() d'index.html), flotte (4 : px) }
// Rend { x, y } (le centre vrai, pour que les sujets le regardent) et regard ({ gx, gy, w, x, y, pose }).
// les essais de film.js : quand ESSAI_OEIL.saute, oeil() ne dessine rien et note sa place à l'écran (le centre, la
// taille, la toile, et le point qu'il regarde), pour voir ce que le plan dessine SOUS l'œil (window.film.sousOeil()) ;
// quand ESSAI_OEIL.note, il note sa place et se dessine (window.film.regardHors() : ce qu'il regarde est-il à l'écran ?)
export const ESSAI_OEIL = { saute: false, note: false, places: [] };
export function oeil(ctx, T, o) {
  const { x, taille = 160, alpha = 1, ouvert = 1, secoue = -99 } = o;
  const y = o.y + flotte(T, o.flotte ?? 4);
  const e = { ...HUMEURS.neutre, ...humeurDe(o.humeur || 'neutre') };
  if (o.lueur !== undefined) e.glow = o.lueur;
  let g = o.regard;
  if (g && g.pupille) g = g.pupille(T, x, y, e.r);
  g = g || { gx: 0, gy: 0, w: 1 };
  const [mx, my] = microsaccade(T), gx = g.gx + mx, gy = g.gy + my, a = -e.rot * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  e.x = e.x * g.w + gx * ca - gy * sa; e.y = e.y * g.w + gx * sa + gy * ca;
  let c = o.cligne === false ? 1 : cligne(T);
  for (const t0 of o.clins || []) c = Math.min(c, clin(T, t0));
  e.r *= c * ouvert;
  e.glow += .06 * Math.sin(T * 2.1);
  const k = T - secoue; e.dx = k >= 0 && k < .9 ? Math.sin(k * 22) * 3 * (1 - k / .9) : 0;
  if (ESSAI_OEIL.saute || ESSAI_OEIL.note) {
    const m = ctx.getTransform(), ec = (px, py) => [m.a * px + m.c * py + m.e, m.b * px + m.d * py + m.f];
    const [ox, oy] = ec(x, y), [cx, cy] = Number.isFinite(g.x) ? ec(g.x, g.y) : [ox, oy];
    if (alpha > .05 && ouvert > .05) ESSAI_OEIL.places.push({ ctx, x: ox, y: oy, taille: taille * Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)), cx, cy });
    if (ESSAI_OEIL.saute) return { x, y, regard: g };
  }
  dessineOeil(ctx, x, y, taille, e, alpha);
  return { x, y, regard: g };
}

// ---------------------------------------------------------------- Phi suit des yeux, en fonction du temps
// Thibaut : « j'ai pas intégré le fait que phi suive des yeux aussi ».
// La mécanique d'index.html (des saccades de 50 à 180 ms vers une cible, qui tient ; une cible qui bouge est
// rattrapée par une nouvelle saccade, jamais par un glissement), rendue pure : le temps est découpé en FIXATIONS.
//   - Une fixation commence à chaque borne d'une cible datée (son début, sa fin), à chaque « pause » pendant qu'une
//     cible datée est active (on rattrape ce qui bouge), et à chaque créneau de repos (0,4 à 2 s, bornes par hache).
//   - Ce qu'on regarde pendant une fixation est évalué à son début : la cible datée la plus récente qui a quelque
//     chose à montrer (sa fonction ne rend pas null), sinon un tirage pondéré parmi les candidats du repos.
//   - La pupille part du point visé à la fin de la fixation d'avant et y va en eOut, en .05 + .007 · l'écart.
// cibles : [{ t, d, cible, pause = .3 }] ou [[t, d, cible, pause]] ; cible : VOUS, point(x, y), ou une fonction
//   T → { x, y } | VOUS | null (null : rien à voir, on passe à la suivante). À début égal, la dernière écrite gagne.
// repos : [[poids, cible], …] (index.html : vous 3, la plume 3, la foule 3, les règles 1, les pilules .8…).
// Rend { pupille(T, ex, ey, r) → { gx, gy, w, x, y, pose }, cible(T), debut(T) } ; pose : { x, y, t } quand la
// pupille s'est posée sur un point (pas sur vous) : pour qu'un sujet regardé rende son regard (index.html).
export const VOUS = Object.freeze({ vous: true });
export const point = (x, y) => ({ x, y });
const resout = (c, T) => (typeof c === 'function' ? c(T) : c) || null;
// la pupille (unités de l'œil) pour regarder (x, y) depuis l'œil en (ex, ey) : un globe qui regarde une scène posée
// à ZR px devant lui ; A borne l'écart pour que l'ouverture reste dans l'anneau
export const ZR = 220;
export function decalage(x, y, ex, ey, A) {
  const dx = x - ex, dy = y - ey, m = Math.hypot(dx, dy);
  if (m < .001) return [0, 0, 0];
  const k = A / Math.sqrt(m * m + ZR * ZR);
  return [dx * k, dy * k, m];
}
export function creeRegard({ cibles = [], repos = [[1, VOUS]], periode = 1.15 } = {}) {
  const R = cibles.map(c => (Array.isArray(c) ? { t: c[0], d: c[1], cible: c[2], pause: c[3] } : { ...c }))
    .map(r => ({ ...r, pause: Math.max(.12, r.pause ?? .3) }))
    .sort((a, b) => a.t - b.t);
  const bornes = [...new Set(R.flatMap(r => [r.t, r.t + r.d]))].sort((a, b) => a - b);
  const derniereBorne = T => { let b = -Infinity; for (const x of bornes) { if (x <= T) b = x; else break; } return b; };
  function actif(T) {
    for (let i = R.length - 1; i >= 0; i--) { const r = R[i]; if (T >= r.t && T < r.t + r.d) { const c = resout(r.cible, T); if (c) return { r, c }; } }
    return null;
  }
  const P = periode, jit = n => (hache(n * 7 + 1) - .5) * .7 * P;
  function creneau(T) {
    const n0 = Math.floor(T / P);
    const n = T < n0 * P + jit(n0) ? n0 - 1 : T >= (n0 + 1) * P + jit(n0 + 1) ? n0 + 1 : n0;
    return { n, debut: n * P + jit(n) };
  }
  function auRepos(T, n) {
    const C = []; for (const [w, c] of repos) { const v = resout(c, T); if (v) C.push([w, v]); }
    if (!C.length) return VOUS;
    let v = hache(n * 131 + 17) * C.reduce((a, c) => a + c[0], 0);
    for (const c of C) { v -= c[0]; if (v < 0) return c[1]; }
    return C[0][1];
  }
  function debut(T) {
    const a = actif(T);
    const s = a ? a.r.t + Math.floor((T - a.r.t) / a.r.pause + 1e-9) * a.r.pause : creneau(T).debut;
    return Math.max(s, derniereBorne(T));
  }
  function vise(s) { const a = actif(s); return a ? a.c : auRepos(s, creneau(s).n); }
  function pointVise(T, ex, ey, A, prof) {
    const s = debut(T), c = vise(s), bx0 = c.vous ? ex : c.x, by0 = c.vous ? ey : c.y;
    if (prof <= 0) return { x: bx0, y: by0, s, D: 0, c };
    const P0 = pointVise(s - 1e-4, ex, ey, A, prof - 1);
    const [ax, ay] = decalage(P0.x, P0.y, ex, ey, A), [bx, by] = decalage(bx0, by0, ex, ey, A);
    const D = .05 + .007 * Math.hypot(bx - ax, by - ay), k = eOut(seg(T, s, s + D));
    return { x: lerp(P0.x, bx0, k), y: lerp(P0.y, by0, k), s, D, c };
  }
  function pupille(T, ex, ey, r = 12.5) {
    const A = Math.min(9, 23 - r);   // grand ouvert (r 17), l'œil a moins de place pour regarder de côté
    const p = pointVise(T, ex, ey, A, 3);
    const [gx, gy, m] = decalage(p.x, p.y, ex, ey, A);
    return { gx, gy, w: 1 - seg(m, 0, 140), x: p.x, y: p.y, pose: !p.c.vous && T >= p.s + p.D ? { x: p.x, y: p.y, t: p.s + p.D } : null };
  }
  return { pupille, cible: T => vise(debut(T)), debut };
}

// ================================================================ les sujets : une grille de 11×12 cases, décrite en lettres
// Une case = 4 px à la taille réelle : 44×48 px, du haut de la coiffe (cy − 24) aux pieds (cy + 24).
// . rien · B le corps (la couleur de sens) · O l'ombre · L la lumière · E l'œil, la bouche (la nuit) · G la goutte de
// sueur (la craie) · T l'écran du téléphone (LABO allumé, l'ombre éteint, LAITON quand il appuie)
// Sans peau, ni âge, ni genre (Thibaut : « sinon ça importe des intuitions »).
export const SW = 11, SH = 12, CS = 4;
export const LETTRE = Object.freeze({ B: 1, O: 2, L: 3, E: 4, G: 5, T: 6 });
export const calque = (y0, lignes) => { const out = []; lignes.forEach((l, j) => [...l].forEach((c, x) => { if (LETTRE[c]) out.push([x, y0 + j, LETTRE[c]]); })); return out; };
export const TETE = calque(1, [
  '...LLBBB...',
  '..LBBBBBO..',
  '..BBBBBBO..',
  '..BBBBBBO..',
  '...BBBBO...',
]);
// la tête éclairée D'EN BAS (le sujet nocturne : c'est le téléphone qui éclaire, pas Phi) : la lumière au menton
export const TETE_NUIT = calque(1, [
  '...OBBBO...',
  '..OBBBBBO..',
  '..BBBBBBB..',
  '..BBBBBBB..',
  '...LLLLL...',
]);
export const miroir = cal => cal.map(([x, y, c]) => [SW - 1 - x, y, c]);
// la lumière vient de Phi : la tête est dessinée en miroir quand Phi est à droite du sujet
const TETES = [TETE, miroir(TETE)];
// les coiffes : de l'ombre posée sur la tête, pour qu'on ne soit pas cent clones, sans toucher à la couleur de sens
export const COIFFES = Object.freeze([
  [],                                                                     // ras
  calque(0, ['.....O.....']),                                             // épi
  calque(1, ['...OOOOO...', '..O.....O..']),                              // calot
  calque(0, ['....OOO....', '...OOOOO...']),                              // chignon
  calque(1, ['...OOOOO...', '..O.....O..', '..O.....O..', '..O.....O..']), // longs
  calque(1, ['...OOOOO...', '..OOOOOOO..']),                              // frange (le N°48)
  calque(0, ['......OO...', '...OOOOO...', '..OO.......']),               // mèche
]);
export const NOMS_COIFFES = Object.freeze(['ras', 'épi', 'calot', 'chignon', 'longs', 'frange', 'mèche']);
export const ECHARPE = calque(6, ['...OOOOO...']);   // de l'ombre au cou : jamais de couleur hors sens
export const CORPS = Object.freeze({
  bas: calque(6, ['....OBO....', '...BBBBB...', '..O.BBB.O..', '..O.BBB.O..']),           // au repos, bras le long du corps
  hop: calque(6, ['....OBO....', '.OOBBBBBOO.', '....BBB....', '....BBB....']),           // le saut du choix
  leves: calque(3, ['O.........O', 'O.........O', '.O.......O.', '..O.OBO.O..', '...BBBBB...', '....BBB....', '....BBB....']),   // la vie
  serres: calque(6, ['....OBO....', '...OBBBO...', '...OBBBO...', '...OBBBO...']),        // la peur
  croises: calque(6, ['....OBO....', '...BBBBB...', '..OOOOOOO..', '....BBB....']),       // celui qui ne prend rien
  // le sujet nocturne : les avant-bras ramenés devant, le téléphone (T) dans les mains (SCENARIO, éléments partagés)
  tient: calque(6, ['....OBO....', '...BBBBB...', '..OBTTBO...', '...BTTB....']),
});
export const JAMBES = Object.freeze({
  droit: calque(10, ['....O.O....', '...OO.OO...']),
  saut: calque(10, ['...O...O...']),
  serre: calque(10, ['.....O.....', '....O.O....']),
});
// une image du sujet, case par case. p : { bras, jambes, yx, yy (le regard, −1..1), yeux ('o', 'f' fermés, 'g' grands),
//   bouche (0, 1 un « o », 2 le rire), goutte (0, 1..2), bob (la tête descend d'une case), acc (accroupi), coiffe,
//   detail (1 : l'écharpe), mir (1 : Phi est à droite), lum (1 : éclairé d'en bas), ecran (0, 1, 2), extra ([calques]) }
export function grille(p) {
  const g = new Uint8Array(SW * SH);
  const peint = (cal, dy) => { for (const [x, y, c] of cal) { const yy = y + dy; if (yy >= 0 && yy < SH) g[yy * SW + x] = c; } };
  peint(JAMBES[p.jambes], 0);
  peint(CORPS[p.bras], p.acc);
  if (p.detail) peint(ECHARPE, p.acc);
  const dt = p.acc + p.bob;
  peint(p.lum ? TETE_NUIT : TETES[p.mir], dt); peint(COIFFES[p.coiffe] || [], dt);
  const ey = 3 + dt + p.yy;
  for (const x of [4 + p.yx, 6 + p.yx]) {
    g[ey * SW + x] = p.yeux === 'f' ? 2 : 4;
    if (p.yeux === 'g') g[(ey - 1) * SW + x] = 4;
  }
  if (p.goutte) for (const y of [1, 2]) g[(y + p.acc + p.goutte) * SW + 9] = 5;
  // la bouche suit le regard : le visage entier se tourne
  if (p.bouche && p.yy < 1) for (let x = p.bouche === 2 ? 4 : 5; x <= (p.bouche === 2 ? 6 : 5); x++) g[(4 + dt) * SW + x + p.yx] = 4;
  if (p.extra) for (const cal of p.extra) peint(cal, 0);
  return g;
}
// ---------------------------------------------------------------- l'atlas : chaque image n'est peinte qu'une fois
// (une case = un pixel), puis drawImage l'agrandit sans lissage : cent sujets = cent drawImage par image, à toutes les
// échelles. Rangé en pages d'une rangée (170 images de 11×12 px) : une image nouvelle ne touche qu'une petite page.
const ECRANS = [null, LABO, LAITON];
const tons = (col, ecran) => { const O = mix(col, NUIT, .45); return [null, col, O, mix(col, CRAIE, .4), '#0c0b0d', CRAIE, ECRANS[ecran] || O]; };
const PAGES = [], CASES = new Map();
export function sprite(col, p) {
  const cle = [col, p.goutte, p.bras, p.jambes, p.yx, p.yy, p.yeux, p.bouche, p.bob, p.acc, p.coiffe, p.detail, p.mir, p.lum, p.ecran, p.extraCle || ''].join('|');
  let c = CASES.get(cle);
  if (!c) {
    if (CASES.size >= 170 * 157) { CASES.clear(); PAGES.length = 0; }   // atlas plein : on repart de zéro
    const n = CASES.size, sx = (n % 170) * (SW + 1), g = grille(p), Tn = tons(col, p.ecran);
    if (n % 170 === 0) PAGES.push(toile(170 * (SW + 1), SH));
    const im = PAGES[Math.floor(n / 170)], ax = im.getContext('2d');
    g.forEach((v, k) => { if (v) { ax.fillStyle = Tn[v]; ax.fillRect(sx + k % SW, Math.floor(k / SW), 1, 1); } });
    c = { im, sx, g, T: Tn };
    CASES.set(cle, c);
  }
  return c;
}
// les caractères de la dissolution, pré-rendus : (couleur, pas vers la craie, glyphe), dessinés à 36 px, posés à 12 px
const COULEURS = [GRIS_FIG, BLEU, ROUGE], GW = 40;
let GLY = null;
function glyphes() {
  if (GLY) return GLY;
  GLY = toile(GW * G.length * COULEURS.length, GW * 6);
  const g = GLY.getContext('2d'); g.font = `36px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  COULEURS.forEach((col, ci) => { for (let s = 0; s < 6; s++) { g.fillStyle = mix(col, CRAIE, s / 5); G.forEach((ch, gi) => g.fillText(ch, (ci * G.length + gi) * GW + GW / 2, s * GW + GW / 2)); } });
  return GLY;
}
const HALOS = new Map();
export function halo(col) {
  if (!HALOS.has(col)) {
    const c = toile(80, 80), g = c.getContext('2d');
    const r = g.createRadialGradient(40, 40, 0, 40, 40, 40); r.addColorStop(0, rgba(col, .45)); r.addColorStop(1, rgba(col, 0));
    g.fillStyle = r; g.fillRect(0, 0, 80, 80); HALOS.set(col, c);
  }
  return HALOS.get(col);
}

// ---------------------------------------------------------------- ce que fait le sujet à l'instant T
export function regardeVers(p, c, cx, cy) {
  const dx = c.x - cx, dy = c.y - cy;
  p.yx = Math.abs(dx) > 40 + Math.abs(dy) * .3 ? Math.sign(dx) : 0;
  p.yy = dy < -30 ? -1 : dy > 30 ? 1 : 0;
}
// e : l'état du sujet (tout est facultatif sauf col) : {
//   col (sa couleur : GRIS_FIG, BLEU, ROUGE… ; LAITON pour le fantôme), a (alpha),
//   mode : 'repos' | 'saut' (t0 : l'instant du saut) | 'vie' (k : l'intensité) | 'peur' (k) | 'rien' (bras croisés)
//          | 'prive' (il lorgne vers cible) | 'penaud' (il regarde ses pieds) | 'trace' (ce qui reste d'un parti :
//          debout, yeux fermés, immobile ; ouverts : true pour les ouvrir) | 'nuit' (le sujet nocturne : il tient son
//          téléphone, la tête éclairée d'en bas, il regarde l'écran ; ecran : 0 éteint, 1 allumé, 2 laiton)
//          | 'dort' (yeux fermés, la tête descend d'une case toutes les 4 s ; avec couche : ±1, couché),
//   phi ({ x, y } : l'œil de Phi dans le repère du sujet — sous une caméra, cam.monde(x, y) de l'œil, sans quoi le
//   regard est faux, comme dans l'isoloir d'index.html — : la lumière vient de son côté), cible ({ x, y } : ce qu'il
//   regarde quand il lève les yeux), fixe (il regarde la cible maintenant), reflet (true : une demi-case LABO dans
//   chaque œil, du côté de Phi ; { bas: true, couleurs: [gauche, droite] } : posé en bas des yeux, de ces couleurs —
//   le téléphone, la bleue et la rouge), dis (0..1 : la dissolution en caractères ; jouée de 1 à 0, c'est son envers :
//   les caractères redescendent, de la craie à la couleur, et recomposent le sujet), halo (0..1 : une lueur posée),
//   couche (±1 : l'image tournée d'un quart de tour), yeux (force 'o', 'f', 'g'), p ({ … } : force des champs de la
//   pose), extra ([calques] : des cases en plus, avec extraCle pour l'atlas) }
export function pose(f, e, T, cx, cy) {
  const phi = e.phi || { x: cx, y: cy - 400 };
  const p = { bras: 'bas', jambes: 'droit', yx: 0, yy: 0, yeux: 'o', bouche: 0, goutte: 0, bob: 0, acc: 0, coiffe: f.coiffe ?? 0, detail: f.detail ?? 0, mir: phi.x > cx ? 1 : 0, lum: 0, ecran: 0 };
  let dx = 0, dy = 0;
  const m = e.mode || 'repos', r1 = f.r1 ?? .5, r2 = f.r2 ?? .5, r3 = f.r3 ?? .5, fi = f.i ?? 0;
  const fin = () => {
    if (e.dis > 0) { p.yeux = 'f'; p.bouche = 0; p.goutte = 0; }
    if (e.yeux) p.yeux = e.yeux;
    if (e.extra) { p.extra = e.extra; p.extraCle = e.extraCle || 'x'; }
    if (e.p) Object.assign(p, e.p);
    return { p, dx, dy };
  };
  if (m === 'trace') { p.yeux = e.ouverts ? 'o' : 'f'; return fin(); }
  if (m === 'dort') { p.yeux = 'f'; p.bob = ((T + r1 * 4) % 4) < 1.8 ? 1 : 0; p.ecran = e.ecran ?? 0; return fin(); }
  // le repos : une case de respiration, un clignement, un regard qui se promène, et parfois les yeux levés vers Phi
  const pr = 2.6 + r1 * 1.4; p.bob = (T / pr + r2) % 1 < .42 ? 1 : 0;
  const pb = 2.8 + r2 * 3.4; if ((T + r3 * pb) % pb < .13) p.yeux = 'f';
  const pl = 1.1 + r3 * 1.5, n = Math.floor((T + r1 * 17) / pl), h = hache(fi * 7919 + n * 104729);
  let vers = !!e.fixe;
  if (m === 'nuit') {          // il regarde son écran ; parfois ses yeux glissent de côté
    p.bras = 'tient'; p.lum = 1; p.ecran = e.ecran ?? 1;
    if (!vers) { p.yy = 1; if (h < .1) p.yx = -1; else if (h < .2) p.yx = 1; }
  } else if (!vers) { if (h < .16) p.yx = -1; else if (h < .32) p.yx = 1; else if (h < .38) p.yy = 1; else if (h < .5) vers = true; }
  if (vers && e.cible) regardeVers(p, e.cible, cx, cy);
  const k = T - (e.t0 ?? -99), I = e.k ?? 1;
  if (m === 'saut') {          // le choix : on s'accroupit, on saute, la couleur change en l'air, on retombe
    if (k >= -.16 && k < -.04) { p.acc = 1; p.bob = 0; }
    else if (k >= -.04 && k < .3) {
      const u = (k + .04) / .34; dy = -2.4 * Math.sin(Math.PI * u);
      p.bras = 'hop'; p.jambes = u > .15 && u < .85 ? 'saut' : 'droit'; p.bob = 0; p.yx = 0; p.yy = -1;
    }
    else if (k >= .3 && k < .42) { p.acc = 1; p.bob = 0; }
  } else if (m === 'vie') {    // la lueur de vie : bras au ciel, bouche ouverte, petits bonds
    p.bras = 'leves'; p.bouche = 2; p.yy = -1; p.yx = 0; p.bob = 0;
    const u = (T * 1.9 + r1) % 1; dy = -1.6 * Math.abs(Math.sin(Math.PI * u)) * I;
    if (u < .08 || u > .92) p.acc = 1; else if (dy < -.8) p.jambes = 'saut';
  } else if (m === 'peur') {   // raide, accroupi, grands yeux qui cherchent, une goutte de sueur, ça tremble
    const gt = (T * .9 + r3) % 1; p.goutte = gt < .4 ? 1 : gt < .75 ? 2 : 0;
    p.bras = 'serres'; p.jambes = 'serre'; p.yeux = p.yeux === 'f' ? 'f' : 'g'; p.bouche = 1; p.bob = 0; p.acc = 1; p.yy = 0;
    p.yx = Math.floor(T * 2.7 + r2 * 5) % 2 ? -1 : 1;
    if (e.fixe && e.cible) regardeVers(p, e.cible, cx, cy);   // il regarde Phi, dans sa peur (P17)
    dx = (Math.floor(T * 26 + r1 * 9) % 2 ? .25 : -.25) * I;
  } else if (m === 'rien') {   // celui qui ne prend rien : bras croisés, le nez en l'air, il regarde ailleurs
    p.bras = 'croises'; p.yy = -1; p.yx = Math.floor(T / 1.7 + r1 * 2) % 2 ? 1 : -1;
  } else if (m === 'prive') {  // en choix privé : on lorgne vers la cible, sans rien savoir
    if (e.cible) regardeVers(p, e.cible, cx, cy);
  } else if (m === 'penaud') { // il s'est trompé au test : il regarde ses pieds
    p.yx = 0; p.yy = 1;
  }
  return fin();
}
// le sujet f ({ i, r1, r2, r3, coiffe, detail }), centré en (cx, cy), avec des cases de cs px (4 à ×1 ; 4 · z sous
// une caméra qui ne transforme pas le contexte). Net à toutes les échelles (drawImage sans lissage). Coût : un drawImage
// par sujet ; pendant la dissolution, un drawImage par case. Rend imageSmoothingEnabled tel qu'il l'a trouvé.
export function dessineSujet(ctx, f, cx, cy, cs, e, T) {
  const a = e.a ?? 1; if (a <= .001) return;
  const col = e.col || GRIS_FIG;
  const { p, dx, dy } = pose(f, e, T, cx, cy);
  const s = sprite(col, p), lisse0 = ctx.imageSmoothingEnabled;
  if (e.couche) {              // couché : l'image tournée d'un quart de tour, qui tombe juste sur la grille
    ctx.save(); ctx.globalAlpha = a; ctx.translate(Math.round(cx), Math.round(cy)); ctx.rotate(e.couche * Math.PI / 2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(s.im, s.sx, 0, SW, SH, Math.round(-SW * cs / 2), Math.round(-SH * cs / 2), SW * cs, SH * cs);
    ctx.restore();
    return;
  }
  const ox = Math.round(cx - SW * cs / 2 + dx * cs), oy = Math.round(cy - SH * cs / 2 + dy * cs);
  const lueur = e.mode === 'vie' ? (e.k ?? 1) * (.6 + .4 * Math.sin(T * 5 + cx * .01)) : (e.halo || 0);
  if (lueur > 0 && !(e.dis > 0)) {
    const r = 40 * cs / CS;
    ctx.globalAlpha = a * lueur;
    ctx.drawImage(halo(col), cx - r, cy - r + dy * cs, 2 * r, 2 * r);
  }
  if (!(e.dis > 0)) {
    ctx.globalAlpha = a; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(s.im, s.sx, 0, SW, SH, ox, oy, SW * cs, SH * cs);
    ctx.imageSmoothingEnabled = lisse0;
    // le reflet : de Phi (une demi-case LABO dans chaque œil ouvert, du côté de Phi), ou du téléphone (en bas des yeux)
    if (e.reflet && p.yeux !== 'f') {
      const R = typeof e.reflet === 'object' ? e.reflet : {}, bas = R.bas ?? e.mode === 'nuit', cols = R.couleurs || [LABO, LABO];
      const eyB = 3 + p.acc + p.bob + p.yy, phi = e.phi || { x: cx, y: cy - 400 };
      [4 + p.yx, 6 + p.yx].forEach((x, j) => {
        ctx.fillStyle = cols[j];
        if (bas) ctx.fillRect(ox + (x + .25) * cs, oy + (eyB + .5) * cs, cs / 2, cs / 2);
        else ctx.fillRect(ox + (x + (phi.x >= cx ? .5 : 0)) * cs, oy + (eyB - (p.yeux === 'g' ? 1 : 0)) * cs, cs / 2, cs / 2);
      });
    }
    return;
  }
  // la mort : les cases s'envolent en caractères, en partant des pieds, et virent à la craie ; dis de 1 à 0, l'envers
  if (e.dis >= 1) return;
  const GL = glyphes(), ci = Math.max(0, COULEURS.indexOf(col)), gs = 12 * cs / CS;
  ctx.imageSmoothingEnabled = true;
  for (let k = 0; k < s.g.length; k++) {
    const v = s.g[k]; if (!v) continue;
    const x = k % SW, y = (k - x) / SW, d = (SH - 1 - y) / (SH - 1) * .45;
    const q = clamp((e.dis * 2 - d) / 1.4, 0, 1); if (q >= 1) continue;
    const hz = hache((f.i ?? 0) * 997 + k * 31), ph = hz * 6.283, vit = .6 + hache(k * 131 + (f.i ?? 0)) * .8;
    const px = ox + x * cs + Math.sin(q * 5 + ph) * 14 * q * cs / CS, py = oy + y * cs - Math.pow(q, 1.4) * 170 * vit * cs / CS;
    ctx.globalAlpha = a * (1 - q) * .95;
    if (q > .15) { const gi = Math.floor(hz * 1000) % G.length; ctx.drawImage(GL, (ci * G.length + gi) * GW, Math.round(q * 5) * GW, GW, GW, px + cs / 2 - gs * .55, py + cs / 2 - gs * .55, gs * 1.1, gs * 1.1); }
    else { ctx.fillStyle = s.T[v]; ctx.fillRect(px, py, cs, cs); }
  }
  ctx.imageSmoothingEnabled = lisse0;
}

// ================================================================ les foules (données fixes)
// La foule d'index.html : cent places (cx = 175 + (i mod 20)·50, cy = 360 + ⌊i/20⌋·62) et leurs tirages r1, r2, r3.
// Les tirages de rng(99) sont rejoués dans l'ordre d'index.html (les 37 cases de chaque sujet en consomment trois
// chacune) : LOTS, ORDRE et MAUVAIS sont ceux du morceau.
const RF = rng(99);
const melange = n => { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(RF() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const FOULE = Object.freeze([...Array(100).keys()].map(i => {
  const f = { i, cx: 175 + (i % 20) * 50, cy: 360 + Math.floor(i / 20) * 62, r1: RF(), r2: RF(), r3: RF() };
  for (let k = 0; k < 37 * 3; k++) RF();
  return Object.freeze(f);
}));
const ensemble = n => Object.freeze(new Set(melange(100).slice(0, n)));
export const LOTS = Object.freeze({ b62: ensemble(62), b40: ensemble(40), b100: ensemble(100), b0: ensemble(0), b25: ensemble(25), b75: ensemble(75) });
export const ORDRE = Object.freeze(melange(100));          // l'ordre des sauts (la vague du choix)
const ordreMauvais = melange(100);
export const N48 = 47;          // le N°48 : le participant d'indice 47 (frange, sans écharpe)
export const ABSTIENT = 52;     // celui qui ne prend rien (démonstration)
// les cent premiers participants qui se trompent au test : 8 (8,3 %, donnees.js), dont le N°48
export const MAUVAIS = Object.freeze(new Set([...ordreMauvais.filter(i => i !== N48).slice(0, 7), N48]));
const coiffeDe = n => Math.floor(hache(n * 7 + 3) * COIFFES.length), echarpeDe = n => (hache(n * 17 + 11) < .2 ? 1 : 0);
// les sujets de démonstration (P03, P08, P09) : pas des participants ; autres coiffes, pour qu'on n'y voie jamais le N°48.
// hache((47 + 100)·7 + 3) tombe sur la frange : à la place du N°48, le sujet de démonstration (bleu dans b40, il meurt en
// P08) aurait sa coiffe ; il prend la mèche.
export const DEMO = Object.freeze(FOULE.map(f => {
  const c = coiffeDe(f.i + 100);
  return Object.freeze({ ...f, coiffe: f.i === 47 && c === 5 ? 6 : c, detail: echarpeDe(f.i + 100) });
}));
// les cent premiers participants (P11–P13) : les coiffes d'index.html ; le N°48 est PREMIERS[47]
export const PREMIERS = Object.freeze(FOULE.map(f => Object.freeze({ ...f, coiffe: coiffeDe(f.i), detail: echarpeDe(f.i) })));
// la place du participant p dans le champ de la constellation (P13) : la tuile ⌊p/100⌋ est la grille d'index.html
// décalée de ((k mod 7)·1050, ⌊k/7⌋·340) ; la place j = p mod 100 y est (175 + (j mod 20)·50, 360 + ⌊j/20⌋·62).
// 4 457 participants : 45 tuiles, sept par rangée (le champ garde la proportion de l'écran qu'il occupait à 21 685)
export const TUILES_RANG = 7;
export function placeParticipant(p) {
  const k = Math.floor(p / 100), j = p % 100;
  return { x: 175 + (j % 20) * 50 + (k % TUILES_RANG) * 1050, y: 360 + Math.floor(j / 20) * 62 + Math.floor(k / TUILES_RANG) * 340 };
}
// le participant p (0 à 4 456) : les cent premiers sont PREMIERS ; les autres ont leurs tirages par hache
export function participant(p) {
  if (p < 100) return PREMIERS[p];
  const { x, y } = placeParticipant(p);
  return { i: p, cx: x, cy: y, r1: hache(p * 3 + 101), r2: hache(p * 5 + 202), r3: hache(p * 11 + 303), coiffe: coiffeDe(p), detail: echarpeDe(p) };
}
// la constellation entière (fin de P13, début de P14) : écran = (monde − (150, 329)) · 0,245 + (62, 230) ; le champ
// (7 300 × 2 350 dans le monde) tient dans le même cadre de l'écran qu'avant, de (62, 230) à (1 850, 806)
export const CONSTELLATION = Object.freeze({ wx: 150, wy: 329, sx: 62, sy: 230, z: .245 });
// (la caméra correspondante, cadre(…) étant défini plus bas : CAM_CONSTELLATION, à la fin du fichier)

// ================================================================ les éléments partagés
// ---------------------------------------------------------------- les crochets du N°48
// Quatre coins laiton (3 px, branches de 10 px à ×1), à 6 px du sujet, et « N°48 » au-dessus (DotGothic16 26 px à ×6,
// proportionnel ailleurs, jamais sous 12 px). Ils suivent la caméra mais gardent au moins 14 px de côté.
// (cx, cy) : le centre du sujet À L'ÉCRAN ; z : l'échelle du sujet (×1 : 44×48 px). o : { a, k (0..1 : ils se
// referment autour de lui ; 1 refermés), label ('N°48' ; '' pour le taire), couleur (LAITON), labelA (alpha du nom) }
export function crochets(ctx, cx, cy, z = 1, o = {}) {
  const { a = 1, k = 1, label = 'N°48', couleur = LAITON } = o;
  if (a <= .001) return;
  const ouvert = (1 - eOut(clamp(k))) * 40 * Math.max(1, z * .6);
  const hw = Math.max(7, 28 * z) + ouvert, hh = Math.max(7, 30 * z) + ouvert;
  const lw = clamp(3 * Math.sqrt(z), 2, 7), b = Math.min(Math.max(4, 10 * z), hw, hh);
  ctx.save();
  ctx.globalAlpha = a * Math.min(1, .3 + clamp(k));
  ctx.strokeStyle = couleur; ctx.lineWidth = lw; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  ctx.beginPath();
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = cx + sx * hw, y = cy + sy * hh;
    ctx.moveTo(x - sx * b, y); ctx.lineTo(x, y); ctx.lineTo(x, y - sy * b);
  }
  ctx.stroke();
  if (label) {
    const taille = Math.max(12, 26 * z / 6);
    ctx.globalAlpha = a * (o.labelA ?? 1) * clamp(k);
    ctx.font = `${Math.round(taille)}px ${PIX}`; ctx.fillStyle = couleur; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(label, cx, cy - hh - Math.max(4, taille * .35));
  }
  ctx.restore();
}

// ---------------------------------------------------------------- le carnet de Phi
// Une fenêtre façon jeu rétro. Page entière : 980 × 520 en (470, 150) ; rangé dans le coin : x 1290, y 40, largeur
// 570 (la place de RÈGLES), qui ne montre que l'en-tête et la dernière note. Le passage de l'un à l'autre (k de 0 à 1,
// à animer en 0,6 s, eIO) interpole la position et la taille. Écriture : 70 caractères par seconde, avec le voile LABO
// d'ajouteRegle ; la plume est un curseur LABO. Rien n'est jamais rayé : une machine ne rature pas, elle ajoute.
// o : {
//   textes : CARNET de texte.js ({ titre, protocole, hypothese, commeMoi, ajoutHypothese, ajoutProtocole }),
//   notes : [{ n: '0001', txt, t }] (NOTES de texte.js, dans l'ordre), k (0 le coin, 1 la page), a (alpha),
//   hypothese, commeMoi, ajoutHypothese, ajoutProtocole : l'état de chaque élément de la page —
//     absent (ou false) : pas encore là ; true : déjà écrit ; un nombre t : écrit à partir de t à 70 car./s ;
//     { t, cps } : écrit à partir de t à cps (l'ajout lent de P20).
//   Une note : n.t absent ou true → déjà écrite ; un nombre → écrite à partir de n.t ; n.cps facultatif. }
// Rend { plume: { x, y } | null (où la plume écrit, à l'écran : pour que l'œil la suive), rect: { x, y, w, h } }.
export const CARNET_PAGE = Object.freeze({ x: 470, y: 150, w: 980, h: 520 });
export const CARNET_COIN = Object.freeze({ x: 1290, y: 40, w: 570 });
export const CPS_CARNET = 70;
const etat = (T, el, n) => {
  if (el == null || el === false) return { n: 0, t: null };
  if (el === true) return { n, t: -Infinity };
  const t = typeof el === 'number' ? el : el.t ?? -Infinity, cps = (typeof el === 'object' && el.cps) || CPS_CARNET;
  return { n: clamp(Math.floor((T - t) * cps), 0, n), t, fin: t + n / cps };
};
// les lignes d'une note dans le coin : « 0003 · » puis le texte, coupé pour tenir ; la suite s'aligne après « 0003 · »
function lignesNote(ctx, d) {
  ctx.font = `20px ${MONO}`;
  const pre = `${d.n} · `, wp = ctx.measureText(pre).width;
  return coupe(ctx, d.txt, CARNET_COIN.w - 48 - wp).map((l, i) => ({ txt: i ? l : pre + l, x: i ? 24 + wp : 24 }));
}
export function hauteurCarnetCoin(ctx, notes) {
  const d = notes[notes.length - 1];
  return 90 + ((d ? lignesNote(ctx, d).length : 1) - 1) * 28 + 24;
}
export function carnet(ctx, T, o) {
  const { textes: X, notes = [], k = 1, a = 1 } = o;
  if (a <= .001) return { plume: null, rect: null };
  const P = CARNET_PAGE, C = { ...CARNET_COIN, h: hauteurCarnetCoin(ctx, notes) };
  const R = { x: lerp(C.x, P.x, k), y: lerp(C.y, P.y, k), w: lerp(C.w, P.w, k), h: lerp(C.h, P.h, k) };
  let plume = null, plumeT = -Infinity;
  ctx.save();
  fenetre(ctx, R.x, R.y, R.w, R.h, a);
  ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  // une ligne écrite à la plume : le voile LABO (1,4 s), les caractères, le curseur ; garde la plume la plus récente
  const ligne = (txt, x, y, font, col, el, s, ox, oy, veilW) => {
    const chars = [...txt], E = etat(T, el, chars.length);
    if (E.n <= 0) return;
    ctx.font = font;
    const fl = E.t === -Infinity ? 0 : 1 - seg(T, E.t, E.t + 1.4);
    if (fl > 0) { ctx.fillStyle = rgba(LABO, .14 * fl); ctx.fillRect(x - 12, y - 26, veilW, 34); }
    const vis = chars.slice(0, E.n).join('');
    ctx.fillStyle = col; ctx.fillText(vis, x, y);
    if (E.t !== -Infinity && T < E.fin + .45 && E.t >= plumeT) {
      const wv = ctx.measureText(vis).width, m = ctx.measureText('M').width, px = parseFloat(font.match(/(\d+)px/)[1]);
      if (T < E.fin || Math.floor(T * 4) % 2 === 0) { ctx.fillStyle = LABO; ctx.fillRect(x + wv + 2, y - px * .78, m * .55, px * .9); }
      plumeT = E.t; plume = { x: ox + (x + wv + 4) * s, y: oy + (y - px * .35) * s };
    }
  };
  // le coin : l'en-tête et la dernière note
  const aC = a * (1 - seg(k, .1, .6));
  if (aC > 0) {
    const s = R.w / C.w;
    ctx.save(); ctx.translate(R.x, R.y); ctx.scale(s, s); ctx.globalAlpha = aC;
    ctx.font = `24px ${PIX}`; ctx.fillStyle = LABO; ctx.fillText(X.titre, 24, 40);
    ctx.fillStyle = FILET; ctx.fillRect(24, 54, C.w - 48, 2);
    const d = notes[notes.length - 1];
    if (d) {
      let avant = 0;
      lignesNote(ctx, d).forEach((l, i) => {
        const el = d.t == null || d.t === true ? true : { t: d.t + avant / (d.cps || CPS_CARNET), cps: d.cps };
        ligne(l.txt, l.x, 90 + i * 28, `20px ${MONO}`, GRIS, el, s, R.x, R.y, C.w - l.x);
        avant += [...l.txt].length + 1;
      });
    }
    ctx.restore();
  }
  // la page entière
  const aP = a * seg(k, .4, .9);
  if (aP > 0) {
    const s = R.w / P.w;
    ctx.save(); ctx.translate(R.x, R.y); ctx.scale(s, s); ctx.globalAlpha = aP;
    ctx.font = `30px ${PIX}`; ctx.fillStyle = LABO; ctx.fillText(X.titre, 28, 50);
    ctx.font = `18px ${MONO}`; ctx.fillStyle = GRIS; ctx.fillText(X.protocole, 28, 84);
    const wp = ctx.measureText(X.protocole + ' ').width;
    ligne(X.ajoutProtocole, 28 + wp, 84, `18px ${MONO}`, LABO, o.ajoutProtocole, s, R.x, R.y, 200);
    ctx.fillStyle = FILET; ctx.fillRect(28, 100, P.w - 56, 2);
    ctx.font = `500 16px ${MONO}`; ctx.fillStyle = SURTITRE; espace(ctx, 'HYPOTHÈSE', 28, 140, 3);
    ligne(X.hypothese, 28, 186, `30px ${MONO}`, CRAIE, o.hypothese, s, R.x, R.y, P.w - 32);
    // l'ajout s'écrit sous l'hypothèse ; « (comme moi) » descend d'une ligne juste avant (rien n'est rayé)
    const ta = o.ajoutHypothese == null || o.ajoutHypothese === false ? null : o.ajoutHypothese === true ? -Infinity : (typeof o.ajoutHypothese === 'number' ? o.ajoutHypothese : o.ajoutHypothese.t);
    const desc = ta === null ? 0 : eIO(seg(T, ta - .6, ta - .1));
    ligne(X.commeMoi, 28, 226 + 42 * desc, `22px ${MONO}`, GRIS, o.commeMoi, s, R.x, R.y, 220);
    ligne(X.ajoutHypothese, 28, 228, `30px ${MONO}`, LABO, o.ajoutHypothese, s, R.x, R.y, P.w - 32);
    if (notes.length) {
      ctx.globalAlpha = aP; ctx.font = `500 16px ${MONO}`; ctx.fillStyle = SURTITRE; espace(ctx, 'NOTES', 28, 318, 3);
      notes.forEach((d, i) => ligne(`${d.n} · ${d.txt}`, 28, 354 + i * 32, `20px ${MONO}`, GRIS, d.t == null ? true : d.cps ? { t: d.t, cps: d.cps } : d.t, s, R.x, R.y, P.w - 32));
    }
    ctx.restore();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  return { plume, rect: R };
}

// ================================================================ la caméra
// « ×z » est l'agrandissement par rapport à la composition d'index.html (×1 = la scène du morceau). « Le point (wx, wy)
// en (sx, sy) à ×z » : écran = (monde − w) · z + s. Exemple : l'isoloir met le N°48 (525, 484) en (650, 470) à ×4,2 :
// cadre(525, 484, 650, 470, 4.2).
export function cadre(wx, wy, sx, sy, z = 1) {
  const ox = sx - wx * z, oy = sy - wy * z;
  return Object.freeze({
    wx, wy, sx, sy, z, ox, oy,
    applique(ctx) { ctx.transform(z, 0, 0, z, ox, oy); },             // dans ctx.save() … ctx.restore()
    ecran(x, y) { return { x: x * z + ox, y: y * z + oy }; },
    monde(x, y) { return { x: (x - ox) / z, y: (y - oy) / z }; },
  });
}
export const IDENTITE = cadre(0, 0, 0, 0, 1);
export const CAM_CONSTELLATION = cadre(CONSTELLATION.wx, CONSTELLATION.wy, CONSTELLATION.sx, CONSTELLATION.sy, CONSTELLATION.z);
// une caméra qui suit des images clés [[t, wx, wy, sx, sy, z], …] (temps absolus) : en douceur (f = eIO), le zoom en
// échelle logarithmique (un mouvement régulier pour l'œil, comme camera(t) de film-boucle)
export function camera(T, kf, f = eIO) {
  if (!kf || !kf.length) return IDENTITE;
  let i = 0;
  while (i < kf.length - 1 && T > kf[i + 1][0]) i++;
  const A = kf[i], B = kf[Math.min(i + 1, kf.length - 1)];
  const k = B[0] === A[0] || T <= A[0] ? (T >= B[0] ? 1 : 0) : f(clamp((T - A[0]) / (B[0] - A[0])));
  return cadre(lerp(A[1], B[1], k), lerp(A[2], B[2], k), lerp(A[3], B[3], k), lerp(A[4], B[4], k), Math.exp(lerp(Math.log(A[5]), Math.log(B[5]), k)));
}

// ================================================================ après le chargement des polices
// les glyphes de la dissolution sont dessinés avec la police : on les refait une fois les polices là
export function prepare() { GLY = null; }

/* ==========================================================================
   L'ÉPISODE — ce que plusieurs lots dessinent pareil (EPISODE.md, « Le socle »,
   ce qu'il appelle partage.js). Les raccords en dépendent : le fil des réseaux
   (P04–P07, P65, P78), la fenêtre RÈGLES et son étiquette « A » (P10–P18, P39,
   P80), les fenêtres de description et la mise en page des colonnes (P39–P43,
   P51, P71, P74, P80–P81), l'anneau des bleus (P31 → P32, P37–P38), le
   terminal de Phi, les devinettes et leur compte à rebours, Kant et Nietzsche,
   les poses nouvelles, la pièce d'Alice, le tirage, les vrais humains.
   « D'abord des images simples et justes » (la colonne « D'abord » de « Ce
   qui est nouveau ») : on peaufinera ensuite, ici, pour tous les lots à la fois.
   ========================================================================== */

// ================================================================ repères
export const ZONE_UTILE = 830;    // rien d'important sous y = 830 : la boîte XPHI (x 80–1840, y 862–1040)
// les places de Phi qui reviennent (EPISODE.md, « La grammaire ») : { x, y, taille }
export const PHI_PLACES = Object.freeze({
  nuit: Object.freeze({ x: 960, y: 420, taille: 300 }),        // l'œil seul, dans la nuit (P01, P82)
  test: Object.freeze({ x: 650, y: 240, taille: 220 }),        // index.html, avant la foule (P09–P10)
  foule: Object.freeze({ x: 650, y: 160, taille: 160 }),       // index.html, au-dessus de la foule
  isoloir: Object.freeze({ x: 1110, y: 300, taille: 150 }),    // l'isoloir du N°48 (P12)
  filet: Object.freeze({ x: 960, y: 90, taille: 90 }),         // au sommet du filet, l'écran partagé
  resultats: Object.freeze({ x: 1790, y: 120, taille: 120 }),  // sur les écrans de Thibaut
});

// ================================================================ petits outils de dessin
// un rectangle aux coins arrondis en escalier (des cases de c px) : film-pilules/plans/nuit.js (cheminPixel), recopié.
// Pose le chemin (beginPath … closePath) ; à remplir ou tracer ensuite.
export function cheminPixel(ctx, x, y, w, h, r, c = 4) {
  const n = Math.max(1, Math.round(r / c)), ins = [];
  for (let j = 0; j < n; j++) { const dy = r - (j + .5) * c; ins.push(Math.round((r - Math.sqrt(Math.max(0, r * r - dy * dy))) / c) * c); }
  ctx.beginPath(); ctx.moveTo(x + ins[0], y);
  for (let j = 0; j < n; j++) { ctx.lineTo(x + w - ins[j], y + j * c); ctx.lineTo(x + w - ins[j], y + (j + 1) * c); }
  for (let j = n - 1; j >= 0; j--) { ctx.lineTo(x + w - ins[j], y + h - (j + 1) * c); ctx.lineTo(x + w - ins[j], y + h - j * c); }
  for (let j = 0; j < n; j++) { ctx.lineTo(x + ins[j], y + h - j * c); ctx.lineTo(x + ins[j], y + h - (j + 1) * c); }
  for (let j = n - 1; j >= 0; j--) { ctx.lineTo(x + ins[j], y + (j + 1) * c); ctx.lineTo(x + ins[j], y + j * c); }
  ctx.closePath();
}
// le filet laiton (film-pilules/plans/europe-salles.js, filet) : 2 px, vertical en x, de y0 à y1
export function filet(ctx, x, y0, y1, a = 1) {
  if (a <= .001 || y1 <= y0) return;
  ctx.globalAlpha = a; ctx.fillStyle = LAITON; ctx.fillRect(Math.round(x) - 1, y0, 2, y1 - y0);
  ctx.globalAlpha = 1;
}
// le sujet de deux couleurs (europe-salles.js, coupeSujet) : une découpe sur la largeur du corps (colonnes 2 à 8), à la
// part bleue fb ; gauche : ce qui est à gauche de la coupe (le bleu), sinon la droite. À appeler entre save et restore,
// puis dessineSujet deux fois (BLEU découpé à gauche, ROUGE à droite) : 65,5 % = 65 bleus et un sujet moitié bleu.
export function coupeSujet(ctx, cx, fb, gauche, cs = CS) {
  const xs = Math.round(cx - SW * cs / 2 + (2 + 7 * fb) * cs);
  ctx.beginPath(); if (gauche) ctx.rect(cx - 60 * cs / CS, -1e4, xs - (cx - 60 * cs / CS), 2e4); else ctx.rect(xs, -1e4, cx + 60 * cs / CS - xs, 2e4); ctx.clip();
}
// des tirets (resultats-pilules : tirets) ; un rectangle en tirets
export function tirets(ctx, x0, y0, x1, y1, col = GRIS, a = 1, lw = 2, motif = [10, 8]) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(motif);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
}
export function rectTirets(ctx, x, y, w, h, col = GRIS, a = 1, lw = 2, motif = [10, 8]) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(motif);
  ctx.strokeRect(x, y, w, h); ctx.restore();
}
// une flèche, la pointe en pixels (des cases de c px en escalier) ; o : { col (CRAIE), lw (2), a (1), c (4 : la case de
// la pointe), k (1 : la part tracée, de l'origine vers la pointe ; la pointe paraît au bout), retrait (0 : px ôtés aux
// deux bouts) }. Rend la pointe { x, y }.
export function flechePixel(ctx, x0, y0, x1, y1, o = {}) {
  const { col = CRAIE, lw = 2, a = 1, c = 4, k = 1, retrait = 0 } = o;
  let L = Math.hypot(x1 - x0, y1 - y0); if (L < 1 || a <= 0 || k <= 0) return null;
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L;
  x0 += ux * retrait; y0 += uy * retrait; x1 -= ux * retrait; y1 -= uy * retrait; L = Math.max(0, L - 2 * retrait);
  const xe = x0 + ux * L * clamp(k), ye = y0 + uy * L * clamp(k);
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xe - ux * c, ye - uy * c); ctx.stroke();
  // la pointe : trois rangées de cases, de 1, 3 puis 5 cases, perpendiculaires à la flèche
  const nx = -uy, ny = ux;
  for (let r = 0; r < 3; r++) for (let j = -r; j <= r; j++) {
    const px = xe - ux * c * (r + .5) + nx * c * j, py = ye - uy * c * (r + .5) + ny * c * j;
    ctx.fillRect(Math.round(px - c / 2), Math.round(py - c / 2), c, c);
  }
  ctx.restore();
  return { x: xe, y: ye };
}
// une étiquette d'isoloir (film-pilules/plans/isoloir.js, etiquette : « SUJET N°48 · CHOIX PRIVÉ », « KANT ») : un
// cadre de 2 px, DotGothic16 24 px ; centrée en x, son haut en y
export function etiquette(ctx, txt, x, y, a = 1, col = LABO) {
  if (a <= 0) return;
  ctx.globalAlpha = a; ctx.font = `24px ${PIX}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const lw = ctx.measureText(txt).width + 36;
  ctx.fillStyle = 'rgba(12,11,13,.92)'; ctx.fillRect(x - lw / 2, y, lw, 40);
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(x - lw / 2, y, lw, 40);
  ctx.fillStyle = col; ctx.fillText(txt, x, y + 28);
  ctx.globalAlpha = 1;
}
// le flou de machine (P65) : dessin(c) est dessiné dans une petite toile k fois plus petite, puis posé agrandi sans
// lissage, en (x, y, w, h). Jamais getImageData. La petite toile est une mémoire de calcul (une par taille).
const MOSAIQUES = new Map();
export function mosaique(ctx, x, y, w, h, k, dessin) {
  const pw = Math.max(1, Math.ceil(w / k)), ph = Math.max(1, Math.ceil(h / k)), cle = `${pw}x${ph}`;
  let c = MOSAIQUES.get(cle); if (!c) { c = toile(pw, ph); MOSAIQUES.set(cle, c); }
  const g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, pw, ph);
  g.setTransform(pw / w, 0, 0, ph / h, -x * pw / w, -y * ph / h);
  dessin(g);
  const l0 = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, 0, 0, pw, ph, x, y, w, h);
  ctx.imageSmoothingEnabled = l0;
}

// ================================================================ le terminal de Phi
// Des lignes tapées (index.html : TERM, 24 car./s), dans une fenêtre façon jeu rétro, IBM Plex Mono, le curseur bloc
// LABO. Une ligne : { t0, txt, col (CRAIE ; LABO pour ce que Phi ajoute), cps (24), n (facultatif : T → le nombre de
// caractères visibles, pour taper au rythme de la voix : lettres('K02', T) de texte.js) }. ✓ ✗ ≈ ▶ sont dessinés en
// pixels (texteSignes). Une ligne trop longue est coupée aux espaces ; quand le terminal est plein, les lignes remontent
// d'un cran, comme un vrai terminal (on voit les dernières). Une ligne pas encore commencée n'existe pas.
//   o : { x, y, w, h, taille (26), lh (taille × 1,45), marge (24), fenetre (true : le cadre ; false : le texte seul),
//         titre (null ; « TERMINAL »… en DotGothic16 22 px LABO), a (1), curseur (true : il clignote au bout de la
//         dernière ligne) }
// Rend { plume: { x, y } | null (le bout de la ligne qui s'écrit : l'œil peut la suivre), rect, rangs: [{ x, y, ligne }] }.
export function terminal(ctx, T, lignes, o = {}) {
  const { x, y, w, h, taille = 26, marge = 24, a = 1, curseur = true } = o, lh = o.lh ?? Math.round(taille * 1.45);
  if (a <= .001) return { plume: null, rect: { x, y, w, h }, rangs: [] };
  ctx.save();
  if (o.fenetre !== false) fenetre(ctx, x, y, w, h, a);
  ctx.globalAlpha = a;
  let haut = y + marge;
  if (o.titre) {
    ctx.font = `22px ${PIX}`; ctx.fillStyle = LABO; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(o.titre, x + marge, y + 34); ctx.fillStyle = FILET; ctx.fillRect(x + marge, y + 46, w - 2 * marge, 2);
    haut = y + 60;
  }
  ctx.beginPath(); ctx.rect(x, haut - 4, w, y + h - haut); ctx.clip();
  ctx.font = `${taille}px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  // les rangées : chaque ligne commencée, coupée pour tenir ; n caractères visibles sur toute la ligne
  const rangs = [];
  let derniere = null;
  for (const L of lignes) {
    const chars = [...(L.txt ?? '')];
    const n = L.n ? clamp(Math.floor(L.n(T)), 0, chars.length) : (T < L.t0 ? -1 : clamp(Math.floor((T - L.t0) * (L.cps ?? 24)), 0, chars.length));
    if (n < 0 || (L.n && n === 0 && !(T >= (L.t0 ?? Infinity)))) continue;
    const morceaux = chars.length ? coupe(ctx, L.txt, w - 2 * marge) : [''];
    let i0 = 0;
    for (const m of morceaux) {
      const lm = [...m].length;
      rangs.push({ txt: m, n: clamp(n - i0, 0, lm), col: L.col || CRAIE, ligne: L, fini: n >= chars.length });
      i0 += lm + 1;
    }
    derniere = { L, n, total: chars.length };
  }
  const place = Math.max(1, Math.floor((y + h - haut - marge * .5) / lh));
  const vus = rangs.slice(Math.max(0, rangs.length - place));
  let plume = null;
  vus.forEach((r, j) => {
    const yy = haut + taille + j * lh;
    r.x = x + marge; r.y = yy;
    if (r.n > 0) { ctx.fillStyle = r.col; texteSignes(ctx, [...r.txt].slice(0, r.n).join(''), x + marge, yy); }
    if (!plume && !r.fini && r.n < [...r.txt].length) {
      const wv = largeurSignes(ctx, [...r.txt].slice(0, r.n).join(''));
      plume = { x: x + marge + wv, y: yy - taille * .35, rang: r };
    }
  });
  // le curseur : au bout de ce qui s'écrit ; sinon, il clignote au bout de la dernière rangée
  if (curseur && vus.length) {
    const r = plume ? plume.rang : vus[vus.length - 1], vis = [...r.txt].slice(0, r.n).join('');
    const cx = r.x + largeurSignes(ctx, vis) + 3, m = ctx.measureText('M').width;
    if (plume || Math.floor(T * 2) % 2 === 0) { ctx.fillStyle = LABO; ctx.fillRect(cx, r.y - taille * .78, m * .6, taille * .92); }
  }
  ctx.restore(); ctx.globalAlpha = 1;
  return { plume: plume && { x: plume.x, y: plume.y }, rect: { x, y, w, h }, rangs: vus.map(r => ({ x: r.x, y: r.y, ligne: r.ligne })), derniere };
}

// ================================================================ la fenêtre RÈGLES (index.html) et la graine « A »
// Les cinq règles d'index.html, balisées ; ∅ s'écrit Ø (aucune police du dépôt n'a ∅)
export const REGLES = Object.freeze([
  ['Chacun avale une pilule.'],
  ['Choix simultanés et privés :', 'personne ne connaît celui des autres.'],
  ['[b]■[/b] plus de 50 % de [b]bleues[/b]', '  → tout le monde vit'],
  ['[r]■[/r] au moins 50 % de [r]rouges[/r]', '  → ceux qui ont la [b]bleue[/b] meurent'],
  ['Ø une seule personne sans pilule', '  → tout le monde meurt'],
].map(r => Object.freeze(balise(fr(r.join('\n'))))));
export const REGLES_FEN = Object.freeze({ x: 1290, y: 40, w: 570, lh: 31, gap: 16, cps: 70 });
export const hauteurRegles = n => (n === 0 ? 0 : 74 + REGLES.slice(0, n).reduce((s, r) => s + r.length * REGLES_FEN.lh, 0) + (n - 1) * REGLES_FEN.gap + 18);
// L'étiquette (EPISODE.md, P10 : « la graine ») : 22 × 22 px, filet GRIS, la lettre en IBM Plex Mono 500 14 px, GRIS,
// α 0,4 (presque invisible dans le test ; lisible à l'aveu). (x, y) : son coin haut gauche ; o : { taille (22), col
// (GRIS), fond (true) }. Elle n'existe que dans l'épisode, jamais dans le test jouable.
export function etiquetteA(ctx, x, y, a = .4, lettre = 'A', o = {}) {
  if (a <= .001) return;
  const s = o.taille ?? 22, col = o.col ?? GRIS;
  ctx.save(); ctx.globalAlpha = clamp(a);
  if (o.fond !== false) { ctx.fillStyle = 'rgba(12,11,13,.9)'; ctx.fillRect(x, y, s, s); }
  ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, s / 22); ctx.strokeRect(x + .5, y + .5, s - 1, s - 1);
  ctx.font = `500 ${Math.round(s * 14 / 22)}px ${MONO}`; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(lettre, x + s / 2, y + s / 2 + 1);
  ctx.restore();
}
// La fenêtre RÈGLES à l'instant T, comme index.html (regles(T)) : le titre LABO, ses règles qui s'écrivent à 70 car./s
// sous un voile LABO (1,4 s), sa hauteur qui suit (0,4 s).
//   regles : un nombre (les n premières, déjà écrites) ou [{ i, t }] (la règle i s'écrit à partir de t ; t = -Infinity :
//            déjà écrite), dans l'ordre où elles s'ajoutent
//   o : { a (1), pulse (l'instant d'une pulsation : st.pulse d'index.html, le cadre vire au LABO), x, y, w (ailleurs
//         que (1290, 40, 570)), etiquette ({ a (.4), lettre ('A'), col } ; false : sans étiquette) }
// Rend { rect, plume (où s'écrit la règle en cours, ou null), etiquette ({ x, y } : le centre de la petite étiquette),
//        regle(i) → { x, y } (le début de la règle i, si elle est là) }.
export function fenetreRegles(ctx, T, regles, o = {}) {
  const F = REGLES_FEN, x = o.x ?? F.x, y = o.y ?? F.y, w = o.w ?? F.w, a = o.a ?? 1;
  const liste = typeof regles === 'number' ? [...Array(regles).keys()].map(i => ({ i, t: -Infinity })) : regles;
  let h = 0;
  liste.forEach((r, k) => { h = lerp(h, hauteurRegles(k + 1), r.t === -Infinity ? 1 : eIO(seg(T, r.t - .4, r.t))); });
  h = Math.max(64, h);
  const out = { rect: { x, y, w, h }, plume: null, etiquette: { x: x + w - 25, y: y + 25 }, regle: () => null };
  if (a <= .001) return out;
  const pu = o.pulse != null ? seg(T, o.pulse, o.pulse + .3) * (1 - seg(T, o.pulse + 1.6, o.pulse + 2.4)) : 0;
  fenetre(ctx, x, y, w, h, a, pu > 0 ? mix(CRAIE, LABO, pu) : CRAIE);
  ctx.globalAlpha = a; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = `24px ${PIX}`; ctx.fillStyle = LABO; ctx.fillText('RÈGLES', x + 24, y + 40);
  ctx.fillStyle = FILET; ctx.fillRect(x + 24, y + 54, w - 48, 2);
  if (o.etiquette !== false) {
    const E = o.etiquette || {};
    etiquetteA(ctx, x + w - 36, y + 14, (E.a ?? .4) * a, E.lettre ?? 'A', { col: E.col });
  }
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  let yy = y + 92;
  const places = new Map();
  ctx.font = `21px ${MONO}`;
  for (const r of liste) {
    if (T < r.t) continue;
    const lignes = REGLES[r.i], n = r.t === -Infinity ? Infinity : Math.floor((T - r.t) * F.cps), tot = longueur(lignes);
    places.set(r.i, { x: x + 24, y: yy });
    if (n > 0) {
      const fl = (r.t === -Infinity ? 0 : 1 - seg(T, r.t, r.t + 1.4)) + pu * .8;
      ctx.globalAlpha = a;
      if (fl > 0) { ctx.fillStyle = rgba(LABO, .14 * Math.min(1, fl)); ctx.fillRect(x + 12, yy - 24, w - 24, lignes.length * F.lh + 8); }
      ecrit(ctx, lignes, x + 24, yy, F.lh, n);
      if (n < tot) {
        let m = n, li = 0; while (li < lignes.length - 1 && m > longueur([lignes[li]])) { m -= longueur([lignes[li]]); li++; }
        out.plume = { x: x + 24 + m * 12.6, y: yy + li * F.lh - 8 };
      }
    }
    yy += lignes.length * F.lh + F.gap;
  }
  ctx.restore(); ctx.globalAlpha = 1;
  out.regle = i => places.get(i) || null;
  return out;
}

// ================================================================ les deux descriptions, et la mise en page des colonnes
// La mise en page du tirage (P39–P43), qui revient en P71 : le filet laiton en x 960 (y 40–800) ; deux fenêtres de
// description (x 80–860 et 1 060–1 840, y 60–300) ; dessous, deux grilles de 10 × 10 sujets (celle des écrans 08 et 12
// de Thibaut : GRILLE(cx, i)), cx 540 et 1 380, cs 3 ; l'œil au sommet du filet.
export const GRILLE = (cx, i) => [cx - 189 + (i % 10) * 42, 350 + Math.floor(i / 10) * 46];
export const COLONNES = Object.freeze({
  filet: Object.freeze({ x: 960, y0: 40, y1: 800 }),
  fenetres: Object.freeze([Object.freeze({ x: 80, y: 60, w: 780, h: 240 }), Object.freeze({ x: 1060, y: 60, w: 780, h: 240 })]),
  grilles: Object.freeze([540, 1380]),
  cs: 3,
  oeil: PHI_PLACES.filet,
});
// Les textes des deux descriptions : ceux de texte.js (DESCRIPTIONS, le script de Thibaut), qui les enregistre ici en
// se chargeant (ce fichier ne peut pas importer texte.js, qui l'importe). Rien d'autre ne les change.
const TEXTES_DESCRIPTIONS = {};
export function textesDescriptions(d) { Object.assign(TEXTES_DESCRIPTIONS, d); }
// La fenêtre d'une description (EPISODE.md, « Le socle ») : le titre « DESCRIPTION A » (DotGothic16 26 px, LABO), le
// filet, le texte du script (IBM Plex Mono 19 px, CRAIE, balisé : la bleue en bleu, la rouge en rouge), coupé pour
// tenir dans la fenêtre.
//   lettre : 'A' ou 'B' ; (x, y, w, h) : la fenêtre
//   o : { a (1), n (les caractères écrits : tous ; lettres('R04', T) de texte.js pour l'écrire au rythme de la voix, en
//         retirant le « « » du début), plume (true : le curseur LABO au bout de ce qui s'écrit), texte (un autre texte
//         balisé que celui du script), titre (le titre en entier, s'il change : « RÈGLES » qui devient « DESCRIPTION
//         A »), titreA (alpha du titre), bord (CRAIE), taille (19), lh (28) }
// Rend { rect, plume ({ x, y } | null), lignes ([{ x, y, segs }] : la place de chaque ligne, pour souligner, découper) }.
export function fenetreDescription(ctx, T, lettre, x, y, w, h, o = {}) {
  const texte = o.texte ?? TEXTES_DESCRIPTIONS[lettre] ?? '';
  const a = o.a ?? 1, taille = o.taille ?? 19, lh = o.lh ?? 28;
  const out = { rect: { x, y, w, h }, plume: null, lignes: [] };
  if (a <= .001) return out;
  fenetre(ctx, x, y, w, h, a, o.bord ?? CRAIE);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha = a * (o.titreA ?? 1); ctx.font = `26px ${PIX}`; ctx.fillStyle = LABO;
  ctx.fillText(o.titre ?? `DESCRIPTION ${lettre}`, x + 24, y + 40);
  ctx.globalAlpha = a; ctx.fillStyle = FILET; ctx.fillRect(x + 24, y + 54, w - 48, 2);
  ctx.font = `${taille}px ${MONO}`;
  const lignes = coupeBalise(ctx, texte, w - 48), n = o.n ?? Infinity, tot = longueur(lignes);
  ecrit(ctx, lignes, x + 24, y + 92, lh, n);
  lignes.forEach((l, i) => out.lignes.push({ x: x + 24, y: y + 92 + i * lh, segs: l }));
  if (o.plume && n < tot) {
    let m = Math.max(0, n), li = 0; while (li < lignes.length - 1 && m >= longueur([lignes[li]])) { m -= longueur([lignes[li]]); li++; }
    const vis = lignes[li].map(s => s.s).join('').slice(0, m), px = x + 24 + ctx.measureText(vis).width, py = y + 92 + li * lh;
    ctx.fillStyle = LABO; ctx.fillRect(px + 2, py - taille * .8, taille * .55, taille * .95);
    out.plume = { x: px, y: py - taille * .35 };
  }
  ctx.globalAlpha = 1;
  return out;
}

// ================================================================ le fil des réseaux (P04–P07, P65, P78)
// Des publications ABSTRAITES dans la DA : une carte au coin en escalier, un avatar qui est un bonhomme du film (sa
// couleur dit son camp), des barres grises à la place du texte ; une seule ligne lisible, et seulement les mots du
// script. Aucun logo, aucun nom d'utilisateur, aucun compteur, aucune date. Messages inventés : la mention le dit.
// Une carte : { i (sa graine), camp ('bleu', 'rouge', 'gris'), barres (2 ou 3), dilemme (la carte du dilemme : deux
// mini-pilules), retrait (une réponse : décalée de 40 px) }.
const CAMPS = { bleu: BLEU, rouge: ROUGE, gris: GRIS_FIG };
export const CARTE_H = 120, CARTE_GAP = 16;
// l'avatar : le bonhomme du film, cadré tête et épaules dans un carré de 64 px (sujet de démonstration, jamais le N°48)
function avatar(ctx, T, c, x, y, s = 64) {
  ctx.fillStyle = '#1d1b20'; ctx.fillRect(x, y, s, s);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, s, s); ctx.clip();
  const f = DEMO[(c.i * 37 + 11) % 100], cs = Math.round(s / 10.6);
  dessineSujet(ctx, f, x + s / 2, y + 4 + SH * cs / 2, cs, { col: CAMPS[c.camp] || GRIS_FIG, mode: 'repos', p: { bob: 0 } }, T);
  ctx.restore();
}
// une carte en (x, y), de largeur w. o : { a (1), mot (le texte lisible, ou null), motA (son alpha), etiquette ('A',
// 'B' ou null : la petite étiquette en haut à droite), etiquetteA (son alpha), h (CARTE_H), flou (0 : nette ; k > 1 :
// la mosaïque de P65, des carrés de k px) }
export function carte(ctx, T, c, x, y, w, o = {}) {
  const a = o.a ?? 1, h = o.h ?? CARTE_H; if (a <= .001) return;
  if (o.flou > 1) { mosaique(ctx, x - 4, y - 4, w + 8, h + 8, o.flou, g => carte(g, T, c, x, y, w, { ...o, flou: 0 })); return; }
  const xr = x + (c.retrait ? 40 : 0), wr = w - (c.retrait ? 40 : 0);
  ctx.save(); ctx.globalAlpha = a;
  cheminPixel(ctx, xr, y, wr, h, 12, 4);
  ctx.fillStyle = '#121015'; ctx.fill();
  ctx.strokeStyle = rgba(CRAIE, .55); ctx.lineWidth = 2; ctx.stroke();
  avatar(ctx, T, c, xr + 16, y + 16);
  // l'en-tête : deux barres (pas de nom)
  ctx.fillStyle = mix(GRIS, NUIT, .1); ctx.fillRect(xr + 96, y + 20, 90 + Math.round(hache(c.i * 5 + 1) * 90), 10);
  ctx.fillStyle = '#3e3a37'; ctx.fillRect(xr + 96 + 200, y + 21, 40 + Math.round(hache(c.i * 5 + 2) * 30), 7);
  const bx = xr + 96, bw = wr - 96 - 24;
  if (c.dilemme) {
    // la carte du dilemme : deux mini-pilules, une barre dessous
    pilule(ctx, T, 0, { x: bx + 40, y: y + 66, ps: .12 });
    pilule(ctx, T, 1, { x: bx + 150, y: y + 66, ps: .12 });
    ctx.globalAlpha = a; ctx.fillStyle = '#4e4943'; ctx.fillRect(bx + 210, y + 62, Math.round((bw - 210) * .7), 8);
    ctx.fillRect(bx, y + 94, Math.round(bw * (.4 + .3 * hache(c.i * 3 + 7))), 8);
  } else {
    const nb = c.barres ?? 2, motA = o.mot ? (o.motA ?? 1) : 0;
    for (let k = 0; k < nb; k++) {
      const yy = y + 50 + k * 22, f = k === nb - 1 ? .35 + .3 * hache(c.i * 11 + k) : .72 + .26 * hache(c.i * 11 + k);
      if (k === 0 && motA > 0) {
        ctx.globalAlpha = a * (1 - motA); ctx.fillStyle = '#4e4943'; ctx.fillRect(bx, yy, Math.round(bw * f), 8);
        ctx.globalAlpha = a * motA; ctx.font = `22px ${MONO}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText(o.mot, bx, yy + 10);
        ctx.globalAlpha = a; continue;
      }
      ctx.fillStyle = '#4e4943'; ctx.fillRect(bx, yy, Math.round(bw * f), 8);
    }
  }
  if (o.etiquette) etiquetteA(ctx, xr + wr - 34, y + 12, (o.etiquetteA ?? 1) * a, o.etiquette, { col: o.etiquetteCol ?? GRIS });
  ctx.restore(); ctx.globalAlpha = 1;
}
// le fil de P04 : une colonne de cartes ; une sur quatre est la carte du dilemme
export const FIL = Object.freeze([...Array(28).keys()].map(i => Object.freeze({
  i, dilemme: i % 4 === 2, camp: hache(i * 13 + 5) < .5 ? 'bleu' : 'rouge', barres: 2 + (hache(i * 7 + 3) < .45 ? 1 : 0),
})));
// le fil en deux colonnes de P05 (repris en P65 flouté, en P78 avec ses étiquettes) : à gauche les auteurs bleus, à
// droite les rouges, une carte du dilemme en tête de chacune ; les mots du script tombent dans les cartes (MOTS_FIL)
export const FIL_COLONNES = Object.freeze([
  Object.freeze({ x: 200, w: 660, camp: 'bleu' }),
  Object.freeze({ x: 1060, w: 660, camp: 'rouge' }),
]);
const carteCol = (col, k) => Object.freeze({
  i: 100 + col * 50 + k, camp: k === 0 ? 'gris' : FIL_COLONNES[col].camp, dilemme: k === 0,
  barres: 2 + (hache(col * 31 + k * 7) < .4 ? 1 : 0), retrait: col === 1 && k === 3,
});
export const CARTES_COLONNES = Object.freeze([0, 1].map(col => Object.freeze([...Array(8).keys()].map(k => carteCol(col, k)))));
// les mots du script, et la carte qui les porte : [colonne, rang de la carte]
export const MOTS_FIL = Object.freeze([
  Object.freeze({ col: 0, k: 1, txt: 'égoïstes.' }),
  Object.freeze({ col: 0, k: 2, txt: 'assassins.' }),
  Object.freeze({ col: 1, k: 1, txt: 'idiots.' }),
  Object.freeze({ col: 1, k: 3, txt: '… et entraîner les autres avec eux.' }),
]);
// o : { a (1), defile (px : le fil remonte), y0 (40 : le haut de la première carte), mots (une fonction j → alpha du
//       mot MOTS_FIL[j], ou un nombre pour tous ; 1 par défaut), etiquettes (null, 'A' ou 'B' : sur les cartes du
//       dilemme), etiquetteA (alpha), filet (true), flou (0 : net ; k > 1 : la mosaïque, chaque carte k fois plus
//       grossière), colonnes ([0, 1]) }
// Rend { cartes: [{ col, k, x, y, w, h, camp }] } (à l'écran : pour que l'œil les suive).
export function colonnesFil(ctx, T, o = {}) {
  const a = o.a ?? 1, y0 = (o.y0 ?? 40) - (o.defile ?? 0), out = { cartes: [] };
  if (a <= .001) return out;
  const motA = j => (typeof o.mots === 'function' ? o.mots(j) : o.mots ?? 1);
  const dessin = g => {
    for (const col of o.colonnes ?? [0, 1]) {
      const C = FIL_COLONNES[col];
      CARTES_COLONNES[col].forEach((c, k) => {
        const y = y0 + k * (CARTE_H + CARTE_GAP);
        if (y > ZONE_UTILE + 40 || y + CARTE_H < -20) return;
        const j = MOTS_FIL.findIndex(m => m.col === col && m.k === k);
        carte(g, T, c, C.x, y, C.w, { a, mot: j >= 0 ? MOTS_FIL[j].txt : null, motA: j >= 0 ? motA(j) : 0, etiquette: c.dilemme ? o.etiquettes : null, etiquetteA: o.etiquetteA });
        out.cartes.push({ col, k, x: C.x, y, w: C.w, h: CARTE_H, camp: c.camp });
      });
    }
  };
  if (o.flou > 1) mosaique(ctx, 0, 0, W, ZONE_UTILE + 40, o.flou, dessin); else dessin(ctx);
  if (o.filet !== false) filet(ctx, 960, 0, ZONE_UTILE, a);
  return out;
}

// ================================================================ la vague de proche en proche (P24, P26, P27, P70)
// L'instant où la vague, partie du sujet origine à t0, atteint le sujet f : anneau par anneau de la grille d'index.html
// (20 × 5 ; la distance de Tchebychev entre les places), pas secondes par anneau. f, origine : un indice ou un sujet.
export function vague(f, origine, t0, pas = .09) {
  const i = typeof f === 'number' ? f : f.i, j = typeof origine === 'number' ? origine : origine.i;
  const d = Math.max(Math.abs((i % 20) - (j % 20)), Math.abs(Math.floor(i / 20) - Math.floor(j / 20)));
  return t0 + d * pas;
}

// ================================================================ l'anneau des bleus (P31–P33, P37–P38)
// Les 62 bleus de LOTS.b62 rangés sur un cercle (centre (960, 440), rayon 270), dans le sens des aiguilles d'une montre
// depuis le haut, dans l'ordre de l'angle de leur place dans la grille d'index.html (autour de son centre (650, 484)) :
// ORDRE_ANNEAU[k] est l'indice du sujet à la place k ; RANG_ANNEAU.get(i), la place du sujet i. Les 38 rouges vont
// aux bords (deux groupes, x 100–260 et 1 660–1 820, y 520–800) : ROUGES_ANNEAU, placeRouge(j).
export const ANNEAU = Object.freeze({ x: 960, y: 440, r: 270, n: 62 });
const angleGrille = f => { const a = Math.atan2(f.cx - 650, -(f.cy - 484)); return a < 0 ? a + 2 * Math.PI : a; };
export const ORDRE_ANNEAU = Object.freeze(FOULE.filter(f => LOTS.b62.has(f.i))
  .sort((p, q) => angleGrille(p) - angleGrille(q) || Math.hypot(p.cx - 650, p.cy - 484) - Math.hypot(q.cx - 650, q.cy - 484)).map(f => f.i));
export const RANG_ANNEAU = new Map(ORDRE_ANNEAU.map((i, k) => [i, k]));
export const ROUGES_ANNEAU = Object.freeze(FOULE.filter(f => !LOTS.b62.has(f.i)).map(f => f.i));
// la place k de l'anneau (k peut être fractionnaire : rot, en places, fait tourner l'anneau)
export function anneau(k, rot = 0) {
  const a = -Math.PI / 2 + 2 * Math.PI * (k + rot) / ANNEAU.n;
  return { x: ANNEAU.x + ANNEAU.r * Math.cos(a), y: ANNEAU.y + ANNEAU.r * Math.sin(a) };
}
// la rotation (en places) à l'instant T d'un anneau qui tourne depuis t0 : une place toutes les periode secondes, chaque
// pas glissé en glisse secondes (eIO). Le lot kant et le lot variantes l'appellent avec le même t0 : le raccord tient.
export function pasAnneau(T, t0, periode = .5, glisse = .3) {
  if (T <= t0) return 0;
  const u = (T - t0) / periode, n = Math.floor(u);
  return n + eIO(clamp((u - n) * periode / glisse));
}
// la place du j-ième rouge (0 à 37) : 19 à gauche, 19 à droite, quatre colonnes, cinq rangées
export function placeRouge(j) {
  const g = j < 19 ? 0 : 1, m = j % 19;
  return { x: (g ? 1660 : 100) + (m % 4) * (160 / 3), y: 520 + Math.floor(m / 4) * 70 };
}
// les flèches de l'anneau : de chaque place à la suivante (une corde), CRAIE, la pointe en pixels.
//   o : { rot (0), n (62 : combien de flèches sont tracées, dans l'ordre ; fractionnaire : la dernière se trace), a (1),
//         col (CRAIE), lw (2), retrait (26 : la place d'un sujet à chaque bout), vers ({ x, y, k } : l'éventail de P33,
//         chaque flèche pivote vers ce point, k de 0 à 1) }
export function flechesAnneau(ctx, T, o = {}) {
  const { rot = 0, n = ANNEAU.n, a = 1, col = CRAIE, lw = 2, retrait = 26 } = o;
  if (a <= .001) return;
  for (let k = 0; k < Math.min(n, ANNEAU.n); k++) {
    const p = anneau(k, rot), q = anneau(k + 1, rot), kk = clamp(n - k);
    let x1 = q.x, y1 = q.y;
    if (o.vers) { const v = eIO(clamp(o.vers.k)); x1 = lerp(q.x, o.vers.x, v); y1 = lerp(q.y, o.vers.y, v); }
    flechePixel(ctx, p.x, p.y, x1, y1, { col, lw, a, k: kk, retrait, c: 3 });
  }
}

// ================================================================ Kant et Nietzsche : des bonshommes de l'atlas, coiffés
// Pas de portrait d'après un tableau : un bonhomme comme les autres (ni peau, ni âge), reconnaissable à sa coiffe et à
// son nom, dessiné en grand (cs 32 : 352 × 384 px) par dessineSujet, avec des calques en plus (e.extra), sans toucher à
// l'atlas. Kant : la perruque à catogan (une ligne d'ombre au front, un rouleau de chaque côté de la tête à hauteur
// des oreilles) et le jabot (sous l'écharpe). Nietzsche : la moustache.
export const PORTRAITS = Object.freeze({
  kant: Object.freeze({
    nom: 'KANT',
    f: Object.freeze({ i: 201, r1: .31, r2: .62, r3: .17, coiffe: 0, detail: 1 }),
    extra: Object.freeze([calque(1, ['...OOOOO...']), calque(3, ['.O.......O.', '.O.......O.']), calque(7, ['....OLO....', '.....L.....'])]),
    extraCle: 'kant',
  }),
  nietzsche: Object.freeze({
    nom: 'NIETZSCHE',
    f: Object.freeze({ i: 202, r1: .71, r2: .23, r3: .54, coiffe: 0, detail: 0 }),
    extra: Object.freeze([calque(1, ['..OOOOOO...']), calque(4, ['...OOOOO...', '...O...O...'])]),
    extraCle: 'nietzsche',
  }),
});
// les calques descendus de d cases (la tête qui hoche : bob)
const descend = (cals, d) => (d ? cals.map(c => c.map(([x, y, v]) => [x, y + d, v])) : cals);
// Le portrait qui à l'instant T, centré en (cx, cy), cases de cs px. o : { col (CRAIE), a, mode ('repos'), phi, cible,
//   fixe, reflet (comme dessineSujet), bob (0 ou 1 : il hoche la tête), rangees (0 à 12 : les rangées déjà calculées,
//   de haut en bas ; fractionnaire : la rangée en cours ; 12 par défaut), balayage (true : la ligne LABO de 2 px à la
//   découpe), p (des champs de la pose), extra (des calques en plus des siens) }
// Rend { haut, bas, yBalayage (où passe la découpe, pour que la pupille de Phi la suive), yeux: { x, y } }.
export function portrait(ctx, T, qui, cx, cy, cs, o = {}) {
  const P = PORTRAITS[qui], bob = o.bob ?? 0, rangees = clamp(o.rangees ?? SH, 0, SH);
  const haut = Math.round(cy - SH * cs / 2), out = { haut, bas: haut + SH * cs, yBalayage: haut + rangees * cs, yeux: { x: cx, y: haut + (3.5 + bob) * cs } };
  if ((o.a ?? 1) <= .001 || rangees <= 0) return out;
  const e = {
    col: o.col ?? CRAIE, a: o.a ?? 1, mode: o.mode ?? 'repos', phi: o.phi, cible: o.cible, fixe: o.fixe, reflet: o.reflet,
    p: { bob, acc: 0, ...(o.p || {}) },
    extra: [...descend(P.extra, bob), ...(o.extra || [])], extraCle: `${P.extraCle}${bob}${o.extraCle || ''}`,
  };
  ctx.save();
  if (rangees < SH) { ctx.beginPath(); ctx.rect(cx - SW * cs, haut - 2 * cs, 2 * SW * cs, rangees * cs + 2 * cs); ctx.clip(); }
  dessineSujet(ctx, P.f, cx, cy, cs, e, T);
  ctx.restore();
  if (o.balayage && rangees < SH) { ctx.globalAlpha = .9; ctx.fillStyle = LABO; ctx.fillRect(cx - SW * cs / 2 - 20, out.yBalayage - 1, SW * cs + 40, 2); ctx.globalAlpha = 1; }
  return out;
}

// ================================================================ les poses nouvelles (des calques, par e.p et e.extra)
// À étaler dans l'état d'un sujet : dessineSujet(ctx, f, x, y, cs, { col, ...POSES_EP.tend(1) }, T). sens : 1 vers la
// droite, −1 vers la gauche. Les calques se peignent à la hauteur du sujet debout (ni accroupi, ni tête basse : la
// pose les force). Pour ajouter les siens (la perruque de Kant…), concaténez extra et extraCle.
const sensCal = (cal, sens) => (sens < 0 ? miroir(cal) : cal);
// les bras repliés dans le dos (dos, dosMains) : les épaules et les coudes en dehors (x 2 et 8), les avant-bras qui
// reviennent vers le milieu du dos (rangée 8) ; le dos plein autour (sur la pose « serres » ; les jambes ne changent pas :
// une case claire à leur hauteur se lisait comme une jambe)
const BRAS_DOS = Object.freeze(calque(7, ['..OBBBBBO..', '..OOOBOOO..', '...BBBBB...']));
export const POSES_EP = Object.freeze({
  // la main tendue : l'avant-bras à l'horizontale, la main en lumière (P22, P24)
  tend: (sens = 1) => ({ p: { bras: 'serres', acc: 0, bob: 0 }, extra: [sensCal(calque(8, ['........OOL']), sens)], extraCle: `tend${sens}` }),
  // le doigt pointé : le bras levé en diagonale (P67, P68)
  montre: (sens = 1) => ({ p: { bras: 'serres', acc: 0, bob: 0 }, extra: [sensCal(calque(5, ['..........L', '.........O.', '........O..']), sens)], extraCle: `montre${sens}` }),
  // vu de dos, les doigts croisés dans le dos (P23) : ni yeux ni bouche ; les bras repliés derrière (les coudes en
  // dehors, les avant-bras qui reviennent vers le milieu du dos) et, là où les mains se rejoignent, un « x » de cinq
  // cases de lumière sur le tronc (trois cases en V au bas du tronc, les bras le long du corps, se lisaient comme un slip)
  dos: () => ({ p: { bras: 'serres', acc: 0, bob: 0, yx: 0, yy: 0, bouche: 0, yeux: 'o', goutte: 0 }, extra: [calque(3, ['....B.B....']), BRAS_DOS, calque(7, ['....L.L....', '.....L.....', '....L.L....'])], extraCle: 'dos' }),
  // vu de dos, les mains ouvertes, rien de croisé (P30 : la rime) : les mêmes bras repliés, les deux mains au bout des
  // avant-bras, à la hauteur du « x », côte à côte et séparées (deux cases au lieu de cinq)
  dosMains: () => ({ p: { bras: 'serres', acc: 0, bob: 0, yx: 0, yy: 0, bouche: 0, yeux: 'o', goutte: 0 }, extra: [calque(3, ['....B.B....']), BRAS_DOS, calque(8, ['....L.L....'])], extraCle: 'dosMains' }),
  // la petite cape : l'écharpe qui s'allonge et flotte, deux images, 0,25 s chacune (P33)
  cape: T => { const k = Math.floor(T / .25) % 2; return { extra: [k ? calque(7, ['..O.....O..', '.O.......O.', 'O.........O']) : calque(7, ['..O.....O..', '.O.......O.', '.O.......O.'])], extraCle: `cape${k}` }; },
});

// ================================================================ les bulles (P22, P25, P30, P46, P67, P69)
// Une bulle façon jeu rétro : parole (un cadre aux coins en escalier, la queue en escalier vers queue) ou pensée (plus
// ronde, trois ronds en pixels vers queue). (x, y, w, h) : le corps de la bulle.
//   o : { type ('parole' | 'pensee'), queue ({ x, y } : vers qui ; sans : pas de queue), a (1), txt (une ligne, ou
//         plusieurs séparées par \n), taille (26), col (CRAIE), font (PIX), bord (CRAIE), k (1 : l'ouverture, de 0 à
//         1, la bulle grandit depuis sa queue) }
export function bulle(ctx, x, y, w, h, o = {}) {
  const a = o.a ?? 1, k = eOut(clamp(o.k ?? 1)); if (a <= .001 || k <= 0) return;
  const pensee = o.type === 'pensee', q = o.queue, bord = o.bord ?? CRAIE;
  ctx.save(); ctx.globalAlpha = a;
  const ox = q ? q.x : x + w / 2, oy = q ? q.y : y + h / 2;
  ctx.translate(ox, oy); ctx.scale(k, k); ctx.translate(-ox, -oy);
  // le corps
  ctx.strokeStyle = bord; ctx.lineWidth = 3;
  cheminPixel(ctx, x, y, w, h, pensee ? Math.min(28, h / 2) : 8, 4);
  ctx.fillStyle = FOND_FENETRE; ctx.fill(); ctx.stroke();
  if (q) {
    const bas = q.y > y + h / 2, by = bas ? y + h : y, dir = bas ? 1 : -1, bx = Math.round(clamp(q.x, x + 30, x + w - 30));
    if (pensee) {
      // trois ronds en pixels, de plus en plus petits vers queue
      [[.3, 11], [.58, 8], [.84, 5]].forEach(([u, r]) => disquePixel(ctx, lerp(bx, q.x, u), lerp(by + dir * 10, q.y, u), r, 3, FOND_FENETRE, bord));
    } else {
      // la queue en escalier : quatre marches de 6 px, de 24 à 6 px de large, qui penchent vers queue
      const sx = q.x >= bx ? 1 : -1, marches = [0, 1, 2, 3].map(m => {
        const g = sx > 0 ? bx - 12 + 6 * m : bx - 12, d = sx > 0 ? bx + 12 : bx + 12 - 6 * m;
        return { g, d, y0: by + dir * 6 * m, y1: by + dir * 6 * (m + 1) };
      });
      ctx.fillStyle = FOND_FENETRE;
      for (const M of marches) ctx.fillRect(M.g, Math.min(M.y0, M.y1) - (M === marches[0] ? 2 * dir : 0), M.d - M.g, 6 + 2);
      ctx.fillStyle = bord;
      for (const M of marches) { ctx.fillRect(M.g - 3, Math.min(M.y0, M.y1), 3, 6); ctx.fillRect(M.d, Math.min(M.y0, M.y1), 3, 6); }
      for (let m = 0; m < 3; m++) {   // les nez des marches
        const A = marches[m], B = marches[m + 1], yy = dir > 0 ? A.y1 : A.y1 - 3;
        if (B.g > A.g) ctx.fillRect(A.g - 3, yy, B.g - A.g + 3, 3);
        if (B.d < A.d) ctx.fillRect(B.d, yy, A.d - B.d + 3, 3);
      }
      const D = marches[3]; ctx.fillRect(D.g - 3, dir > 0 ? D.y1 : D.y1 - 3, D.d - D.g + 6, 3);
    }
  }
  if (o.txt) {
    const L = String(o.txt).split('\n'), z = o.taille ?? 26;
    ctx.font = `${z}px ${o.font ?? PIX}`; ctx.fillStyle = o.col ?? CRAIE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    L.forEach((l, i) => texteSignes(ctx, l, x + w / 2, y + h / 2 + (i - (L.length - 1) / 2) * z * 1.3));
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
// un rond en pixels (des cases de c px) : le fond, et un bord d'une case
export function disquePixel(ctx, cx, cy, r, c = 3, fond = FOND_FENETRE, bord = CRAIE) {
  const n = Math.ceil(r / c) + 1, x0 = Math.round(cx), y0 = Math.round(cy);
  for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
    const d = Math.hypot((i + .5) * c, (j + .5) * c);
    if (d > r) continue;
    ctx.fillStyle = d > r - c ? bord : fond;
    ctx.fillRect(x0 + i * c, y0 + j * c, c, c);
  }
}

// ================================================================ la pièce d'Alice (P32–P34, P37)
// Une fenêtre à part, son sol de points, un seul sujet au milieu, les mains vides (aucune pilule). Alice n'est pas une
// participante : ni dans FOULE, ni dans DEMO, ni dans PREMIERS.
export const ALICE = Object.freeze({ i: 300, r1: .42, r2: .77, r3: .29, coiffe: 3, detail: 0, cx: 0, cy: 0 });
//   o : { a (1), cs (6), clair (0..1 : le fond s'éclaire, TEINTE_CLAIRE), nom (alpha de « ALICE » au-dessus et de
//         « 101e sujet · sans pilule » dessous ; 0 : sans), pointilles (true : un cadre en tirets au lieu de la fenêtre,
//         sans sujet : les petites pièces des bleus accidentels, P34), phi, cible, fixe, reflet, mode }
// Rend { visage: { x, y }, rect }.
export function pieceAlice(ctx, T, x, y, w, h, o = {}) {
  const a = o.a ?? 1, cs = o.cs ?? 6, cx = x + w / 2, cy = y + h * .6, out = { visage: { x: cx, y: cy - 3 * cs }, rect: { x, y, w, h } };
  if (a <= .001) return out;
  if (o.pointilles) { rectTirets(ctx, x, y, w, h, o.col ?? LAITON, a, 2, [6, 6]); return out; }
  fenetre(ctx, x, y, w, h, a);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (o.clair > 0) { ctx.globalAlpha = a * clamp(o.clair) * .9; ctx.fillStyle = TEINTE_CLAIRE; ctx.fillRect(x, y, w, h); }
  // le sol de points, en perspective
  ctx.fillStyle = LABO;
  for (let r = 0; r < 5; r++) {
    const k = r / 4, yy = cy + SH * cs / 2 + 6 + k * k * (y + h - cy - SH * cs / 2 - 10), step = 18 + 26 * k;
    for (let xx = cx % step; xx < x + w; xx += step) { ctx.globalAlpha = a * (.08 + .25 * k); ctx.fillRect(Math.round(xx), Math.round(yy), 2, 2); }
  }
  ctx.restore();
  dessineSujet(ctx, ALICE, cx, cy, cs, { col: GRIS_FIG, a, mode: o.mode ?? 'repos', phi: o.phi, cible: o.cible, fixe: o.fixe, reflet: o.reflet }, T);
  const n = o.nom ?? 1;
  if (n > 0) {
    ctx.globalAlpha = a * n; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = `28px ${PIX}`; ctx.fillStyle = CRAIE; ctx.fillText('ALICE', cx, y - 22);
    ctx.font = `16px ${MONO}`; ctx.fillStyle = GRIS; ctx.fillText('101e sujet · sans pilule', cx, y + h + 34);
  }
  ctx.globalAlpha = 1;
  return out;
}

// ================================================================ le tirage (film-pilules/plans/regles.js, P10)
// Un cadre laiton qui saute d'une cible à l'autre, de plus en plus lentement, puis se pose (ou non).
// sautsTirage(t0, n, d0, d1) : les instants des n sauts (le premier à t0), les durées allant de d0 à d1 (en (k/(n−1))^1,6).
export function sautsTirage(t0, n = 8, d0 = .12, d1 = .6) {
  const out = [t0]; let t = t0;
  for (let k = 0; k < n; k++) { t += d0 + (d1 - d0) * Math.pow(k / Math.max(1, n - 1), 1.6); out.push(t); }
  return Object.freeze(out);
}
// l'état du tirage à l'instant T : null avant t0 ; sinon { k (le saut en cours, 0 à n), cible (l'indice de la cible :
// k modulo cibles, ou o.ordre[k]), depuis (le temps depuis ce saut), pose (true : posé, après le dernier saut), tPose }.
//   cibles : le nombre de cibles (ou un tableau : sa longueur) ; o : { n (8), d0 (.12), d1 (.6), ordre ([indices]) }
export function tirage(T, t0, cibles, o = {}) {
  if (T < t0) return null;
  const S = sautsTirage(t0, o.n ?? 8, o.d0 ?? .12, o.d1 ?? .6), nc = typeof cibles === 'number' ? cibles : cibles.length;
  let k = 0; while (k < S.length - 1 && T >= S[k + 1]) k++;
  const cible = o.ordre ? o.ordre[Math.min(k, o.ordre.length - 1)] : k % nc;
  return { k, cible, depuis: T - S[k], pose: k === S.length - 1, tPose: S[S.length - 1], sauts: S };
}
// le cadre laiton du tirage sur le rectangle r ({ x, y, w, h }), avec l'éclat de chaque saut et le verrou quand il se
// pose. etat : ce que rend tirage() ; o : { a (1), marge (20), pose (true : il se pose ; false : il s'arrête sans
// verrou), tremble (0 : en pixels, P81) }
export function cadreTirage(ctx, T, etat, r, o = {}) {
  if (!etat || !r) return;
  const flash = 1 - seg(etat.depuis, 0, .18), pose = etat.pose && o.pose !== false;
  const clac = pose ? eOut(seg(T, etat.tPose, etat.tPose + .35)) : 1, gr = pose ? lerp(10, 0, clac) : 0, m = (o.marge ?? 20) + gr;
  const tr = o.tremble ? (hache(Math.floor(T * 20)) - .5) * 2 * o.tremble : 0;
  ctx.save();
  ctx.globalAlpha = (o.a ?? 1) * (.7 + .3 * flash);
  ctx.shadowColor = rgba(LAITON, .8); ctx.shadowBlur = 14 + 22 * flash + (pose ? 16 * (1 - clac) : 0);
  ctx.strokeStyle = LAITON; ctx.lineWidth = pose ? 5 : 4;
  ctx.strokeRect(r.x - m + tr, r.y - m, r.w + 2 * m, r.h + 2 * m);
  ctx.restore();
  if (pose) { const e = 1 - seg(T, etat.tPose, etat.tPose + .45); if (e > 0) { ctx.globalAlpha = .1 * e * (o.a ?? 1); ctx.fillStyle = LAITON; ctx.fillRect(r.x, r.y, r.w, r.h); } ctx.globalAlpha = 1; }
}

// ================================================================ les devinettes (P41, P44, P51, P58, P61)
// Le compte à rebours : un trait GRIS de 4 px, de x à x + w, qui se vide de droite à gauche entre t0 et t0 + d (il paraît
// 0,3 s avant, s'efface 0,3 s après). La trotteuse (le son, une par seconde) : trotteuses(t0, d), à mettre dans SONS.
export function compteARebours(ctx, T, t0, d, x, y, w, o = {}) {
  const al = (o.a ?? 1) * cloche(T, t0 - .3, t0, t0 + d, t0 + d + .3);
  if (al <= .001) return;
  const k = seg(T, t0, t0 + d);
  ctx.globalAlpha = al * .35; ctx.fillStyle = GRIS; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), 1);
  ctx.globalAlpha = al; ctx.fillRect(Math.round(x), Math.round(y) - 2, Math.round(w * (1 - k)), 4);
  ctx.globalAlpha = 1;
}
export const trotteuses = (t0, d, g = .3) => Object.freeze([...Array(Math.max(0, Math.ceil(d - 1e-6))).keys()].map(s => Object.freeze({ t: +(t0 + s).toFixed(3), son: 'trotteuse', g })));
// La boîte de question, celle de Thibaut (resultats-pilules : boite) : une fenêtre centrée en cx, son haut en y, des
// lignes [texte, taille, couleur] en DotGothic16 centrées ; elle descend de 14 px en s'ouvrant. Avec o.compte
// ({ t0, d }), le compte à rebours se pose dessous. o : { lignes, cx (960), y (200), a (1 ; ou o.t0 : elle s'ouvre en
// 0,4 s), bord (CRAIE), compte }. Rend { x, y, w, h }.
export function devinette(ctx, T, o) {
  const lignes = o.lignes, cx = o.cx ?? 960, y = o.y ?? 200;
  const a = (o.a ?? 1) * (o.t0 != null ? seg(T, o.t0, o.t0 + .4) : 1);
  let w = 0, h = 0;
  for (const [s, z] of lignes) { ctx.font = `${z}px ${PIX}`; w = Math.max(w, ctx.measureText(s).width); h += z * 1.38; }
  w += 70; h += 34;
  const R = { x: cx - w / 2, y, w, h };
  if (a <= .001) return R;
  const oo = eOut(a), yy0 = y + (1 - oo) * 14;
  fenetre(ctx, cx - w / 2, yy0, w, h, a, o.bord ?? CRAIE);
  let yy = yy0 + 17;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  for (const [s, z, c = CRAIE] of lignes) { yy += z * 1.38; ctx.globalAlpha = a; ctx.font = `${z}px ${PIX}`; ctx.fillStyle = c; texteSignes(ctx, s, cx, yy - z * .36); }
  ctx.globalAlpha = 1;
  if (o.compte) compteARebours(ctx, T, o.compte.t0, o.compte.d, cx - w / 2 + 24, yy0 + h + 22, w - 48, { a });
  return R;
}

// ================================================================ le carton (le teaser, le générique de fin, un titre)
// Des lignes tapées l'une après l'autre au centre de l'écran, le curseur LABO au bout de celle qui s'écrit.
//   o : { lignes: [{ txt, taille (44), col (CRAIE), font (PIX), t0, cps (24), esp (0 : l'espacement des lettres) }],
//         y (470 : le milieu du bloc), a (1), fenetre (false : un cadre façon jeu rétro autour), interligne (1,5) }
// Rend { rect, plume }.
export function carton(ctx, T, o) {
  const a = o.a ?? 1, L = o.lignes, il = o.interligne ?? 1.5;
  const hs = L.map(l => (l.taille ?? 44) * il), H0 = hs.reduce((s, v) => s + v, 0);
  let yy = (o.y ?? 470) - H0 / 2, plume = null, wmax = 0;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  for (const l of L) { ctx.font = `${l.taille ?? 44}px ${l.font ?? PIX}`; wmax = Math.max(wmax, ctx.measureText(l.txt).width + (l.esp ?? 0) * [...l.txt].length); }
  const rect = { x: 960 - wmax / 2 - 60, y: yy - 30, w: wmax + 120, h: H0 + 50 };
  if (a <= .001) return { rect, plume };
  if (o.fenetre) fenetre(ctx, rect.x, rect.y, rect.w, rect.h, a);
  L.forEach((l, i) => {
    const z = l.taille ?? 44, chars = [...l.txt], n = clamp(Math.floor((T - (l.t0 ?? -Infinity)) * (l.cps ?? 24)), 0, chars.length);
    yy += hs[i];
    if (n <= 0) return;
    ctx.globalAlpha = a; ctx.font = `${z}px ${l.font ?? PIX}`; ctx.fillStyle = l.col ?? CRAIE;
    const wTot = ctx.measureText(l.txt).width + (l.esp ?? 0) * (chars.length - 1), x0 = 960 - wTot / 2, vis = chars.slice(0, n).join('');
    if (l.esp) espace(ctx, vis, x0, yy - z * .3, l.esp); else ctx.fillText(vis, x0, yy - z * .3);
    if (n < chars.length) {
      const wv = ctx.measureText(vis).width + (l.esp ?? 0) * n;
      ctx.fillStyle = LABO; ctx.fillRect(x0 + wv + 3, yy - z * 1.08, z * .55, z * .9);
      plume = { x: x0 + wv, y: yy - z * .6 };
    }
  });
  ctx.globalAlpha = 1;
  return { rect, plume };
}

// Le carton de chapitre : la partie (LAITON, espacée) et la séquence (CRAIE) du script, tapées au centre dans une
// fenêtre façon jeu rétro, comme le cartouche en grand. Aucun plan d'EPISODE.md n'en demande : le cartouche (film.js)
// dit toujours où l'on est ; c'est un outil pour un passage de partie, si l'image le veut au moment de peaufiner.
//   o : { t0 (l'instant où il commence à s'écrire ; sans : écrit), a (1), y (420), cps (24) } ; rend { rect, plume }
export function chapitre(ctx, T, haut, bas, o = {}) {
  const t0 = o.t0 ?? -Infinity, cps = o.cps ?? 24, n0 = [...haut].length;
  return carton(ctx, T, {
    a: o.a ?? 1, y: o.y ?? 420, fenetre: true, interligne: 1.7, lignes: [
      { txt: haut, taille: 30, col: LAITON, t0, cps, esp: 2 },
      { txt: bas, taille: 56, col: CRAIE, t0: t0 + n0 / cps + .2, cps },
    ],
  });
}

// ================================================================ les vrais humains (P73–P77 ; l'écran 12)
// Le même atlas, autre chose : une respiration à leur rythme (la tête descend d'une case), un pouls (vraisHumains rend
// echelle, de 1 à 1,025, qui bat), une ombre au sol, PAS de reflet et jamais le regard vers Phi (ils ne savent pas
// qu'on les regarde). À appeler juste avant de dessiner :
//   const E = vraisHumains(f, e, T); ombre(ctx, x, y, cs, phi); dessineSujet(ctx, f, x, y, cs * E.echelle, E, T);
// (le pouls, côté son : un rythme par sujet, 62 à 88 battements par minute, f.r2)
export function vraisHumains(f, e, T) {
  const resp = 3.2 + (f.r1 ?? .5) * 1.8, bpm = 62 + (f.r2 ?? .5) * 26, ph = f.r3 ?? .5;
  const bob = ((T / resp + ph) % 1) < .45 ? 1 : 0, u = ((T * bpm / 60) + ph) % 1, battement = Math.exp(-u * 9);
  const { cible, fixe, reflet, ...reste } = e;
  return { ...reste, reflet: false, fixe: false, p: { bob, ...(e.p || {}) }, echelle: 1 + .025 * battement, pouls: battement, bpm };
}
// l'ombre au sol d'un sujet (ses pieds en cy + 6 cs) : trois rangées de cases sombres, poussées à l'opposé de la
// lumière (phi : l'œil, { x, y } ; sans, l'ombre est droite dessous)
export function ombre(ctx, cx, cy, cs, phi, a = 1) {
  if (a <= .001) return;
  const dx = phi ? -Math.sign(phi.x - cx) * cs * 1.5 : 0, y = cy + SH * cs / 2 - cs * .25;
  ctx.globalAlpha = .38 * a; ctx.fillStyle = '#000';
  [[5, -.5], [9, 0], [6, .5]].forEach(([n, r]) => ctx.fillRect(Math.round(cx + dx + r * cs - n * cs / 2), Math.round(y + (r + .5) * cs * .5), Math.round(n * cs), Math.max(1, Math.round(cs * .5))));
  ctx.globalAlpha = 1;
}
