import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pickStep } from '../js/perf.js';
import { PERF } from '../js/config.js';

describe('perf', () => {
  it('step 0 penuh seperti asli', () => {
    assert.equal(PERF.STEPS[0].PIXEL_CAP, 2);
    assert.equal(PERF.STEPS[0].SHADOW, 2048);
  });

  it('lag turun, lega naik', () => {
    assert.equal(pickStep(40, 0), 1);
    assert.equal(pickStep(59, 1), 0);
    assert.equal(pickStep(55, 1), 1);
  });

  it('mentok tidak jebol', () => {
    const last = PERF.STEPS.length - 1;
    assert.equal(pickStep(10, last), last);
    assert.equal(pickStep(99, 0), 0);
  });
});
