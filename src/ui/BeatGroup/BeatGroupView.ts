import UINode, {UINodeOptions} from "../UINode";
import BeatGroup, {BeatGroupEvents} from "../../BeatGroup";
import BeatView from "./Beat/BeatView";
import "./BeatGroup.css";
import ISubscriber from "../../Subscriber";
import {IPublisher} from "../../Publisher";

export type BeatGroupUINodeOptions = UINodeOptions & {
    title: string,
    beatGroup: BeatGroup,
};

export default class BeatGroupView extends UINode implements ISubscriber {
    private title: string;
    private beatGroup: BeatGroup;
    private beatViews: BeatView[] = [];

    constructor(options: BeatGroupUINodeOptions) {
        super(options);
        this.beatGroup = options.beatGroup;
        this.title = options.title;
        this.beatGroup.addSubscriber(this, BeatGroupEvents.BeatListChanged);
    }

    notify<T extends string | number>(publisher: IPublisher<T>, event: "all" | T[] | T): void {
        if (event === BeatGroupEvents.BeatListChanged) {
            this.redraw();
        }
    }

    rebuild(): HTMLDivElement {
        this.beatViews = [];
        for (let i = 0; i < this.beatGroup.getBeatCount(); i++) {
            this.beatViews.push(new BeatView({beat: this.beatGroup.getBeatByIndex(i)}));
        }
        return UINode.make("div", {
            classes: ["beat-group"],
            subs: [
                ...this.beatViews.map(bv => bv.render())
            ],
        });
    }
}