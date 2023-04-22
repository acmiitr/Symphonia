import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { FirstPersonCamera } from "./input_controller.js";
import { fragmentShader } from "./shader.js";

class App {
	// screen data
	constructor() {
		this.initRenderer();
		this.initFractalParams();
		this.initUniforms();
		this.initializeDemo();
		this.previousRAF_ = null;
		this.raf();
		this.onWindowResize();
	}

	initRenderer() {
		this.renderer = new THREE.WebGLRenderer({ antialias: false, precision: 'highp' });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		document.body.appendChild(this.renderer.domElement);

		window.addEventListener('resize', () => {
			this.onWindowResize();
		}, false);

		const fov = 60.0;
		const aspect = window.innerWidth / window.innerHeight;
		const near = 1.0;
		const far = 1000.0;

		this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		this.camera.position.set(0.0, 2.0, 5.0);
		this.camFront = new THREE.Vector3();
		this.camera.getWorldDirection(this.camFront);

		this.scene = new THREE.Scene();

		// create plane for shader
		const canvas_plane = new THREE.Mesh(
			new THREE.PlaneGeometry(2, 2),
			new THREE.ShaderMaterial({
				uniforms: this.uniforms,
				fragmentShader: fragmentShader(),
				glslVersion: THREE.GLSL3,
			})
		)
		this.scene.add(canvas_plane);

	}
	initFractalParams() {
		this.MAX_MARCHING_STEPS = 64;
		this.MIN_DISTANCE = 0.00001;
		this.MAX_DISTANCE = 1000.0;
		this.ITERATIONS = 100;
		this.sphere_fold_min_radius = 0.01;
		this.sphere_fold_fixed_radius = 2.0;
	}

	initUniforms() {
		this.clock = new THREE.Clock();

		this.uniforms = {
			iResolution: { type: 'vec2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
			iTime: { type: 'float', value: 0.0 },
			iTimeDelta: { type: 'float', value: 0.0 },


			// aspect: { type: 'float', value: this.aspect },

			camPos: { type: 'vec3', value: this.camera.position },
			camFOV: { type: 'float', value: this.fov },
			camFront: { type: 'vec3', value: this.camFront },
			camUp: { type: 'vec3', value: this.camera.up },

			MAX_MARCHING_STEPS: { type: 'int', value: this.MAX_MARCHING_STEPS },
			MIN_DISTANCE: { type: 'float', value: this.MIN_DISTANCE },
			MAX_DISTANCE: { type: 'float', value: this.MAX_DISTANCE },
			ITERATIONS: { type: 'int', value: this.ITERATIONS },

			sphere_fold_fixed_radius: { type: 'float', value: this.sphere_fold_fixed_radius },
			sphere_fold_min_radius: { type: 'float', value: this.sphere_fold_min_radius },
		};
	}

	updateUniforms() {
		this.uniforms.iTime.value = this.clock.getElapsedTime();
		this.uniforms.iTimeDelta.value = this.clock.getDelta();
	}


	initializeDemo() {
		this.controls = new FirstPersonControls(
			this.camera, this.renderer.domElement
		);
		this.controls.lookSpeed = 0.8;
		this.controls.movementSpeed = 5;

		this.fpsCamera = new FirstPersonCamera(this.camera);
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	raf() {
		requestAnimationFrame((t) => {
			if (this.previousRAF_ === null) {
				this.previousRAF_ = t;
			}

			this.step(t - this.previousRAF_);
			this.updateUniforms();
			this.renderer.autoClear = true;
			this.renderer.render(this.scene, this.camera);
			this.previousRAF_ = t;
			this.raf();
		});
	}

	step(timeElapsed) {
		const timeElapsedS = timeElapsed * 0.001;

		this.controls.update(timeElapsedS);
		this.fpsCamera.update(timeElapsedS);
	}

}

export { App }