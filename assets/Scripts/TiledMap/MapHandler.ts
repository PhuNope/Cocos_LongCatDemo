import { _decorator, Component, Node, TiledLayer, TiledMap } from 'cc';
import { SetWithContentEquality } from '../utils/SetWithContentEquality';
import { LayerHandler } from './LayerHandler';
const { ccclass, property } = _decorator;

@ccclass('MapHandler')
export class MapHandler {

    private tiledMap: TiledMap;

    private layers: Record<string, LayerHandler>;

    constructor(tiledMap: TiledMap) {
        this.tiledMap = tiledMap;
        this.layers = {};
        var tiledLayers = this.tiledMap.getLayers();
        tiledLayers.forEach((layer: TiledLayer) => {
            this.layers[layer.node.name] = new LayerHandler(layer);
        });
    }

    public GetLayerHandler(layerName: string): LayerHandler | null {
        return this.layers[layerName] || null;
    }
}