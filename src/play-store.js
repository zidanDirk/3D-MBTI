import { restoreAdventure, adventureSummary, endings } from './adventure.js';
export const PLAY_STORAGE_KEY='inner-space-play-v1';
export function createPlayStore(storage){
 let current=null,collection=[],available=true;
 try{const raw=JSON.parse(storage.getItem(PLAY_STORAGE_KEY));if(raw?.version===1){current=restoreAdventure(raw.current);collection=Array.isArray(raw.collection)?[...new Set(raw.collection.filter(id=>endings.some(e=>e.id===id)))]:[];}}catch(error){available=error instanceof SyntaxError;}
 function persist(){try{storage.setItem(PLAY_STORAGE_KEY,JSON.stringify({version:1,current,collection}));available=true;}catch{available=false;}}
 return {get available(){return available;},snapshot:()=>structuredClone({current,collection}),save(state){const valid=restoreAdventure(state);if(!valid)throw new TypeError('无效冒险进度');current=valid;if(valid.status==='complete'){const id=adventureSummary(valid).id;if(!collection.includes(id))collection.push(id);}persist();},clear(){current=null;persist();}};
}
