import * as THREE from 'three';

//对应U3DTransform
let position = new THREE.Vector3(-80,100,0),
    rotation = new THREE.Quaternion(0,0,0,1),
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
let startSpeed = 0;
//对应U3D Start Size0.3-0.5
let startSize = 0.3;
//对应U3D Start Rotation0-180
let startRotation = 0;
//对应U3D Max Particles
let maxParticles = 500;

//对应U3D Rate over Time
let rateOverTime = 15;

//对应U3D Shape类型
let shape = "Hemisphere";
//对应U3D 球形发射器半径
let radius = 1;
let ShapeScale = new THREE.Vector3(1, 1, 0.3);

//对应U3D Velocity over Lifetime-Linear
let velocityLinear = new THREE.Vector3(0.008,0,0);

//对应U3D Color over Lifetime 
let colorOverLiftime = false;
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