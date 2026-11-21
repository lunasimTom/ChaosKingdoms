#!/usr/bin/env python3
"""Build the polished Chaos Kingdoms HTML from the original upload + src/ layer."""
import base64, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'source', 'premium')
orig = open(os.path.join(ROOT, 'source', 'original', 'Chaos_Kingdoms-comp1.html'), encoding='utf8').read()
out_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist', 'ChaosKingdoms.html')
s = orig

def _fit(im, cap):
    from PIL import Image
    if max(im.size) > cap:
        k = cap / max(im.size); im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    return im
def _cka_cap(name):
    # v6.3: art is stored at ~2.5x its largest on-screen size
    if name == 'logo': return 540
    if name in ('win', 'lose'): return 480
    if name in ('appicon', 'appicon_sq'): return 999
    if name.startswith('ch_') or name == 'crown': return 160
    if name.startswith('lv'): return 96
    return 128
def _recode(path, cap, q=80):
    import io
    from PIL import Image
    im = _fit(Image.open(path).convert('RGBA'), cap); buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6)
    return base64.b64encode(buf.getvalue()).decode()
def _cka():
    import io
    from PIL import Image
    d = os.path.join(SRC, 'items'); out = {}
    for f in sorted(os.listdir(d)):
        if not f.endswith('.png') or f.startswith('source-'): continue
        im = _fit(Image.open(os.path.join(d, f)).convert('RGBA'), _cka_cap(f[:-4])); buf = io.BytesIO(); im.save(buf, 'WEBP', quality=80, method=6)
        out[f[:-4]] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
    assert len(out) == 84, sorted(out)
    return 'const CKA=' + __import__('json').dumps(out) + ';'
CKA_JS = _cka()
def _ckm():
    import io
    from PIL import Image
    d = os.path.join(SRC, 'medals'); out = [None]
    for i in range(1, 41):
        im = Image.open(os.path.join(d, f'm{i}.png')).convert('RGBA'); buf = io.BytesIO(); im.save(buf, 'WEBP', quality=86, method=6)
        out.append('data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode())
    return 'const CKM=' + __import__('json').dumps(out) + ';'
CKA_JS = CKA_JS + _ckm()
def _w59(name, size, q=84):
    import io
    from PIL import Image
    im = Image.open(os.path.join(SRC, 'art59', name)).convert('RGBA')
    if im.width != size: im = im.resize((size, size), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
def _ckr():
    d = os.path.join(SRC, 'realms')
    out = ['data:image/webp;base64,' + _recode(os.path.join(d, f'realm{i}.webp'), 300 if i < 12 else 640, 80) for i in range(13)]
    import io
    from PIL import Image
    buf = io.BytesIO(); Image.open(os.path.join(SRC, 'forge_strip.png')).convert('RGBA').save(buf, 'WEBP', quality=72, method=6)
    fg = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
    return 'const CK_RIMG=' + __import__('json').dumps(out) + ';const CK_FORGEIMG=' + __import__('json').dumps(fg) + ';const CK_DIFIMG=' + __import__('json').dumps([_w59('dif%d.png' % i, 96, 78) for i in range(5)]) + ';const CK_BAGIMG=' + __import__('json').dumps(_w59('bag.png', 128, 80)) + ';const CK_MENU_MP3=' + __import__('json').dumps('data:audio/mpeg;base64,' + base64.b64encode(open(os.path.join(SRC, 'menu_music.mp3'), 'rb').read()).decode()) + ';'
CKA_JS = CKA_JS + _ckr()

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

# ---------------------------------------------------------------- v2.2 gameplay + visuals
# 8. Spawn protection: 1.5 s instead of 2.5 s, no pale-yellow ring; the monster's own body
#    glows instead. Glows (spawn, hit flash, enrage) use cached tinted silhouettes drawn
#    additively, which is much cheaper than the per-draw canvas filter it replaces.
rep("pro:L.demo?0:2.5", "pro:L.demo?0:1.5")
rep("if(e.pro>0){circ(p.x,p.y,sz*.55,'rgba(255,240,150,'+(.16+.14*Math.sin(TM*16))+')');c.strokeStyle='rgba(255,245,190,.9)';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,sz*.55,0,7);c.stroke()}", "")
rep("if((e.fl>0||(e.pro>0&&Math.sin(TM*22)>-.2))&&c.filter!==undefined)c.filter='brightness(2.6) saturate(.5)';", "")
rep("const TRIM={};",
    "const CK_TINT=new WeakMap();function ckTint(src,col){let m=CK_TINT.get(src);if(!m){m={};CK_TINT.set(src,m)}let o=m[col];if(o)return o;const iw=src.width||1,ih=src.height||1,k=Math.min(1,180/Math.max(iw,ih));o=document.createElement('canvas');o.width=Math.max(1,Math.round(iw*k));o.height=Math.max(1,Math.round(ih*k));const g=o.getContext('2d');g.drawImage(src,0,0,o.width,o.height);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,o.width,o.height);return m[col]=o}\n"
    "const TRIM={};")
# 9. Monster readability ("2.5D pop"): a soft dark outline behind every monster, then the
#    glow layer on top (white spawn shimmer, hit flash, red enrage pulse).
rep("c.drawImage(src,0,0,iw,ih,-w/2,-h,w,h);",
    "e._ds=src;e._dw=w;e._dh=h;e._df=flip;e._dy=sz*.34+(fl?0:padB(e.sp,im)*h);"
    "if(e.el||window.CK_Q!==0){const pa=c.globalAlpha,el=e.el;c.globalAlpha=pa*(el?.62+.33*Math.sin(TM*6+e.o):.55);const ow=w*(el?1.12:1.07),oh=h*(el?1.08:1.05);c.drawImage(ckTint(src,el?'#ffcf4a':'#0b0618'),-ow/2,-oh+h*.03,ow,oh);c.globalAlpha=pa}"
    "c.drawImage(src,0,0,iw,ih,-w/2,-h,w,h);"
    "{let ga=0,gc=null;if(e.fl>0){ga=.8;gc='#ffffff'}else if(e.pro>0){ga=.38+.3*Math.sin(TM*14);gc='#fff1b8'}"
    "if(e.rage){const ra=.3+.4*(.5+.5*Math.sin(TM*16));if(ra>ga){ga=ra;gc='#ff2020'}}"
    "if(gc){const pc=c.globalCompositeOperation,pa=c.globalAlpha;c.globalCompositeOperation='lighter';c.globalAlpha=pa*ga;c.drawImage(ckTint(src,gc),-w/2,-h,w,h);c.globalCompositeOperation=pc;c.globalAlpha=pa}}")
# 10. Boss Enrage Mode from level 40: at <=20% HP the boss swells to 3x size for 3 s
#     (then back to normal), charges across the map in
#     bursts (smashing towers it runs into), pulses red and deals +15% damage.
#     Bosses before level 40 keep their original 33% enrage.
rep("if(!e.s2&&r<.33){e.s2=1;e.en=1;toast('The boss is enraged')}",
    "if(!e.s2&&r<(L.i>=39?.2:.33)){e.s2=1;e.en=1;if(L.i>=39){e.rage=1;e.chg=0;e.smash=[];L.shake=Math.max(L.shake||0,.9);sfx('bossalert',.6)||beep(90,.45,'sawtooth',.08);"
    "toast(lvZ('⚠ 首领狂暴！体型变大、高速冲撞、攻击力 +15%','⚠ The boss is ENRAGED! Bigger, charging, +15% attack'));if(window.ckBanner)ckBanner(lvZ('首领狂暴','Boss enraged'),lvZ('狂暴模式','ENRAGED'),1)}else toast('The boss is enraged')}")
rep("e.bt-=dt;if(e.bt<=0&&!(e.wd>0)){e.wd=1;e.bt=e.en?4:6.5}}",
    "e.bt-=dt;if(e.bt<=0&&!(e.wd>0)){e.wd=1;e.bt=e.en?4:6.5}"
    "if(e.rage){e.rgT=(e.rgT||0)+dt;{const rt=e.rgT,ss=x=>x*x*(3-2*x);e.rg=rt<.35?ss(rt/.35):rt<2.65?1:rt<3?ss((3-rt)/.35):0;if(rt>=.35&&rt-dt<.35){const sp2=eS(e);vRing(sp2.x,sp2.y,tw*3.2,'#ff4a3a',.6,8);vGlow(sp2.x,sp2.y,tw*2.4,'#ff3a2a',.5);L.shake=Math.max(L.shake||0,1)}}const c0=e.chg%2.2<1.3;e.chg=(e.chg||0)+dt;const c1=e.chg%2.2<1.3;if(c1&&!c0)e.smash=[];"
    "if(c1){e.dust=(e.dust||0)-dt;if(e.dust<=0){e.dust=.07;const sp0=eS(e);burst(sp0.x,sp0.y+tw*.3,'#ff6a3a',3,70)}"
    "for(const t of L.tr){if(t.building||t.hp<=0||e.smash.includes(t))continue;if(Math.hypot(t.x-e.x,t.y-e.y)<.8){e.smash.push(t);dmgTower(t,(EATK.boss||100)*.6*(1+L.i*.06)*1.15);const tp=pp(t.x,t.y);burst(tp.x,tp.y,'#ff8a5a',12,140);L.shake=Math.max(L.shake||0,.35)}}}}}")
rep("*(e.en?1.7:1)*", "*(e.rage?(e.chg%2.2<1.3?2.7:1.3):e.en?1.7:1)*")
rep("sz=bs?1.9*tw:.92*tw*d.sz", "sz=bs?1.9*tw*(1+2*(e.rg||0)):.92*tw*d.sz*(e.el?1.22:1)")  # v2.5: enrage = 3x size for 3 s
rep("if(e.en)circ(p.x,p.y,34*u,'#ff2b4a33');",
    "if(e.rage){const pr=.5+.5*Math.sin(TM*10);circ(p.x,p.y,sz*.62,'rgba(255,30,30,'+(.16+.16*pr)+')');circ(p.x,p.y,sz*.4,'rgba(255,140,60,'+(.1+.12*pr)+')')}else if(e.en)circ(p.x,p.y,34*u,'#ff2b4a33');")
rep("const hit=(EATK[e.t]||10)*period*(1+L.i*.06)*(e.sl>0?.6:1);",
    "const hit=(EATK[e.t]||10)*period*(1+L.i*.06)*(e.sl>0?.6:1)*(e.rage?1.15:1);")
# 11. Boss minion summons (level 33+), v2.8 fix. At 50% and 25% HP the boss stops and
#     CHANNELS the summon: it is shielded (immune) for the 5-second countdown, then the
#     minions drop. Its HP cannot fall past a threshold until that summon has happened,
#     so both summons always fire, exactly at 50% and 25%, however fast it is damaged.
#     Triggers are tracked PER BOSS: every boss level from 40 has two bosses, and the old
#     per-level flags let only the first boss to reach a threshold summon.
#     (v2.2-2.7 delayed the drop while the boss kept taking damage, queued the second
#     call behind the first and cancelled both if the boss died; second threshold was 20%.)
rep("if(!L.m50&&r<=.5){L.m50=1;bossSummon(e,1)}if(!L.m20&&r<=.2){L.m20=1;bossSummon(e,2)}}});",
    "if(!(e.chan>0)){if(!e.m50&&r<=.5){e.m50=1;e.hp=Math.max(e.hp,e.mx*.5);ckChannel(e,1)}else if(e.m50&&!e.m25&&r<=.25){e.m25=1;e.hp=Math.max(e.hp,e.mx*.25);ckChannel(e,2)}}}});if(L.i>=32&&!L.demo)ckSummonTick(dt);")
rep("e.hp-=d;e.fl=.1;",
    "e.hp-=d;if(e.t==='boss'&&!L.demo&&L.i>=32){if(!e.m50&&e.hp<e.mx*.5)e.hp=e.mx*.5;else if(!e.m25&&e.hp<e.mx*.25)e.hp=e.mx*.25}e.fl=.1;")
rep("function eUp(e,dt){let d=e.d;e.fl-=dt;", "function eUp(e,dt){let d=e.d;e.fl-=dt;if(e.chan>0){e.chan-=dt;e.pro=Math.max(e.pro||0,e.chan);e.vv[0]*=.8;e.vv[1]*=.8;return}")
rep("function bossSummon(boss,ph){",
    "function ckChannel(b,ph){b.chan=5;b.pro=5;b.atk=null;(L.scs=L.scs||[]).push({ph,t:5,last:6,b});L.sc=L.scs[0];L.shake=Math.max(L.shake||0,.4);const sp=eS(b);vRing(sp.x,sp.y,tw*1.6,'#ffd76a',.6,6);vGlow(sp.x,sp.y,tw*1.4,'#ffd76a',.4);"
    "toast(ph===2?lvZ('⚠ 首领开始召唤最后的援军（护盾中）！5 秒后降临','⚠ The boss is channelling its last reinforcements (shielded)! 5 s'):lvZ('⚠ 首领开始召唤援军（护盾中）！5 秒后降临','⚠ The boss is channelling reinforcements (shielded)! 5 s'))}\n"
    "function ckSummonTick(dt){const a=L.scs;if(!a||!a.length){L.sc=null;return}if(L.over){L.scs=[];L.sc=null;return}for(const sc of a.slice()){sc.t-=dt;const n=Math.ceil(sc.t);if(sc===a[0]&&n<sc.last&&n>0){sc.last=n;beep(n<=2?880:620,.12,'square',.06)}"
    "if(sc.t<=0){a.splice(a.indexOf(sc),1);if(sc.b){sc.b.chan=0;sc.b.pro=0}bossSummon(sc.b,sc.ph)}}L.sc=a[0]||null}\n"
    "function bossSummon(boss,ph){")
# The summon size is split between the level's bosses (every boss level from 40 has
# two), so the total reinforcements per level match the original one-pair design.
rep("let n=Math.round((8+Math.floor(lv/4))*(ph===2?1.5*4:2.5)*dm);n=Math.max(15,Math.min(ph===2?170:80,n));",
    "let n=Math.round((8+Math.floor(lv/4))*(ph===2?1.5*4:2.5)*dm);n=Math.max(15,Math.min(ph===2?170:80,n));n=Math.max(8,Math.round(n/((L.boss&&L.i>=39)?2:1)));")
# boss shield ring while channelling
rep("if(e.rage){const pr=.5+.5*Math.sin(TM*10);",
    "if(e.chan>0){const pr=.5+.5*Math.sin(TM*8);c.save();c.strokeStyle='rgba(255,215,106,'+(.55+.35*pr)+')';c.lineWidth=3;c.beginPath();c.ellipse(p.x,p.y,sz*.62,sz*.36,0,0,7);c.stroke();c.globalAlpha=.18+.1*pr;c.fillStyle='#ffd76a';c.beginPath();c.ellipse(p.x,p.y-sz*.25,sz*.55,sz*.62,0,0,7);c.fill();c.restore()}if(e.rage){const pr=.5+.5*Math.sin(TM*10);")
# 12. Screen fit: use the real visible area (minus notches / camera cut-outs / rounded
#     corners via safe-area insets), let tall phones use their full height (portrait design
#     height 760-1120 instead of 800-960), and render at up to 2x on capable devices.
rep("function fit(){let[vw,vh]=vpSize();if(vw<40||vh<40){setTimeout(fit,150);return}_vw=vw;_vh=vh;let p=wantPortV(vw,vh),nw=p?450:724,nh=p?Math.round(Math.max(800,Math.min(960,450*vh/vw))):600;port=p;W=nw;H=nh;FS=Math.min(vw/W,vh/H);let a=$('app');a.style.width=W+'px';a.style.height=H+'px';a.style.transformOrigin='0 0';a.style.transform='scale('+FS+')';a.style.left=Math.round((vw-W*FS)/2)+'px';a.style.top=Math.round((vh-H*FS)/2)+'px';",
    "function ckInsets(){let pr=document.getElementById('ck-inset');if(!pr){pr=document.createElement('div');pr.id='ck-inset';pr.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(pr)}const cs=getComputedStyle(pr),f=v=>Math.max(0,parseFloat(v)||0);return{t:f(cs.paddingTop),r:f(cs.paddingRight),b:f(cs.paddingBottom),l:f(cs.paddingLeft)}}\n"
    "function fit(){let[vw0,vh0]=vpSize();if(vw0<40||vh0<40){setTimeout(fit,150);return}const si=ckInsets(),vw=Math.max(40,vw0-si.l-si.r),vh=Math.max(40,vh0-si.t-si.b);_vw=vw;_vh=vh;let p=wantPortV(vw,vh),nw=p?450:724,nh=p?Math.round(Math.max(760,Math.min(1120,450*vh/vw))):600;port=p;W=nw;H=nh;FS=Math.min(vw/W,vh/H);let a=$('app');a.style.width=W+'px';a.style.height=H+'px';a.style.transformOrigin='0 0';a.style.transform='scale('+FS+')';a.style.left=Math.round(si.l+(vw-W*FS)/2)+'px';a.style.top=Math.round(si.t+(vh-H*FS)/2)+'px';")
rep("let d=Math.min(1.5,(devicePixelRatio||1)*FS)",
    "let d=Math.min(((navigator.hardwareConcurrency||4)>=6&&(navigator.deviceMemory||4)>=4)?2:1.5,(devicePixelRatio||1)*FS)")

# ---------------------------------------------------------------- v2.5 presentation + balance
# 13. Healing Potion: the rising price is intentional (documented in the shop), but it
#     climbed 150 per purchase with no limit. Now +100 per purchase, capped at 700, still
#     resetting every level; a potion is no longer used up when lives are already full.
rep("if(id==='rep')L.price.rep+=150", "if(id==='rep')L.price.rep=Math.min(700,L.price.rep+100)")
rep("st:'Instant · price rises 150 after each purchase'", "st:'Instant · +100 per purchase this level (max 700)'")
rep("st:'瞬发 · 每次购买涨价150'", "st:'瞬发 · 本关每次购买+100（最高700）'")
rep("L.inv[id]--;L.cdn[id]=CDT[id];", "if(id==='rep'&&L.lives>=ckCap())return toast(lvZ('生命值已满','Lives are already full'));L.inv[id]--;L.cdn[id]=CDT[id];")
# 14. Monster motion: elastic pop-in on spawn, squash on hit, heavier footfalls for brutes
#     and bosses, softer shadows under flyers. Pure transform math: no extra draws.
rep("function eUp(e,dt){let d=e.d;e.fl-=dt;", "function eUp(e,dt){let d=e.d;e.fl-=dt;e.age=(e.age||0)+dt;")
rep("c.translate(p.x,p.y+sz*.34+(fl?0:padB(e.sp,im)*h));",
    "c.translate(p.x,p.y+sz*.34+(fl?0:padB(e.sp,im)*h));{const ag=e.age||0;if(ag<.32&&!L.demo){const k=ag/.32-1,s2=1+2.4*k*k*k+1.4*k*k;c.scale(s2,s2)}}")
rep("if(e.kb>0){c.translate((e.kdx||0)*e.kb*tw*.12,(e.kdy||0)*e.kb*tw*.08);c.scale(1+e.kb*.06,1-e.kb*.04)}",
    "if(e.kb>0){c.translate((e.kdx||0)*e.kb*tw*.12,(e.kdy||0)*e.kb*tw*.08);c.scale(1+e.kb*.06,1-e.kb*.04)}if(e.fl>0){const k=Math.min(1,e.fl/.1);c.scale(1+.13*k,1-.11*k)}")
rep("c.scale(1,1+Math.cos(ph*2)*.012*moving);", "c.scale(1-(bs||e.t==='brute'?Math.cos(ph*2)*.012*moving:0),1+Math.cos(ph*2)*(bs||e.t==='brute'?.035:.012)*moving);")
rep("ell(p.x,p.y+sz*.33,sz*.36*(1-hov/tw*.6),sz*.1,'#0007');", "ell(p.x,p.y+sz*.33,sz*.36*(1-hov/tw*.6),sz*.1,fl?'#0004':'#0007');")
# 15. Elite monsters (from level 7, 3.5% rising to 12%): 2.2x HP, 22% larger, a pulsing gold
#     outline, a crown and a gold health bar; worth 3x gold.
rep("hue:t==='boss'?(rb+20)%360:t==='runner'?(rb+50)%360:t==='brute'?215:rb})}", "hue:t==='boss'?(rb+20)%360:t==='runner'?(rb+50)%360:t==='brute'?215:rb});ckElite(L.en[L.en.length-1])}")
rep("const killGold=e=>e.t==='boss'?400:e.t==='brute'?80:e.fly?50:e.t==='runner'?35:25;",
    "const killGold=e=>(e.t==='boss'?400:e.t==='brute'?80:e.fly?50:e.t==='runner'?35:25)*(e.el?3:1);")
rep("let bw=(bs?1.5:.6)*tw,by=p.y-(bs?1.15:.5)*tw-hov;", "let bw=(bs?1.5:.6)*tw,by=p.y-(bs?1.15*(1+2*(e.rg||0)):.5*(e.el?1.22:1))*tw-hov;")
rep("c.fillStyle=bs?'#ff5b7f':'#8be05a';c.fillRect(p.x-bw/2,by,bw*Math.max(0,e.hp/e.mx),4);",
    "c.fillStyle=bs?'#ff5b7f':e.el?'#ffcf4a':'#8be05a';c.fillRect(p.x-bw/2,by,bw*Math.max(0,e.hp/e.mx),4);if(e.el)c.drawImage(ckCrown(),p.x-tw*.13,by-tw*.22,tw*.26,tw*.2);")
# 16. Death effects: the monster flashes white, squashes and dissolves in place with a few
#     shards in its own colours (bone, slime, embers...). Pooled (max 36), one draw each.
#     Killing a boss triggers a short slow-motion beat and a banner.
rep("vDeath(p,e);snd('death_'", "vDeath(p,e);ckCorpse(e);snd('death_'")
rep("if(e.t==='boss')L.shake=1}}", "if(e.t==='boss'){L.shake=1;if(!L.demo){L.slowT=1.1;window.ckBanner&&ckBanner(lvZ('首领已被击败','Boss defeated'),lvZ('胜利','VICTORY'),0)}}}}")
rep("let sp=S.mode==='play'?(mOpen||L.paused||tab==='s'?0:L.speed):1;", "let sp=S.mode==='play'?(mOpen||L.paused||tab==='s'?0:L.speed):1;if(L.slowT>0&&sp){L.slowT-=dt;sp*=.3}")
rep("for(let i=0;i<_o.length;i++)dEn(_o[i][1])}", "for(let i=0;i<_o.length;i++)dEn(_o[i][1])}ckCorpses();")
# 17. Boss footfalls leave fading ground cracks and dust (bigger while enraged).
rep("e.bt-=dt;if(e.bt<=0&&!(e.wd>0)){e.wd=1;e.bt=e.en?4:6.5}",
    "if(!e.atk&&!(e.fz>0)&&window.CK_Q!==0&&!L.demo){e.stp=(e.stp||0)-dt;if(e.stp<=0){e.stp=e.rage?.3:.6;const sp1=eS(e),rr=tw*(.3+.45*(e.rg||0));vDecal(sp1.x,sp1.y+tw*.32,rr,'rgba(24,14,8,.32)');burst(sp1.x,sp1.y+tw*.32,'#b9a58a',e.rg?6:3,e.rg?90:50)}}"
    "e.bt-=dt;if(e.bt<=0&&!(e.wd>0)){e.wd=1;e.bt=e.en?4:6.5}")
# 18. Effect budget: floating combat text is capped so huge fights stay cheap.
rep("function txt(x,y,s,k){if(!S.dmg)return;", "function txt(x,y,s,k){if(!S.dmg)return;if(L.tx.length>70)L.tx.shift();")
# helpers used above
rep("function ckSummonTick(dt){",
    "const CK_DCOL={e_skeleton:'#efe8d4',e_ghost:'#cdeeff',e_zombie:'#9fdc6a',e_spider:'#b47cff',e_goblin:'#8fdc5a',e_orc:'#86c452',e_ogre:'#d2ad72',e_troll:'#6fa8ff',e_wolf:'#ddd6cc',e_demon:'#ff7040',e_dragon:'#ff8a3a',e_golem:'#bcae98',e_mystic:'#d6a8ff',e_shaman:'#ffd27a',e_assassin:'#c070ff',e_necro:'#9cff9c',e_vampire:'#ff4a6a',e_dknight:'#aab6dc'};\n"
    "function ckElite(e){if(!e||L.demo||e.t==='boss'||L.i<6)return;if(Math.random()>=Math.min(.12,.035+L.i*.0009))return;e.el=1;e.hp*=2.2;e.mx=e.hp}\n"
    "let CK_CROWN=null;function ckCrown(){if(CK_CROWN)return CK_CROWN;const o=document.createElement('canvas');o.width=52;o.height=40;const g=o.getContext('2d');g.lineJoin='round';g.beginPath();g.moveTo(4,34);g.lineTo(2,10);g.lineTo(15,22);g.lineTo(26,4);g.lineTo(37,22);g.lineTo(50,10);g.lineTo(48,34);g.closePath();"
    "const gr=g.createLinearGradient(0,4,0,34);gr.addColorStop(0,'#fff4bf');gr.addColorStop(.5,'#ffcf4a');gr.addColorStop(1,'#b8761a');g.fillStyle=gr;g.fill();g.lineWidth=3;g.strokeStyle='#4a2a06';g.stroke();g.fillStyle='#ff4a6a';g.beginPath();g.arc(26,25,4,0,7);g.fill();return CK_CROWN=o}\n"
    "function ckCorpse(e){if(L.demo||!e._ds)return;const p=eS(e);(L.cps||(L.cps=[])).push({src:e._ds,x:p.x,y:p.y+(e._dy||0),w:e._dw,h:e._dh,f:e._df,t0:TM,b:e.t==='boss',el:e.el});if(L.cps.length>36)L.cps.shift();"
    "if(window.CK_Q!==0){const col=CK_DCOL[e.sp]||`hsl(${e.hue} 70% 62%)`,n=e.t==='boss'?16:e.el?9:5;for(let i=0;i<n;i++){const a=Math.random()*6.283,v=60+Math.random()*130;vp(p.x,p.y-(e._dh||tw)*.35,Math.cos(a)*v,Math.sin(a)*v-90,.5+Math.random()*.35,2+Math.random()*2.4,col,'s',420)}}}\n"
    "function ckCorpses(){const a=L.cps;if(!a||!a.length)return;const pa=c.globalAlpha;for(let i=a.length-1;i>=0;i--){const d=a[i],T=d.b?1.2:.55,ag=TM-d.t0,k=ag/T;if(k>=1||k<0){a.splice(i,1);continue}"
    "const sy=1-.78*k*k,sx=1+.28*k;c.save();c.translate(d.x,d.y);c.scale(d.f?-sx:sx,sy);"
    "if(ag<.09){c.globalAlpha=pa;c.drawImage(ckTint(d.src,'#ffffff'),-d.w/2,-d.h,d.w,d.h)}else{const al=1-k;c.globalAlpha=pa*al*.9;c.drawImage(d.src,-d.w/2,-d.h,d.w,d.h);c.globalCompositeOperation='lighter';c.globalAlpha=pa*al*.55;c.drawImage(ckTint(d.src,d.el?'#ffd24a':d.b?'#ff5030':'#ff8a66'),-d.w/2,-d.h,d.w,d.h);c.globalCompositeOperation='source-over'}"
    "c.restore()}c.globalAlpha=pa}\n"
    "function ckSummonTick(dt){")

# ---------------------------------------------------------------- v2.6/2.7 base health system
# 19. Separate bases: each base has its own health; a leak damages the base it reached;
#     a destroyed base turns to rubble, leaves the pathing and monsters re-route; the level
#     is lost only when every base is destroyed. L.lives stays the total of all bases.
# 20. Scaled health (v2.7): 20 + 2 per realm, x difficulty (+25%, +10%, x1, -15%, -25%),
#     x1.36 split over two bases / x1.5 over three, +1 per commander rank 3/5/7/9.
#     Health stays far below the incoming threat (e.g. Normal Lv96: 57 vs 814).
# 21. Stars use the share of starting health kept (90% / 50%), so they stay meaningful.
# 22. A boss leak costs 38% of the base it reaches instead of a flat 10.
# 23. Base upgrades (tap a base): Fortify (+20% max health), Repair (heals only while the
#     field is clear), Barrier (blocks 1-2 non-boss leaks per wave). They cost battle
#     coins that would otherwise buy towers.
# 24. A perfect wave heals each surviving base by 1, never above its maximum (replaces the
#     old +1 heart every 3 perfect waves).
# 25. Healing scales: potion +25% of starting health, bought heart +5%, Last Stand +10%;
#     the overall cap is 150% of starting health instead of a flat 30.
rep("function leak(e){let d=e.d;e.hp=-1;if(!L.demo){if(!(L.bf.shield>0))L.lives=Math.max(0,L.lives-d.l);",
    "function leak(e){let d=e.d;e.hp=-1;if(!L.demo){ckBaseSync();if(!(L.bf.shield>0))ckBaseHit(e,d.l);")
rep("L.ct-=dt;updAir(dt);", "if(!L.demo){ckBaseSync();ckBaseTick(dt)}L.ct-=dt;updAir(dt);")
rep("drawRiver();dPortal();dBase();", "drawRiver();dPortal();dBase();ckBaseDraw();")
rep("lives:20,", "lives:ckMaxLives(i),mxl:ckMaxLives(i),")
rep("let st=L.lives>=18?3:L.lives>=10?2:1;", "let st=L.lives>=L.mxl*.9?3:L.lives>=L.mxl*.5?2:1;")
rep("(L.lives>=18?3:L.lives>=10?2:1)", "(L.lives>=L.mxl*.9?3:L.lives>=L.mxl*.5?2:1)")
rep("if(L.lives>=20)S.stats.perfect++", "if(L.lives>=L.mxl)S.stats.perfect++")
rep("$('lvw').classList.toggle('low',L.lives<=5)", "$('lvw').classList.toggle('low',L.lives<=Math.max(3,L.mxl*.25))")
rep("L.lives=Math.min(30,L.lives+5)", "L.lives=Math.min(ckCap(),L.lives+ckHeal())")
rep("toast('+5 lives')", "toast('+'+ckHeal()+' ♥')")
rep("Instantly restores 5 lives (up to a maximum of 30).", "Restores 25% of your starting base health (up to 150% of it).")
rep("立即恢复5点生命（上限30）。", "立即恢复初始基地生命的25%（上限为初始的150%）。")
rep("d:'+5 lives. Price rises each buy.'", "d:'+25% base health. Price rises each buy.'")
rep("d:'+5生命，每次购买涨价。'", "d:'+25%基地生命，每次购买涨价。'")
rep("L.lives=Math.min(HMAX,L.lives+n)", "L.lives=Math.min(ckCap(),L.lives+n)")
rep("TL('Hearts ♥ {0}/{1}',L.lives,HMAX)", "TL('Hearts ♥ {0}/{1}',L.lives,ckCap())")
rep("if(L.lives>=HMAX)return toast('Hearts are full');let pr=hPrice();if(!charge(pr))return toast('Not enough coins');L.hb=(L.hb||0)+1;heart(1,'bought')",
    "if(L.lives>=ckCap())return toast('Hearts are full');let pr=hPrice();if(!charge(pr))return toast('Not enough coins');L.hb=(L.hb||0)+1;heart(Math.max(1,Math.round(L.mxl*.05)),'bought')")
rep("L.lives=Math.min(20,L.lives+2)", "L.lives=Math.min(ckCap(),L.lives+Math.max(2,Math.round(L.mxl*.1)))")
rep("if(L.pstreak%3===0)heart(1,'3 perfect waves')", "ckPerfectRepair()")
rep("L.lk=0;if(pf)sfx('perfect',.6);", "L.lk=0;ckBarrierReset();if(pf)sfx('perfect',.6);")
rep("let t=L.tr.find(t=>t.x===q.x&&t.y===q.y);if(t){if(t.building)",
    "{const bb=L.base&&L.base.L===L&&L.base.find(b=>!b.dead&&b.x===q.x&&b.y===q.y);if(bb){ckBasePanel(bb);return}}let t=L.tr.find(t=>t.x===q.x&&t.y===q.y);if(t){if(t.building)")
# ---------------------------------------------------------------- two-base system (v2.7)
# 26. ~30 two-base levels: level 5 (with a one-time explanation), the 3rd and 6th level of
#     realms 2-6, the 3rd, 5th and 7th of realms 7-12, plus the realm-11 and realm-12 boss
#     finales. Other boss levels stay single-base.
# 27. Bases are placed far apart (opposite corners of the defence edge, >= 6 tiles), so the
#     monster routes really split. Levels 98 and 100 (final realm) have three bases.
# 28. Level select marks multi-base levels; a one-time tip explains base upgrades.
rep("M=(m=>(m.open=true,m.routes=[],extraPortals(m,i,r,cols,rows),m))(genMap(i,r,cols,rows))",
    "M=(m=>(m.open=true,m.routes=[],ckGoals(m,i,cols,rows),extraPortals(m,i,r,cols,rows),m))(genMap(i,r,cols,rows))")
rep("style=\"--level-art:url('${levelArt}')\" data-i=\"${i}\" aria-label=\"${TL('Level {0}',i+1)}\">", "style=\"--level-art:url('${levelArt}')\" data-i=\"${i}\" aria-label=\"${TL('Level {0}',i+1)}\">${ckBases(i)>1?`<span class=\"ck-nb\" title=\"${lvZ(ckBases(i)+'座基地',ckBases(i)+' bases')}\">🏰${ckBases(i)}</span>`:''}")
rep("bm=true;toast('Wave 1 arrives in 14s. Build now!')}", "bm=true;toast('Wave 1 arrives in 14s. Build now!');ckTips(i)}")
rep("function ckSummonTick(dt){", (
 "function ckBases(i){if(i>=96)return(i===97||i===99)?3:1;const ri=i/8|0,k=i%8;if(k===7)return(i===87||i===95)?2:1;if(ri===0)return k===4?2:1;return(ri<=5?[2,5]:[2,4,6]).includes(k)?2:1}\n"
 "function ckGoals(m,i,C,Rw){const n=ckBases(i),g=rng(i*104729+71);if(n===1){if(m.goals.length!==1)m.goals=[[C-1,2+(g()*5|0)]]}else if(n===2){m.goals=[[C-1,g()*2|0],[C-1,Rw-1-(g()*2|0)]]}else m.goals=[[C-1,1],[C-1,Rw>>1],[C-1,Rw-2]]}\n"
 "function ckCmdHP(){let lv=1;try{lv=plLevel()}catch(_){}return[3,5,7,9].filter(x=>lv>=x).length}\n"
 "function ckMaxLives(i){const n=ckBases(i),base=20+2*Math.min(12,i/8|0),dm=[1.25,1.1,1,.85,.75][S.dif]??1;return Math.round(base*dm*(n===1?1:n===2?1.36:1.5))+ckCmdHP()}\n"
 "function ckCap(){if(L.base&&L.base.L===L){let t=0;for(const b of L.base)if(!b.dead)t+=Math.round(b.max*1.5);return t}return Math.round((L.mxl||20)*1.5)}\n"
 "function ckHeal(){return Math.max(3,Math.round((L.mxl||20)*.25))}\n"
 "function ckBaseTotal(){let t=0;for(const q of L.base)if(!q.dead)t+=q.hp;L.lives=t}\n"
 "function ckBaseSync(){if(!L.base||L.base.L!==L){const gs=L.goals.slice(),n=gs.length,per=Math.floor(L.lives/n);L.base=gs.map((g,i)=>{const hp=per+(i<L.lives-per*n?1:0);return{x:g[0],y:g[1],hp,max:hp,max0:hp,dead:0,hit:-9,fort:0,rep:0,bar:0,barUsed:0,rt:0}});L.base.L=L}"
 "const al=L.base.filter(b=>!b.dead);if(!al.length)return;let tot=0;for(const b of al)tot+=b.hp;"
 "while(L.lives>tot){let m=null;for(const b of al)if(b.hp<Math.round(b.max*1.5)&&(!m||b.hp<m.hp))m=b;if(!m){L.lives=tot;break}m.hp++;tot++}"
 "while(L.lives<tot){let m=al[0];for(const b of al)if(b.hp>m.hp)m=b;if(m.hp<=0)break;m.hp--;tot--}}\n"
 "function ckBaseHit(e,n){const al=L.base.filter(b=>!b.dead);if(!al.length)return;let b=al[0],bd=1e9;for(const q of al){const dd=Math.hypot(q.x-e.x,q.y-e.y);if(dd<bd){bd=dd;b=q}}"
 "const sp=pp(b.x,b.y);if(e.t!=='boss'&&b.barUsed<b.bar){b.barUsed++;vRing(sp.x,sp.y,tw*1.1,'#8fe8ff',.5,5);vGlow(sp.x,sp.y,tw*1.2,'#8fe8ff',.4);txt(sp.x,sp.y-tw*.6,lvZ('屏障','Barrier'),'#aef2ff');return}"
 "if(e.t==='boss')n=Math.ceil(b.max*.38);b.hp=Math.max(0,b.hp-n);b.hit=TM;if(b.hp<=0){b.dead=1;b.deadT=TM;const rest=L.base.filter(q=>!q.dead);vBoom(sp.x,sp.y,1.6);vFlash('#ff6a3a',.35);L.shake=Math.max(L.shake||0,1);"
 "if(rest.length){const gi=L.goals.findIndex(g=>g[0]===b.x&&g[1]===b.y);if(gi>=0&&L.goals.length>1){L.goals.splice(gi,1);replan()}"
 "toast(lvZ('⚠ 一座基地已被摧毁！守住剩下的基地！','⚠ A base has fallen! Defend the remaining base!'));window.ckBanner&&ckBanner(lvZ('基地沦陷','Base destroyed'),lvZ('死守到底','HOLD THE LINE'),1)}}"
 "ckBaseTotal()}\n"
 "function ckBaseTick(dt){if(!L.base||L.base.L!==L)return;const clear=!L.en.some(e=>e.hp>0);let ch=0;for(const b of L.base){if(b.dead||!b.rep||b.hp>=b.max||!clear){b.rt=0;continue}b.rt+=dt;if(b.rt>=(b.rep>1?2.5:4)){b.rt=0;b.hp++;ch=1;const sp=pp(b.x,b.y);txt(sp.x,sp.y-tw*.5,'+1','#7dffa0')}}if(ch)ckBaseTotal()}\n"
 "function ckPerfectRepair(){if(!L.base||L.base.L!==L)return;let ch=0;for(const b of L.base)if(!b.dead&&b.hp<b.max){b.hp++;ch=1;const sp=pp(b.x,b.y);txt(sp.x,sp.y-tw*.5,'+1 ♥','#7dffa0')}if(ch){ckBaseTotal();toast(lvZ('完美防守：基地 +1 生命','Perfect wave: bases +1 health'))}}\n"
 "function ckBarrierReset(){if(L.base&&L.base.L===L)for(const b of L.base)b.barUsed=0}\n"
 "const CK_UP={fort:{n:['加固','Fortify'],d:['最大生命 +20%','+20% max health'],c:b=>Math.round((240+L.i*9)*(1+b.fort*.65))},rep:{n:['修复','Repair'],d:['场上无敌人时缓慢回复','Heals while the field is clear'],c:b=>Math.round((300+L.i*9)*(1+b.rep*.7))},bar:{n:['屏障','Barrier'],d:['每波抵挡漏怪（首领除外）','Blocks leaks each wave (not bosses)'],c:b=>Math.round((220+L.i*8)*(1+b.bar*.7))}};\n"
 "function ckBasePanel(b){selT=null;const p=$('tp');p._base=b;const z=LANG==='zh'?0:1,row=k=>{const u=CK_UP[k],lv=b[k];return`<div class=\"ck-row\"><span>${u.n[z]} <small>${'◆'.repeat(lv)}${'◇'.repeat(2-lv)}</small></span><em>${u.d[z]}</em></div>`},btn=k=>{const u=CK_UP[k],lv=b[k];return lv>=2?`<button class=\"bt\" disabled>${CK_UP[k].n[z]}<br>MAX</button>`:`<button class=\"bt pay\" data-ba=\"${k}\">${u.n[z]}<br>${COIN}${u.c(b)}</button>`},cmd=ckCmdHP();"
 "p.innerHTML=`<div class=\"tph\"><b class=\"f\">${lvZ('基地','Base')}</b><span>♥ ${b.hp}/${b.max}</span><button class=\"bt g\" data-ba=\"x\" aria-label=\"${TL('Close')}\">✕</button></div><div class=\"ck-bps\">${row('fort')}${row('rep')}${row('bar')}${cmd?`<div class=\"ck-row\"><span>${lvZ('统帅加成','Commander bonus')}</span><em>+${cmd} ♥</em></div>`:''}</div><div class=\"tpa ck-bpa\">${btn('fort')}${btn('rep')}${btn('bar')}</div>`;"
 "p.hidden=false;const q=pp(b.x,b.y),pw=p.offsetWidth||170,ph=p.offsetHeight||140;let l=q.x-tw*.62-pw;if(l<4)l=Math.min(W-pw-4,q.x+tw*.62);const rt=$('rail').offsetHeight;p.style.left=Math.max(4,l)+'px';p.style.top=Math.max(port?48:34,Math.min(H-rt-ph-4,q.y-ph/2))+'px';resetTPIdle()}\n"
 "$('tp').addEventListener('click',e=>{const x=e.target.closest('[data-ba]');if(!x)return;const b=$('tp')._base;if(!b||b.dead||!L.base||L.base.L!==L)return;const k=x.dataset.ba;if(k==='x'){$('tp').hidden=true;return}const u=CK_UP[k];if(!u||b[k]>=2)return;const cost=u.c(b);if(!charge(cost))return toast(TL('Not enough coins'));b[k]++;"
 "if(k==='fort'){const add=Math.max(1,Math.round(b.max0*.2));b.max+=add;b.hp+=add;ckBaseTotal()}const sp=pp(b.x,b.y);vPillar(sp.x,sp.y,k==='bar'?'#8fe8ff':k==='rep'?'#7dffa0':'#ffd34a',.8);vRing(sp.x,sp.y,tw*.9,'#ffe9a0',.5,4);sfx('upgrade')||beep(700,.15,'triangle',.07);ckBasePanel(b)});\n"
 "function ckTips(i){if(L.demo)return;if(ckBases(i)>1&&!S.tip2b){S.tip2b=1;save();setTimeout(()=>{if(S.mode==='play'&&!L.over)modal(`<h3>🏰 ${lvZ('多座基地','Multiple bases')}</h3><p>${lvZ('这一关有'+ckBases(i)+'座基地，每座都有独立的生命值。只有当所有基地都被摧毁时才会失败——失去一座还能坚持，但剩下的怪物会全部涌向其余基地！','This level has '+ckBases(i)+' bases, each with its own health. You only lose when every base is destroyed. Losing one is survivable, but every remaining monster will then march on the bases left!')}</p><p>${lvZ('点击基地可以加固、修复或架设屏障。','Tap a base to Fortify, Repair or raise a Barrier.')}</p><button class=\"bt\" id=\"m1\">${lvZ('明白','Got it')}</button>`)},500)}"
 "else if(i>=2&&!S.tipbu){S.tipbu=1;save();setTimeout(()=>{if(S.mode==='play'&&!L.over)modal(`<h3>🛡 ${lvZ('基地升级','Base upgrades')}</h3><p>${lvZ('点击你的基地：加固（最大生命 +20%）、修复（场上无敌人时回血）、屏障（每波抵挡漏怪）。金币有限，好好权衡！','Tap your base: Fortify (+20% max health), Repair (heals while the field is clear), Barrier (blocks leaks each wave). Coins are tight, so choose wisely!')}</p><button class=\"bt\" id=\"m1\">${lvZ('明白','Got it')}</button>`)},500)}}\n"
 "function ckBaseDraw(){if(L.demo||!L.base||L.base.L!==L)return;const multi=L.base.length>1;for(const b of L.base){const p=pp(b.x,b.y),u=tw/100;"
 "if(b.dead){ell(p.x,p.y+tw*.3,tw*.6,tw*.22,'#120a08cc');ell(p.x,p.y+tw*.25,tw*.42,tw*.15,'#2a1a14');ell(p.x-tw*.2,p.y+tw*.18,tw*.13,tw*.08,'#5a5068');ell(p.x+tw*.18,p.y+tw*.22,tw*.11,tw*.07,'#4a4258');ell(p.x+tw*.02,p.y+tw*.08,tw*.15,tw*.09,'#6a6078');ell(p.x-tw*.05,p.y+tw*.02,tw*.07,tw*.05,'#3fbfb0');"
 "for(let i=0;i<3;i++){const ph=(TM*.5+i/3)%1;c.globalAlpha=(1-ph)*.5;circ(p.x+Math.sin(i*2.1+TM)*tw*.15,p.y+tw*.1-ph*tw*.9,tw*(.08+.12*ph),'#3a3440')}"
 "c.globalAlpha=.6+.4*Math.sin(TM*9+b.x);circ(p.x-tw*.1,p.y+tw*.22,tw*.05,'#ff7a2a');circ(p.x+tw*.12,p.y+tw*.26,tw*.04,'#ffb04a');c.globalAlpha=1;continue}"
 "if(b.bar>b.barUsed){c.globalAlpha=.35+.15*Math.sin(TM*3+b.y);c.strokeStyle='#8fe8ff';c.lineWidth=2.2*u+.6;c.beginPath();c.ellipse(p.x,p.y+tw*.1,tw*.72,tw*.62,0,Math.PI*1.05,Math.PI*1.95);c.stroke();c.globalAlpha=1}"
 "for(let i=0;i<b.fort;i++)circ(p.x-tw*.12+i*tw*.24,p.y+tw*.5,tw*.05,'#ffd34a');"
 "if(!multi)continue;const mx=Math.max(1,b.max);const w=tw*.82,h=Math.max(5,tw*.11),x=p.x-w/2,up=p.y>H*.5,y=up?p.y-tw*1.05:p.y+tw*.62,f=Math.min(1,b.hp/mx),hf=TM-b.hit<.4;"
 "c.fillStyle='#07101dd9';c.fillRect(x-2,y-2,w+4,h+4);c.fillStyle=hf?'#ffffff':f>.5?'#5eead4':f>.25?'#ffbd3f':'#ff4e58';c.fillRect(x,y,w*f,h);"
 "c.font=`900 ${Math.max(10,tw*.2)}px Nunito`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#07101d';const s='♥ '+b.hp;const ty=up?y-tw*.06:y+h+tw*.2;c.strokeText(s,p.x,ty);c.fillStyle=hf?'#ff8a8a':'#e8fffb';c.fillText(s,p.x,ty)}}\n"
 "function ckSummonTick(dt){"))

# ---------------------------------------------------------------- v2.7.1 HUD fit
# 29. Top bar overflow: every item had a fixed width, so a longer level label
#     ("Lv 96 · Boss", Chinese text) or a big coin total pushed the last buttons off
#     screen. The label is now short ("Lv 96 👑", boss + realm on the second line), the
#     label block shrinks with an ellipsis, large coin totals are compact (123K / 1.2M),
#     and a fit step tightens the bar if it would still overflow.
rep("function setLn(){if(!L)return;$('ln').textContent=TL('Lv {0}',L.i+1)+(L.boss?' · '+TL('Boss'):'');$('lr').textContent=R[L.i/8|0].n}",
    "function setLn(){if(!L)return;$('ln').textContent=TL('Lv {0}',L.i+1)+(L.boss?' 👑':'');$('lr').textContent=(L.boss?TL('Boss')+' · ':'')+R[L.i/8|0].n;window.ckFitTop&&ckFitTop()}")
rep("setT('coin',Economy.display(Economy.battleBalance()));",
    "setT('coin',ckCoinFmt(Economy.battleBalance()));")
rep("function ckSummonTick(dt){",
    "function ckCoinFmt(n){const d=Economy.display(n);if(typeof n!=='number'||!isFinite(n)||/[^0-9,.\\s]/.test(String(d)))return d;return n>=1e7?Math.floor(n/1e6)+'M':n>=1e6?(Math.floor(n/1e5)/10)+'M':n>=1e5?Math.floor(n/1e3)+'K':d}\n"
    "function ckSummonTick(dt){")

# ---------------------------------------------------------------- v3.0 strategic depth
# 32. Enemy roles (armoured, warded, healer, shield-bearer, splitter, disruptor) with three
#     damage types (physical / magic / elemental, resistances capped at 50%), designed
#     deterministic waves with a next-wave preview, visible tower combos (Shatter, Marked,
#     Arcane Break), shrines and portal corruption, boss weaknesses
#     and adaptation, and an optional crown challenge per level.
rep("function ckSummonTick(dt){", open(os.path.join(SRC,'v3.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'loot.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'chest.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'v44.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'v5.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'a55.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'v551.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'v56.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'v58.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'v59.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'v60.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'v61.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'v62.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'v63.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'v64.js'),encoding='utf8').read()+"\nfunction ckSummonTick(dt){")
rep("ckElite(L.en[L.en.length-1])}", "ckElite(L.en[L.en.length-1]);ckRole(L.en[L.en.length-1])}")
rep("let t=L.q.shift();spawn(t);", "let t=L.q.shift();CK_NR=null;if(t.indexOf('|')>0){const _a=t.split('|');t=_a[0];CK_NR=_a[1]}spawn(t);CK_NR=null;")
rep("function mkWave(w){", "function mkWave(w){if(!L.demo){let _q=ckWave(w);if(_q)return _q}")
rep("function hurt(e,d,k,src){if(e.hp<=0||e.pro>0)return;d=d/(e.t==='boss'?BOSS_DEF_MULT:DEF_MULT);",
    "function hurt(e,d,k,src){if(e.hp<=0||e.pro>0)return;d=d/(e.t==='boss'?BOSS_DEF_MULT:DEF_MULT);d=ckRes(e,d,src);if(!(d>0))return;")
rep("if(e.hp<=0){L.kills++;", "if(e.hp<=0){ckOnDeath(e);L.kills++;")
rep("let d=TW[t.k],m=br===1?", "let d=TW[t.k],tf=ckTerr(t),m=br===1?")
rep("*(L&&L.bf&&L.bf.horn>0?1.35:1),rt:", "*(L&&L.bf&&L.bf.horn>0?1.35:1)*tf[0],rt:")
rep("rg:d.rg*(1+.06*(lv-1))*m[2]*(1+(bf.reach||0))}}", "rg:d.rg*(1+.06*(lv-1))*m[2]*(1+(bf.reach||0))*tf[1]}}")
rep("L.tr.slice().sort((a,b)=>a.y-b.y).forEach(dTw);", "ckV3Ground();L.tr.slice().sort((a,b)=>a.y-b.y).forEach(dTw);")
rep("c.fillStyle='#0a0f24';c.fillRect(p.x-bw/2-1,by-1,bw+2,6);", "if(e.rl||e.bw||e.mk>0||e.sh>0)ckRoleBadge(e,p,bw,by);c.fillStyle='#0a0f24';c.fillRect(p.x-bw/2-1,by-1,bw+2,6);")
rep("L.bf.ovc=Math.max(0,L.bf.ovc-dt);", "ckV3Tick(dt);L.bf.ovc=Math.max(0,L.bf.ovc-dt);")
rep("L.inv[id]--;L.cdn[id]=CDT[id];", "L.inv[id]--;ckIU(id);L.cdn[id]=CDT[id];")
for _k in ('river','air','bomb'):
    rep(f"L.inv.{_k}--;", f"L.inv.{_k}--;ckIU('{_k}');")
rep("if(win){S.prog[L.i]=", "if(win){ckCrownEval();S.prog[L.i]=")
rep("${rewardPanel(st,pg)}", "${rewardPanel(st,pg)}${ckCrownHtml()}")
# 33. Bosses always have a sprite: spk() resolves the boss key through ckBossKey (fixes the
#     invisible Level 80 boss; see the sprite repairs at the end of v3.js).
rep("if(t==='boss')return BOSSK[L.i>=96?13+(L.i-96):ri]||'b_necromancer';", "if(t==='boss')return ckBossKey(BOSSK[L.i>=96?13+(L.i-96):ri]||'b_necromancer');")

# ---------------------------------------------------------------- v2.8 (pilot) towers
# Disabled until the tower pilot / Master tier is approved for release.
INCLUDE_TOWER_PILOT = False
if INCLUDE_TOWER_PILOT:
 # 30. Heavy / Rapid branches removed: level 4 is one "Master" tier for every tower
 #     (damage x1.15, reload x0.9, range x1.08: about the average power of the old picks).
 rep("let d=TW[t.k],m=br===1?[1.5,1.25,1.15]:br===2?[.8,.6,1]:[1,1,1]", "let d=TW[t.k],m=lv>=4?[1.15,.9,1.08]:[1,1,1]")
 rep("(t.lv<3?`<button class=\"bt pay\" data-a=\"u\" data-b=\"0\">${TL('Upgrade')}<br>${cs}</button>`:t.lv===3?",
     "(t.lv<4?`<button class=\"bt pay\" data-a=\"u\" data-b=\"0\">${TL('Upgrade')}<br>${cs}</button>`:false?")
 rep("(t.lv===3&&!w?`<button class=\"bt pay sup\" data-a=\"ua\" data-b=\"1\">", "(false?`<button class=\"bt pay sup\" data-a=\"ua\" data-b=\"1\">")
 rep("${t.lv===3&&!w?'<small class=\"tpn\">'+TL('Level 4: choose a branch')+'</small>':''}", "${t.lv===3&&!w?'<small class=\"tpn\">'+lvZ('下一级：4级大师','Next: Level 4 Master')+'</small>':''}")
 rep("${t.br?' · '+TL(t.br===1?'Heavy':'Rapid'):''}", "${t.lv>=4&&!w?' · '+lvZ('大师','Master'):''}")
 rep("selT.lv<(w?6:3)?upg(selT):toast(selT.lv===3&&!w?'Pick Heavy or Rapid in the panel':'Max level')", "selT.lv<(w?6:4)?upg(selT):toast('Max level')")
 #     Towers without a new model keep their old level-4 look.
 rep("const spr=towerSpr(k,lv,br,a);", "const spr=towerSpr(k,lv,lv>3?(br||1):br,a);")
 #     The tower panel stays up 3 s instead of 1.5 s.
 rep("},1500)}", "},3000)}")
 # 31. CK3D tower renderer (pilot: Cannon and Holy). Real 3D meshes with a static base and
 #     an independently rotating turret (64 facings, cached), recoil, and a true muzzle
 #     point used by projectiles and muzzle flashes. Build-menu paintings are unchanged.
 rep("function tower(k,lv,p,u,a,rc,stun,br){\n if(k==='wall'){dWallT(lv,p,u,rc);return}",
     "function tower(k,lv,p,u,a,rc,stun,br){\n if(k==='wall'){dWallT(lv,p,u,rc);return}\n if(window.CK3D&&CK3D.has(k)){CK3D.draw(c,k,lv,p,u,a,rc,stun,TM);return}")
 rep("let d=TW[t.k],u=tw/100,p=pp(t.x,t.y),fx=p.x+Math.cos(t.a)*24*u,fy=p.y-20*u+Math.sin(t.a)*12*u,dm=",
     "let d=TW[t.k],u=tw/100,p=pp(t.x,t.y),mz=ckMuzzle(t,p,u),fx=mz[0],fy=mz[1],dm=")
 rep("function vMuzzle(t,e){let u=tw/100,p=pp(t.x,t.y),fx=p.x+Math.cos(t.a)*24*u,fy=p.y-20*u+Math.sin(t.a)*12*u,",
     "function ckMuzzle(t,p,u){return window.CK3D&&CK3D.has(t.k)?CK3D.muzzle(t,p,u):[p.x+Math.cos(t.a)*24*u,p.y-20*u+Math.sin(t.a)*12*u]}\nfunction vMuzzle(t,e){let u=tw/100,p=pp(t.x,t.y),mz=ckMuzzle(t,p,u),fx=mz[0],fy=mz[1],")
 rep("<script>const SFXD=", "<script id=\"ck-3d\">\n"+open(os.path.join(SRC,'ck3d.js'),encoding='utf8').read()+"</script>\n<script>const SFXD=")

# 34. Item bar: use an item on tap, not on touch-down, so swiping the bar no longer fires items.
rep("$('inv').addEventListener('pointerdown',ev=>{\n const b=ev.target&&ev.target.closest?ev.target.closest('button[data-use]'):null;\n if(!b)return;\n ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();\n useItem(b.dataset.use);\n},{passive:false});\n$('inv').addEventListener('click',ev=>{\n const b=ev.target&&ev.target.closest?ev.target.closest('button[data-use]'):null;\n if(!b)return;\n ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();\n});\n",
    "/* Item bar input (v3.3): an item is used on a TAP, not on touch-down, so the bar can be swiped.\n   A tap = finger lifts on the same item, moved under 10 px, and the bar did not scroll. If the\n   browser takes the touch over as a swipe it sends pointercancel, which also cancels the tap.\n   Activation still runs from pointer events (not click), because some Android WebViews can\n   drop the synthesized click; a keyboard click (detail 0) also works. */\n(()=>{const inv=$('inv'),TAP=10,itemAt=ev=>ev.target&&ev.target.closest?ev.target.closest('button[data-use]'):null;let tp=null,lastUse=0;\n const use=id=>{lastUse=performance.now();useItem(id)};\n inv.addEventListener('pointerdown',ev=>{const b=itemAt(ev);tp=(!b||(ev.pointerType==='mouse'&&ev.button!==0))?null:{id:ev.pointerId,use:b.dataset.use,x:ev.clientX,y:ev.clientY,sl:inv.scrollLeft}},{passive:true});\n inv.addEventListener('pointermove',ev=>{if(tp&&ev.pointerId===tp.id&&Math.hypot(ev.clientX-tp.x,ev.clientY-tp.y)>TAP)tp=null},{passive:true});\n inv.addEventListener('scroll',()=>{if(tp&&Math.abs(inv.scrollLeft-tp.sl)>2)tp=null},{passive:true});\n inv.addEventListener('pointercancel',()=>{tp=null});\n inv.addEventListener('pointerup',ev=>{const t=tp;tp=null;if(!t||ev.pointerId!==t.id)return;if(Math.hypot(ev.clientX-t.x,ev.clientY-t.y)>TAP||Math.abs(inv.scrollLeft-t.sl)>2)return;\n  // the bar may have re-rendered during the press; match the item by id, and only if the finger is still on it\n  const r=document.elementFromPoint(ev.clientX,ev.clientY),b=r&&r.closest?r.closest('button[data-use]'):null;if(!b||b.dataset.use!==t.use)return;\n  ev.preventDefault();use(t.use)});\n inv.addEventListener('click',ev=>{const b=itemAt(ev);if(!b)return;ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();\n  if(ev.detail===0&&performance.now()-lastUse>600)use(b.dataset.use)});\n})();\n")

# 35. New boss art (v3.4): 19 illustrated bosses supplied by the owner (source-sheet-transparent.png,
#     plus the Lich King from source-sheet.png), embedded as WebP. Each boss level gets the
#     best-matching portrait; on two-boss levels the second boss is a random different portrait.
_bd = os.path.join(SRC, 'bosses')
_b2 = {f[:-5]: _recode(os.path.join(_bd, f), 240, 82)
       for f in sorted(os.listdir(_bd)) if f.startswith('b2_') and f.endswith('.webp')}
assert len(_b2) == 19, sorted(_b2)
rep("const SP={};for(const k in SPRD){",
    "Object.assign(SPRD,{" + ",".join(f"{k}:'data:image/webp;base64,{v}'" for k, v in _b2.items()) + "});const SP={};for(const k in SPRD){")
rep("BOSSK=['b_skeleton_king','b_demon_lord','b_ice_dragon','b_fire_giant','e_dragon','b_necromancer','b_ice_dragon','b_necromancer','b_ice_dragon','e_treant','b_necromancer','b_fire_giant','b_necromancer','b_ice_dragon','e_dragon','b_demon_lord','b_skeleton_king']",
    "BOSSK=['b2_skeleton_king','b2_demon_lord','b2_ice_dragon','b2_fire_giant','b2_dragon_king','b2_necromancer','b2_lich_king','b2_spider_queen','b2_storm_titan','b2_forest_ent','b2_stone_golem','b2_demon_beast','b2_death_knight','b2_void_lord','b2_giant_worm','b2_death_knight','b2_sea_monster']")
# the new portraits are landscape-shaped; scale them so they keep a boss-sized presence
rep("s=sz/Math.max(iw,ih)*(e.wd>0?1.1:1)",
    "s=(e.sp.startsWith('b2_')?Math.min(sz*1.3/Math.max(iw,ih),sz*1.05/ih):sz/Math.max(iw,ih))*(e.wd>0?1.1:1)")

# 36. v3.5 fixes.
#   a) One boss per enemy base: a boss wave sends as many bosses as the level has portals (1-4);
#      each boss's reinforcement summon is shared out so the total stays as designed.
rep("q.push('boss');if(L.portals&&L.portals.length>=2)q.push('boss');",
    "L.nBoss=Math.max(1,(L.portals&&L.portals.length)||1);for(let k=0;k<L.nBoss;k++)q.push('boss');")
rep("n=Math.max(8,Math.round(n/((L.boss&&L.i>=39)?2:1)));", "n=Math.max(8,Math.round(n/Math.max(1,L.nBoss||1)));")
#   b) Bosses ignore buildings: they take a direct line to the nearest base like flying monsters,
#      never stop to attack towers, and can cross water.
rep("if(e.fly){let g=L.goals.reduce(", "if(e.fly||(e.t==='boss'&&!L.demo)){let g=L.goals.reduce(")
rep("let mx=e.vv[0]*dt,my=e.vv[1]*dt;if(!e.fly){const blocked=", "let mx=e.vv[0]*dt,my=e.vv[1]*dt;if(!e.fly&&e.t!=='boss'){const blocked=")
#   c) Rage Mode lasts 8 s: the boss swells to 3x size and stampedes freely around the whole map,
#      trampling towers, then calms down and resumes its normal march (see ckRage in v3.js).
rep("if(e.rage){e.rgT=(e.rgT||0)+dt;{const rt=e.rgT,ss=x=>x*x*(3-2*x);e.rg=rt<.35?ss(rt/.35):rt<2.65?1:rt<3?ss((3-rt)/.35):0;if(rt>=.35&&rt-dt<.35){const sp2=eS(e);vRing(sp2.x,sp2.y,tw*3.2,'#ff4a3a',.6,8);vGlow(sp2.x,sp2.y,tw*2.4,'#ff3a2a',.5);L.shake=Math.max(L.shake||0,1)}}const c0=e.chg%2.2<1.3;e.chg=(e.chg||0)+dt;const c1=e.chg%2.2<1.3;if(c1&&!c0)e.smash=[];if(c1){e.dust=(e.dust||0)-dt;if(e.dust<=0){e.dust=.07;const sp0=eS(e);burst(sp0.x,sp0.y+tw*.3,'#ff6a3a',3,70)}for(const t of L.tr){if(t.building||t.hp<=0||e.smash.includes(t))continue;if(Math.hypot(t.x-e.x,t.y-e.y)<.8){e.smash.push(t);dmgTower(t,(EATK.boss||100)*.6*(1+L.i*.06)*1.15);const tp=pp(t.x,t.y);burst(tp.x,tp.y,'#ff8a5a',12,140);L.shake=Math.max(L.shake||0,.35)}}}}}", "if(e.rage){if(ckRage(e,dt))return}}")
rep("toast(lvZ('⚠ 首领狂暴！体型变大、高速冲撞、攻击力 +15%','⚠ The boss is ENRAGED! Bigger, charging, +15% attack'))",
    "toast(lvZ('⚠ 首领狂暴 8 秒！体型暴涨，满地图横冲直撞','⚠ The boss is ENRAGED for 8 s! It swells and stampedes across the map'))")
#   d) "Clear All Natural Obstacles" also removes swamps, and the cached ground is redrawn so the
#      change shows (and the tiles can be built on) at once, also when bought mid-battle.
rep("function fxClearObs(redraw){if(!L)return;L.g.forEach(q=>{q.ob=0;q.ot=null});",
    "function fxClearObs(redraw){if(!L)return;L.g.forEach(q=>{q.ob=0;q.ot=null;q.sw=0});L.gc=null;")
#   e) Treasure "No Item Cooldowns" (effect 19) is a permanent upgrade like the other treasures: items
#      never go on cooldown again, starting immediately (it used to clear only the running timers).
rep("const FXKEYS=['atk','atk5','crit','crit5','def','inv','build','unlock','clear','infight'];",
    "const FXKEYS=['atk','atk5','crit','crit5','def','inv','build','unlock','clear','infight','nocd'];")
rep("17:['clear',0],18:['infight',0]};", "17:['clear',0],18:['infight',0],19:['nocd',0]};")

rep("L.inv[id]--;ckIU(id);L.cdn[id]=CDT[id];", "L.inv[id]--;ckIU(id);L.cdn[id]=FXon('nocd')?0:CDT[id];")
for _k in ('river','air','bomb'):
    rep(f"L.cdn.{_k}=CDT.{_k};", f"L.cdn.{_k}=FXon('nocd')?0:CDT.{_k};")
rep("${TL(' · Cooldown {0}s',CDT[it.id])}", "${FXon('nocd')?lvZ(' · 无冷却',' · No cooldown'):TL(' · Cooldown {0}s',CDT[it.id])}")
rep("""  if(id===19){
    if(!inBattle)return {ok:false,msg:Z('请在战斗中（暂停菜单）使用此兑换码，当前兑换码未消耗','Use this code during a battle (pause menu). Your code was not used.')};
    for(const k in L.cdn)L.cdn[k]=0;
    refresh();return {ok:true,msg:Z('兑换成功：所有道具冷却已归零','Redeemed: all item cooldowns reset')};
  }
""", "")
rep("  if(id===17&&inBattle)fxClearObs(true);\n", "  if(id===17&&inBattle)fxClearObs(true);\n  if(id===19&&inBattle)for(const k in L.cdn)L.cdn[k]=0;\n")
rep("{id:19,g:'btl',ic:'⏱️',zh:'所有道具冷却时间归0',en:'Reset All Item Cooldowns'}", "{id:19,g:'btl',ic:'⏱️',zh:'所有道具永久无冷却',en:'No Item Cooldowns'}")

# 37. v3.6: late-game boss power, the new audio engine (audio.js) and the Level 100 ending (ending.js).
rep("function ckSummonTick(dt){", open(os.path.join(SRC,'audio.js'),encoding='utf8').read()+"\n"+open(os.path.join(SRC,'ending.js'),encoding='utf8').read()+"\nfunction ckSummonTick(dt){")
# monster voices: hit and death sounds per monster type (falls back to the old synth if sound is off)
rep("if(!e.vocalCd||e.vocalCd<=0){snd('hit_'+(e.t||'grunt'),.34);", "if(!e.vocalCd||e.vocalCd<=0){if(!CKS.hurt(e))snd('hit_'+(e.t||'grunt'),.34);")
rep("snd('death_'+(e.t||'grunt'),e.t==='boss'?.9:.62);sfx(e.t==='boss'?'boss':'death',.32)||beep(e.t==='boss'?80:520,.12,'square',.05);",
    "if(!CKS.die(e)){snd('death_'+(e.t||'grunt'),e.t==='boss'?.9:.62);sfx(e.t==='boss'?'boss':'death',.32)||beep(e.t==='boss'?80:520,.12,'square',.05)}")
# boss stomp: signature attack sound; reach and stun grow with the boss's attack power
rep("if(Math.hypot(t.x-q[0],t.y-q[1])<2.6){t.st=2.5;", "if(Math.hypot(t.x-q[0],t.y-q[1])<2.6*(1+.25*((e.batk||1)-1))){t.st=Math.min(4.5,2.5*(e.batk||1));")
rep("sfx('stomp')||beep(70,.4,'sawtooth',.1);toast('Stomp! Nearby towers are stunned')", "CKS.bossAttack(e)||sfx('stomp')||beep(70,.4,'sawtooth',.1);toast('Stomp! Nearby towers are stunned')")
# a boss that reaches a base takes more lives on late levels
rep("if(!(L.bf.shield>0))ckBaseHit(e,d.l);", "if(!(L.bf.shield>0))ckBaseHit(e,e.t==='boss'?Math.round(d.l*(e.batk||1)):d.l);")
# varied sampled effects (tower shots etc.): wider pitch/volume spread and a little stereo movement
rep("s.playbackRate.value=.95+Math.random()*.1;g.gain.value=v*sfxV;s.connect(g);g.connect(sg);s.start();return true}",
    "s.playbackRate.value=.88+Math.random()*.24;g.gain.value=v*sfxV*(.8+Math.random()*.2);s.connect(g);ckPanOut(g);s.start();return true}")
# boss level won: fanfare; Level 100 won: the ending sequence
rep("function end(win){L.over=true;sfx(win?'win':'lose');", "function end(win){L.over=true;sfx(win?'win':'lose');if(win&&!L.demo&&L.boss)setTimeout(()=>{try{CKS.fanfare()}catch(_){}},650);if(win)ckEndingQueue();")
# remember the hardest difficulty Level 100 was beaten on
rep("fx:S.fx||{}}))", "fx:S.fx||{},h100:S.h100|0}))")
rep("S.fx=fxClean(s.fx);", "S.fx=fxClean(s.fx);S.h100=Math.max(0,Math.min(5,s.h100|0));")

# 38. v3.7: new high-resolution monster art (source/premium/monsters, from the owner's sheet) and a new
#     Lich King; Rage Mode can no longer be skipped; the new soundtrack composer (music.js).
_md = os.path.join(SRC, 'monsters')
_mo = {f[:-5]: _recode(os.path.join(_md, f), 144)
       for f in sorted(os.listdir(_md)) if f.startswith('e_') and f.endswith('.webp')}
assert len(_mo) == 18, sorted(_mo)
rep("});const SP={};for(const k in SPRD){",
    "});Object.assign(SPRD,{" + ",".join(f"{k}:'data:image/webp;base64,{v}'" for k, v in _mo.items()) + "});const SP={};for(const k in SPRD){")
# the old procedural troll/demon drawings must not override the new art
rep("for(const k in R){const i=new Image();i.src=R[k];SP[k]=i}})();", "for(const k in R){if(/^e_/.test(k)&&SPRD[k]&&SPRD[k].startsWith('data:image/webp'))continue;const i=new Image();i.src=R[k];SP[k]=i}})();")
rep("SP.e_troll=mon(", "SP._legacy_troll=mon(")
rep("SP.e_demon=mon(", "SP._legacy_demon=mon(")
# facing: the new monsters face the viewer; only the wolf and dragon are drawn looking left
rep("NAT={e_wolf:-1,e_dragon:-1,b_ice_dragon:-1,e_goblin:-1,e_skeleton:-1,e_zombie:-1,e_assassin:-1,e_mystic:-1,e_shaman:-1,e_orc:-1,b_skeleton_king:1,e_necro:1}",
    "NAT={e_wolf:-1,e_dragon:-1}")
# Rage Mode always happens: from Level 40 a boss cannot drop below 19% HP until it has enraged,
# and cannot be finished off (3% floor) until its 8-second rampage is over
rep("if(e.t==='boss'&&!L.demo&&L.i>=32){if(!e.m50&&e.hp<e.mx*.5)e.hp=e.mx*.5;else if(!e.m25&&e.hp<e.mx*.25)e.hp=e.mx*.25}",
    "if(e.t==='boss'&&!L.demo&&L.i>=32){if(!e.m50&&e.hp<e.mx*.5)e.hp=e.mx*.5;else if(!e.m25&&e.hp<e.mx*.25)e.hp=e.mx*.25;else if(L.i>=39&&!e.s2&&e.hp<e.mx*.19)e.hp=e.mx*.19;else if(e.rage&&(e.rgT||0)<CK_RAGE_T&&e.hp<e.mx*.03)e.hp=e.mx*.03}")
# soundtrack: the new composer, with the original one kept as a fallback
_mcore = open(os.path.join(SRC,'music_core.js'),encoding='utf8').read()
rep("async function song(key){", "const CK_MUSIC_SRC=" + __import__('json').dumps(_mcore) + ";\n" + _mcore + "\n" + open(os.path.join(SRC,'music.js'),encoding='utf8').read()+"\nfunction song(key){return ckSong(key).catch(e=>{if(e==='superseded')throw e;console.warn('ckSong',e);return songV2(key)})}\nasync function songV2(key){")

# 39. v3.8: bosses besiege a base instead of vanishing on contact (that skipped Rage Mode too);
#     quieter UI/gameplay effects so the music leads.
rep("let dx=g[0]-e.x,dy=g[1]-e.y,dl=Math.hypot(dx,dy)||1;steer(e,dx/dl,dy/dl,sp,dt);e.pr=-dl;if(dl<.3)leak(e);return}",
    "let dx=g[0]-e.x,dy=g[1]-e.y,dl=Math.hypot(dx,dy)||1;if(e.t==='boss'&&!L.demo&&dl<.75){e.pr=-dl;faceTo(e,dx,dy,dt);ckBossSiege(e,dt);return}steer(e,dx/dl,dy/dl,sp,dt);e.pr=-dl;if(dl<.3)leak(e);return}")
# mix: effects bus at 55%, music up; UI blips quieter still; beeps go through the effects bus
rep("sg=au.createGain();sg.connect(mg);", "sg=au.createGain();sg.gain.value=.55;sg.connect(mg);")
rep("mb.gain.setTargetAtTime(.6*musV,au.currentTime,.05);au.resume();", "mb.gain.setTargetAtTime(.85*musV,au.currentTime,.05);au.resume();")
rep("if(i==='vm'){musV=v;if(mb&&mon)mb.gain.setTargetAtTime(.6*v,au.currentTime,.05)}", "if(i==='vm'){musV=v;if(mb&&mon)mb.gain.setTargetAtTime(.85*v,au.currentTime,.05)}")
rep("g.gain.value=v*sfxV*(.8+Math.random()*.2);", "g.gain.value=v*sfxV*(.8+Math.random()*.2)*(CK_SFXQ[k]||1);")
rep("o.connect(g);g.connect(mg);o.start();o.stop(t+d)}", "o.connect(g);g.connect(sg||mg);o.start();o.stop(t+d)}")
rep("let t=au.currentTime,d=sg||mg||au.destination,V=v*sfxV", "let t=au.currentTime,d=sg||mg||au.destination,V=v*sfxV*.7")
rep("let sg,ag,am=null,", "const CK_SFXQ={build:.3,upgrade:.35,sell:.35,coin:.3,bank:.35,perfect:.5,wave:.55,arrow:.6,cannon:.7,ice:.6,zap:.6,toxin:.6,leak:.6};let sg,ag,am=null,")

# 40. v3.9: no automatic pop-ups when a level starts (they paused the game and could leave it stuck);
#     the information lives in an on-demand, level-specific Tips panel instead (see v3.js).
rep("toast('Wave 1 arrives in 14s. Build now!');ckTips(i)}", "toast('Wave 1 arrives in 14s. Build now!')}")
rep('<button class="tab" data-t="s" data-i18n="Shop">Shop</button>', '<button class="tab" data-t="s" data-i18n="Shop">Shop</button><button class="tab ck-tipt" type="button" data-cktips="1" aria-label="Tips" title="Tips">💡</button>')

# 41. v4.1: loot. Final-boss treasure explosion with a 5 s manual collection window, medium monster
#     drops, rare items (never sold), enhancement runes, diamond fragments (4 -> 1 diamond) and a
#     1 diamond = 10,000 gold exchange. See loot.js.
rep("if(L.wave>=L.waves&&!L.q.length&&!L.en.length&&!L.over)end(true)", "if(L.wave>=L.waves&&!L.q.length&&!L.en.length&&!L.over&&!ckLootBusy())end(true)")
rep("let q=tileAt(...pos(ev));hov=q;if(!q){L.placing=null;showSel(null);return}", "let q=tileAt(...pos(ev));hov=q;if(!q){L.placing=null;showSel(null);return}if(ckLootTap(q))return;")
rep("drawFx();dAir();", "drawFx();dAir();ckLootDraw();")
rep("L.refund=win&&!L.demo?L.tr.reduce(", "L.refund=win&&!L.demo?(L.trSnap||L.tr).reduce(")
rep("*(L.bf.idol>0?2:1)*(1+(L.buffs&&L.buffs.bounty||0))", "*(L.bf.idol>0?2:1)*(L.bf.midas>0?3:1)*(1+(L.buffs&&L.buffs.bounty||0))")
rep("IT.map(it=>{let lim=it.stock!=null", "IT.filter(it=>!it.rare).map(it=>{let lim=it.stock!=null")
rep("function useItem(id){let it=IT.find(x=>x.id===id);if(!it||!(L.inv[id]>0)||L.over)return;", "function useItem(id){let it=IT.find(x=>x.id===id);if(!it||!(L.inv[id]>0)||L.over)return;if(CK_RARE[id])return ckUseRare(id);")
rep("setT('dia',(S.diamonds||0).toLocaleString());", "setT('dia',(S.diamonds||0).toLocaleString());{const f=$('ckfr');if(f){const v=(S.frag|0)?'<img src=\"'+CKA.frag+'\" alt=\"\">'+S.frag+'/4':'';if(f._v!==v){f._v=v;f.innerHTML=v}}}")
# saves: fragments and runes (fragments, like diamonds, are not part of progress transfer; runes are)
rep("fx:S.fx||{},h100:S.h100|0}))", "fx:S.fx||{},h100:S.h100|0,fr:S.frag|0,ru:S.rune|0}))")
rep("S.h100=Math.max(0,Math.min(5,s.h100|0));", "S.h100=Math.max(0,Math.min(5,s.h100|0));S.frag=Math.max(0,Math.min(3,s.fr|0));S.rune=Math.max(0,s.ru|0);")
rep("if(S.own&&S.own!==S.name){S.gold=3000;S.diamonds=0;", "if(S.own&&S.own!==S.name){S.gold=3000;S.diamonds=0;S.frag=0;S.rune=0;")
rep("cu:S.cu||{a:0,d:0,b:0,c:0},ss:S.ss|0,fx:S.fx||{}}}", "cu:S.cu||{a:0,d:0,b:0,c:0},ss:S.ss|0,fx:S.fx||{},ru:S.rune|0}}")
rep("S.ss=Math.max(0,+j.ss||0);S.fx=fxClean(j.fx);selectedRealm=0;", "S.ss=Math.max(0,+j.ss||0);S.fx=fxClean(j.fx);S.rune=Math.max(0,+j.ru||0);selectedRealm=0;")
# attribute screen: runes + diamond exchange
rep(" <div class=\"cu-note\">${note}</div></div>", " ${ckCuExtra(k)}<div class=\"cu-note\">${note}</div></div>")
rep(" const b=document.getElementById('cugo');if(b&&!max)b.onclick=()=>cuUpgrade(k);", " const b=document.getElementById('cugo');if(b&&!max)b.onclick=()=>cuUpgrade(k);{const r=document.getElementById('ckrune');if(r)r.onclick=()=>{if(ckUseRune(k))cuOpen(k,true)};const x=document.getElementById('ckxch');if(x)x.onclick=()=>{if(ckExchange())cuOpen(k)}}")

# 42. v4.2: new artwork everywhere (coin, diamond, star, trophy, medal, the four attributes, items,
#     rare items, shards, runes), final-blow replay, 8 s treasure window, golden drops at random spots,
#     haptics, per-level loot statistics, boss treasure shown in the shop, harder late non-boss levels.
import re as _re
rep("let q=tileAt(...pos(ev));hov=q;if(!q){L.placing=null;showSel(null);return}if(ckLootTap(q))return;", "let q=tileAt(...pos(ev));hov=q;if(!q){L.placing=null;showSel(null);return}if(ckLootTap(q,pos(ev)))return;")
rep("<script>const SFXD=", "<script>"+CKA_JS+"\nconst SFXD=")
for _k, _e in (('a', '⚔️'), ('d', '🛡️'), ('b', '🔨'), ('c', '🎯')):
    rep(_k + ":{ico:'" + _e + "',", _k + ":{ico:(typeof ckImg==='function'?ckImg('cu_" + _k + "','ck-cu-ico'):'" + _e + "'),")
_c0 = s.find('const CK_RES_ICON={'); assert _c0 > 0
for _key, _art in (('coin', 'gold'), ('diamond', 'dia'), ('star', 'star'), ('trophy', 'cup'), ('medal', 'medal')):
    _a = s.find(' ' + _key + ":'<svg class=\"ck-res-icon " + _key + '"', _c0); _z = s.find("</svg>'", _a)
    assert _a > 0 and 0 < _z - _a < 4000, _key
    s = s[:_a] + ' ' + _key + ":(typeof ckImg==='function'?ckImg('" + _art + "','ck-res-icon " + _key + "'):'')" + s[_z + len("</svg>'"):]
_i = s.find("const COIN='<svg class=\"ck-res-icon coin\""); _j = s.find("</svg>'", _i)
assert _i > 0 and 0 < _j - _i < 2000, 'COIN svg'
s = s[:_i] + "const COIN='<img class=\"ck-res-icon coin\" src=\"'+CKA.gold+'\" alt=\"\">'" + s[_j + len("</svg>'"):]
_m = _re.search(r'<span id="dmw"><svg class="ic dm".*?</svg><b id="dia">0</b>', s, _re.S)
assert _m, 'HUD diamond svg'
s = s[:_m.start()] + '<span id="dmw"><img class="ic dm ck-hud-dia" data-cka="dia" alt=""><b id="dia">0</b><span id="ckfr"></span>' + s[_m.end():]
rep("let sg,ag,am=null,", "document.querySelectorAll('img[data-cka]').forEach(e=>{e.src=CKA[e.dataset.cka]});let sg,ag,am=null,")
for _k, _e in (('a', '⚔️'), ('d', '🛡️'), ('b', '🔨'), ('c', '🎯')):
    rep('data-cu="%s" role="button" tabindex="0"><em>%s</em>' % (_k, _e), 'data-cu="%s" role="button" tabindex="0"><em>${ckImg(\'cu_%s\',\'ck-cu-ico\')}</em>' % (_k, _k))
for _id, _e, _k in ((9, '⚡', 'cu_b'), (10, '🛡️', 'cu_d'), (11, '⚔️', 'cu_a'), (12, '🗡️', 'cu_a'), (13, '🎯', 'cu_c'), (14, '💥', 'cu_c'), (15, '🏰', 'cu_d')):
    _o = "{id:%d,%sg:'tow',ic:'%s'," % (_id, ' ' if _id < 10 else '', _e)
    rep(_o, _o.replace("ic:'%s'," % _e, "ic:(typeof ckImg==='function'?ckImg('%s'):'%s')," % (_k, _e)))
rep("}).join('')}</div>`;\n sh.innerHTML=`", "}).join('')}${ckShopRareHtml()}</div>`;\n sh.innerHTML=`")
rep("'Tower refund (50%)')+' ('+L.tr.length+')',L.refund]);", "'Tower refund (50%)')+' ('+(L.trSnap||L.tr).length+')',L.refund]);")
rep("${rewardPanel(st,pg)}${ckCrownHtml()}", "${rewardPanel(st,pg)}${ckCrownHtml()}${ckDropsHtml()}")
rep("${rep()}<button class=\"bt r\" id=\"m1\">${TL('Retry level')}</button>", "${ckDropsHtml()}${rep()}<button class=\"bt r\" id=\"m1\">${TL('Retry level')}</button>")
rep("if(Math.random()>=Math.min(.12,.035+L.i*.0009))return;", "if(Math.random()>=Math.min(.12,.035+L.i*.0009)*(!L.boss&&L.i>=59?1.5:1))return;")

# 43. v4.2 polish: 5-star victory rating (lives, clean waves, towers kept) with the new star art,
# old 1-3 star saves migrated (1→1, 2→3, 3→5), tower losses counted, the Fourfold Throne uses the
# crown artwork without its gold circle, the realm detail thumbnail loses its emoji overlay.
rep("let st=L.lives>=L.mxl*.9?3:L.lives>=L.mxl*.5?2:1;", "let st=win?ckRate():1;")
rep("L.gStar=win?Math.round(L.gBase*[0,.5,1.2][st-1]):0;", "L.gStar=win?Math.round(L.gBase*[0,.25,.5,.85,1.2][st-1]):0;")
rep("'+st+'★ +'+([0,50,120][st-1])+'%)'", "'+st+'★ +'+([0,25,50,85,120][st-1])+'%)'")
rep("const stars=[0,1,2].map(i=>`<b class=\"${i<st?'on':''}\" style=\"animation-delay:${i*.35}s\">${i<st?'★':'☆'}</b>`).join('');", "const stars=ckStarsRow(st);")
rep('<div class="rw-st">${stars}</div>', '<div class="rw-st">${stars}</div>${ckRateHtml()}')
rep("[0,1,2].forEach(i=>{if(i<(L.st||0))setTimeout(()=>live()&&sfx('upgrade',.5),i*350+150)})", "[0,1,2,3,4].forEach(i=>{if(i<(L.st||0))setTimeout(()=>live()&&sfx('upgrade',.45),i*260+150)})")
rep("const gained=45+L.i*3+st*12+S.dif*10;", "const gained=45+L.i*3+Math.round(st*7.2)+S.dif*10;")
rep("S.prog[k*8+7]>=3", "S.prog[k*8+7]>=5")
rep("Earn 3 stars on all 6 main-map bosses", "Earn 5 stars on all 6 main-map bosses", 2)
rep("全部获得3星", "全部获得5星")
rep("(r.count||8)*3}", "(r.count||8)*5}")
rep("(R[ri].count||8)*3}", "(R[ri].count||8)*5}")
rep("{0}/24 ★", "{0}/40 ★", 2)
rep("st?'★'.repeat(st):TL('Ready')", "st?ckStarMini(st):TL('Ready')")
rep("st?'★'.repeat(st):TL('Enter')", "st?ckStarMini(st):TL('Enter')")
rep(",fr:S.frag|0,ru:S.rune|0}))", ",fr:S.frag|0,ru:S.rune|0,s5:1}))")
rep("S.prog=s.p||{};", "S.prog=ckStar5(s.p||{},s.s5);")
rep("S.prog=o(j.p);", "S.prog=ckStar5(o(j.p),j.s5);")
rep(",fx:S.fx||{},ru:S.rune|0}}", ",fx:S.fx||{},ru:S.rune|0,s5:1}}")
rep("function killTower(t){if(!L.tr.includes(t))return;", "function killTower(t){if(!L.tr.includes(t))return;L.tlost=(L.tlost|0)+1;")
rep("${ri===12?'👑':!unlocked?", "${ri===12?ckImg('crown','ck-crown'):!unlocked?")
rep("${ri===12?'👑':icons[ri]}</span><b class=\"rd-name\">", "</span><b class=\"rd-name\">")

# 44. v4.3: treasure chests (chest.js), medals, auto-use items. New saved fields: ch (chests per tier),
# md (medals), ai (auto-use switches). Level stars now count 0.6 each toward Bonus Upgrades, so the
# 5-star scale (v4.2.1) does not inflate the stars available to spend.
rep("ckV3Tick(dt);L.bf.ovc=", "ckV3Tick(dt);ckAutoTick(dt);L.bf.ovc=")
rep(",fr:S.frag|0,ru:S.rune|0,s5:1}))", ",fr:S.frag|0,ru:S.rune|0,s5:1,ch:S.chests||[],md:S.medals|0,ai:S.autoIt||{}}))")
rep("S.prog=ckStar5(s.p||{},s.s5);", "S.prog=ckStar5(s.p||{},s.s5);S.chests=Array.isArray(s.ch)?s.ch:[];S.medals=Math.max(0,s.md|0);S.autoIt=(s.ai&&typeof s.ai==='object')?s.ai:{};")
rep(",fx:S.fx||{},ru:S.rune|0,s5:1}}", ",fx:S.fx||{},ru:S.rune|0,s5:1,md:S.medals|0,ai:S.autoIt||{}}}")
rep("S.prog=ckStar5(o(j.p),j.s5);", "S.prog=ckStar5(o(j.p),j.s5);S.medals=Math.max(0,j.md|0);S.autoIt=o(j.ai);")
rep("S.rune=0;S.bonusStars=0;", "S.rune=0;S.bonusStars=0;S.chests=[0,0,0,0,0,0];S.medals=0;")
rep('<button class="shop-tab ${shopPage===\'treasure\'?\'on\':\'\'}" data-shop-page="treasure">✧ ${zh?\'宝藏\':\'Treasures\'}</button></div>', '<button class="shop-tab ${shopPage===\'chests\'?\'on\':\'\'}" data-shop-page="chests">🎁 ${zh?\'宝箱\':\'Chests\'}</button><button class="shop-tab ${shopPage===\'treasure\'?\'on\':\'\'}" data-shop-page="treasure">✧ ${zh?\'宝藏\':\'Treasures\'}</button></div>')
rep("const body=shopPage==='treasure'?renderTreasure():", "const body=shopPage==='chests'?ckChestPage(true):shopPage==='treasure'?renderTreasure():")
rep("<small>${shopPage==='items'?TL(", "<small>${shopPage==='chests'?ckLZ(['宝箱 · 钻石购买或首领掉落，无法出售','Chests · buy with diamonds or win them from bosses · cannot be sold']):shopPage==='items'?TL(")
rep('</button><small>${lk?\'<a class="vlink" data-prof="shop"', '</button>${ckAutoBtn(it.id)}<small>${lk?\'<a class="vlink" data-prof="shop"')
rep('<span class="cdt"></span><u>${L.inv[it.id]}</u></button>', '<span class="cdt"></span><u>${L.inv[it.id]}</u>${S.autoIt&&S.autoIt[it.id]&&ckAutoOk(it.id)?\'<i class="ck-ab">A</i>\':\'\'}</button>')

rep("Math.floor((H-48-156)/14));ox=Math.round((W-9*tw)/2);oy=48+Math.max(0,Math.round((H-48-156-14*tw)/2))", "Math.floor((H-48-156-CK_RAILX)/14));ox=Math.round((W-9*tw)/2);oy=48+Math.max(0,Math.round((H-48-156-CK_RAILX-14*tw)/2))")

# 45. v4.4: 50 commander levels (levels 1-10 keep their XP thresholds), attribute upgrades to 30
# (unlocked by commander level), inventory + diamond forge + level rewards (v44.js), boss diamonds,
# version in Settings, level-50 badge art, fixed HUD widths. Saves stay compatible both ways.
rep("{xp:4000,n:'混沌之主',en:'Lord of Chaos'}\n];", "{xp:4000,n:'混沌之主',en:'Lord of Chaos'},{xp:4900,n:'龙骑士 I',en:'Dragon Knight I'},{xp:5900,n:'龙骑士 II',en:'Dragon Knight II'},{xp:7000,n:'龙骑士 III',en:'Dragon Knight III'},{xp:8200,n:'龙骑士 IV',en:'Dragon Knight IV'},{xp:9500,n:'龙骑士 V',en:'Dragon Knight V'},{xp:10950,n:'风暴守望者 I',en:'Storm Warden I'},{xp:12500,n:'风暴守望者 II',en:'Storm Warden II'},{xp:14150,n:'风暴守望者 III',en:'Storm Warden III'},{xp:15900,n:'风暴守望者 IV',en:'Storm Warden IV'},{xp:17750,n:'风暴守望者 V',en:'Storm Warden V'},{xp:19700,n:'天界圣骑 I',en:'Celestial Paladin I'},{xp:21750,n:'天界圣骑 II',en:'Celestial Paladin II'},{xp:23900,n:'天界圣骑 III',en:'Celestial Paladin III'},{xp:26150,n:'天界圣骑 IV',en:'Celestial Paladin IV'},{xp:28500,n:'天界圣骑 V',en:'Celestial Paladin V'},{xp:31000,n:'深渊战主 I',en:'Abyss Warlord I'},{xp:33600,n:'深渊战主 II',en:'Abyss Warlord II'},{xp:36300,n:'深渊战主 III',en:'Abyss Warlord III'},{xp:39100,n:'深渊战主 IV',en:'Abyss Warlord IV'},{xp:42000,n:'深渊战主 V',en:'Abyss Warlord V'},{xp:45000,n:'凤凰元帅 I',en:'Phoenix Marshal I'},{xp:48100,n:'凤凰元帅 II',en:'Phoenix Marshal II'},{xp:51300,n:'凤凰元帅 III',en:'Phoenix Marshal III'},{xp:54600,n:'凤凰元帅 IV',en:'Phoenix Marshal IV'},{xp:58000,n:'凤凰元帅 V',en:'Phoenix Marshal V'},{xp:61550,n:'泰坦霸主 I',en:'Titan Overlord I'},{xp:65200,n:'泰坦霸主 II',en:'Titan Overlord II'},{xp:68950,n:'泰坦霸主 III',en:'Titan Overlord III'},{xp:72800,n:'泰坦霸主 IV',en:'Titan Overlord IV'},{xp:76750,n:'泰坦霸主 V',en:'Titan Overlord V'},{xp:80800,n:'永恒执政官 I',en:'Eternal Archon I'},{xp:84950,n:'永恒执政官 II',en:'Eternal Archon II'},{xp:89200,n:'永恒执政官 III',en:'Eternal Archon III'},{xp:93550,n:'永恒执政官 IV',en:'Eternal Archon IV'},{xp:98000,n:'永恒执政官 V',en:'Eternal Archon V'},{xp:102600,n:'混沌帝皇 I',en:'Chaos Emperor I'},{xp:107300,n:'混沌帝皇 II',en:'Chaos Emperor II'},{xp:112100,n:'混沌帝皇 III',en:'Chaos Emperor III'},{xp:117000,n:'混沌帝皇 IV',en:'Chaos Emperor IV'},{xp:122000,n:'混沌帝皇 V',en:'Chaos Emperor V'}\n];")
rep("const LV_BONUS_PER=.01,LV_BONUS_MAX=.10;", "const LV_BONUS_PER=.01,LV_BONUS_MAX=.30;")
rep("const lvBonus=lv=>Math.min(LV_BONUS_MAX,(lv==null?plLevel():lv)*LV_BONUS_PER);", "const lvBonus=lv=>{lv=lv==null?plLevel():lv;return Math.min(LV_BONUS_MAX,lv<=10?lv*LV_BONUS_PER:.10+(lv-10)*.005)};")
rep("const CU_MAX=10,CU_PER=.01,CU_STAR=[2,3,4,6,8,10,13,16,18,20],CU_GOLD=[300,500,800,1200,1800,2600,3600,5000,7000,10000];",
    "const CU_MAX=30,CU_PER=.01,CU_STAR=[2,3,4,6,8,10,13,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60],CU_GOLD=[300,500,800,1200,1800,2600,3600,5000,7000,10000,12000,14000,16000,18000,20000,22000,24000,26000,28000,30000,32000,34000,36000,38000,40000,42000,44000,46000,48000,50000];"
    "const cuCap=lv=>{lv=lv==null?plLevel():lv;return cheat()?CU_MAX:lv<=10?10:Math.min(CU_MAX,10+Math.floor((lv-10)/2))};const ckCritPct=n=>n<=10?n*2:20+(n-10);const cuDia=n=>n<4?0:n<10?(n-3)*5:10;")
rep("BUILD_BASE-cuLv('b')*(BUILD_BASE-BUILD_MIN)/CU_MAX", "BUILD_BASE-Math.min(10,cuLv('b'))*(BUILD_BASE-BUILD_MIN)/10")
rep("Math.min(1,cuLv('c')*CRIT_PCT/100+fxCrit())", "Math.min(1,ckCritPct(cuLv('c'))/100+fxCrit())")
rep("const killGold=e=>(e.t==='boss'?400:e.t==='brute'?80:e.fly?50:e.t==='runner'?35:25)*(e.el?3:1);", "const killGold=e=>Math.round((e.t==='boss'?400:e.t==='brute'?80:e.fly?50:e.t==='runner'?35:25)*(e.el?3:1)*(1+.015*Math.max(0,cuLv('b')-10)));")
rep("const pips=n=>{let h='';for(let i=0;i<CU_MAX;i++)h+=`<u class=\"${i<n?'on':''}\"></u>`;return h};", "const pips=n=>{const d=Math.min(2,Math.floor(Math.max(0,n-1)/10)),k=n-d*10;let h='';for(let i=0;i<10;i++)h+=`<u class=\"${i<k?'on t'+d:(d>0?'on t'+(d-1):'')}\"></u>`;return h};")
_a = s.index('function cuUpgrade(k){'); _b = s.index('\nwindow.cuOpen=cuOpen;', _a); assert s.count('function cuUpgrade(k){') == 1
s = s[:_a] + open(os.path.join(SRC, 'cu44.js'), encoding='utf8').read() + s[_b:]
rep("let trk='';for(let i=1;i<=10;i++){trk+=(i>1?", "let trk='';const _t0=Math.max(1,Math.min(RANKS.length-9,lv-4));for(let i=_t0;i<_t0+10;i++){trk+=(i>_t0?")
rep("Lv.${ri+1}/10", "Lv.${ri+1}/${RANKS.length}")
rep("Lv.${lv}/10", "Lv.${lv}/${RANKS.length}")
rep("function ld(){", "function ld(){try{const _r=localStorage.getItem('ck25');if(_r&&!localStorage.getItem('ck25_bak_v44'))localStorage.setItem('ck25_bak_v44',_r)}catch(e){}")
rep("S.frag=Math.max(0,Math.min(3,s.fr|0));", "S.frag=Math.max(0,s.fr|0);S.lvr=s.lr==null?null:Math.max(1,s.lr|0);S.v44=!!s.v44;")
rep(",ch:S.chests||[],md:S.medals|0,ai:S.autoIt||{}}))", ",ch:S.chests||[],md:S.medals|0,ai:S.autoIt||{},lr:S.lvr==null?null:S.lvr,v44:S.v44?1:0}))")
rep(",md:S.medals|0,ai:S.autoIt||{}}}", ",md:S.medals|0,ai:S.autoIt||{},ver:'6.4',lr:S.lvr==null?null:S.lvr}}")
rep("S.medals=Math.max(0,j.md|0);S.autoIt=o(j.ai);", "S.medals=Math.max(0,j.md|0);S.autoIt=o(j.ai);S.lvr=j.lr==null?rankAt(Math.max(0,+j.xp||0))+1:Math.max(1,j.lr|0);S.v44=true;")
rep("if(!pending){pending=1;$('xg').textContent=XT('Tap again to overwrite','再点一次确认覆盖');window._xj=j;return}", "if(!pending){pending=1;$('xg').textContent=XT('Tap again to overwrite','再点一次确认覆盖');window._xj=j;try{ckXPrev(j)}catch(_){}return}")
rep("<div class=\"pause-settings\">${sl()}${tg()}</div>", "<div class=\"pause-settings\">${sl()}${tg()}<div class=\"ck-ver\">${ckVerTxt()}</div></div>")
rep("<button class=\"bt pay\" id=\"picklevel\">✦ ${TL('Select level')}</button>", "<button class=\"bt pay\" id=\"picklevel\">✦ ${TL('Select level')}</button><button class=\"bt g ck-invp\" data-ckinv=\"pause\">🎒 ${lvZ('背包','Inventory')}</button>")
rep("e.innerHTML='<span class=\"ivl\">'+TL('ITEMS')+'</span>'", "e.innerHTML=''")
rep("const after=rankAt(S.xp),newA=", "const after=rankAt(S.xp);try{ckLvCheck()}catch(_){}const newA=")

rep("window.ckBadge=function(lv){lv=Math.max(1,Math.min(10,lv|0));return '<img class=\"ckbadge\" alt=\"Lv.'+lv+'\" draggable=\"false\" src=\"'+B[lv-1]+'\">'};", "window.ckBadge=function(lv){lv=Math.max(1,Math.min(50,lv|0));return '<img class=\"ckbadge\" alt=\"Lv.'+lv+'\" draggable=\"false\" src=\"'+((typeof CKA==='object'&&CKA['lv'+lv])||B[Math.min(9,lv-1)])+'\">'};")

rep("setT('dia',(S.diamonds||0).toLocaleString())", "setT('dia',(d=>d>=1e4?(Math.floor(d/100)/10)+'K':d.toLocaleString())(S.diamonds||0))")

rep("n>=1e5?Math.floor(n/1e3)+'K':d}", "n>=1e5?Math.floor(n/1e3)+'K':n>=1e4?(Math.floor(n/100)/10)+'K':d}")

rep("${R.reduce((a,r)=>a+(r.secret?0:(r.count||8)*3),0)}</b><small>${TL('Stars collected')}", "${R.reduce((a,r)=>a+(r.secret?0:(r.count||8)*5),0)}</b><small>${TL('Stars collected')}")

# 46. V5: compact level badge + map label under the divider, floating tips button, Inventory tab,
# "Redeem Code" wording.
rep("$('ln').textContent=TL('Lv {0}',L.i+1)+(L.boss?' 👑':'');", "$('ln').textContent=String(L.i+1);$('ln').classList.toggle('ck-boss',!!L.boss);try{ckMapLabel()}catch(_){}")
rep("function hud(){if(S.mode!=='play')return;", "function hud(){if(S.mode!=='play')return;try{ckPlaceFloat()}catch(_){}")
rep("function applyLang(){", "function applyLang(){try{ckMapLabel()}catch(_){}")
rep("b.setAttribute('data-i18n','🎟 Enter Redeem Code');b.textContent='🎟 Enter Redeem Code';", "b.setAttribute('data-i18n','🎟 Redeem Code');b.textContent='🎟 Redeem Code';")
rep("ZH['🎟 Enter Redeem Code']='🎟 输入兑换码'", "ZH['🎟 Redeem Code']='🎟 兑换码'")
rep("Z('输入兑换码','Enter Redeem Code')", "Z('兑换码','Redeem Code')", 2)

# 47. V5 monster AI (threat targeting, base commit, leash) and smooth movement (no snap at tile centres).
rep("e.x=tx;e.y=ty;e.vv[0]=0;e.vv[1]=0;e.tc=null;nav.px=e.x;nav.py=e.y;nav.lastDist=1e9;return}}}", "e.tc=null;nav.lastDist=1e9}}}")
rep("if(!e.chase){e.cdA=(e.cdA||0)-dt;if(e.cdA<=0){e.cdA=.35;let t=pickTw(e,AGG[e.t]||1.4);if(t){e.chase=t;e.chaseT=0}}}", "if(ckCommit(e)){e.chase=null}else if(!e.chase){e.cdA=(e.cdA||0)-dt;if(e.cdA<=0){e.cdA=.4;let t=ckPickTarget(e);if(t){e.chase=t;e.chaseT=0}}}")
rep("if(e.chaseT>6||d>(AGG[e.t]||1.4)*2.2||!lineOK(e.x,e.y,t.x,t.y)){e.chase=null;e.cdA=2.5}", "if(e.chaseT>6||d>ckAware(e)*1.8+.6||!lineOK(e.x,e.y,t.x,t.y)){e.chase=null;e.cdA=2.5}")
rep("function fire(t,e){fire0(t,e);vMuzzle(t,e)}", "function fire(t,e){if(e){e._sh=t;e._shT=TM}fire0(t,e);vMuzzle(t,e)}")

# 48. V5: Settings screen on the gear, pause menu with actions only (opened by Pause), haptics switch, tile pop.
rep("<div class=\"pause-settings\">${sl()}${tg()}<div class=\"ck-ver\">${ckVerTxt()}</div></div>", "")
rep("<button class=\"bt g musbtn\">${mon?TL('♪ Music: on'):TL('♪ Music: off')}</button></div><div class=\"row2\"><button class=\"bt g rotbtn\">⟳ ${TL('Screen: ')}${TL('Auto')}</button><button class=\"bt g langbtn\">🌐 ${LANG==='zh'?'中文':'EN'}</button></div>", "<button class=\"bt g\" data-cksettings=\"pause\">⚙ ${lvZ('设置','Settings')}</button></div>")
rep("$('menu').onclick=pauseM;", "$('menu').onclick=()=>{if(S.mode==='play')ckSettingsOpen('hud')};")
rep("$('pz').onclick=togP;", "$('pz').onclick=()=>{if(S.mode==='play'&&!L.over)pauseM();else togP()};")
rep("let q=tileAt(...pos(ev));hov=q;", "let q=tileAt(...pos(ev));hov=q;try{ckTilePop(q)}catch(_){}")
rep(" c.restore();drawOver()}\nfunction tileAt(", " c.restore();try{ckPopDraw()}catch(_){}drawOver()}\nfunction tileAt(")
rep(",lr:S.lvr==null?null:S.lvr,v44:S.v44?1:0}))", ",lr:S.lvr==null?null:S.lvr,v44:S.v44?1:0,hp:S.hap===false?0:1}))")
rep("S.lvr=s.lr==null?null:Math.max(1,s.lr|0);S.v44=!!s.v44;", "S.lvr=s.lr==null?null:Math.max(1,s.lr|0);S.v44=!!s.v44;S.hap=s.hp!==0;")

# 49. V5 damage numbers: pop in, bigger + glowing for strong/gold hits, rounded outline.
rep("c.font=`900 ${Math.max(12,tw*.26)}px Nunito`;c.textAlign='center';L.tx.forEach(t=>{c.globalAlpha=Math.min(1,t.l*2);c.lineWidth=3;c.strokeStyle='#170f2e';c.strokeText(t.s,t.x,t.y);c.fillStyle=t.c;c.fillText(t.s,t.x,t.y)});", "c.textAlign='center';c.lineJoin='round';L.tx.forEach(t=>{const age=(t.l0||(t.l0=t.l))-t.l,pop=age<.12?1+.4*(1-age/.12):1,big=/^#?(ff[c-e]|ffd|fe)/i.test(t.c||'')||/[!★]/.test(String(t.s));const fs=Math.max(12,tw*.26)*(big?1.22:1)*pop;c.font=`900 ${fs}px Nunito`;c.globalAlpha=Math.min(1,t.l*2);c.lineWidth=Math.max(3,fs*.2);c.strokeStyle='#120a24';c.strokeText(t.s,t.x,t.y);if(big){c.shadowColor=t.c;c.shadowBlur=10}c.fillStyle=t.c;c.fillText(t.s,t.x,t.y);c.shadowBlur=0});")

# 50. V5.1 music: on by default (label shows it), tracks composed ahead of time and kept, so turning
# music on or starting a level plays at once instead of waiting 1-3 s for the composer.
rep("function song(key){return ckSong(key).catch(e=>{if(e==='superseded')throw e;console.warn('ckSong',e);return songV2(key)})}", "const CK_SP={};function song(key){if(MC[key])return Promise.resolve(MC[key]);if(CK_SP[key])return CK_SP[key];const p=ckSong(key).catch(e=>{if(e==='superseded')throw e;console.warn('ckSong',e);return songV2(key)}).then(b=>{MC[key]=b;delete CK_SP[key];return b},e=>{delete CK_SP[key];throw e});CK_SP[key]=p;return p};function ckPrefetch(k){if(!k||MC[k]||CK_SP[k]||Object.keys(CK_SP).length)return;song(k).catch(()=>{})};setTimeout(()=>ckPrefetch('menu'),1200);")
rep("mon?TL('♪ Music: on'):TL('♪ Music: off')", "(mon||!mOff)?TL('♪ Music: on'):TL('♪ Music: off')", 2)
rep("function start(i){closeM();recordSession('quit');load(i);", "function start(i){closeM();recordSession('quit');load(i);try{ckPrefetch('L'+i)}catch(_){}")

rep("function mPlay(k){let tok=++mTok;mk=k;mStop();ambSet(AMBK(k));", "function mPlay(k){let tok=++mTok;mk=k;if(MC[k])mStop();ambSet(AMBK(k));")
rep("function buildMap(){", "function buildMap(){try{let n=0;while(n<99&&S.prog[n])n++;ckPrefetch('L'+n)}catch(_){}")
rep("function end(win){L.over=true;", "function end(win){L.over=true;try{setTimeout(()=>ckPrefetch('L'+(win?Math.min(99,L.i+1):L.i)),1500)}catch(_){}")

# 51. v5.5 quick fixes: abandon-level warning glows, no "cannot be undone".
rep("'Switching levels will permanently discard the unfinished progress in the current level. This cannot be undone.':'切换关卡将永久放弃当前关卡尚未完成的进度，且无法恢复。'", "'Switching levels will permanently discard the unfinished progress in the current level.':'切换关卡将永久放弃当前关卡尚未完成的进度。'")
rep("const desc=TL('Switching levels will permanently discard the unfinished progress in the current level. This cannot be undone.');", "const desc=TL('Switching levels will permanently discard the unfinished progress in the current level.');")
rep("modal(`<h2 class=\"f\">${TL('Confirm level change')}</h2><p>${desc}</p>", "modal(`<h2 class=\"f\">${TL('Confirm level change')}</h2><p class=\"ck-warn\">⚠ ${desc}</p>")

rep("ckV3Ground();L.tr.slice().sort((a,b)=>a.y-b.y).forEach(dTw);", "ckV3Ground();try{ckPopGround()}catch(_){}L.tr.slice().sort((a,b)=>a.y-b.y).forEach(t=>{if(!ckPopTw(t))dTw(t)});")

# 52. v5.5 achievements (a55.js), daily reward, statistics, tower range preview while placing.
rep("function checkAchievements(){progressStats();", "function checkAchievements(){progressStats();try{ckA55Init();ckAchStats()}catch(_){}")
rep('<div class="achgrid">${ach}</div>', '<div class="ck-pwrap">${ckProfileTabs()}</div>')
rep("function openProfile(back){", "function openProfile(back){try{ckProfileOpened()}catch(_){}")
rep("function end(win){L.over=true;try{setTimeout(()=>ckPrefetch(", "function end(win){L.over=true;try{ckAchEnd(win)}catch(_){}try{setTimeout(()=>ckPrefetch(")
rep("const achGold=newA.reduce((s,a)=>s+(a.gold||0),0);if(achGold)Economy.grantWallet(achGold);", "const achGold=newA.reduce((s,a)=>s+(a.gold||0),0);if(achGold)Economy.grantWallet(achGold);try{newA.forEach(ckAExtra);if(newA.length){ckANew(newA);newA.forEach((a,i)=>setTimeout(()=>ckABanner(a),1600+i*4200))}}catch(_){}")
rep("${ckCrownHtml()}${ckDropsHtml()}", "${ckCrownHtml()}${ckDropsHtml()}${ckNextGoal()}")
rep("$('pxp').textContent=S.xp+' XP'+(next?' / '+next.xp+' XP':' · '+TL('Max rank'))}", "$('pxp').textContent=S.xp+' XP'+(next?' / '+next.xp+' XP':' · '+TL('Max rank'));try{let e=document.getElementById('ckshow');if(!e){e=document.createElement('div');e.id='ckshow';$('pxp').after(e)}e.innerHTML=ckShowcaseHtml();ckDot()}catch(_){}}")
rep("L.built++;", "L.built++;try{ckStat('bt_'+selK)}catch(_){}")
rep("L.inv[id]--;ckIU(id);", "L.inv[id]--;ckIU(id);try{ckStat('items')}catch(_){}", 2)
rep(",hp:S.hap===false?0:1}))", ",hp:S.hap===false?0:1,sh:S.show||[],an:S.achNew||[],dl:S.dly||null}))")
rep("S.hap=s.hp!==0;", "S.hap=s.hp!==0;S.show=Array.isArray(s.sh)?s.sh:[];S.achNew=Array.isArray(s.an)?s.an:[];S.dly=(s.dl&&typeof s.dl==='object')?s.dl:null;")

# 53. v5.5.1 smarter routes: danger weighted by tower DPS (cap 4.5 per tile), weakest base preferred,
# pathFrom stops at a base tile (bases may carry a defence cost now).
rep("if(L.demo||!L.tr||!L.tr.length)return null;", "if(L.demo||!L.tr||!L.tr.length){L._dz=null;return null}")
rep("z[y*C+x]=Math.min(1,z[y*C+x]+.22)}return z}", "z[y*C+x]=Math.min(4.5,z[y*C+x]+ckDangerW(t))}L._dz=z;return z}")
rep("L.goals.forEach(g=>{df[g[1]*C+g[0]]=0;q.push([g[0],g[1]])});", "L.goals.forEach(g=>{df[g[1]*C+g[0]]=ckGoalCost(g,dz);q.push([g[0],g[1]])});")
rep("if(L.df[cy*L.cols+cx]===0)break;", "if(L.goals.some(g=>g[0]===cx&&g[1]===cy))break;")

# 54. v5.5.1 UI: soft range ring only for a built, selected tower; realm panel art; "Continue Game";
# new saved fields bv (button vibration), a8 (original-8 bonus paid), ait (AI tip shown).
rep("if(selT){c.setLineDash([6,5]);c.beginPath();c.arc(p.x,p.y,rg*tw,0,7);c.stroke();c.setLineDash([])}", "if(selT){try{ckRangeRing(p.x,p.y,rg*tw)}catch(_){}}")
rep("<section class=\"realm-detail\">", "<section class=\"realm-detail\" style=\"--rd-art:url('${bg}')\">")
rep("hint=ri===12?TL('Four unique boss battles on a dedicated special map.'):TL('Unlocks all 8 levels in this map. Levels then open one by one as you win.');", "hint=ri===12?TL('Four unique boss battles on a dedicated special map.'):'';")
rep("<button class=\"bt\" id=\"m1\">▶ ${TL('Resume')}</button>", "<button class=\"bt\" id=\"m1\">▶ ${TL('Continue Game')}</button>")
rep("e.innerHTML=ckShowcaseHtml();ckDot()}catch(_){}}", "e.innerHTML=ckShowcaseHtml();ckDot();ckHomeCard()}catch(_){}}")
rep(",sh:S.show||[],an:S.achNew||[],dl:S.dly||null}))", ",sh:S.show||[],an:S.achNew||[],dl:S.dly||null,bv:S.bvib===false?0:1,a8:S.a8||[],ait:S.aitip?1:0}))")
rep("S.dly=(s.dl&&typeof s.dl==='object')?s.dl:null;", "S.dly=(s.dl&&typeof s.dl==='object')?s.dl:null;S.bvib=s.bv!==0;S.a8=Array.isArray(s.a8)?s.a8:[];S.aitip=!!s.ait;")

# 60. v5.6: realm art for VII-XII is graded from the six base pictures (ckRArt in v56.js);
#     Level 4 shows the realm's mini-boss in the panel and a crest on its button.
rep("const art=SPRD['m_'+r.m]||SPRD.m_sky;", "const art=ckRArt(r);")
rep("levelArt=SPRD['m_'+r.m]||SPRD.m_sky;", "levelArt=ckRArt(r);")
rep("const bg=SPRD['m_'+r.m]||SPRD.m_sky;", "const bg=ckRArt(r);")
rep("const art=SPRD['m_'+R[ri].m]||SPRD.m_sky;", "const art=ckRArt(R[ri]);")
rep(",boss=hidden?TL('Hidden realm'):TL('Boss: {0}',BOSS[ri]);", ",boss=hidden?TL('Hidden realm'):(ri<12?ckMbName(ri)+' · ':'')+TL('Boss: {0}',BOSS[ri]);")
rep("${k===(r.count||8)-1||ri===12?'boss':''}", "${k===(r.count||8)-1||ri===12?'boss':''}${k===3&&ri<12?' mini':''}")
rep("(k===(r.count||8)-1||ri===12)?'♛':''}", "(k===(r.count||8)-1||ri===12)?'♛':(k===3&&ri<12)?'⚔':''}")
# 62. v5.8: Buy x10 in the item shop, synergies move to Help
rep("<span class=\"buytxt\">${TL('Buy<br>').replace('<br>','')}</span>${COIN}<span class=\"price\">${pr}</span>`}</button>${ckAutoBtn(it.id)}<small>", "<span class=\"buytxt\">${TL('Buy<br>').replace('<br>','')}${(!lim&&ckQ(it.id)===10)?' ×10':''}</span>${COIN}<span class=\"price\">${lim?pr:ckQPrice(it.id,pr)}</span>`}</button>${(!lim&&!lk)?ckQTog(it.id):''}${lk?'':ckAutoBtn(it.id)}<small>")
rep('<div class="pfsection">${TL(\'Tower Synergies\')}</div><div class="pfsynergy"><div><b>❄ ${TL(\'Frost + Cannon\')}</b><small>${TL(\'Slowed enemies take bonus cannon splash damage.\')}</small></div><div><b>☠ ${TL(\'Poison + Lightning\')}</b><small>${TL(\'Poisoned enemies take bonus chain lightning damage.\')}</small></div><div><b>✧ ${TL(\'Holy + Heavy\')}</b><small>${TL(\'Holy towers excel against brutes and bosses.\')}</small></div><div><b>✦ ${TL(\'Tactical choices\')}</b><small>${TL(\'Pick one upgrade between waves.\')}</small></div></div>', '')
# 63. v5.9: new item artwork replaces the 12 original item sprites in place
for _k in ['i_fbomb','i_ibomb','i_scroll','i_potion','i_horn','i_gold','i_trap','i_aid','i_shield','i_speed','i_meteor','i_freeze']:
    _n0 = len(s); s = re.sub(r'"%s":"data:image/[a-z]+;base64,[^"]*"' % _k, '"%s":"%s"' % (_k, _w59(_k + '.png', 120, 78)), s, count=1); assert len(s) != _n0, _k
# 64. v6.0: ambience is soft (generated beds, ckAmbBuf) and mixed ~19x below the music
rep("ag.gain.value=.25*ambV", "ag.gain.value=.045*ambV")
rep("if(ag)ag.gain.value=.25*v", "if(ag)ag.gain.value=.045*v")
rep("am.buffer=SB[n];", "am.buffer=(typeof ckAmbBuf==='function'&&ckAmbBuf(n))||SB[n];")
# 66. v6.1: pause ducks the music (no suspend), tower panel idles 35% shorter, playback latency for steadier audio,
#     selected tower shows its range, no buff ellipses under every tower, no full-base shield halo (the hex dome stays)
rep("if(au)au.suspend().catch(()=>{});$('m1').onclick=()=>{closeM();resumeGameAudio()}", "ckDuck(true);$('m1').onclick=()=>{closeM();resumeGameAudio()}")
rep("},500)},1500)}", "},500)},975)}")
rep("au=new(window.AudioContext||window.webkitAudioContext)();", "try{au=new(window.AudioContext||window.webkitAudioContext)({latencyHint:'playback'})}catch(_){au=new(window.AudioContext||window.webkitAudioContext)()}")
rep("forEach(t=>{if(!ckPopTw(t))dTw(t)});", "forEach(t=>{if(!ckPopTw(t))dTw(t)});try{ckSelRing()}catch(_){}")
rep("if(L.bf.horn>0||L.bf.ovc>0){c.globalCompositeOperation='lighter';L.tr.forEach", "if(false){c.globalCompositeOperation='lighter';L.tr.forEach")
rep("if(L.bf.shield>0)L.goals.forEach(g=>{let p=pp(g[0],g[1]),al=", "if(false)L.goals.forEach(g=>{let p=pp(g[0],g[1]),al=")
# 67. v6.2: frozen bosses keep their phase/rage timers; frozen-boss ice and holy pillars sized sanely;
#     the low-lives vignette and event flashes stay inside the rounded board
rep("if(e.fz>0){e.fz-=dt;return}", "if(e.fz>0){e.fz-=dt;if(e.t==='boss')try{ckBossFrozenTick(e,dt)}catch(_){}return}")
rep("if(e.fz>0){vIce(p.x,p.y,r0);circ(p.x,p.y,r0,'#bff4ff66');c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,r0,0,7);c.stroke()}", "if(e.fz>0){const r1=e.t==='boss'?Math.min(r0,tw*.8):r0;vIce(p.x,p.y,r1);circ(p.x,p.y,r1,'#bff4ff44');c.strokeStyle='#ffffffcc';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,r1,0,7);c.stroke()}")
rep("else if(k==='holy'){vPillar(x,y,'#fff0a0',.5);", "else if(k==='holy'){if(Math.random()<.25)vPillar(x,y,'#fff0a0',.3);")
rep("c.globalAlpha=a;c.fillStyle=g;c.fillRect(0,0,W,H);c.restore()}if(L.fl){c.globalAlpha=Math.max(0,Math.min(.6,L.fl.a));c.fillStyle=L.fl.c;c.fillRect(0,0,W,H);c.globalAlpha=1}}", "c.globalAlpha=a*.7;c.fillStyle=g;c.beginPath();c.roundRect(ox,oy,tw*(port?L.rows:L.cols),tw*(port?L.cols:L.rows),10);c.fill();c.restore()}if(L.fl){c.save();c.beginPath();c.roundRect(ox,oy,tw*(port?L.rows:L.cols),tw*(port?L.cols:L.rows),10);c.clip();c.globalAlpha=Math.max(0,Math.min(.25,L.fl.a*.5));c.fillStyle=L.fl.c;c.fillRect(0,0,W,H);c.restore()}}")
rep("c.globalAlpha=a*.34;c.fillStyle='#ff1010';c.fillRect(0,0,W,H);let g=c.createRadialGradient", "let g=c.createRadialGradient")
rep("c.globalAlpha=a*.7;c.fillStyle=g;c.beginPath();c.roundRect(ox,oy", "c.globalAlpha=a*.42;c.fillStyle=g;c.beginPath();c.roundRect(ox,oy")
# 68. v6.4: victory waits for the Ultimate Boss; floating bars keep only the fill (empty part transparent); 6 cached tracks
rep("if(L.wave>=L.waves&&!L.q.length&&!L.en.length&&!L.over&&!ckLootBusy())end(true)", "if(L.wave>=L.waves&&!L.q.length&&!L.en.length&&!L.over&&!ckLootBusy()&&!L.ckMainHeld)end(true)")
rep("c.fillStyle='#0a0f24';c.fillRect(p.x-bw/2-1,by-1,bw+2,6);c.fillStyle=bs?", "c.strokeStyle='rgba(8,12,28,.55)';c.lineWidth=1;c.strokeRect(p.x-bw/2-.5,by-.5,bw+1,5);c.fillStyle=bs?")
rep("c.fillStyle='#07101d';c.fillRect(p.x-w/2-1,y-1,w+2,7);c.fillStyle='#ffffff';c.fillRect(p.x-w/2,y,w,5);", "c.strokeStyle='rgba(7,16,29,.6)';c.lineWidth=1;c.strokeRect(p.x-w/2-.5,y-.5,w+1,6);")
rep("c.strokeStyle='#1a2433';c.lineWidth=1;c.strokeRect(p.x-w/2,y,w,5)}};", "}};")
rep("if(ks.length>3)", "if(ks.length>6)")
# 61. v5.8 size: the 1280x1260 'tower360' sheet in the original is never referenced (1.06 MB); drop it
_n0=len(s);s=re.sub(r"SPRD\.tower360='[^']*';","",s);assert len(s)<_n0-500000,'tower360 not removed'
# ---------------------------------------------------------------- premium layer
def b64(p):
    return base64.b64encode(open(p, 'rb').read()).decode()
F = os.path.join(HERE, 'fonts')
faces = [('Cinzel', 'cinzel-latin-{}-normal.woff2', [700, 900]),
         ('Nunito', 'nunito-latin-{}-normal.woff2', [700, 800, 900]),
         ('Fredoka', 'fredoka-latin-{}-normal.woff2', [500, 600, 700])]
# v5: one family for English and Chinese: Noto Sans SC (OFL), subset to the characters the game uses
# (tools/make_font.py regenerates it), embedded as 'CKSans'. Every older family name is mapped to it.
font_css = open(os.path.join(F, 'cksans-noto-sans-sc-subset.css'), encoding='utf8').read()
critical = open(os.path.join(SRC, 'critical.css'), encoding='utf8').read()
head = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">'
        '<meta name="theme-color" content="#050912"><meta name="mobile-web-app-capable" content="yes">'
        '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
        '<meta name="format-detection" content="telephone=no">'
        '<title>Chaos Kingdoms</title>\n'
        f'<style id="ck-fonts">{font_css}</style>\n<style id="ck-critical">{critical}</style>\n')
s = head + s
def _splash():
    import io
    from PIL import Image
    im = Image.open(os.path.join(SRC, 'source-keyart.png')).convert('RGB'); im.thumbnail((720, 1280), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=72, method=6)
    castle = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
    logo = ''
    return open(os.path.join(SRC, 'splash.html'), encoding='utf8').read().replace('%%CK_CASTLE%%', castle).replace('%%CK_LOGO%%', logo)
s = s.replace('<!--CK_SPLASH-->', _splash())
aaa_css = open(os.path.join(SRC, 'aaa.css'), encoding='utf8').read()
aaa_js = open(os.path.join(SRC, 'aaa.js'), encoding='utf8').read()
fix_js = open(os.path.join(SRC, 'fixes.js'), encoding='utf8').read()
assert s.rstrip().endswith('</body></html>')
s = s.rstrip()[:-len('</body></html>')] + f'<style id="ck-aaa">\n{aaa_css}</style>\n<script id="ck-fixes">\n{fix_js}</script>\n<script id="ck-aaa-js">\n{aaa_js}</script>\n</body></html>\n'
_fc = s.index('<style id="ck-fonts">'); _fe = s.index('</style>', _fc)
_body = s[:_fc] + '\x00FONTS\x00' + s[_fe:]
for _pat in (r"\bCinzel\b", r"\bNunito\b", r"\bFredoka\b", r'"Noto Sans SC"', r"'Noto Sans SC'", r"\bsystem-ui\b"):
    _body = re.sub(_pat, 'CKSans', _body)
s = _body.replace('\x00FONTS\x00', s[_fc:_fe])
# v5.5 size pass: PNG data URIs larger than 6 KB become WebP (alpha kept), cached by content hash.
def _png2webp(m):
    import io, hashlib
    from PIL import Image
    b = m.group(1)
    if len(b) < 8000: return m.group(0)
    # the original monster sprites ("e_xxx":"data:image/png...") must stay PNG: a later script keeps a
    # sprite only when it is already WebP (newer art), so converting these would change which art shows
    if re.search(r'"e_[a-z_]+":"$', m.string[max(0, m.start() - 40):m.start()]): return m.group(0)
    key = hashlib.sha1(b.encode()).hexdigest()
    cache = _png2webp.cache
    if key not in cache:
        try:
            im = Image.open(io.BytesIO(base64.b64decode(b)))
            im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
            buf = io.BytesIO(); im.save(buf, 'WEBP', quality=90, method=6)
            w = buf.getvalue()
            cache[key] = ('data:image/webp;base64,' + base64.b64encode(w).decode()) if len(w) < len(b) * 3 // 4 else None
        except Exception:
            cache[key] = None
    return cache[key] or m.group(0)
_png2webp.cache = {}
s = re.sub(r'data:image/png;base64,([A-Za-z0-9+/=]+)', _png2webp, s)
# 65. v6.0: Title Case for every title, button, tab and label (English). Exact phrases only, bounded by quotes/tags,
#     so the translation table keys and their uses change together and sentences are untouched.
_SMALL = {'of','to','a','an','the','and','or','in','on','for','at','by','vs','per','with','from','as'}
def _tc(p):
    out = []
    for i, w in enumerate(p.split(' ')):
        if i and w in _SMALL and not out[-1].endswith(':'): out.append(w); continue
        out.append('-'.join(x[:1].upper() + x[1:] for x in w.split('-')) if w[:1].isalpha() else w)
    return ' '.join(out)
_TC = """Achievement bonus|Achievement points|Achievement unlocked|Achievements unlocked|Achievements and medals|Auto next wave|Back to battle|Base reward|Base upgrades|Basic monsters|Battle history|Best level|Boss bonus|Boss companion|Boss defeated|Boss drop only|Boss fight|Boss reinforcements|Boss treasure|Boss victories|Boss weakness|Bosses defeated|Button vibration|Call early|Call early for coins|Chests opened|Clean waves|Clear history|Coin bonus|Commander bonus|Commander level|Commander name|Commander record|Confirm level change|Copy code|Cover every base|Daily reward|Damage bonus|Damage types|Dark mending|Diamond exchange|Diamonds and the forge|Diamonds earned|Difficulty level|Discard and switch|Energy core|Enemies defeated|Enemies on this level|Export history file|Favourite tower|Final wave|Foes defeated|Forge a diamond|Frost aura|Frost bonus|Fully upgraded|Go to the map|Got it|Hidden realm|Highest difficulty|Hold the choke points|How to fight|Import code|Import history file|Items used|Keep playing|Kill gold|Kill healers first|Level price|Level reward|Level stars|Level tips|Levels cleared|Link save file|Linked file|Loot collected|Main menu|Map price|Max level|Max rank|Mix damage types|Monster drops|Multiple bases|New level|New rank|Next level|Next medal|Next rank|Next title|Next upgrade cost|Next wave|Open the web version|Open the world map|Perfect wins|Pin to showcase|Play time|Portal corruption|Progress transfer|Quit to map|Range bonus|Rare treasures|Restart level|Retry level|Reveal hidden map|Rotate layout|Sand dash|Save as file|Save image|Save items for bosses|Save medal card|See achievements|Select level|Show damage|Showcase medals|Shrines for your best tower|Signature move|Star bonus|Stars and crowns|Stars collected|Storm shield|Tactical choices|Tactical doctrine|This level|Towers built|Towers lost|Treasure time|Unlock level|Unlock map|Unlock price|Upgrade cost|Use a rune|Victory reward|Win rate|World atlas|World map|World progress|You are on|Choose file…|Help & strategy|Attack speed bonus|Mini-boss|Mini-bosses defeated|Mini-bosses (Level 4)|Slow, then burst|Auto-use|Haptics (vibration)|Download the Android app (APK)|Music: on|Music: off|Sold<br>out""".split('|')
_body_i = s.index('<style id="ck-fonts">')
_head, _body = s[:_body_i], s[_body_i:]
_tc_n = 0
for _p in _TC:
    _t = _tc(_p.replace('<br>', ' ')).replace(' ', '<br>', 1) if '<br>' in _p else _tc(_p)
    if _t == _p: continue
    _rx = re.compile(r"(?:(?<=['\"`>])|(?<=[^\x00-\x7f] ))" + re.escape(_p) + r"(?=['\"`<:·…])")
    _body, _k = _rx.subn(_t, _body); _tc_n += _k
s = _head + _body
print('title case replacements', _tc_n)
assert len(s.encode('utf8')) < 10_000_000, 'web HTML must stay under 10 MB (%d bytes)' % len(s.encode('utf8'))
open(out_path, 'w', encoding='utf8').write(s)
print('wrote', out_path, len(s))
