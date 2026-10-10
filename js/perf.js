import { PERF } from './config.js';

/** Adaptive quality. Step 0 = full visual. Degrade only on sustained lag. */

export function pickStep(avgFps, current) {
  if (avgFps < PERF.LOW_FPS && current < PERF.STEPS.length - 1) return current + 1;
  if (avgFps >= PERF.HIGH_FPS && current > 0) return current - 1;
  return current;
}

export function applyQuality(renderer, keyLight, stepIdx) {
  const step = PERF.STEPS[stepIdx];
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, step.PIXEL_CAP));
  const size = keyLight.shadow.mapSize;
  if (size.x !== step.SHADOW) {
    size.set(step.SHADOW, step.SHADOW);
    if (keyLight.shadow.map) {
      keyLight.shadow.map.dispose();
      keyLight.shadow.map = null;
    }
  }
  return stepIdx;
}

export function createPerfMonitor() {
  return { frames: 0, start: performance.now(), step: 0, lastChange: 0 };
}

export function updatePerf(monitor, renderer, keyLight, now) {
  monitor.frames += 1;
  const elapsed = now - monitor.start;
  if (elapsed < PERF.WINDOW_MS) return monitor.step;
  const avgFps = (monitor.frames * 1000) / elapsed;
  const next = pickStep(avgFps, monitor.step);
  if (next !== monitor.step && now - monitor.lastChange >= PERF.COOLDOWN_MS) {
    monitor.step = applyQuality(renderer, keyLight, next);
    monitor.lastChange = now;
  }
  monitor.frames = 0;
  monitor.start = now;
  return monitor.step;
}
