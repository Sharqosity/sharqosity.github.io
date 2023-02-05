import * as THREE from '../three/build/three.module.js';
import { PinholeCamera } from '../camera.js';
import { render } from '../raytracer.js';
import { sceneDef } from '../sceneDef.js';
import { shapeLoadOBJ } from '../shape.js';
import { Plane } from '../shape.js';
import { PointLight } from '../light.js';

let imageWidth = 512;
let imageHeight = 512;
let exposure = 1;
let backgroundColor = new THREE.Color(0, 0, 0);
let ambientLight = new THREE.Color(0.1, 0.1, 0.1);
let maxDepth = 5;
let camera;
let shapes = [];
let lights = [];

//let environment = 'probes/stpeters_probe.hdr';
let environment = null;

let antiAliasing = 0;
let superSamplingScale = 2;
let ambientOcclusionSamples = 0;

function init() {		
    // create camera
    let eye = new THREE.Vector3(-4, 1, 3);
    let target = new THREE.Vector3(0, 0.1, 0);
    let up = new THREE.Vector3(0, 1, 0);
    let fov = 22;
    camera = new PinholeCamera(eye, target, up, fov, imageWidth/imageHeight);
    
    // create point lights
    lights.push(new PointLight(new THREE.Vector3(-4, 8, 1), new THREE.Color(45, 5, 40)));
    lights.push(new PointLight(new THREE.Vector3(4, 8, 1), new THREE.Color(10, 20, 60)));

    // remove the last parameter (or change it to false) to disable smooth normals
    //shapeLoadOBJ('objs/twist.obj', GlassMaterial(new THREE.Color(0, 0, 0), new THREE.Color(1, 1, 1), 1.8), false, shapes);
    shapeLoadOBJ('objs/bunny_lowpoly.obj', DiffuseMaterial(new THREE.Color(0,0,0), new THREE.Color(1, 1, 1)), false, shapes);


    shapes.push(new Plane(new THREE.Vector3(0, -0.68, 0), new THREE.Vector3(0, 1, 0),
        DiffuseMaterial(new THREE.Color(0,0,0), new THREE.Color(1, 1, 1))));

    // start ray tracing
    let sceneObject = new sceneDef(imageWidth, imageHeight, exposure,backgroundColor, ambientLight, maxDepth, camera, shapes, lights, environment, antiAliasing, superSamplingScale, ambientOcclusionSamples);
    render(sceneObject);
            
}

window.onload = init;