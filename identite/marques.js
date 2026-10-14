/* ==========================================================================
   Identité Xphi : tout est dessiné ici, à la main, en SVG.
   - Quatre pistes de logo (objectif, barillet, craie, antenne).
   - Le narrateur « Phi » en trois variantes et quatre expressions.
   Conventions de couleur (voir identite.css) :
     currentColor      l'encre (craie sur fond sombre, nuit sur fond clair)
     var(--labo)       la petite lumière du narrateur (bleu de laboratoire)
     var(--joueur)     le laiton : réservé au joueur, jamais au narrateur
   Les éléments à remplir sont déclarés dans le HTML :
     <span data-logo="barillet" data-form="lockup|symbole|mot"></span>
     <span data-phi="trait" data-expr="curieux"></span>
   Aucun appel réseau.
   ========================================================================== */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const f = (n) => +n.toFixed(2);
  const pol = (cx, cy, r, deg) => {
    const a = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  /* --- Le filtre craie (une seule fois par page) -------------------------
     Bords qui tremblent (déplacement) et matière poudreuse (masque de bruit). */
  function defs() {
    if (document.getElementById('xphi-defs')) return;
    const d = document.createElementNS(NS, 'svg');
    d.id = 'xphi-defs';
    d.setAttribute('width', 0); d.setAttribute('height', 0);
    d.setAttribute('aria-hidden', 'true');
    d.style.position = 'absolute';
    d.innerHTML = `
      <filter id="craie" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="4" result="lent"/>
        <feDisplacementMap in="SourceGraphic" in2="lent" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="bord"/>
        <feTurbulence type="fractalNoise" baseFrequency="2.4" numOctaves="1" seed="9" result="grain"/>
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.15" result="trous"/>
        <feComposite in="bord" in2="trous" operator="in"/>
      </filter>`;
    document.body.prepend(d);
  }

  /* ======================================================================
     1. LES LOGOS — symbole dans un carré 0 0 100 100
     ====================================================================== */

  // A. L'objectif : un diaphragme à six lames dans l'anneau du Φ.
  function symObjectif(o = {}) {
    const w = o.small ? 7 : 5.2;
    const R = 31, rin = R - w / 2 - 0.4, r = 12.5;
    const V = [...Array(6)].map((_, k) => pol(50, 50, r, -90 + 60 * k));
    let blades = '';
    for (let k = 0; k < 6; k++) {
      // Chaque lame part d'un sommet de l'hexagone et prolonge son arête jusqu'à l'anneau
      const [x0, y0] = V[k], [xp, yp] = V[(k + 5) % 6];
      let dx = x0 - xp, dy = y0 - yp; const L = Math.hypot(dx, dy); dx /= L; dy /= L;
      const bx = x0 - 50, by = y0 - 50, b = bx * dx + by * dy, c = bx * bx + by * by - rin * rin;
      const t = -b + Math.sqrt(b * b - c);
      blades += `<path d="M${f(xp)} ${f(yp)} L${f(x0 + dx * t)} ${f(y0 + dy * t)}"/>`;
    }
    const bw = o.small ? 2.4 : 2.1;
    return `<g fill="none" stroke="currentColor" stroke-linecap="round">
      <circle cx="50" cy="50" r="${R}" stroke-width="${w}"/>
      ${o.small ? '' : `<g stroke-width="${bw}" opacity=".9">${blades}</g>`}
      ${o.small ? `<circle cx="50" cy="50" r="9" stroke-width="${w * 0.8}"/>` : ''}
      <path d="M50 4 L50 ${50 - R - w / 2 + 0.6} M50 ${50 + R + w / 2 - 0.6} L50 96" stroke-width="${w}"/>
      ${o.small ? '' : '<circle cx="50" cy="50" r="4.2" fill="var(--labo)" stroke="none"/>'}
    </g>`;
  }

  // B. Le barillet : six chambres dans le Φ, la sixième est la vôtre (laiton).
  function symBarillet(o = {}) {
    const acte = o.acte || 1;
    if (o.small) {
      // En petit : l'anneau, le trait, et votre chambre seule
      return `<g fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="butt">
        <circle cx="50" cy="50" r="34"/><path d="M50 2 L50 98"/></g>
        <circle cx="65" cy="36" r="9" fill="var(--joueur)"/>`;
    }
    const w = 4.6;
    let inner = '';
    if (acte === 1) {
      for (let k = 0; k < 6; k++) {
        const [x, y] = pol(50, 50, 21, -60 + 60 * k);
        const mine = k === 0;
        inner += `<circle cx="${f(x)}" cy="${f(y)}" r="${o.small ? 7.6 : 7.4}" ${mine ? 'fill="var(--joueur)" stroke="var(--joueur)"' : ''}/>`;
      }
    } else if (acte === 2) {
      // La lettre du test : un anneau de petits cercles, un seul teinté
      for (let k = 0; k < 14; k++) {
        const [x, y] = pol(50, 50, 22, -90 + 360 / 28 + (360 / 14) * k);
        inner += `<circle cx="${f(x)}" cy="${f(y)}" r="3.2" stroke-width="2.2" ${k === 2 ? 'fill="var(--joueur)" stroke="var(--joueur)"' : ''}/>`;
      }
    } else {
      // Les deux pilules (ou les deux pontons) : le Φ s'ouvre en deux moitiés
      inner = `<rect x="24" y="27" width="19" height="46" rx="9.5"/>
               <rect x="57" y="27" width="19" height="46" rx="9.5" fill="var(--joueur)" stroke="var(--joueur)"/>`;
    }
    return `<g fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round">
      <circle cx="50" cy="50" r="38"/>
      ${acte === 1 ? `<circle cx="50" cy="50" r="3" fill="currentColor" stroke="none"/>` : ''}
      <path d="M50 3 L50 ${acte === 3 ? 97 : 97}"/>
      <g stroke-width="${o.small ? w * 0.75 : w * 0.72}">${inner}</g>
    </g>`;
  }

  // C. La craie : le Φ tracé à la main, comme à l'arrêt sur image du film.
  function symCraie(o = {}) {
    const w = o.small ? 8 : 4.4;
    return `<g fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${o.small ? '' : 'filter="url(#craie)"'}>
      <path d="M53 19.5 C71 18 83.5 32 82.5 51 C81.5 71 66 83.5 48 82 C29 80.5 17 66 18.5 48 C20 31 33.5 20.5 51 20.8 C55 21 58 22 60.5 23.2"/>
      <path d="M51.5 5 C50.6 30 49.4 62 50.4 95.5"/>
      ${o.small ? '' : `<path d="M50.2 7.5 C49.8 34 50.6 60 49.4 92" stroke-width="${w * 0.45}" opacity=".55"/>`}
      <circle cx="${o.small ? 68 : 66.5}" cy="${o.small ? 35 : 37}" r="${o.small ? 6 : 3.6}" fill="var(--joueur)" stroke="none"/>
    </g>`;
  }

  // D. L'antenne : XΦ, deux signes de même graisse, lisible à 16 pixels.
  function symAntenne(o = {}) {
    if (o.small) {
      return `<g fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="butt">
        <circle cx="50" cy="50" r="28"/><path d="M50 4 L50 96"/></g>`;
    }
    return `<g fill="none" stroke="currentColor" stroke-width="9.5" stroke-linecap="butt">
        <circle cx="50" cy="50" r="27"/><path d="M50 6 L50 94"/></g>`;
  }

  const SYMS = { objectif: symObjectif, barillet: symBarillet, craie: symCraie, antenne: symAntenne };

  // Mots : chaque piste a sa graisse ; la craie est écrite à la main.
  function wordmark(kind) {
    if (kind === 'craie') {
      return `<svg class="mot" viewBox="0 0 160 100" role="img" aria-label="Xphi">
        <g fill="none" stroke="currentColor" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round" filter="url(#craie)">
          <path d="M8 27 C20 45 33 63 44 80"/><path d="M42 25 C31 43 20 62 11 83"/>
          <path d="M60 46 C60.5 63 59.5 80 60.5 97"/><path d="M60.5 52 C67 41 86 40 86 57 C86 74 68 76 61 66"/>
          <path d="M101 17 C101.5 38 100.5 60 101 80"/><path d="M101.5 57 C105 46 124 41 124.5 57 C125 66 124 73 124.5 80"/>
          <path d="M140.5 46 C140.3 57 140.8 69 140.4 80"/>
        </g>
        <circle cx="141" cy="31" r="4" fill="currentColor" filter="url(#craie)"/></svg>`;
    }
    if (kind === 'antenne') {
      // « X » dessiné à la même graisse que le Φ : un monogramme, pas un mot
      return `<svg class="mot mono" viewBox="0 0 92 100" role="img" aria-label="X">
        <path d="M18 21 L76 79 M76 21 L18 79" stroke="currentColor" stroke-width="10.5" fill="none"/></svg>`;
    }
    const W = { objectif: 300, barillet: 720, antenne: 800 }[kind] || 600;
    return `<span class="mot txt" data-k="${kind}" style="font-weight:${W}">Xphi</span>`;
  }

  function logo(kind, form = 'lockup', o = {}) {
    const sym = `<svg class="sym" viewBox="0 0 100 100" role="img" aria-label="Symbole Xphi">${SYMS[kind](o)}</svg>`;
    if (form === 'symbole') return sym;
    if (form === 'mot') return wordmark(kind);
    if (kind === 'antenne') return `<span class="lock lock-antenne">${wordmark(kind)}${sym}</span>`;
    return `<span class="lock lock-${kind}">${sym}${wordmark(kind)}</span>`;
  }

  /* ======================================================================
     2. LE NARRATEUR — « Phi », dans un carré 0 0 120 120 (+ manche pour la loupe)
     ====================================================================== */
  const E = {
    neutre: [
      { t: 'dot', x: 47, y: 56, r: 3 }, { t: 'dot', x: 73, y: 56, r: 3 },
      { t: 'path', d: 'M48 78 Q60 82 72 78' }],
    curieux: [
      { t: 'dot', x: 47, y: 57, r: 3 }, { t: 'ring', x: 73, y: 56, r: 4.8, big: 7 },
      { t: 'path', d: 'M66 43 L80 39' }, { t: 'path', d: 'M41 47 L53 47' },
      { t: 'ell', x: 60, y: 80, rx: 4, ry: 4.6 }],
    malicieux: [
      { t: 'path', d: 'M42 57 Q47 53 52 57' }, { t: 'path', d: 'M68 57 Q73 53 78 57' },
      { t: 'path', d: 'M66 45 L80 48' }, { t: 'path', d: 'M46 76 Q58 86 74 74' }],
    emu: [
      { t: 'path', d: 'M40 48 L52 44.5' }, { t: 'path', d: 'M68 44.5 L80 48' },
      { t: 'path', d: 'M42 56 Q47 60.5 52 56' }, { t: 'path', d: 'M68 56 Q73 60.5 78 56' },
      { t: 'path', d: 'M51 78 Q55.5 81 60 78.5 Q64.5 76 69 78.5' },
      { t: 'tear', x: 77, y: 63 }],
  };
  const tearD = (x, y) => `M${x} ${y} Q${x + 3.4} ${y + 5} ${x} ${y + 7.2} Q${x - 3.4} ${y + 5} ${x} ${y}`;

  function features(expr, loupe) {
    return E[expr].map((p) => {
      switch (p.t) {
        case 'dot': return `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="currentColor" stroke="none"/>`;
        case 'ring': return `<circle cx="${p.x}" cy="${p.y}" r="${loupe ? p.big : p.r}"/>` +
          (loupe ? `<circle cx="${p.x}" cy="${p.y}" r="2.2" fill="currentColor" stroke="none"/>` : '');
        case 'ell': return `<ellipse cx="${p.x}" cy="${p.y}" rx="${p.rx}" ry="${p.ry}"/>`;
        case 'tear': return `<path d="${tearD(p.x, p.y)}" fill="var(--labo)" stroke="none"/>`;
        default: return `<path d="${p.d}"/>`;
      }
    }).join('');
  }

  // Variante 1 — « Le trait » : le Φ-visage d'aujourd'hui, plus un voyant au sommet.
  function phiTrait(expr, o) {
    return `<svg viewBox="0 0 120 124" role="img" aria-label="Phi, ${expr}">
      <g fill="none" stroke="currentColor" stroke-width="${o.sw || (o.small ? 4 : 2.4)}" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="60" cy="62" r="38"/><path d="M60 13 L60 117"/>
        ${features(expr)}
      </g>
      <circle cx="60" cy="6.5" r="${o.parle || o.small ? 4.6 : 3.4}" fill="var(--labo)"/>
      ${o.parle ? '<circle cx="60" cy="6.5" r="8.5" fill="none" stroke="var(--labo)" stroke-width="1.2" opacity=".5"/>' : ''}
    </svg>`;
  }

  // Variante 2 — « La loupe » : le cercle devient une lentille, le trait un manche.
  function phiLoupe(expr, o) {
    if (o.small && !o.sw) o = { ...o, sw: 3.6 };
    return `<svg viewBox="0 0 120 150" role="img" aria-label="Phi en loupe, ${expr}">
      <circle cx="60" cy="62" r="36" fill="var(--labo)" opacity=".13"/>
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <path d="M60 12 L60 22" stroke-width="${o.sw || 2.4}"/>
        <circle cx="60" cy="62" r="38" stroke-width="${(o.sw || 2.4) * 2.1}"/>
        <path d="M60 104 L60 112" stroke-width="${(o.sw || 2.4) * 1.5}"/>
        <path d="M60 113 L60 144" stroke-width="${(o.sw || 2.4) * 4}"/>
        <g stroke-width="${o.sw || 2.4}">${features(expr, true)}</g>
        <path d="M33 47 A30 30 0 0 1 45 33" stroke="#fff" stroke-width="2.6" opacity=".55"/>
      </g>
    </svg>`;
  }

  // Variante 3 — « Le nuage » : Phi est fait de points, comme vos mille réponses.
  let probe;
  function dotsAlong(d, step) {
    if (!probe) {
      probe = document.createElementNS(NS, 'svg');
      probe.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden';
      document.body.append(probe);
    }
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); probe.append(p);
    const L = p.getTotalLength(), n = Math.max(2, Math.round(L / step));
    const pts = [];
    for (let i = 0; i <= n; i++) { const q = p.getPointAtLength((L * i) / n); pts.push([q.x, q.y]); }
    p.remove();
    return pts;
  }
  function phiNuage(expr, o) {
    const GOLD = Math.PI * (3 - Math.sqrt(5));
    let s = '';
    const N = o.small ? 120 : 340;
    for (let k = 0; k < N; k++) {
      // Anneau en spirale de tournesol, comme le barillet de mille
      const R = Math.sqrt(34.5 ** 2 + ((k + 0.5) / N) * (41.5 ** 2 - 34.5 ** 2));
      const x = 60 + R * Math.cos(k * GOLD), y = 62 + R * Math.sin(k * GOLD);
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${o.small ? 1.5 : 1.05}"/>`;
    }
    for (let y = 9; y <= 117; y += 3.4) {
      if (y > 20 && y < 104) continue; // le trait se perd dans le visage
      s += `<circle cx="60" cy="${f(y)}" r="1.25"/>`;
    }
    for (let y = 26; y < 101; y += 3.4) s += `<circle cx="60" cy="${f(y)}" r=".75" opacity=".55"/>`;
    for (const p of E[expr]) {
      if (p.t === 'dot') s += `<circle cx="${p.x}" cy="${p.y}" r="${p.r + 0.6}"/>`;
      else if (p.t === 'tear') s += `<circle cx="${p.x}" cy="${p.y + 3}" r="1.6" fill="var(--labo)"/><circle cx="${p.x}" cy="${p.y + 6.6}" r="2.3" fill="var(--labo)"/>`;
      else {
        const d = p.t === 'ring' ? `M${p.x + p.r} ${p.y} A${p.r} ${p.r} 0 1 1 ${p.x + p.r - 0.01} ${p.y - 0.1}`
          : p.t === 'ell' ? `M${p.x + p.rx} ${p.y} A${p.rx} ${p.ry} 0 1 1 ${p.x + p.rx - 0.01} ${p.y - 0.1}` : p.d;
        for (const [x, y] of dotsAlong(d, 2.7)) s += `<circle cx="${f(x)}" cy="${f(y)}" r="1.35"/>`;
      }
    }
    return `<svg viewBox="0 0 120 124" role="img" aria-label="Phi en nuage de points, ${expr}">
      <g fill="currentColor">${s}</g>
      <circle cx="60" cy="6.5" r="3" fill="var(--labo)"/></svg>`;
  }

  const PHIS = { trait: phiTrait, loupe: phiLoupe, nuage: phiNuage };
  function phi(variant = 'trait', expr = 'neutre', o = {}) { return PHIS[variant](expr, o); }

  /* --- Montage ------------------------------------------------------------ */
  function mount(root = document) {
    defs();
    root.querySelectorAll('[data-logo]').forEach((n) => {
      const o = { small: 'small' in n.dataset, acte: +(n.dataset.acte || 1) };
      n.innerHTML = logo(n.dataset.logo, n.dataset.form || 'lockup', o);
    });
    root.querySelectorAll('[data-phi]').forEach((n) => {
      const o = { small: 'small' in n.dataset, parle: 'parle' in n.dataset, sw: n.dataset.sw ? +n.dataset.sw : undefined };
      n.innerHTML = phi(n.dataset.phi || 'trait', n.dataset.expr || 'neutre', o);
    });
  }
  window.Xphi = { logo, phi, mount, SYMS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount());
  else mount();
})();
