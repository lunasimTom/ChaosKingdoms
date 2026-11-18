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
# 11. Boss minion summons (level 33+) now get a 5-second warning countdown each. The
#     summons queue, so the 20% call waits for the 50% one; killing the boss cancels them.
rep("if(!L.m50&&r<=.5){L.m50=1;bossSummon(e,1)}if(!L.m20&&r<=.2){L.m20=1;bossSummon(e,2)}}});",
    "if(!L.m50&&r<=.5){L.m50=1;(L.sq=L.sq||[]).push(1)}if(!L.m20&&r<=.2){L.m20=1;(L.sq=L.sq||[]).push(2)}}});if(L.i>=32&&!L.demo)ckSummonTick(dt);")
rep("function bossSummon(boss,ph){",
    "function ckSummonTick(dt){if(!L.sq||!L.sq.length||L.over){L.sc=null;return}const b=L.en.find(x=>x.t==='boss'&&x.hp>0);if(!b){L.sq=[];L.sc=null;return}"
    "if(!L.sc){L.sc={ph:L.sq[0],t:5,last:6};toast(L.sc.ph===2?lvZ('⚠ 首领将召唤最后的援军！5 秒后降临','⚠ The boss will call its last reinforcements in 5 s!'):lvZ('⚠ 首领将召唤援军！5 秒后降临','⚠ The boss will call reinforcements in 5 s!'))}"
    "L.sc.t-=dt;const n=Math.ceil(L.sc.t);if(n<L.sc.last&&n>0){L.sc.last=n;beep(n<=2?880:620,.12,'square',.06)}"
    "if(L.sc.t<=0){const ph=L.sc.ph;L.sq.shift();L.sc=null;bossSummon(b,ph)}}\n"
    "function bossSummon(boss,ph){")
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
rep("L.inv[id]--;L.cdn[id]=CDT[id];", "if(id==='rep'&&L.lives>=30)return toast(lvZ('生命值已满','Lives are already full'));L.inv[id]--;L.cdn[id]=CDT[id];")
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

# ---------------------------------------------------------------- v2.6 separate bases
# 19. Each base has its own life pool (the level's lives are split between the bases, so
#     total lives and star ratings are unchanged). A leak damages the base it reached.
#     A destroyed base becomes smoking rubble and monsters re-route to the bases still
#     standing; the level is lost only when every base is destroyed. Heals (potion,
#     hearts, rewards) go to the weakest surviving base; L.lives stays the total.
rep("function leak(e){let d=e.d;e.hp=-1;if(!L.demo){if(!(L.bf.shield>0))L.lives=Math.max(0,L.lives-d.l);",
    "function leak(e){let d=e.d;e.hp=-1;if(!L.demo){ckBaseSync();if(!(L.bf.shield>0))ckBaseHit(e,d.l);")
rep("L.ct-=dt;updAir(dt);", "if(!L.demo)ckBaseSync();L.ct-=dt;updAir(dt);")
rep("drawRiver();dPortal();dBase();", "drawRiver();dPortal();dBase();ckBaseDraw();")
rep("function ckSummonTick(dt){",
    "function ckBaseSync(){if(!L.base||L.base.L!==L){const gs=L.goals.slice(),n=gs.length,per=Math.floor(L.lives/n);L.base=gs.map((g,i)=>({x:g[0],y:g[1],hp:per+(i<L.lives-per*n?1:0),dead:0,hit:-9}));L.base.L=L}"
    "const al=L.base.filter(b=>!b.dead);if(!al.length)return;let tot=0;for(const b of al)tot+=b.hp;"
    "while(L.lives>tot){let m=al[0];for(const b of al)if(b.hp<m.hp)m=b;m.hp++;tot++}while(L.lives<tot){let m=al[0];for(const b of al)if(b.hp>m.hp)m=b;if(m.hp<=0)break;m.hp--;tot--}}\n"
    "function ckBaseHit(e,n){const al=L.base.filter(b=>!b.dead);if(!al.length)return;let b=al[0],bd=1e9;for(const q of al){const dd=Math.hypot(q.x-e.x,q.y-e.y);if(dd<bd){bd=dd;b=q}}"
    "b.hp=Math.max(0,b.hp-n);b.hit=TM;if(b.hp<=0){b.dead=1;b.deadT=TM;const rest=L.base.filter(q=>!q.dead);const sp=pp(b.x,b.y);vBoom(sp.x,sp.y,1.6);vFlash('#ff6a3a',.35);L.shake=Math.max(L.shake||0,1);"
    "if(rest.length){const gi=L.goals.findIndex(g=>g[0]===b.x&&g[1]===b.y);if(gi>=0&&L.goals.length>1){L.goals.splice(gi,1);replan()}"
    "toast(lvZ('⚠ 一座基地已被摧毁！守住最后的基地！','⚠ A base has fallen! Defend the remaining base!'));window.ckBanner&&ckBanner(lvZ('基地沦陷','Base destroyed'),lvZ('死守到底','HOLD THE LINE'),1)}}"
    "let t=0;for(const q of L.base)if(!q.dead)t+=q.hp;L.lives=t}\n"
    "function ckBaseDraw(){if(L.demo||!L.base||L.base.L!==L||L.base.length<2)return;for(const b of L.base){const p=pp(b.x,b.y),u=tw/100;"
    "if(b.dead){ell(p.x,p.y+tw*.3,tw*.6,tw*.22,'#120a08cc');ell(p.x,p.y+tw*.25,tw*.42,tw*.15,'#2a1a14');ell(p.x-tw*.2,p.y+tw*.18,tw*.13,tw*.08,'#5a5068');ell(p.x+tw*.18,p.y+tw*.22,tw*.11,tw*.07,'#4a4258');ell(p.x+tw*.02,p.y+tw*.08,tw*.15,tw*.09,'#6a6078');ell(p.x-tw*.05,p.y+tw*.02,tw*.07,tw*.05,'#3fbfb0');for(let i=0;i<3;i++){const ph=(TM*.5+i/3)%1;c.globalAlpha=(1-ph)*.5;circ(p.x+Math.sin(i*2.1+TM)*tw*.15,p.y+tw*.1-ph*tw*.9,tw*(.08+.12*ph),'#3a3440')}"
    "c.globalAlpha=.6+.4*Math.sin(TM*9+b.x);circ(p.x-tw*.1,p.y+tw*.22,tw*.05,'#ff7a2a');circ(p.x+tw*.12,p.y+tw*.26,tw*.04,'#ffb04a');c.globalAlpha=1;continue}"
    "const mx=Math.max(1,b.hp,b.mx||0);b.mx=mx;const w=tw*.82,h=Math.max(5,tw*.11),x=p.x-w/2,up=p.y>H*.5,y=up?p.y-tw*1.05:p.y+tw*.62,f=b.hp/mx,hf=TM-b.hit<.4;"
    "c.fillStyle='#07101dd9';c.fillRect(x-2,y-2,w+4,h+4);c.fillStyle=hf?'#ffffff':f>.5?'#5eead4':f>.25?'#ffbd3f':'#ff4e58';c.fillRect(x,y,w*f,h);"
    "c.font=`900 ${Math.max(10,tw*.2)}px Nunito`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#07101d';const s='♥ '+b.hp;const ty=up?y-tw*.06:y+h+tw*.2;c.strokeText(s,p.x,ty);c.fillStyle=hf?'#ff8a8a':'#e8fffb';c.fillText(s,p.x,ty)}}\n"
    "function ckSummonTick(dt){")

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
