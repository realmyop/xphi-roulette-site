/* ==========================================================================
   Le barillet en gros plan (insert), seul objet qui représente l'arme.
   Mille points en spirale, cent points en anneau, six puis quatre chambres :
   d'un cran à l'autre, les points se regroupent sous les yeux du joueur.
   Repère : barillet de rayon 100, mis à l'échelle selon le format.
   ========================================================================== */
import { TAU, clamp, lerp, ease, seg } from './engine.js';
import { CRANS } from './crans.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}) => {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};

const GOLD = Math.PI * (3 - Math.sqrt(5));
const B = 371; // indice du point qui porte la balle dans la spirale de mille
const norm = (a) => ((a % TAU) + TAU) % TAU;

// --- Dispositions --------------------------------------------------------
const sun = (i) => {
  const R = Math.sqrt(42 * 42 + ((i + 0.5) / 1000) * (94 * 94 - 42 * 42));
  return [R * Math.cos(i * GOLD), R * Math.sin(i * GOLD)];
};
const ringAt = (j) => {
  const a = -Math.PI / 2 + (j * TAU) / 100;
  return [80 * Math.cos(a), 80 * Math.sin(a)];
};
const chamberAt = (c, n) => {
  const a = -Math.PI / 2 + (c * TAU) / n;
  return [58 * Math.cos(a), 58 * Math.sin(a)];
};
const CH_R = { 6: 21, 4: 25 };

// --- Correspondances précalculées entre dispositions ----------------------
// 1000 → 100 : chaque point rejoint le point de l'anneau le plus proche en angle
const P1000 = [], RING = [], P100 = [], P6 = [];
for (let i = 0; i < 1000; i++) {
  const p = sun(i);
  P1000.push(p);
  const j = Math.round(norm(Math.atan2(p[1], p[0]) + Math.PI / 2) / (TAU / 100)) % 100;
  RING.push(j);
  P100.push(ringAt(j));
}
// 100 → 6 : les points se répartissent sur le contour de la chambre la plus proche
const chamberOfRing = (j) => Math.round(j / (100 / 6)) % 6;
const byChamber = [[], [], [], [], [], []];
for (let i = 0; i < 1000; i++) byChamber[chamberOfRing(RING[i])].push(i);
byChamber.forEach((list, c) => {
  const [cx, cy] = chamberAt(c, 6);
  const a0 = -Math.PI / 2 + (c * TAU) / 6;
  list.forEach((i, q) => {
    const phi = a0 + (q / list.length) * TAU;
    P6[i] = [cx + 21 * Math.cos(phi), cy + 21 * Math.sin(phi)];
  });
});
// La balle suit le même chemin que son point
const RING_B = RING[B];
const CH6_B = chamberOfRing(RING_B);
const CH4_B = Math.round((CH6_B * 60) / 90) % 4;
// 6 → 4 : la chambre de la balle d'abord, puis les plus proches ; deux disparaissent
const MAP64 = [-1, -1, -1, -1, -1, -1];
MAP64[CH6_B] = CH4_B;
for (let q = 0; q < 4; q++) {
  if (q === CH4_B) continue;
  let best = -1, bestD = 1e9;
  for (let c = 0; c < 6; c++) {
    if (MAP64[c] !== -1) continue;
    const dd = Math.abs(norm(((c * 60 - q * 90) * Math.PI) / 180 + Math.PI) - Math.PI);
    if (dd < bestD) { bestD = dd; best = c; }
  }
  MAP64[best] = q;
}

// Position, rayon et halo de la balle pour chaque barillet
function bulletOf(n) {
  if (n === 1000) return { p: P1000[B], r: 2.75, halo: 6.5, ho: 1 };
  if (n === 100) return { p: ringAt(RING_B), r: 4.4, halo: 10, ho: 1 };
  if (n === 6) return { p: chamberAt(CH6_B, 6), r: 21, halo: 21, ho: 0 };
  return { p: chamberAt(CH4_B, 4), r: 25, halo: 25, ho: 0 };
}

// Angle (degrés) de la balle au repos : sert à décider où le barillet s'arrête
export function bulletAngle(n) {
  const [x, y] = bulletOf(n).p;
  return (Math.atan2(y, x) * 180) / Math.PI;
}

// Mise en page selon le format. « full » : gros plan plein cadre, sur fond ;
// « medal » : médaillon posé sur le noir de l'iris, à côté du berceau visé.
const LAYOUT = {
  phone: {
    full: { x: 0, y: -95, s: 2.45, lx: 0, ly: 262, anchor: 'middle', frac: 82, phrase: 38 },
    medal: { x: -235, y: 330, s: 1.05, lx: -100, ly: 330, anchor: 'start', frac: 66, phrase: 28 },
  },
  screen: {
    full: { x: 0, y: -175, s: 2.1, lx: 0, ly: 135, anchor: 'middle', frac: 74, phrase: 32 },
    medal: { x: 420, y: -70, s: 1.55, lx: 420, ly: 175, anchor: 'middle', frac: 62, phrase: 28 },
  },
};

// Mélange de deux couleurs #rrggbb
const hex = (c) => c.trim().replace('#', '').match(/../g).map((h) => parseInt(h, 16));
const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`;

export function createInsert(svg, { isScreen }) {
  const L = isScreen ? LAYOUT.screen : LAYOUT.phone;
  // Téléphone : on remplit le cadre vertical (les bords gauche et droit sont rognés)
  if (!isScreen) svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  const bg = el('rect', { x: -3000, y: -3000, width: 6000, height: 6000, class: 'i-bg' });
  const wrap = el('g');
  const mark = el('line', { x1: 0, y1: -100, x2: 0, y2: -90, class: 'i-mark' });
  const cyl = el('g');
  const guide = el('circle', { r: 85, class: 'i-guide' });
  const axis = el('circle', { r: 7, class: 'i-line' });
  const dotsG = el('g');
  const dots = Array.from({ length: 1000 }, () => {
    const c = el('circle', { class: 'i-dot' });
    dotsG.append(c);
    return c;
  });
  const chG = el('g');
  const chambers = Array.from({ length: 6 }, () => {
    const c = el('circle', { class: 'i-ch' });
    chG.append(c);
    return c;
  });
  const halo = el('circle', { class: 'i-halo' });
  const bullet = el('circle', { class: 'i-bullet' });
  cyl.append(guide, axis, dotsG, chG, halo, bullet);
  wrap.append(mark, cyl);
  const frac = el('text', { class: 'i-frac' });
  const phrase = el('text', { class: 'i-phrase' });
  svg.append(bg, wrap, frac, phrase);

  // Encre : foncée sur le fond du gros plan, claire sur le noir de l'iris
  const css = getComputedStyle(svg);
  const inkFull = hex(css.getPropertyValue('--ins-ink'));
  const inkMedal = hex(css.getPropertyValue('--ins-ink-medal'));

  let lastKey = null;

  // Points et chambres : recalculés seulement quand la forme change
  function shape(b) {
    const from = b.n, to = b.to || null, k = to ? b.k : 0;
    const appear = b.appear ?? 1;
    for (let i = 0; i < 1000; i++) {
      let x = 0, y = 0, r = 0, o = 0;
      const ki = seg(k, 0.3 * (i / 1000), 0.3 * (i / 1000) + 0.7, ease.inOut); // vague
      if (!to && from === 1000) {
        [x, y] = P1000[i]; r = 1.45; o = clamp((appear * 1.15 - i / 1000) * 8);
      } else if (!to && from === 100) {
        [x, y] = P100[i]; r = 2.3; o = 1;
      } else if (from === 1000 && to === 100) {
        x = lerp(P1000[i][0], P100[i][0], ki); y = lerp(P1000[i][1], P100[i][1], ki);
        r = lerp(1.45, 2.3, ki); o = 1;
      } else if (from === 100 && to === 6) {
        x = lerp(P100[i][0], P6[i][0], ki); y = lerp(P100[i][1], P6[i][1], ki);
        r = lerp(2.3, 1.1, ki); o = 1 - seg(k, 0.55, 1, ease.lin);
      }
      if (i === B) o = 0; // la balle est dessinée à part
      const d = dots[i];
      if (o <= 0) { d.style.display = 'none'; continue; }
      d.style.display = '';
      d.setAttribute('cx', x.toFixed(2)); d.setAttribute('cy', y.toFixed(2));
      d.setAttribute('r', r); d.style.opacity = o;
    }
    // Chambres
    let chO = 0;
    if (!to && (from === 6 || from === 4)) chO = 1;
    else if (from === 100 && to === 6) chO = seg(k, 0.45, 1, ease.lin);
    else if (from === 6 && to === 4) chO = 1;
    chambers.forEach((c, i) => {
      let x, y, r, o = chO;
      if (from === 4 && !to) {
        if (MAP64[i] < 0) o = 0;
        else { [x, y] = chamberAt(MAP64[i], 4); r = 25; }
      } else if (from === 6 && to === 4) {
        const [x6, y6] = chamberAt(i, 6);
        if (MAP64[i] < 0) { x = x6; y = y6; r = lerp(21, 0, ease.inOut(k)); o = 1 - k; }
        else {
          const [x4, y4] = chamberAt(MAP64[i], 4);
          x = lerp(x6, x4, ease.inOut(k)); y = lerp(y6, y4, ease.inOut(k)); r = lerp(21, 25, ease.inOut(k));
        }
      } else { [x, y] = chamberAt(i, 6); r = 21; }
      if (o <= 0) { c.style.display = 'none'; return; }
      c.style.display = '';
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r); c.style.opacity = o;
    });
    guide.style.opacity = chO;
    axis.style.opacity = chO;
    guide.setAttribute('r', to === 4 ? lerp(85, 89, k) : from === 4 ? 89 : 85);
  }

  function apply(s) {
    if (!(s.insert > 0)) { svg.style.visibility = 'hidden'; return; }
    svg.style.visibility = 'visible';
    svg.style.opacity = s.insert;
    const b = s.bar;

    // Gros plan ou médaillon
    const m = ease.inOut(s.medal || 0);
    const F = L.full, M = L.medal;
    wrap.setAttribute('transform', `translate(${lerp(F.x, M.x, m)} ${lerp(F.y, M.y, m)}) scale(${lerp(F.s, M.s, m)})`);
    bg.style.opacity = 1 - m;
    svg.style.setProperty('--ins-ink-now', mix(inkFull, inkMedal, m));
    const lay = m < 0.5 ? F : M;
    const fs = lerp(F.frac, M.frac, m), ps = lerp(F.phrase, M.phrase, m);
    const ly = lerp(F.ly, M.ly, m), lx = lerp(F.lx, M.lx, m);
    frac.setAttribute('x', lx); frac.setAttribute('y', ly); frac.setAttribute('font-size', fs);
    phrase.setAttribute('x', lx); phrase.setAttribute('y', ly + ps * 1.6); phrase.setAttribute('font-size', ps);
    frac.setAttribute('text-anchor', lay.anchor); phrase.setAttribute('text-anchor', lay.anchor);
    const key = `${b.n}|${b.to || ''}|${(b.k || 0).toFixed(3)}|${(b.appear ?? 1).toFixed(3)}`;
    if (key !== lastKey) { shape(b); lastKey = key; }

    cyl.setAttribute('transform', `rotate(${b.rot || 0})`);
    mark.setAttribute('transform', `translate(0 ${(b.hammer || 0) * 7})`);
    wrap.style.opacity = b.op ?? 1;

    // La balle (et son halo, pour qu'on la trouve parmi mille)
    const A = bulletOf(b.n), Z = b.to ? bulletOf(b.to) : A;
    const k = b.to ? ease.inOut(b.k) : 0;
    let x = lerp(A.p[0], Z.p[0], k), y = lerp(A.p[1], Z.p[1], k);
    const load = b.load ?? 1;
    if (load < 1) { x = lerp(0, x, ease.out(load)); y = lerp(-260, y, ease.out(load)); }
    bullet.setAttribute('cx', x); bullet.setAttribute('cy', y);
    bullet.setAttribute('r', lerp(A.r, Z.r, k));
    bullet.style.opacity = load > 0 ? 1 : 0;
    halo.setAttribute('cx', x); halo.setAttribute('cy', y);
    halo.setAttribute('r', lerp(A.halo, Z.halo, k));
    halo.style.opacity = lerp(A.ho, Z.ho, k) * seg(load, 0.8, 1, ease.lin);

    // Le risque, écrit : il s'efface au milieu du changement de barillet
    const n = b.to ? (b.k < 0.5 ? b.n : b.to) : s.riskN || b.n;
    const cran = CRANS.find((c) => c.n === n);
    if (frac.textContent !== cran.frac) { frac.textContent = cran.frac; phrase.textContent = cran.phrase; }
    let dip = b.to ? Math.abs(1 - 2 * b.k) : 1;
    if (F.anchor !== M.anchor) dip *= Math.abs(1 - 2 * m); // l'étiquette change de place
    const ro = (s.risk || 0) * dip * (b.op ?? 1);
    frac.style.opacity = ro; phrase.style.opacity = ro;
  }

  apply.reset = () => (lastKey = null);
  return apply;
}
