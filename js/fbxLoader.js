import * as THREE from '../libs/threejs/build/three.module.js';
import { FBXLoader } from '../libs/threejs/examples/jsm/loaders/FBXLoader.js';
import {camera, scene, renderer} from './camera.js'

init();
animate();

function init() {
    //灯光
	// scene.add(new THREE.AmbientLight(0xB0B0B0));
    var directionalLight = new THREE.DirectionalLight(0xB0B0B0, 1) //方向光
    directionalLight.position.set(0,200,100);
    directionalLight.rotation.set(0, 0,150);
    scene.add(directionalLight)

    var loader = new FBXLoader();
    loader.load( '../fbx/all.FBX', function ( object ) {

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
        scene.add( object );
    });
}
 
function animate() {

    requestAnimationFrame( animate );
}
