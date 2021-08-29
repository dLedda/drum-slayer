import BeatUnit, {BeatUnitEvents} from "../../../../BeatUnit";
import ISubscriber from "../../../../Subscriber";
import UINode, {UINodeOptions} from "../../../UINode";
import {IPublisher} from "../../../../Publisher";
import "./BeatUnit.css";

export type BeatUnitUINodeOptions = UINodeOptions & {
    beatUnit: BeatUnit,
};

export default class BeatUnitView extends UINode implements ISubscriber {
    private beatUnit: BeatUnit;

    constructor(options: BeatUnitUINodeOptions) {
        super(options);
        this.beatUnit = options.beatUnit;
        this.setupBindings();
        this.rebuild();
    }

    private setupBindings() {
        this.beatUnit.addSubscriber(this, "all");
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T) {
        if (event === BeatUnitEvents.On) {
            this.node?.classList.add("on");
        } else if (event === BeatUnitEvents.Off) {
            this.node?.classList.remove("on");
        }
    }

    rebuild(): HTMLElement {
        const classes = ["beat-unit"];
        if (this.beatUnit.isOn()) {
            classes.push("on");
        }
        this.node = UINode.make("div", {
            classes: classes,
            onclick: () => {
                this.beatUnit.toggle();
            }
        });
        return this.node;
    }
}
