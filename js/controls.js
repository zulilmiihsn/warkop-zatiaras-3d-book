import { BOOK, ZOOM } from './config.js';
import { clamp } from './textures.js';

export function createState() {
  return {
    page: 0, // cur
    target: 0, // tg
    velocity: 0,
    zoom: 1,
    zoomTarget: 1,
    panX: 0,
    panZ: 0,
    panTX: 0,
    panTZ: 0,
    yaw: 0,
    pitch: 0,
    yawTarget: 0,
    pitchTarget: 0,
    camDist: 8,
    dragging: false,
  };
}

export function goPage(state, delta) {
  state.target = clamp(Math.round(state.target) + delta, 0, BOOK.LEAF_COUNT);
}

export function setZoom(state, v) {
  state.zoomTarget = clamp(v, ZOOM.MIN, ZOOM.MAX);
}

export function clampPan(state) {
  const m = Math.max(0, state.zoomTarget - 1) * BOOK.PAGE_WIDTH * 1.6;
  state.panTX = clamp(state.panTX, -m, m);
  state.panTZ = clamp(state.panTZ, -m, m);
}

export function resetView(state) {
  state.zoomTarget = 1;
  state.panTX = 0;
  state.panTZ = 0;
}

function pinchDist(points) {
  const [a, b] = Object.values(points);
  return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Pointer + wheel + keys + buttons. Thresholds copied 1:1. */
export function attachControls({ stageEl, state, ui }) {
  const points = {};
  let mode = null;
  let startX, startY, startPage, lastX, lastT, velocityX = 0;
  let moved = false;
  let pinchD, pinchZoom, pinchMid, pinchPanX, pinchPanZ;
  let lastTap = 0;
  const unit = () => (2 * state.camDist * 0.3153) / innerHeight;

  stageEl.addEventListener('pointerdown', (e) => {
    stageEl.setPointerCapture(e.pointerId);
    points[e.pointerId] = { x: e.clientX, y: e.clientY, type: e.pointerType };
    if (Object.keys(points).length === 2) {
      const m = pinchDist(points);
      mode = 'pinch';
      pinchD = m.d;
      pinchZoom = state.zoomTarget;
      pinchMid = m;
      pinchPanX = state.panTX;
      pinchPanZ = state.panTZ;
      state.dragging = false;
    } else if (Object.keys(points).length === 1) {
      mode = 'drag';
      startX = lastX = e.clientX;
      startY = e.clientY;
      startPage = Math.round(state.target);
      moved = false;
      lastT = performance.now();
      velocityX = 0;
      pinchPanX = state.panTX;
      pinchPanZ = state.panTZ;
      stageEl.classList.add('drag');
    }
  });

  stageEl.addEventListener('pointermove', (e) => {
    const p = points[e.pointerId];
    if (!p) {
      if (e.pointerType === 'mouse') {
        state.yawTarget = (e.clientX / innerWidth - 0.5) * 0.16;
        state.pitchTarget = -(e.clientY / innerHeight - 0.5) * 0.1;
      }
      return;
    }
    p.x = e.clientX;
    p.y = e.clientY;
    if (mode === 'pinch' && Object.keys(points).length >= 2) {
      const m = pinchDist(points);
      setZoom(state, pinchZoom * (m.d / pinchD));
      const u = unit();
      state.panTX = pinchPanX - (m.x - pinchMid.x) * u;
      state.panTZ = pinchPanZ - (m.y - pinchMid.y) * u * 1.5;
      clampPan(state);
      return;
    }
    if (mode === 'drag') {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
      if (state.zoomTarget > 1.15) {
        const u = unit();
        state.panTX = pinchPanX - dx * u;
        state.panTZ = pinchPanZ - dy * u * 1.5;
        clampPan(state);
        return;
      }
      const now = performance.now();
      velocityX = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
      state.dragging = true;
      state.target = clamp(startPage - dx / (innerWidth * 0.3), 0, BOOK.LEAF_COUNT);
    }
  });

  const endPointer = (e) => {
    if (!points[e.pointerId]) return;
    const type = points[e.pointerId].type;
    delete points[e.pointerId];
    const n = Object.keys(points).length;
    if (mode === 'pinch') {
      if (n < 2) {
        mode = null;
        if (n === 1) {
          const [k] = Object.keys(points);
          mode = 'drag';
          startX = lastX = points[k].x;
          startY = points[k].y;
          pinchPanX = state.panTX;
          pinchPanZ = state.panTZ;
          moved = true;
          startPage = Math.round(state.target);
        }
      }
      return;
    }
    if (mode === 'drag' && n === 0) {
      stageEl.classList.remove('drag');
      if (state.dragging) {
        const d = state.target - startPage;
        state.target =
          Math.abs(d) > 0.25 ? startPage + Math.sign(d) : Math.abs(velocityX) > 0.45 ? startPage - Math.sign(velocityX) : startPage;
        state.target = clamp(Math.round(state.target), 0, BOOK.LEAF_COUNT);
        state.dragging = false;
      } else if (!moved) {
        if (type === 'mouse') goPage(state, e.clientX > innerWidth / 2 ? 1 : -1);
        else {
          const t = performance.now();
          if (t - lastTap < 320) {
            if (state.zoomTarget > 1.2) resetView(state);
            else setZoom(state, ZOOM.DOUBLE_TAP);
          }
          lastTap = t;
        }
      }
      mode = null;
    }
  };
  stageEl.addEventListener('pointerup', endPointer);
  stageEl.addEventListener('pointercancel', endPointer);
  stageEl.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      setZoom(state, state.zoomTarget * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)));
      clampPan(state);
    },
    { passive: false },
  );
  stageEl.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') {
      state.yawTarget = 0;
      state.pitchTarget = 0;
    }
  });

  ui.prev.onclick = () => goPage(state, -1);
  ui.next.onclick = () => goPage(state, 1);
  ui.zoomIn.onclick = () => {
    setZoom(state, state.zoomTarget * ZOOM.STEP);
    clampPan(state);
  };
  ui.zoomOut.onclick = () => {
    setZoom(state, state.zoomTarget / ZOOM.STEP);
    clampPan(state);
  };
  ui.reset.onclick = () => resetView(state);

  addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goPage(state, 1);
    else if (e.key === 'ArrowLeft') goPage(state, -1);
    else if (e.key === '+' || e.key === '=') setZoom(state, state.zoomTarget * 1.2);
    else if (e.key === '-') setZoom(state, state.zoomTarget / 1.2);
    else if (e.key === '0') resetView(state);
    clampPan(state);
  });
}
