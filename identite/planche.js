/* Planche d'identité : construit les pistes de logo, les expressions et les
   répliques, puis laisse marques.js dessiner. Contenu seulement, aucune logique. */
(function () {
  const PISTES = [
    { id: 'objectif', lettre: 'A', nom: 'L’objectif',
      intention: 'Le Φ devient l’œil d’un instrument : un diaphragme à six lames, comme les six chambres du barillet. Quelqu’un regarde, mais c’est un appareil de mesure, pas un juge. Au centre, la pupille bleue : la lumière du narrateur.',
      pour: 'dit tout de suite « une IA observe » ; élégant, technique, très net à l’écran.',
      contre: 'proche des icônes d’appareil photo ; peut sonner « surveillance » si on le pousse trop.',
      ecran: { img: 'img/bebe.png', sur: 'Épisode 1', titre: 'Le barillet' } },
    { id: 'barillet', lettre: 'B', nom: 'Le barillet',
      intention: 'Les six chambres du premier acte logées dans le Φ ; une seule est en laiton : c’est la vôtre. Le symbole se décline pour chaque histoire : l’anneau de la lettre du test, puis les deux pilules (ou les deux pontons) qui ouvrent le Φ en deux.',
      pour: 'raconte le jeu en une image ; un fil commun entre les trois histoires ; le laiton du joueur est au cœur du logo.',
      contre: 'à 16 pixels on passe à un dessin simplifié ; le barillet rappelle l’arme pour qui connaît l’histoire.',
      actes: true,
      ecran: { img: 'img/lac.png', sur: 'Épisode 3', titre: 'Les deux pilules' } },
    { id: 'craie', lettre: 'C', nom: 'La craie',
      intention: 'Le Φ tracé à la main, comme le narrateur dessine le barillet sur l’image figée du film. Un point de laiton : le joueur. Chaleureux et vivant, du côté du cours de philosophie plutôt que du laboratoire.',
      pour: 'la plus humaine ; se raccorde directement aux arrêts sur image du film ; s’anime en se dessinant.',
      contre: 'moins nette en petit (on passe à un trait plein) ; la matière craie est à refaire à chaque support.',
      ecran: { img: 'img/chambre.png', sur: 'Épisode 1', titre: 'Le barillet', craie: true } },
    { id: 'antenne', lettre: 'D', nom: 'L’antenne',
      intention: 'XΦ : deux signes de même graisse, rien d’autre. Fait pour le coin de l’écran, les génériques, l’onglet du navigateur et l’icône du téléphone. Se lit « X-phi », comme on dit en recherche.',
      pour: 'robuste à toutes les tailles ; s’imprime en une couleur ; tient en signature au coin d’une image peinte.',
      contre: 'froide seule ; le Φ grec n’est pas lu par tout le monde (« Xo », « X-fi » ?).',
      ecran: { img: 'img/alice.png', sur: 'Épisode 3', titre: 'Les deux pilules', bug: true } },
  ];

  const root = document.getElementById('pistes');
  PISTES.forEach((p) => {
    const s = document.createElement('article');
    s.className = 'piste';
    s.id = 'piste-' + p.id;
    const actes = p.actes ? `
      <div class="tuile actes sombre">
        <span class="etiquette">Une lettre, trois histoires</span>
        <div class="trio">
          <figure><span data-logo="barillet" data-form="symbole" data-acte="1"></span><figcaption>Le barillet</figcaption></figure>
          <figure><span data-logo="barillet" data-form="symbole" data-acte="2"></span><figcaption>La conception</figcaption></figure>
          <figure><span data-logo="barillet" data-form="symbole" data-acte="3"></span><figcaption>Les deux pilules</figcaption></figure>
        </div>
      </div>` : '';
    const e = p.ecran;
    const habillage = `
      <figure class="seize ${p.id}">
        <img src="${e.img}" alt="">
        <div class="voile"></div>
        ${e.bug ? `
          <div class="bug"><span data-logo="antenne"></span></div>
          <div class="strap"><b>Xphi</b><span>Expériences de pensée</span><i>${e.sur} · ${e.titre}</i></div>` : `
          <div class="titre">
            <span class="logo" data-logo="${p.id}"></span>
            <span class="st">Expériences de pensée</span>
            <span class="ep">${e.sur} · ${e.titre}</span>
          </div>`}
        <figcaption>Habillage 16:9 · ${e.bug ? 'signature d’antenne au coin, bandeau de titre' : 'carton de titre'}</figcaption>
      </figure>`;
    s.innerHTML = `
      <header>
        <span class="lettre">${p.lettre}</span>
        <div>
          <h3>${p.nom}</h3>
          <p>${p.intention}</p>
          <p class="pc"><span>Pour</span> ${p.pour}<br><span>Contre</span> ${p.contre}</p>
        </div>
      </header>
      <div class="tuiles">
        <div class="tuile grand sombre"><span class="logo" data-logo="${p.id}"></span><span class="base">Expériences de pensée</span></div>
        <div class="tuile grand clair"><span class="logo" data-logo="${p.id}"></span><span class="base">Expériences de pensée</span></div>
        <div class="tuile petits sombre">
          <span class="etiquette">Petites tailles</span>
          <div class="tailles">
            ${[64, 32, 16].map((z) => `<span class="t" style="width:${z}px"><span data-logo="${p.id}" data-form="symbole" ${z < 40 ? 'data-small' : ''}></span></span>`).join('')}
            <span class="appli"><span data-logo="${p.id}" data-form="symbole" data-small></span></span>
          </div>
          <div class="tailles clair">
            ${[64, 32, 16].map((z) => `<span class="t" style="width:${z}px"><span data-logo="${p.id}" data-form="symbole" ${z < 40 ? 'data-small' : ''}></span></span>`).join('')}
            <span class="onglet"><span class="fav" data-logo="${p.id}" data-form="symbole" data-small></span>Xphi — ${e.titre}<i>×</i></span>
          </div>
        </div>
        ${actes}
      </div>
      ${habillage}`;
    root.append(s);
  });

  // Expressions : trois variantes × quatre humeurs
  document.querySelectorAll('.ex-ligne').forEach((row) => {
    ['neutre', 'curieux', 'malicieux', 'emu'].forEach((x) => {
      const c = document.createElement('span');
      c.className = 'ex';
      c.innerHTML = `<span data-phi="${row.dataset.var}" data-expr="${x}"></span>`;
      row.append(c);
    });
  });

  // Dix répliques d'exemple
  const R = [
    ['Accueil', 'neutre', 'Bonjour. Je suis Phi. J’étudie les humains, avec beaucoup d’affection et un carnet.'],
    ['Accueil', 'curieux', 'Je vais vous raconter trois histoires. Il n’y a pas de bonne réponse, seulement les vôtres, et elles m’intéressent toutes.'],
    ['Consentement', 'neutre', 'Une précision avant de commencer : je suis un personnage. Derrière moi, il y a une équipe de télévision et des philosophes, qui ont écrit ce que je dis.'],
    ['Consentement', 'neutre', 'Si vous êtes d’accord, vos choix seront enregistrés sans votre nom, pour être comparés à ceux des autres dans une émission, puis confiés à la recherche. Vous pouvez arrêter quand vous voulez. Sans votre accord, vous jouez quand même : je ne note rien.'],
    ['Avant un choix', 'curieux', 'Prenez votre temps. Je ne regarde pas. Enfin, un peu : c’est mon métier.'],
    ['Avant un choix', 'malicieux', 'Même question, une chambre de moins. Rien d’autre n’a changé. Je le précise, c’est tout.'],
    ['Après un choix', 'neutre', 'Noté. Je n’ai pas d’avis là-dessus ; j’ai seulement un crayon.'],
    ['Après un choix', 'malicieux', 'Gardez ce chiffre en tête. Une autre histoire vous posera bientôt la même question, avec d’autres mots.'],
    ['Résultats', 'curieux', 'Voici ce qu’ont répondu les autres. Ce n’est pas un classement, c’est une carte. Vous êtes le point doré.'],
    ['Fin', 'emu', 'Vous avez dit deux choses qui ne vont pas tout à fait ensemble, et vous les pensez toutes les deux. C’est ce que je préfère chez les humains. Merci.'],
  ];
  const box = document.getElementById('repliques');
  R.forEach(([ctx, expr, txt], i) => {
    const d = document.createElement('div');
    d.className = 'replique';
    d.innerHTML = `<span class="ph" data-phi="trait" data-expr="${expr}" data-small></span>
      <div><span class="etiquette">${String(i + 1).padStart(2, '0')} · ${ctx}</span><p>${txt.replace('point doré', '<span class="joueur">point doré</span>')}</p></div>`;
    box.append(d);
  });

  window.Xphi.mount();
})();
