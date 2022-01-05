import * as THREE from '../libs/threejs/build/three.module.js';

//对应U3DTransform
let position = new THREE.Vector3(0,0,0), 
    rotation = new THREE.Quaternion(0.5,0.27,-0.14,0.82), 
    scale = new THREE.Vector3(1, 1, 1);
//材质球贴图
let texturePath = "../textures/arrows.png";

//对应U3D Duration
let duration = 5;
//对应U3D Looping
let looping = true;
//对应U3D Prewarm
let prewarm = false;
//对应U3D Start Lifetime
let startLifetime = 150;
//对应U3D Start Speed
let startSpeed = 100;
//对应U3D Start Size
let startSize = 50;
//对应U3D Start Rotation
let startRotation = 0;
//对应U3D Max Particles
let maxParticles = 1000;

//对应U3D Rate over Time
let rateOverTime = 10;

//对应U3D Shape类型
let shape = "Box";
//对应U3D 球形发射器半径
let radius = 1;
let ShapeScale = new THREE.Vector3(1000, 1000, 100);

//对应U3D Velocity over Lifetime-Linear
let velocityLinear = new THREE.Vector3(0,0,0);

//对应U3D Color over Lifetime 
let colorOverLiftime = false;
let colorOverLiftimeTimes = [];
let colorOverLiftimeColors = [];
let colorOverLiftimeAlphas = [];

//对应U3D Playback Speed
let playbackSpeed = 1;

let renderMode = "VerticalBillboard";
let renderLengthScale = 1;

//对应U3D shader _Color
let mainColor = "0x910D43";
//对应U3D shader _EmissionColor
let emissiveColor = "0xFFD700";

let mainColorHex = null;
if (mainColor != "" && mainColor != null)
    mainColorHex= parseInt(mainColor)
let emissiveColorHex = null;
if (emissiveColor != "" && emissiveColor != null)
    emissiveColorHex= parseInt(emissiveColor);


export {position, rotation, scale, texturePath, duration, looping, prewarm, startLifetime, startSpeed, startSize, 
    startRotation, rateOverTime, playbackSpeed, maxParticles, shape, radius, velocityLinear, ShapeScale,
    renderMode, renderLengthScale, mainColorHex, emissiveColorHex };
    