// 本地规则生成的自我探索建议；不推断能力、健康状况或关系匹配度。
const poleNotes = {
  E: { strength: ['互动启动器', '这次选择显示，你常通过交流整理思路。可以把想法说出来，让同伴的反馈帮助你推进。'], blind: ['给安静留个位置', '连续交流后，试着独处十分钟，区分自己的判断与现场气氛带来的影响。'], work: '用短讨论打开思路，再记录独立判断。', relationship: '表达分享的愿望，也给对方暂时不回应的空间。', growth: ['尝试静音充电', '今天留出十分钟独处，不急着分享，记下你真正想继续做的一件事。'] },
  I: { strength: ['深度整理者', '这次选择显示，你常先在心里梳理，再表达观点。给自己准备时间，可以让重要想法更清楚。'], blind: ['让想法被看见', '思考完整之前也可以分享一个初步版本，并告诉同伴你还在探索。'], work: '先写下要点，再约定一个表达窗口。', relationship: '主动说明需要独处的时段，并约好重新连接的时间。', growth: ['分享一个初步想法', '把一条还没完全成形的想法发给信任的人，观察交流是否带来新线索。'] },
  S: { strength: ['现实线索捕手', '你在这些情境中更常关注具体事实与实际经验。把观察写成例子，有助于团队判断如何行动。'], blind: ['为新可能留白', '熟悉的经验有价值，也可以问一句：如果条件变了，还有什么不同解法？'], work: '提供具体案例，同时补一句它服务的整体目标。', relationship: '用具体行动表达关心，也听听对方对未来的想象。', growth: ['打开一个假设', '挑一件熟悉的小事，写出两种从未尝试的做法，再选一种小范围试试。'] },
  N: { strength: ['可能性连接者', '你在这些情境中更常寻找关联、意义与新方向。用图或比喻连接线索，可以帮助他人理解愿景。'], blind: ['让概念落到地面', '新的联想出现时，顺手补充一个具体例子、一个限制和一个可执行的小步骤。'], work: '先讲方向，再用一个真实例子确认大家理解一致。', relationship: '分享想象时，也问一句对方眼下具体需要什么。', growth: ['把灵感做成样本', '选一个最近的想法，用十五分钟做出草稿或例子，检验它是否像想象中那样可行。'] },
  T: { strength: ['判断路径整理者', '你在这些选择中常先关注证据、目标与一致标准。说明判断依据，能让讨论更容易继续。'], blind: ['把人的处境算进去', '给建议之前，先确认对方希望得到分析、陪伴还是协助，避免好意错过真正的需求。'], work: '写清决策标准，并补充相关人员受到的影响。', relationship: '先确认对方希望被倾听还是一起找办法，再提供你的分析。', growth: ['先问，再给建议', '在一次交流中先问“你希望我听听，还是一起想办法？”，记录对话有什么变化。'] },
  F: { strength: ['价值共鸣翻译者', '你在这些选择中常先考虑人的需要与价值。把这些关注说清楚，可以帮助团队理解决定的意义。'], blind: ['让边界同样清楚', '照顾他人时也写下自己的条件和限制；不同意某个安排，不等于否定一段关系。'], work: '明确共同价值，也给出可以比较的目标与限制。', relationship: '表达关心的同时，说出自己的需要，不让对方依靠猜测。', growth: ['练习温和的边界', '选择一件小事，用“我能做到的是……，目前做不到的是……”表达自己的实际范围。'] },
  J: { strength: ['节奏搭建者', '这次选择显示，你更喜欢明确安排与可见进度。把目标拆成步骤，有助于持续推进。'], blind: ['给变动留出缓冲', '计划里留一个可以调整的空档，并提前想好什么信息出现时值得改变路线。'], work: '设置清楚的节点，同时约定可调整的范围。', relationship: '讨论安排时说明你需要哪些确定信息，也留出双方同意的弹性。', growth: ['给计划留一个空格', '今天安排一段不预设任务的时间，看看临时出现的想法是否值得尝试。'] },
  P: { strength: ['现场适应者', '这次选择显示，你更喜欢保留选项并随信息调整。开放探索能帮助你发现原计划之外的机会。'], blind: ['给探索一个收口', '为开放任务定一个最小完成标准和决定时间，让可能性最终变成可分享的成果。'], work: '保留尝试空间，同时明确最后决定的时间。', relationship: '临时调整时及时说明，并共同确认不能变动的承诺。', growth: ['完成一个小闭环', '挑一件二十分钟以内的小事，先定义完成标准，再在约定时间内收尾。'] },
};

const dimensionNames = { EI: '能量方式', SN: '信息偏好', TF: '判断方式', JP: '行动节奏' };
const dimensions = Object.keys(dimensionNames);

function validateResult(result) {
  if (!result || !Array.isArray(result.percentages) || result.percentages.length !== 4 ||
      typeof result.type !== 'string' || !/^[EI][SN][TF][JP]$/.test(result.type)) {
    throw new TypeError('需要完整的四维测评结果。');
  }
  return dimensions.map((dimension) => {
    const matches = result.percentages.filter((p) => p && `${p.left}${p.right}` === dimension);
    const p = matches[0];
    if (matches.length !== 1 || !Number.isFinite(p.leftPercent) || p.leftPercent < 0 || p.leftPercent > 100) {
      throw new TypeError('维度数据无效。');
    }
    return { ...p, dimension, balanced: p.leftPercent === 50 };
  });
}

export function buildReport(result) {
  const percentages = validateResult(result);
  const notes = percentages.map(({ dimension, left, right, leftPercent, balanced }) => {
    if (balanced) return {
      strength: [`${dimensionNames[dimension]}：双向探索`, '这一维度的选择各占一半，当前没有明确偏向。你可以结合具体场景，观察两种方式分别何时更适合自己。'],
      blind: [`${dimensionNames[dimension]}：暂缓定型`, '暂时不把自己归到某一端。回想选择时的环境、角色与近期状态，寻找不同答案背后的条件。'],
      work: `在${dimensionNames[dimension]}上试用两种方式，以任务需要决定。`,
      relationship: `说明${dimensionNames[dimension]}会随场景变化，直接沟通当下需要。`,
      growth: [`观察${dimensionNames[dimension]}`, '选两个不同的生活场景，分别记录你自然采用的方式，以及它是否让你感到自在。'],
    };
    return poleNotes[leftPercent > 50 ? left : right];
  });
  const tied = percentages.filter((p) => p.balanced);
  return {
    summary: tied.length
      ? `本次结果在${tied.map((p) => dimensionNames[p.dimension]).join('、')}上持平；四字母代号仅作展示参考。以下建议依据各维度的选择生成，可用真实体验继续验证。`
      : `本次选择呈现 ${result.type} 倾向。以下内容是基于本次情境选择的探索建议；偏好不等同于能力，也不限制你尝试其他方式。`,
    strengths: notes.map((note) => ({ title: note.strength[0], body: note.strength[1] })),
    blindSpots: notes.map((note) => ({ title: note.blind[0], body: note.blind[1] })),
    work: { title: '协作实验室', body: notes.map((note) => note.work).join('') },
    relationships: { title: '沟通连接指南', body: notes.map((note) => note.relationship).join('') },
    growthPlan: [
      ...notes.map((note, index) => ({ day: index + 1, title: note.growth[0], body: note.growth[1] })),
      { day: 5, title: '换一个场景观察', body: '对比自己在熟人、陌生人或不同任务中的表现。写下一个和本次结果不完全相同的例子。' },
      { day: 6, title: '邀请一次具体反馈', body: '请信任的人描述一次与你合作顺畅的经历，关注实际行为，而不是请对方给你贴类型标签。' },
      { day: 7, title: '留下你的个人使用说明', body: '回顾这周，写下“让我有能量的事”“我需要的支持”和“下周想试的一步”。只保留对你有用的发现。' },
    ],
  };
}

export function compareResults(a, b) {
  const before = validateResult(a);
  const after = validateResult(b);
  return before.map((p, index) => ({
    dimension: p.dimension, left: p.left, right: p.right,
    before: p.leftPercent, after: after[index].leftPercent,
    delta: after[index].leftPercent - p.leftPercent,
  }));
}
