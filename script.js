/* ============================================================
   NIMBUS WEATHER APP — style.css
   All visual styling goes here.
   Sections:
     1. Reset & Variables
     2. Background Effects (rain, snow, sun, clouds, fog, thunder)
     3. App Layout
     4. Header
     5. Search Box
     6. Loading Spinner
     7. Weather Card
     8. Stats Grid
     9. Sunrise / Sunset Arc
    10. 5-Day Forecast
    11. Footer
    12. Utility Classes
    13. Responsive (Mobile)
   ============================================================ */


/* ── 1. RESET & VARIABLES ── */

/* Remove default browser spacing on all elements */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* CSS Variables — change colors here to restyle the whole app */
:root {
  --accent:       #7eb8f7;       /* blue accent color */
  --accent-glow:  rgba(126, 184, 247, 0.25);
  --text:         #ffffff;
  --text-dim:     rgba(255, 255, 255, 0.55);
  --text-muted:   rgba(255, 255, 255, 0.35);
  --card-bg:      rgba(255, 255, 255, 0.12);
  --card-border:  rgba(255, 255, 255, 0.22);
  --sunrise-col:  #f7c97e;       /* warm yellow for sunrise */
  --sunset-col:   #f7a07e;       /* warm orange for sunset */
}

body {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  /* Default background — changes per weather condition via JS */
  background: linear-gradient(135deg, #1a2a4a 0%, #0d1b35 50%, #0a1628 100%);
  color: var(--text);
  overflow-x: hidden;
  transition: background 1.2s ease; /* smooth bg color transition */
}


/* ── 2. BACKGROUND EFFECTS ── */

/* Canvas is used to draw rain and snow particles */
#fx-canvas {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none; /* clicks go through the canvas */
  z-index: 1;
  display: none; /* shown by JS when needed */
}

/* Glowing sun in top-right corner */
#sun-el {
  position: fixed;
  top: -60px; right: -60px;
  width: 280px; height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff9c4 0%, #ffe000 35%, #ff9500 65%, transparent 100%);
  box-shadow:
    0 0 80px 40px rgba(255, 185, 0, 0.6),
    0 0 180px 90px rgba(255, 130, 0, 0.3);
  animation: sunPulse 3s ease-in-out infinite;
  z-index: 1;
  display: none; /* shown by JS for sunny weather */
}

/* Sun slowly pulses (grows and shrinks) */
@keyframes sunPulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
}

/* Lightning container — sits above everything */
#lightning-el {
  position: fixed;
  inset: 0; /* covers full screen */
  z-index: 6;
  pointer-events: none;
  display: none; /* shown by JS for thunderstorm */
}

/* Each bolt wrapper is positioned at different x positions */
.bolt-wrap {
  position: absolute;
  top: 0;
  opacity: 0; /* hidden until animation fires */
}
.bw1 { left: 22%; width: 70px; height: 65%; animation: boltFlash 4s infinite; }
.bw2 { left: 58%; width: 55px; height: 80%; animation: boltFlash 5s 1.8s infinite; }
.bw3 { left: 82%; width: 60px; height: 55%; animation: boltFlash 6s 3.5s infinite; }

.bolt-svg { width: 100%; height: 100%; }

/* The bolt flashes on and off rapidly (like real lightning) */
@keyframes boltFlash {
  0%,  74%, 100% { opacity: 0; }
  75%            { opacity: 1; }
  76%            { opacity: 0.3; }
  77%            { opacity: 1; }
  79%            { opacity: 0.5; }
  81%            { opacity: 0; }
}

/* Full-screen white flash at the moment the bolt appears */
.flash-screen {
  position: absolute;
  inset: 0;
  background: rgba(210, 230, 255, 0);
  animation: screenFlash 4s infinite;
}

@keyframes screenFlash {
  0%,  74%, 100% { background: rgba(210, 230, 255, 0); }
  75%            { background: rgba(210, 230, 255, 0.22); }
  76%            { background: rgba(210, 230, 255, 0.05); }
  77%            { background: rgba(210, 230, 255, 0.18); }
  80%            { background: rgba(210, 230, 255, 0); }
}

/* Moving cloud blobs in the background */
#clouds-el {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  display: none; /* shown by JS for cloudy weather */
}

.bgc {
  position: absolute;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 80px;
  filter: blur(16px); /* soft blurry cloud look */
}

/* Each cloud is different size, position, and speed */
.bgc1 { width: 500px; height: 78px; top: 8%;  left: -300px; animation: cloudMove 28s linear infinite; }
.bgc2 { width: 370px; height: 58px; top: 22%; left: -200px; animation: cloudMove 38s 6s linear infinite; }
.bgc3 { width: 590px; height: 88px; top: 38%; left: -350px; animation: cloudMove 24s 14s linear infinite; }
.bgc4 { width: 410px; height: 64px; top: 56%; left: -220px; animation: cloudMove 33s 20s linear infinite; }

/* Cloud slides from left to right across the screen */
@keyframes cloudMove {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(100vw + 700px)); }
}

/* Fog / mist horizontal strips */
#fog-el {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  display: none; /* shown by JS for foggy weather */
}

.fogl {
  position: absolute;
  left: -50%;
  width: 200%;
  height: 130px;
  /* Gradient that fades in/out on left and right */
  background: linear-gradient(
    to right,
    transparent,
    rgba(200, 215, 230, 0.12) 30%,
    rgba(200, 215, 230, 0.18) 50%,
    rgba(200, 215, 230, 0.12) 70%,
    transparent
  );
  filter: blur(20px);
}

/* Each fog strip drifts at different speeds and directions */
.fl1 { top: 10%; animation: fogDrift 18s ease-in-out infinite alternate; }
.fl2 { top: 40%; animation: fogDrift 25s 5s ease-in-out infinite alternate-reverse; }
.fl3 { top: 68%; animation: fogDrift 21s 10s ease-in-out infinite alternate; }

@keyframes fogDrift {
  from { transform: translateX(-20%); }
  to   { transform: translateX(20%); }
}


/* ── 3. APP LAYOUT ── */

/* Centers everything and limits max width */
.app {
  position: relative;
  z-index: 10; /* sits above all background effects */
  max-width: 500px;
  margin: 0 auto;
  padding: 20px 16px 60px;
}


/* ── 4. HEADER ── */

.header {
  text-align: center;
  padding: 10px 0 20px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text);
}

/* Cloud-sun icon next to the brand name */
.logo i {
  font-size: 2rem;
  color: var(--accent);
  filter: drop-shadow(0 0 12px var(--accent-glow));
}

.tagline {
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-top: 4px;
}


/* ── 5. SEARCH BOX ── */

.search-box {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Tab buttons row */
.toggle-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab {
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* Active/selected tab */
.tab.active {
  background: rgba(126, 184, 247, 0.25);
  border-color: rgba(126, 184, 247, 0.6);
  color: var(--accent);
  box-shadow: 0 0 16px var(--accent-glow);
}

/* Hint text shown inside the panel */
.hint {
  font-size: 0.78rem;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 12px;
}

/* "Detect My Location" button */
.detect-btn {
  display: block;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, var(--accent), #4a9fe0);
  color: #fff;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(74, 159, 224, 0.45);
}

.detect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(74, 159, 224, 0.6);
}

.detect-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* City search input row */
.search-input-row {
  display: flex;
  gap: 8px;
}

.search-input-row input {
  flex: 1;
  padding: 11px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-family: 'Poppins', sans-serif;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input-row input::placeholder {
  color: var(--text-muted);
}

.search-input-row input:focus {
  border-color: rgba(126, 184, 247, 0.5);
}

.search-input-row button {
  width: 44px; height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--accent), #4a9fe0);
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 16px rgba(74, 159, 224, 0.4);
}

.search-input-row button:hover {
  transform: scale(1.08);
}

/* Error message styling */
.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255, 80, 80, 0.15);
  border: 1px solid rgba(255, 80, 80, 0.3);
  color: #ff9090;
  font-size: 0.82rem;
  animation: shake 0.4s ease;
}

/* Shake animation on error */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-6px); }
  75%       { transform: translateX(6px); }
}


/* ── 6. LOADING SPINNER ── */

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* Spinning circle */
.spinner {
  width: 48px; height: 48px;
  border-radius: 50%;
  border: 3px solid rgba(126, 184, 247, 0.15);
  border-top-color: var(--accent);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}


/* ── 7. WEATHER CARD ── */

/* Fade-in animation when card appears */
.weather-section {
  animation: fadeUp 0.5s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-radius: 22px;
  padding: 22px 20px;
  margin-bottom: 14px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

/* Top row: city + date */
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.card-top h1 {
  font-size: 1.85rem;
  font-weight: 700;
  line-height: 1.1;
}

.card-top .country {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  margin-top: 4px;
}

.date-box {
  text-align: right;
  flex-shrink: 0;
}

.date-box p:first-child {
  font-size: 0.95rem;
  font-weight: 600;
}

.date-box p:last-child {
  font-size: 0.68rem;
  color: var(--text-dim);
  margin-top: 2px;
}

/* Temperature + weather icon row */
.temp-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

/* Big temperature number */
.temperature {
  font-size: 5.5rem;
  font-weight: 300;
  line-height: 1;
  display: flex;
  align-items: flex-start;
}

.unit {
  font-size: 2rem;
  font-weight: 400;
  color: var(--text-dim);
  margin-top: 10px;
}

/* Right side: icon + condition + feels like */
.condition-box {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

#weather-icon {
  font-size: 3.4rem;
  /* Icon color set dynamically by JS */
  animation: iconBob 3.5s ease-in-out infinite;
}

/* Icon gently floats up and down */
@keyframes iconBob {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-7px); }
}

.condition-box p:first-of-type {
  font-size: 0.84rem;
  font-weight: 600;
}

.feels {
  font-size: 0.7rem;
  color: var(--text-dim);
}

/* Horizontal line divider */
.divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  margin: 4px 0 16px;
}


/* ── 8. STATS GRID ── */

/* 2x2 grid for humidity, wind, pressure, visibility */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.stat {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 13px;
  padding: 11px 13px;
  display: flex;
  align-items: center;
  gap: 11px;
}

/* Coloured icon box on the left of each stat */
.stat-icon {
  width: 34px; height: 34px;
  background: rgba(126, 184, 247, 0.18);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.stat-label {
  font-size: 0.62rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 700;
}


/* ── 9. SUNRISE / SUNSET ARC ── */

.sun-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sun-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Sunset item is reversed (icon on right) */
.sun-item.right {
  flex-direction: row-reverse;
}

.sun-item.right div {
  text-align: right;
}

/* Sunrise icon color */
.rise-icon {
  font-size: 1.7rem;
  color: var(--sunrise-col);
  filter: drop-shadow(0 0 8px rgba(247, 201, 126, 0.6));
}

/* Sunset icon color */
.set-icon {
  font-size: 1.7rem;
  color: var(--sunset-col);
  filter: drop-shadow(0 0 8px rgba(247, 160, 126, 0.6));
}

.sun-label {
  font-size: 0.62rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sun-item p:last-child {
  font-size: 0.88rem;
  font-weight: 700;
}

/* Centers the SVG arc between sunrise and sunset */
.arc-wrap {
  flex: 1;
  display: flex;
  justify-content: center;
}


/* ── 10. 5-DAY FORECAST ── */

.section-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 7px;
}

.section-label i {
  color: var(--accent);
}

/* 5 equal columns, one per day */
.forecast-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 7px;
}

.forecast-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 14px;
  padding: 13px 5px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: transform 0.2s, background 0.2s;
  cursor: default;
}

.forecast-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.16);
}

/* Day name label (e.g. "MON") */
.fc-day {
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-dim);
}

/* "Today" label in accent color */
.fc-day.today {
  color: var(--accent);
}

/* Weather icon in forecast card */
.fc-icon {
  font-size: 1.5rem;
  margin: 3px 0;
}

/* High temp */
.fc-high {
  font-size: 0.9rem;
  font-weight: 700;
}

/* Low temp */
.fc-low {
  font-size: 0.7rem;
  color: var(--text-dim);
}


/* ── 11. FOOTER ── */

footer {
  text-align: center;
  margin-top: 20px;
  font-size: 0.7rem;
  color: var(--text-muted);
}

footer a {
  color: var(--accent);
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}


/* ── 12. UTILITY CLASSES ── */

/* Hide any element */
.hidden {
  display: none !important;
}

/* Weather icon color classes — applied by JavaScript */
.ic-sun   { color: #ffd060; filter: drop-shadow(0 0 10px rgba(255, 200, 50, 0.8)); }
.ic-rain  { color: #7eb8f7; filter: drop-shadow(0 0 10px rgba(126, 184, 247, 0.7)); }
.ic-snow  { color: #d0e8ff; filter: drop-shadow(0 0 10px rgba(200, 224, 255, 0.7)); }
.ic-cloud { color: #c0d0e8; filter: drop-shadow(0 0 8px rgba(192, 208, 232, 0.5)); }
.ic-storm { color: #b0c0ff; filter: drop-shadow(0 0 12px rgba(176, 192, 255, 0.85)); }
.ic-fog   { color: #b0bec8; filter: drop-shadow(0 0 8px rgba(176, 190, 200, 0.5)); }


/* ── 13. RESPONSIVE — MOBILE ── */

@media (max-width: 420px) {
  /* Smaller temperature on tiny screens */
  .temperature { font-size: 4.4rem; }

  /* Smaller city name */
  .card-top h1 { font-size: 1.55rem; }

  /* Tighter forecast grid */
  .forecast-grid { gap: 4px; }
  .forecast-card { padding: 10px 3px; }
  .fc-icon       { font-size: 1.3rem; }
}
