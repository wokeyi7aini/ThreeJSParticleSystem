import * as THREE from 'three';
import Manager from '../Utils/manager';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare';

class FlareItem {
    constructor(item) {
        // 镜头光晕的图像
        this.texture = item.texture;
        // 光晕大小
        this.size = item.size;
        // 对应光晕的位置比例
        this.distance = item.distance;
        this.color = (new THREE.Color(parseInt(item.color))).convertSRGBToLinear();
    }
}

export default class LightFlareManager extends Manager {

    constructor(FlareDatas) {
        super();

        this.flares = [];
        this.lensflare = new Lensflare();
        
        FlareDatas.forEach(item => {
            this.flares.push(new FlareItem(item));
        });
    }

    Init() {
        //需要把渲染器的alpha设置为true，如果不设置，光晕效果将无法出现。
        // this.renderer.properties.alpha = true;
        // this.renderer.shadowMap.enabled = true;

        this.flares.forEach(item => {
            const texture = new THREE.TextureLoader().load(item.texture);
            //                                               贴图    大小        距离
            this.lensflare.addElement(new LensflareElement(texture, item.size, item.distance, item.color));
        });

        // 将光晕放置在点光源位置
        if (this.light) {
            this.light.add(this.lensflare);
        }

        this.lensflare.dispose();
        this.load = true;
    }

    Destroy() {
        //修改了three的原生脚本
        this.lensflare.deletedElement();
        /*
        1.找到“three/examples/jsm/objects/Lensflare.js”脚本，“class Lensflare”类中增加方法：
        this.deletedElement = function ( ) {
            for ( let i = 0, l = elements.length; i < l; i ++ ) {
                elements.shift( );
            }
        };

        2.找到“node_modules\@types\three\examples\jsm\objects\Lensflare.d.ts”脚本，“export class Lensflare”类中增加：
        deletedElement(): void;
        */
    }

    Create() {
        this.options = {};
    }
}