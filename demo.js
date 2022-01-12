import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import CameraManager from './src/Utils/camera.js';
import FBXLoaderManager from './src/Utils/fbxLoader.js';
import FasheQiManager from './src/Utils/fasheqi.js';

import ParticleManager from './src/AE/particle-v2.0.js';
import Particle from './src/Json/particleSystemDatas.js';

let camera,renderer,scene,controls,stats, cameraManager,particle;

 function init(){
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 210000 );
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    scene = new THREE.Scene();
    controls = new OrbitControls( camera, renderer.domElement );
    stats = new Stats();

    cameraManager = new CameraManager();
    cameraManager.camera = camera;
    cameraManager.renderer = renderer;
    cameraManager.scene = scene;
    cameraManager.controls = controls;
    cameraManager.stats = stats;
    cameraManager.Create();

    fbxLoader();
    fasheqi();

    particle = new ParticleManager(Particle);
    particle.camera = camera;
    particle.Scene = scene;
    particle.init('./textures/arrows.png');
 }

 function animate() {

	requestAnimationFrame( animate );
    cameraManager.Update();
	particle.Update();
}

function fasheqi(){
    const fasheqi = new FasheQiManager(Particle);
    fasheqi.scene = scene;
    fasheqi.Create();
}

function fbxLoader(){
    const fbx = new FBXLoaderManager();
    fbx.scene = scene;
    fbx.Create();
}

 init();
 animate();
