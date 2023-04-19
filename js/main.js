import '/template/style.css'

import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { Controller } from "./controller.js";
import { fragmentShader } from "./shader.js";

// // Scene, Camera and Renderer
// const scene = new THREE.Scene();

// let aspect_ratio = window.innerWidth / window.innerHeight;

// const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

// const renderer = new THREE.WebGLRenderer(
//   {
//     antialias: false,
//     precision: 'highp',
//     canvas: document.querySelector(".webgl"),
//   }
// )
// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth, window.innerHeight);

// //Controls
// const orbit = new OrbitControls(camera, renderer.domElement);

// // camera.position.setZ(30);


// //Init uniforms and materials
// const uniforms = { //GLSL types only 
//   res: {
//     type: 'vec2',
//     value: new THREE.Vector2(window.innerWidth, window.innerHeight)
//   },
//   aspect: {
//     type: 'float', value: aspect_ratio
//   }
// };

// const geometry = new THREE.PlaneGeometry(2000, 2000);
// const material = new THREE.ShaderMaterial(
//   {
//     fragmentShader: fragmentShader(), // can also just be a string
//     uniforms: uniforms
//   }
// );
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// animate();


// // // Adding objects here 
// // const obj_geometry = new THREE.BoxGeometry(5, 5, 5);
// // const material1 = new THREE.MeshStandardMaterial({ color: "#4287f5" });
// // const material2 = new THREE.MeshStandardMaterial({ color: "#f08c35" });
// // const obj = new THREE.Mesh(obj_geometry, material1);
// // scene.add(obj);

// // const plane_geometry = new THREE.PlaneGeometry(30, 30);
// // const plane = new THREE.Mesh(plane_geometry, material2);
// // // plane.rotateX(45);
// // // scene.add(plane);

// // // light
// // const light = new THREE.DirectionalLight(0xffffff, 1, 100);
// // const ambLight = new THREE.AmbientLight(0xffffff, 0.5) 
// // light.position.set(0, 10, 10);
// // scene.add(light);
// // scene.add(ambLight);

// // camera.position.z = 25;


// // updating on window size
// window.addEventListener("resize", () => {
//   camera.updateProjectionMatrix()
//   renderer.setSize(window.innerWidth, window.innerHeight)
// })

// // updating the scene
// function animate() {
//   requestAnimationFrame(animate)
//   // orbit.update();

//   renderer.render(scene, camera)
// }


let geometry, material, mesh;

// Main ================================================
function main() {
  Controller.setup();

  // add GUI
  // var gui = new dat.GUI({ width: 300 });

  // for (var key in Controller.parameters) {
  //   gui.add(Controller.parameters, key, -1.0, 1.0).onChange(Controller.changeParams);
  // }

  // create plane of shader
  geometry = new THREE.PlaneGeometry(2, 2);
  material = new THREE.ShaderMaterial({
    uniforms: Controller.uniforms,
    fragmentShader: fragmentShader(),
    glslVersion: THREE.GLSL3,
  });

  mesh = new THREE.Mesh(geometry, material);

  Controller.scene.add(mesh);

  // ANIMATE ==================
  Controller.animate();
}

window.addEventListener('resize', Controller.windowResize, false);
Controller.renderer.domElement.addEventListener('mousemove', Controller.mouseMove, false);
Controller.renderer.domElement.addEventListener('click', Controller.onClick, false);
window.addEventListener('keydown', Controller.onKeyDown, false);
window.addEventListener('keyup', Controller.onKeyUp, false);

// call to main
main();