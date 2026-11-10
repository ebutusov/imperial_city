// controls.js
// Fly camera: mouse drag / pointer lock, WASD, touch, reset button, resize.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const HOME={pos:new V3(-10.5,2.6,42.5),yaw:.07,pitch:.22};
let yaw=HOME.yaw,pitch=HOME.pitch;const keys={};let locked=false,drag=false,moved=0,lx=0,ly=0;
camera.rotation.order='YXZ';
function home(){camera.position.copy(HOME.pos);yaw=HOME.yaw;pitch=HOME.pitch;}
home();
function look(dx,dy,k){yaw-=dx*k;pitch-=dy*k;pitch=Math.max(-1.5,Math.min(1.5,pitch));}
canvas.addEventListener('mousedown',e=>{drag=true;moved=0;lx=e.clientX;ly=e.clientY;canvas.focus();});
window.addEventListener('mouseup',()=>{if(drag&&moved<4&&!locked&&canvas.requestPointerLock){try{const p=canvas.requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(e){}}drag=false;});
window.addEventListener('mousemove',e=>{if(locked){look(e.movementX||0,e.movementY||0,.0022);}else if(drag){const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);look(-dx,-dy,.004);}});
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;});
window.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&document.activeElement!==document.getElementById('reset')&&document.activeElement!==document.getElementById('hide'))e.preventDefault();});
window.addEventListener('keyup',e=>{keys[e.code]=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
const touch={};let tMove={x:0,y:0};
canvas.addEventListener('touchstart',e=>{for(const t of e.changedTouches)touch[t.identifier]={x:t.clientX,y:t.clientY,sx:t.clientX,sy:t.clientY,left:t.clientX<canvas.clientWidth*.4};e.preventDefault();},{passive:false});
canvas.addEventListener('touchmove',e=>{for(const t of e.changedTouches){const s=touch[t.identifier];if(!s)continue;if(s.left){tMove.x=Math.max(-1,Math.min(1,(t.clientX-s.sx)/60));tMove.y=Math.max(-1,Math.min(1,(t.clientY-s.sy)/60));}else look(-(t.clientX-s.x),-(t.clientY-s.y),.005);s.x=t.clientX;s.y=t.clientY;}e.preventDefault();},{passive:false});
const tEnd=e=>{for(const t of e.changedTouches){if(touch[t.identifier]&&touch[t.identifier].left)tMove={x:0,y:0};delete touch[t.identifier];}};
canvas.addEventListener('touchend',tEnd);canvas.addEventListener('touchcancel',tEnd);
document.getElementById('reset').addEventListener('click',()=>{home();canvas.focus();});
document.getElementById('hide').addEventListener('click',e=>{const k=document.getElementById('keys');k.hidden=!k.hidden;e.currentTarget.textContent=k.hidden?'Show help':'Hide help';});
const fwd=new V3(),right=new V3(),vel=new V3();
function fly(dt){camera.rotation.set(pitch,yaw,0);
  const f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-tMove.y,s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+tMove.x,u=(keys.Space||keys.KeyE?1:0)-(keys.KeyQ||keys.KeyC?1:0);
  camera.getWorldDirection(fwd);right.crossVectors(fwd,camera.up).normalize();
  const sp=(keys.ShiftLeft||keys.ShiftRight?26:9);const tv=new V3().addScaledVector(fwd,f).addScaledVector(right,s);tv.y+=u;if(tv.lengthSq()>1)tv.normalize();tv.multiplyScalar(sp);
  vel.lerp(tv,Math.min(1,dt*7));camera.position.addScaledVector(vel,dt);
  camera.position.y=Math.max(.45,Math.min(140,camera.position.y));camera.position.x=Math.max(-150,Math.min(150,camera.position.x));camera.position.z=Math.max(-150,Math.min(150,camera.position.z));}

function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<1?74:62;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);resize();
