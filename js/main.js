import '/template/style.css'

import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector(".webgl"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
// camera.position.setZ(30);

renderer.render(scene, camera);

const geom = new THREE.SphereGeometry(3, 64, 64)
const material = new THREE.MeshStandardMaterial({ color: "#00ff83" })
const torus = new THREE.Mesh(geom, material)
scene.add(torus)

// light
const light = new THREE.PointLight(0xffffff, 1, 100)
light.position.set(0, 10, 10)
scene.add(light)

camera.position.z = 25;

// updating on window size
window.addEventListener("resize", () => {
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// updating the scene
function animate() {
  // torus.position.x += 0.1
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

animate();