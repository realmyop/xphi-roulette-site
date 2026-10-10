/* ==========================================================================
   L'œil de Phi : le logo A (l'objectif) devenu le visage du narrateur.
   Un diaphragme à six lames dans l'anneau du Φ, une pupille bleue au centre.
   Il vit tout seul (le regard flâne, il cligne de temps en temps) et prend
   les expressions du narrateur :
     neutre     il raconte
     curieux    il penche la tête, regarde en haut, se resserre un peu
     malicieux  il se plisse et regarde de côté
     emu        il s'ouvre, la lueur monte, le regard baisse
     talk       quand il parle, la lueur bat doucement
     look       {x, y} : il regarde là (par exemple le bouton survolé)
     blink      0 → 1 : clignement imposé (sinon il cligne tout seul)
     ouverture  > 1 : il s'écarquille
   Tout est fonction du temps T qu'on lui donne : même suite d'instants, mêmes
   images (le film peut donc l'enregistrer en vidéo).

   Usage :
     const o = XphiOeil.create(element, { small: true });
     o.draw(T, { expr: 'curieux', talk: true });
   ou, sans horloge à fournir :
     XphiOeil.auto(element)   lit data-expr et la classe .talk de l'élément
   ========================================================================== */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const R = 31, R0 = 12.5;
  const f = (n) => +n.toFixed(2);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  // Hasard déterministe : même graine, même suite (pour les clignements et les coups d'œil)
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  const EXPR = {
    neutre: { x: 0, y: 0, r: R0, rot: 0, glow: 0.35 },
    curieux: { x: 3.6, y: -3.6, r: 10.2, rot: 8, glow: 0.45 },
    malicieux: { x: -3.8, y: 0.6, r: 6.6, rot: -4, glow: 0.4 },
    emu: { x: 0, y: 3.2, r: 14.5, rot: 0, glow: 0.85 },
  };

  let compte = 0;
  function create(host, o = {}) {
    const small = !!o.small;
    const ring = small ? 7 : 5.2, blade = small ? 3 : 2.1;
    const RIN = R - ring / 2 - 0.4;
    host.innerHTML = '';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.overflow = 'visible';
    const gid = 'oeil-halo-' + (++compte);
    svg.innerHTML = `
      <defs><radialGradient id="${gid}"><stop offset="0" stop-color="#8fc0d6" stop-opacity=".9"/><stop offset="1" stop-color="#8fc0d6" stop-opacity="0"/></radialGradient></defs>
      <g class="tete">
        <g fill="none" stroke="currentColor" stroke-linecap="round">
          <circle cx="50" cy="50" r="${R}" stroke-width="${ring}"/>
          <path class="lames" stroke-width="${blade}" opacity=".9"/>
          <path d="M50 4 L50 ${f(50 - R - ring / 2 + 0.6)} M50 ${f(50 + R + ring / 2 - 0.6)} L50 96" stroke-width="${ring}"/>
        </g>
        <circle class="halo" r="10" fill="url(#${gid})"/>
        <circle class="pupille" r="4.2" fill="#8fc0d6"/>
        ${small ? '' : '<circle class="reflet" r="1" fill="#fff" opacity=".75"/>'}
      </g>`;
    host.append(svg);
    const q = (s) => svg.querySelector(s);
    const tete = q('.tete'), lames = q('.lames'), halo = q('.halo'), pup = q('.pupille'), refl = q('.reflet');

    function geom(s) {
      const cx = 50 + s.x, cy = 50 + s.y, r = Math.max(0, s.r);
      const a0 = -90 + (R0 - r) * 2.6; // les lames tournent en se fermant, comme un vrai objectif
      const U = [], V = [];
      for (let k = 0; k < 6; k++) {
        const a = ((a0 + 60 * k) * Math.PI) / 180;
        U.push([Math.cos(a), Math.sin(a)]);
        V.push([cx + r * U[k][0], cy + r * U[k][1]]);
      }
      let d = '';
      for (let k = 0; k < 6; k++) {
        const p = (k + 5) % 6;
        let dx = U[k][0] - U[p][0], dy = U[k][1] - U[p][1];
        const L = Math.hypot(dx, dy); dx /= L; dy /= L;
        const bx = V[k][0] - 50, by = V[k][1] - 50, b = bx * dx + by * dy, c = bx * bx + by * by - RIN * RIN;
        const t = -b + Math.sqrt(Math.max(0, b * b - c));
        d += `M${f(V[p][0])} ${f(V[p][1])} L${f(V[k][0] + dx * t)} ${f(V[k][1] + dy * t)} `;
      }
      lames.setAttribute('d', d);
      const pr = Math.min(small ? 5 : 4.2, r * 0.62);
      pup.setAttribute('cx', f(cx)); pup.setAttribute('cy', f(cy)); pup.setAttribute('r', f(pr));
      if (refl) { refl.setAttribute('cx', f(cx + pr * 0.33)); refl.setAttribute('cy', f(cy - pr * 0.33)); refl.setAttribute('r', f(pr * 0.24)); }
      halo.setAttribute('cx', f(cx)); halo.setAttribute('cy', f(cy));
      halo.setAttribute('r', f(6 + 8 * s.glow));
      halo.setAttribute('opacity', f(clamp(s.glow, 0, 1) * Math.min(1, r / 6)));
      tete.setAttribute('transform', `rotate(${f(s.rot)} 50 50)`);
    }

    // État lissé : l'œil glisse d'une expression à l'autre
    const cur = { ...EXPR.neutre };
    let lastT = null;
    function draw(T, { expr = 'neutre', talk = false, look = null, glow = 0, blink = null, ouverture = 1 } = {}) {
      const dt = lastT === null ? 1 : clamp(T - lastT, 0, 0.25);
      lastT = T;
      // look : regard imposé (vers un bouton), sinon celui de l'expression
      const tgt = { ...(EXPR[expr] || EXPR.neutre) };
      if (look) { tgt.x = look.x; tgt.y = look.y; }
      tgt.glow += glow;
      const k = 1 - Math.exp(-dt * 6);
      for (const key in tgt) cur[key] += (tgt[key] - cur[key]) * k;

      // La vie : un coup d'œil de temps en temps, un regard jamais tout à fait immobile
      const slot = Math.floor(T / 2.7), u = T / 2.7 - slot;
      const glance = !look && hash(slot) < 0.35 && u > 0.25 && u < 0.75 ? (hash(slot + 9) < 0.5 ? -1 : 1) * 4.5 * Math.sin(Math.PI * (u - 0.25) * 2) : 0;
      const s = {
        x: cur.x + glance + 0.4 * Math.sin(T * 1.7),
        y: cur.y + 0.35 * Math.sin(T * 1.3 + 1),
        r: cur.r,
        rot: cur.rot,
        glow: cur.glow + (talk ? 0.3 * Math.abs(Math.sin(T * 8.5)) : 0.05 * Math.sin(T * 2.1)),
      };
      // Clignement : environ toutes les 4 à 6 s, parfois double
      const bslot = Math.floor(T / 5), bu = T - bslot * 5, at = 1 + 3 * hash(bslot + 3);
      const blink_ = (t0) => { const d = bu - t0; return d >= 0 && d < 0.22 ? 1 - Math.sin((Math.PI * d) / 0.22) : 1; };
      // blink (0 fermé → 1 ouvert) : clignement imposé par la page (qui fait alors le bruit) ;
      // ouverture > 1 : il s'écarquille
      s.r *= ouverture * (blink !== null ? blink : blink_(at) * (hash(bslot + 7) < 0.25 ? blink_(at + 0.3) : 1));
      geom(s);
    }
    draw(0);
    return { draw, svg };
  }

  // Horloge propre : lit data-expr et .talk sur l'élément (pages sans moteur de film)
  function auto(host, o = {}) {
    const e = create(host, o);
    const t0 = performance.now();
    const tick = (now) => {
      e.draw((now - t0) / 1000, { expr: host.dataset.expr || 'neutre', talk: host.classList.contains('talk') || host.hasAttribute('data-parle') });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return e;
  }

  window.XphiOeil = { create, auto };
  // Les éléments [data-oeil] s'animent tout seuls ; data-oeil="small" pour les petites tailles
  const mountAll = () => document.querySelectorAll('[data-oeil]').forEach((n) => auto(n, { small: n.dataset.oeil === 'small' }));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll);
  else mountAll();
})();
