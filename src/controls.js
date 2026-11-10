// controls.js
// First-person "fly" camera: mouse drag or pointer lock to look, WASD/arrows to move,
// Space/E up and Q/C down, Shift to go faster, plus twin-zone touch controls.
//
// three.js ships ready-made controls in its addons (OrbitControls, PointerLockControls,
// FlyControls...). Writing a small one yourself is worth doing once: it shows how input,
// rotation and frame-rate-independent motion fit together.

import { Vector3 } from 'three';

const HOME = { position: new Vector3(-10.5, 2.6, 42.5), yaw: 0.07, pitch: 0.22 };
const WALK_SPEED = 9; // m/s
const RUN_SPEED = 26;
const ACCELERATION = 7; // higher = snappier start and stop
const MAX_PITCH = 1.5; // just under 90°, so the camera can never flip over
const WORLD_LIMIT = 150;

/**
 * @param {object} deps
 * @param {import('three').PerspectiveCamera} deps.camera
 * @param {HTMLCanvasElement} deps.canvas
 * @param {HTMLElement[]} [deps.buttons]  UI buttons that keep normal keyboard behaviour when focused
 */
export function createFlyControls({ camera, canvas, buttons = [] }) {
  // We keep yaw (turn left/right) and pitch (look up/down) as two plain numbers and
  // rebuild the rotation from them every frame. Euler order 'YXZ' means: first turn
  // around the world's up axis, then tilt around the camera's own sideways axis. With the
  // default 'XYZ' order, looking up and then turning would roll the horizon.
  // This is the standard FPS camera setup.
  camera.rotation.order = 'YXZ';
  let yaw = HOME.yaw;
  let pitch = HOME.pitch;

  const setView = (position, newYaw, newPitch) => {
    camera.position.copy(position);
    yaw = newYaw;
    pitch = newPitch;
  };
  const reset = () => setView(HOME.position, HOME.yaw, HOME.pitch);
  reset();

  const look = (dx, dy, sensitivity) => {
    yaw -= dx * sensitivity;
    pitch -= dy * sensitivity;
    pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch));
  };

  // --- Mouse: drag to look, or click (without dragging) to lock the pointer ---------------
  // Pointer lock hides the cursor and reports raw movementX/Y with no screen edges. It is
  // the right mode for mouse-look. Browsers only allow it in response to a user gesture.
  let pointerLocked = false;
  let dragging = false;
  let dragDistance = 0;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener('mousedown', (event) => {
    dragging = true;
    dragDistance = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.focus();
  });
  window.addEventListener('mouseup', () => {
    if (dragging && dragDistance < 4 && !pointerLocked && canvas.requestPointerLock) {
      try {
        // Newer browsers return a Promise that rejects (e.g. when the user denies it).
        const request = canvas.requestPointerLock();
        if (request && request.catch) request.catch(() => {});
      } catch {
        /* pointer lock unsupported; drag-to-look still works */
      }
    }
    dragging = false;
  });
  window.addEventListener('mousemove', (event) => {
    if (pointerLocked) {
      look(event.movementX || 0, event.movementY || 0, 0.0022);
    } else if (dragging) {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      dragDistance += Math.abs(dx) + Math.abs(dy);
      // Dragging "grabs" the world, so it moves the opposite way to mouse-look.
      look(-dx, -dy, 0.004);
    }
  });
  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === canvas;
  });

  // --- Keyboard ------------------------------------------------------------------------
  // Track which keys are held, and read that state once per frame in update(). Moving
  // inside the keydown handler would tie speed to the OS key-repeat rate.
  // event.code is the physical key position, so WASD also works on AZERTY keyboards.
  const keys = {};
  window.addEventListener('keydown', (event) => {
    keys[event.code] = true;
    const scrollKey = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code);
    if (scrollKey && !buttons.includes(document.activeElement)) event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    keys[event.code] = false;
  });
  // When the window loses focus, keyup events never arrive. Without this, you'd keep flying.
  window.addEventListener('blur', () => {
    for (const code in keys) keys[code] = false;
  });

  // --- Touch: left 40% of the screen is a virtual joystick, the rest is look -------------
  const touches = {};
  let touchMove = { x: 0, y: 0 };
  canvas.addEventListener(
    'touchstart',
    (event) => {
      for (const t of event.changedTouches) {
        touches[t.identifier] = { x: t.clientX, y: t.clientY, startX: t.clientX, startY: t.clientY, isJoystick: t.clientX < canvas.clientWidth * 0.4 };
      }
      event.preventDefault(); // stop the browser from scrolling or zooming the page
    },
    { passive: false }, // required for preventDefault() to work on touch events
  );
  canvas.addEventListener(
    'touchmove',
    (event) => {
      for (const t of event.changedTouches) {
        const touch = touches[t.identifier];
        if (!touch) continue;
        if (touch.isJoystick) {
          // Offset from where the finger first landed, 60 px = full speed.
          touchMove.x = Math.max(-1, Math.min(1, (t.clientX - touch.startX) / 60));
          touchMove.y = Math.max(-1, Math.min(1, (t.clientY - touch.startY) / 60));
        } else {
          look(-(t.clientX - touch.x), -(t.clientY - touch.y), 0.005);
        }
        touch.x = t.clientX;
        touch.y = t.clientY;
      }
      event.preventDefault();
    },
    { passive: false },
  );
  const endTouch = (event) => {
    for (const t of event.changedTouches) {
      if (touches[t.identifier] && touches[t.identifier].isJoystick) touchMove = { x: 0, y: 0 };
      delete touches[t.identifier];
    }
  };
  canvas.addEventListener('touchend', endTouch);
  canvas.addEventListener('touchcancel', endTouch);

  // --- Per-frame movement --------------------------------------------------------------
  // Reused vectors: allocating new Vector3s every frame creates garbage, and garbage
  // collection pauses show up as stutter. Keep scratch objects outside the loop.
  const forward = new Vector3();
  const right = new Vector3();
  const velocity = new Vector3();
  const targetVelocity = new Vector3();

  /** @param {number} delta  seconds since the last frame */
  function update(delta) {
    camera.rotation.set(pitch, yaw, 0);

    const forwardInput = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - touchMove.y;
    const strafeInput = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + touchMove.x;
    const liftInput = (keys.Space || keys.KeyE ? 1 : 0) - (keys.KeyQ || keys.KeyC ? 1 : 0);

    // Move where you look (fly mode, including up and down), strafe sideways along the horizon.
    camera.getWorldDirection(forward);
    right.crossVectors(forward, camera.up).normalize();
    const speed = keys.ShiftLeft || keys.ShiftRight ? RUN_SPEED : WALK_SPEED;
    targetVelocity.set(0, 0, 0).addScaledVector(forward, forwardInput).addScaledVector(right, strafeInput);
    targetVelocity.y += liftInput;
    // Normalise so moving diagonally isn't √2 times faster. Only when longer than 1, so
    // gentle touch-joystick input can still move slowly.
    if (targetVelocity.lengthSq() > 1) targetVelocity.normalize();
    targetVelocity.multiplyScalar(speed);

    // Smoothly approach the target velocity (ease in and out). The blend factor is
    // 1 - e^(-k·dt), not just k·dt: then two 8 ms frames give exactly the same result as one
    // 16 ms frame, so the feel doesn't change with the monitor's refresh rate.
    velocity.lerp(targetVelocity, 1 - Math.exp(-ACCELERATION * delta));
    camera.position.addScaledVector(velocity, delta);

    // Keep the camera above the water and inside the world.
    camera.position.y = Math.max(0.45, Math.min(140, camera.position.y));
    camera.position.x = Math.max(-WORLD_LIMIT, Math.min(WORLD_LIMIT, camera.position.x));
    camera.position.z = Math.max(-WORLD_LIMIT, Math.min(WORLD_LIMIT, camera.position.z));
  }

  return { update, reset, setView };
}
