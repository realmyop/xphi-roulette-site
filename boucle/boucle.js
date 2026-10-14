/* ==========================================================================
   La boucle : le questionnaire « Un jour sans fin » de Monsieur Phi
   (liberté et responsabilité dans une boucle temporelle), raconté pas à pas
   et dessiné par Phi.

   Ronan (12 octobre) : « on va tester un autre scénario qui sera plus simple à
   mettre en scène de manière esthétique ». Thibaut, sur la première version :
   « j'ai l'impression qu'il continue de se donner pour contrainte d'utiliser
   verbatim exactement tout mon questionnaire » ; « ça fait des pavés de texte
   là où il pourrait y avoir des explications pas à pas qui utilisent davantage
   l'animation » ; et couper le questionnaire démographique, « ou le réduire à
   quelques questions basiques ».

   Donc : les questions (ce qu'on mesure) restent mot pour mot ; le récit est
   réécrit en petites étapes, une ou deux phrases chacune, avec son animation.
   Il garde tout ce que le scénario établit, parce que c'est ce qui est testé :
   le monde se répète (puis, dans la seconde histoire, en partie au hasard) ;
   personne n'est forcé (ni besoin vital, ni pression, ni menace) ; « après mûre
   réflexion » ; Bob se laisse dissuader, Charlie jamais (sauf par la force) ;
   le jour de la sortie, on n'intervient pas. Le parcours suit
   docs/questionnaire-boucle-temporelle.md, dans son ordre.

   Les règles de dessin de Phi, les mêmes que pour « mille humains » :
     1. que des formes exactes, calculées (cercles, droites, arcs) : rien n'imite une main ;
     2. tout se trace sous nos yeux, l'œil de Phi en tête de stylo ;
     3. les humains sont des modèles : un rond, un corps, un nom ;
     4. peu de couleurs : l'encre pour le monde, le doré pour le joueur, le seul à se souvenir ;
     5. l'image ne montre que ce que dit le texte.

   La journée est un cadran de vingt-quatre heures. L'aiguille en fait le tour ;
   au bout, tout revient au même état, sauf les souvenirs du joueur (des points
   dorés au-dessus de sa tête). D'une étape à l'autre, la journée continue là où
   elle s'était arrêtée. Quand le joueur sort de la boucle, le cadran bascule
   sur une droite et roule en y déposant la journée : le temps reprend sa course.

   Avant la première question (« les gens se comporteront-ils de la même
   façon ? »), la scène ne montre personne d'autre que le joueur : on ne
   souffle pas la réponse.

   Paramètres d'essai :
     ?saut=b4       va directement à un écran (voir ETAPES)
     ?vite=1        sans animation (pour les captures)
   ========================================================================== */

const params = new URLSearchParams(location.search);
const SAUT = params.get('saut');
const VITE = params.get('vite') === '1' || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let rapide = !!SAUT;                 // pendant un saut, les écrans précédents passent d'un coup
let presse = false;                  // « Passer l'animation », ou « Suite » avant la fin : l'écran se termine d'un coup
const instantane = () => VITE || rapide || presse;
if (VITE) document.documentElement.classList.add('vite');

// --- Le récit, pas à pas ----------------------------------------------------------------
// Réécrit (Thibaut ne tient pas au mot pour mot), une ou deux phrases par étape ; chaque étape
// a son animation, dans ANIM plus bas. Les questions, elles, restent celles du questionnaire.
const PAS = {
  a1: { texte: "Vous connaissez « Un jour sans fin » ? Le héros y revit la même journée, encore et encore, et il est le seul à s'en rendre compte.",
    aparte: "La même idée se retrouve dans le film « Edge of Tomorrow », et dans les jeux « Majora's Mask » et « Outer Wilds »." },
  a2: { texte: 'Imaginez : une expérience de physique tourne mal, et vous déclenchez une boucle temporelle. Vous êtes la seule personne à en avoir conscience.' },
  a3: { texte: 'À chaque nouvelle boucle, tout revient exactement au même état. Tout, sauf votre cerveau : il garde le souvenir des boucles précédentes.' },
  b1: { texte: "Boucle après boucle, vous le constatez : tant que vous n'intervenez pas, chacun refait exactement la même chose. Alice, par exemple, commande toujours la même pizza, avec les mêmes mots." },
  b2: { texte: "Ce jour-là, on propose de l'argent à Bob et à Charlie pour qu'ils tuent chacun leur voisin. Personne ne les force : ils n'ont pas un besoin vital de cet argent, et ne subissent aucune pression ni menace." },
  b3: { texte: "Si vous n'intervenez pas, ils y réfléchissent mûrement, puis acceptent, et tirent sur leur voisin. À chaque boucle, sans aucune exception." },
  b4: { texte: "Mais quand vous essayez de dissuader Bob, en faisant appel à son humanité par exemple, il change d'avis : il se range à vos raisons, refuse, et ne tire pas. À chaque fois." },
  b5: { texte: "Avec Charlie, en revanche, vous n'y arrivez jamais : quoi que vous lui disiez, il ne revient pas sur sa décision." },
  b6: { texte: "Les seules fois où vous l'avez empêché de tirer, c'est en le contraignant physiquement, ou en le menaçant." },
  b7: { texte: "Vous trouvez enfin comment sortir de la boucle. Il le faut : sinon, la Terre sera détruite. Mais pour cela, vous devez rester toute la journée dans votre laboratoire, sans aucune interaction avec l'extérieur." },
  b8: { texte: "Vous le faites, et le temps reprend son cours normal. Ce jour-là, comme chaque fois que vous n'intervenez pas, Bob et Charlie acceptent, et tirent sur leur voisin." },
  c1: { texte: 'Reprenons depuis le début. Cette fois, vous constatez que le comportement des gens, dans la boucle, est en partie aléatoire.' },
  c2: { texte: 'Alice, par exemple, ne commande pas toujours la même pizza. Sur un très grand nombre de boucles, vos relevés donnent : Margherita 50 %, Reine 25 %, Quatre fromages 20 %, Hawaïenne 5 %.' },
  c3: { texte: "Ce jour-là, on propose de l'argent à Harry pour qu'il tue son voisin. Personne ne le force : il n'a pas un besoin vital de cet argent, et ne subit aucune pression ni menace." },
  c4: { texte: "Si vous n'intervenez pas, Harry y réfléchit mûrement, puis accepte et tire dans 50 % des boucles, et refuse dans les 50 % restants." },
  c5: { texte: 'Vous sortez de la boucle, et le temps reprend son cours normal. Vous apprenez plus tard que ce jour-là, Harry a accepté, et qu’il a tiré sur son voisin.' },
  c6: { texte: "D'après vos relevés, ce jour-là, les comportements de chacun ont bien suivi la même répartition que dans les boucles." },
};
const Q1 = {
  q: 'Pensez-vous que toutes les personnes qui vous entourent dans la boucle temporelle se comporteront de la même façon tant que vous n\'intervenez pas ?',
  options: ['Oui : ils répéteront toujours les mêmes comportements.', "Non : certains comportements seront différents d'une fois sur l'autre.", 'Je ne me prononce pas.'],
};
const LIKERT = ["Tout à fait d'accord", "Plutôt d'accord", 'Incertain', 'Plutôt en désaccord', 'Tout à fait en désaccord'];
const QUESTIONS = {
  'bob-libre': { q: 'Bob a AGI LIBREMENT en tirant sur son voisin.', aide: "Rappel : Bob changeait d'avis à chaque fois que vous tâchiez de le dissuader.", qui: 'bob' },
  'bob-resp': { q: 'Bob est MORALEMENT RESPONSABLE de cet acte.', qui: 'bob' },
  'charlie-libre': { q: 'Charlie a AGI LIBREMENT en tirant sur son voisin.', aide: "Rappel : Charlie ne changeait jamais d'avis quand vous tâchiez de le dissuader.", qui: 'charlie' },
  'charlie-resp': { q: 'Charlie est MORALEMENT RESPONSABLE de cet acte.', qui: 'charlie' },
  'harry-libre': { q: 'Harry a AGI LIBREMENT en tirant sur son voisin.', aide: 'Rappel : Harry avait 50 % de chance de décider de tirer sur son voisin et 50 % de chance de décider le contraire.', qui: 'harry' },
  'harry-resp': { q: 'Harry est MORALEMENT RESPONSABLE de cet acte.', qui: 'harry' },
};
// « Couper la fin avec le questionnaire démographique, ou le réduire à quelques questions basiques »
const PROFIL = {
  titre: 'Pour finir, quelques questions sur vous',
  aide: 'Toutes facultatives.',
  champs: [
    { id: 'genre', label: 'Vous êtes', options: ['Une femme', 'Un homme', 'Autre'] },
    { id: 'age', label: 'Votre âge', texte: true },
    { id: 'residence', label: 'Vous résidez en', options: ['France', 'Belgique', 'Canada', 'Suisse', 'Maroc', 'Algérie', 'Europe (sauf pays déjà cités)', 'Afrique (sauf pays déjà cités)', 'Amérique (sauf Canada)', 'Asie', 'Océanie'] },
    { id: 'etudes', label: "Niveau d'étude", options: ['Sans diplôme', 'Brevet', 'CAP', 'Bac', 'Licence ou DEUG (bac+2 ou +3)', 'Master (bac+5)', 'Doctorat (bac+8)'] },
  ],
};
// Le formulaire nomme un chercheur et une université : on ne les cite pas sur une maquette publique
const CONSENTEMENT = {
  texte: "Vos réponses pourraient aussi servir, après complète anonymisation, à une recherche universitaire sur la conception ordinaire que les gens se font de la liberté (données partagées avec d'autres chercheurs, résultats présentés dans des articles ou des conférences).",
  q: 'Êtes-vous d’accord ?',
  options: ['Oui.', "Non, je préfère que l'utilisation de mes réponses se limite à l'émission."],
};
const PHI = {
  accueil: ['Bonjour. Je suis Phi.', 'Je fabrique des expériences de pensée, pour comprendre comment les humains jugent.', "Celle-ci parle de liberté et de responsabilité. Elle dure environ cinq minutes ; vos réponses sont anonymes."],
  questions: ['Quelques questions, maintenant.'],
  fin: ['Merci. C\'est noté.', "Les résultats seront révélés dans l'émission."],
};

// --- Outils ------------------------------------------------------------------------------
// Typographie française : l'apostrophe courbe, et une espace fine insécable avant ? ! ; : %, et
// dans les guillemets (écrite \u202f : une fine collée dans le code se perd facilement en espace normale)
const FINE = '\u202f';
const typo = (s) => s
  .replace(/'/g, '\u2019')
  .replace(/ ([?!;:])/g, `${FINE}$1`)
  .replace(/(\d) %/g, `$1${FINE}%`)
  .replace(/« /g, `«${FINE}`).replace(/ »/g, `${FINE}»`);
const MOT = "[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]+(?:[’'][A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]+)*";
const SUITE_CAPS = new RegExp(`${MOT}(?:\\s+${MOT})*`, 'g');
function riche(s) {                    // les mots en capitales du questionnaire restent appuyés, sans crier
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
  n.append(...enfants.filter((x) => x != null && x !== false));   // une aide absente n'écrit pas « null »
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
const nombre = (n) => n.toLocaleString('fr-FR');
const attendre = (ms) => new Promise((r) => setTimeout(r, instantane() ? 0 : ms));
const clic = (b) => new Promise((r) => b.addEventListener('click', () => r(), { once: true }));
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

// --- L'œil de Phi : il se pose près de ce qu'il dit, tient le stylo quand la machine dessine,
// et suit l'aiguille quand la journée tourne -------------------------------------------------
const oeilEl = document.getElementById('phi-oeil');
const place = document.getElementById('phi-place');
const tete = document.getElementById('tete');
const oeil = window.XphiOeil ? window.XphiOeil.create(oeilEl, { small: true }) : null;
const E = { x: 0, y: 0, init: false, stylo: null, regard: null, point: null, expr: 'neutre', parle: 0, cligne: -1 };
function regarder(b) {
  b.addEventListener('pointerenter', () => { E.regard = b; });
  b.addEventListener('focus', () => { E.regard = b; });
  b.addEventListener('pointerleave', () => { if (E.regard === b) E.regard = null; });
  b.addEventListener('blur', () => { if (E.regard === b) E.regard = null; });
}
function boucleOeil(now) {
  const T_ = now / 1000;
  const r = place.getBoundingClientRect();
  const repos = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  const cible = E.stylo || repos;
  if (!E.init) { E.x = repos.x; E.y = repos.y; E.init = true; }
  const k = VITE ? 1 : E.stylo ? 0.4 : 0.2;
  E.x += (cible.x - E.x) * k;
  E.y += (cible.y - E.y) * k;
  oeilEl.style.transform = `translate(${E.x.toFixed(1)}px, ${E.y.toFixed(1)}px)`;
  oeilEl.style.opacity = !E.stylo && repos.y < tete.getBoundingClientRect().bottom + 8 ? 0 : 1;
  let look = null;
  const vers = (p) => ({ x: clamp((p.x - E.x) / 45, -5, 5), y: clamp((p.y - E.y) / 45, -5, 5) });
  if (E.regard && E.regard.isConnected) { const b = E.regard.getBoundingClientRect(); look = vers({ x: b.left + b.width / 2, y: b.top + b.height / 2 }); }
  else if (E.stylo) look = { x: 0, y: 3.5 };
  else if (E.point) look = vers(E.point);
  let blink = null;
  if (E.cligne >= 0) {
    const u = T_ - E.cligne;
    if (u > 0.22) E.cligne = -1;
    else blink = 1 - Math.sin((Math.PI * u) / 0.22);
  }
  oeil?.draw(T_, { expr: E.expr, talk: T_ < E.parle, look, blink });
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
function pointEcran(n, s) {
  const p = n.getPointAtLength(s), m = n.getScreenCTM();
  return { x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f };
}
// Chaque trait apparaît à vitesse constante, comme sous la plume d'un traceur ; data-v : pixels par seconde
async function tracer(racine) {
  const pl = prendrePlume();
  const traits = [...racine.querySelectorAll('.trait')].filter((t) => t.getTotalLength() > 0.5);
  if (racine.classList?.contains('trait') && racine.getTotalLength() > 0.5) traits.unshift(racine);
  const apres = [...racine.querySelectorAll('.apres')];
  for (const t of traits) {
    const L_ = t.getTotalLength();
    t.dataset.l = L_;
    t.style.strokeDasharray = `${L_} ${L_}`;
    t.style.strokeDashoffset = instantane() ? 0 : L_;
  }
  apres.forEach((a) => { a.style.opacity = instantane() ? 1 : 0; });
  racine.classList?.remove('a-tracer');
  if (!instantane()) {
    const actif = () => pl.aMoi() && racine.isConnected;
    for (const t of traits) {
      if (!actif() || instantane()) break;
      const L_ = +t.dataset.l;
      pl.poser(pointEcran(t, 0));
      await attendre(70);
      await anim(Math.max(100, (L_ / (+t.dataset.v || 700)) * 1000), (k) => {
        t.style.strokeDashoffset = L_ * (1 - k);
        if (actif()) pl.poser(pointEcran(t, L_ * k)); else pl.lever();
      });
    }
  }
  traits.forEach((t) => { t.style.strokeDashoffset = 0; t.style.strokeDasharray = ''; });
  pl.lever();
  if (racine.isConnected) await anim(260, (k) => apres.forEach((a) => { a.style.opacity = k; }));
  apres.forEach((a) => { a.style.opacity = 1; });
}
async function effacer(...noeuds) {
  const n = noeuds.flat().filter(Boolean);
  await anim(220, (k) => n.forEach((x) => { x.style.opacity = 1 - k; }));
  n.forEach((x) => x.remove());
}

// --- La scène ---------------------------------------------------------------------------
// Deux mises en page, choisies une fois au chargement : en large, le cadran à gauche et les
// gens à droite ; en étroit (téléphone), le cadran en haut à gauche et les gens en dessous
const sceneEl = document.getElementById('scene');
const svg = document.getElementById('dessin');
const LARGE = {
  W: 600, H: 286, s: 44,
  cad: { cx: 112, cy: 150, R: 96 }, ligne: { x0: 14, x1: 586, y: 272 }, compteur: { x: 0, y: 12 }, joueur: 46, dj: 4,
  alice: [282, 68], bulle: { x: 306, w: 214, lignes: 1 }, pizza: [552, 60, 15], compteAlice: [600, 97],
  bob: [282, 152], voisinBob: [412, 152], charlie: [282, 226], voisinCharlie: [412, 226],
  barres: { x: 318, y: 114, pas: 21, lab: 92, l: 146 }, harry: [282, 232], voisinHarry: [412, 232],
};
const ETROIT = {
  W: 360, H: 344, s: 40,
  cad: { cx: 72, cy: 106, R: 64 }, ligne: { x0: 10, x1: 350, y: 332 }, compteur: { x: 0, y: 12 }, joueur: 38, dj: -2,
  alice: [176, 56], bulle: { x: 196, w: 162, lignes: 2 }, pizza: [336, 104, 12], compteAlice: [360, 136],
  bob: [30, 222], voisinBob: [166, 222], charlie: [30, 290], voisinCharlie: [166, 290],
  barres: { x: 150, y: 150, pas: 19, lab: 90, l: 72 }, harry: [30, 262], voisinHarry: [166, 262],
};
const L = (sceneEl.clientWidth || 600) >= 520 ? LARGE : ETROIT;
svg.setAttribute('viewBox', `0 0 ${L.W} ${L.H}`);
const ajusterHauteur = () => sceneEl.style.setProperty('--h', `${Math.round(((sceneEl.clientWidth || L.W) * L.H) / L.W)}px`);
ajusterHauteur();
window.addEventListener('resize', ajusterHauteur);
const versEcran = (x, y) => { const m = svg.getScreenCTM(); return m ? { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f } : null; };
const calque = (nom) => { const g = sv('g', { class: nom }); svg.append(g); return g; };
const gCadran = calque('cadran'), gMonde = calque('monde'), gJoueur = calque('joueur-calque'), gHaut = calque('haut');
const S = { n: 1, souvenirs: [], jetables: [], morts: [], gens: {}, comptes: {} };
const sc = {
  ouvrir() { tete.classList.remove('rangee'); },
  ranger() { tete.classList.add('rangee'); },
  decrire(t) { sceneEl.setAttribute('aria-label', t); },
};

// Un humain, en modèle : un rond, un corps, un nom
function personne([x, y], nom, { s = L.s, classe = '' } = {}) {
  const hr = 0.14 * s, hy = y - 0.17 * s, bw = 0.26 * s, bb = y + 0.36 * s, bh = 0.34 * s;
  const corps = `M${x - bw} ${bb}A${bw} ${bh} 0 0 1 ${x + bw} ${bb}Z`;
  return sv('g', { class: `personne ${classe}` },
    sv('circle', { class: 'plein apres', cx: x, cy: hy, r: hr }),
    sv('path', { class: 'plein apres', d: corps }),
    sv('circle', { class: 'trait', cx: x, cy: hy, r: hr, 'data-v': 500 }),
    sv('path', { class: 'trait', d: corps, 'data-v': 500 }),
    sv('text', { class: 'nom apres', x, y: bb + 13, 'text-anchor': 'middle' }, nom));
}
const tete_ = ([x, y], s = L.s) => [x, y - 0.17 * s];
const centreJoueur = () => [L.cad.cx, L.cad.cy + L.dj];

// --- Le cadran : la journée en cercle, qui pourra se dérouler en droite ----------------------
const D = { e: 0, u: 0 };                     // e : 0 = cadran, 1 = droite ; u : l'heure (0 → 1)
const NP = 144;
const pAnneau = (u, dr) => { const a = 2 * Math.PI * u; return [L.cad.cx + (L.cad.R + dr) * Math.sin(a), L.cad.cy - (L.cad.R + dr) * Math.cos(a)]; };
const pLigne = (u, dr) => [L.ligne.x0 + u * (L.ligne.x1 - L.ligne.x0), L.ligne.y + dr];   // graduations au-dessus de la droite
const lerp = (a, b, k) => a + (b - a) * k;
// Le déroulé : le cadran se pose au départ de la droite en basculant (0 h passe en bas, au contact),
// puis il roule vers la droite et y dépose la journée, comme un ruban
function pt(u, dr = 0) {
  const e = D.e;
  if (e <= 0) return pAnneau(u, dr);
  if (e >= 1) return pLigne(u, dr);
  const lg = L.ligne.x1 - L.ligne.x0, r = lg / (2 * Math.PI), A = 0.4;
  if (e < A) {
    const k = doux(e / A), a = 2 * Math.PI * u;
    const cx = lerp(L.cad.cx, L.ligne.x0, k), cy = lerp(L.cad.cy, L.ligne.y - r, k), R = lerp(L.cad.R, r, k);
    return [cx + (R + dr) * Math.sin(a), cy - (R + dr) * Math.cos(a) * Math.cos(Math.PI * k)];
  }
  const k = (e - A) / (1 - A);
  if (u <= k) return pLigne(u, dr);
  const a = 2 * Math.PI * (u - k);
  return [L.ligne.x0 + k * lg + (r + dr) * Math.sin(a), L.ligne.y - r + (r + dr) * Math.cos(a)];
}
const f1 = (v) => v.toFixed(1);
function trace(u0, u1, dr = 0) {
  const n = Math.max(2, Math.ceil(((u1 - u0) * NP)) + 1);
  let d = '';
  for (let i = 0; i < n; i++) { const [x, y] = pt(u0 + ((u1 - u0) * i) / (n - 1), dr); d += `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`; }
  return d;
}
const C = {};
function construireCadran() {
  C.anneau = sv('path', { class: 'trait anneau', 'data-v': 520 });
  C.graduations = sv('path', { class: 'trait graduation', 'data-v': 1400 });
  C.heures = [0, 6, 12, 18].map((h) => sv('text', { class: 'heure apres', 'text-anchor': 'middle', 'data-h': h }, `${h} h`));
  C.jour = sv('path', { class: 'jour' });
  C.pointe = sv('circle', { class: 'pointe', r: 3.6 });
  C.fleche = sv('path', { class: 'fleche', d: '', style: 'opacity:0' });     // pas « trait » : la plume ne la trace pas, elle n'existe qu'au déroulé
  gCadran.append(C.anneau, C.graduations, ...C.heures, C.jour, C.pointe, C.fleche);
  C.compteur = sv('text', { class: 'compteur', x: L.compteur.x, y: L.compteur.y }, '');
  gHaut.append(C.compteur);
  dessinerCadran();
}
function dessinerCadran() {
  C.anneau.setAttribute('d', trace(0, 1));
  let g = '';
  for (let h = 0; h < 24; h++) {
    const lg = h % 6 ? 5 : 10;
    const [x1, y1] = pt(h / 24, 0), [x2, y2] = pt(h / 24, -lg);
    g += `M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}`;
  }
  C.graduations.setAttribute('d', g);
  for (const t of C.heures) { const [x, y] = pt(+t.dataset.h / 24, -24); t.setAttribute('x', f1(x)); t.setAttribute('y', f1(y + 3.5)); }
  C.jour.setAttribute('d', D.u > 0.002 ? trace(0, D.u) : '');
  const [px, py] = pt(D.u);
  C.pointe.setAttribute('cx', f1(px));
  C.pointe.setAttribute('cy', f1(py));
  C.pointe.style.opacity = D.u > 0.002 || D.e > 0 ? 1 : 0.0001;
}
const compteur = (t) => { C.compteur.textContent = typo(t ?? `BOUCLE N° ${nombre(S.n)}`); };

// --- Les choses de la journée ----------------------------------------------------------------
const PIZZAS = {
  margherita: { nom: 'Margherita', court: 'MARGHERITA', p: 0.5 },
  reine: { nom: 'Reine', court: 'REINE', p: 0.25 },
  fromages: { nom: 'Quatre fromages', court: '4 FROMAGES', p: 0.2 },
  hawaienne: { nom: 'Hawaïenne', court: 'HAWAÏENNE', p: 0.05 },
};
// Une pizza : la croûte, la pâte, et une garniture en formes exactes, une par sorte
function pizza(x, y, r, sorte, { trait = true } = {}) {
  const g = sv('g', { class: 'pizza' },
    sv('circle', { class: trait ? 'trait' : 'trait fin', cx: x, cy: y, r, 'data-v': 600 }),
    sv('circle', { class: 'trait fin', cx: x, cy: y, r: r * 0.76, 'data-v': 600 }));
  const garni = [];
  const autour = (n, d, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + (2 * Math.PI * i) / n; return [x + d * r * Math.cos(a), y + d * r * Math.sin(a)]; });
  if (sorte === 'margherita') autour(3, 0.4, -0.5).forEach(([a, b]) => garni.push(sv('circle', { cx: a, cy: b, r: r * 0.13 })));
  if (sorte === 'reine') autour(4, 0.4, 0.3).forEach(([a, b]) => garni.push(sv('rect', { x: a - r * 0.11, y: b - r * 0.11, width: r * 0.22, height: r * 0.22 })));
  if (sorte === 'fromages') {
    g.append(sv('path', { class: 'trait fin', d: `M${x - r * 0.76} ${y}H${x + r * 0.76}M${x} ${y - r * 0.76}V${y + r * 0.76}`, 'data-v': 600 }));
    autour(4, 0.38, Math.PI / 4).forEach(([a, b]) => garni.push(sv('circle', { cx: a, cy: b, r: r * 0.08 })));
  }
  if (sorte === 'hawaienne') autour(4, 0.4, 0.6).forEach(([a, b]) => garni.push(sv('path', { d: `M${a} ${b - r * 0.13}L${a + r * 0.12} ${b + r * 0.09}L${a - r * 0.12} ${b + r * 0.09}Z` })));
  garni.forEach((n) => n.setAttribute('class', 'plein apres'));
  g.append(...garni);
  return g;
}
// Une bulle de parole, à droite de la personne, la queue vers sa tête
function bulle([x, y], lignes) {
  const b = L.bulle, h = 10 + lignes.length * 14, [, hy] = tete_([x, y]);
  const bx = b.x, by = hy - h / 2, r = 8, w = b.w, ym = hy;
  const d = `M${bx + r} ${by}H${bx + w - r}A${r} ${r} 0 0 1 ${bx + w} ${by + r}V${by + h - r}A${r} ${r} 0 0 1 ${bx + w - r} ${by + h}H${bx + r}A${r} ${r} 0 0 1 ${bx} ${by + h - r}V${ym + 4}L${bx - 9} ${ym + 1}L${bx} ${ym - 4}V${by + r}A${r} ${r} 0 0 1 ${bx + r} ${by}Z`;
  return sv('g', { class: 'parle' },
    sv('path', { class: 'trait bulle', d, 'data-v': 1100 }),
    ...lignes.map((l, i) => sv('text', { class: 'parole apres', x: bx + 10, y: by + 17 + i * 14 }, typo(l))));
}
const phrase = (sorte) => {
  const p = `Une ${PIZZAS[sorte].nom.toLowerCase()}, s'il vous plaît.`;
  return L.bulle.lignes === 1 ? [p] : [`Une ${PIZZAS[sorte].nom.toLowerCase()},`, "s'il vous plaît."];
};
// Une somme d'argent : un billet, au-dessus de l'épaule
function billet([x, y]) {
  const bx = x + 0.3 * L.s, by = y - 0.72 * L.s;
  return sv('g', { class: 'billet' },
    sv('rect', { class: 'trait fin', x: bx, y: by, width: 22, height: 12, 'data-v': 400 }),
    sv('circle', { class: 'trait fin', cx: bx + 11, cy: by + 6, r: 3.4, 'data-v': 400 }));
}
function croix([x, y]) {                          // le refus : le billet barré
  const bx = x + 0.3 * L.s - 3, by = y - 0.72 * L.s - 3;
  return sv('path', { class: 'trait', d: `M${bx} ${by}L${bx + 28} ${by + 18}M${bx + 28} ${by}L${bx} ${by + 18}`, 'data-v': 400 });
}
function tir(a, b) {
  const [x1, y1] = tete_(a), [x2, y2] = tete_(b);
  return sv('path', { class: 'trait', d: `M${x1 + 0.3 * L.s} ${y1}L${x2 - 0.3 * L.s} ${y2}`, 'data-v': 2600 });
}
function compte([x, y], lignes) {                // les relevés du joueur, à droite de chaque rangée
  const g = sv('g', { class: 'releve' });
  lignes.forEach((t, i) => g.append(sv('text', { class: 'compte', x, y: y + i * 13, 'text-anchor': 'end' }, typo(t))));
  return g;
}
const majCompte = (g, lignes) => lignes.forEach((t, i) => { if (g.children[i]) g.children[i].textContent = typo(t); });

// --- Les gestes de la journée -----------------------------------------------------------------
const posDe = (qui) => L[qui];
function commande(sorte) {
  const b = bulle(L.alice, phrase(sorte)), p = pizza(L.pizza[0], L.pizza[1], L.pizza[2], sorte);
  p.classList.add('a-tracer');
  gMonde.append(b, p);
  S.jetables.push(b, p);
  tracer(b).then(() => tracer(p));
}
function offre(qui) {
  const b = billet(posDe(qui));
  gMonde.append(b);
  S.jetables.push(b);
  tracer(b);
}
function tire(qui, voisin) {
  const t = tir(posDe(qui), posDe(voisin));
  gMonde.append(t);
  S.jetables.push(t);
  tracer(t);
  S.gens[voisin]?.classList.add('mort');
  S.morts.push(S.gens[voisin]);
}
function refuse(qui) {
  const c = croix(posDe(qui));
  gMonde.append(c);
  S.jetables.push(c);
  tracer(c);
}
// Le joueur parle : une ligne dorée, de lui vers la tête de l'autre, qui pousse sous la plume
async function dissuade(qui) {
  const [x1, y1] = tete_(centreJoueur(), L.joueur), [x2, y2] = tete_(posDe(qui));
  const tx = x2 - 0.32 * L.s, ty = y2;
  const ligne = sv('path', { class: 'trait dore', style: 'stroke-dasharray:4 3' });
  const mots = sv('g', {}, ...[0, 1, 2].map((i) => sv('circle', { class: 'souvenir', cx: tx - 14 + i * 5, cy: ty - 12, r: 1.6 })));
  mots.style.opacity = 0;
  gMonde.append(ligne, mots);
  S.jetables.push(ligne, mots);
  const pl = prendrePlume();
  await anim(500, (k) => {
    const x = x1 + (tx - x1) * k, y = y1 + (ty - y1) * k;
    ligne.setAttribute('d', `M${f1(x1)} ${f1(y1)}L${f1(x)} ${f1(y)}`);
    const p = versEcran(x, y);
    if (p) pl.poser(p);
  });
  pl.lever();
  mots.style.opacity = 1;
}

// Une journée : l'aiguille fait le tour du cadran ; chaque chose arrive à son heure
// (de, a : une portion de journée ; une étape peut s'arrêter à 16 h 48, et la suivante reprendre là)
async function journee({ de = 0, a = 1, duree = 2400, evenements = [] } = {}) {
  const faits = new Set();
  await anim(duree, (k) => {
    const u = de + (a - de) * k;
    D.u = u;
    dessinerCadran();
    const [x, y] = pt(u);
    E.point = versEcran(x, y);
    evenements.forEach((ev, i) => { if (!faits.has(i) && u >= ev.t) { faits.add(i); ev.f(); } });
  });
  evenements.forEach((ev, i) => { if (!faits.has(i) && ev.t <= a) ev.f(); });
  E.point = null;
}
// Au bout de la journée, tout revient au même état, sauf la mémoire du joueur
async function remise({ souvenir = true } = {}) {
  const jet = S.jetables.splice(0);
  const morts = S.morts.splice(0);
  await Promise.all([
    anim(280, (k) => { D.u = 1 - k; dessinerCadran(); }),
    effacer(jet),
  ]);
  morts.forEach((m) => m?.classList.remove('mort'));
  S.n += 1;
  compteur();
  if (souvenir) ajouterSouvenir();
}
function ajouterSouvenir() {
  const i = S.souvenirs.length;
  if (i >= 24 || !S.joueurG) return;
  const sp = L.joueur * 0.11, x = L.cad.cx + (i % 12 - 5.5) * sp, y = centreJoueur()[1] - 0.31 * L.joueur - 8 - Math.floor(i / 12) * sp;
  const d = sv('circle', { class: 'souvenir', cx: f1(x), cy: f1(y), r: 1.8 });
  gJoueur.append(d);
  S.souvenirs.push(d);
}
// Un très grand nombre de journées : l'aiguille tourne vite, le compteur défile
async function avance(nFin, duree, surImage) {
  const n0 = S.n;
  await anim(duree, (k) => {
    const e = doux(k);
    S.n = Math.round(n0 + (nFin - n0) * e);
    compteur();
    D.u = (k * 7) % 1;
    dessinerCadran();
    surImage?.(e);
  });
  S.n = nFin;
  compteur();
  D.u = 0;
  dessinerCadran();
  for (let i = 0; i < 6; i++) ajouterSouvenir();
}
// Sortir de la boucle : le cadran se déroule en une droite, le temps reprend sa course
async function derouler(sens = 1) {
  C.heures.forEach((t) => { t.style.transition = 'opacity .3s'; t.style.opacity = 0; });
  if (sens < 0) C.fleche.style.opacity = 0;
  await anim(2000, (k) => { D.e = sens > 0 ? k : 1 - k; dessinerCadran(); });
  D.e = sens > 0 ? 1 : 0;
  dessinerCadran();
  if (sens < 0) C.heures.forEach((t) => { t.style.opacity = 1; });
  const [x, y] = pLigne(1, 0);
  C.fleche.setAttribute('d', `M${x - 8} ${y - 5}L${x} ${y}L${x - 8} ${y + 5}`);
  C.fleche.style.opacity = sens > 0 ? 1 : 0;
}
// Ce que dit le texte, en relevé : ni besoin vital, ni pression, ni menace. Une accolade le relie
// aux personnes concernées (Bob et Charlie ensemble, ou Harry seul)
function conditions(...qui) {
  const ys = qui.map((q) => L[q][1]), y0 = Math.min(...ys), y1 = Math.max(...ys), ym = (y0 + y1) / 2;
  const xa = L.W - 140, lignes = ['AUCUN BESOIN VITAL', 'AUCUNE PRESSION', 'AUCUNE MENACE'];
  const haut = y0 === y1 ? ym - 16 : y0 - 6, bas = y0 === y1 ? ym + 16 : y1 - 6;
  return sv('g', { class: 'conditions' },
    sv('path', { class: 'trait fin', d: `M${xa + 6} ${haut}H${xa}V${bas}H${xa + 6}`, 'data-v': 500 }),
    ...lignes.map((t, i) => sv('text', { class: 'compte apres', x: L.W, y: ym - 9 + i * 12, 'text-anchor': 'end' }, t)));
}
// La contrainte physique : un cadre doré, celui du joueur, qui retient Charlie
function contrainte(qui) {
  const [x, y] = posDe(qui), s = L.s;
  return sv('rect', { class: 'trait dore', x: x - 0.55 * s, y: y - 0.48 * s, width: 1.1 * s, height: 0.84 * s, 'data-v': 700, style: 'stroke-width:2.2' });
}
function reperer(qui) {                          // pendant les questions : un cercle autour de celui dont on parle
  svg.querySelectorAll('.repere').forEach((r) => r.remove());
  if (!qui) return;
  const [x, y] = posDe(qui), s = L.s;
  gMonde.append(sv('rect', { class: 'repere', x: x - 0.62 * s, y: y - 0.5 * s, width: 1.24 * s, height: 0.86 * s + 18, rx: 8 }));
}

// --- Ce que fait la scène, à chaque temps de l'histoire ----------------------------------------
const H = { alice: 0.52, offre: 0.7, dissuade: 0.45, tir: 0.875 };     // 12 h 30, 16 h 48, 10 h 48, 21 h
const ANIM = {
  // --- La mise en situation : le cadran, le joueur, et rien d'autre avant la première question
  async a1() {
    sc.ouvrir();
    sc.decrire('Une journée, en cadran de vingt-quatre heures. L’aiguille en fait le tour, et recommence.');
    await attendre(450);
    construireCadran();
    compteur();
    await tracer(gCadran);
    await journee({ duree: 2600 });
    await remise({ souvenir: false });
  },
  async a2() {
    sc.decrire('Le joueur, en doré, au milieu du cadran.');
    S.joueurG = personne(centreJoueur(), 'VOUS', { s: L.joueur, classe: 'joueur' });
    gJoueur.append(S.joueurG);
    await tracer(S.joueurG);
    await journee({ duree: 1900 });
    await remise();
  },
  async a3() {
    sc.decrire('À chaque tour, tout revient au même état ; les souvenirs du joueur, en points dorés, s’accumulent.');
    for (let i = 0; i < 3; i++) { await journee({ duree: 1500 }); await remise(); }
  },
  // --- La première histoire : tout se répète
  async b1() {
    sc.decrire('Alice commande une margherita, avec les mêmes mots, à chaque tour.');
    S.gens.alice = personne(L.alice, 'ALICE');
    gMonde.append(S.gens.alice);
    await tracer(S.gens.alice);
    S.comptes.alice = compte(L.compteAlice, ['MARGHERITA · 0 / 0']);
    gMonde.append(S.comptes.alice);
    S.aliceN = 0;
    for (let i = 1; i <= 3; i++) {
      await journee({ duree: 2000, evenements: [{ t: H.alice, f: () => commande('margherita') }] });
      S.aliceN = i;
      majCompte(S.comptes.alice, [`MARGHERITA · ${i} / ${i}`]);
      await attendre(300);
      await remise();
    }
  },
  async b2() {
    sc.decrire('Bob et Charlie, chacun à côté de son voisin. On leur propose de l’argent. Ni besoin vital, ni pression, ni menace.');
    for (const [qui, nom] of [['bob', 'BOB'], ['voisinBob', 'SON VOISIN'], ['charlie', 'CHARLIE'], ['voisinCharlie', 'SON VOISIN']]) {
      S.gens[qui] = personne(L[qui], nom);
      gMonde.append(S.gens[qui]);
      await tracer(S.gens[qui]);
    }
    // la journée avance jusqu'à la proposition, et s'arrête là
    await journee({ a: H.offre + 0.02, duree: 2200, evenements: [
      { t: H.alice, f: () => commande('margherita') },
      { t: H.offre, f: () => { offre('bob'); offre('charlie'); } },
    ] });
    S.conditions = conditions('bob', 'charlie');
    gMonde.append(S.conditions);
    await tracer(S.conditions);
  },
  async b3() {
    sc.decrire('Sans intervention, Bob et Charlie acceptent et tirent, à chaque boucle.');
    await journee({ de: H.offre + 0.02, duree: 1100, evenements: [{ t: H.tir, f: () => { tire('bob', 'voisinBob'); tire('charlie', 'voisinCharlie'); } }] });
    await attendre(500);
    await effacer(S.conditions);
    S.comptes.bob = compte([L.W, L.bob[1] - 8], ['TIRE · 1 / 1']);
    S.comptes.charlie = compte([L.W, L.charlie[1] - 8], ['TIRE · 1 / 1']);
    gMonde.append(S.comptes.bob, S.comptes.charlie);
    S.aliceN += 1;
    majCompte(S.comptes.alice, [`MARGHERITA · ${S.aliceN} / ${S.aliceN}`]);
    await remise();
    const a0 = S.aliceN;
    await avance(S.n + 999, 2400, (e) => {
      const k = 1 + Math.round(999 * e), a = a0 + Math.round(999 * e);
      majCompte(S.comptes.bob, [`TIRE · ${nombre(k)} / ${nombre(k)}`]);
      majCompte(S.comptes.charlie, [`TIRE · ${nombre(k)} / ${nombre(k)}`]);
      majCompte(S.comptes.alice, [`MARGHERITA · ${nombre(a)} / ${nombre(a)}`]);
    });
    S.aliceN = a0 + 999;
  },
  async b4() {
    sc.decrire('Le joueur essaie de dissuader Bob : Bob change d’avis, refuse, et ne tire pas.');
    S.comptes.bob.append(sv('text', { class: 'compte', x: L.W, y: L.bob[1] + 5, 'text-anchor': 'end' }, typo('DISSUADÉ · 0 / 0')));
    await journee({ duree: 3000, evenements: [
      { t: H.dissuade, f: () => dissuade('bob') },
      { t: H.alice, f: () => commande('margherita') },
      { t: H.offre, f: () => { offre('bob'); offre('charlie'); } },
      { t: H.offre + 0.05, f: () => refuse('bob') },
      { t: H.tir, f: () => tire('charlie', 'voisinCharlie') },
    ] });
    S.comptes.bob.lastChild.textContent = typo('DISSUADÉ · 1 / 1');
    await attendre(500);
    await remise();
    await avance(S.n + 39, 1500, (e) => { const k = 1 + Math.round(39 * e); S.comptes.bob.lastChild.textContent = typo(`DISSUADÉ · ${k} / ${k}`); });
  },
  async b5() {
    sc.decrire('Le joueur essaie de dissuader Charlie : Charlie ne change jamais d’avis, et tire.');
    S.comptes.charlie.append(sv('text', { class: 'compte', x: L.W, y: L.charlie[1] + 5, 'text-anchor': 'end' }, typo('DISSUADÉ · 0 / 0')));
    await journee({ duree: 3000, evenements: [
      { t: H.dissuade, f: () => dissuade('charlie') },
      { t: H.alice, f: () => commande('margherita') },
      { t: H.offre, f: () => { offre('bob'); offre('charlie'); } },
      { t: H.tir, f: () => { tire('bob', 'voisinBob'); tire('charlie', 'voisinCharlie'); } },
    ] });
    S.comptes.charlie.lastChild.textContent = typo('DISSUADÉ · 0 / 1');
    await attendre(500);
    await remise();
    await avance(S.n + 39, 1500, (e) => { S.comptes.charlie.lastChild.textContent = typo(`DISSUADÉ · 0 / ${1 + Math.round(39 * e)}`); });
  },
  async b6() {
    sc.decrire('Les seules fois où Charlie ne tire pas : le joueur le retient de force.');
    await journee({ duree: 2800, evenements: [
      { t: H.alice, f: () => commande('margherita') },
      { t: H.offre, f: () => { offre('bob'); offre('charlie'); } },
      { t: H.offre + 0.06, f: () => { const c = contrainte('charlie'); gMonde.append(c); S.jetables.push(c); tracer(c); } },
      { t: H.tir, f: () => tire('bob', 'voisinBob') },
    ] });
    await attendre(700);
    await remise();
  },
  async b7() {
    sc.decrire('Le joueur, enfermé dans son laboratoire.');
    C.heures.forEach((t) => { t.style.transition = 'opacity .3s'; t.style.opacity = 0; });
    const [x, y] = centreJoueur(), c = L.joueur * 0.95;
    S.labo = sv('g', { class: 'labo' },
      sv('rect', { class: 'trait', x: x - c, y: y - c - 4, width: 2 * c, height: 2 * c, 'data-v': 600 }),
      sv('text', { class: 'etiquette apres', x, y: y - c - 10, 'text-anchor': 'middle' }, 'LABORATOIRE'));
    gJoueur.append(S.labo);
    await tracer(S.labo);
  },
  async b8() {
    sc.decrire('Le cadran se déroule : le temps reprend sa course. Bob et Charlie tirent.');
    compteur('LE TEMPS REPART');
    await derouler(1);
    await journee({ duree: 3200, evenements: [
      { t: H.alice, f: () => commande('margherita') },
      { t: H.offre, f: () => { offre('bob'); offre('charlie'); } },
      { t: H.tir, f: () => { tire('bob', 'voisinBob'); tire('charlie', 'voisinCharlie'); } },
    ] });
    await attendre(500);
  },
  // --- La seconde histoire : on reprend depuis le début, et les gens ne se répètent plus
  async c1() {
    sc.decrire('On reprend depuis le début. Le cadran se reforme.');
    reperer(null);
    const partir = [S.labo, S.comptes.bob, S.comptes.charlie, S.comptes.alice, ...['bob', 'voisinBob', 'charlie', 'voisinCharlie'].map((q) => S.gens[q]), ...S.jetables.splice(0)];
    S.morts.splice(0);
    await Promise.all([effacer(partir), effacer(S.souvenirs.splice(0))]);
    for (const q of ['bob', 'voisinBob', 'charlie', 'voisinCharlie']) delete S.gens[q];
    await derouler(-1);
    D.u = 0;
    dessinerCadran();
    S.n = 1;
    compteur();
    for (const sorte of ['reine', 'margherita']) {
      await journee({ duree: 1700, evenements: [{ t: H.alice, f: () => commande(sorte) }] });
      await attendre(250);
      await remise();
    }
  },
  async c2() {
    sc.decrire('Les relevés de pizzas : margherita 50 %, reine 25 %, quatre fromages 20 %, hawaïenne 5 %.');
    const b = L.barres, sortes = Object.keys(PIZZAS);
    S.barres = sortes.map((sorte, i) => {
      const y = b.y + i * b.pas;
      const fond = sv('rect', { class: 'barre-fond', x: b.x + b.lab, y: y - 6, width: b.l, height: 8 });
      const barre = sv('rect', { class: 'barre', x: b.x + b.lab, y: y - 6, width: 0, height: 8 });
      const pc = sv('text', { class: 'compte', x: L.W, y: y + 1.5, 'text-anchor': 'end' }, '—');
      const g = sv('g', { class: 'ligne-barre' }, pizza(b.x + 7, y - 2, 7, sorte, { trait: false }),
        sv('text', { class: 'etiquette', x: b.x + 20, y: y + 1.5 }, PIZZAS[sorte].court), fond, barre, pc);
      gMonde.append(g);
      return { sorte, barre, pc, g };
    });
    await anim(300, (k) => S.barres.forEach((r) => { r.g.style.opacity = k; }));
    S.montrerBarres = (parts) => S.barres.forEach((r, i) => {
      r.barre.setAttribute('width', f1(b.l * parts[i]));
      r.pc.textContent = typo(`${Math.round(parts[i] * 100)} %`);
    });
    const tirage = ['margherita', 'fromages', 'margherita'];
    const comptes = [1, 1, 0, 0];                        // les deux journées de l'étape d'avant : une reine, une margherita
    S.montrerBarres(comptes.map((c) => c / 2));
    for (const [i, sorte] of tirage.entries()) {
      await journee({ duree: 1500, evenements: [{ t: H.alice, f: () => commande(sorte) }] });
      comptes[sortes.indexOf(sorte)] += 1;
      S.montrerBarres(comptes.map((c) => c / (i + 3)));
      await attendre(200);
      await remise();
    }
    const cible = sortes.map((s) => PIZZAS[s].p), depart = comptes.map((c) => c / 5);
    await avance(1000, 2600, (e) => {
      const bruit = (1 - e) * (1 - e);
      const parts = cible.map((c, i) => Math.max(0, c + (depart[i] - c) * bruit + (1 - e) * 0.05 * Math.sin(e * 40 + i * 2)));
      const somme = parts.reduce((a, v) => a + v, 0);
      S.montrerBarres(parts.map((v) => v / somme));
    });
    S.montrerBarres(cible);
  },
  async c3() {
    sc.decrire('Harry, à côté de son voisin. On lui propose de l’argent. Ni besoin vital, ni pression, ni menace.');
    for (const [qui, nom] of [['harry', 'HARRY'], ['voisinHarry', 'SON VOISIN']]) {
      S.gens[qui] = personne(L[qui], nom);
      gMonde.append(S.gens[qui]);
      await tracer(S.gens[qui]);
    }
    await journee({ a: H.offre + 0.02, duree: 2200, evenements: [
      { t: H.alice, f: () => commande('reine') },
      { t: H.offre, f: () => offre('harry') },
    ] });
    S.conditions = conditions('harry');
    gMonde.append(S.conditions);
    await tracer(S.conditions);
  },
  async c4() {
    sc.decrire('Harry tire dans la moitié des boucles, et refuse dans l’autre moitié.');
    await journee({ de: H.offre + 0.02, duree: 1100, evenements: [{ t: H.tir, f: () => tire('harry', 'voisinHarry') }] });
    await attendre(400);
    await effacer(S.conditions);
    S.comptes.harry = compte([L.W, L.harry[1] - 8], ['TIRE · 100 % · REFUSE · 0 %']);
    gMonde.append(S.comptes.harry);
    await remise();
    await journee({ duree: 2400, evenements: [
      { t: H.alice, f: () => commande('margherita') },
      { t: H.offre, f: () => offre('harry') },
      { t: H.offre + 0.08, f: () => refuse('harry') },
    ] });
    majCompte(S.comptes.harry, ['TIRE · 50 % · REFUSE · 50 %']);
    await attendre(300);
    await remise();
    await avance(2000, 2400, (e) => {
      const p = 0.5 + (1 - e) * 0.12 * Math.sin(e * 30);
      majCompte(S.comptes.harry, [`TIRE · ${Math.round(100 * p)} % · REFUSE · ${100 - Math.round(100 * p)} %`]);
    });
    majCompte(S.comptes.harry, ['TIRE · 50 % · REFUSE · 50 %']);
  },
  async c5() {
    sc.decrire('Le joueur sort de la boucle : le cadran se déroule. Ce jour-là, Harry accepte, et tire.');
    compteur('LE TEMPS REPART');
    await derouler(1);
    await journee({ duree: 3200, evenements: [
      { t: H.alice, f: () => commande('margherita') },
      { t: H.offre, f: () => offre('harry') },
      { t: H.tir, f: () => tire('harry', 'voisinHarry') },
    ] });
    await attendre(500);
  },
  async c6() {
    sc.decrire('Les relevés, de nouveau : ce jour-là a suivi la même répartition.');
    const cible = Object.keys(PIZZAS).map((s) => PIZZAS[s].p);
    await anim(500, (k) => S.montrerBarres(cible.map((c) => c * (1 - doux(k)))));
    await anim(1200, (k) => S.montrerBarres(cible.map((c) => c * doux(k))));
    S.montrerBarres(cible);
  },
};

// --- Les écrans ---------------------------------------------------------------------------
const ecran = document.getElementById('ecran');
const phiDit = document.getElementById('phi-dit');
const passer = document.getElementById('passer');
passer.addEventListener('click', () => { presse = true; passer.hidden = true; });
document.addEventListener('click', (e) => { if (e.target.closest?.('button') && !e.target.closest('#passer')) presse = false; }, true);
async function sequence(f) {
  passer.hidden = instantane();
  try { await f(); } finally { passer.hidden = true; }
}
const ETAPES = ['accueil', 'a1', 'a2', 'a3', 'q1', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'bob-libre', 'bob-resp', 'charlie-libre', 'charlie-resp',
  'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'harry-libre', 'harry-resp', 'profil', 'consentement', 'remarques', 'fin'];
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
async function montrer(contenu, phi = []) {
  presse = false;
  if (!instantane() && ecran.childNodes.length) { ecran.classList.add('sort'); await attendre(220); }
  ecran.replaceChildren(...[].concat(contenu).filter(Boolean));
  dire(phi);
  ecran.classList.remove('sort');
  if (!instantane()) {
    ecran.classList.add('entre');
    requestAnimationFrame(() => requestAnimationFrame(() => ecran.classList.remove('entre')));
  }
  window.scrollTo({ top: 0, behavior: instantane() ? 'auto' : 'smooth' });
}
const suite = (texte = 'Suite') => el('button', { class: 'suite', type: 'button' }, texte);
const question = (q) => el('h2', { class: 'question' }, riche(q));
function options(liste, { auto = true, classe = 'option', echelle = false, multi = false } = {}) {
  const node = el('div', { class: classe === 'option' ? `options${echelle ? ' echelle' : ''}` : 'pastilles' });
  let valeur = multi ? new Set() : null;
  let resoudre;
  const choix = new Promise((r) => { resoudre = r; });
  const boutons = liste.map((o, i) => {
    const b = el('button', { class: classe, type: 'button', 'aria-pressed': 'false' }, typo(o));
    regarder(b);
    b.addEventListener('click', () => {
      if (multi) {
        if (valeur.has(i)) valeur.delete(i); else valeur.add(i);
        b.classList.toggle('pris', valeur.has(i));
        b.setAttribute('aria-pressed', String(valeur.has(i)));
        return;
      }
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
  return { node, choix, valeur: () => (multi ? [...valeur] : valeur) };
}

// Une étape du récit : une ou deux phrases, et la scène qui les dessine. « Suite » est là tout de
// suite : avant la fin de l'animation, elle la termine d'un coup. Entrée ou → font « Suite ».
async function temps(nom) {
  etape(nom);
  const { texte, aparte } = PAS[nom];
  const b = suite();
  const ok = clic(b);
  E.expr = 'neutre';
  await montrer([el('p', { class: 'pas' }, riche(texte)), aparte && el('p', { class: 'aparte' }, typo(aparte)), b]);
  E.parle = performance.now() / 1000 + Math.min(4, texte.length * 0.03);
  const fini = sequence(ANIM[nom]).catch((e) => console.error('animation', nom, e)).then(pret);
  if (rapide) { await fini; return; }
  await ok;
  presse = true;
  await fini;
}
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === 'ArrowRight') && !e.target.closest?.('input, textarea, button')) {
    const b = ecran.querySelector('button.suite:not(:disabled)');
    if (b) { e.preventDefault(); b.click(); }
  }
});

// --- Le parcours ---------------------------------------------------------------------------
const J = {};
async function ecranAccueil() {
  etape('accueil');
  const b = suite('Commencer');
  await montrer([b], PHI.accueil);
  pret();
  if (rapide) return;
  await clic(b);
}
async function ecranQ1() {
  etape('q1');
  const o = options(Q1.options);
  E.expr = 'curieux';
  await montrer([question(Q1.q), o.node]);
  pret();
  return rapide ? 0 : o.choix;
}
async function ecranLikert(id) {
  const q = QUESTIONS[id];
  etape(id);
  reperer(q.qui);
  const o = options(LIKERT, { echelle: true });
  E.expr = 'curieux';
  await montrer([question(q.q), q.aide && el('p', { class: 'aide' }, typo(q.aide)), o.node]);
  pret();
  return LIKERT[rapide ? 2 : await o.choix];
}
async function ecranProfil() {
  etape('profil');
  reperer(null);
  sc.ranger();
  const rep = {};
  const champs = PROFIL.champs.map((c) => {
    const titre = (t) => el('p', {}, typo(t));
    const aide = c.aide ? el('p', { class: 'aide' }, typo(c.aide)) : null;
    if (c.texte) {
      const saisie = el('input', { type: 'text', id: `p-${c.id}`, autocomplete: 'off' });
      saisie.addEventListener('input', () => { rep[c.id] = saisie.value.trim(); });
      return el('div', { class: 'champ' }, el('label', { for: `p-${c.id}` }, typo(c.label)), saisie);
    }
    if (c.grille) {
      const lignes = c.lignes.map((l) => {
        const o = options(LIKERT, { auto: false, classe: 'pastille' });
        o.node.addEventListener('click', () => { if (o.valeur() !== null) rep[`${c.id} : ${l}`] = LIKERT[o.valeur()]; });
        return el('div', { class: 'ligne' }, el('p', {}, typo(l)), o.node);
      });
      return el('div', { class: 'champ' }, titre(c.label), aide, el('div', { class: 'grille' }, ...lignes));
    }
    const o = options(c.options, { auto: false, classe: 'pastille', multi: !!c.multi });
    o.node.addEventListener('click', () => {
      const v = o.valeur();
      if (c.multi) rep[c.id] = v.map((i) => c.options[i]).join(', ');
      else if (v !== null) rep[c.id] = c.options[v];
    });
    return el('div', { class: 'champ' }, titre(c.label), aide, o.node);
  });
  const b = suite('Continuer');
  E.expr = 'neutre';
  await montrer([question(PROFIL.titre), el('p', { class: 'aide' }, typo(PROFIL.aide)), ...champs, b]);
  pret();
  if (rapide) return {};
  await clic(b);
  return Object.fromEntries(Object.entries(rep).filter(([, v]) => v));
}
async function ecranConsentement() {
  etape('consentement');
  const b = suite('Continuer');
  b.disabled = true;
  const o = options(CONSENTEMENT.options, { auto: false });
  o.node.addEventListener('click', () => { b.disabled = o.valeur() === null; });
  E.expr = 'neutre';
  await montrer([el('p', { class: 'texte' }, typo(CONSENTEMENT.texte)), question(CONSENTEMENT.q), o.node, b]);
  pret();
  if (rapide) return CONSENTEMENT.options[0];
  await clic(b);
  return CONSENTEMENT.options[o.valeur()];
}
async function ecranRemarques() {
  etape('remarques');
  const zone = el('textarea', { id: 'remarques' });
  const b = suite('Terminer');
  E.expr = 'neutre';
  await montrer([question("C'est la fin !"), el('div', { class: 'champ' }, el('label', { for: 'remarques' }, typo('Une remarque ? (facultatif)')), zone), b]);
  pret();
  if (rapide) return '';
  await clic(b);
  return zone.value.trim();
}
async function ecranFin() {
  etape('fin');
  const ligne = (k, v) => [el('dt', {}, typo(k)), el('dd', {}, typo(String(v || '—')))];
  const dl = el('dl', {},
    ...ligne('Les gens se répéteront ?', J.q1),
    ...ligne('Bob a agi librement', J['bob-libre']),
    ...ligne('Bob est responsable', J['bob-resp']),
    ...ligne('Charlie a agi librement', J['charlie-libre']),
    ...ligne('Charlie est responsable', J['charlie-resp']),
    ...ligne('Harry a agi librement', J['harry-libre']),
    ...ligne('Harry est responsable', J['harry-resp']),
    ...ligne('Profil', J.profil && Object.keys(J.profil).length ? Object.entries(J.profil).map(([k, v]) => `${k} : ${v}`).join(' · ') : 'non renseigné'),
    ...ligne('Recherche', J.consentement),
    ...ligne('Remarques', J.remarques));
  E.expr = 'emu';
  await montrer([el('div', { class: 'journal' }, el('h3', {}, 'Maquette : ce qui serait enregistré'), dl),
    el('button', { class: 'lien', type: 'button', onclick: 'location.reload()' }, 'Recommencer')], PHI.fin);
  pret();
}

async function parcours() {
  await ecranAccueil();
  for (const p of ['a1', 'a2', 'a3']) await temps(p);
  J.q1 = Q1.options[await ecranQ1()];
  for (const p of ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8']) await temps(p);
  for (const id of ['bob-libre', 'bob-resp', 'charlie-libre', 'charlie-resp']) J[id] = await ecranLikert(id);
  for (const p of ['c1', 'c2', 'c3', 'c4', 'c5', 'c6']) await temps(p);
  for (const id of ['harry-libre', 'harry-resp']) J[id] = await ecranLikert(id);
  J.profil = await ecranProfil();
  J.consentement = await ecranConsentement();
  J.remarques = await ecranRemarques();
  await ecranFin();
}
window.essai = { get etape() { return etapeCourante; }, get journal() { return JSON.parse(JSON.stringify(J)); } };
parcours();
