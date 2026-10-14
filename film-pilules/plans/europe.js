/* ==========================================================================
   Les deux pilules, le film — plans/europe.js : le lot « europe »
   P14–P16, de 118,6 à 151,8 s : les autres, puis les résultats.

   Ronan : « tu peux aussi par exemple mettre une carte de l'Europe, et
   regarder les différences entre les pays. » Ici, les quatre mille
   points de la constellation (P13) s'envolent vers leur pays : une Europe en
   points de lumière, un point par participant. Avec les mots du groupe,
   partout la bleue ; avec les mots de chacun, partout la rouge : une vague
   traverse le continent d'ouest en est, et seuls les mots ont changé. Entre
   les pays, quelques points (la fenêtre ÉCART, dans les marges) ; les
   frontières s'effacent, un seul continent. « La vraie frontière » : la
   carte se dédouble en deux Europes entières, une par description (chaque
   pays des deux côtés), et le filet laiton descend entre elles ; puis les
   points vont écrire les deux descriptions. Puis la slide de
   donnees.html, avec les chiffres du film (europe-salles.js) : à gauche tout
   le monde vit ; à droite on a choisi, et rien ne se passe encore (P17).

   Aucune lecture ni blague sur un pays : la fenêtre range les pays par nombre
   de participants, jamais par score ; les écarts restent dans les marges.
   Chiffres : ceux de Monsieur Phi (donnees.js) ; PAR PAYS, inventés (europe.js, EUROPE.donnees), à mesurer :
   la fenêtre le dit (« par pays : chiffres fictifs »).

   Trois fichiers : europe-carte.js (la carte, les participants, le minutage S),
   europe-salles.js (la slide, partagée avec le lot issue), et celui-ci (les
   plans, la fenêtre PAYS / ÉCART, l'œil de Phi, le son).
   Raccords : à 118,6 s, la constellation de la fin de P13 (CONSTELLATION de
   commun.js, l'œil en (1560, 84, 100)) ; à 151,8 s, la slide complète, la
   salle de droite choisie mais pas résolue, l'œil en (960, 520, 170), neutre,
   qui regarde vers (1340, 400).
   Essais : index.html?plan=europe (le lot en boucle), ?plan=P14, ?t=126.3.
   ========================================================================== */
import {
  CRAIE, GRIS, GRIS_FIG, LABO, LAITON, BLEU, ROUGE, FILET, MONO, PIX, NB, SURTITRE, CONSTELLATION, N48,
  clamp, lerp, seg, cloche, eIO, eOut, eIn, lisse, hache, rgba, mix, nombre, pc, virgule, espace, pastille, fr,
  fond, fenetre, oeil, humeur, creeRegard, VOUS, point, crochets, toile,
} from '../commun.js';
import { PARTICIPANTS } from '../donnees.js';
import { ebauche } from './ebauche.js';
import { S, DEUX, carte, cameraCarte, Pinceau, C_GRIS, C_ROUGE, C_BLEU, C_CRAIE, C_LABO } from './europe-carte.js';
import { diapoP16, colonne, filet, placesDesc, lignesDesc, nCars, SALLES, FOULES, MINUTAGE, GEO, instants, passeSeuil } from './europe-salles.js';

export const LOT = { id: 'europe', de: 118.6, a: 151.8 };

// ================================================================ la scène de la carte (P14, P15 : un seul décor)
const PIN = new Pinceau(2 * PARTICIPANTS), TERRE = new Pinceau(18000);   // la terre : la carte, puis ses deux copies (P15)
const VOLENT = .4;   // la part des points qui vont écrire les deux phrases
const FX = 1260, FY = 150, FW = 600, FH = 650;            // la fenêtre PAYS, puis ÉCART
const GX = FX + 176, GW = 200, BX = 3.6;                  // la mini-jauge (200 px = 100 %) ; les barres d'écart : 3,6 px par point
// une ligne par pays détaillé (cinq, ceux du script de Thibaut) : 48 px entre deux lignes pour dix pays, jusqu'à 84 pour peu
const NL = () => (globalThis.EUROPE && EUROPE.donnees ? EUROPE.donnees.ordre.length : 5);
const PASL = () => Math.min(84, 432 / Math.max(1, NL() - 1));
const ligneY = r => FY + 150 + r * PASL();
const OEIL_COIN = Object.freeze({ x: 1560, y: 84, taille: 100 });

// Phi lit la fenêtre ligne à ligne : le pays de la ligne qu'il lit s'éclaire sur la carte (son contour, ses points)
const tLigne = r => S.lignes + r * S.pasLigne;
const FLASH = new Float32Array(64);
function flashs(d, T) {
  FLASH.fill(0);
  d.E.donnees.ordre.forEach((c, r) => { const t = tLigne(r); FLASH[c] = cloche(T, t, t + .08, t + .3, t + .75); });
  return FLASH;
}
// la lueur LABO (« partout, la bleue ») et la vague, en x du monde
const xLueur = (d, T) => lerp(d.X0 - 80, d.X0 + d.W + 80, seg(T, S.lueur, S.lueurFin));
const xVague = (d, T) => lerp(d.X0, d.X0 + d.W, seg(T, S.vague, S.vague + 1.5));
// l'instant où la vague passe en x (du monde) ; l'instant où la fermeture éclair passe en y
const tVague = (d, x) => S.vague + clamp((x - d.X0) / d.W) * 1.5;
const tNeutre = (d, y) => S.neutre + clamp((y - d.Y0) / d.Hh) * 1.9;

function scene(ctx, T, infos) {
  const d = carte(infos.europe || globalThis.EUROPE);
  if (!d) { ebauche(ctx, T, null, { ...infos, statut: 'europe.js absent : pas de carte' }); return; }
  const cam = cameraCarte(T);
  // ---- le fond (celui de la constellation, sans sol) : il chauffe avec la vague, refroidit avec la carte neutre ;
  // son centre glisse vers celui de la slide (960, 470) quand la carte se dédouble de part et d'autre du centre
  const chaud = .5 * seg(T, S.vague, S.vagueFin) * (1 - seg(T, S.neutre, S.neutreFin));
  const kc = eIO(seg(T, S.tri, S.triFin));
  fond(ctx, T, { sol: 0, chaud, centre: [lerp(760, 960, kc), 470] });   // (le sol est parti avec P13)
  constellationReste(ctx, T);
  terre(ctx, T, cam, d);
  frontieres(ctx, T, cam, d);
  lueur(ctx, T, cam, d);
  const n48 = points(ctx, T, cam, d);
  // les crochets du N°48 suivent son point un instant, puis s'effacent en chemin : on ne saura pas où il habite
  const ac = 1 - seg(T, S.envol + .1, S.envol + .6);
  if (ac > 0 && n48) crochets(ctx, n48.x, n48.y, CONSTELLATION.z, { a: ac, labelA: 1 - seg(T, S.envol, S.envol + .3) });
  // les deux descriptions, à la place des colonnes de donnees.html (« deux phrases »)
  for (const R of SALLES) {
    const N = nCars(lignesDesc(ctx, R)), n = Math.floor(N * seg(T, S.ecrit, S.ecritFin));
    colonne(ctx, R, { aTete: seg(T, S.tetes, S.tetes + .4), a: n > 0 ? 1 : 0, n, an: 0, plume: T < S.ecritFin + .1 });
  }
  // le filet de « La vraie frontière » : il descend du haut (y 30) au bas de la zone utile (y 830), puis remonte
  const y1 = T < S.remonte ? lerp(30, 830, eOut(seg(T, S.filet, S.filetFin))) : lerp(830, 30, eIn(seg(T, S.remonte, S.remonteFin)));
  if (T >= S.filet && T < S.remonteFin) {
    filet(ctx, 960, 30, y1, 1);
    const tete = T < S.filetFin + .2 ? 1 - seg(T, S.filetFin, S.filetFin + .2) : T >= S.remonte ? 1 : 0;   // une lueur au bout qui bouge
    if (tete > 0) {
      const g = ctx.createRadialGradient(960, y1, 0, 960, y1, 26);
      g.addColorStop(0, rgba(LAITON, .55 * tete)); g.addColorStop(1, rgba(LAITON, 0));
      ctx.fillStyle = g; ctx.fillRect(934, y1 - 26, 52, 52);
    }
  }
  fenetrePays(ctx, T, d);
  oeilCarte(ctx, T, d, cam);
}

// ---------------------------------------------------------------- ce qui reste de la constellation : le titre, le compteur
function constellationReste(ctx, T) {
  const a = 1 - seg(T, S.envol + .05, S.envol + .5);
  if (a <= 0) return;
  ctx.globalAlpha = a; ctx.textBaseline = 'alphabetic';
  ctx.font = `40px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'center';
  ctx.fillText(`${nombre(PARTICIPANTS)} PARTICIPANTS`, 960, 170);
  ctx.font = `22px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'left';
  ctx.fillText(`J10 · ${nombre(PARTICIPANTS)}`, 62, 190);
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- la terre : un point par case de 12 px, GRIS_FIG à 25 %
// Au tri (P15), elle se dédouble avec les points : chaque case part vers ses deux copies à ×0,5 (DEUX), où elle devient
// un point de 1 px tous les 6 px (la même lumière par surface que la carte).
const triU = (T, h) => eIO(seg(T, S.tri + h * .15, S.tri + h * .15 + 1));   // l'avancée du tri : presque ensemble
function terre(ctx, T, cam, d) {
  if (T >= S.effaceCarteFin + .5) return;
  const P = TERRE; P.vide();
  const z = cam.z, ox = cam.ox + .013, oy = cam.oy + .013, bx = xLueur(d, T), lu = T > S.lueur && T < S.lueurFin;
  for (const c of d.terre) {
    const ap = seg(T, 118.9 + c.h * .8, 119.3 + c.h * .8) * (1 - seg(T, S.effaceCarte + c.h * .4, S.effaceCarte + c.h * .4 + .4));
    if (ap <= 0) continue;
    const x = c.x * z + ox - 1, y = c.y * z + oy - 1;
    if (T >= S.tri) {   // la carte → ses deux copies (deux points superposés au départ : chacun à moitié)
      const u = triU(T, c.h), a = .25 * c.bord * ap * lerp(.5, 1, u);
      for (const gx of c.gx) P.pose(lerp(x, gx, u), lerp(y, c.gy, u), u < .5 ? 2 : 1, C_GRIS, a);
      continue;
    }
    let a = .25 * c.bord * ap, col = C_GRIS;
    if (lu) { const g = Math.exp(-(((c.x - bx) / 70) ** 2)); if (g > .05) { col = C_LABO; a = Math.min(1, (.25 + .5 * g) * c.bord * ap); } }
    P.pose(x, y, 2, col, a);
  }
  P.dessine(ctx);
}

// ---------------------------------------------------------------- les frontières : elles disent les pays, puis s'effacent
// du nord au sud (la fermeture éclair) : il ne reste qu'un continent
function frontieres(ctx, T, cam, d) {
  const ap = seg(T, S.couleurs, S.couleurs + .8);
  if (T < S.lignes || T > S.neutreFin + .5) return;
  const F = flashs(d, T);
  ctx.save(); ctx.lineWidth = 1; ctx.lineJoin = 'round';
  for (const t of d.traits) {
    const fl = Math.max(F[t.a], t.b ? F[t.b] : 0);   // le pays que Phi lit : tout son contour, en craie
    let a = t.b ? (t.exp ? .34 : .14) * ap * (1 - seg(T, t.tz, t.tz + .3)) : 0;   // les côtes : la mer reste vide
    if (fl > .01) { ctx.strokeStyle = CRAIE; a = Math.max(a, .75 * fl); } else ctx.strokeStyle = GRIS;
    if (a <= .005) continue;
    ctx.globalAlpha = a; ctx.beginPath();
    for (let i = 0; i < t.pts.length; i += 2) { const x = t.pts[i] * cam.z + cam.ox, y = t.pts[i + 1] * cam.z + cam.oy; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- la lueur LABO qui traverse la carte : tout le monde vit
function lueur(ctx, T, cam, d) {
  const a = cloche(T, S.lueur, S.lueur + .3, S.lueurFin - .3, S.lueurFin);
  if (a <= 0) return;
  // une ellipse de lumière, haute comme la carte, qui s'éteint vers ses bords (pas un pilier)
  const x = xLueur(d, T) * cam.z + cam.ox, y = 425;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, y); ctx.scale(1, 2.4);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 230);
  g.addColorStop(0, rgba(LABO, .13 * a)); g.addColorStop(.25, rgba(LABO, .07 * a)); g.addColorStop(.6, rgba(LABO, .02 * a)); g.addColorStop(1, rgba(LABO, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 230, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------- les participants : un point de 3 × 3 px chacun
// (2 × 2 quand ils étaient 21 685 ; 4 457 depuis les chiffres de Monsieur Phi : des points plus gros, autant de lumière)
const PT = 3, PT_FORT = 4;
// Rend la place du N°48 à l'écran pendant l'envol (pour ses crochets).
let PLACES = null, MES = null;
const mesureur = () => MES || (MES = toile(8, 8).getContext('2d'));
function cibles(ctx) {
  if (!PLACES || !PLACES.ok) {
    const ok = typeof document === 'undefined' || document.fonts.check(`19px "IBM Plex Mono"`);
    PLACES = { ok, P: SALLES.map(R => placesDesc(ctx, R)) };
  }
  return PLACES.P;
}
function points(ctx, T, cam, d) {
  if (T >= S.ecritFin + .2) return null;
  const P = PIN; P.vide();
  // (+ 0,013 px : les places du monde sont entières ; à ×1,05 tout juste, x,5 tomberait pile entre deux pixels et un
  // epsilon de la caméra ferait sauter des points d'un pixel d'une image à l'autre)
  const z = cam.z, ox = cam.ox + .013, oy = cam.oy + .013, N = d.N, H = d.H;
  const lu = T > S.lueur && T < S.lueurFin, bx = xLueur(d, T);
  const tri = T >= S.tri, phr = T >= S.phrases, places = phr ? cibles(ctx) : null, F = flashs(d, T);
  let n48 = null;
  for (let p = 0; p < N; p++) {
    const k = d.couche[p];
    // ---- l'envol : de la constellation (un carré 3 × 3) à sa place dans son pays
    const t0 = d.t0[p], t1 = t0 + d.dur[p];
    if (T < t1) {
      const sx = d.kx[p] - 1.5, sy = d.ky[p] - 1.5;
      if (T < t0) { P.pose(sx, sy, 3, C_GRIS, .9, k); if (p === N48) n48 = { x: d.kx[p], y: d.ky[p] }; continue; }
      const u = (T - t0) / (t1 - t0), e = eIO(u) * .35 + eOut(u) * .65;
      const tx = d.mx[p] * z + ox, ty = d.my[p] * z + oy, L = Math.hypot(tx - sx, ty - sy) || 1;
      const arc = Math.sin(Math.PI * e) * (H[7][p] - .5) * .35 * Math.min(L, 400);
      const x = lerp(sx, tx, e) - (ty - sy) / L * arc, y = lerp(sy, ty, e) + (tx - sx) / L * arc;
      P.pose(x, y, u < .55 ? 3 : PT, C_GRIS, .9, k);
      if (p === N48) n48 = { x: x + 1.5, y: y + 1.5 };
      continue;
    }
    // ---- sa place (P15 : le tri, dans l'Europe de la description qu'il a lue, à sa place réduite ; en pixels de l'écran)
    let x = d.mx[p] * z + ox, y = d.my[p] * z + oy, s = PT, col = C_GRIS, a = .9, va = 0;
    if (tri) {   // presque ensemble : deux Europes qui se séparent, pas une nuée
      const u = triU(T, H[6][p]);
      x = lerp(x, d.gx[p], u); y = lerp(y, d.gy[p], u); va = Math.sin(Math.PI * u);
    }
    const di = d.desc[p], cc = d.bleue[p] ? C_BLEU : C_ROUGE;
    const tc = S.couleurs + H[2][p] * .45, tw = tVague(d, d.mx[p]) + H[3][p] * .25, tn = tNeutre(d, d.my[p]) + H[4][p] * .2;
    if (T >= tn) {
      // la carte neutre : tous en craie à 35 %, divisés par la densité du pays (d.neutre : aucun pays ne fait tache) ;
      // un petit éclat quand la fermeture éclair passe
      col = C_CRAIE; a = (lerp(.75, .35, seg(T, tn, tn + .35)) + .3 * va) * d.neutre[d.pays[p]];
    } else if (T < tc) {
      col = C_GRIS; a = .9;
    } else if (T < tw) {
      if (di === 0) {
        col = cc; a = 1; if (T < tc + .15 || F[d.pays[p]] > .4) s = PT_FORT;
        if (lu) { const g = Math.exp(-(((d.mx[p] - bx) / 38) ** 2)); if (g > .05) { if (g > .45) s = PT_FORT; P.pose(x, y, PT, C_LABO, .75 * g, k); } }
      }
      else { col = C_GRIS; a = lerp(.9, .08, seg(T, tc, tc + .3)); }
    } else if (di === 0) { col = cc; a = lerp(1, .08, seg(T, tw, tw + .35)); }
    else { col = cc; a = 1; if (T < tw + .15) s = PT_FORT; }   // il s'allume en sautant (1,33 → 1)
    // ---- « deux phrases » : quatre sur dix partent écrire la description qu'ils ont lue, sous la plume ; les autres
    // s'éteignent sur place (la carte s'efface)
    if (phr) {
      if (H[0][p] >= VOLENT) { a *= 1 - seg(T, S.phrases + H[5][p] * .5, S.phrases + H[5][p] * .5 + .5); if (a <= .004) continue; }
      else {
        const tp = S.phrases + H[5][p] * .8, u = seg(T, tp, tp + .8);
        if (u >= 1) continue;
        if (u > 0) {
          const L = places[di], arrive = tp + .8, j = Math.min(L.length - 1, Math.floor(L.length * seg(arrive, S.ecrit + .05, S.ecritFin)));
          const c = L[j], tx = c.x + (H[1][p] - .5) * 26, ty = c.y + (H[2][p] - .5) * 22;
          const e = eIO(u), Ld = Math.hypot(tx - x, ty - y) || 1, arc = Math.sin(Math.PI * e) * (H[7][p] - .5) * .3 * Ld;
          const nx = lerp(x, tx, e) - (ty - y) / Ld * arc, ny = lerp(y, ty, e) + (tx - x) / Ld * arc;
          x = nx; y = ny; a = (.35 + .3 * Math.sin(Math.PI * u)) * (1 - seg(u, .55, .95));
        }
      }
    }
    // ces lumières sont des gens : chacune respire un peu, à son rythme (lent : pas de scintillement à 25 i/s)
    a *= .88 + .12 * Math.sin(T * (.7 + H[4][p] * .9) + H[5][p] * 6.283);
    P.pose(x, y, s, col, a, k);
  }
  P.dessine(ctx);
  return n48;
}

// ---------------------------------------------------------------- la fenêtre PAYS, puis ÉCART (rangée par effectif, jamais par score)
// le titre se retape : on efface jusqu'au préfixe commun (70 car./s), on tape la suite (40 car./s)
function tape(T, etapes) {
  let cur = '';
  for (const [t, txt] of etapes) {
    if (T < t) break;
    const prev = [...cur], next = [...txt];
    let k = 0; while (k < prev.length && k < next.length && prev[k] === next[k]) k++;
    const te = (prev.length - k) / 70, u = T - t;
    if (u < te) return prev.slice(0, prev.length - Math.floor(u * 70)).join('');
    const n = Math.floor((u - te) * 40);
    if (k + n < next.length) return next.slice(0, k + n).join('');
    cur = txt;
  }
  return cur;
}
const TITRES = [[S.fenetre + .35, 'PAYS · DESCRIPTION COLLECTIVE'], [S.retape, 'PAYS · DESCRIPTION INDIVIDUELLE'], [S.ecart, 'ÉCART · points de bleue en moins']];
function hachure(ctx, x, y, w, h, a) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.globalAlpha = a; ctx.fillStyle = '#1e1c20'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = GRIS; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let u = x - h; u < x + w; u += 6) { ctx.moveTo(u, y + h); ctx.lineTo(u + h, y); }
  ctx.stroke(); ctx.restore();
}
function fenetrePays(ctx, T, d) {
  const o = eOut(seg(T, S.fenetre, S.fenetre + .35)) * (1 - eIO(seg(T, S.fermeFenetre, S.fermeFenetre + .4)));
  if (o <= .001) return;
  const hh = FH * o;
  fenetre(ctx, FX, FY + (FH - hh) / 2, FW, hh, 1);
  if (o < .999) { ctx.globalAlpha = 1; return; }
  const dn = d.E.donnees, ecart = T >= S.ecart;
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.font = `24px ${PIX}`; ctx.fillStyle = LABO; ctx.globalAlpha = 1;
  ctx.fillText(tape(T, TITRES), FX + 24, FY + 40);
  ctx.fillStyle = FILET; ctx.fillRect(FX + 24, FY + 54, FW - 48, 2);
  // ---- l'en-tête des colonnes
  const ah = seg(T, S.lignes - .1, S.lignes + .2);
  const kE = seg(T, S.ecart + .2, S.ecart + .6);   // l'en-tête passe de la jauge aux barres
  ctx.font = `500 14px ${MONO}`; ctx.fillStyle = GRIS;
  if (ah * (1 - kE) > 0) {
    ctx.globalAlpha = ah * (1 - kE);
    ctx.textAlign = 'center'; ctx.fillText(`seuil 50${NB}%`, GX + GW / 2, FY + 104);
    ctx.textAlign = 'right'; pastille(ctx, FX + 470 - 76, FY + 99, 1, 18, 8); ctx.fillText('bleue', FX + 470, FY + 104);
  }
  if (kE > 0) {   // l'axe des barres : de 0 à 60 points
    ctx.globalAlpha = kE; ctx.font = `13px ${MONO}`; ctx.textAlign = 'center';
    for (const v of [0, 20, 40, 60]) { ctx.fillText(String(v), GX + v * BX, FY + 108); ctx.fillRect(GX + v * BX - .5, FY + 113, 1, 5); }
  }
  // ---- le pointillé de l'ensemble (52,9), sous les barres
  const tot = dn.total, ap = seg(T, S.ecart + .7, S.ecart + 1.0);
  if (ap > 0) {
    const xe = GX + tot.ecart * BX;
    ctx.globalAlpha = ap * .7; ctx.strokeStyle = CRAIE; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(xe, FY + 90); ctx.lineTo(xe, ligneY(NL() - 1) + 14); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = ap; ctx.font = `500 14px ${MONO}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'center';
    ctx.fillText(`ensemble${NB}: ${virgule(tot.ecart)}`, xe, FY + 82);
  }
  // ---- une ligne par pays
  dn.ordre.forEach((c, r) => ligne(ctx, T, d, c, r));
  // ---- les autres pays, comptés dans les totaux, pas détaillés
  const af = seg(T, S.lignes + NL() * S.pasLigne, S.lignes + NL() * S.pasLigne + .3);
  if (af > 0) {
    ctx.globalAlpha = af; ctx.font = `15px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'left';
    const A = dn.autres;
    ctx.fillText(ecart ? `autres pays (n${NB}=${NB}${nombre(A.participants)}) : non détaillés` : `autres pays (n${NB}=${NB}${nombre(T >= tVague(d, d.X0 + d.W * .5) ? A.individuelle.n : A.collective.n)}) : non détaillés`, FX + 28, FY + FH - 26);
    // les totaux sont ceux de Monsieur Phi ; la répartition par pays est inventée (« à mesurer » dans le script)
    ctx.fillText(fr('par pays : chiffres fictifs (prototype), à mesurer'), FX + 28, FY + FH - 52);
  }
  ctx.globalAlpha = 1;
}
function ligne(ctx, T, d, c, r) {
  const ta = S.lignes + r * S.pasLigne, a = seg(T, ta, ta + .25);
  if (a <= 0) return;
  const E = d.E, P = E.donnees.parPays[c], y = ligneY(r), ctr = d.centre(c);
  // la vague passe sur le pays (son centre) : la ligne bascule de la collective à l'individuelle
  const tb = tVague(d, ctr.x) + .1, kb = eIO(seg(T, tb, tb + .5)), indiv = T >= tb + .2;
  // la lueur passe sur le pays : un voile LABO sur sa ligne (ajouteRegle d'index.html)
  const gl = T > S.lueur && T < S.lueurFin ? Math.exp(-(((ctr.x - xLueur(d, T)) / 90) ** 2)) : 0;
  if (gl > .02) { ctx.globalAlpha = .12 * gl; ctx.fillStyle = LABO; ctx.fillRect(FX + 12, y - 30, FW - 24, 42); }
  ctx.globalAlpha = a; ctx.font = `18px ${MONO}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'left';
  ctx.fillText(E.pays[c].nom, FX + 28, y);
  const kE = T >= S.ecart ? seg(T, S.ecart + .2 + r * .07, S.ecart + .45 + r * .07) : 0;   // la jauge devient barre
  // ---- la mini-jauge (bleue, rouge, seuil 50 %)
  if (kE < 1) {
    const g = eOut(seg(T, ta + .05, ta + .55)), aj = a * (1 - kE);
    if (P.tropPeu) hachure(ctx, GX, y - 11, GW, 10, aj * .9);
    else {
      const v = lerp(P.collective.pct, P.individuelle.pct, kb), wb = GW * v / 100 * g, wr = GW * (100 - v) / 100 * g;
      ctx.globalAlpha = aj; ctx.fillStyle = '#1e1c20'; ctx.fillRect(GX, y - 11, GW, 10);
      ctx.fillStyle = BLEU; ctx.fillRect(GX, y - 11, Math.max(0, wb - 1), 10);
      ctx.fillStyle = ROUGE; ctx.fillRect(GX + GW - wr + 1, y - 11, Math.max(0, wr - 1), 10);
    }
    ctx.globalAlpha = aj; ctx.fillStyle = CRAIE; ctx.fillRect(GX + GW / 2 - 1, y - 16, 2, 20);
    ctx.textAlign = 'right';
    if (P.tropPeu) { ctx.font = `15px ${MONO}`; ctx.fillStyle = GRIS; ctx.fillText(`trop peu (n${NB}=${NB}${nombre(indiv ? P.individuelle.n : P.collective.n)})`, FX + 576, y); }
    else {
      const D = indiv ? P.individuelle : P.collective;
      ctx.font = `500 18px ${MONO}`; ctx.fillStyle = CRAIE; ctx.fillText(pc(D.pct), FX + 470, y);
      ctx.font = `15px ${MONO}`; ctx.fillStyle = GRIS; ctx.fillText(`n${NB}=${NB}${nombre(D.n)}`, FX + 576, y);
    }
  }
  // ---- la barre d'écart (de 0 à 60 points), sa marge en moustaches
  if (kE > 0) {
    const ab = a * kE;
    if (P.tropPeu) {
      hachure(ctx, GX, y - 11, 104, 10, ab * .9);
      ctx.globalAlpha = ab; ctx.font = `15px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'right';
      ctx.fillText(`trop peu pour conclure (n${NB}=${NB}${nombre(P.participants)})`, FX + 576, y);
    } else {
      const tb0 = S.ecart + .3 + r * .07, kb2 = eOut(seg(T, tb0, tb0 + .5)), w = P.ecart * BX * kb2;
      ctx.globalAlpha = ab; ctx.fillStyle = CRAIE; ctx.fillRect(GX, y - 11, w, 10);
      const am = ab * seg(T, tb0 + .4, tb0 + .7);
      if (am > 0) {
        const x0 = GX + (P.ecart - P.marge) * BX, x1 = GX + (P.ecart + P.marge) * BX, ym = y - 6;
        ctx.globalAlpha = am; ctx.fillStyle = GRIS;
        ctx.fillRect(x0, ym - 1, x1 - x0, 2); ctx.fillRect(x0 - 1, ym - 6, 2, 12); ctx.fillRect(x1 - 1, ym - 6, 2, 12);
      }
      ctx.globalAlpha = ab * seg(T, tb0 + .3, tb0 + .5); ctx.textAlign = 'right';
      ctx.font = `500 18px ${MONO}`; ctx.fillStyle = CRAIE; ctx.fillText(virgule(P.ecart), FX + 470, y);
      ctx.textAlign = 'left'; ctx.font = `15px ${MONO}`; ctx.fillStyle = GRIS; ctx.fillText(`±${NB}${virgule(P.marge)}`, FX + 484, y);
    }
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- Phi, dans le coin, qui regarde la carte (P14–P15)
const rangee = r => ({ x: FX + 120, y: ligneY(r) - 6 });
let REG_CARTE = null;
function regardCarte(d) {
  if (REG_CARTE) return REG_CARTE;
  const sur = (x, y) => T => { const c = cameraCarte(T); return { x: x * c.z + c.ox, y: y * c.z + c.oy }; };
  const lueurC = T => { const c = cameraCarte(T); return { x: xLueur(d, T) * c.z + c.ox, y: 380 + 60 * Math.sin(T * 5) }; };
  const vagueC = T => { const c = cameraCarte(T); return { x: xVague(d, T) * c.z + c.ox, y: 360 + 80 * Math.sin(T * 3.1) }; };
  const zip = T => { const c = cameraCarte(T); const y = lerp(d.Y0, d.Y0 + d.Hh, seg(T, S.neutre, S.neutre + 1.9)); return { x: (520 + 160 * Math.sin(T * 4)) * c.z + c.ox, y: y * c.z + c.oy }; };
  const teteFilet = T => ({ x: 960, y: T < S.remonte ? lerp(30, 830, eOut(seg(T, S.filet, S.filetFin))) : lerp(830, 30, eIn(seg(T, S.remonte, S.remonteFin))) });
  // le tri : il regarde l'une puis l'autre des deux Europes qui se forment
  const triC = T => { const n = Math.floor(T / .35); return { x: DEUX.x[n % 2] + (hache(n * 13 + 1) - .5) * 300, y: DEUX.y + (hache(n * 13 + 2) - .5) * 260 }; };
  // (les places des caractères, mesurées une fois : cibles() les garde, comme pour les points qui vont écrire)
  const colonnes = R => T => { const L = cibles(mesureur())[R.s], N = L.length; const c = L[Math.min(N - 1, Math.floor(N * seg(T, S.ecrit, S.ecritFin)))]; return c ? { x: c.x, y: c.y } : null; };
  const cib = [
    [S.envol - 1, 1.55, point(960, 520)],                           // (posé depuis P13 : le raccord ne bouge pas)
    [S.envol + .55, 1.3, sur(600, 420), .45],                       // l'envol, vers la carte
    [S.fenetre, .4, point(FX + 200, FY + 40)],                      // la fenêtre s'ouvre
    ...[...Array(NL()).keys()].map(r => [S.lignes + r * S.pasLigne, S.pasLigne, rangee(r)]),   // il lit chaque ligne
    [S.lignes + 1.35, .7, sur(560, 420)],
    [S.lueur, S.lueurFin - S.lueur, lueurC, .3],                    // il suit la lueur
    [S.lueurFin + .1, .65, VOUS],
    [S.retape, .4, point(FX + 330, FY + 40)],                       // le titre se retape
    [S.vague, 1.8, vagueC, .25],                                    // il suit la vague
    [S.vagueFin + .1, .6, rangee(Math.floor((NL() - 1) / 2))], [S.vagueFin + .7, .5, rangee(NL() - 1)],
    [128.3, .7, VOUS],
    [S.ecart, .45, point(FX + 300, FY + 40)],                       // ÉCART
    ...[...Array(NL()).keys()].map(r => [S.ecart + .45 + r * .1, .1, { x: GX + 200, y: ligneY(r) - 6 }]),
    [S.ecart + 1.5, .5, point(GX + d.E.donnees.total.ecart * BX, FY + 80)],   // le pointillé de l'ensemble
    [S.ecart + 2.0, 1.3, zip, .3],                                  // la fermeture éclair
    [S.tri, S.filet - S.tri, triC, .35],                            // la carte qui se dédouble
    [S.filet, .9, teteFilet, .12],                                  // le filet qui descend, entre les deux
    [S.filetFin + .1, .2, point(960, 420)],
    [S.tetes, .5, point(205, 230)],
    [S.ecrit - .1, .5, colonnes(SALLES[0]), .2],                    // les deux descriptions qui s'écrivent
    [S.ecrit + .45, .5, colonnes(SALLES[1]), .2],
    [S.ecritFin + .1, .6, point(960, 430)],
    [S.remonte, .5, teteFilet, .15],
    [S.remonte + .55, 1.5, VOUS],
  ];
  REG_CARTE = creeRegard({ cibles: cib, repos: [[3, VOUS], [3, sur(560, 400)], [1, sur(380, 560)], [1, sur(800, 300)], [1, point(FX + 300, FY + 330)]] });
  return REG_CARTE;
}
const HUM_CARTE = [[S.envol, 'neutre'], [S.bleue, 'grand'], [S.lueurFin + .2, 'neutre'], [S.vague + .3, 'doute'], [S.rouge + .1, 'bas'],
  [128.6, 'neutre'], [S.tri, 'curieux'], [S.filetFin, 'neutre']];
function oeilCarte(ctx, T, d) {
  const k = eIO(seg(T, S.remonte, S.remonteFin)), G = GEO.oeil;
  oeil(ctx, T, { x: lerp(OEIL_COIN.x, G.x, k), y: lerp(OEIL_COIN.y, G.y, k), taille: lerp(OEIL_COIN.taille, G.taille, k), humeur: humeur(T, HUM_CARTE), regard: regardCarte(d) });
}

// ================================================================ P16 · les deux salles (europe-salles.js : la slide et Phi, partagés)
const M = MINUTAGE, [RG, RD] = SALLES;

// ================================================================ les plans
export const PLANS = [
  { id: 'P14', de: 118.6, a: 128.8, dessine: (ctx, t, cam, infos) => scene(ctx, t, infos) },   // L'Europe
  { id: 'P15', de: 128.8, a: 138.8, dessine: (ctx, t, cam, infos) => scene(ctx, t, infos) },   // Deux phrases
  { id: 'P16', de: 138.8, a: 151.8, dessine: (ctx, t) => diapoP16(ctx, t) },                  // Les deux salles
];

// ================================================================ le son (vocabulaire : SCENARIO.md, « Le contrat technique »)
const pan = x => +clamp((x - 960) / 960, -1, 1).toFixed(2);
function sons() {
  const out = [];
  // P14 : l'envol (un souffle), la pluie des points qui se posent (un grain, un tic par pays, de l'ouest à l'est de la carte)
  out.push({ t: S.envol, son: 'souffle', d: 1.6, f: 1, g: .35 });
  out.push({ t: S.envol + .6, son: 'grain', d: 1.3, f: 2600, g: .3 });
  const E = globalThis.EUROPE;
  const centres = E ? E.donnees.ordre.map(c => ({ c, x: E.ecran.x + E.centroides[c][0] * 12 })) : [];
  centres.forEach(({ x }, r) => out.push({ t: +(S.envol + r * S.pasPays + 1.05).toFixed(3), son: 'tic', f: 1500 + r * 90, g: .12, pan: pan(x) }));
  out.push({ t: S.fenetre, son: 'declic', g: .3, pan: .6 });
  for (let r = 0; r < NL(); r++) out.push({ t: +(S.lignes + r * S.pasLigne).toFixed(3), son: 'tic', f: 2200, g: .07, pan: .6 });
  out.push({ t: S.couleurs, son: 'note', f: 330, d: 1.4, g: .12 });                 // les lumières s'allument
  out.push({ t: S.lueur, son: 'souffle', d: S.lueurFin - S.lueur, f: 1, g: .25 });   // la lueur passe
  out.push({ t: S.bleue, son: 'vie', d: 1.6, g: .22 });                              // partout, la bleue : tout le monde vit
  out.push({ t: S.retape, son: 'frappe', d: .45, g: .15, pan: .6 });
  // la vague : un souffle qui traverse de gauche à droite, semé de petits « pop » ; la nappe descend d'une tierce mineure
  out.push({ t: S.vague, son: 'souffle', d: S.vagueFin - S.vague, f: -1, g: .35, pan: 0 });
  for (let i = 0; i < 14; i++) { const k = i / 13; out.push({ t: +(S.vague + k * 1.6 + hache(i * 7 + 1) * .1).toFixed(3), son: 'pop', g: .09, pan: +lerp(-.8, .4, k).toFixed(2), f: 500 + hache(i * 7 + 2) * 400 }); }
  out.push({ t: S.vague, son: 'nappe', f: 'labo', g: .5, demiTons: -3 });          // (la tierce mineure : un champ de plus)
  // P15 : la fenêtre ÉCART ; les pays qui se fondent (une fermeture éclair de tics) ; le filet (une sinusoïde pure)
  out.push({ t: S.ecart, son: 'frappe', d: .6, g: .15, pan: .6 });
  if (E) {
    const d = carte(E);
    d.traits.filter(t => t.b && t.exp).map(t => t.tz).sort((a, b) => a - b).filter((t, i, a) => i === 0 || t - a[i - 1] > .04)
      .forEach((t, i) => out.push({ t: +t.toFixed(3), son: 'tic', f: 2600 + (i % 5) * 140, g: .06, pan: -.2 }));
  }
  out.push({ t: S.fermeFenetre, son: 'souffle', d: .4, f: -1, g: .15, pan: .6 });
  out.push({ t: S.filet, son: 'note', f: 1046, d: 1.0, g: .16 });
  out.push({ t: S.tri, son: 'grain', d: S.triFin - S.tri, f: 1800, g: .22 });       // ils changent de côté
  out.push({ t: S.phrases, son: 'souffle', d: 1.4, f: 1, g: .25 });                 // ils vont écrire les deux phrases
  out.push({ t: S.ecrit, son: 'frappe', d: S.ecritFin - S.ecrit, g: .14, pan: -.7 });
  out.push({ t: S.ecrit + .1, son: 'frappe', d: S.ecritFin - S.ecrit, g: .14, pan: .7 });
  out.push({ t: S.remonte, son: 'note', f: 784, d: .7, g: .1 });
  // P16 : la construction (les sauts, le déclic au seuil, les chiffres), la vie et le tampon à gauche, un accord chaud
  out.push({ t: M.gauche.ouvre, son: 'declic', g: .3, pan: -.5 }, { t: M.droite.ouvre, son: 'declic', g: .3, pan: .5 });
  out.push({ t: M.gauche.foule, son: 'grain', d: .5, f: 2200, g: .2, pan: -.5 }, { t: M.droite.foule, son: 'grain', d: .5, f: 2200, g: .2, pan: .5 });
  for (const R of SALLES) FOULES[R.s].filter(f => f.rang % 4 === 0).forEach(f => out.push({ t: +instants(f, M).tc.toFixed(3), son: 'hop', f: 380 + hache(f.i * 11) * 420, g: .07, pan: pan(f.cx) }));
  const seuil = passeSeuil(RG, M); if (seuil) out.push({ t: +seuil.toFixed(3), son: 'declic', g: .35, pan: -.5 });
  out.push({ t: M.gauche.nombre, son: 'clac', g: .2, pan: -.7 }, { t: M.droite.nombre, son: 'clac', g: .2, pan: .7 });
  out.push({ t: M.ecart, son: 'pop', g: .2, f: 700 });
  out.push({ t: M.gauche.issue, son: 'vie', d: 2.4, g: .45, pan: -.6 });
  out.push({ t: M.gauche.tampon, son: 'tampon', g: .5, pan: -.4 });
  out.push({ t: M.meme, son: 'note', f: 523, d: .6, g: .12 });
  [0, .24, .48].forEach(dt => out.push({ t: +(M.phi.verifie + dt).toFixed(3), son: 'tic', f: 1800, g: .18 }));
  out.push({ t: M.phi.droite, son: 'souffle', d: .4, f: 1, g: .12, pan: .4 });
  return out.sort((a, b) => a.t - b.t);
}
export const SONS = sons();
