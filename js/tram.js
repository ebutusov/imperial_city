// tram.js
// The floating water tram (7) and its wake.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const tram=new T.Group();scene.add(tram);
(function(){const o={parent:tram};const L=7.2,Wd=2.5;
  function rr(w,l,r){const s=new T.Shape();const x=w/2,y=l/2;s.moveTo(-x+r,-y);s.lineTo(x-r,-y);s.quadraticCurveTo(x,-y,x,-y+r);s.lineTo(x,y-r);s.quadraticCurveTo(x,y,x-r,y);s.lineTo(-x+r,y);s.quadraticCurveTo(-x,y,-x,y-r);s.lineTo(-x,-y+r);s.quadraticCurveTo(-x,-y,-x+r,-y);return s;}
  function slab(w,l,r,h,y,mat,bev){const g=new T.ExtrudeGeometry(rr(w,l,r),{depth:h,bevelEnabled:!!bev,bevelSize:bev||0,bevelThickness:bev||0,bevelSegments:4,curveSegments:16});const m=new T.Mesh(g,mat);m.rotation.x=-Math.PI/2;m.position.y=y;m.castShadow=true;m.receiveShadow=true;tram.add(m);return m;}
  const red=M(0xb5382e,{roughness:.45}),crm=M(0xf2e8c4,{roughness:.5}),dark=M(0x3a2a22,{roughness:.7}),brass=M(0xd9a441,{metalness:.6,roughness:.35});
  slab(3.1,L+1,1.4,.75,-.35,dark,.08);                 // hull
  slab(3.25,L+1.15,1.45,.14,.38,M(0x8a6a3a,{roughness:.8}),.03); // rub rail
  slab(Wd,L,1.05,1.0,.5,red,.03);                     // lower body
  slab(Wd+.06,L+.06,1.08,.1,1.5,brass);               // belt
  slab(Wd-.04,L-.04,1.03,1.15,1.6,crm);               // window band
  slab(Wd+.2,L+.2,1.15,.14,2.75,red,.04);             // eave
  slab(Wd-.3,L-.5,.95,.26,2.9,M(0xcfc9a8,{roughness:.7}),.1); // roof
  slab(1.3,L-2.2,.5,.3,3.2,crm,.05);                  // clerestory
  const glass=new T.MeshStandardMaterial({color:0x1f3a3a,roughness:.08,metalness:.6,transparent:true,opacity:.82});
  for(let s=-1;s<=1;s+=2){for(let i=0;i<5;i++)add(new T.PlaneGeometry(.78,.82),glass,s*(Wd/2-.01),2.15,-2.08+i*1.04,{parent:tram,ry:s*Math.PI/2,cast:false});
    for(let k=-1;k<=1;k++){const a=k*.62;add(new T.PlaneGeometry(.72,.82),glass,Math.sin(a)*1.02,2.15,s*(L/2-1.05+Math.cos(a)*1.045),{parent:tram,ry:s>0?a:Math.PI-a,cast:false});}
    add(new T.SphereGeometry(.17,16,12),new T.MeshStandardMaterial({color:0xfff6cf,emissive:0xffe9a0,emissiveIntensity:1.3}),0,1.05,s*(L/2+.02),{parent:tram,cast:false});
    const pl=sign('6',.5,.5,0,1.32,s*(L/2+.045)+0,s>0?0:Math.PI,{w:128,h:128,bg:'#f6f1dc',fg:'#1d2a24',border:'#1d2a24',lw:8,parent:tram});pl.position.y=.82;
    for(let i=0;i<2;i++)add(new T.TorusGeometry(.24,.07,10,24),M(0xf6f1dc,{roughness:.6}),s*(Wd/2+.09),1.0,-1.6+i*3.2,{parent:tram,ry:Math.PI/2});
    add(new T.BoxGeometry(.05,.9,.7),M(0x2b2118),s*(Wd/2+.0),1.0,0,o);}
  // passengers
  for(let i=0;i<4;i++){add(new T.SphereGeometry(.13,14,10),M(SKIN[i%4]),(i%2?.55:-.55),2.12,-1.6+i*1.05,o);add(new T.SphereGeometry(.2,14,10),M([0xe8734a,0x6fa8c8,0xf1c53a,0x9ad05a][i]),(i%2?.55:-.55),1.82,-1.6+i*1.05,{parent:tram,s:[1,1.2,.8]});}
  // trolley pole
  const pole=new T.Group();pole.position.set(0,3.5,0);tram.add(pole);tram.userData.pole=pole;
  const plen=3.0;add(new T.CylinderGeometry(.03,.04,plen,8),dark,0,plen/2*Math.sin(.72),-plen/2*Math.cos(.72),{parent:pole,rx:-(Math.PI/2-.72)});
  add(new T.CylinderGeometry(.16,.2,.2,12),dark,0,0,0,{parent:pole});add(new T.SphereGeometry(.07,10,8),brass,0,plen*Math.sin(.72),-plen*Math.cos(.72),{parent:pole});
})();
// soft wake ring that follows the tram
const wakeTex=ctex(256,256,(g,w)=>{const rg=g.createRadialGradient(w/2,w/2,w*.2,w/2,w/2,w/2);rg.addColorStop(0,'rgba(255,255,255,0)');rg.addColorStop(.75,'rgba(255,255,255,.35)');rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.fillRect(0,0,w,w);});
const wake=add(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:wakeTex,transparent:true,depthWrite:false,opacity:.5}),0,.04,0,{rx:-Math.PI/2,cast:false,recv:false});wake.scale.set(5.5,10.5,1);
