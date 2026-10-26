import React, {useEffect,useRef,useState} from 'react';
import ExperienceControls,{initialExperience} from './ExperienceControls.jsx';
import {createExperience} from './vehicleExperience.js';
import {calibrateCybertruck} from './vehicleCalibration.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {HorizontalBlurShader} from 'three/addons/shaders/HorizontalBlurShader.js';
import {VerticalBlurShader} from 'three/addons/shaders/VerticalBlurShader.js';
import {toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {FullScreenQuad} from 'three/addons/postprocessing/Pass.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const chapters=[
 {name:'降临',en:'BEYOND CONVENTION',title:'CYBERTRUCK',sub:'打破常规。驶向未来。',detail:'TESLA / CYBERTRUCK / STAINLESS STEEL'},
 {name:'棱面',en:'FORM WITHOUT COMPROMISE',title:'NO SOFT EDGES.',sub:'让每一道棱线，成为态度。',detail:'ULTRA-HARD STAINLESS STEEL / EXOSKELETON'},
 {name:'光刃',en:'A SIGNATURE OF TOMORROW',title:'LIGHT THE UNKNOWN.',sub:'一道光，划开未知。',detail:'CONTINUOUS LIGHT SIGNATURE'},
 {name:'征服',en:'BUILT FOR EVERY FRONTIER',title:'BEYOND THE ROAD.',sub:'道路的尽头，才是开始。',detail:'ALL-TERRAIN / ELECTRIC PLATFORM'},
 {name:'骨骼',en:'BENEATH THE ARMOR',title:'STRENGTH. REVEALED.',sub:'穿透钢铁，看见电动内核。',detail:'EXOSKELETON / STRUCTURE VISUALISATION'},
 {name:'电能',en:'PURE ELECTRIC FORCE',title:'SILENT. SAVAGE.',sub:'无声之间，释放野性。',detail:'ELECTRIC / INSTANT TORQUE / ALL-WHEEL DRIVE'},
 {name:'未来',en:'THE FUTURE IS UNFORGED',title:'MAKE YOUR OWN PATH.',sub:'未来，没有既定路线。',detail:'CYBERTRUCK / AN INDEPENDENT DIGITAL STUDY'}
];
const shots=[
 {p:[5.75,1.85,8.7],t:[0,.88,0]},
 {p:[8.25,2.05,-4.7],t:[0,.8,0]},
 {p:[3.6,1.45,5.65],t:[.15,1.02,1.6]},
 {p:[3.2,1.12,4.55],t:[.92,.54,1.72]},
 {p:[8.8,2.5,0],t:[0,.82,0]},
 {p:[-6.6,2.35,-7.4],t:[0,.9,0]},
 {p:[-6.25,1.9,8.6],t:[0,.85,0]}
];
const smooth=x=>x*x*(3-2*x);
function Stage({progress,free,xray,experience,onTelemetry,onLoad,onError}) {
 const host=useRef(),api=useRef();
 useEffect(()=>{
  const el=host.current; let dead=false,frame;
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#101314'); scene.fog=new THREE.FogExp2('#101314',.028);
  const testCanvas=document.createElement('canvas');if(!testCanvas.getContext('webgl2')){onError('当前浏览器无法启用三维加速，请使用支持 WebGL 的浏览器。');return;}
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=1.08;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;el.appendChild(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(29.2,innerWidth/innerHeight,.05,100);camera.position.set(...shots[0].p);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const studio=new THREE.Scene();studio.background=new THREE.Color(.055,.061,.066);
  function softbox(position,width,height,strength){const panel=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({color:new THREE.Color(strength,strength,strength),side:THREE.DoubleSide}));panel.position.set(...position);panel.lookAt(0,.7,0);studio.add(panel)}
  softbox([0,6,1],9,2.8,5);softbox([-4,3.5,6],6,2,4.5);softbox([5,3,-5],7,1.6,4);softbox([-6,2,-2],1.5,4.5,3);softbox([6,2.4,0],5,3.5,1.8);softbox([-5,1.5,8],5,2.2,3);
  const env=pmrem.fromScene(studio,.035);scene.environment=env.texture;
  scene.add(new THREE.HemisphereLight(0xd5e2ec,0x090b0d,.35));
  const key=new THREE.DirectionalLight(0xffffff,1.15);key.position.set(1,7,3);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.radius=4;key.shadow.blurSamples=12;Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6});key.shadow.bias=-.0001;key.shadow.normalBias=.025;scene.add(key);
  const rim=new THREE.DirectionalLight(0xc2d8e8,1.3);rim.position.set(-5,3,-4);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xc4d5df,.45);fill.position.set(4,2,-3);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0x171b1d,roughness:.72,metalness:.08,envMapIntensity:.035}));floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.receiveShadow=true;scene.add(floor);
  RectAreaLightUniformsLib.init();const backdropLight=new THREE.RectAreaLight(0xd3dfdf,5,10,5);backdropLight.position.set(0,4,-5);backdropLight.lookAt(0,0,0);scene.add(backdropLight);
  // Correlated microgrooves affect only normal/roughness response, never the vehicle silhouette.
  const textureSize=512,roughPixels=new Uint8Array(textureSize*textureSize*4);let seed=2039;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  for(let y=0;y<textureSize;y++){const groove=(random()-.5)*18;for(let x=0;x<textureSize;x++){const i=(y*textureSize+x)*4;const grain=(random()-.5)*3;const r=218+groove*.6+grain*2;roughPixels.set([r,r,r,255],i);}}
  const steelRoughness=new THREE.DataTexture(roughPixels,textureSize,textureSize);
  [steelRoughness].forEach(texture=>{texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(5,5);texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();texture.needsUpdate=true;});
  const contactRT=new THREE.WebGLRenderTarget(1024,1024),blurRT=new THREE.WebGLRenderTarget(1024,1024);
  const contactMat=new THREE.MeshBasicMaterial({map:contactRT.texture,transparent:true,depthWrite:false,side:THREE.DoubleSide,opacity:.9});
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(8,8),contactMat);contact.rotation.x=Math.PI/2;contact.position.y=.002;scene.add(contact);
  const contactCamera=new THREE.OrthographicCamera(-4,4,4,-4,0,2.5);contactCamera.position.set(0,.001,0);contactCamera.up.set(0,0,1);contactCamera.lookAt(0,1,0);
  const depthMat=new THREE.MeshDepthMaterial({depthTest:true,depthWrite:true,side:THREE.DoubleSide});depthMat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );','gl_FragColor = vec4(0.0,0.0,0.0,pow(1.0-fragCoordZ,3.0)*.85);');};
  const hblur=new THREE.ShaderMaterial(HorizontalBlurShader),vblur=new THREE.ShaderMaterial(VerticalBlurShader);const blurQuad=new FullScreenQuad(hblur);
  function bakeContact(){
   const background=scene.background;scene.background=null;floor.visible=false;contact.visible=false;scene.overrideMaterial=depthMat;renderer.shadowMap.enabled=false;renderer.setClearColor(0x000000,0);renderer.setRenderTarget(contactRT);renderer.clear();renderer.render(scene,contactCamera);scene.overrideMaterial=null;
   for(let i=0;i<3;i++){blurQuad.material=hblur;hblur.uniforms.tDiffuse.value=contactRT.texture;hblur.uniforms.h.value=3/1024;renderer.setRenderTarget(blurRT);renderer.clear();blurQuad.render(renderer);blurQuad.material=vblur;vblur.uniforms.tDiffuse.value=blurRT.texture;vblur.uniforms.v.value=3/1024;renderer.setRenderTarget(contactRT);renderer.clear();blurQuad.render(renderer);}
   renderer.setRenderTarget(null);renderer.setClearColor(0x101314,1);renderer.shadowMap.enabled=true;scene.background=background;floor.visible=true;contact.visible=true;
  }
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.enabled=false;controls.minDistance=3.5;controls.maxDistance=12;controls.maxPolarAngle=Math.PI/2-.025;controls.target.set(0,.65,0);
  const data={progress:0,free:false,xray:false,loaded:false};api.current=data;
  let car,interaction;const meshes=[],wireMaterials=[]; const mats=new Set();
  const draco=new DRACOLoader();draco.setDecoderPath('/assets/draco/');
  const loader=new GLTFLoader().setDRACOLoader(draco);
  Promise.all([loader.loadAsync('/assets/cybertruck-hd/body.glb'),loader.loadAsync('/assets/cybertruck-hd/wheels.glb')]).then(([body,wheels])=>{
   if(dead)return;
   car=body.scene;car.rotation.y=Math.PI;
   const anchors=[];car.traverse(o=>{if(/^Wheel_[LR][FRL]_Spatial$/.test(o.name))anchors.push(o)});
   const wheelAssemblies=anchors.map(anchor=>{const wheel=wheels.scene.clone(true);anchor.add(wheel);return {anchor,wheel};});
   car.updateMatrixWorld(true);
   // This asset includes non-rendered collision helpers; keep them out of bounds and the beauty pass.
   const helpers=[];car.traverse(o=>{if(o.isMesh&&/collision|ground|shadow/i.test(o.name))helpers.push(o)});helpers.forEach(o=>o.removeFromParent());
   const calibration=calibrateCybertruck(car,wheelAssemblies);for(const [name,value] of Object.entries(calibration))el.dataset[name]=value.toFixed(4);
   const b=new THREE.Box3().setFromObject(car),center=b.getCenter(new THREE.Vector3());car.position.sub(center);car.position.y-=b.min.y-center.y;
   const pivot=new THREE.Group();pivot.add(car);scene.add(pivot);
   const materialCache=new Map();
   car.traverse(o=>{if(!o.isMesh)return;if(o.material?.name==='Paint_Rough'||/^Glass.*Rough/.test(o.material?.name)||/^Glass_Interior(?:_Fade)?$/.test(o.material?.name)){o.visible=false;return;}if(/^Glass_Interior_Tinted/.test(o.material?.name)&&!/^Window_[LR]R2$/.test(o.parent?.name)){o.visible=false;return;}o.castShadow=true;o.receiveShadow=true;
    const adapt=original=>{
     const sideWindow=/^Window_[LR][FR]2$/.test(o.parent?.name);const materialKey=original.uuid+(sideWindow?'-side':'');if(materialCache.has(materialKey))return materialCache.get(materialKey);
     let m=original.clone();const name=m.name;
     if(/^(Paint\.001|Paint)$|Stainless_Steel_Exterior/.test(name)){
      m=new THREE.MeshPhysicalMaterial({name,color:'#aab2b4',metalness:1,roughness:.26,clearcoat:0,envMapIntensity:1.2,roughnessMap:steelRoughness});
     }else if(/^Glass(?:_Tinted)?(?:_Fade)?$|^Glass_Interior_Tinted/.test(name)){
      const tinted=/Tinted/.test(name)||sideWindow;
      m=new THREE.MeshPhysicalMaterial({name,color:tinted?'#365355':'#a4b6b6',metalness:0,roughness:.025,transmission:1,thickness:tinted?.016:.008,ior:1.52,attenuationColor:tinted?'#193035':'#486464',attenuationDistance:tinted?.012:.012,envMapIntensity:tinted?.2:.5,specularIntensity:tinted?.45:.8,side:THREE.DoubleSide,transparent:false,opacity:1,depthWrite:true});
     }
     else if(/Tire|Rubber/.test(name)){m.color.set('#141617');m.roughness=.78;m.metalness=0;m.envMapIntensity=.5;}
     else if(/Seatbelt|Platic_Red|Mirror_Fade|Cybertruck_Logo/.test(name)){m.color.set('#202527');m.roughness=.6;}
     else if(/Wheel/.test(name)){m.color.set('#43494d');m.roughness=.32;m.metalness=.85;m.envMapIntensity=1.1;}
     else if(/Light|LED|Illumination/.test(name)){m.emissive?.set(/Brake|Red/.test(name)?'#ff2820':'#d4eaff');m.emissiveIntensity=/Glass/.test(name)?.3:2.3;}
     if(/Glass_Red/.test(name)){m.color.set('#9f1010');m.emissive?.set('#fa1a0a');m.emissiveIntensity=.55;}
     m.userData.baseOpacity=m.opacity;m.userData.baseTransparent=m.transparent;m.userData.baseDepthWrite=m.depthWrite;
     if(name==='Paint.001'){m.polygonOffset=true;m.polygonOffsetFactor=-1;m.polygonOffsetUnits=-1;}materialCache.set(materialKey,m);mats.add(m);return m;
    };
    o.material=Array.isArray(o.material)?o.material.map(adapt):adapt(o.material);if(/^(Paint\.001|Paint)$|Stainless_Steel_Exterior/.test(o.material?.name)){o.geometry=toCreasedNormals(o.geometry,.35);}if(o.material.transmission>0){o.castShadow=false;o.receiveShadow=false;}meshes.push(o);
   });
   bakeContact();
   meshes.forEach(o=>{if(/Glass|Light|Illumination/.test(o.material?.name))return;const wm=new THREE.LineBasicMaterial({color:0xd8bb83,transparent:true,opacity:0,depthWrite:false});const wire=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,32),wm);wire.matrixAutoUpdate=false;wire.matrix.copy(o.matrix);wire.renderOrder=3;o.parent.add(wire);wireMaterials.push(wm);});
   interaction=createExperience({car,camera,scene,canvas:renderer.domElement,floor,controls,report:v=>api.current.onTelemetry?.(v)});data.loaded=true;onLoad();
  }).catch(e=>{if(!dead)onError('精细模型加载失败，请刷新重试。');console.error(e)});
  const cameraPath=new THREE.CatmullRomCurve3(shots.map(s=>new THREE.Vector3(...s.p)),false,'centripetal');const targetPath=new THREE.CatmullRomCurve3(shots.map(s=>new THREE.Vector3(...s.t)),false,'centripetal');
  let current=0,wireAmount=0;const look=new THREE.Vector3(0,.6,0),pos=new THREE.Vector3();let last=performance.now();
  function render(now){if(dead)return;frame=requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.05);last=now;current+=(data.progress-current)*(1-Math.exp(-dt*5));
   const ownsCamera=interaction?.update(dt,data.experience||initialExperience,data.free);
   if(!ownsCamera&&!data.free){cameraPath.getPoint(Math.max(0,Math.min(1,current/6)),pos);targetPath.getPoint(Math.max(0,Math.min(1,current/6)),look);if(innerWidth<700){pos.sub(look).multiplyScalar(1.42).add(look);}camera.position.copy(pos);camera.lookAt(look);controls.target.copy(look);}else if(!ownsCamera)controls.update();
   const autoWire=current<3.45?0:current<3.85?smooth((current-3.45)/.4):current<4.4?1:Math.max(0,1-(current-4.4)/.65);
   const targetWire=data.experience?.mode&&data.experience.mode!=='showcase'?0:data.xray?1:autoWire;wireAmount+=(targetWire-wireAmount)*.09;
   contactMat.opacity=.9*(1-wireAmount*.75);backdropLight.intensity=5*(1-wireAmount*.65);wireMaterials.forEach(m=>m.opacity=wireAmount*.45);
   mats.forEach(m=>{const ghost=wireAmount>.005;const transparent=ghost||m.userData.baseTransparent;if(m.transparent!==transparent){m.transparent=transparent;m.needsUpdate=true;}m.opacity=m.userData.baseOpacity*(1-wireAmount*.96);m.depthWrite=ghost?wireAmount<.5:m.userData.baseDepthWrite;});
   renderer.render(scene,camera);
  }frame=requestAnimationFrame(render);
  function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}window.addEventListener('resize',resize);
  data.setFree=v=>{controls.enabled=v;controls.enableZoom=v;};
  return()=>{dead=true;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);interaction?.dispose();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});contactRT.dispose();blurRT.dispose();depthMat.dispose();hblur.dispose();vblur.dispose();blurQuad.dispose();steelRoughness.dispose();env.dispose();studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});draco.dispose();pmrem.dispose();renderer.dispose();el.removeChild(renderer.domElement);};
 },[]);
 useEffect(()=>{if(api.current){api.current.experience=experience;api.current.onTelemetry=onTelemetry}},[experience,onTelemetry]);
 useEffect(()=>{if(api.current)api.current.progress=progress},[progress]);
 useEffect(()=>{if(api.current){api.current.free=free;api.current.setFree?.(free)}},[free]);
 useEffect(()=>{if(api.current)api.current.xray=xray},[xray]);
 return <><div className={"stage "+(free?"can-drag":"")} ref={host} aria-label="Tesla Cybertruck 三维汽车展示"/></>;
}
export function App(){
 const [progress,setProgress]=useState(0),[loaded,setLoaded]=useState(false),[load,setLoad]=useState(0),[error,setError]=useState(''),[playing,setPlaying]=useState(false),[free,setFree]=useState(false),[xray,setXray]=useState(false),[info,setInfo]=useState(false),[menu,setMenu]=useState(false);
 const [experience,setExperience]=useState(initialExperience),[telemetry,setTelemetry]=useState({});
 const interactive=experience.mode!=='showcase';
 function changeExperience(patch){setPlaying(false);setFree(false);setXray(false);setExperience(old=>({...old,...patch}));}
 useEffect(()=>{if(!interactive)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';const clear=()=>setExperience(s=>({...s,gas:false,brake:false,steer:0}));window.addEventListener('blur',clear);return()=>{document.body.style.overflow=old;window.removeEventListener('blur',clear)}},[interactive]);
 const chapter=Math.min(6,Math.round(progress));const c=chapters[chapter];const playRef=useRef(false);
 function go(i){setExperience(initialExperience);setFree(false);setPlaying(false);window.scrollTo({top:(i/6)*(document.documentElement.scrollHeight-innerHeight),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});setMenu(false)}
 useEffect(()=>{const f=()=>setProgress(window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)*6);f();window.addEventListener('scroll',f,{passive:true});return()=>window.removeEventListener('scroll',f)},[]);
 useEffect(()=>{playRef.current=playing;if(!playing)return;let id,last=performance.now();function tick(now){if(!playRef.current)return;const dt=Math.min(now-last,1000);last=now;const end=document.documentElement.scrollHeight-innerHeight;const next=window.scrollY+end*dt/30000;if(next>=end){window.scrollTo(0,end);setPlaying(false);return;}window.scrollTo(0,next);id=requestAnimationFrame(tick)}id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id)},[playing]);
 useEffect(()=>{const stop=()=>setPlaying(false);const key=e=>{if(interactive){if(e.key==='Escape')changeExperience(initialExperience);return;}if(e.key==='Escape'){setInfo(false);setMenu(false);setFree(false)}if(!info&&['ArrowRight','ArrowDown'].includes(e.key)){e.preventDefault();go(Math.min(6,chapter+1))}if(!info&&['ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();go(Math.max(0,chapter-1))}};window.addEventListener('wheel',stop,{passive:true});window.addEventListener('touchstart',stop,{passive:true});window.addEventListener('keydown',key);return()=>{window.removeEventListener('wheel',stop);window.removeEventListener('touchstart',stop);window.removeEventListener('keydown',key)}},[chapter,info,interactive]);
 return <div className={interactive?'app is-interacting':'app'}><Stage experience={experience} onTelemetry={setTelemetry} progress={progress} free={free} xray={xray} onLoad={v=>{if(typeof v==='number')setLoad(v);else setLoaded(true)}} onError={setError}/><div className="vignette"/><div className="scroll-track" aria-hidden="true"/>
 <header><button className="brand" onClick={()=>go(0)} aria-label="返回序章">TESLA<span>ELECTRIC. UNCOMPROMISED.</span></button><div className="nav-rule"/><nav>{[{i:0,t:'CYBERTRUCK'},{i:1,t:'DESIGN'},{i:4,t:'ENGINEERING'},{i:5,t:'PERFORMANCE'}].map(n=><button className={chapter===n.i?'active':''} onClick={()=>go(n.i)} key={n.i}>{n.t}</button>)}</nav><div className="nav-rule"/><button className="about" onClick={()=>setInfo(true)}>THE SPECIFICATION <span>↗</span></button><button className="mobile-menu" onClick={()=>setMenu(!menu)}>章节 {menu?'−':'+'}</button></header>
 {menu&&<div className="menu">{chapters.map((n,i)=><button key={i} onClick={()=>go(i)}>0{i+1} / {n.name}</button>)}</div>}
 <main className={'overlay '+(free?'is-free':'')}><div className="eyebrow"><span className="tiny-line"/>{c.en}</div><div className={'hero-copy '+(chapter===0?'intro':[1,4,6].includes(chapter)?'centered':'')} key={chapter}><p className="micro">0{chapter+1} / 07 — {c.detail}</p><h1>{chapter===0?<>CYBER<span>TRUCK</span></>:c.title}</h1><p className="subtitle">{c.sub}</p></div>
 {chapter===0&&<div className="scanline"/>}{chapter===0&&<div className="intro-bottom"><span>BUILT FOR A DIFFERENT<br/><strong>WORLD.</strong></span><p>不锈钢的锋芒，纯电的力量。<br/>一次驶向未来的探索。</p></div>}
 {chapter===2&&<div className="callout left"><span>01 / DESIGN</span><strong>STAINLESS. FEARLESS.</strong><p>贯穿式灯带 · 极简锋芒</p></div>}
 {chapter===3&&<div className="callout left"><span>02 / CONTROL</span><strong>ALL-TERRAIN CAPABILITY</strong><p>全地形轮胎 · 无畏边界</p></div>}
 {chapter===4&&<div className="callout right"><span>03 / STRUCTURE</span><strong>BENEATH THE SKIN</strong><p>金色线框 · 结构可视化</p></div>}
 {chapter===5&&<div className="spec-strip"><div><b>STEEL</b><span>EXOSKELETON / 不锈钢外骨骼</span></div><div><b>ELECTRIC</b><span>POWERTRAIN / 纯电驱动</span></div><div><b>AWD</b><span>TRACTION / 全轮驱动</span></div></div>}
 {chapter===6&&<button className="replay" onClick={()=>go(0)}>重新探索 <span>↗</span></button>}
 </main>
 <aside className="chapter-nav" aria-label="章节导航">{chapters.map((n,i)=><button key={i} className={chapter===i?'selected':''} onClick={()=>go(i)} aria-label={'前往'+n.name}><span>{n.name}</span><i/></button>)}</aside>
 <div className="side-note">TESLA DESIGN / EARTH, 2026</div>
 <footer><div className="chapter-index"><b>0{chapter+1}</b><span>/ 07</span><div><small>CHAPTER</small><strong>{c.name}</strong></div></div><div className="playback"><button onClick={()=>{if(progress>5.95)go(0);setFree(false);setPlaying(!playing)}} aria-label={playing?'暂停自动播放':'自动播放'}>{playing?'Ⅱ':'▷'}<span>{playing?'暂停漫游':'自动漫游'}</span></button><div className="progress-bar" role="slider" aria-label="运镜进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress/6*100)} tabIndex={0} onKeyDown={e=>{e.stopPropagation();if(e.key==='ArrowRight')go(Math.min(6,chapter+1));if(e.key==='ArrowLeft')go(Math.max(0,chapter-1));}} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();go((e.clientX-r.left)/r.width*6)}}><i style={{width:`${progress/6*100}%`}}/></div><small>{Math.round(progress/6*100).toString().padStart(2,'0')}%</small></div><div className="tools"><button className={xray?'on':''} onClick={()=>setXray(!xray)} aria-pressed={xray}>透视 {xray?'ON':'OFF'}</button><button className={free?'on':''} onClick={()=>{setFree(!free);setPlaying(false)}} aria-pressed={free}>{free?'退出旋转':'自由旋转'} <span>↗</span></button></div></footer>
 <div className="bottom-caption">{free?'拖动旋转 · ESC 退出':'向下滚动，探索每一道极致。'}<span>SCROLL TO EXPLORE ↓</span></div>
 {!loaded&&<div className="loader"><span className="loader-brand">TESLA</span><h2>CYBERTRUCK</h2><p>{error||'PREPARING YOUR EXPERIENCE'}</p><div><i style={{width:`${load}%`}}/></div><small>{error?<button onClick={()=>location.reload()}>重新加载</button>:`${load}%`}</small></div>}
 {info&&<div className="modal-backdrop" onClick={()=>setInfo(false)}><section role="dialog" aria-modal="true" aria-label="Cybertruck 设计" className="modal" onClick={e=>e.stopPropagation()}><button className="close" autoFocus onClick={()=>setInfo(false)} aria-label="关闭规格">×</button><p className="micro">BEYOND CONVENTION</p><h2>CYBERTRUCK</h2><p>钢铁之躯，电动之魂。</p><dl>{[['车身','不锈钢外骨骼'],['驱动','纯电动力平台'],['设计','几何棱面 / 贯穿式灯带'],['视角','连续运镜 / 自由旋转'],['概念','未来工业美学']].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><a href="https://www.tesla.com/cybertruck" target="_blank" rel="noreferrer">查看官方车型资料 ↗</a><p className="credits">独立概念展示，非品牌官方网站。透视模式为网格可视化，不代表真实内部工程结构。<br/>3D: <a href="https://github.com/Fexiven/ha-tesla-3d-card" target="_blank" rel="noreferrer">Tesla 模型 / 来源记录</a> · 仅用于本地设计原型。</p></section></div>}
 <ExperienceControls state={experience} change={changeExperience} telemetry={telemetry} loaded={loaded}/>
 </div>;
}
