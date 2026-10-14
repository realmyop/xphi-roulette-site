/* ==========================================================================
   Acte 1 — le montage du film.
   Chaque étape choisit un plan d'un décor (scenes/*.js), pose les sous-titres
   du narrateur et, au moment du choix, fige l'image pour dessiner le barillet
   à la craie. Les textes sont provisoires : en phase 2 ils partiront dans
   i18n/fr.json.

   Variantes : A témoin ; B le bébé se réveille ; C le coup part (forcé) ;
   D vue subjective, récit à la deuxième personne.
   ========================================================================== */
import { seg, ease, inOut } from '../film/engine.js';
import { CRANS } from '../film/crans.js';

let TXT; // les répliques : ../i18n/fr.json (voir textes.js et useTextes)

export const SHOOT = [
  { v: 'tirer', label: 'Tirer' },
  { v: 'ne-pas-tirer', label: 'Ne pas tirer' },
];
export const END = [{ v: 'rejouer', label: 'Revoir le film' }];

// Réplique du narrateur : fondus et bouche qui parle le temps de la phrase
const say = (text, t, t0, t1, expr = 'neutre') => ({
  text, expr, k: inOut(t, t0, t1), talk: t >= t0 && t < t0 + 0.3 + text.length / 16,
});

const rand = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

/* SC : les modules de décor chargés ; ctx : état du parcours. */
export function buildStory(ctx, SC) {
  const third = ctx.variant !== 'D';
  const P = third ? 3 : 2;

  // Un plan d'un décor (avec repli si le plan manque)
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
  // Fondu enchaîné depuis la dernière image de l'étape précédente
  const dissolve = (t, d = 0.9) => ({ view2: ctx.last?.view, mix: 1 - seg(t, 0, d) });

  const VISEE = third ? 'vise' : 'vise-pov';
  const frozenView = () => play('visee', VISEE, dur('visee', VISEE));
  const chalkRot = (T) => 6 * Math.sin(T * 0.21);

  const base = () => ({
    view: null, view2: null, mix: 0, freeze: null, chalk: null, fade: 0, title: 0,
    sub: null, choices: null, choicesK: 0, picked: null, end: false, note: null,
  });

  const S = {};

  S.intro = {
    dur: 3.8, next: 'maison', scene: null,
    frame: (t) => ({ ...base(), sub: say(TXT.intro, t, 0.5, 3.8) }),
  };

  S.maison = {
    dur: dur('maison', 'ouverture'), next: 'chambre', scene: 'maison',
    frame: (t) => ({
      ...base(), view: play('maison', 'ouverture', t), fade: 1 - seg(t, 0, 1.6),
      sub: say(TXT.maison, t, 0.8, S.maison.dur),
    }),
  };

  S.chambre = {
    dur: dur('chambre', 'large'), next: 'bebe', scene: 'chambre',
    frame: (t) => ({ ...base(), view: play('chambre', 'large', t), ...dissolve(t, 1.2), sub: say(TXT.chambre, t, 0.5, S.chambre.dur) }),
  };

  S.bebe = {
    dur: dur('bebe', 'sieste'), next: 'porte', scene: 'bebe',
    frame: (t) => ({ ...base(), view: play('bebe', 'sieste', t), ...dissolve(t, 0.7), sub: say(TXT.bebe, t, 0.6, S.bebe.dur) }),
  };

  const PORTE = third ? ['porte', 'entree'] : ['porte-pov', 'entree-pov'];
  S.porte = {
    dur: dur(...PORTE), next: 'personne', scene: PORTE[0],
    frame: (t) => ({ ...base(), view: play(...PORTE, t), sub: say(TXT.porte[P], t, 0.5, S.porte.dur) }),
  };

  const PERS = third ? ['personne', 'approche'] : ['bebe', 'pov'];
  S.personne = {
    dur: dur(...PERS), next: 'barillet', scene: PERS[0],
    frame: (t) => ({ ...base(), view: play(...PERS, t), sub: say(TXT.personne[P], t, 0.4, S.personne.dur) }),
  };

  S.barillet = {
    dur: dur('barillet', 'charge'), next: 'visee', scene: 'barillet',
    frame: (t) => ({ ...base(), view: play('barillet', 'charge', t), sub: say(TXT.barillet[P], t, 0.5, S.barillet.dur) }),
  };

  S.visee = {
    dur: dur('visee', VISEE), next: 'arret', scene: 'visee',
    frame: (t) => ({ ...base(), view: play('visee', VISEE, t), sub: say(TXT.visee[P], t, 0.5, S.visee.dur) }),
  };

  // Arrêt sur image : le narrateur entre dans l'expérience de pensée
  S.arret = {
    dur: 3.4, next: 'choix', scene: 'visee',
    enter: (c) => { c.freezeT = c.T; c.cran = 1; },
    frame: (t, c, T) => ({
      ...base(),
      freeze: { key: 'visee', view: frozenView(), T: ctx.freezeT, k: seg(t, 0, 1.4) },
      chalk: { appear: seg(t, 1.0, 3.0, ease.lin), n: 1000, rot: chalkRot(T), risk: seg(t, 2.6, 3.4, ease.lin) },
      sub: say(TXT.arret, t, 0.3, 3.4, 'malicieux'),
    }),
  };

  S.choix = {
    dur: 1.4, choices: true, scene: 'visee',
    frame: (t, c, T) => ({
      ...base(),
      freeze: { key: 'visee', view: frozenView(), T: ctx.freezeT, k: 1 },
      chalk: { appear: 1, n: CRANS[ctx.cran - 1].n, rot: chalkRot(T), risk: 1 },
      sub: say(TXT.question[P], t, 0.3, 1e9, 'curieux'),
      choices: SHOOT, choicesK: seg(t, 0.8, 1.4, ease.lin), picked: ctx.pick,
    }),
    choose: (v, c) => {
      c.log.push({ cran: c.cran, choix: v });
      if (v === 'tirer') {
        c.accepted = c.cran;
        return c.cran < 4 ? 'change' : 'reprise';
      }
      c.refusedAt = c.cran;
      return 'reprise';
    },
  };

  S.change = {
    dur: 3.4, next: 'choix', scene: 'visee',
    enter: (c) => { c.morphFrom = CRANS[c.cran - 1].n; c.cran += 1; },
    frame: (t, c, T) => ({
      ...base(),
      freeze: { key: 'visee', view: frozenView(), T: ctx.freezeT, k: 1 },
      chalk: { appear: 1, n: ctx.morphFrom, to: CRANS[ctx.cran - 1].n, k: seg(t, 0.5, 2.8, ease.lin), rot: chalkRot(T), risk: 1 },
      sub: say(TXT.change, t, 0.3, 3.4, 'malicieux'),
    }),
  };

  // On relance le film ; le résultat du tir est tiré ici (forcé en C)
  S.reprise = {
    dur: 2.8, scene: 'visee',
    next: (c) => (c.refusedAt === 1 ? 'baisse' : 'detente'),
    enter: (c) => {
      if (c.refusedAt === 1) return;
      c.final = CRANS[c.accepted - 1];
      // forced : 'part' ou 'rate' imposent le résultat ; 'tirage' (ou rien) tire au sort.
      // Le pilote automatique, sans indication, garde le coup qui ne part pas.
      if (c.variant === 'C') c.fire = true;
      else if (c.forced === 'part' || c.forced === 'rate') c.fire = c.forced === 'part';
      else if (c.auto && c.forced !== 'tirage') c.fire = false;
      else c.fire = rand() < 1 / c.final.n;
    },
    frame: (t, c, T) => {
      const refus = ctx.refusedAt === 1;
      const txt = refus ? TXT.reprise : (ctx.refusedAt > 1 ? TXT.reprend : TXT.garde)[P](ctx.final);
      return {
        ...base(),
        freeze: { key: 'visee', view: frozenView(), T: ctx.freezeT, k: 1 - seg(t, 1.0, 2.8) },
        chalk: {
          appear: 1 - seg(t, 0.6, 1.6, ease.lin),
          n: refus ? 1000 : ctx.final.n, rot: chalkRot(T), risk: 1 - seg(t, 0, 0.8, ease.lin),
        },
        sub: say(txt, t, 0.2, 2.8),
      };
    },
  };

  const DETENTE = third ? 'detente' : 'detente-pov';
  S.detente = {
    dur: dur('visee', DETENTE), scene: 'visee',
    next: (c) => (c.fire ? 'part' : 'clic'),
    frame: (t) => ({ ...base(), view: play('visee', DETENTE, t), sub: say(TXT.detente[P], t, 0.3, S.detente.dur) }),
  };

  // Le clic, sur le visage du bébé
  const CLIC = () => (ctx.variant === 'B' ? 'reveil' : 'clic');
  S.clic = {
    dur: 4.5, next: 'sortie', scene: 'bebe',
    enter: (c) => { S.clic.dur = dur('bebe', CLIC()); },
    frame: (t) => ({
      ...base(), view: play('bebe', CLIC(), t),
      sub: t < 1.9 ? say(TXT.clic, t, 0.35, 1.9) : say(ctx.variant === 'B' ? TXT.rateB : TXT.rate, t, 2.0, S.clic.dur),
    }),
  };

  // Le coup part : noir, silence, une phrase
  S.part = {
    dur: 6, next: 'finpart', scene: 'bebe',
    frame: (t) => ({ ...base(), sub: say(TXT.part, t, 1.8, 6) }),
  };

  const BAISSE = third ? 'baisse' : 'baisse-pov';
  S.baisse = {
    dur: dur('visee', BAISSE), next: 'sortie', scene: 'visee',
    frame: (t) => ({ ...base(), view: play('visee', BAISSE, t), sub: say(TXT.baisse[P], t, 0.3, S.baisse.dur) }),
  };

  const SORTIE = third ? 'sortie' : 'sortie-vide';
  S.sortie = {
    dur: dur('porte', SORTIE), next: 'fin', scene: 'porte',
    frame: (t) => ({ ...base(), view: play('porte', SORTIE, t), sub: say(TXT.sortie[P], t, 0.5, S.sortie.dur) }),
  };

  S.fin = {
    dur: dur('bebe', 'fin'), next: 'titre', scene: 'bebe',
    frame: (t) => ({
      ...base(), view: play('bebe', 'fin', t), ...dissolve(t, 1.0),
      fade: seg(t, S.fin.dur - 2.4, S.fin.dur, ease.inOut),
      sub: say(ctx.variant === 'B' ? TXT.finB : TXT.fin, t, 0.6, S.fin.dur - 0.8),
    }),
  };

  // Titre de fin, puis l'écran de fin de la maquette
  S.titre = {
    dur: 2.4, choices: true, scene: 'bebe',
    frame: (t) => ({
      ...base(), title: inOut(t, 0.3, 1e9, 1.2),
      choices: END, choicesK: seg(t, 1.6, 2.4, ease.lin), picked: ctx.pick, end: true,
      note: ctx.refusedAt === 1 ? TXT.noteRefus : TXT.note,
    }),
    choose: () => 'intro',
  };

  S.finpart = {
    dur: 1.2, choices: true, scene: 'bebe',
    frame: (t) => ({
      ...base(), choices: END, choicesK: seg(t, 0.4, 1.2, ease.lin), picked: ctx.pick, end: true, note: TXT.note,
    }),
    choose: () => 'intro',
  };

  return S;
}

// Ordre des décors, pour les charger à l'avance
export const ORDER = (variant) =>
  variant === 'D'
    ? ['maison', 'chambre', 'bebe', 'porte-pov', 'barillet', 'visee', 'porte']
    : ['maison', 'chambre', 'bebe', 'porte', 'personne', 'barillet', 'visee'];

// Les textes de l'Acte 1 (répliques et boutons), depuis ../i18n/fr.json
export function useTextes(T) {
  TXT = T.acte1.textes;
  SHOOT.forEach((c) => { c.label = T.acte1.boutons[c.v]; });
  END.forEach((c) => { c.label = T.commun.revoir; });
}
