import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SIGNAL_TOPICS,
  buildSignalMailto,
  generateDispatchReceiptId,
  validateSignalPayload,
} from './signal';
import {
  REPO_BENCHMARKS,
  computeSpeedupRatio,
  getBenchmarkForRepo,
} from '../data/benchmarks';
import { REPOSITORIES } from '../data/repos';

test('validateSignalPayload and buildSignalMailto format verified direct dispatch envelopes', () => {
  const invalid = validateSignalPayload({
    senderName: 'A',
    senderEmail: 'not-an-email',
    topic: SIGNAL_TOPICS[0],
    message: 'short',
  });
  assert.equal(invalid.valid, false);

  const payload = {
    senderName: 'Elena Vance',
    senderEmail: 'elena@systems.dev',
    topic: SIGNAL_TOPICS[2],
    message: 'Interested in post-quantum handshake review and kernel architecture collaboration.',
  };
  assert.equal(validateSignalPayload(payload).valid, true);

  const mailto = buildSignalMailto(payload);
  assert.ok(mailto.startsWith('mailto:mohamedabdullahsalahi@gmail.com?subject='));
  assert.ok(mailto.includes('Elena%20Vance'));

  const receipt = generateDispatchReceiptId(payload);
  assert.match(receipt, /^SIFR-[0-9A-F]{8}$/);
});

test('all 12 repositories have valid benchmark specifications and speedup ratios', () => {
  for (const repo of REPOSITORIES) {
    const bench = getBenchmarkForRepo(repo.id);
    assert.ok(bench.metricLabel.length > 5);
    assert.ok(REPO_BENCHMARKS[repo.id], `Missing benchmark entry for ${repo.id}`);
    const ratio = computeSpeedupRatio(bench.baselineValue, bench.sifrValue, bench.lowerIsBetter);
    assert.ok(ratio > 1, `Expected speedup > 1x for ${repo.id}, got ${ratio}`);
  }
});
