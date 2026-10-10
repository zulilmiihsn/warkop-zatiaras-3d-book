# Warkop Zatiaras — Buku 3D Interaktif

![ci](https://github.com/zulilmiihsn/warkop-zatiaras-3d-book/actions/workflows/ci.yml/badge.svg)

Buku 3D interaktif. Visual sama persis dengan file asli. Kode bersih penuh.

## Struktur

- `index.html` — kerangka saja
- `css/main.css` — gaya
- `js/config.js` — semua angka + path gambar
- `js/textures.js` — cat kanvas ke tekstur
- `js/scene.js` — renderer, lampu, lantai
- `js/book.js` — geometri + lengkung halaman
- `js/controls.js` — sentuh, mouse, wheel, tombol
- `js/main.js` — loop animasi
- `assets/img-0.jpg` … `img-7.jpg` — halaman, byte sama dari base64 asli
  - `img-5.jpg` cover depan, `img-6.jpg` cover belakang

## Jalan

```bash
npm install
npm run dev
npm test
npm run lint
npm run format
```

Live via GitHub Pages `pages.yml`.

## Catatan visual

- three.js r128 dikunci via CDN. Jangan upgrade tanpa uji pixel.
- Rumus kamera, cahaya, bayangan, shade disalin 1:1.
- `inner` + `thanks` asli tidak dipakai di spread, jadi dibuang. Tidak ubah visual.
- Grain kertas pakai `Math.random`, sama acak seperti asli tiap load.
