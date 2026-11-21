/* ===== Chaos Kingdoms V7.0 · ornate gold frame around the home screen ===== */
// The frame is assembled from pieces at one uniform scale (corners, crest, bottom centre and side
// diamonds keep their proportions); only plain bar segments stretch, so it fits any phone shape.
function ckFrameFit(){const card=document.querySelector('#title .tcard.ck-home');if(!card||typeof CK_FRAME==='undefined')return;
 let fr=card.querySelector(':scope>#ckframe');if(!fr){fr=document.createElement('div');fr.id='ckframe';fr.setAttribute('aria-hidden','true');
  fr.innerHTML=['sl','sr','dl','dr','ft1','ft2','tl','tr','cr','fb1','fb2','bl','br','bc'].map(n=>`<i data-p="${n}"></i>`).join('');card.prepend(fr);card.classList.add('ck-framed')}
 const cw=card.offsetWidth,ch=card.offsetHeight;if(!cw||!ch)return;if(fr._k===cw+'x'+ch)return;fr._k=cw+'x'+ch;
 const NW=1163,NH=1353,s=Math.min(cw,ch*NW/NH)/NW,F=CK_FRAME;
 const set=(id,src,x,y,w,h)=>{const e=fr.querySelector(`[data-p="${id}"]`);const f=F[src];e.style.cssText=`left:${x}px;top:${y}px;width:${w==null?f[1]*s:w}px;height:${h==null?f[2]*s:h}px;background-image:url('${f[0]}')`};
 const th=260*s,bh=193*s,sw=48*s,tlw=330*s,crw=503*s,blw=250*s,bcw=303*s,g1=Math.max(0,(cw-2*tlw-crw)/2),g2=Math.max(0,(cw-2*blw-bcw)/2);
 set('sl','sl',0,th-2,null,ch-th-bh+4);set('sr','sr',cw-sw,th-2,null,ch-th-bh+4);set('dl','dl',0,ch/2-40*s);set('dr','dr',cw-sw,ch/2-40*s);
 set('ft1','ft',tlw-1,0,g1+2,null);set('ft2','ft',cw-tlw-g1-1,0,g1+2,null);set('tl','tl',0,0);set('tr','tr',cw-tlw,0);set('cr','cr',(cw-crw)/2,0);
 set('fb1','fb',blw-1,ch-bh,g2+2,null);set('fb2','fb',cw-blw-g2-1,ch-bh,g2+2,null);set('bl','bl',0,ch-bh);set('br','br',cw-blw,ch-bh);set('bc','bc',(cw-bcw)/2,ch-bh);
 card.style.setProperty('--fr-s',s.toFixed(4))}
(function(){const o=ckHomeFit;ckHomeFit=function(){const r=o.apply(this,arguments);try{ckFrameFit()}catch(_){}return r}})();
addEventListener('resize',()=>setTimeout(ckFrameFit,120));setTimeout(ckFrameFit,2300);
