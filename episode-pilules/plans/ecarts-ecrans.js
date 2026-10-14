/* ==========================================================================
   Les deux pilules, l'épisode — plans/ecarts-ecrans.js : P61–P64 et P72
   Les écrans 09 et 10 de Thibaut (resultats.js, dans le cadre des résultats
   ×0,81), et la carte « à mesurer ».

   - P61 : la devinette « Femmes ou hommes ? / Gauche ou droite ? / Qui prend
     le plus la bleue ? », tapée ligne à ligne dans une boîte de Thibaut posée
     AU-DESSUS de l'écran 09 vide (entre le cartouche et Phi : sous le cadre
     ×0,81, ses titres sont en y 229 ; la boîte tient en y 22–198, son compte
     à rebours DEDANS, sur sa dernière rangée, pour ne pas toucher le titre
     « ORIENTATION POLITIQUE »). Dessous : les barres à zéro, leurs « ? »
     (ecranQui, o.vide), et au pied de chacune LE MÊME BONHOMME gris (le même
     sujet, sept fois, chacun à son rythme : resultats.js en pose sept
     différents, coiffes comprises ; ici on les dessine nous-mêmes, sans ses
     témoins, pour que seul le mot dise qui ils sont).
   - P62 : FEMMES sur « 43 % », HOMMES sur « 32 % » : l'écran 09 est dessiné
     deux fois, une découpe verticale entre les deux barres du genre (chaque
     moitié avec son instant), parce que sa page les fait monter ensemble ;
     puis les cinq barres politiques en cascade (son pas 1), un trait CRAIE
     fin qui joint leurs sommets, les deux extrêmes cernés (LABO : un ajout
     de Phi) sur « 39 % » et « 23 % ». Chaque bonhomme lève les yeux vers sa
     barre quand elle monte.
   - P63 : la terre de globalThis.EUROPE (film-pilules/europe.js), un point de
     2 px par case de 12 px, GRIS_FIG à 25 %, qui se pose du nord au sud ; les
     frontières et les côtes en traits fins ; AUCUN point de participant,
     AUCUN chiffre (EUROPE.donnees est inventé : jamais lu ici). Les cinq pays
     du script, dans son ordre (donnees.js, PAYS : Allemagne, Espagne, France,
     Italie, Pologne), s'allument un par un (2 s chacun), rangée par rangée :
     leurs cases en CRAIE à 50 %, leur nom à leur centroïde, un cadre en
     tirets « À MESURER », et leur ligne « à mesurer » dans la fenêtre
     « PAYS · PART DE BLEUE » (celle du film, x 1 260–1 860, y 150–800, sans
     mini-jauge ni chiffre). Très lente poussée ×1 → ×1,03.
   - P64 : l'écran 10 (recopié de resultats.js, ecranEchelle, pour que chaque
     ligne pousse sur son mot et que « 11 PTS », « 16 PTS », « 53 PTS »
     s'allument sur « Onze », « seize », « cinquante-trois » : sa page les
     écrit en même temps que les barres) ; la carte se replie : les cinq noms
     glissent sous la ligne « D'UN PAYS À L'AUTRE », qui reste en tirets
     « À MESURER ».
   - P72 : l'écran 10 revient, tout posé ; sur « de très loin », les autres
     lignes baissent à 40 % et la barre des 53 s'allume (CRAIE pleine, une
     lueur) ; elle pulse une fois sur « le plus important ».

   Repris : resultats.js (ecran, fondResultats, txt, barre, cerne,
   CADRE_RESULTATS, csDe, PHI) ; film-pilules/plans/europe-carte.js (Pinceau,
   exporté) ; la terre, les frontières et la fenêtre PAYS de
   film-pilules/plans/europe.js (terre, frontieres, fenetrePays : non
   exportés, refaits ici sans les données inventées).
   ========================================================================== */
import {
  CRAIE, GRIS, GRIS_FIG, LABO, FILET, MONO, PIX, clamp, lerp, seg, cloche, eIO, eOut, lisse, hache, fr, toile,
  fenetre, rectTirets, cadre, dessineSujet, PREMIERS, N48,
} from '../commun.js';
import * as R from '../resultats.js';
import * as D from '../donnees.js';
import { Pinceau, C_GRIS, C_CRAIE } from '../../film-pilules/plans/europe-carte.js';
import { S, BORNES, OEIL } from './ecarts-temps.js';

const CAM = R.CADRE_RESULTATS;
const E = (x, y) => CAM.ecran(x, y);
const monde = (ctx, fn) => { ctx.save(); CAM.applique(ctx); fn(); ctx.restore(); ctx.globalAlpha = 1; };
const PHI = Object.freeze({ x: OEIL.resultats.x, y: OEIL.resultats.y });
let MES = null;
const mesureur = () => MES || (MES = toile(8, 8).getContext('2d'));

// ================================================================ P61 · la devinette
const LIGNES_DEV = Object.freeze(['Femmes ou hommes ?', 'Gauche ou droite ?', 'Qui prend le plus la bleue ?'].map(fr));
const DEV = Object.freeze({ z: 31, lh: 42, y: 22, cps: 36 });   // 38 px de Thibaut × 0,81 ; tapées à 36 car./s (index.html)
function boiteDev() {
  const m = mesureur(); m.font = `${DEV.z}px ${PIX}`;
  const larg = LIGNES_DEV.map(l => m.measureText(l).width), w = Math.max(...larg) + 64, h = 16 + 3 * DEV.lh + 36;
  return { x: 960 - w / 2, y: DEV.y, w, h, larg };
}
const nDev = (k, T) => clamp(Math.floor((T - S.lignes[k]) * DEV.cps), 0, [...LIGNES_DEV[k]].length);
const aDev = T => seg(T, S.p61, S.p61 + .3) * (1 - seg(T, S.efface, S.efface + .4));
// où la boîte écrit (l'œil la suit) : le bout de la ligne qui se tape, ou null
export function plumeDev(T) {
  const B = boiteDev();
  for (let k = 2; k >= 0; k--) {
    const n = nDev(k, T);
    if (T >= S.lignes[k] && n < [...LIGNES_DEV[k]].length) {
      const m = mesureur(); m.font = `${DEV.z}px ${PIX}`;
      return { x: 960 - B.larg[k] / 2 + m.measureText([...LIGNES_DEV[k]].slice(0, n).join('')).width, y: B.y + 16 + (k + 1) * DEV.lh - DEV.z * .7 };
    }
  }
  return null;
}
export const centreDev = Object.freeze({ x: 960, y: DEV.y + 90 });
function devinette(ctx, T) {
  const a = aDev(T); if (a <= .001) return;
  const B = boiteDev(), y0 = B.y + (1 - eOut(clamp(a))) * 10;
  fenetre(ctx, B.x, y0, B.w, B.h, a);
  ctx.globalAlpha = a; ctx.font = `${DEV.z}px ${PIX}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  LIGNES_DEV.forEach((l, k) => {
    const n = nDev(k, T); if (T < S.lignes[k]) return;
    const x0 = 960 - B.larg[k] / 2, yy = y0 + 16 + (k + 1) * DEV.lh - DEV.z * .3, vis = [...l].slice(0, n).join('');
    ctx.fillStyle = CRAIE; ctx.fillText(vis, x0, yy);
    if (n < [...l].length) { const w = ctx.measureText(vis).width; ctx.fillStyle = LABO; ctx.fillRect(x0 + w + 3, yy - DEV.z * .8, DEV.z * .55, DEV.z * .9); }
  });
  // le compte à rebours de la grammaire (commun.js, compteARebours), sur la dernière rangée de la boîte
  const k = seg(T, S.compte, S.compte + S.compteD), al = a * cloche(T, S.compte - .3, S.compte, S.compte + S.compteD, S.compte + S.compteD + .3);
  if (al > .001) {
    const x = Math.round(B.x + 28), y = Math.round(y0 + B.h - 18), w = Math.round(B.w - 56);
    ctx.globalAlpha = al * .35; ctx.fillStyle = GRIS; ctx.fillRect(x, y, w, 1);
    ctx.globalAlpha = al; ctx.fillRect(x, y - 2, Math.round(w * (1 - k)), 4);
  }
  ctx.globalAlpha = 1;
}

// ================================================================ P61–P62 · l'écran 09
// la géométrie de sceneQui (resultats.js, QUI, quiX : non exportés, recopiés) ; d : l'instant du pas de la barre (son
// Tin(pas) = T − d) ; la barre j d'un groupe monte de d + 0,3 + 0,15 j à d + 1,4 + 0,15 j
const YB = 840, BH = 480;
const pct = v => 100 * v.bleue / v.total;
export const BARRES9 = Object.freeze([
  { g: 0, j: 0, x: 315, v: pct(D.GENRE.hommes), d: S.hommes - .3, nom: 'HOMMES' },
  { g: 0, j: 1, x: 485, v: pct(D.GENRE.femmes), d: S.femmes - .45, nom: 'FEMMES' },
  ...D.POLITIQUE.ordre.map((k, j) => ({ g: 1, j, x: 920 + 170 * j, v: pct(D.POLITIQUE[k]), d: S.pol - .3, nom: D.POLITIQUE[k].nom })),
].map(Object.freeze));
const montee = (b, T) => eIO(seg(T - b.d, .3 + b.j * .15, 1.4 + b.j * .15));
export const debutBarre = b => b.d + .3 + b.j * .15;
// le sommet de la barre (à l'écran), à l'instant T
export const hautBarre9 = (b, T) => E(b.x, YB - BH * b.v / 100 * montee(b, T));
// le même bonhomme au pied de chaque barre : un sujet ras, sans écharpe (ni le N°48), sept fois ; chacun respire et
// cligne à son rythme (ses tirages r1, r2, r3 changent ; sa coiffe, non)
const TEMOIN = PREMIERS.find(f => f.coiffe === 0 && !f.detail && f.i !== N48) || PREMIERS[0];
const TEMOINS = Object.freeze(BARRES9.map((b, k) => Object.freeze({ ...TEMOIN, i: 900 + k, r1: hache(k * 3 + 101), r2: hache(k * 3 + 102), r3: hache(k * 3 + 103) })));
export const teteTemoin9 = k => { const p = E(BARRES9[k].x, YB + 148), cs = R.csDe(3); return { x: p.x, y: p.y - 6 * cs - 3 * cs }; };
const XCOUPE = E(400, 0).x;   // entre HOMMES et FEMMES (le titre « GENRE » est le même des deux côtés : la découpe ne se voit pas)
export function ecran09(ctx, T) {
  R.fondResultats(ctx, T, 9, []);
  const vide = S.p61 - .5, o = { phi: PHI, sans: ['temoins'], vide };
  // deux fois : à gauche de la découpe, HOMMES sur « 32 % » ; à droite, FEMMES sur « 43 % » et la politique
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, XCOUPE, 1080); ctx.clip();
  R.ecran(ctx, T, 9, [BARRES9[0].d, S.pol - .3], o);
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(XCOUPE, 0, 1920 - XCOUPE, 1080); ctx.clip();
  R.ecran(ctx, T, 9, [BARRES9[1].d, S.pol - .3], o);
  ctx.restore();
  // le trait qui joint les sommets des cinq barres politiques (la pente), tracé de gauche à droite
  const kp = eIO(seg(T, S.pente, S.pente + .9));
  if (kp > 0) monde(ctx, () => {
    const P = BARRES9.filter(b => b.g === 1).map(b => [b.x, YB - BH * b.v / 100 - 6]), u = kp * (P.length - 1), n = Math.floor(u);
    ctx.globalAlpha = .9; ctx.strokeStyle = CRAIE; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i <= n; i++) ctx.lineTo(P[i][0], P[i][1]);
    if (n < P.length - 1) ctx.lineTo(lerp(P[n][0], P[n + 1][0], u - n), lerp(P[n][1], P[n + 1][1], u - n));
    ctx.stroke();
    ctx.fillStyle = CRAIE; for (let i = 0; i <= n; i++) ctx.fillRect(P[i][0] - 5, P[i][1] - 5, 10, 10);
    ctx.globalAlpha = 1;
  });
  // les deux extrêmes cernés (« 39 % », « 23 % »)
  monde(ctx, () => {
    [[2, S.c39], [6, S.c23]].forEach(([k, t]) => {
      const a = seg(T, t, t + .3); if (a <= 0) return;
      const b = BARRES9[k], top = YB - BH * b.v / 100;
      R.cerne(ctx, b.x - 74, top - 66, 148, YB + 82 - (top - 66), LABO, a, T);
    });
  });
  // les bonshommes, au pied des barres (hors caméra, à case entière : comme resultats.js les pose)
  const cs = R.csDe(3);
  BARRES9.forEach((b, k) => {
    const p = E(b.x, YB + 148), t0 = debutBarre(b), leve = T >= t0 && T < t0 + 2.8;
    dessineSujet(ctx, TEMOINS[k], p.x, p.y - 6 * cs, cs, { col: GRIS_FIG, phi: PHI, cible: leve ? hautBarre9(b, T) : PHI, fixe: leve, reflet: true }, T);
  });
  ctx.globalAlpha = 1;
  devinette(ctx, T);
}

// ================================================================ P63 · la carte « à mesurer »
const FX = 1260, FY = 150, FW = 600, FH = 650;      // la fenêtre PAYS du film (film-pilules/plans/europe.js)
const ligneY = r => FY + 150 + r * 84;
const PIN = new Pinceau(6000);
let CARTE = null;
function laCarte(E0) {
  if (CARTE || !E0) return CARTE;
  const X0 = E0.ecran.x, Y0 = E0.ecran.y, P = E0.pas, terre = [];
  for (let y = 0; y < E0.hauteur; y++) for (let x = 0; x < E0.largeur; x++) {
    const c = E0.case(x, y); if (!c) continue;
    const d = Math.min(x + 3, E0.largeur - 1 - x, y + 3, E0.hauteur - 1 - y);   // les bords de la grille s'effacent (le film)
    terre.push({ x: X0 + x * P + P / 2, y: Y0 + y * P + P / 2, gy: y, c, bord: lisse(clamp(d / 7)), h: hache(x * 131 + y * 977 + 5) });
  }
  const pays = D.PAYS.liste.map((p, k) => {
    const c = E0.code(p.code), cases = terre.filter(q => q.c === c), ce = E0.centroides[c] || [0, 0];
    return { nom: p.nom, code: p.code, c, k, ymin: Math.min(...cases.map(q => q.gy)), ymax: Math.max(...cases.map(q => q.gy)), cx: X0 + ce[0] * P, cy: Y0 + ce[1] * P };
  });
  const traits = E0.traits.map(t => { const pts = []; for (let i = 0; i < t.pts.length; i += 2) pts.push(X0 + t.pts[i] * P, Y0 + t.pts[i + 1] * P); return { a: t.a, b: t.b, pts }; });
  CARTE = { terre, pays, traits, rang: new Map(pays.map(p => [p.c, p])), H: E0.hauteur };
  return CARTE;
}
// la caméra de la carte : la très lente poussée ×1 → ×1,03 autour du milieu de la zone de la carte (x 40–1 200, y 30–820)
export const camCarte = T => cadre(620, 425, 620, 425, lerp(1, 1.03, seg(T, BORNES.P63[0], BORNES.P63[1])));
const tPays = (p, gy) => S.pays[p.k] + (gy - p.ymin) / Math.max(1, p.ymax - p.ymin) * .45;   // rangée par rangée, du nord au sud
// le centre d'un pays à l'écran (l'œil le regarde), et sa ligne dans la fenêtre
export function centrePays(k, T) { const C = laCarte(globalThis.EUROPE); if (!C) return null; const p = C.pays[k]; return camCarte(T).ecran(p.cx, p.cy); }
export const lignePays = k => ({ x: FX + 300, y: ligneY(k) - 4 });
export const fenetrePaysCentre = Object.freeze({ x: FX + FW / 2, y: FY + 60 });
// les rangées de chaque pays (les tic de la pluie) : [{ t, x }] ; k : le pays
export function rangeesPays(k) {
  const C = laCarte(globalThis.EUROPE); if (!C) return [];
  const p = C.pays[k], out = [];
  for (let gy = p.ymin; gy <= p.ymax; gy++) out.push({ t: +tPays(p, gy).toFixed(3), x: p.cx });
  return out;
}
function terre(ctx, T, C, cam) {
  const P = PIN; P.vide();
  const z = cam.z, ox = cam.ox, oy = cam.oy, t0 = BORNES.P63[0];
  for (const q of C.terre) {
    const ta = t0 + q.gy / C.H * .9 + q.h * .12, ap = seg(T, ta, ta + .3);
    if (ap <= 0) continue;
    const x = q.x * z + ox, y = q.y * z + oy, p = C.rang.get(q.c), lu = p ? seg(T, tPays(p, q.gy), tPays(p, q.gy) + .12) : 0;
    if (lu > 0) P.pose(x - 1.5, y - 1.5, 3, C_CRAIE, .5 * lu * ap);
    if (lu < 1) P.pose(x - 1, y - 1, 2, C_GRIS, .25 * q.bord * ap * (1 - lu));
  }
  P.dessine(ctx);
}
function frontieres(ctx, T, C, cam) {
  const ap = seg(T, BORNES.P63[0] + .5, BORNES.P63[0] + 1.3); if (ap <= 0) return;
  ctx.save(); ctx.lineWidth = 1; ctx.lineJoin = 'round';
  for (const t of C.traits) {
    const pa = C.rang.get(t.a), pb = t.b ? C.rang.get(t.b) : null;
    const lu = Math.max(pa ? seg(T, S.pays[pa.k], S.pays[pa.k] + .5) : 0, pb ? seg(T, S.pays[pb.k], S.pays[pb.k] + .5) : 0);
    let a = (t.b ? .3 : .16) * ap;
    ctx.strokeStyle = GRIS;
    if (lu > 0) { a = lerp(a, .6, lu); if (lu > .5) ctx.strokeStyle = CRAIE; }
    ctx.globalAlpha = a; ctx.beginPath();
    for (let i = 0; i < t.pts.length; i += 2) { const x = t.pts[i] * cam.z + cam.ox, y = t.pts[i + 1] * cam.z + cam.oy; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
// le nom d'un pays à son centroïde, et son cadre en tirets « À MESURER » (le style de la ligne de l'écran 10)
function nomPays(ctx, T, p, cam) {
  const t0 = S.pays[p.k] + .2; if (T < t0) return;
  const c = cam.ecran(p.cx, p.cy), chars = [...p.nom], n = clamp(Math.floor((T - t0) * 24), 0, chars.length);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = `500 20px ${MONO}`; const wn = ctx.measureText(p.nom).width;
  ctx.font = `500 13px ${MONO}`; const lab = 'À MESURER', wl = ctx.measureText(lab).width + 2 * (lab.length - 1);
  const w = Math.max(wn, wl) + 28, h = 56, x = Math.round(c.x - w / 2), y = Math.round(c.y - 30);
  const kf = seg(T, t0 + .35, t0 + .6);
  if (kf > 0) {
    ctx.globalAlpha = .82 * kf; ctx.fillStyle = 'rgba(12,11,13,.92)'; ctx.fillRect(x, y, w, h);
    const s = lerp(1.15, 1, eOut(kf)), cx = x + w / 2, cy = y + h / 2;
    rectTirets(ctx, cx - w * s / 2, cy - h * s / 2, w * s, h * s, GRIS, kf, 2, [6, 5]);
    ctx.globalAlpha = kf; ctx.font = `500 13px ${MONO}`; ctx.fillStyle = GRIS;
    let xx = c.x - wl / 2; for (const ch of lab) { ctx.fillText(ch, xx, y + 44); xx += ctx.measureText(ch).width + 2; }
  }
  ctx.globalAlpha = 1; ctx.font = `500 20px ${MONO}`; ctx.fillStyle = CRAIE;
  ctx.fillText(chars.slice(0, n).join(''), c.x - wn / 2, y + 23);
}
function fenetrePays(ctx, T, C) {
  const o = eOut(seg(T, S.fenetre, S.fenetre + .35));
  if (o <= .001) return;
  const hh = FH * o;
  fenetre(ctx, FX, FY + (FH - hh) / 2, FW, hh, 1);
  if (o < .999) { ctx.globalAlpha = 1; return; }
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const titre = 'PAYS · PART DE BLEUE', nt = clamp(Math.floor((T - S.fenetre - .35) * 30), 0, titre.length);
  ctx.font = `24px ${PIX}`; ctx.fillStyle = LABO; ctx.globalAlpha = 1;
  ctx.fillText(titre.slice(0, nt), FX + 24, FY + 40);
  ctx.fillStyle = FILET; ctx.fillRect(FX + 24, FY + 54, FW - 48, 2);
  const ah = seg(T, S.fenetre + 1, S.fenetre + 1.3);
  if (ah > 0) {
    ctx.globalAlpha = ah; ctx.font = `500 14px ${MONO}`; ctx.fillStyle = GRIS;
    ctx.fillText('pays', FX + 28, FY + 104); ctx.fillText(fr('part de bleue'), FX + 220, FY + 104);
  }
  C.pays.forEach(p => {
    const t0 = S.pays[p.k] + .55; if (T < t0) return;
    const y = ligneY(p.k), n = clamp(Math.floor((T - t0) * 30), 0, p.nom.length);
    ctx.globalAlpha = 1; ctx.font = `22px ${MONO}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'left';
    ctx.fillText(p.nom.slice(0, n), FX + 28, y + 8);
    const kf = seg(T, t0 + .4, t0 + .65);
    if (kf > 0) {
      rectTirets(ctx, FX + 220, y - 19, FW - 248, 36, GRIS, kf, 2, [8, 6]);
      ctx.globalAlpha = kf; ctx.font = `18px ${MONO}`; ctx.fillStyle = GRIS; ctx.fillText('à mesurer', FX + 238, y + 6);
    }
  });
  ctx.globalAlpha = 1;
}
export function carte(ctx, T, infos) {
  const C = laCarte((infos && infos.europe) || globalThis.EUROPE);
  // le fond de la carte du film (celui de la constellation, sans sol)
  R.fondResultats(ctx, T, 9, [], { teinte: false });
  if (!C) return false;
  const cam = camCarte(T);
  terre(ctx, T, C, cam);
  frontieres(ctx, T, C, cam);
  for (const p of C.pays) nomPays(ctx, T, p, cam);
  fenetrePays(ctx, T, C);
  return true;
}

// ================================================================ P64, P72 · l'écran 10 : tous les écarts, sur une même échelle
// recopié de resultats.js (ecranEchelle) : la même page, mais chaque ligne a son instant, et chaque « PTS » le sien
// I : { titre, pays, genre, politique, description, c11, c16, c53 (les instants), noms (true : les cinq noms glissent de
//       la carte, P64), baisse (P72 : les autres lignes baissent à 40 %), pulse (P72 : la barre des 53 pulse) }
const XG = 640, PT = 19, E10 = D.ECARTS;
const LIGNES10 = Object.freeze([
  { cle: 'genre', l: E10.genre.nom, v: E10.genre.points, y: 420, pts: 'c11', col: LABO },
  { cle: 'politique', l: E10.politique.nom, v: E10.politique.points, y: 530, pts: 'c16', col: LABO },
  { cle: 'pays', l: E10.pays.nom, v: null, y: 640, pts: null, col: GRIS },
  { cle: 'description', l: E10.description.nom, v: E10.description.points, y: 800, pts: 'c53', col: CRAIE },
].map(Object.freeze));
const pousse = (r, T, I) => (r.cle === 'description' ? eOut(seg(T, I.description + .2, I.description + 1.9)) : eIO(seg(T, I[r.cle] + .2, I[r.cle] + 1.0)));
// le bout de la barre d'une ligne (à l'écran), à l'instant T
export function boutLigne(cle, T, I) {
  const r = LIGNES10.find(l => l.cle === cle);
  return E(XG + (r.v === null ? 20 : r.v * pousse(r, T, I)) * PT, r.y);
}
export const etiquettePts = (cle, I) => { const r = LIGNES10.find(l => l.cle === cle); return E(XG + r.v * PT + 80, r.y); };
// les cinq noms sous la ligne des pays (en coordonnées de Thibaut), mesurés une fois
const NOMS_Y = 694, NOMS_Z = 18;
let NOMS = null;
function placesNoms() {
  if (NOMS) return NOMS;
  const m = mesureur(); m.font = `${NOMS_Z}px ${MONO}`;
  let x = XG + 14; NOMS = D.PAYS.liste.map(p => { const o = { nom: p.nom, x }; x += m.measureText(`${p.nom} · `).width; return o; });
  return NOMS;
}
export function echelle(ctx, T, I) {
  R.fondResultats(ctx, T, 10, []);
  const baisse = I.baisse != null ? lerp(1, .4, eIO(seg(T, I.baisse, I.baisse + .6))) : 1;
  monde(ctx, () => {
    const at = seg(T, I.titre, I.titre + .4) * baisse;
    R.txt(ctx, 'ÉCART DE PART DE BLEUE, EN POINTS', XG, 300, 24, GRIS, 'left', at);
    LIGNES10.forEach(r => {
      const t0 = I[r.cle], a0 = seg(T, t0, t0 + .4); if (a0 <= 0) return;
      const longue = r.cle === 'description', a = a0 * (longue ? 1 : baisse);
      R.txt(ctx, r.l, XG - 36, r.y + 14, 28, CRAIE, 'right', a);
      if (r.v === null) {
        ctx.globalAlpha = a; ctx.strokeStyle = GRIS; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.strokeRect(XG, r.y - 22, 20 * PT, 48); ctx.setLineDash([]); ctx.globalAlpha = 1;
        R.txt(ctx, 'À MESURER', XG + 24, r.y + 12, 24, GRIS, 'left', a);
        return;
      }
      const k = pousse(r, T, I), w = r.v * PT * k;
      // P72 : la longue s'allume (une lueur CRAIE) et pulse une fois
      const lueur = longue && I.baisse != null ? eIO(seg(T, I.baisse, I.baisse + .6)) : 0;
      const pu = longue && I.pulse != null ? Math.sin(Math.PI * seg(T, I.pulse, I.pulse + .55)) : 0;
      const hh = 48 * (1 + .22 * pu);
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = r.col;
      if (lueur > 0) { ctx.shadowColor = CRAIE; ctx.shadowBlur = 26 * lueur + 30 * pu; }
      ctx.fillRect(XG, r.y + 2 - hh / 2, w, hh);
      ctx.restore();
      // « 11 PTS » sur « Onze »… : il s'allume (un éclat, puis sa couleur)
      const tp = I[r.pts], ap = tp != null ? seg(T, tp, tp + .25) : 0;
      if (ap > 0) {
        const fl = 1 - seg(T, tp + .1, tp + .6), z = (longue ? 48 : 36) * (1 + .18 * fl);
        R.txt(ctx, `${r.v} PTS`, XG + w + 24, r.y + 16 + (z - (longue ? 48 : 36)) * .3, z, fl > .05 ? CRAIE : r.col, 'left', a * ap);
      }
    });
    ctx.globalAlpha = seg(T, I.titre, I.titre + .4) * baisse; ctx.fillStyle = CRAIE; ctx.fillRect(XG - 2, 350, 3, 500); ctx.globalAlpha = 1;
  });
  // les cinq noms : P64, ils glissent de leur place sur la carte (celle de la fin de P63) jusque sous la ligne des pays
  const N = placesNoms(), ap = seg(T, I.pays, I.pays + .4) * baisse, C = laCarte(globalThis.EUROPE);
  const fin = camCarte(BORNES.P63[1]);
  N.forEach((n, k) => {
    const dst = E(n.x, NOMS_Y);
    let x = dst.x, y = dst.y, z = NOMS_Z * R.Z_CADRE, col = GRIS, a = ap;
    if (I.noms && C) {
      const p = C.pays[k], src = fin.ecran(p.cx, p.cy), u = eIO(seg(T, BORNES.P64[0] + k * .06, BORNES.P64[0] + .9 + k * .06));
      ctx.font = `500 20px ${MONO}`; const w0 = ctx.measureText(p.nom).width;
      x = lerp(src.x - w0 / 2, dst.x, u); y = lerp(src.y - 7, dst.y, u); z = lerp(20, z, u); col = u < .6 ? CRAIE : GRIS; a = baisse;
    }
    ctx.globalAlpha = a; ctx.font = `${z.toFixed(1)}px ${MONO}`; ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(k < N.length - 1 ? `${n.nom} ·` : n.nom, x, y);
  });
  ctx.globalAlpha = 1;
}
// les instants de l'écran 10 : P64 (chaque ligne sur son mot) et P72 (tout est déjà là)
export const I64 = Object.freeze({ titre: BORNES.P64[0] - .4, pays: BORNES.P64[0], genre: S.ecarts, politique: S.ecarts + .4, description: S.desc, c11: S.c11, c16: S.c16, c53: S.c53, noms: true });
export const I72 = Object.freeze({ titre: -1e9, pays: -1e9, genre: -1e9, politique: -1e9, description: -1e9, c11: -1e9, c16: -1e9, c53: -1e9, noms: false, baisse: S.loin, pulse: S.important });
