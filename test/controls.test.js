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

  it('pindah halaman bingkai ulang, mentok tidak reset', () => {
    const s = createState();
    setZoom(s, 2);
    s.panTX = 1;
    goPage(s, 1);
    assert.equal(s.target, 1);
    assert.equal(s.zoomTarget, 1);
    assert.equal(s.panTX, 0);
    setZoom(s, 2);
    goPage(s, 99);
    assert.equal(s.target, BOOK.LEAF_COUNT);
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
