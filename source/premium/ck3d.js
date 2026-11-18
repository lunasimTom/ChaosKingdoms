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
 iron:   {c:[86,94,112], s:.7, p:32,m:1,r:.3},
 gun:    {c:[118,130,152],s:1.0,p:48,m:1,r:.2},
 gunDark:{c:[56,62,76],  s:.75,p:34,m:1,r:.25},
 bore:   {c:[14,14,20],  s:.25,p:20,m:1,r:0},
 red:    {c:[206,44,50], s:.6, p:36,m:0,r:.15},
 redDark:{c:[146,28,38], s:.45,p:28,m:0,r:.2},
 gold:   {c:[255,204,92],s:1.15,p:36,m:1,r:.12},
 goldDark:{c:[208,148,52],s:.95,p:28,m:1,r:.15},
 stone:  {c:[120,126,142],s:.18,p:14,m:0,r:.6},
 stoneL: {c:[168,174,190],s:.22,p:14,m:0,r:.6},
 wood:   {c:[132,84,46], s:.2, p:12,m:0,r:.5},
 marble: {c:[246,244,238],s:.45,p:26,m:0,r:.15},
 marbleS:{c:[220,216,208],s:.35,p:22,m:0,r:.2},
 glass:  {c:[80,160,255],s:1.0,p:60,m:0,r:0,e:.7},
 crystal:{c:[255,240,176],s:1.0,p:70,m:0,r:0,e:.85},
 feather:{c:[252,252,255],s:.2,p:10,m:0,r:.15,e:.55},
 ember:  {c:[255,150,60], s:0, p:1, m:0,r:0,e:1},
 // level gems (same colour language as the previous towers): blue, cyan, violet, gold
 gem1:{c:[112,184,255],s:1,p:60,m:0,r:0,e:.8},gem2:{c:[85,230,255],s:1,p:60,m:0,r:0,e:.8},
 gem3:{c:[197,139,255],s:1,p:60,m:0,r:0,e:.8},gem4:{c:[255,212,92],s:1,p:60,m:0,r:0,e:.85}
};
const GEMC=['#70b8ff','#55e6ff','#c58bff','#ffd45c'];
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

/* ===== CANNON: low iron-banded stone emplacement + a big red & gold banded cannon (hollow bore) ===== */
DEF.cannon={
 base(lv){
  const m=new Mesh(),gem='gem'+lv;
  m.merge(bevelBlock(31,8,0,7,'stone','stoneL'));
  m.merge(bevelBlock(28,7,7,12,'stoneL','stoneL'));
  m.merge(lathe([[24,12],[24,13.5],[22.5,14.5],[22.5,15.5],[20,16]],24,['iron','gold','gold','iron'],{capMat:'iron'}));
  // glowing level gems set into each face of the plinth (radiant, like the previous towers)
  for(let f=0;f<4;f++){const a=f*Math.PI/2+Math.PI/4;
   m.merge(extrudeXZ([[-4.2,2.2],[4.2,2.2],[4.2,6],[-4.2,6]],1.2,'gold').map(T.rotZ(Math.PI/2)).map(T.move(22.2,0,0)).map(T.rotZ(a)));
   m.merge(lathe([[.1,-1.8],[1.9,0],[.1,1.8]],6,gem,{cap:false}).map(T.rotY(Math.PI/2)).map(T.move(23.4,0,4.1)).map(T.rotZ(a)))}
  if(lv>=2)for(const[sx,sy]of[[1,1],[1,-1],[-1,1],[-1,-1]]){m.merge(box(sx*28-3.5,sy*28-3.5,0,sx*28+3.5,sy*28+3.5,14,'iron','gold'));m.merge(sphere(1.6,3,'gold').map(T.move(sx*31,sy*26,10)))}
  if(lv>=3)for(const[sx,sy]of[[1,1],[1,-1],[-1,1],[-1,-1]])m.merge(lathe([[3.8,14],[3.8,20],[2.4,22],[0,27]],8,['stoneL','gold','gold'],{}).map(T.move(sx*27,sy*27,0)));
  if(lv>=4){for(const[sx,sy]of[[1,1],[1,-1],[-1,1],[-1,-1]])m.merge(lathe([[2.6,26],[1.2,29],[0,33]],6,['gold','gold'],{}).map(T.move(sx*27,sy*27,0)));
   for(let f=0;f<4;f++){const a=f*Math.PI/2;m.merge(extrudeXZ([[-6,12],[6,12],[6,5],[0,2.5],[-6,5]],1,'red','gold').map(T.rotZ(Math.PI/2)).map(T.move(29.6,0,0)).map(T.rotZ(a)))}}
  return m},
 glowBase(lv){const g=[];for(let f=0;f<4;f++){const a=f*Math.PI/2+Math.PI/4;g.push({x:Math.cos(a)*24,y:Math.sin(a)*24,z:4.1,r:7,c:GEMC[lv-1]})}if(lv>=2)g.push({ring:21.5,z:15.2,c:GEMC[lv-1]});return g},
 turret(lv){
  const m=new Mesh(),gem='gem'+lv;
  const L=[42,46,50,55][lv-1],Rb=[10,11,12,13.2][lv-1],Rm=Rb*1.22,bore=Rb*.6;
  // turntable with a glowing rune ring
  m.merge(lathe([[21,0],[21,3],[19,4.5]],24,'gunDark',{capMat:'iron'}));
  m.merge(lathe([[17.5,4.5],[18.5,4.5],[18.5,5.1],[17.5,5.1]],24,[gem,gem,gem],{cap:false}));
  m.merge(bolts(15,4.8,8,1.3,'gold'));
  // big carriage cheeks (red lacquer, gold edging, gold medallion with a gem)
  const cheek=[[-17,4],[15,4],[15,10],[7,24],[-7,26],[-17,16]];
  for(const s of[-1,1]){const y=s*(Rb+3.4);
   m.merge(extrudeXZ(cheek,3.6,'red','redDark').map(T.move(0,y,0)));
   m.merge(extrudeXZ([[-17,4],[15,4],[15,6],[-17,6]],4,'gold').map(T.move(0,y,0)));
   m.merge(extrudeXZ([[7,24],[-7,26],[-7,27.6],[7,25.6]],4,'gold').map(T.move(0,y,0)));
   m.merge(lathe([[5.6,0],[5.6,1.3],[3.6,2.2]],14,['goldDark','gold'],{}).map(T.rotX(-s*Math.PI/2)).map(T.move(-3,y+s*1.9,14)));
   m.merge(lathe([[.1,0],[2.2,.8],[.1,2.4]],8,gem,{cap:false}).map(T.rotX(-s*Math.PI/2)).map(T.move(-3,y+s*3.6,14)))}
  // barrel (axis +X): cascabel knob, reinforce rings, red & gold bands, flared muzzle with a HOLLOW bore
  const prof=[[0.1,-15],[2.6,-15],[3.4,-13],[Rb*.6,-12.5],[Rb*.75,-11],[Rb,-9.5],[Rb,-6],[Rb*1.12,-6],[Rb*1.12,-2.5],[Rb*.95,-2.5],
   [Rb*.9,L*.42],[Rb*1.04,L*.42],[Rb*1.04,L*.52],[Rb*.86,L*.52],[Rb*.84,L-7],[Rm*.95,L-5.5],[Rm,L-2.5],[Rm*1.04,L],
   [bore,L],[bore,L-12],[0.1,L-12]];
  const mats=['gold','gold','gun','gun','gun','gun','red','red','gun','gun','gold','gold','gun','gun','gold','gold','gold','gold','bore','bore'];
  let barrel=lathe(prof,24,mats,{cap:false}).map(T.rotY(Math.PI/2));
  const band=(z0,z1,r,mt)=>barrel.merge(lathe([[r,z0],[r,z1]],24,mt,{cap:false}).map(T.rotY(Math.PI/2)));
  band(L*.18,L*.25,Rb*1.08,'red');
  band(L*.62,L*.67,Rb*1.0,gem);                               // glowing energy band
  if(lv>=3){band(L*.3,L*.34,Rb*1.1,'gold');for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;barrel.merge(box(-4,-1.4,Rb*.95,8,1.4,Rb*.95+2.6,'gold').map(T.rotX(a)))}}
  if(lv>=4){barrel.merge(lathe([[Rm*1.08,L-3],[Rm*1.08,L+.8]],24,'gold',{cap:false}).map(T.rotY(Math.PI/2)));
   for(let i=0;i<8;i++){const a=i/8*Math.PI*2;barrel.merge(box(L-2.5,-1,Rm*1.04,L+2,1,Rm*1.04+2,'gold').map(T.rotX(a)))}}
  barrel=barrel.map(T.rotY(-.14)).map(T.move(0,0,20));
  m.merge(barrel);
  m.merge(lathe([[2.8,-(Rb+6)],[2.8,Rb+6]],10,'iron',{}).map(T.rotX(Math.PI/2)).map(T.move(0,0,20)));
  if(lv>=4)for(const s of[-1,1])m.merge(lathe([[3.8,0],[4.4,3.2],[3.8,6.4]],10,['wood','wood'],{}).map(T.rotX(Math.PI/2)).map(T.move(-14,s*4.4,10)));
  return m},
 glowTurret(lv){const L=[42,46,50,55][lv-1],c=GEMC[lv-1],k=Math.cos(.14),sn=Math.sin(.14);const x=L*.645*k,z=20+L*.645*sn;return[{x,y:0,z,r:9+lv,c},{x:-3,y:([10,11,12,13.2][lv-1]+7),z:14,r:5,c},{x:-3,y:-([10,11,12,13.2][lv-1]+7),z:14,r:5,c}]},
 pz:[15.5,15.5,15.5,15.5],
 muzzle:lv=>{const L=[42,46,50,55][lv-1];return{x:L*Math.cos(.14),z:20+L*Math.sin(.14)}},
 kick:8,
 scale:1.12
};

/* ===== HOLY: radiant white-marble & gold shrine; a large rotating crown, sun crystal, seraph lance and halo ===== */
DEF.holy={
 base(lv){
  const m=new Mesh(),H=[30,33,36,39][lv-1],w=12,gem='gem'+lv;
  m.merge(bevelBlock(26,6,0,5,'marbleS','marble'));
  m.merge(bevelBlock(23,5,5,6.2,'gold'));
  m.merge(bevelBlock(21,5,6.2,9,'marble','marble'));
  // glowing gems at the plinth corners
  for(const[sx,sy]of[[1,1],[1,-1],[-1,1],[-1,-1]])m.merge(lathe([[.1,6],[2.3,7.6],[.1,10.6]],6,gem,{cap:false}).map(T.move(sx*19.5,sy*19.5,0)));
  m.merge(prism([[w,-w],[w,w],[-w,w],[-w,-w]].reverse(),9,H,'marble','marbleS'));
  for(let f=0;f<4;f++){const a=f*Math.PI/2;
   m.merge(extrudeXZ([[-5,12],[5,12],[5,H-9],[3.5,H-5.6],[0,H-4.2],[-3.5,H-5.6],[-5,H-9]],1.4,'gold').map(T.rotZ(Math.PI/2)).map(T.move(w+.3,0,0)).map(T.rotZ(a)));
   m.merge(extrudeXZ([[-3.6,13.2],[3.6,13.2],[3.6,H-9.4],[2.4,H-6.6],[0,H-5.6],[-2.4,H-6.6],[-3.6,H-9.4]],1.2,'glass','goldDark').map(T.rotZ(Math.PI/2)).map(T.move(w+1,0,0)).map(T.rotZ(a)))}
  for(const[sx,sy]of[[1,1],[1,-1],[-1,1],[-1,-1]])m.merge(lathe([[3.3,9],[2.6,11],[2.6,H-2],[3.7,H],[3.7,H+2],[2.1,H+4],[0,H+9]],10,['gold','gold','gold','gold','gold','gold'],{}).map(T.move(sx*w,sy*w,0)));
  m.merge(bevelBlock(w+3.5,3,H,H+3,'gold','goldDark'));
  // short gold dome that the crown sits on
  m.merge(lathe([[w+.5,H+3],[w-1.5,H+6],[8,H+9],[5,H+11]],10,['gold','marble','gold'],{a0:Math.PI/10,capMat:'gold'}));
  if(lv>=2){const sc=[0,1,1.14,1.28][lv-1];
   for(const s of[-1,1]){const fan=new Mesh();
    for(let i=0;i<6;i++){const len=(13+i*3.4)*sc,ang=.12+i*.2;
     fan.merge(extrudeXZ([[0,0],[len*.16,2.6],[len,1.4],[len*1.05,-.4],[len*.18,-2.2]],1.1,'feather','marbleS').map(T.rotY(-ang)).map(T.move(0,i*.5,i*.4)))}
    m.merge(fan.map(T.rotZ(s>0?0:Math.PI)).map(T.rotZ(s*.55)).map(T.move(s*(w+1),3,H*.6)))}}
  if(lv>=3)for(const[sx,sy]of[[1,1],[1,-1],[-1,1],[-1,-1]])m.merge(lathe([[2.4,0],[2.4,6],[1.3,8],[0,14]],6,['marble','gold','gold'],{}).map(T.move(sx*20,sy*20,6)));
  if(lv>=4)for(const a of[Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4])m.merge(box(-1.3,-1.3,6,1.3,1.3,H*.75,'marble','gold').map(T.move(18.5,0,0)).map(T.rotZ(a)));
  return m},
 glowBase(lv){const H=[30,33,36,39][lv-1],c=GEMC[lv-1],g=[];for(const[sx,sy]of[[1,1],[1,-1],[-1,1],[-1,-1]])g.push({x:sx*19.5,y:sy*19.5,z:8,r:6,c});for(let f=0;f<4;f++){const a=f*Math.PI/2;g.push({x:Math.cos(a)*13.5,y:Math.sin(a)*13.5,z:H*.55,r:8,c:'#8fc8ff'})}return g},
 turret(lv){
  const m=new Mesh(),gem='gem'+lv,K=[1,1.08,1.16,1.25][lv-1];
  // crown ring with alternating spikes
  m.merge(lathe([[13*K,0],[14.5*K,2.5],[13*K,5],[10.5*K,5]],20,['gold','gold','gold'],{capMat:'goldDark'}));
  m.merge(lathe([[13.3*K,2],[13.8*K,2],[13.8*K,3],[13.3*K,3]],20,[gem,gem,gem],{cap:false}));
  const ns=[6,8,8,10][lv-1];
  for(let i=0;i<ns;i++){const a=i/ns*Math.PI*2+Math.PI/ns;m.merge(lathe([[2.4*K,4],[0.1,(14+(i%2?0:5))*K]],5,'gold',{}).map(T.move(Math.cos(a)*12*K,Math.sin(a)*12*K,0)))}
  // large central sun crystal
  m.merge(lathe([[2.4,4],[2.4,9]],8,'gold',{}));
  m.merge(lathe([[0.1,7],[6.5*K,14*K],[0.1,30*K]],6,'crystal',{cap:false}));
  // seraph lance: a long gold arm with wing guards and a big crystal head, aimed along +X
  m.merge(extrudeXZ([[4,7],[26*K,9.5],[30*K,11.5],[26*K,13.5],[4,11]],3,'gold','goldDark'));
  for(const s of[-1,1])m.merge(extrudeXZ([[8,10],[18*K,16*K],[22*K,15*K],[12,10]],1.4,'feather','marbleS').map(T.rotX(s*.5)));
  m.merge(lathe([[0.1,-4.5*K],[4*K,0],[0.1,7*K]],6,'crystal',{cap:false}).map(T.rotY(Math.PI/2)).map(T.move(32*K,0,11.5)));
  // halos
  m.merge(lathe([[11*K,0],[12.6*K,0],[12.6*K,1.4],[11*K,1.4]],28,['gold','gold','gold'],{cap:false}).map(T.rotY(.35)).map(T.move(-1,0,31*K)));
  if(lv>=3)m.merge(lathe([[14.5*K,0],[15.5*K,0],[15.5*K,1],[14.5*K,1]],28,[gem,gem,gem],{cap:false}).map(T.rotY(-.3)).map(T.move(0,0,34*K)));
  return m},
 glowTurret(lv){const K=[1,1.08,1.16,1.25][lv-1];return[{x:0,y:0,z:16*K,r:16*K,c:'#fff0b0'},{x:32*K,y:0,z:11.5,r:10*K,c:'#fff3c0'},{ring:11.8*K,z:31*K,c:'#ffe7a0',tilt:.35}]},
 pz:[44,47,50,53],
 muzzle:lv=>{const K=[1,1.08,1.16,1.25][lv-1];return{x:34*K,z:11.5}},
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
 return{c:raster(ms,yaw,RPX,W,H,ox,oy,{zTop:part==='base'?40:30,grain:part==='base'?(k==='holy'?.1:.18):.1}),ox,oy}}
let budget=0,frame=-1;
function base(k,lv){const key=k+lv;return baseC[key]||(baseC[key]=sprite(k,'base',lv,0))}
function turret(k,lv,yaw){
 const d=((Math.round(yaw/(Math.PI*2)*NA)%NA)+NA)%NA,key=k+lv+':'+d;let s=turC.get(key);if(s)return s;
 const TMv=(typeof TM!=='undefined')?TM:0;if(frame!==TMv){frame=TMv;budget=0}
 if(budget>=2){for(let j=1;j<NA/2;j++){s=turC.get(k+lv+':'+((d+j)%NA))||turC.get(k+lv+':'+((d-j+NA)%NA));if(s)return s}}
 budget++;s=sprite(k,'turret',lv,d/NA*Math.PI*2);turC.set(key,s);if(turC.size>TUR_MAX)turC.delete(turC.keys().next().value);return s}
// screen aim angle -> world yaw (ground is foreshortened by SE on screen)
const yawOf=a=>Math.atan2(Math.sin(a)/SE,Math.cos(a));
const GLC={};function glowC(col){let o=GLC[col];if(o)return o;o=document.createElement('canvas');o.width=o.height=64;const g=o.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.18,col);gr.addColorStop(.5,col+'55');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.fillRect(0,0,64,64);return GLC[col]=o}
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
  // radiant light: pulsing gems, rune rings and crystals (cached additive sprites)
  if(window.CK_Q!==0){const ph=p.x*.013+p.y*.007,pl=.5+.5*Math.sin(T*2.4+ph),A=.42+.28*pl+(rc>0?rc*.35:0);
   ctx.save();ctx.globalCompositeOperation='lighter';
   const put=(q,ox2,oy2,rot)=>{let x=q.x||0,y=q.y||0;if(rot){const c0=Math.cos(yaw),s0=Math.sin(yaw);const xx=x*c0-y*s0;y=x*s0+y*c0;x=xx}
    if(q.ring){ctx.globalAlpha=A*.8;ctx.strokeStyle=q.c;ctx.lineWidth=Math.max(1,1.6*u*sz);ctx.beginPath();ctx.ellipse(ox2,oy2-q.z*CE*u*sz,q.ring*u*sz,q.ring*SE*u*sz,0,0,7);ctx.stroke();ctx.globalAlpha=A*.25;ctx.lineWidth=Math.max(2,5*u*sz);ctx.stroke();return}
    const X=ox2+x*u*sz,Y=oy2+(y*SE-q.z*CE)*u*sz,r=q.r*u*sz*(.85+.3*pl);ctx.globalAlpha=A;ctx.drawImage(glowC(q.c),X-r,Y-r,2*r,2*r)};
   if(d.glowBase)for(const q of d.glowBase(lv))put(q,p.x,footY,false);
   if(d.glowTurret)for(const q of d.glowTurret(lv))put(q,cx,cy,true);
   ctx.restore()}
  if(rc>.55){const mz=this.muzzle({k,lv,a,rc},p,u);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(rc-.55)*2.2;const r=u*(k==='cannon'?16:13)*sz;ctx.drawImage(glowC(k==='cannon'?'#ffb347':'#fff0b0'),mz[0]-r,mz[1]-r,2*r,2*r);ctx.restore()}
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
