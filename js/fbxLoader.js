import * as THREE from 'three';
import Manager from './manager.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export default class FBXLoaderManager extends Manager {
    constructor() {
        super();
    }

    Create() {
        super.Create();

        //灯光
        // this.scene.add(new THREE.AmbientLight(0xB0B0B0));
        var directionalLight = new THREE.DirectionalLight(0xB0B0B0, 1) //方向光
        directionalLight.position.set(0,200,100);
        directionalLight.rotation.set(0, 0,150);
        this.scene.add(directionalLight)

        const loader = new FBXLoader()
        const path = require('../fbx/all.FBX')
        loader.load(path, object => {

            object.traverse( function ( child ) {

                if ( child.isMesh ) {

                    child.castShadow = true;
                    child.receiveShadow = true;

                }

            } );

            object.position.set(0,-100,0);
            object.rotation.set(-1.55817,0.01586,0.898854);
            object.scale.set(0.5,0.5,0.5);
            object.receiveShadow = true;
            this.scene.add( object );
        })
    }
}