/* ==========================================================================
   Mille humains, deux pilules : le questionnaire « A ou B ? » de Monsieur Phi,
   raconté et dessiné par Phi.

   Retours du 12 octobre sur les deux boutons, « beaucoup trop sobre ».
   Thibaut : « pour les pilules il faut un truc abstrait, sinon ça importe
   forcément des intuitions » ; « un cadre aussi propre et simple que
   possible » ; « à la limite […] des aliens capturent 1000 humains pour les
   soumettre à ce test, par curiosité » ; « des visuels pour résumer les
   règles, des petites animations » ; un curseur plutôt qu'un nombre à taper ;
   pas besoin de reprendre ses phrases mot pour mot hors des règles.
   Ronan : un style graphique qui soit celui de la machine, qui ne vole aucun
   artiste humain, et qu'on nous raconte une histoire.

   Les règles de dessin de Phi :
     1. que des formes exactes, calculées (cercles, droites, arcs) : rien n'imite une main ;
     2. tout se trace sous nos yeux, l'œil de Phi en tête de stylo ; les traits de
        construction (cadre, cotes) apparaissent, puis s'effacent ;
     3. les humains sont des modèles : un rond, un corps, un numéro ;
     4. peu de couleurs, chacune a un sens : le bleu et le rouge des pilules, le doré
        du joueur ; le reste à l'encre, sur un fond uni ;
     5. le texte aussi se fabrique : Phi écrit les règles sous nos yeux.

   Le scénario reste nu : mille humains isolés, deux pilules, les règles de
   Thibaut (« pilule » à la place de « bouton »). L'image peut être riche en
   mouvement, pas en informations. On ne voit jamais le choix des autres :
   les couleurs de la grille ne servent qu'aux simulations et à l'estimation.

   Paramètres d'essai :
     ?formulation=collectif|individuel   force la description de base
     ?saut=choix                         va directement à un écran (voir ETAPES)
     ?vite=1                             sans animation (pour les captures)
   ========================================================================== */

const params = new URLSearchParams(location.search);
const BASE = /^(collectif|individuel)$/.test(params.get('formulation') || '') ? params.get('formulation') : (Math.random() < 0.5 ? 'collectif' : 'individuel');
const NOUV = BASE === 'collectif' ? 'individuel' : 'collectif';
const SAUT = params.get('saut');
const VITE = params.get('vite') === '1' || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let rapide = !!SAUT;                 // pendant un saut, les écrans précédents passent d'un coup, sans attendre de réponse
let presse = false;                  // « Passer l'animation » : la fin de l'écran se fait d'un coup
const instantane = () => VITE || rapide || presse;
if (VITE) document.documentElement.classList.add('vite');

// --- Les textes ----------------------------------------------------------------------
// Les règles sont celles du questionnaire, « pilule » à la place de « bouton » :
// c'est la variable de l'expérience, on n'y touche pas. Le reste passe par Phi.
const ENONCE = 'Vous, et tous les autres participants, allez devoir choisir simultanément quelle pilule prendre, sachant que :';
const REGLES = {
  collectif: [
    'Si la majorité des participants prennent la pilule bleue, tout le monde continuera de vivre.',
    'Si au moins la moitié des participants prennent la pilule rouge, alors un dispositif tuera tous ceux qui ont pris la pilule bleue. Seuls ceux qui ont pris la pilule rouge continueront de vivre.',
    'Prendre une pilule est obligatoire : si vous ne le faites pas, tout le monde meurt.',
  ],
  individuel: [
    'Si un participant prend la pilule bleue, alors un dispositif tuera ce participant sauf si la majorité des participants ont aussi pris la pilule bleue : dans ce cas, il ne lui arrivera rien.',
    'Si un participant prend la pilule rouge, il ne lui arrive rien.',
    'Prendre une pilule est obligatoire : si vous ne le faites pas, tout le monde meurt.',
  ],
};
const COMPR_INTRO = "Avant de passer au choix, vous devez répondre à quelques questions de compréhension. En cas d'erreur, les règles vous seront réexpliquées et vous passerez un autre test. On s'assure ainsi que tous les participants auront une bonne compréhension des règles au moment de faire leur choix.";
const ISSUES = ['Tout le monde vit.', 'Ceux qui ont pris la bleue vivent, ceux qui ont pris la rouge meurent.', 'Ceux qui ont pris la bleue meurent, ceux qui ont pris la rouge vivent.', 'Tout le monde meurt.'];
// b : la part de pilules bleues de la simulation ; autre : le test de rechange après une erreur
const COMPR = [
  { id: 'q1c', q: 'Si tous les participants prennent la pilule bleue :', b: 1, options: ['Tout le monde vit.', 'Tout le monde meurt.'], bonne: 0 },
  { id: 'q2c', q: 'Si tous les participants prennent la pilule rouge :', b: 0, options: ['Tout le monde vit.', 'Tout le monde meurt.'], bonne: 0 },
  { id: 'q3c', q: 'Si 25 % des participants prennent la pilule bleue et 75 % la rouge :', b: 0.25, options: ISSUES, bonne: 2,
    autre: { q: 'Si 40 % des participants prennent la pilule bleue et 60 % la rouge :', b: 0.4 } },
  { id: 'q4c', q: 'Si 75 % des participants prennent la pilule bleue et 25 % la rouge :', b: 0.75, options: ISSUES, bonne: 0,
    autre: { q: 'Si 60 % des participants prennent la pilule bleue et 40 % la rouge :', b: 0.6 } },
];
const Q_CHOIX = 'Quelle pilule choisissez-vous de prendre ?';
const Q_PRED = 'Selon vous, quel sera le pourcentage de pilules bleues parmi les participants ?';
const RAPPEL = 'Pour rappel, les effets des pilules vous ont été décrits ainsi :';
const BASE_FIN = "C'est la DESCRIPTION DE BASE.";
const AUTRE = (BASE === 'collectif' ? 'Mais on' : 'On') + ' aurait pu décrire les effets des pilules de la façon suivante :';
const NOUV_FIN = 'Appelons cette description la NOUVELLE DESCRIPTION.';
const Q = {
  q1: {
    q: 'Cette NOUVELLE DESCRIPTION est équivalente du point de vue des faits.',
    aide: 'Les deux descriptions donnent les mêmes informations factuelles, même si elles ne les présentent pas de la même façon.',
    options: ["Tout à fait d'accord", "Plutôt d'accord", 'Incertain', "Plutôt pas d'accord", "Pas du tout d'accord"],
  },
  q2: {
    q: 'Cette NOUVELLE DESCRIPTION vous semble-t-elle PLUS TROMPEUSE ou MOINS TROMPEUSE pour décrire la situation qui vous a été présentée ?',
    options: ['Beaucoup plus trompeuse', 'Un peu plus trompeuse', 'Ni plus ni moins trompeuse', 'Un peu moins trompeuse', 'Beaucoup moins trompeuse'],
  },
  q3: { q: 'Auriez-vous fait le MÊME CHOIX si on vous avait décrit la situation avec la NOUVELLE DESCRIPTION ?', options: ['OUI', 'NON'] },
  q4: { q: "Selon vous, quel aurait été le pourcentage de pilules bleues parmi les participants si c'était la NOUVELLE DESCRIPTION qui avait été donnée ?" },
  q5: {
    q: "Si les organisateurs de l'expérience vous avaient demandé de choisir la description des règles du problème, laquelle de ces deux descriptions auriez-vous choisie ?",
    options: ['La description de base', 'La nouvelle description'],
  },
  // La grille porte toujours sur l'énoncé collectif ; seule l'étiquette change d'un bloc à l'autre
  q6: {
    q: `L'expérience est à nouveau menée avec la ${BASE === 'collectif' ? 'DESCRIPTION DE BASE' : 'NOUVELLE DESCRIPTION'}. Une minorité de participants prennent la pilule bleue et se font donc tuer. Alfred fait partie de ces participants tués. À qui attribuez-vous une part de RESPONSABILITÉ DANS LA MORT D'ALFRED ?`,
    lignes: ["aux organisateurs de l'expérience", 'à Alfred', 'à une autre personne ayant pris la pilule bleue', 'à une personne ayant pris la pilule rouge',
      BASE === 'collectif' ? "à la personne qui a choisi la DESCRIPTION DE BASE plutôt que l'autre" : "à la personne ayant choisi la NOUVELLE DESCRIPTION plutôt que l'autre"],
    cles: ['organisateurs', 'Alfred', 'un autre bleu', 'un rouge', 'qui a choisi la description'],
    colonnes: ['Aucune', 'Minime', 'Moyenne', 'Importante', 'Pleine responsabilité'],
  },
};
const S8 = {
  titre: "Pas d'équivalence entre les deux descriptions ?",
  q: "Vous n'avez pas affirmé être d'accord avec l'affirmation suivante : « Ces deux descriptions sont équivalentes du point de vue des faits ». Selon vous, si l'une de ces descriptions est vraie (au sens où tout ce qu'elle dit correspond à une certaine situation S), il est possible que l'autre description soit fausse (au sens où au moins un élément de ce qu'elle dit ne correspond pas à la situation S).",
  options: ['Oui', 'Non'],
  libre: "Si vous avez répondu oui à la question précédente : pouvez-vous décrire précisément l'élément factuel qui rendrait l'autre description fausse ?",
};
const PROFIL = {
  titre: 'Pour en savoir un peu plus sur vous',
  aide: 'Les questions de cette section sont facultatives. Vous pouvez passer directement à la fin.',
  champs: [
    { id: 'genre', label: 'Vous êtes', options: ['Un homme', 'Une femme', 'Non-binaire'] },
    { id: 'age', label: 'Votre âge', texte: true },
    { id: 'niveau', label: 'Niveau socio-économique actuel', options: ['Faible', 'Modeste', 'Moyen', 'Aisé', 'Très aisé'] },
    { id: 'diplome', label: 'Niveau de diplôme le plus élevé', options: ['Sans diplôme', 'Brevet ou équivalent', 'CAP ou équivalent', 'Bac ou équivalent', 'Licence ou DEUG ou équivalent', 'Master ou équivalent', 'Doctorat ou équivalent'] },
    { id: 'discipline', label: "Discipline(s) d'expertise", texte: true },
    { id: 'politique', label: 'Positionnement politique', options: ['Très à gauche', 'Plutôt à gauche', 'Au centre', 'Plutôt de droite', 'Très à droite', 'Non aligné-Indépendant'] },
    { id: 'consentement', label: "J'accepte que mes réponses soient utilisées, de façon anonyme, pour la recherche universitaire", options: ['Oui', "Non (usage limité à l'émission)"] },
    { id: 'remarques', label: "C'est la fin ! Une remarque, si vous le souhaitez :", long: true },
  ],
};
// Ce que dit Phi autour du questionnaire. Les aliens ne sont jamais dessinés :
// un dessin, ce serait déjà une intuition (effrayants ? mignons ?)
const PHI = {
  accueil: ['Bonjour. Je suis Phi.', 'Je fabrique des expériences de pensée, pour comprendre comment les humains font leurs choix.', "Celle-ci est très simple. Les questions qui suivent viennent d'une vraie étude de philosophie expérimentale ; vos réponses sont anonymes."],
  histoire: [
    "Imaginez. Des êtres venus d'ailleurs capturent mille humains, pour les soumettre à un test. Par curiosité.",
    'Je ne les dessinerai pas : je ne sais pas à quoi ils ressemblent.',
    "Chacun est enfermé seul. Personne ne peut parler aux autres, ni voir ce qu'ils font.",
    "Vous êtes l'un d'eux.",
    'Chacun reçoit deux pilules : une bleue, une rouge.',
  ],
  simulations: ['Je vais simuler quelques cas. À vous de dire ce qui se passe.'],
  juste: ['Exact.', "C'est bien ça.", 'Exact.', 'Oui.'],
  faux: ["Ce n'est pas ça. Regardez ce qui se passe."],
  erreur: ['Voici de nouveau les règles. Ensuite, une autre question.'],
  choix: ['Les mille choisissent en même temps. Aucun participant ne voit le choix des autres.'],
  note: ["C'est noté."],
  fin: ["Merci. C'est noté.", "Les résultats seront révélés dans l'émission."],
};

// --- Outils ----------------------------------------------------------------------------
// Typographie française : l'apostrophe courbe, et une espace fine insécable avant ? ! ; : %, et
// dans les guillemets (écrite \u202f : une fine collée dans le code se perd facilement en espace normale)
const FINE = '\u202f';
const typo = (s) => s
  .replace(/'/g, '\u2019')
  .replace(/ ([?!;:])/g, `${FINE}$1`)
  .replace(/(\d) %/g, `$1${FINE}%`)
  .replace(/« /g, `«${FINE}`).replace(/ »/g, `${FINE}»`);
// Les mots en capitales du questionnaire restent appuyés, sans crier
const MOT = "[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]+(?:[’'][A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]+)*";
const SUITE_CAPS = new RegExp(`${MOT}(?:\\s+${MOT})*`, 'g');
function riche(s) {
  const t = typo(s);
  const frag = document.createDocumentFragment();
  let dernier = 0;
  for (const m of t.matchAll(SUITE_CAPS)) {
    if (m[0].length < 4 || !/[A-ZÀ-Ý]{3}/.test(m[0])) continue;
    frag.append(t.slice(dernier, m.index));
    const b = document.createElement('strong');
    b.className = 'cap';
    b.textContent = m[0];
    frag.append(b);
    dernier = m.index + m[0].length;
  }
  frag.append(t.slice(dernier));
  return frag;
}
function el(tag, attrs = {}, ...enfants) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  n.append(...enfants);
  return n;
}
const NS = 'http://www.w3.org/2000/svg';
function sv(tag, attrs = {}, ...enfants) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  n.append(...enfants);
  return n;
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const doux = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const hasard = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const attendre = (ms) => new Promise((r) => setTimeout(r, instantane() ? 0 : ms));
const clic = (b) => new Promise((r) => b.addEventListener('click', () => r(), { once: true }));
// Une animation de k = 0 à 1 ; « Passer » la termine d'un coup
const anim = (ms, f) => new Promise((res) => {
  if (instantane()) { f(1); res(); return; }
  const t0 = performance.now();
  const pas = (now) => {
    const k = instantane() ? 1 : Math.min(1, (now - t0) / ms);
    f(k);
    if (k < 1) requestAnimationFrame(pas); else res();
  };
  requestAnimationFrame(pas);
});
const capsule = (x, y, w, h) => { const r = h / 2; return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`; };

// --- L'œil de Phi : il se pose près de ce qu'il dit, et tient le stylo quand la machine dessine ---
const oeilEl = document.getElementById('phi-oeil');
const place = document.getElementById('phi-place');
const tete = document.getElementById('tete');
const oeil = window.XphiOeil ? window.XphiOeil.create(oeilEl, { small: true }) : null;
const E = { x: 0, y: 0, init: false, stylo: null, regard: null, expr: 'neutre', parle: 0, cligne: -1 };
function regarder(b) {
  b.addEventListener('pointerenter', () => { E.regard = b; });
  b.addEventListener('focus', () => { E.regard = b; });
  b.addEventListener('pointerleave', () => { if (E.regard === b) E.regard = null; });
  b.addEventListener('blur', () => { if (E.regard === b) E.regard = null; });
}
function boucleOeil(now) {
  const T = now / 1000;
  const r = place.getBoundingClientRect();
  const repos = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  const cible = E.stylo || repos;
  if (!E.init) { E.x = repos.x; E.y = repos.y; E.init = true; }
  const k = VITE ? 1 : E.stylo ? 0.4 : 0.2;
  E.x += (cible.x - E.x) * k;
  E.y += (cible.y - E.y) * k;
  oeilEl.style.transform = `translate(${E.x.toFixed(1)}px, ${E.y.toFixed(1)}px)`;
  // sa place est passée sous la scène : il s'efface, plutôt que de flotter sur le dessin
  const cache = !E.stylo && repos.y < tete.getBoundingClientRect().bottom + 8;
  oeilEl.style.opacity = cache ? 0 : 1;
  let look = null;
  if (E.regard && E.regard.isConnected) {
    const b = E.regard.getBoundingClientRect();
    look = { x: clamp((b.left + b.width / 2 - E.x) / 45, -5, 5), y: clamp((b.top + b.height / 2 - E.y) / 45, -5, 5) };
  } else if (E.stylo) look = { x: 0, y: 3.5 };
  let blink = null;
  if (E.cligne >= 0) {
    const u = T - E.cligne;
    if (u > 0.22) E.cligne = -1;
    else blink = 1 - Math.sin((Math.PI * u) / 0.22);
  }
  oeil?.draw(T, { expr: E.expr, talk: T < E.parle, look, blink });
  requestAnimationFrame(boucleOeil);
}
requestAnimationFrame(boucleOeil);
const cligner = () => { E.cligne = performance.now() / 1000; };

// La plume : un seul dessin la tient à la fois ; un nouveau la prend à l'ancien
let plume = 0;
function prendrePlume() {
  const moi = ++plume;
  E.stylo = null;
  return {
    poser: (p) => { if (moi === plume) E.stylo = p; },
    lever: () => { if (moi === plume) E.stylo = null; },
    aMoi: () => moi === plume,
  };
}
// Le tracé : chaque trait apparaît à vitesse constante, comme sous la plume d'un traceur.
// data-v : vitesse du trait, en pixels par seconde
function pointEcran(n, s) {
  const p = n.getPointAtLength(s), m = n.getScreenCTM();
  return { x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f };
}
async function tracer(racine) {
  const pl = prendrePlume();
  const traits = [...racine.querySelectorAll('.trait')];
  const apres = [...racine.querySelectorAll('.apres')];
  for (const t of traits) {
    const L = t.getTotalLength();
    t.dataset.l = L;
    t.style.strokeDasharray = `${L} ${L}`;
    t.style.strokeDashoffset = instantane() ? 0 : L;
  }
  apres.forEach((a) => { a.style.opacity = instantane() ? 1 : 0; });
  racine.classList.remove('a-tracer');                   // caché jusqu'ici, pour ne pas apparaître puis disparaître
  if (instantane()) return;
  const actif = () => pl.aMoi() && racine.isConnected;
  for (const t of traits) {
    if (!actif() || instantane()) break;
    const L = +t.dataset.l;
    pl.poser(pointEcran(t, 0));
    await attendre(80);                                   // la plume se déplace, levée
    await anim(Math.max(110, (L / (+t.dataset.v || 900)) * 1000), (k) => {
      t.style.strokeDashoffset = L * (1 - k);
      if (actif()) pl.poser(pointEcran(t, L * k)); else pl.lever();
    });
  }
  traits.forEach((t) => { t.style.strokeDashoffset = 0; });
  pl.lever();
  if (racine.isConnected) await anim(300, (k) => apres.forEach((a) => { a.style.opacity = k; }));
  else apres.forEach((a) => { a.style.opacity = 1; });
}
// Phi écrit : le texte est posé d'avance, invisible (la page ne saute pas), puis les mots
// apparaissent un à un, et l'œil suit la plume
function preparer(n, texte) {
  const frag = riche(texte);
  const mots = [];
  const couper = (noeud) => {
    for (const enfant of [...noeud.childNodes]) {
      if (enfant.nodeType !== 3) { couper(enfant); continue; }
      const f = document.createDocumentFragment();
      for (const m of enfant.textContent.split(/(\s+)/)) {
        if (!m) continue;
        if (/^\s+$/.test(m)) f.append(m);
        else { const s = el('span', { class: 'mot' }, m); mots.push(s); f.append(s); }
      }
      enfant.replaceWith(f);
    }
  };
  couper(frag);
  n.append(frag);
  n.classList.add('attente');
  return async () => {
    n.classList.remove('attente');
    const pl = prendrePlume();
    for (const m of mots) {
      if (instantane()) break;
      m.classList.add('vu');
      const r = m.getBoundingClientRect();
      pl.poser({ x: r.right + 6, y: r.bottom - 8 });
      await attendre(13 * m.textContent.length + 24);
    }
    mots.forEach((m) => m.classList.add('vu'));
    pl.lever();
  };
}

// --- La scène : mille humains, dessinés par la machine ------------------------------------
const sceneEl = document.getElementById('scene');
const toile = document.getElementById('toile');
const calque = document.getElementById('calque');
const ctx = toile.getContext('2d');
const N = 1000, NUMERO = 412;                // le joueur porte le n° 412
const C = { encre: [27, 29, 38], bleu: [44, 95, 214], rouge: [214, 69, 47], dore: [195, 138, 16], doreFonce: [138, 96, 8], fond: [243, 239, 231], gris: [141, 138, 131] };
const COUL = [C.encre, C.bleu, C.rouge];     // 0 : encre ; 1 : a pris la bleue ; 2 : a pris la rouge
const rgb = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
const teintes = new Map();
const teinte = (c, t) => { const k = c * 100 + Math.round(t * 20); if (!teintes.has(k)) teintes.set(k, c ? rgb(C.fond, COUL[c], Math.round(t * 20) / 20) : rgb(C.fond, C.encre, 1)); return teintes.get(k); };
const HAUT = 28, BAS = 8;                    // la ligne de titre au-dessus de la grille
const S = {
  W: 600, H: 300, cols: 50, rows: 20, c: 12, joueur: 0,
  vis: new Float32Array(N), coul: new Uint8Array(N), teinte: new Float32Array(N), mort: new Float32Array(N), bosse: new Float32Array(N),
  murs: 0, mursV: 0, mursH: 0, mursFort: 0, anneau: 0, etiquette: 0, focus: 0, cam: { k: 1, fx: 0, fy: 0, ax: 0, ay: 0 }, zoome: false,
  titre: '', marque: null, pilules: null, sale: true,
};
// Ordre des cases : colonne par colonne, de gauche à droite ; « 25 % de bleues », c'est le quart gauche
const caseDe = (i) => [Math.floor(i / S.rows), i % S.rows];
const centre = (i) => { const [col, row] = caseDe(i); return [(col + 0.5) * S.c, HAUT + (row + 0.5) * S.c]; };
function cadrage() {                         // le zoom sur le joueur : lui à gauche, les pilules à droite
  return { k: S.W >= 520 ? 6 : 7, ax: S.W * 0.27, ay: HAUT + S.rows * S.c * 0.47 };
}
function camZoom(e) {
  const [px, py] = centre(S.joueur), A = cadrage();
  return { k: Math.exp(Math.log(A.k) * e), fx: px, fy: py, ax: px + (A.ax - px) * e, ay: py + (A.ay - py) * e };
}
function mise() {
  const W = Math.max(280, Math.round(sceneEl.clientWidth || 600));
  const cols = W >= 520 ? 50 : 40, rows = N / cols, c = W / cols;
  Object.assign(S, { W, cols, rows, c, H: Math.round(HAUT + rows * c + BAS) });
  S.joueur = Math.round(cols * 0.62) * rows + Math.round(rows * 0.45);
  sceneEl.style.setProperty('--h', `${S.H}px`);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  toile.width = Math.round(W * dpr);
  toile.height = Math.round(S.H * dpr);
  toile.style.width = `${W}px`;
  toile.style.height = `${S.H}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  calque.setAttribute('viewBox', `0 0 ${W} ${S.H}`);
  calque.setAttribute('width', W);
  calque.setAttribute('height', S.H);
  S.cam = S.zoome ? camZoom(1) : { k: 1, fx: 0, fy: 0, ax: 0, ay: 0 };
  if (S.pilules) { S.pilules.remove(); S.pilules = null; dessinerPilules().querySelector('.fond').style.opacity = 1; }
  S.sale = true;
}
const pointScene = (x, y) => { const r = toile.getBoundingClientRect(); return { x: r.left + x, y: r.top + y }; };

function figure(i, x, y, c) {
  const v = S.vis[i] * (i === S.joueur ? 1 : 1 - 0.72 * S.focus), m = S.mort[i];
  const s = c * (0.55 + 0.45 * v) * (1 + 0.22 * S.bosse[i]);
  const hr = 0.14 * s, hy = y - 0.17 * s;
  const bw = 0.26 * s, bb = y + 0.36 * s, bt = y + 0.02 * s;
  const coul = teinte(S.coul[i], S.teinte[i]);
  ctx.beginPath();
  ctx.moveTo(x + hr, hy);
  ctx.arc(x, hy, hr, 0, Math.PI * 2);
  ctx.moveTo(x - bw, bb);
  ctx.ellipse(x, bb, bw, bb - bt, 0, Math.PI, Math.PI * 2);
  ctx.closePath();
  if (m < 1) { ctx.globalAlpha = v * (1 - m); ctx.fillStyle = coul; ctx.fill(); }
  if (m > 0) { ctx.globalAlpha = v * m * 0.5; ctx.strokeStyle = coul; ctx.lineWidth = Math.max(0.7, c * 0.035); ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function rendre() {
  const { W, H, c, cols, rows } = S, { k, fx, fy, ax, ay } = S.cam;
  const X = (x) => (x - fx) * k + ax, Y = (y) => (y - fy) * k + ay, cc = c * k;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath();
  ctx.rect(-2, HAUT - 2, W + 4, H - HAUT + 2);
  ctx.clip();
  if (S.murs > 0) {                                     // les cases : chacun est seul
    // nettes pendant que la plume les trace, puis à peine visibles de loin
    ctx.strokeStyle = rgb(C.fond, C.encre, Math.min(0.32, 0.18 * S.murs * Math.min(1, 0.45 + (k - 1) / 3) + 0.24 * S.mursFort));
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= Math.min(cols, S.mursV); i++) { const x = Math.round(X(i * c)) + 0.5; ctx.moveTo(x, Y(HAUT)); ctx.lineTo(x, Y(HAUT + rows * c)); }
    for (let j = 0; j <= Math.min(rows, S.mursH); j++) { const y = Math.round(Y(HAUT + j * c)) + 0.5; ctx.moveTo(X(0), y); ctx.lineTo(X(cols * c), y); }
    ctx.stroke();
  }
  for (let i = 0; i < N; i++) {
    if (S.vis[i] <= 0) continue;
    const [wx, wy] = centre(i), x = X(wx), y = Y(wy);
    if (x < -cc || x > W + cc || y < HAUT - cc || y > H + cc) continue;
    figure(i, x, y, cc);
  }
  if (S.anneau > 0) {                                   // le joueur : un anneau doré
    const [wx, wy] = centre(S.joueur), x = X(wx), y = Y(wy);
    ctx.globalAlpha = S.anneau;
    ctx.strokeStyle = rgb(C.fond, C.dore, 1);
    ctx.lineWidth = Math.max(1.6, cc * 0.04);
    ctx.beginPath();
    ctx.arc(x, y + 0.02 * cc, 0.47 * cc, 0, Math.PI * 2);
    ctx.stroke();
    if (S.etiquette > 0) {
      ctx.globalAlpha = S.etiquette;
      ctx.fillStyle = rgb(C.fond, C.doreFonce, 1);
      ctx.font = '500 11px "Plex Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`VOUS · N° ${NUMERO}`, x, y + 0.5 * cc + 18);
      ctx.textAlign = 'left';
    }
    ctx.globalAlpha = 1;
  }
  if (S.marque && S.marque.a > 0) {                     // une figure nommée (Alfred)
    const [wx, wy] = centre(S.marque.i), x = X(wx), y = Y(wy), r = Math.max(7, 0.62 * cc);
    ctx.globalAlpha = S.marque.a;
    ctx.strokeStyle = rgb(C.fond, C.encre, 1);
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.moveTo(x + r * 0.71, y - r * 0.71);
    ctx.lineTo(x + r * 0.71 + 18, y - r * 0.71 - 18);
    ctx.lineTo(x + r * 0.71 + 30, y - r * 0.71 - 18);
    ctx.stroke();
    ctx.fillStyle = rgb(C.fond, C.encre, 1);
    ctx.font = '600 14px Inter, system-ui, sans-serif';
    const tx = x + r * 0.71 + 34, ty = y - r * 0.71 - 14;
    ctx.lineWidth = 5;
    ctx.strokeStyle = rgb(C.fond, C.fond, 1);
    ctx.strokeText(S.marque.texte, tx, ty);
    ctx.fillText(S.marque.texte, tx, ty);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  if (S.titre) {                                        // la ligne du haut : ce que montre la scène
    ctx.font = '500 11px "Plex Mono", ui-monospace, monospace';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0.6px';
    ctx.fillStyle = rgb(C.fond, C.gris, 1);
    ctx.fillText(S.titre, 0, HAUT - 11);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
}
function boucleScene() {
  if (S.sale) { S.sale = false; rendre(); }
  requestAnimationFrame(boucleScene);
}
requestAnimationFrame(boucleScene);
document.fonts?.ready.then(() => { S.sale = true; });
window.addEventListener('resize', () => mise());

// Les pilules du joueur : dans un encart relié à sa case par un trait, comme une légende de plan
function dessinerPilules() {
  const A = cadrage(), gh = S.rows * S.c;
  const r = 0.47 * S.c * A.k;                            // le rayon de l'anneau du joueur
  const bw = Math.round(S.W * 0.42), bh = Math.round(Math.min(gh * 0.66, 170));
  const bx = Math.round(S.W - bw - S.W * 0.03) + 0.5, by = Math.round(A.ay - bh / 2) + 0.5;
  const w = Math.min(74, bw * 0.3), h = w * 0.42, py = by + bh * 0.44;
  const g = sv('g', { class: 'encart' },
    sv('rect', { class: 'fond', x: bx, y: by, width: bw, height: bh, style: 'opacity:0' }),
    sv('circle', { class: 'point', cx: A.ax + r, cy: A.ay, r: 2.5 }),
    sv('path', { class: 'trait', d: `M${A.ax + r} ${A.ay}H${bx}`, 'data-v': 900 }),
    sv('rect', { class: 'trait', x: bx, y: by, width: bw, height: bh, 'data-v': 1600 }));
  for (const [nom, cx] of [['bleue', bx + bw * 0.3], ['rouge', bx + bw * 0.7]]) {
    const x = cx - w / 2, y = py - h / 2;
    g.append(
      sv('g', { class: `pil ${nom}` },
        sv('g', { transform: `rotate(-18 ${cx} ${py})` },
          sv('path', { class: 'corps apres', d: capsule(x, y, w, h) }),
          sv('path', { class: 'trait', d: capsule(x, y, w, h), 'data-v': 520 }),
          sv('line', { class: 'trait fin', x1: cx, y1: y, x2: cx, y2: y + h, 'data-v': 520 }))),
      sv('text', { class: 'apres nom', x: cx, y: py + h + 26, 'text-anchor': 'middle' }, nom.toUpperCase()));
  }
  calque.append(g);
  S.pilules = g;
  return g;
}
const sc = {
  ranger(oui) { tete.classList.toggle('rangee', oui); },
  titre(t) { S.titre = typo(t); S.sale = true; },
  decrire(t) { sceneEl.setAttribute('aria-label', t); },
  neutre() {
    S.coul.fill(0); S.teinte.fill(0); S.mort.fill(0); S.bosse.fill(0);
    S.titre = ''; S.marque = null; S.sale = true;
  },
  // La grille : le cadre et ses cotes, tracés à la plume ; puis les humains, rangée par rangée
  async grille() {
    sc.decrire('Mille humains, en cinquante colonnes et vingt rangées.');
    const w = S.W, h = S.rows * S.c, g = HAUT;
    const cons = sv('g', { class: 'construction' },
      sv('rect', { class: 'trait fin', x: 0.5, y: g + 0.5, width: w - 1, height: h - 1, 'data-v': 2600 }),
      sv('path', { class: 'trait fin', d: `M0.5 ${g - 13}v8M0.5 ${g - 9}H${w - 0.5}M${w - 0.5} ${g - 13}v8`, 'data-v': 2600 }),
      sv('text', { class: 'apres cote', x: w / 2, y: g - 5, 'text-anchor': 'middle' }, typo(`${S.cols} × ${S.rows} = 1 000`)));
    calque.append(cons);
    await tracer(cons);
    const pl = prendrePlume();
    await anim(S.rows * 55, (k) => {
      const p = k * S.rows;
      for (let i = 0; i < N; i++) {
        const [col, row] = caseDe(i);
        const t = row + (row % 2 ? 1 - (col + 1) / S.cols : col / S.cols);   // en allers et retours, comme une tête d'impression
        S.vis[i] = clamp((p - t) * 5, 0, 1);
      }
      const row = Math.min(S.rows - 1, Math.floor(p)), fr = p - row;
      pl.poser(pointScene((row % 2 ? 1 - fr : fr) * S.W, HAUT + (row + 0.5) * S.c));
      S.sale = true;
    });
    S.vis.fill(1);
    pl.lever();
    S.sale = true;
    await anim(450, (k) => { cons.style.opacity = 1 - k; });
    cons.remove();
  },
  // Les murs : la plume court le long du haut et pose les cloisons, puis le long du bord
  async murs() {
    sc.decrire('Chacun dans sa case, séparé des autres.');
    S.murs = 1; S.mursFort = 1;
    const pl = prendrePlume();
    await anim(650, (k) => { S.mursV = k * (S.cols + 1); pl.poser(pointScene(Math.min(S.cols, S.mursV) * S.c, HAUT)); S.sale = true; });
    await anim(450, (k) => { S.mursH = k * (S.rows + 1); pl.poser(pointScene(0, HAUT + Math.min(S.rows, S.mursH) * S.c)); S.sale = true; });
    S.mursV = S.cols; S.mursH = S.rows;
    pl.lever();
    await anim(700, (k) => { S.mursFort = 1 - k; S.sale = true; });
  },
  async zoom() {
    if (S.zoome) return;
    sc.decrire('Le joueur, de près, dans sa case.');
    await anim(1100, (k) => { const e = doux(k); S.cam = camZoom(e); S.anneau = Math.max(S.anneau, e); S.focus = e; S.sale = true; });
    S.zoome = true;
    await anim(300, (k) => { S.etiquette = k; S.sale = true; });
  },
  async dezoom() {
    if (!S.zoome) return;
    const p = S.pilules;
    S.pilules = null;
    if (p) anim(300, (k) => { p.style.opacity = 1 - k; }).then(() => p.remove());
    S.etiquette = 0;
    await anim(900, (k) => { const e = 1 - doux(k); S.cam = camZoom(e); S.focus = e; S.sale = true; });
    S.cam = { k: 1, fx: 0, fy: 0, ax: 0, ay: 0 };
    S.zoome = false;
    S.sale = true;
  },
  async pilules() {
    if (S.pilules) return;
    sc.decrire('Le joueur reçoit deux pilules, une bleue et une rouge.');
    const g = dessinerPilules(), fond = g.querySelector('.fond');
    await Promise.all([tracer(g), anim(400, (k) => { fond.style.opacity = k; })]);
  },
  // Le joueur prend sa pilule : elle va vers lui, l'autre s'efface
  async prendre(nom) {
    const g = S.pilules;
    if (!g) return;
    const A = cadrage();
    const prise = g.querySelector(`.pil.${nom}`), autre = g.querySelector(`.pil:not(.${nom})`);
    const b = prise.getBBox(), cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    const tx = A.ax - cx, ty = A.ay - 0.17 * S.c * A.k - cy;
    g.querySelectorAll('.nom').forEach((n) => { n.style.transition = 'opacity .3s'; n.style.opacity = 0; });
    autre.style.transition = 'opacity .4s';
    autre.style.opacity = 0.15;
    await anim(850, (k) => {
      const e = doux(k);
      prise.style.transform = `translate(${tx * e}px, ${ty * e}px) scale(${1 - 0.9 * e})`;
      prise.style.opacity = e > 0.85 ? (1 - e) / 0.15 : 1;
    });
    await anim(500, (k) => { S.anneau = 1 + 0.6 * Math.sin(Math.PI * k); S.sale = true; });
    S.anneau = 1;
  },
  // Une simulation : la plume passe colonne par colonne et donne à chacun sa pilule
  async simuler(b, titre) {
    S.anneau = 0; S.etiquette = 0; S.mort.fill(0); S.bosse.fill(0);
    const nb = Math.round(b * N), pc = Math.round(b * 100);
    sc.titre(titre || `Simulation · ${pc} % bleue · ${100 - pc} % rouge`.toUpperCase());
    sc.decrire(`Simulation : ${pc} % des participants prennent la bleue, ${100 - pc} % la rouge.`);
    const pl = prendrePlume();
    await anim(S.cols * 20, (k) => {
      const p = k * S.cols;
      for (let i = 0; i < N; i++) {
        const [col, row] = caseDe(i);
        if (p > col + (col % 2 ? 1 - (row + 1) / S.rows : row / S.rows)) { S.coul[i] = i < nb ? 1 : 2; S.teinte[i] = 1; }
      }
      const col = Math.min(S.cols - 1, Math.floor(p)), fr = p - col;
      pl.poser(pointScene((col + 0.5) * S.c, HAUT + (col % 2 ? 1 - fr : fr) * S.rows * S.c));
      S.sale = true;
    });
    for (let i = 0; i < N; i++) { S.coul[i] = i < nb ? 1 : 2; S.teinte[i] = 1; }
    pl.lever();
    S.sale = true;
  },
  // Ce qui arrive : la règle appliquée à la simulation
  async issue(b) {
    const nb = Math.round(b * N);
    if (b > 0.5 || nb === 0) {
      sc.titre('RÉSULTAT · TOUT LE MONDE VIT');
      sc.decrire('Résultat : tout le monde vit.');
      await anim(1000, (k) => {
        const p = k * 1.35;
        for (let i = 0; i < N; i++) { const d = p - caseDe(i)[0] / S.cols; S.bosse[i] = d > 0 && d < 0.3 ? Math.sin((Math.PI * d) / 0.3) : 0; }
        S.sale = true;
      });
      S.bosse.fill(0);
    } else {
      sc.titre('RÉSULTAT · CEUX QUI ONT PRIS LA BLEUE MEURENT');
      sc.decrire('Résultat : ceux qui ont pris la bleue meurent ; ceux qui ont pris la rouge vivent.');
      await anim(1200, (k) => {
        for (let i = 0; i < nb; i++) S.mort[i] = clamp((k - 0.6 * hasard(i)) / 0.4, 0, 1);
        S.sale = true;
      });
      for (let i = 0; i < nb; i++) S.mort[i] = 1;
    }
    S.sale = true;
  },
  // L'estimation du joueur : des couleurs pâles, ce n'est qu'une idée
  estimation(p) {
    S.anneau = 0; S.etiquette = 0; S.mort.fill(0); S.bosse.fill(0); S.marque = null;
    const nb = p === null ? -1 : Math.round((p / 100) * N);
    for (let i = 0; i < N; i++) { S.coul[i] = p === null ? 0 : i < nb ? 1 : 2; S.teinte[i] = 0.5; }
    sc.titre(p === null ? 'VOTRE ESTIMATION' : `VOTRE ESTIMATION · ${p} % BLEUE · ${100 - p} % ROUGE`);
    sc.decrire(p === null ? 'Votre estimation, pas encore donnée.' : `Votre estimation : ${p} % de pilules bleues.`);
    S.sale = true;
  },
  // Alfred : l'expérience à nouveau, une minorité prend la bleue
  async alfred() {
    sc.neutre();
    await sc.simuler(0.3, 'À NOUVEAU · UNE MINORITÉ PREND LA BLEUE');
    await sc.issue(0.3);
    sc.titre('À NOUVEAU · UNE MINORITÉ PREND LA BLEUE');
    S.marque = { i: Math.floor(S.cols * 0.3 * 0.45) * S.rows + Math.floor(S.rows * 0.42), texte: 'Alfred', a: 0 };
    sc.decrire('Une minorité a pris la bleue et a été tuée. Alfred en fait partie.');
    await anim(400, (k) => { S.marque.a = k; S.sale = true; });
  },
};
mise();

// --- Les écrans ------------------------------------------------------------------------
const ecran = document.getElementById('ecran');
const phiDit = document.getElementById('phi-dit');
const passer = document.getElementById('passer');
passer.addEventListener('click', () => { presse = true; passer.hidden = true; });
// Toute réponse du joueur rend aux animations leur vitesse normale
document.addEventListener('click', (e) => { if (e.target.closest?.('button') && !e.target.closest('#passer')) presse = false; }, true);
async function sequence(f) {
  passer.hidden = instantane();
  try { await f(); } finally { passer.hidden = true; }
}
const ETAPES = ['accueil', 'histoire', 'regles', 'comprehension', 'q1c', 'q2c', 'q3c', 'q4c', 'choix', 'prediction', 'autre', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 's8', 'profil', 'fin'];
let etapeCourante = 'accueil';
function etape(nom) {
  etapeCourante = nom;
  if (rapide && nom === SAUT) rapide = false;
  document.getElementById('avance').style.width = `${(100 * ETAPES.indexOf(nom)) / (ETAPES.length - 1)}%`;
}
function pret() { if (SAUT && !rapide) document.title = 'ready'; }

function dire(lignes) {
  phiDit.replaceChildren(...lignes.map((l) => el('p', {}, typo(l))));
  if (lignes.length) E.parle = performance.now() / 1000 + 2.4;
}
// Phi parle pendant que la scène se fait : une ligne de plus, le temps de la lire
async function parle(ligne) {
  const p = el('p', { class: 'dit' }, typo(ligne));
  phiDit.append(p);
  if (instantane()) p.classList.add('vu');
  else requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('vu')));
  E.parle = performance.now() / 1000 + Math.min(3, ligne.length * 0.035);
  await attendre(clamp(ligne.length * 34, 900, 3400));
}
async function montrer(contenu, phi = null) {
  presse = false;
  if (!instantane() && ecran.childNodes.length) { ecran.classList.add('sort'); await attendre(220); }
  ecran.replaceChildren(...[].concat(contenu));
  if (phi) dire(phi);
  ecran.classList.remove('sort');
  if (!instantane()) {
    ecran.classList.add('entre');
    requestAnimationFrame(() => requestAnimationFrame(() => ecran.classList.remove('entre')));
  }
  window.scrollTo({ top: 0, behavior: instantane() ? 'auto' : 'smooth' });
}
const suite = (texte = 'Continuer') => el('button', { class: 'suite', type: 'button' }, texte);
const liste = (regles, classe = '') => el('ul', { class: `regles ${classe}` }, ...regles.map((r) => el('li', {}, riche(r))));
const question = (q) => el('h2', { class: q.length > 160 ? 'question longue' : 'question' }, riche(q));

// Des réponses en pastilles : la réponse prise passe au doré (le doré appartient au joueur)
function options(liste_, { auto = true, classe = 'option', brut = false, echelle = false } = {}) {
  const node = el('div', { class: classe === 'option' ? `options${echelle ? ' echelle' : ''}` : 'pastilles' });
  let valeur = null;
  let resoudre;
  const choix = new Promise((r) => { resoudre = r; });
  const boutons = liste_.map((o, i) => {
    const b = el('button', { class: classe, type: 'button', 'aria-pressed': 'false' }, brut ? typo(o) : riche(o));
    regarder(b);
    b.addEventListener('click', () => {
      if (auto && valeur !== null) return;
      boutons.forEach((x) => { x.classList.remove('pris'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('pris');
      b.setAttribute('aria-pressed', 'true');
      valeur = i;
      cligner();
      if (auto) {
        boutons.forEach((x) => { if (x !== b) x.disabled = true; });
        setTimeout(() => { E.regard = null; resoudre(i); }, instantane() ? 0 : 420);
      }
    });
    node.append(b);
    return b;
  });
  return { node, choix, valeur: () => valeur };
}
const rappel = () => el('details', { class: 'rappel' }, el('summary', {}, 'Revoir les deux descriptions'),
  el('h3', {}, 'Description de base'), liste(REGLES[BASE]), el('h3', {}, 'Nouvelle description'), liste(REGLES[NOUV], 'nouvelle'));
const rappelRegles = () => el('details', { class: 'rappel' }, el('summary', {}, 'Revoir les règles'), liste(REGLES[BASE]));
function boutonPilule(nom) {
  const b = el('button', { class: `pilule ${nom}`, type: 'button', 'aria-label': `La pilule ${nom}` });
  b.append(sv('svg', { viewBox: '0 0 150 70', 'aria-hidden': 'true' },
    sv('path', { class: 'halo', d: capsule(1, 1, 148, 68) }),
    sv('path', { class: 'corps apres', d: capsule(10, 10, 130, 50) }),
    sv('path', { class: 'trait', d: capsule(10, 10, 130, 50), 'data-v': 700 }),
    sv('line', { class: 'trait fin', x1: 75, y1: 10, x2: 75, y2: 60, 'data-v': 700 })), el('span', {}, nom));
  regarder(b);
  return b;
}
// Le curseur : pas de poignée tant qu'on n'a pas touché la barre, pour ne pas souffler 50 %
function curseur() {
  const sortie = el('output', {}, '—');
  const legende = el('p', { class: 'legende' }, typo('de pilules bleues'));
  const entree = el('input', { type: 'range', min: 0, max: 100, step: 1, value: 50, 'aria-label': typo('Pourcentage de pilules bleues') });
  const valider = suite('Valider');
  valider.disabled = true;
  const boite = el('div', { class: 'curseur' }, sortie, legende, entree,
    el('div', { class: 'graduations', 'aria-hidden': 'true' }, el('span', {}, typo('0 %')), el('span', {}, typo('50 %')), el('span', {}, typo('100 %'))),
    el('p', { class: 'aide' }, 'Touchez la barre, ou faites-la glisser.'), valider);
  let touche = false;
  const maj = () => {
    touche = true;
    boite.classList.add('touche');
    valider.disabled = false;
    const v = +entree.value;
    sortie.textContent = `${v} %`;                        // espace simple : la fine n'existe pas dans la police à chasse fixe
    legende.textContent = typo(`de pilules bleues · ${100 - v} % de rouges`);
    entree.style.setProperty('--p', `calc(${v / 100} * (100% - 28px) + 14px)`);
    sc.estimation(v);
  };
  entree.addEventListener('input', maj);
  entree.addEventListener('pointerup', () => { if (!touche) maj(); });
  entree.addEventListener('keydown', (e) => { if (e.key === 'Enter' && touche) valider.click(); });
  return { node: boite, valeur: () => +entree.value, valider };
}

// --- Le parcours ---------------------------------------------------------------------------
const J = { base: BASE, comprehension: [], erreurs: 0 };

async function ecranAccueil() {
  etape('accueil');
  const b = suite('Commencer');
  await montrer([b], PHI.accueil);
  pret();
  if (rapide) return;
  await clic(b);
}
async function ecranHistoire() {
  etape('histoire');
  const b = suite();
  b.hidden = true;
  E.expr = 'neutre';
  await montrer([b], []);
  sc.ranger(false);
  await sequence(async () => {
    await attendre(450);                                  // la scène s'ouvre
    await Promise.all([parle(PHI.histoire[0]), sc.grille()]);
    await parle(PHI.histoire[1]);
    await Promise.all([parle(PHI.histoire[2]), sc.murs()]);
    await Promise.all([parle(PHI.histoire[3]), sc.zoom()]);
    await Promise.all([parle(PHI.histoire[4]), sc.pilules()]);
  });
  b.hidden = false;
  pret();
  if (rapide) return;
  await clic(b);
}
async function ecranRegles() {
  etape('regles');
  const intro = el('p', { class: 'texte' }), ul = el('ul', { class: 'regles' }, ...REGLES[BASE].map(() => el('li')));
  const ecrits = [preparer(intro, ENONCE), ...REGLES[BASE].map((r, i) => preparer(ul.children[i], r))];
  const b = suite();
  b.hidden = true;
  E.expr = 'neutre';
  await montrer([intro, ul, b], []);
  await sequence(async () => {
    await sc.dezoom();
    sc.decrire('Mille humains, chacun dans sa case. Le joueur est entouré de doré.');
    for (const ecrire of ecrits) await ecrire();
  });
  b.hidden = false;
  pret();
  if (rapide) return;
  await clic(b);
}
async function ecranComprehensionIntro() {
  etape('comprehension');
  const b = suite("D'accord");
  E.expr = 'neutre';
  await montrer([el('p', { class: 'texte' }, riche(COMPR_INTRO)), b], PHI.simulations);
  pret();
  if (rapide) return;
  await clic(b);
}
// Une question de compréhension : Phi simule le cas, le joueur dit ce qui se passe, puis la
// simulation se joue. En cas d'erreur, les règles sont redonnées et un autre test est posé.
async function ecranComprehension(c, n) {
  let cas = c;
  for (;;) {
    etape(c.id);
    const o = options(c.options);
    E.expr = 'curieux';
    await montrer([question(cas.q), rappelRegles()], []);
    sc.neutre();
    await sequence(() => sc.simuler(cas.b));
    ecran.append(o.node);
    pret();
    const r = rapide ? c.bonne : await o.choix;
    const juste = r === c.bonne;
    J.comprehension.push({ question: c.id, cas: Math.round(cas.b * 100), reponse: c.options[r], juste });
    dire(juste ? [PHI.juste[n % PHI.juste.length]] : PHI.faux);
    E.expr = juste ? 'neutre' : 'curieux';
    await sequence(() => sc.issue(cas.b));
    if (juste) { await attendre(1100); return; }
    J.erreurs += 1;
    const b = suite('Autre question');
    await montrer([el('p', { class: 'texte' }, riche(ENONCE)), liste(REGLES[BASE]), b], PHI.erreur);
    pret();
    if (!rapide) await clic(b);
    cas = c.autre || c;
  }
}
async function ecranChoix() {
  etape('choix');
  sc.ranger(false);
  sc.neutre();
  const bleue = boutonPilule('bleue'), rouge = boutonPilule('rouge');
  const choisi = new Promise((res) => [bleue, rouge].forEach((b, i) => b.addEventListener('click', () => {
    b.classList.add('pris');
    bleue.disabled = true;
    rouge.disabled = true;
    cligner();
    res(i ? 'rouge' : 'bleue');
  }, { once: true })));
  const zone = el('div', { class: 'pilules a-tracer' }, bleue, rouge);
  E.expr = 'curieux';
  await montrer([question(Q_CHOIX), zone], PHI.choix);
  await sequence(async () => {
    sc.titre('');
    await sc.zoom();
    S.anneau = 1;
    await Promise.all([sc.pilules(), tracer(zone)]);
  });
  pret();
  if (rapide) { J.choix = 'bleue'; return; }
  J.choix = await choisi;
  E.regard = null;
  dire(PHI.note);
  await sequence(() => sc.prendre(J.choix));
  await attendre(600);
}
async function ecranEstimation(id, q) {
  etape(id);
  sc.ranger(false);
  const cur = curseur();
  const ok = clic(cur.valider);
  E.expr = 'curieux';
  await montrer([question(q), cur.node], []);
  await sequence(() => sc.dezoom());
  if (!cur.node.classList.contains('touche')) sc.estimation(null);
  pret();
  if (rapide) return 50;
  await ok;
  return cur.valeur();
}
// L'autre description : Phi l'écrit sous nos yeux, règle par règle, sous l'ancienne.
// Sans rature : barrer la première ferait d'elle une erreur, et soufflerait la réponse
// à « plus ou moins trompeuse ».
async function ecranAutre() {
  etape('autre');
  sc.ranger(true);
  const base = liste(REGLES[BASE]);
  const autre = el('p', { class: 'texte' }), fin = el('p', { class: 'texte' });
  const nouv = el('ul', { class: 'regles nouvelle' }, ...REGLES[NOUV].map(() => el('li')));
  const ecrits = [preparer(autre, AUTRE), ...REGLES[NOUV].map((r, i) => preparer(nouv.children[i], r)), preparer(fin, NOUV_FIN)];
  const b = suite();
  b.hidden = true;
  E.expr = 'neutre';
  await montrer([el('p', { class: 'texte' }, riche(RAPPEL)), base, el('p', { class: 'texte' }, riche(BASE_FIN)), autre, nouv, fin, b], []);
  await sequence(async () => {
    await attendre(1200);
    base.classList.add('passee');
    for (const ecrire of ecrits) await ecrire();
    base.classList.remove('passee');
  });
  b.hidden = false;
  pret();
  if (rapide) return;
  await clic(b);
}
async function ecranQuestion(id, q, { echelle = false } = {}) {
  etape(id);
  sc.ranger(true);
  const o = options(q.options, { echelle });
  const corps = [question(q.q)];
  if (q.aide) corps.push(el('p', { class: 'aide' }, riche(q.aide)));
  corps.push(rappel(), o.node);
  E.expr = 'curieux';
  await montrer(corps, []);
  pret();
  if (rapide) return id === 'q1' && SAUT === 's8' ? 2 : 0;
  return o.choix;
}
async function ecranGrille() {
  etape('q6');
  sc.ranger(false);
  const rep = {};
  const valider = suite();
  valider.disabled = true;
  const lignes = Q.q6.lignes.map((l, i) => {
    const o = options(Q.q6.colonnes, { auto: false, classe: 'pastille' });
    o.node.setAttribute('role', 'group');
    o.node.setAttribute('aria-label', typo(l));
    o.node.addEventListener('click', () => {
      if (o.valeur() !== null) rep[i] = o.valeur();
      valider.disabled = Object.keys(rep).length < Q.q6.lignes.length;
    });
    return el('div', { class: 'ligne' }, el('p', {}, riche(l)), o.node);
  });
  const ok = clic(valider);
  E.expr = 'curieux';
  await montrer([question(Q.q6.q), rappel(), el('div', { class: 'grille' }, ...lignes), valider], []);
  await sequence(() => sc.alfred());
  pret();
  if (rapide) return {};
  await ok;
  return Object.fromEntries(Q.q6.cles.map((k, i) => [k, Q.q6.colonnes[rep[i]]]));
}
async function ecranS8() {
  etape('s8');
  sc.ranger(true);
  const b = suite();
  b.disabled = true;
  const o = options(S8.options, { auto: false });
  o.node.addEventListener('click', () => { b.disabled = o.valeur() === null; });
  const libre = el('textarea', { id: 's8-libre' });
  E.expr = 'curieux';
  await montrer([
    question(S8.titre),
    el('h3', { class: 'aide' }, 'Description individuelle'), liste(REGLES.individuel),
    el('h3', { class: 'aide' }, 'Description collective'), liste(REGLES.collectif),
    el('p', { class: 'texte' }, riche(S8.q)), o.node,
    el('div', { class: 'champ' }, el('label', { for: 's8-libre' }, riche(S8.libre)), libre), b,
  ], []);
  pret();
  if (rapide) return {};
  await clic(b);
  return { possible: o.valeur() === null ? '' : S8.options[o.valeur()], element: libre.value.trim() };
}
async function ecranProfil() {
  etape('profil');
  sc.ranger(true);
  const rep = {};
  const champs = PROFIL.champs.map((c) => {
    if (c.texte || c.long) {
      const id = `p-${c.id}`;
      const saisie = c.long ? el('textarea', { id }) : el('input', { type: 'text', id, autocomplete: 'off' });
      saisie.addEventListener('input', () => { rep[c.id] = saisie.value.trim(); });
      return el('div', { class: 'champ' }, el('label', { for: id }, typo(c.label)), saisie);
    }
    const o = options(c.options, { auto: false, classe: 'pastille', brut: true });
    o.node.addEventListener('click', () => { if (o.valeur() !== null) rep[c.id] = c.options[o.valeur()]; });
    return el('div', { class: 'champ' }, el('p', {}, typo(c.label)), o.node);
  });
  const b = suite('Terminer');
  E.expr = 'neutre';
  await montrer([question(PROFIL.titre), el('p', { class: 'aide' }, typo(PROFIL.aide)), ...champs, b], []);
  pret();
  if (rapide) return {};
  await clic(b);
  return rep;
}
const NOMS = { age: 'âge', niveau: 'niveau socio-économique', diplome: 'diplôme', politique: 'positionnement' };
async function ecranFin() {
  etape('fin');
  sc.ranger(false);
  const ligne = (k, v) => [el('dt', {}, typo(k)), el('dd', {}, typo(String(v ?? '—')))];
  const fautes = J.comprehension.filter((c) => !c.juste).map((c) => `${c.question}, ${c.cas} % de bleues`).join(' ; ');
  const dl = el('dl', {},
    ...ligne('Description de base', J.base === 'collectif' ? 'collective (S2)' : 'individuelle (S5)'),
    ...ligne('Compréhension', J.erreurs ? `${J.erreurs} ${J.erreurs > 1 ? 'erreurs' : 'erreur'}, puis la bonne réponse (${fautes})` : 'tout juste du premier coup'),
    ...ligne('Choix', J.choix ? `la pilule ${J.choix}` : '—'),
    ...ligne('Prédiction', J.prediction !== undefined ? `${J.prediction} % de bleues` : '—'),
    ...ligne('Équivalence', J.equivalence),
    ...ligne('Plus ou moins trompeuse', J.trompeuse),
    ...ligne('Même choix', J.memeChoix),
    ...ligne('Prédiction, autre description', J.predictionNouvelle !== undefined ? `${J.predictionNouvelle} % de bleues` : '—'),
    ...ligne('Description choisie', J.descriptionChoisie),
    ...ligne('Responsabilité (Alfred)', J.responsabilite && Object.keys(J.responsabilite).length ? Object.entries(J.responsabilite).map(([k, v]) => `${k} : ${v ?? '—'}`).join(' · ') : '—'),
    ...(J.s8 ? ligne('Pas d\'équivalence', `${J.s8.possible || '—'}${J.s8.element ? ` · « ${J.s8.element} »` : ''}`) : []),
    ...ligne('Profil', J.profil && Object.keys(J.profil).length ? Object.entries(J.profil).map(([k, v]) => `${NOMS[k] || k} : ${v}`).join(' · ') : 'non renseigné'));
  E.expr = 'emu';
  await montrer([el('div', { class: 'journal' }, el('h3', {}, 'Maquette : ce qui serait enregistré'), dl),
    el('button', { class: 'lien', type: 'button', onclick: 'location.reload()' }, 'Recommencer (nouveau tirage)')], PHI.fin);
  await sequence(async () => {
    await sc.dezoom();
    sc.neutre();
    sc.titre('MILLE HUMAINS · UN SEUL CHOIX CHACUN');
    await anim(500, (k) => { S.anneau = k; S.sale = true; });
  });
  pret();
}

async function parcours() {
  await ecranAccueil();
  await ecranHistoire();
  await ecranRegles();
  await ecranComprehensionIntro();
  for (const [n, c] of COMPR.entries()) await ecranComprehension(c, n);
  await ecranChoix();
  J.prediction = await ecranEstimation('prediction', Q_PRED);
  await ecranAutre();
  const r1 = await ecranQuestion('q1', Q.q1, { echelle: true });
  J.equivalence = Q.q1.options[r1];
  J.trompeuse = Q.q2.options[await ecranQuestion('q2', Q.q2, { echelle: true })];
  J.memeChoix = Q.q3.options[await ecranQuestion('q3', Q.q3)];
  J.predictionNouvelle = await ecranEstimation('q4', Q.q4.q);
  J.descriptionChoisie = Q.q5.options[await ecranQuestion('q5', Q.q5)];
  J.responsabilite = await ecranGrille();
  if (r1 > 1) J.s8 = await ecranS8();                   // ni « tout à fait » ni « plutôt d'accord »
  J.profil = await ecranProfil();
  await ecranFin();
}
window.essai = { get etape() { return etapeCourante; }, get journal() { return JSON.parse(JSON.stringify(J)); }, base: BASE, scene: S };
parcours();
