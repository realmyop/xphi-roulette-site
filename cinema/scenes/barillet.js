/* ==========================================================================
   Décor « barillet » — très gros plan : les mains chargent le revolver.
   Le barillet est basculé hors de la carcasse, vu presque de face (on regarde
   l'arrière des chambres ; le canon est tourné vers le plancher, jamais vers
   la caméra). Une seule cartouche en laiton entre dans une chambre, l'index
   se retire, le pouce lance le barillet, qui s'arrête sur un cran.
   Le cadrage est serré et décentré : l'axe du barillet est en bas à droite,
   on ne voit jamais plus de trois ou quatre chambres.
   La face d'acier est peinte une fois (calque) puis tourne ; toute la lumière
   (arêtes, reflets, ombres) est posée par-dessus à chaque image, pour rester
   fixe pendant que l'acier tourne. Le soleil vient de la droite.
   ========================================================================== */
import { P, rad, rng } from '../kit.js';
import { TAU, clamp, lerp, ease, seg } from '../../film/engine.js';

const ID = 'barillet';
const deg = Math.PI / 180;
const q = (v) => Math.round(v * 10) / 10;

/* ---------- Géométrie (repère du décor : 1920 × 1080 à z = 1) ---------- */
const C = { x: 1440, y: 1010 };    // axe du barillet
const RB = 650;                    // cercle des chambres
const RC = 994;                    // rayon extérieur
const R_REC = 254;                 // logement du bourrelet
const R_BORE = 214;                // alésage
const R_RIM = 244, R_CASE = 207, R_PRIM = 96;   // la cartouche
const RS = 640;                    // pointes de l'étoile de l'extracteur
const A0 = -125 * deg;             // chambre chargée, au repos
const D = [-0.4, -0.16];           // à l'écran : décalage d'un point qui sort de la face (par unité)
const LP = [-0.6, 0.35];           // ombre portée sur la face (par unité de hauteur)
const H0 = 520;                    // dépassement initial de la cartouche
const PERS = 0.00011;              // grossissement par unité de dépassement
const SPIN = -840 * deg;           // deux tours un tiers : il s'arrête sur un cran
const LANG = -32 * deg;            // direction de la lumière (vers la fenêtre)
const NOEUD = -97 * deg;           // orientation du reflet des stries de tournage
const POOL = { x: 900, y: 420 };   // centre de la flaque de soleil

const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const chambre = (k, rot, o) => {
  const a = A0 + (k * TAU) / 6 + rot;
  return [o.x + RB * Math.cos(a), o.y + RB * Math.sin(a)];
};
// Intensité du soleil en un point (0 → 1)
const lumiere = (x, y) => 0.16 + 0.84 * Math.exp(-((x - POOL.x) ** 2 + (y - POOL.y) ** 2) / (2 * 520 * 520));

/* ---------- Outils de tracé ---------- */
const XY = (p) => `${q(p[0])} ${q(p[1])}`;
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
// Courbe lisse ouverte
function trace(p) {
  let d = `M${XY(p[0])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || p[i + 1];
    d += `C${XY([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6])} ${XY([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6])} ${XY(c)}`;
  }
  return d;
}
const polyD = (pts) => 'M' + pts.map(XY).join('L') + 'Z';
const stops = (s) => s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
const linU = (id, s, x1, y1, x2, y2) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${q(x1)}" y1="${q(y1)}" x2="${q(x2)}" y2="${q(y2)}">${stops(s)}</linearGradient>`;
const radU = (id, s, cx, cy, r) =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${q(cx)}" cy="${q(cy)}" r="${q(r)}">${stops(s)}</radialGradient>`;

/* ---------- Contours de l'extracteur et du moyeu ---------- */
function etoile(cx, cy, rot, n = 16) {
  const rc = R_REC + 10;
  const a = Math.acos((RS * RS + RB * RB - rc * rc) / (2 * RS * RB));
  const out = [];
  for (let k = 0; k < 6; k++) {
    const th = A0 + (k * TAU) / 6 + rot;
    const hx = cx + RB * Math.cos(th), hy = cy + RB * Math.sin(th);
    const bA = Math.atan2(cy + RS * Math.sin(th - a) - hy, cx + RS * Math.cos(th - a) - hx);
    const bB = Math.atan2(cy + RS * Math.sin(th + a) - hy, cx + RS * Math.cos(th + a) - hx);
    const span = (((bB - bA) % TAU) + TAU) % TAU;
    // on contourne la chambre par le côté de l'axe
    for (let i = 0; i <= n; i++) {
      const b = bA - ((TAU - span) * i) / n;
      out.push([hx + rc * Math.cos(b), hy + rc * Math.sin(b)]);
    }
    // pointe : arc du grand cercle jusqu'à la chambre suivante
    for (let i = 1; i < 6; i++) {
      const b = th + a + ((TAU / 6 - 2 * a) * i) / 6;
      out.push([cx + RS * Math.cos(b), cy + RS * Math.sin(b)]);
    }
  }
  return out;
}
// Moyeu de l'extracteur : six dents courtes et arrondies
function moyeu(cx, cy, rot) {
  const out = [];
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * TAU, u = ((t * 6) / TAU) % 1;
    const r = 118 + 26 * sm(0.05, 0.3, u) * (1 - sm(0.62, 0.78, u));
    const a = A0 + TAU / 12 + t + rot;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

/* ---------- Calque : fond (le plancher, loin, hors de mise au point) ---------- */
const FOND = (() => {
  const r = rng(31);
  let planks = '';
  for (let i = -4; i < 18; i++) {
    const x = -700 + i * 170, k = 640;
    const col = ['#4a3628', '#3b2b21', '#433127', '#372820'][(i + 8) % 4];
    planks += `<polygon points="${x},-160 ${x + 170},-160 ${x + 170 - k},1280 ${x - k},1280" fill="${col}"/>`;
    planks += `<line x1="${x}" y1="-160" x2="${x - k}" y2="1280" stroke="#140f0c" stroke-width="12" opacity="0.6"/>`;
  }
  // reflets de soleil sur le vernis du plancher et la poussière : des disques
  // de diaphragme, plus clairs sur le bord
  let bokeh = '';
  const B = [[128, 132, 62, 0.5], [282, 330, 38, 0.44], [40, 470, 70, 0.24], [398, 64, 30, 0.5], [646, 40, 46, 0.34],
    [206, 610, 40, 0.18], [470, 520, 24, 0.26], [890, 84, 28, 0.3], [28, 250, 36, 0.36], [340, 790, 50, 0.08],
    [560, 226, 34, 0.3], [1180, 30, 30, 0.2], [1850, 50, 44, 0.16], [760, 170, 20, 0.3], [230, 30, 24, 0.4]];
  for (const [x, y, rr, a] of B) {
    bokeh += `<circle cx="${x}" cy="${y}" r="${rr}" fill="#f4ddb0" opacity="${q(a * 0.8)}"/>`;
    bokeh += `<circle cx="${x}" cy="${y}" r="${q(rr - 3)}" fill="none" stroke="#fff3da" stroke-width="4" opacity="${q(a * 0.6)}"/>`;
  }
  for (let i = 0; i < 30; i++) {
    const x = -200 + r() * 1300, y = -120 + r() * 900, rr = 5 + r() * 12;
    bokeh += `<circle cx="${q(x)}" cy="${q(y)}" r="${q(rr)}" fill="#f6e2bc" opacity="${q(0.06 + r() * 0.16)}"/>`;
  }
  return `
<defs>
  ${linU(`${ID}-sol`, [[0, '#3c2c23'], [0.4, '#251d19'], [1, '#121116']], -240, -140, 1300, 1200)}
  ${radU(`${ID}-tache`, [[0, '#f4cf92', 0.95], [0.35, '#d69d5f', 0.62], [0.75, '#8f6038', 0.2], [1, '#8f6038', 0]], 240, 140, 700)}
  ${radU(`${ID}-froid`, [[0, '#26293a', 0.8], [1, '#26293a', 0]], 120, 960, 620)}
  ${linU(`${ID}-nuit`, [[0, '#100f15', 0], [0.5, '#100f15', 0.5], [1, '#0c0c11', 0.94]], 100, 0, 1500, 1000)}
</defs>
<rect x="-240" y="-140" width="2400" height="1400" fill="url(#${ID}-sol)"/>
<g filter="url(#b28)">
  <g opacity="0.6">${planks}</g>
  <polygon points="-240,-140 1040,-140 560,620 -240,800" fill="url(#${ID}-tache)"/>
  <polygon points="330,-140 410,-140 10,820 -80,820" fill="#2a1f19" opacity="0.45"/>
  <polygon points="-240,300 900,180 900,250 -240,380" fill="#2a1f19" opacity="0.3"/>
  <rect x="-240" y="400" width="1100" height="900" fill="url(#${ID}-froid)"/>
  <rect x="-240" y="-140" width="2400" height="1400" fill="url(#${ID}-nuit)"/>
</g>
<g filter="url(#b3)">${bokeh}</g>`;
})();

/* ---------- Calque : la face du barillet (au repos, peinte une fois) ---------- */
const BAR = (() => {
  const r = rng(7);
  const { x: cx, y: cy } = C;
  let rings = '';
  for (let i = 0; i < 46; i++) {
    const rr = 160 + i * 18 + r() * 8;
    rings += `<circle cx="${cx}" cy="${cy}" r="${q(rr)}" fill="none" stroke="${i % 2 ? '#ffffff' : '#000000'}" stroke-opacity="${i % 2 ? 0.014 : 0.022}" stroke-width="${q(2 + r() * 4)}"/>`;
  }
  let patine = '';
  for (let i = 0; i < 26; i++) {
    const a = r() * TAU, d = 160 + r() * 800;
    const x = cx + d * Math.cos(a), y = cy + d * Math.sin(a);
    patine += `<ellipse cx="${q(x)}" cy="${q(y)}" rx="${q(40 + r() * 130)}" ry="${q(26 + r() * 70)}" transform="rotate(${q(r() * 180)} ${q(x)} ${q(y)})" fill="url(#${ID}-patine)"/>`;
  }
  let touches = '';
  for (let i = 0; i < 40; i++) {
    const rr = 150 + r() * 820, a0 = r() * TAU, span = (12 + r() * 50) * deg;
    const x0 = cx + rr * Math.cos(a0), y0 = cy + rr * Math.sin(a0);
    const x1 = cx + rr * Math.cos(a0 + span), y1 = cy + rr * Math.sin(a0 + span);
    touches += `<path d="M${q(x0)} ${q(y0)} A ${q(rr)} ${q(rr)} 0 0 1 ${q(x1)} ${q(y1)}" fill="none" stroke="${r() < 0.5 ? '#8c96a1' : '#2b323a'}" stroke-opacity="${q(0.05 + r() * 0.06)}" stroke-width="${q(16 + r() * 34)}" stroke-linecap="round"/>`;
  }
  let rayures = '';
  for (let i = 0; i < 22; i++) {
    const a = r() * TAU, d = 170 + r() * 780, l = 30 + r() * 120, b = r() * TAU;
    const x = cx + d * Math.cos(a), y = cy + d * Math.sin(a);
    rayures += `<path d="M${q(x)} ${q(y)} q ${q(l * 0.5 * Math.cos(b) + 6)} ${q(l * 0.5 * Math.sin(b) - 6)} ${q(l * Math.cos(b))} ${q(l * Math.sin(b))}" fill="none" stroke="#dfe5ea" stroke-opacity="${q(0.06 + r() * 0.09)}" stroke-width="1.2"/>`;
  }
  let ch = '';
  for (let k = 0; k < 6; k++) {
    const [x, y] = chambre(k, 0, C);
    // logement du bourrelet (un léger chambrage), chanfrein, puis l'alésage noir
    ch += `<circle cx="${q(x)}" cy="${q(y)}" r="${R_REC}" fill="#434b55"/>`;
    ch += `<circle cx="${q(x)}" cy="${q(y)}" r="${R_REC}" fill="url(#${ID}-logement)"/>`;
    ch += `<circle cx="${q(x)}" cy="${q(y)}" r="${R_REC - 1}" fill="none" stroke="#1c2127" stroke-width="3.5"/>`;
    ch += `<circle cx="${q(x)}" cy="${q(y)}" r="${R_BORE + 8}" fill="#525b65"/>`;
    ch += `<circle cx="${q(x)}" cy="${q(y)}" r="${R_BORE}" fill="url(#${ID}-ame)"/>`;
  }
  return `
<defs>
  ${radU(`${ID}-face`, [[0, '#4c5560'], [0.4, '#56606b'], [0.8, '#515a65'], [0.96, '#48515b'], [1, '#384049']], cx, cy, RC)}
  ${rad(`${ID}-ame`, [[0, '#040506'], [0.62, '#08090b'], [0.9, '#121519'], [1, '#1d2227']])}
  ${rad(`${ID}-logement`, [[0, '#3a424b', 0], [0.82, '#3a424b', 0], [0.97, '#2a3037', 0.7], [1, '#22272d', 0.9]])}
  ${radU(`${ID}-etoile`, [[0, '#6f7984'], [0.5, '#69737e'], [1, '#626c77']], cx, cy, RS)}
  ${rad(`${ID}-patine`, [[0, '#283038', 0.26], [1, '#283038', 0]])}
</defs>
<circle cx="${cx}" cy="${cy}" r="${RC}" fill="url(#${ID}-face)"/>
${rings}
${touches}
${patine}
<path d="${polyD(etoile(cx, cy, 0))}" fill="url(#${ID}-etoile)"/>
<path d="${polyD(etoile(cx, cy, 0))}" fill="none" stroke="#1c2025" stroke-opacity="0.75" stroke-width="3" stroke-linejoin="round"/>
${ch}
<path d="${polyD(moyeu(cx, cy, 0))}" fill="#66707b" stroke="#262b31" stroke-opacity="0.7" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="${cx}" cy="${cy}" r="62" fill="#4a525b" stroke="#262b31" stroke-width="3"/>
<circle cx="${cx}" cy="${cy}" r="38" fill="#060708"/>
${rayures}
<circle cx="${cx}" cy="${cy}" r="${RC - 26}" fill="none" stroke="#262c33" stroke-width="3" stroke-opacity="0.6"/>`;
})();

/* ---------- Calque : le culot de la cartouche (centré sur l'origine) ---------- */
const CULOT = (() => {
  let rings = '';
  for (let i = 0; i < 16; i++) {
    const rr = 110 + i * 8;
    rings += `<circle r="${rr}" fill="none" stroke="${i % 2 ? '#fff0c0' : '#6a4612'}" stroke-opacity="${i % 2 ? 0.07 : 0.06}" stroke-width="2"/>`;
  }
  return `
<defs>
  ${radU(`${ID}-laiton`, [[0, '#d9a94f'], [0.6, '#cf9b40'], [0.9, '#b8862f'], [1, P.brassDark]], 0, 0, R_RIM)}
  ${radU(`${ID}-amorce`, [[0, '#e6c27a'], [0.7, '#d0a251'], [1, '#a47630']], 0, 0, R_PRIM)}
</defs>
<circle r="${R_RIM}" fill="url(#${ID}-laiton)"/>
${rings}
<circle r="${R_RIM - 9}" fill="none" stroke="#7d5719" stroke-opacity="0.45" stroke-width="4"/>
<circle r="${R_PRIM + 6}" fill="#4f3410"/>
<circle r="${R_PRIM}" fill="url(#${ID}-amorce)"/>`;
})();

/* ---------- Les doigts ----------
   Un doigt est dessiné dans un repère local : bout en (0, 0), axe vers +x
   (du bout vers la main) ; la lumière vient du côté +y (flip : côté −y).
   L'ongle est du côté « nail » (+1 ou −1). « dof » : la partie proche de la
   caméra (vers la main) passe progressivement hors de mise au point. */
function doigt(o) {
  const { id, x, y, a, L, w, wb, flip = false, shade = 0.55, nail = 1, nw = 1, dof = 0 } = o;
  const P0 = [
    [0, 0], [w * 0.12, -w * 0.6], [w * 0.55, -w * 1.02], [w * 1.25, -w * 1.09], [w * 1.95, -w * 0.99],
    [w * 2.7, -w * 1.06], [L * 0.55, -w * 1.1], [L * 0.8, -(w + wb) * 0.51], [L, -wb], [L + 60, 0], [L, wb],
    [L * 0.75, (w + wb) * 0.48], [w * 2.6, w * 0.95], [w * 2.05, w * 1.01], [w * 1.5, w * 0.94], [w * 0.95, w * 0.87],
    [w * 0.42, w * 0.69], [w * 0.08, w * 0.37],
  ];
  const body = lisse(P0);
  const T = `translate(${q(x)} ${q(y)}) rotate(${q(a)})${flip ? ' scale(1 -1)' : ''}`;
  const s = nail, k = nw;
  const ny = (v) => s * (w * 0.92 - (w * 0.92 - v) * k);   // ongle vu plus ou moins de profil
  const ongle = lisse([
    [w * 0.14, ny(w * 0.52)], [w * 0.32, ny(w * 0.27)], [w * 0.75, ny(w * 0.22)], [w * 1.2, ny(w * 0.28)], [w * 1.34, ny(w * 0.55)],
    [w * 1.2, ny(w * 0.82)], [w * 0.7, ny(w * 0.86)], [w * 0.3, ny(w * 0.8)],
  ]);
  const libre = trace([[w * 0.18, ny(w * 0.36)], [w * 0.2, ny(w * 0.55)], [w * 0.24, ny(w * 0.76)]]);
  const defs = `
    <clipPath id="${id}-c"><path d="${body}"/></clipPath>
    ${linU(`${id}-peau`, [[0, '#5a5468'], [0.07, '#553c45'], [0.3, '#83554a'], [0.55, '#b0755c'], [0.78, '#d39676'], [0.9, '#e9b490'], [0.97, '#f3caa4'], [1, '#d4826a']], 0, -w, 0, w)}
    ${linU(`${id}-axe`, [[0, '#1a1217', 0], [0.3, '#1a1217', 0], [1, '#1a1217', shade]], 0, 0, L, 0)}
    ${linU(`${id}-bord`, [[0, '#ffe2bf', 0], [0.66, '#ffe2bf', 0], [1, '#ffe2bf', 0.9]], 0, -w, 0, w)}
    ${linU(`${id}-sss`, [[0, '#dd5f46', 0], [0.6, '#dd5f46', 0], [1, '#dd5f46', 0.55]], 0, -w, 0, w)}
    ${linU(`${id}-froid`, [[0, '#8fa3c9', 0.32], [0.3, '#8fa3c9', 0], [1, '#8fa3c9', 0]], 0, -w, 0, w)}
    ${linU(`${id}-ongle`, [[0, '#dcbcab'], [0.14, '#d2a898'], [0.55, '#c79484'], [1, '#ad7a6c']], w * 0.12, 0, w * 1.34, 0)}
    ${radU(`${id}-bout`, [[0, '#d0705c', 0.42], [1, '#d0705c', 0]], w * 0.5, 0, w * 1.25)}`;
  const peau = `
  <path d="${body}" fill="url(#${id}-peau)"/>
  <g clip-path="url(#${id}-c)">
    <path d="${body}" fill="none" stroke="url(#${id}-sss)" stroke-width="${q(w * 0.34)}" filter="url(#b10)"/>
    <path d="${body}" fill="none" stroke="url(#${id}-froid)" stroke-width="${q(w * 0.3)}" filter="url(#b10)"/>
    <path d="${body}" fill="none" stroke="url(#${id}-bord)" stroke-width="${q(w * 0.06)}" filter="url(#soft)"/>
    <circle cx="${q(w * 0.5)}" cy="0" r="${q(w * 1.25)}" fill="url(#${id}-bout)"/>
    <path d="M${q(w * 1.95)} ${q(s * w * 0.97)} q ${q(-w * 0.12)} ${q(-s * w * 0.3)} ${q(-w * 0.02)} ${q(-s * w * 0.6)}
             M${q(w * 2.1)} ${q(s * w * 0.98)} q ${q(-w * 0.1)} ${q(-s * w * 0.28)} 0 ${q(-s * w * 0.52)}
             M${q(w * 1.9)} ${q(-s * w * 0.98)} q ${q(w * 0.05)} ${q(s * w * 0.18)} ${q(w * 0.02)} ${q(s * w * 0.36)}"
          fill="none" stroke="#7a4c41" stroke-opacity="0.26" stroke-width="${q(w * 0.022)}" stroke-linecap="round" filter="url(#soft)"/>
    <path d="${ongle}" fill="url(#${id}-ongle)"/>
    <path d="${libre}" fill="none" stroke="#ecd6c6" stroke-opacity="0.45" stroke-width="${q(w * 0.035)}" stroke-linecap="round" filter="url(#soft)"/>
    <path d="${ongle}" fill="none" stroke="#8f5c50" stroke-opacity="0.4" stroke-width="${q(w * 0.022)}"/>
    <path d="${trace([[w * 0.3, ny(w * 0.18)], [w * 0.8, ny(w * 0.13)], [w * 1.3, ny(w * 0.22)]])} M${q(w * 1.42)} ${q(ny(w * 0.3))} Q ${q(w * 1.5)} ${q(ny(w * 0.56))} ${q(w * 1.4)} ${q(ny(w * 0.8))}"
          fill="none" stroke="#9c6556" stroke-opacity="0.32" stroke-width="${q(w * 0.03)}" stroke-linecap="round" filter="url(#soft)"/>
    <ellipse cx="${q(w * 0.78)}" cy="${q(ny(w * 0.62))}" rx="${q(w * 0.26)}" ry="${q(w * 0.05 * k + 3)}" fill="#fff0e0" opacity="0.16" filter="url(#b3)"/>
    <path d="${body}" fill="url(#${id}-axe)"/>
  </g>`;
  if (!dof) return `<g transform="${T}"><defs>${defs}</defs>${peau}</g>`;
  // mise au point progressive : net au bout, flou vers la main
  const box = `x="${-L}" y="${-2 * L}" width="${4 * L}" height="${4 * L}"`;
  return `<g transform="${T}">
  <defs>${defs}
    ${linU(`${id}-mn`, [[0, '#fff'], [0.35, '#fff'], [1, '#000']], 0, 0, dof, 0)}
    ${linU(`${id}-mf`, [[0, '#000'], [0.35, '#000'], [1, '#fff']], 0, 0, dof, 0)}
    <mask id="${id}-near" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="url(#${id}-mn)"/></mask>
    <mask id="${id}-far" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="url(#${id}-mf)"/></mask>
  </defs>
  <g mask="url(#${id}-far)"><g filter="url(#b16)">${peau}</g></g>
  <g mask="url(#${id}-near)">${peau}</g>
</g>`;
}

// Index droit : il pousse la cartouche (pose initiale, cartouche à moitié sortie)
const L0 = chambre(0, 0, C);
const HEAD0 = [L0[0] + D[0] * H0, L0[1] + D[1] * H0];
const TIP = [HEAD0[0] - 134, HEAD0[1] - 120];
const A_INDEX = -139;
const INDEX = doigt({ id: `${ID}-index`, x: TIP[0], y: TIP[1], a: A_INDEX, L: 980, w: 212, wb: 272, shade: 0.75, dof: 820 });
// Main gauche : le pouce le long du bord, deux doigts sous le barillet
// (le pouce appuie sur le flanc du barillet : il est derrière la face, on n'en voit que le dos)
const POUCE0 = [566, 720];
const POUCE = doigt({ id: `${ID}-pouce`, x: POUCE0[0], y: POUCE0[1], a: 121, L: 860, w: 205, wb: 245, flip: true, nail: -1, nw: 0.5, shade: 0.75, dof: 900 });
const GAUCHE =
  doigt({ id: `${ID}-g1`, x: 572, y: 968, a: 136, L: 700, w: 165, wb: 200, shade: 0.8 }) +
  doigt({ id: `${ID}-g2`, x: 735, y: 1062, a: 128, L: 700, w: 172, wb: 208, shade: 0.8 });

/* ---------- Effets procéduraux ---------- */
// Arête lumineuse : un cercle dont l'éclat suit l'orientation vers la lumière
function arete(c, x, y, r, w, a0, rgb, alpha, pow = 2) {
  if (alpha <= 0.004 || r <= 0) return;
  const gr = c.createConicGradient(0, x, y);
  const N = 36;
  for (let i = 0; i <= N; i++) {
    const k = Math.pow(Math.max(0, Math.cos((i / N) * TAU - a0)), pow);
    gr.addColorStop(i / N, `rgba(${rgb},${(alpha * k).toFixed(3)})`);
  }
  c.strokeStyle = gr;
  c.lineWidth = w;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.stroke();
}
// Reflet d'une surface tournée (stries concentriques) : un « nœud papillon »
// de lumière centré sur l'axe ; il reste fixe quand le métal tourne.
function noeud(c, x, y, r, a0, rgb, alpha, sig = 7 * deg, back = 0.6) {
  const gr = c.createConicGradient(0, x, y);
  const N = 144;
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * TAU;
    let d = (((th - a0) % TAU) + TAU) % TAU;
    const front = Math.min(d, TAU - d), rear = Math.abs(d - Math.PI);
    const v = Math.exp(-(front * front) / (2 * sig * sig)) + back * Math.exp(-(rear * rear) / (2 * sig * sig));
    gr.addColorStop(i / N, `rgba(${rgb},${(alpha * v).toFixed(3)})`);
  }
  c.fillStyle = gr;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
}
// Forme floue : tracée hors champ, seule son ombre (floutée) tombe à sa place
function flouee(c, blur, color, path) {
  const m = c.getTransform();
  const k = Math.hypot(m.a, m.b);
  c.save();
  c.shadowColor = color;
  c.shadowBlur = blur * k;
  c.shadowOffsetX = 40000 * k;
  c.translate(-40000, 0);
  c.fillStyle = '#000';
  c.beginPath();
  path(c);
  c.fill();
  c.restore();
}
// Capsule : deux disques reliés par leurs tangentes (même sens de parcours partout)
const capsule = (c, ax, ay, ra, bx, by, rb) => {
  const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1, t = Math.atan2(dy, dx);
  const s = Math.asin(clamp((ra - rb) / l, -1, 1));
  c.arc(ax, ay, ra, t + Math.PI / 2 + s, t - Math.PI / 2 - s + TAU);
  c.arc(bx, by, rb, t - Math.PI / 2 - s, t + Math.PI / 2 + s);
  c.closePath();
};

// Lumière posée sur la face, fixe dans l'image. Elle est posée avant le filé
// du barillet : ce sont de grandes formes douces, que le filé ne change pas,
// et les chambres (qu'elle épargne) restent ainsi noires même brouillées.
function lumiereFace(c, o, rot, tete) {
  c.save();
  c.beginPath();
  c.arc(o.x, o.y, RC - 1, 0, TAU);
  c.clip();
  // loin du soleil, l'acier passe dans une ombre bleutée
  c.globalCompositeOperation = 'multiply';
  let gr = c.createRadialGradient(POOL.x, POOL.y, 140, POOL.x + 160, POOL.y + 120, 1450);
  gr.addColorStop(0, 'rgba(255,255,255,0)');
  gr.addColorStop(0.22, 'rgba(184,192,218,0.42)');
  gr.addColorStop(0.52, 'rgba(84,96,134,0.86)');
  gr.addColorStop(1, 'rgba(32,38,62,0.96)');
  c.fillStyle = gr;
  c.fillRect(o.x - RC, o.y - RC, 2 * RC, 2 * RC);
  // l'acier poli reflète la pièce dans l'ombre (la personne) : une bande sombre
  flouee(c, 110, 'rgba(34,40,60,0.42)', (k) => {
    k.moveTo(960, -60); k.lineTo(1170, -60); k.lineTo(1330, 1120); k.lineTo(1120, 1120); k.closePath();
  });
  c.restore();
  // la lumière n'entre pas dans les chambres, et le culot a ses propres reflets
  c.save();
  c.beginPath();
  c.arc(o.x, o.y, RC - 1, 0, TAU);
  for (let k = 0; k < 6; k++) {
    const [x, y] = chambre(k, rot, o);
    c.moveTo(x + R_BORE - 4, y);
    c.arc(x, y, R_BORE - 4, 0, TAU);
  }
  if (tete) { c.moveTo(tete[0] + tete[2], tete[1]); c.arc(tete[0], tete[1], tete[2], 0, TAU); }
  c.clip('evenodd');
  // flaque de soleil : elle réchauffe l'acier (lumière douce), puis l'éclaire au cœur
  c.globalCompositeOperation = 'soft-light';
  gr = c.createRadialGradient(POOL.x, POOL.y, 0, POOL.x, POOL.y, 820);
  gr.addColorStop(0, 'rgba(255,178,84,0.95)');
  gr.addColorStop(0.45, 'rgba(255,170,80,0.5)');
  gr.addColorStop(1, 'rgba(255,170,80,0)');
  c.fillStyle = gr;
  c.fillRect(o.x - RC, o.y - RC, 2 * RC, 2 * RC);
  c.globalCompositeOperation = 'screen';
  gr = c.createRadialGradient(POOL.x, POOL.y, 0, POOL.x, POOL.y, 560);
  gr.addColorStop(0, 'rgba(255,196,120,0.3)');
  gr.addColorStop(0.5, 'rgba(255,180,104,0.1)');
  gr.addColorStop(1, 'rgba(255,180,106,0)');
  c.fillStyle = gr;
  c.fillRect(o.x - RC, o.y - RC, 2 * RC, 2 * RC);
  // la fenêtre, chaude, en haut à droite
  flouee(c, 110, 'rgba(255,226,186,0.15)', (k) => {
    k.moveTo(1500, 40); k.lineTo(1990, 100); k.lineTo(1990, 560); k.lineTo(1580, 470); k.closePath();
  });
  // reflet large des stries de tournage
  noeud(c, o.x, o.y, RC, NOEUD, '255,222,184', 0.17, 16 * deg, 0.5);
  c.restore();
}

// Reflets vifs, fixes dans l'image, posés après le filé : le trait des stries
// de tournage (il reste net quand le barillet tourne) et l'arête extérieure.
function refletsVifs(c, o, w) {
  c.save();
  c.beginPath();
  c.arc(o.x, o.y, RC - 1, 0, TAU);
  c.clip();
  c.globalCompositeOperation = 'screen';
  noeud(c, o.x, o.y, RC, NOEUD, '255,238,214', 0.1 * (0.6 + 0.4 * w), 5 * deg, 0.5);
  c.restore();
  // arête extérieure : chaude côté fenêtre, rebond froid de la pièce de l'autre côté
  arete(c, o.x, o.y, RC - 11, 20, LANG, '255,214,160', 0.5, 3);
  arete(c, o.x, o.y, RC - 10, 16, -78 * deg, '255,206,148', 0.42, 1.6);
  arete(c, o.x, o.y, RC - 4, 4, -60 * deg, '255,240,214', 0.85, 2.5);
  arete(c, o.x, o.y, RC - 12, 16, 168 * deg, '140,168,210', 0.36, 2);
  arete(c, o.x, o.y, RC - 3, 3, 168 * deg, '190,210,236', 0.5, 4);
}

// Flou de mouvement du barillet : l'image du disque est reposée sur elle-même,
// tournée et à moitié transparente, K fois (2, 4, 8… échantillons répartis sur
// l'angle parcouru pendant l'obturation). On travaille dans un tampon élargi
// dont les marges prolongent les bords de l'image : la rotation y va chercher
// ce qui sort du cadre sans laisser de traces aux bords.
const TAMPONS = new Map();
function flouRotation(c, o, S, K) {
  const W = c.canvas.width, H = c.canvas.height;
  const m = c.getTransform(), k = Math.hypot(m.a, m.b);
  const r = (RC - 3) * k;
  const M = Math.min(420, Math.ceil(r * Math.abs(S)) + 8);   // marge utile
  const key = `${W}x${H}x${M}`;
  let buf = TAMPONS.get(key);
  if (!buf) {
    buf = document.createElement('canvas');
    buf.width = W + 2 * M; buf.height = H + 2 * M;
    TAMPONS.clear();
    TAMPONS.set(key, buf);
  }
  const b = buf.getContext('2d');
  const src = c.canvas;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.globalAlpha = 1;
  b.globalCompositeOperation = 'copy';
  b.drawImage(src, M, M);
  b.globalCompositeOperation = 'source-over';
  // marges : l'image réfléchie en miroir sur ses bords (une chambre coupée par
  // le cadre s'y prolonge à peu près comme elle le ferait vraiment)
  const miroir = (sx, sy, sw, sh, a, d, e, f) => {
    b.setTransform(a, 0, 0, d, e, f);
    b.drawImage(src, sx, sy, sw, sh, sx + (a > 0 ? M : 0), sy + (d > 0 ? M : 0), sw, sh);
  };
  miroir(0, 0, W, M, 1, -1, 0, M);                       // haut
  miroir(0, H - M, W, M, 1, -1, 0, 2 * H + M);           // bas
  miroir(0, 0, M, H, -1, 1, M, 0);                       // gauche
  miroir(W - M, 0, M, H, -1, 1, 2 * W + M, 0);           // droite
  miroir(0, 0, M, M, -1, -1, M, M);                      // coins
  miroir(W - M, 0, M, M, -1, -1, 2 * W + M, M);
  miroir(0, H - M, M, M, -1, -1, M, 2 * H + M);
  miroir(W - M, H - M, M, M, -1, -1, 2 * W + M, 2 * H + M);
  b.setTransform(1, 0, 0, 1, 0, 0);
  const cx = m.a * o.x + m.c * o.y + m.e + M, cy = m.b * o.x + m.d * o.y + m.f + M;
  b.save();
  b.beginPath();
  b.arc(cx, cy, r, 0, TAU);
  b.clip();
  b.globalAlpha = 0.5;
  for (let i = 0; i < K; i++) {
    const d = (S * (1 << i)) / (1 << K);
    b.setTransform(1, 0, 0, 1, cx, cy);
    b.rotate(d);
    b.translate(-cx, -cy);
    b.drawImage(buf, 0, 0);
  }
  b.restore();
  // retour dans l'image, dans le disque seulement
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';
  c.beginPath();
  c.arc(cx - M, cy - M, r, 0, TAU);
  c.clip();
  c.drawImage(buf, M, M, W, H, 0, 0, W, H);
  c.restore();
}

// Lumière liée aux chambres : elle suit le barillet (et se brouille quand il tourne)
function lumiereChambres(c, o, rot, alpha, net, loaded) {
  for (let k = 0; k < 6; k++) {
    const [x, y] = chambre(k, rot, o);
    if (x < -400 || x > 2320 || y < -400 || y > 1480) continue;
    const L = lumiere(x, y) * alpha;
    if (!(loaded && k === 0)) {
      c.save();
      c.globalCompositeOperation = 'multiply';
      const gd = c.createRadialGradient(x, y, R_BORE * 0.55, x, y, R_BORE);
      gd.addColorStop(0, `rgba(14,15,20,${(0.92 * alpha).toFixed(3)})`);
      gd.addColorStop(0.85, `rgba(30,32,40,${(0.7 * alpha).toFixed(3)})`);
      gd.addColorStop(1, 'rgba(60,64,76,0)');
      c.fillStyle = gd;
      c.beginPath();
      c.arc(x, y, R_BORE, 0, TAU);
      c.fill();
      c.restore();
      // paroi intérieure aperçue du côté de la caméra (un mince croissant)
      c.save();
      c.beginPath();
      c.arc(x, y, R_BORE, 0, TAU);
      c.clip();
      c.globalCompositeOperation = 'screen';
      const gx = x + D[0] * R_BORE * 2.4, gy = y + D[1] * R_BORE * 2.4;
      const gr = c.createLinearGradient(gx, gy, x, y);
      gr.addColorStop(0, `rgba(140,150,168,${(0.3 * alpha).toFixed(3)})`);
      gr.addColorStop(0.5, `rgba(80,88,104,${(0.1 * alpha).toFixed(3)})`);
      gr.addColorStop(1, 'rgba(60,66,80,0)');
      c.fillStyle = gr;
      c.beginPath();
      c.arc(x, y, R_BORE, 0, TAU);
      c.arc(x - D[0] * 160, y - D[1] * 160, R_BORE, 0, TAU, true);
      c.fill('evenodd');
      c.restore();
    }
    c.save();
    c.globalCompositeOperation = 'screen';
    c.shadowColor = `rgba(255,200,130,${(0.8 * L).toFixed(3)})`;
    c.shadowBlur = 10;
    arete(c, x, y, R_BORE + 4, 8, LANG + Math.PI, '255,224,174', 0.95 * L, 3);
    c.shadowBlur = 0;
    arete(c, x, y, R_REC - 3, 5, LANG + Math.PI, '255,228,184', 0.65 * L, 4);
    arete(c, x, y, R_REC - 2, 3, LANG, '150,172,206', 0.22 * alpha, 3);
    c.restore();
  }
  // contours de l'étoile et du moyeu : arêtes vives du côté de la lumière (seulement net)
  if (net < 0.02) return;
  c.save();
  c.globalCompositeOperation = 'screen';
  const gr = c.createLinearGradient(o.x + 700 * Math.cos(LANG + Math.PI), o.y + 700 * Math.sin(LANG + Math.PI), o.x + 700 * Math.cos(LANG), o.y + 700 * Math.sin(LANG));
  gr.addColorStop(0, `rgba(170,190,220,${(0.08 * alpha * net).toFixed(3)})`);
  gr.addColorStop(1, `rgba(255,224,180,${(0.32 * alpha * net).toFixed(3)})`);
  c.strokeStyle = gr;
  c.lineWidth = 2.5;
  c.lineJoin = 'round';
  for (const pts of [etoile(o.x, o.y, rot), moyeu(o.x, o.y, rot)]) {
    c.beginPath();
    pts.forEach(([px, py], i) => (i ? c.lineTo(px + 2, py - 2) : c.moveTo(px + 2, py - 2)));
    c.closePath();
    c.stroke();
  }
  c.restore();
}

// Ombre de l'index sur un plan situé à la hauteur « base » (la face : 0 ; le culot : h).
// Plus le doigt est haut au-dessus du plan, plus son ombre glisse vers le bas-gauche.
function ombreDoigt(c, fx, fy, e, base) {
  const ux = Math.cos(A_INDEX * deg), uy = Math.sin(A_INDEX * deg);
  const k = (z) => [(LP[0] - D[0]) * z, (LP[1] - D[1]) * z];
  const ax = TIP[0] + fx + ux * 200, ay = TIP[1] + fy + uy * 200, za = base + 40 + 500 * e;
  const bx = TIP[0] + fx + ux * 900, by = TIP[1] + fy + uy * 900, zb = base + 640 + 500 * e;
  const [sax, say] = k(za), [sbx, sby] = k(zb);
  flouee(c, 30 + 70 * e + 0.04 * base, `rgba(44,52,84,${(0.6 * (1 - e)).toFixed(3)})`, (q2) =>
    capsule(q2, ax + sax, ay + say, 178, bx + sbx, by + sby, 262));
}

// Bord du bouclier de la carcasse, qui entre par la droite quand on referme
function carcasse(c, k) {
  const xe = 2150 - 400 * ease.inOut(k), R = 5200, cy = 420;
  const bord = (q2) => { q2.moveTo(xe, cy); q2.arc(xe + R, cy, R, Math.PI, Math.PI * 3, false); };
  // son ombre sur la face, vers le bas-gauche
  c.save();
  c.globalCompositeOperation = 'multiply';
  c.translate(-70, 50);
  flouee(c, 70, `rgba(30,36,56,${(0.6 * k).toFixed(3)})`, bord);
  c.restore();
  // l'acier, hors de mise au point
  flouee(c, 30, 'rgba(22,25,32,0.98)', bord);
  c.save();
  c.beginPath();
  bord(c);
  c.clip();
  const gr = c.createLinearGradient(xe, 0, xe + 220, 0);
  gr.addColorStop(0, 'rgba(60,68,84,0.35)');
  gr.addColorStop(1, 'rgba(60,68,84,0)');
  c.fillStyle = gr;
  c.fillRect(xe - 40, -200, 400, 1500);
  c.restore();
  // son arête prend le soleil
  c.globalCompositeOperation = 'screen';
  c.shadowColor = 'rgba(255,200,130,0.7)';
  c.shadowBlur = 16;
  arete(c, xe + R, cy, R - 14, 10, Math.PI + 0.05, '255,214,160', 0.5, 1200);
}

// Corps de la cartouche, entre la bouche de la chambre et le culot
function etui(c, lx, ly, hx, hy, s) {
  const dx = hx - lx, dy = hy - ly, l = Math.hypot(dx, dy);
  if (l < 1.5) return;
  const nx = -dy / l, ny = dx / l;   // normale : vers le haut-droite, côté lumière
  const gr = c.createLinearGradient(lx - nx * R_CASE, ly - ny * R_CASE, lx + nx * R_CASE, ly + ny * R_CASE);
  gr.addColorStop(0, '#4a3a22');
  gr.addColorStop(0.1, '#6f4e1c');
  gr.addColorStop(0.34, '#a57527');
  gr.addColorStop(0.58, '#d19f45');
  gr.addColorStop(0.74, P.brassLight);
  gr.addColorStop(0.81, '#fff2cf');
  gr.addColorStop(0.9, '#d5a14b');
  gr.addColorStop(1, '#7c5720');
  c.fillStyle = gr;
  c.beginPath();
  capsule(c, lx, ly, R_CASE, hx, hy, R_CASE * s);
  c.fill();
  // l'étui s'enfonce dans l'ombre de la chambre
  c.save();
  c.beginPath();
  capsule(c, lx, ly, R_CASE, hx, hy, R_CASE * s);
  c.clip();
  c.globalCompositeOperation = 'multiply';
  const ex = lx - (dx / l) * R_CASE, ey = ly - (dy / l) * R_CASE;
  const g2 = c.createLinearGradient(ex, ey, ex + (dx / l) * 150, ey + (dy / l) * 150);
  g2.addColorStop(0, 'rgba(36,30,38,0.9)');
  g2.addColorStop(0.3, 'rgba(110,90,84,0.45)');
  g2.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g2;
  c.fillRect(Math.min(lx, hx) - 300, Math.min(ly, hy) - 300, Math.abs(dx) + 600, Math.abs(dy) + 600);
  c.restore();
}

// Le culot sous le soleil : reflets fixes par rapport à la lumière
function lumiereCulot(c, x, y, s, alpha, net) {
  c.save();
  c.beginPath();
  c.arc(x, y, R_RIM * s, 0, TAU);
  c.clip();
  // le laiton poli reflète la pièce sombre : il se creuse vers le bas-gauche
  c.globalCompositeOperation = 'multiply';
  let gr = c.createLinearGradient(x + 200 * s, y - 160 * s, x - 220 * s, y + 200 * s);
  gr.addColorStop(0, 'rgba(255,255,255,0)');
  gr.addColorStop(0.55, `rgba(190,160,140,${(0.35 * alpha).toFixed(3)})`);
  gr.addColorStop(1, `rgba(96,70,70,${(0.8 * alpha).toFixed(3)})`);
  c.fillStyle = gr;
  c.fillRect(x - 300, y - 300, 600, 600);
  c.globalCompositeOperation = 'screen';
  noeud(c, x, y, R_RIM * s, -58 * deg, '255,236,190', 0.5 * alpha, 7 * deg, 0.55);
  noeud(c, x, y, R_RIM * s, -58 * deg, '255,250,236', 0.35 * alpha * net, 1.8 * deg, 0.55);
  gr = c.createRadialGradient(x + 80 * s, y - 90 * s, 0, x + 80 * s, y - 90 * s, 190 * s);
  gr.addColorStop(0, `rgba(255,232,180,${(0.3 * alpha).toFixed(3)})`);
  gr.addColorStop(1, 'rgba(255,232,180,0)');
  c.fillStyle = gr;
  c.fillRect(x - 300, y - 300, 600, 600);
  c.restore();
  c.save();
  c.globalCompositeOperation = 'screen';
  c.shadowColor = 'rgba(255,206,130,0.9)';
  c.shadowBlur = 14;
  arete(c, x, y, (R_RIM - 5) * s, 8 * s, LANG, '255,240,200', 1 * alpha, 3);
  c.shadowBlur = 0;
  arete(c, x, y, (R_RIM - 5) * s, 6 * s, LANG + Math.PI, '150,170,206', 0.35 * alpha, 2);
  arete(c, x, y, (R_PRIM + 4) * s, 5 * s, LANG + Math.PI, '255,236,190', 0.7 * alpha, 3);
  arete(c, x, y, (R_PRIM - 2) * s, 3 * s, LANG, '255,244,214', 0.5 * alpha, 4);
  c.restore();
}

// Rai de soleil : une bande chaude en biais, quelques rayons qui glissent lentement
function rais(c, T, k) {
  c.globalCompositeOperation = 'screen';
  c.translate(POOL.x, POOL.y);
  c.rotate(Math.atan2(0.53, -0.85));
  let gr = c.createLinearGradient(0, -560, 0, 560);
  gr.addColorStop(0, 'rgba(255,210,150,0)');
  gr.addColorStop(0.32, `rgba(255,210,150,${(0.05 * k).toFixed(3)})`);
  gr.addColorStop(0.5, `rgba(255,214,156,${(0.09 * k).toFixed(3)})`);
  gr.addColorStop(0.72, `rgba(255,210,150,${(0.04 * k).toFixed(3)})`);
  gr.addColorStop(1, 'rgba(255,210,150,0)');
  c.fillStyle = gr;
  c.fillRect(-2600, -560, 5200, 1120);
  for (let i = 0; i < 6; i++) {
    const y0 = -330 + i * 125 + 34 * Math.sin(T * 0.21 + i * 1.7), w = 24 + 18 * ((i * 7) % 3);
    gr = c.createLinearGradient(0, y0 - w, 0, y0 + w);
    gr.addColorStop(0, 'rgba(255,226,180,0)');
    gr.addColorStop(0.5, `rgba(255,226,180,${((0.04 + 0.015 * Math.sin(T * 0.4 + i)) * k).toFixed(3)})`);
    gr.addColorStop(1, 'rgba(255,226,180,0)');
    c.fillStyle = gr;
    c.fillRect(-2600, y0 - w, 5200, 2 * w);
  }
}

// Poussière dans la lumière : quelques grains flous, devant le sujet
const MOTES = (() => {
  const r = rng(91);
  return Array.from({ length: 36 }, () => ({
    x: r() * 2320 - 200, y: r() * 1300 - 110, vx: (r() - 0.5) * 14, vy: -3 - r() * 9,
    rr: 3 + r() * r() * 18, ph: r() * TAU, a: 0.35 + r() * 0.65,
  }));
})();

// Vitesse du barillet : départ franc, ralentissement très doux (table cumulée)
const SPIN_TABLE = (() => {
  const N = 2000, acc = [0];
  let s = 0;
  for (let i = 0; i < N; i++) {
    const u = (i + 0.5) / N;
    s += sm(0, 0.06, u) * Math.pow(1 - u, 2.2);
    acc.push(s);
  }
  return acc.map((a) => a / s);
})();
const spinCurve = (u) => {
  const x = clamp(u) * 2000, i = Math.min(1999, Math.floor(x));
  return lerp(SPIN_TABLE[i], SPIN_TABLE[i + 1], x - i);
};
const T_SPIN = [3.25, 6.2];
const spinAt = (t) => SPIN * spinCurve((t - T_SPIN[0]) / (T_SPIN[1] - T_SPIN[0]));
const SHUTTER = 1 / 48;   // obturateur à 180° (24 images/s)
// Le pouce : il se pose (léger recul), glisse vite vers le bas, puis revient lentement
const pouceAt = (t) => -0.1 * (seg(t, 2.8, 3.05) - seg(t, 3.05, 3.15)) + seg(t, 3.08, 3.36, ease.out) * (1 - seg(t, 3.8, 5.0));

export default {
  id: ID,
  bg: '#141317',
  home: { x: 960, y: 540, z: 1 },
  layers: {
    fond: { box: [-240, -140, 2400, 1400], svg: FOND, filters: ['paint'], par: 0.55 },
    barillet: { box: [C.x - RC - 30, C.y - RC - 30, 2 * RC + 60, 2 * RC + 60], svg: BAR, filters: ['paint'], res: 0.9 },
    culot: { box: [-270, -270, 540, 540], svg: CULOT, filters: ['paint'] },
    index: { box: [-480, -620, 1540, 1260], svg: INDEX, filters: ['paint', 'b3'] },
    pouce: { box: [-240, 300, 1100, 1100], svg: POUCE, filters: ['paint', 'b3'] },
    gauche: { box: [-200, 760, 1400, 640], svg: GAUCHE, filters: ['paint', 'b6'] },
  },

  // p : push (0 → 1, la cartouche entre), doigt (0 → 1, l'index se retire),
  //     pouce (0 → 1, le pouce lance), rot (rad), flou (rad parcourus pendant
  //     l'obturation), ferme (0 → 1, on referme), balle (0 / 1)
  render(g, p, T) {
    const push = p.push ?? 0, retrait = p.doigt ?? 0, pouce = p.pouce ?? 0;
    const rot = p.rot ?? 0, flou = p.flou ?? 0, ferme = p.ferme ?? 0, balle = p.balle ?? 1;
    const o = { x: C.x + 110 * ferme, y: C.y - 14 * ferme };
    const smear = Math.abs(flou) * RB;                 // longueur du filé (unités du décor)
    const w = 1 - sm(8, 50, smear);                    // 1 : image nette, 0 : barillet lancé
    const h = H0 * (1 - push), s = 1 + PERS * h;
    const seated = h < 0.5;
    const [lx, ly] = chambre(0, rot, o);
    const hx = lx + D[0] * h, hy = ly + D[1] * h;

    g.img('fond');
    // Rais de soleil dans l'air de la pièce, derrière le barillet
    g.fx(0.7, (c) => rais(c, T, 1));
    // le pouce gauche, contre le flanc (derrière la face) ; quand il lance le
    // barillet, il file un peu (trois images fantômes le long de son geste)
    const pf = p.pouceFlou ?? 0;
    const tfPouce = (v) => ({ x: o.x - C.x - 40 * v, y: o.y - C.y + 210 * v, rot: 0.06 * v, ox: POUCE0[0], oy: POUCE0[1] });
    if (Math.abs(pf) > 0.02) for (let i = 3; i >= 1; i--) g.img('pouce', { alpha: 0.28, tf: tfPouce(pouce - (pf * i) / 3) });
    g.img('pouce', { tf: tfPouce(pouce) });

    // Ce qui tourne : la face, ses arêtes, et le culot quand la cartouche est en place
    const clip = (c) => { c.beginPath(); c.arc(C.x, C.y, RC - 2, 0, TAU); };
    g.img('barillet', { clip, tf: { rot, ox: C.x, oy: C.y, x: o.x - C.x, y: o.y - C.y } });
    if (balle && seated) g.img('culot', { tf: { x: lx, y: ly, rot } });
    g.fx(1, (c) => {
      lumiereFace(c, o, rot, balle && seated ? [lx, ly, R_RIM] : null);
      lumiereChambres(c, o, rot, 1, w, balle);
      if (balle && seated) lumiereCulot(c, lx, ly, 1, 1, w);
      // le filé : tout ce qui précède tourne avec le barillet pendant l'obturation
      if (smear > 2) flouRotation(c, o, -flou, Math.min(6, Math.max(1, Math.ceil(Math.log2(smear / 3)))));
      refletsVifs(c, o, w);
    });

    // Ombre portée du doigt sur la face (avant la cartouche, qui la recouvre)
    const e = ease.inOut(retrait);
    const fx = D[0] * (h - H0) - 640 * e, fy = D[1] * (h - H0) - 480 * e;
    if (retrait < 1) {
      g.fx(1, (c) => {
        c.save();
        c.beginPath();
        c.arc(o.x, o.y, RC, 0, TAU);
        c.clip();
        c.globalCompositeOperation = 'multiply';
        ombreDoigt(c, fx, fy, e, h);
        c.restore();
      });
    }

    // La cartouche
    if (balle) {
      // le laiton au soleil renvoie un peu d'or sur l'acier autour de lui
      g.fx(1, (c) => {
        c.save();
        c.beginPath();
        c.arc(o.x, o.y, RC - 2, 0, TAU);
        c.clip();
        c.globalCompositeOperation = 'screen';
        const L = lumiere(lx, ly) * (0.35 + 0.65 * w);
        const gr = c.createRadialGradient(lx + D[0] * h * 0.6, ly + D[1] * h * 0.6, R_RIM * 0.8, lx, ly, R_RIM * 2.1);
        gr.addColorStop(0, `rgba(255,186,92,${(0.22 * L).toFixed(3)})`);
        gr.addColorStop(1, 'rgba(255,186,92,0)');
        c.fillStyle = gr;
        c.fillRect(lx - 700, ly - 700, 1400, 1400);
        c.restore();
      });
      if (!seated) {
        g.fx(1, (c) => {
          // ombre de l'étui sur la face, puis l'étui
          c.save();
          c.beginPath();
          c.arc(o.x, o.y, RC, 0, TAU);
          c.clip();
          c.globalCompositeOperation = 'multiply';
          flouee(c, 26, 'rgba(48,56,86,0.62)', (k) => capsule(k, lx, ly, R_CASE * 0.96, lx + LP[0] * h, ly + LP[1] * h, R_CASE * 0.92));
          c.restore();
          etui(c, lx, ly, hx, hy, s);
        });
        g.img('culot', { tf: { x: hx, y: hy, rot, sx: s, sy: s } });
        g.fx(1, (c) => lumiereCulot(c, hx, hy, s, 1, 1));
      }
    }

    // L'index droit : il suit le culot, puis se retire vers la caméra
    if (retrait < 1) {
      g.fx(1, (c) => {
        c.save();
        c.beginPath();
        c.arc(hx, hy, R_RIM * s, 0, TAU);
        c.clip();
        c.globalCompositeOperation = 'multiply';
        ombreDoigt(c, fx, fy, e, 0);
        c.restore();
      });
      g.img('index', { tf: { x: fx, y: fy, rot: -0.06 * e, ox: TIP[0], oy: TIP[1] } });
    }

    // On referme : le bouclier de la carcasse (acier sombre, flou, plus près
    // de la caméra) glisse depuis la droite sur la face du barillet
    if (ferme > 0) g.fx(1.06, (c) => carcasse(c, ferme));

    // La main gauche
    g.img('gauche', { tf: { x: o.x - C.x, y: o.y - C.y } });

    // Un voile de lumière très léger devant le sujet
    g.fx(1.12, (c) => rais(c, T, 0.35));

    // Poussière en suspension, devant le sujet
    g.fx(1.3, (c) => {
      c.globalCompositeOperation = 'screen';
      for (const m of MOTES) {
        const x = ((m.x + m.vx * T + 14 * Math.sin(T * 0.5 + m.ph) + 200) % 2320 + 2320) % 2320 - 200;
        const y = ((m.y + m.vy * T + 10 * Math.sin(T * 0.37 + m.ph * 1.7) + 110) % 1300 + 1300) % 1300 - 110;
        const a = m.a * (0.12 + lumiere(x, y)) * (0.75 + 0.25 * Math.sin(T * 1.3 + m.ph));
        const gr = c.createRadialGradient(x, y, 0, x, y, m.rr);
        gr.addColorStop(0, `rgba(255,236,200,${(0.5 * a).toFixed(3)})`);
        gr.addColorStop(0.6, `rgba(255,226,180,${(0.2 * a).toFixed(3)})`);
        gr.addColorStop(1, 'rgba(255,226,180,0)');
        c.fillStyle = gr;
        c.beginPath();
        c.arc(x, y, m.rr, 0, TAU);
        c.fill();
      }
    });
  },

  shots: {
    charge: {
      dur: 7.5,
      cam: (t, portrait) => {
        const k = seg(t, 0, 7.5, ease.inOut), f = seg(t, 6.6, 7.5, ease.in);
        const sway = { x: 4 * Math.sin(t * 0.83), y: 3 * Math.sin(t * 0.61 + 1) };
        return portrait
          ? (() => {
              // téléphone : serré sur la cartouche, puis on s'écarte un peu pour voir le pouce
              const r = seg(t, 2.3, 3.3);
              return { x: lerp(860, 790, r) + 40 * f + sway.x, y: 548 - 10 * k + sway.y, z: lerp(0.97, 0.87, r) + 0.02 * k };
            })()
          : { x: 960 + 18 * k + 30 * f + sway.x, y: 540 - 8 * k + sway.y, z: 1 + 0.04 * k };
      },
      p: (t) => ({
        push: seg(t, 0.8, 2.6),
        doigt: seg(t, 2.7, 3.55),
        pouce: pouceAt(t),
        pouceFlou: pouceAt(t) - pouceAt(t - SHUTTER),
        rot: spinAt(t),
        flou: spinAt(t) - spinAt(t - SHUTTER),
        ferme: seg(t, 6.6, 7.5, ease.in),
        balle: 1,
      }),
    },
  },
};
