/* ==========================================================================
   Outils communs aux maquettes (aucune logique de jeu ici).
   - Format : ?screen=1 (16:9 sombre), ?still=1 (animations figées).
   - Barillet géométrique : jamais d'arme, seulement des cercles et des points.
   - Personnage « Phi » au trait : un visage-lettre Φ, trois expressions.
   - Graphique des courbes de refus (données fictives).
   ========================================================================== */

(function () {
  const params = new URLSearchParams(location.search);
  const html = document.documentElement;
  const isScreen = params.get('screen') === '1';
  html.classList.toggle('screen', isScreen);
  html.classList.toggle('still', params.get('still') === '1');

  // Mise à l'échelle de la scène 1920×1080 pour qu'elle tienne dans la fenêtre.
  function fit() {
    if (!isScreen) return;
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    html.style.setProperty('--fit', s);
  }
  addEventListener('resize', fit);
  fit();

  // Curseur : caché au départ (captures, projection), il revient dès que la
  // souris bouge et se cache de nouveau après 2,5 s d'immobilité
  if (isScreen) {
    let idleTimer;
    html.classList.add('idle');
    addEventListener('pointermove', () => {
      html.classList.remove('idle');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => html.classList.add('idle'), 2500);
    });
  }

  const SVG = 'http://www.w3.org/2000/svg';
  const el = (name, attrs = {}) => {
    const n = document.createElementNS(SVG, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  /* --- Les quatre crans : mêmes mots pour les deux histoires ------------- */
  const CRANS = [
    { n: 1000, frac: '1 sur 1 000', phrase: 'Mille chambres, une balle.' },
    { n: 100,  frac: '1 sur 100',   phrase: 'Cent chambres, une balle.' },
    { n: 6,    frac: '1 sur 6',     phrase: 'Un barillet ordinaire.' },
    { n: 4,    frac: '1 sur 4',     phrase: 'Quatre chambres, une balle.' },
  ];

  /* --- Barillet ----------------------------------------------------------
     n ≤ 12 : des chambres (cercles) sur un cercle, la balle pleine dans l'accent.
     n = 100 : cent points sur un anneau.
     n = 1000 : mille points répartis dans un anneau.
     Un petit trait en haut marque la position de tir (sans dessiner d'arme).
     La position de la balle est fixe ici (maquette) ; elle sera tirée au sort
     au moment du jeu. */
  function barillet(n, opts = {}) {
    const svg = el('svg', { viewBox: '-100 -100 200 200', class: 'barillet', role: 'img',
      'aria-label': `Barillet : une balle sur ${n} chambres` });
    const stroke = opts.stroke || 1.4;
    // Repère de tir
    svg.append(el('line', { x1: 0, y1: -97, x2: 0, y2: -89, class: 'b-mark', 'stroke-width': stroke }));

    if (n <= 12) {
      const R = 58, r = n <= 4 ? 25 : 21;
      svg.append(el('circle', { cx: 0, cy: 0, r: R + r + 6, class: 'b-guide', 'stroke-width': stroke * 0.7 }));
      svg.append(el('circle', { cx: 0, cy: 0, r: 7, class: 'b-axis', 'stroke-width': stroke }));
      const bullet = opts.bullet ?? 2;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const c = el('circle', { cx: (R * Math.cos(a)).toFixed(2), cy: (R * Math.sin(a)).toFixed(2), r,
          'stroke-width': stroke, class: i === bullet ? 'b-ch b-bullet' : 'b-ch' });
        svg.append(c);
      }
    } else {
      // Points répartis en spirale de tournesol (angle d'or) dans un anneau :
      // densité régulière, lisible même à mille points.
      const R0 = n === 1000 ? 42 : 0, R1 = n === 1000 ? 94 : 0;
      const dot = n === 1000 ? 1.45 : 2.3;
      const golden = Math.PI * (3 - Math.sqrt(5));
      const bulletIdx = opts.bullet ?? Math.round(n * 0.37);
      let bx = 0, by = 0;
      for (let k = 0; k < n; k++) {
        let x, y;
        if (n === 1000) {
          const R = Math.sqrt(R0 * R0 + ((k + 0.5) / n) * (R1 * R1 - R0 * R0));
          x = R * Math.cos(k * golden); y = R * Math.sin(k * golden);
        } else {
          const a = -Math.PI / 2 + (k * 2 * Math.PI) / n;
          x = 80 * Math.cos(a); y = 80 * Math.sin(a);
        }
        if (k === bulletIdx) { bx = x; by = y; continue; }
        svg.append(el('circle', { cx: x.toFixed(2), cy: y.toFixed(2), r: dot, class: 'b-dot' }));
      }
      // La balle, et un halo pour qu'on la trouve parmi mille
      svg.append(el('circle', { cx: bx.toFixed(2), cy: by.toFixed(2), r: dot * 4.2, class: 'b-halo', 'stroke-width': stroke * 0.8 }));
      svg.append(el('circle', { cx: bx.toFixed(2), cy: by.toFixed(2), r: dot * 1.9, class: 'b-dot b-bullet' }));
    }
    return svg;
  }

  /* --- Personnage « Phi » ------------------------------------------------
     Une tête ronde traversée d'un trait vertical : la lettre Φ devient un visage.
     Trois expressions : neutre, curieux, malicieux. Aucun geste culturel. */
  const FACES = {
    neutre:
      '<circle cx="47" cy="56" r="2.6" class="p-fill"/><circle cx="73" cy="56" r="2.6" class="p-fill"/>' +
      '<path d="M48 78 Q60 82 72 78"/>',
    curieux:
      '<circle cx="47" cy="57" r="2.6" class="p-fill"/><circle cx="73" cy="56" r="4.2"/>' +
      '<path d="M66 44 L80 40"/><path d="M41 47 L53 47"/>' +
      '<ellipse cx="60" cy="80" rx="4" ry="4.6"/>',
    malicieux:
      '<path d="M42 57 Q47 53 52 57"/><path d="M68 57 Q73 53 78 57"/>' +
      '<path d="M66 45 L80 48"/>' +
      '<path d="M46 76 Q58 86 74 74"/>',
  };
  function phi(expr = 'neutre', opts = {}) {
    const body = opts.body
      // Variante buste : épaules, et le trait de Φ qui descend en cravate
      ? '<path d="M14 158 C18 124 38 112 60 112 C82 112 102 124 106 158"/>'
      : '';
    const h = opts.body ? 160 : 120;
    const wrap = document.createElement('span');
    wrap.className = 'phi';
    wrap.innerHTML =
      `<svg viewBox="0 0 120 ${h}" fill="none" stroke="currentColor" stroke-width="${opts.stroke || 2.2}" ` +
      `stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Phi, le narrateur">` +
      `<circle cx="60" cy="62" r="38"/><path d="M60 8 L60 ${opts.body ? 150 : 116}"/>` +
      FACES[expr] + body + '</svg>';
    return wrap;
  }

  /* --- Courbes de refus ---------------------------------------------------
     Part cumulée des joueurs qui ont déjà refusé à chaque cran.
     Gris pour les autres, accent pour « vous ». Étiquettes posées sur les
     courbes : pas de légende séparée. */
  const SAMPLE = {
    arme:       [38, 71, 92, 96],
    conception: [3, 9, 27, 46],
    vous:       { arme: 2, conception: 4 }, // cran du premier refus
  };
  function refusalChart(opts = {}) {
    const W = opts.w || 360, H = opts.h || 280;
    const fs = opts.font || 11;
    const m = { t: fs * 1.6, r: opts.mr ?? fs * 9, b: fs * 3, l: fs * 3.4 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const x = (i) => m.l + (i * iw) / 3;
    const y = (v) => m.t + ih - (v / 100) * ih;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img',
      'aria-label': 'Courbes de refus, arme contre conception (données fictives)' });
    svg.style.fontSize = fs + 'px';

    // Grille horizontale discrète
    for (const v of [0, 25, 50, 75, 100]) {
      svg.append(el('line', { x1: m.l, x2: m.l + iw, y1: y(v), y2: y(v), class: v === 0 ? 'c-axis' : 'c-grid' }));
      const t = el('text', { x: m.l - fs * 0.6, y: y(v) + fs * 0.35, 'text-anchor': 'end', class: 'c-tick' });
      t.textContent = v + (v === 100 ? ' %' : '');
      svg.append(t);
    }
    CRANS.forEach((c, i) => {
      const t = el('text', { x: x(i), y: m.t + ih + fs * 1.8, 'text-anchor': 'middle', class: 'c-tick' });
      t.textContent = c.frac.replace('1 sur ', '1/').replace(' ', ' ');
      svg.append(t);
    });

    const line = (vals, cls, label) => {
      const d = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
      svg.append(el('path', { d, class: 'c-line ' + cls, fill: 'none' }));
      vals.forEach((v, i) => svg.append(el('circle', { cx: x(i), cy: y(v), r: fs * 0.22, class: 'c-pt ' + cls })));
      const t = el('text', { x: x(3) + fs * 0.9, y: y(vals[3]) + fs * 0.35, class: 'c-label ' + cls });
      t.textContent = label;
      svg.append(t);
      const p = el('text', { x: x(3) + fs * 0.9, y: y(vals[3]) + fs * 1.55, class: 'c-sub' });
      p.textContent = vals[3] + ' % ont refusé';
      svg.append(p);
    };
    line(SAMPLE.arme, 'arme', 'L’arme');
    line(SAMPLE.conception, 'conception', 'La conception');

    // « Vous » : vos deux premiers refus, dans l'accent
    const you = (key, above) => {
      const i = SAMPLE.vous[key] - 1, v = SAMPLE[key][i];
      svg.append(el('circle', { cx: x(i), cy: y(v), r: fs * 0.62, class: 'c-you' }));
      // Étiquette à gauche du point : la fin des courbes porte déjà leurs noms
      const t = el('text', { x: x(i) - fs * 1.1, y: y(v) + (above ? -fs * 0.6 : fs * 1.4), 'text-anchor': 'end', class: 'c-you-label' });
      t.textContent = 'vous';
      svg.append(t);
    };
    you('arme', true);
    you('conception', false);
    return svg;
  }

  // Remplit les emplacements déclarés dans le HTML
  function mount() {
    const cranIdx = Math.min(4, Math.max(1, parseInt(params.get('cran') || '3', 10))) - 1;
    const cran = CRANS[cranIdx];
    document.querySelectorAll('[data-cran-n]').forEach((n) => (n.textContent = cranIdx + 1));
    document.querySelectorAll('[data-cran-frac]').forEach((n) => (n.textContent = cran.frac));
    document.querySelectorAll('[data-cran-phrase]').forEach((n) => (n.textContent = cran.phrase));
    document.querySelectorAll('[data-barillet]').forEach((n) => n.append(barillet(cran.n)));
    // Échelle des quatre crans (passé / présent / à venir)
    document.querySelectorAll('[data-ladder]').forEach((n) => {
      CRANS.forEach((c, i) => {
        const item = document.createElement('div');
        item.className = 'ladder-item ' + (i < cranIdx ? 'past' : i === cranIdx ? 'now' : 'next');
        item.append(barillet(c.n, { stroke: 2.4 }));
        const l = document.createElement('span');
        l.textContent = c.frac;
        item.append(l);
        n.append(item);
      });
    });
    document.querySelectorAll('[data-phi]').forEach((n) =>
      n.append(phi(n.dataset.phi || 'neutre', { body: 'body' in n.dataset })));
    document.querySelectorAll('[data-chart]').forEach((n) => {
      const big = isScreen;
      const o = big ? JSON.parse(n.dataset.chartScreen || '{}') : JSON.parse(n.dataset.chartPhone || '{}');
      n.append(refusalChart(o));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  window.Mockup = { barillet, phi, refusalChart, CRANS };
})();
