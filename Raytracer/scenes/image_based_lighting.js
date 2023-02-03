import * as THREE from '../three/src/Three.js';
import { PinholeCamera } from '../camera.js';
import { render } from '../raytracer.js';
import { sceneDef } from '../sceneDef.js';
import { Sphere } from '../shape.js';
import { Plane } from '../shape.js';
import { Triangle } from '../shape.js';
import { PointLight } from '../light.js';




let imageWidth = 1280;
let imageHeight = 960;
let exposure = 1;
let backgroundColor = new THREE.Color(0, 0, 0);
let ambientLight = new THREE.Color(0.01, 0.01, 0.01);
let maxDepth = 5;
let camera;
let shapes = [];
let lights = [];
let environment = 'probes/grace_probe.hdr';

let antiAliasing = 1;
let superSamplingScale = 2;
let ambientOcclusionSamples = 100;


function init() {
    //import RGBELoader from '../RGBELoader.js';
    // create camera
    let eye = new THREE.Vector3(0, 1.75, 3.5);
    let target = new THREE.Vector3(0, 0, 0);
    let up = new THREE.Vector3(0, 1, 0);
    let fov = 60;
    camera = new PinholeCamera(eye, target, up, fov, imageWidth / imageHeight);


    // create a point light
    //lights.push(new PointLight(new THREE.Vector3(0, 6, 0), new THREE.Color(100, 96, 88)));



    let mirrorSphere = MirrorMaterial(new THREE.Color(1, 1, 1));

    // create mirror sphere
    let radius = 1.25;
    shapes.push(new Sphere(new THREE.Vector3(0, 0, 0), radius,
        mirrorSphere));

    //create glass sphere
    // shapes.push(new Sphere(new THREE.Vector3(0, 0, 0), radius,
    // GlassMaterial(new THREE.Color(0, 0, 0), new THREE.Color(1, 1, 1), 1.8)));	

    // create a floating square
    let ka = new THREE.Color(1.0, 0.1, 0.2);
    let kd = new THREE.Color(1.0, 0.1, 0.2);
	// shapes.push(new Triangle(new THREE.Vector3(2,-radius,-2), new THREE.Vector3(-2,-radius,2), new THREE.Vector3(2,-radius,2),
    // PhongMaterial(new THREE.Color(1,0.2,0.2), new THREE.Color(1,0.2,0.2), new THREE.Color(2,2,2), 20)));

    // shapes.push(new Triangle(new THREE.Vector3(-2,-radius,2), new THREE.Vector3(2,-radius,-2), new THREE.Vector3(-2,-radius,-2),
    // PhongMaterial(new THREE.Color(1,0.2,0.2), new THREE.Color(1,0.2,0.2), new THREE.Color(2,2,2), 20)));

    shapes.push(new Triangle(new THREE.Vector3(2,-radius,-2), new THREE.Vector3(-2,-radius,2), new THREE.Vector3(2,-radius,2),
    DiffuseMaterial(ka, kd)));
    shapes.push(new Triangle(new THREE.Vector3(-2,-radius,2), new THREE.Vector3(2,-radius,-2), new THREE.Vector3(-2,-radius,-2),
    DiffuseMaterial(ka, kd)));
    

    // create diffuse plane
    // shapes.push(new Plane(new THREE.Vector3(0, -radius, 0), new THREE.Vector3(0, 1, 0),
    //     DiffuseMaterial(new THREE.Color(0.2, 0.2, 0.2), new THREE.Color(0.2, 0.2, 0.2))));


    // start ray tracing
    let sceneObject = new sceneDef(imageWidth, imageHeight, exposure,backgroundColor, ambientLight, maxDepth, camera, shapes, lights, environment, antiAliasing, superSamplingScale, ambientOcclusionSamples);
    render(sceneObject);


}

window.onload = init;