import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BOOK, IMAGE_FILES, IMAGE_INDEX, ZOOM, PHYSICS, CAMERA } from '../js/config.js';

describe('config', () => {
  it('4 daun, dimensi terkunci', () => {
    assert.equal(BOOK.LEAF_COUNT, 4);
    assert.equal(BOOK.PAGE_WIDTH, 2.83);
    assert.equal(BOOK.PAGE_HEIGHT, 4);
    assert.equal(BOOK.SEGMENTS, 40);
  });

  it('8 gambar, urutan indeks sama', () => {
    assert.equal(IMAGE_FILES.length, 8);
    assert.equal(IMAGE_INDEX.COVER_FRONT, 5);
    assert.equal(IMAGE_INDEX.COVER_BACK, 6);
    assert.ok(IMAGE_FILES.every((f) => f.startsWith('assets/img-')));
  });

  it('zoom + fisika waras', () => {
    assert.ok(ZOOM.MIN < 1 && ZOOM.MAX > 1);
    assert.ok(PHYSICS.SPRING > 0 && PHYSICS.DAMPING > 0);
    assert.ok(CAMERA.FOV === 35);
  });
});
