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
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
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

    const onKeyDown = function (event) {
        switch (event.code) {
            case "ArrowUp":
            case "KeyW":
                moveForward = true;
                break;

            case "ArrowLeft":
            case "KeyA":
                moveLeft = true;
                break;

            case "ArrowDown":
            case "KeyS":
                moveBackward = true;
                break;

            case "ArrowRight":
            case "KeyD":
                moveRight = true;
                break;

            case "Space":
                // if (canJump === true) velocity.y += 100;
                canJump = true;
                break;
        }
    };

    const onKeyUp = function (event) {
        switch (event.code) {
            case "ArrowUp":
            case "KeyW":
                moveForward = false;
                break;

            case "ArrowLeft":
            case "KeyA":
                moveLeft = false;
                break;

            case "ArrowDown":
            case "KeyS":
                moveBackward = false;
                break;

            case "ArrowRight":
            case "KeyD":
                moveRight = false;
                break;
            
            case "LeftShift":
                canJump = false;
                break;
        }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();

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

    // todo
    // shader_mat = new THREE.ShaderMaterial({
    //     uniforms: controls.uniforms,
    //     fragmentShader: fragmentShader(),
    // });
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
    const time = performance.now();
    console.log(controls.isLocked)

    if (controls.isLocked === true) {
        // raycaster.ray.origin.copy(controls.getObject().position);
        // raycaster.ray.origin.y -= 10;
        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;


        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        controls.getObject().position.y += velocity.y * delta; // new behavior

        if (controls.getObject().position.y < 10) {
            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;
        }
    }
    prevTime = time;
    renderer.render(scene, camera);
}

// Calls of funtion in order
main();
animate();
