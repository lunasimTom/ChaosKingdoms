/* runtime fixes (source-level fixes live in build.py) */
(function(){
'use strict';
/* Atlas realm names: shrink each label until it fits on one line instead of
   being truncated with an ellipsis ("Forest…", "Underground…"). */
function fitPins(){
 document.querySelectorAll('#regs .realm-pin:not(.final-throne-pin) .pin-name').forEach(n=>{
  n.style.fontSize='';let fs=parseFloat(getComputedStyle(n).fontSize)||11;let guard=0;
  while(n.scrollWidth>n.clientWidth+1&&fs>7&&guard++<12){fs-=.5;n.style.setProperty('font-size',fs+'px','important')}
 });
}
const regs=document.getElementById('regs');
if(regs){new MutationObserver(()=>requestAnimationFrame(fitPins)).observe(regs,{childList:true});addEventListener('resize',()=>requestAnimationFrame(fitPins))}
})();
