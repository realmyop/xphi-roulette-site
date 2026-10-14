/* ==========================================================================
   Les deux pilules, le film — plans/issue.js : le lot « issue »
   ACTES V (fin) et VI — P17–P22, de 151,8 à 201,5 s (SCENARIO.md fait foi)

   P17 151,8–162,2  Le N°48, retrouvé. La slide de P16 (plans/europe-salles.js) ; poussée ×1 → ×3 sur la
                    première colonne de la salle de droite, plongée ×3 → ×22 dans un sujet bleu, qui s'ouvre
                    comme le diaphragme de Phi (six lames) sur 22 personnes (1 sujet = 1 % de sa salle). Phi le cherche, le
                    trouve : ses crochets ; il est GRIS (on n'a jamais vu sa couleur) ; à 155,6 il rejoue son
                    saut et retombe BLEU. « LES BLEUS MEURENT » ; la peur ; il regarde Phi ; les 21 autres
                    partent en caractères, des bords vers lui ; puis lui, le dernier, des pieds à la tête. Ses
                    caractères ne s'en vont pas : ils restent en l'air, petites étoiles de craie au-dessus de
                    ses crochets vides. Aucune parole de 156,2 à 161,2. « Ah. »
   P18 162,2–171,6  L'autre salle. Le filet laiton descend en x 960 (comme « la vraie frontière » de P15) :
                    à droite, le vide et ses étoiles ; à gauche, un sujet bleu de la salle collective s'ouvre
                    de la même façon : 22 vivants, bras au ciel, et à sa place le fantôme du N°48 (contour
                    laiton de 2 px, sa frange), qui s'allume sur « Même personne », se remplit de bleu et lève
                    les bras sur « même choix ».
                    Sur « Ce qui change », au-dessus de chaque moitié : ce que ses voisins ont lu. L'œil,
                    petit, au sommet du filet, compare.
   P19 171,6–178,4  La vraie nuit. Les mêmes étoiles redescendent et le recomposent dans sa nuit de P01
                    (×6 en (960, 430), « 23:49 »). Il pose son téléphone, l'écran s'éteint, il ferme les
                    yeux, se couche (un quart de tour, juste sur la grille), respire.
   P20 178,4–185,4  Le carnet, encore (celui de P04) : sans un mot, « … et selon les mots. » (rien n'est
                    rayé) ; « Protocole » : la plume remonte au bout du protocole et y attend, Phi regarde le
                    N°48 qui dort ; « → échec » ; un sourire. (L'œil y est en coupe, à gauche : il ne traverse
                    pas la page.)
   P21 185,4–196,0  Et vous ? L'œil au centre ; la bleue, la rouge, qui se figent sur « Ça dépend » ; le
                    téléphone du N°48 s'allume : « XPHI · TEST 02 » ; Phi la regarde, elle rentre, annulée.
                    « Chut. Il dort. » L'œil se ferme, les pilules retombent en poussière.
   P22 196,0–201,5  Le carton (le crédit tient trois secondes pleines, le temps de le lire). Noir à 201,5.

   Le contrat (film.js, commun.js) : tout est fonction du temps absolu t (hache, aucune mémoire d'une
   image à l'autre, sauf des mémoires de calcul) ; le plan peint tout son fond, dessine le monde puis
   l'œil ; jamais la boîte de dialogue, le cartouche, le carnet du coin, « données fictives » ni le voile ;
   rien d'important sous y = 830.

   Les instants des mots (« sur “même choix” ») sont lus dans la boîte (texte.js, ecrits), comme le lot
   nuit : ils tombent avec le texte qui s'écrit, même si une réplique change ou si ?ecriture=jeu. Les
   chiffres viennent de donnees.js. Un seul regard et une seule humeur de Phi pour tout le lot : d'un plan
   à l'autre, son œil ne saute jamais.

   Emprunts (sans les modifier) : plans/europe-salles.js (la slide de P16, pour le raccord d'entrée et la
   plongée) ; le sujet nocturne est redessiné ici sur le modèle de nuitScene (plans/nuit.js : même fond,
   même lueur, même ombre), parce qu'il lui faut des états que P01 n'a pas (les bras qui retombent, le
   téléphone posé, l'écran éteint, couché).
   ========================================================================== */
import {
  W, H, CRAIE, GRIS, NUIT, LABO, LAITON, BLEU, BLEU_TXT, GRIS_FIG, SURTITRE, MONO, PIX, G, NB, SW, SH, CS,
  clamp, lerp, seg, cloche, eIO, eOut, eIn, eBack, cles, hache, mix, rgba, fr, nombre, balise, sansBalise, ecrit,
  coupeBalise, espace, fond, FOND_NUIT, fenetre, tampon, pilule,
  HUMEURS, humeur, oeil, dessineOeil, creeRegard, VOUS, point, flotte, cligne,
  dessineSujet, pose, sprite, COIFFES, PREMIERS, N48, crochets, carnet, camera, toile,
} from '../commun.js';
import { REPLIQUES, NOTES, CARNET, AJOUTS, DESCRIPTIONS, cite, ecrits } from '../texte.js';
import { CHOIX, PAR_SUJET, N48 as FICHE } from '../donnees.js';
import { diapo, fondDiapo, filet, FOULES, MINUTAGE } from './europe-salles.js';

export const LOT = { id: 'issue', de: 151.8, a: 201.5 };

// ================================================================ outils du lot
// une lueur ronde (dégradé radial), de couleur col, d'opacité a au centre (celle du lot nuit)
function lueur(ctx, x, y, r, col, a) {
  if (a <= .002 || r <= 1) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(.45, rgba(col, a * .45)); g.addColorStop(1, rgba(col, 0));
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
const voileNoir = (ctx, a) => { if (a <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; };
// la sonde : une petite toile où l'on « dessine » le carnet pour savoir où écrit sa plume (l'œil la suit)
let SONDE = null;
const sonde = () => SONDE || (SONDE = toile(4, 4).getContext('2d'));
// une toile à soi pour le sujet nocturne, qu'on éclaire à part (assez grande pour ×6 couché, et son téléphone)
let CALQUE_NUIT = null;
const calqueNuit = () => CALQUE_NUIT || (CALQUE_NUIT = toile(800, 800).getContext('2d'));
// une toile pour la moitié gauche de l'écran partagé (P18), qu'on pose en fondu
let CALQUE_G = null;
const calqueGauche = () => CALQUE_G || (CALQUE_G = toile(960, H).getContext('2d'));

// ---------------------------------------------------------------- les instants des mots, lus dans la boîte
// L'instant où le premier caractère de « mot » s'écrit dans la réplique id (13 car./s, les « … ») ; défaut sinon.
function instantMot(id, mot, defaut) {
  const r = REPLIQUES.find(x => x.id === id);
  if (!r) return defaut;
  const i = sansBalise(r.txt).replace(/\n/g, '').indexOf(mot);
  if (i < 0 || ecrits(r, r.a) <= i) return defaut;
  let a = r.de, b = r.a;
  for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (ecrits(r, m) > i) b = m; else a = m; }
  return b;
}
// pour les indices sonores (calculés au chargement) : sans risque hors d'un navigateur
function motSon(id, mot, defaut) { try { return +instantMot(id, mot, defaut).toFixed(2); } catch (e) { return defaut; } }
// les repères du lot (calculés à la première image : la boîte est alors réglée, ?ecriture= compris)
let REP = null;
function rep() {
  if (REP) return REP;
  REP = {
    ah: instantMot('R28', 'Ah', 161.28),
    aurait: instantMot('R29', 'aurait', 164.25),
    meme: instantMot('R30', 'Même', 165.87),
    choix: instantMot('R30', 'même choix', 166.91),
    change: instantMot('R30', 'Ce qui', 167.67),
    autres: instantMot('R30', 'autres', 169.9),
    pose: instantMot('R31', 'posé', 174.38),
    telephone: instantMot('R31', 'téléphone', 175.08),
    etIl: instantMot('R31', 'Et il', 175.85),
    dormi: instantMot('R31', 'dormi', 176.46),
    protocole: instantMot('R32', 'Protocole', 181.07),
    attacher: instantMot('R32', 'observer', 181.93),
    note: instantMot('R32', 'Je note', 183.72),
    echec: instantMot('R32', 'échec', 184.44),
    bleue: instantMot('R33', 'Bleue', 186.65),
    rouge: instantMot('R33', 'rouge', 187.42),
    depend: instantMot('R33', 'Ça dépend', 188.41),
    dit: instantMot('R33', 'dit', 191.41),
    chut: instantMot('R34', 'Chut', 193.08),
  };
  return REP;
}

// ================================================================ les instants du lot (SCENARIO.md, P17–P22)
const S = Object.freeze({
  pousse: 152.4, pousseFin: 153.6, plonge: 154.8,      // la poussée ×1 → ×3, la plongée ×3 → ×22
  iris: 154.4, irisFin: 155.2,                         // le sujet s'ouvre en 22 (le diaphragme)
  trouve: 154.95,                                      // ses crochets se referment : Phi l'a trouvé
  saut: 155.6,                                         // il rejoue son saut : il retombe bleu
  tampon: 156.6, peur: 156.75,                         // « LES BLEUS MEURENT », la peur
  regarde: 157.2, eteint: 157.6,                       // il regarde Phi ; Phi baisse sa lueur
  morts: 157.8, mortsFin: 158.4,                       // les 21 autres partent (des bords vers lui), en 1 s chacun
  depart: 158.8,                                       // lui, le dernier : les pieds à 158,9, la tête à 160,3
  // P18
  partage: 162.2, partageFin: 163.0,                   // le filet descend, l'image de droite gagne sa moitié
  irisG: 162.75, irisGFin: 163.55,                     // à gauche, un sujet bleu de la salle collective s'ouvre
  // P19
  descend: 171.7, recompose: 173.2,                    // ses caractères redescendent, le recomposent
  posees: 171.7 + .55 + .15 + .95,                     // la dernière est posée (RANG_DESCENTE, h(9) · 0,15, 0,95 s de vol)
  recomposeFin: 173.7,                                 // ses caractères se sont effacés sur le sujet éclairé
  // P21
  notif: 191.8, notifSortie: 192.4, notifRentre: 192.6, notifFin: 193.0,
  ferme: 194.4, fermeFin: 195.8,                       // l'œil se ferme, les pilules retombent en poussière
});

// ================================================================ la plongée : 1 sujet = 22 personnes
// Le sujet de la salle de droite où Phi plonge : la première colonne de sa foule (FOULES[1], co 0, rang 4 : bleu).
const CIBLE = FOULES[1].find(f => f.co === 0 && f.row === 4);
// La caméra de la slide (le monde de europe-salles.js) : ×1, puis ×3 sur la colonne, puis ×22 dans le sujet.
const CAM_A = Object.freeze([
  [S.pousse, 960, 540, 960, 540, 1],
  [S.pousseFin, CIBLE.cx, CIBLE.cy, 900, 450, 3],
  [S.plonge, CIBLE.cx, CIBLE.cy, 960, 440, 22],
]);
const camA = t => camera(t, CAM_A);
// Dedans : 22 personnes (1 % de sa salle : 2 222 ou 2 235, donnees.js), en quinconce comme les lames d'un diaphragme,
// cinq rangées de 4, 5, 4, 5, 4, au pas de la foule d'index.html (50 × 62), centrées sur l'origine du monde. Le N°48
// au bout de la rangée du milieu : (75, 0), la place qu'il avait dans la grille de 108 (les caméras n'ont pas bougé).
// Ses voisins sont des participants tirés par hache (pas des sujets de démonstration) ; lui est PREMIERS[47].
const RANGEES_M = [4, 5, 4, 5, 4], PXM = 50, PYM = 62;
const PLACES_M = RANGEES_M.flatMap((n, r) => [...Array(n).keys()].map(c => ({ x: (c - (n - 1) / 2) * PXM, y: (r - 2) * PYM })));
const placeM = j => PLACES_M[j];
const J48 = PLACES_M.findIndex(p => p.x === 75 && p.y === 0), P48 = Object.freeze(placeM(J48));
const N = PREMIERS[N48];
const gens = base => Object.freeze([...Array(PLACES_M.length).keys()].map(j => {
  const { x, y } = placeM(j), i = base + j;
  if (j === J48) return Object.freeze({ ...N, j, x, y });
  return Object.freeze({ i, j, x, y, r1: hache(i * 3 + 101), r2: hache(i * 5 + 202), r3: hache(i * 11 + 303), coiffe: Math.floor(hache(i * 7 + 3) * COIFFES.length), detail: hache(i * 17 + 11) < .2 ? 1 : 0 });
}));
const DROITE = gens(30000);   // la salle individuelle (ils ont tous pris la bleue)
const GAUCHE = gens(50000);   // la salle collective (pareil : un sujet bleu, ouvert)
// les 21 autres partent des bords vers lui : le vide se referme sur lui, il est le dernier
const DMAX = Math.max(...DROITE.map(f => Math.hypot(f.x - P48.x, f.y - P48.y)));
const MORT = new Map(DROITE.map(f => [f.j, S.morts + (1 - Math.hypot(f.x - P48.x, f.y - P48.y) / DMAX) * (S.mortsFin - S.morts) + hache(f.i * 13 + 5) * .08]));
// La caméra du dedans : le sujet s'ouvre (×0,9, toute la grille dans l'ouverture), on avance (×1,3), puis le
// travelling sur lui jusqu'à la taille d'un gros plan d'isoloir (×4,2), et une poussée très lente.
const C_IRIS = camA(S.iris).ecran(CIBLE.cx, CIBLE.cy);
const CAM_B = Object.freeze([
  [S.iris, 0, 0, C_IRIS.x, C_IRIS.y, .9],
  [155.1, 0, 0, 960, 440, 1.3],
  [156.2, P48.x, P48.y, 880, 460, 4.2],
  [S.partage, P48.x, P48.y, 880, 460, 4.4],
]);
// P18 : chaque moitié à la taille du plan précédent, très lente poussée des deux côtés
const CAM_R = Object.freeze([
  [S.partage, P48.x, P48.y, 880, 460, 4.4],
  [S.partageFin, P48.x, P48.y, 1440, 460, 4.4],
  [172.2, P48.x, P48.y, 1440, 460, 4.7],
]);
const CAM_L = Object.freeze([
  [S.irisG, P48.x, P48.y, 480, 460, 3.2],
  [163.7, P48.x, P48.y, 480, 460, 4.4],
  [172.2, P48.x, P48.y, 480, 460, 4.7],
]);
const camDroite = t => camera(t, t < S.partage ? CAM_B : CAM_R);
const camGauche = t => camera(t, CAM_L);
// le sujet de la salle collective qui s'ouvre à gauche (P18) : FOULES[0], colonne 0, rang 4 (bleu, vivant)
const CIBLE_G = FOULES[0].find(f => f.co === 0 && f.row === 4);
const C_IRIS_G = Object.freeze({ x: 480, y: 440 });

// ---------------------------------------------------------------- le diaphragme
// L'ouverture est celle de l'œil de Phi : un hexagone dont chaque côté se prolonge en lame (dessineOeil), qui
// tourne en s'ouvrant. On peint le dedans partout, puis le dehors hors de l'hexagone, puis les lames.
function hexagone(ctx, cx, cy, r, rot) {
  for (let k = 0; k < 6; k++) { const a = rot + k * Math.PI / 3, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
  ctx.closePath();
}
function horsHexagone(ctx, cx, cy, r, rot, rect = [0, 0, W, H]) {
  ctx.beginPath(); ctx.rect(...rect); hexagone(ctx, cx, cy, r, rot); ctx.clip('evenodd');
}
function lames(ctx, cx, cy, r, rot, a) {
  if (a <= .01 || r <= .5) return;
  const U = [...Array(6).keys()].map(k => [Math.cos(rot + k * Math.PI / 3), Math.sin(rot + k * Math.PI / 3)]);
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = CRAIE; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const p = (k + 5) % 6, dx = U[k][0] - U[p][0], dy = U[k][1] - U[p][1], L = Math.hypot(dx, dy);
    ctx.moveTo(cx + r * U[p][0], cy + r * U[p][1]); ctx.lineTo(cx + r * U[k][0] + dx / L * 2600, cy + r * U[k][1] + dy / L * 2600);
  }
  ctx.stroke(); ctx.restore();
}
// l'ouverture à l'instant t (de t0 à t1) : rayon (de 0 à rmax), rotation (les lames tournent de 48°)
function ouverture(t, t0, t1, rmax) {
  const k = seg(t, t0, t1), e = eIO(k);
  return { k, r: rmax * e, rot: -Math.PI / 2 + e * Math.PI * .27, lame: 1 - seg(k, .55, 1) };
}

// ================================================================ ses caractères : de sa mort à sa nuit
// Chaque case de son corps, au moment où il part (la peur, il regarde Phi), devient un caractère '01·:+*#%xφ'
// qui monte (des pieds à la tête, comme la dissolution d'index.html), vire à la craie, et ne s'en va pas : il reste
// en l'air au-dessus de ses crochets, petite étoile qui scintille (P17, P18). En P19, les mêmes redescendent et se
// posent, case par case, sur le sujet nocturne de P01 (la dissolution à l'envers). Tout est fonction de t.
const RANG_DEPART = y => S.depart + .1 + (SH - 1 - y) / (SH - 1) * 1.4;   // la rangée y part à cet instant (les pieds d’abord)
let BRAISES = null;
function braises() {
  if (BRAISES) return BRAISES;
  const cam = camDroite(S.depart), s = cam.ecran(P48.x, P48.y), phi = placeOeil(S.depart);
  const A = sprite(BLEU, pose(N, { col: BLEU, mode: 'peur', k: .8, fixe: true, cible: phi, phi }, S.depart, s.x, s.y).p);
  // elles se posent sur le sprite EXACT que nuitIssue dessine quand elles s'effacent (même état, même instant : sa
  // respiration le baisse d'une case à 173,32 ; une cible prise à 173,2 laissait deux têtes et deux paires d'yeux)
  const B = sprite(GRIS_FIG, pose(N, sujetNuit(etatNuit(S.recomposeFin)), S.recomposeFin, 0, 0).p);
  const cases = sp => { const out = []; sp.g.forEach((v, k) => { if (v) out.push({ x: k % SW, y: Math.floor(k / SW), ton: sp.T[v] }); }); return out; };
  const cA = cases(A), cB = cases(B), n = Math.max(cA.length, cB.length);
  BRAISES = Object.freeze([...Array(n).keys()].map(k => {
    const a = cA[k % cA.length], b = cB[k % cB.length], h = m => hache(k * 7919 + m * 104729 + 4848);
    return Object.freeze({
      a, b, ph: h(1) * 6.283, ph2: h(2) * 6.283, vol: .9 + h(3) * .6, g: Math.floor(h(4) * G.length), fl: .25 + h(5) * .6,
      ...etoile(h(6), h(7)), tw: 1.3 + h(8) * 2.2, gr: 3.6 + h(10) * 1.8,           // sa place d'étoile, sa taille (monde du dedans)
      d3: RANG_DESCENTE(b.y) + h(9) * .15,                                          // sa descente (P19)
    });
  }));
  return BRAISES;
}
const RANG_DESCENTE = y => S.descend + (y / (SH - 1)) * .55;   // la tête se pose d'abord, les pieds en dernier
// sa place d'étoile : une ellipse (36 × 15) centrée 54 au-dessus de lui, plus dense au milieu
const etoile = (a, b) => { const r = Math.pow(b, .75), an = a * 6.283; return { hx: Math.cos(an) * r * 36, hy: -54 + Math.sin(an) * r * 15 }; };
// la place (monde du dedans, relative à lui) d'une étoile à l'instant t : sa montée, puis sa dérive lente
function placeBraise(B, t) {
  const ox = -SW * CS / 2 + B.a.x * CS + CS / 2, oy = -SH * CS / 2 + B.a.y * CS + CS / 2;
  const t0 = RANG_DEPART(B.a.y), u = seg(t, t0, t0 + B.vol), e = eIO(u);
  const monte = Math.max(0, t - 161) * .5;                                       // elles montent encore, très lentement
  const hx = B.hx + Math.sin(t * .45 + B.ph) * 3, hy = B.hy - monte + Math.sin(t * .6 + B.ph2) * 2;
  const sway = Math.sin(u * 5 + B.ph) * 10 * u * (1 - u) * 4;
  return { x: lerp(ox, hx, e) + sway, y: lerp(oy, hy, e), u };
}
// la nuit de P19 : le cadre de P01 (rapproché ×6, son centre en (960, 430)) ; le N°48 debout est à l'origine du monde
const CAM_NUIT = Object.freeze([[171.6, 0, 0, 960, 430, 6]]);
const CAM_NUIT_PETIT = Object.freeze([[0, 0, 0, 300, 720, 2]]);   // P20, P21 : ×2 en (300, 720)
const camNuit = t => camera(t, t < 178.4 ? CAM_NUIT : CAM_NUIT_PETIT);
// les étoiles à l'écran, à l'instant t : { x, y, taille (px), forme ('case' | 'car'), c, a }
function braisesEcran(t) {
  const out = [];
  if (t < S.depart) return out;
  const cam = camDroite(t), z = cam.z, nuit = camNuit(Math.max(t, 171.6)), zn = nuit.z, csn = 4 * zn;
  const oxn = Math.round(nuit.ecran(0, 0).x - SW * csn / 2), oyn = Math.round(nuit.ecran(0, 0).y - SH * csn / 2);
  for (const B of braises()) {
    const p = placeBraise(B, t);
    if (p.u <= 0) continue;                       // pas encore partie : son corps la dessine
    const s = cam.ecran(P48.x + p.x, P48.y + p.y);
    const ui = seg(p.u, .1, 1);
    let x = s.x, y = s.y, forme = p.u < .12 ? 'case' : 'car';
    let taille = forme === 'case' ? CS * z : lerp(9, B.gr, eIO(ui)) * z;
    let c = forme === 'case' ? B.a.ton : mix(BLEU, CRAIE, seg(p.u, .1, .75));
    const scint = .62 + .3 * Math.sin(t * B.tw + B.ph);
    let a = lerp(.95, scint, seg(p.u, .6, 1));
    // P19 : la descente, vers sa case du sujet nocturne
    const v = seg(t, B.d3, B.d3 + .95);
    if (v > 0) {
      const ev = eIO(v), cx = oxn + B.b.x * csn + csn / 2, cy = oyn + B.b.y * csn + csn / 2;
      x = lerp(x, cx, ev) + Math.sin(v * 4 + B.ph) * 26 * v * (1 - v) * 4; y = lerp(y, cy, ev);
      forme = v < .86 ? 'car' : 'case';
      taille = forme === 'case' ? csn : lerp(taille, 13, ev);
      c = v < .86 ? mix(CRAIE, B.b.ton, seg(v, .4, .86)) : B.b.ton;
      a = lerp(a, 1, seg(v, 0, .5));
    }
    const g = G[(B.g + Math.floor(t * B.fl)) % G.length];
    out.push({ x, y, taille, forme, c, a, g });
  }
  return out;
}
function dessineBraises(ctx, t, A = 1) {
  if (A <= .001) return;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const b of braisesEcran(t)) {
    ctx.globalAlpha = A * b.a; ctx.fillStyle = b.c;
    if (b.forme === 'case') ctx.fillRect(Math.round(b.x - b.taille / 2), Math.round(b.y - b.taille / 2), Math.round(b.taille), Math.round(b.taille));
    else { ctx.font = `${Math.max(6, Math.round(b.taille))}px ${MONO}`; ctx.fillText(b.g, Math.round(b.x), Math.round(b.y)); }
  }
  ctx.globalAlpha = 1;
}
// le centre de ce qui reste de lui (pour que Phi le suive des yeux jusqu'au bout)
function centreBraises(t) {
  const L = braisesEcran(t);
  if (!L.length) return visage48(t);
  let x = 0, y = 0; for (const b of L) { x += b.x; y += b.y; }
  // tant que sa tête est là, Phi la regarde ; ensuite, le nuage
  if (t < RANG_DEPART(3)) return visage48(t);
  return { x: x / L.length, y: y / L.length };
}

// ================================================================ les deux salles du dedans
const visage48 = t => camDroite(t).ecran(P48.x, P48.y - 12);
const visageFantome = t => camGauche(t).ecran(P48.x, P48.y - 12);
const chaud = t => .85 * eOut(seg(t, S.tampon, S.tampon + .9));
// une personne de la salle de droite (pas lui) : bleue ; la peur ; elle part en caractères
function etatDroite(f, t, phi) {
  const e = { col: BLEU, mode: 'repos', phi, cible: phi, reflet: true };
  if (t >= S.peur + f.r1 * .4) { e.mode = 'peur'; e.k = .8; }
  const td = MORT.get(f.j);
  if (t >= td) e.dis = seg(t, td, td + 1);
  return e;
}
// lui : GRIS (on n'a jamais vu sa couleur) ; il rejoue son saut à 155,6 et retombe BLEU (la couleur change au sommet,
// comme dans index.html) ; la peur ; il regarde Phi à 157,2 et ne le quitte plus des yeux
function etatLui(t, phi) {
  const col = t < S.saut + .13 ? GRIS_FIG : BLEU;
  if (t >= S.saut - .2 && t < S.saut + .45) return { col, mode: 'saut', t0: S.saut, phi, cible: phi, reflet: true };
  if (t < S.peur + .1) return { col, mode: 'repos', phi, cible: phi, reflet: true, fixe: t > S.trouve + .25 && t < S.trouve + 1 };
  return { col, mode: 'peur', k: .8, phi, cible: phi, fixe: t >= S.regarde, reflet: true };
}
// le monde de droite (la salle individuelle, ouverte) sous la caméra cam ; phi : l'œil à l'écran
function mondeDroite(ctx, t, cam, phi) {
  const z = cam.z, cs = 4 * z, c = cam.ecran(P48.x, P48.y);
  fond(ctx, t, { centre: [c.x, c.y], chaud: chaud(t), sol: 0, poussiere: .8 });
  for (const f of DROITE) {
    if (f.j === J48) continue;
    const e = etatDroite(f, t, phi);
    if (e.dis >= 1) continue;
    const s = cam.ecran(f.x, f.y);
    if (s.x < -30 * z || s.x > W + 30 * z || s.y < -30 * z || s.y > H + (e.dis > 0 ? 800 : 30 * z)) continue;
    dessineSujet(ctx, f, s.x, s.y, cs, e, t);
  }
  lui(ctx, t, cam, phi);
  // l'éclair de craie, au sommet du saut (celui de P12, qui cachait sa couleur ; ici, à peine : on la voit)
  const fl = cloche(t, S.saut + .1, S.saut + .14, S.saut + .2, S.saut + .5);
  if (fl > 0) lueur(ctx, c.x, c.y - 10 * z, 46 * z, CRAIE, .34 * fl);
}
// lui, jusqu'à son départ ; pendant, seulement les rangées qui ne sont pas encore parties (le reste : ses étoiles)
function lui(ctx, t, cam, phi) {
  const z = cam.z, cs = 4 * z, s = cam.ecran(P48.x, P48.y), e = etatLui(t, phi);
  if (t < S.depart) { dessineSujet(ctx, N, s.x, s.y, cs, e, t); return; }
  let yMin = SH; while (yMin > 0 && RANG_DEPART(yMin - 1) <= t) yMin--;
  if (yMin <= 0) return;
  const oy = Math.round(s.y - SH * cs / 2);
  ctx.save(); ctx.beginPath(); ctx.rect(s.x - 40 * z, oy - 40 * z, 80 * z, 40 * z + yMin * cs); ctx.clip();
  dessineSujet(ctx, N, s.x, s.y, cs, e, t);
  ctx.restore();
}
// le monde de gauche (la salle collective, ouverte) : 22 vivants, bras au ciel, halos ; à sa place, son fantôme
function mondeGauche(ctx, t, cam, phi) {
  const z = cam.z, cs = 4 * z, c = cam.ecran(P48.x, P48.y);
  fond(ctx, t, { centre: [c.x, c.y], clair: .65, sol: 0, poussiere: .8 });
  for (const f of GAUCHE) {
    if (f.j === J48) continue;
    const s = cam.ecran(f.x, f.y);
    if (s.x < -40 * z || s.x > 960 + 40 * z || s.y < -40 * z || s.y > H + 40 * z) continue;
    dessineSujet(ctx, f, s.x, s.y, cs, { col: BLEU, mode: 'vie', k: .85, phi, cible: phi, reflet: true }, t);
  }
  fantome(ctx, t, c.x, c.y, cs, phi);
}
// ---------------------------------------------------------------- le fantôme du N°48 (P18)
// Son contour seul, 2 px, laiton, avec sa frange (le bord entre la coiffe et le visage) et ses yeux ; sur « Même
// personne » il s'allume ; sur « même choix » il se remplit de bleu (c'est lui) ; puis il lève les bras.
function fantome(ctx, t, cx, cy, cs, phi) {
  const R = rep(), plein = (R.meme + R.choix) / 2, kb = eIO(seg(t, plein, plein + .5)), bras = R.choix + .1;
  const vie = seg(t, bras, bras + .4);
  // le halo laiton, puis celui de la vie
  const ah = (.22 + .3 * cloche(t, R.meme, R.meme + .2, plein, plein + .5)) * (1 - kb);
  if (ah > .01) { const r = 40 * cs / CS; ctx.globalAlpha = ah; ctx.drawImage(halo(LAITON), cx - r, cy - r, 2 * r, 2 * r); ctx.globalAlpha = 1; }
  if (kb > 0) dessineSujet(ctx, N, cx, cy, cs, t >= bras ? { col: BLEU, a: kb, mode: 'vie', k: .85 * vie, phi, cible: phi, reflet: true } : { col: BLEU, a: kb, mode: 'trace', ouverts: true, phi, reflet: true }, t);
  const ac = (.85 + .15 * cloche(t, R.meme, R.meme + .2, R.meme + .8, R.meme + 1.3)) * (1 - seg(t, plein + .2, bras + .2));
  if (ac <= .01) return;
  const { p } = pose(N, { col: LAITON, mode: 'trace', ouverts: true, phi }, t, cx, cy);
  const sp = sprite(LAITON, p), g = sp.g, occ = (x, y) => x >= 0 && x < SW && y >= 0 && y < SH && g[y * SW + x] > 0;
  // la coiffe (la frange), à sa place sur la tête : le bord entre elle et le visage se dessine aussi
  const dt = p.acc + p.bob, coiffe = new Set((COIFFES[p.coiffe] || []).map(([x, y]) => (y + dt) * SW + x));
  const ox = Math.round(cx - SW * cs / 2), oy = Math.round(cy - SH * cs / 2), lw = 2, d = lw / 2;
  ctx.save(); ctx.globalAlpha = ac; ctx.strokeStyle = LAITON; ctx.lineWidth = lw; ctx.lineCap = 'square'; ctx.beginPath();
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
    if (!occ(x, y)) continue;
    const x0 = ox + x * cs, y0 = oy + y * cs, x1 = x0 + cs, y1 = y0 + cs, ici = coiffe.has(y * SW + x);
    const bord = (nx, ny) => !occ(nx, ny) || (ici !== coiffe.has(ny * SW + nx) && ny > y);
    if (!occ(x, y - 1)) { ctx.moveTo(x0, y0 + d); ctx.lineTo(x1, y0 + d); }
    if (bord(x, y + 1)) { ctx.moveTo(x0, y1 - d); ctx.lineTo(x1, y1 - d); }
    if (!occ(x - 1, y)) { ctx.moveTo(x0 + d, y0); ctx.lineTo(x0 + d, y1); }
    if (!occ(x + 1, y)) { ctx.moveTo(x1 - d, y0); ctx.lineTo(x1 - d, y1); }
  }
  ctx.stroke();
  // les yeux : deux petites cases pleines (il regarde)
  ctx.fillStyle = LAITON;
  g.forEach((v, k) => { if (v === 4) ctx.fillRect(ox + (k % SW) * cs + cs * .25, oy + Math.floor(k / SW) * cs + cs * .25, cs * .5, cs * .5); });
  ctx.restore();
}
// le halo d'une couleur (une petite toile, comme halo() de commun.js, qui n'est pas exporté pour le laiton seul)
const HALOS = new Map();
function halo(col) {
  if (!HALOS.has(col)) {
    const c = toile(80, 80), g = c.getContext('2d'), r = g.createRadialGradient(40, 40, 0, 40, 40, 40);
    r.addColorStop(0, rgba(col, .45)); r.addColorStop(1, rgba(col, 0)); g.fillStyle = r; g.fillRect(0, 0, 80, 80); HALOS.set(col, c);
  }
  return HALOS.get(col);
}

// ================================================================ Phi : un seul œil pour tout le lot
// Sa place [x, y, taille] : au centre de la slide (P16), au bord pendant la poussée, au sommet du filet (P18), en haut
// à droite dans la nuit (P19), à gauche du carnet (P20), au centre (P21).
const PLACES = Object.freeze([
  [151.8, [960, 520, 170]], [S.pousse, [960, 520, 170]], [S.pousseFin, [1700, 200, 130]],
  [S.partage, [1700, 200, 130]], [S.partageFin, [960, 90, 90]],
  [172.6, [960, 90, 90]], [173.6, [1600, 220, 120]],
  [178.399, [1600, 220, 120]], [178.4, [250, 420, 200]],                 // P20 : coupe (il ne traverse pas le carnet)
  [185.4, [250, 420, 200]], [186.4, [960, 400, 300]],
]);
// le centre vrai de l'œil (avec son flottement) : pour la lumière et les regards des sujets
function placeOeil(t) { const [x, y, s] = cles(t, PLACES); return { x, y: y + flotte(t), s, y0: y }; }
let PHI = null;
function phiLot() {
  if (PHI) return PHI;
  const R = rep();
  const cherche = T => { const f = DROITE[Math.floor(hache(Math.floor(T / .12) * 53 + 7) * DROITE.length)]; return camera(T, CAM_B).ecran(f.x, f.y - 12); };
  const vide = T => camDroite(T).ecran(P48.x, P48.y);
  const regard = creeRegard({
    cibles: [
      [151.2, 1.2, point(1340, 400)],                                    // (P16 : vers la salle de droite)
      [S.pousse, S.plonge - S.pousse + .05, T => camA(T).ecran(CIBLE.cx, CIBLE.cy - 8), .2],   // la colonne, le sujet
      [S.iris + .05, S.trouve - S.iris - .05, cherche, .12],            // il cherche, parmi les 22…
      [S.trouve, S.tampon - S.trouve, visage48, .2],                     // … le trouve, et le suit
      [S.tampon, .45, point(TAMPON.x, TAMPON.y)],                        // le tampon qui tombe
      [S.tampon + .45, S.depart - S.tampon - .45, visage48, .3],        // ils se regardent
      [S.depart, R.ah - S.depart - .1, centreBraises, .22],              // il le suit des yeux jusqu'au bout
      [R.ah - .1, S.partage - R.ah + .1, vide],                          // « Ah. » : sa place vide
      [S.partage, S.partageFin - S.partage + .3, vide, .2],              // P18 : la droite gagne sa moitié
      [S.irisGFin - .2, .9, visageFantome],                              // il compare : à gauche…
      [R.aurait, .8, vide],                                              // … à droite…
      [R.meme - .3, R.change - R.meme + .3, visageFantome, .3],          // … à gauche : c'est lui
      [R.change, .75, point(TEXTE_G.x, TEXTE_G.y)], [R.change + .75, .85, point(TEXTE_D.x, TEXTE_D.y)],   // ce qu'ils ont lu
      [R.change + 1.6, 1.0, visageFantome],
      [R.autres - .2, 171.7 - R.autres + .2, T => centreBraises(T), .3],  // ses étoiles
      [171.7, S.recompose - 171.7 + .2, centreBraises, .2],              // P19 : elles redescendent
      [S.recompose + .2, 178.4 - S.recompose - .2, T => visageNuit(T), .4],   // lui, dans sa nuit
      [178.4, .7, T => centrePage(T)],                                   // P20 : le carnet s'ouvre
      [AJOUTS.hypothese.t - .05, R.protocole - AJOUTS.hypothese.t + .05, plumePage, .1],   // la plume ajoute
      [R.protocole, R.attacher - R.protocole, protocoleFin],             // « Protocole »…
      [R.attacher, R.note - R.attacher, T => visageNuit(T)],             // … « observer sans s'attacher » : lui
      [R.note, AJOUTS.protocole.t - R.note, VOUS],                       // « Je note »
      [AJOUTS.protocole.t - .05, .7, plumePage, .1],                     // « → échec »
      [185.2, R.bleue - 185.2, VOUS],                                    // P21 : à vous
      [R.bleue, .55, point(PILULE_B.x, PILULE_B.y)], [R.rouge, .5, point(PILULE_R.x, PILULE_R.y)],
      [R.rouge + .5, S.notif + .2 - R.rouge - .5, VOUS],                // « Ça dépend. De comment je vous l'aurais dit. »
      [S.notif + .2, S.notifRentre - S.notif - .2, notifCentre, .15],     // la notification
      [S.notifRentre, R.chut - S.notifRentre, telephone, .15],           // elle rentre
      [R.chut, S.ferme - R.chut, T => visageNuit(T)],                    // « Chut. Il dort. »
      [S.ferme, 6, VOUS],
    ],
    repos: [[1, VOUS]],
  });
  // les humeurs (un nom : la forme entière ; un objet : posé sur l'humeur d'avant)
  const humeurs = [
    [S.saut + .05, 'doute', .4], [S.tampon - .2, 'neutre', .4],
    [S.regarde, { r: 15, glow: .3 }, .35], [S.eteint, { r: 11.5, glow: .12 }, .9],        // il le regarde ; la lueur baisse
    [R.ah - .05, { x: 0, y: 6, r: 10.5, rot: 0, glow: .1 }, .6],                         // « Ah. »
    [S.partageFin, { ...HUMEURS.neutre, glow: .2 }, .9],
    [R.aurait, 'doute', .6], [R.meme, { ...HUMEURS.neutre, glow: .3 }, .5],
    [R.change, 'curieux', .5], [R.autres, { ...HUMEURS.neutre, glow: .3 }, .6],
    [171.8, { glow: .1 }, 1.2],                                                          // la nuit : lueur à 0,1
    [178.5, 'neutre', .7],
    [R.echec, 'bas', .4], [185.2, 'grand', .4], [186.1, 'neutre', .6],                   // « échec », puis un sourire
    [R.depend, 'curieux', .5], [190.3, 'neutre', .6],
    [R.dit - .1, { r: 14.5, glow: .6 }, .35], [S.notif + .1, 'neutre', .3],               // « … dit. » : malicieux
    [R.chut, { ...HUMEURS.bas, glow: .25 }, .6],
  ];
  PHI = { regard, humeurs };
  return PHI;
}
// l'état de l'œil à l'instant t (calculé une fois par image, pour les sujets et pour l'œil)
function etatPhi(t) {
  const L = phiLot(), O = placeOeil(t), h = humeur(t, L.humeurs);
  const g = L.regard.pupille(t, O.x, O.y, h.r);
  return { O, h, g, c: { x: O.x, y: O.y } };
}
function dessinePhi(ctx, t, P, o = {}) {
  oeil(ctx, t, { x: P.O.x, y: P.O.y0, taille: P.O.s, humeur: P.h, regard: P.g, ...o });
}

// ================================================================ P17 · 151,8–162,2 · Le N°48, retrouvé
const TAMPON = Object.freeze({ x: 820, y: 100 });
function dessineP17(ctx, t) {
  const P = etatPhi(t), I = ouverture(t, S.iris, S.irisFin, 1450);
  const ci = camA(t).ecran(CIBLE.cx, CIBLE.cy);
  // le dedans (dès que le sujet s'ouvre)
  if (t >= S.iris) mondeDroite(ctx, t, camDroite(t), P.c);
  // la slide (P16), sous sa caméra, hors de l'ouverture
  if (I.k < 1) {
    ctx.save();
    if (I.r > 0) horsHexagone(ctx, ci.x, ci.y, I.r, I.rot);
    fondDiapo(ctx, t);
    // pendant la poussée, la slide agrandie passe sous la boîte de dialogue, qui est translucide : « = 1 % », « de sa
    // salle », « 81 % », le tampon s'y lisaient derrière la réplique (« Et le numéro 4 = 1 % »). La slide n'est pas
    // peinte sous la boîte ni sous son étiquette XPHI (leurs cadres extérieurs) : comme en P16, la boîte est sur le fond.
    // (dès que la caméra pousse : à ×1, l'image de P16 reste la même au pixel près, la coupe ne se voit pas)
    if (camA(t).z > 1.0005) sousBoite(ctx);
    const cam = camA(t), phi = cam.monde(P.c.x, P.c.y), vise = P.g.pose && cam.monde(P.g.pose.x, P.g.pose.y);
    ctx.save(); cam.applique(ctx);
    diapo(ctx, t, { min: MINUTAGE, phi, pose: vise && { ...vise, t: P.g.pose.t }, vague: MINUTAGE.gauche.issue, reflet: cligne(t) > .5, fond: false });
    ctx.restore();
    ctx.restore();
    // le bord de l'ouverture et ses lames
    if (I.r > 0) {
      lames(ctx, ci.x, ci.y, I.r, I.rot, .75 * I.lame);
      ctx.save(); ctx.globalAlpha = .9 * I.lame; ctx.strokeStyle = CRAIE; ctx.lineWidth = 3; ctx.beginPath(); hexagone(ctx, ci.x, ci.y, I.r, I.rot); ctx.stroke(); ctx.restore();
    }
  }
  // ses crochets : ils se referment quand Phi le trouve, et restent autour du vide
  if (t >= S.trouve - .05) {
    const cam = camDroite(t), s = cam.ecran(P48.x, P48.y);
    crochets(ctx, s.x, s.y, cam.z, { a: seg(t, S.trouve - .05, S.trouve + .1), k: seg(t, S.trouve, S.trouve + .4) });
  }
  dessineBraises(ctx, t);
  // « LES BLEUS MEURENT » tombe en haut de l'image (le tampon de donnees.html, plus grand)
  tampon(ctx, t, { t: S.tampon, segs: [{ s: 'LES ', c: CRAIE }, { s: 'BLEUS', c: BLEU_TXT }, { s: ' MEURENT', c: CRAIE }], taille: 50, x: TAMPON.x, y: TAMPON.y, rot: -4, fond: .88, marge: 76, a: 1 - seg(t, 160.4, 161.0) });
  legendesP17(ctx, t);
  ombreOeil(ctx, P, .85 * seg(t, S.pousse + .3, S.pousseFin));   // l'œil se détache de la foule
  dessinePhi(ctx, t, P);
}
// la découpe « tout sauf la boîte de dialogue et son étiquette » (texte.js, BOITE : x 80–1840, y 862–1040, cadre laiton
// à 7,5 px ; l'étiquette XPHI : fenetre(112, 838, 132, 44)) : deux découpes successives, l'intersection des deux
function sousBoite(ctx) {
  for (const [x, y, w, h] of [[80 - 9, 862 - 9, 1760 + 18, 178 + 18], [112 - 9, 838 - 9, 132 + 18, 44 + 18]]) {
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(x, y, w, h); ctx.clip('evenodd');
  }
}
// en bas à gauche, pendant la plongée : ce que vaut un sujet, et combien ils sont (chiffres de Monsieur Phi)
const LEGENDE1 = fr(`1${NB}sujet = ${PAR_SUJET} personnes`);
const LEGENDE2 = fr(`[b]bleues[/b], description individuelle : ${nombre(CHOIX.individuelle.bleues)} personnes`);
function legendesP17(ctx, t) {
  const fin = 1 - seg(t, 160.4, 161.0);
  const a1 = seg(t, 154.0, 154.35) * fin, a2 = fin, n2 = Math.floor((t - 155.25) * 60);
  if (a1 <= 0) return;
  const monte = eIO(seg(t, 155.0, 155.3)) * 26;
  // une ombre douce sous les légendes : elles passent sur la foule
  ctx.save(); ctx.translate(330, 784); ctx.scale(1, .13);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 420);
  g.addColorStop(0, 'rgba(12,11,13,.85)'); g.addColorStop(.65, 'rgba(12,11,13,.7)'); g.addColorStop(1, 'rgba(12,11,13,0)');
  ctx.globalAlpha = a1; ctx.fillStyle = g; ctx.fillRect(-420, -420, 840, 840); ctx.restore();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = `18px ${MONO}`;
  ctx.globalAlpha = a1; ctx.fillStyle = GRIS; ctx.fillText(LEGENDE1, 80, 800 - monte);
  if (n2 > 0) { ctx.globalAlpha = a2; ecrit(ctx, balise(LEGENDE2, GRIS), 80, 800, 0, n2); }
  ctx.globalAlpha = 1;
}

// ================================================================ P18 · 162,2–171,6 · L'autre salle
const TEXTE_G = Object.freeze({ x: 470, y: 84 }), TEXTE_D = Object.freeze({ x: 1450, y: 84 });
function dessineP18(ctx, t) {
  const P = etatPhi(t), k = eIO(seg(t, S.partage, S.partageFin));
  // à droite : le vide (l'image de P17, qui gagne sa moitié)
  mondeDroite(ctx, t, camDroite(t), P.c);
  { const cam = camDroite(t), s = cam.ecran(P48.x, P48.y); crochets(ctx, s.x, s.y, cam.z, {}); }
  // à gauche : l'autre salle apparaît pendant que le filet descend (peinte à part, posée en fondu)
  const aL = eIO(seg(t, S.partage + .1, S.partageFin));
  if (aL > 0) {
    const L = calqueGauche();
    L.setTransform(1, 0, 0, 1, 0, 0); L.globalAlpha = 1; L.globalCompositeOperation = 'source-over'; L.clearRect(0, 0, 960, H);
    gaucheP18(L, t, P);
    ctx.globalAlpha = aL; ctx.drawImage(L.canvas, 0, 0); ctx.globalAlpha = 1;
  }
  // au-dessus de chaque moitié, ce que ses voisins ont lu
  lectures(ctx, t);
  // le filet laiton (il s'interrompt autour de l'œil, qui s'y pose comme une perle)
  const yF = 830 * k, gap = Math.abs(P.O.x - 960) < 60 ? [P.c.y - 44, P.c.y + 44] : null;
  if (gap) { filet(ctx, 960, 0, Math.min(yF, gap[0])); if (yF > gap[1]) filet(ctx, 960, gap[1], yF); }
  else filet(ctx, 960, 0, yF);
  dessineBraises(ctx, t);
  ombreOeil(ctx, P, .85);
  dessinePhi(ctx, t, P);
}
// la moitié gauche : un sujet bleu de la salle collective, en très gros plan ; il s'ouvre comme à droite
function gaucheP18(ctx, t, P) {
  const I = ouverture(t, S.irisG, S.irisGFin, 1000), cam = camGauche(t);
  if (t >= S.irisG) mondeGauche(ctx, t, cam, P.c);
  if (I.k < 1) {
    ctx.save();
    if (I.r > 0) horsHexagone(ctx, C_IRIS_G.x, C_IRIS_G.y, I.r, I.rot, [0, 0, 960, H]);
    fond(ctx, t, { centre: [480, 440], clair: .65, sol: 0, poussiere: .8 });
    const z = lerp(15, 19, eOut(seg(t, S.partage, S.irisGFin)));
    dessineSujet(ctx, CIBLE_G, C_IRIS_G.x, C_IRIS_G.y, 4 * z, { col: BLEU, mode: 'trace', ouverts: true, halo: .5, phi: P.c }, t);
    ctx.restore();
    if (I.r > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 960, H); ctx.clip();
      lames(ctx, C_IRIS_G.x, C_IRIS_G.y, I.r, I.rot, .75 * I.lame);
      ctx.globalAlpha = .9 * I.lame; ctx.strokeStyle = CRAIE; ctx.lineWidth = 3; ctx.beginPath(); hexagone(ctx, C_IRIS_G.x, C_IRIS_G.y, I.r, I.rot); ctx.stroke();
      ctx.restore();
    }
  }
  // ses crochets, autour du fantôme, à la même place qu'à droite
  if (t >= S.irisG + .5) { const s = cam.ecran(P48.x, P48.y); crochets(ctx, s.x, s.y, cam.z, { a: seg(t, S.irisG + .5, S.irisG + .7), k: seg(t, S.irisG + .55, S.irisGFin + .2) }); }
}
// « Ce qui change » : la description que chaque moitié a lue, écrite au-dessus d'elle, de GRIS à CRAIE
const LECTURES = Object.freeze([
  { titre: 'DESCRIPTION COLLECTIVE', txt: cite(DESCRIPTIONS.collective), x: 72 },
  { titre: 'DESCRIPTION INDIVIDUELLE', txt: cite(DESCRIPTIONS.individuelle), x: 1048 },
]);
let LIGNES_LECT = null;
const TEINTE_BASE = '#010203';   // la couleur de base, posée à l'écriture (de GRIS à CRAIE) ; le bleu et le rouge restent
function lectures(ctx, t) {
  const R = rep(), t0 = R.change, a = seg(t, t0 - .25, t0 + .1);
  if (a <= 0) return;
  // une bande sombre en haut, pour qu'on lise par-dessus les foules
  const g = ctx.createLinearGradient(0, 0, 0, 190);
  g.addColorStop(0, 'rgba(12,11,13,.9)'); g.addColorStop(.62, 'rgba(12,11,13,.72)'); g.addColorStop(1, 'rgba(12,11,13,0)');
  ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(0, 0, W, 190);
  const base = mix(GRIS, CRAIE, seg(t, t0 + .6, 169.4));
  ctx.font = `18px ${MONO}`;
  if (!LIGNES_LECT) LIGNES_LECT = LECTURES.map(L => coupeBalise(ctx, L.txt, 800, TEINTE_BASE));
  LECTURES.forEach((L, i) => {
    ctx.globalAlpha = a; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = `500 13px ${MONO}`; ctx.fillStyle = SURTITRE; espace(ctx, L.titre, L.x, 46, 2.5);
    ctx.font = `18px ${MONO}`;
    const lignes = LIGNES_LECT[i].map(l => l.map(sg => (sg.c === TEINTE_BASE ? { s: sg.s, c: base } : sg)));
    ecrit(ctx, lignes, L.x, 80, 27, Math.floor((t - t0) * 90));
  });
  ctx.globalAlpha = 1;
}

// ================================================================ le sujet nocturne (P19–P21)
// Sur le modèle de nuitScene (plans/nuit.js) : le fond de nuit, la lueur LABO du téléphone derrière lui, le sujet peint
// à part puis éclairé (la seule lumière est le téléphone : le visage et les mains la prennent, le reste dans l'ombre).
// Le N°48 debout est à l'origine du monde. o : {
//   lum (0..1 : le téléphone éclaire), tel (null : dans ses mains ; sinon { x, y, w, h } : posé, monde), ecran (0..1),
//   etat ('tient' | 'pose' | 'couche'), k (0..1 : il se couche), yeux, regard ({ yx, yy }), reflet, a (1), fond (true) }
const TEL_MAINS = Object.freeze({ x: -6, y: 8, w: 8, h: 8 });     // les cases T du calque « tient » (x 4–5, y 8–9)
const TEL_SOL = Object.freeze({ x: -38, y: 20, w: 12, h: 4 });    // posé par terre, à côté de sa tête : 3 × 1 cases
// couché, son centre se pose ici (monde) : le bas du corps sur la ligne de ses pieds, les cases sur la grille debout
const COUCHE = Object.freeze({ x: 2, y: 10 });
function nuitIssue(ctx, t, cam, o) {
  const { lum = 1, ecran = 1, etat = 'tient', k = 0, a = 1 } = o;
  if (o.fond !== false) fond(ctx, t, FOND_NUIT);
  const z = cam.z, cs = 4 * z, c = cam.ecran(0, 0);
  const T0 = o.tel || TEL_MAINS, L = cam.ecran(T0.x + T0.w / 2, T0.y + T0.h / 2);
  const e = sujetNuit(o);
  // la lueur du téléphone, derrière lui
  lueur(ctx, L.x, L.y - cs * 1.5, 260 * z / 6, LABO, .18 * lum);
  // le sujet, peint à part
  const Sx = calqueNuit(), m = Sx.canvas.width / 2, bx = Math.round(c.x) - m, by = Math.round(c.y) - m;
  Sx.setTransform(1, 0, 0, 1, 0, 0); Sx.globalCompositeOperation = 'source-over'; Sx.globalAlpha = 1; Sx.clearRect(0, 0, 2 * m, 2 * m);
  Sx.imageSmoothingEnabled = false;
  // couché : l'image tournée d'un quart de tour (la tête à gauche), qui tombe juste sur la grille
  const ke = eIO(k), ang = -Math.PI / 2 * ke, dx = COUCHE.x * z * ke, dy = COUCHE.y * z * ke;
  Sx.save(); Sx.translate(Math.round(c.x - bx + dx), Math.round(c.y - by + dy)); Sx.rotate(ang);
  dessineSujet(Sx, N, 0, 0, cs, e, t);
  Sx.restore();
  Sx.globalCompositeOperation = 'source-atop';
  const lx = L.x - bx, ly = L.y - by;
  if (lum > 0) {
    const ombre = Sx.createRadialGradient(lx, ly - 2.2 * cs, 1.2 * cs, lx, ly - 2.2 * cs, 7.5 * cs);
    ombre.addColorStop(0, 'rgba(6,7,12,0)'); ombre.addColorStop(.55, 'rgba(6,7,12,.28)'); ombre.addColorStop(1, 'rgba(6,7,12,.62)');
    Sx.globalAlpha = lum; Sx.fillStyle = ombre; Sx.fillRect(0, 0, 2 * m, 2 * m);
  }
  if (lum < 1) {
    // le téléphone éteint : l'ombre, et une lueur froide à peine, venue d'en haut à droite (là où Phi le regarde)
    Sx.globalAlpha = 1 - lum; Sx.fillStyle = 'rgba(6,7,12,.4)'; Sx.fillRect(0, 0, 2 * m, 2 * m);
    const fr0 = Sx.createRadialGradient(c.x - bx + 4 * cs, c.y - by - 7 * cs, cs, c.x - bx + 4 * cs, c.y - by - 7 * cs, 12 * cs);
    fr0.addColorStop(0, rgba(LABO, .16)); fr0.addColorStop(1, rgba(LABO, 0));
    Sx.fillStyle = fr0; Sx.fillRect(0, 0, 2 * m, 2 * m);
  }
  Sx.globalAlpha = 1;
  if (!o.tel && etat === 'tient') {
    const jambes = Sx.createLinearGradient(0, ly + .6 * cs, 0, ly + 3 * cs);
    jambes.addColorStop(0, 'rgba(6,7,12,0)'); jambes.addColorStop(1, 'rgba(6,7,12,.5)');
    Sx.fillStyle = jambes; Sx.fillRect(0, ly, 2 * m, 2 * m);
  }
  const teinte = Sx.createRadialGradient(lx, ly - cs, 0, lx, ly - cs, 4.5 * cs);
  teinte.addColorStop(0, rgba(LABO, .22 * lum)); teinte.addColorStop(1, rgba(LABO, 0));
  Sx.fillStyle = teinte; Sx.fillRect(0, 0, 2 * m, 2 * m);
  Sx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a; ctx.drawImage(Sx.canvas, bx, by); ctx.globalAlpha = 1;
  // le téléphone posé (hors de ses mains) : l'écran LABO tant qu'il est allumé, puis l'ombre
  if (o.tel) {
    const p0 = cam.ecran(o.tel.x, o.tel.y), w = o.tel.w * z, h = o.tel.h * z;
    ctx.globalAlpha = a; ctx.fillStyle = mix(GRIS_FIG, NUIT, .62); ctx.fillRect(Math.round(p0.x), Math.round(p0.y), Math.round(w), Math.round(h));
    if (ecran > 0) { ctx.globalAlpha = a * ecran; ctx.fillStyle = LABO; ctx.fillRect(Math.round(p0.x), Math.round(p0.y), Math.round(w), Math.round(h)); }
    ctx.globalAlpha = 1;
  }
}
// l'état du sujet que nuitIssue dessine, tiré de ce qu'il fait (o : etatNuit, ou ses options) ; braises() s'en sert
// pour que ses caractères se posent sur ce sprite-là
function sujetNuit(o) {
  const { lum = 1, etat = 'tient' } = o;
  const e = { col: GRIS_FIG, mode: 'nuit', ecran: 1, reflet: o.reflet ?? lum > .5 };
  if (etat === 'pose') e.p = { bras: 'bas', lum: lum > .3 ? 1 : 0, ...(o.regard || {}) };
  if (etat === 'couche') { e.mode = 'dort'; e.reflet = false; }
  if (o.yeux) e.yeux = o.yeux;
  if (etat === 'tient' && o.regard) e.p = { ...o.regard };
  return e;
}
// l'heure, à sa droite (comme « 23:41 » en P01 : IBM Plex Mono 18 px, GRIS)
function horloge(ctx, a) {
  if (a <= 0) return;
  ctx.globalAlpha = a; ctx.font = `18px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(FICHE.pose, 1180, 300); ctx.globalAlpha = 1;
}
// ce qu'il fait, de P19 à la fin : il tient son téléphone ; le pose (sur « posé ») ; l'écran s'éteint (« téléphone ») ;
// il ferme les yeux (« Et il ») ; il se couche (« dormi ») ; il dort. En P21 le téléphone s'allume pour TEST 02.
function etatNuit(t) {
  const R = rep();
  const kp = eIO(seg(t, R.pose, R.pose + .45)), ecranOff = seg(t, R.telephone, R.telephone + .25);
  const allume = cloche(t, S.notif, S.notif + .12, S.notifFin - .05, S.notifFin + .1);   // TEST 02 (P21)
  const ecran = Math.max(1 - ecranOff, allume);
  const lum = t < R.pose ? 1 : Math.max(1 - ecranOff, allume * .8);
  if (t < R.pose) return { etat: 'tient', lum, ecran: 1, reflet: true };
  // le téléphone, des mains au sol (un petit arc), de 2 × 2 cases à 3 × 1
  const tel = { x: lerp(TEL_MAINS.x, TEL_SOL.x, kp), y: lerp(TEL_MAINS.y, TEL_SOL.y, kp) - Math.sin(Math.PI * kp) * 6, w: lerp(TEL_MAINS.w, TEL_SOL.w, kp), h: lerp(TEL_MAINS.h, TEL_SOL.h, kp) };
  if (t < R.dormi) {
    // il regarde son téléphone par terre ; éteint, il regarde devant lui ; puis il ferme les yeux
    const regard = t < R.telephone + .3 ? { yx: -1, yy: 1 } : { yx: 0, yy: 0 };
    return { etat: 'pose', lum, ecran, tel, regard, yeux: t >= R.etIl ? 'f' : undefined, reflet: lum > .5 };
  }
  return { etat: 'couche', k: seg(t, R.dormi, R.dormi + .5), lum, ecran, tel };
}
// le visage du N°48 à l'écran (Phi le regarde) : debout, puis couché (la tête à gauche)
function visageNuit(t) {
  const R = rep(), cam = camNuit(t), k = eIO(seg(t, R.dormi, R.dormi + .5));
  return cam.ecran(lerp(0, COUCHE.x - 12, k), lerp(-12, COUCHE.y, k));
}

// ================================================================ P19 · 171,6–178,4 · La vraie nuit
function dessineP19(ctx, t) {
  const P = etatPhi(t), cam = camNuit(t), N0 = etatNuit(t);
  // le sujet éclairé prend la place de ses caractères : quand tous sont posés (chacun sur sa case du sprite que
  // nuitIssue dessine), il est là, entier, dessous, et ils s'effacent sur lui. Pas de fondu de deux images à moitié
  // transparentes : ni double image, ni creux de lumière.
  const kr = seg(t, S.posees, S.recomposeFin);
  // la nuit, et sa lueur qui revient avec lui (la même que celle de nuitIssue : elle continue)
  fond(ctx, t, FOND_NUIT);
  if (t >= S.posees) nuitIssue(ctx, t, cam, { ...N0, fond: false });
  else lueur(ctx, cam.ecran(-2, 12).x, cam.ecran(-2, 12).y - 36, 260, LABO, .18 * seg(t, 172.6, S.recompose));
  dessineBraises(ctx, t, 1 - kr);
  horloge(ctx, eIO(seg(t, S.recompose - .2, S.recompose + .6)));
  dessinePhi(ctx, t, P);
}

// ================================================================ P20 · 178,4–185,4 · Le carnet, encore
// Il part du coin (1290, 40, 570) et grandit jusqu'à la page (980 × 520 en (470, 150)) en 0,6 s, comme en P04 ;
// très lente poussée ×1 → ×1,04 ; en P21 (185,4–186,0) il rapetisse vers le coin et s'efface. Derrière, sa nuit,
// le cadre plus large (×2 en (300, 720)), assombrie à 30 %.
const POUSSEE = Object.freeze({ x: 960, y: 410 });
function etatCarnet(t) {
  const k = eIO(seg(t, 178.4, 179.0)) * (1 - eIO(seg(t, 185.4, 186.0)));
  const Sc = t < 185.4 ? lerp(1, 1.04, seg(t, 179.0, 185.4)) : lerp(1.04, 1, eIO(seg(t, 185.4, 186.0)));
  return { k, S: Sc, a: seg(t, 178.4, 178.55) * (1 - seg(t, 185.75, 186.0)) };
}
const optionsCarnet = (t, E) => ({ textes: CARNET, notes: NOTES, k: E.k, a: E.a, hypothese: true, commeMoi: true, ajoutHypothese: AJOUTS.hypothese, ajoutProtocole: AJOUTS.protocole.t });
const pousse = (p, Sc) => ({ x: POUSSEE.x + (p.x - POUSSEE.x) * Sc, y: POUSSEE.y + (p.y - POUSSEE.y) * Sc });
function plumePage(T) {
  if (T < 178.4 || T >= 186) return null;
  const E = etatCarnet(T), r = carnet(sonde(), T, { ...optionsCarnet(T, E), a: 1 });
  return r.plume && pousse(r.plume, E.S);
}
function centrePage(T) { const E = etatCarnet(T); return pousse({ x: lerp(1290, 470, E.k) + lerp(570, 980, E.k) / 2, y: lerp(40, 150, E.k) + lerp(140, 520, E.k) * .4 }, E.S); }
// le bout de la ligne du protocole (où « → échec » s'écrira) : Phi y regarde sur « Protocole »
let W_PROTO = 0;
function protocoleFin(T) {
  const E = etatCarnet(T), s = lerp(570, 980, E.k) / 980;
  if (!W_PROTO) {   // mesurée une fois les polices là (sinon on la refait à l'image suivante)
    const c = sonde(); c.font = `18px ${MONO}`; const w = c.measureText(CARNET.protocole + ' ').width;
    if (typeof document === 'undefined' || !document.fonts || document.fonts.check(`18px "IBM Plex Mono"`)) W_PROTO = w; else return pousse({ x: lerp(1290, 470, E.k) + (28 + w) * s, y: lerp(40, 150, E.k) + 78 * s }, E.S);
  }
  return pousse({ x: lerp(1290, 470, E.k) + (28 + W_PROTO) * s, y: lerp(40, 150, E.k) + 78 * s }, E.S);
}
// « Protocole » : la plume (le curseur LABO du carnet) quitte l'hypothèse et attend au bout de la ligne du protocole,
// en clignant comme celle du carnet, jusqu'à ce qu'elle y écrive « → échec »
function plumeAttend(ctx, t, E) {
  const R = rep(), t0 = R.protocole, t1 = AJOUTS.protocole.t;
  if (t < t0 || t >= t1 || Math.floor(t * 4) % 2) return;
  const s = lerp(570, 980, E.k) / 980, x = lerp(1290, 470, E.k), y = lerp(40, 150, E.k);
  if (!W_PROTO) protocoleFin(t);
  ctx.globalAlpha = E.a; ctx.fillStyle = LABO;
  ctx.fillRect(x + (28 + W_PROTO + 2) * s, y + (84 - 18 * .78) * s, 10.8 * .55 * s, 18 * .9 * s);
  ctx.globalAlpha = 1;
}
function nuitPetite(ctx, t, a, assombri) {
  const N0 = etatNuit(t);
  nuitIssue(ctx, t, camNuit(t), { ...N0, a });
  voileNoir(ctx, assombri);
}
function dessineP20(ctx, t) {
  const P = etatPhi(t), E = etatCarnet(t), R = rep();
  // sur « observer sans s'attacher », Phi quitte le carnet des yeux pour le N°48 qui dort (l'aveu) : il remonte de
  // l'ombre (de 30 % à 70 % environ) et ses crochets s'allument à peine, le temps qu'on voie ce que Phi regarde
  const vu = cloche(t, R.attacher - .3, R.attacher, R.note, R.note + .4);
  nuitPetite(ctx, t, 1, .7 * eIO(seg(t, 178.4, 179.0)) * (1 - .55 * vu));
  if (vu > 0) { const c = camNuit(t), s = c.ecran(COUCHE.x, COUCHE.y); crochets(ctx, s.x, s.y, c.z, { a: .4 * vu, k: vu }); }
  ctx.save();
  ctx.translate(POUSSEE.x, POUSSEE.y); ctx.scale(E.S, E.S); ctx.translate(-POUSSEE.x, -POUSSEE.y);
  carnet(ctx, t, optionsCarnet(t, E));
  plumeAttend(ctx, t, E);
  ctx.restore();
  ombreOeil(ctx, P, eIO(seg(t, 178.6, 179.3)));
  dessinePhi(ctx, t, P);
}
// une ombre douce derrière l'œil, quand il se détache de ce qui est derrière lui (le carnet, P04)
function ombreOeil(ctx, P, k) {
  if (k <= 0) return;
  const r = P.O.s, g = ctx.createRadialGradient(P.c.x, P.c.y, r * .3, P.c.x, P.c.y, r * 1.05);
  g.addColorStop(0, `rgba(12,11,13,${.8 * k})`); g.addColorStop(1, 'rgba(12,11,13,0)');
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(P.c.x - r * 1.1, P.c.y - r * 1.1, r * 2.2, r * 2.2);
}

// ================================================================ P21 · 185,4–196,0 · Et vous ?
const PILULE_B = Object.freeze({ x: 640, y: 400 }), PILULE_R = Object.freeze({ x: 1280, y: 400 });
// les pilules se forment sur leur nom, assez vite pour être entières sur « Ça dépend », où elles se figent (leur
// horloge s'arrête) ; à 194,4 elle repart, et elles retombent en poussière (l'éclat d'index.html)
function horlogePilule(t, t0, fin) {
  const vit = 2.7 / Math.max(.5, fin - t0), gel = t0 + (fin - t0) * vit;
  if (t < fin) return { T: t0 + (t - t0) * vit, gel };
  return { T: t < S.ferme ? gel : gel + (t - S.ferme), gel };
}
function pilulesP21(ctx, t) {
  const R = rep();
  [[0, PILULE_B, R.bleue - .05], [1, PILULE_R, R.rouge - .05]].forEach(([i, p, t0]) => {
    if (t < t0) return;
    const h = horlogePilule(t, t0, R.depend);
    pilule(ctx, h.T, i, { x: p.x, y: p.y, ps: .5, t0, eclat: h.gel });
  });
  ctx.globalAlpha = 1;
}
// le téléphone du N°48, à l'écran (P21)
const telephone = T => { const c = camNuit(T); return c.ecran(TEL_SOL.x + TEL_SOL.w / 2, TEL_SOL.y + TEL_SOL.h / 2); };
// « XPHI · TEST 02 » : une petite fenêtre de 300 × 60 qui sort du téléphone, puis y rentre, annulée
const NOTIF_C = Object.freeze({ x: 390, y: 640 });
function etatNotif(t) {
  if (t < S.notif || t >= S.notifFin) return null;
  const out = eBack(seg(t, S.notif, S.notifSortie)), back = eIn(seg(t, S.notifRentre, S.notifFin));
  return { k: Math.min(out, 1 - back) };
}
function notifCentre(T) {
  const N0 = etatNotif(T); if (!N0) return null;
  const p = telephone(T); return { x: lerp(p.x, NOTIF_C.x, N0.k), y: lerp(p.y, NOTIF_C.y, N0.k) };
}
function notification(ctx, t) {
  const N0 = etatNotif(t); if (!N0) return;
  const p = telephone(t), c = notifCentre(t), s = lerp(.1, 1, clamp(N0.k, 0, 1.2));
  ctx.save(); ctx.translate(c.x, c.y); ctx.scale(s, s);
  fenetre(ctx, -150, -30, 300, 60, clamp(N0.k * 3));
  ctx.globalAlpha = clamp(N0.k * 2);
  dessineOeil(ctx, -114, 0, 40, { ...HUMEURS.neutre }, clamp(N0.k * 2));
  ctx.font = `22px ${PIX}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = LABO; ctx.fillText('XPHI', -84, 2);
  const w = ctx.measureText('XPHI ').width;
  ctx.fillStyle = CRAIE; ctx.fillText('· TEST 02', -84 + w, 2);
  ctx.restore(); ctx.globalAlpha = 1;
  // le fil de lumière entre le téléphone et elle
  ctx.globalAlpha = .25 * clamp(N0.k); ctx.strokeStyle = LABO; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(c.x, c.y + 30 * s); ctx.stroke(); ctx.globalAlpha = 1;
}
function dessineP21(ctx, t) {
  const P = etatPhi(t), E = etatCarnet(t);
  // sa nuit, plus claire : il dort en bas à gauche (α 0,4), son téléphone posé à côté
  nuitPetite(ctx, t, lerp(1, .4, eIO(seg(t, 185.4, 186.4))), .7 * (1 - eIO(seg(t, 185.4, 186.4))));
  // le carnet repart au coin
  if (E.a > 0) {
    ctx.save(); ctx.translate(POUSSEE.x, POUSSEE.y); ctx.scale(E.S, E.S); ctx.translate(-POUSSEE.x, -POUSSEE.y);
    carnet(ctx, t, { ...optionsCarnet(t, E), ajoutHypothese: true, ajoutProtocole: true });
    ctx.restore();
  }
  pilulesP21(ctx, t);
  notification(ctx, t);
  // l'œil se ferme doucement : les lames se referment, la lueur s'éteint
  const kf = eIO(seg(t, S.ferme, S.fermeFin));
  dessinePhi(ctx, t, P, { ouvert: 1 - kf, lueur: P.h.glow * (1 - kf) });
}

// ================================================================ P22 · 196,0–201,5 · Carton
// Le crédit (« d’après le questionnaire « A ou B ? » de Monsieur Phi », 83 caractères) est en pleine lumière de 197,6
// à 200,6 s : trois secondes pour le lire (avec un carton de 3 s, il ne l'était que 0,5 s avant le noir).
const CREDIT = fr('d’après le questionnaire « A ou B ? » de Monsieur Phi');
function dessineP22(ctx, t) {
  fond(ctx, t, FOND_NUIT);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  // « XPHI » attend que l'œil fermé de P21 se soit effacé (le fondu enchaîné finit à 196,5) : pas de double image
  const a1 = eOut(seg(t, 196.4, 197.05)), a2 = seg(t, 196.8, 197.3), a3 = seg(t, 197.1, 197.6);
  ctx.globalAlpha = a1; ctx.font = `120px ${PIX}`; ctx.fillStyle = CRAIE; ctx.fillText('XPHI', 960, 470);
  ctx.globalAlpha = a2; ctx.font = `24px ${PIX}`; ctx.fillStyle = LAITON; ctx.fillText('TEST 01 · LES DEUX PILULES', 960, 530);
  ctx.globalAlpha = a3; ctx.font = `18px ${MONO}`; ctx.fillStyle = GRIS;
  ctx.fillText(CREDIT, 960, 600);
  ctx.fillText('prototype · par pays : chiffres fictifs', 960, 630);
  ctx.globalAlpha = 1;
}

// ================================================================ les plans
// P18 déborde de 0,5 s sur P19 (le filet s'efface, ses étoiles continuent : le fondu enchaîné du film) ; P21 sur P22.
export const PLANS = [
  { id: 'P17', de: 151.8, a: 162.2, dessine: dessineP17 },
  { id: 'P18', de: 162.2, a: 172.1, dessine: dessineP18 },
  { id: 'P19', de: 171.6, a: 178.4, dessine: dessineP19 },
  { id: 'P20', de: 178.4, a: 185.4, dessine: dessineP20 },
  { id: 'P21', de: 185.4, a: 196.5, dessine: dessineP21 },
  { id: 'P22', de: 196.0, a: 201.5, dessine: dessineP22, sortie: { type: 'noir', d: .9 } },
];

// ================================================================ les indices sonores (temps du film)
// Le vocabulaire de SCENARIO.md, « Le contrat technique » ; f porte la variante (la nappe, le motif, le glissement du
// souffle en Hz, la hauteur d'une note).
const M = {
  ah: motSon('R28', 'Ah', 161.28), meme: motSon('R30', 'Même', 165.87), choix: motSon('R30', 'même choix', 166.91), change: motSon('R30', 'Ce qui', 167.67),
  pose: motSon('R31', 'posé', 174.38), telephone: motSon('R31', 'téléphone', 175.08), dormi: motSon('R31', 'dormi', 176.46),
  bleue: motSon('R33', 'Bleue', 186.65), rouge: motSon('R33', 'rouge', 187.42), depend: motSon('R33', 'Ça dépend', 188.41),
};
export const SONS = [
  // P17 — la poussée, la plongée, le diaphragme ; le saut ; le tampon, la peur ; les départs, seuls ; « Ah. »
  { t: S.pousse, son: 'souffle', d: 1.2, f: [500, 1500], g: .16, pan: .3 },
  { t: S.pousseFin, son: 'souffle', d: 1.3, f: [300, 2800], g: .26, pan: .1 },
  { t: S.iris, son: 'grain', d: .9, g: .22 },                         // cent huit, d'un coup
  { t: S.trouve, son: 'tic', g: .22, pan: .1 },                        // les crochets : Phi l'a trouvé
  { t: S.saut, son: 'hop', f: 520, g: .14 },                           // son saut, rejoué
  { t: S.saut + .2, son: 'note', f: 330, d: 1.0, g: .12 },              // il retombe bleu
  { t: S.tampon, son: 'tampon', g: .55 },
  { t: S.peur, son: 'peur', d: 2.4, g: .26 },
  { t: S.eteint, son: 'nappe', f: 'labo', g: .25 },                   // la salle baisse de 6 dB
  { t: S.morts, son: 'envol', d: 1.6, g: .24 },
  { t: S.depart, son: 'envol', d: 1.9, g: .34 },                       // lui, le dernier
  { t: 160.8, son: 'nappe', f: 'labo', g: .12 },                       // « Ah. » dans le presque-silence
  // P18 — le filet (un trait pur) ; à gauche le diaphragme, la vie très bas ; « même choix » ; ce qu'ils ont lu
  { t: S.partage, son: 'note', f: 880, d: .8, g: .1 },
  { t: S.irisG, son: 'grain', d: .8, g: .14, pan: -.5 },
  { t: S.irisGFin, son: 'vie', d: 5.5, g: .1, pan: -.6 },
  { t: +((M.meme + M.choix) / 2).toFixed(2), son: 'note', f: 523, d: .6, g: .12, pan: -.5 },   // il se remplit de bleu
  { t: +(M.choix + .1).toFixed(2), son: 'hop', f: 660, g: .1, pan: -.5 },                         // il lève les bras
  { t: M.change, son: 'frappe', d: 1.4, g: .1 },
  { t: 170.4, son: 'silence', d: 1.2 },                                 // puis les deux s'éteignent
  // P19 — ses caractères redescendent ; la nuit ; le téléphone qu'on pose, qu'on verrouille ; une longue expiration
  { t: S.descend, son: 'retour', d: 1.7, g: .28, pan: .3 },
  { t: 171.8, son: 'nappe', f: 'nuit', g: .5 },
  { t: M.pose + .4, son: 'haptique', g: .14, pan: -.2 },
  { t: M.telephone, son: 'declic', g: .3, pan: -.2 },
  { t: M.dormi + .3, son: 'souffle', d: 2.6, f: [420, 180], g: .2 },
  // P20 — le carnet : son motif, plus lent ; la plume
  { t: 178.4, son: 'motif', f: 'lent', g: .26 },
  { t: AJOUTS.hypothese.t, son: 'frappe', d: 1.8, g: .1 },
  { t: AJOUTS.protocole.t, son: 'frappe', d: .2, g: .14 },
  { t: 185.2, son: 'note', f: 784, d: .35, g: .1 },                    // un sourire
  // P21 — les pilules ; un dernier accord, deux notes, très doux ; le vibreur coupé net ; puis le silence
  { t: M.bleue, son: 'grain', d: 1.2, g: .14, pan: -.35 },
  { t: M.rouge, son: 'grain', d: 1.0, g: .14, pan: .35 },
  { t: M.depend, son: 'note', f: 440, d: 2.2, g: .1 },
  { t: M.depend + .5, son: 'note', f: 554, d: 2.0, g: .09 },
  { t: S.notif, son: 'vibreur', d: .55, g: .26, pan: -.65 },
  { t: S.notifRentre, son: 'souffle', d: .4, f: [1600, 500], g: .1, pan: -.6 },
  { t: S.notifFin, son: 'declic', g: .12, pan: -.65 },
  { t: S.ferme, son: 'grain', d: 1.6, g: .1 },
  { t: S.ferme, son: 'silence', d: 4.6 },
  // P22 — la dernière note du motif du carnet, tenue
  { t: 196.4, son: 'motif', f: 'derniere', d: 5.1, g: .22 },
];
