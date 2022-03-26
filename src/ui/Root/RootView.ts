import UINode, {UINodeOptions} from "@/ui/UINode";
import BeatGroupView from "@/ui/BeatGroup/BeatGroupView";
import BeatGroup from "@/BeatGroup";
import "./Root.css";
import BeatGroupSettingsView from "@/ui/BeatGroupSettings/BeatGroupSettingsView";
import IconView from "@/ui/Widgets/Icon/IconView";
import StageTitleBarView from "@/ui/StageTitleBar/StageTitleBarView";

export type RootUINodeOptions = UINodeOptions & {
    title: string,
    mainBeatGroup?: BeatGroup,
    orientation?: "horizontal" | "vertical",
};

export default class RootView extends UINode {
    private title: string;
    private beatGroupView: BeatGroupView;
    private focusedBeatGroup: BeatGroup;
    private beatGroupSettingsView!: BeatGroupSettingsView;
    private currentOrientation: "horizontal" | "vertical";
    private stageTitleBarView: StageTitleBarView;

    constructor(options: RootUINodeOptions) {
        super(options);
        this.currentOrientation = options.orientation ?? "horizontal";
        this.focusedBeatGroup = options.mainBeatGroup ?? RootView.defaultMainBeatGroup();
        this.beatGroupView = new BeatGroupView({
            title: options.title,
            beatGroup: this.focusedBeatGroup,
            orientation: this.currentOrientation,
        });
        this.stageTitleBarView = new StageTitleBarView({beatGroup: this.focusedBeatGroup});
        this.beatGroupSettingsView = new BeatGroupSettingsView({beatGroup: this.focusedBeatGroup});
        this.title = options.title;
        this.setOrientation(this.currentOrientation);
        this.openSidebarForDesktop();
    }

    private openSidebarForDesktop() {
        const mediaQueryList = window.matchMedia("screen and (max-width: 900px)");
        if (mediaQueryList.matches) {
            this.toggleSidebar();
        }
    }

    static defaultMainBeatGroup(): BeatGroup {
        const defaultSettings = {
            barCount: 2,
            isLooping: false,
            timeSigUp: 8,
        };
        const mainBeatGroup = new BeatGroup(defaultSettings);
        mainBeatGroup.addBeat({name: "LF"});
        mainBeatGroup.addBeat({name: "LH"});
        mainBeatGroup.addBeat({name: "RH"});
        mainBeatGroup.addBeat({name: "RF"});
        return mainBeatGroup;
    }

    setMainBeatGroup(beatGroup: BeatGroup): void {
        this.focusedBeatGroup = beatGroup;
        this.beatGroupSettingsView.setBeatGroup(this.focusedBeatGroup);
        this.beatGroupView.setBeatGroup(this.focusedBeatGroup);
        this.stageTitleBarView.setBeatGroup(this.focusedBeatGroup);
    }

    toggleSidebar(): void {
        this.getNode().classList.toggle("sidebar-visible");
    }

    toggleOrientation(): void {
        if (this.currentOrientation === "vertical") {
            this.setOrientation("horizontal");
        } else {
            this.setOrientation("vertical");
        }
    }

    setOrientation(orientation: "horizontal" | "vertical"): void {
        this.currentOrientation = orientation;
        if (orientation === "vertical") {
            this.getNode().classList.add("vertical-mode");
        } else {
            this.getNode().classList.remove("vertical-mode");
        }
        this.beatGroupView.setOrientation(orientation);
    }

    private buildSidebarStrip(): HTMLElement {
        return UINode.make("div", {
            classes: ["root-sidebar-toggle"],
        }, [
            UINode.make("div", {
                classes: ["root-quick-access-button"],
                onclick: () => this.toggleSidebar(),
            }, [
                new IconView({
                    iconName: "list",
                    color: "var(--color-ui-neutral-dark)"
                }).render()
            ]),
            UINode.make("div", {
                classes: ["root-quick-access-button"],
                onclick: () => this.toggleOrientation(),
            }, [
                new IconView({
                    iconName: "arrowClockwise",
                    color: "var(--color-ui-neutral-dark)"
                }).render(),
            ]),
            UINode.make("div", {
                classes: ["root-quick-access-button"],
                onclick: () => this.focusedBeatGroup.bakeLoops(),
            }, [
                new IconView({
                    iconName: "snowflake",
                    color: "var(--color-ui-neutral-dark)"
                }).render(),
            ]),
            UINode.make("div", {
                classes: ["root-quick-access-button"],
                title: "Reset all",
                onclick: () => this.setMainBeatGroup(RootView.defaultMainBeatGroup()),
            }, [
                new IconView({
                    iconName: "trash",
                    color: "var(--color-ui-neutral-dark)"
                }).render()
            ]),
        ]);
    }

    private buildSidebar(): HTMLElement {
        return (
            UINode.make("div", {classes: ["root-sidebar"]}, [
                UINode.make("div", {classes: ["root-settings"]}, [
                    UINode.make("h1", {classes: ["root-title"], innerText: this.title}),
                    this.beatGroupSettingsView.render(),
                ]),
                this.buildSidebarStrip(),
            ])
        );
    }

    build(): HTMLElement {
        return (
            UINode.make("div", {classes: ["root", "sidebar-visible"]}, [
                this.buildSidebar(),
                UINode.make("div", {classes: ["root-beat-stage-container"]}, [
                    this.stageTitleBarView.render(),
                    UINode.make("div", {classes: ["root-beat-stage"]}, [
                        this.beatGroupView.render(),
                    ])
                ])
            ])
        );
    }
}