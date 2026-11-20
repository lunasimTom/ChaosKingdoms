/* ===== Chaos Kingdoms v4.4 · 50 commander levels, inventory, diamond forge, level rewards =====
   Save compatibility: the commander level is always derived from the saved XP (never stored), so no
   level can be lost. New save fields (lr = highest level already rewarded, v44 = carry-over notice
   shown) are optional: saves and transfer codes from any older version load unchanged, and older
   versions ignore the new fields. Before anything is converted the raw save is copied once to
   localStorage 'ck25_bak_v44'. */
const CK_VER='5.5.3',CK_BUILD=52;
function ckVerTxt(){return lvZ('版本','Version')+' '+CK_VER+' ('+lvZ('构建 ','build ')+CK_BUILD+')'}
// ---- level-up rewards: gold + stars every level, a chest at milestones ----
const CK_LV_CHEST={15:0,20:1,25:2,30:3,40:4,50:5};
function ckLvGift(L_){return{gold:1000+250*L_,star:3+Math.floor(L_/5),chest:CK_LV_CHEST[L_]}}
function ckLvCheck(quiet){const lv=plLevel();if(S.lvr==null)S.lvr=Math.min(10,lv);const got=[];
 while(S.lvr<lv){S.lvr++;const g=ckLvGift(S.lvr);Economy.grantWallet(g.gold);if(typeof L!=='undefined'&&L&&L.g0!=null&&S.mode==='play')L.g0+=g.gold;S.bonusStars=(S.bonusStars||0)+g.star;if(g.chest!=null){ckChInit();S.chests[g.chest]++}got.push(Object.assign({lv:S.lvr},g))}
 if(got.length){try{save();updWl()}catch(_){}if(!quiet){const t=got.reduce((a,g)=>({gold:a.gold+g.gold,star:a.star+g.star}),{gold:0,star:0}),ch=got.filter(g=>g.chest!=null);
   toast(lvZ('升级奖励：','Level reward: ')+'+'+t.gold.toLocaleString()+' 🪙 +'+t.star+' ⭐'+(ch.length?' + '+ch.map(g=>'🎁 '+ckChName(g.chest)).join(' '):''))}}
 return got}
function ckLvGotHtml(got){if(!got.length)return '';const zh=LANG==='zh';return `<div class="ck-lvgot">${got.map(g=>`<div><b>Lv.${g.lv}</b><span>+${g.gold.toLocaleString()} 🪙</span><span>+${g.star} ⭐</span>${g.chest!=null?`<span class="c">${ckChImg(g.chest,'ck-lvch')} ${ckChName(g.chest)}</span>`:''}</div>`).join('')}</div>`}
// one-time notice for players whose saved XP now counts for more than Level 10
function ckLvMigrate(){let seen=false;try{seen=localStorage.getItem('ck25_v44n')==='1'}catch(_){}if(seen&&S.lvr!=null)S.v44=true;if(S.v44){ckLvCheck();return}const lv=plLevel(),had=S.lvr==null;S.v44=true;try{localStorage.setItem('ck25_v44n','1')}catch(_){}
 if(had&&lv>10){const got=ckLvCheck(true);const zh=LANG==='zh';
  modal(`<div class="ck-mig"><div class="ck-migb">${window.ckBadge?ckBadge(lv,'g'):''}</div><h2 class="f">${zh?'统帅等级扩展至 50 级！':'Commander levels now go to 50!'}</h2><p>${zh?`你已有的 <b>${(S.xp||0).toLocaleString()} XP</b> 全部保留并继续计入新的等级：`:`All your <b>${(S.xp||0).toLocaleString()} XP</b> carried over and now counts toward the new levels:`}</p><div class="ck-migl"><span>Lv.10</span><i>→</i><b>Lv.${lv}</b></div><p>${zh?'获得以下升级奖励：':'Level rewards received:'}</p>${ckLvGotHtml(got)}<p class="ck-migs">${zh?'已通关的关卡、星星、金币、钻石和道具均保持不变（另加上述奖励）。':'Your cleared stages, stars, gold, diamonds and items are unchanged (plus the rewards above).'}</p></div><button class="bt pay" id="m1">${zh?'太好了！':'Great!'}</button>`,closeM);
  try{refreshProfileTeaser()}catch(_){}}else ckLvCheck(true);
 try{save()}catch(_){}}
(function waitMig(){const go=()=>{if(document.getElementById('ck-splash')||typeof S==='undefined'){setTimeout(go,400);return}try{ckLvMigrate()}catch(e){console.warn('v44 migrate',e)}};setTimeout(go,900)})();
// ---- inventory ----
const CK_SELL=.8;
function ckSellGold(id){if(CK_RARE[id])return 32000;if(id==='rune')return 40000;const it=IT.find(x=>x.id===id);return it?Math.round(it.cost*CK_SELL):0}
function ckSellDia(t){return Math.floor(CK_CH[t].p*CK_SELL)}
let CKINV={tab:'items',from:null,focus:null,arm:null};
function ckInvRows(){const zh=LANG==='zh',inv=S.inv||{},T=CKINV.tab,inB=S.mode==='play'&&typeof L!=='undefined'&&L&&!L.over&&!L.demo;
 const sellBtn=(key,label)=>`<button type="button" class="ck-ivs${CKINV.arm===key?' arm':''}" data-ivsell="${key}">${CKINV.arm===key?(zh?'确认出售？':'Confirm?'):label}</button>`;
 const coin=n=>`${ckImg('gold','ic')}${n.toLocaleString()}`,dia=n=>`${ckImg('dia','ic')}${n}`;
 let rows=[];
 if(T==='items'){for(const it of IT){if(it.rare||!(inv[it.id]>0))continue;rows.push(`<div class="ck-ivr${CKINV.focus===it.id?' focus':''}" data-ivrow="${it.id}"><img class="ck-ivi" src="${SPRD[it.sp]}" alt=""><div class="ck-ivn"><b>${it.n}</b><small>${it.d}</small></div><div class="ck-ivc">×${inv[it.id]}</div><div class="ck-iva">${inB?`<button type="button" class="ck-ivu" data-ivuse="${it.id}">${zh?'使用':'Use'}</button>`:''}${ckAutoBtn(it.id)}${sellBtn('i:'+it.id,coin(ckSellGold(it.id)))}</div></div>`)}}
 if(T==='rare'){for(const k in CK_RARE){if(!(inv[k]>0))continue;const R=CK_RARE[k];rows.push(`<div class="ck-ivr${CKINV.focus===k?' focus':''}"><span class="ck-ivi">${ckImg(k)}</span><div class="ck-ivn"><b>${ckLZ(R.n)}</b><small>${ckLZ(R.d)}</small></div><div class="ck-ivc">×${inv[k]}</div><div class="ck-iva">${inB?`<button type="button" class="ck-ivu" data-ivuse="${k}">${zh?'使用':'Use'}</button>`:''}${sellBtn('i:'+k,coin(ckSellGold(k)))}</div></div>`)}}
 if(T==='chests'){ckChInit();CK_CH.forEach((c,t)=>{if(!(S.chests[t]>0))return;rows.push(`<div class="ck-ivr" style="--cc:${c.c}"><span class="ck-ivi">${ckChImg(t)}</span><div class="ck-ivn"><b>${ckChName(t)}</b><small>${zh?'内含多种奖励':'Holds several kinds of rewards'}</small></div><div class="ck-ivc">×${S.chests[t]}</div><div class="ck-iva"><button type="button" class="ck-ivu" data-copen="${t}">${zh?'打开':'Open'}</button>${sellBtn('c:'+t,dia(ckSellDia(t)))}</div></div>`)})}
 if(T==='mats'){const f=S.frag|0,r=S.rune|0,ok=f>=4&&Economy.canSpendWallet(CK_FORGE.gold);
  rows.push(`<div class="ck-forge"><div class="ck-fgh">${ckImg('frag')}<b>×${f}</b><span>${zh?'钻石碎片':'Diamond Shards'}</span></div><div class="ck-fgr"><span>${ckImg('frag','ic')}×4 + ${coin(CK_FORGE.gold)}</span><i>→</i><span>${ckImg('dia','ic')}×1</span></div><small>${zh?`成功率 ${Math.round((1-CK_FORGE.fail)*100)}%。失败时金币和 4 个碎片都会消耗。`:`${Math.round((1-CK_FORGE.fail)*100)}% success. If it fails, the gold and all 4 shards are used up.`}</small><button type="button" class="bt pay ck-fgo" data-forge="1" ${ok?'':'disabled'}>⚒ ${zh?'锻造钻石':'Forge a diamond'}</button></div>`);
  if(r)rows.push(`<div class="ck-ivr"><span class="ck-ivi">${ckImg('rune')}</span><div class="ck-ivn"><b>${zh?'强化符':'Enhancement Rune'}</b><small>${zh?'在加成强化界面免费强化一项属性一次。':'Upgrades one attribute once, for free, in Bonus Upgrade.'}</small></div><div class="ck-ivc">×${r}</div><div class="ck-iva">${sellBtn('i:rune',coin(ckSellGold('rune')))}</div></div>`)}
 if(!rows.length)rows.push(`<p class="ck-ivempty">${zh?'这里还没有东西。':'Nothing here yet.'}</p>`);
 return rows.join('')}
function ckInvHtml(){const zh=LANG==='zh',inv=S.inv||{};ckChInit();
 const cnt={items:IT.filter(it=>!it.rare&&inv[it.id]>0).reduce((a,it)=>a+inv[it.id],0),rare:Object.keys(CK_RARE).reduce((a,k)=>a+(inv[k]|0),0),chests:S.chests.reduce((a,b)=>a+b,0),mats:(S.frag|0)+(S.rune|0)};
 const tb=(k,l)=>`<button type="button" class="ck-ivt${CKINV.tab===k?' on':''}" data-ivtab="${k}">${l}<small>${cnt[k]}</small></button>`;
 return `<div class="ck-inv"><h2 class="f">🎒 ${zh?'背包':'Inventory'}</h2><div class="ck-ivhead"><span>${ckImg('gold','ic')} ${Economy.display(Economy.walletBalance())}</span><span>${ckImg('dia','ic')} ${(S.diamonds||0).toLocaleString()}</span></div><div class="ck-ivtabs">${tb('items',zh?'道具':'Items')}${tb('rare',zh?'稀有':'Rare')}${tb('chests',zh?'宝箱':'Chests')}${tb('mats',zh?'材料':'Materials')}</div><p class="ck-ivnote">${zh?'出售价格为原价的 80%。':'Items sell for 80% of their original price.'}</p><div class="ck-ivlist" id="ck-ivlist">${ckInvRows()}</div></div><button class="bt g" id="m1">${zh?'关闭':'Close'}</button>`}
function ckInvOpen(from,tab,focus){CKINV.from=from||CKINV.from;if(tab)CKINV.tab=tab;CKINV.focus=focus||null;CKINV.arm=null;
 modal(ckInvHtml(),()=>{const f=CKINV.from;CKINV.from=null;closeM();if(f==='pause'&&typeof pauseM==='function')pauseM()});
 if(focus)setTimeout(()=>{const r=document.querySelector('#ck-ivlist .focus');if(r)r.scrollIntoView({block:'center'})},30)}
function ckInvRefresh(){const m=document.querySelector('#mbox .ck-inv');if(!m)return;const st=(document.getElementById('ck-ivlist')||{}).scrollTop||0;document.getElementById('mbox').innerHTML=ckInvHtml();const b=document.getElementById('m1');if(b)b.onclick=()=>{const f=CKINV.from;CKINV.from=null;closeM();if(f==='pause'&&typeof pauseM==='function')pauseM()};const l=document.getElementById('ck-ivlist');if(l)l.scrollTop=st}
function ckSell(key){const[t,id]=key.split(':');const zh=LANG==='zh';
 if(t==='c'){const ti=+id;ckChInit();if(!(S.chests[ti]>0))return;S.chests[ti]--;const d=ckSellDia(ti);S.diamonds=(S.diamonds||0)+d;toast(lvZ('已出售 ','Sold ')+ckChName(ti)+' · +'+d+' 💎')}
 else{const have=id==='rune'?(S.rune|0):((S.inv||{})[id]|0);if(have<1)return;const g=ckSellGold(id);if(id==='rune')S.rune--;else S.inv[id]--;Economy.grantWallet(g);if(typeof L!=='undefined'&&L&&L.g0!=null&&S.mode==='play')L.g0+=g;const nm=id==='rune'?lvZ('强化符','Enhancement Rune'):CK_RARE[id]?ckLZ(CK_RARE[id].n):(IT.find(x=>x.id===id)||{}).n;toast(lvZ('已出售 ','Sold ')+nm+' · +'+g.toLocaleString()+' 🪙')}
 try{sfx('coin',.6)}catch(_){}try{save();updWl();if(typeof L!=='undefined'&&L&&L.inv)invR()}catch(_){}}
// ---- diamond forge: 4 shards + gold, 15% chance to fail (gold and shards are used up either way) ----
const CK_FORGE={gold:4000,fail:.15};
function ckForgeTry(){if((S.frag|0)<4){toast(lvZ('碎片不足（需要 4 个）','Not enough shards (4 needed)'));return}
 if(!Economy.spendWallet(CK_FORGE.gold)){toast(lvZ('金币不足','Not enough gold'));return}if(typeof L!=='undefined'&&L&&L.g0!=null&&S.mode==='play')L.g0=Math.max(0,L.g0-CK_FORGE.gold);
 S.frag-=4;const ok=Math.random()>=CK_FORGE.fail;if(ok){S.diamonds=(S.diamonds||0)+1;try{ckStat('dia');setTimeout(()=>ckAchCheck(),4500)}catch(_){}}try{save();updWl()}catch(_){}ckForgeFx(ok)}
function ckForgeFx(ok){const zh=LANG==='zh',old=document.getElementById('ck-fgfx');if(old)old.remove();const ov=document.createElement('div');ov.id='ck-fgfx';
 ov.innerHTML=`<div class="anv"><span class="s s1">${ckImg('frag')}</span><span class="s s2">${ckImg('frag')}</span><span class="s s3">${ckImg('frag')}</span><span class="s s4">${ckImg('frag')}</span><span class="ham">⚒</span><span class="gem">${ckImg('dia')}</span><span class="spark"></span></div><div class="msg"></div>`;document.body.appendChild(ov);
 [450,800,1150].forEach((t,i)=>setTimeout(()=>{try{sfx('upgrade',.35)}catch(_){}ckVibe(12)},t));
 setTimeout(()=>{ov.classList.add(ok?'win':'fail');ov.querySelector('.msg').innerHTML=ok?`<b>${zh?'锻造成功！':'Forged!'}</b><span>+1 💎</span>`:`<b>${zh?'锻造失败':'The forge failed'}</b><span>${zh?'金币和碎片已消耗':'Gold and shards were used up'}</span>`;try{ok?CKS.pickup(4):sfx('leak',.5)}catch(_){}ckVibe(ok?[30,40,60]:[80])},1500);
 const close=()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();ckInvRefresh()},250)};setTimeout(()=>ov.addEventListener('click',close),1700);setTimeout(close,4200)}
// ---- clicks: inventory buttons anywhere, inventory openers (HUD item label, pause menu, title) ----
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-ivtab],[data-ivsell],[data-ivuse],[data-forge],[data-ckinv]');if(!t)return;e.stopPropagation();e.preventDefault();
 if(t.dataset.ckinv){ckInvOpen(t.dataset.ckinv);return}
 if(t.dataset.ivtab){CKINV.tab=t.dataset.ivtab;CKINV.arm=null;ckInvRefresh();return}
 if(t.dataset.forge){ckForgeTry();return}
 if(t.dataset.ivuse){const id=t.dataset.ivuse;CKINV.from=null;closeM();try{useItem(id);invR()}catch(_){}return}
 if(t.dataset.ivsell){const k=t.dataset.ivsell;if(CKINV.arm!==k){CKINV.arm=k;ckInvRefresh();clearTimeout(ckSell.t);ckSell.t=setTimeout(()=>{if(CKINV.arm===k){CKINV.arm=null;ckInvRefresh()}},2600);return}CKINV.arm=null;ckSell(k);ckInvRefresh()}},true);
// refresh the open inventory after chest opens / auto toggles (those handlers live in chest.js)
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#mbox .ck-inv [data-copen],#mbox .ck-inv [data-auto]'))setTimeout(ckInvRefresh,0)});
// long-press an item in the item bar: open its inventory entry (and do not use it)
(function(){let tm=null,sx=0,sy=0,fired=false,sup=0;
 document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('#inv button[data-use]');fired=false;clearTimeout(tm);if(!b)return;sx=e.clientX;sy=e.clientY;const id=b.dataset.use;
  tm=setTimeout(()=>{fired=true;sup=performance.now()+700;ckVibe(15);ckInvOpen('hud',CK_RARE[id]?'rare':'items',id)},520)},true);
 // the click that follows the finger lifting must not land on the new window (or use the item)
 document.addEventListener('click',e=>{if(performance.now()<sup){e.stopPropagation();e.preventDefault()}},true);
 document.addEventListener('pointermove',e=>{if(tm&&Math.hypot(e.clientX-sx,e.clientY-sy)>10){clearTimeout(tm);tm=null}},true);
 const stop=e=>{clearTimeout(tm);tm=null;if(fired){fired=false;e.stopPropagation();e.preventDefault()}};
 document.addEventListener('pointerup',stop,true);document.addEventListener('pointercancel',()=>{clearTimeout(tm);tm=null},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('#inv button[data-use]'))e.preventDefault()},true)})();
// title-screen Inventory button
setTimeout(()=>{const row=document.querySelector('#title .opts2');if(row&&!document.getElementById('ckinvbtn')){const b=document.createElement('button');b.className='bt g';b.id='ckinvbtn';b.setAttribute('data-ckinv','title');b.setAttribute('data-i18n','🎒 Inventory');b.textContent='🎒 Inventory';const ch=document.getElementById('ckchbtn');if(ch){ch.style.gridColumn='auto';b.style.gridColumn='auto';row.insertBefore(b,ch.nextSibling)}else{b.style.gridColumn='1/-1';row.appendChild(b)}if(typeof ZH==='object')ZH['🎒 Inventory']='🎒 背包';try{updLang()}catch(_){}}},120);
// ---- save files: what an import contains, shown before it overwrites anything ----
function ckSaveInfo(j){const zh=LANG==='zh',xp=Math.max(0,+j.xp||0),lv=rankAt(xp)+1,cl=Object.values(j.p||{}).filter(v=>+v>0).length;
 return (zh?'存档来自 ':'Save from ')+(j.ver?'v'+j.ver:(zh?'v4.3 或更早版本':'v4.3 or earlier'))+' · Lv.'+lv+' · '+(zh?'已通关 '+cl+' 关':cl+' levels cleared')+(j.n?' · '+String(j.n).slice(0,20):'')}
function ckXPrev(j){let e=document.getElementById('ck-xprev');const g=document.getElementById('xg');if(!g)return;if(!e){e=document.createElement('div');e.id='ck-xprev';g.parentNode.insertBefore(e,g)}e.textContent=ckSaveInfo(j)}
