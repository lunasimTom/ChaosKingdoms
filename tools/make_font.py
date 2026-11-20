#!/usr/bin/env python3
"""Rebuild tools/fonts/cksans-noto-sans-sc-subset.css: Noto Sans SC (SIL OFL 1.1) subset to the characters
used by the game, weights 400/500/700/900, as unicode-range slices embedded in base64.
Needs: `npm pack @fontsource/noto-sans-sc@5.3.1` extracted into ./package, and `pip install fonttools brotli`.
Usage: python3 tools/make_font.py path/to/package"""
import re, io, os, sys, glob, base64
from fontTools import subset
from fontTools.ttLib import TTFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); PKG = sys.argv[1]
txt = open(os.path.join(ROOT, 'source/original/Chaos_Kingdoms-comp1.html'), encoding='utf8').read()
for f in glob.glob(os.path.join(ROOT, 'source/premium/*.*')) + [os.path.join(ROOT, 'tools/build_html.py')]:
    if f.endswith(('.js', '.css', '.html', '.py')): txt += open(f, encoding='utf8').read()
txt = re.sub(r'base64,[A-Za-z0-9+/=]{100,}', '', txt)
need = {ord(c) for c in txt if ord(c) >= 0x20} | set(range(0x20, 0x7f))
def rng(s):
    out = set()
    for p in s.split(','):
        p = p.strip().replace('U+', '')
        if '-' in p: a, b = p.split('-'); out |= set(range(int(a, 16), int(b, 16) + 1))
        else: out.add(int(p, 16))
    return out
faces = []
for w in (400, 500, 700, 900):
    css = open(os.path.join(PKG, f'{w}.css')).read()
    for m in re.finditer(r'@font-face\s*\{(.*?)\}', css, re.S):
        blk = m.group(1); src = re.search(r"url\(\./files/([^)]+\.woff2)\)", blk).group(1)
        cov = rng(re.search(r'unicode-range:\s*([^;]+);', blk).group(1)) & need
        if not cov: continue
        f = TTFont(os.path.join(PKG, 'files', src)); cmap = f.getBestCmap(); cov = {c for c in cov if c in cmap}
        if not cov: continue
        o = subset.Options(); o.flavor = 'woff2'; o.layout_features = ['*']; o.name_IDs = []
        s = subset.Subsetter(options=o); s.populate(unicodes=cov); s.subset(f); b = io.BytesIO(); f.flavor = 'woff2'; f.save(b)
        cs = sorted(cov); rr = []; a = z = cs[0]
        for c in cs[1:]:
            if c == z + 1: z = c
            else: rr.append((a, z)); a = z = c
        rr.append((a, z))
        ur = ','.join(('U+%X' % a if a == z else 'U+%X-%X' % (a, z)) for a, z in rr)
        faces.append(f"@font-face{{font-family:CKSans;font-style:normal;font-weight:{w};font-display:swap;src:url(data:font/woff2;base64,{base64.b64encode(b.getvalue()).decode()}) format('woff2');unicode-range:{ur}}}")
open(os.path.join(ROOT, 'tools/fonts/cksans-noto-sans-sc-subset.css'), 'w').write('\n'.join(faces)); print(len(faces), 'faces')
