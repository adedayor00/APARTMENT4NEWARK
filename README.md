# apartments4newark.com — built site

A working recreation of the "board" design (the chosen direction in the
handoff), built as a static site: plain HTML, CSS and vanilla JavaScript —
no build step, no framework, no dependencies. Open `index.html` directly in
a browser, or serve the folder with any static host.

## What's here

- `index.html` — the page shell.
- `styles.css` — the Modernist design system (tokens + components), ported
  from `a4n-styles.css` in the handoff.
- `data.js` — the 11 real listings, the fee/disclaimer copy, city-word list
  and required-field maps. **This is the file to edit to change inventory**
  until it's wired to a live source (see below).
- `app.js` — state, the typed-search parser, sorting, message composition,
  routing.
- `render.js` — all screen templates and event handling.
- `assets/logo.png` — the client logo (cropped the same way as the design
  file: a small square window onto the 4-pane mark).

## What it does

Everything in the handoff's "chosen direction" screens: the dark inventory
board with typed search (`newark room under 800`, `east orange`, `3 bed
apartment`, `over 2000`, `$700` all parse as specified), keyboard shortcuts
on desktop (`/`, `↑↓`, `Enter`, `Esc`, `W`), sortable list, a sticky detail
pane on wide screens that becomes a separate mobile screen with a sticky
bottom action bar below 431px wide, the request/roommate/list forms with
the named-field validation error block, the dark chat hand-off screen with
WhatsApp/Telegram/SMS links pre-filled with the exact composed message, the
mobile channel sheet, and the fees page with the full, unedited text of all
15 disclaimers.

Listings have real, shareable, bookmarkable URLs — `#/listing/garside`,
`#/request`, `#/roommate`, `#/list`, `#/fees` — addressing recommendation
#2 from the handoff. Back/forward navigation works as expected.

No accounts, no backend, no localStorage — matches the "ephemeral state
only" requirement. Forms don't submit anywhere on their own; they hand the
visitor straight to WhatsApp/Telegram/SMS/a phone call with everything
pre-filled, exactly as specified.

## Before this goes live

1. **Photos.** Every image slot is a labelled placeholder. This is the
   single biggest thing standing between this site and being usable —
   see the handoff's "Open recommendations."
2. **Telegram username.** `data.js` has `CONFIG.telegramUsername = null`,
   which falls back to a phone-based `t.me` link. If Adam has a Telegram
   username, set it there — one line.
3. **Real inventory.** `LISTINGS` in `data.js` is hand-edited. The handoff's
   recommended path is Airtable or a Google Sheet, fetched at build time
   (Next.js + ISR) or client-side, so Adam can add a room from his phone
   without a developer touching code. This static build is the fastest way
   to get the exact design live; swapping the data source for a live one
   is a self-contained follow-up (only `data.js`'s `LISTINGS` shape needs
   to keep matching what `app.js`'s `decorate()` expects).
4. **Form delivery record.** Right now a submission's only "record" is the
   pre-filled chat message the visitor sends. If Adam wants a copy even
   when someone doesn't hit send, wire the submit buttons to a form
   service (Formspree, Basin) or a small serverless function before the
   redirect to chat — the handoff flags this as optional at this scale.
5. Legal review items are listed in the original handoff README (the $75
   screening fee, fair housing paragraph, a privacy policy, licensing
   disclosure) — nothing here changes those.

## Deploying

It's static — drag the folder onto Netlify or Vercel, `npx serve`, or push
it to any static host / S3 bucket / GitHub Pages. No environment variables,
no server.
