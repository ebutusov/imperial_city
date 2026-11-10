// dock-market.js
// Water bus stop dock (12) and market stalls with vendors (13).
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const dock=new T.Group();dock.position.x=-3.1;scene.add(dock);
(function(){const o={parent:dock};add(new T.BoxGeometry(4.6,.35,11.6),new T.MeshStandardMaterial({map:woodTex,roughness:.9}),18.2,.42,18.8,o);
  add(new T.BoxGeometry(4.7,.5,.3),M(0xb8452f),18.2,.3,13.0,o);add(new T.BoxGeometry(.3,.5,11.7),M(0xb8452f),15.9,.3,18.8,o);
  for(let i=0;i<5;i++)add(new T.TorusGeometry(.33,.13,12,24),M(0x23262a,{roughness:.9}),15.72,.3,14.4+i*2.2,{parent:dock,ry:Math.PI/2});
  [[13.1,13.4],[13.1,24.2],[17.2,13.4],[17.2,24.2]].forEach(p=>cyl(p[0],p[1],.14,.16,-1,4.2,M(0x6b5a3a),12));
  // shelter with yellow sign
  [[16.6,14.2],[16.6,23.4],[20.2,14.2],[20.2,23.4]].forEach(p=>add(new T.CylinderGeometry(.06,.06,2.9,8),M(0x2f5f2a),p[0],2.05,p[1],o));
  add(new T.BoxGeometry(4.4,.1,10),new T.MeshStandardMaterial({map:stripeTex(['#f1c53a','#f6efd2'],10,false),roughness:.8}),18.4,3.55,18.8,Object.assign({rz:.06},o));
  sign('水上バス',5.4,.95,16.25,3.0,18.8,-Math.PI/2,{w:512,h:96,bg:'#f1d84a',fg:'#2f6b3a',border:'#2f6b3a',lw:6,parent:dock});
  // gangway to the quay
  add(new T.BoxGeometry(2.4,.12,1.6),new T.MeshStandardMaterial({map:woodTex}),17.6,.75,18.8,{rz:.2});
})();
(function(){const r=rng(71);[[26.4,12.4],[26.4,16.9],[26.4,21.5],[33,10.5],[33,22.5]].forEach((s,i)=>{const x=s[0],z=s[1];
  add(new T.BoxGeometry(2.6,.9,2),new T.MeshStandardMaterial({map:woodTex,roughness:.9}),x,Q+.45,z);
  [[-1.2,-.9],[1.2,-.9],[-1.2,.9],[1.2,.9]].forEach(c=>add(new T.CylinderGeometry(.04,.04,2.5,6),M(0x6b5a3a),x+c[0],Q+1.25,z+c[1]));
  const aw=stripeTex(i%2?['#f1c53a','#f8f0c8']:['#f1b53a','#fff6d0'],8,true);
  add(new T.PlaneGeometry(3.2,2.6),new T.MeshStandardMaterial({map:aw,side:T.DoubleSide,roughness:.8}),x,Q+2.6,z,{rx:-Math.PI/2,rz:0}).rotation.set(-Math.PI/2,.14,0);
  for(let k=0;k<16;k++)add(new T.SphereGeometry(.13,10,8),M([0xe2574a,0xf1a53a,0x7fc45a,0xf1d84a,0xa85ab0][k%5],{roughness:.5}),x+(r()-.5)*2.2,Q+1.0,z+(r()-.5)*1.6);
  const v=makePerson({top:[0xf6efd2,0x6fa8c8,0xe8734a][i%3],bottom:0x4a4438,hat:i%2===0,hair:0x2b2118,skin:SKIN[i%4]});v.root.position.set(x+1.9,Q,z+(r()-.5));v.root.rotation.y=-Math.PI/2;v.aL.el.rotation.x=-1.1;waiters.push({p:v,ph:i*2.3,ry:-Math.PI/2,y:Q});});
  const aw2=stripeTex(['#f1c53a','#fbf3cf'],10,true);
  add(new T.PlaneGeometry(2.8,16),new T.MeshStandardMaterial({map:aw2,side:T.DoubleSide,roughness:.8}),32.2,Q+3.4,17,{}).rotation.set(-Math.PI/2,-.35,0);
})();
