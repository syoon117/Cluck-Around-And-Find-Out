# Cluck Around and Find Out

A 1v1 reflex game against a rubber chicken, based on the cup-and-bell slap game.

You and the chicken take turns tapping a plastic cup that covers a bell. On your beat you can **take** the cup instead. If the other side slams down on the open bell, they get smacked. Whoever holds the cup has to put it back on their next beat. Every level is faster. Win a level and you get to finish the chicken off with a long, stupid HAAAAWWWWW.

## Controls

| Action | Phone | Keyboard |
| --- | --- | --- |
| Tap the cup (on your beat) | **TAP** button, or tap the table | `Space` / `J` |
| Take the cup (on your beat) | **TAKE** button | `F` / `G` |
| Smack the chicken (after it rings the bell) | **SMACK!** button | `Space` |
| Finisher: squeeze | hold either button | hold `Space` or `F` |
| Pause | ‖ button | `Esc` / `P` |

## Rules as implemented

- Beats alternate chicken → you. A ring closes on the cup to show your beat.
- **Missing your beat** with the cup on the bell counts as a foul, and you get smacked.
- **Tapping while the chicken holds the cup** rings the bell. You get smacked.
- **Not tapping while the chicken holds the cup** is a dodge (+1 egg).
- **Taking**: whether the chicken falls for it depends on its *suspicion*. Every clean tap in a row lowers suspicion, and off-beat taps reset it.
- When the chicken rings the bell, the game freezes until you hit **SMACK!**, so every hit lands on your press.
- Levels never end and the tempo keeps climbing: ~105 BPM at level 1, ~250 at 10, ~400 at 20, ~490 by 40. Past level ~15 it's faster than human reaction, so you have to read the chicken. Fake grabs start at level 3, and the chicken's "shifty eyes" tell fades out by level 7. The whole curve is the `tempoFor()` function at the top of `js/game.js`.
- **Modes**: *Ranked* always uses the same tempo curve, and it's the only mode that moves your badge. *Custom* lets you pick how fast the tempo climbs per level (×0.5 Slow burn, ×1 Standard, ×2 Fast, ×4 Unhinged) and keeps its own progress per setting.
- Your Ranked best level shows as a badge with a rank title (Raw Egg → Chick → … → The Final Squeak at 100), and the results screens have a copyable brag line.
- **Start anywhere**: the title screen has a level picker (−10 / − / + / +10, hold to repeat) that defaults to where you left off. Starting high doesn't cheat the badge: it only moves when you *clear* a Ranked level. Opening the page with `#level-20` presets the picker, for play-testing.
- You have 5 HP. The chicken has 3 HP on level 1, 4 on levels 2–3, and 5 after that. The last hit on the chicken is always the finisher.

## Tutorial and hints

The first time you play level 1 there's a short hands-on tutorial at a slow tempo with no HP at stake: tap 3 times on the beat, survive the chicken taking the cup without tapping, then take the cup yourself (the chicken always falls for it) and smack it. It can be skipped, and replayed from **How to play**.

For everyone, afterwards:
- The **TAKE** button glows when the chicken's suspicion is low enough that a take is likely to work.
- On levels 1–2, a **DON'T TAP!** warning flashes when the chicken takes the cup.

## Intro

The first time you hit Play in a session there's a ~7 second cold open: a beaten rubber chicken on the floor, a slow push-in with a drone and heartbeat, its eye snaps open, and it comes back screaming for revenge. Tap or press any key to skip it. The **Intro** toggle on the title screen turns it off for good.

## Items and Mystery Packs

There are 44 things to get smacked with, in five tiers: Starter (Bare Hand, Cafeteria Tray), Common, Rare, Epic and Legendary. Examples: frying pan, rubber duck, flip phone, eggplant, electric guitar, rotisserie chicken, toilet seat, fire extinguisher, grandma's purse, participation trophy, anvil, the kitchen sink, a live goose, the Purple Wobbler. Each item has its own drawing and impact sound.

- The chicken hits you with **any** item, owned or not. The caption tells you the rarity and whether it's in your collection yet.
- You smack the chicken with a random item **you own**.
- A **Mystery Pack** gives 5 random items, rarity-weighted (Common 60%, Rare 27%, Epic 10%, Legendary 3%), with at least one Rare or better. Duplicates refund eggs (3 / 8 / 20 / 50 by rarity).
- The Packs screen shows your collection (owned items, silhouettes for the rest) and the finishers.

## Economy (in-game eggs for now)

Eggs are earned by smacking (+3), dodging (+1) and clearing levels (+10 + 5×level). New players start with 60, enough for one pack. Eggs buy:

- **Mystery Packs**: 60 eggs each.
- **Finishers**: Choke the Chicken (free), Window Yeet, Helium Huff, Bass Boosted.

The catalog (`WEAPONS`, `RARITY`, `MYSTERY`) is at the top of `js/game.js`. All pack purchases go through `buyPack()`. For the App Store build, replace its egg check with an in-app purchase of `MYSTERY.product` (`mystery_pack_5`, e.g. $0.99) and call `grantPack()` when the purchase succeeds.

## Playing it on phones

The game is hosted for free with GitHub Pages at **https://syoon117.github.io/Cluck-Around-And-Find-Out/** once Pages is turned on (repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick the branch and `/ (root)`, Save). Every push to that branch updates the site in a minute or two, and installed copies pick it up on their next launch (when online).

To install it like an app:

- **iPhone (Safari):** open the link, tap **Share → Add to Home Screen**. It launches full screen with its own icon.
- **Android (Chrome):** open the link, tap **⋮ → Install app** (or **Add to Home screen**).

After the first launch it works offline. On iPhone, if there's no sound, check the ring/silent switch.

## Running it

It's a static page with no build step. Open `index.html` directly, or serve the folder:

```sh
npx serve .        # or: python3 -m http.server
```

All graphics are drawn on a canvas and every sound is synthesized with the Web Audio API, so the only image files are the app icons. `manifest.webmanifest` and `sw.js` make it installable and playable offline.

## Files

- `index.html`: page, menus, styles
- `js/audio.js`: synthesized sounds (cup taps, bell, weapon impacts, the short squeak on hits, the long scream in finishers, the backing groove). The rubber chicken voice is built from the harmonic mix measured off a real rubber chicken recording. `Sfx.init(offlineContext)` renders sounds offline for checking them without speakers.
- `js/draw.js`: canvas drawing (room, chicken, gloves, cup, bell, all 44 items, particles)
- `js/game.js`: rhythm engine, chicken AI, smacks, finishers, shop, save data (localStorage)

## Toward the App Store

The plan is to wrap this folder as a native app with [Capacitor](https://capacitorjs.com/) (`npx cap add ios`, then point `webDir` at this folder). Things to handle when you get there:

- **Payments**: Apple requires its own in-app purchase system for digital goods like these packs. Use a Capacitor IAP plugin (for example RevenueCat) and call `grantPack()` when a `mystery_pack_5` purchase succeeds. Randomized paid packs ("loot boxes") also have to show the odds before purchase under App Store rules, and some countries restrict or ban them. The odds are listed above and in `RARITY`. Don't use Stripe or a web checkout for packs inside the iOS app.
- **Fonts**: the menus load two Google Fonts over the network. Bundle the font files locally for an offline app.
- **Age rating**: the humor (and items like the Purple Wobbler) will likely land at 12+ or 17+ in the App Store questionnaire. Answer it honestly to avoid a rejection.
- **Save data** is in `localStorage`, which persists inside a Capacitor WebView. Add cloud save later if you want it to sync across devices.
