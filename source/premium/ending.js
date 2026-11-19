/* ===== Chaos Kingdoms v3.6 · Level 100 ending =====
   After winning Level 100: every monster and boss is introduced one by one, from the earliest to the
   latest level, 3 seconds each (name, level, role and a short description), then a group portrait of
   the whole legion, a thank-you message, and a closing message about difficulty. */
const CK_DEX={
 e_goblin:['哥布林袭击者','Goblin Raider','狡猾又贪婪，总是成群结队地冲向你的防线。','Sly and greedy, it rushes your walls in noisy packs.'],
 e_orc:['兽人斗士','Orc Brawler','皮糙肉厚的前线战士，靠蛮力撕开缺口。','A thick-skinned frontliner that bashes open any gap.'],
 e_skeleton:['骷髅战士','Skeleton Warrior','不知疼痛的亡灵士兵，骨头碎了还会继续前进。','An undead soldier that feels no pain and never stops marching.'],
 e_zombie:['腐尸','Zombie','步履蹒跚却永不停歇，数量多得令人窒息。','Slow and shambling, but endless in number.'],
 e_spider:['巨型蜘蛛','Giant Spider','从阴影中窜出的八足猎手，速度惊人。','An eight-legged hunter that darts out of the shadows.'],
 e_wolf:['恐狼','Dire Wolf','嚎叫声划破夜空，疾驰如风的掠食者。','A howling predator that runs like the wind.'],
 e_troll:['冰霜巨魔','Frost Troll','力大无穷，伤口会在寒气中慢慢愈合。','Immensely strong; its wounds close in the cold.'],
 e_ogre:['食人魔','Ogre','笨重的巨兽，一拳就能砸塌城墙。','A lumbering giant whose fist can flatten a wall.'],
 e_dknight:['暗黑骑士','Dark Knight','身披黑铁重甲的堕落骑士，几乎刀枪不入。','A fallen knight in black iron, nearly unbreakable.'],
 e_vampire:['吸血鬼','Vampire','优雅而致命，嘶鸣着扑向猎物。','Elegant and deadly, it hisses before it strikes.'],
 e_demon:['小恶魔','Imp Demon','来自深渊的捣蛋鬼，笑声令人毛骨悚然。','A mischief-maker from the abyss with a chilling laugh.'],
 e_dragon:['幼龙','Wyrmling','会飞的小龙，越过一切障碍直扑基地。','A young flying dragon that soars over every obstacle.'],
 e_mystic:['秘法师','Mystic','吟唱古老咒语的神秘法师。','A hooded mage chanting forgotten spells.'],
 e_shaman:['萨满','Shaman','以图腾之力鼓舞同伴的部落祭司。','A tribal priest who rallies its kin with totem magic.'],
 e_assassin:['暗影刺客','Shadow Assassin','来无影去无踪，转眼就到你面前。','Here and gone in a blink of shadow.'],
 e_necro:['死灵学徒','Necro Acolyte','操纵亡魂的邪恶学徒。','A dark apprentice who commands restless spirits.'],
 e_golem:['石像魔','Stone Golem','由岩石构成的守卫，沉重而坚固。','A guardian of living rock, heavy and tireless.'],
 e_ghost:['幽灵','Ghost','穿墙而过的怨灵，在空中飘荡。','A wailing spirit that drifts over everything.'],
 b2_skeleton_king:['骷髅王','Skeleton King','统御亡灵大军的骸骨君王。','Monarch of bones, ruler of the undead legion.'],
 b2_demon_lord:['恶魔领主','Demon Lord','展开烈焰双翼的地狱统帅。','A warlord of hell on burning wings.'],
 b2_ice_dragon:['冰霜巨龙','Ice Dragon','一口寒息就能冻结整片战场。','One breath of frost freezes the whole battlefield.'],
 b2_fire_giant:['炎魔巨人','Fire Giant','熔岩铸成的巨人，所到之处尽成焦土。','A giant of molten rock that scorches the earth.'],
 b2_dragon_king:['龙王','Dragon King','万龙之王，烈焰与鳞甲的化身。','King of all dragons, wrapped in scale and flame.'],
 b2_necromancer:['死灵法师','Necromancer','唤醒死者为其征战的黑暗术士。','A dark sorcerer who raises the dead to fight.'],
 b2_lich_king:['巫妖王','Lich King','以灵魂之火维系不朽的冰冷君主。','A cold sovereign kept immortal by soul-fire.'],
 b2_spider_queen:['蛛后','Spider Queen','万千蜘蛛的母后，编织死亡之网。','Mother of a thousand spiders, weaver of doom.'],
 b2_storm_titan:['风暴泰坦','Storm Titan','驾驭雷霆的远古巨人。','An ancient giant who commands the thunder.'],
 b2_forest_ent:['远古树人','Forest Ent','沉睡千年的森林守护者，愤怒时大地震颤。','A thousand-year forest guardian; the ground shakes at its wrath.'],
 b2_stone_golem:['黑曜巨像','Obsidian Colossus','坚不可摧的岩石巨像。','An unbreakable colossus of living stone.'],
 b2_demon_beast:['深红巨兽','Crimson Behemoth','长着獠牙与犄角的地狱巨兽。','A horned, tusked behemoth of the underworld.'],
 b2_void_lord:['虚空之主','Void Lord','来自虚空裂隙的水晶魔君。','A crystal tyrant from the rift of the void.'],
 b2_giant_worm:['永恒巨蠕','Eternal Wyrm','吞噬一切的巨口深渊之虫。','An abyssal worm whose maw devours everything.'],
 b2_death_knight:['死亡骑士','Death Knight','手持冰霜巨剑的不死骑士统领。','An undying knight-commander with a frost blade.'],
 b2_sea_monster:['深渊泰坦','Abyssal Titan','从深海升起的触手魔神。','A tentacled titan risen from the deep sea.'],
 b2_vampire_lord:['血族领主','Vampire Lord','举杯畅饮鲜血的不朽伯爵。','An immortal count who toasts with blood.'],
 b2_ogre_king:['食人魔王','Ogre King','挥舞狼牙棒的食人魔之王。','King of ogres, swinging a spiked club.'],
 b2_dread_knight:['恐惧骑士','Dread Knight','死亡骑士的孪生兄弟，同样冷酷无情。','The Death Knight’s grim twin, just as merciless.']
};
const CK_ROLE={grunt:['步兵','Footsoldier'],runner:['疾行者','Swift'],brute:['重装','Brute'],fly:['飞行','Flying'],boss:['首领','Boss'],mate:['首领同伴','Boss companion']};
// all monsters and bosses, ordered by the first level they appear on
function ckRoster(){const first={},role={};
 for(let i=0;i<100;i++){const pl=(POOL[i/8|0]||POOL[5]);for(const t of ['grunt','runner','brute'])for(const k of (pl[t]||[]))if(first[k]==null){first[k]=i;role[k]=t}}
 for(const k of ['e_ghost','e_dragon'])if(first[k]==null||first[k]>4){first[k]=4;role[k]='fly'}else role[k]='fly';
 const out=Object.keys(first).filter(k=>CK_DEX[k]&&SP[k]).map(k=>({k,lv:first[k],role:role[k],o:0}));
 const bl=[7,15,23,31,39,47,55,63,71,79,87,95,96,97,98,99];bl.forEach((i,n)=>{const k=BOSSK[i>=96?13+(i-96):i/8|0];if(CK_DEX[k]&&!out.some(x=>x.k===k))out.push({k,lv:i,role:'boss',o:1})});
 for(const k of ['b2_vampire_lord','b2_ogre_king','b2_dread_knight'])if(CK_DEX[k]&&SP[k]&&!out.some(x=>x.k===k))out.push({k,lv:39,role:'mate',o:2});
 return out.sort((a,b)=>a.lv-b.lv||a.o-b.o)}
const CK_END_CSS=`#ck-end{position:fixed;inset:0;z-index:10050;overflow:hidden;color:#f4ead2;font-family:Nunito,system-ui,sans-serif;background:radial-gradient(ellipse 120% 80% at 50% 35%,#1d2550 0%,#0a0d22 55%,#03040b 100%);opacity:0;transition:opacity 1s}
#ck-end.on{opacity:1}#ck-end canvas.sky{position:absolute;inset:0;width:100%;height:100%}
#ck-end .stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 18px 70px;text-align:center}
#ck-end .card{position:absolute;left:50%;top:47%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:10px;width:min(520px,calc(100% - 36px))}
#ck-end .card.in{animation:ckeIn .7s cubic-bezier(.2,.8,.2,1) both}#ck-end .card.out{animation:ckeOut .45s ease-in both}
#ck-end .art{position:relative;width:min(62vw,280px);height:min(62vw,280px);display:grid;place-items:center}
#ck-end .art:before{content:"";position:absolute;inset:8%;border-radius:50%;background:radial-gradient(circle,var(--glow,#f3c04d66) 0%,transparent 68%);animation:ckePulse 3s ease-in-out infinite}
#ck-end .art canvas{position:relative;width:100%;height:100%;filter:drop-shadow(0 14px 22px #000c);animation:ckeFloat 3s ease-in-out infinite}
#ck-end .kick{font:900 12px/1 Cinzel,Georgia,serif;letter-spacing:.32em;text-transform:uppercase;color:#f3c04d}
#ck-end h2{margin:0;font:900 clamp(26px,7vw,42px)/1.05 Cinzel,Georgia,serif;letter-spacing:.04em;color:#fff1bf;text-shadow:0 0 22px #f3c04d55,0 3px 0 #3a2508}
#ck-end .boss h2{color:#ffd0c4;text-shadow:0 0 26px #ff4a3a88,0 3px 0 #3a0808}#ck-end .boss .kick{color:#ff8a6a}
#ck-end p.d{margin:0;max-width:30em;font-size:15px;line-height:1.5;color:#c9cfe8}
#ck-end .count{position:absolute;left:0;right:0;bottom:22px;font:800 12px/1 Nunito,sans-serif;letter-spacing:.2em;color:#8f97bd;text-align:center}
#ck-end .bar{position:absolute;left:12%;right:12%;bottom:44px;height:3px;border-radius:3px;background:#ffffff1a;overflow:hidden}#ck-end .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#a4651a,#f3c04d,#fff1bf);transition:width .6s}
#ck-end .skip{position:absolute;top:max(14px,env(safe-area-inset-top));right:14px;z-index:2;border:1px solid #f3c04d66;background:#0b1024cc;color:#f3c04d;border-radius:99px;padding:7px 14px;font:800 12px Nunito,sans-serif;letter-spacing:.08em;cursor:pointer}
#ck-end .group canvas{width:auto;height:auto;max-width:min(96vw,900px);max-height:68vh;filter:drop-shadow(0 18px 30px #000d)}#ck-end .card.group{width:min(900px,calc(100% - 16px))}
#ck-end .thanks h2{font-size:clamp(28px,8vw,48px)}#ck-end .thanks p.d{font-size:16px}
#ck-end .go{margin-top:14px;border:1px solid #fff1bf;border-radius:14px;padding:14px 26px;font:900 16px Cinzel,Georgia,serif;letter-spacing:.12em;text-transform:uppercase;color:#2a1804;background:linear-gradient(180deg,#fff1bf,#f3c04d 55%,#a4651a);box-shadow:0 5px 0 #5c3508,0 12px 26px #000b;cursor:pointer}
#ck-end .crown{font-size:46px;filter:drop-shadow(0 0 18px #f3c04d)}
@keyframes ckeIn{from{opacity:0;transform:translate(-50%,calc(-50% + 26px)) scale(.86);filter:blur(6px)}to{opacity:1;transform:translate(-50%,-50%);filter:none}}
@keyframes ckeOut{from{opacity:1;transform:translate(-50%,-50%)}to{opacity:0;transform:translate(-50%,calc(-50% - 18px)) scale(1.04);filter:blur(4px)}}
@keyframes ckeFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes ckePulse{0%,100%{opacity:.7;transform:scale(.95)}50%{opacity:1;transform:scale(1.05)}}
@media(prefers-reduced-motion:reduce){#ck-end .card.in,#ck-end .card.out,#ck-end .art canvas,#ck-end .art:before{animation:none!important}}`;
function ckSprCanvas(k,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const im=SP[k];if(im&&im.width){const g=c.getContext('2d'),s=Math.min(w/im.width,h/im.height)*.92;g.imageSmoothingQuality='high';g.drawImage(im,(w-im.width*s)/2,h-im.height*s-(h*.04),im.width*s,im.height*s)}return c}
function ckGroupPortrait(list){const tall=innerHeight>innerWidth*1.1,W2=tall?900:1200,H2=tall?1400:760,c=document.createElement('canvas');c.width=W2;c.height=H2;const g=c.getContext('2d');
 const sp=g.createRadialGradient(W2/2,H2*.55,40,W2/2,H2*.55,W2*.62);sp.addColorStop(0,'#f3c04d33');sp.addColorStop(1,'#0000');g.fillStyle=sp;g.fillRect(0,0,W2,H2);
 g.fillStyle='#00000055';g.beginPath();g.ellipse(W2/2,H2*.9,W2*.47,H2*.07,0,0,7);g.fill();
 const bosses=list.filter(x=>x.role==='boss'||x.role==='mate'),mons=list.filter(x=>!(x.role==='boss'||x.role==='mate'));
 const row=(arr,y,size,spread)=>{const n=arr.length;arr.forEach((x,i)=>{const im=SP[x.k];if(!im||!im.width)return;const s=size/Math.max(im.width,im.height),w=im.width*s,h=im.height*s,px=W2/2+(i-(n-1)/2)*spread;g.drawImage(im,px-w/2,y-h,w,h)})};
 const rows=(arr,k)=>{const o=[],n=Math.ceil(arr.length/k);for(let i=0;i<k;i++)o.push(arr.slice(i*n,(i+1)*n));return o};
 if(tall){const br=rows(bosses,4),mr=rows(mons,3);br.forEach((r,i)=>row(r,H2*(.17+i*.135),205,W2/(r.length+.35)));mr.forEach((r,i)=>row(r,H2*(.71+i*.1),130,W2/(r.length+.3)))}
 else{const half=Math.ceil(bosses.length/2);row(bosses.slice(0,half),H2*.42,190,W2/(half+.6));row(bosses.slice(half),H2*.64,200,W2/(bosses.length-half+.6));row(mons,H2*.92,118,W2/(mons.length+.4))}
 return c}
let CK_END=null;
function ckEnding(onDone){
 if(CK_END)return;const zh=typeof LANG!=='undefined'&&LANG==='zh',Z=(a,b)=>zh?a:b;
 if(!document.getElementById('ck-end-css')){const st=document.createElement('style');st.id='ck-end-css';st.textContent=CK_END_CSS;document.head.appendChild(st)}
 const ov=document.createElement('div');ov.id='ck-end';ov.innerHTML='<canvas class="sky"></canvas><div class="stage"></div><div class="bar"><i></i></div><div class="count"></div><button class="skip" type="button">'+Z('跳过 ›','Skip ›')+'</button>';document.body.appendChild(ov);
 const stage=ov.querySelector('.stage'),bar=ov.querySelector('.bar i'),cnt=ov.querySelector('.count'),timers=[];let stopMusic=()=>{},live=true;
 // starfield backdrop
 const sky=ov.querySelector('canvas.sky'),sg2=sky.getContext('2d');const stars=Array.from({length:140},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.6+.3,p:Math.random()*6}));
 const drawSky=t=>{if(!live)return;const w=sky.width=sky.clientWidth,h=sky.height=sky.clientHeight;sg2.clearRect(0,0,w,h);for(const s of stars){sg2.globalAlpha=.35+.45*Math.sin(t/900+s.p);sg2.fillStyle='#fff6d8';sg2.beginPath();sg2.arc(s.x*w,s.y*h,s.r,0,7);sg2.fill()}requestAnimationFrame(drawSky)};requestAnimationFrame(drawSky);
 // pause the level music, start the ending music
 try{if(typeof mb!=='undefined'&&mb&&au)mb.gain.setTargetAtTime(0,au.currentTime,.4)}catch(_){}
 try{stopMusic=CKS.endingMusic()}catch(_){}
 const finish=()=>{if(!live)return;live=false;timers.forEach(clearTimeout);stopMusic();ov.classList.remove('on');setTimeout(()=>ov.remove(),1000);CK_END=null;try{if(typeof mb!=='undefined'&&mb&&au&&mon)mb.gain.setTargetAtTime(.6*musV,au.currentTime,.6)}catch(_){}if(onDone)onDone()};
 CK_END={finish};ov.querySelector('.skip').onclick=finish;
 const at=(ms,fn)=>timers.push(setTimeout(()=>{if(live)fn()},ms));
 const show=(html,cls,glow)=>{const old=stage.querySelector('.card');if(old){old.classList.remove('in');old.classList.add('out');setTimeout(()=>old.remove(),450)}const c=document.createElement('div');c.className='card in '+(cls||'');if(glow)c.style.setProperty('--glow',glow);c.innerHTML=html;stage.appendChild(c);return c};
 const list=ckRoster(),N=list.length,STEP=3000;
 requestAnimationFrame(()=>ov.classList.add('on'));
 show('<div class="crown">👑</div><div class="kick">'+Z('第 100 关 · 已通关','Level 100 · Complete')+'</div><h2>'+Z('混沌军团','The Chaos Legion')+'</h2><p class="d">'+Z('你击败了它们所有。现在，让我们再见一次每一位对手。','You have defeated them all. Meet every foe you faced, one last time.')+'</p>','thanks');
 const t0=3500;
 list.forEach((x,i)=>at(t0+i*STEP,()=>{const D=CK_DEX[x.k].slice(),R=CK_ROLE[x.role],boss=x.role==='boss'||x.role==='mate';if(x.role==='boss'&&typeof BOSS!=='undefined'){const bn=BOSS[x.lv>=96?13+(x.lv-96):x.lv/8|0];if(bn){D[1]=bn;D[0]=TL(bn)}}
  const card=show('<div class="art"></div><div class="kick">'+Z((x.role==='mate'?'第 40 关起 · ':'第 '+(x.lv+1)+' 关 · ')+R[0],(x.role==='mate'?'From Level 40 · ':'Level '+(x.lv+1)+' · ')+R[1])+'</div><h2>'+Z(D[0],D[1])+'</h2><p class="d">'+Z(D[2],D[3])+'</p>',boss?'boss':'',boss?'#ff4a3a55':'#f3c04d55');
  card.querySelector('.art').appendChild(ckSprCanvas(x.k,boss?420:320,boss?420:320));
  bar.style.width=((i+1)/N*100)+'%';cnt.textContent=(i+1)+' / '+N;
  try{if(boss)CKS.bossSpawn({sp:x.k,t:'boss'});else CKS.die({sp:x.k,t:x.role==='brute'?'brute':x.role==='runner'?'runner':'grunt',x:null})}catch(_){}}));
 const tg=t0+N*STEP;
 at(tg,()=>{const c=show('<div class="kick">'+Z('全员集结','All together')+'</div><h2>'+Z('混沌军团全家福','The Chaos Legion')+'</h2><div class="group"></div>','group');c.querySelector('.group').appendChild(ckGroupPortrait(list));cnt.textContent='';bar.style.width='100%';try{CKS.fanfare()}catch(_){}});
 const nm=(typeof S!=='undefined'&&S.name)?String(S.name).slice(0,40):Z('指挥官','Commander');
 at(tg+7000,()=>show('<div class="crown">🏆</div><div class="kick">'+Z('旅程完成','Journey complete')+'</div><h2>'+Z('感谢你，'+nm+'！','Thank you, '+nm+'!')+'</h2><p class="d">'+Z('你守护了十二个王国，征服了全部 100 个关卡。混沌之地因你而重获和平。感谢你一路陪伴，指挥官。','You defended twelve kingdoms and conquered all 100 levels. Peace returns to the realms because of you. Thank you for playing, Commander.')+'</p>','thanks'));
 const hell=(S.h100|0)>=5,nx=Math.min(4,(S.dif|0)+1),dn=d=>typeof DIFFS!=='undefined'&&DIFFS[d]?TL(DIFFS[d].name):'';
 at(tg+14000,()=>{const c=show(hell?'<div class="crown">🔥</div><div class="kick">'+Z('最高难度 · 已征服','Highest difficulty · Conquered')+'</div><h2>'+Z('混沌炼狱的征服者','Conqueror of Chaos Inferno')+'</h2><p class="d">'+Z('你已在最高难度「'+dn(4)+'」下完成了全部 100 关。再没有更艰难的挑战——你就是真正的传奇指挥官。','You have completed all 100 levels on '+dn(4)+', the highest difficulty. There is no greater challenge left: you are a true legend.')+'</p><button class="go" type="button">'+Z('继续','Continue')+'</button>'
   :'<div class="crown">⚔️</div><div class="kick">'+Z('新的挑战','A new challenge')+'</div><h2>'+Z('敢于挑战更高难度吗？','Ready for a greater challenge?')+'</h2><p class="d">'+Z('试试「'+dn(nx)+'」难度，再次踏上征途。在主页面的难度滑块中即可切换。','Try the '+dn(nx)+' difficulty and take on the journey again. Change it with the difficulty slider on the home screen.')+'</p><button class="go" type="button">'+Z('继续','Continue')+'</button>','thanks');
  c.querySelector('.go').onclick=finish;ov.querySelector('.skip').textContent=Z('关闭 ×','Close ×')});
 return CK_END}
// called from end(win) on Level 100: remember the hardest difficulty it was beaten on, then start the ending
function ckEndingQueue(){if(L.demo||L.i!==99)return;S.h100=Math.max(S.h100|0,(S.dif|0)+1);setTimeout(()=>{try{ckEnding()}catch(e){console.error(e)}},2600)}
