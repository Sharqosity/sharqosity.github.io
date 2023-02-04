import * as THREE from '../three/build/three.module.js';
import { PinholeCamera } from '../camera.js';
import { render } from '../raytracer.js';
import { sceneDef } from '../sceneDef.js';
import { Sphere } from '../shape.js';
import { Plane } from '../shape.js';
import { PointLight } from '../light.js';


let imageWidth = 1280;
let imageHeight = 720;
let exposure = 1;
let backgroundColor = new THREE.Color(0, 0, 0);
let ambientLight = new THREE.Color(0.01, 0.01, 0.01);
let maxDepth = 5;
let camera;
let shapes = [];
let lights = [];

let environment = null;

let antiAliasing = 2;
let superSamplingScale = 4;
let ambientOcclusionSamples = 0;

function init() {
    // create camera
    let eye = new THREE.Vector3(0, 4, 5);
    let target = new THREE.Vector3(2, 1, 0);
    let up = new THREE.Vector3(0, 1, 0);
    let fov = 60;
    camera = new PinholeCamera(eye, target, up, fov, imageWidth / imageHeight);

    // create a point light
    lights.push(new PointLight(new THREE.Vector3(-2, 5, -2), new THREE.Color(10, 2, 1)));
    lights.push(new PointLight(new THREE.Vector3(2, 5, -2), new THREE.Color(2, 8, 1)));
    lights.push(new PointLight(new THREE.Vector3(0, 5, 1), new THREE.Color(2, 1, 10)));

    let ka = new THREE.Color(0.42, 0.42, 0.42);
    let kd = new THREE.Color(0.42, 0.42, 0.42);
    let kd2 = new THREE.Color(1, 1, 1);
    let ks = new THREE.Color(4, 4, 4);
    let p = 80;

    // create specular sphere
    let radius = 1.25;
    shapes.push(new Sphere(new THREE.Vector3(2.5, 0, 0), radius,
        PhongMaterial(ka, kd2, ks, p)));

    // create sphere 2
    shapes.push(new Sphere(new THREE.Vector3(0, 0, 0), radius,
        PhongMaterial(ka, kd2, ks, p)));

    // create diffuse plane
    shapes.push(new Plane(new THREE.Vector3(0, -radius, 0), new THREE.Vector3(0, 1, 0),
        DiffuseMaterial(new THREE.Color(0.2, 0.2, 0.2), new THREE.Color(0.2, 0.2, 0.2))));

    // start ray tracing
    let sceneObject = new sceneDef(imageWidth, imageHeight, exposure, backgroundColor, ambientLight, maxDepth, camera, shapes, lights, environment, antiAliasing, superSamplingScale, ambientOcclusionSamples);

    render(sceneObject);

}

window.onload = init;