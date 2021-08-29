import UINode, {UINodeOptions} from "../UINode";
import BeatGroupView from "../BeatGroup/BeatGroupView";
import BeatGroup from "../../BeatGroup";
import "./Root.css";

export type RootUINodeOptions = UINodeOptions & {
    title: string,
    mainBeatGroup: BeatGroup,
    parent: HTMLElement,
};

export default class RootView extends UINode {
    private title: string;
    private parent: HTMLElement;
    private beatGroupView: BeatGroupView;
    private mainBeatGroup: BeatGroup;

    constructor(options: RootUINodeOptions) {
        super(options);
        this.beatGroupView = new BeatGroupView({title: "THE BEAT", beatGroup: options.mainBeatGroup});
        this.mainBeatGroup = options.mainBeatGroup;
        this.title = options.title;
        this.parent = options.parent;
        this.rebuild();
    }

    render() {
        const oldNode = this.node;
        this.node = this.rebuild();
        if (oldNode) {
            this.parent.replaceChild(oldNode, this.node);
        } else {
            this.parent.appendChild(this.node);
        }
    }

    rebuild(): HTMLDivElement {
        return UINode.make("div", {
            subs: [
                UINode.make("h1", {innerText: this.title, classes: ["title"]}),
                this.beatGroupView.rebuild(),
            ],
            classes: ["rootView"]
        });
    }
}