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

# ---------------------------------------------------------------- v2.1 balance + performance
# 5. Freeze item lasts 10 s instead of 4 s (effect, descriptions and both languages).
rep("en.forEach(e=>{e.fz=4;", "en.forEach(e=>{e.fz=10;")
rep("Freezes every enemy for 4s.", "Freezes every enemy for 10s.")
rep("'Everything is frozen for 4s':'全体冻结4秒'", "'Everything is frozen for 10s':'全体冻结10秒'")
rep("toast('Everything is frozen for 4s')", "toast('Everything is frozen for 10s')")
rep("st:'4 seconds · all enemies'", "st:'10 seconds · all enemies'")
rep("d:'冻结所有敌人4秒。'", "d:'冻结所有敌人10秒。'")
rep("st:'4秒 · 全体敌人'", "st:'10秒 · 全体敌人'")
# 6. No-build zone around monster portals: was a 5x5 block per portal from level 33
#    (up to ~64 of 126 tiles on late maps). Now the portal tile plus its 4 direct neighbours.
rep("const R=L.i>=32?2:1;\n L.portals.forEach(p=>{for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){const x=p[0]+dx,y=p[1]+dy;",
    "const R=1;\n L.portals.forEach(p=>{for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){if(dx&&dy)continue;const x=p[0]+dx,y=p[1]+dy;")
# 7. Late-game frame rate. With 50+ towers a frame took >100 ms, and the game loop then
#    drops simulation time, so building, waves and everything else ran in slow motion.
#    a) tower sprites were cached at 380x428 (650 KB each, up to 180 of them) and
#       downscaled with high-quality filtering on every draw: cache at half size;
#    b) 180 facing angles made turning towers miss the cache: 72 angles (5 deg steps);
rep("const ND=180", "const ND=72")
rep("TSP_CACHE_MAX=180", "TSP_CACHE_MAX=260")
#       ... and at most 1 new sprite is rendered per frame; a turning tower borrows the
#       nearest cached facing until its exact one is ready (no visible difference at 5 deg).
rep("s=renderTower(k,lv,lv>3?br:0,d);",
    "if(towerSpr.f!==TM){towerSpr.f=TM;towerSpr.n=0}if(towerSpr.n>=1){const kb=k+':'+lv+':'+(lv>3?br:0)+':';for(let j=1;j<=ND/4;j++){const s1=TSP_CACHE.get(kb+((d+j)%ND))||TSP_CACHE.get(kb+((d-j+ND)%ND));if(s1)return s1}}towerSpr.n++;"
    "s=renderTower(k,lv,lv>3?br:0,d);{const o=document.createElement('canvas');o.width=128;o.height=144;const g2=o.getContext('2d');g2.imageSmoothingEnabled=true;g2.imageSmoothingQuality='high';g2.drawImage(s,0,0,o.width,o.height);s=o}")
#    e) monster portals used canvas shadowBlur on ~30 strokes per portal per frame (the
#       single largest cost on 3-4 portal maps). Glows are now layered wide/thin strokes,
#       and the particle counts are trimmed.
_pa = s.index('function dPortal(){'); _pb = s.index('\nfunction ', _pa + 10)
_P = s[_pa:_pb]
for _old, _new in [
    ("c.shadowColor='#b050ff';c.shadowBlur=8;c.lineWidth=2*u;c.beginPath();c.moveTo(cx+Math.cos(a)*R*.9,cy+Math.sin(a)*R*.9*fl);for(let k=1;k<=4;k++){let aa=a+(rd(i,k)-.5)*.35,r2=R*(.9+.28*k);c.lineTo(cx+Math.cos(aa)*r2,cy+Math.sin(aa)*r2*fl)}c.stroke()}",
     "c.lineWidth=2*u;c.beginPath();c.moveTo(cx+Math.cos(a)*R*.9,cy+Math.sin(a)*R*.9*fl);for(let k=1;k<=4;k++){let aa=a+(rd(i,k)-.5)*.35,r2=R*(.9+.28*k);c.lineTo(cx+Math.cos(aa)*r2,cy+Math.sin(aa)*r2*fl)}c.stroke();c.globalAlpha=.3;c.lineWidth=6*u;c.stroke();c.globalAlpha=1}"),
    ("c.shadowColor='#b36bff';c.shadowBlur=10;", ""),
    ("c.shadowColor='#c050ff';c.shadowBlur=22;c.strokeStyle=`rgba(255,200,255,${.7+.3*pulse})`;c.lineWidth=(4+2*pulse)*u;c.beginPath();c.ellipse(cx,cy,R*.5,R*.5*fl,0,0,7);c.stroke();",
     "c.beginPath();c.ellipse(cx,cy,R*.5,R*.5*fl,0,0,7);c.strokeStyle=`rgba(200,80,255,${.25+.15*pulse})`;c.lineWidth=(14+4*pulse)*u;c.stroke();c.strokeStyle=`rgba(255,200,255,${.7+.3*pulse})`;c.lineWidth=(4+2*pulse)*u;c.stroke();"),
    ("for(let i=0;i<40;i++){let f=(T*.35+i/40)%1", "for(let i=0;i<24;i++){let f=(T*.35+i/24)%1"),
    ("for(let i=0;i<20;i++){let t=(T*.25+i*.137)%1", "for(let i=0;i<12;i++){let t=(T*.25+i*.231)%1"),
    ("c.strokeStyle='#efd8ff';c.shadowColor='#c050ff';c.shadowBlur=12;c.lineWidth=2*u;", "c.strokeStyle='#efd8ff';c.lineWidth=2*u;"),
]:
    assert _P.count(_old) == 1, _old[:60]
    _P = _P.replace(_old, _new)
_P = _P.replace("c.stroke();c.shadowBlur=0}\n c.restore()})}", "c.globalAlpha=.35;c.strokeStyle='#c050ff';c.lineWidth=6*u;c.stroke();c.globalAlpha=1}\n c.restore()})}")
s = s[:_pa] + _P + s[_pb:]
#    f) the main loop credited at most 50 ms of game time per frame, so any frame slower
#       than 20 fps silently ran the game in slow motion (build timers, waves, cooldowns).
#       Simulation steps are cheap (~0.1 ms), so allow catching up to 150 ms per frame.
rep("let dt=Math.min((ts-last)/1e3||0,.05);last=ts;", "let dt=Math.min((ts-last)/1e3||0,.15);last=ts;")
rep("while(acc>=1/60&&n++<12){upd(1/60);acc-=1/60}if(n>=12)acc=0", "while(acc>=1/60&&n++<30){upd(1/60);acc-=1/60}if(n>=30)acc=0")
#    d) the per-tower draw no longer wraps the sprite in save/restore + high-quality resampling
rep("c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(spr,x-w/2,footY-h*footRatio,w,h);c.restore();",
    "c.drawImage(spr,x-w/2,footY-h*footRatio,w,h);")
#    c) level gems were drawn with clip + save/restore + additive gradients per gem per
#       frame; they now come from pre-rendered sprites (same look, a few drawImage calls).
_ga = s.index(' {const sx=w/190,sy=h/214,top=footY-h*footRatio;c.save();for(let i=0;i<lv&&i<4;i++)')
_gb = s.index(' if(stun)for(let i=0;i<3;i++)circ(', _ga)
s = s[:_ga] + (" {const sx=w/190,sy=h/214,top=footY-h*footRatio,G=ckGem(TC),pc=c.globalCompositeOperation,pa=c.globalAlpha;"
 "for(let i=0;i<lv&&i<4;i++){const gp=gemPos(i),gx=x-w/2+(95+gp.x*1.55)*sx,gy=top+(179+(gp.y*.48-gp.z*.83)*1.55)*sy,a=.5+.5*Math.sin(TM*6.5+x*.02),r=3.3*1.55*.78*sx,k=r/G.R;"
 "const gs=G.S*k*(1+.08*a);c.drawImage(G.b,gx-gs*gp.s/2,gy-gs/2,gs*gp.s,gs);"
 "c.globalAlpha=pa*(.5+.5*a);c.fillStyle='#fff';c.beginPath();c.arc(gx+(r*.12-r*.38)*gp.s,gy+r*.1-r*.42,r*.2,0,7);c.fill();c.globalAlpha=pa}}\n") + s[_gb:]
rep("const TSP_CACHE=new Map()",
    "const CK_GEMS={};function ckGem(TC){let G=CK_GEMS[TC];if(G)return G;const R=16,S=R*4,cx=S/2,cy=S/2,b=document.createElement('canvas');b.width=b.height=S;const x=b.getContext('2d');"
    "const gw=x.createRadialGradient(cx,cy,0,cx,cy,cx);gw.addColorStop(0,TC+'99');gw.addColorStop(.55,TC+'33');gw.addColorStop(1,TC+'00');x.fillStyle=gw;x.fillRect(0,0,S,S);"
    "x.fillStyle='rgba(6,8,20,.75)';x.beginPath();x.ellipse(cx,cy,R*1.22,R*1.14,0,0,7);x.fill();const bx=cx+R*.12,by=cy+R*.1;x.beginPath();x.ellipse(bx,by,R,R*.94,0,0,7);x.fillStyle=TC;x.fill();x.save();x.clip();"
    "const dm=x.createRadialGradient(bx-R*.4,by-R*.45,R*.05,bx,by,R*1.1);dm.addColorStop(0,'rgba(255,255,255,.75)');dm.addColorStop(.45,'rgba(255,255,255,0)');dm.addColorStop(1,'rgba(0,0,30,.5)');x.fillStyle=dm;x.fillRect(bx-R,by-R,2*R,2*R);"
    "x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=R*.1;x.beginPath();x.moveTo(bx-R,by);x.lineTo(bx,by-R*.55);x.lineTo(bx+R,by);x.lineTo(bx,by+R*.7);x.closePath();x.moveTo(bx,by-R*.55);x.lineTo(bx,by+R*.7);x.stroke();"
    "x.fillStyle='rgba(255,255,255,.11)';x.fillRect(bx-R,by-R,2*R,2*R);x.restore();"
    "const g=document.createElement('canvas');g.width=g.height=S;const y=g.getContext('2d'),gg=y.createRadialGradient(cx,cy,0,cx,cy,cx);gg.addColorStop(0,TC+'aa');gg.addColorStop(1,TC+'00');y.fillStyle=gg;y.fillRect(0,0,S,S);"
    "return CK_GEMS[TC]={b,g,R,S}}\nconst TSP_CACHE=new Map()")

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
