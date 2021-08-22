export enum BeatUnitType {
    Normal,
    GhostNote,
}


export default class BeatUnit {
    private on: boolean = false;
    private type: BeatUnitType = BeatUnitType.Normal;
    private onUpdateCallbacks: ((on: boolean, type: BeatUnitType) => void)[] = [];

    constructor(on: boolean = false) {
        this.on = on;
    }

    stringify(): string {
        if (!this.on) {
            return "O";
        }
        if (this.type === BeatUnitType.GhostNote) {
            return "G";
        } else {
            return "#";
        }
    }

    toggle(): void {
        this.on = !this.on;
        this.notify();
    }

    setOn(on: boolean): void {
        this.on = on;
        this.notify();
    }

    setType(type: BeatUnitType) {
        this.type = type;
        this.notify();
    }

    getType(): BeatUnitType {
        return this.type;
    }

    isOn(): boolean {
        return this.on;
    }

    onUpdate(callback: (on: boolean, type: BeatUnitType) => void) {
        this.onUpdateCallbacks.push(callback);
    }

    notify(): void {
        for (const cb of this.onUpdateCallbacks) {
            cb(this.on, this.type);
        }
    }
}
