import * as THREE from 'three';
// import {camera, scene, renderer} from './camera.js'

export default class SpriteMaterialManager extends Manager {
    constructor(){
        super();
        
        this.group = new THREE.Group();
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.amount = 5;
        this.radius = 10;
    }

    Init() {
    
        this.camera.position.z = 50;

        // this.SpriteMaterial();
        this.PointsMaterial();
    }
    
    Update() {
    
        const time = Date.now() / 1000;
    
        this.group.rotation.x = time * 0.5;
        this.group.rotation.y = time * 0.75;
        this.group.rotation.z = time * 1.0;
    
    }
    
    SpriteMaterial(){
        const material = new THREE.SpriteMaterial( { map: null, color: 0xffffff, fog: true } );
        
        for ( let a = 0; a < this.amount; a ++ ) {
    
            const x = Math.random() - 0.5;
            const y = Math.random() - 0.5;
            const z = Math.random() - 0.5;
    
            const sprite = new THREE.Sprite( material );
    
            sprite.position.set( x, y, z );
            sprite.position.normalize();
            sprite.position.multiplyScalar( this.radius );
    
            this.group.add( sprite );
    
        }
    
        this.scene.add( this.group );
    }
    
    
    PointsMaterial(){
        /* 存放粒子数据的网格 */
        let geometry = new THREE.BufferGeometry();
        let positions = [];
        let colors = [];
    
        let color = new THREE.Color(255,255,255);
    
        /* 使粒子在立方体范围内扩散 */
        let n2 = this.radius / 2;
    
        for (let i = 0; i < this.amount; i++) {
    
            // 点
            let x = Math.random() * this.radius - n2;
            let y = Math.random() * this.radius - n2;
            let z = Math.random() * this.radius - n2;
    
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
        this.group = new THREE.Points(geometry, material);
    
        this.scene.add(this.group);
    }
}