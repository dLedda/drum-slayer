import {ISubscription} from "@/Publisher";

export type MaybeRef<T> = T | Ref<T>;

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

type AllowedRef = { toString(): string } | string | null;

export default class Ref<T extends AllowedRef = Stringable> {
    private watchers: Array<(newVal: T) => void> | null = null;
    private value: T;
    private asString?: string;
    private isString: boolean;

    private constructor(val: T) {
        this.value = val;
        this.isString = typeof val === "string";
    }

    static new<T extends AllowedRef>(val: MaybeRef<T>): Ref<T> {
        if (val instanceof Ref) {
            return val;
        } else {
            return new Ref<T>(val);
        }
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

