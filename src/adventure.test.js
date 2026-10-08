import test from 'node:test';
import assert from 'node:assert/strict';
import { newAdventure, getAdventureNode, chooseAdventure, canChooseAdventure, adventureSummary, restoreAdventure, endings, adventureNodes } from './adventure.js';

function walk(state, visit) {
  visit(state);
  if (state.status === 'complete') return;
  getAdventureNode(state).options.forEach((_, index) => {
    if (canChooseAdventure(state, index).allowed) walk(chooseAdventure(state, index), visit);
  });
}

test('all routes terminate in six choices, never softlock, and reach four distinct endings', () => {
  const reached = new Set(), nodes = new Set(); let complete = 0;
  walk(newAdventure(), state => {
    nodes.add(state.nodeId);
    assert.ok(state.path.length <= 6);
    for (const key of ['energy', 'signal', 'bond']) assert.ok(Number.isInteger(state[key]) && state[key] >= 0);
    assert.deepEqual(restoreAdventure(JSON.parse(JSON.stringify(state))), state);
    if (state.status === 'complete') {
      complete++; reached.add(state.nodeId);
      assert.equal(state.path.length, 6);
      assert.equal(adventureSummary(state).id, state.nodeId);
      assert.equal(canChooseAdventure(state, 0).allowed, false);
    } else {
      const node = getAdventureNode(state);
      assert.ok(node.options.some((_, i) => canChooseAdventure(state, i).allowed), node.id);
      assert.equal(adventureSummary(state), null);
      for (const option of node.options) assert.ok(adventureNodes[option.next]);
    }
  });
  assert.deepEqual([...reached].sort(), endings.map(ending => ending.id).sort());
  assert.equal(nodes.size, Object.keys(adventureNodes).length);
  assert.ok(complete > 50);
});

test('choices are immutable and reject invalid indices, unavailable items and exhausted battery', () => {
  const start = newAdventure('INTJ'), snapshot = structuredClone(start);
  chooseAdventure(start, 0);
  assert.deepEqual(start, snapshot);
  for (const index of [-1, 8, 0.5, '0', NaN]) assert.throws(() => chooseAdventure(start, index));
  const exhausted = { ...start, energy: 0 };
  assert.equal(canChooseAdventure(exhausted, 0).allowed, false);
  assert.throws(() => chooseAdventure(exhausted, 0), /电量不足/);
  assert.equal(canChooseAdventure(exhausted, 1).allowed, true);
  let launch = start;
  for (const index of [0, 0, 0, 0, 2]) launch = chooseAdventure(launch, index);
  assert.equal(launch.nodeId, 'launch');
  assert.equal(canChooseAdventure(launch, 2).allowed, false);
  assert.match(canChooseAdventure(launch, 2).reason, /星图/);
  assert.equal(canChooseAdventure(launch, 3).allowed, true);
});

test('saved journeys are replayed rather than trusting forged resources, routes or endings', () => {
  let state = newAdventure();
  for (const index of [1, 0, 0]) state = chooseAdventure(state, index);
  for (const patch of [{energy: 999}, {signal: -1}, {bond: 9}, {version: 2}, {type: 'AAAA'}, {nodeId: 'ending-secret'}, {status: 'complete'}, {items: ['星图', '外挂']}, {path: []}, {path: [{node:'departure',choice:99}]}]) {
    assert.equal(restoreAdventure({ ...state, ...patch }), null);
  }
  for (const malformed of [null, undefined, '', [], {}, {version:1,type:'ENFP',path: Array(7).fill({node:'departure',choice:0})}]) assert.equal(restoreAdventure(malformed), null);
  const restored = restoreAdventure(state);
  restored.items.push('test'); restored.path[0].choice = 0;
  assert.deepEqual(state.items, ['星图']);
  assert.equal(state.path[0].choice, 1);
});

test('persona selection is cosmetic and every displayed tradeoff reflects its resource change', () => {
  const a = chooseAdventure(newAdventure('ENTJ'), 0), b = chooseAdventure(newAdventure('INFP'), 0);
  assert.deepEqual({ ...a, type: '' }, { ...b, type: '' });
  assert.throws(() => newAdventure('oops'));
  for (const node of Object.values(adventureNodes)) for (const option of node.options) {
    for (const [key, label] of Object.entries({energy:'电量', signal:'信号', bond:'同行'})) {
      const delta = (option.effects[key] || 0) - (option.cost[key] || 0);
      if (delta) assert.ok(option.hint.includes(`${label} ${delta > 0 ? '+' : ''}${delta}`));
    }
    for (const item of option.addItems || []) assert.ok(option.hint.includes(item));
  }
});
