export class SetWithContentEquality<T> {
    private items: T[] = [];
    private GetKey: (item: T) => unknown;

    constructor(getKey: (item: T) => unknown) {
        this.GetKey = getKey;
    }

    Add(item: T): void {
        const key = JSON.stringify(this.GetKey(item));
        if (!this.items.some(existing => JSON.stringify(this.GetKey(existing)) === key)) {
            this.items.push(item);
        }
    }

    Has(item: T): boolean {
        return this.items.some(existing => JSON.stringify(this.GetKey(existing)) === JSON.stringify(this.GetKey(item)));
    }

    Delete(item: T): boolean {
        const index = this.items.findIndex(existing => JSON.stringify(this.GetKey(existing)) === JSON.stringify(this.GetKey(item)));
        if (index >= 0) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }

    Values(): T[] {
        return [...this.items];
    }
}