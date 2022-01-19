import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import CameraManager from './src/Utils/camera';
import FBXLoaderManager from './src/Utils/fbxLoader';
import FasheQiManager from './src/Utils/fasheqi';
import SkyboxManager from './src/Utils/skyboxTest';

import ParticleManager from './src/AE/particle-v2.0';
import ParticleJson from './src/Json/particleSystemDatas';

import LineAnimationManager from './src/AE/LineAnimation';
import LineAnimationJson from './src/Json/LineAnimationDatas';

let camera,renderer,scene,controls,stats,
    cameraManager,particle;
let lineAnimationArr = [];

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
    Skybox();

    // Particle();
    LineAnimation();

 }

 function Animate() {

	requestAnimationFrame( Animate );
    if (cameraManager)
        cameraManager.Update();
    if (particle)
        particle.Update();
    for (let i = 0; i < lineAnimationArr.length; i++) {
        lineAnimationArr[i].Update();
    }
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

function Skybox(){
    const skybox = new SkyboxManager();
    skybox.scene = scene;
    skybox.Init();
}

function LineAnimation(){
    LineAnimationJson.datas.forEach(line => {
        const lineAnimation = new LineAnimationManager(line)
        lineAnimation.scene = scene;
        const Texturing = require('./textures/line.png')
        lineAnimation.Init(Texturing);

        lineAnimationArr.push(lineAnimation);
    });
}

 Init();
 Animate();
