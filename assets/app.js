/* ============================================================
   NEXORA — application (vanilla JS port of the design prototype)
   No build step, no framework: open Nexora.html directly.
   Recreates the React/Babel prototype's markup, styles and
   interactions 1:1 (cart, hotspots, galleries, checkout, theme).
   ============================================================ */
(function () {
  'use strict';

  const { PRODUCTS, BUNDLE, REVIEWS, TRUST } = window.NEXORA_DATA;

  /* ---------------- helpers ---------------- */
  const money = (n) => '$' + n.toFixed(0);
  const prodById = (id) => PRODUCTS.find((p) => p.id === id);

  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v === true) e.setAttribute(k, '');
        else e.setAttribute(k, v);
      }
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      e.append(kid.nodeType ? kid : document.createTextNode(kid));
    }
    return e;
  }
  const icon = (cls) => h('i', { class: cls });
  const $ = (sel, root = document) => root.querySelector(sel);

  /* ---------------- cart state ---------------- */
  const cart = {
    items: {},          // id -> qty
    open: false,
    flash: null,
    get lines() { return Object.entries(this.items).map(([id, qty]) => ({ p: prodById(id), qty })); },
    get count() { return this.lines.reduce((s, l) => s + l.qty, 0); },
    get subtotal() { return this.lines.reduce((s, l) => s + l.p.price * l.qty, 0); },
    add(id, qty = 1) { this.items[id] = (this.items[id] || 0) + qty; this.ping(id); changed(); },
    addBundle() { BUNDLE.items.forEach((id) => { this.items[id] = (this.items[id] || 0) + 1; }); this.ping('daily-five'); changed(); },
    setQty(id, qty) { if (qty <= 0) delete this.items[id]; else this.items[id] = qty; changed(); },
    remove(id) { delete this.items[id]; changed(); },
    clear() { this.items = {}; changed(); },
    ping(id) { this.flash = id; setTimeout(() => { if (this.flash === id) { this.flash = null; updateCartUI(); } }, 700); },
    setOpen(v) { this.open = v; onTrayOpenChange(); },
  };

  function changed() { updateCartUI(); }

  /* ============================================================
     HEADER
     ============================================================ */
  const ACCENTS = ['#B5764A', '#C0613B', '#6E7657', '#43382B', '#5C6B7A'];
  let prefDark = false;
  let prefAccent = ACCENTS[0];
  try {
    const saved = JSON.parse(localStorage.getItem('nexora-prefs') || '{}');
    if (typeof saved.dark === 'boolean') prefDark = saved.dark;
    if (typeof saved.accent === 'string') prefAccent = saved.accent;
  } catch (e) { /* ignore */ }

  function applyPrefs() {
    document.documentElement.setAttribute('data-theme', prefDark ? 'dark' : 'light');
    document.documentElement.style.setProperty('--accent', prefAccent);
    try { localStorage.setItem('nexora-prefs', JSON.stringify({ dark: prefDark, accent: prefAccent })); } catch (e) {}
  }

  let cartCountBadge, prefSwitchEl, accentDotEls = [];

  function buildPref() {
    prefSwitchEl = h('button', {
      class: 'nx-switch' + (prefDark ? ' on' : ''), role: 'switch', 'aria-checked': prefDark ? 'true' : 'false',
      'aria-label': 'Dark mode',
      onclick: () => { prefDark = !prefDark; prefSwitchEl.classList.toggle('on', prefDark); prefSwitchEl.setAttribute('aria-checked', prefDark); applyPrefs(); },
    }, icon(''));

    accentDotEls = ACCENTS.map((c) => h('button', {
      class: 'nx-accent-dot' + (c === prefAccent ? ' on' : ''), style: { background: c },
      'aria-label': 'Accent ' + c, title: c,
      onclick: () => { prefAccent = c; accentDotEls.forEach((d, i) => d.classList.toggle('on', ACCENTS[i] === c)); applyPrefs(); },
    }));

    const pop = h('div', { class: 'nx-pref-pop' },
      h('div', { class: 'nx-pref-sect' },
        h('span', { class: 'nx-pref-label' }, 'Theme'),
        h('div', { class: 'nx-pref-row' }, h('span', {}, 'Dark mode'), prefSwitchEl)),
      h('div', { class: 'nx-pref-sect' },
        h('span', { class: 'nx-pref-label' }, 'Accent'),
        h('div', { class: 'nx-accents' }, accentDotEls))
    );

    const btn = h('button', { class: 'nx-pref-btn', 'aria-label': 'Appearance settings', 'aria-haspopup': 'true',
      onclick: (e) => { e.stopPropagation(); pop.classList.toggle('on'); } }, icon('ri-contrast-2-line'));

    const wrap = h('div', { class: 'nx-pref' }, btn, pop);
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) pop.classList.remove('on'); });
    return wrap;
  }

  function buildHeader() {
    cartCountBadge = h('span', { class: 'nx-cart-count' }, '0');
    cartCountBadge.style.display = 'none';
    const cartBtn = h('button', { class: 'nx-cart-btn', 'aria-label': 'Open bag', onclick: () => cart.setOpen(true) },
      icon('ri-shopping-bag-3-line'), cartCountBadge);

    const head = h('header', { class: 'nx-head' },
      h('div', { class: 'wrap nx-head-inner' },
        h('a', { href: '#top', class: 'nx-logo' }, 'nexora', h('span', { class: 'nx-logo-dot' })),
        h('nav', { class: 'nx-nav' },
          h('a', { href: '#showcase' }, 'The Five'),
          h('a', { href: '#system' }, 'The System'),
          h('a', { href: '#reviews' }, 'Reviews')),
        h('div', { class: 'nx-head-actions' }, buildPref(), cartBtn))
    );

    const onScroll = () => head.classList.toggle('solid', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return head;
  }

  /* ============================================================
     HERO
     ============================================================ */
  function buildHero() {
    return h('section', { class: 'nx-hero', id: 'top' },
      h('div', { class: 'nx-hero-grid' },
        h('div', { class: 'nx-hero-copy' },
          h('span', { class: 'eyebrow nx-hero-eyebrow' }, 'Smart · Simple · Essential'),
          h('h1', { class: 'display', html: 'The five things<br>you touch daily,<br><em class="nx-em">quietly perfected.</em>' }),
          h('p', { class: 'lede nx-hero-lede' }, 'Nexora makes a single, considered version of the everyday objects you reach for without thinking — so each one earns its place.'),
          h('div', { class: 'nx-hero-cta' },
            h('a', { href: '#showcase', class: 'btn btn-primary' }, icon('ri-arrow-down-line'), ' Explore the 5 Essentials'),
            h('button', { class: 'btn btn-ghost', onclick: () => { cart.addBundle(); cart.setOpen(true); } }, 'Shop the set')),
          h('div', { class: 'nx-hero-meta' },
            h('span', {}, icon('ri-truck-line'), ' Free 2-day shipping'),
            h('span', {}, icon('ri-shield-check-line'), ' 2-year warranty'))),
        h('div', { class: 'nx-hero-visual' },
          h('div', { class: 'nx-hero-tiles' }, PRODUCTS.map((p, i) =>
            h('figure', { class: 'nx-hero-tile' + (i === 0 ? ' feature' : '') },
              h('img', { src: p.hero, alt: p.name + ' — ' + p.category, loading: i === 0 ? 'eager' : 'lazy' }),
              h('figcaption', {},
                h('span', { class: 'nx-hero-tile-name serif' }, p.name),
                h('span', { class: 'nx-hero-tile-cat' }, p.category))))),
          h('div', { class: 'nx-hero-badge' },
            h('span', { class: 'serif' }, '5'),
            h('span', { html: 'essentials,<br>one system' })))),
      h('a', { href: '#showcase', class: 'nx-scroll-cue', 'aria-label': 'Scroll to products' }, icon('ri-arrow-down-line'))
    );
  }

  /* ============================================================
     SHOWCASE — product block with hotspots, gallery, quick-buy
     ============================================================ */
  function buildProductBlock(p, index, reversed) {
    const state = { imgIdx: 0, activeSpot: null };

    const stageWrap = h('div', { class: 'nx-stage' });
    const thumbEls = [];

    function renderStage() {
      stageWrap.innerHTML = '';
      const onHero = state.imgIdx === 0;
      stageWrap.append(h('img', { src: p.gallery[state.imgIdx], alt: p.name + ' — ' + p.category, class: 'nx-stage-img' }));
      if (onHero) {
        p.hotspots.forEach((s, i) => stageWrap.append(buildHotspot(s, i)));
        stageWrap.append(h('span', { class: 'nx-stage-hint' }, icon('ri-focus-3-line'), ' Tap to explore'));
      }
    }

    function buildHotspot(spot, i) {
      const flip = spot.x > 55;
      const card = h('div', { class: 'nx-hs-card' + (flip ? ' flip' : '') },
        h('span', { class: 'nx-hs-title' }, spot.title),
        h('span', { class: 'nx-hs-body' }, spot.body));
      const dotIcon = icon(state.activeSpot === i ? 'ri-close-line' : 'ri-add-line');
      const dot = h('button', { class: 'nx-hs-dot' + (state.activeSpot === i ? ' on' : ''), 'aria-label': spot.title,
        onclick: () => { state.activeSpot = state.activeSpot === i ? null : i; renderStage(); } },
        h('span', { class: 'nx-hs-ring' }), dotIcon);
      if (state.activeSpot === i) card.classList.add('on');
      return h('div', { class: 'nx-hs', style: { left: spot.x + '%', top: spot.y + '%' } }, dot, card);
    }

    p.gallery.forEach((g, i) => {
      const t = h('button', { class: 'nx-thumb' + (i === 0 ? ' on' : ''), 'aria-label': 'View image ' + (i + 1),
        onclick: () => { state.imgIdx = i; state.activeSpot = null; thumbEls.forEach((te, j) => te.classList.toggle('on', j === i)); renderStage(); } },
        h('img', { src: g, alt: '' }));
      thumbEls.push(t);
    });

    renderStage();

    const visual = h('div', { class: 'nx-prod-visual' }, stageWrap, h('div', { class: 'nx-thumbs' }, thumbEls));

    /* ---- buy controls (cart-dependent; refreshed by updateCartUI) ---- */
    let qty = 1;
    const qtyLabel = h('span', {}, '1');
    const stepper = h('div', { class: 'nx-stepper light' },
      h('button', { 'aria-label': 'Decrease', onclick: () => { qty = Math.max(1, qty - 1); qtyLabel.textContent = qty; } }, icon('ri-subtract-line')),
      qtyLabel,
      h('button', { 'aria-label': 'Increase', onclick: () => { qty = qty + 1; qtyLabel.textContent = qty; } }, icon('ri-add-line')));

    const buyBtn = h('button', { class: 'btn btn-accent', onclick: () => cart.add(p.id, qty) }, icon('ri-add-line'), 'Quick buy');
    const inbagLine = h('button', { class: 'nx-inbag', onclick: () => cart.setOpen(true) });
    inbagLine.style.display = 'none';

    function refreshBuy() {
      const n = cart.items[p.id];
      buyBtn.innerHTML = '';
      buyBtn.append(icon(n ? 'ri-check-double-line' : 'ri-add-line'), n ? 'Add more' : 'Quick buy');
      if (n) { inbagLine.style.display = ''; inbagLine.textContent = n + ' in bag · view'; }
      else inbagLine.style.display = 'none';
    }
    buyRefreshers.push(refreshBuy);

    const copy = h('div', { class: 'nx-prod-copy' },
      h('div', { class: 'nx-prod-idx' },
        h('span', { class: 'serif' }, String(index + 1).padStart(2, '0')),
        h('span', { class: 'nx-prod-cat eyebrow' }, p.category)),
      h('h3', { class: 'nx-prod-name serif' }, p.name),
      h('p', { class: 'nx-prod-tag' }, p.tagline),
      h('div', { class: 'nx-pair' },
        h('div', { class: 'nx-pair-col' },
          h('span', { class: 'nx-pair-label' }, icon('ri-error-warning-line'), ' The micro-problem'),
          h('p', {}, p.problem)),
        h('div', { class: 'nx-pair-col solution' },
          h('span', { class: 'nx-pair-label' }, icon('ri-lightbulb-flash-line'), ' The smart solution'),
          h('p', {}, p.solution))),
      h('div', { class: 'nx-specs' }, p.specs.map((s) => h('span', { class: 'nx-chip' }, icon('ri-check-line'), s))),
      h('div', { class: 'nx-buy' }, h('span', { class: 'nx-buy-price' }, money(p.price)), stepper, buyBtn),
      inbagLine
    );

    return h('article', { class: 'nx-prod' + (reversed ? ' rev' : ''), 'data-screen-label': p.name, id: 'product-' + p.id }, visual, copy);
  }

  const buyRefreshers = [];

  function buildShowcase() {
    return h('section', { id: 'showcase', class: 'nx-showcase' },
      h('div', { class: 'wrap nx-showcase-head' },
        h('span', { class: 'eyebrow' }, 'The Niche Utility Showcase'),
        h('h2', { class: 'h2', html: 'Five things you already use, engineered like they matter.' }),
        h('p', { class: 'lede' }, 'Each one solves a quiet daily frustration you stopped noticing. Tap any product to see the smart parts up close.')),
      h('div', { class: 'wrap nx-showcase-list' }, PRODUCTS.map((p, i) => buildProductBlock(p, i, i % 2 === 1)))
    );
  }

  /* ============================================================
     ECOSYSTEM
     ============================================================ */
  function buildEcosystem() {
    const items = BUNDLE.items.map(prodById);
    const full = items.reduce((s, p) => s + p.price, 0);
    const bundlePrice = full - BUNDLE.saving;
    return h('section', { id: 'system', class: 'nx-eco' },
      h('div', { class: 'wrap nx-eco-inner' },
        h('div', { class: 'nx-eco-copy' },
          h('span', { class: 'eyebrow' }, 'Why the five work as one'),
          h('h2', { class: 'h2', html: 'A complete daily setup,<br>not five separate things.' }),
          h('p', { class: 'lede' }, 'Designed in one material language — warm neutrals, honest materials, no clutter. On your nightstand, in your bag, on your desk: they look like they belong together because they do.'),
          h('ul', { class: 'nx-eco-list' },
            h('li', {}, icon('ri-checkbox-circle-line'), ' One coherent aesthetic across every room you move through'),
            h('li', {}, icon('ri-checkbox-circle-line'), ' Nothing to configure, charge weekly, or think about'),
            h('li', {}, icon('ri-checkbox-circle-line'), ' Buy the set once, replace the daily-friction habit for good'))),
        h('div', { class: 'nx-eco-card' },
          h('div', { class: 'nx-eco-card-head' },
            h('div', {},
              h('span', { class: 'eyebrow', style: { color: 'var(--ink-faint)' } }, BUNDLE.sublabel),
              h('h3', { class: 'serif' }, BUNDLE.name)),
            h('span', { class: 'nx-eco-save' }, 'Save $' + BUNDLE.saving)),
          h('div', { class: 'nx-eco-row' }, items.map((p) =>
            h('a', { key: p.id, href: '#product-' + p.id, class: 'nx-eco-item', title: p.name },
              h('img', { src: p.hero, alt: p.name }), h('span', {}, p.name)))),
          h('div', { class: 'nx-eco-pricing' },
            h('div', { class: 'nx-eco-price' },
              h('span', { class: 'nx-eco-was' }, money(full)),
              h('span', { class: 'nx-eco-now serif' }, money(bundlePrice))),
            h('button', { class: 'btn btn-accent', onclick: () => { cart.addBundle(); cart.setOpen(true); } },
              icon('ri-shopping-bag-3-line'), ' Add the Daily Five'))))
    );
  }

  /* ============================================================
     REVIEWS + TRUST
     ============================================================ */
  function buildReviews() {
    return h('section', { id: 'reviews', class: 'nx-reviews' },
      h('div', { class: 'wrap' },
        h('div', { class: 'nx-reviews-head' },
          h('span', { class: 'eyebrow' }, 'Used daily, reviewed honestly'),
          h('h2', { class: 'h2', html: '"I didn’t know I needed this<br>until I used it every day."' })),
        h('div', { class: 'nx-reviews-grid' }, REVIEWS.map((r, i) =>
          h('figure', { class: 'nx-review' + (i === 0 ? ' feature' : '') },
            h('div', { class: 'nx-stars' }, Array.from({ length: 5 }, () => icon('ri-star-fill'))),
            h('blockquote', {}, r.quote),
            h('figcaption', {},
              h('span', { class: 'nx-review-name' }, r.name),
              h('span', { class: 'nx-review-meta' }, r.product + ' · ' + r.city))))),
        h('div', { class: 'nx-trust' }, TRUST.map((t) =>
          h('div', { class: 'nx-trust-item' }, icon(t.icon),
            h('div', {}, h('span', { class: 'nx-trust-title' }, t.title), h('span', { class: 'nx-trust-body' }, t.body))))))
    );
  }

  /* ============================================================
     FOOTER
     ============================================================ */
  function buildFooter() {
    return h('footer', { class: 'nx-foot' },
      h('div', { class: 'wrap nx-foot-grid' },
        h('div', { class: 'nx-foot-brand' },
          h('a', { href: '#top', class: 'nx-logo big' }, 'nexora', h('span', { class: 'nx-logo-dot' })),
          h('p', {}, 'Smart, simple, essential. The everyday, quietly perfected.'),
          h('button', { class: 'btn btn-accent btn-sm', onclick: () => { cart.addBundle(); cart.setOpen(true); } }, 'Shop the Daily Five')),
        h('div', { class: 'nx-foot-cols' },
          h('div', {}, h('span', { class: 'nx-foot-h' }, 'Shop'), h('a', { href: '#showcase' }, 'The Five'), h('a', { href: '#system' }, 'The Daily Five set'), h('a', { href: '#reviews' }, 'Reviews')),
          h('div', {}, h('span', { class: 'nx-foot-h' }, 'Care'), h('a', { href: '#' }, 'Warranty'), h('a', { href: '#' }, 'Returns'), h('a', { href: '#' }, 'Shipping')),
          h('div', {}, h('span', { class: 'nx-foot-h' }, 'Company'), h('a', { href: '#' }, 'Materials'), h('a', { href: '#' }, 'Contact'), h('a', { href: '#' }, 'Journal'))),
        h('div', { class: 'nx-foot-news' },
          h('span', { class: 'nx-foot-h' }, 'The quiet list'),
          h('p', {}, 'One email when something new joins the five. Never more.'),
          h('form', { class: 'nx-news-form', onsubmit: (e) => e.preventDefault() },
            h('input', { type: 'email', placeholder: 'you@email.com', 'aria-label': 'Email' }),
            h('button', { class: 'btn btn-primary btn-sm', type: 'submit' }, 'Join')))),
      h('div', { class: 'wrap nx-foot-base' },
        h('span', {}, '© 2026 Nexora'),
        h('span', {}, 'Designed for the everyday.'))
    );
  }

  /* ============================================================
     FLOATING CONVERSION BAR
     ============================================================ */
  let barEl, barDotEls = {}, barProgress, barSubtotal, barBagBtn;

  function buildFloatingBar() {
    barDotEls = {};
    const dots = PRODUCTS.map((p) => {
      const d = h('button', { class: 'nx-dot', title: 'Add ' + p.name, 'aria-label': 'Add ' + p.name,
        onclick: () => { if (cart.items[p.id]) cart.setOpen(true); else cart.add(p.id); } },
        h('img', { src: p.hero, alt: '' }));
      barDotEls[p.id] = d;
      return d;
    });

    barProgress = h('span', { class: 'nx-bar-progress' }, 'Tap to add an essential');
    barSubtotal = h('span', { class: 'nx-bar-total-val' }, '$0');
    barBagBtn = h('button', { class: 'btn btn-accent btn-sm', onclick: () => cart.setOpen(true) },
      icon('ri-shopping-bag-3-line'), ' Bag · 0');
    barBagBtn.disabled = true;

    barEl = h('div', { class: 'nx-bar', role: 'region', 'aria-label': 'Your daily setup' },
      h('div', { class: 'nx-bar-inner' },
        h('div', { class: 'nx-bar-label' },
          h('span', { class: 'eyebrow', style: { color: 'var(--ink-faint)' } }, 'Your setup'),
          barProgress),
        h('div', { class: 'nx-dots' }, dots),
        h('div', { class: 'nx-bar-right' },
          h('div', { class: 'nx-bar-total' },
            h('span', { class: 'nx-bar-total-label' }, 'Subtotal'),
            barSubtotal),
          barBagBtn))
    );

    const onScroll = () => barEl.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return barEl;
  }

  /* ============================================================
     CART TRAY + CHECKOUT
     ============================================================ */
  let scrimEl, trayEl, trayHeadTitle, trayStage = 'bag';

  function buildTray() {
    scrimEl = h('div', { class: 'nx-scrim', onclick: () => cart.setOpen(false) });
    trayHeadTitle = h('span', { class: 'serif', style: { fontSize: '26px' } }, 'Your bag');
    trayEl = h('aside', { class: 'nx-tray', 'aria-hidden': 'true', 'aria-label': 'Shopping bag' },
      h('header', { class: 'nx-tray-head' }, trayHeadTitle,
        h('button', { class: 'nx-x', 'aria-label': 'Close', onclick: () => cart.setOpen(false) }, icon('ri-close-line'))));

    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') cart.setOpen(false); });
    return h('div', {}, scrimEl, trayEl);
  }

  function setStage(s) { trayStage = s; renderTrayBody(); }

  function renderTrayBody() {
    // remove everything after the header
    while (trayEl.children.length > 1) trayEl.lastChild.remove();
    trayHeadTitle.textContent = trayStage === 'bag' ? 'Your bag' : trayStage === 'checkout' ? 'Checkout' : 'Order placed';
    if (trayStage === 'bag') renderBagStage();
    else if (trayStage === 'checkout') renderCheckoutStage();
    else renderDoneStage();
  }

  function renderBagStage() {
    const shipping = 0;
    const total = cart.subtotal + shipping;
    if (cart.count === 0) {
      trayEl.append(h('div', { class: 'nx-tray-body nx-empty' },
        icon('ri-shopping-bag-3-line'),
        h('p', {}, 'Your bag is empty.'),
        h('span', {}, 'Add one of the five essentials to begin.')));
      return;
    }
    const body = h('div', { class: 'nx-tray-body' });
    cart.lines.forEach(({ p, qty }) => {
      body.append(h('div', { class: 'nx-line' },
        h('img', { class: 'nx-line-img', src: p.hero, alt: p.name }),
        h('div', { class: 'nx-line-mid' },
          h('div', { class: 'nx-line-top' },
            h('span', { class: 'nx-line-name' }, p.name),
            h('button', { class: 'nx-line-rm', 'aria-label': 'Remove ' + p.name, onclick: () => cart.remove(p.id) }, icon('ri-delete-bin-line'))),
          h('span', { class: 'nx-line-cat' }, p.category),
          h('div', { class: 'nx-line-bottom' },
            h('div', { class: 'nx-stepper' },
              h('button', { 'aria-label': 'Decrease', onclick: () => cart.setQty(p.id, qty - 1) }, icon('ri-subtract-line')),
              h('span', {}, String(qty)),
              h('button', { 'aria-label': 'Increase', onclick: () => cart.setQty(p.id, qty + 1) }, icon('ri-add-line'))),
            h('span', { class: 'nx-line-price' }, money(p.price * qty))))));
    });
    // bundle nudge
    const inCart = Object.keys(cart.items).length;
    if (inCart < 5) {
      body.append(h('button', { class: 'nx-nudge', onclick: () => cart.addBundle() },
        h('div', {},
          h('span', { class: 'nx-nudge-title' }, 'Complete the Daily Five'),
          h('span', { class: 'nx-nudge-sub' }, 'Add the ' + (5 - inCart) + ' missing essential' + (5 - inCart > 1 ? 's' : '') + ' — save $' + BUNDLE.saving + '.')),
        icon('ri-add-circle-line')));
    }
    trayEl.append(body);

    trayEl.append(h('footer', { class: 'nx-tray-foot' },
      h('div', { class: 'nx-foot-row' }, h('span', {}, 'Subtotal'), h('span', {}, money(cart.subtotal))),
      h('div', { class: 'nx-foot-row muted' }, h('span', {}, 'Shipping'), h('span', {}, 'Free')),
      h('div', { class: 'nx-foot-row total' }, h('span', {}, 'Total'), h('span', {}, money(total))),
      h('button', { class: 'btn btn-accent', style: { width: '100%', justifyContent: 'center', marginTop: '14px' }, onclick: () => setStage('checkout') },
        'Checkout · ' + money(total)),
      h('button', { class: 'nx-foot-link', onclick: () => cart.setOpen(false) }, 'Continue shopping')));
  }

  function renderCheckoutStage() {
    const total = cart.subtotal;
    const mk = (label, attrs) => {
      const input = h('input', attrs);
      return { group: h('div', { class: 'nx-field-group' }, h('label', {}, label), input), input };
    };
    const email = mk('Email', { type: 'email', placeholder: 'you@email.com' });
    const name = mk('Full name', { placeholder: 'Alex Morgan' });
    const address = mk('Address', { placeholder: '123 Maple Street' });
    const city = mk('City', { placeholder: 'Portland' });
    const zipInput = h('input', { placeholder: '97201' });
    const zip = { group: h('div', { class: 'nx-field-group', style: { maxWidth: '120px' } }, h('label', {}, 'ZIP'), zipInput), input: zipInput };
    const card = h('input', { placeholder: '4242 4242 4242 4242', inputmode: 'numeric' });

    const form = h('form', { class: 'nx-tray-body nx-form' },
      h('button', { type: 'button', class: 'nx-back', onclick: () => setStage('bag') }, icon('ri-arrow-left-line'), ' Back to bag'),
      email.group, name.group, address.group,
      h('div', { class: 'nx-field-row' }, city.group, zip.group),
      h('div', { class: 'nx-field-group' },
        h('label', {}, 'Card number'),
        h('div', { class: 'nx-card-input' }, icon('ri-bank-card-line'), card),
        h('span', { class: 'nx-secure' }, icon('ri-lock-2-line'), ' Encrypted & secure · demo checkout')),
      h('footer', { class: 'nx-form-foot' },
        h('div', { class: 'nx-foot-row total' }, h('span', {}, 'Total'), h('span', {}, money(total))),
        h('button', { type: 'submit', class: 'btn btn-accent', style: { width: '100%', justifyContent: 'center', marginTop: '8px' } },
          'Place order · ' + money(total)))
    );

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const checks = [
        [email.input, !email.input.value.includes('@')],
        [name.input, !name.input.value],
        [address.input, !address.input.value],
        [city.input, !city.input.value],
        [zip.input, zip.input.value.length < 4],
        [card, card.value.replace(/\s/g, '').length < 12],
      ];
      let ok = true;
      checks.forEach(([el, bad]) => { el.classList.toggle('bad', bad); if (bad) ok = false; });
      if (ok) setStage('done');
    });

    trayEl.append(form);
  }

  function renderDoneStage() {
    const items = h('div', { class: 'nx-done-items' }, cart.lines.map(({ p, qty }) =>
      h('div', { class: 'nx-done-item' }, h('img', { src: p.hero, alt: '' }), h('span', {}, p.name + (qty > 1 ? ' ×' + qty : '')))));
    trayEl.append(h('div', { class: 'nx-tray-body nx-done' },
      h('div', { class: 'nx-done-mark' }, icon('ri-check-line')),
      h('h3', { class: 'serif' }, 'You’re all set.'),
      h('p', {}, 'Your essentials are on the way — free 2-day shipping, with tracking sent to your inbox.'),
      items,
      h('button', { class: 'btn btn-primary', style: { width: '100%', justifyContent: 'center' }, onclick: () => { cart.clear(); cart.setOpen(false); } }, 'Done')));
  }

  function onTrayOpenChange() {
    scrimEl.classList.toggle('on', cart.open);
    trayEl.classList.toggle('on', cart.open);
    trayEl.setAttribute('aria-hidden', cart.open ? 'false' : 'true');
    document.body.style.overflow = cart.open ? 'hidden' : '';
    if (cart.open) renderTrayBody();
    else setTimeout(() => { trayStage = 'bag'; }, 350);
    updateCartUI();
  }

  /* ============================================================
     CART-DEPENDENT UI REFRESH
     ============================================================ */
  function updateCartUI() {
    const count = cart.count;
    // header badge
    cartCountBadge.textContent = String(count);
    cartCountBadge.style.display = count > 0 ? '' : 'none';
    // floating bar
    PRODUCTS.forEach((p) => {
      const d = barDotEls[p.id];
      const inCart = !!cart.items[p.id];
      d.classList.toggle('on', inCart);
      d.classList.toggle('flash', cart.flash === p.id);
      d.title = inCart ? p.name + ' — in bag' : 'Add ' + p.name;
      d.setAttribute('aria-label', inCart ? p.name + ' in bag' : 'Add ' + p.name);
      let check = d.querySelector('.nx-dot-check');
      if (inCart && !check) d.append(h('span', { class: 'nx-dot-check' }, icon('ri-check-line')));
      else if (!inCart && check) check.remove();
    });
    barProgress.textContent = count > 0 ? Object.keys(cart.items).length + ' of 5 essentials' : 'Tap to add an essential';
    barSubtotal.textContent = money(cart.subtotal);
    barBagBtn.innerHTML = '';
    barBagBtn.append(icon('ri-shopping-bag-3-line'), ' Bag · ' + count);
    barBagBtn.disabled = count === 0;
    // per-product buy rows
    buyRefreshers.forEach((fn) => fn());
    // open tray bag stage live-updates
    if (cart.open && trayStage === 'bag') renderTrayBody();
  }

  /* ============================================================
     MOUNT
     ============================================================ */
  applyPrefs();
  const root = document.getElementById('root');
  root.append(buildHeader());
  const main = h('main', {}, buildHero(), buildShowcase(), buildEcosystem(), buildReviews());
  root.append(main, buildFooter(), buildFloatingBar(), buildTray());
  updateCartUI();
})();
