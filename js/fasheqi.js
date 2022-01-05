import * as THREE from '../libs/threejs/build/three.module.js';
import * as PARTICLE from './particle-Rain(Mesh-Tween).js';
import {camera, scene, renderer} from './camera.js';


var mesh;

function init(){
    let geometry = new THREE.BoxGeometry(PARTICLE.ShapeScale.x,PARTICLE.ShapeScale.y,PARTICLE.ShapeScale.z);
    var materia=new THREE.MeshLambertMaterial({
        color:0xff0000,
        transparent: true,
        opacity:0.2
    });
    mesh = new THREE.Mesh(geometry,materia);
    mesh.position.set(-PARTICLE.position.x, PARTICLE.position.y, PARTICLE.position.z);
    // mesh.setRotationFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(PARTICLE.rotation.x), THREE.MathUtils.degToRad(-PARTICLE.rotation.y), THREE.MathUtils.degToRad(-PARTICLE.rotation.z)));
    // mesh.rotateOnWorldAxis (new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(PARTICLE.rotation.x));
    // mesh.rotateOnWorldAxis (new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(-PARTICLE.rotation.y));
    // mesh.rotateOnWorldAxis (new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(-PARTICLE.rotation.z));
    mesh.scale.set(PARTICLE.scale.x, PARTICLE.scale.y, PARTICLE.scale.z);

    var q = new THREE.Quaternion( -PARTICLE.rotation.x, PARTICLE.rotation.y, PARTICLE.rotation.z, -PARTICLE.rotation.w);
    var v = new THREE.Euler();  
    v.setFromQuaternion( q );
    v.y += Math.PI; // Y is 180 degrees off
    v.z *= -1; // flip Z
    mesh.rotation.copy( v );
    
    scene.add(mesh);

    var axis = new THREE.AxesHelper(800);
    scene.add(axis);
}

init();