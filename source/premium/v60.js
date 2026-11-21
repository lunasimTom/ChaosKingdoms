/* ===== Chaos Kingdoms v6.0 · effects never cover the interface, cleaner home grid, soft ambience, consistency ===== */

// ---- 1. effect layer: lives inside #app right above the battlefield canvas and BELOW every HUD / menu element;
//         effects are clipped to the board itself and hidden while any menu, shop or popup is open ----
fxEnsure=function(){const c0=document.getElementById('cv');if(!c0||typeof W==='undefined')return false;let c=CKFX.cv;
 if(!c||c.parentElement!==c0.parentElement){if(c)c.remove();c=document.createElement('canvas');c.id='ck-fxc';c0.after(c);CKFX.cv=c;CKFX.g=c.getContext('2d')}
 const d=Math.min(2,devicePixelRatio||1),w=c0.clientWidth||c0.getBoundingClientRect().width,h=c0.clientHeight||c0.getBoundingClientRect().height;
 c.style.left=c0.offsetLeft+'px';c.style.top=c0.offsetTop+'px';c.style.width=w+'px';c.style.height=h+'px';
 const W2=Math.max(1,Math.round(w*d)),H2=Math.max(1,Math.round(h*d));if(c.width!==W2||c.height!==H2){c.width=W2;c.height=H2}
 CKFX.w=w;CKFX.h=h;CKFX.d=d;CKFX.k=w/W;
 try{const k=CKFX.k,bw=tw*(port?L.rows:L.cols),bh=tw*(port?L.cols:L.rows);CKFX.B={x:ox*k,y:oy*k,w:bw*k,h:bh*k}}catch(_){CKFX.B={x:0,y:0,w,h}}
 return true};
function ckUiBusy(){try{return !!(mOpen||(typeof L!=='undefined'&&L&&L.paused)||tab==='s'||document.hidden||S.mode!=='play')}catch(_){return false}}
fxLoop=function(now){const dt=Math.min(.05,(now-CKFX.last)/1000);CKFX.last=now;if(!fxEnsure()){CKFX.run=false;return}const g=CKFX.g,{w,h,d}=CKFX,B=CKFX.B;
 const busy=ckUiBusy();CKFX.cv.style.visibility=busy?'hidden':'visible';
 g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
 CKFX.list=CKFX.list.filter(e=>{if(e.L!==L||S.mode!=='play')return false;if(!busy)e.t+=dt;if(e.until&&e.t>.6&&!e.until()&&e.ending==null)e.ending=e.t;const end=e.ending!=null?Math.min(e.dur,e.ending+(e.fade||1)):e.dur;if(e.t>=end)return false;
  if(!busy){const fade=e.ending!=null?Math.max(0,1-(e.t-e.ending)/(e.fade||1)):1;g.save();g.beginPath();g.roundRect?g.roundRect(B.x,B.y,B.w,B.h,10):g.rect(B.x,B.y,B.w,B.h);g.clip();try{e.draw(g,e.t,Math.min(1,e.t/e.dur),fade,w,h,dt)}catch(_){}g.restore()}return true});
 if(CKFX.list.length)requestAnimationFrame(fxLoop);else{g.clearRect(0,0,w,h);CKFX.run=false}};
// edge glows hug the board, never the screen corners where the buttons are
fxEdge=function(g,w,h,col,a,wd){if(a<=0)return;const B=CKFX.B||{x:0,y:0,w,h},W0=Math.min(wd||Math.min(B.w,B.h)*.1,Math.min(B.w,B.h)*.1);g.globalCompositeOperation='lighter';
 [[B.x,B.y,B.w,W0,B.x,B.y,B.x,B.y+W0],[B.x,B.y+B.h-W0,B.w,W0,B.x,B.y+B.h,B.x,B.y+B.h-W0],[B.x,B.y,W0,B.h,B.x,B.y,B.x+W0,B.y],[B.x+B.w-W0,B.y,W0,B.h,B.x+B.w,B.y,B.x+B.w-W0,B.y]].forEach(([x,y,ww,hh,x0,y0,x1,y1])=>{const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a*.8;g.fillStyle=gr;g.fillRect(x,y,ww,hh)});g.globalAlpha=1;g.globalCompositeOperation='source-over'};
// Freeze, redesigned: a frosted glaze over the board, ice crystals growing on every frozen monster, drifting
// ice glints; the opening is a cold flash with spinning shards. Nothing grows from the screen corners.
let CK_FROSTPAT=null;
function ckFrostPat(){if(CK_FROSTPAT)return CK_FROSTPAT;const n=256,c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');g.strokeStyle='rgba(235,250,255,.55)';g.lineCap='round';
 const br=(x,y,a,l,d)=>{if(d>4||l<3)return;const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;g.lineWidth=Math.max(.5,1.6-d*.3);g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();br(x2,y2,a+rr(-.3,.3),l*.7,d+1);if(R1()<.6)br((x+x2)/2,(y+y2)/2,a+(R1()<.5?-1:1)*rr(.7,1.1),l*.5,d+1)};
 for(let i=0;i<26;i++){const x=rr(0,n),y=rr(0,n),a0=rr(0,TAU);for(let k=0;k<6;k++)br(x,y,a0+k*Math.PI/3,rr(6,16),1)}CK_FROSTPAT=c;return c}
fxFrost=function(dur,tint,until){const B=CKFX.B,cx=B.x+B.w/2,cy=B.y+B.h/2,pat=ckFrostPat();
 const shards=Array.from({length:46},()=>{const a=rr(0,TAU),s=rr(140,420);return{x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.45,.8),rot:rr(0,6),vr:rr(-8,8),sz:rr(3,7)}}),glints=Array.from({length:26},()=>({x:rr(B.x,B.x+B.w),y:rr(B.y,B.y+B.h),p:rr(0,6),v:rr(6,14)}));
 fxAdd({dur,fade:1.2,until,draw(g,t,p,f,w,h,dt){const B=CKFX.B,glaze=Math.min(1,t/.5)*f;
  if(t<.7)fxBloom(g,cx,cy,Math.max(B.w,B.h)*ease(t/.7)*.8,tint||'rgba(220,245,255,.9)',.5*(1-t/.7));
  // glaze + crystalline texture over the board
  g.globalAlpha=.10*glaze;g.fillStyle='#cfefff';g.fillRect(B.x,B.y,B.w,B.h);g.globalAlpha=.30*glaze;const pt=g.createPattern(pat,'repeat');g.fillStyle=pt;g.fillRect(B.x,B.y,B.w,B.h);g.globalAlpha=1;
  fxEdge(g,w,h,'rgba(200,240,255,.6)',.55*glaze,Math.min(B.w,B.h)*.06);
  // ice crystals on frozen monsters
  g.globalCompositeOperation='lighter';
  for(const e of L.en){if(e.hp<=0||!(e.fz>0))continue;const q=fxS(eS(e)),s=tw*CKFX.k*.42,grow=Math.min(1,(t+.001)/.35);
   for(let k=0;k<6;k++){const a=k*Math.PI/3+e.x,len=s*(.55+((k*37)%5)/10)*grow;g.save();g.translate(q.x,q.y);g.rotate(a);const gr=g.createLinearGradient(0,0,0,-len);gr.addColorStop(0,'rgba(190,235,255,.55)');gr.addColorStop(1,'rgba(255,255,255,.95)');g.fillStyle=gr;g.globalAlpha=.85*f;g.beginPath();g.moveTo(-s*.12,0);g.lineTo(0,-len);g.lineTo(s*.12,0);g.closePath();g.fill();g.restore()}}
  fxParts(shards,g,dt,s=>{g.save();g.translate(s.x,s.y);g.rotate(s.rot);g.globalAlpha=Math.min(1,s.life*2);g.fillStyle='#eafcff';g.beginPath();g.moveTo(0,-s.sz);g.lineTo(s.sz*.35,0);g.lineTo(0,s.sz);g.lineTo(-s.sz*.35,0);g.closePath();g.fill();g.restore()});
  for(const q of glints){q.y+=q.v*dt;if(q.y>B.y+B.h)q.y=B.y;const tw2=Math.max(0,Math.sin(t*3+q.p));if(tw2<.55)continue;g.globalAlpha=(tw2-.55)*2*f;g.fillStyle='#fff';g.save();g.translate(q.x,q.y);g.rotate(.785);g.fillRect(-.8,-4,1.6,8);g.fillRect(-4,-.8,8,1.6);g.restore()}
  g.globalAlpha=1;g.globalCompositeOperation='source-over'}})};

// ---- 2. home grid: APP = Records, Battle History, Progress Transfer / Screen, Redeem Code, Music / Language, Settings, Help;
//         browser = the same with Install in place of Records. No layout thrash (fixes the flicker while dragging the slider). ----
ckHomeTiles=function(){const card=document.querySelector('#title .tcard.ck-home'),util=card&&card.querySelector('.ck-hutil');if(!util)return;
 const mk=(id,ico,txt,attrs,onclick)=>{let b=document.getElementById(id);if(!b){b=document.createElement('button');b.id=id;b.type='button';b.className='bt g ck-tile';if(attrs)for(const k in attrs)b.setAttribute(k,attrs[k]);if(onclick)b.onclick=onclick;util.appendChild(b)}const lab=lvZ(txt[0],txt[1]),key=LANG+lab;if(b.dataset.l!==key){b.dataset.l=key;b.innerHTML=`<span class="ckico-w">${ckIcoSvg(ico)}</span>${lab}`}if(!b.classList.contains('ck-tile'))b.classList.add('ck-tile');return b};
 const app=!!window.CKAndroid||ckStandalone();
 const first=app?mk('ckrecbtn','medal',['统帅档案','Records'],null,()=>{try{openProfile()}catch(_){}}):mk('ckinstall','install',['安装','Install'],null,()=>{try{ckInstall()}catch(_){}});
 const other=app?document.getElementById('ckinstall'):document.getElementById('ckrecbtn');if(other)other.remove();
 const help=mk('ckhelpbtn','help',['帮助','Help']),set=mk('ckhomeset','gear',['设置','Settings'],{'data-cksettings':'title'});
 const music=util.querySelector('.musbtn'),rot=util.querySelector('.rotbtn'),lang=util.querySelector('.langbtn');
 const order=[first,document.getElementById('histbtn'),document.getElementById('xferbtn'),rot,document.getElementById('topupbtn'),music,lang,set,help].filter(Boolean);
 order.forEach((b,k)=>{if(util.children[k]!==b)util.insertBefore(b,util.children[k]||null)});
 [...util.children].forEach(b=>{if(!order.includes(b))b.remove()})};
ckInstallBtn=function(){try{ckHomeTiles()}catch(_){}};
// fit without resetting the zoom first (the reset made the bottom row flicker on every slider step)
ckHomeFit=function(){const card=document.querySelector('#title .tcard.ck-home'),t=document.getElementById('title');if(!card||!t||!t.offsetWidth)return;const z0=parseFloat(card.style.zoom)||1;
 const kids=[...card.children].filter(e=>{if(!e.offsetParent)return false;const r=e.getBoundingClientRect();return r.height>0&&r.width>0});if(!kids.length)return;
 let top=1e9,bot=-1e9;for(const e of kids){const r=e.getBoundingClientRect();top=Math.min(top,r.top);bot=Math.max(bot,r.bottom)}
 const natural=(bot-top)/z0+24,z=Math.max(.7,Math.min(1,innerHeight/natural));if(Math.abs(z-z0)>.008)card.style.zoom=z>=.999?'':z.toFixed(3);if(t.scrollTop)t.scrollTop=0};

// ---- 3. Chinese names for the 32 newer achievements everywhere TL() is used (fixes English leaking into Chinese text) ----
(function(){try{if(typeof ZH!=='object'||typeof ACHS==='undefined')return;for(const a of ACHS){if(a.zhN&&a.name&&!ZH[a.name])ZH[a.name]=a.zhN;if(a.zhD&&a.desc&&!ZH[a.desc])ZH[a.desc]=a.zhD}}catch(_){}})();
setTimeout(()=>{try{for(const a of ACHS){if(a.zhN&&a.name&&!ZH[a.name])ZH[a.name]=a.zhN;if(a.zhD&&a.desc&&!ZH[a.desc])ZH[a.desc]=a.zhD}}catch(_){}},2500);

// ---- 4. one banner at a time: mini-boss / boss / special banners wait for a wave banner to finish ----
(function(){const ban=document.getElementById('ck-banner');let busyUntil=0;if(ban)new MutationObserver(()=>{if(ban.classList.contains('show'))busyUntil=performance.now()+(ban.classList.contains('boss')?1700:1250)}).observe(ban,{attributes:true,attributeFilter:['class']});
 const o=window.ckBanner;if(typeof o!=='function')return;const q=[];let tmr=0;const pump=()=>{tmr=0;if(!q.length)return;const wait=busyUntil-performance.now();if(wait>30){tmr=setTimeout(pump,wait);return}const a=q.shift();o.apply(null,a);if(q.length)tmr=setTimeout(pump,1300)};
 window.ckBanner=function(){q.push([...arguments]);if(!tmr)pump()}})();

// ---- 5. ambience: soft generated beds (no hiss, no high frequencies), mixed far below the music ----
const CK_AMBB={};
function ckAmbBuf(n){if(typeof au==='undefined'||!au)return null;const key=n+'|'+au.sampleRate;if(CK_AMBB[key])return CK_AMBB[key];
 const sr=au.sampleRate,len=Math.floor(sr*10),b=au.createBuffer(2,len,sr),fade=Math.floor(sr*1.2);
 for(let ch=0;ch<2;ch++){const a=b.getChannelData(ch);let l1=0,l2=0,l3=0;const seed=ch*7+1;
  for(let i=0;i<len;i++){const t=i/sr,wn=Math.random()*2-1;l1+=(wn-l1)*.02;l2+=(l1-l2)*.05;l3+=(l2-l3)*.08;   // very dark noise (~120-300 Hz)
   let v=0;if(n==='wind'){v=l3*6*(0.55+0.45*Math.sin(t*TAU*.08+seed))}
   else if(n==='rain'){v=l2*3.2*(0.8+0.2*Math.sin(t*TAU*.05+seed))}
   else{v=(Math.sin(TAU*55*t)*.5+Math.sin(TAU*82.4*t+seed)*.3+Math.sin(TAU*110.2*t)*.18)*(0.6+0.4*Math.sin(t*TAU*.07+seed))*.35+l3*2}
   a[i]=v*.5}
  // seamless loop: crossfade the tail into the head
  for(let i=0;i<fade;i++){const k=i/fade;a[i]=a[i]*k+a[len-fade+i]*(1-k)}
  let pk=0;for(let i=0;i<len;i++)pk=Math.max(pk,Math.abs(a[i]));const nm=pk>0?.8/pk:1;for(let i=0;i<len;i++)a[i]*=nm}
 return CK_AMBB[key]=b}
