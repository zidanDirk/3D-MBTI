import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateResult, getQuestions, questions } from './quiz.js';
import { buildReport, compareResults } from './reports.js';

const first = calculateResult(questions.map((q) => q.options[0].value));
const second = calculateResult(questions.map((q) => q.options[1].value));

test('reports vary by dimension preferences and contain a seven day plan', () => {
  const a = buildReport(first);
  const b = buildReport(second);
  assert.equal(a.strengths.length, 4);
  assert.equal(a.blindSpots.length, 4);
  assert.deepEqual(a.growthPlan.map((day) => day.day), [1, 2, 3, 4, 5, 6, 7]);
  assert.notEqual(a.work.body, b.work.body);
  assert.notEqual(a.relationships.body, b.relationships.body);
  for (let i = 0; i < 4; i++) {
    assert.notEqual(a.strengths[i].body, b.strengths[i].body);
    assert.notEqual(a.growthPlan[i].body, b.growthPlan[i].body);
  }
  assert.match(a.summary, /偏好不等同于能力/);
});

test('balanced dimensions get neutral exploration guidance', () => {
  const items = getQuestions('standard');
  const result = calculateResult(items.map((q, i) => q.options[i % 2].value), items);
  const report = buildReport(result);
  assert.match(report.summary, /持平/);
  assert.ok(report.strengths.every((item) => item.title.includes('双向探索')));
});

test('comparison shows percentage point change, never a compatibility score', () => {
  const comparison = compareResults(first, second);
  assert.deepEqual(comparison[0], { dimension: 'EI', left: 'E', right: 'I', before: 100, after: 0, delta: -100 });
  assert.ok(compareResults(first, first).every((item) => item.delta === 0));
  assert.equal(comparison.length, 4);
  assert.deepEqual(Object.keys(comparison[0]), ['dimension', 'left', 'right', 'before', 'after', 'delta']);
});

test('report and comparison reject malformed persisted results', () => {
  for (const value of [null, {}, { type: 'ESTJ', percentages: [] }, { ...first, percentages: first.percentages.map((p) => ({ ...p, leftPercent: NaN })) }, { ...first, percentages: Array(4).fill(first.percentages[0]) }]) {
    assert.throws(() => buildReport(value), TypeError);
    assert.throws(() => compareResults(value, first), TypeError);
    assert.throws(() => compareResults(first, value), TypeError);
  }
});
