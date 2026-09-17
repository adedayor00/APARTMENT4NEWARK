# apartments4newark.com — built site

A working recreation of the "board" design (the chosen direction in the
handoff), built as a static site: plain HTML, CSS and vanilla JavaScript —
no build step, no framework, no dependencies. Open `index.html` directly in
a browser, or serve the folder with any static host.

## What's here

`index.html` is the page shell. `styles.css` is the Modernist design
system (tokens and components), ported from `a4n-styles.css` in the
handoff. `data.js` holds the fee/disclaimer copy, city-word list and
required-field maps, plus a fallback copy of the 11 original listings
(only used if `content/listings.json` fails to load, see "Editing
listings" below). `app.js` handles state, the typed-search parser,
sorting, message composition, routing, and the fetch that loads
`content/listings.json` at runtime. `render.js` is all screen templates
and event handling. `assets/logo.png` is the client logo (cropped the
same way as the design file, a small square window onto the 4-pane mark).
`content/listings.json` is the live inventory, edited by hand or, more
easily, through `/admin` (see "Editing listings" below). `admin/` holds
a Decap CMS admin page (https://decapcms.org) for editing
`content/listings.json` and uploading photos without touching code.

## What it does

Everything in the handoff's "chosen direction" screens: the dark inventory
board with typed search (`newark room under 800`, `east orange`, `3 bed
apartment`, `over 2000`, `$700` all parse as specified), keyboard shortcuts
on desktop (`/`, `Enter`, `Esc`, `W`, and the up/down arrow keys), a
sortable list, a sticky detail pane on wide screens that becomes a
separate mobile screen with a sticky bottom action bar below 431px wide,
the request/roommate/list forms with the named-field validation error
block, the dark chat hand-off screen with WhatsApp/Telegram/SMS links
pre-filled with the exact composed message, the mobile channel sheet, and
the fees page with the full, unedited text of all 15 disclaimers.

Listings have real, shareable, bookmarkable URLs, such as
`#/listing/garside`, `#/request`, `#/roommate`, `#/list` and `#/fees`,
addressing recommendation #2 from the handoff. Back/forward navigation
works as expected.

No accounts, no backend, no localStorage — matches the "ephemeral state
only" requirement. Forms don't submit anywhere on their own; they hand the
visitor straight to WhatsApp/Telegram/SMS/a phone call with everything
pre-filled, exactly as specified.

## Editing listings

`content/listings.json` is the live inventory (an object with a
`listings` array inside). `app.js` fetches it on every page load and
re-renders the board when it loads; if the fetch fails for any reason,
the page still works from the fallback list baked into `data.js`.

The easiest way to edit it is `/admin` on the live site
(`apartments4newark.com/admin`), a small Decap CMS instance
(https://decapcms.org) configured in `admin/config.yml`. Log in with a
GitHub account that has access to this repo, then add, edit or delete
listings and upload photos through a form, no code and no git commands
needed. Every save there is a commit to `main`, which Netlify
auto-deploys in about a minute.

You can also edit `content/listings.json` directly (by hand, or with any
tool that can commit to this repo) as long as new entries keep the same
shape as the existing ones, and each `id` stays unique and uses only
lowercase letters, numbers and dashes, since it's used in the listing's
URL as `#/listing/id`.

Photos: each listing has an optional `photos` object with `hero`, `room`
and `kitchen` fields. Any photo left unset, or a listing with no `photos`
object at all, falls back to a labelled placeholder image automatically —
the board never shows a broken image, just a stand-in until a real photo
is uploaded through `/admin`.

## Before this goes live

Photos: done, see "Editing listings" above, though real photos still need
to be taken and uploaded through `/admin` — until then every listing
shows a placeholder. Telegram username: `data.js` has
`CONFIG.telegramUsername = null`, which falls back to a phone-based
`t.me` link; if Adam has a Telegram username, set it there, one line.
Real inventory: done, see "Editing listings" above. Form delivery record:
right now a submission's only "record" is the pre-filled chat message the
visitor sends — if Adam wants a copy even when someone doesn't hit send,
wire the submit buttons to a form service (Formspree, Basin) or a small
serverless function before the redirect to chat, the handoff flags this
as optional at this scale. Legal review items are listed in the original
handoff README (the $75 screening fee, fair housing paragraph, a privacy
policy, licensing disclosure) — nothing here changes those.

## Deploying

It's static — drag the folder onto Netlify or Vercel, `npx serve`, or push
it to any static host, S3 bucket or GitHub Pages. No environment
variables, no server.
