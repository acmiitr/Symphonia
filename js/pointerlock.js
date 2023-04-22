import { Euler, EventDispatcher, Vector3 } from "three";

// let time = performance.now();
const _euler = new Euler(0, 0, 0, "YXZ");
const _vector = new Vector3();

const _changeEvent = { type: "change" };
const _lockEvent = { type: "lock" };
const _unlockEvent = { type: "unlock" };

const _PI_2 = Math.PI / 2;

class PointerLockControls extends EventDispatcher {
    constructor(camera, domElement) {
        super();

        this.camera = camera;
        this.domElement = domElement;
        // this.rDomElement = rDomElement;

        this.isLocked = false;

        // Set to constrain the pitch of the camera
        // Range is 0 to Math.PI radians
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        this.pointerSpeed = 1.0;
        this.velocity = new Vector3();
        this.direction = new Vector3();

        //Status
        this.moveForward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveBackward = false;
        this.canJump = false;

        this._onMouseMove = onMouseMove.bind(this);
        this._onPointerlockChange = onPointerlockChange.bind(this);
        this._onPointerlockError = onPointerlockError.bind(this);

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

                case "Space":
                    // if (canJump === true) velocity.y += 100;
                    this.canJump = true;
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

                case "LeftShift":
                    this.canJump = false;
                    break;
            }
        };

        this.connect();
    }

    connect() {
        this.domElement.ownerDocument.addEventListener(
            "mousemove",
            this._onMouseMove
        );
        this.domElement.ownerDocument.addEventListener(
            "pointerlockchange",
            this._onPointerlockChange
        );
        this.domElement.ownerDocument.addEventListener(
            "pointerlockerror",
            this._onPointerlockError
        );
        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    disconnect() {
        this.domElement.ownerDocument.removeEventListener(
            "mousemove",
            this._onMouseMove
        );
        this.domElement.ownerDocument.removeEventListener(
            "pointerlockchange",
            this._onPointerlockChange
        );
        this.domElement.ownerDocument.removeEventListener(
            "pointerlockerror",
            this._onPointerlockError
        );
    }

    dispose() {
        this.disconnect();
    }

    getObject() {
        // retaining this method for backward compatibility

        return this.camera;
    }

    getDirection(v) {
        return v.set(0, -1, -1).applyQuaternion(this.camera.quaternion);
    }

    fnMoveForward(distance) {
        // move forward parallel to the xz-plane
        // assumes camera.up is y-up

        const camera = this.camera;

        _vector.setFromMatrixColumn(camera.matrix, 0);

        _vector.crossVectors(camera.up, _vector);

        camera.position.addScaledVector(_vector, distance);
    }

    fnMoveRight(distance) {
        const camera = this.camera;

        _vector.setFromMatrixColumn(camera.matrix, 0);

        camera.position.addScaledVector(_vector, distance);
    }

    lock() {
        this.domElement.requestPointerLock();
    }

    unlock() {
        this.domElement.ownerDocument.exitPointerLock();
    }

    update(time) {
        const currentTime = performance.now();
        console.log("Locked", this.getObject().position);

        if (this.isLocked === true) {
            const delta = (currentTime - time) / 100;

            this.velocity.x -= this.velocity.x * 1 * delta;
            this.velocity.z -= this.velocity.z * 1 * delta;

            this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

            this.direction.z =
                Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize(); // this ensures consistent movements in all directions

            if (this.moveForward || this.moveBackward)
                this.velocity.z -= this.direction.z * 400.0 * delta;
            if (this.moveLeft || this.moveRight)
                this.velocity.x -= this.direction.x * 400.0 * delta;

            this.fnMoveRight(-this.velocity.x * delta);
            this.fnMoveForward(-this.velocity.z * delta);

            this.getObject().position.y += this.velocity.y * delta; // new behavior

            if (this.getObject().position.y < 10) {
                this.velocity.y = 0;
                this.getObject().position.y = 10;

                this.canJump = false;
            }

            console.log(delta)
        }
        time = currentTime;
        return currentTime;
    }
}

// event listeners

function onMouseMove(event) {
    if (this.isLocked === false) return;

    const movementX =
        event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY =
        event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    const camera = this.camera;
    _euler.setFromQuaternion(camera.quaternion);

    _euler.y -= movementX * 0.002 * this.pointerSpeed;
    _euler.x -= movementY * 0.002 * this.pointerSpeed;

    _euler.x = Math.max(
        _PI_2 - this.maxPolarAngle,
        Math.min(_PI_2 - this.minPolarAngle, _euler.x)
    );

    camera.quaternion.setFromEuler(_euler);

    this.dispatchEvent(_changeEvent);
}

function onPointerlockChange() {
    if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
        this.dispatchEvent(_lockEvent);

        this.isLocked = true;
    } else {
        this.dispatchEvent(_unlockEvent);

        this.isLocked = false;
    }
}

function onPointerlockError() {
    console.error("THREE.PointerLockControls: Unable to use Pointer Lock API");
}

export { PointerLockControls };
