// helpers.js
// Shared helpers: map-to-world scale, seeded RNG, canvas textures, material and mesh shortcuts, capsule geometry.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const S=0.13,QUAY=1.0,DECK=6.5;
const P=(px,py)=>[(px-340)*S,(py-250)*S];
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const R0=rng(7);
const JP='"Hiragino Maru Gothic ProN","Yu Gothic","Noto Sans CJK JP","Noto Sans JP","MS PGothic",sans-serif';
const MAXA=Math.min(8,renderer.capabilities.getMaxAnisotropy());
function ctex(w,h,draw,o){o=o||{};const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=MAXA;
  if(o.rep){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(o.rep[0],o.rep[1]);}return t;}
function M(color,o){return new T.MeshStandardMaterial(Object.assign({color,roughness:.85,metalness:0},o||{}));}
function add(geo,mat,x,y,z,o){o=o||{};const m=new T.Mesh(geo,mat);m.position.set(x,y,z);
  if(o.rx)m.rotation.x=o.rx;if(o.ry)m.rotation.y=o.ry;if(o.rz)m.rotation.z=o.rz;
  if(o.s)m.scale.set(o.s[0],o.s[1],o.s[2]);
  m.castShadow=o.cast!==false;m.receiveShadow=o.recv!==false;(o.parent||scene).add(m);return m;}
function speckle(g,w,h,n,a,rand){for(let i=0;i<n;i++){g.fillStyle=`rgba(${rand()<.5?0:255},${rand()<.5?40:255},${rand()<.5?0:200},${a*rand()})`;g.fillRect(rand()*w,rand()*h,1+rand()*3,1+rand()*3);}}
function capsule(r,len,seg){const pts=[];const n=8;for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*Math.PI/2;pts.push(new T.Vector2(Math.cos(a)*r,-len/2+Math.sin(a)*r));}
  for(let i=0;i<=n;i++){const a=i/n*Math.PI/2;pts.push(new T.Vector2(Math.cos(a)*r,len/2+Math.sin(a)*r));}return new T.LatheGeometry(pts,seg||16);}
