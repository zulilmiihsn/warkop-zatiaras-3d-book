import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { IMAGE_FILES } from '../js/config.js';

describe('assets', () => {
  for (const f of IMAGE_FILES) {
    it(f + ' ada + jpeg valid', () => {
      assert.ok(existsSync(f), f + ' hilang');
      const buf = readFileSync(f);
      assert.ok(buf.length > 50_000, f + ' terlalu kecil: ' + buf.length);
      assert.equal(buf[0], 0xff);
      assert.equal(buf[1], 0xd8);
      assert.equal(buf[2], 0xff);
    });
  }
});
