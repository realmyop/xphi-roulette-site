/* ==========================================================================
   Palette et outils communs à tous les décors du film.
   Les décors sont dessinés en SVG, puis peints une fois pour toutes dans des
   images (au chargement) : les filtres coûteux (texture d'aquarelle, flou de
   profondeur de champ) ne sont calculés qu'une seule fois.
   ========================================================================== */

// Palette : lumière dorée d'après-midi, ombres bleutées, bois miel, lin, rose poudré
export const P = {
  ink: '#2b2220',
  night: '#14121a',
  shadow: '#2f3344',
  wall: '#a9b4b1', wallTop: '#99a5a3', wallLeft: '#86918f', wallRight: '#95a09e',
  ceiling: '#c2b9a7',
  wood: '#c99a62', woodDark: '#8c623d', woodLight: '#e2b77d',
  floor: '#a5734a', floorBack: '#b07d52', floorDark: '#6b4529',
  base: '#e6dfd2',
  linen: '#f3e6cc', linenShade: '#d8c6a3',
  sheet: '#f2e8d8', sheetShade: '#d9c9b0',
  rose: '#d9a39b', roseShade: '#b57e79', roseLight: '#f1c4b9',
  skin: '#f2c8a9', skinShade: '#dba083', skinDeep: '#c4876c', cheek: '#ee9c8c', hair: '#a7744f',
  cloth: '#3e4856', clothDark: '#262c36', clothLight: '#5c6a7a',
  steel: '#6c757d', steelDark: '#20252a', steelLight: '#b4bdc4',
  brass: '#d7a548', brassLight: '#f7d98f', brassDark: '#8a6120',
  sky: '#b3c8cf', skyWarm: '#f4dfbb',
  leaf: '#55684e', leafDark: '#34443a', leafLight: '#8da07a',
  plaster: '#ece0c8', plasterShade: '#d8c8aa', roof: '#4b4d57',
  light: '#ffdba0',
};

// Filtres utilisés à la pixellisation
export const DEFS = `
<defs>
  <filter id="paint" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="3" result="warp"/>
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="7" xChannelSelector="R" yChannelSelector="G" result="shape"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="3" seed="11" result="tex"/>
    <feColorMatrix in="tex" type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1" result="gray"/>
    <feComposite in="shape" in2="gray" operator="arithmetic" k1="0.2" k2="0.9" k3="0" k4="0" result="mod"/>
    <feComposite in="mod" in2="shape" operator="in"/>
  </filter>
  <filter id="ink" x="-2%" y="-2%" width="104%" height="104%">
    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="5" result="w"/>
    <feDisplacementMap in="SourceGraphic" in2="w" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.4"/></filter>
  <filter id="b3" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="b6" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="b10" x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="b16" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="b28" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="28"/></filter>
</defs>`;

// Petits outils de dessin
export const pts = (a) => a.map((p) => p.map((v) => +v.toFixed(1)).join(',')).join(' ');
export const poly = (a, attrs = '') => `<polygon points="${pts(a)}" ${attrs}/>`;
export const lerp = (a, b, k) => a + (b - a) * k;
export const mix2 = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];

// Point d'une droite de fuite : passe par le point de fuite vp et par p, abscisse x
export const along = (vp, p, x) => [x, vp[1] + ((p[1] - vp[1]) * (x - vp[0])) / (p[0] - vp[0])];

// Générateur pseudo-aléatoire à graine (le décor est identique à chaque chargement)
export function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Dégradé linéaire nommé
export const lin = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">` +
  stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('') +
  '</linearGradient>';
export const rad = (id, stops, cx = 0.5, cy = 0.5, r = 0.5, extra = '') =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" ${extra}>` +
  stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('') +
  '</radialGradient>';
