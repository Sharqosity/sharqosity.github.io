import * as THREE from '../three/build/three.module.js';
import { PinholeCamera } from '../camera.js';
import { render } from '../raytracer.js';
import { sceneDef } from '../sceneDef.js';
import { Sphere } from './../shape.js';



let imageWidth = 640;
let imageHeight = 640;
let exposure = 1;
let backgroundColor = new THREE.Color(0, 0, 0);
let ambientLight = new THREE.Color(0.01, 0.01, 0.01);
let maxDepth = 8;
let camera;
let shapes = [];
let lights = [];


let environment = 'probes/stpeters_probe.hdr';;
let antiAliasing = 2;
let superSamplingScale = 2;
let ambientOcclusionSamples = 500;


function init() {
    // create camera
    let eye = new THREE.Vector3(10, 1, 10);
    let target = new THREE.Vector3(0, 0, 0);
    let up = new THREE.Vector3(0, 1, 0);
    let fov = 25;
    camera = new PinholeCamera(eye, target, up, fov, imageWidth / imageHeight);

    /*
    // create a point light
    lights.push(new PointLight(new THREE.Vector3(10, 10, 5), new THREE.Color(100, 96, 88)));
    */
    // create specular sphere
    let dist = 1.3;
    let radius = 1.25;
    shapes.push(new Sphere(new THREE.Vector3(dist, -dist, 0), radius,
        PhongMaterial(new THREE.Color(1, 0.2, 0.2), new THREE.Color(1, 0.2, 0.2), new THREE.Color(2, 2, 2), 20)));

    // create mirror sphere
    shapes.push(new Sphere(new THREE.Vector3(-dist, dist, 0), radius,
        MirrorMaterial(new THREE.Color(1, 1, 1))));

    
    // create mirror sphere
    shapes.push(new Sphere(new THREE.Vector3(-dist, -dist, 0), radius,
        MirrorMaterial(new THREE.Color(1, 1, 1))));
    
        
    //create glass sphere
    shapes.push(new Sphere(new THREE.Vector3(dist, dist, 0), radius,
    GlassMaterial(new THREE.Color(.01, .01, .01), new THREE.Color(1, 1, 1), 1.8)));
    

    /*
    // create diffuse plane
    shapes.push(new Plane(new THREE.Vector3(0, -radius, 0), new THREE.Vector3(0, 1, 0),
        DiffuseMaterial(new THREE.Color(0.3, 0.3, 0.2), new THREE.Color(0.3, 0.3, 0.2))));

    */
    // start ray tracing
    let sceneObject = new sceneDef(imageWidth, imageHeight, exposure,backgroundColor, ambientLight, maxDepth, camera, shapes, lights, environment, antiAliasing, superSamplingScale, ambientOcclusionSamples);
    render(sceneObject);

}

window.onload = init;