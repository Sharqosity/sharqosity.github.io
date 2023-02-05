import * as THREE from '../three/build/three.module.js';
import { PinholeCamera } from '../camera.js';
import { render } from '../raytracer.js';
import { sceneDef } from '../sceneDef.js';
import { Sphere } from '../shape.js';
import { Plane } from '../shape.js';
import { PointLight } from '../light.js';

let imageWidth = 640;
let imageHeight = 480;
let exposure = 1;
let backgroundColor = new THREE.Color(0, 0, 0);
let ambientLight = new THREE.Color(0.01, 0.01, 0.01);
let maxDepth = 9;
let camera;
let shapes = [];
let lights = [];

//let environment = 'probes/grace_probe.hdr';
let environment = null;

let antiAliasing = 0;
let superSamplingScale = 0;
let ambientOcclusionSamples = 0;

function init() {
    // create camera
    let eye = new THREE.Vector3(0, 0, 9);
    let target = new THREE.Vector3(0, 2, 0);
    let up = new THREE.Vector3(0, 1, 0);
    let fov = 60;
    camera = new PinholeCamera(eye, target, up, fov, imageWidth / imageHeight);

    // create a point light
    lights.push(new PointLight(new THREE.Vector3(2, 3.5, 8), new THREE.Color(190, 96, 88)));
    lights.push(new PointLight(new THREE.Vector3(-2, 3, 8), new THREE.Color(100, 96, 255)));
    //lights.push(new PointLight(new THREE.Vector3(-8, 0, 0), new THREE.Color(100, 100, 100)));


    let mirrorMaterial = MirrorMaterial(new THREE.Color(.5, .5, 1));
    let mirrorCeiling = MirrorMaterial(new THREE.Color(1, .75, .75));

    let mirrorSphere = MirrorMaterial(new THREE.Color(1, 1, 1));

    let diffuseMaterial = DiffuseMaterial(new THREE.Color(0.2, 0.2, 1.0), new THREE.Color(0.2, 0.2, 1.0));
    let diffuseMaterial2 = DiffuseMaterial(new THREE.Color(0.1, 0.2, 1.0), new THREE.Color(0.1, 0.2, .5));


    // create mirror sphere
    let radius = 1.25;
    shapes.push(new Sphere(new THREE.Vector3(1, 2, 0), radius, mirrorSphere));

    // create specular sphere
    //shapes.push(new Sphere(new THREE.Vector3(1.5, 0, 2.5), radius,
    //PhongMaterial(new THREE.Color(1, 1, 1), new THREE.Color(1, 1, 1), new THREE.Color(2, 2, 2), 20)));

    let half_a = 45 * Math.PI / 180;
    // create left vertical mirror
    shapes.push(new Plane(new THREE.Vector3(-4, 0, -5),
        new THREE.Vector3(Math.cos(half_a), 0, Math.sin(half_a)),
        mirrorMaterial));

    //create right vertical mirror
    shapes.push(new Plane(new THREE.Vector3(4, 0, -6),
        new THREE.Vector3(-Math.cos(half_a), 0, Math.sin(half_a)),
        diffuseMaterial2));


    // create diffuse plane
    shapes.push(new Plane(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), diffuseMaterial));


    // create mirror ceiling
    shapes.push(new Plane(new THREE.Vector3(0, 4, 0), new THREE.Vector3(0, -1, 0), mirrorCeiling));

    // start ray tracing
    let sceneObject = new sceneDef(imageWidth, imageHeight, exposure, backgroundColor, ambientLight, maxDepth, camera, shapes, lights, environment, antiAliasing, superSamplingScale, ambientOcclusionSamples);

    render(sceneObject);

}

window.onload = init;