/* ==========================================================================
   Les deux pilules, l'épisode — plans/variantes.js : le lot « variantes »
   P32–P38, de 381,6 à 526,9 s (6:21,6–8:46,9), répliques V01–V21.
   Partie 1 · Deux variantes déséquilibrées (dans le script : 6:15 – 8:45).

   Ronan : « Toutes les séquences du script, dans l'ordre, avec le texte de
   Thibaut tel quel pour la voix et les images qu'il indique » ; « je veux que
   tu prennes les petits bonhommes que tu as dans le premier film de 3 minutes
   20 ». Ici, les sujets de démonstration du film (commun.js : DEMO,
   dessineSujet et ses états) rejouent les deux variantes du script : Alice,
   le 101e sujet sans pilule, qu'on sauve en prenant la bleue ; les bleus
   accidentels, qui jouent son rôle ; le bleu tiré au hasard qui meurt quand
   même ; et le test, construit exactement au point d'équilibre, où l'on
   sauve ceux qui se sont mis en danger, pas un de plus — jusqu'à ce que Phi
   s'y perde.

   L'idée (EPISODE.md, S04) : le déséquilibre se voit à l'horizon. LE MONDE
   QUI PENCHE est une rotation de toute la couche du monde autour de (960, 440)
   — le sol, la foule, la pièce d'Alice, la jauge, les marques —, jamais de
   l'œil ni de la surimpression : +3,5° vers Alice (la droite descend), +2°
   pour les bleus accidentels, −3,5° pour le bleu tiré au hasard (la gauche
   descend), puis exactement à plat sur « point d'équilibre », où un trait de
   niveau traverse l'écran, une variante en miniature à chaque bout.

   Le lot est un seul décor, le laboratoire : scene(t) dessine tout, chaque
   plan n'en est qu'un moment. Chaque geste tombe sur son mot (quandMot de
   texte.js : le jour où la voix de Ronan est posée, tout suit) ; aucun état
   d'une image à l'autre, jamais Math.random (hache à graines fixes). Les
   seules mémoires sont des mémoires de calcul : l'image figée du blocage
   (P38, une toile à part, calculée une fois), les lignes du terminal.

   Repris : commun.js (l'anneau : anneau, ORDRE_ANNEAU, RANG_ANNEAU,
   ROUGES_ANNEAU, placeRouge, pasAnneau ; la pièce d'Alice : pieceAlice ; la
   cape : POSES_EP.cape ; le tirage : tirage, cadreTirage, sautsTirage ; le
   terminal ; la jauge, le tampon, les pilules en icônes d'index.html) ;
   plans/test.js, recopiés parce qu'il ne les exporte pas : la couleur, le
   saut, la vie, les coches et la vague des têtes qui se tournent (verifs
   d'index.html).

   Des choix que le découpage laisse ouverts, à juger sur l'écran de Ronan :
   - L'ANNEAU est celui du lot kant (plans/kant-anneau.js, ses réglages
     recopiés) : les bleus à cs 3, les flèches de flechesAnneau sur le cercle
     ×1,13 (rayon 305), juste au-dehors d'eux ; dans la grille du test (P34–
     P37), les bonshommes reprennent la taille du film (cs 4) ;
   - le terminal de P38 est posé dans la colonne de RÈGLES (x 1 334–1 860), mais
     plus bas (y 250–486) : l'œil est en (1 700, 150, 120), là où RÈGLES
     commençait, et l'anneau poussé à ×1,15 va jusqu'à x 1 320 ;
   - entre l'anneau (P33) et la grille (P34), les sujets regagnent leurs places
     en 0,6 s (le temps sans voix de la coupe), dans leurs couleurs, et
     deviennent gris en arrivant : « les 62 reviennent à leurs places » ;
   - la cape (POSES_EP.cape) est peinte en lumière et non en ombre : dans
     l'anneau, où les sujets se chevauchent, une cape d'ombre ne se voyait pas ;
   - la petite jauge de P33 n'a pas son « 50 % » au-dessus du trait (il tombait
     sur les flèches de l'anneau) ; le trait reste, et le fil part de lui ;
   - le monde qui penche fait tourner aussi les sprites : à 2 ou 3,5°, leurs
     cases prennent un petit cran ; garder les bonshommes droits (seules leurs
     places tourneraient) est possible si l'on préfère.

   Raccords :
   - entrée (381,6 s) : l'image de la fin du lot kant : l'anneau des 62 bleus
     (DEMO, cs 3) qui tourne d'une place toutes les 0,5 s depuis « circulaire »
     (pasAnneau(t, quandMot('K32', 'circulaire'))), ses flèches (×1,13),
     « SAUVÉS = EN DANGER » au centre, les 38 rouges aux bords (cs 4, α 0,5), le
     fond (sol 0,4, centre (960, 470)), l'œil en (1 700, 150, 120), humeur
     doute : les réglages de plans/kant-anneau.js (ANNEAU_KANT) ;
   - sortie (526,9 s) : le laboratoire vide (le sol à 0,4, le centre du fond en
     (960, 470)), l'œil en (960, 150,
     140), neutre, qui vous regarde.

   Essais : index.html?plan=variantes (le lot en boucle), ?plan=P36,
   ?t=477.5 ; dans la console, (await import('./plans/variantes.js')).ESSAI :
   le minutage, l'angle du monde, ce que regarde Phi, ce que fait la foule.
   ========================================================================== */
import {
  W, H, CRAIE, GRIS, GRIS_FIG, LABO, LAITON, BLEU, ROUGE, ROUGE_TXT, MONO, PIX, NB, FOND_FENETRE,
  clamp, lerp, seg, cloche, eIO, eOut, eIn, eBack, lisse, cles, hache, mix, toile, texteSignes,
  fond, sol, tampon, jauge, pilule, humeur, flotte, cligne, oeil, creeRegard, VOUS, point, decalage,
  dessineSujet, DEMO, LOTS, ORDRE,
  ANNEAU, ORDRE_ANNEAU, RANG_ANNEAU, ROUGES_ANNEAU, anneau, pasAnneau, placeRouge, flechePixel,
  terminal, POSES_EP, pieceAlice, tirage, cadreTirage, sautsTirage,
} from '../commun.js';
import { REPLIQUE, quandMot, finParole, plume as plumeBoite } from '../texte.js';

export const LOT = { id: 'variantes', de: 381.6, a: 526.9 };
// les bornes des plans (EPISODE.md, « Les plans ») : les coupes du lot y tombent
const B = Object.freeze({ P32: 381.6, P33: 396.7, P34: 422.2, P35: 448.9, P36: 465.1, P37: 489.9, P38: 503.6 });

// ================================================================ les mots dits : les gestes tombent dessus
// quandMot (texte.js) : l'instant où la boîte écrit le mot, c'est-à-dire où la voix (estimée, puis enregistrée) le dit ;
// n : la n-ième occurrence. finDite : la fin de la parole (de + dite : la voix, pas la boîte).
const mot = (id, m, n = 0) => quandMot(id, m, REPLIQUE[id].de, n);
const de = id => REPLIQUE[id].de;
const finDite = id => REPLIQUE[id].de + REPLIQUE[id].dite;

// ================================================================ le minutage du lot (EPISODE.md, P32–P38)
const S = (() => {
  const s = {};
  // le raccord : l'anneau du lot kant tourne depuis « circulaire » (commun.js : pasAnneau)
  s.circ = quandMot('K32', 'circulaire', 377.3);
  // P32 · déséquilibrer
  s.v01 = de('V01');
  s.des = mot('V01', 'déséquilibrer');                     // l'anneau ralentit
  s.disp = mot('V01', 'disparaisse');                      // il s'arrête
  s.personne = mot('V02', 'une personne');                 // la pièce d'Alice
  s.alice = mot('V02', 'Alice');                           // son nom ; le monde penche vers elle
  // P33 · sauver Alice
  s.v03 = de('V03');
  s.sauvee = mot('V03', 'sauvée');                         // la jauge EXEMPLE, le fil, la pièce s'éclaire
  s.v04 = de('V04');
  s.sauverAlice = mot('V04', 'sauver Alice');              // l'éventail des flèches
  s.etSauver = mot('V05', 'Et sauver ceux');               // les flèches de l'anneau reviennent, fines
  s.heroique = mot('V06', 'héroïque');                     // les capes
  s.felic = mot('V07', 'Félicitations');
  s.question = mot('V08', 'pas la question');              // la pièce sort, le monde revient à plat
  // P34 · les bleus accidentels
  s.comprend = mot('V09', 'comprend bien');                // les ✓
  s.erreur = mot('V10', 'par erreur');                     // cinq ✓ deviennent ✗, ils retombent bleus
  s.role = mot('V11', 'le rôle d’Alice');                  // leurs petites pièces ; le monde penche
  // P35 · en connaissance de cause
  s.cas = mot('V12', 'pas le cas');                        // le tampon, les ✗ redeviennent ✓, à plat
  s.sait = mot('V13', 'et sait que');                      // les têtes se tournent
  s.cause = mot('V13', 'en connaissance de cause', 1);
  // P36 · un bleu tiré au hasard
  s.siBleue = mot('V14', 'si la bleue');                   // b62, la vie
  s.hasard = mot('V14', 'prise au hasard');                // le tirage (il se pose sur « meure »)
  s.meure = mot('V14', 'meure');                           // la peur, les caractères ; le monde penche de l'autre côté
  s.rouge = mot('V15', 'tout le monde prend la rouge');    // b0, la vie, AUCUN MORT
  s.idiot = mot('V16', 'complètement idiot');              // l'icône bleue baisse à 30 %
  // P37 · le point d'équilibre
  s.notre = de('V17');
  s.equilibre = mot('V17', 'point d’équilibre');           // le monde se redresse (0,8 s)
  s.plat = s.equilibre + .8;                               // exactement à plat : le trait de niveau
  s.sauve = mot('V18', 'on sauve tous ceux');              // b62, l'anneau se reforme
  s.pasUn = mot('V18', 'pas un de plus');                  // « SAUVÉS = EN DANGER »
  // P38 · la boucle infinie : les trois « pour sauver », « ceux qui », « de se mettre »
  s.pour = Object.freeze([mot('V19', 'pour sauver', 0), mot('V19', 'pour sauver', 1), mot('V20', 'pour sauver')]);
  s.ceux = Object.freeze([mot('V19', 'ceux qui', 0), mot('V19', 'ceux qui', 1), mot('V20', 'ceux qui')]);
  s.mettre = Object.freeze([mot('V19', 'de se mettre', 0), mot('V19', 'de se mettre', 1), mot('V20', 'de se mettre')]);
  s.finV19 = finParole('V19');
  s.finV20 = finParole('V20');
  s.v20 = de('V20');                                       // la voix accélère
  s.TB = finDite('V20');                                   // le blocage : la voix se coince sur « … »
  s.TC = s.TB + 1.2;                                       // « ^C »
  s.TR = de('V21');                                        // le redémarrage : « Excusez-moi »
  s.infinie = mot('V21', 'boucle infinie');
  s.fin = finDite('V21');                                  // l'anneau et les rouges s'effacent
  return Object.freeze(s);
})();

// ================================================================ le monde qui penche (EPISODE.md, « La grammaire »)
// [t, angle (degrés ; + : la droite descend), durée] : chaque ordre part de l'angle d'avant (eIO)
const PENCHE = Object.freeze([
  [S.alice, 3.5, 1.2], [S.question, 0, 1.0],             // Alice ; « pas la question »
  [S.role, 2, 1.0], [S.cas, 0, 1.0],                     // les bleus accidentels ; « pas le cas »
  [S.meure, -3.5, 1.2], [S.equilibre, 0, .8],            // le bleu tiré au hasard ; « point d'équilibre »
]);
function penche(T) {
  let v = 0, avant = 0;
  for (const [t, a, d] of PENCHE) { if (T < t) break; v = lerp(avant, a, eIO(seg(T, t, t + d))); avant = a; }
  return v;
}
// P38 : la très lente poussée ×1 → ×1,15 vers le centre de l'anneau (jusqu'au blocage ; à ×1 après la coupe)
const zoom = T => (T >= B.P38 && T < S.TB ? 1 + .15 * lisse(seg(T, B.P38, S.TB)) : 1);
// la transformation de la couche du monde : écran = C + R(θ) · z · (monde − C), C = (960, 440)
const CX = ANNEAU.x, CY = ANNEAU.y;
function monde(T) { const th = penche(T) * Math.PI / 180, z = zoom(T); return { th, z, c: Math.cos(th), s: Math.sin(th) }; }
const versEcran = (M, x, y) => { const dx = (x - CX) * M.z, dy = (y - CY) * M.z; return { x: CX + dx * M.c - dy * M.s, y: CY + dx * M.s + dy * M.c }; };
const versMonde = (M, x, y) => { const dx = x - CX, dy = y - CY; return { x: CX + (dx * M.c + dy * M.s) / M.z, y: CY + (-dx * M.s + dy * M.c) / M.z }; };
const appliqueMonde = (ctx, M) => { ctx.translate(CX, CY); ctx.rotate(M.th); ctx.scale(M.z, M.z); ctx.translate(-CX, -CY); };
const ecranMonde = (x, y, T) => versEcran(monde(T), x, y);
const lerpPt = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
// le centre du fond : au milieu avec l'anneau (le lot kant) ; celui d'index.html avec la grille du test ((760, 470) :
// fond() de commun.js) ; il glisse quand la foule passe de l'un à l'autre
function centreFond(T) {
  const k = T < B.P34 ? 0 : T < T_FORME ? eIO(seg(T, B.P34, B.P34 + .6)) : 1 - eIO(seg(T, T_FORME, T_FORME + 1.2));
  return k <= 0 ? CENTRE_ANNEAU : [lerp(CENTRE_ANNEAU[0], 760, k), 470];
}
// la fin du lot : l'anneau, les rouges, le terminal s'effacent ; il reste le laboratoire vide et l'œil
const aFin = T => 1 - seg(T, S.fin, S.fin + .8);

// ================================================================ l'anneau (commun.js : anneau, pasAnneau)
// P32 : l'anneau du lot kant tourne d'une place toutes les 0,5 s depuis « circulaire » (des pas de 0,3 s, eIO :
// pasAnneau) ; sur « déséquilibrer », les pas s'espacent (×1,3 chacun), et le dernier finit sur « disparaisse ».
// Un pas : { s (son début), d (sa glisse) } ; la rotation (en places) est le nombre de pas commencés, le dernier en eIO.
const PAS32 = (() => {
  const out = [];
  const n0 = Math.max(0, Math.floor((S.des - S.circ) / .5));
  for (let n = 0; n <= n0; n++) out.push({ s: S.circ + n * .5, d: .3 });
  const s0 = out[out.length - 1].s, reste = S.disp - s0;
  // le nombre de pas de plus dont la durée, à l'échelle près, tombe le plus juste sur « disparaisse »
  let best = null;
  for (let N = 2; N <= 7; N++) {
    let t = 0; const P = [];
    for (let j = 1; j <= N; j++) { t += .5 * Math.pow(1.3, j); P.push({ t, d: .3 * Math.pow(1.3, j) }); }
    const lam = reste / (t + P[N - 1].d);
    if (!best || Math.abs(Math.log(lam)) < Math.abs(Math.log(best.lam))) best = { lam, P };
  }
  for (const p of best.P) out.push({ s: s0 + p.t * best.lam, d: p.d * best.lam });
  return Object.freeze(out.map(Object.freeze));
})();
function rot32(T) {
  let r = 0;
  for (let i = 0; i < PAS32.length; i++) { const p = PAS32[i]; if (T < p.s) break; r = i + eIO(seg(T, p.s, p.s + p.d)); }
  return r;
}
// P38 : un cran à chaque « pour sauver » de V19 ; puis, du « pour sauver » de V20 au blocage, la rotation accélère avec
// la voix : une révolution en 4 s, puis 2 s, puis 0,6 s (une vitesse qui croît en exponentielle) ; après la coupe,
// l'anneau est arrêté net, à la place entière la plus proche.
const W0 = ANNEAU.n / 4, W1 = ANNEAU.n / .6, RW = W1 / W0, DACC = S.TB - S.pour[2];
const accel = t => W0 * DACC * (Math.pow(RW, clamp((t - S.pour[2]) / DACC)) - 1) / Math.log(RW);
function rot38brut(T) {
  let r = 0;
  for (const t of [S.pour[0], S.pour[1]]) r += eIO(seg(T, t, t + .3));
  if (T > S.pour[2]) r += accel(Math.min(T, S.TB));
  return r;
}
const ROT_FIN = Math.round(rot38brut(S.TB));
const rot38 = T => (T >= S.TR ? ROT_FIN : rot38brut(Math.min(T, S.TB)));
const vitesse38 = T => (T > S.pour[2] && T < S.TB ? W0 * Math.pow(RW, (T - S.pour[2]) / DACC) : 0);   // places par seconde
// la flèche allumée (P38) : elle court le long de l'anneau, deux par seconde pendant V19 ; avec V20, de 2 à 12 par seconde
// (le motif des flèches) ; λ, en places, compté depuis le début de P38
const LAM_V20 = 2 * (S.v20 - B.P38), DV20 = S.TB - S.v20;
const lam = T => (T <= S.v20 ? 2 * Math.max(0, T - B.P38) : LAM_V20 + 2 * DV20 * (Math.pow(6, clamp((T - S.v20) / DV20)) - 1) / Math.log(6));

// LE RACCORD AVEC LE LOT KANT (plans/kant-anneau.js : ANNEAU_KANT, recopié ici, pas importé : un lot ne dépend pas d'un
// autre) : les bleus de l'anneau à cs 3 (à cs 4, les 62 places d'un cercle de 270 px se touchent) ; les rouges à cs 4,
// α 0,5 ; les flèches de flechesAnneau (commun.js) tracées sur le cercle agrandi ×1,13 autour du centre (rayon 305, juste
// au-dehors des bonshommes), retrait 4, trait 2 px, pointe en cases de 3 ; le fond fond(ctx, T, { sol: .4, centre:
// [960, 470] }).
const CS_ANNEAU = 3, ECH = 1.13, RF = ANNEAU.r * ECH, SOL = .4, CENTRE_ANNEAU = Object.freeze([960, 470]);
// polaire(k, rot, r), la place k de l'anneau (fractionnaire : rot la fait tourner) sur le rayon r
const polaire = (k, rot, r) => { const a = -Math.PI / 2 + 2 * Math.PI * (k + rot) / ANNEAU.n; return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) }; };
// les flèches, de chaque place à la suivante dans le sens des aiguilles d'une montre : exactement flechesAnneau de
// commun.js dans le repère ×1,13 (le lot kant), avec deux choses de plus : l'éventail (vers : p → { x, y }, chaque
// flèche pivote vers ce point ; k de 0 à 1) et la flèche allumée (allume : { j, col, lw }).
//   o : { n (combien sont tracées ; fractionnaire : la dernière se trace), a, col, lw (à l'écran), c (la case de la
//         pointe, dans le repère ×1,13), vers, k, allume }
function fleches(ctx, rot, o = {}) {
  const { n = ANNEAU.n, a = 1, col = CRAIE, lw = 2, c = 3, vers = null, k = 0, allume = null } = o;
  if (a <= .001 || n <= 0) return;
  ctx.save(); ctx.translate(CX, CY); ctx.scale(ECH, ECH); ctx.translate(-CX, -CY);
  for (let j = 0; j < Math.min(Math.ceil(n), ANNEAU.n); j++) {
    const kk = clamp(n - j); if (kk <= 0) break;
    const p = anneau(j, rot), q = anneau(j + 1, rot), lit = allume && allume.j === j;
    let x1 = q.x, y1 = q.y;
    if (vers && k > 0) {   // la cible est donnée à l'écran du monde : ramenée dans le repère ×1,13
      const v = vers(polaire(j, rot, RF)), kv = clamp(k);
      x1 = lerp(q.x, CX + (v.x - CX) / ECH, kv); y1 = lerp(q.y, CY + (v.y - CY) / ECH, kv);
    }
    flechePixel(ctx, p.x, p.y, x1, y1, { col: lit ? allume.col : col, lw: (lit ? allume.lw : lw) / ECH, a, c: lit ? 4 : c, k: kk, retrait: 4 });
  }
  ctx.restore();
}

// ================================================================ la pièce d'Alice (commun.js : pieceAlice)
const PIECE = Object.freeze({ x: 1310, y: 300, w: 300, h: 300 });
const decalePiece = T => 760 * eIn(seg(T, S.question, S.question + .9));                 // elle sort par la droite
const visageAlice = T => ecranMonde(PIECE.x + PIECE.w / 2 + decalePiece(T), PIECE.y + PIECE.h * .6 - 18, T);
// l'éventail : chaque flèche pivote vers le mur gauche de la pièce (les cibles s'y resserrent : elles convergent)
const cibleEventail = T => p => ({ x: PIECE.x - 14 + decalePiece(T), y: CY + 10 + (p.y - CY) * .3 });

// ================================================================ les sujets de démonstration
// Le N°48 n'est jamais là (DEMO) ; les 62 bleus de LOTS.b62 font l'anneau, les 38 rouges les deux groupes des bords.
const RANG = Object.freeze(DEMO.map(f => ORDRE.indexOf(f.i)));     // le rang dans la vague du choix (index.html)
const RANG_ROUGE = new Map(ROUGES_ANNEAU.map((i, j) => [i, j]));
// les cinq bleus accidentels (P34) : dispersés dans la grille, un par rangée
const ACC = Object.freeze([4, 33, 48, 71, 82]);
const ACC_J = new Map(ACC.map((i, j) => [i, j]));
const tX = j => S.erreur + .05 + j * .22;            // sa ✓ devient ✗
const tSautAcc = j => tX(j) + .15;                   // il saute et retombe bleu
const tSalle = j => S.role + .1 + j * .15;           // sa petite pièce
const tCorr = j => S.cas + .3 + j * .12;             // ✗ → ✓, il redevient gris
// les coches (P34) et les têtes qui se tournent (P35) : plans/test.js (verifs d'index.html)
const tCoche = i => S.comprend + .15 + RANG[i] * .012;
const tTete = i => S.sait + (DEMO[i].cx - 175) / 950 + hache(i * 5 + 3) * .15;
// P36 · les vagues rapides du choix (fouleChoisit), la vie (fouleLueur), le tirage, la mort
const PAS_VAGUE = .008;
const tChoix1 = i => S.siBleue - .2 + RANG[i] * PAS_VAGUE;          // b62
const LUEUR1 = S.siBleue - .2 + 99 * PAS_VAGUE + .45;
const tRemet2 = i => S.rouge + hache(i * 3 + 7) * .2;               // fouleRemet
const tChoix2 = i => S.rouge + .35 + RANG[i] * PAS_VAGUE;           // b0
const LUEUR2 = S.rouge + .35 + 99 * PAS_VAGUE + .45;
const T_TAMPON2 = LUEUR2 + .2;
// le bleu tiré au hasard : le bleu de b62 le plus proche du milieu de la grille ; le cadre laiton saute sur huit autres,
// loin l'un de l'autre, puis se pose sur lui (sautsTirage : huit sauts de 0,12 à 0,6 s)
const VICTIME = [...LOTS.b62].sort((a, b) => Math.hypot(DEMO[a].cx - 725, DEMO[a].cy - 484) - Math.hypot(DEMO[b].cx - 725, DEMO[b].cy - 484))[0];
const ORDRE_TIRAGE = (() => {
  const B62 = [...LOTS.b62].filter(i => i !== VICTIME).sort((a, b) => hache(a * 31 + 7) - hache(b * 31 + 7)), out = [];
  let prec = VICTIME;
  for (const i of B62) { if (out.length >= 8) break; if (Math.hypot(DEMO[i].cx - DEMO[prec].cx, DEMO[i].cy - DEMO[prec].cy) > 180) { out.push(i); prec = i; } }
  out.push(VICTIME);
  return Object.freeze(out);
})();
const SAUTS = sautsTirage(S.hasard);
const T_POSE = SAUTS[SAUTS.length - 1];
const T_PEUR = Math.max(S.meure, T_POSE) + .05, T_PART = T_PEUR + .75, D_PART = 2.2;
// P37 · fouleRemet, b62, l'anneau qui se reforme (les places de P31), les flèches qui se referment (1,6 s pour le tour)
const tRemet3 = i => S.sauve + hache(i * 3 + 11) * .2;
const tChoix3 = i => S.sauve + .3 + RANG[i] * .006;
const T_FORME = S.sauve + 1.25;
const T_FLECHES = T_FORME + 1.2;

// les couleurs de chacun, en dates : [t, couleur, saut] (le saut du choix : la couleur change en l'air)
const SUJETS = Object.freeze(DEMO.map(f => {
  const i = f.i, bleu = LOTS.b62.has(i), coul = [[-Infinity, bleu ? BLEU : ROUGE, false], [B.P34 + .6, GRIS_FIG, false]];
  const j = ACC_J.get(i);
  if (j !== undefined) coul.push([tSautAcc(j), BLEU, true], [tCorr(j), GRIS_FIG, false]);
  coul.push([tChoix1(i), bleu ? BLEU : ROUGE, true], [tRemet2(i), GRIS_FIG, false], [tChoix2(i), ROUGE, true]);
  coul.push([tRemet3(i), GRIS_FIG, false], [tChoix3(i), bleu ? BLEU : ROUGE, true]);
  coul.sort((a, b) => a[0] - b[0]);
  return Object.freeze({ f, i, bleu, k: RANG_ANNEAU.get(i), j: RANG_ROUGE.get(i), coul: Object.freeze(coul) });
}));
// dans l'ordre de l'anneau (les sujets se chevauchent : toujours le même dessus) ; les rouges d'abord
const DESSIN = Object.freeze([...SUJETS.filter(s => !s.bleu), ...ORDRE_ANNEAU.map(i => SUJETS[i])]);

function couleur(s, T) {
  let c = s.coul[0][1];
  for (const [t, col] of s.coul) { if (t > T) break; c = col; }
  return c;
}
function saut(s, T) {
  let t0 = null;
  for (const [t, , sa] of s.coul) { if (t - .2 > T) break; if (sa && T < t + .45) t0 = t; }
  return t0;
}
// la vie (fouleLueur) : bras au ciel, halos, petits bonds ; et le fond qui s'éclaire
const VIES = Object.freeze([[LUEUR1, S.rouge], [LUEUR2, S.notre]]);
const lueurVie = T => Math.max(0, ...VIES.map(([a, b]) => seg(T, a, a + .6) * (1 - seg(T, b, b + .5))));
const clair = T => Math.max(0, ...VIES.map(([a, b]) => .9 * seg(T, a, a + .8) * (1 - seg(T, b, b + 1.2))));
// le bleu tiré au hasard : il part en caractères ; quand tout le monde prend la rouge, il se recompose (son envers)
function dissolution(T) {
  if (T < T_PART) return 0;
  if (T < S.rouge) return seg(T, T_PART, T_PART + D_PART);
  return seg(S.rouge, T_PART, T_PART + D_PART) * (1 - eIO(seg(T, S.rouge, S.rouge + .9)));
}
const tCape = s => S.heroique + s.k / ANNEAU.n * .3;          // la cape gagne l'anneau en 0,3 s
// la cape de commun.js (POSES_EP.cape : deux images, 0,25 s), peinte en lumière (L) et non en ombre : dans l'anneau, où
// les sujets se chevauchent, une cape d'ombre ne se voyait pas
const capeClaire = T => { const c = POSES_EP.cape(T); return { extra: c.extra.map(cal => cal.map(([x, y]) => [x, y, 3])), extraCle: `${c.extraCle}L` }; };

// la place d'un sujet à l'instant T (dans le monde)
function placeRouge32(j, T) {
  const p = placeRouge(j); if (j < 19) return p;
  // le groupe de droite se serre pour laisser la place à Alice (et pour rester au-dessus de la boîte quand le monde penche)
  const k = eIO(seg(T, S.personne, S.personne + .7)) * (1 - eIO(seg(T, S.question + .2, S.question + .9)));
  if (k <= 0) return p;
  const m = j % 19;
  return lerpPt(p, { x: 1684 + (m % 4) * 45, y: 548 + Math.floor(m / 4) * 52 }, k);
}
const place32 = (s, T) => (s.bleu ? anneau(s.k, rot32(T)) : placeRouge32(s.j, T));
function place(s, T) {
  const g = { x: s.f.cx, y: s.f.cy };
  if (T < B.P34) return place32(s, T);
  if (T < B.P34 + .6) return lerpPt(place32(s, B.P34 - 1e-6), g, eIO(seg(T, B.P34, B.P34 + .6)));   // ils regagnent la grille
  if (T < T_FORME) return g;
  if (s.bleu) { const t0 = T_FORME + s.k / ANNEAU.n * .4; return lerpPt(g, anneau(s.k, rot38(T)), eIO(seg(T, t0, t0 + .8))); }
  return lerpPt(g, placeRouge(s.j), eIO(seg(T, T_FORME, T_FORME + .8)));
}
// la taille des cases : les bleus de l'anneau à cs 3 (le raccord du lot kant), tout le reste à cs 4 (la taille du
// film) ; quand ils quittent l'anneau ou le rejoignent, ils changent de taille à mi-chemin
function taille(s, T) {
  if (!s.bleu) return 4;
  if (T < B.P34) return CS_ANNEAU;
  if (T < B.P34 + .6) return seg(T, B.P34, B.P34 + .6) < .5 ? CS_ANNEAU : 4;
  if (T < T_FORME) return 4;
  const t0 = T_FORME + s.k / ANNEAU.n * .4;
  return seg(T, t0, t0 + .8) < .5 ? 4 : CS_ANNEAU;
}
// les rouges de l'anneau sont assombris (α 0,5 : hors de la question) ; gris, à 0,82 (index.html)
function alpha(s, T, col) {
  let a = col === GRIS_FIG ? .82 : 1;
  if (!s.bleu) {
    if (T < B.P34) a = .5;
    else if (T < B.P34 + .6) a = lerp(.5, .82, seg(T, B.P34, B.P34 + .6));
    else if (T >= T_FORME) a = lerp(a, .5, eIO(seg(T, T_FORME, T_FORME + .8)));
  }
  return a * aFin(T);
}

// ================================================================ l'œil de Phi : sa place, son humeur, son regard
// (1 700, 150, 120) avec l'anneau (raccord du lot kant) ; (650, 160, 160) au-dessus de la grille (index.html) ; à la fin,
// (960, 150, 140), au milieu, où le lot tirage fait paraître la foule du test
const OEIL = Object.freeze([
  [LOT.de, { x: 1700, y: 150, s: 120 }],
  [B.P34, { x: 1700, y: 150, s: 120 }],
  [B.P34 + .6, { x: 650, y: 160, s: 160 }],
  [T_FORME, { x: 650, y: 160, s: 160 }],
  [T_FORME + 1.2, { x: 1700, y: 150, s: 120 }],
  [S.fin, { x: 1700, y: 150, s: 120 }],
  [LOT.a, { x: 960, y: 150, s: 140 }],
]);
const HUMEURS_LOT = Object.freeze([
  [S.v01 + .5, 'neutre'],
  [S.alice, 'curieux', .3], [S.alice + 1.2, 'neutre'],
  [S.sauvee + .8, 'grand', .3], [S.sauvee + 1.8, 'neutre'],
  [S.felic, 'grand', .15], [S.felic + .6, 'neutre', .25],              // « Félicitations. », à froid
  [S.question, 'plisse'], [B.P34 + .4, 'neutre'],
  [S.erreur, 'doute'], [S.role, 'curieux'],
  [S.cas, 'neutre', .3], [S.cas + .15, 'grand', .2], [S.cas + .9, 'neutre'],
  [LUEUR1, 'grand', .3], [S.meure, 'plisse', .3], [S.rouge, 'neutre'], [LUEUR2, 'grand', .3], [LUEUR2 + 1.2, 'neutre'], [S.idiot, 'plisse'],
  [S.notre, 'neutre'], [S.plat, 'grand', .15], [S.plat + .6, 'neutre'],
  [S.sauve, 'doute'],
  [S.v20, 'plisse', 2.0],
  [S.TR, 'bas', .3], [S.TR + 1.3, 'neutre'], [S.infinie, 'grand', .3], [S.infinie + 1.0, 'neutre'],
]);
// deux clins : le gel du blocage le prend lames à moitié ouvertes ; au redémarrage, il cligne deux fois
const CLINS = Object.freeze([S.TB - .05, S.TR + .12, S.TR + .5]);

// ce qu'il regarde (à l'écran)
const visageDe = (s, T) => { const p = place(s, T); return ecranMonde(p.x, p.y - 12, T); };
const parmi = (ok, P = .6) => T => {
  const i0 = Math.floor(hache(Math.floor(T / P) * 97 + 3) * 100);
  for (let n = 0; n < 100; n++) { const s = SUJETS[(i0 + n * 37) % 100]; if (ok(s, T)) return visageDe(s, T); }
  return null;
};
const dernier = (quand, duree) => T => {
  let best = null, bt = -Infinity;
  for (const s of SUJETS) { const q = quand(s); if (q !== null && q <= T && T < q + duree && q > bt) { bt = q; best = s; } }
  return best && visageDe(best, T);
};
const SALLE = j => { const f = DEMO[ACC[j]]; return { x: f.cx - 30, y: f.cy - 52, w: 60, h: 84 }; };
const dansMonde = (x, y) => T => ecranMonde(x, y, T);
let REGARD = null;
function regard() {
  if (REGARD) return REGARD;
  const S0 = SUJETS[ORDRE_ANNEAU[0]];
  const tSaut = s => { for (const [t, , sa] of s.coul) if (sa && t >= S.siBleue - .3 && t < S.siBleue + 1.5) return t; return null; };
  const cibles = [
    // P32 : l'anneau qui ralentit et s'arrête (un sujet, d'une saccade à l'autre) ; vous ; Alice
    [LOT.de, S.disp + .5 - LOT.de, T => visageDe(S0, T), .25],
    [S.disp + .5, S.personne - S.disp - .5, VOUS],
    [S.personne + .15, S.alice - S.personne - .15, visageAlice],
    [S.alice, .8, dansMonde(PIECE.x + PIECE.w / 2, PIECE.y - 34)],
    [S.alice + .8, S.v03 - S.alice - .8, visageAlice],
    // P33 : la jauge, la pièce, l'éventail ; les capes ; vous sur « Félicitations »
    [S.v03, S.sauvee - S.v03, VOUS],
    [S.sauvee, .7, dansMonde(960, 776)],
    [S.sauvee + .7, 1.6, visageAlice],
    [S.sauvee + 2.3, S.v04 - S.sauvee - 2.3, VOUS],
    [S.v04, S.sauverAlice - S.v04, parmi(s => s.bleu, .8)],
    [S.sauverAlice, .9, T => ecranMonde(PIECE.x - 14 + decalePiece(T), CY + 10, T)],
    [S.sauverAlice + .9, S.etSauver - S.sauverAlice - .9, visageAlice],
    [S.etSauver, 3.2, parmi(s => s.bleu, .6)],
    [S.etSauver + 3.2, S.heroique - S.etSauver - 3.2, VOUS],
    [S.heroique, S.felic - S.heroique, parmi(s => s.bleu, .45)],
    [S.felic, S.question - S.felic, VOUS],
    [S.question, 1.0, visageAlice, .15],
    [S.question + 1.0, B.P34 - S.question - 1.0, VOUS],
    // P34 : la grille ; la vague des ✓ ; les cinq, un par un ; leurs petites pièces
    [B.P34 + .2, .8, dansMonde(650, 484)],
    [S.comprend, 1.5, dernier(s => tCoche(s.i), .3), .2],
    ...ACC.map((i, j) => [tX(j), .45, T => visageDe(SUJETS[i], T)]),
    [tX(4) + .6, S.role - tX(4) - .6, VOUS],
    ...ACC.map((i, j) => [tSalle(j), .45, T => { const r = SALLE(j); return ecranMonde(r.x + r.w / 2, r.y + r.h / 2, T); }]),
    [tSalle(4) + .5, S.cas - tSalle(4) - .5, VOUS],
    // P35 : le tampon ; les têtes qui tournent ; vous sur « en connaissance de cause »
    [S.cas + .1, .8, dansMonde(650, 540)],
    [S.cas + .9, .9, dernier(s => (ACC_J.has(s.i) ? tCorr(ACC_J.get(s.i)) : null), .5)],
    [S.sait, 1.8, dernier(s => tTete(s.i), .5), .3],
    [S.cause, B.P36 - S.cause, VOUS],
    // P36 : la jauge ; la vague ; la vie ; le cadre laiton, saut après saut ; celui qui part, jusqu'au dernier caractère ;
    // les rouges ; le tampon ; l'icône bleue ; vous
    [B.P36, .6, point(650, 699)],
    [S.siBleue, LUEUR1 - S.siBleue - .3, dernier(tSaut, .5), .2],
    [LUEUR1 - .3, .5, point(650, 699)],
    [LUEUR1 + .2, S.hasard - LUEUR1 - .2, parmi((s, T) => couleur(s, T) !== GRIS_FIG, .7)],
    [S.hasard, T_POSE - S.hasard, T => { const e = tirage(T, S.hasard, ORDRE_TIRAGE, { ordre: ORDRE_TIRAGE }); return e && ecranMonde(DEMO[e.cible].cx, DEMO[e.cible].cy - 12, T); }, .1],
    [T_POSE, T_PART + D_PART * .8 - T_POSE, T => ecranMonde(DEMO[VICTIME].cx, DEMO[VICTIME].cy - 12 - 90 * dissolution(T), T), .2],
    [S.rouge, 1.9, parmi((s, T) => couleur(s, T) === ROUGE, .6)],
    [T_TAMPON2, .8, point(650, 540)],
    [T_TAMPON2 + .8, S.idiot - T_TAMPON2 - .8, VOUS],
    [S.idiot, .7, point(400, 196)],
    [S.idiot + .7, S.plat - S.idiot - .7, VOUS],
    // P37 : le trait de niveau, d'un bout à l'autre ; les deux miniatures ; l'anneau qui se reforme ; la flèche qui en fait
    // le tour ; « SAUVÉS = EN DANGER »
    [S.plat, .3, T => point(W * eOut(seg(T, S.plat, S.plat + .3)), 700), .1],
    [S.plat + .3, .6, point(92, 664)], [S.plat + .9, .7, point(1750, 640)],
    [S.plat + 1.6, S.sauve - S.plat - 1.6, VOUS],
    [S.sauve, T_FORME - S.sauve, parmi((s, T) => couleur(s, T) !== GRIS_FIG, .5)],
    [T_FORME, 1.2, T => { const k = Math.floor(seg(T, T_FORME, T_FORME + .4) * 61); return visageDe(SUJETS[ORDRE_ANNEAU[k]], T); }, .2],
    [T_FLECHES, 1.6, T => { const p = polaire(ANNEAU.n * seg(T, T_FLECHES, T_FLECHES + 1.6), 0, RF); return ecranMonde(p.x, p.y, T); }, .12],
    [Math.max(S.pasUn, T_FLECHES + 1.6), .9, dansMonde(CX, CY)],
    [Math.max(S.pasUn, T_FLECHES + 1.6) + .9, 3, VOUS],
    // P38 (après le redémarrage) : vers le bas, gêné ; puis vous (pendant la boucle : regard38)
    [S.TR, 1.3, point(1700, 560)],
    [S.TR + 1.3, LOT.a - S.TR, VOUS],
  ];
  return (REGARD = creeRegard({
    cibles: cibles.map(([t, d, c, p]) => [t, Math.max(0, d), c, p]).filter(c => c[1] > 0),
    repos: [[3, VOUS], [2, T => plumeBoite(T)], [1.2, T => (T >= B.P34 + .6 && T < T_FORME ? parmi(() => true, 1.15)(T) : null)]],
  }));
}
// P38 : la pupille fait le tour de l'anneau avec la flèche allumée, de plus en plus vite (une poursuite, pas des
// saccades : le regard tourne en rond), jusqu'à se figer
const litEcran = T => { const p = polaire(lam(T) + .5, rot38(T), RF); return ecranMonde(p.x, p.y, T); };
const REGARD38 = Object.freeze({
  pupille(T, ex, ey, r = 12.5) {
    const p = litEcran(T), A = Math.min(9, 23 - r), [gx, gy, m] = decalage(p.x, p.y, ex, ey, A);
    return { gx, gy, w: 1 - seg(m, 0, 140), x: p.x, y: p.y, pose: null };
  },
});
// l'état de l'œil (avant le monde : les sujets lui rendent son regard ; leur lumière vient de son côté)
function etatOeil(T, M) {
  const P = cles(T, OEIL), h = humeur(T, HUMEURS_LOT, 'doute'), y = P.y + flotte(T, 4);
  const R = T >= B.P38 && T < S.TB ? REGARD38 : regard();
  const g = R.pupille(T, P.x, y, h.r);
  return { x: P.x, y: P.y, s: P.s, h, g, ouvert: cligne(T) > .5, phiW: versMonde(M, P.x, y), poseW: g.pose ? versMonde(M, g.pose.x, g.pose.y) : null, poseT: g.pose ? g.pose.t : 0 };
}

// ================================================================ l'état d'un sujet, pour dessineSujet
function etat(s, T, O, p) {
  const col = couleur(s, T);
  // (les rouges assombris de l'anneau n'ont pas le reflet de Phi : comme au lot kant)
  const e = { col, a: alpha(s, T, col), mode: 'repos', phi: O.phiW, cible: O.phiW, fixe: false, reflet: O.ouvert && !(!s.bleu && (T < B.P34 || T >= T_FORME + .8)) };
  if (s.i === VICTIME) {
    const dis = dissolution(T);
    if (dis > 0) { e.dis = dis; if (T >= S.rouge) e.p = { bob: 0, yx: 0, yy: 0, goutte: 0 }; else e.mode = 'peur'; return e; }
    if (T >= T_PEUR && T < T_PART) { e.mode = 'peur'; e.fixe = true; return e; }   // lui seul a peur ; il regarde Phi
  }
  // Phi le fixe : il lui rend son regard (index.html)
  if (O.poseW && T > O.poseT + .15 && Math.hypot(p.x - O.poseW.x, p.y - 12 - O.poseW.y) < 50) e.fixe = true;
  const t0 = saut(s, T);
  if (t0 !== null) { e.mode = 'saut'; e.t0 = t0; return e; }
  const lu = lueurVie(T);
  if (lu > 0 && col !== GRIS_FIG) { e.mode = 'vie'; e.k = lu; return e; }
  // P33 : sur « héroïque », l'écharpe de chaque bleu s'allonge en une petite cape qui flotte ; un halo bleu
  if (s.bleu && T >= tCape(s) && T < S.question + .3 && T < B.P34) { Object.assign(e, capeClaire(T)); e.halo = .5 * seg(T, tCape(s), tCape(s) + .3); }
  // P34 : les bleus accidentels retombent de travers et regardent leurs pieds, jusqu'à leur correction
  const j = ACC_J.get(s.i);
  if (j !== undefined && T >= tSautAcc(j) + .42 && T < tCorr(j)) { e.mode = 'penaud'; return e; }
  // P35 : « et sait que » : la tête se tourne vers le ✓ du voisin de gauche, puis de droite, puis vers Phi
  const tw = tTete(s.i);
  if (T >= tw && T < B.P36) {
    if (T < tw + .45) e.p = { yx: -1, yy: -1 }; else if (T < tw + .9) e.p = { yx: 1, yy: -1 }; else e.fixe = true;
    return e;
  }
  return e;
}

// ================================================================ ce que le monde montre
// ---------------------------------------------------------------- P33 : la jauge EXEMPLE (62 / 38) et le fil laiton
const aJaugeAlice = T => seg(T, S.sauvee, S.sauvee + .4) * (1 - seg(T, S.question, S.question + .6));
const FIL = Object.freeze([[960, 811], [1460, 811], [1460, 652]]);    // du trait des 50 % à la pièce (sous son nom)
function jaugeAlice(ctx, T) {
  const a = aJaugeAlice(T); if (a <= .01) return;
  // (sans « 50 % » au-dessus du trait : il tomberait sur les flèches de l'anneau ; le trait reste)
  jauge(ctx, { x: 660, y: 783, w: 600, bleue: 62, rouge: 38, a, etiquette: 'EXEMPLE', seuil: null });   // une démonstration : pas des résultats
  // le fil, en pointillés LAITON, tiré en 0,6 s
  const k = eIO(seg(T, S.sauvee + .2, S.sauvee + .8)); if (k <= 0) return;
  const L = FIL.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - FIL[i][0], q[1] - FIL[i][1]), 0);
  let reste = L * k;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = LAITON; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
  ctx.beginPath(); ctx.moveTo(FIL[0][0], FIL[0][1]);
  for (let i = 1; i < FIL.length && reste > 0; i++) {
    const [x0, y0] = FIL[i - 1], [x1, y1] = FIL[i], l = Math.hypot(x1 - x0, y1 - y0), u = Math.min(1, reste / l);
    ctx.lineTo(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u); reste -= l;
  }
  ctx.stroke(); ctx.restore();
  ctx.globalAlpha = a; ctx.fillStyle = LAITON; ctx.fillRect(FIL[0][0] - 3, FIL[0][1] - 3, 6, 6);
  if (k >= 1) ctx.fillRect(FIL[2][0] - 3, FIL[2][1] - 3, 6, 6);
  ctx.globalAlpha = 1;
}
// ---------------------------------------------------------------- P32–P33 : la pièce d'Alice
function laPiece(ctx, T, O) {
  if (T < S.personne || T >= B.P34) return;
  const a = seg(T, S.personne, S.personne + .35) * (1 - seg(T, S.question + .6, S.question + .9));
  if (a <= .001) return;
  const dx = decalePiece(T), sc = lerp(.9, 1, eOut(seg(T, S.personne, S.personne + .35)));
  // elle s'éclaire quand le fil l'atteint (le fond de la vie, TEINTE_CLAIRE) ; Alice lève les bras, puis les yeux
  const cl = eOut(seg(T, S.sauvee + .8, S.sauvee + 1.3)) * (1 - seg(T, S.question, S.question + .5));
  const vie = T >= S.sauvee + .8 && T < S.sauvee + 2.2;
  const cx = PIECE.x + PIECE.w / 2 + dx, cy = PIECE.y + PIECE.h / 2;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
  pieceAlice(ctx, T, PIECE.x + dx, PIECE.y, PIECE.w, PIECE.h, {
    a, clair: cl, nom: seg(T, S.alice, S.alice + .4), mode: vie ? 'vie' : 'repos',
    phi: O.phiW, cible: O.phiW, fixe: T >= S.alice, reflet: O.ouvert,
  });
  ctx.restore(); ctx.globalAlpha = 1;
}
// ---------------------------------------------------------------- les flèches de l'anneau (P32–P33, P37–P38)
function flechesDuMonde(ctx, T) {
  const fin = aFin(T);
  if (T < B.P34) {
    const rot = rot32(T);
    const k = eIO(seg(T, S.sauverAlice, S.sauverAlice + .8)) * (1 - eIO(seg(T, S.question, S.question + .8)));
    const fines = seg(T, S.etSauver, S.etSauver + .4) * (1 - seg(T, S.question, S.question + .8));
    if (fines > 0) fleches(ctx, rot, { lw: 1, c: 2, a: .75 * fines });          // les deux à la fois : les fines dessous
    fleches(ctx, rot, { vers: k > 0 ? cibleEventail(T) : null, k });
    return;
  }
  if (T < T_FLECHES || fin <= .001) return;
  const rot = rot38(T), w = vitesse38(T), n = ANNEAU.n * seg(T, T_FLECHES, T_FLECHES + 1.6);
  // à grande vitesse, les flèches ne font plus qu'un trait continu
  const plein = seg(w, 18, 50);
  if (plein > 0) { ctx.save(); ctx.globalAlpha = plein * fin; ctx.strokeStyle = CRAIE; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(CX, CY, RF, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  const allume = T >= B.P38 && T < S.TB ? { j: ((Math.floor(lam(T)) % ANNEAU.n) + ANNEAU.n) % ANNEAU.n, col: LABO, lw: 3 } : null;
  fleches(ctx, rot, { n, a: fin * (1 - plein), allume });
}
// ---------------------------------------------------------------- la foule
function foule(ctx, T, O) {
  if (aFin(T) <= .001) return;
  const w = T >= B.P38 ? vitesse38(T) : 0, rot = T >= T_FORME ? rot38(T) : 0;
  for (const s of DESSIN) {
    const p = place(s, T), e = etat(s, T, O, p);
    if (e.dis >= 1 || e.a <= .001) continue;
    // P38 : le flou de la vitesse, des copies qui traînent derrière chaque bleu de l'anneau
    if (w > 6 && s.bleu) {
      const m = Math.min(5, 1 + Math.floor(w / 14)), d = w * .012;
      for (let i = m; i >= 1; i--) { const q = anneau(s.k, rot - i * d); dessineSujet(ctx, s.f, q.x, q.y, CS_ANNEAU, { ...e, a: e.a * .45 * (1 - i / (m + 1)), reflet: false }, T); }
    }
    dessineSujet(ctx, s.f, p.x, p.y, taille(s, T), e, T);
  }
  // jusqu'au flou de pixels : des cases bleues qui fusent le long de l'anneau (tirées par hache, image par image)
  const fl = seg(w, 40, 100);
  if (fl > 0) {
    const im = Math.floor(T * 25), n = Math.floor(280 * fl);
    ctx.fillStyle = BLEU;
    for (let q = 0; q < n; q++) {
      const h1 = hache(im * 977 + q * 13), h2 = hache(im * 977 + q * 13 + 1), h3 = hache(im * 977 + q * 13 + 2);
      const a = h1 * Math.PI * 2, r = 270 + (h2 - .5) * 48;
      ctx.globalAlpha = (.2 + .55 * h3) * fl;
      ctx.fillRect(Math.round(CX + r * Math.cos(a)), Math.round(CY + r * Math.sin(a)), 4, 4);
    }
    ctx.globalAlpha = 1;
  }
}
// ---------------------------------------------------------------- P34–P35 : les ✓, les ✗, les petites pièces « à sauver »
function marques(ctx, T) {
  if (T < S.comprend - .3 || T >= B.P36) return;
  const signes = [];
  for (const s of SUJETS) {
    const tc = tCoche(s.i), x = s.f.cx, y = s.f.cy;
    if (T < tc - .25) continue;
    if (T < tc) { ctx.globalAlpha = .85; ctx.fillStyle = LABO; ctx.fillRect(x - 24, y - 26 + 52 * seg(T, tc - .25, tc), 48, 2); continue; }   // Phi mesure
    let ch = '✓', col = LABO, px = 18 * eBack(seg(T, tc, tc + .35));
    const j = ACC_J.get(s.i);
    if (j !== undefined && T >= tX(j) && T < tCorr(j)) { ch = '✗'; col = ROUGE_TXT; px = 18 * eBack(seg(T, tX(j), tX(j) + .3)); }
    if (j !== undefined && T >= tCorr(j)) {   // l'éclair LABO de la correction
      const fl = 1 - seg(T, tCorr(j), tCorr(j) + .6);
      col = mix(LABO, CRAIE, fl); px += 6 * fl;
      if (fl > 0) { ctx.globalAlpha = .25 * fl; ctx.fillStyle = LABO; ctx.fillRect(x - 22, y - 44, 44, 26); }
    }
    // « et sait que » : quand la vague des regards passe, chaque ✓ s'allume un instant (on le voit, on est vu)
    const tw = tTete(s.i), vu = cloche(T, tw + .05, tw + .2, tw + .5, tw + .9);
    if (ch === '✓' && vu > 0) { col = mix(col, CRAIE, .7 * vu); px += 4 * vu; }
    signes.push({ ch, x, y: y - 31, px, col });
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const g of signes) { if (g.px < 1) continue; ctx.globalAlpha = 1; ctx.font = `${Math.max(1, Math.round(g.px))}px ${PIX}`; ctx.fillStyle = g.col; texteSignes(ctx, g.ch, g.x, g.y); }
  // « le rôle d'Alice » : autour de chacun des cinq, le cadre de sa pièce, réduit, en pointillés ; « à sauver » dessous ;
  // une flèche laiton vers chacun
  ACC.forEach((i, j) => {
    const a = seg(T, tSalle(j), tSalle(j) + .3) * (1 - seg(T, S.cas, S.cas + .4)); if (a <= .001) return;
    const r = SALLE(j), f = DEMO[i];
    pieceAlice(ctx, T, r.x, r.y, r.w, r.h, { pointilles: true, a, col: LAITON });
    ctx.globalAlpha = a; ctx.font = `14px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const lw = ctx.measureText('à sauver').width + 10;
    ctx.fillStyle = FOND_FENETRE; ctx.fillRect(f.cx - lw / 2, r.y + r.h + 4, lw, 18);
    ctx.fillStyle = GRIS; ctx.fillText('à sauver', f.cx, r.y + r.h + 17);
    const k = eOut(seg(T, tSalle(j) + .1, tSalle(j) + .45)), x0 = r.x + r.w + 46, y0 = r.y - 40;
    flechePixel(ctx, x0, y0, r.x + r.w + 2, r.y + 2, { col: FOND_FENETRE, lw: 5, a: a * .8, c: 4, k });
    flechePixel(ctx, x0, y0, r.x + r.w + 2, r.y + 2, { col: LAITON, lw: 2, a, c: 3, k });
  });
  ctx.globalAlpha = 1;
}
// ---------------------------------------------------------------- P35–P36 : le test de base (index.html), les tampons
function compte(T) {
  let nb = 0, nr = 0;
  for (const s of SUJETS) { const c = couleur(s, T); if (c === BLEU) nb++; else if (c === ROUGE) nr++; }
  return { nb, nr };
}
const aTest = T => seg(T, B.P36, B.P36 + .3) * (1 - seg(T, S.notre, S.notre + .5));
function testDeBase(ctx, T) {
  // le tampon de P35 (index.html : « 100 / 100 ONT COMPRIS », LABO) ; il s'en va avec la coupe de P36
  if (T >= S.cas + .15 && T < B.P36) tampon(ctx, T, { t: S.cas + .15, txt: '100 / 100 ONT COMPRIS', taille: 64, c: LABO });
  const a = aTest(T); if (a <= .01) return;
  // les deux pilules en icônes ; sur « complètement idiot », la bleue baisse à 30 %
  pilule(ctx, T, 0, { x: 400, y: 196, ps: .3, a: a * lerp(1, .3, eIO(seg(T, S.idiot, S.idiot + .6))), lab: -Infinity });
  pilule(ctx, T, 1, { x: 900, y: 196, ps: .3, a, lab: -Infinity });
  const { nb, nr } = compte(T);
  jauge(ctx, { bleue: nb, rouge: nr, a, etiquette: 'EXEMPLE' });   // une démonstration : pas des résultats
  // le tirage : le cadre laiton saute d'un bleu à l'autre, de plus en plus lentement, et se pose
  const et = tirage(T, S.hasard, ORDRE_TIRAGE, { ordre: ORDRE_TIRAGE });
  const ac = a * (1 - seg(T, T_PART + .2, T_PART + .8));
  if (et && ac > .01) { const f = DEMO[et.cible]; cadreTirage(ctx, T, et, { x: f.cx - 24, y: f.cy - 27, w: 48, h: 52 }, { marge: 6, a: ac }); }
  if (T >= T_TAMPON2) tampon(ctx, T, { t: T_TAMPON2, txt: 'AUCUN MORT', taille: 84, c: CRAIE, a });
}
// ---------------------------------------------------------------- au centre de l'anneau
function auCentre(ctx, T) {
  const a = (T < B.P34 ? 1 - seg(T, S.sauverAlice, S.sauverAlice + .5) : T >= T_FORME ? seg(T, S.pasUn, S.pasUn + .4) : 0) * aFin(T);
  if (a <= .001) return;
  ctx.globalAlpha = a; ctx.font = `26px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('SAUVÉS = EN DANGER', CX, CY);
  ctx.globalAlpha = 1;
}
// ---------------------------------------------------------------- P37 : le trait de niveau et ses deux miniatures
function niveau(ctx, T) {
  if (T < S.plat || T >= S.plat + 2.3) return;
  const a = 1 - seg(T, S.plat + 1.8, S.plat + 2.2), k = eOut(seg(T, S.plat, S.plat + .3)), xb = W * k;
  ctx.globalAlpha = .8 * a; ctx.fillStyle = CRAIE; ctx.fillRect(0, 700, Math.round(xb), 1);
  // le pivot : un triangle de cases sous le milieu du trait (un fléau à l'arrêt)
  if (xb >= CX) for (let r = 0; r < 4; r++) ctx.fillRect(CX - (2 * r + 1) * 1.5, 701 + r * 3, (2 * r + 1) * 3, 3);
  // à gauche, le bleu tiré au sort, figé en caractères ; à droite, la pièce d'Alice (α 0,6 : quand le trait les atteint)
  const aG = .6 * a * seg(xb, 40, 140), aD = .6 * a * seg(xb, 1680, 1810);
  if (aG > 0) dessineSujet(ctx, DEMO[VICTIME], 92, 676, 4, { col: BLEU, a: aG, dis: .3 }, T_PART + 1);
  if (aD > 0) pieceAlice(ctx, T_PART + 1, 1690, 580, 120, 120, { cs: 3, a: aD, nom: 0 });
  ctx.globalAlpha = 1;
}
// ---------------------------------------------------------------- la légende (EPISODE.md : « sujets de démonstration »)
function legende(ctx, T) {
  const a = seg(T, B.P34 + .6, B.P34 + 1.2) * (1 - seg(T, T_FORME, T_FORME + .5)); if (a <= .01) return;
  // sous le coin droit de la grille ; quand la jauge du test est là (P36), sous la jauge (au-dessus, elle touchait ses
  // chiffres)
  const j = aTest(T);
  ctx.font = `15px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  if (j < 1) { ctx.globalAlpha = .85 * a * (1 - j); ctx.fillText('sujets de démonstration', 1148, 658); }
  if (j > 0) { ctx.globalAlpha = .85 * a * j; ctx.fillText('sujets de démonstration', 1148, 734); }
  ctx.globalAlpha = 1;
}

// ================================================================ P38 : le terminal, à la place de RÈGLES
// Il tape la boucle au rythme de la voix : chaque « pour sauver » tape « sauver( », chaque « ceux qui », « ceux_qui( »,
// chaque « de se mettre en danger », « risquent( » ; une ligne par tour, de plus en plus en retrait, sans jamais fermer
// une parenthèse. Quand la voix accélère, les lignes s'empilent de plus en plus vite et débordent ; au blocage, « ^C »,
// puis l'invite.
const TERM = Object.freeze({ x: 1334, y: 250, w: 526, h: 236, taille: 22 });   // (à gauche de 1 334, l'anneau poussé à ×1,15)
const BOUCLE = 'sauver(ceux_qui(risquent(';
const JETONS = Object.freeze(['sauver(', 'ceux_qui(', 'risquent(']);
const cars = t => [...t].length;
const LIGNES_DITES = (() => {
  const out = [];
  [S.pour[1], S.finV19, S.finV20].forEach((fin, c) => {
    const debuts = [S.pour[c], S.ceux[c], S.mettre[c]], pre = c === 0 ? '> ' : NB.repeat(2 * c);
    const tapes = T => JETONS.reduce((n, J, m) => {
      const t0 = debuts[m], t1 = m < 2 ? debuts[m + 1] : fin, cps = Math.max(24, cars(J) / Math.max(.05, t1 - t0));
      return n + clamp(Math.floor((T - t0) * cps), 0, cars(J));
    }, 0);
    // l'invite de la première ligne est là dès l'ouverture du terminal
    out.push({ t0: c === 0 ? B.P38 : S.pour[c], txt: pre + BOUCLE, col: LABO, n: T => (T >= (c === 0 ? B.P38 : S.pour[c]) ? cars(pre) : 0) + tapes(T) });
  });
  // le débordement : dès « de se mettre » de V20, des lignes de plus en plus rapides (0,2 s, puis ×0,78 chacune)
  let t = S.mettre[2] + .45, d = .2, c = 3;
  while (t < S.TB) {
    const pre = NB.repeat(2 * c), t0 = t, dd = d;
    out.push({ t0, txt: pre + BOUCLE, col: LABO, n: T => (T >= t0 ? cars(pre) + Math.floor(cars(BOUCLE) * seg(T, t0, t0 + dd)) : 0) });
    t += d; d *= .78; c++;
  }
  return Object.freeze(out);
})();
// au blocage, les lignes sont figées telles qu'elles étaient
const LIGNES_FIGEES = (() => LIGNES_DITES.filter(L => S.TB >= L.t0).map(L => {
  const vis = [...L.txt].slice(0, L.n(S.TB - 1e-6)).join('');
  return { t0: -Infinity, txt: vis, col: L.col, n: () => cars(vis) };
}).filter(L => L.txt.length))();
const LIGNES_FIN = Object.freeze([...LIGNES_FIGEES, { t0: S.TC, txt: '^C', col: CRAIE, cps: 24 }, { t0: S.TC + .3, txt: '> ', col: LABO, cps: 40 }]);
function leTerminal(ctx, T) {
  if (T < B.P38) return;
  const a = seg(T, B.P38, B.P38 + .3) * aFin(T); if (a <= .001) return;
  terminal(ctx, T, T < S.TB ? LIGNES_DITES : LIGNES_FIN, { ...TERM, a });
}

// ================================================================ la scène, à l'instant T
function scene(ctx, T) {
  if (T >= S.TB && T < S.TR) { blocage(ctx, T); return; }
  const M = monde(T), O = etatOeil(T, M);
  // le fond du laboratoire (index.html), qui s'éclaire avec la vie ; le sol penche avec le monde (à plat, il est dessiné
  // par fond(), comme au lot kant : l'image du raccord est la même au pixel près)
  const plat = M.th === 0 && M.z === 1;
  fond(ctx, T, { sol: plat ? SOL : 0, clair: clair(T), centre: centreFond(T) });
  ctx.save(); appliqueMonde(ctx, M);
  if (!plat) sol(ctx, SOL);
  jaugeAlice(ctx, T);
  laPiece(ctx, T, O);
  flechesDuMonde(ctx, T);
  foule(ctx, T, O);
  marques(ctx, T);
  testDeBase(ctx, T);
  auCentre(ctx, T);
  niveau(ctx, T);
  legende(ctx, T);
  ctx.restore(); ctx.globalAlpha = 1;
  leTerminal(ctx, T);
  // Phi (hors du monde : il ne penche jamais)
  oeil(ctx, T, { x: O.x, y: O.y, taille: O.s, humeur: O.h, regard: O.g, clins: CLINS });
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- le blocage (P38) : l'image figée, trois bandes décalées
// L'image de l'instant du blocage est calculée une fois dans une toile à part (une mémoire de calcul) ; trois bandes
// horizontales (hauteurs, places et décalages tirés par hache) glissent de côté de 12 à 60 px, en boucle sur la largeur ;
// à « ^C », elles reviennent, et le terminal écrit, seul vivant dans l'image figée.
const BANDES = Object.freeze([0, 1, 2].map(b => Object.freeze({
  y: Math.round(90 + b * 230 + hache(b * 7 + 41) * 150), h: Math.round(26 + hache(b * 7 + 42) * 96),
  dx: Math.round((hache(b * 7 + 43) < .5 ? -1 : 1) * (12 + hache(b * 7 + 44) * 48)),
})));
let FIGEE = null;
function imageFigee() {
  if (FIGEE && FIGEE.t === S.TB) return FIGEE.c;
  const c = toile(W, H), g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H);
  scene(g, S.TB - 1e-3);
  FIGEE = { t: S.TB, c };
  return c;
}
function blocage(ctx, T) {
  const F = imageFigee();
  ctx.drawImage(F, 0, 0);
  if (T < S.TC) {
    const k = eOut(seg(T, S.TB, S.TB + .1));
    for (const b of BANDES) {
      const dx = Math.round(b.dx * k); if (!dx) continue;
      ctx.drawImage(F, 0, b.y, W, b.h, dx, b.y, W, b.h);
      ctx.drawImage(F, 0, b.y, W, b.h, dx - Math.sign(dx) * W, b.y, W, b.h);
    }
  } else leTerminal(ctx, T);
}

// ================================================================ les plans (EPISODE.md, « Les plans »)
const dessine = (ctx, t) => scene(ctx, t);
export const PLANS = [
  { id: 'P32', de: 381.6, a: 396.7, dessine },   // Déséquilibrer (V01–V02)
  { id: 'P33', de: 396.7, a: 422.2, dessine },   // Sauver Alice (V03–V08)
  { id: 'P34', de: 422.2, a: 448.9, dessine },   // Les bleus accidentels (V09–V11)
  { id: 'P35', de: 448.9, a: 465.1, dessine },   // En connaissance de cause (V12–V13)
  { id: 'P36', de: 465.1, a: 489.9, dessine },   // Un bleu tiré au hasard (V14–V16)
  { id: 'P37', de: 489.9, a: 503.6, dessine },   // Le point d'équilibre (V17–V18)
  { id: 'P38', de: 503.6, a: 526.9, dessine },   // La boucle infinie (V19–V21)
];

// ================================================================ les indices sonores (tools/son-pilules.cjs)
// f : la hauteur (tic, hop, note : Hz) ; pour un souffle, [de, à] en Hz. Le grincement du monde qui penche : un souffle
// grave qui descend ; son envers quand il se redresse.
const pan = x => clamp((x - 960) / 960 * .8, -1, 1);
const r3 = t => +t.toFixed(3);
const MOTIF = Object.freeze([659.25, 783.99, 987.77, 880.0]);   // les quatre notes du motif (son-pilules.cjs : motif)
const sautsDe = (t0, t1, g) => SUJETS.flatMap(s => s.coul.filter(([t, , sa]) => sa && t >= t0 && t < t1)
  .map(([t]) => ({ t: r3(t), son: 'hop', f: 380 + hache(s.i * 11 + Math.round(t * 10)) * 420, g, pan: pan(s.f.cx) })));
// P38 : une note par flèche allumée (λ entier), jusqu'à 0,9 s du blocage ; puis le bourdonnement
const NOTES38 = (() => {
  const out = [];
  for (let n = 1; ; n++) {
    let t;
    if (n <= LAM_V20) t = B.P38 + n / 2;
    else t = S.v20 + DV20 * Math.log(1 + (n - LAM_V20) * Math.log(6) / (2 * DV20)) / Math.log(6);
    if (t >= S.TB - .9) break;
    out.push({ t: r3(t), son: 'note', f: MOTIF[n % 4], d: .12, g: .16 });
  }
  return out;
})();
const victime = DEMO[VICTIME];
export const SONS = Object.freeze([
  { t: LOT.de, son: 'nappe', f: 'labo', g: .5 },
  // P32 : les pas de l'anneau qui ralentit ; le declic de l'arrêt ; la pièce d'Alice ; le monde penche
  ...PAS32.filter(p => p.s >= LOT.de).map(p => ({ t: r3(p.s), son: 'tic', f: 1500, g: .12 })),
  { t: r3(S.disp), son: 'declic', g: .35 },
  { t: r3(S.personne), son: 'pop', f: 700, g: .3, pan: pan(1460) },
  { t: r3(S.alice), son: 'souffle', d: .7, f: [700, 140], g: .4 },
  // P33 : la jauge ; la vie dans la pièce d'Alice ; l'éventail ; le souffle des capes ; le grincement à l'envers
  { t: r3(S.sauvee), son: 'declic', g: .3 },
  { t: r3(S.sauvee + .8), son: 'vie', d: 1.4, g: .35, pan: pan(1460) },
  { t: r3(S.sauverAlice), son: 'souffle', d: .8, f: [900, 1800], g: .16 },
  { t: r3(S.heroique), son: 'souffle', d: .45, f: [2200, 900], g: .28 },
  { t: r3(S.question), son: 'souffle', d: .9, f: [140, 700], g: .4 },
  // P34 : la grille ; la pluie des ✓ ; une croix douce par ✗, le saut ; les petites pièces ; le petit grincement
  { t: r3(B.P34), son: 'retour', d: .6, g: .2 },
  ...SUJETS.map(s => ({ t: r3(tCoche(s.i)), son: 'coche', g: .08, pan: pan(s.f.cx) })),
  ...ACC.flatMap((i, j) => [{ t: r3(tX(j)), son: 'croix', g: .4, pan: pan(DEMO[i].cx) }, { t: r3(tSautAcc(j)), son: 'hop', f: 420, g: .2, pan: pan(DEMO[i].cx) }]),
  ...ACC.map((i, j) => ({ t: r3(tSalle(j)), son: 'declic', g: .12, pan: pan(DEMO[i].cx) })),
  { t: r3(S.role), son: 'souffle', d: .6, f: [600, 200], g: .25 },
  // P35 : le tampon ; les ✗ corrigés ; le grincement à l'envers ; le froissement des têtes
  { t: r3(S.cas + .15), son: 'tampon', g: .7 },
  { t: r3(S.cas + .05), son: 'souffle', d: .7, f: [200, 600], g: .25 },
  ...ACC.map((i, j) => ({ t: r3(tCorr(j)), son: 'coche', g: .3, pan: pan(DEMO[i].cx) })),
  { t: r3(S.sait), son: 'souffle', d: 1.8, f: [700, 1300], g: .15 },
  // P36 : les hop ; le seuil ; la vie, longue (l'envol passe dessous : c'est ce contraste qui fait mal) ; les tic du tirage
  // qui ralentissent, le clac du verrou ; le grincement de l'autre côté ; un seul envol ; b0 : la vie, le tampon
  ...sautsDe(B.P36, S.siBleue + 1.5, .14),
  { t: r3(LUEUR1 - .45), son: 'declic', g: .4 },
  { t: r3(LUEUR1), son: 'vie', d: Math.max(1, S.rouge - LUEUR1 - .4), g: .45 },
  ...SAUTS.slice(0, -1).map((t, k) => ({ t: r3(t), son: 'tic', f: 2400, g: .32 - k * .015, pan: pan(DEMO[ORDRE_TIRAGE[k]].cx) })),
  { t: r3(T_POSE), son: 'clac', g: .45, pan: pan(victime.cx) },
  { t: r3(S.meure + .05), son: 'souffle', d: .7, f: [700, 140], g: .4 },
  { t: r3(T_PART), son: 'envol', d: D_PART, g: .5, pan: pan(victime.cx) },
  { t: r3(S.rouge), son: 'retour', d: .9, g: .3 },
  ...sautsDe(S.rouge + .2, S.rouge + 1.5, .14),
  { t: r3(LUEUR2), son: 'vie', d: 2.0, g: .45 },
  { t: r3(T_TAMPON2), son: 'tampon', g: .7 },
  // P37 : le grincement à l'envers ; le clac mat du niveau ; la foule se remet, b62 ; un tic par sujet qui rejoint
  // l'anneau ; le motif des flèches revient (deux fois, le tour) ; le declic du texte
  { t: r3(S.equilibre), son: 'souffle', d: .8, f: [140, 700], g: .4 },
  { t: r3(S.plat), son: 'clac', g: .5 },
  { t: r3(S.sauve), son: 'retour', d: .6, g: .25 },
  ...sautsDe(S.sauve + .25, S.sauve + 1.2, .1),
  ...ORDRE_ANNEAU.map((i, k) => ({ t: r3(T_FORME + k / ANNEAU.n * .4 + .8), son: 'tic', f: 1800 + hache(i * 3 + 1) * 900, g: .05, pan: pan(anneau(k, 0).x) })),
  { t: r3(T_FLECHES), son: 'motif', g: .35 }, { t: r3(T_FLECHES + .8), son: 'motif', g: .3 },
  { t: r3(S.pasUn), son: 'declic', g: .3 },
  // P38 : un tic par cran ; la frappe du terminal ; le motif des flèches, une note par flèche allumée, qui accélère (de 2
  // à 12 par seconde) jusqu'au bourdonnement ; au blocage, tout se coupe sur un coup à 55 Hz, puis le silence (la nappe
  // revient d'elle-même) ; « ^C » : deux tic secs
  { t: r3(S.pour[0]), son: 'tic', f: 900, g: .25 }, { t: r3(S.pour[1]), son: 'tic', f: 900, g: .25 },
  ...LIGNES_DITES.slice(0, 3).flatMap((L, c) => [S.pour[c], S.ceux[c], S.mettre[c]].map(t => ({ t: r3(t), son: 'frappe', d: .35, g: .15, pan: .6 }))),
  { t: r3(S.mettre[2] + .45), son: 'frappe', d: Math.max(.2, S.TB - S.mettre[2] - .5), g: .2, pan: .6 },
  ...NOTES38,
  { t: r3(S.TB - 1.0), son: 'vibreur', d: 1.0, g: .35 },
  { t: r3(S.TB), son: 'note', f: 55, d: 1.2, g: .8 },
  { t: r3(S.TB), son: 'silence', d: 1.6 },
  { t: r3(S.TC), son: 'tic', f: 3200, g: .4, pan: .6 }, { t: r3(S.TC + .08), son: 'tic', f: 3200, g: .4, pan: .6 },
  { t: r3(S.fin), son: 'souffle', d: 1.0, f: [1200, 500], g: .12 },
].sort((a, b) => a.t - b.t));

// ================================================================ pour les essais (la console, un script de vérification)
export const ESSAI = Object.freeze({
  S, PAS32, VICTIME, ORDRE_TIRAGE, ACC, BANDES, ROT_FIN, T_POSE, T_PEUR, T_PART, T_FORME, T_FLECHES, LUEUR1, LUEUR2,
  penche, zoom, rot32, rot38, vitesse38, lam,
  // le raccord de l'anneau : de 381,6 s à « déséquilibrer », la rotation est exactement celle de pasAnneau (commun.js)
  raccordAnneau() { let m = 0; for (let t = LOT.de; t <= S.des; t += .01) m = Math.max(m, Math.abs(rot32(t) - pasAnneau(t, S.circ))); return m; },
  regard: T => { const R = T >= B.P38 && T < S.TB ? null : regard(); if (!R) return 'l’anneau'; const c = R.cible(T); return c && c.vous ? 'vous' : c && { x: Math.round(c.x), y: Math.round(c.y) }; },
  foule(T) {
    const M = monde(T), O = etatOeil(T, M), out = { modes: {}, couleurs: {}, dis: 0 };
    for (const s of SUJETS) {
      const p = place(s, T), e = etat(s, T, O, p);
      if (e.dis > 0) { out.dis++; continue; }
      out.modes[e.mode] = (out.modes[e.mode] || 0) + 1;
      out.couleurs[e.col] = (out.couleurs[e.col] || 0) + 1;
    }
    return out;
  },
});
