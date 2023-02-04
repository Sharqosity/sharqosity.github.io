//import * as THREE from './three/src/Three.js';
import * as THREE from './three/build/three.min.js';

import { RGBELoader } from './three/examples/jsm/loaders/RGBELoader.js';

/* Ray class:
 * o: origin (THREE.Vector3)
 * d: normalized direction (THREE.Vector3)
 */
export class Ray {
	constructor(origin, direction) {
		this.o = origin.clone();
		this.d = direction.clone();
		this.d.normalize();
	}
	pointAt(t) {
		// P(t) = o + t*d
		let point = this.o.clone();
		point.addScaledVector(this.d, t);
		return point;
	}
	direction() { return this.d; }
	origin() { return this.o; }
}

let imageWidth;
let imageHeight;
let exposure;
let backgroundColor;
let ambientLight;
let maxDepth;
let camera;
let shapes;
let lights;
let environment;
let tex;
let texData;


let antiAliasing;
let superSamplingScale;
let ambientOcclusionSamples;


export function render(sceneDef) {

	imageWidth = sceneDef.imageWidth;
	imageHeight = sceneDef.imageHeight;
	exposure = sceneDef.exposure;
	backgroundColor = sceneDef.backgroundColor;
	ambientLight = sceneDef.ambientLight;
	maxDepth = sceneDef.maxDepth;
	camera = sceneDef.camera;
	shapes = sceneDef.shapes;
	lights = sceneDef.lights;
	environment = sceneDef.environment;
	antiAliasing = sceneDef.antiAliasing;
	superSamplingScale = sceneDef.superSamplingScale;
	ambientOcclusionSamples = sceneDef.ambientOcclusionSamples;

	document.getElementById('status').innerHTML = 'Raytracing started...';

	// create canvas of size imageWidth x imageHeight and add to DOM
	let canvas = document.createElement('canvas');
	canvas.width = imageWidth;
	canvas.height = imageHeight;
	canvas.style = 'background-color:red';
	document.body.appendChild(canvas);
	let ctx2d = canvas.getContext('2d'); // get 2d context
	let image = ctx2d.getImageData(0, 0, imageWidth, imageHeight); // get image data
	let pixels = image.data; // get pixel array

	let row = 0;
	let idx = 0;
	let chunksize = 10; // render 10 rows at a time

	function chunk() {
		// 	render a chunk of rows
		for (let j = row; j < row + chunksize && j < imageHeight; j++) {
			for (let i = 0; i < imageWidth; i++, idx += 4) { // i loop
				// compute normalized pixel coordinate (x,y)
				let x = i / imageWidth;
				let y = (imageHeight - 1 - j) / imageHeight;

				if (antiAliasing === 1 || antiAliasing === 2) {
					let grid = 1 / superSamplingScale;
					let color = new THREE.Color(0, 0, 0);
					for (let k = 0; k < superSamplingScale; k = k + 1) {
						for (let l = 0; l < superSamplingScale; l = l + 1) {
							let shiftX;
							let shiftY;
							if (antiAliasing === 1) { //Uniform supersampling
								shiftX = grid / 2;
								shiftY = grid / 2;
							} else if (antiAliasing === 2) { //Jittered supersampling
								shiftX = Math.random() / superSamplingScale;
								shiftY = Math.random() / superSamplingScale;
							}

							let newX = x + ((grid * l + shiftX) / imageWidth);
							let newY = y - (((grid * k) - shiftY) / imageHeight);
							let ray = camera.getCameraRay(newX, newY);

							color.add(raytracing(ray, 0));

						}
					}
					color.multiplyScalar(1 / (superSamplingScale * superSamplingScale));
					setPixelColor(pixels, idx, color);
				} else {  //No antialiasing
					let ray = camera.getCameraRay(x, y);
					let color = raytracing(ray, 0);
					setPixelColor(pixels, idx, color);
				}

			}
		}
		row += chunksize;  // non-blocking j loop
		if (row < imageHeight) {
			setTimeout(chunk, 0);
			ctx2d.putImageData(image, 0, 0); // display intermediate image
		} else {
			ctx2d.putImageData(image, 0, 0); // display final image
			document.getElementById('status').innerHTML = 'Done.';
		}


		//Function to draw the loaded environment map for testing
		/*
		let w = texData.width;
		let h = texData.height;
		for (let i = 0; i < h; i = i + 1) {
			for (let j = 0; j < w; j = j + 1) {
				let idx = 4 * (i * w + j);
				let red = Math.floor(tex.image.data[idx + 0]);
				let green = Math.floor(tex.image.data[idx + 1]);
				let blue = Math.floor(tex.image.data[idx + 2]);
				let exponent = tex.image.data[idx + 3];
				let float;
				if (exponent !== 0) { //nonzero pixel
					float = ldexp(1.0, exponent - (128 + 8));
					red = red * float;
					green = green * float;
					blue = blue * float;
				}
				else {
					red = 0;
					green = 0;
					blue = 0;
				}
				let color = new THREE.Color(red, green, blue);
				setPixelColor(pixels, idx, color);
			}
		}
		ctx2d.putImageData(image, 0, 0);
		*/

	}

	if (environment !== null) {
		new RGBELoader()
			.setDataType(THREE.UnsignedByteType)
			.load(environment, function (texture, textureData) {
				tex = texture;
				texData = textureData;
				//Start raytracing after the light probe has been loaded
				chunk();

			});
	} else {
		chunk();
	}
}


/* Trace ray in the scene and return color of ray. 'depth' is the current recursion depth.
 * If intersection material has non-null kr or kt, perform recursive ray tracing. */
function raytracing(ray, depth) {
	let color = new THREE.Color(0, 0, 0);
	let isect = rayIntersectScene(ray);
	if (isect === null) {
		if (environment !== null) { //Image based lighting
			let x = ray.direction().x;
			let y = ray.direction().y;
			let z = ray.direction().z;
			// let theta = Math.atan(y / x);
			// let phi = Math.acos(z / Math.sqrt(x * x + y * y + z * z));
			return getFromEnv(x, y, z);
		} else { //Background color
			return backgroundColor;
		}

	} else { //Shade
		if ((isect.material.kr || isect.material.kt) && depth < maxDepth) {
			if (isect.material.kr) { //reflect
				let n = isect.normal.clone();
				let r = new Ray(isect.position.clone(), reflect(ray.direction().clone(), n.clone()).negate());
				color.add(raytracing(r, depth + 1).multiply(isect.material.kr));
			}
			if (isect.material.kt) { //refract
				let n = isect.normal.clone();
				let r_direction = refract(ray.direction().clone(), n.clone(), isect.material.ior);
				if (r_direction) {
					let r = new Ray(isect.position.clone(), r_direction);
					color.add(raytracing(r, depth + 1).multiply(isect.material.kt));
				}
			}

		} else {
			return shading(ray, isect);

		}

	}

	return color;
}



/* Compute and return shading color given a ray and the intersection point structure. */
function shading(ray, isect) {
	let color = new THREE.Color(0, 0, 0);

	//Add ambient light
	if (isect.material.ka) {
		color.add(isect.material.ka.clone().multiply(ambientLight));
	}

	//Diffuse and specular contribution from lights
	let material = isect.material;
	let n = isect.normal.clone();

	for (let i = 0; i < lights.length; i = i + 1) {
		let lightSample = lights[i].getLight(isect.position);
		let shadowRay = new Ray(isect.position, lightSample.direction);
		let distToLight = (lightSample.position.clone().sub(isect.position)).length();
		let shadow_isect = rayIntersectScene(shadowRay);

		if (shadow_isect && shadow_isect.t < distToLight) { //Shadowed
			continue;
		}

		//Shading
		let l = lightSample.direction.clone();
		
		let v = ray.direction().clone().negate();
		let r = reflect(l, n);/*.normalize();*/

		//Diffuse/lambertian
		if (material.kd) {
			color.add(
				lightSample.intensity.clone()
					.multiply(material.kd)
					.multiplyScalar(Math.max(n.clone().dot(l), 0))
			);
		}

		//Specular/phong
		if (material.ks) {
			color.add(
				lightSample.intensity.clone()
					.multiply(material.ks)
					.multiplyScalar(Math.pow(Math.max(r.clone().dot(v), 0), material.p))
			);
		}

	}

	//Ambient occlusion
	let AO_factor = new THREE.Color(0, 0, 0);
	let successfulSamples = 0;
	//for (let i = 0; i < ambientOcclusionSamples; i = i + 1) {
	while (successfulSamples < ambientOcclusionSamples) {
		//Random spherical coordinates
		let theta = Math.acos(1 - 2 * Math.random());
		let phi = 2 * Math.PI * Math.random();

		//Convert spherical coordinates to xyz
		let x = Math.sin(phi) * Math.cos(theta);
		let y = Math.cos(theta);
		let z = Math.sin(phi) * Math.sin(theta);

		let direction = new THREE.Vector3(x, y, z);

		

		if (direction.dot(isect.normal) > 0) {
			let AO_ray = new Ray(isect.position, direction);


			if (!rayIntersectScene(AO_ray)) { //If AO ray reaaches the sky

				if (environment !== null) { //Get environment color for AO ray
					let addColor = new THREE.Color(0,0,0);
					let envColor = getFromEnv(x, y, z);

					//Shading
					let l = direction.clone().normalize();

					let v = ray.direction().clone().negate();
					//let v = direction.clone().negate().normalize();
					//let v = reflect(direction.clone(), n).negate();
					let r = reflect(l, n);/*.normalize();*/

					//Diffuse/lambertian
					if (material.kd) {
						addColor.add(
							envColor.clone()
								.multiply(material.kd)
								.multiplyScalar(Math.max(n.clone().dot(l), 0))
						);
					}

					//Specular/phong
					if (material.ks) {
						addColor.add(
							envColor.clone()
								.multiply(material.ks)
								.multiplyScalar(Math.pow(Math.max(r.clone().dot(v), 0), material.p))
						);
					}

					AO_factor.add(addColor);
					//console.log(addColor);
				} else { //Normal ambient occlusion
					AO_factor.add(new THREE.Color(1, 1, 1));
				}

			}
			successfulSamples++;
		}

	}
	if (ambientOcclusionSamples > 0) {
		let gamma = 1.8;

		AO_factor.multiplyScalar(1 / ambientOcclusionSamples);
		//AO_factor = AO_factor / ambientOcclusionSamples;
		//color.multiplyScalar(Math.pow(AO_factor, gamma));
		if (AO_factor.r > 1 || AO_factor.g > 1 || AO_factor.b > 1) {
			//console.log(AO_factor);
		}
		if (environment === null) {
			AO_factor.setRGB(Math.pow(Math.min(AO_factor.r, 1.0), gamma), Math.pow(Math.min(AO_factor.g, 1.0), gamma), Math.pow(Math.min(AO_factor.b, 1.0), gamma));
			color.multiply(AO_factor);
		} else {
			//AO_factor.setRGB(Math.pow(Math.min(AO_factor.r, 1.0), gamma), Math.pow(Math.min(AO_factor.g, 1.0), gamma), Math.pow(Math.min(AO_factor.b, 1.0), gamma));
			color.add(AO_factor);
		}
		
	}


	return color;
}

function getFromEnv(x, y, z) {
	//convert theta and phi to xyz vector
	// let x = Math.sin(phi) * Math.cos(theta);
	// let y = Math.cos(theta);
	// let z = Math.sin(phi) * Math.sin(theta);

	//return new THREE.Color(1, 1, 1);

	//convert xyz to uv
	let r = (1 / Math.PI) * Math.acos(z) / Math.sqrt(x * x + y * y);
	let u = x * r;
	let v = -1 * y * r;


	let w = texData.width;
	let h = texData.height;
	//convert uv (normalized coords) to pixel location
	let uPixel = Math.floor((u + 1) * w / 2);
	let vPixel = Math.floor((v + 1) * h / 2);


	//sample the image
	let idx = 4 * (vPixel * w + uPixel);

	let red = tex.image.data[idx + 0];
	let green = tex.image.data[idx + 1];
	let blue = tex.image.data[idx + 2];

	let exponent = tex.image.data[idx + 3];
	let float;
	if (exponent !== 0) { //nonzero pixel
		float = ldexp(1.0, exponent - (128 + 8));
		red = red * float;
		green = green * float;
		blue = blue * float;
	}
	else {
		red = 0;
		green = 0;
		blue = 0;
	}

	let color = new THREE.Color(red, green, blue);

	return color;

}


//Reconstruct floating point value from mantissa and exponent
function ldexp(mantissa, exponent) {
	var steps = Math.min(3, Math.ceil(Math.abs(exponent) / 1023));
	var result = mantissa;
	for (var i = 0; i < steps; i++) {
		result *= Math.pow(2, Math.floor((exponent + i) / steps));
	}
	return result;
}


/* Compute intersection of ray with scene shapes.
 * Return intersection structure (null if no intersection). */
function rayIntersectScene(ray) {
	let tmax = Number.MAX_VALUE;
	let isect = null;
	for (let i = 0; i < shapes.length; i++) {
		let hit = shapes[i].intersect(ray, 0.0001, tmax);
		if (hit != null) {
			tmax = hit.t;
			if (isect == null) isect = hit; // if this is the first time intersection is found
			else isect.set(hit); // update intersection point
		}
	}
	return isect;
}

/* Compute reflected vector, by mirroring l around n. */
function reflect(l, n) {
	// r = 2(n.l)*n-l
	let r = n.clone();
	r.multiplyScalar(2 * n.dot(l));
	r.sub(l);
	return r;
}

/* Compute refracted vector, given l, n and index_of_refraction. */
function refract(l, n, ior) {
	let mu = (n.dot(l) < 0) ? 1 / ior : ior;
	let cosI = l.dot(n);
	let sinI2 = 1 - cosI * cosI;
	if (mu * mu * sinI2 > 1) return null;
	let sinR = mu * Math.sqrt(sinI2);
	let cosR = Math.sqrt(1 - sinR * sinR);
	let r = n.clone();
	if (cosI > 0) {
		r.multiplyScalar(-mu * cosI + cosR);
		r.addScaledVector(l, mu);
	} else {
		r.multiplyScalar(-mu * cosI - cosR);
		r.addScaledVector(l, mu);
	}
	r.normalize();
	return r;
}



/* Convert floating-point color to integer color and assign it to the pixel array. */
function setPixelColor(pixels, index, color) {
	pixels[index + 0] = pixelProcess(color.r);
	pixels[index + 1] = pixelProcess(color.g);
	pixels[index + 2] = pixelProcess(color.b);
	pixels[index + 3] = 255; // alpha channel is always 255*/
}

/* Multiply exposure, clamp pixel value, then apply gamma correction. */
function pixelProcess(value) {
	value *= exposure; // apply exposure
	value = (value > 1) ? 1 : value;
	value = Math.pow(value, 1 / 2.2);	// 2.2 gamma correction
	return value * 255;
}
