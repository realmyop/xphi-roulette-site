/* ==========================================================================
   Moteur d'animation déterministe.
   Tout ce qui bouge est une fonction pure du temps : rejouer le même parcours
   donne exactement les mêmes images. L'horloge avance soit en temps réel
   (requestAnimationFrame), soit image par image (futur mode rendu, phase 5).
   ========================================================================== */

export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;

// Courbes d'accélération : jamais de rebond, que des départs et arrivées doux
export const ease = {
  lin: (k) => k,
  in: (k) => k * k * k,
  out: (k) => 1 - Math.pow(1 - k, 3),
  inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
};

// Progression 0 → 1 entre t0 et t1
export const seg = (t, t0, t1, e = ease.inOut) => e(clamp((t - t0) / (t1 - t0)));

// Fondu entrant à t0, sortant à t1
export const inOut = (t, t0, t1, fin = 0.5, fout = 0.4) =>
  Math.min(seg(t, t0, t0 + fin, ease.lin), 1 - seg(t, t1 - fout, t1, ease.lin));

// Pseudo-aléatoire à graine fixe (mulberry32) : pour le décor, jamais pour le jeu
export function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* --------------------------------------------------------------------------
   Lecteur de plans.
   Un plan = { dur, frame(t, ctx) → état, next, enter?, choices?, choose? }.
   - t : temps local du plan ; T : temps global (pour la vie du décor).
   - Un plan à choix se fige à la fin (le décor continue de vivre) jusqu'à ce
     qu'on choisisse ; le choix reste affiché 0,7 s avant la suite.
   -------------------------------------------------------------------------- */
export class Player {
  constructor({ shots, ctx, render }) {
    Object.assign(this, { shots, ctx, render });
    this.T = 0;
  }

  goto(id) {
    // On garde le dernier état du plan précédent (utile pour les fins)
    if (this.shot) this.ctx.last = this.frame();
    this.id = id;
    this.shot = this.shots[id];
    this.t = 0;
    this.pending = null;
    this.waitT = null;
    this.ctx.pick = null;
    this.ctx.T = this.T;
    this.shot.enter?.(this.ctx);
  }

  get waiting() {
    return !!this.shot.choices && !this.pending && this.t >= this.shot.dur;
  }

  // Avance l'horloge de dt secondes
  tick(dt) {
    this.T += dt;
    this.t += dt;
    const s = this.shot;
    if (this.pending) {
      if (this.t >= this.pending.at) this.goto(this.pending.next);
    } else if (this.t >= s.dur) {
      if (s.choices) this.waitT ??= this.T;
      else if (s.next) this.goto(typeof s.next === 'function' ? s.next(this.ctx) : s.next);
    }
    this.render(this.frame(), this);
  }

  frame() {
    return { ...this.shot.frame(this.t, this.ctx, this.T), T: this.T };
  }

  choose(v) {
    if (!this.waiting) return;
    this.ctx.pick = v;
    this.pending = { next: this.shot.choose(v, this.ctx), at: this.t + 0.7 };
  }

  // Saute à la fin du plan en cours (relecture rapide de la maquette)
  skip() {
    if (!this.shot.choices) this.t = Math.max(this.t, this.shot.dur);
  }
}
