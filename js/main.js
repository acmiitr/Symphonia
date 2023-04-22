import "../template/style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FirstPersonControls } from "./controller";
import { fragmentShader } from "./shader.js";
import { Sky } from "three/addons/objects/Sky.js";

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


let model, clock, controls, shader_mat, renderer;
let sun, sky;

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
    0.01,
    100000
);

function loadSky() {

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xfffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const uniforms = {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
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
    scene.fog = new THREE.Fog( 0xa0a0a0, 1, 5000);

    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector(".webgl"),
    });

    controls = new FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 20;
    controls.lookSpeed = 0.8;
    controls.activeLook = false;
    controls.heightMin = -10;
    // controls.autoForward = true;
    controls.mouseDragOn = true;

    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    render.toneMappingExposure = 0.5;
    // camera.position.setZ(30);

    renderer.render(scene, camera);

    // Adding objects here
    const geom = new THREE.BoxGeometry(5, 5, 5);
    const material = new THREE.MeshStandardMaterial({ color: "#ffffff" });
    const box = new THREE.Mesh(geom, material);
    box.castShadow = true;
    scene.add(box);

    // todo
    shader_mat = new THREE.ShaderMaterial({
        uniforms: controls.uniforms,
        fragmentShader: fragmentShader(),
    });
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(10000, 10000, 256, 256),
        shader_mat,
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, -10, 0);
    mesh.receiveShadow = true;
    scene.add(mesh);

    // cont planeMat = new THREE.

    // light
    // const light = new THREE.DirectionalLight(0xffffff, 1, 100);
    // light.position.set(0, 10, 30);
    // light.castShadow = true;
    // scene.add(light);

    // const lightHelper = new THREE.DirectionalLightHelper(light, 1);
    // scene.add(lightHelper);

    camera.position.z = 25;

    loadSky();

    // updating on window size
    // window.addEventListener("resize", onWindowResize);
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}

// updating the scene
function animate() {
    // torus.position.x += 0.1
    requestAnimationFrame(animate);
    stats.update();
    render();
}

function render() {
    controls.update(clock.getDelta(), clock.elapsedTime);
    renderer.render(scene, camera);
}

// Calls of funtion in order
main();
animate();
