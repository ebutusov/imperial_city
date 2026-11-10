// watermelons.js
// The "chilled" sign and the floating watermelons (3), bollards and grass.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const bobbers=[];
(function(){const x=-18.5,z=25.9;const g=new T.Group();g.position.set(x,0,z);g.rotation.z=-.12;g.rotation.y=.25;scene.add(g);
  add(new T.CylinderGeometry(.05,.05,3.6,8),M(0x8a7a5a),0,1.4,0,{parent:g});
  const t=signTex('ひえてるよ',{w:160,h:512,vertical:true,bg:'#fdfdf6',fg:'#2a6fc0',border:'#2a6fc0',lw:6,deco:(c,w,h)=>{c.fillStyle='#7fc0ee';for(let i=0;i<9;i++){c.beginPath();c.arc(20+i*15,h-22+(i%2)*8,5,0,7);c.fill();}}});
  add(new T.PlaneGeometry(.95,2.9),new T.MeshStandardMaterial({map:t,side:T.DoubleSide,roughness:.7}),0,2.6,.06,{parent:g});
  const melon=ctex(256,128,(g2,w,h)=>{g2.fillStyle='#2f8a2f';g2.fillRect(0,0,w,h);const r=rng(6);for(let i=0;i<12;i++){g2.strokeStyle='#123f17';g2.lineWidth=7+r()*4;g2.beginPath();const x0=i*w/12+w/24;g2.moveTo(x0,0);for(let y=0;y<=h;y+=8)g2.lineTo(x0+Math.sin(y*.25+i)*4,y);g2.stroke();}});
  const mm=new T.MeshStandardMaterial({map:melon,roughness:.35});
  [[2.2,.6,.55],[3.6,1.5,.62],[5.0,.3,.5],[4.3,2.6,.58],[2.9,2.4,.52],[6.0,1.7,.56]].forEach((p,i)=>{const m=add(new T.SphereGeometry(p[2],32,24),mm,x+p[0],.1,z+p[1],{s:[1.12,1,1]});m.rotation.set(Math.PI/2+i,i*1.3,0);bobbers.push({m,ph:i*1.7,base:.08,amp:.06,x:m.position.x,z:m.position.z});});
  blob(-20.6,QUAY+.25,26.8,1.5,.35,2.2,260,'bright',R0,.5);blob(-20.4,QUAY+.2,22.9,.8,.3,1.2,110,'bright',R0,.45);
  for(let i=0;i<5;i++)cyl(-19.6+((i*37)%7)*.03,10+i*4.1,.13,.16,QUAY,.55,M(0x3a4a3c,{metalness:.4,roughness:.5}),14);
})();
