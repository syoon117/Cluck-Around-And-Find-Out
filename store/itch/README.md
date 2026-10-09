# itch.io soft launch kit

Everything needed to put the web version on itch.io. Rebuild the zip after game changes with `npm run itch` (or `node tools/build-web.js --itch`).

## Files

- `cluck-around-and-find-out-web.zip`: the game. `index.html` is at the root of the zip, which is what itch.io needs.
- `cover-630x500.png`: cover image.
- Screenshots: use `../google-play/screenshots/` (captioned) or `../google-play/screenshots-raw/`.
- Trailer: `../trailer/trailer-1080x1920.mp4`. itch.io takes a YouTube link, so upload it there first (unlisted is fine).

## Create the project (dashboard → Create new project)

| Field | Value |
| --- | --- |
| Title | Cluck Around and Find Out |
| Project URL | cluckaroundgame.itch.io/cluck-around-and-find-out (if the account is `cluckaroundgame`) |
| Short description / tagline | A 1v1 reflex game against a rubber chicken. Don't touch the bell. |
| Classification | Games |
| Kind of project | HTML |
| Release status | Released (or In development during the soft launch) |
| Pricing | No payments, or "$0 or donate", the free option that still lets fans tip |
| Uploads | the zip, ticked **This file will be played in the browser** |
| Embed options | Viewport **540 × 960**, tick **Mobile friendly** (orientation: portrait), tick **Fullscreen button**, tick **Automatically start on page load** off (sound needs a tap anyway) |
| Genre | Rhythm (secondary: Action) |
| Tags | rubber-chicken, reflex, rhythm, funny, comedy, party-game, arcade, casual, one-button, mobile-friendly |
| AI disclosure | Answer honestly: the code, art and sounds were made with AI assistance (Claude). itch.io asks about generative AI use on the edit page. |
| Content | No sensitive content flags needed beyond crude humor; leave "contains mature content" off unless itch.io's current wording requires it for the Purple Wobbler. |
| Community | Comments on, so players can post their levels. |
| Visibility | Draft first, check the embed on your phone, then Public. |

## Page text (paste into Description)

> **You vs. a rubber chicken. A cup. A bell. Reflexes.**
>
> You and the chicken take turns tapping a cup that covers a bell. On your beat you can **steal** the cup instead. If the chicken slams the open bell, everything freezes and you get to **SMACK** it. If *you* hit the bell, it smacks you, with a frying pan, a toilet seat, the kitchen sink or a live goose.
>
> **How to play**
> - **TAP** (Space) on your beat, when the ring closes on the cup.
> - **TAKE** (F) to steal the cup. The longer you play it straight, the more likely the chicken falls for it.
> - When the chicken takes the cup, **don't touch anything**.
> - Win the level and finish it off. Hold to squeeze. HAAAAWWWWW.
>
> **What's in it**
> - Endless levels: 105 BPM at level 1, 400 BPM by level 20. What level are you on?
> - A chicken that learns your habits.
> - 4 finishers, 44 ridiculous weapons, Mystery Packs earned by playing.
> - A clip of every finisher with your level stamped on it, ready to share.
>
> Free. No ads, no account, saves stay in your browser. Works on phones too.
>
> Made by [your name or handle]. Tell me your level in the comments.

## After it's live

- Post the itch.io link and a finisher clip to r/WebGames, r/playmygame and r/IndieGaming (one subreddit a day, follow each sub's rules).
- Put the itch.io link next to the GitHub Pages link in social bios.
- itch.io analytics show views, plays and referrers. Watch whether people come back (see the launch plan's retention bar).
