import '../template/style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

let model, skeleton, mixer, clock;

// Scene, Camera and Renderer

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xa0a0a0 );
scene.fog = new THREE.Fog( 0xa0a0a0, 1, 50 );

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
const geom = new THREE.BoxGeometry(5, 5, 5)
const material = new THREE.MeshStandardMaterial({ color: "#00ff83" })
const box = new THREE.Mesh(geom, material)
// scene.add(box)

const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
mesh.rotation.x = - Math.PI / 2;
mesh.receiveShadow = true;
scene.add(mesh);
        
const loader = new GLTFLoader();

loader.load('../assets/Fox.glb', function (gltf) {
  gltf.scene.traverse( function ( child ) {
        if ( child.isMesh ) {
            child.geometry.center(); // center here
        }
    });
  gltf.scene.scale.set(0.10, 0.10, 0.10); //scale here
  model = gltf.scene;
  scene.add(model);
  
  model.traverse( function ( object ) {

					if ( object.isMesh ) object.castShadow = true;

	} );

	// 				//

	skeleton = new THREE.SkeletonHelper( model );
	skeleton.visible = true;
	scene.add( skeleton );

					//

	createPanel();


					//

	const animations = gltf.animations;

	mixer = new THREE.AnimationMixer( model );

	idleAction = mixer.clipAction( animations[ 0 ] );
	walkAction = mixer.clipAction( animations[ 2 ] );
	runAction = mixer.clipAction( animations[ 1 ] );

	actions = [ idleAction ];

	activateAllActions();
	animate();


}, undefined, function ( error ) {

	console.error( error );

});

// cont planeMat = new THREE.

// light
const light = new THREE.DirectionalLight(0xffffff, 1, 100)
light.position.set(0, 10, 30)
light.castShadow = true;
scene.add(light)

const lightHelper = new THREE.DirectionalLightHelper(light, 1);
scene.add(lightHelper);

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