/* ==========================================================================
   Maquette animée de l'Acte 1 : assemblage du décor, du barillet, des
   sous-titres et des choix.

   Paramètres d'URL :
     ?style=trait|ombres   traitement graphique (défaut : trait)
     ?variant=A|B|C|D      variante du récit (défaut : A)
     ?screen=1             16:9 1920×1080 sombre, sans curseur
     ?auto=1               pilote automatique (choix scriptés, boucle)
     ?issue=part|rate      force le résultat du tir (prévisualisation)
     ?debug=1              affiche le plan et le temps
     ?manual=1             horloge arrêtée : on avance image par image
                           avec window.film.advance(secondes)
   Clavier : espace = pause, → = passer le plan, R = recommencer.
   ========================================================================== */
import { Player } from './engine.js';
import { createRoom } from './room.js';
import { createInsert } from './insert.js';
import { buildStory } from './story.js';

const params = new URLSearchParams(location.search);
const html = document.documentElement;
const style = params.get('style') === 'ombres' ? 'ombres' : 'trait';
html.classList.add('st-' + style);
const isScreen = html.classList.contains('screen');
const opts = {
  variant: ['A', 'B', 'C', 'D'].includes((params.get('variant') || '').toUpperCase()) ? params.get('variant').toUpperCase() : 'A',
  auto: params.get('auto') === '1',
  forced: params.get('issue'),
  debug: params.get('debug') === '1',
  manual: params.get('manual') === '1',
};

const room = createRoom(document.getElementById('scene'), { style });
const insert = createInsert(document.getElementById('insert'), { isScreen });

// --- Interface : sous-titres, narrateur, choix ----------------------------
const subEl = document.getElementById('sub-text');
const phiEl = document.querySelector('.phi-mini');
const choicesEl = document.querySelector('.choices');
const btns = [...choicesEl.querySelectorAll('.choice')];
const endEl = document.querySelector('.endlinks');
const dbg = document.querySelector('.debug');
let lastText = null, lastChoices = null, shown = null;

btns.forEach((b, i) =>
  b.addEventListener('click', () => {
    const c = shown?.[i];
    if (c) pick(c.v);
  }),
);

function pick(v) {
  if (v === 'rejouer') return start();
  player.choose(v);
}

function ui(s) {
  const sub = s.sub;
  const text = sub ? sub.text : '';
  if (text !== lastText) { subEl.textContent = text; lastText = text; }
  subEl.style.opacity = sub ? sub.k : 0;
  phiEl.dataset.expr = sub?.expr || 'neutre';
  // La bouche bat à 7 images par seconde tant que la phrase est « dite »
  phiEl.classList.toggle('talk', !!(sub?.talk && Math.floor(s.T * 7) % 2 === 0));

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
}

// Liens de fin : changer de variante ou de style sans perdre le format
function buildEndLinks() {
  const link = (k, v, label) => {
    const p = new URLSearchParams(location.search);
    p.set(k, v);
    p.delete('auto');
    const cur = k === 'variant' ? opts.variant : style;
    return `<a href="?${p}"${cur === v ? ' aria-current="true"' : ''}>${label}</a>`;
  };
  endEl.innerHTML =
    `<span>Variante ${['A', 'B', 'C', 'D'].map((v) => link('variant', v, v)).join(' ')}</span>` +
    `<span>Style ${link('style', 'trait', 'trait')} ${link('style', 'ombres', 'ombres')}</span>`;
}
buildEndLinks();

// --- Pilote automatique (aperçus dans l'index) ----------------------------
const SCRIPT = { 1: 'tirer', 2: 'tirer', 3: 'ne-pas-tirer', 4: 'ne-pas-tirer' };
function autopilot(p) {
  if (!opts.auto || !p.waiting) return;
  const waited = p.T - p.waitT;
  if (p.id === 'fin') { if (waited > 3.5) start(); }
  else if (waited > 2.2) p.choose(SCRIPT[p.ctx.cran]);
}

// --- Lecture --------------------------------------------------------------
let player;
function render(s, p) {
  room(s);
  insert(s);
  ui(s);
  if (opts.debug) dbg.textContent = `${p.id}  t=${p.t.toFixed(2)}  T=${p.T.toFixed(1)}  cran=${p.ctx.cran}`;
  autopilot(p);
}

function start() {
  const ctx = { isScreen, variant: opts.variant, auto: opts.auto, forced: opts.forced, cran: 0, accepted: 0, refusedAt: 0, rot: 0, fire: false, log: [] };
  player = new Player({ shots: buildStory(ctx), ctx, render });
  room.reset();
  insert.reset();
  player.goto('ouverture');
}

let last = performance.now(), paused = false;
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!paused && !opts.manual && player) player.tick(dt);
  requestAnimationFrame(loop);
}

addEventListener('keydown', (e) => {
  if (e.key === ' ') { paused = !paused; e.preventDefault(); }
  else if (e.key === 'ArrowRight') player.skip();
  else if (e.key === 'r' || e.key === 'R') start();
});

// Pilotage image par image (tests, et base du futur mode rendu) :
// l'horloge avance par pas fixes de 1/25 s, sans dépendre du navigateur.
window.film = {
  get player() { return player; },
  advance(seconds, fps = 25) {
    for (let i = 0, n = Math.round(seconds * fps); i < n; i++) player.tick(1 / fps);
    return `${player.id} t=${player.t.toFixed(2)}`;
  },
  choose: (v) => pick(v),
  restart: () => start(),
};

dbg.hidden = !opts.debug;
document.fonts.ready.then(() => {
  start();
  requestAnimationFrame(loop);
});
