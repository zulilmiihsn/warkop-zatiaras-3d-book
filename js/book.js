import { BOOK, IMAGE_INDEX } from './config.js';
import { toTexture, coverPainter, photoPainter, fullBleedPainter } from './textures.js';

/** Spread map. Same pairing as original MF. */
function buildSpreads(images) {
  return [
    [coverPainter(images, false), fullBleedPainter(images, IMAGE_INDEX.INNER_0, 'r')],
    [photoPainter(images, IMAGE_INDEX.PHOTO_1, 'l'), photoPainter(images, IMAGE_INDEX.PHOTO_2, 'r')],
    [photoPainter(images, IMAGE_INDEX.PHOTO_3, 'l'), photoPainter(images, IMAGE_INDEX.PHOTO_4, 'r')],
    [fullBleedPainter(images, IMAGE_INDEX.INNER_LAST, 'l'), coverPainter(images, true)],
  ];
}

function paperMaterial(renderer, painter, isCover, side, bumpPainter, mirrored = false) {
  const mat = new THREE.MeshStandardMaterial({
    map: toTexture(renderer, painter, mirrored),
    roughness: isCover ? 0.6 : 0.92,
    metalness: 0,
    side,
  });
  if (isCover) {
    mat.alphaTest = 0.5;
    mat.bumpMap = bumpPainter;
    mat.bumpScale = 1;
  }
  return mat;
}

/** Build 4 leaves. Geometry + bend math identical to original. */
export function createBook(renderer, bookGroup, images) {
  const spreads = buildSpreads(images);
  const leaves = [];

  spreads.forEach((spread, i) => {
    const isCoverLeaf = i === 0 || i === spreads.length - 1;
    const w = isCoverLeaf ? BOOK.PAGE_WIDTH + BOOK.COVER_EXTRA_W : BOOK.PAGE_WIDTH;
    const h = isCoverLeaf ? BOOK.PAGE_HEIGHT + BOOK.COVER_EXTRA_H : BOOK.PAGE_HEIGHT;
    const geo = new THREE.PlaneGeometry(w, h, BOOK.SEGMENTS, 1);
    geo.translate(w / 2, 0, 0);

    const frontBump = i === 0 ? toTexture(renderer, coverPainter(images, false, true), false) : null;

    const front = new THREE.Mesh(
      geo,
      paperMaterial(renderer, spread[0], isCoverLeaf, THREE.FrontSide, frontBump, false),
    );
    // Belakang wajib mirror, sama seperti tex(f[1],1) asli. Tanpa ini teks terbalik.
    const backMat = paperMaterial(
      renderer,
      spread[1],
      isCoverLeaf,
      THREE.BackSide,
      i === spreads.length - 1 ? toTexture(renderer, coverPainter(images, true, true), true) : null,
      true,
    );
    const back = new THREE.Mesh(geo, backMat);

    front.castShadow = true;
    front.receiveShadow = true;
    back.receiveShadow = true;
    front.material.shadowSide = THREE.DoubleSide;
    if (isCoverLeaf) {
      front.customDepthMaterial = new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        map: front.material.map,
        alphaTest: 0.5,
      });
    }
    front.frustumCulled = false;
    back.frustumCulled = false;

    const pivot = new THREE.Group();
    pivot.add(front, back);
    bookGroup.add(pivot);
    leaves.push({
      pivot,
      geo,
      index: i,
      progress: -1,
      width: w,
      height: h,
      stiffness: isCoverLeaf ? BOOK.COVER_STIFFNESS : BOOK.PAGE_STIFFNESS,
    });
  });

  return leaves;
}

/** Curl leaf. Formula unchanged. */
export function bendLeaf(leaf, progress, amount) {
  const step = leaf.width / BOOK.SEGMENTS;
  const baseAngle = Math.PI * progress;
  const pos = leaf.geo.attributes.position;
  let x = 0;
  let z = 0;
  for (let c = 0; c <= BOOK.SEGMENTS; c++) {
    if (c > 0) {
      const theta = baseAngle - amount * Math.pow((c - 0.5) / BOOK.SEGMENTS, 1.3);
      x += Math.cos(theta) * step;
      z += Math.sin(theta) * step;
    }
    pos.setXYZ(c, x, leaf.height / 2, z);
    pos.setXYZ(BOOK.SEGMENTS + 1 + c, x, -leaf.height / 2, z);
  }
  pos.needsUpdate = true;
  leaf.geo.computeVertexNormals();
}
