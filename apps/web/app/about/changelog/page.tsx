"use client";

import React from "react";

export default function ChangelogPage() {
  return (
    <>
      <style>{`
        /* =========================================================
           BREAKOUT OF LAYOUT CONTAINER
        ========================================================= */
        /* Force dark background + grid pattern across the FULL page including footer */
        html {
          overflow-x: hidden;
          max-width: 100%;
        }

        body {
          overflow-x: hidden;
          max-width: 100%;
          background-color: #0d0e12 !important;
          background-image:
            linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px) !important;
          background-size: 32px 32px !important;
        }

        /* Make the layout wrapper transparent so body grid shows through everywhere */
        body > div {
          background: transparent !important;
        }

        /* Style the layout footer to match dark theme */
        footer {
          background: transparent !important;
          border-color: rgba(255,255,255,0.06) !important;
        }
        footer p {
          color: #4c4e57 !important;
        }

        .cl-wrapper {
          width: 100vw;
          position: relative;
          left: 50%;
          transform: translateX(-50%);
          margin-top: calc(-1 * var(--space-8, 32px));
          margin-bottom: calc(-1 * var(--space-8, 32px));
          overflow: hidden;
        }

        /* =========================================================
           RESET
        ========================================================= */
        .cl-page * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* =========================================================
           PAGE
        ========================================================= */
        .cl-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          font-family: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          /* Background handled by body; only keep the color glows here */
          background:
            radial-gradient(ellipse 600px 500px at 38% 78%, rgba(92, 26, 56, .24), transparent 72%),
            radial-gradient(ellipse 450px 400px at 76% 18%, rgba(34, 44, 70, .10), transparent 70%),
            transparent;
          color: #fff;
        }

        /* =========================================================
           CANVAS — 1536 × 1024 reference composition
        ========================================================= */
        .cl-canvas {
          position: relative;
          width: 1536px;
          height: 1850px;
          margin: 0 auto;
          transform-origin: top center;
        }

        /* =========================================================
           GRID
        ========================================================= */
        /* Radial gradient overlay — color tinting only, not the grid */
        .cl-grid {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 600px 500px at 38% 78%, rgba(92, 26, 56, .22), transparent 72%),
            radial-gradient(ellipse 450px 400px at 76% 18%, rgba(34, 44, 70, .10), transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* =========================================================
           HERO
        ========================================================= */
        .cl-hero {
          position: absolute;
          left: 103px;
          top: 250px;
          width: 470px;
          z-index: 15;
        }

        .cl-eyebrow {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          color: #d4d4d8;
          font-size: 10px;
          letter-spacing: 4px;
        }

        .cl-eyebrow::after {
          content: "";
          width: 43px;
          height: 1px;
          background: #777983;
        }

        .cl-hero h1 {
          font-size: 74px;
          line-height: .98;
          letter-spacing: -4px;
          font-weight: 600;
          margin-bottom: 23px;
          white-space: nowrap;
          background: linear-gradient(90deg, #ffffff 0%, #ffffff 49%, #767887 88%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .cl-hero-description {
          width: 410px;
          color: #777a86;
          font-size: 18px;
          line-height: 1.65;
        }

        .cl-scroll {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 62px;
          color: #9799a2;
          font-size: 12px;
        }

        .cl-scroll-button {
          width: 51px;
          height: 51px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
        }

        /* =========================================================
           TIMELINE SVG CONTAINER
        ========================================================= */
        .cl-timeline {
          position: absolute;
          inset: 0;
          width: 1536px;
          height: 1850px;
          z-index: 5;
          pointer-events: none;
        }

        .cl-timeline svg {
          width: 1536px;
          height: 1850px;
          overflow: visible;
        }

        .cl-line {
          fill: none;
          stroke: rgba(157,158,171,.52);
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* =========================================================
           DATES
        ========================================================= */
        .cl-date {
          position: absolute;
          z-index: 20;
          color: #dedee3;
          font-size: 10px;
          letter-spacing: 4px;
          white-space: nowrap;
        }
        .cl-date-one   { left: 549px; top: 133px; }
        .cl-date-two   { left: 712px; top: 387px; }
        .cl-date-three { left: 893px; top: 696px; }
        .cl-date-four  { left: 549px; top: 941px; }
        .cl-date-five  { left: 712px; top: 1195px; }
        .cl-date-six   { left: 893px; top: 1504px; }

        /* =========================================================
           CARDS
        ========================================================= */
        .cl-card {
          position: absolute;
          z-index: 15;
          border-radius: 24px;
          background: linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.012));
          border: 1px solid rgba(255,255,255,.115);
          box-shadow:
            inset 0 1px rgba(255,255,255,.025),
            0 20px 60px rgba(0,0,0,.14);
          backdrop-filter: blur(18px);
          overflow-y: auto;
          overflow-x: hidden;
          transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease;
        }

        .cl-card-one:hover, .cl-card-four:hover {
          border-color: rgba(63, 120, 219, 0.4);
          box-shadow: inset 0 1px rgba(255,255,255,.025), 0 20px 60px rgba(0,0,0,.2), 0 0 30px rgba(63, 120, 219, 0.15);
        }
        
        .cl-card-two:hover, .cl-card-five:hover {
          border-color: rgba(224, 48, 101, 0.4);
          box-shadow: inset 0 1px rgba(255,255,255,.025), 0 20px 60px rgba(0,0,0,.2), 0 0 30px rgba(224, 48, 101, 0.15);
        }

        .cl-card-three:hover, .cl-card-six:hover {
          border-color: rgba(27, 176, 152, 0.4);
          box-shadow: inset 0 1px rgba(255,255,255,.025), 0 20px 60px rgba(0,0,0,.2), 0 0 30px rgba(27, 176, 152, 0.15);
        }

        /* Custom Scrollbar for Cards */
        .cl-card::-webkit-scrollbar {
          width: 12px;
        }
        .cl-card::-webkit-scrollbar-track {
          background: transparent;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        .cl-card::-webkit-scrollbar-thumb {
          background-color: transparent;
          border: 4px solid transparent;
          background-clip: content-box;
          border-radius: 10px;
        }
        .cl-card:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .cl-card::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .cl-card-one   { left: 921px;  top: 119px; width: 454px; height: 244px; padding: 19px 30px; }
        .cl-card-two   { left: 1025px; top: 388px; width: 415px; height: 240px; padding: 19px 30px; }
        .cl-card-three { left: 1086px; top: 653px; width: 354px; height: 235px; padding: 19px 29px; }
        .cl-card-four  { left: 921px;  top: 927px; width: 454px; height: 244px; padding: 19px 30px; }
        .cl-card-five  { left: 1025px; top: 1196px; width: 415px; height: 240px; padding: 19px 30px; }
        .cl-card-six   { left: 1086px; top: 1461px; width: 354px; height: 235px; padding: 19px 29px; }

        /* =========================================================
           VERSION PILLS
        ========================================================= */
        .cl-version {
          display: inline-flex;
          align-items: center;
          height: 30px;
          padding: 0 14px;
          border-radius: 18px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 9px;
        }

        .cl-version-blue  { color: #d9e7ff; background: rgba(61,105,174,.31); border: 1px solid rgba(91,143,222,.22); }
        .cl-version-pink  { color: #ffd4e2; background: rgba(171,31,77,.35);  border: 1px solid rgba(224,48,101,.2); }
        .cl-version-green { color: #cafff2; background: rgba(14,130,111,.34); border: 1px solid rgba(27,176,152,.2); }

        /* =========================================================
           CARD CONTENT
        ========================================================= */
        .cl-card h2 {
          color: #f3f3f5;
          font-size: 20px;
          line-height: 1.2;
          letter-spacing: -.5px;
          font-weight: 500;
          margin-bottom: 9px;
        }

        .cl-card p {
          color: #7d7f88;
          font-size: 13px;
          line-height: 1.55;
          margin-bottom: 13px;
        }

        /* =========================================================
           FEATURES
        ========================================================= */
        .cl-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .cl-features li {
          display: flex;
          align-items: center;
          gap: 14px;
          color: #c9cacf;
          font-size: 12px;
        }

        .cl-feature-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .cl-blue-dot  { background: #6ba0ff; box-shadow: 0 0 7px #6ba0ff; }
        .cl-pink-dot  { background: #ed4b82; box-shadow: 0 0 7px #ed4b82; }
        .cl-green-dot { background: #3dd4bb; box-shadow: 0 0 7px #3dd4bb; }

        /* =========================================================
           DECORATIVE TEXT
        ========================================================= */
        .cl-decorative-text {
          position: absolute;
          left: 103px;
          top: 1720px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 9px;
          color: #4c4e57;
          font-size: 10px;
          letter-spacing: 4px;
        }

        .cl-decorative-text::after {
          content: "";
          width: 26px;
          height: 1px;
          margin-top: 10px;
          background: #555761;
        }

        /* =========================================================
           MORE TO COME
        ========================================================= */
        .cl-more {
          position: absolute;
          left: 691px;
          top: 1780px;
          z-index: 15;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .cl-more-pill {
          width: 60px;
          height: 32px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.025);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .cl-more-pill span {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #e1e1e4;
        }

        .cl-more-copy { display: flex; flex-direction: column; gap: 5px; }
        .cl-more-title { color: #747680; font-size: 14px; }
        .cl-more-description { color: #555761; font-size: 12px; }

        /* =========================================================
           RESPONSIVE SCALING
        ========================================================= */
        @media (max-width: 1536px) {
          .cl-canvas {
            transform: scale(calc(100vw / 1536));
            margin-left: 0;
            margin-right: 0;
          }
          .cl-page {
            /* Canvas height × scale + some buffer for the fixed layout header */
            min-height: calc((1850px * (100vw / 1536)) + 100px);
          }
        }

        @media (max-width: 700px) {
          .cl-canvas { transform: none; width: 100%; height: auto; padding: 30px 20px; }
          .cl-grid, .cl-timeline, .cl-date, .cl-decorative-text, .cl-more { display: none; }
          .cl-hero { position: relative; left: auto; top: auto; width: 100%; margin-bottom: 60px; }
          .cl-hero h1 { font-size: 58px; white-space: normal; }
          .cl-hero-description { width: 100%; }
          .cl-card, .cl-card-one, .cl-card-two, .cl-card-three, .cl-card-four, .cl-card-five, .cl-card-six {
            position: relative; left: auto; top: auto;
            width: 100%; height: auto; min-height: 220px; margin-bottom: 20px;
          }
        }
      `}</style>

      <div className="cl-wrapper">
        <div className="cl-page">
          <div className="cl-grid" />

          <div className="cl-canvas">

            {/* Hero */}
            <section className="cl-hero">
              <div className="cl-eyebrow">PRODUCT UPDATES</div>
              <h1>What&apos;s New</h1>
              <p className="cl-hero-description">
                Small changes. A better experience.<br />
                Here&apos;s what we&apos;ve been working on.
              </p>
              <div className="cl-scroll">
                <div className="cl-scroll-button">↓</div>
                <span>Scroll to explore</span>
              </div>
            </section>

            {/* Timeline SVG */}
            <div className="cl-timeline">
              <svg viewBox="0 0 1536 1950" preserveAspectRatio="none">
                <defs>
                  <radialGradient id="cl-blueNode">
                    <stop offset="0%" stopColor="#609bff" />
                    <stop offset="100%" stopColor="#294f89" />
                  </radialGradient>
                  <radialGradient id="cl-pinkNode">
                    <stop offset="0%" stopColor="#ef3b76" />
                    <stop offset="100%" stopColor="#8d1b48" />
                  </radialGradient>
                  <radialGradient id="cl-greenNode">
                    <stop offset="0%" stopColor="#1cc9aa" />
                    <stop offset="100%" stopColor="#087766" />
                  </radialGradient>
                  <filter id="cl-blueGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="10" />
                  </filter>
                  <filter id="cl-pinkGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="10" />
                  </filter>
                  <filter id="cl-greenGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="10" />
                  </filter>
                </defs>

                {/* Top path: left edge → blue node → card */}
                <path className="cl-line" d="
                  M 288 131
                  H 382
                  C 417 131, 425 158, 441 180
                  C 454 198, 473 230, 504 230
                  H 618
                  H 921
                " />

                {/* Blue → Pink (includes horizontal connector to card 2) */}
                <path className="cl-line" d="
                  M 618 230
                  C 667 230, 704 244, 704 286
                  V 433
                  C 704 466, 728 483, 783 483
                  H 1025
                " />

                {/* Pink → Green */}
                <path className="cl-line" d="
                  M 783 483
                  C 832 483, 859 500, 859 536
                  V 700
                  C 859 731, 881 748, 919 748
                  H 1086
                " />

                {/* Green → Node 4 (Blue) */}
                <path className="cl-line" d="
                  M 919 748
                  C 919 787, 897 821, 852 821
                  H 550
                  C 517 821, 499 844, 499 872
                  V 980
                  C 499 1020, 520 1038, 560 1038
                  H 921
                " />

                {/* Node 4 → Node 5 (Pink) */}
                <path className="cl-line" d="
                  M 618 1038
                  C 667 1038, 704 1052, 704 1094
                  V 1241
                  C 704 1274, 728 1291, 783 1291
                  H 1025
                " />

                {/* Node 5 → Node 6 (Green) */}
                <path className="cl-line" d="
                  M 783 1291
                  C 832 1291, 859 1308, 859 1344
                  V 1508
                  C 859 1539, 881 1556, 919 1556
                  H 1086
                " />

                {/* Node 6 → End node */}
                <path className="cl-line" d="
                  M 919 1556
                  C 919 1595, 897 1629, 852 1629
                  H 669
                  C 636 1629, 618 1652, 618 1680
                  V 1725
                " />

                {/* Blue node 1 */}
                <circle cx="618" cy="230" r="43" fill="#3f78db" opacity=".18" filter="url(#cl-blueGlow)" />
                <circle cx="618" cy="230" r="29" fill="url(#cl-blueNode)"
                  style={{ filter: "drop-shadow(0 0 9px rgba(63,128,255,.85)) drop-shadow(0 0 23px rgba(63,128,255,.38))" }} />
                <circle cx="618" cy="230" r="11" fill="#ffffff" />

                {/* Pink node 2 */}
                <circle cx="783" cy="483" r="43" fill="#e03065" opacity=".14" filter="url(#cl-pinkGlow)" />
                <circle cx="783" cy="483" r="29" fill="url(#cl-pinkNode)"
                  style={{ filter: "drop-shadow(0 0 9px rgba(224,48,101,.65)) drop-shadow(0 0 23px rgba(224,48,101,.25))" }} />
                <circle cx="783" cy="483" r="11" fill="#ffffff" />

                {/* Green node 3 */}
                <circle cx="919" cy="748" r="43" fill="#1bb098" opacity=".14" filter="url(#cl-greenGlow)" />
                <circle cx="919" cy="748" r="29" fill="url(#cl-greenNode)"
                  style={{ filter: "drop-shadow(0 0 9px rgba(27,176,152,.65)) drop-shadow(0 0 23px rgba(27,176,152,.25))" }} />
                <circle cx="919" cy="748" r="11" fill="#ffffff" />

                {/* Blue node 4 */}
                <circle cx="618" cy="1038" r="43" fill="#3f78db" opacity=".18" filter="url(#cl-blueGlow)" />
                <circle cx="618" cy="1038" r="29" fill="url(#cl-blueNode)"
                  style={{ filter: "drop-shadow(0 0 9px rgba(63,128,255,.85)) drop-shadow(0 0 23px rgba(63,128,255,.38))" }} />
                <circle cx="618" cy="1038" r="11" fill="#ffffff" />

                {/* Pink node 5 */}
                <circle cx="783" cy="1291" r="43" fill="#e03065" opacity=".14" filter="url(#cl-pinkGlow)" />
                <circle cx="783" cy="1291" r="29" fill="url(#cl-pinkNode)"
                  style={{ filter: "drop-shadow(0 0 9px rgba(224,48,101,.65)) drop-shadow(0 0 23px rgba(224,48,101,.25))" }} />
                <circle cx="783" cy="1291" r="11" fill="#ffffff" />

                {/* Green node 6 */}
                <circle cx="919" cy="1556" r="43" fill="#1bb098" opacity=".14" filter="url(#cl-greenGlow)" />
                <circle cx="919" cy="1556" r="29" fill="url(#cl-greenNode)"
                  style={{ filter: "drop-shadow(0 0 9px rgba(27,176,152,.65)) drop-shadow(0 0 23px rgba(27,176,152,.25))" }} />
                <circle cx="919" cy="1556" r="11" fill="#ffffff" />

                {/* End node */}
                <circle cx="618" cy="1725" r="27" fill="rgba(91,93,108,.24)" />
                <circle cx="618" cy="1725" r="10" fill="#999caa" />
              </svg>
            </div>

            {/* Dates */}
            <span className="cl-date cl-date-one">SEP 16, 2026</span>
            <span className="cl-date cl-date-two">AUG 30, 2026</span>
            <span className="cl-date cl-date-three">AUG 28, 2026</span>
            <span className="cl-date cl-date-four">AUG 26, 2026</span>
            <span className="cl-date cl-date-five">AUG 24, 2026</span>
            <span className="cl-date cl-date-six">AUG 22, 2026</span>

            {/* Card 1 — v1.5.0 */}
            <article className="cl-card cl-card-one">
              <span className="cl-version cl-version-blue">v1.5.0</span>
              <h2>Introducing Premium Sticky Notes</h2>
              <p>Added a brand new Sticky Notes feature with a premium, draggable interface.</p>
              <ul className="cl-features">
                <li><span className="cl-feature-dot cl-blue-dot" />Sticky Notes can be dynamically pinned to any specific page across the platform</li>
                <li><span className="cl-feature-dot cl-blue-dot" />Rich text formatting with custom text colors, background colors, and typography</li>
                <li><span className="cl-feature-dot cl-blue-dot" />Real-time synchronization ensures pinned notes are instantly updated</li>
              </ul>
            </article>

            {/* Card 2 — v1.4.0 */}
            <article className="cl-card cl-card-two">
              <span className="cl-version cl-version-pink">v1.4.0</span>
              <h2>Trade Journal Upgrades &amp; Safety Checks</h2>
              <p>Added &apos;Deleted&apos; status tracking for archived trades so they show up distinctly in your journal with custom badges.</p>
              <ul className="cl-features">
                <li><span className="cl-feature-dot cl-pink-dot" />Trade Journey timeline connects deleted events with date, time, and live price upon deletion</li>
                <li><span className="cl-feature-dot cl-pink-dot" />Strict validation prevents scaling out more shares than currently held in a trade</li>
                <li><span className="cl-feature-dot cl-pink-dot" />Fixed fractional decimal quantities for non-crypto assets</li>
              </ul>
            </article>

            {/* Card 3 — v1.3.0 */}
            <article className="cl-card cl-card-three">
              <span className="cl-version cl-version-green">v1.3.0</span>
              <h2>Smarter AI Assistant</h2>
              <p>The AI Assistant can now delete trades directly via natural language commands.</p>
              <ul className="cl-features">
                <li><span className="cl-feature-dot cl-green-dot" />Refactored AI command router for simpler intent processing and better reliability</li>
                <li><span className="cl-feature-dot cl-green-dot" />AI no longer hallucinates &apos;Exit Trade&apos; buttons; correctly prompts for missing symbols</li>
              </ul>
            </article>

            {/* Card 4 — v1.2.0 */}
            <article className="cl-card cl-card-four">
              <span className="cl-version cl-version-blue">v1.2.0</span>
              <h2>Global Currency &amp; Chart Stability</h2>
              <p>Fixed currency conversion (USD/INR) across the Calendar, Analytics, Trades, Journal, Dashboard P&amp;L, and Chart formatting.</p>
              <ul className="cl-features">
                <li><span className="cl-feature-dot cl-blue-dot" />Fixed edge case where missing price candles affected Y-axis scale and chart rendering</li>
              </ul>
            </article>

            {/* Card 5 — v1.1.0 */}
            <article className="cl-card cl-card-five">
              <span className="cl-version cl-version-pink">v1.1.0</span>
              <h2>Trading Engine Foundations</h2>
              <p>Added initial support for scaling in and out of positions via executions API.</p>
              <ul className="cl-features">
                <li><span className="cl-feature-dot cl-pink-dot" />Enhanced accuracy of R-Multiple and P&amp;L calculations on partially closed trades</li>
              </ul>
            </article>

            {/* Card 6 — v1.0.0 */}
            <article className="cl-card cl-card-six">
              <span className="cl-version cl-version-green">v1.0.0</span>
              <h2>The Beginning</h2>
              <p>Initial platform launch! Started building the most advanced AI-powered trading journal.</p>
            </article>

            {/* Decorative text */}
            <div className="cl-decorative-text">
              <span>BUILD</span>
              <span>CREATE</span>
              <span>IMPROVE</span>
              <span>REPEAT</span>
            </div>

            {/* More to come */}
            <div className="cl-more">
              <div className="cl-more-pill">
                <span /><span /><span />
              </div>
              <div className="cl-more-copy">
                <span className="cl-more-title">More to come</span>
                <span className="cl-more-description">We&apos;re just getting started.</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
