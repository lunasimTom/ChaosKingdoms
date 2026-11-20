/* ===== Chaos Kingdoms v4.2 · loot =====
   Boss treasure: when the FINAL boss of a level dies, a slow-motion replay of the final blow plays,
   then every tower and barricade vanishes and a big treasure explodes out of the boss to random spots
   all over the map. The player has exactly 8 seconds (real time, paused while a menu is open) to tap
   and collect; from second 7 the loot fades, at second 8 whatever is left is gone for good.
   Medium monsters (brutes and elites) sometimes drop a small common item anywhere on the map; it lasts
   20 s of game time.
   Tapping on or right next to a dropped item always collects it first, before any other tile action.
   Diamonds come only from boss treasure (and the existing voucher codes). 4 fragments forge 1 diamond.
   1 diamond can be exchanged for 10,000 gold; nothing can be exchanged into diamonds. */
const CKT=[ // rarity tiers
 {k:'common',n:['普通','Common'],c:'#c9cfdc',glow:0},
 {k:'uncommon',n:['优秀','Uncommon'],c:'#7de07a',glow:.35},
 {k:'rare',n:['稀有','Rare'],c:'#4aa8ff',glow:.55},
 {k:'epic',n:['史诗','Epic'],c:'#b35cff',glow:.75},
 {k:'legendary',n:['传说','Legendary'],c:'#ffc23a',glow:.95},
 {k:'mythic',n:['神话','Mythic'],c:'#ff5ad0',glow:1.1}];
const CKT_W=[50.2,25,14,7,3,.8];
const CK_WIN=8000;   // boss treasure collection window (ms)   // base chance per treasure piece (%)
// rare items: powerful single-use battle items that are never sold in the shop
const CK_RARE={
 r_chrono:{ic:'⏳',c:'#7ad8ff',n:['时光水晶','Time Crystal'],d:['冻结所有小怪 8 秒，首领减速 6 秒。','Freezes every monster for 8 s and slows bosses for 6 s.']},
 r_dragon:{ic:'🐉',c:'#ff6a2a',n:['龙焰卷轴','Dragonfire Scroll'],d:['对所有小怪造成其最大生命 35% 的伤害，对首领造成 6%。','Burns every monster for 35% of its max health, and bosses for 6%.']},
 r_aegis:{ic:'🏰',c:'#ffd36a',n:['王者庇护','Royal Protection'],d:['所有存活基地恢复满血，并获得 15 秒漏怪护盾。','Restores every standing base to full health and shields them from leaks for 15 s.']},
 r_forge:{ic:'⚒️',c:'#ffb84d',n:['大师锻造','Master Forging'],d:['所有 1–2 级防御塔立即提升一级。','Instantly upgrades every level 1-2 tower by one level.']},
 r_midas:{ic:'👑',c:'#ffe066',n:['点金印记','Midas Mark'],d:['45 秒内击杀金币 ×3。','Triples kill gold for 45 s.']},
 r_war:{ic:'🎺',c:'#ff7a7a',n:['远古号角','Ancient Horn'],d:['25 秒内所有防御塔伤害 +35%、攻速 +60%。','All towers deal +35% damage and fire 60% faster for 25 s.']}};
const CK_BASIC=['fbomb','ibomb','trap','frz','rep'];   // ordinary consumables that may drop
const ckLZ=a=>lvZ(a[0],a[1]);
const CKA_IMG={};for(const k in CKA){const im=new Image();im.src=CKA[k];CKA_IMG[k]=im}
const ckImg=(k,cls)=>CKA[k]?`<img class="ck-aimg ${cls||''}" src="${CKA[k]}" alt="">`:'';
// replace the game's own coin / diamond / star / trophy / medal / attribute / item graphics with the new artwork
function ckAssetsReg(){try{
 for(const k of ['i_river','i_legion','i_air','i_bomb','i_heli'])if(CKA[k]){SPRD[k]=CKA[k];const im=new Image();im.src=CKA[k];SP[k]=im}
 if(CKA.win){SPRD.victory=CKA.win;SPRD.defeat=CKA.lose;try{SP.victory=CKA_IMG.win;SP.defeat=CKA_IMG.lose}catch(_){}}   // v5 banners
 if(CKA.gold){SPRD.u_coin=CKA.gold;SP.u_coin=CKA_IMG.gold;document.querySelectorAll('img[data-s="u_coin"]').forEach(e=>e.src=CKA.gold)}
}catch(e){console.warn('ckAssetsReg',e)}}
setTimeout(ckAssetsReg,0);
// ---- icons: pre-rendered once per kind ----
const CKL_IMG={};
function ckLootIcon(kind,col){const key=kind+'|'+col;if(CKL_IMG[key])return CKL_IMG[key];const S2=96,cv=document.createElement('canvas');cv.width=cv.height=S2;const g=cv.getContext('2d');
 const gr=g.createRadialGradient(S2/2,S2*.42,4,S2/2,S2/2,S2*.46);gr.addColorStop(0,'#ffffffee');gr.addColorStop(.5,col);gr.addColorStop(1,'#000000aa');
 g.fillStyle=gr;g.beginPath();g.arc(S2/2,S2/2,S2*.42,0,7);g.fill();g.lineWidth=5;g.strokeStyle='#1a1206';g.stroke();g.lineWidth=2.5;g.strokeStyle='#fff8';g.beginPath();g.arc(S2/2,S2/2,S2*.36,0,7);g.stroke();
 const it=CKL_ICON[kind];if(it&&it.img){const im=SP[it.img]||null;if(im&&im.width){const s=S2*.62/Math.max(im.width,im.height);g.drawImage(im,S2/2-im.width*s/2,S2/2-im.height*s/2,im.width*s,im.height*s)}}
 else{g.font=`${S2*.46}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(it?it.e:'🎁',S2/2,S2/2+2)}
 return CKL_IMG[key]=cv}
const CKL_ICON={gold:{e:'🪙'},star:{e:'⭐'},frag:{e:'💠'},dia:{e:'💎'},rune:{e:'📜'},item:{e:'🧪'}};
for(const k in CK_RARE)CKL_ICON[k]={e:CK_RARE[k].ic};
// register rare items as inventory items (never listed in the shop), once the game's tables exist
function ckRareReg(){try{if(typeof IT==='undefined'||IT.some(x=>x.id==='r_chrono'))return;
 for(const id in CK_RARE){const R=CK_RARE[id],cv=document.createElement('canvas');cv.width=cv.height=96;const g=cv.getContext('2d');const gr=g.createRadialGradient(48,40,6,48,48,46);gr.addColorStop(0,'#fff');gr.addColorStop(.45,R.c);gr.addColorStop(1,'#2a1406');g.fillStyle=gr;g.beginPath();g.arc(48,48,44,0,7);g.fill();g.lineWidth=5;g.strokeStyle='#ffd36a';g.stroke();g.font='48px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(R.ic,48,51);
  SPRD['i_'+id]=CKA[id]||cv.toDataURL();{const im=new Image();im.src=SPRD['i_'+id];SP['i_'+id]=im}IT.push({id,sp:'i_'+id,cost:0,stock:null,rare:1,get n(){return ckLZ(R.n)},get d(){return ckLZ(R.d)+lvZ('（稀有·商店不出售）',' (Rare · not sold in the shop)')}});CDT[id]=3}}catch(e){console.warn('ckRareReg',e)}}
setTimeout(ckRareReg,0);
function ckUseRare(id){if(L.cdn[id]>0)return;const R=CK_RARE[id];L.inv[id]--;ckIU(id);L.cdn[id]=FXon('nocd')?0:3;const al=L.en.filter(e=>e.hp>0);
 if(id==='r_chrono'){for(const e of al){if(e.t==='boss')e.sl=Math.max(e.sl||0,6);else e.fz=Math.max(e.fz||0,8)}vFlash('#9ff0ff',.35)}
 else if(id==='r_dragon'){for(const e of al){const pro=e.pro;e.pro=0;hurt(e,e.mx*(e.t==='boss'?.06*BOSS_DEF_MULT:.35*DEF_MULT),'#ff8a3a');if(e.hp>0)e.pro=pro;const p=eS(e);burst(p.x,p.y,'#ff7a2a',8,120)}vFlash('#ff7a2a',.35);L.shake=Math.max(L.shake||0,.6)}
 else if(id==='r_aegis'){ckBaseSync();for(const b of L.base)if(!b.dead){b.hp=b.max;const p=pp(b.x,b.y);vRing(p.x,p.y,tw*1.2,'#ffd36a',.6,5)}ckBaseTotal();L.bf.shield=Math.max(L.bf.shield||0,15)}
 else if(id==='r_forge'){let n=0;for(const t of L.tr)if(t&&!t.building&&t.k!=='wall'&&t.lv<3){t.lv++;t.mhp=thp(t);t.hp=t.mhp;n++;const p=pp(t.x,t.y);burst(p.x,p.y,'#ffd36a',10,120)}sfx('upgrade',.6)}
 else if(id==='r_midas'){L.bf.midas=Math.max(L.bf.midas||0,45)}
 else if(id==='r_war'){L.bf.horn=Math.max(L.bf.horn||0,25);L.bf.ovc=Math.max(L.bf.ovc||0,25)}
 try{CKS.pickup(4)}catch(_){}toast(R.ic+' '+ckLZ(R.n)+' · '+ckLZ(R.d));invR()}
// ---- treasure generation ----
function ckRoll(w){let s=0;for(const x of w)s+=x;let r=Math.random()*s;for(let i=0;i<w.length;i++){if((r-=w[i])<0)return i}return 0}
function ckPiece(tier,boss,replay){const i=L.i,dm=[.7,.85,1,1.2,1.5][S.dif]||1,gS=Math.round((40+i*4)*dm),pick=a=>a[Math.random()*a.length|0],rare=()=>pick(Object.keys(CK_RARE));
 // medium monsters: common tier only, gold goes to battle coins
 if(!boss){const r=Math.random();if(r<.6)return{kind:'gold',amt:Math.round(gS*.5),bat:1};if(r<.8)return{kind:'star',amt:1};return{kind:'item',id:pick(CK_BASIC),amt:1}}
 if(replay&&tier>2)tier=2;   // replays never drop epic or better
 if(tier===0)return Math.random()<.75?{kind:'gold',amt:gS}:{kind:'star',amt:1};
 if(tier===1){const r=Math.random();return r<.4?{kind:'gold',amt:gS*3}:r<.65?{kind:'star',amt:2}:r<.85?{kind:'frag',amt:1}:{kind:'item',id:pick(CK_BASIC),amt:1}}
 if(tier===2){const r=Math.random();if(!replay&&r<.3)return{kind:rare(),amt:1,rare:1};return r<.55?{kind:'gold',amt:gS*8}:r<.8?{kind:'frag',amt:2}:{kind:'item',id:pick(IT.filter(x=>!x.rare&&x.stock==null).map(x=>x.id)),amt:2}}
 if(tier===3){const r=Math.random();return r<.3?{kind:'dia',amt:1}:r<.6?{kind:'rune',amt:1}:r<.85?{kind:rare(),amt:1,rare:1}:{kind:'star',amt:5}}
 if(tier===4){const r=Math.random();return r<.34?{kind:'dia',amt:2}:r<.67?{kind:'rune',amt:2}:{kind:rare(),amt:2,rare:1}}
 return{kind:'jackpot',amt:1,bundle:[{kind:'dia',amt:4},{kind:'rune',amt:3},{kind:rare(),amt:2},{kind:rare(),amt:1}]}}
function ckTreasure(){const i=L.i,replay=!!(S.prog&&S.prog[i]),dm=[.7,.85,1,1.2,1.5][S.dif]||1,nb=Math.max(1,L.nBoss||1),perf=.9+.2*Math.max(0,Math.min(1,L.lives/Math.max(1,L.mxl)));
 let n=Math.min(80,Math.round((26+i*.3)*dm*perf*(1+.15*(nb-1))));if(replay)n=Math.max(5,Math.round(n*.25));
 // better tiers grow with level, difficulty and how well the base was defended
 const up=(.8+i/250)*([.8,.9,1,1.15,1.3][S.dif]||1)*perf,w=CKT_W.map((x,t)=>t>=2?x*up:x);
 const out=[];for(let k=0;k<n;k++){let t=ckRoll(w);if(replay&&t>2)t=2;out.push(Object.assign({tier:t},ckPiece(t,true,replay)))}
 const ct=typeof ckChDrop==='function'?ckChDrop(i,replay):-1;if(ct>=0)out.push({tier:ct,kind:'chest',ct,amt:1});
 // v4.4: a separate chance of whole diamonds (10% at level 1 rising to 60% at level 100; replays a quarter)
 if(Math.random()<(.1+.5*Math.min(1,i/99))*(replay?.25:1)){const R_=Math.random();out.push({tier:3,kind:'dia',amt:R_<.15?3:R_<.5?2:1})}return{list:out,replay}}
// ---- state ----
function ckLootReset(){L.loot=[];L.lw=null}
function ckLootBusy(){return !!(L&&(L.rpPend||(L.lw&&!L.lw.done)))}
function ckTileAny(){return[Math.random()*L.cols|0,Math.random()*L.rows|0]}
// a completely random point anywhere on the battlefield (not tied to the tile grid)
function ckSpotAny(taken){let x=0,y=0;for(let k=0;k<14;k++){x=-.42+Math.random()*(L.cols-.16);y=-.42+Math.random()*(L.rows-.16);if(!taken||taken.every(p=>Math.hypot(p[0]-x,p[1]-y)>.38))break}if(taken)taken.push([x,y]);return[x,y]}
// final-boss check: no other boss alive or still queued, last wave reached
function ckIsFinalBoss(e){return !L.demo&&L.boss&&L.wave>=L.waves&&!L.q.some(t=>String(t).split('|')[0]==='boss')&&!L.en.some(o=>o!==e&&o.t==='boss'&&o.hp>0)}
function ckLootOnDeath(e){if(L.demo||L.over)return;L.loot=L.loot||[];
 if(e.t==='boss'){if(ckIsFinalBoss(e))ckFinalBlow(e);return}
 if(e.t==='brute'||e.el){const sh=Math.random()<.06,p0=sh?null:(Math.random()<(e.el?.25:.12));if(!sh&&!p0)return;const p=sh?{kind:'frag',amt:1}:ckPiece(0,false,false),[x,y]=ckSpotAny(),sp=eS(e);L.loot.push(Object.assign({x,y,tier:0,born:TM,life:20,fx:sp.x,fy:sp.y,ft0:performance.now(),fdur:420,boss:0},p))}}
function ckLootBurst(e){
 const sp=eS(e),T=ckTreasure();L.loot=(L.loot||[]).filter(l=>!l.boss);L.rpPend=false;
 L.q=[];L.scs=[];L.sc=null;for(const o of L.en)if(o!==e&&o.hp>0)o.hp=-1;
 // every tower and barricade disappears at once (terrain stays); the refund is computed from this snapshot
 L.trSnap=L.tr.slice();for(const t of L.tr){const p=pp(t.x,t.y);burst(p.x,p.y,'#ffd36a',12,170);vRing(p.x,p.y,tw*.7,'#fff1a8',.45,3);const q=ckCell(t.x,t.y);if(q)q.tw=0}
 L.tr=[];try{showSel(null)}catch(_){}try{replan()}catch(_){}
 L.shake=Math.max(L.shake||0,1.3);vFlash('#ffe08a',.5);vGlow(sp.x,sp.y,tw*4,'#ffd36a',.7);vRing(sp.x,sp.y,tw*5,'#fff1a8',.8,8);burst(sp.x,sp.y,'#ffd36a',60,320);
 // all pieces burst out together to random spots all over the map
 const taken=[],now=performance.now(),FLY=520;let best=-1;
 for(const p of T.list){const[x,y]=ckSpotAny(taken);
  const tp=pp(x,y);L.loot.push(Object.assign({x,y,born:TM,life:null,fx:sp.x,fy:sp.y,ft0:now,fdur:FLY*(.75+Math.random()*.5),boss:1,ang:Math.random()*6.28},p));best=Math.max(best,p.tier)}
 L.lw={t0:now+FLY,el:0,last:now,total:T.list.length,got:0,done:false,replay:T.replay};
 try{CKS.lootBurst(best)}catch(_){}
 if(best>=4){const t=CKT[best];window.ckBanner&&ckBanner(ckLZ(t.n)+lvZ(' 宝藏！',' TREASURE!'),best>=5?lvZ('神话掉落','MYTHIC DROP'):lvZ('传说掉落','LEGENDARY DROP'),1)}
 ckLootUi(true);requestAnimationFrame(ckLootLoop)}
// real-time 8 s window (paused while a menu, the shop or pause is open)
function ckLootLoop(now){const w=L&&L.lw;if(!w||w.done)return;const dt=Math.max(0,Math.min(100,now-w.last));w.last=now;
 const frozen=mOpen||L.paused||tab==='s'||document.hidden;if(!frozen&&now>=w.t0)w.el+=dt;
 if(w.el>=CK_WIN){w.done=true;const left=L.loot.filter(l=>l.boss).length;L.loot=L.loot.filter(l=>!l.boss);ckLootUi(false);
  toast(lvZ(`宝藏收集 ${w.got} / ${w.total}`,`Treasure collected: ${w.got} / ${w.total}`)+(left?lvZ(`（${left} 件已消失）`,` (${left} vanished)`):''));try{save()}catch(_){}return}
 ckLootUi(true);requestAnimationFrame(ckLootLoop)}
function ckLootAlpha(l){if(l.boss){const w=L.lw;if(!w)return 0;const el=w.el;return el<CK_WIN-1000?1:Math.max(0,1-(el-(CK_WIN-1000))/1000)}const age=l.age||0;if(age>l.life)return 0;return age>l.life-5?(.35+.65*Math.abs(Math.sin(TM*6))):1}
// ---- pickup ----
function ckLootTap(q,P){if(!L||L.demo||!L.loot||!L.loot.length||!q)return false;
 // everything within about half a tile of the finger (items are no longer on a grid)
 const R=tw*.62,here=L.loot.filter(l=>{if(ckLootAlpha(l)<=0)return false;const s2=pp(l.x,l.y);return P?Math.hypot(s2.x-P[0],s2.y-P[1])<=R:(Math.round(l.x)===q.x&&Math.round(l.y)===q.y)});if(!here.length)return false;
 L.loot=L.loot.filter(l=>!here.includes(l));let top=0;for(const l of here){ckGrant(l);top=Math.max(top,l.tier);if(l.boss&&L.lw)L.lw.got++}
 try{CKS.pickup(top)}catch(_){}ckVibe(top>=4?[25,40,45]:12+top*6);const p=P?{x:P[0],y:P[1]}:pp(q.x,q.y);burst(p.x,p.y,CKT[top].c,8+top*4,140);if(top>=3)vRing(p.x,p.y,tw*.9,CKT[top].c,.5,4);
 if(L.lw&&!L.lw.done)ckLootUi(true);try{save()}catch(_){}return true}
function ckGrant(l){const p=pp(l.x,l.y);ckDropLog(l);
 if(l.kind==='jackpot'){for(const b of l.bundle)ckGrant(Object.assign({x:l.x,y:l.y,tier:5,boss:1},b));return}
 let label='',col=CKT[l.tier].c,to='dia';
 if(l.kind==='gold'){if(l.bat){Economy.grantBattle(l.amt);to='coin'}else{Economy.grantWallet(l.amt);if(L.g0!=null)L.g0+=l.amt;to='coin'}label='+'+l.amt.toLocaleString()+' 🪙'}
 else if(l.kind==='star'){S.bonusStars=(S.bonusStars||0)+l.amt;label='+'+l.amt+' ⭐';to='star'}
 else if(l.kind==='frag'){S.frag=(S.frag|0)+l.amt;label='+'+l.amt+' 💠';ckForge()}
 else if(l.kind==='dia'){S.diamonds=(S.diamonds||0)+l.amt;label='+'+l.amt+' 💎'}
 else if(l.kind==='rune'){S.rune=(S.rune|0)+l.amt;label='+'+l.amt+' 📜 '+lvZ('强化符','Rune');to='star'}
 else if(l.kind==='item'){L.inv[l.id]=(L.inv[l.id]||0)+l.amt;const it=IT.find(x=>x.id===l.id);label='+'+l.amt+' '+(it?it.n:l.id);to='inv'}
 else if(l.kind==='chest'){ckChInit();S.chests[l.ct]=(S.chests[l.ct]|0)+1;label='🎁 '+ckChName(l.ct);to='inv';toast('🎁 '+ckChName(l.ct)+lvZ('！在 商店 › 宝箱 中打开','! Open it in Shop › Chests'));ckVibe([30,40,60])}
 else if(CK_RARE[l.kind]){L.inv[l.kind]=(L.inv[l.kind]||0)+l.amt;const R=CK_RARE[l.kind];label=R.ic+' '+ckLZ(R.n)+(l.amt>1?' ×'+l.amt:'');to='inv';ckRareCard(R,l.tier)}
 txt(p.x,p.y-tw*.5,label,col);ckFly(l,p,to);try{invR()}catch(_){}}
function ckVibe(ms){if(typeof S!=='undefined'&&S.hap===false)return;try{if(window.CKAndroid&&CKAndroid.vibrate){CKAndroid.vibrate(Array.isArray(ms)?ms.reduce((a,b)=>a+b,0):ms);return}if(navigator.vibrate)navigator.vibrate(ms)}catch(_){}}
// per-level record of what was collected (boss treasure vs monster drops), shown on the result screen
function ckDropLog(l){if(l.kind==='jackpot')return;const D=L.drops=L.drops||{boss:{},mon:{}},g=l.boss?D.boss:D.mon,k=l.kind==='item'?'item:'+l.id:l.kind==='chest'?'chest:'+l.ct:l.kind;g[k]=(g[k]||0)+(l.amt||1)}
function ckDropName(k){if(k.startsWith('chest:'))return ckChName(+k.slice(6));if(k.startsWith('item:')){const it=IT.find(x=>x.id===k.slice(5));return it?it.n:k.slice(5)}if(CK_RARE[k])return ckLZ(CK_RARE[k].n);return lvZ(...({gold:['金币','Gold'],star:['星星','Stars'],frag:['钻石碎片','Diamond Shards'],dia:['钻石','Diamonds'],rune:['强化符','Enhancement Runes']}[k]||[k,k]))}
function ckDropIcon(k){if(k.startsWith('chest:'))return ckChImg(+k.slice(6));if(k.startsWith('item:')){const it=IT.find(x=>x.id===k.slice(5));return it&&SPRD[it.sp]?`<img class="ck-aimg" src="${SPRD[it.sp]}" alt="">`:''}return ckImg(k==='gold'?'gold':k)}
function ckDropsHtml(){const D=L&&L.drops;const row=(g)=>Object.keys(g).sort((a,b)=>(b==='dia')-(a==='dia')||(b==='rune')-(a==='rune')).map(k=>`<li>${ckDropIcon(k)}<span>${ckDropName(k)}</span><b>×${g[k].toLocaleString()}</b></li>`).join('');
 const bo=D?row(D.boss):'',mo=D?row(D.mon):'';
 return `<div class="ck-drops"><h4>${lvZ('本关拾取','Loot collected')}</h4>${bo?`<small>${lvZ('首领宝藏','Boss treasure')}</small><ul>${bo}</ul>`:''}${mo?`<small>${lvZ('怪物掉落','Monster drops')}</small><ul>${mo}</ul>`:''}${!bo&&!mo?`<p>${lvZ('本关没有拾取任何掉落物。','No drops were collected this level.')}</p>`:''}</div>`}
function ckForge(){}   // v4.4: shards are combined by hand in the forge (Inventory › Materials)
// item flies from the tile to its counter in the top bar (or the item bar)
function ckFly(l,p,to){try{const cv=document.getElementById('cv'),r=cv.getBoundingClientRect(),k=r.width/W,sx=r.left+p.x*k,sy=r.top+p.y*k;
 const tgt=to==='coin'?document.getElementById('coin'):to==='inv'?document.getElementById('inv'):document.getElementById('dia');const tr=tgt?tgt.getBoundingClientRect():{left:innerWidth/2,top:10,width:0,height:0};
 const el=document.createElement('div');el.className='ck-fly';el.innerHTML=l.kind==='item'?ckDropIcon('item:'+l.id):ckDropIcon(l.kind);el.style.left=sx+'px';el.style.top=sy+'px';el.style.setProperty('--c',CKT[l.tier].c);document.body.appendChild(el);
 const dx=tr.left+tr.width/2-sx,dy=tr.top+tr.height/2-sy;el.animate([{transform:'translate(-50%,-50%) scale(1.3)',opacity:1},{transform:`translate(calc(-50% + ${dx*.35}px),calc(-50% + ${dy*.35-40}px)) scale(1.1)`,opacity:1,offset:.35},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.5)`,opacity:.2}],{duration:650,easing:'cubic-bezier(.3,.1,.3,1)'}).onfinish=()=>{el.remove();if(tgt){tgt.classList.remove('ck-bump');void tgt.offsetWidth;tgt.classList.add('ck-bump')}}}catch(_){}}
function ckRareCard(R,tier){const el=document.createElement('div');el.className='ck-rcard';el.style.setProperty('--c',CKT[Math.max(2,tier)].c);el.innerHTML=`<i>${ckImg(Object.keys(CK_RARE).find(k=>CK_RARE[k]===R))}</i><div><small>${lvZ('稀有道具','RARE ITEM')} · ${ckLZ(CKT[Math.max(2,tier)].n)}</small><b>${ckLZ(R.n)}</b><span>${ckLZ(R.d)}</span></div>`;document.body.appendChild(el);setTimeout(()=>el.classList.add('out'),1500);setTimeout(()=>el.remove(),2000)}
// ---- countdown UI ----
let CKLU=null;
function ckLootUi(on){if(!CKLU){CKLU=document.createElement('div');CKLU.id='ck-loot';CKLU.innerHTML='<div class="r"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/></svg><b>8</b></div><div class="t"></div><div class="c"></div>';(document.getElementById('ck-bossbar')||document.body).parentNode.appendChild(CKLU)}
 const w=L&&L.lw;if(!on||!w||w.done){CKLU.hidden=true;return}CKLU.hidden=false;const left=Math.max(0,CK_WIN-w.el),sec=Math.ceil(left/1000);
 CKLU.querySelector('b').textContent=w.el<=0?String(CK_WIN/1000):sec;CKLU.querySelector('circle').style.strokeDashoffset=(276.5*(1-left/CK_WIN)).toFixed(1);CKLU.classList.toggle('late',w.el>=CK_WIN-3000);
 CKLU.querySelector('.t').textContent=w.replay?lvZ('快点收集宝藏！（重玩奖励 25%）','Grab the treasure! (replay: 25%)'):lvZ('快点收集宝藏！','Grab the treasure!');
 CKLU.querySelector('.c').textContent=lvZ(`已收集 ${w.got} / ${w.total}`,`Collected ${w.got} / ${w.total}`)}
// ---- drawing (top layer, above towers and monsters) ----
// every drop: large artwork with a bright pulsing golden glow and twinkling sparkles; the rarity colour
// shows as an inner halo, Legendary+ adds a light beam, Mythic adds coloured particles
function ckSparkle(x,y,r,a){c.save();c.translate(x,y);c.rotate(Math.PI/4);c.globalAlpha=a;c.fillStyle='#fff8d0';c.beginPath();c.moveTo(0,-r);c.lineTo(r*.22,-r*.22);c.lineTo(r,0);c.lineTo(r*.22,r*.22);c.lineTo(0,r);c.lineTo(-r*.22,r*.22);c.lineTo(-r,0);c.lineTo(-r*.22,-r*.22);c.closePath();c.fill();c.restore()}
function ckLootDraw(){if(!L||!L.loot||!L.loot.length)return;const now=performance.now();let drop=[];const lo=window.CK_Q===0;
 for(const l of L.loot){const a=ckLootAlpha(l);if(a<=0){if(!l.boss)drop.push(l);continue}
  const tp=pp(l.x,l.y),ft=Math.min(1,(now-l.ft0)/l.fdur),e=1-Math.pow(1-ft,3);let x=l.fx+(tp.x-l.fx)*e,y=l.fy+(tp.y-l.fy)*e-Math.sin(ft*Math.PI)*tw*1.7;
  const ph=(l.x*1.7+l.y*2.3)%6.28,bob=ft>=1?Math.sin(TM*3+ph)*tw*.06:0,T=CKT[l.tier],sz=tw*(.74+.05*l.tier)*(l.kind==='chest'?1.35:1)*(ft<1?.65+.35*e:1);y-=bob;
  c.save();c.globalAlpha=a;
  if(ft>=1){c.fillStyle='#0007';c.beginPath();c.ellipse(tp.x,tp.y+sz*.42,sz*.4,sz*.12,0,0,7);c.fill()}
  // golden glow (all drops), rarity halo inside it
  c.globalCompositeOperation='lighter';{const pr=.5+.5*Math.sin(TM*5+ph),r=sz*(.95+.18*pr),g=c.createRadialGradient(x,y,sz*.1,x,y,r);g.addColorStop(0,'#fff3b0');g.addColorStop(.35,'#ffd23acc');g.addColorStop(1,'#ffb00000');c.globalAlpha=a*(.55+.3*pr);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
  if(l.tier>=1){const r=sz*.62,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,T.c+'aa');g.addColorStop(1,T.c+'00');c.globalAlpha=a*T.glow;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
  if(l.tier>=4&&ft>=1&&!lo){const bw=sz*.55,g=c.createLinearGradient(0,y-tw*3.2,0,y);g.addColorStop(0,T.c+'00');g.addColorStop(1,T.c+'99');c.globalAlpha=a;c.fillStyle=g;c.fillRect(x-bw/2,y-tw*3.2,bw,tw*3.2)}
  c.globalCompositeOperation='source-over';c.globalAlpha=a;
  const ak=l.kind==='jackpot'?'dia':l.kind==='item'?null:l.kind==='chest'?'ch_'+CK_CH[l.ct].k:l.kind;let im=ak?CKA_IMG[ak]:null;if(!im&&l.kind==='item'){const it=IT.find(q=>q.id===l.id);im=it&&SP[it.sp]}
  if(im&&im.width){const s2=sz/Math.max(im.width,im.height);c.drawImage(im,x-im.width*s2/2,y-im.height*s2/2,im.width*s2,im.height*s2)}else c.drawImage(ckLootIcon(l.kind,T.c),x-sz/2,y-sz/2,sz,sz);
  // twinkling sparkles around every drop
  if(!lo){for(let k=0;k<3;k++){const t=TM*1.6+ph+k*2.09,tw2=Math.max(0,Math.sin(t*2.3+k));if(tw2>.05)ckSparkle(x+Math.cos(t)*sz*.52,y+Math.sin(t*1.3)*sz*.46,sz*(.09+.07*tw2),a*tw2)}}
  if(l.tier>=5&&ft>=1&&Math.random()<.3)burst(x+(Math.random()-.5)*sz,y+(Math.random()-.5)*sz,['#ff5ad0','#7ad8ff','#ffe066'][Math.random()*3|0],1,60);
  if(l.kind==='jackpot'){c.font=`900 ${sz*.34|0}px Nunito,sans-serif`;c.textAlign='center';c.fillStyle='#fff';c.strokeStyle='#000';c.lineWidth=3;c.strokeText('★',x+sz*.36,y-sz*.32);c.fillText('★',x+sz*.36,y-sz*.32)}
  c.restore()}
 if(drop.length)L.loot=L.loot.filter(l=>!drop.includes(l))}
// ---- final-blow replay ----
// During the last wave of a boss level a rolling recording of the battlefield is kept at the game's own
// render resolution (HD: the replay is exactly as sharp as live play): 2.4 s at 10 frames/s, the frame
// canvases are reused so nothing is allocated while recording. If a device cannot hold full-size frames
// the recorder drops to half size automatically. When the final boss falls the last moments replay in
// slow motion with a gentle zoom on the boss; then the treasure bursts out.
const CKR_FPS=10,CKR_SEC=2.4,CKR_MAX=1600,CKREC={frames:[],last:0,post:0,run:false,sc:1};
function ckRecTick(now){requestAnimationFrame(ckRecTick);
 if(typeof L==='undefined'||!L||L.demo||!L.boss||L.over||S.mode!=='play'){if(CKREC.frames.length&&!L?.rpPend)CKREC.frames.length=0;return}
 const live=L.wave>=L.waves&&(L.en.some(e=>e.t==='boss'&&e.hp>0)||now<CKREC.post);if(!live){if(CKREC.frames.length&&!L.rpPend)CKREC.frames.length=0;return}
 if(L.paused||mOpen||document.hidden||now-CKREC.last<1000/CKR_FPS)return;CKREC.last=now;
 const cv=document.getElementById('cv');if(!cv||!cv.width)return;
 const sc=Math.min(1,CKR_MAX/Math.max(cv.width,cv.height))*CKREC.sc,w=Math.round(cv.width*sc),h=Math.round(cv.height*sc);
 const f=CKREC.frames.length>=Math.round(CKR_FPS*CKR_SEC)?CKREC.frames.shift():document.createElement('canvas');if(f.width!==w||f.height!==h){f.width=w;f.height=h}
 try{const g=f.getContext('2d');if(!g)throw 0;g.drawImage(cv,0,0,w,h);CKREC.frames.push(f)}catch(_){if(CKREC.sc>.5){CKREC.sc=.5;CKREC.frames.length=0}}}
setTimeout(()=>requestAnimationFrame(ckRecTick),0);
function ckFinalBlow(e){L.rpPend=true;L.q=[];L.scs=[];L.sc=null;for(const o of L.en)if(o!==e&&o.hp>0)o.hp=-1;
 CKREC.post=performance.now()+450;ckVibe([40,60,90]);setTimeout(()=>{try{ckReplay(e)}catch(err){console.warn('replay',err);ckLootBurst(e)}},480)}
function ckReplay(e){const fr=CKREC.frames.slice(-24);if(fr.length<6||L.over){ckLootBurst(e);return}
 const cv=document.getElementById('cv'),r=cv.getBoundingClientRect(),wasP=L.paused;L.paused=1;
 const ov=document.createElement('div');ov.id='ck-replay';ov.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
 ov.innerHTML=`<canvas></canvas><div class="lb t"></div><div class="lb b"></div><div class="tag"><i></i>${lvZ('回放 · 致命一击','REPLAY · FINAL BLOW')}</div><button type="button" class="skip">${lvZ('跳过 ›','Skip ›')}</button><div class="bar"><b></b></div>`;document.body.appendChild(ov);
 const k=ov.querySelector('canvas'),g=k.getContext('2d');k.width=Math.max(fr[0].width,cv.width);k.height=Math.round(k.width*fr[0].height/fr[0].width);
 const sp=eS(e),fx=sp.x/W*k.width,fy=sp.y/H*k.height,N=fr.length,DUR=N*180;let t0=performance.now(),done=false;
 const end=()=>{if(done)return;done=true;ov.classList.add('out');setTimeout(()=>ov.remove(),320);L.paused=wasP;CKREC.frames.length=0;ckLootBurst(e)};
 ov.querySelector('.skip').onclick=ev=>{ev.stopPropagation();end()};try{CKS.bossRage&&CKS.lootBurst&&CKS.pickup(2)}catch(_){}
 const step=now=>{if(done)return;try{const p=Math.max(0,Math.min(1,(now-t0)/DUR)),i=Math.max(0,Math.min(N-1,Math.floor(p*N))),z=1+.24*p*p,cx=fx,cy=fy;
  g.setTransform(1,0,0,1,0,0);g.fillStyle='#000';g.fillRect(0,0,k.width,k.height);g.setTransform(z,0,0,z,cx-cx*z,cy-cy*z);g.imageSmoothingQuality='high';g.drawImage(fr[i],0,0,k.width,k.height);
  g.setTransform(1,0,0,1,0,0);const v=g.createRadialGradient(k.width/2,k.height/2,k.width*.3,k.width/2,k.height/2,k.width*.85);v.addColorStop(0,'#0000');v.addColorStop(1,'#000a');g.fillStyle=v;g.fillRect(0,0,k.width,k.height);
  if(p>.9){g.fillStyle=`rgba(255,240,200,${(p-.9)*6})`;g.fillRect(0,0,k.width,k.height)}
  ov.querySelector('.bar b').style.width=(p*100)+'%';if(p>=1){end();return}}catch(err){console.warn('replay frame',err);end();return}requestAnimationFrame(step)};requestAnimationFrame(step);
 // fail-safe: never let the replay hold the game for more than its length + 2 s
 setTimeout(end,DUR+2000)}
// ---- shop: boss treasure (shown, never for sale) ----
function ckShopRareHtml(){const zh=LANG==='zh',rows=[['dia',ckLZ(['钻石','Diamond']),zh?'首领宝藏掉落，也可通过兑换码获得；可在加成强化界面兑换为 10,000 金币。':'Dropped by bosses, or get them with a redeem code. Exchange 1 for 10,000 gold in Bonus Upgrade.'],['frag',ckLZ(['钻石碎片','Diamond Shards']),zh?'在 背包 › 材料 中用 4 个碎片锻造 1 颗钻石。':'Forge 4 into 1 diamond in Inventory › Materials.'],['rune',ckLZ(['强化符','Enhancement Rune']),zh?'免费强化一项属性一次。':'Upgrades one attribute once, for free.']]
  .concat(Object.keys(CK_RARE).map(k=>[k,ckLZ(CK_RARE[k].n),ckLZ(CK_RARE[k].d)]));
 const own=k=>k==='dia'?(S.diamonds||0):k==='frag'?(S.frag|0):k==='rune'?(S.rune|0):(L&&L.inv&&L.inv[k]|0);
 // same row layout and buttons as the regular shop items; diamonds open the redeem-code page,
 // everything else is shown with a grey (disabled) copy of the Buy button
 const btn=k=>k==='dia'?`<button class="bt pay ck-dbuy" data-shop-page="treasure">${ckImg('dia','ic')}<span class="buytxt">${zh?'兑换码':'Redeem'}</span></button>`:`<button class="bt pay ck-off" disabled><span class="buytxt">${zh?'仅首领掉落':'Boss drop only'}</span></button>`;
 return `<div class="ck-shop-rare"><h4 class="ck-srh">${ckImg('cup')}<span>${zh?'首领宝藏':'Boss Treasure'}</span></h4>${rows.map(([k,n,d])=>`<div class="si ck-rare"><div class="sw"><img src="${CKA[k]}" alt=""></div><div class="sd"><b class="f">${n}</b><p>${d}</p></div><div class="sb">${btn(k)}<small>${TL('Owned {0}',own(k).toLocaleString())}</small></div></div>`).join('')}</div>`}
// ---- 5-star victory rating ----
// score out of 100: lives kept 60 · clean waves (no leak) 25 · towers kept 15
// 5★ ≥ 95 (flawless) · 4★ ≥ 80 · 3★ ≥ 62 · 2★ ≥ 42 · 1★ any win
function ckRate(){const lr=Math.max(0,Math.min(1,L.lives/Math.max(1,L.mxl))),wv=Math.max(1,L.waves||1),cw=Math.max(0,Math.min(wv,(L.perf|0)+(L.lk?0:1))),bt=Math.max(1,L.built|0),tl=L.tlost|0,tk=Math.max(0,1-tl/Math.max(3,bt));
 const sc=Math.round(lr*60+cw/wv*25+tk*15),st=sc>=95?5:sc>=80?4:sc>=62?3:sc>=42?2:1;L.rate={sc,st,lv:L.lives,mx:L.mxl,cw,wv,tl};return st}
function ckStarImg(on){return `<img class="ck-star${on?' on':''}" src="${CKA.star}" alt="${on?'★':'☆'}">`}
function ckStarsRow(st){return [0,1,2,3,4].map(i=>`<b class="${i<st?'on':''}" style="animation-delay:${i*.26}s">${ckStarImg(i<st)}</b>`).join('')}
function ckRateHtml(){const r=L.rate;if(!r)return '';const zh=LANG==='zh';
 return `<div class="ck-rate"><span>${zh?'生命':'Lives'} <b>${r.lv}/${r.mx}</b></span><span>${zh?'完美波':'Clean waves'} <b>${r.cw}/${r.wv}</b></span><span>${zh?'损失塔':'Towers lost'} <b>${r.tl}</b></span><span>${zh?'评分':'Score'} <b>${r.sc}</b></span></div>`}
function ckStarMini(st){return `<span class="ck-smini">${'★'.repeat(st)}<u>${'★'.repeat(Math.max(0,5-st))}</u></span>`}
// saves made before v4.2 used 1-3 stars: 1 stays 1, 2 becomes 3, 3 (best) becomes 5
function ckStar5(p,done){if(done||!p||typeof p!=='object')return p||{};const o={};for(const k in p){const v=p[k]|0;o[k]=v>=3?5:v===2?3:v}return o}
// ---- diamond -> gold exchange and runes, inside the attribute upgrade screen ----
function ckExchange(){if((S.diamonds||0)<1){toast(lvZ('钻石不足','Not enough diamonds'));return false}S.diamonds-=1;Economy.grantWallet(10000);try{updWl()}catch(_){}save();toast(lvZ('已兑换：1 💎 → 10,000 🪙','Exchanged: 1 💎 → 10,000 🪙'));try{sfx('coin',.6)}catch(_){}return true}
function ckUseRune(k){if((S.rune|0)<1){toast(lvZ('没有强化符','No Enhancement Runes'));return false}if(cuLv(k)>=Math.min(CU_MAX,cuCap())){toast(cuLv(k)>=CU_MAX?lvZ('该属性已满级','This attribute is already at max level'):lvZ('需要更高的统帅等级','A higher commander level is needed'));return false}
 S.rune-=1;S.cu=S.cu||{a:0,d:0,b:0,c:0};S.cu[k]=cuLv(k)+1;save();try{sfx('perfect',.5)}catch(_){}toast(lvZ('强化符生效！','Enhancement Rune applied!'));return true}
function ckCuExtra(k){const zh=LANG==='zh',r=S.rune|0,max=cuLv(k)>=Math.min(CU_MAX,cuCap());
 return `<div class="ck-cux"><div class="ck-rune"><span><em>${ckImg('rune')}</em>${zh?'强化符':'Enhancement Runes'} <b>×${r}</b></span><small>${zh?'每张强化符可免费强化所选属性一次。':'Each rune upgrades the selected attribute once, for free.'}</small><button type="button" class="cu-go ${r&&!max?'':'off'}" id="ckrune" ${r&&!max?'':'disabled'}>${max?(zh?'已满级':'MAX'):(zh?'使用强化符':'Use a rune')}</button></div>
 <div class="ck-xch"><span><em>${ckImg('dia')}</em>${zh?'钻石兑换金币':'Diamond exchange'} <b>${(S.diamonds||0).toLocaleString()}</b>${(S.frag|0)?` <small>${ckImg('frag')} ×${S.frag}</small>`:''}</span><small>${zh?'1 钻石 = 10,000 金币（金币无法兑换钻石）':'1 diamond = 10,000 gold (gold cannot be exchanged for diamonds)'}</small><button type="button" class="cu-go ${(S.diamonds||0)>=1?'':'off'}" id="ckxch" ${(S.diamonds||0)>=1?'':'disabled'}>${zh?'兑换 1 💎':'Exchange 1 💎'}</button></div></div>`}
