/* ==========================================================================
   Trois façons de dessiner par une machine : la planche de comparaison.

   Ronan, après l'essai en caractères : « toujours pas très clair. On aurait
   quoi comme autre option qui fasse dessiner par un robot sans que ce soit de
   l'ASCII ? » Trois pistes, sur la même image, calculée de la même scène 3D
   (celle de mockups/ascii/) :
     0  le traceur      un robot qui dessine au stylo : contours, hachures,
                        un stylo par couleur ; l'œil de Phi est la tête du traceur
     1  le pictogramme  des aplats sans détail, le langage des notices
     2  le scan         le monde tel qu'un robot le perçoit : un relevé laser

   Deux passes WebGL2 par image :
   1. la scène, pixel par pixel : ce que touche le rayon (matière, face), sa
      lumière (soleil rasant, ombres portées), sa profondeur, et un repère
      propre au style (l'éclat de la bombe, le reflet du soleil, un point du scan) ;
   2. le dessin : contours et hachures, aplats, ou points.

   Paramètres : ?style=traceur|picto|scan (une seule, plein écran) ; ?gel=11 (fige
   l'horloge, pour les captures).
   ========================================================================== */

const params = new URLSearchParams(location.search);
const GEL = params.has('gel') ? parseFloat(params.get('gel')) || 0 : null;
const SEUL = { traceur: 0, picto: 1, scan: 2 }[params.get('style')];

const VS = `#version 300 es
void main() {
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

// ---------------------------------------------------------------------------
// Passe 1 : la scène (la même que l'essai en caractères)
const FS_SCENE = `#version 300 es
precision highp float;
precision highp int;

uniform int uStyle;
uniform vec2 uRes;
uniform float uT;
uniform vec3 uCamPos;
uniform vec3 uCamTgt;
uniform float uFocal;
uniform vec3 uSun;
uniform vec3 uScan;         // la position du scanner (style 2)
uniform vec4 uPlayer;       // le joueur : x, y (sol), z, cap
out vec4 o;

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

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
float sdRBox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float sdCap(vec3 p, vec3 a, vec3 b, float r) { vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
float sdCylX(vec3 p, float r, float h) { vec2 d = abs(vec2(length(p.yz), p.x)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
float sdCylY(vec3 p, float r, float h) { vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }

const vec3 PONT = vec3(-4.0, 0.0, 0.0);
const float DECK = 0.48;
const float FX = 1.05, FZ0 = -29.0, FDZ = 1.5, FN = 21.0, PC = 20.0;   // la file de gens, la place du joueur

float shoreX(float z) { return 0.32 * sin(z * 0.23 + 0.7); }
float landH(vec2 q) {
  float s = q.x - shoreX(q.y);
  return 0.30 * smoothstep(-0.9, 1.2, s) - 0.6 * (1.0 - smoothstep(-3.0, -0.6, s));
}
float bob() { return 0.025 * sin(uT * 0.9); }

float person(vec3 p) {
  float d = sdCap(p, vec3(0.0, 0.06, 0.085), vec3(0.0, 0.80, 0.075), 0.068);
  d = min(d, sdCap(p, vec3(0.0, 0.06, -0.085), vec3(0.0, 0.80, -0.075), 0.068));
  d = smin(d, sdRBox(p - vec3(0.0, 1.10, 0.0), vec3(0.10, 0.25, 0.19), 0.09), 0.06);
  d = min(d, min(sdCap(p, vec3(0.0, 1.30, 0.235), vec3(0.0, 0.84, 0.25), 0.055),
                 sdCap(p, vec3(0.0, 1.30, -0.235), vec3(0.0, 0.84, -0.25), 0.055)));
  return smin(d, length(p - vec3(0.0, 1.56, 0.0)) - 0.115, 0.05);
}
vec3 place(float k) {
  float z = FZ0 + k * FDZ + (hash12(vec2(k, 3.1)) - 0.5) * 0.25;
  float x = FX + (hash12(vec2(k, 7.7)) - 0.5) * 0.3;
  return vec3(x, landH(vec2(x, z)), z);
}
vec2 crowd(vec3 p) {
  float bb = sdBox(p - vec3(FX, 0.95, FZ0 + 0.5 * FN * FDZ), vec3(0.7, 1.05, 0.5 * FN * FDZ + 0.6));
  if (bb > 0.3) return vec2(bb, -1.0);
  float k = clamp(floor((p.z - FZ0) / FDZ + 0.5), 0.0, FN);
  float bd = (0.5 - abs((p.z - FZ0) / FDZ - k)) * FDZ;
  if (k == PC) return vec2(max(bd, 0.0) + 0.05, -1.0);
  vec3 lp = p - place(k);
  lp.xz = rot((hash12(vec2(k, 9.3)) - 0.5) * 0.5) * lp.xz;
  float s = 0.9 + 0.17 * hash12(vec2(k, 17.0));
  float d = person(lp / s) * s;
  if (bd >= 0.0) d = min(d, bd + 0.05);
  return vec2(d, k);
}
float playerD(vec3 p) {
  float bs = length(p - uPlayer.xyz - vec3(0.0, 0.9, 0.0)) - 1.1;
  if (bs > 0.3) return bs;
  vec3 lp = p - uPlayer.xyz;
  lp.xz = rot(uPlayer.w) * lp.xz;
  return person(lp);
}
vec2 pontoon(vec3 p) {
  vec3 q = p - PONT;
  q.y -= bob();
  float bb = sdBox(q - vec3(0.0, 1.0, 0.0), vec3(2.1, 1.6, 2.1));
  if (bb > 0.3) return vec2(bb, M_PONT);
  vec2 r = vec2(sdBox(q - vec3(0.0, DECK - 0.07, 0.0), vec3(1.9, 0.07, 1.9)), M_PONT);
  float fl = min(sdCylX(q - vec3(0.0, 0.17, 1.25), 0.27, 1.85), sdCylX(q - vec3(0.0, 0.17, -1.25), 0.27, 1.85));
  if (fl < r.x) r = vec2(fl, M_FLOT);
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
vec3 mapScene(vec3 p) {
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
vec4 march(vec3 ro, vec3 rd, float tmax) {
  float t = 0.05;
  for (int i = 0; i < 120; i++) {
    vec3 h = mapScene(ro + rd * t);
    if (h.x < 0.0008 * t + 0.0008) return vec4(t, h.y, h.z, 1.0);
    t += h.x;
    if (t > tmax) break;
  }
  return vec4(tmax, 0.0, 0.0, 0.0);
}
vec3 nrm(vec3 p, float t) {
  float e = 0.0008 * t + 0.001;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * mapScene(p + k.xyy * e).x + k.yyx * mapScene(p + k.yyx * e).x +
                   k.yxy * mapScene(p + k.yxy * e).x + k.xxx * mapScene(p + k.xxx * e).x);
}
float ombre(vec3 ro, vec3 rd) {
  float res = 1.0, t = 0.05;
  for (int i = 0; i < 40; i++) {
    float h = mapScene(ro + rd * t).x;
    res = min(res, 12.0 * h / t);
    t += clamp(h, 0.03, 0.8);
    if (res < 0.01 || t > 25.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

// Le scan : un point si le rayon tombe sur un nœud de la grille du scanner (angles
// réguliers vus depuis sa position), et si le scanner voit ce point
float scanPoint(vec3 p, vec3 n, float t, float mat) {
  vec3 v = p - uScan;
  float r = length(v);
  vec3 d = v / r;
  float phi = asin(clamp(d.y, -1.0, 1.0)), th = atan(d.z, d.x);
  const float dA = 0.0055;                 // un tiers de degré entre deux points
  vec2 cell = vec2(floor(th / dA + 0.5), floor(phi / dA + 0.5));
  vec2 j = (vec2(hash12(cell + 1.3), hash12(cell + 7.1)) - 0.5) * 0.6;   // un léger désordre : pas de moiré
  vec2 f = vec2((th / dA - cell.x - j.x) * dA * cos(phi), (phi / dA - cell.y - j.y) * dA);
  float px = length(f) * r / max(t / (uFocal * 0.5 * uRes.x), 1e-6);   // en pixels
  float dotv = 1.0 - smoothstep(0.55, 1.35, px);
  if (dotv <= 0.0) return 0.0;
  if (mat == M_EAU && hash12(cell) < 0.82) return 0.0;                 // l'eau renvoie peu
  vec3 toS = uScan - p;
  float L = length(toS);
  vec3 ds = toS / L;
  float tt = 0.06;
  for (int i = 0; i < 60; i++) {
    float hh = mapScene(p + n * 0.03 + ds * tt).x;
    if (hh < 0.002) return 0.0;            // caché du scanner : l'ombre du relevé
    tt += hh;
    if (tt > L) break;
  }
  return dotv * (0.35 + 0.65 * max(dot(n, -d), 0.0)) * (1.0 - smoothstep(30.0, 80.0, r));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * uRes.x);
  vec3 ro = uCamPos;
  vec3 fw = normalize(uCamTgt - ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  vec3 rd = normalize(uv.x * rt + uv.y * up + uFocal * fw);
  float tw = rd.y < 0.0 ? -ro.y / rd.y : 1e9;
  vec4 h = march(ro, rd, min(tw, 170.0));
  float mat = M_CIEL, face = 0.0, lum = 0.0, extra = 0.0, t = 1e9;
  if (h.w > 0.5) {
    t = h.x;
    mat = h.y;
    vec3 p = ro + rd * t;
    vec3 n = nrm(p, t);
    float dif = max(dot(n, uSun), 0.0);
    float sh = dif > 0.01 ? ombre(p + n * 0.03, uSun) : 0.0;
    lum = clamp(0.62 * dif * sh + 0.28 * max(dot(n, -rd), 0.0) + 0.12 * (0.5 + 0.5 * n.y), 0.0, 1.0);
    if (mat == M_PONT || mat == M_PASS) face = n.y > 0.6 ? 1.0 : 2.0;
    if (mat == M_GENS || mat == M_JOUEUR) face = 1.0 + h.z - 3.0 * floor(h.z / 3.0);   // de quoi séparer deux voisins
    if (mat == M_BOMBE) {
      vec3 rr = reflect(rd, n);
      extra = max(pow(max(dot(rr, uSun), 0.0), 14.0), pow(max(dot(rr, normalize(vec3(0.3, 0.8, 0.5))), 0.0), 18.0));
    }
    if (uStyle == 2) extra = scanPoint(p, n, t, mat);
  } else if (tw < 1e8) {
    t = tw;
    mat = M_EAU;
    vec3 p = ro + rd * t;
    float sh = ombre(p + vec3(0.0, 0.02, 0.0), uSun);
    lum = 0.55 + 0.4 * sh;
    float w1 = sin(p.x * 1.6 + uT * 0.7 + 1.7 * sin(p.z * 0.6));
    float w2 = sin(p.z * 2.4 - uT * 0.9 + p.x * 0.5);
    vec3 n = normalize(vec3(0.012 * w1 + 0.006 * w2, 1.0, 0.02 * w2));
    extra = uStyle == 2 ? scanPoint(p, vec3(0.0, 1.0, 0.0), t, mat) : pow(max(dot(reflect(rd, n), uSun), 0.0), 1200.0);
  } else if (dot(rd, uSun) > 0.9993) {
    mat = M_SOLEIL;
  }
  o = vec4((mat * 4.0 + face) / 255.0, lum, clamp(t / 150.0, 0.0, 1.0), clamp(extra, 0.0, 1.0));
}`;

// ---------------------------------------------------------------------------
// Passe 2 : le dessin, selon le style
const FS_DESSIN = `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D uG;
uniform int uStyle;
uniform vec2 uRes;
uniform float uT;
uniform float uScale;       // pixels de l'écran par pixel CSS
out vec4 o;

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec4 G(ivec2 q) { return texelFetch(uG, clamp(q, ivec2(0), ivec2(uRes) - 1), 0); }
int codeDe(vec4 g) { return int(g.r * 255.0 + 0.5); }

// --- Le traceur : un stylo par couleur ---------------------------------------
const vec3 PAPIER = vec3(0.955, 0.940, 0.905);
const vec3 ENCRE = vec3(0.12, 0.13, 0.20);
const vec3 S_BLEU = vec3(0.14, 0.34, 0.82);
const vec3 S_ROUGE = vec3(0.80, 0.24, 0.19);
const vec3 S_OR = vec3(0.80, 0.53, 0.03);
const vec3 S_ORANGE = vec3(0.95, 0.42, 0.10);

int rang(int m) {               // quel stylo l'emporte sur un contour
  if (m == 10) return 9;
  if (m == 8) return 8;
  if (m == 6 || m == 7) return 7;
  if (m == 9) return 6;
  if (m == 3 || m == 4 || m == 5) return 5;
  if (m == 12) return 4;
  if (m == 1) return 3;
  if (m == 2) return 2;
  return 1;
}
vec3 stylo(int m) {
  if (m == 10) return S_OR;
  if (m == 8 || m == 12) return S_ORANGE;
  if (m == 3 || m == 4 || m == 5) return S_BLEU;
  if (m == 1) return S_ROUGE;
  return ENCRE;
}
// Une famille de traits parallèles : 1 sur le trait, 0 entre deux traits
float hachure(vec2 p, vec2 n, float S, float w) {
  float d = abs(fract(dot(p, n) / S + 0.5) - 0.5) * S;
  return 1.0 - smoothstep(w * 0.5 - 0.45, w * 0.5 + 0.45, d);
}

vec3 traceur(ivec2 q, vec4 g, int c, int m) {
  vec2 p = gl_FragCoord.xy / uScale;
  vec2 dim = uRes / uScale;
  float tl = mod(uT, 15.0);                // le dessin se refait toutes les 15 s
  vec3 col = PAPIER * (0.985 + 0.015 * hash12(floor(p)));
  // Les hachures : plus c'est sombre, plus il y a de traits
  vec2 n1 = vec2(0.70711, 0.70711), n2 = vec2(0.70711, -0.70711);
  float d = 1.0 - g.g;
  float ink = 0.0;
  vec3 pen = stylo(m);
  if (m >= 3 && m <= 10 && m != 8) {
    if (d > 0.34) ink = max(ink, hachure(p, n1, 5.0, 1.0));
    if (d > 0.58) ink = max(ink, hachure(p, n2, 5.0, 1.0));
    if (d > 0.80) ink = max(ink, hachure(p, vec2(0.0, 1.0), 6.0, 1.0));
    if (m == 6 && g.a > 0.5) ink = 0.0;   // l'éclat de la bombe reste blanc
  }
  if (m == 1) ink = 0.5 * hachure(p, n1, 10.0, 0.9) * (0.4 + 0.6 * d);       // la rive : une hachure rouge légère
  if (m == 2) {                                                                 // des rides : des tirets d'un trait, plus serrés au loin
    float dz = g.b * 150.0;
    float v = log(max(dz, 0.5)) * 9.0;
    float trait = 1.0 - smoothstep(0.5, 1.5, abs(fract(v) - 0.5) / max(fwidth(v), 1e-4));
    float tiret = step(0.62, hash12(vec2(floor(p.x / (46.0 / (1.0 + dz * 0.06))), floor(v))));
    ink = 0.5 * trait * tiret * (1.0 - smoothstep(18.0, 45.0, dz));
    pen = ENCRE;
  }
  if (m == 2 && g.a > 0.3) {                                                    // le soleil sur l'eau : des tirets
    ink = hachure(p, vec2(0.0, 1.0), 4.0, 1.0) * step(0.5, fract(p.x / 10.0 + hash12(vec2(floor(p.y / 4.0), 1.0))));
    pen = S_ORANGE;
  }
  if (m == 8) { ink = 1.0; pen = S_ORANGE; }                                  // l'étincelle
  float tH = 3.2 + 6.0 * (p.x + p.y) / (dim.x + dim.y);                        // l'ordre des hachures
  if (tl < tH) ink = 0.0;
  col = mix(col, pen, ink * 0.88);
  // Les contours : partout où la matière change (ou une face, ou un voisin)
  int k = max(1, int(uScale + 0.5));
  int em = -1;
  for (int i = 0; i < 4; i++) {
    ivec2 off = i == 0 ? ivec2(k, 0) : (i == 1 ? ivec2(-k, 0) : (i == 2 ? ivec2(0, k) : ivec2(0, -k)));
    vec4 g2 = G(q + off);
    int c2 = codeDe(g2), m2 = c2 >> 2;
    bool trait = c2 != c && !(m == 0 && m2 == 0) && !(m == 1 && m2 == 1) && !(m == 2 && m2 == 2);
    if (trait) { int mm = rang(m2) > rang(m) ? m2 : m; if (em < 0 || rang(mm) > rang(em)) em = mm; }
  }
  if (em >= 0 && tl > 0.2 + 2.8 * p.x / dim.x) {
    float a = (em == 2 || em == 0) ? 0.45 : 0.95;                              // l'horizon, plus léger
    col = mix(col, stylo(em), a);
  }
  return col;
}

// --- Le pictogramme : des aplats ----------------------------------------------
const vec3 FOND = vec3(0.965, 0.955, 0.930);
vec3 aplat(int m, int f, float lum, float ex) {
  bool clair = lum > 0.55;
  if (m == 12) return vec3(0.98, 0.70, 0.22);
  if (m == 2) return vec3(0.80, 0.87, 0.93);
  if (m == 1) return clair ? vec3(0.88, 0.56, 0.46) : vec3(0.78, 0.45, 0.36);
  if (m == 3) return f == 1 ? vec3(0.27, 0.50, 0.92) : vec3(0.15, 0.32, 0.70);
  if (m == 4) return vec3(0.55, 0.62, 0.75);
  if (m == 5) return f == 1 ? vec3(0.42, 0.62, 0.96) : vec3(0.25, 0.42, 0.78);
  if (m == 6) return ex > 0.55 ? vec3(0.96) : vec3(0.11, 0.11, 0.13);
  if (m == 7) return vec3(0.33, 0.26, 0.20);
  if (m == 8) return vec3(0.98, 0.50, 0.10);
  if (m == 9) return vec3(0.22, 0.22, 0.27);
  if (m == 10) return vec3(0.93, 0.66, 0.10);
  return FOND;
}
vec3 picto(ivec2 q, vec4 g, int c, int m) {
  vec3 col = aplat(m, c & 3, g.g, g.a);
  // un liseré blanc entre deux objets, comme une étiquette découpée
  int k = max(1, int(1.6 * uScale + 0.5));
  for (int i = 0; i < 4; i++) {
    ivec2 off = i == 0 ? ivec2(k, 0) : (i == 1 ? ivec2(-k, 0) : (i == 2 ? ivec2(0, k) : ivec2(0, -k)));
    int c2 = codeDe(G(q + off)), m2 = c2 >> 2;
    bool objet2 = m2 >= 3 && m2 <= 10;
    if (c2 != c && objet2 && g.b > G(q + off).b) col = FOND;          // le liseré entoure l'objet le plus proche
  }
  return col;
}

// --- Le scan : des points ------------------------------------------------------
vec3 couleurPoint(int m) {
  if (m == 1) return vec3(0.95, 0.45, 0.36);
  if (m == 2) return vec3(0.45, 0.78, 0.88);
  if (m == 3 || m == 4) return vec3(0.38, 0.62, 1.00);
  if (m == 5) return vec3(0.52, 0.72, 1.00);
  if (m == 6 || m == 7) return vec3(0.86, 0.86, 0.92);
  if (m == 8) return vec3(1.00, 0.55, 0.15);
  if (m == 9) return vec3(0.86, 0.88, 0.93);
  if (m == 10) return vec3(1.00, 0.78, 0.25);
  return vec3(0.0);
}
vec3 scan(ivec2 q, vec4 g, int c, int m) {
  vec3 col = vec3(0.020, 0.025, 0.040);
  return col + couleurPoint(m) * g.a * 1.2;
}

void main() {
  ivec2 q = ivec2(gl_FragCoord.xy);
  vec4 g = G(q);
  int c = codeDe(g), m = c >> 2;
  vec3 col = uStyle == 0 ? traceur(q, g, c, m) : (uStyle == 1 ? picto(q, g, c, m) : scan(q, g, c, m));
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
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
  return { p, u };
}

// La même image pour les trois : le ponton et sa bombe, la file, la rive, le soleil
const CAM = { p: [5.5, 3.0, 13.5], t: [-2.2, 1.2, -2.0] };
const SOLEIL = (() => { const el = 0.07, n = Math.hypot(0.62, el, 0.78); return [-0.62 / n, el / n, -0.78 / n]; })();
const SHORE = (z) => 0.32 * Math.sin(z * 0.23 + 0.7);
const JOUEUR = (() => {
  const x = 1.05, z = 1.0, s = x - SHORE(z), ss = (a, b, v) => { const k = Math.min(1, Math.max(0, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
  return [x, 0.30 * ss(-0.9, 1.2, s) - 0.6 * (1 - ss(-3.0, -0.6, s)), z, 0];
})();

function panneau(section) {
  const style = +section.dataset.style;
  const canvas = section.querySelector('canvas');
  const gl = canvas.getContext('webgl2', { antialias: false, depth: false, stencil: false, alpha: false, preserveDrawingBuffer: true });
  if (!gl) { section.querySelector('.cadre').classList.add('sans-gl'); return null; }
  gl.bindVertexArray(gl.createVertexArray());
  const ps = programme(gl, FS_SCENE), pd = programme(gl, FS_DESSIN);
  const tex = gl.createTexture(), fb = gl.createFramebuffer();
  let W = 0, H = 0, scale = 1;
  const tete = section.querySelector('.tete');
  const oeil = tete && window.XphiOeil ? window.XphiOeil.create(tete, { small: true }) : null;

  function taille() {
    const r = canvas.getBoundingClientRect();
    scale = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(2, Math.round(r.width * scale)), h = Math.max(2, Math.round(r.height * scale));
    if (w === W && h === H) return;
    W = w; H = h;
    canvas.width = W; canvas.height = H;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // La tête du traceur : l'œil de Phi suit la plume (mêmes horaires que le shader)
  function plume(tl, w, h) {
    if (tl < 0.2) return { x: 0.04 * w, y: 0.5 * h, dessine: false };
    if (tl < 3.0) { const u = (tl - 0.2) / 2.8; return { x: u * w, y: h * (0.5 + 0.2 * Math.sin(tl * 7)), dessine: true }; }
    if (tl < 9.2) {
      const s = ((tl - 3.2) / 6) * (w + h);                // la ligne x + y = s (repère du shader, y vers le haut)
      const x0 = Math.max(0, s - h), x1 = Math.min(w, s);
      const x = x0 + (x1 - x0) * (0.5 + 0.5 * Math.sin(tl * 5));
      return { x, y: h - (s - x), dessine: true };
    }
    return { x: 0.93 * w, y: 0.85 * h, dessine: false };
  }

  function dessiner(T) {
    taille();
    const cam = {
      p: [CAM.p[0] + 0.35 * Math.sin(T * 0.071), CAM.p[1] + 0.1 * Math.sin(T * 0.053), CAM.p[2] + 0.3 * Math.sin(T * 0.047)],
      t: CAM.t,
    };
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.viewport(0, 0, W, H);
    gl.useProgram(ps.p);
    let u = ps.u;
    gl.uniform1i(u.uStyle, style);
    gl.uniform2f(u.uRes, W, H);
    gl.uniform1f(u.uT, T);
    gl.uniform3fv(u.uCamPos, cam.p);
    gl.uniform3fv(u.uCamTgt, cam.t);
    gl.uniform1f(u.uFocal, 1.8);
    gl.uniform3fv(u.uSun, SOLEIL);
    gl.uniform3f(u.uScan, 7.5, 2.2, 8.5);
    gl.uniform4fv(u.uPlayer, JOUEUR);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.useProgram(pd.p);
    u = pd.u;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(u.uG, 0);
    gl.uniform1i(u.uStyle, style);
    gl.uniform2f(u.uRes, W, H);
    gl.uniform1f(u.uT, T);
    gl.uniform1f(u.uScale, scale);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (oeil) {
      const w = W / scale, h = H / scale, pl = plume(T % 15, w, h);
      tete.style.left = `${pl.x}px`;
      tete.style.top = `${pl.y}px`;
      oeil.draw(T, { expr: pl.dessine ? 'curieux' : 'neutre', look: pl.dessine ? { x: 0, y: 3 } : null });
    }
  }
  return { section, dessiner };
}

const sections = [...document.querySelectorAll('.style')].filter((s) => SEUL === undefined || +s.dataset.style === SEUL);
if (SEUL !== undefined) {
  document.body.classList.add('seul');
  sections[0]?.classList.add('actif');
}
const panneaux = sections.map(panneau).filter(Boolean);
const visibles = new Set(panneaux);
if ('IntersectionObserver' in window && GEL === null) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const p = panneaux.find((x) => x.section === e.target);
    if (p) { if (e.isIntersecting) visibles.add(p); else visibles.delete(p); }
  }));
  panneaux.forEach((p) => io.observe(p.section));
}

const t0 = performance.now();
let images = 0;
function boucle(now) {
  const T = GEL !== null ? GEL : (now - t0) / 1000;
  (GEL !== null ? panneaux : [...visibles]).forEach((p) => p.dessiner(T));
  if (GEL !== null) {
    if (++images === 2) document.title = 'ready';
    if (images < 2) requestAnimationFrame(boucle);
    return;
  }
  requestAnimationFrame(boucle);
}
requestAnimationFrame(boucle);
