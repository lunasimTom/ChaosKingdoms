/* ===== Chaos Kingdoms V5 · home shop, layout fixes, settings, tile pop ===== */
const CK_V5='5.0';
// translate an element created after the language pass (data-i18n + ZH dictionary)
function ckTr(el,en,zh){el.setAttribute('data-i18n',en);if(typeof ZH==='object'&&zh)ZH[en]=zh;el.textContent=TL(en)}
// ---- home-screen Shop: Chests first, then Treasures (redeem-code resources) ----
let CKHS='chests';
function ckHomeShopHtml(){const zh=LANG==='zh',t=x=>`<button type="button" class="ck-ub ck-hst${CKHS===x?' on':''}" data-hstab="${x}">${x==='chests'?(zh?'🎁 宝箱':'🎁 Chests'):(zh?'✧ 宝藏':'✧ Treasures')}</button>`;
 const body=CKHS==='chests'?ckChestPage(false,true):`<div class="treasure-scroll ck-hstr">${window.CKTopup&&CKTopup.listHTML?CKTopup.listHTML():''}</div>`;
 return `<div class="ck-hshop"><h2 class="f">🛒 ${zh?'商店':'Shop'}</h2><div class="ck-hstabs">${t('chests')}${t('treasure')}</div><div class="ck-hsbody" id="ck-chm">${body}</div></div><button class="bt g" id="m1">${zh?'关闭':'Close'}</button>`}
function ckHomeShop(tab,back){if(tab)CKHS=tab;modal(ckHomeShopHtml(),back||closeM);ckHsBind()}
function ckHsBind(){document.querySelectorAll('#mbox .ck-hstr [data-ck]').forEach(b=>b.onclick=()=>{if(window.CKTopup&&CKTopup.pick)CKTopup.pick(+b.dataset.ck)})}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-hstab],[data-ckshop]');if(!t)return;e.stopPropagation();e.preventDefault();
 if(t.dataset.ckshop){ckHomeShop(t.dataset.ckshop);return}
 CKHS=t.dataset.hstab;const m=document.getElementById('mbox');if(m&&m.querySelector('.ck-hshop')){m.innerHTML=ckHomeShopHtml();const b=document.getElementById('m1');if(b)b.onclick=closeM;ckHsBind()}},true);
// Commander Record: tap Coins / Diamonds / Stars -> Treasure page
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#mbox .vh .res > div');if(!t)return;const i=[...t.parentNode.children].indexOf(t);if(i>2)return;e.stopPropagation();e.preventDefault();ckHomeShop('treasure',()=>{openProfile(0)})},true);
// ---- title screen: Shop + Inventory side by side, "Redeem Code" ----
function ckTitleButtons(){const row=document.querySelector('#title .opts2');if(!row)return;
 const old=document.getElementById('ckchbtn');if(old)old.remove();
 let sh=document.getElementById('ckshopbtn');if(!sh){sh=document.createElement('button');sh.className='bt g';sh.id='ckshopbtn';sh.setAttribute('data-ckshop','chests');sh.style.gridColumn='auto';const iv=document.getElementById('ckinvbtn'),tp=document.getElementById('topupbtn');row.insertBefore(sh,iv||tp||null)}
 ckTr(sh,'🛒 Shop','🛒 商店');const iv=document.getElementById('ckinvbtn');if(iv){iv.style.gridColumn='auto';ckTr(iv,'🎒 Inventory','🎒 背包')}
 const tp=document.getElementById('topupbtn');if(tp)ckTr(tp,'🎟 Redeem Code','🎟 兑换码')}
setTimeout(ckTitleButtons,200);setTimeout(ckTitleButtons,900);
// ---- battle: Inventory tab next to Shop; tips button moved to the free corner below the map ----
function ckRailV5(){const tabs=document.querySelector('#rail .tabs');if(!tabs)return;
 if(!tabs.querySelector('.ck-invtab')){const b=document.createElement('button');b.type='button';b.className='tab ck-invtab';b.setAttribute('data-ckinv','hud');tabs.appendChild(b)}
 ckTr(tabs.querySelector('.ck-invtab'),'Inventory','背包');
 const tip=document.querySelector('[data-cktips]');const hud=document.getElementById('hud');if(tip&&hud&&tip.parentNode!==hud){hud.appendChild(tip);tip.classList.add('ck-tipfloat')}}
setTimeout(ckRailV5,300);setTimeout(ckRailV5,1200);
// ---- top-left: compact level badge; level + map name below the gold divider ----
function ckMapLabel(){if(typeof L==='undefined'||!L||L.demo)return;const hud=document.getElementById('hud');if(!hud)return;let e=document.getElementById('ckmapn');
 if(!e){e=document.createElement('div');e.id='ckmapn';hud.appendChild(e)}const zh=LANG==='zh';
 e.innerHTML=(L.boss?`<b class="bo">👑 ${zh?'首领':'BOSS'}</b><i>·</i>`:'')+`<span>${TL(R[L.i/8|0].n)}</span>`;e.classList.toggle('boss',!!L.boss)}
function ckPlaceFloat(){const rail=document.getElementById('rail'),top=document.querySelector('#hud .top'),tip=document.querySelector('.ck-tipfloat'),m=document.getElementById('ckmapn');
 const sh=document.getElementById('shop'),open=(sh&&!sh.hidden)||mOpen||(typeof tab!=='undefined'&&tab==='s');
 if(tip&&rail){tip.style.bottom=(rail.offsetHeight+6)+'px';tip.classList.toggle('ck-hide',!!open)}if(m&&top){m.style.top=(top.offsetTop+top.offsetHeight+6)+'px';m.style.display=(sh&&!sh.hidden)?'none':''}}
// ---- V5 monster AI: situational, threat-based targeting ----
// Awareness grows a little from level 1 (85%) to level 20 (100%). Near the base (last 25% of the
// route or within 3 tiles) a monster commits to the base. Otherwise it attacks the most threatening
// tower it can see: the one shooting it, strong towers, towers whose range covers it, damaged towers,
// and barricades in the way; closer is better. Runners raid (tiny awareness), brutes break towers,
// flyers and bosses keep their own behaviour. A chase that drags on or loses sight ends (leash).
const CK_AW={grunt:2.5,runner:1.0,brute:3.5,boss:3.2};
function ckAware(e){const ramp=.85+.15*Math.min(1,(L.i||0)/19);return (CK_AW[e.t]||2)*ramp*(e.el?1.15:1)}
function ckCommit(e){if(!L.df)return false;const C=L.cols,cx=Math.max(0,Math.min(C-1,Math.round(e.x))),cy=Math.max(0,Math.min(L.rows-1,Math.round(e.y))),df=L.df[cy*C+cx];
 if(!isFinite(df))return false;if(e.df0==null||df>e.df0)e.df0=df;return df<=3||df<=e.df0*.25}
function ckTwThreat(e,t,d){let s=1;if(t.k==='wall')s+=.6;else{const st=ts(t);s+=Math.min(3,(st.dm||10)/Math.max(.2,st.rt||1)/40);if(d<=st.rg)s+=1.2}
 if(e._sh===t&&TM-(e._shT||-9)<2.5)s+=3;s+=(1-Math.min(1,t.hp/(t.mhp||t.hp||1)))*.8;s+=(t.lv||1)*.15;return s/(.6+d)}
function ckPickTarget(e){const r=ckAware(e);let b=null,bs=0;for(const t of L.tr){if(!t||t.hp<=0||t.building&&!(t.hp>0))continue;const d=Math.hypot(t.x-e.x,t.y-e.y);if(d>=r||!lineOK(e.x,e.y,t.x,t.y))continue;const s=ckTwThreat(e,t,d);if(s>bs){bs=s;b=t}}return b}
// ---- Settings screen (gear button): sound, music, gameplay, display, haptics, version ----
function ckSettingsHtml(){const zh=LANG==='zh',sec=(t,b)=>`<div class="ck-set-sec"><h4>${t}</h4>${b}</div>`;
 return `<div class="ck-set"><h2 class="f">⚙ ${zh?'设置':'Settings'}</h2>`
  +sec(zh?'声音':'Sound',`${sl()}<button class="bt g musbtn ck-setbtn">${mon?TL('♪ Music: on'):TL('♪ Music: off')}</button>`)
  +sec(zh?'游戏':'Gameplay',`${tg()}<label class="ck-hapl"><input id="ckhap" type="checkbox" ${S.hap===false?'':'checked'}><span>${zh?'震动反馈':'Haptics (vibration)'}</span></label>`)
  +sec(zh?'显示与语言':'Display & language',`<div class="ck-setrow"><button class="bt g rotbtn ck-setbtn">⟳ ${TL('Screen: ')}${TL('Auto')}</button><button class="bt g langbtn ck-setbtn">🌐 ${zh?'中文':'EN'}</button></div>`)
  +`<div class="ck-ver">${ckVerTxt()}</div></div><button class="bt g" id="m1">${zh?'返回':'Back'}</button>`}
function ckSettingsOpen(from){const back=from==='pause'?()=>{closeM();pauseM()}:closeM;modal(ckSettingsHtml(),back);try{updRot();updLang()}catch(_){}}
document.addEventListener('change',e=>{if(e.target&&e.target.id==='ckhap'){S.hap=!!e.target.checked;try{save()}catch(_){}if(S.hap)ckVibe(25)}});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-cksettings]');if(!t)return;e.stopPropagation();e.preventDefault();ckSettingsOpen(t.dataset.cksettings)},true);
// language switch inside Settings: re-render so every label follows
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#mbox .ck-set .langbtn'))setTimeout(()=>{const m=document.getElementById('mbox');if(m&&m.querySelector('.ck-set')){const back=document.getElementById('m1').onclick;m.innerHTML=ckSettingsHtml();document.getElementById('m1').onclick=back;try{updRot();updLang()}catch(_){}}},0)});
// ---- tile pop: the tapped tile lifts a little and springs back (towers on it lift too) ----
let CK_POP=null;
function ckTilePop(q){if(!q)return;CK_POP={x:q.x,y:q.y,t0:performance.now(),tw:!!q.tw}}
function ckPopDraw(){const P=CK_POP;if(!P||typeof L==='undefined'||!L)return;const T=360,u=(performance.now()-P.t0)/T;if(u>=1){CK_POP=null;return}
 const h=Math.sin(Math.PI*1.6*u)*Math.exp(-3*u);if(Math.abs(h)<.004)return;const d=cv.width/W,p=pp(P.x,P.y),up=P.tw?tw*.85:0;
 const sx=(p.x-tw/2)*d,sy=(p.y-tw/2-up)*d,sw=tw*d,sh=(tw+up)*d;if(sx<0||sy<0||sx+sw>cv.width||sy+sh>cv.height)return;
 const sc=1+.06*h,lift=Math.max(0,h)*tw*.09,dw=tw*sc,dh=(tw+up)*sc,dx=p.x-dw/2,dy=p.y+tw/2-dh+(tw*sc-tw)/2-lift;
 c.save();if(h>0){c.globalAlpha=.35*h;c.fillStyle='#000';c.beginPath();c.ellipse(p.x,p.y+tw*.46,tw*.5*sc,tw*.13,0,0,7);c.fill()}
 c.globalAlpha=1;c.drawImage(cv,sx,sy,sw,sh,dx,dy,dw,dh);
 if(h>0){c.globalAlpha=.55*h;c.strokeStyle='#ffe9a8';c.lineWidth=Math.max(1,tw*.03);c.strokeRect(dx+1,dy+dh-dw+1,dw-2,dw-2)}c.restore()}
// pause menu: a later script rebuilds its buttons; add Settings + Inventory as one row under Resume
(function(){const mb=document.getElementById('mbox');if(!mb)return;new MutationObserver(()=>{if(!mb.querySelector('.pause-title')||mb.querySelector('.ck-prow'))return;const zh=LANG==='zh';const inv=mb.querySelector('.ck-invp');if(inv)inv.remove();
 const row=document.createElement('div');row.className='pgrid ck-prow';row.innerHTML=`<button class="bt g" data-cksettings="pause">⚙ ${zh?'设置':'Settings'}</button><button class="bt g" data-ckinv="pause">🎒 ${zh?'背包':'Inventory'}</button>`;
 const r=mb.querySelector('#m1');if(r&&r.parentNode===mb)r.after(row);else mb.appendChild(row)}).observe(mb,{childList:true,subtree:true})})();
// ---- gold line icons replace the emoji at the start of menu buttons (one consistent icon family) ----
const CK_ICO={
 gear:'<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 rot:'<path d="M23 4v6h-6"/><path d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10"/>',
 globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>',
 scroll:'<path d="M8 3h11a2 2 0 0 1 2 2v2h-4"/><path d="M17 7v12a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3v-1h11v2a2 2 0 0 0 2 2"/><path d="M8 3a2 2 0 0 0-2 2v12"/><path d="M10 8h4M10 12h4"/>',
 save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
 cart:'<circle cx="9" cy="21" r="1.4"/><circle cx="19" cy="21" r="1.4"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
 bag:'<path d="M6 8h12l1 12a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M8 13h8"/>',
 ticket:'<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><path d="M14 5v14" stroke-dasharray="2 2"/>',
 play:'<path d="M6 4l14 8-14 8z"/>',
 restart:'<path d="M1 4v6h6"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/>',
 star:'<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
 home:'<path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 20z"/>',
 gift:'<path d="M20 12v9H4v-9"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
 spark:'<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>',
 swap:'<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>'};
const CK_EMO=[['⚙️','gear'],['⚙','gear'],['♪','music'],['⟳','rot'],['🌐','globe'],['📜','scroll'],['💾','save'],['🛒','cart'],['🎒','bag'],['🎟️','ticket'],['🎟','ticket'],['▶','play'],['↻','restart'],['✦','star'],['⌂','home'],['🎁','gift'],['✧','spark'],['⇄','swap']];
function ckIcoSvg(n){return `<svg class="ckico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${CK_ICO[n]}</svg>`}
function ckIconize(root){(root||document).querySelectorAll('button,.shop-tab,.tab').forEach(b=>{if(b.closest('#cv')||b.querySelector('svg.ckico'))return;const tn=[...b.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(!tn)return;const tx=tn.textContent.replace(/^\s+/,'');
 for(const[e,n]of CK_EMO){if(tx.startsWith(e)){tn.textContent=tx.slice(e.length).replace(/^\s+/,'');const s=document.createElement('span');s.className='ckico-w';s.innerHTML=ckIcoSvg(n);b.insertBefore(s,tn);break}}})}
let ckIcoQ=0;new MutationObserver(()=>{if(ckIcoQ)return;ckIcoQ=requestAnimationFrame(()=>{ckIcoQ=0;try{ckIconize()}catch(_){}})}).observe(document.body,{childList:true,subtree:true,characterData:true});
setTimeout(()=>{try{ckIconize()}catch(_){}},400);
// ---- V5.1 home screen: logo on top, Play, commander + difficulty, Shop/Inventory row, utility tiles ----
function ckHomeLayout(){const card=document.querySelector('#title .tcard');if(!card||card.classList.contains('ck-home'))return;
 const logo=document.getElementById('logo');if(logo&&CKA.logo){logo.src=CKA.logo;logo.classList.add('ck-logo')}
 const main=document.createElement('div');main.className='ck-hmain';const util=document.createElement('div');util.className='ck-hutil';
 const sh=document.getElementById('ckshopbtn'),iv=document.getElementById('ckinvbtn');if(!sh||!iv)return;
 main.append(sh,iv);
 const tiles=[document.getElementById('histbtn'),document.getElementById('xferbtn'),document.getElementById('topupbtn'),card.querySelector('.opts .musbtn'),card.querySelector('.opts .rotbtn'),card.querySelector('.opts .langbtn')].filter(Boolean);
 tiles.forEach(b=>{b.classList.add('ck-tile');b.style.gridColumn='';util.appendChild(b)});
 const dif=document.getElementById('dif');(dif||card.lastChild).after(main);main.after(util);
 card.classList.add('ck-home');try{ckIconize(card)}catch(_){}}
setTimeout(ckHomeLayout,1000);setTimeout(ckHomeLayout,2000);
