// water.js
// Reflective canal water (THREE.Water) with a generated tileable normal map.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const waterGeo=new T.PlaneGeometry(420,420);
let water;
const wnTex=(function(){const N=256,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d');const im=g.createImageData(N,N);const r=rng(31);const waves=[];
  for(let i=0;i<14;i++)waves.push([Math.round((r()-.5)*14),Math.round((r()-.5)*14)||1,r()*6.28,.5+r()]);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let dx=0,dy=0;for(const w of waves){const ph=6.2832*(w[0]*x+w[1]*y)/N+w[2];const cc=Math.cos(ph)*w[3]/(1+Math.hypot(w[0],w[1])*.25);dx+=cc*w[0];dy+=cc*w[1];}
    const nx=-dx*.09,ny=-dy*.09,l=Math.hypot(nx,ny,1);const k=(y*N+x)*4;im.data[k]=(nx/l*.5+.5)*255;im.data[k+1]=(ny/l*.5+.5)*255;im.data[k+2]=(1/l*.5+.5)*255;im.data[k+3]=255;}
  g.putImageData(im,0,0);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t;})();
if(T.Water){
  water=new T.Water(waterGeo,{textureWidth:1024,textureHeight:1024,waterNormals:wnTex,sunDirection:sunDir.clone(),sunColor:0xfff3c8,waterColor:new T.Color(0x4fb6a6).convertSRGBToLinear(),distortionScale:.22,fog:true});
  water.material.uniforms.size.value=14;
}else{
  wnTex.repeat.set(40,40);water=new T.Mesh(waterGeo,new T.MeshStandardMaterial({color:0x7cc6c0,roughness:.12,metalness:.35,normalMap:wnTex,normalScale:new T.Vector2(.5,.5)}));water.receiveShadow=true;
}
water.rotation.x=-Math.PI/2;water.position.set(0,0,10);scene.add(water);
