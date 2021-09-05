import UINode, {UINodeOptions} from "../UINode";
import BeatGroup from "../../BeatGroup";
import BeatView from "./Beat/BeatView";

export type BeatGroupUINodeOptions = UINodeOptions & {
    title: string,
    beatGroup: BeatGroup,
};

export default class BeatGroupView extends UINode {
    private title: string;
    private beatGroup: BeatGroup;
    private beatViews: BeatView[] = [];

    constructor(options: BeatGroupUINodeOptions) {
        super(options);
        this.beatGroup = options.beatGroup;
        this.title = options.title;
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