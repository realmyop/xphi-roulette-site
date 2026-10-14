/* ==========================================================================
   Décor « maison » — extérieur, plan d'ouverture du film.
   La maison à pignon en début d'après-midi, vue du jardin. Un grand arbre
   flou au premier plan à gauche, des herbes floues en bas, des ombres de
   feuillage qui glissent sur la façade. Le soleil vient de la droite, en
   avant de la façade : c'est lui qui entre par la fenêtre de la chambre,
   à l'étage, au centre.
   ========================================================================== */
import { P, lin, rad, rng, along } from '../kit.js';
import { TAU, clamp, lerp } from '../../film/engine.js';

/* ---------- Outils de tracé ---------- */
const q = (v) => Math.round(v * 10) / 10;
const XY = (p) => `${q(p[0])} ${q(p[1])}`;
const pl = (a) => a.map((p) => `${q(p[0])},${q(p[1])}`).join(' ');

// Courbe lisse fermée passant par les points (Catmull-Rom → Bézier)
function lisse(p) {
  const n = p.length;
  let d = `M${XY(p[0])}`;
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n], b = p[i], c = p[(i + 1) % n], e = p[(i + 2) % n];
    d += `C${XY([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6])} ${XY([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6])} ${XY(c)}`;
  }
  return d + 'Z';
}
// Courbe lisse ouverte ; « suite » la raccorde au tracé précédent
function trace(p, suite = false) {
  let d = suite ? `L${XY(p[0])}` : `M${XY(p[0])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || p[i + 1];
    d += `C${XY([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6])} ${XY([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6])} ${XY(c)}`;
  }
  return d;
}
const ruban = (g, d) => trace(g) + trace(d.slice().reverse(), true) + 'Z';
// Tige effilée le long d'une ligne médiane
function tige(p, w0, w1) {
  const L = [], R = [];
  p.forEach((m, i) => {
    const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * (i / (p.length - 1))) / 2;
    L.push([m[0] + (dy / l) * w, m[1] - (dx / l) * w]);
    R.push([m[0] - (dy / l) * w, m[1] + (dx / l) * w]);
  });
  return ruban(L, R);
}
// Tache organique (contour irrégulier lissé)
function tache(r, cx, cy, rx, ry, n = 9, jit = 0.22) {
  const p = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + (r() - 0.5) * 0.35;
    const k = 1 + (r() - 0.5) * 2 * jit;
    p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return lisse(p);
}
// Couronne : lobes répartis en tournesol (couverture régulière, sans trous)
function couronne(seed, cx, cy, rx, ry, n, r0, r1) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const d = Math.sqrt((i + 0.5) / n) * 0.92, a = i * 2.39996 + r() * 0.5;
    out.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, r0 + r() * (r1 - r0), Math.floor(r() * 1e6)]);
  }
  return out.sort((u, v) => u[1] - v[1]);
}
// Touffes semées dans une ellipse : [x, y, rayon, graine]
function semis(seed, cx, cy, rx, ry, n, r0, r1, haut = false) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const a = haut ? Math.PI + r() * Math.PI : r() * TAU, d = Math.sqrt(r());
    out.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, r0 + r() * (r1 - r0), Math.floor(r() * 1e6)]);
  }
  return out.sort((u, v) => u[1] - v[1]);
}
// Feuillage peint : une masse unique éclairée d'en haut à droite (dégradé d'ensemble),
// modelée par des croissants de lumière et des creux d'ombre fondus, puis des touches de feuilles
function feuillage(id, lobes, t, o = {}) {
  const lum = o.lum || [0.62, -0.78], flou = o.flou ?? 3, nf = o.feuilles ?? 10;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y, r] of lobes) { x0 = Math.min(x0, x - r); x1 = Math.max(x1, x + r); y0 = Math.min(y0, y - r); y1 = Math.max(y1, y + r); }
  let sil = '', clair = '', creux = '', feuilles = '', sombres = '';
  const a0 = Math.atan2(lum[1], lum[0]);
  for (const [x, y, r, sd] of lobes) {
    const rr = rng(sd);
    sil += `<path d="${tache(rr, x, y, r, r * 0.9, 12, 0.13)}"/>`;
    // festons : petites touffes qui découpent le bord
    const nb = 5 + Math.floor(rr() * 5);
    for (let i = 0; i < nb; i++) {
      const a = rr() * TAU, d = r * (0.8 + rr() * 0.14), s = r * (0.13 + rr() * 0.13);
      sil += `<path d="${tache(rr, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.9, s, s * 0.85, 7, 0.25)}"/>`;
    }
    clair += `<path d="${tache(rng(sd + 1), x + lum[0] * r * 0.3, y + lum[1] * r * 0.3, r * 0.7, r * 0.58, 10, 0.2)}"/>`;
    creux += `<path d="${tache(rng(sd + 2), x - lum[0] * r * 0.45, y - lum[1] * r * 0.55, r * 0.6, r * 0.38, 9, 0.25)}"/>`;
    for (let i = 0; i < nf; i++) {
      const a = a0 + (rr() - 0.5) * 1.9, d = r * (0.55 + rr() * 0.42), s = Math.max(1.6, r * (0.04 + rr() * 0.06));
      const fx = x + Math.cos(a) * d, fy = y + Math.sin(a) * d;
      feuilles += `<ellipse cx="${q(fx)}" cy="${q(fy)}" rx="${q(s)}" ry="${q(s * 0.62)}" transform="rotate(${q(rr() * 180)} ${q(fx)} ${q(fy)})"/>`;
      const b = a0 + Math.PI + (rr() - 0.5) * 2, e = r * (0.3 + rr() * 0.6);
      const gx = x + Math.cos(b) * e, gy = y + Math.sin(b) * e;
      sombres += `<ellipse cx="${q(gx)}" cy="${q(gy)}" rx="${q(s * 1.1)}" ry="${q(s * 0.7)}" transform="rotate(${q(rr() * 180)} ${q(gx)} ${q(gy)})"/>`;
    }
  }
  return `
  <defs>
    <linearGradient id="${id}-g" gradientUnits="userSpaceOnUse" x1="${q(x1)}" y1="${q(y0)}" x2="${q(x0)}" y2="${q(y1)}">
      <stop offset="0" stop-color="${t.lumiere}"/><stop offset="0.42" stop-color="${t.moyen}"/><stop offset="1" stop-color="${t.ombre}"/>
    </linearGradient>
    <clipPath id="${id}-c">${sil}</clipPath>
    <filter id="${id}-f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${flou}"/></filter>
  </defs>
  <g fill="url(#${id}-g)">${sil}</g>
  <g clip-path="url(#${id}-c)">
    <g filter="url(#${id}-f)">
      <g fill="${t.creux}" opacity="0.6">${creux}</g>
      <g fill="${t.lumiere}" opacity="0.7">${clair}</g>
    </g>
    <g fill="${t.creux}" opacity="0.35">${sombres}</g>
    <g fill="${t.eclat}" opacity="0.55">${feuilles}</g>
  </g>`;
}
// Gammes de feuillage (de la plus lointaine à la plus proche)
const F_LOIN_G = { ombre: '#84948f', moyen: '#9ba690', lumiere: '#c2c09a', eclat: '#e0d8b0', creux: '#77867f' };
const F_LOIN_D = { ombre: '#61716f', moyen: '#7c8a78', lumiere: '#a8ab83', eclat: '#cfc79a', creux: '#53625f' };
const F_HAIE = { ombre: '#55665d', moyen: '#6f7f61', lumiere: '#a3a672', eclat: '#d0c78e', creux: '#46564e' };
const F_BUISSON = { ombre: '#2c3c35', moyen: '#4d5d3f', lumiere: '#869155', eclat: '#cdc27e', creux: '#1f2c27' };
const F_BUISSON_OMBRE = { ombre: '#33413a', moyen: '#435248', lumiere: '#5d6b55', eclat: '#7d8968', creux: '#27322d' };
const F_LIERRE = { ombre: '#3b493d', moyen: '#5a6a47', lumiere: '#909b5e', eclat: '#c8c388', creux: '#2c382f' };
const F_ARBRE = { ombre: '#1a2521', moyen: '#2b3b30', lumiere: '#56683e', eclat: '#a6a35c', creux: '#111814' };

/* ---------- Géométrie de la maison ---------- */
const VP = [-3400, 792];                                   // fuite à gauche, sur l'horizon
const G = { L: 740, R: 1340, base: 905, eave: 455, px: 1040, py: 205, prof: 110 };
const PENTE = (G.eave - G.py) / (G.px - G.L);
const DV = 24 * Math.hypot(1, PENTE);                     // débord du toit (vertical)
const EP = 15;                                             // épaisseur de la rive
const yRive = (x) => G.py - DV + PENTE * Math.abs(x - G.px);
const fond = (p) => along(VP, p, p[0] - G.prof);
const XG = G.L - 34, XD = G.R + 34;
const FACADE = [[G.L, G.base], [G.L, G.eave], [G.px, G.py], [G.R, G.eave], [G.R, G.base]];
const COTE = [[G.L, G.eave], fond([G.L, G.eave]), fond([G.L, G.base]), [G.L, G.base]];
const A1 = [XG, yRive(XG)], A2 = [G.px, yRive(G.px)], A3 = [XD, yRive(XD)];
const PAN = [A2, fond(A2), fond(A1), A1];
const FEN = { x: 955, y: 400, w: 170, h: 224 };           // fenêtre de la chambre
const WC = [FEN.x + FEN.w / 2, FEN.y + FEN.h / 2];         // son centre (1040, 512)

/* ---------- Calque 1 : ciel et lointains ---------- */
function crete(seed, x0, x1, y, amp, step) {
  const r = rng(seed), p = [];
  for (let x = x0; x <= x1 + step; x += step) p.push([x, y - amp * (0.5 + 0.5 * Math.sin(x * 0.0035 + 1.7)) - r() * amp * 0.4]);
  return trace(p) + `L${x1 + step} 1000L${x0} 1000Z`;
}
const lisiere = (seed, x0, x1, y, h) => {
  const r = rng(seed);
  let s = '';
  for (let x = x0; x < x1; x += 26 + r() * 30) s += `<path d="${tache(r, x, y - h * (0.3 + r() * 0.7), 22 + r() * 30, 18 + r() * 22)}"/>`;
  return s;
};
const CIEL = `
<defs>
  ${lin('maison-ciel', [[0, '#84a7bd'], [0.32, '#a9c4cf'], [0.56, '#cfdcd6'], [0.74, P.skyWarm], [1, '#efd8b0']])}
  ${rad('maison-halo', [[0, '#fff6dc', 0.9], [0.25, '#fde6b6', 0.45], [1, P.skyWarm, 0]])}
  ${lin('maison-loin', [[0, '#bccac8'], [1, '#d3d6c6']])}
  ${lin('maison-proche', [[0, '#a2b0a0'], [1, '#c0c3a8']])}
</defs>
<rect x="-160" y="-120" width="2240" height="1120" fill="url(#maison-ciel)"/>
<ellipse cx="2080" cy="-120" rx="1000" ry="720" fill="url(#maison-halo)"/>
<path d="${crete(11, -160, 2080, 772, 46, 150)}" fill="url(#maison-loin)"/>
<g fill="#b3c0b8" opacity="0.9">${lisiere(12, -160, 2080, 800, 40)}</g>
<path d="${crete(13, -160, 2080, 806, 20, 110)}" fill="url(#maison-proche)"/>
`;

/* ---------- Calque 2 : nuages (dérivent à peine) ---------- */
function nuage(id, cx, cy, w, h, seed, tons) {
  const r = rng(seed), n = Math.max(4, Math.round(w / 52)), bulles = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), cloche = Math.sin(Math.PI * (0.1 + 0.8 * u));
    const rr = h * (0.22 + 0.5 * cloche) * (0.8 + 0.4 * r());
    bulles.push([cx - w / 2 + w * u + (r() - 0.5) * 24, cy + h * 0.2 - rr * (0.5 + 0.35 * r()), rr]);
  }
  for (let i = 0; i < n / 2; i++) {
    const u = 0.25 + 0.5 * r(), rr = h * (0.25 + 0.25 * r());
    bulles.push([cx - w / 2 + w * u, cy - h * 0.25 - rr * 0.4, rr]);
  }
  const ronds = (dx, dy, s) => bulles.map(([x, y, rr]) => `<circle cx="${q(x + dx * rr)}" cy="${q(y + dy * rr)}" r="${q(rr * s)}"/>`).join('');
  const sole = `<ellipse cx="${cx}" cy="${q(cy + h * 0.18)}" rx="${q(w * 0.47)}" ry="${q(h * 0.14)}"/>`;
  return `<clipPath id="${id}">${ronds(0, 0, 1)}${sole}</clipPath>
  <g fill="${tons[0]}">${ronds(0, 0, 1)}${sole}</g>
  <g clip-path="url(#${id})">
    <g fill="${tons[1]}">${ronds(0.16, -0.24, 0.9)}</g>
    <g fill="${tons[2]}">${ronds(0.3, -0.4, 0.68)}</g>
  </g>`;
}
const TONS_NUAGE = ['#c9cbd3', '#e8e5df', '#fbf4e6'];
const TONS_NUAGE_CHAUD = ['#d2cdcc', '#f0e7da', '#fff8ea'];
const NUAGES = `
${nuage('maison-n1', 380, 170, 560, 150, 21, TONS_NUAGE)}
${nuage('maison-n2', 1530, 120, 620, 170, 22, TONS_NUAGE_CHAUD)}
<g opacity="0.75">
  ${nuage('maison-n4', 1700, 610, 760, 52, 24, TONS_NUAGE_CHAUD)}
  ${nuage('maison-n5', 200, 650, 520, 42, 25, TONS_NUAGE)}
</g>`;

/* ---------- Calque 3 : la maison et le jardin ---------- */
// Carreaux de la fenêtre de la chambre (aussi utilisés par le reflet animé)
const VITRES = (() => {
  const { x, y, w, h } = FEN, ix = x + 11, iy = y + 21, iw = w - 34, ih = h - 32;
  const mx = ix + iw / 2, by = iy + ih * 0.34;
  return [
    [ix, iy, iw / 2 - 5, by - 4 - iy], [mx + 5, iy, iw / 2 - 5, by - 4 - iy],
    [ix, by + 4, iw / 2 - 5, iy + ih - by - 4], [mx + 5, by + 4, iw / 2 - 5, iy + ih - by - 4],
  ];
})();
// Fenêtre de la chambre : embrasure, intérieur sombre, rideaux de lin, châssis, appui
function fenetreChambre() {
  const { x, y, w, h } = FEN;
  const rv = 12, sv = 10, fr = 11;
  const gx = x, gy = y + sv, gw = w - rv, gh = h - sv;
  const ix = gx + fr, iy = gy + fr, iw = gw - 2 * fr, ih = gh - 2 * fr;
  const mx = ix + iw / 2, by = iy + ih * 0.34;
  const vitres = VITRES;
  const rect = ([a, b, c, d]) => `M${q(a)} ${q(b)}h${q(c)}v${q(d)}h${q(-c)}Z`;
  // Rideaux mi-tirés : bord intérieur légèrement galbé
  const rg = [[ix - 3, iy + 4], [ix + 44, iy + 4], [ix + 41, iy + 60], [ix + 42, iy + 130], [ix + 50, iy + ih + 1], [ix - 3, iy + ih + 1]];
  const rdx = ix + iw;
  const rd = [[rdx + 3, iy + 4], [rdx - 38, iy + 4], [rdx - 36, iy + 64], [rdx - 37, iy + 134], [rdx - 44, iy + ih + 1], [rdx + 3, iy + ih + 1]];
  const plis = (x0, sens, n, ton, larg, op) =>
    Array.from({ length: n }, (_, i) => {
      const xx = x0 + sens * (8 + i * 11);
      return `<path d="${trace([[xx, iy + 6], [xx - sens * 1, iy + 70], [xx, iy + 132], [xx + sens * 4, iy + ih]])}" stroke="${ton}" stroke-width="${larg}" fill="none" opacity="${op}"/>`;
    }).join('');
  return `
  <defs>
    ${rad('maison-dedans', [[0, '#9a9d94'], [0.55, '#6f777a'], [1, '#4f585f']], 0.5, 0.25, 0.75)}
    ${lin('maison-lin-g', [[0, '#e7d7b8'], [0.6, P.linen], [1, '#fff3dc']], 0, 0, 1, 0)}
    ${lin('maison-lin-d', [[0, '#d9cbb0'], [1, '#c9bba2']], 0, 0, 1, 0)}
    <linearGradient id="maison-reflet" gradientUnits="userSpaceOnUse" x1="${ix}" y1="${iy}" x2="${ix + iw}" y2="${iy + ih}">
      <stop offset="0" stop-color="#eef4f3" stop-opacity="0.5"/><stop offset="0.42" stop-color="#e3ecee" stop-opacity="0.12"/>
      <stop offset="0.6" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#fff6e6" stop-opacity="0.16"/>
    </linearGradient>
  </defs>
  <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="url(#maison-dedans)"/>
  <path d="M${ix + 44} ${iy + 70}L${ix + iw - 44} ${iy + 58}L${ix + iw - 46} ${iy + 132}L${ix + 48} ${iy + 146}Z" fill="#cdb489" opacity="0.38" filter="url(#maison-flou5)"/>
  <!-- Le mobile du berceau, à peine visible dans la pénombre -->
  <g opacity="0.75">
    <path d="M${rdx - 20} ${iy + 120} Q${mx + 4} ${iy + 112} ${mx - 6} ${iy + 126}" stroke="#7d6a52" stroke-width="2" fill="none"/>
    <line x1="${mx + 10}" y1="${iy + 118}" x2="${mx + 10}" y2="${iy + 156}" stroke="#8b8a86" stroke-width="0.8"/>
    <line x1="${mx - 6}" y1="${iy + 126}" x2="${mx - 6}" y2="${iy + 168}" stroke="#8b8a86" stroke-width="0.8"/>
    <path d="M${mx + 10} ${iy + 153}l2.4 5 5.4 .6-4 3.6 1.1 5.3-4.9-2.7-4.9 2.7 1.1-5.3-4-3.6 5.4-.6z" fill="#b89d5c"/>
    <path d="M${mx - 2} ${iy + 166}a7 7 0 1 1-6-9 5.5 5.5 0 1 0 6 9z" fill="#8aa0ab"/>
  </g>
  <line x1="${ix - 2}" y1="${iy + 5}" x2="${ix + iw + 2}" y2="${iy + 5}" stroke="#9a8e7e" stroke-width="2.5"/>
  <path d="M${rg[0][0]} ${rg[0][1]}${trace(rg.slice(1, 5), true)}L${rg[5][0]} ${rg[5][1]}Z" fill="url(#maison-lin-g)"/>
  ${plis(ix + 2, 1, 4, P.linenShade, 4, 0.75)}
  ${plis(ix + 7, 1, 3, '#fff6e2', 2.5, 0.8)}
  <path d="M${rd[0][0]} ${rd[0][1]}${trace(rd.slice(1, 5), true)}L${rd[5][0]} ${rd[5][1]}Z" fill="url(#maison-lin-d)"/>
  ${plis(rdx - 2, -1, 3, '#b9aa8f', 4, 0.6)}
  <path d="${vitres.map(rect).join('')}" fill="url(#maison-reflet)"/>
  <path d="M${ix + 6} ${iy + 30} q30 -20 52 -6 q-28 -2 -52 22z" fill="#ffffff" opacity="0.18"/>
  <!-- Châssis blanc cassé -->
  <path d="${rect([gx, gy, gw, gh])}${vitres.map(rect).join('')}" fill="#ece6da" fill-rule="evenodd"/>
  <path d="M${gx} ${gy + gh - 2}h${gw}" stroke="#fff8ec" stroke-width="2"/>
  <!-- Ombres portées du linteau et du tableau droit sur le châssis -->
  <path d="M${gx} ${gy}H${gx + gw}V${gy + gh}H${gx + gw - 9}L${gx + gw - 11} ${gy + 9}L${gx} ${gy + 6}Z" fill="#6f7c98" opacity="0.32"/>
  <!-- Embrasure : tableau droit et sous-face du linteau, à l'ombre -->
  <polygon points="${pl([[x + w - rv, y + sv], [x + w, y], [x + w, y + h], [x + w - rv, y + h]])}" fill="#9ea3a8"/>
  <polygon points="${pl([[x, y], [x + w, y], [x + w - rv, y + sv], [x, y + sv]])}" fill="#a2a3a2"/>
  <!-- Appui -->
  <rect x="${x - 6}" y="${y + h + 10}" width="${w + 12}" height="18" fill="#7f8ca6" opacity="0.45" filter="url(#maison-flou5)"/>
  <rect x="${x - 10}" y="${y + h}" width="${w + 20}" height="12" fill="#efe4cb"/>
  <path d="M${x - 10} ${y + h + 1}h${w + 20}" stroke="#fff7e6" stroke-width="2.5"/>
  <path d="M${x - 10} ${y + h + 11}h${w + 20}" stroke="#a9a196" stroke-width="2"/>`;
}

// Fenêtre du rez-de-chaussée et porte, plus simples
function fenetreBas(x, y, w, h) {
  const rv = 10, sv = 8, fr = 9, gx = x, gy = y + sv, gw = w - rv, gh = h - sv;
  const ix = gx + fr, iy = gy + fr, iw = gw - 2 * fr, ih = gh - 2 * fr, mx = ix + iw / 2;
  const v = [[ix, iy, iw / 2 - 4, ih], [mx + 4, iy, iw / 2 - 4, ih]];
  const rect = ([a, b, c, d]) => `M${q(a)} ${q(b)}h${q(c)}v${q(d)}h${q(-c)}Z`;
  return `
  <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="#525b62"/>
  <path d="${v.map(rect).join('')}" fill="#8e9ea4" opacity="0.35"/>
  <path d="M${ix + 4} ${iy + ih * 0.7}L${ix + iw * 0.45} ${iy}h18L${ix + 22} ${iy + ih * 0.95}z" fill="#dfe9ea" opacity="0.22"/>
  <path d="${rect([gx, gy, gw, gh])}${v.map(rect).join('')}" fill="#e9e2d5" fill-rule="evenodd"/>
  <path d="M${gx} ${gy}H${gx + gw}V${gy + gh}H${gx + gw - 10}L${gx + gw - 12} ${gy + 14}L${gx} ${gy + 10}Z" fill="#6f7c98" opacity="0.34"/>
  <polygon points="${pl([[x + w - rv, y + sv], [x + w, y], [x + w, y + h], [x + w - rv, y + h]])}" fill="#9ea3a8"/>
  <polygon points="${pl([[x, y], [x + w, y], [x + w - rv, y + sv], [x, y + sv]])}" fill="#91969f"/>
  <rect x="${x - 4}" y="${y + h + 8}" width="${w + 8}" height="14" fill="#7f8ca6" opacity="0.42" filter="url(#maison-flou5)"/>
  <rect x="${x - 8}" y="${y + h}" width="${w + 16}" height="10" fill="#ece0c6"/>
  <path d="M${x - 8} ${y + h + 1}h${w + 16}" stroke="#fff5e2" stroke-width="2"/>`;
}
function porte(x, y, w, h) {
  const rv = 10, sv = 8;
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#7f8a81"/>
  <rect x="${x}" y="${y + sv}" width="${w - rv}" height="${h - sv}" fill="url(#maison-porte)"/>
  <g fill="none" stroke="#6c766e" stroke-width="2.2">
    <rect x="${x + 12}" y="${y + 24}" width="${w - rv - 24}" height="${h * 0.36}" rx="2"/>
    <rect x="${x + 12}" y="${y + 40 + h * 0.36}" width="${w - rv - 24}" height="${h * 0.4}" rx="2"/>
  </g>
  <g fill="none" stroke="#b9c2b8" stroke-width="1.6" opacity="0.8">
    <path d="M${x + 12} ${y + 24 + h * 0.36}h${w - rv - 24}M${x + 12} ${y + 40 + h * 0.76}h${w - rv - 24}"/>
  </g>
  <circle cx="${x + 9}" cy="${y + h * 0.55}" r="3.6" fill="#c9cdd0"/>
  <circle cx="${x + 10}" cy="${y + h * 0.55 - 1}" r="1.4" fill="#f4f4ef"/>
  <path d="M${x} ${y + sv}H${x + w - rv}V${y + h}H${x + w - rv - 12}L${x + w - rv - 14} ${y + sv + 14}L${x} ${y + sv + 10}Z" fill="#59607a" opacity="0.32"/>
  <polygon points="${pl([[x + w - rv, y + sv], [x + w, y], [x + w, y + h], [x + w - rv, y + h]])}" fill="#9ea3a8"/>
  <polygon points="${pl([[x, y], [x + w, y], [x + w - rv, y + sv], [x, y + sv]])}" fill="#91969f"/>
  <rect x="${x - 10}" y="${y + h - 2}" width="${w + 20}" height="12" fill="#d9d1c0"/>
  <path d="M${x - 10} ${y + h - 1}h${w + 20}" stroke="#f3ecdc" stroke-width="2"/>
  <rect x="${x - 10}" y="${y + h + 9}" width="${w + 20}" height="5" fill="#8c8576" opacity="0.6"/>`;
}

// Tiges de la plante grimpante, sur l'angle gauche de la façade
const TIGES = [
  [[752, 906], [745, 830], [751, 750], [746, 670], [756, 600], [762, 556]],
  [[748, 840], [770, 800], [792, 752], [806, 700]],
  [[746, 780], [734, 730], [726, 676]],
];
function maison() {
  const ardoises = Array.from({ length: 11 }, (_, i) => {
    const k = (i + 0.6) / 11, p0 = [lerp(A1[0], A2[0], k), lerp(A1[1], A2[1], k)];
    return `<line x1="${q(p0[0])}" y1="${q(p0[1])}" x2="${q(p0[0] - 240)}" y2="${q(along(VP, p0, p0[0] - 240)[1])}"/>`;
  }).join('');
  // Lierre : feuilles pointues une à une le long des tiges, éclairées selon leur orientation
  const lierre = (() => {
    const r = rng(41), tons = ['#2f3d33', '#43543c', '#5f7046', '#8b9659', '#b9b878'];
    let f = '';
    TIGES.forEach((t) => {
      for (let k = 0; k < t.length - 1; k++) {
        for (let u = 0; u < 1; u += 0.07) {
          const x = lerp(t[k][0], t[k + 1][0], u), y = lerp(t[k][1], t[k + 1][1], u);
          const largeur = 22 * (1 - (k + u) / (t.length - 1)) + 8;
          for (let j = 0; j < 3; j++) {
            const lx = x + (r() - 0.5) * largeur, ly = y + (r() - 0.5) * 10, a = -90 + (r() - 0.5) * 250;
            const sz = 4 + r() * 4.5, ton = tons[Math.min(4, Math.floor(r() * 3 + (lx > x ? 1.6 : 0) + (lx < G.L ? -1.5 : 0)))] || tons[0];
            f += `<path d="M${q(-sz)} 0Q0 ${q(-sz * 0.75)} ${q(sz * 1.3)} 0Q0 ${q(sz * 0.75)} ${q(-sz)} 0Z" fill="${ton}" transform="translate(${q(lx)} ${q(ly)}) rotate(${q(a)})"/>`;
          }
        }
      }
    });
    return f;
  })();
  return `
  <defs>
    ${lin('maison-facade', [[0, '#f9ebce'], [0.45, P.plaster], [1, P.plasterShade]], 0.9, 0, 0.15, 1)}
    ${rad('maison-lumiere', [[0, '#fff3d2', 0.75], [0.5, '#ffe9bb', 0.3], [1, '#ffe9bb', 0]], 0.5, 0.5, 0.5)}
    ${lin('maison-rebond', [[0, '#e6cf92', 0], [1, '#d6c07c', 0.55]])}
    ${lin('maison-cote', [[0, '#79838f'], [0.5, '#838d95'], [0.85, '#948f82'], [1, '#9a917c']])}
    ${lin('maison-pan', [[0, '#6c7383'], [1, '#4a4c58']], 0.6, 0, 0, 1)}
    ${lin('maison-porte', [[0, '#8a958a'], [1, '#9ea79b']], 0, 0, 1, 0)}
    <clipPath id="maison-clip-facade"><polygon points="${pl(FACADE)}"/></clipPath>
    <clipPath id="maison-clip-pan"><polygon points="${pl(PAN)}"/></clipPath>
  </defs>
  <!-- Ombre portée de la maison sur la pelouse, vers l'arrière gauche -->
  <path d="M${G.L} ${G.base}L${q(fond([G.L, G.base])[0])} ${q(fond([G.L, G.base])[1])}L470 870L430 878L560 900Z" fill="#56656a" opacity="0.45" filter="url(#maison-flou5)"/>
  <!-- Mur latéral, à l'ombre (ombre colorée, rebond chaud du jardin en bas) -->
  <polygon points="${pl(COTE)}" fill="url(#maison-cote)"/>
  <polygon points="${pl([[G.L, G.base - 34], fond([G.L, G.base - 34]), fond([G.L, G.base]), [G.L, G.base]])}" fill="#857f78" opacity="0.7"/>
  <polygon points="${pl([along(VP, [G.L, 528], 702), along(VP, [G.L, 528], 666), along(VP, [G.L, 612], 666), along(VP, [G.L, 612], 702)])}" fill="#4a525c"/>
  <polygon points="${pl([along(VP, [G.L, 528], 702), along(VP, [G.L, 528], 666), along(VP, [G.L, 540], 666), along(VP, [G.L, 540], 702)])}" fill="#6f7884"/>
  <!-- Façade au soleil -->
  <polygon points="${pl(FACADE)}" fill="url(#maison-facade)"/>
  <g clip-path="url(#maison-clip-facade)">
    <ellipse cx="1300" cy="330" rx="520" ry="420" fill="url(#maison-lumiere)"/>
    <rect x="${G.L}" y="740" width="${G.R - G.L}" height="170" fill="url(#maison-rebond)"/>
    <rect x="${G.L}" y="${G.base - 34}" width="${G.R - G.L}" height="34" fill="#cdb894" opacity="0.75"/>
    <path d="M${G.L} ${G.base - 34}H${G.R}" stroke="#e9dabb" stroke-width="2"/>
    <!-- Ombre de la rive du toit sur le pignon -->
    <path d="M${G.L - 10} ${G.eave + 4}L${G.px} ${G.py + 4}L${G.R + 10} ${G.eave + 4}" stroke="#8794ad" stroke-width="20" fill="none" opacity="0.5" filter="url(#maison-flou5)"/>
  </g>
  <g clip-path="url(#maison-clip-facade)" filter="url(#maison-flou5)" opacity="0.22" fill="#a89a7c">
    <path d="M${FEN.x + 6} ${FEN.y + FEN.h + 14}h${FEN.w - 12}l-10 60h-40l-12 -40l-14 46h-30l-8 -38l-12 30Z"/>
    <path d="M1158 840h120l-8 40h-30l-10 -24l-12 26h-40Z"/>
    <path d="M${G.L} ${G.base - 60}H${G.R}V${G.base}H${G.L}Z"/>
  </g>
  <!-- Sous-face du débord, puis rive -->
  <polygon points="${pl([[A1[0], A1[1] + EP], [A2[0], A2[1] + EP], [A3[0], A3[1] + EP], [G.R, G.eave], [G.px, G.py], [G.L, G.eave]])}" fill="#6a7180"/>
  <polygon points="${pl(PAN)}" fill="url(#maison-pan)"/>
  <g clip-path="url(#maison-clip-pan)" stroke="#3e404b" stroke-width="1.6" opacity="0.7">${ardoises}</g>
  <g clip-path="url(#maison-clip-pan)">${(() => {
    const r = rng(48);
    let t = '';
    for (let i = 0; i < 40; i++) {
      const k = r(), p0 = [lerp(A1[0], A2[0], k), lerp(A1[1], A2[1], k)], d = 10 + r() * 90;
      const a = along(VP, p0, p0[0] - d), b = along(VP, p0, p0[0] - d - 14 - r() * 20);
      t += `<path d="M${q(a[0])} ${q(a[1])}L${q(b[0])} ${q(b[1])}" stroke="${r() < 0.5 ? '#7d8392' : '#363843'}" stroke-width="${q(5 + r() * 6)}" opacity="0.35"/>`;
    }
    return t;
  })()}</g>
  <polygon points="${pl([A1, fond(A1), fond([A1[0], A1[1] + EP]), [A1[0], A1[1] + EP]])}" fill="#43454f"/>
  <polygon points="${pl([fond([A1[0], A1[1] + EP]), [A1[0], A1[1] + EP], [G.L, G.eave], fond([G.L, G.eave])])}" fill="#737a87"/>
  <polygon points="${pl([A1, A2, A3, [A3[0], A3[1] + EP], [A2[0], A2[1] + EP], [A1[0], A1[1] + EP]])}" fill="#585a65"/>
  <path d="M${q(A1[0])} ${q(A1[1] + 1)}L${q(A2[0])} ${q(A2[1] + 1)}L${q(A3[0])} ${q(A3[1] + 1)}" stroke="#a3a3a6" stroke-width="2" fill="none" opacity="0.8"/>
  <!-- Arêtes de la maison -->
    <path d="M${G.R - 1} ${G.eave}V${G.base}" stroke="#fff6e2" stroke-width="1.6" opacity="0.8"/>
  ${fenetreChambre()}
  ${fenetreBas(1150, 700, 140, 126)}
  ${porte(806, 712, 84, 193)}
  <!-- Plante grimpante sur l'angle -->
  <g transform="translate(-7 5)" opacity="0.35" filter="url(#maison-flou5)" fill="#6c7896">${TIGES.flatMap((t) => t.slice(0, -1).map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="14"/>`)).join('')}</g>
  ${TIGES.map((t) => `<path d="${trace(t)}" stroke="#5c5843" stroke-width="2.2" fill="none"/>`).join('')}
  ${lierre}
  <!-- Pied de façade : occlusion -->
  <rect x="${G.L - 120}" y="${G.base - 12}" width="${G.R - G.L + 130}" height="22" fill="#5f5a50" opacity="0.4" filter="url(#maison-flou5)"/>
  <!-- Crochet de la corde à linge et poteau -->
  <circle cx="${G.R - 3}" cy="650" r="2.6" fill="#8c8f93"/>
  <path d="M1735 940L1737 652Q1742 646 1748 652L1749 940Z" fill="url(#maison-poteau)"/>`;
}

function jardinFond() {
  const haie = (seed, x0, x1) => {
    const r = rng(seed), t = [];
    for (let x = x0; x < x1; x += 30 + r() * 16) t.push([x, 846 + (r() - 0.5) * 12, 26 + r() * 18, Math.floor(r() * 1e6)]);
    return t;
  };
  return `
  <defs>
    ${lin('maison-pelouse', [[0, '#b4b27c'], [0.16, '#a1a463'], [0.45, '#86934c'], [1, '#56683e']])}
    ${lin('maison-soleil-sol', [[0, '#e4cf86', 0], [0.4, '#d9c47a', 0.42], [1, '#d9c47a', 0]])}
    ${lin('maison-poteau', [[0, '#6e5a46'], [1, '#b0916b']], 0, 0, 1, 0)}
    <filter id="maison-flou5" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="maison-flou14" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <!-- Arbres derrière la maison -->
  <path d="${tige([[540, 880], [536, 800], [528, 700], [512, 640]], 22, 10)}" fill="#7a7870"/>
  ${feuillage('maison-arbre-g', couronne(31, 522, 640, 118, 150, 18, 46, 64), F_LOIN_G, { flou: 5, feuilles: 2 })}
  <path d="${tige([[1572, 880], [1568, 790], [1558, 700], [1530, 600]], 34, 14)}" fill="#64605a"/>
  <path d="${tige([[1562, 720], [1610, 650], [1660, 600]], 14, 6)}" fill="#64605a"/>
  ${feuillage('maison-arbre-d', [
    ...couronne(32, 1560, 520, 165, 175, 24, 54, 80),
    ...couronne(35, 1650, 690, 100, 66, 8, 40, 58),
    ...couronne(36, 1455, 690, 70, 56, 6, 36, 50),
  ], F_LOIN_D, { flou: 6, feuilles: 2 })}
  <!-- Pelouse -->
  <path d="M-80 868C400 856 1500 850 2160 864L2160 1160L-80 1160Z" fill="url(#maison-pelouse)"/>
  <path d="M-80 900C500 880 1300 878 2160 896L2160 1010C1500 980 600 990 -80 1020Z" fill="url(#maison-soleil-sol)"/>
  ${feuillage('maison-haie-g', haie(33, -80, 640), F_HAIE, { flou: 3, feuilles: 3 })}
  ${feuillage('maison-haie-d', haie(34, 1360, 2160), F_HAIE, { flou: 3, feuilles: 3 })}
  <!-- Ombres sur la pelouse (arbres hors champ à droite, grand arbre à gauche) -->
  <g filter="url(#maison-flou14)">
    <path d="${tache(rng(51), 1820, 1080, 520, 110, 11, 0.18)}" fill="#3f5652" opacity="0.5"/>
    <path d="${tache(rng(52), 1500, 920, 260, 22, 9, 0.2)}" fill="#4b5f5a" opacity="0.35"/>
    <path d="${tache(rng(53), 120, 1060, 560, 120, 11, 0.18)}" fill="#3a4c46" opacity="0.5"/>
  </g>
  <!-- Modelé de la pelouse : creux frais, plages dorées -->
  <g filter="url(#maison-flou14)">
    <path d="${tache(rng(54), 560, 1010, 300, 30, 9, 0.2)}" fill="#6d7b45" opacity="0.5"/>
    <path d="${tache(rng(56), 1200, 1000, 340, 26, 9, 0.2)}" fill="#d8c67c" opacity="0.4"/>
    <path d="${tache(rng(58), 1560, 960, 200, 18, 9, 0.2)}" fill="#d9c67c" opacity="0.35"/>
    <path d="${tache(rng(59), 300, 930, 260, 16, 9, 0.2)}" fill="#c9bf7e" opacity="0.35"/>
  </g>
  <!-- Allée de dalles vers la porte, mangée par l'herbe -->
  ${Array.from({ length: 7 }, (_, i) => {
    const k = i / 6, yy = lerp(1135, 930, Math.pow(k, 0.85)), xx = lerp(980, 852, k) + Math.sin(k * 3) * 12;
    const rx = lerp(48, 21, k), ry = rx * 0.27, rs = rng(57 + i);
    return `<path d="${tache(rs, xx, yy + ry * 0.4, rx, ry, 9, 0.12)}" fill="#55603f" opacity="0.55"/>` +
      `<path d="${tache(rng(57 + i), xx, yy, rx, ry, 9, 0.12)}" fill="#a39b84"/>` +
      `<path d="${tache(rng(70 + i), xx + rx * 0.2, yy - ry * 0.2, rx * 0.6, ry * 0.45, 8, 0.18)}" fill="#c7bca1" opacity="0.75"/>`;
  }).join('')}
  <!-- Brins de la pelouse -->
  <g stroke-linecap="round" fill="none">
    ${(() => {
      const r = rng(55);
      let s = '';
      for (let i = 0; i < 520; i++) {
        const y = 872 + Math.pow(r(), 0.8) * 280, x = -80 + r() * 2240, l = 3 + (y - 860) * 0.07;
        const c = r() < 0.55 ? '#55663f' : '#cbc285';
        s += `<path d="M${q(x)} ${q(y)}q${q((r() - 0.5) * l * 0.3)} ${q(-l * 0.5)} ${q((r() - 0.5) * l * 0.7)} ${q(-l)}" stroke="${c}" stroke-width="${q(1 + (y - 860) * 0.007)}" opacity="0.5"/>`;
      }
      // Pâquerettes éparses, plus petites au loin
      for (let i = 0; i < 70; i++) {
        const y = 900 + Math.pow(r(), 0.9) * 240, x = -80 + r() * 2240, k = 1 + (y - 900) * 0.012;
        s += `<ellipse cx="${q(x)}" cy="${q(y)}" rx="${q(1.6 * k)}" ry="${q(1 * k)}" fill="#f6f0e2" stroke="none" opacity="0.85"/>`;
      }
      return s;
    })()}
  </g>`;
}

const MAISON = `${jardinFond()}${maison()}`;

/* ---------- Calque 4 : massifs au pied de la façade ---------- */
function buisson(seed, cx, base, w, h, n) {
  return couronne(seed, cx, base - h * 0.42, w / 2 - Math.min(w, h) * 0.2, h * 0.52, n, Math.min(w, h) * 0.24, Math.min(w, h) * 0.4);
}
const MASSIFS = `
<defs><filter id="maison-flou8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter></defs>
<!-- Ombres portées des massifs sur la pelouse, vers l'arrière gauche -->
<g fill="#33463e" opacity="0.45" filter="url(#maison-flou8)">
  <ellipse cx="1150" cy="922" rx="120" ry="14"/><ellipse cx="1360" cy="930" rx="110" ry="16"/><ellipse cx="690" cy="918" rx="70" ry="12"/>
</g>
${feuillage('maison-b1', buisson(61, 640, 922, 170, 66, 12), F_BUISSON_OMBRE, { flou: 2.5, feuilles: 5 })}
${feuillage('maison-b2', buisson(62, 744, 926, 118, 104, 13), F_BUISSON, { flou: 2.5, feuilles: 6 })}
${feuillage('maison-b3', buisson(63, 1222, 934, 250, 92, 18), F_BUISSON, { flou: 2.5, feuilles: 6 })}
${feuillage('maison-b4', buisson(64, 1420, 944, 170, 136, 17), F_BUISSON, { flou: 2.5, feuilles: 6 })}
${feuillage('maison-b5', buisson(65, 400, 905, 130, 54, 7), F_HAIE, { flou: 2.5, feuilles: 6 })}
<g fill="#f3ead6">${(() => {
  const r = rng(66);
  let s = '';
  for (let i = 0; i < 46; i++) {
    const a = Math.PI + r() * Math.PI, d = Math.sqrt(r());
    const x = 1420 + Math.cos(a) * 80 * d, y = 922 + Math.sin(a) * 120 * d;
    s += `<circle cx="${q(x)}" cy="${q(y)}" r="${q(2.2 + r() * 3)}" opacity="${q(0.55 + r() * 0.45)}"/>`;
  }
  return s;
})()}</g>`;

/* ---------- Calque 5 : le grand arbre du premier plan (flou) ---------- */
const ARBRE = `
<defs>
  ${lin('maison-tronc', [[0, '#2a292d'], [0.55, '#3f3631'], [0.85, '#7c634c'], [1, '#5b4b3f']], 0, 0, 1, 0)}
</defs>
<path d="${ruban([[-60, 1160], [-20, 900], [20, 640], [36, 400], [52, 160], [64, -280]], [[250, 1160], [214, 900], [190, 640], [186, 400], [176, 160], [166, -280]])}" fill="url(#maison-tronc)"/>
<path d="${tige([[176, 340], [330, 210], [520, 90], [720, -10], [930, -90]], 64, 14)}" fill="#3b332f"/>
<path d="${tige([[180, 140], [330, 30], [480, -80], [640, -200]], 46, 12)}" fill="#3b332f"/>
<path d="${tige([[50, 520], [-60, 450], [-200, 400]], 40, 14)}" fill="#332d2b"/>
<path d="${tige([[176, 340], [330, 210], [520, 90], [720, -10], [930, -90]], 18, 4)}" fill="#8d7356" opacity="0.6" transform="translate(4 -16)"/>
${feuillage('maison-feuillage', [
  ...semis(71, 330, -100, 520, 180, 34, 60, 110),
  ...semis(72, 760, 20, 210, 110, 14, 44, 76),
  ...semis(73, 600, 170, 200, 60, 10, 30, 52),
  ...semis(75, 560, 230, 170, 60, 9, 26, 46),
  ...semis(74, -40, 300, 190, 340, 14, 54, 96),
], F_ARBRE, { lum: [0.75, -0.66], flou: 8, feuilles: 6 })}
`;

/* ---------- Calque 6 : herbes du premier plan (floues) ---------- */
const HERBES = (() => {
  const r = rng(81);
  const brins = (n, tons, hMin, hMax) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = -220 + r() * 2360;
      const bord = Math.min(1, Math.pow(Math.abs(x - 900) / 1050, 1.6));
      const h = (hMin + r() * (hMax - hMin)) * (0.45 + 0.75 * bord);
      const w = 6 + r() * 9, lean = (r() - 0.45) * 120;
      const base = 1290, tip = [x + lean, base - h];
      const c = tons[Math.floor(r() * tons.length)];
      s += `<path d="M${q(x - w)} ${base}Q${q(x - w * 0.3 + lean * 0.4)} ${q(base - h * 0.6)} ${q(tip[0])} ${q(tip[1])}Q${q(x + w * 0.4 + lean * 0.5)} ${q(base - h * 0.55)} ${q(x + w)} ${base}Z" fill="${c}"/>`;
    }
    return s;
  };
  let fleurs = '';
  for (let i = 0; i < 9; i++) {
    const x = r() < 0.5 ? -100 + r() * 520 : 1400 + r() * 640, y = 960 + r() * 90;
    fleurs += `<path d="M${q(x)} 1290Q${q(x + 8)} ${q(y + 120)} ${q(x + 4)} ${q(y)}" stroke="#4f5a3f" stroke-width="3" fill="none"/>`;
    for (let k = 0; k < 7; k++) fleurs += `<circle cx="${q(x + 4 + (r() - 0.5) * 40)}" cy="${q(y - 4 + (r() - 0.5) * 18)}" r="${q(6 + r() * 6)}" fill="#f1e4c0"/>`;
  }
  return `${brins(150, ['#1f2a24', '#27342b', '#2f3d31'], 160, 330)}
  ${brins(110, ['#3b4a37', '#465640', '#56653f'], 120, 280)}
  ${brins(60, ['#7f8350', '#9f9a5e', '#b7ab6c'], 90, 230)}
  ${fleurs}`;
})();

/* ---------- Effets procéduraux ---------- */
// Ombre tachetée d'un arbre hors champ, à droite : une texture de feuilles (peinte une
// fois), dense le long du bord droit de la façade, qui s'éclaircit vers la fenêtre
const OMBRE_BOX = [1040, 196, 390, 740];
const bordDroit = (y) => (y < G.eave ? G.px + (y - G.py) / PENTE : G.R);
const SOLEILS = (() => {
  const r = rng(95);
  return Array.from({ length: 14 }, () => {
    const y = 470 + r() * 420;
    return { x: bordDroit(y) - 8 - r() * 50, y, r: 4 + r() * 8, ph: r() * TAU };
  });
})();
function texFeuilles(c, W, H, k) {
  const [bx, by, bw, bh] = OMBRE_BOX;
  const r = rng(97);
  c.scale(k, k);
  c.filter = 'blur(2px)';
  c.fillStyle = 'rgb(108,122,168)';
  const feuille = (x, y, s) => {
    c.beginPath();
    c.ellipse(x, y, s * (0.8 + r() * 0.6), s * (0.45 + r() * 0.3), r() * Math.PI, 0, TAU);
    c.fill();
  };
  // Masse pleine contre le bord droit, au bord intérieur fait de grappes
  c.beginPath();
  for (let i = 0; i <= 24; i++) {
    const y = by + (bh * i) / 24, x = bordDroit(y) - bx - 30 - 26 * r();
    i ? c.lineTo(x, y - by) : c.moveTo(x, y - by);
  }
  c.lineTo(bw, bh); c.lineTo(bw, 0); c.closePath(); c.fill();
  for (let i = 0; i < 40; i++) {
    const y = by + r() * bh, x = bordDroit(y) - bx - 34 - r() * 30, n = 8 + Math.floor(r() * 10), e = 16 + r() * 22;
    for (let j = 0; j < n; j++) { const a = r() * TAU, d = Math.sqrt(r()) * e; feuille(x + Math.cos(a) * d, y - by + Math.sin(a) * d * 0.8, 4 + r() * 6); }
  }
  // Grappes de feuilles, de plus en plus rares et petites vers la gauche
  for (let i = 0; i < 80; i++) {
    const y = by + r() * bh, u = Math.pow(r(), 1.5), d = 50 + u * 200;
    const gx = bordDroit(y) - bx - d, gy = y - by, n = Math.round((4 + r() * 12) * (1 - u * 0.6)), e = (10 + r() * 20) * (1 - u * 0.4);
    for (let j = 0; j < n; j++) { const a = r() * TAU, dd = Math.sqrt(r()) * e; feuille(gx + Math.cos(a) * dd, gy + Math.sin(a) * dd * 0.8, (3 + r() * 6) * (1 - u * 0.35)); }
  }
  // Fondu en haut, puis trous de soleil dans la masse
  c.globalCompositeOperation = 'destination-out';
  c.filter = 'none';
  const fh = c.createLinearGradient(0, 0, 0, 90);
  fh.addColorStop(0, 'rgba(0,0,0,1)'); fh.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = fh; c.fillRect(0, 0, bw, 90);
  c.filter = 'blur(1.6px)';
  for (let i = 0; i < 60; i++) {
    const y = by + r() * bh, x = bordDroit(y) - bx - 10 - r() * 60;
    c.beginPath(); c.ellipse(x, y - by, 2.5 + r() * 6, 2 + r() * 4, r() * Math.PI, 0, TAU); c.fill();
  }
}
// Rayons de soleil dans l'air (de haut à droite vers le bas à gauche)
const RAYONS = (() => {
  const r = rng(92);
  return [[2010, 46], [2150, 96], [2300, 38], [2420, 74], [2560, 52]].map(([x, w]) => ({
    x, y: -360, w, len: 2000 + r() * 160, rot: 0.62, a: 0.3 + r() * 0.12, ph: r() * TAU,
  }));
})();
// Pollen et graines qui flottent dans la lumière
const POLLEN = (() => {
  const r = rng(93);
  return Array.from({ length: 52 }, () => ({
    x: r() * 2300, y: 120 + r() * 860, s: 1.2 + r() * 2.6, vx: 2 + r() * 6, vy: -1 - r() * 2.5, ph: r() * TAU, a: 0.35 + r() * 0.55,
  }));
})();
// Éclats de soleil à travers le feuillage du premier plan
const ECLATS = (() => {
  const r = rng(94);
  return Array.from({ length: 16 }, () => ({
    x: 260 + r() * 640, y: -170 + r() * 380, s: 8 + r() * 22, a: 0.25 + r() * 0.4, ph: r() * TAU, f: 0.6 + r() * 0.9,
  }));
})();

// Petites images de travail, peintes une fois (taches douces, faisceau, point)
let SP = null;
function sprites() {
  if (SP) return SP;
  const mk = (w, h, draw) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    return c;
  };
  const doux = (rgb, a0 = 1, k = 0.45) => (c, w) => {
    const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, `rgba(${rgb},${a0})`);
    g.addColorStop(k, `rgba(${rgb},${a0 * 0.85})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, w, w);
  };
  SP = {
    ombre: mk(64, 64, doux('118,132,178', 1, 0.55)),
    soleil: mk(32, 32, doux('255,226,170', 1, 0.5)),
    feuilles: mk(Math.round(OMBRE_BOX[2] * 1.5), Math.round(OMBRE_BOX[3] * 1.5), (c, w, h) => texFeuilles(c, w, h, 1.5)),
    point: mk(32, 32, doux('255,236,190', 1, 0.2)),
    eclat: mk(64, 64, (c, w) => {
      const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,232,180,0.55)');
      g.addColorStop(0.78, 'rgba(255,236,190,0.75)');
      g.addColorStop(0.9, 'rgba(255,240,200,0.5)');
      g.addColorStop(1, 'rgba(255,240,200,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, w, w);
    }),
    rayon: mk(128, 512, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(255,224,170,0)');
      g.addColorStop(0.18, 'rgba(255,224,170,0.9)');
      g.addColorStop(0.82, 'rgba(255,224,170,0.9)');
      g.addColorStop(1, 'rgba(255,224,170,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = 'destination-in';
      const v = c.createLinearGradient(0, 0, 0, h);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(0.3, 'rgba(0,0,0,0.25)');
      v.addColorStop(0.55, 'rgba(0,0,0,1)');
      v.addColorStop(0.8, 'rgba(0,0,0,0.6)');
      v.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = v;
      c.fillRect(0, 0, w, h);
    }),
  };
  return SP;
}

const poly = (c, a) => { c.moveTo(a[0][0], a[0][1]); for (const p of a.slice(1)) c.lineTo(p[0], p[1]); c.closePath(); };
const mod = (v, m) => ((v % m) + m) % m;

// Linge qui sèche : un body crème et une gigoteuse rose poudré à étoiles
function linge(c, T, vent) {
  const A = [G.R - 3, 650], B = [1742, 664];
  const C = [1540, 692 + 2.5 * Math.sin(0.7 * T)];
  const sur = (u) => [
    (1 - u) * (1 - u) * A[0] + 2 * u * (1 - u) * C[0] + u * u * B[0],
    (1 - u) * (1 - u) * A[1] + 2 * u * (1 - u) * C[1] + u * u * B[1],
  ];
  c.strokeStyle = 'rgba(228,220,204,0.9)';
  c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(A[0], A[1]); c.quadraticCurveTo(C[0], C[1], B[0], B[1]); c.stroke();
  const piece = (u, ph, draw) => {
    const p = sur(u);
    c.save();
    c.translate(p[0], p[1]);
    c.rotate(0.03 * vent * Math.sin(1.1 * T + ph) + 0.01 * Math.sin(2.3 * T + ph));
    draw();
    c.restore();
  };
  // Body
  piece(0.36, 0.4, () => {
    const g = c.createLinearGradient(-26, 0, 26, 0);
    g.addColorStop(0, '#cfc4b2'); g.addColorStop(0.5, '#efe6d6'); g.addColorStop(1, '#fbf5ea');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-18, 0); c.bezierCurveTo(-22, 4, -27, 9, -28, 16); c.lineTo(-17, 20);
    c.bezierCurveTo(-16, 32, -15, 42, -12, 50); c.bezierCurveTo(-6, 58, 6, 58, 12, 50);
    c.bezierCurveTo(15, 42, 16, 32, 17, 20); c.lineTo(28, 16); c.bezierCurveTo(27, 9, 22, 4, 18, 0);
    c.bezierCurveTo(10, 6, -10, 6, -18, 0);
    c.fill();
    c.fillStyle = 'rgba(150,140,160,0.35)';
    c.beginPath(); c.ellipse(-8, 36, 6, 16, 0, 0, TAU); c.fill();
    c.fillStyle = '#c9a77a';
    c.fillRect(-15, -4, 3.5, 9); c.fillRect(12, -4, 3.5, 9);
  });
  // Gigoteuse
  piece(0.6, 1.9, () => {
    const g = c.createLinearGradient(-30, 0, 30, 0);
    g.addColorStop(0, P.roseShade); g.addColorStop(0.55, P.rose); g.addColorStop(1, P.roseLight);
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-22, 0); c.lineTo(-12, 0); c.bezierCurveTo(-12, 10, -6, 14, 0, 14);
    c.bezierCurveTo(6, 14, 12, 10, 12, 0); c.lineTo(22, 0);
    c.bezierCurveTo(24, 10, 20, 16, 24, 24); c.bezierCurveTo(30, 50, 30, 74, 22, 86);
    c.bezierCurveTo(8, 94, -8, 94, -22, 86); c.bezierCurveTo(-30, 74, -30, 50, -24, 24);
    c.bezierCurveTo(-20, 16, -24, 10, -22, 0);
    c.fill();
    c.fillStyle = 'rgba(243,230,214,0.9)';
    for (const [sx, sy] of [[-12, 34], [8, 30], [-2, 52], [14, 58], [-16, 66], [4, 76], [-6, 22]]) {
      c.beginPath();
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? 1.1 : 2.6;
        c.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr);
      }
      c.fill();
    }
    c.fillStyle = '#c9a77a';
    c.fillRect(-19, -4, 3.5, 9); c.fillRect(16, -4, 3.5, 9);
  });
}

/* ---------- Le décor ---------- */
export default {
  id: 'maison',
  bg: '#cdd6d0',
  home: { x: 930, y: 560, z: 1 },
  layers: {
    ciel: { box: [-160, -120, 2240, 1120], svg: CIEL, filters: ['paint'], par: 0.35 },
    nuages: { box: [-240, -160, 2400, 860], svg: NUAGES, filters: ['paint', 'b3'], par: 0.25 },
    maison: { box: [-40, 40, 1940, 1080], svg: MAISON, filters: ['paint'], par: 1, res: 1.25 },
    massifs: { box: [-80, 560, 2240, 640], svg: MASSIFS, filters: ['paint', 'soft'], par: 1.08 },
    arbre: { box: [-300, -260, 1500, 1400], svg: ARBRE, filters: ['paint', 'b16'], par: 1.6 },
    herbes: { box: [-240, 780, 2400, 520], svg: HERBES, filters: ['paint', 'b10'], par: 1.9 },
  },

  // p.vent : amplitude du vent (1 par défaut) ; p.soleil : intensité de la lumière (1)
  render(g, p, T) {
    const vent = p.vent ?? 1, soleil = p.soleil ?? 1;
    const S = sprites();

    g.img('ciel');
    g.img('nuages', { tf: { x: 60 * Math.sin(T * 0.05) } });
    g.img('maison');

    // Ombres de feuillage qui glissent sur la façade (deux couches qui frémissent l'une sur l'autre)
    g.fx(1, (c) => {
      c.beginPath(); poly(c, FACADE); c.clip();
      const [bx, by, bw, bh] = OMBRE_BOX;
      const gx = -10 * Math.sin(0.15 * T) - 4 * Math.sin(0.06 * T + 1), gy = 3 * Math.sin(0.11 * T);
      c.globalCompositeOperation = 'multiply';
      c.globalAlpha = 0.48 * soleil;
      c.drawImage(S.feuilles, bx + gx, by + gy, bw, bh);
      c.globalAlpha = 0.24 * soleil;
      c.drawImage(S.feuilles, bx + gx + 4 * vent * Math.sin(1.2 * T), by + gy + 2.5 * vent * Math.sin(0.9 * T + 1), bw, bh);
      c.globalCompositeOperation = 'screen';
      for (const d of SOLEILS) {
        const k = 0.6 + 0.4 * Math.sin(0.9 * T + d.ph), w = 3 * vent * Math.sin(1.3 * T + d.ph);
        c.globalAlpha = 0.45 * k * soleil;
        c.drawImage(S.soleil, d.x + gx + w - d.r, d.y + gy - d.r * 0.8, d.r * 2, d.r * 1.6);
      }
    });

    // Reflet du ciel sur les vitres : il glisse quand la caméra avance (p.reflet de 0 à 1)
    g.fx(1, (c) => {
      c.beginPath();
      for (const [x, y, w, h] of VITRES) c.rect(x, y, w, h);
      c.clip();
      c.globalCompositeOperation = 'screen';
      const x0 = FEN.x - 40 + 150 * (p.reflet ?? 0);
      for (const [dx, w, a] of [[0, 34, 0.2], [46, 12, 0.14]]) {
        const gr = c.createLinearGradient(x0 + dx, 0, x0 + dx + w, 0);
        gr.addColorStop(0, 'rgba(235,242,240,0)');
        gr.addColorStop(0.5, `rgba(235,242,240,${a})`);
        gr.addColorStop(1, 'rgba(235,242,240,0)');
        c.fillStyle = gr;
        c.save();
        c.translate(x0 + dx + w / 2, WC[1]); c.transform(1, 0, -0.45, 1, 0, 0); c.translate(-(x0 + dx + w / 2), -WC[1]);
        c.fillRect(x0 + dx, FEN.y, w, FEN.h);
        c.restore();
      }
    });

    // Halo de lumière sur le pignon ensoleillé
    g.fx(1, (c) => {
      c.globalCompositeOperation = 'screen';
      const h = c.createRadialGradient(1180, 330, 0, 1180, 330, 560);
      h.addColorStop(0, `rgba(255,222,160,${0.16 * soleil})`);
      h.addColorStop(1, 'rgba(255,222,160,0)');
      c.fillStyle = h;
      c.fillRect(600, -240, 1160, 1140);
    });

    // Corde à linge
    g.fx(1, (c) => linge(c, T, vent));

    g.img('massifs');

    // Air lumineux : rayons, pollen
    g.fx(0.9, (c) => {
      c.globalCompositeOperation = 'screen';
      for (const s of RAYONS) {
        c.globalAlpha = s.a * soleil * (0.72 + 0.28 * Math.sin(0.3 * T + s.ph));
        c.save();
        c.translate(s.x, s.y);
        c.rotate(s.rot);
        c.drawImage(S.rayon, -s.w / 2, 0, s.w, s.len);
        c.restore();
      }
    });
    g.fx(1.15, (c) => {
      c.globalCompositeOperation = 'screen';
      for (const d of POLLEN) {
        const x = mod(d.x + d.vx * T + 14 * Math.sin(0.4 * T + d.ph), 2300) - 160;
        const y = mod(d.y + d.vy * T + 10 * Math.sin(0.55 * T + d.ph * 2), 980) + 60;
        const lum = clamp((x - 300) / 900) * (0.5 + 0.5 * Math.sin(1.7 * T + d.ph));
        c.globalAlpha = d.a * (0.25 + 0.75 * lum) * soleil;
        c.drawImage(S.point, x - d.s * 2, y - d.s * 2, d.s * 4, d.s * 4);
      }
    });

    // Le grand arbre se balance doucement, ses éclats de soleil avec lui
    const rot = vent * (0.0035 * Math.sin(0.55 * T) + 0.0015 * Math.sin(1.3 * T + 1));
    g.img('arbre', { tf: { rot, ox: 140, oy: 1160 } });
    g.fx(1.6, (c) => {
      c.translate(140, 1160); c.rotate(rot); c.translate(-140, -1160);
      c.globalCompositeOperation = 'screen';
      for (const e of ECLATS) {
        const k = 0.5 + 0.5 * Math.sin(e.f * T + e.ph);
        c.globalAlpha = e.a * k * k * soleil;
        c.drawImage(S.eclat, e.x - e.s, e.y - e.s, e.s * 2, e.s * 2);
      }
    });

    g.img('herbes', { tf: { x: 5 * vent * Math.sin(0.8 * T), rot: 0.004 * vent * Math.sin(0.6 * T + 2), ox: 960, oy: 1290 } });

    // Étalonnage : chaleur venue d'en haut à droite
    g.screen((c, W, H) => {
      c.globalCompositeOperation = 'screen';
      const gr = c.createRadialGradient(W * 1.02, -H * 0.12, 0, W * 1.02, -H * 0.12, Math.max(W, H) * 1.0);
      gr.addColorStop(0, `rgba(255,214,150,${0.19 * soleil})`);
      gr.addColorStop(0.5, `rgba(255,214,150,${0.06 * soleil})`);
      gr.addColorStop(1, 'rgba(255,214,150,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
    });
  },

  shots: {
    // Lent travelling avant vers la fenêtre de la chambre, qui finit au centre
    ouverture: {
      dur: 6.5,
      cam: (t, portrait) => {
        const k = clamp(t / 6.5), e = 0.3 * k + 0.7 * k * k * (3 - 2 * k);
        return portrait
          ? { x: WC[0], y: WC[1], z: lerp(1, 1.25, e) }
          : { x: lerp(930, WC[0], e), y: lerp(560, WC[1], e), z: lerp(1, 1.25, e) };
      },
      p: (t) => ({ vent: 1, soleil: 1, reflet: clamp(t / 6.5) }),
    },
  },
};
