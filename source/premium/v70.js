/* ===== Chaos Kingdoms v7.0 · original gold frame around the whole home screen ===== */
function ckFrameFit(){const t=document.getElementById('title');if(!t||typeof CK_FRAME==='undefined')return;
 let fr=document.getElementById('ckframe');if(!fr){fr=document.createElement('div');fr.id='ckframe';fr.setAttribute('aria-hidden','true');fr.style.setProperty('--fimg',`url(${CK_FRAME})`);document.getElementById('app').appendChild(fr);t.classList.add('ck-fr')}
 const a=document.getElementById('app'),on=!!t.offsetParent&&getComputedStyle(t).visibility!=='hidden'&&getComputedStyle(t).display!=='none';fr.style.display=on?'':'none';if(!on)return;
 const s=Math.min(a.offsetWidth/1163,a.offsetHeight/1353*1.25).toFixed(4);if(fr._s!==s){fr._s=s;a.style.setProperty('--fs',s)}}
setInterval(()=>{try{ckFrameFit()}catch(_){}},400);
ckHomeFit=function(){try{ckFrameFit()}catch(_){}const card=document.querySelector('#title .tcard.ck-home'),t=document.getElementById('title');if(!card||!t||!t.offsetWidth)return;card.style.zoom='';
 const cs=getComputedStyle(t),avail=t.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom),need=card.scrollHeight+4;
 if(need>avail)card.style.zoom=Math.max(.45,avail/need).toFixed(3);t.scrollTop=0};
addEventListener('resize',()=>setTimeout(ckHomeFit,120));setTimeout(ckHomeFit,300);setTimeout(ckHomeFit,2300);
