/* ==========================================================================
   Les deux pilules, le film — plans/nuit.js : le lot « nuit »
   ACTE I — LA NUIT, L'ÉMISSION : P01–P06, de 0,0 à 40,8 s (SCENARIO.md fait foi)

   P01  0,0– 6,0  Quelqu'un ne dort pas : le N°48 dans sa nuit, rapproché ×6, recul lent.
   P02  6,0– 9,4  Titre : l'œil s'ouvre, « XPHI » se forme de caractères, glisse au cartouche.
   P03  9,4–18,6  Le laboratoire : les cent sujets de démonstration, les « ? » des dilemmes.
   P04 18,6–26,6  Le carnet : il quitte le coin, l'hypothèse s'écrit, « (comme moi) ».
   P05 26,6–30,6  Le fil : le téléphone du N°48, une recette, deux chats.
   P06 30,6–40,8  L'appel : la publication de Phi, le clin d'œil, il appuie, le N°48,
                  et la plongée dans l'avatar, qui devient l'œil de Phi au laboratoire.

   Le contrat (film.js, commun.js) : tout est fonction du temps absolu t (hache, aucune
   mémoire d'une image à l'autre, sauf des mémoires de calcul qui ne changent pas l'image) ;
   le plan peint tout son fond, dessine le monde puis l'œil ; jamais la boîte de dialogue, le
   cartouche, le carnet du coin, « données fictives » ni le voile (la surimpression) ; rien
   d'important sous y = 830.

   Les instants des mots (« sur “dilemmes” ») ne sont pas recopiés du scénario : ils sont lus
   dans la boîte (texte.js, ecrits), pour tomber avec le texte qui s'écrit, même si une réplique
   change. Les chiffres viennent de donnees.js (le rang du N°48, l'heure, l'appel).

   Raccords : entrée sur le noir du début ; sortie à 40,8 s sur le fond du laboratoire (sol,
   poussière) et l'œil seul en (650, 240), taille 220, neutre, lueur 0,35, qui vous regarde.
   Partagés avec le lot issue (P19–P21) : le sujet nocturne (nuitScene, exportée), les
   crochets et le carnet de commun.js, tels que décrits dans « Les éléments partagés ».
   ========================================================================== */
import {
  W, H, CRAIE, GRIS, NUIT, LABO, LAITON, BLEU, ROUGE, GRIS_FIG, FILET, MONO, PIX, G, NB, SW, SH,
  clamp, lerp, seg, cloche, eIO, eOut, eBack, lisse, cles, hache, mix, rgba, sansBalise, nombre,
  fond, FOND_NUIT, fenetre, cartouche, largeurCartouche, CARTOUCHE, pilule,
  humeur, HUMEURS, oeil, creeRegard, VOUS, point, cligne, flotte,
  dessineSujet, calque, DEMO, PREMIERS, N48, crochets, carnet,
  camera, cadre, toile, texteSignes,
} from '../commun.js';
import { REPLIQUES, NOTES, CARNET, CARTOUCHES, ecrits, plume } from '../texte.js';
import { N48 as FICHE, COLLECTE } from '../donnees.js';

export const LOT = { id: 'nuit', de: 0, a: 40.8 };

// ================================================================ outils du lot
const lin = k => k;
const noir = (ctx, a) => { if (a <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; };
// une lueur ronde (dégradé radial), de couleur col, d'opacité a au centre
function lueur(ctx, x, y, r, col, a, op = 'source-over') {
  if (a <= .002 || r <= 1) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(.45, rgba(col, a * .45)); g.addColorStop(1, rgba(col, 0));
  ctx.save(); ctx.globalCompositeOperation = op; ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
}
// la sonde : une petite toile où l'on « dessine » le carnet pour savoir où est sa plume (l'œil la suit)
let SONDE = null;
const sonde = () => SONDE || (SONDE = toile(4, 4).getContext('2d'));
// une toile à soi pour la plongée (P06) : le téléphone y est peint, puis posé avec son alpha
let PLONGEE = null;
const calquePlongee = () => PLONGEE || (PLONGEE = toile(W, H).getContext('2d'));
// une toile pour le sujet nocturne, qu'on éclaire à part (assez grande pour ×6,5 : 286 × 312 px)
let SUJET = null;
const calqueSujet = () => SUJET || (SUJET = toile(512, 512).getContext('2d'));

// ---------------------------------------------------------------- les instants des mots, lus dans la boîte
// L'instant où le premier caractère de « mot » s'écrit dans la réplique id (texte.js : 13 car./s et les « … »),
// par dichotomie sur ecrits() ; défaut si le mot n'y est plus. Mémoire de calcul seulement.
function instantMot(id, mot, defaut) {
  const r = REPLIQUES.find(x => x.id === id);
  if (!r) return defaut;
  const i = sansBalise(r.txt).replace(/\n/g, '').indexOf(mot);
  if (i < 0 || ecrits(r, r.a) <= i) return defaut;
  let a = r.de, b = r.a;
  for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (ecrits(r, m) > i) b = m; else a = m; }
  return b;
}
const MOTS = new Map();
function quand(id, mot, defaut) {
  const cle = `${id}|${mot}`;
  if (!MOTS.has(cle)) MOTS.set(cle, instantMot(id, mot, defaut));
  return MOTS.get(cle);
}
// pour les indices sonores (calculés au chargement, à l'écriture « parole » du rendu) : sans mémoire, et sans risque
// hors d'un navigateur (la boîte mesure ses lignes dans une toile) ; à défaut, les instants du scénario
function motSon(id, mot, defaut) { try { return +instantMot(id, mot, defaut).toFixed(2); } catch (e) { return defaut; } }
// les repères du lot (calculés à la première image : la boîte est alors réglée, ?ecriture= compris)
let REP = null;
function rep() {
  if (REP) return REP;
  REP = {
    morale: quand('R03', 'morale', 11.0),
    dilemmes: quand('R03', 'dilemmes', 13.6),
    propre: quand('R03', 'C’est', 14.3),
    note: quand('R04', 'je note', 17.5),
    hypothese: quand('R05', 'vous', 20.2),
    commeMoi: quand('R05', 'Comme', 22.8),
    regle: quand('R05', 'vite', 24.8),
    presque: quand('R07', 'presque', 33.9),
    nom: quand('R08', 'ce sera', 38.4),
  };
  return REP;
}

// ================================================================ les données (donnees.js) : tout chiffre affiché en vient
const RANG = FICHE.rang;                                   // 48 : il est le quarante-huitième
const HEURE = FICHE.vuAppel;                               // « 23:41 » : il voit l'appel
const minutes = s => { const m = /(\d+):(\d+)/.exec(s); return m ? +m[1] * 60 + +m[2] : 0; };
const DEPUIS = minutes(HEURE) - minutes(COLLECTE.appel);   // 41 : l'appel est passé à 23:00

// ================================================================ P01, P06 (et le lot issue) : le sujet nocturne
// SCENARIO, « Les éléments partagés » : le N°48 (PREMIERS[47], frange, sans écharpe) en mode 'nuit' de commun.js :
// les avant-bras ramenés devant, le téléphone (cases T), la tête éclairée d'en bas, le reflet posé en bas des yeux.
// Le cadre de P01 : rapproché ×6, son centre en (960, 430) ; ici le N°48 est à l'origine du monde (cam.ecran(0, 0)).
const N = PREMIERS[N48];
export const NUIT_CADRE = Object.freeze({ x: 960, y: 430, z: 6 });
// l'écran de son téléphone, à l'écran : les cases T du calque « tient » (x 4–5, y 8–9)
function ecranTel(cx, cy, cs) {
  const ox = Math.round(cx - SW * cs / 2), oy = Math.round(cy - SH * cs / 2);
  return { x: ox + 4 * cs, y: oy + 8 * cs, w: 2 * cs, h: 2 * cs, cx: ox + 5 * cs, cy: oy + 9 * cs };
}
// le pouce qui fait défiler (P01) ou qui appuie (P06) : une case du corps posée sur l'écran
const POUCE = calque(8, ['.....B.....']);
// le fil qui défile dans ses mains : une publication passe toutes les 0,6 s (l'écran tremble, la lueur bat)
const PAS_FIL = .6;
const battement = t => { const u = ((t % PAS_FIL) + PAS_FIL) % PAS_FIL; return Math.exp(-u * 8); };
// La scène de nuit. o : {
//   noir (0..1 : le noir posé sur le fond), revele (0..1 : il sort du noir), ecranA (l'écran seul, avant lui),
//   lueur (0..1), defile (true : le fil passe, l'écran tremble, le pouce glisse), ecran (1 LABO, 2 LAITON, 0 éteint),
//   reflet (true : LABO ; ou { bas: true, couleurs: [g, d] }), appui (true : le pouce sur l'écran), fixe, cible (ce qu'il
//   regarde quand fixe, à l'écran : son propre centre, il regarde droit devant lui, vers nous) }
// Rend { c, z, cs, E } (son centre, l'échelle, la case, l'écran du téléphone) : pour poser ce qui l'entoure.
export function nuitScene(ctx, t, cam, o = {}) {
  const { noir: an = 0, revele = 1, ecranA = 1, lueur: aL = 1, defile = false, ecran = 1, reflet = true } = o;
  fond(ctx, t, FOND_NUIT);
  noir(ctx, an);
  const c = cam.ecran(0, 0), z = cam.z, cs = 4 * z, E = ecranTel(c.x, c.y, cs);
  const b = defile ? battement(t) : 0;
  const col = ecran === 2 ? LAITON : LABO;
  // la lueur du téléphone, derrière lui : elle bat avec le fil
  lueur(ctx, E.cx, E.cy - cs * 1.5, 260 * z / 6, col, .18 * aL * (1 + .35 * b));
  // les couleurs de l'écran dans la nuit (la bleue et la rouge, P06) : deux souffles à peine teintés
  if (typeof reflet === 'object' && reflet.couleurs) {
    lueur(ctx, E.cx - 3 * cs, E.cy - 2 * cs, 160 * z / 6, reflet.couleurs[0], .05 * aL);
    lueur(ctx, E.cx + 3 * cs, E.cy - 2 * cs, 160 * z / 6, reflet.couleurs[1], .05 * aL);
  }
  // le pouce : quand le fil passe, il glisse sur l'écran une fraction de seconde ; quand il appuie, il y reste
  const u = ((t % PAS_FIL) + PAS_FIL) % PAS_FIL, pouce = o.appui || (defile && u > PAS_FIL - .14);
  // Le sujet est peint à part, puis éclairé : la seule lumière est le téléphone. Le visage et les mains la prennent,
  // le haut de la tête et les jambes restent dans l'ombre (une ombre posée sur lui seul, « source-atop »).
  const S = calqueSujet(), m = S.canvas.width / 2, bx = Math.round(c.x) - m, by = Math.round(c.y) - m;
  S.setTransform(1, 0, 0, 1, 0, 0); S.globalCompositeOperation = 'source-over'; S.globalAlpha = 1; S.clearRect(0, 0, 2 * m, 2 * m);
  S.imageSmoothingEnabled = false;
  dessineSujet(S, N, c.x - bx, c.y - by, cs, {
    col: GRIS_FIG, mode: 'nuit', ecran, reflet, fixe: o.fixe, cible: o.cible && { x: o.cible.x - bx, y: o.cible.y - by },
    extra: pouce ? [POUCE] : null, extraCle: pouce ? 'pouce' : undefined,
  }, t);
  S.globalCompositeOperation = 'source-atop';
  const lx = E.cx - bx, ly = E.cy - by;
  const ombre = S.createRadialGradient(lx, ly - 2.2 * cs, 1.2 * cs, lx, ly - 2.2 * cs, 7.5 * cs);
  ombre.addColorStop(0, 'rgba(6,7,12,0)'); ombre.addColorStop(.55, 'rgba(6,7,12,.28)'); ombre.addColorStop(1, 'rgba(6,7,12,.62)');
  S.fillStyle = ombre; S.fillRect(0, 0, 2 * m, 2 * m);
  const jambes = S.createLinearGradient(0, ly + .6 * cs, 0, ly + 3 * cs);
  jambes.addColorStop(0, 'rgba(6,7,12,0)'); jambes.addColorStop(1, 'rgba(6,7,12,.5)');
  S.fillStyle = jambes; S.fillRect(0, ly, 2 * m, 2 * m);
  const teinte = S.createRadialGradient(lx, ly - cs, 0, lx, ly - cs, 4.5 * cs);
  teinte.addColorStop(0, rgba(col, .22 * aL * (1 + .4 * b))); teinte.addColorStop(1, rgba(col, 0));
  S.fillStyle = teinte; S.fillRect(0, 0, 2 * m, 2 * m);
  ctx.globalAlpha = revele; ctx.drawImage(S.canvas, bx, by); ctx.globalAlpha = 1;
  // l'écran, qui se voit avant lui dans le noir, et qui tremble à chaque publication
  if (ecran && ecranA > 0) {
    const ea = Math.max(ecranA * (1 - revele), 0);
    if (ea > 0) { ctx.globalAlpha = ea; ctx.fillStyle = col; ctx.fillRect(E.x, E.y, E.w, E.h); }
    if (defile) {
      ctx.save(); ctx.beginPath(); ctx.rect(E.x, E.y, E.w, E.h); ctx.clip();
      // trois lignes du fil qui montent vite au passage d'une publication, puis se posent
      const k = eOut(clamp(u / .3));
      ctx.globalAlpha = ecranA * .55; ctx.fillStyle = mix(col, NUIT, .55);
      for (let i = 0; i < 3; i++) {
        const yy = E.y + E.h * (((i * .34 + .2 - k * .34) % 1 + 1) % 1);
        ctx.fillRect(E.x + cs * .25, Math.round(yy), E.w * (i === 1 ? .5 : .75), Math.max(2, Math.round(cs * .12)));
      }
      ctx.globalAlpha = ecranA * .4 * b; ctx.fillStyle = CRAIE; ctx.fillRect(E.x, E.y, E.w, E.h);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
  return { c, z, cs, E };
}
// « 23:41 » : l'heure, à sa droite (IBM Plex Mono 18 px, GRIS)
function horloge(ctx, a, txt = HEURE) {
  if (a <= 0) return;
  ctx.globalAlpha = a; ctx.font = `18px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(txt, 1180, 300); ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- P01 · 0,0–6,0 · Quelqu'un ne dort pas
// Noir. 0,3 : une lueur LABO monte (le téléphone) ; l'écran se voit seul dans le noir. 0,9 : il sort du noir,
// éclairé d'en bas. Le fil passe toutes les 0,6 s. Pas d'œil de Phi : on est chez lui. Recul ×6 → ×5,4.
function dessineP01(ctx, t, cam) {
  nuitScene(ctx, t, cam, {
    noir: 1 - eIO(seg(t, .9, 3.2)), revele: eIO(seg(t, .9, 2.4)), ecranA: seg(t, .3, .6),
    lueur: eOut(seg(t, .3, 1.4)), defile: t > .6, ecran: 1, reflet: true,
  });
  horloge(ctx, eIO(seg(t, 1.8, 2.8)));
}

// ================================================================ Phi au laboratoire (P02–P04) : un seul œil, un seul regard
// La place de l'œil : (960, 360, 260) à l'accueil ; (650, 160, 160) quand la foule est là (index.html) ; (250, 420, 200)
// à gauche du carnet. Un seul regard (creeRegard) du titre au carnet : la pupille ne saute pas d'un plan à l'autre.
const PLACES = [
  [6.0, { x: 960, y: 360, s: 260 }],
  [9.4, { x: 960, y: 360, s: 260 }],
  [10.4, { x: 650, y: 160, s: 160 }],
  [18.6, { x: 650, y: 160, s: 160 }],
  [19.4, { x: 250, y: 420, s: 200 }],
];
const placeOeil = t => cles(t, PLACES);

// ---------------------------------------------------------------- la foule de démonstration (P03, P04)
// Les cent sujets de démonstration (DEMO : pas des participants, coiffes par hache((i + 100)·7 + 3)), aux places
// d'index.html. Ils arrivent comme fouleMontre (9,8 s + r1·1,4, en eBack) et lèvent les yeux vers Phi.
const ARRIVEE = 9.8;
const taDe = f => ARRIVEE + f.r1 * 1.4;
const PAR_ARRIVEE = [...DEMO].sort((a, b) => a.r1 - b.r1);
const visage = f => ({ x: f.cx, y: f.cy - 12 });
function dernierArrive(T) {
  let best = null;
  for (const f of PAR_ARRIVEE) { if (taDe(f) <= T) best = f; else break; }
  return best && T < taDe(best) + 2.2 ? visage(best) : null;
}
// les « ? » des dilemmes : un sujet, puis un autre, puis dix (des places réparties dans la foule)
const Q_SUJETS = [27, 72, 5, 41, 56, 18, 63, 90, 33, 84, 49, 97];
const Q_RANG = new Map(Q_SUJETS.map((i, j) => [i, j]));
const instantQ = j => { const d = rep().dilemmes; return j === 0 ? d : j === 1 ? d + .45 : d + .9 + (j - 2) * .07; };
const FIN_Q = () => rep().note - 1.2;   // ils s'éteignent pendant « Je ne juge pas »
function questionRecente(T) {
  let best = null;
  for (let j = 2; j < Q_SUJETS.length; j++) if (instantQ(j) <= T) best = DEMO[Q_SUJETS[j]];
  return best && visage(best);
}
// dessine la foule. phi : l'œil (dans le repère de la foule) ; pose : où le regard de Phi s'est posé ; dim : l'éclairage
function foule(ctx, t, phi, pose, dim = 1) {
  const reflet = cligne(t) > .5;   // le reflet de Phi quitte leurs yeux quand il cligne
  const finQ = FIN_Q();
  for (const f of DEMO) {
    const ta = taDe(f), sc = eBack(seg(t, ta, ta + .45));
    if (sc <= .01) continue;
    let fixe = t > ta + .45 && t < ta + 1.6, cible = phi;
    if (pose) {                // Phi le regarde : il lui rend son regard, puis ses voisins
      const v = Math.hypot(f.cx - pose.x, f.cy - 12 - pose.y);
      if (v < 60 && t > pose.t + .15 + v / 160) fixe = true;
    }
    const j = Q_RANG.get(f.i);
    if (j !== undefined && t >= instantQ(j) + .25 && t < finQ + .2) {   // perplexe : il cherche ses voisins des yeux
      fixe = true; cible = { x: f.cx + (Math.floor((t - instantQ(j)) / .8 + f.r2 * 2) % 2 ? 80 : -80), y: f.cy };
    }
    dessineSujet(ctx, f, f.cx, f.cy, 4 * sc, { col: GRIS_FIG, a: .82 * dim, phi, cible, fixe, reflet }, t);
  }
  // les « ? » (DotGothic16, GRIS), au-dessus des têtes, comme les coches d’index.html ; 18 px plutôt que 14 : à 14 px, ils
  // disparaissent dans une vidéo
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  Q_SUJETS.forEach((i, j) => {
    const t0 = instantQ(j); if (t < t0) return;
    const k = eBack(seg(t, t0, t0 + .3)), a = dim * Math.min(1, seg(t, t0, t0 + .15)) * (1 - seg(t, finQ, finQ + .4));
    if (a <= 0 || k <= 0) return;
    const f = DEMO[i];
    ctx.globalAlpha = a; ctx.font = `${Math.max(1, Math.round(18 * k))}px ${PIX}`; ctx.fillStyle = GRIS;
    ctx.fillText("?", f.cx, f.cy - 33);
  });
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- le carnet en page (P04)
// Il part du coin (1290, 40, 570 : la surimpression le tient de 17,3 à 18,6) et grandit jusqu'à la page (980 × 520 en
// (470, 150)) en 0,6 s ; très lente poussée ×1 → ×1,04 ; 26,0–26,6 il revient au coin et s'efface.
const POUSSEE = { x: 960, y: 410 };
function etatCarnet(t) {
  const k = eIO(seg(t, 18.6, 19.2)) * (1 - eIO(seg(t, 26.0, 26.6)));
  const S = cles(t, [[19.2, 1], [26.0, 1.04, lin], [26.6, 1]]);
  return { k, S, a: 1 - seg(t, 26.38, 26.6) };
}
const optionsCarnet = (t, E) => ({ textes: CARNET, notes: [NOTES[0]], k: E.k, a: E.a, hypothese: rep().hypothese, commeMoi: rep().commeMoi });
// où écrit la plume de la page, à l'écran (poussée comprise) ; null quand elle n'écrit pas
function plumePage(T) {
  if (T < 18.6 || T >= 26.6) return null;
  const E = etatCarnet(T), r = carnet(sonde(), T, { ...optionsCarnet(T, E), a: 1 });
  return r.plume && { x: POUSSEE.x + (r.plume.x - POUSSEE.x) * E.S, y: POUSSEE.y + (r.plume.y - POUSSEE.y) * E.S };
}
const centrePage = T => { const E = etatCarnet(T), R = { x: lerp(1290, 470, E.k), y: lerp(40, 150, E.k), w: lerp(570, 980, E.k), h: lerp(140, 520, E.k) }; return { x: R.x + R.w / 2, y: R.y + R.h * .4 }; };
// la plume du carnet du coin (la note 0001, que la surimpression écrit à 17,5) : la même fonction, au coin
function plumeCoin(T) {
  if (T < NOTES[0].t || T > NOTES[0].t + 1) return null;
  return carnet(sonde(), T, { textes: CARNET, notes: [NOTES[0]], k: 0, a: 1 }).plume;
}

// ---------------------------------------------------------------- le regard et les humeurs de Phi (P02–P04)
let LABO_PHI = null;
function phiLabo() {
  if (LABO_PHI) return LABO_PHI;
  const R = rep();
  const humeurs = [
    [6.95, 'grand', .4], [7.85, 'neutre', .6],                  // « Bonjour. » : la machine s'allume
    [R.morale - .05, 'curieux'], [R.morale + 1.1, 'neutre'],    // « morale »
    [R.propre + .1, 'plisse'], [R.propre + 1.2, 'neutre'],     // « C'est plus propre. »
    [R.regle, 'grand'], [R.regle + 1.15, 'neutre', .7],         // « vite réglé »
  ];
  const regard = creeRegard({
    cibles: [
      [6.0, .95, VOUS],
      [6.95, .65, point(960, 610)],                                     // les caractères qui se posent sous lui
      [7.6, 1.2, VOUS],                                                 // « Je suis Phi »
      [8.8, .6, T => titreCentre(T), .12],                              // son titre qui glisse au coin
      [9.4, .5, VOUS],
      [9.95, 1.05, dernierArrive, .25],                                 // la foule arrive : il la regarde arriver
      [R.morale - .05, 1.15, VOUS],                                     // « votre morale »
      [R.dilemmes, .45, visage(DEMO[Q_SUJETS[0]])],                     // un « ? »…
      [R.dilemmes + .45, .45, visage(DEMO[Q_SUJETS[1]])],               // … un autre…
      [R.dilemmes + .9, .75, questionRecente, .1],                      // … dix : il les regarde tour à tour
      [R.propre + .15, 1.1, VOUS],                                      // « C'est plus propre », à vous
      [16.2, R.note - 16.2, VOUS],                                      // « Je ne juge pas »
      [R.note, .9, T => plumeCoin(T), .15],                             // « je note » : il regarde le carnet écrire
      [18.6, .6, centrePage, .15],                                      // le carnet qui grandit
      [19.2, .9, VOUS],                                                 // « Mon hypothèse »
      [R.hypothese - .1, 1.1, plumePage, .1],                           // il suit sa plume
      [R.hypothese + 1.0, .5, VOUS],
      [R.hypothese + 1.5, .7, point(700, 320)],                         // il relit son hypothèse, content
      [R.commeMoi - .1, .7, plumePage, .1],                             // « (comme moi) »
      [R.commeMoi + .6, 3.4, VOUS],                                     // « Ça devrait être vite réglé. »
      [26.0, .3, centrePage, .12],                                      // le carnet repart au coin…
      [26.28, .4, point(1180, 900)],                                    // … et il baisse les yeux vers le bas à droite
    ],
    repos: [[3, VOUS], [2, T => (T > 10.6 && T < 18.4 ? visage(DEMO[Math.floor(hache(Math.floor(T / .9) * 37 + 5) * 100)]) : null)], [1.2, T => plume(T)]],
  });
  LABO_PHI = { humeurs, regard };
  return LABO_PHI;
}
// l'état de l'œil à l'instant t : sa place, son humeur, son regard (calculé une fois, pour la foule et pour l'œil)
function etatPhi(t) {
  const L = phiLabo(), O = placeOeil(t), h = humeur(t, L.humeurs), ey = O.y + flotte(t);
  const g = L.regard.pupille(t, O.x, ey, h.r);
  return { O, h, g, centre: { x: O.x, y: ey } };
}
function dessinePhi(ctx, t, P, o = {}) {
  oeil(ctx, t, { x: P.O.x, y: P.O.y, taille: P.O.s, humeur: P.h, regard: P.g, ...o });
}

// ================================================================ P02 · 6,0–9,4 · Titre
// « XPHI » en DotGothic16 176 px : ses points (une case de la police = 11 px) sont relevés une fois dans une toile, à
// leurs centres ; chacun arrive des bords en caractère (01·:+*#%xφ) et se pose en carré de craie. « philosophie
// expérimentale » se décode lettre à lettre. 8,8–9,4 : le tout rétrécit et glisse au cartouche (48, 40), où la
// surimpression le reprend à 9,4 : « XPHI » en laiton, « PHILOSOPHIE EXPÉRIMENTALE » en craie.
const TF = 176, TD = TF / 16;                 // la taille du titre ; une case de la police
const TITRE_Y = 606;                          // le centre du mot, sous l'œil
const SOUS = 'philosophie expérimentale', SOUS_Y = 728, SOUS_SP = 6;
let TITRE = null;
function titre() {
  if (TITRE) return TITRE;
  const LW = 480, LH = 260, ox = 30, base = 200, c = toile(LW, LH), g = c.getContext('2d', { willReadFrequently: true });
  g.font = `${TF}px ${PIX}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = '#fff';
  g.fillText('XPHI', ox, base);
  const d = g.getImageData(0, 0, LW, LH).data, A = (x, y) => d[(Math.round(y) * LW + Math.round(x)) * 4 + 3] || 0;
  // le pas de la grille de la police : on cherche le décalage où les centres des cases tombent net (tout ou rien)
  const flou = (dx, dy) => { let s = 0; for (let y = dy + TD / 2; y < LH; y += TD) for (let x = dx + TD / 2; x < LW; x += TD) { const a = A(x, y); s += Math.min(a, 255 - a); } return s; };
  let best = [0, 0], bf = Infinity;
  for (let dy = 0; dy < TD; dy += .5) for (let dx = 0; dx < TD; dx += .5) { const f = flou(dx, dy); if (f < bf) { bf = f; best = [dx, dy]; } }
  const pts = [];
  for (let y = best[1] + TD / 2; y < LH; y += TD) for (let x = best[0] + TD / 2; x < LW; x += TD) if (A(x, y) > 127) pts.push({ x: x - ox, y: y - base });
  const x0 = Math.min(...pts.map(p => p.x)), x1 = Math.max(...pts.map(p => p.x)), y0 = Math.min(...pts.map(p => p.y)), y1 = Math.max(...pts.map(p => p.y));
  // l'origine du texte à l'écran : le mot centré en x 960, son milieu en TITRE_Y
  const O = { x: 960 - (x0 + x1) / 2, y: TITRE_Y - (y0 + y1) / 2 };
  const T = {
    O, x0, x1, y0, y1,
    pts: pts.map((p, k) => {
      const h1 = hache(k * 7 + 1), h2 = hache(k * 13 + 5), h3 = hache(k * 29 + 11), ang = h3 * Math.PI * 2;
      const u = (p.x - x0) / Math.max(1, x1 - x0);
      return {
        ...p, h1, h2,
        ta: 6.42 + .5 * u + .32 * h1,            // le départ (de gauche à droite, un peu au hasard)
        dur: .48 + .22 * h2,                     // le vol
        sx: 960 + Math.cos(ang) * 1250, sy: 560 + Math.sin(ang) * 820,   // venus des bords
        sw: (h2 - .5) * 520, g: Math.floor(h1 * G.length), fl: 8 + h3 * 10,
      };
    }),
  };
  const pret = typeof document === 'undefined' || !document.fonts || document.fonts.check(`${TF}px "DotGothic16"`);
  if (pret) TITRE = T;   // une mémoire de calcul, seulement quand la police est là
  return T;
}
// les deux places du mot : le grand titre (origine T.O, ×1), et le cartouche (DotGothic16 24 px en (70, 74), ×24/176).
// Le glissement (8,8–9,3) emporte le mot d'un bloc : l'origine glisse, l'échelle se resserre (en log), chaque point
// frémit à peine en route.
const CART_X = CARTOUCHE.x + 22, CART_Y1 = CARTOUCHE.y + 34, CART_Y2 = CARTOUCHE.y + 68, CART_S = 24 / TF;
const kGlisse = t => eIO(seg(t, 8.8, 9.3));
const blocTitre = (Ti, k) => ({ x: lerp(Ti.O.x, CART_X, k), y: lerp(Ti.O.y, CART_Y1, k), s: Math.exp(lerp(0, Math.log(CART_S), k)) });
function titreCentre(T) {
  const Ti = titre(), B = blocTitre(Ti, kGlisse(T));
  return { x: B.x + (Ti.x0 + Ti.x1) / 2 * B.s, y: B.y + (Ti.y0 + Ti.y1) / 2 * B.s };
}
function dessineTitre(ctx, t) {
  const Ti = titre();
  const [haut, bas] = CARTOUCHES.titre;
  if (t >= 9.34) { cartouche(ctx, haut, bas, 1); return; }   // la surimpression le tient dès 9,4 : la même image
  const kG = kGlisse(t), B = blocTitre(Ti, kG);
  // les mesures du sous-titre : en minuscules espacées (Plex 28), puis la 2e ligne du cartouche (DotGothic16 24)
  ctx.font = `28px ${MONO}`;
  const ws = [...SOUS].map(ch => ctx.measureText(ch).width), tot = ws.reduce((a, b) => a + b, 0) + SOUS_SP * (ws.length - 1);
  ctx.font = `24px ${PIX}`;
  const w1 = ctx.measureText(bas).width;
  const bx = lerp(960 - tot / 2, CART_X, kG), by = lerp(SOUS_Y, CART_Y2, kG);
  const sMin = Math.exp(lerp(0, Math.log(w1 / tot), kG)), sMaj = sMin * tot / w1;
  // le cadre du cartouche : il se referme autour du titre (8,5–8,8), puis l'emporte au coin, toujours ajusté à lui ;
  // à la fin, exactement le cartouche (48, 40, largeurCartouche × 84)
  const aC = eOut(seg(t, 8.45, 8.8));
  if (aC > 0) {
    const wc = largeurCartouche(ctx, haut, bas);
    const boite = k => {
      const b = blocTitre(Ti, k), sm = Math.exp(lerp(0, Math.log(w1 / tot), k)), xs = lerp(960 - tot / 2, CART_X, k);
      return { l: Math.min(b.x + Ti.x0 * b.s, xs) - TD * b.s / 2, r: Math.max(b.x + Ti.x1 * b.s + TD * b.s / 2, xs + tot * sm), h: b.y + Ti.y0 * b.s - TD * b.s / 2, b: lerp(SOUS_Y, CART_Y2, k) };
    };
    const F = boite(1), m1 = { l: F.l - CARTOUCHE.x, r: CARTOUCHE.x + wc - F.r, h: F.h - CARTOUCHE.y, b: CARTOUCHE.y + CARTOUCHE.h - F.b };
    const Bk = boite(kG), ouvre = 1 + .35 * (1 - aC);
    const m = { l: lerp(64, m1.l, kG) * ouvre, r: lerp(64, m1.r, kG) * ouvre, h: lerp(34, m1.h, kG) * ouvre, b: lerp(30, m1.b, kG) * ouvre };
    fenetre(ctx, Bk.l - m.l, Bk.h - m.h, Bk.r - Bk.l + m.l + m.r, Bk.b - Bk.h + m.h + m.b, aC);
    ctx.globalAlpha = 1;
  }
  // « XPHI » : les points
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const p of Ti.pts) {
    const q = seg(t, p.ta, p.ta + p.dur);
    if (q <= 0) continue;
    const A = { x: Ti.O.x + p.x, y: Ti.O.y + p.y };
    if (q < 1) {             // en vol : un caractère qui change, du labo à la craie, sur une courbe
      const e = eOut(q), dx = A.x - p.sx, dy = A.y - p.sy, L = Math.hypot(dx, dy) || 1, s = Math.sin(Math.PI * e) * p.sw;
      const x = p.sx + dx * e - dy / L * s, y = p.sy + dy * e + dx / L * s;
      ctx.globalAlpha = Math.min(1, q * 3) * .95; ctx.fillStyle = mix(LABO, CRAIE, e);
      ctx.font = `${Math.round(lerp(34, 15, e))}px ${MONO}`;
      ctx.fillText(G[(p.g + Math.floor(t * p.fl)) % G.length], x, y);
      continue;
    }
    // posé : un carré de craie (une case de la police, un fil de nuit entre deux), un éclair LABO en se posant ;
    // puis le mot glisse d'un bloc au cartouche, où les cases se touchent et virent au laiton
    const fr = Math.sin(Math.PI * kG) * 3, s = (TD - 1.6 * (1 - kG)) * B.s;
    const x = B.x + p.x * B.s + (p.h1 - .5) * fr, y = B.y + p.y * B.s + (p.h2 - .5) * fr;
    const fl = 1 - seg(t, p.ta + p.dur, p.ta + p.dur + .35), sc = 1 + .5 * fl;
    ctx.globalAlpha = 1; ctx.fillStyle = kG > 0 ? mix(CRAIE, LAITON, kG) : fl > 0 ? mix(CRAIE, LABO, fl * .8) : CRAIE;
    ctx.fillRect(x - s * sc / 2, y - s * sc / 2, s * sc, s * sc);
  }
  // « philosophie expérimentale » : décodé lettre à lettre (7,6–8,2), puis il devient la deuxième ligne du cartouche
  const aMin = 1 - seg(kG, .3, .75), aMaj = seg(kG, .3, .8);
  if (aMin > 0) {
    ctx.save(); ctx.translate(bx, by); ctx.scale(sMin, sMin);
    ctx.font = `28px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    let cx = 0;
    [...SOUS].forEach((ch, j) => {
      const tj = 7.6 + j * (.55 / SOUS.length);
      if (t >= tj && ch !== ' ') {
        const dec = t < tj + .1;   // un caractère de la machine, puis la lettre
        ctx.globalAlpha = aMin * (dec ? .9 : 1); ctx.fillStyle = dec ? LABO : GRIS;
        ctx.fillText(dec ? G[(j * 3 + Math.floor(t * 30)) % G.length] : ch, cx, 0);
      }
      cx += ws[j] + SOUS_SP;
    });
    ctx.restore();
  }
  if (aMaj > 0) {
    ctx.save(); ctx.translate(bx, by); ctx.scale(sMaj, sMaj);
    ctx.globalAlpha = aMaj; ctx.font = `24px ${PIX}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = CRAIE;
    ctx.fillText(bas, 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
function dessineP02(ctx, t) {
  fond(ctx, t, { sol: 1 });
  noir(ctx, 1 - eIO(seg(t, 6.0, 6.6)));
  // la lueur de l'œil sur la salle, quand il s'allume (« Bonjour »)
  const P = etatPhi(t);
  lueur(ctx, 960, 360, 420, LABO, .05 * seg(t, 6.3, 7.0) * (1 + 1.2 * cloche(t, 6.9, 7.3, 7.6, 8.2)));
  dessineTitre(ctx, t);
  dessinePhi(ctx, t, P, { alpha: eIO(seg(t, 6.0, 6.4)), ouvert: eIO(seg(t, 6.3, 7.0)) });
}

// ================================================================ P03 · 9,4–18,6 · Le laboratoire
function dessineP03(ctx, t) {
  fond(ctx, t, { sol: lerp(1, .45, eIO(seg(t, ARRIVEE, ARRIVEE + 1))) });
  const P = etatPhi(t);
  foule(ctx, t, P.centre, P.g.pose);
  dessinePhi(ctx, t, P);
}

// ================================================================ P04 · 18,6–26,6 · Le carnet
function dessineP04(ctx, t) {
  fond(ctx, t, { sol: .45 });
  const E = etatCarnet(t), P = etatPhi(t);
  // la poussée lente, autour du carnet : la foule (assombrie à 30 %) et la page
  ctx.save();
  ctx.translate(POUSSEE.x, POUSSEE.y); ctx.scale(E.S, E.S); ctx.translate(-POUSSEE.x, -POUSSEE.y);
  const phi = { x: POUSSEE.x + (P.centre.x - POUSSEE.x) / E.S, y: POUSSEE.y + (P.centre.y - POUSSEE.y) / E.S };
  foule(ctx, t, phi, null, lerp(1, .3, eIO(seg(t, 18.6, 19.2))));
  carnet(ctx, t, optionsCarnet(t, E));
  ctx.restore();
  // une ombre douce derrière l'œil : il se détache de la foule quand il vient à gauche du carnet
  const kO = eIO(seg(t, 18.7, 19.4));
  if (kO > 0) {
    const g = ctx.createRadialGradient(P.O.x, P.centre.y, P.O.s * .3, P.O.x, P.centre.y, P.O.s * 1.05);
    g.addColorStop(0, `rgba(12,11,13,${.85 * kO})`); g.addColorStop(1, 'rgba(12,11,13,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(P.O.x - P.O.s * 1.1, P.centre.y - P.O.s * 1.1, P.O.s * 2.2, P.O.s * 2.2);
  }
  dessinePhi(ctx, t, P);
}

// ================================================================ P05, P06 : le téléphone du N°48 et son fil
// L'insert : x 770–1150, y 50–810. Le fil en gris et craie seulement (une recette, deux chats, des barres de texte,
// des compteurs) pour que la publication de Phi, seule en couleur, saute aux yeux. Aucun logo, aucune charte : on dit
// « les réseaux d'Arte », on ne les dessine pas.
const TEL = { x: 770, y: 50, w: 380, h: 760 };
const ECRAN = { x: 790, y: 104, w: 340, h: 652 };
const VUE = { x: 790, y: 136, w: 340, h: 620 };          // le fil, sous la barre d'état
const SOMBRE = '#0b0a0d', CARTE = '#121015', OMBRE_FIG = mix(GRIS_FIG, NUIT, .45), CLAIR_FIG = mix(GRIS_FIG, CRAIE, .4);
// un rectangle aux coins arrondis en escalier (des cases de c px) : un téléphone dessiné en pixels
function cheminPixel(ctx, x, y, w, h, r, c = 4) {
  const n = Math.max(1, Math.round(r / c)), ins = [];
  for (let j = 0; j < n; j++) { const dy = r - (j + .5) * c; ins.push(Math.round((r - Math.sqrt(Math.max(0, r * r - dy * dy))) / c) * c); }
  ctx.beginPath(); ctx.moveTo(x + ins[0], y);
  for (let j = 0; j < n; j++) { ctx.lineTo(x + w - ins[j], y + j * c); ctx.lineTo(x + w - ins[j], y + (j + 1) * c); }
  for (let j = n - 1; j >= 0; j--) { ctx.lineTo(x + w - ins[j], y + h - (j + 1) * c); ctx.lineTo(x + w - ins[j], y + h - j * c); }
  for (let j = 0; j < n; j++) { ctx.lineTo(x + ins[j], y + h - j * c); ctx.lineTo(x + ins[j], y + h - (j + 1) * c); }
  for (let j = n - 1; j >= 0; j--) { ctx.lineTo(x + ins[j], y + (j + 1) * c); ctx.lineTo(x + ins[j], y + j * c); }
  ctx.closePath();
}
// des images en cases (13 × 12, à la manière des sujets) : les chats, en GRIS_FIG. B le pelage, O l'ombre (le nez, les
// rayures), E l'œil ; la queue (deux images) bat doucement ; des moustaches d'un pixel.
const CHATS = [
  {   // assis, de face
    l: ['..B.....B....', '..BB...BB....', '..BBBBBBB....', '.BBEBBBEBB...', '.BBBBOBBBB...', '..BBBBBBB....', '...BBBBB.....', '..BBBBBBB....', '.BBBBBBBBB...', '.BBBBBBBBB...', '.BBBBBBBBBB..', '..BB.BB.BB...'],
    queue: [[[10, 9], [11, 8], [11, 7]], [[10, 9], [11, 9], [12, 8]]], nez: [5, 4], larg: 10,
  },
  {   // couché en pain, la tête à gauche
    l: ['.............', '.............', '.............', '.B...B.......', '.BBBBB.......', 'BEBBBEB......', 'BBBOBBBBBBBB.', 'BBBBBBBBBBBBB', '.BBBBBBBBBBBB', '.BBBBBBBBBBBB', '..BBBBBBBBBB.', '.............'],
    queue: [[[9, 11], [10, 11], [11, 11], [12, 11]], [[9, 11], [10, 11], [11, 11], [12, 10]]], nez: [3, 6], larg: 13,
  },
  {   // assis, rayé (le troisième, aperçu quand le fil dépasse la publication de Phi)
    l: ['....B.....B..', '....BB...BB..', '....BOBOBOB..', '...BBEBBBEBB.', '...BBBBOBBBB.', '....BBBBBBB..', '.....BOBOB...', '....BBBBBBB..', '...BOBOBOBOB.', '...BBBBBBBBB.', '...BBBBBBBBB.', '....BB.BB.BB.'],
    queue: [[[2, 10], [1, 9], [1, 8]], [[2, 10], [1, 10], [0, 9]]], nez: [7, 4], larg: 13,
  },
];
function chat(ctx, t, i, x, y, c) {
  const C = CHATS[i], q = Math.floor(t * 2.2 + i) % 2, ferme = ((t + i * 1.7) % 3.1) < .14;
  C.l.forEach((ligne, j) => [...ligne].forEach((ch, k) => {
    if (ch === '.') return;
    ctx.fillStyle = ch === 'B' ? GRIS_FIG : ch === 'O' ? OMBRE_FIG : ch === 'E' ? (ferme ? OMBRE_FIG : SOMBRE) : CLAIR_FIG;
    ctx.fillRect(x + k * c, y + j * c, c, c);
    if (ch === 'E' && !ferme) { ctx.fillStyle = CRAIE; ctx.fillRect(x + k * c + c * .55, y + j * c + c * .2, c * .3, c * .3); }
  }));
  ctx.fillStyle = GRIS_FIG;
  for (const [k, j] of C.queue[q]) ctx.fillRect(x + k * c, y + j * c, c, c);
  // les moustaches, de part et d'autre du nez
  const [nx, ny] = C.nez, cy = y + (ny + .5) * c;
  ctx.globalAlpha = .7; ctx.fillStyle = CLAIR_FIG;
  for (const s of [-1, 1]) for (const d of [-.25, .25]) {
    const x0 = x + (nx + .5) * c + s * 2.4 * c;
    ctx.fillRect(Math.min(x0, x0 + s * 2.2 * c), cy + d * c * 1.6, 2.2 * c, 1.5);
  }
  ctx.globalAlpha = 1;
}
// un avatar quelconque : un motif symétrique de 5 × 5 cases, en gris (personne en particulier)
function avatar(ctx, x, y, n, s = 30) {
  const c = s / 5;
  ctx.fillStyle = '#26232a'; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = mix(GRIS, NUIT, .25);
  for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (hache(n * 41 + j * 3 + i) < .5) { ctx.fillRect(x + i * c, y + j * c, c, c); ctx.fillRect(x + (4 - i) * c, y + j * c, c, c); }
}
function entete(ctx, x, y, n) {
  avatar(ctx, x + 16, y + 16, n);
  ctx.fillStyle = mix(GRIS, NUIT, .1); ctx.fillRect(x + 56, y + 19, 70 + Math.round(hache(n * 5 + 1) * 60), 9);
  ctx.fillStyle = '#3e3a37'; ctx.fillRect(x + 56, y + 35, 46 + Math.round(hache(n * 5 + 2) * 30), 7);
}
function barres(ctx, x, y, w, n, graine) {
  ctx.fillStyle = '#4e4943';
  for (let i = 0; i < n; i++) { const f = i === n - 1 ? .35 + .3 * hache(graine + i) : .72 + .26 * hache(graine + i); ctx.fillRect(x, y + i * 18, Math.round(w * f), 8); }
}
function compteur(ctx, x, y, n) {
  ctx.font = `14px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(`· ${nombre(n)}`, x, y);
}
// le fil : ses publications, de haut en bas (h : la hauteur ; la publication de Phi est la 10e)
const FIL = (() => {
  const L = [
    { type: 'texte', h: 200, n: 4, c: 214 }, { type: 'recette', h: 330, c: 2041 }, { type: 'texte', h: 160, n: 3, c: 87 },
    { type: 'chat', h: 330, chat: 0, c: 12408 }, { type: 'chat', h: 330, chat: 1, c: 31977 }, { type: 'texte', h: 200, n: 4, c: 1203 },
    { type: 'texte', h: 150, n: 2, c: 56 }, { type: 'image', h: 300, c: 640 }, { type: 'texte', h: 180, n: 3, c: 318 },
    { type: 'phi', h: 350 }, { type: 'texte', h: 200, n: 4, c: 731 }, { type: 'chat', h: 330, chat: 2, c: 8841 },
    { type: 'texte', h: 200, n: 4, c: 95 },
  ];
  let y = 0;
  return Object.freeze(L.map((it, i) => { const o = Object.freeze({ ...it, i, y }); y += it.h + 2; return o; }));
})();
const PHI_FIL = FIL.findIndex(it => it.type === 'phi');
const centreFil = i => FIL[i].y + FIL[i].h / 2 - VUE.h / 2;
// le défilement : des coups de pouce (eOut : l'élan, puis l'inertie), de plus en plus espacés ; à 30,8 le fil dépasse
// la publication de Phi, revient et s'y arrête, avec un petit rebond
const DEFIL = [
  [26.15, centreFil(0) - 260],
  [27.0, centreFil(1), eOut],                  // une recette
  [27.4, centreFil(1) + 22, lin],
  [27.85, centreFil(3), eOut],                 // un chat
  [28.2, centreFil(3) + 16, lin],
  [28.65, centreFil(4), eOut],                 // un autre chat
  [29.4, centreFil(4) + 14, lin],
  [29.95, centreFil(5) + 40, eOut],            // le fil ralentit
  [30.15, centreFil(5) + 46, lin],
  [30.6, centreFil(7) - 10, eOut],
  [31.05, centreFil(PHI_FIL + 1) + 30, eOut],  // il dépasse la publication de Phi…
  [31.5, centreFil(PHI_FIL) - 18, eIO],        // … revient…
  [31.72, centreFil(PHI_FIL), eOut],           // … et s'y arrête
];
const defile = t => cles(t, DEFIL);
// les coups de pouce : quand ils partent (pour la touche à l'écran et les tics haptiques)
const COUPS = [26.15, 27.4, 28.2, 29.4, 30.15, 30.6, 31.05];
// la publication de Phi, posée au milieu du fil : sa carte, son avatar (l'œil de Phi, 36 px)
const PHI_CARTE = () => ({ x: ECRAN.x, y: VUE.y + (VUE.h - FIL[PHI_FIL].h) / 2 });
const AVATAR = Object.freeze({ dx: 34, dy: 36, s: 36 });
// l'œil de l'avatar : un clin d'œil (il se ferme à moitié de travers, et se rouvre) sur « presque »
function etatAvatar(t) {
  const k = seg(t, rep().presque, rep().presque + .5), b = Math.sin(Math.PI * k);
  return b > 0 ? { ...HUMEURS.neutre, r: 12.5 * (1 - .95 * b), rot: -16 * b, glow: .35 + .4 * b } : 'neutre';
}
function publicationPhi(ctx, t, x, y, w, it, o) {
  const h = it.h;
  // la seule carte en couleur : un fond à peine LABO, un filet LABO
  ctx.fillStyle = '#0f151d'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = rgba(LABO, .55); ctx.fillRect(x, y, 3, h);
  if (!o.sansAvatar) {
    const b = Math.sin(Math.PI * seg(t, rep().presque, rep().presque + .5));   // le clin d'œil : une petite lueur
    if (b > 0) lueur(ctx, x + AVATAR.dx, y + AVATAR.dy, 60, LABO, .45 * b);
    oeil(ctx, t, { x: x + AVATAR.dx, y: y + AVATAR.dy, taille: AVATAR.s, humeur: etatAvatar(t), flotte: 0 });
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = `22px ${PIX}`; ctx.fillStyle = LABO; ctx.fillText('XPHI', x + 62, y + 38);
  const wx = ctx.measureText('XPHI ').width;
  ctx.font = `14px ${MONO}`; ctx.fillStyle = GRIS; ctx.fillText(`· il y a ${DEPUIS}${NB}min`, x + 62 + wx, y + 37);
  ctx.font = `13px ${MONO}`; ctx.fillStyle = mix(GRIS, NUIT, .25); ctx.fillText('philosophie expérimentale', x + 62, y + 56);
  ctx.font = `22px ${PIX}`; ctx.fillStyle = CRAIE; ctx.fillText(`${CARTOUCHES.test[0]} · ${CARTOUCHES.test[1]}`, x + 16, y + 100);
  // les deux pilules, en petits nuages de caractères
  pilule(ctx, t, 0, { x: x + 88, y: y + 168, ps: .3 });
  pilule(ctx, t, 1, { x: x + w - 88, y: y + 168, ps: .3 });
  // PARTICIPER ▶, cadré de laiton ; enfoncé quand il a appuyé
  const bx = x + 70, by = y + 236, bw = w - 140, bh = 42;
  ctx.globalAlpha = 1;
  if (o.appuye) { ctx.fillStyle = LAITON; ctx.fillRect(bx, by, bw, bh); }
  ctx.strokeStyle = LAITON; ctx.lineWidth = 2; ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
  ctx.font = `20px ${PIX}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = o.appuye ? NUIT : LAITON;
  texteSignes(ctx, 'PARTICIPER ▶', bx + bw / 2, by + bh / 2 + 1);   // ▶ en pixels (commun.js : signe)
  // participants : 47 (puis 48)
  ctx.font = `16px ${MONO}`; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = GRIS;
  const lab = `participants${NB}: `, n = String(o.compte), wl = ctx.measureText(lab + n).width;
  ctx.textAlign = 'left'; ctx.fillText(lab, x + w / 2 - wl / 2, y + 316);
  ctx.fillStyle = o.compte === RANG ? LABO : GRIS; ctx.fillText(n, x + w / 2 - wl / 2 + ctx.measureText(lab).width, y + 316);
}
function publication(ctx, t, it, x, y, w, o) {
  ctx.fillStyle = CARTE; ctx.fillRect(x, y, w, it.h);
  if (it.type === 'phi') { publicationPhi(ctx, t, x, y, w, it, o); return; }
  entete(ctx, x, y, it.i);
  if (it.type === 'texte') { barres(ctx, x + 16, y + 66, w - 32, it.n, it.i * 11); compteur(ctx, x + 16, y + it.h - 18, it.c); return; }
  // une image : un cadre gris, et dedans la recette, un chat, ou un paysage de points
  const ix = x + 16, iy = y + 58, iw = w - 32, ih = 196;
  ctx.fillStyle = '#17151b'; ctx.fillRect(ix, iy, iw, ih);
  ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
  if (it.type === 'recette') {
    // un bol en « # », sa vapeur en « · : » qui monte et ondule
    ctx.font = `16px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const cx = ix + iw / 2, cy = iy + 132;
    [['###############', CRAIE], [' ############# ', GRIS_FIG], ['   #########   ', GRIS_FIG], ['     #####     ', OMBRE_FIG]].forEach(([l, c], j) => { ctx.fillStyle = c; ctx.fillText(l, cx, cy + j * 15); });
    ctx.fillStyle = mix(GRIS, CRAIE, .3); ctx.fillText(': · : · : · :', cx, cy - 14);
    for (let k = 0; k < 14; k++) {
      const ph = hache(k * 17 + 3), u = ((t * .55 + ph) % 1), xx = cx + (k % 7 - 3) * 16 + Math.sin(t * 2.2 + k) * 5 * (1 + u * 2), yy = cy - 26 - u * 92;
      ctx.font = `${k % 3 ? 20 : 17}px ${MONO}`;
      ctx.globalAlpha = Math.sin(Math.PI * u) * .95; ctx.fillStyle = mix(GRIS, CRAIE, .35); ctx.fillText(k % 3 ? '·' : ':', xx, yy);
    }
    ctx.globalAlpha = 1;
  } else if (it.type === 'chat') {
    chat(ctx, t, it.chat, ix + iw / 2 - 58.5, iy + 44, 9);
  } else {
    // un coucher de soleil en points gris, sur une mer de lignes
    ctx.fillStyle = GRIS;
    for (let a = 0; a < 26; a++) { const ang = Math.PI + a / 25 * Math.PI; ctx.fillRect(ix + iw / 2 + Math.cos(ang) * 46 - 1, iy + 118 + Math.sin(ang) * 46 - 1, 3, 3); }
    ctx.fillStyle = '#3e3a37';
    for (let j = 0; j < 5; j++) ctx.fillRect(ix + 20 + j * 9, iy + 128 + j * 13, iw - 40 - j * 18, 3);
  }
  ctx.restore();
  barres(ctx, x + 16, y + 268, w - 32, 1, it.i * 11);
  compteur(ctx, x + 16, y + it.h - 18, it.c);
}
// le téléphone entier (sans caméra : à ses coordonnées d'écran). o : { Y (le défilement), compte, appuye, sansAvatar }
function telephone(ctx, t, o) {
  // le corps : un rectangle aux coins en escalier, double cadre craie et laiton comme les fenêtres
  ctx.globalAlpha = 1;
  cheminPixel(ctx, TEL.x - 7.5, TEL.y - 7.5, TEL.w + 15, TEL.h + 15, 40);
  ctx.strokeStyle = LAITON; ctx.lineWidth = 3; ctx.stroke();
  cheminPixel(ctx, TEL.x, TEL.y, TEL.w, TEL.h, 32);
  ctx.fillStyle = '#141216'; ctx.fill(); ctx.strokeStyle = CRAIE; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#3a363a'; ctx.fillRect(TEL.x + TEL.w / 2 - 30, TEL.y + 24, 60, 6);   // l'écouteur
  ctx.fillRect(TEL.x + TEL.w / 2 + 44, TEL.y + 22, 10, 10);                            // la caméra
  ctx.fillRect(TEL.x + TEL.w / 2 - 56, TEL.y + TEL.h - 22, 112, 5);                    // la barre du bas
  // l'écran
  ctx.save(); ctx.beginPath(); ctx.rect(ECRAN.x, ECRAN.y, ECRAN.w, ECRAN.h); ctx.clip();
  ctx.fillStyle = SOMBRE; ctx.fillRect(ECRAN.x, ECRAN.y, ECRAN.w, ECRAN.h);
  ctx.save(); ctx.beginPath(); ctx.rect(VUE.x, VUE.y, VUE.w, VUE.h); ctx.clip();
  for (const it of FIL) {
    const y = VUE.y + it.y - o.Y;
    if (y + it.h < VUE.y - 2 || y > VUE.y + VUE.h + 2) continue;
    publication(ctx, t, it, VUE.x, y, VUE.w, o);
    ctx.fillStyle = FILET; ctx.fillRect(VUE.x, y + it.h, VUE.w, 2);
  }
  ctx.restore();
  // la barre d'état : l'heure (la même que dans sa nuit), le réseau, la batterie
  ctx.fillStyle = SOMBRE; ctx.fillRect(ECRAN.x, ECRAN.y, ECRAN.w, VUE.y - ECRAN.y);
  ctx.globalAlpha = 1; ctx.font = `15px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(HEURE, ECRAN.x + 16, ECRAN.y + 22);
  const bx = ECRAN.x + ECRAN.w - 40;
  ctx.strokeStyle = GRIS; ctx.lineWidth = 1.5; ctx.strokeRect(bx + .75, ECRAN.y + 11.75, 22, 11);
  ctx.fillStyle = GRIS; ctx.fillRect(bx + 3, ECRAN.y + 14, 8, 6.5); ctx.fillRect(bx + 23.5, ECRAN.y + 15, 2, 5);
  for (let i = 0; i < 4; i++) ctx.fillRect(bx - 30 + i * 5, ECRAN.y + 21 - (i + 1) * 2.5, 3, (i + 1) * 2.5);
  ctx.restore();
  ctx.globalAlpha = 1;
}
// la touche du pouce, abstraite : un rond gris qui glisse vers le haut à chaque coup (comme une capture d'écran)
function touche(ctx, t) {
  for (const c of COUPS) {
    const k = seg(t, c, c + .3); if (k <= 0 || k >= 1) continue;
    const x = ECRAN.x + ECRAN.w * .68, y = lerp(VUE.y + VUE.h * .78, VUE.y + VUE.h * .45, eOut(seg(t, c, c + .16)));
    ctx.globalAlpha = .45 * (1 - seg(k, .45, 1)); ctx.strokeStyle = GRIS; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha *= .4; ctx.fillStyle = GRIS; ctx.fill();
  }
  ctx.globalAlpha = 1;
}
// le fond de l'insert : le laboratoire, assombri à 40 % (et une lueur autour du téléphone)
function fondInsert(ctx, t, clair = .4, sol = .45) {
  fond(ctx, t, { sol });
  noir(ctx, 1 - clair);
  lueur(ctx, TEL.x + TEL.w / 2, TEL.y + TEL.h / 2, 560, LABO, .06 * (1 - clair) / .6);
}

// ================================================================ P05 · 26,6–30,6 · Le fil
// Raccord regard : à la fin de P04 l'œil a baissé les yeux vers le bas à droite ; on voit ce qu'il regarde.
function dessineP05(ctx, t) {
  fondInsert(ctx, t);
  const k = eOut(seg(t, 26.6, 26.9));   // l'insert monte un peu en arrivant
  ctx.save(); ctx.translate(0, 34 * (1 - k)); ctx.globalAlpha = 1;
  telephone(ctx, t, { Y: defile(t), compte: RANG - 1 });
  touche(ctx, t);
  ctx.restore();
}

// ================================================================ P06 · 30,6–40,8 · L'appel
// 30,6–34,6 l'insert (la publication de Phi, le clin d'œil) ; 34,6–39,6 le N°48 au cadre de P01, poussée ×6 → ×6,5
// (il appuie, 47 → 48, les crochets, « N°48 ») ; 39,6–40,8 retour au téléphone et plongée dans l'avatar ×1 → ×14 :
// le petit œil devient l'œil de Phi au laboratoire, en (650, 240), taille 220.
// « Il appuie » (35,4, le scénario) : le flash laiton est fini à 35,95, pour que l'affiche de la page (film.js, 36,0 s)
// montre la bleue dans un œil et la rouge dans l'autre
const T_APPUI = 35.4;
// la poussée sur la publication (31,6–34,6) : son centre reste au milieu de la zone utile
const POUSSE_PUB = 1.55, PUB_Y = VUE.y + VUE.h / 2;
const cadrePub = z => cadre(960, PUB_Y, 960, PUB_Y - 16 * (z - 1) / (POUSSE_PUB - 1), z);
const CAM_RAPPROCHE = [[34.6, 0, 0, NUIT_CADRE.x, NUIT_CADRE.y, 6], [39.6, 0, 0, NUIT_CADRE.x, NUIT_CADRE.y, 6.5]];
// « participants : 47 → 48 », qui s'écrit à côté de lui (IBM Plex Mono 22 px, LABO)
function compteurNuit(ctx, t) {
  const a = `participants${NB}: ${RANG - 1}`, b = ` → ${RANG}`, t1 = T_APPUI + .15, t2 = T_APPUI + .8;
  const n1 = clamp(Math.floor((t - t1) * 42), 0, a.length), n2 = clamp(Math.floor((t - t2) * 18), 0, [...b].length);
  if (n1 <= 0) return;
  const x = 1180, y = 540;
  ctx.font = `22px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha = 1; ctx.fillStyle = LABO; ctx.fillText(a.slice(0, n1), x, y);
  let w = ctx.measureText(a.slice(0, n1)).width;
  if (n2 > 0) {
    const s = [...b].slice(0, n2).join(''), fl = 1 - seg(t, t2 + .2, t2 + .9);
    ctx.fillStyle = fl > 0 && n2 === [...b].length ? mix(LABO, CRAIE, fl) : LABO; ctx.fillText(s, x + w, y);
    w += ctx.measureText(s).width;
  }
  // le curseur, qui clignote encore un peu
  const fin = t2 + [...b].length / 18;
  if (t < fin + 1.2 && (t < fin || Math.floor(t * 4) % 2 === 0)) { ctx.fillStyle = LABO; ctx.fillRect(x + w + 3, y - 18, 11, 21); }
}
// « N°48 », qui s'écrit au-dessus de sa tête, à la place exacte où crochets() le poserait
function nomN48(ctx, t, cx, cy, z, t0) {
  const n = clamp(Math.floor((t - t0) * 10), 0, 4); if (n <= 0) return;
  const hh = Math.max(7, 30 * z), taille = Math.max(12, 26 * z / 6), txt = 'N°48';
  ctx.font = `${Math.round(taille)}px ${PIX}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = LAITON; ctx.globalAlpha = 1;
  const w = ctx.measureText(txt).width;
  ctx.fillText(txt.slice(0, n), cx - w / 2, cy - hh - Math.max(4, taille * .35));
}
function dessineP06(ctx, t) {
  const R = rep();
  // ---- 34,6–39,6 : le N°48, éclairé d'en bas ; la bleue dans un œil, la rouge dans l'autre
  if (t >= 34.6 && t < 39.6) {
    const cam = camera(t, CAM_RAPPROCHE);
    const flash = cloche(t, T_APPUI, T_APPUI + .05, T_APPUI + .3, T_APPUI + .55);
    const leve = t > R.nom + .2 && t < R.nom + 1.3;    // « ce sera son nom » : il lève les yeux de l'écran, vers nous
    const S = nuitScene(ctx, t, cam, {
      ecran: flash > .5 ? 2 : 1, lueur: 1 + .8 * flash,
      reflet: { bas: true, couleurs: flash > .5 ? [LAITON, LAITON] : [BLEU, ROUGE] },
      appui: t > T_APPUI - .18 && t < T_APPUI + .12,
      fixe: leve, cible: cam.ecran(0, 0),
    });
    if (flash > 0) lueur(ctx, S.E.cx, S.E.cy - S.cs, 300 * S.z / 6, LAITON, .16 * flash);
    horloge(ctx, .8);
    compteurNuit(ctx, t);
    // les crochets se referment autour de lui, « N°48 » s'écrit : ils ne le quitteront plus
    const k = eOut(seg(t, R.nom, R.nom + .55));
    if (k > 0) { crochets(ctx, S.c.x, S.c.y, S.z, { k, label: '' }); nomN48(ctx, t, S.c.x, S.c.y, S.z, R.nom + .3); }
    return;
  }
  // ---- l'insert du téléphone : 30,6–34,6, puis 39,6–40,8 (la plongée)
  const apres = t >= 39.6;
  const e = eIO(seg(t, 39.7, 40.72));                    // la plongée
  const clair = apres ? lerp(.4, 1, eIO(seg(t, 40.0, 40.7))) : .4;
  fondInsert(ctx, t, clair, apres ? lerp(.45, 1, e) : .45);
  // l'insert s'approche lentement de la publication quand le fil s'y est arrêté (le clin d'œil se voit) ; au retour
  // (39,6), on retrouve le téléphone à la même place, et la plongée part de là
  const z0 = apres ? POUSSE_PUB : cles(t, [[31.6, 1], [34.6, POUSSE_PUB]]);
  const camTel = cadrePub(z0);
  const C = PHI_CARTE(), ax = C.x + AVATAR.dx, ay = C.y + AVATAR.dy, A0 = camTel.ecran(ax, ay);
  const o = { Y: defile(t), compte: apres ? RANG : RANG - 1, appuye: apres, sansAvatar: apres };
  if (!apres) {
    ctx.save(); camTel.applique(ctx);
    telephone(ctx, t, o);
    touche(ctx, t);
    ctx.restore();
    return;
  }
  // la plongée : le monde du téléphone grossit jusqu'à ×14 autour de l'avatar et s'efface ; l'œil tient d'abord à la
  // carte (il grandit avec elle), puis s'en détache et se pose à 220 : il devient Phi, au laboratoire
  const ex = lerp(A0.x, 650, e), ey = lerp(A0.y, 240, e);
  const z = Math.exp(lerp(Math.log(z0), Math.log(14), e)), aT = 1 - seg(t, 40.25, 40.68);
  const taille = Math.exp(lerp(Math.log(AVATAR.s * z), Math.log(220), lisse(seg(e, .45, .85))));
  if (aT > 0) {   // le téléphone est peint à part, puis posé avec son alpha (ses fonctions reposent globalAlpha)
    const c = calquePlongee(), cam = cadre(ax, ay, ex, ey, z);
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.clearRect(0, 0, W, H);
    c.save(); cam.applique(c); telephone(c, t, o); c.restore();
    ctx.globalAlpha = aT; ctx.drawImage(c.canvas, 0, 0); ctx.globalAlpha = 1;
  }
  oeil(ctx, t, { x: ex, y: ey, taille, humeur: 'neutre', lueur: .35, flotte: 4 * e });
}

// ================================================================ les plans
export const PLANS = [
  { id: 'P01', de: 0, a: 6, dessine: dessineP01, camera: [[0, 0, 0, NUIT_CADRE.x, NUIT_CADRE.y, 6], [6, 0, 0, NUIT_CADRE.x, NUIT_CADRE.y, 5.4]] },
  { id: 'P02', de: 6, a: 9.4, dessine: dessineP02 },
  { id: 'P03', de: 9.4, a: 18.6, dessine: dessineP03 },
  { id: 'P04', de: 18.6, a: 26.6, dessine: dessineP04 },
  { id: 'P05', de: 26.6, a: 30.6, dessine: dessineP05 },
  { id: 'P06', de: 30.6, a: 40.8, dessine: dessineP06 },
];

// ================================================================ les indices sonores (temps du film)
// Le vocabulaire de SCENARIO.md, « Le contrat technique ». f porte la variante quand le son en a une : la nappe
// ('nuit', 'labo'), le motif du carnet ('entier'), et pour souffle le glissement [de, à] en Hz.
const TICS_TITRE = [6.55, 6.7, 6.82, 6.95, 7.05, 7.16, 7.27, 7.36, 7.45, 7.52];
const ARRIVEES = PAR_ARRIVEE.filter((f, i) => i % 8 === 0).map(f => ({ t: +taDe(f).toFixed(2), son: 'pop', g: .14, pan: +((f.cx - 960) / 960).toFixed(2) }));
export const SONS = [
  // P01 — la nuit : le souffle grave, et le fil qui passe sous le pouce (un tic haptique très doux toutes les 0,6 s)
  { t: 0, son: 'nappe', f: 'nuit', g: .55 },
  ...[.6, 1.2, 1.8, 2.4, 3.0, 3.6, 4.2, 4.8, 5.4].map(t => ({ t, son: 'haptique', g: .16 })),
  // P02 — la machine s'allume : deux notes qui montent (une quinte), la pluie de tics des caractères qui se posent
  { t: 6.0, son: 'nappe', f: 'labo', g: .5 },
  { t: 6.3, son: 'note', f: 440, d: .55, g: .28 },
  { t: 6.78, son: 'note', f: 660, d: .9, g: .28 },
  { t: 6.45, son: 'grain', d: 1.15, g: .3 },
  ...TICS_TITRE.map((t, i) => ({ t, son: 'tic', g: .12, pan: +(((i % 5) - 2) * .2).toFixed(1) })),
  { t: 7.6, son: 'frappe', d: .55, g: .16 },
  { t: 8.8, son: 'souffle', d: .6, f: [2200, 700], g: .22, pan: -.5 },
  // P03 — le laboratoire : la foule arrive, les « ? », le carnet
  ...ARRIVEES,
  ...Q_SUJETS.map((i, j) => ({ t: +(motSon('R03', 'dilemmes', 13.6) + (j === 0 ? 0 : j === 1 ? .45 : .9 + (j - 2) * .07)).toFixed(2), son: 'hop', f: 880 + 40 * j, g: j < 2 ? .12 : .06, pan: +((DEMO[i].cx - 960) / 960).toFixed(2) })),
  { t: NOTES[0].t, son: 'frappe', d: .45, g: .18, pan: .7 },
  // P04 — le carnet : son motif à l'ouverture, la plume
  { t: 18.6, son: 'motif', f: 'entier', g: .3 },
  { t: motSon('R05', 'vous', 20.2), son: 'frappe', d: .6, g: .18 },
  { t: motSon('R05', 'Comme', 22.8), son: 'frappe', d: .2, g: .14 },
  { t: motSon('R05', 'vite', 24.8), son: 'note', f: 784, d: .35, g: .12 },     // « vite réglé » : l'œil s'ouvre grand
  { t: 26.0, son: 'souffle', d: .5, f: [900, 2400], g: .12, pan: .6 },
  // P05 — le fil : les coups de pouce, de plus en plus espacés ; « chats : nombreux »
  ...COUPS.filter(t => t > 26.6 && t < 30.6).map(t => ({ t, son: 'haptique', g: .2 })),
  { t: NOTES[1].t, son: 'frappe', d: .25, g: .16, pan: .7 },                   // 0002 · chats : nombreux
  // P06 — l'appel
  { t: 30.6, son: 'haptique', g: .22 }, { t: 31.05, son: 'haptique', g: .14 },
  { t: 31.7, son: 'tic', g: .4 },                                   // la publication s'arrête (un tic plus sec)
  { t: motSon('R07', 'presque', 33.9), son: 'tic', f: 5200, g: .1 },      // le clin d'œil
  { t: 34.6, son: 'nappe', f: 'nuit', g: .5 },
  { t: T_APPUI, son: 'declic', g: .45 },                            // il appuie
  { t: T_APPUI + .08, son: 'note', f: 784, d: .12, g: .2 }, { t: T_APPUI + .2, son: 'note', f: 1046, d: .16, g: .2 },
  { t: T_APPUI + .8, son: 'frappe', d: .3, g: .12, pan: .4 },       // 47 → 48
  { t: motSon('R08', 'ce sera', 38.4), son: 'note', f: 523, d: .7, g: .14 },   // les crochets : « ce sera son nom »
  { t: 39.6, son: 'nappe', f: 'labo', g: .5 },
  { t: 39.7, son: 'souffle', d: 1.1, f: [300, 1800], g: .3 },       // la plongée : un souffle qui se resserre
];
