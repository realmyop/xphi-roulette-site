/* ==========================================================================
   Les deux pilules, le film — texte.js : tous les mots de Phi, et la boîte

   UNE SEULE SOURCE pour les textes du film : les 34 répliques de Phi
   (SCENARIO.md, « Les répliques »), les notes du carnet, les deux
   descriptions, la réserve. tools/texte-film-pilules.cjs en tire TEXTE.md, le
   texte à dire, pour l'enregistrement de Ronan, et texte.html, la même chose
   à lire dans un navigateur (la page des maquettes y renvoie).

   Le texte est écrit POUR ÊTRE DIT : phrases courtes, orales ; chaque réplique
   reste à l'écran au moins le temps de la dire (13 caractères par seconde,
   « dite », comptée comme elle se dit : « quarante-huit »). Une fois la voix
   enregistrée, ce sont ses durées réelles qui fixent le minutage : on cale les
   plans sur la voix, pas l'inverse.

   Une réplique : { id, plan, de, a, dite, txt, jeu, cps? }
     de, a  : début et fin d'affichage dans la boîte (secondes du film) ; la fin
              est le début de la suivante, sauf les silences voulus
     txt    : le texte, balisé comme index.html ([b]bleue[/b], [r]rouge[/r]),
              \n = la coupure de ligne dans la boîte (deux lignes au plus) ;
              les espaces insécables sont posées par fr() (avant : ; ? ! % »)
     cps    : la vitesse d'écriture de cette réplique, si elle a la sienne
              (R15, la description lue : 12,6 car./s)
     jeu    : l'indication pour Ronan

   La boîte écrit AU RYTHME DE LA PAROLE (ECRITURE = 'parole', par défaut) :
   13 caractères par seconde, et le temps d'un « … » (0,3 s), comme la durée
   « dite ». Le texte, la voix estimée et les instants des mots du scénario
   (« sur “dilemmes” (13,6) ») tombent ensemble, et une chute (« C'est plus
   propre. », « presque. ») ne s'affiche pas avant d'être dite. Une réplique
   reste au moins LIRE (0,8 s) écrite : si son temps à l'écran est juste,
   elle s'écrit un peu plus vite que la voix. ECRITURE = 'jeu' (film.js :
   ?ecriture=jeu) reprend les 36 car./s d'index.html, que SCENARIO.md
   prévoyait : le texte court alors devant la voix.

   Pour les lots : ne modifiez pas ce fichier ; importez REPLIQUES, NOTES,
   CARNET, DESCRIPTIONS, plume(T) (où Phi écrit : son œil peut la suivre).
   Si une réplique ne tient pas avec l'image, dites-le : on la change ici.
   ========================================================================== */
import { fr, balise, longueur, ecrit, fenetre, eOut, seg, clamp, toile, LABO, PIX } from './commun.js';

export const CPS = 36;            // l'écriture « jeu », en caractères par seconde (index.html)
export let ECRITURE = 'parole';   // 'parole' (13 car./s et les « … ») ou 'jeu' (CPS)
export function reglerEcriture(m) { ECRITURE = m === 'jeu' ? 'jeu' : 'parole'; MES.clear(); }
export const PAROLE = 13;         // la parole estimée, en caractères par seconde
export const BOITE = Object.freeze({ ouvre: .5, ferme: 196.0, x: 80, y: 862, w: 1760, h: 178, tx: 124, ty: 930, lh: 52, largeur: 1696 });

// ================================================================ les répliques (SCENARIO.md, « Les répliques »)
export const REPLIQUES = Object.freeze([
  // ACTE I — la nuit, l'émission
  { id: 'R01', plan: 'P01', de: 0.8, a: 6.0, dite: 3.8, txt: 'Il est tard. Quelque part, quelqu’un ne dort pas.', jeu: 'bas, doux, comme pour ne pas réveiller' },
  { id: 'R02', plan: 'P02', de: 6.6, a: 9.8, dite: 2.6, txt: 'Bonjour. Je suis Phi, une machine.', jeu: 'aimable, net ; « une machine » comme une évidence' },
  { id: 'R03', plan: 'P03', de: 9.8, a: 16.2, dite: 5.9, txt: 'J’étudie votre morale.\nPas au scalpel : avec des dilemmes. C’est plus propre.', jeu: 'un temps avant « C’est plus propre », pince-sans-rire' },
  { id: 'R04', plan: 'P03', de: 16.2, a: 19.0, dite: 1.9, txt: 'Je ne juge pas : je note.', jeu: 'simple, rassurant' },
  { id: 'R05', plan: 'P04', de: 19.0, a: 26.8, dite: 6.7, txt: 'Mon hypothèse : vous choisissez selon les faits.\nComme moi. Ça devrait être vite réglé.', jeu: 'sûr de soi ; « Comme moi » à plat' },
  { id: 'R06', plan: 'P05', de: 26.8, a: 31.0, dite: 3.8, txt: 'Alors j’ai lancé un appel, sur les réseaux d’Arte.', jeu: 'simple' },
  { id: 'R07', plan: 'P06', de: 31.0, a: 35.2, dite: 3.5, txt: 'Deux pilules. Aucun piège. Enfin… presque.', jeu: '« presque » après un temps, malicieux' },
  { id: 'R08', plan: 'P06', de: 35.2, a: 40.4, dite: 4.4, txt: 'Il appuie. Il est le quarante-huitième : ce sera son nom.', jeu: 'tendre ; « ce sera son nom » plus bas' },
  // ACTE II — les règles
  { id: 'R09', plan: 'P07', de: 41.1, a: 45.4, dite: 3.7, txt: 'Une [b]bleue[/b], une [r]rouge[/r]. Chacun en avale une, seul.', jeu: 'clair, une règle du jeu' },
  { id: 'R10', plan: 'P08', de: 45.4, a: 50.4, dite: 4.3, txt: 'Si plus de la moitié prend la [b]bleue[/b] : tout le monde vit.', jeu: 'content' },
  { id: 'R11', plan: 'P08', de: 50.4, a: 56.6, dite: 5.7, txt: 'Si au moins la moitié prend la [r]rouge[/r] :\nceux qui ont pris la [b]bleue[/b] meurent.', jeu: 'grave, sans dramatiser' },
  { id: 'R12', plan: 'P08', de: 56.6, a: 61.2, dite: 3.8, txt: 'Sans pilule ? Tout le monde meurt.\nJe déconseille.', jeu: '« Je déconseille » sec, après un temps' },
  { id: 'R13', plan: 'P09', de: 61.2, a: 67.4, dite: 6.0, txt: 'Rassurez-vous : les pilules sont imaginaires.\nLes choix, eux, sont bien réels.', jeu: 'rassurant, puis complice' },
  // ACTE III — les mots, le test, le choix
  { id: 'R14', plan: 'P10', de: 67.7, a: 70.8, dite: 2.7, txt: 'Les mêmes règles, dites autrement :', jeu: 'on tourne la page' },
  { id: 'R15', plan: 'P10', de: 70.8, a: 81.2, dite: 10.0, cps: 12.6, txt: '« Si vous prenez la [r]rouge[/r], il ne vous arrive rien. Si vous prenez la [b]bleue[/b],\nvous mourez… sauf si la majorité la prend aussi. »', jeu: 'lu, posé ; un temps après « vous mourez » ; « sauf si » relâche (s’écrit au rythme de la voix, 12,6 car./s)' },
  { id: 'R16', plan: 'P10', de: 81.2, a: 87.2, dite: 5.4, txt: 'Chacun n’en lit qu’une, au hasard.\nLe numéro 48 : celle-ci.', jeu: '« celle-ci » tombe avec le cadre (dire « quarante-huit »)' },
  { id: 'R17', plan: 'P11', de: 87.2, a: 92.6, dite: 3.9, txt: 'D’abord, un test. Il se trompe,\ncomme un sur douze.', jeu: 'sans moquerie' },
  { id: 'R18', plan: 'P11', de: 92.6, a: 98.4, dite: 3.3, txt: 'On lui réexplique. Cette fois, c’est juste.', jeu: 'patient, content pour lui' },
  { id: 'R19', plan: 'P12', de: 98.8, a: 106.0, dite: 4.2, txt: 'Il relit les règles. Deux fois.\nQuatre minutes passent.', jeu: 'lent ; laisser passer le temps' },
  { id: 'R20', plan: 'P12', de: 106.0, a: 111.0, dite: 3.9, txt: 'Puis il choisit.\nJe ne regarde pas : par politesse.', jeu: '« par politesse » presque à voix basse' },
  // ACTE IV — les autres
  { id: 'R21', plan: 'P13', de: 112.2, a: 118.6, dite: 4.4, txt: 'Comme lui, plus de quatre mille personnes.\nChacune seule.', jeu: 'le vertige, doux' },
  { id: 'R22', plan: 'P14', de: 120.8, a: 126.2, dite: 3.3, txt: 'Description collective : partout, la [b]bleue[/b].', jeu: 'constat' },
  { id: 'R23', plan: 'P14', de: 126.2, a: 129.2, dite: 2.4, txt: 'Et l’autre : partout, la [r]rouge[/r].', jeu: 'constat, plus bas' },
  { id: 'R24', plan: 'P15', de: 129.2, a: 138.8, dite: 8.2, txt: 'Entre pays, quelques points d’écart. La vraie frontière\nne sépare pas deux pays : elle sépare deux phrases.', jeu: 'la phrase-clé, nette, sans emphase' },
  // ACTE V — les résultats, le N°48
  { id: 'R25', plan: 'P16', de: 139.2, a: 147.8, dite: 7.8, txt: 'Cinquante-trois points d’écart. Et pourtant, neuf sur dix\ntrouvent que les deux disent la même chose.', jeu: 'étonné' },
  { id: 'R26', plan: 'P16', de: 147.8, a: 152.2, dite: 3.1, txt: 'Ils ont raison. J’ai vérifié. Deux fois.', jeu: 'à froid' },
  { id: 'R27', plan: 'P17', de: 152.2, a: 157.0, dite: 4.0, txt: 'Et le numéro 48 ?\nJe n’avais pas regardé.', jeu: 'doux, inquiet (dire « quarante-huit »)' },
  { id: 'R28', plan: 'P17', de: 161.2, a: 162.4, dite: 0.2, txt: 'Ah.', jeu: 'tout petit, sincère, pas tragique' },
  { id: 'R29', plan: 'P18', de: 162.6, a: 165.8, dite: 2.7, txt: 'Dans l’autre salle, il aurait vécu.', jeu: 'simple' },
  { id: 'R30', plan: 'P18', de: 165.8, a: 172.0, dite: 5.2, txt: 'Même personne, même choix.\nCe qui change : ce que les autres ont lu.', jeu: 'lent, chaque membre détaché' },
  // ACTE VI — la fin
  { id: 'R31', plan: 'P19', de: 172.0, a: 178.0, dite: 4.9, txt: 'Rassurez-vous : en vrai, il a posé son téléphone.\nEt il a dormi.', jeu: 'soulagé, tendre' },
  { id: 'R32', plan: 'P20', de: 181.0, a: 185.6, dite: 4.2, txt: 'Protocole : observer sans s’attacher.\nJe note : échec.', jeu: 'administratif, puis « échec » en souriant' },
  { id: 'R33', plan: 'P21', de: 185.8, a: 192.6, dite: 5.9, txt: 'Et vous ? [b]Bleue[/b], ou [r]rouge[/r] ?\n… Ça dépend. De comment je vous l’aurais dit.', jeu: 'à vous ; un temps ; malicieux' },
  { id: 'R34', plan: 'P21', de: 193.0, a: 195.4, dite: 1.1, txt: 'Chut. Il dort.', jeu: 'chuchoté' },
].map(r => Object.freeze({ ...r, txt: fr(r.txt), jeu: fr(r.jeu) })));

// les six actes (SCENARIO.md, « Vue d'ensemble »)
export const ACTES = Object.freeze([
  { nom: 'I. La nuit, l’émission', de: 'P01', a: 'P06' },
  { nom: 'II. Les règles', de: 'P07', a: 'P09' },
  { nom: 'III. Les mots, le test, le choix', de: 'P10', a: 'P12' },
  { nom: 'IV. Les autres', de: 'P13', a: 'P15' },
  { nom: 'V. Les résultats, le N°48', de: 'P16', a: 'P18' },
  { nom: 'VI. La fin', de: 'P19', a: 'P22' },
]);

// En réserve (SCENARIO.md) : si la voix est plus rapide, ou si le film peut s'allonger
export const RESERVE = Object.freeze([
  { plan: 'P05', dite: 5.0, txt: 'Une recette. Un chat. Un autre chat.\nVous avez beaucoup de chats.' },
  { plan: 'P11', dite: 5.6, txt: 'Record : sept essais.\nÀ la fin, je doutais surtout de mes explications.' },
  { plan: 'P14', dite: 4.6, txt: 'J’avais prévu une légende à douze couleurs.\nDeux ont suffi.' },
  { plan: 'P01', dite: 3.5, txt: 'Je ne sais pas qui c’est : c’est fait exprès.' },
  { plan: 'P20', dite: 4.4, txt: 'Mon hypothèse ? Une machine ne rature pas : elle ajoute.' },
].map(r => Object.freeze({ ...r, txt: fr(r.txt) })));

// ================================================================ le carnet de Phi (gags muets : on ne les dit pas)
export const CARNET = Object.freeze({
  titre: 'CARNET DE PHI',
  protocole: fr('protocole : observer sans s’attacher'),
  hypothese: 'Les humains choisissent selon les faits.',
  commeMoi: '(comme moi)',
  ajoutHypothese: '… et selon les mots.',
  ajoutProtocole: '→ échec',
});
// les notes : n, le texte, l'instant où la plume commence à l'écrire (null : déjà écrite quand on la voit)
export const NOTES = Object.freeze([
  { n: '0001', plan: 'P03', t: 17.5, txt: fr('morale humaine : à l’étude') },
  { n: '0002', plan: 'P05', t: 29.0, txt: fr('chats : nombreux') },
  { n: '0003', plan: 'P12', t: 109.8, txt: fr('N°48 : a choisi · 4\u00a0min\u00a017\u00a0s · (pas\u00a0regardé)') },
  { n: '0004', plan: 'P20', t: null, txt: fr('écart : 52,9 points · vérifié deux fois') },
].map(Object.freeze));
// les ajouts de P20 : l'hypothèse complétée sans un mot (179,2–181,0), puis « → échec » sur « échec »
// « → échec » s'écrit quand la boîte écrit « échec » (R32), lu dans la boîte comme les gestes des lots
export const AJOUTS = Object.freeze({ hypothese: Object.freeze({ t: 179.2, cps: 21 / 1.8 }), protocole: Object.freeze({ get t() { return quandMot('R32', 'échec', 184.44); } }) });

// ================================================================ la surimpression : le cartouche, la mention
export const CARTOUCHES = Object.freeze({
  titre: Object.freeze(['XPHI', 'PHILOSOPHIE EXPÉRIMENTALE']),   // 9,4–31,0 (P02 l'y amène en glissant)
  test: Object.freeze(['TEST 01', 'LES DEUX PILULES']),          // 31,0–111,8
  resultats: Object.freeze(['TEST 01 · RÉSULTATS', 'LES DEUX PILULES']),   // 138,8–152,4 (entete() de donnees.html)
});
// la mention en bas à droite : les résultats sont ceux du questionnaire de Monsieur Phi (le script de Thibaut les présente
// comme ceux de la collecte Arte) ; seuls les chiffres par pays (la carte, P14–P15) sont inventés
export const MENTION_FICTIVES = 'prototype · chiffres du questionnaire de Monsieur Phi';
export const MENTION_PAYS = 'prototype · par pays : chiffres fictifs, à mesurer';

// ================================================================ les deux descriptions (les mêmes partout : P10, P11, P12, P15, P16, P18)
// La règle de l'obligation (« sans pilule, tout le monde meurt ») est la même dans les deux : elle n'y est pas.
export const DESCRIPTIONS = Object.freeze({
  collective: fr('Si la majorité prend la [b]bleue[/b], tout le monde vit ; si au moins la moitié prend la [r]rouge[/r], ceux qui ont pris la [b]bleue[/b] meurent.'),
  individuelle: fr('Si vous prenez la [r]rouge[/r], il ne vous arrive rien. Si vous prenez la [b]bleue[/b], vous mourez, sauf si la majorité la prend aussi.'),
});
// entre guillemets, comme dans les colonnes de donnees.html
export const cite = s => fr(`« ${s} »`);

// ================================================================ la boîte de dialogue (index.html, sans le ▼)
// La réplique affichée à l'instant T (ou null : la boîte est vide), et combien de ses caractères sont écrits
export const repliqueA = T => { for (const r of REPLIQUES) if (T >= r.de && T < r.a) return r; return null; };
// les instants (depuis r.de) où chaque caractère apparaît. À la parole : 13 car./s et 0,3 s après chaque « … », un peu
// plus vite si la réplique ne resterait pas LIRE secondes écrite (elle court alors un peu devant la voix, jamais derrière) ;
// r.cps l'emporte (R15). Au jeu : CPS.
export const LIRE = .8;
// Les nombres écrits en chiffres prennent le temps de les dire (la durée « dite » les compte en mots) : « 48 » s'écrit
// au rythme de « quarante-huit », chaque chiffre quand la voix l'a dit. Sans cela, « celle-ci » (R16) s'écrivait
// 0,85 s avant la voix, et avant le cadre du tirage qui tombe dessus.
export const DITS = Object.freeze({ '48': 'quarante-huit' });
function poids(chars) {
  const w = chars.map(() => 1), chiffre = c => c >= '0' && c <= '9';
  for (let i = 0; i < chars.length;) {
    if (!chiffre(chars[i])) { i++; continue; }
    let j = i; while (j < chars.length && chiffre(chars[j])) j++;
    const dit = DITS[chars.slice(i, j).join('')];
    if (dit) for (let k = i; k < j; k++) w[k] = [...dit].length / (j - i);
    i = j;
  }
  return w;
}
function instants(r, lignes) {
  const chars = lignes.flatMap(l => l.flatMap(s => [...s.s])), k = chars.filter(c => c === '…').length;
  const jeu = ECRITURE === 'jeu', pause = jeu ? 0 : .3, w = jeu ? chars.map(() => 1) : poids(chars);
  const n = w.reduce((a, b) => a + b, 0);
  const cps = r.cps || (jeu ? CPS : Math.max(PAROLE, n / Math.max(.5, r.a - r.de - pause * k - LIRE)));
  const out = []; let t = 0;
  chars.forEach((c, i) => { t += w[i] / cps; out.push(t); if (c === '…') t += pause; });
  return out;
}
// l'instant (secondes du film) où le premier caractère de « mot » s'écrit dans la réplique id ; defaut s'il n'y est pas
const QUAND = new Map();
export function quandMot(id, mot, defaut = null) {
  const cle = `${ECRITURE}|${id}|${mot}`;
  if (QUAND.has(cle)) return QUAND.get(cle);
  const r = REPLIQUES.find(x => x.id === id); let v = defaut;
  if (r) {
    const lignes = balise(r.txt), txt = lignes.map(l => l.map(s => s.s).join('')).join(''), i = txt.indexOf(mot);
    if (i >= 0) v = r.de + instants(r, lignes)[[...txt.slice(0, i)].length];
  }
  QUAND.set(cle, v);
  return v;
}
export const ecrits = (r, T) => {
  const m = mesure(r), u = T - r.de; let n = 0;
  while (n < m.n && m.quand[n] <= u + 1e-9) n++;
  return n;
};
// les lignes balisées et la place de chaque caractère (mesurées en DotGothic16 34 px, une fois les polices là)
let MESURE = null;
const MES = new Map();
function mesure(r) {
  let m = MES.get(r.id);
  if (!m) {
    MESURE = MESURE || toile(8, 8).getContext('2d');
    MESURE.font = `34px ${PIX}`;
    const lignes = balise(r.txt), pos = [], larg = [];
    lignes.forEach((ligne, li) => { let x = BOITE.tx; for (const s of ligne) for (const c of s.s) { x += MESURE.measureText(c).width; pos.push([x, BOITE.ty - 12 + li * BOITE.lh]); } larg.push(x - BOITE.tx); });
    m = { lignes, n: longueur(lignes), pos, larg, quand: instants(r, lignes) };
    MES.set(r.id, m);
  }
  return m;
}
// les caractères que la boîte écrit entre t0 (exclu) et t1 (inclus), { t, c, x } : pour le son (les petits bips du
// texte qui s'écrit, tools/son-pilules.cjs), image par image ; seulement ceux qu'on voit s'écrire (avant la fin de la
// réplique, la boîte ouverte)
export function ecritsEntre(t0, t1) {
  const out = [];
  for (const r of REPLIQUES) {
    if (r.a <= t0 || r.de > t1) continue;
    const m = mesure(r), chars = m.lignes.flatMap(l => l.flatMap(s => [...s.s]));
    m.quand.forEach((q, i) => {
      const t = r.de + q;
      if (t > t0 && t <= t1 && t < r.a && t >= BOITE.ouvre + .4 && t < BOITE.ferme) out.push({ t, c: chars[i], x: m.pos[i][0] });
    });
  }
  return out;
}
// l'instant où la réplique r a fini de s'écrire (secondes du film)
export const finEcrite = r => r.de + mesure(r).quand[mesure(r).n - 1];
// la plume : le dernier caractère écrit dans la boîte, pendant qu'elle écrit (Phi peut la suivre des yeux), sinon null
export function plume(T) {
  const r = repliqueA(T); if (!r) return null;
  const m = mesure(r), n = ecrits(r, T);
  if (n >= m.n || T < r.de + .1) return null;
  const [x, y] = m.pos[clamp(n, 0, m.n - 1)];
  return { x, y };
}
export function dialogue(ctx, T) {
  const B = BOITE;
  if (T < B.ouvre) return;
  const o = eOut(seg(T, B.ouvre, B.ouvre + .4)) * (1 - eOut(seg(T, B.ferme, B.ferme + .4)));
  if (o <= 0) return;
  const hh = B.h * o;
  fenetre(ctx, B.x, B.y + (B.h - hh) / 2, B.w, hh, 1);
  if (o < 1) { ctx.globalAlpha = 1; return; }
  fenetre(ctx, 112, 838, 132, 44, 1);
  ctx.globalAlpha = 1; ctx.fillStyle = LABO; ctx.font = `26px ${PIX}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('XPHI', 178, 861);
  const r = repliqueA(T); if (!r) return;
  ctx.font = `34px ${PIX}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ecrit(ctx, mesure(r).lignes, B.tx, B.ty, B.lh, ecrits(r, T));
}
// pour les essais : les lignes trop larges pour la boîte (DotGothic16 34 px, 1 696 px), et plus de deux lignes
export function verifieRepliques() {
  const pb = [];
  for (const r of REPLIQUES) {
    const m = mesure(r);
    if (m.lignes.length > 2) pb.push(`${r.id} : ${m.lignes.length} lignes`);
    m.larg.forEach((w, i) => { if (w > BOITE.largeur) pb.push(`${r.id}, ligne ${i + 1} : ${Math.round(w)} px pour ${BOITE.largeur}`); });
    const ecrit = m.quand[m.n - 1];
    if (r.de + ecrit > r.a) pb.push(`${r.id} : écrite en ${ecrit.toFixed(1)} s pour ${(r.a - r.de).toFixed(1)} à l'écran`);
  }
  return pb;
}
export const largeurs = () => REPLIQUES.map(r => ({ id: r.id, larg: mesure(r).larg.map(Math.round) }));
// après le chargement des polices : les mesures faites avant sont fausses
export function prepareTextes() { MES.clear(); }
