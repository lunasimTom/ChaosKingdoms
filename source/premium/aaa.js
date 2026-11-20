/* =====================================================================
   CHAOS KINGDOMS · PREMIUM PRESENTATION LAYER (v2.0)
   Cinematic title, dynamic lighting overlay, wave banners, HUD feedback.
   Purely additive: every hook is guarded so the core game never depends on it.
   ===================================================================== */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const _gc={};const G=k=>{const f=_gc[k]||(_gc[k]=new Function('try{return '+k+'}catch(e){}'));return f()}; // read core globals (let/const live in global lexical scope)
const DPR=Math.min(2,window.devicePixelRatio||1);
const LOW=(navigator.hardwareConcurrency||4)<=4||(navigator.deviceMemory||4)<=3;
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const zh=()=>G('LANG')==='zh';

/* ---------------- splash ---------------- */
(function splash(){
 const sp=$('ck-splash');if(!sp)return;const bar=sp.querySelector('.cks-bar i'),tip=sp.querySelector('.cks-tip');
 if(tip&&zh())tip.textContent='王国正在苏醒…';
 const t0=performance.now();let done=false;
 const finish=()=>{if(done)return;done=true;if(bar)bar.style.width='100%';setTimeout(()=>{sp.classList.add('out');setTimeout(()=>sp.remove(),800)},280)};
 if(bar){bar.style.width='72%'}
 const go=()=>setTimeout(finish,Math.max(0,1100-(performance.now()-t0)));
 if(document.readyState==='complete')go();else addEventListener('load',go,{once:true});
 setTimeout(finish,6000);
})();

/* ---------------- title backdrop ---------------- */
(function title(){
 const t=$('title');if(!t||$('ck-bg'))return;const SP=G('SPRD')||{};
 const bg=document.createElement('div');bg.id='ck-bg';
 bg.innerHTML=`<div class="ckb-art"></div><div class="ckb-shade"></div><div class="ckb-rays"></div><canvas></canvas><div class="ckb-fog"></div><div class="ckb-ver">v5.5.2 · Strategy Edition</div>`;
 const art=SP.m_forest||SP.m_sky;if(art)bg.querySelector('.ckb-art').style.backgroundImage=`url("${art}")`;
 t.insertBefore(bg,t.firstChild);
 const pb=$('play');if(pb&&!pb.querySelector('.ck-sweep')){pb.classList.add('ck-shine');const s=document.createElement('i');s.className='ck-sweep';pb.appendChild(s)}
 // embers
 const cv=bg.querySelector('canvas'),g=cv.getContext('2d');let w=0,h=0,ps=[];
 const N=LOW?26:46;
 const spark=document.createElement('canvas');spark.width=spark.height=32;{const s=spark.getContext('2d'),gr=s.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,240,200,1)');gr.addColorStop(.25,'rgba(255,196,90,.85)');gr.addColorStop(1,'rgba(255,140,40,0)');s.fillStyle=gr;s.fillRect(0,0,32,32)}
 const mk=(init)=>({x:Math.random()*w,y:init?Math.random()*h:h+10,r:(Math.random()*2.2+.8)*DPR,vy:-(Math.random()*18+8)*DPR,vx:(Math.random()-.5)*8*DPR,ph:Math.random()*6.28,a:Math.random()*.6+.25});
 const size=()=>{const r=t.getBoundingClientRect();const nw=Math.max(1,Math.round(t.clientWidth*DPR*.75)),nh=Math.max(1,Math.round(t.clientHeight*DPR*.75));if(nw!==w||nh!==h){w=cv.width=nw;h=cv.height=nh;ps=Array.from({length:N},()=>mk(true))}};
 let last=0;
 const step=ts=>{requestAnimationFrame(step);if(!t.classList.contains('on')||document.hidden||RM)return;if(ts-last<(LOW?40:28))return;const dt=Math.min(.06,(ts-last)/1e3||.03);last=ts;size();g.clearRect(0,0,w,h);g.globalCompositeOperation='lighter';
  for(const p of ps){p.y+=p.vy*dt;p.x+=(p.vx+Math.sin(ts/900+p.ph)*6*DPR)*dt;if(p.y<-12)Object.assign(p,mk(false));const fl=.65+.35*Math.sin(ts/260+p.ph*3),k=Math.min(1,p.y/(h*.35));g.globalAlpha=p.a*fl*Math.max(0,k);const s=p.r*7;g.drawImage(spark,p.x-s/2,p.y-s/2,s,s)}
  g.globalAlpha=1;g.globalCompositeOperation='source-over'};
 requestAnimationFrame(step);
})();

/* ---------------- in-game lighting overlay ---------------- */
(function fx(){
 const app=$('app'),base=$('cv');if(!app||!base||$('ck-fx'))return;
 const cv=document.createElement('canvas');cv.id='ck-fx';base.insertAdjacentElement('afterend',cv);
 const g=cv.getContext('2d');
 const THEME={forest:{light:'255,226,150',shade:'8,24,12',mote:'214,255,140',motes:1},desert:{light:'255,214,140',shade:'40,20,4',mote:'255,226,170',motes:0},ice:{light:'200,232,255',shade:'6,18,40',mote:'230,246,255',motes:0},lava:{light:'255,150,80',shade:'40,6,2',mote:'255,150,70',motes:0},sky:{light:'255,246,214',shade:'10,20,46',mote:'255,255,255',motes:1},dungeon:{light:'190,150,255',shade:'12,4,26',mote:'200,160,255',motes:1},abyss:{light:'160,140,255',shade:'8,2,24',mote:'190,170,255',motes:1}};
 let key='',bw=0,bh=0,bx=0,by=0,q=1,vign=null,light=null,cloud=null,mote=null,motes=[],th=THEME.forest,flash=0,flashC='255,40,40',lives=null,last=0,bossT=0;
 const mkCloud=()=>{const c=document.createElement('canvas');c.width=c.height=256;const s=c.getContext('2d');for(let i=0;i<7;i++){const x=60+Math.random()*136,y=70+Math.random()*116,r=50+Math.random()*50,gr=s.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');s.fillStyle=gr;s.fillRect(0,0,256,256)}return c};
 const mkMote=col=>{const c=document.createElement('canvas');c.width=c.height=32;const s=c.getContext('2d'),gr=s.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,`rgba(${col},1)`);gr.addColorStop(.3,`rgba(${col},.6)`);gr.addColorStop(1,`rgba(${col},0)`);s.fillStyle=gr;s.fillRect(0,0,32,32);return c};
 const rebuild=()=>{
  const W=G('W'),H=G('H'),L=G('L'),port=G('port'),tw=G('tw'),ox=G('ox'),oy=G('oy'),FS=G('FS')||1;
  q=Math.min(1.25,(window.devicePixelRatio||1)*FS)*(LOW?.6:.8);cv.width=Math.max(1,Math.round(W*q));cv.height=Math.max(1,Math.round(H*q));
  bx=ox;by=oy;bw=(port?L.rows:L.cols)*tw;bh=(port?L.cols:L.rows)*tw;
  const m=(L.reg&&L.reg.m)||'forest';th=THEME[m]||(L.reg&&L.reg.wx==='snow'?THEME.ice:L.reg&&L.reg.wx==='ember'?THEME.lava:THEME.sky);
  // vignette + edge shade
  vign=document.createElement('canvas');vign.width=Math.max(1,Math.round(bw*q));vign.height=Math.max(1,Math.round(bh*q));{const s=vign.getContext('2d'),w=vign.width,h=vign.height,r=Math.hypot(w,h)/2,gr=s.createRadialGradient(w/2,h*.46,r*.35,w/2,h/2,r*1.02);gr.addColorStop(0,`rgba(${th.shade},0)`);gr.addColorStop(.7,`rgba(${th.shade},.16)`);gr.addColorStop(1,`rgba(${th.shade},.5)`);s.fillStyle=gr;s.fillRect(0,0,w,h)}
  // key light (top-left sun)
  light=document.createElement('canvas');light.width=vign.width;light.height=vign.height;{const s=light.getContext('2d'),w=light.width,h=light.height,gr=s.createRadialGradient(w*.12,-h*.08,0,w*.12,-h*.08,Math.hypot(w,h)*.85);gr.addColorStop(0,`rgba(${th.light},.22)`);gr.addColorStop(.45,`rgba(${th.light},.07)`);gr.addColorStop(1,`rgba(${th.light},0)`);s.fillStyle=gr;s.fillRect(0,0,w,h)}
  if(!cloud)cloud=mkCloud();mote=mkMote(th.mote);
  motes=th.motes?Array.from({length:LOW?10:18},()=>({x:Math.random()*bw,y:Math.random()*bh,ph:Math.random()*6.28,sp:.4+Math.random()*.8,r:2+Math.random()*2.5})):[];
 };
 const banner=document.createElement('div');banner.id='ck-banner';banner.innerHTML='<div class="ckw-band"><div class="ckw-k"></div><div class="ckw-t"></div></div>';app.appendChild(banner);
 const showBanner=(k,t,boss)=>{if(RM)return;banner.querySelector('.ckw-k').textContent=k;banner.querySelector('.ckw-t').textContent=t;banner.classList.toggle('boss',!!boss);banner.classList.remove('show');void banner.offsetWidth;banner.classList.add('show')};
 window.ckBanner=showBanner;
 const sumEl=document.createElement('div');sumEl.id='ck-sumcd';sumEl.hidden=true;sumEl.innerHTML='<div class="cks-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/></svg><span class="cks-n">5</span></div><div class="cks-l"></div>';app.appendChild(sumEl);let sumN=0;
 let lastWave=-1,lastLevel=null;
 let qLast=0,qEma=16,qBad=0,qGood=0,bossT2=0;
 const bossEl=document.createElement('div');bossEl.id='ck-bossbar';bossEl.hidden=true;bossEl.innerHTML='<div class="ckb-h"><b class="ckb-n"></b><span class="ckb-p"></span></div><div class="ckb-t"><i class="ckb-f"></i><u style="left:50%"></u><u style="left:25%"></u></div>';app.appendChild(bossEl);
 const step=ts=>{requestAnimationFrame(step);
  const S=G('S'),L=G('L');
  if(!S||!L||S.mode!=='play'||L.demo||window.CK_NOFX){if(!sumEl.hidden){sumEl.hidden=true;sumN=0}if(!bossEl.hidden){bossEl.hidden=true;document.body.classList.remove('ck-boss')}if(cv.style.display!=='none'){cv.style.display='none'}lastWave=-1;return}
  if(cv.style.display==='none')cv.style.display='';
  if(document.hidden)return;
  // wave banner
  if(lastLevel!==L){lastLevel=L;lastWave=L.wave;lives=L.lives}
  if(L.wave!==lastWave){if(L.wave>lastWave&&L.wave>0&&!L.over){const boss=L.boss&&L.wave===L.waves;showBanner(boss?(zh()?'最终一波':'Final wave'):(zh()?`第 ${L.wave} / ${L.waves} 波`:`Wave ${L.wave} of ${L.waves}`),boss?(zh()?'首领来袭':'BOSS INCOMING'):(zh()?`第 ${L.wave} 波`:`WAVE ${L.wave}`),boss);if(boss)bossT=4}lastWave=L.wave}
  if(lives!=null&&L.lives<lives){flash=Math.min(1,flash+.55);flashC='255,40,40'}lives=L.lives;
  // adaptive quality: watch real frame time; drop optional effects on slow devices
  {const fdt=ts-qLast;qLast=ts;if(fdt>0&&fdt<250){qEma=qEma*.94+fdt*.06;if(window.CK_Q!==0&&qEma>30){qBad+=fdt;if(qBad>2500){window.CK_Q=0;qBad=0;qGood=0}}else qBad=Math.max(0,qBad-fdt*.5);if(window.CK_Q===0&&qEma<17){qGood+=fdt;if(qGood>6000){window.CK_Q=1;qGood=0}}else qGood=0}}
  // boss health bar
  if(ts-bossT2>100){bossT2=ts;const bo=L.en&&L.en.find(e=>e&&e.t==='boss'&&e.hp>0);if(bo&&!L.over){if(bossEl.hidden){bossEl.hidden=false;const BN=G('BOSS')||[];const nm=L.i>=96?BN[13+((L.i-96)%4)]:BN[(L.i/8)|0];bossEl.querySelector('.ckb-n').textContent=(zh()&&G('TL')?G('TL')(nm||'Boss'):(nm||'Boss'))}const pct=Math.max(0,bo.hp/bo.mx);bossEl.querySelector('.ckb-f').style.transform='scaleX('+pct.toFixed(3)+')';bossEl.querySelector('.ckb-p').textContent=Math.ceil(pct*100)+'%';bossEl.classList.toggle('rage',!!(bo.rage||bo.en))}else if(!bossEl.hidden)bossEl.hidden=true;document.body.classList.toggle('ck-boss',!bossEl.hidden)}
  // boss reinforcement countdown
  const sc=L.sc;if(sc&&!L.over){if(sumEl.hidden){sumEl.hidden=false}const n=Math.max(1,Math.ceil(sc.t));if(n!==sumN){sumN=n;const ne=sumEl.querySelector('.cks-n');ne.textContent=n;ne.classList.remove('tick');void ne.offsetWidth;ne.classList.add('tick');sumEl.querySelector('.cks-l').textContent=sc.ph===2?(zh()?'最后援军即将降临':'Final reinforcements'):(zh()?'首领援军即将降临':'Boss reinforcements')}sumEl.querySelector('circle').style.strokeDashoffset=String(276.5*(1-Math.max(0,sc.t)/5))}else if(!sumEl.hidden){sumEl.hidden=true;sumN=0}
  const fr=(LOW||window.CK_Q===0)?50:30;if(ts-last<fr)return;const dt=Math.min(.08,(ts-last)/1e3||.03);last=ts;
  const k=[G('W'),G('H'),G('tw'),G('ox'),G('oy'),G('port'),G('FS'),L.i].join('|');if(k!==key){key=k;try{rebuild()}catch(e){return}}
  const paused=L.paused||G('mOpen')||G('tab')==='s';const sp=paused?.15:1,t=ts/1000;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(q,0,0,q,0,0);
  g.save();g.beginPath();g.rect(bx,by,bw,bh);g.clip();
  // drifting cloud shadows
  g.globalAlpha=.16;const cs=Math.max(bw,bh)*.9;for(let i=0;i<3;i++){const u=((t*sp*.012+i*.37)%1.3)-.3,x=bx+u*(bw+cs)-cs*.5,y=by+((i*.41+.1)%1)*bh-cs*.45+Math.sin(t*.05+i)*20;g.drawImage(cloud,x,y,cs,cs)}g.globalAlpha=1;
  // sun light + vignette
  g.globalCompositeOperation='lighter';g.drawImage(light,bx,by,bw,bh);
  // light shafts
  if(!LOW&&window.CK_Q!==0){g.globalAlpha=.05+.025*Math.sin(t*.4);g.fillStyle=`rgb(${th.light})`;for(let i=0;i<3;i++){const x0=bx+bw*(.1+i*.28)+Math.sin(t*.12+i*2)*bw*.05,wd=bw*(.07+.03*i);g.beginPath();g.moveTo(x0,by);g.lineTo(x0+wd,by);g.lineTo(x0+wd+bh*.45,by+bh);g.lineTo(x0+bh*.45,by+bh);g.closePath();g.fill()}g.globalAlpha=1}
  // motes
  if(window.CK_Q!==0)for(const m of motes){m.x+=Math.sin(t*m.sp+m.ph)*8*dt*sp;m.y+=(Math.cos(t*m.sp*.7+m.ph)*6-2)*dt*sp;if(m.y<-6)m.y=bh+6;if(m.x<-6)m.x=bw+6;if(m.x>bw+6)m.x=-6;const a=.25+.5*Math.max(0,Math.sin(t*1.7*m.sp+m.ph));g.globalAlpha=a;const s=m.r*5;g.drawImage(mote,bx+m.x-s/2,by+m.y-s/2,s,s)}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';g.drawImage(vign,bx,by,bw,bh);
  // boss / damage pulses
  if(bossT>0)bossT-=dt;
  const hasBoss=L.en&&L.en.some(e=>e&&e.t==='boss');const pulse=hasBoss?(.12+.08*Math.sin(t*3)):0;
  const fa=Math.max(flash,pulse);if(fa>.01){const w=bw,h=bh,gr=g.createRadialGradient(bx+w/2,by+h/2,Math.min(w,h)*.3,bx+w/2,by+h/2,Math.hypot(w,h)*.6);gr.addColorStop(0,`rgba(${flash>pulse?flashC:'200,20,40'},0)`);gr.addColorStop(1,`rgba(${flash>pulse?flashC:'200,20,40'},${fa*.55})`);g.fillStyle=gr;g.fillRect(bx,by,w,h)}
  flash=Math.max(0,flash-dt*1.6);
  g.restore();
 };
 requestAnimationFrame(step);
})();

/* ---------------- letterbox art follows the active realm ---------------- */
(function backdrop(){
 const SP=G('SPRD')||{};let cur='';
 const set=m=>{const a=SP['m_'+m]||SP.m_forest;if(a&&a!==cur){cur=a;document.body.style.setProperty('--ck-art',`url("${a}")`)}};
 set('forest');
 setInterval(()=>{const S=G('S'),L=G('L');if(S&&S.mode==='play'&&L&&!L.demo&&L.reg)set(L.reg.m);else if(S&&S.mode==='map'){const R=G('R'),ri=G('selectedRealm');set(R&&R[ri]&&R[ri].m||'forest')}else set('forest')},700);
})();

/* ---------------- top bar fit: never let buttons fall off screen ---------------- */
(function fitTop(){
 const top=document.querySelector('#hud .top');if(!top)return;
 let busy=false;
 const fit=()=>{if(busy||!top.offsetParent)return;busy=true;top.classList.remove('ck-t1','ck-t2','ck-t3');
  for(const c of ['ck-t1','ck-t2','ck-t3']){if(top.scrollWidth<=top.clientWidth+1)break;top.classList.add(c)}busy=false};
 window.ckFitTop=()=>requestAnimationFrame(fit);
 new MutationObserver(()=>window.ckFitTop()).observe(top,{childList:true,characterData:true,subtree:true});
 addEventListener('resize',()=>window.ckFitTop());
})();

/* ---------------- HUD feedback ---------------- */
(function hud(){
 const num=s=>{const n=parseFloat(String(s).replace(/[^0-9.\-]/g,''));return isNaN(n)?null:n};
 const watch=(id,onDown)=>{const e=$(id);if(!e)return;let prev=num(e.textContent);new MutationObserver(()=>{const v=num(e.textContent);if(v==null||prev==null||v===prev){prev=v;return}const cls=v<prev&&onDown?'ck-hurt':'ck-pop';if(v>prev||onDown){e.classList.remove('ck-pop','ck-hurt');void e.offsetWidth;e.classList.add(cls)}prev=v}).observe(e,{childList:true,characterData:true,subtree:true})};
 watch('coin',false);watch('dia',false);watch('lives',true);
 const wv=$('wv');if(wv){let p=wv.textContent;new MutationObserver(()=>{if(wv.textContent!==p){p=wv.textContent;wv.classList.remove('ck-pop');void wv.offsetWidth;wv.classList.add('ck-pop')}}).observe(wv,{childList:true,characterData:true,subtree:true})}
})();

/* ---------------- modal: victory / defeat staging ---------------- */
(function modal(){
 const mb=$('mbox');if(!mb)return;
 const dress=()=>{const img=mb.querySelector('img.bn');if(!img||img.parentElement.classList.contains('ck-rayhost'))return;const SP=G('SPRD')||{};const host=document.createElement('div');host.className='ck-rayhost'+(img.src===SP.defeat?' lose':'');img.replaceWith(host);host.appendChild(img)};
 new MutationObserver(dress).observe(mb,{childList:true,subtree:true});
})();

/* ---------------- Android bridge: native orientation, back button, app pause ---------------- */
(function android(){
 const B=window.CKAndroid;
 const call=f=>{try{return f()}catch(e){return undefined}};
 // Hardware back: close panels/modals first, then step back through the screens.
 window.ckBack=function(){return !!call(()=>{
  const S=G('S'),L=G('L'),$m=$('m1');
  if(G('mOpen')){if(S.mode==='play'&&L&&L.over){closeM();toMap();return true}if($m&&S.mode==='play'&&!L.over){$m.click();return true}closeM();return true}
  if(S.mode==='play'&&L&&!L.demo){if(!$('tp').hidden){showSel(null);return true}if(G('tab')==='s'){const t=document.querySelector('.tab[data-t="t"]');if(t){t.click();return true}}pauseM();return true}
  if(S.mode==='map'){$('back').click();return true}
  return false})};
 // App sent to background: open the pause menu so the player returns to a safe state.
 window.ckAppPause=function(){call(()=>{const S=G('S'),L=G('L');if(S.mode==='play'&&L&&!L.demo&&!L.over&&!G('mOpen'))pauseM();save()})};
 if(!B)return;
 const apply=()=>call(()=>{const lay=G('LAY');B.setOrientation(lay==='p'?'portrait':lay==='l'?'landscape':'auto')});
 document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.rotbtn'))setTimeout(apply,30)},true);apply();
})();
})();
