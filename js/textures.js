// textures.js
// Procedural canvas textures: paving, quay wall, wood, bark, railings, stripes, signs and building facades.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const paveTex=ctex(512,512,(g,w,h)=>{const r=rng(3);g.fillStyle='#d9cfa2';g.fillRect(0,0,w,h);
  const n=8,c=w/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const v=200+r()*30|0;g.fillStyle=`rgb(${v+16},${v+8},${v-38})`;g.fillRect(i*c+2,j*c+2,c-4,c-4);}
  speckle(g,w,h,5000,.12,r);g.strokeStyle='rgba(110,130,60,.5)';g.lineWidth=3;for(let i=0;i<=n;i++){g.beginPath();g.moveTo(i*c,0);g.lineTo(i*c,h);g.moveTo(0,i*c);g.lineTo(w,i*c);g.stroke();}
  for(let i=0;i<40;i++){g.fillStyle=`rgba(90,140,50,${.1+r()*.2})`;g.beginPath();g.arc(r()*w,r()*h,6+r()*22,0,7);g.fill();}
},{rep:[.22,.22]});
const wallTex=ctex(256,256,(g,w,h)=>{const r=rng(5);g.fillStyle='#8f9272';g.fillRect(0,0,w,h);
  for(let j=0;j<8;j++)for(let i=0;i<5;i++){const v=130+r()*40|0;g.fillStyle=`rgb(${v},${v+4},${v-30})`;g.fillRect(i*52+(j%2?26:0)-26,j*32+1,50,30);}
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(80,120,40,0)');gr.addColorStop(1,'rgba(40,90,40,.75)');g.fillStyle=gr;g.fillRect(0,0,w,h);speckle(g,w,h,2500,.15,r);
},{rep:[.3,.3]});
const woodTex=ctex(256,256,(g,w,h)=>{const r=rng(9);g.fillStyle='#b98f58';g.fillRect(0,0,w,h);for(let i=0;i<8;i++){const v=150+r()*50|0;g.fillStyle=`rgb(${v+25},${v-10},${v-70})`;g.fillRect(i*32+1,0,30,h);}
  for(let i=0;i<300;i++){g.strokeStyle=`rgba(70,40,10,${r()*.25})`;g.beginPath();const x=r()*w,y=r()*h;g.moveTo(x,y);g.lineTo(x+(r()-.5)*4,y+20+r()*50);g.stroke();}},{rep:[1,1]});
const barkTex=ctex(256,512,(g,w,h)=>{const r=rng(21);g.fillStyle='#6d5a3a';g.fillRect(0,0,w,h);
  for(let i=0;i<900;i++){const v=60+r()*80|0;g.strokeStyle=`rgba(${v+20},${v},${v-30},.55)`;g.lineWidth=1+r()*3;g.beginPath();const x=r()*w,y=r()*h;g.moveTo(x,y);g.bezierCurveTo(x+(r()-.5)*10,y+20,x+(r()-.5)*10,y+40,x+(r()-.5)*8,y+60+r()*40);g.stroke();}
  for(let i=0;i<60;i++){g.fillStyle=`rgba(110,150,60,${.15+r()*.25})`;g.beginPath();g.arc(r()*w,r()*h,5+r()*18,0,7);g.fill();}},{rep:[2,3]});
const railTex=ctex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(0,0,w,10);g.fillRect(0,h-8,w,8);g.fillRect(0,34,w,4);for(let i=0;i<4;i++)g.fillRect(i*32+13,0,6,h);});
railTex.wrapS=T.RepeatWrapping;
function rail(x1,z1,x2,z2,y,hh,col,parent){const len=Math.hypot(x2-x1,z2-z1);const t=railTex.clone();t.needsUpdate=true;t.repeat.set(Math.max(1,Math.round(len/0.9)),1);
  const m=new T.MeshStandardMaterial({map:t,color:col||0xf1ecd0,alphaTest:.5,side:T.DoubleSide,roughness:.7});
  const mesh=add(new T.PlaneGeometry(len,hh),m,(x1+x2)/2,y+hh/2,(z1+z2)/2,{ry:-Math.atan2(z2-z1,x2-x1),parent});
  mesh.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:t,alphaTest:.5});return mesh;}
function stripeTex(cols,n,vertical){return ctex(256,256,(g,w,h)=>{for(let i=0;i<n;i++){g.fillStyle=cols[i%cols.length];if(vertical)g.fillRect(i*w/n,0,w/n+1,h);else g.fillRect(0,i*h/n,w,h/n+1);}
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(0,0,0,.12)');gr.addColorStop(1,'rgba(255,255,255,.08)');g.fillStyle=gr;g.fillRect(0,0,w,h);});}
function signTex(text,o){o=o||{};const w=o.w||256,h=o.h||256;return ctex(w,h,(g)=>{g.clearRect(0,0,w,h);
  g.fillStyle=o.bg||'#fff';g.strokeStyle=o.border||'#c8452f';g.lineWidth=o.lw||14;
  if(o.round){g.beginPath();g.arc(w/2,h/2,Math.min(w,h)/2-g.lineWidth/2-2,0,7);g.fill();g.stroke();}
  else{g.fillRect(0,0,w,h);g.strokeRect(g.lineWidth/2,g.lineWidth/2,w-g.lineWidth,h-g.lineWidth);}
  if(o.deco)o.deco(g,w,h);
  g.fillStyle=o.fg||'#c8452f';g.textAlign='center';g.textBaseline='middle';
  const chars=Array.from(text);
  if(o.vertical){const fs=o.fs||Math.min(w*.7,(h-30)/chars.length*.92);g.font=`700 ${fs}px ${JP}`;chars.forEach((c,i)=>g.fillText(c,w/2,(i+.5)*(h-30)/chars.length+15));}
  else{let fs=o.fs||h*.6;g.font=`700 ${fs}px ${JP}`;const tw=g.measureText(text).width;if(tw>w*.84){fs*=w*.84/tw;g.font=`700 ${fs}px ${JP}`;}g.fillText(text,w/2,h/2+fs*.04);}
});}
function sign(text,sw,sh,x,y,z,ry,o){o=o||{};const t=signTex(text,o);const m=new T.MeshStandardMaterial({map:t,alphaTest:o.round?.5:0,side:T.DoubleSide,roughness:.6});
  const mesh=add(new T.PlaneGeometry(sw,sh),m,x,y,z,{ry:ry||0,parent:o.parent});if(o.round)mesh.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:t,alphaTest:.5});return mesh;}

const DECO=['#c8452f','#2f8f7f','#e7a93a','#3f6fb0','#d86a8f','#f4f0d8'];
function facadeTex(o){const rows=o.rows,cols=o.cols,r=rng(o.seed||1);
  return ctex(512,1024,(g,w,h)=>{g.fillStyle=o.base;g.fillRect(0,0,w,h);
    const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,210,.25)');gr.addColorStop(1,'rgba(60,90,40,.28)');g.fillStyle=gr;g.fillRect(0,0,w,h);
    speckle(g,w,h,7000,.07,r);
    const ch=h/rows,cw=w/cols;
    for(let j=0;j<rows;j++){
      const band=r();
      for(let i=0;i<cols;i++){const x=i*cw+cw*.2,y=j*ch+ch*.2,ww=cw*.6,hh=ch*.52;
        if(band<.12&&j>0){continue;}
        g.fillStyle=o.frame||'rgba(250,246,220,.9)';g.fillRect(x-3,y-3,ww+6,hh+6);
        const lit=r()<.12;const dk=30+r()*30|0;
        g.fillStyle=lit?'#f7e9a8':`rgb(${dk},${dk+22},${dk+18})`;g.fillRect(x,y,ww,hh);
        const wg=g.createLinearGradient(x,y,x+ww,y+hh);wg.addColorStop(0,'rgba(190,230,235,.45)');wg.addColorStop(.5,'rgba(190,230,235,0)');g.fillStyle=wg;g.fillRect(x,y,ww,hh);
        g.fillStyle='rgba(240,236,205,.9)';g.fillRect(x+ww/2-1.5,y,3,hh);
        if(r()<.3){g.fillStyle=DECO[r()*DECO.length|0];g.globalAlpha=.75;g.fillRect(x,y,ww*(.3+r()*.3),hh);g.globalAlpha=1;}
        if(r()<.25){g.fillStyle='rgba(70,130,45,.85)';for(let k=0;k<7;k++){g.beginPath();g.arc(x+r()*ww,y+hh+2+r()*6,3+r()*6,0,7);g.fill();}}
      }
      g.fillStyle='rgba(60,70,40,.35)';g.fillRect(0,j*ch+ch*.86,w,ch*.05);g.fillStyle='rgba(255,255,230,.35)';g.fillRect(0,j*ch+ch*.82,w,ch*.04);
      if(band<.12&&j>0){g.fillStyle=DECO[(r()*4|0)];g.globalAlpha=.8;g.fillRect(0,j*ch+ch*.12,w,ch*.62);g.globalAlpha=1;
        for(let i=0;i<cols*2;i++){g.fillStyle=DECO[5];g.beginPath();g.arc((i+.5)*cw/2,j*ch+ch*.43,ch*.2,0,7);g.fill();g.fillStyle=DECO[(i+j)%4];g.beginPath();g.arc((i+.5)*cw/2,j*ch+ch*.43,ch*.11,0,7);g.fill();}}
    }
    for(let i=0;i<50;i++){const x=r()*w,y=r()*h*.9;const sg=g.createLinearGradient(0,y,0,y+90+r()*160);sg.addColorStop(0,'rgba(70,80,40,.22)');sg.addColorStop(1,'rgba(70,80,40,0)');g.fillStyle=sg;g.fillRect(x,y,2+r()*5,250);}
    for(let i=0;i<(o.moss||50);i++){g.fillStyle=`rgba(${70+r()*50|0},${140+r()*50|0},${40+r()*30|0},${.18+r()*.3})`;g.beginPath();g.arc(r()*w,r()*h,8+r()*34,0,7);g.fill();}
  });}
