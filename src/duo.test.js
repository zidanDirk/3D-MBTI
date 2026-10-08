import test from 'node:test';
import assert from 'node:assert/strict';
import { duoDecks, duoQuestions, newDuo, beginDuoTurn, answerDuo, nextDuoRound, duoSummary } from './duo.js';

function round(state, a, b) {
  return answerDuo(beginDuoTurn(answerDuo(beginDuoTurn(state), a)), b);
}
function complete(a, b, deckId = 'daily') {
  let state = newDuo(deckId);
  for (let i = 0; i < 6; i++) state = nextDuoRound(round(state, a, b));
  return state;
}

test('three immutable decks contain eighteen original playable prompts', () => {
  assert.deepEqual(duoDecks.map(deck => deck.id), ['daily', 'travel', 'creative']);
  const questions = Object.values(duoQuestions).flat();
  assert.equal(questions.length, 18);
  assert.equal(new Set(questions.map(q => q.id)).size, 18);
  assert.equal(new Set(questions.map(q => q.title)).size, 18);
  for (const q of questions) {
    assert.equal(q.options.length, 3);
    assert.equal(new Set(q.options).size, 3);
    assert.ok(q.talk.length > 10);
  }
  assert.throws(() => duoQuestions.daily[0].options.push('oops'), TypeError);
});

test('handoff hides A until B submits, and transitions never mutate inputs', () => {
  const types = ['ENFP', 'INTJ'];
  const initial = newDuo('daily', types);
  types[0] = 'ISTJ';
  assert.equal(initial.types[0], 'ENFP');
  const initialSnapshot = structuredClone(initial);
  const first = beginDuoTurn(initial);
  const submission = { self: 1, prediction: 2 };
  const handoff = answerDuo(first, submission);
  submission.self = 0;
  assert.deepEqual(initial, initialSnapshot);
  assert.equal(first.phase, 'answer');
  assert.equal(handoff.phase, 'handoff');
  assert.equal(handoff.player, 1);
  assert.equal(handoff.pending.self, 1);
  assert.equal(handoff.answers.length, 0);
  assert.equal(duoSummary(handoff).rows.length, 0);
  assert.throws(() => nextDuoRound(handoff), TypeError);
  assert.throws(() => answerDuo(handoff, { self: 0, prediction: 0 }), TypeError);
  const second = beginDuoTurn(handoff);
  const reveal = answerDuo(second, { self: 2, prediction: 1 });
  assert.equal(reveal.phase, 'reveal');
  assert.equal(reveal.pending, null);
  assert.equal(reveal.answers.length, 1);
  assert.deepEqual(duoSummary(reveal), { rounds: 1, shared: 0, correctA: 1, correctB: 1, totalPredictions: 2, rows: [{ question: duoQuestions.daily[0], a: { self: 1, prediction: 2 }, b: { self: 2, prediction: 1 }, match: false, correctA: true, correctB: true }] });
  const next = nextDuoRound(reveal);
  next.answers[0].a.self = 0;
  assert.equal(reveal.answers[0].a.self, 1);
  assert.equal(next.round, 1);
  assert.equal(next.phase, 'handoff');
  assert.equal(next.player, 0);
});

test('all decks finish at six rounds with exact shared and prediction totals', () => {
  for (const { id } of duoDecks) {
    const perfect = complete({ self: 2, prediction: 2 }, { self: 2, prediction: 2 }, id);
    assert.equal(perfect.phase, 'complete');
    assert.equal(perfect.round, 6);
    const summary = duoSummary(perfect);
    assert.equal(summary.rounds, 6);
    assert.equal(summary.shared, 6);
    assert.equal(summary.correctA, 6);
    assert.equal(summary.correctB, 6);
    assert.equal(summary.totalPredictions, 12);
    for (const operation of [beginDuoTurn, nextDuoRound, s => answerDuo(s, { self: 1, prediction: 1 })]) assert.throws(() => operation(perfect), TypeError);
  }
  const none = duoSummary(complete({ self: 0, prediction: 0 }, { self: 1, prediction: 1 }));
  assert.equal(none.shared, 0);
  assert.equal(none.correctA, 0);
  assert.equal(none.correctB, 0);
  let mixed = newDuo();
  for (let i = 0; i < 6; i++) mixed = nextDuoRound(round(mixed, { self: 0, prediction: i % 2 }, { self: i % 2, prediction: i % 3 }));
  const summary = duoSummary(mixed);
  assert.equal(summary.shared, 3);
  assert.equal(summary.correctA, 6);
  assert.equal(summary.correctB, 2);
  const otherTypes = duoSummary({ ...mixed, types: ['ISTJ', 'ESTP'] });
  assert.deepEqual(summary, otherTypes);
});

test('invalid and incomplete submissions, malformed state, and repeated transitions are rejected', () => {
  for (const deck of ['constructor', 'missing', '', null]) assert.throws(() => newDuo(deck), TypeError);
  for (const types of [Array(2), [], ['ENFP'], ['enfp', 'INTJ'], ['XXXX', 'INTJ'], null]) assert.throws(() => newDuo('daily', types), TypeError);
  const state = newDuo();
  const answering = beginDuoTurn(state);
  for (const answer of [undefined, null, {}, { self: 0 }, { prediction: 1 }, { self: -1, prediction: 0 }, { self: 3, prediction: 0 }, { self: 1.5, prediction: 1 }, { self: 1, prediction: '2' }]) assert.throws(() => answerDuo(answering, answer), TypeError);
  assert.throws(() => beginDuoTurn(answering), TypeError);
  assert.throws(() => nextDuoRound(answering), TypeError);
  const reveal = round(state, { self: 0, prediction: 1 }, { self: 1, prediction: 0 });
  assert.throws(() => answerDuo(reveal, { self: 0, prediction: 0 }), TypeError);
  for (const malformed of [null, {}, { ...state, round: -1 }, { ...state, round: 6 }, { ...state, round: 1 }, { ...state, player: 2 }, { ...state, player: 1 }, { ...state, pending: { self: 1, prediction: 0 } }, { ...state, phase: 'reveal' }, { ...state, phase: 'complete' }, { ...state, answers: [{ a: {}, b: {} }] }, { ...state, round: 1, answers: Array(1) }]) {
    for (const operation of [beginDuoTurn, nextDuoRound, duoSummary, s => answerDuo(s, { self: 0, prediction: 0 })]) assert.throws(() => operation(malformed), TypeError);
  }
});
