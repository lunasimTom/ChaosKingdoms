/* ===== Chaos Kingdoms v6.4 · Ultimate Boss finale, boss defence, secondary-boss loot, bar polish, instant music ===== */

// ---- 1. music: start as soon as the game is ready (no waiting for the first tap where autoplay is allowed),
//         and compose level tracks ahead of time while the player is on the map ----
setTimeout(()=>{try{if(!mon&&!mOff)music(true)}catch(_){}},60);
(function(){const o=buildMap;buildMap=function(){const r=o.apply(this,arguments);try{const ri=selectedRealm,base=ri*8;let k=0;while(k<((R[ri]&&R[ri].count)||8)-1&&S.prog[base+k])k++;const lv=base+k;if(!MC['L'+lv])ckPrefetch('L'+lv)}catch(_){}return r}})();
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('#map .nd[data-i]');if(b){const k='L'+b.dataset.i;try{if(!MC[k])ckPrefetch(k)}catch(_){}}},true);

// ---- 2. boss roles: the Main (Ultimate) Boss arrives last, only after every Secondary Boss has fallen ----
const CK_DEF_MAIN=5,CK_DEF_SEC=1.5;
(function(){const o=mkWave;mkWave=function(w){const q=o.apply(this,arguments);try{if(!L.demo&&L.boss&&w===L.waves){const n=q.filter(t=>t==='boss').length;
  if(n>=2){q.splice(q.indexOf('boss'),1);L.ckMainHeld=1;L.ckMainSp=spk('boss');L.ckSecN=0;L.ckMainQ=0}}}catch(_){}return q}})();
let CK_MAINSPAWN=false;
(function(){const o=spawn;spawn=function(t,at){if(t==='bossmain'){CK_MAINSPAWN=true;try{return spawn('boss',at)}finally{CK_MAINSPAWN=false}}
 if(t==='boss'&&!L.demo&&L.ckMainHeld&&!CK_MAINSPAWN&&L.bsc==null){L.bsc=1;L.bsps=[L.ckMainSp]}
 const n0=L.en.length;const r=o.apply(this,arguments);
 try{if(t==='boss'&&!L.demo&&L.en.length>n0){const e=L.en[L.en.length-1];if(e.t!=='boss')return r;
   e.adt=null;e.bad=null;                                     // no adaptive resistance for any boss
   if(L.ckMainHeld&&!CK_MAINSPAWN){e.ckSec=1;L.ckSecN=(L.ckSecN||0)+1;e.bdef=(e.bdef||1)*CK_DEF_SEC}
   else{e.ckMain=1;if(CK_MAINSPAWN&&L.ckMainSp){e.sp=L.ckMainSp}L.ckMainHeld=0;e.bdef=(e.bdef||1)*CK_DEF_MAIN}
   ckAddBossRow(e,false)}}catch(_){}return r}})();
// when the last Secondary Boss falls: red warning, then the Ultimate Boss
(function(){const o=upd;upd=function(dt){const r=o.apply(this,arguments);try{if(L&&!L.demo&&!L.over&&L.ckMainHeld&&(L.ckSecN||0)>0&&L.wave>=L.waves){
  const secAlive=L.en.some(e=>e.t==='boss'&&e.hp>0)||L.q.some(t=>String(t).split('|')[0]==='boss');
  if(!secAlive&&!L.ckMainQ){L.ckMainQ=1;L.ckMainT=3.2;L.bAl={t:0,d:3};L.shake=Math.max(L.shake||0,.6);try{sfx('bossalert',.7)}catch(_){}
   window.ckBanner&&ckBanner(lvZ('终极首领','ULTIMATE BOSS'),lvZ('终极首领即将现身！','The Ultimate Boss is about to appear!'),1);toast(lvZ('⚠ 终极首领即将现身！','⚠ The Ultimate Boss is about to appear!'))}
  if(L.ckMainQ===1){L.ckMainT-=dt;if(L.ckMainT<=0){L.ckMainQ=2;L.q.unshift('bossmain');L.stim=0}}}}catch(_){}return r}})();
// victory and the final treasure wait for the Ultimate Boss
(function(){const o=ckIsFinalBoss;ckIsFinalBoss=function(e){if(e&&e.ckSec)return false;if(L.ckMainHeld)return false;return o.apply(this,arguments)}})();
// Secondary Bosses drop a modest treasure each (no collection window; pieces stay ~12 s)
function ckSecLoot(e){const sp=eS(e),now=performance.now(),rp=!!(S.prog&&S.prog[L.i]),i=L.i,R_=Math.random,out=[];
 const gS=Math.round((40+i*4)*([.7,.85,1,1.2,1.5][S.dif]||1));
 out.push({tier:1,kind:'gold',amt:gS*3},{tier:0,kind:'gold',amt:gS*2},{tier:0,kind:'star',amt:2});
 if(R_()<.7)out.push({tier:1,kind:'frag',amt:1+(R_()<.3?1:0)});
 if(R_()<(rp?.15:.45+Math.min(.25,i/400)))out.push({tier:3,kind:'dia',amt:1+(R_()<.25+(i>=60?.15:0)?1:0)});
 if(R_()<(rp?.04:.12))out.push({tier:2,kind:'chest',ct:R_()<.7?0:R_()<.8?1:2,amt:1});
 if(R_()<.12)out.push({tier:2,kind:'rune',amt:1});
 if(R_()<.25)out.push({tier:1,kind:'item',id:['frz','met','fbomb','scroll'][R_()*4|0],amt:1});
 const taken=[];L.loot=L.loot||[];
 for(const pc of out){let x=0,y=0;for(let a=0;a<10;a++){const r=.5+R_()*2.2,an=R_()*6.283;x=Math.max(-.3,Math.min(L.cols-.7,e.x+Math.cos(an)*r));y=Math.max(-.3,Math.min(L.rows-.7,e.y+Math.sin(an)*r*.85));if(taken.every(q=>Math.hypot(q[0]-x,q[1]-y)>.45))break}taken.push([x,y]);
  L.loot.push(Object.assign({x,y,born:TM,life:12,fx:sp.x,fy:sp.y,ft0:now,fdur:420+R_()*260,boss:0},pc))}
 try{CKS.lootBurst(2)}catch(_){}vGlow(sp.x,sp.y,tw*1.6,'#ffd36a',.5)}
(function(){const o=ckLootOnDeath;ckLootOnDeath=function(e){if(e&&e.t==='boss'&&e.ckSec&&!L.demo&&!L.over){try{ckSecLoot(e)}catch(_){}return}return o.apply(this,arguments)}})();

// ---- 3. boss bars: inside the battlefield, names follow the language, square 8 px bars, coloured trail ----
ckAddBossRow=function(e,mini){const rows=ckBossRows();const role=mini?'mini':e.ckMain?'main':'sec';const ex=rows.find(r=>r.e===e);if(ex){ex.role=role;ex.sp=e.sp;rows.sort((a,b)=>(b.role==='main')-(a.role==='main'));CK_BB.key='';return}
 rows.push({e,role,sp:e.sp,f:1,tr:1,hold:0,dead:false});rows.sort((a,b)=>(b.role==='main')-(a.role==='main'));CK_BB.dirty=true};
function ckRowName(r){if(r.role==='mini'){const d=ckMbDef(L.i);return lvZ(d[0][0],d[0][1])}if(r.role==='main')return ckMainBossName();const n=CK_BNAME[r.sp];return n?lvZ(n[0],n[1]):lvZ('首领','Boss')}
function ckBoardRect(){const cv=document.getElementById('cv'),app=document.getElementById('app');if(!cv||!app)return null;const r=cv.getBoundingClientRect(),a=app.getBoundingClientRect(),k=r.width/W;
 const bw=tw*(port?L.rows:L.cols)*k,bh=tw*(port?L.cols:L.rows)*k;return{x:r.left-a.left+ox*k,y:r.top-a.top+oy*k,w:bw,h:bh}}
ckBBRender=function(){let rows=(typeof L!=='undefined'&&L&&!L.demo&&S.mode==='play')?ckBossRows():[];let el=CK_BB.el;
 if(!el){el=document.createElement('div');el.id='ck-bbars';const app=document.getElementById('app');if(!app)return;app.appendChild(el);CK_BB.el=el}
 const wait=!!(L&&!L.demo&&L.ckMainHeld&&(L.ckSecN||0)>0);   // Ultimate Boss not yet arrived: show its row, dimmed
 const list=wait?[{role:'main',sp:L.ckMainSp,ghost:true,f:1,tr:1}].concat(rows):rows;
 const show=list.length>0&&!L.over;el.hidden=!show;document.body.classList.toggle('ck-bbon',show);if(!show){CK_BB.L=null;return}
 const B=ckBoardRect();if(B){el.style.left=(B.x+6)+'px';el.style.top=(B.y+6)+'px';el.style.width=Math.max(120,B.w-12)+'px'}
 const key=list.map(r=>r.role+(r.ghost?'g':'')+r.sp).join(',')+LANG;
 if(CK_BB.L!==L||CK_BB.key!==key){CK_BB.L=L;CK_BB.key=key;
  el.innerHTML=list.map((r,i)=>`<div class="ck-bbr ${r.role}${r.ghost?' ghost':''}"><i class="ck-bbp" style="background-image:url('${SPRD[r.sp]||''}')"><b>✕</b></i><span class="ck-bbn">${ckRowName(r)}</span><div class="ck-bbt"><em class="ck-bbtr"></em><em class="ck-bbf"></em></div></div>`).join('');
  list.forEach(r=>{r.dead=undefined});el.classList.toggle('noname',(B?B.w:300)<230);document.documentElement.style.setProperty('--ck-bb-h',Math.round(el.getBoundingClientRect().height+10)+'px')}
 const now=performance.now(),dt=Math.min(.1,(now-(CK_BB.last||now))/1000);CK_BB.last=now;const paused=L.paused||mOpen||tab==='s';
 const kids=el.querySelectorAll('.ck-bbr');
 list.forEach((r,i)=>{const row=kids[i];if(!row)return;let f=1;
  if(!r.ghost){const e=r.e;f=Math.max(0,e.hp>0?e.hp/e.mx:0);if(f<r.f-.0005)r.hold=.45;r.f=f;if(!paused){if(r.hold>0)r.hold-=dt;else if(r.tr>f)r.tr=Math.max(f,r.tr-Math.max(.25,(r.tr-f)*1.8)*dt)}if(r.tr<f)r.tr=f;
   const dead=e.hp<=0;if(dead!==r.dead){r.dead=dead;row.classList.toggle('dead',dead)}row.classList.toggle('rage',!!e.rage&&!dead);row.classList.toggle('chan',(e.chan||0)>0&&!dead)}
  const col=`rgb(${ckBCol(f).join(',')})`,fl=row.querySelector('.ck-bbf'),tr=row.querySelector('.ck-bbtr');
  row.style.setProperty('--c',col);fl.style.transform=`scaleX(${f})`;tr.style.transform=`scaleX(${r.tr})`})};
