/* ===== Chaos Kingdoms v3.0 · strategic depth =====
   Enemy roles + damage types, designed waves with a preview, tower combos,
   shrines and portal corruption, boss weaknesses, crowns.
   Runs inside the main game script (shares L, S, TW, etc). */
const CKDT={arrow:'p',cannon:'p',mage:'m',holy:'m',zap:'m',ice:'e',toxin:'e'};
const CKDTN={p:['物理','Physical'],m:['魔法','Magic'],e:['元素','Elemental']};
const CKR={
 armor:{g:'⛨',c:'#c9d2e0',lv:3,n:['重甲','Armoured'],tip:['重甲：物理伤害减半（箭塔、炮塔）。用法师、圣光或闪电塔。','Armoured: physical damage (Archer, Cannon) is halved. Use Mage, Holy or Lightning.']},
 ward:{g:'✦',c:'#7ab8ff',lv:6,n:['结界','Warded'],tip:['结界：魔法伤害减半（法师、圣光、闪电）。用箭塔、炮塔、冰霜或毒塔。','Warded: magic damage (Mage, Holy, Lightning) is halved. Use Archer, Cannon, Frost or Poison.']},
 heal:{g:'✚',c:'#7dff9a',lv:9,n:['医者','Healer'],tip:['医者：持续治疗附近的敌人。先击杀它！','Healer: keeps mending nearby enemies. Kill it first!']},
 shield:{g:'◈',c:'#ffd36a',lv:13,n:['盾卫','Shield-bearer'],tip:['盾卫：护盾先承受伤害。炮塔对护盾造成双倍伤害。','Shield-bearer: a shield soaks damage first. Cannons deal double damage to shields.']},
 split:{g:'✷',c:'#d39bff',lv:17,n:['分裂者','Splitter'],tip:['分裂者：死亡时分裂成两个快速小怪。用范围伤害收尾。','Splitter: bursts into two fast runners on death. Finish them with area damage.']},
 disr:{g:'ϟ',c:'#ff6b6b',lv:23,n:['干扰者','Disruptor'],tip:['干扰者：会让附近的塔短暂失灵。在射程边缘击杀它。','Disruptor: briefly jams nearby towers. Kill it at long range.']}
};
const CKCH=[
 {id:'noleak',n:['无漏','Flawless'],d:['不失去任何生命','Lose no lives']},
 {id:'cap',n:['精兵','Lean army'],d:['同时最多 {0} 座塔','Never have more than {0} towers']},
 {id:'noitem',n:['自力','Self-reliant'],d:['不使用任何道具','Use no items']},
 {id:'ban',n:['禁用','Restriction'],d:['不建造{0}','Build no {0}']}
];
let CK_NR=null;
function ckIU(id){if(L&&L.iu)L.iu[id]=(L.iu[id]||0)+1}
const ckZ=a=>lvZ(a[0],a[1]);
function ckCell(x,y){return L.g[y*L.cols+x]}
function ckChal(i){const c=CKCH[(i*7+3)%CKCH.length];const o={id:c.id,n:c.n,d:c.d,a:''};if(c.id==='cap')o.a=6+(i/12|0);if(c.id==='ban'){const k=['cannon','mage','arrow','holy','ice','zap','toxin'][(i/5|0)%7];o.k=k;o.a=TL(TW[k].n)}return o}
function ckChalTxt(c){return ckZ(c.d).replace('{0}',c.a)}
function ckV3Init(){
 L.ckv=L;L.iu={};L.mtw=0;S.crown=S.crown||{};S.seenR=S.seenR||{};
 L.ch=ckChal(L.i);L.chOk=true;
 // shrines: two empowered tiles beside the road, away from portals (from level 5)
 if(L.i>=4&&L.g){const r=rng(L.i*331+17),G=L.goals||[],seg=(q,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy||1,k=Math.max(0,Math.min(1,((q.x-a[0])*dx+(q.y-a[1])*dy)/l));return Math.hypot(a[0]+k*dx-q.x,a[1]+k*dy-q.y)};
  const free=q=>!q.p&&!q.ob&&!q.sp&&!q.nb&&!q.rv&&!q.wtr&&!q.sw&&!q.tw&&L.portals.every(p=>Math.hypot(p[0]-q.x,p[1]-q.y)>=3.5)&&G.every(g=>Math.hypot(g[0]-q.x,g[1]-q.y)>=2.5);
  let cand=L.g.filter(q=>free(q)&&(L.g.some(o=>o.p&&Math.abs(o.x-q.x)+Math.abs(o.y-q.y)===1)||L.portals.some(p=>G.some(g=>seg(q,p,g)<1.6))));if(cand.length<2)cand=L.g.filter(free);
  for(let k=0;k<2&&cand.length;k++){const q=cand.splice(r()*cand.length|0,1)[0];q.shr=1;for(let j=cand.length-1;j>=0;j--)if(Math.hypot(cand[j].x-q.x,cand[j].y-q.y)<4)cand.splice(j,1)}}
 L.ckN=(L.ckN||0)+1;
 setTimeout(()=>{if(L&&L.ckv===L&&!L.over&&!L.demo&&L.ch)toast('👑 '+ckZ(L.ch.n)+' · '+ckChalTxt(L.ch))},3800);
}
// terrain multiplier [damage, range] for a tower
function ckTerr(t){if(!L||L.demo||!L.g||L.ckv!==L||t.x==null)return CK_T1;if(t._tfN===L.ckN&&t._tfL===L)return t._tf;let dm=1,rg=1;const q=ckCell(t.x,t.y);if(q&&q.shr){dm*=1.2;rg*=1.1}if(L.i>=4&&L.portals.some(p=>Math.hypot(p[0]-t.x,p[1]-t.y)<2.5))dm*=.85;t._tf=[dm,rg];t._tfN=L.ckN;t._tfL=L;return t._tf}
const CK_T1=[1,1];
function ckLbl(e,s,col){if(e.lbt>TM)return;e.lbt=TM+.9;const p=eS(e);txt(p.x,p.y-tw*.85,s,col||'#fff')}
function ckRole(e){
 if(L.demo)return;
 if(L.ckv!==L)ckV3Init();
 if(e.t==='boss'){const ty=['m','p','e'][(L.i/8|0)%3];e.bw=ty;e.adt={p:0,m:0,e:0};e.adw=10;setTimeout(()=>{if(e.hp>0&&!L.over)toast(lvZ('首领弱点：'+CKDTN[ty][0]+'伤害 +30%','Boss weakness: '+CKDTN[ty][1]+' damage +30%'))},2600);return}
 const r=CK_NR;if(!r||!CKR[r])return;e.rl=r;
 if(r==='shield')e.sh=e.msh=e.mx*.45;
 if(r==='heal')e.hc=1.2;
 if(r==='disr')e.dt=4+Math.random()*3;
 if(!S.seenR[r]){S.seenR[r]=1;const R0=CKR[r];setTimeout(()=>toast(R0.g+' '+ckZ(R0.tip)),400)}
}
// damage pipeline: types, resistances (capped at 50%), combos, shields
function ckRes(e,d,src){
 if(L.demo)return d;
 const ty=src&&CKDT[src];let m=1,res=1;
 if(ty){
  if(e.rl==='armor'&&ty==='p')res*=e.ab>0?.75:.5;
  if(e.rl==='ward'&&ty==='m')res*=e.ab>0?.75:.5;
  if(e.t==='boss'){if(ty===e.bw)m*=1.3;if(e.bad===ty)res*=.65;if(e.adt)e.adt[ty]+=d}
  if(e.fz>0&&(src==='arrow'||src==='cannon')){m*=1.4;ckLbl(e,lvZ('碎冰','SHATTER'),'#bff4ff')}
  if(src==='holy'){if(!(e.mk>0))ckLbl(e,lvZ('圣印','MARKED'),'#ffe08a');e.mk=Math.max(e.mk||0,3)}
  if(src==='mage'&&(e.rl==='armor'||e.rl==='ward'||e.sh>0)){if(!(e.ab>0))ckLbl(e,lvZ('奥术破甲','ARCANE BREAK'),'#d9b8ff');e.ab=3}
 }
 if(e.mk>0)m*=1.2;
 d*=m*Math.max(.5,res);
 if(e.sh>0){const f=src==='cannon'?2:ty==='e'?.5:1,take=Math.min(e.sh,d*f);e.sh-=take;d-=take/f;if(e.sh<=0){e.sh=0;const p=eS(e);burst(p.x,p.y,'#ffd36a',10);ckLbl(e,lvZ('护盾破碎','SHIELD BROKEN'),'#ffd36a');e.lbt=0}if(d<=0){e.fl=.1;return 0}}
 return d;
}
function ckOnDeath(e){
 if(L.demo)return;
 if(e.rl==='split'){for(let k=0;k<2;k++){spawn('runner',{x:e.x+(k?.25:-.25),y:e.y+(Math.random()-.5)*.3});const c=L.en[L.en.length-1];c.hp=c.mx=c.mx*.35;c.pro=.35;c.el=0;c.rl=null}}
}
// designed waves: deterministic per level and wave, themed by pattern and realm
function ckWave(w){
 if(L.boss&&w===L.waves)return null;
 const i=L.i,r=rng(i*1013+w*97+7),n=5+w*2+(i/3|0),q=[];
 const roles=Object.keys(CKR).filter(k=>i>=CKR[k].lv),fav=roles.length?roles[(i/8|0)%roles.length]:null;
 const pat=w===1?'mixed':['mixed','swarm','column','escort','mixed','column','swarm'][(w*3+i)%7];
 const rr=i<3?0:Math.min(.4,.1+i*.004);let heal=0,disr=0;
 for(let k=0;k<n;k++){
  let t,x=r();
  if(pat==='swarm')t=x<.7?'runner':'grunt';
  else if(pat==='column')t=x<.35+i*.002?'brute':'grunt';
  else if(pat==='escort')t=x<.2?'brute':x<.4?'runner':'grunt';
  else t=x<.2+i*.004?'runner':x>.85-w*.03-i*.004?'brute':'grunt';
  let ro=null;
  if(roles.length&&r()<rr){ro=r()<.5&&fav?fav:roles[r()*roles.length|0];
   if(t==='runner'&&ro!=='armor'&&ro!=='ward')ro=r()<.5?'armor':'ward';
   if(!CKR[ro]||i<CKR[ro].lv)ro=null;
   if(ro==='heal'&&++heal>2)ro=null;if(ro==='disr'&&++disr>2+(i/30|0))ro=null}
  q.push(ro?t+'|'+ro:t)
 }
 if(pat==='escort'&&roles.includes('heal')&&!q.some(s=>s.endsWith('|heal'))){q[n>>1]='grunt|heal'}
 return q
}
function ckWaveSum(q){const o={n:q.length,b:0,r:{}};for(const s of q){const[t,ro]=s.split('|');if(t==='boss')o.b++;if(ro)o.r[ro]=(o.r[ro]||0)+1}return o}
let ckUiT=0,ckChip=null;
function ckV3Tick(dt){
 if(L.ckv!==L)ckV3Init();
 // item use tracking (per-level stock) and challenge bookkeeping
 let nt=0;for(const t of L.tr)if(t&&t.k!=='wall')nt++;L.mtw=Math.max(L.mtw,nt);
 if(L.chOk&&L.ch){const c=L.ch.id;if((c==='noleak'&&L.lives<L.mxl)||(c==='cap'&&L.mtw>L.ch.a)||(c==='noitem'&&Object.keys(L.iu).length)||(c==='ban'&&L.tr.some(t=>t&&t.k===L.ch.k))){L.chOk=false;toast('👑 '+lvZ('挑战失败：','Crown lost: ')+ckChalTxt(L.ch))}}
 for(const e of L.en){
  if(e.hp<=0)continue;
  if(e.mk>0)e.mk-=dt;if(e.ab>0)e.ab-=dt;
  if(e.rl==='heal'&&e.pro<=0){e.hc-=dt;if(e.hc<=0){e.hc=1.2;let n=0;for(const o of L.en)if(o!==e&&o.hp>0&&o.hp<o.mx&&Math.abs(o.x-e.x)<1.7&&Math.abs(o.y-e.y)<1.7){o.hp=Math.min(o.mx,o.hp+o.mx*(o.t==='boss'?.006:.045));n++}if(n){const p=eS(e);vRing(p.x,p.y,tw*1.7,'#7dff9a',.45,2)}}}
  if(e.rl==='disr'&&e.pro<=0&&!(e.fz>0)){e.dt-=dt;if(e.dt<=0){let best=null,bd=2.3;for(const t of L.tr){if(!t||t.building||t.k==='wall')continue;const d=Math.hypot(t.x-e.x,t.y-e.y);if(d<bd){bd=d;best=t}}if(best){best.st=Math.max(best.st||0,1.6);const s=pp(best.x,best.y);vRing(s.x,s.y,tw*.6,'#ff6b6b',.5,3);ckLbl(e,lvZ('干扰！','JAMMED!'),'#ff8a8a');e.dt=7}else e.dt=1}}
  if(e.t==='boss'&&e.adt&&L.i>=39&&e.pro<=0){e.adw-=dt;if(e.adw<=0){e.adw=10;const a=e.adt,ty=a.p>=a.m&&a.p>=a.e?'p':a.m>=a.e?'m':'e';if(a[ty]>0&&ty!==e.bw&&ty!==e.bad){e.bad=ty;toast(lvZ('首领适应了'+CKDTN[ty][0]+'伤害（-35%）','The boss adapts to '+CKDTN[ty][1]+' damage (-35%)'))}e.adt={p:0,m:0,e:0}}}
 }
 if(L.wave===0&&!L.nq)L.nq={w:1,q:mkWave(1)};
 ckUiT-=dt;if(ckUiT<=0){ckUiT=.25;ckV3Ui()}
}
function ckV3Ui(){
 if(!ckChip){const bb=document.getElementById('ck-bossbar');if(!bb)return;ckChip=document.createElement('div');ckChip.id='ck-v3';bb.parentNode.appendChild(ckChip)}
 const rail=document.getElementById('rail'),host=ckChip.parentNode;if(!rail||!host)return;
 const hr=host.getBoundingClientRect(),rr=rail.getBoundingClientRect(),cvE=document.getElementById('cv');
 // sit in the empty strip between the battlefield frame and the build bar (outside the map);
 // on screens where that strip is thinner than the chip, the chip is scaled down to fit it.
 const sc=hr.height/(host.offsetHeight||hr.height)||1; // host may be CSS-scaled on small screens
 let top=(rr.top-hr.top)/sc-30,zs=1;
 if(cvE&&W){const cr=cvE.getBoundingClientRect(),k=cr.height/H,bb=(cr.top-hr.top)/sc+(oy+(port?L.cols:L.rows)*tw+9)*k/sc,rt=(rr.top-hr.top)/sc,gap=rt-bb,ch=ckChip.offsetHeight||24;
  if(gap>=10){zs=Math.min(1,(gap-2)/ch);top=bb+(gap-ch*zs)/2}else top=bb-9-ch-6}
 ckChip.style.transform=zs<1?'scale('+zs.toFixed(3)+')':'';ckChip.style.top=Math.max(40,top)+'px';
 let h='';
 const nq=L.wave<L.waves?L.nq:null;
 if(nq&&nq.q){const o=ckWaveSum(nq.q);h+=`<span class="nw"><i>${lvZ('下一波','Next')}</i> ${o.b?'👑 '+lvZ('首领','Boss'):o.n}${Object.keys(o.r).map(k=>` <em style="color:${CKR[k].c}">${CKR[k].g}${o.r[k]}</em>`).join('')}</span>`}
 if(L.ch){h+=`<span class="cr ${L.chOk?'':'x'}${S.crown&&S.crown[L.i]?' got':''}">👑 ${ckZ(L.ch.n)}<i>${ckChalTxt(L.ch)}</i></span>`}
 if(ckChip._h!==h){ckChip._h=h;ckChip.innerHTML=h}
 ckChip._has=!!h;ckChipVis();
}
// ground layer: shrines and portal corruption
function ckV3Ground(){
 if(!L||L.demo||L.ckv!==L)return;
 const u=tw/100;
 if(L.i>=4){c.save();c.setLineDash([5*u,6*u]);c.lineWidth=Math.max(1,2*u);c.strokeStyle='rgba(190,90,255,.35)';for(const p of L.portals){const s=pp(p[0],p[1]);c.beginPath();c.arc(s.x,s.y,2.5*tw,0,7);c.stroke()}c.restore()}
 for(const q of L.g){if(!q.shr)continue;const s=pp(q.x,q.y),a=.55+.25*Math.sin(TM*2.4+q.x);c.save();c.globalAlpha=a;c.strokeStyle='#ffd36a';c.lineWidth=Math.max(1.5,3*u);c.beginPath();c.arc(s.x,s.y,tw*.4,0,7);c.stroke();c.beginPath();for(let k=0;k<6;k++){const an=k*Math.PI/3+TM*.4;c.moveTo(s.x+Math.cos(an)*tw*.18,s.y+Math.sin(an)*tw*.18);c.lineTo(s.x+Math.cos(an)*tw*.36,s.y+Math.sin(an)*tw*.36)}c.stroke();c.globalAlpha=a*.35;c.fillStyle='#ffd36a';c.beginPath();c.arc(s.x,s.y,tw*.4,0,7);c.fill();c.restore()}
}
// role badges, shield bar, mark reticle (drawn above an enemy's health bar)
function ckRoleBadge(e,p,bw,by){
 if(e.sh>0&&e.msh){c.fillStyle='#0a0f24';c.fillRect(p.x-bw/2-1,by-6,bw+2,5);c.fillStyle='#ffd36a';c.fillRect(p.x-bw/2,by-5,bw*e.sh/e.msh,3)}
 const R0=e.rl&&CKR[e.rl];
 if(R0||e.bw){const r=Math.max(7,tw*.16),x=p.x-bw/2-r-1,y=by+2;c.fillStyle='#0a0f24e6';c.beginPath();c.arc(x,y,r,0,7);c.fill();c.strokeStyle=R0?R0.c:'#ffd36a';c.lineWidth=1.5;c.stroke();c.fillStyle=R0?R0.c:'#ffd36a';c.font=`900 ${r*1.3|0}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(R0?R0.g:({p:'⚔',m:'✦',e:'❄'})[e.bw],x,y+.5)}
 if(e.mk>0){c.strokeStyle='#ffe08aaa';c.lineWidth=1.5;c.beginPath();c.arc(p.x,p.y-tw*.05,tw*.32,0,7);c.stroke()}
}
// crowns: an optional challenge per level, rewarded once
function ckCrownEval(){if(!L.ch||L.demo)return;L.chWin=L.chOk;L.chNew=false;L.chGold=0;S.crown=S.crown||{};if(L.chOk&&!S.crown[L.i]){S.crown[L.i]=1;L.chNew=true;L.chGold=Math.round(150+L.i*10);Economy.grantWallet(L.chGold)}}
function ckCrownHtml(){if(!L.ch)return '';return `<p class="ck-crown ${L.chWin?'ok':'no'}">👑 ${ckZ(L.ch.n)} · ${ckChalTxt(L.ch)} — ${L.chWin?(L.chNew?lvZ('达成！+','Earned! +')+L.chGold:lvZ('已达成','Done')):lvZ('未达成','Missed')}</p>`}

function ckInBattle(){const hud=document.getElementById('hud');return typeof L!=='undefined'&&!!L&&!L.demo&&!L.over&&S.mode==='play'&&!!hud&&hud.classList.contains('on')}
// keep the battle chip off every non-battle screen (map, menus, demo, result panels)
// Visibility is checked on its own timer, because the game loop (which refreshes the chip's
// content) stops while the shop, pause menu or any popup is open.
function ckChipCovered(){
 if(mOpen||tab==='s')return true;
 for(const id of ['shop','hp','modal']){const e=document.getElementById(id);if(e&&!e.hidden&&(id!=='modal'||e.classList.contains('on'))&&getComputedStyle(e).display!=='none')return true}
 // anything else drawn over the chip's spot (tower panel, tips, profile, other overlays)
 const r=ckChip.getBoundingClientRect();if(!r.width||!r.height)return false;
 const y=r.top+r.height/2;for(const x of [r.left+4,r.left+r.width/2,r.right-4]){const e=document.elementFromPoint(x,y);if(e&&e.id!=='cv')return true}
 return false}
function ckChipVis(){if(!ckChip)return;const show=!!ckChip._has&&ckInBattle();ckChip.hidden=!show;if(show)ckChip.style.visibility=ckChipCovered()?'hidden':''}
setInterval(ckChipVis,120);
