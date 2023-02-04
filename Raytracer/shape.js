import * as THREE from './three/build/three.module.js';
import { loadOBJAsMesh } from './simpleOBJMeshLoader.js';


/* Intersection structure:
 * t:        ray parameter (float), i.e. distance of intersection point to ray's origin
 * position: position (THREE.Vector3) of intersection point
 * normal:   normal (THREE.Vector3) of intersection point
 * material: material of the intersection object
 */
export class Intersection {
	constructor() {
		this.t = 0;
		this.position = new THREE.Vector3();
		this.normal = new THREE.Vector3();
		this.material = null;
	}
	set(isect) {
		this.t = isect.t;
		this.position = isect.position;
		this.normal = isect.normal;
		this.material = isect.material;
	}
}

/* Plane shape
 * P0: a point (THREE.Vector3) that the plane passes through
 * n:  plane's normal (THREE.Vector3)
 */
export class Plane {
	constructor(P0, n, material) {
		this.P0 = P0.clone();
		this.n = n.clone();
		this.n.normalize();
		this.material = material;
	}
	// Given ray and range [tmin,tmax], return intersection point.
	// Return null if no intersection.
	intersect(ray, tmin, tmax) {
		let temp = this.P0.clone();
		temp.sub(ray.o); // (P0-O)
		let denom = ray.d.dot(this.n); // d.n
		if(denom==0) { return null;	}
		let t = temp.dot(this.n)/denom; // (P0-O).n / d.n
		if(t<tmin || t>tmax) return null; // check range
		let isect = new Intersection();   // create intersection structure
		isect.t = t;
		isect.position = ray.pointAt(t);
		isect.normal = this.n;
		isect.material = this.material;
		return isect;
	}
}

/* Sphere shape
 * C: center of sphere (type THREE.Vector3)
 * r: radius
 */
export class Sphere {
	constructor(C, r, material) {
		this.C = C.clone();
		this.r = r;
		this.r2 = r*r;
		this.material = material;
	}
	intersect(ray, tmin, tmax) {

		let a = 1; //Because the direction vector is normalized
		//let a = ray.direction().dot(ray.direction());
		let temp = ray.origin().clone().sub(this.C);
		let b = 2 * temp.clone().dot(ray.direction());
		let c = temp.clone().dot(temp) - this.r2;
		let delta = b * b - (4 * a * c);

		let t;
		if (delta < 0) { //Ray misses sphere, no isect
			return null;
		} else if (delta >= 0) { //Ray intersects sphere at 1 or 2 points
			let t1 = (-1 * b - Math.sqrt(delta)) / (2 * a);
			let t2 = (-1 * b + Math.sqrt(delta)) / (2 * a);

			if (t1 > 0 && t1 > tmin && t1 < tmax) { //t1
				t = t1;
			} else if (t2 > tmin && t2 < tmax) { //t2 
				t = t2;
			} else { //Intersection not between tmin and tmax
				return null;
			}

		}

		let isect = new Intersection(); // create intersection structure
		isect.t = t;
		isect.position = ray.pointAt(t);
		//Calculate normal
		isect.normal = ray.pointAt(t).sub(this.C).normalize();
		isect.material = this.material;
		return isect;

		
	}
}

export class Triangle {
	/* P0, P1, P2: three vertices (type THREE.Vector3) that define the triangle
	 * n0, n1, n2: normal (type THREE.Vector3) of each vertex */
	constructor(P0, P1, P2, material, n0, n1, n2) {
		this.P0 = P0.clone();
		this.P1 = P1.clone();
		this.P2 = P2.clone();
		this.material = material;
		if(n0) this.n0 = n0.clone();
		if(n1) this.n1 = n1.clone();
		if(n2) this.n2 = n2.clone();

		// below you may pre-compute any variables that are needed for intersect function
		// such as the triangle normal etc.

	} 

	intersect(ray, tmin, tmax) {
		let m = new THREE.Matrix3();
		let o = ray.origin().clone();
		let d = ray.direction().clone();

		let e = this.P2.clone().sub(this.P0); //P2 - P0
		let f = this.P2.clone().sub(this.P1); //P2 - p1
		m.set(  d.x, d.y, d.z,
				e.x, e.y, e.z,
				f.x, f.y, f.z
		);

		let zeroMatrix = new THREE.Matrix3(); //Zero matrix for comparison
		zeroMatrix.set(  0, 0, 0,
						 0, 0, 0,
					     0, 0, 0
		);
		
		m.getInverse(m); //Invert matrix

		if (m.equals(zeroMatrix)) { //Determinant of matrix is zero, ray parallel to triangle
			return null;
		}

		let g = this.P2.clone().sub(o); //P2 - O
		let gMatrix = new THREE.Matrix3();
		gMatrix.set( g.x, g.y, g.z,
					0, 0, 0,
					0, 0, 0
		);

		let answer = gMatrix.multiply(m);
		let t = answer.elements[0];
		let alpha = answer.elements[3];
		let beta = answer.elements[6];

		if (alpha >= 0 && beta >= 0 && t >= 0 && alpha + beta <= 1 && t > tmin && t < tmax) { //Intersection
			let isect = new Intersection();   // create intersection structure
			isect.t = t;
			isect.position = ray.pointAt(t);
			//Calculate normal
			let n;
			if (this.n0 && this.n1 && this.n2) {
				//console.log("these exist!");
				n = this.n0.clone().multiplyScalar(alpha).add(this.n1.clone().multiplyScalar(beta)).add(this.n2.clone().multiplyScalar(1 - alpha - beta)).normalize();
			} else {
				n = e.clone().cross(f).normalize();
			}
			isect.normal = n;
			isect.material = this.material;
			return isect;
		}

		return null;
	}
}

export function shapeLoadOBJ(objname, material, smoothnormal, shapes) {
	loadOBJAsMesh(objname, function(mesh) { // callback function for non-blocking load
		if(smoothnormal) mesh.computeVertexNormals();
		for(let i=0;i<mesh.faces.length;i++) {
			let p0 = mesh.vertices[mesh.faces[i].a];
			let p1 = mesh.vertices[mesh.faces[i].b];
			let p2 = mesh.vertices[mesh.faces[i].c];
			if(smoothnormal) {
				let n0 = mesh.faces[i].vertexNormals[0];
				let n1 = mesh.faces[i].vertexNormals[1];
				let n2 = mesh.faces[i].vertexNormals[2];
				shapes.push(new Triangle(p0, p1, p2, material, n0, n1, n2));
			} else {
				shapes.push(new Triangle(p0, p1, p2, material));
			}
		}
	}, function() {}, function() {});
}