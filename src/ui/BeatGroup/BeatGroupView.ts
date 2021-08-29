import UINode, {UINodeOptions} from "../UINode";
import BeatGroup from "../../BeatGroup";
import BeatView from "./Beat/BeatView";
import BeatGroupSettingsView from "./BeatGroupSettings/BeatGroupSettingsView";

export type BeatGroupUINodeOptions = UINodeOptions & {
    title: string,
    beatGroup: BeatGroup,
};

export default class BeatGroupView extends UINode {
    private title: string;
    private beatGroup: BeatGroup;
    private beatGroupSettingsView!: BeatGroupSettingsView;

    constructor(options: BeatGroupUINodeOptions) {
        super(options);
        this.beatGroup = options.beatGroup;
        this.title = options.title;
    }

    rebuild(): HTMLDivElement {
        const beatViews = [];
        for (let i = 0; i < this.beatGroup.getBeatCount(); i++) {
            beatViews.push(new BeatView({beat: this.beatGroup.getBeatByIndex(i)}));
        }
        this.beatGroupSettingsView = new BeatGroupSettingsView({beatGroup: this.beatGroup});
        return UINode.make("div", {
            classes: ["beat-group"],
            subs: [
                UINode.make("h3", {innerText: this.title}),
                this.beatGroupSettingsView.rebuild(),
                ...beatViews.map(bv => bv.rebuild())
            ],
        });
    }
}