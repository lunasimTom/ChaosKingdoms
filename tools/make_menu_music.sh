#!/bin/sh
# Re-render the embedded main-menu track after changing music_core.js:  sh tools/make_menu_music.sh
set -e
cd "$(dirname "$0")/.."
node tools/make_menu_music.js /tmp/ck_menu.f32
ffmpeg -hide_banner -loglevel error -y -f f32le -ar 24000 -ac 2 -i /tmp/ck_menu.f32 -ac 2 -codec:a libmp3lame -b:a 32k source/premium/menu_music.mp3
rm -f /tmp/ck_menu.f32
