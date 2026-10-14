/* ==========================================================================
   La craie lumineuse des résultats de l'Acte 3 (même esprit que
   cinema/chalk3.js) : traits crème légèrement tremblés, repassés deux fois,
   halo doux ; aplats en hachures ; texte posé comme à la main (il s'écrit de
   gauche à droite). Tout est déterministe : le tremblé vient d'une graine
   fixe, l'animation ne dépend que de f (0 → 1) ou du temps qu'on lui donne.
   ========================================================================== */

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const easeIO = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
export const easeOut = (k) => 1 - Math.pow(1 - k, 3);
/* Avancement d'un élément entre les instants a et b (secondes) */
export const ph = (t, a, b, e = easeIO) => e(clamp((t - a) / (b - a)));

// Couleurs de craie (validées : bleu ↔ rouge séparés pour toutes les visions)
export const INK = [250, 243, 230];
export const BLUE = [156, 192, 242];
export const RED = [242, 160, 144];
export const BRASS = [215, 165, 72]; // #d7a548 : réservé au joueur
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
export { rgba };

// Bruit de valeur, graine fixe : le même trait tremble toujours de la même façon
function seeded(s) {
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = seeded(2023);
const J = Array.from({ length: 512 }, () => rnd() - 0.5);
const jr = (i) => J[((i % 512) + 512) % 512];
const noise = (s) => {
  const i = Math.floor(s), u = s - i, w = u * u * (3 - 2 * u);
  return lerp(jr(i), jr(i + 1), w);
};

/* La craie, liée à un contexte 2D. u : échelle des traits (1 en 16:9). */
export function craie(ctx, u) {
  const glow = () => { ctx.shadowColor = 'rgba(255,236,200,0.42)'; ctx.shadowBlur = 9 * u; };
  const noGlow = () => { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; };

  /* Un trait le long de points denses, tracé jusqu'à la fraction f de sa longueur */
  function trait(pts, f, o = {}) {
    const n = pts.length;
    if (n < 2 || f <= 0) return;
    const col = o.col || INK, a = o.a ?? 1, w = (o.w ?? 3) * u, seed = o.seed ?? 1, amp = (o.jit ?? 1) * u;
    const L = [0];
    for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const Lf = L[n - 1] * clamp(f);
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (o.glow !== false) glow();
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        let [x, y] = pts[i];
        const j = Math.max(0, i - 1), k = Math.min(n - 1, i + 1);
        let dx = pts[k][0] - pts[j][0], dy = pts[k][1] - pts[j][1];
        const dl = Math.hypot(dx, dy) || 1;
        const end = L[i] > Lf;
        if (end && i > 0) {
          const q = (Lf - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
          x = lerp(pts[i - 1][0], x, q); y = lerp(pts[i - 1][1], y, q);
        }
        const d = noise(seed * 13.7 + L[i] / (26 * u) + pass * 50) * (pass ? 3.2 : 1.8) * amp;
        x += (-dy / dl) * d; y += (dx / dl) * d;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        if (end) break;
      }
      ctx.strokeStyle = rgba(col, a * (pass ? 0.42 : 0.93));
      ctx.lineWidth = pass ? w * 0.55 : w;
      // Le second passage est cassé, comme la craie qui accroche le tableau
      ctx.setLineDash(pass ? [18 * u, 4 * u, 7 * u, 3 * u] : []);
      ctx.stroke();
    }
    ctx.restore();
  }

  const segPts = (x0, y0, x1, y1) => {
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (5 * u)));
    return Array.from({ length: n + 1 }, (_, i) => [lerp(x0, x1, i / n), lerp(y0, y1, i / n)]);
  };
  const arcPts = (cx, cy, r, a0, a1) => {
    const n = Math.max(3, Math.ceil((Math.abs(a1 - a0) * r) / (5 * u)));
    return Array.from({ length: n + 1 }, (_, i) => {
      const a = lerp(a0, a1, i / n);
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
  };
  const ligne = (x0, y0, x1, y1, f, o) => trait(segPts(x0, y0, x1, y1), f, o);

  /* Un rectangle à la main (contour), côté après côté ; les coins débordent un peu */
  function rect(x, y, w, h, f, o = {}) {
    const P = [[x, y + h], [x, y], [x + w, y], [x + w, y + h]];
    const e = 4 * u;
    const sides = o.open ? 3 : 4; // ouvert : sans le côté de la ligne de base
    for (let s = 0; s < sides; s++) {
      const [ax, ay] = P[s], [bx, by] = P[(s + 1) % 4];
      const sx = Math.sign(bx - ax) * e, sy = Math.sign(by - ay) * e;
      ligne(ax - sx * 0.4, ay - sy * 0.4, bx + sx, by + sy, f * sides - s, { ...o, seed: (o.seed ?? 1) + s * 3 });
    }
  }

  /* Hachures dans une forme (Path2D), révélées jusqu'à f ; angle en degrés */
  function hachures(path, box, f, o = {}) {
    if (f <= 0) return;
    const col = o.col || INK, ang = ((o.ang ?? 45) * Math.PI) / 180, sp = (o.sp ?? 13) * u;
    const [bx, by, bw, bh] = box;
    const cx = bx + bw / 2, cy = by + bh / 2, R = Math.hypot(bw, bh) / 2 + sp;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const N = Math.ceil((2 * R) / sp);
    ctx.save();
    ctx.clip(path);
    // Lavis très léger : la couleur, à peine
    ctx.fillStyle = rgba(col, (o.wash ?? 0.1) * clamp(f * 2));
    ctx.fill(path);
    for (let i = 0; i < N * clamp(f); i++) {
      const d = -R + i * sp + jr(i * 5 + (o.seed ?? 0)) * sp * 0.35;
      const px = cx - sa * d, py = cy + ca * d;
      trait(segPts(px - ca * R, py - sa * R, px + ca * R, py + sa * R), 1,
        { col, a: o.a ?? 0.55, w: o.w ?? 1.6, seed: i + (o.seed ?? 0), glow: false, jit: 0.6 });
    }
    ctx.restore();
  }

  /* Texte à la craie : s'écrit de gauche à droite pendant que f va de 0 à 1 */
  function texte(str, x, y, o = {}) {
    const size = o.size || 24;
    ctx.save();
    ctx.font = `${o.italic ? 'italic ' : ''}${o.weight || 500} ${size}px Inter, system-ui, sans-serif`;
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.base || 'alphabetic';
    const w = ctx.measureText(str).width;
    const f = o.f ?? 1;
    if (f <= 0) { ctx.restore(); return w; }
    if (f < 1) {
      const x0 = ctx.textAlign === 'center' ? x - w / 2 : ctx.textAlign === 'right' ? x - w : x;
      ctx.beginPath();
      ctx.rect(x0 - size, y - size * 2, size + w * f, size * 4);
      ctx.clip();
    }
    if (o.ls) ctx.letterSpacing = o.ls;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = size * 0.35;
    ctx.fillStyle = rgba(o.col || INK, (o.a ?? 1) * clamp(f * 3));
    ctx.fillText(str, x, y);
    ctx.shadowColor = 'rgba(255,236,200,0.35)';
    ctx.shadowBlur = 6 * u;
    ctx.fillText(str, x, y);
    ctx.restore();
    return w;
  }
  const mesure = (str, size, weight = 500) => {
    ctx.save();
    ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
    const w = ctx.measureText(str).width;
    ctx.restore();
    return w;
  };

  function point(x, y, r, col, a = 1) {
    if (a <= 0) return;
    ctx.save();
    glow();
    ctx.fillStyle = rgba(col, 0.95 * a);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Le joueur : un point de laiton, avec son halo (comme la balle des Actes 1 et 2)
  function joueur(x, y, r, a = 1) {
    if (a <= 0) return;
    ctx.save();
    ctx.shadowColor = 'rgba(255,200,110,0.75)';
    ctx.shadowBlur = 16 * u;
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, '#fbe3a2'); g.addColorStop(0.55, '#d7a548'); g.addColorStop(1, '#8f6421');
    ctx.globalAlpha = a;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    trait(arcPts(x, y, r * 2.1, -Math.PI / 2, Math.PI * 1.5), a, { col: BRASS, w: 1.6, a: 0.85, seed: 77 });
  }

  /* Camembert : parts = [{ v, col, ang }] ; f : balayage (0 → 1) depuis midi */
  function camembert(cx, cy, r, parts, f, o = {}) {
    const tot = parts.reduce((s, p) => s + p.v, 0);
    const sweep = clamp(f) * Math.PI * 2;
    const gap = (o.gap ?? 7) * u;
    let a = -Math.PI / 2;
    parts.forEach((p, i) => {
      const a0 = a, a1 = a + (p.v / tot) * Math.PI * 2;
      a = a1;
      const e1 = Math.min(a1, -Math.PI / 2 + sweep);
      if (e1 <= a0) return;
      const mid = (a0 + a1) / 2;
      const ox = cx + Math.cos(mid) * gap, oy = cy + Math.sin(mid) * gap;
      const path = new Path2D();
      path.moveTo(ox, oy); path.arc(ox, oy, r, a0, e1); path.closePath();
      const al = o.a ?? 1;
      hachures(path, [ox - r, oy - r, 2 * r, 2 * r], 1, { col: p.col, ang: p.ang, sp: o.sp ?? 13, a: 0.5 * al, wash: 0.12 * al, seed: i * 40 });
      const s = (o.seed ?? 0) + i * 9;
      trait(arcPts(ox, oy, r, a0, e1), 1, { col: p.col, a: al, w: o.w ?? 3, seed: s });
      ligne(ox, oy, ox + r * Math.cos(a0), oy + r * Math.sin(a0), 1, { col: p.col, a: al, w: o.w ?? 3, seed: s + 1 });
      if (e1 >= a1 - 1e-6) ligne(ox, oy, ox + r * Math.cos(a1), oy + r * Math.sin(a1), 1, { col: p.col, a: al, w: o.w ?? 3, seed: s + 2 });
    });
  }

  /* Une flèche à la craie (corps puis pointe) */
  function fleche(x0, y0, x1, y1, f, o = {}) {
    ligne(x0, y0, x1, y1, clamp(f / 0.8), o);
    const k = clamp((f - 0.8) / 0.2);
    if (k <= 0) return;
    const a = Math.atan2(y1 - y0, x1 - x0), h = (o.head ?? 22) * u;
    for (const s of [-1, 1]) {
      const b = a + Math.PI + s * 0.5;
      ligne(x1, y1, x1 + Math.cos(b) * h, y1 + Math.sin(b) * h, k, { ...o, seed: (o.seed ?? 0) + s + 5 });
    }
  }

  return { ctx, u, trait, ligne, rect, hachures, texte, mesure, point, joueur, camembert, fleche, segPts, arcPts };
}
