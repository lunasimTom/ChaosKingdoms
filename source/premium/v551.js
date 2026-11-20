/* ===== Chaos Kingdoms v5.5.1 · feel, achievement recovery, medal card, popups, home card, smarter AI ===== */
// ---- button haptics: a 10 ms tick on every button press (own switch in Settings › Sound) ----
function ckBtnVibe(){if(S.bvib===false)return;try{if(window.CKAndroid&&CKAndroid.vibrate){CKAndroid.vibrate(10);return}if(navigator.vibrate)navigator.vibrate(10)}catch(_){}}
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('button,.bt,.tab,.shop-tab,[role="button"],.realm-pin,.ck-am,.tw,.iv,.ck-dd');if(b&&!b.disabled)ckBtnVibe()},{capture:true,passive:true});
// difficulty slider: a firmer detent each time the selection changes
document.addEventListener('input',e=>{if(e.target&&e.target.id==='difrange'){const v=+e.target.value;if(v!==ckBtnVibe.dv){ckBtnVibe.dv=v;if(S.bvib!==false){try{if(window.CKAndroid&&CKAndroid.vibrate)CKAndroid.vibrate(18);else if(navigator.vibrate)navigator.vibrate([18])}catch(_){}}try{CKS.pickup(0)}catch(_){}const db=document.getElementById('dif');if(db){db.classList.remove('ck-dpulse');void db.offsetWidth;db.classList.add('ck-dpulse')}}}},true);
document.addEventListener('change',e=>{if(e.target&&e.target.id==='ckbvib'){S.bvib=!!e.target.checked;try{save()}catch(_){}if(S.bvib)ckBtnVibe()}});
if(typeof ZH==='object'){ZH['Continue Game']='继续游戏'}
// ---- achievements: retry the recovery check whenever no popup is open; one-time tier bonus for the original 8 ----
function ckA8Bonus(quiet){S.a8=Array.isArray(S.a8)?S.a8:[];let dia=0;const ids=[];
 for(const id of (S.ach||[])){const a=CK_AMAP[id];if(!a||!a.legacy||S.a8.includes(id))continue;const d=CK_TIER[a.tier].dia;S.a8.push(id);if(d){dia+=d;ids.push(id)}}
 if(dia){S.diamonds=(S.diamonds||0)+dia;try{ckStat('dia',dia);save();updWl()}catch(_){}if(!quiet)toast(lvZ('成就奖励补发：+'+dia+' 💎','Achievement bonus: +'+dia+' 💎'))}return dia}
function ckAchTick(){try{if(typeof S==='undefined'||mOpen||document.getElementById('ck-splash'))return;ckA55Init();ckA8Bonus(false);ckAchCheck(true)}catch(_){}}
setInterval(()=>{if(typeof S!=='undefined'&&S.mode!=='play')ckAchTick()},2500);
// ---- medal card: preview first, then save in the best way this device allows, always with clear feedback ----
function ckCardCanvas(a,cb){const zh=LANG==='zh',cv2=document.createElement('canvas'),w=720,h=900;cv2.width=w;cv2.height=h;const g=cv2.getContext('2d');
 const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#1d3157');bg.addColorStop(1,'#070c18');g.fillStyle=bg;g.fillRect(0,0,w,h);
 const rg=g.createRadialGradient(w/2,330,20,w/2,330,320);rg.addColorStop(0,'#ffd36a55');rg.addColorStop(1,'#ffd36a00');g.fillStyle=rg;g.fillRect(0,0,w,h);
 g.strokeStyle='#e9b95a';g.lineWidth=6;g.strokeRect(18,18,w-36,h-36);g.strokeStyle='#e9b95a55';g.lineWidth=2;g.strokeRect(32,32,w-64,h-64);
 const txt=()=>{g.textAlign='center';g.fillStyle='#f3c04d';g.font='900 26px CKSans,sans-serif';g.fillText(zh?'成就解锁':'ACHIEVEMENT UNLOCKED',w/2,92);
  g.fillStyle='#fff1c7';g.font='900 52px CKSans,sans-serif';g.fillText(ckAName(a),w/2,600);g.fillStyle='#c9d4ec';g.font='400 28px CKSans,sans-serif';g.fillText(ckADesc(a),w/2,650);
  g.fillStyle=CK_TIER[a.tier].c;g.font='900 26px CKSans,sans-serif';g.fillText(CK_TIER[a.tier].n[zh?0:1]+' · '+CK_TIER[a.tier].pts+(zh?' 点':' pts'),w/2,700);
  g.fillStyle='#ffe08a';g.font='900 30px CKSans,sans-serif';g.fillText((S.name||(zh?'指挥官':'Commander'))+' · '+ckTitleTxt()+' · Lv.'+plLevel(),w/2,780);
  g.fillStyle='#8fa0c8';g.font='700 22px CKSans,sans-serif';g.fillText('Chaos Kingdoms · Tower Defense',w/2,842);cb(cv2)};
 const im=new Image();im.onload=()=>{g.drawImage(im,w/2-180,150,360,360*im.height/im.width);txt()};im.onerror=txt;im.src=CKM[a.m]}
function ckShareCard(a){ckCardCanvas(a,cv2=>{const url=cv2.toDataURL('image/png'),zh=LANG==='zh',name='chaos-kingdoms-'+a.id+'.png';
 modal(`<div class="ck-card"><h2 class="f">${zh?'成就卡':'Medal Card'}</h2><img class="ck-cardimg" src="${url}" alt=""><p class="ck-cardst" id="ckcardst">${zh?'也可以长按（或右键）图片保存。':'You can also press and hold (or right-click) the image to save it.'}</p><div class="ck-adb"><button type="button" class="bt pay" id="ckcsave">${zh?'保存图片':'Save image'}</button><button type="button" class="bt g" id="m1">${zh?'返回':'Back'}</button></div></div>`,()=>ckAchDetail(a.id));
 const st=document.getElementById('ckcardst'),say=(t,ok)=>{st.textContent=t;st.className='ck-cardst '+(ok?'ok':'bad');toast(t)};
 document.getElementById('ckcsave').onclick=async()=>{
  // 1) Android app: straight into the gallery
  if(window.CKAndroid&&CKAndroid.saveImage){let r='err';try{r=CKAndroid.saveImage(url.split(',')[1],name)}catch(_){}
   if(r==='ok')return say(zh?'✓ 已保存到相册（图片 › Chaos Kingdoms）':'✓ Saved to your gallery (Pictures › Chaos Kingdoms)',true);
   return say(r==='old'?(zh?'此 Android 版本无法直接保存，请截屏保存。':'This Android version cannot save directly. Please take a screenshot.'):(zh?'保存失败，请截屏保存。':'Could not save. Please take a screenshot.'),false)}
  // 2) phones: the share sheet (Save to Photos, messages...)
  try{const blob=await (await fetch(url)).blob(),file=new File([blob],name,{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:ckAName(a)});return say(zh?'✓ 已打开分享，可选择“存储图像”':'✓ Share sheet opened: choose Save Image to keep it',true)}}catch(e){if(e&&e.name==='AbortError')return say(zh?'已取消':'Cancelled',false)}
  // 3) desktop: a normal download (blocked inside preview frames, so tell the player what to do then)
  try{const l=document.createElement('a');l.href=url;l.download=name;document.body.appendChild(l);l.click();l.remove()}catch(_){}
  say(window.top!==window?(zh?'预览窗口不允许下载：请右键（或长按）上方图片选择“保存图片”。':'Downloads are blocked in this preview: right-click (or press and hold) the image above and choose Save image.'):(zh?'✓ 已开始下载 '+name:'✓ Download started: '+name),window.top===window)}})}
// ---- every popup: blurred background + the home screen's rising fireflies ----
(function(){const m=document.getElementById('modal');if(!m||document.getElementById('ck-mfx'))return;const cv=document.createElement('canvas');cv.id='ck-mfx';m.insertBefore(cv,m.firstChild);
 const g=cv.getContext('2d');let P=[],w=0,h=0,run=false,last=0;const dpr=Math.min(2,devicePixelRatio||1);
 const spark=document.createElement('canvas');spark.width=spark.height=32;{const s=spark.getContext('2d'),gr=s.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,240,200,1)');gr.addColorStop(.25,'rgba(255,196,90,.85)');gr.addColorStop(1,'rgba(255,140,40,0)');s.fillStyle=gr;s.fillRect(0,0,32,32)}
 const mk=init=>({x:Math.random()*w,y:init?Math.random()*h:h+10,r:(Math.random()*2.4+1)*dpr,vy:-(Math.random()*20+10)*dpr,vx:(Math.random()-.5)*10*dpr,ph:Math.random()*6.28,a:Math.random()*.55+.25});
 const size=()=>{const r=m.getBoundingClientRect(),nw=Math.max(1,Math.round(r.width*dpr*.6)),nh=Math.max(1,Math.round(r.height*dpr*.6));if(nw!==w||nh!==h){w=cv.width=nw;h=cv.height=nh;P=Array.from({length:34},()=>mk(true))}};
 const step=t=>{if(!m.classList.contains('on')){run=false;return}const dt=Math.min(.05,(t-(last||t))/1000);last=t;size();g.clearRect(0,0,w,h);g.globalCompositeOperation='lighter';
  for(const p of P){p.y+=p.vy*dt*.6;p.x+=(p.vx+Math.sin(t/900+p.ph)*6*dpr)*dt*.6;if(p.y<-12){Object.assign(p,mk(false))}const fl=.6+.4*Math.sin(t/300+p.ph);g.globalAlpha=p.a*fl;const s=p.r*7;g.drawImage(spark,p.x-s/2,p.y-s/2,s,s)}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';requestAnimationFrame(step)};
 new MutationObserver(()=>{if(m.classList.contains('on')&&!run){run=true;last=0;requestAnimationFrame(step)}}).observe(m,{attributes:true,attributeFilter:['class']})})();
// ---- home commander card: the whole card opens Commander Record; title, 3 medals and progress, symmetric ----
function ckHomeCard(){const t=document.querySelector('#title .profileteaser');if(!t)return;t.classList.add('ck-hcard');ckA55Init();ckAchStats();const zh=LANG==='zh';
 let box=document.getElementById('ckhc');if(!box){box=document.createElement('div');box.id='ckhc';t.appendChild(box)}
 const ids=(S.show||[]).filter(x=>CK_AMAP[x]&&(S.ach||[]).includes(x));const slots=[0,1,2].map(i=>ids[i]?`<img src="${CKM[CK_AMAP[ids[i]].m]}" alt="">`:`<i class="ck-hslot">+</i>`).join('');
 const n=(S.ach||[]).length,tot=ACHS.length;
 box.innerHTML=`<div class="ck-hmed">${slots}</div><div class="ck-hprog"><span>${zh?'成就':'Achievements'} <b>${n}/${tot}</b></span><span class="ck-ttl">${ckTitleTxt()}</span></div><div class="ck-bar"><em style="width:${Math.round(n/tot*100)}%"></em></div>`;
 const old=document.getElementById('ckshow');if(old)old.style.display='none'}
setTimeout(ckHomeCard,1500);
// ---- smarter monsters (see the flow-field patch in the build): one-time tip the first time it matters ----
function ckAITip(){if(S.aitip||L.demo)return;S.aitip=1;try{save()}catch(_){}setTimeout(()=>toast(lvZ('💡 怪物会绕开你的火力，并攻击防守薄弱的地方。请覆盖每一条路线！','💡 Monsters now dodge your firepower and strike where you are weakest. Cover every path!')),2500)}

// soft range ring for a selected tower: semi-transparent, blurred edges, does not hide the map
function ckRangeRing(x,y,r){const g=c.createRadialGradient(x,y,0,x,y,r*1.07);g.addColorStop(0,'rgba(255,226,150,.035)');g.addColorStop(.82,'rgba(255,226,150,.06)');g.addColorStop(.93,'rgba(255,234,170,.24)');g.addColorStop(.97,'rgba(255,234,170,.14)');g.addColorStop(1,'rgba(255,234,170,0)');
 c.save();c.fillStyle=g;c.beginPath();c.arc(x,y,r*1.07,0,7);c.fill();c.restore()}
