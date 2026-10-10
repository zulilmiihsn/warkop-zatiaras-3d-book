import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createState, goPage, setZoom, clampPan, resetView } from '../js/controls.js';
import { BOOK, ZOOM } from '../js/config.js';
import { clamp } from '../js/textures.js';

describe('controls', () => {
  it('clamp batas', () => {
    assert.equal(clamp(9, 0, 4), 4);
    assert.equal(clamp(-2, 0, 4), 0);
  });

  it('pindah halaman dalam 0..4', () => {
    const s = createState();
    goPage(s, 99);
    assert.equal(s.target, BOOK.LEAF_COUNT);
    goPage(s, -99);
    assert.equal(s.target, 0);
  });

  it('zoom kejepit + reset', () => {
    const s = createState();
    setZoom(s, 99);
    assert.equal(s.zoomTarget, ZOOM.MAX);
    s.panTX = 99;
    clampPan(s);
    assert.ok(Number.isFinite(s.panTX));
    resetView(s);
    assert.equal(s.zoomTarget, 1);
    assert.equal(s.panTX, 0);
  });
});
