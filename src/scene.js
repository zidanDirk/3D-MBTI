import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// The four playable districts share a compact procedural material and geometry kit.
export function createWorld(container, { onSelect = () => {} } = {}) {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.domElement.setAttribute('aria-label', '拖动旋转赛博人格宇宙，点击四座悬浮城市探索人格维度');
  container.appendChild(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(33, 1, .1, 100);
  camera.position.set(9, 9.27, 13.32);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, .15, 0);
  controls.enableDamping = true;
  controls.dampingFactor = .06;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = .65;
  controls.maxPolarAngle = 1.13;
  controls.minAzimuthAngle = -.4;
  controls.maxAzimuthAngle = 1.05;
  controls.update();
  scene.add(new THREE.HemisphereLight(0xb6d8ff, 0x202644, 2.6));
  const key = new THREE.DirectionalLight(0xf0f5ff, 3.5);
  key.position.set(-6, 13, 8); scene.add(key);
  const rimLight = new THREE.DirectionalLight(0x9679ff, 4);
  rimLight.position.set(4, 4, -8); scene.add(rimLight);
  const world = new THREE.Group(); scene.add(world);
  const palette = ['#caff48', '#ad87ff', '#ff73c6', '#66e6ff'];
  const materials = new Map();
  function mat(color, glow = false) {
    const id = `${color}:${glow}`;
    if (!materials.has(id)) materials.set(id, glow
      ? new THREE.MeshBasicMaterial({ color, toneMapped: false })
      : new THREE.MeshStandardMaterial({ color, roughness: .46, metalness: .42 }));
    return materials.get(id);
  }
  function mesh(geometry, color, parent, x = 0, y = 0, z = 0, glow = false) {
    const m = new THREE.Mesh(geometry, mat(color, glow));
    m.position.set(x, y, z); parent.add(m); return m;
  }
  const box = (p, c, x, y, z, w, h, d, glow = false) => mesh(new THREE.BoxGeometry(w, h, d), c, p, x, y, z, glow);
  const cyl = (p, c, x, y, z, rt, rb, h, n = 48, glow = false) => mesh(new THREE.CylinderGeometry(rt, rb, h, n), c, p, x, y, z, glow);
  const ball = (p, c, x, y, z, r, sx = 1, sy = 1, sz = 1, glow = false) => {
    const m = mesh(new THREE.SphereGeometry(r, 24, 16), c, p, x, y, z, glow); m.scale.set(sx, sy, sz); return m;
  };
  const capsule = (p, c, x, y, z, r, h) => mesh(new THREE.CapsuleGeometry(r, h, 5, 16), c, p, x, y, z);
  const ring = (p, c, x, y, z, r, tube = .018, arc = Math.PI * 2) => mesh(new THREE.TorusGeometry(r, tube, 7, 80, arc), c, p, x, y, z, true);
  const animations = [];
  function animate(object, fn) { object.userData.dynamic = true; animations.push({ object, fn }); return object; }
  function line(p, color, points, opacity = 1) {
    const material = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity, toneMapped: false });
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(v => new THREE.Vector3(...v))), material);
    // Decorative traces must not enlarge the districts' pointer hit areas.
    l.raycast = () => {};
    p.add(l); return l;
  }
  function floorRing(p, c, r, y, tube = .018) { const m = ring(p, c, 0, y, 0, r, tube); m.rotation.x = -Math.PI / 2; return m; }
  function antenna(p, x, z, h, color) {
    cyl(p, '#36465f', x, .3 + h / 2, z, .025, .045, h, 8);
    ball(p, color, x, .3 + h, z, .055, 1, 1, 1, true);
    const r = ring(p, color, x, .16 + h, z, .14, .014); r.rotation.x = Math.PI / 2;
  }
  function cyberTree(p, x, z, s = 1) {
    const g = new THREE.Group(); g.position.set(x, .26, z); g.scale.setScalar(s); p.add(g);
    cyl(g, '#47556a', 0, .42, 0, .04, .07, .84, 8);
    for (let i = 0; i < 3; i++) {
      mesh(new THREE.ConeGeometry(.34 - i * .055, .45, 5), ['#397776', '#729547', '#94b852'][i], g, 0, .68 + i * .23, 0);
      const r = ring(g, '#caff48', 0, .46 + i * .23, 0, .32 - i * .055, .012); r.rotation.x = Math.PI / 2;
    }
  }
  const defs = [
    { p: [-.45, .08, .8], r: 2.03, index: 0 },
    { p: [-3.5, .75, -1.6], r: 1.28, index: 2 },
    { p: [1.25, 1.23, -2.4], r: 1.5, index: 1 },
    { p: [3.4, -.02, .75], r: 1.17, index: 3 },
  ];
  const islands = defs.map((d) => {
    const p = new THREE.Group(); p.position.set(...d.p); p.userData.index = d.index; p.userData.baseY = d.p[1]; world.add(p);
    const c = palette[d.index];
    cyl(p, '#151e32', 0, -.26, 0, d.r, d.r * .79, .84, 12);
    cyl(p, '#465572', 0, .12, 0, d.r, d.r, .12, 12);
    cyl(p, '#202c42', 0, .22, 0, d.r * .985, d.r, .1, 12);
    cyl(p, '#0e172d', 0, -.73, 0, d.r * .54, d.r * .26, .24, 12);
    floorRing(p, c, d.r * .945, .275, .019);
    floorRing(p, c, d.r * .57, -.68, .017);
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * Math.PI * 2;
      const tick = box(p, c, Math.cos(a) * d.r * .84, .282, Math.sin(a) * d.r * .84, .1, .012, .035, true); tick.rotation.y = -a;
      if (k % 2 === 0) {
        const panel = box(p, '#080f20', Math.cos(a) * d.r * .92, -.17, Math.sin(a) * d.r * .92, .29, .15, .03); panel.rotation.y = Math.PI / 2 - a;
        const inset = box(p, c, Math.cos(a) * d.r * .931, -.17, Math.sin(a) * d.r * .931, .15, .028, .032, true); inset.rotation.y = Math.PI / 2 - a;
      }
    }
    for (let k = -2; k <= 2; k++) {
      const z = k * d.r * .26; const x = Math.sqrt(d.r * d.r * .62 - z * z);
      line(p, '#4a6480', [[-x, .279, z], [x, .279, z]], .3);
      line(p, '#4a6480', [[z, .279, -x], [z, .279, x]], .3);
    }
    const selectedRing = floorRing(p, '#ffffff', d.r * 1.04, .31, .023);
    selectedRing.visible = false; selectedRing.userData.dynamic = true; p.userData.rim = selectedRing;
    return p;
  });
  const forest = islands[0];
  cyberTree(forest, -1.08, -.62, 1.08); cyberTree(forest, -.35, -1.23, 1.26); cyberTree(forest, .9, -.92, .85); cyberTree(forest, -1.4, .27, .64);
  [[.87, -.2], [1.06, .2], [.91, .6], [.55, .94], [.1, 1.2], [-.4, 1.41]].forEach(([x, z], i) => {
    const p = box(forest, '#caff48', x, .29, z, .23, .023, .12, true); p.rotation.y = -.35 - i * .22;
  });
  antenna(forest, 1.39, .02, 1.14, '#caff48');
  // Ivory armor, graphite joints, headphones, a cobalt visor and an asymmetric tool.
  const robot = new THREE.Group(); robot.position.set(-.12, .28, .29); robot.rotation.y = .36; forest.add(robot);
  [-1, 1].forEach(side => {
    capsule(robot, '#26334a', side * .19, .25, 0, .115, .18);
    box(robot, '#dce4e9', side * .19, .12, .065, .25, .16, .34);
    box(robot, '#caff48', side * .19, .105, .241, .16, .027, .02, true);
  });
  capsule(robot, '#dce4e9', 0, .61, 0, .3, .22);
  box(robot, '#283851', 0, .63, .275, .33, .24, .05);
  box(robot, '#caff48', -.065, .68, .31, .15, .032, .025, true);
  box(robot, '#66e6ff', .08, .59, .31, .04, .065, .025, true);
  capsule(robot, '#304563', 0, .61, -.28, .24, .22);
  for (const side of [-1, 1]) {
    const arm = capsule(robot, '#bac9d8', side * .36, .62 + (side > 0 ? .12 : 0), 0, .105, .23); arm.rotation.z = side > 0 ? -.8 : -.35;
    ball(robot, '#35465f', side * .38, .45 + (side > 0 ? .32 : 0), .025, .11);
  }
  ball(robot, '#e4eaf1', 0, 1.11, 0, .395);
  ball(robot, '#153256', 0, 1.13, .275, .302, 1, .74, .52);
  const visor = ring(robot, '#66e6ff', 0, 1.13, .352, .259, .015); visor.scale.y = .69;
  box(robot, '#66e6ff', -.096, 1.13, .437, .07, .031, .012, true);
  box(robot, '#66e6ff', .096, 1.13, .437, .07, .031, .012, true);
  [-1, 1].forEach(side => {
    const ear = cyl(robot, '#34445e', side * .381, 1.12, 0, .115, .115, .09, 20); ear.rotation.z = Math.PI / 2;
    const light = cyl(robot, '#caff48', side * .434, 1.12, 0, .073, .073, .015, 20, true); light.rotation.z = Math.PI / 2;
  });
  box(robot, '#caff48', 0, 1.487, -.06, .09, .018, .18, true);
  const tablet = box(robot, '#314d64', .57, .85, .14, .23, .32, .05); tablet.rotation.z = -.35;
  const tabletScreen = box(robot, '#66e6ff', .57, .85, .171, .17, .23, .012, true); tabletScreen.rotation.z = -.35;

  // Empathy: two relay towers hold a levitating heart above a digital bridge.
  const empathy = islands[1];
  for (const x of [-.78, .78]) {
    cyl(empathy, '#303d58', x, .58, -.2, .14, .2, .6, 8);
    cyl(empathy, '#ff73c6', x, .87, -.2, .15, .15, .042, 8, true);
    antenna(empathy, x, -.2, .96, '#ff73c6');
  }
  for (let i = 0; i < 7; i++) {
    const b = box(empathy, '#52617e', (i - 3) * .21, .35 + Math.sin(i / 6 * Math.PI) * .16, .4, .18, .07, .51); b.rotation.z = Math.cos(i / 6 * Math.PI) * .16;
    box(empathy, '#ff73c6', (i - 3) * .21, .39 + Math.sin(i / 6 * Math.PI) * .16, .65, .13, .015, .02, true);
  }
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, -.34); heartShape.bezierCurveTo(-.7, .05, -.4, .6, 0, .29); heartShape.bezierCurveTo(.4, .6, .7, .05, 0, -.34);
  const heart = mesh(new THREE.ExtrudeGeometry(heartShape, { depth: .1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .045, bevelThickness: .045, curveSegments: 20 }), '#ff73c6', empathy, 0, 1.24, -.27, true);
  heart.scale.setScalar(.8); heart.rotation.y = .6;
  animate(heart, t => { heart.rotation.y = .6 + Math.sin(t * .65) * .22; heart.position.y = 1.24 + Math.sin(t * 1.1) * .04; });
  const empathyHalo = floorRing(empathy, '#ff73c6', .51, .56, .012); empathyHalo.position.z = -.27;

  // Intuition: a segmented portal with suspended orbital geometry.
  const intuition = islands[2];
  cyl(intuition, '#3d4567', 0, .34, -.25, .87, .96, .15, 12);
  const gate = mesh(new THREE.TorusGeometry(.74, .095, 8, 64), '#596281', intuition, 0, 1.17, -.25); gate.rotation.y = .1;
  ring(intuition, '#ad87ff', 0, 1.17, -.15, .742, .026);
  const innerGate = ring(intuition, '#66e6ff', 0, 1.17, -.14, .58, .016, Math.PI * 1.55);
  animate(innerGate, t => { innerGate.rotation.z = t * .27; });
  const portalCore = mesh(new THREE.OctahedronGeometry(.23), '#ad87ff', intuition, 0, 1.17, -.16, true);
  animate(portalCore, t => { portalCore.rotation.set(t * .35, t * .65, .35); });
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4; const t = box(intuition, '#ad87ff', Math.cos(a) * .83, 1.17 + Math.sin(a) * .83, -.23, .055, .12, .08, true); t.rotation.z = a - Math.PI / 2;
  }
  for (let i = 0; i < 3; i++) {
    const crystal = mesh(new THREE.OctahedronGeometry(.21 + .035 * i), ['#706fbb', '#8982d5', '#9ca9e7'][i], intuition, -.87 + i * .17, .63 + i * .1, -.49 - i * .13); crystal.scale.set(.75, 1.7, .75); crystal.rotation.z = .18 - i * .17;
  }
  for (let i = 0; i < 4; i++) box(intuition, '#ad87ff', .05 + i * .16, .287, .5 + i * .15, .29, .012, .065, true);
  antenna(intuition, .92, .29, .79, '#ad87ff');

  // Structure: a miniature night city with distinct roofs, facade strips and windows.
  const city = islands[3];
  [[-.44, -.26, .39, 1.06], [.02, -.45, .38, 1.53], [.48, -.1, .37, .83]].forEach(([x, z, w, h], k) => {
    box(city, ['#465572', '#344b65', '#677085'][k], x, .29 + h / 2, z, w, h, w);
    box(city, '#25344f', x, .3 + h, z, w + .07, .09, w + .07);
    box(city, '#66e6ff', x - w / 2 + .02, .3 + h / 2, z + w / 2 + .008, .021, h * .91, .012, true);
    for (let row = 0; row < Math.floor(h / .2); row++) for (let col = 0; col < 2; col++) {
      if ((row + col + k) % 4 === 0) continue;
      box(city, row % 3 === 0 ? '#ad87ff' : '#66e6ff', x - .07 + col * .14, .42 + row * .2, z + w / 2 + .014, .06, .078, .018, true);
      box(city, '#66e6ff', x + w / 2 + .013, .42 + row * .2, z - .07 + col * .14, .018, .078, .06, true);
    }
    box(city, '#172139', x, .39 + h, z, .16, .12, .2);
    antenna(city, x, z, h + .31, '#66e6ff');
  });
  for (let i = 0; i < 5; i++) box(city, '#66e6ff', -.58 + i * .29, .281, .47, .12, .012, .03, true);
  box(city, '#34455e', -.71, .42, .17, .16, .29, .19);
  box(city, '#caff48', -.71, .48, .275, .095, .08, .014, true);

  // Thin orbital lines and one batched starfield preserve crispness without bloom passes.
  for (let orbit = 0; orbit < 2; orbit++) {
    const points = [];
    for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2; points.push([Math.cos(a) * (4.8 + orbit * .25), -.95 + Math.sin(a * 2) * .2, Math.sin(a) * (3.1 + orbit * .25)]); }
    line(world, orbit ? '#6a5595' : '#5a829b', points, orbit ? .21 : .36);
  }
  const dustPositions = [], dustColors = [];
  for (let i = 0; i < 120; i++) {
    const a = i * 2.399963; const r = 3 + (i % 31) / 14;
    dustPositions.push(Math.cos(a) * r, -.8 + Math.sin(i * 13.2) * 1.3, Math.sin(a) * r * .64);
    const c = new THREE.Color(palette[i % 4]); dustColors.push(c.r, c.g, c.b);
  }
  const dustGeometry = new THREE.BufferGeometry(); dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3)); dustGeometry.setAttribute('color', new THREE.Float32BufferAttribute(dustColors, 3));
  world.add(new THREE.Points(dustGeometry, new THREE.PointsMaterial({ size: .027, vertexColors: true, transparent: true, opacity: .64, toneMapped: false })));
  for (let i = 0; i < 7; i++) {
    const a = i * 2.39; const shard = mesh(new THREE.OctahedronGeometry(.06 + i % 3 * .02), palette[i % 4], world, Math.cos(a) * 4.1, .5 + Math.sin(i) * 1.1, Math.sin(a) * 2.8, true);
    animate(shard, t => { shard.rotation.set(t * .3 + i, t * .2, i); });
  }

  // Merge static mesh details by material inside each district. Animated parts keep their pivots.
  islands.forEach(p => {
    p.updateMatrixWorld(true); const inverse = p.matrixWorld.clone().invert(); const batches = new Map(); const originals = [];
    p.traverse(o => {
      if (!o.isMesh) return;
      for (let parent = o; parent !== p; parent = parent.parent) if (parent.userData.dynamic) return;
      const geometries = batches.get(o.material) || [];
      const g = o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, o.matrixWorld));
      geometries.push(g.toNonIndexed ? (g.index ? g.toNonIndexed() : g) : g);
      if (g.index) g.dispose();
      batches.set(o.material, geometries); originals.push(o);
    });
    for (const [material, geometries] of batches) {
      const merged = mergeGeometries(geometries, false);
      if (merged) p.add(new THREE.Mesh(merged, material));
      geometries.forEach(g => g.dispose());
    }
    originals.forEach(o => { o.removeFromParent(); o.geometry.dispose(); });
  });

  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  let pointerStart = null, selected = -1, reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches, disposed = false, frame, last = performance.now(), motionTime = 0;
  controls.enableDamping = !reduced;
  function hit(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1); raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(islands, true); if (!hits.length) return -1;
    let o = hits[0].object; while (o.parent && o.parent !== world) o = o.parent; return o.userData.index ?? -1;
  }
  const down = e => { pointerStart = { x: e.clientX, y: e.clientY }; };
  const up = e => { if (pointerStart && Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) < 8) { const i = hit(e); if (i >= 0) { select(i); onSelect(i); } } pointerStart = null; };
  const move = e => { renderer.domElement.style.cursor = hit(e) >= 0 ? 'pointer' : 'grab'; };
  const cancel = () => { pointerStart = null; };
  renderer.domElement.addEventListener('pointercancel', cancel);
  renderer.domElement.addEventListener('pointerdown', down); renderer.domElement.addEventListener('pointerup', up); renderer.domElement.addEventListener('pointermove', move);
  const burstGeometry = new THREE.OctahedronGeometry(.05);
  const burst = new THREE.InstancedMesh(burstGeometry, mat('#ffffff', true), 64); burst.visible = false; burst.frustumCulled = false; world.add(burst);
  const burstData = []; const dummy = new THREE.Object3D(); let burstLife = 0;
  function celebrate() {
    if (reduced) return;
    burstData.length = 0; burstLife = 1; burst.visible = true;
    for (let i = 0; i < 64; i++) { burstData.push({ position: new THREE.Vector3(0, 1.5, 0), velocity: new THREE.Vector3((Math.random() - .5) * 5, Math.random() * 3.5 + 1, (Math.random() - .5) * 5) }); burst.setColorAt(i, new THREE.Color(palette[i % 4])); }
    burst.instanceColor.needsUpdate = true;
  }
  function select(i) { selected = ((i % 4) + 4) % 4; islands.forEach(g => { g.userData.rim.visible = g.userData.index === selected; }); }
  let visible = true;
  function resize() { visible = container.clientWidth > 0; const w = container.clientWidth || 800, h = container.clientHeight || 550; renderer.setSize(w, h); camera.aspect = w / h; camera.fov = w / h < 1.05 ? 40 : 33; camera.updateProjectionMatrix(); }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  function tick(now) {
    if (disposed) return;
    const dt = Math.min((now - last) / 1000, .034); last = now;
    if (!reduced) {
      motionTime += dt;
      islands.forEach((g, i) => { g.position.y = g.userData.baseY + Math.sin(motionTime * .65 + i * 1.4) * .065; });
      animations.forEach(({ fn }) => fn(motionTime));
      if (burstLife > 0) {
        burstLife -= dt * .65;
        burstData.forEach((p, i) => { p.velocity.y -= dt * 2.6; p.position.addScaledVector(p.velocity, dt); dummy.position.copy(p.position); dummy.scale.setScalar(Math.max(0, burstLife)); dummy.rotation.set(motionTime + i, motionTime * 2, i); dummy.updateMatrix(); burst.setMatrixAt(i, dummy.matrix); });
        burst.instanceMatrix.needsUpdate = true; if (burstLife <= 0) burst.visible = false;
      }
    }
    if (visible) { controls.update(); renderer.render(scene, camera); } frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  return {
    select, celebrate,
    setReducedMotion(value) { reduced = Boolean(value); controls.enableDamping = !reduced; if (reduced) { burst.visible = false; burstLife = 0; islands.forEach(g => { g.position.y = g.userData.baseY; }); } },
    getDiagnostics() { return { drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, selected, dpr: renderer.getPixelRatio(), postPasses: 0 }; },
    dispose() { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); renderer.domElement.removeEventListener('pointercancel', cancel); renderer.domElement.removeEventListener('pointerdown', down); renderer.domElement.removeEventListener('pointerup', up); renderer.domElement.removeEventListener('pointermove', move); const geometries = new Set(), usedMaterials = new Set(materials.values()); scene.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) usedMaterials.add(o.material); }); geometries.forEach(g => g.dispose()); usedMaterials.forEach(m => m.dispose()); renderer.dispose(); renderer.domElement.remove(); },
  };
}
