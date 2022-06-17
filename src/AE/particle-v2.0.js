import * as THREE from 'three';
import Manager from '../Utils/manager';

const ShapeEnum = Object.freeze({
    Sphere: 'Sphere',
    Hemisphere: 'Hemisphere',
    Box: 'Box'
}),

RenderMode = Object.freeze({
    // 粒子总是面对相机
    Billboard: 'Billboard',
    Stretch: 'Stretch',
    // 粒子平面平行于Floor平面，同时始终指向世界坐标的X轴负方向
    HorizontalBillboard: 'HorizontalBillboard',
    // 粒子平面平行于世界坐标的Y轴，但是面向相机
    VerticalBillboard: 'VerticalBillboard'
});

export default class ParticleManager extends Manager {
    constructor(PARTICLE) {
        super();
        this.isParticle = true;
        this.startTime = null;
        this.currentCount = 0;
        this.texture = null;
        this.speed = null;
        this.PARTICLE = this.FrmatOption(PARTICLE); // 粒子配置解析

        this.load = false;
        this.objZero = new THREE.Vector3();
        this.group = new THREE.Group();
        this.MaxParticleCount = 0;

        this.interval = 0;
        this.intervalCount = 0;
        // 创建粒子数量
        this.newPerFrame = 0;
        this.newCount = 0;
        this.velocityLinearX = 0;
        this.velocityLinearY = 0;
        this.velocityLinearZ = 0;
        this.startRotation = 0;
        // 粒子数组
        this.particleArr = [];
        // 每一个粒子对应的创建时间数组
        this.particleCreateTimeArr = [];
    }

    FrmatOption(PARTICLE) {
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

    Production() {
        if (this.newPerFrame <= 0) {
            this.interval++;
            if (this.interval % this.intervalCount !== 0) return;
        }

        const time = Date.now();
        if (this.currentCount < this.MaxParticleCount
            && (this.PARTICLE.looping
            || (!this.PARTICLE.looping && time - this.startTime < ((this.PARTICLE.duration * 1000) / this.PARTICLE.playbackSpeed))
            )
        ) {
            this.ParticleMany(this.newCount);
        }
    }

    Animate() {
        this.Production();
        this.ParticleAnimation();
    }

    // #region 下雨/雪
    // 生产粒子
    CreateMeshPlane() {
        let material,
            x = 1;
        if (this.PARTICLE.emissiveColorHex) {
            material = new THREE.MeshStandardMaterial({
                map: this.texture,
                depthWrite: false,
                side: THREE.DoubleSide,
                color: (new THREE.Color(this.mainColorHex)).convertSRGBToLinear(),
                emissive: (new THREE.Color(this.emissiveColorHex)).convertSRGBToLinear(),
                emissiveIntensity: 1,
                transparent: true,
                opacity: 1
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                map: this.texture,
                depthWrite: false,
                side: THREE.DoubleSide,
                color: (new THREE.Color(this.mainColorHex)).convertSRGBToLinear(),
                // emissive: (new THREE.Color(this.emissiveColorHex)).convertSRGBToLinear(),
                // emissiveIntensity: 1,
                transparent: true,
                opacity: 1
            });
        }

        if (this.PARTICLE.renderMode === RenderMode.Stretch) { x = this.PARTICLE.renderLengthScale; }

        const geometry = new THREE.PlaneBufferGeometry(this.PARTICLE.startSize * x, this.PARTICLE.startSize, 1),

            box = new THREE.Mesh(geometry, material);
        this.objZero.copy(box.rotation);
        box.updateMatrixWorld();
        return box;
    }

    Init(texture) {
        const group = new THREE.Group();
        // 最大粒子数 Particles=PARTICLE.startLifetime*PARTICLE.rateOverTime
        this.MaxParticleCount = this.PARTICLE.startLifetime * this.PARTICLE.rateOverTime <= this.PARTICLE.maxParticles
            ? this.PARTICLE.startLifetime * this.PARTICLE.rateOverTime : this.PARTICLE.maxParticles;
        this.currentCount = 0;
        this.texture = new THREE.TextureLoader().load(texture);

        this.startTime = Date.now();
        this.intervalCount = parseInt(60 / this.PARTICLE.rateOverTime);
        if (this.intervalCount <= 0) this.intervalCount = 1;

        // 每一帧发射rateOverTime/60个粒子
        this.newPerFrame = parseInt(this.PARTICLE.rateOverTime / 60);
        this.newCount = this.newPerFrame;
        if (this.newCount === 0) this.newCount = 1;
        this.newCount = this.newCount * this.PARTICLE.playbackSpeed;

        this.velocityLinearX = this.PARTICLE.velocityLinear.x * 0.02;
        this.velocityLinearY = this.PARTICLE.velocityLinear.y * 0.02;
        this.velocityLinearZ = this.PARTICLE.velocityLinear.z * 0.02;
        this.speed = this.PARTICLE.startSpeed * 0.02 * this.PARTICLE.playbackSpeed;

        this.startRotation = THREE.MathUtils.degToRad(this.PARTICLE.startRotation);

        // 预热，先发射所有的粒子
        if (this.PARTICLE.prewarm) { this.ParticleMany(this.MaxParticleCount); }

        group.scale.set(this.PARTICLE.scale.x, this.PARTICLE.scale.y, this.PARTICLE.scale.z);
        group.position.set(-this.PARTICLE.position.x, this.PARTICLE.position.y, this.PARTICLE.position.z);
        // 旋转值在效果测试时，发现需要左手坐标系转右手坐标系
        const q = new THREE.Quaternion(-this.PARTICLE.rotation.x, 
            this.PARTICLE.rotation.y, this.PARTICLE.rotation.z, -this.PARTICLE.rotation.w),
            v = new THREE.Euler();
        v.setFromQuaternion(q);
        v.y += Math.PI; // Y is 180 degrees off
        v.z *= -1; // flip Z
        this.group = group;
        this.group.rotation.copy(v);

        this.Scene.add(group);
        this.load = true;
    }

    // 管理粒子
    ParticleMany(count) {
        this.currentCount += count;

        // console.log("创建了"+count+"个,还剩"+this.currentCount+"个");
        for (let i = count; i > 0; i--) {
            const obj = this.CreateMeshPlane();

            if (this.PARTICLE.shape == ShapeEnum.Sphere)
            { 
                const theta = Math.random()*360 * (Math.PI / 180);
                const phi = Math.random()*360 * (Math.PI / 180);
                obj.position.setFromSphericalCoords( this.PARTICLE.radius, phi, theta );
                obj.position.set(obj.position.x * this.PARTICLE.ShapeScale.x,
                    obj.position.y * this.PARTICLE.ShapeScale.y,
                    obj.position.z * this.PARTICLE.ShapeScale.z);
            }
            else if (this.PARTICLE.shape === ShapeEnum.Box) {
                obj.position.set((Math.random() - 0.5) * this.PARTICLE.ShapeScale.x,
                    (Math.random() - 0.5) * this.PARTICLE.ShapeScale.y,
                    (Math.random() - 0.5) * this.PARTICLE.ShapeScale.z);
            }
            /*else if (this.PARTICLE.shape == ShapeEnum.Hemisphere)
            { 
                
            }*/

            this.group.add(obj);
            this.particleArr.push(obj);
            // 每一个粒子对应的创建时间数组
            this.particleCreateTimeArr.push(Date.now());
        }
    }

    ParticleAnimation() {
        const life = Date.now() - this.particleCreateTimeArr[0];
        // 没活够，但是粒子数量太多了，需要生成新的粒子了，就要把老的销毁了
        if ((this.particleArr.length >= this.MaxParticleCount
        // 每一个粒子对应的创建时间数组
        && life >= (this.PARTICLE.duration * 1000) / this.PARTICLE.playbackSpeed)
        // 活够了，销毁了
        || life >= (this.PARTICLE.startLifetime * 1000) / this.PARTICLE.playbackSpeed) {
            this.currentCount--;
            this.group.remove(this.particleArr[0]);
            // 每一个粒子对应的创建时间数组
            // console.log("销毁了1个,还剩"+currentCount+"个");
            this.particleArr.shift();
            // 每一个粒子对应的创建时间数组
            this.particleCreateTimeArr.shift();
        }
        // camera正前方向量
        const tartgetPosCamera = this.camera.getWorldDirection(new THREE.Vector3());

        for (let i = 0; i < this.particleArr.length; i++) {
            // 每一个粒子对应的创建时间数组
            const obj = this.particleArr[i];
            if (this.PARTICLE.shape === ShapeEnum.Sphere | this.PARTICLE.shape === ShapeEnum.Hemisphere) {
                obj.position.x += (this.speed * obj.position.x * 0.002);
                obj.position.y += (this.speed * obj.position.y * 0.002);
                obj.position.z += (this.speed * obj.position.z * 0.002);
            } else if (this.PARTICLE.shape === ShapeEnum.Box) {
                obj.position.z -= this.speed;
            }

            obj.position.x -= this.velocityLinearX;
            obj.position.y += this.velocityLinearY;
            obj.position.z += this.velocityLinearZ;

            const world = obj.getWorldPosition(new THREE.Vector3());
            if (this.PARTICLE.renderMode === RenderMode.Billboard) {
                // 粒子总是面对相机
                const targetYPos = new THREE.Vector3(world.x - tartgetPosCamera.x, 
                    world.y - tartgetPosCamera.y, world.z - tartgetPosCamera.z);
                obj.lookAt(targetYPos);
                obj.rotation.z -= this.startRotation;
            } else if (this.PARTICLE.renderMode === RenderMode.Stretch) {
                const targetYPos = new THREE.Vector3(obj.position.x - this.camera.position.x, 
                    obj.position.y - this.camera.position.y, obj.position.z - camera.position.z);
                obj.lookAt(targetYPos);
            } else if (this.PARTICLE.renderMode === RenderMode.HorizontalBillboard) {
                const targetYPos = new THREE.Vector3(world.x - this.objZero.x, 
                    world.y - this.objZero.y - Math.PI / 2, world.z - this.objZero.z);
                obj.lookAt(targetYPos);
                obj.rotation.z = obj.rotation.z - Math.PI + this.startRotation;
            } else if (this.PARTICLE.renderMode === RenderMode.VerticalBillboard) {
                // 粒子平面平行于世界坐标的Y轴，但是面向相机
                const targetYPos = new THREE.Vector3(world.x - tartgetPosCamera.x,
                    world.y, world.z - tartgetPosCamera.z);
                obj.lookAt(targetYPos);
                obj.rotation.z -= this.startRotation;
            }
            // console.log(obj.position.x+","+obj.position.y+","+obj.position.z)
        }
    }

    Update() {
        this.Animate();
    }

    Destroy() {
        this.scene.remove(this.group);
    }

    Create() {
        this.options = {};
    }
}
