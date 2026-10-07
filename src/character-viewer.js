import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCharacter, getCharacterInfo } from './characters.js';

const portraitCache = new Map();
let portraitRenderer;
function renderer(options = {}) {
  const r = new THREE.WebGLRenderer({ alpha:true, antialias:true, ...options });
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.13;
  r.setClearColor(0x000000,0);
  return r;
}
function lightScene() {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xecf3ff,0x66719a,2.4));
  const key = new THREE.DirectionalLight(0xffefda,3.2);key.position.set(-3,6,7);scene.add(key);
  const fill = new THREE.DirectionalLight(0xccdfff,1.3);fill.position.set(5,3,4);scene.add(fill);
  const rim = new THREE.DirectionalLight(0xc7b8ff,2.4);rim.position.set(1,5,-5);scene.add(rim);
  return scene;
}
function frameModel(camera, root, aspect) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const halfHeight = Math.max(size.y*.59,Math.max(size.x,size.z)*.7/Math.max(.25,aspect));
  camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;
  camera.position.set(center.x+1.5,center.y+.65,center.z+10);camera.lookAt(center);camera.updateProjectionMatrix();
  return center;
}
// Every atlas card is a render of the real model. One reusable offscreen renderer,
// rather than sixteen WebGL contexts, keeps the gallery suitable for mobile.
export function getCharacterPortrait(type, width = 360) {
  const key = `${type}:${width}`;
  if(portraitCache.has(key))return portraitCache.get(key);
  portraitRenderer ||= renderer({preserveDrawingBuffer:true});
  portraitRenderer.setPixelRatio(1);portraitRenderer.setSize(width,Math.round(width / .9),false);
  const scene=lightScene(), camera=new THREE.OrthographicCamera(-2,2,2,-2,.1,50), model=createCharacter(type);
  scene.add(model.root);model.update(0,{reducedMotion:true});frameModel(camera,model.root,.9);
  portraitRenderer.render(scene,camera);
  const image=portraitRenderer.domElement.toDataURL('image/png');
  model.dispose();scene.clear();portraitRenderer.renderLists.dispose();
  portraitCache.set(key,image);return image;
}
export function populatePortraits(container) {
  const images=[...container.querySelectorAll('img[data-portrait]')];
  let i=0;
  function next(){
    if(i>=images.length)return;
    const img=images[i++];
    if(img.isConnected){try{img.src=getCharacterPortrait(img.dataset.portrait);img.classList.add('ready');}catch{img.alt=`${img.dataset.portrait} · 3D 预览暂不可用`;img.classList.add('portrait-unavailable');}}
    if(i<images.length)requestAnimationFrame(next);
  }
  requestAnimationFrame(next);
}
export function mountCharacterViewer(container,type,{reducedMotion=false}={}) {
  const info=getCharacterInfo(type), model=createCharacter(type), scene=lightScene();scene.add(model.root);
  const r=renderer();r.setPixelRatio(Math.min(devicePixelRatio||1,1.5));r.domElement.setAttribute('aria-label',`${type} ${info.role} 3D 卡通角色，拖动旋转`);container.appendChild(r.domElement);
  const camera=new THREE.OrthographicCamera(-2,2,2,-2,.1,50),controls=new OrbitControls(camera,r.domElement);
  controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=!reducedMotion;controls.dampingFactor=.08;controls.minPolarAngle=.8;controls.maxPolarAngle=1.8;
  let reduced=reducedMotion,frame,disposed=false,visible=true,time=0,last=performance.now(),celebrationUntil=0;
  function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;r.setSize(w,h);controls.target.copy(frameModel(camera,model.root,w/h));controls.update();}
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  const visibility=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;});visibility.observe(container);
  function tick(now){if(disposed)return;const delta=Math.min(.04,(now-last)/1000);last=now;
    if(visible&&container.isConnected&&document.visibilityState!=='hidden'){
      if(!reduced)time+=delta;
      model.update(time,{reducedMotion:reduced,celebrating:!reduced&&now<celebrationUntil});
      controls.update();r.render(scene,camera);
    }
    frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
  return {
    type,
    celebrate(){celebrationUntil=performance.now()+1600;},
    reset(){resize();},
    setReducedMotion(value){reduced=Boolean(value);controls.enableDamping=!reduced;},
    getDiagnostics(){return {type,drawCalls:r.info.render.calls,triangles:r.info.render.triangles,geometries:r.info.memory.geometries,dpr:r.getPixelRatio()};},
    dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();controls.dispose();model.dispose();scene.clear();r.dispose();r.forceContextLoss();r.domElement.remove();},
  };
}
export async function loadPortraitImage(type) {
  const image=new Image();image.src=getCharacterPortrait(type,720);await image.decode();return image;
}
