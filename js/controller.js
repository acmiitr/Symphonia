import * as THREE from 'three';

class Controller {
	// GLOBALS ================================================
	// screen data
	static aspect = window.innerWidth / window.innerHeight;

	static clock = new THREE.Clock();

	// mouse data
	static firstMouseMove = true;
	static mouseMoved = true;
	static mouseX = 0.0;
	static mouseY = 0.0;
	static mouseXDelta = 0.0;
	static mouseXDelta = 0.0;
	static trackMouse = false;

	// keyboard input data
	static keyTracker = {
		"w": false,
		"a": false,
		"s": false,
		"d": false,
		" ": false,
		"Shift": false,
	};

	// camera data
	static camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
	static cameraX = new THREE.Vector3(-0.61, 0.0, -0.79);
	static cameraY = new THREE.Vector3(-0.79, 0.0, 0.61);
	static cameraZ = new THREE.Vector3(0.0, 1.0, 0.0);
	static cameraPos = new THREE.Vector3(1.15, 0.11, -1.2);
	static cameraFront = new THREE.Vector3(-0.01, -0.3, -1.0).normalize();
	static cameraUp = new THREE.Vector3(0.0, 1.0, 0.0).normalize();
	static cameraFOV = 90.0;


	//fractal uniforms
	static MAX_MARCHING_STEPS = 64;
	static MIN_DISTANCE = 0.00001;
	static MAX_DISTANCE = 1000.0;
	static ITERATIONS = 100;
	static sphere_fold_min_radius = 0.01;
	static sphere_fold_fixed_radius = 2.0;


	//Coordinate data
	static globalX = new THREE.Vector3(1.0, 0.0, 0.0);
	static globalY = new THREE.Vector3(0.0, 1.0, 0.0);
	static globalZ = new THREE.Vector3(0.0, 0.0, 1.0);


	// data passed to shader
	// uniforms
	static uniforms = {
		iResolution: { type: 'vec2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
		iTime: {type: 'float', value : 0.0},
		iTimeDelta: {type: 'float', value : 0.0},
		
		
		aspect: { type: 'float', value: Controller.aspect },

		cameraX: { type: 'vec3', value: Controller.cameraX },
		cameraY: { type: 'vec3', value: Controller.cameraY },
		cameraZ: { type: 'vec3', value: Controller.cameraZ },
		
		camPos: { type: 'vec3', value: Controller.cameraPos },
		camFOV: {type: 'float', value : Controller.cameraFOV},
		camFront: {type: 'vec3', value : Controller.cameraFront},
		camUp: {type: 'vec3', value : Controller.cameraUp},

		MAX_MARCHING_STEPS: {type: 'int', value : Controller.MAX_MARCHING_STEPS},
		MIN_DISTANCE: {type: 'float', value : Controller.MIN_DISTANCE},
		MAX_DISTANCE: {type: 'float', value : Controller.MAX_DISTANCE},
		ITERATIONS: {type: 'int', value : Controller.ITERATIONS},
		
		sphere_fold_fixed_radius: {type: 'float', value : Controller.sphere_fold_fixed_radius},
		sphere_fold_min_radius: {type: 'float', value : Controller.sphere_fold_min_radius},
	};

	// THREE.js objects
	static scene = new THREE.Scene();
	static renderer = new THREE.WebGLRenderer({ antialias: false, precision: 'highp' });


	// SETUP ================================================
	static setup() {
		Controller.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(Controller.renderer.domElement);

		Controller.updates = {
			aspect: false,
		};
	}


	// ANIMATION ================================================
	static animate() {
		Controller.updateUniforms();
		
		// console.log(Controller.cameraPos);
		// console.log(Controller.mouseX);
		// console.log(Controller.mouseY);
		// console.log(Controller.mouseMoved);
		// console.log(Controller.keyTracker);
		// console.log(Controller.uniforms.iTime);

		Controller.renderer.render(Controller.scene, Controller.camera);
		requestAnimationFrame(Controller.animate);
	}

	static updateUniforms() {
		
		Controller.uniforms.iTime.value = Controller.clock.getElapsedTime(); 
		Controller.uniforms.iTimeDelta.value = Controller.clock.getDelta(); 

		Controller.updateCameraPosition();

		if (Controller.mouseMoved) {
			Controller.mouseMoved = false;

			if (!Controller.firstMouseMove) {
				Controller.updateCameraRotation()
			}
			else {
				Controller.firstMouseMove = false;
			}
		}

		if (Controller.updates.aspect) {
			Controller.uniforms.iResolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
			Controller.uniforms.aspect.value = window.innerWidth / window.innerHeight;
		}

		/**
		* Controller.updates flags which uniforms need to be updated each frame
		* This method runs through that dictionary and updates the shader
		* uniforms which have been flagged for updating.
		* 
		* Running this every frame is more efficient than running it after every event.
		*/
		for (var key in Controller.updates) {
			Controller.updates[key] = false;
		}
	}

	// update the camera's position when a given key has been held down
	static updateCameraPosition() {
		if (Controller.keyTracker["w"]) {
			var cameraYDirection = Controller.cameraY.clone().multiplyScalar(0.05);
			Controller.cameraPos.add(cameraYDirection);
		}
		if (Controller.keyTracker["a"]) {
			var cameraXDirection = Controller.cameraX.clone().multiplyScalar(0.05);
			Controller.cameraPos.sub(cameraXDirection);
		}
		if (Controller.keyTracker["s"]) {
			var cameraYDirection = Controller.cameraY.clone().multiplyScalar(0.05);
			Controller.cameraPos.sub(cameraYDirection);
		}
		if (Controller.keyTracker["d"]) {
			var cameraXDirection = Controller.cameraX.clone().multiplyScalar(0.05);
			Controller.cameraPos.add(cameraXDirection);
		}
		if (Controller.keyTracker[" "]) {
			var cameraZDirection = Controller.cameraZ.clone().multiplyScalar(0.05);
			Controller.cameraPos.add(cameraZDirection);
		}
		if (Controller.keyTracker["Shift"]) {
			var cameraZDirection = Controller.cameraZ.clone().multiplyScalar(0.05);
			Controller.cameraPos.sub(cameraZDirection);
		}
	}

	static updateCameraRotation() {
		// rotate the shader camera
		// TODO: maybe take new declarations out of this method

		let zRotation = new THREE.Quaternion();
		let xRotation = new THREE.Quaternion();

		zRotation.setFromAxisAngle(Controller.globalY, -Controller.mouseXDelta / 300.0);

		Controller.cameraX.applyQuaternion(zRotation);
		Controller.cameraY.applyQuaternion(zRotation);
		Controller.cameraZ.applyQuaternion(zRotation);

		xRotation.setFromAxisAngle(Controller.cameraX, -Controller.mouseYDelta / 300.0);

		Controller.cameraX.applyQuaternion(xRotation);
		Controller.cameraY.applyQuaternion(xRotation);
		Controller.cameraZ.applyQuaternion(xRotation);

		// set mouse position and reset the difference trackers
		Controller.mouseX += Controller.mouseXDelta;
		Controller.mouseY += Controller.mouseYDelta;

		Controller.mouseXDelta = 0.0;
		Controller.mouseYDelta = 0.0;
	}


	// EVENTS ================================================
	static windowResize() {
		Controller.aspect = window.innerWidth / window.innerHeight;
		Controller.camera.aspect = Controller.aspect;
		Controller.camera.updateProjectionMatrix();
		Controller.renderer.setSize(window.innerWidth, window.innerHeight - 2);

		Controller.updates.aspect = true;
	}

	static mouseMove(event) {
		if (Controller.trackMouse) {
			// track how much the mouse has changed from the last animation frame
			Controller.mouseXDelta = event.clientX - Controller.mouseX;
			Controller.mouseYDelta = event.clientY - Controller.mouseY;

			Controller.mouseMoved = true;
		}
	}

	static onClick(event) {
		Controller.trackMouse = !Controller.trackMouse;

		Controller.mouseX = event.clientX;
		Controller.mouseY = event.clientY;
	}

	static onKeyDown(event) {
		if (event.key in Controller.keyTracker) {
			Controller.keyTracker[event.key] = true;
		}
	}

	static onKeyUp(event) {
		if (event.key in Controller.keyTracker) {
			Controller.keyTracker[event.key] = false;
		}
	}

	static changeParams() {

	}
}

export { Controller };