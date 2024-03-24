import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


export class CocosEvent<T extends (...args: unknown[]) => void> {
    private data: Awaited<T>[];

    constructor() {
        this.data = [];
    }

    public readonly Add = (event: Awaited<T>) => {
        this.data.push(event);
    };

    public readonly DeleteEvent = (event: Awaited<T>) => {
        const index = this.data.indexOf(event);
        if (index !== -1) {
            this.data.splice(index, 1);
        }
    };

    public readonly Invoke = async (...params: Parameters<T>) => {
        if (this.data.length === 0) {
            return;
        }

        await Promise.all(this.data.map(value => value(...params)));
    };

    // return {
    //     Data: data,
    //     Invoke: invoke,
    //     add: add,
    //     delete: deleteEvent
    // };
}
