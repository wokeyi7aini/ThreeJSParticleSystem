import * as THREE from 'three';
import Manager from '../Utils/manager';

export default class PipelineAnimationManager extends Manager {

    constructor(PipelineAnimation) {
        super();
        this.isPipelineAnimation = true;
        this.group = new THREE.Group();
        this.texture = null;

        this.position = new THREE.Vector3(PipelineAnimation.position.x, PipelineAnimation.position.y, PipelineAnimation.position.z);
        this.rotation = new THREE.Quaternion(PipelineAnimation.rotation.x, PipelineAnimation.rotation.y, PipelineAnimation.rotation.z, PipelineAnimation.rotation.w);

        //初始的偏移量
        this.offsetInitX = PipelineAnimation.offsetInitX;
        this.offsetInitY = PipelineAnimation.offsetInitY;
        //裁剪
        this.tilingX = PipelineAnimation.tilingX;
        this.tilingY = PipelineAnimation.tilingY;
        this.tilingMoreX = PipelineAnimation.tilingMoreX;
        this.tilingMoreY = PipelineAnimation.tilingMoreY;
        //偏移量 20圈以内，3JS跑得速度更快，耗时更短；20圈以外，U3D跑得更快，耗时更短
        //21圈，3JS耗时34.95s,U3D耗时30.2s
        //1圈，3JS耗时1.6s，U3D耗时1.8s, 时间差距不太大，暂时1比1
        this.offsetX = PipelineAnimation.offsetX;
        this.offsetY = PipelineAnimation.offsetY;

        //对应U3D 流光粗细
        this.width = PipelineAnimation.width * 0.25;
        this.useWorldSpace = PipelineAnimation.useWorldSpace;
        //是否重复播放
        this.loop = PipelineAnimation.loop;
        //是否首尾相连
        this.closed = PipelineAnimation.closed;
        
        //坐标点，每3个为(x,y,z)一组
        this.pathArr = PipelineAnimation.pathArr;

        this.cornerVertices = PipelineAnimation.cornerVertices;

        if (!this.closed)
            this.tubularSegments = ((this.pathArr.length / 3) - 1) * 4;
        else
            this.tubularSegments = (this.pathArr.length / 3) * 4;

        if (this.cornerVertices !== 0)
            this.tubularSegments *= (this.cornerVertices + 1);
        if (this.tubularSegments > 1000)
            this.tubularSegments = 1000;

         //自发光颜色
         if (PipelineAnimation.mainColor) {
            this.mainColorHex = parseInt(PipelineAnimation.mainColor);
        }
        if (PipelineAnimation.emissiveColor) {
            this.emissiveColorHex = parseInt(PipelineAnimation.emissiveColor);
        }
    }

    Init(texturePath) {
        if (texturePath) {
            this.texture = new THREE.TextureLoader().load(texturePath);
        }
        this.LineAnimation();
    }

    LineAnimation(){
        //至少要2个点才行
        if (this.pathArr.length < 6) {
            console.log("数组个数不够!");
            return;
        }

        let curveArr = [], 
        material;
        // 三个一组取出curve数据
        for(let i = 0; i < this.pathArr.length; i += 3) {
            if (!this.useWorldSpace)
                curveArr.push(new THREE.Vector3(this.pathArr[i], this.pathArr[i + 1], this.pathArr[i + 2]));
            else
                curveArr.push(new THREE.Vector3(-this.pathArr[i], this.pathArr[i + 1], this.pathArr[i + 2]));
        }
        if (this.closed) {
            if (!this.useWorldSpace)
                curveArr.push(new THREE.Vector3(this.pathArr[0], this.pathArr[1], this.pathArr[2]));
            else
                curveArr.push(new THREE.Vector3(-this.pathArr[0], this.pathArr[1], this.pathArr[2]));
        }
    
        if (this.texture) {
            this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping; //每个都重复
            this.texture.repeat.set(this.tilingX, this.tilingY)
            // this.texture.needsUpdate = true;
        }
    
        if (this.emissiveColorHex) {
            material = new THREE.MeshStandardMaterial({
                map: this.texture,
                depthWrite: false,
                depthTest: true,
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
                depthTest: true,
                side: THREE.DoubleSide,
                color: (new THREE.Color(this.mainColorHex)).convertSRGBToLinear(),
                transparent: true,
                opacity: 1
            });
        }
    
        let tension;
        if (this.cornerVertices === 0)
            tension = 0.01;
        else if (this.cornerVertices <= 2)
            tension =  0.05 + ((this.tubularSegments / 1000.0) * 0.05);
        else
            tension = 0.1 + ((this.tubularSegments / 1000.0) * 0.05); 
        // CatmullRomCurve3创建一条平滑的三维样条曲线
        const curve = new THREE.CatmullRomCurve3(curveArr, this.closed, "catmullrom", tension);
        // 创建管道
        const tubeGeometry = new THREE.TubeGeometry(curve, this.tubularSegments, 
            this.width, 20, this.closed);
        const mesh = new THREE.Mesh(tubeGeometry, material);

        //测试用的，管道本身
        // this.ForTest(tubeGeometry);

        if (!this.useWorldSpace) {
            // 旋转值在效果测试时，发现需要左手坐标系转右手坐标系
            const q = new THREE.Quaternion(-this.rotation.x, 
                this.rotation.y, this.rotation.z, -this.rotation.w),
                v = new THREE.Euler();
            v.setFromQuaternion(q);
            if (this.rotation.y !== 0)
                v.y += Math.PI; // Y is 180 degrees off
            v.z *= -1; // flip Z
            this.group.rotation.copy(v);
            this.group.position.set(-this.position.x, this.position.y + this.width * 0.5, this.position.z);
        }
        else {
            const v = new THREE.Euler();
            this.group.rotation.copy(v);
            this.group.position.set(0, this.width * 0.5, 0);
        }
        this.group.add(mesh);
        
        this.scene.add(this.group);
        this.load = true;
    }

    Update() {
        // 设置纹理偏移
        if ((this.texture && this.loop)
        || (((this.texture && !this.loop)
        && (Math.abs(this.texture.offset.x - this.offsetInitX) < 1 + this.tilingMoreX))
        && (Math.abs(this.texture.offset.y - this.offsetInitY) < 1 + this.tilingMoreY)))
        {
            this.texture.offset.x += this.offsetX * 0.59;
            this.texture.offset.y += this.offsetY * 0.59;
        }
        else if (((this.texture && !this.loop)
        && (Math.abs(this.texture.offset.x - this.offsetInitX) >= 1 + this.tilingMoreX))
        && (Math.abs(this.texture.offset.y - this.offsetInitY) < 1 + this.tilingMoreY))
        {
            this.texture.offset.y += this.offsetY * 0.59;
        }
        else if (((this.texture && !this.loop)
        && (Math.abs(this.texture.offset.x - this.offsetInitX) < 1 + this.tilingMoreX))
        && (Math.abs(this.texture.offset.y - this.offsetInitY) >= 1 + this.tilingMoreY))
        {
            this.texture.offset.x += this.offsetX * 0.59;
        }
    }
    
    ForTest(tubeGeometry){
        let material = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.1
        });
        let mesh =  new THREE.Mesh(tubeGeometry, material);
        this.group.add(mesh);
    }

    Destroy() {
        while (this.group.children.length > 0) {
            this.group.remove(this.group.children[0]);
        }
        
        this.scene.remove(this.group);
    }

    Create() {
        this.options = {};
    }
}