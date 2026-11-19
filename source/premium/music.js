/* ===== Chaos Kingdoms v3.7 · soundtrack composer =====
   Each level's music is composed from its realm's theme and rendered once (offline) into a looping
   buffer, through a small orchestra built from Web Audio nodes:
   string pads, a lead (horn/flute), brass, choir, harp arpeggios, bass, taiko, snare, hi-hats,
   cymbal swells and a hall reverb.
   Form (32 bars): intro (4) - theme A (8) - development B (8) - climax (8) - resolution (4) -> loop.
   Melodies are built from a memorable 2-bar motif per realm, answered, sequenced and resolved, with
   strong beats snapped to chord tones. Boss levels: faster, harmonic minor, driving ostinato, choir. */
const CKM_MODES={maj:[0,2,4,5,7,9,11],min:[0,2,3,5,7,8,10],har:[0,2,3,5,7,8,11],dor:[0,2,3,5,7,9,10],lyd:[0,2,4,6,7,9,11],mix:[0,2,4,5,7,9,10],phr:[0,1,3,5,7,8,10]};
// chord-root scale degrees (0-based) for the A and B sections
const CKM_PROG={heroic:[[0,4,5,3],[5,3,0,4]],epic:[[0,5,2,6],[3,0,6,4]],war:[[0,6,5,6],[0,3,6,4]],dark:[[0,3,5,4],[5,3,1,4]],desert:[[0,1,0,6],[3,1,6,4]],ether:[[0,3,0,4],[5,3,1,4]],boss:[[0,5,1,4],[0,3,5,4]]};
// per realm: root (MIDI), mode, tempo, progression, lead timbre
const CKM_REALM=[[62,'maj',104,'heroic','horn'],[64,'har',96,'desert','flute'],[61,'min',90,'epic','flute'],[57,'har',112,'war','horn'],[65,'lyd',100,'heroic','flute'],[62,'min',92,'dark','horn'],[67,'lyd',94,'ether','flute'],[60,'har',100,'dark','horn'],[59,'min',116,'war','horn'],[64,'dor',100,'heroic','flute'],[58,'min',104,'dark','horn'],[55,'har',118,'war','horn'],[62,'har',108,'epic','horn']];
// motifs: [scale-degree offsets, durations in eighths] (two bars = 16 eighths)
const CKM_MOTIF=[[[0,2,4,4,5,4,2,0],[2,1,1,4,2,2,2,2]],[[4,3,2,0,2,4,7,4],[3,1,2,2,2,2,2,2]],[[0,4,3,2,3,4,2,1],[2,2,1,1,2,4,2,2]],[[0,0,2,4,7,6,4,2],[1,1,2,2,4,2,2,2]],[[4,5,4,2,0,1,2,4],[2,1,1,2,2,2,2,4]],[[0,2,3,5,4,3,2,0],[2,2,2,2,3,1,2,2]],[[7,6,4,2,4,5,4,0],[2,2,2,2,2,1,1,4]],[[0,4,5,7,5,4,2,4],[2,2,1,1,2,2,2,4]]];
function ckmRng(seed){let a=seed|0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
async function ckSong(key){
 const lv=key==='menu'?-1:(+String(key).slice(1)||0),boss=lv>=0&&(lv%8===7||lv>=96),realm=lv<0?0:Math.min(12,lv/8|0),R=CKM_REALM[realm];
 const rnd=ckmRng(lv*7919+31+(boss?999:0));
 const root=R[0]+(lv<0?0:(lv%8)%3===2?2:0)-(boss?2:0),mode=CKM_MODES[boss?'har':(lv<0?'maj':R[1])],progs=CKM_PROG[boss?'boss':(lv<0?'heroic':R[3])];
 const tempo=(lv<0?84:R[2]+(lv%8)*1.5)+(boss?14:0),beat=60/tempo,bar=beat*4,BARS=32,dur=bar*BARS,sr=24000;
 // ---- direct sample synthesis (fast on phones): every instrument writes into stereo float buffers ----
 const N=Math.ceil(sr*(dur+.05)),OL=new Float32Array(N),OR=new Float32Array(N),RV=new Float32Array(N);
 const TAU=Math.PI*2,NZ=new Float32Array(sr);for(let i=0;i<sr;i++)NZ[i]=Math.random()*2-1;
 const B={pad:[.5,.6,0],lead:[.55,.45,.08],brass:[.5,.4,-.1],choir:[.4,.75,0],harp:[.32,.5,.25],bass:[.7,.08,0],drum:[.75,.22,0],hat:[.18,.1,.3],cym:[.22,.5,-.2]};
 const hz=m=>440*Math.pow(2,(m-69)/12),deg=d=>root+12*Math.floor(d/7)+mode[((d%7)+7)%7];
 // RBJ biquad coefficients
 const bq=(type,f,q)=>{const w=TAU*Math.min(f,sr*.45)/sr,cs=Math.cos(w),al=Math.sin(w)/(2*q);let b0,b1,b2;if(type==='lp'){b0=(1-cs)/2;b1=1-cs;b2=b0}else if(type==='hp'){b0=(1+cs)/2;b1=-(1+cs);b2=b0}else{b0=al;b1=0;b2=-al}const a0=1+al;return[b0/a0,b1/a0,b2/a0,-2*cs/a0,(1-al)/a0]};
 const env=(x,a,d,s,rel,hold)=>x<0?0:x<a?x/a:x<a+d?1-(1-s)*(x-a)/d:x<hold?s:x<hold+rel?s*(1-(x-hold)/rel):0;
 // mix a mono voice into the buses: write(sampleIndex, value) with a bus [gain, reverbSend, pan]
 const put=(bus,i,v)=>{if(i<0||i>=N)return;const g=bus[0],p=bus[2];OL[i]+=v*g*.5*(1-p);OR[i]+=v*g*.5*(1+p);RV[i]+=v*g*bus[1]};
 // voice renderer: osc(phaseInc)->filter->envelope
 const voice=(bus,t,len,f0,o)=>{const i0=Math.floor(t*sr),rel=o.rel||.15,n=Math.ceil((len+rel)*sr),c=o.flt?bq(o.flt[0],o.flt[1],o.flt[2]||.7):null;let x1=0,x2=0,y1=0,y2=0,ph=Math.random(),ph2=Math.random(),lph=0;const det=o.det?Math.pow(2,o.det/1200):1,inc=f0*det/sr,vib=o.vib||0,vr=(o.vr||5.5)/sr,amp=o.amp,wf=o.wave||'saw',hold=len*(o.hold||1);
  for(let k=0;k<n;k++){const tt=k/sr,e=env(tt,o.a||.01,o.d||.1,o.s==null?.8:o.s,rel,hold);if(e<=0&&tt>(o.a||.01))continue;lph+=vr;const fm=1+(vib?vib*Math.sin(TAU*lph)*Math.min(1,tt/.3):0);ph+=inc*fm;ph-=Math.floor(ph);let v;
   if(wf==='saw')v=2*ph-1;else if(wf==='tri')v=1-4*Math.abs(ph-.5);else if(wf==='sq')v=ph<.5?1:-1;else v=Math.sin(TAU*ph);
   if(o.sub){ph2+=inc*o.sub*fm;ph2-=Math.floor(ph2);v=v*.75+Math.sin(TAU*ph2)*.5}
   if(c){const y=c[0]*v+c[1]*x1+c[2]*x2-c[3]*y1-c[4]*y2;x2=x1;x1=v;y2=y1;y1=y;v=y}
   put(bus,i0+k,v*e*amp)}};
 const nzv=(bus,t,len,type,f,q,amp,decay)=>{const i0=Math.floor(t*sr),n=Math.ceil(len*sr),c=bq(type,f,q);let x1=0,x2=0,y1=0,y2=0,j=Math.floor(Math.random()*sr);for(let k=0;k<n;k++){const v0=NZ[(j+k)%sr];const y=c[0]*v0+c[1]*x1+c[2]*x2-c[3]*y1-c[4]*y2;x2=x1;x1=v0;y2=y1;y1=y;const e=decay?Math.exp(-k/(sr*decay)):1;put(bus,i0+k,y*amp*e)}};
 // ---- instruments ----
 const pad=(t,len,ms,amp)=>{for(const m of ms){voice(B.pad,t,len,hz(m),{amp:amp/2.4,det:-8,a:.45,d:.3,s:.85,rel:.6,flt:['lp',1250,.6]});voice({...B.pad,2:-.3,0:B.pad[0]},t,len,hz(m),{amp:amp/2.4,det:7,a:.5,d:.3,s:.85,rel:.6,flt:['lp',1150,.6]})}};
 const lead=(t,len,m,amp,tim)=>voice(B.lead,t,len*.92,hz(m),{amp,wave:tim==='horn'?'saw':'tri',sub:tim==='horn'?1:2,vib:.012,vr:5.2,a:.04,d:.15,s:.78,rel:.18,flt:['lp',tim==='horn'?1700:3000,.7]});
 const brass=(t,len,m,amp)=>{voice(B.brass,t,len*.9,hz(m),{amp:amp/2,det:-6,a:.03,d:.2,s:.7,rel:.15,flt:['lp',1800,1.1]});voice(B.brass,t,len*.9,hz(m),{amp:amp/2,det:6,a:.03,d:.2,s:.7,rel:.15,flt:['lp',1600,1.1]})};
 const choir=(t,len,ms,amp)=>{for(const m of ms)for(const[fq,q,gn] of [[800,8,1],[1150,9,.6],[2900,10,.25]])voice(B.choir,t,len,hz(m),{amp:amp*gn*2.2,vib:.008,vr:4.6+Math.random(),a:.5,d:.3,s:.9,rel:.8,flt:['bp',fq,q]})};
 const harp=(t,m,amp)=>voice(B.harp,t,.05,hz(m),{amp,wave:'tri',a:.003,d:.9,s:0,rel:.2,hold:.05,flt:['lp',2600,.7]});
 const bass=(t,len,m,amp)=>voice(B.bass,t,len*.9,hz(m),{amp,sub:.5,a:.01,d:.08,s:.7,rel:.06,flt:['lp',420,.8]});
 const taiko=(t,amp)=>{const i0=Math.floor(t*sr),n=Math.floor(.6*sr);let ph=0;for(let k=0;k<n;k++){const tt=k/sr,f=48+82*Math.exp(-tt/.09);ph+=f/sr;put(B.drum,i0+k,Math.sin(TAU*ph)*amp*Math.exp(-tt/.16))}nzv(B.drum,t,.12,'lp',450,.7,amp*.5,.03)};
 const snare=(t,amp)=>{nzv(B.drum,t,.18,'bp',1700,.8,amp*1.4,.045);voice(B.drum,t,.02,200,{amp:amp*.5,wave:'tri',a:.001,d:.08,s:0,rel:.02,hold:.02})};
 const hat=(t,amp)=>nzv(B.hat,t,.05,'hp',7500,.7,amp,.012);
 const swell=(t,len,amp)=>{const i0=Math.floor(t*sr),n=Math.floor(len*sr),c=bq('hp',5000,.7);let x1=0,x2=0,y1=0,y2=0,j=Math.floor(Math.random()*sr);for(let k=0;k<n;k++){const v0=NZ[(j+k)%sr];const y=c[0]*v0+c[1]*x1+c[2]*x2-c[3]*y1-c[4]*y2;x2=x1;x1=v0;y2=y1;y1=y;put(B.cym,i0+k,y*amp*Math.pow(k/n,2.2))}};
 const crash=(t,amp)=>nzv(B.cym,t,2.2,'hp',3700,.5,amp*1.3,.55);
 const roll=(t,len,amp)=>{for(let x=0;x<len;x+=beat/4)taiko(t+x,amp*(.4+.6*x/len))};
 // ---- harmony ----
 const chordAt=b=>{const sec=b<4?0:b<12?0:b<20?1:b<28?0:0;const p=progs[sec];const c=b>=28?(b===31?4:p[(b-28)%4]):p[b%4];return c};
 const triad=(c,oct)=>[deg(c)+oct*12,deg(c+2)+oct*12,deg(c+4)+oct*12];
 // ---- melody: motif, answer, sequence, cadence (8 bars) ----
 const mot=CKM_MOTIF[(realm*3+(lv<0?5:0)+(boss?1:0))%CKM_MOTIF.length];
 const phrase=[];const add=(degs,durs,shift)=>{let x=0;degs.forEach((d,i)=>{phrase.push({d:d+shift,at:x,len:durs[i]});x+=durs[i]})};
 // returns notes for 8 bars as {bar, at(eighths), len(eighths), d}
 const melody=(variant)=>{const out=[];const parts=[[0,0],[2,variant?1:2],[4,variant?2:-1],[6,0]];
  for(const[b0,sh] of parts){let x=0;const isCad=b0===6;mot[0].forEach((d,i)=>{let dd=isCad&&i>=mot[0].length-2?(i===mot[0].length-1?0:1):d+sh;const len=mot[1][i];out.push({bar:b0+Math.floor(x/8),at:x%8,len,d:dd});x+=len})}
  return out};
 const snap=(d,bar,at)=>{if(at%4!==0)return d;const c=chordAt(bar),tones=[c,c+2,c+4,c+7,c-7+2,c-7+4];let best=d,bd=99;for(const t of tones)for(const o of [-7,0,7]){const v=t+o;if(Math.abs(v-d)<bd){bd=Math.abs(v-d);best=v}}return best};
 const playMel=(b0,variant,fn)=>{for(const n of melody(variant)){const bar=b0+n.bar;if(bar>=BARS)continue;const d=snap(n.d,bar,n.at),t=bar*bar_+n.at*beat/2;fn(t,n.len*beat/2,d)}};
 const bar_=bar;
 // ---- arrangement ----
 for(let b=0;b<BARS;b++){const t=b*bar,c=chordAt(b),tr=triad(c,-1);
  const intro=b<4,A=b>=4&&b<12,Bs=b>=12&&b<20,C=b>=20&&b<28,O=b>=28;
  // pads (always), choir in climax and boss B
  pad(t,bar,tr,intro||O?.16:.2);if(C||(boss&&Bs))choir(t,bar,[deg(c)+12,deg(c+2)+12,deg(c+4)],C?.06:.04);
  // bass
  const br=deg(c)-24;if(intro){bass(t,bar*.95,br,.22)}else if(boss){for(let k=0;k<16;k++)bass(t+k*beat/4,beat/4*.9,k%8===6?br+12:br,.2)}else{for(let k=0;k<8;k++)bass(t+k*beat/2,beat/2*.9,k%4===3?br+7:k%2?br+12:br,A?.17:.21)}
  // harp arpeggios
  if(A||O||Bs){const ar=[...tr.map(m=>m+12),tr[0]+24];for(let k=0;k<(Bs?16:8);k++){const step=Bs?beat/4:beat/2;harp(t+k*step,ar[(k*(rnd()<.2?2:1))%ar.length],Bs?.08:.1)}}
  // drums
  if(intro){taiko(t,.35);if(b===3)roll(t+bar*.5,bar*.5,.35),swell(t+bar*.25,bar*.75,.12)}
  else{for(let k=0;k<4;k++){if(k===0||(k===2&&(C||boss)))taiko(t+k*beat,C?.55:.42);if((k===1||k===3)&&(Bs||C||boss))snare(t+k*beat,C?.32:.22)}
   if(!O)for(let k=0;k<8;k++)hat(t+k*beat/2,k%2?.08:.14);if(C&&b%2===1)taiko(t+3.5*beat,.3)}
  if(b===4||b===20)crash(t,.25);if(b===11||b===19){roll(t+bar*.5,bar*.5,.4);swell(t+bar*.4,bar*.6,.16)}
  if(b===27)swell(t,bar,.12);
  // brass stabs in the climax
  if(C){brass(t,beat*.9,tr[0]+12,.12);brass(t+beat*2.5,beat*.4,tr[2]+12,.09)}}
 // theme A on the lead, development B (answer phrase an octave below), climax on brass + choir doubling, fragment in the resolution
 playMel(4,false,(t,l,d)=>lead(t,l,deg(d)+12,.18,R[4]));
 playMel(12,true,(t,l,d)=>lead(t,l,deg(d),.14,R[4]==='horn'?'flute':'horn'));
 playMel(20,false,(t,l,d)=>{brass(t,l,deg(d)+12,.16);lead(t,l,deg(d)+24,.07,'flute')});
 if(!boss){let x=0;mot[0].slice(0,5).forEach((d,i)=>{const len=mot[1][i]*beat/2;lead(28*bar+x,len,deg(d)+12,.11,R[4]);x+=len})}
 else playMel(28,true,(t,l,d)=>{if(t<30*bar)brass(t,l,deg(d),.12)});
 // hall reverb: 4 damped combs + 2 allpasses per channel on the send bus
 const rev=(src,out,off)=>{const cl=[1116,1188,1277,1356].map(x=>Math.round((x+off)*sr/44100)),al=[556,441].map(x=>Math.round((x+off)*sr/44100));const cb=cl.map(l=>new Float32Array(l)),ci=cl.map(()=>0),cf=cl.map(()=>0);const ab=al.map(l=>new Float32Array(l)),ai=al.map(()=>0);const fb=.82,dmp=.32;
  for(let i=0;i<N;i++){const x=src[i]*.12;let y=0;for(let k=0;k<4;k++){const b=cb[k],j=ci[k],o=b[j];cf[k]=o*(1-dmp)+cf[k]*dmp;b[j]=x+cf[k]*fb;ci[k]=(j+1)%b.length;y+=o}for(let k=0;k<2;k++){const b=ab[k],j=ai[k],o=b[j];b[j]=y+o*.5;ai[k]=(j+1)%b.length;y=o-y*.5}out[i]+=y}};
 rev(RV,OL,0);rev(RV,OR,23);
 let pk=0;for(let i=0;i<N;i++){const a=Math.abs(OL[i]),b=Math.abs(OR[i]);if(a>pk)pk=a;if(b>pk)pk=b}
 const g=pk>0?1/pk:1,ab=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(2,1,sr).createBuffer(2,N,sr),l=ab.getChannelData(0),r=ab.getChannelData(1);
 for(let i=0;i<N;i++){l[i]=Math.tanh(OL[i]*g*1.1)*.82;r[i]=Math.tanh(OR[i]*g*1.1)*.82}
 return ab}
