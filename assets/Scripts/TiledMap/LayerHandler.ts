import { _decorator, Component, Mat4, Node, Size, TiledLayer, TiledTile, UITransform, Vec2, Vec3 } from 'cc';
import { DataTile } from './DataTile';
const { ccclass, property } = _decorator;

export class LayerHandler {

    public readonly layer: TiledLayer;

    public readonly layerSizeAmount: Size;
    public readonly tiledTileSize: Size;

    private anchor: Vec2;

    private readonly matrix: Mat4;

    constructor(layer: TiledLayer) {
        this.layer = layer;

        this.layerSizeAmount = this.layer.getLayerSize();
        this.tiledTileSize = this.layer.getMapTileSize();

        this.matrix = layer.node.worldMatrix;

        this.anchor = this.layer.node.getComponent(UITransform).anchorPoint;
    }

    /**
     * @description Get the world position of the tile at the specified index
     * @returns Center of the tile
     */
    public GetWorldPositionAt(indexX: number, indexY: number): Vec3 {
        var posLocal = this.layer.getPositionAt(indexX, indexY);
        // if (!posLocal) return null;

        posLocal.x = indexX * this.tiledTileSize.width + (-this.anchor.x * this.layerSizeAmount.width * this.tiledTileSize.width);
        posLocal.y = -indexY * this.tiledTileSize.height + ((1 - this.anchor.y) * this.layerSizeAmount.height * this.tiledTileSize.height);

        // convert to center
        posLocal.add2f(this.tiledTileSize.width / 2, -this.tiledTileSize.height / 2);

        return Vec3.transformMat4(new Vec3(), new Vec3(posLocal.x, posLocal.y, 0), this.matrix);
    }

    public GetIndexTileAt(worldPos: Vec3): Vec2 | null {
        var posLocal = Vec3.transformMat4(new Vec3(), worldPos, this.matrix.invert());
        var indexX = posLocal.x / this.tiledTileSize.width - (-this.anchor.x * this.layerSizeAmount.width);
        indexX = Math.floor(indexX);

        var indexY = -posLocal.y / this.tiledTileSize.height + (-this.anchor.y * this.layerSizeAmount.height);
        indexY = Math.ceil(indexY);

        if (!this.InRange(indexX, indexY)) return null;

        return new Vec2(indexX, indexY);
    }

    public GetGridIDTileByIndex(indexX: number, indexY: number): number | null {
        if (!this.InRange(indexX, indexY)) return null;

        return this.layer.getTileGIDAt(indexX, indexY);
    }

    public GetGridIDTileByPosition(worldPos: Vec3): number | null {
        var index = this.GetIndexTileAt(worldPos);

        if (!this.layer.getPositionAt(index.x, index.y)) return null;

        return this.GetGridIDTileByIndex(index.x, index.y);
    }

    public SetGridIDTileByIndex(indexX: number, indexY: number, gridID: number, flags: number = 1): boolean {
        if (indexX < 0 || indexY < 0) return false;

        this.layer.setTileGIDAt(gridID, indexX, indexY, flags);
        this.layer.markForUpdateRenderData(true);
        return true;
    }

    public SetGridIDTileByPosition(worldPos: Vec3, gridID: number, flags?: number): boolean {
        var index = this.GetIndexTileAt(worldPos);
        if (!index) return false;

        return this.SetGridIDTileByIndex(index.x, index.y, gridID, flags);
    }

    public GetDataTiles(): DataTile[] {
        let dataTiles: DataTile[] = [];
        let tiles = this.layer.tiles;
        let index = 0;

        for (let width = 0; width < this.layerSizeAmount.width; width++) {
            for (let height = 0; height < this.layerSizeAmount.height; height++) {
                dataTiles.push(new DataTile(width, height, tiles[index]));
                index++;
            }
        }

        return dataTiles;
    }

    private InRange(indexX: number, indexY: number): boolean;
    private InRange(indexX: number | Vec2, indexY?: number): boolean {
        if (indexX instanceof Vec2) {
            return indexX.x >= 0 && indexX.x < this.layerSizeAmount.width && indexX.y >= 0 && indexX.y < this.layerSizeAmount.height;
        } else {
            return indexX >= 0 && indexX < this.layerSizeAmount.width && indexY >= 0 && indexY < this.layerSizeAmount.height;
        }
    }
}