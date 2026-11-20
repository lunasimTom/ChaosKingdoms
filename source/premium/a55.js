/* ===== Chaos Kingdoms v5.5 · 40 achievements, points & titles, showcase, daily reward, statistics =====
   The 8 original achievements keep their ids, names, rank requirements and gold, so saves recognise them.
   32 new ones are added. Every achievement shows one of the 40 medal artworks (CKM[n]). Progress comes
   from S.stats: original counters plus new ones (chests, dia, rares, items, comeback, speed, inferno,
   bt_<tower>) and values derived from the save each time (level, stars, cleared levels, realms...).
   Saves that already qualify get the achievements (and their rewards) on load. */
const CK_TIER={b:{pts:10,gold:1000,dia:0,c:'#d58b4a',n:['铜','Bronze']},s:{pts:25,gold:3000,dia:1,c:'#cfd6e6',n:['银','Silver']},g:{pts:50,gold:8000,dia:5,c:'#ffd24a',n:['金','Gold']}};
// [medal, id, stat, need, tier, en name, zh name, en desc, zh desc, extra {chest}]
const CK_A55=[
 [1,'first','wins',1,'b'],[2,'slayer','kills',1000,'b'],[3,'perfect','perfect',10,'s'],[4,'boss','bossWins',8,'s'],
 [5,'chest10','chests',10,'s','Treasure Seeker','寻宝者','Open 10 treasure chests','打开 10 个宝箱'],
 [6,'gems100','dia',100,'g','Gem Collector','宝石收藏家','Earn 100 diamonds','累计获得 100 颗钻石'],
 [7,'veteran','wins',10,'b'],
 [8,'mapper','maps',6,'s','Cartographer','制图师','Unlock 6 realms on the world map','在世界地图上解锁 6 个领域'],
 [9,'lv10','lv',10,'b','Arcane Scholar','奥术学者','Reach Commander Lv.10','统帅等级达到 10 级'],
 [10,'phoenix','comeback',1,'s','Phoenix Rising','浴火重生','Win a level with 5 lives or fewer left','以 5 点或更少生命赢得一关'],
 [11,'kills10k','kills',10000,'s','Pack Hunter','狼群猎手','Defeat 10,000 enemies','击败 10,000 个敌人'],
 [12,'archer','bt_arrow',100,'s','Master Archer','神射手','Build 100 Archer Towers','建造 100 座箭塔'],
 [13,'nightmare','hardWins',5,'s'],
 [14,'items50','items',50,'b','Alchemist','炼金术士','Use 50 items in battle','在战斗中使用 50 个道具'],
 [15,'builder','built',50,'b'],
 [16,'stars100','stars',100,'s','Rising Star','新星','Earn 100 level stars','获得 100 颗关卡星星'],
 [17,'realm','realms',1,'s','Realm Conqueror','领域征服者','Clear every level of one realm','通关一个领域的全部关卡'],
 [18,'emerald','b9',1,'s','Warden of the Wilds','荒野守望者','Defeat the Emerald Wilds boss','击败翡翠荒野的首领'],
 [19,'peak','b2',1,'b','Peak Conqueror','雪峰征服者','Defeat the Ice Realm boss','击败冰雪领域的首领'],
 [20,'lava','b3',1,'s','Fire Walker','熔岩行者','Defeat the Lava Fortress boss','击败熔岩要塞的首领'],
 [21,'engineer','upgrades',100,'s'],
 [22,'wins50','wins',50,'g','Warlord','战争领主','Win 50 levels','赢得 50 场关卡胜利'],
 [23,'boss25','bossWins',25,'g','Wyrm Slayer','屠龙者','Defeat 25 bosses','击败 25 个首领'],
 [24,'throne','throne',1,'g','Lord of the Throne','王座之主','Conquer the Fourfold Throne','征服四灾王座',{chest:4}],
 [25,'speed','speed',1,'b','Against the Clock','争分夺秒','Win a level in under 4 minutes','在 4 分钟内赢得一关'],
 [26,'clear50','cleared',50,'g','Keymaster','钥匙大师','Clear 50 different levels','通关 50 个不同的关卡'],
 [27,'toxin','bt_toxin',50,'b','Plague Master','瘟疫大师','Build 50 Toxin Towers','建造 50 座毒塔'],
 [28,'cannon','bt_cannon',50,'b','Fire Starter','烈焰炮手','Build 50 Cannon Towers','建造 50 座炮塔'],
 [29,'frost','bt_ice',50,'b','Frost Master','冰霜大师','Build 50 Frost Towers','建造 50 座冰霜塔'],
 [30,'storm','bt_zap',50,'b','Stormcaller','唤雷者','Build 50 Lightning Towers','建造 50 座闪电塔'],
 [31,'rares','rares',25,'s','Rare Collector','珍宝收藏家','Collect 25 rare items','收集 25 件稀有道具'],
 [32,'rich','goldNow',250000,'s','Royal Treasury','皇家国库','Hold 250,000 gold at once','同时持有 250,000 金币'],
 [33,'lv30','lv',30,'g','Paladin','圣骑士','Reach Commander Lv.30','统帅等级达到 30 级'],
 [34,'kills50k','kills',50000,'g','Orc Crusher','兽人克星','Defeat 50,000 enemies','击败 50,000 个敌人'],
 [35,'lv20','lv',20,'s','Elven Ally','精灵盟友','Reach Commander Lv.20','统帅等级达到 20 级'],
 [36,'titan','cuMax',30,'g','Titan','泰坦','Upgrade one attribute to Lv.30','将任意一项属性强化至 30 级'],
 [37,'lv50','lv',50,'g','Chaos Conqueror','混沌征服者','Reach Commander Lv.50','统帅等级达到 50 级',{chest:3}],
 [38,'void','hidden',1,'s','Void Walker','虚空行者','Discover a hidden realm','发现一个隐藏领域'],
 [39,'inferno','inferno',10,'g','Inferno Champion','炼狱冠军','Win 10 levels on Chaos Inferno','在混沌炼狱难度赢得 10 关'],
 [40,'sky','b4',1,'s','Sky Voyager','天空旅者','Defeat the Sky Castle boss','击败天空之城的首领']];
const CK_OLDZH={first:['初战告捷','赢得第一场胜利'],builder:['建造大师','建造 50 座防御塔'],slayer:['怪物杀手','击败 1000 个敌人'],veteran:['老练统帅','赢得 10 场胜利'],engineer:['工程大师','升级 100 次'],perfect:['完美守护','满血赢得 10 关'],nightmare:['噩梦征服者','在困难及以上难度赢得 5 关'],boss:['首领猎人','击败 8 个首领']};
const CK_TITLES=[[0,'新兵','Recruit'],[50,'见习骑士','Squire'],[150,'骑士','Knight'],[300,'勇者','Champion'],[500,'战争领主','Warlord'],[750,'屠龙者','Dragonbane'],[1000,'混沌破坏者','Chaos Breaker']];
let CK_AMAP={};
function ckA55Init(){if(ckA55Init.done||typeof ACHS==='undefined')return;ckA55Init.done=1;
 for(const r of CK_A55){const[m,id,stat,need,tier,en,zh,de,dz,ex]=r;let a=ACHS.find(x=>x.id===id);
  if(!a){a={id,name:en,desc:de,rank:0,stat,need,gold:CK_TIER[tier].gold};ACHS.push(a)}
  a.m=m;a.tier=tier;a.zhN=zh||(CK_OLDZH[id]||[])[0];a.zhD=dz||(CK_OLDZH[id]||[])[1];a.ex=ex||null;a.legacy=!en;CK_AMAP[id]=a}
 ACHS.sort((x,y)=>(x.m||99)-(y.m||99))}
function ckAName(a){return LANG==='zh'?(a.zhN||TL(a.name)):a.name}
function ckADesc(a){return LANG==='zh'?(a.zhD||TL(a.desc)):a.desc}
function ckStat(k,n){S.stats=S.stats||{};S.stats[k]=(S.stats[k]||0)+(n||1)}
// values derived from the save, refreshed before every check
function ckAchStats(){const st=S.stats=S.stats||{};const P=S.prog||{};let stars=0,cl=0;for(const k in P){const v=+P[k]||0;stars+=v;if(v>0)cl++}
 st.lv=plLevel();st.stars=stars;st.cleared=cl;st.goldNow=Math.floor(+S.gold||0);
 let realms=0,maps=0,hidden=0;for(let ri=0;ri<R.length;ri++){const n=R[ri].count||8;let all=true;for(let k=0;k<n;k++)if(!(P[ri*8+k]>0)){all=false;break}if(all)realms++;
  let un=false;try{un=mapUnlockedBase(ri)}catch(_){}if(un){if(R[ri].secret)hidden++;else maps++}st['b'+ri]=(P[ri*8+n-1]>0)?1:0}
 st.realms=realms;st.maps=maps;st.hidden=hidden;st.throne=(P[99]>0)?1:0;const cu=S.cu||{};st.cuMax=Math.max(cu.a|0,cu.d|0,cu.b|0,cu.c|0)}
function ckPoints(){let p=0;for(const id of (S.ach||[])){const a=CK_AMAP[id];if(a)p+=CK_TIER[a.tier].pts}return p}
function ckTitle(p){p=p==null?ckPoints():p;let t=CK_TITLES[0];for(const x of CK_TITLES)if(p>=x[0])t=x;return t}
function ckTitleTxt(){const t=ckTitle();return LANG==='zh'?t[1]:t[2]}
// extras on top of the gold (diamonds, chests); legacy achievements keep only their original gold
function ckAExtra(a){if(a.legacy)return;const T=CK_TIER[a.tier];if(T.dia)S.diamonds=(S.diamonds||0)+T.dia;if(a.ex&&a.ex.chest!=null){ckChInit();S.chests[a.ex.chest]++}}
function ckRewardTxt(a){const T=CK_TIER[a.tier],zh=LANG==='zh';let t='+'+(a.gold||0).toLocaleString()+' 🪙';if(!a.legacy&&T.dia)t+=' +'+T.dia+' 💎';if(a.ex&&a.ex.chest!=null)t+=' + 🎁 '+ckChName(a.ex.chest);return t+' · '+T.pts+(zh?' 点':' pts')}
// out-of-battle checks (load, chests, forge...): grant gold + extras, show the banner
function ckAchCheck(quiet){try{ckA55Init();const got=checkAchievements();if(!got.length)return got;let g=0;for(const a of got){g+=a.gold||0;ckAExtra(a)}if(g)Economy.grantWallet(g);ckANew(got);try{save();updWl()}catch(_){}
 if(quiet&&got.length>1)ckABanner(null,got);else got.forEach((a,i)=>setTimeout(()=>ckABanner(a),i*2600));return got}catch(e){console.warn('ach',e);return[]}}
function ckANew(got){S.achNew=(S.achNew||[]).concat(got.map(a=>a.id));ckDot()}
function ckDot(){const b=document.getElementById('profilebtn');if(b)b.classList.toggle('ck-dot',!!(S.achNew&&S.achNew.length))}
// unlock banner (gold tier: bigger fanfare and haptics)
function ckABanner(a,many){const zh=LANG==='zh',el=document.createElement('div');el.className='ck-abn'+(a&&a.tier==='g'?' g':'');
 if(many){el.innerHTML=`<img src="${CKM[many[0].m]}" alt=""><div><small>${zh?'成就补发':'Achievements unlocked'}</small><b>${zh?'已解锁 '+many.length+' 个成就！':many.length+' achievements unlocked!'}</b><span>${zh?'在统帅档案中查看':'See them in Commander Record'}</span></div>`}
 else el.innerHTML=`<img src="${CKM[a.m]}" alt=""><div><small>${zh?'成就解锁':'Achievement unlocked'} · ${CK_TIER[a.tier].n[zh?0:1]}</small><b>${ckAName(a)}</b><span>${ckRewardTxt(a)}</span></div>`;
 document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('in'));
 try{if(a&&a.tier==='g'){CKS.fanfare()}else CKS.pickup(4)}catch(_){}ckVibe(a&&a.tier==='g'?[40,60,40,60,120]:[30,40,60]);
 setTimeout(()=>{el.classList.remove('in');setTimeout(()=>el.remove(),500)},3200)}
// the medal grid in Commander Record
function ckAchGridHtml(){ckA55Init();ckAchStats();const zh=LANG==='zh',p=ckPoints(),t=ckTitle(p),nx=CK_TITLES.find(x=>x[0]>p);
 const head=`<div class="ck-ahead"><div><small>${zh?'成就点数':'Achievement points'}</small><b>${p}</b></div><div><small>${zh?'头衔':'Title'}</small><b>${zh?t[1]:t[2]}</b></div><div><small>${zh?'下一头衔':'Next title'}</small><b>${nx?(zh?nx[1]:nx[2])+' · '+nx[0]:'—'}</b></div></div>`;
 const cells=ACHS.map(a=>{const ok=(S.ach||[]).includes(a.id),cur=Math.min(a.need,S.stats[a.stat]||0),pc=Math.round(cur/a.need*100),nw=(S.achNew||[]).includes(a.id),pin=(S.show||[]).includes(a.id);
  return `<button type="button" class="ck-am ${ok?'ok':''} t-${a.tier}" data-ach="${a.id}">${nw?'<i class="nw"></i>':''}${pin?'<i class="pn">★</i>':''}<img src="${CKM[a.m]}" alt=""><span>${ckAName(a)}</span>${ok?'':`<u><em style="width:${pc}%"></em></u>`}</button>`}).join('');
 return `${head}<div class="ck-agrid">${cells}</div>`}
function ckAchDetail(id){const a=CK_AMAP[id];if(!a)return;const zh=LANG==='zh',ok=(S.ach||[]).includes(id),cur=Math.min(a.need,S.stats[a.stat]||0),pin=(S.show||[]).includes(id);
 if(S.achNew){S.achNew=S.achNew.filter(x=>x!==id);ckDot();try{save()}catch(_){}}
 const back=document.getElementById('mbox').innerHTML,backA=window.__ckMB;
 modal(`<div class="ck-ad ${ok?'ok':''} t-${a.tier}"><img src="${CKM[a.m]}" alt=""><small class="tier">${CK_TIER[a.tier].n[zh?0:1]} · ${CK_TIER[a.tier].pts}${zh?' 点':' pts'}</small><h2 class="f">${ckAName(a)}</h2><p>${ckADesc(a)}</p>
  <div class="ck-adp"><u><em style="width:${Math.round(cur/a.need*100)}%"></em></u><b>${cur.toLocaleString()} / ${a.need.toLocaleString()}</b></div>
  <div class="ck-adr">${zh?'奖励':'Reward'}: ${ckRewardTxt(a)}</div>
  ${ok?`<div class="ck-adb"><button type="button" class="bt g" id="ckpin">${pin?(zh?'取消展示':'Unpin'):(zh?'展示在主页':'Pin to showcase')}</button><button type="button" class="bt g" id="ckshare">${zh?'保存成就卡':'Save medal card'}</button></div>`:`<div class="ck-adl">🔒 ${zh?'尚未解锁':'Not unlocked yet'}</div>`}</div>
  <button class="bt g" id="m1">${zh?'返回':'Back'}</button>`,()=>openProfile(0));
 const pb=document.getElementById('ckpin');if(pb)pb.onclick=()=>{S.show=(S.show||[]).filter(x=>CK_AMAP[x]);if(pin)S.show=S.show.filter(x=>x!==id);else{if(S.show.length>=3)S.show.shift();S.show.push(id)}save();refreshProfileTeaser();ckAchDetail(id)};
 const sb=document.getElementById('ckshare');if(sb)sb.onclick=()=>ckShareCard(a)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-ach]');if(!t)return;e.stopPropagation();e.preventDefault();ckAchDetail(t.dataset.ach)},true);
// a medal card image to keep or share
function ckShareCard(a){const zh=LANG==='zh',cv2=document.createElement('canvas'),w=720,h=900;cv2.width=w;cv2.height=h;const g=cv2.getContext('2d');
 const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#1d3157');bg.addColorStop(1,'#070c18');g.fillStyle=bg;g.fillRect(0,0,w,h);
 g.strokeStyle='#e9b95a';g.lineWidth=6;g.strokeRect(18,18,w-36,h-36);g.strokeStyle='#e9b95a55';g.lineWidth=2;g.strokeRect(32,32,w-64,h-64);
 const rg=g.createRadialGradient(w/2,330,20,w/2,330,300);rg.addColorStop(0,'#ffd36a66');rg.addColorStop(1,'#ffd36a00');g.fillStyle=rg;g.fillRect(0,0,w,h);
 const draw=()=>{g.textAlign='center';g.fillStyle='#f3c04d';g.font='900 26px CKSans,sans-serif';g.fillText((zh?'成就解锁':'ACHIEVEMENT UNLOCKED'),w/2,90);
  g.fillStyle='#fff1c7';g.font='900 52px CKSans,sans-serif';g.fillText(ckAName(a),w/2,600);g.fillStyle='#c9d4ec';g.font='400 28px CKSans,sans-serif';g.fillText(ckADesc(a),w/2,650);
  g.fillStyle=CK_TIER[a.tier].c;g.font='900 26px CKSans,sans-serif';g.fillText(CK_TIER[a.tier].n[zh?0:1]+' · '+CK_TIER[a.tier].pts+(zh?' 点':' pts'),w/2,700);
  g.fillStyle='#ffe08a';g.font='900 30px CKSans,sans-serif';g.fillText((S.name||(zh?'指挥官':'Commander'))+' · '+ckTitleTxt()+' · Lv.'+plLevel(),w/2,780);
  g.fillStyle='#8fa0c8';g.font='700 22px CKSans,sans-serif';g.fillText('Chaos Kingdoms · Tower Defense',w/2,840);
  cv2.toBlob(b=>{const u=URL.createObjectURL(b),l=document.createElement('a');l.href=u;l.download='chaos-kingdoms-'+a.id+'.png';document.body.appendChild(l);l.click();setTimeout(()=>{URL.revokeObjectURL(u);l.remove()},1500);toast(zh?'成就卡已保存':'Medal card saved')},'image/png')};
 const im=new Image();im.onload=()=>{g.drawImage(im,w/2-180,150,360,360*im.height/im.width);draw()};im.onerror=draw;im.src=CKM[a.m]}
// showcase + title on the home commander card
function ckShowcaseHtml(){const ids=(S.show||[]).filter(x=>CK_AMAP[x]&&(S.ach||[]).includes(x));return `<span class="ck-title">${ckTitleTxt()}</span>${ids.length?`<span class="ck-show">${ids.map(x=>`<img src="${CKM[CK_AMAP[x].m]}" alt="">`).join('')}</span>`:''}`}
// next goal hint for the result screen
function ckNextGoal(){ckA55Init();ckAchStats();let best=null,bs=0;for(const a of ACHS){if((S.ach||[]).includes(a.id)||rankAt(S.xp)<a.rank)continue;const cur=S.stats[a.stat]||0,f=cur/a.need;if(f>bs&&f<1){bs=f;best=a}}
 if(!best)return '';const left=best.need-(S.stats[best.stat]||0),zh=LANG==='zh';return `<div class="ck-next"><img src="${CKM[best.m]}" alt=""><span>${zh?'下一个成就':'Next medal'}: <b>${ckAName(best)}</b> · ${zh?'还差 ':''}${left.toLocaleString()}${zh?'':' to go'}</span></div>`}
// per-battle counters (called at the start of end())
function ckAchEnd(win){if(!win||L.demo)return;if(L.lives<=5)ckStat('comeback');const secs=(Date.now()-(L.t0||Date.now()))/1000;if(secs>0&&secs<240)ckStat('speed');if(S.dif>=4)ckStat('inferno')}
// ---- daily login reward: a 7-day cycle; missing a day does not reset it ----
const CK_DAILY=[{gold:2000},{star:10},{frag:3},{gold:5000},{dia:1},{star:20},{chest:0}];
function ckToday(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
function ckDailyCheck(){if(S.dly==null)S.dly={day:0,last:0};if(S.dly.last===ckToday())return;ckDailyOpen()}
function ckDailyTxt(r){const zh=LANG==='zh';return r.gold?r.gold.toLocaleString()+(zh?' 金币':' gold'):r.star?r.star+(zh?' 星星':' stars'):r.frag?r.frag+(zh?' 碎片':' shards'):r.dia?r.dia+(zh?' 钻石':' diamond'):'🎁 '+ckChName(r.chest)}
function ckDailyIco(r){return r.gold?CKA.gold:r.star?CKA.star:r.frag?CKA.frag:r.dia?CKA.dia:CKA.ch_green}
function ckDailyOpen(){const zh=LANG==='zh',d=S.dly.day%7;
 modal(`<div class="ck-daily"><h2 class="f">${zh?'每日登录奖励':'Daily Reward'}</h2><p>${zh?'每天登录领取奖励，第 7 天获得宝箱！':'Log in each day for a reward. Day 7 brings a chest!'}</p><div class="ck-dgrid">${CK_DAILY.map((r,i)=>`<div class="ck-dd ${i<d?'got':''} ${i===d?'now':''}"><small>${zh?'第 '+(i+1)+' 天':'Day '+(i+1)}</small><img src="${ckDailyIco(r)}" alt=""><b>${ckDailyTxt(r)}</b>${i<d?'<i>✓</i>':''}</div>`).join('')}</div></div><button class="bt pay" id="m1">${zh?'领取':'Claim'}</button>`,()=>{ckDailyClaim();closeM()})}
function ckDailyClaim(){const d=S.dly.day%7,r=CK_DAILY[d];if(r.gold)Economy.grantWallet(r.gold);if(r.star)S.bonusStars=(S.bonusStars||0)+r.star;if(r.frag)S.frag=(S.frag|0)+r.frag;if(r.dia){S.diamonds=(S.diamonds||0)+r.dia;ckStat('dia',r.dia)}if(r.chest!=null){ckChInit();S.chests[r.chest]++}
 S.dly={day:S.dly.day+1,last:ckToday()};ckStat('logins');try{save();updWl()}catch(_){}toast((LANG==='zh'?'已领取：':'Claimed: ')+ckDailyTxt(r));try{CKS.pickup(3)}catch(_){}ckVibe(30)}
// ---- statistics page ----
function ckStatsHtml(){ckAchStats();const zh=LANG==='zh',st=S.stats,h=(typeof HIST!=='undefined'&&HIST.list)||[],secs=h.reduce((a,r)=>a+(r.secs||0),0),loss=h.filter(r=>r.result==='loss').length;
 const fav=Object.keys(TW).map(k=>[k,st['bt_'+k]||0]).sort((a,b)=>b[1]-a[1])[0],fmtT=s=>{const H=Math.floor(s/3600),M=Math.floor(s%3600/60);return (H?H+(zh?' 小时 ':'h '):'')+M+(zh?' 分钟':'m')};
 const rows=[[zh?'游戏时长':'Play time',fmtT(secs)],[zh?'胜 / 负':'Wins / losses',(st.wins||0)+' / '+loss],[zh?'击败敌人':'Enemies defeated',(st.kills||0).toLocaleString()],[zh?'击败首领':'Bosses defeated',st.bossWins||0],
  [zh?'建造防御塔':'Towers built',(st.built||0).toLocaleString()],[zh?'最常用防御塔':'Favourite tower',fav&&fav[1]?TW[fav[0]].n+' ×'+fav[1]:'—'],[zh?'已通关关卡':'Levels cleared',(st.cleared||0)+' / 100'],[zh?'关卡星星':'Level stars',st.stars||0],
  [zh?'打开宝箱':'Chests opened',st.chests||0],[zh?'获得钻石':'Diamonds earned',st.dia||0],[zh?'使用道具':'Items used',st.items||0],[zh?'成就':'Achievements',(S.ach||[]).length+' / '+ACHS.length+' · '+ckPoints()+(zh?' 点':' pts')]];
 return `<div class="ck-stats">${rows.map(r=>`<div><small>${r[0]}</small><b>${r[1]}</b></div>`).join('')}</div>`}
// achievement / stats tabs in Commander Record
let CK_PTAB='ach';
function ckProfileTabs(){const zh=LANG==='zh';return `<div class="ck-ptabs"><button type="button" class="ck-ub ck-hst ${CK_PTAB==='ach'?'on':''}" data-ptab="ach">${zh?'成就':'Achievements'}</button><button type="button" class="ck-ub ck-hst ${CK_PTAB==='stats'?'on':''}" data-ptab="stats">${zh?'统计':'Statistics'}</button></div><div id="ck-pbody">${CK_PTAB==='ach'?ckAchGridHtml():ckStatsHtml()}</div>`}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-ptab]');if(!t)return;e.stopPropagation();e.preventDefault();CK_PTAB=t.dataset.ptab;const w=t.closest('.ck-pwrap');if(w)w.innerHTML=ckProfileTabs()},true);
function ckProfileOpened(){if(S.achNew&&S.achNew.length){setTimeout(()=>{S.achNew=[];ckDot();try{save()}catch(_){}},4000)}}
// startup: wire everything once the save is loaded
(function a55Boot(){const go=()=>{if(typeof S==='undefined'||document.getElementById('ck-splash')){setTimeout(go,500);return}try{ckA55Init();ckDot();
 setTimeout(()=>{if(!mOpen)ckAchCheck(true);setTimeout(()=>{if(!mOpen&&S.mode==='title')ckDailyCheck()},1200)},1800)}catch(e){console.warn('a55',e)}};setTimeout(go,1500)})();
