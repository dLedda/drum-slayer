import {ISubscription} from "@/Publisher";

class RefSubscription implements ISubscription {
    private unbindCallback?: () => void;

    constructor(unbindCallback: () => void) {
        this.unbindCallback = unbindCallback;
    }

    unbind(): void {
        this.unbindCallback?.();
    }
}

interface Stringable {
    toString(): string;
}

export default class Ref<T extends { toString(): string } | string | null = Stringable> {
    private watchers: Array<(newVal: T) => void> | null = null;
    private value: T;
    private asString?: string;
    private isString: boolean;

    constructor(val: T) {
        this.value = val;
        this.isString = typeof val === "string";
    }

    watch(watcher: (newVal: T) => void): ISubscription {
        if (this.watchers === null) {
            this.watchers = [];
        }
        this.watchers.push(watcher);
        return new RefSubscription(() => this.unbind(watcher));
    }

    private unbind(watcher: (newVal: T) => void): void {
        if (!this.watchers) {
            return;
        }
        const index = this.watchers.indexOf(watcher);
        if (index !== -1) {
            this.watchers.splice(index, 1);
        }
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

