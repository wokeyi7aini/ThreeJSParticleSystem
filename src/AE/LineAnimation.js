//2022年2月28日 面片+progress+curve.getPoint，面片朝向利用curve.computeFrenetFrames拿到法线，计算面片与法线的夹角。
//X Y移动效果暂时可以被接受。
//lock参数，lock=false，面片的初始夹角按照json配置的角度计算偏转正确。
import * as THREE from 'three';
import Manager from '../Utils/manager';

export default class LineAnimationManager extends Manager {

    constructor(LineAnimation) {
        super();
        this.isLineAnimation = true;
        this.group = new THREE.Group();
        this.texture = null;
        //所有运动的面片集合
        this.meshArray = [];

        this.position = new THREE.Vector3(LineAnimation.position.x, LineAnimation.position.y, LineAnimation.position.z);
        this.rotation = new THREE.Quaternion(LineAnimation.rotation.x, LineAnimation.rotation.y, LineAnimation.rotation.z, LineAnimation.rotation.w);

        //面片的旋转值
        let planeRotate = new THREE.Quaternion(LineAnimation.planeRotation.x, LineAnimation.planeRotation.y, LineAnimation.planeRotation.z, LineAnimation.planeRotation.w);
        // 旋转值在效果测试时，发现需要左手坐标系转右手坐标系
        const q1 = new THREE.Quaternion(-planeRotate.x, 
            planeRotate.y, planeRotate.z, -planeRotate.w),
        v1 = new THREE.Euler();
        v1.setFromQuaternion(q1);
        v1.y += Math.PI; // Y is 180 degrees off
        v1.z *= -1; // flip Z
        this.planeRotate = v1;
        
        //裁剪
        this.tilingX = LineAnimation.tilingX;
        this.tilingY = LineAnimation.tilingY;
        
        //平面流光里，代表的是速度值
        this.speedX = LineAnimation.speedX;
        this.speedY = LineAnimation.speedY;

        //tiling后，对象之间的Y轴方位间隙
        this.offsetY = LineAnimation.offsetY;

        //对应U3D 流光粗细
        this.width = LineAnimation.width;
        this.height = LineAnimation.height;
        
        //面片在移动时是否固定使用同一个角度（主要针对tiling）
        this.lock = LineAnimation.lock;
        //是否重复播放
        this.loop = LineAnimation.loop;
        //是否首尾相连
        this.closed = LineAnimation.closed;
        
        //坐标点，每3个为(x,y,z)一组
        this.pathArr = LineAnimation.pathArr;

        // 分段值，数值越大，曲线越圆滑
        this.cornerVertices = LineAnimation.cornerVertices;

        //自发光颜色
        if (LineAnimation.mainColor) {
            this.mainColorHex = parseInt(LineAnimation.mainColor);
        }
        if (LineAnimation.emissiveColor) {
            this.emissiveColorHex = parseInt(LineAnimation.emissiveColor);
        }

        this.frames = null;
        this.faceRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        this.binormal = new THREE.Vector3();
        this.tangent = new THREE.Vector3();
        this.twistRotation = new THREE.Quaternion();
    }

    Init(texturePath, test = false) {
        this.texture = new THREE.TextureLoader().load(texturePath);
        this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping; //每个都重复
        this.texture.repeat.set(1, 1);

        //整体流光的位置&旋转
        // 旋转值在效果测试时，发现需要左手坐标系转右手坐标系
        const q = new THREE.Quaternion(-this.rotation.x, 
            this.rotation.y, this.rotation.z, -this.rotation.w),
        v = new THREE.Euler();
        v.setFromQuaternion(q);
        v.y += Math.PI; // Y is 180 degrees off
        v.z *= -1; // flip Z
        this.group.rotation.copy(v);
        this.group.position.set(-this.position.x, this.position.y, this.position.z);

        this.LineAnimation(test);
    }

    LineAnimation(test){
        //至少要2个点才行
        if (this.pathArr.length < 6) {
            console.log("数组个数不够!");
            return;
        }

        let curveArr = [], 
        material;
        // 三个一组取出curve数据
        for (let i = 0; i < this.pathArr.length; i += 3) {
            curveArr.push(new THREE.Vector3(-this.pathArr[i], this.pathArr[i + 1], this.pathArr[i + 2]));
        }
        if (this.closed) {
            curveArr.push(new THREE.Vector3(-this.pathArr[0], this.pathArr[1], this.pathArr[2]));
        }
    
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
        
        // CatmullRomCurve3创建一条平滑的三维样条曲线
        this.curve = new THREE.CatmullRomCurve3(curveArr, this.closed, "catmullrom", 0.5);
        this.frames = this.curve.computeFrenetFrames(this.cornerVertices, this.closed)

        // 创建管道
        this.CreateLine3D(material);

        //测试用的，管道本身
        if (test)
            this.ForTest();

        for (let i = 0; i < this.meshArray.length; i++) {
            const mesh =  this.meshArray[i].tyGroup;
            this.group.add(mesh);
        }

        this.scene.add(this.group);
        this.load = true;
    }

    Update() {
        //判断循环播放
        for (let i = 0; i < this.meshArray.length; i++) {
            const progress = this.meshArray[i].progress;
            progress += this.speedX;

            if (this.speedX >= 0) {
                if (this.loop && progress >= this.meshArray[i].txProgressEnd) {
                    progress = this.meshArray[i].txProgressStart;
                } else if (!this.loop && progress >= this.meshArray[i].txProgressEnd) {
                    continue;
                }
            } else {
                if (this.loop && progress <= this.meshArray[i].txProgressEnd) {
                    progress = this.meshArray[i].txProgressStart;
                } else if (!this.loop && progress <= this.meshArray[i].txProgressEnd) {
                    continue;
                }
            }

            if ((this.speedX > 0 && progress >= 1)
            || (this.speedX < 0 && progress <= 0)) {
                progress = this.meshArray[i].txProgressStart;
            }

            this.meshArray[i].progress = progress;

            const point = this.curve.getPointAt(progress);
            if (point) {
                const tyGroup = this.meshArray[i].tyGroup;
                tyGroup.position.set(point.x,point.y,point.z);

                //X轴方向移动，未锁定单个面片的旋转时，按照面片初始旋转量&当前点的法线，根据法线轴旋转面片
                if (!this.lock) {
                    const index = parseInt(progress * this.cornerVertices);
                    this.binormal.copy(this.frames.binormals[index]).applyQuaternion(this.faceRotation);
                    this.tangent.copy(this.frames.tangents[index]);
                    this.twistRotation.setFromAxisAngle(this.tangent, 0);
                    this.binormal.applyQuaternion(this.twistRotation);
                    const angleToBinormal = this.binormal.angleTo(this.planeRotate.toVector3());
                    tyGroup.quaternion.setFromAxisAngle(this.binormal, angleToBinormal)
                }

                //Y轴方向单个面片的Y轴移动
                {
                    if (this.speedY === 0) continue;

                    const meshs = tyGroup.children;
                    //只有一个面片时，移动的是贴图offset Y
                    if (meshs.length === 1) {
                        // 设置纹理偏移
                        if ((this.texture && this.loop)
                        || ((this.texture && !this.loop)
                        && (Math.abs(this.texture.offset.y) < 1)))
                        {
                            this.texture.offset.y += this.speedY * 0.59;
                        }
                    } else {
                        const positionStart = this.meshArray[i].positionArray.positionStart,
                        positionEnd = this.meshArray[i].positionArray.positionEnd;

                        //多个面片时，移动的是面片的Y轴坐标
                        for (let k = 0; k < meshs.length; k++) {
                            const mesh = meshs[k],
                            positionMove = new THREE.Vector3();
                            positionMove.subVectors(positionEnd, positionStart);

                            const offset = new THREE.Vector3(positionMove.x * this.speedY, positionMove.y * this.speedY, 
                                positionMove.z * this.speedY);
                            mesh.position.add(offset);

                            //当前面片距离终点的位置
                            const distance = mesh.position.distanceTo(positionEnd);

                            if (this.loop && distance <= 1) {
                                mesh.position.set(positionStart.x, positionStart.y, positionStart.z);
                            } else if (!this.loop && distance <= this.speedY) {
                                continue;
                            }
                        }
                    }
                }
            }
        }
    }

    CreateLine3D(material) {
        const txProgress = 1.0 / this.tilingX;
        for (let tx = 0; tx < this.tilingX; tx++) {
            const tyGroup = new THREE.Group(),
            offsety = this.offsetY,
            txProgressEnd = 0,
            txProgressStart = 0,
            progress = txProgress * tx,
            positionStart = new THREE.Vector3(),
            positionEnd = new THREE.Vector3(),
                
            //Y轴方向初始偏移量
            translateYInit = 0,
            translateYInitMin = 0,
            translateYInitMax = 0,
            min = 0,
            max = 0,
            moveDistance = (this.height + this.offsetY) * 0.5;

            if (this.tilingY !== 1) {
                offsety += this.height;
            }

            for (let ty = 0; ty < this.tilingY; ty++) {
                const geometry = new THREE.PlaneBufferGeometry(this.width, this.height, 1),
                mesh = new THREE.Mesh(geometry, material),
                offsetCount = parseInt(this.tilingY * 0.5),

                world = mesh.getWorldPosition(new THREE.Vector3()),
                targetYPos = new THREE.Vector3(world.x, world.y - Math.PI / 2, world.z);

                mesh.lookAt(targetYPos);
                mesh.updateMatrixWorld();
                
                mesh.rotation.x += this.planeRotate.x;
                mesh.rotation.y += this.planeRotate.y;
                mesh.rotation.z += this.planeRotate.z;

                //计算Y轴方向tilingY多个面片的间距位置偏移
                if (this.tilingY !== 1 && this.tilingY % 2 === 0) {
                    translateYInit = (offsety * (ty - offsetCount)) + offsety * 0.5;
                    mesh.translateY(translateYInit);
                } else if ((ty !== offsetCount && this.tilingY !== 1) && this.tilingY % 2 !== 0) {
                    translateYInit = offsety * (ty - offsetCount);
                    mesh.translateY(translateYInit);
                }

                //拿到最小和最大位置的偏移量
                min = Math.min(translateYInitMin, translateYInit);
                max = Math.max(translateYInitMax, translateYInit);
                if (min < translateYInitMin) {
                    //起始位置再偏移半个身位，避免面片重叠，每个面片都可以跑相同的距离
                    translateYInitMin = min;
                    mesh.translateY(-moveDistance);
                    positionStart = new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z);
                    mesh.translateY(moveDistance);
                }
                if (max > translateYInitMax) {
                    //终点位置再偏移半个身位，避免面片重叠，每个面片都可以跑相同的距离
                    translateYInitMax = max;
                    mesh.translateY(moveDistance);
                    positionEnd = new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z);
                    mesh.translateY(-moveDistance);
                }

                tyGroup.add(mesh);
            }

            if (this.speedX >= 0)
            {
                txProgressStart = 0;
                txProgressEnd = 1;
            } else {
                txProgressStart = 1;
                txProgressEnd = 0;
                progress = txProgress * (tx + 1);
            }

            const obj = { tyGroup, txProgressStart, txProgressEnd, progress, 
                positionArray:{
                positionStart: positionStart,
                positionEnd: positionEnd
            } };

            this.meshArray.push(obj);
        }
    }

    ForTest(){
        //运行轨道，辅助用
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xff00ff,
            linewidth: 50,
        }),
        // 分段值，数值越大，曲线越圆滑
        points = this.curve.getPoints(100),
        lineGeometry = new THREE.BufferGeometry().setFromPoints(points),
        line = new THREE.Line(lineGeometry, lineMaterial);

        this.group.add(line);
    }

    Destroy() {
        this.scene.remove(this.group);
    }

    Create() {
        this.options = {};
    }
}