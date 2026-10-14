/* ==========================================================================
   Décor « porte » — Acte 1.
   Caméra basse, près du berceau, face à la porte de la chambre. La porte
   s'ouvre vers la pièce ; la lumière chaude du couloir entre et dessine une
   bande sur le plancher ; la personne paraît dans l'embrasure, en
   contre-jour, et son ombre douce s'allonge vers nous.
   La géométrie est décrite en mètres puis projetée (caméra horizontale) :
   battant, bande de lumière, silhouette et ombre portée restent cohérents.

   Paramètres p :
     door    0 fermée → 1 ouverte (78°)
     figure  position de la personne sur son trajet (0 → 1) ; absente si
             non définie ou négative
     sens    1 : elle entre (de face) ; −1 : elle repart (de dos)
     pas     amplitude de la marche (0 immobile → 1)
     main    main sur la poignée (0 → 1), quand elle referme derrière elle
   ========================================================================== */
import { lin, rad, rng, pts } from '../kit.js';
import { TAU, clamp, lerp, seg, ease } from '../../film/engine.js';

/* ---------- Projection : caméra à 0,62 m du sol, axe horizontal ---------- */
const F = 1100, CX = 960, HZ = 545, CH = 0.62;
const pr = (x, y, z) => [CX + (F * x) / z, HZ - (F * (y - CH)) / z];
const q3 = (a) => pts(a.map((v) => pr(...v)));

// Mur de la porte, embrasure, battant (gonds à droite, il s'ouvre vers nous)
const ZW = 3.9, XL = -0.57, XR = 0.26, HD = 2.04, EP = 0.14;
const ZL = 3.92, DW = XR - XL, OPEN = (78 * Math.PI) / 180;
const ZC = 5.2; // mur d'en face, dans le couloir
// Lumière du couloir : plafonnier en haut à gauche, derrière la porte
const LS = { x: -0.8, y: 3.0, z: 6.0 };

// Embrasure à l'écran (bord du mur)
const [OX0, OY0] = pr(XL, HD, ZW);
const [OX1, OY1] = pr(XR, 0, ZW);
// Tache de soleil de la fenêtre (derrière nous, à droite) sur le mur
const SUN = [[1300, 168], [1700, 128], [1790, 560], [1360, 610]];

/* ---------- Fond : mur, chambranle, plinthe, couloir, plancher ---------- */
function fond() {
  const R = rng(11);
  const cx0 = pr(XL - 0.075, 0, ZW)[0], cx1 = pr(XR + 0.075, 0, ZW)[0];
  const yb = pr(0, 0.1, ZW)[1]; // haut de plinthe
  const yc = pr(0, 2.62, ZW)[1]; // plafond
  let s = `<defs>
    ${lin('porte-mur', [[0, '#5d686e'], [0.4, '#6f7b82'], [0.75, '#7d898c'], [1, '#86918f']], 0, 0, 1, 0)}
    ${lin('porte-murv', [[0, '#252b3a', 0.5], [0.3, '#252b3a', 0.12], [0.62, '#000', 0], [0.86, '#6d5640', 0.1], [1, '#7a5e44', 0.26]])}
    ${lin('porte-chb', [[0, '#a7a49b'], [0.5, '#b4b0a5'], [1, '#c2bdb1']], 0, 0, 1, 0)}
    ${lin('porte-plinthe', [[0, '#b3afa3'], [0.15, '#9e9b90'], [1, '#8a877d']])}
    ${rad('porte-cfond', [[0, '#fff6e2'], [0.28, '#ffe8c0'], [0.6, '#f6cf98'], [1, '#d8a066']], 0.22, 0.1, 0.95)}
    ${lin('porte-csol', [[0, '#7c5536'], [1, '#6a4529']])}
    ${lin('porte-cdroite', [[0, '#8a4e20', 0], [0.55, '#8a4e20', 0.1], [1, '#6e3c18', 0.38]], 0, 0, 1, 0)}
    ${lin('porte-solv', [[0, '#8d9aa8', 0.16], [0.12, '#8d9aa8', 0.04], [0.4, '#000', 0], [1, '#120a06', 0.5]])}
    ${lin('porte-solh', [[0, '#1a1410', 0.3], [0.5, '#000', 0], [1, '#3a2a1a', 0.05]], 0, 0, 1, 0)}
    ${lin('porte-gflou', [[0, '#fff', 0], [0.2, '#fff', 0], [0.55, '#fff', 1], [1, '#fff', 1]])}
    ${lin('porte-reflet', [[0, '#cfc6b4', 0.2], [1, '#cfc6b4', 0]])}
    <mask id="porte-mflou" maskUnits="userSpaceOnUse" x="-240" y="700" width="2400" height="560">
      <rect x="-240" y="700" width="2400" height="560" fill="url(#porte-gflou)"/>
    </mask>
    <clipPath id="porte-ouv"><rect x="${OX0}" y="${OY0}" width="${OX1 - OX0}" height="${OY1 - OY0}"/></clipPath>
  </defs>`;

  // Mur bleu-gris à l'ombre, plus clair vers la fenêtre ; plafond au-dessus
  s += `<rect x="-240" y="-140" width="2400" height="${OY1 + 140}" fill="url(#porte-mur)"/>`;
  // Coups de brosse : le mur n'est jamais uni
  for (let i = 0; i < 70; i++) {
    const x = -240 + R() * 2400, y = -100 + R() * 800, L = 120 + R() * 420, dy = (R() - 0.5) * 60;
    const col = R() < 0.5 ? '#8e9a9c' : '#56616a';
    s += `<path d="M${x.toFixed(0)},${y.toFixed(0)} q${(L / 2).toFixed(0)},${(dy - 14).toFixed(0)} ${L.toFixed(0)},${dy.toFixed(0)}" stroke="${col}" stroke-width="${(18 + R() * 50).toFixed(0)}" stroke-linecap="round" fill="none" opacity="${(0.05 + R() * 0.08).toFixed(2)}"/>`;
  }
  s += `<rect x="-240" y="-140" width="2400" height="${OY1 + 140}" fill="url(#porte-murv)"/>`;
  s += `<rect x="-240" y="-140" width="2400" height="${yc + 140}" fill="#77756e"/>`;
  s += `<rect x="-240" y="${yc - 4}" width="2400" height="10" fill="#3c4250" opacity="0.35" filter="url(#b3)"/>`;

  // Soleil de la fenêtre : tache douce, traverse de la croisée, voile du lin
  s += `<ellipse cx="1560" cy="400" rx="620" ry="420" fill="#c8b48e" opacity="0.13" filter="url(#b28)"/>`;
  s += `<rect x="-240" y="-140" width="900" height="${OY1 + 140}" fill="#1f2531" opacity="0.16" filter="url(#b28)"/>`;
  s += `<g filter="url(#b28)" opacity="0.46"><polygon points="${pts(SUN)}" fill="#e4c48f"/></g>`;
  s += `<g filter="url(#b28)" opacity="0.2"><polygon points="1420,220 1660,190 1720,500 1470,540" fill="#ffe2ae"/></g>`;
  s += `<g filter="url(#b16)" opacity="0.32"><polygon points="1516,146 1538,144 1594,586 1572,590" fill="#7a8486"/></g>`;

  // Plinthe crème
  for (const [a, b] of [[-240, cx0 - 2], [cx1 + 2, 2160]]) {
    s += `<rect x="${a}" y="${yb}" width="${b - a}" height="${OY1 - yb}" fill="url(#porte-plinthe)"/>`;
    s += `<rect x="${a}" y="${yb}" width="${b - a}" height="2" fill="#cbc6b9" opacity="0.8"/>`;
  }

  // Le couloir, vu par l'embrasure : mur chaud, plinthe, plancher
  const yCb = pr(0, 0, ZC)[1], yCp = pr(0, 0.08, ZC)[1];
  s += `<g clip-path="url(#porte-ouv)">
    <rect x="${OX0 - 4}" y="${OY0 - 4}" width="${OX1 - OX0 + 8}" height="${yCb - OY0 + 4}" fill="url(#porte-cfond)"/>
    <ellipse cx="${OX0 + 30}" cy="${OY0 + 60}" rx="110" ry="230" fill="#fff8ea" opacity="0.55" filter="url(#b16)"/>
    <rect x="${OX0 - 4}" y="${yCp}" width="${OX1 - OX0 + 8}" height="${yCb - yCp}" fill="#f2d3a2"/>
    <rect x="${OX0 - 4}" y="${yCb - 2}" width="${OX1 - OX0 + 8}" height="3" fill="#b07a48" opacity="0.8"/>
    <rect x="${OX0 - 4}" y="${yCb}" width="${OX1 - OX0 + 8}" height="${OY1 - yCb + 4}" fill="url(#porte-csol)"/>`;
  for (let z = 4.0; z < ZC; z += 0.13) {
    const y = pr(0, 0, z)[1];
    s += `<rect x="${OX0 - 4}" y="${y.toFixed(1)}" width="${OX1 - OX0 + 8}" height="0.9" fill="#4a2f1c" opacity="0.6"/>`;
  }
  s += `<rect x="${OX0 - 4}" y="${OY0 - 4}" width="${OX1 - OX0 + 8}" height="${OY1 - OY0 + 8}" fill="url(#porte-cdroite)"/></g>`;
  // Épaisseur du mur : tableau gauche (à contre-jour), droit (éclairé), linteau, seuil
  s += `<polygon points="${q3([[XL, 0, ZW], [XL, HD, ZW], [XL, HD, ZW + EP], [XL, 0, ZW + EP]])}" fill="#a88a68"/>`;
  s += `<polygon points="${q3([[XR, 0, ZW], [XR, HD, ZW], [XR, HD, ZW + EP], [XR, 0, ZW + EP]])}" fill="#f4d5a4"/>`;
  s += `<polygon points="${q3([[XL, HD, ZW], [XR, HD, ZW], [XR, HD, ZW + EP], [XL, HD, ZW + EP]])}" fill="#b8946c"/>`;
  s += `<polygon points="${q3([[XL, 0, ZW], [XR, 0, ZW], [XR, 0, ZW + EP], [XL, 0, ZW + EP]])}" fill="#77502f"/>`;

  // Plancher en lames miel, à l'ombre, qui fuient vers la porte
  let sol = '';
  const zN = 0.9;
  for (let i = 0, x = -4.32; x < 4.3; i++, x += 0.135) {
    const x1 = x + 0.135, k = R();
    const col = k < 0.33 ? '#654530' : k < 0.66 ? '#6f4d34' : '#5c3e2a';
    sol += `<polygon points="${q3([[x, 0, ZW], [x1, 0, ZW], [x1, 0, zN], [x, 0, zN]])}" fill="${col}"/>`;
    // veinage
    for (let j = 0; j < 2; j++) {
      const xv = x + 0.02 + R() * 0.095, w = 0.002 + R() * 0.003;
      sol += `<polygon points="${q3([[xv, 0, ZW], [xv + w, 0, ZW], [xv + w, 0, zN], [xv, 0, zN]])}" fill="${R() < 0.5 ? '#8a6244' : '#46301f'}" opacity="0.22"/>`;
    }
    // joints de bout
    for (let j = 0; j < 2; j++) {
      const z = 1.1 + R() * 2.7;
      sol += `<polygon points="${q3([[x, 0, z], [x1, 0, z], [x1, 0, z - 0.006], [x, 0, z - 0.006]])}" fill="#2c1d13" opacity="0.75"/>`;
    }
    // rainure entre les lames
    sol += `<polygon points="${q3([[x - 0.0025, 0, ZW], [x + 0.0025, 0, ZW], [x + 0.0025, 0, zN], [x - 0.0025, 0, zN]])}" fill="#2a1b11" opacity="0.85"/>`;
  }
  s += `<g id="porte-plancher">${sol}</g>`;
  // flou de profondeur de champ : le plancher proche se brouille
  s += `<use href="#porte-plancher" filter="url(#b6)" mask="url(#porte-mflou)"/>`;
  s += `<rect x="-240" y="${OY1}" width="2400" height="${1220 - OY1}" fill="url(#porte-solv)"/>`;
  s += `<rect x="-240" y="${OY1}" width="2400" height="${1220 - OY1}" fill="url(#porte-solh)"/>`;
  // reflet mat du battant clair dans le vernis
  s += `<rect x="${OX0 + 6}" y="${OY1}" width="${OX1 - OX0 - 12}" height="150" fill="url(#porte-reflet)" filter="url(#b10)"/>`;
  // ombre de contact au pied du mur
  s += `<rect x="-240" y="${OY1 - 3}" width="2400" height="8" fill="#1d1612" opacity="0.5" filter="url(#b3)"/>`;
  return s;
}

/* ---------- Chambranle : calque à part, touche plus retenue (lignes droites) ---------- */
const PEINT = `<filter id="porte-peint" x="-3%" y="-3%" width="106%" height="106%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="warp"/>
  <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="shape"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="3" seed="13" result="tex"/>
  <feColorMatrix in="tex" type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1" result="gray"/>
  <feComposite in="shape" in2="gray" operator="arithmetic" k1="0.24" k2="0.88" k3="0" k4="0" result="mod"/>
  <feComposite in="mod" in2="shape" operator="in"/>
</filter>`;
const CW = 0.075;
const [CX0, CY0] = pr(XL - CW, HD + CW, ZW), [CX1] = pr(XR + CW, 0, ZW);
function chambranle() {
  const cw = CW, cx0 = CX0, cy0 = CY0, cx1 = CX1;
  let s = `<defs>${PEINT}
    ${lin('porte-chb', [[0, '#a19f98'], [0.5, '#adaaa2'], [1, '#bbb7ad']], 0, 0, 1, 0)}
  </defs><g filter="url(#porte-peint)">`;
  // Chambranle (moulure), avec son ombre douce sur le mur côté gauche
  s += `<path d="M${cx0 - 3},${cy0 - 2} L${cx0 - 3},${OY1} M${cx0 - 3},${cy0 - 2} L${cx1},${cy0 - 2}" stroke="#2d3340" stroke-width="9" opacity="0.4" filter="url(#b6)" fill="none"/>`;
  s += `<path fill-rule="evenodd" fill="url(#porte-chb)" d="M${cx0},${cy0} H${cx1} V${OY1} H${OX1} V${OY0} H${OX0} V${OY1} H${cx0} Z"/>`;
  const bead = (k, col, w, op) => {
    const [a, b] = pr(XL - cw * k, HD + cw * k, ZW), [c] = pr(XR + cw * k, 0, ZW);
    return `<path d="M${a.toFixed(1)},${OY1} V${b.toFixed(1)} H${c.toFixed(1)} V${OY1}" stroke="${col}" stroke-width="${w}" fill="none" opacity="${op}"/>`;
  };
  s += bead(0.55, '#8f8c84', 2.2, 0.7) + bead(0.42, '#d4cfc3', 1.6, 0.6) + bead(0.12, '#77746d', 1.4, 0.6);
  s += `<path d="M${cx1 - 1.5},${cy0} V${OY1}" stroke="#d6d1c5" stroke-width="2" opacity="0.7"/>`;
  // Socles du chambranle
  const yS = pr(0, 0.14, ZW)[1];
  s += `<rect x="${cx0 - 2}" y="${yS}" width="${OX0 - cx0 + 2}" height="${OY1 - yS}" fill="#a29e94"/>`;
  s += `<rect x="${OX1}" y="${yS}" width="${cx1 - OX1 + 2}" height="${OY1 - yS}" fill="#b2ada2"/>`;

  return s + '</g>';
}

/* ---------- Le battant (peint fermé ; on le déforme en perspective) ---------- */
// Point du battant fermé : abscisse monde x, hauteur h
const lp = (x, h) => [CX + (F * x) / ZL, HZ - (F * (h - CH)) / ZL];
const [BX0, BY0] = lp(XL, 2.032), [BX1, BY1] = lp(XR, 0.012);
const BOX_BAT = [BX0 - 8, BY0 - 8, BX1 - BX0 + 16, BY1 - BY0 + 16];

function battant() {
  const R = rng(23);
  const rect = (x0, h0, x1, h1) => {
    const [a, b] = lp(x0, h1), [c, d] = lp(x1, h0);
    return { x: a, y: b, w: c - a, h: d - b };
  };
  const quad = (a) => pts(a.map(([x, h]) => lp(x, h)));
  let s = `<defs>${PEINT}
    ${lin('porte-bat', [[0, '#9b9c9b'], [0.55, '#a7a7a3'], [1, '#b1afa8']], 0, 0, 1, 0)}
    ${lin('porte-batv', [[0, '#3e4656', 0.22], [0.25, '#3e4656', 0.06], [0.8, '#000', 0], [1, '#2a2622', 0.18]])}
    ${rad('porte-batr', [[0, '#d6d2c6', 0.22], [1, '#d6d2c6', 0]], 0.8, 0.55, 0.7)}
  </defs>`;
  const B = rect(XL, 0.012, XR, 2.032);
  s += `<rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" fill="url(#porte-bat)"/>`;
  // fil du bois sous la peinture
  for (let i = 0; i < 26; i++) {
    const x = B.x + R() * B.w, y = B.y + R() * B.h * 0.8, L = 60 + R() * 220;
    s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(1 + R() * 2.5).toFixed(1)}" height="${L.toFixed(0)}" fill="${R() < 0.5 ? '#c9c6be' : '#9d9b95'}" opacity="0.12"/>`;
  }
  // deux panneaux moulurés (bas, haut), comme dans le plan large de la chambre
  const bv = 0.024;
  for (const [h0, h1] of [[0.18, 0.92], [1.08, 1.86]]) {
    const x0 = XL + 0.12, x1 = XR - 0.12;
    const o = rect(x0, h0, x1, h1);
    s += `<rect x="${o.x - 1.5}" y="${o.y - 1.5}" width="${o.w + 3}" height="${o.h + 3}" fill="none" stroke="#7f7e79" stroke-width="1.6" opacity="0.8"/>`;
    s += `<polygon points="${quad([[x0, h1], [x1, h1], [x1 - bv, h1 - bv], [x0 + bv, h1 - bv]])}" fill="#86857f"/>`;
    s += `<polygon points="${quad([[x1, h1], [x1, h0], [x1 - bv, h0 + bv], [x1 - bv, h1 - bv]])}" fill="#8f8e89"/>`;
    s += `<polygon points="${quad([[x0, h0], [x1, h0], [x1 - bv, h0 + bv], [x0 + bv, h0 + bv]])}" fill="#cfccc4"/>`;
    s += `<polygon points="${quad([[x0, h1], [x0, h0], [x0 + bv, h0 + bv], [x0 + bv, h1 - bv]])}" fill="#c8c5bd"/>`;
    const f = rect(x0 + bv, h0 + bv, x1 - bv, h1 - bv);
    s += `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="#a09f9b"/>`;
    s += `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h * 0.5}" fill="#3e4656" opacity="0.06"/>`;
  }
  s += `<rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" fill="url(#porte-batv)"/>`;
  s += `<rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" fill="url(#porte-batr)"/>`;
  // gonds (côté droit), en métal clair
  for (const h of [0.24, 1.78]) {
    const g = rect(XR - 0.014, h, XR, h + 0.1);
    s += `<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="1.2" fill="#8c9191"/><rect x="${g.x}" y="${g.y}" width="1" height="${g.h}" fill="#c8cccb"/>`;
  }
  // poignée : plaque verticale et béquille vers les gonds (métal clair, jamais laiton)
  const pl = rect(XL + 0.05, 0.93, XL + 0.09, 1.07);
  const [hx, hy] = lp(XL + 0.07, 1.0), L = (F * 0.12) / ZL;
  s += `<rect x="${pl.x + 2}" y="${pl.y + 3}" width="${pl.w}" height="${pl.h}" rx="2" fill="#2c2f36" opacity="0.35" filter="url(#b3)"/>`;
  s += `<rect x="${pl.x}" y="${pl.y}" width="${pl.w}" height="${pl.h}" rx="2" fill="#a7acab" stroke="#7b8180" stroke-width="1"/>`;
  s += `<rect x="${pl.x + 1}" y="${pl.y + 1}" width="1.4" height="${pl.h - 2}" fill="#dfe3e1" opacity="0.8"/>`;
  s += `<path d="M${hx},${hy + 6} q${L * 0.5},4 ${L},2" stroke="#2c2f36" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.3" filter="url(#b3)"/>`;
  s += `<path d="M${hx},${hy} q${L * 0.45},1 ${L},-1" stroke="#7d8483" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  s += `<path d="M${hx},${hy - 1.5} q${L * 0.45},1 ${L},-1" stroke="#d3d8d6" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
  s += `<circle cx="${hx}" cy="${hy}" r="5" fill="#9aa09f"/>`;
  // jeu tout autour du battant
  s += `<rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" fill="none" stroke="#5f5d58" stroke-width="1.4"/>`;
  return s.replace('</defs>', '</defs><g filter="url(#porte-peint)">') + '</g>';
}

/* ---------- Barreaux du berceau, tout près de nous (très flous) ---------- */
function barreaux() {
  let s = `<defs>
    ${lin('porte-bois', [[0, '#2c1e15'], [0.22, '#6b4a30'], [0.5, '#9a7149'], [0.72, '#7a5536'], [1, '#2a1c13']], 0, 0, 1, 0)}
    ${lin('porte-boisv', [[0, '#14100c', 0.55], [0.5, '#000', 0], [1, '#14100c', 0.35]])}
    ${lin('porte-drap', [[0, '#cfc2ab'], [1, '#9c8f7a']])}
  </defs>`;
  // le matelas et son drap, derrière les barreaux
  s += `<path d="M1600,968 C1760,950 1960,946 2200,952 L2200,1260 L1600,1260 Z" fill="url(#porte-drap)"/>`;
  // montant d'angle, puis barreaux
  for (const [x, w] of [[1580, 132], [1752, 94], [1918, 94], [2084, 94]]) {
    s += `<rect x="${x - w / 2}" y="-200" width="${w}" height="1500" rx="${w / 2}" fill="url(#porte-bois)"/>`;
  }
  s += `<rect x="1500" y="-200" width="700" height="1500" fill="url(#porte-boisv)"/>`;
  return s;
}

/* ---------- Outils de dessin procédural ---------- */
// Contour lisse fermé passant par des points (Catmull-Rom → Bézier)
function lisse(path, q, k = 1 / 6) {
  const n = q.length;
  path.moveTo(q[0][0], q[0][1]);
  for (let i = 0; i < n; i++) {
    const a = q[(i - 1 + n) % n], b = q[i], c = q[(i + 1) % n], d = q[(i + 2) % n];
    path.bezierCurveTo(b[0] + (c[0] - a[0]) * k, b[1] + (c[1] - a[1]) * k, c[0] - (d[0] - b[0]) * k, c[1] - (d[1] - b[1]) * k, c[0], c[1]);
  }
  path.closePath();
}

// Toiles hors écran réutilisées d'une image à l'autre
const POOL = {};
function toile(key, w, h) {
  let c = POOL[key];
  if (!c) c = POOL[key] = document.createElement('canvas');
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';
  x.shadowBlur = 0;
  x.clearRect(0, 0, w, h);
  return [c, x];
}

// Texture de matière (taches douces) pour la silhouette, tirée d'une graine fixe
let GRAIN = null;
function grain() {
  if (GRAIN) return GRAIN;
  const R = rng(5), n = 14, S = 256;
  const v = Array.from({ length: n * n }, () => R());
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d'), im = g.createImageData(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const fx = (x / S) * n, fy = (y / S) * n, i = Math.floor(fx), j = Math.floor(fy), u = fx - i, w = fy - j;
    const at = (a, b) => v[((b % n) * n + (a % n))];
    const m = lerp(lerp(at(i, j), at(i + 1, j), u), lerp(at(i, j + 1), at(i + 1, j + 1), u), w);
    const k = (y * S + x) * 4, e = 0.5 + (m - 0.5) * 1.6;
    const light = e > 0.5;
    im.data[k] = light ? 96 : 8; im.data[k + 1] = light ? 104 : 9; im.data[k + 2] = light ? 122 : 14;
    im.data[k + 3] = Math.min(255, Math.abs(e - 0.5) * 2 * 255);
  }
  g.putImageData(im, 0, 0);
  return (GRAIN = c);
}

// Remplissage flou (ombre portée du canvas, indépendante de ctx.filter)
function flou(c, fill, color, blur) {
  const m = c.getTransform(), k = Math.hypot(m.a, m.b), off = 4000;
  c.save();
  c.shadowColor = color;
  c.shadowBlur = blur * k;
  c.shadowOffsetX = off * k;
  c.translate(-off, 0);
  c.fillStyle = '#000';
  fill(c);
  c.restore();
}

/* ---------- La personne : une marionnette simple, articulée en 3D ---------- */
// Trajets au sol (x, z) : elle entre (1) ou repart (−1)
const TRAJ = {
  1: [[-0.32, 4.4], [-0.26, 3.98], [-0.2, 3.5]],
  '-1': [[-0.05, 2.9], [-0.1, 3.45], [-0.18, 4.0], [-0.32, 4.55]],
};
const LONG = {};
for (const k in TRAJ) {
  const a = TRAJ[k], L = [0];
  for (let i = 1; i < a.length; i++) L.push(L[i - 1] + Math.hypot(a[i][0] - a[i - 1][0], a[i][1] - a[i - 1][1]));
  LONG[k] = L;
}
function surTrajet(sens, s) {
  const a = TRAJ[sens], L = LONG[sens], d = clamp(s) * L[L.length - 1];
  let i = 1;
  while (i < L.length - 1 && L[i] < d) i++;
  const k = clamp((d - L[i - 1]) / (L[i] - L[i - 1] || 1));
  const dx = a[i][0] - a[i - 1][0], dz = a[i][1] - a[i - 1][1], n = Math.hypot(dx, dz) || 1;
  return { x: lerp(a[i - 1][0], a[i][0], k), z: lerp(a[i - 1][1], a[i][1], k), d, dir: [dx / n, dz / n] };
}

const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (v) => Math.hypot(v[0], v[1], v[2]);
const nrm = (v) => { const l = len(v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// Cinématique inverse à deux segments (genou, coude) ; bend : sens de la pliure
function ik(a, b, l1, l2, bend) {
  let v = sub(b, a), D = len(v);
  const u = nrm(v), Dm = (l1 + l2) * 0.998;
  if (D > Dm) { b = add(a, u, Dm); D = Dm; }
  const x = (D * D + l1 * l1 - l2 * l2) / (2 * D), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const bd = bend[0] * u[0] + bend[1] * u[1] + bend[2] * u[2];
  const w = nrm(sub(bend, [u[0] * bd, u[1] * bd, u[2] * bd]));
  return [add(add(a, u, x), w, h), b];
}

// Membre : contour fuselé autour d'une suite d'articulations
function membre(J, W) {
  const L = [], Rr = [], n = J.length;
  for (let i = 0; i < n; i++) {
    const t = nrm(sub(J[Math.min(n - 1, i + 1)], J[Math.max(0, i - 1)]));
    let px = -t[1], py = t[0];
    const l = Math.hypot(px, py);
    if (l < 0.2) { px = 1; py = 0; } else { px /= l; py /= l; }
    L.push(add(J[i], [px, py, 0], W[i] / 2));
    Rr.push(add(J[i], [px, py, 0], -W[i] / 2));
  }
  const t0 = nrm(sub(J[1], J[0])), t1 = nrm(sub(J[n - 1], J[n - 2]));
  return [...L, add(J[n - 1], t1, W[n - 1] * 0.38), ...Rr.reverse(), add(J[0], t0, -W[0] * 0.3)];
}
// Contour plan (dans le plan de l'image) : points relatifs autour d'un centre
const plan = (c, a, rot = 0) => a.map(([dx, dy]) => {
  const cs = Math.cos(rot), sn = Math.sin(rot);
  return [c[0] + dx * cs - dy * sn, c[1] + dx * sn + dy * cs, c[2]];
});
const ovale = (rx, ry, n = 14, f = () => 1) =>
  Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU; return [rx * Math.cos(a) * f(a), ry * Math.sin(a)]; });

// Mèches : très légères ondulations fixes du contour (cheveux lisses, jamais en épis)
const MECHES = (() => { const R = rng(31); return Array.from({ length: 48 }, () => R() - 0.5); })();
// Profil doux tourné vers la droite de l'image (vers le berceau) : front, nez fin, lèvres, menton discret
const PROFIL = [
  [-0.074, 0.0], [-0.071, 0.05], [-0.048, 0.094], [-0.008, 0.112], [0.034, 0.101], [0.06, 0.072], [0.07, 0.034],
  [0.067, 0.012], [0.081, -0.018], [0.069, -0.033], [0.071, -0.047], [0.066, -0.059], [0.067, -0.072], [0.055, -0.094],
  [0.03, -0.105], [0.0, -0.095], [-0.034, -0.068], [-0.058, -0.04], [-0.072, -0.02],
];
// Chevelure mi-longue (fiche de personnage) : une masse arrondie qui couvre les oreilles et
// s'arrête à hauteur de mâchoire, raie sur le côté.
// De profil (tourné vers la droite) : frange balayée sur le front, mèche le long de la joue,
// pointes rentrées sous la nuque.
const CHEV_PROFIL = [
  [0.058, 0.05], [0.066, 0.075], [0.055, 0.1], [0.03, 0.118], [-0.004, 0.124], [-0.039, 0.117],
  [-0.066, 0.097], [-0.083, 0.064], [-0.09, 0.022], [-0.091, -0.022], [-0.088, -0.058], [-0.079, -0.086],
  [-0.063, -0.103], [-0.05, -0.097], [-0.038, -0.106], [-0.02, -0.097], [-0.004, -0.09], [0.008, -0.074],
  [0.012, -0.045], [0.014, -0.012], [0.02, 0.014], [0.03, 0.033], [0.044, 0.044],
];
// De dos : la même masse, un peu plus fournie du côté où la raie rabat les cheveux ;
// la chevelure s'évase doucement sous les oreilles ; le bas suit la nuque (un peu plus court
// au milieu) et finit en pointes souples vers la mâchoire, pour ne pas faire « casque »
const CHEV_DOS = [
  [-0.074, -0.106], [-0.085, -0.088], [-0.089, -0.055], [-0.088, -0.014], [-0.083, 0.03], [-0.072, 0.07],
  [-0.052, 0.103], [-0.022, 0.121], [0.012, 0.124], [0.044, 0.115], [0.069, 0.093], [0.084, 0.057],
  [0.091, 0.014], [0.092, -0.03], [0.089, -0.07], [0.08, -0.098], [0.066, -0.111], [0.047, -0.104],
  [0.027, -0.097], [0.006, -0.093], [-0.016, -0.095], [-0.038, -0.1], [-0.058, -0.108],
];
function cheveux(dos) {
  const src = dos ? CHEV_DOS : CHEV_PROFIL;
  return src.map(([a, b], i) => [a * (1 + 0.02 * MECHES[i]), b + 0.0015 * MECHES[i + 24]]);
}
// Reflets fins dans la chevelure (de la raie vers les pointes) : [départ, contrôle, arrivée]
const REFLETS = {
  dos: [
    [[0.03, 0.118], [-0.06, 0.09], [-0.074, -0.08]], [[0.03, 0.118], [-0.03, 0.08], [-0.042, -0.088]],
    [[0.032, 0.116], [0.006, 0.06], [-0.004, -0.09]], [[0.034, 0.116], [0.05, 0.06], [0.04, -0.09]],
    [[0.036, 0.116], [0.08, 0.08], [0.074, -0.088]],
  ],
  profil: [
    [[0.02, 0.12], [-0.07, 0.1], [-0.074, -0.085]], [[0.018, 0.118], [-0.04, 0.07], [-0.046, -0.09]],
    [[0.016, 0.116], [-0.01, 0.06], [-0.012, -0.085]], [[0.022, 0.118], [0.05, 0.095], [0.054, 0.058]],
  ],
};

const TEINTE = { pull: '#1f232b', pullBord: '#232832', pant: '#1a1c22', cheveux: '#20170f', peau: '#2c201a', chaus: '#121115' };

// Position de la poignée côté chambre (là où la main se pose)
function poignee(th) {
  const u = DW - 0.07;
  return [XR - u * Math.cos(th) + 0.055 * Math.sin(th), 1.0, ZL - u * Math.sin(th) - 0.055 * Math.cos(th)];
}

// Les articulations et les contours de la personne (monde, mètres)
function personne(p, th, T) {
  if (p.figure == null || !(p.figure >= 0)) return null;
  const sens = p.sens === -1 ? -1 : 1, dos = sens === -1;
  const { x, z, d, dir } = surTrajet(sens, p.figure);
  const pas = clamp(p.pas ?? 0), rest = 1 - pas;
  const face = dos ? 1 : -1; // vers où regardent les pieds (z)
  const ph = (d / 0.6) * Math.PI, c1 = Math.cos(ph), s1 = Math.sin(ph);
  const br = Math.sin(T * 1.55);
  const px = x + 0.012 * rest + 0.012 * pas * s1;
  const py = 0.93 - 0.02 * pas * c1 * c1;
  const parts = [];
  const put = (pts, col, zz, main = false, kind = '') => parts.push({ pts, col, z: zz, main, kind });

  // Jambes (gauche/droite à l'écran) ; au repos, l'appui est à droite. Pantalon droit, silhouette mince
  const legs = [-1, 1].map((s) => {
    const a = 0.2 * pas * (s < 0 ? c1 : -c1);
    const lift = 0.055 * pas * Math.max(0, s < 0 ? -s1 : s1);
    const relax = s < 0 ? rest : 0;
    const hip = [px + s * 0.07, py - 0.035 - 0.012 * relax, z];
    const ank = [x + s * 0.08 + dir[0] * a - 0.012 * relax, 0.085 + lift, z + dir[1] * a + face * 0.06 * relax];
    const [knee, an] = ik(hip, ank, 0.41, 0.41, [0, 0.05, face]);
    return { s, a, hip, knee, an };
  });
  legs.sort((u, v) => v.an[2] - u.an[2]); // la plus lointaine d'abord
  for (const L of legs) {
    put(membre([L.hip, mix3(L.hip, L.knee, 0.5), L.knee, mix3(L.knee, L.an, 0.5), L.an], [0.136, 0.122, 0.1, 0.093, 0.084]), TEINTE.pant, L.an[2]);
    put(plan([L.an[0], L.an[1] - 0.048, L.an[2] + face * 0.05], ovale(0.05, 0.034, 12)), TEINTE.chaus, L.an[2]); // la chaussure suit la cheville
  }
  // Bassin (presque entièrement caché par le pull)
  const tilt = (y) => lerp(0.05, -0.05, clamp((y - 0.9) / 0.5)) * rest;
  const corps = (cx, a) => a.map(([dx, y]) => [cx + dx * (1 + (y > 1.3 ? 0.008 * br : 0)), y + dx * tilt(y) + (y - 0.86) * 0.004 * br - 0.02 * pas * c1 * c1, z]);
  put(corps(px, [[-0.12, 0.95], [-0.128, 0.86], [-0.11, 0.8], [0, 0.772], [0.11, 0.8], [0.128, 0.86], [0.12, 0.95]]), TEINTE.pant, z);

  // Bras ; l'un peut chercher la poignée (de dos : le droit à l'écran). Épaules étroites
  const main = clamp(p.main ?? 0), side = dos ? 1 : -1;
  const sx = lerp(px, x, 0.6);
  const arms = [-1, 1].map((s) => {
    const sh = [sx + s * 0.13, 1.305 + 0.006 * br - s * 0.05 * 0.13 * rest, z];
    const leg = legs.find((L) => L.s === s);
    const v = -0.45 * leg.a;
    let wr = [sh[0] + s * (0.034 + 0.014 * (s > 0 ? rest : 0)), sh[1] - 0.525, z + dir[1] * v * 0.9 + face * 0.04];
    wr[0] += dir[0] * v * 0.9;
    let tip;
    if (s === side && main > 0) {
      const K = dos ? poignee(th) : [XL - 0.035, 1.06, ZW - 0.035], to = nrm(sub(K, sh));
      // de dos, la main va à la poignée ; de face, elle se pose à plat sur le chambranle, doigts vers le haut
      const target = dos ? add(K, to, -0.07) : add(K, [0.015, -0.07, 0.01]);
      wr = mix3(wr, target, main);
      const [el, w2] = ik(sh, wr, 0.29, 0.265, dos ? [s * 0.15, -0.2, -face] : [s * 0.5, -1, -face * 0.25]);
      const restTip = add(w2, [-s * 0.014, -0.145, face * 0.035]);
      // de dos, la main se referme sur la poignée (plus courte) ; de face, elle s'étend à plat
      const onTip = dos ? add(w2, nrm(sub(K, w2)), 0.105) : add(w2, [-0.02, 0.13, -0.01]);
      tip = mix3(restTip, onTip, main);
      return { s, sh, el, wr: w2, tip, reach: true };
    }
    const [el, w2] = ik(sh, wr, 0.29, 0.265, [s * 0.18, 0, -face * 0.7]);
    tip = add(w2, [-s * 0.014, -0.145, face * 0.035]);
    return { s, sh, el, wr: w2, tip, reach: false };
  });
  // Manche ample (plus large à l'avant-bras), resserrée au poignet ; main fine aux doigts longs
  const bras = (A) => {
    put(membre([A.sh, mix3(A.sh, A.el, 0.5), A.el, mix3(A.el, A.wr, 0.6), A.wr], [0.086, 0.084, 0.082, 0.08, 0.058]), TEINTE.pull, z, A.reach, 'manche');
    // main au repos vue de tranche (étroite) ; posée à plat sur le chambranle, on voit son dos,
    // plus large, et le pouce ; refermée sur la poignée, elle devient un poing arrondi
    const plat = A.reach && !dos ? main : 0, poing = A.reach && dos ? main : 0;
    const lg = lerp(1, 1.45, plat);
    const W = [lerp(0.036, 0.044, poing) * lg, lerp(0.04, 0.052, poing) * lg, lerp(0.026, 0.046, poing) * lerp(1, 1.3, plat)];
    put(membre([mix3(A.wr, A.tip, 0.08), mix3(A.wr, A.tip, 0.5), A.tip], W), TEINTE.peau, z, A.reach);
    if (plat > 0.3) {
      const k = clamp((plat - 0.3) / 0.7), b = add(mix3(A.wr, A.tip, 0.32), [A.s * 0.022 * lg, 0, 0]);
      put(membre([b, add(b, [A.s * 0.03 * k, 0.034 * k, 0])], [0.021, 0.017]), TEINTE.peau, z, A.reach);
    }
  };
  // Tête (légèrement penchée), cou fin ; les cheveux couvrent les oreilles
  const hr = (dos ? -0.04 : 0.07) * rest;
  const hc = [x + 0.006 * rest, 1.59 + 0.004 * br - 0.02 * pas * c1 * c1, z];
  const cou = () => put(membre([[sx, 1.41, z], [hc[0] - (dos ? 0 : 0.012), 1.525, z]], [0.084, 0.066]), TEINTE.peau, z);
  const tete = () => {
    put(plan(hc, dos ? ovale(0.072, 0.11, 22, (a) => (Math.sin(a) < 0 ? 1 - 0.3 * Math.sin(a) ** 2 : 1)) : PROFIL, hr), TEINTE.peau, z);
    put(plan(hc, cheveux(dos), hr), TEINTE.cheveux, z, false, 'cheveux');
  };
  const reflets = REFLETS[dos ? 'dos' : 'profil'].map((cv) => plan(hc, cv, hr));
  // Pull ample : épaules tombantes et arrondies, corps droit, ourlet souple sur les hanches
  const bord = () => put(corps(sx, [[-0.155, 0.834], [-0.06, 0.826], [0.06, 0.826], [0.155, 0.834], [0.15, 0.8], [0.06, 0.788], [-0.06, 0.788], [-0.15, 0.8]]), TEINTE.pullBord, z);
  const torse = () =>
    put(corps(sx, [
      [-0.044, 1.452], [-0.09, 1.432], [-0.13, 1.403], [-0.158, 1.364], [-0.17, 1.31], [-0.164, 1.24], [-0.158, 1.12],
      [-0.153, 1.0], [-0.152, 0.9], [-0.152, 0.83], [-0.14, 0.796], [-0.06, 0.788], [0.06, 0.788], [0.14, 0.796],
      [0.152, 0.83], [0.152, 0.9], [0.153, 1.0], [0.158, 1.12], [0.164, 1.24], [0.17, 1.31], [0.158, 1.364], [0.13, 1.403], [0.09, 1.432], [0.044, 1.452], [0, 1.447],
    ]), TEINTE.pull, z);
  const reach = arms.find((A) => A.reach);
  if (dos) {
    if (reach) bras(reach);
    cou(); torse(); bord();
    for (const A of arms) if (!A.reach) bras(A);
    tete();
  } else {
    // le cou d'abord : l'encolure ras du cou le recouvre
    cou(); torse(); bord();
    for (const A of arms) bras(A);
    tete();
  }
  // profondeur retenue pour le bras tendu (la main passe devant le battant)
  const zMain = reach ? lerp(z, reach.wr[2] - 0.12, main) : z;
  return { parts, reflets, x, z, zMain, sens, dos };
}

/* ---------- Lumière du couloir ---------- */
// Contour orienté toujours dans le même sens (union correcte des formes)
function oriente(q) {
  let a = 0;
  for (let i = 0; i < q.length; i++) { const u = q[i], v = q[(i + 1) % q.length]; a += u[0] * v[1] - v[0] * u[1]; }
  return a < 0 ? q.slice().reverse() : q;
}
// Ombre portée d'un point sur le plancher, depuis la source L
function ombre(v, L) {
  const y = Math.min(v[1], L.y - 0.05), s = L.y / (L.y - y);
  return pr(L.x + (v[0] - L.x) * s, 0, Math.max(0.6, L.z + (v[2] - L.z) * s));
}
// Source étendue : quelques positions de la lampe, pour des pénombres douces
const SRC = (n, w = 0.6) => Array.from({ length: n }, (_, k) => ({ x: LS.x + (k / (n - 1) - 0.5) * w, y: LS.y + ((k % 2) - 0.5) * 0.1, z: LS.z + ((k % 3) - 1) * 0.12 }));
const SRC9 = SRC(9, 0.34), SRC5 = SRC(7, 0.14);
// Bord libre du battant (vue de dessus) et limite de la lumière qui passe
const bord = (th) => [XR - DW * Math.cos(th), ZL - DW * Math.sin(th)];
const coupe = (th, L) => {
  const E = bord(th);
  return Math.min(XR, L.x + ((E[0] - L.x) * (L.z - ZW)) / (L.z - E[1]));
};

function lumiere(c, th, fig, T) {
  const m = c.getTransform(), W = c.canvas.width, H = c.canvas.height, r = 0.5;
  const [Lc, l] = toile('lum', Math.ceil(W * r), Math.ceil(H * r));
  l.setTransform(m.a * r, m.b * r, m.c * r, m.d * r, m.e * r, m.f * r);
  l.globalCompositeOperation = 'lighter';
  // plancher du couloir et seuil, vus par l'embrasure
  l.save();
  l.beginPath(); l.rect(OX0, OY0, OX1 - OX0, OY1 - OY0 + 1); l.clip();
  l.fillStyle = 'rgba(255,206,140,0.78)';
  l.beginPath();
  for (const v of [[-2, 0, ZW], [2, 0, ZW], [2, 0, ZC], [-2, 0, ZC]]) l.lineTo(...pr(...v));
  l.fill();
  l.restore();
  // filet sous la porte (surtout quand elle est fermée)
  const fil = 1 - clamp(th / 0.25);
  if (fil > 0) {
    l.fillStyle = `rgba(255,222,170,${0.9 * fil})`;
    l.beginPath();
    for (const v of [[XL + 0.02, 0, ZW + 0.01], [XR - 0.02, 0, ZW + 0.01], [XR - 0.08, 0, ZW - 0.13], [XL + 0.08, 0, ZW - 0.13]]) l.lineTo(...pr(...v));
    l.fill();
    const [gx, gy] = pr((XL + XR) / 2, 0, ZW - 0.05);
    const gr = l.createRadialGradient(gx, gy, 0, gx, gy, 170);
    gr.addColorStop(0, `rgba(255,200,130,${0.3 * fil})`); gr.addColorStop(1, 'rgba(255,200,130,0)');
    l.fillStyle = gr;
    l.save(); l.translate(gx, gy); l.scale(1, 0.16); l.translate(-gx, -gy);
    l.fillRect(gx - 180, gy - 180, 360, 360); l.restore();
  }
  // la bande de lumière sur le plancher de la chambre
  let lum = 0;
  if (th > 0.004) {
    const zN = 0.95;
    for (const L of SRC9) {
      const xc = coupe(th, L);
      if (xc <= XL) continue;
      const ray = (x0, z) => L.x + ((x0 - L.x) * (L.z - z)) / (L.z - ZW);
      const gr = l.createLinearGradient(0, OY1, 0, 1180);
      gr.addColorStop(0, 'rgba(255,214,152,0.105)');
      gr.addColorStop(0.35, 'rgba(255,204,140,0.07)');
      gr.addColorStop(1, 'rgba(255,190,120,0.03)');
      l.fillStyle = gr;
      l.beginPath();
      for (const v of [[XL, 0, ZW], [xc, 0, ZW], [ray(xc, zN), 0, zN], [ray(XL, zN), 0, zN]]) l.lineTo(...pr(...v));
      l.fill();
    }
    const xc = coupe(th, LS);
    lum = clamp((xc - XL) / 0.3);
    // reflet de l'embrasure lumineuse dans le vernis du plancher
    const Ex = Math.min(OX1, pr(...[bord(th)[0], 0, bord(th)[1]])[0]);
    if (Ex > OX0 + 2) {
      const gr = l.createLinearGradient(0, OY1, 0, OY1 + 260);
      gr.addColorStop(0, `rgba(255,220,170,${0.15 * lum})`); gr.addColorStop(1, 'rgba(255,220,170,0)');
      l.fillStyle = gr;
      l.fillRect(OX0 + 4, OY1, Ex - OX0 - 8, 260);
    }
    // rebond chaud de la bande sur le mur et le plancher
    const [bx, by] = pr((XL + xc) / 2, 0, ZW - 0.4);
    const gb = l.createRadialGradient(bx, by, 0, bx, by, 620);
    gb.addColorStop(0, `rgba(255,196,128,${0.14 * lum})`); gb.addColorStop(1, 'rgba(255,196,128,0)');
    l.fillStyle = gb;
    l.fillRect(bx - 640, by - 640, 1280, 1280);
  }
  // l'ombre de la personne efface la lumière
  if (fig) {
    l.globalCompositeOperation = 'destination-out';
    for (const L of SRC5) {
      l.fillStyle = `rgba(0,0,0,${0.94 / SRC5.length})`;
      const pa = new Path2D();
      for (const pt of fig.parts) lisse(pa, oriente(pt.pts.map((v) => ombre(v, L))));
      l.fill(pa);
    }
  }
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.imageSmoothingQuality = 'high';
  c.globalCompositeOperation = 'screen';
  c.drawImage(Lc, 0, 0, W, H);
  // ombre colorée : dans la bande dorée, l'ombre de la personne tire vers le bleu
  if (fig && lum > 0) {
    const [Tc, t] = toile('teinte', Lc.width, Lc.height);
    t.setTransform(m.a * r, m.b * r, m.c * r, m.d * r, m.e * r, m.f * r);
    const xc = coupe(th, LS), ray = (x0, z) => LS.x + ((x0 - LS.x) * (LS.z - z)) / (LS.z - ZW);
    t.fillStyle = '#fff';
    t.beginPath();
    for (const v of [[XL, 0, ZW + 0.3], [xc, 0, ZW + 0.3], [ray(xc, 0.95), 0, 0.95], [ray(XL, 0.95), 0, 0.95]]) t.lineTo(...pr(...v));
    t.fill();
    t.globalCompositeOperation = 'destination-in';
    const pa = new Path2D();
    for (const pt of fig.parts) lisse(pa, oriente(pt.pts.map((v) => ombre(v, LS))));
    t.fill(pa);
    t.globalCompositeOperation = 'source-in';
    t.setTransform(1, 0, 0, 1, 0, 0);
    t.fillStyle = 'rgb(150,164,214)'; t.fillRect(0, 0, Tc.width, Tc.height);
    c.globalCompositeOperation = 'multiply';
    c.globalAlpha = 0.5 * lum;
    c.drawImage(Tc, 0, 0, W, H);
    c.globalAlpha = 1;
  }
  c.globalCompositeOperation = 'screen';
  c.globalCompositeOperation = 'overlay';
  c.globalAlpha = 0.35;
  c.drawImage(Lc, 0, 0, W, H);
  c.restore();
  // halo chaud autour de l'embrasure (derrière la personne)
  if (lum > 0) {
    const xc = coupe(th, LS), [hx, hy] = pr((XL + xc) / 2, 1.2, ZW);
    c.globalCompositeOperation = 'screen';
    const h = c.createRadialGradient(hx, hy, 0, hx, hy, 430);
    h.addColorStop(0, `rgba(255,214,156,${0.12 * lum})`); h.addColorStop(1, 'rgba(255,214,156,0)');
    c.fillStyle = h; c.fillRect(hx - 440, hy - 440, 880, 880);
  }
  return lum;
}

/* ---------- Battant en perspective : bandes verticales du calque peint ---------- */
function dessineBattant(g, th) {
  if (th < 0.002) { g.img('porte'); return; }
  const N = 44;
  const lx = (u) => CX + (F * (XR - u)) / ZL;
  const Z = (u) => ZL - u * Math.sin(th);
  const sx = (u) => CX + (F * (XR - u * Math.cos(th))) / Z(u);
  for (let i = 0; i < N; i++) {
    const u0 = (i / N) * DW, u1 = ((i + 1) / N) * DW, l0 = lx(u0), l1 = lx(u1);
    const e0 = i === 0 ? 9 : 0.7, e1 = i === N - 1 ? 9 : 0.7;
    g.img('porte', {
      tf: { ox: l0, oy: HZ, x: sx(u0) - l0, y: 0, sx: (sx(u0) - sx(u1)) / (l0 - l1), sy: ZL / Z((u0 + u1) / 2) },
      clip: (c) => { c.beginPath(); c.rect(l1 - e1, BOX_BAT[1] - 4, l0 - l1 + e0 + e1, BOX_BAT[3] + 8); },
    });
  }
}
// Modelé du battant ouvert (il se tourne vers la fenêtre) et son chant
function chant(c, th) {
  if (th < 0.002) return;
  const E = bord(th), n = [Math.sin(th), -Math.cos(th)];
  const lam = 0.5 + 0.5 * Math.max(0, (0.45 * n[0] - n[1]) / 1.1);
  const k = lerp(1, (lam / 0.95) * 0.86, clamp(th / 0.6));
  const q = [[XR, 2.032, ZL], [E[0], 2.032, E[1]], [E[0], 0.012, E[1]], [XR, 0.012, ZL]].map((v) => pr(...v));
  c.globalCompositeOperation = 'multiply';
  const gr = c.createLinearGradient(q[1][0], 0, q[0][0], 0);
  const v = Math.round(255 * Math.min(1, k)), b = Math.round(255 * Math.min(1, k * 1.04));
  gr.addColorStop(0, `rgb(${v - 18},${v - 14},${b - 6})`); gr.addColorStop(1, `rgb(${v},${v},${b})`);
  c.fillStyle = gr;
  c.beginPath(); q.forEach((p) => c.lineTo(...p)); c.closePath(); c.fill();
  // chant du battant (épaisseur), côté libre
  const t = 0.04, C2 = [E[0] - t * n[0], E[1] - t * n[1]];
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#9d9c97';
  c.beginPath();
  for (const v2 of [[E[0], 2.032, E[1]], [C2[0], 2.032, C2[1]], [C2[0], 0.012, C2[1]], [E[0], 0.012, E[1]]]) c.lineTo(...pr(...v2));
  c.fill();
}

/* ---------- La personne, peinte en contre-jour ---------- */
// Partie du battant plus proche de nous qu'un plan de profondeur zz (vue de la caméra)
function devantBattant(c, th, zz) {
  let u0;
  if (th < 0.002) { if (zz <= ZL) return false; u0 = 0; } else u0 = clamp((ZL - zz) / Math.sin(th), 0, DW);
  if (u0 >= DW - 0.001) return false;
  const P = (u, h, t = 0) => pr(XR - u * Math.cos(th) - t * Math.sin(th), h, ZL - u * Math.sin(th) + t * Math.cos(th));
  const q = [P(u0, 2.04), P(DW, 2.04), P(DW, 2.04, 0.045), P(DW, 0, 0.045), P(DW, 0), P(u0, 0)];
  c.rect(-4000, -4000, 10000, 10000);
  c.moveTo(...q[0]);
  for (let i = q.length - 1; i > 0; i--) c.lineTo(...q[i]);
  c.closePath();
  return true;
}

function peindrePersonne(c, fig, lum, th, main, zz) {
  const m = c.getTransform(), k = m.a;
  const tout = fig.parts.map((pt) => ({ q: pt.pts.map((v) => pr(...v)), col: pt.col, kind: pt.kind, main: pt.main }));
  const shapes = tout.filter((s) => s.main === main);
  if (!shapes.length) return;
  // cadre commun aux deux passes (corps, bras tendu) : même modelé, même liseré, mêmes valeurs
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const { q } of tout) for (const [x, y] of q) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const pad = 40;
  const dx = Math.floor(x0 * k + m.e) - pad, dy = Math.floor(y0 * k + m.f) - pad;
  const W = Math.ceil((x1 - x0) * k) + 2 * pad, H = Math.ceil((y1 - y0) * k) + 2 * pad;
  const [A, a] = toile('fig', W, H);
  a.setTransform(k, 0, 0, k, m.e - dx, m.f - dy);
  const chev = new Path2D();
  for (const s of shapes) {
    const pa = new Path2D(); lisse(pa, s.q); a.fillStyle = s.col; a.fill(pa);
    if (s.kind === 'cheveux') chev.addPath(pa);
  }
  const aChev = shapes.some((s) => s.kind === 'cheveux');
  // la manche se détache du buste : un trait d'ombre doux sur son contour, à l'intérieur
  a.save();
  a.lineWidth = (0.008 * F) / fig.z;
  a.strokeStyle = 'rgba(3,5,10,0.22)';
  for (const s of shapes) {
    if (s.kind !== 'manche') continue;
    const pa = new Path2D(); lisse(pa, s.q);
    a.save(); a.clip(pa); a.stroke(pa); a.restore();
  }
  a.restore();
  // mèches lisses : quelques reflets fins de la raie vers les pointes, dans la chevelure seulement
  if (aChev) {
    a.save();
    a.clip(chev);
    a.lineCap = 'round';
    a.lineWidth = (0.003 * F) / fig.z;
    a.strokeStyle = 'rgba(118,96,80,0.13)';
    for (const cv of fig.reflets) {
      const [p0, p1, p2] = cv.map((v) => pr(...v));
      a.beginPath(); a.moveTo(...p0); a.quadraticCurveTo(...p1, ...p2); a.stroke();
    }
    a.restore();
  }
  // modelé : côté gauche plus sombre, rebond chaud du plancher en bas, matière
  a.setTransform(1, 0, 0, 1, 0, 0);
  a.globalCompositeOperation = 'source-atop';
  let gr = a.createLinearGradient(0, 0, W, 0);
  gr.addColorStop(0, 'rgba(6,8,14,0.3)'); gr.addColorStop(0.55, 'rgba(6,8,14,0)'); gr.addColorStop(1, 'rgba(6,8,14,0)');
  a.fillStyle = gr; a.fillRect(0, 0, W, H);
  gr = a.createRadialGradient(W * 0.72, H * 0.3, 0, W * 0.72, H * 0.3, W * 0.6);
  gr.addColorStop(0, 'rgba(150,164,190,0.12)'); gr.addColorStop(1, 'rgba(150,164,190,0)');
  a.fillStyle = gr; a.fillRect(0, 0, W, H);
  gr = a.createLinearGradient(0, H, 0, H * 0.4);
  gr.addColorStop(0, `rgba(255,186,118,${0.2 * lum})`); gr.addColorStop(1, 'rgba(255,186,118,0)');
  a.fillStyle = gr; a.fillRect(0, 0, W, H);
  a.globalAlpha = 0.16; a.fillStyle = a.createPattern(grain(), 'repeat'); a.fillRect(0, 0, W, H);
  a.globalAlpha = 1;
  // liseré de lumière : bords tournés vers la lampe (haut, gauche), puis à droite
  const r = Math.max(1.2, ((0.008 * F) / fig.z) * k);
  const [B, b] = toile('rim', W, H), [C2, c2] = toile('rim2', W, H);
  b.drawImage(A, 0, 0); b.globalCompositeOperation = 'destination-out'; b.drawImage(A, r, r * 0.85);
  c2.drawImage(A, 0, 0); c2.globalCompositeOperation = 'destination-out'; c2.drawImage(A, -r * 0.7, r);
  b.globalCompositeOperation = 'source-over'; b.globalAlpha = 0.55; b.drawImage(C2, 0, 0); b.globalAlpha = 1;
  b.globalCompositeOperation = 'source-in';
  gr = b.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#ffe9c2'); gr.addColorStop(0.22, 'rgba(255,218,156,0.8)'); gr.addColorStop(0.5, 'rgba(255,204,140,0.22)'); gr.addColorStop(1, 'rgba(255,196,128,0.03)');
  b.fillStyle = gr; b.fillRect(0, 0, W, H);
  // les cheveux, plus fins sur leurs bords, s'allument davantage dans le contre-jour
  if (aChev) {
    const [Hc, h] = toile('chev', W, H), [Hr, hh] = toile('chevRim', W, H);
    h.setTransform(k, 0, 0, k, m.e - dx, m.f - dy); h.fillStyle = '#000'; h.fill(chev);
    hh.drawImage(Hc, 0, 0); hh.globalCompositeOperation = 'destination-out'; hh.drawImage(Hc, r * 1.5, r * 1.1);
    hh.globalCompositeOperation = 'source-in'; hh.fillStyle = 'rgba(255,224,176,0.85)'; hh.fillRect(0, 0, W, H);
    b.globalCompositeOperation = 'source-over'; b.drawImage(Hr, 0, 0);
  }
  a.globalCompositeOperation = 'source-over'; a.globalAlpha = lum; a.drawImage(B, 0, 0); a.globalAlpha = 1;
  // pose dans l'image ; derrière le mur, la personne n'est visible que dans l'embrasure
  c.save();
  if (fig.z > ZW + 0.16) { c.beginPath(); c.rect(OX0, OY0, OX1 - OX0, OY1 - OY0 + 2); c.clip(); }
  c.beginPath();
  if (devantBattant(c, th, zz)) c.clip('evenodd');
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.drawImage(A, dx, dy);
  // halo du liseré : réduit puis agrandi (flou bon marché)
  const [G, gg] = toile('halo', Math.ceil(W / 5), Math.ceil(H / 5));
  gg.drawImage(B, 0, 0, G.width, G.height);
  c.imageSmoothingQuality = 'high';
  c.globalCompositeOperation = 'screen';
  c.globalAlpha = 0.6 * lum;
  c.drawImage(G, dx, dy, W, H);
  c.globalAlpha = 0.3 * lum;
  c.drawImage(B, dx, dy);
  c.restore();
}

/* ---------- Faisceau dans l'air, rayons et poussière ---------- */
const RAYONS = (() => { const R = rng(41); return Array.from({ length: 9 }, () => [R(), 0.25 + R() * 0.75, R() * TAU, 0.5 + R()]); })();
const POUSS = (() => {
  const R = rng(77);
  return Array.from({ length: 190 }, () => ({
    x: -1.4 + R() * 3.4, y: R() * 2.3, z: 1.2 + R() * 2.65,
    vx: (R() - 0.5) * 0.014, vy: -0.006 - R() * 0.012, ph: R() * TAU, f: 0.4 + R() * 0.8, s: 0.5 + R(),
  }));
})();

function faisceau(c, th, fig, T, lum) {
  if (lum <= 0) return;
  const m = c.getTransform(), W = c.canvas.width, H = c.canvas.height, r = 0.5;
  const [Bc, b] = toile('air', Math.ceil(W * r), Math.ceil(H * r));
  b.setTransform(m.a * r, m.b * r, m.c * r, m.d * r, m.e * r, m.f * r);
  const xc = coupe(th, LS);
  const [gx, gy] = pr((XL + xc) / 2, 0.35, ZW - 0.3);
  const gr = b.createRadialGradient(gx, gy, 0, gx, gy, 520);
  gr.addColorStop(0, `rgba(255,218,160,${0.13 * lum})`); gr.addColorStop(0.45, `rgba(255,210,150,${0.04 * lum})`); gr.addColorStop(1, 'rgba(255,210,150,0)');
  b.save(); b.translate(gx, gy); b.scale(1.25, 0.8); b.translate(-gx, -gy);
  b.fillStyle = gr; b.fillRect(gx - 560, gy - 560, 1120, 1120); b.restore();
  // rayons : ils partent de la lampe et traversent l'embrasure
  const [lx, ly] = pr(LS.x, LS.y, LS.z);
  b.globalCompositeOperation = 'lighter';
  for (const [u, v, ph, sp] of RAYONS) {
    const [px, py] = pr(lerp(XL, xc, u), v * HD, ZW);
    const dx = px - lx, dy = py - ly, n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n;
    const a = (0.035 + 0.03 * Math.sin(T * 0.35 * sp + ph)) * lum, L = 900, w0 = 4, w1 = 70;
    const g2 = b.createLinearGradient(px, py, px + ux * L, py + uy * L);
    g2.addColorStop(0, `rgba(255,226,180,${a})`); g2.addColorStop(1, 'rgba(255,226,180,0)');
    b.fillStyle = g2;
    b.beginPath();
    b.moveTo(px - uy * w0, py + ux * w0); b.lineTo(px + uy * w0, py - ux * w0);
    b.lineTo(px + ux * L + uy * w1, py + uy * L - ux * w1); b.lineTo(px + ux * L - uy * w1, py + uy * L + ux * w1);
    b.fill();
  }
  // l'air derrière la personne (vu d'ici) est dans son ombre
  if (fig) {
    b.globalCompositeOperation = 'destination-out';
    b.fillStyle = 'rgba(0,0,0,0.7)';
    const pa = new Path2D(), pb = new Path2D();
    for (const pt of fig.parts) { lisse(pa, oriente(pt.pts.map((v) => ombre(v, LS)))); lisse(pb, oriente(pt.pts.map((v) => pr(...v)))); }
    b.fill(pa); b.fill(pb);
  }
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'screen';
  c.drawImage(Bc, 0, 0, W, H);
  c.restore();
  // poussière éclairée seulement dans le faisceau
  c.globalCompositeOperation = 'lighter';
  for (const d of POUSS) {
    const y = ((((d.y + d.vy * T + 0.03 * Math.sin(T * 0.3 * d.f + d.ph)) % 2.3) + 2.3) % 2.3);
    const x = d.x + d.vx * T + 0.04 * Math.sin(T * 0.2 + d.ph), z = d.z + 0.03 * Math.cos(T * 0.17 + d.ph);
    const t = (ZW - LS.z) / (z - LS.z), ix = LS.x + (x - LS.x) * t, iy = LS.y + (y - LS.y) * t;
    if (ix < XL || ix > xc || iy < 0 || iy > HD) continue;
    const near = clamp((ZW - z) / 2.6), a = lum * (1 - 0.6 * near) * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(T * 1.3 * d.f + d.ph)));
    const [sx, sy] = pr(x, y, z), rr = (F * 0.0013 * d.s) / z + 0.5;
    c.fillStyle = `rgba(255,228,184,${(0.75 * a).toFixed(3)})`;
    c.beginPath(); c.arc(sx, sy, rr, 0, TAU); c.fill();
    if (near > 0.5) { c.fillStyle = `rgba(255,228,184,${(0.08 * a).toFixed(3)})`; c.beginPath(); c.arc(sx, sy, rr * 3, 0, TAU); c.fill(); }
  }
}

/* ---------- Soleil de la fenêtre, dans l'air, vers la tache du mur ---------- */
const GRAINS = (() => { const R = rng(91); return Array.from({ length: 46 }, () => [R(), R(), R() * TAU, 0.4 + R() * 0.9, 0.6 + R()]); })();
function soleil(c, T) {
  c.globalCompositeOperation = 'screen';
  const fx = 1540, fy = 372; // point de fuite des rayons, dans la tache
  const src = [[1720, -160, 260], [1960, -60, 300], [2160, 160, 280], [2200, 420, 240], [1500, -200, 200]];
  src.forEach(([x, y, w], i) => {
    const a = 0.03 + 0.012 * Math.sin(T * 0.3 + i * 1.7);
    const dx = fx - x, dy = fy - y, n = Math.hypot(dx, dy), px = -dy / n, py = dx / n;
    const gr = c.createLinearGradient(x, y, fx, fy);
    gr.addColorStop(0, `rgba(255,226,170,${a})`); gr.addColorStop(0.75, `rgba(255,226,170,${a * 0.6})`); gr.addColorStop(1, 'rgba(255,226,170,0)');
    c.fillStyle = gr;
    c.beginPath(); c.moveTo(x - px * w, y - py * w); c.lineTo(x + px * w, y + py * w); c.lineTo(fx + px * 30, fy + py * 30); c.lineTo(fx - px * 30, fy - py * 30); c.fill();
  });
  // poussière qui flotte dans le soleil, près de nous (grosse, floue)
  for (const [u, v, ph, sp, sz] of GRAINS) {
    const k = (u + T * 0.012 * sp) % 1, x = lerp(2050, 1480, k) + 40 * Math.sin(T * 0.4 * sp + ph);
    const y = lerp(-60, 420, v) + lerp(-120, 0, k) + 30 * Math.sin(T * 0.25 + ph);
    const a = 0.18 * Math.sin(Math.PI * k) * (0.5 + 0.5 * Math.sin(T * 0.9 * sp + ph));
    const r = 2 + 4 * sz * (1 - k);
    const g = c.createRadialGradient(x, y, 0, x, y, r * 2.2);
    g.addColorStop(0, `rgba(255,232,190,${a})`); g.addColorStop(1, 'rgba(255,232,190,0)');
    c.fillStyle = g; c.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
  }
}

/* ---------- Ombres du mobile dans la tache de soleil ---------- */
function etoile(p, r) {
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, k = i % 2 ? 0.45 : 1; p.lineTo(Math.cos(a) * r * k, Math.sin(a) * r * k); }
  p.closePath();
}
function mobile(c, T) {
  c.beginPath(); SUN.forEach((p) => c.lineTo(...p)); c.closePath(); c.clip();
  c.globalCompositeOperation = 'multiply';
  const items = [['etoile', 30, 300, 0, 132], ['lune', 27, 372, 1.57, 84], ['nuage', 32, 318, 3.14, 120], ['soleil', 22, 430, 4.71, 60]];
  const a0 = T * 0.21;
  c.strokeStyle = 'rgba(80,90,104,0.1)'; c.lineWidth = 1.2;
  for (const [f, r, y, ph, R] of items) {
    const a = a0 + ph, x = 1530 + R * Math.cos(a), sq = 0.45 + 0.55 * Math.abs(Math.sin(a + 0.7));
    const p = new Path2D();
    if (f === 'etoile') etoile(p, r);
    else if (f === 'lune') { p.arc(0, 0, r, 0.4, TAU - 0.4); p.arc(r * 0.45, -r * 0.1, r * 0.75, TAU - 0.55, 0.55, true); p.closePath(); }
    else if (f === 'nuage') { p.ellipse(-r * 0.5, r * 0.15, r * 0.55, r * 0.42, 0, 0, TAU); p.ellipse(r * 0.15, -r * 0.12, r * 0.6, r * 0.55, 0, 0, TAU); p.ellipse(r * 0.7, r * 0.2, r * 0.42, r * 0.36, 0, 0, TAU); }
    else p.arc(0, 0, r, 0, TAU);
    flou(c, (cc) => { cc.translate(x, y); cc.scale(sq, 1); cc.fill(p); }, 'rgba(72,82,98,0.24)', 8);
  }
  c.beginPath(); c.moveTo(1400, 190); c.quadraticCurveTo(1530, 182, 1660, 196); c.lineWidth = 4; c.stroke();
}

/* ---------- Le décor ---------- */
export default {
  id: 'porte',
  bg: '#14121a',
  home: { x: 960, y: 540, z: 1 },
  layers: {
    fond: { box: [-240, -140, 2400, 1360], svg: fond(), filters: ['paint'] },
    chambranle: { box: [CX0 - 24, CY0 - 24, CX1 - CX0 + 48, OY1 - CY0 + 30], svg: chambranle() },
    porte: { box: BOX_BAT, svg: battant() },
    barreaux: { box: [1260, -220, 900, 1460], svg: barreaux(), filters: ['b28', 'b16'], par: 1.6 },
  },
  render(g, p, T) {
    const door = clamp(p.door ?? 0), th = door * OPEN;
    const fig = personne(p, th, T);
    let lum = 0;
    g.img('fond');
    g.img('chambranle');
    g.fx(1, (c) => mobile(c, T));
    g.fx(1, (c) => { lum = lumiere(c, th, fig, T); });
    dessineBattant(g, th);
    g.fx(1, (c) => chant(c, th));
    // la personne, découpée là où le battant passe devant elle (de dos, le bras tendu est derrière le buste)
    if (fig) {
      g.fx(1, (c) => {
        for (const main of fig.dos ? [true, false] : [false, true]) peindrePersonne(c, fig, lum, th, main, main ? fig.zMain : fig.z);
      });
    }
    g.fx(1, (c) => faisceau(c, th, fig, T, lum));
    g.fx(1.3, (c) => soleil(c, T));
    g.img('barreaux', { tf: { x: g.portrait ? -300 : 0 } });
    // fraîcheur dans les ombres hautes, à gauche
    g.screen((c, W, H) => {
      c.globalCompositeOperation = 'multiply';
      const gr = c.createLinearGradient(0, 0, W * 0.55, H * 0.7);
      gr.addColorStop(0, 'rgba(120,132,168,1)'); gr.addColorStop(1, 'rgba(255,255,255,1)');
      c.fillStyle = gr; c.fillRect(0, 0, W, H);
    });
  },
  shots: {
    // La porte s'ouvre ; la personne paraît dans l'embrasure, puis fait un pas
    entree: {
      dur: 7,
      cam: (t, portrait) => {
        const k = seg(t, 0, 7, ease.inOut);
        return { x: lerp(portrait ? 948 : 958, portrait ? 942 : 948, k), y: lerp(522, 505, k), z: lerp(1.04, 1.1, k) };
      },
      p: (t) => {
        // elle pousse la porte, entre dans l'embrasure en marchant, s'arrête, puis fait un pas
        const a = seg(t, 1.5, 3.5, ease.inOut), b = seg(t, 4.3, 6.1, ease.inOut);
        return {
          door: seg(t, 0.8, 3.4, ease.inOut),
          figure: 0.461 * a + 0.539 * b, sens: 1,
          main: seg(t, 3.0, 3.8, ease.inOut) * (1 - seg(t, 4.2, 4.9, ease.inOut)),
          pas: 0.7 * Math.sin(Math.PI * seg(t, 1.5, 3.5, ease.lin)) + 0.85 * Math.sin(Math.PI * seg(t, 4.3, 6.1, ease.lin)),
        };
      },
    },
    // De dos, elle repart ; la main tire la porte, qui se referme lentement
    sortie: {
      dur: 6,
      cam: (t, portrait) => {
        const k = seg(t, 0, 6, ease.inOut);
        return { x: lerp(portrait ? 944 : 952, portrait ? 946 : 958, k), y: lerp(530, 522, k), z: lerp(1.08, 1.04, k) };
      },
      p: (t) => ({
        door: 1 - seg(t, 1.1, 5.6, ease.inOut),
        figure: seg(t, 0.1, 4.6, ease.inOut), sens: -1,
        pas: Math.pow(Math.sin(Math.PI * seg(t, 0.1, 4.6, ease.lin)), 0.6),
        main: seg(t, 0.45, 1.0, ease.inOut) * (1 - seg(t, 1.35, 1.9, ease.inOut)),
      }),
    },
    // La porte se referme sans personne ; la lumière se resserre
    'sortie-vide': {
      dur: 5,
      cam: (t, portrait) => {
        const k = seg(t, 0, 5, ease.inOut);
        return { x: lerp(portrait ? 944 : 955, portrait ? 946 : 958, k), y: lerp(518, 524, k), z: lerp(1.06, 1.03, k) };
      },
      p: (t) => ({ door: 1 - seg(t, 0.4, 4.4, ease.inOut) }),
    },
  },
};
