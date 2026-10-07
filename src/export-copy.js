export function getCardCopy(result) {
  const provisional = result.provisional;
  return {
    type: result.type + (provisional ? '*' : ''),
    name: provisional ? '均衡探索者 · 暂定类型' : result.name,
    description: provisional
      ? `本次 ${result.tieDimensions.join(' / ')} 维度的两端选择各占一半，没有明确偏向。四字母代号仅作临时参考，请结合下面的维度比例观察自己。`
      : result.description,
    footer: provisional ? '维度持平 · 类型仅为临时参考 · 非心理诊断' : '本轮选择倾向 · 不构成心理诊断',
  };
}
