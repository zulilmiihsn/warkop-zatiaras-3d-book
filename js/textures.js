import { TEXTURE_CANVAS, COLORS, IMAGE_INDEX } from './config.js';

const { FULL_W, FULL_H, PHOTO_W, PHOTO_H, COVER_W, COVER_H } = TEXTURE_CANVAS;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Canvas -> THREE.CanvasTexture. Mipmap + anisotropi maks agar jauh tetap tajam. */
export function toTexture(renderer, painter, mirrored) {
  const canvas = document.createElement('canvas');
  canvas.width = painter.width || FULL_W;
  canvas.height = painter.height || FULL_H;
  painter(canvas.getContext('2d'));
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  if (mirrored) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;
    texture.offset.x = 1;
  }
  return texture;
}

/** Dark spine gradient. Pixel formula unchanged. */
export function paintSpineShade(ctx, side, w, h) {
  const grad = ctx.createLinearGradient(side === 'l' ? 0 : w, 0, side === 'l' ? w * 0.19 : w * 0.81, 0);
  grad.addColorStop(0, 'rgba(0,0,0,.3)');
  grad.addColorStop(0.3, 'rgba(0,0,0,.08)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function paintPaperBase(ctx, side, w = FULL_W, h = FULL_H) {
  ctx.fillStyle = COLORS.CREAM;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = 'rgba(150,100,60,' + Math.random() * 0.05 + ')';
    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1);
  }
  paintSpineShade(ctx, side, w, h);
}

/** Cover painter kotak penuh 1:1, tanpa skala, tanpa potong. */
export function coverPainter(images, isBack, bump = false) {
  const paint = (ctx) => {
    const side = isBack ? 'r' : 'l';
    if (bump) {
      ctx.fillStyle = COLORS.BUMP_GRAY;
      ctx.fillRect(0, 0, FULL_W, FULL_H);
    } else {
      ctx.drawImage(images[isBack ? IMAGE_INDEX.COVER_BACK : IMAGE_INDEX.COVER_FRONT], 0, 0, FULL_W, FULL_H);
      const vignette = ctx.createRadialGradient(FULL_W / 2, FULL_H * 0.4, 250, FULL_W / 2, FULL_H / 2, 950);
      vignette.addColorStop(0, 'rgba(255,255,255,.07)');
      vignette.addColorStop(1, 'rgba(0,0,0,.28)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, FULL_W, FULL_H);
      const edgeX = side === 'l' ? 95 : FULL_W - 95;
      const edge = ctx.createLinearGradient(edgeX - 14, 0, edgeX + 14, 0);
      edge.addColorStop(0, 'rgba(0,0,0,.45)');
      edge.addColorStop(0.5, 'rgba(255,255,255,.14)');
      edge.addColorStop(1, 'rgba(0,0,0,.3)');
      ctx.fillStyle = edge;
      ctx.fillRect(edgeX - 14, 0, 28, FULL_H);
    }
  };
  paint.width = COVER_W;
  paint.height = COVER_H;
  return paint;
}

/** Full-bleed photo page fitted with contain. */
export function photoPainter(images, imageIdx, side) {
  const paint = (ctx) => {
    ctx.fillStyle = COLORS.CREAM;
    ctx.fillRect(0, 0, PHOTO_W, PHOTO_H);
    const img = images[imageIdx];
    const scale = Math.min(PHOTO_W / img.width, PHOTO_H / img.height);
    ctx.drawImage(img, (PHOTO_W - img.width * scale) / 2, 0, img.width * scale, img.height * scale);
    paintSpineShade(ctx, side, PHOTO_W, PHOTO_H);
  };
  paint.width = PHOTO_W;
  paint.height = PHOTO_H;
  return paint;
}

/** Full-bleed page kotak penuh 1:1 (img-0 dan img-7). */
export function fullBleedPainter(images, imageIdx, side) {
  const paint = (ctx) => {
    ctx.fillStyle = COLORS.CREAM;
    ctx.fillRect(0, 0, FULL_W, FULL_H);
    const img = images[imageIdx];
    const scale = Math.min(FULL_W / img.width, FULL_H / img.height);
    ctx.drawImage(
      img,
      (FULL_W - img.width * scale) / 2,
      (FULL_H - img.height * scale) / 2,
      img.width * scale,
      img.height * scale,
    );
    paintSpineShade(ctx, side, FULL_W, FULL_H);
  };
  paint.width = COVER_W;
  paint.height = COVER_H;
  return paint;
}

export function loadImages(files) {
  return Promise.all(
    files.map(
      (src) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Gagal load ' + src));
          img.src = src;
        }),
    ),
  );
}

// Unused legacy painters (inner/thanks) removed. They were dead code, never in spread map.
export { paintPaperBase };
