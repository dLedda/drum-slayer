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
    private sidebar!: HTMLDivElement;


    constructor(options: RootUINodeOptions) {
        super(options);
        this.mainBeatGroup = options.mainBeatGroup;
        this.beatGroupView = new BeatGroupView({title: "THE BEAT", beatGroup: this.mainBeatGroup});
        this.title = options.title;
    }

    toggleSidebar(): void {
        this.getNode().classList.toggle("sidebar-visible");
    }

    toggleOrientation(): void {
        this.getNode().classList.toggle("vertical-mode");
    }

    rebuild(): HTMLElement {
        this.beatGroupSettingsView = new BeatGroupSettingsView({beatGroup: this.mainBeatGroup});
        const sidebarMain = UINode.make("div", {
            classes: ["root-settings"],
            subs: [
                UINode.make("h1", {innerText: this.title, classes: ["root-title"]}),
                this.beatGroupSettingsView.render(),
            ]
        });
        const sidebarToggle = UINode.make("div", {
            classes: ["root-sidebar-toggle"],
            subs: [
                UINode.make("div", {
                    classes: ["root-hamburger"],
                    onclick: () => this.toggleSidebar(),
                }),
                UINode.make("div", {
                    classes: ["root-switch-mode"],
                    onclick: () => this.toggleOrientation(),
                })
            ]
        });
        this.sidebar = UINode.make("div", {
            classes: ["root-sidebar"],
            subs: [
                sidebarMain,
                sidebarToggle,
            ]
        });
        this.node = UINode.make("div", {
            classes: ["root", "sidebar-visible"],
            subs: [
                this.sidebar,
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
        return this.node;
    }
}