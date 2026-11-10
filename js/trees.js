// trees.js
// Tree planting, leaf mesh build and the sRGB-to-linear colour pass. Must run after everything that adds leaves or materials.
// Classic script: shares top-level names with the other files, so load order matters (see index.html).
'use strict';
tree(-31.9,5.2,17,9,'deep',1,QUAY,1.25);       // 4 big foreground tree
tree(-22.6,13.4,11,4.2,'deep',2);
tree(-36,30,13,6,'deep',3);
tree(-27.5,36,10,5,'mid',12);
tree(22.5,-5.5,12,6.2,'bright',4);
tree(28.3,6.5,10.5,5.6,'bright',5);
tree(23,31,9,4.5,'mid',6);
tree(33.5,-17,11,7.5,'bright',7,QUAY+20);
tree(41,-8,12,6.5,'mid',8);
tree(12,-12.5,9,4.6,'bright',9);
tree(-25.5,-2,6,3.4,'bright',10,QUAY+13);
tree(-15,-24,9,5.5,'bright',11,QUAY+40);
tree(13.2,24,6.5,3.2,'bright',13);
blob(10,DECK-3.2,-5,5,2.6,3.5,420,'bright',R0,.9);blob(21,Q+7.5,-3.2,5,1.4,1.2,260,'bright',R0,.7);
tree(-23.8,29.5,15,8.5,'deep',14,QUAY,1.2);
blob(37.5,Q+18.2,17,4,1.3,10,420,'bright',R0,.9);
buildLeaves();
(function(){const seen=new Set();scene.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>{if(seen.has(m))return;seen.add(m);if(m.isShaderMaterial||m.isSpriteMaterial)return;if(m.color)m.color.convertSRGBToLinear();if(m.emissive)m.emissive.convertSRGBToLinear();});});scene.fog.color.convertSRGBToLinear();})();
