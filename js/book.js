import { BOOK, EMBOSS, IMAGE_INDEX } from './config.js';
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

function paperMaterial(renderer, painter, isCover, side, mirrored = false) {
  const tex = toTexture(renderer, painter, mirrored);
  // Cover laminasi minyak: clearcoat kilap. Isi kertas doff.
  if (isCover) {
    return new THREE.MeshPhysicalMaterial({
      map: tex,
      roughness: 0.35,
      metalness: 0,
      side,
      bumpMap: tex,
      bumpScale: EMBOSS.COVER,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
    });
  }
  return new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.9,
    metalness: 0,
    side,
    bumpMap: tex,
    bumpScale: EMBOSS.PAGE,
  });
}

/** Build 4 leaves. Geometry + bend math identical to original. */
export function createBook(renderer, bookGroup, images) {
  const spreads = buildSpreads(images);
  const leaves = [];

  spreads.forEach((spread, i) => {
    const isCoverLeaf = i === 0 || i === spreads.length - 1;
    // Hardcover overhang: cover 2.93 x 4.2, isi 2.83 x 4.0 ngumpet dalam.
    const w = isCoverLeaf ? BOOK.PAGE_WIDTH + BOOK.COVER_EXTRA_W : BOOK.PAGE_WIDTH;
    const h = isCoverLeaf ? BOOK.PAGE_HEIGHT + BOOK.COVER_EXTRA_H : BOOK.PAGE_HEIGHT;
    const geo = new THREE.PlaneGeometry(w, h, BOOK.SEGMENTS, 1);
    geo.translate(w / 2, 0, 0);

    const front = new THREE.Mesh(
      geo,
      paperMaterial(renderer, spread[0], isCoverLeaf, THREE.FrontSide, false),
    );
    // Belakang wajib mirror, sama seperti tex(f[1],1) asli. Tanpa ini teks terbalik.
    const backMat = paperMaterial(renderer, spread[1], isCoverLeaf, THREE.BackSide, true);
    const back = new THREE.Mesh(geo, backMat);

    front.castShadow = true;
    front.receiveShadow = true;
    // Belakang ikut coret bayangan agar lipatan hidup antar halaman.
    back.castShadow = true;
    back.receiveShadow = true;
    front.material.shadowSide = THREE.DoubleSide;
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
      isCover: isCoverLeaf,
      // Lentur sama semua agar tepi blend, tidak patah cover vs isi.
      stiffness: BOOK.PAGE_STIFFNESS,
    });
  });

  return leaves;
}

/** Tukar tekstur placeholder ke gambar asli tanpa bangun ulang geometri. */
export function refreshBookTextures(renderer, leaves, images) {
  const spreads = buildSpreads(images);
  leaves.forEach((leaf, i) => {
    const [frontPainter, backPainter] = spreads[i];
    for (const [mesh, painter, mirrored] of [
      [leaf.pivot.children[0], frontPainter, false],
      [leaf.pivot.children[1], backPainter, true],
    ]) {
      const old = mesh.material.map;
      const tex = toTexture(renderer, painter, mirrored);
      mesh.material.map = tex;
      mesh.material.bumpMap = tex;
      mesh.material.needsUpdate = true;
      if (old) old.dispose();
    }
  });
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
