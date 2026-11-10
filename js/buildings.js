// buildings.js
// bld() building generator and all map buildings: tower block, lantern tower, tank, canal tunnel (14) and skyline.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const roofMat=M(0xb9b58c,{roughness:.95});
function bld(cx,cz,w,d,h,o){o=o||{};const y0=o.y0===undefined?QUAY:o.y0;const r=rng(o.seed||Math.round(cx*13+cz*7+h));
  const tex=facadeTex({base:o.base||'#dccf8c',rows:Math.max(2,Math.round(h/3.3)),cols:Math.max(2,Math.round(Math.max(w,d)/2.7)),seed:o.seed||Math.round(cx*3+cz),moss:o.moss,frame:o.frame});
  const side=new T.MeshStandardMaterial({map:tex,roughness:.9});
  add(new T.BoxGeometry(w,h,d),[side,side,roofMat,roofMat,side,side],cx,y0+h/2,cz);
  add(new T.BoxGeometry(w+.5,.35,d+.5),M(o.trim||0xeee8c6),cx,y0+h+.17,cz);
  if(o.far)return;
  const faces={s:[0,1,w,cz+d/2],n:[0,-1,w,cz-d/2],e:[1,0,d,cx+w/2],w:[-1,0,d,cx-w/2]};
  (o.balc||'').split('').forEach(f=>{const F=faces[f];if(!F)return;const fl=3.3;
    for(let y=y0+fl*(o.balcFrom||2);y<y0+h-2;y+=fl*(o.balcStep||2)){const len=F[2]*(.55+r()*.4),off=(r()-.5)*(F[2]-len);
      if(F[0]===0){const z=F[3]+F[1]*.55;add(new T.BoxGeometry(len,.16,1.1),M(0xe8e2be),cx+off,y,z);rail(cx+off-len/2,z+F[1]*.52,cx+off+len/2,z+F[1]*.52,y,1,o.railCol);}
      else{const x=F[3]+F[0]*.55;add(new T.BoxGeometry(1.1,.16,len),M(0xe8e2be),x,y,cz+off);rail(x+F[0]*.52,cz+off-len/2,x+F[0]*.52,cz+off+len/2,y,1,o.railCol);}
      if(r()<.7){const bx=F[0]===0?cx+off+(r()-.5)*len:F[3]+F[0]*.9,bz=F[0]===0?F[3]+F[1]*.9:cz+off+(r()-.5)*len;blob(bx,y+.2,bz,1.3,1.6,1.3,70,o.pal||'mid',r,.55);}}});
  const G=o.green||0;for(let i=0;i<G;i++){const f=['s','n','e','w'][r()*4|0],F=faces[f];const t=(r()-.5)*F[2];
    const px=F[0]===0?cx+t:F[3]+F[0]*.3,pz=F[0]===0?F[3]+F[1]*.3:cz+t;
    if(r()<.5)blob(px,y0+h+.6,pz,2.2+r()*1.5,1.2+r(),2.2+r()*1.5,170,o.pal||'mid',r,.8);
    else{const yy=y0+h*(.35+r()*.6);blob(px,yy,pz,F[0]===0?2+r()*2:.7,2.5+r()*3,F[0]===0?.7:2+r()*2,190,o.pal||'mid',r,.7);}}}
function cyl(x,z,r1,r2,y0,h,mat,seg){return add(new T.CylinderGeometry(r1,r2,h,seg||40),mat,x,y0+h/2,z);}
function banner(text,w,h,x,y,z,ry,o){return sign(text,w,h,x,y,z,ry,Object.assign({w:128,h:512,vertical:true,bg:'#c63d6a',fg:'#fff8e0',border:'#f6e9b0',lw:8},o||{}));}

// 8 tower block (overgrown) with round upper works
bld(-17.5,-20.2,14.3,14.3,40,{base:'#e2d489',balc:'se',green:26,pal:'bright',seed:41,moss:120});
bld(-17.5,-21.5,10.5,10.5,14,{y0:QUAY+40,base:'#e3dba6',green:14,pal:'bright',seed:42});
const cream=M(0xece6c2,{roughness:.7}),teal=M(0x2f8f7f,{roughness:.6}),dteal=M(0x1f4a44,{roughness:.6});
cyl(-17.5,-21.5,5.6,5.6,QUAY+54,11,new T.MeshStandardMaterial({map:facadeTex({base:'#d9d2a0',rows:3,cols:12,seed:5}),roughness:.85}));
[55.5,60,65].forEach((y,i)=>{cyl(-17.5,-21.5,7.4-i*.5,6.2-i*.4,QUAY+y,.5,cream);add(new T.TorusGeometry(7.3-i*.5,.09,8,60),dteal,-17.5,QUAY+y+1.3,-21.5,{rx:Math.PI/2});});
cyl(-17.5,-21.5,3.2,5.6,QUAY+65.5,3,teal);blob(-17.5,QUAY+70,-21.5,5,3,5,500,'bright',R0,1.1);
cyl(-9.6,-25,1.5,1.7,QUAY+40,34,cream);cyl(-9.6,-25,2.6,1.6,QUAY+74,1.2,cream);cyl(-9.6,-25,2.9,2.9,QUAY+75.2,2.2,M(0xd8d2b0));
cyl(-9.6,-25,2.7,1.5,QUAY+57,1,cream);
banner('青果本舗①⑪',2.2,11,-12.6,QUAY+22,-13.0,0,{bg:'#c63d6a'});
banner('水の市',1.8,7,-19.5,QUAY+30,-13.0,0,{bg:'#2c4f9e'});
sign('◎',3,3,-22,QUAY+35.5,-13.0,0,{round:true,bg:'#f4f0d8',border:'#2f8f7f',fg:'#c8452f'});
// 9 slender cylindrical tower + its low block
cyl(-28.6,-15.6,2.7,2.9,QUAY,30,new T.MeshStandardMaterial({map:facadeTex({base:'#e6dfb0',rows:9,cols:6,seed:8}),roughness:.85}));
cyl(-28.6,-15.6,3.3,2.8,QUAY+30,.8,cream);add(new T.SphereGeometry(2.7,32,16,0,6.3,0,1.57),M(0xcfd9b6),-28.6,QUAY+30.8,-15.6,{s:[1,.55,1]});
cyl(-28.6,-15.6,3.4,3.4,QUAY+19,.3,cream);
bld(-36,-22,12,14,24,{base:'#cfd0a0',green:10,balc:'s',seed:12});
// 5 stair building
bld(-24.05,-5.85,11.7,9.1,13,{base:'#dccb86',balc:'s',balcFrom:3,green:8,pal:'bright',seed:15});
bld(-44,-2,10,18,22,{base:'#c9cf9f',green:8,seed:16});
// 9b dark lantern tower
(function(){const x=-13,z=-7.4;const dt=new T.MeshStandardMaterial({map:facadeTex({base:'#1f3f3b',rows:8,cols:3,seed:23,frame:'rgba(20,40,38,.9)',moss:10}),roughness:.7});
  bld(x,z,6,5.5,9,{base:'#cfc890',green:5,seed:24});
  cyl(x,z,1.9,2.1,QUAY+9,15,dt,8);
  [[24,3.9,.7],[25.6,3.1,.6],[27,2.2,.5]].forEach(a=>{const g=new T.LatheGeometry([new T.Vector2(0,a[2]+.5),new T.Vector2(a[1]*.35,a[2]+.25),new T.Vector2(a[1]*.75,.15),new T.Vector2(a[1],.2),new T.Vector2(a[1],0),new T.Vector2(0,0)],48);add(g,dteal,x,QUAY+a[0],z);});
  cyl(x,z,1.5,1.7,QUAY+24.6,1.2,M(0x18302d),24);cyl(x,z,.12,.12,QUAY+28,2.4,dteal,8);
  for(let i=0;i<8;i++){const a=i/8*6.283;add(new T.SphereGeometry(.16,10,8),new T.MeshStandardMaterial({color:0xfff2b0,emissive:0xffd060,emissiveIntensity:1.2}),x+Math.cos(a)*3.7,QUAY+23.9,z+Math.sin(a)*3.7,{cast:false});}
})();
// 10 tank building + tank
bld(26.65,-17.55,19.5,17,20,{base:'#d3cc93',balc:'sw',green:22,pal:'bright',seed:31});
(function(){const x=24.7,z=-18.2,y=QUAY+20;
  const tankTex=ctex(1024,256,(g,w,h)=>{g.fillStyle='#2f9c8a';g.fillRect(0,0,w,h);const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(0,40,40,.35)');gr.addColorStop(.5,'rgba(255,255,255,.05)');gr.addColorStop(1,'rgba(0,50,40,.4)');g.fillStyle=gr;g.fillRect(0,0,w,h);
    g.fillStyle='#e8b44a';g.fillRect(0,18,w,22);g.fillStyle='#b8532e';for(let i=0;i<32;i++)g.fillRect(i*32+4,22,20,14);
    g.strokeStyle='#f4f6e6';g.lineWidth=16;g.lineCap='round';for(let k=0;k<4;k++){const cx=k*256+128;g.beginPath();g.moveTo(cx,80);g.lineTo(cx,200);g.stroke();g.beginPath();g.arc(cx-70,80,60,.2,1.4);g.stroke();g.beginPath();g.arc(cx+70,80,60,1.74,2.94);g.stroke();}
    const r=rng(2);for(let i=0;i<60;i++){g.fillStyle=`rgba(20,70,60,${r()*.25})`;g.fillRect(r()*w,r()*h,3+r()*5,40+r()*120);}});
  tankTex.wrapS=T.RepeatWrapping;
  for(let i=0;i<8;i++){const a=i/8*6.283;cyl(x+Math.cos(a)*5.6,z+Math.sin(a)*5.6,.3,.3,y,2.2,dteal,10);}
  cyl(x,z,6.9,6.5,y+2.2,8,new T.MeshStandardMaterial({map:tankTex,roughness:.5,metalness:.15}),64);
  add(new T.TorusGeometry(6.95,.18,10,72),M(0xe8b44a),x,y+9.6,z,{rx:Math.PI/2});add(new T.TorusGeometry(6.6,.16,10,72),M(0x1f6f62),x,y+2.4,z,{rx:Math.PI/2});
  const para=stripeTex(['#2f9c8a','#f1e2a2','#2f9c8a','#d8743a'],24,true);para.wrapS=T.RepeatWrapping;
  const cone=new T.Mesh(new T.ConeGeometry(9.2,3.2,64,1,true),new T.MeshStandardMaterial({map:para,side:T.DoubleSide,roughness:.7}));cone.position.set(x,y+11.8,z);cone.castShadow=true;scene.add(cone);
  cyl(x,z,.25,.25,y+13.4,2.5,dteal,8);add(new T.SphereGeometry(.5,16,12),M(0xe8b44a,{metalness:.5,roughness:.35}),x,y+16,z);
  cyl(x-9,z+2,.12,.12,y,14,dteal,8);sign('✿',4.2,4.2,x-9,y+15.5,z+2,.25,{round:true,bg:'#e6893a',border:'#f4e3a0',fg:'#fbeeb8'});
  sign('よ',3,3,x+11,y+13,z+8.4,-.2,{round:true,bg:'#3d9a35',border:'#f4e36a',fg:'#fff36a'});cyl(x+11,z+8.3,.1,.1,y,11.6,dteal,8);
})();
// far-right apartment slab, right foreground block, back fill
bld(47,-30,16,30,62,{base:'#b9c4a4',balc:'w',balcStep:1,balcFrom:2,green:26,pal:'mid',seed:51,railCol:0xd9dcc8});
bld(37.5,17,9,24,17,{base:'#d8cf9a',balc:'w',green:10,pal:'bright',seed:52});
bld(27.5,-6,19,6,5.3,{base:'#c9c08a',seed:53});
bld(50,8,12,30,34,{base:'#c4c99d',green:8,seed:54});
bld(-44,18,12,24,26,{base:'#c2c896',green:8,seed:55});
// 14 far end: canal tunnel under the end buildings
(function(){const cx=-.65,z0=-57,len=26;const sh=new T.Shape();
  sh.moveTo(-12.65,-1.5);sh.lineTo(cx-7.6,-1.5);sh.lineTo(cx-7.6,3.4);sh.absellipse(cx,3.4,7.6,3.8,Math.PI,0,true);sh.lineTo(cx+7.6,-1.5);sh.lineTo(11.35,-1.5);sh.lineTo(11.35,8);sh.lineTo(-12.65,8);sh.lineTo(-12.65,-1.5);
  const g=new T.ExtrudeGeometry(sh,{depth:len,bevelEnabled:false,curveSegments:40});
  const m=new T.Mesh(g,[new T.MeshStandardMaterial({map:wallTex,color:0xf3ecd2,roughness:.9}),new T.MeshStandardMaterial({map:wallTex,color:0x6d7a66,roughness:.95})]);
  m.position.z=z0;m.castShadow=true;m.receiveShadow=true;scene.add(m);
  const pts=[];for(let i=0;i<=40;i++){const a=Math.PI*(1-i/40);pts.push(new V3(cx+Math.cos(a)*7.6,3.4+Math.sin(a)*3.8,0));}
  pts.unshift(new V3(cx-7.6,.2,0));pts.push(new V3(cx+7.6,.2,0));
  [z0+len+.05,z0-.05].forEach(z=>add(new T.TubeGeometry(new T.CatmullRomCurve3(pts,false,'catmullrom',.1),80,.32,10,false),M(0xe9e2c0,{roughness:.7}),0,0,z));
  add(new T.BoxGeometry(1.5,1.3,.5),M(0xc8452f,{roughness:.6}),cx,7.35,z0+len+.2);
  for(let z=-34;z>-56;z-=5.5)[-1,1].forEach(sd=>{add(new T.SphereGeometry(.2,12,10),new T.MeshStandardMaterial({color:0xfff2c0,emissive:0xffd070,emissiveIntensity:1.6}),cx+sd*7.25,3.7,z,{cast:false});add(new T.BoxGeometry(.3,.12,.3),M(0x1f3a30),cx+sd*7.45,3.95,z);});
  const pl=new T.PointLight(0xffd9a0,.9,34,1.6);pl.position.set(cx,4.6,-44);scene.add(pl);
  rail(-12.65,z0+len-.15,11.35,z0+len-.15,8,1.1,0x3d7d74);
  sign('水上トンネル',8,1.5,cx,10.4,z0+len-.4,0,{w:768,h:144,bg:'#f6f1dc',fg:'#1f6f62',border:'#1f6f62',lw:10});
  [-3.4,3.4].forEach(dx=>cyl(cx+dx,z0+len-.4,.08,.08,8,1.7,dteal,8));
  blob(-9.5,8.3,-31.6,2.6,1.6,1.2,260,'bright',R0,.7);blob(8.6,8.2,-31.8,2.4,1.5,1.2,240,'bright',R0,.7);blob(cx+7.4,5.2,-30.7,1.2,2.6,.6,180,'mid',R0,.6);blob(cx-7.7,4.2,-30.7,1.0,2.2,.6,140,'mid',R0,.6);
  bld(-.65,-41,24,14,23,{y0:8,base:'#eeeedd',green:14,pal:'bright',seed:61,moss:20});
  bld(-3,-52,14,10,51,{y0:8,base:'#dfe6c8',green:10,pal:'bright',seed:62});})();
// distant skyline
(function(){const r=rng(88);for(let i=0;i<34;i++){const a=i/34*6.283+r()*.1;const d=85+r()*70;const x=Math.cos(a)*d,z=Math.sin(a)*d*1.05+6;
  if(Math.abs(x)<24&&z<0)continue;const h=30+r()*75;const cols=['#cdd6ae','#dcd9aa','#c2cfb0','#e4e2c0'];
  bld(x,z,12+r()*14,12+r()*14,h,{base:cols[r()*4|0],far:true,seed:100+i,moss:70});
  blob(x,QUAY+h+1,z,6,2.5,6,160,'bright',r,1.6);if(r()<.5)blob(x+(r()-.5)*8,QUAY+h*.6,z+(r()-.5)*8,4,7,4,140,'mid',r,1.6);}
 for(let i=0;i<7;i++){const x=-34+i*11.5;bld(x,66+r()*3,10,10,14+r()*16,{base:'#d6d19e',far:true,seed:300+i});blob(x,QUAY+10,60.5,3.5,5,1,150,'mid',r,1);}})();
