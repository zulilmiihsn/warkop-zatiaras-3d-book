import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

describe('mirror', () => {
  it('belakang mirror true, depan false', () => {
    const src = readFileSync('js/book.js', 'utf8');
    assert.ok(src.includes('THREE.BackSide'));
    assert.ok(src.includes('THREE.FrontSide'));
    // back material wajib mirror true seperti tex(f[1],1) asli
    assert.ok(/paperMaterial\([\s\S]*?THREE\.BackSide[\s\S]*?true/.test(src));
  });
});
