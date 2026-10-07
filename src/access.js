// The preview grants feature access, not a paid entitlement. Production grants must come
// from an authenticated server and report endpoints must enforce them independently.
export const premiumFeatures = [
  { id:'deep-report', name:'深度人格报告', description:'优势、盲区与工作 / 关系偏好' },
  { id:'growth-plan', name:'7 日成长计划', description:'把自我理解变成每天的小行动' },
  { id:'history-compare', name:'人格变化对比', description:'跨次记录，观察四维选择变化' },
  { id:'report-export', name:'完整报告导出', description:'下载 HTML 报告，打印或保存 PDF' },
];
export function createAccessClient(loadEntitlements) {
  return {
    async getAccess() {
      if (!loadEntitlements) return { mode:'preview', features:premiumFeatures.map(f=>f.id), paid:false };
      const remote = await loadEntitlements();
      if (!remote || !Array.isArray(remote.features)) throw new Error('无法获取会员权益');
      return { mode:'server', features:remote.features.filter(id=>premiumFeatures.some(f=>f.id===id)), paid:remote.paid===true };
    },
  };
}
