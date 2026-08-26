/* eslint-disable no-restricted-syntax, no-continue */
// Shared Wikipedia URL normalisation, extracted from the tools/ scripts so the
// scheduled Lambda and the local scripts agree on how links are deduped.

function normalisedKey(lang, title) {
  return `${lang}::${title.toLowerCase()}`;
}

// Turn a Map<url, occurrences> of raw Wikipedia URLs into a deduped, sorted
// list of { url, title, lang, occurrences } entries.
function normaliseEntries(countsMap) {
  const mergedMap = new Map();

  for (const [rawUrl, rawOccurrences] of countsMap.entries()) {
    const occurrences = Number(rawOccurrences) || 0;

    let urlObj;
    try { urlObj = new URL(rawUrl); } catch (e) { continue; }

    const { hostname } = urlObj;
    if (!hostname.includes('wikipedia.org')) continue;

    const { pathname } = urlObj;
    if (!pathname.startsWith('/wiki/')) continue;
    if (pathname.includes('Special:') || pathname.includes('Sp%C3%A9cial:')) continue;
    if (pathname === '/wiki/Main_Page' || pathname === '/wiki/') continue;

    // Normalise: strip mobile subdomain, extract lang
    const lang = hostname
      .replace(/^en\.m\./, 'en.')
      .replace(/^fr\.m\./, 'fr.')
      .replace(/^([a-z]{2})\.wikipedia\.org$/, '$1');

    let title = decodeURIComponent(pathname.replace('/wiki/', '')).replace(/_/g, ' ');
    title = title.split('#')[0].trim();
    if (!title) continue;

    const key = normalisedKey(lang, title);
    if (mergedMap.has(key)) {
      mergedMap.get(key).occurrences += occurrences;
    } else {
      mergedMap.set(key, {
        url: rawUrl, title, lang, occurrences,
      });
    }
  }

  return Array.from(mergedMap.values()).sort((a, b) => b.occurrences - a.occurrences);
}

module.exports = { normaliseEntries, normalisedKey };
