import * as THREE from "three";

import { MathUtils, Spherical, Vector3 } from "three";

const _lookDirection = new Vector3();
const _spherical = new Spherical();
const _target = new Vector3();

class FirstPersonControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        // API

        this.enabled = true;

        this.movementSpeed = 1.0;
        this.lookSpeed = 0.005;

        this.lookVertical = true;
        this.autoForward = false;

        this.activeLook = true;

        this.heightSpeed = false;
        this.heightCoef = 1.0;
        this.heightMin = 0.0;
        this.heightMax = 1.0;

        this.constrainVertical = false;
        this.verticalMin = 0;
        this.verticalMax = Math.PI;

        this.mouseDragOn = false;

        // internals

        this.autoSpeedFactor = 0.0;

        this.pointerX = 0;
        this.pointerY = 0;

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        this.viewHalfX = 0;
        this.viewHalfY = 0;

        // private variables

        let lat = 0;
        let lon = 0;

        //fractal params
        this.MAX_MARCHING_STEPS = 64;
        this.MIN_DISTANCE = 0.00001;
        this.MAX_DISTANCE = 1000.0;
        this.ITERATIONS = 100;
        this.sphere_fold_min_radius = 0.01;
        this.sphere_fold_fixed_radius = 2.0;

        //uniforms
        this.uniforms = {
            iResolution: {
                type: "vec2",
                value: new THREE.Vector2(window.innerWidth, window.innerHeight),
            },
            iTime: { type: "float", value: 1.0 },
            iTimeDelta: { type: "float", value: 0.0 },

            // aspect: { type: "float", value: this.aspect },

            camPos: { type: "vec3", value: new THREE.Vector3(0.0, 2.0, 5.0) },
            camFOV: { type: "float", value: 60.0 },
            camFront: {
                type: "vec3",
                value: new THREE.Vector3(0.0, 0.0, -1.0),
            },
            camUp: { type: "vec3", value: new THREE.Vector3(0.0, 1.0, 0.0) },

            MAX_MARCHING_STEPS: { type: "int", value: this.MAX_MARCHING_STEPS },
            MIN_DISTANCE: { type: "float", value: this.MIN_DISTANCE },
            MAX_DISTANCE: { type: "float", value: this.MAX_DISTANCE },
            ITERATIONS: { type: "int", value: this.ITERATIONS },

            sphere_fold_fixed_radius: {
                type: "float",
                value: this.sphere_fold_fixed_radius,
            },
            sphere_fold_min_radius: {
                type: "float",
                value: this.sphere_fold_min_radius,
            },
        };

        this.handleResize = function () {
            if (this.domElement === document) {
                this.viewHalfX = window.innerWidth / 2;
                this.viewHalfY = window.innerHeight / 2;
            } else {
                this.viewHalfX = this.domElement.offsetWidth / 2;
                this.viewHalfY = this.domElement.offsetHeight / 2;
            }
        };

        this.onPointerDown = function (event) {
            if (this.domElement !== document) {
                this.domElement.focus();
            }

            if (this.activeLook) {
                switch (event.button) {
                    case 0:
                        this.moveForward = true;
                        break;
                    case 2:
                        this.moveBackward = true;
                        break;
                }
            }

            this.mouseDragOn = true;
        };

        this.onPointerUp = function (event) {
            if (this.activeLook) {
                switch (event.button) {
                    case 0:
                        this.moveForward = false;
                        break;
                    case 2:
                        this.moveBackward = false;
                        break;
                }
            }

            this.mouseDragOn = false;
        };

        this.onPointerMove = function (event) {
            if (this.domElement === document) {
                this.pointerX = event.pageX - this.viewHalfX;
                this.pointerY = event.pageY - this.viewHalfY;
            } else {
                this.pointerX =
                    event.pageX - this.domElement.offsetLeft - this.viewHalfX;
                this.pointerY =
                    event.pageY - this.domElement.offsetTop - this.viewHalfY;
            }
        };

        this.onKeyDown = function (event) {
            switch (event.code) {
                case "ArrowUp":
                case "KeyW":
                    this.moveForward = true;
                    break;

                case "ArrowLeft":
                case "KeyA":
                    this.moveLeft = true;
                    break;

                case "ArrowDown":
                case "KeyS":
                    this.moveBackward = true;
                    break;

                case "ArrowRight":
                case "KeyD":
                    this.moveRight = true;
                    break;

                case "KeyR":
                    this.moveUp = true;
                    break;
                case "KeyF":
                    this.moveDown = true;
                    break;
            }
        };

        this.onKeyUp = function (event) {
            switch (event.code) {
                case "ArrowUp":
                case "KeyW":
                    this.moveForward = false;
                    break;

                case "ArrowLeft":
                case "KeyA":
                    this.moveLeft = false;
                    break;

                case "ArrowDown":
                case "KeyS":
                    this.moveBackward = false;
                    break;

                case "ArrowRight":
                case "KeyD":
                    this.moveRight = false;
                    break;

                case "KeyR":
                    this.moveUp = false;
                    break;
                case "KeyF":
                    this.moveDown = false;
                    break;
            }
        };

        this.lookAt = function (x, y, z) {
            if (x.isVector3) {
                _target.copy(x);
            } else {
                _target.set(x, y, z);
            }

            this.camera.lookAt(_target);

            setOrientation(this);

            return this;
        };

        this.update = function (delta, elapsedTime) {
            const targetPosition = new Vector3();

            if (this.enabled === false) return;

            if (this.heightSpeed) {
                const y = MathUtils.clamp(
                    this.camera.position.y,
                    this.heightMin,
                    this.heightMax
                );
                const heightDelta = y - this.heightMin;

                this.autoSpeedFactor = delta * (heightDelta * this.heightCoef);
            } else {
                this.autoSpeedFactor = 0.0;
            }

            const actualMoveSpeed = delta * this.movementSpeed;

            if (this.moveForward || (this.autoForward && !this.moveBackward))
                this.camera.translateZ(
                    -(actualMoveSpeed + this.autoSpeedFactor)
                );
            if (this.moveBackward) this.camera.translateZ(actualMoveSpeed);

            if (this.moveLeft) this.camera.translateX(-actualMoveSpeed);
            if (this.moveRight) this.camera.translateX(actualMoveSpeed);

            if (this.moveUp) this.camera.translateY(actualMoveSpeed);
            if (this.moveDown) this.camera.translateY(-actualMoveSpeed);

            let actualLookSpeed = delta * this.lookSpeed;

            if (!this.activeLook) {
                actualLookSpeed = 0;
            }

            let verticalLookRatio = 1;

            if (this.constrainVertical) {
                verticalLookRatio =
                    Math.PI / (this.verticalMax - this.verticalMin);
            }

            lon -= this.pointerX * actualLookSpeed;
            if (this.lookVertical)
                lat -= this.pointerY * actualLookSpeed * verticalLookRatio;

            lat = Math.max(-85, Math.min(85, lat));

            let phi = MathUtils.degToRad(90 - lat);
            const theta = MathUtils.degToRad(lon);

            if (this.constrainVertical) {
                phi = MathUtils.mapLinear(
                    phi,
                    0,
                    Math.PI,
                    this.verticalMin,
                    this.verticalMax
                );
            }

            const position = this.camera.position;

            targetPosition.setFromSphericalCoords(1, phi, theta).add(position);

            this.camera.lookAt(targetPosition);
            // this.updateUniforms();
            // console.log(this.pointerX);
            // console.log(this.pointerY);
            // console.log(this.mouseDragOn)                console.log(this.camera.position);

            this.uniforms.iTime.value = elapsedTime;
            // this.uniforms.iTime.needsUpdate = true;
            this.uniforms.iTimeDelta.value = delta;
            this.uniforms.camPos.value = this.camera.position;
            this.domm = new THREE.Vector3();
            this.camera.getWorldDirection(this.domm);
            this.uniforms.camFront.value = this.domm;
            this.uniforms.camFOV.value = this.camera.fov;
            this.uniforms.camUp.value = new THREE.Vector3(0.0, 1.0, 0.0);

            // shaderMaterial.uniforms.iTime.value = elapsedTime;

            // console.log(this.uniforms.iTime);
        };

        this.dispose = function () {
            this.domElement.removeEventListener("contextmenu", contextmenu);
            this.domElement.removeEventListener("pointerdown", _onPointerDown);
            this.domElement.removeEventListener("pointermove", _onPointerMove);
            this.domElement.removeEventListener("pointerup", _onPointerUp);

            window.removeEventListener("keydown", _onKeyDown);
            window.removeEventListener("keyup", _onKeyUp);
        };

        const _onPointerMove = this.onPointerMove.bind(this);
        const _onPointerDown = this.onPointerDown.bind(this);
        const _onPointerUp = this.onPointerUp.bind(this);
        const _onKeyDown = this.onKeyDown.bind(this);
        const _onKeyUp = this.onKeyUp.bind(this);

        this.domElement.addEventListener("contextmenu", contextmenu);
        this.domElement.addEventListener("pointerdown", _onPointerDown);
        this.domElement.addEventListener("pointermove", _onPointerMove);
        this.domElement.addEventListener("pointerup", _onPointerUp);

        window.addEventListener("keydown", _onKeyDown);
        window.addEventListener("keyup", _onKeyUp);

        function setOrientation(controls) {
            const quaternion = controls.camera.quaternion;

            _lookDirection.set(0, 0, -1).applyQuaternion(quaternion);
            _spherical.setFromVector3(_lookDirection);

            lat = 90 - MathUtils.radToDeg(_spherical.phi);
            lon = MathUtils.radToDeg(_spherical.theta);
        }

        this.handleResize();

        setOrientation(this);
    }

    // static updateUniforms(delta) {
    //     this.uniforms.iTime.value = this.clock.getElapsedTime();
    //     this.uniforms.iTimeDelta.value = this.clock.getDelta();

    //     // this.updateCameraPosition();

    //     if (Controller.mouseMoved) {
    //         Controller.mouseMoved = false;

    //         if (!Controller.firstMouseMove) {
    //             Controller.updateCameraRotation();
    //         } else {
    //             Controller.firstMouseMove = false;
    //         }
    //     }

    //     if (Controller.updates.aspect) {
    //         Controller.uniforms.iResolution.value = new THREE.Vector2(
    //             window.innerWidth,
    //             window.innerHeight
    //         );
    //         Controller.uniforms.aspect.value =
    //             window.innerWidth / window.innerHeight;
    //     }

    //     /**
    //      * Controller.updates flags which uniforms need to be updated each frame
    //      * This method runs through that dictionary and updates the shader
    //      * uniforms which have been flagged for updating.
    //      *
    //      * Running this every frame is more efficient than running it after every event.
    //      */
    //     for (var key in Controller.updates) {
    //         Controller.updates[key] = false;
    //     }
    // }
}

function contextmenu(event) {
    event.preventDefault();
}

export { FirstPersonControls };
