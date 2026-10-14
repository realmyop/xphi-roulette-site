/* ==========================================================================
   Les deux pilules, le film — plans/europe-salles.js : la slide des deux salles

   La slide de mockups/pilules/donnees.html (la DA de Thibaut : deux salles de
   cent sujets, la jauge et son seuil, la colonne de description, le grand
   chiffre, l'écart au centre, la clé, les tampons), portée en FONCTION PURE
   DU TEMPS et nourrie des chiffres du film (donnees.js, ceux de Monsieur Phi) :
   65,5 % de bleues avec la description collective (65 sujets bleus et un
   sujet bleu à 50 %), 12,6 % avec l'individuelle (12 bleus et un bleu à
   60 %), « −53 », « 52,9 exactement », 1 sujet = 1 % de sa salle (22
   personnes), et le bloc « 91 % » (« c'est la même chose »).

   Une différence avec donnees.html : chaque salle compte sa propre majorité
   et l'issue de chaque salle se déclenche à un instant donné (MINUTAGE), pour
   que la droite puisse attendre : en P16 (lot europe), la gauche vit, la
   droite a choisi et rien ne se passe ; le lot issue la fait mourir en P17.

   Partagé avec le lot issue (SCENARIO.md, « Les éléments partagés ») : il
   importe ce module pour redessiner la slide au début de P17 :
     import { diapoP16, diapo, phiP16, MINUTAGE, SALLES, FOULES, GEO, colonne, filet } from './europe-salles.js';
     diapoP16(ctx, 151.8)        // l'image exacte de la fin de P16 (la slide et Phi), pour le raccord
     diapo(ctx, T, { min: { …MINUTAGE, droite: { …MINUTAGE.droite, issue: 156.6, tampon: Infinity } }, phi, pose, vague: 141 })
       // la slide seule (sans l'œil), sous sa propre caméra, avec l'issue de droite déclenchée quand il le veut
   phiP16(T) rend l'état de Phi de P16 (place, humeur, pupille, clins, reflet,
   pose) : il le dessine lui-même avec oeil() de commun.js (hors caméra).
   diapo ne dessine NI l'œil de Phi (le plan le pose par-dessus, en GEO.oeil),
   NI le cartouche, NI le voile (la surimpression du film). La première
   colonne de la salle de droite (FOULES[1], co = 0) : dix sujets bleus.
   Rien n'est gardé d'une image à l'autre ; les lignes coupées des colonnes et
   les sujets sont des mémoires de calcul (elles ne changent pas l'image).
   ========================================================================== */
import {
  CRAIE, GRIS, LABO, LAITON, BLEU, BLEU_TXT, ROUGE, GRIS_FIG, FILET, SURTITRE, MONO, PIX, NB, TEINTE_CLAIRE, TEINTE_CHAUDE,
  seg, lerp, eOut, eBack, rng, hache, rgba, fr, pc, virgule, nombre, balise, coupeBalise, ecrit, espace, pastille,
  fenetre, fond, jauge, tampon, dessineSujet, CS, SW, COIFFES, largeurCartouche, CARTOUCHE, flotte,
  oeil, humeur, creeRegard, VOUS, point, cligne, clin,
} from '../commun.js';
import { DESCRIPTIONS, cite, CARTOUCHES } from '../texte.js';
import { BLEUE_COLL, BLEUE_INDIV, ECART, PAR_SUJET, PARTICIPANTS, MEME_CHOSE, SEUIL } from '../donnees.js';

// ================================================================ la mise en page (celle de donnees.html)
export const GEO = Object.freeze({
  WY: 160, WW: 770, WH: 616,      // les deux salles, fenêtres façon jeu rétro
  TW: 230,                        // la colonne de texte de chaque salle (côté extérieur : les deux foules se font face)
  PX: 46, PY: 50,                 // le pas de la foule : 10 colonnes de 10 % ; un sujet fait 44 × 48 px
  GY: 222, GH: 14,                // la jauge, au-dessus de la foule, à la même échelle (460 px = 100 %)
  CY0: 278,                       // le centre de la première rangée
  LW: 460,                        // la largeur de la foule et de la jauge
  oeil: Object.freeze({ x: 960, y: 520, taille: 170 }),   // l'œil de Phi, entre les deux salles
  CLE: Object.freeze({ x: 884, tx: 916, y: 634 }),         // la clé, sous l'œil
  DESC_PX: 19, DESC_LH: 30, DESC_Y: 292,                   // la description : Plex 19, interligne 30, dès y 292
});
const { WY, WW, WH, TW, PX, PY, GY, GH, CY0, LW, CLE } = GEO;
const EX = GEO.oeil.x, EY = GEO.oeil.y;

// ================================================================ les deux salles, avec les données du film
// La description individuelle est celle du film (texte.js : « vous », la rouge d'abord), pas celle du questionnaire.
export const SALLES = Object.freeze([
  { s: 0, cle: 'gauche', nom: 'COLLECTIVE', bleue: BLEUE_COLL, desc: cite(DESCRIPTIONS.collective), WX: 64, X0: 350, TX: 90 },
  { s: 1, cle: 'droite', nom: 'INDIVIDUELLE', bleue: BLEUE_INDIV, desc: cite(DESCRIPTIONS.individuelle), WX: 1086, X0: 1110, TX: 1600 },
].map(R => Object.freeze({ ...R, vit: R.bleue > SEUIL, rouge: +(100 - R.bleue).toFixed(1) })));

// ================================================================ le minutage (P16 : la slide se construit en accéléré)
// Les instants sont des temps du film. Pour chaque salle : ouvre (la fenêtre s'ouvre, 0,45 s), texte (la colonne ;
// −Infinity : déjà écrite, P15 l'a posée), jauge, foule (les sujets arrivent en « arrivee » s), choix (les sauts, en
// « sauts » s), nombre (le grand chiffre), issue (la vie, ou la peur puis le départ des bleus), tampon.
// La droite attend : issue et tampon à Infinity (le lot issue les donne en P17).
export const MINUTAGE = Object.freeze({
  gauche: Object.freeze({ ouvre: 138.8, texte: -Infinity, jauge: 139.0, foule: 139.0, arrivee: .4, choix: 139.3, sauts: .8, nombre: 140.2, issue: 141.0, tampon: 141.4 }),
  droite: Object.freeze({ ouvre: 138.9, texte: -Infinity, jauge: 139.1, foule: 139.1, arrivee: .4, choix: 139.5, sauts: .8, nombre: 140.4, issue: Infinity, tampon: Infinity }),
  titre: 138.95,      // le titre tapé en haut (45 car./s)
  source: 139.5,      // la source, en fondu
  cle: 139.6,         // la clé, sous l'œil
  ecart: 140.6,       // « écart » : ÉCART, −53, POINTS…
  meme: 142.7,        // « neuf sur dix » : le bloc « 91 % »
  // les gestes de Phi (R25, R26) : « Ils ont raison » (curieux), « J'ai vérifié » (trois saccades : −53, 65,5, 12,6),
  // « Deux fois » (deux clignements), puis l'œil se tourne vers la salle de droite (P17 y plonge)
  phi: Object.freeze({ curieux: 147.8, verifie: 149.0, clins: Object.freeze([150.2, 150.5]), droite: 151.2 }),
});
const minDe = (M, R) => M[R.cle];

// ================================================================ les deux cents sujets (données fixes, comme donnees.html)
// Rangés colonne par colonne, de haut en bas, les bleus d'abord : chaque colonne fait 10 %, et le trait des 50 % passe
// entre la 5e et la 6e colonne, sous celui de la jauge. Le sujet k a une part de bleue fb (1, 0, ou la décimale :
// 65,5 = 65 bleus + un sujet bleu à 50 % ; 12,6 = 12 bleus + un sujet bleu à 60 %).
export const FOULES = Object.freeze(SALLES.map(R => {
  const RF = rng(R.s ? 2024 : 1808), ent = Math.floor(R.bleue + 1e-9), frac = +(R.bleue - ent).toFixed(3);
  const F = [...Array(100).keys()].map(k => {
    const i = R.s * 100 + k, co = Math.floor(k / 10), row = k % 10;
    return {
      i, k, s: R.s, co, row, cx: R.X0 + PX / 2 + co * PX, cy: CY0 + row * PY,
      fb: k < ent ? 1 : k === ent ? frac : 0,
      r1: RF(), r2: RF(), r3: RF(),
      coiffe: Math.floor(hache(i * 7 + 3) * COIFFES.length), detail: hache(i * 17 + 11) < .2 ? 1 : 0,
    };
  });
  // l'ordre des sauts : au hasard, comme dans le morceau
  const ordre = [...Array(100).keys()]; for (let j = 99; j > 0; j--) { const m = Math.floor(RF() * (j + 1)); [ordre[j], ordre[m]] = [ordre[m], ordre[j]]; }
  F.forEach(f => { f.rang = ordre.indexOf(f.k); Object.freeze(f); });
  return Object.freeze(F);
}));
// les instants d'un sujet, selon le minutage
export function instants(f, M = MINUTAGE) {
  const m = minDe(M, SALLES[f.s]);
  return { ta: m.foule + f.r1 * m.arrivee, tc: m.choix + f.rang * m.sauts / 99, tp: m.issue - .8, td: m.issue + f.r2 };
}
export const meurt = f => !SALLES[f.s].vit && f.fb > 0;   // la part bleue meurt quand les bleues n'ont pas la majorité
export const bleues = (R, T, M = MINUTAGE) => FOULES[R.s].reduce((a, f) => a + (T >= instants(f, M).tc ? f.fb : 0), 0);
export const rouges = (R, T, M = MINUTAGE) => FOULES[R.s].reduce((a, f) => a + (T >= instants(f, M).tc ? 1 - f.fb : 0), 0);
// l'instant où la jauge passe le seuil (le déclic) : le premier saut après lequel les bleues dépassent 50 %
export function passeSeuil(R, M = MINUTAGE) {
  const F = [...FOULES[R.s]].sort((a, b) => a.rang - b.rang); let b = 0;
  for (const f of F) { b += f.fb; if (b > SEUIL) return instants(f, M).tc; }
  return null;
}

// ================================================================ où regarder (pour le regard de Phi)
export const visage = f => ({ x: f.cx, y: f.cy - 12 });
export const ECART_C = Object.freeze({ x: 960, y: 262 });            // « −53 »
export const NOMBRE_C = R => ({ x: R.TX + 90, y: 664 });             // le grand chiffre de la salle
export const TAMPON_C = R => ({ x: R.X0 + LW / 2, y: WY + WH + 30 });
export const MEME_C = Object.freeze({ x: 960, y: 772 });             // le bloc « 81 % »
export const jaugeC = (R, M = MINUTAGE) => T => (T < minDe(M, R).jauge + .3 ? null : { x: R.X0 + LW * bleues(R, T, M) / 100, y: GY + GH / 2 });
// le dernier sujet à avoir fait quelque chose (quand(f) : son instant, ou null), depuis moins de duree
export const dernier = (R, quand, duree) => T => {
  let best = null, bt = -Infinity;
  for (const f of FOULES[R.s]) { const t = quand(f); if (t !== null && t <= T && T < t + duree && t > bt) { bt = t; best = f; } }
  return best && visage(best);
};
// un sujet tiré par créneau, parmi ceux qui vérifient ok
export const parmi = (R, ok, P = .55, M = MINUTAGE) => T => {
  const h = hache(Math.floor(T / P) * 97 + 3 + R.s * 11), i0 = Math.floor(h * 100);
  for (let j = 0; j < 100; j++) { const f = FOULES[R.s][(i0 + j * 37) % 100]; if (T > instants(f, M).ta + .3 && ok(f, T)) return visage(f); }
  return null;
};

// ================================================================ les textes (coupés une fois les polices là)
const TITRE = fr('Mêmes règles, autres mots : autre choix, autre issue.');
export const SOURCE = Object.freeze([
  fr(`Xphi, test 01, sur les réseaux d’Arte · ${nombre(PARTICIPANTS)} participants · une description tirée au sort pour chacun`),
  fr('chaque salle compte sa propre majorité · chiffres du questionnaire de Monsieur Phi (prototype)'),
]);
let DESC = null, DESC_OK = false;
const policesLa = () => typeof document === 'undefined' || !document.fonts || document.fonts.check(`${GEO.DESC_PX}px "IBM Plex Mono"`);
// les lignes balisées de la description de la salle R (Plex 19, largeur 230), mesurées une fois les polices chargées
export function lignesDesc(ctx, R) {
  if (!DESC || !DESC_OK) {
    ctx.save(); ctx.font = `${GEO.DESC_PX}px ${MONO}`;
    DESC = SALLES.map(S => coupeBalise(ctx, S.desc, TW)); DESC_OK = policesLa();
    ctx.restore();
  }
  return DESC[R.s];
}
export const nCars = lignes => lignes.reduce((a, l) => a + l.reduce((b, s) => b + [...s.s].length, 0), 0);
// la place (x, y de la ligne de base) de chaque caractère de la description, pour y faire arriver quelque chose ;
// mesurée une fois les polices là, puis gardée (la plume de colonne() et le regard de Phi la demandent à chaque image :
// 250 à 1 000 measureText par image pendant que les descriptions s'écrivent)
const PLACES_DESC = [];
export function placesDesc(ctx, R) {
  const L = lignesDesc(ctx, R), m = PLACES_DESC[R.s];
  if (m && m.L === L) return m.out;
  const out = [];
  ctx.save(); ctx.font = `${GEO.DESC_PX}px ${MONO}`;
  L.forEach((l, li) => { let x = R.TX; for (const s of l) for (const ch of s.s) { const w = ctx.measureText(ch).width; out.push({ x: x + w / 2, y: GEO.DESC_Y + li * GEO.DESC_LH - 6, ch, c: s.c }); x += w; } });
  ctx.restore();
  if (DESC_OK) PLACES_DESC[R.s] = { L, out };
  return out;
}
// la place du titre (après le cartouche du film, qui s'élargit à ses mots)
export function xTitre(ctx) { return CARTOUCHE.x + largeurCartouche(ctx, ...CARTOUCHES.resultats) + 44; }

// ================================================================ les pièces (partagées : P15 pose les colonnes, P18 le filet)
// le filet laiton (SCENARIO.md, éléments partagés) : 2 px, vertical en x (960), de y0 à y1
export function filet(ctx, x, y0, y1, a = 1) {
  if (a <= .001 || y1 <= y0) return;
  ctx.globalAlpha = a; ctx.fillStyle = LAITON; ctx.fillRect(Math.round(x) - 1, y0, 2, y1 - y0);
  ctx.globalAlpha = 1;
}
// la colonne de texte de la salle R : « DESCRIPTION », son nom, le filet, sa description (n caractères), le chiffre.
//   o : { a (alpha de la colonne), aTete (alpha de l'en-tête, sinon a), n (caractères écrits : tous par défaut),
//         an (alpha du grand chiffre : 0 sans chiffre), plume (true : un curseur LABO au bout de ce qui s'écrit) }
export function colonne(ctx, R, o = {}) {
  const a = o.a ?? 1, aT = o.aTete ?? a, x = R.TX;
  if (a <= .001 && aT <= .001) return;
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  if (aT > .001) {
    ctx.globalAlpha = aT;
    ctx.font = `500 15px ${MONO}`; ctx.fillStyle = SURTITRE; espace(ctx, 'DESCRIPTION', x, 200, 3);
    ctx.font = `36px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'left'; ctx.fillText(R.nom, x, 240);
    ctx.fillStyle = FILET; ctx.fillRect(x, 256, TW, 2);
  }
  const L = lignesDesc(ctx, R), N = nCars(L), n = Math.min(N, o.n ?? N);
  if (a > .001 && n > 0) {
    ctx.globalAlpha = a; ctx.font = `${GEO.DESC_PX}px ${MONO}`; ctx.textAlign = 'left';
    ecrit(ctx, L, x, GEO.DESC_Y, GEO.DESC_LH, n);
    if (o.plume && n < N) {
      const P = placesDesc(ctx, R)[n - 1];
      if (P) { ctx.fillStyle = LABO; ctx.fillRect(P.x + 7, P.y - 10, 7, 18); }
    }
  }
  const an = o.an ?? 0;
  if (an > .001) {
    ctx.globalAlpha = an;
    const [ent, dec] = pc(R.bleue).split(NB);   // « 63,8 » et « % »
    ctx.font = `88px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'left'; ctx.fillText(ent, x - 2, 694);
    const w = ctx.measureText(ent).width;
    ctx.font = `44px ${PIX}`; ctx.fillText(NB + dec, x + w, 694);
    ctx.font = `18px ${MONO}`; pastille(ctx, x + 11, 727, 1);
    ecrit(ctx, balise('prennent la [b]bleue[/b]'), x + 32, 733, 0, 99);
  }
  ctx.globalAlpha = 1;
}

// ================================================================ une salle
function salle(ctx, R, T, o) {
  const m = minDe(o.min, R), ou = eOut(seg(T, m.ouvre, m.ouvre + .45));
  if (ou <= 0) { colonne(ctx, R, { a: seg(T, m.texte, m.texte + .3), an: 0 }); return; }
  const hh = WH * ou;
  fenetre(ctx, R.WX, WY + (WH - hh) / 2, WW, hh, 1);
  if (ou < 1) { ctx.globalAlpha = 1; colonne(ctx, R, { a: seg(T, m.texte, m.texte + .3), an: 0 }); return; }
  // la teinte de la salle : claire quand tout le monde vit, chaude quand les bleus meurent (comme le fond du morceau)
  const ti = R.vit ? seg(T, m.issue, m.issue + .8) * .55 : seg(T, m.issue - .8, m.issue + .4) * .7;
  if (ti > 0) {
    const tt = R.vit ? TEINTE_CLAIRE : TEINTE_CHAUDE;
    const g = ctx.createRadialGradient(R.X0 + LW / 2, CY0 + 225, 30, R.X0 + LW / 2, CY0 + 225, 420);
    g.addColorStop(0, rgba(tt, ti)); g.addColorStop(1, rgba(tt, 0));
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(R.WX + 2, WY + 2, WW - 4, WH - 4);
  }
  colonne(ctx, R, { a: seg(T, m.texte, m.texte + .3), an: seg(T, m.nombre, m.nombre + .4) });
  // la jauge, à la même échelle que la foule : 460 px = 100 %, le trait des 50 % descend dans la foule
  const aj = seg(T, m.jauge, m.jauge + .4);
  if (aj > 0) jauge(ctx, { style: 'donnees', x: R.X0, y: GY, w: LW, h: GH, bleue: bleues(R, T, o.min), rouge: rouges(R, T, o.min), a: aj, valeurs: T >= m.choix, pointille: CY0 + 9 * PY + 26 });
  ctx.save(); ctx.beginPath(); ctx.rect(R.WX + 2, WY + 2, WW - 4, WH - 4); ctx.clip();   // les caractères s'envolent sans sortir de la salle
  foule(ctx, R, T, o);
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- la foule d'une salle
function etatSujet(f, R, T, o, col) {
  const m = minDe(o.min, R), I = instants(f, o.min);
  const phi = o.phi || { x: EX, y: EY + flotte(T) };
  const e = { col, a: 1, dis: 0, mode: 'repos', phi, cible: phi, fixe: false, reflet: o.reflet ?? true };
  const dw = Math.hypot(f.cx - EX, f.cy - EY) / 900;
  const rf = o.pose, vu = rf ? Math.hypot(f.cx - rf.x, f.cy - 12 - rf.y) : Infinity;
  const vague = o.vague ?? -99;
  e.fixe = (T > I.ta + .3 && T < I.ta + 1.2)               // en arrivant, on lève les yeux vers Phi
    || (T > vague + .3 + dw && T < vague + 2 + dw)          // Phi s'allume : de proche en proche
    || (vu < 60 && T > rf.t + .15 + vu / 160);              // Phi le fixe : il lui rend son regard, puis ses voisins
  if (T > I.tc - .2 && T < I.tc + .45) { e.mode = 'saut'; e.t0 = I.tc; return e; }
  if (R.vit) {
    // tout le monde vit : la lueur, les bras au ciel, puis une lueur qui reste, posée
    const lu = seg(T, m.issue, m.issue + .6) * (1 - seg(T, m.issue + 3.4, m.issue + 4.4));
    if (lu > 0 && T >= I.tc) { e.mode = 'vie'; e.k = lu; }
    e.halo = T >= I.tc ? .5 * seg(T, m.issue + 3.4, m.issue + 4.4) : 0;
  } else if (T >= I.tc && f.fb === 0 && f.co <= 2 && T > m.issue + 1.4 && T < m.issue + 3.4) {
    // à droite, les voisins des partis regardent leur place
    e.fixe = true; e.cible = { x: f.cx - 300, y: f.cy + 20 };
  }
  return e;
}
// le sujet de deux couleurs : on coupe sur la largeur du corps (colonnes 2 à 8 de la grille), à la part bleue fb ;
// gauche : ce qui est à gauche de la coupe (le bleu), sinon ce qui est à droite (le rouge). La coupe tombe sur un pixel.
export function coupeSujet(ctx, cx, fb, gauche, cs = CS) {
  const xs = Math.round(cx - SW * cs / 2 + (2 + 7 * fb) * cs);
  ctx.beginPath(); if (gauche) ctx.rect(cx - 60 * cs / CS, -1e4, xs - (cx - 60 * cs / CS), 2e4); else ctx.rect(xs, -1e4, cx + 60 * cs / CS - xs, 2e4); ctx.clip();
}
function foule(ctx, R, T, o) {
  for (const f of FOULES[R.s]) {
    const I = instants(f, o.min);
    if (T < I.ta) continue;
    const sc = eBack(seg(T, I.ta, I.ta + .45));
    if (sc <= .01) continue;
    if (T < I.tc) { const e = etatSujet(f, R, T, o, GRIS_FIG); e.a = .82; dessineSujet(ctx, f, f.cx, f.cy, CS * sc, e, T); continue; }
    if (f.fb === 1 || f.fb === 0) { sujetChoisi(ctx, f, R, T, o, f.fb ? BLEU : ROUGE, f.fb === 1 && meurt(f)); continue; }
    // la décimale : un sujet de deux couleurs, la part bleue à gauche
    ctx.save(); coupeSujet(ctx, f.cx, f.fb, true); sujetChoisi(ctx, f, R, T, o, BLEU, meurt(f)); ctx.restore();
    ctx.save(); coupeSujet(ctx, f.cx, f.fb, false); sujetChoisi(ctx, f, R, T, o, ROUGE, false, meurt(f)); ctx.restore();
  }
  ctx.globalAlpha = 1;
}
// un sujet qui a choisi ; part : il meurt ; voisin : l'autre part de lui meurt (la décimale), il en a peur avec elle
function sujetChoisi(ctx, f, R, T, o, col, part, voisin = false) {
  const e = etatSujet(f, R, T, o, col), I = instants(f, o.min);
  if (part || voisin) {
    if (e.mode !== 'saut' && T >= I.tp && T < I.td + (voisin ? 1 : 0)) e.mode = 'peur';
    if (part && T >= I.td) {
      const dis = seg(T, I.td, I.td + 2);
      // la trace : ce qui reste du sujet, à sa place, pour que la salle compte toujours ses bleues
      const tr = seg(T, I.td + 1.2, I.td + 2.4);
      if (tr > 0) dessineSujet(ctx, f, f.cx, f.cy, CS, { col, a: .4 * tr, mode: 'trace', phi: e.phi }, T);
      if (dis < 1) { e.dis = dis; dessineSujet(ctx, f, f.cx, f.cy, CS, e, T); }
      return;
    }
  }
  dessineSujet(ctx, f, f.cx, f.cy, CS, e, T);
}

// ================================================================ au centre : l'écart, la clé, « c'est la même chose »
// (l'œil de Phi est entre l'écart et la clé : le plan le dessine, en GEO.oeil)
function centre(ctx, T, o) {
  const M = o.min, te = M.ecart, a = seg(T, te, te + .4);
  ctx.textBaseline = 'alphabetic';
  if (a > 0) {
    const k = eBack(seg(T, te, te + .5));
    ctx.globalAlpha = a;
    ctx.font = `500 15px ${MONO}`; ctx.fillStyle = SURTITRE; espace(ctx, 'ÉCART', 960, 200, 4, 'center');
    ctx.save(); ctx.translate(960, 300); ctx.scale(k, k);
    // le « − » est dessiné à part : celui de DotGothic16 est aussi large qu'un tiret et collé au 5 (donnees.html)
    ctx.font = `104px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'left';
    const txt = String(Math.round(ECART)), mt = ctx.measureText(txt), asc = mt.actualBoundingBoxAscent || 85;
    const gl = mt.actualBoundingBoxLeft || 0, wt = gl + (mt.actualBoundingBoxRight || mt.width), wm = 42, ep = 7, jour = 11;
    const x0 = -(wm + jour + wt) / 2;
    ctx.fillRect(Math.round(x0), Math.round(-asc / 2 - ep / 2), wm, ep);
    ctx.fillText(txt, x0 + wm + jour + gl, 0);
    ctx.restore();
    ctx.globalAlpha = a; ctx.textAlign = 'center';
    ctx.font = `28px ${PIX}`; ctx.fillStyle = CRAIE; ctx.fillText('POINTS', 960, 338);
    ctx.font = `17px ${MONO}`; ctx.fillStyle = GRIS;
    ctx.fillText(`${pc(SALLES[0].bleue)} → ${pc(SALLES[1].bleue)}`, 960, 370);
    ctx.fillText('de bleues', 960, 393);
    ctx.fillText(`${virgule(ECART)} exactement`, 960, 417);
  }
  // la clé, sous l'œil : un sujet = 1 % de sa salle, soit 22 personnes
  const ac = seg(T, M.cle, M.cle + .5);
  if (ac > 0) {
    const cle = { i: 999, cx: 0, cy: 0, r1: .3, r2: .6, r3: .2, coiffe: 0, detail: 0 };
    dessineSujet(ctx, cle, CLE.x, CLE.y, CS, { a: ac, col: GRIS_FIG, mode: 'trace', ouverts: true, phi: { x: 2000, y: 0 } }, T);
    ctx.globalAlpha = ac; ctx.textAlign = 'left';
    ctx.font = `28px ${PIX}`; ctx.fillStyle = CRAIE; ctx.fillText(`=${NB}1${NB}%`, CLE.tx, CLE.y + 12);
    ctx.font = `17px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'center';
    ctx.fillText('de sa salle', 960, CLE.y + 46);
    ctx.fillText(fr(`(${PAR_SUJET} personnes)`), 960, CLE.y + 67);
  }
  // « c'est la même chose » : après le choix, une fois l'autre description montrée, 91 % les trouvent équivalentes
  const am = seg(T, M.meme, M.meme + .4);
  if (am > 0) {
    const y = 734;
    ctx.globalAlpha = am; ctx.textAlign = 'left';
    ctx.font = `500 13px ${MONO}`; ctx.fillStyle = SURTITRE; espace(ctx, fr('« C’EST LA MÊME CHOSE »'), 960, y, 1.2, 'center');
    const kb = eBack(seg(T, M.meme, M.meme + .5));
    ctx.save(); ctx.translate(904, y + 46); ctx.scale(kb, kb);
    ctx.font = `44px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(MEME_CHOSE.part)}${NB}%`, 0, 0);
    ctx.restore();
    // la mini-jauge LABO, à sa valeur exacte (90,8 %), qui se remplit
    const gx = 962, gw = 104, gy = y + 26, kf = eOut(seg(T, M.meme + .1, M.meme + .7));
    ctx.globalAlpha = am; ctx.fillStyle = '#1e1c20'; ctx.fillRect(gx, gy, gw, 10);
    ctx.fillStyle = LABO; ctx.fillRect(gx, gy, gw * MEME_CHOSE.part / 100 * kf, 10);
    ctx.font = `15px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'center';
    ctx.fillText('des participants,', 960, y + 72);
    ctx.fillText('après avoir lu les deux', 960, y + 91);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- les tampons, sous chaque salle (le tampon du morceau)
function tampons(ctx, T, o) {
  for (const R of SALLES) {
    const m = minDe(o.min, R); if (!(T >= m.tampon)) continue;
    const segs = R.vit ? [{ s: 'TOUT LE MONDE VIT', c: CRAIE }] : [{ s: 'LES ', c: CRAIE }, { s: 'BLEUS', c: BLEU_TXT }, { s: ' MEURENT', c: CRAIE }];
    const { x, y } = TAMPON_C(R);
    tampon(ctx, T, { t: m.tampon, segs, taille: 40, x, y, rot: R.vit ? -3 : 3, fond: .88, marge: 70 });
  }
}

// ---------------------------------------------------------------- le titre tapé, la source
function entete(ctx, T, o) {
  const M = o.min, x = xTitre(ctx);
  const n = Math.floor((T - M.titre) * 45);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  if (n > 0) { ctx.globalAlpha = 1; ctx.font = `46px ${PIX}`; ctx.fillStyle = CRAIE; ctx.fillText([...TITRE].slice(0, n).join(''), x, 82); }
  const as = seg(T, M.source, M.source + .6);
  if (as > 0) { ctx.globalAlpha = as; ctx.font = `18px ${MONO}`; ctx.fillStyle = GRIS; SOURCE.forEach((l, i) => ctx.fillText(l, x + 2, 108 + i * 24)); }
  ctx.globalAlpha = 1;
}

// ================================================================ la slide entière
// Le fond de donnees.html : le dégradé centré sur (960, 470), sans sol, la poussière.
export function fondDiapo(ctx, T, o = {}) { fond(ctx, T, { centre: [960, 470], sol: 0, ...o }); }
// diapo(ctx, T, o) : le fond (o.fond === false : sans), les deux salles, le centre, les tampons, le titre et la source.
//   o : { min (MINUTAGE par défaut), phi ({ x, y } : l'œil, pour la lumière et les regards des sujets),
//         pose ({ x, y, t } : où l'œil s'est posé, pour que le sujet regardé rende son regard ; creeRegard().pupille().pose),
//         vague (l'instant où Phi s'est allumé : les sujets lèvent les yeux de proche en proche), reflet (true/false) }
export function diapo(ctx, T, o = {}) {
  const O = { ...o, min: o.min || MINUTAGE };
  if (O.fond !== false) fondDiapo(ctx, T);
  for (const R of SALLES) salle(ctx, R, T, O);
  centre(ctx, T, O);
  tampons(ctx, T, O);
  entete(ctx, T, O);
  ctx.globalAlpha = 1;
}

// ================================================================ Phi, entre les deux salles (P16 ; le lot issue le reprend à 151,8)
// Son regard suit la construction (les arrivées, les sauts, les chiffres, l'écart), la vie à gauche, le tampon, le bloc
// « 81 % » ; « J'ai vérifié » : trois saccades ; « Deux fois » : deux clignements ; à 151,2 il se tourne vers la salle de
// droite (1340, 400) et s'y tient. Humeur : curieux devant l'écart, grand quand tout le monde vit, étonné sur « quatre
// sur cinq », curieux sur « Ils ont raison », neutre à 150,9.
const M16 = MINUTAGE, [RG, RD] = SALLES;
let REG16 = null;
export function regardP16() {
  if (REG16) return REG16;
  const I = f => instants(f, M16), P = M16.phi;
  REG16 = creeRegard({
    cibles: [
      [138.2, 1.3, VOUS],                                                          // (posé depuis P15 : le raccord ne bouge pas)
      [M16.gauche.foule + .05, .45, dernier(RG, f => I(f).ta, .3), .15],           // la foule qui arrive
      [M16.gauche.choix + .1, .7, dernier(RG, f => I(f).tc, .25), .14],            // il suit les sauts, de saccade en saccade…
      [M16.droite.choix + .35, .55, dernier(RD, f => I(f).tc, .25), .14],
      [M16.gauche.nombre, .2, NOMBRE_C(RG)], [M16.droite.nombre, .2, NOMBRE_C(RD)],   // … les deux chiffres
      [M16.ecart, .4, ECART_C],                                                     // l'écart
      [M16.gauche.issue + .1, .35, parmi(RG, () => true, .3)],                      // la vie, à gauche
      [M16.gauche.tampon, .9, TAMPON_C(RG)],                                        // le tampon
      [M16.meme, 1.1, MEME_C],                                                      // « neuf sur dix »
      [M16.meme + 1.2, .5, jaugeC(RG)], [M16.meme + 1.75, .5, jaugeC(RD)],          // il compare les deux jauges
      [P.curieux, .8, VOUS],                                                        // « Ils ont raison »
      [P.verifie, .24, ECART_C], [P.verifie + .24, .24, NOMBRE_C(RG)], [P.verifie + .48, .24, NOMBRE_C(RD)],   // « J'ai vérifié »
      [P.verifie + .72, P.droite - P.verifie - .72, VOUS],                         // « Deux fois » (il cligne)
      [P.droite, 30, point(1340, 400)],                                            // vers la salle de droite (P17 y plonge)
    ],
    repos: [[3, VOUS], [2, parmi(RG, () => true)], [2, parmi(RD, () => true)], [1, jaugeC(RG)], [1, jaugeC(RD)], [1, ECART_C], [.6, MEME_C]],
  });
  return REG16;
}
export const HUMEURS_P16 = Object.freeze([[138.8, 'neutre'], [M16.ecart, 'curieux'], [M16.gauche.issue, 'grand'], [M16.gauche.issue + 1.4, 'neutre'],
  [M16.meme + .05, { r: 15, glow: .55 }], [M16.meme + 2.6, 'neutre'], [M16.phi.curieux, 'curieux'], [150.9, 'neutre']]);
// l'état de Phi à l'instant T, tel que P16 le dessine : { x, y (le centre vrai, avec flotte), taille, humeur, regard
// (la pupille déjà calculée), clins, reflet (les reflets dans les yeux des sujets : éteints quand il cligne), pose }
export function phiP16(T) {
  const G = GEO.oeil, hum = humeur(T, HUMEURS_P16), ey = G.y + flotte(T);
  const g = regardP16().pupille(T, G.x, ey, hum.r);
  let c = cligne(T); for (const t0 of M16.phi.clins) c = Math.min(c, clin(T, t0));
  return { x: G.x, y: ey, taille: G.taille, humeur: hum, regard: g, clins: M16.phi.clins, reflet: c > .5, pose: g.pose };
}
// P16 entier : la slide et Phi (à 151,8 : le raccord avec le lot issue)
export function diapoP16(ctx, T) {
  const P = phiP16(T);
  diapo(ctx, T, { min: M16, phi: { x: P.x, y: P.y }, pose: P.pose, vague: M16.gauche.issue, reflet: P.reflet });
  oeil(ctx, T, { x: GEO.oeil.x, y: GEO.oeil.y, taille: P.taille, humeur: P.humeur, regard: P.regard, clins: P.clins });
}
