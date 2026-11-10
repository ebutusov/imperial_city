// main.js
// Animation loop: wind, water, tram, bobbing, walkers, shopkeeper.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock=new T.Clock();let t=0,tramU=.3,tramDir=1,tramWait=0;
function tick(){requestAnimationFrame(tick);const dt=Math.min(.05,clock.getDelta());const mt=reduce?dt*.35:dt;t+=mt;
  fly(dt);windU.value=t;
  if(water.material.uniforms&&water.material.uniforms.time)water.material.uniforms.time.value=t*.55;else if(wnTex.offset)wnTex.offset.set(t*.01,t*.014);
  
  // tram: glide along the route, pause at each end
  if(tramWait>0)tramWait-=mt;else{const edge=Math.min(tramU-.06,.94-tramU);const sp=.008+.02*Math.min(1,Math.max(0,edge)*9);tramU+=tramDir*sp*mt;if(tramU>=.94||tramU<=.06){tramU=Math.max(.06,Math.min(.94,tramU));tramDir*=-1;tramWait=4;}}
  const tp=route.getPointAt(tramU),tg=route.getTangentAt(tramU);
  tram.position.set(tp.x,.12+Math.sin(t*1.3)*.06,tp.z);tram.rotation.set(Math.sin(t*1.05+1)*.018,Math.atan2(tg.x,tg.z),Math.sin(t*.85)*.03,'YXZ');
  wake.position.set(tp.x,.05,tp.z);wake.rotation.z=-tram.rotation.y;wake.material.opacity=.28+.2*Math.sin(t*2);
  dock.position.y=Math.sin(t*.9+2)*.035;dock.rotation.z=Math.sin(t*.7)*.004;
  for(const b of bobbers){b.m.position.y=b.base+Math.sin(t*1.5+b.ph)*b.amp;b.m.position.x=b.x+Math.sin(t*.4+b.ph)*.12;b.m.position.z=b.z+Math.cos(t*.33+b.ph*1.3)*.1;b.m.rotation.y+=mt*.12*Math.sin(b.ph);b.m.rotation.z=Math.sin(t*.9+b.ph)*.1;}
  for(const s of swing){s.g.rotation.z=Math.sin(t*.9+s.ph)*s.amp;s.g.rotation.x=Math.cos(t*.7+s.ph)*s.amp*.7;}
  for(let i=0;i<flags.length;i++){flags[i].rotation.x=Math.sin(t*3+i*.9)*.35;}
  for(const w of walkers)stepWalker(w,mt);
  for(const w of waiters){w.p.root.position.y=(w.y!==undefined?w.y:.62+dock.position.y);w.p.hips.rotation.z=Math.sin(t*.6+w.ph)*.03;w.p.head.rotation.y=Math.sin(t*.35+w.ph)*.5;w.p.root.rotation.y=w.ry+Math.sin(t*.2+w.ph)*.15;}
  // shopkeeper: reads, nods, turns a page now and then
  const k=keeper;k.head.rotation.x=.3+Math.sin(t*.5)*.05;k.head.rotation.y=Math.sin(t*.37)*.22;k.paper.rotation.x=-.5+Math.sin(t*1.1)*.02;
  const cyc=t%11;const turn=cyc<1.2?Math.sin(cyc/1.2*Math.PI):0;k.paperL.rotation.y=-.22-turn*1.9;k.aL.sh.rotation.z=.35-turn*.25;k.paperR.rotation.y=Math.PI+.22+Math.sin(t*1.3)*.03;
  k.lR.kn.rotation.x=1.1+Math.sin(t*1.8)*.08;
  sky.position.copy(camera.position);
  renderer.render(scene,camera);}
msg.classList.add('done');
window.__ready=true;
tick();
