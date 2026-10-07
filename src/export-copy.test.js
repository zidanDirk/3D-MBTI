import test from 'node:test';
import assert from 'node:assert/strict';
import {getCardCopy} from './export-copy.js';
import {getQuestions,calculateResult} from './quiz.js';
test('balanced report exports remain visibly provisional',()=>{const qs=getQuestions('standard'),r=calculateResult(qs.map((q,i)=>q.options[i%2].value),qs);const copy=getCardCopy(r);assert.equal(copy.type,'INFP*');assert.match(copy.description,/没有明确偏向/);assert.match(copy.footer,/临时参考/);assert.doesNotMatch(copy.description,/你倾向/);});
test('decisive report exports keep the actual profile',()=>{const qs=getQuestions('quick'),r=calculateResult(qs.map(q=>q.options[0].value),qs);const copy=getCardCopy(r);assert.equal(copy.type,r.type);assert.equal(copy.description,r.description);});
