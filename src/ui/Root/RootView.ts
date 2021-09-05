import UINode, {UINodeOptions} from "../UINode";
import BeatGroupView from "../BeatGroup/BeatGroupView";
import BeatGroup from "../../BeatGroup";
import "./Root.css";
import BeatGroupSettingsView from "../BeatGroupSettings/BeatGroupSettingsView";

export type RootUINodeOptions = UINodeOptions & {
    title: string,
    mainBeatGroup: BeatGroup,
};

export default class RootView extends UINode {
    private title: string;
    private beatGroupView: BeatGroupView;
    private mainBeatGroup: BeatGroup;
    private beatGroupSettingsView!: BeatGroupSettingsView;


    constructor(options: RootUINodeOptions) {
        super(options);
        this.mainBeatGroup = options.mainBeatGroup;
        this.beatGroupView = new BeatGroupView({title: "THE BEAT", beatGroup: this.mainBeatGroup});
        this.title = options.title;
    }

    rebuild(): HTMLDivElement {
        this.beatGroupSettingsView = new BeatGroupSettingsView({beatGroup: this.mainBeatGroup});
        return UINode.make("div", {
            classes: ["root"],
            subs: [
                UINode.make("div", {
                    classes: ["root-settings"],
                    subs: [
                        UINode.make("h1", {innerText: this.title, classes: ["root-title"]}),
                        this.beatGroupSettingsView.render(),
                    ]
                }),
                UINode.make("div", {
                    classes: ["root-beat-stage-container"],
                    subs: [
                        UINode.make("div", {
                            classes: ["root-beat-stage"],
                            subs: [
                                this.beatGroupView.render(),
                            ],
                        })
                    ]
                })
            ],
        });
    }
}