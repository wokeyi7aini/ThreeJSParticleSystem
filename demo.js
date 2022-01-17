import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import CameraManager from './src/Utils/camera.js';
import FBXLoaderManager from './src/Utils/fbxLoader.js';
import FasheQiManager from './src/Utils/fasheqi.js';

import ParticleManager from './src/AE/particle-v2.0.js';
import ParticleJson from './src/Json/particleSystemDatas.js';

import LineAnimationManager from './src/AE/LineAnimation.js';
import LineAnimationJson from './src/Json/LineAnimationDatas.js';

let camera,renderer,scene,controls,stats,
    cameraManager,particle,lineAnimation;

 function Init(){
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

    // var axis = new THREE.AxesHelper(800);
    // scene.add(axis);

    // FbxLoader();
    // Fasheqi();

    // Particle();
    LineAnimation();

 }

 function Animate() {

	requestAnimationFrame( Animate );
    if (cameraManager)
        cameraManager.Update();
    if (particle)
        particle.Update();
    if (lineAnimation)
        lineAnimation.Update();
}

function Particle(){
    particle = new ParticleManager(ParticleJson);
    particle.camera = camera;
    particle.Scene = scene;
    const Texturing = require('./textures/arrows.png')
    particle.Init(Texturing);
}

function Fasheqi(){
    const fasheqi = new FasheQiManager(ParticleJson);
    fasheqi.scene = scene;
    fasheqi.Create();
}

function FbxLoader(){
    const fbx = new FBXLoaderManager();
    fbx.scene = scene;
    fbx.Create();
}

function LineAnimation(){
    lineAnimation = new LineAnimationManager(LineAnimationJson)
    lineAnimation.scene = scene;
    const Texturing = require('./textures/arrows_n.png')
    lineAnimation.Init(Texturing);
}

 Init();
 Animate();
