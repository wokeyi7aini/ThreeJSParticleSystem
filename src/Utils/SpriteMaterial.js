import * as THREE from '../libs/threejs/build/three.module.js';
import {camera, scene, renderer} from './camera.js'

let group;
let width, height;

let amount, radius;

init();
animate();

function init() {

    width = window.innerWidth;
    height = window.innerHeight;

    camera = new THREE.PerspectiveCamera( 60, width / height, 1, 2100 );
    camera.position.z = 50;

    scene = new THREE.Scene();

    group = new THREE.Group();
    
    amount = 5;
    radius = 10;

    // SpriteMaterial();
    PointsMaterial();
}

function animate() {

    requestAnimationFrame( animate );
    render();

}

function render() {

    const time = Date.now() / 1000;

    group.rotation.x = time * 0.5;
    group.rotation.y = time * 0.75;
    group.rotation.z = time * 1.0;

}

function SpriteMaterial(){
    const material = new THREE.SpriteMaterial( { map: null, color: 0xffffff, fog: true } );
    
    for ( let a = 0; a < amount; a ++ ) {

        const x = Math.random() - 0.5;
        const y = Math.random() - 0.5;
        const z = Math.random() - 0.5;

        const sprite = new THREE.Sprite( material );

        sprite.position.set( x, y, z );
        sprite.position.normalize();
        sprite.position.multiplyScalar( radius );

        group.add( sprite );

    }

    scene.add( group );
}


function PointsMaterial(){
    /* 存放粒子数据的网格 */
    let geometry = new THREE.BufferGeometry();
    let positions = [];
    let colors = [];

    let color = new THREE.Color(255,255,255);

    /* 使粒子在立方体范围内扩散 */
    let n2 = radius / 2;

    for (let i = 0; i < amount; i++) {

        // 点
        let x = Math.random() * radius - n2;
        let y = Math.random() * radius - n2;
        let z = Math.random() * radius - n2;

        positions.push(x, y, z);
        colors.push(color.r, color.g, color.b);
    }
    // 添加点和颜色
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const  material = new THREE.PointsMaterial({
        size: 1,
        sizeAttenuation: true,
        vertexColors: THREE.VertexColors,
        transparent: true,
        opacity: 0.7
    });
    /* 批量管理点 */
    group = new THREE.Points(geometry, material);

    scene.add(group);
}