let cached = null;
let cachedAt = 0;
let inflight = null;

const TTL_MS = 5 * 60 * 1000;
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-promos.php`;

function normalizePromoName(name) {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase();
}

export async function getUniquePromoBadgeVisibilityMap() {
  const now = Date.now();
  if (cached && now - cachedAt < TTL_MS) return cached;
  if (inflight) return inflight;

  inflight = fetch(API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data?.success || !Array.isArray(data?.promos)) return null;

      const visibility = new Map();
      data.promos.forEach((p) => {
        // show_badge is independent from has_page
        // If show_badge is missing (older rows), default to showing the badge.
        const isEnabled =
          p?.show_badge === 1 ||
          p?.show_badge === '1' ||
          p?.show_badge === true ||
          p?.show_badge === undefined ||
          p?.show_badge === null;
        const key = normalizePromoName(p?.promo);
        if (key) visibility.set(key, !!isEnabled);
      });

      cached = visibility;
      cachedAt = Date.now();
      return cached;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function filterBadgesByUniquePromoBadgeVisibility(badges, visibilityMap) {
  if (!Array.isArray(badges)) return [];
  if (!visibilityMap) return badges;
  return badges.filter((b) => {
    const key = normalizePromoName(b);
    if (!key) return false;
    if (!visibilityMap.has(key)) return true; // not managed by Unique Promos, keep as-is
    return visibilityMap.get(key) === true; // managed: only keep if enabled
  });
}

