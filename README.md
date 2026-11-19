# Chaos Kingdoms

Tower-defense game in a single self-contained HTML file, plus an Android build.

## Downloads

| File | What it is |
| --- | --- |
| `dist/ChaosKingdoms.html` | The game. Open it in any modern browser. Works offline because the fonts are embedded. |
| `dist/ChaosKingdoms-v4.1.apk` | Android app (package `com.chaoskingdoms.game`, version 4.1, Android 7.0 or newer). Signed with APK Signature Scheme v2, with the same key as earlier versions, so it installs as an update. |

## What changed in v4.1 · Loot

All loot code is in `source/premium/loot.js`.

**Boss treasure explosion.** The moment the final boss of a level dies:
- Every tower and barricade vanishes in a gold flash. Terrain, rivers, trees and rocks stay.
- Any remaining minions and queued monsters disappear, and the screen shakes.
- The whole treasure bursts out of the boss at once, flying to tiles all over the map in about half a second.

Earlier bosses on multi-boss levels drop nothing.

The tower refund for winning is calculated before the towers vanish, so it is unchanged.

**A strict 5-second collection window.**
- The countdown ring starts as the loot lands. Seconds 0-4: fully visible. From second 4: the loot fades. At second 5: everything left is gone for good. There is no "collect all" and no compensation.
- Tap a tile to collect everything on it. Each item flies to its counter, with a floating label and a pickup chime that gets richer with rarity.
- The timer runs on real time, so game speed doesn't change it. It pauses while the pause menu or shop is open.
- When the window closes the game shows "Treasure collected: X / Y", and the level then ends normally.

**Treasure size and rarity.**
- About 22 pieces at Level 8 on Novice, up to 80 at Level 100 (the cap). More bosses, a higher difficulty and a healthier base mean more pieces.
- Rarity per piece: Common 50% · Uncommon 25% · Rare 14% · Epic 7% · Legendary 3% · Mythic 0.8%. The better tiers grow with level, difficulty and base health; measured: 46 / 23 / 17 / 8.6 / 3.6 / 1.0% at Level 100 on Normal.
- Glows and effects rise with rarity: from no glow, through green, blue, purple and gold, to pink with particles. Legendary and Mythic pieces also get a light beam and a banner.

**What drops.**
- Gold, stars, diamond fragments, diamonds (Epic and up), Enhancement Runes (Epic and up), shop consumables and rare items.
- A Mythic piece is a jackpot: 4 diamonds, 3 runes and 3 rare items.
- **Replays:** 25% of the pieces, capped at Rare: no diamonds, runes, rare items or Legendary and Mythic drops (0 in 300 tested replays).

**Rare items** (never sold in the shop; they go into the item bar):

| Item | Effect |
| --- | --- |
| ⏳ Chrono Crystal | freezes every monster for 8 s and slows bosses for 6 s |
| 🐉 Dragonfire Scroll | 35% of max health to every monster, 6% to bosses |
| 🏰 Aegis of Kings | restores every standing base to full health and shields them from leaks for 15 s |
| ⚒️ Master Forge | every level 1-2 tower goes up a level |
| 👑 Midas Seal | kill gold x3 for 45 s |
| 🎺 War Horn of Ages | towers deal +35% damage and fire 60% faster for 25 s |

**Enhancement Runes.** In the Bonus Upgrade screen, "Use a rune" upgrades the selected attribute (Attack, Defense, Build Speed or Crit Rate) once, free, up to the normal maximum of Level 10.

**Diamonds.**
- 4 diamond fragments forge 1 diamond automatically ("+1 💎 Diamond Forged!"). The fragment count shows next to the diamond balance.
- A new Diamond Exchange in the Bonus Upgrade screen turns 1 diamond into 10,000 gold. Nothing can be exchanged into diamonds.
- Diamonds come only from boss treasure and the existing voucher codes.

**Medium monster drops.**
- Brutes drop something about 11% of the time and elites 25%. Grunts and runners drop nothing.
- Drops are Common only: a little gold (into battle coins), 1 star or a basic consumable. Never diamonds, fragments, runes or rare items.
- A drop can land on any tile and lasts 20 s of game time, blinking in its last 5 s.

**Tap priority.** Tapping a tile with loot always collects it first: on towers, bases, water, obstacles and swamp. Tap again for the normal action.

**Saves.** Fragments and runes are saved. Runes are included in progress transfer; fragments, like diamonds, are not.

**Tested**
- The full sequence on 1-boss and 4-boss levels: towers cleared, the 5.0 s window, fading from second 4, the level ending only afterwards, and the refund.
- Real taps on towers, water and obstacles. Every reward type and the 4-to-1 forge. All six rare items. Runes, including the cap. The exchange, including with 0 diamonds. Save and transfer.
- Drop rates over thousands of simulated treasures and 10,000 monster kills. Replay limits.
- Frame rate during a real explosion: median 17 ms per frame, worst 55 ms.
- The full existing test suite.

## What changed in v4.0

**Fix: a 2-3 second freeze when entering any level.** Each level's soundtrack is composed when the level starts. Since v3.7 the composer ran on the game's main thread, so the game stopped for 2.5-2.9 s on a desktop and longer on phones. Level loading itself takes about 10 ms.

The composer (`source/premium/music_core.js`) now runs in a background Web Worker:
- The level starts instantly; in tests the worst frame gap at level start was 25-64 ms, down from 2,500-2,900 ms.
- The music fades in about 3 seconds later. Replaying a recent level reuses the cached track at once.
- Starting a new level cancels a track that is still being composed for a level you have left, so hopping between levels never queues up work.
- If a device cannot run workers, the game falls back to its original composer.

**Rebalanced late-game bosses: one smooth curve.** The old curve was flat until Level 64, jumped x1.75 to Level 72, then made a x3 leap from Level 96 to Level 97. Now:
- From Level 56, every boss level is an even x1.47 step tougher than the one before, up to Level 96.
- The final four are a separate finale tier: about twice Level 96 at Level 97, then about a third harder each level.
- Defense and attack grow along the same curve.

Effective HP per boss on Normal (health x defense):

| Level | Bosses | v3.9 -> v4.0 | Step | Attack |
| --- | --- | --- | --- | --- |
| 64 | 3 | 48,143 -> 62,740 | x1.47 | x1.16 |
| 72 | 3 | 95,593 -> 92,927 | x1.48 | x1.32 |
| 80 | 3 | 159,721 -> 137,190 | x1.48 | x1.48 |
| 88 | 4 | 242,779 -> 201,756 | x1.47 | x1.64 |
| 96 | 4 | 347,018 -> 295,634 | x1.47 | x1.80 |
| 97 | 4 | 1,087,588 -> 639,758 | x2.16 | x2.20 |
| 98 | 4 | 1,421,232 -> 861,353 | x1.35 | x2.45 |
| 99 | 4 | 1,790,123 -> 1,123,356 | x1.30 | x2.70 |
| 100 | 4 | 2,458,505 -> 1,536,566 | x1.37 | x3.00 |

Against a maxed 40-tower defense, one boss now lasts 23 / 25 / 28 / 39 / 54 / 62 / 80 seconds on Levels 80 / 88 / 96 / 97 / 98 / 99 / 100. The v3.9 figures were 24 / 27 / 30 / 57 / 87 / 91 / 117. Every boss still enters Rage Mode for the full 8 seconds. Level 96 is harder than Level 88, and every boss level is harder than the one before.

**Tested**
- Level-start frame timing with music on, on five levels and while hopping between levels.
- Boss strength on every boss level, plus real fights against a maxed defense (rage on every level).
- All 16 boss fights (sprite check every frame), boss summons, the base siege, no start-of-level pop-ups, the 42-state interface walkthrough, the item-bar touch test, gameplay and the benchmark all pass.

## What changed in v3.9

**Fix: levels could freeze at the start.** Some levels opened a pop-up by themselves half a second after starting ("Multiple bases", "Base upgrades"). It paused the game and could leave it stuck. A crown message and first-time enemy tips also popped up at the start. Nothing opens by itself any more.

**New: Tips panel.** A 💡 button next to the Build and Shop tabs opens a panel for the current level. The game pauses while it is open, and "Back to battle" resumes. The panel is built from the level itself, so every level shows what matters there:
- **This level:** waves, portals and bases, the multiple-bases rules when there is more than one base, base upgrades, how many shrines there are and what they do (+20% damage, +10% range), portal corruption, swamps, water, and the crown challenge with its status.
- **Enemies on this level:** the exact enemy roles in this level's waves, with how many of each and how to beat them; flyers; elites.
- **Boss fight** (boss levels only): the boss's name and how many come, its weakness and adaptation, reinforcements at 50% and 25%, Rage Mode, its siege of your base, and its stomp.
- **How to fight:** damage types, every combo, items and calling waves early.

Fully translated into Chinese.

**Tested**
- Levels 1, 3, 13, 30, 48, 88 and 100 started on a fresh save. No pop-up opened, and the game kept running; on v3.8, Level 3 froze behind a pop-up.
- The 💡 button tapped on an emulated Pixel 7: each panel listed the right items for that level, paused the game, and closed back into the battle. Also checked in Chinese.
- The 42-state interface walkthrough (portrait and landscape), the item-bar touch test and gameplay all pass.

## What changed in v3.8

**Fix: bosses vanished when they touched a base.** Since bosses were made to ignore buildings (v3.5), they used the flying monsters' movement, including its "reached the base" step. That step removes the monster and charges the lives at once. So a boss disappeared on contact, and it usually got there before its health fell to 20%, so Rage Mode never started.

Now a boss that reaches a base **besieges** it:
- It stays at the base and pounds it every 2 seconds, with a shockwave, screen shake and its own attack roar.
- Each hit deals 7% of that base's health, multiplied by the boss's attack power (about 25% per hit at Level 100).
- It keeps going until you kill it or the base falls; then it marches on to the next base.
- Your towers keep firing the whole time, so its Rage Mode still triggers at 20% HP.

**Quieter sound effects; the music leads.**
- The effects channel now plays at 55% and the music at 85% (before: 100% and 60%).
- The busiest sounds are turned down further: building and upgrading to about 30-35%, coins 30%, tower shots 60-70%. Item sounds are 70% of their old level.
- The volume sliders still work as before.

**Heavier, more powerful music.** The arrangement is now built on bass, strings and drums:
- A sub-bass under every bar.
- Driving eighth-note bass lines, which switch to sixteenths in the climax and on boss levels.
- A spiccato string ostinato (root, fifth and octave) through every section after the intro, plus sustained celli and basses.
- War drums with a deep body, taiko grooves, backbeat snares, tom fills every four bars, and extra taiko runs on boss levels.

In measurements, the share of energy below 150 Hz went from about 50% to 75%, and rhythmic punch (onset strength) rose by 20-70%. The melody bus was raised slightly, so the themes stay clear.

**Tested**
- Bosses reaching a base on Levels 8, 48 and 100: each stayed and besieged the base, which lost lives every 2 s until it fell.
- With towers around the base on Level 48, the boss entered Rage Mode for the full 8 s, then died.
- All 16 boss fights played to the end (sprite check every frame) with Rage on every level from 40.
- Boss summons, the 42-state interface walkthrough, the item-bar touch test, gameplay and the sound engine in real fights all pass. Music renders in about 3 s per track with no clipping.

## What changed in v3.7

**Fix: Rage Mode could be skipped.** With strong defences, a boss went from above 20% HP to 0 in a single volley, so Rage Mode never started. In a test with very high firepower on v3.6, the final bosses enraged for only 0.1 s before dying, without growing to full size. Now:
- From Level 40, a boss cannot drop below 19% HP until it has enraged.
- During its 8-second rampage it cannot be finished off; its HP stays at 3% or more, and it takes 40% less damage.

Every boss now reliably grows to 3x size and stampedes for the full 8 seconds, however strong your towers are. Tested on every two-to-four-boss level, from 40 to 100.

**Final bosses: brutal.** Effective HP per boss on Normal difficulty (health and defense combined), plus attack power:

| Level | Bosses | v3.6 -> v3.7 | Attack |
| --- | --- | --- | --- |
| 72 | 3 | 72,752 -> 95,593 | x1.23 |
| 80 | 3 | 103,345 -> 159,721 | x1.45 |
| 88 | 4 | 140,493 -> 242,779 | x1.68 |
| 96 | 4 | 184,771 -> 347,018 | x1.90 |
| 97 | 4 | 268,698 -> 1,087,588 (x4.0) | x2.6 |
| 98 | 4 | 326,166 -> 1,421,232 (x4.4) | x2.9 |
| 99 | 4 | 391,363 -> 1,790,123 (x4.6) | x3.2 |
| 100 | 4 | 491,701 -> 2,458,505 (x5.0) | x3.6 |

Against v3.5, the Level 100 bosses are now about 34x tougher. In a fully upgraded 40-tower kill zone, a single Level 100 boss now survives about 108 seconds; in v3.6 it was 30 seconds. Attack power widens the stomp (up to 4.3 tiles), lengthens its stun (up to 4.5 s), and raises the rampage's trample damage and the lives a boss takes at a base.

**New monster art.** All 18 regular monsters use the owner's new high-resolution sheet (`source/premium/monsters/`), cut out cleanly from the transparent PNG without the name plates and embedded as WebP. That is up to 240 px, against the old 70-90 px sprites. The Lich King has new art too. Facing rules were updated for the new poses.

**Premium Level 100 ending.**
- Each creature now gets a full card: a title and epithet, a lore paragraph, a battle tip, a threat rating (1 to 5 stars) and animated Health, Speed and Power bars.
- Each card has its own colour scheme. The art sits on a slowly turning rune circle with light rays and a glowing pedestal, against a nebula backdrop with rising embers.
- Text animates in line by line, with gold-foil titles, cinematic letterbox bars and a flash for every boss.
- Wide screens show the art beside the text; tall screens stack them.
- The thank-you card adds the player's journey: levels, foes defeated, boss victories and towers built.
- Still exactly 3 seconds per creature, with the same closing messages: an invitation to the next difficulty, or "Conqueror of Chaos Inferno".

**New soundtrack composer** (`source/premium/music.js`). Each level's music is now composed, not assembled:
- Every realm has its own key, mode, tempo, chord progression and lead instrument (horn or flute).
- A memorable two-bar motif is stated, answered, raised in sequence and resolved, with its notes landing on the chords.
- 32-bar form: intro, theme, development, climax, resolution, then loop.
- An orchestra of string pads, horn and flute leads, brass, a vowel-formant choir, harp arpeggios, bass, taiko, snare, hi-hats and cymbal swells, with a hall reverb.
- Boss levels are faster, in a harmonic minor key, with a driving bass ostinato, choir and brass.
- Each track is rendered by a fast sample-level synthesizer: about 2 seconds for 55 to 90 seconds of music, which is about 2.5x longer per track than the old composer for the same rendering time. If anything fails, the game falls back to the original music.

**Tested**
- Rage and boss strength measured on Levels 40-100, at normal and very high firepower.
- All 16 boss fights played to the end with a sprite check every frame: no missing sprites, and Rage triggered on every boss level from 40.
- The new monster art checked in-game at 3x zoom. Music rendered for menu, realms and boss levels: no clipping, about 2 s per track, playing in-game.
- The ending run for real on Hard and on Chaos Inferno: 40 cards, 2.97 to 3.03 s apart. Checked in portrait and landscape.
- The 42-state interface walkthrough, the item-bar touch test, boss summons, gameplay and the benchmark all pass.

## What changed in v3.6

**Stronger late-game bosses.** From Level 72, bosses grow steadily stronger, and the final four levels are true titans:

| Level | Bosses | Effective HP each (v3.5 -> v3.6, Normal) | Attack power |
| --- | --- | --- | --- |
| 72 | 3 | 53,704 -> 72,752 (x1.35) | x1.11 |
| 80 | 3 | 59,266 -> 103,345 (x1.74) | x1.23 |
| 88 | 4 | 64,827 -> 140,493 (x2.17) | x1.34 |
| 96 | 4 | 70,389 -> 184,771 (x2.62) | x1.45 |
| 97 | 4 | 71,084 -> 268,698 (x3.78) | x1.60 |
| 98 | 4 | 71,779 -> 326,166 (x4.54) | x1.75 |
| 99 | 4 | 72,475 -> 391,363 (x5.40) | x1.90 |
| 100 | 4 | 73,170 -> 491,701 (x6.72) | x2.10 |

Effective HP counts health and defense together. Attack power scales the stomp's reach and stun time (up to 3.3 tiles and 4.5 s), the rampage's trample damage, and the lives a boss takes if it reaches a base. In a fully upgraded 40-tower kill zone, a Level 100 boss used to die in about 3 seconds; it now takes about 16 seconds, and there are four of them.

**New sound engine.** Every sound is synthesized live with Web Audio, through the game's own Effects volume and sound toggle, with a hall reverb for depth (`source/premium/audio.js`).
- Each of the 18 monster types has its own voice for being hit and for dying. Some examples: the Goblin chatters, Skeletons rattle, Zombies moan, Spiders chitter, the Dire Wolf howls, the Dark Knight clangs, the Vampire hisses, the Golem crumbles and the Ghost wails. Pitch varies every time, and monsters are panned by their position on the map.
- Each of the 19 boss portraits has a deep signature voice: a layered roar plus its own texture, such as bones, hellfire, ice, flame, choir, steel, stone, water, bats, chitter, wood, the void or thunder.
- Boss cues: spawning (impact, roar and texture), stomp attack, Rage Mode (rising roar and war drums), taking damage (throttled grunts) and death (a long falling roar, collapse and rumble).
- A short victory fanfare plays after every boss level.
- Tower and effect samples vary more in pitch, volume and stereo position, so repeated shots sound less mechanical.
- In big fights, new monster voices are capped at about 14 per 100 ms, to keep the mix clean.

**Level 100 ending** (`source/premium/ending.js`). After winning Level 100, a cinematic sequence starts with its own music:
- An opening card, then every monster and boss introduced one by one, from the lowest level to the highest (36 in all). Each shows for exactly 3 seconds, with its art, name, first level, role and a short description, and plays its own voice.
- A group portrait of the whole Chaos Legion.
- A thank-you message to the commander by name.
- Then a difficulty message. If the player has never finished Level 100 on Chaos Inferno (the highest difficulty), it invites them to try the next difficulty up. If they have, it hails them as "Conqueror of Chaos Inferno" instead.

The sequence can be skipped, and Continue returns to the Victory panel. The game saves the hardest difficulty Level 100 was beaten on.

**Tested**
- Boss stats compared with v3.5 on every boss level, plus a time-to-kill measurement against a maxed defense.
- Every monster and boss sound rendered offline and measured: all audible, and the 18 monster death sounds are all distinct.
- The sound engine in real fights with audio on: no errors, every cue fires, and frame time is no worse than v3.5.
- The Level 100 ending run for real on Hard and on Chaos Inferno: 40 cards, each monster on screen for 2.98 to 3.02 s, the right closing message for each case, and Continue back to the Victory panel. Also checked in Chinese.
- The 42-state interface walkthrough, the item-bar touch test, boss fights, boss summons, gameplay and the 40-tower benchmark all pass.

## What changed in v3.5

**One boss per enemy base.** A boss wave now sends as many bosses as the level has enemy bases (portals): 1, 2, 3 or 4. Each boss starts at a different base and has its own portrait, all different on the same level. The bosses' reinforcement summons are shared out between them, so the total number of summoned monsters stays as designed.

| Levels | Enemy bases | Bosses |
| --- | --- | --- |
| 8, 16, 24, 32 | 1 | 1 |
| 40, 48, 56 | 2 | 2 |
| 64, 72, 80 | 3 | 3 |
| 88, 96, 97, 98, 99, 100 | 4 | 4 |

**Bosses ignore buildings.** Bosses walk straight to the nearest base, like flying monsters. They never stop to attack towers or barricades, are never blocked by them, and can cross water. They still stun nearby towers with their stomp.

**Rage Mode lasts 8 seconds.** From Level 40, a boss at 20% HP swells to three times its size and stampedes freely across the whole map for 8 s, ignoring paths and buildings. It charges towards far corners and distant towers, and tramples every tower it runs over. Then it shrinks back and resumes its normal march.

**Fix: the Treasure "Reset All Item Cooldowns" did not last.** It only cleared the timers that were running when you bought it; the next time you used an item, the cooldown came back. It is now **No Item Cooldowns**, a permanent upgrade like the other Treasures: from the moment you buy it, items never go on cooldown, in every battle, and it survives restarts. The shop shows "No cooldown" for every item. Redeem codes made with Code Forge still work.

**Fix: "Clear All Natural Obstacles" left the swamps.** It now also removes swamps, and the map is redrawn immediately, so those tiles can be built on straight away, including when the treasure is bought mid-battle.

**Tested**
- Bosses and bases on all 16 boss levels: the counts match, every boss starts at a different base, and no two share a portrait.
- The Treasures redeemed end to end with genuine Code Forge codes in the Treasure tab during a battle:
  - No Item Cooldowns: before, Meteor took a 45 s cooldown. After, every item, including River, Airstrike and Bomber, has 0, used twice in a row. It still works after a page reload and in a new level.
  - Clear All Natural Obstacles: on Level 1 the 4 swamps and 11 obstacles vanished at once, and a tower was then built on a former swamp tile.
- Bosses on Levels 48, 88 and 100, with 20 to 24 towers in their way: all of them walked to a base and never attacked a building.
- Rage: exactly 8.0 s at 3x size. It roamed nearly the full width of the map (25 to 27 tiles) and wrecked towers, then returned to normal.
- Every boss fight played to the end (sprite check every frame), boss summons, the 42-state interface walkthrough, the item-bar touch test, gameplay and the frame-time benchmark: all pass.

## What changed in v3.4

**New boss art.** Every boss now uses the illustrated portraits from the owner's boss sheet: 19 bosses in total (18 from `source/premium/bosses/source-sheet-transparent.png`, plus the Lich King from the first sheet). They are stored as WebP files in `source/premium/bosses/` and embedded in the game (about 0.7 MB).

| Level | Boss | Portrait |
| --- | --- | --- |
| 8 | Skeleton King | Skeleton King |
| 16 | Demon Lord | Demon Lord |
| 24 | Ice Dragon | Ice Dragon (now with a full body) |
| 32 | Fire Giant | Fire Giant |
| 40 | Dragon | Dragon King |
| 48 | Necromancer | Necromancer |
| 56 | Astral Sovereign | Lich King |
| 64 | Abyssal Empress | Spider Queen |
| 72 | Storm Tyrant | Storm Titan |
| 80 | Ancient Treant | Forest Ent |
| 88 | Obsidian Colossus | Stone Golem |
| 96 | Crimson Behemoth | Demon Beast |
| 97 | Void Seraph | Void Lord |
| 98 | Eternal Wyrm | Giant Worm |
| 99 | Chaos Sovereign | Death Knight |
| 100 | Abyssal Titan | Sea Monster |

**Random second boss.** On every two-boss level (Level 40 and up), the second boss is a random portrait that differs from the first, so each attempt can bring a new pairing. The two armoured knights look alike, so they never appear together.

The new portraits are drawn about 2 tiles tall, a similar presence to the old boss sprites. Enrage, the summon shield, the hit flash and the weakness badge all work with them.

**Tested**
- Each of the 16 boss levels rendered with both of its bosses.
- Every boss fight played to the end with a sprite check on every frame: no missing sprites.
- 300 random draws on Level 56: the second boss never matches the first, and 18 different second bosses appeared.
- 400 draws on Level 99: the two knights never appear together.
- Boss summons, the 42-state interface walkthrough, the item-bar touch test, gameplay and the 40-tower benchmark all pass, with no slowdown.

## What changed in v3.3

**Fix: swiping the item bar used items by accident.** Items fired the moment a finger touched them, so swiping the bar to reach items further along used whatever item the swipe started on. Now an item is used only on a tap: the finger lifts on the same item, has moved less than 10 px, and the bar did not scroll. Swipes, drags and presses that slide off an item scroll the bar or do nothing. Tapping still works as before, including small finger jitter. Mouse clicks still work, and keyboard Enter on an item now works too (it did nothing before). Activation still uses pointer events rather than click events, so it keeps working on Android WebViews that sometimes drop clicks.

**Tested** on an emulated Pixel 7 touchscreen, in portrait and landscape, with all 17 item types in the bar. The tests used real browser touch input, so native scrolling ran exactly as on a phone, and the old v3.2 ran alongside for comparison.
- A tap uses the item.
- A swipe starting on an item scrolls the bar and uses nothing (v3.2 used the item).
- A short 25 px drag uses nothing (v3.2 used the item).
- A tap with 4 px of finger jitter still uses the item.
- A press that slides off vertically uses nothing (v3.2 used the item).
- After swiping, tapping a newly revealed item uses that item.
- Mouse click and keyboard Enter both work.

The 42-state interface walkthrough, the UI sweep and the gameplay tests all still pass.

## What changed in v3.2

**Fix: the Level 80 boss (Ancient Treant) was invisible.** Only its shadow and health bar were drawn. The original game file names a sprite for it, `e_treant`, that was never included, so there was no image to draw. The Ancient Treant now has its own art, built from the Stone Golem sprite and recoloured in moss and bark with a crown of branches and leaves, in the same style as the other monsters. As a safety net, any boss whose sprite is missing now falls back to an existing boss sprite, so a boss can no longer be invisible.

**Fix: corrupted pixels in two enemy sprites.** The Stone Golem and the Giant Spider each had a block of random-coloured pixels in the lower-right corner, which came from damaged image data in the original file. The Golem is repaired by mirroring its intact left side. On the Spider, only the corrupted pixels are removed.

**Known limitation.** The Ice Dragon's image is also damaged in the original file: only the head and neck survived. That boss (Levels 24, 56, 72 and 97) is fully visible, but appears as a head and neck.

**Tested**
- All 16 boss encounters (Levels 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 97, 98, 99, 100), played through to the end. Each was checked every frame for a drawable sprite, across spawn, the summon shield, enrage and growth, and with both bosses on levels 40 and up. There are no missing sprites now; on v3.1 the same test flags Level 80.
- A screenshot of every boss in its own level.
- Every interface (42 states), gameplay across levels 1–100, boss summons at 50% and 25%, the v3 mechanics test and the 40-tower benchmark: all unchanged.

## What changed in v3.1

**Fix: the next-wave preview and crown challenge panels showed through other screens.** The panels' show/hide logic only ran inside the game loop. The shop, the pause menu and every popup pause that loop, so the panels stayed on screen on top of them.

Visibility now has its own check, independent of the game loop. The panels are hidden whenever:
- the game is not in an active battle (title, world map, level select, Victory and Defeat), or
- the shop (Items and Treasures), the pause menu, a popup (tips, profile, base upgrades) or the tower panel covers their spot.

They reappear automatically when that screen closes. The map size is unchanged.

**Tested**
- A scripted walk through 42 interface states, in portrait at 360×740, 390×844, 412×860, 412×915 and 768×1024, and in landscape at 915×412:
  - title, profile, history, transfer, world map, throne, rank;
  - level start with its tips popup, building, the tower panel, the shop (both tabs);
  - pause menu, profile from the pause menu, the pause button, speed, a running wave, item aiming, the base panel, the Back key;
  - rotation, Chinese, a boss fight with summons;
  - Victory, Defeat, restart, quit to map, main menu.

  It checks that the panels are hidden whenever anything covers them and visible otherwise. All passed, with no errors.
- Gameplay regression across levels 1–100, boss summons at 50% and 25%, the v3 mechanics test and the 40-tower frame-time benchmark: all unchanged.

## What changed in v3.0 · Strategy Edition

v3.0 adds strategic depth without stat inflation. The original tower art, campaign, bosses, two-base levels, upgrades and saves are unchanged.

**Enemy roles and damage types.** Towers now deal one of three damage types:
- Physical: Archer, Cannon.
- Magic: Mage, Holy, Lightning.
- Elemental: Frost, Poison.

Monsters can carry a role, shown as a badge next to their health bar. Each role unlocks at a set level, and a short tip appears the first time you meet it.

| Role | From level | Effect | Counter |
| --- | --- | --- | --- |
| ⛨ Armoured | 4 | Physical damage halved | Magic towers, Arcane Break |
| ✦ Warded | 7 | Magic damage halved | Physical or elemental towers |
| ✚ Healer | 10 | Heals nearby monsters | Kill it first (Strong targeting, area damage) |
| ◈ Shield-bearer | 14 | A shield (45% of HP) soaks damage first | Cannons deal double damage to shields |
| ✷ Splitter | 18 | Splits into two fast runners on death | Area damage |
| ϟ Disruptor | 24 | Jams the nearest tower for 1.6 s every 7 s | Long-range towers |

Resistances never exceed 50%, so every tower still contributes.

**Designed waves.** Waves are fixed for each level, so replays are fair and can be planned. Each wave follows a pattern (mixed, swarm, armoured column or healer escort), and each realm favours one role. Wave sizes are unchanged. A chip above the build bar previews the next wave, with its size and role counts.

**Visible combos.**
- *Shatter*: Archer or Cannon hits on frozen monsters deal +40%.
- *Marked*: Holy hits mark a monster for 3 s, and every tower deals +20% to it.
- *Arcane Break*: Mage hits weaken armour, wards and shields for 3 s.

The original combos still apply: Cannon +30% vs slowed, Lightning +30% vs poisoned.

**Terrain.**
- From level 5, two golden shrines appear on each map. A tower built on a shrine gets +20% damage and +10% range.
- Portals now corrupt the area around them (dashed purple ring). Towers within it deal 15% less damage, so camping next to a portal is no longer the best plan.

**Bosses.**
- Every boss has a weakness: one damage type deals +30%, announced when the boss arrives and shown on its badge.
- From level 40, a boss adapts every 10 s, taking 35% less damage from whichever type hurt it most. Mixed defences pay off.

**Crowns.** Each level has one optional challenge, shown below the battlefield during battle (hidden on the map and menus) and announced at the start. The challenges are Flawless, Lean army, Self-reliant and Restriction (one tower type banned). Winning while it still holds earns a crown, plus a one-time gold reward, and the result appears on the Victory panel.

Tested with headless runs:
- Every new mechanic exercised in isolation.
- Full-level simulations at levels 1–100 (difficulty is comparable to v2.7.2 in the same simulation).
- Boss summons at 50% and 25% for every boss level.
- Two-base levels, the UI sweep in portrait and landscape, and English and Chinese text.
- A 40-tower frame-time benchmark (same as v2.7.2).

## What changed in v2.7.2

**Boss reinforcement summons fixed** (level 40 and up). Bosses often summoned late, only once, or not at all. There were several causes:
1. The 5-second warning countdown delayed the drop while the boss kept taking damage, so minions arrived at about 20% HP instead of 50%.
2. Killing the boss during a countdown cancelled the summon.
3. The second summon waited in a queue behind the first, so it almost never happened.
4. Every boss level from 40 has **two** bosses, but the triggers were shared per level, so only the first boss to reach a threshold summoned.
5. The second threshold was 20% instead of the intended 25%.

Now:
- **Each boss** summons at exactly **50%** and **25%** HP.
- The boss stops and channels the summon behind a golden shield during the 5-second countdown, and is immune to damage while it does.
- Its HP can't drop past a threshold until that summon has happened, so even a huge hit can't skip one.
- To keep the total close to the original design, each boss summons half of the original wave size, as two bosses share each level.
- The boss health bar marks 50% and 25%.

## What changed in v2.7.1

- **Top bar always fits the screen.** Longer level labels (for example "Lv 80 · Boss", 3-digit levels and Chinese text) and big coin totals used to push the speed, pause and rotate buttons off the right edge. Now:
  - The label reads "Lv 80 👑", with "Boss · realm name" on the second line.
  - The realm name truncates instead of pushing buttons.
  - Coin totals of 100,000 or more show as 992K or 1.2M.
  - If the bar would still overflow, it tightens its spacing automatically.

## What changed in v2.7

Design rule for this release: base health stays well below the threat of the level, so every leak still hurts. On Normal, level 96 starts with 57 health against monsters that could cost 814 if they all got through.

**Base health**
1. **Starting health scales:** 20 + 2 per realm (20 at level 1, up to 44 in the last realm). Difficulty adjusts it:

   | Difficulty | Novice | Easy | Normal | Hard | Chaos |
   |---|---|---|---|---|---|
   | Health | +25% | +10% | ×1 | −15% | −25% |

2. **Stars** use the share of starting health kept: 90% or more for 3 stars, 50% or more for 2. Losing a base therefore caps you at 2 stars.
3. **A boss leak** costs 38% of the base it reaches instead of a flat 10, so it can no longer wipe out a base on its own.
4. **Two-base maps** start with 136% of the single-base health, split between the bases. Three-base maps start with 150%.
5. **Base upgrades:** tap a base to buy them. They cost battle coins, the same coins you spend on towers.
   - *Fortify:* +20% max health, 2 levels.
   - *Repair:* heals 1 every 4 s (2.5 s at level 2), only while no monsters are on the field.
   - *Barrier:* blocks 1 or 2 non-boss leaks each wave.
6. **Perfect waves** heal each surviving base by 1, never above its maximum. This replaces the old +1 heart every 3 perfect waves.
7. **Commander ranks** 3, 5, 7 and 9 each give +1 starting health.
8. **Healing scales with the level:**
   - Healing Potion: +25% of starting health.
   - Bought heart: +5%.
   - Last Stand: +10%.
   - The overall cap is 150% of starting health (previously a flat 30).

**Two-base system**

| Levels | Bases | Count |
|---|---|---|
| Level 5 (the first, with a one-time explanation) | 2 | 1 |
| 3rd and 6th level of realms 2–6 | 2 | 10 |
| 3rd, 5th and 7th level of realms 7–12 | 2 | 18 |
| Realm 11 and 12 boss finales (levels 88 and 96) | 2 | 2 |
| Levels 98 and 100 (final realm) | 3 | 2 |

- That's 31 two-base and 2 three-base levels in total.
- Other boss levels stay single-base.
- Bases sit at opposite corners of the defence edge, at least 6 tiles apart, so the monster routes really split.
- Level select marks multi-base levels with 🏰2 or 🏰3.
- A one-time tip explains base upgrades the first time you reach level 3.

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
     SignApk <keystore.p12> <password> <alias> /tmp/unsigned.apk ../dist/ChaosKingdoms-v4.1.apk
```

`apkbuild.py` writes the binary `AndroidManifest.xml` and `resources.arsc` itself and stores the resource table 4-byte aligned, as Android 11+ requires. It does not need the Android SDK.

The release keystore is not stored in this repository. Android only installs an update over an existing install when both are signed with the same key, so keep the keystore somewhere safe.

Fonts: Cinzel, Nunito and Fredoka are under the SIL Open Font License (`tools/fonts/OFL-LICENSE.txt`).
