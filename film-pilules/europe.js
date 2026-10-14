// Xphi · Les deux pilules, le film : la carte de l'Europe (lot europe, P14–P15).
// FICHIER FABRIQUÉ par tools/carte-europe.cjs : ne pas le retoucher à la main, relancer l'outil.
//
// Source : Natural Earth 1:50m, version 4.1.0, frontières admin-0 (https://www.naturalearthdata.com),
// DOMAINE PUBLIC : « All versions of Natural Earth raster + vector map data found on this website are
// in the public domain. » Prise à la fabrication seulement, en TopoJSON, dans le paquet npm
// world-atlas@2.0.2 (licence ISC, © 2013-2019 Michael Bostock). Aucun appel réseau à l'exécution.
// Les frontières sont celles de Natural Earth (de fait), sans prise de position.
//
// Projection : azimutale équivalente de Lambert centrée sur 52° N, 10° E, ellipsoïde GRS80 (celle
// d'EPSG:3035, sans son décalage d'origine) : les surfaces sont justes, 1 905 km² par case
// (43,6 km de côté). Fenêtre : de 11° O à 25° E et de 35,5° à 59,5° N, le rectangle qui
// l'enferme une fois projetée.
//
// Les DONNÉES PAR PAYS sont FICTIVES (prototype, « à mesurer ») : celles de SCENARIO.md, « Les données ·
// Par pays », vérifiées par l'outil ; leurs sommes tombent sur les vrais totaux (ceux du questionnaire
// de Monsieur Phi). Aucun pays n'est commenté ; l'ordre est celui des effectifs.
//
// ---------------------------------------------------------------------------------------------------
// globalThis.EUROPE (script classique, ou `import './europe.js'` depuis un module, ou require) :
//
//   largeur, hauteur        75 × 65 cases ; une case (x, y) couvre [x, x+1] × [y, y+1] en « unités de
//                           case » (x vers l'est, y vers le sud), son centre est (x + 0,5, y + 0,5)
//   pas, ecran              12 px par case ; ecran = { x, y } : où poser le coin haut gauche dans la
//                           toile (la grille centrée dans la zone x 40–1200, y 30–820) ;
//                           point de la toile = (ecran.x + x · pas, ecran.y + y · pas)
//   case(x, y)              le code du pays de la case (entiers ; 0 = la mer, ou hors de la grille)
//   casesDe(code)           les cases d'un pays, [[x, y], …], rangée par rangée (du nord au sud)
//   pays[code]              { code, lettre, iso, nom, ne, role, cases, fines, centre } ; pays[0] est
//                           la mer. role : 'detail' (les cinq pays de la fenêtre PAYS), 'autre' (les
//                           « autres pays » de l'expérience) ou '' ; ne : le nom dans Natural Earth
//   code(iso)               le code d'un pays par son ISO alpha-2 ('FR', 'LU'…), 0 sinon
//   centroides[code]        [x, y] : le barycentre de sa plus grande terre, ramené dans le pays (pour
//                           un nom, un filet de rappel) ; null s'il n'a pas de case
//   contours[code]          ses anneaux fermés, coupés au cadre : [[x0, y0, x1, y1, …], …] (à remplir ;
//                           pour tracer, préférer traits, qui ne repasse ni le bord du cadre ni deux
//                           fois une frontière)
//   traits                  [{ a, b, pts: [x0, y0, x1, y1, …] }] : chaque côte (b = 0) et chaque
//                           frontière (entre a et b) une seule fois, simplifiées à 0,2 case
//   fin                     la grille fine, 3 × 3 cases par case (4 px) : { facteur, largeur,
//                           hauteur, pas, case(x, y), casesDe(code) }, pour poser les points des
//                           participants au plus près des côtes (fin.case(x, y) en cases fines)
//   projeter(lon, lat)      [x, y] en unités de case, pour placer autre chose sur la carte
//   donnees                 les DONNÉES PAR PAYS (fictives) : ordre (les codes des cinq pays, rangés
//                           par participants, jamais par score) ; parPays[code] = { participants, tropPeu,
//                           collective: { n, bleues, pct }, individuelle: { n, bleues, pct }, ecart,
//                           marge } (pct, ecart et marge au dixième, comme le tableau ; l'écart est celui
//                           des pourcentages affichés ; null si trop peu pour conclure : aucun pour
//                           l'instant) ; autres (les 208, et leur
//                           répartition par code pour poser leurs points) ; total. À l'écran :
//                           pct.toFixed(1).replace('.', ',') + ' %' (« 65,0 % »)
//   lignes                  la grille en texte, une lettre par case (la légende est PAYS ci-dessous)
// ---------------------------------------------------------------------------------------------------
(() => {
  // La grille : une lettre par case (voir PAYS), « . » pour la mer.
  const LIGNES = [
    '.....................................mmmmmmmmmmssssss......WWW.....oooooooo',
    '.....................................mmmmmmmmmmsssssss..........VVVoooooooo',
    '......................................mmmmmmmmmssssssss.......VVVVVoooooooo',
    '......................................mmmmmmmmsssssssss......VVVVVVoooooooo',
    '.....................J................mmmmmmmmssssssss......VVVVVVVoooooooo',
    '.......................JJJ............mmmmm..ssssssss.......V..VVVVoooooooo',
    '......................JJJ.............mmmm...ssssssss..........dddddooooooo',
    '......................JJJJJ............mm.....sssssss.......d..dddddooooooo',
    '.....................JJJJJJ...................sssssss..s...ddd.ddddddoooooo',
    '......................JJJJ.................U..sssssss......ddddddddddQQoQoo',
    '......................JJJ................UUU...ssssss......ddfffffddQQQQQQo',
    '.....................JJJJJ...............UUU....ssss.......ffffffffQQQQQQQo',
    '.................aJJ..JJJJJ..............UUU...sss..........fffffffQQQQQQQQ',
    '..............a.aJJJJ.JJJJJ..............UUU.UU.ss..........fffffffQQQQQQQQ',
    '..............aaaaaJJ...JJJ...............UUUUU............ooofffffQQQQQQQQ',
    '..............aaaaa.....JJJJ..............U...U........E..ooooEfffQQQQQQQQQ',
    '..............aaaaa.....JJJJ..............BB.........EEEEEEEEEEEQQQQQQQQQQQ',
    '..............aaaaa.....JJJJ..............BBB..BB..EEEEEEEEEEEEEQQQQQQQQQQQ',
    '............aaaaaaa...JJJJJJJ.............BBBBBBBBEEEEEEEEEEEEEEEQQQQQQQQQQ',
    '............aaaaaa....JJJJJJJ........IIBBBBBBBBBBBEEEEEEEEEEEEEEEQQQQQQQQQQ',
    '.....................JJJJJJJJJJ.....IIIBBBBBBBBBBBEEEEEEEEEEEEEEQQQQQQQQQww',
    '....................JJJJJJJJJJJ....IIIIBBBBBBBBBBBBEEEEEEEEEEEEEEQwwwwwwwww',
    '......................JJJJJJJJ.....IIIIBBBBBBBBBBBBEEEEEEEEEEEEEEwwwwwwwwww',
    '.....................JJJJJJJJ.....IIIIBBBBBBBBBBBBBEEEEEEEEEEEEEEEwwwwwwwww',
    '...................JJJJJJJJJJJ..FIFFIBBBBBBBBBBBBBBEEEEEEEEEEEEEEEwwwwwwwww',
    '..............................AAFFFFFBBBBBBBBBBBBBBBEEEEEEEEEEEEEEwwwwwwwww',
    '..............................AAAFFFFBBBBBBBBBBBBtttttEEEEEEEEEEEwwwwwwwwww',
    '.............................AAAAAFFFBBBBBBBBBBttttttttttEEEEEEEEwwwwwwwwww',
    '........................AA.AAAAAAAAFFKBBBBBBBBBBttttttttttEEEEqqEwwwwwwwwww',
    '...................AAA..AAAAAAAAAAAAAABBBBBBBBBBtttttttttqqqqqqqwwwwwwwwjjj',
    '...................AAAAAAAAAAAAAAAAAAAAABBBBBBBBBtttttttqqqqqqqqwwwwwwwnnjj',
    '....................AAAAAAAAAAAAAAAAAAAABBBBBBBBBBHHHHHqqqqqqYYYYnnnnnnnnnj',
    '......................AAAAAAAAAAAAAAAAAABBBBBBBBBHHHHHHHqqqYYYYYYnnnnnnnnnn',
    '......................AAAAAAAAAAAAAAAAABBBBBBBBBBHHHHHHYYYYYYYYYnnnnnnnnnnn',
    '.......................AAAAAAAAAAAAAAAAGGGGBBBHHHHHHHHHYYYYYYYYYnnnnnnnnnnn',
    '.......................AAAAAAAAAAAAAAAGGGGGHHHHHHHHHHHHYYYYYYYYnnnnnnnnnnnn',
    '........................AAAAAAAAAAAAAGGGGGGGDDDDHHHHHrrYYYYYYYYnnnnnnnnnnnn',
    '........................AAAAAAAAAAAAAAGGGGGDDDDDDDrrrrTTYYYYppnnnnnnnnnnnnn',
    '........................AAAAAAAAAAAAAAGDDDDDDDDDDDrrrTTTTTTTpppnnnnnnnnnnnn',
    '.......................AAAAAAAAAAAAAAADDDDDDDDDD..rTTTTTTTTTppppnnnnnnnnnnn',
    '..........CC...........AAAAAAAAAAAAAAADDDDDDDDDD..T.TTRRRRRRpppppppnnnnnnSS',
    '........CCCCCCC........AAAAAAAAAAAAAAADDDDDDDDDD.....TRRRRRRppppppSnnnSSSSS',
    '........CCCCCCCCCC.....AAAAAAAAAAAAAAADDD.DDDDDD.....TTRRRRRRppppppSSSSSSSS',
    '........CCCCCCCCCCCCCCAAAAAAAAAAAAAAAAAD....DDDDD.....TTRRRRRpppppppSSSSSSS',
    '........LCCCCCCCCCCCCCCAAAAAAAAA.AAAAA......DDDDDD......TRRRllpcpppSSSSSSSS',
    '........LLLLCCCCCCCCCCCCCAAAAAA.....A........DDDDDD.......RRlllcccpSSSSSSSS',
    '........LLLLCCCCCCCCCCCCCCCCAAA..............DDDDDD.........lNNccgggSSSSSSX',
    '........LLLCCCCCCCCCCCCCCCCCCCC..........AA...DDDDDD.........NNNggggSSXXXXX',
    '.......LLLLCCCCCCCCCCCCCCCCCCC...........AA....DDDDDDDD.......NNggggXXXX..X',
    '.......LLLLCCCCCCCCCCCCCCCCC.............A......DDDDDDD.......NNggXXXX.....',
    '......LLLLCCCCCCCCCCCCCCCC.........................DDDDDDD....NNNXXX.XX....',
    '.....LLLLLCCCCCCCCCCCCCCC...............DDD.........DDDDDDD...NNNXXX.......',
    '......LLLLCCCCCCCCCCCCCC................DDD..........DDDD..D...NXXXXX......',
    '......LLLCCCCCCCCCCCCCC......C...........DD............DD.......XXXXXX.....',
    '......LLLCCCCCCCCCCCCCC......C...........DD............DDD.......XXXXXXX...',
    '......LLCCCCCCCCCCCCCCCC................DDD.............DD........XXXXXX...',
    '......LLCCCCCCCCCCCCCC..................................D..........XXX.X...',
    '..........CCCCCCCCCCCC.................................D..........XXXXX....',
    '..........CCCCCCCCCC.............................DDDDD.............XXX.....',
    '..........CCC...CCC..............................DDDDD..............XX.....',
    '...................................................DDD.....................',
    '..........ii.............OOOOOOOO..OOOOOOuuu.u.......D.....................',
    '..........iii..........OOOOOOOOOOOOOOOOOuuuuu...........................XXX',
    '.........iiiiiiii...OOOOOOOOOOOOOOOOOOOOuuuuu..............................',
    '........iiiiiiiiiiOOOOOOOOOOOOOOOOOOOOOOuuuuu..............................',
  ];

  // lettre, ISO alpha-2, nom, nom dans Natural Earth, rôle, cases, cases fines, centre (en cases)
  const PAYS = [
    ['A', 'FR', "France", "France", 'detail', 291, 2590, [30.38,36.3]],
    ['B', 'DE', "Allemagne", "Germany", 'detail', 186, 1693, [44.2,25.6]],
    ['C', 'ES', "Espagne", "Spain", 'detail', 265, 2372, [17.11,50.25]],
    ['D', 'IT', "Italie", "Italy", 'detail', 161, 1432, [47.82,44.63]],
    ['E', 'PL', "Pologne", "Poland", 'detail', 166, 1490, [58.34,21.95]],
    ['F', 'BE', "Belgique", "Belgium", 'autre', 17, 145, [34.91,26.26]],
    ['G', 'CH', "Suisse", "Switzerland", 'autre', 22, 192, [40.5,36.23]],
    ['H', 'AT', "Autriche", "Austria", 'autre', 44, 396, [50.84,34.2]],
    ['I', 'NL', "Pays-Bas", "Netherlands", 'autre', 19, 179, [36.94,21.94]],
    ['J', 'GB', "Royaume-Uni", "United Kingdom", 'autre', 125, 1137, [25.03,16.97]],
    ['K', 'LU', "Luxembourg", "Luxembourg", 'autre', 1, 12, [37.5,28.5]],
    ['L', 'PT', "Portugal", "Portugal", 'autre', 43, 420, [8.45,50.34]],
    ['M', 'AX', "Åland", "Åland", '', 0, 4, [56.17,1.33]],
    ['N', 'AL', "Albanie", "Albania", '', 16, 139, [63,49.38]],
    ['O', 'DZ', "Algérie", "Algeria", '', 73, 643, [30.6,63.18]],
    ['P', 'AD', "Andorre", "Andorra", '', 0, 2, [27.67,46.17]],
    ['Q', 'BY', "Biélorussie", "Belarus", '', 101, 891, [70.11,15.8]],
    ['R', 'BA', "Bosnie-Herzégovine", "Bosnia and Herz.", '', 28, 247, [57.79,42.46]],
    ['S', 'BG', "Bulgarie", "Bulgaria", '', 47, 444, [71.28,44.07]],
    ['T', 'HR', "Croatie", "Croatia", '', 27, 257, [55.3,39.78]],
    ['U', 'DK', "Danemark", "Denmark", '', 22, 203, [43.5,12.91]],
    ['V', 'EE', "Estonie", "Estonia", '', 26, 219, [64.15,3.73]],
    ['W', 'FI', "Finlande", "Finland", '', 3, 33, [60.5,0.5]],
    ['X', 'GR', "Grèce", "Greece", '', 64, 565, [68.75,53.07]],
    ['Y', 'HU', "Hongrie", "Hungary", '', 48, 443, [59.81,34.56]],
    ['Z', 'IM', "Île de Man", "Isle of Man", '', 0, 2, [22.17,15.17]],
    ['a', 'IE', "Irlande", "Ireland", '', 36, 331, [15.99,16.96]],
    ['b', 'JE', "Jersey", "Jersey", '', 0, 1, [23.5,28.5]],
    ['c', 'XK', "Kosovo", "Kosovo", '', 6, 52, [64.17,45.67]],
    ['d', 'LV', "Lettonie", "Latvia", '', 34, 311, [64.32,8.56]],
    ['e', 'LI', "Liechtenstein", "Liechtenstein", '', 0, 1, [42.83,35.5]],
    ['f', 'LT', "Lituanie", "Lithuania", '', 35, 305, [63.61,12.73]],
    ['g', 'MK', "Macédoine du Nord", "Macedonia", '', 13, 120, [65.96,47.88]],
    ['h', 'MT', "Malte", "Malta", '', 0, 1, [52.83,63.83]],
    ['i', 'MA', "Maroc", "Morocco", '', 23, 208, [12.63,63.63]],
    ['j', 'MD', "Moldavie", "Moldova", '', 6, 58, [73.83,30.17]],
    ['k', 'MC', "Monaco", "Monaco", '', 0, 0, null],
    ['l', 'ME', "Monténégro", "Montenegro", '', 6, 65, [61.17,45.33]],
    ['m', 'NO', "Norvège", "Norway", '', 56, 492, [41.73,3.13]],
    ['n', 'RO', "Roumanie", "Romania", '', 112, 1001, [69.31,36.01]],
    ['o', 'RU', "Russie", "Russia", '', 80, 737, [71.36,4.71]],
    ['p', 'RS', "Serbie", "Serbia", '', 40, 364, [63.45,41.6]],
    ['q', 'SK', "Slovaquie", "Slovakia", '', 26, 227, [59.62,30.54]],
    ['r', 'SI', "Slovénie", "Slovenia", '', 10, 94, [52.1,37.8]],
    ['s', 'SE', "Suède", "Sweden", '', 91, 831, [49.81,6.1]],
    ['t', 'CZ', "Tchéquie", "Czechia", '', 41, 371, [52.38,28.57]],
    ['u', 'TN', "Tunisie", "Tunisia", '', 19, 184, [42.5,63.17]],
    ['v', 'TR', "Turquie", "Turkey", '', 0, 4, [74.83,48.33]],
    ['w', 'UA', "Ukraine", "Ukraine", '', 93, 837, [69.92,25.76]],
  ];

  // La grille fine (3 × 3 par case), une rangée par chaîne : une lettre puis sa répétition.
  const FINES = [
    '.112m28s18.15W.2W12.13o24',
    '.88J.23m28s18.19W10.13o25',
    '.87J2.23m28s21.17W7.15o25',
    '.113m27s22.6M2.8W.2W2.17Vo24',
    '.112m29s22.4M2.22V10o24',
    '.113m3.m24s23.26V10o25',
    '.114m.m25s24.22V13o25',
    '.112m28s26.20V14o25',
    '.112m27s26.20V15o25',
    '.112m.2m23s26.20V16o25',
    '.78J2.32m26s25.21V16o25',
    '.78J2.32m25s27.16V2.2V16o25',
    '.112m26s26.15V3.2V17o24',
    '.64J2.5J2.39m.2m18.m4s25.17V.4V16o24',
    '.62J3.6J8.36m17.2m4s24.18V4.V17o23',
    '.62J3.4J9.35m.m17.4m2s22.19V4.3V2.V13o23',
    '.62J.6J8.36m16.7s23.20V3.7V13o23',
    '.60J.8J7.37m15.8s22.21V2.8Vd5V7o23',
    '.67J7.39m14.9s22.31d8V2d3o23',
    '.63J2.2J7.40m12.10s22.21V.9d15o21',
    '.59J.3J2.J7.42m10.11s22.31d15o21',
    '.63J2.J14.37m7.13s21.23d.8d14o21',
    '.65J.J15.36m5.14s21.8s2.11d4.7d14o21',
    '.66J16.55s21.7s2.12d6.5d15o20',
    '.65J17.56s20.6s3.11d7.4d17o19',
    '.64J17.57s20.6s3.11d8.2d19o18',
    '.63J17.51U2.6s19.6s3.11d29o18',
    '.63J2.2J13.50U3.6s19.7s.12d30o17',
    '.62J2.2J13.50U4.7s18.7s.11d30Q6o2Q4o6',
    '.65J13.51U4.7s18.19d16fd12Q14o5',
    '.65J11.49U7.8s18.s.17d15f3d11Q14o5',
    '.63J14.47U2.2U4.9s18.18d5f17d5Q17o4',
    '.60J2.2J.3J8.48U2.U5.10s15.s.18d3f20d3Q18o4',
    '.61J.2J.2J7.50U.U6.10s15.s.19df23Q19o4',
    '.63J3.J11.45U9.11s14.s.19f24Q19o4',
    '.52a5.6J.J.J12.44U12.7s15.21f24Q21o2',
    '.51a5.J3.7J13.43U11.8s14.22f25Q20o2',
    '.50a5J6.6J13.43U9.10s9.28f23Q22o',
    '.49a5J7.5J15.42U9.7U3s8.29f22Q24',
    '.51a2J9.3J16.42U9.5U.U3.s6.30f21Q25',
    '.42a4.3a2J11.3J16.42U8.5U2.U3.2s5.31f20Q25',
    '.43a8J11.5J4.2J8.42U7.5U7.2s6.30o3fo2f14Q25',
    '.42a10J3aJ6.10J9.43U5.2U3.2U5.2s6.31o7f13Q25',
    '.43a10Ja2J6.9J10.44U4.U4.2U5.35o11f13Q25',
    '.42a15J4.10J10.44U4.U4.2U5.10U2.22o12f14Q24',
    '.40a19J.6Z.4J11.43U4.2U3.4U2.12U.22o12f11Q27',
    '.41a17.7Z.5J12.42U6.7U4.22E5.5o12E3f8Q28',
    '.42a16.14J12.41B2U3.5U2.2U.22E7.5o3E14f6Q28',
    '.44a14.15J12.40B6.5U3.21E10.2E19f2Q32',
    '.43a15.15J12.41B5.14B2.12E33Q33',
    '.42a16.14J13.41B5.11B2.B2.12E33Q33',
    '.41a17.14J13.40B10.6B5.10E36Q33',
    '.41a2.a14.7J.6J14.40B9.5B6.8E39Q32',
    '.39a19.7J2.J2.J15.40B9.3B11.3E42Q31',
    '.37a.a18.8J20.41B24E44Q31',
    '.38a18.8J22.38B26.E43Q31',
    '.36a20.10J21.31B4.2B26E45Q30',
    '.36a19.11J21.31B4.B28E44Q30',
    '.38a17.11J20.25I6.B33E43Q31',
    '.39a9.18J19.2J3.20I8B33E42Q32',
    '.38a6.21J26.18I9B33E42Q32',
    '.63J29.15I11B32E42Q28w2Qw2',
    '.59J34.13I11B33E44Q8w10Q3w10',
    '.59J33.14I11B34E44Q4w26',
    '.60J32.14I10B36E43Q3w27',
    '.64J28.13I11B36E43Q3w27',
    '.65J26.14I12B35E43w30',
    '.66J3.2J19.14I13B36E43w29',
    '.70J18.15I13B37E43w29',
    '.63J4.2J19.14I13B38E44w28',
    '.61J25.15I11B41E45w27',
    '.61J26.13I2.I9B41E45w27',
    '.60J30.10I12B42E44w27',
    '.58J31.8F2I4F4I6B42E44w26',
    '.57J9.4J6.2J9.8F14I3B43E44w26',
    '.55J4.3J3.10J2.6J.7A4F16IB43E43w27',
    '.56J.33A5F15IB41tBEtE41w28',
    '.90A8F12I2B39t2Bt3E39w29',
    '.90A8F13B38t11E36w29',
    '.90A9F13B36t14E33w30',
    '.89A11F13B33t16E3tE29w30',
    '.89A13F11B30t20E2t3E26w31',
    '.86A16F10B30t27EtE23w31',
    '.72A3.8A19F9KB30t31E21w31',
    '.72A3.7A23F5K2B31t31E20w31',
    '.70b.2A4.5A24F4K3B30t32E2qE8q5E3w31',
    '.73A34F3K3B30t30q6E2q12E2w23j4w3',
    '.63A.9A35FAK3B30t29q21w23j9',
    '.57A9.7A40B31t27q22w22nj9',
    '.56A10.7A41B31t26q22w20n4j8',
    '.57A57B32t24q22w21n5j7',
    '.58A61B29t21q19Yq3w20n7j6',
    '.57A64B28t7H5t5q18Y9w16n11j5',
    '.57A64B29t5H11q18Y12w2nwnw3n2w2n13j4',
    '.60A60B30Ht3H12q17Y14n25j3',
    '.61A59B28H18q13Y17n27j2',
    '.63A56B29H18q12Y16n30j',
    '.65A54B28H20q9Y18n31',
    '.66A53B26H22Y2q7Y17n32',
    '.66A53B26H22Y26n32',
    '.68A50B28H21Y25n33',
    '.68A50B28H19Y27n33',
    '.68A50B5G2B17H3B2H18Y27n33',
    '.68A50G10BHB9H25Y27n34',
    '.68A47G14H2B2H31Y27n34',
    '.69A46G13H37Y26n34',
    '.69A45G14eH35Y26n35',
    '.70A43G17H9D3H21rY26n35',
    '.72A40G19HGH3D7H19r2Y26n35',
    '.72A39G22D10H15r7Y23n37',
    '.72A38G23D16H7r8T3Y18n40',
    '.71A39G2AG18D19r13T5Y13p5n39',
    '.71A39GA3G7D2G4DG3D18r12T8Y10p8n38',
    '.72A42G7D2G4D23r11T9Y7Tp10n37',
    '.73A41G6D4G2D24r11T11Y3T4p9n37',
    '.71A44G2D8GD24r10T19p10n36',
    '.71A43D36r9T20p12n34',
    '.70A44D33.4r4Tr3T21p13n32',
    '.70A45D31.4r3T27p13n32',
    '.70A45D28.7T18RT5R3T3p13n29S3',
    '.70A45D28.7T4.2T6R2TR14Tp16np3n20S5',
    '.30C5.35A43D30.7T4.T.T5R20p17n20S6',
    '.26C.2C7.33A44D31.7T2.T.2T5R19p19n18S7',
    '.24C15.30A45D30.10T.2T5R19p19S2n15S8',
    '.24C20.25A46D28.15T5R18p18S3n8S15',
    '.24C23.21A46D29.15T6R18p17S26',
    '.25C24.19A46D29.15T7R18p16S26',
    '.25C31.12A46D10.D19.15T6R17p18S25',
    '.25C33.9A48D7.6D16.16T6R17p17S25',
    '.25C37.4A52D3.8D16.15T7R16p19S23',
    '.25C40A53D3.10D15.16T6R14p21S22',
    '.24C43A50D2.13D16.15T6R12lp21S22',
    '.24CL3C39A30.A18.16D17.15T7R10l3p6c2p10S23',
    '.24L4C41A27.3A15.18D19.16T.T2R8l6p5c3p8S24',
    '.24L4C43A23.10A9.20D18.16T.3TR7l9p2c5p6S24',
    '.24L8CL3C36A21.12A7.21D19.16T.3TR5l11c8p4S24',
    '.24L13C37A4C2A12.15A4.23D18.17T.3TR4l9c10p4S24',
    '.24L13C45A10.42D19.22TR3l9c8p4gS23v',
    '.24L14C44P2A8.35A.6D19.24R2l6N3c8pg5S21X2',
    '.24L14C46A8.35A.4D.2D18.26l5N6c5g9S19X2',
    '.23L13C51A3CA.34A2.8D18.27l3N7c2g11S19X2',
    '.23L12C58.31A4.9D18.27l2N7cg13S8XS7X4',
    '.23L10C59.31A5.10D18.27lN7g14S6X7SX6',
    '.22L12C58.31A5.12D17.27N7g14S3X17',
    '.21L12C59.31A5.13D18.27N5g14X19v',
    '.21L12C58.32A5.14D24.19N6g13X13.6Xv',
    '.21L12C56.34A4.16D23.19N6g10X13.11',
    '.20L13C54.37A3.17D21.20N7g7X14.2X2.8',
    '.19L13C54.38A3.18D20.20N7g7X12.14',
    '.19L13C49.44A2.19D22.17N9g2X15.12v.',
    '.18L14C46.70D23.15N9X10.X7.12',
    '.17L14C46.76D20.12N10X10.X5.14',
    '.16L12C49.48D3.26D21.10N10X10.3X.2X2.6X2.4',
    '.16L13C47.48D4.26D23.9N8X11.4X.15',
    '.15L14C46.45D9.27D22.8N8X11.20',
    '.15L14C45.46D9.30D13.D7.6N7X13.19',
    '.17L13C43.48D9.30D11.4D5.8N4X15.18',
    '.16L14C42.49D9.30D10.8D3.8N3X15.18',
    '.19L9C43.51D7.31D10.8D2.10N2X17.16',
    '.18L10C42.25C2.25D7.35D6.18X.NX19.15',
    '.18L9C43.17C4.5C.25D7.36D5.19X.X16.2X.15',
    '.18L9C43.16C6.30D7.36D5.22X16.X.15',
    '.17L11C42.17C4.31D7.37D6.21X18.14',
    '.17L12C41.18C3.31D7.37D7.21X13.4X4.10',
    '.17L10C43.51D8.38D6.23X15.X4.9',
    '.17L9C45.8C2.40D8.38D6.23X20.9',
    '.17L8C47.49D7.39D7.20X.2X18.X.8',
    '.16L9C46.50D4.43D4.25X6.X.2X8.2X2.6',
    '.15L10C44.53D3.43D3.31X2.6X6.4X.4',
    '.19L6C42.100D3.24X.5X8.X2.3X2.9',
    '.21L2.4C40.99D5.23X2.3X11.5X.9',
    '.28C38.100D4.29X12.14',
    '.29C37.100D3.30X14.12',
    '.30C35.97D6.28X.3X8.2X2.13',
    '.30C32.C2.85D.8D5.D3.34X7.16',
    '.30C30.86D7.D9.39X8.15',
    '.31C28.87D17.39X8.15',
    '.31C27.88D17.39X9.8X.5',
    '.31C10.7C9.90D15.41X.2X5.14',
    '.32C4.114D12.41X.3X.2X.14',
    '.33C2.116D12.44X.3X.13',
    '.128u2.23D10.62',
    '.32i3.90u7.25D6.48X.13',
    '.31i4.52O12.9O3.3O2.8u8.4u.21D5.62',
    '.31i5.39O25.4O18u11.2u3.21D4.62',
    '.30i6.36O49u16.88',
    '.29i8.33O50u16.88X',
    '.29i9.31O51u16.80X9',
    '.28i11.25O57u13.82X9',
    '.28i18.2i2.11O59u14.89X2',
    '.27i23.10O60u14.91',
    '.26i26.6O62u14.24h.66',
    '.25i29O66u15.90',
    '.24i31O65u17.88',
    '.23i33O64u17.88',
  ];

  // Les contours : par pays, ses anneaux séparés par une espace ; un point = 4 caractères (base 64,
  // x puis y, au dixième de case).
  const CONTOURS = {
    A: 'GfHtGaHnGZHcGeHWGnHUGoHMGqHRGsHiGkH1GdHw F2FnFtF5FxF6F1F0F7F0F7F7F_GBF7GGGBGPF3GWF9GdF7GpGDGvGJGuGGG4GFG5GEG5F0HGFrHJFeHEFYG-FSG_FDG5E2HCEyHJE0HVEdHVEYHQEYHOETHNEHHGECHJDuHEDiG6DeG7DgG2DaGxDgGuDoGVDrGTDqGQDoGTDuF9D2GMDzGADtF4DwF4DwFpDmFjDiFaDkFVDhFRDkFPDpFRDcFMDeFJDZFHDZFEDAE6C7EzDBExC-EtDEEuC8ErC9EnDXEkDeEtDjErDqEuDsErD1EuDxETD7EUD8EcELEhEVEeEREcESEXElESErEMEuD8E8D4E_EBFFEBFNEOFVEQFUEXFaEYFfETFfEdFqEkFuEkF3EnF9EuGJEvGVE0GLFJGLFXGGFbGAFaGAFd',
    B: 'GLFJGVE0GJEvF9EuF3EnF6EeF0EWF5ENFzEFF0EBFyD-F2D7F4D0F0DrGCDnGBDkGGDdGBDXGGDWGJDGGIDBGLC8GWC8GXDCGbC-GdDEGfC3GoC4GxDAGkC1GkCuGgCrGlCmGhCdGwCfG0CjGyCoG_CsHDCrHBC0HJC2HaCoHhCpHoCvHsCvHuC3H0C5H4DGH0DPH8DYH_DjH9DpIED4ICECH5D-H6EBHkEPHeEQHZEVHWESHdEcHcEgHhEoH0E4HzE-HvE9HtFDHjFKHoFZHiFVHaFUHaFWHGFdG8FZG3FgG0FaGsFZGcFTGZFXGLFX HkCrHlChHrCpHrCsHoCqHnCt HzC0H0C2HvC2HtCw',
    C: 'EgIeEdIcEpIUEuITEtIYEzIbErIkEkId FEIYE8IVE7ISFDIT ENIoEJIqEGIrEGIoEMIl DuHEECHJEHHGETHNETHREYHQEdHVE0HVE0HhEuHlEcHwEHHzEAH5EDH7D9H-DoIXDpIjDwIrDhI0DZJBDaJFDOJFDHJIC7JWCNJQCGJUB8JUB3JaBxJcBpJWBkJJBpJDBlJEBeI3BSI3BVIqBgIgBdIgBaIYBkILBdH5BoH4BrHzBpHvBuHrBvHaCAHQB6HLB6HEBwHBBrHEBdHBBdG4BSG7BRG2BWGvBWGpBRGpBUGlBQGfBSGaBkGYBlGVBqGTB0GUB6GaCRGdCoGoC5GoDDGuDaGxDgG2DeG7DiG6',
    D: 'GjGEGnF0GqF0GsF4GzF3G2F6G2FxG8FyG8FqHFFsHKFnHaFkHeFuH1FxHwF4H0F6HyF-H5GIH3GJH1GEHtGFHdGOHcGTHiGaHdGgHgGtH2G8IAHSIKHdIXHkIqHkIlHuJPIAJaIKJYIUJTISJOIJJGIJJAIFI7IHI1IZJBIiJDIrI4IxI4I7IvJIImJGIqI3IwIzIwIuIkIUIVIPIRIFIJIHILIDIDICH8H3HwH4HnHyHTHeHKHcHKHYG-HNG4G0GdGoGPG2GGG4GJGuGDGvF7GpF9GdF3GWGBGPF7GGF_GBGNGCGYF1GZF6 IRJnIJJfHqJUHmJPHrJFHvJJH3JFIBJKIjJAIlJBIcJVIhJfIeJp GhIsGfIyGZIzGVIsGXIcGVIaGWIRGRIIGRICGbICGlH5GtICGwIMGtISGrIt',
    E: 'KKEfKFEgJ1EaJsEbJqEeJgEeJcEkJWEkJWEfJQEaJMEgJGEeJBEVIxERIyEMItEOIkEKImEPIhETIZELIcEHIaEFIVEHIED-ICECIED4H9DpH_DjH8DYH0DPH4DGH0C5H5C7H5C3H0C2HzC0IQCpIVCiInCZIuCYI1CbIwCaI3CjJCCfJxCaJ7CdJ-CjKKC_KBDNKJDSKLDfKWDuKXD3KFES',
    F: 'FuEDFzEFF5ENF0EWFyEUFuEaFuEkFqEkFfEdFfETFaEYFUEXFVEQFNEOFFEBE_EBE8D4FKDyFLD2FTD3FYDzFlDyFoD3FxD7',
    G: 'G6FnG8FqG8FyG2FxG2F6GzF3GsF4GqF0GnF0GjGEGZF6GYF1GNGCF_GBF7F7F7F0F1F0FxF6FtF5F2FnGAFdGAFaGGFbGLFXGZFXGcFTGsFZGsFgGtFlG2Fq',
    H: 'G8FZHGFdHaFWHaFUHiFVHoFZHjFKHtFDHvE9HzE-H0E4H4E8IDE7IJExIaE2IiE0IpE4IoE-IuFHItFPIiFRInFUIjFYIkFiIeFmIcFrIKFuIEFzH1FxHeFuHaFkHKFnHFFsG8FqG6FnG2FqGtFlGsFgGsFZG0FaG3Fg',
    I: 'FlDyFYDzFMDuFRDtFZDxFVDuFYDuFVDoFeDcFkDMF4DCGEDBGJDGGGDWGBDXGGDdGBDkGCDnF0DrF4D0F2D7FyD-F0EBFzEFFuEDFxD7FoD3 FYDzFTD3FLD2FKDy',
    J: 'DUDcDWDaDSDYDKDZDFDRDZDKDcDFDcC7DTC8DbC1DoCyDtC1DuCxDyC1DvCvD1CfDwCfDsCTD2CLDuCKDoCNDcCIDZCMDXCHDhB4DfBzDhBtDlBuDjBoDbBtDhBlDaBpDUB5DRB5DhBYDZBcDUBWDaBUDYBSDeBLDcBFDgBDDfA_DiA6DoA8DlA2DnAyDsAyDvArD1AuEHAuEEA2D3A9D4BBD0BGD-BFEQBIETBOEEBjD5BnD_BnEBBrD2BvDxBsD6ByEBBxEMB_EPCVEeCnEbCpEfC0ETCvEZCxEgC7EhDAEbDGEeDJEjDFEuDIE0DREwDdEqDgErDjEiDlEkDpEcDrErDvErD0EjD6EYD8EGD6D9D1D7D5DyD4DyD7DjD1DcD2DWD_DOD6DFD7C-EAC2D-DSDmDjDpDsDgDhDkDdDiDZDd DdCwDeCyDZC1DYCu EhAIEkAHEjADEmACEpAFEjATElAM EJAkEMAoEFAlEHAh DXBcDWBgDPBgDSBbDRBY DPBpDPBvDLBxDKBr DRA1DQAuDVAvDVAsDdApDdAsDWAyDYA0DOA5 DYBKDUBJDQBCDWA9DYBCDXBHDdBKDYBO CvCRCqCIC7B6DGB5DMB9DPCGDLCKDQCLDQCPDOCNDNCUDGCYDDCXC9CWC5CMCzCS ECD7D-D9D6D7D-D4',
    K: 'FuEaFyEUF0EWF6EeF3EnFuEk',
    L: 'BwHBB6HEB6HLCAHQBvHaBuHrBpHvBrHzBoH4BdH5BkILBaIYBdIgBgIgBVIqBSI3BJI6A6IzAyIzA4IqA8IRBAISA-IQA2IPA2IKA7IJBBICA5IIA0IIAzIFA4H4BHHoBNHZBRHBBPG_BSG7BdG4BdHBBrHE',
    M: 'IxANIwAJIyAKI2ALIxARIvAM',
    N: 'JxHLJ6HSJ9HbJ-HqKDHyKIHzKKH5KFIHJ-ILKAIPJ-ITJ5ITJ1ILJqIDJsIDJpH8JrHgJmHeJkHXJqHKJtHO',
    O: 'GRKKC7KKCzKAC_J_DbJyDjJ0DrJtD_JmEbJnEjJjE0JiFIJjFTJqFsJgF1JlF7JkF7JhGJJnGXJmGPJwGSJ0GPKC',
    P: 'EYHQETHRETHNEYHO',
    Q: 'LfDJLbDQLRDNLLDTLADOKjDQKVDUKQDdKMDcKLDfKJDSKBDNKKC_J-CjKKCiKZCUKaCXKeCXKaCTKaCGKmB4KhB3KhBuKmBpKuBoK0BdK-BgLBBdLGBeLJBkLSBdLeBhLiBtLiB0LoB3LoB6LuCALuDKLlDO',
    R: 'JSHEJTHPJEHIJCHHI7G7IoGrIjGhIcGcIcGRIfGQImGVIqGPIwGNJBGQJQGPJXGTJdGSJaGgJkGnJeGpJkGxJeG0JaG1JcG7JZG6',
    S: 'LqHLLlHNLnHVLYHbLIHWKrHhKrHXKdHLKgHHKdG9KhG7KlGzKcGtKYGmKcGZKiGcKhGjLRGeLcGTLrGLLuGLLuHE',
    T: 'IUGKISGEIZGAIYF3IiFyIjFuInFuI_F-JJF-JSF4JVGGJdGKJYGLJXGTJQGPJBGQIwGNIqGPImGVIfGQIcGRIcGcIjGhIoGrI7G7JCHHI0G9IjG7ITGrISGpIYGoIPGhIMGVIGGPICGPH6GcH2GVH0GLICGLIGGGIKGL IyHAItHAIsG9IzG- IEGVIGGRILGX JTHPJVHSI4HGJEHI',
    U: 'HSCfHQCgHMCWHHCVHFCSHCCIHHCHHLCCHOCJHPCCHUB-HZB_HZCGHUCOHXCTHTCW GaByGhB1GkBuGpBvGqBnGmBnGjBvGfBwGcBrGhBlGsBjG0BZG8BVG4BxHBB2G_B7G5B7G3CFGzCFG0CHGuCOGvCUGsCaGwCbGwCfGhCdGgCQGZCL GyCOG9CLHACXG7CaG0CX HDCgHECcHICdHOCfHOCjHKCk G9CfHCCXG_Ch HTCdHVCZHZCb H_CYH5CWH5CRH_CU',
    V: 'J2AxJxA1JsAzJnAtJoApJkAmJkAfJuAWJ7ASJ7APKPAPKcALKeANKZAeKjA0KgA-KUBAKBA3J2A- JYA8JTA6JSA0JbAwJlAyJaA6JWBC JeAqJaAuJTApJaAk',
    W: 'JsAIJgALJbARJcALJXAHJTANJTAEJDABJDAAJ1AA',
    X: 'KJIyKNI6KFI4KIIw KMI-KRJAKTJCKQJEKLJA J2IUJ7IaJ3IZJyISJ3IR LZIsLZIwLSItLNInLFInK8IgK1IgK7IaK_IbLBIeLOIgLTIr LNHtLOHpLSHt LtJDLuJCLuJD LuILLuIMLtIM LhH6LhH_LbH_LaH7 LuJvLuJ6LrJ6LjJ2LRJ3LPJwLSJtLVJvLbJsLbJvLfJy LuHeLpHlLWHiLRHnLLHmLEHtK-HtLBH1LIH2LMH6K_H4LFIAK6H7K_ICKvH5KvH0KpH3KqIDK8IWK5IZK4IVK0IUK3IaKuIgK9IjLOItLQI5LEIyK7I4LGJBLAJFK2JBLDJbK5JUK0JdKrJQKoJYKhJQKiJIKVI9KaI1KfI1KiIwK5I2K8IwKtIsKbIyKXIuKVIyKLImKRIkKRIhKJIiJ5ITJ-ITKAIPJ-ILKFIHKKH5KIHzKUHxKbHpKmHnKrHhLIHWLYHbLnHVLlHNLqHLLuHNLuHVLsHX',
    Y: 'JpFxJeFxJSF4JJF-I_F-InFuIiFmIeFmIkFiIjFYInFUIiFRItFPIuFHI5FMJKFKJKFEJXE9JcE_JjE5JlEzJ1EwJ7E1KBEyKPE7KCFJJ4Fq',
    Z: 'DYCcDfCVDeCa',
    a: 'C5CMC9CWDDCXDACaC_C0C2DCC3DECuDFCtDCCaDJCVDGCUDKCFDMB9DKCDDGB5DGCDDBB3DACAC6B6C2CDC3CCCzCHCwCVCxCSCuCPCwCDCvCQCkCWCjCGCZCHCWCNCWCLCSCRCSCMCPCPCJCNCECiCLCiCICrCCCiB_CpB7CsB1C2B1C0B8C7BzC_B4C7B6CqCICvCRCzCS',
    c: 'KOHPKKHTKFHSKAHVKAHaJ9HbJ6HSJxHLJxHGJ2HDJ9G3KJHCKRHD',
    d: 'J7BnJeBpJRBzJOBgJUBMJfBGJsBUJxBWJ6BNJ2A-KBA3KUBAKgA-KoBCKoBNKrBNKwBTK0BdKuBoKmBpKhBuKRBmKJBmKEBh',
    f: 'JRBzJeBpJ7BnKEBhKJBmKRBmKhBuKhB3KmB4KaCGKaCTKeCXKaCXKZCUKKCiJ-CjJ7CdJxCaJwCNJrCJJXCH',
    g: 'KmHnKbHpKUHxKIHzKDHyJ-HqJ9HbKAHaKAHVKFHSKKHTKOHPKdHLKrHXKrHh',
    i: 'BKKKBNKJBcJ4BqJgB3JgB3JoCCJ0CbJ5ClJ1CmJ9CzKAC7KK',
    j: 'LuFELsFBLTEoLMEnLaEeLsEkLuEj',
    l: 'JxHLJtHOJqHKJkHXJmHeJVHSJTHPJSHEJZG6JcG7JaG1JeG0JmG8J2HDJxHG',
    m: 'HRABHVAPHUAYHKAmHKA3HGA0G_AwG8AhG2A1GyA2GuAyGwA2GbBKGLBNGKBKGGBLGHBHF7A_F5A0GAA3GEA0GBA1F-AxGGAmF1AvF2AkGDAfF9AfF-AcGGARGJARGIAWGOAOGDARF1AiF3AXF9AXF4AUF3AOF9AIF3AJF2AAGOAAGPACGPAAHVAA',
    n: 'LcGTLRGeKhGjKiGcKcGZKXGVKbGRKZGPKWGOKQGTKBGOKEGMKBGKKDGGJ1F_J0F5JpFxJ4FqKCFJKPE7KUE3KsE2K0E6LGEvLHEpLMEnLTEoLsFBLuFELuGLLrGL',
    o: 'LoB3LiB0LiBtLeBhLSBdLJBkLGBeLBBdK-BgK0BdKwBTKrBNKoBNKoBCKgA-KjA0KZAeKeANKcALKaADKeAFKiAALuAALuCALoB6 JXCHJrCJJwCNJxCaJCCfJGCTJOCQJSCIJTCIJPCQJTCRJYCQ',
    p: 'KhG7KdG9KgHHKdHLKOHPKRHDKJHCJ9G3J2HDJmG8JeG0JkGxJeGpJkGnJaGgJdGSJXGTJYGLJdGKJVGGJSF4JeFxJpFxJ0F5J1F_KDGGKBGKKEGMKBGOKQGTKWGOKZGPKbGRKXGVKcGZKYGmKcGtKlGz',
    q: 'JlEzJjE5JcE_JXE9JKFEJKFKI5FMIuFHIoE-IpE4IsEyI2EwI8EmJGEeJMEgJQEaJWEfJWEkJcEkJgEeJqEeJsEbJ1EaKFEgKBEyJ7E1J1Ew',
    r: 'IZGAISGEIUGKIKGLIGGGICGLH0GLH3GJH5GIHyF-H0F6HwF4H1FxIEFzIKFuIcFrIeFmIiFmInFuIjFuIiFyIYF3',
    s: 'IkBTIoBMItBJIvBLIsBOIvBWImBj IOBvIVBaIRB2 HVAPHRABHVAAIOAAIPAFIUAJIYAHIlAUIoAaIcAmIjAkIhAsIRA5IHA7IRA9INA_IPBiIIB6H3B8H4B-HxCEHzCLHxCPHeCPHfCHHXB5HcB6HaB1HcB1HdBxHWBqHFBFHDA1HGA0HKA3HKAmHUAY',
    t: 'IpE4IiE0IaE2IJExIDE7H4E8H0E4HhEoHcEgHdEcHWESHZEVHeEQHkEPH6EBH5D-ICECIED-IVEHIaEFIcEHIZELIhETImEPIkEKItEOIyEMIxERJBEVJGEeI8EmI2EwIsEy',
    u: 'GRKKGPKCGSJ0GPJwGXJmGuJcGxJcGxJhGyJeG4JfG9JrHKJiHLJnG-J5HAKAHJKGHKKK',
    v: 'LpHlLuHeLsHXLuHVLuHNLqHLLuHELuHnLrHo',
    w: 'LaEeLMEnLHEpLGEvK0E6KsE2KUE3KPE7KBEyKFEgKKEfKFESKXD3KWDuKLDfKMDcKQDdKVDUKjDQLADOLLDTLRDNLbDQLfDJLlDOLuDKLuEjLsEk',
  };
  // Les traits : lettres des deux pays (« . » : la mer, c'est une côte), puis les points.
  const TRAITS = 'Z.DeCaDYCcDfCVDeCa J.DsDgDhDkDdDiDZDdDUDcDWDaDSDYDKDZDFDRDZDKDcDFDcC7DTC8DbC1DoCyDtC1DuCxDyC1DvCvD1CfDwCfDsCTD2CLDuCKDoCNDcCIDZCMDXCHDhB4DfBzDhBtDlBuDjBoDbBtDhBlDaBpDUB5DRB5DhBYDZBcDUBWDaBUDYBSDeBLDcBFDgBDDfA_DiA6DoA8DlA2DnAyDsAyDvArD1AuEHAuEEA2D3A9D4BBD0BGD-BFEQBIETBOEEBjD5BnD_BnEBBrD2BvDxBsD6ByEBBxEMB_EPCVEeCnEbCpEfC0ETCvEZCxEgC7EhDAEbDGEeDJEjDFEuDIE0DREwDdEqDgErDjEiDlEkDpEcDrErDvErD0EjD6EYD8EGD6D9D1D7D5DyD4DyD7DjD1DcD2DWD_DOD6DFD7C-EAC2D-DSDmDjDpDsDg J.DdCwDeCyDZC1DYCuDdCw J.EmACEpAFEjATElAMEhAIEkAHEjADEmAC J.EJAkEMAoEFAlEHAhEJAk J.DWBgDPBgDSBbDRBYDXBcDWBg J.DPBpDPBvDLBxDKBrDPBp J.DdAsDWAyDYA0DOA5DRA1DQAuDVAvDVAsDdApDdAs J.DYBCDXBHDdBKDYBODYBKDUBJDQBCDWA9DYBC JaDDCXC9CWC5CMCzCSCvCRCqCIC7B6 J.C7B6DGB5DMB9DPCGDLCKDQCLDQCPDOCNDNCUDGCYDDCX J.ECD7D-D9D6D7D-D4ECD7 wjLuEjLsEkLaEeLMEn wnLMEnLHEpLGEvK0E6KsE2KUE3KPE7 wYKPE7KBEy wqKBEyKFEg wEKFEgKKEfKFESKXD3KWDuKLDf wQKLDfKMDcKQDdKVDUKjDQLADOLLDTLRDNLbDQLfDJLlDOLuDK v.LuHnLrHoLpHl vXLpHlLuHeLsHXLuHV vXLuHNLqHL vSLqHLLuHE uOGRKKGPKCGSJ0GPJwGXJm u.GXJmGuJcGxJcGxJhGyJeG4JfG9JrHKJiHLJnG-J5HAKAHJKGHKKK GHGsFZGsFg GeGsFgGtFl GHGtFlG2FqG6FnG8Fq GDG8FqG8FyG2FxG2F6GzF3GsF4GqF0GnF0GjGEGZF6GYF1GNGCF_GB GAF_GBF7F7F7F0F1F0FxF6FtF5F2FnGAFdGAFaGGFbGLFX GBGLFXGZFXGcFTGsFZ s.IvBLIsBOIvBWImBjIkBTIoBMItBJIvBL s.IRB2IOBvIVBaIRB2 smHGA0HKA3HKAmHUAYHVAPHRABHVAA s.IOAAIPAFIUAJIYAHIlAUIoAaIcAmIjAkIhAsIRA5IHA7IRA9INA_IPBiIIB6H3B8H4B-HxCEHzCLHxCPHeCPHfCHHXB5HcB6HaB1HcB1HdBxHWBqHFBFHDA1HGA0 C.EtIYEzIbErIkEkIdEgIeEdIcEpIUEuITEtIY C.FEIYE8IVE7ISFDITFEIY C.EJIqEGIrEGIoEMIlENIoEJIq CADaGxDgG2DeG7DiG6DuHEECHJEHHGETHN CPETHNETHREYHQ CAEYHQEdHVE0HV C.E0HVE0HhEuHlEcHwEHHzEAH5EDH7D9H-DoIXDpIjDwIrDhI0DZJBDaJFDOJFDHJIC7JWCNJQCGJUB8JUB3JaBxJcBpJWBkJJBpJDBlJEBeI3BSI3 CLBSI3BVIqBgIgBdIgBaIYBkILBdH5BoH4BrHzBpHvBuHrBvHaCAHQB6HLB6HEBwHBBrHEBdHBBdG4BSG7 C.BSG7BRG2BWGvBWGpBRGpBUGlBQGfBSGaBkGYBlGVBqGTB0GUB6GaCRGdCoGoC5GoDDGuDaGx qYKBEyJ7E1J1EwJlEzJjE5JcE_JXE9JKFEJKFKI5FMIuFH qHIuFHIoE-IpE4 qtIpE4IsEyI2EwI8EmJGEe qEJGEeJMEgJQEaJWEfJWEkJcEkJgEeJqEeJsEbJ1EaKFEg rTInFuIjFuIiFyIYF3IZGAISGEIUGKIKGLIGGGICGLH0GL r.H0GLH3GJ rDH3GJH5GIHyF-H0F6HwF4H1Fx rHH1FxIEFzIKFuIcFrIeFm rYIeFmIiFmInFu pSKcGZKYGmKcGtKlGzKhG7KdG9KgHHKdHL pgKdHLKOHP pcKOHPKRHDKJHCJ9G3J2HD plJ2HDJmG8JeG0 pRJeG0JkGxJeGpJkGnJaGgJdGSJXGT pTJXGTJYGLJdGKJVGGJSF4 pYJSF4JeFxJpFx pnJpFxJ0F5J1F_KDGGKBGKKEGMKBGOKQGTKWGOKZGPKbGRKXGVKcGZ oQLuCALoB6LoB3LiB0LiBtLeBhLSBdLJBkLGBeLBBdK-BgK0Bd odK0BdKwBTKrBNKoBNKoBCKgA- oVKgA-KjA0KZAeKeANKcAL o.KcALKaADKeAFKiAA o.JTCIJPCQJTCRJYCQJXCH ofJXCHJrCJJwCNJxCa oEJxCaJCCf o.JCCfJGCTJOCQJSCI ofJSCIJTCI nSLuGLLrGLLcGTLRGeKhGjKiGcKcGZ nYJpFxJ4FqKCFJKPE7 njLMEnLTEoLsFBLuFE L.BSI3BJI6A6IzAyIzA4IqA8IRBAISA-IQA2IPA2IKA7IJBBICA5IIA0IIAzIFA4H4BHHoBNHZBRHBBPG_BSG7 EtJGEeJBEVIxERIyEMItEOIkEKImEPIhETIZELIcEHIaEFIVEHIED-ICEC EBICECIED4H9DpH_DjH8DYH0DPH4DGH0C5 E.H0C5H5C7H5C3H0C2 EBH0C2HzC0 E.HzC0IQCpIVCiInCZIuCYI1CbIwCaI3CjJCCf EfJxCaJ7CdJ-Cj EQJ-CjKKC_KBDNKJDSKLDf m.HGA0G_AwG8AhG2A1GyA2GuAyGwA2GbBKGLBNGKBKGGBLGHBHF7A_F5A0GAA3GEA0GBA1F-AxGGAmF1AvF2AkGDAfF9AfF-AcGGARGJARGIAWGOAOGDARF1AiF3AXF9AXF4AUF3AOF9AIF3AJF2AA m.GOAAGPACGPAA IFFzEFFuEDFxD7FoD3FlDyFYDz I.FYDzFMDuFRDtFZDxFVDuFYDuFVDoFeDcFkDMF4DCGEDBGJDG IBGJDGGGDWGBDXGGDdGBDkGCDnF0DrF4D0F2D7FyD-F0EBFzEF IFFYDzFTD3FLD2FKDy I.FKDyFYDz iOCzKAC7KK i.BKKKBNKJBcJ4BqJgB3JgB3JoCCJ0CbJ5ClJ1CmJ9CzKA lcJ2HDJxHGJxHL lNJxHLJtHOJqHKJkHXJmHe l.JmHeJVHS lTJVHSJTHP lRJTHPJSHEJZG6JcG7JaG1JeG0 kAGEG5GFG5 gSKdHLKrHXKrHh gXKrHhKmHnKbHpKUHxKIHz gNKIHzKDHyJ-HqJ9Hb gcJ9HbKAHaKAHVKFHSKKHTKOHP KBF0EWF6EeF3En KAF3EnFuEk KFFuEkFuEaFyEUF0EW f.JXCHJRBz fdJRBzJeBpJ7BnKEBhKJBmKRBmKhBu fQKhBuKhB3KmB4KaCGKaCTKeCXKaCXKZCUKKCiJ-Cj eHGsFgGtFl d.JRBzJOBgJUBMJfBGJsBUJxBWJ6BNJ2A- dVJ2A-KBA3KUBAKgA- dQK0BdKuBoKmBpKhBu cNJ9HbJ6HSJxHL DHG8FqHFFsHKFnHaFkHeFuH1Fx D.H3GJH1GEHtGFHdGOHcGTHiGaHdGgHgGtH2G8IAHSIKHdIXHkIqHkIlHuJPIAJaIKJYIUJTISJOIJJGIJJAIFI7IHI1IZJBIiJDIrI4IxI4I7IvJIImJGIqI3IwIzIwIuIkIUIVIPIRIFIJIHILIDIDICH8H3HwH4HnHyHTHeHKHcHKHYG-HNG4G0GdGoGPG2GGG4 DAGGG4GJGuGDGvF7GpF9GdF3GWGBGPF7GGF_GB D.IlJBIcJVIhJfIeJpIRJnIJJfHqJUHmJPHrJFHvJJH3JFIBJKIjJAIlJB D.GtICGwIMGtISGrItGhIsGfIyGZIzGVIsGXIcGVIaGWIRGRIIGRICGbICGlH5GtIC a.DDCXDACaC_C0C2DCC3DECuDFCtDCCaDJCVDGCUDKCFDMB9DKCDDGB5DGCDDBB3DACAC6B6C2CDC3CCCzCHCwCVCxCSCuCPCwCDCvCQCkCWCjCGCZCHCWCNCWCLCSCRCSCMCPCPCJCNCECiCLCiCICrCCCiB_CpB7CsB1C2B1C0B8C7BzC_B4C7B6 YTJSF4JJF-I_F-InFu YHIeFmIkFiIjFYInFUIiFRItFPIuFH X.KJIyKNI6KFI4KIIwKJIy X.KRJAKTJCKQJEKLJAKMI-KRJA X.J7IaJ3IZJyISJ3IRJ2IUJ7Ia X.K_IbLBIeLOIgLTIrLZIsLZIwLSItLNInLFInK8IgK1IgK7IaK_Ib X.LSHtLNHtLOHpLSHt X.LuJDLtJDLuJC X.LuIMLtIMLuIL X.LhH6LhH_LbH_LaH7LhH6 X.LVJvLbJsLbJvLfJyLuJv X.LuJ6LrJ6LjJ2LRJ3LPJwLSJtLVJv X.LpHlLWHiLRHnLLHmLEHtK-HtLBH1LIH2LMH6K_H4LFIAK6H7K_ICKvH5KvH0KpH3KqIDK8IWK5IZK4IVK0IUK3IaKuIgK9IjLOItLQI5LEIyK7I4LGJBLAJFK2JBLDJbK5JUK0JdKrJQKoJYKhJQKiJIKVI9KaI1KfI1KiIwK5I2K8IwKtIsKbIyKXIuKVIyKLImKRIkKRIhKJIiJ5IT XNJ5ITJ-ITKAIPJ-ILKFIHKKH5KIHz XSKrHhLIHWLYHbLnHVLlHNLqHL BAGLFXGLFJGVE0GJEvF9EuF3En BFF0EWF5ENFzEF B.GJDGGIDBGLC8GWC8GXDCGbC-GdDEGfC3GoC4GxDAGkC1GkCuGgCrGlCmGhCd BUGhCdGwCf B.GwCfG0CjGyCoG_CsHDCrHBC0HJC2HaCoHhCpHoCvHsCvHuC3H0C5 BtICECH5D-H6EBHkEPHeEQHZEVHWESHdEcHcEgHhEoH0E4 BHH0E4HzE-HvE9HtFDHjFKHoFZHiFVHaFUHaFWHGFdG8FZG3FgG0FaGsFZ B.HrCpHrCsHoCqHnCtHkCrHlChHrCp B.H0C2HvC2HtCwHzC0 A.GqHRGsHiGkH1GdHwGfHtGaHnGZHcGeHWGnHUGoHMGqHR A.GGG4GFG5 A.GEG5F0HGFrHJFeHEFYG-FSG_FDG5E2HCEyHJE0HV APEYHQEYHOETHN A.DaGxDgGuDoGVDrGTDqGQDoGTDuF9D2GMDzGADtF4DwF4DwFpDmFjDiFaDkFVDhFRDkFPDpFRDcFMDeFJDZFHDZFEDAE6C7EzDBExC-EtDEEuC8ErC9EnDXEkDeEtDjErDqEuDsErD1EuDxETD7EUD8EcELEhEVEeEREcESEXElESErEMEuD8E8D4 AFE8D4E_EBFFEBFNEOFVEQFUEXFaEYFfETFfEdFqEkFuEk M.IyAKI2ALIxARIvAMIxANIwAJIyAK W.J1AAJsAIJgALJbARJcALJXAHJTANJTAEJDABJDAA V.J2A-J2AxJxA1JsAzJnAtJoApJkAmJkAfJuAWJ7ASJ7APKPAPKcAL V.JbAwJlAyJaA6JWBCJYA8JTA6JSA0JbAw V.JeAqJaAuJTApJaAkJeAq U.HZCGHUCOHXCTHTCWHSCfHQCgHMCWHHCVHFCSHCCIHHCHHLCCHOCJHPCCHUB-HZB_HZCG U.GhCdGgCQGZCLGaByGhB1GkBuGpBvGqBnGmBnGjBvGfBwGcBrGhBlGsBjG0BZG8BVG4BxHBB2G_B7G5B7G3CFGzCFG0CHGuCOGvCUGsCaGwCbGwCf U.G9CLHACXG7CaG0CXGyCOG9CL U.HICdHOCfHOCjHKCkHDCgHECcHICd U.G_ChG9CfHCCXG_Ch U.HZCbHTCdHVCZHZCb U.H_CYH5CWH5CRH_CUH_CY tHIpE4IiE0IaE2IJExIDE7H4E8H0E4 TRJXGTJQGPJBGQIwGNIqGPImGVIfGQIcGRIcGcIjGhIoGrI7G7JCHH T.JCHHI0G9IjG7ITGrISGpIYGoIPGhIMGVIGGPICGPH6GcH2GVH0GL T.IyHAItHAIsG9IzG-IyHA T.ILGXIEGVIGGRILGX T.JVHSI4HGJEHI TRJEHIJTHP R.JEHIJCHH F.E8D4FKDy O.CzKAC_J_DbJyDjJ0DrJtD_JmEbJnEjJjE0JiFIJjFTJqFsJgF1JlF7JkF7JhGJJnGXJm N.J5ITJ1ILJqIDJsIDJpH8JrHgJmHe';

  // Les données fictives : participants, collective (n, bleues), individuelle (n, bleues).
  const DONNEES = {
    A: [1874, 935, 607, 939, 113],     // France
    B: [1466, 731, 486, 735, 100],     // Allemagne
    C: [386, 193, 123, 193, 22],       // Espagne
    D: [312, 155, 104, 157, 22],       // Italie
    E: [211, 104, 67, 107, 12],        // Pologne
  };
  const AUTRES = [208, 104, 69, 104, 12];       // « autres pays » : comptés dans les totaux, pas détaillés
  const REPARTITION = { F: 62, G: 48, H: 34, I: 20, J: 18, K: 14, L: 12 };   // les 208 autres, pour poser leurs points (jamais affiché)
  const TOTAL = [4457, 2222, 1456, 2235, 281];
  const TROP_PEU = '';                  // trop peu pour conclure : hachuré, sans valeur (aucun)

  // ---------------------------------------------------------------------------------------------
  const L = 75, H = 65, F = 3;
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const VAL = {}; for (let i = 0; i < 64; i++) VAL[B64[i]] = i;
  const CODE = { '.': 0 }; PAYS.forEach((p, i) => { CODE[p[0]] = i + 1; });
  const points = s => { const o = []; for (let i = 0; i + 3 < s.length; i += 4) o.push((VAL[s[i]] * 64 + VAL[s[i + 1]]) / 10, (VAL[s[i + 2]] * 64 + VAL[s[i + 3]]) / 10); return o; };

  const grille = new Uint8Array(L * H);
  LIGNES.forEach((l, y) => { for (let x = 0; x < L; x++) grille[y * L + x] = CODE[l[x]]; });
  const fine = new Uint8Array(L * F * H * F);
  FINES.forEach((l, y) => { let x = 0; l.replace(/([^0-9])([0-9]*)/g, (_, c, n) => { const v = CODE[c]; for (let k = +(n || 1); k--;) fine[y * L * F + x++] = v; }); });

  const lister = (g, l, h) => { const m = new Map(); return code => { if (!m.has(code)) { const o = []; for (let y = 0; y < h; y++) for (let x = 0; x < l; x++) if (g[y * l + x] === code) o.push([x, y]); m.set(code, o); } return m.get(code); }; };
  const lire = (g, l, h) => (x, y) => { x = Math.floor(x); y = Math.floor(y); return x < 0 || y < 0 || x >= l || y >= h ? 0 : g[y * l + x]; };

  const pays = [{ code: 0, lettre: '.', iso: '', nom: 'mer', ne: '', role: '', cases: 0, fines: 0, centre: null }]
    .concat(PAYS.map(([lettre, iso, nom, ne, role, cases, fines, centre], i) => ({ code: i + 1, lettre, iso, nom, ne, role, cases, fines, centre })));
  const contours = pays.map(p => (CONTOURS[p.lettre] ? CONTOURS[p.lettre].split(' ').map(points) : []));
  const traits = TRAITS.split(' ').map(t => ({ a: CODE[t[0]], b: CODE[t[1]], pts: points(t.slice(2)) }));

  // les données fictives, avec ce que le tableau du scénario affiche (au dixième)
  const r1 = x => Math.round(x * 10) / 10;
  const parPays = {};
  for (const [lt, [participants, cn, cb, inn, ib]] of Object.entries(DONNEES)) {
    const tropPeu = lt === TROP_PEU, pc = 100 * cb / cn, pi = 100 * ib / inn;
    const p = cb / cn, q = ib / inn, m = 196 * Math.sqrt(p * (1 - p) / cn + q * (1 - q) / inn);
    parPays[CODE[lt]] = {
      code: CODE[lt], participants, tropPeu,
      collective: { n: cn, bleues: cb, pct: tropPeu ? null : r1(pc) },
      individuelle: { n: inn, bleues: ib, pct: tropPeu ? null : r1(pi) },
      ecart: tropPeu ? null : r1(r1(pc) - r1(pi)), marge: tropPeu ? null : r1(m),   // l'écart des pourcentages affichés
    };
  }
  const repartition = {}; for (const [lt, n] of Object.entries(REPARTITION)) repartition[CODE[lt]] = n;
  const donnees = {
    fictives: true,   // par pays : inventé ; les totaux sont ceux du questionnaire de Monsieur Phi
    source: 'SCENARIO.md, « Les données · Par pays » (prototype : la répartition par pays est inventée, à mesurer ; les totaux sont ceux du questionnaire de Monsieur Phi)',
    ordre: Object.keys(DONNEES).map(lt => CODE[lt]),   // rangés par nombre de participants, jamais par score
    parPays,
    autres: { participants: AUTRES[0], collective: { n: AUTRES[1], bleues: AUTRES[2] }, individuelle: { n: AUTRES[3], bleues: AUTRES[4] }, repartition },
    total: { participants: TOTAL[0], collective: { n: TOTAL[1], bleues: TOTAL[2], pct: r1(100 * TOTAL[2] / TOTAL[1]) },
      individuelle: { n: TOTAL[3], bleues: TOTAL[4], pct: r1(100 * TOTAL[4] / TOTAL[3]) },
      ecart: r1(r1(100 * TOTAL[2] / TOTAL[1]) - r1(100 * TOTAL[4] / TOTAL[3])) },   // 65,5 − 12,6 = 52,9
  };

  // la projection (la même que l'outil) : lon, lat en degrés → unités de case
  const A = 6378137, Fl = 1 / 298.257222101, E2 = 2 * Fl - Fl * Fl, E = Math.sqrt(E2), RAD = Math.PI / 180;
  const qf = s => (1 - E2) * (s / (1 - E2 * s * s) - Math.log((1 - E * s) / (1 + E * s)) / (2 * E));
  const QP = qf(1), RQ = A * Math.sqrt(QP / 2), B1 = Math.asin(qf(Math.sin(52 * RAD)) / QP);
  const DD = A * Math.cos(52 * RAD) / Math.sqrt(1 - E2 * Math.sin(52 * RAD) ** 2) / (RQ * Math.cos(B1));
  const S = 0.0000229137313733, OX = -1903082.255, OY = 1009483.619;
  function projeter(lon, lat) {
    const b = Math.asin(Math.max(-1, Math.min(1, qf(Math.sin(lat * RAD)) / QP))), dl = (lon - 10) * RAD;
    const k = RQ * Math.sqrt(2 / (1 + Math.sin(B1) * Math.sin(b) + Math.cos(B1) * Math.cos(b) * Math.cos(dl)));
    const x = k * DD * Math.cos(b) * Math.sin(dl), y = (k / DD) * (Math.cos(B1) * Math.sin(b) - Math.sin(B1) * Math.cos(b) * Math.cos(dl));
    return [(x - OX) * S, (OY - y) * S];
  }

  const EUROPE = {
    source: 'Natural Earth 1:50m (4.1.0), domaine public, via world-atlas@2.0.2',
    projection: 'Lambert azimutale équivalente, 52° N 10° E, GRS80 (EPSG:3035)',
    kmParCase: 43.64,          // le côté d'une case, en km
    largeur: L, hauteur: H, pas: 12, ecran: { x: 170, y: 35 },
    pays, lignes: LIGNES,
    case: lire(grille, L, H),
    casesDe: lister(grille, L, H),
    code: iso => { const p = pays.find(q => q.iso === iso); return p ? p.code : 0; },
    centroides: pays.map(p => p.centre),
    contours, traits,
    fin: { facteur: F, largeur: L * F, hauteur: H * F, pas: 4, case: lire(fine, L * F, H * F), casesDe: lister(fine, L * F, H * F) },
    projeter,
    donnees,
  };
  globalThis.EUROPE = EUROPE;
  if (typeof module === 'object' && module.exports) module.exports = EUROPE;
})();
