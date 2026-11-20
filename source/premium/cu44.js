function cuUpgrade(k){progressStats();const n=cuLv(k);if(n>=CU_MAX||n>=cuCap())return;const sc=CU_STAR[n],gc=CU_GOLD[n],dc=cuDia(n);
 if(!(cheat()||starsTotal()+(S.bonusStars||0)-(S.ss|0)>=sc)||!Economy.canSpendWallet(gc)||(!cheat()&&(S.diamonds||0)<dc)){toast(LANG==='zh'?'强化资源不足，无法升级':'Not enough resources to upgrade');return}
 if(!Economy.spendWallet(gc))return;if(typeof L!=='undefined'&&L&&L.g0!=null&&S.mode==='play')L.g0=Math.max(0,L.g0-gc);if(!cheat()){S.ss=(S.ss|0)+sc;S.diamonds=Math.max(0,(S.diamonds||0)-dc)}S.cu[k]=n+1;save();try{sfx('perfect',.5)}catch(e){}cuOpen(k,true)}
// v4.4: attributes go to level 30. Levels 11-30 unlock with the commander level (one per two levels).
// Attack/Defense keep +1% per level; Crit +2% to level 10, then +1%; Build Speed reaches 1 s at 10,
// then each level adds +1.5% gold from kills.
function cuOpen(k,flash){
 cuSel=k||cuSel;k=cuSel;progressStats();const zh=LANG==='zh',D=CUD[k],n=cuLv(k),max=n>=CU_MAX,lv=plLevel(),cap=cuCap(lv),lock=!max&&n>=cap;
 const isP=k==='a'||k==='d',base=isP?Math.round(lvBonus(lv)*100):0,cur=isP?base+n:n,nxt=cur+1,sc=CU_STAR[n],gc=CU_GOLD[n],dc=cuDia(n);
 const bStep=(BUILD_BASE-BUILD_MIN)/10,fb=x=>+(BUILD_BASE-Math.min(10,x)*bStep).toFixed(1),bg=x=>Math.max(0,x-10)*1.5;
 const fv=x=>k==='b'?(x<=10?fb(x)+(zh?'秒':'s'):fb(x)+(zh?'秒':'s')+' · +'+bg(x)+'%'):k==='c'?ckCritPct(x)+'%':'+'+x+'%';
 const upl=isP?'+1%':k==='b'?(n<10?'−'+bStep.toFixed(1)+(zh?'秒':'s'):'+1.5% '+(zh?'击杀金币':'kill gold')):(n<10?'+'+CRIT_PCT+'%':'+1%');
 const brk=isP?`<span>${zh?'等级加成':'Rank'} +${base}%</span><span>${zh?'强化加成':'Upgrade'} +${n}%</span>`:k==='b'?`<span>${zh?'建造':'Build'} ${fb(n)}${zh?'秒':'s'}</span><span>${zh?'击杀金币':'Kill gold'} +${bg(n)}%</span>`:`<span>${zh?'基础':'Base'} 0%</span><span>${zh?'强化':'Upgrade'} +${ckCritPct(n)}%</span>`;
 const tail=zh?`强化等级上限 ${CU_MAX}：前 10 级随时可强化，之后每提升 2 级统帅等级解锁 1 级（当前上限 ${cap}）。星星来自关卡通关评价，强化会消耗星星，但不影响关卡进度。`:`Upgrades go to level ${CU_MAX}: the first 10 are always open, then each 2 commander levels unlock one more (your limit now: ${cap}). Stars come from level ratings; spending them does not affect level progress.`;
 const note=(k==='b'?(zh?`前 10 级每级缩短 ${bStep.toFixed(1)} 秒建造时间（${BUILD_BASE} 秒 → ${BUILD_MIN} 秒）；第 11–30 级每级击杀金币 +1.5%（最高 +30%）。`:`Levels 1-10 each cut ${bStep.toFixed(1)}s off build time (${BUILD_BASE}s → ${BUILD_MIN}s); levels 11-30 each add +1.5% gold from kills (up to +30%).`):k==='c'?(zh?`前 10 级每级 +${CRIT_PCT}% 暴击率，第 11–30 级每级 +1%（最高 40%）。暴击造成双倍伤害。`:`Levels 1-10 each add +${CRIT_PCT}% crit rate, levels 11-30 add +1% each (up to 40%). Crits deal double damage.`):(zh?'每级永久 +1%，最高强化 30 级（+30%）。':'Each level is a permanent +1%, up to level 30 (+30%).'))+' '+tail;
 const haveS=cheat()?Infinity:starsTotal()+(S.bonusStars||0)-(S.ss|0),haveG=Economy.walletBalance(),haveD=cheat()?Infinity:(S.diamonds||0),okS=max||haveS>=sc,okG=max||haveG>=gc,okD=max||haveD>=dc,can=!max&&!lock&&okS&&okG&&okD;
 const fmt=v=>v===Infinity?'∞':Math.max(0,v).toLocaleString();
 const tab=x=>`<button type="button" class="cu-tab ${x} ${k===x?'on':''}" data-cut="${x}"><em>${CUD[x].ico}</em>${zh?CUD[x].zn:CUD[x].en}<small>Lv.${cuLv(x)}/${CU_MAX}</small></button>`;
 // three tiers of ten pips (gold 1-10, sapphire 11-20, amethyst 21-30); locked levels are dimmed
 let pp='';for(let t=0;t<3;t++){pp+=`<div class="cu-tier t${t}">`;for(let i=t*10;i<t*10+10;i++)pp+=`<i class="${i<n?'on':''} ${i>=cap?'lk':''} ${flash&&i===n-1?'pop':''}">${i+1}</i>`;pp+='</div>'}
 const need=lock?10+2*(n+1-10):0;
 const h=`<h2 class="f">${zh?'加成强化':'Bonus Upgrade'}</h2><div class="cu">
 <div class="cu-tabs">${tab('a')}${tab('d')}${tab('b')}${tab('c')}</div>
 <div class="cu-card k-${k} ${flash?'flash':''}"><div class="cu-ico">${D.ico}</div><div class="cu-name">${zh?D.zn:D.en}</div>
  <div class="cu-val"><b>${fv(cur)}</b>${max?'':`<span>›</span><b class="nx">${fv(nxt)}</b>`}</div>
  <div class="cu-desc">${zh?D.zd:D.ed}${isP?' '+cur+'%':''}</div>
  <div class="cu-break">${brk}</div>
  <div class="cu-pips cu-p30">${pp}</div>
  ${max?`<div class="cu-max">${zh?'已强化至满级':'Fully upgraded'}</div>`:lock?`<div class="cu-max cu-lock">🔒 ${zh?'统帅等级 Lv.'+need+' 解锁下一级':'Next level unlocks at Commander Lv.'+need}</div>`:`<div class="cu-lab">${zh?'下一级强化消耗':'Next upgrade cost'}</div><div class="cu-cost"><div class="${okS?'ok':'no'}"><em>${ckResIcon('star')}</em><b>${sc}</b><small>${zh?'持有':'Have'} ${fmt(haveS)}</small></div><div class="${okG?'ok':'no'}"><em>${ckResIcon('coin')}</em><b>${gc.toLocaleString()}</b><small>${zh?'持有':'Have'} ${fmt(haveG)}</small></div>${dc?`<div class="${okD?'ok':'no'}"><em>${ckResIcon('diamond')}</em><b>${dc}</b><small>${zh?'持有':'Have'} ${fmt(haveD)}</small></div>`:`<div class="cu-free"><em>${ckResIcon('diamond')}</em><b>0</b><small>${zh?'前四级免费':'Free · first 4 levels'}</small></div>`}</div>`}
  <button type="button" class="cu-go ${can?'':'off'}" id="cugo" ${max||lock?'disabled':''}>${max?(zh?'已满级':'MAX'):lock?('🔒 Lv.'+need):can?((zh?'强化 ':'Upgrade ')+upl):(!okS?(zh?'星星不足':'Not enough stars'):!okG?(zh?'金币不足':'Not enough coins'):(zh?'钻石不足':'Not enough diamonds'))}</button></div>
 ${ckCuExtra(k)}<div class="cu-note">${note}</div></div>
 <button class="bt g" id="m1">${zh?'返回档案':'Back'}</button>`;
 modal(h,()=>{openProfile()});
 const b=document.getElementById('cugo');if(b&&!max&&!lock)b.onclick=()=>cuUpgrade(k);{const r=document.getElementById('ckrune');if(r)r.onclick=()=>{if(ckUseRune(k))cuOpen(k,true)};const x=document.getElementById('ckxch');if(x)x.onclick=()=>{if(ckExchange())cuOpen(k)}}
 document.querySelectorAll('#mbox [data-cut]').forEach(t=>t.onclick=()=>cuOpen(t.dataset.cut));
}
