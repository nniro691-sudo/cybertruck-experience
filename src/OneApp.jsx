import React, {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const chapters=[
 {name:'序章',en:'THE ARRIVAL',title:'ONE OF A KIND.',sub:'一比一。重新定义极限。',detail:'KOENIGSEGG ONE:1 · ÄNGELHOLM, SWEDEN'},
 {name:'形随风动',en:'FORM FOLLOWS AIR',title:'SHAPED BY AIR.',sub:'每一道曲线，都为破风而生。',detail:'ACTIVE AERODYNAMICS / CARBON FIBRE'},
 {name:'锋芒',en:'PRECISION IN EVERY LINE',title:'NOTHING EXCESS.',sub:'以纯粹，雕琢力量。',detail:'CARBON-FIBRE BODY / SCULPTED LIGHT SIGNATURE'},
 {name:'掌控',en:'ABSOLUTE CONTROL',title:'POWER. CONTROLLED.',sub:'极致性能，始于每一次精准掌控。',detail:'CARBON-CERAMIC BRAKES / LIGHTWEIGHT WHEELS'},
 {name:'内在',en:'BEYOND THE SURFACE',title:'ENGINEERED TO DEFY.',sub:'穿透表象，看见工程之美。',detail:'STRUCTURE VISUALISATION / 5.0 L TWIN-TURBO V8'},
 {name:'一比一',en:'THE PERFECT EQUATION',title:'1,360 : 1,360',sub:'当马力与重量，达成完美平衡。',detail:'1,360 HP / 1,360 KG / ONE MEGACAR'},
 {name:'典藏',en:'ENGINEERED FOR THE EXTRAORDINARY',title:'THE ONE. THE ONLY.',sub:'不是追随极限，而是创造极限。',detail:'ONE:1 / AN INDEPENDENT DIGITAL STUDY'}
];
const shots=[
 {p:[0,1.45,8.7],t:[0,.55,0]},
 {p:[6,2.35,6.3],t:[0,.65,0]},
 {p:[2.35,1.15,3.05],t:[.62,.72,1.5]},
 {p:[3.5,.85,2.1],t:[1,.42,1.25]},
 {p:[7.7,2.25,.1],t:[0,.6,0]},
 {p:[6.25,2.8,6.6],t:[0,.6,0]},
 {p:[-5.8,2.1,6.8],t:[0,.62,0]}
];
const smooth=x=>x*x*(3-2*x);
function RasterStage({progress,free,xray,onLoad}){
 const ref=useRef(),data=useRef({progress,free,xray});
 useEffect(()=>{data.current={...data.current,progress,free,xray}},[progress,free,xray]);
 useEffect(()=>{
  const canvas=ref.current,ctx=canvas.getContext('2d');let dead=false,id,current=0,angle=0,drag=false,lastX=0,lastImage=null,didLoad=false,lastTime=performance.now();const cache=new Map();
  function imageFor(key){let entry=cache.get(key);if(entry){entry.used=performance.now();return entry.ready?entry.img:null;}const img=new Image();entry={img,ready:false,used:performance.now()};cache.set(key,entry);img.onload=()=>{entry.ready=true;if(!didLoad){didLoad=true;onLoad();}};img.onerror=()=>{setTimeout(()=>cache.delete(key),1500)};img.src=import.meta.env.BASE_URL+'assets/frames/'+key+'.webp';if(cache.size>28){const old=[...cache].sort((a,b)=>a[1].used-b[1].used);old.slice(0,cache.size-28).forEach(([k])=>cache.delete(k));}return null;}
  function resize(){canvas.width=Math.min(innerWidth*devicePixelRatio,1600);canvas.height=canvas.width*innerHeight/innerWidth;}resize();window.addEventListener('resize',resize);
  function paint(img,alpha=1){if(!img)return;const w=canvas.width,h=canvas.height;const scale=innerWidth<650?Math.min(w/img.width,h/img.height)*1.18:Math.max(w/img.width,h/img.height);const dw=img.width*scale,dh=img.height*scale;ctx.globalAlpha=alpha;ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);ctx.globalAlpha=1;}
  function frame(){if(dead)return;id=requestAnimationFrame(frame);const now=performance.now(),dt=Math.min((now-lastTime)/1000,.2);lastTime=now;current+=(data.current.progress-current)*(1-Math.exp(-dt*8));let f=current*16;let prefix='f',max=96;if(data.current.free||data.current.xray){prefix=data.current.xray?'gold':'orbit';f=((angle%24)+24)%24;max=23;}const lo=Math.min(max,Math.floor(f)),hi=Math.min(max,lo+1);const key=n=>prefix+String(prefix==='f'?n:n*2).padStart(3,'0');const a=imageFor(key(lo)),b=imageFor(key(hi));if(a||b)lastImage=a||b;ctx.fillStyle='#101211';ctx.fillRect(0,0,canvas.width,canvas.height);paint(a||lastImage);if(a&&b)paint(b,f-lo);for(let j=-2;j<=3;j++){const n=Math.max(0,Math.min(max,lo+j));imageFor(key(n));}}
  const down=e=>{if(!data.current.free)return;drag=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);};const move=e=>{if(!drag)return;angle+=(e.clientX-lastX)*.035;lastX=e.clientX;};const up=()=>drag=false;
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);imageFor('f000');frame();
  return()=>{dead=true;cancelAnimationFrame(id);window.removeEventListener('resize',resize);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);cache.clear()};
 },[]);
 return <div className={'stage raster '+(free?'can-drag':'')}><canvas ref={ref} aria-label="柯尼塞格 One:1 连续镜头展示"/></div>;
}
function Stage({progress,free,xray,onLoad,onError}) {
 const host=useRef(),api=useRef();const [fallback,setFallback]=useState(false);
 useEffect(()=>{
  const el=host.current; let dead=false,frame;
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#101211'); scene.fog=new THREE.FogExp2('#101211',.032);
  const testCanvas=document.createElement('canvas');if(!testCanvas.getContext('webgl2')){setFallback(true);return;}
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;el.appendChild(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(29.2,innerWidth/innerHeight,.05,100);camera.position.set(...shots[0].p);
  const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromScene(new RoomEnvironment(),.04);scene.environment=env.texture;
  scene.add(new THREE.HemisphereLight(0xe5e8e2,0x252119,2));
  const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(3,7,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6});key.shadow.bias=-.0003;scene.add(key);
  const rim=new THREE.DirectionalLight(0xffd39a,2.5);rim.position.set(-5,3,-4);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xc4d5df,2);fill.position.set(4,2,-3);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0x171918,roughness:.32,metalness:.48}));floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.receiveShadow=true;scene.add(floor);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.enabled=false;controls.minDistance=3.5;controls.maxDistance=12;controls.maxPolarAngle=Math.PI/2-.025;controls.target.set(0,.65,0);
  const data={progress:0,free:false,xray:false,loaded:false};api.current=data;
  let car;const meshes=[],wireMaterials=[]; const mats=new Set();
  new GLTFLoader().load(import.meta.env.BASE_URL+'assets/one1.glb',g=>{
   if(dead)return;car=g.scene;
   const box=new THREE.Box3().setFromObject(car),size=box.getSize(new THREE.Vector3());const scale=5/Math.max(size.x,size.y,size.z);car.scale.multiplyScalar(scale);
   const b=new THREE.Box3().setFromObject(car),center=b.getCenter(new THREE.Vector3());car.position.sub(center);car.position.y-=b.min.y-center.y;
   const pivot=new THREE.Group();pivot.add(car);scene.add(pivot);
   car.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const orig=(Array.isArray(o.material)?o.material:[o.material]);o.userData.materials=orig;orig.forEach(m=>{mats.add(m);m.userData.baseOpacity=m.opacity;m.userData.baseTransparent=m.transparent;if(m.name.includes('Paint')){m.color.set('#343a39');m.metalness=.85;m.roughness=.23;}if(m.name.includes('Window')){m.opacity=.65;m.roughness=.12;m.metalness=.5;}m.envMapIntensity=1.15;});meshes.push(o);
   }});
   meshes.forEach(o=>{const wm=new THREE.MeshBasicMaterial({color:0xe9bb75,wireframe:true,transparent:true,opacity:0,depthWrite:false});const wire=o.clone(false);wire.material=wm;wire.matrixAutoUpdate=false;wire.matrix.copy(o.matrix);wire.renderOrder=3;o.parent.add(wire);wireMaterials.push(wm);});
   data.loaded=true;onLoad();
  },e=>{if(e.total)onLoad(Math.min(95,Math.round(e.loaded/e.total*95)))},()=>onError('三维模型加载失败，请刷新重试。'));
  let current=0,wireAmount=0;const look=new THREE.Vector3(0,.6,0),pos=new THREE.Vector3();let last=performance.now();
  function render(now){if(dead)return;frame=requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.05);last=now;current+=(data.progress-current)*(1-Math.exp(-dt*5));
   const segment=Math.min(5,Math.floor(current)),k=smooth(Math.min(1,current-segment));const a=shots[segment],b=shots[segment+1];
   if(!data.free){pos.fromArray(a.p).lerp(new THREE.Vector3(...b.p),k);look.fromArray(a.t).lerp(new THREE.Vector3(...b.t),k);if(innerWidth<700){pos.sub(look).multiplyScalar(1.42).add(look);}camera.position.copy(pos);camera.lookAt(look);controls.target.copy(look);}else controls.update();
   const autoWire=current<3.4?0:current<4.25?smooth((current-3.4)/.85):current<4.8?1:Math.max(0,1-(current-4.8)/.65);
   const targetWire=data.xray?1:autoWire;wireAmount+=(targetWire-wireAmount)*.09;
   wireMaterials.forEach(m=>m.opacity=wireAmount*.23);
   mats.forEach(m=>{if(wireAmount>.005){m.transparent=true;m.opacity=m.userData.baseOpacity*(1-wireAmount*.88);m.depthWrite=wireAmount<.5;}else{m.transparent=m.userData.baseTransparent;m.opacity=m.userData.baseOpacity;m.depthWrite=true;}});
   renderer.render(scene,camera);
  }frame=requestAnimationFrame(render);
  function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}window.addEventListener('resize',resize);
  data.setFree=v=>{controls.enabled=v;controls.enableZoom=v;};
  return()=>{dead=true;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});env.dispose();pmrem.dispose();renderer.dispose();el.removeChild(renderer.domElement);};
 },[]);
 useEffect(()=>{if(api.current)api.current.progress=progress},[progress]);
 useEffect(()=>{if(api.current){api.current.free=free;api.current.setFree?.(free)}},[free]);
 useEffect(()=>{if(api.current)api.current.xray=xray},[xray]);
 return <><div className={"stage "+(free?"can-drag":"")} ref={host} aria-label="柯尼塞格 One:1 三维汽车展示"/>{fallback&&<RasterStage progress={progress} free={free} xray={xray} onLoad={onLoad}/>}</>;
}
export function App(){
 const [progress,setProgress]=useState(0),[loaded,setLoaded]=useState(false),[load,setLoad]=useState(0),[error,setError]=useState(''),[playing,setPlaying]=useState(false),[free,setFree]=useState(false),[xray,setXray]=useState(false),[info,setInfo]=useState(false),[menu,setMenu]=useState(false);
 const chapter=Math.min(6,Math.round(progress));const c=chapters[chapter];const playRef=useRef(false);
 function go(i){setFree(false);setPlaying(false);window.scrollTo({top:(i/6)*(document.documentElement.scrollHeight-innerHeight),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});setMenu(false)}
 useEffect(()=>{const f=()=>setProgress(window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)*6);f();window.addEventListener('scroll',f,{passive:true});return()=>window.removeEventListener('scroll',f)},[]);
 useEffect(()=>{playRef.current=playing;if(!playing)return;let id,last=performance.now();function tick(now){if(!playRef.current)return;const dt=Math.min(now-last,1000);last=now;const end=document.documentElement.scrollHeight-innerHeight;const next=window.scrollY+end*dt/42000;if(next>=end){window.scrollTo(0,end);setPlaying(false);return;}window.scrollTo(0,next);id=requestAnimationFrame(tick)}id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id)},[playing]);
 useEffect(()=>{const stop=()=>setPlaying(false);const key=e=>{if(e.key==='Escape'){setInfo(false);setMenu(false);setFree(false)}if(!info&&['ArrowRight','ArrowDown'].includes(e.key)){e.preventDefault();go(Math.min(6,chapter+1))}if(!info&&['ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();go(Math.max(0,chapter-1))}};window.addEventListener('wheel',stop,{passive:true});window.addEventListener('touchstart',stop,{passive:true});window.addEventListener('keydown',key);return()=>{window.removeEventListener('wheel',stop);window.removeEventListener('touchstart',stop);window.removeEventListener('keydown',key)}},[chapter,info]);
 return <><Stage progress={progress} free={free} xray={xray} onLoad={v=>{if(typeof v==='number')setLoad(v);else setLoaded(true)}} onError={setError}/><div className="vignette"/><div className="scroll-track" aria-hidden="true"/>
 <header><button className="brand" onClick={()=>go(0)} aria-label="返回序章">KOENIGSEGG<span>SPIRIT OF PERFORMANCE</span></button><div className="nav-rule"/><nav>{[{i:0,t:'ONE:1'},{i:1,t:'DESIGN'},{i:4,t:'ENGINEERING'},{i:5,t:'PERFORMANCE'}].map(n=><button className={chapter===n.i?'active':''} onClick={()=>go(n.i)} key={n.i}>{n.t}</button>)}</nav><div className="nav-rule"/><button className="about" onClick={()=>setInfo(true)}>THE SPECIFICATION <span>↗</span></button><button className="mobile-menu" onClick={()=>setMenu(!menu)}>章节 {menu?'−':'+'}</button></header>
 {menu&&<div className="menu">{chapters.map((n,i)=><button key={i} onClick={()=>go(i)}>0{i+1} / {n.name}</button>)}</div>}
 <main className={'overlay '+(free?'is-free':'')}><div className="eyebrow"><span className="tiny-line"/>{c.en}</div><div className={'hero-copy '+(chapter===0?'intro':[1,4,6].includes(chapter)?'centered':'')} key={chapter}><p className="micro">0{chapter+1} / 07 — {c.detail}</p><h1>{chapter===0?<>ONE<span>:1</span></>:c.title}</h1><p className="subtitle">{c.sub}</p></div>
 {chapter===0&&<div className="scanline"/>}{chapter===0&&<div className="intro-bottom"><span>THE WORLD’S FIRST<br/><strong>MEGACAR.</strong></span><p>当 1 马力，遇见 1 千克。<br/>一次关于极致的工程探索。</p></div>}
 {chapter===2&&<div className="callout left"><span>01 / DESIGN</span><strong>SCULPTED IN CARBON</strong><p>碳纤维车身 · 轻量化表达</p></div>}
 {chapter===3&&<div className="callout left"><span>02 / CONTROL</span><strong>CARBON CERAMIC</strong><p>碳陶瓷制动 · 精准掌控</p></div>}
 {chapter===4&&<div className="callout right"><span>03 / STRUCTURE</span><strong>BENEATH THE SKIN</strong><p>金色线框 · 结构可视化</p></div>}
 {chapter===5&&<div className="spec-strip"><div><b>1,360</b><span>HP / 最大功率</span></div><div><b>1,360</b><span>KG / 整备质量</span></div><div><b>1,371</b><span>NM / 最大扭矩</span></div></div>}
 {chapter===6&&<button className="replay" onClick={()=>go(0)}>重新探索 <span>↗</span></button>}
 </main>
 <aside className="chapter-nav" aria-label="章节导航">{chapters.map((n,i)=><button key={i} className={chapter===i?'selected':''} onClick={()=>go(i)} aria-label={'前往'+n.name}><span>{n.name}</span><i/></button>)}</aside>
 <div className="side-note">ÄNGELHOLM · SWEDEN / EST. 1994</div>
 <footer><div className="chapter-index"><b>0{chapter+1}</b><span>/ 07</span><div><small>CHAPTER</small><strong>{c.name}</strong></div></div><div className="playback"><button onClick={()=>{if(progress>5.95)go(0);setFree(false);setPlaying(!playing)}} aria-label={playing?'暂停自动播放':'自动播放'}>{playing?'Ⅱ':'▷'}<span>{playing?'暂停漫游':'自动漫游'}</span></button><div className="progress-bar" role="slider" aria-label="运镜进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress/6*100)} tabIndex={0} onKeyDown={e=>{e.stopPropagation();if(e.key==='ArrowRight')go(Math.min(6,chapter+1));if(e.key==='ArrowLeft')go(Math.max(0,chapter-1));}} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();go((e.clientX-r.left)/r.width*6)}}><i style={{width:`${progress/6*100}%`}}/></div><small>{Math.round(progress/6*100).toString().padStart(2,'0')}%</small></div><div className="tools"><button className={xray?'on':''} onClick={()=>setXray(!xray)} aria-pressed={xray}>透视 {xray?'ON':'OFF'}</button><button className={free?'on':''} onClick={()=>{setFree(!free);setPlaying(false)}} aria-pressed={free}>{free?'退出旋转':'自由旋转'} <span>↗</span></button></div></footer>
 <div className="bottom-caption">{free?'拖动旋转 · ESC 退出':'向下滚动，探索每一道极致。'}<span>SCROLL TO EXPLORE ↓</span></div>
 {!loaded&&<div className="loader"><span className="loader-brand">KOENIGSEGG</span><h2>ONE:1</h2><p>{error||'PREPARING YOUR EXPERIENCE'}</p><div><i style={{width:`${load}%`}}/></div><small>{error?<button onClick={()=>location.reload()}>重新加载</button>:`${load}%`}</small></div>}
 {info&&<div className="modal-backdrop" onClick={()=>setInfo(false)}><section role="dialog" aria-modal="true" aria-label="One:1 规格" className="modal" onClick={e=>e.stopPropagation()}><button className="close" autoFocus onClick={()=>setInfo(false)} aria-label="关闭规格">×</button><p className="micro">THE PERFECT EQUATION</p><h2>ONE:1</h2><p>一比一，成就唯一。</p><dl>{[['发动机','5.0 L 双涡轮增压 V8'],['最大功率','1,360 hp'],['整备质量','1,360 kg'],['最大扭矩','1,371 Nm'],['功率重量比','1 hp : 1 kg']].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><a href="https://www.koenigsegg.com/model/one1" target="_blank" rel="noreferrer">查看官方车型资料 ↗</a><p className="credits">独立概念展示，非品牌官方网站。透视模式为网格可视化，不代表真实内部工程结构。<br/>3D: <a href="https://sketchfab.com/3d-models/2014-koenigsegg-one-1-d21c0d3ee5094938889a26d7215b91e5" target="_blank" rel="noreferrer">Ddiaz Design</a> · CC BY-NC-SA 4.0 · 仅供非商业概念演示。</p></section></div>}
 </>;
}
