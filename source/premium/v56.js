/* ===== Chaos Kingdoms v5.6 · mini-bosses on Level 4, treasure hoards for the final bosses, realm art for VII-XII ===== */

// ---- mini-bosses: Level 4 of realms I-XII (level index ri*8+3) ----
// name [zh, en], sprite, signature move, strength of the move (1 = realms I-VI, 1.5 = VII-XII)
const CK_MB=[
 [['兽人督军','Ogre Warchief'],'e_ogre','regen',1],
 [['沙之吸血鬼领主','Sand Vampire Lord'],'e_vampire','dash',1],
 [['霜巨魔首领','Frost Troll Jarl'],'e_troll','frost',1],
 [['余烬恶魔','Ember Demon'],'e_demon','split',1],
 [['风暴魔像','Storm Golem'],'e_golem','shield',1],
 [['死亡骑士队长','Death Knight Captain'],'e_dknight','heal',1],
 [['星界魔像','Astral Golem'],'e_golem','frost',1.5],
 [['深渊女伯爵','Abyss Countess'],'e_vampire','shield',1.5],
 [['钢铁死亡骑士','Iron Death Knight'],'e_dknight','dash',1.5],
 [['苔藓巨魔','Moss Troll'],'e_troll','regen',1.5],
 [['黑曜石魔像','Obsidian Golem'],'e_golem','heal',1.5],
 [['猩红恶魔','Crimson Demon'],'e_demon','split',1.5]];
const CK_MBM={regen:[['再生','Regrowth'],['3 秒未受伤害时快速回复生命。','Regrows health quickly after 3 s without being hit.']],
 dash:[['沙暴冲刺','Sand dash'],['每隔几秒突然加速冲刺。','Bursts forward at high speed every few seconds.']],
 frost:[['冰霜光环','Frost aura'],['周期性冻结附近的防御塔 1 秒（约慢 25%）。','Pulses frost that freezes nearby towers for 1 s (about 25% slower fire).']],
 split:[['分裂','Split'],['被击败时分裂成两个强壮怪物。','Splits into two brutes when defeated.']],
 shield:[['风暴护盾','Storm shield'],['每 10 秒展开一次吸收伤害的护盾。','Raises a damage-absorbing shield every 10 s.']],
 heal:[['黑暗治疗','Dark mending'],['持续治疗身边的怪物。','Keeps healing the monsters around it.']]};
function ckIsMbLv(i){return i!=null&&i<96&&i%8===3}
function ckMbDef(i){return CK_MB[(i/8|0)%12]}
function ckMbName(ri){const d=CK_MB[ri];return d?lvZ('小首领：','Mini-boss: ')+lvZ(d[0][0],d[0][1]):''}
// the final wave of a Level 4 gets the mini-boss at its end
(function(){const _mk=mkWave;mkWave=function(w){const q=_mk.apply(this,arguments);try{if(!L.demo&&ckIsMbLv(L.i)&&w===L.waves)q.push('mboss')}catch(_){}return q}})();
(function(){const _sp=spawn;spawn=function(t,at){if(t!=='mboss')return _sp.apply(this,arguments);_sp('brute',at);const e=L.en[L.en.length-1];if(e&&e.t==='brute')ckMbInit(e)}})();
function ckMbInit(e){const D=ckMbDef(L.i),dm=[.68,.82,1,1.28,1.62][S.dif]||1;
 e.mb=1;e.mbk=D[2];e.mbs=D[3];e.el=1;e.rl=null;
 e.d=Object.assign({},e.d,{l:5,sp:.62,sz:1.72});
 if(SP[D[1]]&&SP[D[1]].width){e.sp=D[1];e.fly=false}
 // 40% of this realm's boss (incl. its late-game power) and never less than 3.2 ordinary brutes of this wave
 let pw=1;try{pw=ckBossPow(Math.floor(L.i/8)*8+7).hp||1}catch(_){}
 const late=L.i>=40?1+(Math.min(L.i,99)-39)/60:1,brute=dm*45*3*(1+L.i*.15)*(1+L.wave*.15)*late;
 e.hp=e.mx=Math.round(Math.max(dm*440*(1+L.i*.16)*pw,brute*3.2));
 e.mbt=4;e.mbh=e.hp;e.mbq=TM;if(e.mbk==='heal'){e.rl='heal';e.hc=1.2/e.mbs}
 L.mbAlive=1;
 setTimeout(()=>{try{if(e.hp>0&&!L.over){window.ckBanner&&ckBanner(lvZ('小首领','MINI-BOSS'),lvZ(D[0][0],D[0][1]),1);try{CKS.bossSpawn(e)}catch(_){}L.shake=Math.max(L.shake||0,.5)}}catch(_){}},250)}
// signature moves and the half-health guards
(function(){const _up=eUp;eUp=function(e,dt){if(e.mb&&e.hp>0&&!L.demo)try{ckMbTick(e,dt)}catch(_){}return _up.apply(this,arguments)}})();
function ckMbTick(e,dt){const k=e.mbk,s=e.mbs,p=()=>eS(e);
 if(e.hp<e.mbh-.5)e.mbq=TM;e.mbh=e.hp;
 if(!e.mbg&&e.hp<e.mx*.5){e.mbg=1;for(let n=0;n<3;n++)spawn('grunt',{x:e.x+(Math.random()-.5)*.9,y:e.y+(Math.random()-.5)*.9});L.shake=Math.max(L.shake||0,.35);ckLbl(e,lvZ('召唤护卫！','GUARDS!'),'#ffd36a')}
 if(e.pro>0||e.fz>0)return;
 if(k==='regen'){if(TM-e.mbq>3&&e.hp<e.mx){e.hp=Math.min(e.mx,e.hp+e.mx*.03*s*dt);e.mbh=e.hp;if(Math.random()<dt*3){const q=p();burst(q.x,q.y-tw*.3,'#7dff9a',2,60)}}}
 else if(k==='dash'){e.mbt-=dt;if(e.mbt<=0){if(e.mbd){e.mbd=0;e.en=0;e.mbt=8/s}else{e.mbd=1;e.en=1;e.mbt=1.2;const q=p();burst(q.x,q.y,'#e8c27a',14,160);ckLbl(e,lvZ('冲刺！','DASH!'),'#ffd27a')}}}
 else if(k==='frost'){e.mbt-=dt;if(e.mbt<=0){e.mbt=4/s;const q=p(),R=2.2+.4*(s-1);vRing(q.x,q.y,tw*R,'#9ee8ff',.55,4);let n=0;for(const t of L.tr){if(!t||t.building||t.k==='wall')continue;if(Math.hypot(t.x-e.x,t.y-e.y)<R){t.st=Math.max(t.st||0,1);n++;const r=pp(t.x,t.y);burst(r.x,r.y,'#bff4ff',5,80)}}if(n)ckLbl(e,lvZ('冰霜！','FROST!'),'#bff4ff')}}
 else if(k==='shield'){e.mbt-=dt;if(e.mbt<=0){e.mbt=10;e.sh=e.msh=e.mx*.12*s;const q=p();vRing(q.x,q.y,tw*1.1,'#9fd0ff',.6,5);ckLbl(e,lvZ('护盾！','SHIELD!'),'#9fd0ff')}}
}
// rewards: crown-elite gold (from the elite rule), a short treasure burst, the split, and a stat
(function(){const _od=ckLootOnDeath;ckLootOnDeath=function(e){if(!e||!e.mb||L.demo)return _od.apply(this,arguments);if(L.over)return;ckMbDeath(e)}})();
function ckMbDeath(e){L.mbAlive=0;const sp=eS(e),D=ckMbDef(L.i);
 L.shake=Math.max(L.shake||0,.8);vFlash('#ffe08a',.25);vGlow(sp.x,sp.y,tw*2.4,'#ffd36a',.6);vRing(sp.x,sp.y,tw*2.6,'#fff1a8',.6,6);burst(sp.x,sp.y,'#ffd36a',40,260);
 window.ckBanner&&ckBanner(lvZ('小首领被击败','MINI-BOSS DEFEATED'),lvZ(D[0][0],D[0][1]),0);
 try{ckStat('mboss')}catch(_){}
 if(e.mbk==='split'){for(let k=0;k<2;k++){spawn('brute',{x:e.x+(k?.3:-.3),y:e.y+(Math.random()-.5)*.3});const c=L.en[L.en.length-1];if(c){c.hp=c.mx=e.mx*.18*e.mbs;c.pro=.35;c.el=0;c.rl=null}}ckLbl(e,lvZ('分裂！','SPLIT!'),'#ff9a5a')}
 // v5.8: same 8-second collection window as a major boss (the battle keeps going; victory waits for it)
 const replay=!!(S.prog&&S.prog[L.i]),n=replay?6:Math.round(14+L.i/8),now=performance.now(),taken=[],FLY=520;L.loot=(L.loot||[]).filter(l=>!l.boss);
 for(let k=0;k<n;k++){let t=ckRoll([56,28,12,4,0,0]);if(replay&&t>1)t=1;const pc=ckPiece(t,true,replay);
  let x=0,y=0;for(let a=0;a<12;a++){const r=.4+Math.random()*3.6,an=Math.random()*6.283;x=Math.max(-.3,Math.min(L.cols-.7,e.x+Math.cos(an)*r));y=Math.max(-.3,Math.min(L.rows-.7,e.y+Math.sin(an)*r*.85));if(taken.every(q=>Math.hypot(q[0]-x,q[1]-y)>.42))break}taken.push([x,y]);
  L.loot.push(Object.assign({x,y,tier:t,born:TM,life:null,fx:sp.x,fy:sp.y,ft0:now,fdur:FLY*(.75+Math.random()*.5),boss:1,ang:Math.random()*6.28},pc))}
 if(!replay&&Math.random()<.15)L.loot.push({x:e.x,y:e.y,tier:3,kind:'dia',amt:1,born:TM,life:null,fx:sp.x,fy:sp.y,ft0:now,fdur:FLY,boss:1});
 L.lw={t0:now+FLY,el:0,last:now,total:L.loot.filter(l=>l.boss).length,got:0,done:false,replay,mb:1};
 try{ckLootUi(true);requestAnimationFrame(ckLootLoop)}catch(_){}
 try{CKS.lootBurst(2)}catch(_){}}
// mini-boss drops stay solid, then fade in their last second (3.6 s on the field incl. the flight)
(function(){const _al=ckLootAlpha;ckLootAlpha=function(l){if(l&&l.mbw){const a=l.age||0;return a>l.life?0:a>l.life-1?Math.max(0,l.life-a):1}return _al.apply(this,arguments)}})();
// health bar and name over the mini-boss (drawn with the loot layer, above the monsters)
function ckMbDraw(){if(!L||L.demo||!L.mbAlive)return;for(const e of L.en){if(!e.mb||e.hp<=0)continue;const q=eS(e),w=tw*1.5,h=Math.max(4,tw*.09),x=q.x-w/2,y=q.y-tw*1.55,D=ckMbDef(L.i);
  c.save();c.globalAlpha=1;c.fillStyle='#000a';c.fillRect(x-2,y-2,w+4,h+4);c.fillStyle='#3a1206';c.fillRect(x,y,w,h);const f=Math.max(0,e.hp/e.mx),g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#ff9a2a');g.addColorStop(1,'#ffe066');c.fillStyle=g;c.fillRect(x,y,w*f,h);
  if(e.sh>0){c.fillStyle='#9fd0ffcc';c.fillRect(x,y,w*Math.min(1,e.sh/e.mx),h*.45)}
  c.font=`800 ${Math.max(9,tw*.2)|0}px CKSans,sans-serif`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#000c';const nm=lvZ(D[0][0],D[0][1]);c.strokeText(nm,q.x,y-4);c.fillStyle='#ffd36a';c.fillText(nm,q.x,y-4);
  const pr=.5+.5*Math.sin(TM*4);c.globalCompositeOperation='lighter';c.globalAlpha=.25+.2*pr;const r=tw*(1.05+.08*pr),gg=c.createRadialGradient(q.x,q.y,r*.3,q.x,q.y,r);gg.addColorStop(0,'#ffd36a00');gg.addColorStop(.7,'#ffb02a66');gg.addColorStop(1,'#ffb02a00');c.fillStyle=gg;c.beginPath();c.arc(q.x,q.y,r,0,7);c.fill();c.restore()}}
(function(){const _ld=ckLootDraw;ckLootDraw=function(){try{ckMbDraw()}catch(_){}return _ld.apply(this,arguments)}})();
// last-wave announcement
(function(){const _nw=nextWave;nextWave=function(){const r=_nw.apply(this,arguments);try{if(!L.demo&&ckIsMbLv(L.i)&&L.wave===L.waves){const D=ckMbDef(L.i);setTimeout(()=>toast(lvZ('⚠ 小首领来袭：','⚠ Mini-boss incoming: ')+lvZ(D[0][0],D[0][1])),900)}}catch(_){}return r}})();

// ---- treasure hoards: the Fourfold Throne bosses (levels 97-100) drop far more than 8 s allow ----
// Pieces land in heaps of several layers plus a carpet over the whole map; a tap takes only the top
// three pieces of a heap, so a hoard of 300+ can never be cleared in time.
function ckHoardLv(i){return i>=96}
(function(){const _tr=ckTreasure;ckTreasure=function(){const T=_tr.apply(this,arguments);try{if(!ckHoardLv(L.i))return T;
  const i=L.i,dm=[.7,.85,1,1.2,1.5][S.dif]||1,base=[260,300,340,400][Math.min(3,i-96)],n=Math.round(base*dm*(T.replay?.45:1)),up=(.8+i/250)*([.8,.9,1,1.15,1.3][S.dif]||1),w=CKT_W.map((x,t)=>t>=2?x*up:x);
  for(let k=T.list.length;k<n;k++){let t=ckRoll(w);if(T.replay&&t>2)t=2;T.list.push(Object.assign({tier:t},ckPiece(t,true,T.replay)))}T.hoard=1}catch(_){}return T}})();
(function(){const _lb=ckLootBurst;ckLootBurst=function(e){if(!ckHoardLv(L.i)||L.demo)return _lb.apply(this,arguments);
  // place with the normal routine, then rearrange into heaps
  const r=_lb.apply(this,arguments);try{ckHoardLayout(e)}catch(_){}return r}})();
function ckHoardLayout(e){const P=L.loot.filter(l=>l.boss);if(P.length<60)return;const C=L.cols,R=L.rows,heaps=[],nH=Math.min(14,6+(P.length/40|0));
 for(let h=0;h<nH;h++)heaps.push([.8+Math.random()*(C-1.6),.8+Math.random()*(R-1.6),.55+Math.random()*.5]);
 P.sort((a,b)=>a.tier-b.tier);   // rare pieces end up on top of the heaps more often
 P.forEach((l,k)=>{if(k%4===3){l.layer=0;return}   // a quarter stays spread over the whole map
  const H=heaps[k%nH],a=Math.random()*6.283,rr=Math.sqrt(Math.random())*H[2];l.x=Math.max(-.35,Math.min(C-.65,H[0]+Math.cos(a)*rr));l.y=Math.max(-.35,Math.min(R-.65,H[1]+Math.sin(a)*rr*.75));
  l.layer=1+(k/nH|0)%9;l.hy=l.layer*.07});
 // keep it smooth on phones: only the top layers and every 4th carpet piece sparkle
 const mxL=Math.max(...P.map(l=>l.layer||0));P.forEach((l,k)=>{l.lo=!(l.layer>=mxL-1||l.tier>=3||(!l.layer&&k%3===0))});
 L.loot.sort((a,b)=>(a.layer||0)-(b.layer||0)||a.y-b.y);
 if(L.lw){L.lw.hoard=1;L.lw.total=P.length}
 setTimeout(()=>{try{window.ckBanner&&ckBanner(lvZ('传说宝藏','LEGENDARY HOARD'),lvZ('能捡多少捡多少！','Grab all you can!'),1)}catch(_){}},700)}
// a tap on a heap takes the top three pieces only
(function(){const _tap=ckLootTap;ckLootTap=function(q,P){if(!L||!L.lw||!L.lw.hoard||L.lw.done||!P)return _tap.apply(this,arguments);
  const R=tw*.62,here=L.loot.filter(l=>l.boss&&ckLootAlpha(l)>0&&(()=>{const s2=pp(l.x,l.y);return Math.hypot(s2.x-P[0],s2.y-(P[1]+(l.hy||0)*tw))<=R})());
  if(!here.length)return _tap.apply(this,arguments);
  here.sort((a,b)=>(b.layer||0)-(a.layer||0));const take=here.slice(0,3);L.loot=L.loot.filter(l=>!take.includes(l));let top=0;for(const l of take){ckGrant(l);top=Math.max(top,l.tier);L.lw.got++}
  try{CKS.pickup(top)}catch(_){}ckVibe(top>=4?[25,40,45]:12+top*6);burst(P[0],P[1],CKT[top].c,8+top*4,140);if(top>=3)vRing(P[0],P[1],tw*.9,CKT[top].c,.5,4);ckLootUi(true);return true}})();
// heaps: higher layers are drawn a little higher up so the pile has height
(function(){const _pp0=null;const _ld=ckLootDraw;ckLootDraw=function(){if(!L||!L.lw||!L.lw.hoard)return _ld.apply(this,arguments);
  const sv=[];for(const l of L.loot)if(l.hy){sv.push([l,l.y]);l.y-=l.hy}try{return _ld.apply(this,arguments)}finally{for(const[l,y]of sv)l.y=y}}})();

// ---- realm art: v5.8 uses the painted realm cards (CK_RIMG, one per realm incl. the Throne) ----
function ckRArt(r){const i=R.indexOf(r);return (typeof CK_RIMG!=='undefined'&&CK_RIMG[i])||SPRD['m_'+r.m]||SPRD.m_sky}
