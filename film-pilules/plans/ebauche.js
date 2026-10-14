/* ==========================================================================
   Les deux pilules, le film — plans/ebauche.js : l'ébauche d'un plan

   Ce que le film montre tant qu'un lot n'a pas dessiné un plan : son numéro,
   son titre, son cadre et ses répliques, dans la DA (le fond, l'œil de Phi qui
   suit la plume, une rangée de sujets de démonstration ; la nuit pour P01 et
   P19, avec le sujet nocturne). Les fichiers plans/<lot>.js du socle s'en
   servent pour chacun de leurs plans ; film.js aussi, pour un lot absent ou
   cassé, et pour un moment qu'aucun plan d'un lot ne couvre encore.

   Ce fichier est au socle : les lots ne le modifient pas (ils remplacent leur
   plans/<lot>.js en entier).
   ========================================================================== */
import {
  fond, FOND_NUIT, oeil, creeRegard, VOUS, humeur, dessineSujet, crochets, DEMO, PREMIERS, N48,
  balise, ecrit, seg, cloche, hache, virgule, CRAIE, GRIS, GRIS_FIG, LABO, LAITON, ROUGE_TXT, MONO, PIX,
} from '../commun.js';
import { REPLIQUES, plume } from '../texte.js';

const NUIT = new Set(['P01', 'P19']);
const OEIL = { x: 1560, y: 300, taille: 200 };
// une rangée de sujets de démonstration, sous les répliques (rien d'important sous y = 830)
const RANG = DEMO.slice(20, 38).map((f, j) => ({ f, x: 170 + j * 56, y: 772 }));
const visage = s => ({ x: s.x, y: s.y - 12 });
// Phi regarde la plume, vous, la rangée (un sujet tiré par créneau), rêvasse
const REGARD = creeRegard({
  repos: [[3, VOUS], [4, T => plume(T)], [2, T => visage(RANG[Math.floor(hache(Math.floor(T / .9) * 37 + 5) * RANG.length)])], [.6, T => ({ x: 200 + hache(Math.floor(T) * 29 + 3) * 1000, y: 120 + hache(Math.floor(T) * 41 + 9) * 500 })]],
});

const s1 = v => virgule(v, 1);
export function ebauche(ctx, t, cam, infos = {}) {
  const P = infos.plan || { id: '—', titre: 'hors découpage', de: t, a: t, cadre: '', lot: infos.lot ? infos.lot.id : '' };
  const nuit = NUIT.has(P.id);
  fond(ctx, t, nuit ? FOND_NUIT : { sol: .45 });
  const k = seg(t, P.de, P.a);

  // le plan
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1;
  ctx.font = `56px ${PIX}`; ctx.fillStyle = CRAIE; ctx.fillText(`${P.id} · ${P.titre}`, 120, 190);
  ctx.font = `22px ${MONO}`; ctx.fillStyle = GRIS;
  ctx.fillText(`lot ${P.lot} · ${s1(P.de)} → ${s1(P.a)} s · ${P.cadre}${P.battement ? ` · ${P.battement}` : ''}`, 120, 234);
  ctx.font = `500 16px ${MONO}`; ctx.fillStyle = LAITON;
  ctx.fillText(`ÉBAUCHE DU SOCLE · à dessiner dans plans/${P.lot}.js${infos.statut ? ` · ${infos.statut}` : ''}`, 120, 268);
  ctx.fillStyle = '#2b2826'; ctx.fillRect(120, 286, 1180, 3);
  ctx.fillStyle = LAITON; ctx.fillRect(120, 286, 1180 * k, 3);
  if (infos.erreur) { ctx.font = `18px ${MONO}`; ctx.fillStyle = ROUGE_TXT; ctx.fillText(String(infos.erreur).slice(0, 110), 120, 318); }

  // ses répliques : passées en gris, celle qu'on dit en craie, à venir en gris figé
  const R = REPLIQUES.filter(r => r.plan === P.id);
  let y = 370;
  ctx.font = `20px ${MONO}`;
  for (const r of R) {
    const ici = t >= r.de && t < r.a, passe = t >= r.a;
    ctx.globalAlpha = ici ? 1 : passe ? .55 : .4;
    ctx.fillStyle = ici ? LABO : GRIS; ctx.font = `500 16px ${MONO}`;
    ctx.fillText(`${r.id} · ${s1(r.de)} → ${s1(r.a)} s · dite ${s1(r.dite)} s`, 120, y);
    ctx.font = `20px ${MONO}`;
    const lignes = balise(r.txt, ici ? CRAIE : GRIS_FIG);
    ecrit(ctx, lignes, 120, y + 30, 28);
    y += 30 + lignes.length * 28 + 22;
  }
  if (!R.length) { ctx.globalAlpha = .55; ctx.fillStyle = GRIS; ctx.fillText('(pas de réplique : un plan muet)', 120, y); }
  ctx.globalAlpha = 1;

  if (nuit) {
    // le sujet nocturne (P01, P19 : le cadre ×6, ici en plus petit à droite), son téléphone qui éclaire
    const N = PREMIERS[N48], z = 4, cx = 1560, cy = 470, halo = ctx.createRadialGradient(cx, cy + 40, 10, cx, cy + 40, 260);
    halo.addColorStop(0, 'rgba(143,192,214,.16)'); halo.addColorStop(1, 'rgba(143,192,214,0)');
    ctx.fillStyle = halo; ctx.fillRect(cx - 300, cy - 300, 600, 600);
    dessineSujet(ctx, N, cx, cy, 4 * z, { col: GRIS_FIG, mode: 'nuit', ecran: 1, reflet: true }, t);
    if (P.id === 'P19') crochets(ctx, cx, cy, z, { a: cloche(t, P.de, P.de + .5, P.a - .5, P.a) });
    ctx.font = `18px ${MONO}`; ctx.fillStyle = GRIS; ctx.textAlign = 'left'; ctx.fillText(P.id === 'P01' ? '23:41' : '23:49', 1720, 330);
    return;
  }
  // la rangée de sujets de démonstration, qui lèvent parfois les yeux vers Phi
  const phi = { x: OEIL.x, y: OEIL.y };
  for (const s of RANG) dessineSujet(ctx, s.f, s.x, s.y, 4, { col: GRIS_FIG, a: .82, phi, cible: phi, reflet: true }, t);
  // Phi
  oeil(ctx, t, { ...OEIL, humeur: humeur(t, []), regard: REGARD, alpha: seg(t, P.de, P.de + .3) });
}
