import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createExperience} from '../src/vehicleExperience.js';
test('door hinges animate, driving waits for closed doors, Park stops, and showcase restores the scene',()=>{
 globalThis.window={addEventListener(){},removeEventListener(){}};
 const scene=new THREE.Scene(),car=new THREE.Group();scene.background=new THREE.Color('#101314');scene.fog=new THREE.FogExp2('#101314',.028);const background=scene.background;
 for(const id of ['LF','RF','LR','RR']){const d=new THREE.Group();d.name=`Door_${id}_Spatial`;car.add(d);}const seat=new THREE.Group();seat.name='SeatRow1LMarker';car.add(seat);scene.add(car);
 const floor=new THREE.Mesh(),camera=new THREE.PerspectiveCamera();camera.position.set(5,2,8);const controls={target:new THREE.Vector3(),update(){}};let telemetry;
 const runtime=createExperience({car,camera,scene,floor,controls,canvas:{addEventListener(){},removeEventListener(){}},report:t=>telemetry=t});
 let state={mode:'exterior',view:'cockpit',doors:{LF:true},gear:'P'};const tick=n=>{for(let i=0;i<n;i++)runtime.update(.05,state);};tick(40);assert.ok(Math.abs(car.getObjectByName('Door_LF_Spatial').quaternion.y)>.4);assert.equal(telemetry.closed,false);
 state={...state,mode:'drive',gear:'D',gas:true};tick(2);assert.equal(telemetry.speed,0);tick(100);assert.ok(telemetry.speed>20);assert.ok(telemetry.distance>0);assert.equal(telemetry.closed,true);
 state={...state,gear:'P'};tick(80);assert.equal(telemetry.speed,0);
 state={...state,mode:'showcase'};runtime.update(.05,state,true);assert.equal(scene.background,background);assert.equal(floor.visible,true);assert.equal(controls.enabled,true);assert.equal(camera.fov,29.2);runtime.dispose();delete globalThis.window;
});
