import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import CameraManager from './Utils/camera';
import FBXLoaderManager from './Utils/fbxLoader';
import FasheQiManager from './Utils/fasheqi';
import SkyboxManager from './Utils/skyboxTest';

import ParticleManager from './AE/particle';
import ParticleJson from './Json/particleSystemDatas';

import PipelineAnimationManager from './AE/PipelineAnimation';
import PipelineAnimationJson from './Json/PipelineAnimationDatas';

import LightFlareManager from './AE/LightFlare';
import LightFlareDatas from './Json/LightFlareDatas';

import LineAnimationManager from './AE/LineAnimation';
import LineAnimationJson from './Json/LineAnimationDatas';

let camera,renderer,scene,controls,stats,
    cameraManager,particle;
let pipelineAnimationArr = [], lineAnimationArr = [];

 function Init(){
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 210000 );
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
    // PipelineAnimation();
    // LineAnimation();
    // LightFlare();

    // var geometry = new THREE.BoxGeometry( 1000,1000,1000 );
    // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    // var cube = new THREE.Mesh( geometry, material );
    // scene.add( cube );
 }

 function Animate() {

	requestAnimationFrame( Animate );
    if (cameraManager)
        cameraManager.Update();
    if (particle)
        particle.Update();
    for (let i = 0; i < pipelineAnimationArr.length; i++) {
        pipelineAnimationArr[i].Update();
    }
    for (let i = 0; i < lineAnimationArr.length; i++) {
        lineAnimationArr[i].Update();
    }
}

// 粒子特效
function Particle(){
    particle = new ParticleManager(ParticleJson);
    particle.camera = camera;
    particle.Scene = scene;
    const Texturing = require('../textures/cloud.png')
    particle.Init(Texturing);
}

// 粒子特效的发射器模型
function Fasheqi(){
    const fasheqi = new FasheQiManager(ParticleJson);
    fasheqi.scene = scene;
    fasheqi.Create();
}

// 场景模型
function FbxLoader(){
    const fbx = new FBXLoaderManager();
    fbx.scene = scene;
    fbx.Create();
}

// 天空盒
function Skybox(){
    const skybox = new SkyboxManager();
    skybox.scene = scene;
    skybox.Init();
}

// 管道动画（圆型管道）
function PipelineAnimation(){
    PipelineAnimationJson.PipelineAnimationDatas.forEach(line => {
        const lineAnimation = new PipelineAnimationManager(line)
        lineAnimation.scene = scene;
        const Texturing = require('../textures/line.png')
        lineAnimation.Init(Texturing);

        pipelineAnimationArr.push(lineAnimation);
    });
}

// 线条动画（平面）
function LineAnimation(){
    LineAnimationJson.LineAnimationDatas.forEach(line => {
        const lineAnimation = new LineAnimationManager(line)
        lineAnimation.scene = scene;
        const Texturing = require('../textures/line.png')
        lineAnimation.Init(Texturing, true);

        lineAnimationArr.push(lineAnimation);
    });
}

// 太阳光晕
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
