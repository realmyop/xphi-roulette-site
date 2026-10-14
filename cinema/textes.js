/* ==========================================================================
   Les textes du film, lus dans ../i18n/fr.json : un seul fichier pour relire,
   corriger et traduire, sans toucher au code. Une réplique qui contient {nom}
   devient une fonction : t(c) remplace {nom} par c.nom (ou par c lui-même).
   ========================================================================== */
const gabarit = (s) =>
  /\{\w+\}/.test(s) ? (c) => s.replace(/\{(\w+)\}/g, (_, k) => (c && typeof c === 'object' ? c[k] : c)) : s;
export const prepare = (v) =>
  typeof v === 'string' ? gabarit(v)
    : Array.isArray(v) ? v.map(prepare)
      : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, prepare(x)]))
        : v;

export async function chargeTextes(langue = 'fr') {
  const r = await fetch(new URL(`../i18n/${langue}.json`, import.meta.url));
  if (!r.ok) throw new Error(`Textes « ${langue} » introuvables`);
  return prepare(await r.json());
}
