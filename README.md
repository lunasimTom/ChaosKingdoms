# Chaos Kingdoms

Tower-defense game in a single self-contained HTML file, plus an Android build.

## Downloads

| File | What it is |
| --- | --- |
| `dist/ChaosKingdoms.html` | The game. Open it in any modern browser. Works offline because the fonts are embedded. |
| `dist/ChaosKingdoms-v2.6.0.apk` | Android app (package `com.chaoskingdoms.game`, version 2.6.0, Android 7.0 or newer). Signed with APK Signature Scheme v2, with the same key as earlier versions, so it installs as an update. |

## What changed in v2.6

**Each base has its own lives.** On maps with two bases, the level's lives are split between them (10 + 10), so total lives and star ratings stay the same.
- A monster that gets through damages only the base it reached.
- Each base shows its own life bar and count.
- When a base falls, it collapses into smoking rubble with a "HOLD THE LINE" banner, and monsters re-route to the base still standing.
- You lose only when every base is destroyed.
- Healing (potion, bought hearts, rewards) goes to the weakest surviving base.
- Single-base maps play exactly as before.

## What changed in v2.5

**Boss battles**
- **Enrage (level 40+, at 20% HP or less):** the boss swells to **3× its size for 3 seconds**, with a red shockwave and screen shake, then shrinks back to normal. The charging, the red pulse and the +15% damage stay on for the rest of the fight.
- **Boss health bar** at the top of the board, showing the boss's name, its HP percentage and markers at 50% and 20% (the reinforcement points). The bar turns fiery while the boss is enraged.
- Each boss footstep leaves a fading ground crack and a puff of dust.
- The killing blow on a boss plays a short slow-motion beat and a "VICTORY" banner.

**Monsters**
- **Elite monsters** appear from level 7 (3.5% of spawns, rising to 12%). They have 2.2× HP, are 22% larger, have a pulsing gold outline, a crown and a gold health bar, and are worth 3× gold.
- **New death effect:** the monster flashes white, then squashes and dissolves in place. A few shards fly off in its own colours (bone, slime, embers and so on).
- **Livelier motion:**
  - Monsters pop in with a springy scale when they spawn.
  - They squash when hit.
  - Brutes and bosses stomp with heavier footfalls.
  - Flyers cast lighter shadows.

**Balance**
- **Healing Potion:** the rising price is intentional, but it went up 150 per purchase with no limit. It now goes up 100 per purchase and stops at 700, and it still resets every level. A potion is no longer used up when your lives are already full (30).

**Performance**
- **Automatic quality:** the game watches the real frame rate. If a device can't keep about 30 fps, it turns off optional extras until the frame rate recovers: monster outlines, death shards, footstep cracks, light shafts and fireflies. On fast devices everything stays on.
- All new effects reuse cached images and fixed-size pools: at most 36 dissolving bodies and 70 floating combat numbers at a time.
- In testing, 120 monsters with outlines and glows render in about 7–8 ms per frame.

## What changed in v2.2

- **Spawn protection** lasts 1.5 s (was 2.5 s). The pale-yellow ring is gone. A protected monster now shimmers with a soft glow on its own body.
- **Boss Enrage Mode from level 40.** At 20% HP or less the boss:
  - grows 30% larger;
  - charges across the map in bursts, smashing towers it runs into;
  - pulses red;
  - deals 15% more damage.

  Bosses before level 40 keep the original enrage at 33% HP.
- **5-second countdown before each boss reinforcement call** (at 50% and 20% HP, level 33 and up). A large ring counts down near the top of the board, with a beep each second. The second call waits for the first, and killing the boss during a countdown cancels the drop.
- **Screen fit:**
  - The game measures the real visible area at start-up and on every resize, leaving out notches, camera cut-outs and rounded corners.
  - Tall phones (20:9, 21:9) use their full height instead of showing bands.
  - Capable devices render at up to 2× pixel density.
- **Monster visuals:**
  - Every monster has a soft dark outline, so it stands out from the ground.
  - Hit flashes, spawn shimmer and the enrage glow now use cached tinted sprites instead of a canvas filter. A wave of 120 freshly spawned monsters now takes about 19 ms per frame instead of 270 ms.

## What changed in v2.1

- **Freeze lasts 10 seconds** (was 4). The shop text in English and Chinese is updated to match.
- **Smaller no-build zone around monster portals.** It was a 5×5 block per portal from level 33 onward, which covered up to half the board on 4-portal maps. It is now the portal tile plus its four direct neighbours. Late levels go from about 45–60 buildable tiles to about 88–100.
- **Late-game slowdown fixed.** The game loop credited at most 50 ms of game time per frame, so whenever the frame rate dropped below 20 fps, everything (energy-core build timers, waves, cooldowns) quietly ran in slow motion. Frames were slow for these reasons:
  - each portal drew about 30 glowing strokes with canvas blur every frame;
  - tower sprites were cached at full size (380×428, up to 180 of them) and shrunk on every draw;
  - turning towers kept missing the sprite cache;
  - each level gem used a clip and a blend pass.

  All four are fixed, and the loop now catches up to 150 ms per frame. On a 4-portal map with 40 towers, a frame takes about 22 ms instead of 139 ms.

## What changed in v2.0

**Bug fixes**
- The victory/defeat panel is built 900 ms after a level ends. If another level or the map demo started in that gap, the panel read rewards that no longer existed and crashed. It now checks that the level is still the current one.
- In the world atlas, row two read right to left (VIII VII VI V). All realms now read I to XII in order.
- Realm names were cut off with "…". Each name now shrinks until it fits on one line.
- The main-menu buttons (history, transfer, redeem) spilled outside the composed menu. Every control now sits in the same layout grid.
- The "In shop: game paused" notice covered the Shop header. It now shows above the build bar while the shop is open.
- The Chinese map title showed the English default name ("Commander的王国"). It now shows "指挥官".
- The HTML had two `<!doctype>` and `<head>` sections, a `<title>` inside `<body>`, and a white background that flashed before styles loaded. All three are fixed.
- The fonts came from Google Fonts, so text fell back to plain system fonts offline and inside the APK. Cinzel, Nunito and Fredoka are now embedded.

**Presentation**
- Loading splash with an animated crest and progress bar.
- Title screen with a slowly drifting realm painting, light rays, rising embers and fog, a gently floating logo, and a light sweep on the Play button.
- In-game lighting layer: a warm key light, drifting cloud shadows, light shafts, fireflies or motes on the matching realms, and a vignette. The screen edges flash red when you lose a life, and a red pulse plays while a boss is on the field.
- Banners announce each wave, with a separate "BOSS INCOMING" banner for the final boss wave.
- HUD numbers pop when coins or the wave count change and shake when you lose a life. Build cards, buttons, map pins and level nodes respond when pressed.
- Light rays turn behind the Victory and Defeat banners, and screens and dialogs slide in.
- The empty space around the game on wide or tall screens now shows a blurred painting of the current realm instead of black bars.
- Phone niceties: no tap highlight, no long-press menus, no accidental pinch-zoom, and a reduced-motion setting that turns off the animations.

**Android app**
- Full-screen immersive WebView, and the screen stays on while you play.
- Rotating the device does not restart the game.
- The in-game ⟳ button rotates the device screen itself.
- The hardware Back button works in steps: it closes the open panel or dialog, then opens the pause menu, then goes from the map to the title screen, then moves the app to the background.
- Leaving the app opens the pause menu and saves your progress.

## Building

```bash
# 1. HTML (source/original + source/premium -> dist/ChaosKingdoms.html)
python3 tools/build_html.py

# 2. Android (needs a JDK, plus dalvik-dx and apksig from Maven Central)
cd android
python3 mkstubs.py stubs            # minimal android.* compile stubs
javac --release 8 -d /tmp/stubcls $(find stubs -name '*.java')
javac --release 8 -cp /tmp/stubcls -d /tmp/classes src/com/chaoskingdoms/game/MainActivity.java
(cd /tmp/classes && java -cp dalvik-dx-16.0.1.jar com.android.dx.command.Main --dex --min-sdk-version=21 --output=/tmp/classes.dex .)
python3 apkbuild.py /tmp/classes.dex ic_launcher.png ../dist/ChaosKingdoms.html /tmp/unsigned.apk
javac -cp apksig-2.3.0.jar -d /tmp/signer signer/SignApk.java
java --add-exports java.base/sun.security.x509=ALL-UNNAMED --add-exports java.base/sun.security.pkcs=ALL-UNNAMED \
     --add-exports java.base/sun.security.util=ALL-UNNAMED -cp apksig-2.3.0.jar:/tmp/signer \
     SignApk <keystore.p12> <password> <alias> /tmp/unsigned.apk ../dist/ChaosKingdoms-v2.6.0.apk
```

`apkbuild.py` writes the binary `AndroidManifest.xml` and `resources.arsc` itself and stores the resource table 4-byte aligned, as Android 11+ requires. It does not need the Android SDK.

The release keystore is not stored in this repository. Android only installs an update over an existing install when both are signed with the same key, so keep the keystore somewhere safe.

Fonts: Cinzel, Nunito and Fredoka are under the SIL Open Font License (`tools/fonts/OFL-LICENSE.txt`).
