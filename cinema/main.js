/* ==========================================================================
   Le film (Actes 1, 2 et 3) : chargement des décors, lecture, sous-titres, choix.

   Paramètres d'URL :
     ?acte=1|2|3           l'histoire : 1 le barillet, 2 la conception,
                           3 les deux pilules (défaut : 1)
     ?variant=A|B|C|D      variante du récit de l'Acte 1 (défaut : A)
     ?formulation=A|B      Acte 3 : façon de dire la règle des pontons (sinon
                           tirée au sort, une fois par visite)
     ?screen=1             16:9 1920×1080 sombre, sans curseur
     ?auto=1               pilote automatique (choix scriptés, en boucle)
     ?choix=tirer,tirer,ne-pas-tirer   choix du pilote, cran par cran ; à l'Acte 3,
                           étape par étape (défaut : bleue,bleu,bleu,lue ;
                           valeurs : bleue|rouge, bleu|rouge, bleu|rouge, lue|autre)
     ?issue=part|rate|tirage   force le résultat du tir, ou demande un vrai tirage
     ?manual=1             horloge arrêtée : window.film.advance(secondes)
     ?debug=1              affiche l'étape et le temps
     ?rendu=1              rendu vidéo : sans liens ni bouton de fin
     ?at=40                (avec manual=1) se place à 40 s du film puis signale
                           « ready » dans le titre (captures automatiques)
     ?planche=6            (avec manual=1&auto=1&screen=1) une image toutes les
                           6 s, assemblées en planche contact du film entier
   Clavier : espace = pause, → = étape suivante, R = recommencer.
   ========================================================================== */
import { Player } from '../film/engine.js';
import { chargeTextes } from './textes.js';
import { createCompositor } from './compositor.js';
import { drawChalk } from './chalk.js';
import { buildStory, ORDER, useTextes as textes1 } from './story.js';
import { buildStory2, ORDER2, useTextes as textes2 } from './story2.js';
import { drawChalk3 } from './chalk3.js';
import { buildStory3, ORDER3, SEQ3, useTextes as textes3 } from './story3.js';

// Les répliques et les boutons viennent de ../i18n/fr.json
const TEXTES = await chargeTextes();
[textes1, textes2, textes3].forEach((u) => u(TEXTES));

const params = new URLSearchParams(location.search);
const html = document.documentElement;
const isScreen = html.classList.contains('screen');
html.classList.toggle('rendu', params.get('rendu') === '1');
const portrait = !isScreen;
const V = (params.get('variant') || 'A').toUpperCase();
const acte = { 2: 2, 3: 3 }[params.get('acte')] || 1;
// Le titre de l'onglet suit l'acte (les captures le remplacent ensuite par « ready »)
document.title = `Xphi — ${['Le barillet', 'La conception', 'Les deux pilules'][acte - 1]}`;
/* Acte 3 : la règle est dite de deux façons ; chaque joueur en lit une, tirée
   au sort une fois par visite (c'est le jeu, pas le décor : Math.random est
   permis ici). ?formulation=A|B la force (tests, captures). */
const F = (params.get('formulation') || '').toUpperCase();
const formulation = F === 'A' || F === 'B' ? F : Math.random() < 0.5 ? 'A' : 'B';
const opts = {
  variant: ['A', 'B', 'C', 'D'].includes(V) ? V : 'A',
  auto: params.get('auto') === '1',
  forced: params.get('issue'),
  debug: params.get('debug') === '1',
  manual: params.get('manual') === '1',
};

// --- Canvas à la bonne résolution ------------------------------------------
const canvas = document.getElementById('film');
if (isScreen) {
  canvas.width = 1920;
  canvas.height = 1080;
} else {
  const cssW = Math.min(480, document.documentElement.clientWidth);
  // Pleine définition jusqu'à 3× (iPhone récents) ; en rendu vidéo, aucune limite
  const dpr = html.classList.contains('rendu') ? window.devicePixelRatio || 1 : Math.min(3, window.devicePixelRatio || 1);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round((cssW * dpr * 5) / 4);
}
// Résolution de peinture des décors : de quoi pousser la caméra sans flou
const scale = Math.min(portrait ? 1.1 : 1.25, (canvas.width / (portrait ? 864 : 1920)) * 1.1);

// --- Décors ----------------------------------------------------------------
const IDS = acte === 3
  ? ORDER3
  : acte === 2
  ? ORDER2
  : ['maison', 'chambre', 'bebe', 'porte', 'personne', 'barillet', 'visee', 'porte-pov'];
const SC = {};
const manquants = [];
await Promise.all(
  IDS.map(async (id) => {
    try {
      SC[id] = (await import(`./scenes/${id}.js`)).default;
    } catch (e) {
      // Le film reste jouable (plan noir), mais on le signale clairement
      manquants.push(id);
      console.error(`Décor « ${id} » indisponible`, e);
    }
  }),
);
const comp = createCompositor(canvas, { portrait, scenes: SC, scale });
const loading = {};
const ensure = (id) => (SC[id] ? (loading[id] ??= comp.load(id)) : Promise.resolve());
const ready = (id) => !id || !SC[id] || !!comp.loaded[id];

/* Mémoire : on ne garde peints que les décors utiles maintenant — le précédent,
   l'actuel et les deux suivants dans l'ordre où le film les utilise — et on
   libère les autres (indispensable sur téléphone : Safari limite la mémoire
   des images). Les suivants se peignent pendant qu'on regarde. */
const SEQ =
  acte === 3
    ? SEQ3
    : acte === 2
    ? ['a2-dehors', 'a2-cuisine', 'a2-mains', 'a2-lettre', 'a2-couple', 'a2-seuil', 'a2-naissance']
    : opts.variant === 'D'
      ? ['maison', 'chambre', 'bebe', 'porte-pov', 'bebe', 'barillet', 'visee', 'bebe', 'porte', 'bebe']
      : ['maison', 'chambre', 'bebe', 'porte', 'personne', 'barillet', 'visee', 'bebe', 'porte', 'bebe'];
let pos = 0;
function manage(current = []) {
  // Avance dans la séquence quand le décor principal à l'image y apparaît plus loin
  const main = current[0];
  if (main) {
    const i = SEQ.indexOf(main, pos);
    if (i >= 0) pos = i;
  }
  const keep = new Set([...SEQ.slice(Math.max(0, pos - 1), pos + 3), ...current]);
  for (const id of Object.keys(comp.loaded)) {
    if (!keep.has(id)) { comp.unload(id); delete loading[id]; }
  }
  for (const id of keep) ensure(id);
}
manage();

// --- Interface -------------------------------------------------------------
const subEl = document.getElementById('sub-text');
const phiEl = document.querySelector('.phi-mini');
// L'œil de Phi (logo A) : un seul, qui vit sur la page. Il a deux places,
// à côté du sous-titre (.phi-mini) et sous les deux boutons pendant un choix
// (.oeil-choix), et il marche de l'une à l'autre au lieu de disparaître.
// Il suit l'horloge du film : le rendu vidéo reste identique.
const dockEl = document.querySelector('.dock');
const oeilEl = document.querySelector('.oeil-vivant');
const oeilChoixEl = document.querySelector('.oeil-choix');
const oeil = window.XphiOeil?.create(oeilEl, { small: true });
let vise = -1; // bouton survolé (0 gauche, 1 droite), -1 aucun
const choicesEl = document.querySelector('.choices');
const btns = [...choicesEl.querySelectorAll('.choice')];
const endEl = document.querySelector('.endlinks');
const noteEl = document.querySelector('.note');
const waitEl = document.querySelector('.wait');
const dbg = document.querySelector('.debug');
let lastText = null, lastChoices = null, shown = null;

btns.forEach((b, i) => b.addEventListener('click', () => shown?.[i] && pick(shown[i].v)));
btns.forEach((b, i) => {
  b.addEventListener('pointerenter', () => { vise = i; });
  b.addEventListener('pointerleave', () => { if (vise === i) vise = -1; });
  b.addEventListener('focus', () => { vise = i; });
  b.addEventListener('blur', () => { if (vise === i) vise = -1; });
});
function pick(v) {
  if (v === 'rejouer') return start();
  player.choose(v);
}

/* La promenade de l'œil. Quand sa place bouge (le sous-titre centré change de
   largeur, ou le choix arrive), il fait le trajet en douceur ; pour descendre
   sous les boutons ou remonter, il passe derrière eux, plus petit et estompé,
   comme au second plan, en regardant où il va. */
const voyage = { from: null, to: null, t0: 0, dur: 0, loin: false };
let ou = null, placeAvant = null;
function placeDe(el) {
  const d = dockEl.getBoundingClientRect(), r = el.getBoundingClientRect();
  const k = dockEl.offsetWidth / (d.width || 1); // 16:9 : la scène est mise à l'échelle
  return { x: (r.left - d.left) * k, y: (r.top - d.top) * k, w: r.width * k };
}
function promene(s, sub) {
  if (!oeil) return;
  const deux = !!s.choices && s.choices.length === 2;
  if (oeilChoixEl.hidden === deux) oeilChoixEl.hidden = !deux;
  const place = deux ? 'choix' : 'texte';
  const cible = placeDe(deux ? oeilChoixEl : phiEl);
  if (!ou) ou = { ...cible };
  const T = s.T;
  // Nouveau trajet si la place a changé, ou si elle a bougé de plus de quelques pixels
  const bouge = !voyage.to || Math.hypot(cible.x - voyage.to.x, cible.y - voyage.to.y) > 3 || Math.abs(cible.w - voyage.to.w) > 2;
  if (bouge) {
    const dist = Math.hypot(cible.x - ou.x, cible.y - ou.y);
    // Un trajet « loin » (d'une place à l'autre) le reste si sa cible bouge en route
    const enCours = voyage.to && T - voyage.t0 < voyage.dur;
    voyage.loin = (placeAvant !== null && place !== placeAvant) || (enCours && voyage.loin);
    voyage.from = { ...ou }; voyage.to = { ...cible }; voyage.t0 = T;
    voyage.dur = voyage.loin ? 1.3 : Math.min(0.9, 0.35 + dist / 500);
  }
  placeAvant = place;
  const u = voyage.dur > 0 ? Math.min(1, Math.max(0, (T - voyage.t0) / voyage.dur)) : 1;
  const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const A = voyage.from, B = voyage.to, arc = Math.sin(Math.PI * u);
  const dx = B.x - A.x, dy = B.y - A.y;
  ou = {
    x: A.x + dx * e + (voyage.loin ? arc * Math.sign(dx || 1) * 40 : 0), // un détour, pas une ligne droite
    y: A.y + dy * e - (voyage.loin ? 0 : arc * 6),                        // un petit saut pour les pas courts
    w: A.w + (B.w - A.w) * e,
  };
  const enRoute = u < 1;
  const sc = voyage.loin ? 1 - 0.3 * arc : 1;
  oeilEl.style.width = `${ou.w}px`;
  oeilEl.style.transform = `translate(${ou.x}px, ${ou.y}px) scale(${sc})`;
  oeilEl.style.opacity = voyage.loin ? 1 - 0.5 * arc : 1;
  oeilEl.style.zIndex = voyage.loin && enRoute ? 0 : 2; // derrière les boutons pendant le trajet

  let look = null, glow = 0;
  if (enRoute && Math.hypot(dx, dy) > 4) {
    const n = Math.hypot(dx, dy);
    look = { x: (dx / n) * 6.5, y: (dy / n) * 5.5 }; // il regarde où il va
  } else if (deux) {
    // Choisi : il regarde le bouton pris ; survolé : le bouton visé ; sinon il hésite avec vous
    const pris = s.picked ? s.choices.findIndex((c) => c.v === s.picked) : -1;
    const cote = pris >= 0 ? pris : vise >= 0 ? vise : Math.floor(T / 1.7) % 2;
    const flane = pris < 0 && vise < 0 && T % 1.7 < 0.5;
    look = flane ? { x: 0, y: -2 } : { x: cote ? 7 : -7, y: -5.5 };
    glow = pris >= 0 ? 0.5 : 0;
  }
  oeil.draw(T, { expr: sub?.expr || 'neutre', talk: !!sub?.talk && !enRoute, look, glow });
}

function ui(s) {
  const sub = s.sub;
  const text = sub ? sub.text : '';
  if (text !== lastText) { subEl.textContent = text; lastText = text; }
  subEl.style.opacity = sub ? sub.k : 0;
  phiEl.dataset.expr = sub?.expr || 'neutre';

  shown = s.choices;
  choicesEl.hidden = !s.choices;
  if (s.choices) {
    if (s.choices !== lastChoices) {
      btns.forEach((b, i) => {
        const c = s.choices[i];
        b.hidden = !c;
        if (c) b.textContent = c.label;
      });
      choicesEl.classList.toggle('single', s.choices.length === 1);
      lastChoices = s.choices;
    }
    choicesEl.style.opacity = s.choicesK;
    btns.forEach((b, i) => {
      const c = s.choices[i];
      b.classList.toggle('picked', !!c && s.picked === c.v);
      b.classList.toggle('ghost', !!s.picked && !!c && s.picked !== c.v);
    });
  }
  endEl.hidden = !s.end;
  noteEl.hidden = !s.note;
  if (s.note) noteEl.textContent = s.note;
  promene(s, sub); // en dernier : les boutons sont déjà affichés ou cachés
}

function buildEndLinks() {
  const link = (v) => {
    const p = new URLSearchParams(location.search);
    p.set('variant', v);
    p.delete('auto');
    return `<a href="?${p}"${opts.variant === v ? ' aria-current="true"' : ''}>${v}</a>`;
  };
  const lienActe = (a) => {
    const p = new URLSearchParams(location.search);
    p.set('acte', a);
    p.delete('auto');
    return `<a href="?${p}"${acte === a ? ' aria-current="true"' : ''}>${a}</a>`;
  };
  const lienFormulation = (f) => {
    const p = new URLSearchParams(location.search);
    p.set('formulation', f);
    p.delete('auto');
    return `<a href="?${p}"${formulation === f ? ' aria-current="true"' : ''}>${f}</a>`;
  };
  endEl.innerHTML =
    `<span>Acte ${lienActe(1)} ${lienActe(2)} ${lienActe(3)}</span>` +
    (acte === 1 ? ` · <span>Variante ${['A', 'B', 'C', 'D'].map(link).join(' ')}</span>` : '') +
    (acte === 3 ? ` · <span>Formulation ${['A', 'B'].map(lienFormulation).join(' ')}</span>` : '');
}
buildEndLinks();

// Titre de fin
function title(ctx, W, H, k) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = k;
  ctx.fillStyle = '#efe6d6';
  ctx.textAlign = 'center';
  ctx.font = `300 ${H * 0.07}px Inter, system-ui, sans-serif`;
  ctx.fillText(TEXTES.commun.fin, W / 2, H * 0.5);
  ctx.restore();
}

// --- Lecture ---------------------------------------------------------------
// Choix du pilote automatique, cran par cran (par défaut : tirer, tirer, ne pas tirer)
// Acte 3 : étape par étape (pilule, ponton, Alice, formulation)
const SCRIPT = acte === 3
  ? { 1: 'bleue', 2: 'bleu', 3: 'bleu', 4: 'lue' }
  : { 1: 'tirer', 2: 'tirer', 3: 'ne-pas-tirer', 4: 'ne-pas-tirer' };
const VALIDES = acte === 3
  ? { 1: ['bleue', 'rouge'], 2: ['bleu', 'rouge'], 3: ['bleu', 'rouge'], 4: ['lue', 'autre'] }
  : null;
(params.get('choix') || '').split(',').map((v) => v.trim()).filter(Boolean).forEach((v, i) => {
  if (VALIDES ? VALIDES[i + 1]?.includes(v) : v === 'tirer' || v === 'ne-pas-tirer') SCRIPT[i + 1] = v;
});
let player;
let drawing = true; // faux pendant une avance rapide (planche) : on ne dessine pas

// Décors nécessaires à l'image en cours
const scenesOf = (s) => [s.view?.scene, s.view2?.scene, s.freeze?.view?.scene].filter(Boolean);

function draw(s, p) {
  comp.render(s, (ctx, W, H) => {
    if (s.chalk) drawChalk(ctx, W, H, s.chalk, portrait);
    if (s.chalk3) drawChalk3(ctx, W, H, s.chalk3, portrait);
    if (s.title) title(ctx, W, H, s.title);
  });
  ui(s);
  if (opts.debug) dbg.textContent = `${p.id}  t=${p.t.toFixed(2)}  T=${p.T.toFixed(1)}  cran=${p.ctx.cran}`;
}

function start() {
  pos = 0;
  const ctx = { portrait, variant: opts.variant, auto: opts.auto, forced: opts.forced, cran: 0, accepted: 0, refusedAt: 0, fire: false, formulation, log: [] };
  player = new Player({
    shots: acte === 3 ? buildStory3(ctx, SC) : acte === 2 ? buildStory2(ctx, SC) : buildStory(ctx, SC),
    ctx,
    render: (s, p) => {
      if (drawing) draw(s, p);
      // Pilote automatique
      if (opts.auto && p.waiting) {
        const waited = p.T - p.waitT;
        if (p.shot.choices && (p.id === 'titre' || p.id === 'finpart')) { if (waited > 4) start(); }
        else if (waited > 2.2) p.choose(SCRIPT[p.ctx.cran]);
      }
    },
  });
  player.goto('intro');
}

// L'horloge n'avance que si les décors de l'image sont prêts
function canTick() {
  const s = player.frame();
  manage(scenesOf(s).concat(player.shot.scene || []));
  const missing = scenesOf(s).filter((id) => !ready(id));
  const nextScene = player.shot.scene;
  if (nextScene && !ready(nextScene)) missing.push(nextScene);
  missing.forEach(ensure);
  waitEl.hidden = missing.length === 0;
  return missing.length === 0;
}

let last = performance.now(), paused = false;
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!paused && !opts.manual && player && canTick()) player.tick(dt);
  requestAnimationFrame(loop);
}

addEventListener('keydown', (e) => {
  if (e.key === ' ') { paused = !paused; e.preventDefault(); }
  else if (e.key === 'ArrowRight') player.skip();
  else if (e.key === 'r' || e.key === 'R') start();
});

// Pilotage image par image (tests, futur mode rendu)
window.film = {
  get player() { return player; },
  async advance(seconds, fps = 25) {
    for (let i = 0, n = Math.round(seconds * fps); i < n; i++) {
      while (!canTick()) await Promise.all(scenesOf(player.frame()).concat(player.shot.scene || []).map(ensure));
      player.tick(1 / fps);
    }
    return `${player.id} t=${player.t.toFixed(2)}`;
  },
  choose: (v) => pick(v),
  restart: () => start(),
  ready: async () => { manage(); await Promise.all(Object.values(loading)); },
  // Acte 3 : la formulation lue par ce joueur ('A' ou 'B')
  formulation,
  // Décors qui n'ont pas pu être chargés (le rendu vidéo refuse de continuer)
  manquants,
  // Mémoire par calque peint (Mo), du plus lourd au plus léger
  memoireDetail: () =>
    Object.entries(comp.loaded).flatMap(([sid, L]) => Object.entries(L).map(([lid, r]) =>
      [`${sid}/${lid}`, Math.round((r.canvas.width * r.canvas.height * 4) / 1e6), `${r.canvas.width}×${r.canvas.height}`]))
      .sort((a, b) => b[1] - a[1]),
  // Mémoire occupée par les décors peints, en mégaoctets
  memoire: () =>
    Math.round(Object.values(comp.loaded).flatMap((L) => Object.values(L)).reduce((a, r) => a + r.canvas.width * r.canvas.height * 4, 0) / 1e6),
};

dbg.hidden = !opts.debug;
await document.fonts.ready;
start();
// En mode piloté, pas de boucle temps réel : l'horloge n'avance que sur commande
if (!opts.manual) requestAnimationFrame(loop);
else draw(player.frame(), player);
if (opts.manual && params.get('at')) {
  await window.film.advance(+params.get('at'));
  document.title = 'ready';
}

// Planche contact du film entier (relecture, dossier de présentation)
if (opts.manual && params.get('planche')) {
  const step = +params.get('planche') || 6;
  const fw = 480, fh = Math.round((fw * canvas.height) / canvas.width), cols = 4;
  const frames = [];
  for (let k = 0; k < 60; k++) {
    if (k) {
      drawing = false;
      await window.film.advance(step);
      drawing = true;
      draw(player.frame(), player);
    }
    const c = document.createElement('canvas');
    c.width = fw; c.height = fh;
    c.getContext('2d').drawImage(canvas, 0, 0, fw, fh);
    frames.push({ c, label: `${player.id} · ${player.T.toFixed(0)} s`, sub: subEl.textContent });
    if (player.id === 'titre' || player.id === 'finpart') break;
  }
  const rows = Math.ceil(frames.length / cols);
  const out = document.createElement('canvas');
  out.width = cols * fw; out.height = rows * (fh + 44);
  const o = out.getContext('2d');
  o.fillStyle = '#0c0b0d'; o.fillRect(0, 0, out.width, out.height);
  frames.forEach((f, i) => {
    const x = (i % cols) * fw, y = Math.floor(i / cols) * (fh + 44);
    o.drawImage(f.c, x, y);
    o.fillStyle = '#8f877b'; o.font = '13px Inter, system-ui';
    o.fillText(f.label, x + 8, y + fh + 17);
    o.fillStyle = '#efe6d6'; o.font = '14px Inter, system-ui';
    o.fillText((f.sub || '').slice(0, 62), x + 8, y + fh + 36);
  });
  document.body.innerHTML = '';
  document.body.style.background = '#0c0b0d';
  out.style.display = 'block';
  document.body.append(out);
  document.title = 'ready';
}
