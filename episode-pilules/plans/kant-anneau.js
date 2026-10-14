/* ==========================================================================
   Les deux pilules, l'épisode — plans/kant-anneau.js : l'image de raccord
   entre le lot « kant » (P31) et le lot « variantes » (P32)

   EPISODE.md, P31 : « Raccord de sortie (381,6) : l'anneau qui tourne, ses
   flèches, « SAUVÉS = EN DANGER », les rouges assombris aux bords, l'œil en
   (1 700, 150, 120). Le lot variantes reprend cette image (partage.js :
   anneau), sans coupe. » Ce module la dessine, avec les objets de commun.js
   (anneau, pasAnneau, placeRouge, flechesAnneau, ORDRE_ANNEAU,
   ROUGES_ANNEAU) : P31 s'en sert pour sa fin, et le lot variantes peut s'en
   servir pour son début (import { anneauKant, ANNEAU_KANT } from
   './kant-anneau.js'), ou en recopier les réglages.

   Deux réglages que commun.js ne fixe pas, et qui font le raccord :
   - les bleus de l'anneau sont à cs 3 : sur un cercle de 270 px, 62 places
     sont à 27 px l'une de l'autre ; à cs 4 (28 px de large), ils se
     touchent ;
   - les flèches (flechesAnneau) sont tracées sur le cercle agrandi à ×1,13
     autour du centre (rayon 305 : juste au-dehors des bonshommes), avec un
     retrait de 4 px : chaque flèche va de la place d'un bleu à celle du
     suivant, sans passer sur eux. Avec les réglages par défaut (retrait de
     26 px aux deux bouts d'une corde de 27 px), il ne reste d'une flèche que
     sa pointe, posée sur le sujet suivant.
   ========================================================================== */
import {
  CRAIE, BLEU, ROUGE, PIX, DEMO, ANNEAU, ORDRE_ANNEAU, ROUGES_ANNEAU, anneau, pasAnneau, placeRouge, flechesAnneau,
  dessineSujet,
} from '../commun.js';

export const ANNEAU_KANT = Object.freeze({
  csBleus: 3,                                   // dessineSujet(…, anneau(k, rot), cs 3, { col: BLEU })
  csRouges: 4, aRouges: .5,                     // placeRouge(j), cs 4, α 0,5 (assombris)
  echelleFleches: 1.13,                         // les flèches sur le cercle ×1,13 (rayon 305), autour de (960, 440)
  fleches: Object.freeze({ retrait: 4, col: CRAIE, lw: 2, c: 3 }),
  texte: Object.freeze({ txt: 'SAUVÉS = EN DANGER', x: ANNEAU.x, y: ANNEAU.y, taille: 26 }),   // DotGothic16, CRAIE
  oeil: Object.freeze({ x: 1700, y: 150, taille: 120, humeur: 'doute' }),
});

// les flèches de l'anneau, tracées au-dehors des bonshommes (o : { rot, n, a } comme flechesAnneau)
export function flechesKant(ctx, T, o = {}) {
  const s = ANNEAU_KANT.echelleFleches;
  ctx.save();
  ctx.translate(ANNEAU.x, ANNEAU.y); ctx.scale(s, s); ctx.translate(-ANNEAU.x, -ANNEAU.y);
  // (dans le repère agrandi, la largeur du trait et la pointe sont divisées par s : elles restent de 2 et 3 px)
  flechesAnneau(ctx, T, { ...ANNEAU_KANT.fleches, lw: ANNEAU_KANT.fleches.lw / s, ...o });
  ctx.restore();
}

// L'image de la fin du lot kant à l'instant T : les bleus en anneau (qui tourne depuis t0 : pasAnneau(T, t0), une place
// toutes les 0,5 s), leurs flèches, les rouges aux bords, « SAUVÉS = EN DANGER » au centre. Le fond et l'œil restent au
// plan (fond(ctx, T, { sol: .4, centre: [960, 470] }) ; oeil en ANNEAU_KANT.oeil).
//   o : { t0 (l'instant de « circulaire »), phi ({ x, y } : l'œil, pour la lumière et les regards), reflet (true),
//         rot (pour forcer la rotation), fleches (1 : alpha), n (62 : combien de flèches sont tracées), texte (1 :
//         alpha), etat(f, e) (un crochet sur l'état d'un sujet avant qu'il soit dessiné) }
export function anneauKant(ctx, T, o = {}) {
  const rot = o.rot ?? pasAnneau(T, o.t0 ?? T), phi = o.phi;
  for (let j = 0; j < ROUGES_ANNEAU.length; j++) {
    const f = DEMO[ROUGES_ANNEAU[j]], q = placeRouge(j), e = { col: ROUGE, a: ANNEAU_KANT.aRouges, mode: 'repos', phi, cible: phi };
    dessineSujet(ctx, f, q.x, q.y, ANNEAU_KANT.csRouges, o.etat ? o.etat(f, e) : e, T);
  }
  ORDRE_ANNEAU.forEach((i, k) => {
    const f = DEMO[i], q = anneau(k, rot), e = { col: BLEU, mode: 'repos', phi, cible: phi, reflet: o.reflet ?? true };
    dessineSujet(ctx, f, q.x, q.y, ANNEAU_KANT.csBleus, o.etat ? o.etat(f, e) : e, T);
  });
  if ((o.fleches ?? 1) > 0) flechesKant(ctx, T, { rot, a: o.fleches ?? 1, n: o.n ?? ANNEAU.n });
  const at = o.texte ?? 1;
  if (at > 0) {
    const t = ANNEAU_KANT.texte;
    ctx.globalAlpha = at; ctx.font = `${t.taille}px ${PIX}`; ctx.fillStyle = CRAIE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(t.txt, t.x, t.y); ctx.globalAlpha = 1;
  }
  return { rot };
}
