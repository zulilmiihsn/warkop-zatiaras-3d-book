/* Central tuning. Visual math unchanged. Edit here, nowhere else. */

export const BOOK = {
  LEAF_COUNT: 4,
  PAGE_WIDTH: 2.83,
  PAGE_HEIGHT: 4,
  SEGMENTS: 40,
  STACK_GAP: 0.014,
  COVER_EXTRA_W: 0.1,
  COVER_EXTRA_H: 0.2,
  COVER_STIFFNESS: 0.35,
  PAGE_STIFFNESS: 1,
};

export const TEXTURE_CANVAS = {
  FULL_W: 1024,
  FULL_H: 1467,
  PHOTO_W: 1240,
  PHOTO_H: 1754,
  COVER_W: 1536,
  COVER_H: 2200,
  CORNER_RADIUS: 90,
};

export const COLORS = {
  CREAM: '#fdeed7',
  BUMP_GRAY: '#555',
};

// Index order = original IMGS order. Bytes identical, only moved to files.
export const IMAGE_FILES = [
  'assets/img-0.jpg',
  'assets/img-1.jpg',
  'assets/img-2.jpg',
  'assets/img-3.jpg',
  'assets/img-4.jpg',
  'assets/img-5.jpg', // cover depan
  'assets/img-6.jpg', // cover belakang
  'assets/img-7.jpg',
];

export const IMAGE_INDEX = {
  INNER_0: 0,
  PHOTO_1: 1,
  PHOTO_2: 2,
  PHOTO_3: 3,
  PHOTO_4: 4,
  COVER_FRONT: 5,
  COVER_BACK: 6,
  INNER_LAST: 7,
};

export const PHYSICS = {
  SPRING: 70,
  DAMPING: 13,
  MAX_DT: 0.033,
  SMOOTH_ZOOM: 0.18,
  SMOOTH_PAN: 0.25,
  SMOOTH_ANGLE: 0.06,
};

export const CAMERA = {
  FOV: 35,
  NEAR: 0.1,
  FAR: 200,
  PITCH_BASE: 1.25,
  FIT_CONSTANT: 0.3153,
  FIT_SPAN: 7,
};

export const ZOOM = { MIN: 0.6, MAX: 3.2, STEP: 1.25, DOUBLE_TAP: 2 };

export const UI_TEXT = {
  HINT_TOUCH: 'Geser jari untuk membalik halaman · Cubit 2 jari untuk zoom · Ketuk 2× untuk zoom cepat',
  HINT_DESKTOP:
    'Tarik dengan kursor untuk membalik · Scroll untuk zoom · Gerakkan kursor untuk melihat dari sudut lain · ← → +/−',
  COVER: 'Sampul',
  COVER_BACK: 'Sampul belakang',
};
