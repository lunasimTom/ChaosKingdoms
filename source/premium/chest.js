/* ===== Chaos Kingdoms v4.3 · treasure chests, auto-use items =====
   Six chest tiers bought with diamonds or won from final bosses. Chests can be opened any time (shop
   "Chests" tab in battle, or the Treasure Chests button on the title screen) and can never be sold.
   Each chest holds several reward categories with several units each. Every chest has a total value
   measured in diamonds (its purchase price): 85% of chests are worth more than their price and 15%
   a bit less, decided before the contents are rolled, so the split is exact.
   Values used for the comparison (in diamonds): 1 diamond = 1 · 10,000 gold = 1 · 10 stars = 1 ·
   5 medals = 1 · 4 shards = 1 (they forge a diamond) · Enhancement Rune = 5 · rare item = 4.
   Medals are new: each one is kept in a counter and instantly grants 50 commander XP. */
// portrait: extra room under the bottom panel so taps stay clear of the system gesture area
var CK_RAILX=window.CKAndroid?8:18;try{document.documentElement.classList.add(window.CKAndroid?'ck-app':'ck-web')}catch(_){}
const CK_CH=[
 {k:'green', n:['绿色宝箱','Green Chest'], p:5,  c:'#56dd6c',cats:3},
 {k:'blue',  n:['蓝色宝箱','Blue Chest'],  p:10, c:'#4aa8ff',cats:3.5},
 {k:'red',   n:['红色宝箱','Red Chest'],   p:20, c:'#ff5a4a',cats:4},
 {k:'purple',n:['紫色宝箱','Purple Chest'],p:35, c:'#bf72ff',cats:4.5},
 {k:'gold',  n:['金色宝箱','Gold Chest'],  p:60, c:'#ffc23a',cats:5},
 {k:'black', n:['黑色宝箱','Black Chest'], p:100,c:'#ffcf5a',cats:5.6}];
const CKV={dia:1,gold:1/10000,star:.1,medal:.2,frag:.25,rune:5,rare:4},CK_MEDAL_XP=50;
function ckChInit(){if(!Array.isArray(S.chests)||S.chests.length!==6)S.chests=[0,0,0,0,0,0].map((_,i)=>Math.max(0,(S.chests&&S.chests[i])|0));S.medals=Math.max(0,S.medals|0);if(!S.autoIt||typeof S.autoIt!=='object')S.autoIt={}}
function ckChName(t){return ckLZ(CK_CH[t].n)}
function ckChImg(t,cls){return ckImg('ch_'+CK_CH[t].k,cls||'')}
// ---- contents ----
// pools grow with the tier; gold is always present and absorbs rounding
function ckChPool(t){const p=['star','medal','dia'];if(t<=2)p.push('frag');if(t>=1)p.push('rare');if(t>=2)p.push('rune');return p}
function ckChValue(r){let v=0;for(const k in r){if(k==='rares')v+=r.rares.reduce((a,x)=>a+x.n,0)*CKV.rare;else v+=(r[k]||0)*(CKV[k]||0)}return v}
function ckChRoll(t,forceOver){const P=CK_CH[t].p,R=Math.random,over=forceOver!=null?forceOver:R()<.85;
 // target value: 85% of chests 1.05-1.6x the price (some jackpots up to 3x), 15% of chests 0.62-0.95x
 let m=over?(R()<.06?2+R():1.05+.55*Math.pow(R(),1.6)):.62+.33*R();const T=P*m;
 const pool=ckChPool(t),nc=Math.max(2,Math.min(pool.length,Math.floor(CK_CH[t].cats-1+R()*1.4)));
 const cats=[];const bag=pool.slice();while(cats.length<nc&&bag.length){const i=R()*bag.length|0;cats.push(bag.splice(i,1)[0])}
 const w={gold:.5+R()*.6};for(const c of cats)w[c]=.6+R();if(w.dia)w.dia=Math.min(w.dia,.5);
 const sw=Object.values(w).reduce((a,b)=>a+b,0),r={gold:0};
 for(const c of cats){const val=T*w[c]/sw;
  if(c==='rare'){let n=Math.max(1,Math.round(val/CKV.rare));if(n*CKV.rare>T*.6)n=Math.max(1,Math.floor(T*.6/CKV.rare));const ks=Object.keys(CK_RARE),pick=[];for(let i=0;i<n;i++){const k=ks[R()*ks.length|0];const f=pick.find(x=>x.k===k);if(f)f.n++;else pick.push({k,n:1})}r.rares=pick}
  else if(c==='rune'){r.rune=Math.max(1,Math.round(val/CKV.rune));if(r.rune*CKV.rune>T*.6)r.rune=Math.max(1,Math.floor(T*.6/CKV.rune))}
  else r[c]=Math.max(1,Math.round(val/CKV[c]))}
 // gold fills the rest, then the over/under decision is enforced exactly
 const fill=()=>{r.gold=Math.max(0,Math.round((T-ckChValue(Object.assign({},r,{gold:0})))/CKV.gold/100)*100)};fill();if(r.gold<1000)r.gold=1000;
 let v=ckChValue(r);
 if(over&&v<=P){r.gold+=Math.ceil((P*1.05-v)/CKV.gold/100)*100;v=ckChValue(r)}
 if(!over&&v>=P){const order=['gold','medal','star','frag','dia','rune'];let guard=0;
  while(ckChValue(r)>=P&&guard++<400){let cut=false;
   for(const k of order){if(k==='gold'){const need=Math.ceil((ckChValue(r)-P*.97)/CKV.gold/100)*100;if(r.gold>1000){r.gold=Math.max(1000,r.gold-need);cut=true;break}}else if((r[k]|0)>1){r[k]--;cut=true;break}}
   if(!cut&&r.rares&&r.rares.length){const x=r.rares[r.rares.length-1];if(x.n>1)x.n--;else if(r.rares.length>1)r.rares.pop();else break}
   else if(!cut)break}}
 for(const k of Object.keys(r))if(k!=='rares'&&!r[k])delete r[k];
 return r}
// ---- grant ----
function ckChGrant(r){
 if(r.gold){Economy.grantWallet(r.gold);if(typeof L!=='undefined'&&L&&L.g0!=null&&S.mode==='play')L.g0+=r.gold}
 if(r.dia)S.diamonds=(S.diamonds||0)+r.dia;
 if(r.star)S.bonusStars=(S.bonusStars||0)+r.star;
 if(r.frag){S.frag=(S.frag|0)+r.frag;ckForge()}
 if(r.rune)S.rune=(S.rune|0)+r.rune;
 if(r.medal){S.medals=(S.medals|0)+r.medal;S.xp=(S.xp||0)+r.medal*CK_MEDAL_XP}
 if(r.rares){S.inv=S.inv||{};for(const x of r.rares)S.inv[x.k]=(S.inv[x.k]||0)+x.n}
 try{updWl()}catch(_){}try{if(typeof L!=='undefined'&&L&&L.inv)invR()}catch(_){}try{refreshProfileTeaser()}catch(_){}try{save()}catch(_){}}
// reward list for display: [art key, name, amount]
function ckChRows(r){const zh=LANG==='zh',o=[];
 if(r.dia)o.push(['dia',zh?'钻石':'Diamonds',r.dia]);
 if(r.rares)for(const x of r.rares)o.push([x.k,ckLZ(CK_RARE[x.k].n),x.n]);
 if(r.rune)o.push(['rune',zh?'强化符':'Enhancement Runes',r.rune]);
 if(r.gold)o.push(['gold',zh?'金币':'Gold',r.gold]);
 if(r.star)o.push(['star',zh?'星星':'Stars',r.star]);
 if(r.medal)o.push(['medal',zh?'勋章':'Medals',r.medal,'+'+(r.medal*CK_MEDAL_XP).toLocaleString()+' XP']);
 if(r.frag)o.push(['frag',zh?'钻石碎片':'Diamond Shards',r.frag]);
 return o}
// ---- buy / open ----
function ckChBuy(t){ckChInit();const P=CK_CH[t].p;if((S.diamonds||0)<P){toast(lvZ('钻石不足：需要 '+P+' 💎','Not enough diamonds: '+P+' 💎 needed'));return false}
 S.diamonds-=P;S.chests[t]++;try{save()}catch(_){}try{sfx('coin',.6)}catch(_){}toast(lvZ('已购买 ','Bought: ')+ckChName(t));ckChRefresh();return true}
function ckChOpen(t){ckChInit();if(!(S.chests[t]>0))return;S.chests[t]--;const r=ckChRoll(t);ckChGrant(r);ckChFx(t,r);ckChRefresh()}
function ckChRefresh(){try{if(typeof tab!=='undefined'&&tab==='s'&&shopPage==='chests')renderShop()}catch(_){}const m=document.getElementById('ck-chm');if(m)m.innerHTML=ckChestPage(false,true)}
// the chest page: owned chests (open), the diamond store (buy), the medal counter
function ckChestPage(inShop,inner){ckChInit();const zh=LANG==='zh';
 const rows=CK_CH.map((c,t)=>`<div class="ck-chrow" style="--cc:${c.c}"><div class="ck-chart">${ckChImg(t,'ck-chimg')}</div><div class="ck-chinfo"><b>${ckChName(t)}</b><small>${zh?'价值约':'Worth about'} ${c.p} 💎 · ${zh?['3 类奖励','3-4 类奖励','4 类奖励','4-5 类奖励','5 类奖励','5-6 类奖励'][t]:['3 reward types','3-4 reward types','4 reward types','4-5 reward types','5 reward types','5-6 reward types'][t]}</small><small class="own">${zh?'拥有':'Owned'} ×${S.chests[t]}</small></div><div class="ck-chbtns"><button type="button" class="bt pay ck-chopen" data-copen="${t}" ${S.chests[t]>0?'':'disabled'}>${zh?'打开':'Open'}</button><button type="button" class="bt pay ck-chbuy" data-cbuy="${t}" ${(S.diamonds||0)>=c.p?'':'disabled'}>${ckImg('dia','ic')}<span class="price">${c.p}</span></button></div></div>`).join('');
 const head=`<div class="ck-chhead"><span>${ckImg('dia','ic')} <b>${(S.diamonds||0).toLocaleString()}</b></span><span>${ckImg('medal','ic')} ${zh?'勋章':'Medals'} <b>${S.medals|0}</b></span></div><p class="ck-chnote">${zh?'宝箱可用钻石购买，或在击败首领时掉落（关卡越高越容易掉落）。宝箱无法出售。约 85% 的宝箱价值高于其价格。每枚勋章 = '+CK_MEDAL_XP+' 统帅经验。':'Buy chests with diamonds or win them from bosses (higher levels drop them more often). Chests can never be sold. About 85% of chests are worth more than their price. Each medal = '+CK_MEDAL_XP+' commander XP.'}</p>`;
 const body=head+`<div class="ck-chlist">${rows}</div>`;
 if(inner)return body;
 return inShop?`<div class="shl ck-chshop">${body}</div>`:`<div class="ck-chmodal"><h2 class="f">${zh?'宝箱':'Treasure Chests'}</h2><div id="ck-chm">${body}</div><button class="bt g" id="m1">${zh?'关闭':'Close'}</button></div>`}
function ckChMenu(){modal(ckChestPage(false),closeM)}
// ---- opening effect: the chest shakes, then light bursts out of it with rays and particles ----
function ckChFx(t,r){const C=CK_CH[t],zh=LANG==='zh';const old=document.getElementById('ck-chfx');if(old)old.remove();
 const ov=document.createElement('div');ov.id='ck-chfx';ov.style.setProperty('--cc',C.c);
 ov.innerHTML=`<canvas></canvas><div class="rays"></div><div class="glow"></div><div class="chest">${ckChImg(t,'ck-chbig')}</div><div class="flash"></div><div class="res"><h3>${ckChName(t)}</h3><div class="cards"></div><div class="tot"></div><button type="button" class="bt pay ok">${zh?'收下':'Collect'}</button></div>`;
 document.body.appendChild(ov);const cv=ov.querySelector('canvas'),g=cv.getContext('2d'),dpr=Math.min(2,devicePixelRatio||1);
 const fit=()=>{cv.width=innerWidth*dpr;cv.height=innerHeight*dpr};fit();
 const P=[];let t0=performance.now(),burst=false,live=true;
 const spawnBurst=()=>{const cx=cv.width/2,cy=cv.height*.42;for(let i=0;i<170;i++){const a=Math.random()*6.283,sp=(120+Math.random()*620)*dpr;P.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-80*dpr,l:1.1+Math.random()*1.4,m:0,r:(1.2+Math.random()*3.2)*dpr,c:Math.random()<.5?'#fff6cf':Math.random()<.5?C.c:'#ffd36a',s:Math.random()<.3})}};
 const step=now=>{if(!live)return;const dt=Math.min(.05,(now-(step.l||now))/1000);step.l=now;g.clearRect(0,0,cv.width,cv.height);g.globalCompositeOperation='lighter';
  for(const p of P){p.m+=dt;if(p.m>p.l)continue;p.vy+=60*dpr*dt;p.vx*=.985;p.vy*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt;const a=1-p.m/p.l;g.globalAlpha=a;g.fillStyle=p.c;
   if(p.s){g.save();g.translate(p.x,p.y);g.rotate(p.m*4);g.fillRect(-p.r*2.4,-p.r*.35,p.r*4.8,p.r*.7);g.fillRect(-p.r*.35,-p.r*2.4,p.r*.7,p.r*4.8);g.restore()}else{g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill()}}
  // gentle rising sparkles after the burst
  if(burst&&Math.random()<.5)P.push({x:cv.width*(.3+Math.random()*.4),y:cv.height*.5,vx:(Math.random()-.5)*40*dpr,vy:-(60+Math.random()*90)*dpr,l:1.6,m:0,r:(1+Math.random()*2)*dpr,c:Math.random()<.5?C.c:'#fff6cf',s:Math.random()<.4});
  if(P.length>600)P.splice(0,P.length-600);g.globalAlpha=1;g.globalCompositeOperation='source-over';requestAnimationFrame(step)};requestAnimationFrame(step);
 try{CKS.pickup(2)}catch(_){}ckVibe(20);
 setTimeout(()=>{if(!live)return;burst=true;ov.classList.add('open');spawnBurst();try{CKS.lootBurst(t>=3?4:2)}catch(_){}ckVibe([30,40,60]);
  const rows=ckChRows(r),box=ov.querySelector('.cards');
  rows.forEach((x,i)=>{const d=document.createElement('div');d.className='card';d.style.animationDelay=(.35+i*.16)+'s';d.innerHTML=`${ckImg(x[0],'ck-cimg')}<b>${x[2].toLocaleString()}</b><small>${x[1]}${x[3]?'<br>'+x[3]:''}</small>`;box.appendChild(d);setTimeout(()=>{if(live)try{CKS.pickup(Math.min(5,1+i))}catch(_){}},(350+i*160))});
  const v=ckChValue(r),pr=C.p;ov.querySelector('.tot').innerHTML=(zh?'总价值 ≈ ':'Total value ≈ ')+`<b>${v.toFixed(1)} 💎</b> <span class="${v>pr?'up':'dn'}">(${zh?'价格':'price'} ${pr} 💎)</span>`},950);
 const close=()=>{if(!live)return;live=false;ov.classList.add('out');setTimeout(()=>ov.remove(),300)};
 ov.querySelector('.ok').onclick=e=>{e.stopPropagation();close()};
 ov.addEventListener('click',e=>{if(!ov.classList.contains('open'))return;if(e.target===ov||e.target===cv)close()})}
// ---- boss drops: chance rises with the level; better tiers later; replays drop less and lower ----
function ckChDrop(i,replay){const dm=[.8,.9,1,1.1,1.2][S.dif]||1;let p=Math.min(.33,.05+i*.0028)*dm;if(replay)p*=.25;if(Math.random()>=p)return -1;
 const f=Math.max(0,Math.min(1,i/99)),a=[60,28,9,3,0,0],b=[18,26,24,17,10,5],w=a.map((x,k)=>x+(b[k]-x)*f);let t=ckRoll(w);if(replay)t=Math.min(t,2);return t}
// ---- automatic item activation ----
const CK_NOAUTO={river:1,air:1,bomb:1};   // these need the player to pick a spot on the map
function ckAutoOk(id){return !!IT.find(x=>x.id===id)&&!CK_NOAUTO[id]&&!CK_RARE[id]}
function ckAutoBtn(id){if(!ckAutoOk(id))return '';ckChInit();const on=!!S.autoIt[id],zh=LANG==='zh';return `<button type="button" class="ck-auto${on?' on':''}" data-auto="${id}" aria-pressed="${on}" title="${zh?'冷却结束后自动使用（需有库存）':'Use automatically whenever it is off cooldown and in stock'}">${on?(zh?'自动 ✓':'AUTO ✓'):(zh?'自动':'AUTO')}</button>`}
let CK_AT=0;
function ckAutoTick(dt){if((CK_AT-=dt)>0)return;CK_AT=.25;if(!L||L.demo||L.over||L.paused||mOpen||L.wave<1||!S.autoIt)return;try{if(ckLootBusy())return}catch(_){}
 const en=L.en.filter(e=>e.hp>0);if(!en.length)return;
 for(const id in S.autoIt){if(!S.autoIt[id]||!ckAutoOk(id)||!(L.inv[id]>0)||L.cdn[id]>0||L.placing)continue;
  if(id==='rep'&&L.lives>ckCap()-ckHeal())continue;if(id==='heli'&&L.hel)continue;
  try{useItem(id);invR()}catch(_){}}}
// ---- wiring: clicks for chest and auto buttons (shop, modal), and the title-screen button ----
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-cbuy],[data-copen],[data-auto]');if(!b)return;e.stopPropagation();e.preventDefault();
 if(b.dataset.auto){ckChInit();const id=b.dataset.auto;S.autoIt[id]=!S.autoIt[id];if(!S.autoIt[id])delete S.autoIt[id];try{save()}catch(_){}try{renderShop()}catch(_){}toast((S.autoIt[id]?lvZ('已开启自动使用：','Auto-use on: '):lvZ('已关闭自动使用：','Auto-use off: '))+(IT.find(x=>x.id===id)||{}).n);return}
 if(b.dataset.cbuy)ckChBuy(+b.dataset.cbuy);else if(b.dataset.copen)ckChOpen(+b.dataset.copen)},true);
setTimeout(()=>{try{ckChInit()}catch(_){}const row=document.querySelector('#title .opts2');if(row&&!document.getElementById('ckchbtn')){const b=document.createElement('button');b.className='bt g';b.id='ckchbtn';b.style.gridColumn='1/-1';b.setAttribute('data-i18n','🎁 Treasure Chests');b.textContent='🎁 Treasure Chests';const tp=document.getElementById('topupbtn');row.insertBefore(b,tp||null);b.onclick=()=>ckChMenu();if(typeof ZH==='object')ZH['🎁 Treasure Chests']='🎁 宝箱';try{updLang()}catch(_){}}},60);
