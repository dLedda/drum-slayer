import BeatUnit, {BeatUnitEvents, BeatUnitType} from "../../../../BeatUnit";
import ISubscriber from "../../../../Subscriber";
import UINode, {UINodeOptions} from "../../../UINode";
import {IPublisher} from "../../../../Publisher";
import "./BeatUnit.css";

export type BeatUnitUINodeOptions = UINodeOptions & {
    beatUnit: BeatUnit,
};

export default class BeatUnitView extends UINode implements ISubscriber {
    private beatUnit: BeatUnit;
    private subscription!: {unbind: () => void};

    constructor(options: BeatUnitUINodeOptions) {
        super(options);
        this.beatUnit = options.beatUnit;
        this.setupBindings();
    }

    setUnit(beatUnit: BeatUnit): void {
        this.subscription.unbind();
        this.beatUnit = beatUnit;
        this.setupBindings();
        this.redraw();
    }

    private setupBindings() {
        this.subscription = this.beatUnit.addSubscriber(this, "all");
    }

    toggle(): void {
        this.beatUnit.toggle();
    }

    turnOn(): void {
        this.beatUnit.setOn(true);
    }

    turnOff(): void {
        this.beatUnit.setOn(false);
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatUnitEvents.On) {
            this.node?.classList.add("beat-unit-on");
        } else if (event === BeatUnitEvents.Off) {
            this.node?.classList.remove("beat-unit-on");
        } else if (event === BeatUnitEvents.TypeChange) {
            if (this.beatUnit.getType() === BeatUnitType.GhostNote) {
                this.node?.classList.add("beat-unit-ghost");
            } else {
                this.node?.classList.remove("beat-unit-ghost");
            }
        }
    }

    rebuild(): HTMLElement {
        const classes = ["beat-unit"];
        if (this.beatUnit.isOn()) {
            classes.push("beat-unit-on");
        }
        this.node = UINode.make("div", {
            classes: classes,
            oncontextmenu: () => false,
        });
        this.onMouseUp((ev: MouseEvent) => {
            if (ev.button === 1) {
                const currentType = this.beatUnit.getType();
                this.beatUnit.setType(currentType === BeatUnitType.GhostNote ? BeatUnitType.Normal : BeatUnitType.GhostNote);
            }
        });
        return this.node;
    }

    onHover(cb: () => void): void {
        this.getNode().onmouseover = cb;
    }

    onMouseDown(cb: (ev: MouseEvent) => void): void {
        this.getNode().onmousedown = cb;
    }

    onMouseUp(cb: (ev: MouseEvent) => void): void {
        this.getNode().onmouseup = cb;
    }
}
