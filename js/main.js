import '/template/style.css'

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

// Scene, Camera and Renderer
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector(".webgl"),
})

const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
// camera.position.setZ(30);

renderer.render(scene, camera);

// Adding objects here 
const geom = new THREE.SphereGeometry(3, 64, 64)
const material = new THREE.MeshStandardMaterial({ color: "#00ff83" })
const sphere = new THREE.Mesh(geom, material)
scene.add(sphere)

const geom2 = new THREE.PlaneGeometry(30, 30)
// cont planeMat = new THREE.

// light
const light = new THREE.DirectionalLight(0xffffff, 1, 100)
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