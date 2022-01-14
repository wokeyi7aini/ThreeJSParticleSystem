import * as THREE from 'three';
import Manager from '../Utils/manager.js';

export default class LineAnimationManager extends Manager {

    constructor(LineAnimation) {
        super();
        this.isLineAnimation = true;
        this.group = new THREE.Group();
        this.texture = null;

        this.position = new THREE.Vector3(LineAnimation.position.x, LineAnimation.position.y, LineAnimation.position.z);
        this.rotation = new THREE.Quaternion(LineAnimation.rotation.x, LineAnimation.rotation.y, LineAnimation.rotation.z, LineAnimation.rotation.w);

        //初始的偏移量
        this.offsetInitX = LineAnimation.offsetInitX;
        this.offsetInitY = LineAnimation.offsetInitY;
        //裁剪
        this.tilingX = LineAnimation.tilingX;
        this.tilingY = LineAnimation.tilingY;
        this.tilingMoreX = LineAnimation.tilingMoreX;
        this.tilingMoreY = LineAnimation.tilingMoreY;
        //偏移量
        this.offsetX = LineAnimation.offsetX;
        this.offsetY = LineAnimation.offsetY;

        //对应U3D 流光粗细
        this.width = LineAnimation.width;
        this.useWorldSpace = LineAnimation.useWorldSpace;
        //是否重复播放
        this.loop = LineAnimation.loop;
        //是否首尾相连
        this.closed = LineAnimation.closed;
        //管道转折点光滑度
        this.tubularSegments = 1 + LineAnimation.numCornerVertices;
        //管道切面顶点数 应该在U3D的数值上再加2
        //在3JS端 数值为int类型且>=2，2为线条，3为三角形，4为正方形，数值越大越接近圆
        this.radialSegments = 2 + LineAnimation.numCapVertices;
        //坐标点，每3个为(x,y,z)一组
        this.pathArr = LineAnimation.pathArr;

         //自发光颜色
         if (LineAnimation.mainColor) {
            this.mainColorHex = parseInt(LineAnimation.mainColor);
        }
        if (LineAnimation.emissiveColor) {
            this.emissiveColorHex = parseInt(LineAnimation.emissiveColor);
        }
    }

    Init(texturePath) {
        this.texture = new THREE.TextureLoader().load(texturePath);
        this.LineAnimation();
    }

    //粒子流光运动
    LineAnimation(){
        let curveArr = []
        // 三个一组取出curve数据
        for(let i = 0; i < this.pathArr.length; i+=3) {
            curveArr.push(new THREE.Vector3(this.pathArr[i], this.pathArr[i+1], this.pathArr[i+2]));
        }
        if (this.closed) {
            curveArr.push(new THREE.Vector3(this.pathArr[0], this.pathArr[1], this.pathArr[2]));
        }
    
        // CatmullRomCurve3创建一条平滑的三维样条曲线
        const curve = new THREE.CatmullRomCurve3(curveArr);
        this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping; //每个都重复
        this.texture.repeat.set(this.tilingX, this.tilingY)
        this.texture.needsUpdate = true
    
        let material;
        if (this.emissiveColorHex) {
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
                transparent: true,
                opacity: 1
            });
        }
    
        // 创建管道
        const tubeGeometry = new THREE.TubeGeometry(curve, this.tubularSegments, 
            this.width, this.radialSegments, this.closed);
        const mesh = new THREE.Mesh(tubeGeometry, material);

        if (!this.useWorldSpace)
        {
            this.group.position.set(-this.position.x, this.position.y, this.position.z);
            // 旋转值在效果测试时，发现需要左手坐标系转右手坐标系
            const q = new THREE.Quaternion(-this.rotation.x, 
                this.rotation.y, this.rotation.z, -this.rotation.w),
                v = new THREE.Euler();
            v.setFromQuaternion(q);
            v.y += Math.PI; // Y is 180 degrees off
            v.z *= -1; // flip Z
            this.group.rotation.copy(v);
        }
        this.group.add(mesh);
        this.scene.add(this.group);
        this.load = true;
    }

    Update() {
        // 设置纹理偏移
        if ((this.texture && this.loop)
        || (((this.texture && !this.loop)
        && Math.abs(this.texture.offset.x - this.offsetInitX) < 1 + this.tilingMoreX)
        && Math.abs(this.texture.offset.y - this.offsetInitY) < 1 + this.tilingMoreY))
        {
            this.texture.offset.x += (this.offsetX / 4.9);
            this.texture.offset.y += (this.offsetY / 4.9);
        }
        else if (((this.texture && !this.loop)
        && Math.abs(this.texture.offset.x - this.offsetInitX) >= 1 + this.tilingMoreX)
        && Math.abs(this.texture.offset.y - this.offsetInitY) < 1 + this.tilingMoreY)
        {
            this.texture.offset.y += (this.offsetY / 4.9);
        }
        else if (((this.texture && !this.loop)
        && Math.abs(this.texture.offset.x - this.offsetInitX) < 1 + this.tilingMoreX)
        && Math.abs(this.texture.offset.y - this.offsetInitY) >= 1 + this.tilingMoreY)
        {
            this.texture.offset.x += (this.offsetX / 4.9);
        }
    }

    Destroy() {
        this.scene.remove(this.group);
    }

    Create() {
        this.options = {};
    }
}