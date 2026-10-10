import { CAMERA } from './config.js';

/** Renderer + scene + lights + floor. Numbers copied 1:1 from original. */
export function createStage(stageEl) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  // PCF + radius agar tepi bayangan lembut dinamis, tidak kaku.
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  stageEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA.FOV, 1, CAMERA.NEAR, CAMERA.FAR);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd8cfc0, 0.6);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff6e8, 0.55);
  key.position.set(-1.5, 12, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 30;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.015;
  key.shadow.radius = 6;
  scene.add(key);

  // Isi lembut dari lawan arah agar relief timbul terbaca. Tanpa bayangan.
  const fill = new THREE.DirectionalLight(0xfff0e0, 0.22);
  fill.position.set(3, 5, -4);
  scene.add(fill);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.18 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  floor.receiveShadow = true;
  scene.add(floor);

  const bookGroup = new THREE.Group();
  bookGroup.rotation.x = -Math.PI / 2;
  scene.add(bookGroup);

  return { renderer, scene, camera, hemi, key, bookGroup };
}

export function fitStage(renderer, camera) {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
