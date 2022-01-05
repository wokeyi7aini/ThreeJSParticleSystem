import * as THREE from '../libs/threejs/build/three.module.js';
import { OrbitControls } from '../libs/threejs/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from '../libs/threejs/examples/jsm/environments/RoomEnvironment.js';
import Stats from '../libs/threejs/examples/jsm/libs/stats.module.js';

let camera, scene, renderer, controls, stats;

export {camera, scene, renderer, controls, stats};

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 210000 );
    camera.position.set(145.86,280,1855.6);
    // camera.position.set(-2237,2372,1683);
    // camera.up.x = 0;
    // camera.up.y = 1;
    // camera.up.z = 0;
    camera.lookAt({
        x : 0,
        y : 0,
        z : 0
    });

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild( renderer.domElement );
    const pmremGenerator = new THREE.PMREMGenerator( renderer );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0X5392FF );
    scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

    controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0.5, 0 );
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;

    stats = new Stats();
    document.body.appendChild( stats.dom );
}

function animate() {

    requestAnimationFrame( animate );
    controls.update();
    stats.update();
    render();
}

function render() {

    renderer.render( scene, camera );
}