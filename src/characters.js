import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Original collectible figures. All geometry is local: no remote assets or textures.
export const characterTypes = Object.freeze(['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']);
const families = [
  { family: '分析家', familyKey: 'analysts', color: '#b997ff', dark: '#655291', pale: '#e7dcff' },
  { family: '外交家', familyKey: 'diplomats', color: '#89edb2', dark: '#397c67', pale: '#dbffe7' },
  { family: '守护者', familyKey: 'sentinels', color: '#71dded', dark: '#337f97', pale: '#d8faff' },
  { family: '探险家', familyKey: 'explorers', color: '#ffd278', dark: '#b78339', pale: '#fff0c7' },
];
const identities = [
  ['建筑师', '把想象搭成未来', '全息蓝图', '展开未来蓝图'],
  ['逻辑学家', '给每个问号一个宇宙', '轨道原子', '原子环缓缓公转'],
  ['指挥官', '带着伙伴向前一步', '星际指挥棒', '披风与指挥棒轻摆'],
  ['辩论家', '灵感永远有下一招', '灵感灯泡', '点亮下一颗灵感'],
  ['提倡者', '看见每一点微光', '水晶引路杖', '水晶微光环绕'],
  ['调停者', '把心事写成星星', '星空手账', '让故事里的星星升起'],
  ['主人公', '把热爱传给更多人', '爱心信标', '举起连接彼此的信标'],
  ['竞选者', '和新鲜事一起起飞', '星际背包', '星星跟随好奇心'],
  ['物流师', '认真让世界有序', '任务记录板', '核对今日探索清单'],
  ['守卫者', '温柔也有守护的力量', '爱心护盾', '护盾在掌心轻摆'],
  ['总经理', '把计划变成现实', '调度终端', '查看城市运行面板'],
  ['执政官', '让每个人都有归属', '心意礼盒', '递来一份小小心意'],
  ['鉴赏家', '动手发现新可能', '多功能扳手', '检查下一件发明'],
  ['探险家', '给日常涂上自己的颜色', '星形调色盘', '画笔与色彩一起摇摆'],
  ['企业家', '下一站，立刻出发', '悬浮滑板', '准备下一次街头冒险'],
  ['表演者', '此刻就是我的舞台', '星光麦克风', '跟着节拍轻轻律动'],
];
export function getCharacterInfo(type) {
  const index = characterTypes.indexOf(type);
  const safeIndex = index < 0 ? 0 : index;
  const [role, tagline, prop, motion] = identities[safeIndex];
  const { family, familyKey, color } = families[Math.floor(safeIndex / 4)];
  return { type: characterTypes[safeIndex], family, familyKey, color, role, tagline, prop, motion };
}

export function createCharacter(type, { withPedestal = true } = {}) {
  const info = getCharacterInfo(type);
  const index = characterTypes.indexOf(info.type);
  const palette = families[Math.floor(index / 4)];
  const { color, dark, pale } = palette;
  const root = new THREE.Group();
  root.name = `character-${info.type}`;
  root.userData.characterType = info.type;
  const body = new THREE.Group(); root.add(body);
  body.position.y = withPedestal ? .16 : 0;
  const geometries = new Set();
  const materials = new Map();
  const cache = new Map();
  const motions = [];
  const cream = '#f3f0e8';
  const ink = '#253147';
  const metal = '#aab8cd';
  const skin = ['#efb995', '#deb08d', '#aa7255', '#f0cbb1', '#c68c68', '#efd2ba', '#9c674e', '#d9a17f', '#d2a080', '#f2c6a5', '#a97054', '#e8b292', '#c58e6a', '#9d6c55', '#edc1a2', '#d79b79'][index];
  const hair = ['#353247', '#293746', '#302b39', '#625079', '#3a3944', '#8b514d', '#34303a', '#eea16e', '#39465a', '#6e473d', '#2a3442', '#394c57', '#e5dbbc', '#3e3249', '#815941', '#694367'][index];
  function material(c, mode = 'soft') {
    const key = `${c}:${mode}`;
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color: c, roughness: mode === 'metal' ? .3 : .59, metalness: mode === 'metal' ? .55 : .04, ...(mode === 'glow' ? { emissive: c, emissiveIntensity: .65 } : {}) }));
    return materials.get(key);
  }
  function geo(key, make) {
    if (!cache.has(key)) { const geometry = make(); cache.set(key, geometry); geometries.add(geometry); }
    return cache.get(key);
  }
  function mesh(p, geometry, c, x, y, z, mode) {
    geometries.add(geometry);
    const m = new THREE.Mesh(geometry, material(c, mode));
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m;
  }
  function box(p, c, x, y, z, w, h, d, r = .035, mode) {
    const key = `box:${w}:${h}:${d}:${r}`;
    return mesh(p, geo(key, () => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2))), c, x, y, z, mode);
  }
  function ball(p, c, x, y, z, rx, ry = rx, rz = rx, mode) {
    const m = mesh(p, geo('sphere', () => new THREE.SphereGeometry(1, 16, 12)), c, x, y, z, mode);
    m.scale.set(rx, ry, rz); return m;
  }
  function cylinder(p, c, x, y, z, rt, rb, h, sides = 16, mode) {
    return mesh(p, geo(`cyl:${rt}:${rb}:${h}:${sides}`, () => new THREE.CylinderGeometry(rt, rb, h, sides)), c, x, y, z, mode);
  }
  function ring(p, c, x, y, z, r, tube = .018, mode) {
    return mesh(p, geo(`ring:${r}:${tube}`, () => new THREE.TorusGeometry(r, tube, 5, 32)), c, x, y, z, mode);
  }
  function rod(p, c, a, b, radius = .035, mode) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const m = cylinder(p, c, 0, 0, 0, radius, radius, start.distanceTo(end), 10, mode);
    m.position.copy(start).add(end).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize()); return m;
  }
  function shapeMesh(p, points, c, x, y, z, depth = .045, bevel = .015) {
    const shape = new THREE.Shape(); points.forEach(([px, py], i) => i ? shape.lineTo(px, py) : shape.moveTo(px, py)); shape.closePath();
    return mesh(p, new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSegments: 1, steps: 1, bevelSize: bevel, bevelThickness: bevel }), c, x, y, z);
  }
  function star(p, c, x, y, z, size = .15) {
    const points = Array.from({ length: 10 }, (_, k) => { const a = Math.PI / 2 + k * Math.PI / 5, r = size * (k % 2 ? .47 : 1); return [Math.cos(a) * r, Math.sin(a) * r]; });
    return shapeMesh(p, points, c, x, y, z, .035, .009);
  }
  function heart(p, c, x, y, z, size = .14) {
    const shape = new THREE.Shape();
    shape.moveTo(0, -.8); shape.bezierCurveTo(-1.55, .1, -.8, 1.3, 0, .5); shape.bezierCurveTo(.8, 1.3, 1.55, .1, 0, -.8);
    const m = mesh(p, new THREE.ExtrudeGeometry(shape, { depth: .28, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .07, bevelThickness: .06, curveSegments: 8 }), c, x, y, z);
    m.scale.setScalar(size); return m;
  }
  function group(p, name, x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); p.add(g); return g; }
  function motion(object, amplitude, speed, axis = 'y', phase = 0) {
    const neutral = object.rotation[axis]; motions.push(t => { object.rotation[axis] = neutral + Math.sin(t * speed + phase) * amplitude; });
  }
  if (withPedestal) {
    cylinder(root, '#20263f', 0, .065, 0, .83, .86, .13, 48, 'metal');
    cylinder(root, dark, 0, .137, 0, .81, .83, .025, 48);
    const rim = ring(root, color, 0, .152, 0, .78, .012, 'glow'); rim.rotation.x = -Math.PI / 2;
    for (let n = 0; n < 4; n++) {
      const a = n * Math.PI / 2; const tick = box(root, pale, Math.sin(a) * .73, .156, Math.cos(a) * .73, .075, .009, .015, .003); tick.rotation.y = a;
    }
  }
  // Grounded, slightly asymmetric stance: feet never slide during the idle cycle.
  const spread = info.type === 'ESTP' || info.type === 'ENTJ' ? .225 : .18;
  [-1, 1].forEach(side => {
    const leg = cylinder(body, ink, side * spread, .53, 0, .12, .105, .65, 12);
    leg.rotation.z = side * -.035;
    box(body, dark, side * spread, .18, .07, .27, .25, .41, .07);
    box(body, ink, side * spread, .065, .075, .29, .10, .44, .035);
    box(body, pale, side * spread, .28, .105, .19, .055, .30, .015);
    box(body, color, side * spread, .13, .275, .17, .05, .025, .008);
  });
  const torso = group(body, 'torso', 0, 1.34, 0);
  const coatLength = ['INTJ', 'INTP', 'INFJ'].includes(info.type) ? 1.09 : .83;
  const coatColor = info.type === 'INTP' ? cream : color;
  const coat = cylinder(torso, coatColor, 0, -.03, 0, .30, .39, coatLength, 8); coat.scale.z = .70;
  box(torso, cream, 0, .11, .205, .30, .55, .12, .03);
  // Two folded lapels create a tailored front, with a luminous family pin.
  [-1, 1].forEach(side => {
    const lapel = shapeMesh(torso, [[0, .29], [side * .17, .24], [side * .08, -.08]], pale, side * .03, .16, .273, .022, .008);
    lapel.rotation.z = side * -.12;
  });
  box(torso, dark, 0, -.30, .02, .69, .105, .47, .025);
  box(torso, '#eddb9a', .02, -.30, .28, .12, .09, .035, .015, 'metal');
  for (let j = 0; j < 2; j++) ball(torso, dark, .08, -.035 - j * .13, .285, .025, .025, .014);
  star(torso, pale, -.22, .21, .285, .057);
  cylinder(torso, skin, 0, .51, 0, .13, .15, .24);
  box(torso, pale, 0, .42, .015, .35, .10, .30, .035);

  const head = group(body, 'head', 0, 2.37, 0);
  const face = box(head, skin, 0, 0, 0, .89, .94, .79, .23);
  face.name = 'face';
  [-1, 1].forEach(side => {
    ball(head, skin, side * .46, -.04, .01, .105, .135, .105);
    ball(head, '#c47c6b', side * .493, -.04, .065, .034, .068, .025);
    const eyeX = side * .183;
    ball(head, '#fefcf7', eyeX, -.01, .390, .105, .125, .035);
    ball(head, ink, eyeX + .01, -.006, .424, .057, .077, .023);
    ball(head, '#ffffff', eyeX - .006, .023, .447, .016, .023, .009);
    const brow = box(head, hair, eyeX, .165 + (side === 1 && index % 3 === 0 ? .022 : 0), .396, .17, .042, .027, .019);
    brow.rotation.z = side * (index % 4 === 0 ? -.1 : .09);
    ball(head, '#e69385', side * .28, -.15, .390, .075, .032, .016);
  });
  ball(head, skin, .01, -.12, .430, .055, .06, .049);
  const smile = mesh(head, new THREE.TorusGeometry(.087, .012, 5, 14, Math.PI * .75), '#864f52', 0, -.205, .41);
  smile.rotation.z = Math.PI * 1.125;
  // Scalp cap and sculpted swept locks, leaving the expression entirely readable.
  const scalp = mesh(head, new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI * .58), hair, 0, .17, -.045);
  scalp.scale.set(.49, .41, .44);
  for (let j = 0; j < 4; j++) {
    const lock = ball(head, hair, -.29 + j * .175, .31 + (j % 2) * .022, .292, .14, .22 - j * .014, .10);
    lock.rotation.z = -.4 + index % 3 * .12;
  }
  [-1, 1].forEach(side => ball(head, hair, side * .408, .10, -.045, .084, .245, .29));
  head.rotation.z = [-.035, .04, 0, -.06][index % 4];
  motion(head, .055, .8, 'y', index * .3);

  function glasses(round = false, goggles = false) {
    const y = goggles ? .29 : -.004, z = goggles ? .369 : .454;
    [-1, 1].forEach(side => {
      if (round) ring(head, goggles ? dark : metal, side * .185, y, z, .135, goggles ? .034 : .016, 'metal');
      else {
        const g = group(head, 'glasses', side * .185, y, z);
        box(g, dark, 0, .10, 0, .255, .026, .025, .01);
        box(g, dark, 0, -.095, 0, .255, .026, .025, .01);
        [-1, 1].forEach(s => box(g, dark, s * .116, 0, 0, .026, .19, .025, .01));
      }
      rod(head, metal, [side * .30, y, z], [side * .48, y + .02, .0], .015, 'metal');
    });
    rod(head, metal, [-.06, y + .025, z], [.06, y + .025, z], .015, 'metal');
  }
  function beret(c = color) {
    const beret = ball(head, c, -.03, .485, -.01, .53, .15, .45); beret.rotation.z = -.15;
    cylinder(head, dark, 0, .61, 0, .04, .05, .10, 8);
    star(head, pale, -.27, .46, .39, .06);
  }
  function cap() {
    cylinder(head, dark, 0, .405, -.01, .44, .48, .18, 12);
    ball(head, color, 0, .525, -.02, .49, .16, .42);
    box(head, dark, 0, .325, .39, .55, .065, .34, .045);
    star(head, pale, 0, .47, .433, .095);
  }
  function headphones() {
    const band = ring(head, dark, 0, .045, -.07, .515, .04); band.scale.y = 1.1;
    [-1, 1].forEach(side => {
      box(head, dark, side * .493, .02, -.025, .145, .32, .27, .07);
      box(head, color, side * .565, .025, -.025, .04, .22, .19, .025, 'metal');
    });
  }
  function scarf() {
    const neck = ring(torso, dark, 0, .445, 0, .18, .055); neck.rotation.x = Math.PI / 2;
    const tail = box(torso, dark, -.15, .15, .315, .16, .49, .065, .025); tail.rotation.z = -.15;
    box(torso, pale, -.18, -.055, .352, .14, .035, .012, .004);
  }
  function cape(c = dark, width = .73) {
    const cmesh = shapeMesh(torso, [[-width / 2, .38], [width / 2, .38], [width * .7, -.70], [0, -.62], [-width * .7, -.70]], c, 0, .04, -.25, .10, .035);
    cmesh.rotation.x = -.12; motion(cmesh, .035, 1.3, 'x'); return cmesh;
  }
  function longHair() {
    [-1, 1].forEach(side => {
      const lock = ball(head, hair, side * .35, -.22, -.24, .18, .45, .21); lock.rotation.z = side * -.11;
    });
    ball(head, hair, 0, -.15, -.365, .36, .40, .13);
  }
  function arm(side, raised = false, outward = 0) {
    const pivot = group(torso, side < 0 ? 'left-shoulder' : 'right-shoulder', side * .31, .27, 0);
    const elbow = [side * (.16 + outward), -.29, .06];
    const handPos = raised ? [side * (.37 + outward), -.14, .27] : [side * (.26 + outward), -.55, .18];
    rod(pivot, coatColor, [0, 0, 0], elbow, .135);
    ball(pivot, coatColor, ...elbow, .132);
    rod(pivot, coatColor, elbow, handPos, .114);
    const wrist = handPos.map((v, n) => n === 1 ? v + .03 : v);
    ball(pivot, pale, ...wrist, .12, .085, .115);
    const hand = group(pivot, side < 0 ? 'left-hand' : 'right-hand', ...handPos);
    ball(hand, skin, 0, -.035, .025, .12, .135, .105);
    ball(hand, skin, -side * .075, .015, .10, .047, .065, .052);
    motion(pivot, raised ? .035 : .025, 1.4, 'z', side * .7);
    return hand;
  }
  const left = arm(-1, ['INTJ', 'INTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISFP', 'ESFP'].includes(info.type), .015);
  const right = arm(1, ['ENTJ', 'ENTP', 'INFJ', 'ENFJ', 'ENFP', 'ISTP', 'ISFP', 'ESFP'].includes(info.type), .015);
  function book(p, c = dark, w = .42, h = .50) {
    const b = group(p, 'book', 0, .13, .14); b.rotation.set(-.15, -.12, -.13);
    box(b, c, 0, 0, 0, w, h, .13, .022);
    box(b, cream, .014, 0, .072, w - .06, h - .065, .035, .008);
    box(b, c, 0, 0, .105, w, h, .023, .009);
    star(b, pale, 0, .035, .126, .11);
    box(b, color, .10, -.23, .133, .046, .12, .018, .004);
    return b;
  }
  function screen(p, w = .46, h = .55) {
    const s = group(p, 'terminal', 0, .18, .16); s.rotation.z = -.12;
    box(s, dark, 0, 0, 0, w, h, .085, .04);
    box(s, '#263d58', 0, .014, .048, w - .065, h - .08, .024, .016);
    return s;
  }
  function wrench(p) {
    const tool = group(p, 'wrench', 0, .25, .05); tool.rotation.z = -.22;
    box(tool, metal, 0, .08, 0, .08, .62, .09, .025, 'metal');
    const jaw = mesh(tool, new THREE.TorusGeometry(.125, .05, 5, 12, Math.PI * 1.50), metal, 0, .43, 0, 'metal'); jaw.rotation.z = -.8;
    box(tool, dark, 0, -.14, .003, .12, .23, .115, .025);
    return tool;
  }
  // Role-specific silhouette, outfit, prop, and expression details.
  switch (info.type) {
    case 'INTJ': {
      box(torso, dark, .21, -.44, .225, .15, .41, .08, .02);
      const plan = screen(left, .62, .48); plan.rotation.y = .1;
      for (let n = 0; n < 3; n++) box(plan, color, -.20 + n * .19, -.075 + n * .035, .066, .10, .12 + n * .07, .012, .005, 'glow');
      rod(plan, pale, [-.22, .16, .073], [.22, .16, .073], .012);
      const compass = group(right, 'compass', 0, .03, .08);
      rod(compass, metal, [0, .17, 0], [-.12, -.13, 0], .025, 'metal'); rod(compass, metal, [0, .17, 0], [.12, -.13, 0], .025, 'metal');
      ball(head, hair, .25, .35, .12, .23, .24, .31).rotation.z = -.4;
      break;
    }
    case 'INTP': {
      glasses(true);
      box(torso, dark, -.23, -.07, .26, .14, .18, .035, .015);
      rod(torso, color, [-.24, -.10, .29], [-.24, .08, .29], .019);
      const atom = group(left, 'atom', -.06, .43, .06);
      for (let n = 0; n < 3; n++) { const orbit = ring(atom, color, 0, 0, 0, .29, .013, 'metal'); orbit.rotation.set(n * .9, n * .72, n * .8); }
      ball(atom, pale, 0, 0, 0, .085, .085, .085, 'glow');
      ball(atom, '#ffd278', .28, 0, 0, .045);
      motion(atom, .30, .8, 'y');
      book(right, color, .28, .35);
      for (let n = 0; n < 3; n++) ball(head, hair, -.20 + n * .22, .49, -.1, .14, .18, .15);
      break;
    }
    case 'ENTJ': {
      cape(dark, .86);
      [-1, 1].forEach(s => box(torso, '#eddb9a', s * .32, .335, .015, .24, .085, .31, .025, 'metal'));
      shapeMesh(torso, [[-.055, .33], [.055, .33], [.045, .02], [0, -.055], [-.045, .02]], dark, 0, .03, .29, .025);
      rod(right, dark, [0, -.18, .06], [.1, .53, .06], .031); star(right, '#eddb9a', .105, .56, .06, .09);
      ball(head, hair, -.1, .52, -.02, .31, .19, .28).rotation.z = .18;
      break;
    }
    case 'ENTP': {
      for (let n = 0; n < 5; n++) { const spike = mesh(head, new THREE.ConeGeometry(.13, .34, 5), hair, -.32 + n * .16, .51 + (n % 2) * .06, -.03); spike.rotation.z = .35 - n * .17; }
      box(torso, dark, -.21, -.04, .272, .16, .25, .03, .015);
      wrench(left);
      const bulb = group(right, 'idea-bulb', .03, .35, .065);
      cylinder(bulb, metal, 0, -.11, 0, .07, .07, .17, 10, 'metal');
      ball(bulb, '#ffe4a2', 0, .06, 0, .18, .22, .18, 'glow');
      for (let n = 0; n < 3; n++) { const a = .4 + n * 1.1; rod(bulb, pale, [Math.cos(a) * .26, Math.sin(a) * .27, 0], [Math.cos(a) * .33, Math.sin(a) * .36, 0], .019); }
      motion(bulb, .13, 1.2, 'z'); break;
    }
    case 'INFJ': {
      cape(dark, .87); longHair();
      const hood = mesh(head, new THREE.SphereGeometry(1, 14, 12, 0, Math.PI * 2, 0, Math.PI * .60), dark, 0, .11, -.14); hood.scale.set(.565, .58, .51);
      // Front opening keeps face visible; lifted forehead rim frames the hair.
      const rim = ring(head, color, 0, .15, -.02, .50, .042); rim.scale.y = 1.10; rim.rotation.x = -.36;
      book(left, dark, .34, .43);
      rod(right, dark, [0, -.94, .04], [0, .74, .04], .035);
      const gem = mesh(right, new THREE.OctahedronGeometry(.19), pale, 0, .85, .04, 'glow'); gem.scale.y = 1.55;
      const halo = ring(right, color, 0, .84, .04, .26, .016, 'metal'); halo.rotation.y = .45;
      motion(gem, .25, .8); break;
    }
    case 'INFP': {
      longHair(); beret(dark); scarf(); book(left, dark, .43, .52);
      const dream = star(right, '#ffdfa1', .06, .44, .04, .20); dream.rotation.z = -.20; motion(dream, .18, 1.0, 'z');
      star(right, pale, .24, .67, .03, .065);
      rod(right, color, [0, 0, .04], [.04, .29, .04], .013);
      break;
    }
    case 'ENFJ': {
      cape(dark, .70);
      box(torso, dark, -.15, .08, .295, .095, .56, .03, .013).rotation.z = -.32;
      rod(right, metal, [0, -.45, .02], [0, .72, .02], .03, 'metal');
      heart(right, '#ffb7a9', 0, .85, .02, .22);
      const banner = shapeMesh(right, [[.04, .59], [.38, .54], [.34, .24], [.03, .30]], color, 0, 0, .02, .025, .01);
      star(banner, pale, .20, .42, .03, .06);
      book(left, cream, .29, .37);
      ball(head, hair, .05, .51, -.12, .32, .18, .30);
      break;
    }
    case 'ENFP': {
      headphones(); scarf();
      for (let n = 0; n < 3; n++) { const curl = ball(head, n === 1 ? '#f5a4bd' : hair, -.25 + n * .23, .53 + n % 2 * .08, -.04, .17, .21, .17); curl.rotation.z = -.2; }
      box(torso, dark, 0, .07, -.41, .56, .64, .28, .10);
      [-1, 1].forEach(s => { cylinder(torso, pale, s * .28, -.12, -.43, .11, .14, .48, 12, 'metal'); cylinder(torso, color, s * .28, -.38, -.43, .10, .07, .10, 12, 'glow'); });
      star(left, '#ffe59c', -.10, .47, .04, .22); star(right, pale, .06, .29, .04, .14);
      rod(left, dark, [0, 0, .04], [-.08, .31, .04], .025);
      break;
    }
    case 'ISTJ': {
      glasses();
      shapeMesh(torso, [[-.05, .31], [.05, .31], [.06, -.03], [0, -.10], [-.06, -.03]], dark, 0, .02, .285, .022);
      const board = screen(left, .46, .57);
      box(board, metal, 0, .28, .065, .20, .085, .055, .018, 'metal');
      for (let n = 0; n < 3; n++) {
        box(board, pale, .04, .13 - n * .13, .067, .19, .026, .01, .003);
        rod(board, color, [-.15, .13 - n * .13, .08], [-.12, .10 - n * .13, .08], .012); rod(board, color, [-.12, .10 - n * .13, .08], [-.07, .17 - n * .13, .08], .012);
      }
      rod(right, metal, [0, -.10, .05], [0, .22, .05], .022, 'metal'); break;
    }
    case 'ISFJ': {
      longHair();
      ball(head, hair, -.39, .24, -.23, .20, .21, .23); ball(head, hair, .39, .24, -.23, .20, .21, .23);
      box(head, pale, 0, .42, .15, .58, .075, .43, .025);
      const shield = group(left, 'heart-shield', -.02, .15, .18); shield.rotation.z = -.15;
      shapeMesh(shield, [[-.29, .27], [0, .36], [.29, .27], [.25, -.13], [0, -.36], [-.25, -.13]], dark, 0, 0, 0, .08, .025);
      shapeMesh(shield, [[-.235, .22], [0, .285], [.235, .22], [.20, -.105], [0, -.275], [-.20, -.105]], pale, 0, 0, .105, .02, .014);
      heart(shield, color, 0, .035, .15, .13);
      box(torso, dark, .38, -.31, .01, .28, .28, .28, .055); heart(torso, pale, .385, -.29, .158, .075);
      rod(torso, dark, [-.18, .35, .31], [.32, -.25, .31], .035); break;
    }
    case 'ESTJ': {
      cap();
      box(torso, dark, 0, .04, .242, .49, .51, .065, .03);
      for (let n = 0; n < 2; n++) box(torso, '#edd89f', -.17 + n * .34, .16, .29, .11, .035, .03, .005);
      const tablet = screen(left, .48, .40);
      for (let n = 0; n < 3; n++) box(tablet, color, -.14 + n * .13, -.035 + n * .035, .068, .066, .11 + n * .07, .012, .005, 'glow');
      box(right, dark, 0, .16, .09, .12, .32, .10, .025); rod(right, metal, [0, .3, .09], [0, .46, .09], .014);
      break;
    }
    case 'ESFJ': {
      longHair();
      box(torso, pale, 0, -.09, .275, .45, .62, .08, .035);
      box(torso, dark, 0, -.22, .322, .27, .20, .025, .012);
      heart(torso, color, 0, .05, .33, .09);
      const gift = group(left, 'gift', 0, .16, .16);
      box(gift, '#f7c6b9', 0, 0, 0, .40, .34, .34, .045);
      box(gift, pale, 0, .18, 0, .44, .08, .37, .02);
      box(gift, dark, 0, .025, .179, .07, .39, .025, .006);
      [-1, 1].forEach(s => { const bow = ring(gift, dark, s * .075, .275, 0, .078, .022); bow.scale.y = .65; bow.rotation.z = s * .45; });
      const cup = cylinder(right, pale, 0, .095, .08, .105, .08, .24, 16);
      ring(cup, dark, .11, .01, 0, .07, .02);
      star(head, color, -.39, .21, .26, .105); break;
    }
    case 'ISTP': {
      glasses(true, true);
      box(torso, dark, 0, .035, .245, .43, .45, .06, .025);
      [-1, 1].forEach(s => box(torso, dark, s * .14, .29, .25, .075, .26, .035, .015));
      for (let n = 0; n < 3; n++) box(torso, metal, -.24 + n * .15, -.27, .29, .07, .19, .08, .016, 'metal');
      wrench(right);
      box(left, dark, -.015, .08, .12, .28, .21, .17, .03);
      cylinder(left, metal, -.015, .08, .235, .063, .063, .06, 8, 'metal').rotation.x = Math.PI / 2;
      break;
    }
    case 'ISFP': {
      beret(dark); longHair();
      box(torso, pale, 0, -.045, .275, .46, .64, .065, .04);
      [[-.10, .1, '#ee9fbc'], [.10, -.13, '#89c6dc'], [-.08, -.24, '#85c49a']].forEach(([x, y, c]) => ball(torso, c, x, y, .316, .04, .055, .009));
      const paletteMesh = ball(left, '#ddac6f', -.04, .13, .17, .30, .22, .065); paletteMesh.rotation.z = -.25;
      for (let n = 0; n < 5; n++) { const a = .35 + n * .66; ball(left, ['#f2809c', '#89bffc', '#77d7ad', '#fff1bc', '#b89ce8'][n], -.04 + Math.cos(a) * .22, .13 + Math.sin(a) * .15, .238, .049, .044, .015); }
      rod(right, dark, [0, -.18, .04], [.08, .46, .04], .026);
      const brush = mesh(right, new THREE.ConeGeometry(.06, .18, 8), '#f2809c', .09, .52, .04); brush.rotation.z = -.12;
      break;
    }
    case 'ESTP': {
      box(torso, dark, -.2, .02, .28, .16, .43, .10, .03); box(torso, dark, .2, .02, .28, .16, .43, .10, .03);
      box(torso, pale, 0, .34, .20, .52, .10, .20, .03);
      glasses(true, true);
      ball(head, hair, -.12, .49, .02, .31, .23, .28).rotation.z = -.3;
      const board = group(left, 'hoverboard', -.06, -.04, .12); board.rotation.z = -.25;
      box(board, dark, 0, 0, 0, .33, 1.02, .12, .12);
      box(board, color, 0, 0, .071, .27, .90, .025, .10);
      star(board, pale, 0, .15, .09, .11);
      [-1, 1].forEach(s => {
        rod(board, metal, [-.22, s * .34, -.08], [.22, s * .34, -.08], .025);
        [-1, 1].forEach(w => { const wheel = cylinder(board, ink, w * .22, s * .34, -.08, .08, .08, .065, 12); wheel.rotation.z = Math.PI / 2; });
      });
      box(right, dark, 0, -.02, .055, .23, .13, .17, .025);
      break;
    }
    case 'ESFP': {
      headphones();
      for (let n = 0; n < 5; n++) ball(head, hair, -.31 + n * .15, .48 + (n % 2) * .08, .015, .15, .19, .18);
      [-1, 1].forEach(s => { const lapel = box(torso, pale, s * .19, .12, .292, .11, .40, .055, .02); lapel.rotation.z = s * -.25; });
      star(torso, '#e7a5d0', -.24, -.06, .327, .082);
      rod(right, dark, [0, -.15, .05], [.035, .27, .05], .045);
      ball(right, metal, .037, .34, .05, .105, .14, .105, 'metal');
      for (let n = 0; n < 3; n++) { const stripe = ring(right, dark, .037, .29 + n * .045, .05, .095, .008); stripe.rotation.x = Math.PI / 2; }
      star(left, pale, -.08, .36, .08, .16); star(left, '#f4b9d8', -.27, .62, .05, .095);
      motion(torso, .025, 2.0, 'z'); break;
    }
  }
  const initialTransforms = [];
  root.traverse(object => initialTransforms.push({ object, position: object.position.clone(), rotation: object.rotation.clone(), scale: object.scale.clone() }));
  let disposed = false;
  return {
    root, info,
    update(timeSeconds, { reducedMotion = false, celebrating = false } = {}) {
      if (disposed) return;
      // Reset first: absolute-time sampling stays deterministic, including switching motion off.
      for (const pose of initialTransforms) { pose.object.position.copy(pose.position); pose.object.rotation.copy(pose.rotation); pose.object.scale.copy(pose.scale); }
      if (reducedMotion) return;
      const t = Number.isFinite(timeSeconds) ? timeSeconds : 0;
      motions.forEach(fn => fn(t));
      torso.position.y = 1.34 + Math.sin(t * 1.8) * .012;
      head.position.y = 2.37 + Math.sin(t * 1.8) * .014;
      if (celebrating) {
        torso.rotation.z += Math.sin(t * 4) * .04;
        head.rotation.z += Math.sin(t * 4 + .2) * .07;
        left.parent.rotation.z -= .13; right.parent.rotation.z += .13;
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
      geometries.clear(); materials.clear(); cache.clear(); motions.length = 0;
      root.removeFromParent(); root.clear();
    },
  };
}
