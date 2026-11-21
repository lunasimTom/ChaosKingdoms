# Chaos Kingdoms

Tower-defense game in a single self-contained HTML file, plus an Android build.

## Downloads

| File | What it is |
| --- | --- |
| `dist/ChaosKingdoms.html` | The game. Open it in any modern browser. Works offline because the fonts are embedded. |
| `dist/ChaosKingdoms-v6.3.apk` | Android app (package `com.chaoskingdoms.game`, version 6.3, Android 7.0 or newer). Signed with APK Signature Scheme v2, with the same key as earlier versions, so it installs as an update. |

## What changed in V6.3 (Android app build)

APK only; `dist/ChaosKingdoms.html` stays at V6.0. New code is in `source/premium/v63.js`.

**Multi-boss health bars.**
- **One row per boss:** every boss in the level gets its own bar, stacked under the top bar. The Main Boss (the level's named boss) is always on top with a longer bar. For levels 97–100 it's the named calamity boss: Void Seraph, Eternal Wyrm, Chaos Sovereign or Abyssal Titan.
- **Secondary bosses:** shorter bars below, in the order they appeared.
- **Row layout:** a 15×15 portrait with a gold frame for the Main Boss, silver for the others. Then the name, which hides automatically when there isn't room, and a slim bar (6 px for the Main Boss, 5 px for the others). No percentages. Rows are 3 px apart, and the name column has a fixed width so all bars start at the same point.
- **Colour:** follows health on every bar: dark blue → light blue → dark green → light green → yellow → red, blending smoothly.
- **Damage trail:** behind the fill, a pale trail holds for 0.45 s after a hit, then drains to catch up, so damage feels weighty.
- **Bar finish:** a dark track, glossy fill, soft glow, the Main Boss's reinforcement markers at 50% and 25%, a pulsing red glow while a boss rages and a gold shimmer while it channels reinforcements.
- **Defeated boss:** the bar drains to zero, the portrait turns black with a small ✕, and the name dims.
- **Mini-bosses:** the Level 4 mini-boss uses the same row instead of the small bar over its head. Its gold aura stays.
- **No overlaps:** while the bars are shown, the realm label is hidden, and toasts and achievement popups sit below the bars.

**Smaller art.** Images are now stored at about 2.5× their largest on-screen size, so the game's HTML shrinks from 9.87 MB to 8.49 MB with no visible loss:
- items and icons: 128 px
- shop item art: 120 px
- monsters: 144 px
- bosses: 240 px
- chests and crown: 160 px
- level badges: 96 px
- logo: 540 px
- Victory/Defeat banners: 480 px
- realm cards: 300 px (Throne 640 px)

**More diamonds after Level 60.**
- **Boss treasure:** each diamond piece has a 50% chance of +1, plus an extra 35–55% chance of a bonus 1–3 diamonds. Replays get less.
- **Boss chests:** they drop about 30% more often.
- **Chests you open:** once you've cleared a level beyond 60, they give extra diamonds. A Red Chest goes from about 3.75 to about 4.5 diamonds on average.
- **Measured** in boss treasure diamonds: Level 59 about 2.8, Level 66 about 4.6, Level 76 about 5.2.

**Testing.** The full regression suite passes in both orientations, along with the V6.1/V6.2 checks and save compatibility from v4.3. A new V6.3 test covers four bosses at Level 100, three at Level 64, the Level 4 mini-boss, the damage-trail timing, Chinese names in landscape, and the diamond rates.

## What changed in V6.2 (Android app build)

APK only; `dist/ChaosKingdoms.html` stays at V6.0. New code is in `source/premium/v62.js`.

**Effects move with the map.**
- **Same render pass:** item effects are drawn as part of the battlefield itself, so they share its shake, scale and rounded corners exactly. The separate effects layer, which shook out of sync and showed square corners, is gone. Effects still pause and hide while a menu is open.
- **No darkening:** Meteor no longer darkens the sky and Lightning no longer dims the screen. Impact glows are capped at about 2 tiles.
- **Boss alert:** the "boss incoming" alert no longer flashes the whole screen red. A soft red edge inside the board remains.
- **Event flashes:** clipped to the board's rounded shape and much lighter.
- **Smaller visuals:** Gold Bag shows fewer coins for a shorter time. Holy Tower sky pillars appear on a quarter of hits and are fainter. A frozen boss's ice stays tower-sized, so you no longer get a giant white burst on an enraged boss.

**Bosses can be frozen and never get stuck.** Before, a frozen boss skipped its phase checks, so constant auto-Freeze held it at a health floor (19% or 3%) forever. Its guards, rage trigger and 8-second rage timer now keep running while it's frozen. Test: a Level 64 boss kept permanently frozen under fire went through every phase (guards, both summons, rage) and died in about 36 s.

**Audio no longer freezes in busy boss fights.**
- **Voice limit:** at most 8 synthesized sounds at once; boss death, fanfare, rage and spawn always play.
- **Item sounds:** at most one per 0.4 s, and each is rebuilt with fewer parts.
- **Boss voices:** hurt sounds share one cooldown across all bosses (about 0.9 s, longer at 2×/3×), attack sounds 1.5 s; bone and fire textures are capped.
- **Combat sounds:** the original combat synth (hits, booms, reinforcements), which bypassed every limiter, now has a 6-voice budget with per-sound gaps that widen at 2×/3×. Beeps are rate-limited.
- **Reverb:** the shared reverb is 1.2 s instead of 2.8 s, so overload clears quickly.
- **Measured:** in a 3× boss fight with 11 items on auto, sound sources dropped from 100–236 per second (spiking) to a steady 60–90.

**Interface.**
- **Wave banner:** a soft blood-red band (deeper red for boss and final waves) that fades out at every edge.
- **Boss name:** the boss health bar replaces the realm label while it's shown, so the two names no longer overlap.
- **Inventory:** Use (gold), Auto (gold when on, dimmed when off) and **Sell (red, "Sell 🪙320")**, all 32 px tall in fixed columns, so every row lines up.

**Testing.** The full regression suite passes, along with save compatibility. New checks cover the frozen-boss kill, effects drawn in the map, the audio stress run, the red banner, the boss name and the inventory row layout.

## What changed in V6.1 (Android app build)

From this version on, only the Android app is built. `dist/ChaosKingdoms.html` stays at the last confirmed version (V6.0) until a version is approved for the web. The APK contains the V6.1 game.

New code is in `source/premium/v61.js`.

**No more screen tints.**
- **Flashes:** items no longer flash a colour over the whole screen.
- **Overlays:** no effect lays a veil or rim over the board. Freeze now shows frost patches under each frozen monster, ice crystals on it and a short cold burst. Ice Bomb is a gentle snowfall, and War Horn a single sound wave.
- **Long buffs:** Speed Boost, War Horn, Gold Bag and Summon Aid have no lasting on-map indicator.
- **Rings and halos:** the gold and cyan ellipses under every tower during War Horn and Speed Boost are gone, and so is the large shield halo over the bases. The smaller hex dome remains.

**Towers.**
- **Range:** tapping a built tower now shows its range as a soft filled circle with a gently pulsing edge, until the panel closes. Before, it was effectively invisible.
- **Panel buttons:** every button in the tower panel uses the classic gold style, and Sell is the game's red. The panel is a little more compact.
- **Closing:** the panel closes 35% sooner (0.98 s idle instead of 1.5 s).

**Audio.**
- **Pause:** the music drops to a whisper instead of continuing at a reduced level, and returns on resume. (Before, the first tap in the menu woke the audio back up.)
- **Stuttering:** the audio engine uses the "playback" latency setting for a steadier buffer. One copy of the same sound plays per 60 ms, at most 16 voices at once. At 2× and 3× speed, repeated hit and monster sounds are thinned out while item, boss and loot sounds are kept. A 3× stress test with seven auto items stayed at the 16-voice cap.

**Interface.**
- **Wave banner:** no gold lines; the dark band fades out softly on every side.
- **Item bar:** equal space above and below the buttons; the bottom edge is fully visible.
- **Fourfold Throne:** its realm panel drops the four-boss block, so it matches the other realms in size and layout.
- **Achievement popup:** during a battle it's smaller, sits below the HUD bar and closes after 4 s.
- **Crown challenges:** descriptions stay in sentence case ("Lose no lives").

**Testing.** The full regression suite passes (interface walk in both orientations, inventory touch, auto-use, bosses and loot, monster AI, mini-bosses, hoards, item effects, home grids, home fit), along with save compatibility from v4.3. A new V6.1 test covers the tower panel and range circle, Pause audio, item-bar spacing, the wave banner, the 3× stress run and the Throne panel.

## What changed in V6.0

New code is in `source/premium/v60.js`. The web HTML is 9.86 MB.

**Item effects never cover the interface.**
- **Layer order:** the effect layer now sits directly above the battlefield and below every HUD element, the build bar, the item bar, toasts, banners and menus. Buttons always stay on top and stay tappable. (In 5.9 it was above everything, including Pause and Settings.)
- **Menus:** effects are hidden, with their timers paused, whenever a menu, the shop, Pause, Settings or any popup is open. They resume when it closes.
- **Board only:** every effect is clipped to the board. Glows and electric tendrils follow the board's border instead of the screen corners.
- **Freeze, redesigned:** a frosted glaze with a crystal texture over the board, ice crystals growing on every frozen monster and drifting ice glints, opened by a cold flash with spinning shards. The ice branches that grew over the corner buttons are gone.
- **Item bar:** it has room above its buttons, so badges and edges are no longer clipped. Landscape uses a smaller margin so the buttons still fit on screen.

**Home screen.**
- **Order:** Records, Battle History, Progress Transfer / Screen, Redeem Code, Music / Language, Settings, Help. In the browser, Install takes the place of Records.
- **Slider flicker:** dragging the difficulty slider no longer flickers the bottom buttons. The fit-to-screen code no longer resets the zoom to measure, and the old Install code no longer fights the grid. Testing shows 0 changes to the buttons while dragging, down from 102.

**Shop and inventory.**
- **Auto button:** a small classic gold-bevel button reading "AUTO" (自动 in Chinese): dimmed when off, bright gold with a soft glow when on. Locked items no longer show it.
- **Inventory:** rows use fixed slots (Use | Auto | Sell), so every Use button lines up whether or not the item has Auto.

**Banners and map.**
- **Wave banners:** they last about 1.25 s (boss and final waves 1.7 s), down from 2.1 s. Mini-boss and other special banners wait for a wave banner to finish instead of overlapping it.
- **Realm panel:** the blue veil is much lighter, so the realm's own art colours show. It darkens only behind the text.
- **Fourfold Throne card:** a 68 px crown on the left, with the title and subtitle centred in the remaining space.

**Text.**
- **Title Case:** applied to every English title, button, tab and label (249 replacements). Examples: Battle History, Progress Transfer, Commander Record, Restart Level, Select Level, Quit to Map, Main Menu, World Atlas, Unlock Map, Retry Level, Next Level, Copy Code, Auto Next Wave, Show Damage, Music: On/Off. Sentences such as hints and toasts keep normal sentence case. The Chinese translations follow automatically.
- **Chinese leaks:** the 32 newer achievements now have Chinese names everywhere, so the Victory screen no longer mixes in English names such as "Against the Clock".

**Ambient sound.**
- **No harsh tones:** the old wind, rain and drone recordings (with their hiss and high frequencies) are replaced by softly generated beds: deep wind, muffled rain and a low pad. Nothing sits above roughly 300 Hz, and the loops cross-fade seamlessly.
- **Volume:** even with the Ambient slider at maximum, ambience plays at 0.045 against the music's 0.85, about 19 times quieter.

**Testing.**
- **Every screen:** English and Chinese at 412×839, 360×640 and 915×412 landscape.
- **Effects:** every item effect with Pause and the shop opened on top. The effects hide and come back.
- **Grids:** browser and Android grids, the slider (no changes to the buttons), wave banner timing and ambient gain.
- **Regressions:** the full suite (interface walk in both orientations, inventory touch, auto-use, bosses and loot, monster AI, mini-bosses, hoards), save compatibility from v4.3, and the 10 MB size check.

## What changed in v5.9

New code is in `source/premium/v59.js`. The web HTML is 9.84 MB, and the build now refuses to write it at 10 MB or more.

**Auto-use, as intended.**
- **Different items overlap freely.** Freeze, Speed Boost and War Horn can all run at once.
- **The same item waits.** It is never used again until its previous effect has completely ended. The durations are Freeze 10 s, Ice Bomb 6 s, Speed Boost 20 s, Gold Bag 30 s, War Horn 15 s, Shield 15 s, Summon Aid 6 s, Allied Legion 16 s, Attack Helicopter 14 s, and about 2 s for the instant items.
- **Tested** with the No Item Cooldowns treasure on: Freeze fired at 0, 10, 20, 31 and 41 s, Speed Boost at 0, 20 and 40 s, and War Horn at 0, 15 and 30 s.

**Shop.**
- **One Buy button** per item, with a ×1 / ×10 switch beside it. The button shows the price for the chosen quantity, for example "Buy ×10 · 4,500".
- **Correct ×10 price for the Healing Potion:** its price rises 100 per purchase up to 700, and the ×10 total follows that. 5.8 had this wrong.
- **AUTO** is a round button: dark when off, glowing gold with a spinning ring when on.
- **Layout:** the switch, AUTO and the owned count share one line, and Buy runs full width below, so no labels are clipped. The inventory uses the same round AUTO button.

**New artwork.**
- **Items:** your 12 higher-resolution item icons replace the old ones (Fire Bomb, Ice Bomb, Lightning Scroll, Healing Potion, War Horn, Gold Bag, Trap, Summon Aid, Shield, Speed Boost, Meteor, Freeze). They're swapped into the existing image slots, so the file doesn't grow.
- **Backpack:** the new backpack image replaces the 🎒 emoji in the inventory title.
- **Difficulty icons:** the sprout (Novice Trial), shield (Easy), crossed swords (Normal), flame (Hard) and skull (Chaos Inferno) replace the emoji in the difficulty panel.

**Item effects.**
- **No icon pop-up:** the icon and name that flashed in the middle of the battlefield are gone. The rings and pillars the original game drew around every tower are removed too.
- **A new effects layer** draws over the battlefield. Long effects stay at the screen edges so the fight stays visible:
  - **Freeze:** ice crystals grow in from the corners and edges with a frosted rim and glints for the full 10 s, then melt.
  - **Ice Bomb:** cold fog rolls across the field with snowfall.
  - **Meteor:** the sky darkens; meteors with long burning tails strike every enemy with impact flashes, debris and embers.
  - **Fire Bomb:** a flame blossom with licking fire, smoke and embers.
  - **Lightning Scroll:** the screen dims and forked bolts lash the six toughest enemies three times, with sparks.
  - **Speed Boost:** a light-speed streak, then electric tendrils crackle along the screen edges for 20 s, with sparks rising from towers.
  - **Gold Bag:** golden god-rays and a shower of spinning, bouncing coins, then faint glitter at the edges.
  - **War Horn:** a sound wave rolls up the screen, then embers rise and the rim pulses like a war drum.
  - **Trap:** steel spikes burst from the ground under the lead enemies, with dust and sparks.
  - **Summon Aid:** heavenly beams descend one by one and feathers drift down.
  - **Shield:** a shimmering hexagonal dome over every base, which shatters when it ends.
  - **Healing Potion:** life motes and leaves spiral up around the bases.
  - **Rare treasures:** Time Crystal winds a ghostly clock backwards; Dragonfire Scroll sweeps a wall of flame across the field; Royal Protection raises a golden dome; Master Forging throws sparks from every tower; Midas Mark sweeps a golden sheen; Ancient Horn combines the horn with crackling red energy.

**World map.**
- **Locked realms:** a small "Unlock map" button now sits at the top right of the panel, so a locked realm's panel is the same height as an unlocked one and never runs off screen.
- **Spacing:** the rows of realm cards are closer together.

**Consistency pass.**
- **Commander Record:** the item links after "Unlocks:" in Next Level use the standard small gold button.
- **Switches:** every checkbox (Settings and Battle history) is now the game's gold on/off switch.
- **Inventory:** tabs no longer show empty "0" badges.

**Testing.** The 42-step interface walk passes in portrait and landscape, along with inventory touch, the auto-use and item-bar flow, boss and loot flows, monster AI, mini-bosses, treasure hoards, the home screen fit, the v5.8 feature checks and save compatibility from v4.3. New checks cover auto-use timing, the shop quantity switch and potion pricing, every item effect, the locked-realm panel height, and the Commander Record buttons.

## What changed in v5.8

New code is in `source/premium/v58.js`. The web HTML is 9.6 MB (the limit is 10 MB).

**World map.**
- **Painted cards:** the realm picker uses the 13 painted realm cards: twelve realms in three columns and a full-width card for the Fourfold Throne. Each card shows its numeral, name and progress inside the gold frame. Locked realms are greyed out, and the selected realm glows.
- **Matching:** I Forest, II Desert (bone dragon), III Ice, IV Lava, V Sky (airships), VI Underground (cyan caverns), VII Celestial Rift (orrery), VIII Abyssal Crown (ocean shell), IX Stormfront (storm arch), X Emerald Wilds (green portal), XI Obsidian Depths (red moon), XII Crimson Caldera (burning gate). The 5.6 recolours are gone.
- **Battle colours:** each realm's ground hue, saturation and lightness now match its card. For example, Underground is teal, Abyssal Crown is ocean blue, Obsidian is dark crimson, Crimson Caldera is orange and the Throne is violet. No realm is darker than 28% lightness.
- **Level badge:** tapping the level badge at the top left of a battle asks to confirm leaving, then opens the world map on the current realm with the current level marked "HERE".

**Items.**
- **Activation effects:** every item and rare treasure (23 in all) has its own synthesized sound: bubbling and choir for the Healing Potion, a crystal crack for Freeze, an incoming roar and impacts for Meteor, a coin cascade for the Gold Bag, a brass call and drums for the War Horn, rotor chop for the Attack Helicopter, and so on. The old shared "upgrade" blip is gone.
- **Visuals:** each activation shows the item's icon and name with light rays over a dark halo, a themed screen-edge effect (frost, fire, gold, storm, holy light, shield, water, war), and a matching battlefield effect: falling meteors, bolts between towers, coin rain, light pillars, shield domes.
- **Buy ×10:** every unlimited item in the shop has a ×10 button. The Healing Potion's price rises after each purchase, so its ×10 total includes those increases. Large totals are shortened, for example 10.8K.
- **Auto-use fix:** auto-use now fires one item at a time and never uses the next item until the active item's effect has completely run out. The durations are Freeze 4 s, Speed Boost 20 s, Gold Bag 30 s, War Horn 15 s, Shield 15 s, Allied Legion 16 s, Attack Helicopter 14 s, and so on. Before, the "No Item Cooldowns" treasure let auto-use re-fire every 0.25 s, cutting effects short. When several items are on AUTO, the one that has waited longest goes first. The trade-off: auto Healing Potion also waits for an active effect to end.

**Mini-boss treasure.** Defeating a Level 4 mini-boss now gives the same 8-second collection window as a major boss, with the countdown ring. It drops 14–26 pieces, and the level's victory waits until the window ends.

**Diamond forge.** The forge plays the painted 16-frame sequence of shards gathering into a diamond, inside a spinning golden rune ring with light rays, a flash and a rising chime. A failed forge cracks the half-formed gem into tumbling shards, with a red flash, a shake and a breaking sound.

**Main menu music.** The menu track is pre-rendered with the game's own composer (`tools/make_menu_music.sh`) and embedded as a 32 kbps MP3. It decodes in about 0.1–0.2 s and plays on the first tap. Before, it was composed on the phone each time, which could take close to a minute.

**Home screen.**
- **Medal hint:** a line above the three medal slots ("Tap to choose the medals shown on your card") opens a new medal picker, where you choose up to 3 unlocked medals and see their order.
- **Help:** a new Help button holds all the gameplay guidance in eight tabs: Basics, Towers, Synergy, Enemies (roles, mini-bosses, bosses, the Throne), Items (including auto-use and ×10), Progress, Strategy (nine practical tips) and About. About shows the version (V5.8 · build 54). The tower synergy guide has moved here from Commander Record.
- **Buttons:** the secondary buttons are one 3×3 grid of equal tiles: Battle history, Progress transfer, Redeem Code / Help, Settings, Music / Screen, Language, Install. In the Android app, where Install doesn't apply, Records takes its place. The tiles are a little shorter.
- **No scrolling:** the whole home screen scales to fit on any phone, portrait or landscape. Tested at 412×839, 360×640 and 915×412.
- **Watermark:** the old "Strategy Edition" watermark is gone; the version is shown in Help.

**Size.** The original build carried an unused 1.06 MB tower sprite sheet, which is now dropped. The splash art and item artwork were recompressed slightly to make room for the realm cards, the forge sequence and the menu music.

**Testing.** All earlier suites pass: the 42-step interface walk in portrait and landscape, inventory touch, item auto-use, boss and loot flows, monster AI, mini-bosses, treasure hoards, the world map, and save compatibility from v4.3 (including export codes). A new v5.8 suite checks every item's activation, Buy ×10, auto-use timing, the level badge, the mini-boss window, the forge, the Help tabs, the medal picker, music decode time and the home screen fit in both languages.

## What changed in v5.6

New code is in `source/premium/v56.js`.

**Mini-bosses on Level 4.** Level 4 of every realm (I–XII) now ends with a mini-boss. Level 8 keeps its major boss, and the Fourfold Throne is unchanged.

| Realm | Mini-boss | Signature move |
| --- | --- | --- |
| I Forest Kingdom | Ogre Warchief | Regrowth: heals quickly after 3 s without being hit |
| II Desert Wasteland | Sand Vampire Lord | Sand dash: a burst of speed every 8 s |
| III Ice Realm | Frost Troll Jarl | Frost aura: freezes nearby towers for 1 s every 4 s |
| IV Lava Fortress | Ember Demon | Split: becomes two brutes when defeated |
| V Sky Castle | Storm Golem | Storm shield: a damage-absorbing shield every 10 s |
| VI Underground Dungeon | Death Knight Captain | Dark mending: heals the monsters around it |
| VII Celestial Rift | Astral Golem | Frost aura (stronger) |
| VIII Abyssal Crown | Abyss Countess | Storm shield (stronger) |
| IX Stormfront Expanse | Iron Death Knight | Sand dash (stronger) |
| X Emerald Wilds | Moss Troll | Regrowth (stronger) |
| XI Obsidian Depths | Obsidian Golem | Dark mending (stronger) |
| XII Crimson Caldera | Crimson Demon | Split (stronger) |

- **Strength:** 3.2 times an ordinary brute of that wave. On Level 4 that is about 40% of the realm's boss; in late realms it keeps up with the tougher monsters. It is 1.5 times monster size, wears the elite crown and a gold aura, and shows its name and health bar.
- **Rules:** it arrives at the end of the final wave (the number of waves is unchanged), costs 5 lives if it reaches a base, calls 3 guards at half health, and has no rage mode. On levels with several bases there is still only one.
- **Rewards:** crowned-elite gold, plus a short treasure burst around where it fell (about 3.5 s to grab it), with a small chance of a diamond. Replays drop less.
- **Where you see it:** the realm panel reads "Mini-boss: … · Boss: …", the Level 4 button carries a ⚔ crest with a gold ring, a "MINI-BOSS" banner announces it, and the 💡 tips explain its move. Statistics gain a "Mini-bosses defeated" line. Mini-bosses do not count toward the boss achievements.
- **Balance check:** an auto-play bot still wins Levels 4 and 12 every time, losing no extra lives. Level 20 went from 4 wins in 4 to 3 in 4.

**Treasure hoards on the Fourfold Throne (levels 97–100).**
- **Size:** the final bosses drop 260, 300, 340 and 400 pieces (scaled by difficulty; replays 45%) instead of about 60.
- **Layout:** the pieces land in 6–14 heaps up to nine layers deep, plus a carpet over the whole map.
- **Can't be cleared:** a tap on a heap takes only its top three pieces, so most of the hoard is still there when the 8 seconds run out. A "LEGENDARY HOARD" banner opens it.
- **Speed:** treasure glows are pre-rendered once, and the lower layers skip their glow, so a 400-piece hoard draws about as fast as an ordinary boss treasure.

**Realm pictures.**
- **Fix:** Celestial Rift, Abyssal Crown, Stormfront Expanse, Emerald Wilds, Obsidian Depths, Crimson Caldera and the Fourfold Throne no longer repeat the first six pictures.
- **How:** each one is mirrored or re-framed from its base picture and colour-graded with the realm's own sky colours, plus a touch of its weather (stars, embers, rain, spores, sparks). The grade is made once in the game, so the file size doesn't grow. All 13 world atlas cards and the realm panel now differ.

## What changed in v5.5.3

**Install Game button (browser version).**
- **Language:** the button now switches between 安装到桌面 and "Install Game" as soon as you change the language. Before, it was drawn once at start-up and stayed Chinese.
- **The guide fits where you are:**

| Where the game is open | What the button does |
| --- | --- |
| A website, in Chrome or Edge (Android or desktop) | Opens the browser's own install dialog. If the browser isn't ready to offer it yet, it shows the menu steps instead. |
| iPhone, Safari | Numbered steps with the Share and "Add to Home Screen" icons drawn in: Share (inside the ⋯ menu on iOS 26), Add to Home Screen, keep "Open as Web App" on, Add. |
| iPhone, Chrome | Share in the address bar, Add to Home Screen, Add. |
| iPhone, other browsers | Open the page in Safari first. |
| WeChat and other in-app browsers | Open in Safari (iPhone) or in the browser (Android) first. |
| A downloaded HTML file, or inside a preview frame (such as the Claude page) | Explains that browsers can't install a local file or a framed page. Points Android players to the APK, and everyone to the web version. |

- **Your web address:** set `CK_WEB_URL` at the top of the install code in `source/premium/v5.js` to the `https://` address where you host the web folder. The guide then shows "Open the web version" and "Download the Android app (APK)" buttons. While it is empty, those buttons are hidden.

**Hosting the web version.**
- **Build the folder:** `python3 tools/make_web.py <folder>` collects everything needed: the game, `index.html` (opens the game), `manifest.webmanifest`, `sw.js` (offline cache), the icons and the APK. The download zip already contains this folder as `web/`.
- **Upload:** drag the `web` folder onto a free static host such as Netlify Drop (app.netlify.com/drop) or Cloudflare Pages (Direct Upload). The game is then installable from Chrome and can be added to the iPhone Home Screen.
- **Updating:** after a new release, upload the new `web` folder again. The offline cache is versioned, so installed copies pick up the update on their next start.

## What changed in v5.5.2

**Home screen.**
- **Same size everywhere:** Shop and Inventory now use the same text size (14 px) and icon size as the six buttons below them, in Chinese and English. An older rule had been forcing them smaller.
- **Level icons:** the six buttons below put their icon at a fixed height, so every icon in a row sits on the same line however long the label is. Labels stay on one line; a long English label such as "Progress transfer" shrinks slightly instead of wrapping.

**App icon.**
- **Full artwork:** the yellow frame is gone and the artwork now fills the whole icon to the edges, under circle, rounded-square and squircle masks.
- **Glossy finish:** a soft top highlight, a diagonal sheen, a light rim and a gentle edge shadow give it depth.
- **Everywhere:** the Android adaptive and older-style icons, the browser icon and the home-screen (install) icons all use the new artwork. `tools/make_icon.py` regenerates them.

**Monsters.** The one-time tip about smarter monsters has been removed; their behaviour is unchanged.

## What changed in v5.5.1

New code is in `source/premium/v551.js`.

**Smarter monsters (all types).**
- **Danger:** each tower now adds danger to the tiles it covers in proportion to its damage per second, up to 4.5 per tile. Monsters route around strong firepower when a reasonable detour exists. In a test on level 41, monsters were covered by about half as many towers (2.3 → 1.2) and spent 3% of their time attacking towers instead of 15%.
- **Several bases:** each base's starting cost reflects how well it's defended, so monsters head for the weaker base. One extra tower near a base was enough to send them to the other one.
- **Breaching:** when the route ahead is heavily covered, monsters attack the weakest tower covering their path to open a gap. Brutes do this soonest, grunts later, and runners only when the way is truly blocked by fire.
- **Each type keeps its character:** brutes break towers, runners raid the base, and flyers and bosses behave as before.

**Feel.**
- **Pickup sound:** a warmer, rounder chime of about 0.8 s (a soft bell with octave and fifth, a light shimmer and no hard click). Rarer items add a sweeter final note.
- **Button vibration:** every button gives a 10 ms tick, with its own "Button vibration" switch next to the volume sliders. The difficulty slider gives a firmer detent and a soft chime at each step.
- **Achievement banner:** it stays 6 seconds, and tapping it opens that medal.
- **Pause menu:** "Resume" is now "Continue Game" (继续游戏).

**Achievements.**
- **Recovery:** the check for achievements a save already qualifies for now repeats whenever no popup is open, so medals can no longer stay locked behind the startup notices.
- **Original 8:** they now get the same tier bonus as the new ones (+1 diamond for each Silver one), paid once and recorded in the save so it is never paid twice.

**Medal card.** "Save medal card" first shows a preview, then saves it the best way the device allows:
- **Android app:** straight to the gallery (Pictures › Chaos Kingdoms) on Android 10 and newer. The app gained a small `saveImage` bridge for this.
- **Phone browser:** the share sheet, where you can choose "Save Image".
- **Desktop browser:** a normal download.
- **Preview frames:** where downloads are blocked, a note tells you to press and hold (or right-click) the image.

Every path ends with a clear success or failure message.

**Visuals.**
- **Popups:** every popup has a stronger background blur, with the home screen's rising fireflies drifting behind the card.
- **Progress bars:** one refined design everywhere: a recessed track, a glossy gold fill with a highlight, depth and a slow light sweep. The Commander Record ring has a groove and a glow.
- **Typography:** a scan of every screen in both languages turned the remaining explanatory text regular weight (Tower Synergy, rune and exchange notes, shop subtitles, tips, rank notes, rewards, the next-medal line). Only titles, headings, labels and numbers stay bold.
- **Pause menu rank title:** it uses the game font in both languages.
- **Level box:** it is exactly the height of the Settings button.
- **Tower range:** no circle while placing a tower. Tapping a built tower shows a soft, semi-transparent ring with blurred edges.
- **Map selection:** the realm panel uses its own blurred map art. The "Unlocks all 8 levels" note is gone once the map is unlocked. The level buttons are glossy gems: green when cleared, glowing gold for the next level, red-edged for the boss.
- **Home commander card:** the whole card opens Commander Record. Three large medals sit in a symmetric row (empty slots show +), with an achievements progress bar and your title.
- **Difficulty selector:** a richer card coloured by the chosen difficulty, a glowing track and handle, and a small pulse at each step.

**Saves.** Every new field is optional: button vibration, original-8 bonus paid, AI tip shown. Saves and progress codes from v4.3 onwards load as before.

## What changed in v5.5 · Medals

New code is in `source/premium/a55.js` (achievements, daily reward, statistics).

**40 achievements with medal artwork.** All 40 medals come from the provided sheet.
- **Kept as they were:** the 8 original achievements keep their ids, names, rank requirements and gold: First Victory, Monster Slayer, Perfect Defender, Boss Hunter, Veteran Commander, Nightmare Conqueror, Master Builder and Master Engineer. Saves recognise them exactly as before.
- **Added:** 32 new achievements, themed to the art. Examples: Treasure Seeker (chest), Gem Collector (diamonds), Cartographer (map), Arcane Scholar (wizard hat, Commander Lv.10), Phoenix Rising (win with 5 lives or fewer), Pack Hunter (wolf, 10,000 kills), Master Archer (bow, 100 Archer Towers), Lord of the Throne (throne), Against the Clock (hourglass, a win in under 4 minutes), Keymaster (key, 50 levels cleared), Sky Voyager (ship, the Sky Castle boss) and Chaos Conqueror (Commander Lv.50).
- **Rewards:**

  | Tier | Reward | Points |
  | --- | --- | --- |
  | Bronze | 1,000 gold | 10 |
  | Silver | 3,000 gold + 1 diamond | 25 |
  | Gold | 8,000 gold + 5 diamonds | 50 |

  Lord of the Throne also gives a Gold Chest, and Chaos Conqueror a Purple Chest.
- **Old saves:** anything a save already qualifies for unlocks, with its rewards, on the first load. One banner sums them up.

**Medal grid.** Commander Record shows the medals in a 4-column grid.
- **Locked and unlocked:** locked medals are grey with a progress bar; unlocked medals are full colour with a glow.
- **New and pinned:** a red dot marks new medals, and a ★ marks pinned ones.
- **Details:** tapping a medal shows its tier, points, requirement, progress and reward. From there you can pin it to your showcase or save a medal card image.

**Points and titles.** Achievement points unlock a title shown on the home commander card: Squire (50), Knight (150), Champion (300), Warlord (500), Dragonbane (750) and Chaos Breaker (1,000). Up to 3 pinned medals are shown next to it.

**Unlock banner.** A gold banner slides in with the medal, its name and reward, plus a chime and vibration. Gold-tier medals get the full fanfare and a stronger vibration. The Commander Record button shows a red dot until you've seen new medals.

**Next medal.** The Victory screen shows your closest medal, for example "Next medal: Wyrm Slayer · 3 to go".

**Daily reward.** A 7-day cycle: 2,000 gold, 10 stars, 3 shards, 5,000 gold, 1 diamond, 20 stars, then a Green Chest on day 7. Missing a day doesn't reset the cycle.

**Statistics.** A tab in Commander Record shows play time, wins and losses, enemies, bosses, towers built, your favourite tower, levels cleared, stars, chests, diamonds, items used and achievements.

**New icon.**
- **Android 8 and newer:** the app uses an adaptive icon built from the provided artwork. A sharp foreground sits on an extended, blurred background, so it fills circles, squircles and rounded squares, and the logo stays inside the safe area.
- **Android 7:** the plain icon is used.
- **Browser:** the same artwork is used as the browser tab icon and the iPhone home-screen icon.

**Install Game.** The browser version's home screen has an **Install Game** button. It doesn't appear in the Android app or in an installed copy.
- **Where the browser offers it** (Chrome or Edge on a hosted copy), it opens the install prompt.
- **Otherwise** it shows step-by-step instructions for desktop, Android and iPhone.
- **Hosting:** `dist/` now includes `manifest.webmanifest`, `sw.js` and the icons. Host the folder (for example on GitHub Pages) and the game becomes installable and works offline.

**Fixes.**
- **Boss levels:** the level box no longer repeats the crown; the map name keeps it.
- **Inventory:** the panel has one fixed height, whatever the tab.
- **Tapping a tile:** only that tile lifts. The tile above no longer moves.
- **Level switching:** the warning pulses with a red-gold glow, and "This cannot be undone" is gone in both languages.
- **Notifications:** they now appear below the map name.
- **Tower range:** while placing a tower, the range circle of the selected type is shown on the tile under your finger.

**Smaller file.** 11.0 MB → 9.9 MB:
- The loading art is embedded once instead of twice.
- Large PNG artwork is converted to WebP at the same quality, except the original monster sprites, whose PNG format decides which art version is shown.
- The home logo is a smaller image.

## What changed in v5.1 · Polish

**Home screen.**
- Your Chaos Kingdoms logo sits at the top, floating gently with a soft golden glow.
- Below it come Play, the commander card, difficulty, a Shop | Inventory row, and a 3 × 2 grid of icon tiles: Battle history, Progress transfer, Redeem Code, Music, Screen and Language.
- Landscape uses two columns: the logo and Play on the left, everything else on the right.
- It fits without clipping on screens down to 360 × 640, in English and Chinese.

**Button colours.** Every action button (Settings, Inventory, the shop's Close, popups) now uses the bright highlighted gold. Only unselected tabs are dimmed, exactly like the shop tabs. Tabs no longer move up and down when tapped or selected.

**Battle HUD.**
- The tips 💡 is a plain bulb with no circle around it, and it hides whenever the shop or a popup is open.
- "Inventory" (and 背包) fits its button in portrait and landscape.
- The top-left badge reads "Lv 86" on one line, with "Lv" and the number the same size and smaller than before. On boss levels a small crown sits inside the badge.
- The map name sits clearly under the gold divider, and hides while the shop is open.

**Victory and Defeat.** The result window is wider, with a smaller banner. Loot collected and the rank card sit side by side, and the buttons share one row, so the window is far shorter.

**Typography.** Descriptive text is now regular weight: item and chest explanations, notes, hints and the upgrade descriptions. Titles, buttons, labels and numbers stay bold. The embedded font gains its regular weight for this, both languages, and the game file grows by 0.3 MB.

**Music.**
- The music button shows "Music: on" from the first moment, and music starts with your first tap.
- Tracks are now composed ahead of time and kept: the menu track while the game loads, and the next level's track while you're on the map or the result screen.
- Turning music on now plays within about 30 ms instead of about 2.7 s.
- Starting a level no longer goes silent: the current music keeps playing until the level's track takes over.

**Fixes.** The "Commander levels now go to 50" notice can never show twice. It's now also recorded under its own browser storage key.

## What changed in V5

New code is in `source/premium/v5.js`. The font is rebuilt with `tools/make_font.py`.

**One font for English and Chinese.** Every piece of text, including the battlefield numbers drawn on the canvas, now uses Noto Sans SC (SIL OFL), embedded as `CKSans`.
- It replaces Cinzel, Nunito and Fredoka.
- To keep the file small, it includes only the 1,300 characters the game uses, in three weights (medium, bold, black). That's 685 KB of font data, and it works offline.

**New artwork.**
- The loading screen uses the new key art. In portrait it fills the screen. In landscape the full art is shown centred over a blurred copy of itself, so the logo is never cropped.
- Victory and Defeat use the new framed banners, which pop in.
- The home screen no longer shows the logo picture.

**Home screen.**
- A new 🛒 Shop (Chests first, then Treasures) replaces the separate chest entry.
- Shop and Inventory sit side by side, and "Enter Redeem Code" is now "Redeem Code".
- The new buttons now switch language correctly at startup.

**Commander Record.** Tapping Coins, Diamonds or Stars opens the Treasure page.

**Unified Button Style.** The gold Close button is now the standard for the Inventory tabs, Use, Sell, the forge and the home-shop tabs. The selected tab shows as pressed in.

**Battle HUD.**
- **Level badge:** the top-left corner shows a compact level badge with just the number. On boss levels it turns gold-red with a small crown, which stays inside its box.
- **Map name:** the level and map name ("👑 BOSS · Lv 8 · Forest Kingdom") moves into the free strip under the gold divider.
- **Countdown:** in Chinese it now fits in full.
- **Pause button:** it is the same size as the speed button.
- **Bottom panel:** it reads Build | Shop | Inventory. The 💡 tips button floats in the free corner below the map.
- **Item bar:** it shows only the items, without the "ITEMS" label.
- **In-battle shop tabs:** Items | Chests | Treasures.

**Settings screen.**
- The gear button opens Settings: volume sliders, music, auto next wave, damage numbers, a new haptics on/off switch, screen orientation, language and the version number.
- The Pause button opens the pause menu, which now holds only actions: Resume, Settings, Inventory, Restart, Select level, Save, Redeem Code, Quit and Main menu.
- The space bar still toggles pause directly.

**Monster AI.** Monsters now decide what to attack every 0.4 s:
- **Near the base:** in the last 25% of their route, or within 3 tiles of the base, they commit to the base.
- **Elsewhere:** they attack the most threatening tower they can see. That is the tower shooting them, strong towers, towers whose range covers them, damaged towers, and barricades in the way; closer counts more.
- **By type:**
  - Grunts notice towers up to 2.5 tiles away.
  - Brutes are tower-breakers and notice towers up to 3.5 tiles away.
  - Runners raid the base and only fight what blocks them.
  - Flyers and bosses keep their own behaviour.
- **Awareness:** it starts at 85% on level 1 and reaches 100% by level 20.
- **Leash:** a chase ends if it drags on past 6 s or the monster loses sight of the tower.
- **Balance:** unchanged, as agreed, so the game is harder. In a test with towers placed 2 tiles from the route, 8 of 12 monsters attacked them on level 3 (4 in v4.4). Runners never did.

**No more hopping.** Monsters used to snap to each tile centre and stop, which looked like a small hop. They now flow from tile to tile at a steady speed: 0 near-stops per run, against 7-16 before.

**Tile pop.** Tapping a tile lifts it slightly (+6%, a few pixels up, with a shadow and a soft gold rim). It then springs back with a small overshoot over about 0.36 s. A tower standing on the tile lifts with it.

**Visual pass.**
- **Shared look:** one gold/navy palette, a framed popup style with an inner glow and a gold ornament under titles, and the same frame on every panel.
- **Motion:** popups open with a soft scale-up over a blurred backdrop, screens fade in, and every button has the same press animation.
- **Icons:** gold line icons replace the emoji on menu buttons, drawn as vector graphics in one consistent style.
- **Top bar:** a frosted-glass top bar with pill-shaped stat groups.
- **Toasts:** framed gold banners with a star mark.
- **Damage numbers:** they pop in, with strong or gold hits larger and glowing.
- **Checks:** every screen was reviewed in English and Chinese, portrait and landscape.

**Saves.** Saves from v4.4 and earlier, and their transfer codes, load unchanged. The haptics setting is saved as a new optional field.

## What changed in v4.4 · Commander 50

New code is in `source/premium/v44.js` (levels, inventory, forge, saves) and `source/premium/cu44.js` (attribute upgrades).

**Commander levels 1-50.** Levels 1-10 keep exactly the same XP thresholds. Levels 11-50 need gradually more XP each: 900 XP for 10→11, rising to 5,000 for 49→50.

| Level | Total XP |
| --- | --- |
| 11 | 4,900 |
| 20 | 17,750 |
| 30 | 42,000 |
| 40 | 76,750 |
| 50 | 122,000 |

- **Ranks:** 40 new bilingual rank titles, in themed groups of five: Dragon Knight, Storm Warden, Celestial Paladin, Abyss Warlord, Phoenix Marshal, Titan Overlord, Eternal Archon and Chaos Emperor (I-V).
- **Badges:** all 50 levels use the badge artwork you provided. They show in the profile, pause menu, map banner and victory card.
- **Level bonus:** the attack/defense bonus continues past level 10 at +0.5% per level (+30% at level 50).
- **Level track:** the profile's level track shows a window of ten levels around your current one.
- **Level rewards:** every new level gives 1,000 + 250 × level gold and 3 + level/5 stars. Milestones also give a chest: Green at 15, Blue at 20, Red at 25, Purple at 30, Gold at 40 and Black at 50.

**Attribute upgrades go to level 30.**
- Levels 1-10 are open as before. After that, every two commander levels unlock one more attribute level (cap 30 at commander level 50).
- Star and gold costs continue the existing curve (stars 22 → 60, gold 12,000 → 50,000). Levels 11-30 also cost 10 diamonds each.
- Effects:
  - Attack and Defense: +1% per level.
  - Crit: +2% per level to level 10, then +1% (40% at 30).
  - Build Speed: reaches 1 s at level 10; each level after that adds +1.5% gold from kills (+30% at 30). Battles spend your wallet gold, so there are no "starting coins" to boost.
- The upgrade screen shows the 30 levels in three tiers of ten (gold, sapphire, amethyst) and marks levels that still need a higher commander level.

**Stars.** There is one star count again: every star earned counts fully toward upgrades. The 0.6 weighting from v4.3 is gone.

**Save compatibility (old ↔ new).**
- The commander level is always worked out from saved XP, so it can never be lost or reset.
- Players with more than 4,000 XP move up automatically. For example, 11,082 XP is now level 16. A one-time window explains this and lists the level rewards received.
- Cleared stages, stars, gold, diamonds, items, chests, attribute levels and AUTO switches are unchanged.
- Before anything is converted, the old save is copied once to the browser's `ck25_bak_v44` entry.
- New save fields are optional:
  - Saves and progress-transfer codes from any older version load normally.
  - v4.4 codes also import into v4.3. There the level simply shows as 10, and shards above 3 are capped, as v4.3 always did.
- Importing an old code counts its level as already rewarded, so re-importing can't repeat rewards.
- Exported codes now record their version. Before an import overwrites anything, it shows what the save contains, for example "Save from v4.3 or earlier · Lv.16 · 10 levels cleared · Atao".

**Inventory (🎒).** Open it from the title screen, the pause menu, the ITEMS label of the item bar, or by long-pressing any item in the item bar (that opens straight to the item, without using it).
- **Tabs:** Items, Rare, Chests and Materials. Each shows how many you hold, and the item bar always shows the same counts.
- **Actions:** in battle you can Use items from here, and toggle AUTO.
- **Selling:** pays 80% of the original price, after a second tap to confirm.

| Item | Sells for |
| --- | --- |
| Shop item | 80% of its base gold price |
| Rare item | 32,000 gold |
| Enhancement Rune | 40,000 gold |
| Chest | 4 / 8 / 16 / 28 / 48 / 80 diamonds |
| Diamond shards | not sellable (crafting material) |

**Diamond forge.** In Inventory › Materials, 4 diamond shards + 4,000 gold make 1 diamond, with an 85% success rate. A failure uses up the gold and all 4 shards. There is a hammering animation, then a flash for success or a cracked gem for failure. Shards no longer turn into diamonds by themselves.

**Boss diamonds.** Besides the existing epic-tier diamond pieces, the final boss has a separate chance to drop 1-3 whole diamonds: 10% at level 1, rising to 60% at level 100. Replays get a quarter of that chance. Counting both sources, about 49% of first-clear boss treasures contain diamonds at level 1, and about 92% at level 100.

**Other changes.**
- **Chests:** the purchase screen no longer shows chest values. The actual value is still shown after opening.
- **HUD:** the shard counter is gone.
- **CALL button:** it stays fixed whatever the numbers show. Everything to its left now has a fixed width, and gold shows as e.g. 12.3K from 10,000 (diamonds from 10,000). In portrait, the rotate button now lives only in the pause menu ("Screen: …"), to make room.
- **Settings:** the version number appears in the pause/settings menu.
- **AUTO switch:** redesigned as a gold-trimmed toggle with a sliding ⚡ knob that glows emerald with a moving shine when on. Shop rows show the switch alone; the inventory also shows the AUTO label.
- **World map:** the Fourfold Throne crown is centred on its text. The realm thumbnail now has the same proportions as the atlas tiles (about 1.2 : 1) and is larger.
- **Profile:** "Stars collected" now counts out of 500 (5 stars per level).

## What changed in v4.3 · Treasure Chests

Chest and auto-use code is in `source/premium/chest.js`.

**Treasure chests.** There are six tiers, bought with diamonds or won from final bosses:

| Chest | Price | Reward types |
| --- | --- | --- |
| Green | 5 💎 | 3 |
| Blue | 10 💎 | 3-4 |
| Red | 20 💎 | 4 |
| Purple | 35 💎 | 4-5 |
| Gold | 60 💎 | 5 |
| Black | 100 💎 | 5-6 |

- Where to find them: the new **Chests** tab in the shop, or the **🎁 Treasure Chests** button on the title screen. Chests can be opened any time and can never be sold.
- What's inside: every chest mixes several reward types, each with several units. Possible rewards are diamonds, gold, stars, medals, Enhancement Runes, rare items and diamond shards. Better chests hold more types and more of the rare and special items.
- Value: each chest's contents are worth a total measured in diamonds. Exactly 85% of chests are worth more than their price (1.05-1.6×, with occasional 2-3× jackpots) and 15% a little less (0.62-0.95×). A 20,000-roll test per tier came out at 84.8-85.2%.
- Values used for that comparison:

  | Reward | Worth 1 💎 |
  | --- | --- |
  | Gold | 10,000 |
  | Stars | 10 |
  | Medals | 5 |
  | Diamond shards | 4 |

  An Enhancement Rune is worth 5 💎 and a rare item 4 💎.
- Diamonds are kept to about 9% of a chest's value, so buying chests is never a way to farm diamonds.
- Opening one: the chest shakes, then a burst of light breaks out of it, with spinning rays, a white flash and about 170 sparks and glints flying in every direction. The rewards then fly in one card at a time, each with its own chime, and the total value is shown against the price.

**Medals.** A new reward. Medals are counted, and each one instantly gives 50 commander XP.

**Boss chest drops.** The final boss can drop a chest, which bursts out with the rest of the treasure and must be picked up like any other loot.

| Level | Chance (normal difficulty) |
| --- | --- |
| 1 | about 5% |
| 50 | about 19% |
| 100 | about 33% |

Higher levels also give better chests. Difficulty scales the chance by ×0.8 to ×1.2. Replays drop chests a quarter as often, and never above Red.

**Automatic item activation.** Every item that doesn't need a target has an **AUTO** switch in its shop box. When it's on, the item fires by itself as soon as its cooldown ends, as long as you have one in stock and monsters are on the field.
- The Healing Potion waits until it wouldn't be wasted.
- The Attack Helicopter waits until the previous one has left.
- River, Airstrike and Bomber Squadron need you to pick a spot, so they have no AUTO switch.
- Auto items show a green "A" badge in the item bar. The switches are saved.

**Diamond shards.** Medium monsters (brutes and elites) now drop a diamond shard about 6% of the time (measured 5.9%).

**Safer bottom panel.** In portrait, the bottom panel is now 18 px taller in browsers (8 px in the Android app), so the item row sits about 22-25 px above the screen edge instead of 9 px. That keeps taps away from the phone's swipe-to-switch-apps gesture. The battlefield shrinks a little to make room, so nothing overlaps. Landscape is unchanged, because there is no spare room there.

**New loading screen.** It uses the floating-castle artwork:
- A slow zoom, light rays and rising golden motes.
- The Chaos Kingdoms logo floating at the top.
- A framed gold progress bar with a shine.

**Star balance fix.** The 5-star rating in v4.2.1 raised the number of level stars, which also raised the stars you can spend on Bonus Upgrades. Level stars now count 0.6 each toward upgrades, so spendable stars are the same as before the change. Stars from loot and chests still count fully.

## What changed in v4.2.1 · Polish

**HD kill replay.** The final-boss replay is now recorded at the game's own render resolution, so it is exactly as sharp as live play (before, it was recorded 280 px wide and looked blurry). It keeps the last 2.4 seconds at 10 frames per second. The zoom on the boss is gentler (×1.24), so it stays crisp. Capturing a frame takes under 1 ms, and frame times are the same as with the old low-resolution recording. If a device can't hold full-size frames, the recorder drops to half size by itself.

**5-star victory rating.** Levels are now rated 1-5 stars, drawn with the new star artwork. The rating comes from a score out of 100:
- Lives kept: 60 points.
- Clean waves (no monster got through): 25 points.
- Towers kept (not destroyed by monsters): 15 points.

| Stars | Score |
| --- | --- |
| 5 | 95 or more (flawless) |
| 4 | 80 or more |
| 3 | 62 or more |
| 2 | 42 or more |
| 1 | any win |

The Victory screen shows the breakdown: lives, clean waves, towers lost and score. The star gold bonus is now +25%, +50%, +85% or +120% for 2-5 stars. Level buttons show 5 small stars, and realm totals count out of 40.

Existing saves are converted once: 1 star stays 1, 2 stars become 3, 3 stars become 5. Progress-transfer codes from older versions are converted the same way. The hidden map that needed "3 stars on all 6 main-map bosses" now needs 5 stars, the same requirement.

**Pickup sound.** It's now a crisper "ka-ching": a bright click, a bell that rings out for about half a second (longer than a UI click), and a quick rising sparkle. It is about 50% louder.

**Shop.**
- The Boss Treasure rows use exactly the same layout, fonts and buttons as the regular shop items, so everything lines up.
- The heading uses the shop's font.
- Items that can't be bought have a grey copy of the Buy button reading "Boss drop only".
- Diamonds have a gold "Redeem" button that opens the Treasures page, where diamond packs are redeemed with codes (diamonds are not sold for gold).

**World map.**
- The Fourfold Throne uses the new crown artwork, with no gold circle around it.
- The map picture in the realm panel no longer has an emoji over it and is a little larger.

## What changed in v4.2 · Treasure & Challenge

**Final-boss kill replay.** In the last wave of a boss level, the game records the last 3 seconds of play: 10 frames per second at reduced resolution. When the final boss dies, everything else on the map stops. The killing blow then replays in slow motion, zooming in on the boss, with a vignette and a Skip button. When the replay ends, the treasure bursts out.

**Bigger, golden loot at random spots.**
- Dropped items are about 50% larger.
- Each one has a bright golden glow and twinkling sparkles. Legendary and higher items also get a light beam.
- Items land at fully random positions anywhere on the map, not on tile centres, and never overlap.
- A tap collects every item near your finger.

**Pickup window.**
- Boss loot lasts 8 seconds: fully visible for 7 seconds, fading during the last second, then gone.
- Medium-monster drops still last 20 seconds.

**Vibration.** Every pickup gives a short vibration. On Android this goes through the app, which now requests the VIBRATE permission. In browsers that support it, it uses the Vibration API.

**Loot statistics.** The Victory and Defeat screens list every item collected from drops in that level, with its icon and quantity. Boss treasure and monster drops are listed separately.

**Rare items in the shop.** The shop has a new section listing Diamonds, Diamond Shards, Enhancement Runes and the 6 rare items, each with its artwork and description. They can't be bought: each button reads "Boss drop only".

**New artwork.** The two provided art sheets were cut into 22 icons. They replace the old icons everywhere the items appear:
- Diamonds, shards, runes and the 6 rare items: their names now match the art (Time Crystal, Dragonfire Scroll, Royal Protection, Master Forging, Midas Mark, Ancient Horn).
- River, Legion, Air Strike, Bomb and Helicopter items.
- Gold coins, stars, trophy and medal.
- The 4 attribute upgrade icons and the ending crest.

Floating text labels and toasts still use emoji.

**Harder late levels (non-boss levels only).** Boss levels and level paths are unchanged.
- Monster HP rises steadily from ×1.0 at level 40 to ×2.0 at level 99.
- From level 60, waves have 25% more monsters, and elites and special roles appear 1.5× as often.

Total monster HP per level:

| Level | v4.1 | v4.2 |
| --- | --- | --- |
| 46 | 141k | 163k |
| 59 | 225k | 308k |
| 66 | 428k | 754k |
| 75 | 464k | 1,038k |
| 86 | 761k | 1,705k |
| 95 | 885k | 2,175k |

**Tested:** the 42-state interface walkthrough, touch input, the gameplay simulations, the boss levels and the music worker all pass. From the kill through the replay to the end of the 8-second window takes about 14 seconds, with no errors, a median frame time of 24 ms and a worst frame of 62 ms.

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
     SignApk <keystore.p12> <password> <alias> /tmp/unsigned.apk ../dist/ChaosKingdoms-v6.3.apk
```

`apkbuild.py` writes the binary `AndroidManifest.xml` and `resources.arsc` itself and stores the resource table 4-byte aligned, as Android 11+ requires. It does not need the Android SDK.

The release keystore is not stored in this repository. Android only installs an update over an existing install when both are signed with the same key, so keep the keystore somewhere safe.

Fonts: Cinzel, Nunito and Fredoka are under the SIL Open Font License (`tools/fonts/OFL-LICENSE.txt`).
