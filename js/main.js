import '/template/style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Scene, Camera and Renderer
const scene = new THREE.Scene();

let aspect_ratio = window.innerWidth / window.innerHeight;

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

const renderer = new THREE.WebGLRenderer(
  {
    antialias: false,
    precision: 'highp',
    canvas: document.querySelector(".webgl"),
  }
)
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//Controls
const orbit = new OrbitControls(camera, renderer.domElement);

// camera.position.setZ(30);


//Init uniforms and materials
const uniforms = { //GLSL types only 
  res: {
    type: 'vec2',
    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
  },
  aspect: {
    type: 'float', value: aspect_ratio
  }
};

const geometry = new THREE.PlaneGeometry(2000, 2000);
const material = new THREE.ShaderMaterial(
  {
    fragmentShader: fragmentShader(), // can also just be a string
    uniforms: uniforms
  }
);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

animate();


// // Adding objects here 
// const obj_geometry = new THREE.BoxGeometry(5, 5, 5);
// const material1 = new THREE.MeshStandardMaterial({ color: "#4287f5" });
// const material2 = new THREE.MeshStandardMaterial({ color: "#f08c35" });
// const obj = new THREE.Mesh(obj_geometry, material1);
// scene.add(obj);

// const plane_geometry = new THREE.PlaneGeometry(30, 30);
// const plane = new THREE.Mesh(plane_geometry, material2);
// // plane.rotateX(45);
// // scene.add(plane);

// // light
// const light = new THREE.DirectionalLight(0xffffff, 1, 100);
// const ambLight = new THREE.AmbientLight(0xffffff, 0.5) 
// light.position.set(0, 10, 10);
// scene.add(light);
// scene.add(ambLight);

// camera.position.z = 25;


// updating on window size
window.addEventListener("resize", () => {
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// updating the scene
function animate() {
  requestAnimationFrame(animate)
  // orbit.update();

  renderer.render(scene, camera)
}


function fragmentShader() {
  return `
    precision highp float;
    uniform vec2 res;
    uniform float aspect;

    float mandelbrot(vec2 c){
      int max_iter = 400;
      float alpha = 1.0;
      vec2 z = vec2(0.0 , 0.0);      
      for(int i = 0; i < max_iter; i++){  // i < max iterations        
        float x_sq = z.x*z.x;
        float y_sq = z.y*z.y;
        vec2 z_sq = vec2(x_sq - y_sq, 2.0*z.x*z.y);        
        
        z = z_sq + c;        
        if(x_sq + y_sq > 4.0){
          alpha = float(i)/float(max_iter);
          break;
        }
      }
      return alpha;
    }  
    
    void main(){ // gl_FragCoord in [0,1]
      vec2 uv = 4.0 * vec2(aspect, 1.0) * gl_FragCoord.xy / res -2.0*vec2(aspect, 1.0);
      float s = 1.0 - mandelbrot(uv);
      vec3 coord = vec3(s, s, s);
      gl_FragColor = vec4(pow(coord, vec3(7.0, 8.0, 5.0)), 1.0);
    }
  `
}