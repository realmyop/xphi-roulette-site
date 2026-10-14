/* ==========================================================================
   Résultats de l'Acte 3 : navigation entre les sept écrans (flèches du
   clavier, clic sur l'image, boutons), et animation de la craie.
   ?i=1…7 choisit l'écran ; ?still=1 dessine directement la fin de
   l'animation (captures, index des maquettes) ; ?t=1.2 fige un instant.
   ========================================================================== */
import { craie } from './craie.js';
import { ECRANS, formuleVous } from './ecrans.js';

const q = new URLSearchParams(location.search);
const html = document.documentElement;
const ecran = html.classList.contains('screen');
const still = q.get('still') === '1';
const tFixe = q.has('t') ? parseFloat(q.get('t')) : null; // ?t=1.2 : un instant de l'animation, figé
const N = ECRANS.length;
const ctxJeu = {
  formulation: q.get('formulation') === 'B' ? 'B' : 'A',
  choix: q.get('choix') === 'rouge' ? 'rouge' : 'bleu',
};

const $ = (id) => document.getElementById(id);
const stage = document.querySelector('.stage');
const frame = document.querySelector('.frame');
const canvas = $('craie');
const g = canvas.getContext('2d');
const phiEl = document.querySelector('.phi-mini');

let i = Math.min(N, Math.max(1, parseInt(q.get('i') || '1', 10) || 1)) - 1;
let t0 = 0, raf = 0;
const DUREE = 5.5; // au-delà, plus rien ne bouge : on arrête de dessiner

// Petits points de navigation
const points = ECRANS.map((e, k) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-label', `Écran ${k + 1}`);
  if (e.fictif) b.className = 'vous';
  b.addEventListener('click', (ev) => { ev.stopPropagation(); montre(k); });
  $('points').append(b);
  return b;
});

function taille() {
  const W = frame.offsetWidth, H = frame.offsetHeight;
  const fit = parseFloat(getComputedStyle(html).getPropertyValue('--fit')) || 1;
  const dpr = Math.min(2, Math.max(1, (ecran ? fit : 1) * (devicePixelRatio || 1)));
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  return { W, H, dpr };
}

function dessine(t) {
  const { W, H, dpr } = taille();
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, H);
  const tete = document.querySelector('.tete');
  const bas = tete.offsetTop + tete.offsetHeight;
  // La zone du graphique : sous l'en-tête, au-dessus des sous-titres (16:9)
  const R = ecran
    ? { x: 160, y: bas + 56, w: 1600, h: 806 - (bas + 56) }
    : { x: 16, y: bas + 18, w: W - 32, h: H - (bas + 18) - 16 };
  const P = !ecran;
  const sc = Math.min(1.35, Math.max(0.85, R.w / 358));
  const z = (a, b) => (P ? b * sc : a);
  const k = craie(g, P ? 0.55 * sc : 1);
  ECRANS[i].draw(k, R, t, P, z, ctxJeu);
}

function boucle() {
  const t = (performance.now() - t0) / 1000;
  dessine(t);
  if (t < DUREE) raf = requestAnimationFrame(boucle);
}

function montre(k) {
  i = (k + N) % N;
  const e = ECRANS[i];
  $('compte').textContent = `${i + 1} / ${N}`;
  $('titre').textContent = e.titre;
  $('formule').textContent = e.fictif ? formuleVous(ctxJeu) : e.formule;
  $('fictif').hidden = !e.fictif;
  $('replique').textContent = e.replique;
  $('source').textContent = e.fictif
    ? 'Maquette · données fictives : ici viendront les réponses des joueurs du site.'
    : 'Questionnaire de Monsieur Phi (vidéo « pilule bleue ou pilule rouge ») · près de 10 000 répondants.';
  phiEl.dataset.expr = e.phi;
  canvas.setAttribute('aria-label', e.fictif
    ? `Données fictives. ${formuleVous(ctxJeu)} Cent points par formulation, le vôtre en laiton.`
    : e.aria);
  points.forEach((b, j) => b.setAttribute('aria-current', j === i ? 'true' : 'false'));
  $('prec').disabled = i === 0;
  $('suiv').disabled = i === N - 1;
  // L'adresse suit l'écran (pratique pour partager ou capturer)
  const u = new URL(location.href);
  u.searchParams.set('i', i + 1);
  history.replaceState(null, '', u);

  cancelAnimationFrame(raf);
  if (still || tFixe !== null) { dessine(still ? 99 : tFixe); return; }
  stage.classList.add('change');
  void stage.offsetWidth; // relance la transition d'apparition
  stage.classList.remove('change');
  t0 = performance.now();
  boucle();
}

$('prec').addEventListener('click', (ev) => { ev.stopPropagation(); montre(i - 1); });
$('suiv').addEventListener('click', (ev) => { ev.stopPropagation(); montre(i + 1); });
frame.addEventListener('click', (ev) => {
  // Clic sur l'image : à droite on avance, sur le quart gauche on recule
  const r = frame.getBoundingClientRect();
  montre((ev.clientX - r.left) / r.width < 0.25 ? i - 1 : i + 1);
});
addEventListener('keydown', (ev) => {
  if (ev.key === 'ArrowRight' || ev.key === ' ' || ev.key === 'PageDown') { ev.preventDefault(); montre(i + 1); }
  else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); montre(i - 1); }
  else if (ev.key === 'Home') montre(0);
  else if (ev.key === 'End') montre(N - 1);
});
addEventListener('resize', () => dessine(still ? 99 : tFixe ?? (performance.now() - t0) / 1000));

// Le texte de la craie est en Inter : on attend la police avant le premier trait
Promise.all(['500 20px Inter', '600 20px Inter', '700 20px Inter'].map((f) => document.fonts.load(f)))
  .catch(() => {})
  .then(() => montre(i));
