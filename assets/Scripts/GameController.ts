import { _decorator, Component, EventTouch, Input, input, Node, TiledMap, Vec2, Vec3 } from 'cc';
import { CatController } from './Cat/CatController';
import { MapHandler } from './TiledMap/MapHandler';
import { LayerHandler } from './TiledMap/LayerHandler';
import { SetWithContentEquality } from './utils/SetWithContentEquality';
import { QueueCollection } from './utils/Collections/Queue';
const { ccclass, property } = _decorator;

enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

@ccclass('GameController')
export class GameController extends Component {

    @property({ type: CatController }) private cat: CatController;
    @property({ type: TiledMap }) private tiledMap: TiledMap;

    private tileMapManager: MapHandler;

    private layerGround: LayerHandler;
    private layerBlock: LayerHandler;

    private firstTouch: Vec2;

    private WalkedPositions: SetWithContentEquality<Vec2> = new SetWithContentEquality((pos: Vec2) => {
        return { x: pos.x, y: pos.y };
    });
    private RemainmingPositions: SetWithContentEquality<Vec2> = new SetWithContentEquality((pos: Vec2) => {
        return { x: pos.x, y: pos.y };
    });

    private walkingIndexPos: QueueCollection<Vec2> = new QueueCollection<Vec2>();

    protected onLoad(): void {
        this.tileMapManager = new MapHandler(this.tiledMap);

        input.on(Input.EventType.TOUCH_START, this.OnTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.OnTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);

        this.cat.OnStartMove.Add(() => {
            input.off(Input.EventType.TOUCH_START, this.OnTouchStart, this);
            input.off(Input.EventType.TOUCH_MOVE, this.OnTouchMove, this);
            input.off(Input.EventType.TOUCH_END, this.OnTouchEnd, this);
            input.off(Input.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);
        });

        this.cat.OnMoving.Add(() => {
            if (this.walkingIndexPos.size() <= 0) return;

            let indexPos = this.walkingIndexPos.peek();
            let worldPos = this.layerGround.GetWorldPositionAt(indexPos.x, indexPos.y);

            if (Vec3.equals(this.cat.node.worldPosition, worldPos, 0.05)) {
                console.log("Arrived at indexPos: " + indexPos);
                this.walkingIndexPos.dequeue();
                this.layerGround.SetGridIDTileByIndex(indexPos.x, indexPos.y, 0);
                console.log(`GID at ${indexPos.x}-${indexPos.y} is: ` + this.layerGround.GetGridIDTileByIndex(indexPos.x, indexPos.y));
            }
        });

        this.cat.OnEndMove.Add(() => {
            input.on(Input.EventType.TOUCH_START, this.OnTouchStart, this);
            input.on(Input.EventType.TOUCH_MOVE, this.OnTouchMove, this);
            input.on(Input.EventType.TOUCH_END, this.OnTouchEnd, this);
            input.on(Input.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);

            this.walkingIndexPos.clear();
        });
    }

    protected start(): void {
        this.layerGround = this.tileMapManager.GetLayerHandler("ground");
        this.layerBlock = this.tileMapManager.GetLayerHandler("block");

        let tileSpawn = this.GetTileSpawn();
        console.log("Spawn at: " + tileSpawn);

        this.cat.node.setWorldPosition(this.layerGround.GetWorldPositionAt(tileSpawn.x, tileSpawn.y));
        this.cat.CurrentPosIndex = tileSpawn;

        this.InitializeRemainingPositions();
        this.WalkedPositions.Add(tileSpawn);
    }

    private GetTileSpawn(): Vec2 {
        let tiles = this.layerGround.GetDataTiles();
        let tile = tiles.find(tile => tile.gridID == 1);

        return new Vec2(tile.x, tile.y);
    }

    private OnTouchStart(event: EventTouch): void {
        this.firstTouch = event.getLocation();
    }

    private OnTouchMove(event: EventTouch): void {

    }

    private OnTouchEnd(event: EventTouch): void {
        // if (Vec2.subtract(new Vec2(), this.firstTouch, event.getLocation()).lengthSqr() < 0.1) return;

        let direction = this.GetDirection(this.firstTouch, event.getLocation());

        if (direction == null) return;

        let nextPositions = this.CalculateNextPositions(direction);
        console.log(nextPositions);

        if (nextPositions.length > 0) {
            nextPositions.forEach((pos: Vec2) => {
                this.WalkedPositions.Add(pos);
                this.RemainmingPositions.Delete(pos);

                this.walkingIndexPos.enqueue(pos);
            });

            let pos = new Vec3(nextPositions[nextPositions.length - 1].x, nextPositions[nextPositions.length - 1].y, 0);
            this.cat.Move(this.layerGround.GetWorldPositionAt(pos.x, pos.y));
            this.cat.CurrentPosIndex = nextPositions[nextPositions.length - 1];

        }
    }

    private GetDirection(from: Vec2, to: Vec2): Direction {
        if (from.x < to.x && Math.abs(from.x - to.x) > Math.abs(from.y - to.y)) return Direction.RIGHT;
        if (from.x > to.x && Math.abs(from.x - to.x) > Math.abs(from.y - to.y)) return Direction.LEFT;
        if (from.y < to.y && Math.abs(from.x - to.x) < Math.abs(from.y - to.y)) return Direction.UP;
        if (from.y > to.y && Math.abs(from.x - to.x) < Math.abs(from.y - to.y)) return Direction.DOWN;

        if (from.x < to.x) return Direction.RIGHT;
        if (from.x > to.x) return Direction.LEFT;
    }

    private InitializeRemainingPositions(): void {
        let tiles = this.layerGround.GetDataTiles();

        for (let tile of tiles) {
            if (tile.gridID !== 0 && tile.gridID !== 1) {
                this.RemainmingPositions.Add(new Vec2(tile.x, tile.y));
            }
        }
    }

    private CalculateNextPositions(direction: Direction): Vec2[] {
        let addtitiveIndex: Vec2;
        console.log(Direction[direction]);
        switch (direction) {
            case Direction.UP:
                addtitiveIndex = new Vec2(0, -1);
                break;
            case Direction.DOWN:
                addtitiveIndex = new Vec2(0, 1);
                break;
            case Direction.LEFT:
                addtitiveIndex = new Vec2(-1, 0);
                break;
            case Direction.RIGHT:
                addtitiveIndex = new Vec2(1, 0);
                break;
        }

        let tempWalked: Vec2[] = [];
        let currentPos = this.cat.CurrentPosIndex.add(addtitiveIndex);

        while (this.layerBlock.GetGridIDTileByIndex(currentPos.x, currentPos.y) != null &&
            this.layerBlock.GetGridIDTileByIndex(currentPos.x, currentPos.y) == 0 &&
            !this.WalkedPositions.Has(currentPos)) {

            tempWalked.push(currentPos.clone());
            currentPos = currentPos.add(addtitiveIndex);
        }

        return tempWalked;
    }
}
