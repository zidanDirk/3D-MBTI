import test from 'node:test';import assert from 'node:assert/strict';
import {createPlayStore,PLAY_STORAGE_KEY} from './play-store.js';import {newAdventure,chooseAdventure,restoreAdventure} from './adventure.js';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),keys:()=>[...m.keys()]};};
test('story resumes from validated state, completed endings deduplicate, and other storage is untouched',()=>{
 const storage=memory();storage.setItem('inner-space-v2','original');let store=createPlayStore(storage),s=newAdventure('INTJ');s=chooseAdventure(s,0);store.save(s);
 store=createPlayStore(storage);assert.deepEqual(store.snapshot().current,s);for(const i of [0,0,0,2,0])s=chooseAdventure(s,i);assert.equal(s.status,'complete');store.save(s);store.save(s);assert.deepEqual(store.snapshot().collection,['ending-signal']);assert.equal(storage.getItem('inner-space-v2'),'original');assert.deepEqual(storage.keys(),['inner-space-v2',PLAY_STORAGE_KEY]);store.clear();assert.equal(store.snapshot().current,null);assert.equal(store.snapshot().collection.length,1);
});
test('corrupt and forged saves recover, and storage failure is accurately reported then recovers',()=>{
 const storage=memory();storage.setItem(PLAY_STORAGE_KEY,'{broken');let store=createPlayStore(storage);store.save(newAdventure());assert.equal(store.available,true);assert.ok(createPlayStore(storage).snapshot().current);
 storage.setItem(PLAY_STORAGE_KEY,JSON.stringify({version:1,current:{...newAdventure(),energy:999},collection:['fake','ending-signal','ending-signal',null]}));store=createPlayStore(storage);assert.equal(store.snapshot().current,null);assert.deepEqual(store.snapshot().collection,['ending-signal']);assert.throws(()=>store.save({...newAdventure(),energy:999}));
 let fail=true;store=createPlayStore({getItem:()=>null,setItem(){if(fail)throw Error('blocked');}});store.save(newAdventure());assert.equal(store.available,false);assert.ok(restoreAdventure(store.snapshot().current));fail=false;store.save(newAdventure());assert.equal(store.available,true);
});
