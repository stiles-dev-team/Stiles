import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  applyConsent,
  getConsent,
} from "../utils/cookies";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getConsent();
    if (existing) {
      applyConsent(existing);
      setVisible(false);
    } else {
      setVisible(true);
    }

    const openSettings = () => setVisible(true);

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  const save = (consent) => {
    applyConsent(consent);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black text-white">
      <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
        <p className="text-sm md:text-base leading-relaxed flex-1">
          We use cookies to run this website, remember your preferences, and
          improve your experience. You can accept all cookies or continue with
          necessary cookies only. Read our{" "}
          <Link to="/cookie-policy" className="underline hover:no-underline">
            Cookie Policy
          </Link>{" "}
          for details.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            type="button"
            className="border border-white bg-transparent text-white uppercase text-xs font-semibold tracking-wide px-6 py-3 hover:bg-white hover:text-black transition-colors"
            onClick={() =>
              save({
                necessary: true,
                preferences: false,
                analytics: false,
                marketing: false,
              })
            }
          >
            Necessary only
          </button>
          <button
            type="button"
            className="border border-white bg-white text-black uppercase text-xs font-semibold tracking-wide px-6 py-3 hover:bg-transparent hover:text-white transition-colors"
            onClick={() =>
              save({
                necessary: true,
                preferences: true,
                analytics: true,
                marketing: true,
              })
            }
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
