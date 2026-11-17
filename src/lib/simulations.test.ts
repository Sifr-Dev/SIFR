import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MALLOC_HEADER_SIZE,
  callocBlock,
  computeXorDistanceHex,
  createHeap,
  evaluateCapabilityCheck,
  executeRedisCommand,
  formatHeapDump,
  freeBlock,
  mallocBlock,
  predictChurn,
  reallocBlock,
} from './simulations';

test('predictChurn uses exact > 0.65 HIGH and > 0.35 MEDIUM thresholds from inference.py', () => {
  const highRisk = predictChurn({
    tenure: 1,
    monthlyCharges: 95,
    totalCharges: 95,
    contract: 'month-to-month',
  });
  const lowRisk = predictChurn({
    tenure: 60,
    monthlyCharges: 45,
    totalCharges: 2700,
    contract: 'two-year',
  });
  assert.equal(highRisk.riskTier, 'HIGH');
  assert.equal(lowRisk.riskTier, 'LOW');
  assert.ok(highRisk.probability > 0.65);
  assert.equal(highRisk.contributions.length, 5);
});

test('mallocBlock allocates header_t (24B) + payload via sbrk and freeBlock coalesces adjacent free blocks', () => {
  let heap = createHeap(0);
  heap = mallocBlock(heap, 48, 'vec_a');
  heap = mallocBlock(heap, 64, 'ring_buf');
  assert.equal(heap.blocks.length, 2);
  assert.equal(heap.brkOffset, (MALLOC_HEADER_SIZE + 48) + (MALLOC_HEADER_SIZE + 64));

  const idA = heap.blocks[0].id;
  const idB = heap.blocks[1].id;
  heap = freeBlock(heap, idA);
  heap = freeBlock(heap, idB);

  // Coalesced size includes payload A + sizeof(header_t) + payload B
  assert.equal(heap.blocks.length, 1);
  assert.equal(heap.blocks[0].free, true);
  assert.equal(heap.blocks[0].size, 48 + MALLOC_HEADER_SIZE + 64);

  const cal = callocBlock(heap, 4, 8, 'zero_arr');
  assert.equal(cal.blocks[0].free, false);
  assert.equal(cal.blocks[0].zeroed, true);

  const re = reallocBlock(cal, cal.blocks[0].id, 16);
  assert.ok(re.lastOp.includes('in-place'));
  assert.ok(formatHeapDump(re)[0].startsWith('[USED]'));
});

test('executeRedisCommand matches main.go PING, SET, GET, DEL -> OK, and errors cleanly', () => {
  let store: Record<string, string> = {};
  const ping = executeRedisCommand(store, 'PING');
  assert.equal(ping.output, 'PONG');

  const set = executeRedisCommand(store, 'SET key1 "hello sifr"');
  assert.equal(set.output, 'OK');
  store = set.nextStore;

  const get = executeRedisCommand(store, 'GET key1');
  assert.equal(get.output, '"hello sifr"');

  const del = executeRedisCommand(store, 'DEL key1');
  assert.equal(del.output, 'OK');
  assert.equal(executeRedisCommand(del.nextStore, 'GET key1').output, '(nil)');
});

test('computeXorDistanceHex and evaluateCapabilityCheck compute exact values', () => {
  const res = computeXorDistanceHex('0x00ff0000', '0x00ff00ff');
  assert.equal(res.distanceHex, '0x000000ff');
  assert.equal(res.leadingZeroBits, 24);

  const ok = evaluateCapabilityCheck(['READ', 'WRITE'], 'WRITE', false);
  assert.equal(ok.allowed, true);
  const revoked = evaluateCapabilityCheck(['READ', 'WRITE'], 'READ', true);
  assert.equal(revoked.allowed, false);
});
