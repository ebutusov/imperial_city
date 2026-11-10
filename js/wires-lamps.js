// wires-lamps.js
// Overhead wires, hanging pendant lamps, tram route and trolley wire, bunting and hung signs.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const wireMat=new T.LineBasicMaterial({color:0x1d2a24});
function wire(a,b,sag,n){n=n||24;const pts=[];for(let i=0;i<=n;i++){const t=i/n;const p=a.clone().lerp(b,t);p.y-=Math.sin(t*Math.PI)*(sag||0);pts.push(p);}
  const l=new T.Line(new T.BufferGeometry().setFromPoints(pts),wireMat);scene.add(l);return pts;}
const swing=[];
function pendant(x,y,z,s,topY){const g=new T.Group();g.position.set(x,topY,z);scene.add(g);const len=topY-y;
  add(new T.CylinderGeometry(.02*s,.02*s,len,6),M(0x1d2a24),0,-len/2,0,{parent:g});
  const shade=new T.LatheGeometry([new T.Vector2(.12,.55),new T.Vector2(.3,.5),new T.Vector2(.45,.3),new T.Vector2(1,.08),new T.Vector2(1.05,0),new T.Vector2(.98,-.03)],40);
  const sm=new T.MeshStandardMaterial({color:0x1f3a30,roughness:.5,metalness:.4,side:T.DoubleSide});
  const sh=add(shade,sm,0,-len,0,{parent:g,s:[s,s,s]});
  add(new T.SphereGeometry(.3*s,20,14),new T.MeshStandardMaterial({color:0xfff6c8,emissive:0xffe08a,emissiveIntensity:1.4}),0,-len-.02*s,0,{parent:g,cast:false});
  for(let i=0;i<3;i++)add(new T.TorusGeometry((.95-i*.28)*s,.025*s,6,36),sm,0,-len-(.12+i*.2)*s,0,{rx:Math.PI/2,parent:g});
  for(let i=0;i<8;i++){const a=i/8*6.283;add(new T.CylinderGeometry(.018*s,.018*s,.62*s,5),sm,Math.cos(a)*.7*s,-len-.3*s,Math.sin(a)*.7*s,{parent:g,rx:Math.sin(a)*.75,rz:-Math.cos(a)*.75});}
  swing.push({g,ph:x+z,amp:.035/Math.sqrt(s)});}
wire(new V3(-11,QUAY+40,-14),new V3(18,QUAY+20.5,-9),2);wire(new V3(-22,QUAY+34,-13),new V3(36,QUAY+17,6),5);wire(new V3(-40,QUAY+24,8),new V3(33,QUAY+17,10),4);
pendant(-5.5,16.5,13,2.3,60);pendant(-11.5,10.6,7,1.25,34);pendant(-19.5,8.3,3.5,.85,20);pendant(9,13.5,-12,1.1,30);
// trolley wire and span poles
const routeP=[P(335,560),P(333,470),P(331,380),P(338,250),P(336,150),P(335,70),P(335,-20),P(335,-130),P(335,-260)].map(p=>new V3(p[0],0,p[1]));
const route=new T.CatmullRomCurve3(routeP);
const WIRE_Y=5.55;
(function(){const pts=route.getPoints(100).map(p=>new V3(p.x,WIRE_Y,p.z));scene.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),wireMat));
  [[-24,-15.2,16.4],[-12,-16.6,12.6],[14,-19.6,17.4],[26,-20.2,18.6]].forEach(a=>{const z=a[0];
    [a[1],a[2]].forEach((x,i)=>{cyl(x,z,.09,.13,QUAY,7,dgreen,10);add(new T.TorusGeometry(.35,.03,6,16,Math.PI),dgreen,x+(i?-.35:.35),QUAY+6.7,z);});
    wire(new V3(a[1],QUAY+6.6,z),new V3(a[2],QUAY+6.6,z),.5);cyl(-.7,z,.012,.012,WIRE_Y,QUAY+6.1-WIRE_Y,M(0x1d2a24),4);});})();
// bunting
const flags=[];
(function(){const cols=[0x2f9c8a,0xf1c53a,0xe8734a,0xf6f1dc,0x3f6fb0,0x7fc45a];
  function string(a,b,sag,n){const pts=wire(a,b,sag,n);for(let i=1;i<n;i++){const p=pts[i];const dir=Math.atan2(b.z-a.z,b.x-a.x);
    const sh=new T.Shape();sh.moveTo(-.38,0);sh.lineTo(.38,0);sh.lineTo(0,-.8);sh.lineTo(-.38,0);
    const m=new T.Mesh(new T.ShapeGeometry(sh),new T.MeshStandardMaterial({color:cols[i%cols.length],side:T.DoubleSide,roughness:.7}));m.position.copy(p);m.rotation.y=-dir;m.castShadow=true;scene.add(m);flags.push(m);}}
  const top=new V3(24.7,QUAY+31.6,-18.2);
  string(top.clone().add(new V3(-8.8,0,2)),new V3(8,QUAY+13,-3),2.5,14);string(top.clone().add(new V3(-3,0,8.6)),new V3(17.2,QUAY+9,3),3,15);
  string(top.clone().add(new V3(6,0,6.5)),new V3(37,QUAY+16,6),2,13);string(new V3(-10.4,QUAY+26,-13),new V3(6.8,DECK+6.6,0),3,16);
  string(new V3(-24.6,QUAY+8.3,11),new V3(-18.5,QUAY+7,0),1,9);})();
// arrow board and round signs hung over the right bank
sign('→ 野菜市場前',5.6,2.3,13.5,QUAY+12,6,-.35,{w:512,h:210,bg:'#f8f5e4',border:'#3a4a3c',fg:'#2b3a30',lw:10}).rotation.z=.08;
wire(new V3(13.5,QUAY+13.1,6),new V3(6.8,DECK+6.6,0),.3);wire(new V3(13.5,QUAY+13.1,6),new V3(31,DECK+5,4.6),1);
sign('市',3.6,3.6,10,QUAY+15.5,-9.6,0,{round:true,bg:'#fbf8e6',border:'#e7862e',fg:'#e7862e'});cyl(10,-9.7,.1,.1,QUAY,14,dgreen,8);
sign('大',2.6,2.6,15,QUAY+16.5,-9.4,0,{round:true,bg:'#fbf8e6',border:'#c8452f',fg:'#c8452f'});
