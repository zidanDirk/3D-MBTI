import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Reference-guided graphic figures. All geometry is local: no remote assets or textures.
export const characterTypes = Object.freeze(['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']);
const families = [
  { family: '分析家', familyKey: 'analysts', color: '#b997ff', dark: '#655291', pale: '#e7dcff' },
  { family: '外交家', familyKey: 'diplomats', color: '#89edb2', dark: '#397c67', pale: '#dbffe7' },
  { family: '守护者', familyKey: 'sentinels', color: '#71dded', dark: '#337f97', pale: '#d8faff' },
  { family: '探险家', familyKey: 'explorers', color: '#ffd278', dark: '#b78339', pale: '#fff0c7' },
];
const identities = [
  ['建筑师', '把想象搭成未来', '几何西装', '沉静观察，轻轻点头'],
  ['逻辑学家', '给每个问号一个宇宙', '实验烧瓶', '思考时轻摆实验瓶'],
  ['指挥官', '带着伙伴向前一步', '指挥棒', '指挥棒随手势轻摆'],
  ['辩论家', '灵感永远有下一招', '交叠礼服', '扬起眉毛，准备新观点'],
  ['提倡者', '看见每一点微光', '白须与引路杖', '白须长者轻轻点头'],
  ['调停者', '把心事写成星星', '绿叶花冠', '花冠随好奇心轻摆'],
  ['主人公', '把热爱传给更多人', '守护长剑', '稳稳握住守护之剑'],
  ['竞选者', '和新鲜事一起起飞', '绿发与领结', '张开双手迎接新朋友'],
  ['物流师', '认真让世界有序', '灰色档案夹', '翻看手中的档案夹'],
  ['守卫者', '温柔也有守护的力量', '十字护士帽', '温柔地挥手致意'],
  ['总经理', '把计划变成现实', '刻度直尺', '抬手检查规划尺度'],
  ['执政官', '让每个人都有归属', '信封与肩包', '将心意送到你的身边'],
  ['鉴赏家', '动手发现新可能', '护目镜与工具', '挥动手中的修理工具'],
  ['探险家', '给日常涂上自己的颜色', '画笔与调色盘', '画笔与调色盘一起摇摆'],
  ['企业家', '下一站，立刻出发', '墨镜与公文包', '拎起公文包，立即出发'],
  ['表演者', '此刻就是我的舞台', '双手沙锤', '摇动沙锤，跟随节拍'],
];
export function getCharacterInfo(type) {
  const index = characterTypes.indexOf(type);
  const safeIndex = index < 0 ? 0 : index;
  const [role, tagline, prop, motion] = identities[safeIndex];
  const { family, familyKey, color } = families[Math.floor(safeIndex / 4)];
  return { type: characterTypes[safeIndex], family, familyKey, color, role, tagline, prop, motion };
}

// Extruded graphic characters: broad rectangular silhouette, ink contours and
// flat geometric panels deliberately follow the supplied visual reference.
export function createCharacter(type, { withPedestal = true } = {}) {
  const info=getCharacterInfo(type),index=characterTypes.indexOf(info.type),family=Math.floor(index/4);
  const ink='#292828',skin='#e7bda5',paper='#fffaf0';
  const colors=[['#885577','#ad829f','#513c63'],['#639e79','#8cbb8c','#367f67'],['#72b7be','#a5d5d8','#3c7e91'],['#cfb349','#ebce70','#937943']][family];
  const [base,light,dark]=colors;
  const hairColors={INTJ:'#9780af',INTP:'#985c81',ENTJ:'#393838',ENTP:'#3b3b3c',INFJ:'#f5f4eb',INFP:'#a9c57d',ENFJ:'#383c3a',ENFP:'#72b696',ISTJ:'#f5f3ec',ISFJ:'#42413f',ESTJ:'#353537',ESFJ:'#464749',ISTP:'#a88846',ISFP:'#d4b14b',ESTP:'#dfb644',ESFP:'#303333'};
  const hair=hairColors[info.type],root=new THREE.Group();root.name=`character-${info.type}`;root.userData.characterType=info.type;
  const resources=new Set(),materials=new Map();
  function mat(c){if(!materials.has(c))materials.set(c,new THREE.MeshBasicMaterial({color:c,toneMapped:false}));return materials.get(c);}
  function mesh(p,g,c,x=0,y=0,z=0){resources.add(g);const m=new THREE.Mesh(g,mat(c));m.position.set(x,y,z);p.add(m);return m;}
  function group(p,name,x=0,y=0,z=0){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);p.add(g);return g;}
  // Round joins are merged into one contour mesh; outlines remain bold on WebGL,
  // where LineBasicMaterial linewidth is not portable.
  function stroke(p,points,{closed=false,width=.018,color=ink}={}){
    const positions=points.map(v=>new THREE.Vector3(...v)),parts=[];
    const count=closed?positions.length:positions.length-1;
    for(let i=0;i<count;i++){
      const a=positions[i],b=positions[(i+1)%positions.length],length=a.distanceTo(b);if(length<.00001)continue;
      const g=new THREE.CylinderGeometry(width,width,length,6,1).toNonIndexed();
      const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());g.applyQuaternion(q);g.translate(...a.clone().add(b).multiplyScalar(.5));parts.push(g);
    }
    for(const v of positions){const g=new THREE.SphereGeometry(width,6,4).toNonIndexed();g.translate(...v);parts.push(g);}
    const merged=mergeGeometries(parts);parts.forEach(g=>g.dispose());return mesh(p,merged,color);
  }
  function poly(p,points,c,{x=0,y=0,z=0,depth=.055,outline=true,width=.020,round=0}={}){
    if(round){const vertices=points;points=[];for(let i=0;i<vertices.length;i++){const prev=new THREE.Vector2(...vertices[(i+vertices.length-1)%vertices.length]),v=new THREE.Vector2(...vertices[i]),next=new THREE.Vector2(...vertices[(i+1)%vertices.length]);const a=v.clone().lerp(prev,Math.min(.3,round/v.distanceTo(prev))),b=v.clone().lerp(next,Math.min(.3,round/v.distanceTo(next)));for(let j=0;j<=4;j++){const t=j/4;points.push([a.x*(1-t)**2+2*v.x*t*(1-t)+b.x*t*t,a.y*(1-t)**2+2*v.y*t*(1-t)+b.y*t*t]);}}}
    const shape=new THREE.Shape();points.forEach(([px,py],i)=>i?shape.lineTo(px,py):shape.moveTo(px,py));shape.closePath();
    const g=group(p,'graphic-panel',x,y,z);const solid=mesh(g,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1}),c);solid.material=[mat(c),mat('#'+new THREE.Color(c).multiplyScalar(.65).getHexString())];
    if(outline)stroke(g,points.map(([px,py])=>[px,py,depth+.006]),{closed:true,width});return g;
  }
  const rectPoints=(w,h)=>[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
  function rect(p,c,x,y,z,w,h,depth=.055,outline=true){return poly(p,rectPoints(w,h),c,{x,y,z,depth,outline});}
  function ellipse(p,c,x,y,z,rx,ry,depth=.045,outline=true){const points=Array.from({length:32},(_,i)=>{const a=i*Math.PI*2/32;return [Math.cos(a)*rx,Math.sin(a)*ry];});return poly(p,points,c,{x,y,z,depth,outline});}
  function line(p,points,width=.018,color=ink){return stroke(p,points,{width,color});}
  const body=group(root,'body',0,withPedestal?.14:0,0);
  if(withPedestal){mesh(root,new THREE.CylinderGeometry(.98,1.02,.09,48),ink,0,.045,0);mesh(root,new THREE.CylinderGeometry(.94,.94,.025,48),dark,0,.105,0);}
  const torso=group(body,'torso',0,.83,0);
  const longRobe=['INFJ','INFP','INTP','ESFP'].includes(info.type);
  // The reference has almost no exposed leg: a small cuff anchors the box body.
  rect(body,skin,0,.10,-.28,1.23,.17,.56);
  if(!longRobe)line(body,[[0,.02,.365],[0,.54,.365]],.017);
  rect(torso,base,0,-.13,-.29,1.24,1.09,.58);
  const head=group(body,'head',0,1.75,0);
  // Ear circles sit behind the face; chamfered cheeks and flat chin echo the drawing.
  ellipse(head,skin,-.63,-.05,.04,.105,.13,.20);ellipse(head,skin,.63,-.05,.04,.105,.13,.20);
  const facePoints=[[-.61,-.41],[0,-.55],[.61,-.41],[.61,.30],[.45,.46],[-.43,.46],[-.61,.28]];
  poly(head,facePoints,skin,{z:-.27,depth:.62,width:.024});
  // Face: big white circular eyes, smaller pupils, line brows and tiny nose.
  [-1,1].forEach(s=>{
    if(info.type==='ISTP'&&s===-1){line(head,[[-.34,-.055,.42],[-.23,-.03,.42],[-.12,-.055,.42]],.020);return;}
    ellipse(head,paper,s*.225,-.04,.37,.155,.171,.016);
    ellipse(head,ink,s*.219,-.05,.40,.063,.075,.012,false);
    ellipse(head,paper,s*.219-.018,-.024,.42,.018,.022,.005,false);
    const tilt=['ENTP','ENTJ'].includes(info.type)?-.065:.018;
    line(head,[[s*.225-.105,.195+s*tilt,.405],[s*.225,.23,.405],[s*.225+.095,.195-s*tilt,.405]],.020);
  });
  line(head,[[-.035,-.17,.408],[.01,-.195,.409],[.05,-.17,.408]],.015);
  const smile=['ISFJ','ENFP','ESFP','ESFJ','ESTP'].includes(info.type);
  if(smile)poly(head,[[-.14,-.265],[.15,-.265],[.075,-.345],[-.04,-.345]],paper,{z:.39,depth:.025,width:.014});
  else line(head,[[-.12,-.30,.415],[0,-.27,.415],[.12,-.30,.415]],.014);
  [-1,1].forEach(s=>poly(head,[[s*.32,-.25],[s*.48,-.19],[s*.46,-.31]],'#d49b89',{z:.373,depth:.01,outline:false}));
  // Sculpted hair is a single graphic mass, extruded around the back of the head.
  let hairPoints=[[-.65,-.05],[-.65,.39],[-.48,.56],[-.17,.63],[.22,.62],[.55,.48],[.65,.27],[.65,-.03],[.48,.06],[.38,.31],[-.12,.33],[-.43,.21],[-.49,-.02]];
  if(info.type==='INTJ')hairPoints=[[-.65,-.13],[-.64,.38],[-.40,.57],[.12,.62],[.55,.48],[.63,.27],[.62,-.1],[.48,.02],[.41,.28],[.13,.46],[-.06,.27],[-.28,.43],[-.49,.27],[-.49,-.10]];
  if(info.type==='ISTP')hairPoints=[[-.64,.09],[-.58,.43],[-.32,.57],[0,.62],[.4,.52],[.62,.31],[.61,.02],[.49,.14],[.40,.34],[-.35,.34],[-.49,.13]];
  if(info.type==='ESTP')hairPoints=[[-.64,.02],[-.63,.51],[.20,.69],[.63,.51],[.47,.22],[.20,.32],[-.11,.40],[-.43,.26],[-.49,-.06]];
  if(info.type==='ISFP')hairPoints=[[-.63,.02],[-.61,.34],[-.77,.39],[-.64,.50],[-.66,.69],[-.45,.65],[-.32,.80],[-.13,.69],[.06,.83],[.22,.70],[.43,.78],[.50,.61],[.71,.61],[.69,.37],[.57,.10],[.49,.10],[.43,.32],[-.43,.32],[-.50,.06]];
  if(['INFJ','ISTJ'].includes(info.type))hairPoints=[[-.65,-.04],[-.65,.39],[-.54,.56],[-.27,.65],[.22,.65],[.54,.53],[.64,.36],[.65,-.01],[.48,.07],[.45,.31],[.03,.36],[-.34,.42],[-.49,.27],[-.49,-.05]];
  if(info.type==='ENFP')hairPoints=[[-.66,-.25],[-.64,.35],[-.47,.56],[-.16,.66],[.24,.62],[.54,.45],[.65,.28],[.64,-.23],[.44,-.04],[.35,.28],[.04,.39],[-.12,.15],[-.48,-.06]];
  if(info.type==='ENFJ')hairPoints=[[-.64,-.20],[-.64,.38],[-.48,.57],[.33,.57],[.57,.40],[.62,.05],[.49,.04],[.48,.28],[-.44,.28],[-.45,-.12]];
  if(info.type==='INFP')hairPoints=[[-.65,-.36],[-.65,.28],[-.51,.52],[-.18,.62],[.25,.60],[.55,.43],[.67,.18],[.65,-.35],[.45,-.24],[.39,.14],[.21,.34],[.02,.24],[-.22,.39],[-.45,.21],[-.47,-.20]];
  if(info.type==='ESFP')hairPoints=[[-.72,-.42],[-.63,-.06],[-.63,.39],[-.47,.60],[-.15,.73],[.19,.72],[.34,.62],[.58,.52],[.66,.26],[.67,-.12],[.81,-.42],[.54,-.46],[.46,-.05],[.32,.32],[.14,.36],[-.04,.22],[-.38,.17],[-.48,-.10],[-.47,-.43]];
  if(info.type==='ESFJ')hairPoints=[[-.65,-.02],[-.65,.38],[-.48,.61],[.12,.65],[.54,.54],[.65,.33],[.65,-.09],[.48,.06],[.38,.35],[.11,.20],[-.22,.38],[-.49,.13]];
  if(['ENTJ','ESTJ','INTP'].includes(info.type)){
    ellipse(head,hair,-.40,.43,-.25,.27,.30,.30);
    if(info.type==='INTP')poly(head,[[-.51,.52],[-.73,.67],[-.91,.54],[-.93,.14],[-1.06,.03],[-.72,.05],[-.62,.27]],hair,{z:-.25,depth:.30});
  }
  poly(head,hairPoints,hair,{z:-.30,depth:.70,width:.025,round:['ISFP','ESTP','INTJ'].includes(info.type)?0:.13});
  if(info.type==='ENFP')line(head,[[.04,.60,.423],[.02,.42,.423],[-.03,.28,.423]],.015);
  // Broad triangular collars carry each family's graphic identity.
  poly(torso,[[-.61,.30],[0,-.06],[-.61,-.12]],light,{z:.315,depth:.045});
  poly(torso,[[.61,.30],[0,-.06],[.61,-.12]],light,{z:.315,depth:.045});
  const arms=[];
  function arm(side){const a=group(torso,side<0?'left-arm':'right-arm',side*.62,.10,0);a.rotation.z=side*.13;
    poly(a,[[0,.17],[side*.24,-.13],[side*.18,-.31],[-side*.05,-.18]],skin,{z:-.18,depth:.40});
    poly(a,[[0,.19],[side*.14,-.02],[-side*.07,-.15],[-side*.15,.03]],base,{z:-.20,depth:.45});
    arms.push(a);return group(a,'hand',side*.16,-.21,.24);
  }
  const left=arm(-1),right=arm(1);
  function glasses({goggles=false,sunglasses=false}={}){
    const y=goggles?.30:-.04,z=.47;
    if(goggles)rect(head,ink,0,y,.43,1.31,.11,.06,false);
    [-1,1].forEach(s=>{
      rect(head,goggles?light:light,s*.245,y,z,.43,.35,.035);
      rect(head,sunglasses?ink:goggles?'#44413b':paper,s*.245,y,z+.042,.32,.24,.014,false);
      if(!goggles&&!sunglasses){rect(head,base,s*.245,y-.018,z+.063,.16,.17,.009,false);rect(head,ink,s*.245+.016,y-.019,z+.077,.080,.12,.005,false);rect(head,paper,s*.245-.009,y+.021,z+.086,.035,.035,.003,false);}
      if(sunglasses)line(head,[[s*.245-.08,y+.08,z+.067],[s*.245+.04,y-.03,z+.067]],.018,'#a3a2a1');
    });line(head,[[-.045,y+.045,z+.055],[.045,y+.045,z+.055]],.025);
  }
  function belt(){rect(torso,dark,0,-.30,.37,1.25,.12,.045);rect(torso,light,0,-.30,.421,.25,.14,.02);}
  function staff(p){line(p,[[0,-.25,.02],[.10,.65,.02]],.035);}
  function ruler(p){const r=rect(p,light,.16,.10,.05,.16,.80,.065);r.rotation.z=-.88;for(let j=0;j<7;j++)line(r,[[-.075,-.29+j*.09,.077],[-.015,-.29+j*.09,.077]],.009);}
  function envelope(p){const r=rect(p,paper,0,0,0,.37,.25,.05);line(r,[[-.18,.11,.067],[0,-.035,.067],[.18,.11,.067]],.012);return r;}
  switch(info.type){
    case 'ISTP':{
      glasses({goggles:true});belt();
      line(right,[[0,-.18,.03],[.10,.27,.03]],.045);const hammer=rect(right,'#929594',.11,.28,0,.35,.18,.10);hammer.rotation.z=.53;
      poly(left,[[-.13,.16],[-.05,.22],[.07,.11],[.04,.05],[-.09,.07],[-.14,-.04],[-.05,-.09],[.11,.03],[.17,-.03],[.04,-.18],[-.13,-.17],[-.24,-.06]],'#a8a8a0',{z:.02,depth:.07,width:.014});break;
    }
    case 'ISFP':{
      rect(head,light,0,.33,.44,1.40,.16,.045);rect(torso,dark,0,-.01,.38,1.21,.23,.02);rect(torso,light,0,-.01,.413,.40,.13,.02);belt();
      const palette=ellipse(left,light,-.16,-.005,.01,.22,.28,.08);
      [[-.08,.11],[.07,.13],[.10,-.02],[-.03,-.15]].forEach(([x,y])=>ellipse(palette,dark,x,y,.10,.032,.036,.015,false));
      line(right,[[0,-.10,.02],[.27,.27,.02]],.030);ellipse(right,dark,.28,.28,.025,.065,.11,.03).rotation.z=-.60;break;
    }
    case 'ESFP':{
      rect(torso,light,0,-.34,.36,1.25,.20,.04);for(const [p,s] of [[left,-1],[right,1]]){line(p,[[0,0,.04],[s*.19,.26,.04]],.035);const shaker=ellipse(p,light,s*.23,.32,.015,.12,.17,.09);shaker.rotation.z=-s*.5;line(shaker,[[0,-.14,.109],[0,.14,.109]],.014);}break;
    }
    case 'ESTP':{
      glasses({sunglasses:true});belt();
      const bag=rect(left,'#706961',-.08,-.04,.04,.45,.34,.16);bag.rotation.z=-.20;rect(bag,ink,0,.22,.02,.19,.09,.03);line(bag,[[-.21,0,.177],[.21,0,.177]],.012);rect(bag,light,0,0,.185,.075,.06,.018,false);break;
    }
    case 'INFJ':{
      poly(head,[[-.17,-.20],[.17,-.20],[.16,-.57],[.08,-.73],[-.08,-.73],[-.16,-.56]],paper,{z:.44,depth:.055});line(head,[[-.13,-.35,.51],[.13,-.35,.51]],.014);
      poly(torso,[[0,-.20],[.15,-.34],[0,-.51],[-.15,-.34]],paper,{z:.38,depth:.03});line(right,[[0,-.13,.03],[.20,.24,.03],[.40,.34,.03]],.023);break;
    }
    case 'ENFP':{
      rect(torso,dark,0,-.36,.38,1.25,.09,.025);for(let j=-2;j<=2;j++)rect(torso,light,j*.22,-.43,.408,.075,.30,.008,false);
      poly(torso,[[0,.10],[-.21,-.03],[-.18,-.25],[0,-.17],[.18,-.25],[.21,-.03]],ink,{z:.39,depth:.05,width:.015});break;
    }
    case 'ENFJ':{
      poly(head,[[-.42,-.16],[-.26,-.19],[-.18,-.37],[.15,-.37],[.26,-.20],[.43,-.16],[.41,-.46],[0,-.56],[-.41,-.46]],'#73796b',{z:.39,depth:.035,width:.018});rect(head,skin,0,-.31,.44,.28,.12,.008);line(head,[[-.12,-.27,.463],[.12,-.27,.463]],.012);
      belt();rect(right,dark,.13,.29,.02,.10,.35,.08);rect(right,paper,.13,.07,.05,.48,.075,.06);poly(right,[[.02,.03],[.24,.03],[.28,-.58],[.13,-.75],[-.02,-.58]],'#d7ddd4',{z:.02,depth:.07,width:.018});line(right,[[.13,.02,.11],[.13,-.70,.11]],.010);break;
    }
    case 'INFP':{
      for(let j=0;j<7;j++){const x=-.54+j*.18,y=.30+(.56-Math.abs(x))*.25;poly(head,[[x-.08,y-.07],[x-.12,y+.15],[x,y+.28],[x+.11,y+.07],[x+.04,y-.10]],j%2?dark:light,{z:.44,depth:.035,width:.013});}
      rect(torso,dark,0,-.38,.36,1.25,.33,.02);for(let j=0;j<5;j++)poly(torso,[[j*.25-.62,-.32],[j*.25-.37,-.32],[j*.25-.495,-.47]],light,{z:.392,depth:.012,outline:false});break;
    }
    case 'ISTJ':{
      glasses();poly(torso,[[-.61,.24],[0,-.06],[.61,.24],[.43,.37],[0,.10],[-.43,.37]],paper,{z:.39,depth:.025});rect(torso,'#626c6e',0,-.38,.36,1.25,.30,.025);line(torso,[[0,-.23,.41],[0,-.53,.41]],.018);
      const folder=rect(left,'#a7a8a3',-.10,.10,.04,.45,.51,.10);folder.rotation.z=.54;line(right,[[0,0,.02],[.22,.20,.02]],.017);break;
    }
    case 'ISFJ':{
      poly(head,[[-.48,.41],[-.57,.67],[.04,.84],[.54,.64],[.45,.40]],base,{z:.43,depth:.055});rect(head,dark,0,.62,.506,.075,.24,.01,false);rect(head,dark,0,.62,.506,.23,.073,.01,false);
      poly(torso,[[-.22,.24],[0,.10],[-.22,-.03]],paper,{z:.39,depth:.03});poly(torso,[[.22,.24],[0,.10],[.22,-.03]],paper,{z:.39,depth:.03});rect(torso,dark,0,-.38,.37,1.24,.16,.025);break;
    }
    case 'ESTJ':{
      glasses();poly(torso,[[-.58,.18],[.58,-.26],[-.58,-.26]],dark,{z:.375,depth:.026});ruler(right);break;
    }
    case 'ESFJ':{
      rect(torso,paper,0,-.11,.395,.69,.80,.025);[-1,1].forEach(s=>rect(torso,light,s*.47,-.1,.393,.15,.79,.025));
      const strap=rect(torso,dark,-.61,.05,.44,.08,.87,.03);strap.rotation.z=.08;const bag=rect(left,base,-.13,-.15,.02,.36,.34,.12);bag.rotation.z=.28;envelope(bag);envelope(right).rotation.z=-.35;break;
    }
    case 'INTJ':{
      rect(torso,dark,0,-.23,.37,1.24,.45,.035);poly(torso,[[-.59,.28],[-.09,.07],[-.09,-.18],[-.59,.06]],light,{z:.40,depth:.02});poly(torso,[[.59,.28],[-.09,.07],[.59,-.12]],base,{z:.40,depth:.02});line(torso,[[0,.05,.441],[0,-.46,.441]],.015);for(const y of [-.10,-.29])ellipse(torso,paper,.10,y,.43,.032,.032,.008);break;
    }
    case 'INTP':{
      glasses();[-1,1].forEach(s=>rect(torso,paper,s*.49,-.08,.40,.23,1.02,.035));poly(torso,[[-.36,.26],[.36,.26],[0,-.08]],dark,{z:.40,depth:.026});poly(torso,[[-.36,-.40],[.36,-.40],[0,-.08]],'#9a83b1',{z:.40,depth:.026});
      poly(left,[[-.05,.15],[.06,.15],[.06,.01],[.19,-.24],[-.18,-.24],[-.05,.01]],paper,{z:.03,depth:.08,width:.015});poly(left,[[-.10,-.12],[.11,-.12],[.16,-.21],[-.15,-.21]],base,{z:.13,depth:.009,outline:false});break;
    }
    case 'ENTJ':{
      // Round spectacles, a tied-back silhouette and slim pointer distinguish the leader.
      [-1,1].forEach(s=>{const points=Array.from({length:32},(_,j)=>[s*.225+Math.cos(j*Math.PI/16)*.203,-.04+Math.sin(j*Math.PI/16)*.21,.448]);stroke(head,points,{closed:true,width:.017});});line(head,[[-.02,-.005,.45],[.02,-.005,.45]],.02);
      poly(torso,[[-.62,.24],[.60,-.24],[-.60,-.24]],dark,{z:.39,depth:.025});ellipse(torso,paper,0,.01,.43,.032,.032,.01);staff(right);break;
    }
    case 'ENTP':{
      poly(torso,[[-.34,.30],[0,-.07],[.34,.30]],paper,{z:.39,depth:.035});poly(torso,[[-.61,.19],[.61,-.33],[-.61,-.33]],dark,{z:.405,depth:.025});line(torso,[[-.61,-.36,.45],[.61,-.36,.45]],.02);break;
    }
  }
  const neutral=[];root.traverse(o=>neutral.push({o,p:o.position.clone(),r:o.rotation.clone()}));let disposed=false;
  return {root,info,
    update(timeSeconds,{reducedMotion=false,celebrating=false}={}){
      if(disposed)return;for(const {o,p,r} of neutral){o.position.copy(p);o.rotation.copy(r);}if(reducedMotion)return;
      const t=Number.isFinite(timeSeconds)?timeSeconds:0;
      head.rotation.z=Math.sin(t*.95+index*.4)*.018;head.rotation.y=Math.sin(t*.7+index*.3)*.045;
      arms.forEach((a,i)=>{a.rotation.z+=Math.sin(t*(info.type==='ESFP'?3:1.5)+i)*.035;if(celebrating)a.rotation.z+=(i?1:-1)*(.12+Math.sin(t*5)*.09);});
    },
    dispose(){if(disposed)return;disposed=true;resources.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());resources.clear();materials.clear();root.removeFromParent();root.clear();}
  };
}
