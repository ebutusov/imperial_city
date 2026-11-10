// shop.js
// Grocery shop (1): shopfront, awning, arched window, curved roof, emblem, crates and kiosk lamp.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const shop=new T.Group();shop.position.set(-31.2,QUAY,17.55);shop.rotation.y=Math.PI/2;scene.add(shop);
(function(){const W=14.3,D=13,o={parent:shop};
  const plankT=ctex(256,256,(g,w,h)=>{const r=rng(13);g.fillStyle='#27504b';g.fillRect(0,0,w,h);for(let i=0;i<10;i++){const v=r()*18|0;g.fillStyle=`rgb(${30+v},${72+v},${68+v})`;g.fillRect(i*26,0,24,h);}speckle(g,w,h,1500,.1,r);},{rep:[3,2]});
  const body=new T.MeshStandardMaterial({map:plankT,roughness:.8});
  add(new T.BoxGeometry(W,8.1,D),body,0,4.05,0,o);
  // ground floor shopfront
  const front=ctex(1024,300,(g,w,h)=>{const r=rng(17);g.fillStyle='#1b2f2c';g.fillRect(0,0,w,h);
    for(let s=0;s<4;s++){const y=30+s*56;g.fillStyle='#b9905a';g.fillRect(250,y+44,760,7);for(let i=0;i<34;i++){g.fillStyle=['#e8734a','#f1c53a','#7fc45a','#f6f1dc','#d86a8f','#3f9c8a'][r()*6|0];const bw=12+r()*14;g.fillRect(256+i*22,y+44-(18+r()*22),bw,18+r()*22);}}
    for(let i=0;i<5;i++)for(let j=0;j<5;j++){g.fillStyle=(i+j)%2?'#3f6fb0':'#f4f1e2';g.fillRect(20+i*42,h-5*26+j*26,42,26);}
    g.fillStyle='#f6f1dc';g.fillRect(30,20,80,110);g.fillStyle='#c8452f';g.font=`700 44px ${JP}`;g.fillText('菜',48,70);g.fillText('果',48,116);
    g.fillStyle='#e7a93a';g.fillRect(130,20,90,60);g.fillStyle='#2b3a30';g.font=`700 30px ${JP}`;g.fillText('特売',146,60);
    const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(0,0,0,.45)');gr.addColorStop(.5,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
  add(new T.PlaneGeometry(W-.6,3.5),new T.MeshStandardMaterial({map:front,roughness:.8}),0,1.8,D/2+.02,o);
  [-W/2+.25,W/2-.25,-2.2].forEach(x=>add(new T.BoxGeometry(.4,3.6,.4),M(0xc8452f,{roughness:.6}),x,1.8,D/2+.15,o));
  // awning
  const aw=stripeTex(['#e8734a','#f6efd2'],14,true);
  add(new T.PlaneGeometry(W+.8,2.6),new T.MeshStandardMaterial({map:aw,side:T.DoubleSide,roughness:.8}),0,3.35,D/2+1.2,Object.assign({rx:-Math.PI/2+.28},o));
  const sc=ctex(512,64,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<14;i++){g.fillStyle=i%2?'#f6efd2':'#e8734a';g.beginPath();g.arc(i*w/14+w/28,0,w/28,0,Math.PI);g.fill();}});
  add(new T.PlaneGeometry(W+.8,.5),new T.MeshStandardMaterial({map:sc,alphaTest:.5,side:T.DoubleSide}),0,2.76,D/2+2.45,o);
  [-W/2,W/2].forEach(x=>add(new T.CylinderGeometry(.05,.05,3,8),M(0x2f5f2a),x,1.5,D/2+2.4,o));
  // green wavy fascia
  const wav=ctex(1024,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.beginPath();g.moveTo(0,h);for(let x=0;x<=w;x+=8)g.lineTo(x,38+Math.sin(x/w*6.283*3.5)*22);g.lineTo(w,h);g.closePath();g.fillStyle='#3fae3a';g.fill();g.lineWidth=10;g.strokeStyle='#f1d84a';g.stroke();
    g.fillStyle='#bff08a';for(let i=0;i<30;i++){g.beginPath();g.arc(20+i*34,96,5,0,7);g.fill();}});
  add(new T.PlaneGeometry(W,1.5),new T.MeshStandardMaterial({map:wav,alphaTest:.5,side:T.DoubleSide,roughness:.5}),0,4.35,D/2+.3,o);
  // upper arched lattice window
  const arch=ctex(1024,512,(g,w,h)=>{g.fillStyle='#234a45';g.fillRect(0,0,w,h);g.save();g.beginPath();g.moveTo(90,h-20);g.lineTo(90,300);g.quadraticCurveTo(w/2,-120,w-90,300);g.lineTo(w-90,h-20);g.closePath();g.fillStyle='#0f1f1e';g.fill();g.clip();
    const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'rgba(140,200,190,.35)');gr.addColorStop(1,'rgba(240,220,140,.12)');g.fillStyle=gr;g.fillRect(0,0,w,h);
    g.strokeStyle='#3a726a';g.lineWidth=7;for(let x=90;x<w-80;x+=58){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}for(let y=60;y<h;y+=58){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}g.restore();
    g.lineWidth=18;g.strokeStyle='#3d7d74';g.beginPath();g.moveTo(90,h-20);g.lineTo(90,300);g.quadraticCurveTo(w/2,-120,w-90,300);g.lineTo(w-90,h-20);g.stroke();
    [[250,250,'#f4f0e0'],[390,170,'#e2574a']].forEach(a=>{for(let i=0;i<10;i++){const an=i/10*6.283;g.fillStyle=a[2];g.beginPath();g.ellipse(a[0]+Math.cos(an)*30,a[1]+Math.sin(an)*30,22,9,an,0,7);g.fill();}g.fillStyle='#f1c53a';g.beginPath();g.arc(a[0],a[1],13,0,7);g.fill();});});
  add(new T.PlaneGeometry(W-.4,4),new T.MeshStandardMaterial({map:arch,roughness:.55}),0,6.1,D/2+.03,o);
  // curved roof and gable
  const roofM=new T.MeshStandardMaterial({color:0x1f4540,roughness:.55,metalness:.2,side:T.DoubleSide});
  const rf=new T.Mesh(new T.CylinderGeometry(W/2+.5,W/2+.5,D+1.2,48,1,false,Math.PI/2,Math.PI),roofM);rf.rotation.x=Math.PI/2;rf.scale.set(1,1,.36);rf.position.set(0,8.1,0);rf.castShadow=true;shop.add(rf);
  add(new T.CircleGeometry(W/2+.5,48,0,Math.PI),new T.MeshStandardMaterial({color:0x2b5a54,roughness:.6,side:T.DoubleSide}),0,8.1,D/2+.6,Object.assign({s:[1,.36,1]},o));
  add(new T.BoxGeometry(W+1.2,.3,D+1.4),M(0x3d7d74),0,8.05,0,o);
  // rooftop emblem with string lights
  const em=ctex(512,320,(g,w,h)=>{g.clearRect(0,0,w,h);g.translate(w/2,h*.56);g.fillStyle='#e9c24c';g.strokeStyle='#fff3b8';g.lineWidth=6;g.beginPath();for(let i=0;i<20;i++){const a=i/20*6.283-1.57,rr=i%2?92:150;g.lineTo(Math.cos(a)*rr*1.45,Math.sin(a)*rr*.9);}g.closePath();g.fill();g.stroke();
    g.fillStyle='#f8e7a0';g.beginPath();g.ellipse(0,0,96,66,0,0,7);g.fill();g.strokeStyle='#c9952e';g.lineWidth=7;for(let k=-1;k<=1;k+=2){g.beginPath();g.arc(k*40,6,26,0,5);g.stroke();g.beginPath();g.arc(k*150,60,34,3.6,8);g.stroke();}
    g.fillStyle='#c8452f';g.font=`700 54px ${JP}`;g.textAlign='center';g.fillText('菜',0,-34);});
  add(new T.PlaneGeometry(8.4,5.2),new T.MeshStandardMaterial({map:em,alphaTest:.5,side:T.DoubleSide,roughness:.4,metalness:.3}),-1,11.9,D/2-1.2,o);
  for(let i=0;i<26;i++){const a=i/25*Math.PI;add(new T.SphereGeometry(.09,8,6),new T.MeshStandardMaterial({color:0xfff2a8,emissive:0xffcf5a,emissiveIntensity:1.5}),-1+Math.cos(a)*5.4,10.2+Math.sin(a)*4.2,D/2-1.15,Object.assign({cast:false},o));}
  // lantern sign, hanging shop board
  sign('あ',1.5,1.5,-5.6,4.4,D/2+2.2,0,{round:true,bg:'#fbf3cf',border:'#e7862e',fg:'#e7862e',parent:shop});
  add(new T.CylinderGeometry(.03,.03,1.2,6),M(0x1d2a24),-5.6,5.6,D/2+2.2,o);
  banner('やさいくだもの',1.5,4.6,W/2+1.3,5.2,D/2+1.5,0,{bg:'#23408e',fg:'#f6f1dc',border:'#f1c53a',parent:shop});
  add(new T.BoxGeometry(2.4,.1,.1),M(0x1d2a24),W/2+.5,7.6,D/2+1.5,o);
  // crates of produce
  const r=rng(55);const crate=new T.MeshStandardMaterial({map:woodTex,roughness:.9});
  [[-4.4,7.6,0xe2574a],[-3.1,7.9,0xf1a53a],[1.2,8.1,0x7fc45a],[2.6,7.8,0xf1d84a],[4.4,7.7,0xe8734a],[5.7,8.0,0x9ad05a]].forEach(c=>{
    add(new T.BoxGeometry(1.1,.55,.8),crate,c[0],.28,c[1],Object.assign({ry:(r()-.5)*.4},o));
    for(let i=0;i<9;i++)add(new T.SphereGeometry(.14,12,10),M(c[2],{roughness:.5}),c[0]+(r()-.5)*.8,.62+r()*.06,c[1]+(r()-.5)*.5,o);});
  add(new T.BoxGeometry(1.0,.5,.7),M(0xe6cf6a,{roughness:1}),-6.3,.25,9.6,o);
  // A-frame blackboard and potted plant
  [-.22,.22].forEach((rz,i)=>add(new T.BoxGeometry(.9,1.2,.05),M(i?0x2b3a30:0x1f2a24),3.4,.6,9.6+(i?.2:-.2),Object.assign({rx:i?-.25:.25},o)));
  add(new T.CylinderGeometry(.3,.22,.5,16),M(0xe8c23a),6.6,.25,7.4,o);
  // teal parasol stall at the south end
  add(new T.CylinderGeometry(.04,.04,2.6,8),M(0x6b5a3a),-6.6,1.3,8.2,o);add(new T.ConeGeometry(1.6,.6,32,1,true),new T.MeshStandardMaterial({color:0x2fb0a0,side:T.DoubleSide,roughness:.7}),-6.6,2.7,8.2,o);
})();
blob(-33.2,QUAY+4.6,23.4,1.2,1.0,3.5,220,'bright',R0,.6);blob(-24.3,QUAY+9,11,1.6,2.2,1.6,200,'mid',R0,.7);
// ornate kiosk lamp on the quay edge
(function(){const x=-19.3,z=17;const g=new T.LatheGeometry([[.55,0],[.6,.15],[.5,.3],[.52,1.7],[.62,1.85],[.45,2.0],[.5,2.5],[.62,2.6],[.3,2.85],[.1,3.2],[0,3.25]].map(a=>new T.Vector2(a[0],a[1])),32);
  add(g,M(0x2f6b4a,{roughness:.5,metalness:.3}),x,QUAY,z);add(new T.CylinderGeometry(.46,.46,.44,24),new T.MeshStandardMaterial({color:0xfff6cf,emissive:0xffe9a0,emissiveIntensity:.6}),x,QUAY+2.26,z,{cast:false});})();
