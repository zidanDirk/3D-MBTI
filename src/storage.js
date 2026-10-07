import { getQuestions, tiers } from './quiz.js';
export const STORAGE_KEY = 'inner-space-v2';
const fresh = () => ({ version: 2, drafts: {}, history: [], selectedTier: 'quick' });
const validAnswers = (answers, tierId, complete = false) => {
  if (!tiers.some(t => t.id === tierId) || !Array.isArray(answers)) return false;
  const items = getQuestions(tierId);
  return answers.length <= items.length && (!complete || answers.length === items.length) &&
    Array.from(answers).every((a, i) => items[i].options.some(o => o.value === a));
};
export function createStore(storage) {
  let state = fresh(), available = true;
  function persist() { try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { available = false; } }
  try {
    const raw = JSON.parse(storage.getItem(STORAGE_KEY));
    if (raw?.version === 2) {
      state.selectedTier = tiers.some(t => t.id === raw.selectedTier) ? raw.selectedTier : 'quick';
      for (const tier of tiers) {
        const d = raw.drafts?.[tier.id];
        if (d && validAnswers(d.answers, tier.id) && Number.isInteger(d.index) && d.index >= 0 && d.index <= d.answers.length && d.index < tier.count) state.drafts[tier.id] = { answers: [...d.answers], index: d.index };
      }
      const restoredIds = new Set();
      if (Array.isArray(raw.history)) state.history = raw.history.filter(r => r && typeof r.id === 'string' && /^[\w-]{1,80}$/.test(r.id) && validAnswers(r.answers, r.tierId, true) && typeof r.createdAt === 'string' && Number.isFinite(Date.parse(r.createdAt))).filter(r => { if (restoredIds.has(r.id)) return false; restoredIds.add(r.id); return true; }).slice(0,30).map(r => ({ id:r.id, tierId:r.tierId, answers:[...r.answers], createdAt:r.createdAt, growthDone: Array.isArray(r.growthDone) ? [...new Set(r.growthDone.filter(n => Number.isInteger(n) && n >= 1 && n <= 7))] : [] }));
    } else if (!raw) {
      const legacy = JSON.parse(storage.getItem('inner-space-progress-v1'));
      if (validAnswers(legacy, 'quick')) {
        if (legacy.length === 12) state.history.push({ id:'legacy-v1', tierId:'quick', answers:legacy, createdAt:new Date().toISOString(), growthDone:[] });
        else state.drafts.quick = { answers:legacy, index:legacy.length };
        persist();
      }
    }
  } catch { /* Corrupt or unavailable storage must not prevent play. */ }
  return {
    get available() { return available; },
    snapshot: () => structuredClone(state),
    selectTier(id) { if (!tiers.some(t=>t.id===id)) throw new TypeError('未知档位'); state.selectedTier=id;persist(); },
    saveDraft(tierId, answers, index) { if (!validAnswers(answers,tierId) || !Number.isInteger(index) || index<0 || index>answers.length || index>=getQuestions(tierId).length) throw new TypeError('无效进度'); state.drafts[tierId]={answers:[...answers],index};persist(); },
    clearDraft(id) { delete state.drafts[id];persist(); },
    complete(tierId, answers) { if (!validAnswers(answers,tierId,true)) throw new TypeError('请完成测评');const record={id:crypto.randomUUID(),tierId,answers:[...answers],createdAt:new Date().toISOString(),growthDone:[]};state.history.unshift(record);state.history=state.history.slice(0,30);delete state.drafts[tierId];persist();return structuredClone(record); },
    toggleGrowth(id,day) { const r=state.history.find(r=>r.id===id);if(!r||!Number.isInteger(day)||day<1||day>7)return;r.growthDone=r.growthDone.includes(day)?r.growthDone.filter(n=>n!==day):[...r.growthDone,day];persist(); },
    deleteRecord(id) { state.history=state.history.filter(r=>r.id!==id);persist(); },
  };
}
