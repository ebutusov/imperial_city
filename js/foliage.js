// foliage.js
// Instanced leaf sprigs with the wind-sway shader, plus the limb() and tree() builders.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const leafTex=ctex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);const r=rng(4);
  for(let i=0;i<9;i++){const a=r()*6.28,d=10+r()*30,x=w/2+Math.cos(a)*d,y=h/2+Math.sin(a)*d;g.save();g.translate(x,y);g.rotate(a+r()-.5);const v=205+r()*50|0;
    g.fillStyle=`rgb(${v},${v},${v})`;g.beginPath();g.moveTo(-22,0);g.quadraticCurveTo(0,-14,22,0);g.quadraticCurveTo(0,14,-22,0);g.fill();
    g.strokeStyle='rgba(120,120,120,.6)';g.lineWidth=1.2;g.beginPath();g.moveTo(-20,0);g.lineTo(20,0);g.stroke();g.restore();}
});
const LEAF=[];
const PAL={deep:[[0.10,0.30,0.10],[0.42,0.72,0.20]],mid:[[0.20,0.46,0.12],[0.66,0.86,0.28]],bright:[[0.36,0.60,0.12],[0.90,0.95,0.40]]};
function blob(cx,cy,cz,rx,ry,rz,n,pal,rand,size){const p=PAL[pal]||PAL.mid;size=size||1;
  for(let i=0;i<n;i++){const u=rand()*2-1,a=rand()*6.283,q=Math.sqrt(1-u*u);const dx=q*Math.cos(a),dy=u,dz=q*Math.sin(a);
    const rad=.5+.5*Math.sqrt(rand());const sh=Math.min(1,Math.max(0,(dy*.5+.5)*.75+rad*.25-.12+(rand()-.5)*.35));
    LEAF.push(cx+dx*rad*rx,cy+dy*rad*ry,cz+dz*rad*rz,size*(.7+rand()*.7),dx,dy*.8+.45,dz,
      p[0][0]+(p[1][0]-p[0][0])*sh,p[0][1]+(p[1][1]-p[0][1])*sh,p[0][2]+(p[1][2]-p[0][2])*sh);}}
const windU={value:0};
function windPatch(sh){sh.uniforms.uTime=windU;
  sh.vertexShader='uniform float uTime;\nattribute vec3 aN;\n'+sh.vertexShader
   .replace('#include <begin_vertex>','vec3 transformed=vec3(position);\nfloat lph=dot(instanceMatrix[3].xyz,vec3(1.37,2.11,1.79));\ntransformed.z+=sin(uTime*2.3+lph+position.x*3.0)*0.09;\ntransformed.y+=sin(uTime*1.7+lph*1.3)*0.04;')
   .replace('#include <project_vertex>','vec4 mvPosition=vec4(transformed,1.0);\nmvPosition=instanceMatrix*mvPosition;\nmvPosition.x+=sin(uTime*0.9+mvPosition.z*0.21+mvPosition.y*0.13)*0.07;\nmvPosition.z+=cos(uTime*0.7+mvPosition.x*0.17)*0.05;\nmvPosition=modelViewMatrix*mvPosition;\ngl_Position=projectionMatrix*mvPosition;');}
function buildLeaves(){const n=LEAF.length/10;const geo=new T.PlaneGeometry(1,1);const aN=new Float32Array(n*3);
  const mat=new T.MeshStandardMaterial({map:leafTex,alphaTest:.42,side:T.DoubleSide,roughness:.75});
  mat.onBeforeCompile=sh=>{windPatch(sh);
    sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>','vec3 transformedNormal=normalize(mat3(viewMatrix)*aN);');
    sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0;\nvec3 normal=normalize(vNormal);\nvec3 geometryNormal=normal;');};
  const mesh=new T.InstancedMesh(geo,mat,n);const d=new T.Object3D(),c=new T.Color(),r=rng(99);
  for(let i=0;i<n;i++){const k=i*10;d.position.set(LEAF[k],LEAF[k+1],LEAF[k+2]);d.rotation.set(r()*6.28,r()*6.28,r()*6.28);d.scale.setScalar(LEAF[k+3]);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);
    const l=Math.hypot(LEAF[k+4],LEAF[k+5],LEAF[k+6])||1;aN[i*3]=LEAF[k+4]/l;aN[i*3+1]=LEAF[k+5]/l;aN[i*3+2]=LEAF[k+6]/l;
    c.setRGB(LEAF[k+7],LEAF[k+8],LEAF[k+9]).convertSRGBToLinear();mesh.setColorAt(i,c);}
  geo.setAttribute('aN',new T.InstancedBufferAttribute(aN,3));
  const dm=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:leafTex,alphaTest:.42});dm.onBeforeCompile=windPatch;
  mesh.customDepthMaterial=dm;mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;scene.add(mesh);}
const barkMat=new T.MeshStandardMaterial({map:barkTex,roughness:.95});
function limb(pts,r0,r1,mat){const curve=new T.CatmullRomCurve3(pts);const seg=20,rad=10;const g=new T.TubeGeometry(curve,seg,1,rad,false);const pos=g.attributes.position;const v=new V3();
  for(let i=0;i<=seg;i++){const c=curve.getPointAt(i/seg);const rr=r0+(r1-r0)*(i/seg);for(let j=0;j<=rad;j++){const k=i*(rad+1)+j;v.fromBufferAttribute(pos,k).sub(c).multiplyScalar(rr).add(c);pos.setXYZ(k,v.x,v.y,v.z);}}
  return add(g,mat||barkMat,0,0,0);}
function tree(x,z,H,R,pal,seed,y0,dens){const r=rng(seed);y0=y0===undefined?QUAY:y0;dens=dens||1;
  const top=new V3(x+(r()-.5)*H*.18,y0+H,z+(r()-.5)*H*.18);const mid=new V3(x+(r()-.5)*H*.12,y0+H*.5,z+(r()-.5)*H*.12);
  const pts=[new V3(x,y0-.3,z),new V3(x+(r()-.5)*.3,y0+H*.2,z+(r()-.5)*.3),mid,top];const tr=.14+H*.022;
  limb(pts,tr*1.5,tr*.45);add(new T.CylinderGeometry(tr*1.5,tr*2.3,.7,14),barkMat,x,y0+.2,z);
  const curve=new T.CatmullRomCurve3(pts);const nb=6+(R>5?3:0);
  for(let i=0;i<nb;i++){const t=.55+r()*.42;const s=curve.getPointAt(t);const a=i/nb*6.283+r()*.6;const len=R*(.55+r()*.5);
    const e=new V3(s.x+Math.cos(a)*len,s.y+R*(.1+r()*.45),s.z+Math.sin(a)*len);const m=s.clone().lerp(e,.5);m.y+=R*.12;
    limb([s,m,e],tr*.5,.05);
    blob(e.x,e.y+R*.1,e.z,R*.52,R*.36,R*.52,Math.round(440*dens*R/4),pal,r,.68+R*.035);}
  blob(top.x,top.y+R*.15,top.z,R*.75,R*.5,R*.75,Math.round(760*dens*R/4),pal,r,.7+R*.035);}
