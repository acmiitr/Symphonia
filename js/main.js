import "../template/style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FirstPersonControls } from "./controller";
import { fragmentShader } from "./shader.js";

let model,clock, controls, shader_mat, renderer;

// Scene, Camera and Renderer
clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
main();
function main() {
    // scene.fog = new THREE.Fog( 0xa0a0a0, 1, 50 );

    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector(".webgl"),
    });

    controls = new FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 10;
    controls.lookSpeed = 0.1;
    controls.activeLook = false;
    // controls.autoForward = true;
    controls.mouseDragOn = true;

    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // camera.position.setZ(30);

    renderer.render(scene, camera);

    // Adding objects here
    const geom = new THREE.BoxGeometry(5, 5, 5);
    const material = new THREE.MeshStandardMaterial({ color: "#00ff83" });
    const box = new THREE.Mesh(geom, material);
    scene.add(box);

    // todo
    shader_mat = new THREE.ShaderMaterial({
        uniforms: controls.uniforms,
        fragmentShader: fragmentShader(),
    });
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        shader_mat,
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // cont planeMat = new THREE.

    // light
    const light = new THREE.DirectionalLight(0xffffff, 1, 100);
    light.position.set(0, 10, 30);
    light.castShadow = true;
    scene.add(light);

    const lightHelper = new THREE.DirectionalLightHelper(light, 1);
    scene.add(lightHelper);

    camera.position.z = 25;

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
    render();
}

function render() {
    // mesh.
    controls.update(clock.getDelta(), clock.elapsedTime);
    console.log("itime",shader_mat.uniforms.iTimeDelta)
    // controls.update(0.5, 0.5);
    renderer.render(scene, camera);
}

animate();
