
import * as THREE from '/../three/src/Three.js';
import { PinholeCamera } from '/../camera.js';
import { render } from '/../raytracer.js';
import { sceneDef } from '/../sceneDef.js';
import { Sphere } from '/../shape.js';
import { Plane } from '/../shape.js';
import { PointLight } from '/../light.js';


let imageWidth = 640;
let imageHeight = 480;
let exposure = 1;
let backgroundColor = new THREE.Color(0, 0, 0);
let ambientLight = new THREE.Color(0.01, 0.01, 0.01);

let maxDepth = 5;
let camera;
let shapes = [];
let lights = [];

let environment = null;
//let environment = 'probes/stpeters_probe.hdr';


let antiAliasing = 2;
let superSamplingScale = 2;
let ambientOcclusionSamples = 500;

function init() {		
    // create camera
    let eye = new THREE.Vector3(8, 5, 9);
    let target = new THREE.Vector3(0.25, 0, 0.5);
    let up = new THREE.Vector3(0, 1, 0);
    let fov = 30;
    camera = new PinholeCamera(eye, target, up, fov, imageWidth/imageHeight);


    
    // create a point light
    lights.push(new PointLight(new THREE.Vector3(10, 10, 5), new THREE.Color(100, 96, 88)));
    
    // create shapes and materials
    let center = new THREE.Vector3(-0.25, 0, 0.25);
    let radius = 1.25;
    let ka = new THREE.Color(1.0, 0.2, 0.2);
    let kd = new THREE.Color(1.0, 0.2, 0.2);
    let ks = new THREE.Color(2, 2, 2);
    let p = 20;
    shapes.push(new Sphere(center, radius, PhongMaterial(ka, kd, ks, p)));

    ka = new THREE.Color(1.0, 1.0, 0.2);
    kd = new THREE.Color(1.0, 1.0, 0.2);
    let P = new THREE.Vector3(0, -1.25, 0);
    let N = new THREE.Vector3(0, 1, 0);
    shapes.push(new Plane(P, N, DiffuseMaterial(ka, kd)));

    // start ray tracing
    let sceneObject = new sceneDef(imageWidth, imageHeight, exposure,backgroundColor, ambientLight, maxDepth, camera, shapes, lights, environment, antiAliasing, superSamplingScale, ambientOcclusionSamples);
    render(sceneObject);
            
}

window.onload = init;