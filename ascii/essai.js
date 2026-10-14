/* ==========================================================================
   Essai de direction artistique « en caractères » : l'histoire du lac.

   Une seule scène, pour juger la direction artistique avant de tout refaire.
   Elle reprend ce que Thibaut a demandé le 12 octobre :
   - le côté sûr est saillant : le rivage, où il n'y a rien ; en face, le
     ponton bleu et sa bombe, bien visible ;
   - la règle, dite d'une des deux façons tirées au sort, doit être comprise
     avant de choisir : deux questions, et Phi la relit tant qu'il le faut ;
   - pas d'Alice ;
   - les couleurs remplacent A et B (bleu = A, le ponton ; rouge = B, le rivage).
   Retour de Ronan sur la première version : « c'est assez fouillis » ; la scène
   est maintenant dessinée au trait, et Phi garde son œil vectoriel d'origine
   (« pas besoin qu'il soit en ASCII »).

   Paramètres (pour les essais) :
     ?formulation=A|B   force la formulation (sinon : tirage au sort)
     ?saut=q1           passe directement à une étape : bombe, rivage, ensemble,
                        regle, q1, q2, choix, apres, revele, fin
     ?choix=ponton|rivage  le choix fait pendant un saut
     ?gel=4             fige l'horloge 4 s après le début (ou après l'étape du saut)
     ?vitesse=2         joue plus vite
   ========================================================================== */
import { creerRendu } from './rendu.js';

const params = new URLSearchParams(location.search);
const F = /^[AB]$/.test(params.get('formulation') || '') ? params.get('formulation') : (Math.random() < 0.5 ? 'A' : 'B');
const AUTRE = F === 'A' ? 'B' : 'A';
const SAUT = params.get('saut');
const GEL = params.has('gel') ? Math.max(0, parseFloat(params.get('gel')) || 0) : null;
const VITESSE = Math.max(0.1, parseFloat(params.get('vitesse') || '1') || 1);
const CHOIX_FORCE = params.get('choix') === 'rivage' ? 'rivage' : 'ponton';
const REDUIT = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Typographie française : espaces insécables, apostrophes courbes
const typo = (s) => s.replace(/'/g, '’').replace(/ ([?!;])/g, ' $1').replace(/ :/g, ' :');

const TXT = {
  lac: 'Cent personnes au bord d\'un lac, à l\'aube.',
  bombe: 'Sur le ponton bleu, une bombe.',
  rivage: 'Sur le rivage, rien de spécial.',
  ensemble: 'Tout le monde choisit en même temps. Personne ne voit ce que font les autres.',
  verif: 'Personne ne choisit sans avoir compris la règle. Vérifions.',
  q1: 'Si la majorité monte sur le ponton bleu ?',
  q2: 'Si la majorité reste sur le rivage ?',
  non: 'Non. Relisons la règle.',
  oui: 'C\'est ça. Et tous les autres l\'ont comprise, eux aussi.',
  aVous: 'À vous.',
  qChoix: 'Où allez-vous ?',
  note: 'Noté.',
  derniere: 'Une dernière chose.',
  lue: 'Vous avez lu la règle d\'une certaine façon. La voici dite autrement :',
  meme: 'C\'est exactement la même situation.',
};
// Les deux façons de dire la même règle : la seule chose qui change d'un joueur à l'autre
const REGLE = {
  A: ['Si la majorité monte sur le ponton bleu, la bombe est désamorcée : tout le monde vit.',
    'Sinon, elle explose : seuls ceux restés sur le rivage survivent.'],
  B: ['Sur le rivage, il ne vous arrive rien.',
    'Sur le ponton bleu, la bombe vous tue, sauf si la majorité y monte aussi.'],
};
const COMPRIS = [{ v: 'vit', label: 'Tout le monde vit' }, { v: 'meurent', label: 'Ceux du ponton meurent' }];
const COTES = [{ v: 'ponton', label: 'Le ponton bleu', couleur: 'var(--bleu)' }, { v: 'rivage', label: 'Le rivage', couleur: 'var(--rouge)' }];

const CPS = 38;                      // caractères tapés par seconde
const $ = (id) => document.getElementById(id);
const panneau = $('panneau'), sousEl = $('sous'), luEl = $('lu'), choixEl = $('choix'), oeilEl = $('oeil');

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lisse = (k) => k * k * (3 - 2 * k);
const mix = (a, b, k) => a + (b - a) * k;
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];

// --- Horloge -----------------------------------------------------------------
let T = 0;
let gele = false;
let capture = !SAUT && GEL !== null ? { at: GEL } : null;
let rapide = !!SAUT;                 // pendant un saut, l'histoire défile sans attendre
let attente = null;                  // { fin, res }
const attendre = (d) => new Promise((res) => { attente = { fin: T + d, res }; });
const pause = (d) => (rapide ? Promise.resolve() : attendre(d));

let etapeCourante = 'debut';
function etape(nom) {
  etapeCourante = nom;
  if (rapide && nom === SAUT) {
    rapide = false;
    if (GEL !== null) capture = { at: T + GEL };
  }
}

// --- Le monde (doit suivre le shader de rendu.js) ------------------------------
const bob = (t) => 0.025 * Math.sin(t * 0.9);
const shoreX = (z) => 0.32 * Math.sin(z * 0.23 + 0.7);
function landH(x, z) {
  const s = x - shoreX(z);
  const ss = (a, b, v) => lisse(clamp((v - a) / (b - a)));
  return 0.30 * ss(-0.9, 1.2, s) - 0.6 * (1 - ss(-3.0, -0.6, s));
}
// La hauteur du sol sous les pieds : passerelle, ponton ou rivage
function sol(x, z) {
  const x0 = -4 + 1.95, x1 = 0.75;
  if (Math.abs(z) < 0.42 && x >= x0 && x <= x1) return mix(0.48 + bob(T), 0.36, (x - x0) / (x1 - x0));
  if (Math.abs(x + 4) <= 1.9 && Math.abs(z) <= 1.9) return 0.48 + bob(T);
  return landH(x, z);
}

// --- Le joueur : la silhouette dorée, au premier rang ---------------------------
const J = { x: 1.05, z: -29 + 20 * 1.5, y: 0, cap: 0, marche: 0, phase: 0 };   // la place PC de la file (rendu.js)
J.y = landH(J.x, J.z);
let chemin = null;                   // { pts, d (distance parcourue) }
const CHEMINS = {
  ponton: [[1.05, 1.0], [0.6, 0.85], [0.5, 0.15], [0.3, 0.0], [-2.0, 0.0], [-2.95, 0.55]],
  rivage: [[1.05, 1.0], [1.8, 1.3], [2.7, 1.5]],
};
function partir(c) {
  chemin = { pts: CHEMINS[c], d: 0 };
  if (rapide) {
    // Pendant un saut, le joueur est déjà arrivé, tourné comme à la fin de sa marche
    const P = chemin.pts, a = P[P.length - 2], b = P[P.length - 1];
    chemin.d = 1e9;
    J.cap = Math.atan2(-(b[1] - a[1]), -(b[0] - a[0]));
  }
}
function majJoueur(dt) {
  let bouge = false;
  if (chemin) {
    chemin.d += dt * 1.1;
    let d = chemin.d;
    const P = chemin.pts;
    let x = P[P.length - 1][0], z = P[P.length - 1][1], dx = 0, dz = 0;
    for (let i = 0; i < P.length - 1; i++) {
      const ax = P[i][0], az = P[i][1], bx = P[i + 1][0], bz = P[i + 1][1];
      const L = Math.hypot(bx - ax, bz - az);
      if (d <= L) { const k = d / L; x = mix(ax, bx, k); z = mix(az, bz, k); dx = bx - ax; dz = bz - az; bouge = true; break; }
      d -= L;
    }
    J.x = x; J.z = z;
    if (bouge) {
      const cible = Math.atan2(-dz, -dx);
      let da = cible - J.cap;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      J.cap += rapide ? da : da * Math.min(1, dt * 6);
    }
  }
  J.marche = mix(J.marche, bouge ? 1 : 0, Math.min(1, dt * 6));
  if (bouge) J.phase += dt * 7.5;
  J.y = sol(J.x, J.z) + (bouge ? 0.03 * Math.abs(Math.sin(J.phase)) : 0);
}

// --- La caméra -----------------------------------------------------------------
const POSES = {
  large: { p: [5.0, 3.4, 17.5], t: [-2.4, 1.0, -3.0] },
  bombe: { p: [-0.8, 1.9, 4.6], t: [-4.0, 1.25, 0.0] },
  rivage: { p: [4.0, 2.0, 10.0], t: [10.0, 0.8, -4.0] },
  foule: { p: [8.5, 2.6, 8.0], t: [1.5, 1.0, 0.0] },
  choix: { p: [5.5, 3.0, 13.5], t: [-2.2, 1.2, -2.0] },
  suivre: () => ({ p: [J.x + 5.0, J.y + 2.6, J.z + 8.6], t: [J.x - 1.4, J.y + 0.8, J.z - 0.8] }),
  fin: { p: [1.5, 12.0, 17.0], t: [-3.0, 1.0, -8.0] },
};
const pose = (P) => (typeof P === 'function' ? P() : P);
let camA = POSES.large, camB = POSES.large, camT0 = 0, camD = 0;
function camActuelle() {
  const k = camD <= 0 ? 1 : lisse(clamp((T - camT0) / camD));
  const A = pose(camA), B = pose(camB);
  return { p: mix3(A.p, B.p, k), t: mix3(A.t, B.t, k) };
}
function camera(nom, d = 3.6) {
  const c = camActuelle();
  camA = c; camB = POSES[nom]; camT0 = T; camD = rapide ? 0 : d;
}
function camFinale() {
  const c = camActuelle();
  const s = REDUIT ? 0.3 : 1;
  c.p[0] += s * 0.35 * Math.sin(T * 0.071);
  c.p[1] += s * 0.12 * Math.sin(T * 0.053 + 1);
  c.p[2] += s * 0.30 * Math.sin(T * 0.047 + 2);
  // En portrait, la caméra monte et plonge : le lac, plat, remplit alors la hauteur de l'image
  if (L?.portrait) c.p[1] += 3.5;
  return c;
}

// --- Fondus et brume ---------------------------------------------------------------
const anim = (v) => ({ a: v, b: v, t0: 0, d: 0 });
const fondu = anim(0), brume = anim(0);
function vers(x, b, d) { x.a = val(x); x.b = b; x.t0 = T; x.d = rapide ? 0 : d; }
function val(x) { return x.d <= 0 ? x.b : mix(x.a, x.b, lisse(clamp((T - x.t0) / x.d))); }

// --- L'œil de Phi : son dessin d'origine (shared/oeil.js) -----------------------------
const OE = { cible: null, expr: 'neutre', humeur: null, humeurFin: 0, cligne: -1, vue: null };
function humeur(expr, d = 1.4) { OE.humeur = expr; OE.humeurFin = T + d; }
function cligner() { OE.cligne = T; }
function majOeil() {
  if (!OE.vue) return;
  let look = null, glow = 0;
  if (OE.cible && OE.cible.isConnected) {           // il regarde le bouton visé
    const r = OE.cible.getBoundingClientRect(), e = oeilEl.getBoundingClientRect();
    look = {
      x: clamp((r.left + r.width / 2 - (e.left + e.width / 2)) / 40, -5, 5),
      y: clamp((r.top + r.height / 2 - (e.top + e.height / 2)) / 40, -5, 5),
    };
    glow = 0.25;
  }
  let blink = null;
  if (OE.cligne >= 0) {
    const u = T - OE.cligne;
    if (u > 0.22) OE.cligne = -1;
    else blink = 1 - Math.sin((Math.PI * u) / 0.22);
  }
  const parle = !!texte && T - texte.t0 < texte.total / CPS;
  OE.vue.draw(T, { expr: T < OE.humeurFin ? OE.humeur : OE.expr, talk: parle, look, glow, blink });
}

// --- Le texte et les choix -----------------------------------------------------------
let texte = null;                    // { lignes, t0, total, n }
function montrerTexte(lignes) {
  texte = { lignes, t0: rapide ? T - 1e4 : T, total: lignes.reduce((a, l) => a + l.length, 0), n: -1 };
  luEl.textContent = lignes.join(' ');
}
function majTexte() {
  if (!texte) return;
  const n = Math.min(texte.total, Math.floor((T - texte.t0) * CPS));
  if (n === texte.n) return;
  texte.n = n;
  let reste = n;
  sousEl.textContent = '';
  texte.lignes.forEach((l) => {
    if (reste <= 0) return;
    const s = document.createElement('span');
    s.className = 'l';
    s.textContent = l.slice(0, reste);
    reste -= l.length;
    sousEl.appendChild(s);
  });
  const c = document.createElement('span');
  c.className = 'curseur';
  (sousEl.lastChild || sousEl).appendChild(c);
}
async function dire(lignes, cam) {
  lignes = [].concat(lignes).map(typo);
  if (cam) camera(cam);
  montrerTexte(lignes);
  if (rapide) return;
  const n = lignes.reduce((a, l) => a + l.length, 0);
  await attendre(n / CPS + 0.9 + n / 24);
}
function demander(question, options, bonne) {
  OE.expr = 'curieux';
  montrerTexte([typo(question)]);
  if (rapide) return Promise.resolve(bonne || CHOIX_FORCE);
  return attendre(question.length / CPS + 0.35).then(() => new Promise((res) => {
    choixEl.textContent = '';
    options.forEach((op) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.v = op.v;
      if (op.couleur) {
        const p = document.createElement('span');
        p.className = 'pastille';
        p.style.background = op.couleur;
        b.appendChild(p);
      }
      b.appendChild(document.createTextNode(typo(op.label)));
      b.addEventListener('pointerenter', () => { OE.cible = b; });
      b.addEventListener('focus', () => { OE.cible = b; });
      b.addEventListener('pointerleave', () => { if (OE.cible === b) OE.cible = null; });
      b.addEventListener('click', () => {
        if (choixEl.dataset.fait) return;
        choixEl.dataset.fait = '1';
        b.classList.add('pris');
        [...choixEl.children].forEach((x) => { x.disabled = true; });
        OE.cible = b;
        cligner();
        attendre(0.6).then(() => {
          choixEl.hidden = true;
          delete choixEl.dataset.fait;
          OE.cible = null;
          OE.expr = 'neutre';
          res(op.v);
        });
      });
      choixEl.appendChild(b);
    });
    choixEl.hidden = false;
  }));
}

// --- L'histoire -------------------------------------------------------------------
const journal = [];
async function histoire() {
  etape('debut');
  vers(fondu, 1, 3);
  await pause(2.4);
  await dire(TXT.lac, 'large');
  etape('bombe'); await dire(TXT.bombe, 'bombe');
  etape('rivage'); await dire(TXT.rivage, 'rivage');
  etape('ensemble'); await dire(TXT.ensemble, 'foule');
  etape('regle'); await dire(REGLE[F], 'choix');
  await dire(TXT.verif);
  for (const [n, q, bonne] of [[1, TXT.q1, 'vit'], [2, TXT.q2, 'meurent']]) {
    etape(`q${n}`);
    for (;;) {
      const r = await demander(q, COMPRIS, rapide ? bonne : null);
      journal.push({ etape: `compris${n}`, choix: r, juste: r === bonne, formulation: F });
      if (r === bonne) { humeur('emu', 0.9); break; }
      humeur('curieux', 1.6);
      await dire(TXT.non);
      await dire(REGLE[F]);
    }
  }
  await dire(TXT.oui);
  await dire(TXT.aVous);
  etape('choix');
  const c = await demander(TXT.qChoix, COTES);
  journal.push({ etape: 'cote', choix: c, formulation: F });
  etape('apres');
  partir(c);
  vers(brume, 1, 5);
  await dire(TXT.note, 'suivre');
  await pause(3);
  etape('revele');
  OE.expr = 'malicieux';
  await dire(TXT.derniere);
  OE.expr = 'neutre';
  await dire(TXT.lue);
  await dire(REGLE[AUTRE]);
  OE.expr = 'malicieux';
  await dire(TXT.meme);
  OE.expr = 'neutre';
  etape('fin');
  camera('fin', 9);
  vers(fondu, 0, 6);
  await pause(6.5);
  texte = null;
  sousEl.textContent = '';
  panneau.hidden = true;
  $('lue').textContent = F;
  $('fin').hidden = false;
}

// --- Mise en page : la grille de caractères, l'image, la bande des sous-titres ---------
let rendu = null;
let L = null;
function mise() {
  const W = innerWidth, H = innerHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const portrait = W / H < 1;
  const cw = clamp(W / (portrait ? 54 : 120), 7, 13);
  const ch = cw * 2;
  const cols = Math.floor(W / cw), rows = Math.floor(H / ch);
  const ox = (W - cols * cw) / 2, oy = (H - rows * ch) / 2;
  let rect, proj, bande;
  document.documentElement.classList.toggle('portrait', portrait);
  if (portrait) {
    const sr = Math.max(8, Math.round(rows * 0.64));
    rect = { x: ox, y: oy, w: cols * cw, h: sr * ch };
    proj = { x: rect.x + rect.w / 2, y: rect.y + rect.h * 0.5, s: rect.w / 2 };
    bande = null;
    panneau.style.top = `${rect.y + rect.h + 4}px`;
  } else {
    rect = { x: ox, y: oy, w: cols * cw, h: rows * ch };
    proj = { x: rect.x + rect.w / 2, y: rect.y + rect.h * 0.42, s: rect.w / 2 };
    bande = { y0: H * 0.66, y1: H, force: 0.97 };
    panneau.style.top = `${H * 0.70}px`;
  }
  // En portrait l'image est étroite : un objectif plus long, pour que la scène ne soit pas minuscule
  L = { W, H, dpr, cw, ch, cols, rows, ox, oy, rect, proj, bande, focal: portrait ? 2.4 : 1.8, portrait };
  rendu.taille(L);
}

// --- La boucle -------------------------------------------------------------------
async function avancer(jusqua) {
  const pas = 0.05;
  while (T < jusqua - 1e-9) {
    T = Math.min(jusqua, T + pas);
    if (attente && T >= attente.fin) { const r = attente.res; attente = null; r(); }
    majJoueur(pas);
    await new Promise((r) => setTimeout(r, 0));
  }
}
let dernier = null, images = 0;
function boucle(now) {
  const dt = dernier === null ? 0 : Math.min(0.1, (now - dernier) / 1000) * VITESSE;
  dernier = now;
  if (capture && !capture.fait) {
    // Pour les essais : l'histoire avance en accéléré jusqu'à l'instant demandé, puis s'arrête
    if (!capture.enCours) {
      capture.enCours = true;
      avancer(capture.at).then(() => { capture.fait = true; gele = true; });
    }
    requestAnimationFrame(boucle);
    return;
  }
  if (!gele) {
    T += dt;
  }
  if (attente && T >= attente.fin) { const r = attente.res; attente = null; r(); }
  majJoueur(gele ? 0 : dt);
  majOeil();
  majTexte();
  const el = 0.06 + 0.04 * lisse(clamp(T / 150));
  const sn = Math.hypot(0.62, el, 0.78);
  rendu.dessiner({
    T,
    cam: camFinale(),
    focal: L.focal,
    joueur: J,
    brume: val(brume),
    soleil: [-0.62 / sn, el / sn, -0.78 / sn],
    etincelle: 0.5 + 0.5 * Math.sin(T * 23) * Math.sin(T * 7.3 + 1),   // elle crépite
    fondu: val(fondu),
  });
  if (gele && capture && ++images === 3) document.title = 'ready';
  requestAnimationFrame(boucle);
}

// --- Démarrage --------------------------------------------------------------------
const POLICE = '"Plex Mono", ui-monospace, Menlo, Consolas, monospace';
async function demarrer() {
  await Promise.race([document.fonts.load('400 80px "Plex Mono"'), new Promise((r) => setTimeout(r, 2500))]);
  try {
    rendu = creerRendu($('toile'), POLICE);
  } catch (err) {
    $('erreur').hidden = false;
    panneau.hidden = true;
    console.error(err);
    return;
  }
  OE.vue = window.XphiOeil ? window.XphiOeil.create(oeilEl, { small: true }) : null;
  mise();
  let attenteMise = 0;
  addEventListener('resize', () => { clearTimeout(attenteMise); attenteMise = setTimeout(mise, 120); });
  requestAnimationFrame(boucle);
  histoire();
}
window.essai = {
  get T() { return T; },
  get etape() { return etapeCourante; },
  get journal() { return journal.slice(); },
  formulation: F,
};
demarrer();
