
    import {camera, scene, renderer} from './camera.js';
    import * as THREE from '../libs/threejs/build/three.module.js';

        initScene();

        //创建场景
        // function initScene() {
        //     let texture = new THREE.CubeTextureLoader().load("../textures/Cartoon Base Twilight Equirect.png");
        //     texture.encoding = THREE.sRGBEncoding;
        //     scene.background = texture;
        // }

        function initScene() {
            //天空盒
            scene.background = new THREE.CubeTextureLoader()
                .setPath( '../textures/test6box/' )
                .load( [
                    'r.png',
                    'l.png',
                    'u.png',
                    'd.png',
                    'f.png',
                    'b.png'
                ] );
                scene.background.encoding = THREE.sRGBEncoding;
        }