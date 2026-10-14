/* ==========================================================================
   Les deux pilules, le film — film.js : le cadre

   Ronan : « essaie de faire une version "cinématographique" de la même
   histoire, dans le même style. Avec Phi qui présente le concept de
   l'émission, ce qui s'est passé (le passage des tests et l'expérience sur
   les réseaux sociaux d'Arte). Tu peux faire différents plans, concevoir une
   petite histoire pour rendre ça plus vivant et qu'il y ait un peu
   d'émotion. Phi peut faire des petites blagues et commenter les résultats à
   la fin. » Le scénario et son découpage : SCENARIO.md (il fait foi).

   L'architecture de mockups/film-boucle/ : tout est fonction du temps t (en
   secondes), composer(t) dessine l'image de l'instant t ; la page joue le film
   en direct, ?t=42.5 en montre une image fixe, ?rendu=1 et window.film servent
   au rendu vidéo image par image (25 i/s, sur le modèle de tools/rendre-film.cjs).

   Ce fichier tient la ligne de temps (DUREE, LOTS, DECOUPAGE), appelle le bon
   plan, fait les transitions, dessine la SURIMPRESSION (la boîte de dialogue,
   le cartouche, le carnet rangé dans le coin, la mention « prototype », puis le
   voile par-dessus tout) et la lecture.

   Paramètres : ?t=42.5 (une image fixe, en pause) · ?plan=regles ou ?plan=P08
   (le mode plan : boucle sur un lot ou un plan) · ?de=40&a=50 (boucle sur un
   moment) · ?rendu=1 (ni barre ni commandes : pour le rendu vidéo) ·
   ?ecriture=jeu (la boîte écrit à 36 car./s, comme index.html, au lieu du
   rythme de la parole : voir texte.js).
   Clavier : espace lecture/pause · ← → 5 s · Maj+← → 1 s · , . une image ·
   R recommencer · C la barre de temps · M le son (son.mp3, calculé par
   tools/rendre-film.cjs --film film-pilules, joué avec l'image). Sans ?t, la page montre l'affiche ;
   la lecture part du début (de la boucle en mode plan, qui joue tout de suite).

   ---------------------------------------------------------------------------
   CONTRAT POUR LES LOTS — ce qu'un lot écrit, ce qu'il peut utiliser
   ---------------------------------------------------------------------------
   1. Un lot n'écrit QUE ses fichiers : plans/<lot>.js (et plans/<lot>-*.js,
      plans/essai-<lot>.html s'il en veut une ; le lot europe : aussi europe.js
      et tools/carte-europe.cjs). Il ne touche ni à ce fichier, ni à
      index.html, commun.js, texte.js, donnees.js, plans/ebauche.js. S'il lui
      faut un utilitaire commun qui n'existe pas, il le définit chez lui ; si
      un texte ou un chiffre ne va pas, il le dit (on le change à la source).

   2. plans/<lot>.js est un module ES qui exporte :
        export const LOT = { id: 'regles', de: 40.8, a: 86.8 };
        export const PLANS = [
          { id: 'P07', de: 40.8, a: 45.2,
            dessine(ctx, t, cam, infos) { … },
            camera: [[t, wx, wy, sx, sy, z], …],     // facultatif
            entree: { type: 'volet', sens: 'droite' }, // facultatif
            sortie: { type: 'noir', d: .6 } },         // facultatif
          …
        ];
        export const SONS = [ { t: 41.2, son: 'grain', d: .8, pan: -.4 }, … ];
      Les bornes du lot sont celles de LOTS ci-dessous (SCENARIO.md) : un plan
      ne sort jamais de son lot ; aux frontières, l'image de raccord est dans
      le scénario et dans les briefs.

   3. dessine(ctx, t, cam, infos) — appelée à chaque image où le plan est actif :
      - t : le temps ABSOLU du film. Aucun état d'une image à l'autre :
        ?t=123.4 doit donner exactement l'image de la lecture (hache, rng à
        graines fixes ; jamais Math.random ; les mémoires de calcul sont
        permises si elles ne changent pas l'image).
      - ctx : une toile 1920×1080 à soi, remise à zéro avant chaque appel
        (transformation, alpha, découpe : rien ne fuit vers la surimpression
        ni vers l'image suivante). Le plan peint TOUT son fond.
      - cam : la caméra du plan à l'instant t, tirée de plan.camera (images
        clés [t, wx, wy, sx, sy, z] : « le point (wx, wy) du monde en (sx, sy)
        à ×z », en douceur, le zoom en échelle logarithmique) ; IDENTITE sans
        plan.camera. cam.applique(ctx) (entre save et restore), cam.ecran(x, y),
        cam.monde(x, y), cam.z. Un plan qui a plusieurs caméras (l'écran
        partagé) les calcule lui-même : camera(t, cles) et cadre() de commun.js.
      - infos : { lot, plan (sa ligne de DECOUPAGE : titre, cadre…), europe
        (globalThis.EUROPE, ou null si europe.js manque), rendu }.
      Le plan dessine le MONDE (sous sa caméra) puis PHI (l'œil, placé plan par
      plan, hors caméra). Il ne dessine NI la boîte de dialogue, NI le
      cartouche, NI le carnet du coin, NI « données fictives », NI le voile :
      c'est la surimpression, dessinée ici, par-dessus. Rien d'important sous
      y = 830 (la boîte : x 80–1840, y 862–1040, étiquette XPHI en 112, 838).

   4. Les transitions :
      - coupe (par défaut) et raccord : deux plans qui se suivent ;
      - fondu enchaîné : deux plans d'un même lot qui se chevauchent (un plan
        peut déborder de 0,5 s sur son voisin, jamais hors de son lot) ; pendant
        le chevauchement, le second apparaît sur le premier (eIO) ;
      - volet : le même chevauchement, avec entree: { type: 'volet', sens }
        sur le second (sens 'droite' : le bord part de la gauche ; 'gauche',
        'bas', 'haut') ;
      - fondu au noir : entree / sortie: { type: 'noir', d } (le plan sort du
        noir, ou y entre, en d secondes ; la surimpression reste).
      Dans un chevauchement, chaque plan reçoit le même t : le premier doit
      savoir se dessiner un peu après sa fin nominale.

   5. Ce qu'on peut utiliser : tout commun.js (la DA : voir son en-tête), texte.js
      (REPLIQUES, NOTES, CARNET, AJOUTS, DESCRIPTIONS, cite, CARTOUCHES, plume(T)),
      donnees.js (les chiffres fictifs), globalThis.EUROPE (europe.js : la carte,
      les données par pays), et ce fichier en lecture (DUREE, LOTS, DECOUPAGE,
      SURIMPRESSION) — sans l'importer depuis un lot : infos suffit.

   6. Si dessine lève une erreur, le film l'écrit dans la console (une fois) et
      sur l'image, et continue ; un lot qui ne se charge pas est remplacé par
      son ébauche. window.film.verifie() liste ce qui cloche (lots, bornes,
      répliques trop larges, données).
   ========================================================================== */
import * as C from './commun.js';
import { dialogue, verifieRepliques, prepareTextes, reglerEcriture, ecritsEntre, REPLIQUES, NOTES, CARNET, CARTOUCHES, DESCRIPTIONS, MENTION_FICTIVES, MENTION_PAYS } from './texte.js';
import { verifie as verifieDonnees } from './donnees.js';
import { ebauche } from './plans/ebauche.js';

const { W, H } = C;
export const DUREE = 201.5;
export const IPS = 25;
export const AFFICHE = 36.0;          // l'image de la page avant la lecture : le N°48, la bleue dans un œil, la rouge dans l'autre

// ================================================================ la ligne de temps (SCENARIO.md, « Vue d'ensemble », « Les lots »)
export const LOTS = Object.freeze([
  { id: 'nuit', plans: 'P01–P06', de: 0, a: 40.8 },
  { id: 'regles', plans: 'P07–P10', de: 40.8, a: 86.8 },
  { id: 'isoloir', plans: 'P11–P13', de: 86.8, a: 118.6 },
  { id: 'europe', plans: 'P14–P16', de: 118.6, a: 151.8 },
  { id: 'issue', plans: 'P17–P22', de: 151.8, a: DUREE },
].map(Object.freeze));
export const DECOUPAGE = Object.freeze([
  ['P01', 0.0, 6.0, 'nuit', 'Quelqu’un ne dort pas', 'rapproché ×6, recul lent', 'intimité'],
  ['P02', 6.0, 9.4, 'nuit', 'Titre', 'fixe, centré', 'la machine s’allume'],
  ['P03', 9.4, 18.6, 'nuit', 'Le laboratoire', 'plan large fixe', 'sympathie'],
  ['P04', 18.6, 26.6, 'nuit', 'Le carnet', 'insert, poussée lente', 'assurance naïve'],
  ['P05', 26.6, 30.6, 'nuit', 'Le fil', 'raccord regard, insert', 'l’observateur naïf'],
  ['P06', 30.6, 40.8, 'nuit', 'L’appel', 'insert / rapproché / plongée dans l’avatar', 'le petit geste qui engage'],
  ['P07', 40.8, 45.2, 'regles', 'Les pilules', 'fixe', 'on entre dans le jeu'],
  ['P08', 45.2, 60.8, 'regles', 'La démonstration', 'plan large fixe', 'gravité, sécheresse'],
  ['P09', 60.8, 67.4, 'regles', 'Rassurez-vous', 'large, poussée lente', 'le pacte'],
  ['P10', 67.4, 86.8, 'regles', 'Autrement dit', 'ensemble, poussée finale', 'le hasard choisit ses mots'],
  ['P11', 86.8, 98.4, 'isoloir', 'Le test', 'isoloir ×4,2, recul ×2', 'tendresse'],
  ['P12', 98.4, 111.8, 'isoloir', 'Le choix', 'isoloir, poussée lente, recul ×1', 'le doute, la pudeur'],
  ['P13', 111.8, 118.6, 'isoloir', 'Constellation', 'recul ×1 → ×0,245', 'vertige'],
  ['P14', 118.6, 128.8, 'europe', 'L’Europe', 'ensemble, poussée lente', 'émerveillement, bascule'],
  ['P15', 128.8, 138.8, 'europe', 'Deux phrases', 'ensemble fixe', 'la compréhension'],
  ['P16', 138.8, 151.8, 'europe', 'Les deux salles', 'ensemble fixe', 'le paradoxe, le sourire'],
  ['P17', 151.8, 162.2, 'issue', 'Le N°48, retrouvé', 'poussée, plongée ×22', 'le chagrin'],
  ['P18', 162.2, 171.6, 'issue', 'L’autre salle', 'écran partagé', 'la révélation'],
  ['P19', 171.6, 178.4, 'issue', 'La vraie nuit', 'rapproché ×6, fixe', 'soulagement'],
  ['P20', 178.4, 185.4, 'issue', 'Le carnet, encore', 'insert', 'l’aveu'],
  ['P21', 185.4, 196.0, 'issue', 'Et vous ?', 'plan moyen fixe', 'complicité, soin'],
  ['P22', 196.0, 201.5, 'issue', 'Carton', 'plein cadre', 'fin'],
].map(([id, de, a, lot, titre, cadre, battement]) => Object.freeze({ id, de, a, lot, titre, cadre, battement })));

// ================================================================ la surimpression (SCENARIO.md, « La surimpression »)
// Dessinée par le cadre, pas par les plans, dans cet ordre : la boîte de dialogue (texte.js), le cartouche, le carnet
// rangé dans le coin, « données fictives » ; puis le voile (trame + vignettage) par-dessus tout.
export const SURIMPRESSION = Object.freeze({
  // le cartouche est caché quand il gênerait : la nuit (P01), la constellation et la carte (P13–P15), la fin (152,4 s)
  cartouches: Object.freeze([
    { de: 9.4, a: 31.0, mots: CARTOUCHES.titre, entree: 0 },   // P02 l'y amène en glissant
    { de: 31.0, a: 111.8, mots: CARTOUCHES.test, entree: .3 },
    { de: 138.8, a: 152.4, mots: CARTOUCHES.resultats, entree: .5 },
  ].map(Object.freeze)),
  // le carnet rangé dans le coin (x 1290, y 40, largeur 570) : l'en-tête et la dernière note, qui s'écrit
  carnet: Object.freeze([
    { de: 17.3, a: 18.6, notes: 1, sortie: 0 },    // note 0001 ; à 18,6, P04 le prend à cette place même
    { de: 29.0, a: 31.0, notes: 2, sortie: .3 },   // note 0002 (P05, le gag des chats)
    { de: 109.8, a: 112.2, notes: 3, sortie: .3 }, // note 0003 (P12)
  ].map(Object.freeze)),
  // la mention (texte.js : « prototype · chiffres du questionnaire de Monsieur Phi ») : IBM Plex Mono 16 px, GRIS,
  // alignée à droite en (1840, 1068), sous la boîte (la troisième tient jusqu'à ce que le carnet, et sa note 0004
  // « écart : 52,9 points », se soit rangé et effacé : 186,0) ; pendant la carte, elle dit que les pays sont inventés
  fictives: Object.freeze([[30.8, 40.6], [89.6, 171.6], [178.4, 186.3]]),
  pays: Object.freeze([118.6, 138.8]),
});

// ================================================================ l'état du film (les lots chargés)
const etatLots = {};          // id → { module, plans, sons, statut, erreur }
let EUROPE = null, RENDU = false;
const dejaDit = new Set();
const ditUneFois = (cle, ...m) => { if (!dejaDit.has(cle)) { dejaDit.add(cle); console.error(...m); } };

export function lotA(t) { for (const L of LOTS) if (t >= L.de && t < L.a) return L; return t >= DUREE ? LOTS[LOTS.length - 1] : LOTS[0]; }
export const planDecoupage = t => DECOUPAGE.find(p => t >= p.de && t < p.a) || null;

// les plans actifs à l'instant t : ceux du lot dont [de, a) contient t, dans l'ordre de PLANS ; à défaut, l'ébauche
function actifs(L, t) {
  const E = etatLots[L.id], liste = E && E.plans ? E.plans.filter(p => t >= p.de && t < p.a) : [];
  if (liste.length) return liste;
  const D = planDecoupage(t);
  return D ? [{ id: D.id, de: D.de, a: D.a, dessine: ebauche, ebauche: true }] : [];
}

// ================================================================ composer(t) : l'image de l'instant t
let ctx = null, A = null, B = null;
const ETAT = { t: 0, lot: '', plans: [], ebauche: false };
function remise(c) {
  if (c.reset) c.reset();
  else { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.clearRect(0, 0, W, H); }
  c.imageSmoothingEnabled = true; c.lineCap = 'butt'; c.lineJoin = 'miter';
}
function propre(c) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.imageSmoothingEnabled = true; c.setLineDash([]); c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)';
}
function rendrePlan(c, L, P, t) {
  remise(c);
  const D = DECOUPAGE.find(d => d.id === P.id) || planDecoupage(t);
  const E = etatLots[L.id] || {};
  const infos = { lot: L, plan: D, europe: EUROPE, rendu: RENDU, statut: P.ebauche ? E.statut : undefined, erreur: P.ebauche ? E.erreur : undefined };
  try {
    const cam = P.camera ? C.camera(t, P.camera) : C.IDENTITE;
    (P.dessine || ebauche)(c, t, cam, infos);
  } catch (e) {
    ditUneFois(`${P.id}|${e.message}`, `[film] ${P.id} (lot ${L.id}) à ${t.toFixed(2)} s :`, e);
    remise(c);
    c.fillStyle = '#1a0c0c'; c.fillRect(0, 0, W, H);
    c.font = `28px ${C.PIX}`; c.fillStyle = C.ROUGE_TXT; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.fillText(`${P.id} · erreur dans plans/${L.id}.js à ${t.toFixed(2)} s`, 120, 380);
    c.font = `20px ${C.MONO}`; c.fillStyle = C.CRAIE;
    C.coupe(c, String(e && e.stack || e), 1600).slice(0, 8).forEach((l, i) => c.fillText(l, 120, 430 + i * 30));
  }
}
function transition(P, k) {
  const e = P.entree || {};
  return e.type === 'volet' ? { type: 'volet', k: C.eIO(k), sens: e.sens || 'droite' } : e.type === 'coupe' ? { type: 'coupe' } : { type: 'fondu', k: C.eIO(k) };
}
function poser(src, tr) {
  if (tr.type === 'coupe') { ctx.drawImage(src, 0, 0); return; }
  if (tr.type === 'fondu') { ctx.globalAlpha = tr.k; ctx.drawImage(src, 0, 0); ctx.globalAlpha = 1; return; }
  const k = tr.k, r = { droite: [0, 0, W * k, H], gauche: [W * (1 - k), 0, W * k, H], bas: [0, 0, W, H * k], haut: [0, H * (1 - k), W, H * k] }[tr.sens] || [0, 0, W * k, H];
  ctx.save(); ctx.beginPath(); ctx.rect(...r); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore();
}
function noir(P, t) {
  let a = 0;
  if (P.entree && P.entree.type === 'noir') a = Math.max(a, 1 - C.seg(t, P.de, P.de + (P.entree.d ?? .6)));
  if (P.sortie && P.sortie.type === 'noir') a = Math.max(a, C.seg(t, P.a - (P.sortie.d ?? .6), P.a));
  return a;
}
export function composer(t) {
  remise(ctx);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const L = lotA(t), P = t >= 0 && t < DUREE ? actifs(L, t) : [];
  if (P.length) {
    rendrePlan(A.getContext('2d'), L, P[0], t);
    ctx.drawImage(A, 0, 0);
    for (let i = 1; i < P.length; i++) {   // un chevauchement : le suivant apparaît sur le précédent
      rendrePlan(B.getContext('2d'), L, P[i], t);
      poser(B, transition(P[i], C.seg(t, P[i].de, Math.min(P[i - 1].a, P[i].a))));
    }
    const n = Math.max(...P.map(p => noir(p, t)));
    if (n > 0) { ctx.globalAlpha = n; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }
  propre(ctx);   // la surimpression part d'un contexte propre (sans reset() : la toile garde son image)
  surimpression(ctx, t);
  C.voile(ctx);
  ETAT.t = t; ETAT.lot = L.id; ETAT.plans = P.map(p => p.id); ETAT.ebauche = P.some(p => p.ebauche || p.dessine === ebauche);
  return ETAT;
}

// ================================================================ la surimpression
function surimpression(c, t) {
  dialogue(c, t);
  // le cartouche : il entre en fondu, s'en va en fondu (.3 s) ; quand il change de mots sans s'en aller (31,0 s), c'est
  // un relais : le même cadre se redimensionne, les anciens mots s'effacent, les nouveaux se retapent
  const Ks = SURIMPRESSION.cartouches;
  Ks.forEach((K, i) => {
    const avant = Ks[i - 1], apres = Ks[i + 1];
    const relaisAvant = avant && Math.abs(avant.a - K.de) < 1e-6, relaisApres = apres && Math.abs(apres.de - K.a) < 1e-6;
    if (relaisAvant && t >= K.de && t < K.de + RELAIS) { relaisCartouche(c, t, avant, K); return; }
    const entre = relaisAvant ? (t >= K.de + RELAIS ? 1 : 0) : K.entree ? C.seg(t, K.de, K.de + K.entree) : t >= K.de ? 1 : 0;
    const a = entre * (relaisApres ? (t < K.a ? 1 : 0) : 1 - C.seg(t, K.a, K.a + .3));
    if (a > 0) C.cartouche(c, K.mots[0], K.mots[1], a);
  });
  // le carnet du coin
  for (const K of SURIMPRESSION.carnet) {
    if (t < K.de || t >= K.a + (K.sortie || 0)) continue;
    const a = C.seg(t, K.de, K.de + .25) * (K.sortie ? 1 - C.seg(t, K.a, K.a + K.sortie) : 1);
    C.carnet(c, t, { textes: CARNET, notes: NOTES.slice(0, K.notes), k: 0, a });
  }
  // la mention : les chiffres de Monsieur Phi, et pendant la carte, ceux des pays, inventés (un fondu de 0,3 s entre les deux)
  for (const [de, a] of SURIMPRESSION.fictives) {
    const al = C.cloche(t, de, de + .4, a - .4, a);
    if (al <= 0) continue;
    const [p0, p1] = SURIMPRESSION.pays, kp = C.cloche(t, p0, p0 + .3, p1 - .3, p1);
    c.font = `16px ${C.MONO}`; c.fillStyle = C.GRIS; c.textAlign = 'right'; c.textBaseline = 'alphabetic';
    if (kp < 1) { c.globalAlpha = al * (1 - kp); c.fillText(MENTION_FICTIVES, 1840, 1068); }
    if (kp > 0) { c.globalAlpha = al * kp; c.fillText(MENTION_PAYS, 1840, 1068); }
  }
  c.globalAlpha = 1;
}

const RELAIS = .6;
function relaisCartouche(c, t, P, K) {
  const k = C.seg(t, K.de, K.de + RELAIS), { x, y, h } = C.CARTOUCHE;
  const w = C.lerp(C.largeurCartouche(c, ...P.mots), C.largeurCartouche(c, ...K.mots), C.eIO(C.seg(k, .15, .65)));
  C.fenetre(c, x, y, w, h, 1);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.font = `24px ${C.PIX}`; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  const ligne = (txt, n, col, yy) => { const v = [...txt].slice(0, n).join(''); if (v) { c.fillStyle = col; c.fillText(v, x + 22, yy); } };
  const sort = 1 - C.seg(k, 0, .3);
  if (sort > 0) { c.globalAlpha = sort; ligne(P.mots[0], Infinity, C.LAITON, y + 34); ligne(P.mots[1], Infinity, C.CRAIE, y + 68); }
  const [h0, b0] = K.mots.map(m => [...m].length), n = Math.floor((h0 + b0) * C.seg(k, .4, 1));
  c.globalAlpha = 1; ligne(K.mots[0], Math.min(n, h0), C.LAITON, y + 34); ligne(K.mots[1], Math.max(0, n - h0), C.CRAIE, y + 68);
  c.restore(); c.globalAlpha = 1;
}

// ================================================================ le son de l'image : ce qui sonne pendant l'image de l'instant t
// La page décrit le son, image par image ; tools/son-pilules.cjs le synthétise (tools/rendre-film.cjs --film
// film-pilules) : les indices SONS des lots qui tombent dans l'image (t − 1/25, t], et les caractères que la boîte écrit
// pendant ce temps (les petits bips du texte, qui s'effaceront quand la voix de Ronan sera posée).
// Les bornes partent du numéro entier de l'image (k = t · 25) : la borne haute de l'image k − 1 est exactement la borne
// basse de l'image k, et chaque indice tombe dans une image et une seule. Avec t − 1/25 en flottants, 1686/25 − 1/25
// donnait 67,39999… : le souffle de 67,4 sonnait deux fois (+6 dB), et celui de 176,76000000000002 jamais.
let SONS_FILM = [];
const EPS = 1e-9;
export function evenements(t) {
  const k = Math.round(t * IPS), t1 = k / IPS + EPS, t0 = (k - 1) / IPS + EPS;
  return {
    t,
    bips: ecritsEntre(t0, t1).map(b => ({ t: Math.round(b.t * 1e4) / 1e4, c: b.c, x: Math.round(b.x) })),
    sons: SONS_FILM.filter(s => s.t > t0 && s.t <= t1),
  };
}
// chaque indice SONS, et chaque caractère écrit, est pris par une image et une seule, de 0 à DUREE (pour verifie())
function verifieSons() {
  const pb = [], vus = new Map(), bips = new Map(), n = Math.round(DUREE * IPS);
  for (let i = 0; i <= n; i++) {
    const e = evenements(i / IPS);
    for (const s of e.sons) vus.set(s, (vus.get(s) || 0) + 1);
    for (const b of e.bips) bips.set(`${b.t}|${b.c}|${b.x}`, (bips.get(`${b.t}|${b.c}|${b.x}`) || 0) + 1);
  }
  const nom = s => `${s.t} ${s.son} (${s.lot})`;
  const doubles = SONS_FILM.filter(s => vus.get(s) > 1), perdus = SONS_FILM.filter(s => s.t > -1 / IPS + EPS && s.t <= DUREE + EPS && !vus.has(s));
  if (doubles.length) pb.push(`son : ${doubles.length} indices pris par deux images (${doubles.slice(0, 4).map(nom).join(', ')}…)`);
  if (perdus.length) pb.push(`son : ${perdus.length} indices pris par aucune image (${perdus.slice(0, 4).map(nom).join(', ')}…)`);
  const tous = ecritsEntre(-1, DUREE + 1).length, bd = [...bips.values()].filter(v => v > 1).length;
  if (bd || bips.size !== tous) pb.push(`son : bips du texte, ${bd} doublés, ${tous - bips.size} perdus`);
  return pb;
}

// ================================================================ les caractères : tous dans les polices du dépôt
// Les caractères de DotGothic16 et d'IBM Plex Mono 400 et 500 (../pilules/fonts/, des sous-ensembles latins), en plages
// hexadécimales. MONO et PIX se relaient (commun.js) : un caractère est dessiné par une police du dépôt s'il est dans
// l'une ou l'autre. Hors de là, le navigateur le prend dans une police du système, et l'image dépend de la machine (✓ ✗ ▶
// sont dessinés en pixels par signe() de commun.js ; ∅ s'écrit Ø). À refaire si les polices changent :
//   python3 -c "from fontTools.ttLib import TTFont; import glob; print(sorted({c for f in glob.glob('mockups/pilules/fonts/*.woff2') for c in TTFont(f).getBestCmap()}))"
const PLAGES_POLICES = '0 d 20-7e a0-ff 131 152-153 2bb-2bc 2c6 2da 2dc 300-301 303-304 308-309 323 3c6 2013-2014 2018-201a ' +
  '201c-201e 2022 2026 2032-2033 2039-203a 2044 20ac 2122 2190-2193 2212 2215 25a0 25b2-25b3 25b7 25bc';
const PLAGES = PLAGES_POLICES.split(' ').map(r => r.split('-').map(h => parseInt(h, 16)));
const dansPolices = c => { const n = c.codePointAt(0); return PLAGES.some(([a, b = a]) => n >= a && n <= b); };
export const horsPolices = txt => [...new Set([...txt].filter(c => c !== '\n' && !dansPolices(c)))];
// les textes du film (texte.js, la poussière de caractères) ; les mots écrits dans les plans, glyphes() les voit
function verifieCaracteres() {
  const textes = [...REPLIQUES.map(r => r.txt), ...NOTES.map(n => n.txt), ...Object.values(CARNET), DESCRIPTIONS.collective,
    DESCRIPTIONS.individuelle, ...Object.values(CARTOUCHES).flat(), MENTION_FICTIVES, MENTION_PAYS, C.G.join('')];
  const hors = horsPolices(textes.join(''));
  return hors.length ? [`texte : ${hors.join(' ')} hors des polices du dépôt (une police du système les dessinerait)`] : [];
}
// tout ce que le film écrit (fillText, strokeText), de de à a, une image toutes les pas secondes : les caractères hors des
// polices du dépôt, avec un instant et une police où ils paraissent. Lent (une seconde de film ≈ 0,2 s à pas 0,1) :
// pour les essais, pas pour verifie(). window.film.glyphes(.1)
export function glyphes(pas = .25, de = 0, a = DUREE) {
  const P = CanvasRenderingContext2D.prototype, ft = P.fillText, st = P.strokeText, vus = new Map();
  let t = de;
  const note = (c, s) => { for (const ch of horsPolices(String(s))) if (!vus.has(ch)) vus.set(ch, `${ch} U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')} (${t.toFixed(2)} s, ${c.font})`); };
  P.fillText = function (s, ...r) { note(this, s); return ft.call(this, s, ...r); };
  P.strokeText = function (s, ...r) { note(this, s); return st.call(this, s, ...r); };
  try { for (; t < a; t = +(t + pas).toFixed(6)) composer(t); } finally { P.fillText = ft; P.strokeText = st; }
  return [...vus.values()];
}

// ================================================================ la vérification (pour les lots, et les essais)
export function verifie() {
  const pb = [];
  for (const L of LOTS) {
    const E = etatLots[L.id];
    if (!E || E.erreur) { pb.push(`lot ${L.id} : ${E ? E.erreur : 'absent'}`); continue; }
    const M = E.module;
    if (M.LOT && (M.LOT.id !== L.id || Math.abs(M.LOT.de - L.de) > 1e-6 || Math.abs(M.LOT.a - L.a) > 1e-6)) pb.push(`lot ${L.id} : LOT = ${JSON.stringify(M.LOT)}, le film dit ${L.de} → ${L.a}`);
    for (const p of E.plans) {
      if (typeof p.dessine !== 'function') pb.push(`${L.id}/${p.id} : pas de dessine()`);
      if (p.de < L.de - 1e-6 || p.a > L.a + 1e-6) pb.push(`${L.id}/${p.id} : ${p.de} → ${p.a} sort du lot (${L.de} → ${L.a})`);
    }
    for (let x = L.de; x < L.a - 1e-6; x += .1) if (!E.plans.some(p => x >= p.de && x < p.a)) { pb.push(`lot ${L.id} : aucun plan à ${x.toFixed(1)} s (l'ébauche le remplace)`); break; }
  }
  for (const m of verifieRepliques()) pb.push(`texte : ${m}`);
  for (const m of verifieSons()) pb.push(m);
  for (const m of verifieCaracteres()) pb.push(m);
  for (const m of verifieDonnees(EUROPE || undefined)) pb.push(`données : ${m}`);
  if (!EUROPE) pb.push('europe.js absent : globalThis.EUROPE est vide');
  return pb;
}

// ================================================================ le démarrage, la lecture
const fmt = s => { const m = Math.floor(s / 60), r = s - 60 * m; return `${m}:${r.toFixed(1).padStart(4, '0').replace('.', ',')}`; };
// lots : { id → module (ou { erreur }) } chargés par index.html ; europe : globalThis.EUROPE (ou null)
export async function demarre({ lots = {}, europe = null } = {}) {
  const params = new URLSearchParams(location.search);
  RENDU = params.has('rendu');
  if (params.has('ecriture')) reglerEcriture(params.get('ecriture'));
  EUROPE = europe || globalThis.EUROPE || null;
  for (const L of LOTS) {
    const M = lots[L.id];
    if (!M || M.erreur) { etatLots[L.id] = { erreur: M ? String(M.erreur && M.erreur.message || M.erreur) : 'module absent', statut: 'module absent ou cassé', plans: [], sons: [] }; if (M) console.error(`[film] lot ${L.id} :`, M.erreur); continue; }
    const plans = Array.isArray(M.PLANS) ? [...M.PLANS] : [];
    etatLots[L.id] = { module: M, plans, sons: Array.isArray(M.SONS) ? M.SONS : [], statut: plans.length ? '' : 'PLANS vide' };
  }
  const toileFilm = document.getElementById('film');
  ctx = toileFilm.getContext('2d');
  A = C.toile(W, H); B = C.toile(W, H);
  // les polices avant la première image (elles sont dans le dépôt : ../pilules/fonts/)
  const polices = Promise.all(['34px "DotGothic16"', '20px "IBM Plex Mono"', '500 20px "IBM Plex Mono"'].map(f => document.fonts.load(f)));
  await Promise.race([polices, new Promise(r => setTimeout(r, 3000))]).catch(() => {});
  C.prepare(); prepareTextes();

  // la boucle : le film, un lot, un plan, ou ?de=&a=
  let boucle = [0, DUREE];
  const pl = params.get('plan');
  if (pl) {
    const L = LOTS.find(l => l.id === pl), D = DECOUPAGE.find(d => d.id === pl.toUpperCase());
    if (L) boucle = [L.de, L.a]; else if (D) boucle = [D.de, D.a]; else console.warn(`[film] ?plan=${pl} : ni un lot (${LOTS.map(l => l.id).join(', ')}) ni un plan (P01…P22)`);
  }
  if (params.has('de') || params.has('a')) boucle = [+(params.get('de') ?? boucle[0]), +(params.get('a') ?? boucle[1])];
  const T0 = params.has('t') ? +params.get('t') : null;

  const sons = LOTS.flatMap(L => (etatLots[L.id].sons || []).map(s => ({ ...s, lot: L.id })));
  SONS_FILM = sons.filter(s => Number.isFinite(s.t)).sort((a, b) => a.t - b.t);
  window.film = {
    pret: false, duree: DUREE, ips: IPS, largeur: W, hauteur: H,
    lots: LOTS, decoupage: DECOUPAGE, surimpression: SURIMPRESSION, sons,
    // une image : la dessine et rend ce qui s'y passe (le lot, les plans) et ce qui y sonne — pour tools/rendre-film.cjs
    image: t => ({ ...composer(t), plans: [...ETAT.plans], ...evenements(t) }),
    // ce qui sonne pendant l'image de l'instant t, sans la dessiner (le son seul : rendre-film.cjs --son-seul)
    evenements,
    verifie,
    glyphes,
  };
  if (RENDU) {
    document.documentElement.classList.add('rendu');
    composer(T0 ?? AFFICHE);
    window.film.pret = true;
    return;
  }

  // ---------------------------------------------------------------- la lecture
  const barre = document.getElementById('barre'), piste = document.getElementById('piste'), tete = document.getElementById('tete');
  const etiquette = document.getElementById('etiquette'), temps = document.getElementById('temps'), aide = document.getElementById('aide');
  const segs = document.getElementById('segments');
  for (const L of LOTS) {
    const s = document.createElement('div'); s.className = 'seg'; s.title = `${L.id} · ${L.plans}`;
    s.style.left = `${100 * L.de / DUREE}%`; s.style.width = `${100 * (L.a - L.de) / DUREE}%`;
    if (etatLots[L.id].erreur || !etatLots[L.id].plans.length) s.classList.add('absent');
    segs.appendChild(s);
  }
  if (pl || params.has('de')) {
    const b = document.createElement('div'); b.className = 'boucle';
    b.style.left = `${100 * boucle[0] / DUREE}%`; b.style.width = `${100 * (boucle[1] - boucle[0]) / DUREE}%`;
    segs.appendChild(b);
  }
  let t = T0 ?? (pl || params.has('de') ? boucle[0] : 0), joue = false, depart = 0, tDepart = 0, raf = 0;
  // ---------------------------------------------------------------- le son (son.mp3), joué avec l'image
  // son.mp3 est calculé par node tools/rendre-film.cjs --film film-pilules --son-seul (à relancer quand le temps du film
  // change). S'il est là, c'est lui qui donne l'heure pendant la lecture ; sinon (ou tant que le navigateur ne le laisse
  // pas jouer), l'horloge de la page. M coupe le son.
  const son = { tampon: null, audio: null, source: null, gain: null, debut: 0, muet: false };
  const sonCoupe = () => { if (son.source) { try { son.source.stop(); } catch { /* déjà arrêté */ } son.source.disconnect(); son.source = null; } };
  const sonJoue = x => {
    sonCoupe();
    if (!son.tampon || x >= son.tampon.duration) return;
    try {
      if (!son.audio) {
        son.audio = new AudioContext();
        son.gain = son.audio.createGain(); son.gain.gain.value = son.muet ? 0 : 1; son.gain.connect(son.audio.destination);
        son.audio.onstatechange = () => { if (son.audio.state === 'running' && son.source) son.debut = son.audio.currentTime - t; else { tDepart = t; depart = performance.now(); } };
      }
      son.audio.resume();
      son.source = son.audio.createBufferSource(); son.source.buffer = son.tampon; son.source.connect(son.gain);
      son.source.start(0, x);
      son.debut = son.audio.currentTime - x;
    } catch { son.source = null; }
  };
  const sonCourt = () => son.source && son.audio && son.audio.state === 'running';
  fetch('son.mp3').then(r => (r.ok ? r.arrayBuffer() : null))
    .then(ab => ab && new OfflineAudioContext(2, 1, 48000).decodeAudioData(ab))
    .then(b => { son.tampon = b || null; if (son.tampon && joue) { tDepart = t; depart = performance.now(); sonJoue(t); } majAide(); })
    .catch(() => {});
  const afficher = x => {
    t = x; composer(t);
    const D = planDecoupage(Math.min(t, DUREE - 1e-6));
    tete.style.left = `${100 * C.clamp(t / DUREE)}%`;
    temps.textContent = `${fmt(t)} / ${fmt(DUREE)}`;
    etiquette.textContent = `${D ? `${D.id} · ${D.titre}` : ''} · lot ${ETAT.lot}${ETAT.ebauche ? ' (ébauche)' : ''}${pl ? ` · boucle ${pl}` : ''}`;
  };
  const avance = now => {
    if (!joue) return;
    let x = sonCourt() ? son.audio.currentTime - son.debut : tDepart + (now - depart) / 1000;
    if (x >= boucle[1]) {
      if (pl || params.has('de')) { tDepart = boucle[0]; depart = now; x = boucle[0]; sonJoue(x); }
      else { joue = false; sonCoupe(); afficher(DUREE - 1e-3); majAide(); return; }
    }
    afficher(x);
    raf = requestAnimationFrame(avance);
  };
  const majAide = () => {
    const m = son.tampon ? (son.muet ? ' · M : son coupé' : ' · M') : '';
    aide.textContent = joue ? `espace : pause${m}` : `espace : lecture · ← → 5 s · , . une image · R · C${m}`; barre.classList.toggle('joue', joue);
  };
  const memorise = () => {   // en pause, l'adresse garde l'instant (?t=) : on peut la donner à quelqu'un
    const p = new URLSearchParams(location.search); p.set('t', t.toFixed(2)); history.replaceState(null, '', `?${p}`);
  };
  // une seule boucle d'images : relancer la lecture pendant qu'elle tourne (R, window.film.lecture(true), une pause et
  // une reprise dans la même image) annule l'image demandée avant d'en redemander une (sinon chaque R ajoutait une
  // boucle, et l'image était composée deux, trois, quatre fois par affichage)
  const lecture = (oui = !joue) => {
    if (oui && t >= boucle[1] - 1e-3) t = boucle[0];
    joue = oui; majAide();
    cancelAnimationFrame(raf);
    if (joue) { tDepart = t; depart = performance.now(); sonJoue(t); raf = requestAnimationFrame(avance); } else { sonCoupe(); memorise(); }
  };
  const aller = x => { const y = C.clamp(x, 0, DUREE - 1e-3); if (joue) { tDepart = y; depart = performance.now(); sonJoue(y); } afficher(y); if (!joue) memorise(); };
  toileFilm.addEventListener('click', () => lecture());
  piste.addEventListener('click', e => { const r = piste.getBoundingClientRect(); aller(DUREE * (e.clientX - r.left) / r.width); });
  addEventListener('keydown', e => {
    const k = e.key;
    if (k === ' ') { e.preventDefault(); lecture(); }
    else if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); aller(t + (k === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 1 : 5)); }
    else if (k === '.' || k === ',') aller(t + (k === '.' ? 1 : -1) / IPS);
    else if (k === 'r' || k === 'R') { aller(boucle[0]); lecture(true); }
    else if (k === 'c' || k === 'C') barre.classList.toggle('cachee');
    else if (k === 'm' || k === 'M') { son.muet = !son.muet; if (son.gain) son.gain.gain.value = son.muet ? 0 : 1; majAide(); }
    else if (k === 'Home') aller(boucle[0]);
  });
  let calme;
  if (T0 !== null) barre.classList.add('calme');   // une image fixe (une capture) : la barre attend la souris
  addEventListener('pointermove', () => { barre.classList.remove('calme'); clearTimeout(calme); calme = setTimeout(() => joue && barre.classList.add('calme'), 2500); });
  window.film.aller = x => { lecture(false); aller(x); };
  window.film.lecture = lecture;

  afficher(T0 ?? (pl || params.has('de') ? boucle[0] : AFFICHE));
  if (T0 === null && !(pl || params.has('de'))) { t = 0; tete.style.left = '0%'; temps.textContent = `${fmt(0)} / ${fmt(DUREE)}`; etiquette.textContent = `l’affiche (${fmt(AFFICHE)})`; }
  majAide();
  window.film.pret = true;
  const pb = verifie();
  if (pb.length) console.info(`[film] à vérifier (${pb.length}) :\n- ${pb.join('\n- ')}`);
  if (T0 === null && (pl || params.has('de'))) lecture(true);
}
