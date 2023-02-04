import * as THREE from '../three/build/three.module.js';
import { PinholeCamera } from '../camera.js';
import { render } from '../raytracer.js';
import { sceneDef } from '../sceneDef.js';
import { Sphere } from '../shape.js';
import { Plane } from '../shape.js';
import { createAreaLight } from '../light.js';



let imageWidth = 320;
let imageHeight = 240;
let exposure = 1;
let backgroundColor = new THREE.Color(0, 0, 0);
let ambientLight = new THREE.Color(0.01, 0.01, 0.01);
let maxDepth = 5;
let camera;
let shapes = [];
let lights = [];


let environment = null;
let antiAliasing = 0;
let superSamplingScale = 0;
let ambientOcclusionSamples = 0;

function init() {
    // create camera
    let eye = new THREE.Vector3(3, 2, 3);
    let target = new THREE.Vector3(0, 0, 0);
    let up = new THREE.Vector3(0, 1, 0);
    let fov = 55;
    camera = new PinholeCamera(eye, target, up, fov, imageWidth / imageHeight);

    // simulate an area light by discretizing it into NsxNs point lights
    createAreaLight(new THREE.Vector3(10, 13, 5), 2, new THREE.Color(25, 25, 25), 10, lights);

    // create specular sphere
    let radius = 1.25;
    shapes.push(new Sphere(new THREE.Vector3(-3.2, 0, 0), radius,
        PhongMaterial(new THREE.Color(1, 0.2, 0.2), new THREE.Color(1, 0.2, 0.2), new THREE.Color(2, 2, 2), 20)));

    // create specular sphere
    shapes.push(new Sphere(new THREE.Vector3(.3, 0, -3), radius,
    PhongMaterial(new THREE.Color(0.2, 0.2, 1), new THREE.Color(0.2, 0.2, 1), new THREE.Color(2, 2, 2), 20)));

    // create glass sphere
    shapes.push(new Sphere(new THREE.Vector3(0, .8, 0), radius,
        GlassMaterial(new THREE.Color(0, 0, 0), new THREE.Color(1, 1, 1), 2)));

    // create diffuse plane
    shapes.push(new Plane(new THREE.Vector3(0, -radius, 0), new THREE.Vector3(0, 1, 0),
        DiffuseMaterial(new THREE.Color(1.0, 1.0, 0.2), new THREE.Color(1.0, 1.0, 0.2))));

    // start ray tracing
    let sceneObject = new sceneDef(imageWidth, imageHeight, exposure, backgroundColor, ambientLight, maxDepth, camera, shapes, lights, environment, antiAliasing, superSamplingScale, ambientOcclusionSamples);
    render(sceneObject);

}

window.onload = init;