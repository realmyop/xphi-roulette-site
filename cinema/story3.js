/* ==========================================================================
   Acte 3 — « Les deux pilules » : le montage.
   D'après le dilemme des pilules bleue et rouge (sondage viral de 2023) et sa
   reprise par Monsieur Phi. Même grammaire que les Actes 1 et 2 : des plans
   peints, l'arrêt sur image où le narrateur dessine à la craie (chalk3.js),
   le choix du joueur.

   Déroulé : le sondage (la paume, deux gélules) → le lac à l'aube, la règle
   rendue concrète (les pontons s'écartent) → la même scène avec Alice sur le
   ponton bleu → la révélation : la règle avait été dite d'une certaine façon,
   tirée au sort pour ce joueur (ctx.formulation, A ou B) ; le narrateur la dit
   autrement, puis demande laquelle choisir pour un milliard de personnes.
   Fin sur le lac. On ne montre JAMAIS l'issue : personne ne meurt à l'image.

   ctx.cran sert de numéro d'étape (1 pilule, 2 ponton, 3 Alice, 4 formulation) :
   le pilote automatique de main.js s'en sert pour savoir quoi répondre.
   Chaque choix est consigné dans ctx.log : { etape, choix, formulation }.
   Textes : ../i18n/fr.json (useTextes, en bas du fichier).
   ========================================================================== */
import { seg, ease, inOut } from '../film/engine.js';


// Les deux façons de dire la même règle (la seule chose qui change entre A et B)
let REGLE; // ../i18n/fr.json

let TXT; // les répliques : ../i18n/fr.json (voir textes.js et useTextes)

export const PILULES = [{ v: 'bleue', label: 'Bleue' }, { v: 'rouge', label: 'Rouge' }];
export const PONTONS = [{ v: 'bleu', label: 'Le bleu' }, { v: 'rouge', label: 'Le rouge' }];
export const FORMULES = [{ v: 'lue', label: 'Celle que j’ai lue' }, { v: 'autre', label: 'L’autre' }];
const END = [{ v: 'rejouer', label: 'Revoir le film' }];

// Le pilote automatique (et ?choix=) peut dire « bleu » ou « bleue » : on comprend les deux
const bleu = (v) => /^bleu/.test(String(v));
const side = (v) => (bleu(v) ? -1 : 1);

const say = (text, t, t0, t1, expr = 'neutre') => ({
  text, expr, k: inOut(t, t0, t1), talk: t >= t0 && t < t0 + 0.3 + text.length / 16,
});

/* Durée de lecture d'une réplique : de quoi la lire tranquillement sur un
   téléphone (moins de 15 caractères par seconde réellement visibles, fondus
   déduits ; la plus longue règle fait 84 caractères). */
const lire = (text) => Math.min(6.8, Math.max(2.6, 1.3 + text.length / 15));

/* Une suite de répliques à partir de t0 : [[texte, début, fin, expr], …] et sa fin. */
function suite(lines, t0 = 0.4) {
  const out = [];
  let t = t0;
  for (const l of lines) {
    const [text, expr] = Array.isArray(l) ? l : [l, 'neutre'];
    const d = lire(text);
    out.push([text, t, t + d, expr]);
    t += d + 0.15;
  }
  return { lines: out, end: t };
}
const subAt = (lines, t) => {
  const l = lines.find(([, , b], i) => t < b || i === lines.length - 1);
  return l ? say(l[0], t, l[1], l[2], l[3]) : null;
};

/* SC : les modules de décor chargés ; ctx : état du parcours (ctx.formulation : 'A' | 'B'). */
export function buildStory3(ctx, SC) {
  const F = ctx.formulation === 'B' ? 'B' : 'A';
  const AUTRE = F === 'A' ? 'B' : 'A';

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
  // Fondu enchaîné depuis la dernière image de l'étape précédente (plan ou image figée)
  const dissolve = (t, d = 0.9) => ({ view2: ctx.last?.view || ctx.last?.freeze?.view || null, mix: 1 - seg(t, 0, d) });

  // Les trois images figées : la fin de la paume, la fin de l'écart, la fin d'Alice
  const FIG = {
    pilules: { key: 'a3-pilules', view: () => play('a3-pilules', 'paume', dur('a3-pilules', 'paume')), T: () => ctx.freezePT },
    lac: { key: 'a3-lac', view: () => play('a3-lac', 'ecart', dur('a3-lac', 'ecart')), T: () => ctx.freezeLT },
    alice: { key: 'a3-alice', view: () => play('a3-alice', 'alice', dur('a3-alice', 'alice')), T: () => ctx.freezeAT },
  };
  const fig = (f, k) => ({ key: f.key, view: f.view(), T: f.T(), k });
  // Les pilules : la frontière bleu/rouge hésite lentement autour de la moitié
  const sway = (T) => 50 + 17 * Math.sin(T * 0.45);

  const base = () => ({
    view: null, view2: null, mix: 0, freeze: null, chalk3: null, fade: 0, title: 0,
    sub: null, choices: null, choicesK: 0, picked: null, end: false, note: null,
  });

  // Un plan simple : un décor, une ou deux répliques, fondus éventuels
  const plan = (scene, shot, text, next, opts = {}) => {
    const D = dur(scene, shot);
    const t0 = opts.t0 ?? 0.5, t1 = D - (opts.fadeOut ? 0.8 : 0);
    const texts = Array.isArray(text) ? text : [text];
    // Deux répliques : le temps se partage selon leur longueur
    const cut = texts.length > 1 ? t0 + ((t1 - t0) * texts[0].length) / (texts[0].length + texts[1].length) : t1;
    return {
      dur: D, next, scene,
      frame: (t) => ({
        ...base(),
        view: play(scene, shot, t),
        ...(opts.dissolve ? dissolve(t, opts.dissolve) : {}),
        ...(opts.fadeIn ? { fade: 1 - seg(t, 0, opts.fadeIn) } : {}),
        ...(opts.fadeOut ? { fade: seg(t, D - opts.fadeOut, D, ease.inOut) } : {}),
        sub: texts.length > 1 && t >= cut ? say(texts[1], t, cut + 0.1, t1) : say(texts[0], t, t0, texts.length > 1 ? cut : t1),
      }),
    };
  };

  /* Un arrêt sur image : l'image figée s'assombrit, la craie se trace, les
     répliques défilent. chalk(t, T) donne l'état de la craie (sans appear). */
  const arret = (f, lines, next, chalk, opts = {}) => {
    const sq = suite(lines, opts.t0 ?? 1.0);
    return {
      dur: sq.end + 0.2, next, scene: f.key,
      enter: opts.enter,
      frame: (t, c, T) => ({
        ...base(),
        freeze: fig(f, opts.k0 === 1 ? 1 : seg(t, 0, 1.4)),
        ...(opts.fadeIn ? { fade: 1 - seg(t, 0, opts.fadeIn) } : {}),
        chalk3: { appear: opts.drawn ? 1 : seg(t, 0.8, 2.8, ease.lin), ...chalk(t, T) },
        sub: subAt(sq.lines, t),
      }),
    };
  };

  // Le choix : l'image reste figée, la question attend la réponse
  const choix = (f, question, CH, etape, chalk, next) => ({
    dur: 1.4, choices: true, scene: f.key,
    enter: (c) => { c.cran = etape.n; },
    frame: (t, c, T) => ({
      ...base(),
      freeze: fig(f, 1),
      chalk3: { appear: 1, ...chalk(t, T) },
      sub: say(question, t, 0.3, 1e9, 'curieux'),
      choices: CH, choicesK: seg(t, 0.8, 1.4, ease.lin), picked: ctx.pick,
    }),
    choose: (v, c) => {
      const entree = etape.log(v, c);
      c.log.push({ etape: etape.nom, ...entree, formulation: F });
      return next;
    },
  });

  /* Après le choix : le point du joueur glisse vers son côté, puis la craie
     s'efface et l'image repart (ou s'éteint au noir). */
  const reprise = (f, cote, next, chalk, { noir = false } = {}) => ({
    dur: 2.2, next, scene: f.key,
    frame: (t, c, T) => ({
      ...base(),
      freeze: fig(f, noir ? 1 : 1 - seg(t, 1.0, 2.2)),
      chalk3: { appear: 1 - seg(t, 1.0, 1.9, ease.lin), side: cote(), k: seg(t, 0, 0.9), ...chalk(t, T) },
      ...(noir ? { fade: seg(t, 1.1, 2.2, ease.inOut) } : {}),
    }),
  });

  const S = {};
  S.intro = { dur: 3.8, next: 'paume', scene: null, frame: (t) => ({ ...base(), sub: say(TXT.intro, t, 0.5, 3.8) }) };

  // 1. Le sondage : la paume, les deux gélules
  S.paume = plan('a3-pilules', 'paume', TXT.paume, 'pilules', { fadeIn: 1.6, t0: 0.8 });
  const craiePilules = (t, T) => ({ mode: 'pilules', sway: sway(T) });
  S.pilules = arret(FIG.pilules, TXT.pilules, 'choixPilule', craiePilules, {
    enter: (c) => { c.freezePT = c.T; c.cran = 1; },
  });
  S.choixPilule = choix(FIG.pilules, TXT.qPilule, PILULES,
    { n: 1, nom: 'pilule', log: (v, c) => { c.pilule = bleu(v) ? 'bleue' : 'rouge'; return { choix: c.pilule }; } },
    craiePilules, 'reprisePilule');
  S.reprisePilule = reprise(FIG.pilules, () => side(ctx.pilule), 'concret', craiePilules, { noir: true });

  // 2. Le lac : la règle rendue concrète. La phrase de passage se dit au noir
  // (comme l'intro) : le plan d'ouverture garde ses 7 s pour ses deux répliques.
  S.concret = { dur: 2.8, next: 'ouverture', scene: null, frame: (t) => ({ ...base(), sub: say(TXT.concret, t, 0.3, 2.8) }) };
  S.ouverture = plan('a3-lac', 'ouverture', TXT.ouverture, 'ecart', { fadeIn: 1.6, t0: 0.8 });
  S.ecart = plan('a3-lac', 'ecart', TXT.ecart, 'pieds', { dissolve: 1.2, t0: 0.4 });
  S.pieds = plan('a3-pieds', 'pieds', TXT.pieds, 'dessous', { dissolve: 0.7 });
  S.dessous = plan('a3-dessous', 'dessous', TXT.dessous, 'regle', { dissolve: 0.9 });
  const craieLac = () => ({ mode: 'lac' });
  // L'image figée revient sur la fin de l'écart (le dessous a été vu, le lac reste le lieu du choix)
  S.regle = arret(FIG.lac, REGLE[F], 'choixPonton', craieLac, {
    enter: (c) => { c.freezeLT = c.T; c.cran = 2; },
    fadeIn: 0.6,
  });
  S.choixPonton = choix(FIG.lac, TXT.qPonton, PONTONS,
    { n: 2, nom: 'ponton', log: (v, c) => { c.ponton = bleu(v) ? 'bleu' : 'rouge'; return { choix: c.ponton }; } },
    craieLac, 'reprisePonton');
  S.reprisePonton = reprise(FIG.lac, () => side(ctx.ponton), 'alice', craieLac);

  // 3. Alice sur le ponton bleu
  S.alice = plan('a3-alice', 'alice', TXT.alice, 'aliceRegle', { dissolve: 1.2, t0: 0.6 });
  const craieAlice = (t) => ({ mode: 'lac', alice: 1 });
  S.aliceRegle = arret(FIG.alice, [TXT.aliceRegle], 'choixAlice', (t) => ({ mode: 'lac', alice: seg(t, 2.2, 3.2, ease.lin) }), {
    enter: (c) => { c.freezeAT = c.T; c.cran = 3; },
    t0: 0.9,
  });
  S.choixAlice = choix(FIG.alice, TXT.qAlice, PONTONS,
    { n: 3, nom: 'alice', log: (v, c) => { c.alice = bleu(v) ? 'bleu' : 'rouge'; return { choix: c.alice }; } },
    craieAlice, 'repriseAlice');
  S.repriseAlice = reprise(FIG.alice, () => side(ctx.alice), 'revelation', craieAlice, { noir: true });

  // 4. La révélation, sur l'image figée du lac : l'autre façon de dire la même règle.
  // Le point du joueur reste sur le ponton qu'il a choisi au lac (étape 2) :
  // c'est ce choix-là que la formulation a pu orienter.
  const craieRev = () => ({ mode: 'lac', side: side(ctx.ponton), k: 1 });
  S.revelation = arret(FIG.lac, [
    [TXT.derniere, 'malicieux'], TXT.lue, TXT.autrement, ...REGLE[AUTRE], [TXT.meme, 'malicieux'], TXT.phi1, TXT.phi2, TXT.milliard,
  ], 'choixFormulation', craieRev, { k0: 1, fadeIn: 1.0, t0: 0.8 });
  S.choixFormulation = choix(FIG.lac, TXT.qFormulation, FORMULES,
    { n: 4, nom: 'formulation', log: (v) => ({ choix: v === 'autre' ? 'autre' : 'lue', retenue: v === 'autre' ? AUTRE : F }) },
    craieRev, 'repriseFin');
  S.repriseFin = reprise(FIG.lac, () => side(ctx.ponton), 'fin', craieRev);

  // Fin sur le lac : la caméra s'élève, on ne voit pas qui est où
  S.fin = plan('a3-lac', 'fin', TXT.fin, 'titre', { dissolve: 1.2, fadeOut: 2.4, t0: 0.6 });

  S.titre = {
    dur: 2.4, choices: true, scene: null,
    frame: (t) => ({
      ...base(), title: inOut(t, 0.3, 1e9, 1.2),
      choices: END, choicesK: seg(t, 1.6, 2.4, ease.lin), picked: ctx.pick, end: true, note: TXT.note(F),
    }),
    choose: () => 'intro',
  };

  return S;
}

// Ordre des décors (chargement) ; SEQ3 : l'ordre réel où le film les utilise (mémoire)
export const ORDER3 = ['a3-pilules', 'a3-lac', 'a3-pieds', 'a3-dessous', 'a3-alice'];
export const SEQ3 = ['a3-pilules', 'a3-lac', 'a3-pieds', 'a3-dessous', 'a3-lac', 'a3-alice', 'a3-lac'];

// Les textes de l'Acte 3 (répliques, les deux formulations, boutons), depuis ../i18n/fr.json
export function useTextes(T) {
  TXT = T.acte3.textes;
  REGLE = T.acte3.regle;
  PILULES.forEach((c) => { c.label = T.acte3.boutons.pilules[c.v]; });
  PONTONS.forEach((c) => { c.label = T.acte3.boutons.pontons[c.v]; });
  FORMULES.forEach((c) => { c.label = T.acte3.boutons.formulation[c.v]; });
  END.forEach((c) => { c.label = T.commun.revoir; });
}
