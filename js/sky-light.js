// sky-light.js
// Sky dome with clouds, sun glow, hemisphere and directional lights, shadows.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const sunDir=new V3(0.18,0.78,-0.6).normalize();
const skyTex=ctex(2048,1024,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2f86d8');gr.addColorStop(.36,'#6db6ea');gr.addColorStop(.46,'#bfe2ee');gr.addColorStop(.495,'#eaf4d8');gr.addColorStop(.52,'#eef4cf');gr.addColorStop(1,'#cfe2a8');
  g.fillStyle=gr;g.fillRect(0,0,w,h);
  const r=rng(11);
  for(let k=0;k<11;k++){const cx=r()*w,cy=h*(.1+r()*.3),sz=50+r()*110;
    for(let i=0;i<34;i++){const x=cx+(r()-.5)*sz*3.2,y=cy+(r()-.5)*sz*.7-Math.abs(x-cx)*.08,rad=sz*(.25+r()*.5);
      const rg=g.createRadialGradient(x,y,0,x,y,rad);rg.addColorStop(0,'rgba(255,255,255,.3)');rg.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle=rg;g.beginPath();g.arc(x,y,rad,0,7);g.fill();
      if(x<rad){g.beginPath();const x2=x+w;const rg2=g.createRadialGradient(x2,y,0,x2,y,rad);rg2.addColorStop(0,'rgba(255,255,255,.3)');rg2.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg2;g.arc(x2,y,rad,0,7);g.fill();}
    }}
});
const sky=new T.Mesh(new T.SphereGeometry(900,48,24),new T.MeshBasicMaterial({map:skyTex,side:T.BackSide,fog:false,depthWrite:false,toneMapped:false}));
sky.rotation.y=1.2;scene.add(sky);
const glowTex=ctex(256,256,(g,w)=>{const rg=g.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);rg.addColorStop(0,'rgba(255,255,235,1)');rg.addColorStop(.2,'rgba(255,250,200,.55)');rg.addColorStop(.55,'rgba(255,245,170,.14)');rg.addColorStop(1,'rgba(255,240,160,0)');g.fillStyle=rg;g.fillRect(0,0,w,w);});
const sunGlow=new T.Sprite(new T.SpriteMaterial({map:glowTex,blending:T.AdditiveBlending,fog:false,depthWrite:false,transparent:true}));
sunGlow.position.copy(sunDir).multiplyScalar(700);sunGlow.material.opacity=.7;sunGlow.scale.set(560,560,1);scene.add(sunGlow);

scene.add(new T.HemisphereLight(0xf3f6dc,0x93a85c,0.62));
const sun=new T.DirectionalLight(0xffeab0,1.5);
sun.position.copy(sunDir).multiplyScalar(160);sun.castShadow=true;
sun.shadow.mapSize.set(4096,4096);const sc=sun.shadow.camera;sc.left=-75;sc.right=75;sc.top=80;sc.bottom=-70;sc.near=20;sc.far=330;
sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.06;scene.add(sun);scene.add(sun.target);
const fill=new T.DirectionalLight(0xcfe8ff,0.16);fill.position.set(-40,50,90);scene.add(fill);
