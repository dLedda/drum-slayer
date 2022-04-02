export default class Ref<T extends { toString(): string } | string | null = string> {
    private watchers: Array<(newVal: T) => void> | null = null;
    private value: T;
    private asString?: string;
    private isString: boolean;

    constructor(val: T) {
        this.value = val;
        this.isString = typeof val === "string";
    }

    watch(callback: (newVal: T) => void): void {
        if (this.watchers === null) {
            this.watchers = [];
        }
        this.watchers.push(callback);
    }

    get val(): T {
        return this.value;
    }

    set val(val: T) {
        this.watchers?.forEach(watcher => watcher(val));
        this.value = val;
    }

    toString(): string {
        if (!this.asString) {
            if (this.isString) {
                return this.val as unknown as string;
            } else {
                this.asString = this.val?.toString() ?? "null";
            }
        }
        return this.asString;
    }
}

