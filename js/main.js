import { BOOK, PHYSICS, CAMERA, IMAGE_FILES } from './config.js';
import { clamp, loadImages } from './textures.js';
import { createStage, fitStage } from './scene.js';
import { createBook, bendLeaf } from './book.js';
import { createState, attachControls } from './controls.js';
import { createPerfMonitor, updatePerf } from './perf.js';

const stageEl = document.getElementById('stage');
const brightnessEl = document.getElementById('br');

// Isyarat sapu 2 detik, sekali saja, khusus layar sentuh.
try {
  if (matchMedia('(pointer: coarse)').matches && !localStorage.getItem('wz-swipe-seen')) {
    localStorage.setItem('wz-swipe-seen', '1');
    const swipeEl = document.getElementById('swipe');
    swipeEl.classList.add('show');
    setTimeout(() => swipeEl.remove(), 2100);
  } else {
    document.getElementById('swipe').remove();
  }
} catch {
  document.getElementById('swipe')?.remove();
}

const state = createState();
const { renderer, scene, camera, hemi, key, bookGroup } = createStage(stageEl);
fitStage(renderer, camera);
addEventListener('resize', () => fitStage(renderer, camera));

brightnessEl.oninput = function brightness() {
  const v = Number(this.value);
  hemi.intensity = 0.6 * v;
  key.intensity = 0.55 * v;
};

// Brightness hanya penuh saat disentuh. Sisanya redup 10%.
const brightBox = document.getElementById('bright');
let idleTimer = 0;
function wakeBright() {
  brightBox.classList.remove('idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => brightBox.classList.add('idle'), 1500);
}
['pointerdown', 'pointerenter', 'input', 'focusin', 'touchstart'].forEach((ev) =>
  brightBox.addEventListener(ev, wakeBright, { passive: true }),
);
brightBox.classList.add('idle');

attachControls({
  stageEl,
  state,
  ui: {
    prev: document.getElementById('prev'),
    next: document.getElementById('next'),
    zoomIn: document.getElementById('zi'),
    zoomOut: document.getElementById('zo'),
    reset: document.getElementById('rs'),
  },
});

let leaves = [];
let last = performance.now();
const perf = createPerfMonitor();

function tick(now) {
  updatePerf(perf, renderer, key, now);
  const dt = Math.min(PHYSICS.MAX_DT, (now - last) / 1000);
  last = now;

  state.velocity += ((state.target - state.page) * PHYSICS.SPRING - state.velocity * PHYSICS.DAMPING) * dt;
  state.page += state.velocity * dt;
  if (state.page < 0) {
    state.page = 0;
    state.velocity = 0;
  }
  if (state.page > BOOK.LEAF_COUNT) {
    state.page = BOOK.LEAF_COUNT;
    state.velocity = 0;
  }

  leaves.forEach((leaf) => {
    const p = clamp(state.page - leaf.index, 0, 1);
    if ((p > 0 && p < 1) || p !== leaf.progress) {
      leaf.progress = p;
      const eased = p * p * (3 - 2 * p);
      leaf.pivot.position.z =
        (BOOK.LEAF_COUNT - 1 - leaf.index) * BOOK.STACK_GAP +
        (leaf.index - (BOOK.LEAF_COUNT - 1 - leaf.index)) * BOOK.STACK_GAP * eased;
      bendLeaf(
        leaf,
        p,
        leaf.stiffness * Math.sin(Math.PI * p) * (0.5 + 0.7 * clamp(state.velocity / 3, -1, 1)),
      );
    }
  });

  const shift =
    state.page <= 1
      ? -0.5 * (1 - state.page)
      : state.page >= BOOK.LEAF_COUNT - 1
        ? 0.5 * (state.page - (BOOK.LEAF_COUNT - 1))
        : 0;
  bookGroup.position.x = shift * BOOK.PAGE_WIDTH;

  state.zoom += (state.zoomTarget - state.zoom) * PHYSICS.SMOOTH_ZOOM;
  state.panX += (state.panTX - state.panX) * PHYSICS.SMOOTH_PAN;
  state.panZ += (state.panTZ - state.panZ) * PHYSICS.SMOOTH_PAN;
  state.yaw += (state.yawTarget - state.yaw) * PHYSICS.SMOOTH_ANGLE;
  state.pitch += (state.pitchTarget - state.pitch) * PHYSICS.SMOOTH_ANGLE;

  const openness = clamp(Math.min(state.page, BOOK.LEAF_COUNT - state.page), 0, 1);
  const aspect = innerWidth / innerHeight;
  const tilt = CAMERA.PITCH_BASE + state.pitch;
  state.camDist =
    Math.max(
      (CAMERA.FIT_SPAN * (0.52 + 0.48 * openness)) / (2 * CAMERA.FIT_CONSTANT * aspect),
      (BOOK.PAGE_HEIGHT * Math.sin(tilt) + 1) / (2 * CAMERA.FIT_CONSTANT),
    ) / state.zoom;

  camera.position.set(
    state.panX + state.camDist * Math.sin(state.yaw) * Math.cos(tilt),
    state.camDist * Math.sin(tilt),
    state.panZ + state.camDist * Math.cos(state.yaw) * Math.cos(tilt),
  );
  camera.lookAt(state.panX, 0, state.panZ);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

loadImages(IMAGE_FILES)
  .then((images) => {
    leaves = createBook(renderer, bookGroup, images);
    requestAnimationFrame(tick);
  })
  .catch((err) => {
    console.error(err);
    document.title = 'Gagal memuat gambar';
  });
