import * as THREE from 'three';
import Manager from './manager';

export default class SkyboxManager extends Manager {
    constructor() {
        super();
    }
    
    Init() {
        const r = require('../../textures/test6box/r.png')
        const l = require('../../textures/test6box/l.png')
        const u = require('../../textures/test6box/u.png')
        const d = require('../../textures/test6box/d.png')
        const f = require('../../textures/test6box/f.png')
        const b = require('../../textures/test6box/b.png')

        //天空盒
        this.scene.background = new THREE.CubeTextureLoader()
            .load( [
                r,
                l,
                u,
                d,
                f,
               b
            ],
            function onLoad (text){
                console.log("onLoad ");
            },
            function onProgress (text){
                console.log("onProgress ");
            },
            function onError (text){
                console.log("onError ");
            } );
        this.scene.background.encoding = THREE.sRGBEncoding;
    }
}