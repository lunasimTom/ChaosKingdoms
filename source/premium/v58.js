/* ===== Chaos Kingdoms v5.8 · painted realm cards, realm-true terrain, epic items, forge, help hub ===== */

// ---- 1. battle terrain follows each realm card: ground hue / saturation / lightness (never too dark) ----
// h,s,l = ground colour (tiles are painted from it), ph = path hue; sky = backdrop gradient
const CK_RPAL={0:{h:100,s:48,l:36,ph:34},1:{h:32,s:55,l:42,ph:26},2:{h:205,s:45,l:56,ph:212},3:{h:350,s:40,l:30,ph:16},4:{h:205,s:45,l:54,ph:36},
 5:{h:188,s:38,l:31,ph:192,sky:['#0a2a33','#3fcfe0']},6:{h:250,s:40,l:37,ph:262},7:{h:218,s:45,l:35,ph:210,sky:['#0b1d4a','#5aa8ff']},8:{h:230,s:32,l:41,ph:236,sky:['#1a1f4a','#8f9fff']},
 9:{h:140,s:48,l:33,ph:40,sky:['#0d3a24','#4fe08a']},10:{h:352,s:28,l:29,ph:350,sky:['#2a0d18','#ff5a5a']},11:{h:26,s:55,l:35,ph:30,sky:['#3a1a08','#ffa040']},12:{h:285,s:40,l:29,ph:290,sky:['#1f0a33','#b86bff']}};
(function(){try{for(const k in CK_RPAL)if(R[k])Object.assign(R[k],CK_RPAL[k])}catch(_){}})();

// ---- 2. HUD level badge: open the world map on the current realm, with this level marked ----
let CK_HERE=null;
function ckMapHere(){if(CK_HERE==null)return;const ri=CK_HERE/8|0;if(selectedRealm!==ri)return;const b=document.querySelector(`#map .nd[data-i="${CK_HERE}"]`);if(!b)return;
 b.classList.add('ck-here');if(!b.querySelector('.ck-herev')){const v=document.createElement('span');v.className='ck-herev';v.textContent=lvZ('当前','HERE');b.appendChild(v)}
 const pin=document.querySelector(`#map .realm-pin[data-region="${ri}"]`);if(pin)pin.classList.add('ck-herepin');
 const rd=document.querySelector('#map .realm-detail');if(rd)setTimeout(()=>{try{rd.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(_){}},120)}
(function(){const _bm=buildMap;buildMap=function(){const r=_bm.apply(this,arguments);try{ckMapHere()}catch(_){}return r}})();
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#map .realm-pin');if(t&&CK_HERE!=null&&+t.dataset.region!==(CK_HERE/8|0))CK_HERE=null},true);
function ckLvJump(){if(!L||L.demo||S.mode!=='play')return;const i=L.i,zh=LANG==='zh';
 const go=()=>{closeM();try{resumeGameAudio()}catch(_){}CK_HERE=i;toMap();selectedRealm=i/8|0;buildMap()};
 if(L.over){go();return}
 modal(`<h2 class="f">${zh?'打开世界地图':'Open the world map'}</h2><p class="ck-warn">⚠ ${zh?'离开将放弃当前关卡尚未完成的进度。':'Leaving discards the unfinished progress in this level.'}</p><div class="ukp"><span>${zh?'当前位置':'You are on'}</span><b>${R[i/8|0].n} · ${TL('Level {0}',i%8+1)}</b></div><button class="bt r" id="m1">${zh?'前往地图':'Go to the map'}</button><button class="bt g" id="m4">${zh?'继续战斗':'Keep playing'}</button>`,go);
 const k=document.getElementById('m4');if(k)k.onclick=closeM}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#hud .top>.lv');if(!t||S.mode!=='play'||!L||L.demo)return;e.preventDefault();e.stopPropagation();ckLvJump()},true);

// ---- 3. item shop: Buy x10 ----
function ckX10Cost(id,pr){let t=0;for(let k=0;k<10;k++){t+=pr;if(id==='rep')pr+=150}return t}
function ckX10Btn(id,pr){const tot=ckX10Cost(id,pr),ok=Economy.canSpendBattle?Economy.canSpendBattle(tot):true;return `<button class="bt pay ck-x10" data-x10="${id}" ${ok?'':'disabled'}><span class="buytxt">×10</span>${COIN}<span class="price">${tot>=10000?(tot/1000).toFixed(1).replace(/\.0$/,'')+'K':tot.toLocaleString()}</span></button>`}
function ckBuy10(id){const it=IT.find(x=>x.id===id);if(!it||it.stock!=null||!L||!L.price)return;if(!itemOpen(id))return toast(lvZ('指挥官 Lv.'+LV_ITEM[id]+' 解锁此道具','Unlocks at Commander Lv.'+LV_ITEM[id]));
 const tot=ckX10Cost(id,L.price[id]);if(!charge(tot))return toast(lvZ('金币不足（需要 ','Not enough coins (need ')+tot.toLocaleString()+')');
 L.is=(L.is||0)+tot;L.inv[id]=(L.inv[id]||0)+10;if(id==='rep')L.price.rep+=1500;toast(lvZ(it.n+' ×10 已放入道具栏',it.n+' ×10 added to the inventory'));try{sfx('coin')}catch(_){}try{CKS.pickup(2)}catch(_){}render()}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x10]');if(!b)return;e.preventDefault();e.stopPropagation();if(!b.disabled)ckBuy10(b.dataset.x10)},true);

// ---- 4. auto-use: one item at a time, and never before the active item's effect has fully run out ----
const CK_IDUR={rep:1.5,frz:4,met:2.5,ovc:20,idol:30,fbomb:2.5,ibomb:6,scroll:2,horn:15,trap:2,aid:6,shield:15,legion:16,heli:14};
let CK_ACLK=0,CK_ABUSY=0,CK_AEND={},CK_AL=null;
ckAutoTick=function(dt){if(CK_AL!==L){CK_AL=L;CK_ACLK=0;CK_ABUSY=0;CK_AEND={}}
 if(L&&!L.demo&&!L.over&&!L.paused&&!mOpen)CK_ACLK+=dt;
 if((CK_AT-=dt)>0)return;CK_AT=.25;if(!L||L.demo||L.over||L.paused||mOpen||L.wave<1||!S.autoIt)return;try{if(ckLootBusy())return}catch(_){}
 if(CK_ACLK<CK_ABUSY)return;   // the previous auto item is still working
 const en=L.en.filter(e=>e.hp>0);if(!en.length)return;
 const ids=Object.keys(S.autoIt).sort((a,b)=>(CK_AEND[a]||0)-(CK_AEND[b]||0));   // the item that has waited longest goes first
 for(const id of ids){if(!S.autoIt[id]||!ckAutoOk(id)||!(L.inv[id]>0)||L.cdn[id]>0||L.placing)continue;
  if(CK_ACLK<(CK_AEND[id]||0))continue;if(L.bf&&L.bf[id]>0)continue;
  if(id==='rep'&&L.lives>ckCap()-ckHeal())continue;if(id==='heli'&&L.hel)continue;
  const n0=L.inv[id];try{useItem(id);invR()}catch(_){}
  if((L.inv[id]||0)<n0){const du=CK_IDUR[id]||2.5;CK_AEND[id]=CK_ACLK+du;CK_ABUSY=CK_ACLK+du;break}}};

// ---- 5. epic item activations: themed sound, a cast flourish and a screen effect for every item ----
const CK_IFX={rep:['#7dffa0','heal'],frz:['#bfeaff','frost'],met:['#ff9a55','fire'],ovc:['#7fe8ff','speed'],idol:['#ffd34a','gold'],fbomb:['#ff7a2a','fire'],ibomb:['#9fe2ff','frost'],
 scroll:['#d9b8ff','storm'],horn:['#ffd98a','war'],trap:['#ffe08a','war'],aid:['#fff4c0','holy'],shield:['#aee6ff','shield'],river:['#5ac8ff','water'],legion:['#ffd36a','war'],
 air:['#ff6a4a','fire'],bomb:['#ff8a3a','fire'],heli:['#c8e0ff','storm'],r_chrono:['#7ad8ff','frost'],r_dragon:['#ff6a2a','fire'],r_aegis:['#ffd36a','shield'],r_forge:['#ffb84d','war'],r_midas:['#ffe066','gold'],r_war:['#ff7a7a','war']};
let CK_IFXQ=0;
function ckItemImg(id){const it=IT.find(x=>x.id===id);if(it&&SPRD[it.sp])return SPRD[it.sp];if(CKA[id])return CKA[id];return null}
function ckItemName(id){const it=IT.find(x=>x.id===id);if(it)return TL(it.n);const r=CK_RARE[id];return r?ckLZ(r.n):id}
function ckCanvasRect(){const cv=document.getElementById('cv');return cv?cv.getBoundingClientRect():{left:0,top:0,width:innerWidth,height:innerHeight}}
function ckCast(id){const F=CK_IFX[id]||['#ffd36a','gold'],r=ckCanvasRect(),old=document.getElementById('ck-cast');if(old)old.remove();
 const el=document.createElement('div');el.id='ck-cast';el.className='ck-cast k-'+F[1];el.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;--c:${F[0]}`;
 const im=ckItemImg(id);el.innerHTML=`<i class="ck-cfx"></i><div class="ck-cc"><b class="ck-crays"></b>${im?`<img src="${im}" alt="">`:`<em>${(CK_RARE[id]||{}).ic||'✦'}</em>`}<span>${ckItemName(id)}</span></div>`;
 document.body.appendChild(el);const dur={frost:4200,gold:2600,heal:2200,speed:2200,storm:1800,fire:1800,war:2000,holy:2400,shield:2600,water:2200}[F[1]]||2000;setTimeout(()=>el.classList.add('out'),dur-500);setTimeout(()=>el.remove(),dur)}
function ckItemWorld(id){if(!L||L.demo)return;const R2=Math.random,mid=pp(L.cols/2-.5,L.rows/2-.5),G=(L.goals||[]).map(g=>pp(g[0],g[1])),en=L.en.filter(e=>e.hp>0),big=Math.max(W,H);
 const towers=L.tr.filter(t=>t&&!t.building);
 try{switch(id){
 case'rep':G.forEach(p=>{for(let k=0;k<3;k++)setTimeout(()=>{vRing(p.x,p.y,tw*(1.2+k*.6),'#7dffa0',.7,4);for(let i=0;i<14;i++)vp(p.x+(R2()-.5)*tw*2,p.y+R2()*tw*.4,(R2()-.5)*30,-60-R2()*90,1.2,3+R2()*3,'#c8ffd6','g',-20)},k*180)});break;
 case'frz':for(let k=0;k<3;k++)setTimeout(()=>vRing(mid.x,mid.y,big*(.4+k*.35),'#e8fbff',.8,6),k*140);en.forEach(e=>{const p=eS(e);vGlow(p.x,p.y,tw*.9,'#bfeaff',.5)});L.shake=Math.max(L.shake||0,.45);break;
 case'met':for(let k=0;k<7;k++){const x=R2()*W,y=R2()*H*.9;vMeteor(x+tw*5,y-tw*12,x,y,.5+k*.08,'#ffb36b',()=>{vBoom(x,y,.9);vRing(x,y,tw*1.6,'#ffcf8a',.5,4)})}L.shake=Math.max(L.shake||0,.7);break;
 case'ovc':for(let k=0;k<towers.length;k++){const a=towers[k],b=towers[(k+1)%towers.length];if(!b||a===b)continue;const p=pp(a.x,a.y);setTimeout(()=>{vBolt(p.x,p.y-tw*.4);vGlow(p.x,p.y,tw*.9,'#7fe8ff',.6)},k*40)}break;
 case'idol':for(let i=0;i<90;i++)vp(R2()*W,-20-R2()*H*.6,(R2()-.5)*30,160+R2()*240,2.2,3+R2()*3,R2()<.5?'#ffd34a':'#fff1a8','d',240);break;
 case'fbomb':setTimeout(()=>{L.shake=Math.max(L.shake||0,.6);vFlash('#ff8a3d',.22)},600);break;
 case'ibomb':for(let i=0;i<18;i++){const x=R2()*W,y=R2()*H;vSmoke(x,y,3,'#dff4ff',14,1.6)}for(let k=0;k<2;k++)setTimeout(()=>vRing(mid.x,mid.y,big*.9,'#bfeaff',.9,5),k*200);break;
 case'scroll':vFlash('#ffffff',.35);for(let i=0;i<4;i++)setTimeout(()=>{const x=R2()*W,y=R2()*H*.8;vBolt(x,y);vGlow(x,y,tw*1.4,'#e6d0ff',.5)},120+i*110);L.shake=Math.max(L.shake||0,.6);break;
 case'horn':towers.forEach((t,k)=>{const p=pp(t.x,t.y);setTimeout(()=>{vRing(p.x,p.y,tw*1.3,'#ffd98a',.6,4);vSparks(p.x,p.y,10,'#ffe7a8',150,.6)},k*25)});for(let k=0;k<3;k++)setTimeout(()=>vRing(mid.x,H,big,'#ffd98a',1,7-k*2),k*220);break;
 case'trap':en.slice().sort((a,b)=>b.pr-a.pr).slice(0,3).forEach(e=>{const p=eS(e);vRing(p.x,p.y,tw*1.3,'#ffe08a',.5,5);vSparks(p.x,p.y,20,'#fff0b0',220,.5)});L.shake=Math.max(L.shake||0,.4);break;
 case'aid':for(let i=0;i<9;i++)setTimeout(()=>{const p=pp(R2()*(L.cols-1),R2()*(L.rows-1));vPillar(p.x,p.y,'#fff4c0',1.1);vRing(p.x,p.y,tw*1.3,'#fff4c0',.6,4)},i*90);break;
 case'shield':G.forEach(p=>{for(let k=0;k<4;k++)setTimeout(()=>{vRing(p.x,p.y,tw*(1.4+k*.5),'#aee6ff',.8,5);vGlow(p.x,p.y,tw*2.2,'#aee6ff',.35)},k*160)});break;
 case'legion':case'heli':case'air':case'bomb':case'river':vFlash(CK_IFX[id][0],.18);break;
 case'r_chrono':for(let k=0;k<4;k++)setTimeout(()=>vRing(mid.x,mid.y,big*(.3+k*.25),'#9ff0ff',.9,5),k*160);break;
 case'r_dragon':for(let i=0;i<10;i++)setTimeout(()=>{const x=R2()*W,y=R2()*H;vBoom(x,y,1.1)},i*80);L.shake=Math.max(L.shake||0,.9);break;
 case'r_aegis':G.forEach(p=>{vPillar(p.x,p.y,'#ffd36a',1.2);for(let k=0;k<3;k++)setTimeout(()=>vRing(p.x,p.y,tw*(1.5+k*.7),'#ffd36a',.8,6),k*160)});break;
 case'r_forge':towers.forEach(t=>{const p=pp(t.x,t.y);vPillar(p.x,p.y,'#ffb84d',.9);vSparks(p.x,p.y,16,'#ffd36a',180,.6)});break;
 case'r_midas':for(let i=0;i<120;i++)vp(R2()*W,-20-R2()*H*.6,(R2()-.5)*30,160+R2()*240,2.4,3+R2()*3,'#ffe066','d',240);break;
 case'r_war':towers.forEach(t=>{const p=pp(t.x,t.y);vPillar(p.x,p.y,'#ff9a7a',.9)});for(let k=0;k<3;k++)setTimeout(()=>vRing(mid.x,mid.y,big,'#ff9a7a',1,7),k*200);L.shake=Math.max(L.shake||0,.5);break}}catch(_){}}
function ckItemFx(id){if(!L||L.demo)return;const now=performance.now();if(now-CK_IFXQ<120)return;CK_IFXQ=now;try{CKS.item(id)}catch(_){}try{ckCast(id)}catch(_){}ckItemWorld(id);try{ckVibe([18,30,40])}catch(_){}}
// silence the old shared "upgrade" blip during an item use; then play the item's own effect
function ckQuietSfx(fn){const _s=sfx;sfx=function(k){if(k==='upgrade')return true;return _s.apply(this,arguments)};try{return fn()}finally{sfx=_s}}
(function(){const _u=useItem;useItem=function(id){const n0=L&&L.inv?L.inv[id]||0:0;const r=ckQuietSfx(()=>_u.apply(this,arguments));try{if(L&&L.inv&&(L.inv[id]||0)<n0)ckItemFx(id)}catch(_){}return r}})();
['placeRiver','placeAir','placeBomb'].forEach(fn=>{try{const f=window[fn]||eval(fn);if(typeof f!=='function')return;const id=fn==='placeRiver'?'river':fn==='placeAir'?'air':'bomb';
 const w=function(){const n0=L.inv[id]||0;const r=ckQuietSfx(()=>f.apply(this,arguments));try{if((L.inv[id]||0)<n0)ckItemFx(id)}catch(_){}return r};eval(fn+'=w')}catch(_){}});
(function(){const _r=ckUseRare;ckUseRare=function(id){const n0=L.inv[id]||0,pk=CKS.pickup;CKS.pickup=()=>true;let r;try{r=ckQuietSfx(()=>_r.apply(this,arguments))}finally{CKS.pickup=pk}try{if((L.inv[id]||0)<n0)ckItemFx(id)}catch(_){}return r}})();

// ---- 6. diamond forge: shards gather into a gem (painted 16-frame sequence), or crack apart ----
const CK_FG={img:null,n:16,fw:384,fh:256};
function ckForgeImg(){if(!CK_FG.img&&typeof CK_FORGEIMG!=='undefined'){CK_FG.img=new Image();CK_FG.img.src=CK_FORGEIMG}return CK_FG.img}
ckForgeImg();
ckForgeFx=function(ok){const zh=LANG==='zh',old=document.getElementById('ck-fgfx');if(old)old.remove();const ov=document.createElement('div');ov.id='ck-fgfx';ov.className='v58';
 ov.innerHTML=`<div class="fg-stage"><i class="fg-runes"></i><i class="fg-rays"></i><canvas width="384" height="256"></canvas><i class="fg-flash"></i></div><div class="msg"></div>`;document.body.appendChild(ov);
 const cv=ov.querySelector('canvas'),g=cv.getContext('2d'),im=ckForgeImg(),t0=performance.now(),FR=80,shards=[];let last=-1,done=false,crackT=0;
 try{CKS.forge(ok)}catch(_){}ckVibe(12);setTimeout(()=>ckVibe(12),300);setTimeout(()=>ckVibe(ok?[30,40,60]:[90]),760);
 const frameAt=el=>{if(ok)return Math.min(CK_FG.n-1,Math.floor(el/FR));const k=Math.floor(el/FR);return k<=6?k:-1};
 const draw=now=>{if(done)return;const el=now-t0;g.clearRect(0,0,384,256);const f=frameAt(el);
  if(f>=0&&im&&im.complete&&im.naturalWidth){g.drawImage(im,f*CK_FG.fw,0,CK_FG.fw,CK_FG.fh,0,0,384,256);last=f}
  else if(!ok){ // the half-formed gem bursts into shards
   if(!crackT){crackT=now;ov.classList.add('crack');for(let i=0;i<26;i++){const a=Math.random()*6.283,s=2+Math.random()*6;shards.push({x:192,y:120,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,r:Math.random()*6.283,vr:(Math.random()-.5)*.4,sz:6+Math.random()*12,a:1})}}
   for(const p of shards){p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.r+=p.vr;p.a=Math.max(0,p.a-.012);g.save();g.globalAlpha=p.a;g.translate(p.x,p.y);g.rotate(p.r);const gr=g.createLinearGradient(-p.sz,0,p.sz,0);gr.addColorStop(0,'#6fa8ff');gr.addColorStop(.5,'#2a3cff');gr.addColorStop(1,'#a8d8ff');g.fillStyle=gr;g.beginPath();g.moveTo(0,-p.sz);g.lineTo(p.sz*.5,0);g.lineTo(0,p.sz);g.lineTo(-p.sz*.5,0);g.closePath();g.fill();g.restore()}}
  if(el<3200)requestAnimationFrame(draw)};
 requestAnimationFrame(draw);
 setTimeout(()=>{ov.classList.add(ok?'win':'fail');ov.querySelector('.msg').innerHTML=ok?`<b>${zh?'锻造成功！':'Forged!'}</b><span>+1 💎 · ${zh?'钻石':'Diamond'}</span>`:`<b>${zh?'锻造失败':'The forge failed'}</b><span>${zh?'金币和碎片已消耗':'Gold and shards were used up'}</span>`},ok?720:640);
 const close=()=>{done=true;ov.classList.add('out');setTimeout(()=>{ov.remove();try{ckInvRefresh()}catch(_){}},260)};setTimeout(()=>ov.addEventListener('click',close),1500);setTimeout(close,4200)};

// ---- 7. main-menu music: the track is pre-rendered (menu_music.mp3), so it starts on the first tap ----
let CK_MENUB=null;
function ckMenuBuf(){if(CK_MENUB)return CK_MENUB;CK_MENUB=new Promise((res,rej)=>{try{let ctx=null;try{const OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(OC)ctx=new OC(2,24000,24000)}catch(_){}if(!ctx)ctx=(typeof au!=='undefined'&&au)||new (window.AudioContext||window.webkitAudioContext)();
  const b64=CK_MENU_MP3.split(',')[1],bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  const ok=b=>res(b),bad=e=>{CK_MENUB=null;rej(e||'decode')};const p=ctx.decodeAudioData(u.buffer,ok,bad);if(p&&p.then)p.then(ok,bad)}catch(e){CK_MENUB=null;rej(e)}});return CK_MENUB}
(function(){if(typeof CK_MENU_MP3==='undefined')return;const _song=song;song=function(k){if(k==='menu')return ckMenuBuf().catch(()=>_song(k));return _song(k)}})();
setTimeout(()=>{try{ckMenuBuf().then(b=>{try{MC.menu=b}catch(_){}}).catch(()=>{})}catch(_){}},300);

// ---- 8. home: medal picker (from the three slots), Help hub, uniform tiles, fits one screen ----
function ckMedalPicker(){const zh=LANG==='zh';ckA55Init();const got=ACHS.filter(a=>(S.ach||[]).includes(a.id));S.show=(S.show||[]).filter(x=>CK_AMAP[x]&&(S.ach||[]).includes(x));
 const cell=a=>{const k=S.show.indexOf(a.id);return `<button type="button" class="ck-mp${k>=0?' on':''}" data-mp="${a.id}"><img src="${CKM[a.m]}" alt=""><span>${ckAName(a)}</span>${k>=0?`<em>${k+1}</em>`:''}</button>`};
 modal(`<h2 class="f">${zh?'展示勋章':'Showcase medals'}</h2><p class="ck-mph">${zh?'选择最多 3 枚勋章，展示在主界面的指挥官卡片上。再点一次可取消。':'Choose up to 3 medals to show on your commander card. Tap again to remove one.'}</p>${got.length?`<div class="ck-mpg">${got.map(cell).join('')}</div>`:`<p class="ck-mpe">${zh?'还没有解锁勋章。完成成就即可获得勋章！':'No medals yet. Complete achievements to earn them!'}</p>`}<button class="bt" id="m1">${zh?'完成':'Done'}</button>${got.length?'':`<button class="bt g" id="m4">${zh?'查看成就':'See achievements'}</button>`}`,()=>{closeM();try{refreshProfileTeaser()}catch(_){}try{ckHomeCard()}catch(_){}});
 const m4=document.getElementById('m4');if(m4)m4.onclick=()=>{closeM();try{CK_PTAB='ach';openProfile()}catch(_){}}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mp]');if(b){e.preventDefault();e.stopPropagation();const id=b.dataset.mp;S.show=(S.show||[]).filter(x=>CK_AMAP[x]);
  if(S.show.includes(id))S.show=S.show.filter(x=>x!==id);else{if(S.show.length>=3){toast(lvZ('最多展示 3 枚，先取消一枚','Up to 3 medals: remove one first'));return}S.show.push(id)}try{save()}catch(_){}ckMedalPicker();return}
 const h=e.target.closest&&e.target.closest('#ckhc .ck-hmed,#ckhc .ck-hhint');if(h){e.preventDefault();e.stopPropagation();ckMedalPicker()}},true);
(function(){const _hc=ckHomeCard;ckHomeCard=function(){const r=_hc.apply(this,arguments);try{const box=document.getElementById('ckhc');if(box&&!box.querySelector('.ck-hhint')){const h=document.createElement('div');h.className='ck-hhint';box.insertBefore(h,box.firstChild)}const h=box&&box.querySelector('.ck-hhint');if(h)h.innerHTML=`<span>${lvZ('点击选择要在主界面展示的勋章','Tap to choose the medals shown on your card')}</span><b>›</b>`}catch(_){}return r}})();

// Help hub: everything about playing well, in one place
let CK_HTAB='basics';
function ckHelpHtml(){const zh=LANG==='zh',Z=(a,b)=>zh?a:b,li=(ic,t,d)=>`<li><b>${ic} ${t}</b><span>${d}</span></li>`,ul=a=>`<ul>${a.join('')}</ul>`;
 const tabs=[['basics',Z('入门','Basics')],['towers',Z('防御塔','Towers')],['combos',Z('协同','Synergy')],['enemies',Z('敌人','Enemies')],['items',Z('道具','Items')],['progress',Z('成长','Progress')],['tips',Z('攻略','Strategy')],['about',Z('关于','About')]];
 let b='';const T=CK_HTAB;
 if(T==='basics')b=ul([li('🎯',Z('目标','Goal'),Z('怪物从紫色出怪口出发，沿道路冲向你的基地。建塔阻止它们；所有基地生命归零即失败。','Monsters leave the purple portals and march on your bases. Build towers to stop them; you lose when every base runs out of lives.')),
  li('🏗',Z('建造','Building'),Z('在底部选择防御塔，再点击地图空地。点击已建的塔可以升级或出售。','Pick a tower at the bottom, then tap an empty tile. Tap a built tower to upgrade or sell it.')),
  li('🌊',Z('波次','Waves'),Z('每关有若干波怪物。点击“召唤”可提前开始下一波并获得额外金币。','Each level has several waves. Tap Call to start the next wave early for bonus coins.')),
  li('🏰',Z('基地','Bases'),Z('点击基地：加固、修复、屏障。多座基地时每座独立计算生命。','Tap a base to Fortify, Repair or raise a Barrier. With several bases, each has its own lives.')),
  li('✴',Z('地形','Terrain'),Z('神殿：塔伤害 +20%、射程 +10%。出怪口附近伤害 -15%。沼泽减速怪物；水域不能建造也不能穿越。','Shrines: +20% damage, +10% range. Near portals towers deal 15% less. Swamps slow monsters; water blocks building and walking.')),
  li('⭐',Z('星级与皇冠','Stars and crowns'),Z('通关根据剩余生命与表现获得 1–5 星。每关还有一个可选的皇冠挑战。','Wins earn 1-5 stars from lives kept and performance. Every level also has an optional crown challenge.')),
  li('🗺',Z('地图','World map'),Z('点击战斗画面左上角的关卡标识，可直接打开世界地图并定位到当前关卡。','Tap the level badge at the top left of the battle screen to jump to the world map at your current level.'))]);
 if(T==='towers')b=ul(Object.entries(TW).map(([k,d])=>li(`<img class="ck-hti" src="${icon(k)}" alt="">`,TL(d.n)+` · ${COIN}${d.cost}`,TL(d.d)+(CKDT[k]?' · '+Z({p:'物理',m:'魔法',e:'元素'}[CKDT[k]],{p:'Physical',m:'Magic',e:'Elemental'}[CKDT[k]]):''))));
 if(T==='combos')b=ul([li('⚔',Z('伤害类型','Damage types'),Z('物理：箭塔、炮塔 · 魔法：法师、圣光、闪电 · 元素：冰霜、毒。抗性最多 50%。','Physical: Archer, Cannon · Magic: Mage, Holy, Lightning · Elemental: Frost, Poison. Resistances never exceed 50%.')),
  li('❄',Z('冰霜 + 炮塔','Frost + Cannon'),Z('被减速的敌人受到额外的炮塔溅射伤害（+30%）。','Slowed enemies take bonus cannon splash damage (+30%).')),
  li('☠',Z('毒 + 闪电','Poison + Lightning'),Z('中毒的敌人受到额外的连锁闪电伤害（+30%）。','Poisoned enemies take bonus chain-lightning damage (+30%).')),
  li('✧',Z('圣光 + 重型','Holy + Heavy'),Z('圣光塔对重装怪与首领格外有效；命中后全体塔伤害 +20%（圣印）。','Holy towers excel against brutes and bosses; a Holy hit Marks the target so every tower deals +20%.')),
  li('💎',Z('碎冰','Shatter'),Z('箭塔/炮塔攻击被冰冻的敌人伤害 +40%。','Archer and Cannon deal +40% to frozen enemies.')),
  li('🔮',Z('奥术破甲','Arcane Break'),Z('法师削弱护甲、结界与护盾。炮塔对护盾伤害 ×2。','Mages weaken armour, wards and shields. Cannons deal double damage to shields.')),
  li('✦',Z('战术选择','Tactical choices'),Z('每波之间可以选择一个战术强化。','Pick one tactical upgrade between waves.'))]);
 if(T==='enemies'){const roles=Object.keys(CKR).map(r=>li(`<em style="color:${CKR[r].c}">${CKR[r].g}</em>`,ckZ(CKR[r].n),ckZ(CKR[r].tip)));
  const mb=CK_MB.map((m,i)=>`${['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][i]} ${Z(m[0][0],m[0][1])} (${Z(CK_MBM[m[2]][0][0],CK_MBM[m[2]][0][1])})`).join(' · ');
  b=ul(roles.concat([li('🦇',Z('飞行怪物','Flyers'),Z('飞越道路与障碍直扑基地，在基地周围布防。','Fly over roads and obstacles straight at a base: guard your bases.')),
   li('👑',Z('精英怪','Elites'),Z('头顶金冠：生命 ×2.2，击杀金币 ×3。','Wear a gold crown: 2.2x health, 3x gold.')),
   li('⚔',Z('小首领（第 4 关）','Mini-bosses (Level 4)'),Z('每个王国第 4 关的最后一波末尾出现，带招牌技能，生命降到一半召唤护卫；击败后有 8 秒收集宝藏。','End of the final wave on Level 4 of every realm, each with a signature move; calls guards at half health. Defeat it for an 8-second treasure grab.')+'<br><small>'+mb+'</small>'),
   li('💀',Z('首领（第 8 关）','Bosses (Level 8)'),Z('无视建筑直冲基地；有弱点伤害类型，后期会适应伤害、召唤援军，第 40 关起会狂暴。','Ignore buildings and march on a base. Each has a weak damage type; later bosses adapt, summon reinforcements and, from Level 40, rage.')),
   li('🏆',Z('四灾王座','The Fourfold Throne'),Z('第 97–100 关的最终首领会掉落堆积如山的宝藏——8 秒内永远捡不完，尽量多捡！','The final bosses of levels 97-100 drop mountains of treasure, far more than 8 seconds allow: grab all you can!'))]))}
 if(T==='items')b=ul(IT.map(it=>li(`<img class="ck-hti" src="${SPRD[it.sp]}" alt="">`,TL(it.n),(DET[it.id]?TL(DET[it.id].fx):TL(it.d))+' · '+Z('冷却 ','Cooldown ')+CDT[it.id]+'s')).concat([
  li('🔁',Z('自动使用','Auto-use'),Z('在商店为道具打开 AUTO：一次只自动使用一个道具，并且会等上一个道具的效果完全结束后才使用下一个。','Switch AUTO on in the shop. Auto-use fires one item at a time and waits until the active item’s effect has fully ended before using the next.')),
  li('✖10',Z('批量购买','Buy ×10'),Z('商店里的“×10”按钮一次购买 10 个。','The ×10 button in the shop buys ten at once.')),
  li('🌟',Z('稀有宝物','Rare treasures'),Object.values(CK_RARE).map(r=>r.ic+' '+ckLZ(r.n)).join(' · '))]));
 if(T==='progress')b=ul([li('🎖',Z('指挥官等级','Commander level'),Z('胜利获得经验，最高 50 级。升级奖励金币、钻石与宝箱，并解锁更多道具和属性上限。','Wins give XP up to Level 50. Level-ups pay gold, diamonds and chests, and unlock items and higher attribute caps.')),
  li('📈',Z('属性','Attributes'),Z('在统帅档案中用金币提升属性，最高 30 级；强化符可直接升一级。','Upgrade attributes with gold in Commander Record, up to Level 30; Enhancement Runes add a level directly.')),
  li('🎁',Z('宝箱','Chests'),Z('六种品级（绿到黑），用钻石购买或由首领掉落，在 商店 › 宝箱 中打开。','Six tiers (Green to Black), bought with diamonds or dropped by bosses; open them in Shop › Chests.')),
  li('💎',Z('钻石与锻造','Diamonds and the forge'),Z('4 个钻石碎片 + 4000 金币可锻造 1 颗钻石（15% 失败）。在 背包 › 材料 中锻造。','4 diamond shards + 4,000 gold forge one diamond (15% chance to fail), in Inventory › Materials.')),
  li('🎒',Z('背包','Inventory'),Z('道具、材料与宝物都在背包中；可以按 80% 价格出售。','Items, materials and treasures live in the Inventory; sell for 80% of the price.')),
  li('🏅',Z('成就与勋章','Achievements and medals'),Z('40 项成就奖励金币、钻石与称号。点击主界面勋章栏，选择最多 3 枚展示。','40 achievements pay gold, diamonds and titles. Tap the medal row on the home screen to show up to 3.')),
  li('📅',Z('每日奖励','Daily reward'),Z('每天第一次进入游戏领取奖励，连续登录奖励更高。','Collect a reward on your first visit each day; streaks pay more.'))]);
 if(T==='tips')b=ul([li('1',Z('先挡路口','Hold the choke points'),Z('把第一批塔建在道路转弯处，射程能覆盖两段路。','Build first towers on road bends, where their range covers two stretches of road.')),
  li('2',Z('混搭伤害','Mix damage types'),Z('至少同时拥有物理与魔法塔，防止重甲或结界怪突破。','Always field both physical and magic towers so armoured or warded waves can’t walk through.')),
  li('3',Z('减速 + 输出','Slow, then burst'),Z('冰霜塔放在炮塔/闪电塔前面，让协同加成持续生效。','Put Frost in front of Cannons and Lightning so the synergy bonus is always on.')),
  li('4',Z('神殿留给主力','Shrines for your best tower'),Z('神殿位置建你升级最高的塔。','Put your most upgraded tower on a shrine.')),
  li('5',Z('提前召唤赚钱','Call early for coins'),Z('防线稳固时提前召唤，额外金币可以更快升级。','When your defence is solid, call waves early: the bonus coins snowball into upgrades.')),
  li('6',Z('优先击杀医者','Kill healers first'),Z('医者会治疗周围敌人；用高单体伤害的塔优先处理。','Healers undo your damage; focus them with high single-target towers.')),
  li('7',Z('首领前存道具','Save items for bosses'),Z('冰冻、陨石、雷电卷轴留到首领或小首领出现时使用。','Keep Freeze, Meteor and Lightning Scroll for the mini-boss or boss.')),
  li('8',Z('守住多基地','Cover every base'),Z('多基地关卡中怪物会攻击防守最弱的基地，不要只守一处。','On multi-base levels monsters target the weakest base: don’t leave one bare.')),
  li('9',Z('宝藏时刻','Treasure time'),Z('首领宝藏只有 8 秒：先点稀有光柱（紫色、橙色）。','Boss treasure lasts 8 seconds: tap the rare beams (purple, orange) first.'))]);
 if(T==='about')b=`<div class="ck-habout"><img src="${CKA.appicon}" alt=""><h3>Chaos Kingdoms</h3><p class="ck-hver">${Z('版本','Version')} V${CK_VER} · ${Z('构建','build')} ${CK_BUILD}</p><p>${Z('12 个王国 + 四灾王座，共 100 关。进度自动保存在本设备上；可在“进度导入导出”中备份。','12 realms plus the Fourfold Throne, 100 levels. Progress saves automatically on this device; back it up with Progress transfer.')}</p></div>`;
 return `<div class="ck-tips ck-help"><h3>❓ ${Z('帮助与攻略','Help & strategy')} <small>V${CK_VER}</small></h3><div class="ck-htabs">${tabs.map(([k,n])=>`<button type="button" class="ck-ub ck-hst${k===T?' on':''}" data-htab="${k}">${n}</button>`).join('')}</div><div class="ck-hbody">${b}</div></div><button class="bt" id="m1">${Z('关闭','Close')}</button>`}
function ckHelpOpen(tab){if(tab)CK_HTAB=tab;modal(ckHelpHtml(),closeM)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-htab]');if(t){e.preventDefault();e.stopPropagation();CK_HTAB=t.dataset.htab;const m=document.querySelector('#mbox .ck-help');if(m){document.getElementById('mbox').innerHTML=ckHelpHtml();const b=document.getElementById('m1');if(b)b.onclick=closeM;try{updLang()}catch(_){}}return}
 const h=e.target.closest&&e.target.closest('#ckhelpbtn');if(h){e.preventDefault();e.stopPropagation();ckHelpOpen()}},true);

// home tiles: History, Transfer, Redeem / Help, Settings, Music / Screen, Language, Install (or Records) - one 3x3 grid
CK_ICO.help='<circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4.2"/><path d="M12 17.6h.01"/>';
CK_ICO.medal='<circle cx="12" cy="14" r="6"/><path d="M8.5 3h7l-1.8 5.6M8.5 3l1.8 5.6"/><path d="M12 11.3l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z"/>';
CK_ICO.install='<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>';
function ckHomeTiles(){const card=document.querySelector('#title .tcard.ck-home'),util=card&&card.querySelector('.ck-hutil');if(!util)return;const zh=LANG==='zh';
 const mk=(id,ico,txt,attrs)=>{let b=document.getElementById(id);if(!b){b=document.createElement('button');b.id=id;b.type='button';b.className='bt g ck-tile';if(attrs)for(const k in attrs)b.setAttribute(k,attrs[k]);util.appendChild(b)}const lab=lvZ(txt[0],txt[1]);if(b.dataset.l!==LANG+lab){b.dataset.l=LANG+lab;b.innerHTML=`<span class="ckico-w">${ckIcoSvg(ico)}</span>${lab}`}return b};
 const help=mk('ckhelpbtn','help',['帮助','Help']),set=mk('ckhomeset','gear',['设置','Settings'],{'data-cksettings':'title'});
 let ins=document.getElementById('ckinstall');const hideI=!!window.CKAndroid||ckStandalone();let rec=document.getElementById('ckrecbtn');
 if(hideI){if(ins)ins.remove();rec=mk('ckrecbtn','medal',['统帅档案','Records']);rec.onclick=()=>{try{openProfile()}catch(_){}}}else if(rec){rec.remove();rec=null}
 if(ins){ins.classList.add('ck-tile');ins.classList.remove('ck-install');const lab=lvZ('安装','Install');if(ins.dataset.l2!==LANG){ins.dataset.l2=LANG;ins.dataset.l=LANG;ins.innerHTML=`<span class="ckico-w">${ckIcoSvg('install')}</span>${lab}`}}
 const ids=['histbtn','xferbtn','topupbtn','ckhelpbtn','ckhomeset',null,null,null,null];const music=util.querySelector('.musbtn'),rot=util.querySelector('.rotbtn'),lang=util.querySelector('.langbtn');
 const order=[document.getElementById('histbtn'),document.getElementById('xferbtn'),document.getElementById('topupbtn'),help,set,music,rot,lang,ins||rec].filter(Boolean);
 order.forEach((b,k)=>{if(util.children[k]!==b)util.insertBefore(b,util.children[k]||null)});void ids}
// install button now lives in the grid: re-run the tile layout whenever it is (re)created
(function(){const _ib=ckInstallBtn;ckInstallBtn=function(){const r=_ib.apply(this,arguments);try{ckHomeTiles()}catch(_){}return r}})();
// fit the whole home screen on one page (no scrolling) on any phone
function ckHomeFit(){const card=document.querySelector('#title .tcard.ck-home'),t=document.getElementById('title');if(!card||!t||!t.offsetWidth)return;card.style.zoom='';
 const kids=[...card.children].filter(e=>{if(!e.offsetParent)return false;const r=e.getBoundingClientRect();return r.height>0&&r.width>0});if(!kids.length)return;
 let top=1e9,bot=-1e9;for(const e of kids){const r=e.getBoundingClientRect();top=Math.min(top,r.top);bot=Math.max(bot,r.bottom)}
 const need=bot-top+24,avail=innerHeight;if(need>avail){const z=Math.max(.7,avail/need);card.style.zoom=z.toFixed(3)}
 t.scrollTop=0}
addEventListener('resize',()=>setTimeout(ckHomeFit,80));
setTimeout(()=>{try{ckHomeTiles();ckHomeFit()}catch(_){}},2100);setInterval(()=>{try{ckHomeTiles();ckHomeFit()}catch(_){}},1500);
(function(){const o=updLang;updLang=function(){const r=o.apply(this,arguments);try{ckHomeTiles()}catch(_){}return r}})();
