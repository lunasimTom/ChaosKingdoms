#!/usr/bin/env python3
"""Build the polished Chaos Kingdoms HTML from the original upload + src/ layer."""
import base64, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'source', 'premium')
orig = open(os.path.join(ROOT, 'source', 'original', 'Chaos_Kingdoms-comp1.html'), encoding='utf8').read()
out_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist', 'ChaosKingdoms.html')
s = orig

def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        raise SystemExit(f'expected {count} match(es), found {n}: {old[:90]!r}')
    s = s.replace(old, new)

# ---------------------------------------------------------------- document structure
lines = s.split('\n')
prefix = lines[0][:lines[0].index('<style>')]
assert lines[112].startswith(prefix), 'second document prefix mismatch'
assert lines[111] == '</head><body>'
lines[112] = lines[112][len(prefix):]      # drop duplicated <!doctype><html><head><meta...>
lines[111] = ''                             # drop premature </head><body>
lines[0] = lines[0][len(prefix):]
s = '\n'.join(lines)
rep('</head><body>\n<title>Chaos Kingdoms</title>\n', '</head><body>\n<!--CK_SPLASH-->\n')
# remote Google Fonts are replaced by embedded copies (works offline / inside the APK)
s, n = re.subn(r'<link rel="preconnect" href="https://fonts.googleapis.com">.*?display=swap" rel="stylesheet">', '', s, count=1)
assert n == 1, 'font link not found'
# white flash before styles apply
s = s.replace('body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}',
              'body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#050912;color:#fff3d6}')
s = s.replace(':root{color-scheme:light;', ':root{color-scheme:dark;')

# ---------------------------------------------------------------- bug fixes
# 1. Victory/defeat modal is built 900 ms after end(); if a new level (or the map demo)
#    replaced L in the meantime the panel read undefined rewards and threw.
rep("setTimeout(()=>{modal(win?", "const _endL=L;setTimeout(()=>{if(L!==_endL)return;modal(win?")
# 2. World atlas: row two was laid out right-to-left (VIII VII VI V) although no route
#    connects the pins any more; read the realms in natural order.
rep("(((dIx/4|0)===1)?3-dIx%4:dIx%4)", "(dIx%4)", 2)
# 3. Default commander name shows as English "Commander" in the Chinese map title.
rep("const mapT=()=>S.name?TL('{0}’s kingdom',S.name):TL('World map');",
    "const mapT=()=>S.name?TL('{0}’s kingdom',(LANG==='zh'&&S.name==='Commander')?'指挥官':S.name):TL('World map');")
# 4. Rotation toast reported the orientation from before the relayout.
#    (label is now refreshed after fit() runs; see patch below)

# ---------------------------------------------------------------- premium layer
def b64(p):
    return base64.b64encode(open(p, 'rb').read()).decode()
F = os.path.join(HERE, 'fonts')
faces = [('Cinzel', 'cinzel-latin-{}-normal.woff2', [700, 900]),
         ('Nunito', 'nunito-latin-{}-normal.woff2', [700, 800, 900]),
         ('Fredoka', 'fredoka-latin-{}-normal.woff2', [500, 600, 700])]
font_css = ''.join(
    f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;src:url(data:font/woff2;base64,{b64(os.path.join(F, pat.format(w)))}) format('woff2')}}\n"
    for fam, pat, ws in faces for w in ws)
critical = open(os.path.join(SRC, 'critical.css'), encoding='utf8').read()
head = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">'
        '<meta name="theme-color" content="#050912"><meta name="mobile-web-app-capable" content="yes">'
        '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
        '<meta name="format-detection" content="telephone=no">'
        '<title>Chaos Kingdoms</title>\n'
        f'<style id="ck-fonts">{font_css}</style>\n<style id="ck-critical">{critical}</style>\n')
s = head + s
s = s.replace('<!--CK_SPLASH-->', open(os.path.join(SRC, 'splash.html'), encoding='utf8').read())
aaa_css = open(os.path.join(SRC, 'aaa.css'), encoding='utf8').read()
aaa_js = open(os.path.join(SRC, 'aaa.js'), encoding='utf8').read()
fix_js = open(os.path.join(SRC, 'fixes.js'), encoding='utf8').read()
assert s.rstrip().endswith('</body></html>')
s = s.rstrip()[:-len('</body></html>')] + f'<style id="ck-aaa">\n{aaa_css}</style>\n<script id="ck-fixes">\n{fix_js}</script>\n<script id="ck-aaa-js">\n{aaa_js}</script>\n</body></html>\n'
open(out_path, 'w', encoding='utf8').write(s)
print('wrote', out_path, len(s))
