// Renders the main-menu track with the game's own composer (music_core.js) and writes interleaved
// stereo float32 PCM; tools/make_menu_music.sh encodes it to source/premium/menu_music.mp3.
// usage: node tools/make_menu_music.js <out.f32>
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','source','premium','music_core.js'),'utf8');
const ckSongCore=new Function(src+'\nreturn ckSongCore;')();
const r=ckSongCore('menu'),N=r.l.length,o=new Float32Array(N*2);
for(let i=0;i<N;i++){o[2*i]=r.l[i];o[2*i+1]=r.r[i]}
fs.writeFileSync(process.argv[2],Buffer.from(o.buffer));
console.log(JSON.stringify({sr:r.sr,samples:N,seconds:(N/r.sr).toFixed(2)}));
