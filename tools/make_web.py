# Builds the folder to upload to a static host (Netlify Drop, Cloudflare Pages, ...): python3 tools/make_web.py <outdir>
import os, shutil, sys, re
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
D = os.path.join(R, 'dist')
for f in ['ChaosKingdoms.html', 'manifest.webmanifest', 'sw.js', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png']:
    shutil.copy(os.path.join(D, f), out)
ver = re.search(r"CK_VER='([\d.]+)'", open(os.path.join(R, 'source/premium/v44.js'), encoding='utf8').read()).group(1)
apk = os.path.join(D, 'ChaosKingdoms-v%s.apk' % ver)
if os.path.exists(apk): shutil.copy(apk, out)
open(os.path.join(out, 'index.html'), 'w', encoding='utf8').write(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    '<title>Chaos Kingdoms</title><link rel="manifest" href="manifest.webmanifest">'
    '<meta http-equiv="refresh" content="0;url=ChaosKingdoms.html"><a href="ChaosKingdoms.html">Play Chaos Kingdoms</a>\n')
print('web folder ->', out, sorted(os.listdir(out)))
