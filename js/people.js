// people.js
// Person builder, walk cycle, walker routes, the seated shopkeeper with newspaper (2) and the people waiting at the dock.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const SKIN=[0xf2cfa8,0xe8b98e,0xf6d9b8,0xd9a77c];
function makePerson(o){o=o||{};const root=new T.Group();const sc=o.scale||1;root.scale.setScalar(sc);
  const skin=M(o.skin||SKIN[0],{roughness:.7}),top=M(o.top||0xf4f0e0),bot=M(o.bottom||0x54616e),hair=M(o.hair||0x2b2118,{roughness:.6}),shoe=M(0x3a2e24);
  const hips=new T.Group();hips.position.y=.92;root.add(hips);const P_={parent:hips};
  add(capsule(.165,.3,20),top,0,.3,0,{parent:hips,s:[1.15,1,.8]});add(new T.SphereGeometry(.185,20,14),bot,0,.0,0,{parent:hips,s:[1.1,.85,.85]});
  add(new T.CylinderGeometry(.05,.06,.14,12),skin,0,.62,0,P_);
  const head=new T.Group();head.position.y=.78;hips.add(head);
  add(new T.SphereGeometry(.125,24,18),skin,0,0,0,{parent:head,s:[.95,1.1,1]});
  add(new T.SphereGeometry(.134,24,16,0,6.3,0,1.75),hair,0,.014,-.016,{parent:head,rx:-.3,s:[1,1.06,1.04]});
  [-1,1].forEach(e=>add(new T.SphereGeometry(.017,8,6),M(0x2a2018,{roughness:.3}),e*.045,.012,.112,{parent:head,cast:false}));
  if(o.bob)add(new T.SphereGeometry(.142,20,14,0,6.3,.5,1.7),hair,0,-.045,-.022,{parent:head,s:[1.02,1.12,1]});
  if(o.hat)add(new T.ConeGeometry(.36,.2,36),M(0xe6cf8a,{roughness:.9}),0,.19,0,{parent:head});
  if(o.cap)add(new T.CylinderGeometry(.13,.135,.08,20),M(o.cap),0,.115,0,{parent:head});
  const mk=(sx)=>{const sh=new T.Group();sh.position.set(sx*.225,.5,0);hips.add(sh);add(new T.SphereGeometry(.075,14,10),top,0,0,0,{parent:sh});add(capsule(.058,.2,12),top,0,-.14,0,{parent:sh});
    const el=new T.Group();el.position.y=-.28;sh.add(el);add(new T.SphereGeometry(.052,12,10),o.sleeve===false?skin:top,0,0,0,{parent:el});add(capsule(.046,.19,12),skin,0,-.12,0,{parent:el});add(new T.SphereGeometry(.052,12,10),skin,0,-.27,0,{parent:el});return{sh,el};};
  const aL=mk(1),aR=mk(-1);const legU=o.skirt?skin:bot,legL=(o.skirt||o.shorts)?skin:bot;
  const lg=(sx)=>{const hp=new T.Group();hp.position.set(sx*.095,-.02,0);hips.add(hp);add(capsule(.088,.28,14),legU,0,-.2,0,{parent:hp});
    const kn=new T.Group();kn.position.y=-.43;hp.add(kn);add(new T.SphereGeometry(.072,12,10),legL,0,0,0,{parent:kn});add(capsule(.064,.28,12),legL,0,-.2,0,{parent:kn});add(new T.SphereGeometry(.08,14,10),shoe,0,-.44,.05,{parent:kn,s:[.9,.6,1.65]});return{hp,kn};};
  const lL=lg(1),lR=lg(-1);
  if(o.skirt)add(new T.CylinderGeometry(.19,.33,.5,24,1,true),new T.MeshStandardMaterial({color:o.skirt,side:T.DoubleSide,roughness:.8}),0,-.2,0,P_);
  if(o.bag){add(new T.BoxGeometry(.1,.3,.34),M(o.bag,{roughness:.6}),-.26,-.02,.02,P_);add(new T.CylinderGeometry(.012,.012,.62,6),M(o.bag),-.1,.33,.02,{parent:hips,rz:.5});}
  if(o.pack)add(new T.BoxGeometry(.3,.38,.16),M(o.pack),0,.32,-.2,P_);
  scene.add(root);return{root,hips,head,aL,aR,lL,lR,sc};}
function poseWalk(p,ph,amt){const s=Math.sin(ph),c=Math.cos(ph);
  p.lL.hp.rotation.x=-s*.55*amt;p.lR.hp.rotation.x=s*.55*amt;p.lL.kn.rotation.x=(.12+.6*Math.max(0,-c))*amt;p.lR.kn.rotation.x=(.12+.6*Math.max(0,c))*amt;
  p.aL.sh.rotation.x=s*.42*amt;p.aR.sh.rotation.x=-s*.42*amt;p.aL.el.rotation.x=-.25-.2*Math.max(0,-s)*amt;p.aR.el.rotation.x=-.25-.2*Math.max(0,s)*amt;
  p.hips.position.y=.92+Math.abs(c)*.025*amt;p.hips.rotation.y=s*.06*amt;}
const walkers=[];
function walker(path,o){const pts=path.map(a=>new V3(a[0],a[1],a[2]));const segs=[];let total=0;for(let i=0;i<pts.length-1;i++){const l=pts[i].distanceTo(pts[i+1]);segs.push(l);total+=l;}
  const p=makePerson(o);walkers.push({p,pts,segs,total,d:(o.start||0)*total,dir:o.dir||1,speed:o.speed||1.15,ph:R0()*6,turn:0,yaw:0,pause:0});}
function stepWalker(w,dt){
  if(w.pause>0){w.pause-=dt;poseWalk(w.p,w.ph,Math.max(0,w.pause>.4?0:1-w.pause/.4));}
  else{w.d+=w.dir*w.speed*dt;w.ph+=w.speed*dt*4.3;if(w.d>=w.total){w.d=w.total;w.dir=-1;w.pause=1+R0()*3;}else if(w.d<=0){w.d=0;w.dir=1;w.pause=1+R0()*3;}poseWalk(w.p,w.ph,1);}
  let d=w.d,i=0;while(i<w.segs.length-1&&d>w.segs[i]){d-=w.segs[i];i++;}
  const a=w.pts[i],b=w.pts[i+1],t=Math.min(1,d/w.segs[i]);w.p.root.position.set(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.z+(b.z-a.z)*t);
  const yaw=Math.atan2((b.x-a.x)*w.dir,(b.z-a.z)*w.dir);let dy=yaw-w.yaw;while(dy>Math.PI)dy-=6.283;while(dy<-Math.PI)dy+=6.283;w.yaw+=dy*Math.min(1,dt*5);w.p.root.rotation.y=w.yaw;}
const Q=QUAY;
// left quay: the girl with the white bob and shoulder bag, plus passers-by
walker([[-20.6,Q,31],[-20.8,Q,22],[-21.2,Q,12.5],[-22.6,Q,7]],{skin:SKIN[2],hair:0xf1efe6,bob:true,top:0xf3e6d0,skirt:0xe9d9c4,bag:0xb8452f,start:.32,dir:-1,speed:1.0,scale:.96});
walker([[-22.4,Q,36],[-22.2,Q,24],[-23,Q,12],[-23.4,Q,4]],{top:0x6fa8c8,bottom:0x3f4a58,hair:0x3a2a1c,start:.8,speed:1.25});
// over the stairs and the footbridge to the walkway
const bridgePath=[[-19.6,Q,13.5],[-19.6,Q,9.4],[-19.6,DECK,1.3],[-19.4,DECK,.2],[-10,DECK,.3],[5,DECK,.2],[16.5,DECK,.3],[24,DECK,1.6],[35,DECK,1.8]];
walker(bridgePath,{top:0xe8734a,bottom:0x4a5a44,hair:0x1f1a16,cap:0xf1c53a,start:.45,speed:1.2});
walker(bridgePath.map(a=>[a[0],a[1],a[2]-.55]),{top:0xf6f1dc,skirt:0x3f8f7f,hair:0x5a3a22,skin:SKIN[1],start:.7,dir:-1,speed:1.05,scale:.95});
walker(bridgePath.map(a=>[a[0],a[1],a[2]+.45]),{top:0xf1c53a,bottom:0x6a5a48,hat:true,skin:SKIN[3],start:.12,speed:.95,pack:0x7a5a34});
// walkway terrace
walker([[18.5,DECK,-1.9],[28,DECK,-2.2],[37,DECK,-1.6]],{top:0x9ad05a,bottom:0x4f5560,hair:0x2b2118,start:.5,speed:1.1});
walker([[36.5,DECK,.4],[26,DECK,.2],[19,DECK,.6]],{top:0xd86a8f,skirt:0xf6efd2,hair:0x1f1a16,bob:true,start:.2,speed:1.0,scale:.94});
// right quay, market side
walker([[21.5,Q,8],[22,Q,14],[21.8,Q,22],[22.5,Q,30],[24,Q,40]],{top:0xf6efd2,bottom:0x8a6a4a,hat:true,skin:SKIN[1],start:.3,speed:1.0});
walker([[31,Q,7.5],[30.6,Q,16],[31,Q,26],[30,Q,36]],{top:0x3f6fb0,bottom:0x2f3640,hair:0x3a2a1c,start:.6,dir:-1,speed:1.3,bag:0x6a4a2c});
walker([[20.5,Q,-2.2],[13.5,Q,-6],[11.6,Q,-14],[11.2,Q,-24]],{top:0xe7a93a,skirt:0xc8452f,hair:0x1f1a16,skin:SKIN[2],start:.4,speed:1.05,scale:.95});
walker([[-11.6,Q,-26],[-10.2,Q,-12.5],[-13.4,Q,-3],[-16.6,Q,3.4]],{top:0xb9d7e8,bottom:0x4a4438,hair:0x2b2118,start:.6,speed:1.15});
walker([[26,Q,9],[27.2,Q,19.5],[26.4,Q,27]],{top:0xf4f0e0,shorts:true,bottom:0x3f8f7f,hair:0x6a4a2c,start:.1,speed:.85,scale:.8});

// 2 shopkeeper seated with her newspaper
const keeper=makePerson({skin:SKIN[0],hair:0x5a3a22,top:0x2f5f4a,bottom:0x3a3a40,shorts:true,cap:0x4a5a50,scale:1});
(function(){const k=keeper;k.root.position.set(-23.2,Q-.36,22.3);k.root.rotation.y=1.0;
  add(new T.BoxGeometry(.6,.5,.6),new T.MeshStandardMaterial({map:woodTex}),-23.2-.12,Q+.25,22.3-.08,{ry:1.0});
  k.lL.hp.rotation.x=-1.5;k.lL.kn.rotation.x=1.45;k.lR.hp.rotation.set(-1.62,0,.32);k.lR.kn.rotation.x=1.1;
  k.aL.sh.rotation.set(-.85,0,.35);k.aL.el.rotation.set(-1.25,0,-.3);k.aR.sh.rotation.set(-.85,0,-.35);k.aR.el.rotation.set(-1.25,0,.3);
  k.hips.rotation.x=.08;k.head.rotation.x=.3;
  const news=ctex(512,512,(g,w,h)=>{const r=rng(8);g.fillStyle='#f1ecd8';g.fillRect(0,0,w,h);g.fillStyle='#2a2a26';g.font=`700 56px ${JP}`;g.fillText('水上新聞',20,66);g.fillRect(20,82,w-40,4);
    g.fillStyle='#9aa39a';g.fillRect(28,104,200,130);g.fillStyle='#3a3a34';for(let c=0;c<4;c++)for(let y=0;y<46;y++){if(c<2&&y<17)continue;g.fillRect(28+c*118,104+y*8.4,60+r()*48,3);}});
  news.wrapS=T.RepeatWrapping;news.repeat.x=-1;news.offset.x=1;const pm=new T.MeshStandardMaterial({map:news,side:T.DoubleSide,roughness:.9});
  const paper=new T.Group();paper.position.set(0,.5,.47);paper.rotation.x=-.5;k.hips.add(paper);
  const pg=(sx)=>{const h=new T.Group();paper.add(h);const g=new T.PlaneGeometry(.3,.44,6,1);const pos=g.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i);pos.setZ(i,-Math.pow(Math.abs(x+.15)/.3,2)*.04);}g.translate(.15,0,0);g.computeVertexNormals();
    const m=new T.Mesh(g,pm);m.castShadow=true;h.add(m);h.rotation.y=sx>0?-.22:Math.PI+.22;return h;};
  k.paperL=pg(1);k.paperR=pg(-1);k.paper=paper;})();
// 12 people waiting at the water bus stop
const waiters=[];
[[14.3,15.5,-1.3,{top:0xf6efd2,bottom:0x8a6a4a,hat:true,skin:SKIN[1]}],[15.2,17.2,-1.6,{top:0xe7c23a,skirt:0xf1e2a2,hair:0x1f1a16,bob:true,scale:.95}],[14.1,19.4,-1.5,{top:0x6fa8c8,bottom:0x4a4438,hair:0x3a2a1c,pack:0xc8452f}],[15.5,21.3,-1.9,{top:0xf4f0e0,bottom:0x54616e,hat:true,scale:.78}],[16.3,14,-1.2,{top:0xd86a8f,bottom:0x3f4a58,hair:0x2b2118}]]
 .forEach((a,i)=>{const p=makePerson(a[3]);p.root.position.set(a[0],.62,a[1]);p.root.rotation.y=a[2];p.aL.el.rotation.x=-.3;p.aR.el.rotation.x=-.3;waiters.push({p,ph:i*1.9,ry:a[2]});});
