(function() {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────────
  const NASA_KEY = 'DEMO_KEY'; // Free key — 50 req/day. Get yours: api.nasa.gov
  const WIDGET_ID = 'gq-nasa-daily-widget';
  const CACHE_KEY = 'gq_nasa_cache';

  // ── Styles ──────────────────────────────────────────────────────────────────
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

    #${WIDGET_ID} {
      margin: 0 0 24px 0;
      font-family: inherit;
    }

    .gq-nasa-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }
    .gq-nasa-header h2 {
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0;
      color: rgba(255,255,255,0.88);
    }
    .gq-nasa-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(0,212,200,0.1);
      border: 1px solid rgba(0,212,200,0.25);
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 10px;
      font-family: 'Space Mono', monospace;
      letter-spacing: 0.1em;
      color: #00d4c8;
      text-transform: uppercase;
    }
    .gq-nasa-badge-dot {
      width: 5px; height: 5px;
      background: #00d4c8;
      border-radius: 50%;
      animation: gqNasaPulse 2s ease-in-out infinite;
      box-shadow: 0 0 4px #00d4c8;
    }
    @keyframes gqNasaPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.7); }
    }

    .gq-nasa-card {
      background: #071525;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .gq-nasa-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,200,0.15);
    }
    .gq-nasa-topbar {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00d4c8, #a78bfa, #00d4c8, transparent);
      background-size: 200% 100%;
      animation: gqNasaShimmer 4s linear infinite;
      z-index: 5;
    }
    @keyframes gqNasaShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .gq-nasa-img-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16/9;
      background: #030b1a;
      overflow: hidden;
    }
    .gq-nasa-img-container::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 55%, #071525 100%);
      pointer-events: none;
      z-index: 2;
    }
    .gq-nasa-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      opacity: 0;
      transition: opacity 1s ease;
    }
    .gq-nasa-img.loaded { opacity: 1; }
    .gq-nasa-skeleton {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, #071525 25%, #0c1f35 50%, #071525 75%);
      background-size: 200% 100%;
      animation: gqNasaShimmer 1.5s infinite;
    }
    .gq-nasa-source-pill {
      position: absolute;
      top: 12px; right: 12px;
      background: rgba(3,11,26,0.7);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(0,212,200,0.25);
      border-radius: 6px;
      padding: 4px 10px;
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.15em;
      color: #00d4c8;
      z-index: 3;
      text-transform: uppercase;
    }
    .gq-nasa-earth-pill {
      position: absolute;
      bottom: 14px; left: 14px;
      background: rgba(3,11,26,0.7);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(0,212,200,0.2);
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 11px;
      color: rgba(0,212,200,0.85);
      z-index: 3;
      font-family: 'Space Mono', monospace;
      letter-spacing: 0.05em;
    }

    .gq-nasa-body {
      padding: 16px 20px 20px;
    }
    .gq-nasa-title {
      font-size: 15px;
      font-weight: 700;
      color: rgba(255,255,255,0.9);
      margin: 0 0 6px 0;
      line-height: 1.3;
    }
    .gq-nasa-date {
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      color: rgba(255,255,255,0.35);
      letter-spacing: 0.05em;
      margin-bottom: 10px;
    }
    .gq-nasa-desc {
      font-size: 12.5px;
      line-height: 1.65;
      color: rgba(255,255,255,0.5);
      overflow: hidden;
      max-height: 3.95em;
      transition: max-height 0.4s ease;
      margin: 0;
    }
    .gq-nasa-desc.open { max-height: 300px; }
    .gq-nasa-toggle {
      background: none;
      border: none;
      padding: 0;
      margin-top: 8px;
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.08em;
      color: #00d4c8;
      cursor: pointer;
      opacity: 0.75;
      transition: opacity 0.15s;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .gq-nasa-toggle:hover { opacity: 1; }
    .gq-nasa-toggle-arrow {
      display: inline-block;
      transition: transform 0.3s;
    }
    .gq-nasa-toggle-arrow.open { transform: rotate(90deg); }

    .gq-nasa-coords {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .gq-nasa-coord {
      background: rgba(0,212,200,0.04);
      border: 1px solid rgba(0,212,200,0.09);
      border-radius: 8px;
      padding: 7px 10px;
    }
    .gq-nasa-coord-label {
      font-family: 'Space Mono', monospace;
      font-size: 8px;
      letter-spacing: 0.15em;
      color: rgba(0,212,200,0.45);
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .gq-nasa-coord-val {
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      color: rgba(255,255,255,0.8);
      font-weight: 700;
    }
    .gq-nasa-credit {
      margin-top: 12px;
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      color: rgba(255,255,255,0.2);
      letter-spacing: 0.05em;
    }

    /* Loading */
    .gq-nasa-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      color: rgba(0,212,200,0.5);
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.12em;
    }
    .gq-nasa-spinner {
      width: 32px; height: 32px;
      border: 2px solid rgba(0,212,200,0.12);
      border-top-color: #00d4c8;
      border-radius: 50%;
      animation: gqNasaSpin 0.9s linear infinite;
    }
    @keyframes gqNasaSpin { to { transform: rotate(360deg); } }

    /* Error */
    .gq-nasa-error {
      padding: 32px 24px;
      text-align: center;
      color: rgba(255,68,68,0.65);
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      line-height: 1.7;
    }

    /* iframe for APOD videos */
    .gq-nasa-iframe-wrap {
      position: relative;
      padding-top: 56.25%;
      background: #030b1a;
    }
    .gq-nasa-iframe-wrap iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: none;
    }
  `;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function fmtDate(d) {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch(e) { return d; }
  }

  function getCached() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      // Cache for 4 hours
      if (Date.now() - ts < 4 * 60 * 60 * 1000) return data;
    } catch(e) {}
    return null;
  }

  function setCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch(e) {}
  }

  // ── Fetch EPIC (Earth from space, full disc) ─────────────────────────────
  async function fetchEPIC() {
    const res = await fetch(`https://api.nasa.gov/EPIC/api/natural/images?api_key=${NASA_KEY}`);
    if (!res.ok) throw new Error('EPIC fetch failed');
    const data = await res.json();
    if (!data || !data.length) throw new Error('No EPIC images');
    const img = data[0];
    const date = img.date.split(' ')[0].replace(/-/g, '/');
    return {
      url: `https://epic.gsfc.nasa.gov/archive/natural/${date}/jpg/${img.image}.jpg`,
      title: 'Earth Today — Seen From 1.5 Million km Away',
      description: img.caption || 'Full-disc photograph of Earth taken daily by NASA\'s DSCOVR satellite from the L1 Lagrange point between Earth and the Sun. The EPIC camera captures our entire planet in stunning natural color.',
      date: img.date,
      credit: 'NASA DSCOVR / EPIC Camera — Public Domain',
      type: 'image',
      source: 'epic',
      meta: {
        lat: img.centroid_coordinates ? img.centroid_coordinates.lat.toFixed(1) : null,
        lon: img.centroid_coordinates ? img.centroid_coordinates.lon.toFixed(1) : null,
      }
    };
  }

  // ── Fetch APOD fallback ──────────────────────────────────────────────────
  async function fetchAPOD() {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`);
    if (!res.ok) throw new Error('APOD fetch failed');
    const d = await res.json();
    return {
      url: d.url,
      title: d.title,
      description: d.explanation,
      date: d.date,
      credit: d.copyright ? `© ${d.copyright.trim()}` : 'NASA / Public Domain',
      type: d.media_type,
      source: 'apod',
      meta: null
    };
  }

  // ── Render ───────────────────────────────────────────────────────────────
  function render(data) {
    const card = document.querySelector(`#${WIDGET_ID} .gq-nasa-card`);
    if (!card) return;

    let mediaHtml = '';
    if (data.type === 'video') {
      mediaHtml = `
        <div class="gq-nasa-iframe-wrap">
          <iframe src="${data.url}" allowfullscreen title="${data.title}"></iframe>
        </div>`;
    } else {
      mediaHtml = `
        <div class="gq-nasa-img-container">
          <div class="gq-nasa-skeleton" id="gq-nasa-skel"></div>
          <img class="gq-nasa-img" id="gq-nasa-img" src="${data.url}" alt="${data.title}" />
          <div class="gq-nasa-source-pill">${data.source === 'epic' ? 'EPIC · DSCOVR' : 'APOD · NASA'}</div>
          ${data.source === 'epic' ? '<div class="gq-nasa-earth-pill">🌍 Full-disc Earth</div>' : ''}
        </div>`;
    }

    const coordsHtml = data.source === 'epic' && data.meta && data.meta.lat ? `
      <div class="gq-nasa-coords">
        <div class="gq-nasa-coord">
          <div class="gq-nasa-coord-label">Centroid Lat</div>
          <div class="gq-nasa-coord-val">${data.meta.lat}°</div>
        </div>
        <div class="gq-nasa-coord">
          <div class="gq-nasa-coord-label">Centroid Lon</div>
          <div class="gq-nasa-coord-val">${data.meta.lon}°</div>
        </div>
        <div class="gq-nasa-coord">
          <div class="gq-nasa-coord-label">Distance</div>
          <div class="gq-nasa-coord-val">1.5M km</div>
        </div>
      </div>` : '';

    card.innerHTML = `
      <div class="gq-nasa-topbar"></div>
      ${mediaHtml}
      <div class="gq-nasa-body">
        <h3 class="gq-nasa-title">${data.title}</h3>
        <div class="gq-nasa-date">${fmtDate(data.date)}</div>
        <p class="gq-nasa-desc" id="gq-nasa-desc">${data.description}</p>
        <button class="gq-nasa-toggle" id="gq-nasa-toggle">
          <span class="gq-nasa-toggle-arrow" id="gq-nasa-arrow">▶</span>
          Read more
        </button>
        ${coordsHtml}
        <div class="gq-nasa-credit">${data.credit}</div>
      </div>
    `;

    // Image load handler
    const img = document.getElementById('gq-nasa-img');
    const skel = document.getElementById('gq-nasa-skel');
    if (img) {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
        if (skel) skel.style.display = 'none';
      });
      img.addEventListener('error', () => {
        // If EPIC image 404s (can happen on new days), try APOD
        if (data.source === 'epic') {
          localStorage.removeItem(CACHE_KEY);
          fetchAPOD().then(apodData => {
            setCache(apodData);
            render(apodData);
          }).catch(() => {});
        }
      });
    }

    // Read more toggle
    const toggle = document.getElementById('gq-nasa-toggle');
    const desc = document.getElementById('gq-nasa-desc');
    const arrow = document.getElementById('gq-nasa-arrow');
    let open = false;
    if (toggle) {
      toggle.addEventListener('click', () => {
        open = !open;
        desc.classList.toggle('open', open);
        arrow.classList.toggle('open', open);
        toggle.querySelector('span:last-child') && (toggle.lastChild.textContent = open ? ' Less' : ' Read more');
        toggle.innerHTML = `<span class="gq-nasa-toggle-arrow ${open ? 'open' : ''}">▶</span> ${open ? 'Less' : 'Read more'}`;
      });
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function inject() {
    if (document.getElementById(WIDGET_ID)) return;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // Build widget shell
    const widget = document.createElement('div');
    widget.id = WIDGET_ID;
    widget.innerHTML = `
      <div class="gq-nasa-header">
        <h2 class="font-display text-xl font-bold" style="margin:0">🛰️ Earth from Space</h2>
        <div class="gq-nasa-badge">
          <div class="gq-nasa-badge-dot"></div>
          Live · NASA Daily
        </div>
      </div>
      <div class="gq-nasa-card">
        <div class="gq-nasa-topbar"></div>
        <div class="gq-nasa-loading">
          <div class="gq-nasa-spinner"></div>
          FETCHING FROM ORBIT...
        </div>
      </div>
    `;

    // ── Find the right insertion point in the React DOM ───────────────────
    // Strategy: insert before the "Recent Sessions" h2
    function tryInsert() {
      // Look for "Recent Sessions" heading
      const headings = document.querySelectorAll('h2');
      for (const h of headings) {
        if (h.textContent && h.textContent.includes('Recent Sessions')) {
          const parent = h.closest('div') || h.parentElement;
          if (parent && parent.parentElement) {
            parent.parentElement.insertBefore(widget, parent);
            return true;
          }
        }
      }

      // Fallback: insert into #root's main content area
      const root = document.getElementById('root');
      if (root) {
        const main = root.querySelector('main') || root.firstElementChild;
        if (main) {
          const inner = main.querySelector('div > div') || main;
          inner.appendChild(widget);
          return true;
        }
      }
      return false;
    }

    // React may not have rendered yet — retry briefly
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (tryInsert() || attempts > 30) clearInterval(interval);
    }, 200);

    // ── Load data (cache first) ───────────────────────────────────────────
    const cached = getCached();
    if (cached) {
      // Small delay so DOM is ready
      setTimeout(() => render(cached), 100);
    } else {
      fetchEPIC()
        .then(data => { setCache(data); render(data); })
        .catch(() => fetchAPOD()
          .then(data => { setCache(data); render(data); })
          .catch(err => {
            const card = widget.querySelector('.gq-nasa-card');
            if (card) card.innerHTML = `<div class="gq-nasa-error">⚠ Could not load NASA image<br><span style="font-size:10px;opacity:.5">${err.message}</span></div>`;
          })
        );
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  // Also fire on React route changes (SPA navigation)
  let lastPath = location.pathname;
  const observer = new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      if (location.pathname === '/') {
        setTimeout(() => {
          if (!document.getElementById(WIDGET_ID)) inject();
        }, 300);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
