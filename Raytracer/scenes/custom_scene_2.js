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
    let eye = new THREE.Vector3(0, 2, 10);
    let target = new THREE.Vector3(0, 1, 0);
    let up = new THREE.Vector3(0, 1, 0);
    let fov = 60;
    camera = new PinholeCamera(eye, target, up, fov, imageWidth / imageHeight);

    // create a point light
    //lights.push(new PointLight(new THREE.Vector3(0, 13, 4), new THREE.Color(10, 9, 8)));

    // simulate an area light given its center, size, intensity, and num samples
    createAreaLight(new THREE.Vector3(0, 13.999, 4), 2, new THREE.Color(20, 19, 18), 8, lights);


    let mirrorSphere = MirrorMaterial(new THREE.Color(1, 1, 1));
    let mirrorSphere2 = MirrorMaterial(new THREE.Color(.1, .3, 1));


    let ka = new THREE.Color(0.42, 0.42, 0.42);
    let kd = new THREE.Color(0.42, 0.42, 0.42);
    let kd2 = new THREE.Color(1, 1, 1);
    let ks = new THREE.Color(4, 4, 4);
    let p = 80;
    // remove the last parameter (or change it to false) to disable smooth normals
    //shapeLoadOBJ('objs/pawn.obj', PhongMaterial(ka, kd, ks, p), false);

    // create specular sphere
    let radius = 1.25;
    shapes.push(new Sphere(new THREE.Vector3(1.5, 0, 0), radius,
        PhongMaterial(ka, kd2, ks, p)));

    // create glass sphere
    shapes.push(new Sphere(new THREE.Vector3(-1, 0, 2), radius,
        GlassMaterial(new THREE.Color(0, 0, 0), new THREE.Color(.75, .75, .75), 1.8)));

    //mirror sphere
    shapes.push(new Sphere(new THREE.Vector3(-4, 1.25, -3), 2.5, mirrorSphere));

    //spec sphere 2
    //shapes.push(new Sphere(new THREE.Vector3(-4, 5, 0), radius, PhongMaterial(ka, kd, ks, p)));

    shapes.push(new Sphere(new THREE.Vector3(-4, 5, -3), radius, mirrorSphere2));



    // create diffuse plane
    shapes.push(new Plane(new THREE.Vector3(0, -radius, 0), new THREE.Vector3(0, 1, 0),
        DiffuseMaterial(new THREE.Color(0.2, 0.2, 1.0), new THREE.Color(0.2, 0.2, 1.0))));

    //left wall
    shapes.push(new Plane(new THREE.Vector3(-8, -2, 0), new THREE.Vector3(1, 0, 0),
        DiffuseMaterial(new THREE.Color(0.2, 0.2, 1.0), new THREE.Color(1, 0.2, .2))));

    //right wall
    //shapes.push(new Plane(new THREE.Vector3(8, -2, 0), new THREE.Vector3(-1, 0, 0),
    //DiffuseMaterial(new THREE.Color(0.2, 0.2, 1.0), new THREE.Color(0.2, 1, .2))));

    //ceiling 
    //shapes.push(new Plane(new THREE.Vector3(0, 14, 0), new THREE.Vector3(0, -1, 0),
    //DiffuseMaterial(new THREE.Color(0.2, 0.2, 1.0), new THREE.Color(1, 1, 1.0))));

    //back wall
    shapes.push(new Plane(new THREE.Vector3(0, 0, -10), new THREE.Vector3(0, 0, 1),
        DiffuseMaterial(new THREE.Color(0.2, 0.2, 1.0), new THREE.Color(1, 1, .25))));

    //front wall
    //shapes.push(new Plane(new THREE.Vector3(0, 0, 12), new THREE.Vector3(0, 0, -1),
    //PhongMaterial(ka, kd2, ks, p)));

    // start ray tracing
    let sceneObject = new sceneDef(imageWidth, imageHeight, exposure, backgroundColor, ambientLight, maxDepth, camera, shapes, lights, environment, antiAliasing, superSamplingScale, ambientOcclusionSamples);

    render(sceneObject);

}

window.onload = init;