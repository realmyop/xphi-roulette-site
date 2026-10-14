/* ==========================================================================
   Les deux pilules, le film — commun.js : le socle de la direction artistique

   La DA de Thibaut (mockups/pilules/index.html) et la slide des données
   (mockups/pilules/donnees.html), reprises ici en FONCTIONS PURES DU TEMPS :
   l'image de l'instant T ne dépend que de T, jamais des images déjà jouées.
   Les deux pages d'origine ne sont pas touchées : ce fichier en est une copie,
   rendue déterministe (les valeurs animées V et la file d'actions deviennent
   des clés datées ; les saccades de Phi, des créneaux tirés par hache).

   ---------------------------------------------------------------------------
   CONTRAT POUR LES LOTS (plans/<lot>.js)
   ---------------------------------------------------------------------------
   - On importe ce qu'il faut : import { fond, oeil, creeRegard, … } from '../commun.js'.
   - On ne modifie JAMAIS ce fichier depuis un lot, et on ne mute aucun de ses
     objets exportés (FOULE, DEMO, PREMIERS, CORPS, HUMEURS… sont gelés ou
     partagés). Un utilitaire qui manque se définit dans plans/<lot>.js ; une
     forme de sujet qui manque passe par e.p (la pose) et e.extra (des calques
     en plus), sans toucher à l'atlas.
   - Toutes les fonctions qui dessinent prennent le contexte en premier
     argument, et le temps ABSOLU du film T quand elles animent.
   - Rien ne garde d'état d'une image à l'autre : seules des mémoires de calcul
     (l'atlas des sujets, les glyphes, les halos), qui ne changent pas l'image.
     Jamais Math.random : rng(graine) et hache(n).
   - Les fonctions posent globalAlpha, fillStyle, font, textAlign… sans toujours
     les rendre : posez-les avant de dessiner. Celles qui transforment ou
     découpent le contexte font save()/restore().
   - Les polices sont chargées par la page avant la première image ; une toile
     mesurée avant (Node, essais) mesure de travers : prepare() remet à zéro.

   CE QU'IL Y A (dans l'ordre du fichier)
   - base : W, H, la palette (CRAIE, GRIS, NUIT, LABO, LAITON, BLEU, BLEU_TXT,
     ROUGE, ROUGE_TXT, GRIS_FIG, FILET, SURTITRE, les teintes du fond), MONO,
     PIX, G (les caractères '01·:+*#%xφ'), NB (l'espace insécable), toile(w, h)
   - le temps : clamp, lerp, seg(t, a, b), dans, cloche, eIO, eOut, eIn, eBack,
     lisse, cles(t, [[t, v, f?]…]) (images clés), marche(t, …) (paliers),
     vers(T, [[t, v, d]…], depart) (les valeurs V d'index.html, en pur)
   - le hasard : rng(graine), hache(n) ; les couleurs : hex, mix, rgba
   - le texte : fr (insécables), pc (« 65,5 % »), virgule, nombre (« 4 457 »),
     balise ([b]…[/b] bleu, [r]…[/r] rouge, \n), longueur, ecrit, largeur,
     coupe, coupeBalise, espace (lettres espacées), signe et texteSignes (✓ ✗ ▶ en
     pixels), pastille
   - le décor : SOL, POUSSIERE, sol, poussiere, fond (laboratoire, chaud, clair,
     nuit), trame, vignettage, voile
   - les fenêtres : fenetre, cartouche (+ CARTOUCHE, largeurCartouche), tampon,
     jauge (style index.html « demo » ou donnees.html « donnees », seuil 50 %)
   - les pilules : PILULES, POSES, pilule(ctx, T, i, { x, y, ps, t0, lab, eclat… })
   - Phi : HUMEURS, humeur(T, ordres), cligne, clin, microsaccade, flotte,
     dessineOeil, oeil(ctx, T, { x, y, taille, humeur, regard, … })
   - le regard de Phi : VOUS, point, decalage, creeRegard({ cibles, repos })
   - les sujets : SW, SH, CS, LETTRE, calque, TETE, TETE_NUIT, COIFFES, ECHARPE,
     CORPS (bas, hop, leves, serres, croises, tient), JAMBES, grille, sprite,
     halo, regardeVers, pose, dessineSujet (états, regard, reflet, dissolution,
     son envers, couché)
   - les foules : FOULE, DEMO (les sujets de démonstration), PREMIERS (les cent
     premiers participants), LOTS (b62, b40…), ORDRE, MAUVAIS (19, dont le 47),
     N48, ABSTIENT, participant(p), placeParticipant(p), CONSTELLATION
   - les éléments partagés : crochets (le N°48), carnet (+ CARNET_PAGE,
     CARNET_COIN)
   - la caméra : cadre(wx, wy, sx, sy, z), IDENTITE, CAM_CONSTELLATION, camera(T, cles)
   - prepare() : après le chargement des polices
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
// ✓ ✗ ▶ en pixels (aucune police du dépôt ne les a) : une grille de 7 × 7 cases à la couleur et à l'alpha courants,
// d'environ les trois quarts de la taille de la police (px), centrée en (x, y). Des cases entières : net à toute taille.
export const SIGNES = Object.freeze({
  '✓': ['.......', '......#', '.....##', '#...##.', '##.##..', '.###...', '..#....'],
  '✗': ['#.....#', '##...##', '.##.##.', '..###..', '.##.##.', '##...##', '#.....#'],
  '▶': ['##.....', '####...', '######.', '#######', '######.', '####...', '##.....'],
});
const caseSigne = px => Math.max(1, Math.round(px * .75 / 7));
export function signe(ctx, ch, x, y, px) {
  const g = SIGNES[ch]; if (!g || !(px >= 1)) return;
  const c = caseSigne(px), x0 = Math.round(x - 3.5 * c), y0 = Math.round(y - 3.5 * c);
  g.forEach((l, j) => { for (let i = 0; i < 7; i++) if (l[i] === '#') ctx.fillRect(x0 + i * c, y0 + j * c, c, c); });
}
// fillText, avec ✓ ✗ ▶ dessinés par signe() : la police, l'alignement (left, center, right) et la ligne de base
// (middle, alphabetic) sont ceux du contexte
export function texteSignes(ctx, txt, x, y) {
  const morceaux = [...txt].reduce((a, ch) => { if (SIGNES[ch]) a.push({ signe: ch }, ''); else a[a.length - 1] += ch; return a; }, ['']);
  const px = +((ctx.font.match(/(\d+(?:\.\d+)?)px/) || [0, 16])[1]), c = caseSigne(px);
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
