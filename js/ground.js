// ground.js
// Left and right canal banks with kerb stones.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
function bank(poly,h){const sh=new T.Shape();poly.forEach((p,i)=>{const w=P(p[0],p[1]);if(i)sh.lineTo(w[0],-w[1]);else sh.moveTo(w[0],-w[1]);});
  const g=new T.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false});
  const m=new T.Mesh(g,[new T.MeshStandardMaterial({map:paveTex,roughness:.9}),new T.MeshStandardMaterial({map:wallTex,roughness:.95})]);
  m.rotation.x=-Math.PI/2;m.position.y=QUAY-h;m.receiveShadow=true;m.castShadow=true;scene.add(m);
  for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];if(Math.abs(a[0])>700||Math.abs(b[0])>800||a[1]<-100||b[1]<-100||a[1]>700||b[1]>700)continue;
    const A=P(a[0],a[1]),B=P(b[0],b[1]);const len=Math.hypot(B[0]-A[0],B[1]-A[1]);
    add(new T.BoxGeometry(len+.4,.22,.55),M(0xe9e2c0,{roughness:.8}),(A[0]+B[0])/2,QUAY+.1,(A[1]+B[1])/2,{ry:-Math.atan2(B[1]-A[1],B[0]-A[0])});}}
bank([[-300,-150],[270,-150],[270,20],[260,220],[200,330],[190,480],[190,720],[-300,720]],4);
bank([[400,-150],[980,-150],[980,720],[480,720],[480,480],[470,300],[410,200],[400,20]],4);
add(new T.BoxGeometry(60,4,30),M(0xcfc79b),0,QUAY-2,76);
