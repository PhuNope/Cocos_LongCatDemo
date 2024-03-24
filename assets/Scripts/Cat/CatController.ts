import { _decorator, CCFloat, Component, Enum, Node, tween, Vec2, Vec3 } from 'cc';
import { CocosEvent } from '../utils/CocosEvent';
const { ccclass, property } = _decorator;

@ccclass('CatController')
export class CatController extends Component {

    public OnStartMove: CocosEvent<() => void> = new CocosEvent();
    public OnMoving: CocosEvent<(node: Node) => void> = new CocosEvent();
    public OnEndMove: CocosEvent<() => void> = new CocosEvent();

    @property({ type: CCFloat, min: 0 }) private timeMove: number = 0;

    private currentPosIndex: Vec2 = new Vec2(0, 0);

    public get CurrentPosIndex(): Vec2 {
        return this.currentPosIndex.clone();
    }
    public set CurrentPosIndex(indexPos: Vec2) {
        this.currentPosIndex.set(indexPos.x, indexPos.y);
    }

    protected start(): void {
    }

    public Move(to: Vec3) {
        this.OnStartMove.Invoke();
        tween(this.node)
            .to(this.timeMove, { worldPosition: to }, {
                onUpdate: () => {
                    this.OnMoving.Invoke(this.node);
                }, easing: "quintOut"
            })
            .call(() => {
                this.OnEndMove.Invoke();
            })
            .start();
    }
}


