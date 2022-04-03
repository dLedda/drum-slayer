import UINode, {h, UINodeOptions} from "@/ui/UINode";
import BeatView from "@/ui/Beat/BeatView";
import Beat from "@/Beat";
import "./Root.css";
import BeatSettingsView from "@/ui/BeatSettings/BeatSettingsView";
import IconView from "@/ui/Widgets/Icon/IconView";
import StageTitleBarView from "@/ui/StageTitleBar/StageTitleBarView";
import Ref from "@/Ref";

export type RootUINodeOptions = UINodeOptions & {
    title: string,
    mainBeat?: Beat,
    orientation?: "horizontal" | "vertical",
};

export default class RootView extends UINode {
    private title: string;
    private beatView: BeatView;
    private focusedBeat: Beat;
    private beatSettingsView: BeatSettingsView;
    private currentOrientation: "horizontal" | "vertical";
    private stageTitleBarView: StageTitleBarView;
    private showHideSidebarButton: Ref<HTMLDivElement | null> = Ref.new<HTMLDivElement | null>(null);
    private sidebarActive = true;

    constructor(options: RootUINodeOptions) {
        super(options);
        this.currentOrientation = options.orientation ?? "horizontal";
        this.focusedBeat = options.mainBeat ?? RootView.defaultMainBeatGroup();
        this.beatView = new BeatView({
            title: options.title,
            beat: this.focusedBeat,
            orientation: this.currentOrientation,
        });
        this.stageTitleBarView = new StageTitleBarView({beat: this.focusedBeat});
        this.beatSettingsView = new BeatSettingsView({beat: this.focusedBeat});
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

    static defaultMainBeatGroup(): Beat {
        const defaultSettings = {
            barCount: 2,
            isLooping: false,
            timeSigUp: 8,
        };
        const mainBeatGroup = new Beat(defaultSettings);
        mainBeatGroup.addTrack({name: "LF"});
        mainBeatGroup.addTrack({name: "LH"});
        mainBeatGroup.addTrack({name: "RH"});
        mainBeatGroup.addTrack({name: "RF"});
        return mainBeatGroup;
    }

    setMainBeatGroup(beat: Beat): void {
        this.focusedBeat = beat;
        this.beatSettingsView.setBeat(this.focusedBeat);
        this.beatView.setBeat(this.focusedBeat);
        this.stageTitleBarView.setBeat(this.focusedBeat);
    }

    toggleSidebar(): void {
        this.sidebarActive = !this.sidebarActive;
        this.showHideSidebarButton.val!.title = this.sidebarText();
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
        this.beatView.setOrientation(orientation);
    }

    private sidebarText(): string {
        return `${this.sidebarActive ? "Hide" : "Show"} sidebar`;
    }


    private buildSidebarStrip(): HTMLElement {
        return h("div", {
            classes: ["root-sidebar-toggle"],
        }, [
            h("div", {
                classes: ["root-quick-access-button"],
                title: this.sidebarText(),
                saveTo: this.showHideSidebarButton,
                onclick: () => this.toggleSidebar(),
            }, [
                new IconView({
                    iconName: "list",
                    color: "var(--color-ui-neutral-dark)"
                })
            ]),
            h("div", {
                classes: ["root-quick-access-button"],
                title: "Change orientation",
                onclick: () => this.toggleOrientation(),
            }, [
                new IconView({
                    iconName: "arrowClockwise",
                    color: "var(--color-ui-neutral-dark)"
                }),
            ]),
            h("div", {
                classes: ["root-quick-access-button"],
                title: "Bake all tracks",
                onclick: () => this.focusedBeat.bakeLoops(),
            }, [
                new IconView({
                    iconName: "snowflake",
                    color: "var(--color-ui-neutral-dark)"
                }),
            ]),
            h("div", {
                classes: ["root-quick-access-button"],
                title: "Reset all",
                onclick: () => this.setMainBeatGroup(RootView.defaultMainBeatGroup()),
            }, [
                new IconView({
                    iconName: "trash",
                    color: "var(--color-ui-neutral-dark)"
                })
            ]),
        ]);
    }

    private buildSidebar(): HTMLElement {
        return (
            h("div", {classes: ["root-sidebar"]}, [
                h("div", {classes: ["root-settings"]}, [
                    h("h1", {classes: ["root-title"], innerText: this.title}),
                    this.beatSettingsView,
                ]),
                this.buildSidebarStrip(),
            ])
        );
    }

    build(): HTMLElement {
        return (
            h("div", {classes: ["root", "sidebar-visible"]}, [
                this.buildSidebar(),
                h("div", {classes: ["root-beat-stage-container"]}, [
                    this.stageTitleBarView,
                    h("div", {classes: ["root-beat-stage"]}, [
                        this.beatView,
                    ])
                ])
            ])
        );
    }
}