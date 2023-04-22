function fragmentShader() {
	return `
	// #version 500 es
	// out vec4 fragColor;
	// in vec4 gl_FragCoord;

	precision highp float;

	//uniforms
	uniform vec2 iResolution;
	uniform float iTime;
	uniform float iTimeDelta;

	uniform vec3 camPos;
	uniform vec3 camFront;
	uniform vec3 camUp;
	uniform float camFOV;

	uniform int MAX_MARCHING_STEPS;
	uniform float MIN_DIST;
	uniform float MAX_DIST;
	uniform int ITERATIONS;

	uniform float sphere_fold_min_radius;
	uniform float sphere_fold_fixed_radius;

	void main(){
		gl_FragColor = vec4(0.2, 0.5, 0.2,  1.0);
	}

`;
}
export { fragmentShader };
