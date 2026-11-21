/* ===== Chaos Kingdoms v5.9 · per-item auto-use, cleaner shop, new art, cinematic item effects, UI polish ===== */

// ---- 1. auto-use: different items overlap freely; the SAME item waits until its previous effect has fully run out ----
const CK_IDUR2={rep:2,frz:10,met:2.5,ovc:20,idol:30,fbomb:2.5,ibomb:6,scroll:2,horn:15,trap:2.5,aid:6,shield:15,legion:16,heli:14};
let CK_AC2=0,CK_AE2={},CK_AL2=null;
ckAutoTick=function(dt){if(CK_AL2!==L){CK_AL2=L;CK_AC2=0;CK_AE2={}}
 if(L&&!L.demo&&!L.over&&!L.paused&&!mOpen)CK_AC2+=dt;
 if((CK_AT-=dt)>0)return;CK_AT=.25;if(!L||L.demo||L.over||L.paused||mOpen||L.wave<1||!S.autoIt)return;try{if(ckLootBusy())return}catch(_){}
 const en=L.en.filter(e=>e.hp>0);if(!en.length)return;
 for(const id in S.autoIt){if(!S.autoIt[id]||!ckAutoOk(id)||!(L.inv[id]>0)||L.cdn[id]>0||L.placing)continue;
  if(CK_AC2<(CK_AE2[id]||0))continue;            // this item's previous use is still working
  if(L.bf&&L.bf[id]>0)continue;                    // same buff still running (e.g. bought and used by hand)
  if(id==='rep'&&L.lives>ckCap()-ckHeal())continue;if(id==='heli'&&L.hel)continue;
  const n0=L.inv[id];try{useItem(id);invR()}catch(_){}
  if((L.inv[id]||0)<n0)CK_AE2[id]=CK_AC2+(CK_IDUR2[id]||2.5)}};

// ---- 2. shop: one Buy button + a 1 / 10 quantity switch + a round AUTO button ----
const CK_QTY={};
function ckQ(id){return CK_QTY[id]===10?10:1}
function ckX10Cost(id,pr){let t=0;for(let k=0;k<10;k++){t+=pr;if(id==='rep')pr=Math.min(700,pr+100)}return t}
function ckQPrice(id,pr){const v=ckQ(id)===10?ckX10Cost(id,pr):pr;return v>=10000?(v/1000).toFixed(1).replace(/\.0$/,'')+'K':v.toLocaleString()}
function ckQTog(id){const on=ckQ(id)===10;return `<button type="button" class="ck-qty${on?' on':''}" data-qty="${id}" role="switch" aria-checked="${on}" title="${lvZ('购买数量','Quantity')}"><span>×1</span><span>×10</span><i></i></button>`}
ckBuy10=function(id){const it=IT.find(x=>x.id===id);if(!it||it.stock!=null||!L||!L.price)return;if(!itemOpen(id))return toast(lvZ('指挥官 Lv.'+LV_ITEM[id]+' 解锁此道具','Unlocks at Commander Lv.'+LV_ITEM[id]));
 const tot=ckX10Cost(id,L.price[id]);if(!charge(tot))return toast(lvZ('金币不足（需要 ','Not enough coins (need ')+tot.toLocaleString()+')');
 L.is=(L.is||0)+tot;L.inv[id]=(L.inv[id]||0)+10;if(id==='rep'){let p=L.price.rep;for(let k=0;k<10;k++)p=Math.min(700,p+100);L.price.rep=p}
 toast(lvZ(it.n+' ×10 已放入道具栏',it.n+' ×10 added to the inventory'));try{sfx('coin')}catch(_){}try{CKS.pickup(2)}catch(_){}render()};
ckAutoBtn=function(id){if(!ckAutoOk(id))return '';ckChInit();const on=!!S.autoIt[id],zh=LANG==='zh';return `<button type="button" class="ck-auto ck-autor${on?' on':''}" data-auto="${id}" role="switch" aria-checked="${on}" title="${zh?'自动使用：冷却结束且有库存时自动使用；同一道具会等上一次效果结束':'Auto-use: fires when ready and in stock; the same item waits for its previous effect to end'}"><b>${zh?'自动':'AUTO'}</b></button>`};
document.addEventListener('click',e=>{const q=e.target.closest&&e.target.closest('[data-qty]');if(q){e.preventDefault();e.stopPropagation();const id=q.dataset.qty;CK_QTY[id]=ckQ(id)===10?1:10;try{renderShop()}catch(_){}return}
 const b=e.target.closest&&e.target.closest('#shop .sb .bt.pay[data-id]');if(b&&ckQ(b.dataset.id)===10&&!b.disabled){e.preventDefault();e.stopPropagation();ckBuy10(b.dataset.id)}},true);

// ---- 3. new art: difficulty icons (CSS), backpack ----
(function(){try{if(typeof CK_DIFIMG==='undefined')return;const st=document.createElement('style');st.id='ck-difimg';
 st.textContent='#dif .difhead:before{content:""!important;width:30px;height:30px;flex:none;background:center/contain no-repeat;filter:drop-shadow(0 2px 3px #000a)!important;background-image:url('+CK_DIFIMG[2]+')}'+CK_DIFIMG.map((u,i)=>`#dif[data-lv="${i}"] .difhead:before{background-image:url(${u})}`).join('');document.head.appendChild(st)}catch(_){}})();

// ---- 4. cinematic item effects: a dedicated effect layer over the battlefield (no icon pop-ups) ----
const CKFX={cv:null,g:null,list:[],run:false,last:0,w:0,h:0,k:1,d:1};
function fxEnsure(){const c0=document.getElementById('cv');if(!c0)return false;let c=CKFX.cv;if(!c){c=document.createElement('canvas');c.id='ck-fxc';document.body.appendChild(c);CKFX.cv=c;CKFX.g=c.getContext('2d')}
 const r=c0.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);c.style.left=r.left+'px';c.style.top=r.top+'px';c.style.width=r.width+'px';c.style.height=r.height+'px';
 const W2=Math.max(1,Math.round(r.width*d)),H2=Math.max(1,Math.round(r.height*d));if(c.width!==W2||c.height!==H2){c.width=W2;c.height=H2}CKFX.w=r.width;CKFX.h=r.height;CKFX.d=d;CKFX.k=r.width/W;return true}
const fxS=p=>({x:p.x*CKFX.k,y:p.y*CKFX.k});
function fxAdd(e){if(!fxEnsure())return;e.t=0;e.L=L;CKFX.list.push(e);if(!CKFX.run){CKFX.run=true;CKFX.last=performance.now();requestAnimationFrame(fxLoop)}}
function fxLoop(now){const dt=Math.min(.05,(now-CKFX.last)/1000);CKFX.last=now;if(!fxEnsure()){CKFX.run=false;return}const g=CKFX.g,{w,h,d}=CKFX;g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
 const frozen=typeof L==='undefined'||!L||L.paused||mOpen||tab==='s'||document.hidden;
 CKFX.list=CKFX.list.filter(e=>{if(e.L!==L||S.mode!=='play')return false;if(!frozen)e.t+=dt;if(e.until&&e.t>.6&&!e.until()&&!e.ending){e.ending=e.t}const end=e.ending!=null?Math.min(e.dur,e.ending+(e.fade||1)):e.dur;if(e.t>=end)return false;
  const fade=e.ending!=null?Math.max(0,1-(e.t-e.ending)/(e.fade||1)):1;g.save();try{e.draw(g,e.t,Math.min(1,e.t/e.dur),fade,w,h,frozen?0:dt)}catch(_){}g.restore();return true});
 if(CKFX.list.length)requestAnimationFrame(fxLoop);else{g.clearRect(0,0,w,h);CKFX.run=false}}
const R1=Math.random,TAU=Math.PI*2,rr=(a,b)=>a+R1()*(b-a),ease=t=>1-Math.pow(1-t,3);
function fxEdge(g,w,h,col,a,wd){if(a<=0)return;g.globalCompositeOperation='lighter';const W0=wd||Math.min(w,h)*.16;
 [[0,0,w,W0,0,0,0,W0],[0,h-W0,w,W0,0,h,0,h-W0],[0,0,W0,h,0,0,W0,0],[w-W0,0,W0,h,w,0,w-W0,0]].forEach(([x,y,ww,hh,x0,y0,x1,y1])=>{const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=gr;g.fillRect(x,y,ww,hh)});g.globalAlpha=1;g.globalCompositeOperation='source-over'}
function fxBloom(g,x,y,r,col,a){if(a<=0||r<=0)return;g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.globalAlpha=1;g.globalCompositeOperation='source-over'}
function fxBoltPts(x0,y0,x1,y1,disp){let pts=[[x0,y0],[x1,y1]];for(let k=0;k<6;k++){const n=[];for(let i=0;i<pts.length-1;i++){const[a,b]=[pts[i],pts[i+1]],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],L2=Math.hypot(dx,dy)||1;n.push(a,[mx+(-dy/L2)*rr(-1,1)*disp,my+(dx/L2)*rr(-1,1)*disp])}n.push(pts[pts.length-1]);pts=n;disp*=.55}return pts}
function fxStroke(g,pts,col,core,a){g.globalCompositeOperation='lighter';g.lineJoin='round';g.lineCap='round';[[10,col,.18],[5,col,.45],[1.8,core,1]].forEach(([lw,c,al])=>{g.globalAlpha=a*al;g.strokeStyle=c;g.lineWidth=lw;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()});g.globalAlpha=1;g.globalCompositeOperation='source-over'}
function fxParts(list,g,dt,drawFn){for(const p of list){p.life-=dt;if(p.life<=0)continue;p.vy+=(p.gy||0)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot=(p.rot||0)+(p.vr||0)*dt;drawFn(p)}for(let i=list.length-1;i>=0;i--)if(list[i].life<=0)list.splice(i,1)}
function fxEnemies(n,sort){let a=L.en.filter(e=>e.hp>0);if(sort)a.sort(sort);return a.slice(0,n).map(e=>fxS(eS(e)))}
function fxBases(){return (L.goals||[]).map(g=>fxS(pp(g[0],g[1])))}
function fxTowers(){return L.tr.filter(t=>t&&!t.building).map(t=>fxS(pp(t.x,t.y)))}

// frost: ice crystals grow in from the corners and edges, frosted rim, drifting glints; melts at the end
function fxFrost(dur,tint,until){const{w,h}=CKFX,segs=[];const grow=(x,y,a,len,dep,ord)=>{if(dep>5||len<5)return;const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len;segs.push([x,y,x2,y2,dep,ord]);grow(x2,y2,a+rr(-.25,.25),len*.78,dep+1,ord+1);if(R1()<.75)grow(x+(x2-x)*.5,y+(y2-y)*.5,a+rr(.6,1.1)*(R1()<.5?-1:1),len*.55,dep+1,ord+1)};
 const S2=Math.min(w,h);[[0,0,.8],[w,0,2.35],[0,h,-.8],[w,h,-2.35]].forEach(([x,y,a])=>{for(let k=0;k<5;k++)grow(x,y,a+rr(-.6,.6),S2*rr(.08,.13),0,0)});
 for(let k=0;k<10;k++){const e=k%4;const x=e===0||e===1?rr(0,w):e===2?0:w,y=e===2||e===3?rr(0,h):e===0?0:h,a=e===0?Math.PI/2:e===1?-Math.PI/2:e===2?0:Math.PI;grow(x,y,a+rr(-.5,.5),S2*rr(.05,.09),1,0)}
 const glints=Array.from({length:40},()=>({x:rr(0,w),y:rr(0,h),p:rr(0,6)})),shards=Array.from({length:60},()=>{const a=rr(0,TAU),s=rr(160,520);return{x:w/2,y:h/2,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.5,.9),rot:rr(0,6),vr:rr(-8,8),sz:rr(3,8)}});
 fxAdd({dur,fade:1.2,until,draw(g,t,p,f,w,h,dt){const grow=Math.min(1,t/.7),melt=f;
  // opening burst: cold light from the centre and spinning ice shards
  if(t<.8){fxBloom(g,w/2,h/2,Math.max(w,h)*ease(t/.8)*.9,tint||'rgba(220,245,255,.9)',.55*(1-t/.8))}
  fxParts(shards,g,dt,s=>{g.save();g.translate(s.x,s.y);g.rotate(s.rot);g.globalAlpha=Math.min(1,s.life*2);g.fillStyle='#e8fbff';g.beginPath();g.moveTo(0,-s.sz);g.lineTo(s.sz*.35,0);g.lineTo(0,s.sz);g.lineTo(-s.sz*.35,0);g.closePath();g.fill();g.restore()});
  fxEdge(g,w,h,'rgba(200,240,255,0.55)',.65*melt,S2*.13);
  g.globalCompositeOperation='lighter';g.lineCap='round';
  for(const s of segs){const k=Math.min(1,Math.max(0,(grow*7-s[5])));if(k<=0)continue;g.globalAlpha=(.75-s[4]*.1)*melt;g.strokeStyle=s[4]<2?'#f4fdff':'#bfeaff';g.lineWidth=Math.max(.6,3.2-s[4]*.55);g.beginPath();g.moveTo(s[0],s[1]);g.lineTo(s[0]+(s[2]-s[0])*k,s[1]+(s[3]-s[1])*k);g.stroke()}
  for(const q of glints){const tw=Math.max(0,Math.sin(t*3+q.p));if(tw<.6)continue;const near=Math.min(q.x,w-q.x,q.y,h-q.y);if(near>S2*.22)continue;g.globalAlpha=(tw-.6)*2*melt;g.fillStyle='#fff';g.beginPath();g.arc(q.x,q.y,1.6,0,TAU);g.fill()}
  g.globalAlpha=1;g.globalCompositeOperation='source-over'}})}
// cold fog rolling across the field + snowfall (Ice Bomb)
function fxFog(dur){const{w,h}=CKFX;const puffs=Array.from({length:16},(_,i)=>({x:-w*.3-rr(0,w*.6),y:rr(-.05,1.05)*h,r:rr(.18,.32)*Math.max(w,h),v:rr(.55,.85)*w})),snow=Array.from({length:70},()=>({x:rr(0,w),y:rr(-h,0),v:rr(20,55),sw:rr(0,6),s:rr(1,2.6)}));
 fxAdd({dur,fade:1.4,until:()=>L.en.some(e=>e.sl>0),draw(g,t,p,f,w,h,dt){g.globalCompositeOperation='lighter';
  for(const q of puffs){q.x+=q.v*dt*(t<1.6?1:.08);const a=(t<1.6?.075:.04)*f;const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,q.r);gr.addColorStop(0,`rgba(200,235,255,${a})`);gr.addColorStop(1,'rgba(200,235,255,0)');g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,q.r,0,TAU);g.fill()}
  g.fillStyle='#eef9ff';for(const s of snow){s.y+=s.v*dt;s.x+=Math.sin(t*1.3+s.sw)*12*dt;if(s.y>h){s.y=-4;s.x=rr(0,w)}g.globalAlpha=.75*f;g.beginPath();g.arc(s.x,s.y,s.s,0,TAU);g.fill()}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';fxEdge(g,w,h,'rgba(170,220,255,0.4)',.45*f)}})}
// meteors from the sky with long burning tails, impacts and embers
function fxMeteors(n,targets,big){const{w,h}=CKFX;const M=[];const T=targets.length?targets:[{x:w/2,y:h/2}];for(let i=0;i<n;i++){const tg=T[i%T.length],x1=tg.x+(i>=T.length?rr(-60,60):0),y1=tg.y+(i>=T.length?rr(-60,60):0);M.push({x0:x1+w*rr(.35,.6),y0:y1-h*rr(.7,1),x1,y1,t0:.12+i*.09,du:rr(.45,.6),hit:false,r:(big?18:11)*rr(.85,1.2)})}
 const emb=[],deb=[];
 fxAdd({dur:2.8+n*.09,draw(g,t,p,f,w,h,dt){g.globalAlpha=Math.min(.32,t*1.5)*Math.max(0,1-(t-1.4)/1);if(g.globalAlpha>0){g.fillStyle='#2a0800';g.fillRect(0,0,w,h)}g.globalAlpha=1;
  for(const m of M){const k=(t-m.t0)/m.du;if(k<0)continue;if(k<1){const e=k*k,x=m.x0+(m.x1-m.x0)*e,y=m.y0+(m.y1-m.y0)*e,dx=m.x1-m.x0,dy=m.y1-m.y0,dl=Math.hypot(dx,dy),ux=dx/dl,uy=dy/dl,tl=m.r*9;
    g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(x,y,x-ux*tl,y-uy*tl);gr.addColorStop(0,'rgba(255,240,180,.95)');gr.addColorStop(.25,'rgba(255,140,40,.7)');gr.addColorStop(1,'rgba(120,20,0,0)');g.strokeStyle=gr;g.lineCap='round';
    for(const[lw,al]of[[m.r*1.6,.35],[m.r*.9,.8]]){g.globalAlpha=al;g.lineWidth=lw;g.beginPath();g.moveTo(x,y);g.lineTo(x-ux*tl,y-uy*tl);g.stroke()}g.globalAlpha=1;fxBloom(g,x,y,m.r*2.2,'rgba(255,220,140,1)',.9);
    if(R1()<.9)emb.push({x:x-ux*m.r,y:y-uy*m.r,vx:rr(-40,40)-ux*60,vy:rr(-40,40)-uy*60,life:rr(.3,.7),gy:120,c:R1()<.5?'#ffb24a':'#ff6a1a'})}
   else if(!m.hit){m.hit=true;m.ht=t;L.shake=Math.max(L.shake||0,big?.8:.45);for(let i=0;i<22;i++){const a=rr(-Math.PI,0),s=rr(120,420);deb.push({x:m.x1,y:m.y1,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.5,1.1),gy:700,sz:rr(1.5,4),c:R1()<.6?'#ffcf6a':'#7a3a1a'})}}
   if(m.hit){const k2=(t-m.ht)/.6;if(k2<1){fxBloom(g,m.x1,m.y1,m.r*(3+k2*7),'rgba(255,200,110,1)',.85*(1-k2));fxBloom(g,m.x1,m.y1,m.r*2,'rgba(255,255,230,1)',1-k2)}}}
  g.globalCompositeOperation='lighter';fxParts(emb,g,dt,q=>{g.globalAlpha=Math.min(1,q.life*2);g.fillStyle=q.c;g.beginPath();g.arc(q.x,q.y,2,0,TAU);g.fill()});
  fxParts(deb,g,dt,q=>{g.globalAlpha=Math.min(1,q.life*1.5);g.fillStyle=q.c;g.fillRect(q.x,q.y,q.sz,q.sz)});g.globalAlpha=1;g.globalCompositeOperation='source-over'}})}
// fire blossom (Fire Bomb impact) with licking flames, smoke and embers
function fxFireball(x,y,delay){const fl=[],sm=[];let fired=false;
 fxAdd({dur:delay+2.4,draw(g,t,p,f,w,h,dt){const k=t-delay;if(k<0)return;if(!fired){fired=true;for(let i=0;i<70;i++){const a=rr(0,TAU),s=rr(40,260);fl.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-60,life:rr(.4,1),gy:-80,r:rr(6,16)})}for(let i=0;i<14;i++)sm.push({x:x+rr(-20,20),y:y+rr(-10,10),vx:rr(-20,20),vy:rr(-50,-20),life:rr(1.2,2),r:rr(14,30)})}
  if(k<.5)fxBloom(g,x,y,40+k*260,'rgba(255,190,90,1)',.9*(1-k/.5));
  fxParts(sm,g,dt,q=>{q.r+=dt*22;const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,q.r);gr.addColorStop(0,`rgba(70,58,52,${Math.min(.22,q.life*.14)})`);gr.addColorStop(1,'rgba(70,58,52,0)');g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,q.r,0,TAU);g.fill()});
  g.globalCompositeOperation='lighter';fxParts(fl,g,dt,q=>{const life=q.life;g.globalAlpha=Math.min(1,life*1.6);const c=life>.7?'#fff2b0':life>.45?'#ffb040':life>.25?'#ff5a14':'#902008';const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,q.r*life);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,q.r*life+1,0,TAU);g.fill()});g.globalAlpha=1;g.globalCompositeOperation='source-over'}})}
// lightning storm: screen dims, forked bolts lash the targets three times
function fxStorm(targets){const{w,h}=CKFX;const T=targets.length?targets:[{x:w/2,y:h/2}];let bolts=[],nextT=0,flashes=0;const sp=[];
 fxAdd({dur:1.8,draw(g,t,p,f,w,h,dt){const dim=t<1.2?Math.min(.45,t*3):Math.max(0,.45-(t-1.2)*.75);g.fillStyle='#0b0620';g.globalAlpha=dim;g.fillRect(0,0,w,h);g.globalAlpha=1;
  if(t>=nextT&&flashes<4){flashes++;nextT=t+.16+R1()*.1;bolts=T.map(q=>{const x0=q.x+rr(-w*.25,w*.25);const main=fxBoltPts(x0,-10,q.x,q.y,Math.min(w,h)*.12);const forks=[];for(let k=0;k<2;k++){const s=main[(main.length*rr(.2,.6))|0];forks.push(fxBoltPts(s[0],s[1],s[0]+rr(-80,80),s[1]+rr(40,120),30))}return{main,forks,q,a:1}});
   for(const q of T)for(let i=0;i<10;i++){const a=rr(0,TAU),s=rr(80,260);sp.push({x:q.x,y:q.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.2,.45),gy:400})}if(flashes===1){g.fillStyle='#fff';g.globalAlpha=.35;g.fillRect(0,0,w,h);g.globalAlpha=1}}
  for(const b of bolts){b.a-=dt*4.5;if(b.a<=0)continue;fxStroke(g,b.main,'#b48cff','#ffffff',b.a);b.forks.forEach(fk=>fxStroke(g,fk,'#9a7aff','#f0e8ff',b.a*.7));fxBloom(g,b.q.x,b.q.y,46,'rgba(220,200,255,1)',b.a*.8)}
  g.globalCompositeOperation='lighter';fxParts(sp,g,dt,q=>{g.globalAlpha=q.life*2;g.fillStyle='#efe6ff';g.fillRect(q.x,q.y,2,2)});g.globalAlpha=1;g.globalCompositeOperation='source-over'}})}
// overclock: crackling electric tendrils run along the screen edges for the whole boost; sparks rise from towers
function fxOverclock(dur,col,until){let paths=[],pt=0;const sp=[];let st=0;
 fxAdd({dur,fade:.8,until,draw(g,t,p,f,w,h,dt){const strong=t<1.4?1:.35;
  if(t<.55){g.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const y=(i/14)*h+((t*900)%(h/14)),x=(t/.55)*w*1.4-w*.2;const gr=g.createLinearGradient(x-260,0,x,0);gr.addColorStop(0,'rgba(120,230,255,0)');gr.addColorStop(1,'rgba(200,250,255,.5)');g.fillStyle=gr;g.fillRect(x-260,y,260,2)}g.globalCompositeOperation='source-over'}
  pt-=dt;if(pt<=0){pt=.07;const seg=(x0,y0,x1,y1)=>fxBoltPts(x0,y0,x1,y1,10);paths=[];const n=t<1.4?4:(R1()<.35?1:0);for(let i=0;i<n;i++){const e=(i+((t*7)|0))%4,a=rr(.05,.6),b=Math.min(.98,a+rr(.15,.35));paths.push(e===0?seg(a*w,2,b*w,2):e===1?seg(a*w,h-2,b*w,h-2):e===2?seg(2,a*h,2,b*h):seg(w-2,a*h,w-2,b*h))}}
  paths.forEach(pp2=>fxStroke(g,pp2,col,'#ffffff',.9*f*strong));fxEdge(g,w,h,col==='#ff9a7a'?'rgba(255,150,120,.5)':'rgba(110,225,255,.5)',(.5*strong+.1*Math.sin(t*6))*f,Math.min(w,h)*.07);
  st-=dt;if(st<=0){st=.12;const T=fxTowers();if(T.length){const q=T[(R1()*T.length)|0];for(let i=0;i<5;i++)sp.push({x:q.x+rr(-8,8),y:q.y-10,vx:rr(-20,20),vy:rr(-120,-60),life:rr(.25,.5),gy:0})}}
  g.globalCompositeOperation='lighter';fxParts(sp,g,dt,q=>{g.globalAlpha=q.life*2*f;g.fillStyle='#c8f6ff';g.fillRect(q.x,q.y,1.6,5)});g.globalAlpha=1;g.globalCompositeOperation='source-over'}})}
// gold: god rays from above and a shower of spinning coins; faint golden glitter while it lasts
function fxGold(dur,until,amount){const{w,h}=CKFX;const coins=Array.from({length:amount||60},()=>({x:rr(0,w),y:rr(-h*.8,-10),vx:rr(-30,30),vy:rr(120,260),gy:520,sp:rr(0,6),sv:rr(6,12),r:rr(5,9),life:2.6,b:0})),gl=Array.from({length:30},()=>({x:rr(0,w),y:rr(0,h),p:rr(0,6)}));
 fxAdd({dur,fade:1,until,draw(g,t,p,f,w,h,dt){if(t<2.4){const a=Math.sin(Math.min(1,t/2.4)*Math.PI)*.5;g.globalCompositeOperation='lighter';g.save();g.translate(w/2,-h*.08);for(let i=0;i<9;i++){g.rotate(.18+Math.sin(t*.7+i)*.01);const gr=g.createLinearGradient(0,0,0,h*1.2);gr.addColorStop(0,'rgba(255,230,150,.55)');gr.addColorStop(1,'rgba(255,200,80,0)');g.globalAlpha=a*(.4+.6*Math.abs(Math.sin(i*1.7+t)));g.fillStyle=gr;g.beginPath();g.moveTo(-10,0);g.lineTo(10,0);g.lineTo(70,h*1.2);g.lineTo(-70,h*1.2);g.closePath();g.fill()}g.restore();g.globalCompositeOperation='source-over'}
  for(const c of coins){c.life-=dt;if(c.life<=0)continue;c.vy+=c.gy*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;if(c.y>h-6&&c.b<1){c.y=h-6;c.vy*=-.35;c.b++}c.sp+=c.sv*dt;const sx=Math.abs(Math.cos(c.sp))*c.r+.8;g.globalAlpha=Math.min(1,c.life*1.5);const gr=g.createLinearGradient(c.x-sx,c.y-c.r,c.x+sx,c.y+c.r);gr.addColorStop(0,'#fff6c0');gr.addColorStop(.5,'#ffc733');gr.addColorStop(1,'#b07a10');g.fillStyle=gr;g.beginPath();g.ellipse(c.x,c.y,sx,c.r,0,0,TAU);g.fill();g.strokeStyle='#8a5a08';g.lineWidth=1;g.stroke()}
  g.globalAlpha=1;g.globalCompositeOperation='lighter';for(const q of gl){const tw=Math.max(0,Math.sin(t*2.2+q.p));if(tw<.75)continue;const near=Math.min(q.x,w-q.x,q.y,h-q.y);if(near>Math.min(w,h)*.18)continue;g.globalAlpha=(tw-.75)*4*f;g.fillStyle='#fff3b0';g.save();g.translate(q.x,q.y);g.rotate(.785);g.fillRect(-1,-6,2,12);g.fillRect(-6,-1,12,2);g.restore()}g.globalAlpha=1;g.globalCompositeOperation='source-over';fxEdge(g,w,h,'rgba(255,205,80,.4)',.35*f,Math.min(w,h)*.08)}})}
// war horn: a sound wave rolls up the screen, then embers rise and the rim pulses like a war drum
function fxWar(dur,until,col){const em=[];let et=0;
 fxAdd({dur,fade:1,until,draw(g,t,p,f,w,h,dt){if(t<1.3){g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const k=(t-i*.18)/1.1;if(k<0||k>1)continue;const y=h*(1-ease(k)*1.15),a=(1-k)*.6;const gr=g.createLinearGradient(0,y-40,0,y+40);gr.addColorStop(0,'rgba(255,200,90,0)');gr.addColorStop(.5,`rgba(255,215,120,${a})`);gr.addColorStop(1,'rgba(255,200,90,0)');g.fillStyle=gr;g.beginPath();g.moveTo(0,y+40);g.quadraticCurveTo(w/2,y-60,w,y+40);g.lineTo(w,y+80);g.quadraticCurveTo(w/2,y-20,0,y+80);g.closePath();g.fill()}g.globalCompositeOperation='source-over'}
  const beat=Math.pow(Math.max(0,Math.sin(t*Math.PI*1.3)),8);fxEdge(g,w,h,col||'rgba(255,140,60,.55)',(t<1.3?.55:.18+beat*.3)*f,Math.min(w,h)*.1);
  et-=dt;if(et<=0){et=t<1.5?.01:.06;em.push({x:rr(0,w),y:h+4,vx:rr(-15,15),vy:rr(-140,-70),life:rr(1.2,2.2),gy:0,s:rr(1.2,2.6)})}
  g.globalCompositeOperation='lighter';fxParts(em,g,dt,q=>{q.vx+=Math.sin(t*3+q.y*.02)*6*dt;g.globalAlpha=Math.min(1,q.life)*f*.9;g.fillStyle=q.life>1?'#ffd27a':'#ff7a3a';g.beginPath();g.arc(q.x,q.y,q.s,0,TAU);g.fill()});g.globalAlpha=1;g.globalCompositeOperation='source-over'}})}
// trap: steel spikes erupt beneath the lead enemies, with dust and sparks
function fxSpikes(targets){const D=[],K=[];targets.forEach(q=>{for(let i=0;i<14;i++){const a=rr(0,TAU),s=rr(40,140);D.push({x:q.x,y:q.y+6,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.4-20,life:rr(.5,1),gy:60,r:rr(5,10)})}for(let i=0;i<12;i++){const a=rr(-Math.PI,0),s=rr(120,300);K.push({x:q.x,y:q.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.2,.45),gy:600})}});
 fxAdd({dur:1.3,draw(g,t,p,f,w,h,dt){const k=t<.12?t/.12:t<.7?1:Math.max(0,1-(t-.7)/.35);
  for(const q of targets){for(let i=0;i<9;i++){const a=-Math.PI/2+(i-4)*.32,len=(26+((i*37)%11))*k,bx=q.x+(i-4)*5,by=q.y+8;g.save();g.translate(bx,by);g.rotate(a+Math.PI/2);const gr=g.createLinearGradient(-4,0,4,0);gr.addColorStop(0,'#5d6670');gr.addColorStop(.5,'#eef3f8');gr.addColorStop(1,'#7c8792');g.fillStyle=gr;g.beginPath();g.moveTo(-4,0);g.lineTo(0,-len);g.lineTo(4,0);g.closePath();g.fill();g.restore()}fxBloom(g,q.x,q.y,30,'rgba(255,230,160,1)',.5*k)}
  fxParts(D,g,dt,q=>{g.globalAlpha=Math.min(.45,q.life*.6);g.fillStyle='#b9a27a';g.beginPath();g.arc(q.x,q.y,q.r,0,TAU);g.fill()});g.globalCompositeOperation='lighter';fxParts(K,g,dt,q=>{g.globalAlpha=q.life*2.5;g.fillStyle='#fff2c0';g.fillRect(q.x,q.y,2,2)});g.globalAlpha=1;g.globalCompositeOperation='source-over'}})}
// summon aid: heavenly beams descend one after another, feathers drift down
function fxHoly(dur,until){const{w,h}=CKFX;const beams=Array.from({length:7},(_,i)=>({x:rr(.1,.9)*w,y:rr(.25,.85)*h,t0:i*.18})),fe=Array.from({length:26},()=>({x:rr(0,w),y:rr(-h,0),v:rr(25,55),sw:rr(0,6),r:rr(0,6)}));
 fxAdd({dur,fade:1,until,draw(g,t,p,f,w,h,dt){g.globalCompositeOperation='lighter';
  for(const b of beams){const k=(t-b.t0);if(k<0)continue;const life=Math.min(1,k/.25)*Math.max(0,1-Math.max(0,k-1.6)/.8)*f;if(life<=0)continue;const bw=26+Math.sin(t*4+b.x)*4;const gr=g.createLinearGradient(b.x-bw,0,b.x+bw,0);gr.addColorStop(0,'rgba(255,245,200,0)');gr.addColorStop(.5,`rgba(255,250,225,${.55*life})`);gr.addColorStop(1,'rgba(255,245,200,0)');g.fillStyle=gr;g.fillRect(b.x-bw,0,bw*2,b.y);fxBloom(g,b.x,b.y,50,'rgba(255,245,200,1)',.6*life)}
  g.globalCompositeOperation='source-over';for(const q of fe){q.y+=q.v*dt;q.x+=Math.sin(t*1.6+q.sw)*20*dt;q.r+=dt;if(q.y>h)q.y=-10;g.save();g.translate(q.x,q.y);g.rotate(Math.sin(q.r)*.6);g.globalAlpha=.8*f;g.fillStyle='#fffaf0';g.beginPath();g.ellipse(0,0,2.4,7,0,0,TAU);g.fill();g.restore()}g.globalAlpha=1;fxEdge(g,w,h,'rgba(255,245,210,.45)',.25*f)}})}
// shield: a hexagonal energy dome over every base (shatters when it ends)
function fxDome(dur,until,col){const bases=fxBases(),R2=Math.min(CKFX.w,CKFX.h)*.17;const shards=[];let broken=false;
 fxAdd({dur:dur+1.2,fade:.01,until:()=>true,draw(g,t,p,f,w,h,dt){const active=t<dur&&until();if(!active&&!broken){broken=true;bases.forEach(b=>{for(let i=0;i<24;i++){const a=rr(0,TAU),s=rr(60,200);shards.push({x:b.x+Math.cos(a)*R2*.8,y:b.y+Math.sin(a)*R2*.8,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.5,.9),gy:300,rot:rr(0,6),vr:rr(-6,6)})}})}
  if(active){const rise=Math.min(1,t/.45);for(const b of bases){g.save();g.beginPath();g.arc(b.x,b.y,R2*rise,0,TAU);g.clip();const gr=g.createRadialGradient(b.x,b.y,R2*.2,b.x,b.y,R2);gr.addColorStop(0,'rgba(120,200,255,0)');gr.addColorStop(.8,col.replace('A','.12'));gr.addColorStop(1,col.replace('A','.45'));g.fillStyle=gr;g.fillRect(b.x-R2,b.y-R2,R2*2,R2*2);
    g.globalCompositeOperation='lighter';g.strokeStyle=col.replace('A','.35');g.lineWidth=1;const s=13;for(let yy=-R2;yy<R2;yy+=s*1.5){for(let xx=-R2;xx<R2;xx+=s*1.732){const ox=xx+((Math.round(yy/(s*1.5))%2)?s*.866:0),d=Math.hypot(ox,yy)/R2,sh=Math.max(0,1-Math.abs(d-((t*.6)%1.2))*5);g.globalAlpha=.25+.75*sh;g.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;g.lineTo(b.x+ox+Math.cos(a)*s*.55,b.y+yy+Math.sin(a)*s*.55)}g.closePath();g.stroke()}}g.restore();g.globalAlpha=1;g.globalCompositeOperation='lighter';g.strokeStyle=col.replace('A','.8');g.lineWidth=2;g.beginPath();g.arc(b.x,b.y,R2*rise,0,TAU);g.stroke();g.globalCompositeOperation='source-over'}}
  g.globalCompositeOperation='lighter';fxParts(shards,g,dt,q=>{g.save();g.translate(q.x,q.y);g.rotate(q.rot);g.globalAlpha=q.life*1.4;g.strokeStyle=col.replace('A','1');g.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;g.lineTo(Math.cos(a)*5,Math.sin(a)*5)}g.closePath();g.stroke();g.restore()});g.globalAlpha=1;g.globalCompositeOperation='source-over';if(!active&&!shards.length&&t>.5)this.dur=0}})}
// healing: life motes spiral up around every base, leaves and soft green light
function fxHeal(){const bases=fxBases(),M=[];bases.forEach(b=>{for(let i=0;i<40;i++)M.push({b,a:rr(0,TAU),r:rr(10,46),y:rr(0,20),v:rr(50,110),life:rr(.9,1.8),leaf:R1()<.25})});
 fxAdd({dur:2.2,draw(g,t,p,f,w,h,dt){bases.forEach(b=>fxBloom(g,b.x,b.y,90,'rgba(120,255,160,1)',.45*Math.max(0,1-t/1.6)));g.globalCompositeOperation='lighter';
  for(const m of M){m.life-=dt;if(m.life<=0)continue;m.a+=dt*3;m.y+=m.v*dt;const x=m.b.x+Math.cos(m.a)*m.r,y=m.b.y-m.y,a=Math.min(1,m.life*1.5);g.globalAlpha=a;if(m.leaf){g.save();g.translate(x,y);g.rotate(m.a);g.fillStyle='#7dff9a';g.beginPath();g.ellipse(0,0,4,2,0,0,TAU);g.fill();g.restore()}else{g.fillStyle='#d6ffe0';g.beginPath();g.arc(x,y,2,0,TAU);g.fill()}}g.globalAlpha=1;g.globalCompositeOperation='source-over'}})}
// time crystal: a ghostly clock face winds backwards over the field
function fxClock(dur,until){fxAdd({dur,fade:1,until,draw(g,t,p,f,w,h,dt){const x=w/2,y=h/2,R2=Math.min(w,h)*.42,a=Math.min(1,t/.5)*f*(t<2?1:.35);g.globalCompositeOperation='lighter';g.globalAlpha=a*.5;g.strokeStyle='#9fe6ff';g.lineWidth=2;g.beginPath();g.arc(x,y,R2,0,TAU);g.stroke();
  for(let i=0;i<12;i++){const an=i*TAU/12;g.globalAlpha=a*.6;g.beginPath();g.moveTo(x+Math.cos(an)*R2*.88,y+Math.sin(an)*R2*.88);g.lineTo(x+Math.cos(an)*R2,y+Math.sin(an)*R2);g.stroke()}
  const sp=t<2?-(t*t)*2:-8-(t-2)*.4;[[R2*.6,4,sp*.1],[R2*.82,2,sp]].forEach(([len,lw,an])=>{g.globalAlpha=a*.8;g.lineWidth=lw;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(an-Math.PI/2)*len,y+Math.sin(an-Math.PI/2)*len);g.stroke()});g.globalAlpha=1;g.globalCompositeOperation='source-over';fxEdge(g,w,h,'rgba(140,200,255,.45)',.4*f)}})}
// dragonfire: a wall of flame sweeps across the battlefield
function fxDragon(){const fl=[];fxAdd({dur:2.4,draw(g,t,p,f,w,h,dt){const x=-w*.1+(t/1.4)*w*1.2;if(t<1.4)for(let i=0;i<10;i++)fl.push({x:x+rr(-20,20),y:rr(0,h),vx:rr(-30,60),vy:rr(-160,-60),life:rr(.4,.9),gy:-60,r:rr(14,30)});
  if(t<1.5){const gr=g.createLinearGradient(x-160,0,x+40,0);gr.addColorStop(0,'rgba(255,80,20,0)');gr.addColorStop(.8,'rgba(255,150,60,.35)');gr.addColorStop(1,'rgba(255,240,180,0)');g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(x-160,0,200,h);g.globalCompositeOperation='source-over'}
  g.globalCompositeOperation='lighter';fxParts(fl,g,dt,q=>{const life=q.life;g.globalAlpha=Math.min(1,life*1.6);const c=life>.6?'#fff0a0':life>.35?'#ff9a30':'#ff4a10';const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,q.r*life);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,q.r*life+1,0,TAU);g.fill()});g.globalAlpha=1;g.globalCompositeOperation='source-over';fxEdge(g,w,h,'rgba(255,110,40,.5)',.5*Math.max(0,1-t/2.2))}})}
// golden sheen sweeping diagonally (Midas, forge)
function fxSheen(col){fxAdd({dur:1.2,draw(g,t,p,f,w,h,dt){const x=-w*.6+p*w*2.2;g.globalCompositeOperation='lighter';g.save();g.translate(x,0);g.rotate(.35);const gr=g.createLinearGradient(-90,0,90,0);gr.addColorStop(0,'rgba(255,230,140,0)');gr.addColorStop(.5,col);gr.addColorStop(1,'rgba(255,230,140,0)');g.fillStyle=gr;g.fillRect(-90,-h,180,h*3);g.restore();g.globalCompositeOperation='source-over'}})}
function fxForgeSparks(){const T=fxTowers(),S2=[];T.forEach(q=>{for(let i=0;i<16;i++)S2.push({x:q.x,y:q.y-8,vx:rr(-90,90),vy:rr(-260,-120),life:rr(.5,1),gy:600})});fxAdd({dur:1.4,draw(g,t,p,f,w,h,dt){g.globalCompositeOperation='lighter';fxParts(S2,g,dt,q=>{g.globalAlpha=Math.min(1,q.life*2);g.fillStyle=q.life>.6?'#fff3c0':'#ffa040';g.fillRect(q.x,q.y,2,3)});g.globalAlpha=1;g.globalCompositeOperation='source-over'}})}
function fxJet(col){fxAdd({dur:1.1,draw(g,t,p,f,w,h,dt){const x=w*1.1-p*w*1.5,y=h*.12;g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(x,0,x+w*.6,0);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.strokeStyle=gr;g.lineWidth=3;g.beginPath();g.moveTo(x,y);g.lineTo(x+w*.6,y+8);g.stroke();fxBloom(g,x,y,26,col,.8);g.globalCompositeOperation='source-over'}})}
function fxRipple(){fxAdd({dur:1.6,draw(g,t,p,f,w,h,dt){fxEdge(g,w,h,'rgba(80,190,255,.55)',.5*Math.sin(p*Math.PI),Math.min(w,h)*.1)}})}

function ckItemFx2(id){if(!L||L.demo||!fxEnsure())return;const by=(a,b)=>b.hp-a.hp,lead=(a,b)=>b.pr-a.pr;
 switch(id){
 case'frz':fxFrost(10,null,()=>L.en.some(e=>e.hp>0&&e.fz>0));break;
 case'r_chrono':fxFrost(8,'rgba(200,220,255,.9)',()=>L.en.some(e=>e.hp>0&&(e.fz>0||e.sl>0)));fxClock(8,()=>L.en.some(e=>e.hp>0&&(e.fz>0||e.sl>0)));break;
 case'ibomb':fxFog(6);break;
 case'met':fxMeteors(Math.max(6,Math.min(12,L.en.filter(e=>e.hp>0).length)),fxEnemies(12,by),true);break;
 case'fbomb':{const t=fxEnemies(1,lead)[0];if(t)fxFireball(t.x,t.y,.55);break}
 case'scroll':fxStorm(fxEnemies(6,by));break;
 case'ovc':fxOverclock(20,'#7fe8ff',()=>L.bf.ovc>0);break;
 case'idol':fxGold(30,()=>L.bf.idol>0,60);break;
 case'r_midas':fxSheen('rgba(255,235,150,.55)');fxGold(45,()=>L.bf.midas>0,90);break;
 case'horn':fxWar(15,()=>L.bf.horn>0);break;
 case'r_war':fxWar(25,()=>L.bf.horn>0,'rgba(255,120,110,.55)');fxOverclock(25,'#ff9a7a',()=>L.bf.ovc>0);break;
 case'trap':fxSpikes(fxEnemies(3,lead));break;
 case'aid':fxHoly(6,()=>L.bf.aid>0);break;
 case'shield':fxDome(15,()=>L.bf.shield>0,'rgba(140,215,255,A)');break;
 case'r_aegis':fxHeal();fxDome(15,()=>L.bf.shield>0,'rgba(255,215,110,A)');break;
 case'rep':fxHeal();break;
 case'r_dragon':fxDragon();break;
 case'r_forge':fxSheen('rgba(255,200,120,.45)');fxForgeSparks();break;
 case'air':case'bomb':fxJet('rgba(255,170,90,1)');break;
 case'legion':fxSheen('rgba(255,220,140,.35)');break;
 case'river':fxRipple();break;
 case'heli':break}}
// replace the 5.8 cast card with the new effects; the original per-tower rings and pillars are muted during an item use
ckItemFx=function(id){if(!L||L.demo)return;const now=performance.now();if(now-CK_IFXQ<120)return;CK_IFXQ=now;try{CKS.item(id)}catch(_){}try{ckItemFx2(id)}catch(_){}try{ckVibe([18,30,40])}catch(_){}};
(function(){const q=ckQuietSfx;ckQuietSfx=function(fn){const f=L&&L.fx,n0=f?f.length:0;try{return q(fn)}finally{try{if(L&&L.fx===f&&f){const keep=f.slice(n0).filter(x=>x.k!=='ring'&&x.k!=='pillar');f.length=n0;f.push(...keep)}}catch(_){}}}})();

// ---- 5. UI consistency helpers ----
// backpack art in the inventory title
(function(){try{const o=ckInvHtml;if(typeof o!=='function'||typeof CK_BAGIMG==='undefined')return;ckInvHtml=function(){return o.apply(this,arguments).replace('<h2 class="f">🎒 ',`<h2 class="f"><img class="ck-bagimg" src="${CK_BAGIMG}" alt=""> `)}}catch(_){}})();
