/* ==========================================================================
   Les sept écrans de résultats de l'Acte 3, « Les deux pilules ».
   Chiffres : questionnaire de Monsieur Phi (vidéo « pilule bleue ou pilule
   rouge », près de 10 000 répondants), vérifiés dans la transcription :
     65,5 % de A (formulation A) [29:31] · 12,6 % (formulation B) [37:48]
     prédictions : moyenne 60,7 %, les A « presque 80 % », les B 25 % [30:17–31:30]
     billet de 100 € : 57,5 % boîte A puis 54,6 % bouton A [33:33] ;
       formulation B : 5,7 % et 6 % [37:57–38:06]
     lucidité : 70 % des A le reconnaissent (« plus de 80 % » auraient changé),
       21 % des B (« un peu plus de 60 % » auraient changé) [45:09–46:02]
     très à gauche 39 %, très à droite 23 % ; femmes 43 %, hommes 32 %,
       tous scénarios confondus [52:23–53:07]
   Le bouton A du questionnaire est le ponton bleu du film (la pilule bleue),
   B le ponton rouge. L'écran 7 (« vous ») est en données fictives.
   Chaque écran : draw(k, R, t, P, z) — k la craie, R la zone du graphique,
   t le temps depuis l'apparition (s), P vrai en téléphone, z(16:9, tél.)
   choisit une taille.
   ========================================================================== */
import { INK, BLUE, RED, BRASS, ph, easeOut, clamp, lerp } from './craie.js';

const NB = ' '; // espace fine insécable : « 65,5 % », « ? » ne se coupent jamais
const pc = (v, d = 1) => v.toFixed(d).replace('.', ',') + NB + '%';
const HA = 45, HB = -45; // hachures : A et B se distinguent aussi sans la couleur

/* Légende : une pastille hachurée et son nom, en ligne */
function legende(k, x, y, items, z, f = 1) {
  const s = z(26, 12), fs = z(26, 12);
  let cx = x;
  items.forEach((it, i) => {
    const p = new Path2D();
    p.rect(cx, y - s, s, s);
    k.hachures(p, [cx, y - s, s, s], f, { col: it.col, ang: it.ang, sp: z(7, 4), a: 0.7, wash: 0.18, seed: i * 7 });
    k.rect(cx, y - s, s, s, f, { col: it.col, w: z(2, 1.4) / k.u, seed: 30 + i });
    const w = k.texte(it.label, cx + s + z(12, 6), y - z(3, 1), { size: fs, a: 0.85 * f });
    cx += s + z(12, 6) + w + z(44, 16);
  });
}
const AB = [
  { col: BLUE, ang: HA, label: 'A · le ponton bleu' },
  { col: RED, ang: HB, label: 'B · le ponton rouge' },
];

/* Une colonne hachurée qui monte de la ligne de base */
function colonne(k, x, base, w, hgt, f, col, ang, seed) {
  const h = hgt * f;
  if (h <= 0.5) return;
  const p = new Path2D();
  p.rect(x - w / 2, base - h, w, h);
  k.hachures(p, [x - w / 2, base - h, w, h], 1, { col, ang, sp: k.u * 12 > 8 ? 12 : 8, a: 0.55, wash: 0.13, seed });
  k.rect(x - w / 2, base - h, w, h, 1, { col, open: true, w: 3, seed });
}

export const ECRANS = [
  // 1 — Formulation A : 65,5 % ---------------------------------------------
  {
    titre: 'Formulation A',
    formule: `« Si la majorité appuie sur A, tout le monde vit. Sinon, seuls ceux qui ont appuyé sur B survivent. »`,
    phi: 'neutre',
    replique: `Deux humains sur trois appuient sur A. Je range ce chiffre dans la colonne « solidarité ». Provisoirement.`,
    aria: 'Camembert : avec la formulation A, 65,5 % des répondants appuient sur A, 34,5 % sur B.',
    draw(k, R, t, P, z) {
      const r = P ? Math.min(R.w * 0.27, R.h * 0.34) : Math.min(R.h * 0.47, 235);
      const cx = R.x + R.w * (P ? 0.29 : 0.27), cy = R.y + R.h * (P ? 0.42 : 0.5);
      const f = ph(t, 0.2, 2.2);
      k.camembert(cx, cy, r, [{ v: 65.5, col: BLUE, ang: HA }, { v: 34.5, col: RED, ang: HB }], f,
        { w: 3.2, sp: z(13, 7), gap: z(7, 7) });
      // Les lettres dans les parts
      const fl = ph(t, 1.9, 2.5);
      const mA = -Math.PI / 2 + 0.655 * Math.PI, mB = -Math.PI / 2 + 2 * 0.8275 * Math.PI;
      k.texte('A', cx + Math.cos(mA) * r * 0.52, cy + Math.sin(mA) * r * 0.52, { size: z(64, 24), weight: 700, align: 'center', base: 'middle', f: fl });
      k.texte('B', cx + Math.cos(mB) * r * 0.55, cy + Math.sin(mB) * r * 0.55, { size: z(52, 20), weight: 700, align: 'center', base: 'middle', f: fl });
      // Le chiffre
      const hx = R.x + R.w * (P ? 0.6 : 0.55), hy = cy + z(10, -2);
      k.texte(pc(65.5 * ph(t, 0.2, 2.2, easeOut)), hx, hy, { size: z(168, 44), weight: 700, f: ph(t, 0.2, 0.6) });
      k.texte('appuient sur A', hx + z(6, 2), hy + z(64, 24), { size: z(40, 15), weight: 500, f: ph(t, 1.4, 2.2) });
      k.texte(`${pc(34.5)} sur B`, hx + z(6, 2), hy + z(112, 44), { size: z(30, 12), a: 0.65, f: ph(t, 1.8, 2.6) });
      if (P) legende(k, R.x, R.y + R.h - 4, AB, z, ph(t, 2.4, 3));
      else legende(k, hx + 6, hy + 230, AB, z, ph(t, 2.4, 3));
    },
  },

  // 2 — Formulation B : 12,6 % (l'écran clé) -----------------------------------
  {
    titre: 'Formulation B : la même règle, dans un autre ordre',
    formule: `« Si vous appuyez sur B, il ne vous arrive rien. Si vous appuyez sur A, vous mourez, sauf si la majorité appuie aussi sur A. »`,
    phi: 'malicieux',
    replique: `Mêmes faits, mots dans un autre ordre : cinquante-trois points de moins. J’ai vérifié mes instruments. Deux fois.`,
    aria: 'Deux camemberts : formulation A, 65,5 % appuient sur A ; formulation B, 12,6 % seulement. 53 points d’écart.',
    draw(k, R, t, P, z) {
      const r = P ? Math.min(R.w * 0.165, R.h * 0.25) : Math.min(R.h * 0.33, 170);
      const cy = R.y + R.h * (P ? 0.45 : 0.48);
      const c1 = R.x + R.w * 0.19, c2 = R.x + R.w * 0.81;
      const o = { w: 3.2, sp: z(12, 6), gap: z(6, 4) };
      k.camembert(c1, cy, r, [{ v: 65.5, col: BLUE, ang: HA }, { v: 34.5, col: RED, ang: HB }], ph(t, 0.1, 1.1), { ...o, a: 0.5 });
      k.camembert(c2, cy, r, [{ v: 12.6, col: BLUE, ang: HA }, { v: 87.4, col: RED, ang: HB }], ph(t, 1.6, 2.8), { ...o, seed: 50 });
      const ty = cy - r - z(36, 14), vy = cy + r + z(78, 30);
      k.texte('Formulation A', c1, ty, { size: z(32, 13), weight: 600, align: 'center', a: 0.6, f: ph(t, 0, 0.5) });
      k.texte('Formulation B', c2, ty, { size: z(32, 13), weight: 600, align: 'center', f: ph(t, 1.4, 1.9) });
      k.texte(pc(65.5), c1, vy, { size: z(72, 26), weight: 700, align: 'center', a: 0.6, f: ph(t, 0.6, 1.1) });
      k.texte(pc(12.6 * ph(t, 1.6, 2.8, easeOut)), c2, vy, { size: z(72, 26), weight: 700, align: 'center', f: ph(t, 1.6, 2.0) });
      k.texte('appuient sur A', c1, vy + z(40, 16), { size: z(26, 11), align: 'center', a: 0.5, f: ph(t, 0.8, 1.3) });
      k.texte('appuient sur A', c2, vy + z(40, 16), { size: z(26, 11), align: 'center', a: 0.8, f: ph(t, 2.4, 2.9) });
      // La flèche et l'écart
      const ax0 = c1 + r + z(56, 10), ax1 = c2 - r - z(56, 10);
      k.fleche(ax0, cy, ax1, cy, ph(t, 1.0, 1.7), { w: 3, head: z(24, 10) / k.u, seed: 9 });
      k.texte(`−53${NB}points`, (ax0 + ax1) / 2, cy - z(30, 10), { size: z(66, 17), weight: 700, align: 'center', f: ph(t, 2.8, 3.5) });
      k.texte('même situation', (ax0 + ax1) / 2, cy + z(52, 20), { size: z(28, 11), align: 'center', a: 0.7, f: ph(t, 3.2, 3.8) });
      if (P) legende(k, R.x, R.y + R.h - 4, AB, z, ph(t, 3, 3.6));
      else legende(k, (ax0 + ax1) / 2 - 270, vy + z(40, 16), AB, z, ph(t, 3, 3.6));
    },
  },

  // 3 — Les prédictions -----------------------------------------------------------
  {
    titre: `Combien appuieront sur A${NB}? Les prédictions`,
    formule: 'Formulation A. Chacun devait aussi deviner le résultat de tous les autres.',
    phi: 'curieux',
    replique: `Chacun prédit les autres à son image : les A voient des A partout, les B des B. La moyenne, elle, tombe presque juste.`,
    aria: 'Prédictions de la part de A : moyenne 60,7 % ; ceux qui choisissent A prédisent presque 80 %, ceux qui choisissent B 25 %. Résultat réel : 65,5 %.',
    draw(k, R, t, P, z) {
      const x0 = P ? R.x + 6 : R.x + 560, x1 = R.x + R.w - z(70, 12);
      const X = (v) => lerp(x0, x1, v / 100);
      const top = R.y + z(56, 26), bot = R.y + R.h - z(46, 22);
      const rows = [
        { y: lerp(top, bot, P ? 0.2 : 0.18), v: 60.7, col: INK, lab: 'Prédiction moyenne', val: pc(60.7) },
        { y: lerp(top, bot, P ? 0.56 : 0.54), v: 80, col: BLUE, lab: 'Ceux qui choisissent A', val: `presque ${pc(80, 0)}` },
        { y: lerp(top, bot, P ? 0.92 : 0.9), v: 25, col: RED, lab: 'Ceux qui choisissent B', val: pc(25, 0) },
      ];
      // L'axe et ses graduations
      const fa = ph(t, 0, 0.8);
      k.ligne(x0, bot + z(30, 14), x1, bot + z(30, 14), fa, { a: 0.5, w: 1.6, seed: 3 });
      [0, 50, 100].forEach((v, i) => {
        k.ligne(X(v), bot + z(22, 10), X(v), bot + z(38, 18), fa, { a: 0.5, w: 1.6, seed: 4 + i });
        k.texte(v ? pc(v, 0) : '0', X(v), bot + z(72, 32), { size: z(24, 10), align: 'center', a: 0.6, f: fa });
      });
      // Le résultat réel : un trait vertical, de haut en bas
      const fr = ph(t, 0.4, 1.3);
      k.ligne(X(65.5), top - z(8, 4), X(65.5), bot + z(30, 14), fr, { w: 2.4, a: 0.9, seed: 11 });
      k.texte(`résultat réel : ${pc(65.5)}`, X(65.5) + z(14, 5), top + z(4, 2), { size: z(28, 11), weight: 600, f: ph(t, 1.0, 1.6) });
      rows.forEach((r, i) => {
        const d = 1.2 + i * 0.55;
        k.ligne(x0, r.y, x1, r.y, ph(t, d - 0.6, d + 0.2), { a: 0.22, w: 1.4, seed: 20 + i });
        if (P) k.texte(r.lab, R.x, r.y - z(0, 14), { size: 12, weight: 600, f: ph(t, d - 0.6, d) });
        else k.texte(r.lab, x0 - 44, r.y + 11, { size: 32, weight: 600, align: 'right', f: ph(t, d - 0.6, d) });
        // L'écart à la réalité, puis la prédiction
        const fe = ph(t, d + 0.3, d + 0.9);
        k.ligne(X(65.5), r.y, lerp(X(65.5), X(r.v), fe), r.y, fe > 0 ? 1 : 0, { col: r.col, w: 3, a: 0.75, seed: 30 + i });
        k.point(lerp(X(65.5), X(r.v), fe), r.y, z(11, 6), r.col, ph(t, d + 0.2, d + 0.4));
        // Trop près du trait du résultat réel : l'étiquette passe à gauche du point
        const pres = Math.abs(r.v - 65.5) < 10;
        const vx = pres ? X(r.v) - z(24, 10) : X(r.v), vy = pres ? r.y + z(11, 4) : P ? r.y + 18 : r.y - 24;
        k.texte(r.val, vx, vy, { size: z(32, 12), weight: 700, align: pres ? 'right' : 'center', f: ph(t, d + 0.8, d + 1.2) });
      });
    },
  },

  // 4 — Un billet de 100 € d'abord -------------------------------------------------
  {
    titre: 'Un billet de 100 € d’abord',
    formule: 'Le même dilemme avec de l’argent (boîte A ou B), puis avec la vie (bouton A ou B). Part de A.',
    phi: 'neutre',
    replique: `Cent euros d’abord : la part de A baisse un peu. L’ordre des mots, lui, la divise presque par dix.`,
    aria: 'Colonnes : avec la formulation A, 65,5 % appuient sur A sans billet ; avec un billet d’abord, 57,5 % le mettent dans la boîte A, puis 54,6 % appuient sur A. Avec la formulation B : 12,6 % sans billet, puis 5,7 % et 6 %.',
    draw(k, R, t, P, z) {
      const base = R.y + R.h - z(84, 30);
      const H = base - (R.y + z(100, 46));
      const Y = (v) => base - (v / 66) * H;
      // Trois colonnes par formulation : directement (sans billet), le billet, puis la vie
      const panels = [
        { x0: R.x, x1: R.x + R.w * 0.46, nom: 'Formulation A', v: [65.5, 57.5, 54.6] },
        { x0: R.x + R.w * 0.54, x1: R.x + R.w, nom: 'Formulation B', v: [12.6, 5.7, 6] },
      ];
      const cats = [['sans billet', '(la vie, directement)'], ['le billet', '(boîte A)'], ['puis la vie', '(bouton A)']];
      panels.forEach((p, j) => {
        const d = j * 1.5, w = p.x1 - p.x0;
        k.texte(p.nom, p.x0, R.y + z(20, 10), { size: z(34, 13), weight: 600, f: ph(t, d, d + 0.5) });
        k.ligne(p.x0, base, p.x1, base, ph(t, d, d + 0.6), { w: 2.2, a: 0.8, seed: 40 + j });
        p.v.forEach((v, i) => {
          const x = p.x0 + w * (0.17 + i * 0.33), bw = z(96, 26);
          const fb = ph(t, d + 0.4 + i * 0.35, d + 1.3 + i * 0.35);
          const fv = ph(t, d + 0.5 + i * 0.35, d + 0.8 + i * 0.35);
          const dec = Number.isInteger(v) ? 0 : 1;
          if (i === 0) {
            // La référence, sans billet : un simple contour, plus discret
            const h = (base - Y(v)) * fb;
            if (h > 0.5) k.rect(x - bw / 2, base - h, bw, h, 1, { open: true, w: 2, a: 0.5, seed: 50 + j });
            k.texte(pc(v * fb, dec), x, Y(v * fb) - z(16, 6), { size: z(36, 13), weight: 600, align: 'center', a: 0.65, f: fv });
          } else {
            colonne(k, x, base, bw, base - Y(v), fb, BLUE, HA, 60 + j * 4 + i);
            k.texte(pc(v * fb, dec), x, Y(v * fb) - z(16, 6), { size: z(44, 15), weight: 700, align: 'center', f: fv });
          }
          const fc = ph(t, d + 0.4, d + 0.9);
          k.texte(P ? ['direct', 'billet', 'vie'][i] : cats[i][0], x, base + z(38, 15), { size: z(26, 10), weight: 600, align: 'center', a: i ? 0.9 : 0.65, f: fc });
          if (!P) k.texte(cats[i][1], x, base + z(68, 0), { size: 20, align: 'center', a: i ? 0.65 : 0.5, f: fc });
        });
      });
    },
  },

  // 5 — Lucidité ----------------------------------------------------------------------
  {
    titre: 'Se savoir influençable',
    formule: 'Auraient-ils répondu autrement avec l’autre formulation ? Ce qu’ils en disent, et ce que montrent les chiffres.',
    phi: 'curieux',
    replique: `Les A se savent influençables ; les B, beaucoup moins. Les mots qui nous convainquent passent toujours inaperçus.`,
    aria: 'Ceux qui choisissent A (formulation A) : plus de 80 % auraient changé d’avis, 70 % le reconnaissent. Ceux qui choisissent B (formulation B) : un peu plus de 60 % auraient changé, 21 % le reconnaissent.',
    draw(k, R, t, P, z) {
      const x0 = P ? R.x : R.x + 480, x1 = R.x + R.w - z(20, 4);
      const X = (v) => lerp(x0, x1, v / 100);
      const rows = [
        { y: R.y + R.h * (P ? 0.27 : 0.3), col: BLUE, ang: HA, lab: 'Ceux qui choisissent A', sub: 'après la formulation A', reel: 80, reelT: 'plus de 80 %', dit: 70 },
        { y: R.y + R.h * (P ? 0.77 : 0.76), col: RED, ang: HB, lab: 'Ceux qui choisissent B', sub: 'après la formulation B', reel: 60, reelT: 'un peu plus de 60 %', dit: 21 },
      ];
      const hO = z(84, 30), hF = z(40, 14);
      rows.forEach((r, i) => {
        const d = i * 1.6;
        if (P) {
          k.texte(r.lab, R.x, r.y - hO / 2 - 34, { size: 13, weight: 600, f: ph(t, d, d + 0.4) });
        } else {
          k.texte(r.lab, x0 - 44, r.y + 2, { size: 32, weight: 600, align: 'right', f: ph(t, d, d + 0.5) });
          k.texte(r.sub, x0 - 44, r.y + 38, { size: 22, align: 'right', a: 0.6, f: ph(t, d + 0.2, d + 0.7) });
        }
        // Ceux qui auraient vraiment changé : un contour
        const fo = ph(t, d + 0.3, d + 1.1);
        k.rect(x0, r.y - hO / 2, X(r.reel) - x0, hO, fo, { w: 2, a: 0.75, seed: 70 + i });
        k.texte(`auraient changé d’avis : ${r.reelT.replace(' %', NB + '%')}`, P ? x0 : X(r.reel), r.y - hO / 2 - z(14, 6),
          { size: z(26, 11), align: P ? 'left' : 'right', a: 0.75, f: ph(t, d + 0.8, d + 1.3) });
        // Ceux qui le reconnaissent : plein, hachuré
        const ff = ph(t, d + 1.0, d + 1.7);
        const w = (X(r.dit) - x0) * ff;
        if (w > 1) {
          const p = new Path2D();
          p.rect(x0, r.y - hF / 2, w, hF);
          k.hachures(p, [x0, r.y - hF / 2, w, hF], 1, { col: r.col, ang: r.ang, sp: z(11, 6), a: 0.6, wash: 0.16, seed: 80 + i });
          k.rect(x0, r.y - hF / 2, w, hF, 1, { col: r.col, w: 3, seed: 85 + i });
        }
        const court = r.dit < 30; // barre courte : l'étiquette part de la gauche
        k.texte(`le reconnaissent : ${pc(r.dit, 0)}`, court ? x0 : X(r.dit), r.y + hO / 2 + z(40, 16),
          { size: z(30, 12), weight: 700, align: court ? 'left' : 'right', f: ph(t, d + 1.5, d + 2.0) });
      });
    },
  },

  // 6 — Politique et genre --------------------------------------------------------------
  {
    titre: 'Gauche, droite, femmes, hommes',
    formule: 'Part de A, tous scénarios confondus.',
    phi: 'malicieux',
    replique: `Seize points selon la politique, onze selon le genre. L’ordre des mots, lui, en fait cinquante-trois. Je recalcule.`,
    aria: 'Part de A : 39 % chez les très à gauche, 23 % chez les très à droite ; 43 % chez les femmes, 32 % chez les hommes. Tous scénarios confondus.',
    draw(k, R, t, P, z) {
      const base = R.y + R.h - z(70, 30);
      const top = R.y + z(110, 46);
      const Y = (v) => base - (v / 50) * (base - top);
      const panels = [
        { x0: R.x, x1: R.x + R.w * 0.46, nom: 'Orientation politique', ecart: 16, v: [39, 23], c: ['très à gauche', 'très à droite'] },
        { x0: R.x + R.w * 0.54, x1: R.x + R.w, nom: 'Genre', ecart: 11, v: [43, 32], c: ['femmes', 'hommes'] },
      ];
      panels.forEach((p, j) => {
        const d = j * 1.4, w = p.x1 - p.x0;
        k.texte(p.nom, p.x0, R.y + z(20, 10), { size: z(34, 13), weight: 600, f: ph(t, d, d + 0.5) });
        k.texte(`${p.ecart}${NB}points d’écart`, p.x0, R.y + z(58, 26), { size: z(26, 11), a: 0.7, f: ph(t, d + 1.2, d + 1.6) });
        k.ligne(p.x0, base, p.x1, base, ph(t, d, d + 0.6), { w: 2.2, a: 0.8, seed: 90 + j });
        // Repère discret à 50 %
        const fg = ph(t, d + 0.2, d + 0.8);
        k.ligne(p.x0, Y(50), p.x1, Y(50), fg, { w: 1.2, a: 0.25, seed: 93 + j });
        k.texte(pc(50, 0), p.x1, Y(50) - z(10, 4), { size: z(22, 9), align: 'right', a: 0.5, f: fg });
        const xs = [p.x0 + w * 0.22, p.x0 + w * 0.78];
        const bw = z(100, 30);
        p.v.forEach((v, i) => {
          const fb = ph(t, d + 0.4 + i * 0.3, d + 1.2 + i * 0.3);
          colonne(k, xs[i], base, bw, base - Y(v), fb, BLUE, HA, 100 + j * 4 + i);
          k.texte(pc(v * fb, 0), xs[i], Y(v * fb) - z(16, 6), { size: z(44, 15), weight: 700, align: 'center', f: ph(t, d + 0.5, d + 0.8) });
          k.texte(p.c[i], xs[i], base + z(42, 16), { size: z(24, 10), align: 'center', a: 0.8, f: ph(t, d + 0.4, d + 0.9) });
        });
        if (j === 0) {
          // Entre les deux extrêmes, la part de A diminue progressivement
          const fa = ph(t, d + 1.3, d + 2.0);
          const a0 = xs[0] + bw / 2 + z(24, 6), a1 = xs[1] - bw / 2 - z(24, 6);
          k.fleche(a0, Y(39) + z(20, 8), a1, Y(23) - z(24, 8), fa, { w: 2, a: 0.7, head: z(18, 7) / k.u, seed: 120 });
          if (!P) k.texte('diminue progressivement', a0 + 6, Y(39) + 2, { size: 22, align: 'left', a: 0.65, f: ph(t, d + 1.8, d + 2.3) });
        }
      });
    },
  },

  // 7 — Votre réponse (données fictives) ----------------------------------------------
  {
    titre: `Et vous${NB}?`,
    formule: '', // rempli selon ?formulation= et ?choix=
    fictif: true,
    phi: 'neutre',
    replique: `Et vous voici : un point parmi d’autres. Ni meilleur, ni pire. Simplement le vôtre, et je vous en remercie.`,
    aria: '',
    draw(k, R, t, P, z, ctx) {
      const F = ctx.formulation, bleu = ctx.choix === 'bleu';
      const autre = F === 'A' ? 'B' : 'A';
      const parts = { A: 61, B: 18 }; // données fictives
      const blocs = [
        { F, nom: `Formulation ${F}, comme vous`, nb: parts[F], vous: true },
        { F: autre, nom: `Formulation ${autre}`, nb: parts[autre] },
      ];
      const bw = P ? R.w : R.w * 0.6, sp = bw / 25, rdot = z(8.5, 4.4);
      blocs.forEach((b, j) => {
        const d = j * 1.2;
        const y0 = R.y + (P ? j * R.h * 0.5 + 6 : j * R.h * 0.52 + 6);
        const by = y0 + z(72, 34) + sp / 2;
        k.texte(b.nom, R.x, y0 + z(16, 4), { size: z(30, 13), weight: 600, a: b.vous ? 1 : 0.7, f: ph(t, d, d + 0.5) });
        const me = bleu ? b.nb - 4 : b.nb + 3;
        for (let i = 0; i < 100; i++) {
          const c = Math.floor(i / 4), r = i % 4;
          const x = R.x + sp / 2 + c * sp, y = by + r * sp;
          const o = clamp((t - 0.3 - d - (i / 100) * 1.0) * 6);
          if (b.vous && i === me) {
            k.joueur(x, y, z(10, 5.5), ph(t, 2.4, 2.9));
            if (t > 2.6) k.texte('vous', x, by - sp / 2 - z(14, 6), { size: z(28, 12), weight: 700, align: 'center', col: BRASS, f: ph(t, 2.6, 3.0) });
            continue;
          }
          k.point(x, y, rdot, i < b.nb ? BLUE : RED, o * (b.vous ? 1 : 0.7));
        }
        const sy = P ? by + 4 * sp + z(0, 4) : by + sp * 0.6;
        const sx = P ? R.x : R.x + bw + z(60, 0);
        const fs = ph(t, d + 1.2, d + 1.7);
        if (P) {
          k.texte(`${pc(b.nb, 0)} le bleu · ${pc(100 - b.nb, 0)} le rouge`, sx, sy, { size: 12, a: b.vous ? 0.9 : 0.65, f: fs });
        } else {
          k.texte(`${pc(b.nb, 0)} le bleu (A)`, sx, sy, { size: 34, weight: 700, a: b.vous ? 1 : 0.7, f: fs });
          k.texte(`${pc(100 - b.nb, 0)} le rouge (B)`, sx, sy + 48, { size: 30, a: b.vous ? 0.8 : 0.6, f: fs });
        }
      });
    },
  },
];

/* Le texte de l'écran « vous », selon ce que le joueur a lu et choisi */
export function formuleVous(ctx) {
  const n = ctx.formulation === 'A' ? 61 : 18;
  const part = ctx.choix === 'bleu' ? n : 100 - n;
  return `Vous avez lu la formulation ${ctx.formulation} et choisi le ponton ${ctx.choix}, comme ${part}${NB}% de ceux qui l’ont lue.`;
}
