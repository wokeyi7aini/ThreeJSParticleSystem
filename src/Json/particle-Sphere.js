import * as THREE from '../libs/threejs/build/three.module.js';

//对应U3DTransform
let position = new THREE.Vector3(0,0,-50), 
    rotation = new THREE.Vector3(0, 0, 0), 
    scale = new THREE.Vector3(10,10,10);
//材质球贴图
let texturePath = "../textures/cloud.png";

//对应U3D Duration
let duration = 5;
//对应U3D Looping
let looping = true;
//对应U3D Prewarm
let prewarm = false;
//对应U3D Start Lifetime
let startLifetime = 5;
//对应U3D Start Speed
let startSpeed = 1;
//对应U3D Start Size
let startSize = 1;
//对应U3D Start Rotation
let startRotation = 0;
//对应U3D Start Color
let startColor = 0xffffff;
//对应U3D Rate over Time
let rateOverTime = 5;
//对应U3D Playback Speed
let playbackSpeed = 1;
//对应U3D Max Particles
let maxParticles = 1000;
//对应U3D Shape类型
let shape = "Sphere";
//对应U3D 球形发射器半径
let radius = 1;

//对应U3D Velocity over Lifetime-Linear
let velocityLinear = new THREE.Vector3(0,0,0);

export {position, rotation, scale, texturePath, duration, looping, prewarm, startLifetime, startSpeed, startSize, 
    startRotation, startColor, rateOverTime, playbackSpeed, maxParticles, shape, radius, velocityLinear };
        