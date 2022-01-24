import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import CameraManager from './Utils/camera';
import FBXLoaderManager from './Utils/fbxLoader';
import FasheQiManager from './Utils/fasheqi';
import SkyboxManager from './Utils/skyboxTest';

import ParticleManager from './AE/particle';
import ParticleJson from './Json/particleSystemDatas';

import LineAnimationManager from './AE/LineAnimation';
import LineAnimationJson from './Json/LineAnimationDatas';

import LightFlareManager from './AE/LightFlare';
import LightFlareDatas from './Json/LightFlareDatas';

let camera,renderer,scene,controls,stats,
    cameraManager,particle;
let lineAnimationArr = [];

 function Init(){
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 210000 );
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha:false } );
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

    FbxLoader();
    // Fasheqi();
    Skybox();

    Particle();
    // LineAnimation();
    // LightFlare();
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
    const Texturing = require('../textures/rain.png')
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
    LineAnimationJson.lineAnimationDatas.forEach(line => {
        const lineAnimation = new LineAnimationManager(line)
        lineAnimation.scene = scene;
        const Texturing = require('../textures/line.png')
        lineAnimation.Init(Texturing);

        lineAnimationArr.push(lineAnimation);
    });
}

function LightFlare(){
    let directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 100, -50);
    scene.add(directionalLight);

    for (let i = 0; i < LightFlareDatas.datas.length; i++) {
        LightFlareDatas.datas[i].texture = require('../textures/lensflare3.png')
    }

    const light = new LightFlareManager(LightFlareDatas.datas);
    light.light = directionalLight;
    light.Init();
}

 Init();
 Animate();
