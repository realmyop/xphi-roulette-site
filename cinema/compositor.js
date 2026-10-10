/* ==========================================================================
   Compositeur : assemble les calques peints d'un plan dans le canvas, avec
   la caméra (cadrage, travelling, parallaxe), les effets procéduraux
   (lumière, poussière, mobile…), puis la finition « pellicule » : vignette,
   grain, fondus. Tout est fonction du temps : même instant, même image.
   ========================================================================== */
import { raster } from './raster.js';
import { seeded } from '../film/engine.js';

const make = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
};

export function createCompositor(canvas, { portrait, scenes, scale }) {
  const ctx = canvas.getContext('2d');
  // Largeur du cadre à z = 1, en unités du décor (le décor fait 1920 × 1080)
  const FRAME_W = portrait ? 864 : 1920;
  const buf = make(canvas.width, canvas.height);
  const bctx = buf.getContext('2d');
  const frozen = make(canvas.width, canvas.height);
  const fctx = frozen.getContext('2d');
  let frozenKey = null;
  const loaded = {};

  // Grain de pellicule : quelques tuiles de bruit, tirées d'une graine fixe
  const rnd = seeded(42);
  const grains = Array.from({ length: 4 }, () => {
    const c = make(256, 256);
    const g = c.getContext('2d');
    const im = g.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = 128 + (rnd() - 0.5) * 255;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
      im.data[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    return ctx.createPattern(c, 'repeat');
  });

  /* Zone utile de chaque calque, pour ne peindre que ce que la caméra peut montrer.
     On rejoue les plans du décor (sans rien dessiner) en notant, pour chaque calque,
     sa parallaxe et s'il est déplacé par une transformation locale : un calque
     transformé (porte qui pivote, bras qui se lève…) est gardé en entier. */
  function usefulRegions(sc) {
    const out = {};
    const shots = Object.values(sc.shots || {});
    if (!shots.length) return out;
    const used = {};
    const mock = {
      img(id, o = {}) {
        const u = (used[id] ??= { pars: new Set(), moved: false });
        u.pars.add(o.par ?? sc.layers[id]?.par ?? 1);
        if (o.tf || o.clip) u.moved = true;
      },
      fx() {}, screen() {}, portrait,
    };
    const views = [];
    for (const sh of shots) {
      for (let t = 0; t <= sh.dur + 1e-6; t += 0.25) {
        try { sc.render(mock, sh.p(t), t); } catch { /* le décor peut exiger un vrai canvas : tant pis */ }
        views.push(sh.cam(t, portrait));
      }
    }
    for (const [id, u] of Object.entries(used)) {
      if (u.moved) continue;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const par of u.pars) {
        for (const cam of views) {
          const z = sc.home.z * (1 + (cam.z / sc.home.z - 1) * par);
          const cx = sc.home.x + (cam.x - sc.home.x) * par;
          const cy = sc.home.y + (cam.y - sc.home.y) * par;
          const hw = FRAME_W / z / 2, hh = 1080 / z / 2;
          x0 = Math.min(x0, cx - hw); x1 = Math.max(x1, cx + hw);
          y0 = Math.min(y0, cy - hh); y1 = Math.max(y1, cy + hh);
        }
      }
      // Marge pour les tremblements de caméra et les filtres
      const m = 60;
      out[id] = [x0 - m, y0 - m, x1 - x0 + 2 * m, y1 - y0 + 2 * m];
    }
    return out;
  }

  // Pixellise les calques d'un décor (une fois)
  async function load(id) {
    if (loaded[id]) return loaded[id];
    const sc = scenes[id];
    const region = sc.region?.[portrait ? 'portrait' : 'wide'];
    const useful = usefulRegions(sc);
    const out = {};
    for (const [lid, L] of Object.entries(sc.layers)) {
      // Intersection de la zone déclarée par le décor et de la zone utile calculée
      let r = useful[lid] || region || null;
      if (useful[lid] && region) {
        const x = Math.max(useful[lid][0], region[0]), y = Math.max(useful[lid][1], region[1]);
        const x2 = Math.min(useful[lid][0] + useful[lid][2], region[0] + region[2]);
        const y2 = Math.min(useful[lid][1] + useful[lid][3], region[1] + region[3]);
        r = [x, y, Math.max(1, x2 - x), Math.max(1, y2 - y)];
      }
      out[lid] = await raster(L, scale * (L.res || 1), r);
    }
    return (loaded[id] = out);
  }

  // Libère un décor (mémoire des images peintes)
  function unload(id) {
    const L = loaded[id];
    if (!L) return;
    for (const r of Object.values(L)) { r.canvas.width = 0; r.canvas.height = 0; }
    delete loaded[id];
  }

  // Caméra → transformation du canvas, avec parallaxe (par > 1 : premier plan)
  function camera(c, cam, home, par) {
    const z = home.z * (1 + (cam.z / home.z - 1) * par);
    const cx = home.x + (cam.x - home.x) * par;
    const cy = home.y + (cam.y - home.y) * par;
    const k = c.canvas.width / (FRAME_W / z);
    c.setTransform(k, 0, 0, k, c.canvas.width / 2 - cx * k, c.canvas.height / 2 - cy * k);
    return k;
  }

  function drawScene(c, view, T) {
    const sc = scenes[view.scene];
    if (!sc) {
      // Décor absent : écran noir plutôt qu'une erreur
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.fillStyle = '#000';
      c.fillRect(0, 0, c.canvas.width, c.canvas.height);
      return;
    }
    const L = loaded[view.scene] || {};
    const home = sc.home;
    const cam = view.cam || home;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = sc.bg || '#000';
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);

    const g = {
      // Un calque peint, avec éventuellement une transformation locale
      img(id, o = {}) {
        const R = L[id];
        if (!R) return;
        const def = sc.layers[id];
        camera(c, cam, home, o.par ?? def.par ?? 1);
        c.globalAlpha = o.alpha ?? 1;
        c.globalCompositeOperation = o.blend || def.blend || 'source-over';
        if (o.tf) {
          const { x = 0, y = 0, rot = 0, sx = 1, sy = 1, ox = 0, oy = 0 } = o.tf;
          c.translate(ox + x, oy + y);
          c.rotate(rot);
          c.scale(sx, sy);
          c.translate(-ox, -oy);
        }
        if (o.clip) { c.save(); o.clip(c); c.clip(); }
        const [x, y, w, h] = R.box;
        c.drawImage(R.canvas, x, y, w, h);
        if (o.clip) c.restore();
      },
      // Dessin procédural dans le repère du décor
      fx(par, fn) {
        camera(c, cam, home, par);
        c.globalAlpha = 1;
        c.globalCompositeOperation = 'source-over';
        c.save();
        fn(c);
        c.restore();
      },
      // Dessin dans le repère de l'écran
      screen(fn) {
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.globalAlpha = 1;
        c.globalCompositeOperation = 'source-over';
        c.save();
        fn(c, c.canvas.width, c.canvas.height);
        c.restore();
      },
      portrait,
    };
    sc.render(g, view.p || {}, T, view);
    c.restore();
  }

  // Assombrit et désature (arrêt sur image), sans dépendre de ctx.filter
  function hush(c, k) {
    if (k <= 0) return;
    const W = c.canvas.width, H = c.canvas.height;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'saturation';
    c.globalAlpha = 0.75 * k;
    c.fillStyle = '#808080';
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 0.5 * k;
    c.fillStyle = '#0d0b10';
    c.fillRect(0, 0, W, H);
    c.restore();
  }

  function finish(c, T, fade, grain = 1) {
    const W = c.canvas.width, H = c.canvas.height;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    // Vignette
    const v = c.createRadialGradient(W / 2, H * 0.48, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.6);
    v.addColorStop(0, 'rgba(12,9,8,0)');
    v.addColorStop(1, 'rgba(12,9,8,0.55)');
    c.fillStyle = v;
    c.fillRect(0, 0, W, H);
    // Grain : la tuile change 12 fois par seconde, toujours dans le même ordre
    const f = Math.floor(T * 12);
    c.globalCompositeOperation = 'overlay';
    c.globalAlpha = 0.11 * grain;
    c.fillStyle = grains[f % 4];
    c.translate((f * 97) % 256, (f * 57) % 256);
    c.fillRect(-256, -256, W + 512, H + 512);
    c.restore();
    if (fade > 0) {
      c.save();
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalAlpha = fade;
      c.fillStyle = '#000';
      c.fillRect(0, 0, W, H);
      c.restore();
    }
  }

  function render(st, overlay) {
    if (st.freeze) {
      // L'image arrêtée n'est calculée qu'une fois
      if (st.freeze.key !== frozenKey) {
        drawScene(fctx, st.freeze.view, st.freeze.T);
        frozenKey = st.freeze.key;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.drawImage(frozen, 0, 0);
      hush(ctx, st.freeze.k);
    } else if (st.view) {
      drawScene(ctx, st.view, st.T);
      if (st.view2 && st.mix > 0) {
        drawScene(bctx, st.view2, st.T);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = st.mix;
        ctx.drawImage(buf, 0, 0);
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    overlay?.(ctx, canvas.width, canvas.height);
    finish(ctx, st.T, st.fade || 0);
  }

  return { load, unload, render, loaded };
}
