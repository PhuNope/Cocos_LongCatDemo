import { _decorator, Component, Node, TiledLayer, TiledMap, Vec3 } from 'cc';
import { SetWithContentEquality } from './utils/SetWithContentEquality';
import { MapHandler } from './TiledMap/MapHandler';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    @property({ type: TiledMap }) private tiledMap: TiledMap = null;

    @property({ type: TiledLayer }) private layerGround: TiledLayer = null;
    @property({ type: TiledLayer }) private layerBlock: TiledLayer = null;

    @property({ type: Node }) private nodeTest: Node = null;

    start() {
        // let sizeBlockLayer = this.layerBlock.getLayerSize();
        // let sizeBlockTileLayer = this.layerBlock.getMapTileSize();
        // for (let width = 0; width < sizeBlockLayer.width; width++) {
        //     for (let height = 0; height < sizeBlockLayer.height; height++) {
        //         let tile = this.layerBlock.getTiledTileAt(width, height, true);
        //         // console.log(tile);
        //     }
        // }

        // // console.log(this.layerBlock.setTileGIDAt(1, 0, 0));
        // let pos = this.layerBlock.getPositionAt(0, 2);
        // pos.x += sizeBlockTileLayer.width / 2;
        // pos.y = -2 * sizeBlockTileLayer.height - sizeBlockTileLayer.height / 2;

        // console.log(pos);

        // this.nodeTest.setWorldPosition(this.layerGround.node._uiProps.uiTransformComp.convertToWorldSpaceAR(new Vec3(pos.x, pos.y, 0)));

        var map1 = new MapHandler(this.tiledMap);
    }
    update(deltaTime: number) {

    }
}


