import * as THREE from '../libs/threejs/build/three.module.js';

//对应U3DTransform
let position = new THREE.Vector3(-80,100,0),
    rotation = new THREE.Vector3(-1.55817,0.01586,0.898854),
    scale = new THREE.Vector3(0.5,0.5,0.5);
//材质球贴图
let texturePath = "../textures/cloud.png";

//对应U3D Duration
let duration = 30;
//对应U3D Looping
let looping = true;
//对应U3D Prewarm
let prewarm = true;
//对应U3D Start Lifetime
let startLifetime = 30;
//对应U3D Start Speed
let startSpeed = 10;
//对应U3D Start Size
let startSize = 0.3;
//对应U3D Start Rotation
let startRotation = 0;
//对应U3D Start Color
let startColor = 0xBCBCBC;
//对应U3D Max Particles
let maxParticles = 500;

//对应U3D Rate over Time
let rateOverTime = 15;

//对应U3D Shape类型
let shape = "Hemisphere";
//对应U3D 球形发射器半径
let radius = 1;
let ShapeScale = new THREE.Vector3(1000, 1000, 100);

//对应U3D Velocity over Lifetime-Linear
let velocityLinear = new THREE.Vector3(0.008,0,0);

//对应U3D Playback Speed
let playbackSpeed = 1;

export {position, rotation, scale, texturePath, duration, looping, prewarm, startLifetime, startSpeed, startSize, 
    startRotation, startColor, rateOverTime, playbackSpeed, maxParticles, shape, radius, velocityLinear };
    