import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {characterTypes,createCharacter,getCharacterInfo} from './characters.js';

const pose = root => {const values=[];root.traverse(o=>values.push([...o.position,...o.quaternion,...o.scale]));return values;};
test('all sixteen figures have distinct identities and fit the mobile rendering budget',()=>{
 const props=new Set(),families=new Map();
 for(const type of characterTypes){
  const model=createCharacter(type),info=getCharacterInfo(type);props.add(info.prop);families.set(info.family,(families.get(info.family)||0)+1);
  assert.equal(model.root.userData.characterType,type);
  let calls=0,triangles=0;model.root.traverse(o=>{if(o.isMesh){calls+=Array.isArray(o.material)?o.material.length:1;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});
  assert.ok(calls<=170,`${type}: ${calls} meshes`);assert.ok(triangles<40000,`${type}: ${triangles} triangles`);
  const box=new THREE.Box3().setFromObject(model.root);assert.ok(box.min.y>=-.01);assert.ok(box.max.y<3.8);assert.ok(box.max.x-box.min.x<3.5);
  model.dispose();
 }
 assert.equal(props.size,16);assert.deepEqual([...families.values()],[4,4,4,4]);
});
test('animation is deterministic, reduced motion restores neutral poses, disposal releases resources once',()=>{
 for(const type of characterTypes){
  const model=createCharacter(type);model.update(0,{reducedMotion:true});const neutral=pose(model.root);
  model.update(2.3);const animated=pose(model.root);assert.notDeepEqual(animated,neutral);
  model.update(8,{celebrating:true});model.update(2.3);assert.deepEqual(pose(model.root),animated);
  model.update(10,{reducedMotion:true});assert.deepEqual(pose(model.root),neutral);
  const resources=new Set();model.root.traverse(o=>{if(o.isMesh){resources.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])resources.add(m);}});
  let disposed=0;resources.forEach(r=>r.addEventListener('dispose',()=>disposed++));model.dispose();model.dispose();assert.equal(disposed,resources.size);assert.equal(model.root.children.length,0);
 }
});
