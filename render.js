/* apartments4newark.com — templates + event delegation */
(function () {
  'use strict';
  const A4N = window.A4N;
  const esc = A4N.escapeHtml;

  const IMG_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="18" height="18" x="3" y="3" rx="0" ry="0"/><circle cx="9" cy="9" r="1.8"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/></svg>';

  // Generic placeholder photo (no real photo on file yet). Swapped out
  // automatically for a real photo once one is added in /admin.
  function placeholderPhoto(label) {
    return 'https://placehold.co/640x480/2a2a2a/8a8a8a?font=roboto&text=' + encodeURIComponent(label.toUpperCase());
  }

  function photoSlot(cls, label, url) {
    const src = url || placeholderPhoto(label);
    return '<div class="photo-slot grayscale ' + cls + '"><img class="photo-slot-img" src="' + esc(src) + '" alt="' + esc(label) + '" loading="lazy"></div>';
  }

  // ───────────────────────── header / footer ─────────────────────────
  function renderHeader(mobile) {
    const s = A4N.state;
    const unitCount = LISTINGS.length;
    const roomsFree = LISTINGS.filter(l => l.type === 'room').reduce((a, l) => a + l.open, 0);
    if (mobile) {
      return '' +
      '<header class="hdr">' +
        '<div style="display:flex;align-items:center;gap:9px;padding:11px 16px">' +
          '<button data-action="goBoard" class="hdr-brand" style="min-height:44px">' +
            '<span class="hdr-logo"><img src="assets/logo.png" alt="apartments4newark.com"></span>' +
            '<span class="hdr-word" style="font-size:12.5px">apartments4newark.com</span>' +
          '</button>' +
          '<span class="hdr-live js-clock" style="margin-left:auto;font-size:9px">LIVE ' + esc(s.clock) + '</span>' +
          '<button data-action="toggleMenu" aria-label="Menu" class="hdr-menu-btn">' + (s.menuOpen ? 'CLOSE' : 'MENU') + '</button>' +
        '</div>' +
        (s.menuOpen ? (
          '<div class="hdr-menu-panel">' +
            '<button data-action="goBoard" class="hdr-menu-item">Browse the board</button>' +
            '<button data-action="goRoommate" class="hdr-menu-item">Get a roommate</button>' +
            '<button data-action="goList" class="hdr-menu-item">List your place</button>' +
            '<button data-action="goFees" class="hdr-menu-item">How it works · fees</button>' +
            '<button data-action="openSheet" class="hdr-menu-item accent">Message us</button>' +
          '</div>'
        ) : '') +
      '</header>';
    }
    return '' +
    '<header class="hdr">' +
      '<button data-action="goBoard" class="hdr-brand">' +
        '<span class="hdr-logo"><img src="assets/logo.png" alt="apartments4newark.com"></span>' +
        '<span class="hdr-word">apartments4newark.com</span>' +
      '</button>' +
      '<span class="hdr-stat">NORTH JERSEY · ' + unitCount + ' UNITS · ' + roomsFree + ' ROOMS FREE</span>' +
      '<nav class="hdr-nav">' +
        '<button data-action="goRoommate" class="hdr-navlink">Get a roommate</button>' +
        '<button data-action="goList" class="hdr-navlink">List your place</button>' +
        '<button data-action="goFees" class="hdr-navlink">How it works</button>' +
        '<span class="hdr-live js-clock">LIVE ' + esc(s.clock) + '</span>' +
      '</nav>' +
    '</header>';
  }

  function footerStatusText() {
    const sel = A4N.currentSel();
    return sel ? ('SELECTED ' + sel.boardName + ' · ' + sel.priceLabel + ' · ' + sel.statusLabel) : 'NO SELECTION · PRESS / TO SEARCH';
  }

  function renderFooter(mobile) {
    const s = A4N.state;
    const sel = A4N.currentSel();
    const unitCount = LISTINGS.length;
    const roomsFree = LISTINGS.filter(l => l.type === 'room').reduce((a, l) => a + l.open, 0);
    if (mobile) {
      return '' +
      '<footer class="footer-bar-mobile">' +
        '<p class="unit-line">' + unitCount + ' UNITS · ' + roomsFree + ' ROOMS FREE · NORTH JERSEY</p>' +
        '<p class="phone-line">WhatsApp, Telegram and SMS all reach us on ' + CONFIG.phoneDisplay + '.</p>' +
        '<div class="row">' +
          '<button data-action="openSheet" class="msg-btn">MESSAGE US</button>' +
          '<button data-action="goFees" class="fees-btn">FEES &amp; DISCLAIMERS</button>' +
        '</div>' +
      '</footer>';
    }
    const statusBar = footerStatusText();
    return '' +
    '<footer class="footer-bar">' +
      '<span class="footer-status" id="footer-status-text">' + esc(s.screen === 'board' ? statusBar : 'APARTMENTS4NEWARK.COM') + '</span>' +
      '<span class="footer-contact">TEXT OR CALL ' + CONFIG.phoneDisplay + ' · WHATSAPP AND TELEGRAM SAME NUMBER</span>' +
      '<button data-action="goFees" class="footer-fees-btn">FEES &amp; DISCLAIMERS</button>' +
    '</footer>';
  }

  // ───────────────────────── board screen ─────────────────────────
  function renderRow(r, idx, mobile, selIdx) {
    const statusCls = r.isRoom ? 'free' : 'whole';
    if (mobile) {
      return '' +
      '<button class="row-btn-mobile" data-action="selectRow" data-idx="' + idx + '">' +
        '<span class="row-line1">' +
          '<span class="row-addr">' + esc(r.boardName) + '</span>' +
          '<span class="row-rent">' + esc(r.priceLabel) + '</span>' +
        '</span>' +
        '<span class="row-line2">' +
          '<span class="row-meta">' + esc(r.boardMeta) + ' · ' + esc(r.sizeLabel) + '</span>' +
          '<span class="row-status ' + statusCls + '">' + esc(r.statusLabel) + '</span>' +
        '</span>' +
      '</button>';
    }
    const selected = idx === selIdx;
    return '' +
    '<button class="row-btn' + (selected ? ' selected' : '') + '" data-action="selectRow" data-idx="' + idx + '">' +
      '<span class="row-addr-cell">' +
        '<span class="row-addr">' + esc(r.boardName) + '</span>' +
        '<span class="row-meta">' + esc(r.boardMeta) + '</span>' +
      '</span>' +
      '<span class="row-size">' + esc(r.sizeLabel) + '</span>' +
      '<span class="row-rent">' + esc(r.priceLabel) + '</span>' +
      '<span class="row-status ' + statusCls + '">' + esc(r.statusLabel) + '</span>' +
    '</button>';
  }

  function renderDetail(sel, mobile) {
    if (!sel) return '';
    const roomsBlock = sel.isRoom ? (
      '<div class="rooms-block"><p class="rooms-block-title">ROOMS IN THIS APARTMENT</p>' +
        sel.rooms.map(rm => (
          '<div class="room-row">' +
            '<span class="rm-name">' + esc(rm.name) + '</span>' +
            '<span class="rm-bath">' + esc(rm.bath) + '</span>' +
            '<span class="rm-rent">' + esc(rm.rent) + '</span>' +
            '<span class="rm-status" style="color:' + (rm.free ? 'var(--color-accent-500)' : 'var(--color-neutral-500)') + '">' + esc(rm.status) + '</span>' +
          '</div>'
        )).join('') +
      '</div>'
    ) : '';
    const included = sel.included.map(i => '<p class="included-line">' + esc(i) + '</p>').join('');
    const wa = A4N.waForListing(sel);
    return '' +
    (mobile ? '<div style="padding:13px 16px;border-bottom:1px solid var(--color-neutral-800)"><button class="mobile-back-btn" data-action="mobileBack">← BACK TO THE BOARD</button></div>' : '') +
    '<div class="detail-head">' +
      '<span class="detail-kicker">' + esc(sel.statusLabel) + '</span>' +
      '<h1 class="detail-h1">' + esc(sel.fullAddress) + '</h1>' +
      '<p class="detail-meta">' + esc(sel.boardMeta) + ' · ' + esc(sel.sizeLabel) + ' · ' + esc(sel.moveIn) + '</p>' +
    '</div>' +
    '<div class="detail-photos">' +
      photoSlot('hero', 'Common space', (sel.photos || {}).hero) +
      photoSlot('room', 'Room', (sel.photos || {}).room) +
      photoSlot('kitchen', 'Kitchen', (sel.photos || {}).kitchen) +
    '</div>' +
    '<div class="stat-strip">' +
      '<div class="stat-cell"><p class="stat-label">RENT</p><p class="stat-value">' + esc(sel.priceLabel) + '</p><p class="stat-caption">' + esc(sel.priceUnit) + '</p></div>' +
      '<div class="stat-cell"><p class="stat-label">UTILITIES</p><p class="stat-value small">' + esc(sel.utilLabel) + '</p></div>' +
      '<div class="stat-cell"><p class="stat-label">DEPOSIT</p><p class="stat-value small">' + esc(sel.deposit) + '</p></div>' +
    '</div>' +
    roomsBlock +
    '<div class="included-block">' +
      '<p class="included-title">WHAT IS INCLUDED</p>' + included +
      '<p class="arrangement-line">' + esc(sel.arrangement) + '</p>' +
    '</div>' +
    (mobile ?
      '<div class="detail-actions-mobile">' +
        '<button class="action-request-mobile" data-action="goRequest">REQUEST THIS</button>' +
        '<button class="action-message-mobile" data-action="openSheet">MESSAGE US</button>' +
      '</div>'
    :
      '<div class="detail-actions-desktop">' +
        '<button class="btn-request" data-action="goRequest">↵ REQUEST THIS</button>' +
        '<a class="btn-wa-outline" href="' + wa + '" target="_blank" rel="noopener">W · WHATSAPP</a>' +
        '<span class="reassure-text">No account. Free to ask and free to tour.</span>' +
      '</div>'
    );
  }

  const CITIES = ['Newark', 'East Orange', 'Maplewood'];

  function cityFilterRow() {
    const active = A4N.state.cityFilter;
    return '' +
    '<div class="sort-row city-filter-row">' +
      '<span class="sort-label">CITY</span>' +
      CITIES.map(c => '<button class="sort-btn' + (active === c ? ' active' : '') + '" data-action="filterCity" data-city="' + esc(c) + '">' + esc(c.toUpperCase()) + '</button>').join('') +
    '</div>';
  }

  function renderBoardDynamicInner(mobile) {
    const p = A4N.parseQuery();
    const list = A4N.rows();
    const idx = list.length ? Math.max(0, Math.min(list.length - 1, A4N.state.selIdx)) : 0;
    const sel = list[idx] || null;
    const matchLine = list.length === LISTINGS.length ? 'SHOWING EVERYTHING' : (list.length + (list.length === 1 ? ' MATCH' : ' MATCHES') + ' OF ' + LISTINGS.length);
    const hasQuery = A4N.state.q.trim().length > 0;
    const hasCityFilter = !!A4N.state.cityFilter;
    const chips = p.chips.slice();
    if (hasCityFilter && A4N.state.cityFilter !== p.city) chips.unshift(A4N.state.cityFilter.toUpperCase());

    const chipsRow = (mobile && A4N.state.showingDetail) ? '' : (
      '<div class="chips-row" aria-live="polite">' +
        chips.map(c => '<span class="chip">' + esc(c) + '</span>').join('') +
        '<span class="match-line">' + matchLine + '</span>' +
        ((hasQuery || hasCityFilter) ? '<button class="clear-btn" data-action="clearQuery">CLEAR</button>' : '') +
      '</div>' +
      cityFilterRow() +
      (mobile ? (
        '<div class="sort-row">' +
          '<span class="sort-label">SORT</span>' +
          '<button class="sort-btn' + (A4N.state.sort === 'price' ? ' active' : '') + '" data-action="setSort" data-sort="price">RENT</button>' +
          '<button class="sort-btn' + (A4N.state.sort === 'rooms' ? ' active' : '') + '" data-action="setSort" data-sort="rooms">ROOMS FREE</button>' +
          '<button class="sort-btn' + (A4N.state.sort === 'city' ? ' active' : '') + '" data-action="setSort" data-sort="city">CITY</button>' +
        '</div>'
      ) : '')
    );

    const emptyState = list.length === 0 ? (
      '<div class="empty-state">' +
        '<h4>Nothing matches that</h4>' +
        '<p>Try a wider budget, or send us what you are after and we will text you when something opens.</p>' +
        '<button class="btn-send" data-action="goRequest">SEND MY DETAILS</button>' +
      '</div>'
    ) : '';

    const rowsHtml = list.map((r, i) => renderRow(r, i, mobile, idx)).join('');

    const listBlock = mobile ? (
      (A4N.state.showingDetail ? '' :
        '<div class="rows-mobile" style="flex:1">' + rowsHtml + emptyState + '</div>'
      )
    ) : (
      '<div class="board-list">' +
        '<div class="list-head"><span>ADDRESS</span><span>SIZE</span><span style="text-align:right">RENT</span><span style="text-align:right">STATUS</span></div>' +
        rowsHtml + emptyState +
        '<div class="sort-row">' +
          '<span class="sort-label">SORT</span>' +
          '<button class="sort-btn' + (A4N.state.sort === 'price' ? ' active' : '') + '" data-action="setSort" data-sort="price">RENT</button>' +
          '<button class="sort-btn' + (A4N.state.sort === 'rooms' ? ' active' : '') + '" data-action="setSort" data-sort="rooms">ROOMS FREE</button>' +
          '<button class="sort-btn' + (A4N.state.sort === 'city' ? ' active' : '') + '" data-action="setSort" data-sort="city">CITY</button>' +
        '</div>' +
      '</div>'
    );

    const detailBlock = mobile ? (
      (A4N.state.showingDetail && sel ? '<div class="board-detail-mobile">' + renderDetail(sel, true) + '</div>' : '')
    ) : (
      sel ? '<div class="board-detail">' + renderDetail(sel, false) + '</div>' : ''
    );

    if (mobile) {
      return chipsRow + listBlock + detailBlock;
    }
    return chipsRow + '<div class="board-grid">' + listBlock + detailBlock + '</div>';
  }

  function renderBoardScreen(mobile) {
    const s = A4N.state;
    const showCmdbar = !(mobile && s.showingDetail);
    return '' +
    (showCmdbar ? (
      '<div class="cmdbar">' +
        '<span class="cmdbar-slash">/</span>' +
        '<input id="search-input" class="cmdbar-input" value="' + esc(s.q) + '" placeholder="newark room under 800" aria-label="Search listings" autocomplete="off">' +
        '<span class="cmdbar-caret"></span>' +
        (mobile ? '' : '<span class="cmdbar-legend">↑↓ MOVE · ↵ REQUEST · W WHATSAPP · ESC CLEAR</span>') +
      '</div>'
    ) : '') +
    '<div id="board-dynamic">' + renderBoardDynamicInner(mobile) + '</div>';
  }

  function updateBoardDynamic() {
    const mobile = A4N.isMobileWidth();
    const el = document.getElementById('board-dynamic');
    if (!el) { A4N.render(); return; }
    // command bar visibility can change (mobile detail hides it) — safest to
    // re-render the whole board screen container's parent when that flips.
    const wantsCmdbar = !(mobile && A4N.state.showingDetail);
    const hasCmdbar = !!document.querySelector('.cmdbar');
    if (wantsCmdbar !== hasCmdbar) { A4N.render(); return; }
    el.innerHTML = renderBoardDynamicInner(mobile);
    const statusEl = document.getElementById('footer-status-text');
    if (statusEl && A4N.state.screen === 'board') statusEl.textContent = footerStatusText();
  }
  window.A4N.updateBoardDynamic = updateBoardDynamic;

  // ───────────────────────── forms ─────────────────────────
  function field(label, id, bind, type, placeholder, extra) {
    type = type || 'text';
    extra = extra || '';
    const val = bind.split('.').reduce((o, k) => (o || {})[k], A4N.state) || '';
    if (type === 'textarea') {
      return '<div class="field"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" class="input" data-bind="' + bind + '" placeholder="' + esc(placeholder || '') + '">' + esc(val) + '</textarea></div>';
    }
    return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '" class="input" type="' + type + '" data-bind="' + bind + '" value="' + esc(val) + '" placeholder="' + esc(placeholder || '') + '" ' + extra + '></div>';
  }
  function selectField(label, id, bind, options) {
    const val = bind.split('.').reduce((o, k) => (o || {})[k], A4N.state) || '';
    const opts = options.map(o => '<option value="' + esc(o.v) + '"' + (o.v === val ? ' selected' : '') + '>' + esc(o.t || o.v) + '</option>').join('');
    return '<div class="field"><label for="' + id + '">' + label + '</label><select id="' + id + '" class="input" data-bind="' + bind + '">' + opts + '</select></div>';
  }
  function segField(label, bind, opts, name) {
    const val = bind.split('.').reduce((o, k) => (o || {})[k], A4N.state) || '';
    return '<div class="field"><label>' + label + '</label><div class="seg">' +
      opts.map(o => (
        '<label class="seg-opt"><input type="radio" name="' + name + '" data-bind="' + bind + '" data-set-value="' + esc(o) + '"' + (o === val ? ' checked' : '') + '>' + esc(o) + '</label>'
      )).join('') +
    '</div></div>';
  }
  function errorBlock() {
    const s = A4N.state;
    if (!s.errors.length) return '';
    const heading = 'Still missing ' + s.errors.length + (s.errors.length === 1 ? ' answer' : ' answers');
    return '<div class="error-block" role="alert"><p>' + heading + '</p><p>Please add ' + esc(s.errors.join(', ')) + '.</p></div>';
  }

  function renderRequestForm(mobile) {
    const sel = A4N.currentSel();
    const heading = sel ? ('Request ' + sel.fullAddress) : 'Tell us what you are looking for';
    const backAction = mobile ? 'backFromRequest' : 'goBoard';
    return '' +
    '<section class="page-light"><div class="page-container">' +
      '<button class="btn btn-ghost back-link" data-action="' + backAction + '">← Back' + (mobile ? '' : ' to the board') + '</button>' +
      '<h1 class="page-h1" style="' + (mobile ? 'font-size:27px' : '') + '">' + esc(heading) + '</h1>' +
      '<p class="page-lede">Asked once, here. When you send it you get a link to carry on over WhatsApp, Telegram or SMS — there is no account to create.</p>' +
      '<p class="page-fee-note">Free to enquire and free to tour. A $75 background check applies only after you have chosen a unit and seen it.</p>' +
      errorBlock() +
      '<div class="form-grid">' +
        field('Full name', 'q-name', 'form.name', 'text', 'Jane Okafor') +
        field('Age', 'q-age', 'form.age', 'number', '24', 'inputmode="numeric"') +
        field('Phone number', 'q-phone', 'form.phone', 'tel', '(973) 555-0142', 'inputmode="tel"') +
        field('Email', 'q-email', 'form.email', 'email', 'jane@email.com', 'inputmode="email"') +
        field('Location you want', 'q-loc', 'form.location', 'text', 'Newark') +
        selectField('Monthly budget per room', 'q-budget', 'form.budget', [{ v: '', t: 'Select a budget' }, { v: 'Up to $700' }, { v: '$700–$850' }, { v: '$850–$1,000' }, { v: 'Whole apartment budget' }]) +
        selectField('How much space', 'q-rooms', 'form.rooms', [{ v: '1 room' }, { v: '2 rooms' }, { v: 'Entire apartment' }]) +
        field('Move-in date', 'q-move', 'form.moveIn', 'date') +
        selectField('Employment', 'q-work', 'form.employment', [{ v: '', t: 'Select one' }, { v: 'Employed' }, { v: 'Self-employed' }, { v: 'Student' }, { v: 'Between jobs' }]) +
        field('Monthly take-home (optional)', 'q-income', 'form.income', 'text', '$3,200', 'inputmode="numeric"') +
        segField('Pets', 'form.pets', ['No pets', 'I have a pet'], 'pets') +
        segField('Smoking', 'form.smoking', ['Non-smoker', 'Smoker'], 'smoke') +
      '</div>' +
      field('Anything else we should know (optional)', 'q-note', 'form.note', 'textarea', 'Work night shifts, need parking, moving with a friend…') +
      '<div class="form-footer">' +
        '<button class="btn btn-primary' + (mobile ? ' btn-block' : '') + '" data-action="submitForm" style="' + (mobile ? 'min-height:52px;font-size:15px' : 'padding:12px 22px;font-size:15px') + '">Send and ' + (mobile ? 'choose a channel' : 'open chat') + '</button>' +
        '<span class="form-footer-note">We reply the same day, usually within an hour.</span>' +
      '</div>' +
    '</div></section>';
  }

  function renderRoommateForm(mobile) {
    return '' +
    '<section class="page-light"><div class="page-container wide">' +
      '<button class="btn btn-ghost back-link" data-action="goBoard">← Back' + (mobile ? '' : ' to the board') + '</button>' +
      '<p class="kicker">Get a roommate</p>' +
      '<h1 class="page-h1" style="max-width:24em;' + (mobile ? 'font-size:27px' : 'font-size:34px') + '">Have a spare room? We will find the person for it</h1>' +
      '<p class="page-lede" style="max-width:46em">Tell us about yourself and the apartment, add a few photos, and we will go through it on chat. If it fits the renters already on our board, we put the room live and send you people to meet. Free to list.</p>' +
      '<p class="page-fee-note" style="max-width:46em;color:color-mix(in srgb, var(--color-text) 70%, transparent)">We ask about you because renters ask about you. Honest answers mean fewer viewings that go nowhere.</p>' +
      errorBlock() +
      '<h3 class="section-heading">About you</h3>' +
      '<div class="form-grid">' +
        field('Your name', 'r-name', 'rm.name', 'text', 'Chioma Nwosu') +
        field('Your age', 'r-age', 'rm.age', 'number', '29', 'inputmode="numeric"') +
        field('What you do', 'r-work', 'rm.work', 'text', 'Nurse at University Hospital') +
        selectField('Your hours', 'r-sched', 'rm.schedule', [{ v: 'Regular daytime hours' }, { v: 'Night shifts' }, { v: 'Rotating shifts' }, { v: 'Work from home' }, { v: 'Student schedule' }]) +
        field('Phone number', 'r-phone', 'rm.phone', 'tel', '(973) 555-0142', 'inputmode="tel"') +
        field('Email', 'r-email', 'rm.email', 'email', 'you@email.com', 'inputmode="email"') +
        selectField('How the apartment runs', 'r-house', 'rm.household', [{ v: '', t: 'Select one' }, { v: 'Quiet — early nights, work comes first' }, { v: 'Sociable but respectful' }, { v: 'Busy household, people come and go' }, { v: 'Keep to ourselves, share the space cleanly' }]) +
        field('The roommate you want', 'r-wanted', 'rm.wanted', 'text', 'Working professional, clean, no parties') +
      '</div>' +
      '<h3 class="section-heading">The apartment and the room</h3>' +
      '<div class="form-grid">' +
        field('Street address', 'r-addr', 'rm.address', 'text', '14 Ferry St') +
        field('Apartment or unit (optional)', 'r-unit', 'rm.unit', 'text', 'Apt 2R') +
        field('City or town', 'r-city', 'rm.city', 'text', 'Newark') +
        field('Bedrooms', 'r-beds', 'rm.beds', 'number', '3', 'inputmode="numeric"') +
        field('Bathrooms', 'r-baths', 'rm.baths', 'text', '1') +
        field('Who lives there now', 'r-living', 'rm.living', 'text', 'Me and one other tenant, both working') +
        field('Rent for the room', 'r-rent', 'rm.rent', 'text', '$750 per month') +
        field('Room is free from', 'r-from', 'rm.from', 'date') +
        selectField('Utilities', 'r-util', 'rm.utilities', [{ v: 'Split evenly between tenants' }, { v: 'Included in the room rent' }, { v: 'Heat and hot water included' }]) +
        selectField('Pets', 'r-pets', 'rm.pets', [{ v: 'No pets in the apartment' }, { v: 'There is already a pet here' }, { v: 'Pets welcome' }]) +
        selectField('Smoking', 'r-smoke', 'rm.smoking', [{ v: 'Non-smoking apartment' }, { v: 'Smoking allowed' }, { v: 'Outside only' }]) +
      '</div>' +
      '<h3 class="section-heading" style="margin-bottom:6px">Photos of the apartment</h3>' +
      '<p class="page-lede" style="margin:10px 0 16px;max-width:46em;color:color-mix(in srgb, var(--color-text) 65%, transparent)">Four is enough: the room, the kitchen, the living room, the bathroom. Phone photos in daylight get more replies than styled shots of an empty room.</p>' +
      '<div class="photo-grid">' +
        '<div class="photo-slot-light grayscale">' + photoSlotInner('The room') + '</div>' +
        '<div class="photo-slot-light grayscale">' + photoSlotInner('Kitchen') + '</div>' +
        '<div class="photo-slot-light grayscale">' + photoSlotInner('Living room') + '</div>' +
        '<div class="photo-slot-light grayscale">' + photoSlotInner('Bathroom') + '</div>' +
      '</div>' +
      field('Anything else (optional)', 'r-note', 'rm.note', 'textarea', 'Parking, laundry, how close the bus or PATH is, viewing times that suit you…') +
      permissionCheckbox('rm.permission', 'My lease or the owner allows me to take a roommate, and I can show that if asked. I understand apartments4newark.com introduces people and does not become a party to my lease.') +
      '<div class="form-footer">' +
        '<button class="btn btn-primary' + (mobile ? ' btn-block' : '') + '" data-action="submitRoommate" style="' + (mobile ? 'min-height:52px;font-size:15px' : 'padding:12px 22px;font-size:15px') + '">Send and open chat</button>' +
        '<span class="form-footer-note">We will tell you on the chat whether we can list it, and what it should rent for.</span>' +
      '</div>' +
    '</div></section>';
  }

  function photoSlotInner(label) {
    return '<div class="photo-slot-label" style="color:var(--color-neutral-700)">' + IMG_ICON + '<span>' + esc(label) + '</span></div>';
  }

  function permissionCheckbox(bind, text) {
    const val = bind.split('.').reduce((o, k) => (o || {})[k], A4N.state) || '';
    return '<label class="radio permission-check"><input type="checkbox" data-bind="' + bind + '"' + (val === 'Yes' ? ' checked' : '') + '><span class="dot"></span><span style="font-size:14px">' + text + '</span></label>';
  }

  function renderListForm(mobile) {
    return '' +
    '<section class="page-light"><div class="page-container wide">' +
      '<button class="btn btn-ghost back-link" data-action="goBoard">← Back' + (mobile ? '' : ' to the board') + '</button>' +
      '<p class="kicker">List your place</p>' +
      '<h1 class="page-h1" style="max-width:24em;' + (mobile ? 'font-size:27px' : 'font-size:34px') + '">Sublet a room, or list your whole apartment</h1>' +
      '<p class="page-lede" style="max-width:46em">Moving out with time left on your lease, or have a unit to fill? Fill this in once and we will confirm the details, collect photos and put it on the board in front of renters already looking in your area. Listing is free.</p>' +
      '<p class="page-fee-note" style="max-width:46em;color:color-mix(in srgb, var(--color-text) 70%, transparent)">One rule: if you rent rather than own, check your lease or ask your landlord before you sublet.</p>' +
      errorBlock() +
      '<h3 class="section-heading">The place</h3>' +
      '<div class="form-grid">' +
        selectField('What are you listing', 'l-kind', 'list.kind', [{ v: '', t: 'Select one' }, { v: 'A room in my apartment' }, { v: 'Two or more rooms in my apartment' }, { v: 'My whole apartment (sublet)' }, { v: 'A whole unit I own or manage' }]) +
        selectField('You are the', 'l-role', 'list.role', [{ v: '', t: 'Select one' }, { v: 'Current tenant subletting' }, { v: 'Leaseholder looking for a roommate' }, { v: 'Owner' }, { v: 'Property manager or agent' }]) +
        field('Street address', 'l-addr', 'list.address', 'text', '14 Ferry St') +
        field('Apartment or unit (optional)', 'l-unit', 'list.unit', 'text', 'Apt 2R') +
        field('City or town', 'l-city', 'list.city', 'text', 'Newark') +
        field('Bedrooms', 'l-beds', 'list.beds', 'number', '3', 'inputmode="numeric"') +
        field('Bathrooms', 'l-baths', 'list.baths', 'text', '1.5') +
        field('Rooms you need to fill', 'l-rooms', 'list.roomsOpen', 'text', '1') +
      '</div>' +
      '<h3 class="section-heading">Money and timing</h3>' +
      '<div class="form-grid">' +
        field('Monthly rent you want', 'l-rent', 'list.rent', 'text', '$800 per room') +
        field('Available from', 'l-from', 'list.from', 'date') +
        selectField('Utilities', 'l-util', 'list.utilities', [{ v: 'Not included' }, { v: 'Included in the rent' }, { v: 'Heat and hot water included' }, { v: 'Split evenly between tenants' }]) +
        selectField('Pets', 'l-pets', 'list.pets', [{ v: 'No pets' }, { v: 'Cats only' }, { v: 'Pets welcome' }, { v: 'Case by case' }]) +
        selectField('Smoking', 'l-smoke', 'list.smoking', [{ v: 'Non-smoking' }, { v: 'Smoking allowed' }, { v: 'Outside only' }]) +
        field('Features worth mentioning', 'l-feat', 'list.features', 'text', 'Parking, laundry hookup, near PATH') +
      '</div>' +
      '<h3 class="section-heading">You</h3>' +
      '<div class="form-grid" style="margin-bottom:0">' +
        field('Your name', 'l-name', 'list.name', 'text', 'Adewale Bello') +
        field('Phone number', 'l-phone', 'list.phone', 'tel', '(973) 555-0142', 'inputmode="tel"') +
        field('Email', 'l-email', 'list.email', 'email', 'you@email.com', 'inputmode="email"') +
      '</div>' +
      field('Anything else (optional)', 'l-note', 'list.note', 'textarea', 'Who lives there now, what kind of tenant would suit the place, viewing times that work…') +
      permissionCheckbox('list.permission', 'I own this unit, or my lease allows me to sublet it and my landlord is aware. I understand apartments4newark.com lists it on my behalf and does not become a party to my lease.') +
      '<div class="form-footer">' +
        '<button class="btn btn-primary' + (mobile ? ' btn-block' : '') + '" data-action="submitList" style="' + (mobile ? 'min-height:52px;font-size:15px' : 'padding:12px 22px;font-size:15px') + '">Send and open chat</button>' +
        '<span class="form-footer-note">Photos can come later in the chat — we can work from what you have.</span>' +
      '</div>' +
    '</div></section>';
  }

  // ───────────────────────── chat hand-off ─────────────────────────
  function renderChat() {
    const s = A4N.state;
    const name = s.chatMode === 'lister' ? s.list.name : s.chatMode === 'roommate' ? s.rm.name : s.form.name;
    const tail = s.chatMode === 'lister' ? ', here is how to send us the place' : s.chatMode === 'roommate' ? ', here is how to send us the room' : ', here is how to reach us';
    const heading = (name ? name.split(' ')[0] : 'Thanks') + tail;
    const sub = s.chatMode === 'lister'
      ? 'Pick how you want to talk. Your listing details are already attached, so you can just hit send. We will confirm them, ask for photos and put it on the board.'
      : s.chatMode === 'roommate'
      ? 'Pick how you want to talk, then send your photos in the same chat. We will go through the details and tell you whether we can list the room.'
      : 'Pick how you want to talk. Your answers are already attached to the message, so you can just hit send.';
    const msg = encodeURIComponent(A4N.msgFor(s.chatMode));
    const e164 = A4N.e164();
    const waLink = 'https://wa.me/' + e164.replace('+', '') + '?text=' + msg;
    const tgLink = A4N.telegramLink();
    const smsLink = 'sms:' + e164 + '?body=' + msg;
    const summary = A4N.summaryFor(s.chatMode);
    const editTarget = s.chatMode === 'lister' ? 'goList' : s.chatMode === 'roommate' ? 'goRoommate' : 'goRequest';

    return '' +
    '<section><div class="chat-wrap">' +
      '<p class="chat-kicker">DETAILS RECEIVED</p>' +
      '<h1 class="chat-h1">' + esc(heading) + '</h1>' +
      '<p class="chat-sub">' + sub + '</p>' +
      '<div class="channels-grid">' +
        '<a class="channel-card wa" href="' + waLink + '" target="_blank" rel="noopener"><span class="channel-title">WhatsApp</span><span class="channel-caption">Fastest — opens the chat</span></a>' +
        '<a class="channel-card other" href="' + tgLink + '" target="_blank" rel="noopener"><span class="channel-title">Telegram</span><span class="channel-caption">If you already use it</span></a>' +
        '<a class="channel-card other" href="' + smsLink + '" target="_blank" rel="noopener"><span class="channel-title">Text message</span><span class="channel-caption">Plain SMS, no app</span></a>' +
      '</div>' +
      '<div class="summary-box">' +
        '<p class="summary-title">WHAT WE ARE SENDING</p>' +
        '<div class="summary-grid">' + summary.map(x => '<div class="summary-row"><span>' + esc(x.k) + '</span><strong>' + esc(x.v) + '</strong></div>').join('') + '</div>' +
        '<button class="edit-details-btn" data-action="editChat" data-target="' + editTarget.replace('go', '').toLowerCase() + '">EDIT MY DETAILS</button>' +
      '</div>' +
      '<p class="chat-footer-line">Prefer to call? <strong style="color:var(--color-bg)">' + CONFIG.phoneDisplay + '</strong> · <button data-action="goBoard">back to the board</button></p>' +
    '</div></section>';
  }

  // ───────────────────────── not found ─────────────────────────
  function renderNotFound() {
    return '' +
    '<section><div class="chat-wrap notfound-wrap">' +
      '<p class="notfound-code" aria-hidden="true">404</p>' +
      '<p class="chat-kicker">PAGE NOT FOUND</p>' +
      '<h1 class="chat-h1">That link does not lead anywhere</h1>' +
      '<p class="chat-sub">The room may have been rented and taken off the board, or the address was mistyped. Nothing here is broken — this page just does not exist.</p>' +
      '<div class="notfound-actions">' +
        '<button class="btn btn-primary" data-action="goBoard">Back to the board</button>' +
        '<button class="btn btn-ghost" data-action="goFees">How it works</button>' +
      '</div>' +
      '<p class="chat-footer-line">Still stuck? Call or text <strong style="color:var(--color-bg)">' + CONFIG.phoneDisplay + '</strong>.</p>' +
    '</div></section>';
  }

  // ───────────────────────── fees / how it works ─────────────────────────
  function renderFees(mobile) {
    const steps = [
      ['Search the board', 'Type what you want. Every unit shows its rent and how many rooms are actually free.'],
      ['Open the unit', 'Photos, rent, what is included, and which rooms are taken.'],
      ['Send your details', 'One form, once. No account and no password.'],
      [mobile ? 'Pick your channel' : 'Chat with Adam', mobile ? 'WhatsApp, Telegram, text message or a call — whichever you already use.' : 'WhatsApp, Telegram or plain text. Nothing to install.']
    ];
    return '' +
    '<section class="page-light"><div class="page-container widest">' +
      '<button class="btn btn-ghost back-link" data-action="goBoard">← Back' + (mobile ? '' : ' to the board') + '</button>' +
      '<h1 class="page-h1" style="' + (mobile ? 'font-size:27px' : 'font-size:34px') + '">How it works, and what we charge</h1>' +
      '<div class="steps-grid">' +
        steps.map((st, i) => '<div class="step-col"><p class="step-num">' + esc(String(i + 1).padStart(2, '0')) + '</p><h4>' + esc(st[0]) + '</h4><p>' + esc(st[1]) + '</p></div>').join('') +
      '</div>' +
      '<h2>Fees and disclaimers</h2>' +
      '<p class="page-lede" style="max-width:44em">Renting a room should not come with surprises, so here is every fee and every limit in plain language.</p>' +
      '<div class="disclaimers">' +
        TERMS.map(d => '<div class="disclaimer-row"><p class="disclaimer-num">' + d.n + '</p><div><h3>' + esc(d.t) + '</h3><p>' + esc(d.b) + '</p></div></div>').join('') +
      '</div>' +
      '<div class="form-footer" style="border-top:0;padding-top:0;margin-top:26px">' +
        '<button class="btn btn-primary' + (mobile ? ' btn-block' : '') + '" data-action="goBoard" style="' + (mobile ? 'min-height:52px;font-size:15px' : 'padding:12px 22px;font-size:15px') + '">Back to the board</button>' +
        '<span class="form-footer-note">Questions about any of the above: ' + CONFIG.phoneDisplay + '</span>' +
      '</div>' +
    '</div></section>';
  }

  // ───────────────────────── channel sheet (mobile) ─────────────────────────
  function renderSheet() {
    const sel = A4N.currentSel();
    const sub = sel ? ('About ' + sel.fullAddress + '. All three reach ' + CONFIG.phoneDisplay + '.') : 'WhatsApp, Telegram and SMS all reach the same number.';
    const wa = A4N.waForListing(sel);
    const tg = A4N.telegramLink();
    const sms = A4N.smsForListing(sel);
    const tel = 'tel:' + A4N.e164();
    return '' +
    '<div class="sheet-backdrop">' +
      '<div class="sheet">' +
        '<div class="sheet-head"><p>How do you want to reach us?</p><p>' + esc(sub) + '</p></div>' +
        '<div class="sheet-rows">' +
          '<a class="sheet-row wa" href="' + wa + '" target="_blank" rel="noopener"><span class="sheet-row-title">WhatsApp</span><span class="sheet-row-caption">Opens with the listing filled in</span></a>' +
          '<a class="sheet-row other" href="' + tg + '" target="_blank" rel="noopener"><span class="sheet-row-title">Telegram</span><span class="sheet-row-caption">Same number</span></a>' +
          '<a class="sheet-row other" href="' + sms + '"><span class="sheet-row-title">Text message</span><span class="sheet-row-caption">Plain SMS, no app needed</span></a>' +
          '<a class="sheet-row other" href="' + tel + '"><span class="sheet-row-title">Call ' + CONFIG.phoneDisplay + '</span><span class="sheet-row-caption">Business hours</span></a>' +
        '</div>' +
        '<button class="sheet-close" data-action="closeSheet">CLOSE</button>' +
      '</div>' +
    '</div>';
  }

  // ───────────────────────── top-level render ─────────────────────────
  function renderMain(mobile) {
    switch (A4N.state.screen) {
      case 'request': return renderRequestForm(mobile);
      case 'roommate': return renderRoommateForm(mobile);
      case 'list': return renderListForm(mobile);
      case 'chat': return renderChat(mobile);
      case 'fees': return renderFees(mobile);
      case 'notfound': return renderNotFound();
      default: return renderBoardScreen(mobile);
    }
  }

  function pageTitle() {
    const s = A4N.state;
    const base = 'apartments4newark.com';
    if (s.screen === 'board') {
      const sel = A4N.currentSel();
      if (sel && (s.showingDetail || !A4N.isMobileWidth())) {
        return sel.fullAddress + ', ' + sel.city + ' — ' + sel.priceLabel + ' | ' + base;
      }
      return base + ' — rooms and apartments in North Jersey';
    }
    if (s.screen === 'request') { const sel = A4N.currentSel(); return (sel ? 'Request ' + sel.fullAddress : 'Tell us what you’re looking for') + ' | ' + base; }
    if (s.screen === 'roommate') return 'Get a roommate | ' + base;
    if (s.screen === 'list') return 'List your place | ' + base;
    if (s.screen === 'chat') return 'Choose how to reach us | ' + base;
    if (s.screen === 'fees') return 'How it works and fees | ' + base;
    if (s.screen === 'notfound') return 'Page not found | ' + base;
    return base;
  }

  function render(opts) {
    opts = opts || {};
    const mobile = A4N.isMobileWidth();
    const root = document.getElementById('app');
    root.innerHTML = '' +
      '<a class="skip-link" href="#main-content">Skip to main content</a>' +
      renderHeader(mobile) +
      '<main id="main-content" tabindex="-1">' + renderMain(mobile) + '</main>' +
      renderFooter(mobile) +
      (mobile && A4N.state.sheetOpen ? renderSheet() : '');
    document.title = pageTitle();
    if (opts.focusMain) {
      const main = document.getElementById('main-content');
      if (main) main.focus({ preventScroll: true });
    }
  }
  window.A4N.setRenderer(render);

  // ───────────────────────── events ─────────────────────────
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'search-input') {
      A4N.state.q = el.value;
      A4N.state.selIdx = 0;
      updateBoardDynamic();
      return;
    }
    const bind = el.dataset.bind;
    if (bind && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && ['text', 'number', 'date', 'email', 'tel'].indexOf(el.type) > -1))) {
      const parts = bind.split('.');
      A4N.state[parts[0]][parts[1]] = el.value;
    }
  });

  document.addEventListener('change', e => {
    const el = e.target;
    const bind = el.dataset.bind;
    if (!bind) return;
    const parts = bind.split('.');
    if (el.type === 'checkbox') {
      A4N.state[parts[0]][parts[1]] = el.checked ? 'Yes' : '';
      render();
    } else if (el.type === 'radio') {
      A4N.state[parts[0]][parts[1]] = el.dataset.setValue;
      render();
    } else if (el.tagName === 'SELECT') {
      A4N.state[parts[0]][parts[1]] = el.value;
      render();
    }
  });

  function goRequestScreen() {
    A4N.state.cameFromDetail = A4N.isMobileWidth() && A4N.state.showingDetail;
    A4N.go('request');
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    switch (action) {
      case 'goBoard': A4N.go('board'); break;
      case 'goRequest': goRequestScreen(); break;
      case 'goRoommate': A4N.go('roommate'); break;
      case 'goList': A4N.go('list'); break;
      case 'goFees': A4N.go('fees'); break;
      case 'backFromRequest': A4N.go('board', { showingDetail: !!A4N.state.cameFromDetail }); break;
      case 'selectRow': {
        const idx = Number(el.dataset.idx);
        const mobile = A4N.isMobileWidth();
        A4N.setSelection(idx, { navigate: mobile });
        updateBoardDynamic();
        break;
      }
      case 'mobileBack':
        A4N.state.showingDetail = false;
        history.pushState(null, '', '#/');
        updateBoardDynamic();
        break;
      case 'clearQuery': {
        A4N.state.q = ''; A4N.state.cityFilter = null; A4N.state.selIdx = 0;
        const inp = document.getElementById('search-input'); if (inp) inp.value = '';
        updateBoardDynamic();
        break;
      }
      case 'filterCity': {
        const c = el.dataset.city;
        A4N.state.cityFilter = A4N.state.cityFilter === c ? null : c;
        A4N.state.selIdx = 0;
        updateBoardDynamic();
        break;
      }
      case 'setSort':
        A4N.state.sort = el.dataset.sort;
        updateBoardDynamic();
        break;
      case 'submitForm': A4N.validateAndSubmit('form', REQ, 'renter'); break;
      case 'submitRoommate': A4N.validateAndSubmit('rm', RREQ, 'roommate'); break;
      case 'submitList': A4N.validateAndSubmit('list', LREQ, 'lister'); break;
      case 'editChat': A4N.go(el.dataset.target); break;
      case 'toggleMenu': A4N.state.menuOpen = !A4N.state.menuOpen; render(); break;
      case 'openSheet': A4N.state.sheetOpen = true; A4N.state.menuOpen = false; render(); break;
      case 'closeSheet': A4N.state.sheetOpen = false; render(); break;
      default: break;
    }
  });

  // keyboard shortcuts — desktop board screen only
  document.addEventListener('keydown', e => {
    if (A4N.isMobileWidth() || A4N.state.screen !== 'board') return;
    const t = e.target || {};
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || '');
    const list = A4N.rows();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const d = e.key === 'ArrowDown' ? 1 : -1;
      A4N.setSelection(A4N.state.selIdx + d, { navigate: false });
      updateBoardDynamic();
      return;
    }
    if (e.key === 'Enter' && list.length) { e.preventDefault(); goRequestScreen(); return; }
    if (e.key === 'Escape') {
      A4N.state.q = ''; A4N.state.selIdx = 0;
      const inp = document.getElementById('search-input');
      if (inp) { inp.value = ''; if (t === inp) inp.blur(); }
      updateBoardDynamic();
      return;
    }
    if (typing) return;
    if (e.key === '/') { e.preventDefault(); const inp = document.getElementById('search-input'); if (inp) inp.focus(); return; }
    if ((e.key === 'w' || e.key === 'W') && list[A4N.state.selIdx]) {
      window.open(A4N.waForListing(list[A4N.state.selIdx]), '_blank', 'noopener');
    }
  });
})();
