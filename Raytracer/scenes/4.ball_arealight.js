import * as THREE from '../three/build/three.module.js';
import { PinholeCamera } from '../camera.js';
import { render } from '../raytracer.js';
import { sceneDef } from '../sceneDef.js';
import { Sphere } from '../shape.js';
import { Plane } from '../shape.js';
import { createAreaLight } from '../light.js';

let imageWidth = 960;
let imageHeight = 640;
let exposure = 1;
let backgroundColor = new THREE.Color(0, 0, 0);
let ambientLight = new THREE.Color(0.02, 0.02, 0.02);
let maxDepth = 5;
let camera;
let shapes = [];
let lights = [];

let environment = null;
let antiAliasing = 0;
let superSamplingScale = 2;
let ambientOcclusionSamples = 500;

function init() {
    // create camera
    let eye = new THREE.Vector3(1, 1, 5);
    let target = new THREE.Vector3(0, 0, 0);
    let up = new THREE.Vector3(0, 1, 0);
    let fov = 45;
    camera = new PinholeCamera(eye, target, up, fov, imageWidth / imageHeight);

    // simulate an area light given its center, size, intensity, and num samples
    createAreaLight(new THREE.Vector3(1, 2, 1), 5, new THREE.Color(0.2, 0.2, 0.2), 16, lights);

    // create shapes and materials
    shapes.push(new Sphere(new THREE.Vector3(0, 0, -1), 1,
        PhongMaterial(new THREE.Color(1.0, 0.3, 0.1), new THREE.Color(1.0, 0.3, 0.1), new THREE.Color(20, 20, 20), 1000)));
    shapes.push(new Sphere(new THREE.Vector3(-1, -0.1, 1), 0.5,
        DiffuseMaterial(new THREE.Color(0, 0.3, 1.0), new THREE.Color(0, 0.3, 1.0))));
    shapes.push(new Sphere(new THREE.Vector3(1.5, -0.4, 1), 0.5,
        DiffuseMaterial(new THREE.Color(0.3, 1.0, 0), new THREE.Color(0.3, 1.0, 0))));

    let ka = new THREE.Color(1, 1, 1);
    let kd = new THREE.Color(1, 1, 1);
    let P = new THREE.Vector3(0, -0.7, 0);
    let N = new THREE.Vector3(0, 1, 0);
    shapes.push(new Plane(P, N, DiffuseMaterial(ka, kd)));

    // start ray tracing
    let sceneObject = new sceneDef(imageWidth, imageHeight, exposure,backgroundColor, ambientLight, maxDepth, camera, shapes, lights, environment, antiAliasing, superSamplingScale, ambientOcclusionSamples);
    render(sceneObject);

}

window.onload = init;