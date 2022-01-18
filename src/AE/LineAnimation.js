import * as THREE from 'three';
import Manager from '../Utils/manager';

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
        //偏移量 20圈以内，3JS跑得速度更快，耗时更短；20圈以外，U3D跑得更快，耗时更短
        //21圈，3JS耗时34.95s,U3D耗时30.2s
        //1圈，3JS耗时1.6s，U3D耗时1.8s, 时间差距不太大，暂时1比1
        this.offsetX = LineAnimation.offsetX;
        this.offsetY = LineAnimation.offsetY;

        //对应U3D 流光粗细
        this.width = LineAnimation.width * 0.25;
        this.useWorldSpace = LineAnimation.useWorldSpace;
        //是否重复播放
        this.loop = LineAnimation.loop;
        //是否首尾相连
        this.closed = LineAnimation.closed;
        
        //坐标点，每3个为(x,y,z)一组
        this.pathArr = LineAnimation.pathArr;

        this.cornerVertices = LineAnimation.cornerVertices;

        if (!this.closed)
            this.tubularSegments = ((this.pathArr.length / 3) - 1) * 4;
        else
            this.tubularSegments = (this.pathArr.length / 3) * 4;

        if (this.cornerVertices !== 0)
            this.tubularSegments *= (this.cornerVertices + 1);
        if (this.tubularSegments > 1000)
            this.tubularSegments = 1000;

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

    LineAnimation(){
        //至少要2个点才行
        if (this.pathArr.length <= 6) {
            console.log("数组个数不够!");
            return;
        }

        let curveArr = [], 
        material;
        // 三个一组取出curve数据
        for(let i = 0; i < this.pathArr.length; i += 3) {
            curveArr.push(new THREE.Vector3(-this.pathArr[i], this.pathArr[i + 1], this.pathArr[i + 2]));
        }
        if (this.closed) {
            curveArr.push(new THREE.Vector3(-this.pathArr[0], this.pathArr[1], this.pathArr[2]));
        }
    
        this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping; //每个都重复
        this.texture.repeat.set(this.tilingX, this.tilingY)
        this.texture.needsUpdate = true
    
        if (this.emissiveColorHex) {
            material = new THREE.MeshStandardMaterial({
                map: this.texture,
                depthWrite: false,
                side: THREE.DoubleSide,
                color: (new THREE.Color(this.mainColorHex)).convertSRGBToLinear(),
                emissive: (new THREE.Color(this.emissiveColorHex)).convertSRGBToLinear(),
                emissiveIntensity: 1,
                transparent: true,
                opacity: 1,
                //不受环境影响本身颜色
                envMapIntensity: 0
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                map: this.texture,
                depthWrite: false,
                side: THREE.DoubleSide,
                color: (new THREE.Color(this.mainColorHex)).convertSRGBToLinear(),
                transparent: true,
                opacity: 1,
                //不受环境影响本身颜色
                envMapIntensity: 0
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
            this.width, 3, this.closed);
        const mesh = new THREE.Mesh(tubeGeometry, material);

        //测试用的，管道本身
        this.ForTest(tubeGeometry);

        if (!this.useWorldSpace) {
            this.group.position.set(-this.position.x, this.position.y + this.width * 0.5, this.position.z);
            // 旋转值在效果测试时，发现需要左手坐标系转右手坐标系
            const q = new THREE.Quaternion(-this.rotation.x, 
                this.rotation.y, this.rotation.z, -this.rotation.w),
                v = new THREE.Euler();
            v.setFromQuaternion(q);
            v.y += Math.PI; // Y is 180 degrees off
            v.z *= -1; // flip Z
            this.group.rotation.copy(v);
        }
        else {
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
        this.scene.remove(this.group);
    }

    Create() {
        this.options = {};
    }
}