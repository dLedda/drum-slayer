export enum BeatUnitType {
    Normal,
    GhostNote,
}


export default class BeatUnit {
    private on = false;
    private type: BeatUnitType = BeatUnitType.Normal;
    private onUpdateCallbacks: ((on: boolean, type: BeatUnitType) => void)[] = [];

    constructor(on = false) {
        this.on = on;
    }
 
    toggle(): void {
        this.on = !this.on;
        this.notify();
    }

    setOn(on: boolean): void {
        this.on = on;
        this.notify();
    }

    setType(type: BeatUnitType): void {
        this.type = type;
        this.notify();
    }

    getType(): BeatUnitType {
        return this.type;
    }

    isOn(): boolean {
        return this.on;
    }

    onUpdate(callback: (on: boolean, type: BeatUnitType) => void): void {
        this.onUpdateCallbacks.push(callback);
    }

    notify(): void {
        for (const cb of this.onUpdateCallbacks) {
            cb(this.on, this.type);
        }
    }
}
