/* ===== Chaos Kingdoms v6.3 · multi-boss health bars, richer late-game diamonds ===== */

// ---- 1. boss names for the illustrated portraits (secondary bosses) ----
const CK_BNAME={b2_skeleton_king:['骷髅王','Skeleton King'],b2_demon_lord:['恶魔领主','Demon Lord'],b2_ice_dragon:['冰霜巨龙','Ice Dragon'],b2_fire_giant:['火焰巨人','Fire Giant'],
 b2_necromancer:['死灵法师','Necromancer'],b2_death_knight:['死亡骑士','Death Knight'],b2_dread_knight:['恐惧骑士','Dread Knight'],b2_lich_king:['巫妖王','Lich King'],b2_stone_golem:['岩石魔像','Stone Golem'],
 b2_sea_monster:['深海巨兽','Sea Monster'],b2_dragon_king:['龙王','Dragon King'],b2_vampire_lord:['吸血鬼领主','Vampire Lord'],b2_ogre_king:['食人魔王','Ogre King'],b2_spider_queen:['蜘蛛女王','Spider Queen'],
 b2_giant_worm:['巨型沙虫','Giant Worm'],b2_demon_beast:['恶魔巨兽','Demon Beast'],b2_forest_ent:['远古树人','Ancient Treant'],b2_void_lord:['虚空领主','Void Lord'],b2_storm_titan:['风暴泰坦','Storm Titan']};
function ckMainBossName(){const i=L.i;return TL(i>=96?BOSS[13+(i-96)]:BOSS[i/8|0])}

// ---- 2. rows: one per boss (main boss first) plus the Level 4 mini-boss ----
function ckBossRows(){if(!L||L.demo)return[];if(L._brL!==L){L._brL=L;L._br=[]}return L._br}
function ckAddBossRow(e,mini){const rows=ckBossRows();if(rows.some(r=>r.e===e))return;const main=!mini&&!rows.some(r=>r.main&&!r.mini);
 const nm=mini?lvZ(ckMbDef(L.i)[0][0],ckMbDef(L.i)[0][1]):main?ckMainBossName():(CK_BNAME[e.sp]?lvZ(CK_BNAME[e.sp][0],CK_BNAME[e.sp][1]):lvZ('首领','Boss'));
 rows.push({e,mini:!!mini,main,name:nm,sp:e.sp,f:1,tr:1,hold:0,dead:false});rows.sort((a,b)=>(b.main-a.main));CK_BB.dirty=true}
(function(){const o=spawn;spawn=function(t,at){const n0=L.en.length;const r=o.apply(this,arguments);try{if(!L.demo&&L.en.length>n0){const e=L.en[L.en.length-1];if(t==='boss'&&e.t==='boss')ckAddBossRow(e,false);else if(t==='mboss'&&e.mb)ckAddBossRow(e,true)}}catch(_){}return r}})();
// colour runs dark blue -> light blue -> dark green -> light green -> yellow -> red as health falls
const CK_BCOL=[[1,[27,63,174]],[.82,[63,169,255]],[.64,[19,138,62]],[.46,[111,220,74]],[.28,[255,210,58]],[.12,[255,58,42]],[0,[230,30,30]]];
function ckBCol(f){for(let i=0;i<CK_BCOL.length-1;i++){const[a,ca]=CK_BCOL[i],[b,cb]=CK_BCOL[i+1];if(f<=a&&f>=b){const k=(a-f)/(a-b||1);return ca.map((v,j)=>Math.round(v+(cb[j]-v)*k))}}return CK_BCOL[CK_BCOL.length-1][1]}
// ---- 3. the bar stack (DOM, above the board, below menus) ----
const CK_BB={el:null,dirty:true,last:0,L:null};
function ckBBRender(){const rows=(typeof L!=='undefined'&&L&&!L.demo&&S.mode==='play')?ckBossRows():[];let el=CK_BB.el;
 if(!el){el=document.createElement('div');el.id='ck-bbars';const app=document.getElementById('app');if(!app)return;app.appendChild(el);CK_BB.el=el}
 const show=rows.length>0&&!L.over;el.hidden=!show;document.body.classList.toggle('ck-bbon',show);if(!show){CK_BB.L=null;return}
 if(CK_BB.L!==L||CK_BB.dirty||el.childElementCount!==rows.length){CK_BB.L=L;CK_BB.dirty=false;
  el.innerHTML=rows.map((r,i)=>`<div class="ck-bbr${r.main?' main':''}${r.mini?' mini':''}" data-i="${i}"><i class="ck-bbp" style="background-image:url('${SPRD[r.sp]||''}')"><b>✕</b></i><span class="ck-bbn">${r.name}</span><div class="ck-bbt"><em class="ck-bbtr"></em><em class="ck-bbf"></em>${r.main&&!r.mini&&L.i>=32?'<u style="left:50%"></u><u style="left:25%"></u>':''}</div></div>`).join('');
  const w=el.getBoundingClientRect().width;el.classList.toggle('noname',w<250);document.documentElement.style.setProperty('--ck-bb-h',Math.round(el.getBoundingClientRect().height+6)+'px')}
 const now=performance.now(),dt=Math.min(.1,(now-(CK_BB.last||now))/1000);CK_BB.last=now;const paused=L.paused||mOpen||tab==='s';
 rows.forEach((r,i)=>{const row=el.children[i];if(!row)return;const e=r.e,f=Math.max(0,e.hp>0?e.hp/e.mx:0);
  if(f<r.f-.0005){r.hold=.45}r.f=f;if(!paused){if(r.hold>0)r.hold-=dt;else if(r.tr>f)r.tr=Math.max(f,r.tr-Math.max(.06,(r.tr-f)*1.6)*dt)}if(r.tr<f)r.tr=f;
  const dead=e.hp<=0;if(dead!==r.dead){r.dead=dead;row.classList.toggle('dead',dead)}
  const c=ckBCol(f),fl=row.querySelector('.ck-bbf'),tr=row.querySelector('.ck-bbtr');
  fl.style.transform=`scaleX(${f})`;fl.style.setProperty('--c',`rgb(${c.join(',')})`);tr.style.transform=`scaleX(${r.tr})`;
  row.classList.toggle('rage',!!e.rage&&!dead);row.classList.toggle('chan',(e.chan||0)>0&&!dead)})}
(function loop(){requestAnimationFrame(loop);try{ckBBRender()}catch(_){}})();
// the Level 4 mini-boss uses its row instead of the small bar over its head (aura stays)
ckMbDraw=function(){if(!L||L.demo||!L.mbAlive)return;for(const e of L.en){if(!e.mb||e.hp<=0)continue;const q=eS(e),pr=.5+.5*Math.sin(TM*4);c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.25+.2*pr;const r=tw*(1.05+.08*pr),gg=c.createRadialGradient(q.x,q.y,r*.3,q.x,q.y,r);gg.addColorStop(0,'#ffd36a00');gg.addColorStop(.7,'#ffb02a66');gg.addColorStop(1,'#ffb02a00');c.fillStyle=gg;c.beginPath();c.arc(q.x,q.y,r,0,7);c.fill();c.restore()}};

// ---- 4. levels 61+: bosses and chests are a little more generous with diamonds ----
(function(){const o=ckTreasure;ckTreasure=function(){const T=o.apply(this,arguments);try{if(L.i>=60&&!L.demo){const k=(L.i-60)/39;
  for(const p of T.list)if(p.kind==='dia'&&Math.random()<.5)p.amt+=1;
  if(Math.random()<(T.replay?.12:.35+.2*k)){const r=Math.random();T.list.push({tier:3,kind:'dia',amt:r<.2?3:r<.55?2:1})}}}catch(_){}return T}})();
(function(){const o=ckChDrop;ckChDrop=function(i,rep){let r=o.apply(this,arguments);if(r<0&&i>=60&&Math.random()<.3)r=o.apply(this,arguments);return r}})();
function ckLate(){try{return Object.keys(S.prog||{}).some(k=>+k>=60&&S.prog[k])}catch(_){return false}}
(function(){const o=ckChOpen;ckChOpen=function(t){const rr=ckChRoll;if(ckLate())ckChRoll=function(tt){const r=rr.apply(this,arguments);if(Math.random()<.55+tt*.06)r.dia=(r.dia||0)+1+(tt>=4?1:0);return r};try{return o.apply(this,arguments)}finally{ckChRoll=rr}}})();
