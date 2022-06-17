import * as THREE from 'three';
import { MathUtils } from 'three';
import Manager from './manager';

const ShapeEnum = Object.freeze({
    Sphere: 'Sphere',
    Hemisphere: 'Hemisphere',
    Box: 'Box'
});

export default class FasheQiManager extends Manager {
    constructor(PARTICLE) {
        super();
        this.PARTICLE = this.formatOption(PARTICLE); // 粒子配置解析
    }

    formatOption(PARTICLE) {
        PARTICLE.position = new THREE.Vector3(PARTICLE.position.x, PARTICLE.position.y, PARTICLE.position.z);
        PARTICLE.rotation = new THREE.Quaternion(PARTICLE.rotation.x, PARTICLE.rotation.y, PARTICLE.rotation.z, PARTICLE.rotation.w);
        PARTICLE.scale = new THREE.Vector3(PARTICLE.scale.x, PARTICLE.scale.y, PARTICLE.scale.z);
        PARTICLE.ShapeScale = new THREE.Vector3(PARTICLE.ShapeScale.x, PARTICLE.ShapeScale.y, PARTICLE.ShapeScale.z);
        PARTICLE.velocityLinear = new THREE.Vector3(PARTICLE.velocityLinear.x, PARTICLE.velocityLinear.y, PARTICLE.velocityLinear.z);
        if (PARTICLE.mainColor) {
            PARTICLE.mainColorHex = parseInt(PARTICLE.mainColor);
        }
        if (PARTICLE.emissiveColor) {
            PARTICLE.emissiveColorHex = parseInt(PARTICLE.emissiveColor);
        }
        console.log(PARTICLE);
        return PARTICLE;
    }

    Create(){
        super.Create();

        let geometry;
        if (this.PARTICLE.shape === ShapeEnum.Sphere) {
            geometry = new THREE.SphereGeometry(this.PARTICLE.radius, 20, 20);
        } else if (this.PARTICLE.shape === ShapeEnum.Hemisphere) {
            geometry = new THREE.SphereGeometry(this.PARTICLE.radius, 20, 20, 0, MathUtils.degToRad(180), 0, MathUtils.degToRad(180));
        } else if (this.PARTICLE.shape === ShapeEnum.Box) {
            geometry = new THREE.BoxGeometry(this.PARTICLE.ShapeScale.x,this.PARTICLE.ShapeScale.y,this.PARTICLE.ShapeScale.z);
        }
        var materia=new THREE.MeshLambertMaterial({
            color:0xff0000,
            transparent: true,
            opacity:0.2
        });
        const mesh = new THREE.Mesh(geometry,materia);
        mesh.position.set(-this.PARTICLE.position.x, this.PARTICLE.position.y, this.PARTICLE.position.z);

        if (this.PARTICLE.shape === ShapeEnum.Sphere | this.PARTICLE.shape === ShapeEnum.Hemisphere) {
            mesh.scale.set(this.PARTICLE.scale.x * this.PARTICLE.ShapeScale.x, 
                this.PARTICLE.scale.y * this.PARTICLE.ShapeScale.y, this.PARTICLE.scale.z * this.PARTICLE.ShapeScale.z);
        } else if (this.PARTICLE.shape === ShapeEnum.Box) {
            mesh.scale.set(this.PARTICLE.scale.x, this.PARTICLE.scale.y, this.PARTICLE.scale.z);
        }

        var q = new THREE.Quaternion( -this.PARTICLE.rotation.x, this.PARTICLE.rotation.y, this.PARTICLE.rotation.z, -this.PARTICLE.rotation.w);
        var v = new THREE.Euler();  
        v.setFromQuaternion( q );
        if (this.rotation.y !== 0)
            v.y += Math.PI; // Y is 180 degrees off
        v.z *= -1; // flip Z
        mesh.rotation.copy( v );
        
        this.scene.add(mesh);
    };

}