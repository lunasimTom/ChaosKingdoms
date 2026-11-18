/* =====================================================================
   CHAOS KINGDOMS · CK3D tower renderer (pilot: Cannon + Holy)
   Real 3D meshes (lathe / box / extrude) lit with a key light, sky/ground
   ambience, Blinn-Phong highlights and height AO, drawn once into cached
   sprites. Each tower = a static BASE + an independently rotating TURRET
   with its own pivot and muzzle point, so aim, projectiles and flashes line
   up from every direction.
   ===================================================================== */
(function(){
'use strict';
/* ---------------- camera / light (matches the game's 3/4 view) ---------------- */
const SE=.5,CE=.866;                       // screen_y = Y*SE - Z*CE ; toward-camera = (0,CE,SE)
const CAM=[0,CE,SE];
const LIGHT=norm([-.55,.35,.76]);          // key light: upper left, slightly front
const HALF=norm([LIGHT[0]+CAM[0],LIGHT[1]+CAM[1],LIGHT[2]+CAM[2]]);
function norm(v){const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l]}
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];

/* ---------------- materials ---------------- */
// c: base colour, s: specular strength, p: shininess, m: metal (tints highlight), r: roughness grain, e: emissive
const MAT={
 iron:   {c:[58,63,76],  s:.55,p:28,m:1,r:.5},
 gun:    {c:[84,94,112], s:.85,p:42,m:1,r:.35},
 gunDark:{c:[38,42,52],  s:.6, p:30,m:1,r:.4},
 red:    {c:[176,36,42], s:.45,p:30,m:0,r:.25},
 redDark:{c:[118,22,30], s:.35,p:24,m:0,r:.3},
 gold:   {c:[240,188,78],s:1.0,p:34,m:1,r:.25},
 goldDark:{c:[184,128,44],s:.85,p:26,m:1,r:.3},
 stone:  {c:[96,99,110], s:.08,p:8, m:0,r:1},
 stoneL: {c:[146,149,160],s:.1,p:8, m:0,r:1},
 wood:   {c:[104,64,36], s:.12,p:10,m:0,r:.8},
 marble: {c:[236,232,224],s:.35,p:22,m:0,r:.35},
 marbleS:{c:[206,200,190],s:.25,p:18,m:0,r:.45},
 glass:  {c:[60,130,235],s:1.0,p:60,m:0,r:0,e:.55},
 crystal:{c:[255,236,160],s:1.0,p:70,m:0,r:0,e:.8},
 feather:{c:[252,252,255],s:.2,p:10,m:0,r:.25,e:.5},
 ember:  {c:[255,150,60], s:0, p:1, m:0,r:0,e:1}
};
const SKY=[150,170,205],GROUND=[70,58,48];
function shade(mat,n,z,zTop){
 const M=MAT[mat]||MAT.stone,c=M.c;
 const nl=Math.max(0,dot(n,LIGHT)),hemi=.5+.5*n[2];
 const ao=.72+.28*Math.min(1,Math.max(0,z/(zTop*.55)));      // ground-contact darkening
 let r=0,g=0,b=0;
 const amb=.34,dif=.84;
 for(let i=0;i<3;i++){
  const sk=i===0?SKY[0]:i===1?SKY[1]:SKY[2],gr=i===0?GROUND[0]:i===1?GROUND[1]:GROUND[2];
  const ambC=(sk*hemi+gr*(1-hemi))/255;
  let v=c[i]*(amb*ambC*1.25+dif*nl)*ao;
  if(M.e)v=v*(1-M.e)+c[i]*M.e*1.05;
  if(i===0)r=v;else if(i===1)g=v;else b=v}
 const sp=M.s*Math.pow(Math.max(0,dot(n,HALF)),M.p)*ao;
 const tint=M.m?c:[255,255,255];
 r+=sp*(M.m?tint[0]*.9+40:255);g+=sp*(M.m?tint[1]*.9+40:255);b+=sp*(M.m?tint[2]*.9+40:255);
 // rim light from behind-left keeps silhouettes readable on dark ground
 const rim=Math.pow(1-Math.max(0,dot(n,CAM)),3)*.18*(n[2]>-.2?1:0);
 r+=rim*120;g+=rim*130;b+=rim*150;
 return[r,g,b]}
const css=c=>'rgb('+(c[0]<0?0:c[0]>255?255:c[0]|0)+','+(c[1]<0?0:c[1]>255?255:c[1]|0)+','+(c[2]<0?0:c[2]>255?255:c[2]|0)+')';

/* ---------------- mesh builders ---------------- */
// face: {v:[[x,y,z]...], m, s(smooth), h(normal hint)}
function Mesh(){this.f=[]}
Mesh.prototype.add=function(v,m,hint,smooth){this.f.push({v,m,h:hint,s:!!smooth});return this};
Mesh.prototype.merge=function(o){for(const f of o.f)this.f.push(f);return this};
Mesh.prototype.map=function(fn){const o=new Mesh();for(const f of this.f)o.f.push({v:f.v.map(p=>fn(p)),m:f.m,h:f.h?fn([f.h[0],f.h[1],f.h[2]],1):null,s:f.s});return o};
const T={
 move:(dx,dy,dz)=>(p,isN)=>isN?p:[p[0]+dx,p[1]+dy,p[2]+dz],
 rotZ:a=>{const c=Math.cos(a),s=Math.sin(a);return p=>[p[0]*c-p[1]*s,p[0]*s+p[1]*c,p[2]]},
 rotY:a=>{const c=Math.cos(a),s=Math.sin(a);return p=>[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c]},
 rotX:a=>{const c=Math.cos(a),s=Math.sin(a);return p=>[p[0],p[1]*c-p[2]*s,p[1]*s+p[2]*c]},
 scale:(sx,sy,sz)=>(p,isN)=>isN?norm([p[0]/sx,p[1]/sy,p[2]/sz]):[p[0]*sx,p[1]*sy,p[2]*sz]};
// lathe around the Z axis: prof = [[r,z],...] bottom->top; mats per segment or one
function lathe(prof,n,mat,opt={}){
 const m=new Mesh(),a0=opt.a0||0,cap=opt.cap!==false;
 const ring=(r,z)=>Array.from({length:n},(_,i)=>{const a=a0+i/n*Math.PI*2;return[Math.cos(a)*r,Math.sin(a)*r,z]});
 const R=prof.map(([r,z])=>ring(r,z));
 for(let k=0;k<prof.length-1;k++){const mt=Array.isArray(mat)?mat[k]:mat;if(!mt)continue;
  const dr=prof[k+1][0]-prof[k][0],dz=prof[k+1][1]-prof[k][1];
  for(let i=0;i<n;i++){const j=(i+1)%n,a=a0+(i+.5)/n*Math.PI*2;
   const hint=norm([Math.cos(a)*dz,Math.sin(a)*dz,-dr]);
   m.add([R[k][i],R[k][j],R[k+1][j],R[k+1][i]],mt,hint,opt.smooth!==false)}}
 if(cap){const t=prof[prof.length-1],b=prof[0],mt=Array.isArray(mat)?mat[mat.length-1]:mat;
  if(t[0]>.01)m.add(R[R.length-1].slice().reverse(),opt.capMat||mt,[0,0,1]);
  if(b[0]>.01&&opt.bottom)m.add(R[0],mt,[0,0,-1])}
 return m}
function box(x0,y0,z0,x1,y1,z1,mat,matTop){
 const m=new Mesh(),P=(x,y,z)=>[x,y,z];
 m.add([P(x0,y0,z1),P(x1,y0,z1),P(x1,y1,z1),P(x0,y1,z1)],matTop||mat,[0,0,1]);
 m.add([P(x0,y1,z0),P(x1,y1,z0),P(x1,y1,z1),P(x0,y1,z1)],mat,[0,1,0]);
 m.add([P(x0,y0,z0),P(x1,y0,z0),P(x1,y0,z1),P(x0,y0,z1)],mat,[0,-1,0]);
 m.add([P(x1,y0,z0),P(x1,y1,z0),P(x1,y1,z1),P(x1,y0,z1)],mat,[1,0,0]);
 m.add([P(x0,y0,z0),P(x0,y1,z0),P(x0,y1,z1),P(x0,y0,z1)],mat,[-1,0,0]);
 return m}
// chamfered square block: footprint half-size h, bevel b
function bevelBlock(h,b,z0,z1,mat,matTop){
 const pts=[[h-b,-h],[h,-h+b],[h,h-b],[h-b,h],[-h+b,h],[-h,h-b],[-h,-h+b],[-h+b,-h]];
 return prism(pts,z0,z1,mat,matTop)}
// vertical prism from a convex XY polygon (counter-clockwise)
function prism(pts,z0,z1,mat,matTop){
 const m=new Mesh(),n=pts.length;
 m.add(pts.map(p=>[p[0],p[1],z1]),matTop||mat,[0,0,1]);
 for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],nx=b[1]-a[1],ny=-(b[0]-a[0]);
  m.add([[a[0],a[1],z0],[b[0],b[1],z0],[b[0],b[1],z1],[a[0],a[1],z1]],mat,norm([nx,ny,0]))}
 return m}
// extrude a 2D shape drawn in the XZ plane, thickness along Y (centred)
function extrudeXZ(pts,th,mat,matSide){
 const m=new Mesh(),n=pts.length,y0=-th/2,y1=th/2;
 m.add(pts.map(p=>[p[0],y1,p[1]]),mat,[0,1,0]);
 m.add(pts.map(p=>[p[0],y0,p[1]]).reverse(),mat,[0,-1,0]);
 for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];
  m.add([[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]]],matSide||mat,norm([b[1]-a[1],0,-(b[0]-a[0])]))}
 return m}
function sphere(r,n,mat){const pr=[];for(let i=0;i<=n;i++){const t=-Math.PI/2+i/n*Math.PI;pr.push([Math.cos(t)*r+.001,Math.sin(t)*r])}return lathe(pr,n*2,mat,{cap:false})}
function bolts(rad,z,n,r,mat){const m=new Mesh();for(let i=0;i<n;i++){const a=i/n*Math.PI*2;m.merge(sphere(r,3,mat).map(T.move(Math.cos(a)*rad,Math.sin(a)*rad,z)))}return m}

/* ---------------- rasteriser ---------------- */
let NOISE=null;
function noise(){if(NOISE)return NOISE;const s=128,c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d'),d=g.createImageData(s,s);
 for(let i=0;i<s*s;i++){const v=Math.random(),k=i*4;const dark=v<.5;d.data[k]=d.data[k+1]=d.data[k+2]=dark?0:255;d.data[k+3]=Math.abs(v-.5)*2>.82?60:Math.abs(v-.5)*2*14|0}
 g.putImageData(d,0,0);
 // a few scratches
 g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=.6;for(let i=0;i<14;i++){g.beginPath();const x=Math.random()*s,y=Math.random()*s,a=Math.random()*6.28,l=4+Math.random()*10;g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke()}
 return NOISE=c}
// render mesh into a fresh canvas. R = px per world unit. ox/oy = screen pivot inside canvas.
function raster(mesh,yaw,R,W,H,ox,oy,opt={}){
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 const cy=Math.cos(yaw),sy=Math.sin(yaw),zTop=opt.zTop||60;
 const list=[];
 for(const f of mesh.f){
  const v=f.v.map(p=>[p[0]*cy-p[1]*sy,p[0]*sy+p[1]*cy,p[2]]);
  let n=norm(cross(sub(v[1],v[0]),sub(v[2],v[0])));
  if(f.h){const h=[f.h[0]*cy-f.h[1]*sy,f.h[0]*sy+f.h[1]*cy,f.h[2]];if(dot(n,h)<0)n=[-n[0],-n[1],-n[2]];if(f.s)n=norm([n[0]*.25+h[0]*.75,n[1]*.25+h[1]*.75,n[2]*.25+h[2]*.75])}
  if(dot(n,CAM)<=0.001)continue;
  let cx=0,cyy=0,cz=0;for(const p of v){cx+=p[0];cyy+=p[1];cz+=p[2]}const k=v.length;cx/=k;cyy/=k;cz/=k;
  list.push({v,n,m:f.m,s:f.s,d:cyy*CE+cz*SE,z:cz})}
 list.sort((a,b)=>a.d-b.d);
 g.lineJoin='round';
 for(const f of list){
  const col=shade(f.m,f.n,f.z,zTop),c=css(col);
  g.beginPath();f.v.forEach((p,i)=>{const x=ox+p[0]*R,y=oy+(p[1]*SE-p[2]*CE)*R;i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();
  g.fillStyle=c;g.fill();
  if(f.s){g.strokeStyle=c;g.lineWidth=.9;g.stroke()}            // hide seams on smooth surfaces
  else{g.strokeStyle='rgba(12,10,16,.55)';g.lineWidth=.8;g.stroke()} // crisp panel edges
 }
 // material grain / wear, kept inside the silhouette
 if(opt.grain!==0){g.save();g.globalCompositeOperation='source-atop';g.globalAlpha=opt.grain||.5;const N=noise();for(let y=0;y<H;y+=128)for(let x=0;x<W;x+=128)g.drawImage(N,x,y);g.restore()}
 return cv}

/* ---------------- tower definitions ---------------- */
// Units: 100 = one tile. Origin = tile centre on the ground. Turret pivot = (0,0,pz).
const DEF={};

/* ===== CANNON: iron-banded stone emplacement + red & gold bronze-age cannon on a carriage ===== */
DEF.cannon={
 base(lv){
  const m=new Mesh();
  // stone plinth (chamfered), iron cap plate
  m.merge(bevelBlock(33,9,0,9,'stone','stoneL'));
  m.merge(bevelBlock(30,8,9,17,'stone','stoneL'));
  m.merge(lathe([[25,17],[25,19],[23.5,20],[23.5,21],[21,22]],20,['iron','gold','gold','iron'],{capMat:'iron'}));
  // corner iron straps + rivets
  if(lv>=2)for(const[sx,sy]of[[1,1],[1,-1],[-1,1],[-1,-1]]){m.merge(box(sx*30-4,sy*30-4,0,sx*30+4,sy*30+4,18,'iron','gunDark').map(T.move(0,0,0)));m.merge(sphere(1.8,3,'gold').map(T.move(sx*33,sy*29,13)))}
  // gold trim course
  if(lv>=3){m.merge(prism([[30,-22],[30,22],[22,30],[-22,30],[-30,22],[-30,-22],[-22,-30],[22,-30]].map(p=>[p[0]*1.02,p[1]*1.02]),9,10.6,'gold'));
   for(const[sx,sy]of[[1,1],[1,-1],[-1,1],[-1,-1]])m.merge(lathe([[4.5,18],[4.5,26],[3,28],[0,31]],8,['stoneL','gold','gold'],{}).map(T.move(sx*27,sy*27,0)))}
  // master: taller corner obelisks with gold flame tips + red & gold banners on every face
  if(lv>=4){for(const[sx,sy]of[[1,1],[1,-1],[-1,1],[-1,-1]])m.merge(lathe([[3.4,28],[3.4,33],[2.2,35],[0,40]],8,['stoneL','gold','gold'],{}).map(T.move(sx*27,sy*27,0)));
   for(let f=0;f<4;f++){const a=f*Math.PI/2,ban=extrudeXZ([[-6,16],[6,16],[6,6],[0,3],[-6,6]],1,'red','gold');
    m.merge(ban.map(T.rotZ(Math.PI/2)).map(T.move(31.2,0,0)).map(T.rotZ(a)));m.merge(extrudeXZ([[-7,16],[7,16],[7,17.6],[-7,17.6]],1.4,'gold').map(T.rotZ(Math.PI/2)).map(T.move(31.4,0,0)).map(T.rotZ(a)))}}
  return m},
 turret(lv){
  const m=new Mesh();
  const L=[30,34,38,42][lv-1],Rb=[7.5,8.2,9,10][lv-1];
  // turntable
  m.merge(lathe([[19,0],[19,3],[17,4.5]],18,'gunDark',{capMat:'iron'}));
  m.merge(bolts(15.5,4.6,8,1.2,'gold'));
  // carriage cheeks (red lacquer, gold edging) - extruded side profiles
  const cheek=[[-15,4],[13,4],[13,9],[6,20],[-6,22],[-15,14]];
  for(const s of[-1,1]){m.merge(extrudeXZ(cheek,3.2,'red','redDark').map(T.move(0,s*(Rb+3),0)));
   m.merge(extrudeXZ([[-15,4],[13,4],[13,5.6],[-15,5.6]],3.6,'gold').map(T.move(0,s*(Rb+3),0)));
   // gold medallion on the outer face
   m.merge(lathe([[4.6,0],[4.6,1.2],[3,2]],12,['goldDark','gold'],{}).map(T.rotX(-s*Math.PI/2)).map(T.move(-2,s*(Rb+4.9),13)));
   m.merge(lathe([[2,0],[1.4,1]],8,'red',{}).map(T.rotX(-s*Math.PI/2)).map(T.move(-2,s*(Rb+6.2),13)))}
  // barrel along +X, elevated 9 degrees, trunnion at (0,0,18)
  const Rm=Rb*1.18;
  const prof=[[0.1,-12],[Rb*.55,-12],[Rb*.7,-10.5],[Rb,-9],[Rb,-6],[Rb*1.1,-6],[Rb*1.1,-3],[Rb*.94,-3],[Rb*.9,L*.45],[Rb*1.02,L*.45],[Rb*1.02,L*.55],[Rb*.86,L*.55],[Rb*.84,L-6],[Rm,L-5],[Rm,L],[Rb*.62,L]];
  const mats=['gold','gold','gun','gun','red','red','gun','gun','gold','gold','gun','gun','gold','gold','gunDark'];
  let barrel=lathe(prof,22,mats,{capMat:'gunDark'}).map(T.rotY(Math.PI/2));       // axis -> +X
  // bore
  barrel.merge(lathe([[Rb*.62,L-.01],[Rb*.62,L+.05]],18,'gunDark',{capMat:'gunDark'}).map(T.rotY(Math.PI/2)));
  if(lv>=2)barrel.merge(lathe([[Rb*1.12,L*.2],[Rb*1.12,L*.28]],22,'red',{}).map(T.rotY(Math.PI/2)));
  if(lv>=3)barrel.merge(lathe([[Rb*1.14,L*.7],[Rb*1.14,L*.76]],22,'gold',{}).map(T.rotY(Math.PI/2)));
  if(lv>=4){barrel.merge(lathe([[Rm*1.12,L-2.5],[Rm*1.12,L+1.2],[Rm*.9,L+1.2]],22,'gold',{}).map(T.rotY(Math.PI/2)));
   for(let i=0;i<6;i++){const a=i/6*Math.PI*2;barrel.merge(box(L-1,-1.2,Rm*1.1,L+4,1.2,Rm*1.1+3,'gold').map(T.rotX(a)))}}
  barrel=barrel.map(T.rotY(-.16)).map(T.move(0,0,18));
  m.merge(barrel);
  // trunnion axle + gold caps
  m.merge(lathe([[2.4,-(Rb+5)],[2.4,Rb+5]],10,'iron',{}).map(T.rotX(Math.PI/2)).map(T.move(0,0,18)));
  // master: twin powder kegs on the carriage rear
  if(lv>=4)for(const s of[-1,1])m.merge(lathe([[3.6,0],[4.2,3],[3.6,6]],10,['wood','wood'],{}).map(T.rotX(Math.PI/2)).map(T.move(-12,s*4,10)));
  return m},
 pz:[20,20,21,23],                    // turret pivot height on the base
 muzzle:lv=>{const L=[30,34,38,42][lv-1];return{x:L*Math.cos(.16),z:18+L*Math.sin(.16)}},
 kick:7,                             // recoil distance (units)
 scale:1.15
};

/* ===== HOLY: white-marble shrine with gold pillars, sapphire windows and wings; rotating seraph lance ===== */
DEF.holy={
 base(lv){
  const m=new Mesh(),H=[40,45,50,55][lv-1],w=12.5;
  // stepped marble plinth with a gold course
  m.merge(bevelBlock(27,6,0,5,'marbleS','marble'));
  m.merge(bevelBlock(23.5,5,5,6.2,'gold'));
  m.merge(bevelBlock(22,5,6.2,10,'marble','marble'));
  // slender shrine body
  m.merge(prism([[w,-w],[w,w],[-w,w],[-w,-w]].reverse(),10,H,'marble','marbleS'));
  // sapphire arched windows with gold frames on every face
  for(let f=0;f<4;f++){const a=f*Math.PI/2;
   m.merge(extrudeXZ([[-5.2,14],[5.2,14],[5.2,H-12],[3.7,H-8.2],[0,H-6.6],[-3.7,H-8.2],[-5.2,H-12]],1.4,'gold').map(T.rotZ(Math.PI/2)).map(T.move(w+.3,0,0)).map(T.rotZ(a)));
   m.merge(extrudeXZ([[-3.8,15.2],[3.8,15.2],[3.8,H-12.4],[2.6,H-9.4],[0,H-8.2],[-2.6,H-9.4],[-3.8,H-12.4]],1.2,'glass','goldDark').map(T.rotZ(Math.PI/2)).map(T.move(w+1,0,0)).map(T.rotZ(a)))}
  // gold corner pillars with capitals and finials
  for(const[sx,sy]of[[1,1],[1,-1],[-1,1],[-1,-1]])m.merge(lathe([[3.4,10],[2.7,12],[2.7,H-2],[3.8,H],[3.8,H+2],[2.2,H+4],[0,H+9]],10,['gold','gold','gold','gold','gold','gold'],{}).map(T.move(sx*w,sy*w,0)));
  // cornice and tall gold spire
  m.merge(bevelBlock(w+3.5,3,H,H+3,'gold','goldDark'));
  m.merge(lathe([[w+1,H+3],[w-1,H+6],[4,H+16],[1.6,H+24],[.2,H+30]],8,['gold','marble','gold','gold'],{a0:Math.PI/8}));
  // wings: large white feather fans sweeping up and out (as in the build-menu art)
  if(lv>=2){const sc=[0,1,1.15,1.3][lv-1];
   for(const s of[-1,1]){const fan=new Mesh();
    for(let i=0;i<6;i++){const len=(13+i*3.4)*sc,ang=.15+i*.19;
     fan.merge(extrudeXZ([[0,0],[len*.16,2.6],[len,1.4],[len*1.05,-.4],[len*.18,-2.2]],1.1,'feather','marbleS').map(T.rotY(-ang)).map(T.move(0,i*.5,i*.4)))}
    m.merge(fan.map(T.rotZ(s>0?0:Math.PI)).map(T.rotZ(s*.55)).map(T.move(s*(w+1),3,H*.58)))}}
  // second tier: marble pinnacles on the plinth corners
  if(lv>=3)for(const[sx,sy]of[[1,1],[1,-1],[-1,1],[-1,-1]])m.merge(lathe([[2.6,0],[2.6,7],[1.4,9],[0,16]],6,['marble','gold','gold'],{}).map(T.move(sx*21,sy*21,6)));
  // master: flying buttresses + sun disc behind the spire
  if(lv>=4){for(const a of[Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4])m.merge(box(-1.4,-1.4,6,1.4,1.4,H*.7,'marble','gold').map(T.move(19,0,0)).map(T.rotZ(a)));
   m.merge(lathe([[10,0],[11.4,0],[11.4,1],[10,1]],24,['gold','gold','gold'],{cap:false}).map(T.rotX(Math.PI/2)).map(T.move(0,-3,H+18)))}
  return m},
 turret(lv){
  const m=new Mesh();
  // gold crown ring with spikes
  m.merge(lathe([[11,0],[12,2],[11,4],[9,4]],16,['gold','gold','gold'],{capMat:'goldDark'}));
  const ns=[6,6,8,8][lv-1];
  for(let i=0;i<ns;i++){const a=i/ns*Math.PI*2;if(Math.abs(Math.cos(a)-1)<.01)continue;
   m.merge(lathe([[2.2,3],[0.1,13+(i%2?0:4)]],5,'gold',{}).map(T.move(Math.cos(a)*10,Math.sin(a)*10,0)))}
  // central sun crystal on a spindle
  m.merge(lathe([[2,3],[2,10]],8,'gold',{}));
  const cr=lathe([[0.1,8],[4.5,13],[0.1,22]],6,'crystal',{cap:false});
  m.merge(cr);
  // seraph lance: forward arm along +X holding the emitter crystal (aims at the target)
  const arm=extrudeXZ([[4,6],[20,8.5],[24,10],[20,11.5],[4,9.5]],2.4,'gold','goldDark');
  m.merge(arm);
  m.merge(lathe([[0.1,-3],[2.6,0],[0.1,5]],6,'crystal',{cap:false}).map(T.rotY(Math.PI/2)).map(T.move(25,0,10)));
  // halo (tilted toward the aim direction)
  const halo=lathe([[8.5,0],[9.6,0],[9.6,1.2],[8.5,1.2]],24,['gold','gold','gold'],{cap:false});
  m.merge(halo.map(T.rotY(.35)).map(T.move(-1,0,26)));
  if(lv>=3)m.merge(lathe([[11.5,0],[12.3,0],[12.3,.9],[11.5,.9]],24,['gold','gold','gold'],{cap:false}).map(T.rotY(-.3)).map(T.move(0,0,29)));
  if(lv>=4)for(const s of[-1,1])m.merge(extrudeXZ([[4,8],[16,13],[18,16],[6,12]],1.6,'feather','marbleS').map(T.rotZ(s*.5)));
  return m},
 pz:[66,71,76,81],
 muzzle:lv=>({x:27,z:10}),
 kick:2,
 scale:1.0
};

/* ---------------- caches + drawing ---------------- */
const NA=64,RPX=1.5;                           // facings, px per unit in the cache
const baseC={},turC=new Map(),meshC={},TUR_MAX=160;
function mesh(k,part,lv){const key=k+part+lv;return meshC[key]||(meshC[key]=DEF[k][part](lv))}
function bounds(ms){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const f of ms.f)for(const p of f.v){const r=Math.hypot(p[0],p[1]);x0=Math.min(x0,-r);x1=Math.max(x1,r);const sy0=-p[2]*CE-r*SE,sy1=-p[2]*CE+r*SE;y0=Math.min(y0,sy0);y1=Math.max(y1,sy1)}return{x0,x1,y0,y1}}
function sprite(k,part,lv,yaw){
 const ms=mesh(k,part,lv),b=bounds(ms),pad=3,W=Math.ceil((b.x1-b.x0)*RPX)+pad*2,H=Math.ceil((b.y1-b.y0)*RPX)+pad*2,ox=-b.x0*RPX+pad,oy=-b.y0*RPX+pad;
 return{c:raster(ms,yaw,RPX,W,H,ox,oy,{zTop:part==='base'?40:30,grain:part==='base'?(k==='holy'?.22:.38):.28}),ox,oy}}
let budget=0,frame=-1;
function base(k,lv){const key=k+lv;return baseC[key]||(baseC[key]=sprite(k,'base',lv,0))}
function turret(k,lv,yaw){
 const d=((Math.round(yaw/(Math.PI*2)*NA)%NA)+NA)%NA,key=k+lv+':'+d;let s=turC.get(key);if(s)return s;
 const TMv=(typeof TM!=='undefined')?TM:0;if(frame!==TMv){frame=TMv;budget=0}
 if(budget>=2){for(let j=1;j<NA/2;j++){s=turC.get(k+lv+':'+((d+j)%NA))||turC.get(k+lv+':'+((d-j+NA)%NA));if(s)return s}}
 budget++;s=sprite(k,'turret',lv,d/NA*Math.PI*2);turC.set(key,s);if(turC.size>TUR_MAX)turC.delete(turC.keys().next().value);return s}
// screen aim angle -> world yaw (ground is foreshortened by SE on screen)
const yawOf=a=>Math.atan2(Math.sin(a)/SE,Math.cos(a));
let GLOW=null;function glow(){if(GLOW)return GLOW;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,240,190,1)');gr.addColorStop(.35,'rgba(255,214,120,.55)');gr.addColorStop(1,'rgba(255,200,90,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return GLOW=c}

window.CK3D={
 has:k=>!!DEF[k],
 // p: tile centre on screen, u: px per unit (tw/100), a: screen aim angle, rc: recoil 0..1
 draw(ctx,k,lv,p,u,a,rc,stun,T){
  const d=DEF[k],sz=(1+.06*(lv-1))*(d.scale||1),s=u*sz/RPX,footY=p.y+u*19,yaw=yawOf(a);
  // contact shadow
  ctx.save();ctx.fillStyle='rgba(4,6,14,.42)';ctx.beginPath();ctx.ellipse(p.x+u*4,footY+u*2,u*38*sz,u*15*sz,0,0,7);ctx.fill();ctx.restore();
  const b=base(k,lv);ctx.drawImage(b.c,p.x-b.ox*s,footY-b.oy*s,b.c.width*s,b.c.height*s);
  // turret: pivot sits on top of the base; recoil slides it back along the aim
  const pz=d.pz[lv-1]*sz,kick=(rc>0?Math.pow(rc,1.6):0)*d.kick*u*sz,cx=p.x-Math.cos(yaw)*kick,cy=footY-pz*CE*u-Math.sin(yaw)*SE*kick;
  const t=turret(k,lv,yaw);ctx.drawImage(t.c,cx-t.ox*s,cy-t.oy*s,t.c.width*s,t.c.height*s);
  // living light: holy crystal pulse / cannon fuse ember (tiny, additive, cached sprite)
  if(k==='holy'){const mz=this.muzzle({k,lv,a,rc:0,x:0,y:0},p,u),pulse=.55+.45*Math.sin(T*3+p.x*.01);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35+.35*pulse+(rc>0?rc*.5:0);const r=u*(9+4*pulse)*sz;ctx.drawImage(glow(),mz[0]-r,mz[1]-r,2*r,2*r);ctx.globalAlpha=.25+.15*pulse;const r2=u*14*sz;ctx.drawImage(glow(),cx-r2,cy-u*20*sz-r2,2*r2,2*r2);ctx.restore()}
  else if(k==='cannon'&&rc>.55){const mz=this.muzzle({k,lv,a,rc},p,u);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(rc-.55)*2;const r=u*12*sz;ctx.drawImage(glow(),mz[0]-r,mz[1]-r,2*r,2*r);ctx.restore()}
  if(stun){ctx.save();ctx.fillStyle='#ffd34a';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(p.x+Math.cos(T*5+i*2.1)*26*u,footY-80*u*sz+Math.sin(T*5+i*2.1)*7*u,3.8*u,0,7);ctx.fill()}ctx.restore()}
 },
 // screen position of the firing point for tower t (projectiles + muzzle flash start here)
 muzzle(t,p,u){
  const d=DEF[t.k],lv=t.lv||1,sz=(1+.06*(lv-1))*(d.scale||1),yaw=yawOf(t.a||0),m=d.muzzle(lv),footY=p.y+u*19,pz=d.pz[lv-1]*sz;
  const kick=(t.rc>0?Math.pow(t.rc,1.6):0)*d.kick*sz;
  const x=(m.x*sz-kick)*Math.cos(yaw),y=(m.x*sz-kick)*Math.sin(yaw),z=pz+m.z*sz;
  return[p.x+x*u,footY+(y*SE-z*CE)*u]},
 // dev / preview helpers
 _sprite:sprite,_yawOf:yawOf,stats(){return{bases:Object.keys(baseC).length,turrets:turC.size}}
};
})();
