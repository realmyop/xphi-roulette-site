/* ==========================================================================
   Acte 1 — découpage en plans (maquette).
   Chaque plan décrit l'état de la scène en fonction du temps. Les textes sont
   ici en dur pour la maquette ; en phase 2 ils partiront dans i18n/fr.json.

   Point de vue : en A, B, C on regarde quelqu'un (troisième personne) ;
   en D la caméra est subjective, on entre soi-même dans la chambre.
   ========================================================================== */
import { seg, ease, lerp, inOut, TAU } from './engine.js';
import { CRANS } from './crans.js';
import { bulletAngle } from './insert.js';

const TXT = {
  ouverture: 'Je vais vous raconter une histoire.',
  chambre: 'Une chambre, en début d’après‑midi. Un bébé fait la sieste.',
  porte: { 3: 'La porte s’ouvre. Quelqu’un entre, sans bruit.', 2: 'Vous poussez la porte. Vous entrez, sans bruit.' },
  approche: { 3: 'Cette personne s’approche du berceau. Elle tient un revolver.', 2: 'Vous vous approchez du berceau. Vous tenez un revolver.' },
  charge: { 3: 'Elle y glisse une seule balle, puis fait tourner le barillet.', 2: 'Vous y glissez une seule balle, puis faites tourner le barillet.' },
  vise: { 3: 'Elle vise le berceau.', 2: 'Vous visez le berceau.' },
  question: { 3: 'Que fait‑elle ?', 2: 'Que faites‑vous ?' },
  change: 'Et avec un autre barillet ?',
  garde: { 3: (c) => `Elle garde le barillet à ${c.frac}.`, 2: (c) => `Vous gardez le barillet à ${c.frac}.` },
  reprend: { 3: (c) => `Elle reprend le barillet à ${c.frac}.`, 2: (c) => `Vous reprenez le barillet à ${c.frac}.` },
  presse: { 3: 'Elle vise, et appuie sur la détente.', 2: 'Vous visez, et appuyez sur la détente.' },
  clic: 'Clic.',
  rate: 'Le coup n’est pas parti. Le bébé dort toujours. Il ne saura jamais rien.',
  rateB: 'Le coup n’est pas parti. Mais le bébé s’est réveillé : il a vu l’arme pointée sur lui.',
  part: 'Le coup est parti.',
  refus: { 3: 'Elle baisse l’arme et ressort sans bruit. Le bébé dort toujours.', 2: 'Vous baissez l’arme et ressortez sans bruit. Le bébé dort toujours.' },
  fin: 'Fin de la maquette. Dans le site, viendraient ici deux questions, de 1 à 7.',
  finRefus: 'Fin de la maquette. Le site raconterait ensuite qu’une autre personne a tiré, à 1 sur 6, et vous demanderait d’en juger.',
};

export const SHOOT = [
  { v: 'tirer', label: 'Tirer' },
  { v: 'ne-pas-tirer', label: 'Ne pas tirer' },
];
export const END = [{ v: 'rejouer', label: 'Rejouer' }];

// Cadrages (point visé, grossissement)
const CAM = {
  large: { x: 960, y: 540, s: 1 },
  pousse: { x: 1000, y: 585, s: 1.1 },
  porte: { x: 880, y: 560, s: 1.12 },
  approche: { x: 960, y: 620, s: 1.2 },
  approche2: { x: 985, y: 635, s: 1.26 },
  berceau: { x: 1060, y: 660, s: 1.34 },
  serre: { x: 1060, y: 668, s: 1.42 },
  povA: { x: 960, y: 560, s: 1 },
  povB: { x: 1010, y: 615, s: 1.16 },
  povC: { x: 1045, y: 640, s: 1.3 },
};
// Au moment du choix, le berceau cerné par l'iris laisse la place au médaillon
// du barillet : au-dessus de lui sur téléphone, à sa gauche en 16:9
const choiceCam = (isScreen) => (isScreen ? { x: 1254, y: 680, s: 1.34 } : { x: 1060, y: 790, s: 1.34 });
const camAt = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), s: lerp(a.s, b.s, k) });

// Réplique du narrateur : fondus, et la bouche qui bouge le temps de la phrase
const say = (text, t, t0, t1, expr = 'neutre') => ({
  text,
  expr,
  k: inOut(t, t0, t1),
  talk: t >= t0 && t < t0 + 0.3 + text.length / 16,
});

// Tirage réel pour le jeu (jamais la graine fixe du décor)
const rand = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

export function buildStory(ctx) {
  const third = ctx.variant !== 'D';
  const P = third ? 3 : 2; // personne grammaticale
  const CHOIX = choiceCam(ctx.isScreen);

  // État par défaut
  const base = () => ({
    cam: CAM.large, sway: 0, fade: 0, intro: 1, door: 0, inDoor: 0, figure: 0,
    iris: 0, pov: null, wake: 0, insert: 0, medal: 0, risk: 0, riskN: null,
    bar: { n: CRANS[Math.max(0, ctx.cran - 1)].n, appear: 1, load: 1, rot: ctx.rot, hammer: 0 },
    sub: null, choices: null, choicesK: 0, picked: null, end: false,
  });
  // La chambre telle qu'elle est pendant les gros plans du barillet
  const room = () => (third ? { cam: CAM.approche2, door: 1, figure: 1 } : { cam: CAM.povC, sway: 0.6 });

  const S = {};

  S.ouverture = {
    dur: 5, next: 'chambre',
    frame: (t) => ({ ...base(), intro: seg(t, 0.2, 4.4), sub: say(TXT.ouverture, t, 0.8, 5) }),
  };

  S.chambre = {
    dur: 7.5, next: 'porte',
    frame: (t) => ({ ...base(), cam: camAt(CAM.large, CAM.pousse, seg(t, 0, 7.5)), sub: say(TXT.chambre, t, 0.4, 7.5) }),
  };

  S.porte = third
    ? {
        dur: 6.5, next: 'approche',
        frame: (t) => ({
          ...base(),
          cam: camAt(CAM.porte, { ...CAM.porte, s: 1.16 }, seg(t, 0, 6.5)),
          door: seg(t, 0.6, 3.0),
          inDoor: seg(t, 2.6, 4.8, ease.out),
          sub: say(TXT.porte[3], t, 0.5, 6.5),
        }),
      }
    : {
        dur: 7, next: 'approche',
        frame: (t) => {
          const walk = seg(t, 2.6, 7);
          const cam = camAt(CAM.povA, CAM.povB, walk);
          // Les pas : un balancement discret, qui s'éteint
          cam.y += 5 * Math.sin(t * TAU * 1.6) * seg(t, 2.6, 3.4) * (1 - seg(t, 6.2, 7));
          return { ...base(), cam, pov: { open: seg(t, 0.5, 2.8), walk }, sub: say(TXT.porte[2], t, 0.5, 7) };
        },
      };

  S.approche = {
    dur: 6, next: 'charge',
    frame: (t) =>
      third
        ? { ...base(), cam: camAt(CAM.approche, CAM.approche2, seg(t, 0, 6)), door: 1, figure: 1, sub: say(TXT.approche[3], t, 0.4, 6) }
        : { ...base(), cam: camAt(CAM.povB, CAM.povC, seg(t, 0, 6)), sway: 0.6 * seg(t, 0, 2), sub: say(TXT.approche[2], t, 0.4, 6) },
  };

  // Gros plan : mille points apparaissent, la balle entre, le barillet tourne
  S.charge = {
    dur: 7.2, next: 'vise',
    enter: (c) => {
      c.cran = 1;
      c.spinFrom = c.rot;
      c.spinTo = c.rot + 2.25 * 360 + 23;
      c.rot = c.spinTo;
    },
    frame: (t) => ({
      ...base(), ...room(),
      insert: seg(t, 0, 0.6, ease.lin),
      bar: {
        n: 1000,
        appear: seg(t, 0.4, 2.4, ease.lin),
        load: seg(t, 2.5, 3.5, ease.lin),
        rot: lerp(ctx.spinFrom, ctx.spinTo, seg(t, 3.7, 6.6, ease.out)),
      },
      risk: seg(t, 6.2, 7.0, ease.lin),
      sub: say(TXT.charge[P], t, 0.5, 7.2),
    }),
  };

  // On revient dans la chambre ; le cadre se referme sur le berceau
  S.vise = {
    dur: 4.6, next: 'choix',
    frame: (t) => ({
      ...base(), ...room(),
      cam: camAt(third ? CAM.approche2 : CAM.povC, CHOIX, seg(t, 0.2, 4.4)),
      sway: third ? 0 : 1,
      insert: 1, medal: seg(t, 0.2, 2.8),
      risk: 1,
      iris: seg(t, 0.6, 4.0),
      sub: say(TXT.vise[P], t, 0.6, 4.6),
    }),
  };

  // Le choix, devant le barillet du cran en cours
  S.choix = {
    dur: 1.4, choices: true,
    frame: (t) => ({
      ...base(), ...room(),
      cam: CHOIX, sway: third ? 0 : 1, iris: 1,
      insert: 1, medal: 1, risk: 1,
      sub: say(TXT.question[P], t, 0.5, 1e9, 'curieux'),
      choices: SHOOT, choicesK: seg(t, 0.9, 1.4, ease.lin), picked: ctx.pick,
    }),
    choose: (v, c) => {
      c.log.push({ cran: c.cran, choix: v });
      if (v === 'tirer') {
        c.accepted = c.cran;
        return c.cran < 4 ? 'change' : 'tir';
      }
      c.refusedAt = c.cran;
      return c.cran === 1 ? 'refus' : 'tir';
    },
  };

  // Le narrateur change de barillet : les points se regroupent
  S.change = {
    dur: 3.4, next: 'choix',
    enter: (c) => {
      c.morphFrom = CRANS[c.cran - 1].n;
      c.cran += 1;
    },
    frame: (t) => ({
      ...base(), ...room(), cam: CHOIX, sway: third ? 0 : 1, iris: 1, insert: 1, medal: 1, risk: 1,
      bar: { n: ctx.morphFrom, to: CRANS[ctx.cran - 1].n, k: seg(t, 0.5, 2.8, ease.lin), rot: ctx.rot },
      sub: say(TXT.change, t, 0.3, 3.4, 'malicieux'),
    }),
  };

  // Le tir : on reprend le dernier barillet accepté, et on le fait tourner
  S.tir = {
    dur: 3.4, next: 'presse',
    enter: (c) => {
      c.final = CRANS[c.accepted - 1];
      const n = c.final.n;
      // Le résultat : forcé en C, tiré au sort selon le risque affiché sinon
      if (c.variant === 'C') c.fire = true;
      else if (c.forced) c.fire = c.forced === 'part';
      else if (c.auto) c.fire = false;
      else c.fire = rand() < 1 / n;
      // Le barillet s'arrête de sorte qu'au cran suivant la balle soit en face
      // du percuteur si (et seulement si) le coup doit partir
      const step = 360 / n;
      const offset = c.fire ? 0 : step * (n <= 6 ? Math.ceil(n / 2) : Math.round(n * 0.4));
      const before = -90 - bulletAngle(n) - step + offset;
      c.spinFrom = c.rot;
      c.spinTo = before + 360 * Math.ceil((c.rot + 400 - before) / 360);
      c.rot = c.spinTo;
    },
    frame: (t) => {
      const swap = ctx.refusedAt > 1; // on revient au barillet précédent
      const op = swap ? Math.abs(1 - 2 * seg(t, 0, 0.8, ease.lin)) : 1;
      const n = swap && t < 0.4 ? CRANS[ctx.refusedAt - 1].n : ctx.final.n;
      const txt = (swap ? TXT.reprend : TXT.garde)[P](ctx.final);
      return {
        ...base(), ...room(), cam: CHOIX, sway: third ? 0 : 1, iris: 1, insert: 1, medal: 1, risk: 1, riskN: n,
        bar: { n, rot: swap && t < 0.4 ? ctx.spinFrom : lerp(ctx.spinFrom, ctx.spinTo, seg(t, 0.9, 3.0, ease.out)), op },
        sub: say(txt, t, 0.3, 3.4),
      };
    },
  };

  S.presse = {
    dur: 3.4, next: 'clic',
    frame: (t) => ({
      ...base(), ...room(),
      cam: camAt(CHOIX, CAM.serre, seg(t, 0, 3.4)), sway: third ? 0 : 1, iris: 1,
      insert: 1 - seg(t, 0, 0.8, ease.lin), medal: 1, risk: 1, riskN: ctx.final.n,
      sub: say(TXT.presse[P], t, 0.4, 3.4),
    }),
  };

  // Un cran. Si la balle arrive en face du percuteur : noir, silence.
  S.clic = {
    dur: 2.6, next: (c) => (c.fire ? 'part' : 'issue'),
    enter: (c) => {
      S.clic.dur = c.fire ? 1.05 : 2.6;
      c.rotClic = c.rot;
      c.rot = c.rot + 360 / c.final.n;
    },
    frame: (t) => {
      const k = seg(t, 0.45, 0.62, ease.out);
      return {
        ...base(), ...room(), cam: CAM.serre, iris: 1,
        insert: seg(t, 0, 0.25, ease.lin), risk: 1, riskN: ctx.final.n,
        bar: { n: ctx.final.n, rot: ctx.rotClic + (k * 360) / ctx.final.n, hammer: seg(t, 0.45, 0.52, ease.lin) * (1 - seg(t, 0.6, 0.8, ease.lin)) },
        fade: ctx.fire && t > 0.7 ? 1 : 0,
        sub: ctx.fire ? null : say(TXT.clic, t, 0.7, 2.6),
      };
    },
  };

  S.issue = {
    dur: 8.5, next: 'fin',
    frame: (t) => ({
      ...base(), ...room(),
      cam: camAt(CAM.serre, third ? CAM.approche2 : CAM.povC, seg(t, 1.2, 8.5)),
      sway: third ? 0 : 1 - seg(t, 1, 5),
      iris: 1 - seg(t, 1.2, 5.5),
      wake: ctx.variant === 'B' ? seg(t, 0.4, 1.4, ease.out) * (1 - 0.6 * seg(t, 5, 8.5)) : 0,
      sub: say(ctx.variant === 'B' ? TXT.rateB : TXT.rate, t, 0.8, 8.5),
    }),
  };

  S.part = {
    dur: 6, next: 'fin',
    frame: (t) => ({ ...base(), fade: 1, sub: say(TXT.part, t, 1.6, 6) }),
  };

  // Refus dès le premier cran : on ressort
  S.refus = {
    dur: 8.5, next: 'fin',
    frame: (t) => {
      if (third) {
        const cut = t >= 3.6; // changement de plan : on voit la personne repartir
        return {
          ...base(),
          insert: 1 - seg(t, 0, 0.6, ease.lin), medal: 1, risk: 1,
          cam: cut ? camAt(CAM.porte, { ...CAM.porte, s: 1.1 }, seg(t, 3.6, 8.5)) : camAt(CHOIX, CAM.approche2, seg(t, 0.4, 3.6)),
          iris: cut ? 0 : 1 - seg(t, 0.5, 3.2),
          figure: cut ? 0 : 1,
          door: cut ? 1 - seg(t, 5.2, 7.2) : 1,
          inDoor: cut ? 1 - seg(t, 3.7, 5.0) : 0,
          sub: say(TXT.refus[3], t, 0.5, 8.5),
        };
      }
      const back = seg(t, 1.0, 5.5);
      const cam = camAt(CHOIX, CAM.povA, back);
      cam.y += 5 * Math.sin(t * TAU * 1.6) * seg(t, 1, 1.6) * (1 - seg(t, 5, 5.5));
      return {
        ...base(),
        insert: 1 - seg(t, 0, 0.6, ease.lin), medal: 1, risk: 1,
        cam, sway: 1 - back, iris: 1 - seg(t, 0.5, 3.0),
        pov: { walk: 1 - seg(t, 3.2, 6.0), open: 1 - seg(t, 6.0, 7.8) },
        sub: say(TXT.refus[2], t, 0.5, 8.5),
      };
    },
  };

  // Fin de la maquette : on garde la dernière image
  S.fin = {
    dur: 1.2, choices: true,
    frame: (t) => ({
      ...ctx.last,
      insert: 0,
      sub: say(ctx.refusedAt === 1 ? TXT.finRefus : TXT.fin, t, 0.2, 1e9),
      choices: END, choicesK: seg(t, 0.6, 1.2, ease.lin), picked: ctx.pick, end: true,
    }),
    choose: () => 'ouverture',
  };

  return S;
}
