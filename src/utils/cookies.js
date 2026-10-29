export const CONSENT_COOKIE = "stiles_cookie_consent";
export const SESSION_COOKIE = "stiles_session";
export const PREFERENCE_COOKIE = "stiles_preferences";
export const ANALYTICS_COOKIE = "stiles_analytics";
export const MARKETING_COOKIE = "stiles_marketing";

export const DEFAULT_CONSENT = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

const ONE_YEAR = 365 * 24 * 60 * 60;

export const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
};

export const setCookie = (name, value, maxAgeSeconds = ONE_YEAR) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
};

export const deleteCookie = (name) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

export const getConsent = () => {
  const raw = getCookie(CONSENT_COOKIE);
  if (!raw) return null;
  try {
    return { ...DEFAULT_CONSENT, ...JSON.parse(raw) };
  } catch {
    return null;
  }
};

const randomId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const applyConsent = (consent) => {
  const next = { ...DEFAULT_CONSENT, ...consent, necessary: true };
  setCookie(CONSENT_COOKIE, JSON.stringify(next));

  if (!getCookie(SESSION_COOKIE)) {
    setCookie(SESSION_COOKIE, randomId());
  }

  if (next.preferences) {
    setCookie(
      PREFERENCE_COOKIE,
      JSON.stringify({ lastVisit: new Date().toISOString() })
    );
  } else {
    deleteCookie(PREFERENCE_COOKIE);
  }

  if (next.analytics) {
    if (!getCookie(ANALYTICS_COOKIE)) {
      setCookie(ANALYTICS_COOKIE, randomId());
    }
  } else {
    deleteCookie(ANALYTICS_COOKIE);
  }

  if (next.marketing) {
    if (!getCookie(MARKETING_COOKIE)) {
      setCookie(MARKETING_COOKIE, randomId());
    }
  } else {
    deleteCookie(MARKETING_COOKIE);
  }

  return next;
};

export const OPEN_COOKIE_SETTINGS_EVENT = "stiles:open-cookie-settings";

export const openCookieSettings = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT));
};
