/* ===== Chaos Kingdoms v7.0 · gold frame, steady home layout, map polish ===== */

// ---- 1. gold frame: one original PNG along the outer screen edge (border-image keeps corners undistorted) ----
(function(){const a=document.getElementById('app');if(!a||typeof CK_FRAME==='undefined')return;const fr=document.createElement('div');fr.id='ckframe';fr.setAttribute('aria-hidden','true');
 fr.style.setProperty('--fimg',`url(${CK_FRAME})`);a.appendChild(fr)})();

// ---- 2. home fit: scale the menu card (transform, measured from its natural size) so it always fits inside the frame.
//         Runs from a ResizeObserver before paint, so the menu never jumps after it appears. ----
ckHomeFit=function(){const t=document.getElementById('title'),card=t&&t.querySelector('.tcard.ck-home');if(!card||!t.offsetWidth)return;
 card.style.zoom='';card.style.transformOrigin='50% 0';t.scrollTop=0;const cs=getComputedStyle(t),pt=parseFloat(cs.paddingTop),avail=t.clientHeight-pt-parseFloat(cs.paddingBottom),need=card.offsetHeight;
 if(need<=avail){if(card.style.transform)card.style.transform='';return}
 const z=Math.max(.5,avail/need),A=document.getElementById('app'),k=(A.getBoundingClientRect().width/A.offsetWidth)||1;card.style.transform=`scale(${z.toFixed(4)})`;
 const dy=(t.getBoundingClientRect().top+pt*k-card.getBoundingClientRect().top)/k;card.style.transform=`translateY(${dy.toFixed(1)}px) scale(${z.toFixed(4)})`};
(function(){let ro=null,seen=null;const hook=()=>{const t=document.getElementById('title'),card=t&&t.querySelector('.tcard.ck-home');if(!card||card===seen)return;seen=card;
  if(ro)ro.disconnect();ro=new ResizeObserver(()=>ckHomeFit());ro.observe(card);ro.observe(t);ckHomeFit()};
 hook();new MutationObserver(hook).observe(document.getElementById('title')||document.body,{childList:true,subtree:true});addEventListener('resize',()=>ckHomeFit())})();

// ---- 3. load every font face once the game is idle, so the first language switch has nothing left to load ----
setTimeout(()=>{try{document.fonts.forEach(f=>{if(f.status==='unloaded')f.load().catch(()=>{})})}catch(_){}},400);

// ---- 4. map panel: the Fourfold Throne gets a boss line like every other map; tidy the kingdom title ----
(function(){const o=buildMap;buildMap=function(){const r=o.apply(this,arguments);try{
  const d=document.querySelector('#map .realm-detail');if(d&&selectedRealm===12){let h=d.querySelector(':scope>.realm-hint');if(!h){h=document.createElement('div');h.className='realm-hint';d.querySelector('.realm-detail-head').after(h)}
   h.textContent=lvZ('终极首领：','Ultimate Bosses: ')+[13,14,15,16].map(i=>TL(BOSS[i])).join(' · ');h.style.setProperty('display','block','important');d.classList.add('ck-thr')}
  document.querySelectorAll('#map h1,#map h2,#map .map-title,#map .mt,#map b,#map span').forEach(e=>{if(e.children.length===0&&/’s kingdom$/.test(e.textContent))e.textContent=e.textContent.replace(/’s kingdom$/,"'s Kingdom")})}catch(_){}return r}})();

// ---- 5. the medal hint line is always part of the commander card (startup used to draw the card without it,
//         so the first language switch added a line and the menu changed size) ----
(function(){const ensure=()=>{const box=document.getElementById('ckhc');if(!box)return;let h=box.querySelector('.ck-hhint');
  const txt=`<span>${lvZ('点击选择要在主界面展示的勋章','Tap to choose the medals shown on your card')}</span><b>›</b>`;
  if(!h){h=document.createElement('div');h.className='ck-hhint';box.insertBefore(h,box.firstChild)}if(h.innerHTML!==txt)h.innerHTML=txt};
 const t=document.getElementById('title');if(t)new MutationObserver(ensure).observe(t,{childList:true,subtree:true});ensure();
 setTimeout(()=>{try{ckHomeCard()}catch(_){}ensure()},1520)})();
