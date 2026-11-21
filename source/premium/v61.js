/* ===== Chaos Kingdoms v6.1 · no screen tints, visible tower range, tower panel, pause audio, smooth sound at 2x/3x ===== */

// ---- 1. items never tint the whole screen: the original full-screen colour flash is skipped during an item use;
//         effects stay on monsters, impacts and bases (see the v6.0 effect layer) ----
(function(){const q=ckQuietSfx;ckQuietSfx=function(fn){const f0=vFlash;vFlash=function(){};try{return q(fn)}finally{vFlash=f0}}})();
// Freeze without any board glaze: frost patches under each frozen monster + crystals on it + a short cold burst
fxFrost=function(dur,tint,until){const B=CKFX.B,cx=B.x+B.w/2,cy=B.y+B.h/2;
 const shards=Array.from({length:34},()=>{const a=rr(0,TAU),s=rr(140,380);return{x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.4,.7),rot:rr(0,6),vr:rr(-8,8),sz:rr(3,6)}});
 fxAdd({dur,fade:1,until,draw(g,t,p,f,w,h,dt){const k=CKFX.k,s0=tw*k;
  if(t<.5)fxBloom(g,cx,cy,Math.max(B.w,B.h)*ease(t/.5)*.35,tint||'rgba(225,248,255,.9)',.35*(1-t/.5));
  for(const e of L.en){if(e.hp<=0||!(e.fz>0))continue;const q=fxS(eS(e)),grow=Math.min(1,(t+.001)/.3);
   // frost patch on the ground
   const gr=g.createRadialGradient(q.x,q.y+s0*.25,0,q.x,q.y+s0*.25,s0*.7);gr.addColorStop(0,`rgba(225,248,255,${.55*f})`);gr.addColorStop(1,'rgba(225,248,255,0)');g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y+s0*.25,s0*.7,s0*.32,0,0,TAU);g.fill();
   g.globalCompositeOperation='lighter';
   for(let j=0;j<6;j++){const a=j*Math.PI/3+e.x,len=s0*.4*(.55+((j*37)%5)/10)*grow;g.save();g.translate(q.x,q.y);g.rotate(a);const gg=g.createLinearGradient(0,0,0,-len);gg.addColorStop(0,'rgba(190,235,255,.5)');gg.addColorStop(1,'rgba(255,255,255,.95)');g.fillStyle=gg;g.globalAlpha=.85*f;g.beginPath();g.moveTo(-s0*.05,0);g.lineTo(0,-len);g.lineTo(s0*.05,0);g.closePath();g.fill();g.restore()}
   g.globalAlpha=1;g.globalCompositeOperation='source-over'}
  g.globalCompositeOperation='lighter';fxParts(shards,g,dt,s=>{g.save();g.translate(s.x,s.y);g.rotate(s.rot);g.globalAlpha=Math.min(1,s.life*2);g.fillStyle='#eafcff';g.beginPath();g.moveTo(0,-s.sz);g.lineTo(s.sz*.35,0);g.lineTo(0,s.sz);g.lineTo(-s.sz*.35,0);g.closePath();g.fill();g.restore()});g.globalAlpha=1;g.globalCompositeOperation='source-over'}})};
// no board-wide tints or rims from any effect (long buffs have no on-map indicator)
fxEdge=function(){};
(function(){const o=ckItemFx2;ckItemFx2=function(id){
 // keep the cinematic moments, drop the long-running screen overlays
 if(id==='ovc'||id==='horn'||id==='r_war'){if(id!=='ovc')fxWarBurst();return}
 if(id==='idol'){fxGold(2.8,()=>true,60);return}
 if(id==='r_midas'){fxSheen('rgba(255,235,150,.45)');fxGold(3,()=>true,80);return}
 if(id==='aid'){fxHoly(2.6,()=>true);return}
 if(id==='ibomb'){fxSnow(6);return}
 if(id==='shield'){fxDome(15,()=>L.bf.shield>0,'rgba(140,215,255,A)');return}
 return o(id)}})();
// War Horn: one rolling sound wave up the board (no lasting rim, no rings under towers)
function fxWarBurst(){fxAdd({dur:1.3,draw(g,t,p,f,w,h,dt){const B=CKFX.B;g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const k=(t-i*.18)/1.05;if(k<0||k>1)continue;const y=B.y+B.h*(1-ease(k)*1.1),a=(1-k)*.5;const gr=g.createLinearGradient(0,y-36,0,y+36);gr.addColorStop(0,'rgba(255,200,90,0)');gr.addColorStop(.5,`rgba(255,215,120,${a})`);gr.addColorStop(1,'rgba(255,200,90,0)');g.fillStyle=gr;g.beginPath();g.moveTo(B.x,y+36);g.quadraticCurveTo(B.x+B.w/2,y-50,B.x+B.w,y+36);g.lineTo(B.x+B.w,y+70);g.quadraticCurveTo(B.x+B.w/2,y-16,B.x,y+70);g.closePath();g.fill()}g.globalCompositeOperation='source-over'}})}
// Ice Bomb: gentle snowfall only (no fog veil)
function fxSnow(dur){const B=CKFX.B,snow=Array.from({length:60},()=>({x:rr(B.x,B.x+B.w),y:rr(B.y-B.h,B.y),v:rr(25,60),sw:rr(0,6),s:rr(1,2.4)}));
 fxAdd({dur,fade:1.2,until:()=>L.en.some(e=>e.sl>0),draw(g,t,p,f,w,h,dt){g.fillStyle='#f2fbff';for(const s of snow){s.y+=s.v*dt;s.x+=Math.sin(t*1.3+s.sw)*12*dt;if(s.y>B.y+B.h){s.y=B.y-4;s.x=rr(B.x,B.x+B.w)}g.globalAlpha=.8*f;g.beginPath();g.arc(s.x,s.y,s.s,0,TAU);g.fill()}g.globalAlpha=1}})}

// ---- 2. tower range: a clear but soft circle around the selected tower while its panel is open ----
function ckSelRing(){if(!selT||!L||L.demo||!L.tr.includes(selT))return;const p=pp(selT.x,selT.y);let rg=0;try{rg=ts(selT).rg}catch(_){}if(!(rg>0))return;const r=rg*tw,pu=.5+.5*Math.sin(TM*3);
 c.save();const g=c.createRadialGradient(p.x,p.y,r*.15,p.x,p.y,r);g.addColorStop(0,'rgba(255,230,160,.05)');g.addColorStop(.85,'rgba(255,230,160,.10)');g.addColorStop(1,'rgba(255,230,160,.16)');c.fillStyle=g;c.beginPath();c.arc(p.x,p.y,r,0,7);c.fill();
 c.lineWidth=Math.max(1.5,tw*.04);c.strokeStyle=`rgba(255,236,170,${.55+.2*pu})`;c.shadowColor='rgba(255,210,110,.7)';c.shadowBlur=8;c.beginPath();c.arc(p.x,p.y,r,0,7);c.stroke();c.restore()}

// ---- 3. pause: music drops to a whisper (not silent), effects and ambience go quiet; everything returns on resume ----
let CK_DUCK=false;
function ckDuck(on){CK_DUCK=on;try{if(!au)return;const t=au.currentTime;if(mb)mb.gain.setTargetAtTime((on?.06:.85)*musV*(mon?1:0),t,.12);if(sg)sg.gain.setTargetAtTime(on?0:.55,t,.08);if(ag)ag.gain.setTargetAtTime(on?0:.045*ambV,t,.12);if(on&&au.state!=='running')au.resume().catch(()=>{})}catch(_){}}
(function(){const o=resumeGameAudio;resumeGameAudio=function(){ckDuck(false);return o.apply(this,arguments)}})();
(function(){const o=closeM;closeM=function(){const r=o.apply(this,arguments);try{if(CK_DUCK&&!mOpen)setTimeout(()=>{if(CK_DUCK&&!mOpen)ckDuck(false)},0)}catch(_){}return r}})();

// ---- 4. smooth audio at 2x/3x with many items: one copy of the same sound per 60 ms, at most ~16 voices at once,
//         and fewer repeated hit sounds when the game runs fast ----
let CK_VOX=0;const CK_SLAST={};
(function(){const o=sfx;sfx=function(k,v){if(!mon||!au)return false;const now=au.currentTime,sp=(typeof L!=='undefined'&&L&&L.speed)||1,gap=(sp>1?.09:.06)*(/hit|shot|arrow|zap|boom|leak/.test(k)?sp:1);
 if(CK_SLAST[k]!=null&&now-CK_SLAST[k]<gap)return true;if(CK_VOX>=16)return true;CK_SLAST[k]=now;CK_VOX++;setTimeout(()=>{CK_VOX=Math.max(0,CK_VOX-1)},350);return o.apply(this,arguments)}})();
(function(){const o=beep;beep=function(){if(!au)return;if(CK_VOX>=16)return;CK_VOX++;setTimeout(()=>{CK_VOX=Math.max(0,CK_VOX-1)},250);return o.apply(this,arguments)}})();
// monster voices: allow fewer per 100 ms when the game runs fast
setTimeout(function(){['hurt','die'].forEach(k=>{const o=CKS[k];if(typeof o!=='function')return;let last=0;CKS[k]=function(e){const sp=(typeof L!=='undefined'&&L&&L.speed)||1,now=performance.now();if(sp>1&&now-last<(k==='hurt'?60*sp:30*sp))return false;last=now;return o.apply(this,arguments)}})},0);

// ---- 5. tower panel closes 35% sooner (0.98 s idle) — see build step; achievement popup in battle: shorter, below the HUD ----
(function(){const o=window.ckABanner||(typeof ckABanner==='function'?ckABanner:null);if(!o)return;ckABanner=function(){const r=o.apply(this,arguments);try{if(S.mode==='play'){const el=document.querySelector('.ck-abn:last-of-type');if(el){el.classList.add('ck-abn-battle');setTimeout(()=>{try{el.click&&el.classList.add('ck-abn-out');setTimeout(()=>el.remove(),400)}catch(_){}},4000)}}}catch(_){}return r}})();
