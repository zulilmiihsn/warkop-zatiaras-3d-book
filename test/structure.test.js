import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

describe('structure', () => {
  it('index.html ramping, tanpa base64', () => {
    const html = readFileSync('index.html', 'utf8');
    assert.ok(html.includes('css/main.css'));
    assert.ok(html.includes('js/main.js'));
    assert.ok(html.includes('three.min.js'));
    assert.ok(html.includes('r128'));
    assert.ok(!html.includes('base64'));
    assert.ok(html.length < 5000);
  });

  it('three dikunci r128 agar visual sama', () => {
    const html = readFileSync('index.html', 'utf8');
    assert.match(html, /three\.js\/r128\/three\.min\.js/);
  });

  it('dead code asli dibuang', () => {
    const tex = readFileSync('js/textures.js', 'utf8');
    assert.ok(!/function inner\(/.test(tex));
  });
});
