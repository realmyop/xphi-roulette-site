/* ==========================================================================
   Décor « a2-lettre » — très gros plan : la lettre du test génétique, posée
   sur la grande table de cuisine en bois clair, un matin d'automne.

   La feuille est vue en plongée douce, de très près : son bord supérieur (un
   peu soulevé par le pliage), quelques lignes grises abstraites et le schéma
   — un anneau de petits cercles gris dont un seul est teinté de laiton. Le
   cadrage coupe l'anneau, la profondeur de champ très faible brouille le côté
   proche et le côté lointain : on ne peut jamais compter les cercles.

   Tout passe par une caméra physique (hauteur, plongée, focale) : la feuille,
   les cercles et le doigt sont projetés en perspective, et la profondeur de
   champ est calculée à partir de la distance au plan de la table. La mise au
   point bascule du bord de la feuille vers le schéma.

   Le soleil du matin entre par la gauche, bas et un peu de derrière ; les
   plantes de l'appui de fenêtre jettent sur la feuille l'ombre de deux
   rameaux. Le doigt de A (index droit) arrive de la droite ; son ombre longue
   et bleutée tombe à sa droite, loin du cercle de laiton, qui reste au
   soleil. Le laiton est le seul or saturé de l'image.

   Paramètres (p) :
     focus  0 → 1   mise au point : bord de la feuille → schéma
     trace  0 → 1   le doigt longe le bord de l'anneau jusqu'au cercle de laiton
     touche 0 → 1   le doigt se pose (effleure le cercle) ; 0 : il survole
   ========================================================================== */
import { P, rng } from '../kit.js';
import { TAU, clamp, lerp, seg, ease } from '../../film/engine.js';

const ID = 'a2-lettre';
const deg = Math.PI / 180;
const q = (v) => Math.round(v * 10) / 10;
const XY = (p) => `${q(p[0])} ${q(p[1])}`;
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const norm = ([x, y]) => { const m = Math.hypot(x, y) || 1; return [x / m, y / m]; };
const n3 = (v) => { const m = Math.hypot(...v) || 1; return v.map((a) => a / m); };
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => Math.round(clamp(v) * 255).toString(16).padStart(2, '0')).join('');

/* --------------------------------------------------------------------------
   Caméra physique : à 320 mm du point visé, plongée de 44°, longue focale.
   Unités de la table en millimètres ; X vers la droite, Y en s'éloignant,
   Z vers le haut. L'écran est le cadre 1920 × 1080 du décor (z = 1).
   -------------------------------------------------------------------------- */
const PHI = 44 * deg, DIST = 320, FOC = 4600;
const CP = Math.cos(PHI), SP = Math.sin(PHI);
const CAMY = -DIST * CP, CAMZ = DIST * SP;
const CAM3 = [0, CAMY, CAMZ];
function proj(X, Y, Z = 0) {
  const dy = Y - CAMY, dz = Z - CAMZ;
  const yc = dy * SP + dz * CP, zc = dy * CP - dz * SP;
  return [960 + (FOC * X) / zc, 540 - (FOC * yc) / zc, zc];
}
// Point de l'écran → point du plan de la table
function plan(x, y) {
  const a = (x - 960) / FOC, b = -(y - 540) / FOC;
  const dy = b * SP + CP, dz = b * CP - SP;
  const t = -CAMZ / dz;
  return [t * a, CAMY + t * dy];
}
// Sur le plan de la table, 1/profondeur varie linéairement avec la rangée de l'écran
const INV_DY = (1 / proj(...plan(960, 900))[2] - 1 / proj(...plan(960, 100))[2]) / 800;
// Profondeur de champ (choix d'image) : flou par unité d'écart, à l'écran, au
// plan de netteté, et flou maximal (unités du décor)
const SLOPE = 0.045;
const SIG_MAX = 26;

/* --------------------------------------------------------------------------
   Le soleil : bas (24°), depuis la gauche, à peine de derrière
   -------------------------------------------------------------------------- */
const SUN = (() => { const e = 24 * deg, a = -12 * deg; return [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), -Math.sin(e)]; })();
const TO_SUN = SUN.map((v) => -v);
// Ombre d'un point 3D sur la table
const ombre3 = (p) => [p[0] - (p[2] / SUN[2]) * SUN[0], p[1] - (p[2] / SUN[2]) * SUN[1]];
const D_SUN = norm([SUN[0], SUN[1]]);                    // course du soleil, à plat

/* --------------------------------------------------------------------------
   La feuille : repère (u, v) en mm, u le long du bord supérieur, v en
   descendant la page (vers la caméra). L'anneau est placé pour que le cercle
   de laiton tombe au centre du cadre.
   -------------------------------------------------------------------------- */
const RHO = -3 * deg;                                    // la feuille est un peu de biais
const EU = [Math.cos(RHO), Math.sin(RHO)], EV = [Math.sin(RHO), -Math.cos(RHO)];
const R = 27, RCI = 2.6, NC = 22;                        // anneau : rayon, rayon des cercles, nombre
const KB = 0;                                            // indice du cercle de laiton
const TH0 = 17;                                          // angle du cercle de laiton (degrés ; 0 : à droite, 90 : au loin)
const th = (k) => (TH0 + (k * 360) / NC) * deg;
const UR = 110, VR = 52;                                 // centre de l'anneau sur la feuille
const BRASS_AT = [960, 515];                             // le cercle de laiton, à l'écran (z = 1)
const B_T = plan(...BRASS_AT);
const B_P = [UR + R * Math.cos(th(KB)), VR - R * Math.sin(th(KB))];
const O = [B_T[0] - B_P[0] * EU[0] - B_P[1] * EV[0], B_T[1] - B_P[0] * EU[1] - B_P[1] * EV[1]];
// Le pliage soulève doucement le bord supérieur (quelques millimètres, ondulé)
const lift = (u, v) => 3.2 * (1 + 0.3 * Math.sin(u / 37 + 1.2)) * Math.max(0, 1 - v / 20) ** 2;
const T3 = (u, v) => [O[0] + u * EU[0] + v * EV[0], O[1] + u * EU[1] + v * EV[1], lift(u, v)];
const PP = (u, v) => proj(...T3(u, v));
const ringPt = (a, rr = R) => [UR + rr * Math.cos(a), VR - rr * Math.sin(a)];
const V_PLI = 99;                                        // le premier pli (la feuille est pliée en trois)

// Petit disque de la feuille → ellipse en perspective (matrice locale)
function disque(u, v, r) {
  const c = PP(u, v), a0 = PP(u + r, v), a1 = PP(u - r, v), b0 = PP(u, v + r), b1 = PP(u, v - r);
  const A = [(a0[0] - a1[0]) / (2 * r), (a0[1] - a1[1]) / (2 * r)], B = [(b0[0] - b1[0]) / (2 * r), (b0[1] - b1[1]) / (2 * r)];
  return `matrix(${A[0].toFixed(4)} ${A[1].toFixed(4)} ${B[0].toFixed(4)} ${B[1].toFixed(4)} ${q(c[0])} ${q(c[1])})`;
}

// Rangée du bord supérieur au-dessus du laiton (mise au point initiale)
const EDGE_U = (() => { let best = 0, d = 1e9; for (let u = -80; u < 300; u += 0.5) { const p = PP(u, 0); if (Math.abs(p[0] - BRASS_AT[0]) < d) { d = Math.abs(p[0] - BRASS_AT[0]); best = u; } } return best; })();
const Y_EDGE = PP(EDGE_U, 0)[1];
const Y_BRASS = BRASS_AT[1];

/* --------------------------------------------------------------------------
   Outils de tracé
   -------------------------------------------------------------------------- */
function lisse(p, closed = true) {
  const n = p.length;
  const g = (i) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${XY(p[0])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2);
    d += `C${XY([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6])} ${XY([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6])} ${XY(c)}`;
  }
  return closed ? d + 'Z' : d;
}
const polyD = (pts) => 'M' + pts.map(XY).join('L') + 'Z';
const stops = (s) => s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
const linU = (id, s, x1, y1, x2, y2) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${q(x1)}" y1="${q(y1)}" x2="${q(x2)}" y2="${q(y2)}">${stops(s)}</linearGradient>`;
const radU = (id, s, cx, cy, r, fx = cx, fy = cy) =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${q(cx)}" cy="${q(cy)}" r="${q(r)}" fx="${q(fx)}" fy="${q(fy)}">${stops(s)}</radialGradient>`;
const blurF = (id, s) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
// Touche de brosse : la couleur n'apparaît que par plaques allongées (bruit
// étiré), pour casser les dégradés trop lisses
const brosse = (id, fx, fy, seed, gain = 3, cut = 1.25) =>
  `<filter id="${id}" filterUnits="objectBoundingBox" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="3" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${gain} 0 0 0 -${cut}" result="a"/>` +
  `<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>`;
// Grain de papier : mouchetures très fines, à peine visibles
const fibresF = (id, seed) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="0.7 0.28" numOctaves="2" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.58  0 0 0 0 0.52  0 0 0 -2.2 1.32"/>` +
  `<feComposite in2="SourceGraphic" operator="in"/></filter>`;

/* --------------------------------------------------------------------------
   Calque : la table (chêne clair, au loin, au soleil)
   -------------------------------------------------------------------------- */
const FOND = (() => {
  const r = rng(17);
  let s = `<defs>
    ${linU(`${ID}-bois`, [[0, '#edd2a8'], [0.45, '#e0bb8e'], [1, '#d0a576']], 0, -140, 0, 420)}
    ${radU(`${ID}-jour`, [[0, '#fff4dc', 0.95], [0.5, '#fbe2b8', 0.4], [1, '#fbe2b8', 0]], -100, -40, 1700)}
    ${blurF(`${ID}-f3`, 3)}
  </defs>`;
  s += `<rect x="-240" y="-140" width="2400" height="700" fill="url(#${ID}-bois)"/>`;
  // lames : joints et veines, le long de X, en perspective
  const ligne = (Y, amp, ph, w, col, op) => {
    const pts = [];
    for (let X = -300; X <= 300; X += 12) { const p = proj(X, Y + amp * Math.sin(X / 23 + ph) + 0.4 * amp * Math.sin(X / 7.3 + ph * 2)); pts.push([p[0], p[1]]); }
    return `<path d="${lisse(pts, false)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;
  };
  let veines = '';
  for (let Y = 40; Y < 190; Y += 1.8 + r() * 2.8) {
    const dark = r() < 0.55;
    veines += ligne(Y, 0.6 + r() * 1.4, r() * TAU, q(1.5 + r() * 3.5), dark ? '#ab8058' : '#f0d6b0', q(dark ? 0.2 + r() * 0.25 : 0.18 + r() * 0.2));
  }
  s += `<g filter="url(#${ID}-f3)">${veines}</g>`;
  for (const Y of [78, 172]) s += ligne(Y, 0.3, 0, 6, '#8a6a4c', 0.5) + ligne(Y - 0.9, 0.3, 0, 3, '#f6e2c0', 0.5);
  s += `<rect x="-240" y="-140" width="2400" height="700" fill="url(#${ID}-jour)"/>`;
  return s;
})();

/* --------------------------------------------------------------------------
   Calque : la feuille (papier, lignes grises, anneau de cercles, laiton)
   -------------------------------------------------------------------------- */
const FEUILLE = (() => {
  const r = rng(29);
  const top = [];
  for (let u = -90; u <= 330; u += 6) { const p = PP(u, 0); top.push([p[0], p[1]]); }
  const out = [...top, [2400, 1400], [-400, 1400]];
  const edge = lisse(top, false);
  const pliA = PP(-90, V_PLI), pliB = PP(330, V_PLI);
  let s = `<defs>
    <clipPath id="${ID}-c-papier"><path d="${polyD(out)}"/></clipPath>
    ${linU(`${ID}-papier`, [[0, '#fcf6ea'], [0.3, '#f9f2e5'], [1, '#f1e9dc']], 0, Y_EDGE, 0, 1150)}
    ${linU(`${ID}-courbe`, [[0, '#fff3da', 0.75], [0.12, '#fff3da', 0.3], [0.35, '#b8b4bc', 0.1], [1, '#b8b4bc', 0]], 0, Y_EDGE - 30, 0, Y_EDGE + 160)}
    ${radU(`${ID}-laiton`, [[0, '#e3b25a'], [0.5, P.brass], [0.88, '#c18c34'], [1, P.brassDark]], 0, 0, RCI)}
    ${radU(`${ID}-gris`, [[0, '#d4cfc7'], [0.8, '#c6c0b7'], [1, '#aba49b']], 0, 0, RCI)}
    ${fibresF(`${ID}-fibres`, 7)}
    ${blurF(`${ID}-f1`, 1)}${blurF(`${ID}-f2`, 2)}${blurF(`${ID}-f4`, 4)}${blurF(`${ID}-f30`, 40)}
  </defs>`;
  s += `<g clip-path="url(#${ID}-c-papier)">`;
  s += `<path d="${polyD(out)}" fill="url(#${ID}-papier)"/>`;
  s += `<rect x="-400" y="-200" width="2800" height="1600" fill="#fff" filter="url(#${ID}-fibres)" opacity=".3"/>`;
  // lavis : de grandes nuances très douces, crème chaud et lilas froid
  for (let i = 0; i < 16; i++) {
    const x = -200 + r() * 2300, y = Y_EDGE + r() * (1100 - Y_EDGE), rx = 140 + r() * 320, ry = 70 + r() * 150;
    const warm = x < 1000 ? r() < 0.7 : r() < 0.35;
    s += `<ellipse cx="${q(x)}" cy="${q(y)}" rx="${q(rx)}" ry="${q(ry)}" transform="rotate(${q(-12 + r() * 24)} ${q(x)} ${q(y)})" fill="${warm ? '#f6dfb8' : '#c7c4d8'}" opacity="${q(0.16 + r() * 0.12)}" filter="url(#${ID}-f30)"/>`;
  }
  // le bord soulevé laisse passer le soleil (il s'éclaire), puis s'incline vers nous
  s += `<path d="${polyD(out)}" fill="url(#${ID}-courbe)"/>`;
  // le panneau sous le pli s'incline à peine : une nuance plus froide
  s += `<path d="${polyD([[pliA[0], pliA[1]], [pliB[0], pliB[1]], [2400, 1400], [-400, 1400]])}" fill="#c9cbd4" opacity=".22"/>`;
  s += `<path d="M${XY(pliA)}L${XY(pliB)}" stroke="#a69d92" stroke-width="3" opacity=".5" filter="url(#${ID}-f2)"/>`;
  s += `<path d="M${XY([pliA[0], pliA[1] - 4])}L${XY([pliB[0], pliB[1] - 4])}" stroke="#fffaf2" stroke-width="5" opacity=".6" filter="url(#${ID}-f2)"/>`;

  // lignes grises abstraites : des traits arrondis séparés de blancs (aucune lettre)
  const ink = '#a29b93';
  const mot = (u0, u1, v, h, op) => {
    const a = PP(u0, v), b = PP(u1, v), um = (u0 + u1) / 2;
    const p1 = PP(um, v + h / 2), p2 = PP(um, v - h / 2);
    const t = Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
    return `<path d="M${XY(a)}L${XY(b)}" stroke="${ink}" stroke-width="${q(t)}" stroke-linecap="round" opacity="${q(op)}"/>`;
  };
  const rangee = (u0, u1, v, end = 1, h = 0.85) => {
    let o = '', u = u0;
    const stop = u0 + (u1 - u0) * end;
    while (u < stop - 2) {
      const x = r();
      const L = Math.min(stop - u, x < 0.3 ? 1.2 + r() * 2 : x < 0.8 ? 3 + r() * 5 : 7 + r() * 9);
      o += mot(u, u + L, v, h * (0.85 + 0.25 * r()), 0.42 + r() * 0.16);
      u += L + 1.1 + r() * 0.45 + (r() < 0.08 ? 2.2 : 0);
    }
    return o;
  };
  const LH = 4.6;                                        // interligne
  let lignes = '';
  lignes += rangee(-60, 320, 8, 1) + rangee(-60, 320, 8 + LH, 0.78);
  const uc = UR + R + RCI + 7, ul = UR - R - RCI - 7;
  for (let i = 0, v = 22; v < VR + R; v += LH, i++) {
    lignes += rangee(uc, 320, v, i === 6 ? 0.42 : 1);
    lignes += rangee(-60, ul, v, 1);
  }
  lignes += rangee(UR - 13, UR + 13, VR + R + RCI + 5.5, 1, 0.8);
  for (let i = 0, v = VR + R + RCI + 12; v < 160; v += LH, i++) {
    if (Math.abs(v - V_PLI) < 2.5) continue;
    lignes += rangee(-60, 320, v, i % 5 === 3 ? 0.6 : 1);
  }
  s += lignes;

  // l'anneau : un trait fin qui relie les centres
  const ring = (rr) => { const pts = []; for (let i = 0; i < 144; i++) { const p = PP(...ringPt((i / 144) * TAU, rr)); pts.push([p[0], p[1]]); } return pts; };
  s += `<path d="${polyD(ring(R + 0.16))} ${polyD(ring(R - 0.16).reverse())}" fill="#9f998f" fill-rule="evenodd" opacity=".75"/>`;
  // les cercles : gris clair cernés ; un seul en laiton
  for (let k = 0; k < NC; k++) {
    const [u, v] = ringPt(th(k));
    const m = disque(u, v, RCI);
    if (k === KB) {
      s += `<g transform="${m}"><circle r="${RCI}" fill="url(#${ID}-laiton)"/>` +
        `<circle r="${RCI - 0.16}" fill="none" stroke="${P.brassDark}" stroke-width="0.26" opacity=".7"/>` +
        `<ellipse cx="-0.7" cy="-0.8" rx="1.5" ry="0.9" fill="${P.brassLight}" opacity=".4"/></g>`;
    } else {
      s += `<g transform="${m}"><circle r="${RCI}" fill="url(#${ID}-gris)"/><circle r="${RCI - 0.13}" fill="none" stroke="#968f86" stroke-width="0.24" opacity=".8"/></g>`;
    }
  }
  s += '</g>';
  // le bord de la feuille, traversé par le soleil : un fil chaud et lumineux
  s += `<path d="${edge}" fill="none" stroke="#fff1d6" stroke-width="7" opacity=".55" filter="url(#${ID}-f2)"/>`;
  s += `<path d="${edge}" fill="none" stroke="#fffaf0" stroke-width="2.2" opacity=".95"/>`;
  return s;
})();

/* --------------------------------------------------------------------------
   Le doigt (index droit de A) : un tube effilé en 3D, projeté
   -------------------------------------------------------------------------- */
const S_DIP = 24;                                        // pli de la dernière phalange (mm depuis le bout)
const RAYON = [[0, 6.0], [2, 6.5], [6, 6.8], [14, 6.9], [22, 7.1], [25, 7.4], [32, 7.3], [44, 7.8], [51, 8.3], [60, 8.1], [140, 8.8], [240, 9.4]];
const rayon = (s) => {
  for (let i = 1; i < RAYON.length; i++) if (s <= RAYON[i][0]) return lerp(RAYON[i - 1][1], RAYON[i][1], (s - RAYON[i - 1][0]) / (RAYON[i][0] - RAYON[i - 1][0]));
  return RAYON[RAYON.length - 1][1];
};
// Pose : point de contact sous le bout, orientation (vers la main), hauteur de survol
function axe(pose) {
  const { T, az, h = 0 } = pose;
  const d = (b) => [Math.cos(az) * Math.cos(b), -Math.sin(az) * Math.cos(b), Math.sin(b)];
  const d1 = d(15 * deg), d2 = d(8 * deg);
  const A0 = [T[0], T[1], rayon(0) + h];
  return (s) => {
    const s1 = Math.min(s, S_DIP), s2 = Math.max(0, s - S_DIP);
    return [A0[0] + d1[0] * s1 + d2[0] * s2, A0[1] + d1[1] * s1 + d2[1] * s2, A0[2] + d1[2] * s1 + d2[2] * s2];
  };
}
// Le bout effleure le cercle de laiton sur son bord lointain, côté droit :
// le cercle reste presque entier devant le doigt
const AZ_FIN = 58 * deg;
// Silhouette du doigt à l'écran pour une pose (axe, rayons, bout arrondi)
const S_SIL = [0, 0.5, 1, 2, 3, 4.5, 6, 8, 10, 13, 16, 20, 24, 28, 33, 40, 48, 56, 66, 80, 96, 115, 140, 170, 210, 240];
function silhouette(pose, S = S_SIL) {
  const A = axe(pose);
  const C = S.map((s) => proj(...A(s)));
  const RP = S.map((s, i) => (rayon(s) * FOC) / C[i][2]);
  const up = [], dn = [];
  for (let i = 0; i < S.length; i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(S.length - 1, i + 1)];
    const t = norm([b[0] - a[0], b[1] - a[1]]), n = [-t[1], t[0]];
    up.push([C[i][0] - n[0] * RP[i], C[i][1] - n[1] * RP[i]]);
    dn.push([C[i][0] + n[0] * RP[i], C[i][1] + n[1] * RP[i]]);
  }
  const t0 = norm([C[1][0] - C[0][0], C[1][1] - C[0][1]]), a0 = Math.atan2(t0[1], t0[0]);
  const cap = [];
  for (let i = 1; i < 14; i++) {
    const a = a0 - Math.PI / 2 - (i / 14) * Math.PI;
    cap.push([C[0][0] + Math.cos(a) * RP[0] * 1.03, C[0][1] + Math.sin(a) * RP[0]]);
  }
  return { A, C, RP, up, dn, cap, contour: [...up.slice(1).reverse(), up[0], ...cap, dn[0], ...dn.slice(1)] };
}
const dedans = (pt, poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
// Le bout effleure le cercle de laiton : on cherche, autour du cercle, le
// point de contact le plus proche pour lequel le doigt (bout et phalange)
// n'en cache qu'un huitième environ, à l'écran
const T_FIN = (() => {
  const [u, v] = ringPt(th(KB));
  const pts = [];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) {
    const x = -1 + (2 * i + 1) / 12, y = -1 + (2 * j + 1) / 12;
    if (x * x + y * y <= 1) pts.push(PP(u + x * RCI, v + y * RCI));
  }
  let best = null;
  for (let a = -40; a <= 110; a += 5) {
    for (let d = RCI - 0.5; d < RCI + 7; d += 0.1) {
      const t = T3(u + Math.cos(a * deg) * d, v - Math.sin(a * deg) * d);
      const sil = silhouette({ T: [t[0], t[1]], az: AZ_FIN, h: 0 }, S_SIL.slice(0, 18)).contour;
      const f = pts.filter((p) => dedans(p, sil)).length / pts.length;
      if (f <= 0.13) {
        const score = d + 0.004 * Math.abs(a - 40);
        if (!best || score < best.score) best = { score, T: [t[0], t[1]] };
        break;
      }
    }
  }
  return best.T;
})();
const POSE_REF = { T: T_FIN, az: AZ_FIN, h: 0 };

// Repère d'une section du doigt (tangente, dessus, côté) et point de surface
function repere(A, s) {
  const p = A(s), p2 = A(s + 0.5);
  const t = n3([p2[0] - p[0], p2[1] - p[1], p2[2] - p[2]]);
  const up = n3([-t[2] * t[0], -t[2] * t[1], 1 - t[2] * t[2]]);
  const side = [t[1] * up[2] - t[2] * up[1], t[2] * up[0] - t[0] * up[2], t[0] * up[1] - t[1] * up[0]];
  return { p, t, up, side };
}
const surface = (A, s, psi, k = 1) => {
  const { p, up, side } = repere(A, s);
  const N = [Math.cos(psi) * up[0] + Math.sin(psi) * side[0], Math.cos(psi) * up[1] + Math.sin(psi) * side[1], Math.cos(psi) * up[2] + Math.sin(psi) * side[2]];
  const rr = rayon(s) * k;
  return { W: [p[0] + rr * N[0], p[1] + rr * N[1], p[2] + rr * N[2]], N };
};

// Éclairage de la peau : ciel bleuté, soleil chaud, diffusion sous la peau près
// de la limite d'ombre, rebond chaud du papier sur les faces tournées vers le bas
const PEAU = [0.775, 0.58, 0.45];                        // #c9946f, un peu moins rouge
function lumiere(N, W, alb = PEAU, spec = 0) {
  const d = dot3(N, TO_SUN);
  const k = Math.max(0, d);
  const V = n3([CAM3[0] - W[0], CAM3[1] - W[1], CAM3[2] - W[2]]);
  const sss = Math.exp(-(((d - 0.05) / 0.16) ** 2));
  const down = Math.max(0, -N[2]);
  const fr = (1 - Math.max(0, dot3(N, V))) ** 3 * Math.max(0, d + 0.3);
  const c = [
    alb[0] * (0.56 + 0.6 * k + 0.22 * down) + 0.1 * sss + 0.26 * fr,
    alb[1] * (0.57 + 0.55 * k + 0.21 * down) + 0.03 * sss + 0.21 * fr,
    alb[2] * (0.64 + 0.45 * k + 0.19 * down) + 0.005 * sss + 0.15 * fr,
  ];
  if (spec) {
    const H = n3([TO_SUN[0] + V[0], TO_SUN[1] + V[1], TO_SUN[2] + V[2]]);
    const sp = spec * Math.max(0, dot3(N, H)) ** 48;
    c[0] += sp; c[1] += sp * 0.96; c[2] += sp * 0.9;
  }
  return c;
}

// Silhouette, repère local du calque (bout à l'origine, axe vers +x) et dessin
const DOIGT_GEO = (() => {
  const sil = silhouette(POSE_REF);
  const { A, C, RP } = sil;
  const S = S_SIL;
  const tip = C[0];
  const ang = Math.atan2(C[5][1] - tip[1], C[5][0] - tip[0]);
  const ca = Math.cos(-ang), sa = Math.sin(-ang);
  const loc = (p) => [(p[0] - tip[0]) * ca - (p[1] - tip[1]) * sa, (p[0] - tip[0]) * sa + (p[1] - tip[1]) * ca];
  const LC = C.map(loc);
  const up = sil.up.map(loc), dn = sil.dn.map(loc), cap = sil.cap.map(loc);
  const contour = sil.contour.map(loc);
  const at = (s, psi, k = 1) => { const { W, N } = surface(A, s, psi, k); return { P: loc(proj(...W)), W, N }; };
  return { A, tip, ang, loc, LC, RP, S, contour, up, dn, cap, at, len: LC[LC.length - 1][0] };
})();

// Profondeur de champ propre au doigt : la main est plus près de la caméra que le bout
const K_DOF = SLOPE / INV_DY;                            // flou (unités du décor) par unité de 1/profondeur
const sigDoigt = (s) => K_DOF * Math.abs(1 / proj(...DOIGT_GEO.A(s))[2] - 1 / proj(...DOIGT_GEO.A(0))[2]);
const xAtSig = (sig) => { for (let s = 0; s < 140; s += 0.5) if (Math.abs(sigDoigt(s)) >= sig) return DOIGT_GEO.loc(proj(...DOIGT_GEO.A(s)))[0]; return DOIGT_GEO.len; };

const DOIGT = (() => {
  const G = DOIGT_GEO;
  const w = G.RP[8];
  const d = lisse(G.contour);
  // dégradé en travers du doigt, calculé sur une section de la dernière phalange
  const sect = (s) => {
    const pts = [];
    for (let i = 0; i < 96; i++) {
      const psi = -Math.PI + (i / 96) * TAU;
      const o = G.at(s, psi);
      const V = n3([CAM3[0] - o.W[0], CAM3[1] - o.W[1], CAM3[2] - o.W[2]]);
      if (dot3(o.N, V) > 0.02) pts.push([o.P[1], lumiere(o.N, o.W)]);
    }
    pts.sort((a, b) => a[0] - b[0]);
    return pts;
  };
  const sec = sect(10);
  const y0 = sec[0][0], y1 = sec[sec.length - 1][0];
  const peauStops = sec.filter((_, i) => i % 3 === 0 || i === sec.length - 1).map(([y, c]) => [q((y - y0) / (y1 - y0) * 100) / 100, hex(c)]);
  const secM = sect(40);
  const m0 = secM[0][0], m1 = secM[secM.length - 1][0];
  const xM = G.loc(proj(...G.A(40)))[0];
  const peauStopsM = secM.filter((_, i) => i % 3 === 0 || i === secM.length - 1).map(([y, c]) => [q((y - m0) / (m1 - m0) * 100) / 100, hex(c)]);
  // couleur du bout (face au soleil) : la lumière le traverse
  const tipFace = (() => { const { p, t } = repere(G.A, 0); const W = [p[0] - t[0] * rayon(0), p[1] - t[1] * rayon(0), p[2] - t[2] * rayon(0)]; return lumiere(t.map((v) => -v), W); })();
  // ongle : contour sur le dessus, du bord libre à la cuticule
  // (bord libre arrondi comme le bout ; côtés qui se resserrent ; cuticule en arc)
  const NAIL = { s0: 0.7, s1: 11.2, psi: 0.84 };
  const larg = (k) => NAIL.psi * (1 - 0.3 * k * k);
  const ongle = [];
  for (let i = 0; i <= 12; i++) { const a = lerp(-1, 1, i / 12); ongle.push(G.at(NAIL.s0 + 1.6 * a * a, larg(0) * -a, 1.02).P); }
  for (let i = 1; i < 10; i++) { const k = i / 10; ongle.push(G.at(lerp(NAIL.s0 + 1.6, NAIL.s1 - 3.2, k), larg(k), 1.02).P); }
  for (let i = 0; i <= 14; i++) { const a = lerp(1, -1, i / 14); ongle.push(G.at(NAIL.s1 - 3.2 * a * a, larg(1) * Math.sin((a * Math.PI) / 2), 1.02).P); }
  for (let i = 1; i < 10; i++) { const k = 1 - i / 10; ongle.push(G.at(lerp(NAIL.s0 + 1.6, NAIL.s1 - 3.2, k), -larg(k), 1.02).P); }
  const onD = lisse(ongle);
  // couleur et reflet de l'ongle (vernis naturel : reflet du ciel et du soleil)
  const ONG = [0.85, 0.64, 0.55];
  const onC = (s, psi) => { const o = G.at(s, psi, 1.02); return lumiere(o.N, o.W, ONG, 0.9); };
  const onStops = [0, 0.25, 0.5, 0.75, 1].map((k) => [k, hex(onC(lerp(NAIL.s0 + 0.5, NAIL.s1, k), 0).map((v, j) => v * [1, 0.97, 0.97][j]))]);
  const nA = G.at(NAIL.s0, 0).P, nB = G.at(NAIL.s1, 0).P;
  // reflet : la rangée de l'ongle où la lumière se réfléchit vers la caméra
  let best = 0, bv = -1;
  for (let psi = -0.8; psi <= 0.8; psi += 0.05) { const c = onC(5, psi); const v = c[0] + c[1] + c[2]; if (v > bv) { bv = v; best = psi; } }
  const reflet = [2.2, 4, 6, 7.8].map((s) => G.at(s, best, 1.03).P);
  const libre = []; for (let i = 0; i <= 10; i++) { const a = lerp(-1, 1, i / 10); libre.push(G.at(NAIL.s0 + 1.1 + 1.5 * a * a, 0.78 * a, 1.02).P); }
  const lunule = []; for (let i = 0; i <= 10; i++) { const a = lerp(-1, 1, i / 10); lunule.push(G.at(NAIL.s1 - 1.4 - 1.6 * (1 - a * a), 0.5 * a, 1.02).P); }
  const repli = (sg) => { const p = []; for (let i = 0; i <= 8; i++) { const k = i / 8; p.push(G.at(lerp(NAIL.s0 + 2, NAIL.s1 - 0.8, k), sg * (larg(k) + 0.13), 1.0).P); } return lisse(p, false); };
  // plis de la dernière articulation et de l'articulation du milieu
  const pli = (s, a, b, j) => { const p = []; for (let i = 0; i <= 12; i++) p.push(G.at(s + 0.35 * Math.sin(i * 0.8 + j), lerp(a, b, i / 12)).P); return lisse(p, false); };
  const plis = [[21.6, -0.95, 0.85], [22.8, -1.1, 1.0], [24.0, -1.05, 1.05], [25.3, -0.9, 0.95], [26.4, -0.6, 0.55]].map(([s, a, b], j) => pli(s, a, b, j));
  const plisM = [[47.5, -1.1, 1.1], [49.5, -1.25, 1.2], [51.6, -1.1, 1.05], [53.6, -0.8, 0.8]].map(([s, a, b], j) => pli(s, a, b, j));
  // crête du doigt côté soleil (liseré) : la ligne de la surface la plus éclairée
  let bestPsi = 0, bl = -1;
  for (let psi = -Math.PI; psi < Math.PI; psi += 0.05) {
    const o = G.at(10, psi);
    const V = n3([CAM3[0] - o.W[0], CAM3[1] - o.W[1], CAM3[2] - o.W[2]]);
    if (dot3(o.N, V) < 0.05) continue;
    const l = dot3(o.N, TO_SUN) * (1 - dot3(o.N, V));
    if (l > bl) { bl = l; bestPsi = psi; }
  }
  const crete = []; for (let s = -0.5; s < 140; s += 3) crete.push(G.at(Math.max(0, s), bestPsi).P);
  // quel bord de la silhouette regarde le soleil ? on y pose un liseré chaud
  const bordClair = sec[0][1][0] + sec[0][1][1] > sec[sec.length - 1][1][0] + sec[sec.length - 1][1][1] ? G.up : G.dn;
  const lise = lisse(bordClair.slice(0, 19), false);
  // le pli de la dernière articulation et le bout, un peu plus roses
  const dip = G.at(24, 0).P, dipS = G.at(24, 0.6).P;
  const L = G.len;
  // masques de mise au point le long du doigt (net au bout, flou vers la main)
  const x1 = xAtSig(3.5), x2 = xAtSig(8), x3 = xAtSig(13), x4 = xAtSig(21);
  const box = `x="-400" y="-700" width="${q(L + 800)}" height="1400"`;
  const ramp = (id, st) => linU(id, st.map(([x, c]) => [q(clamp((x + 400) / (L + 800)) * 1000) / 1000, c]), -400, 0, L + 400, 0);
  return `<g transform="translate(${XY(G.tip)}) rotate(${q(G.ang / deg)})">
  <defs>
    <clipPath id="${ID}-c-doigt"><path d="${d}"/></clipPath>
    <clipPath id="${ID}-c-ongle"><path d="${onD}"/></clipPath>
    ${linU(`${ID}-peau`, peauStops, 0, y0, 0, y1)}
    ${linU(`${ID}-peau-m`, peauStopsM, 0, m0, 0, m1)}
    ${linU(`${ID}-raccord`, [[0, '#000'], [1, '#fff']], xM - 160, 0, xM + 40, 0)}
    <mask id="${ID}-k-m" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="url(#${ID}-raccord)"/></mask>
    ${radU(`${ID}-bout`, [[0, hex(tipFace), 0.95], [0.45, '#f0a07a', 0.45], [1, '#e8906a', 0]], -w * 0.2, 0, w * 1.15)}
    ${linU(`${ID}-ongle`, onStops, nA[0], nA[1], nB[0], nB[1])}
    ${ramp(`${ID}-mn`, [[x1, '#fff'], [x2, '#000']])}
    ${ramp(`${ID}-mm`, [[x1 - 80, '#000'], [x1, '#fff']])}
    ${ramp(`${ID}-mf`, [[x3, '#000'], [x4, '#fff']])}
    <mask id="${ID}-k-net" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="url(#${ID}-mn)"/></mask>
    <mask id="${ID}-k-mi" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="url(#${ID}-mm)"/></mask>
    <mask id="${ID}-k-loin" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="url(#${ID}-mf)"/></mask>
    ${blurF(`${ID}-d1`, 1)}${blurF(`${ID}-d2`, 2.2)}${blurF(`${ID}-d4`, 4)}${blurF(`${ID}-d8`, 8)}${blurF(`${ID}-d16`, 16)}
    ${brosse(`${ID}-br1`, 0.006, 0.03, 5)}${brosse(`${ID}-br2`, 0.009, 0.045, 17, 3, 1.4)}
  </defs>
  ${(() => {
    const peau = `
    <path d="${d}" fill="url(#${ID}-peau)"/>
    <g clip-path="url(#${ID}-c-doigt)">
      <g mask="url(#${ID}-k-m)"><rect ${box} fill="url(#${ID}-peau-m)"/></g>
      <rect x="-200" y="${q(-w * 1.3)}" width="${q(L + 400)}" height="${q(w * 2.6)}" fill="#a86e4e" opacity=".16" filter="url(#${ID}-br1)"/>
      <rect x="-200" y="${q(-w * 1.3)}" width="${q(L + 400)}" height="${q(w * 2.6)}" fill="#ecc095" opacity=".14" filter="url(#${ID}-br2)"/>
      <path d="${lisse(G.contour.filter((p) => p[0] < w * 0.15), false)}" fill="none" stroke="${hex(tipFace)}" stroke-width="${q(w * 0.22)}" opacity=".55" filter="url(#${ID}-d8)"/>
      <path d="${lisse(G.contour.filter((p) => p[0] < w * 0.1), false)}" fill="none" stroke="#e98a62" stroke-width="${q(w * 0.1)}" opacity=".22" filter="url(#${ID}-d4)"/>
      <ellipse cx="${q(dip[0])}" cy="${q(dip[1])}" rx="${q(w * 0.5)}" ry="${q(w * 0.8)}" fill="#b4664c" opacity=".18" filter="url(#${ID}-d8)"/>
      ${[[6, 0.5, '#d9a77a', 0.16], [16, -0.2, '#cfa074', 0.14], [34, 0.3, '#c99a70', 0.16], [44, -0.4, '#b86e55', 0.12], [3, -0.6, '#e09378', 0.16]].map(([ss, ps, col, op]) => { const pp = G.at(ss, ps).P; return `<ellipse cx="${q(pp[0])}" cy="${q(pp[1])}" rx="${q(w * 0.55)}" ry="${q(w * 0.4)}" fill="${col}" opacity="${op}" filter="url(#${ID}-d8)"/>`; }).join('')}
      <ellipse cx="${q((dip[0] + dipS[0]) / 2)}" cy="${q((dip[1] + dipS[1]) / 2)}" rx="${q(w * 0.9)}" ry="${q(w * 0.5)}" fill="#e6b88c" opacity=".12" filter="url(#${ID}-d8)"/>
      <path d="${lisse(crete, false)}" fill="none" stroke="#ffe2bf" stroke-width="${q(w * 0.14)}" opacity=".4" filter="url(#${ID}-d4)"/>
      <path d="${lise}" fill="none" stroke="#ffd9a6" stroke-width="${q(w * 0.26)}" opacity=".6" filter="url(#${ID}-d4)"/>
      <path d="${lise}" fill="none" stroke="#fff2dc" stroke-width="${q(w * 0.07)}" opacity=".85" filter="url(#${ID}-d1)"/>
      <path d="${d}" fill="none" stroke="#b9664a" stroke-width="${q(w * 0.14)}" opacity=".1" filter="url(#${ID}-d8)"/>
      ${plis.map((p, i) => `<path d="${p}" fill="none" stroke="#7a4b37" stroke-width="${q(w * 0.035)}" stroke-linecap="round" opacity="${q(0.3 - i * 0.03)}" filter="url(#${ID}-d2)"/>` +
        `<path d="${p}" fill="none" stroke="#f4cfac" stroke-width="${q(w * 0.022)}" stroke-linecap="round" opacity=".35" transform="translate(${q(-w * 0.035)} 0)" filter="url(#${ID}-d1)"/>`).join('')}
      ${plisM.map((p) => `<path d="${p}" fill="none" stroke="#7d4f3b" stroke-width="${q(w * 0.026)}" stroke-linecap="round" opacity=".32" filter="url(#${ID}-d2)"/>`).join('')}
      <path d="${repli(1)}" fill="none" stroke="#8a5641" stroke-width="${q(w * 0.03)}" opacity=".2" filter="url(#${ID}-d2)"/>
      <path d="${repli(-1)}" fill="none" stroke="#8a5641" stroke-width="${q(w * 0.03)}" opacity=".2" filter="url(#${ID}-d2)"/>
      <path d="${onD}" fill="#8f5a45" opacity=".28" filter="url(#${ID}-d2)" transform="translate(${q(w * 0.02)} ${q(w * 0.02)})"/>
      <path d="${onD}" fill="url(#${ID}-ongle)" filter="url(#${ID}-d1)"/>
      <g clip-path="url(#${ID}-c-ongle)">
        <path d="${lisse(lunule, false)}" fill="none" stroke="#f1dccf" stroke-width="${q(w * 0.08)}" opacity=".16" filter="url(#${ID}-d4)"/>
        <path d="${lisse(libre, false)}" fill="none" stroke="#f8ecdc" stroke-width="${q(w * 0.1)}" opacity=".75" filter="url(#${ID}-d2)"/>
        <path d="${lisse(reflet, false)}" fill="none" stroke="#fff6ea" stroke-width="${q(w * 0.07)}" stroke-linecap="round" opacity=".5" filter="url(#${ID}-d4)"/>
      </g>
      <path d="${onD}" fill="none" stroke="#93604c" stroke-width="${q(w * 0.01)}" opacity=".22" filter="url(#${ID}-d1)"/>
    </g>`;
    // le flou moyen, opaque sous chaque transition ; le très flou par-dessus vers la main ; le net au bout
    return `<g mask="url(#${ID}-k-mi)"><g filter="url(#${ID}-d8)">${peau}</g></g>
    <g mask="url(#${ID}-k-loin)"><g filter="url(#${ID}-d16)">${peau}</g></g>
    <g mask="url(#${ID}-k-net)">${peau}</g>`;
  })()}
</g>`;
})();
const DOIGT_BOX = [560, -200, 1880, 1700];

/* --------------------------------------------------------------------------
   Trajet du doigt : il longe le bord extérieur de l'anneau, du côté droit,
   en descendant depuis le côté lointain (le bout, levé, ne cache ainsi jamais
   le laiton), puis se pose contre le cercle
   -------------------------------------------------------------------------- */
const R_PATH = R + RCI + 1.8;
const CHEMIN = (() => {
  const P0 = ringPt(th(KB) + 4 * deg, R_PATH + 16);        // au-dessus de la colonne de texte
  const P1 = ringPt(th(KB) + 22 * deg, R_PATH + 2);        // il rejoint le bord de l'anneau
  const P2 = ringPt(th(KB) + 14 * deg, R_PATH);            // il le longe en descendant
  const f = [(T_FIN[0] - O[0]) * EU[0] + (T_FIN[1] - O[1]) * EU[1], (T_FIN[0] - O[0]) * EV[0] + (T_FIN[1] - O[1]) * EV[1]];
  return [P0, P1, P2, f];                                  // puis se pose contre le laiton
})();
function poseAt(k, touche) {
  // courbe de Bézier passant près des quatre points (repère de la feuille)
  const [P0, P1, P2, P3] = CHEMIN;
  const v = 1 - k;
  const u = v * v * v * P0[0] + 3 * v * v * k * P1[0] + 3 * v * k * k * P2[0] + k * k * k * P3[0];
  const w = v * v * v * P0[1] + 3 * v * v * k * P1[1] + 3 * v * k * k * P2[1] + k * k * k * P3[1];
  const p = T3(u, w);
  return { T: [p[0], p[1]], az: AZ_FIN - (1 - k) * 7 * deg, h: lerp(1.4, 0, touche) };
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

// Les plantes de l'appui de fenêtre : l'ombre de deux rameaux (une tige, des
// feuilles pointues alternées), étirée dans le sens de la lumière rasante.
// Elle bouge à peine : la fenêtre est entrouverte (repère de la table).
// (la tige est donnée par des points de l'écran, ramenés sur la table)
const RAMEAUX = [
  { ecran: [[-160, 210], [60, 250], [300, 310], [560, 400]], n: 7, L: 19, W: 8, seed: 3, k: 1 },
  { ecran: [[-140, 640], [90, 690], [330, 760]], n: 5, L: 16, W: 7, seed: 9, k: 0.8 },
].map((R0) => {
  const t = R0.ecran.map((p) => plan(...p));
  return { ...R0, base: t[0], tige: t.map((p) => [p[0] - t[0][0], p[1] - t[0][1]]) };
});
function rameau(c, R0, T) {
  const r = rng(R0.seed);
  const B = R0.base;
  const sw = 0.018 * Math.sin(T * 0.45 + R0.seed) + 0.008 * Math.sin(T * 1.1 + R0.seed * 2);
  const rot = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
  // étirement le long de la course du soleil
  const st = (p) => { const d = D_SUN, al = p[0] * d[0] + p[1] * d[1], pe = -p[0] * d[1] + p[1] * d[0]; const a2 = al * 1.35; return [a2 * d[0] - pe * d[1], a2 * d[1] + pe * d[0]]; };
  const W = (p) => { const q2 = st(rot(p, sw)); return proj(B[0] + q2[0], B[1] + q2[1]); };
  const tg = R0.tige;
  const at = (u) => { const f = u * (tg.length - 1), i = Math.min(tg.length - 2, Math.floor(f)), k = f - i; return [lerp(tg[i][0], tg[i + 1][0], k), lerp(tg[i][1], tg[i + 1][1], k)]; };
  const path = (k) => {
    // la tige
    const pts = [];
    for (let i = 0; i <= 20; i++) pts.push(at(i / 20));
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b2 = pts[i + 1], d = norm([b2[0] - a[0], b2[1] - a[1]]), w = 0.9 * (1 - i / 24);
      const q4 = [[a[0] - d[1] * w, a[1] + d[0] * w], [b2[0] - d[1] * w, b2[1] + d[0] * w], [b2[0] + d[1] * w, b2[1] - d[0] * w], [a[0] + d[1] * w, a[1] - d[0] * w]].map(W);
      k.moveTo(q4[0][0], q4[0][1]); q4.slice(1).forEach((p) => k.lineTo(p[0], p[1])); k.closePath();
    }
    // les feuilles, alternées, chacune tremble un peu
    for (let j = 0; j < R0.n; j++) {
      const u = 0.12 + (0.85 * j) / (R0.n - 1);
      const P0 = at(u), P1 = at(Math.min(1, u + 0.05));
      const t = norm([P1[0] - P0[0], P1[1] - P0[1]]);
      const side = j % 2 ? 1 : -1;
      const a = Math.atan2(t[1], t[0]) + side * (0.75 + 0.2 * r()) + 0.05 * Math.sin(T * 0.9 + j * 1.7);
      const L = R0.L * (0.7 + 0.35 * r()) * (j === R0.n - 1 ? 0.8 : 1), Wd = R0.W * (0.8 + 0.3 * r());
      const pts2 = [];
      for (let i = 0; i <= 16; i++) {
        const v = i / 16, wv = Wd * 0.5 * Math.sin(Math.PI * v) ** 0.8 * (1 - 0.25 * v);
        pts2.push([v * L, wv]);
      }
      for (let i = 16; i >= 0; i--) { const v = i / 16; pts2.push([v * L, -Wd * 0.5 * Math.sin(Math.PI * v) ** 0.8 * (1 - 0.25 * v)]); }
      const sp = pts2.map(([x, y]) => W([P0[0] + x * Math.cos(a) - y * Math.sin(a), P0[1] + x * Math.sin(a) + y * Math.cos(a)]));
      k.moveTo(sp[0][0], sp[0][1]); sp.slice(1).forEach((p) => k.lineTo(p[0], p[1])); k.closePath();
    }
  };
  flouee(c, 26, `rgba(104,120,170,${(0.12 * R0.k).toFixed(3)})`, path);
  flouee(c, 8, `rgba(96,112,166,${(0.16 * R0.k).toFixed(3)})`, path);
}
function ombresFeuilles(c, T) {
  for (const R0 of RAMEAUX) rameau(c, R0, T);
}

// Ombre du doigt : union des ombres de sphères le long de l'axe (ellipses
// allongées dans le sens de la lumière), un peu plus floue loin du bout
const SE = Math.abs(SUN[2]);
function ombreDoigt(c, pose, s0, s1, blur, alpha) {
  const A = axe(pose);
  const ang = Math.atan2(D_SUN[1], D_SUN[0]);
  flouee(c, blur, `rgba(52,60,98,${alpha})`, (k) => {
    for (let s = s0; s <= s1; s += 1.5) {
      const p = A(s), o = ombre3(p), rr = rayon(s);
      // ellipse de l'ombre sur la table, ramenée à l'écran par sa matrice locale
      const a = rr / SE, b = rr;
      const pc = proj(o[0], o[1]);
      const ax = proj(o[0] + Math.cos(ang) * a, o[1] + Math.sin(ang) * a), bx = proj(o[0] - Math.sin(ang) * b, o[1] + Math.cos(ang) * b);
      k.save();
      k.transform(ax[0] - pc[0], ax[1] - pc[1], bx[0] - pc[0], bx[1] - pc[1], pc[0], pc[1]);
      k.moveTo(1, 0);
      k.arc(0, 0, 1, 0, TAU);
      k.restore();
    }
  });
}

/* --------------------------------------------------------------------------
   Profondeur de champ : pyramide d'images (réductions successives par deux),
   puis recomposition du plus flou au plus net, chaque niveau dosé selon la
   rangée de l'écran (le plan de la table s'éloigne vers le haut).
   -------------------------------------------------------------------------- */
const SIG = [0, 0.96, 2.14, 4.4, 8.8, 17.7, 35.4, 70.8, 141];   // flou effectif de chaque niveau (px)
let PYR = null;
const toile = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
function pyramide(W, H, n) {
  if (PYR && PYR.W === W && PYR.H === H && PYR.n >= n) return PYR;
  const L = [], A = [], M = [];
  let w = W, h = H;
  for (let i = 0; i <= n; i++) {
    L.push(toile(w, h)); A.push(i ? toile(w, h) : null); M.push(toile(w, h));
    w = Math.max(1, Math.ceil(w / 2)); h = Math.max(1, Math.ceil(h / 2));
  }
  return (PYR = { W, H, n, L, A, M });
}
const niveau = (sp) => {
  if (sp <= 0) return 0;
  for (let k = 1; k < SIG.length; k++) if (sp <= SIG[k]) return k - 1 + (sp - SIG[k - 1]) / (SIG[k] - SIG[k - 1]);
  return SIG.length - 1;
};
// sigma(yEcran) → flou en pixels de l'écran
function profondeur(c, sigma) {
  const W = c.canvas.width, H = c.canvas.height;
  const N = 48;
  const lv = Array.from({ length: N + 1 }, (_, i) => niveau(sigma((i / N) * H)));
  const mx = Math.max(...lv);
  if (mx <= 0) return;
  const top = Math.min(SIG.length - 2, Math.ceil(mx));
  const Pm = pyramide(W, H, top);
  const L = Pm.L;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1;
  const g0 = L[0].getContext('2d');
  g0.globalCompositeOperation = 'copy';
  g0.drawImage(c.canvas, 0, 0);
  for (let i = 1; i <= top; i++) {
    const g = L[i].getContext('2d');
    g.globalCompositeOperation = 'copy';
    g.drawImage(L[i - 1], 0, 0, L[i].width, L[i].height);
  }
  let acc = L[top];
  for (let i = top - 1; i >= 0; i--) {
    const tw = L[i].width, thh = L[i].height;
    const tg = i === 0 ? c : Pm.A[i].getContext('2d');
    tg.globalCompositeOperation = 'copy';
    tg.drawImage(acc, 0, 0, tw, thh);
    // part du niveau i : 1 là où le flou voulu ne dépasse pas celui du niveau i
    const al = lv.map((l) => clamp(i + 1 - l));
    if (Math.max(...al) > 0.002) {
      const m = Pm.M[i].getContext('2d');
      m.globalCompositeOperation = 'copy';
      m.drawImage(L[i], 0, 0);
      m.globalCompositeOperation = 'destination-in';
      const gr = m.createLinearGradient(0, 0, 0, thh);
      al.forEach((a, j) => gr.addColorStop(j / N, `rgba(0,0,0,${a.toFixed(3)})`));
      m.fillStyle = gr;
      m.fillRect(0, 0, tw, thh);
      tg.globalCompositeOperation = 'source-over';
      tg.drawImage(Pm.M[i], 0, 0);
    }
    acc = i === 0 ? null : Pm.A[i];
  }
  c.restore();
}
// Tampons d'écran (fond mis de côté, doigt isolé)
const TAMPONS = {};
function tampon(name, W, H) {
  const t = TAMPONS[name];
  if (t && t.width === W && t.height === H) return t;
  return (TAMPONS[name] = toile(W, H));
}

/* --------------------------------------------------------------------------
   Bokeh et poussière (après la profondeur de champ)
   -------------------------------------------------------------------------- */
let SPR = null;
function sprites() {
  if (SPR) return SPR;
  const disc = toile(128, 128);
  const e = disc.getContext('2d');
  const ge = e.createRadialGradient(64, 64, 0, 64, 64, 63);
  ge.addColorStop(0, 'rgba(255,250,238,0.5)');
  ge.addColorStop(0.75, 'rgba(255,247,230,0.58)');
  ge.addColorStop(0.92, 'rgba(255,245,226,0.78)');
  ge.addColorStop(0.97, 'rgba(255,245,226,0.3)');
  ge.addColorStop(1, 'rgba(255,245,226,0)');
  e.fillStyle = ge;
  e.fillRect(0, 0, 128, 128);
  const dot = toile(64, 64);
  const d = dot.getContext('2d');
  const gd = d.createRadialGradient(32, 32, 0, 32, 32, 32);
  gd.addColorStop(0, 'rgba(255,248,232,1)');
  gd.addColorStop(0.35, 'rgba(255,240,214,0.5)');
  gd.addColorStop(1, 'rgba(255,236,206,0)');
  d.fillStyle = gd;
  d.fillRect(0, 0, 64, 64);
  return (SPR = { disc, dot });
}
// reflets du soleil sur le vernis de la table, au loin
const BOKEH = (() => {
  const r = rng(63);
  return Array.from({ length: 20 }, () => ({ x: -60 + r() * 2040, y: -60 + r() * 230, k: 0.55 + r() * 0.9, a: 0.3 + r() * 0.55, ph: r() * TAU }));
})();
const DUST = (() => {
  const r = rng(77);
  return Array.from({ length: 22 }, () => ({ x: r() * 2200 - 140, y: r() * 1200 - 60, s: 6 + r() * r() * 24, ph: r() * TAU, sp: 0.4 + r(), vx: 3 + r() * 6, vy: -2 - r() * 5 }));
})();
// Distance (à l'écran) d'un point au-dessus du bord de la feuille
const EDGE_A = PP(-90, 0), EDGE_B = PP(330, 0);
const aboveEdge = (x, y) => lerp(EDGE_A[1], EDGE_B[1], (x - EDGE_A[0]) / (EDGE_B[0] - EDGE_A[0])) - y;

/* --------------------------------------------------------------------------
   Le décor
   -------------------------------------------------------------------------- */
const DEF = { focus: 1, trace: 1, touche: 1 };

export default {
  id: ID,
  bg: '#d2b48d',
  home: { x: 960, y: 540, z: 1 },
  layers: {
    fond: { box: [-240, -140, 2400, 700], svg: FOND, filters: ['paint', 'b10'] },
    feuille: { box: [-240, Math.floor(Y_EDGE - 40), 2400, 1260 - Math.floor(Y_EDGE - 40)], svg: FEUILLE, filters: ['paint'] },
    doigt: { box: DOIGT_BOX, svg: DOIGT, filters: ['paint'] },
    doigt6: { box: DOIGT_BOX, svg: DOIGT, filters: ['paint', 'b6'], res: 0.6 },
    doigt16: { box: DOIGT_BOX, svg: DOIGT, filters: ['paint', 'b16'], res: 0.4 },
  },

  render(g, p, T) {
    const qv = { ...DEF, ...p };
    const pose = poseAt(qv.trace, qv.touche);
    // le doigt n'est jamais tout à fait immobile (le pouls, la main qui tient la pose)
    const vib = 0.12 * Math.sin(T * 1.9) + 0.08 * Math.sin(T * 3.1 + 1);
    pose.T = [pose.T[0] + vib * 0.3, pose.T[1] + vib * 0.2];
    pose.h += 0.3 * (1 - qv.touche) * (0.5 + 0.5 * Math.sin(T * 1.3));
    const yf = lerp(Y_EDGE + 4, Y_BRASS, qv.focus);

    g.img('fond');
    g.img('feuille');

    // Lumière et ombres posées sur la table et la feuille
    let M = null;
    g.fx(1, (c) => {
      M = c.getTransform();
      c.globalCompositeOperation = 'multiply';
      // la tache de soleil de la fenêtre : le laiton et le bout du doigt sont
      // dans la lumière ; autour, la feuille passe dans une pénombre fraîche
      const bc = proj(...T3(...ringPt(th(KB))));
      let gl = c.createRadialGradient(bc[0] - 120, bc[1] - 70, 60, bc[0] - 40, bc[1] + 10, 1150);
      gl.addColorStop(0, 'rgb(255,252,246)');
      gl.addColorStop(0.3, 'rgb(246,240,232)');
      gl.addColorStop(0.62, 'rgb(222,218,220)');
      gl.addColorStop(1, 'rgb(188,190,210)');
      c.fillStyle = gl;
      c.fillRect(-300, -200, 2600, 1500);
      // l'ombre de A elle-même, assise de ce côté de la table : le bas de la
      // feuille, tout près de nous, est dans une pénombre fraîche
      const corps = [[-140, -34], [60, -22], [240, -6], [240, -260], [-140, -260]].map(([X, Y]) => proj(B_T[0] + X, B_T[1] + Y));
      flouee(c, 170, 'rgba(62,74,124,0.5)', (k) => { corps.forEach((p2, i) => (i ? k.lineTo(p2[0], p2[1]) : k.moveTo(p2[0], p2[1]))); k.closePath(); });
      ombresFeuilles(c, T);
      ombreDoigt(c, pose, 0, 130, 18, 0.4);
      ombreDoigt(c, pose, 0, 10, 4, 0.35 * (0.4 + 0.6 * qv.touche));
      {
        const A0 = axe(pose), p0 = A0(0), r0 = rayon(0);
        const cp = proj(pose.T[0], pose.T[1]), cq = proj(p0[0] + 0.3 * r0, p0[1] - 0.6 * r0, 0);
        const al = 0.42 * qv.touche + 0.12;
        flouee(c, 9, `rgba(74,58,62,${al.toFixed(3)})`, (k) => k.ellipse((cp[0] + cq[0]) / 2, (cp[1] + cq[1]) / 2 + 6, 70, 20, -0.25, 0, TAU));
      }
      // la chaleur du soleil sur le papier, plus forte du côté de la fenêtre
      c.globalCompositeOperation = 'soft-light';
      let gr = c.createRadialGradient(-200, 200, 100, -200, 200, 1800);
      gr.addColorStop(0, 'rgba(255,200,140,0.85)');
      gr.addColorStop(1, 'rgba(255,206,150,0)');
      c.fillStyle = gr;
      c.fillRect(-300, -200, 2600, 1500);
      // le laiton au soleil : un peu d'or qui rayonne sur le papier
      c.globalCompositeOperation = 'screen';
      const b = proj(...T3(...ringPt(th(KB))));
      gr = c.createRadialGradient(b[0], b[1], 8, b[0], b[1], 110);
      gr.addColorStop(0, 'rgba(255,190,80,0.18)');
      gr.addColorStop(1, 'rgba(255,190,80,0)');
      c.fillStyle = gr;
      c.fillRect(b[0] - 120, b[1] - 120, 240, 240);
    });

    // Profondeur de champ du plan de la table
    g.screen((c) => {
      const kz = M.d, fy = M.f;
      profondeur(c, (ys) => Math.min(SIG_MAX, SLOPE * Math.abs((ys - fy) / kz - yf)) * kz);
    });

    // Le laiton garde son or même hors de la netteté : une lueur chaude,
    // d'autant plus large que le cercle est flou
    g.fx(1, (c) => {
      const b = proj(...T3(...ringPt(th(KB))));
      const sb = Math.min(SIG_MAX, SLOPE * Math.abs(b[1] - yf));
      const rr = 34 + 2.2 * sb;
      c.globalCompositeOperation = 'soft-light';
      let gr = c.createRadialGradient(b[0], b[1], 0, b[0], b[1], rr);
      gr.addColorStop(0, `rgba(200,120,36,${(0.4 * sm(0, 6, sb) + 0.18).toFixed(3)})`);
      gr.addColorStop(1, 'rgba(214,138,30,0)');
      c.fillStyle = gr;
      c.fillRect(b[0] - rr, b[1] - rr, 2 * rr, 2 * rr);
      c.globalCompositeOperation = 'screen';
      gr = c.createRadialGradient(b[0], b[1], 0, b[0], b[1], rr * 1.8);
      gr.addColorStop(0, 'rgba(255,190,90,0.12)');
      gr.addColorStop(1, 'rgba(255,190,90,0)');
      c.fillStyle = gr;
      c.fillRect(b[0] - rr * 2, b[1] - rr * 2, 4 * rr, 4 * rr);
    });

    // Le doigt, isolé sur un fond transparent : ses trois états de netteté
    // sont mélangés (en addition), puis il est éclairé et reposé sur l'image
    const G = DOIGT_GEO;
    const A = axe(pose);
    const tp = proj(...A(0)), t5 = proj(...A(4.5));
    const ang = Math.atan2(t5[1] - tp[1], t5[0] - tp[0]);
    const kk = proj(...G.A(0))[2] / tp[2];
    const tf = { ox: G.tip[0], oy: G.tip[1], x: tp[0] - G.tip[0], y: tp[1] - G.tip[1], rot: ang - G.ang, sx: kk, sy: kk };
    const yc = proj(pose.T[0], pose.T[1])[1];
    const sd = Math.min(SIG_MAX, SLOPE * Math.abs(yc - yf));
    const wN = clamp(1 - sd / 6), wF = clamp((sd - 6) / 10), wM = 1 - wN - wF;
    let BG = null;
    g.screen((c, W, H) => {
      BG = tampon('fond', W, H);
      const b = BG.getContext('2d');
      b.globalCompositeOperation = 'copy';
      b.drawImage(c.canvas, 0, 0);
      c.clearRect(0, 0, W, H);
    });
    if (wN > 0.002) g.img('doigt', { tf, alpha: wN, blend: 'lighter' });
    if (wM > 0.002) g.img('doigt6', { tf, alpha: wM, blend: 'lighter' });
    if (wF > 0.002) g.img('doigt16', { tf, alpha: wF, blend: 'lighter' });
    g.fx(1, (c) => {
      c.globalCompositeOperation = 'source-atop';
      // la main, plus loin de la fenêtre et plus près de nous, un peu moins éclairée
      const a = proj(...A(14)), b = proj(...A(70));
      let gr = c.createLinearGradient(a[0], a[1], b[0], b[1]);
      gr.addColorStop(0, 'rgba(92,62,52,0)');
      gr.addColorStop(1, 'rgba(92,62,52,0.28)');
      c.fillStyle = gr;
      c.fillRect(-300, -200, 2600, 1500);
      // un peu de lumière chaude renvoyée par la feuille sur le dessous du doigt
      gr = c.createRadialGradient(tp[0], tp[1] + 60, 0, tp[0], tp[1] + 60, 260);
      gr.addColorStop(0, 'rgba(255,226,190,0.16)');
      gr.addColorStop(1, 'rgba(255,226,190,0)');
      c.fillStyle = gr;
      c.fillRect(tp[0] - 300, tp[1] - 300, 600, 700);
    });
    g.screen((c, W, H) => {
      const F = tampon('doigt', W, H);
      const f = F.getContext('2d');
      f.globalCompositeOperation = 'copy';
      f.drawImage(c.canvas, 0, 0);
      c.globalCompositeOperation = 'copy';
      c.drawImage(BG, 0, 0);
      c.globalCompositeOperation = 'source-over';
      c.drawImage(F, 0, 0);
    });

    // Bokeh : reflets du matin sur le vernis de la table, au loin ; ils
    // grossissent quand la mise au point vient vers nous
    const sBg = Math.min(SIG_MAX, SLOPE * Math.max(0, yf - 110));
    g.fx(1, (c) => {
      const { disc } = sprites();
      c.globalCompositeOperation = 'screen';
      const r0 = 15 + 1.8 * sBg;
      for (const b of BOKEH) {
        const rr = r0 * b.k;
        const fade = sm(rr * 0.3, rr * 1.3, aboveEdge(b.x, b.y));
        if (fade <= 0.01) continue;
        c.globalAlpha = b.a * fade * sm(12, 34, rr) * Math.pow(22 / r0, 0.5) * (0.85 + 0.15 * Math.sin(T * 0.6 + b.ph));
        c.drawImage(disc, b.x - rr, b.y - rr, rr * 2, rr * 2);
      }
    });
    // Poussière dans le soleil, tout près de l'objectif
    g.fx(1.25, (c) => {
      const { dot } = sprites();
      c.globalCompositeOperation = 'screen';
      for (const m of DUST) {
        const x = ((m.x + m.vx * T + 12 * Math.sin(T * 0.4 * m.sp + m.ph) + 140) % 2200 + 2200) % 2200 - 140;
        const y = ((m.y + m.vy * T + 8 * Math.sin(T * 0.33 * m.sp + m.ph * 1.7) + 60) % 1200 + 1200) % 1200 - 60;
        c.globalAlpha = 0.1 * sm(1300, 300, x) * (0.6 + 0.4 * Math.sin(T * 1.1 * m.sp + m.ph * 3));
        c.drawImage(dot, x - m.s, y - m.s, m.s * 2, m.s * 2);
      }
    });

    // Étalonnage : voile chaud de la fenêtre à gauche, ombres bleutées
    g.screen((c, W, H) => {
      c.globalCompositeOperation = 'screen';
      let gr = c.createRadialGradient(-W * 0.05, H * 0.15, 0, -W * 0.05, H * 0.15, W * 0.7);
      gr.addColorStop(0, 'rgba(255,232,196,0.3)');
      gr.addColorStop(1, 'rgba(255,232,196,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      // le fond de la pièce baigne dans la lumière du matin
      gr = c.createLinearGradient(0, 0, 0, H * 0.35);
      gr.addColorStop(0, 'rgba(255,226,180,0.2)');
      gr.addColorStop(1, 'rgba(255,226,180,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'multiply';
      gr = c.createLinearGradient(0, 0, W, H);
      gr.addColorStop(0, 'rgb(255,253,248)');
      gr.addColorStop(1, 'rgb(234,236,246)');
      c.fillStyle = gr;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'soft-light';
      c.globalAlpha = 0.3;
      c.drawImage(c.canvas, 0, 0);
    });
  },

  shots: {
    // Mise au point du bord de la feuille vers le schéma ; le doigt longe
    // l'anneau, effleure le cercle de laiton et s'arrête
    lettre: {
      dur: 7.5,
      cam: (t, portrait) => {
        const k = seg(t, 0, 7.5, ease.inOut);
        return portrait
          ? { x: lerp(1030, 1000, k), y: lerp(462, 476, k), z: lerp(1.1, 1.15, k) }
          : { x: lerp(1030, 1012, k), y: lerp(424, 436, k), z: lerp(1.26, 1.32, k) };
      },
      p: (t) => ({
        focus: seg(t, 0.5, 3.0, ease.inOut),
        trace: seg(t, 1.4, 6.2, ease.inOut),
        touche: seg(t, 6.0, 6.8, ease.inOut),
      }),
    },
  },
};
