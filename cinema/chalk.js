/* ==========================================================================
   L'arrêt sur image du narrateur : sur l'image figée et assombrie, le
   barillet de l'expérience de pensée est dessiné à la craie lumineuse.
   Mille points en spirale, cent en anneau, six puis quatre chambres ; d'un
   cran à l'autre, les points se regroupent. La balle (laiton) est la seule
   couleur : c'est celle du joueur.
   Repère du barillet : rayon 100, placé et mis à l'échelle selon le format.
   ========================================================================== */
import { TAU, clamp, lerp, ease, seg } from '../film/engine.js';
import { CRANS } from '../film/crans.js';

const GOLD = Math.PI * (3 - Math.sqrt(5));
const B = 371; // le point qui porte la balle dans la spirale de mille
const norm = (a) => ((a % TAU) + TAU) % TAU;

// --- Dispositions et correspondances (précalculées) -----------------------
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
const P1000 = [], RING = [], P100 = [], P6 = [];
for (let i = 0; i < 1000; i++) {
  const p = sun(i);
  P1000.push(p);
  const j = Math.round(norm(Math.atan2(p[1], p[0]) + Math.PI / 2) / (TAU / 100)) % 100;
  RING.push(j);
  P100.push(ringAt(j));
}
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
const RING_B = RING[B];
const CH6_B = chamberOfRing(RING_B);
const CH4_B = Math.round((CH6_B * 60) / 90) % 4;
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
function bulletOf(n) {
  if (n === 1000) return { p: P1000[B], r: 2.9, halo: 7, ho: 1 };
  if (n === 100) return { p: ringAt(RING_B), r: 4.6, halo: 10.5, ho: 1 };
  if (n === 6) return { p: chamberAt(CH6_B, 6), r: 19, halo: 19, ho: 0 };
  return { p: chamberAt(CH4_B, 4), r: 23, halo: 23, ho: 0 };
}

const INK = 'rgba(250,243,230,';

/* s = { appear 0→1, n, to, k (changement de cran), rot (degrés), risk (étiquette 0→1), riskN }
   portrait : cadre téléphone (4:5) ; sinon 16:9. */
export function drawChalk(ctx, W, H, s, portrait) {
  const appear = s.appear ?? 1;
  if (appear <= 0) return;
  const cx = portrait ? W * 0.5 : W * 0.73;
  const cy = portrait ? H * 0.37 : H * 0.4;
  const sc = (portrait ? W * 0.27 : H * 0.2) / 100;
  const from = s.n, to = s.to || null, k = to ? s.k : 0;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(cx, cy);
  ctx.scale(sc, sc);
  ctx.shadowColor = 'rgba(255,236,200,0.45)';
  ctx.shadowBlur = 8;

  // Repère de tir (fixe)
  ctx.strokeStyle = INK + appear + ')';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -101); ctx.lineTo(0, -90); ctx.stroke();

  ctx.rotate(((s.rot || 0) * Math.PI) / 180);

  // Points (mille, cent, ou en train de rejoindre les chambres)
  ctx.fillStyle = INK + '0.92)';
  for (let i = 0; i < 1000; i++) {
    if (i === B) continue;
    const d = 0.3 * (i / 1000);
    const ki = seg(k, d, d + 0.7, ease.inOut);
    let x, y, r, o;
    if (!to && from === 1000) { [x, y] = P1000[i]; r = 1.35; o = clamp((appear * 1.15 - i / 1000) * 8); }
    else if (!to && from === 100) { [x, y] = P100[i]; r = 2.2; o = appear; }
    else if (from === 1000 && to === 100) {
      x = lerp(P1000[i][0], P100[i][0], ki); y = lerp(P1000[i][1], P100[i][1], ki); r = lerp(1.35, 2.2, ki); o = 1;
    } else if (from === 100 && to === 6) {
      x = lerp(P100[i][0], P6[i][0], ki); y = lerp(P100[i][1], P6[i][1], ki); r = lerp(2.2, 1.0, ki); o = 1 - seg(k, 0.55, 1, ease.lin);
    } else continue;
    if (o <= 0.01) continue;
    ctx.globalAlpha = o;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Chambres, axe et cercle de garde
  let chO = 0;
  if (!to && (from === 6 || from === 4)) chO = appear;
  else if (from === 100 && to === 6) chO = seg(k, 0.45, 1, ease.lin);
  else if (from === 6 && to === 4) chO = 1;
  if (chO > 0) {
    ctx.strokeStyle = INK + 0.35 * chO + ')';
    ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.arc(0, 0, to === 4 ? lerp(85, 89, k) : from === 4 ? 89 : 85, 0, TAU); ctx.stroke();
    ctx.strokeStyle = INK + chO + ')';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.stroke();
    for (let c = 0; c < 6; c++) {
      let x, y, r, o = chO;
      if (from === 4 && !to) { if (MAP64[c] < 0) continue; [x, y] = chamberAt(MAP64[c], 4); r = 25; }
      else if (from === 6 && to === 4) {
        const [x6, y6] = chamberAt(c, 6), e = ease.inOut(k);
        if (MAP64[c] < 0) { x = x6; y = y6; r = lerp(21, 0.1, e); o = 1 - k; }
        else { const [x4, y4] = chamberAt(MAP64[c], 4); x = lerp(x6, x4, e); y = lerp(y6, y4, e); r = lerp(21, 25, e); }
      } else { [x, y] = chamberAt(c, 6); r = 21; }
      ctx.strokeStyle = INK + o + ')';
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    }
  }

  // La balle, en laiton, avec un halo tant qu'elle est perdue parmi les points
  const A = bulletOf(from), Z = to ? bulletOf(to) : A;
  const e = to ? ease.inOut(k) : 0;
  const bx = lerp(A.p[0], Z.p[0], e), by = lerp(A.p[1], Z.p[1], e), br = lerp(A.r, Z.r, e);
  const bo = clamp((appear - 0.6) / 0.4);
  if (bo > 0) {
    ctx.shadowColor = 'rgba(255,200,110,0.7)';
    ctx.shadowBlur = 12;
    const gr = ctx.createRadialGradient(bx - br * 0.35, by - br * 0.35, br * 0.1, bx, by, br);
    gr.addColorStop(0, '#fbe3a2');
    gr.addColorStop(0.55, '#d9a64a');
    gr.addColorStop(1, '#8f6421');
    ctx.globalAlpha = bo;
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill();
    const ho = lerp(A.ho, Z.ho, e) * bo;
    if (ho > 0) {
      ctx.globalAlpha = ho;
      ctx.strokeStyle = '#e8b65a';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(bx, by, lerp(A.halo, Z.halo, e), 0, TAU); ctx.stroke();
    }
  }
  ctx.restore();

  // Le risque, écrit sous le barillet ; il s'efface au milieu d'un changement
  const n = to ? (k < 0.5 ? from : to) : s.riskN || from;
  const cran = CRANS.find((c) => c.n === n);
  const dip = to ? Math.abs(1 - 2 * k) : 1;
  const ro = (s.risk ?? 0) * dip;
  if (ro > 0 && cran) {
    const R = 100 * sc;
    const fs = portrait ? H * 0.068 : H * 0.062;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = ro;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f7efe1';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.font = `700 ${fs}px Inter, system-ui, sans-serif`;
    ctx.fillText(cran.frac, cx, cy + R + fs * 1.45);
    ctx.font = `400 ${fs * 0.46}px Inter, system-ui, sans-serif`;
    ctx.globalAlpha = ro * 0.8;
    ctx.fillText(cran.phrase, cx, cy + R + fs * 2.3);
    ctx.restore();
  }
}

// Angle (degrés) de la balle au repos, pour arrêter le barillet au bon endroit
export function bulletAngle(n) {
  const [x, y] = bulletOf(n).p;
  return (Math.atan2(y, x) * 180) / Math.PI;
}
