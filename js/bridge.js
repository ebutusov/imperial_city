// bridge.js
// Green footbridge with peaked truss (6), yellow stairs (5) and the elevated walkway (11).
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const green=M(0x5f9a3c,{roughness:.6}),dgreen=M(0x2f5f2a,{roughness:.6}),plank=new T.MeshStandardMaterial({map:woodTex,color:0xf1e6c0,roughness:.9});
(function(){
  add(new T.BoxGeometry(37.6,.22,2.6),plank,-1.8,DECK-.11,0);
  [-1.3,1.3].forEach(z=>{add(new T.BoxGeometry(37.6,.55,.22),green,-1.8,DECK-.3,z);rail(-20.6,z,17,z,DECK,1.1,0x6fae45);});
  [[-17.4,0],[16.2,0]].forEach(p=>{[-1,1].forEach(s=>cyl(p[0],s*1.1,.22,.26,QUAY,DECK-QUAY-.5,green,12));add(new T.BoxGeometry(.3,.3,2.6),green,p[0],DECK-.75,0);});
  // peaked truss over the canal
  const apex=new V3(6.8,DECK+6.4,0),L=new V3(-5.2,DECK,0),Rr=new V3(17,DECK+.4,0);
  [-1.3,1.3].forEach(z=>{[[L,apex],[apex,Rr]].forEach(s=>{const a=s[0],b=s[1];const len=a.distanceTo(b);
    add(new T.BoxGeometry(len,.42,.32),green,(a.x+b.x)/2,(a.y+b.y)/2,z,{rz:Math.atan2(b.y-a.y,b.x-a.x)});});
    for(let x=-3;x<16.5;x+=2.2){const y=x<6.8?DECK+(x+5.2)/12*6.4:DECK+.4+(17-x)/10.2*6;add(new T.CylinderGeometry(.035,.035,y-DECK-.9,6),dgreen,x,(y+DECK+.9)/2,z);}});
  add(new T.BoxGeometry(.4,.4,3),green,apex.x,apex.y,0);
  // signals on the truss
  [[2.2,DECK+3.2],[4.2,DECK+4.4],[9.6,DECK+4.2]].forEach((p,i)=>{add(new T.BoxGeometry(.5,1.25,.4),M(0x1c2a22),p[0],p[1],1.55);
    ['#ff5a3c','#ffd23c','#49e07a'].forEach((c,k)=>add(new T.SphereGeometry(.13,12,10),new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:(k===(i%3))?1.6:.15}),p[0],p[1]+.38-k*.38,1.78,{cast:false}));});
  // hanging round sign under the deck
  cyl(4.4,1.45,.03,.03,DECK-2.0,1.6,dgreen,6);sign('菜',2.3,2.3,4.4,DECK-3.0,1.45,0,{round:true,bg:'#f6f1dc',border:'#c8452f',fg:'#c8452f'});
  // 5 yellow stairs up to the deck
  const yel=M(0xf0c93d,{roughness:.6});const n=20,z0=9.4,z1=1.3,x=-19.6;
  for(let i=0;i<n;i++){const t=(i+.5)/n;add(new T.BoxGeometry(1.7,.12,(z0-z1)/n+.05),plank,x,QUAY+(DECK-QUAY)*((i+1)/n),z0+(z1-z0)*t);}
  const sl=Math.hypot(z0-z1,DECK-QUAY);[-.9,.9].forEach(dx=>{add(new T.BoxGeometry(.12,.5,sl+.3),yel,x+dx,(QUAY+DECK)/2,(z0+z1)/2,{rx:Math.atan2(DECK-QUAY,z0-z1)});
    add(new T.BoxGeometry(.07,.07,sl+.3),yel,x+dx,(QUAY+DECK)/2+1.05,(z0+z1)/2,{rx:Math.atan2(DECK-QUAY,z0-z1)});
    for(let i=0;i<=5;i++){const t=i/5;add(new T.CylinderGeometry(.03,.03,1.05,6),yel,x+dx,QUAY+(DECK-QUAY)*t+.52,z0+(z1-z0)*t);}});
  cyl(x,5.4,.14,.14,QUAY,2.6,yel,8);
  // 11 elevated walkway on the right bank
  add(new T.BoxGeometry(21.4,.4,6.6),M(0xe9dfb0),27.5,DECK-.2,-.3);
  rail(17,3,38,3,DECK,1.15,0xf4efd2);rail(17,1.3,17,3,DECK,1.15,0xf4efd2);rail(17,-1.3,17,-3.3,DECK,1.15,0xf4efd2);
  for(let xx=18.5;xx<38;xx+=4.6)cyl(xx,2.6,.38,.42,QUAY,DECK-QUAY-.4,M(0xe6dcae),18);
  cyl(31,4.6,1.05,1.15,QUAY,DECK+5-QUAY,M(0xf0e7bd,{roughness:.6}),32);
  const bt=signTex('朝市　水上バス　乗り場　朝市',{w:1024,h:96,bg:'#f3e9bd',fg:'#c8452f',border:'#e7a93a',lw:6});
  add(new T.PlaneGeometry(13,1),new T.MeshStandardMaterial({map:bt,side:T.DoubleSide}),25,DECK+.6,3.06);
  [0,1,2].forEach(i=>add(new T.SphereGeometry(.42,20,14),new T.MeshStandardMaterial({color:0xfdfbe8,emissive:0xfff3c0,emissiveIntensity:.35,roughness:.4}),17.4,DECK+2.2-i*.9,3.2));
  cyl(17.4,3.2,.05,.05,QUAY,DECK+2.6-QUAY,dgreen,8);
  // arcade shop fronts under the walkway
  const shopT=ctex(1024,256,(g,w,h)=>{const r=rng(66);g.fillStyle='#3a4a3c';g.fillRect(0,0,w,h);for(let i=0;i<8;i++){g.fillStyle=['#f1e2a2','#e8734a','#2f9c8a','#f6f1dc'][i%4];g.fillRect(i*128+6,6,116,44);g.fillStyle='#25312a';g.fillRect(i*128+10,58,108,190);
    for(let k=0;k<26;k++){g.fillStyle=DECO[r()*DECO.length|0];g.fillRect(i*128+14+r()*96,70+r()*160,8+r()*14,8+r()*12);}g.fillStyle='#fff8d0';g.globalAlpha=.25;g.fillRect(i*128+10,58,108,40);g.globalAlpha=1;}});
  add(new T.PlaneGeometry(19,4.6),new T.MeshStandardMaterial({map:shopT,roughness:.8}),27.5,QUAY+2.6,-2.95);
})();
