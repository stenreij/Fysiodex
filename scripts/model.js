import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("model-container");
container.style.position = "relative";

// Create tooltip element - toegevoegd aan CONTAINER in plaats van body
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
tooltip.style.pointerEvents = "none";
tooltip.style.display = "none";
container.appendChild(tooltip);  // <-- BELANGRIJK: aan container, niet aan body

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

// Controls + zoom limits
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = true;
controls.rotateSpeed = 1.0;

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

// Drag detection
let mouseDownPos = null;
let isDragging = false;
const DRAG_THRESHOLD = 5;

// Last mouseposition before scroll
let lastMouseX = 0;
let lastMouseY = 0;

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

    // Define clickable parts with routes and labels
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

// Mouse tracking hover - RESPONSIVE
window.addEventListener("mousemove", (event) => {
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  
  const rect = container.getBoundingClientRect();
  
  if (event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top && event.clientY <= rect.bottom) {
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }
  
  // Responsieve tooltip positie
  if (tooltip.style.display === "block") {
    const containerRect = container.getBoundingClientRect();
    const relativeX = event.clientX - containerRect.left;
    const relativeY = event.clientY - containerRect.top;
    
    // Responsieve offsets (percentage van container)
    const offsetX = Math.max(15, containerRect.width * 0.05);
    const offsetY = Math.max(30, containerRect.height * 0.05);
    
    let leftPos = relativeX + offsetX;
    let topPos = relativeY - offsetY;
    
    // Check of tooltip niet buiten container valt
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    
    if (leftPos + tooltipWidth > containerRect.width) {
      leftPos = relativeX - tooltipWidth - 10;
    }
    if (topPos < 0) {
      topPos = relativeY + offsetY;
    }
    if (leftPos < 0) {
      leftPos = 10;
    }
    
    tooltip.style.left = leftPos + "px";
    tooltip.style.top = topPos + "px";
  }
});

// Scroll handler
window.addEventListener("scroll", () => {
  if (lastMouseX && lastMouseY) {
    const rect = container.getBoundingClientRect();
    if (lastMouseX >= rect.left && lastMouseX <= rect.right &&
        lastMouseY >= rect.top && lastMouseY <= rect.bottom) {
      mouse.x = ((lastMouseX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((lastMouseY - rect.top) / rect.height) * 2 + 1;
    }
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