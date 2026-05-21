import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("model-container");

const scene = new THREE.Scene();
scene.background = null;

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  1000,
);

camera.position.set(0, 1, 3);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Controls met zoom limits
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.zoomSpeed = 1.0;
controls.minDistance = 2.0;  // Max zoom IN (hoe dichterbij)
controls.maxDistance = 2.8;  // Max zoom OUT

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// Raycast setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let model = null;
let hovered = null;

// Drag detectie met muispositie
let mouseDownPos = null;
let isDragging = false;
const DRAG_THRESHOLD = 5; // pixels

// Mouse down - sla startpositie op
container.addEventListener("mousedown", (event) => {
  mouseDownPos = {
    x: event.clientX,
    y: event.clientY
  };
  isDragging = false;
});

// Mouse move - detecteer drag als muis meer dan threshold beweegt
container.addEventListener("mousemove", (event) => {
  if (mouseDownPos) {
    const dx = Math.abs(event.clientX - mouseDownPos.x);
    const dy = Math.abs(event.clientY - mouseDownPos.y);
    
    if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
      isDragging = true;
    }
  }
});

// Mouse up - reset drag state
container.addEventListener("mouseup", () => {
  mouseDownPos = null;
  // Reset isDragging na een korte vertraging
  setTimeout(() => {
    isDragging = false;
  }, 100);
});

// Load model
const loader = new GLTFLoader();

loader.load(
  "../model/HumanModelV3.glb",
  (gltf) => {
    model = gltf.scene;
    scene.add(model);

    model.rotation.y = Math.PI / -2;

    // Scale fix
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = 2 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);

    // Center fix
    const center = new THREE.Box3()
      .setFromObject(model)
      .getCenter(new THREE.Vector3());

    model.position.sub(center);

    camera.position.set(0, 1, 3);
    controls.target.set(0, 0, 0);
    controls.update();

    // Clickable parts
    const clickableParts = {
      "Hoofd&Hals": "./Regio/Hoofd/hoofd.html",
      "Schouder&Bovenarm": "./Regio/Schouder/schouder.html",
      "Wervelkolom": "./Regio/Wervelkolom/wervelkolom.html",
      "Torax&Buik&Inwendigeorganen": "./Regio/Torax/torax.html",
      "Elleboog&Hand": "./Regio/Elleboog/elleboog.html",
      "Bekken&Bovenbeen": "./Regio/Bekken/bekken.html",
      "Knie": "./Regio/Knie/knie.html",
      "Onderbeen&Voet": "./Regio/Onderbeen/onderbeen.html",
    };

    model.traverse((child) => {
      if (!child.isMesh) return;

      child.material = child.material.clone();
      child.userData.clickable = false;

      if (clickableParts[child.name]) {
        child.userData.clickable = true;
        child.userData.route = clickableParts[child.name];
        console.log("Clickable part found:", child.name);
      }
    });

    console.log("Model loaded");
  },
  undefined,
  (err) => console.error(err),
);

// Mouse tracking voor hover
window.addEventListener("mousemove", (event) => {
  const rect = container.getBoundingClientRect();
  
  // Check if mouse is inside container
  if (event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top && event.clientY <= rect.bottom) {
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }
});

// Click handler - ONLY on real click (not drag)
container.addEventListener("click", (event) => {
  // ALs er gedragged is, doe niks
  if (isDragging) {
    console.log("Drag detected, ignoring click");
    return;
  }
  
  if (!model) {
    console.log("Model not loaded yet");
    return;
  }

  // Update mouse position for click
  const rect = container.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster
    .intersectObject(model, true)
    .filter((h) => h.object.userData.clickable);

  if (hits.length === 0) {
    console.log("No clickable part hit");
    return;
  }

  const hit = hits[0].object;
  console.log("Clicked on:", hit.name);

  if (hit.userData.route) {
    console.log("Navigating to:", hit.userData.route);
    window.location.href = hit.userData.route;
  }
});

// Hover effect
function checkHover() {
  if (!model) return;

  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster
    .intersectObject(model, true)
    .filter((h) => h.object.userData.clickable);

  if (hits.length === 0) {
    if (hovered?.material?.emissive) {
      hovered.material.emissive.setHex(0x000000);
      hovered.material.emissiveIntensity = 0;
    }
    hovered = null;
    container.style.cursor = "default";
    return;
  }

  const hit = hits[0].object;

  if (hovered && hovered !== hit) {
    if (hovered.material?.emissive) {
      hovered.material.emissive.setHex(0x000000);
      hovered.material.emissiveIntensity = 0;
    }
  }

  hovered = hit;

  if (hit.material?.emissive) {
    hit.material.emissive.setHex(0x3b82f6);
    hit.material.emissiveIntensity = 0.3;
  }

  container.style.cursor = "pointer";
}

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  checkHover();
}

animate();