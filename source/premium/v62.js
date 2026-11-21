/* ===== Chaos Kingdoms v6.2 · effects drawn with the map, freezable bosses that never lock, quieter busy fights ===== */

// ---- 1. item effects are drawn inside the battlefield render itself: same shake, same scale, same rounded board ----
(function(){const old=document.getElementById('ck-fxc');if(old)old.remove()})();
fxEnsure=function(){if(typeof W==='undefined'||typeof L==='undefined'||!L)return false;CKFX.w=W;CKFX.h=H;CKFX.d=1;CKFX.k=1;
 try{CKFX.B={x:ox,y:oy,w:tw*(port?L.rows:L.cols),h:tw*(port?L.cols:L.rows)}}catch(_){CKFX.B={x:0,y:0,w:W,h:H}}return true};
fxAdd=function(e){if(!fxEnsure())return;e.t=0;e.L=L;CKFX.list.push(e);CKFX.last=performance.now()};
let CK_FXT=0;
function ckFxWorld(){if(!CKFX.list.length||!fxEnsure())return;const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-(CK_FXT||now))/1000));CK_FXT=now;
 const busy=ckUiBusy(),B=CKFX.B,g=c;
 CKFX.list=CKFX.list.filter(e=>{if(e.L!==L||S.mode!=='play')return false;if(!busy)e.t+=dt;if(e.until&&e.t>.6&&!e.until()&&e.ending==null)e.ending=e.t;const end=e.ending!=null?Math.min(e.dur,e.ending+(e.fade||1)):e.dur;if(e.t>=end)return false;
  if(!busy){const fade=e.ending!=null?Math.max(0,1-(e.t-e.ending)/(e.fade||1)):1;g.save();g.beginPath();g.roundRect(B.x,B.y,B.w,B.h,10);g.clip();try{e.draw(g,e.t,Math.min(1,e.t/e.dur),fade,W,H,dt)}catch(_){}g.restore()}return true})}
(function(){const o=ckLootDraw;ckLootDraw=function(){try{ckFxWorld()}catch(_){}return o.apply(this,arguments)}})();
fxLoop=function(){};
// quieter versions of the effects that used to tint the board
fxBloom=(function(o){return function(g,x,y,r,col,a){return o(g,x,y,Math.min(r,tw*2.2),col,a*.85)}})(fxBloom);

// ---- 2. bosses can be frozen, but their phase / rage timers keep running so a boss can never get stuck at a health floor ----
function ckBossFrozenTick(e,dt){if(L.demo)return;const r=e.hp/e.mx;
 if(!e.s1&&r<.66){e.s1=1;for(let k=0;k<4;k++)spawn('grunt',{x:e.x+(Math.random()-.5)*.9,y:e.y+(Math.random()-.5)*.9});L.shake=Math.max(L.shake||0,.5);toast('The boss calls its guards')}
 if(!e.s2&&r<(L.i>=39?.2:.33)){e.s2=1;e.en=1;if(L.i>=39){e.rage=1;e.chg=0;e.smash=[];L.shake=Math.max(L.shake||0,.9);try{sfx('bossalert',.6)}catch(_){}toast(lvZ('⚠ 首领狂暴 8 秒！','⚠ The boss is ENRAGED for 8 s!'));if(window.ckBanner)ckBanner(lvZ('首领狂暴','Boss enraged'),lvZ('狂暴模式','ENRAGED'),1)}}
 if(e.rage){if(!e.rgT){try{CKS.bossRage(e)}catch(_){}}e.rgT=(e.rgT||0)+dt;const rt=e.rgT,ss=x=>x*x*(3-2*x);e.rg=rt<.35?ss(rt/.35):rt<CK_RAGE_T-.45?1:rt<CK_RAGE_T?ss((CK_RAGE_T-rt)/.45):0;
  if(rt>=CK_RAGE_T){e.rage=0;e.rg=0;e.en=0;e.rw=null;toast(lvZ('首领的狂暴平息了','The boss calms down'))}}}

// ---- 3. busy fights: Gold Bag shows fewer coins for a shorter time ----
(function(){const o=ckItemFx2;ckItemFx2=function(id){if(id==='idol'){fxGold(2,()=>true,28);return}if(id==='r_midas'){fxGold(2.2,()=>true,36);return}return o(id)}})();

// ---- 4. combat synth (snd) and beeps join the voice budget; boss voices share one cooldown across all bosses ----
let CK_SNDV=0;const CK_SNDL={};
(function(){const o=snd;snd=function(k,v){if(!mon||!au)return;const now=au.currentTime,sp=(typeof L!=='undefined'&&L&&L.speed)||1,gap=.07*sp;
 if(CK_SNDL[k]!=null&&now-CK_SNDL[k]<gap)return;if(CK_SNDV>=6)return;CK_SNDL[k]=now;CK_SNDV++;setTimeout(()=>{CK_SNDV=Math.max(0,CK_SNDV-1)},300);return o.apply(this,arguments)}})();
(function(){const o=beep;let last=0;beep=function(){if(!au)return;const now=au.currentTime;if(now-last<.05)return;last=now;return o.apply(this,arguments)}})();
setTimeout(function(){['bossHurt','bossAttack'].forEach(k=>{const o=CKS[k];if(typeof o!=='function')return;let last=0;CKS[k]=function(){const now=performance.now(),gap=(k==='bossHurt'?900:1500)*Math.max(1,((typeof L!=='undefined'&&L&&L.speed)||1)*.7);if(now-last<gap)return true;last=now;return o.apply(this,arguments)}})},0);
