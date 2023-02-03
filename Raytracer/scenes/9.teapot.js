import * as THREE from '../three/src/Three.js';
import { PinholeCamera } from '../camera.js';
import { render } from '../raytracer.js';
import { sceneDef } from '../sceneDef.js';
import { shapeLoadOBJ } from '../shape.js';
import { Plane } from '../shape.js';
import { Triangle } from '../shape.js';






let imageWidth = 400;
let imageHeight = 400;
let exposure = 1;
let backgroundColor = new THREE.Color(0, 0, 0);
let ambientLight = new THREE.Color(0.03, 0.03, 0.03);
let maxDepth = 5;
let camera;
let shapes = [];
let lights = [];

let environment = 'probes/stpeters_probe.hdr';

let antiAliasing = 0;
let superSamplingScale = 2;
let ambientOcclusionSamples = 0;



function init() {		
    // create camera
    let eye = new THREE.Vector3(-4, 1, 3);
    let target = new THREE.Vector3(0, 0, 0);
    let up = new THREE.Vector3(0, 1, 0);
    let fov = 20;
    camera = new PinholeCamera(eye, target, up, fov, imageWidth/imageHeight);
    
    // create point lights
    lights.push(new PointLight(new THREE.Vector3(-1, 2, 1), new THREE.Color(4, 2, 2)));
    lights.push(new PointLight(new THREE.Vector3(1, 2, 1), new THREE.Color(2, 4, 2)));

    let ka = new THREE.Color(0.42,0.26,0.2);
    let kd = new THREE.Color(0.42,0.26,0.2);
    let ks = new THREE.Color(4,4,4);
    let p = 80;
    // remove the last parameter (or change it to false) to disable smooth normals
    shapeLoadOBJ('objs/teapot.obj', PhongMaterial(ka, kd, ks, p), true, shapes);

    shapes.push(new Plane(new THREE.Vector3(0, -0.68, 0), new THREE.Vector3(0, 1, 0),
        DiffuseMaterial(new THREE.Color(0,0,0), new THREE.Color(1, 1, 1))));

    // start ray tracing
    let sceneObject = new sceneDef(imageWidth, imageHeight, exposure,backgroundColor, ambientLight, maxDepth, camera, shapes, lights, environment, antiAliasing, superSamplingScale, ambientOcclusionSamples);
    render(sceneObject);
            
}

window.onload = init;