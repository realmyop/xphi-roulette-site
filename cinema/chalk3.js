/* ==========================================================================
   Acte 3 — l'arrêt sur image du narrateur : sur l'image figée et assombrie,
   la règle des deux pilules est dessinée à la craie lumineuse (même esprit
   et même placement que chalk.js : à droite en 16:9, en haut au centre en
   téléphone, toujours hors de la zone des sous-titres).

   Deux dessins :
   - « lac » : deux grands rectangles (les pontons), contour teinté bleu pâle
     à gauche, rouge pâle à droite ; sur leur jointure, cent petits points en
     colonne (les participants) ; la moitié marquée en pointillés ; le point
     du joueur en laiton, seule couleur vive (comme la balle des Actes 1 et 2).
   - « pilules » : deux gélules à la craie, cent points en bande ; la frontière
     entre les points bleu pâle et rouge pâle hésite autour de la moitié
     (s.sway), sans jamais rien décider ; le point du joueur dessous.

   s = { mode: 'lac' | 'pilules',
         appear 0→1  (tracé progressif),
         alice  0→1  (un petit pictogramme, cercle double, sur le ponton bleu),
         side   −1 bleu, +1 rouge, 0 jointure ; k 0→1 : le point du joueur y glisse,
         sway   nombre de points bleus (pilules), de 0 à 100 }
   Repère : hauteur 200 unités (−100 à +100), mis à l'échelle selon le format.
   Tout est déterministe : le tremblé de la craie vient d'une graine fixe.
   ========================================================================== */
import { TAU, clamp, lerp, ease, seg, seeded } from '../film/engine.js';

const INK = 'rgba(250,243,230,';
const BLUE = 'rgba(176,204,240,';
const RED = 'rgba(242,178,166,';

// Tremblé de la main : chaque trait garde toujours le même tremblé
const rnd = seeded(2023);
const JIT = Array.from({ length: 256 }, () => rnd() - 0.5);
const jit = (i) => JIT[((i % 256) + 256) % 256];

/* Un trait de craie de (x0, y0) à (x1, y1), tracé jusqu'à la fraction f,
   repassé deux fois avec un léger décalage (texture de craie). */
function trait(ctx, x0, y0, x1, y1, f, seed, col, o, w = 1.5) {
  if (f <= 0 || o <= 0) return;
  const len = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.max(2, Math.round(len / 9));
  const m = Math.max(1, Math.ceil(n * clamp(f)));
  const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = col + o * (pass ? 0.45 : 0.95) + ')';
    ctx.lineWidth = pass ? w * 0.6 : w;
    ctx.beginPath();
    for (let i = 0; i <= m; i++) {
      const u = Math.min(i / n, clamp(f));
      const d = jit(seed * 31 + i * 7 + pass * 101) * (pass ? 1.6 : 0.9);
      const x = lerp(x0, x1, u) + nx * d, y = lerp(y0, y1, u) + ny * d;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
}

// Un rectangle tracé à la main, côté après côté (f : 0 → 1 sur le tour entier)
function rect(ctx, x0, y0, x1, y1, f, seed, col, o) {
  const pts = [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
  for (let s = 0; s < 4; s++) {
    // Les coins débordent un peu, comme à la main
    const [ax, ay] = pts[s], [bx, by] = pts[s + 1];
    const ex = Math.sign(bx - ax) * 3, ey = Math.sign(by - ay) * 3;
    trait(ctx, ax - ex * 0.5, ay - ey * 0.5, bx + ex, by + ey, f * 4 - s, seed + s, col, o, 1.7);
  }
}

// Pointillés (la moitié)
function pointilles(ctx, x0, y0, x1, y1, f, col, o) {
  if (f <= 0 || o <= 0) return;
  const len = Math.hypot(x1 - x0, y1 - y0), n = Math.round(len / 7);
  ctx.strokeStyle = col + o + ')';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let i = 0; i < n * clamp(f); i++) {
    const a = i / n, b = (i + 0.5) / n;
    ctx.moveTo(lerp(x0, x1, a), lerp(y0, y1, a));
    ctx.lineTo(lerp(x0, x1, b), lerp(y0, y1, b));
  }
  ctx.stroke();
}

// Une gélule à la craie (contour seulement, la moitié du bas légèrement hachurée)
function gelule(ctx, x, y, rot, f, col, o) {
  if (f <= 0) return;
  const L = 17, R = 8;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = col + o + ')';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  // Contour en quatre temps : bout gauche, côté du haut, bout droit, côté du bas
  const q = (i) => clamp(f * 4 - i);
  ctx.arc(-L, 0, R, Math.PI / 2, Math.PI / 2 + Math.PI * q(0));
  if (q(1) > 0) ctx.lineTo(lerp(-L, L, q(1)), -R);
  if (q(2) > 0) ctx.arc(L, 0, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * q(2));
  if (q(3) > 0) ctx.lineTo(lerp(L, -L, q(3)), R);
  ctx.stroke();
  if (f > 0.8) {
    const h = seg(f, 0.8, 1, ease.lin);
    ctx.globalAlpha = h;
    ctx.beginPath(); ctx.moveTo(0, -R); ctx.lineTo(0, R); ctx.stroke();
    // Hachures d'une moitié
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = col + o * 0.55 + ')';
    ctx.beginPath();
    for (let i = 1; i < 6; i++) { const xx = (i / 6) * (L + R * 0.6); ctx.moveTo(xx - 3, R * 0.8); ctx.lineTo(xx + 3, -R * 0.8); }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// Le point du joueur, en laiton, avec son halo
function joueur(ctx, x, y, o) {
  if (o <= 0) return;
  const r = 4.2;
  ctx.save();
  ctx.shadowColor = 'rgba(255,200,110,0.7)';
  ctx.shadowBlur = 12;
  const gr = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  gr.addColorStop(0, '#fbe3a2');
  gr.addColorStop(0.55, '#d9a64a');
  gr.addColorStop(1, '#8f6421');
  ctx.globalAlpha = o;
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#e8b65a';
  ctx.lineWidth = 1;
  ctx.globalAlpha = o * 0.8;
  ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.stroke();
  ctx.restore();
}

// --- Les pontons ------------------------------------------------------------
const ME = 63; // le rang du joueur dans la colonne (un peu sous la moitié)
const rowY = (i) => -89 + (i * 178) / 99;

function lac(ctx, s, appear) {
  const fR = seg(appear, 0, 0.45, ease.lin);
  rect(ctx, -86, -100, -6, 100, fR, 10, BLUE, 1);
  rect(ctx, 6, -100, 86, 100, fR, 20, RED, 1);

  // Un voile très léger de couleur dans chaque ponton
  const v = seg(appear, 0.35, 0.6, ease.lin);
  if (v > 0) {
    ctx.fillStyle = BLUE + 0.07 * v + ')';
    ctx.fillRect(-86, -100, 80, 200);
    ctx.fillStyle = RED + 0.07 * v + ')';
    ctx.fillRect(6, -100, 80, 200);
  }

  // Quelques vaguelettes sous les pontons : c'est de l'eau
  const fW = seg(appear, 0.4, 0.7, ease.lin);
  if (fW > 0) {
    ctx.strokeStyle = INK + 0.45 * fW + ')';
    ctx.lineWidth = 1.1;
    for (let w = 0; w < 3; w++) {
      const y = 112 + w * 7, x0 = -70 + w * 22, n = 3;
      ctx.beginPath();
      for (let j = 0; j <= n * 8 * fW; j++) {
        const x = x0 + j * 3.5, yy = y + Math.sin((j / 8) * TAU) * 1.6;
        j ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
      }
      ctx.stroke();
    }
  }

  // La moitié, en pointillés, de part en part
  const fM = seg(appear, 0.6, 0.85, ease.lin);
  const yM = (rowY(49) + rowY(50)) / 2;
  pointilles(ctx, -98, yM, 98, yM, fM, INK, 0.8);
  if (fM > 0.9) {
    ctx.save();
    ctx.globalAlpha = seg(fM, 0.9, 1, ease.lin) * 0.85;
    ctx.fillStyle = INK + '1)';
    ctx.font = 'italic 300 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('½', -101, yM + 4);
    ctx.restore();
  }

  // Les cent participants, sur la jointure, apparaissent de haut en bas
  ctx.fillStyle = INK + '0.92)';
  for (let i = 0; i < 100; i++) {
    if (i === ME) continue;
    const o = clamp((appear - 0.3 - (i / 100) * 0.4) * 10);
    if (o <= 0) continue;
    ctx.globalAlpha = o;
    ctx.beginPath(); ctx.arc(jit(i) * 0.5, rowY(i), 0.8, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Alice : un cercle double, au milieu du ponton bleu
  const a = (s.alice ?? 0) * seg(appear, 0.5, 0.9, ease.lin);
  if (a > 0) {
    ctx.save();
    ctx.strokeStyle = INK + a + ')';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(-46, -34, 10 * lerp(0.6, 1, a), 0, TAU); ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(-46, -34, 5 * lerp(0.6, 1, a), 0, TAU); ctx.stroke();
    ctx.restore();
  }

  // Le joueur : sur la jointure, ou parti vers le ponton choisi
  const k = ease.inOut(clamp(s.k ?? 0));
  const x = lerp(0, (s.side || 0) * 46, k);
  joueur(ctx, x, rowY(ME), clamp((appear - 0.75) / 0.25));
}

// --- Les pilules --------------------------------------------------------------
// Cent points en bande : 20 colonnes × 5 rangs, de gauche à droite
const BAND = Array.from({ length: 100 }, (_, i) => {
  const c = Math.floor(i / 5), r = i % 5;
  return [-85.5 + c * 9 + jit(i * 3) * 1.2, 2 + r * 8 + jit(i * 3 + 1) * 1.2];
});

function pilules(ctx, s, appear) {
  gelule(ctx, -46, -58, -0.35, seg(appear, 0, 0.4, ease.lin), BLUE, 1);
  gelule(ctx, 46, -58, 0.35, seg(appear, 0.1, 0.5, ease.lin), RED, 1);

  // Les points : bleus à gauche de la frontière, rouges à droite ; elle hésite
  const sway = s.sway ?? 50;
  for (let i = 0; i < 100; i++) {
    const o = clamp((appear - 0.3 - (i / 100) * 0.35) * 10);
    if (o <= 0) continue;
    const b = clamp(sway - i + 0.5); // 1 : bleu, 0 : rouge, entre les deux pendant le passage
    const [x, y] = BAND[i];
    ctx.globalAlpha = o;
    ctx.fillStyle = b > 0.5 ? BLUE + '0.95)' : RED + '0.95)';
    ctx.beginPath(); ctx.arc(x, y, lerp(1.6, 1.9, Math.abs(b - 0.5) * 2), 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // La moitié : un trait vertical en pointillés au milieu de la bande
  const fM = seg(appear, 0.6, 0.85, ease.lin);
  pointilles(ctx, 0, -10, 0, 50, fM, INK, 0.85);
  if (fM > 0.9) {
    ctx.save();
    ctx.globalAlpha = seg(fM, 0.9, 1, ease.lin) * 0.85;
    ctx.fillStyle = INK + '1)';
    ctx.font = 'italic 300 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('½', 0, -15);
    ctx.restore();
  }

  // Le joueur, sous la bande ; il rejoint le côté de sa gélule
  const k = ease.inOut(clamp(s.k ?? 0));
  joueur(ctx, lerp(0, (s.side || 0) * 46, k), 72, clamp((appear - 0.75) / 0.25));
}

/* portrait : cadre téléphone (4:5) ; sinon 16:9. */
export function drawChalk3(ctx, W, H, s, portrait) {
  const appear = s.appear ?? 1;
  if (appear <= 0) return;
  // En 16:9, les pilules se posent un peu plus à droite : le pouce de la paume
  // monte jusque vers 0,66 de la largeur, la gélule bleue ne doit pas le toucher.
  const cx = portrait ? W * 0.5 : W * (s.mode === 'pilules' ? 0.755 : 0.73);
  const cy = portrait ? H * 0.37 : H * 0.4;
  const sc = (portrait ? W * 0.245 : H * 0.2) / 100;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(cx, cy);
  ctx.scale(sc, sc);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(255,236,200,0.45)';
  ctx.shadowBlur = 8;
  if (s.mode === 'pilules') pilules(ctx, s, appear);
  else lac(ctx, s, appear);
  ctx.restore();
}
