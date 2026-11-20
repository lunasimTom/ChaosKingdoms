/* ===== Chaos Kingdoms v3.6 · audio engine =====
   Every sound is synthesized with Web Audio at play time (no extra files), through the game's own
   effects channel (sg) and volume (sfxV), so the Master / Effects sliders and the sound toggle work.
   - every monster type has its own voice for being hit and for dying, with random variation
   - every boss portrait has a deep signature voice; boss cues for spawn, stomp attack, rage,
     taking damage and death
   - a shared hall reverb gives depth; short fanfare after a boss level; music for the ending
   Runs inside the main game script (uses au, sg, mon, sfxV). */
const CKS=(()=>{
 let RV=null,NZ=null,DIST=null;const lastKind={},bossT=new WeakMap();let budget=0,budgetT=0;
 const on=()=>typeof au!=='undefined'&&au&&mon&&au.state!=='closed'&&typeof sg!=='undefined'&&sg;
 const R=(a,b)=>a+Math.random()*(b-a);
 // keep crowded fights clean: at most ~14 new monster voices per 100 ms
 let budgetCtx=null;
 const allow=(n=1)=>{const t=au.currentTime;if(budgetCtx!==au||t-budgetT>.1||t<budgetT){budgetCtx=au;budgetT=t;budget=0}if(budget+n>14)return false;budget+=n;return true};
 function rv(){if(RV&&RV.ctx===au)return RV.in;const c=au.createConvolver(),len=Math.floor(au.sampleRate*2.8),b=au.createBuffer(2,len,au.sampleRate);
  for(let ch=0;ch<2;ch++){const a=b.getChannelData(ch);for(let i=0;i<len;i++){const k=i/len;a[i]=(Math.random()*2-1)*Math.pow(1-k,3)*(i<au.sampleRate*.012?i/(au.sampleRate*.012):1)}}
  c.buffer=b;const w=au.createGain();w.gain.value=.55;c.connect(w);w.connect(sg);RV={ctx:au,in:c};return c}
 function noiseBuf(){if(NZ&&NZ.ctx===au)return NZ.b;const b=au.createBuffer(1,au.sampleRate*2,au.sampleRate),a=b.getChannelData(0);let p=0;for(let i=0;i<a.length;i++){const w=Math.random()*2-1;p=p*.6+w*.4;a[i]=i%2?w:p}NZ={ctx:au,b};return b}
 function shaper(){if(DIST&&DIST.ctx===au)return DIST.c;const n=1024,cv=new Float32Array(n);for(let i=0;i<n;i++){const x=i/n*2-1;cv[i]=Math.tanh(x*3.2)}DIST={ctx:au,c:cv};return cv}
 // output node: volume (x effects slider), optional stereo pan and reverb send
 function out(vol,wet=0,pan=0){const g=au.createGain();g.gain.value=Math.max(0,vol*sfxV);let n=g;if(pan&&au.createStereoPanner){const p=au.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));g.connect(p);n=p}n.connect(sg);if(wet>0){const s=au.createGain();s.gain.value=wet;n.connect(s);s.connect(rv())}return g}
 function env(param,t,a,peak,d,end=.0001){param.setValueAtTime(.0001,t);param.exponentialRampToValueAtTime(Math.max(.0002,peak),t+a);param.exponentialRampToValueAtTime(end,t+a+d)}
 // tone: oscillator with pitch glide, optional vibrato and drive
 function tone(dst,o){const t=o.t,ty=o.type||'sine',f0=o.f0,f1=o.f1||o.f0,dur=o.dur,amp=o.amp||.2;const os=au.createOscillator(),g=au.createGain();os.type=ty;os.frequency.setValueAtTime(f0,t);os.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);if(o.det)os.detune.value=o.det;
  if(o.vib){const l=au.createOscillator(),lg=au.createGain();l.frequency.value=o.vr||6;lg.gain.value=o.vib;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+dur+.05)}
  let n=os;if(o.lp){const f=au.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(o.lp,t);if(o.lp1)f.frequency.exponentialRampToValueAtTime(o.lp1,t+dur);f.Q.value=o.q||.8;n.connect(f);n=f}
  if(o.drive){const w=au.createWaveShaper();w.curve=shaper();n.connect(w);n=w}
  n.connect(g);env(g.gain,t,o.a||.008,amp,dur);g.connect(dst);os.start(t);os.stop(t+(o.a||.008)+dur+.05)}
 // noise: filtered noise burst with a sweeping band
 function noise(dst,o){const t=o.t,dur=o.dur,s=au.createBufferSource();s.buffer=noiseBuf();s.loop=true;s.playbackRate.value=o.rate||1;const f=au.createBiquadFilter();f.type=o.ft||'bandpass';f.frequency.setValueAtTime(o.f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,o.f1||o.f0),t+dur);f.Q.value=o.q||1;const g=au.createGain();s.connect(f);f.connect(g);env(g.gain,t,o.a||.005,o.amp||.2,dur);g.connect(dst);s.start(t,Math.random());s.stop(t+(o.a||.005)+dur+.05)}
 // formant voice: a buzzy source through two vowel bands (growls, moans, shouts)
 function vox(dst,o){const t=o.t,dur=o.dur,os=au.createOscillator();os.type=o.type||'sawtooth';os.frequency.setValueAtTime(o.f0,t);os.frequency.exponentialRampToValueAtTime(Math.max(20,o.f1||o.f0),t+dur);if(o.vib){const l=au.createOscillator(),lg=au.createGain();l.frequency.value=o.vr||7;lg.gain.value=o.vib;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+dur+.05)}
  const mix=au.createGain();(o.fm||[700,1200]).forEach((fq,i)=>{const b=au.createBiquadFilter();b.type='bandpass';b.frequency.setValueAtTime(fq,t);if(o.fm1)b.frequency.exponentialRampToValueAtTime(o.fm1[i],t+dur);b.Q.value=o.q||6;os.connect(b);b.connect(mix)});
  let n=mix;if(o.drive){const w=au.createWaveShaper();w.curve=shaper();mix.connect(w);n=w}
  const g=au.createGain();n.connect(g);env(g.gain,t,o.a||.02,o.amp||.3,dur);g.connect(dst);os.start(t);os.stop(t+(o.a||.02)+dur+.05)}
 const clicks=(dst,t,n,gap,f,amp)=>{for(let i=0;i<n;i++)noise(dst,{t:t+i*gap*R(.7,1.3),dur:.018,f0:f*R(.8,1.25),q:8,amp:amp*R(.6,1)})};
 const boom=(dst,t,f,dur,amp)=>{tone(dst,{t,type:'sine',f0:f*1.8,f1:f*.5,dur,amp});noise(dst,{t,dur:dur*.8,ft:'lowpass',f0:420,f1:60,amp:amp*.7})};

 /* ---- monster voices: [hurt, die] per kind ---- */
 const K={
  chatter:{h:(d,t,f)=>{vox(d,{t,f0:f*1.1,f1:f*1.5,dur:.09,fm:[900,2300],amp:.28,type:'square'})},
           x:(d,t,f)=>{vox(d,{t,f0:f*1.5,f1:f*.55,dur:.32,fm:[1000,2600],fm1:[600,1500],amp:.34,type:'square'});clicks(d,t+.1,3,.05,2200,.08)}},
  growl:{h:(d,t,f)=>{vox(d,{t,f0:f,f1:f*.8,dur:.14,fm:[520,1100],amp:.32,drive:1})},
         x:(d,t,f)=>{vox(d,{t,f0:f*1.2,f1:f*.5,dur:.55,fm:[600,1150],fm1:[300,700],amp:.42,drive:1,vib:8,vr:9});noise(d,{t:t+.15,dur:.25,ft:'lowpass',f0:500,f1:90,amp:.15})}},
  rattle:{h:(d,t,f)=>{clicks(d,t,4,.025,f*2.2,.42);tone(d,{t,type:'triangle',f0:f*.8,f1:f*.5,dur:.08,amp:.08})},
          x:(d,t,f)=>{clicks(d,t,12,.035,f*2,.2);tone(d,{t,type:'triangle',f0:f*.9,f1:f*.3,dur:.4,amp:.1});noise(d,{t:t+.32,dur:.14,f0:3000,amp:.12})}},
  moan:{h:(d,t,f)=>{vox(d,{t,f0:f,f1:f*.9,dur:.2,fm:[400,800],amp:.26,vib:6})},
        x:(d,t,f)=>{vox(d,{t,f0:f*1.1,f1:f*.55,dur:.9,fm:[420,820],fm1:[280,600],amp:.36,vib:10,vr:4,a:.06});noise(d,{t:t+.3,dur:.4,ft:'lowpass',f0:300,f1:80,amp:.12})}},
  chitter:{h:(d,t,f)=>{clicks(d,t,7,.018,f,.5);tone(d,{t,type:'sawtooth',f0:f*.5,f1:f*.35,dur:.07,amp:.05,lp:3500})},
           x:(d,t,f)=>{clicks(d,t,16,.022,f,.4);tone(d,{t:t+.05,type:'sawtooth',f0:f*.9,f1:f*.25,dur:.4,amp:.16,lp:3000})}},
  howl:{h:(d,t,f)=>{tone(d,{t,type:'triangle',f0:f*1.2,f1:f*1.6,dur:.12,amp:.16,vib:15})},
        x:(d,t,f)=>{vox(d,{t,f0:f,f1:f*1.6,dur:.35,fm:[800,1400],amp:.3,type:'triangle',vib:12});vox(d,{t:t+.33,f0:f*1.6,f1:f*.5,dur:.6,fm:[800,1400],fm1:[500,900],amp:.28,type:'triangle',vib:10})}},
  bellow:{h:(d,t,f)=>{vox(d,{t,f0:f,f1:f*.75,dur:.2,fm:[350,700],amp:.38,drive:1})},
          x:(d,t,f)=>{vox(d,{t,f0:f*1.3,f1:f*.45,dur:.75,fm:[380,760],fm1:[220,420],amp:.48,drive:1,vib:5});boom(d,t+.55,70,.5,.3)}},
  metal:{h:(d,t,f)=>{[1,2.76,5.4].forEach((m,i)=>tone(d,{t,type:'sine',f0:f*4*m,dur:.18,amp:.08/(i+1)}))},
         x:(d,t,f)=>{[1,2.76,5.4,8.9].forEach((m,i)=>tone(d,{t,type:'sine',f0:f*4*m,dur:.7,amp:.1/(i+1)}));vox(d,{t,f0:f,f1:f*.5,dur:.5,fm:[500,1000],amp:.28,drive:1});noise(d,{t:t+.45,dur:.2,f0:1800,amp:.16})}},
  hiss:{h:(d,t,f)=>{noise(d,{t,dur:.12,ft:'highpass',f0:f,amp:.12})},
        x:(d,t,f)=>{noise(d,{t,dur:.45,ft:'highpass',f0:f,f1:f*.6,amp:.16});tone(d,{t,type:'sawtooth',f0:1400,f1:500,dur:.4,amp:.07,lp:2600,vib:30,vr:18})}},
  demon:{h:(d,t,f)=>{vox(d,{t,f0:f,f1:f*.7,dur:.15,fm:[650,1300],amp:.3,drive:1,type:'square'})},
         x:(d,t,f)=>{vox(d,{t,f0:f*1.4,f1:f*.35,dur:.7,fm:[700,1400],fm1:[350,700],amp:.42,drive:1,vib:14,vr:11});noise(d,{t,dur:.6,f0:900,f1:200,amp:.12,q:2})}},
  roar:{h:(d,t,f)=>{vox(d,{t,f0:f,f1:f*.8,dur:.16,fm:[600,1100],amp:.3,drive:1});noise(d,{t,dur:.12,f0:1200,amp:.07})},
        x:(d,t,f)=>{vox(d,{t,f0:f*1.3,f1:f*.4,dur:.8,fm:[650,1200],fm1:[300,600],amp:.42,drive:1});noise(d,{t,dur:.7,f0:1500,f1:300,amp:.16,q:1.5})}},
  chant:{h:(d,t,f)=>{tone(d,{t,type:'sine',f0:f*1.5,f1:f*1.2,dur:.16,amp:.12});tone(d,{t,type:'sine',f0:f*2.25,f1:f*1.8,dur:.16,amp:.06})},
         x:(d,t,f)=>{[1,1.5,2].forEach((m,i)=>tone(d,{t:t+i*.05,type:'sine',f0:f*m*1.2,f1:f*m*.6,dur:.8,amp:.1,vib:5}));noise(d,{t,dur:.5,ft:'highpass',f0:4000,amp:.05})}},
  whoosh:{h:(d,t,f)=>{noise(d,{t,dur:.12,f0:f*2,f1:f,q:2,amp:.3});tone(d,{t,type:'sine',f0:700,f1:400,dur:.08,amp:.06})},
          x:(d,t,f)=>{noise(d,{t,dur:.35,f0:f*3,f1:f*.4,q:2,amp:.16});tone(d,{t:t+.05,type:'sine',f0:900,f1:180,dur:.4,amp:.1})}},
  ghostly:{h:(d,t,f)=>{tone(d,{t,type:'sine',f0:f*2,f1:f*1.6,dur:.2,amp:.1,vib:20})},
           x:(d,t,f)=>{tone(d,{t,type:'sine',f0:f*2.2,f1:f*.8,dur:1,amp:.14,vib:22,vr:5,a:.05});tone(d,{t:t+.1,type:'triangle',f0:f*3.3,f1:f*1.1,dur:.9,amp:.06,vib:18})}},
  stone:{h:(d,t,f)=>{noise(d,{t,dur:.14,ft:'lowpass',f0:600,f1:150,amp:.42});tone(d,{t,type:'sine',f0:120,f1:70,dur:.12,amp:.12})},
         x:(d,t,f)=>{for(let i=0;i<5;i++)noise(d,{t:t+i*R(.05,.1),dur:.18,ft:'lowpass',f0:R(400,900),f1:90,amp:.24});boom(d,t+.25,60,.6,.3)}},
  wail:{h:(d,t,f)=>{tone(d,{t,type:'sine',f0:f*1.4,f1:f*1.8,dur:.18,amp:.1,vib:25})},
        x:(d,t,f)=>{tone(d,{t,type:'sine',f0:f*1.8,f1:f*.5,dur:1.1,amp:.15,vib:28,vr:6,a:.04});noise(d,{t,dur:.9,ft:'highpass',f0:3500,f1:1500,amp:.04})}}
 };
 const MV={e_goblin:['chatter',560],e_orc:['growl',140],e_skeleton:['rattle',900],e_zombie:['moan',115],e_spider:['chitter',2600],e_wolf:['howl',430],e_troll:['growl',92],e_ogre:['bellow',82],e_dknight:['metal',170],e_vampire:['hiss',3200],e_demon:['demon',190],e_dragon:['roar',165],e_mystic:['chant',420],e_shaman:['chant',300],e_assassin:['whoosh',1400],e_necro:['ghostly',260],e_golem:['stone',70],e_ghost:['wail',650]};
 const kindOf=e=>MV[e.sp]||(e.t==='brute'?['bellow',90]:e.t==='runner'?['chatter',600]:['growl',150]);
 function play(e,which){if(!on())return false;const v=kindOf(e),k=K[v[0]];if(!k)return false;if(!allow(which==='x'?2:1))return true;
  const t=au.currentTime+.005,f=v[1]*R(.9,1.12)*(e.el?.85:1),pan=e&&e.x!=null&&L&&L.cols?((port?e.y/L.rows:e.x/L.cols)-.5)*.7:0;
  const d=out(which==='x'?(e.el?.95:.8):.5,which==='x'?.22:.1,pan);try{k[which](d,t,f)}catch(_){}return true}

 /* ---- boss voices: deep roar + a signature texture per portrait ---- */
 const BV={b2_skeleton_king:['bones',62],b2_demon_lord:['hell',55],b2_ice_dragon:['ice',70],b2_fire_giant:['fire',48],b2_dragon_king:['fire',52],b2_necromancer:['choir',66],b2_death_knight:['steel',58],b2_dread_knight:['steel',54],b2_lich_king:['choir',50],b2_stone_golem:['stone',42],b2_sea_monster:['water',46],b2_vampire_lord:['bat',72],b2_ogre_king:['brute',50],b2_spider_queen:['chitter',80],b2_giant_worm:['water',40],b2_demon_beast:['hell',45],b2_forest_ent:['wood',44],b2_void_lord:['void',38],b2_storm_titan:['thunder',50]};
 const bvo=e=>BV[e.sp]||['brute',55];
 function texture(d,tex,t,dur,amp){
  if(tex==='bones')clicks(d,t,Math.round(10*dur),.06,1600,amp*.5);
  else if(tex==='hell'){noise(d,{t,dur,f0:700,f1:180,q:3,amp:amp*.5});tone(d,{t,type:'square',f0:110,f1:55,dur,amp:amp*.15,lp:600,drive:1})}
  else if(tex==='ice'){for(let i=0;i<6;i++)tone(d,{t:t+i*dur/7,type:'sine',f0:R(2400,4200),dur:.5,amp:amp*.12})}
  else if(tex==='fire'){noise(d,{t,dur:dur*1.1,ft:'bandpass',f0:2500,f1:900,q:.7,amp:amp*.35});clicks(d,t,Math.round(14*dur),.05,3000,amp*.2)}
  else if(tex==='choir'){[1,1.2,1.5,2].forEach((m,i)=>tone(d,{t:t+i*.04,type:'sine',f0:220*m,f1:200*m,dur:dur*1.1,amp:amp*.1,vib:5,a:.25}))}
  else if(tex==='steel'){[1,2.4,4.1].forEach((m,i)=>tone(d,{t,type:'sine',f0:330*m,dur:dur*.9,amp:amp*.16/(i+1)}));noise(d,{t,dur:.25,ft:'highpass',f0:3000,amp:amp*.3})}
  else if(tex==='stone'){for(let i=0;i<8;i++)noise(d,{t:t+i*dur/9,dur:.25,ft:'lowpass',f0:R(300,700),f1:70,amp:amp*.35})}
  else if(tex==='water'){for(let i=0;i<10;i++)tone(d,{t:t+i*dur/11,type:'sine',f0:R(150,400),f1:R(500,900),dur:.12,amp:amp*.12})}
  else if(tex==='bat'){tone(d,{t,type:'sawtooth',f0:2600,f1:1100,dur:dur*.6,amp:amp*.08,lp:4000,vib:60,vr:22});noise(d,{t,dur:dur*.5,ft:'highpass',f0:5000,amp:amp*.2})}
  else if(tex==='chitter')clicks(d,t,Math.round(30*dur),.03,2400,amp*.35);
  else if(tex==='wood'){for(let i=0;i<4;i++)tone(d,{t:t+i*dur/5,type:'sawtooth',f0:R(90,160),f1:R(60,90),dur:.4,amp:amp*.12,lp:900,q:6})}
  else if(tex==='void'){tone(d,{t,type:'sine',f0:900,f1:40,dur:dur*1.2,amp:amp*.2});tone(d,{t,type:'sine',f0:30,f1:30,dur:dur*1.3,amp:amp*.35,vib:3,vr:.7})}
  else if(tex==='thunder'){noise(d,{t,dur:.08,ft:'highpass',f0:2500,amp:amp*.9});noise(d,{t:t+.05,dur:dur*1.2,ft:'lowpass',f0:900,f1:60,amp:amp*.6})}
 }
 function roar(d,t,f,dur,amp,up){vox(d,{t,f0:up?f*.8:f*1.5,f1:up?f*1.6:f*.6,dur,fm:[420,900],fm1:up?[700,1300]:[250,520],amp,drive:1,vib:6,vr:5,a:.08,q:4});
  vox(d,{t:t+.02,f0:(up?f*.8:f*1.5)*1.005,f1:(up?f*1.6:f*.6)*1.01,dur,fm:[300,650],amp:amp*.7,drive:1,a:.1,q:3});
  tone(d,{t,type:'sine',f0:f*.5,f1:f*.4,dur:dur*1.1,amp:amp*.6,a:.1});noise(d,{t,dur,ft:'lowpass',f0:900,f1:200,amp:amp*.35,a:.06})}
 const bossOut=(v,w)=>out(v,w,0);
 const api={
  hurt:e=>e&&e.t!=='boss'?play(e,'h'):false,
  die:e=>{if(!e)return false;if(e.t==='boss')return api.bossDie(e);return play(e,'x')},
  bossSpawn:e=>{if(!on())return false;const[x,f]=bvo(e),t=au.currentTime+.05,d=bossOut(1,.45);boom(d,t,45,1.2,.55);roar(d,t+.25,f,1.7,.6,false);texture(d,x,t+.3,1.6,.9);return true},
  bossAttack:e=>{if(!on())return false;const[x,f]=bvo(e),t=au.currentTime+.01,d=bossOut(.95,.35);boom(d,t,50,.7,.6);noise(d,{t,dur:.35,ft:'lowpass',f0:1400,f1:120,amp:.4});roar(d,t+.05,f*1.1,.55,.38,false);texture(d,x,t+.05,.5,.6);return true},
  bossRage:e=>{if(!on())return false;const[x,f]=bvo(e),t=au.currentTime+.02,d=bossOut(1.1,.5);roar(d,t,f,2.2,.7,true);texture(d,x,t+.2,2,1);for(let i=0;i<6;i++){boom(d,t+.4+i*.55,58,.35,.45);boom(d,t+.62+i*.55,52,.3,.3)}return true},
  bossHurt:e=>{if(!on())return false;const n=au.currentTime;if((bossT.get(e)||0)>n)return true;bossT.set(e,n+R(.9,1.4));const[x,f]=bvo(e),d=bossOut(.6,.25);vox(d,{t:n+.01,f0:f*1.4,f1:f*1.1,dur:.28,fm:[450,950],amp:.35,drive:1,q:4});texture(d,x,n+.02,.25,.4);return true},
  bossDie:e=>{if(!on())return false;const[x,f]=bvo(e),t=au.currentTime+.02,d=bossOut(1.15,.55);roar(d,t,f*1.2,2.4,.75,false);texture(d,x,t+.2,2.2,1);boom(d,t+1.6,38,2.2,.7);noise(d,{t:t+1.6,dur:2.8,ft:'lowpass',f0:220,f1:40,amp:.4,a:.2});return true},
  // short triumphant fanfare after a boss level (brass chords, timpani, cymbal swell)
  fanfare:()=>{if(!on())return false;const t=au.currentTime+.05,d=out(.9,.4),ch=[[262,330,392],[349,440,523],[392,494,587],[523,659,784]],du=[.45,.45,.45,1.6];let tt=t;
   ch.forEach((c,i)=>{c.forEach(fq=>{tone(d,{t:tt,type:'sawtooth',f0:fq,dur:du[i],amp:.06,lp:2400,a:.03,det:R(-6,6)});tone(d,{t:tt,type:'sawtooth',f0:fq*1.005,dur:du[i],amp:.04,lp:1800,a:.03})});boom(d,tt,i===3?70:90,.5,.35);tt+=du[i]});
   noise(d,{t:t+1.2,dur:1.6,ft:'highpass',f0:5000,f1:7000,amp:.08,a:.6});return true},
  // music for the Level 100 ending: slow epic progression (pads, choir, timpani, bell melody)
  endingMusic:()=>{if(!on())return ()=>{};const d=out(.8,.6),prog=[[220,262,330],[175,220,262],[262,330,392],[196,247,294]],bell=[660,587,523,494,523,587,659,784];let bar=0,live=true;
   const play=()=>{if(!live||!on()||d.context!==au)return;const t=au.currentTime+.05,c=prog[bar%4];c.forEach(fq=>{tone(d,{t,type:'sawtooth',f0:fq,dur:2.6,amp:.035,lp:1100,a:.6,det:R(-8,8)});tone(d,{t,type:'sine',f0:fq*2,dur:2.6,amp:.025,a:.8,vib:4})});
    tone(d,{t,type:'sine',f0:c[0]/2,dur:2.5,amp:.08,a:.3});boom(d,t,60,.9,.3);if(bar%2)boom(d,t+1.2,70,.6,.18);
    for(let i=0;i<2;i++){const fq=bell[(bar*2+i)%bell.length];tone(d,{t:t+i*1.2,type:'sine',f0:fq,dur:1.4,amp:.07});tone(d,{t:t+i*1.2,type:'sine',f0:fq*2.01,dur:.8,amp:.02})}bar++};
   play();const iv=setInterval(play,2400);return ()=>{live=false;clearInterval(iv);try{d.gain.setTargetAtTime(0,au.currentTime,.4)}catch(_){}}},
  // loot: pickup chime brighter and richer with rarity; treasure burst = gold crash + rising sparkle
  pickup:(tier=0)=>{if(!on())return false;const t=au.currentTime+.005,d=out(.85+.08*tier,.22+.04*tier,0),base=[1047,1175,1319,1397,1568,1760][Math.min(5,tier)];
   // crisp "ka-ching": a bright click transient, a struck bell that rings out (~0.5 s, longer than a UI click),
   // and a quick rising sparkle; rarer items add a higher bell and a shimmer
   noise(d,{t,dur:.035,ft:'highpass',f0:6500,amp:.14});
   tone(d,{t,type:'triangle',f0:base,dur:.14,amp:.24});
   tone(d,{t:t+.065,type:'sine',f0:base*1.5,dur:.46,amp:.22});tone(d,{t:t+.065,type:'sine',f0:base*3.01,dur:.22,amp:.05});
   [2,2.52,3].forEach((m,i)=>tone(d,{t:t+.13+i*.055,type:'sine',f0:base*m,dur:.24,amp:.05}));
   if(tier>=2)tone(d,{t:t+.12,type:'sine',f0:base*2,dur:.34+.08*tier,amp:.1});if(tier>=4){[1,1.25,1.5,2].forEach((m,i)=>tone(d,{t:t+.18+i*.07,type:'sine',f0:base*m,dur:.5,amp:.08}));noise(d,{t,dur:.6,ft:'highpass',f0:6000,amp:.06})}return true},
  lootBurst:(best=0)=>{if(!on())return false;const t=au.currentTime+.01,d=out(1,.5,0);boom(d,t,55,1,.6);noise(d,{t,dur:1.4,ft:'highpass',f0:4000,f1:7000,amp:.18,a:.02});
   for(let i=0;i<14;i++)tone(d,{t:t+.05+i*.045,type:'sine',f0:R(1400,3600),dur:.25,amp:.07});
   if(best>=4){[523,659,784,1047].forEach((f,i)=>tone(d,{t:t+.35+i*.11,type:'sawtooth',f0:f,dur:.6,amp:.05,lp:2600}))}return true},
  // test hook: render a voice into any context (used by the automated sound checks)
  _voices:()=>({monsters:Object.keys(MV),bosses:Object.keys(BV)})
 };
 return api})();
// small random pan on sampled effects (tower shots etc.) so repeated hits do not sound identical
function ckPanOut(g){try{if(au.createStereoPanner){const p=au.createStereoPanner();p.pan.value=(Math.random()-.5)*.5;g.connect(p);p.connect(sg)}else g.connect(sg)}catch(_){g.connect(sg)}}
