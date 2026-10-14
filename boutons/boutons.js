/* ==========================================================================
   Les deux boutons : le questionnaire « A ou B ? » de Monsieur Phi, tel quel.

   Retour de Thibaut sur le lac (12 octobre) : « ça donne l'impression qu'on
   voit tous simultanément le choix des autres […]. Pourquoi pas faire le
   scénario pilule ou bouton simplement en reprenant exactement mon
   questionnaire ? » Et sur le style : « il faut quelque chose de plus
   abstrait et épuré, avec moins d'éléments dessinés ».

   Le parcours suit docs/questionnaire-a-ou-b.md, version boutons (enjeux forts) :
   la description de base est tirée au sort (collective ou individuelle) ;
   les questions de compréhension (en cas d'erreur, on réexplique les règles
   et on repose la question) ; le choix ; la prédiction ; l'autre description
   et ses six questions ; la page « pas d'équivalence » si l'on n'est pas
   d'accord ; le profil, facultatif ; la fin. Les textes sont ceux du
   questionnaire. Les seuls dessins sont tracés à la ligne par la machine,
   l'œil de Phi en tête de stylo : les deux boutons, des barres de proportion.
   On ne montre jamais les autres participants.

   Paramètres d'essai :
     ?formulation=collectif|individuel   force la description de base
     ?saut=choix                         va directement à un écran : enonce,
                                         comprehension, q1c, q2c, q3c, q4c, choix,
                                         prediction, autre, q1 … q6, s8, profil, fin
     ?vite=1                             sans animation (pour les captures)
   ========================================================================== */

const params = new URLSearchParams(location.search);
const BASE = /^(collectif|individuel)$/.test(params.get('formulation') || '') ? params.get('formulation') : (Math.random() < 0.5 ? 'collectif' : 'individuel');
const NOUV = BASE === 'collectif' ? 'individuel' : 'collectif';
const SAUT = params.get('saut');
const VITE = params.get('vite') === '1' || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let rapide = !!SAUT;                 // pendant un saut, les écrans précédents passent sans s'afficher

// --- Les textes du questionnaire --------------------------------------------------
const ENONCE = 'On vous présente deux boutons A et B. Vous, et tous les autres participants à ce questionnaire, allez devoir choisir simultanément sur quel bouton appuyer, sachant que :';
const REGLES = {
  collectif: [
    'Si la majorité des participants appuient sur le bouton A, tout le monde continuera de vivre.',
    'Si au moins la moitié des participants appuient sur le bouton B, alors un dispositif tuera tous ceux qui ont appuyé sur le bouton A. Seuls ceux qui ont appuyé sur le bouton B continueront de vivre.',
    'Appuyer sur un bouton est obligatoire : si vous ne le faites pas, tout le monde meurt.',
  ],
  individuel: [
    'Si un participant appuie sur le bouton A, alors un dispositif tuera ce participant sauf si la majorité des participants ont aussi appuyé sur le bouton A : dans ce cas, il ne lui arrivera rien.',
    'Si un participant appuie sur le bouton B, il ne lui arrive rien.',
    'Appuyer sur un bouton est obligatoire : si vous ne le faites pas, tout le monde meurt.',
  ],
};
const COMPR_INTRO = "Avant de passer au choix, vous devez répondre à quelques questions de compréhension. En cas d'erreur, les organisateurs du jeu prendront soin de réexpliquer les règles au participant et de lui faire passer un autre test de compréhension. On s'assure ainsi que tous les participants auront une bonne compréhension des règles du jeu au moment de faire leur choix.";
const ISSUES = ['Tout le monde vit.', 'Les A vivent. | Les B meurent.', 'Les A meurent. | Les B vivent.', 'Tout le monde meurt.'];
const COMPR = [
  { id: 'q1c', q: 'Si tous les participants appuient sur le bouton A :', a: 100, options: ['Tout le monde vit.', 'Tout le monde meurt.'], bonne: 0 },
  { id: 'q2c', q: 'Si tous les participants appuient sur le bouton B :', a: 0, options: ['Tout le monde vit.', 'Tout le monde meurt.'], bonne: 0 },
  { id: 'q3c', q: 'Si 25 % des participants appuient sur le bouton A et 75 % sur le bouton B :', a: 25, options: ISSUES, bonne: 2 },
  { id: 'q4c', q: 'Si 75 % des participants appuient sur le bouton A et 25 % sur le bouton B :', a: 75, options: ISSUES, bonne: 0 },
];
const Q_CHOIX = "Sur quel bouton choisissez-vous d'appuyer ?";
const Q_PRED = 'Selon vous, quel sera le pourcentage de bouton A parmi les participants ?';
const RAPPEL = 'Pour rappel, les effets des boutons A et B vous ont été décrits ainsi :';
const BASE_FIN = "C'est la DESCRIPTION DE BASE.";
const AUTRE = (BASE === 'collectif' ? 'Mais on' : 'On') + ' aurait pu décrire les effets des boutons A et B de la façon suivante :';
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
  q4: { q: "Selon vous, quel aurait été le pourcentage de bouton A parmi les participants si c'était la NOUVELLE DESCRIPTION qui avait été donnée ?" },
  q5: {
    q: "Si les organisateurs de l'expérience vous avaient demandé de choisir la description des règles du problème, laquelle de ces deux descriptions auriez-vous choisie ?",
    options: ['La description de base', 'La nouvelle description'],
  },
  // La grille porte toujours sur l'énoncé collectif ; seule l'étiquette change d'un bloc à l'autre
  q6: {
    q: `L'expérience est à nouveau menée avec la ${BASE === 'collectif' ? 'DESCRIPTION DE BASE' : 'NOUVELLE DESCRIPTION'}. Une minorité de participants appuient sur le bouton A et se font donc tuer. Alfred fait partie de ces participants tués. À qui attribuez-vous une part de RESPONSABILITÉ DANS LA MORT D'ALFRED ?`,
    lignes: ["aux organisateurs de l'expérience", 'à Alfred', 'à une autre personne ayant appuyé sur le bouton A', 'à une personne ayant appuyé sur le bouton B',
      BASE === 'collectif' ? "à la personne qui a choisi la DESCRIPTION DE BASE plutôt que l'autre" : "à la personne ayant choisi la NOUVELLE DESCRIPTION plutôt que l'autre"],
    cles: ['organisateurs', 'Alfred', 'un autre A', 'un B', 'qui a choisi la description'],
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
// Ce que dit Phi, en plus du questionnaire : le moins possible
const PHI = {
  accueil: ['Bonjour. Je suis Phi.', 'Je vais vous présenter une situation, vérifier que ses règles sont claires, puis vous poser quelques questions.', "Je suis un personnage ; les questions, elles, sont celles d'une vraie étude. Vos réponses sont anonymes."],
  erreur: ["Ce n'est pas la bonne réponse. Voici de nouveau les règles, puis la même question."],
  fin: ["Merci. C'est noté.", "Les résultats seront révélés dans l'émission."],
};

// --- Outils ------------------------------------------------------------------------
const typo = (s) => s
  .replace(/'/g, '’')
  .replace(/ ([?!;])/g, ' $1')
  .replace(/ :/g, ' :')
  .replace(/(\d) %/g, '$1 %')
  .replace(/« /g, '« ').replace(/ »/g, ' »');
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
const attendre = (ms) => new Promise((r) => setTimeout(r, VITE ? 0 : ms));
const clic = (b) => new Promise((r) => b.addEventListener('click', () => r(), { once: true }));
const anim = (ms, f) => new Promise((res) => {
  const t0 = performance.now();
  const pas = (now) => { const k = Math.min(1, (now - t0) / ms); f(k); if (k < 1) requestAnimationFrame(pas); else res(); };
  requestAnimationFrame(pas);
});

// --- L'œil de Phi : il se pose près de ce qu'il dit, et tient le stylo quand la machine dessine ---
const oeilEl = document.getElementById('phi-oeil');
const place = document.getElementById('phi-place');
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
  const k = E.stylo ? 0.4 : 0.2;
  E.x += (cible.x - E.x) * k;
  E.y += (cible.y - E.y) * k;
  oeilEl.style.transform = `translate(${E.x.toFixed(1)}px, ${E.y.toFixed(1)}px)`;
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

// Le tracé : chaque trait apparaît à vitesse constante, comme sous la plume d'un traceur
function pointEcran(n, s) {
  const p = n.getPointAtLength(s), m = n.getScreenCTM();
  return { x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f };
}
// On n'attend jamais la fin du dessin pour répondre ; un nouveau tracé prend la plume à l'ancien.
// data-v : vitesse du trait (les hachures vont plus vite que les contours)
let plume = 0;
async function tracer(racine, { instant = VITE } = {}) {
  const moi = ++plume;
  E.stylo = null;                                          // l'ancien tracé, s'il y en a un, rend la plume
  const traits = [...racine.querySelectorAll('.trait')];
  const apres = [...racine.querySelectorAll('.apres')];
  for (const t of traits) {
    const L = t.getTotalLength();
    t.dataset.l = L;
    t.style.strokeDasharray = `${L} ${L}`;
    t.style.strokeDashoffset = instant ? 0 : L;
  }
  apres.forEach((a) => { a.style.opacity = instant ? 1 : 0; });
  if (instant) return;
  const actif = () => moi === plume && racine.isConnected;
  for (const t of traits) {
    if (!actif()) break;
    const L = +t.dataset.l;
    E.stylo = pointEcran(t, 0);
    await new Promise((r) => setTimeout(r, 90));           // la plume se déplace, levée
    await anim(Math.max(120, (L / (+t.dataset.v || 900)) * 1000), (k) => {
      t.style.strokeDashoffset = L * (1 - k);
      if (actif()) E.stylo = pointEcran(t, L * k);
      else if (moi === plume) E.stylo = null;              // le dessin a quitté l'écran : la plume se lève
    });
  }
  traits.forEach((t) => { t.style.strokeDashoffset = 0; });
  if (moi === plume) E.stylo = null;
  if (racine.isConnected) await anim(300, (k) => apres.forEach((a) => { a.style.opacity = k; }));
  else apres.forEach((a) => { a.style.opacity = 1; });
}

// --- Les écrans ---------------------------------------------------------------------
const ecran = document.getElementById('ecran');
const phiDit = document.getElementById('phi-dit');
const ETAPES = ['accueil', 'enonce', 'comprehension', 'q1c', 'q2c', 'q3c', 'q4c', 'choix', 'prediction', 'autre', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 's8', 'profil', 'fin'];
let etapeCourante = 'accueil';
function etape(nom) {
  etapeCourante = nom;
  if (rapide && nom === SAUT) rapide = false;
  document.getElementById('avance').style.width = `${(100 * ETAPES.indexOf(nom)) / (ETAPES.length - 1)}%`;
}
function pret() { if (SAUT && !rapide) document.title = 'ready'; }

async function montrer(contenu, phi = null) {
  if (!VITE && ecran.childNodes.length) { ecran.classList.add('sort'); await attendre(220); }
  ecran.replaceChildren(...[].concat(contenu));
  phiDit.replaceChildren(...(phi ? phi.map((l) => el('p', {}, typo(l))) : []));
  if (phi) E.parle = performance.now() / 1000 + 2.4;
  ecran.classList.remove('sort');
  if (!VITE) {
    ecran.classList.add('entre');
    requestAnimationFrame(() => requestAnimationFrame(() => ecran.classList.remove('entre')));
  }
  window.scrollTo({ top: 0, behavior: VITE ? 'auto' : 'smooth' });
}
const suite = (texte = 'Continuer') => el('button', { class: 'suite', type: 'button' }, texte);
const liste = (regles, classe = '') => el('ul', { class: `regles ${classe}` }, ...regles.map((r) => el('li', {}, riche(r))));
const question = (q) => el('h2', { class: q.length > 160 ? 'question longue' : 'question' }, riche(q));

// Des réponses en pastilles : la réponse prise passe au doré (le doré appartient au joueur)
function options(liste_, { auto = true, classe = 'option', brut = false } = {}) {
  const node = el('div', { class: classe === 'option' ? 'options' : 'pastilles' });
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
        setTimeout(() => { E.regard = null; resoudre(i); }, VITE ? 0 : 480);
      }
    });
    node.append(b);
    return b;
  });
  return { node, choix, valeur: () => valeur };
}

// Les dessins : les deux boutons ; une barre de proportion (la part de A hachurée).
// Ils sont faits en pixels de la colonne, pour que les lettres gardent leur taille sur un téléphone,
// et les deux cercles ont la taille et la place des vrais boutons du choix
const largeur = () => Math.round(ecran.clientWidth) || 600;
function dessinBoutons() {
  const W = largeur(), vw = window.innerWidth;
  const D = clamp(0.3 * vw, 118, 156), g = clamp(0.08 * vw, 24, 72), H = Math.ceil(D + 8), cy = H / 2;
  const fs = clamp(0.09 * vw, 40, 54);
  const rond = (cx, lettre) => [
    sv('circle', { class: 'trait', cx, cy, r: D * 0.475 }),
    sv('text', { class: 'apres', x: cx, y: cy + fs * 0.36, 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 500 }, lettre)];
  return sv('svg', { class: 'dessin', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Deux boutons, A et B' },
    ...rond(W / 2 - g / 2 - D / 2, 'A'), ...rond(W / 2 + g / 2 + D / 2, 'B'));
}
// a = null : la barre vide, que le participant remplira
function dessinBarre(a) {
  const W = largeur(), x0 = 1, w = W - 2, y = 30, h = 34, xs = x0 + (w * (a ?? 0)) / 100;
  const etiquette = a === null ? 'Une barre vide' : a === 100 ? 'Tous les participants : A' : a === 0 ? 'Tous les participants : B' : `${a} % A, ${100 - a} % B`;
  const enfants = [sv('rect', { class: 'trait', x: x0, y, width: w, height: h })];
  if (a !== null) {
    if (a > 0 && a < 100) enfants.push(sv('line', { class: 'trait', x1: xs, y1: y, x2: xs, y2: y + h }));
    // la part de A, hachurée d'un seul trait, en allers et retours, comme un traceur
    let d = '', n = 0;
    for (let x = x0 - h; x < xs; x += 9) {
      const xa = Math.max(x, x0), xb = Math.min(x + h, xs);
      if (xb - xa <= 0.5) continue;
      const p = [[xa, y + h - (xa - x)], [xb, y + h - (xb - x)]];
      if (n++ % 2) p.reverse();
      d += `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}L${p[1][0].toFixed(1)} ${p[1][1].toFixed(1)}`;
    }
    if (d) enfants.push(sv('path', { class: 'trait fin', d, 'data-v': 2600 }));
    const lettre = (x, texte) => sv('text', { class: 'apres', x: clamp(x, 30, W - 30), y: y - 11, 'text-anchor': 'middle', 'font-size': 15 }, typo(texte));
    if (a > 0) enfants.push(lettre((x0 + xs) / 2, `${a} % A`));
    if (a < 100) enfants.push(lettre((xs + x0 + w) / 2, `${100 - a} % B`));
  }
  return sv('svg', { class: 'dessin', viewBox: `0 0 ${W} ${y + h + 2}`, role: 'img', 'aria-label': typo(etiquette) }, ...enfants);
}
function boutonRond(lettre) {
  const b = el('button', { class: 'bouton', type: 'button', 'aria-label': `Le bouton ${lettre}` });
  b.append(sv('svg', { viewBox: '0 0 160 160', 'aria-hidden': 'true' },
    sv('circle', { class: 'fond', cx: 80, cy: 80, r: 76 }),
    sv('circle', { class: 'trait', cx: 80, cy: 80, r: 76 })), el('span', {}, lettre));
  regarder(b);
  return b;
}
const rappel = () => el('details', { class: 'rappel' }, el('summary', {}, 'Revoir les deux descriptions'),
  el('h3', {}, 'Description de base'), liste(REGLES[BASE]), el('h3', {}, 'Nouvelle description'), liste(REGLES[NOUV], 'nouvelle'));
// Dans le formulaire, l'énoncé reste au-dessus des questions de compréhension
const rappelRegles = () => el('details', { class: 'rappel' }, el('summary', {}, 'Revoir les règles'), liste(REGLES[BASE]));

// --- Le parcours ----------------------------------------------------------------------
const J = { base: BASE, comprehension: [], erreurs: 0 };

async function ecranAccueil() {
  etape('accueil');
  if (rapide) return;
  const b = suite('Commencer');
  await montrer([b], PHI.accueil);
  pret();
  await clic(b);
}
async function ecranEnonce({ phi = null, bouton = 'Continuer' } = {}) {
  const d = dessinBoutons(), b = suite(bouton);
  E.expr = phi ? 'curieux' : 'neutre';
  const ok = clic(b);
  await montrer([d, el('p', { class: 'texte' }, riche(ENONCE)), liste(REGLES[BASE]), b], phi);
  tracer(d, { instant: VITE || !!phi }).then(pret);   // redonné après une erreur : déjà dessiné, Phi reste près de ce qu'il dit
  await ok;
}
async function ecranTexte(texte) {
  const b = suite();
  E.expr = 'neutre';
  await montrer([el('p', { class: 'texte' }, riche(texte)), b]);
  pret();
  await clic(b);
}
async function ecranComprehension(c) {
  for (;;) {
    etape(c.id);
    let r = c.bonne;
    if (!rapide) {
      const d = dessinBarre(c.a);
      const o = options(c.options);
      E.expr = 'curieux';
      await montrer([d, question(c.q), rappelRegles(), o.node]);
      tracer(d).then(pret);
      r = await o.choix;
    }
    J.comprehension.push({ question: c.id, reponse: c.options[r], juste: r === c.bonne });
    if (r === c.bonne) return;
    J.erreurs += 1;
    await ecranEnonce({ phi: PHI.erreur, bouton: 'Reprendre la question' });
  }
}
async function ecranChoix() {
  etape('choix');
  if (rapide) { J.choix = 'A'; return; }
  const A = boutonRond('A'), B = boutonRond('B');
  const zone = el('div', { class: 'boutons' }, A, B);
  const choisi = new Promise((res) => [A, B].forEach((b, i) => b.addEventListener('click', () => {
    b.classList.add('pris');
    A.disabled = true; B.disabled = true;
    cligner();
    res(i ? 'B' : 'A');
  }, { once: true })));
  E.expr = 'curieux';
  await montrer([question(Q_CHOIX), zone]);
  tracer(zone).then(pret);
  J.choix = await choisi;
  await attendre(700);
  E.regard = null;
}
// Le pourcentage se tape, comme dans le formulaire (un curseur posé à 50 % soufflerait
// une réponse) ; la barre vide, tracée par la machine, se hachure à mesure
async function ecranPourcentage(id, q) {
  etape(id);
  if (rapide) return 50;
  const saisie = el('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', maxlength: 3, 'aria-label': typo('Pourcentage de bouton A, entre 0 et 100') });
  const valider = suite('Valider');
  valider.disabled = true;
  let barre = dessinBarre(null);
  const zone = el('div', { class: 'pourcentage' }, saisie, el('span', { 'aria-hidden': 'true' }, '%'));
  let v = NaN;
  saisie.addEventListener('input', () => {
    saisie.value = saisie.value.replace(/\D/g, '');
    v = saisie.value === '' ? NaN : +saisie.value;
    const juste = v >= 0 && v <= 100;
    valider.disabled = !juste;
    zone.classList.toggle('faux', saisie.value !== '' && !juste);
    const neuve = dessinBarre(juste ? v : null);
    barre.replaceWith(neuve);
    barre = neuve;
  });
  saisie.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !valider.disabled) valider.click(); });
  const ok = clic(valider);
  E.expr = 'curieux';
  await montrer([question(q), zone, el('p', { class: 'aide' }, typo('Un nombre entre 0 et 100.')), barre, valider]);
  if (matchMedia('(pointer: fine)').matches) saisie.focus({ preventScroll: true });
  tracer(barre).then(pret);
  await ok;
  return v;
}
async function ecranAutre() {
  etape('autre');
  if (rapide) return;
  const b = suite();
  E.expr = 'neutre';
  await montrer([
    el('p', { class: 'texte' }, riche(RAPPEL)), liste(REGLES[BASE]), el('p', { class: 'texte' }, riche(BASE_FIN)),
    el('p', { class: 'texte' }, riche(AUTRE)), liste(REGLES[NOUV], 'nouvelle'), el('p', { class: 'texte' }, riche(NOUV_FIN)), b,
  ]);
  pret();
  await clic(b);
}
async function ecranQuestion(id, q) {
  etape(id);
  if (rapide) return id === 'q1' && SAUT === 's8' ? 2 : 0;
  const o = options(q.options);
  const corps = [question(q.q)];
  if (q.aide) corps.push(el('p', { class: 'aide' }, riche(q.aide)));
  corps.push(rappel(), o.node);
  E.expr = 'curieux';
  await montrer(corps);
  pret();
  return o.choix;
}
async function ecranGrille() {
  etape('q6');
  if (rapide) return {};
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
  E.expr = 'curieux';
  await montrer([question(Q.q6.q), rappel(), el('div', { class: 'grille' }, ...lignes), valider]);
  pret();
  await clic(valider);
  return Object.fromEntries(Q.q6.cles.map((k, i) => [k, Q.q6.colonnes[rep[i]]]));
}
async function ecranS8() {
  etape('s8');
  if (rapide) return {};
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
  ]);
  pret();
  await clic(b);
  return { possible: o.valeur() === null ? '' : S8.options[o.valeur()], element: libre.value.trim() };
}
async function ecranProfil() {
  etape('profil');
  if (rapide) return {};
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
  await montrer([question(PROFIL.titre), el('p', { class: 'aide' }, typo(PROFIL.aide)), ...champs, b]);
  pret();
  await clic(b);
  return rep;
}
const NOMS = { age: 'âge', niveau: 'niveau socio-économique', diplome: 'diplôme', politique: 'positionnement' };
async function ecranFin() {
  etape('fin');
  const ligne = (k, v) => [el('dt', {}, typo(k)), el('dd', {}, typo(String(v ?? '—')))];
  const comp = J.comprehension.filter((c) => !c.juste).map((c) => c.question).join(', ');
  const dl = el('dl', {},
    ...ligne('Description de base', J.base === 'collectif' ? 'collective (S2)' : 'individuelle (S5)'),
    ...ligne('Compréhension', J.erreurs ? `${J.erreurs} ${J.erreurs > 1 ? 'erreurs' : 'erreur'}, puis la bonne réponse (${comp})` : 'tout juste du premier coup'),
    ...ligne('Choix', J.choix ? `bouton ${J.choix}` : '—'),
    ...ligne('Prédiction', J.prediction !== undefined ? `${J.prediction} % de A` : '—'),
    ...ligne('Équivalence', J.equivalence),
    ...ligne('Plus ou moins trompeuse', J.trompeuse),
    ...ligne('Même choix', J.memeChoix),
    ...ligne('Prédiction, autre description', J.predictionNouvelle !== undefined ? `${J.predictionNouvelle} % de A` : '—'),
    ...ligne('Description choisie', J.descriptionChoisie),
    ...ligne('Responsabilité (Alfred)', J.responsabilite && Object.keys(J.responsabilite).length ? Object.entries(J.responsabilite).map(([k, v]) => `${k} : ${v ?? '—'}`).join(' · ') : '—'),
    ...(J.s8 ? ligne('Pas d\'équivalence', `${J.s8.possible || '—'}${J.s8.element ? ` · « ${J.s8.element} »` : ''}`) : []),
    ...ligne('Profil', J.profil && Object.keys(J.profil).length ? Object.entries(J.profil).map(([k, v]) => `${NOMS[k] || k} : ${v}`).join(' · ') : 'non renseigné'));
  E.expr = 'emu';
  await montrer([el('div', { class: 'journal' }, el('h3', {}, 'Maquette : ce qui serait enregistré'), dl),
    el('button', { class: 'lien', type: 'button', onclick: 'location.reload()' }, 'Recommencer (nouveau tirage)')], PHI.fin);
  pret();
}

async function parcours() {
  await ecranAccueil();
  etape('enonce');
  if (!rapide) await ecranEnonce();
  etape('comprehension');
  if (!rapide) await ecranTexte(COMPR_INTRO);
  for (const c of COMPR) await ecranComprehension(c);
  await ecranChoix();
  J.prediction = await ecranPourcentage('prediction', Q_PRED);
  await ecranAutre();
  const r1 = await ecranQuestion('q1', Q.q1);
  J.equivalence = Q.q1.options[r1];
  J.trompeuse = Q.q2.options[await ecranQuestion('q2', Q.q2)];
  J.memeChoix = Q.q3.options[await ecranQuestion('q3', Q.q3)];
  J.predictionNouvelle = await ecranPourcentage('q4', Q.q4.q);
  J.descriptionChoisie = Q.q5.options[await ecranQuestion('q5', Q.q5)];
  J.responsabilite = await ecranGrille();
  if (r1 > 1) J.s8 = await ecranS8();                 // ni « tout à fait » ni « plutôt d'accord »
  J.profil = await ecranProfil();
  await ecranFin();
}
window.essai = { get etape() { return etapeCourante; }, get journal() { return JSON.parse(JSON.stringify(J)); }, base: BASE };
parcours();
