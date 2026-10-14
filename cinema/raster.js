/* ==========================================================================
   Pixellisation des calques : chaque calque SVG est peint une fois dans un
   canvas, à la résolution utile pour le format (téléphone, 16:9, 4K).
   ========================================================================== */
import { DEFS } from './kit.js';

export async function raster(layer, scale, region) {
  let [x, y, w, h] = layer.box;
  // On ne peint que ce que la caméra peut montrer dans ce format
  if (region) {
    const x2 = Math.min(x + w, region[0] + region[2]), y2 = Math.min(y + h, region[1] + region[3]);
    x = Math.max(x, region[0]); y = Math.max(y, region[1]);
    w = Math.max(1, x2 - x); h = Math.max(1, y2 - y);
  }
  const W = Math.max(1, Math.round(w * scale)), H = Math.max(1, Math.round(h * scale));
  let body = layer.svg;
  for (const f of layer.filters || []) body = `<g filter="url(#${f})">${body}</g>`;
  const src =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none">` +
    `${DEFS}${layer.defs || ''}${body}</svg>`;
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);
  await img.decode();
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  c.getContext('2d').drawImage(img, 0, 0, W, H);
  return { canvas: c, box: [x, y, w, h] };
}
