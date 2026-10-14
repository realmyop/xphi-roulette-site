/* ==========================================================================
   La chambre : décor du premier acte, dessiné en SVG (repère 1920 × 1080).
   On ne montre jamais le bébé ni l'arme : un berceau, une couverture qui
   respire, un mobile qui tourne, une lumière de début d'après-midi.
   Les éléments essentiels tiennent dans la bande centrale x 480 → 1440,
   que le téléphone (cadrage serré) et le 16:9 montrent tous les deux.
   ========================================================================== */
import { TAU, clamp, lerp, ease, seeded } from './engine.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}) => {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};

// Silhouette neutre (ni visage, ni genre, ni époque), pieds à l'origine, 580 de haut
const FIG_BODY =
  'M0 -497 C-34 -497 -56 -488 -62 -462 L-70 -200 Q-70 -188 -58 -188 L-30 -188 L-27 -8 ' +
  'Q-27 0 -19 0 L-8 0 Q-2 0 -2 -8 L0 -160 L2 -8 Q2 0 8 0 L19 0 Q27 0 27 -8 L30 -188 ' +
  'L58 -188 Q70 -188 70 -200 L62 -462 C56 -488 34 -497 0 -497 Z';
const figure = (arms = true) =>
  `<path class="fig" d="${FIG_BODY}"/><ellipse class="fig" cx="0" cy="-540" rx="33" ry="40"/>` +
  (arms ? '<path class="ink detail" d="M-49 -452 L-56 -232 M49 -452 L56 -232"/>' : '');

// Barreaux du berceau
const bars = Array.from({ length: 13 }, (_, i) => {
  const x = (902 + i * 26.33).toFixed(1);
  return `<line class="bar" x1="${x}" y1="574" x2="${x}" y2="784"/>`;
}).join('');

const TEMPLATE = `
<defs>
  <clipPath id="doorway-clip"><rect x="520" y="300" width="170" height="420"/></clipPath>
  <mask id="iris-mask" maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="8000" height="8000">
    <rect x="-3000" y="-3000" width="8000" height="8000" fill="#fff"/>
    <circle id="iris-hole" cx="1060" cy="680" r="1700" fill="#000"/>
  </mask>
  <mask id="pov-mask" maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="8000" height="8000">
    <rect x="-3000" y="-3000" width="8000" height="8000" fill="#fff"/>
    <rect id="pov-hole" x="660" y="170" width="600" height="860" fill="#000"/>
  </mask>
</defs>

<g id="cam">
  <rect class="wall" x="-800" y="-600" width="3520" height="1320"/>
  <rect class="floor" x="-800" y="720" width="3520" height="900"/>
  <line class="ink edge" x1="-800" y1="720" x2="2720" y2="720"/>

  <!-- Cadre au mur : un soleil, un horizon -->
  <rect class="solid" x="250" y="300" width="140" height="104"/>
  <circle class="ink detail" cx="320" cy="342" r="17"/>
  <line class="ink detail" x1="262" y1="382" x2="378" y2="382"/>

  <!-- Commode et lampe -->
  <rect class="solid" x="210" y="560" width="240" height="160"/>
  <line class="ink detail" x1="210" y1="613" x2="450" y2="613"/>
  <line class="ink detail" x1="210" y1="666" x2="450" y2="666"/>
  <circle class="ink detail" cx="330" cy="587" r="4"/>
  <circle class="ink detail" cx="330" cy="640" r="4"/>
  <circle class="ink detail" cx="330" cy="693" r="4"/>
  <rect class="solid" x="322" y="512" width="16" height="48"/>
  <path class="solid" d="M296 514 L364 514 L350 464 L310 464 Z"/>

  <!-- Porte du fond : embrasure claire, silhouette, battant -->
  <rect class="glow" x="520" y="300" width="170" height="420"/>
  <g clip-path="url(#doorway-clip)"><g id="in-door">${figure(false)}</g></g>
  <polygon id="door-leaf" class="solid" points="520,300 690,300 690,720 520,720"/>
  <circle id="door-knob" class="ink detail" cx="670" cy="520" r="6"/>
  <rect class="ink" x="520" y="300" width="170" height="420"/>

  <!-- Fenêtre, rideaux mi-clos -->
  <rect class="glow" x="1300" y="250" width="200" height="330"/>
  <line class="ink" x1="1400" y1="250" x2="1400" y2="580"/>
  <line class="ink" x1="1300" y1="415" x2="1500" y2="415"/>
  <rect class="ink" x="1300" y="250" width="200" height="330"/>
  <line class="ink" x1="1286" y1="582" x2="1514" y2="582"/>
  <line class="ink" x1="1250" y1="226" x2="1550" y2="226"/>
  <path class="curtain" d="M1258 226 L1352 226 C1346 330 1358 450 1344 604 L1262 604 C1272 450 1252 330 1258 226 Z"/>
  <path class="ink detail" d="M1290 236 C1286 360 1296 480 1288 596 M1320 236 C1318 360 1326 480 1318 596"/>
  <path class="curtain" d="M1430 226 L1542 226 C1538 330 1550 450 1544 604 L1440 604 C1448 470 1426 330 1430 226 Z"/>
  <path class="ink detail" d="M1470 236 C1466 360 1478 480 1472 596 M1506 236 C1502 360 1512 480 1508 596"/>

  <!-- Tapis, faisceau de lumière, poussière -->
  <ellipse class="rug" cx="1060" cy="935" rx="350" ry="54"/>
  <polygon id="beam" class="beam" points=""/>
  <polygon id="patch" class="patch" points=""/>
  <g id="dust"></g>

  <!-- Mobile -->
  <line class="ink" x1="1060" y1="-600" x2="1060" y2="332"/>
  <g id="mobile-arms"></g>
  <circle class="solid" cx="1060" cy="332" r="7"/>
  <g id="mobile-pend"></g>

  <!-- Berceau : matelas, couverture qui respire, barreaux, montants -->
  <rect class="solid" x="890" y="760" width="340" height="24"/>
  <g id="blanket"><path class="soft" d="M904 762 C930 722 994 702 1058 704 C1122 706 1166 724 1192 744 C1203 752 1210 758 1214 762 Z"/></g>
  ${bars}
  <rect class="solid" x="866" y="556" width="388" height="18"/>
  <rect class="solid" x="866" y="784" width="388" height="16"/>
  <rect class="solid" x="858" y="536" width="18" height="350"/>
  <rect class="solid" x="1244" y="536" width="18" height="350"/>

  <!-- La personne, debout près du berceau -->
  <g id="figure" transform="translate(760 905)">${figure()}</g>

  <!-- Iris : le cadre se referme sur le berceau quand on vise -->
  <rect id="iris" class="iris" x="-3000" y="-3000" width="8000" height="8000" mask="url(#iris-mask)"/>
</g>

<!-- Vue subjective (variante D) : on est dans le couloir, face à la porte -->
<g id="pov">
  <rect class="pov-wall" x="-3000" y="-3000" width="8000" height="8000" mask="url(#pov-mask)"/>
  <rect id="pov-frame" class="ink" x="660" y="170" width="600" height="860"/>
  <polygon id="pov-leaf" class="pov-leaf" points=""/>
  <circle id="pov-knob" class="ink" r="9"/>
</g>

<rect id="fade" x="-3000" y="-3000" width="8000" height="8000" fill="#000" opacity="0"/>
`;

export function createRoom(svg, { style }) {
  svg.innerHTML = TEMPLATE;
  const $ = (id) => svg.querySelector('#' + id);
  const cam = $('cam'), leaf = $('door-leaf'), knob = $('door-knob'), inDoor = $('in-door');
  const fig = $('figure'), blanket = $('blanket'), irisRect = $('iris'), irisHole = $('iris-hole');
  const beam = $('beam'), patch = $('patch'), fade = $('fade');
  const pov = $('pov'), povHole = $('pov-hole'), povFrame = $('pov-frame'), povLeaf = $('pov-leaf'), povKnob = $('pov-knob');

  // Mobile : trois pendeloques rondes, cousines du barillet
  const pend = [{ len: 70, r: 18 }, { len: 108, r: 13 }, { len: 88, r: 22 }].map((p) => {
    const g = el('g');
    const string = el('line', { class: 'ink' });
    const disc = el('circle', { class: 'solid' });
    const arm = el('line', { class: 'ink' });
    g.append(string, disc);
    $('mobile-pend').append(g);
    $('mobile-arms').append(arm);
    return { ...p, g, string, disc, arm };
  });

  // Poussière dans le faisceau : positions fixées par une graine
  const rnd = seeded(7);
  const motes = Array.from({ length: 38 }, () => {
    const c = el('circle', { class: 'dust' });
    $('dust').append(c);
    return { c, u: rnd(), v: rnd(), sp: 0.5 + rnd(), ph: rnd() * TAU, r: 2 + rnd() * 2.2 };
  });

  // Style « trait » : le décor se dessine trait après trait à l'ouverture
  const drawn = [...svg.querySelectorAll('#cam .ink, #cam .solid, #cam .fig, #cam .soft, #cam .bar, #cam .curtain, #cam .rug')];
  const delays = drawn.map((e, i) => {
    e.setAttribute('pathLength', '1');
    return (i / drawn.length) * 0.62;
  });
  let drawnAt = null;

  function apply(s) {
    const T = s.T;

    // Tracé progressif, puis remplissage
    const draw = style === 'trait' ? s.intro : 1;
    if (draw !== drawnAt) {
      drawnAt = draw;
      drawn.forEach((e, i) => {
        if (draw >= 1) {
          e.style.strokeDasharray = '';
          e.style.strokeDashoffset = '';
        } else {
          e.style.strokeDasharray = '1 1';
          e.style.strokeDashoffset = 1 - clamp((draw - delays[i]) / 0.38);
        }
      });
      svg.style.setProperty('--fillk', clamp((draw - 0.55) / 0.45));
    }
    const fillk = clamp((draw - 0.55) / 0.45);

    // Caméra : (x, y) est le point visé, s le grossissement
    let { x, y, s: zoom } = s.cam;
    if (s.sway) {
      // Caméra portée : un léger tremblement, toujours le même
      x += s.sway * 7 * Math.sin(T * 1.3);
      y += s.sway * 5 * Math.sin(T * 1.9 + 1);
    }
    cam.setAttribute('transform', `translate(960 540) scale(${zoom}) translate(${-x} ${-y})`);

    // Porte du fond : le battant s'ouvre vers le couloir
    const ang = ease.inOut(s.door) * 1.31;
    const xe = 520 + 170 * Math.cos(ang);
    leaf.setAttribute('points', `520,300 ${xe},${300 + 22 * Math.sin(ang)} ${xe},${720 - 14 * Math.sin(ang)} 520,720`);
    knob.setAttribute('cx', 520 + 150 * Math.cos(ang));
    knob.style.opacity = Math.cos(ang) > 0.35 ? 1 : 0;
    inDoor.setAttribute('transform', `translate(${lerp(720, 606, s.inDoor)} 720) scale(.62)`);
    inDoor.style.visibility = s.inDoor > 0 ? 'visible' : 'hidden';
    fig.style.visibility = s.figure > 0 ? 'visible' : 'hidden';

    // Couverture : respiration lente ; agitée si le bébé se réveille (variante B)
    const w = s.wake || 0;
    const sy = 1 + (0.035 + 0.07 * w) * Math.sin((TAU * T) / lerp(3.4, 1.3, w));
    const sx = w * 5 * Math.sin(T * 4.3);
    blanket.setAttribute('transform', `translate(${sx} 762) scale(1 ${sy}) translate(0 -762)`);

    // Mobile : rotation lente, profondeur simulée (taille, opacité, ordre)
    const th = 0.4 * T + 0.3 * Math.sin(0.21 * T);
    pend
      .map((p, i) => {
        const a = th + (i * TAU) / 3;
        return { p, a, z: Math.sin(a) };
      })
      .sort((u, v) => u.z - v.z)
      .forEach(({ p, a, z }) => {
        const px = 1060 + 118 * Math.cos(a), py = 338 + 12 * z;
        p.arm.setAttribute('x1', 1060); p.arm.setAttribute('y1', 334);
        p.arm.setAttribute('x2', px); p.arm.setAttribute('y2', py);
        p.string.setAttribute('x1', px); p.string.setAttribute('y1', py);
        p.string.setAttribute('x2', px); p.string.setAttribute('y2', py + p.len);
        const r = p.r * (1 + 0.12 * z);
        p.disc.setAttribute('cx', px); p.disc.setAttribute('cy', py + p.len + r); p.disc.setAttribute('r', r);
        p.g.style.opacity = 0.6 + 0.4 * (z + 1) / 2;
        p.g.parentNode.append(p.g);
      });

    // Lumière : le faisceau glisse très lentement, comme l'après-midi qui passe
    const d = 14 * Math.sin(T * 0.05);
    beam.setAttribute('points', `1352,252 1430,252 1440,580 ${1385 + d},770 ${1250 + d},1040 ${1160 + d},1040`);
    patch.setAttribute('points', `${1292 + d * 0.4},772 ${1386 + d * 0.4},772 ${1250 + d},1040 ${1160 + d},1040`);
    for (const m of motes) {
      const u = clamp(m.u + 0.05 * Math.sin(T * 0.11 * m.sp + m.ph));
      const v = m.v + 0.12 * Math.sin(T * 0.07 * m.sp + m.ph * 2);
      const xl = lerp(1352, 1160 + d, u), xr = lerp(1430, 1250 + d, u);
      m.c.setAttribute('cx', lerp(xl, xr, clamp(v)));
      m.c.setAttribute('cy', lerp(260, 1030, u) - 10 * Math.sin(T * 0.3 * m.sp + m.ph));
      m.c.setAttribute('r', m.r);
      const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(T * 0.8 * m.sp + m.ph));
      m.c.style.opacity = twinkle * clamp(Math.min(v, 1 - v) * 6) * fillk;
    }

    // Iris sur le berceau
    if (s.iris > 0) {
      irisRect.style.display = '';
      irisHole.setAttribute('r', lerp(1700, 230, ease.inOut(s.iris)));
    } else irisRect.style.display = 'none';

    // Vue subjective : l'embrasure grandit à mesure qu'on avance
    if (s.pov) {
      pov.style.display = '';
      const open = ease.inOut(s.pov.open), walk = ease.in(s.pov.walk);
      const hw = lerp(300, 1500, walk), hh = lerp(430, 1200, walk);
      const x0 = 960 - hw, x1 = 960 + hw, top = 600 - hh, bot = 600 + hh;
      for (const r of [povHole, povFrame]) {
        r.setAttribute('x', x0); r.setAttribute('y', top);
        r.setAttribute('width', 2 * hw); r.setAttribute('height', 2 * hh);
      }
      const xe = lerp(x1, x0 + (x1 - x0) * 0.18, open);
      povLeaf.setAttribute('points', `${x0},${top} ${xe},${top + 40 * open} ${xe},${bot - 26 * open} ${x0},${bot}`);
      povKnob.setAttribute('cx', xe - 34 * (1 - open) - 8);
      povKnob.setAttribute('cy', lerp(top, bot, 0.55));
      povKnob.style.opacity = open < 0.6 ? 1 : 0;
    } else pov.style.display = 'none';

    // Fondu au noir (le style « ombres » s'ouvre en allumant la scène)
    fade.style.opacity = style === 'ombres' ? Math.max(s.fade, 1 - s.intro) : s.fade;
  }

  apply.reset = () => (drawnAt = null);
  return apply;
}
