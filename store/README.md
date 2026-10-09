# Store assets

Everything here is captured from the real game by `tools/capture-store-assets.js`. Re-run it after the game changes:

```sh
npm run store:capture      # or: node tools/capture-store-assets.js (needs Playwright with Chromium, and ffmpeg)
```

## What's here

| File | Size | Where it goes |
| --- | --- | --- |
| `app-store/screenshots/*.png` | 1320×2868 | App Store Connect, iPhone 6.9" screenshots (captioned). Upload in order 01–06. |
| `app-store/screenshots-raw/*.png` | 1320×2868 | Same scenes without captions, in case you prefer plain screenshots. |
| `google-play/screenshots/*.png` | 1080×1920 | Play Console, phone screenshots (captioned). |
| `google-play/screenshots-raw/*.png` | 1080×1920 | Same scenes without captions. |
| `google-play/feature-graphic-1024x500.png` | 1024×500 | Play Console, feature graphic (required). |
| `trailer/app-preview-886x1920.mp4` | 886×1920, ~22 s, 30 fps, H.264/AAC | App Store Connect, app preview video for 6.9" iPhone. |
| `trailer/trailer-1080x1920.mp4` | 1080×1920, ~22 s | Upload to YouTube (unlisted is fine) and paste the link into the Play Console's promo video field. Also good for TikTok / Reels / Shorts. |
| `itch/cover-630x500.png` | 630×500 | itch.io cover image. |

The trailer is real gameplay: the finisher scream, a rally with a dodge, a take and a SMACK, level 20 at 400 BPM, then a short end card. Apple wants app previews to show footage captured from the app; the end card is just the game's title over its own artwork, which is usually fine, but if a reviewer objects, trim the last 2.5 seconds.

Sizes follow the current store specs as of October 2026 (App Store 6.9" screenshots 1320×2868 and previews 886×1920 at 15–30 s; Play phone screenshots 9:16 and a 1024×500 feature graphic). Double-check in each console when uploading; they occasionally change.

## Listing text (draft)

**App name:** Cluck Around and Find Out

**App Store subtitle (30 max):** Tap. Steal. Smack the chicken.

**Google Play short description (80 max):** A 1v1 reflex game against a rubber chicken. Don't touch the bell.

**Full description:**

> You and a rubber chicken take turns tapping a cup that covers a bell. On your beat you can steal the cup instead. If the chicken slams down on the open bell, everything freezes and you get to smack it. If you hit the bell, it smacks you, with a frying pan, a toilet seat, the kitchen sink, or a live goose.
>
> - Two buttons, pure reflexes: TAP or TAKE.
> - It gets faster every level, forever. 105 BPM at level 1, 400 BPM by level 20.
> - The chicken learns your habits. Play it straight, then strike.
> - Win a level and finish it off: choke it, yeet it out the window, pump it full of helium, or bass-boost the scream.
> - 44 ridiculous weapons to collect.
> - Share a clip of every finisher with your level stamped on it. What level are you on?
>
> No ads. No account. Your progress stays on your phone.

**Keywords (App Store, 100 characters max):** rubber chicken,reflex,rhythm,party game,funny,tap,reaction,slap,arcade,casual

**Category:** Games › Arcade (secondary: Casual / Music)

**Age rating:** answer the questionnaire honestly; expect 13+ on the App Store (frequent cartoon slapstick and crude humor). Play: target audience 13+.

**Privacy policy URL:** https://syoon117.github.io/Cluck-Around-And-Find-Out/privacy.html (add the contact email once it exists).
