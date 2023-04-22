import "../template/style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FirstPersonControls } from "./controller";
import { fragmentShader } from "./shader.js";
import { PointerLockControls } from "./pointerlock";

import Stats from "stats.js";

const _VS = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

const _FS = `
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;
varying vec3 vWorldPosition;
void main() {
  float h = normalize( vWorldPosition + offset ).y;
  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
}`;

let clock, controls, shader_mat, raycaster, renderer;
let prevTime = performance.now();

// Scene, Camera and Renderer
clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);

// fps counter
var stats = Stats();
document.body.appendChild(stats.domElement);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
);
camera.position.set(0, 10, 0);

function loadSky() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xfffffff, 0.6);
    hemiLight.color.setHSL(0.5, 1, 0.75);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const uniforms = {
        topColor: { value: new THREE.Color(0x06319e) },
        bottomColor: { value: new THREE.Color(0xe8e0ae) },
        offset: { value: 33 },
        exponent: { value: 0.6 },
    };
    // scene.fog.color.copy(uniforms["bottomColor"].value);

    const skyGeo = new THREE.SphereGeometry(1000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: _VS,
        fragmentShader: _FS,
        side: THREE.BackSide,
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
}

function main() {
    scene.fog = new THREE.Fog(0xa0a0a0, 1, 500);

    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector(".webgl"),
        antialias: true,
    });

    controls = new PointerLockControls(camera, document.body);

    const blocker = document.getElementById("blocker");
    const instructions = document.getElementById("instructions");

    blocker.addEventListener("click", function () {
        controls.lock();
    });

    controls.addEventListener("lock", function () {
        instructions.style.display = "none";
        blocker.style.display = "none";
    });

    controls.addEventListener("unlock", function () {
        blocker.style.display = "block";
        instructions.style.display = "";
    });
    scene.add(controls.getObject());

    raycaster = new THREE.Raycaster(
        new THREE.Vector3(),
        new THREE.Vector3(0, -1, 0),
        0,
        10
    );

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    render.toneMappingExposure = 0.5;
    // camera.position.setZ(30);

    renderer.render(scene, camera);

    // Adding objects here
    const geom = new THREE.BoxGeometry(5, 5, 5);
    const mat1 = new THREE.MeshStandardMaterial({ color: "#4287f5" });
    const mat2 = new THREE.MeshStandardMaterial({ color: "#f542d4" });
    const box = new THREE.Mesh(geom, mat1);
    const box2 = new THREE.Mesh(geom, mat2);
    box.castShadow = true;
    box.position.set(-10, 10, 0);
    box2.position.set(10, 10, 0);
    scene.add(box);
    scene.add(box2);

    const floor_mat = new THREE.MeshBasicMaterial({ color: "#76e3a1" });
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000, 100, 100),
        floor_mat
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    camera.position.z = 10;

    loadSky();

    // updating on window size
    window.addEventListener("resize", onWindowResize);
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// updating the scene
function animate() {
    // torus.position.x += 0.1
    requestAnimationFrame(animate);
    stats.update();
    render();
}

function render() {
    // controls.update(clock.getDelta(), clock.elapsedTime);

    // const intersections = raycaster.intersectObjects(objects, false);
    // const time = performance.now();
    console.log(prevTime)
    controls.update(prevTime);
    renderer.render(scene, camera);
}

// Calls of funtion in order
main();
animate();
