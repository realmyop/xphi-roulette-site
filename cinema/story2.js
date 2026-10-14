/* ==========================================================================
   Acte 2 — « La conception » : le montage.
   Même grammaire que l'Acte 1 (condition de l'expérience) : des plans peints,
   puis l'arrêt sur image où le narrateur dessine le même barillet à la craie,
   avec les mêmes crans et les mêmes mots pour le risque. Le joueur décide pour
   le couple : concevoir ou renoncer. Pas de variante ici.
   Textes : ../i18n/fr.json (useTextes, en bas du fichier).
   ========================================================================== */
import { seg, ease, inOut } from '../film/engine.js';
import { CRANS } from '../film/crans.js';

let TXT; // les répliques : ../i18n/fr.json (voir textes.js et useTextes)

export const CHOICES2 = [
  { v: 'concevoir', label: 'Concevoir' },
  { v: 'renoncer', label: 'Renoncer' },
];
const END = [{ v: 'rejouer', label: 'Revoir le film' }];

const say = (text, t, t0, t1, expr = 'neutre') => ({
  text, expr, k: inOut(t, t0, t1), talk: t >= t0 && t < t0 + 0.3 + text.length / 16,
});

export function buildStory2(ctx, SC) {
  const shotOf = (scene, name) => {
    const sc = SC[scene];
    const sh = sc?.shots?.[name];
    if (sh) return sh;
    const home = sc?.home || { x: 960, y: 540, z: 1 };
    return { dur: 5, cam: () => home, p: () => ({}) };
  };
  const play = (scene, name, t) => {
    const sh = shotOf(scene, name);
    const tt = Math.max(0, Math.min(sh.dur, t));
    return { scene, cam: sh.cam(tt, ctx.portrait), p: sh.p(tt) };
  };
  const dur = (scene, name) => shotOf(scene, name).dur;
  const dissolve = (t, d = 0.9) => ({ view2: ctx.last?.view, mix: 1 - seg(t, 0, d) });
  const frozenView = () => play('a2-seuil', 'seuil', dur('a2-seuil', 'seuil'));
  const chalkRot = (T) => 6 * Math.sin(T * 0.21);
  // Le pilote automatique parle le langage de l'Acte 1 : on traduit
  const accepte = (v) => v === 'concevoir' || v === 'tirer';

  const base = () => ({
    view: null, view2: null, mix: 0, freeze: null, chalk: null, fade: 0, title: 0,
    sub: null, choices: null, choicesK: 0, picked: null, end: false, note: null,
  });

  // Un plan simple : un décor, une réplique, un fondu enchaîné éventuel
  const plan = (scene, shot, text, next, opts = {}) => ({
    dur: dur(scene, shot), next, scene,
    frame: (t) => ({
      ...base(),
      view: play(scene, shot, t),
      ...(opts.dissolve ? dissolve(t, opts.dissolve) : {}),
      ...(opts.fadeIn ? { fade: 1 - seg(t, 0, opts.fadeIn) } : {}),
      ...(opts.fadeOut ? { fade: seg(t, dur(scene, shot) - opts.fadeOut, dur(scene, shot), ease.inOut) } : {}),
      sub: say(text, t, opts.t0 ?? 0.5, dur(scene, shot) - (opts.fadeOut ? 0.8 : 0)),
    }),
  });

  const S = {};
  S.intro = { dur: 3.8, next: 'dehors', scene: null, frame: (t) => ({ ...base(), sub: say(TXT.intro, t, 0.5, 3.8) }) };
  S.dehors = plan('a2-dehors', 'ouverture', TXT.dehors, 'cuisine', { fadeIn: 1.6, t0: 0.8 });
  S.cuisine = plan('a2-cuisine', 'large', TXT.cuisine, 'mains', { dissolve: 1.2 });
  S.mains = plan('a2-mains', 'mains', TXT.mains, 'lettre', { dissolve: 0.7 });
  S.lettre = plan('a2-lettre', 'lettre', TXT.lettre, 'couple');
  S.couple = plan('a2-couple', 'fenetre', TXT.couple, 'seuil', { t0: 0.4 });
  S.seuil = plan('a2-seuil', 'seuil', TXT.seuil, 'arret');

  // Arrêt sur image : le même barillet qu'à l'Acte 1
  S.arret = {
    dur: 3.4, next: 'choix', scene: 'a2-seuil',
    enter: (c) => { c.freezeT = c.T; c.cran = 1; },
    frame: (t, c, T) => ({
      ...base(),
      freeze: { key: 'a2-seuil', view: frozenView(), T: ctx.freezeT, k: seg(t, 0, 1.4) },
      chalk: { appear: seg(t, 1.0, 3.0, ease.lin), n: 1000, rot: chalkRot(T), risk: seg(t, 2.6, 3.4, ease.lin) },
      sub: say(TXT.arret, t, 0.3, 3.4, 'malicieux'),
    }),
  };

  S.choix = {
    dur: 1.4, choices: true, scene: 'a2-seuil',
    frame: (t, c, T) => ({
      ...base(),
      freeze: { key: 'a2-seuil', view: frozenView(), T: ctx.freezeT, k: 1 },
      chalk: { appear: 1, n: CRANS[ctx.cran - 1].n, rot: chalkRot(T), risk: 1 },
      sub: say(TXT.question, t, 0.3, 1e9, 'curieux'),
      choices: CHOICES2, choicesK: seg(t, 0.8, 1.4, ease.lin), picked: ctx.pick,
    }),
    choose: (v, c) => {
      const oui = accepte(v);
      c.log.push({ cran: c.cran, choix: oui ? 'concevoir' : 'renoncer' });
      if (oui) {
        c.accepted = c.cran;
        return c.cran < 4 ? 'change' : 'reprise';
      }
      c.refusedAt = c.cran;
      return 'reprise';
    },
  };

  S.change = {
    dur: 3.4, next: 'choix', scene: 'a2-seuil',
    enter: (c) => { c.morphFrom = CRANS[c.cran - 1].n; c.cran += 1; },
    frame: (t, c, T) => ({
      ...base(),
      freeze: { key: 'a2-seuil', view: frozenView(), T: ctx.freezeT, k: 1 },
      chalk: { appear: 1, n: ctx.morphFrom, to: CRANS[ctx.cran - 1].n, k: seg(t, 0.5, 2.8, ease.lin), rot: chalkRot(T), risk: 1 },
      sub: say(TXT.change, t, 0.3, 3.4, 'malicieux'),
    }),
  };

  S.reprise = {
    dur: 2.8, scene: 'a2-seuil',
    next: (c) => (c.refusedAt === 1 ? 'renonce' : 'naissance'),
    enter: (c) => { if (c.refusedAt !== 1) c.final = CRANS[c.accepted - 1]; },
    frame: (t, c, T) => {
      const refus = ctx.refusedAt === 1;
      const txt = refus ? TXT.reprise : (ctx.refusedAt > 1 ? TXT.reprend : TXT.garde)(ctx.final);
      return {
        ...base(),
        freeze: { key: 'a2-seuil', view: frozenView(), T: ctx.freezeT, k: 1 - seg(t, 1.0, 2.8) },
        chalk: { appear: 1 - seg(t, 0.6, 1.6, ease.lin), n: refus ? 1000 : ctx.final.n, rot: chalkRot(T), risk: 1 - seg(t, 0, 0.8, ease.lin) },
        sub: say(txt, t, 0.2, 2.8),
      };
    },
  };

  // Fin « concevoir » : le nouveau-né ; fin « renoncer » : la chambre reste vide
  S.naissance = plan('a2-naissance', 'bras', TXT.naissance, 'fin', { dissolve: 1.0 });
  S.fin = plan('a2-naissance', 'fin', TXT.fin, 'titre', { dissolve: 0.8, fadeOut: 2.4 });
  S.renonce = plan('a2-seuil', 'vide', TXT.renonce, 'titre', { dissolve: 1.0, fadeOut: 2.4 });

  S.titre = {
    dur: 2.4, choices: true, scene: null,
    frame: (t) => ({
      ...base(), title: inOut(t, 0.3, 1e9, 1.2),
      choices: END, choicesK: seg(t, 1.6, 2.4, ease.lin), picked: ctx.pick, end: true, note: TXT.note,
    }),
    choose: () => 'intro',
  };

  return S;
}

export const ORDER2 = ['a2-dehors', 'a2-cuisine', 'a2-mains', 'a2-lettre', 'a2-couple', 'a2-seuil', 'a2-naissance'];

// Les textes de l'Acte 2 (répliques et boutons), depuis ../i18n/fr.json
export function useTextes(T) {
  TXT = T.acte2.textes;
  CHOICES2.forEach((c) => { c.label = T.acte2.boutons[c.v]; });
  END.forEach((c) => { c.label = T.commun.revoir; });
}
