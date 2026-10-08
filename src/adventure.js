import { characterTypes } from './characters.js';

const resourceNames = { energy: '电量', signal: '信号', bond: '同行' };
function choice(text, next, feedback, effects = {}, extra = {}) {
  const cost = { energy: 0, ...extra.cost };
  const changes = Object.entries(resourceNames).flatMap(([key, label]) => {
    const delta = (effects[key] || 0) - (cost[key] || 0);
    return delta ? [`${label} ${delta > 0 ? '+' : ''}${delta}`] : [];
  });
  const requirements = Object.entries(extra.requires || {}).map(([key, value]) => key === 'items' ? `持有${value.join('、')}` : `${resourceNames[key]} ≥ ${value}`);
  return { text, next, feedback, effects, ...extra, cost, hint: [...changes, ...(extra.addItems || []).map(item => `获得${item}`), ...requirements].join(' · ') || '无消耗' };
}

export const endings = [
  { id: 'ending-signal', title: '点亮整座夜城', description: '你把收集的频率送上天线。远处楼宇逐一回应，今晚的星光成了所有人的公共频道。' },
  { id: 'ending-together', title: '屋顶星光派对', description: '你邀请一路遇见的伙伴登上屋顶。有人带来音乐，有人打开便当，流星雨有了许多共同见证的人。' },
  { id: 'ending-secret', title: '月背秘密航线', description: '星图中的隐藏坐标终于亮起。你用最后一段助推抵达无人站台，发现一片从未被记录的蓝色星海。' },
  { id: 'ending-sunrise', title: '把黎明带回家', description: '你把飞船停在日出最早经过的地方。一杯热饮、一张照片，这趟没有标准答案的夜航也值得珍藏。' },
];

export const adventureNodes = {
  departure: {
    id: 'departure', title: '最后一班夜航', scene: '零点码头', speakerType: 'ENFP',
    description: '流星雨即将经过霓虹城。你的微型飞船只有 4 格电，导航频率还没接通。码头的向导递来两条路线：走屋顶，还是穿过夜市？',
    options: [
      choice('飞向屋顶，追踪广播', 'rooftop', '你升上屋顶，收到一段清晰的广播。', { signal: 2 }, { cost: { energy: 1 } }),
      choice('步行穿过夜市，找人问路', 'market', '摊主们指向市场深处，也记住了你的目的地。', { bond: 1 }),
    ],
  },
  rooftop: {
    id: 'rooftop', title: '风里的呼号', scene: '天线屋顶', speakerType: 'INTJ',
    description: '广播员正在调整一座旧天线。另一端的空中花园里，有人用灯串拼出星座。两边都能通往码头，却会带来不同的收获。',
    options: [
      choice('帮忙接通中继站', 'relay', '天线转向了中继站，你抄下新的频率。', { signal: 2 }, { cost: { energy: 1 } }),
      choice('绕去花园，加入观星小队', 'garden', '花园里的伙伴替你留了位置。', { bond: 2 }),
    ],
  },
  market: {
    id: 'market', title: '星图与热可可', scene: '夜市长街', speakerType: 'ESFP',
    description: '修理摊的桌上压着一张旧星图。街角有人招募观星同伴。你的飞船可以在此补能，也可以先去结识新朋友。',
    options: [
      choice('到工坊换电，带上旧星图', 'workshop', '修理师给你换上电池，并把星图当作旅途礼物。', { energy: 2 }, { addItems: ['星图'] }),
      choice('带着热可可走进花园', 'garden', '一杯热可可打开了话题，观星小队决定与你同行。', { bond: 2 }),
    ],
  },
  relay: {
    id: 'relay', title: '断线的灯塔', scene: '旧中继站', speakerType: 'INTP',
    description: '灯塔只差一次供电就能完整解码。维护员也知道一条不耗电的隧道，愿意陪你走过潮湿的地下通路。',
    options: [
      choice('给灯塔供电，完整解码', 'ferry', '完整频率已记录。渡轮会带你经过水上天线。', { signal: 2 }, { cost: { energy: 1 } }),
      choice('和维护员一起走隧道', 'tunnel', '你收起电缆，和新伙伴走向地下入口。', { bond: 2 }),
    ],
  },
  garden: {
    id: 'garden', title: '一盏灯的距离', scene: '悬空花园', speakerType: 'INFP',
    description: '小队用花灯标记星星。你可以帮他们完成灯阵、把约定带到渡轮，也可以借便携接收机探索地下信号。',
    options: [
      choice('帮小队挂好灯阵，约定集合', 'ferry', '大家约好在最高的天文台再次见面。', { bond: 2 }),
      choice('借接收机去探测隧道', 'tunnel', '接收机亮起，你听见地下传来的回声。', { signal: 2 }, { cost: { energy: 1 } }),
    ],
  },
  workshop: {
    id: 'workshop', title: '地图背面的坐标', scene: '机修工坊', speakerType: 'ISTP',
    description: '星图背面藏着一串暗码。修理师提出两种改装：加装接收器追踪它，或留出空间搭载他的旅行朋友。',
    options: [
      choice('加装接收器，寻找暗码来源', 'tunnel', '接收器将暗码转为两个稳定的频段。', { signal: 2 }, { cost: { energy: 1 } }),
      choice('空出副驾驶，一起搭渡轮', 'ferry', '新伙伴登上副驾驶，顺手帮你整理了航线。', { bond: 2 }),
    ],
  },
  ferry: {
    id: 'ferry', title: '渡轮上的交换', scene: '夜色水道', speakerType: 'ESFJ',
    description: '渡轮慢慢穿过发光水道。甲板上有一个空闲充电口，船员则在收集观星者的留言。天文台已经出现在前方。',
    options: [
      choice('利用航程充电', 'observatory', '靠岸时，飞船补足了两格电。', { energy: 2 }),
      choice('录一段留言，邀请更多人', 'observatory', '船员把你的邀请播给下一班乘客。', { bond: 2 }),
    ],
  },
  tunnel: {
    id: 'tunnel', title: '地下的星空', scene: '荧光隧道', speakerType: 'ENTP',
    description: '隧道墙上投着一幅废弃航线图。扫描它能找到新频率；沿着应急指示灯缓慢前进，则可以用滑行补回一些电量。',
    options: [
      choice('扫描墙面的旧航线', 'observatory', '屏幕上多了一条穿过城市的隐藏频率。', { signal: 2 }, { cost: { energy: 1 } }),
      choice('关闭动力，顺坡滑行', 'observatory', '你轻巧地驶出隧道，并回收了一格电。', { energy: 1 }),
    ],
  },
  observatory: {
    id: 'observatory', title: '流星倒计时', scene: '城市天文台', speakerType: 'INFJ',
    description: '距离流星雨只剩一分钟。登上发射台前，你还有一次准备的机会：让信号更强、把大家召集起来，或者给远航留足电量。',
    options: [
      choice('用电池增幅广播', 'launch', '广播增幅完成，远处传来清晰的回应。', { signal: 2 }, { cost: { energy: 1 } }),
      choice('发出最后一轮集合邀请', 'launch', '旅途中的伙伴沿着灯光赶来了。', { bond: 2 }),
      choice('在备用插座补能', 'launch', '备用电源让你可以更从容地决定终点。', { energy: 2 }),
    ],
  },
  launch: {
    id: 'launch', title: '你想留下怎样的夜晚？', scene: '星光发射台', speakerType: 'ENFJ',
    description: '流星已出现在地平线上。检查手上的电量、信号与同行者，选择这一次夜航的结尾。每一种结局都值得收藏，重来可以走另一条路。',
    options: [
      choice('向全城广播流星雨', 'ending-signal', '夜城的灯光接住了你的频率。', {}, { requires: { signal: 4 } }),
      choice('和伙伴开一场屋顶派对', 'ending-together', '所有人的倒数声汇成同一个瞬间。', {}, { requires: { bond: 4 } }),
      choice('按星图驶向秘密坐标', 'ending-secret', '飞船驶离主航道，蓝色星海在窗外展开。', {}, { cost: { energy: 2 }, requires: { items: ['星图'] } }),
      choice('停下来，安静迎接日出', 'ending-sunrise', '你关掉导航，把这一刻留给自己。'),
    ],
  },
  ...Object.fromEntries(endings.map(ending => [ending.id, { ...ending, scene: '夜航纪念', speakerType: 'ISFP', options: [] }])),
};

// Each route is replayable; personality is cosmetic and never changes costs or outcomes.
export function newAdventure(type = 'ENFP') {
  if (!characterTypes.includes(type)) throw new RangeError('未知的角色类型');
  return { version: 1, type, path: [], nodeId: 'departure', energy: 4, signal: 0, bond: 0, items: [], status: 'playing' };
}
export function getAdventureNode(state) {
  return adventureNodes[state?.nodeId] || null;
}
export function canChooseAdventure(state, index) {
  if (state?.status !== 'playing') return { allowed: false, reason: '本次夜航已经结束' };
  const option = getAdventureNode(state)?.options[index];
  if (!Number.isInteger(index) || !option) return { allowed: false, reason: '请选择有效路线' };
  for (const [key, amount] of Object.entries(option.cost)) {
    if (state[key] < amount) return { allowed: false, reason: `${resourceNames[key]}不足，需要 ${amount}` };
  }
  for (const [key, amount] of Object.entries(option.requires || {})) {
    if (key === 'items') {
      if (amount.some(item => !state.items.includes(item))) return { allowed: false, reason: `需要${amount.join('、')}` };
    } else if (state[key] < amount) return { allowed: false, reason: `需要${resourceNames[key]} ≥ ${amount}` };
  }
  return { allowed: true, reason: '' };
}
export function chooseAdventure(state, index) {
  const { allowed, reason } = canChooseAdventure(state, index);
  if (!allowed) throw new RangeError(reason);
  const option = getAdventureNode(state).options[index];
  const next = { ...state, path: [...state.path, { node: state.nodeId, choice: index }], nodeId: option.next, items: [...new Set([...state.items, ...(option.addItems || [])])] };
  for (const key of Object.keys(resourceNames)) next[key] += (option.effects[key] || 0) - (option.cost[key] || 0);
  next.status = endings.some(ending => ending.id === next.nodeId) ? 'complete' : 'playing';
  return next;
}
export function adventureSummary(state) {
  if (state?.status !== 'complete') return null;
  const ending = endings.find(item => item.id === state.nodeId);
  if (!ending) return null;
  const route = state.path.map(step => adventureNodes[step.node].scene).join(' → ');
  return { ...ending, highlight: `${route}｜余电 ${state.energy} · 信号 ${state.signal} · 同行 ${state.bond}` };
}
export function restoreAdventure(raw) {
  try {
    if (!raw || raw.version !== 1 || !characterTypes.includes(raw.type) || !Array.isArray(raw.path) || raw.path.length > 6) return null;
    let replay = newAdventure(raw.type);
    for (const step of raw.path) {
      if (!step || step.node !== replay.nodeId || !Number.isInteger(step.choice)) return null;
      replay = chooseAdventure(replay, step.choice);
    }
    for (const key of ['nodeId', 'energy', 'signal', 'bond', 'status']) if (raw[key] !== replay[key]) return null;
    if (!Array.isArray(raw.items) || JSON.stringify(raw.items) !== JSON.stringify(replay.items)) return null;
    return replay;
  } catch { return null; }
}
