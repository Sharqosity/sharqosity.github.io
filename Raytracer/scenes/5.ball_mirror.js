import * as THREE from '../three/src/Three.js';
import { PinholeCamera } from '../camera.js';
import { render } from '../raytracer.js';
import { sceneDef } from '../sceneDef.js';
import { Sphere } from './../shape.js';



let imageWidth = 1920 ;
let imageHeight = 1080;
let exposure = 1;
let backgroundColor = new THREE.Color(0, 0, 0);
let ambientLight = new THREE.Color(0.01, 0.01, 0.01);
let maxDepth = 5;
let camera;
let shapes = [];
let lights = [];


let environment = 'probes/building_probe.hdr';;
let antiAliasing = 1;
let superSamplingScale = 2;
let ambientOcclusionSamples = 400;


function init() {
    // create camera
    let eye = new THREE.Vector3(8, 5, 9);
    let target = new THREE.Vector3(0.25, 0, 0.5);
    let up = new THREE.Vector3(0, 1, 0);
    let fov = 18;
    camera = new PinholeCamera(eye, target, up, fov, imageWidth / imageHeight);

    /*
    // create a point light
    lights.push(new PointLight(new THREE.Vector3(10, 10, 5), new THREE.Color(100, 96, 88)));
    */
    // create specular sphere
    let radius = 1.25;
    shapes.push(new Sphere(new THREE.Vector3(radius, 0, -radius), radius,
        PhongMaterial(new THREE.Color(1, 0.2, 0.2), new THREE.Color(1, 0.2, 0.2), new THREE.Color(2, 2, 2), 20)));

    // create mirror sphere
    shapes.push(new Sphere(new THREE.Vector3(-radius, 0, radius), radius,
        MirrorMaterial(new THREE.Color(1, 1, 1))));

    /*
    // create mirror sphere
    shapes.push(new Sphere(new THREE.Vector3(-radius, 0, -radius), radius,
        MirrorMaterial(new THREE.Color(1, 1, 1))));
    */
        
    //create glass sphere
    shapes.push(new Sphere(new THREE.Vector3(radius, 0, radius), radius,
    GlassMaterial(new THREE.Color(0, 0, 0), new THREE.Color(1, 1, 1), 0.8)));
    

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