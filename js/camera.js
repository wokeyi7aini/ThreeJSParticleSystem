import * as THREE from 'three';
import Manager from './manager.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export default class CameraManager extends Manager {
    constructor() {
        super();
    }

    Create() {
        super.Create();

        this.camera.position.set(145.86,280,1855.6);
        // this.camera.position.set(-2237,2372,1683);
        // this.camera.up.x = 0;
        // this.camera.up.y = 1;
        // this.camera.up.z = 0;
        this.camera.lookAt({
            x : 0,
            y : 0,
            z : 0
        });

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        document.body.appendChild( this.renderer.domElement );
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );

        this.scene.background = new THREE.Color( 0X5392FF );
        this.scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

        this.controls.target.set( 0, 0.5, 0 );
        this.controls.update();
        this.controls.enablePan = false;
        this.controls.enableDamping = true;

        document.body.appendChild( this.stats.dom );
    }

    Update() {

        super.Update();
        
        this.controls.update();
        this.stats.update();
        this.renderer.render( this.scene, this.camera );
    }
}