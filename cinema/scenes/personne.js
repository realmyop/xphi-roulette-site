/* ==========================================================================
   Décor « personne » — plan moyen : la personne près du berceau, en
   contre-jour devant la grande fenêtre. Profil vers la gauche, cadrée à la
   taille, cheveux mi-longs jusqu'à la mâchoire (fiche de personnage de la
   bible), le revolver dans la main gauche, canon vers le bas. La barre et
   les barreaux du berceau passent, flous, au premier plan en bas à gauche.
   Lumière de début d'après-midi derrière la personne : silhouette sombre,
   liseré doré sur le profil et les cheveux, rayons et poussière.
   ========================================================================== */
import { P, rng } from '../kit.js';
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

// Dégradés en coordonnées du décor
const stops = (s) => s.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
const grad = (id, x1, y1, x2, y2, s) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}">${stops(s)}</linearGradient>`;
const radial = (id, cx, cy, r, s, fx = cx, fy = cy) =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}" fx="${fx}" fy="${fy}">${stops(s)}</radialGradient>`;
const blur = (id, s) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`;

// Touche de brosse : la couleur n'apparaît que par plaques allongées (bruit
// étiré), pour casser les dégradés trop lisses
const brosse = (id, fx, fy, seed, gain = 3, cut = 1.25) =>
  `<filter id="${id}" filterUnits="objectBoundingBox" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="3" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${gain} 0 0 0 -${cut}" result="a"/>` +
  `<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>`;

// Liseré de contre-jour : un trait doré le long d'un bord, gardé à l'intérieur
// de la forme (clip), avec un cœur plus chaud
const rim = (d, clip, w, core = 0, color = '#ffd99a', fblur = 'personne-f2') =>
  `<g clip-path="url(#${clip})">` +
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${fblur})"/>` +
  (core ? `<path d="${d}" fill="none" stroke="#fff3d6" stroke-width="${core}" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>` : '') +
  '</g>';

/* ---------- Couleurs du plan (contre-jour) ---------- */
const C = {
  rim: '#ffd99a',
  skin: '#4f362e', skinFill: '#6c4537', skinDeep: '#30201b',
  hair: '#281d17', hairDeep: '#150e0b', hairLit: '#433026',
  pull: '#232a36', pullDark: '#181d26', pullFill: '#34425a',
  pants: '#22262e', pantsDeep: '#16181d',
  grip: '#4a3426',
};

// Toute la silhouette est remontée de quelques unités (tête, corps, main), pour
// garder l'arme au-dessus de la bande des sous-titres
const FIG_DY = -32;

// La personne se penche un peu vers le berceau : le buste avance avec la hauteur
const LEAN = 0.055;
const lean = ([x, y, c]) => {
  const d = Math.max(0, 760 - y) * LEAN;
  return c ? [x - d, y, 1] : [x - d, y];
};

/* ==========================================================================
   La tête (repère local : origine au haut du cou, profil vers la gauche,
   regard droit ; l'inclinaison de repos est appliquée par la transformation)
   ========================================================================== */
const HX = 1178, HY = 290, HS = 0.9, HREST = -8; // position, échelle, inclinaison (degrés)
const HEAD_TF = `translate(${HX} ${HY}) scale(${HS}) rotate(${HREST} 10 45)`;
const HPIV = [HX + 10 * HS, HY + 45 * HS]; // pivot de l'inclinaison, dans le décor

// Visage ovale et doux : front droit, nez droit et fin, menton discret, cou fin
const HEAD = [
  [-50, 124], [-52, 92], [-56, 60], [-62, 36], [-73, 23], [-87, 16], // 0-5 cou, sous le menton
  [-96, 8], [-100.5, -2], [-99.5, -10], // 6-8 menton discret
  [-102.5, -16], [-100.5, -21.5, 1], [-103.5, -27], [-103, -33], // 9-12 lèvres
  [-108.5, -36], [-116.5, -41], [-115, -49], [-110, -60], [-105.5, -72], // 13-17 nez droit
  [-106, -82], [-105.5, -96], [-102, -114], [-92, -134], // 18-21 front
  [-72, -152], [-42, -163], [-10, -165], [20, -158], [44, -141], // 22-26 crâne
  [58, -116], [62, -88], [56, -60], [44, -36], [30, -14], // 27-31 arrière, sous les cheveux
  [24, 20], [25, 58], [28, 94], [31, 124], // 32-35 cou derrière
];

// Cheveux mi-longs : une masse arrondie qui couvre l'oreille et s'arrête à la
// hauteur de la mâchoire ; raie sur le côté, d'où la mèche avant balaie le
// haut du front jusqu'à la tempe. Pour rester neutre (et non un carré
// coiffé) : peu de volume sur le dessus, le bord avant reste derrière la
// joue (on voit la ligne de la mâchoire), les pointes tombent droit, effilées
const HAIR = [
  [-101, -136], [-102, -150], [-95, -164], [-82, -173], [-62, -179], // 0-4 mèche avant, depuis la raie
  [-36, -180], [-6, -177], [22, -169], [44, -154], [59, -133], // 5-9 dessus, peu gonflé
  [66, -107], [68, -80], [66, -52], [63, -26], [61, 2], // 10-14 l'arrière tombe droit
  // 15-23 pointes souples, quelques-unes effilées, à la mâchoire ; plus basses
  // vers l'arrière pour rester à l'horizontale une fois la tête inclinée
  [57, 22], [48, 17.5], [38, 19], [27, 15.5], [16, 19, 1], [6, 12.5], [-5, 13.5], [-16, 9.5], [-26, 12, 1],
  [-31, 0], [-32, -20], [-34, -42], [-38, -63], [-46, -84], // 24-28 bord avant, devant l'oreille
  [-61, -104], [-80, -121], // 29-30 la mèche balayée sur la tempe
];

// Mèches : elles partent de la raie et s'ouvrent en éventail vers les pointes
const LOCKS_DARK = [
  'M-62 -178 C-80 -170 -93 -156 -98 -138',
  'M-50 -180 C-60 -156 -56 -122 -44 -92 C-36 -66 -30 -34 -26 6',
  'M-30 -181 C-38 -146 -36 -100 -26 -56 C-20 -30 -16 -10 -12 12',
  'M-8 -179 C-12 -140 -8 -90 0 -44 C3 -22 3 -6 2 10',
  'M16 -173 C26 -138 30 -96 26 -50 C24 -28 22 -10 23 12',
  'M38 -160 C52 -134 58 -100 56 -60 C55 -36 52 -16 46 6',
  'M54 -140 C64 -116 66 -88 62 -56',
];
const LOCKS_LIT = [
  'M-56 -179 C-74 -168 -88 -152 -94 -136',
  'M-40 -181 C-50 -150 -48 -110 -36 -70 C-30 -46 -24 -20 -20 8',
  'M4 -178 C2 -140 6 -96 12 -52 C14 -32 15 -14 14 10',
  'M28 -167 C42 -142 48 -110 46 -70',
];

// Quelques cheveux fins qui s'échappent, lisses, et attrapent la lumière
const WISPS = [
  'M-26 -183 C-6 -186 12 -184 26 -177', 'M58 -140 C66 -126 70 -110 71 -94',
  'M70 -80 C72 -66 71 -54 67 -42', 'M57 8 C60 13 60 18 58 23', 'M-96 -164 C-101 -158 -104 -150 -105 -142',
];

const TETE = `
<defs>
  <clipPath id="personne-c-peau"><path d="${shape(HEAD)}"/></clipPath>
  <clipPath id="personne-c-cheveux"><path d="${shape(HAIR)}"/></clipPath>
  ${grad('personne-peau', 0, -160, 0, 120, [[0, '#4d342c'], [0.45, C.skin], [0.62, '#4e342b'], [1, C.skinDeep]])}
  ${radial('personne-joue', -78, -40, 40, [[0, C.skinFill, 0.6], [1, C.skinFill, 0]])}
  ${grad('personne-meche', -110, 0, 85, 0, [[0, '#3d2c22'], [0.45, C.hair], [1, C.hairDeep]])}
  ${grad('personne-meche-v', 0, -190, 0, 18, [[0, '#000', 0], [0.6, '#000', 0], [1, '#0d0907', 0.45]])}
  ${blur('personne-f1', 1)}${blur('personne-f2', 2)}${blur('personne-f4', 4)}
</defs>
<g transform="${HEAD_TF}">
  <path d="${shape(HEAD)}" fill="url(#personne-peau)"/>
  <g clip-path="url(#personne-c-peau)">
    <!-- le cou, dans l'ombre du menton et des cheveux -->
    <path d="M-98 9 C-84 21 -64 25 -40 19 L80 2 L80 150 L-110 150 Z" fill="${C.skinDeep}" opacity="0.8" filter="url(#personne-f4)"/>
    <!-- joue et nez, à peine éclairés par le rebond de la chambre -->
    <ellipse cx="-80" cy="-40" rx="34" ry="34" fill="url(#personne-joue)"/>
    <ellipse cx="-106" cy="-46" rx="10" ry="8" fill="${C.skinFill}" opacity="0.4" filter="url(#personne-f2)"/>
    <!-- rebond chaud du plancher ensoleillé sur la gorge -->
    <path d="M-62 40 C-58 60 -56 84 -54 110" fill="none" stroke="#8e5a42" stroke-width="10" opacity="0.4" filter="url(#personne-f4)"/>
  </g>
  ${rim(arc(HEAD, 4, 21), 'personne-c-peau', 6, 0, '#e9a874', 'personne-f1')}
  ${rim(arc(HEAD, 6, 21), 'personne-c-peau', 2.6, 0, '#ffe7b8', 'personne-f1')}
  ${rim(arc(HEAD, 31, 35), 'personne-c-peau', 11, 2.2)}
  <!-- cheveux châtain foncé, mi-longs, lisses -->
  <path d="${shape(HAIR)}" fill="url(#personne-meche)"/>
  <g clip-path="url(#personne-c-cheveux)" fill="none" stroke-linecap="round">
    <path d="${shape(HAIR)}" fill="url(#personne-meche-v)" stroke="none"/>
    <!-- reflet doux sur le dessus, là où la lumière rase -->
    <path d="M-62 -168 C-32 -180 6 -178 38 -164 C54 -154 62 -140 66 -122" stroke="#6b4a36" stroke-width="12" opacity="0.4" filter="url(#personne-f4)"/>
    ${LOCKS_DARK.map((d) => `<path d="${d}" stroke="${C.hairDeep}" stroke-width="3" opacity="0.5" filter="url(#personne-f1)"/>`).join('')}
    ${LOCKS_LIT.map((d) => `<path d="${d}" stroke="${C.hairLit}" stroke-width="1.4" opacity="0.35"/>`).join('')}
    <!-- la raie, sur le côté -->
    <path d="M-86 -166 C-74 -172 -60 -176 -44 -178" stroke="#6e4e3a" stroke-width="2" opacity="0.75"/>
    <!-- les pointes, fines, laissent passer la lumière -->
    <path d="${arc(HAIR, 10, 15)}" stroke="#8c5634" stroke-width="12" opacity="0.45" filter="url(#personne-f4)"/>
  </g>
  ${rim(arc(HAIR, 1, 14), 'personne-c-cheveux', 8, 2)}
  ${rim(arc(HAIR, 28, 33), 'personne-c-cheveux', 3, 0, '#e9b27c', 'personne-f1')}
  <g fill="none" stroke="${C.rim}" stroke-width="1" stroke-linecap="round" opacity="0.6">
    ${WISPS.map((d) => `<path d="${d}"/>`).join('')}
  </g>
  <!-- traits du visage, à la Dudok de Wit : sourcil fin, paupière baissée, narine, bouche calme -->
  <g fill="none" stroke-linecap="round">
    <path d="M-103 -84 C-96 -86.2 -88 -86.6 -80 -85.6" stroke="#24170f" stroke-width="2.4" opacity="0.6"/>
    <path d="M-99.5 -70 C-95 -66.5 -89 -66 -83 -68" stroke="#21140f" stroke-width="2" opacity="0.85"/>
    <path d="M-111 -39 C-109 -41.5 -107 -41.5 -105 -40" stroke="#3a2620" stroke-width="1.6" opacity="0.75"/>
    <path d="M-100.5 -21.5 L-94.5 -21.2" stroke="#2c1a15" stroke-width="1.4" opacity="0.6"/>
  </g>
</g>`;

/* ==========================================================================
   Le corps : pull bleu-gris ras du cou, bras proche jusqu'au coude, pantalon
   ========================================================================== */
const TORSE = [
  [1150, 346], [1200, 333], [1250, 318], // 0-2 col
  [1263, 331], [1281, 350], [1295, 378], [1302, 420], [1303, 470], // 3-7 dos, omoplate (silhouette mince)
  [1298, 520], [1291, 568], [1289, 612], [1295, 656], [1300, 696], // 8-12 reins, pull qui blouse
  [1298, 718, 1], [1308, 750], [1316, 800], [1316, 860], [1309, 930], [1300, 1010], [1294, 1110], // 13-19 pantalon
  [1210, 1160], [1150, 1110], // 20-21 (hors cadre)
  [1156, 1010], [1158, 930], [1152, 860], [1142, 800], [1134, 730, 1], // 22-26 cuisse
  [1130, 700], [1125, 650], [1121, 600], [1119, 540], [1120, 485], // 27-31 ventre, poitrine
  [1124, 436], [1132, 398], [1140, 370], [1146, 355], // 32-35
].map(lean);
const BRAS = [
  [1181, 380], [1207, 367], [1233, 373], [1248, 398], [1252, 450], [1250, 505],
  [1245, 545], [1232, 569], [1208, 568], [1192, 545], [1183, 492], [1178, 440], [1177, 404],
].map(lean);
const COL = [[1146, 348], [1198, 335], [1252, 316], [1257, 334], [1202, 352], [1150, 364]].map(lean);

const CORPS = `
<defs>
  <clipPath id="personne-c-torse"><path d="${shape(TORSE)}"/></clipPath>
  <clipPath id="personne-c-bras"><path d="${shape(BRAS)}"/></clipPath>
  ${grad('personne-pull', 1095, 0, 1315, 0, [[0, '#2e3745'], [0.35, C.pull], [0.8, C.pullDark], [1, '#20242c']])}
  ${grad('personne-jambe', 1140, 0, 1325, 0, [[0, '#2a2e35'], [0.6, C.pants], [1, C.pantsDeep]])}
  ${blur('personne-f2', 2)}${blur('personne-f3', 3)}${blur('personne-f6', 6)}${blur('personne-f10', 10)}
  ${brosse('personne-br-pull', 0.035, 0.009, 8)}
  ${brosse('personne-br-pull2', 0.05, 0.012, 21, 3, 1.4)}
</defs>
<path d="${shape(TORSE)}" fill="url(#personne-pull)"/>
<g clip-path="url(#personne-c-torse)">
  <!-- touches de brosse : rebond froid de la chambre sur le devant, ombre au dos -->
  <rect x="1060" y="300" width="160" height="440" fill="${C.pullFill}" opacity="0.4" filter="url(#personne-br-pull)"/>
  <rect x="1200" y="300" width="130" height="440" fill="#171b21" opacity="0.28" filter="url(#personne-br-pull2)"/>
  <path d="M${xy(lean([1110, 560]))} C${xy(lean([1140, 620]))} ${xy(lean([1150, 690]))} ${xy(lean([1130, 740]))}" fill="none" stroke="#6d5a52" stroke-width="30" opacity="0.35" filter="url(#personne-f10)"/>
  <path d="M${xy(lean([1120, 380]))} C${xy(lean([1112, 430]))} ${xy(lean([1112, 480]))} ${xy(lean([1116, 530]))}" fill="none" stroke="#4d5d74" stroke-width="26" opacity="0.4" filter="url(#personne-f10)"/>
  <!-- pantalon sombre sous le bord-côte -->
  <path d="M1100 716 C1180 726 1260 730 1340 716 L1340 1200 L1100 1200 Z" fill="url(#personne-jambe)"/>
  <path d="M1150 770 C1190 800 1220 840 1236 900" fill="none" stroke="#353941" stroke-width="3" opacity="0.5" filter="url(#personne-f2)"/>
  <!-- rebond chaud du plancher ensoleillé sur le devant des jambes -->
  <path d="${arc(TORSE, 22, 27)}" fill="none" stroke="#6b5243" stroke-width="18" opacity="0.4" filter="url(#personne-f6)"/>
  <!-- bord-côte du pull -->
  <path d="M1112 694 C1180 704 1260 706 1330 692 L1330 722 C1260 734 1180 732 1112 724 Z" fill="#262d37"/>
  <g stroke="#1b2028" stroke-width="2" opacity="0.6">
    ${Array.from({ length: 24 }, (_, i) => { const x = 1116 + i * 9; return `<line x1="${x}" y1="${f1(701 + Math.sin(i) * 1.5)}" x2="${x - 1}" y2="${728}"/>`; }).join('')}
  </g>
  <!-- plis du pull qui blouse au-dessus du bord-côte -->
  <g fill="none" stroke="#14181e" stroke-linecap="round" opacity="0.55" filter="url(#personne-f3)">
    <path d="M1124 678 C1160 692 1200 690 1236 678" stroke-width="7"/>
    <path d="M1252 690 C1270 676 1288 670 1306 676" stroke-width="6"/>
    <path d="M1120 610 C1140 626 1158 630 1172 624" stroke-width="5"/>
  </g>
  <!-- plis : sous l'aisselle et le long du flanc, lisérés de lumière froide -->
  <g fill="none" stroke-linecap="round">
    <path d="M${xy(lean([1262, 420]))} C${xy(lean([1272, 470]))} ${xy(lean([1276, 520]))} ${xy(lean([1268, 570]))}" stroke="#12161b" stroke-width="5" opacity="0.5" filter="url(#personne-f2)"/>
    <path d="M${xy(lean([1128, 470]))} C${xy(lean([1146, 500]))} ${xy(lean([1160, 520]))} ${xy(lean([1172, 524]))}" stroke="#3e4b5e" stroke-width="3" opacity="0.5" filter="url(#personne-f2)"/>
  </g>
  <!-- ombre portée du bras sur le flanc -->
  <path d="M1230 400 C1252 470 1250 540 1226 590 L1250 600 C1280 540 1282 470 1260 400 Z" fill="#101317" opacity="0.6" filter="url(#personne-f6)"/>
  <!-- col ras du cou, en côtes -->
  <path d="${shape(COL)}" fill="#323b48"/>
  <path d="M${xy(lean([1150, 356]))} C${xy(lean([1184, 347]))} ${xy(lean([1220, 338]))} ${xy(lean([1256, 325]))}" fill="none" stroke="#1d222a" stroke-width="2" opacity="0.7"/>
  <!-- la lumière qui enveloppe le haut du dos -->
  <path d="M${xy(lean([1262, 334]))} C${xy(lean([1300, 362]))} ${xy(lean([1314, 420]))} ${xy(lean([1310, 520]))}" fill="none" stroke="#66788a" stroke-width="26" opacity="0.3" filter="url(#personne-f10)"/>
</g>
${rim(arc(TORSE, 2, 13), 'personne-c-torse', 13, 2.8)}
${rim(arc(TORSE, 14, 19), 'personne-c-torse', 8, 1.4)}
${rim(arc(TORSE, 29, 36), 'personne-c-torse', 4, 1)}
${rim(arc(COL, 0, 2), 'personne-c-torse', 5, 1.4)}
<!-- bras proche, jusqu'au coude : un peu plus éclairé par la chambre, détaché du flanc par l'ombre -->
<path d="${shape(BRAS)}" fill="#0c0f13" opacity="0.6" filter="url(#personne-f3)" transform="translate(6 3)"/>
<path d="${shape(BRAS)}" fill="#272e39"/>
<g clip-path="url(#personne-c-bras)">
  <rect x="1130" y="360" width="90" height="220" fill="#36414f" opacity="0.5" filter="url(#personne-br-pull)"/>
  <path d="M${xy(lean([1190, 380]))} C${xy(lean([1182, 440]))} ${xy(lean([1186, 500]))} ${xy(lean([1200, 548]))}" fill="none" stroke="#46525f" stroke-width="12" opacity="0.4" filter="url(#personne-f6)"/>
  <path d="M${xy(lean([1192, 528]))} C${xy(lean([1208, 538]))} ${xy(lean([1226, 538]))} ${xy(lean([1246, 528]))}" fill="none" stroke="#15191f" stroke-width="5" opacity="0.55" filter="url(#personne-f2)"/>
  <path d="M${xy(lean([1252, 404]))} C${xy(lean([1262, 450]))} ${xy(lean([1260, 500]))} ${xy(lean([1250, 546]))}" fill="none" stroke="#0d1014" stroke-width="12" opacity="0.6" filter="url(#personne-f3)"/>
</g>
`;

/* ==========================================================================
   L'avant-bras, la main et le revolver (un calque qui pivote au coude)
   ========================================================================== */
const ELB = lean([1220, 546]);
// Avant-bras au repos, 58° vers l'avant : la main tient l'arme à hauteur de la
// taille ; la bouche du canon reste au-dessus de y_écran ≈ 820 en 16:9 sur tout
// le plan (bande des sous-titres à partir de 864)
const A0 = (58 * Math.PI) / 180;
const U = [-Math.sin(A0), Math.cos(A0)], N = [Math.cos(A0), Math.sin(A0)];
// (s le long de l'avant-bras, w vers l'arrière) → décor
const fa = (s, w) => [ELB[0] + U[0] * s + N[0] * w, ELB[1] + U[1] * s + N[1] * w];
const FA = (pts) => pts.map(([s, w, c]) => (c ? [...fa(s, w), 1] : fa(s, w)));

const MANCHE = FA([
  [-22, 8], [-14, -22], [4, -32], [40, -31], [80, -28], [120, -25], [146, -23],
  [172, -22], [177, -8], [177, 10], [172, 22], [146, 23], [120, 25], [80, 28], [40, 31], [4, 33], [-14, 26],
]);
const FIST = fa(205, -4); // centre de la crosse, dans le poing

// Revolver et main gauche dessinés ensemble « en visée » (canon vers la gauche,
// dessus en haut, origine au centre de la crosse), puis tournés pour pendre
// canon vers le sol, un peu en arrière : quand la main remonte, il revient à
// la verticale sans se tourner vers le berceau.
// Silhouette de la bible : canon court (≈ deux fois le barillet), barillet
// bombé, chien à l'arrière, pontet rond, crosse en bois arrondie et inclinée.
// On voit le dos de la main, l'index allongé le long de la carcasse, hors du
// pontet ; le pouce est de l'autre côté de l'arme.
const GUN_TF = `translate(${xy(FIST)}) rotate(-96)`;
const HAND = [
  [-2, -35], [9, -31], [20, -22], [30, -7], [36, 9], [38, 25], [30, 38], [14, 40], [0, 34], // 0-8 dos de la main, poignet
  [-12, 28], [-21, 20], [-25, 9], [-26, -3], [-25, -15], [-22, -24], [-16, -30], [-9, -34], // 9-16 doigts repliés sur la crosse
];
const INDEX = [[-14, -31], [-26, -35], [-40, -37.5], [-50, -38], [-55, -36], [-51, -32.5], [-40, -32], [-26, -29.5], [-15, -26]];
// Barillet : bouts arrondis, plus haut que le canon
const CYL = 'M-47 -68 L-29 -68 C-24 -68 -22 -61 -22 -49 C-22 -37 -24 -30 -29 -30 L-47 -30 C-52 -30 -54 -37 -54 -49 C-54 -61 -52 -68 -47 -68 Z';
const GUN = `
<g transform="${GUN_TF}">
  <!-- crosse en bois sombre, arrondie, inclinée vers l'arrière -->
  <path d="M-18 -36 C-12 -41 -6 -45 0 -48 C4 -48 7 -44 9 -38 C14 -24 20 -8 24 8 C28 24 25 38 15 41 C6 43 0 36 -2 25 C-6 8 -12 -14 -18 -36 Z" fill="url(#personne-crosse)"/>
  <path d="M1.5 -47 C5 -46 7.5 -42 9.5 -37" fill="none" stroke="#b0805a" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>
  <!-- canon court, baguette d'éjection dessous, guidon -->
  <path d="M-116 -61.5 C-116 -62.5 -115 -63 -114 -63 L-58 -63 L-58 -43.5 L-94 -43.5 C-99 -43.5 -102 -46 -104 -50 L-114 -50 C-115 -50 -116 -50.5 -116 -51.5 Z" fill="url(#personne-canon)"/>
  <path d="M-58 -50 L-103 -50" stroke="#15191d" stroke-width="1.4" opacity="0.6"/>
  <path d="M-114 -63 L-112.5 -67 L-108 -67 L-107 -63 Z" fill="${P.steelDark}"/>
  <!-- carcasse et pontet rond -->
  <path d="M-60 -67 L-14 -67 C-8 -67 -4 -64 -3 -59 C-2 -54 -1 -50 0 -47 L-6 -44 L-16 -35 L-22 -31 L-40 -31 L-56 -33 L-60 -40 Z" fill="${P.steelDark}"/>
  <path d="M-40 -31 C-43 -17 -35 -9.5 -26.5 -9.5 C-17 -9.5 -13 -17 -16.5 -33" fill="none" stroke="${P.steelDark}" stroke-width="3.6"/>
  <path d="M-28.5 -31 C-28.5 -24 -26.5 -19 -22.5 -16" fill="none" stroke="#2a3036" stroke-width="3" stroke-linecap="round"/>
  <!-- chien, à l'arrière -->
  <path d="M-12 -64 C-10 -69 -4 -72 3 -73 C7 -73.5 9.5 -72 9 -69.5 C8 -67 4 -65.5 1 -63 L-3 -58 Z" fill="${P.steelDark}"/>
  <!-- barillet bombé : cannelures et reflet doux -->
  <path d="${CYL}" fill="url(#personne-barillet)"/>
  <g clip-path="url(#personne-c-barillet)" fill="none">
    <path d="M-56 -57 L-20 -57 M-56 -42 L-20 -42" stroke="#15191d" stroke-width="3.2" opacity="0.55"/>
    <path d="M-56 -55 L-20 -55 M-56 -40 L-20 -40" stroke="#7c868f" stroke-width="1.2" opacity="0.45"/>
  </g>
  <path d="M-55.5 -62 L-55.5 -36" stroke="#0f1215" stroke-width="1.6" opacity="0.8"/>
  <!-- reflets sobres : les bords tournés vers la fenêtre -->
  <path d="M-98 -44.1 L-60 -44.1" stroke="${P.steelLight}" stroke-width="1.3" opacity="0.6"/>
  <path d="M-114 -50.6 L-100 -50.6" stroke="${P.steelLight}" stroke-width="1.1" opacity="0.5"/>
  <path d="M-50 -30.8 C-40 -30.6 -32 -30.6 -27 -30.9" stroke="${P.steelLight}" stroke-width="1.6" opacity="0.65"/>
  <path d="M-38 -14 C-34 -10.5 -29 -9.4 -24 -10" stroke="${P.steelLight}" stroke-width="1.2" opacity="0.5"/>
  <path d="M3 -72.6 C6.5 -73 9 -72 8.6 -69.8" stroke="${P.steelLight}" stroke-width="1.3" opacity="0.7"/>
  <!-- la main -->
  <path d="${arc(HAND, 15, 19)}" fill="none" stroke="#120d0a" stroke-width="5" stroke-linecap="round" opacity="0.7" filter="url(#personne-f2)"/>
  <path d="${shape(HAND)}" fill="url(#personne-main)"/>
  <g clip-path="url(#personne-c-main)" fill="none" stroke-linecap="round">
    <path d="${arc(HAND, 9, 16)}" stroke="#9a6247" stroke-width="10" opacity="0.4" filter="url(#personne-f4)"/>
    <path d="M-26 -14 L-17 -13 M-27 1 L-18 2 M-24 15 L-15 16" stroke="#2c1d17" stroke-width="2" opacity="0.7"/>
    <path d="M6 -32 C14 -12 18 8 20 28" stroke="#33231d" stroke-width="5" opacity="0.4" filter="url(#personne-f2)"/>
  </g>
  ${rim(arc(HAND, 3, 9), 'personne-c-main', 8, 1.4, '#ecb47e')}
  <path d="${shape(INDEX)}" fill="#4e3329"/>
  ${rim(arc(INDEX, 5, 9), 'personne-c-index', 5, 0, '#b47452', 'personne-f2')}
</g>`;

const MAIN = `
<defs>
  <clipPath id="personne-c-manche"><path d="${shape(MANCHE)}"/></clipPath>
  <clipPath id="personne-c-main"><path d="${shape(HAND)}"/></clipPath>
  <clipPath id="personne-c-index"><path d="${shape(INDEX)}"/></clipPath>
  <clipPath id="personne-c-barillet"><path d="${CYL}"/></clipPath>
  ${grad('personne-canon', 0, -63, 0, -43.5, [[0, '#1b2025'], [0.4, '#343d45'], [0.62, '#2a3138'], [1, '#4f5962']])}
  ${grad('personne-barillet', 0, -68, 0, -30, [[0, '#191d22'], [0.25, '#323a42'], [0.48, '#4e5964'], [0.7, '#2c333a'], [0.9, '#20262c'], [1, '#5d6873']])}
  ${grad('personne-avbras', ...fa(0, -32), ...fa(0, 34), [[0, '#353f4d'], [0.45, C.pull], [1, C.pullDark]])}
  ${grad('personne-main', -30, 0, 38, 0, [[0, '#5a3b2f'], [0.5, '#4a3128'], [1, '#352520']])}
  ${grad('personne-crosse', -2, 0, 12, 0, [[0, '#24180f'], [0.6, '#33241a'], [1, C.grip]])}
  ${blur('personne-f2', 2)}${blur('personne-f4', 4)}
  ${brosse('personne-br-manche', 0.05, 0.02, 12)}
</defs>
${GUN}
<path d="${shape(MANCHE)}" fill="url(#personne-avbras)"/>
<g clip-path="url(#personne-c-manche)">
  <rect x="960" y="500" width="300" height="220" fill="${C.pullFill}" opacity="0.45" filter="url(#personne-br-manche)"/>
  <!-- poignet côtelé -->
  <path d="M${xy(fa(146, -30))} L${xy(fa(146, 30))} L${xy(fa(180, 30))} L${xy(fa(180, -30))} Z" fill="#262d37"/>
  <g stroke="#1a1f26" stroke-width="1.8" opacity="0.7">
    ${Array.from({ length: 9 }, (_, i) => { const w = -20 + i * 5.2; return `<line x1="${f1(fa(149, w)[0])}" y1="${f1(fa(149, w)[1])}" x2="${f1(fa(175, w)[0])}" y2="${f1(fa(175, w)[1])}"/>`; }).join('')}
  </g>
  <path d="M${xy(fa(30, -36))} C${xy(fa(50, -10))} ${xy(fa(60, 10))} ${xy(fa(70, 34))}" fill="none" stroke="#14181e" stroke-width="5" opacity="0.5" filter="url(#personne-f2)"/>
  <!-- la manche fronce au-dessus du poignet -->
  <path d="M${xy(fa(118, -30))} C${xy(fa(124, -10))} ${xy(fa(128, 6))} ${xy(fa(134, 30))}" fill="none" stroke="#13171d" stroke-width="3.5" opacity="0.55" filter="url(#personne-f2)"/>
  <path d="M${xy(fa(100, -30))} C${xy(fa(108, -14))} ${xy(fa(110, 0))} ${xy(fa(114, 12))}" fill="none" stroke="#3f4c5f" stroke-width="2.5" opacity="0.45"/>
  <path d="M${xy(fa(-6, -20))} C${xy(fa(4, -6))} ${xy(fa(6, 8))} ${xy(fa(2, 26))}" fill="none" stroke="#11151a" stroke-width="5" opacity="0.5" filter="url(#personne-f2)"/>
</g>
${rim(open(FA([[20, 33], [60, 29], [120, 25], [150, 24], [172, 22]])), 'personne-c-manche', 14, 0, '#6a5246', 'personne-f4')}
${rim(open(FA([[10, -32], [80, -28], [140, -24]])), 'personne-c-manche', 8, 0, '#56616f', 'personne-f4')}
`;

/* ==========================================================================
   Fond : mur bleu-gris dans l'ombre, grande fenêtre éblouissante, jardin
   d'après-midi à travers la vitre, appui de fenêtre
   ========================================================================== */
const WIN = { x0: 600, x1: 1740, top: -150, sill: 598, mull: 1452 };
const r = rng(31);
const feuilles = (cx, cy, rx, ry, n, col, op) =>
  Array.from({ length: n }, () => {
    const x = cx + (r() - 0.5) * rx * 2, y = cy + (r() - 0.5) * ry * 2, s = 30 + r() * 60;
    return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(s)}" ry="${f1(s * (0.6 + r() * 0.3))}" fill="${col}" opacity="${op}"/>`;
  }).join('');

// Ligne de massifs du jardin, irrégulière (vue floue à travers la vitre)
const massif = (base, amp, seed) => {
  const rr = rng(seed);
  const pts = [[WIN.x0 - 20, 640]];
  for (let x = WIN.x0 - 20; x <= WIN.x1 + 20; x += 70 + rr() * 50) pts.push([x, base - amp * (0.3 + rr() * 0.7)]);
  pts.push([WIN.x1 + 20, 640]);
  return open(pts) + 'Z';
};

const FOND = `
<defs>
  ${grad('personne-mur', -240, 0, 2160, 0, [[0, '#434e57'], [0.18, '#525e67'], [0.45, '#636f77'], [0.85, '#67737a'], [1, '#525e67']])}
  ${grad('personne-mur-v', 0, -140, 0, 1220, [[0, '#262c36', 0.35], [0.4, '#262c36', 0], [1, '#262c36', 0.15]])}
  ${grad('personne-rebond', 0, 700, 0, 1220, [[0, '#b38a5f', 0], [0.45, '#c08c58', 0.16], [1, '#d39a5e', 0.42]])}
  ${grad('personne-ciel', 0, -150, 0, 600, [[0, '#f2d3a2'], [0.55, '#f6dfb6'], [1, '#ecd0a0']])}
  ${grad('personne-appui', 0, 598, 0, 616, [[0, '#f4e2bf'], [1, '#dcc49a']])}
  ${grad('personne-ombre-appui', 0, 638, 0, 720, [[0, '#262c34', 0.4], [1, '#262c34', 0]])}
  ${radial('personne-soleil', 1300, 120, 620, [[0, '#fffbf0'], [0.35, '#fff1d6', 0.85], [1, '#ffe8c4', 0]])}
  ${radial('personne-halo', 1170, 200, 1000, [[0, '#f6d29a', 0.5], [0.45, '#d9b285', 0.12], [1, '#d9b285', 0]])}
  ${radial('personne-tache', 40, 860, 300, [[0, '#d9ad74', 0.4], [1, '#d9ad74', 0]])}
</defs>
<rect x="-240" y="-140" width="2400" height="1360" fill="url(#personne-mur)"/>
<!-- angle avec le mur du berceau, un peu plus chaud -->
<rect x="-240" y="-140" width="380" height="1360" fill="#67706f"/>
<rect x="-240" y="-140" width="380" height="1360" fill="url(#personne-tache)"/>
<line x1="140" y1="-140" x2="140" y2="1220" stroke="#363f46" stroke-width="6" opacity="0.5"/>
<rect x="-240" y="-140" width="2400" height="1360" fill="url(#personne-halo)"/>
<rect x="-240" y="-140" width="2400" height="1360" fill="url(#personne-mur-v)"/>
<rect x="-240" y="${WIN.sill + 30}" width="2400" height="700" fill="#27313f" opacity="0.42"/>
<!-- rebond chaud du plancher ensoleillé sur le bas des murs -->
<rect x="-240" y="600" width="2400" height="620" fill="url(#personne-rebond)"/>
<!-- encadrement crème, à contre-jour -->
<rect x="${WIN.x0 - 32}" y="${WIN.top}" width="${WIN.x1 - WIN.x0 + 64}" height="${WIN.sill - WIN.top + 4}" fill="#cdc0a6"/>
<!-- la vitre : ciel pâle, jardin brûlé de lumière -->
<rect x="${WIN.x0}" y="${WIN.top}" width="${WIN.x1 - WIN.x0}" height="${WIN.sill - WIN.top}" fill="url(#personne-ciel)"/>
<g>
  ${feuilles(1600, 40, 180, 200, 14, '#e2d3a2', 0.75)}
  ${feuilles(1560, 180, 160, 90, 8, '#d3c492', 0.6)}
  ${feuilles(760, -40, 140, 110, 8, '#e6d2a4', 0.7)}
  ${feuilles(780, 380, 130, 90, 9, '#d8c795', 0.55)}
  <path d="${massif(440, 90, 4)}" fill="#d6c690" opacity="0.85"/>
  <path d="${massif(520, 60, 8)}" fill="#c4b47c" opacity="0.8"/>
  <rect x="${WIN.x0}" y="${WIN.top}" width="${WIN.x1 - WIN.x0}" height="${WIN.sill - WIN.top}" fill="url(#personne-soleil)"/>
</g>
<!-- montant central et feuillures -->
<rect x="${WIN.mull - 13}" y="${WIN.top}" width="26" height="${WIN.sill - WIN.top}" fill="#d3c6ab"/>
<rect x="${WIN.mull - 13}" y="${WIN.top}" width="6" height="${WIN.sill - WIN.top}" fill="#b8aa90"/>
<rect x="${WIN.x0}" y="${WIN.top}" width="10" height="${WIN.sill - WIN.top}" fill="#c4b69c"/>
<rect x="${WIN.x1 - 10}" y="${WIN.top}" width="10" height="${WIN.sill - WIN.top}" fill="#c4b69c"/>
<!-- tableau de droite -->
<path d="M${WIN.x1 + 32} ${WIN.top} L${WIN.x1 + 64} ${WIN.top} L${WIN.x1 + 64} ${WIN.sill} L${WIN.x1 + 32} ${WIN.sill} Z" fill="#a69880"/>
<!-- appui : dessus pris dans le soleil, chant dans l'ombre -->
<path d="M${WIN.x0 - 48} ${WIN.sill} L${WIN.x1 + 72} ${WIN.sill} L${WIN.x1 + 86} ${WIN.sill + 16} L${WIN.x0 - 62} ${WIN.sill + 16} Z" fill="url(#personne-appui)"/>
<rect x="${WIN.x0 - 62}" y="${WIN.sill + 16}" width="${WIN.x1 - WIN.x0 + 148}" height="22" fill="#7d786e"/>
<rect x="${WIN.x0 - 62}" y="${WIN.sill + 38}" width="${WIN.x1 - WIN.x0 + 148}" height="90" fill="url(#personne-ombre-appui)"/>
`;

/* ==========================================================================
   Rideaux de lin, mi-tirés : lumineux devant la vitre, mats devant le mur
   ========================================================================== */
function rideau(x0, x1, inner, seed) {
  const rr = rng(seed);
  const edge = inner === 'right' ? x1 : x0;
  const out =
    inner === 'right'
      ? `M${x0} -160 L${x1} -160 C${x1 - 4} 120 ${x1 - 16} 360 ${x1 - 10} 600 C${x1 - 4} 820 ${x1 - 18} 1000 ${x1 - 8} 1220 L${x0} 1220 Z`
      : `M${x0} -160 L${x1} -160 L${x1} 1220 L${x0 + 8} 1220 C${x0 + 18} 1000 ${x0 + 4} 820 ${x0 + 10} 600 C${x0 + 16} 360 ${x0 + 4} 120 ${x0} -160 Z`;
  // plis : bandes verticales légèrement ondulées, épaisses (sombres) ou fines (lumineuses)
  const folds = [];
  let x = x0 + 10;
  while (x < x1 - 12) {
    const fw = 22 + rr() * 40;
    const dk = rr() < 0.55;
    const a = 6 + rr() * 9;
    folds.push(
      `<path d="M${f1(x)} -160 C${f1(x + a)} 200 ${f1(x - a)} 600 ${f1(x + a * 0.5)} 1220 L${f1(x + fw + a * 0.5)} 1220 C${f1(x + fw - a)} 600 ${f1(x + fw + a)} 200 ${f1(x + fw)} -160 Z" ` +
        `fill="${dk ? '#88704f' : '#fbe7c2'}" opacity="${dk ? 0.6 : 0.55}"/>`,
    );
    x += fw + 2 + rr() * 10;
  }
  return { out, folds: folds.join(''), edge };
}
const RG = rideau(470, 790, 'right', 5);
const RD = rideau(1588, 1900, 'left', 9);
const RIDEAUX = `
<defs>
  <clipPath id="personne-c-vitre"><rect x="${WIN.x0}" y="${WIN.top - 20}" width="${WIN.x1 - WIN.x0}" height="${WIN.sill - WIN.top + 20}"/></clipPath>
  <clipPath id="personne-c-rg"><path d="${RG.out}"/></clipPath>
  <clipPath id="personne-c-rd"><path d="${RD.out}"/></clipPath>
  ${grad('personne-lin-ombre', 0, -160, 0, 1220, [[0, '#8f8070'], [0.5, '#7e7062'], [1, '#5f564e']])}
  ${grad('personne-lin-bas', 0, WIN.sill + 10, 0, 1200, [[0, '#3c3f45', 0.35], [0.25, '#353a42', 0.62], [1, '#2c3038', 0.72]])}
  ${grad('personne-lin-jour', 0, -160, 0, 600, [[0, '#efcf9a'], [0.7, '#f5dbad'], [1, '#e8c58e']])}
</defs>
${[['rg', RG], ['rd', RD]].map(([id, R]) => `
<g clip-path="url(#personne-c-${id})">
  <rect x="300" y="-160" width="1800" height="1380" fill="url(#personne-lin-ombre)"/>
  <g clip-path="url(#personne-c-vitre)"><rect x="300" y="-160" width="1800" height="1380" fill="url(#personne-lin-jour)"/></g>
  ${R.folds}
  <rect x="300" y="${WIN.sill + 10}" width="1800" height="700" fill="url(#personne-lin-bas)"/>
  <rect x="${R.edge - 10}" y="-160" width="20" height="770" fill="#fff8ea" opacity="0.75"/>
</g>`).join('')}
`;

/* ==========================================================================
   Berceau, au premier plan flou : barre, barreaux, montant à boule
   ========================================================================== */
const RAIL = { a: [-260, 768], b: [668, 668], ta: 66, tb: 46 };
const railY = (x) => lerp(RAIL.a[1], RAIL.b[1], (x - RAIL.a[0]) / (RAIL.b[0] - RAIL.a[0]));
const railT = (x) => lerp(RAIL.ta, RAIL.tb, (x - RAIL.a[0]) / (RAIL.b[0] - RAIL.a[0]));
const POST = { x: 668, w: 50, ball: 580, r: 40 };
const barreaux = (() => {
  const out = [];
  let x = -150, step = 112;
  while (x < POST.x - 50) {
    const k = (x + 150) / (POST.x + 150);
    const w = lerp(46, 32, k);
    const y = railY(x) + railT(x) - 8;
    out.push(
      `<rect x="${f1(x - w / 2)}" y="${f1(y)}" width="${f1(w)}" height="${f1(1270 - y)}" rx="${f1(w / 2)}" fill="url(#personne-barreau)"/>` +
        `<rect x="${f1(x - w * 0.2)}" y="${f1(y + 10)}" width="${f1(w * 0.25)}" height="${f1(1260 - y)}" fill="#8a6440" opacity="0.35"/>`,
    );
    x += step;
    step *= 0.95;
  }
  return out.join('');
})();
const BERCEAU = `
<defs>
  <linearGradient id="personne-barreau" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#3a2618"/><stop offset="0.5" stop-color="#5a3d26"/><stop offset="0.82" stop-color="#7e5733"/><stop offset="0.94" stop-color="#d9a868"/><stop offset="1" stop-color="#f3c886"/>
  </linearGradient>
  ${grad('personne-barre', 0, 640, 0, 840, [[0, '#f8cf8c'], [0.1, '#b9895a'], [0.3, '#6e4b2e'], [1, '#3e2a1a']])}
  ${radial('personne-boule', POST.x, POST.ball, POST.r + 6, [[0, '#8a6440'], [0.5, '#5e3f27'], [1, '#3a2618']], POST.x - 10, POST.ball + 6)}
  ${grad('personne-drap', 0, 600, 0, 760, [[0, P.sheet, 0], [0.7, P.sheet, 0.45], [1, P.sheetShade, 0.6]])}
</defs>
<!-- l'intérieur du berceau : le drap crème, pris dans la lumière -->
<path d="M-260 ${RAIL.a[1] + 6} L-260 ${RAIL.a[1] - 70} C40 ${RAIL.a[1] - 100} 380 ${RAIL.b[1] - 84} ${POST.x} ${RAIL.b[1] - 40} L${POST.x} ${RAIL.b[1] + 6} Z" fill="url(#personne-drap)"/>
${barreaux}
<!-- la barre -->
<path d="M${RAIL.a[0]} ${RAIL.a[1]} L${RAIL.b[0]} ${RAIL.b[1]} L${RAIL.b[0]} ${RAIL.b[1] + RAIL.tb} L${RAIL.a[0]} ${RAIL.a[1] + RAIL.ta} Z" fill="url(#personne-barre)"/>
<path d="M${RAIL.a[0]} ${RAIL.a[1] + 4} L${RAIL.b[0]} ${RAIL.b[1] + 3}" stroke="#ffe0a4" stroke-width="7" opacity="0.9"/>
<!-- montant à boule -->
<rect x="${POST.x - POST.w / 2}" y="${POST.ball + 20}" width="${POST.w}" height="700" rx="22" fill="url(#personne-barreau)"/>
<rect x="${POST.x - POST.w / 2}" y="${POST.ball + 60}" width="${POST.w}" height="660" fill="#2a1c12" opacity="0.35"/>
<path d="M${POST.x - 22} ${POST.ball + 30} C${POST.x - 18} ${POST.ball + 16} ${POST.x + 18} ${POST.ball + 16} ${POST.x + 22} ${POST.ball + 30} Z" fill="#86603b"/>
<circle cx="${POST.x}" cy="${POST.ball}" r="${POST.r}" fill="url(#personne-boule)"/>
<path d="M${POST.x - POST.r * 0.5} ${POST.ball - POST.r * 0.86} A${POST.r} ${POST.r} 0 0 1 ${POST.x + POST.r * 0.98} ${POST.ball - 4}" fill="none" stroke="#ffdc9c" stroke-width="10" stroke-linecap="round"/>
`;

/* ==========================================================================
   Effets procéduraux : halo de la fenêtre, bokeh du jardin, lumière qui
   enveloppe la silhouette, rayons, poussière, étalonnage
   ========================================================================== */
let SPR = null;
function sprites() {
  if (SPR) return SPR;
  const mk = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
  // Rayon : profil doux en travers, apparition puis extinction le long
  const beam = mk(64, 512);
  const b = beam.getContext('2d');
  const gx = b.createLinearGradient(0, 0, 64, 0);
  [[0, 0], [0.15, 0.12], [0.35, 0.6], [0.5, 1], [0.65, 0.6], [0.85, 0.12], [1, 0]].forEach(([o, a]) => gx.addColorStop(o, `rgba(255,204,128,${a})`));
  b.fillStyle = gx;
  b.fillRect(0, 0, 64, 512);
  b.globalCompositeOperation = 'destination-in';
  const gy = b.createLinearGradient(0, 0, 0, 512);
  [[0, 0], [0.08, 1], [0.4, 0.75], [1, 0]].forEach(([o, a]) => gy.addColorStop(o, `rgba(0,0,0,${a})`));
  b.fillStyle = gy;
  b.fillRect(0, 0, 64, 512);
  // Point doux (poussière, bokeh)
  const dot = mk(64, 64);
  const d = dot.getContext('2d');
  const gd = d.createRadialGradient(32, 32, 0, 32, 32, 32);
  gd.addColorStop(0, 'rgba(255,242,210,1)');
  gd.addColorStop(0.3, 'rgba(255,228,175,0.6)');
  gd.addColorStop(1, 'rgba(255,214,150,0)');
  d.fillStyle = gd;
  d.fillRect(0, 0, 64, 64);
  // Disque de bokeh : bord un peu plus marqué, comme un objectif ouvert
  const disc = mk(64, 64);
  const e = disc.getContext('2d');
  const ge = e.createRadialGradient(32, 32, 0, 32, 32, 31);
  ge.addColorStop(0, 'rgba(255,246,226,0.6)');
  ge.addColorStop(0.8, 'rgba(255,240,214,0.68)');
  ge.addColorStop(0.92, 'rgba(255,236,205,0.74)');
  ge.addColorStop(1, 'rgba(255,236,205,0)');
  e.fillStyle = ge;
  e.fillRect(0, 0, 64, 64);
  return (SPR = { beam, dot, disc });
}

// Rayons : la lumière traverse la vitre à gauche du visage et descend vers le
// berceau ; ils divergent depuis le soleil, derrière la fenêtre en haut à droite
const SUN = [2150, -950];
const RAYS = [
  // origine x, y (dans la vitre), largeur, intensité, phase
  [760, -60, 170, 0.7, 0.0], [880, 80, 80, 0.55, 1.7], [990, -110, 210, 0.62, 3.1],
  [700, 260, 120, 0.5, 2.2], [1050, 130, 64, 0.38, 5.3], [830, 420, 150, 0.45, 4.4],
  [1120, -140, 120, 0.4, 0.9], [620, 120, 560, 0.2, 2.8],
  // plus raides : ils passent devant le regard et se posent sur le berceau
  [930, 120, 90, 0.42, 1.2, [-0.5, 1]], [1000, 330, 60, 0.36, 3.9, [-0.55, 1]], [860, 380, 120, 0.3, 0.4, [-0.42, 1]],
].map(([x, y, w, k, ph, dir]) => {
  const dx = dir ? dir[0] : x - SUN[0], dy = dir ? dir[1] : y - SUN[1], l = Math.hypot(dx, dy);
  return { x, y, w, k, ph, d: [dx / l, dy / l] };
});
const rayK = (T, ry) => ry.k * (0.7 + 0.3 * Math.sin(T * 0.42 + ry.ph));
function rayons(c, T) {
  const { beam } = sprites();
  c.globalCompositeOperation = 'screen';
  for (const ry of RAYS) {
    c.save();
    c.globalAlpha = Math.min(1, rayK(T, ry));
    c.translate(ry.x, ry.y);
    c.rotate(Math.atan2(ry.d[1], ry.d[0]) - Math.PI / 2);
    c.drawImage(beam, -ry.w / 2, 0, ry.w, 1700);
    c.restore();
  }
}

// Poussière en suspension : positions fixées par une graine, dérive lente
const MOTES = (() => {
  const rr = rng(77);
  return Array.from({ length: 150 }, () => ({
    x: rr() * 1300 - 120, y: rr() * 1160 - 80, ph: rr() * TAU, sp: 0.5 + rr(), s: 1.8 + rr() * 2.8,
  }));
})();
const NEAR = (() => {
  const rr = rng(91);
  return Array.from({ length: 9 }, () => ({ x: rr() * 1000, y: 80 + rr() * 650, ph: rr() * TAU, s: 10 + rr() * 18 }));
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
function poussiere(c, T) {
  const { dot } = sprites();
  c.globalCompositeOperation = 'screen';
  for (const m of MOTES) {
    // dérive : montée très lente, balancement, bouclée dans la zone
    const x = wrap(m.x + 16 * Math.sin(T * 0.23 * m.sp + m.ph) - 5 * T, -120, 1300);
    const y = wrap(m.y + 10 * Math.sin(T * 0.31 * m.sp + m.ph * 1.7) - 7 * T * m.sp, -80, 1160);
    if (x > 1040 && y > 90) continue; // dans l'ombre de la personne
    const b = beamAt(x, y, T);
    const tw = 0.6 + 0.4 * Math.sin(T * 1.1 * m.sp + m.ph * 3);
    const a = Math.min(1, 0.03 + b * 2.6) * tw;
    if (a < 0.04) continue;
    c.globalAlpha = a;
    c.drawImage(dot, x - m.s, y - m.s, m.s * 2, m.s * 2);
  }
}
function bokeh(c, T) {
  const { dot } = sprites();
  c.globalCompositeOperation = 'screen';
  for (const m of NEAR) {
    const x = m.x + 22 * Math.sin(T * 0.12 + m.ph), y = m.y + 14 * Math.sin(T * 0.09 + m.ph * 2) - 3 * T;
    c.globalAlpha = 0.12 + 0.08 * Math.sin(T * 0.5 + m.ph);
    c.drawImage(dot, x - m.s, y - m.s, m.s * 2, m.s * 2);
  }
}

// Le soleil caresse la barre et la boule du montant du berceau
function caresse(c, T, dx) {
  c.globalCompositeOperation = 'screen';
  const k = 0.75 + 0.25 * Math.sin(T * 0.42 + 2.2);
  const g = c.createRadialGradient(POST.x + dx + 6, POST.ball - 8, 0, POST.x + dx, POST.ball, 120);
  g.addColorStop(0, `rgba(255,214,150,${0.8 * k})`);
  g.addColorStop(1, 'rgba(255,214,150,0)');
  c.fillStyle = g;
  c.fillRect(POST.x + dx - 130, POST.ball - 130, 260, 260);
  const h = c.createLinearGradient(RAIL.a[0], 0, RAIL.b[0], 0);
  h.addColorStop(0, 'rgba(255,206,130,0)');
  h.addColorStop(0.55, `rgba(255,206,130,${0.35 * k})`);
  h.addColorStop(1, `rgba(255,206,130,${0.2 * k})`);
  c.strokeStyle = h;
  c.lineCap = 'round';
  [[34, 0.45], [14, 0.8]].forEach(([w, a]) => {
    c.globalAlpha = a;
    c.lineWidth = w;
    c.beginPath();
    c.moveTo(RAIL.a[0] + dx, RAIL.a[1] + 6);
    c.lineTo(RAIL.b[0] + dx, RAIL.b[1] + 5);
    c.stroke();
  });
}

// Halo de la vitre derrière la personne, bokeh du jardin et reflets de
// feuillage qui bougent doucement sur le lin
const JARDIN = (() => {
  const rr = rng(57);
  // feuilles qui scintillent près du soleil, puis grands disques flous du jardin
  return Array.from({ length: 30 }, (_, i) =>
    i < 12
      ? { x: 1330 + rr() * 380, y: -100 + rr() * 300, s: 10 + rr() * 22, ph: rr() * TAU, k: 0.25 + rr() * 0.4 }
      : { x: 790 + rr() * 950, y: -80 + rr() * 640, s: 16 + rr() * 50, ph: rr() * TAU, k: 0.16 + rr() * 0.3 },
  );
})();
function fenetre(c, T) {
  const { disc } = sprites();
  c.globalCompositeOperation = 'screen';
  const g = c.createRadialGradient(1180, 200, 40, 1180, 230, 780);
  g.addColorStop(0, 'rgba(255,226,174,0.45)');
  g.addColorStop(0.45, 'rgba(255,196,124,0.14)');
  g.addColorStop(1, 'rgba(255,196,124,0)');
  c.fillStyle = g;
  c.fillRect(-240, -140, 2400, 1360);
  const nimbe = c.createRadialGradient(1175, 200, 0, 1190, 230, 470);
  nimbe.addColorStop(0, 'rgba(255,246,222,0.85)');
  nimbe.addColorStop(0.4, 'rgba(255,226,170,0.35)');
  nimbe.addColorStop(1, 'rgba(255,206,136,0)');
  c.fillStyle = nimbe;
  c.fillRect(700, -260, 980, 980);
  const sun = c.createRadialGradient(1470, 10, 0, 1470, 10, 420);
  sun.addColorStop(0, 'rgba(255,240,206,0.6)');
  sun.addColorStop(0.5, 'rgba(255,214,150,0.18)');
  sun.addColorStop(1, 'rgba(255,214,150,0)');
  c.fillStyle = sun;
  c.fillRect(1050, -410, 840, 840);
  for (const b of JARDIN) {
    const k = b.k * (0.55 + 0.45 * Math.sin(T * 0.7 + b.ph)) * (b.s > 45 ? 0.5 : 1);
    c.globalAlpha = k;
    c.drawImage(disc, b.x + 6 * Math.sin(T * 0.3 + b.ph) - b.s, b.y - b.s, b.s * 2, b.s * 2);
  }
  c.globalAlpha = 1;
  const rr = rng(13);
  for (let i = 0; i < 9; i++) {
    const side = i % 2 ? [1600, 1880] : [480, 780];
    const x = lerp(side[0], side[1], rr()) + 18 * Math.sin(T * 0.5 + i);
    const y = -60 + rr() * 640 + 10 * Math.sin(T * 0.37 + i * 2);
    const s = 50 + rr() * 70;
    const k = 0.1 + 0.1 * (0.5 + 0.5 * Math.sin(T * 0.8 + i * 1.3));
    const gg = c.createRadialGradient(x, y, 0, x, y, s);
    gg.addColorStop(0, `rgba(255,244,214,${k})`);
    gg.addColorStop(1, 'rgba(255,244,214,0)');
    c.fillStyle = gg;
    c.fillRect(x - s, y - s, s * 2, s * 2);
  }
}

// La lumière enveloppe les bords éclairés de la silhouette
let PATHS = null;
function paths() {
  if (PATHS) return PATHS;
  return (PATHS = {
    nuque: new Path2D(arc(HEAD, 32, 35)), // sous les cheveux seulement
    cheveux: new Path2D(arc(HAIR, 1, 14)),
    dos: new Path2D(arc(TORSE, 2, 13)),
    reins: new Path2D(arc(TORSE, 14, 19)),
  });
}
function glow(c, p2d, k = 1) {
  c.strokeStyle = '#ffcf8c';
  c.lineJoin = c.lineCap = 'round';
  [[22, 0.035], [10, 0.06], [4, 0.08]].forEach(([w, a]) => {
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
function halos(c, tfs) {
  const P2 = paths();
  c.globalCompositeOperation = 'screen';
  c.save();
  applyTf(c, tfs.tete);
  c.translate(HX, HY); c.scale(HS, HS); c.translate(10, 45); c.rotate((HREST * Math.PI) / 180); c.translate(-10, -45);
  glow(c, P2.cheveux, 0.9);
  glow(c, P2.nuque, 0.6);
  c.restore();
  c.save();
  applyTf(c, tfs.corps);
  glow(c, P2.dos, 0.8);
  glow(c, P2.reins, 0.3);
  c.restore();
}

// Étalonnage : ombres légèrement bleutées partout (plus dans le coin haut
// gauche), petite fuite de lumière chaude dans le coin haut droit
function etalonnage(c, W, H) {
  c.globalCompositeOperation = 'multiply';
  c.fillStyle = 'rgb(236,240,250)';
  c.fillRect(0, 0, W, H);
  const v = c.createRadialGradient(0, 0, 0, 0, 0, Math.hypot(W, H) * 0.55);
  v.addColorStop(0, 'rgb(206,214,234)');
  v.addColorStop(1, 'rgb(255,255,255)');
  c.fillStyle = v;
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'screen';
  const g = c.createRadialGradient(W * 0.98, -H * 0.3, 0, W * 0.98, -H * 0.3, W * 0.48);
  g.addColorStop(0, 'rgba(255,200,130,0.3)');
  g.addColorStop(1, 'rgba(255,200,130,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}

/* ==========================================================================
   Le décor
   ========================================================================== */
export default {
  id: 'personne',
  bg: '#1a1d22',
  home: { x: 960, y: 540, z: 1 },
  layers: {
    fond: { box: [-240, -140, 2400, 1360], svg: FOND, filters: ['paint', 'b10'], par: 0.9 },
    rideaux: { box: [380, -160, 1620, 1380], svg: RIDEAUX, filters: ['paint', 'b6'], par: 0.92 },
    tete: { box: [1000, 80, 290, 330], svg: TETE, filters: ['paint'] },
    corps: { box: [1060, 290, 290, 890], svg: CORPS, filters: ['paint'] },
    main: { box: [910, 480, 350, 400], svg: MAIN, filters: ['paint'] },
    berceau: { box: [-260, 500, 1000, 760], svg: BERCEAU, filters: ['paint', 'b6'], par: 1.35 },
  },

  // p.tilt : inclinaison de la tête vers le berceau (0 → 1)
  // p.lift : la main remonte légèrement le revolver (0 → 1)
  render(g, p, T) {
    const tilt = p.tilt ?? 0, lift = p.lift ?? 0;
    const br = Math.sin((T * TAU) / 4.6); // respiration lente
    const rise = -0.0045 * br * (1100 - 330); // les épaules montent de ~3 px
    const tfs = {
      corps: { y: FIG_DY, sy: 1 + 0.0045 * br, ox: 1220, oy: 1100 },
      tete: { y: FIG_DY + rise, rot: -0.15 * tilt + 0.006 * br, ox: HPIV[0], oy: HPIV[1] },
      main: { y: FIG_DY + rise * 0.72, rot: 0.2 * lift + 0.005 * br, ox: ELB[0], oy: ELB[1] },
    };

    g.img('fond');
    g.img('rideaux', { tf: { rot: 0.0022 * Math.sin(T * 0.55), ox: 1190, oy: -160 } });
    g.fx(0.9, (c) => fenetre(c, T));
    g.img('tete', { tf: tfs.tete });
    g.img('corps', { tf: tfs.corps });
    g.img('main', { tf: tfs.main });
    g.fx(1, (c) => halos(c, tfs));
    g.fx(1, (c) => rayons(c, T));
    g.fx(1, (c) => poussiere(c, T));
    const crib = g.portrait ? { x: 190 } : { x: 0 };
    g.img('berceau', { tf: crib });
    g.fx(1.35, (c) => caresse(c, T, crib.x));
    g.fx(1.35, (c) => bokeh(c, T));
    g.screen((c, W, H) => etalonnage(c, W, H));
  },

  shots: {
    // La personne près du berceau : respiration, la tête s'incline, la main remonte un peu l'arme
    approche: {
      dur: 6.5,
      cam: (t, portrait) => {
        const k = 0.6 * ease.inOut(clamp(t / 6.5)) + 0.4 * clamp(t / 6.5);
        return portrait
          ? { x: lerp(1030, 1038, k), y: lerp(520, 510, k), z: lerp(1.1, 1.15, k) }
          : { x: lerp(950, 962, k), y: lerp(500, 494, k), z: lerp(1.12, 1.16, k) };
      },
      p: (t) => ({ tilt: seg(t, 0.3, 6.4, ease.inOut), lift: seg(t, 2.7, 4.7, ease.inOut) }),
    },
  },
};
