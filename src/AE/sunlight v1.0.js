class Flare
{
    constructor(LensFlare, Size, Distance, Color) {
        // 镜头光晕的图像
        this.LensFlare = LensFlare;
        // 光晕大小
        this.Size = Size;
        // 对应光晕的位置比例
        this.Distance = Distance;
        this.Color = Color;
    }
}

import * as THREE from '../libs/threejs/build/three.module.js';
import { Lensflare, LensflareElement } from '../libs/threejs/examples/jsm/objects/Lensflare.js';
import {camera, scene} from './Utils/camera.js'

let renderer;

let flare = new Array(new Flare("../textures/lensflare2.png", 300, 0, new THREE.Color( 0xFF00FD )),
    new Flare("../textures/lensflare0_alpha.png", 120, 0, new THREE.Color( 0x00FF16 )),
    new Flare("../textures/lensflare3.png", 25, 0.06, new THREE.Color( 0xFF0000 )),
    new Flare("../textures/lensflare3.png", 30, 0.1, new THREE.Color( 0x0026FF )), 
    new Flare("../textures/lensflare3.png", 50, 0.13, new THREE.Color( 0x00F2FF )), 
    new Flare("../textures/lensflare3.png", 25, 0.2, new THREE.Color( 0xFFFE00 )));

init();

function init() {
    //需要把渲染器的alpha设置为true，如果不设置，光晕效果将无法出现。
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    //告诉渲染器需要阴影效果
    renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 默认的是，没有设置的这个清晰 THREE.PCFShadowMap
    // renderer.setClearColor(0x111111);
    document.body.appendChild(renderer.domElement);

    addSun();
}

function addSun() {
    // 需要往灯上添加光晕
    let light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 100, -50);
    scene.add(light);
    
    let lensflare = new Lensflare();

    flare.forEach(function(item){
        let texture = new THREE.TextureLoader().load(item.LensFlare);
        //                                         贴图    大小        距离
        lensflare.addElement(new LensflareElement(texture, item.Size, item.Distance, item.Color));
    });

    // 将光晕放置在点光源位置
    light.add(lensflare);

    lensflare.dispose()
}