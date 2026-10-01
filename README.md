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
- To play-test a level, open the page with `#level-20` (or any number) on the URL and use the **Test** button.
- You have 5 HP. The chicken has 3 HP on level 1, 4 on levels 2–3, and 5 after that. The last hit on the chicken is always the finisher.

## Intro

The first time you hit Play in a session there's a ~7 second cold open: a beaten rubber chicken on the floor, a slow push-in with a drone and heartbeat, its eye snaps open, and it comes back screaming for revenge. Tap or press any key to skip it. The **Intro** toggle on the title screen turns it off for good.

## Economy (in-game eggs for now)

Eggs are earned by smacking (+3), dodging (+1) and clearing levels (+10 + 5×level). They buy:

- **Smack packs**: weapons added to your random pool (Kitchen, Hardware Store, Laundry Day, Cursed).
- **Finishers**: Choke the Chicken (free), Window Yeet, Helium Huff, Bass Boosted.

All packs and prices live in `PACKS` and `FINISHERS` at the top of `js/game.js`, keyed by a stable `id`, so they can map 1:1 to in-app purchase product IDs later.

## Running it

It's a static page with no build step. Open `index.html` directly, or serve the folder:

```sh
npx serve .        # or: python3 -m http.server
```

All graphics are drawn on a canvas and every sound is synthesized with the Web Audio API, so there are no asset files.

## Files

- `index.html`: page, menus, styles
- `js/audio.js`: synthesized sounds (cup taps, bell, weapon impacts, the short squeak on hits, the long scream in finishers, the backing groove)
- `js/draw.js`: canvas drawing (room, chicken, gloves, cup, bell, weapons, particles)
- `js/game.js`: rhythm engine, chicken AI, smacks, finishers, shop, save data (localStorage)

## Toward the App Store

The plan is to wrap this folder as a native app with [Capacitor](https://capacitorjs.com/) (`npx cap add ios`, then point `webDir` at this folder). Things to handle when you get there:

- **Payments**: Apple requires its own in-app purchase system for digital goods like these packs. Use a Capacitor IAP plugin (for example RevenueCat) and grant the pack `id` when a purchase succeeds. Don't use Stripe or a web checkout for packs inside the iOS app.
- **Fonts**: the menus load two Google Fonts over the network. Bundle the font files locally for an offline app.
- **Age rating**: the humor (and the Cursed Pack) will likely land at 12+ or 17+ in the App Store questionnaire. Answer it honestly to avoid a rejection.
- **Save data** is in `localStorage`, which persists inside a Capacitor WebView. Add cloud save later if you want it to sync across devices.
