/* ==========================================================================
   Décor « a2-couple » — plan moyen : le couple debout devant la grande
   fenêtre de l'appartement, en contre-jour (pendant du plan « personne » de
   l'Acte 1). A, devant, appuie la tête contre l'épaule de B, qui l'entoure
   d'un bras ; tous deux regardent dehors, vers les toits et l'arbre roux.
   Profils vers la gauche, tournés vers la vitre ; la main de A vient se
   poser sur celle de B.
   Matin d'automne : le soleil, bas et plus blanc, entre par la gauche ;
   liseré de lumière dorée sur les cheveux, les profils et les épaules,
   poussière dans les rayons, voilage blanc flou de part et d'autre de la
   vitre, une plante d'intérieur très floue au premier plan à droite.

   Paramètres (p) :
     close  0 → 1   A ferme les yeux
     turn   0 → 1   B tourne légèrement la tête vers elle
   ========================================================================== */
import { rng } from '../kit.js';
import { TAU, seg, ease, lerp, clamp } from '../../film/engine.js';

/* ---------- Outils de tracé ---------- */

const f1 = (v) => +v.toFixed(1);
const xy = (p) => `${f1(p[0])} ${f1(p[1])}`;

// Courbe lisse (Catmull-Rom → Bézier) le long d'une suite de points, de
// l'indice i0 à i1. Un point [x, y, 1] marque un angle vif.
function arc(a, i0, i1, closed = true) {
  const n = a.length;
  const at = (i) => (closed ? a[((i % n) + n) % n] : a[Math.max(0, Math.min(n - 1, i))]);
  const k = 1 / 6;
  let d = `M${xy(at(i0))}`;
  for (let i = i0; i < i1; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${xy(c1)} ${xy(c2)} ${xy(p2)}`;
  }
  return d;
}
const shape = (a) => arc(a, 0, a.length) + 'Z';
const open = (a) => arc(a, 0, a.length - 1, false);

// Membre : contour d'un tube le long d'un axe, rayons variables, bouts ronds
const norm = ([x, y]) => { const m = Math.hypot(x, y) || 1; return [x / m, y / m]; };
function tube(c, r) {
  const n = c.length, A = [], B = [];
  const tan = (i) => norm([c[Math.min(n - 1, i + 1)][0] - c[Math.max(0, i - 1)][0], c[Math.min(n - 1, i + 1)][1] - c[Math.max(0, i - 1)][1]]);
  for (let i = 0; i < n; i++) {
    const [tx, ty] = tan(i);
    A.push([c[i][0] - ty * r[i], c[i][1] + tx * r[i]]);
    B.push([c[i][0] + ty * r[i], c[i][1] - tx * r[i]]);
  }
  const cap = (i, angles) => {
    const [tx, ty] = tan(i);
    return angles.map((a) => [c[i][0] + r[i] * (Math.cos(a) * tx - Math.sin(a) * ty), c[i][1] + r[i] * (Math.cos(a) * ty + Math.sin(a) * tx)]);
  };
  const q = Math.PI / 4;
  return [...A, ...cap(n - 1, [q, 0, -q]), ...B.reverse(), ...cap(0, [-3 * q, Math.PI, 3 * q])];
}

// Dégradés en coordonnées du décor
const stops = (s) => s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
const grad = (id, x1, y1, x2, y2, s) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}">${stops(s)}</linearGradient>`;
const radial = (id, cx, cy, r, s, fx = cx, fy = cy) =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fx="${f1(fx)}" fy="${f1(fy)}">${stops(s)}</radialGradient>`;
const blur = (id, s) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`;

// Touche de brosse : la couleur n'apparaît que par plaques allongées
const brosse = (id, fx, fy, seed, gain = 3, cut = 1.25) =>
  `<filter id="${id}" filterUnits="objectBoundingBox" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="3" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${gain} 0 0 0 -${cut}" result="a"/>` +
  `<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>`;

// Filtres communs aux calques des personnages
const FDEFS =
  blur('a2-couple-f1', 1) + blur('a2-couple-f2', 2) + blur('a2-couple-f3', 3) + blur('a2-couple-f4', 4) +
  blur('a2-couple-f6', 6) + blur('a2-couple-f10', 10) + blur('a2-couple-f16', 16) +
  brosse('a2-couple-br1', 0.035, 0.009, 8) + brosse('a2-couple-br2', 0.05, 0.012, 21, 3, 1.4) +
  brosse('a2-couple-br3', 0.012, 0.05, 5, 3, 1.3) + brosse('a2-couple-br4', 0.05, 0.02, 14);

// Liseré de contre-jour : trait clair le long d'un bord, gardé dans la forme
const RIM = '#ffd9a2', CORE = '#fff3d8';
const rim = (d, clip, w, core = 0, color = RIM, fb = 'a2-couple-f2') =>
  `<g clip-path="url(#${clip})">` +
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${fb})"/>` +
  (core ? `<path d="${d}" fill="none" stroke="${CORE}" stroke-width="${core}" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>` : '') +
  '</g>';

// Repère local d'une tête : translate(x y) scale(s) rotate(r autour de px, py)
const htf = (H) => `translate(${H.x} ${H.y}) scale(${H.s}) rotate(${H.r} ${H.px} ${H.py})`;
const hpiv = (H) => [H.x + H.s * H.px, H.y + H.s * H.py];

/* ---------- Couleurs du plan (contre-jour du matin) ---------- */
// B a la peau claire (#e8bfa0, ombre #c4927a) : même à contre-jour, sa peau
// reste rosée et nettement plus claire que celle de A, mate (#c9946f).
const CB = {
  skin: '#956350', skinLit: '#b98068', skinMid: '#7a5040', skinDeep: '#5e3c31',
  hair: '#24180f', hairDeep: '#140d09', hairLit: '#4d3626', beard: '#2c1d15',
  pull: '#22342b', pullDark: '#16221c', pullLight: '#3a5646', pants: '#1f2125',
};
const CA = {
  skin: '#4f3127', skinLit: '#6e4433', skinDeep: '#2f1c15',
  hair: '#1b110c', hairDeep: '#0e0806', hairLit: '#41291d',
  gilet: '#60291c', giletDark: '#3e1912', giletLight: '#8a3c27', top: '#9a8f7e', pants: '#8f8676',
};

/* ==========================================================================
   B : la tête (repère local : origine en haut du cou, profil vers la gauche)
   ========================================================================== */
const HB = { x: 1251, y: 314, s: 0.84, r: -3, px: 10, py: 45 };
// B se penche un peu vers elle : le buste glisse vers la gauche avec la hauteur
const LEAN_B = 'matrix(1 0 0.03 1 -30 0)';
const LEAN_A = 'matrix(1 0 -0.05 1 30 0)'; // A s'appuie contre lui : les hanches avancent

// Visage d'homme : front droit, arcade marquée, nez droit, barbe courte
const HEAD_B = [
  [-50, 132], [-51, 100], [-53, 70], [-58, 46], // 0-3 cou
  [-70, 30], [-86, 22], // 4-5 sous la barbe
  [-100, 13], [-108, 1], [-110.5, -12], // 6-8 menton barbu
  [-110, -20], [-108.5, -25], [-111, -30], [-113, -36], // 9-12 lèvre, moustache
  [-118, -40], [-125, -46], [-122, -55], [-116, -68], [-111, -80], // 13-17 nez
  [-113.5, -89], [-112, -101], [-107, -121], [-96, -142], // 18-21 arcade, front
  [-76, -160], [-46, -172], [-12, -174], [20, -168], [46, -150], // 22-26 crâne
  [62, -124], [66, -94], [60, -64], [50, -38], [40, -16], // 27-31 arrière
  [36, 20], [38, 60], [40, 100], [42, 132], // 32-35 nuque
];
// Cheveux courts : un peu de volume en désordre sur le dessus, côtés courts
const HAIR_B = [
  [-100, -122], [-105, -137], [-103, -151], [-97, -165, 1], [-90, -170], [-76, -185, 1], [-63, -186], // 0-6 avant, mèche relevée
  [-48, -194, 1], [-32, -193], [-16, -198, 1], [2, -193], [18, -191, 1], [33, -181], [47, -170, 1], [58, -153], // 7-14 dessus
  [66, -131], [70, -104], [67, -76], [61, -50], [54, -22], [48, 12], // 15-20 arrière, court, jusqu'à la nuque
  [32, 0], [10, -24], [-8, -40], [-24, -50], // 21-24 nuque, derrière l'oreille, favori
  [-30, -70], [-38, -88], [-54, -103], [-74, -113], [-92, -118], // 25-29 tempe, ligne du front
];
// Barbe courte et soignée, qui suit la mâchoire
const BEARD_B = [
  [-26, -52], [-20, -32], [-8, -14], [4, 2], // 0-3 favori, angle de la mâchoire
  [-8, 24], [-36, 34], [-62, 34], [-84, 25], [-100, 15], [-108.5, 2], [-111.5, -11], [-111, -20], // 4-11 dessous, menton
  [-104, -24], [-95, -25], [-83, -29], [-67, -33], [-50, -38], [-34, -46], // 12-17 bord de la joue
];
const MOUST_B = [[-114, -37], [-104, -41], [-92, -37], [-95, -31], [-106, -28.5], [-111.5, -31]];
const EAR_B = [[-6, -79], [6, -77], [14, -64], [14, -47], [8, -33], [-2, -27], [-8, -33], [-6, -46], [-10, -58], [-12, -71]];

const TETE_B = `
<defs>
  <clipPath id="a2-couple-cb-peau"><path d="${shape(HEAD_B)}"/></clipPath>
  <clipPath id="a2-couple-cb-cheveux"><path d="${shape(HAIR_B)}"/></clipPath>
  <clipPath id="a2-couple-cb-barbe"><path d="${shape(BEARD_B)}"/></clipPath>
  <clipPath id="a2-couple-cb-oreille"><path d="${shape(EAR_B)}"/></clipPath>
  ${grad('a2-couple-b-peau', -125, 0, 50, 0, [[0, CB.skinLit], [0.25, CB.skin], [0.7, CB.skinMid], [1, CB.skinDeep]])}
  ${radial('a2-couple-b-rebond', -92, -70, 70, [[0, '#f4c6a6', 0.5], [0.5, '#eab092', 0.22], [1, '#e4a688', 0]])}
  ${grad('a2-couple-b-meche', -110, 0, 75, 0, [[0, '#3a281c'], [0.4, CB.hair], [1, CB.hairDeep]])}
  ${grad('a2-couple-b-barbe', -115, 0, 10, 0, [[0, '#4a3223'], [0.5, '#33231a'], [1, '#22160f']])}
  ${FDEFS}
</defs>
<g transform="${htf(HB)}">
  <path d="${shape(HEAD_B)}" fill="url(#a2-couple-b-peau)"/>
  <g clip-path="url(#a2-couple-cb-peau)">
    <!-- le cou dans l'ombre de la barbe -->
    <path d="M-100 14 C-80 30 -40 34 0 24 L80 10 L80 150 L-110 150 Z" fill="${CB.skinDeep}" opacity="0.8" filter="url(#a2-couple-f4)"/>
    <!-- ombre portée de la mâchoire sur le cou, plus douce en descendant -->
    <path d="M-104 16 C-80 34 -40 40 4 28 L70 14 L70 62 C10 70 -50 66 -104 50 Z" fill="#4a2e26" opacity="0.4" filter="url(#a2-couple-f6)"/>
    <!-- rebond doux de la pièce sur le visage : joue, pommette, front -->
    <ellipse cx="-88" cy="-70" rx="70" ry="68" fill="url(#a2-couple-b-rebond)" filter="url(#a2-couple-f6)"/>
    <ellipse cx="-96" cy="-112" rx="16" ry="11" fill="#eab496" opacity="0.25" filter="url(#a2-couple-f6)"/>
    <!-- l'arrière du visage, vers l'oreille, reste dans l'ombre du contre-jour -->
    <ellipse cx="-20" cy="-70" rx="34" ry="56" fill="${CB.skinDeep}" opacity="0.35" filter="url(#a2-couple-f10)"/>
    <path d="M-30 -40 C-18 -20 -6 -4 6 6" fill="none" stroke="${CB.skinDeep}" stroke-width="16" opacity="0.3" filter="url(#a2-couple-f6)"/>
    <!-- joue rosée de peau claire -->
    <ellipse cx="-78" cy="-52" rx="18" ry="12" fill="#d0806c" opacity="0.3" filter="url(#a2-couple-f6)"/>
    <!-- orbite dans l'ombre de l'arcade -->
    <ellipse cx="-97" cy="-76" rx="13" ry="8" fill="${CB.skinDeep}" opacity="0.45" filter="url(#a2-couple-f3)"/>
    <!-- rebond chaud sur le cou -->
    <path d="M-52 50 C-48 74 -46 100 -44 130" fill="none" stroke="#c28c74" stroke-width="10" opacity="0.45" filter="url(#a2-couple-f4)"/>
  </g>
  ${rim(arc(HEAD_B, 11, 22), 'a2-couple-cb-peau', 7, 0, '#f0b088', 'a2-couple-f1')}
  ${rim(arc(HEAD_B, 12, 22), 'a2-couple-cb-peau', 2.6, 0, '#fff2d8', 'a2-couple-f1')}
  ${rim(arc(HEAD_B, 0, 5), 'a2-couple-cb-peau', 7, 0, '#c9906c', 'a2-couple-f3')}
  <!-- cheveux courts -->
  <path d="${shape(HAIR_B)}" fill="url(#a2-couple-b-meche)"/>
  <g clip-path="url(#a2-couple-cb-cheveux)" fill="none" stroke-linecap="round">
    <path d="M-90 -178 C-50 -198 10 -198 50 -172" stroke="#5e4232" stroke-width="12" opacity="0.4" filter="url(#a2-couple-f4)"/>
    <path d="M-98 -150 C-74 -172 -36 -184 10 -182 C30 -178 46 -168 56 -156" stroke="${CB.hairDeep}" stroke-width="3" opacity="0.5" filter="url(#a2-couple-f1)"/>
    <path d="M-86 -132 C-56 -154 -10 -164 40 -150" stroke="${CB.hairDeep}" stroke-width="3" opacity="0.45" filter="url(#a2-couple-f1)"/>
    <path d="M-70 -112 C-40 -128 10 -134 56 -116" stroke="${CB.hairDeep}" stroke-width="3" opacity="0.4" filter="url(#a2-couple-f1)"/>
    <path d="M-88 -170 C-60 -186 -20 -190 30 -182" stroke="${CB.hairLit}" stroke-width="1.4" opacity="0.6"/>
    <path d="M24 -176 C48 -158 62 -128 64 -86" stroke="${CB.hairLit}" stroke-width="1.4" opacity="0.4"/>
    <!-- côtés courts, plus sombres et plus serrés -->
    <path d="M-20 -60 C10 -70 40 -70 66 -60 L80 -10 L-30 -10 Z" fill="${CB.hairDeep}" stroke="none" opacity="0.4" filter="url(#a2-couple-f4)"/>
  </g>
  ${rim(arc(HAIR_B, 0, 12), 'a2-couple-cb-cheveux', 9, 2.2)}
  ${rim(arc(HAIR_B, 11, 17), 'a2-couple-cb-cheveux', 5, 0, '#c99d74', 'a2-couple-f2')}
  <g fill="none" stroke="${RIM}" stroke-width="1" stroke-linecap="round" opacity="0.7">
    <path d="M-96 -170 l-7 -5 M-80 -184 l-5 -6 M-56 -193 l-2 -7 M-36 -198 l1 -6 M-14 -197 l3 -6 M8 -194 l4 -5 M30 -185 l6 -4 M50 -170 l6 -2"/>
  </g>
  <!-- oreille : la lumière la traverse, bord rouge-orangé -->
  <path d="${shape(EAR_B)}" fill="#8c5a4c"/>
  <g clip-path="url(#a2-couple-cb-oreille)">
    <path d="${arc(EAR_B, 0, 5)}" fill="none" stroke="#e6866a" stroke-width="7" opacity="0.65" filter="url(#a2-couple-f2)"/>
    <path d="M2 -66 C8 -58 8 -46 2 -38" fill="none" stroke="#5a3529" stroke-width="3" opacity="0.6" filter="url(#a2-couple-f1)"/>
  </g>
  <!-- barbe courte : masse nette, bord de la joue fondu dans la peau -->
  <g clip-path="url(#a2-couple-cb-peau)">
    <path d="${shape(BEARD_B)}" fill="url(#a2-couple-b-barbe)" opacity="0.92"/>
    <path d="${arc(BEARD_B, 12, 18)}" fill="none" stroke="${CB.skin}" stroke-width="9" opacity="0.55" filter="url(#a2-couple-f3)"/>
    <g clip-path="url(#a2-couple-cb-barbe)" fill="none" stroke-linecap="round">
      <path d="M-100 8 C-80 20 -50 26 -14 8" stroke="#140c08" stroke-width="10" opacity="0.4" filter="url(#a2-couple-f4)"/>
      ${Array.from({ length: 22 }, (_, i) => { const x = -106 + i * 4.8; const y = -16 + Math.abs(x + 60) * 0.1 + (i % 3) * 7; return `<path d="M${f1(x)} ${f1(y)} l${-1.5 - (i % 3)} 8" stroke="${i % 2 ? '#5e4232' : '#1e130d'}" stroke-width="1.2" opacity="0.5"/>`; }).join('')}
    </g>
  </g>
  ${rim(arc(BEARD_B, 6, 12), 'a2-couple-cb-peau', 6, 1.4)}
  <g fill="none" stroke="${RIM}" stroke-width="0.9" stroke-linecap="round" opacity="0.75">
    <path d="M-106 9 l-4 4 M-110 -1 l-5 2 M-112 -10 l-5 0 M-111 -18 l-4 -2 M-96 18 l-3 5"/>
  </g>
  <path d="${shape(MOUST_B)}" fill="#3a281d" opacity="0.75" filter="url(#a2-couple-f1)"/>
  <path d="M-109 -25 L-100 -25.5" fill="none" stroke="#24150f" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>
  <!-- sourcil, narine -->
  <g fill="none" stroke-linecap="round">
    <path d="M-112 -91 C-104 -94.5 -94 -95.5 -84 -94" stroke="#1a100b" stroke-width="3.6" opacity="0.7"/>
    <path d="M-121 -43 C-118 -46 -115 -46 -113 -44" stroke="#5e3a30" stroke-width="1.8" opacity="0.7"/>
  </g>
</g>`;

/* ==========================================================================
   B : le corps (pull vert forêt, ras du cou), en partie derrière A
   ========================================================================== */
const TORSE_B = [
  [1234, 382], [1214, 412], [1199, 458], [1192, 540], [1190, 630], [1194, 720], [1198, 820], [1202, 940], [1204, 1250], // 0-8 devant
  [1300, 1270], // 9 (hors cadre)
  [1386, 1250], [1390, 1010], [1386, 920], [1376, 820], [1370, 720], [1376, 620], [1380, 540], [1374, 470], [1360, 416], [1338, 378], [1310, 358], // 10-20 dos, trapèze
];
const CORPS_B = `
<defs>
  <clipPath id="a2-couple-cb-torse"><path d="${shape(TORSE_B)}"/></clipPath>
  ${grad('a2-couple-b-pull', 1180, 0, 1395, 0, [[0, '#2c4437'], [0.35, CB.pull], [0.85, CB.pullDark], [1, '#1a2721']])}
  ${grad('a2-couple-b-jambe', 1190, 0, 1395, 0, [[0, '#2a2c31'], [0.6, CB.pants], [1, '#131417']])}
  ${FDEFS}
</defs>
<g transform="${LEAN_B}">
<path d="${shape(TORSE_B)}" fill="url(#a2-couple-b-pull)"/>
<g clip-path="url(#a2-couple-cb-torse)">
  <rect x="1180" y="400" width="120" height="540" fill="${CB.pullLight}" opacity="0.35" filter="url(#a2-couple-br1)"/>
  <rect x="1290" y="400" width="110" height="540" fill="#0d1511" opacity="0.35" filter="url(#a2-couple-br2)"/>
  <!-- pantalon sombre sous le bas du pull -->
  <path d="M1180 900 C1260 912 1330 914 1400 902 L1400 1260 L1180 1260 Z" fill="url(#a2-couple-b-jambe)"/>
  <!-- bord-côte du pull -->
  <path d="M1190 880 C1260 892 1330 894 1400 882 L1400 914 C1330 926 1260 924 1190 912 Z" fill="#1b2a22"/>
  <g stroke="#0f1814" stroke-width="2" opacity="0.6">
    ${Array.from({ length: 24 }, (_, i) => { const x = 1196 + i * 8.5; return `<line x1="${x}" y1="${f1(888 + Math.sin(i) * 1.5)}" x2="${x - 1}" y2="${918}"/>`; }).join('')}
  </g>
  <!-- plis du pull : le dos, les reins -->
  <g fill="none" stroke-linecap="round" filter="url(#a2-couple-f3)">
    <path d="M1360 520 C1350 600 1352 680 1362 760" stroke="#0b120e" stroke-width="10" opacity="0.4"/>
    <path d="M1240 840 C1280 862 1330 866 1370 856" stroke="#0b120e" stroke-width="7" opacity="0.5"/>
  </g>
  <!-- rebond chaud de la pièce, bas du dos -->
  <path d="M1380 700 C1384 780 1384 860 1380 940" fill="none" stroke="#6a5a48" stroke-width="16" opacity="0.3" filter="url(#a2-couple-f6)"/>
  <!-- col ras du cou, en côtes -->
  <path d="M1226 378 C1252 382 1286 372 1312 354 L1320 374 C1292 394 1252 406 1222 400 Z" fill="#203229"/>
  <!-- la lumière enveloppe le haut du dos -->
  <path d="M1320 420 C1360 440 1386 480 1388 560" fill="none" stroke="#5f7d68" stroke-width="22" opacity="0.4" filter="url(#a2-couple-f10)"/>
</g>
${rim(arc(TORSE_B, 16, 20), 'a2-couple-cb-torse', 11, 2.2)}
${rim(arc(TORSE_B, 13, 17), 'a2-couple-cb-torse', 6, 0, '#a6a088', 'a2-couple-f3')}
${rim(arc(TORSE_B, 0, 3), 'a2-couple-cb-torse', 7, 1.2)}
</g>
`;

/* ==========================================================================
   A : la tête (même repère), le corps, le bras de B posé sur son épaule
   ========================================================================== */
const HA = { x: 1172, y: 504, s: 0.8, r: 10, px: 10, py: 40 };

// Visage de femme : front arrondi, petit nez, lèvres pleines, menton doux
const HEAD_A = [
  [-44, 128], [-46, 94], [-50, 62], [-56, 36], // 0-3 cou
  [-68, 20], [-82, 12], // 4-5 sous le menton
  [-92, 4], [-97, -5], [-96, -13], // 6-8 menton
  [-99, -18], [-100.5, -22], [-96.5, -26, 1], [-100.5, -30], [-99, -35], // 9-13 lèvres
  [-103, -38], [-110, -44], [-108, -52], [-103, -63], [-99, -74], // 14-18 nez
  [-100, -84], [-101, -98], [-97, -118], [-86, -138], // 19-22 front
  [-66, -154], [-38, -162], [-8, -164], [22, -158], [44, -142], // 23-27 crâne
  [58, -118], [62, -90], [56, -62], [44, -38], [30, -16], // 28-32 arrière
  [24, 20], [25, 58], [28, 94], [31, 128], // 33-36 nuque
];
// Cheveux longs tirés en arrière, chignon bas et lâche sur la nuque
const HAIR_A = [
  [-95, -126], [-98, -144], [-92, -161], [-78, -175], [-56, -185], // 0-4 avant
  [-28, -189], [4, -186], [32, -176], [54, -158], [67, -134], // 5-9 dessus
  [73, -108], [73, -82], [70, -62], // 10-12 arrière
  [82, -60], [98, -53], [110, -37], [113, -16], [107, 4], [93, 16], [74, 20], [57, 13], [45, 1], // 13-21 chignon
  [33, -7], [19, -15], // 22-23 nuque
  [4, -22], [-10, -30], [-20, -44], // 24-26 mèches sur l'oreille
  [-28, -64], [-38, -86], [-54, -104], [-74, -118], // 27-30 tempe, ligne du front
];
const STRANDS_A = [
  'M-74 -178 C-52 -193 -22 -195 4 -191', 'M44 -164 C62 -151 73 -131 77 -108', 'M-94 -150 C-100 -140 -102 -128 -101 -118',
  'M110 -34 C121 -24 123 -6 116 12', 'M76 -60 C86 -64 96 -62 104 -56',
];

// Corps : gilet en maille terre cuite, un peu ample ; haut crème au col
const TORSE_A = [
  [1126, 554], [1112, 574], [1098, 604], [1088, 644], [1082, 690], [1084, 728], [1092, 762], // 0-6 devant, poitrine
  [1096, 800], [1094, 860], [1090, 940], [1088, 1040], [1090, 1250], // 7-11 le gilet tombe
  [1170, 1265], // 12 (hors cadre)
  [1258, 1250], [1258, 1100], [1260, 1000], [1252, 920], [1238, 850], [1228, 780], [1230, 700], [1234, 640], [1226, 598], [1208, 570], [1190, 556], // 13-23 dos
];
// Bras proche de A : il pend le long du corps, coude un peu plié
const ARM_A = tube([[1158, 598], [1161, 680], [1168, 770], [1160, 860], [1140, 960]], [33, 31, 28, 26, 24]);

// Bras de B : de son épaule, par-dessus l'épaule de A ; la main posée devant
const ARM_B = tube([[1290, 466], [1260, 490], [1228, 515], [1196, 541], [1168, 566]], [38, 35, 31, 28, 24]);
const ARM_B_TOP = [[1296, 430], [1262, 455], [1230, 480], [1198, 506], [1172, 540]];
const HAND_B = [
  [1180, 547], [1162, 551], [1144, 556], [1128, 561], [1115, 568], [1105, 578], [1099, 591], [1098, 603], // 0-7 dos de la main, jointures, doigts
  [1103, 611], [1110, 609], [1114, 600], [1120, 592], // 8-11 bout des doigts sur le devant de l'épaule
  [1132, 588], [1148, 586], [1164, 584], [1178, 580], [1186, 568], // 12-16 tranche de la main, poignet
];

// L'autre bras de A passe devant sa poitrine ; sa main se pose sur celle de B
const ARM_A2 = tube([[1064, 776], [1070, 726], [1082, 676], [1098, 632]], [24, 23, 21, 19]);
const HAND_A = [
  [1086, 640], [1090, 620], [1098, 604], [1108, 592], [1120, 582], [1132, 574], [1141, 571], // 0-6 dos de la main, doigts
  [1145, 576], [1139, 584], [1129, 594], [1121, 606], [1115, 620], [1109, 634], [1098, 644], // 7-13 bout des doigts, paume
];

const CORPS_A = `
<defs>
  <clipPath id="a2-couple-ca-peau"><path d="${shape(HEAD_A)}"/></clipPath>
  <clipPath id="a2-couple-ca-cheveux"><path d="${shape(HAIR_A)}"/></clipPath>
  <clipPath id="a2-couple-ca-torse"><path d="${shape(TORSE_A)}"/></clipPath>
  <clipPath id="a2-couple-ca-bras"><path d="${shape(ARM_A)}"/></clipPath>
  <clipPath id="a2-couple-cb-bras"><path d="${shape(ARM_B)}"/></clipPath>
  <clipPath id="a2-couple-cb-main"><path d="${shape(HAND_B)}"/></clipPath>
  <clipPath id="a2-couple-ca-bras2"><path d="${shape(ARM_A2)}"/></clipPath>
  <clipPath id="a2-couple-ca-main"><path d="${shape(HAND_A)}"/></clipPath>
  ${grad('a2-couple-a-manche2', 1040, 0, 1110, 0, [[0, '#6a2c1d'], [0.5, '#52221a'], [1, '#381610']])}
  ${grad('a2-couple-a-main', 1090, 640, 1140, 572, [[0, '#3a2219'], [0.6, '#4f3124'], [1, '#6e4835']])}
  ${grad('a2-couple-a-peau', -112, 0, 60, 0, [[0, CA.skinLit], [0.25, CA.skin], [0.7, '#3f271e'], [1, CA.skinDeep]])}
  ${radial('a2-couple-a-rebond', -80, -58, 62, [[0, '#d8a072', 0.3], [0.5, '#c98f62', 0.12], [1, '#c08658', 0]])}
  ${grad('a2-couple-a-meche', -105, 0, 115, 0, [[0, '#33231a'], [0.45, CA.hair], [1, CA.hairDeep]])}
  ${grad('a2-couple-a-gilet', 1080, 0, 1262, 0, [[0, '#743322'], [0.35, CA.gilet], [0.85, CA.giletDark], [1, '#2e130d']])}
  ${grad('a2-couple-a-manche', 1124, 0, 1194, 0, [[0, '#6e3020'], [0.5, CA.gilet], [1, CA.giletDark]])}
  ${grad('a2-couple-b-manche', 0, 440, 0, 600, [[0, '#3b5949'], [0.4, CB.pull], [1, CB.pullDark]])}
  ${grad('a2-couple-b-main', 1100, 555, 1170, 605, [[0, '#b88a74'], [0.45, CB.skin], [1, CB.skinDeep]])}
  ${FDEFS}
</defs>
<!-- le visage et le cou de A -->
<g transform="${htf(HA)}">
  <path d="${shape(HEAD_A)}" fill="url(#a2-couple-a-peau)"/>
  <g clip-path="url(#a2-couple-ca-peau)">
    <path d="M-94 8 C-80 20 -60 24 -36 18 L80 2 L80 150 L-110 150 Z" fill="${CA.skinDeep}" opacity="0.75" filter="url(#a2-couple-f4)"/>
    <ellipse cx="-78" cy="-44" rx="24" ry="22" fill="#7e4a37" opacity="0.4" filter="url(#a2-couple-f6)"/>
    <!-- le même rebond de la pièce que sur B, plus faible et doré : A reste mate -->
    <ellipse cx="-80" cy="-58" rx="62" ry="62" fill="url(#a2-couple-a-rebond)" filter="url(#a2-couple-f6)"/>
    <ellipse cx="-88" cy="-70" rx="11" ry="7" fill="${CA.skinDeep}" opacity="0.45" filter="url(#a2-couple-f3)"/>
    <path d="M-52 40 C-48 64 -46 90 -44 120" fill="none" stroke="#7a4a36" stroke-width="9" opacity="0.4" filter="url(#a2-couple-f4)"/>
  </g>
  ${rim(arc(HEAD_A, 4, 23), 'a2-couple-ca-peau', 6, 0, '#e09670', 'a2-couple-f1')}
  ${rim(arc(HEAD_A, 7, 23), 'a2-couple-ca-peau', 2.4, 0, '#ffedd2', 'a2-couple-f1')}
  ${rim(arc(HEAD_A, 0, 4), 'a2-couple-ca-peau', 7, 0, '#b97a58', 'a2-couple-f3')}
  <g fill="none" stroke-linecap="round">
    <path d="M-100 -83 C-94 -85.5 -86 -86 -78 -84.5" stroke="#150c08" stroke-width="2.4" opacity="0.6"/>
    <path d="M-107 -41 C-105 -43.5 -103 -43.5 -101 -42" stroke="#24150f" stroke-width="1.6" opacity="0.7"/>
    <path d="M-97 -26 L-91 -25.5" stroke="#1e100b" stroke-width="1.4" opacity="0.6"/>
  </g>
</g>
<g transform="${LEAN_A}">
<!-- le corps : haut crème au col, gilet terre cuite -->
<path d="${shape(TORSE_A)}" fill="url(#a2-couple-a-gilet)"/>
<g clip-path="url(#a2-couple-ca-torse)">
  <rect x="1080" y="550" width="110" height="560" fill="${CA.giletLight}" opacity="0.35" filter="url(#a2-couple-br3)"/>
  <rect x="1180" y="550" width="80" height="560" fill="#220c08" opacity="0.35" filter="url(#a2-couple-br2)"/>
  <!-- le haut crème au col, puis dans l'ombre sous le gilet ouvert -->
  <path d="M1122 552 C1148 560 1174 560 1196 554 L1196 574 C1170 584 1140 582 1114 572 Z" fill="${CA.top}" opacity="0.85"/>
  <path d="M1112 570 C1098 604 1088 644 1083 690 C1082 720 1086 750 1092 770 L1100 770 C1096 740 1094 712 1096 690 C1100 650 1108 612 1120 576 Z" fill="${CA.top}" opacity="0.4"/>
  <path d="M1104 600 C1110 650 1112 700 1108 760 C1106 860 1104 980 1104 1100" fill="none" stroke="#260e08" stroke-width="6" opacity="0.55" filter="url(#a2-couple-f2)"/>
  <path d="M1092 772 C1100 790 1104 800 1106 812" fill="none" stroke="#220c07" stroke-width="5" opacity="0.5" filter="url(#a2-couple-f3)"/>
  <!-- maille : côtes verticales très douces -->
  <g stroke="#2a0f09" stroke-width="1.6" opacity="0.22">
    ${Array.from({ length: 14 }, (_, i) => { const x = 1112 + i * 10; return `<path d="M${x} 640 C${x + 2} 760 ${x - 2} 900 ${x} 1100" fill="none"/>`; }).join('')}
  </g>
  <!-- le dos, dans l'ombre de B -->
  <path d="M1206 590 C1232 640 1238 720 1232 800" fill="none" stroke="#1c0904" stroke-width="22" opacity="0.4" filter="url(#a2-couple-f10)"/>
  <!-- rebond chaud de la pièce sur le devant -->
  <path d="M1090 700 C1096 780 1096 860 1092 960" fill="none" stroke="#a0603f" stroke-width="16" opacity="0.3" filter="url(#a2-couple-f6)"/>
</g>
${rim(arc(TORSE_A, 0, 6), 'a2-couple-ca-torse', 8, 1.6)}
${rim(arc(TORSE_A, 6, 11), 'a2-couple-ca-torse', 5, 0, '#e2a57c', 'a2-couple-f3')}
<!-- le bras de A, qui pend, détaché du flanc par l'ombre -->
<path d="${shape(ARM_A)}" fill="#160603" opacity="0.5" filter="url(#a2-couple-f3)" transform="translate(5 3)"/>
<path d="${shape(ARM_A)}" fill="url(#a2-couple-a-manche)"/>
<g clip-path="url(#a2-couple-ca-bras)">
  <rect x="1110" y="580" width="60" height="400" fill="${CA.giletLight}" opacity="0.35" filter="url(#a2-couple-br3)"/>
  <path d="M1188 610 C1194 700 1196 780 1186 860" fill="none" stroke="#240e09" stroke-width="12" opacity="0.5" filter="url(#a2-couple-f3)"/>
  <path d="M1136 760 C1150 772 1170 774 1192 766" fill="none" stroke="#240e09" stroke-width="4" opacity="0.5" filter="url(#a2-couple-f2)"/>
</g>
${rim(open([[1126, 600], [1128, 680], [1137, 770], [1130, 860]]), 'a2-couple-ca-bras', 6, 1)}
</g>
<!-- le bras de B par-dessus son épaule, sa main posée devant -->
<path d="${shape(ARM_B)}" fill="#120604" opacity="0.5" filter="url(#a2-couple-f4)" transform="translate(-2 8)"/>
<path d="${shape(ARM_B)}" fill="url(#a2-couple-b-manche)"/>
<g clip-path="url(#a2-couple-cb-bras)">
  <rect x="1150" y="430" width="190" height="160" fill="${CB.pullLight}" opacity="0.4" filter="url(#a2-couple-br4)"/>
  <path d="M1240 534 C1220 550 1196 564 1172 584" fill="none" stroke="#0a110d" stroke-width="10" opacity="0.5" filter="url(#a2-couple-f3)"/>
  <!-- poignet côtelé -->
  <path d="M1190 540 L1172 584 L1152 582 L1168 538 Z" fill="#1b2a22" opacity="0.9"/>
</g>
${rim(open(ARM_B_TOP), 'a2-couple-cb-bras', 10, 2)}
<path d="${shape(HAND_B)}" fill="url(#a2-couple-b-main)"/>
<g clip-path="url(#a2-couple-cb-main)" fill="none" stroke-linecap="round">
  <!-- les doigts : séparations douces, jointures -->
  <path d="M1106 590 C1110 598 1112 604 1110 610 M1114 584 C1120 592 1122 598 1120 604" stroke="#5a382c" stroke-width="1.6" opacity="0.6"/>
  <path d="M1118 572 C1122 568 1128 566 1134 566 M1132 566 C1136 562 1142 561 1148 561" stroke="#e0b096" stroke-width="1.6" opacity="0.5"/>
  <path d="${arc(HAND_B, 11, 16)}" stroke="#4a2c22" stroke-width="7" opacity="0.5" filter="url(#a2-couple-f3)"/>
</g>
${rim(arc(HAND_B, 0, 7), 'a2-couple-cb-main', 5, 1)}
<!-- l'autre bras de A, devant sa poitrine, et sa main sur celle de B -->
<path d="${shape(ARM_A2)}" fill="#120503" opacity="0.45" filter="url(#a2-couple-f3)" transform="translate(4 4)"/>
<path d="${shape(ARM_A2)}" fill="url(#a2-couple-a-manche2)"/>
<g clip-path="url(#a2-couple-ca-bras2)">
  <rect x="1030" y="610" width="90" height="190" fill="${CA.giletLight}" opacity="0.3" filter="url(#a2-couple-br3)"/>
  <path d="M1074 650 L1102 660 L1094 690 L1066 680 Z" fill="#3a170f" opacity="0.6" filter="url(#a2-couple-f1)"/>
</g>
${rim(open([[1042, 770], [1048, 724], [1060, 676], [1078, 632]]), 'a2-couple-ca-bras2', 6, 1.2)}
<path d="${shape(HAND_A)}" fill="#120604" opacity="0.4" filter="url(#a2-couple-f2)" transform="translate(2 4)"/>
<path d="${shape(HAND_A)}" fill="url(#a2-couple-a-main)"/>
<g clip-path="url(#a2-couple-ca-main)" fill="none" stroke-linecap="round">
  <path d="M1112 600 C1120 594 1128 588 1136 582 M1106 610 C1116 604 1124 598 1132 592" stroke="#24130d" stroke-width="1.4" opacity="0.55"/>
</g>
${rim(arc(HAND_A, 1, 7), 'a2-couple-ca-main', 4, 0.8)}
<!-- les cheveux de A, par-dessus le bras de B : le chignon repose sur lui -->
<g transform="${htf(HA)}">
  <path d="${shape(HAIR_A)}" fill="url(#a2-couple-a-meche)"/>
  <g clip-path="url(#a2-couple-ca-cheveux)" fill="none" stroke-linecap="round">
    <path d="M-80 -172 C-40 -192 20 -188 60 -152" stroke="#4d3527" stroke-width="12" opacity="0.4" filter="url(#a2-couple-f4)"/>
    <path d="M-90 -142 C-60 -166 -10 -174 40 -158 C60 -148 70 -122 72 -92" stroke="${CA.hairDeep}" stroke-width="3" opacity="0.5" filter="url(#a2-couple-f1)"/>
    <path d="M-80 -120 C-50 -142 0 -148 50 -132 C66 -122 70 -98 68 -72" stroke="${CA.hairDeep}" stroke-width="3" opacity="0.45" filter="url(#a2-couple-f1)"/>
    <path d="M-62 -150 C-30 -170 10 -170 40 -152" stroke="${CA.hairLit}" stroke-width="1.4" opacity="0.3"/>
    <!-- le chignon : torsade lâche -->
    <path d="M72 -58 C100 -52 114 -30 108 -6 C102 12 80 20 60 12" stroke="${CA.hairDeep}" stroke-width="5" opacity="0.55" filter="url(#a2-couple-f2)"/>
    <path d="M80 -48 C98 -42 106 -24 100 -6" stroke="${CA.hairLit}" stroke-width="2" opacity="0.5"/>
    <path d="M62 -38 C80 -32 90 -16 84 2" stroke="${CA.hairLit}" stroke-width="1.6" opacity="0.4"/>
  </g>
  ${rim(arc(HAIR_A, 0, 10), 'a2-couple-ca-cheveux', 8, 2)}
  ${rim(arc(HAIR_A, 9, 16), 'a2-couple-ca-cheveux', 5, 0, '#c99a72', 'a2-couple-f2')}
  <g fill="none" stroke="${RIM}" stroke-width="0.8" stroke-linecap="round" opacity="0.55">
    ${STRANDS_A.map((d) => `<path d="${d}"/>`).join('')}
  </g>
</g>
`;

/* ==========================================================================
   Fond : mur crème dans l'ombre, grande fenêtre jusqu'à hauteur des
   hanches, vue floue sur les toits et l'arbre roux, appui et plantes
   ========================================================================== */
const WIN = { x0: 170, x1: 1640, top: -200, sill: 786, ox0: 120, ox1: 1714 };

// La ville au loin : des immeubles simples, façade éclairée à gauche par le
// soleil bas, toits à deux pentes ou terrasses, quelques cheminées
function ville(base, seed, hMin, hMax, C) {
  const r = rng(seed);
  let s = '';
  let x = WIN.x0 - 60;
  while (x < WIN.x1 + 60) {
    const w = 90 + r() * 150, h = hMin + r() * (hMax - hMin), top = base - h;
    s += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(WIN.sill + 40 - top)}" fill="${C.facade}"/>`;
    s += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w * 0.14)}" height="${f1(WIN.sill + 40 - top)}" fill="${C.lit}" opacity="0.7"/>`;
    if (C.win) {
      for (let wy = top + 22; wy < WIN.sill - 10; wy += 42) {
        for (let wx = x + w * 0.2; wx < x + w - 24; wx += 34) {
          s += `<rect x="${f1(wx)}" y="${f1(wy)}" width="14" height="20" fill="${C.win}" opacity="0.55"/>`;
        }
      }
    }
    if (r() < 0.6) {
      const rh = 22 + r() * 30;
      s += `<path d="M${f1(x - 4)} ${f1(top)} L${f1(x + w / 2)} ${f1(top - rh)} L${f1(x + w + 4)} ${f1(top)} Z" fill="${C.roof}"/>`;
      s += `<path d="M${f1(x - 4)} ${f1(top)} L${f1(x + w / 2)} ${f1(top - rh)}" stroke="${C.lit}" stroke-width="4" opacity="0.8"/>`;
    } else {
      s += `<rect x="${f1(x - 3)}" y="${f1(top - 8)}" width="${f1(w + 6)}" height="9" fill="${C.roof}"/>`;
    }
    if (r() < 0.5) {
      const cx = x + w * (0.25 + r() * 0.45);
      s += `<rect x="${f1(cx)}" y="${f1(top - 46)}" width="16" height="46" fill="${C.roof}"/>`;
      s += `<rect x="${f1(cx)}" y="${f1(top - 46)}" width="4" height="46" fill="${C.lit}" opacity="0.7"/>`;
    }
    x += w + r() * 10;
  }
  return s;
}

// L'arbre roux : une couronne faite de plusieurs masses, chacune éclairée en
// haut à gauche par le soleil bas, plus sombre et plus rouge dans le creux
const TREE_COLS = [[0, '#5a2617'], [0.2, '#7c3620'], [0.4, '#a04e2a'], [0.58, '#bd6b35'], [0.74, '#d49049'], [0.88, '#e8b46c'], [1, '#f4d59c']];
const treeCol = (k) => {
  for (let i = 1; i < TREE_COLS.length; i++) {
    if (k <= TREE_COLS[i][0]) {
      const [a, ca] = TREE_COLS[i - 1], [b, cb] = TREE_COLS[i];
      const u = (k - a) / (b - a);
      const h = (s, j) => parseInt(s.slice(1 + j * 2, 3 + j * 2), 16);
      return '#' + [0, 1, 2].map((j) => Math.round(lerp(h(ca, j), h(cb, j), u)).toString(16).padStart(2, '0')).join('');
    }
  }
  return TREE_COLS[TREE_COLS.length - 1][1];
};
// masses : centre, rayon, lumière propre (plus haut, plus à gauche = plus clair)
const CROWNS = [
  // cœur de la couronne
  [520, 300, 175], [720, 300, 165], [620, 480, 185], [470, 520, 145], [780, 500, 145],
  // pourtour, en lobes : le sommet arrondi se découpe sur le ciel
  [430, 150, 140], [570, 80, 150], [720, 90, 140], [850, 180, 120],
  [330, 310, 135], [920, 340, 110], [330, 500, 130], [910, 530, 110],
  [410, 680, 140], [610, 720, 160], [810, 690, 130],
].map(([x, y, R]) => [520 + (x - 620) * 0.8, 400 + (y - 420) * 0.82, R * 0.8]);
const LIGHT = norm([-0.8, -0.6]);
function arbre() {
  const r = rng(23);
  let s = '';
  // tronc et branches maîtresses, qu'on devine dans les trouées
  s += `<g fill="none" stroke="#4a2c22" stroke-linecap="round">
    <path d="M536 900 C530 820 524 760 510 700 C498 650 474 600 440 540" stroke-width="26"/>
    <path d="M528 790 C562 740 604 690 646 640 C672 606 696 574 720 534" stroke-width="15"/>
    <path d="M510 700 C466 676 410 652 336 628" stroke-width="11"/>
    <path d="M500 660 C510 590 526 516 542 430" stroke-width="10"/>
  </g>`;
  const order = CROWNS.slice(0, 5).concat(CROWNS.slice(5).sort((p, q) => (q[0] + q[1]) - (p[0] + p[1])));
  for (const [cx, cy, R] of order) {
    const glob = clamp(0.62 - (cx - 500) / 900 - (cy - 250) / 1300, 0, 1); // le haut gauche reçoit plus de soleil
    // ombre propre de la masse, décalée vers le bas à droite
    s += `<ellipse cx="${cx + R * 0.12}" cy="${cy + R * 0.14}" rx="${R * 0.95}" ry="${R * 0.82}" fill="${treeCol(0.1 + glob * 0.15)}"/>`;
    const clumps = [];
    for (let i = 0; i < 22; i++) {
      const a = r() * TAU, d = Math.sqrt(r());
      const x = cx + Math.cos(a) * d * R * 0.95, y = cy + Math.sin(a) * d * R * 0.8;
      const lit = (Math.cos(a) * LIGHT[0] + Math.sin(a) * LIGHT[1]) * d;
      const k = clamp(0.3 + 0.32 * lit + 0.38 * glob + (r() - 0.5) * 0.22);
      const sz = R * (0.22 + r() * 0.26);
      clumps.push({ x, y, k, sz, rot: r() * 180, e: 0.6 + r() * 0.3 });
    }
    clumps.sort((p, q) => p.k - q.k);
    for (const c of clumps) {
      s += `<ellipse cx="${f1(c.x)}" cy="${f1(c.y)}" rx="${f1(c.sz)}" ry="${f1(c.sz * c.e)}" transform="rotate(${f1(c.rot)} ${f1(c.x)} ${f1(c.y)})" fill="${treeCol(c.k)}"/>`;
    }
    // le bord éclairé de la masse : feuilles traversées de soleil
    const bx = cx + LIGHT[0] * R * 0.62, by = cy + LIGHT[1] * R * 0.52;
    s += `<ellipse cx="${f1(bx)}" cy="${f1(by)}" rx="${f1(R * 0.42)}" ry="${f1(R * 0.26)}" transform="rotate(-35 ${f1(bx)} ${f1(by)})" fill="${treeCol(0.82 + glob * 0.18)}" opacity="0.75"/>`;
  }
  // quelques trouées de ciel dans la couronne
  for (let i = 0; i < 9; i++) {
    const c = CROWNS[Math.floor(r() * CROWNS.length)];
    const x = c[0] + (r() - 0.5) * c[2] * 1.4, y = c[1] + (r() - 0.5) * c[2];
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(10 + r() * 14)}" ry="${f1(8 + r() * 10)}" fill="#f6ead2" opacity="${f1(0.45 + r() * 0.3)}"/>`;
  }
  return s;
}

// Plantes vertes sur l'appui : feuilles en contre-jour, bords translucides
function plante(cx, base, n, seed, spread, height) {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * spread;
    const len = height * (0.5 + r() * 0.5);
    const tip = [cx + Math.cos(a) * len, base + Math.sin(a) * len];
    const w = 14 + r() * 12;
    const mid = [cx + Math.cos(a) * len * 0.55, base + Math.sin(a) * len * 0.55];
    const nx = -Math.sin(a), ny = Math.cos(a);
    const d = `M${xy([cx, base])} Q${xy([mid[0] + nx * w * 1.6, mid[1] + ny * w * 1.6])} ${xy(tip)} Q${xy([mid[0] - nx * w * 1.6, mid[1] - ny * w * 1.6])} ${xy([cx, base])} Z`;
    s += `<path d="${d}" fill="${r() < 0.5 ? '#2f4a2e' : '#243b25'}"/>`;
    s += `<path d="${d}" fill="none" stroke="#c6d98a" stroke-width="3" opacity="0.6"/>`;
  }
  return s;
}

const FOND = `
<defs>
  ${grad('a2-couple-mur', -240, 0, 2160, 0, [[0, '#5f5a54'], [0.1, '#6b655d'], [0.5, '#726b61'], [0.9, '#69635b'], [1, '#5a5650']])}
  ${grad('a2-couple-mur-v', 0, -200, 0, 1220, [[0, '#3a3e4c', 0.3], [0.5, '#3a3e4c', 0], [1, '#30343f', 0.45]])}
  ${grad('a2-couple-ciel', 0, -200, 0, 790, [[0, '#e6e3d6'], [0.3, '#f5eedd'], [0.55, '#fcf1da'], [0.8, '#f8e6c8'], [1, '#f0dbb8']])}
  ${radial('a2-couple-soleil', 0, -220, 760, [[0, '#fffdf6'], [0.3, '#fff7e6', 0.8], [0.7, '#fff1da', 0.2], [1, '#fff1d8', 0]])}
  ${grad('a2-couple-brume', 0, 420, 0, 790, [[0, '#f6eee0', 0], [0.6, '#f4eadb', 0.25], [1, '#efe2cc', 0.45]])}
  ${grad('a2-couple-facade', 1150, 0, 1660, 0, [[0, '#ecdcbf'], [1, '#dcc8a6']])}
  ${grad('a2-couple-tableau', 0, -200, 0, 790, [[0, '#d6c2a0'], [0.5, '#f0dcb8'], [1, '#e5cca4']])}
  ${grad('a2-couple-appui', 0, WIN.sill, 0, WIN.sill + 26, [[0, '#f7ebd6'], [1, '#d9c9ae']])}
  ${grad('a2-couple-sous-appui', 0, WIN.sill + 40, 0, WIN.sill + 200, [[0, '#262a36', 0.5], [1, '#262a36', 0.1]])}
  ${grad('a2-couple-rebond', 0, WIN.sill + 60, 0, 1230, [[0, '#b98a5e', 0], [1, '#c4915f', 0.38]])}
  <filter id="a2-couple-loin" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>
</defs>
<!-- mur crème, à contre-jour -->
<rect x="-240" y="-200" width="2400" height="1400" fill="url(#a2-couple-mur)"/>
<rect x="-240" y="-200" width="2400" height="1400" fill="url(#a2-couple-mur-v)"/>
<!-- embrasure : à gauche dans l'ombre, à droite prise dans le soleil bas -->
<path d="M${WIN.ox0} ${WIN.top - 10} L${WIN.x0} ${WIN.top} L${WIN.x0} ${WIN.sill} L${WIN.ox0} ${WIN.sill + 26} Z" fill="#5f5b58"/>
<path d="M${WIN.x1} ${WIN.top} L${WIN.ox1} ${WIN.top - 10} L${WIN.ox1} ${WIN.sill + 26} L${WIN.x1} ${WIN.sill} Z" fill="url(#a2-couple-tableau)"/>
<!-- la vitre : ciel du matin, toits, arbre roux -->
<clipPath id="a2-couple-c-verre"><rect x="${WIN.x0}" y="${WIN.top}" width="${WIN.x1 - WIN.x0}" height="${WIN.sill - WIN.top}"/></clipPath>
<g clip-path="url(#a2-couple-c-verre)">
  <rect x="${WIN.x0}" y="${WIN.top}" width="${WIN.x1 - WIN.x0}" height="${WIN.sill - WIN.top}" fill="url(#a2-couple-ciel)"/>
  <g opacity="0.7" filter="url(#a2-couple-loin)">${ville(600, 4, 30, 120, { facade: '#d9d7d1', lit: '#f3ebdc', roof: '#bcc0c4' })}</g>
  <g opacity="0.9" filter="url(#a2-couple-loin)">${ville(700, 9, 50, 150, { facade: '#ddcdb2', lit: '#f4e4c6', roof: '#9e9ba2', win: '#b3aa9e' })}</g>
  <!-- l'immeuble d'en face, à droite : toit d'ardoise, façade au soleil -->
  <path d="M1120 800 L1120 640 L1240 584 L1660 584 L1660 800 Z" fill="url(#a2-couple-facade)"/>
  <path d="M1120 640 L1240 584 L1660 584 L1660 606 L1240 606 L1136 656 Z" fill="#8a8790"/>
  <g fill="#b6aea2">
    ${[1300, 1400, 1500, 1600].map((x) => `<rect x="${x}" y="650" width="46" height="70" rx="3"/>`).join('')}
  </g>
  ${arbre()}
  <rect x="${WIN.x0}" y="${WIN.top}" width="${WIN.x1 - WIN.x0}" height="${WIN.sill - WIN.top}" fill="#f4ede1" opacity="0.14"/>
  <rect x="${WIN.x0}" y="${WIN.top}" width="${WIN.x1 - WIN.x0}" height="${WIN.sill - WIN.top}" fill="url(#a2-couple-brume)"/>
  <rect x="${WIN.x0}" y="${WIN.top}" width="${WIN.x1 - WIN.x0}" height="${WIN.sill - WIN.top}" fill="url(#a2-couple-soleil)"/>
</g>
<!-- cadre de la fenêtre et montant -->
<g fill="#b9af9e">
  <rect x="${WIN.x0}" y="${WIN.top}" width="20" height="${WIN.sill - WIN.top}"/>
  <rect x="${WIN.x1 - 20}" y="${WIN.top}" width="20" height="${WIN.sill - WIN.top}"/>
  <rect x="${WIN.x0}" y="${WIN.sill - 22}" width="${WIN.x1 - WIN.x0}" height="22"/>
</g>
<!-- appui : dessus pris dans le soleil, chant dans l'ombre -->
<path d="M${WIN.x0} ${WIN.sill} L${WIN.x1} ${WIN.sill} L${WIN.ox1 + 14} ${WIN.sill + 26} L${WIN.ox0 - 14} ${WIN.sill + 26} Z" fill="url(#a2-couple-appui)"/>
<rect x="${WIN.ox0 - 14}" y="${WIN.sill + 26}" width="${WIN.ox1 - WIN.ox0 + 28}" height="20" fill="#6b655e"/>
<rect x="-240" y="${WIN.sill + 46}" width="2400" height="420" fill="url(#a2-couple-sous-appui)"/>
<rect x="-240" y="${WIN.sill + 46}" width="2400" height="420" fill="url(#a2-couple-rebond)"/>
<!-- les plantes de l'appui -->
<g>
  <path d="M396 ${WIN.sill + 4} L402 ${WIN.sill - 44} L466 ${WIN.sill - 44} L472 ${WIN.sill + 4} Z" fill="#a89e8e"/>
  <path d="M402 ${WIN.sill - 44} L466 ${WIN.sill - 44} L466 ${WIN.sill - 36} L402 ${WIN.sill - 36} Z" fill="#8f8676"/>
  ${plante(434, WIN.sill - 44, 16, 3, 2.4, 140)}
  <path d="M1506 ${WIN.sill + 4} L1510 ${WIN.sill - 34} L1558 ${WIN.sill - 34} L1562 ${WIN.sill + 4} Z" fill="#a0968a"/>
  ${plante(1534, WIN.sill - 34, 10, 7, 1.6, 100)}
</g>
`;

/* ==========================================================================
   Voilage blanc, tiré de part et d'autre : lumineux devant la vitre
   ========================================================================== */
function voile(x0, x1, seed) {
  const r = rng(seed);
  // bord libre ondulé : le tissu fait des vagues douces
  const out = `M${x0} -210 L${x1} -210 C${x1 - 22} 0 ${x1 + 18} 160 ${x1 - 8} 340 C${x1 - 30} 520 ${x1 + 14} 700 ${x1 - 12} 900 C${x1 - 24} 1040 ${x1 + 6} 1140 ${x1 - 4} 1240 L${x0 + 6} 1240 C${x0 - 6} 700 ${x0 + 8} 300 ${x0} -210 Z`;
  const folds = [];
  let x = x0 + 4;
  while (x < x1 - 8) {
    const fw = 12 + r() * 26;
    const dk = r() < 0.5;
    const a = 5 + r() * 8;
    folds.push(
      `<path d="M${f1(x)} -210 C${f1(x + a)} 200 ${f1(x - a)} 700 ${f1(x + a * 0.5)} 1240 L${f1(x + fw + a * 0.5)} 1240 C${f1(x + fw - a)} 700 ${f1(x + fw + a)} 200 ${f1(x + fw)} -210 Z" ` +
        `fill="${dk ? '#a59a88' : '#fffdf8'}" opacity="${dk ? 0.42 : 0.7}"/>`,
    );
    x += fw + 2 + r() * 8;
  }
  return { out, folds: folds.join('') };
}
const VG = voile(120, 440, 5);
const VD = voile(1676, 1880, 9);
const VOILAGE = `
<defs>
  <clipPath id="a2-couple-c-vitre"><rect x="${WIN.x0}" y="${WIN.top}" width="${WIN.ox1 - WIN.x0}" height="${WIN.sill - WIN.top}"/></clipPath>
  <clipPath id="a2-couple-c-vg"><path d="${VG.out}"/></clipPath>
  <clipPath id="a2-couple-c-vd"><path d="${VD.out}"/></clipPath>
</defs>
${[['vg', VG], ['vd', VD]].map(([id, V]) => `
<g clip-path="url(#a2-couple-c-${id})">
  <rect x="100" y="-210" width="1800" height="1450" fill="#cbc3b5" opacity="0.7"/>
  <g clip-path="url(#a2-couple-c-vitre)"><rect x="100" y="-210" width="1800" height="1450" fill="#fff8ec" opacity="0.5"/></g>
  ${V.folds}
  <rect x="100" y="${WIN.sill + 30}" width="1800" height="700" fill="#4a4c56" opacity="0.4"/>
</g>`).join('')}
`;

/* ==========================================================================
   Premier plan : une grande plante d'intérieur, très floue, entre dans le
   cadre par la droite ; ses feuilles s'allument sur les bords
   ========================================================================== */
function feuillage() {
  const r = rng(41);
  let s = '';
  // tiges qui montent du bas à droite, feuilles larges et pointues
  const leaves = [
    [2020, 1240, 1790, 600, 120, 84], [2080, 1240, 1900, 420, 130, 88], [1980, 1240, 1720, 800, 115, 78],
    [2120, 1240, 2030, 520, 125, 84], [2060, 1240, 1850, 930, 110, 72], [2160, 1240, 2110, 700, 120, 80],
    [2000, 1240, 1680, 1030, 100, 66],
  ];
  for (const [bx, by, tx, ty, len, w] of leaves) {
    // tige
    s += `<path d="M${bx} ${by} Q${f1((bx + tx) / 2 + 30)} ${f1((by + ty) / 2)} ${tx} ${ty}" fill="none" stroke="#1d2a20" stroke-width="10"/>`;
    // feuille : elle part de l'extrémité de la tige, vers le haut à gauche
    const a = Math.atan2(ty - by, tx - bx) + (r() - 0.5) * 0.5;
    const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    const tip = [tx + ux * len * 2, ty + uy * len * 2];
    const m1 = [tx + ux * len + nx * w, ty + uy * len + ny * w], m2 = [tx + ux * len - nx * w, ty + uy * len - ny * w];
    const d = `M${xy([tx, ty])} Q${xy(m1)} ${xy(tip)} Q${xy(m2)} ${xy([tx, ty])} Z`;
    s += `<path d="${d}" fill="${r() < 0.5 ? '#22341f' : '#2b4127'}"/>`;
    s += `<path d="M${xy([tx, ty])} Q${xy([tx + ux * len, ty + uy * len])} ${xy(tip)}" fill="none" stroke="#3f5a35" stroke-width="5" opacity="0.7"/>`;
    // bord tourné vers la fenêtre, traversé de lumière
    s += `<path d="M${xy([tx, ty])} Q${xy(m1)} ${xy(tip)}" fill="none" stroke="#b9d080" stroke-width="9" opacity="0.55"/>`;
  }
  return s;
}
const PLANTE = feuillage();

/* ==========================================================================
   Effets procéduraux : halo de la vitre, scintillement de l'arbre, feuilles
   qui tombent, lumière autour des silhouettes, rayons, poussière, étalonnage
   ========================================================================== */
let SPR = null;
function sprites() {
  if (SPR) return SPR;
  const mk = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
  const beam = mk(64, 512);
  const b = beam.getContext('2d');
  const gx = b.createLinearGradient(0, 0, 64, 0);
  [[0, 0], [0.15, 0.12], [0.35, 0.6], [0.5, 1], [0.65, 0.6], [0.85, 0.12], [1, 0]].forEach(([o, a]) => gx.addColorStop(o, `rgba(255,234,196,${a})`));
  b.fillStyle = gx;
  b.fillRect(0, 0, 64, 512);
  b.globalCompositeOperation = 'destination-in';
  const gy = b.createLinearGradient(0, 0, 0, 512);
  [[0, 0], [0.08, 1], [0.4, 0.75], [1, 0]].forEach(([o, a]) => gy.addColorStop(o, `rgba(0,0,0,${a})`));
  b.fillStyle = gy;
  b.fillRect(0, 0, 64, 512);
  const dot = mk(64, 64);
  const d = dot.getContext('2d');
  const gd = d.createRadialGradient(32, 32, 0, 32, 32, 32);
  gd.addColorStop(0, 'rgba(255,248,228,1)');
  gd.addColorStop(0.3, 'rgba(255,238,200,0.6)');
  gd.addColorStop(1, 'rgba(255,226,180,0)');
  d.fillStyle = gd;
  d.fillRect(0, 0, 64, 64);
  const disc = mk(64, 64);
  const e = disc.getContext('2d');
  const ge = e.createRadialGradient(32, 32, 0, 32, 32, 31);
  ge.addColorStop(0, 'rgba(255,222,160,0.45)');
  ge.addColorStop(0.75, 'rgba(255,214,150,0.5)');
  ge.addColorStop(0.9, 'rgba(255,210,146,0.55)');
  ge.addColorStop(1, 'rgba(255,210,146,0)');
  e.fillStyle = ge;
  e.fillRect(0, 0, 64, 64);
  return (SPR = { beam, dot, disc });
}

// Le soleil bas du matin, hors champ en haut à gauche
const SUN = [-1000, -560];
const RAYS = [
  // origine x, y (dans la vitre), largeur, intensité, phase
  [420, 40, 160, 0.5, 0.0], [580, 200, 90, 0.4, 1.7], [720, -60, 200, 0.45, 3.1],
  [340, 330, 120, 0.36, 2.2], [860, 140, 70, 0.3, 5.3], [500, 460, 150, 0.32, 4.4],
  [980, 20, 110, 0.3, 0.9], [300, 140, 520, 0.14, 2.8],
].map(([x, y, w, k, ph]) => {
  const dx = x - SUN[0], dy = y - SUN[1], l = Math.hypot(dx, dy);
  return { x, y, w, k, ph, d: [dx / l, dy / l] };
});
const rayK = (T, ry) => ry.k * (0.7 + 0.3 * Math.sin(T * 0.42 + ry.ph));
function rayons(c, T, k = 1) {
  const { beam } = sprites();
  c.globalCompositeOperation = 'screen';
  for (const ry of RAYS) {
    c.save();
    c.globalAlpha = Math.min(1, rayK(T, ry) * k);
    c.translate(ry.x, ry.y);
    c.rotate(Math.atan2(ry.d[1], ry.d[0]) - Math.PI / 2);
    c.drawImage(beam, -ry.w / 2, 0, ry.w, 1500);
    c.restore();
  }
}

// Poussière en suspension : dérive lente, visible seulement dans la lumière
const MOTES = (() => {
  const r = rng(77);
  return Array.from({ length: 160 }, () => ({
    x: r() * 1500 - 100, y: r() * 1000 - 100, ph: r() * TAU, sp: 0.5 + r(), s: 1.6 + r() * 2.6,
  }));
})();
// quelques grains de plus autour du couple, où ils se voient sur les silhouettes
const MOTES_PRES = (() => {
  const r = rng(83);
  return Array.from({ length: 60 }, () => ({
    x: 900 + r() * 560, y: 120 + r() * 700, ph: r() * TAU, sp: 0.5 + r(), s: 1.4 + r() * 2.2,
  }));
})();
const beamAt = (x, y, T) => {
  let v = 0;
  for (const ry of RAYS) {
    const dx = x - ry.x, dy = y - ry.y;
    const along = dx * ry.d[0] + dy * ry.d[1];
    if (along < 0) continue;
    const across = dx * ry.d[1] - dy * ry.d[0];
    const q = across / (ry.w * 0.45);
    v += rayK(T, ry) * Math.exp(-q * q) * Math.min(1, along / 120);
  }
  return v;
};
const wrap = (v, a, w) => a + ((((v - a) % w) + w) % w);
function poussiere(c, T, front) {
  const { dot } = sprites();
  c.globalCompositeOperation = 'screen';
  if (front) {
    for (const m of MOTES_PRES) {
      const x = m.x + 14 * Math.sin(T * 0.21 * m.sp + m.ph) + 3 * T;
      const y = wrap(m.y + 9 * Math.sin(T * 0.29 * m.sp + m.ph * 1.7) - 4 * T * m.sp, 120, 700);
      const a = Math.min(0.9, 0.12 + beamAt(x, y, T) * 2.2) * (0.55 + 0.45 * Math.sin(T * 1.2 * m.sp + m.ph * 3));
      if (a < 0.06) continue;
      c.globalAlpha = a;
      c.drawImage(dot, x - m.s, y - m.s, m.s * 2, m.s * 2);
    }
  }
  for (const [i, m] of MOTES.entries()) {
    // un grain sur quatre passe devant le couple, les autres derrière
    if ((i % 4 === 0) !== front) continue;
    const x = wrap(m.x + 16 * Math.sin(T * 0.23 * m.sp + m.ph) + 4 * T, -100, 1500);
    const y = wrap(m.y + 10 * Math.sin(T * 0.31 * m.sp + m.ph * 1.7) - 5 * T * m.sp, -100, 1000);
    const b = beamAt(x, y, T);
    const tw = 0.6 + 0.4 * Math.sin(T * 1.1 * m.sp + m.ph * 3);
    const a = Math.min(1, 0.04 + b * 2.4) * tw;
    if (a < 0.05) continue;
    c.globalAlpha = a;
    c.drawImage(dot, x - m.s, y - m.s, m.s * 2, m.s * 2);
  }
}

// Halo de la vitre, scintillement du soleil dans l'arbre, feuilles qui tombent
const GLINT = (() => {
  const r = rng(57);
  const out = [];
  for (const [cx, cy, R] of CROWNS) {
    for (let i = 0; i < 3; i++) {
      const a = Math.atan2(LIGHT[1], LIGHT[0]) + (r() - 0.5) * 2.2, d = 0.5 + r() * 0.45;
      out.push({ x: cx + Math.cos(a) * d * R, y: cy + Math.sin(a) * d * R * 0.8, s: 14 + r() * 26, ph: r() * TAU, k: 0.2 + r() * 0.35 });
    }
  }
  return out;
})();
const LEAVES = [
  { x: 520, y0: -60, sp: 34, ph: 0.4, s: 13, c: 'rgba(222,138,72,0.85)' },
  { x: 940, y0: 120, sp: 26, ph: 2.1, s: 11, c: 'rgba(232,160,88,0.8)' },
  { x: 300, y0: 300, sp: 30, ph: 4.0, s: 12, c: 'rgba(206,116,62,0.8)' },
];
function fenetre(c, T) {
  const { disc } = sprites();
  c.globalCompositeOperation = 'screen';
  // le soleil bas, hors champ en haut à gauche : une lumière blanche, dorée sur les bords
  let g = c.createRadialGradient(40, -160, 0, 40, -160, 1300);
  g.addColorStop(0, 'rgba(255,246,222,0.85)');
  g.addColorStop(0.25, 'rgba(255,230,186,0.5)');
  g.addColorStop(0.6, 'rgba(255,212,156,0.18)');
  g.addColorStop(1, 'rgba(255,206,150,0)');
  c.fillStyle = g;
  c.fillRect(-240, -200, 2400, 1420);
  // halo derrière les têtes : il détache les profils
  g = c.createRadialGradient(1170, 320, 20, 1180, 340, 580);
  g.addColorStop(0, 'rgba(255,242,214,0.62)');
  g.addColorStop(0.45, 'rgba(255,226,184,0.24)');
  g.addColorStop(1, 'rgba(255,218,172,0)');
  c.fillStyle = g;
  c.fillRect(600, -300, 1200, 1300);
  // le voilage de gauche, traversé par le soleil bas, s'illumine
  g = c.createLinearGradient(0, -200, 0, 900);
  g.addColorStop(0, 'rgba(255,244,222,0.6)');
  g.addColorStop(0.55, 'rgba(255,232,196,0.4)');
  g.addColorStop(1, 'rgba(255,226,186,0)');
  c.fillStyle = g;
  c.fillRect(140, -200, 330, 1100);
  // l'embrasure de droite reçoit le soleil bas de plein fouet
  g = c.createLinearGradient(0, -200, 0, 820);
  g.addColorStop(0, 'rgba(255,224,170,0.35)');
  g.addColorStop(0.7, 'rgba(255,214,156,0.5)');
  g.addColorStop(1, 'rgba(255,214,156,0.1)');
  c.fillStyle = g;
  c.fillRect(1636, -200, 82, 1010);
  // le soleil scintille entre les feuilles
  for (const b of GLINT) {
    c.globalAlpha = b.k * (0.45 + 0.55 * Math.sin(T * 0.9 + b.ph));
    c.drawImage(disc, b.x + 5 * Math.sin(T * 0.35 + b.ph) - b.s, b.y - b.s, b.s * 2, b.s * 2);
  }
  // quelques feuilles qui tombent, derrière la vitre
  c.globalCompositeOperation = 'source-over';
  for (const L of LEAVES) {
    const y = wrap(L.y0 + L.sp * T, -120, 960);
    const x = L.x + 40 * Math.sin(T * 0.6 + L.ph) + 0.15 * (y + 120);
    if (y > WIN.sill - 20) continue;
    c.save();
    c.globalAlpha = 0.5 * clamp((WIN.sill - 20 - y) / 60);
    c.translate(x, y);
    c.rotate(Math.sin(T * 1.3 + L.ph) * 1.1);
    c.scale(1, 0.45 + 0.4 * Math.abs(Math.sin(T * 0.9 + L.ph)));
    const lg = c.createRadialGradient(0, 0, 0, 0, 0, L.s * 1.6);
    lg.addColorStop(0, L.c);
    lg.addColorStop(0.25, L.c);
    lg.addColorStop(1, 'rgba(222,138,72,0)');
    c.fillStyle = lg;
    c.beginPath();
    c.ellipse(0, 0, L.s * 1.6, L.s * 1.15, 0, 0, TAU);
    c.fill();
    c.restore();
  }
}

// La lumière enveloppe les bords éclairés des silhouettes
let PATHS = null;
function paths() {
  if (PATHS) return PATHS;
  return (PATHS = {
    cheveuxB: new Path2D(arc(HAIR_B, 0, 16)),
    visageB: new Path2D(arc(HEAD_B, 6, 22)),
    cheveuxA: new Path2D(arc(HAIR_A, 0, 16)),
    visageA: new Path2D(arc(HEAD_A, 6, 23)),
    dosB: new Path2D(arc(TORSE_B, 15, 20)),
    brasB: new Path2D(open(ARM_B_TOP)),
    epauleA: new Path2D(arc(TORSE_A, 0, 5)),
  });
}
function glow(c, p2d, k = 1, x0 = -130, y0 = -200, x1 = 90, y1 = 60) {
  // le halo est fort du côté de la lumière (haut gauche), il s'éteint vers l'arrière
  const gr = c.createLinearGradient(x0, y0, x1, y1);
  gr.addColorStop(0, 'rgba(255,224,170,1)');
  gr.addColorStop(0.5, 'rgba(255,218,160,0.55)');
  gr.addColorStop(1, 'rgba(255,214,156,0)');
  c.strokeStyle = gr;
  c.lineJoin = c.lineCap = 'round';
  [[26, 0.04], [12, 0.07], [4, 0.09]].forEach(([w, a]) => {
    c.globalAlpha = a * k;
    c.lineWidth = w;
    c.stroke(p2d);
  });
}
const applyTf = (c, tf) => {
  const { x = 0, y = 0, rot = 0, sx = 1, sy = 1, ox = 0, oy = 0 } = tf;
  c.translate(ox + x, oy + y);
  c.rotate(rot);
  c.scale(sx, sy);
  c.translate(-ox, -oy);
};
const headSpace = (c, H) => {
  c.translate(H.x, H.y); c.scale(H.s, H.s);
  c.translate(H.px, H.py); c.rotate((H.r * Math.PI) / 180); c.translate(-H.px, -H.py);
};
function halos(c, tfs) {
  const P2 = paths();
  c.globalCompositeOperation = 'screen';
  c.save(); applyTf(c, tfs.teteB); headSpace(c, HB);
  glow(c, P2.cheveuxB, 1.1); glow(c, P2.visageB, 0.8);
  c.restore();
  c.save(); applyTf(c, tfs.corpsB); c.transform(1, 0, 0.03, 1, -30, 0); glow(c, P2.dosB, 0.7, 1240, 380, 1420, 600); c.restore();
  c.save(); applyTf(c, tfs.A);
  glow(c, P2.brasB, 0.8, 1150, 420, 1320, 560);
  c.save(); c.transform(1, 0, -0.05, 1, 30, 0); glow(c, P2.epauleA, 0.6, 1060, 540, 1200, 700); c.restore();
  headSpace(c, HA);
  glow(c, P2.cheveuxA, 1.1); glow(c, P2.visageA, 0.8);
  c.restore();
}

// Yeux de profil : paupière, iris sombre, cils ; o = ouverture (0 → 1)
function oeil(c, E, o, look = 0) {
  const { x, y, w, lash } = E;
  const top = lerp(y + 3.5, y - 4.5, o), mid = lerp(y + 4.5, y - 3.5, o);
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (o > 0.05) {
    c.save();
    c.beginPath();
    c.moveTo(x, y);
    c.bezierCurveTo(x + w * 0.25, top, x + w * 0.65, mid, x + w, y + 1);
    c.bezierCurveTo(x + w * 0.6, y + 4, x + w * 0.3, y + 4, x, y);
    c.closePath();
    c.clip();
    c.fillStyle = 'rgba(120,96,84,0.55)';
    c.fillRect(x - 2, y - 8, w + 4, 16);
    c.fillStyle = '#140c09';
    c.beginPath();
    c.ellipse(x + 3.2 + look * 0.8, y + 0.6 + look * 1.6, 3.4, 4.2, 0, 0, TAU);
    c.fill();
    c.restore();
  }
  c.strokeStyle = '#150d09';
  c.globalAlpha = 0.9;
  c.lineWidth = 1.9;
  c.beginPath();
  c.moveTo(x - 0.5, y);
  c.bezierCurveTo(x + w * 0.25, top, x + w * 0.65, mid, x + w, y + 1);
  c.stroke();
  // cils : relevés quand l'œil est ouvert, vers la joue quand il se ferme
  c.lineWidth = 1;
  for (let i = 0; i < lash; i++) {
    const u = 0.08 + i * 0.13;
    const px = x + w * u, py = lerp(y + 1.5, y - 2.5, o) + (lerp(3, -3, o) * 4 * u * (1 - u));
    const L = 4.5 - i * 0.5;
    c.beginPath();
    c.moveTo(px, py);
    c.quadraticCurveTo(px - L * 0.6, py + lerp(L * 0.4, -L * 0.3, o), px - L, py + lerp(L * 0.7, -L * 0.8, o));
    c.stroke();
  }
  c.globalAlpha = 1;
}
const EYE_A = { x: -93, y: -67, w: 14, lash: 4 };
const EYE_B = { x: -103, y: -75, w: 14, lash: 2 };

// Étalonnage : ombres bleutées, fuite de lumière blanche-dorée en haut à gauche
function etalonnage(c, W, H) {
  c.globalCompositeOperation = 'soft-light';
  c.fillStyle = 'rgba(255,196,130,0.16)';
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'multiply';
  c.fillStyle = 'rgb(246,244,250)';
  c.fillRect(0, 0, W, H);
  const v = c.createRadialGradient(W, H, 0, W, H, Math.hypot(W, H) * 0.6);
  v.addColorStop(0, 'rgb(206,212,232)');
  v.addColorStop(1, 'rgb(255,255,255)');
  c.fillStyle = v;
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'screen';
  const g = c.createRadialGradient(0, -H * 0.2, 0, 0, -H * 0.2, W * 0.55);
  g.addColorStop(0, 'rgba(255,238,206,0.35)');
  g.addColorStop(1, 'rgba(255,238,206,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}

/* ==========================================================================
   Le décor
   ========================================================================== */
export default {
  id: 'a2-couple',
  bg: '#2a2a2e',
  home: { x: 960, y: 540, z: 1 },
  layers: {
    fond: { box: [-240, -200, 2400, 1400], svg: FOND, filters: ['paint', 'b10'], par: 0.9 },
    voilage: { box: [100, -200, 1760, 1400], svg: VOILAGE, filters: ['paint', 'b6'], par: 0.93 },
    corpsB: { box: [1150, 340, 270, 900], svg: CORPS_B, filters: ['paint'] },
    teteB: { box: [1110, 110, 270, 340], svg: TETE_B, filters: ['paint'] },
    A: { box: [990, 300, 340, 930], svg: CORPS_A, filters: ['paint'] },
    plante: { box: [1440, -140, 800, 1380], svg: PLANTE, filters: ['paint', 'b16'], par: 1.35 },
  },

  render(g, p, T) {
    const close = p.close ?? 0, turn = p.turn ?? 0;
    // ils respirent ensemble, lentement
    const br = Math.sin((T * TAU) / 4.8);
    const sy = 1 + 0.0042 * br;
    const rise = -0.0042 * br * (1150 - 420);
    const tfs = {
      corpsB: { sy, ox: 1290, oy: 1150 },
      teteB: { y: rise, rot: (-6 * turn * Math.PI) / 180 + 0.004 * br, ox: hpiv(HB)[0], oy: hpiv(HB)[1] },
      A: { sy, ox: 1170, oy: 1150 },
    };

    g.img('fond');
    g.img('voilage', { tf: { rot: 0.0016 * Math.sin(T * 0.5), ox: 960, oy: -200 } });
    g.fx(0.9, (c) => fenetre(c, T));
    // les rayons et la poussière traversent la pièce derrière le couple…
    g.fx(1, (c) => rayons(c, T));
    g.fx(1, (c) => poussiere(c, T, false));
    g.img('corpsB', { tf: tfs.corpsB });
    g.img('teteB', { tf: tfs.teteB });
    g.fx(1, (c) => { applyTf(c, tfs.teteB); headSpace(c, HB); oeil(c, EYE_B, lerp(0.88, 0.72, turn), turn); });
    g.img('A', { tf: tfs.A });
    g.fx(1, (c) => { applyTf(c, tfs.A); headSpace(c, HA); oeil(c, EYE_A, 1 - close, 0); });
    g.fx(1, (c) => halos(c, tfs));
    // … et un peu de lumière, quelques grains passent devant lui
    g.fx(1, (c) => rayons(c, T, 0.15));
    g.fx(1, (c) => poussiere(c, T, true));
    // la plante du premier plan, qui frémit à peine
    const pl = { x: g.portrait ? -195 : 0, rot: 0.006 * Math.sin(T * 0.45), ox: 2080, oy: 1240 };
    g.img('plante', { tf: pl, alpha: g.portrait ? 0.85 : 1 });
    g.screen((c, W, H) => etalonnage(c, W, H));
  },

  shots: {
    // Devant la fenêtre : ils respirent, A ferme les yeux, B tourne la tête vers elle
    fenetre: {
      dur: 6.5,
      cam: (t, portrait) => {
        const k = 0.6 * ease.inOut(clamp(t / 6.5)) + 0.4 * clamp(t / 6.5);
        return portrait
          ? { x: lerp(1128, 1136, k), y: lerp(500, 492, k), z: lerp(1.14, 1.19, k) }
          : { x: lerp(1000, 1010, k), y: lerp(500, 492, k), z: lerp(1.12, 1.17, k) };
      },
      p: (t) => ({ close: seg(t, 1.6, 3.4, ease.inOut), turn: seg(t, 2.6, 5.6, ease.inOut) }),
    },
  },
};
