import React from "react";
import Layout from "../layout/Layout";
import { openCookieSettings } from "../utils/cookies";

const CookiePolicy = () => {
  return (
    <Layout>
      <section className="w-full bg-black relative flex flex-col justify-center items-center pt-20 h-[40vh]">
        <div className="w-full h-full absolute z-0 top-0 left-0 bg-black/30"></div>
        <div className="relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2">
          <h1 className="text-white font-bold text-5xl text-center drop-shadow-md">
            Cookie Policy
          </h1>
        </div>
      </section>
      <div className="container mx-auto px-4 py-20 leading-snug flex flex-col justify-start items-start gap-5">
        <h1 className="font-bold text-xl">Cookie Policy</h1>
        <p>Last updated: September 13, 2026</p>
        <p>
          This Cookie Policy explains how Stiles (“the Company”, “We”, “Us” or
          “Our”) uses cookies and similar technologies on{" "}
          <a href="https://stiles.co.za/" target="_blank" rel="noopener noreferrer">
            https://stiles.co.za/
          </a>
          . It should be read together with our{" "}
          <a href="/privacy-policy-popi-compliance">Privacy Policy</a>.
        </p>

        <h2 className="font-bold text-lg">What are cookies?</h2>
        <p>
          Cookies are small text files placed on your computer, mobile phone or
          tablet when you visit a website. They allow the site to remember your
          device and store information about your visit, such as your cookie
          preferences, login session, or how you use the site.
        </p>

        <h2 className="font-bold text-lg">How we use cookies</h2>
        <p>
          We only set cookies after you make a choice on our cookie banner,
          except for the strictly necessary cookie that records that choice. You
          can accept all cookies or continue with necessary cookies only.
        </p>
        <p>
          You can change your mind at any time using Cookie settings in the
          website footer, or by clicking the button below.
        </p>
        <button
          type="button"
          onClick={openCookieSettings}
          className="text-xs border border-black bg-black text-white uppercase font-semibold tracking-wide px-6 py-3 hover:bg-white hover:text-black transition-colors"
        >
          Manage cookie settings
        </button>

        <h2 className="font-bold text-lg">Cookies we use</h2>
        <ul className="list-disc list-inside flex flex-col gap-3">
          <li>
            <strong>stiles_cookie_consent</strong> — Necessary. Stores your
            cookie category choices for up to 12 months.
          </li>
          <li>
            <strong>stiles_session</strong> — Necessary. A unique session
            identifier so the website can operate reliably.
          </li>
          <li>
            <strong>stiles_preferences</strong> — Preferences (optional).
            Remembers details such as your last visit time.
          </li>
          <li>
            <strong>stiles_analytics</strong> — Analytics (optional). A unique
            identifier used to understand how visitors use the site.
          </li>
          <li>
            <strong>stiles_marketing</strong> — Marketing (optional). Used to
            measure campaigns and support relevant offers.
          </li>
        </ul>

        <h2 className="font-bold text-lg">Cookie categories</h2>
        <ul className="list-disc list-inside flex flex-col gap-3">
          <li>
            <strong>Necessary cookies</strong> are required for the website to
            function, including remembering your consent. These cannot be
            switched off.
          </li>
          <li>
            <strong>Preference cookies</strong> remember choices you make so we
            can provide a more personal experience.
          </li>
          <li>
            <strong>Analytics cookies</strong> help us understand traffic and
            usage so we can improve the Service.
          </li>
          <li>
            <strong>Marketing cookies</strong> may be used to measure the
            effectiveness of promotions and to show relevant content.
          </li>
        </ul>

        <h2 className="font-bold text-lg">Your choices</h2>
        <p>
          You can also control cookies through your browser settings. If you
          block all cookies, some parts of the website may not work as expected.
        </p>
        <p>
          For questions about this Cookie Policy or our use of personal
          information, please see our{" "}
          <a href="/privacy-policy-popi-compliance">Privacy Policy</a> or{" "}
          <a href="/contact-us">contact us</a>.
        </p>
      </div>
    </Layout>
  );
};

export default CookiePolicy;
