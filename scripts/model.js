import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("model-container");

// Create tooltip element - Clean & Professioneel
const tooltip = document.createElement("div");
tooltip.style.position = "absolute";
tooltip.style.backgroundColor = "rgba(126, 193, 255, 0.06)";
tooltip.style.backdropFilter = "blur(1.5px)";
tooltip.style.color = "#000000";
tooltip.style.padding = "10px 14px";
tooltip.style.borderRadius = "6px";
tooltip.style.fontFamily = "'Inter', sans-serif";
tooltip.style.fontSize = "14px";
tooltip.style.fontWeight = "550";
tooltip.style.zIndex = "1000";
tooltip.style.whiteSpace = "nowrap";
document.body.appendChild(tooltip);

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
controls.minDistance = 2.0;
controls.maxDistance = 2.8;

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

// Drag detectie
let mouseDownPos = null;
let isDragging = false;
const DRAG_THRESHOLD = 5;

// Mouse down
container.addEventListener("mousedown", (event) => {
  mouseDownPos = {
    x: event.clientX,
    y: event.clientY
  };
  isDragging = false;
});

// Mouse move
container.addEventListener("mousemove", (event) => {
  if (mouseDownPos) {
    const dx = Math.abs(event.clientX - mouseDownPos.x);
    const dy = Math.abs(event.clientY - mouseDownPos.y);
    
    if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
      isDragging = true;
    }
  }
});

// Mouse up
container.addEventListener("mouseup", () => {
  mouseDownPos = null;
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

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = 2 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);

    const center = new THREE.Box3()
      .setFromObject(model)
      .getCenter(new THREE.Vector3());

    model.position.sub(center);

    camera.position.set(0, 1, 3);
    controls.target.set(0, 0, 0);
    controls.update();

    const clickableParts = {
      "Hoofd&Hals": { route: "./Regio/Hoofd/hoofd.html", label: "Hoofd & Hals" },
      "Schouder&Bovenarm": { route: "./Regio/Schouder/schouder.html", label: "Schouder & Bovenarm" },
      "Wervelkolom": { route: "./Regio/Wervelkolom/wervelkolom.html", label: "Wervelkolom" },
      "Torax&Buik&Inwendigeorganen": { route: "./Regio/Torax/torax.html", label: "Torax, Buik & Inwendige Organen" },
      "Elleboog&Hand": { route: "./Regio/Elleboog/elleboog.html", label: "Elleboog & Hand" },
      "Bekken&Bovenbeen": { route: "./Regio/Bekken/bekken.html", label: "Bekken & Bovenbeen" },
      "Knie": { route: "./Regio/Knie/knie.html", label: "Knie" },
      "Onderbeen&Voet": { route: "./Regio/Onderbeen/onderbeen.html", label: "Onderbeen & Voet" },
    };

    model.traverse((child) => {
      if (!child.isMesh) return;

      child.material = child.material.clone();
      child.userData.clickable = false;

      if (clickableParts[child.name]) {
        child.userData.clickable = true;
        child.userData.route = clickableParts[child.name].route;
        child.userData.label = clickableParts[child.name].label;
        console.log("Clickable part found:", child.name, "- Label:", child.userData.label);
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
  
  if (event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top && event.clientY <= rect.bottom) {
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }
  
  // Update tooltip positie
  if (tooltip.style.display === "block") {
    tooltip.style.left = (event.clientX + 15) + "px";
    tooltip.style.top = (event.clientY - 35) + "px";
  }
});

// Click handler
container.addEventListener("click", (event) => {
  if (isDragging) {
    console.log("Drag detected, ignoring click");
    return;
  }
  
  if (!model) {
    console.log("Model not loaded yet");
    return;
  }

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

// Hover effect with tooltip
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
    tooltip.style.display = "none";
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

  // Show tooltip with label
  if (hit.userData.label) {
    tooltip.textContent = hit.userData.label;
    tooltip.style.display = "block";
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