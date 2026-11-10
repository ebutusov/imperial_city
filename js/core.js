// core.js
// Renderer, scene, fog and camera setup.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
const msg=document.getElementById('msg');
if(!window.THREE){msg.textContent='The 3D library could not load. Check that vendor/three.min.js is present.';throw new Error('three.js missing');}
const T=THREE,V3=T.Vector3;
const canvas=document.getElementById('c');
let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}
catch(e){msg.textContent='This browser could not start WebGL, so the scene cannot be shown.';throw e;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
renderer.outputEncoding=T.sRGBEncoding;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;

const scene=new T.Scene();
const HAZE=new T.Color(0xd9eab6);
scene.fog=new T.FogExp2(HAZE.getHex(),0.0048);
const camera=new T.PerspectiveCamera(62,1,0.1,1600);
