/* ==========================================================================
   Essai de direction artistique « en caractères » : le moteur de rendu.

   L'idée (Thibaut, 12 octobre) : que l'image soit dessinée par une machine,
   pas imitée d'une main humaine. Retour de Ronan sur la première version :
   « c'est assez fouillis, on a du mal à voir le dessin ». Cette version est
   donc un dessin au trait : des contours nets, très peu de remplissage.

   Trois passes WebGL2 :
   1. « points » : la scène 3D (fonctions de distance signée) est calculée
      finement, 4 × 8 points par case de la grille. Chaque point note ce qu'il
      touche (matière, face), sa lumière, et un repère (reflet, éclat).
   2. « cases » : dans chaque case, on repère les contours qui comptent (le
      ponton, la passerelle, la bombe, le soleil, la rive, l'horizon), puis on
      choisit le caractère dont le dessin colle le mieux à ces contours :
      « _ / ( | » … Les gens s'écrivent d'un signe (tête « o », corps « # »,
      jambes « | ») ; l'étincelle, l'éclat de la bombe, le reflet du soleil
      sur l'eau ont le leur. Le reste est du vide.
   3. « glyphes » : chaque pixel de l'écran lit sa case et dessine le caractère
      depuis un atlas de la police (IBM Plex Mono).
   L'œil de Phi n'est pas ici : il garde son dessin vectoriel (shared/oeil.js).
   ========================================================================== */

// L'ordre de l'atlas : les indices sont repris tels quels dans les shaders
export const GLYPHES = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@', '|', '/', '\\', '_', '~', ',', "'", '`', 'o', 'O', ';', '"', '^', '(', ')', '<', '>', 'v'];
// Les caractères « de trait », candidats pour dessiner un contour
const TRAITS = ['-', '_', '|', '/', '\\', '(', ')', '<', '>', '^', 'v', '.', ',', "'", '`', '~'];
// Les plus simples sont un peu favorisés : une ligne droite reste une ligne droite
const SIMPLES = new Set(['-', '_', '|', '/', '\\']);
const SX = 4, SY = 8;                  // points par case

const VS = `#version 300 es
void main() {
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

// ---------------------------------------------------------------------------
// Passe 1 : la scène, point par point
const FS_POINTS = `#version 300 es
precision highp float;
precision highp int;

uniform vec2 uPts;          // taille de la grille de points
uniform vec2 uPtPx;         // taille d'un point, en pixels
uniform vec2 uOrig;         // coin haut-gauche de la grille, en pixels
uniform vec4 uRect;         // cadre de l'image (x, y, l, h), origine en haut à gauche
uniform vec3 uProj;         // centre de projection (x, y) et demi-largeur, en pixels
uniform float uT;
uniform vec3 uCamPos;
uniform vec3 uCamTgt;
uniform float uFocal;
uniform vec4 uPlayer;       // joueur : x, y (sol), z, cap
uniform vec2 uWalk;         // amplitude et phase de la marche
uniform float uMist;        // brume qui monte après le choix (0..1)
uniform vec3 uSun;          // direction du soleil

out vec4 o;

// Matières (codées ensuite avec leur face : code = matière × 4 + face)
#define M_CIEL 0.0
#define M_SOL 1.0
#define M_EAU 2.0
#define M_PONT 3.0
#define M_FLOT 4.0
#define M_PASS 5.0
#define M_BOMBE 6.0
#define M_MECHE 7.0
#define M_ETINC 8.0
#define M_GENS 9.0
#define M_JOUEUR 10.0
#define M_SOLEIL 12.0
#define M_RIEN 63.0

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash13(vec3 p3) { p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
float sdRBox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float sdCap(vec3 p, vec3 a, vec3 b, float r) { vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
float sdCylX(vec3 p, float r, float h) { vec2 d = abs(vec2(length(p.yz), p.x)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
float sdCylY(vec3 p, float r, float h) { vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }

// La scène : un lac à l'aube. À gauche, sur l'eau, le ponton bleu et sa bombe ;
// à droite, le rivage, où il n'y a rien. Une file de gens attend au bord.
const vec3 PONT = vec3(-4.0, 0.0, 0.0);
const float DECK = 0.48;               // dessus du ponton
const float FX = 1.05;                 // la file : x
const float FZ0 = -29.0;               // la file : z de la première personne
const float FDZ = 1.5;                 // écart entre deux voisins : assez pour qu'on les distingue
const float FN = 21.0;                 // dernière place de la file : personne entre la caméra et la passerelle
const float PC = 20.0;                 // la place du joueur, près de la passerelle

float shoreX(float z) { return 0.32 * sin(z * 0.23 + 0.7); }
float landH(vec2 q) {
  float s = q.x - shoreX(q.y);
  return 0.30 * smoothstep(-0.9, 1.2, s) - 0.6 * (1.0 - smoothstep(-3.0, -0.6, s));
}
float bob() { return 0.025 * sin(uT * 0.9); }

float person(vec3 p, float walk, float ph) {
  float sw = walk * 0.16 * sin(ph);
  float d = sdCap(p, vec3(sw, 0.06, 0.085), vec3(0.0, 0.80, 0.075), 0.068);
  d = min(d, sdCap(p, vec3(-sw, 0.06, -0.085), vec3(0.0, 0.80, -0.075), 0.068));
  d = smin(d, sdRBox(p - vec3(0.0, 1.10, 0.0), vec3(0.10, 0.25, 0.19), 0.09), 0.06);
  d = min(d, min(sdCap(p, vec3(0.0, 1.30, 0.235), vec3(-sw * 0.6, 0.84, 0.25), 0.055),
                 sdCap(p, vec3(0.0, 1.30, -0.235), vec3(sw * 0.6, 0.84, -0.25), 0.055)));
  return smin(d, length(p - vec3(0.0, 1.56, 0.0)) - 0.115, 0.05);
}

// Où se tient la personne de la place k (le joueur est dessiné à part)
vec3 place(float k) {
  float z = FZ0 + k * FDZ + (hash12(vec2(k, 3.1)) - 0.5) * 0.25;
  float x = FX + (hash12(vec2(k, 7.7)) - 0.5) * 0.3;
  return vec3(x, landH(vec2(x, z)), z);
}
vec2 crowd(vec3 p) {             // distance, numéro de la place
  float bb = sdBox(p - vec3(FX, 0.95, FZ0 + 0.5 * FN * FDZ), vec3(0.7, 1.05, 0.5 * FN * FDZ + 0.6));
  if (bb > 0.3) return vec2(bb, -1.0);
  float k = clamp(floor((p.z - FZ0) / FDZ + 0.5), 0.0, FN);
  float bd = (0.5 - abs((p.z - FZ0) / FDZ - k)) * FDZ;
  if (k == PC) return vec2(max(bd, 0.0) + 0.05, -1.0);
  vec3 lp = p - place(k);
  lp.xz = rot((hash12(vec2(k, 9.3)) - 0.5) * 0.5) * lp.xz;
  float s = 0.9 + 0.17 * hash12(vec2(k, 17.0));
  float d = person(lp / s, 0.0, 0.0) * s;
  if (bd >= 0.0) d = min(d, bd + 0.05);
  return vec2(d, k);
}

float playerD(vec3 p) {
  float bs = length(p - uPlayer.xyz - vec3(0.0, 0.9, 0.0)) - 1.1;
  if (bs > 0.3) return bs;
  vec3 lp = p - uPlayer.xyz;
  lp.xz = rot(uPlayer.w) * lp.xz;
  return person(lp, uWalk.x, uWalk.y);
}

vec2 pontoon(vec3 p) {
  vec3 q = p - PONT;
  q.y -= bob();
  float bb = sdBox(q - vec3(0.0, 1.0, 0.0), vec3(2.1, 1.6, 2.1));
  if (bb > 0.3) return vec2(bb, M_PONT);
  vec2 r = vec2(sdBox(q - vec3(0.0, DECK - 0.07, 0.0), vec3(1.9, 0.07, 1.9)), M_PONT);
  float fl = min(sdCylX(q - vec3(0.0, 0.17, 1.25), 0.27, 1.85), sdCylX(q - vec3(0.0, 0.17, -1.25), 0.27, 1.85));
  if (fl < r.x) r = vec2(fl, M_FLOT);
  // La bombe : une sphère noire, sa mèche, une étincelle
  vec3 b = q - vec3(0.0, DECK + 0.72, 0.0);
  float body = length(b) - 0.72;
  if (body < r.x) r = vec2(body, M_BOMBE);
  float cap = sdCylY(b - vec3(0.0, 0.75, 0.0), 0.22, 0.08);
  cap = min(cap, sdCap(b, vec3(0.0, 0.80, 0.0), vec3(0.10, 1.02, 0.05), 0.05));
  cap = min(cap, sdCap(b, vec3(0.10, 1.02, 0.05), vec3(0.30, 1.12, 0.10), 0.045));
  cap = min(cap, sdCap(b, vec3(0.30, 1.12, 0.10), vec3(0.44, 1.08, 0.15), 0.04));
  if (cap < r.x) r = vec2(cap, M_MECHE);
  float spark = length(b - vec3(0.47, 1.08, 0.16)) - 0.075;
  if (spark < r.x) r = vec2(spark, M_ETINC);
  return r;
}

float gangway(vec3 p) {
  float x0 = PONT.x + 1.95, x1 = 0.75;
  float k = clamp((p.x - x0) / (x1 - x0), 0.0, 1.0);
  float y = mix(DECK + bob(), 0.36, k) - 0.03;
  return sdBox(vec3(p.x - 0.5 * (x0 + x1), p.y - y, p.z), vec3(0.5 * (x1 - x0), 0.03, 0.42));
}

vec3 mapScene(vec3 p) {          // distance, matière, place (pour la foule)
  vec3 r = vec3((p.y - landH(p.xz)) * 0.7, M_SOL, 0.0);
  vec2 pt = pontoon(p);
  if (pt.x < r.x) r = vec3(pt, 0.0);
  float g = gangway(p);
  if (g < r.x) r = vec3(g, M_PASS, 0.0);
  vec2 c = crowd(p);
  if (c.x < r.x) r = vec3(c.x, M_GENS, c.y);
  float pl = playerD(p);
  if (pl < r.x) r = vec3(pl, M_JOUEUR, 0.0);
  return r;
}

vec4 march(vec3 ro, vec3 rd, float tmax) {   // t, matière, place, touché
  float t = 0.05;
  for (int i = 0; i < 110; i++) {
    vec3 h = mapScene(ro + rd * t);
    if (h.x < 0.0012 * t + 0.001) return vec4(t, h.y, h.z, 1.0);
    t += h.x;
    if (t > tmax) break;
  }
  return vec4(tmax, 0.0, 0.0, 0.0);
}

vec3 nrm(vec3 p, float t) {
  float e = 0.0012 * t + 0.001;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * mapScene(p + k.xyy * e).x + k.yyx * mapScene(p + k.yyx * e).x +
                   k.yxy * mapScene(p + k.yxy * e).x + k.xxx * mapScene(p + k.xxx * e).x);
}

void main() {
  ivec2 si = ivec2(gl_FragCoord.xy);
  int row = int(uPts.y) - 1 - si.y;
  vec2 sp = uOrig + (vec2(float(si.x), float(row)) + 0.5) * uPtPx;
  if (sp.x < uRect.x || sp.y < uRect.y || sp.x > uRect.x + uRect.z || sp.y > uRect.y + uRect.w) {
    o = vec4(M_RIEN * 4.0 / 255.0, 0.0, 0.0, 0.0);
    return;
  }
  vec3 ro = uCamPos;
  vec3 fw = normalize(uCamTgt - ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  vec2 uv = (sp - uProj.xy) / uProj.z;
  uv.y = -uv.y;
  vec3 rd = normalize(uv.x * rt + uv.y * up + uFocal * fw);

  float tw = rd.y < 0.0 ? -ro.y / rd.y : 1e9;
  vec4 h = march(ro, rd, min(tw, 170.0));
  float mat = M_CIEL, face = 0.0, lum = 0.0, repere = 0.0, t = 1e9;
  if (h.w > 0.5) {
    t = h.x;
    mat = h.y;
    vec3 p = ro + rd * t;
    vec3 n = nrm(p, t);
    lum = clamp(0.55 * max(dot(n, uSun), 0.0) + 0.35 * max(dot(n, -rd), 0.0) + 0.15, 0.0, 1.0);
    if (mat == M_PONT || mat == M_PASS) face = n.y > 0.6 ? 1.0 : 2.0;              // dessus ou côté
    else if (mat == M_GENS || mat == M_JOUEUR) {                                   // tête, corps, jambes
      float y = mat == M_JOUEUR ? p.y - uPlayer.y : (p.y - place(h.z).y) / (0.9 + 0.17 * hash12(vec2(h.z, 17.0)));
      face = y > 1.42 ? 0.0 : (y > 0.84 ? 1.0 : 2.0);
    } else if (mat == M_BOMBE) {                                                    // l'éclat sur la bombe
      vec3 rr = reflect(rd, n);
      repere = max(pow(max(dot(rr, uSun), 0.0), 14.0), pow(max(dot(rr, normalize(vec3(0.3, 0.8, 0.5))), 0.0), 18.0));
    } else if (mat == M_SOL) {                                                      // quelques cailloux
      repere = hash12(floor(p.xz * vec2(4.0, 2.5))) > 0.975 ? 1.0 : 0.0;
    }
    // Après le choix, la brume monte : tout s'efface, point par point, sauf le joueur
    if (mat != M_JOUEUR && uMist * 1.15 * (1.0 - exp(-t * 0.5)) > 0.05 + 0.95 * hash13(floor(p * 3.0))) mat = M_RIEN;
  } else if (tw < 1e8) {
    t = tw;
    mat = M_EAU;
    vec3 p = ro + rd * t;
    float w1 = sin(p.x * 1.6 + uT * 0.7 + 1.7 * sin(p.z * 0.6));
    float w2 = sin(p.z * 2.4 - uT * 0.9 + p.x * 0.5);
    vec3 n = normalize(vec3(0.012 * w1 + 0.006 * w2, 1.0, 0.02 * w2));
    repere = pow(max(dot(reflect(rd, n), uSun), 0.0), 400.0);                      // le chemin du soleil
    if (uMist * 1.15 * (1.0 - exp(-t * 0.5)) > 0.05 + 0.95 * hash13(floor(p * 3.0))) mat = M_RIEN;
  } else if (dot(rd, uSun) > 0.99965) {
    mat = M_SOLEIL;
  }
  o = vec4((mat * 4.0 + face) / 255.0, lum, clamp(repere, 0.0, 1.0), clamp(t / 200.0, 0.0, 1.0));
}`;

// ---------------------------------------------------------------------------
// Passe 2 : un caractère par case
const FS_CASES = `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D uP;       // les points de la passe 1
uniform vec2 uGrid;         // colonnes, rangées
uniform vec2 uPts;          // taille de la grille de points
uniform vec2 uCellPx;       // taille d'une case, en pixels
uniform vec2 uOrig;
uniform vec3 uBand;         // bande des sous-titres : y0, y1 (pixels), force
uniform float uFade;        // apparition / disparition (0..1)
uniform float uT;
uniform float uBlink;       // l'étincelle crépite
uniform uint uMask[16];     // le dessin des caractères de trait, 4 × 8 bits
uniform int uGl[16];        // leur place dans l'atlas
uniform float uBonus[16];   // les plus simples sont favorisés
uniform int uNC;

out vec4 o;

const vec3 BLEU  = vec3(0.42, 0.62, 1.00);
const vec3 ROUGE = vec3(0.92, 0.45, 0.36);
const vec3 DORE  = vec3(1.00, 0.78, 0.32);
const vec3 CRAIE = vec3(0.94, 0.90, 0.84);
const vec3 SOLEIL = vec3(1.00, 0.84, 0.62);

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }

uint pc(uint v) {
  v = v - ((v >> 1u) & 0x55555555u);
  v = (v & 0x33333333u) + ((v >> 2u) & 0x33333333u);
  return (((v + (v >> 4u)) & 0x0F0F0F0Fu) * 0x01010101u) >> 24u;
}
uint dil(uint m) {
  uint h = m | ((m << 1u) & ~0x11111111u) | ((m >> 1u) & ~0x88888888u);
  return h | (h << 4u) | (h >> 4u);
}

int code(int X, int Y) {
  X = clamp(X, 0, int(uPts.x) - 1);
  Y = clamp(Y, 0, int(uPts.y) - 1);
  return int(texelFetch(uP, ivec2(X, int(uPts.y) - 1 - Y), 0).r * 255.0 + 0.5);
}

// Ce qui mérite un trait, par ordre d'importance
int prio(int m) {
  if (m == 12) return 7;                  // le soleil
  if (m == 6 || m == 7) return 6;         // la bombe, sa mèche
  if (m == 5 || m == 3) return 5;         // la passerelle, le ponton
  if (m == 4) return 4;                   // les flotteurs
  return 0;
}
// La frontière entre deux points : 0 si elle ne se dessine pas ; sinon son importance, et son genre
int paire(int c1, int c2, out int genre) {
  genre = 0;
  if (c1 == c2) return 0;
  int m1 = c1 >> 2, m2 = c2 >> 2;
  if (m1 == 63 || m2 == 63 || m1 == 8 || m2 == 8 || m1 == 9 || m2 == 9 || m1 == 10 || m2 == 10) return 0;
  if (m1 == m2) {                          // l'arête d'une même chose : le bord du ponton, de la passerelle
    if (m1 == 3 || m1 == 5) { genre = m1; return 5; }
    return 0;
  }
  int p1 = prio(m1), p2 = prio(m2);
  if (p1 > 0 || p2 > 0) { genre = p1 >= p2 ? m1 : m2; return max(p1, p2); }
  if ((m1 == 1 && m2 == 2) || (m1 == 2 && m2 == 1)) { genre = 20; return 3; }   // la rive
  if ((m1 == 0 && m2 == 2) || (m1 == 2 && m2 == 0)) { genre = 21; return 2; }   // l'horizon sur l'eau
  if ((m1 == 0 && m2 == 1) || (m1 == 1 && m2 == 0)) { genre = 22; return 2; }   // l'horizon sur la terre
  return 0;
}
vec3 couleurTrait(int genre) {
  if (genre == 12) return SOLEIL;
  if (genre == 6 || genre == 7) return CRAIE;
  if (genre == 3 || genre == 5) return BLEU;
  if (genre == 4) return BLEU * 0.7;
  if (genre == 20) return ROUGE * 0.9;
  if (genre == 21) return vec3(0.95, 0.78, 0.62) * 0.45;
  return ROUGE * 0.5;
}

void main() {
  ivec2 ci = ivec2(gl_FragCoord.xy);
  int row = int(uGrid.y) - 1 - ci.y;
  int X0 = ci.x * 4, Y0 = row * 8;
  vec2 cc = uOrig + (vec2(float(ci.x), float(row)) + 0.5) * uCellPx;

  uint E = 0u;
  int best = 0, genre = 0;
  int nGens = 0, nJoueur = 0, nTete = 0, nCorps = 0, nJambes = 0, nEtinc = 0, nEclat = 0, nSoleil = 0, nCaillou = 0, nSol = 0, nReflet = 0;
  float lumGens = 0.0;
  for (int y = 0; y < 8; y++) {
    for (int x = 0; x < 4; x++) {
      int X = X0 + x, Y = Y0 + y;
      vec4 s = texelFetch(uP, ivec2(X, int(uPts.y) - 1 - Y), 0);
      int c = int(s.r * 255.0 + 0.5);
      int m = c >> 2, f = c & 3;
      int g1, g2;
      int a = paire(c, code(X + 1, Y), g1);
      int b = paire(c, code(X, Y + 1), g2);
      if (a > 0 || b > 0) {
        E |= 1u << uint(y * 4 + x);
        if (a > best) { best = a; genre = g1; }
        if (b > best) { best = b; genre = g2; }
      }
      if (m == 9 || m == 10) {
        nGens++; if (m == 10) nJoueur++;
        if (f == 0) nTete++; else if (f == 1) nCorps++; else nJambes++;
        lumGens += s.g;
      }
      else if (m == 8) nEtinc++;
      else if (m == 6 && s.b > 0.55) nEclat++;
      else if (m == 12) nSoleil++;
      else if (m == 1) { nSol++; if (s.b > 0.5) nCaillou++; }
      else if (m == 2 && s.b > 0.35) nReflet++;
    }
  }

  int g = 0;
  vec3 col = vec3(0.0);
  if (nEtinc > 0) {                                   // l'étincelle, qui crépite
    g = uBlink > 0.5 ? 6 : 5;
    col = vec3(1.0, 0.58, 0.22) * (0.8 + 0.2 * uBlink);
  } else if (nGens >= 4) {                            // une tête « o », un corps « # », des jambes « | »
    bool joueur = nJoueur * 2 >= nGens;
    float l = lumGens / float(nGens);
    if (nTete >= nCorps && nTete >= nJambes) g = joueur ? 9 : (l > 0.55 ? 19 : 18);
    else if (nCorps >= nJambes) g = (l < 0.3 && !joueur) ? 2 : 7;
    else g = 10;
    col = joueur ? DORE : CRAIE * (0.45 + 0.35 * l);
  } else if (pc(E) >= 2u) {                           // un contour : le caractère qui lui ressemble le plus
    uint Ed = dil(E);
    float nE = float(pc(E));
    float meilleur = 0.0;
    for (int k = 0; k < 16; k++) {
      if (k >= uNC) break;
      uint G = uMask[k];
      float P = float(pc(G & Ed)) / max(float(pc(G)), 1.0);
      float R = float(pc(E & dil(G))) / nE;
      float F = 2.0 * P * R / max(P + R, 1e-4) + uBonus[k];
      if (F > meilleur) { meilleur = F; g = uGl[k]; }
    }
    if (meilleur < 0.3) g = 0;
    col = couleurTrait(genre);
  } else if (nEclat >= 2) {                           // l'éclat sur la bombe
    g = 9; col = CRAIE;
  } else if (nSoleil >= 20) {                         // le cœur du soleil
    g = 19; col = SOLEIL;
  } else if (nReflet >= 6 && hash12(vec2(ci) + floor(uT * 3.0)) < 0.3) {    // le soleil sur l'eau, quelques éclats
    g = 3;
    col = vec3(1.0, 0.88, 0.76) * 0.6;
  } else if (nCaillou > 0 && nSol > 16) {             // un caillou sur la rive
    g = hash12(vec2(ci)) < 0.5 ? 1 : 15;
    col = ROUGE * 0.5;
  }

  // Sous les sous-titres, l'image s'efface
  if (uBand.z > 0.0 && cc.y > uBand.x) {
    float k = 1.0 - uBand.z * smoothstep(uBand.x, uBand.x + 0.35 * (uBand.y - uBand.x), cc.y);
    if (hash12(vec2(ci) + 4.2) > k) g = 0;
    col *= k;
  }
  // Apparition et disparition : les caractères arrivent un par un
  if (hash12(vec2(ci) * 1.37 + 0.5) > uFade * 1.08 - 0.04) g = 0;
  o = vec4(col, float(g) / 255.0);
}`;

// ---------------------------------------------------------------------------
// Passe 3 : les caractères à l'écran
const FS_GLYPHES = `#version 300 es
precision highp float;
uniform sampler2D uS;       // les cases
uniform sampler2D uA;       // l'atlas des caractères
uniform vec2 uView;         // taille de l'écran, en pixels
uniform vec2 uCell, uOrig, uGrid;
uniform vec4 uAtl;          // largeur d'un emplacement, d'un caractère, marge, largeur de l'atlas
uniform vec3 uBg;
out vec4 o;

void main() {
  vec2 p = vec2(gl_FragCoord.x, uView.y - gl_FragCoord.y);
  vec2 q = (p - uOrig) / uCell;
  vec2 dx = dFdx(q), dy = dFdy(q);
  vec3 col = uBg;
  if (all(greaterThanEqual(q, vec2(0.0))) && all(lessThan(q, uGrid))) {
    ivec2 c = ivec2(floor(q));
    vec4 d = texelFetch(uS, ivec2(c.x, int(uGrid.y) - 1 - c.y), 0);
    float g = floor(d.a * 255.0 + 0.5);
    if (g > 0.5) {
      vec2 f = q - vec2(c);
      float s = uAtl.y / uAtl.w;
      vec2 uv = vec2((g * uAtl.x + uAtl.z) / uAtl.w + f.x * s, f.y);
      col += d.rgb * textureGrad(uA, uv, vec2(dx.x * s, dx.y), vec2(dy.x * s, dy.y)).r;
    }
  }
  o = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
  return s;
}
function programme(gl, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VS));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i);
    u[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, info.name);
  }
  return { p, u };
}

// L'atlas : chaque caractère dans un emplacement de GW × GH pixels, avec une marge.
// On en tire aussi le dessin de chaque caractère de trait, sur 4 × 8 points.
const GW = 48, GH = 96, PAD = 8, SW = GW + 2 * PAD;
function atlas(gl, police) {
  const cv = document.createElement('canvas');
  cv.width = SW * GLYPHES.length;
  cv.height = GH;
  const c = cv.getContext('2d', { willReadFrequently: true });
  c.fillStyle = '#000';
  c.fillRect(0, 0, cv.width, cv.height);
  c.fillStyle = '#fff';
  c.textAlign = 'center';
  c.textBaseline = 'alphabetic';
  c.font = `400 ${GW / 0.6}px ${police}`;
  const m = c.measureText('Hg');
  const asc = m.fontBoundingBoxAscent || GH * 0.78, desc = m.fontBoundingBoxDescent || GH * 0.22;
  const base = (GH - (asc + desc)) / 2 + asc;
  GLYPHES.forEach((g, k) => c.fillText(g, k * SW + SW / 2, base));

  const masques = TRAITS.map((t) => {
    const k = GLYPHES.indexOf(t);
    const px = c.getImageData(k * SW + PAD, 0, GW, GH).data;
    let bits = 0;
    for (let y = 0; y < SY; y++) {
      for (let x = 0; x < SX; x++) {
        let s = 0, n = 0;
        for (let yy = Math.floor(y * GH / SY); yy < Math.floor((y + 1) * GH / SY); yy++) {
          for (let xx = Math.floor(x * GW / SX); xx < Math.floor((x + 1) * GW / SX); xx++) { s += px[(yy * GW + xx) * 4]; n++; }
        }
        if (s / n / 255 > 0.12) bits |= 1 << (y * SX + x);
      }
    }
    return { k, bits: bits >>> 0, bonus: SIMPLES.has(t) ? 0.08 : 0 };
  });

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return { tex, w: cv.width, masques };
}

function grille(gl) {
  const tex = gl.createTexture();
  const fb = gl.createFramebuffer();
  return {
    tex, fb, w: 0, h: 0,
    taille(w, h) {
      w = Math.max(1, w); h = Math.max(1, h);
      if (w === this.w && h === this.h) return;
      this.w = w; this.h = h;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
  };
}

/* canvas : la toile ; police : la pile CSS de la police (déjà chargée).
   Renvoie { taille(m), dessiner(e) } ; m et e sont décrits dans essai.js. */
export function creerRendu(canvas, police) {
  const gl = canvas.getContext('webgl2', { antialias: false, depth: false, stencil: false, alpha: false, preserveDrawingBuffer: true });
  if (!gl) throw new Error('WebGL2 indisponible');
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const pp = programme(gl, FS_POINTS);
  const pc = programme(gl, FS_CASES);
  const pg = programme(gl, FS_GLYPHES);
  const at = atlas(gl, police);
  const points = grille(gl), cases = grille(gl);
  const NC = at.masques.length;
  const masques = new Uint32Array(16), indices = new Int32Array(16), bonus = new Float32Array(16);
  at.masques.forEach((m, i) => { masques[i] = m.bits; indices[i] = m.k; bonus[i] = m.bonus; });
  let M = null;

  function taille(m) {
    M = m;
    canvas.width = Math.round(m.W * m.dpr);
    canvas.height = Math.round(m.H * m.dpr);
    points.taille(m.cols * SX, m.rows * SY);
    cases.taille(m.cols, m.rows);
  }

  function dessiner(e) {
    if (!M) return;
    const d = M.dpr;

    // 1. la scène, point par point
    gl.useProgram(pp.p);
    let u = pp.u;
    gl.bindFramebuffer(gl.FRAMEBUFFER, points.fb);
    gl.viewport(0, 0, M.cols * SX, M.rows * SY);
    gl.uniform2f(u.uPts, M.cols * SX, M.rows * SY);
    gl.uniform2f(u.uPtPx, M.cw * d / SX, M.ch * d / SY);
    gl.uniform2f(u.uOrig, M.ox * d, M.oy * d);
    gl.uniform4f(u.uRect, M.rect.x * d, M.rect.y * d, M.rect.w * d, M.rect.h * d);
    gl.uniform3f(u.uProj, M.proj.x * d, M.proj.y * d, M.proj.s * d);
    gl.uniform1f(u.uT, e.T);
    gl.uniform3fv(u.uCamPos, e.cam.p);
    gl.uniform3fv(u.uCamTgt, e.cam.t);
    gl.uniform1f(u.uFocal, e.focal);
    gl.uniform4f(u.uPlayer, e.joueur.x, e.joueur.y, e.joueur.z, e.joueur.cap);
    gl.uniform2f(u.uWalk, e.joueur.marche, e.joueur.phase);
    gl.uniform1f(u.uMist, e.brume);
    gl.uniform3fv(u.uSun, e.soleil);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 2. un caractère par case
    gl.useProgram(pc.p);
    u = pc.u;
    gl.bindFramebuffer(gl.FRAMEBUFFER, cases.fb);
    gl.viewport(0, 0, M.cols, M.rows);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, points.tex); gl.uniform1i(u.uP, 0);
    gl.uniform2f(u.uGrid, M.cols, M.rows);
    gl.uniform2f(u.uPts, M.cols * SX, M.rows * SY);
    gl.uniform2f(u.uCellPx, M.cw * d, M.ch * d);
    gl.uniform2f(u.uOrig, M.ox * d, M.oy * d);
    const b = M.bande;
    gl.uniform3f(u.uBand, b ? b.y0 * d : 0, b ? b.y1 * d : 0, b ? b.force : 0);
    gl.uniform1f(u.uFade, e.fondu);
    gl.uniform1f(u.uT, e.T);
    gl.uniform1f(u.uBlink, e.etincelle);
    gl.uniform1uiv(u.uMask, masques);
    gl.uniform1iv(u.uGl, indices);
    gl.uniform1fv(u.uBonus, bonus);
    gl.uniform1i(u.uNC, NC);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 3. les caractères
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(pg.p);
    u = pg.u;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, cases.tex); gl.uniform1i(u.uS, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, at.tex); gl.uniform1i(u.uA, 1);
    gl.uniform2f(u.uView, canvas.width, canvas.height);
    gl.uniform2f(u.uCell, M.cw * d, M.ch * d);
    gl.uniform2f(u.uOrig, M.ox * d, M.oy * d);
    gl.uniform2f(u.uGrid, M.cols, M.rows);
    gl.uniform4f(u.uAtl, SW, GW, PAD, at.w);
    gl.uniform3f(u.uBg, 12 / 255, 11 / 255, 13 / 255);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  return { taille, dessiner };
}
