/* ===== Chaos Kingdoms v4.0 · soundtrack, rendered off the main thread =====
   The composer itself (ckSongCore, in music_core.js) is pure number-crunching. It runs in a Web
   Worker built from its own source, so composing a level's 1-minute track never blocks the game:
   the level starts instantly and the music fades in as soon as it is ready (~1-3 s later).
   If workers are unavailable, the game uses its original (lighter) composer instead. */
// one worker per track request; starting a new track cancels any track still being composed
// (e.g. for a level the player has already left), so the current level's music is never queued
let CKWok=true,CKWcur=null;
function ckSong(key){if(!CKWok||typeof Worker==='undefined')return Promise.reject('no worker');
 if(CKWcur){try{CKWcur.w.terminate()}catch(_){}CKWcur.rej('superseded');CKWcur=null}
 return new Promise((res,rej)=>{let w;try{if(!ckSong.url)ckSong.url=URL.createObjectURL(new Blob([CK_MUSIC_SRC+'\nonmessage=e=>{let r;try{r=ckSongCore(e.data.k)}catch(err){postMessage({err:String(err)});return}postMessage({sr:r.sr,l:r.l,r:r.r},[r.l.buffer,r.r.buffer])};'],{type:'text/javascript'}));w=new Worker(ckSong.url)}catch(e){CKWok=false;return rej(e)}
  const job={w,rej:x=>{clearTimeout(to);rej(x)}};CKWcur=job;const done=()=>{try{w.terminate()}catch(_){}if(CKWcur===job)CKWcur=null};
  const to=setTimeout(()=>{done();rej('timeout')},45000);
  w.onerror=ev=>{try{ev.preventDefault()}catch(_){}clearTimeout(to);done();CKWok=false;rej('worker failed')};
  w.onmessage=e=>{clearTimeout(to);done();const d=e.data;if(!d||d.err||!d.l)return rej(d&&d.err||'failed');
   try{const ab=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(2,1,d.sr).createBuffer(2,d.l.length,d.sr);if(ab.copyToChannel){ab.copyToChannel(d.l,0);ab.copyToChannel(d.r,1)}else{ab.getChannelData(0).set(d.l);ab.getChannelData(1).set(d.r)}res(ab)}catch(err){rej(err)}};
  w.postMessage({k:key})})}
