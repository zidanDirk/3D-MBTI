/** A local, pass-the-phone guessing game. Personality types are cosmetic only. */
export const duoDecks = Object.freeze([
  Object.freeze({ id: 'daily', name: '日常脑回路', description: '从周末到深夜消息，猜猜对方的小偏好。' }),
  Object.freeze({ id: 'travel', name: '出逃计划', description: '一起旅行时，你们会做出什么选择？' }),
  Object.freeze({ id: 'creative', name: '脑洞实验室', description: '跳进离谱情境，看看谁更懂对方的想象力。' }),
]);

const decks = {
  daily: [
    { id: 'daily-1', title: '突然多出一个完全自由的下午，你最想怎么过？', options: ['约个人出门逛逛', '独处，沉浸在自己的爱好里', '先放空，想到什么再做'], talk: '最近哪一次自由时间，让你觉得真正充满了电？' },
    { id: 'daily-2', title: '朋友发来“我有点烦”，你第一句更可能回复？', options: ['怎么了？我听着呢', '要不要一起想个解决办法？', '出来吃点好吃的吧'], talk: '心情不好时，你希望对方先陪伴、出主意，还是带你换个环境？' },
    { id: 'daily-3', title: '合租客厅空出一面墙，你想把它变成？', options: ['大家都能用的计划和留言板', '照片、海报和奇怪小物的展览', '留白就很好，看着舒服'], talk: '什么样的小角落会让一个地方变得像你的家？' },
    { id: 'daily-4', title: '你们一起点外卖，只能选一家，你更想？', options: ['选那家从没翻车的老店', '试试菜单看起来很新奇的新店', '轮到对方选，我都可以'], talk: '你在哪些事情上喜欢熟悉感，哪些事情上愿意冒险？' },
    { id: 'daily-5', title: '收到一个意料之外的小礼物，你最在意？', options: ['它刚好是我会用到的东西', '它藏着只有我们懂的小细节', '打开它的过程有惊喜感'], talk: '讲一个让你记住很久的礼物，它为什么特别？' },
    { id: 'daily-6', title: '周末聚会快结束了，但大家还没尽兴，你会？', options: ['发起下一站，今晚继续', '和最聊得来的人慢慢收尾', '按原计划回家，下次再约'], talk: '你通常怎么判断自己的社交电量还剩多少？' },
  ],
  travel: [
    { id: 'travel-1', title: '你们刚到陌生城市，行李放好后的第一站是？', options: ['预先收藏的招牌景点', '附近街巷，随便走走', '找家咖啡馆坐下观察这座城'], talk: '回想一次旅行，计划外的片段有没有成为你的最爱？' },
    { id: 'travel-2', title: '旅行当天突然下雨，你会提议？', options: ['切换到提前准备的室内路线', '穿上雨衣，继续原来的冒险', '留在住处聊天，今天慢下来'], talk: '计划被打乱时，什么会让你重新开心起来？' },
    { id: 'travel-3', title: '只能给这次旅行留下一种纪念，你选？', options: ['一张拍得很满意的合照', '一件当地的小手工艺品', '录下一段我们当时的声音'], talk: '照片、物件和声音，哪一种最容易把你带回某个瞬间？' },
    { id: 'travel-4', title: '路上发现一条没在地图上标注的小径，你更想？', options: ['确认安全和时间再决定', '在安全的范围内探索一下', '继续原路线，不想错过目的地'], talk: '对你来说，一次理想的冒险需要什么前提？' },
    { id: 'travel-5', title: '明天有三个体验只能选一个，你最想报名？', options: ['跟当地人学做一道菜', '去开阔的自然风景里徒步', '逛博物馆和独立小店'], talk: '如果可以带对方去你最喜欢的地方，你会选哪里？' },
    { id: 'travel-6', title: '旅程最后一晚，你最想如何收尾？', options: ['认真吃顿大餐，给这趟旅行庆功', '散步，聊聊这几天最喜欢的片段', '早睡，把精神留给回程'], talk: '你希望一次旅行结束后，留下什么感觉？' },
  ],
  creative: [
    { id: 'creative-1', title: '你获得一间只营业一天的神奇商店，你会卖？', options: ['能让人睡个好觉的云朵', '找回遗失灵感的玻璃瓶', '把尴尬瞬间变成笑话的糖果'], talk: '给这家店起个名字，并为对方挑一件商品。' },
    { id: 'creative-2', title: '如果日常生活能多一个游戏按钮，你想要？', options: ['存档：把美好的一刻留住', '暂停：获得十分钟安静时间', '随机：刷新一个有趣的小任务'], talk: '你会在今天的哪个时刻按下这个按钮？' },
    { id: 'creative-3', title: '你们的双人宇宙飞船缺一个房间，你会加？', options: ['看星星的透明穹顶', '什么都能修的工作间', '能种花做饭的温暖厨房'], talk: '如果要在飞船上待一个月，你们会怎样分配生活空间？' },
    { id: 'creative-4', title: '你的影子突然会说话，你觉得它第一句会说？', options: ['我有个超棒的新点子！', '慢一点，你已经很努力了', '走吧，带我去没去过的地方'], talk: '如果你替对方的影子说一句话，你会说什么？' },
    { id: 'creative-5', title: '城市举办一场奇怪比赛，你最想报名？', options: ['用纸箱造出最酷的机器人', '给路过的人编一个暖心故事', '十分钟设计一条欢乐障碍赛道'], talk: '你们组队时，各自最想负责哪个环节？' },
    { id: 'creative-6', title: '今天的故事结束了，片尾彩蛋会是？', options: ['隐藏线索，暗示下一次冒险', '一段大家笑场的幕后花絮', '安静的风景，配一句温柔的话'], talk: '为今天这场双人挑战设计一个你们自己的片尾彩蛋。' },
  ],
};
export const duoQuestions = Object.freeze(Object.fromEntries(Object.entries(decks).map(([id, questions]) => [id, Object.freeze(questions.map(question => Object.freeze({ ...question, options: Object.freeze(question.options) })))])));

const isType = type => typeof type === 'string' && /^[EI][NS][FT][JP]$/.test(type);
const validChoice = value => Number.isInteger(value) && value >= 0 && value < 3;
const isAnswer = value => value !== null && typeof value === 'object' && validChoice(value.self) && validChoice(value.prediction);
const hasDeck = id => typeof id === 'string' && Object.hasOwn(duoQuestions, id);
const clone = state => ({ ...state, types: [...state.types], answers: state.answers.map(({ a, b }) => ({ a: { ...a }, b: { ...b } })), pending: state.pending ? { ...state.pending } : null });

function validate(state) {
  if (!state || state.version !== 1 || !hasDeck(state.deckId) || !Array.isArray(state.types) || state.types.length !== 2 || !Array.from(state.types).every(isType) || !Number.isInteger(state.round) || ![0, 1].includes(state.player) || !Array.isArray(state.answers) || !Array.from(state.answers).every(row => row && isAnswer(row.a) && isAnswer(row.b))) throw new TypeError('无效的双人挑战状态');
  const count = duoQuestions[state.deckId].length;
  if (state.phase === 'complete') {
    if (state.round !== count || state.answers.length !== count || state.pending !== null || state.player !== 0) throw new TypeError('双人挑战尚未完整结束');
  } else if (state.phase === 'reveal') {
    if (state.round < 0 || state.round >= count || state.answers.length !== state.round + 1 || state.pending !== null || state.player !== 1) throw new TypeError('双方回答完成后才能揭晓');
  } else if (state.phase === 'handoff' || state.phase === 'answer') {
    if (state.round < 0 || state.round >= count || state.answers.length !== state.round || (state.player === 0 ? state.pending !== null : !isAnswer(state.pending))) throw new TypeError('无效的交接或回答状态');
  } else throw new TypeError('无效的双人挑战阶段');
}

export function newDuo(deckId = 'daily', types = ['ENFP', 'INTJ']) {
  if (!hasDeck(deckId) || !Array.isArray(types) || types.length !== 2 || !Array.from(types).every(isType)) throw new TypeError('请选择有效的主题和两个人格角色');
  return { version: 1, deckId, types: [...types], round: 0, phase: 'handoff', player: 0, answers: [], pending: null };
}

export function beginDuoTurn(state) {
  validate(state);
  if (state.phase !== 'handoff') throw new TypeError('只有交接后才能开始回答');
  return { ...clone(state), phase: 'answer' };
}

export function answerDuo(state, answer) {
  validate(state);
  if (state.phase !== 'answer' || !isAnswer(answer)) throw new TypeError('请在回答阶段完成自己的选择和对对方的预测');
  const next = clone(state);
  const submitted = { self: answer.self, prediction: answer.prediction };
  if (state.player === 0) return { ...next, player: 1, phase: 'handoff', pending: submitted };
  return { ...next, phase: 'reveal', pending: null, answers: [...next.answers, { a: { ...next.pending }, b: submitted }] };
}

export function nextDuoRound(state) {
  validate(state);
  if (state.phase !== 'reveal') throw new TypeError('揭晓之后才能进入下一轮');
  const round = state.round + 1;
  return { ...clone(state), round, player: 0, phase: round === duoQuestions[state.deckId].length ? 'complete' : 'handoff' };
}

/** Never infer compatibility from MBTI. Only compare choices actually submitted. */
export function duoSummary(state) {
  validate(state);
  const rows = state.answers.map(({ a, b }, index) => ({ question: duoQuestions[state.deckId][index], a: { ...a }, b: { ...b }, match: a.self === b.self, correctA: a.prediction === b.self, correctB: b.prediction === a.self }));
  return { rounds: rows.length, shared: rows.filter(row => row.match).length, correctA: rows.filter(row => row.correctA).length, correctB: rows.filter(row => row.correctB).length, totalPredictions: rows.length * 2, rows };
}
