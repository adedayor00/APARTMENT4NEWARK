/* apartments4newark.com — application logic
   Vanilla JS, no build step, no framework — matches the "plain CSS/plain
   markup" spirit of the Modernist design system. Ephemeral state only:
   no accounts, no localStorage, per the handoff README. */

(function () {
  'use strict';

  // ───────────────────────── state ─────────────────────────
  const state = {
    screen: 'board', // board | request | roommate | list | chat | fees
    q: '',
    cityFilter: null, // null | 'Newark' | 'East Orange' | 'Maplewood' — independent of typed search
    selIdx: 0,
    showingDetail: false, // mobile only: list vs detail screen
    sort: 'price', // price | rooms | city
    chatMode: 'renter', // renter | roommate | lister
    errors: [],
    clock: '',
    menuOpen: false,
    sheetOpen: false,
    form: { name: '', age: '', phone: '', email: '', location: '', budget: '', rooms: '1 room', moveIn: '', employment: '', income: '', pets: 'No pets', smoking: 'Non-smoker', note: '' },
    rm: { name: '', age: '', phone: '', email: '', work: '', schedule: 'Regular daytime hours', address: '', unit: '', city: '', beds: '', baths: '', rent: '', from: '', utilities: 'Split evenly between tenants', living: '', household: '', wanted: '', pets: 'No pets in the apartment', smoking: 'Non-smoking apartment', note: '', permission: '' },
    list: { name: '', phone: '', email: '', role: '', kind: '', address: '', unit: '', city: '', beds: '', baths: '', rent: '', roomsOpen: '', from: '', utilities: 'Not included', features: '', pets: 'No pets', smoking: 'Non-smoking', note: '', permission: '' }
  };

  // ───────────────────────── helpers ─────────────────────────
  function escapeHtml(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function isMobileWidth() { return window.matchMedia('(max-width: 430px)').matches; }
  function pad2(n) { return String(n).padStart(2, '0'); }

  // ───────────────────────── search parser ─────────────────────────
  function parseQuery() {
    const q = state.q.toLowerCase();
    const out = { city: null, max: null, min: null, type: null, beds: null, chips: [] };
    if (!q.trim()) return out;
    CITY_WORDS.forEach(c => { if (!out.city && c.match.some(m => q.indexOf(m) > -1)) out.city = c.city; });
    if (/\broom/.test(q) && !/\bapart|\bwhole|\bunit/.test(q)) out.type = 'room';
    if (/\bapart|\bwhole|\bunit/.test(q)) out.type = 'apartment';
    const bed = q.match(/(\d)\s*(bed|br\b)/);
    if (bed) out.beds = Number(bed[1]);
    const under = q.match(/(?:under|below|max|<)\s*\$?\s*([\d,]{3,6})/);
    const over = q.match(/(?:over|above|from|>)\s*\$?\s*([\d,]{3,6})/);
    const bare = q.match(/\$\s*([\d,]{3,6})/) || q.match(/\b([\d,]{3,6})\b/);
    if (under) out.max = Number(under[1].replace(/,/g, ''));
    if (over) out.min = Number(over[1].replace(/,/g, ''));
    if (!under && !over && bare) out.max = Number(bare[1].replace(/,/g, ''));
    if (out.city) out.chips.push(out.city.toUpperCase());
    if (out.type) out.chips.push(out.type === 'room' ? 'ROOMS ONLY' : 'WHOLE UNITS');
    if (out.beds) out.chips.push(out.beds + ' BEDROOMS');
    if (out.max) out.chips.push('UNDER $' + out.max.toLocaleString());
    if (out.min) out.chips.push('OVER $' + out.min.toLocaleString());
    return out;
  }

  // ───────────────────────── derived listing fields ─────────────────────────
  function decorate(l) {
    const isRoom = l.type === 'room';
    const rooms = [];
    if (isRoom) {
      for (let i = 0; i < l.beds; i++) {
        const free = i < l.open;
        rooms.push({
          name: 'Room ' + (i + 1) + (i === 0 && l.features.indexOf('Big room') > -1 ? ' — the big one' : ''),
          rent: free ? '$' + l.price.toLocaleString() : '—',
          bath: 'SHARED · ' + l.baths + ' BATH',
          status: free ? 'FREE' : 'TAKEN',
          free
        });
      }
    }
    const util = l.features.filter(f => /included/i.test(f));
    return Object.assign({}, l, {
      isRoom, rooms,
      fullAddress: l.unit ? l.address + ' — ' + l.unit : l.address,
      boardName: l.address.toUpperCase() + (l.unit ? ' · ' + l.unit.toUpperCase() : ''),
      boardMeta: l.address === l.city ? 'ADDRESS ON REQUEST' : (l.area === l.city ? l.city.toUpperCase() : l.city.toUpperCase() + ' · ' + l.area.toUpperCase()),
      sizeLabel: l.beds + 'BR/' + l.baths + 'BA',
      priceLabel: '$' + l.price.toLocaleString(),
      priceUnit: isRoom ? 'per room, per month' : 'whole unit, per month',
      statusLabel: isRoom ? (l.open === 1 ? '1 ROOM FREE' : l.open + ' ROOMS FREE') : 'WHOLE UNIT',
      utilLabel: util.length ? util.join(' · ') : 'Ask',
      included: l.features.length ? l.features : ['Utilities are not stated for this unit — ask and we will confirm before you apply'],
      arrangement: isRoom
        ? 'You would share the kitchen, living room and bathroom with the current tenants. Names stay private until both sides want to go ahead, and you meet them before anything is signed.'
        : 'You are renting the entire unit, so there are no roommates unless you bring them.'
    });
  }

  function rows() {
    const p = parseQuery();
    const sort = state.sort;
    let out = LISTINGS.filter(l =>
      (!p.city || l.city === p.city) &&
      (!state.cityFilter || l.city === state.cityFilter) &&
      (!p.type || l.type === p.type) &&
      (!p.beds || l.beds === p.beds) &&
      (!p.max || l.price <= p.max) &&
      (!p.min || l.price >= p.min)
    );
    out.sort((a, b) =>
      sort === 'rooms' ? (b.open - a.open) || (a.price - b.price)
        : sort === 'city' ? a.city.localeCompare(b.city) || (a.price - b.price)
          : a.price - b.price
    );
    return out.map(decorate);
  }

  function currentSel() {
    const list = rows();
    if (!list.length) return null;
    const idx = Math.max(0, Math.min(list.length - 1, state.selIdx));
    return list[idx];
  }

  // ───────────────────────── messaging ─────────────────────────
  function e164() {
    return '+1' + CONFIG.phone.replace(/\D/g, '').slice(-10);
  }
  function telegramLink() {
    return CONFIG.telegramUsername ? 'https://t.me/' + CONFIG.telegramUsername : 'https://t.me/' + e164();
  }
  function waForListing(l) {
    const text = l
      ? 'Hi, I am interested in ' + (l.unit ? l.address + ' — ' + l.unit : l.address) + ', ' + l.city + ' ($' + l.price.toLocaleString() + '). Is it still available?'
      : 'Hi, I am looking for a room in North Jersey.';
    return 'https://wa.me/' + e164().replace('+', '') + '?text=' + encodeURIComponent(text);
  }
  function smsForListing(l) {
    const text = l
      ? 'Hi, I am interested in ' + (l.unit ? l.address + ' — ' + l.unit : l.address) + ', ' + l.city + ' ($' + l.price.toLocaleString() + '). Is it still available?'
      : 'Hi, I am looking for a room in North Jersey.';
    return 'sms:' + e164() + '?body=' + encodeURIComponent(text);
  }

  function msgFor(mode) {
    if (mode === 'lister') {
      const l = state.list;
      return [
        'Hi, I want to list a place on apartments4newark.com.',
        l.kind + ' — ' + l.role,
        'Address: ' + l.address + (l.unit ? ', ' + l.unit : '') + ', ' + l.city,
        'Size: ' + l.beds + ' bed / ' + l.baths + ' bath' + (l.roomsOpen ? ' · ' + l.roomsOpen + ' room(s) to fill' : ''),
        'Rent: ' + l.rent + ' | Available: ' + l.from,
        'Utilities: ' + l.utilities,
        'Rules: ' + l.pets + ', ' + l.smoking,
        l.features ? 'Features: ' + l.features : '',
        l.permission ? 'I confirm I have the right to rent or sublet this unit.' : '',
        'Contact: ' + l.name + ' — ' + l.phone + ' | ' + l.email,
        l.note ? 'Notes: ' + l.note : ''
      ].filter(Boolean).join('\n');
    }
    if (mode === 'roommate') {
      const r = state.rm;
      return [
        'Hi, I am looking for a roommate and would like the room listed.',
        'Apartment: ' + r.address + (r.unit ? ', ' + r.unit : '') + ', ' + r.city,
        'Size: ' + r.beds + ' bed / ' + r.baths + ' bath | Room rent: ' + r.rent,
        'Free from: ' + r.from + ' | Utilities: ' + r.utilities,
        'Me: ' + r.name + ', ' + r.age + ' — ' + r.work + ' (' + r.schedule + ')',
        r.living ? 'Living here now: ' + r.living : '',
        r.household ? 'Household style: ' + r.household : '',
        r.wanted ? 'Looking for: ' + r.wanted : '',
        'Rules: ' + r.pets + ', ' + r.smoking,
        r.permission ? 'My lease or owner allows a roommate.' : '',
        'Contact: ' + r.phone + ' | ' + r.email,
        r.note ? 'Notes: ' + r.note : '',
        'I have photos of the apartment ready to send.'
      ].filter(Boolean).join('\n');
    }
    const f = state.form;
    const sel = currentSel();
    return [
      sel ? (sel.isRoom ? 'Hi, I am interested in a room at:' : 'Hi, I am interested in renting this apartment:') : 'Hi, I am looking for a place. Nothing picked yet.',
      sel ? sel.fullAddress + ', ' + sel.city + ' — ' + sel.priceLabel + ' ' + sel.priceUnit : '',
      'Name: ' + f.name + ' (' + f.age + ')',
      'Phone: ' + f.phone + ' | Email: ' + f.email,
      'Location: ' + f.location + ' | Space: ' + f.rooms,
      'Budget: ' + f.budget + ' | Move-in: ' + f.moveIn,
      'Employment: ' + f.employment + (f.income ? ' (' + f.income + '/mo)' : ''),
      f.pets + ', ' + f.smoking,
      f.note ? 'Notes: ' + f.note : ''
    ].filter(Boolean).join('\n');
  }

  function summaryFor(mode) {
    const s = state, sel = currentSel();
    const rowsOut = (mode === 'roommate' ? [
      { k: 'Apartment', v: s.rm.address + (s.rm.unit ? ', ' + s.rm.unit : '') },
      { k: 'City', v: s.rm.city },
      { k: 'Size', v: s.rm.beds ? s.rm.beds + ' bed · ' + s.rm.baths + ' bath' : '' },
      { k: 'Room rent', v: s.rm.rent }, { k: 'Free from', v: s.rm.from },
      { k: 'Utilities', v: s.rm.utilities },
      { k: 'You', v: s.rm.name + (s.rm.age ? ', ' + s.rm.age : '') },
      { k: 'Work', v: s.rm.work }, { k: 'Hours', v: s.rm.schedule },
      { k: 'Looking for', v: s.rm.wanted },
      { k: 'Phone', v: s.rm.phone }, { k: 'Email', v: s.rm.email }
    ] : mode === 'lister' ? [
      { k: 'Listing', v: s.list.kind }, { k: 'You are the', v: s.list.role },
      { k: 'Address', v: s.list.address + (s.list.unit ? ', ' + s.list.unit : '') },
      { k: 'City', v: s.list.city },
      { k: 'Size', v: s.list.beds ? s.list.beds + ' bed · ' + s.list.baths + ' bath' : '' },
      { k: 'Rent', v: s.list.rent }, { k: 'Rooms to fill', v: s.list.roomsOpen },
      { k: 'Available', v: s.list.from }, { k: 'Utilities', v: s.list.utilities },
      { k: 'Contact', v: s.list.name }, { k: 'Phone', v: s.list.phone }, { k: 'Email', v: s.list.email }
    ] : [
      { k: 'Listing', v: sel ? sel.fullAddress : 'Still deciding' },
      { k: 'Name', v: s.form.name + (s.form.age ? ', ' + s.form.age : '') },
      { k: 'Phone', v: s.form.phone }, { k: 'Email', v: s.form.email },
      { k: 'Location', v: s.form.location }, { k: 'Budget', v: s.form.budget },
      { k: 'Space', v: s.form.rooms }, { k: 'Move-in', v: s.form.moveIn },
      { k: 'Employment', v: s.form.employment }, { k: 'Pets', v: s.form.pets }, { k: 'Smoking', v: s.form.smoking }
    ]);
    return rowsOut.filter(x => String(x.v || '').trim());
  }

  // ───────────────────────── validation / submit ─────────────────────────
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function digitCount(v) { return String(v || '').replace(/\D/g, '').length; }

  function validateAndSubmit(bag, reqMap, mode) {
    const d = state[bag];
    const errors = Object.keys(reqMap).filter(k => !String(d[k] || '').trim()).map(k => reqMap[k]);
    // Format checks only run on fields that were actually filled in — an
    // empty required field is already caught above with its own message.
    if (d.email && String(d.email).trim() && !EMAIL_RE.test(String(d.email).trim())) {
      errors.push('a valid email (it doesn’t look like one)');
    }
    if (d.phone && String(d.phone).trim() && digitCount(d.phone) < 10) {
      errors.push('a valid 10-digit phone number');
    }
    if (errors.length) {
      state.errors = errors;
      render({ focusMain: true });
      window.scrollTo(0, 0);
      return;
    }
    state.chatMode = mode;
    state.errors = [];
    go('chat');
  }

  // ───────────────────────── routing ─────────────────────────
  function routeFromHash() {
    const hash = location.hash.replace(/^#\/?/, '');
    const parts = hash.split('/').filter(Boolean);
    state.errors = [];
    state.menuOpen = false;
    state.sheetOpen = false;
    if (!parts.length) { state.screen = 'board'; state.showingDetail = false; return; }
    const seg = parts[0];
    if (seg === 'listing' && parts[1]) {
      const list = rows();
      const idx = list.findIndex(r => r.id === parts[1]);
      if (idx < 0) { state.screen = 'notfound'; return; }
      state.screen = 'board';
      state.q = '';
      state.sort = 'price';
      state.selIdx = idx;
      state.showingDetail = true;
      return;
    }
    if (['request', 'roommate', 'list', 'fees', 'chat'].indexOf(seg) > -1) { state.screen = seg; return; }
    state.screen = 'notfound';
  }

  function go(screen, opts) {
    opts = opts || {};
    state.screen = screen;
    state.errors = [];
    state.menuOpen = false;
    state.sheetOpen = false;
    if (screen === 'board') state.showingDetail = !!opts.showingDetail;
    let path = '/' + screen;
    if (screen === 'board') {
      const sel = opts.listingId ? null : currentSel();
      path = opts.listingId ? '/listing/' + opts.listingId : (sel ? '/listing/' + sel.id : '/');
    }
    history.pushState(null, '', '#' + path);
    render({ focusMain: true });
    window.scrollTo(0, 0);
  }

  function setSelection(idx, opts) {
    opts = opts || {};
    const list = rows();
    if (!list.length) return;
    state.selIdx = Math.max(0, Math.min(list.length - 1, idx));
    const r = list[state.selIdx];
    const path = '/listing/' + r.id;
    if (opts.navigate) { state.showingDetail = true; history.pushState(null, '', '#' + path); }
    else { history.replaceState(null, '', '#' + path); }
  }

  // ───────────────────────── clock ─────────────────────────
  function tick() {
    const d = new Date();
    state.clock = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    document.querySelectorAll('.js-clock').forEach(el => { el.textContent = 'LIVE ' + state.clock; });
  }

  // expose for render module
  window.A4N = {
    state, escapeHtml, isMobileWidth, parseQuery, decorate, rows, currentSel,
    e164, telegramLink, waForListing, smsForListing, msgFor, summaryFor,
    validateAndSubmit, routeFromHash, go, setSelection, tick, render: opts => render(opts)
  };

  // render() is defined in render.js and attached to window.A4N.render via
  // A4N.setRenderer once that file loads.
  let renderImpl = null;
  Object.defineProperty(window.A4N, 'setRenderer', { value: fn => { renderImpl = fn; } });
  function render(opts) { if (renderImpl) renderImpl(opts); }

  // ───────────────────────── live listings (content/listings.json) ─────────────────────────
  // content/listings.json is the file /admin (Decap CMS) reads and writes.
  // The LISTINGS array from data.js is shown immediately so the page never
  // waits on a network round trip; if content/listings.json loads with at
  // least one listing, it replaces LISTINGS and the board re-renders.
  function normalizeListing(l) {
    return Object.assign({
      unit: '', area: l && l.city ? l.city : '', baths: '1', open: 1,
      moveIn: 'Available now', deposit: 'Ask', features: [], photos: {}
    }, l);
  }

  function loadListingsFromCMS() {
    fetch('content/listings.json', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data || !Array.isArray(data.listings) || !data.listings.length) return;
        LISTINGS = data.listings.map(normalizeListing);
        routeFromHash();
        render();
      })
      .catch(() => { /* offline, or listings.json not deployed yet — keep the fallback list */ });
  }

  // ───────────────────────── boot ─────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    routeFromHash();
    tick();
    setInterval(tick, 30000);
    render();
    loadListingsFromCMS();
  });
  window.addEventListener('popstate', () => { routeFromHash(); render({ focusMain: true }); });

  let lastMobile = isMobileWidth();
  window.addEventListener('resize', () => {
    const nowMobile = isMobileWidth();
    if (nowMobile !== lastMobile) { lastMobile = nowMobile; render(); }
  });
})();
