import test from 'node:test';
import assert from 'node:assert/strict';
import { createExample, formatAmount } from '../../src/scripts/modules/example-state.js';
test('lunch is charged once; reset starts a new cycle', () => {
 const example = createExample(120000,35000);
 assert.equal(example.amount,120000); assert.equal(example.fraction,1);
 assert.equal(example.spend(),true);
 for (let i=0;i<100;i++) assert.equal(example.spend(),false);
 assert.equal(example.amount,85000); assert.equal(example.fraction,85/120);
 assert.equal(example.reset(),true); assert.equal(example.reset(),false);
 assert.equal(example.amount,120000); assert.equal(example.spend(),true); assert.equal(example.amount,85000);
});
test('rupiah labels match the specified convention', () => { assert.deepEqual([120000,35000,85000].map(formatAmount),['Rp120.000','Rp35.000','Rp85.000']); });
test('invalid examples fail locally', () => { for (const values of [[-1,1],[100,101],[100,0],[NaN,1],[100,1.5]]) assert.throws(() => createExample(...values)); });
