import { _decorator, Component, Node } from 'cc';

export class DataTile {
    public x: number;
    public y: number;

    public gridID: number;

    constructor(x: number, y: number, gridID: number) {
        this.x = x;
        this.y = y;
        this.gridID = gridID;
    }
}


