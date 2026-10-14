/* ==========================================================================
   Les deux pilules, l'épisode — plans/ebauche.js : l'ébauche d'un plan

   Ce que l'épisode montre tant qu'un lot n'a pas dessiné un plan : son
   numéro, son titre, sa séquence et son lot, l'indication du script qu'il
   réalise (citée, jamais dite), ses répliques (celle qu'on dit en craie), dans
   la DA : le fond du laboratoire (la nuit pour l'ouverture et la fin), l'œil
   de Phi qui suit la plume de la boîte, et quelques bonshommes du film de
   3 min 20 qui lèvent parfois les yeux vers lui. Les fichiers plans/<lot>.js
   du socle s'en servent pour chacun de leurs plans ; film.js aussi, pour un
   lot absent ou cassé, et pour un moment qu'aucun plan d'un lot ne couvre.

   Ce fichier est au socle : les lots ne le modifient pas (ils remplacent leur
   plans/<lot>.js en entier, et peuvent appeler ebauche() pour un plan qu'ils
   n'ont pas encore dessiné).
   ========================================================================== */
import {
  fond, FOND_NUIT, oeil, creeRegard, VOUS, humeur, dessineSujet, DEMO, PREMIERS, N48, coupe,
  balise, ecrit, seg, hache, virgule, fr, CRAIE, GRIS, GRIS_FIG, LABO, LAITON, ROUGE_TXT, MONO, PIX, FILET,
} from '../commun.js';
import { REPLIQUES, SEQUENCES, plume, PAROLE } from '../texte.js';

const num = id => +String(id).slice(1);
// la nuit : l'ouverture avant le générique (P01–P07) et la fin (P82–P85), comme dans EPISODE.md
const nuit = id => (num(id) >= 1 && num(id) <= 7) || num(id) >= 82;
// les cent premiers participants là où le test et ses résultats se jouent ; ailleurs, les sujets de démonstration
const AVEC_PREMIERS = new Set(['test', 'tirage', 'resultats']);
const OEIL = { x: 1650, y: 290, taille: 190 };
const X0 = 120, LARGEUR = 1300;   // la colonne du texte : x 120–1420 (l'œil et les bonshommes à droite)
// trois rangées de cinq bonshommes, sous l'œil (rien d'important sous y = 830)
const PLACES = [...Array(15).keys()].map(j => ({ j, x: 1530 + (j % 5) * 60, y: 560 + Math.floor(j / 5) * 76 }));
const foule = lot => PLACES.map(p => ({ ...p, f: AVEC_PREMIERS.has(lot) ? PREMIERS[(p.j * 7 + 3) % 100 === N48 ? 0 : (p.j * 7 + 3) % 100] : DEMO[20 + p.j] }));
const visage = s => ({ x: s.x, y: s.y - 12 });
const FOULES = new Map();
const fouleDe = lot => { if (!FOULES.has(lot)) FOULES.set(lot, foule(lot)); return FOULES.get(lot); };
// Phi regarde la plume, vous, la foule (un sujet tiré par créneau), rêvasse
const REGARDS = new Map();
const regardDe = lot => {
  if (!REGARDS.has(lot)) {
    const F = fouleDe(lot);
    REGARDS.set(lot, creeRegard({
      repos: [[3, VOUS], [4, T => plume(T)], [2, T => visage(F[Math.floor(hache(Math.floor(T / .9) * 37 + 5) * F.length)])],
        [.6, T => ({ x: 200 + hache(Math.floor(T) * 29 + 3) * 1000, y: 160 + hache(Math.floor(T) * 41 + 9) * 500 })]],
    }));
  }
  return REGARDS.get(lot);
};

const s1 = v => virgule(v, 1);
// la taille qui fait tenir les répliques entre y0 et 820 : [police, interligne, écart]
function tailles(R, y0) {
  for (const [z, lh, gap] of [[20, 28, 20], [18, 25, 14], [16, 22, 10]]) {
    const h = R.reduce((s, r) => s + 26 + r.txt.split('\n').length * lh + gap, 0);
    if (y0 + h <= 820) return [z, lh, gap];
  }
  return [16, 22, 8];
}

export function ebauche(ctx, t, cam, infos = {}) {
  const lot = infos.lot ? infos.lot.id : '';
  const P = infos.plan || { id: '—', titre: 'hors découpage', de: t, a: t, lot, sequence: '', script: null, repliques: '—' };
  const n = nuit(P.id);
  fond(ctx, t, n ? FOND_NUIT : { sol: .45 });
  const k = seg(t, P.de, P.a), S = SEQUENCES.find(s => s.id === P.sequence);

  // le plan : son titre (réduit s'il est trop large), sa séquence, son lot
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1;
  const titre = `${P.id} · ${P.titre}`;
  let z = 52; ctx.font = `${z}px ${PIX}`;
  while (z > 30 && ctx.measureText(titre).width > LARGEUR) { z -= 2; ctx.font = `${z}px ${PIX}`; }
  ctx.fillStyle = CRAIE; ctx.fillText(titre, X0, 196);
  const sous = fr(`${S ? `${S.id} · ${S.nom} · ` : ''}lot ${P.lot || lot} · ${s1(P.de)} → ${s1(P.a)} s (${s1(P.a - P.de)} s)`);
  let zs = 20; ctx.font = `${zs}px ${MONO}`;
  while (zs > 14 && ctx.measureText(sous).width > LARGEUR) { zs -= 1; ctx.font = `${zs}px ${MONO}`; }
  ctx.fillStyle = GRIS; ctx.fillText(sous, X0, 236);
  ctx.font = `500 16px ${MONO}`; ctx.fillStyle = LAITON;
  ctx.fillText(`ÉBAUCHE DU SOCLE · à dessiner dans plans/${P.lot || lot}.js (EPISODE.md, ${P.id})${infos.statut ? ` · ${infos.statut}` : ''}`, X0, 268);
  ctx.fillStyle = FILET; ctx.fillRect(X0, 284, LARGEUR, 3);
  ctx.fillStyle = LAITON; ctx.fillRect(X0, 284, LARGEUR * k, 3);
  let y = 322;
  if (infos.erreur) { ctx.font = `18px ${MONO}`; ctx.fillStyle = ROUGE_TXT; ctx.fillText(String(infos.erreur).slice(0, 120), X0, y); y += 30; }

  // l'indication du script que le plan réalise (une consigne de mise en scène : jamais dite)
  if (P.script) {
    ctx.font = `500 15px ${MONO}`; ctx.fillStyle = GRIS; ctx.fillText('LE SCRIPT', X0, y); y += 26;
    ctx.font = `18px ${MONO}`; ctx.fillStyle = CRAIE; ctx.globalAlpha = .85;
    for (const l of coupe(ctx, P.script, LARGEUR).slice(0, 4)) { ctx.fillText(l, X0, y); y += 25; }
    ctx.globalAlpha = 1; y += 14;
  }

  // ses répliques : passées en gris, celle qu'on dit en craie, à venir en gris figé
  const R = REPLIQUES.filter(r => r.plan === P.id);
  const [zt, lh, gap] = tailles(R, y);
  for (const r of R) {
    const ici = t >= r.de && t < r.a, passe = t >= r.a;
    ctx.globalAlpha = ici ? 1 : passe ? .55 : .4;
    ctx.fillStyle = ici ? LABO : GRIS; ctx.font = `500 ${Math.min(16, zt - 2)}px ${MONO}`;
    const vitesse = r.cps_fin ? ` · s’écrit de ${s1(r.cps)} à ${s1(r.cps_fin)} car./s (la voix accélère)` : r.cps ? ` · ${s1(r.cps)} car./s (${r.cps > PAROLE ? 'minutée' : 'lue'})` : '';
    ctx.fillText(`${r.id} · ${s1(r.de)} → ${s1(r.a)} s · dite ${s1(r.dite)} s${vitesse}`, X0, y + 4);
    ctx.font = `${zt}px ${MONO}`;
    const lignes = balise(r.txt, ici ? CRAIE : GRIS_FIG);
    ecrit(ctx, lignes, X0, y + 26 + zt * .4, lh);
    y += 26 + lignes.length * lh + gap;
    if (r.attente) { ctx.font = `${zt - 2}px ${MONO}`; ctx.fillStyle = GRIS; ctx.fillText(r.attente, X0, y - gap + 2); y += lh; }
  }
  if (!R.length) { ctx.globalAlpha = .55; ctx.font = `20px ${MONO}`; ctx.fillStyle = GRIS; ctx.fillText('(pas de réplique : un plan sans voix)', X0, y + 12); }
  ctx.globalAlpha = 1;

  // quelques bonshommes du film de 3 min 20, qui lèvent parfois les yeux vers Phi (pas la nuit : Phi y est seul)
  const phi = { x: OEIL.x, y: OEIL.y };
  if (!n) for (const s of fouleDe(P.lot || lot)) dessineSujet(ctx, s.f, s.x, s.y, 4, { col: GRIS_FIG, a: .85, phi, cible: phi, reflet: true }, t);
  // Phi
  oeil(ctx, t, { ...OEIL, humeur: humeur(t, []), regard: regardDe(P.lot || lot), alpha: seg(t, P.de, P.de + .3) });
}
