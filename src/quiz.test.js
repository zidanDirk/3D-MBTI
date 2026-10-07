import test from 'node:test';
import assert from 'node:assert/strict';
import { questions, worlds, calculateResult } from './quiz.js';

test('all first and all second choices produce the correct poles', () => {
  const first = calculateResult(questions.map((q) => q.options[0].value));
  const second = calculateResult(questions.map((q) => q.options[1].value));
  assert.equal(first.type, 'ESTJ');
  assert.equal(second.type, 'INFP');
  assert.deepEqual(first.percentages.map((p) => p.leftPercent), [100, 100, 100, 100]);
  assert.deepEqual(second.percentages.map((p) => p.leftPercent), [0, 0, 0, 0]);
});

test('mixed answers are scored within their own dimension', () => {
  const result = calculateResult(['E', 'I', 'E', 'N', 'S', 'N', 'F', 'T', 'F', 'J', 'P', 'J']);
  assert.equal(result.type, 'ENFJ');
  assert.deepEqual(result.percentages.map((p) => p.leftPercent), [67, 33, 33, 67]);
});

test('every one of the sixteen types has a complete result', () => {
  for (let mask = 0; mask < 16; mask += 1) {
    const letters = worlds.map((w, index) => w.dimension[(mask >> index) & 1]);
    const result = calculateResult(questions.map((q) => letters[worlds.findIndex((w) => w.dimension === q.dimension)]));
    assert.equal(result.type, letters.join(''));
    assert.ok(result.name && result.tagline && result.description && result.color);
    assert.equal(result.tags.length, 3);
  }
});

test('incomplete and invalid answers are rejected', () => {
  for (const answers of [undefined, null, 'ESTJ', [], Array(12), Array(11).fill('E'), Array(13).fill('E'), Array(12).fill('X')]) {
    assert.throws(() => calculateResult(answers), TypeError);
  }
  const misplaced = questions.map((q) => q.options[0].value);
  misplaced[0] = 'S';
  assert.throws(() => calculateResult(misplaced), TypeError);
});

test('tiers are balanced, nested, independent and have unique scenarios', async () => {
  const { tiers, getQuestions, questionBank } = await import('./quiz.js');
  assert.deepEqual(tiers.map((tier) => tier.count), [12, 32, 60]);
  assert.equal(questionBank.length, 60);
  assert.equal(new Set(questionBank.map((q) => q.id)).size, 60);
  assert.equal(new Set(questionBank.map((q) => q.title)).size, 60);
  for (const tier of tiers) {
    const items = getQuestions(tier.id);
    assert.equal(items.length, tier.count);
    for (const { dimension } of worlds) {
      assert.equal(items.filter((q) => q.dimension === dimension).length, tier.count / 4);
      assert.deepEqual(items.filter((q) => q.dimension === dimension).slice(0, 3).map((q) => q.id), questions.filter((q) => q.dimension === dimension).map((q) => q.id));
    }
    assert.equal(calculateResult(items.map((q) => q.options[0].value), items).type, 'ESTJ');
    assert.equal(calculateResult(items.map((q) => q.options[1].value), items).type, 'INFP');
    assert.equal(calculateResult(items.map((q) => q.options[0].value), items).questionCount, tier.count);
  }
  const copy = getQuestions('quick');
  copy[0].options[0].text = 'changed';
  assert.notEqual(getQuestions('quick')[0].options[0].text, 'changed');
  assert.throws(() => getQuestions('missing'), TypeError);
});

test('equal standard scores are explicitly provisional, with right-pole display fallback', async () => {
  const { getQuestions } = await import('./quiz.js');
  const items = getQuestions('standard');
  const result = calculateResult(items.map((q, index) => q.options[index % 2].value), items);
  assert.equal(result.type, 'INFP');
  assert.equal(result.provisional, true);
  assert.deepEqual(result.tieDimensions, ['EI', 'SN', 'TF', 'JP']);
  assert.ok(result.percentages.every((p) => p.balanced && p.leftPercent === 50));
  const mixed = items.map((q, index) => q.options[q.dimension === 'EI' ? index % 2 : 0].value);
  assert.deepEqual(calculateResult(mixed, items).tieDimensions, ['EI']);
  assert.equal(calculateResult(questions.map((q) => q.options[0].value)).provisional, false);
});

test('profile lookup returns all types and rejects unknown keys', async () => {
  const { getProfile } = await import('./quiz.js');
  for (let mask = 0; mask < 16; mask += 1) {
    const type = worlds.map((w, i) => w.dimension[(mask >> i) & 1]).join('');
    assert.equal(getProfile(type).type, type);
    assert.equal(getProfile(type).tags.length, 3);
  }
  for (const type of ['XXXX', '', 'constructor', null, undefined]) assert.throws(() => getProfile(type), TypeError);
  const profile = getProfile('ENFP');
  profile.tags[0] = 'changed';
  assert.notEqual(getProfile('ENFP').tags[0], 'changed');
});

test('custom question sets must be complete and balanced', () => {
  for (const items of [null, [], questions.slice(1), [...questions.slice(0, 11), questions[0]]]) {
    assert.throws(() => calculateResult([], items), TypeError);
  }
});
